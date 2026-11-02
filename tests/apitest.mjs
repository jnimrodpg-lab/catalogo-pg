// Pruebas de la API contra devserver.mjs
const BASE = process.argv[2] || 'http://localhost:8788';
let failures = 0;
const ok = (cond, msg, extra) => { console.log(`${cond ? '✔' : '✘'} ${msg}`); if (!cond) { failures += 1; if (extra !== undefined) console.log('   →', JSON.stringify(extra).slice(0, 400)); } };

function client() {
  let cookie = '';
  return async (path, opts = {}) => {
    const res = await fetch(BASE + '/api' + path, {
      ...opts,
      headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(opts.headers || {}) }
    });
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0];
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
  };
}

const admin = client();
const anon = client();
const viewer = client();

let r = await admin('/login', { method: 'POST', body: JSON.stringify({ username: 'admin', password: 'admin123' }) });
ok(r.status === 200 && r.data.role === 'admin', 'login admin');
ok(r.data.weak_password === true, 'aviso de contraseña débil');

r = await admin('/branches');
const branchId = r.data.branches?.[0]?.id;
ok(!!branchId, 'lista sucursales');

r = await admin(`/sheets/probe?url=${encodeURIComponent('https://docs.google.com/spreadsheets/d/ABCDEFGHIJKLMNOPQRSTUVWXYZ/edit')}&sheet=Productos`);
ok(r.status === 200 && r.data.headers?.length === 12, 'leer encabezados', r.data);

const mapping = { sku: 'SKU', nombre: 'Nombre', marca: 'Marca', categoria: 'Categoria', genero: 'Genero', talla: 'Talla', color: 'Color', ubicacion: 'Ubicacion', almacen: 'Almacen', precio: 'P.Lista(+IGV)', stock: 'Cant. Restock', imagen: 'Imagen' };
let t0 = Date.now();
r = await admin(`/branches/${branchId}/import`, { method: 'POST', body: JSON.stringify({ sheet_id: 'https://docs.google.com/spreadsheets/d/ABCDEFGHIJKLMNOPQRSTUVWXYZ/edit', sheet_name: 'Productos', sheet_map_rows: mapping }) });
ok(r.status === 200 && r.data.imported === 3000, `importación en servidor (${Date.now() - t0} ms)`, r.data);

r = await admin(`/branches/${branchId}/products?page=1&limit=48&group_by=name`);
ok(r.data.total === 600 && r.data.items.length === 48 && r.data.group_total_products === 3000, 'listado agrupado paginado', { total: r.data.total, n: r.data.items?.length, g: r.data.group_total_products });
ok(r.data.items[0]._groupItems.length >= 3 && r.data.items[0]._sizeOptions.length >= 1, 'grupo con variantes');
ok(r.data.items[0].ubicacion && r.data.items[0].almacen, 'admin ve ubicación y almacén');
ok(r.data.facets.brands.length === 5 && r.data.summary.total === 3000, 'facets y resumen precalculados');
const names = r.data.items.map((g) => g._groupName);
ok(names.join() === [...names].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })).join(), 'orden alfabético', names.slice(0, 5));

r = await admin(`/branches/${branchId}/products?page=13&limit=48&group_by=name`);
ok(r.data.page === 13 && r.data.items.length === 600 - 12 * 48, 'última página');

r = await admin(`/branches/${branchId}/products?group_by=name&limit=200&size=XL&color=Negro`);
const allMatch = r.data.items.every((g) => g._groupItems.every((p) => p.talla === 'XL' && p.color === 'Negro'));
ok(r.data.items.length > 0 && allMatch, 'filtro talla+color en servidor');

r = await admin(`/branches/${branchId}/products?group_by=name&q=${encodeURIComponent('casaca urban')}`);
ok(r.data.total === 60, 'búsqueda multi-término', r.data.total);
r = await admin(`/branches/${branchId}/products?group_by=name&q=${encodeURIComponent('100%_x')}`);
ok(r.status === 200 && r.data.total === 0, 'LIKE escapa % y _');

r = await admin(`/branches/${branchId}/products?group_by=name&audience=bebe&category=Pijamas`);
ok(r.data.total > 0 && r.data.total < 60 && r.data.items.every((g) => ['Bebé','Unisex'].includes(g.genero)), 'filtro por público (antes no se aplicaba)', r.data.items?.map(g=>g.genero));

