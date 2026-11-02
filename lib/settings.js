// Configuración visible para clientes (campos de la card y marca), guardada en D1.
import { HttpError, first, safeJsonParse } from './http.js';
import { DEFAULT_UI_CONFIG } from './catalog.js';

export const DEFAULT_BRANDING = { name: '', logo: '' };
const MAX_LOGO_CHARS = 400 * 1024;

export async function getSettings(db, companyId) {
  const row = await first(db.prepare('SELECT ui_config_json, branding_json FROM company_settings WHERE company_id = ?').bind(companyId));
  return {
    ui_config: { ...DEFAULT_UI_CONFIG, ...cleanUiConfig(safeJsonParse(row?.ui_config_json, {})) },
    branding: { ...DEFAULT_BRANDING, ...cleanBranding(safeJsonParse(row?.branding_json, {}), false) }
  };
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
  await db.prepare(`
    INSERT INTO company_settings (company_id, ui_config_json, branding_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(company_id) DO UPDATE SET
      ui_config_json = excluded.ui_config_json, branding_json = excluded.branding_json, updated_at = CURRENT_TIMESTAMP
  `).bind(companyId, JSON.stringify(ui), JSON.stringify(branding)).run();
  return { ui_config: ui, branding };
}
