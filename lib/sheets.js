// Lectura de Google Sheets públicos (CSV / gviz) y proxy de videos de Drive.
import { HttpError, safeJsonParse } from './http.js';

export function parseSheetId(input) {
  const value = String(input || '').trim();
  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return /^[a-zA-Z0-9-_]{20,}$/.test(value) ? value : '';
}

function hasVisibleValue(value) {
  return String(value == null ? '' : value).trim() !== '';
}

function dedupeHeaders(row) {
  const seen = new Map();
  return (row || []).map((v, i) => {
    const base = String(v || '').trim() || `Columna ${i + 1}`;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const src = String(text || '');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i += 1; continue; }
      if (ch === '"') { inQuotes = false; continue; }
      cell += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(cell); cell = ''; continue; }
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    if (ch === '\r') continue;
    cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function decodeUnicodeEscapes(str) {
  return String(str || '')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\"/g, '"');
}

export async function fetchSheetMeta(id) {
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${id}/edit`);
    if (!res.ok) return { sheets: [] };
    const html = await res.text();
    const sheets = [];
    const re = /"sheetId":(\d+),"title":"([^"]+)"/g;
    let match;
    while ((match = re.exec(html))) sheets.push({ gid: match[1], title: decodeUnicodeEscapes(match[2]) });
    return { sheets };
  } catch (_err) {
    return { sheets: [] };
  }
}

async function resolveSheetGid(id, sheetName) {
  const meta = await fetchSheetMeta(id);
  const hit = meta.sheets.find((s) => s.title.trim().toLowerCase() === String(sheetName || '').trim().toLowerCase());
  return hit ? String(hit.gid) : '';
}

function trimColumns(headerRow, dataRows) {
  const maxLen = Math.max(headerRow.length, ...dataRows.slice(0, 500).map((r) => r.length), 0);
  let last = 0;
  for (let i = 0; i < maxLen; i += 1) {
    if (hasVisibleValue(headerRow[i]) || dataRows.slice(0, 200).some((r) => hasVisibleValue(r[i]))) last = i;
  }
  return {
    headers: dedupeHeaders(headerRow.slice(0, last + 1)),
    rows: dataRows.map((r) => r.slice(0, last + 1))
  };
}

async function readCsv(id, sheet, gid) {
  const urls = [];
  if (gid) urls.push(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${encodeURIComponent(gid)}`);
  urls.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`);
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const type = res.headers.get('content-type') || '';
      if (type.includes('text/html')) continue; // hoja privada → página de login
      const parsed = parseCsv(await res.text())
        .map((r) => r.map((v) => String(v || '').trim()))
        .filter((r) => r.some(hasVisibleValue));
      if (!parsed.length) continue;
      let headerIndex = 0;
      if (parsed[0].filter(hasVisibleValue).length <= 1 && parsed[1]?.filter(hasVisibleValue).length >= 2) headerIndex = 1;
      const { headers, rows } = trimColumns(parsed[headerIndex], parsed.slice(headerIndex + 1));
      return { headers, rows, headerIndex, source: url.includes('gid=') ? 'csv-gid' : 'csv-sheet' };
    } catch (_err) { /* siguiente URL */ }
  }
  return null;
}

async function readGviz(id, sheet, gid) {
  const url = gid
    ? `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&gid=${encodeURIComponent(gid)}&headers=1`
    : `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}&headers=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const m = (await res.text()).match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/s);
    const table = safeJsonParse(m?.[1], null)?.table;
    if (!table) return null;
    const headerRow = (table.cols || []).map((c, i) => String(c?.label || c?.id || '').trim() || `Columna ${i + 1}`);
    const dataRows = (table.rows || [])
      .map((row) => (row.c || []).map((c) => String(c && c.v != null ? c.v : '').trim()))
      .filter((r) => r.some(hasVisibleValue));
    const { headers, rows } = trimColumns(headerRow, dataRows);
    return { headers, rows, headerIndex: 0, source: 'gviz-json' };
  } catch (_err) {
    return null;
  }
}

/** Lee la hoja completa: CSV primero (más fiel), gviz como respaldo. */
export async function readSheet(sheetUrl, sheetName, limit = 50000) {
  const id = parseSheetId(sheetUrl);
  const sheet = String(sheetName || '').trim();
  if (!id || !sheet) throw new HttpError(400, 'URL/ID del Sheet y nombre de hoja son obligatorios');
  const gid = await resolveSheetGid(id, sheet);
  const payload = (await readCsv(id, sheet, gid)) || (await readGviz(id, sheet, gid));
  if (!payload || !payload.headers.length) {
    throw new HttpError(422, 'No se pudo leer la hoja. Verifica que el Sheet sea público (“Cualquier usuario con el enlace → Lector”) y el nombre de la hoja.');
  }
  return { ...payload, id, totalRows: payload.rows.length, rows: payload.rows.slice(0, limit) };
}

// ---------- Proxy de video de Google Drive ----------

export function driveIdFrom(value) {
  const text = String(value || '').trim();
  if (/^[A-Za-z0-9_-]{10,}$/.test(text)) return text;
  try {
    const u = new URL(text);
    if (!/(^|\.)google\.com$/.test(u.hostname)) return '';
    const parts = u.pathname.split('/').filter(Boolean);
    const d = parts.indexOf('d');
    const id = d >= 0 ? parts[d + 1] : (u.searchParams.get('id') || '');
    return /^[A-Za-z0-9_-]{10,}$/.test(id || '') ? id : '';
  } catch (_err) {
    return '';
  }
}

export async function proxyDriveVideo(request, id, resourcekey = '') {
  const upstreamUrl = new URL('https://drive.google.com/uc');
  upstreamUrl.searchParams.set('export', 'download');
  upstreamUrl.searchParams.set('id', id);
  if (resourcekey) upstreamUrl.searchParams.set('resourcekey', resourcekey);

  const fetchHeaders = new Headers({ 'user-agent': 'Mozilla/5.0 Catalogo-Drive-Proxy' });
  const range = request.headers.get('range');
  if (range) fetchHeaders.set('range', range);

  let upstream = await fetch(upstreamUrl.toString(), { headers: fetchHeaders, redirect: 'follow' });

  // Archivos grandes: Drive devuelve una página de confirmación con un formulario.
  if ((upstream.headers.get('content-type') || '').includes('text/html')) {
    const html = await upstream.text();
    const action = html.match(/<form[^>]+action="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
    if (!action) {
      return new Response('Google Drive no entregó el archivo como video público. Verifica que esté en “Cualquier usuario con el vínculo → Lector”.', {
        status: 403,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
    const next = new URL(action, 'https://drive.google.com');
    if (!/(^|\.)google(usercontent)?\.com$/.test(next.hostname)) return new Response('Destino no permitido', { status: 400 });
    for (const m of html.matchAll(/<input[^>]+name="([^"]+)"[^>]+value="([^"]*)"/g)) next.searchParams.set(m[1], m[2]);
    upstream = await fetch(next.toString(), { headers: fetchHeaders, redirect: 'follow' });
  }

  const headers = new Headers();
  for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  if (!headers.has('content-type') || headers.get('content-type').includes('html')) headers.set('content-type', 'video/mp4');
  headers.set('cache-control', 'private, max-age=3600');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}
