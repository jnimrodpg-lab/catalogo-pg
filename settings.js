// Configuración visible para clientes (campos de la card y marca), guardada en D1.
import { HttpError, first, safeJsonParse } from './http.js';
import { DEFAULT_UI_CONFIG } from './catalog.js';

export const DEFAULT_BRANDING = { name: '', logo: '' };
// whatsapp: número que recibe las solicitudes (solo dígitos, con código de país).
// sync_hours: cada cuántas horas se reimporta el Sheet automáticamente (0 = desactivado).
export const DEFAULT_BUSINESS = { whatsapp: '', sync_hours: 0 };
export const SYNC_OPTIONS = [0, 1, 3, 6, 12, 24];
const MAX_LOGO_CHARS = 400 * 1024;

export async function getSettings(db, companyId) {
  const row = await first(db.prepare('SELECT ui_config_json, branding_json, business_json FROM company_settings WHERE company_id = ?').bind(companyId));
  return {
    ui_config: { ...DEFAULT_UI_CONFIG, ...cleanUiConfig(safeJsonParse(row?.ui_config_json, {})) },
    branding: { ...DEFAULT_BRANDING, ...cleanBranding(safeJsonParse(row?.branding_json, {}), false) },
    business: { ...DEFAULT_BUSINESS, ...cleanBusiness(safeJsonParse(row?.business_json, {}), false) }
  };
}

/** Lo que puede ver un cliente: nunca la configuración de sincronización. */
export function publicSettings(settings) {
  return { ui_config: settings.ui_config, branding: settings.branding, business: { whatsapp: settings.business.whatsapp } };
}

function cleanBusiness(input, strict) {
  const out = {};
  if (typeof input?.whatsapp === 'string') {
    const digits = input.whatsapp.replace(/\D/g, '');
    if (digits && (digits.length < 8 || digits.length > 15)) {
      if (strict) throw new HttpError(400, 'Número de WhatsApp inválido: usa código de país, por ejemplo 51987654321.');
    } else {
      out.whatsapp = digits;
    }
  }
  if (input?.sync_hours !== undefined) {
    const hours = Number(input.sync_hours);
    if (SYNC_OPTIONS.includes(hours)) out.sync_hours = hours;
    else if (strict) throw new HttpError(400, 'Frecuencia de sincronización inválida');
  }
  return out;
}

function cleanUiConfig(input) {
  const out = {};
  for (const key of Object.keys(DEFAULT_UI_CONFIG)) {
    if (typeof input?.[key] === 'boolean') out[key] = input[key];
  }
  return out;
}

function cleanBranding(input, strict) {
  const out = {};
  if (typeof input?.name === 'string') out.name = input.name.trim().slice(0, 80);
  if (typeof input?.logo === 'string') {
    const logo = input.logo.trim();
    const ok = logo === ''
      || /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(logo)
      || /^https:\/\/[^\s"'<>]+$/.test(logo);
    if (!ok && strict) throw new HttpError(400, 'Logo inválido: usa PNG, JPG, WEBP o GIF.');
    if (logo.length > MAX_LOGO_CHARS && strict) throw new HttpError(400, 'El logo es demasiado grande (máx. 300 KB).');
    if (ok && logo.length <= MAX_LOGO_CHARS) out.logo = logo;
  }
  return out;
}

export async function saveSettings(db, companyId, body) {
  const current = await getSettings(db, companyId);
  const ui = body.ui_config && typeof body.ui_config === 'object'
    ? { ...current.ui_config, ...cleanUiConfig(body.ui_config) }
    : current.ui_config;
  const branding = body.branding && typeof body.branding === 'object'
    ? { ...current.branding, ...cleanBranding(body.branding, true) }
    : current.branding;
  const business = body.business && typeof body.business === 'object'
    ? { ...current.business, ...cleanBusiness(body.business, true) }
    : current.business;
  await db.prepare(`
    INSERT INTO company_settings (company_id, ui_config_json, branding_json, business_json, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(company_id) DO UPDATE SET
      ui_config_json = excluded.ui_config_json, branding_json = excluded.branding_json,
      business_json = excluded.business_json, updated_at = CURRENT_TIMESTAMP
  `).bind(companyId, JSON.stringify(ui), JSON.stringify(branding), JSON.stringify(business)).run();
  return { ui_config: ui, branding, business };
}
