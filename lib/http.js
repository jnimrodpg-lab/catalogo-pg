// Utilidades HTTP compartidas por la API.

export const BUILD_MARK = 'catalogo-v73-import-report';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200, cookies = []) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  return new Response(JSON.stringify({ build: BUILD_MARK, ...data }), { status, headers });
}

export function fail(status, error) {
  return json({ ok: false, error }, status);
}

export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch (_err) {
    return {};
  }
}

export function readCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() === name) {
      try { return decodeURIComponent(part.slice(idx + 1).trim()); } catch (_err) { return ''; }
    }
  }
  return '';
}

export function clientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown';
}

export function safeJsonParse(value, fallback) {
  try {
    return value == null || value === '' ? fallback : JSON.parse(value);
  } catch (_err) {
    return fallback;
  }
}

export function generateToken(size = 24) {
  // Muestreo sin sesgo de módulo: 62 símbolos, se descartan bytes >= 248.
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  while (out.length < size) {
    const bytes = crypto.getRandomValues(new Uint8Array(size * 2));
    for (const b of bytes) {
      if (b >= 248) continue;
      out += chars[b % 62];
      if (out.length === size) break;
    }
  }
  return out;
}

export async function first(stmt) {
  return (await stmt.first()) || null;
}

export async function all(stmt) {
  const out = await stmt.all();
  return Array.isArray(out?.results) ? out.results : [];
}

export function clampInt(value, min, max, fallback) {
  if (value === null || value === undefined || String(value).trim() === '') return fallback;
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