r = await admin(`/branches/${branchId}/catalog-index`);
ok(r.data.categories?.some((c) => c.audience === 'all' && c.category === 'Polos' && c.families === 60), 'índice de categorías', r.data.categories?.slice(0, 3));
ok(r.data.tuples?.length > 0, 'combinaciones para filtros rápidos');

// Configuración del dueño
r = await admin('/settings', { method: 'PUT', body: JSON.stringify({ ui_config: { precio: true, stock: false }, branding: { name: 'Mi Tienda' } }) });
ok(r.status === 200 && r.data.ui_config.precio === true && r.data.branding.name === 'Mi Tienda', 'guardar configuración');
r = await admin('/settings', { method: 'PUT', body: JSON.stringify({ branding: { logo: 'javascript:alert(1)' } }) });
ok(r.status === 400, 'rechaza logo inválido');

// Link público
r = await admin(`/branches/${branchId}/view-link`, { method: 'POST', body: '{}' });
const token = r.data.token;
ok(!!token && r.data.url.endsWith(`/viewer/${token}`), 'genera link cliente');
r = await anon(`/view-links/${token}`);
ok(r.status === 200 && r.data.settings.branding.name === 'Mi Tienda', 'link público trae la configuración del dueño');
ok(!JSON.stringify(r.data).includes('docs.google.com') && r.data.sheet.sheet_id === undefined, 'link público no expone el Sheet');
ok(!r.data.sheet.facets.warehouses, 'link público no expone almacenes');
r = await anon(`/view-links/${token}/products?group_by=name&limit=48`);
const p0 = r.data.items[0]._groupItems[0];
ok(r.data.total === 600 && p0.precio && !p0.ubicacion && !p0.almacen && !p0.stock && !p0.raw, 'producto público sin campos internos', p0);
r = await anon(`/view-links/${token}/products?group_by=name&warehouse=Principal`);
ok(r.data.total === 600, 'público ignora filtro de almacén oculto');
r = await anon(`/view-links/${token}/catalog-index`);
ok(r.status === 200 && r.data.categories.length > 0, 'índice público');

// Rotar link
r = await admin(`/branches/${branchId}/view-link`, { method: 'POST', body: JSON.stringify({ rotate: true }) });
const token2 = r.data.token;
r = await anon(`/view-links/${token}`);
ok(token2 !== token && r.status === 404, 'regenerar link invalida el anterior');

// v72: búsqueda pública sin ubicación
r = await admin(`/branches/${branchId}/products?group_by=name&q=Z1-R`);
const adminLoc = r.data.total;
r = await anon(`/view-links/${token2}/products?group_by=name&q=Z1-R`);
ok(adminLoc > 0 && r.data.total === 0, 'el cliente no encuentra productos por ubicación', { adminLoc, pub: r.data.total });
r = await anon(`/view-links/${token2}/products?group_by=name&q=casaca`);
ok(r.data.total === 60, 'el cliente sí busca por nombre');

// v72: WhatsApp y sincronización
r = await admin('/settings', { method: 'PUT', body: JSON.stringify({ business: { whatsapp: '123' } }) });
ok(r.status === 400, 'rechaza WhatsApp inválido');
r = await admin('/settings', { method: 'PUT', body: JSON.stringify({ business: { whatsapp: '+51 987 654 321', sync_hours: 6 } }) });
ok(r.status === 200 && r.data.business.whatsapp === '51987654321' && r.data.business.sync_hours === 6, 'guarda WhatsApp y frecuencia');
r = await admin('/settings', { method: 'PUT', body: JSON.stringify({ business: { sync_hours: 5 } }) });
ok(r.status === 400, 'rechaza frecuencia no permitida');
r = await anon(`/view-links/${token2}`);
ok(r.data.settings.business.whatsapp === '51987654321' && r.data.settings.business.sync_hours === undefined, 'el cliente ve el WhatsApp pero no la sincronización');
r = await admin(`/branches/${branchId}/sheet`);
ok(!!r.data.config.last_import_at, 'fecha de última importación');

// v72: dos importaciones a la vez no dejan el catálogo a medias
const body = JSON.stringify({ sheet_map_rows: mapping });
const [i1, i2] = await Promise.all([
  admin(`/branches/${branchId}/import`, { method: 'POST', body }),
  admin(`/branches/${branchId}/import`, { method: 'POST', body })
]);
ok([i1.status, i2.status].includes(200) && [i1.status, i2.status].every((st) => st === 200 || st === 409), 'importaciones simultáneas: una espera (409)', [i1.status, i2.status]);
r = await admin(`/branches/${branchId}/products?group_by=name`);
ok(r.data.group_total_products === 3000, 'catálogo íntegro tras importaciones simultáneas', r.data.group_total_products);

