// Contraseñas (PBKDF2), sesiones y límite de intentos.
import { HttpError, fail, first, readCookie, safeJsonParse } from './http.js';

export const COOKIE_NAME = 'wms.sid';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const DEFAULT_ITERATIONS = 100000; // máximo admitido por WebCrypto en Workers

const enc = new TextEncoder();

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function timingSafeEqual(a, b) {
  const x = String(a);
  const y = String(b);
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i += 1) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return diff === 0;
}

async function pbkdf2Hex(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(String(password)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toHex(bits);
}

export async function hashPassword(password, env = {}) {
  const iterations = Math.min(DEFAULT_ITERATIONS, Math.max(10000, Number(env.PBKDF2_ITERATIONS || DEFAULT_ITERATIONS)));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${iterations}$${toHex(salt)}$${await pbkdf2Hex(password, salt, iterations)}`;
}

/** Devuelve { ok, needsRehash }. Acepta también el formato antiguo `salt$sha256`. */
export async function verifyPassword(stored, password) {
  const value = String(stored || '');
  if (value.startsWith('pbkdf2$')) {
    const [, iter, saltHex, hash] = value.split('$');
    if (!iter || !saltHex || !hash) return { ok: false, needsRehash: false };
    const computed = await pbkdf2Hex(password, fromHex(saltHex), Number(iter));
    return { ok: timingSafeEqual(computed, hash), needsRehash: Number(iter) < DEFAULT_ITERATIONS };
  }
  const [salt, hash] = value.split('$');
  if (!salt || !hash) return { ok: false, needsRehash: false };
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(`${salt}:${String(password || '')}`));
  return { ok: timingSafeEqual(toHex(digest), hash), needsRehash: true };
}

export function isWeakPassword(password) {
  const p = String(password || '');
  return p.length < 8 || ['admin123', 'password', '12345678', 'admin'].includes(p.toLowerCase());
}

// ---------- Sesiones ----------

export function makeSessionCookie(sid) {
  return `${COOKIE_NAME}=${encodeURIComponent(sid)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function createSession(db, data) {
  const sid = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const sess = {
    isAuthenticated: true,
    user_id: Number(data.user_id || 0),
    username: String(data.username || ''),
    role: data.role === 'admin' ? 'admin' : 'viewer',
    company_id: Number(data.company_id || 1)
  };
  await db.prepare('INSERT INTO sessions_store (sid, sess_json, expires_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
    .bind(sid, JSON.stringify(sess), Date.now() + SESSION_TTL_MS).run();

  // Limpieza ocasional de sesiones e intentos vencidos (sin cron).
  if (Math.random() < 0.05) {
    await db.batch([
      db.prepare('DELETE FROM sessions_store WHERE expires_at < ?').bind(Date.now()),
      db.prepare('DELETE FROM login_attempts WHERE window_start < ?').bind(Date.now() - 86400000)
    ]);
  }
  return sid;
}

export async function getSession(request, db) {
  const sid = readCookie(request, COOKIE_NAME);
  if (!sid || sid.length > 128) return null;
  const row = await first(db.prepare('SELECT sess_json, expires_at FROM sessions_store WHERE sid = ?').bind(sid));
  if (!row) return null;
  const expiresAt = Number(row.expires_at || 0);
  const now = Date.now();
  if (expiresAt <= now) {
    await db.prepare('DELETE FROM sessions_store WHERE sid = ?').bind(sid).run();
    return null;
  }
  const sess = safeJsonParse(row.sess_json, null);
  if (!sess || !sess.isAuthenticated) return null;
  // Solo renueva cuando queda menos de la mitad del TTL: evita una escritura por request.
  if (expiresAt - now < SESSION_TTL_MS / 2) {
    await db.prepare('UPDATE sessions_store SET expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE sid = ?')
      .bind(now + SESSION_TTL_MS, sid).run();
  }
  return { ...sess, sid };
}

export async function requireAuth(request, db) {
  const session = await getSession(request, db);
  if (!session) return { error: fail(401, 'No autorizado') };
  return session;
}

export async function requireAdmin(request, db) {
  const session = await getSession(request, db);
  if (!session) return { error: fail(401, 'No autorizado') };
  if (session.role !== 'admin') return { error: fail(403, 'Solo administradores') };
  return session;
}

// ---------- Límite de intentos ----------

/** Lanza HttpError 429 si la clave superó `max` intentos dentro de la ventana. */
export async function rateLimit(db, key, max, windowMs) {
  const now = Date.now();
  const row = await first(db.prepare('SELECT count, window_start FROM login_attempts WHERE key = ?').bind(key));
  if (!row || now - Number(row.window_start) > windowMs) {
    await db.prepare(`
      INSERT INTO login_attempts (key, count, window_start) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start
    `).bind(key, now).run();
    return;
  }
  if (Number(row.count) >= max) {
    const wait = Math.ceil((windowMs - (now - Number(row.window_start))) / 60000);
    throw new HttpError(429, `Demasiados intentos. Intenta de nuevo en ${wait} min.`);
  }
  await db.prepare('UPDATE login_attempts SET count = count + 1 WHERE key = ?').bind(key).run();
}

export async function clearRateLimit(db, key) {
  await db.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key).run();
}

export function readCookieSid(request) {
  return readCookie(request, COOKIE_NAME);
}
