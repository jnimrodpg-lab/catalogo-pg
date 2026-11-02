// Catálogo: normalización, importación atómica y consultas SQL paginadas.
import { HttpError, all, first, generateToken, safeJsonParse } from './http.js';

// Sube este número cuando cambie cómo se indexa: los catálogos se reindexan solos al consultarse.
export const INDEX_VERSION = 2;
const FIELD_SET = new Set(FIELD_KEYS_LIST());
function FIELD_KEYS_LIST() { return ['sku', 'nombre', 'variante', 'marca', 'categoria', 'genero', 'estado', 'grosor', 'talla', 'color', 'linea', 'barras', 'ubicacion', 'zona', 'estante', 'nivel', 'slot', 'almacen', 'precio', 'stock', 'imagen', 'video']; }

export const FIELD_KEYS = FIELD_KEYS_LIST();

const K = {
  sku: ['sku', 'Sku', 'SKU'],
  nombre: ['nombre', 'Nombre', 'name', 'producto'],
  variante: ['variante', 'Variante', 'variant', 'modelo'],
  barras: ['barras', 'Barras', 'barcode', 'codigoBarras'],
  marca: ['marca', 'brand'],
  categoria: ['categoria', 'categoría', 'category'],
  genero: ['genero', 'género'],
  almacen: ['almacen', 'almacén', 'warehouse'],
  ubicacion: ['ubicacion', 'ubicación', 'location'],
  zona: ['zona', 'zone', 'zonaStore'],
  rack: ['rack', 'estante', 'rackStore', 'estanteStore'],
  nivel: ['nivel', 'level', 'nivelStore'],
  slot: ['slot', 'slotStore'],
  talla: ['talla', 'Talla', 'size'],
  color: ['color', 'Color'],
  linea: ['linea', 'línea'],
  imagen: ['imagen', 'image', 'foto', 'imagen2', 'image2', 'foto2'],
  video: ['video', 'link_video', 'url_video'],
  stock: ['stock', 'cantidad', 'cant', 'Cant. Restock', 'cantRestock', 'cantidadRestock'],
  precio: ['precio', 'price']
};

// Campos que el cliente solo ve si el dueño los habilita.
const PRIVATE_FIELDS = {
  ubicacion: ['ubicacion', 'ubicación', 'location', 'zona', 'zone', 'zonaStore', 'estante', 'rack', 'rackStore', 'estanteStore', 'nivel', 'nivelStore', 'slot', 'slotStore'],
  almacen: ['almacen', 'almacén', 'warehouse'],
  stock: ['stock', 'cantidad', 'cant', 'Cant. Restock', 'cantRestock', 'cantidadRestock'],
  precio: ['precio', 'price'],
  sku: ['sku', 'Sku', 'SKU', 'barras', 'Barras', 'barcode', 'codigoBarras']
};

export const DEFAULT_UI_CONFIG = {
  sku: true, marca: true, categoria: true, talla: true, color: true,
  ubicacion: false, almacen: false, stock: false, precio: false, request: true
};

