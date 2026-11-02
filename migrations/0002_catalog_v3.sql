-- v70: catálogo indexado, staging de importación, configuración del dueño y límite de intentos.
-- La API también crea estas tablas sola la primera vez (lib/schema.js).

CREATE INDEX IF NOT EXISTS idx_viewer_links_branch ON viewer_links(branch_id, active);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions_store(expires_at);

CREATE TABLE IF NOT EXISTS catalog_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
has_stock INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cp_branch_sort ON catalog_products(branch_id, sort_name, group_key);

CREATE INDEX IF NOT EXISTS idx_cp_branch_group ON catalog_products(branch_id, group_key, row_index);

CREATE INDEX IF NOT EXISTS idx_cp_branch_cat ON catalog_products(branch_id, categoria_n);

CREATE INDEX IF NOT EXISTS idx_cp_branch_brand ON catalog_products(branch_id, marca_n);

CREATE TABLE IF NOT EXISTS catalog_products_staging (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_id TEXT NOT NULL,
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
has_stock INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cps_import ON catalog_products_staging(import_id);

CREATE TABLE IF NOT EXISTS catalog_meta (
  branch_id INTEGER PRIMARY KEY,
  product_count INTEGER NOT NULL DEFAULT 0,
  facets_json TEXT NOT NULL DEFAULT '{}',
  summary_json TEXT NOT NULL DEFAULT '{}',
  index_json TEXT NOT NULL DEFAULT '{}',
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_settings (
  company_id INTEGER PRIMARY KEY,
  ui_config_json TEXT NOT NULL DEFAULT '{}',
  branding_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);