// Accesos anónimos y viewer
r = await anon('/app-state');
ok(r.status === 401, 'app-state exige sesión');
r = await anon(`/drive-video?id=IMG00001abcdefgh`);
ok(r.status === 401, 'proxy de video exige sesión o link');
r = await viewer('/viewer-login', { method: 'POST', body: '{}' });
ok(r.status === 200 && r.data.role === 'viewer', 'entrar como viewer sin credenciales');
r = await viewer('/app-state', { method: 'POST', body: JSON.stringify({ admin: { company: 'hackeado' } }) });
ok(r.status === 403, 'viewer no puede escribir app-state');
r = await viewer(`/branches/${branchId}/sheet`);
ok(r.status === 403, 'viewer no ve configuración del Sheet');
r = await viewer(`/branches/${branchId}/products?group_by=name`);
const vp = r.data.items?.[0]?._groupItems?.[0] || {};
ok(r.status === 200 && !vp.ubicacion && !vp.almacen, 'viewer recibe productos filtrados');
r = await viewer(`/sheets/probe?url=x&sheet=y`);
ok(r.status === 403, 'viewer no puede usar /sheets');
r = await viewer('/settings');
ok(r.status === 200 && r.data.branding.name === 'Mi Tienda', 'viewer lee la configuración');
r = await viewer('/settings', { method: 'PUT', body: JSON.stringify({ branding: { name: 'x' } }) });
ok(r.status === 403, 'viewer no modifica configuración');

// CSRF
r = await admin('/settings', { method: 'PUT', headers: { origin: 'https://evil.example' }, body: JSON.stringify({ branding: { name: 'x' } }) });
ok(r.status === 403, 'bloquea escrituras de otro origen');

// Sucursal nueva + migración de datos antiguos
r = await admin('/branches', { method: 'POST', body: JSON.stringify({ name: 'Lince' }) });
const b2 = r.data.branch?.id;
ok(!!b2, 'crear sucursal');
r = await admin(`/branches/${b2}/sheet`, { method: 'POST', body: JSON.stringify({ imported_products: [{ nombre: 'Legacy A', talla: 'M', raw: { x: 1 } }, { nombre: 'Legacy A', talla: 'L' }] }) });
ok(r.status === 200 && r.data.stored_products === 2, 'flujo antiguo con imported_products');
r = await admin(`/branches/${b2}/view-link`, { method: 'POST', body: '{}' });
const t3 = r.data.token;
r = await admin(`/branches/${b2}`, { method: 'DELETE' });
ok(r.status === 200, 'eliminar sucursal');
r = await anon(`/view-links/${t3}/products`);
ok(r.status === 404, 'link de sucursal eliminada queda inactivo');

// Errores sin detalles internos
r = await admin('/no-existe');
ok(r.status === 404 && !r.data.debug, 'sin bloque debug');

// Límite de intentos
const brute = client();
let last;
for (let i = 0; i < 9; i += 1) last = await brute('/login', { method: 'POST', body: JSON.stringify({ username: 'otro', password: 'mal' + i }) });
ok(last.status === 429, 'bloqueo tras intentos fallidos', last.data);

// Cambio de contraseña
r = await admin('/password', { method: 'POST', body: JSON.stringify({ current: 'admin123', next: '123' }) });
ok(r.status === 400, 'rechaza contraseña débil');
r = await admin('/password', { method: 'POST', body: JSON.stringify({ current: 'admin123', next: 'NuevaClave#2026' }) });
ok(r.status === 200, 'cambia contraseña');
const again = client();
r = await again('/login', { method: 'POST', body: JSON.stringify({ username: 'admin', password: 'NuevaClave#2026' }) });
ok(r.status === 200 && r.data.weak_password === false, 'login con nueva contraseña');
r = await again('/password', { method: 'POST', body: JSON.stringify({ current: 'NuevaClave#2026', next: 'admin123x' }) });
r = await again('/password', { method: 'POST', body: JSON.stringify({ current: 'admin123x', next: 'admin12345' }) });
ok(r.status === 200, 'restaura contraseña de prueba');

console.log(failures ? `\n${failures} fallo(s)` : '\nTodo OK');
process.exit(failures ? 1 : 0);