export function norm(value) {
  return String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function pv(product, keys) {
  for (const key of keys) {
    const value = product && product[key];
    if (value != null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

const get = (p, k) => pv(p, K[k]);

function hasStock(product) {
  const raw = get(product, 'stock');
  if (!raw) return false;
  const n = Number(String(raw).replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n > 0 : true;
}

function hasLocation(product) {
  return !!(get(product, 'ubicacion') || get(product, 'almacen') || get(product, 'zona') || get(product, 'rack'));
}

function mediaOf(product) {
  return get(product, 'imagen') || get(product, 'video');
}

export function inferAudience(product) {
  const hay = norm([get(product, 'genero'), get(product, 'categoria'), get(product, 'nombre'), get(product, 'variante')].filter(Boolean).join(' '));
  if (!hay) return 'all';
  if (/(nina|girl|junior mujer)/.test(hay)) return 'nina';
  if (/(nino|boy|junior varon)/.test(hay)) return 'nino';
  if (/(mujer|dama|femen|lady|women)/.test(hay)) return 'mujer';
  if (/(varon|hombre|caballero|mascul|men)/.test(hay)) return 'varon';
  if (/(bebe|baby|infant)/.test(hay)) return 'bebe';
  if (/unisex/.test(hay)) return 'unisex';
  return 'all';
}

export function displayName(product) {
  const sku = get(product, 'sku') || get(product, 'barras');
  return get(product, 'nombre')
    || [get(product, 'marca'), get(product, 'variante') || (sku ? `SKU ${sku}` : '')].filter(Boolean).join(' · ')
    || 'Producto sin nombre';
}

export function groupKeyOf(product) {
  const base = get(product, 'nombre') || get(product, 'sku') || get(product, 'barras') || 'Sin nombre';
  return `${norm(base)}¦${norm(get(product, 'marca'))}`;
}

/** Texto de búsqueda para clientes: sin ubicación ni almacén. */
function searchPublic(product) {
  return norm([
    get(product, 'sku'), get(product, 'nombre'), get(product, 'variante'), get(product, 'barras'),
    get(product, 'talla'), get(product, 'color'), get(product, 'marca'), get(product, 'categoria'), get(product, 'linea')
  ].join(' '));
}

function searchText(product) {
  return norm([
    get(product, 'sku'), get(product, 'nombre'), get(product, 'variante'), get(product, 'barras'),
    get(product, 'ubicacion'), get(product, 'almacen'), get(product, 'zona'), get(product, 'rack'),
    get(product, 'nivel'), get(product, 'slot'), get(product, 'talla'), get(product, 'color'),
    get(product, 'marca'), get(product, 'categoria'), get(product, 'linea')
  ].join(' '));
}

/** Producto limpio: solo strings, sin la copia `raw` de la fila. */
function cleanProduct(product, index) {
  const out = {};
  for (const [key, value] of Object.entries(product || {})) {
    if (key === 'raw' || key.startsWith('_')) continue;
    if (value == null || typeof value === 'object') continue;
    const text = String(value).trim();
    if (!text) continue;
    // "Color" en el campo color, "Talla" en talla…: marcador del Sheet, no un dato.
    if (FIELD_SET.has(key) && norm(text) === norm(key)) continue;
    out[key] = text.slice(0, 2000);
  }
  if (!out.id) out.id = `sheet-${index + 1}`;
  return out;
}

function indexRow(product, index) {
  const g = groupKeyOf(product);
  return {
    r: index,
    g,
    // Los productos sin nombre van al final del listado ('~' ordena después de letras y números).
    s: get(product, 'nombre') ? norm(get(product, 'nombre')) : `~${g}`,
    p: JSON.stringify(product),
    t: searchText(product),
    tp: searchPublic(product),
    mb: norm(get(product, 'marca')),
    ct: norm(get(product, 'categoria')),
    al: norm(get(product, 'almacen')),
    zn: norm(get(product, 'zona')),
    rk: norm(get(product, 'rack')),
    tl: norm(get(product, 'talla')),
    cl: norm(get(product, 'color')),
    au: inferAudience(product),
    md: mediaOf(product),
    hi: mediaOf(product) ? 1 : 0,
    hl: hasLocation(product) ? 1 : 0,
    hs: hasStock(product) ? 1 : 0
  };
}

// ---------- Metadatos precalculados (facets, resumen, índice de categorías) ----------

function uniqueSorted(products, keys) {
  const seen = new Map();
  for (const p of products) {
    const v = pv(p, keys);
    if (v && !seen.has(norm(v))) seen.set(norm(v), v);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }));
}

function buildMeta(products, rows) {
  const brands = uniqueSorted(products, K.marca);
  const categories = uniqueSorted(products, K.categoria);
  const facets = {
    brands, brand_options: brands,
    categories, category_options: categories,
    warehouses: uniqueSorted(products, K.almacen),
    zones: uniqueSorted(products, K.zona),
    racks: uniqueSorted(products, K.rack)
  };
  facets.warehouse_options = facets.warehouses;
  facets.zone_options = facets.zones;
  facets.rack_options = facets.racks;

  const summary = {
    total: rows.length,
    with_location: rows.filter((r) => r.hl).length,
    with_image: rows.filter((r) => r.hi).length,
    with_stock: rows.filter((r) => r.hs).length
  };

  // Índice para el explorador de categorías: una entrada por (categoría, público).
  const catMap = new Map();
  const tuples = new Map();
  rows.forEach((row, i) => {
    const p = products[i];
    const label = get(p, 'categoria');
    for (const audience of ['all', row.au]) {
      const key = `${row.ct}|${audience}`;
      if (!catMap.has(key)) catMap.set(key, { category: label, audience, families: new Set(), media: '' });
      const entry = catMap.get(key);
      entry.families.add(row.g);
      if (!entry.media && row.md) entry.media = row.md;
      if (audience === row.au) break; // row.au === 'all' → una sola vez
    }
    if (tuples.size < 20000) {
      const tk = `${row.au}|${row.mb}|${row.tl}|${row.cl}`;
      if (!tuples.has(tk)) tuples.set(tk, { a: row.au, m: get(p, 'marca'), t: get(p, 'talla'), c: get(p, 'color') });
    }
  });
  const index = {
    categories: [...catMap.values()].map((e) => ({ category: e.category, audience: e.audience, families: e.families.size, media: e.media })),
    tuples: [...tuples.values()]
  };
  return { facets, summary, index };
}

// ---------- Importación atómica ----------

const INSERT_STAGING = `
  INSERT INTO catalog_products_staging (
    branch_id, import_id, row_index, group_key, sort_name, product_json, search_text, search_public,
    marca_n, categoria_n, almacen_n, zona_n, rack_n, talla_n, color_n, audience, media,
    has_image, has_location, has_stock
  )
  SELECT ?, ?,
    json_extract(value, '$.r'), json_extract(value, '$.g'), json_extract(value, '$.s'),
    json_extract(value, '$.p'), json_extract(value, '$.t'), json_extract(value, '$.tp'),
    json_extract(value, '$.mb'), json_extract(value, '$.ct'), json_extract(value, '$.al'),
    json_extract(value, '$.zn'), json_extract(value, '$.rk'), json_extract(value, '$.tl'),
    json_extract(value, '$.cl'), json_extract(value, '$.au'), json_extract(value, '$.md'),
    json_extract(value, '$.hi'), json_extract(value, '$.hl'), json_extract(value, '$.hs')
  FROM json_each(?)`;

const COPY_COLUMNS = `branch_id, row_index, group_key, sort_name, product_json, search_text, search_public,
  marca_n, categoria_n, almacen_n, zona_n, rack_n, talla_n, color_n, audience, media,
  has_image, has_location, has_stock`;

const MAX_PRODUCTS = 50000;
const CHUNK_BYTES = 800 * 1024; // muy por debajo del límite de 2 MB por valor de D1

// ---------- Bloqueo de importación (evita dos importaciones simultáneas de la misma sucursal) ----------

const LOCK_TTL_MS = 5 * 60 * 1000;

export async function acquireLock(db, name) {
  const now = Date.now();
  const res = await db.prepare(`
    INSERT INTO system_meta (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    WHERE CAST(system_meta.value AS INTEGER) < ?
  `).bind(`lock:${name}`, String(now), now - LOCK_TTL_MS).run();
  return Number(res?.meta?.changes || 0) > 0;
}

export async function releaseLock(db, name) {
  await db.prepare('DELETE FROM system_meta WHERE key = ?').bind(`lock:${name}`).run();
}

/**
 * Reemplaza el catálogo de una sucursal sin dejarlo a medias:
 * 1) inserta en staging con pocas sentencias (json_each), 2) intercambia en un batch transaccional.
 * Si `lockHeld` es falso, toma el bloqueo de la sucursal (y responde 409 si otra importación está en curso).
 */
export async function storeProducts(db, branchId, input, { lockHeld = false, reindexOnly = false } = {}) {
  if (!lockHeld && !(await acquireLock(db, `import:${branchId}`))) {
    throw new HttpError(409, 'Ya hay una importación en curso para esta sucursal. Intenta en unos minutos.');
  }
  try {
    return await storeProductsLocked(db, branchId, input, reindexOnly);
  } finally {
    if (!lockHeld) await releaseLock(db, `import:${branchId}`);
  }
}

async function storeProductsLocked(db, branchId, input, reindexOnly = false) {
  const list = (Array.isArray(input) ? input : []).slice(0, MAX_PRODUCTS);
  const products = list.map((p, i) => cleanProduct(p, i));
  const rows = products.map((p, i) => indexRow(p, i));
  const meta = buildMeta(products, rows);
  const importId = generateToken(16);

  // Con el bloqueo tomado, cualquier fila de staging de esta sucursal es basura de un intento fallido.
  await db.prepare('DELETE FROM catalog_products_staging WHERE branch_id = ?').bind(branchId).run();
  try {
    let chunk = [];
    let bytes = 0;
    const flush = async () => {
      if (!chunk.length) return;
      await db.prepare(INSERT_STAGING).bind(branchId, importId, JSON.stringify(chunk)).run();
      chunk = [];
      bytes = 0;
    };
    for (const row of rows) {
      const size = row.p.length + row.t.length + row.tp.length + 300;
      if (bytes + size > CHUNK_BYTES) await flush();
      chunk.push(row);
      bytes += size;
    }
    await flush();

    const staged = await first(db.prepare('SELECT COUNT(*) AS n FROM catalog_products_staging WHERE import_id = ?').bind(importId));
    if (Number(staged?.n || 0) !== rows.length) throw new Error(`Staging incompleto (${staged?.n}/${rows.length})`);

    await db.batch([
      db.prepare('DELETE FROM catalog_products WHERE branch_id = ?').bind(branchId),
      db.prepare(`INSERT INTO catalog_products (${COPY_COLUMNS}) SELECT ${COPY_COLUMNS} FROM catalog_products_staging WHERE import_id = ? ORDER BY row_index`).bind(importId),
      db.prepare('DELETE FROM catalog_products_staging WHERE import_id = ?').bind(importId),
      db.prepare(`
        INSERT INTO catalog_meta (branch_id, product_count, facets_json, summary_json, index_json, index_version, imported_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(branch_id) DO UPDATE SET
          product_count = excluded.product_count, facets_json = excluded.facets_json,
          summary_json = excluded.summary_json, index_json = excluded.index_json,
          index_version = excluded.index_version,
          imported_at = CASE WHEN ? THEN catalog_meta.imported_at ELSE CURRENT_TIMESTAMP END
      `).bind(branchId, rows.length, JSON.stringify(meta.facets), JSON.stringify(meta.summary), JSON.stringify(meta.index), INDEX_VERSION, reindexOnly ? 1 : 0),
      db.prepare('DELETE FROM branch_products WHERE branch_id = ?').bind(branchId),
      db.prepare("UPDATE branch_sheet_config SET imported_products_json = '[]', last_sheet_count = ?, updated_at = CURRENT_TIMESTAMP WHERE branch_id = ?").bind(rows.length, branchId)
    ]);
  } catch (err) {
    await db.prepare('DELETE FROM catalog_products_staging WHERE import_id = ?').bind(importId).run().catch(() => null);
    throw err;
  }
  return rows.length;
}

const META_SQL = 'SELECT product_count, facets_json, summary_json, index_json, index_version, imported_at FROM catalog_meta WHERE branch_id = ?';

/**
 * Devuelve facets/resumen/índice.
 * - Primera vez: migra la sucursal desde las tablas antiguas.
 * - Índice viejo (INDEX_VERSION): reindexa desde los productos ya guardados, sin volver a leer el Sheet.
 */
export async function getCatalogMeta(db, branchId) {
  let row = await first(db.prepare(META_SQL).bind(branchId));
  if (!row) {
    const legacy = await all(db.prepare('SELECT product_json FROM branch_products WHERE branch_id = ? ORDER BY row_index').bind(branchId));
    let products = legacy.map((r) => safeJsonParse(r.product_json, null)).filter(Boolean);
    if (!products.length) {
      const cfg = await first(db.prepare('SELECT imported_products_json FROM branch_sheet_config WHERE branch_id = ?').bind(branchId));
      const fallback = safeJsonParse(cfg?.imported_products_json, []);
      products = Array.isArray(fallback) ? fallback : [];
    }
    await storeProducts(db, branchId, products).catch((err) => { if (err?.status !== 409) throw err; });
    row = await first(db.prepare(META_SQL).bind(branchId));
  } else if (Number(row.index_version || 0) < INDEX_VERSION && (await acquireLock(db, `import:${branchId}`))) {
    try {
      const current = await all(db.prepare('SELECT product_json FROM catalog_products WHERE branch_id = ? ORDER BY row_index').bind(branchId));
      await storeProducts(db, branchId, current.map((r) => safeJsonParse(r.product_json, null)).filter(Boolean), { lockHeld: true, reindexOnly: true });
      row = await first(db.prepare(META_SQL).bind(branchId));
    } finally {
      await releaseLock(db, `import:${branchId}`);
    }
  }
  return {
    count: Number(row?.product_count || 0),
    facets: safeJsonParse(row?.facets_json, {}),
    summary: safeJsonParse(row?.summary_json, {}),
    index: safeJsonParse(row?.index_json, { categories: [], tuples: [] }),
    importedAt: row?.imported_at ? new Date(String(row.imported_at).replace(' ', 'T') + 'Z').toISOString() : null
  };
}

// ---------- Consultas ----------

function escapeLike(term) {
  return term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function buildWhere(branchId, q, f, isAdmin, cfg) {
  const where = ['branch_id = ?'];
  const params = [branchId];
  const eq = (column, value) => {
    const v = norm(value);
    if (v) { where.push(`${column} = ?`); params.push(v); }
  };
  eq('marca_n', f.brand);
  eq('categoria_n', f.category);
  eq('talla_n', f.size);
  eq('color_n', f.color);
  if (isAdmin || cfg.almacen) eq('almacen_n', f.warehouse);
  if (isAdmin) { eq('zona_n', f.zone); eq('rack_n', f.rack); }

  const audience = norm(f.audience);
  if (audience && audience !== 'all') { where.push('audience = ?'); params.push(audience); }

  const flag = (column, state) => {
    if (state === 'with') where.push(`${column} = 1`);
    if (state === 'without') where.push(`${column} = 0`);
  };
  flag('has_image', f.image_state);
  if (isAdmin) flag('has_location', f.location_state);
  if (isAdmin || cfg.stock) flag('has_stock', f.stock_state);

  // Los clientes buscan sin ubicación/almacén, salvo que el dueño haya hecho visibles esos campos.
  const searchColumn = isAdmin || cfg.ubicacion || cfg.almacen ? 'search_text' : 'search_public';
  const terms = norm(q).split(/\s+/).filter(Boolean).slice(0, 8);
  for (const term of terms) {
    where.push(`${searchColumn} LIKE ? ESCAPE '\\'`);
    params.push(`%${escapeLike(term.slice(0, 60))}%`);
  }
  return { where: where.join(' AND '), params };
}

export function sanitizeProduct(product, cfg) {
  const out = { ...product };
  for (const [flag, keys] of Object.entries(PRIVATE_FIELDS)) {
    if (cfg[flag]) continue;
    for (const key of keys) delete out[key];
  }
  return out;
}

export function sanitizeFacets(facets, cfg) {
  const out = { ...facets };
  for (const key of ['zones', 'zone_options', 'racks', 'rack_options']) delete out[key];
  if (!cfg.almacen) { delete out.warehouses; delete out.warehouse_options; }
  return out;
}

function uniqueValues(items, keys) {
  const seen = new Map();
  for (const p of items) {
    const v = pv(p, keys);
    if (v && !seen.has(norm(v))) seen.set(norm(v), v);
  }
  return [...seen.values()];
}

function buildGroup(key, items) {
  const preferred = items.find((p) => mediaOf(p)) || items[0] || {};
  return {
    ...preferred,
    _grouped: true,
    _groupKey: key,
    _groupName: displayName(preferred),
    _groupItems: items,
    _variantCount: items.length,
    _sizeOptions: uniqueValues(items, K.talla),
    _colorOptions: uniqueValues(items, K.color),
    _locationOptions: uniqueValues(items, K.ubicacion),
    _warehouseOptions: uniqueValues(items, K.almacen),
    _skuOptions: uniqueValues(items, [...K.sku, ...K.barras])
  };
}

/**
 * Listado paginado. Filtra, agrupa y pagina en SQL; solo se parsean las filas de la página.
 * opts: { branchId, q, filters, page, limit, grouped, isAdmin, cfg }
 */
export async function queryProducts(db, opts) {
  const { branchId, q, filters, isAdmin, cfg } = opts;
  const limit = opts.limit;
  const { where, params } = buildWhere(branchId, q, filters, isAdmin, cfg);
  const prep = (p) => (isAdmin ? p : sanitizeProduct(p, cfg));

  const counts = await first(db.prepare(`SELECT COUNT(*) AS n, COUNT(DISTINCT group_key) AS g FROM catalog_products WHERE ${where}`).bind(...params));
  const productTotal = Number(counts?.n || 0);

  if (!opts.grouped) {
    const totalPages = Math.max(1, Math.ceil(productTotal / limit));
    const page = Math.min(opts.page, totalPages);
    const rows = await all(db.prepare(`SELECT product_json FROM catalog_products WHERE ${where} ORDER BY row_index LIMIT ? OFFSET ?`).bind(...params, limit, (page - 1) * limit));
    return {
      items: rows.map((r) => prep(safeJsonParse(r.product_json, {}))),
      total: productTotal, page, total_pages: totalPages, grouped: false, group_total_products: productTotal
    };
  }

  const groupTotal = Number(counts?.g || 0);
  const totalPages = Math.max(1, Math.ceil(groupTotal / limit));
  const page = Math.min(opts.page, totalPages);
  const keyRows = await all(db.prepare(`
    SELECT group_key, MIN(sort_name) AS s FROM catalog_products WHERE ${where}
    GROUP BY group_key ORDER BY s, group_key LIMIT ? OFFSET ?
  `).bind(...params, limit, (page - 1) * limit));
  const keys = keyRows.map((r) => r.group_key);

  const byKey = new Map(keys.map((k) => [k, []]));
  const CHUNK = 60; // D1 admite 100 parámetros por sentencia
  for (let i = 0; i < keys.length; i += CHUNK) {
    const part = keys.slice(i, i + CHUNK);
    const rows = await all(db.prepare(`
      SELECT group_key, product_json FROM catalog_products
      WHERE ${where} AND group_key IN (${part.map(() => '?').join(',')})
      ORDER BY row_index
    `).bind(...params, ...part));
    for (const r of rows) byKey.get(r.group_key)?.push(prep(safeJsonParse(r.product_json, {})));
  }

  return {
    items: keys.map((k) => buildGroup(k, byKey.get(k) || [])),
    total: groupTotal, page, total_pages: totalPages, grouped: true, group_total_products: productTotal
  };
}

// ---------- Google Sheet → productos ----------

/** Convierte filas del Sheet en productos usando el mapeo campo → encabezado. */
/**
 * `stats` (opcional) se llena con cuántas filas se descartaron y por qué,
 * con ejemplos de número de fila del Sheet (`firstDataRow` = fila del primer dato).
 */
export function mapRowsToProducts(headers, rows, mappingInput, stats = null, firstDataRow = 2) {
  const mapping = normalizeMapping(mappingInput);
  const st = stats || {};
  Object.assign(st, { read: rows.length, kept: 0, skipped_no_id: 0, skipped_header: 0, examples_no_id: [] });
  const index = new Map(headers.map((h, i) => [h, i]));
  const products = [];
  rows.forEach((row, i) => {
    const p = { id: `sheet-${i + 1}` };
    let headerEchoes = 0;
    for (const key of FIELD_KEYS) {
      const header = mapping[key];
      const idx = index.get(header);
      const value = idx == null ? '' : String(row[idx] ?? '').trim();
      if (!value) continue;
      // Celda que repite el nombre de su columna (p. ej. "Color" en la columna Color): es un marcador, no un dato.
      if (norm(value) === norm(header)) { headerEchoes += 1; continue; }
      p[key] = value;
    }
    if (headerEchoes >= 3) { st.skipped_header += 1; return; } // fila de encabezados repetida dentro del Sheet
    if (!p.ubicacion) {
      const loc = [p.zona, p.estante, p.nivel, p.slot].filter(Boolean).join('-');
      if (loc) p.ubicacion = loc;
    }
    if ((p.nombre || p.sku || p.barras) && norm(p.nombre) !== 'producto') {
      products.push(p);
    } else {
      st.skipped_no_id += 1;
      if (st.examples_no_id.length < 5) st.examples_no_id.push(firstDataRow + i);
    }
  });
  st.kept = products.length;
  return products;
}

export function normalizeMapping(input) {
  if (Array.isArray(input)) {
    const out = {};
    for (const row of input) {
      const key = row?.key || row?.field || row?.target || row?.name;
      const value = row?.header || row?.source || row?.column || row?.value;
      if (key) out[key] = value || '';
    }
    return out;
  }
  if (input && typeof input === 'object') {
    const out = {};
    for (const key of FIELD_KEYS) if (typeof input[key] === 'string') out[key] = input[key];
    return out;
  }
  return {};
}

export function assertBranch(branch) {
  if (!branch) throw new HttpError(404, 'Sucursal no encontrada');
  return branch;
}
