// API del Catálogo Visual (Cloudflare Pages Functions + D1).
import { BUILD_MARK, HttpError, all, clampInt, clientIp, fail, first, generateToken, json, readJson, safeJsonParse } from '../../lib/http.js';
import {
  clearRateLimit, clearSessionCookie, createSession, getSession, hashPassword, isWeakPassword,
  makeSessionCookie, rateLimit, readCookieSid, requireAdmin, requireAuth, verifyPassword
} from '../../lib/auth.js';
import { ensureSchema } from '../../lib/schema.js';
import { DEFAULT_UI_CONFIG, acquireLock, getCatalogMeta, releaseLock, mapRowsToProducts, normalizeMapping, queryProducts, sanitizeFacets, storeProducts } from '../../lib/catalog.js';
import { driveIdFrom, fetchSheetMeta, parseSheetId, proxyDriveVideo, readSheet } from '../../lib/sheets.js';
import { getSettings, publicSettings, saveSettings } from '../../lib/settings.js';

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const rawPath = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  const path = '/' + rawPath.replace(/^\/+|\/+$/g, '');
  const db = env.DB;

  try {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

    // Protección CSRF básica: las escrituras deben venir del mismo origen.
    if (!['GET', 'HEAD'].includes(request.method)) {
      const origin = request.headers.get('origin');
      if (origin && new URL(origin).host !== url.host) return fail(403, 'Origen no permitido');
    }

    await ensureSchema(db, env);

    for (const r of routes) {
      if (r.method !== request.method) continue;
      const match = typeof r.pattern === 'string' ? (r.pattern === path ? [] : null) : path.match(r.pattern);
      if (match) return await r.handler({ request, env, db, url, match, waitUntil: (p) => (context.waitUntil ? context.waitUntil(p) : p) });
    }
    return fail(404, 'No encontrado');
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.message);
    console.error('API error', path, err?.stack || err);
    return fail(500, 'Error interno. Intenta nuevamente.');
  }
}

// ---------- Helpers ----------

function normalizeBranch(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    type: row.type,
    slug: row.slug,
    warehouses: safeJsonParse(row.warehouses_json, []),
    canvas_width: Number(row.canvas_width || 900),
    canvas_height: Number(row.canvas_height || 620),
    active: !!row.active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getOwnedBranch(db, companyId, id) {
  const row = await first(db.prepare('SELECT * FROM branches WHERE id = ? AND company_id = ? AND active = 1').bind(id, companyId));
  return normalizeBranch(row);
}

async function ownedBranchOr404(db, session, id) {
  const branch = await getOwnedBranch(db, session.company_id, id);
  if (!branch) throw new HttpError(404, 'Sucursal no encontrada');
  return branch;
}

async function getPublicLink(db, token) {
  if (!/^[A-Za-z0-9]{10,64}$/.test(token)) return null;
  return first(db.prepare(`
    SELECT vl.branch_id, b.company_id, b.name AS branch_name
    FROM viewer_links vl JOIN branches b ON b.id = vl.branch_id
    WHERE vl.token = ? AND vl.active = 1 AND b.active = 1
  `).bind(token));
}

async function publicLinkOr404(db, token) {
  const link = await getPublicLink(db, decodeURIComponent(token));
  if (!link) throw new HttpError(404, 'Link no encontrado o inactivo');
  return link;
}

function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `sucursal-${Date.now()}`;
}

