// Esquema de D1. Se aplica una vez por versión (no en cada request).
import { first } from './http.js';
import { hashPassword } from './auth.js';

export const SCHEMA_VERSION = '3';
let schemaReady = false;

const PRODUCT_COLUMNS = `
  branch_id INTEGER NOT NULL,
  row_index INTEGER NOT NULL,
  group_key TEXT NOT NULL,
  sort_name TEXT NOT NULL DEFAULT '',
  product_json TEXT NOT NULL,
  search_text TEXT NOT NULL DEFAULT '',
  marca_n TEXT NOT NULL DEFAULT '',
  categoria_n TEXT NOT NULL DEFAULT '',
  almacen_n TEXT NOT NULL DEFAULT '',
  zona_n TEXT NOT NULL DEFAULT '',
  rack_n TEXT NOT NULL DEFAULT '',
  talla_n TEXT NOT NULL DEFAULT '',
  color_n TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'all',
  media TEXT NOT NULL DEFAULT '',
  has_image INTEGER NOT NULL DEFAULT 0,
  has_location INTEGER NOT NULL DEFAULT 0,
  has_stock INTEGER NOT NULL DEFAULT 0`;

export const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'tienda',
    slug TEXT NOT NULL,
    warehouses_json TEXT NOT NULL DEFAULT '[]',
    canvas_width INTEGER NOT NULL DEFAULT 900,
    canvas_height INTEGER NOT NULL DEFAULT 620,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, slug)
  )`,
  `CREATE TABLE IF NOT EXISTS branch_sheet_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL UNIQUE,
    sheet_id TEXT,
    sheet_name TEXT DEFAULT 'Productos',
    source_type TEXT DEFAULT 'google_sheet',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sheet_map_json TEXT,
    imported_products_json TEXT,
    last_sheet_count INTEGER NOT NULL DEFAULT 0,
    sheet_headers_json TEXT,
    sheet_header_index INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS branch_layouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL UNIQUE,
    layout_json TEXT NOT NULL,
    viewbox_json TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  // Tabla antigua: solo se lee para migrar catálogos existentes a catalog_products.
  `CREATE TABLE IF NOT EXISTS branch_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    row_index INTEGER NOT NULL,
    product_json TEXT NOT NULL,
    search_text TEXT, marca TEXT, categoria TEXT, almacen TEXT, talla TEXT, color TEXT,
    has_image INTEGER NOT NULL DEFAULT 0,
    has_location INTEGER NOT NULL DEFAULT 0,
    has_stock INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, row_index)
  )`,
  `CREATE TABLE IF NOT EXISTS viewer_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_viewer_links_branch ON viewer_links(branch_id, active)`,
  `CREATE TABLE IF NOT EXISTS app_state_blobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL UNIQUE,
    admin_json TEXT,
    rack_models_json TEXT,
    branch_layouts_json TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS system_meta (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sessions_store (
    sid TEXT PRIMARY KEY,
    sess_json TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions_store(expires_at)`,

  // ---- v3 ----
  `CREATE TABLE IF NOT EXISTS catalog_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,${PRODUCT_COLUMNS}
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cp_branch_sort ON catalog_products(branch_id, sort_name, group_key)`,
  `CREATE INDEX IF NOT EXISTS idx_cp_branch_group ON catalog_products(branch_id, group_key, row_index)`,
  `CREATE INDEX IF NOT EXISTS idx_cp_branch_cat ON catalog_products(branch_id, categoria_n)`,
  `CREATE INDEX IF NOT EXISTS idx_cp_branch_brand ON catalog_products(branch_id, marca_n)`,
  `CREATE TABLE IF NOT EXISTS catalog_products_staging (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id TEXT NOT NULL,${PRODUCT_COLUMNS}
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cps_import ON catalog_products_staging(import_id)`,
  `CREATE TABLE IF NOT EXISTS catalog_meta (
    branch_id INTEGER PRIMARY KEY,
    product_count INTEGER NOT NULL DEFAULT 0,
    facets_json TEXT NOT NULL DEFAULT '{}',
    summary_json TEXT NOT NULL DEFAULT '{}',
    index_json TEXT NOT NULL DEFAULT '{}',
    imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS company_settings (
    company_id INTEGER PRIMARY KEY,
    ui_config_json TEXT NOT NULL DEFAULT '{}',
    branding_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start INTEGER NOT NULL
  )`
];

export async function ensureSchema(db, env) {
  if (schemaReady) return;
  try {
    const row = await first(db.prepare("SELECT value FROM system_meta WHERE key = 'schema_version'"));
    if (row && String(row.value) === SCHEMA_VERSION) {
      schemaReady = true;
      return;
    }
  } catch (_err) {
    // Tabla inexistente: base nueva.
  }

  await db.batch(STATEMENTS.map((sql) => db.prepare(sql)));
  await seed(db, env);
  await db.prepare(`
    INSERT INTO system_meta (key, value, updated_at) VALUES ('schema_version', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).bind(SCHEMA_VERSION).run();
  schemaReady = true;
}

async function seed(db, env) {
  const companyName = String(env.DEFAULT_COMPANY_NAME || 'Catálogo Visual');
  const companyCode = String(env.DEFAULT_COMPANY_CODE || 'CAT-CF');

  await db.prepare('INSERT INTO companies (id, name, code) VALUES (1, ?, ?) ON CONFLICT(id) DO NOTHING')
    .bind(companyName, companyCode).run();

  // El admin inicial solo se crea si se definió ADMIN_PASSWORD como secreto.
  const adminUser = String(env.ADMIN_USERNAME || 'admin');
  const adminPassword = String(env.ADMIN_PASSWORD || '');
  if (adminPassword) {
    const hash = await hashPassword(adminPassword, env);
    await db.prepare(`
      INSERT INTO users (company_id, username, password_hash, role) VALUES (1, ?, ?, 'admin')
      ON CONFLICT(username) DO NOTHING
    `).bind(adminUser, hash).run();
  } else {
    console.warn('ADMIN_PASSWORD no definido: no se creó usuario admin inicial.');
  }

  const branch = await first(db.prepare('SELECT id FROM branches WHERE company_id = 1 LIMIT 1'));
  if (!branch) {
    await db.prepare(`
      INSERT INTO branches (company_id, name, type, slug, warehouses_json)
      VALUES (1, 'Sucursal principal', 'tienda', 'sucursal-principal', ?)
    `).bind(JSON.stringify(['Almacén principal'])).run();
  }
}
