// Servidor local: D1 simulado sobre node:sqlite + archivos estáticos + Functions.
// Servidor de pruebas sin Cloudflare (requiere Node 22+).
// Uso: npm run test:server   (o: node tests/devserver.mjs [proyecto] [puerto] [db.sqlite])
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const port = Number(process.argv[3] || 8788);
const dbFile = process.argv[4] || ':memory:';
const sqlite = new DatabaseSync(dbFile);
export const stats = { statements: 0 };

function plain(row) { return row ? { ...row } : null; }

class Stmt {
  constructor(sql, args = []) { this.sql = sql; this.args = args; }
  bind(...args) {
    for (const a of args) if (a === undefined) throw new Error('D1_TYPE_ERROR: undefined bind');
    if (args.length > 100) throw new Error('D1: too many SQL variables');
    return new Stmt(this.sql, args.map((a) => (typeof a === 'boolean' ? Number(a) : a)));
  }
  _p() { stats.statements += 1; return sqlite.prepare(this.sql); }
  async first(col) { const r = plain(this._p().get(...this.args)); return col ? r?.[col] ?? null : r; }
  async all() { return { results: this._p().all(...this.args).map(plain), success: true }; }
  async run() { const info = this._p().run(...this.args); return { success: true, meta: { last_row_id: Number(info.lastInsertRowid), changes: info.changes } }; }
  _exec() { return /^\s*(select|with)/i.test(this.sql) ? { results: this._p().all(...this.args).map(plain) } : (() => { const i = this._p().run(...this.args); return { meta: { last_row_id: Number(i.lastInsertRowid), changes: i.changes } }; })(); }
}

const DB = {
  prepare: (sql) => new Stmt(sql),
  async batch(stmts) {
    sqlite.exec('BEGIN');
    try { const out = stmts.map((s) => s._exec()); sqlite.exec('COMMIT'); return out; }
    catch (e) { sqlite.exec('ROLLBACK'); throw e; }
  }
};

// Google Sheets simulado: devuelve tests/fixture.csv para cualquier hoja.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const u = String(input?.url || input);
  if (u.includes('docs.google.com/spreadsheets')) {
    if (u.includes('/edit')) return new Response('<html>"sheetId":0,"title":"Productos"</html>', { headers: { 'content-type': 'text/html' } });
    if (u.includes('format=csv') || u.includes('out:csv')) {
      return new Response(fs.readFileSync(new URL('./fixture.csv', import.meta.url), 'utf8'), { headers: { 'content-type': 'text/csv' } });
    }
    return new Response('', { status: 404 });
  }
  if (u.includes('google.com')) return new Response('blocked in test', { status: 502 });
  return realFetch(input, init);
};

const env = { DB, ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123', DEFAULT_COMPANY_NAME: 'Catálogo Visual', DEFAULT_COMPANY_CODE: 'CAT-CF' };
export const pending = [];
const api = await import(pathToFileURL(path.join(root, 'functions/api/[[path]].js')).href);

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname.startsWith('/api/')) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body });
    const segs = url.pathname.slice(5).split('/').filter(Boolean);
    const response = await api.onRequest({ request, env, params: { path: segs }, waitUntil: (p) => { pending.push(Promise.resolve(p).catch(() => null)); } });
    const headers = {};
    response.headers.forEach((v, k) => { if (k !== 'set-cookie') headers[k] = v; });
    const cookies = response.headers.getSetCookie?.() || [];
    if (cookies.length) headers['set-cookie'] = cookies.map((c) => c.replace('; Secure', ''));
    res.writeHead(response.status, headers);
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  let file = path.join(root, 'public', decodeURIComponent(url.pathname));
  if (!file.startsWith(path.join(root, 'public')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'public/index.html');
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
}).listen(port, () => console.log(`dev on http://localhost:${port}`));