async function uniqueSlug(db, base, companyId, ignoreId = 0) {
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i < 500; i += 1) {
    const row = await first(db.prepare('SELECT id FROM branches WHERE company_id = ? AND slug = ? AND id <> ?').bind(companyId, candidate, ignoreId));
    if (!row) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${generateToken(5).toLowerCase()}`;
}

async function uniqueCompanyCode(db, base) {
  const cleaned = String(base || 'CAT').replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase() || 'CAT';
  for (;;) {
    const code = `${cleaned}-${generateToken(6).toUpperCase()}`;
    if (!(await first(db.prepare('SELECT id FROM companies WHERE code = ?').bind(code)))) return code;
  }
}

async function ensureBranchScaffolding(db, branchId, width = 900, height = 620) {
  await db.batch([
    db.prepare('INSERT INTO branch_layouts (branch_id, layout_json, viewbox_json) VALUES (?, ?, ?) ON CONFLICT(branch_id) DO NOTHING')
      .bind(branchId, JSON.stringify(defaultLayout()), JSON.stringify({ x: 0, y: 0, w: width, h: height })),
    db.prepare(`INSERT INTO branch_sheet_config (branch_id, sheet_id, sheet_name, source_type, sheet_map_json, imported_products_json, last_sheet_count, sheet_headers_json, sheet_header_index)
      VALUES (?, '', 'Productos', 'google_sheet', 'null', '[]', 0, '[]', 0) ON CONFLICT(branch_id) DO NOTHING`).bind(branchId)
  ]);
}

function defaultLayout() {
  return { zones: [], racks: [] };
}

function productQueryOptions(url) {
  const qp = (k) => url.searchParams.get(k) || '';
  const grouped = ['name', 'nombre'].includes(qp('group_by').trim().toLowerCase());
  return {
    q: qp('q').trim().slice(0, 200),
    page: clampInt(qp('page'), 1, 100000, 1),
    limit: clampInt(qp('limit'), 1, grouped ? 200 : 500, 48),
    grouped,
    filters: {
      brand: qp('brand'), category: qp('category'), zone: qp('zone'), warehouse: qp('warehouse'), rack: qp('rack'),
      image_state: qp('image_state'), location_state: qp('location_state'), stock_state: qp('stock_state'),
      size: qp('size'), color: qp('color'), audience: qp('audience')
    }
  };
}

async function productsResponse(db, branchId, url, isAdmin, cfg, sync = null) {
  const meta = await getCatalogMeta(db, branchId);
  if (sync) await maybeAutoSync(db, branchId, meta, sync);
  const opts = productQueryOptions(url);
  const result = await queryProducts(db, { branchId, ...opts, isAdmin, cfg });
  return json({
    ok: true,
    ...result,
    limit: opts.limit,
    facets: isAdmin ? meta.facets : sanitizeFacets(meta.facets, cfg),
    summary: meta.summary
  });
}

async function catalogIndexResponse(db, branchId) {
  const meta = await getCatalogMeta(db, branchId);
  return json({ ok: true, ...meta.index });
}

// ---------- Importación desde Google Sheet ----------

/** Lee el Sheet configurado, aplica el mapeo y reemplaza el catálogo. `overrides` viene del panel admin. */
async function importBranchFromSheet(db, branchId, overrides = {}, { lockHeld = false } = {}) {
  const merged = mergeSheetBody(await readSheetConfig(db, branchId), overrides);
  if (!parseSheetId(merged.sheet_id)) throw new HttpError(400, 'Coloca una URL de Google Sheet válida');
  const mapping = normalizeMapping(merged.sheet_map_rows);
  if (!Object.values(mapping).some(Boolean)) throw new HttpError(400, 'Primero lee los encabezados y mapea las columnas');
  const sheet = await readSheet(merged.sheet_id, merged.sheet_name || 'Productos', 50000);
  const stats = {};
  const products = mapRowsToProducts(sheet.headers, sheet.rows, mapping, stats, sheet.headerIndex + 2);
  await writeSheetConfig(db, branchId, { ...merged, sheet_headers: sheet.headers, sheet_header_index: sheet.headerIndex });
  const stored = await storeProducts(db, branchId, products, { lockHeld });
  const mapped = Object.fromEntries(['nombre', 'sku', 'barras'].map((k) => [k, mapping[k] || '']));
  return { imported: stored, total_rows: sheet.totalRows, source: sheet.source, headers: sheet.headers, stats, id_columns: mapped };
}

const SYNC_RETRY_MS = 30 * 60 * 1000;

/**
 * Sincronización automática sin cron: si el catálogo tiene más de `sync_hours` horas,
 * la consulta que lo detecta lanza la reimportación en segundo plano (no hace esperar al cliente).
 */
async function maybeAutoSync(db, branchId, meta, { companyId, waitUntil }) {
  const hours = Number((await getSettings(db, companyId)).business.sync_hours || 0);
  if (!hours || !waitUntil) return;
  const age = meta.importedAt ? Date.now() - Date.parse(meta.importedAt) : Infinity;
  if (age < hours * 3600000) return;
  const attemptKey = `sync_attempt:${branchId}`;
  const last = await first(db.prepare('SELECT value FROM system_meta WHERE key = ?').bind(attemptKey));
  if (last && Date.now() - Number(last.value) < SYNC_RETRY_MS) return;
  const cfg = await readSheetConfig(db, branchId);
  if (!parseSheetId(cfg.sheet_id)) return;
  await db.prepare(`INSERT INTO system_meta (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`).bind(attemptKey, String(Date.now())).run();
  waitUntil((async () => {
    if (!(await acquireLock(db, `import:${branchId}`))) return;
    try {
      const result = await importBranchFromSheet(db, branchId, {}, { lockHeld: true });
      console.log(`Sincronización automática sucursal ${branchId}: ${result.imported} productos`);
    } catch (err) {
      console.error(`Sincronización automática falló (sucursal ${branchId})`, err?.message || err);
    } finally {
      await releaseLock(db, `import:${branchId}`);
    }
  })());
}

// ---------- Sistema ----------

route('GET', '/healthz', async () => json({ ok: true, status: 'ok', runtime: 'cloudflare-pages', build: BUILD_MARK }));

route('GET', '/drive-video', async ({ request, db, url }) => {
  // Solo para sesiones válidas o visitantes de un link público activo (evita proxy abierto).
  const token = url.searchParams.get('t') || '';
  const allowed = (await getSession(request, db)) || (token && (await getPublicLink(db, token)));
  if (!allowed) return fail(401, 'No autorizado');
  const id = driveIdFrom(url.searchParams.get('id') || url.searchParams.get('source') || '');
  if (!id) return fail(400, 'ID de video de Google Drive inválido');
  const resourcekey = String(url.searchParams.get('resourcekey') || '').replace(/[^A-Za-z0-9_-]/g, '');
  return proxyDriveVideo(request, id, resourcekey);
});

// ---------- Autenticación ----------

async function companyPayload(db, companyId) {
  const company = await first(db.prepare('SELECT name, code FROM companies WHERE id = ?').bind(companyId));
  return { company_name: company?.name || 'Catálogo Visual', company_code: company?.code || '' };
}

route('GET', '/session', async ({ request, db }) => {
  const session = await getSession(request, db);
  if (!session) return fail(401, 'Sin sesión');
  return json({ ok: true, user: session.username, role: session.role, ...(await companyPayload(db, session.company_id)) });
});

route('POST', '/login', async ({ request, env, db }) => {
  const body = await readJson(request);
  const username = String(body.username || '').trim().slice(0, 80);
  const password = String(body.password || '').slice(0, 200);
  if (!username || !password) return fail(400, 'Completa usuario y contraseña');

  const ip = clientIp(request);
  const userKey = `login:${ip}:${username.toLowerCase()}`;
  await rateLimit(db, `login-ip:${ip}`, 40, 15 * 60000);
  await rateLimit(db, userKey, 8, 15 * 60000);

  const user = await first(db.prepare('SELECT * FROM users WHERE lower(username) = lower(?) AND active = 1').bind(username));
  const check = user ? await verifyPassword(user.password_hash, password) : { ok: false };
  if (!check.ok) return fail(401, 'Credenciales inválidas');

  await clearRateLimit(db, userKey);
  if (check.needsRehash) {
    await db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(await hashPassword(password, env), user.id).run();
  }
  const sid = await createSession(db, { user_id: user.id, username: user.username, role: user.role, company_id: user.company_id });
  return json({
    ok: true,
    user: user.username,
    role: user.role,
    weak_password: isWeakPassword(password),
    ...(await companyPayload(db, user.company_id))
  }, 200, [makeSessionCookie(sid)]);
});

route('POST', '/viewer-login', async ({ db }) => {
  // Acceso de solo lectura sin credenciales (se mantiene por diseño). Los datos se filtran
  // según la configuración del dueño, igual que el link público.
  const company = await first(db.prepare('SELECT id FROM companies ORDER BY id ASC LIMIT 1'));
  const companyId = Number(company?.id || 1);
  const sid = await createSession(db, { user_id: 0, username: 'viewer', role: 'viewer', company_id: companyId });
  return json({ ok: true, user: 'viewer', role: 'viewer', ...(await companyPayload(db, companyId)) }, 200, [makeSessionCookie(sid)]);
});

route('POST', '/register', async ({ request, env, db }) => {
  if (String(env.ALLOW_PUBLIC_REGISTER || 'true').toLowerCase() === 'false') return fail(403, 'El registro público está desactivado');
  await rateLimit(db, `register:${clientIp(request)}`, 5, 60 * 60000);

  const body = await readJson(request);
  const mode = String(body.mode || 'admin').toLowerCase() === 'viewer' ? 'viewer' : 'admin';
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const companyName = String(body.companyName || '').trim().slice(0, 80) || 'Nueva empresa';
  const companyCode = String(body.companyCode || '').trim().toUpperCase();

  if (!/^[A-Za-z0-9._@-]{3,60}$/.test(username)) return fail(400, 'Usuario inválido: 3 a 60 caracteres, sin espacios');
  if (password.length < 8) return fail(400, 'La contraseña debe tener al menos 8 caracteres');
  if (await first(db.prepare('SELECT id FROM users WHERE lower(username) = lower(?)').bind(username))) return fail(400, 'Ese usuario ya existe');

  let companyId;
  if (mode === 'viewer') {
    const company = await first(db.prepare('SELECT id FROM companies WHERE code = ?').bind(companyCode));
    if (!company) return fail(400, 'Código de empresa inválido');
    companyId = Number(company.id);
  } else {
    const code = await uniqueCompanyCode(db, companyName);
    const info = await db.prepare('INSERT INTO companies (name, code) VALUES (?, ?)').bind(companyName, code).run();
    companyId = Number(info.meta.last_row_id);
    const branch = await db.prepare(`INSERT INTO branches (company_id, name, type, slug, warehouses_json) VALUES (?, 'Sucursal principal', 'tienda', 'sucursal-principal', ?)`)
      .bind(companyId, JSON.stringify(['Almacén principal'])).run();
    await ensureBranchScaffolding(db, Number(branch.meta.last_row_id));
  }

  const hash = await hashPassword(password, env);
  const userInfo = await db.prepare('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)').bind(companyId, username, hash, mode).run();
  const sid = await createSession(db, { user_id: Number(userInfo.meta.last_row_id), username, role: mode, company_id: companyId });
  return json({
    ok: true, user: username, role: mode,
    message: mode === 'viewer' ? 'Cuenta visualizadora creada.' : 'Cuenta administradora creada.',
    ...(await companyPayload(db, companyId))
  }, 200, [makeSessionCookie(sid)]);
});

route('POST', '/logout', async ({ request, db }) => {
  const sid = readCookieSid(request);
  if (sid) await db.prepare('DELETE FROM sessions_store WHERE sid = ?').bind(sid).run();
  return json({ ok: true }, 200, [clearSessionCookie()]);
});

route('POST', '/password', async ({ request, env, db }) => {
  const session = await requireAuth(request, db);
  if (session.error) return session.error;
  if (!session.user_id) return fail(400, 'El acceso de visualizador no tiene contraseña');
  const body = await readJson(request);
  const current = String(body.current || '');
  const next = String(body.next || '');
  if (isWeakPassword(next)) return fail(400, 'La nueva contraseña debe tener al menos 8 caracteres y no ser una contraseña común');
  await rateLimit(db, `password:${session.user_id}`, 10, 15 * 60000);
  const user = await first(db.prepare('SELECT id, password_hash FROM users WHERE id = ?').bind(session.user_id));
  if (!user || !(await verifyPassword(user.password_hash, current)).ok) return fail(400, 'La contraseña actual no es correcta');
  await db.batch([
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(await hashPassword(next, env), user.id),
    // Cierra las demás sesiones de ese usuario.
    db.prepare("DELETE FROM sessions_store WHERE sid <> ? AND json_extract(sess_json, '$.user_id') = ?").bind(session.sid, user.id)
  ]);
  return json({ ok: true });
});

// ---------- Configuración del dueño ----------

route('GET', '/settings', async ({ request, db }) => {
  const session = await requireAuth(request, db);
  if (session.error) return session.error;
  const settings = await getSettings(db, session.company_id);
  return json({ ok: true, ...(session.role === 'admin' ? settings : publicSettings(settings)) });
});

route('PUT', '/settings', async ({ request, db }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  return json({ ok: true, ...(await saveSettings(db, session.company_id, await readJson(request))) });
});

// Estado libre del panel (compatibilidad con versiones anteriores).
route('GET', '/app-state', async ({ request, db }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const row = await first(db.prepare('SELECT admin_json, rack_models_json, branch_layouts_json, updated_at FROM app_state_blobs WHERE company_id = ?').bind(session.company_id));
  return json({
    ok: true,
    state: {
      admin: safeJsonParse(row?.admin_json, null),
      models: safeJsonParse(row?.rack_models_json, null),
      branchLayouts: safeJsonParse(row?.branch_layouts_json, null),
      updated_at: row?.updated_at || null
    }
  });
});

route('POST', '/app-state', async ({ request, db }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const body = await readJson(request);
  const admin = body.admin && typeof body.admin === 'object' ? body.admin : null;
  const payload = [JSON.stringify(admin), JSON.stringify(Array.isArray(body.models) ? body.models : null), JSON.stringify(body.branchLayouts && typeof body.branchLayouts === 'object' ? body.branchLayouts : null)];
  if (payload.join('').length > 1500000) return fail(413, 'Estado demasiado grande');
  await db.prepare(`
    INSERT INTO app_state_blobs (company_id, admin_json, rack_models_json, branch_layouts_json, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(company_id) DO UPDATE SET admin_json = excluded.admin_json, rack_models_json = excluded.rack_models_json,
      branch_layouts_json = excluded.branch_layouts_json, updated_at = CURRENT_TIMESTAMP
  `).bind(session.company_id, ...payload).run();
  const name = String(admin?.company || '').trim().slice(0, 80);
  if (name) await db.prepare('UPDATE companies SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(name, session.company_id).run();
  return json({ ok: true });
});

// ---------- Sucursales ----------

route('GET', '/branches', async ({ request, db }) => {
  const session = await requireAuth(request, db);
  if (session.error) return session.error;
  const rows = await all(db.prepare('SELECT * FROM branches WHERE active = 1 AND company_id = ? ORDER BY id ASC').bind(session.company_id));
  return json({ ok: true, branches: rows.map(normalizeBranch) });
});

route('POST', '/branches', async ({ request, db }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const body = await readJson(request);
  const name = String(body.name || '').trim().slice(0, 80);
  if (!name) return fail(400, 'El nombre es obligatorio');
  const type = String(body.type || 'tienda').trim().slice(0, 40) || 'tienda';
  const warehouses = (Array.isArray(body.warehouses) ? body.warehouses : ['Almacén principal']).map((w) => String(w).trim().slice(0, 60)).filter(Boolean).slice(0, 50);
  const width = clampInt(body.canvas_width, 100, 10000, 900);
  const height = clampInt(body.canvas_height, 100, 10000, 620);
  const slug = await uniqueSlug(db, body.slug || name, session.company_id);
  const info = await db.prepare('INSERT INTO branches (company_id, name, type, slug, warehouses_json, canvas_width, canvas_height) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(session.company_id, name, type, slug, JSON.stringify(warehouses), width, height).run();
  const branchId = Number(info.meta.last_row_id);
  await ensureBranchScaffolding(db, branchId, width, height);
  return json({ ok: true, branch: await getOwnedBranch(db, session.company_id, branchId) });
});

route('PUT', /^\/branches\/(\d+)$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branchId = Number(match[1]);
  const existing = await ownedBranchOr404(db, session, branchId);
  const body = await readJson(request);
  const name = String(body.name || existing.name).trim().slice(0, 80);
  const type = String(body.type || existing.type).trim().slice(0, 40) || existing.type;
  const slug = await uniqueSlug(db, body.slug || existing.slug, session.company_id, branchId);
  const warehouses = Array.isArray(body.warehouses) ? body.warehouses.map((w) => String(w).trim().slice(0, 60)).filter(Boolean).slice(0, 50) : existing.warehouses;
  await db.prepare(`UPDATE branches SET name = ?, type = ?, slug = ?, warehouses_json = ?, canvas_width = ?, canvas_height = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?`)
    .bind(name, type, slug, JSON.stringify(warehouses), clampInt(body.canvas_width, 100, 10000, existing.canvas_width), clampInt(body.canvas_height, 100, 10000, existing.canvas_height), branchId, session.company_id).run();
  return json({ ok: true, branch: await getOwnedBranch(db, session.company_id, branchId) });
});

route('DELETE', /^\/branches\/(\d+)$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branchId = Number(match[1]);
  await ownedBranchOr404(db, session, branchId);
  const total = await first(db.prepare('SELECT COUNT(*) AS total FROM branches WHERE active = 1 AND company_id = ?').bind(session.company_id));
  if (Number(total?.total || 0) <= 1) return fail(400, 'Debe quedar al menos una sucursal');
  // Borrado en cascada y desactivación de los links públicos de la sucursal.
  await db.batch([
    db.prepare('UPDATE viewer_links SET active = 0 WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM catalog_products WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM catalog_products_staging WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM catalog_meta WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM branch_products WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM branch_sheet_config WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM branch_layouts WHERE branch_id = ?').bind(branchId),
    db.prepare('DELETE FROM branches WHERE id = ? AND company_id = ?').bind(branchId, session.company_id)
  ]);
  return json({ ok: true });
});

route('GET', /^\/branches\/(\d+)\/layout$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  await ensureBranchScaffolding(db, branch.id, branch.canvas_width, branch.canvas_height);
  const row = await first(db.prepare('SELECT layout_json, viewbox_json, updated_at FROM branch_layouts WHERE branch_id = ?').bind(branch.id));
  return json({
    ok: true,
    layout: {
      layout: safeJsonParse(row?.layout_json, defaultLayout()),
      viewBox: safeJsonParse(row?.viewbox_json, { x: 0, y: 0, w: branch.canvas_width, h: branch.canvas_height }),
      updated_at: row?.updated_at || null
    }
  });
});

route('POST', /^\/branches\/(\d+)\/layout$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  const payload = await readJson(request);
  const layout = payload.layout && typeof payload.layout === 'object' ? payload.layout : defaultLayout();
  const viewBox = payload.viewBox && typeof payload.viewBox === 'object' ? payload.viewBox : { x: 0, y: 0, w: branch.canvas_width, h: branch.canvas_height };
  await ensureBranchScaffolding(db, branch.id, branch.canvas_width, branch.canvas_height);
  await db.prepare('UPDATE branch_layouts SET layout_json = ?, viewbox_json = ?, updated_at = CURRENT_TIMESTAMP WHERE branch_id = ?')
    .bind(JSON.stringify(layout), JSON.stringify(viewBox), branch.id).run();
  return json({ ok: true });
});

// ---------- Google Sheet ----------

async function readSheetConfig(db, branchId) {
  return (await first(db.prepare(`
    SELECT sheet_id, sheet_name, source_type, sheet_map_json, last_sheet_count, sheet_headers_json, sheet_header_index, updated_at
    FROM branch_sheet_config WHERE branch_id = ?
  `).bind(branchId))) || {};
}

async function writeSheetConfig(db, branchId, cfg) {
  await db.prepare(`
    UPDATE branch_sheet_config
    SET sheet_id = ?, sheet_name = ?, source_type = ?, sheet_map_json = ?, sheet_headers_json = ?, sheet_header_index = ?, updated_at = CURRENT_TIMESTAMP
    WHERE branch_id = ?
  `).bind(
    String(cfg.sheet_id || '').slice(0, 500),
    String(cfg.sheet_name || 'Productos').slice(0, 120),
    'google_sheet',
    JSON.stringify(normalizeMapping(cfg.sheet_map_rows)),
    JSON.stringify((Array.isArray(cfg.sheet_headers) ? cfg.sheet_headers : []).map(String).slice(0, 300)),
    Number(cfg.sheet_header_index || 0),
    branchId
  ).run();
}

function mergeSheetBody(current, body) {
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);
  return {
    sheet_id: has('sheet_id') ? body.sheet_id : current.sheet_id,
    sheet_name: has('sheet_name') ? body.sheet_name : current.sheet_name,
    sheet_map_rows: has('sheet_map_rows') ? body.sheet_map_rows : safeJsonParse(current.sheet_map_json, {}),
    sheet_headers: has('sheet_headers') ? body.sheet_headers : safeJsonParse(current.sheet_headers_json, []),
    sheet_header_index: has('sheet_header_index') ? body.sheet_header_index : current.sheet_header_index
  };
}

route('GET', /^\/branches\/(\d+)\/sheet$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  await ensureBranchScaffolding(db, branch.id, branch.canvas_width, branch.canvas_height);
  const cfg = await readSheetConfig(db, branch.id);
  const meta = await getCatalogMeta(db, branch.id);
  return json({
    ok: true,
    config: {
      sheet_id: cfg.sheet_id || '',
      sheet_name: cfg.sheet_name || 'Productos',
      source_type: cfg.source_type || 'google_sheet',
      updated_at: cfg.updated_at || null,
      sheet_map_rows: safeJsonParse(cfg.sheet_map_json, {}),
      sheet_headers: safeJsonParse(cfg.sheet_headers_json, []),
      sheet_header_index: Number(cfg.sheet_header_index || 0),
      last_sheet_count: meta.count,
      last_import_at: meta.importedAt
    }
  });
});

// Guarda configuración; si llega `imported_products` (flujo antiguo), también reemplaza el catálogo.
route('POST', /^\/branches\/(\d+)\/(sheet|sheet-metadata)$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  await ensureBranchScaffolding(db, branch.id, branch.canvas_width, branch.canvas_height);
  const body = await readJson(request);
  await writeSheetConfig(db, branch.id, mergeSheetBody(await readSheetConfig(db, branch.id), body));
  let stored = null;
  if (match[2] === 'sheet' && Array.isArray(body.imported_products)) stored = await storeProducts(db, branch.id, body.imported_products);
  return json({ ok: true, stored_products: stored ?? (await getCatalogMeta(db, branch.id)).count });
});

// Importación hecha por el servidor: lee el Sheet, aplica el mapeo y reemplaza el catálogo de forma atómica.
route('POST', /^\/branches\/(\d+)\/import$/, async ({ request, db, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  await ensureBranchScaffolding(db, branch.id, branch.canvas_width, branch.canvas_height);
  const result = await importBranchFromSheet(db, branch.id, await readJson(request));
  return json({ ok: true, ...result });
});

route('GET', '/sheets/meta', async ({ request, db, url }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const id = parseSheetId(url.searchParams.get('url'));
  if (!id) return fail(400, 'URL/ID inválido');
  return json({ ok: true, ...(await fetchSheetMeta(id)) });
});

route('GET', '/sheets/probe', async ({ request, db, url }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const sheet = await readSheet(url.searchParams.get('url'), url.searchParams.get('sheet'), 0);
  return json({ ok: true, headers: sheet.headers, headerIndex: sheet.headerIndex, previewCount: sheet.totalRows, source: sheet.source });
});

route('GET', '/sheets/rows', async ({ request, db, url }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const headerOnly = url.searchParams.get('headerOnly') === '1';
  const sheet = await readSheet(url.searchParams.get('url'), url.searchParams.get('sheet'), headerOnly ? 0 : clampInt(url.searchParams.get('limit'), 1, 50000, 50000));
  return json({ ok: true, headers: sheet.headers, rows: headerOnly ? undefined : sheet.rows, headerIndex: sheet.headerIndex, totalRows: sheet.totalRows, previewCount: sheet.totalRows, source: sheet.source });
});

// ---------- Productos (sesión) ----------

route('GET', /^\/branches\/(\d+)\/products$/, async ({ request, db, url, match, waitUntil }) => {
  const session = await requireAuth(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  const isAdmin = session.role === 'admin';
  const cfg = isAdmin ? DEFAULT_UI_CONFIG : (await getSettings(db, session.company_id)).ui_config;
  return productsResponse(db, branch.id, url, isAdmin, cfg, { companyId: session.company_id, waitUntil });
});

route('GET', /^\/branches\/(\d+)\/products-summary$/, async ({ request, db, match }) => {
  const session = await requireAuth(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  const meta = await getCatalogMeta(db, branch.id);
  const cfg = (await getSettings(db, session.company_id)).ui_config;
  return json({ ok: true, summary: meta.summary, facets: session.role === 'admin' ? meta.facets : sanitizeFacets(meta.facets, cfg) });
});

route('GET', /^\/branches\/(\d+)\/catalog-index$/, async ({ request, db, match }) => {
  const session = await requireAuth(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  return catalogIndexResponse(db, branch.id);
});

route('POST', /^\/branches\/(\d+)\/view-link$/, async ({ request, db, url, match }) => {
  const session = await requireAdmin(request, db);
  if (session.error) return session.error;
  const branch = await ownedBranchOr404(db, session, Number(match[1]));
  const body = await readJson(request);
  let existing = null;
  if (body.rotate) {
    await db.prepare('UPDATE viewer_links SET active = 0 WHERE branch_id = ?').bind(branch.id).run();
  } else {
    existing = await first(db.prepare('SELECT token FROM viewer_links WHERE branch_id = ? AND active = 1 ORDER BY id DESC LIMIT 1').bind(branch.id));
  }
  if (!existing) {
    existing = { token: generateToken(24) };
    await db.prepare('INSERT INTO viewer_links (branch_id, token, active) VALUES (?, ?, 1)').bind(branch.id, existing.token).run();
  }
  return json({ ok: true, token: existing.token, url: `${url.protocol}//${url.host}/viewer/${existing.token}`, rotated: !!body.rotate });
});

// ---------- Link público ----------

route('GET', /^\/view-links\/([^/]+)$/, async ({ db, match }) => {
  const link = await publicLinkOr404(db, match[1]);
  const meta = await getCatalogMeta(db, link.branch_id);
  const settings = await getSettings(db, link.company_id);
  return json({
    ok: true,
    branch: { id: Number(link.branch_id), name: link.branch_name },
    settings: publicSettings(settings),
    sheet: {
      product_count: meta.count,
      facets: sanitizeFacets(meta.facets, settings.ui_config),
      summary: meta.summary
    }
  });
});

route('GET', /^\/view-links\/([^/]+)\/products$/, async ({ db, url, match, waitUntil }) => {
  const link = await publicLinkOr404(db, match[1]);
  const cfg = (await getSettings(db, link.company_id)).ui_config;
  return productsResponse(db, link.branch_id, url, false, cfg, { companyId: link.company_id, waitUntil });
});

route('GET', /^\/view-links\/([^/]+)\/catalog-index$/, async ({ db, match }) => {
  const link = await publicLinkOr404(db, match[1]);
  return catalogIndexResponse(db, link.branch_id);
});
