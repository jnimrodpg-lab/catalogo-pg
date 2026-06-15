CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT DEFAULT 'WMS Control',
  company_id INTEGER
);

CREATE TABLE IF NOT EXISTS branches (
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
);

CREATE TABLE IF NOT EXISTS branch_sheet_config (
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
);

CREATE TABLE IF NOT EXISTS branch_layouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL UNIQUE,
  layout_json TEXT NOT NULL,
  viewbox_json TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS viewer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_state_blobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE,
  admin_json TEXT,
  rack_models_json TEXT,
  branch_layouts_json TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions_store (
  sid TEXT PRIMARY KEY,
  sess_json TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branch_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL,
  row_index INTEGER NOT NULL,
  product_json TEXT NOT NULL,
  search_text TEXT,
  marca TEXT,
  categoria TEXT,
  almacen TEXT,
  talla TEXT,
  color TEXT,
  has_image INTEGER NOT NULL DEFAULT 0,
  has_location INTEGER NOT NULL DEFAULT 0,
  has_stock INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, row_index)
);
CREATE INDEX IF NOT EXISTS idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_products_marca ON branch_products(branch_id, marca);
CREATE INDEX IF NOT EXISTS idx_branch_products_categoria ON branch_products(branch_id, categoria);
CREATE INDEX IF NOT EXISTS idx_branch_products_talla ON branch_products(branch_id, talla);
CREATE INDEX IF NOT EXISTS idx_branch_products_color ON branch_products(branch_id, color);
