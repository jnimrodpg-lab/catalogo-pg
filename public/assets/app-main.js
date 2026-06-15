(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const API = '/api';
  const PAGE_SIZE = 48;


  const DEFAULT_UI_CONFIG = {
    sku:true, marca:true, categoria:true, talla:true, color:true, ubicacion:false, almacen:false,
    stock:false, precio:false, request:true
  };

  function loadClientConfig() {
    try { return { ...DEFAULT_UI_CONFIG, ...JSON.parse(localStorage.getItem('catalogoClientUiConfig') || '{}') }; }
    catch { return { ...DEFAULT_UI_CONFIG }; }
  }

  function saveClientConfig() {
    localStorage.setItem('catalogoClientUiConfig', JSON.stringify(state.uiConfig || DEFAULT_UI_CONFIG));
  }

  function loadRequestCart() {
    try { return JSON.parse(sessionStorage.getItem('catalogoRequestCart') || '[]'); }
    catch { return []; }
  }

  function saveRequestCart() {
    sessionStorage.setItem('catalogoRequestCart', JSON.stringify(state.requestItems || []));
  }

  const state = {
    auth: null,
    publicMode: false,
    token: '',
    branches: [],
    branchId: null,
    products: [],
    facets: {},
    summary: {},
    page: 1,
    totalPages: 1,
    total: 0,
    selected: null,
    currentGroups: [],
    groupTotalProducts: 0,
    authMode: 'login',
    headers: [],
    mapping: {},
    sidebarCollapsed: localStorage.getItem('catalogoSidebarCollapsed') === '1',
    uiConfig: loadClientConfig(),
    requestItems: loadRequestCart(),
    adminPanelOpen: false,
    categoryAudience: 'all',
    categoryAudienceFilter: '',
    categoryBrowserProducts: [],
    categoryBrowserPage: 1,
    categoryQuickFiltersOpen: false,
    variantFilters: { size:'', color:'' }
  };

  const fields = [
    ['sku', 'SKU', ['sku', 'código sku', 'codigo sku']],
    ['nombre', 'Nombre del producto', ['nombre', 'producto', 'descripcion', 'descripción', 'name']],
    ['variante', 'Variante', ['variante', 'modelo', 'cod / modelo', 'cod/modelo', 'codigo modelo']],
    ['marca', 'Marca', ['marca', 'brand']],
    ['categoria', 'Categoría', ['categoria', 'categoría', 'category']],
    ['genero', 'Género', ['genero', 'género']],
    ['estado', 'Estado', ['estado']],
    ['grosor', 'Grosor', ['grosor']],
    ['talla', 'Talla', ['talla', 'size']],
    ['color', 'Color', ['color']],
    ['linea', 'Línea', ['linea', 'línea']],
    ['barras', 'Código de barras', ['barras', 'barcode', 'codigo de barras', 'código de barras']],
    ['ubicacion', 'Ubicación', ['ubicacion', 'ubicación', 'location']],
    ['zona', 'Zona', ['zona']],
    ['estante', 'Estante', ['estante', 'rack']],
    ['nivel', 'Nivel', ['nivel']],
    ['slot', 'Slot', ['slot']],
    ['almacen', 'Almacén', ['almacen', 'almacén', 'warehouse']],
    ['precio', 'Precio', ['p.lista(+igv)', 'precio', 'p lista', 'lista']],
    ['stock', 'Stock / Cantidad', ['cant. restock', 'stock', 'cantidad', 'cant']],
    ['imagen', 'Imagen', ['imagen', 'foto', 'image', 'url imagen', 'link imagen']],
    ['video', 'Video', ['video', 'link video', 'url video']]
  ];

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
  }

  function norm(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }



  function toast(message, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toastStack').appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  async function api(path, options = {}) {
    const res = await fetch(API + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `Error ${res.status}`);
    return data;
  }

  function parseSheetId(input) {
    const text = String(input || '').trim();
    const match = text.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : text;
  }

  function getBranch() {
    return state.branches.find(b => String(b.id) === String(state.branchId)) || state.branches[0] || null;
  }

  function isAdmin() { return !!state.auth && String(state.auth.role || '').toLowerCase() === 'admin'; }
  function isViewer() { return state.publicMode || (!!state.auth && String(state.auth.role || '').toLowerCase() !== 'admin'); }

  function setView(name) {
    if ((name === 'sheet' || name === 'settings') && !isAdmin()) name = 'catalog';
    $$('.view').forEach(v => v.classList.remove('active'));
    $(`#view${name[0].toUpperCase() + name.slice(1)}`)?.classList.add('active');
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
  }

  function hydrateSessionLabel() {
    const pill = $('#sessionPill');
    if (state.publicMode) {
      pill.textContent = 'Modo viewer · link público';
      $('#adminNav').classList.add('hidden');
      $('#btnAuth').classList.add('hidden');
      $('#btnGoSheet').classList.add('hidden');
      $('#btnShareViewer').classList.add('hidden');
      document.body.classList.add('viewer-mode');
      document.body.classList.remove('is-admin','admin-panel-open');
      state.adminPanelOpen = false;
      hydrateViewerTopbar();
      return;
    }
    const logged = !!state.auth;
    const admin = isAdmin();
    pill.textContent = logged ? `${state.auth.user} · ${admin ? 'admin' : 'viewer'}` : 'Sin sesión';
    $('#btnAuth').textContent = logged ? 'Cerrar sesión' : 'Ingresar';
    $('#adminNav').classList.toggle('hidden', !admin);
    $('#btnGoSheet').classList.toggle('hidden', !admin);
    $('#btnShareViewer').classList.toggle('hidden', !admin);
    document.body.classList.toggle('viewer-mode', logged && !admin);
    document.body.classList.toggle('is-admin', admin);
    if (!admin) { state.adminPanelOpen = false; applyAdminPanelState(); }
    hydrateViewerTopbar();
    if (logged && !admin) setView('catalog');
  }

  async function init() {
    const m = location.pathname.match(/^\/viewer\/([^/]+)/);
    if (m) {
      state.publicMode = true;
      state.token = decodeURIComponent(m[1]);
      $('#authModal').classList.remove('show');
      await loadPublicViewer();
      bindEvents();
      hydrateSessionLabel();
      return;
    }

    bindEvents();
    try {
      state.auth = await api('/session');
      $('#authModal').classList.remove('show');
      await loadBranches();
    } catch {
      hydrateSessionLabel();
      $('#authModal').classList.add('show');
      renderEmptyState('Ingresa como administrador para vincular un Sheet o usa un link público de cliente.');
    }
  }

  function bindEvents() {
    $$('.nav-item').forEach(btn => btn.addEventListener('click', () => { setView(btn.dataset.view); }));
    $('#btnToggleSidebar')?.addEventListener('click', closeAdminPanel);
    $('#btnOpenAdminPanel')?.addEventListener('click', openAdminPanel);
    $('#adminPanelScrim')?.addEventListener('click', closeAdminPanel);
    applyAdminPanelState();
    $('#btnGoSheet').addEventListener('click', () => { openAdminPanel(); setView('sheet'); });
    $('#btnAuth').addEventListener('click', authAction);
    $('#btnCloseAuth').addEventListener('click', () => $('#authModal').classList.remove('show'));
    $('#btnDoAuth').addEventListener('click', doAuth);
    $$('.auth-tab').forEach(btn => btn.addEventListener('click', () => setAuthMode(btn.dataset.authMode)));
    $('#branchSelect').addEventListener('change', async () => { state.branchId = $('#branchSelect').value; state.categoryBrowserProducts = []; state.page = 1; await loadSheetConfig(); await loadProducts(); });
    $('#viewerBranchSelect')?.addEventListener('change', async () => { state.branchId = $('#viewerBranchSelect').value; $('#branchSelect').value = state.branchId; state.categoryBrowserProducts = []; state.page = 1; if (state.publicMode) renderLocalPublicProducts(); else await loadProducts(); });
    $('#btnReloadProducts').addEventListener('click', () => loadProducts());
    $('#btnSearch').addEventListener('click', () => { state.page = 1; loadProducts(); });
    $('#btnIndividualView')?.addEventListener('click', () => openActiveProductCard());
    $('#searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') { state.page = 1; loadProducts(); } });
    ['filterBrand','filterCategory','filterWarehouse','filterImage'].forEach(id => $(`#${id}`).addEventListener('change', () => { state.page = 1; loadProducts(); renderAppliedFilters(); }));
    const clearFiltersAction = () => { resetAllFilters(false); state.page = 1; loadProducts(); };
    $('#btnClearFilters')?.addEventListener('click', clearFiltersAction);
    $('#btnHiddenClearFilters')?.addEventListener('click', clearFiltersAction);
    $('#btnPrevPage').addEventListener('click', () => { if (state.page > 1) { state.page--; loadProducts(); } });
    $('#btnNextPage').addEventListener('click', () => { if (state.page < state.totalPages) { state.page++; loadProducts(); } });
    $('#btnProbeSheet').addEventListener('click', probeSheet);
    $('#btnImportSheet').addEventListener('click', importSheet);
    $('#btnCreateBranch').addEventListener('click', createBranch);
    $('#btnShareViewer').addEventListener('click', generateViewerLink);
    $('#btnCopyViewer').addEventListener('click', generateViewerLink);
    $('#btnOpenProductViewer')?.addEventListener('click', e => { e.stopPropagation(); openActiveProductCard(); });
    $('#activeProductCard')?.addEventListener('click', e => {
      if (e.target.closest('button, select, input, textarea, a, video, iframe')) return;
      openActiveProductCard();
    });
    $('#btnCopyProductInfo')?.addEventListener('click', e => { e.stopPropagation(); copySelectedProductInfo(); });
    $('#btnShareWhatsApp')?.addEventListener('click', e => { e.stopPropagation(); addSelectedToRequest(); });
    $('#btnRequestFloating')?.addEventListener('click', openRequestDrawer);
    $('#btnCloseRequestDrawer')?.addEventListener('click', closeRequestDrawer);
    $('#btnClearRequest')?.addEventListener('click', clearRequestCart);
    $('#btnCopyRequest')?.addEventListener('click', copyRequestCart);
    $('#btnSendRequest')?.addEventListener('click', sendRequestCart);
    bindClientConfigControls();
    $('#btnScanFake')?.addEventListener('click', () => toast('Puedes pegar o escanear el código con un lector físico en la barra de búsqueda.'));
    $('#btnOpenCategoryBrowser')?.addEventListener('click', openCategoryBrowser);
    $('#btnCloseCategoryBrowser')?.addEventListener('click', closeCategoryBrowser);
    $('#categoryBrowser')?.addEventListener('click', e => { if (e.target?.id === 'categoryBrowser') closeCategoryBrowser(); });
    $$('.category-audience-chip').forEach(btn => btn.addEventListener('click', () => { state.categoryAudience = btn.dataset.audience || 'all'; state.categoryBrowserPage = 1; renderCategoryBrowser(); }));
    $('#btnApplyQuickFilters')?.addEventListener('click', applyQuickFiltersFromModal);
    $('#btnResetQuickFilters')?.addEventListener('click', () => { resetQuickFiltersUI(); renderQuickFilterOptions(categorySourceProducts()); });
    $('#btnToggleCategoryFilters')?.addEventListener('click', toggleCategoryQuickFilters);
    $('#searchCardOverlay')?.addEventListener('click', closeActiveProductCard);
    $('#activeProductCardClose')?.addEventListener('click', e => { e.stopPropagation(); closeActiveProductCard(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeActiveProductCard(); closeRequestDrawer(); closeCategoryBrowser(); } if ($('#activeProductCard')?.classList.contains('search-card-expanded')) handleExpandedKeys(e); });
    renderRequestCart();
    renderAppliedFilters();
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    $$('.auth-tab').forEach(b => b.classList.toggle('active', b.dataset.authMode === mode));
    $$('.register-only').forEach(el => el.classList.toggle('hidden', mode !== 'register'));
    $('#btnDoAuth').textContent = mode === 'register' ? 'Crear cuenta' : 'Ingresar';
    $('#authStatus').textContent = '';
  }

  async function authAction() {
    if (state.auth) {
      try { await api('/logout', { method:'POST', body:'{}' }); } catch {}
      state.auth = null;
      state.branches = [];
      state.products = [];
      hydrateSessionLabel();
      $('#authModal').classList.add('show');
      renderEmptyState('Sesión cerrada.');
      return;
    }
    $('#authModal').classList.add('show');
  }

  async function doAuth() {
    const payload = {
      username: $('#loginUsername').value.trim(),
      password: $('#loginPassword').value,
      mode: $('#accountRole')?.value || 'admin',
      companyName: $('#companyName').value.trim(),
      companyCode: $('#companyCode').value.trim()
    };
    $('#authStatus').textContent = 'Validando...';
    try {
      state.auth = await api(state.authMode === 'register' ? '/register' : '/login', { method:'POST', body: JSON.stringify(payload) });
      $('#authModal').classList.remove('show');
      $('#authStatus').textContent = '';
      await loadBranches();
      toast('Acceso correcto.');
    } catch (err) {
      $('#authStatus').textContent = err.message;
    }
  }

  async function loadBranches() {
    const data = await api('/branches');
    state.branches = data.branches || [];
    if (!state.branchId && state.branches[0]) state.branchId = state.branches[0].id;
    renderBranches();
    hydrateSessionLabel();
    await loadSheetConfig();
    await loadProducts();
  }

  async function loadPublicViewer() {
    try {
      const data = await api(`/view-links/${encodeURIComponent(state.token)}`);
      const branch = data.branch || { id:'public', name:'Catálogo' };
      state.branches = [branch];
      state.branchId = branch.id;
      state.products = [];
      state.summary = data.sheet?.summary || { total: Number(data.sheet?.product_count || 0), with_image: 0, with_stock: 0 };
      state.facets = data.sheet?.facets || {};
      state.categoryBrowserProducts = [];
      renderBranches();
      await loadProducts();
      const company = branch.name || 'Catálogo';
      $('#brandName').textContent = company;
    } catch (err) {
      renderEmptyState(err.message || 'No se pudo abrir el link público.');
    }
  }

  function renderBranches() {
    const options = state.branches.map(b => `<option value="${esc(b.id)}">${esc(b.name || 'Sucursal')}</option>`).join('');
    const select = $('#branchSelect');
    if (select) {
      select.innerHTML = options;
      if (state.branchId) select.value = state.branchId;
    }
    const viewerSelect = $('#viewerBranchSelect');
    if (viewerSelect) {
      viewerSelect.innerHTML = options;
      if (state.branchId) viewerSelect.value = state.branchId;
      viewerSelect.classList.toggle('hidden', state.branches.length <= 1);
    }
    const b = getBranch();
    if (b) {
      $('#brandSubtitle').textContent = b.name || 'Catálogo';
    }
    hydrateViewerTopbar();
    updateAdminChecklist();
  }

  async function loadSheetConfig() {
    if (state.publicMode || !state.branchId || !state.auth) return;
    try {
      const data = await api(`/branches/${state.branchId}/sheet`);
      const cfg = data.config || {};
      $('#sheetUrl').value = cfg.sheet_id || '';
      $('#sheetName').value = cfg.sheet_name || 'Productos';
      state.headers = cfg.sheet_headers || [];
      state.mapping = normalizeMapping(cfg.sheet_map_rows || cfg.mapping || {});
      $('#sheetStatus').textContent = state.headers.length ? `${state.headers.length} encabezados · ${Number(cfg.last_sheet_count || 0)} productos` : 'Sin encabezados';
      renderMapping();
    } catch (err) {
      $('#sheetStatus').textContent = err.message;
    }
  }


  function inferAudience(product) {
    const hay = norm([val(product,'genero'), val(product,'categoria'), val(product,'nombre'), val(product,'variante')].filter(Boolean).join(' '));
    if (!hay) return 'all';
    if (/(nina|niña|girl|junior mujer)/.test(hay)) return 'nina';
    if (/(nino|niño|boy|junior varon)/.test(hay)) return 'nino';
    if (/(mujer|dama|femen|lady|women|ropa interior mujer)/.test(hay)) return 'mujer';
    if (/(varon|varón|hombre|caballero|mascul|men)/.test(hay)) return 'varon';
    if (/(bebe|bebé|baby|infant)/.test(hay)) return 'bebe';
    if (/(unisex)/.test(hay)) return 'unisex';
    return 'all';
  }

  function audienceLabel(key) {
    return ({ all:'Todo', mujer:'Mujer', varon:'Varón', nino:'Niño', nina:'Niña', bebe:'Bebé', unisex:'Unisex' })[key] || 'Todo';
  }

  function categorySourceProducts() {
    if (Array.isArray(state.categoryBrowserProducts) && state.categoryBrowserProducts.length) return state.categoryBrowserProducts;
    if (state.publicMode && Array.isArray(state.products) && state.products.length) return state.products;
    if (Array.isArray(state.currentGroups) && state.currentGroups.length) return state.currentGroups.flatMap(p => p._groupItems || [p]);
    return Array.isArray(state.products) ? state.products.flatMap(p => p._groupItems || [p]) : [];
  }

  async function hydrateCategoryBrowserProducts(force = false) {
    if (!force && Array.isArray(state.categoryBrowserProducts) && state.categoryBrowserProducts.length) return state.categoryBrowserProducts;
    if (state.publicMode && state.token) {
      try {
        const params = new URLSearchParams({ page: '1', limit: '5000', group_by: 'name' });
        const data = await api(`/view-links/${encodeURIComponent(state.token)}/products?${params}`);
        state.categoryBrowserProducts = (data.items || []).flatMap(p => p._groupItems || [p]);
        if (state.categoryBrowserProducts.length) return state.categoryBrowserProducts;
      } catch (err) {
        console.warn('No se pudo precargar categorías públicas', err);
      }
      state.categoryBrowserProducts = Array.isArray(state.products) ? state.products.slice() : [];
      return state.categoryBrowserProducts;
    }
    if (state.branchId && state.auth) {
      try {
        const params = new URLSearchParams({ page: '1', limit: '5000', group_by: 'name' });
        const data = await api(`/branches/${state.branchId}/products?${params}`);
        state.categoryBrowserProducts = (data.items || []).flatMap(p => p._groupItems || [p]);
        if (state.categoryBrowserProducts.length) return state.categoryBrowserProducts;
      } catch (err) {
        console.warn('No se pudo precargar categorías completas', err);
      }
    }
    state.categoryBrowserProducts = categorySourceProducts().slice();
    return state.categoryBrowserProducts;
  }

  function updateCategoryQuickFiltersVisibility() {
    const wrapper = $('#categoryQuickFilters');
    const btn = $('#btnToggleCategoryFilters');
    const open = !!state.categoryQuickFiltersOpen;
    if (wrapper) {
      wrapper.classList.toggle('is-collapsed', !open);
      wrapper.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    if (btn) {
      btn.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Ocultar filtros' : 'Mostrar filtros';
    }
  }

  function toggleCategoryQuickFilters(force) {
    state.categoryQuickFiltersOpen = typeof force === 'boolean' ? force : !state.categoryQuickFiltersOpen;
    updateCategoryQuickFiltersVisibility();
  }

  function categoryCardThumb(product, idx = 0) {
    const src = val(product,'imagen') || val(product,'video');
    if (!src) return `<div class="category-tile-placeholder">${esc((val(product,'categoria') || val(product,'nombre') || 'Categoría').slice(0,1).toUpperCase())}</div>`;
    const id = driveId(src);
    const img = id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w800` : src;
    return `<img src="${esc(img)}" alt="${esc(val(product,'categoria') || 'Categoría')}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;category-tile-placeholder&quot;>${esc((val(product,'categoria') || 'C').slice(0,1).toUpperCase())}</div>'">`;
  }

  function renderCategoryBrowser() {
    const modal = $('#categoryBrowser');
    const grid = $('#categoryBrowserGrid');
    const toolbar = $('#categoryBrowserToolbar');
    if (!modal || !grid) return;
    const audience = state.categoryAudience || 'all';
    $$('.category-audience-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.audience === audience));
    const source = categorySourceProducts();
    const map = new Map();
    source.forEach((product, idx) => {
      const category = val(product,'categoria') || 'Sin categoría';
      const key = norm(category) || 'sin-categoria';
      const hitAudience = inferAudience(product);
      if (audience !== 'all' && hitAudience !== audience) return;
      if (!map.has(key)) map.set(key, { key, category, audience: hitAudience, items: [], familyKeys: new Set(), sample: null, idx });
      const entry = map.get(key);
      entry.items.push(product);
      entry.familyKeys.add(productGroupKey(product) || `family-${idx}`);
      if (!entry.sample || mediaUrl(product)) entry.sample = product;
    });

    const allItems = [...map.values()].sort((a,b) => String(a.category).localeCompare(String(b.category), 'es'));
    const visualItems = allItems.filter(entry => mediaUrl(entry.sample || entry.items[0] || {}));
    const items = visualItems.length ? visualItems : allItems;
    const perPage = 8;
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    state.categoryBrowserPage = Math.min(Math.max(state.categoryBrowserPage || 1, 1), totalPages);
    const currentPage = state.categoryBrowserPage;
    const start = (currentPage - 1) * perPage;
    const pageItems = items.slice(start, start + perPage);

    renderQuickFilterOptions(source);
    updateCategoryQuickFiltersVisibility();

    if (toolbar) {
      const rangeStart = items.length ? start + 1 : 0;
      const rangeEnd = Math.min(start + perPage, items.length);
      toolbar.innerHTML = `
        <div class="category-browser-toolbar-copy">
          <strong>Categorías visuales</strong>
          <span>Mostrando ${esc(String(rangeStart))}-${esc(String(rangeEnd))} de ${esc(String(items.length))} categorías${visualItems.length && visualItems.length !== allItems.length ? ' con imagen' : ''}.</span>
        </div>
        <div class="category-browser-pager" aria-label="Navegación de categorías">
          <button type="button" class="category-page-btn" id="categoryPagePrev" ${currentPage <= 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>
          <span class="category-page-indicator">${esc(String(currentPage))} / ${esc(String(totalPages))}</span>
          <button type="button" class="category-page-btn" id="categoryPageNext" ${currentPage >= totalPages ? 'disabled' : ''} aria-label="Página siguiente">›</button>
        </div>`;
      $('#categoryPagePrev', toolbar)?.addEventListener('click', () => {
        if (state.categoryBrowserPage > 1) {
          state.categoryBrowserPage -= 1;
          renderCategoryBrowser();
        }
      });
      $('#categoryPageNext', toolbar)?.addEventListener('click', () => {
        if (state.categoryBrowserPage < totalPages) {
          state.categoryBrowserPage += 1;
          renderCategoryBrowser();
        }
      });
    }

    if (!items.length) {
      grid.innerHTML = `<div class="category-browser-empty">No encontramos categorías para ${esc(audienceLabel(audience).toLowerCase())}. Prueba con otro filtro.</div>`;
      return;
    }

    grid.innerHTML = pageItems.map((entry, idx) => {
      const sample = entry.sample || entry.items[0] || {};
      return `<button type="button" class="category-tile" data-category="${esc(entry.category)}" data-audience="${esc(audience)}">
        <div class="category-tile-media">${categoryCardThumb(sample, idx)}</div>
        <div class="category-tile-body">
          <strong>${esc(entry.category)}</strong>
          <small>${esc(String(entry.familyKeys?.size || entry.items.length))} familia(s)</small>
        </div>
      </button>`;
    }).join('');
    $$('.category-tile', grid).forEach(btn => btn.addEventListener('click', () => applyCategorySelection(btn.dataset.category || '', btn.dataset.audience || 'all')));
  }

  function resetAllFilters(includeSearch = false) {
    if (includeSearch && $('#searchInput')) $('#searchInput').value = '';
    ['filterBrand','filterCategory','filterWarehouse','filterImage'].forEach(id => { const el = $(`#${id}`); if (el) el.value = ''; });
    state.categoryAudienceFilter = '';
    state.variantFilters = { size:'', color:'' };
    resetQuickFiltersUI();
    renderAppliedFilters();
  }

  function buildQuickFilterFacets(source) {
    const scoped = (source || []).filter(product => {
      const audience = state.categoryAudience || 'all';
      if (audience === 'all') return true;
      return inferAudience(product) === audience;
    });
    const uniqueSorted = (arr) => [...new Map(arr.filter(Boolean).map(v => [norm(v), v])).values()].sort((a,b) => String(a).localeCompare(String(b), 'es'));
    const counts = (key) => {
      const map = new Map();
      scoped.forEach(p => {
        const value = val(p,key);
        if (!value) return;
        const id = norm(value);
        map.set(id, { label:value, count:(map.get(id)?.count || 0) + 1 });
      });
      return [...map.values()].sort((a,b) => b.count - a.count || String(a.label).localeCompare(String(b.label), 'es'));
    };
    return {
      brands: uniqueSorted(scoped.map(p => val(p,'marca'))),
      categories: uniqueSorted(scoped.map(p => val(p,'categoria'))),
      sizes: uniqueSorted(scoped.map(p => val(p,'talla'))),
      colors: uniqueSorted(scoped.map(p => val(p,'color'))),
      warehouses: uniqueSorted(scoped.map(p => val(p,'almacen'))),
      brandCounts: counts('marca').slice(0,6),
      colorCounts: counts('color').slice(0,8)
    };
  }

  function fillQuickSelect(id, placeholder, values, current = '') {
    const el = $(`#${id}`);
    if (!el) return;
    el.innerHTML = `<option value="">${esc(placeholder)}</option>` + (values || []).map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    el.value = current || '';
  }

  function syncQuickFiltersFromState() {
    const mappings = {
      categoryQuickBrand: $('#filterBrand')?.value || '',
      categoryQuickWarehouse: $('#filterWarehouse')?.value || '',
      categoryQuickImage: $('#filterImage')?.value || '',
      categoryQuickSize: state.variantFilters.size || '',
      categoryQuickColor: state.variantFilters.color || ''
    };
    Object.entries(mappings).forEach(([id, value]) => { const el = $(`#${id}`); if (el) el.value = value; });
  }

  function renderQuickChipButtons(hostId, items, type) {
    const host = $(`#${hostId}`);
    if (!host) return;
    if (!(items || []).length) {
      host.innerHTML = '<span class="quick-chip-empty">Sin opciones</span>';
      return;
    }
    const current = type === 'brand' ? ($('#filterBrand')?.value || '') : (state.variantFilters.color || '');
    host.innerHTML = items.map(item => {
      const label = item.label || item;
      const count = item.count != null ? `<small>${item.count}</small>` : '';
      const active = norm(label) === norm(current);
      const colorStyle = type === 'color' ? chipStyle(label) : '';
      return `<button type="button" class="quick-filter-chip ${active ? 'active' : ''} ${type === 'color' ? 'is-color' : ''}" data-chip-type="${esc(type)}" data-chip-value="${esc(label)}" style="${colorStyle}">${esc(label)}${count}</button>`;
    }).join('');
    $$('[data-chip-type]', host).forEach(btn => btn.addEventListener('click', () => {
      const type = btn.dataset.chipType;
      const value = btn.dataset.chipValue || '';
      if (type === 'brand') {
        const currentValue = $('#categoryQuickBrand')?.value || '';
        $('#categoryQuickBrand').value = norm(currentValue) === norm(value) ? '' : value;
      } else if (type === 'color') {
        const currentValue = $('#categoryQuickColor')?.value || '';
        $('#categoryQuickColor').value = norm(currentValue) === norm(value) ? '' : value;
      }
      renderQuickFilterOptions(categorySourceProducts());
    }));
  }

  function renderQuickFilterOptions(source) {
    const facets = buildQuickFilterFacets(source);
    fillQuickSelect('categoryQuickBrand', 'Seleccionar', facets.brands, $('#categoryQuickBrand')?.value || $('#filterBrand')?.value || '');
    fillQuickSelect('categoryQuickSize', 'Seleccionar', facets.sizes, $('#categoryQuickSize')?.value || state.variantFilters.size || '');
    fillQuickSelect('categoryQuickColor', 'Seleccionar', facets.colors, $('#categoryQuickColor')?.value || state.variantFilters.color || '');
    fillQuickSelect('categoryQuickWarehouse', 'Seleccionar', facets.warehouses, $('#categoryQuickWarehouse')?.value || $('#filterWarehouse')?.value || '');
    fillQuickSelect('categoryQuickImage', 'Todos', ['with','without'].map(v => v === 'with' ? 'Con imagen' : 'Sin imagen'));
    const imageSelect = $('#categoryQuickImage');
    if (imageSelect) {
      imageSelect.innerHTML = '<option value="">Todos</option><option value="with">Con imagen</option><option value="without">Sin imagen</option>';
      imageSelect.value = $('#filterImage')?.value || '';
    }
    renderQuickChipButtons('quickBrandChips', facets.brandCounts, 'brand');
    renderQuickChipButtons('quickColorChips', facets.colorCounts, 'color');
  }

  function resetQuickFiltersUI() {
    ['categoryQuickBrand','categoryQuickSize','categoryQuickColor','categoryQuickWarehouse','categoryQuickImage'].forEach(id => { const el = $(`#${id}`); if (el) el.value = ''; });
  }

  function applyQuickFiltersFromModal() {
    const brand = $('#categoryQuickBrand')?.value || '';
    const size = $('#categoryQuickSize')?.value || '';
    const color = $('#categoryQuickColor')?.value || '';
    const warehouse = $('#categoryQuickWarehouse')?.value || '';
    const imageState = $('#categoryQuickImage')?.value || '';
    if ($('#filterBrand')) $('#filterBrand').value = brand;
    if ($('#filterWarehouse')) $('#filterWarehouse').value = warehouse;
    if ($('#filterImage')) $('#filterImage').value = imageState;
    state.variantFilters = { size, color };
    state.page = 1;
    closeCategoryBrowser();
    renderAppliedFilters();
    loadProducts();
  }

  function renderAppliedFilters() {
    const host = $('#appliedFiltersList');
    if (!host) return;
    const filters = [];
    const pushFilter = (type, label, value, style='') => { if (value) filters.push({ type, label, value, style }); };
    pushFilter('brand', 'Marca', $('#filterBrand')?.value || '');
    pushFilter('category', 'Categoría', $('#filterCategory')?.value || '');
    pushFilter('warehouse', 'Almacén', $('#filterWarehouse')?.value || '');
    const imageValue = $('#filterImage')?.value || '';
    pushFilter('image', 'Imagen', imageValue === 'with' ? 'Con imagen' : imageValue === 'without' ? 'Sin imagen' : '');
    pushFilter('size', 'Talla', state.variantFilters.size || '');
    pushFilter('color', 'Color', state.variantFilters.color || '', chipStyle(state.variantFilters.color || ''));
    if (!filters.length) {
      host.innerHTML = '<span class="applied-filter-empty">Sin filtros activos</span>';
      return;
    }
    host.innerHTML = filters.map(item => `<button type="button" class="applied-filter-chip ${item.type === 'color' ? 'is-color' : ''}" data-remove-filter="${esc(item.type)}" style="${item.style || ''}"><span>${esc(item.label)}: ${esc(item.value)}</span><b>×</b></button>`).join('');
    $$('[data-remove-filter]', host).forEach(btn => btn.addEventListener('click', () => removeAppliedFilter(btn.dataset.removeFilter)));
  }

  function removeAppliedFilter(type) {
    const resetters = {
      brand: () => $('#filterBrand') && ($('#filterBrand').value = ''),
      category: () => { if ($('#filterCategory')) $('#filterCategory').value = ''; state.categoryAudienceFilter = ''; },
      warehouse: () => $('#filterWarehouse') && ($('#filterWarehouse').value = ''),
      image: () => $('#filterImage') && ($('#filterImage').value = ''),
      size: () => state.variantFilters.size = '',
      color: () => state.variantFilters.color = ''
    };
    resetters[type]?.();
    syncQuickFiltersFromState();
    renderAppliedFilters();
    state.page = 1;
    loadProducts();
  }

  function filterGroupedProductsByVariants(groups) {
    const wantedSize = norm(state.variantFilters.size || '');
    const wantedColor = norm(state.variantFilters.color || '');
    if (!wantedSize && !wantedColor) return groups || [];
    return (groups || []).map(group => {
      const items = group?._groupItems?.length ? group._groupItems : [group];
      const matches = items.filter(item => {
        if (wantedSize && norm(val(item,'talla')) !== wantedSize) return false;
        if (wantedColor && norm(val(item,'color')) !== wantedColor) return false;
        return true;
      });
      if (!matches.length) return null;
      const preferred = matches.find(p => mediaUrl(p)) || matches[0];
      return {
        ...group,
        ...preferred,
        _groupItems: matches,
        _variantCount: matches.length,
        _sizeOptions: uniqueValues(matches, 'talla'),
        _colorOptions: uniqueValues(matches, 'color'),
        _locationOptions: uniqueValues(matches, 'ubicacion'),
        _warehouseOptions: uniqueValues(matches, 'almacen'),
        _skuOptions: uniqueValues(matches, 'sku')
      };
    }).filter(Boolean);
  }


  function ensureSelectOption(selectId, value, label = value) {
    const select = $(`#${selectId}`);
    if (!select) return;
    if (![...select.options].some(opt => opt.value === value)) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    }
    select.value = value;
  }

  async function openCategoryBrowser() {
    state.categoryAudience = 'all';
    state.categoryBrowserPage = 1;
    state.categoryBrowserProducts = [];
    await hydrateCategoryBrowserProducts(true);
    syncQuickFiltersFromState();
    renderCategoryBrowser();
    $('#categoryBrowser')?.classList.add('open');
    $('#categoryBrowser')?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('category-browser-open');
  }

  function closeCategoryBrowser() {
    toggleCategoryQuickFilters(false);
    $('#categoryBrowser')?.classList.remove('open');
    $('#categoryBrowser')?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('category-browser-open');
  }

  function applyCategorySelection(category, audience = 'all') {
    state.categoryAudienceFilter = audience && audience !== 'all' ? audience : '';
    ensureSelectOption('filterCategory', category, category);
    state.page = 1;
    renderAppliedFilters();
    closeCategoryBrowser();
    loadProducts();
    toast(`Mostrando categoría: ${category}`);
  }

  async function loadProducts() {
    if (state.publicMode) return loadPublicProducts();
    if (!state.branchId || !state.auth) return;
    const useLocalAdvancedFiltering = !!(state.variantFilters.size || state.variantFilters.color);
    const params = new URLSearchParams({ page: String(useLocalAdvancedFiltering ? 1 : state.page), limit: String(useLocalAdvancedFiltering ? 5000 : PAGE_SIZE), q: $('#searchInput').value.trim(), group_by: 'name' });
    const map = { filterBrand:'brand', filterCategory:'category', filterWarehouse:'warehouse', filterImage:'image_state' };
    Object.entries(map).forEach(([id,key]) => { const v = $(`#${id}`).value; if (v) params.set(key, v); });
    try {
      const data = await api(`/branches/${state.branchId}/products?${params}`);
      let items = data.items || [];
      if (useLocalAdvancedFiltering) {
        const filteredGroups = filterGroupedProductsByVariants(items);
        state.total = filteredGroups.length;
        state.groupTotalProducts = filteredGroups.reduce((acc, item) => acc + Number(item._variantCount || item._groupItems?.length || 1), 0);
        state.totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
        state.page = Math.min(state.page, state.totalPages);
        const from = (state.page - 1) * PAGE_SIZE;
        items = filteredGroups.slice(from, from + PAGE_SIZE);
        state.summary = {
          ...(data.summary || {}),
          total: filteredGroups.length,
          with_image: filteredGroups.filter(p => mediaUrl(p)).length,
          with_stock: filteredGroups.filter(p => val(p,'stock')).length
        };
      } else {
        state.summary = data.summary || {};
        state.total = Number(data.total || 0);
        state.groupTotalProducts = Number(data.group_total_products || 0);
        state.page = Number(data.page || 1);
        state.totalPages = Number(data.total_pages || 1);
      }
      state.products = items;
      state.facets = data.facets || {};
      renderFacets();
      renderSummary();
      renderProducts(state.products);
      renderAppliedFilters();
    } catch (err) {
      renderEmptyState(err.message);
    }
  }


  async function loadPublicProducts() {
    if (!state.token) return renderLocalPublicProducts();
    const useServerAdvancedFiltering = !!(state.variantFilters.size || state.variantFilters.color);
    const params = new URLSearchParams({
      page: String(state.page),
      limit: String(PAGE_SIZE),
      q: $('#searchInput')?.value.trim() || '',
      group_by: 'name'
    });
    const map = { filterBrand:'brand', filterCategory:'category', filterWarehouse:'warehouse', filterImage:'image_state' };
    Object.entries(map).forEach(([id,key]) => { const v = $(`#${id}`)?.value || ''; if (v) params.set(key, v); });
    if (state.variantFilters.size) params.set('size', state.variantFilters.size);
    if (state.variantFilters.color) params.set('color', state.variantFilters.color);
    try {
      const data = await api(`/view-links/${encodeURIComponent(state.token)}/products?${params}`);
      state.products = data.items || [];
      state.facets = data.facets || {};
      state.summary = data.summary || {};
      state.total = Number(data.total || 0);
      state.groupTotalProducts = Number(data.group_total_products || 0);
      state.page = Number(data.page || 1);
      state.totalPages = Number(data.total_pages || 1);
      renderFacets();
      renderSummary();
      renderProducts(state.products);
      renderAppliedFilters();
    } catch (err) {
      renderEmptyState(err.message || 'No se pudo cargar el catálogo público.');
    }
  }

  function renderLocalPublicProducts() {
    const q = norm($('#searchInput')?.value || '');
    const terms = q.split(/\s+/).filter(Boolean);
    const brand = norm($('#filterBrand')?.value || '');
    const category = norm($('#filterCategory')?.value || '');
    const warehouse = norm($('#filterWarehouse')?.value || '');
    const imageState = $('#filterImage')?.value || '';
    const wantedSize = norm(state.variantFilters.size || '');
    const wantedColor = norm(state.variantFilters.color || '');
    const audienceFilter = norm(state.categoryAudienceFilter || '');
    let filtered = state.products.filter(p => {
      const hay = norm(Object.values(p || {}).join(' '));
      if (terms.length && !terms.every(t => hay.includes(t))) return false;
      if (brand && norm(val(p,'marca')) !== brand) return false;
      if (category && norm(val(p,'categoria')) !== category) return false;
      if (warehouse && norm(val(p,'almacen')) !== warehouse) return false;
      if (imageState === 'with' && !mediaUrl(p)) return false;
      if (imageState === 'without' && mediaUrl(p)) return false;
      if (wantedSize && norm(val(p,'talla')) !== wantedSize) return false;
      if (wantedColor && norm(val(p,'color')) !== wantedColor) return false;
      if (audienceFilter && inferAudience(p) !== audienceFilter) return false;
      return true;
    });
    const groups = groupProductsByName(filtered);
    buildLocalFacets();
    state.groupTotalProducts = filtered.length;
    state.total = groups.length;
    state.totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
    state.page = Math.min(state.page, state.totalPages);
    const slice = groups.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    renderFacets();
    renderSummary();
    renderProducts(slice);
    renderAppliedFilters();
  }

  function buildLocalFacets() {
    const unique = key => [...new Map(state.products.map(p => val(p,key)).filter(Boolean).map(v => [norm(v), v])).values()].sort((a,b)=>String(a).localeCompare(String(b),'es'));
    state.facets = { brand_options: unique('marca'), category_options: unique('categoria'), warehouse_options: unique('almacen') };
  }

  function renderFacets() {
    fillSelect('filterBrand', 'Todas las marcas', state.facets.brand_options || state.facets.brands || []);
    fillSelect('filterCategory', 'Todas las categorías', state.facets.category_options || state.facets.categories || []);
    fillSelect('filterWarehouse', 'Todos los almacenes', state.facets.warehouse_options || state.facets.warehouses || []);
    renderAppliedFilters();
  }

  function fillSelect(id, label, values) {
    const el = $(`#${id}`);
    const current = el.value;
    el.innerHTML = `<option value="">${esc(label)}</option>` + (values || []).map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    el.value = current;
  }

  function renderSummary() {
    const total = state.summary.total ?? state.total ?? 0;
    $('#statTotal').textContent = total;
    $('#statTotalTop').textContent = total;
    $('#statImages').textContent = state.summary.with_image ?? 0;
    $('#statStock').textContent = state.summary.with_stock ?? 0;
    const groupText = state.groupTotalProducts ? ` · ${state.groupTotalProducts} variantes/registros` : '';
    $('#resultSummary').textContent = state.publicMode || isViewer() ? `Mostrando ${state.products.length} productos agrupados` : `Mostrando ${state.products.length} familias de ${state.total || state.products.length}${groupText}`;
    $('#pageSummary').textContent = `Página ${state.page} de ${state.totalPages}`;
    $('#paginationText').textContent = `Página ${state.page} / ${state.totalPages}`;
    $('#btnPrevPage').disabled = state.page <= 1;
    $('#btnNextPage').disabled = state.page >= state.totalPages;
  }

  function val(product, key) {
    const aliases = {
      sku:['sku','Sku','SKU'], nombre:['nombre','Nombre','name','producto'], variante:['variante','Variante','modelo','cod_modelo','cod / modelo'], marca:['marca','brand'], categoria:['categoria','categoría','category'], almacen:['almacen','almacén','warehouse'], ubicacion:['ubicacion','ubicación','location'], stock:['stock','cantidad','cant','Cant. Restock'], imagen:['imagen','image','foto','url_imagen','link imagen'], video:['video','link_video','url_video','link video'], color:['color','Color'], talla:['talla','Talla','size'], barras:['barras','Barras','barcode','codigo de barras']
    };
    const keys = aliases[key] || [key];
    for (const k of keys) if (product?.[k] != null && String(product[k]).trim()) return String(product[k]).trim();
    return '';
  }

  function mediaUrl(product) { return val(product,'imagen') || val(product,'video'); }
  function videoUrl(product) { return val(product,'video'); }

  function driveId(url) {
    const text = String(url || '');
    return (text.match(/\/file\/d\/([^/]+)/) || text.match(/[?&]id=([^&]+)/) || [])[1] || '';
  }


  function renderThumb(product) {
    const src = val(product,'imagen') || val(product,'video');
    if (!src) return `<div class="group-thumb-empty">—</div>`;
    const id = driveId(src);
    const img = id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w320` : src;
    if (/\.mp4($|\?)/i.test(src) && !id) return `<video src="${esc(src)}" muted loop playsinline></video>`;
    return `<img src="${esc(img)}" alt="${esc(val(product,'nombre') || 'Producto')}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;group-thumb-empty&quot;>—</div>'">`;
  }

  function renderMedia(product, mode = 'card') {
    const video = videoUrl(product);
    const img = val(product,'imagen');
    const src = video || img;
    const wrapClass = mode === 'card' ? 'product-photo' : 'product-photo';
    if (!src) return `<div class="media-empty">Sin imagen</div>`;
    const id = driveId(src);
    if (video) {
      if (/youtube\.com|youtu\.be/.test(src)) {
        const yt = (src.match(/[?&]v=([^&]+)/) || src.match(/youtu\.be\/([^?]+)/) || [])[1];
        if (yt) return `<iframe loading="lazy" src="https://www.youtube.com/embed/${esc(yt)}" allowfullscreen></iframe>`;
      }
      if (id) {
        const poster = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
        const proxy = `${API}/drive-video?id=${encodeURIComponent(id)}`;
        return `<video src="${esc(proxy)}" poster="${esc(poster)}" controls muted loop playsinline preload="metadata"></video>`;
      }
      if (/\.mp4($|\?)/i.test(src)) return `<video src="${esc(src)}" controls muted loop playsinline preload="metadata"></video>`;
    }
    const finalSrc = id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` : src;
    return `<img src="${esc(finalSrc)}" alt="${esc(val(product,'nombre') || 'Producto')}" loading="lazy" onerror="this.parentElement.classList.add('empty');this.remove();">`;
  }

  function productIdentity(product) {
    return [val(product,'sku'), val(product,'nombre'), val(product,'variante'), val(product,'ubicacion'), val(product,'almacen')].join('¦');
  }

  function productGroupKey(product) {
    if (!product) return '';
    if (product._groupKey) return product._groupKey;
    return [norm(val(product,'nombre') || val(product,'sku') || val(product,'barras') || 'sin-nombre'), norm(val(product,'marca'))].join('¦');
  }

  function uniqueValues(list, key) {
    const seen = new Map();
    (list || []).forEach(p => {
      const v = val(p, key);
      if (v && !seen.has(norm(v))) seen.set(norm(v), v);
    });
    return [...seen.values()];
  }

  function groupProductsByName(products) {
    const groups = new Map();
    (products || []).forEach(p => {
      const key = productGroupKey(p);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    });
    return [...groups.entries()].map(([key, items]) => {
      const preferred = items.find(p => mediaUrl(p)) || items[0] || {};
      return {
        ...preferred,
        _grouped: true,
        _groupKey: key,
        _groupName: val(preferred,'nombre') || 'Sin nombre',
        _groupItems: items,
        _variantCount: items.length,
        _sizeOptions: uniqueValues(items, 'talla'),
        _colorOptions: uniqueValues(items, 'color'),
        _locationOptions: uniqueValues(items, 'ubicacion'),
        _warehouseOptions: uniqueValues(items, 'almacen'),
        _skuOptions: uniqueValues(items, 'sku')
      };
    }).sort((a,b)=>String(a._groupName).localeCompare(String(b._groupName),'es'));
  }

  function renderProducts(products) {
    const list = $('#productGrid');
    state.currentResults = products || [];
    state.currentGroups = products || [];
    if (!products.length) {
      renderEmptyState('No hay productos para mostrar. Revisa la búsqueda o importa tu Sheet.');
      selectProduct(null);
      return;
    }
    list.innerHTML = products.map((p, idx) => {
      const variants = Number(p._variantCount || p._groupItems?.length || 1);
      const sizes = p._sizeOptions?.length ? p._sizeOptions : uniqueValues(p._groupItems || [p], 'talla');
      const colors = p._colorOptions?.length ? p._colorOptions : uniqueValues(p._groupItems || [p], 'color');
      const locs = p._locationOptions?.length ? p._locationOptions : uniqueValues(p._groupItems || [p], 'ubicacion');
      const whs = p._warehouseOptions?.length ? p._warehouseOptions : uniqueValues(p._groupItems || [p], 'almacen');
      const skuLabel = (p._skuOptions?.[0] || val(p,'sku') || val(p,'barras') || '—');
      const title = p._groupName || val(p,'nombre') || 'Sin nombre';
      const subtitle = [val(p,'marca'), val(p,'categoria')].filter(Boolean).join(' · ');
      return `
      <div class="product-row product-family-row model-one-row" data-index="${idx}" tabindex="0" title="Seleccionar producto agrupado">
        <div class="group-product-cell">
          <div class="group-thumb">${renderThumb(p)}</div>
          <div class="group-info">
            <strong>${esc(title)}</strong>
            <small>${esc(subtitle || `SKU ${skuLabel}`)}</small>
            <span class="group-location-mini">${esc(`${sizes.length || '—'} tallas · ${colors.length || '—'} colores`)}</span>
            <em class="group-open-label">Ver producto →</em>
          </div>
        </div>
        <div><span class="metric-pill">${esc(variants)}</span><small>${esc(variants === 1 ? (val(p,'variante') || '1 variante') : 'variantes')}</small></div>
        <div><span class="metric-pill">${esc(colors.length || '—')}</span><small>${esc(colors.slice(0,3).join(' · ') || 'colores')}</small></div>
        <div><span class="metric-pill">${esc(sizes.length || '—')}</span><small>${esc(sizes.slice(0,4).join(' · ') || 'tallas')}</small></div>
      </div>`;
    }).join('');
    $$('.product-row', list).forEach(row => {
      const pick = () => {
        const group = products[Number(row.dataset.index)];
        const item = group?._groupItems?.find(p => mediaUrl(p)) || group?._groupItems?.[0] || group;
        if (group?._groupItems && !item._groupItems) item._groupItems = group._groupItems;
        if (group?._groupKey && !item._groupKey) item._groupKey = group._groupKey;
        selectProduct(item);
      };
      row.addEventListener('click', pick);
      row.addEventListener('keydown', e => { if (e.key === 'Enter') pick(); });
    });
    const keep = state.selected && products.find(p => productGroupKey(p) === productGroupKey(state.selected));
    const first = keep || products[0];
    const selected = first?._groupItems?.find(p => mediaUrl(p)) || first?._groupItems?.[0] || first;
    if (first?._groupItems && selected && !selected._groupItems) selected._groupItems = first._groupItems;
    if (first?._groupKey && selected && !selected._groupKey) selected._groupKey = first._groupKey;
    selectProduct(selected);
    updateAdminChecklist();
  }

  function renderEmptyState(message) {
    $('#productGrid').innerHTML = `<div class="empty-grid">${esc(message)}</div>`;
    $('#resultSummary').textContent = 'Mostrando 0 productos';
  }

  function siblingProducts(product) {
    if (!product) return [];
    if (Array.isArray(product._groupItems) && product._groupItems.length) return product._groupItems;
    const group = state.currentGroups?.find(g => productGroupKey(g) === productGroupKey(product));
    if (group?._groupItems?.length) return group._groupItems;
    const all = Array.isArray(state.publicMode ? state.products : state.currentResults) ? (state.publicMode ? state.products : state.currentResults) : [];
    const name = norm(val(product,'nombre'));
    const marca = norm(val(product,'marca'));
    return all.flatMap(p => p._groupItems || [p]).filter(p => norm(val(p,'nombre')) === name && (!marca || norm(val(p,'marca')) === marca));
  }

  function chipStyle(label) {
    const c = norm(label);
    const normalizeHex = hex => {
      if (!hex) return null;
      let h = String(hex).replace('#','').trim();
      if (h.length === 3) h = h.split('').map(x => x + x).join('');
      return h.length === 6 ? `#${h}` : null;
    };
    const hexToRgb = hex => {
      const h = normalizeHex(hex);
      if (!h) return null;
      return { r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) };
    };
    const mix = (hexA, hexB, amount = .5) => {
      const a = hexToRgb(hexA), b = hexToRgb(hexB);
      if (!a || !b) return normalizeHex(hexA) || normalizeHex(hexB) || '#cbd5e1';
      const blend = k => Math.round(a[k] + (b[k] - a[k]) * amount).toString(16).padStart(2,'0');
      return `#${blend('r')}${blend('g')}${blend('b')}`;
    };
    const luminance = hex => {
      const rgb = hexToRgb(hex);
      if (!rgb) return 0;
      const convert = v => {
        v /= 255;
        return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
      };
      return 0.2126 * convert(rgb.r) + 0.7152 * convert(rgb.g) + 0.0722 * convert(rgb.b);
    };
    const palette = [
      { keys:['blanco','white','perla','hueso','ivory','marfil'], bg:'#F8FAFC' },
      { keys:['negro','black','ebony'], bg:'#1A1D24' },
      { keys:['plomo','gris','gray','grey','grafito'], bg:'#94A3B8' },
      { keys:['gris oscuro','antracita'], bg:'#475569' },
      { keys:['amarillo','yellow','mostaza'], bg:'#F7D54A' },
      { keys:['ocre'], bg:'#C28B2C' },
      { keys:['beige','nude','piel','skin'], bg:'#D8BE9B' },
      { keys:['arena','sand'], bg:'#D6B486' },
      { keys:['melon','melón','durazno','peach'], bg:'#FFBA8A' },
      { keys:['camel','caramelo'], bg:'#B98247' },
      { keys:['marron','marrón','brown','chocolate','cafe','café'], bg:'#6B442F' },
      { keys:['rosa palo','palo rosa'], bg:'#E9B8C5' },
      { keys:['rosa bb','rosa bebe','rosa bebé','baby pink'], bg:'#F7C8D9' },
      { keys:['chicle','bubblegum'], bg:'#F06AA7' },
      { keys:['rosa','pink'], bg:'#F3A6C2' },
      { keys:['fucsia','fuchsia','magenta'], bg:'#D94693' },
      { keys:['coral'], bg:'#FF7F6F' },
      { keys:['rojo','red'], bg:'#D94A4A' },
      { keys:['vino osc','vino oscuro','vino'], bg:'#6E2233' },
      { keys:['concha vino','conche vino','vino concha'], bg:'#7B2846' },
      { keys:['uva','purple grape'], bg:'#6D4AA2' },
      { keys:['lila','azalea','lavanda','lavender'], bg:'#CDB4F6' },
      { keys:['morado','violeta','purple'], bg:'#7C57C2' },
      { keys:['azul marino','a marino','marino','navy'], bg:'#1F3A63' },
      { keys:['cobalto'], bg:'#2E63C4' },
      { keys:['azul rey'], bg:'#2457E0' },
      { keys:['celeste','sky'], bg:'#8FD3FF' },
      { keys:['turquesa','aqua','aguamarina'], bg:'#45D1C7' },
      { keys:['azul','blue'], bg:'#5D8EF7' },
      { keys:['verde agua','menta','mint'], bg:'#9BE4C5' },
      { keys:['verde olivo','olivo'], bg:'#7A8F45' },
      { keys:['verde','green'], bg:'#4FAF73' },
      { keys:['lima','neon green'], bg:'#BEEA43' },
      { keys:['naranja','orange'], bg:'#F59E42' }
    ];
    const hit = palette.find(item => item.keys.some(k => c.includes(norm(k))));
    if (!hit) return '';
    const bg = hit.bg;
    const lum = luminance(bg);
    const textColor = lum > 0.57 ? '#14202A' : '#F8FAFC';
    const border = lum > 0.57 ? mix(bg, '#000000', .18) : mix(bg, '#FFFFFF', .22);
    return `--chip-bg:${bg};--chip-text:${textColor};--chip-border:${border}`;
  }

  function renderVariantChips(product) {
    const siblings = siblingProducts(product);
    const make = (key, hostId) => {
      const host = $(`#${hostId}`);
      if (!host) return;
      const seen = new Map();
      siblings.forEach(p => { const v = val(p,key); if (v && !seen.has(norm(v))) seen.set(norm(v), { label:v, product:p }); });
      if (!seen.size) { host.innerHTML = '<span class="muted tiny">—</span>'; return; }
      host.innerHTML = [...seen.values()].map(item => `<button type="button" class="variant-chip ${norm(item.label)===norm(val(product,key))?'active':''} ${key==='color'?'variant-color':''}" data-key="${key}" data-value="${esc(item.label)}" style="${key==='color'?chipStyle(item.label):''}">${esc(item.label)}</button>`).join('');
      $$('button', host).forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        const wanted = btn.dataset.value;
        const currentOther = key === 'talla' ? val(product,'color') : val(product,'talla');
        const exact = siblings.find(p => norm(val(p,key)) === norm(wanted) && (!currentOther || norm(val(p, key === 'talla' ? 'color':'talla')) === norm(currentOther)));
        const fallback = siblings.find(p => norm(val(p,key)) === norm(wanted));
        const picked = exact || fallback || siblings.find(Boolean) || product;
        if (picked && product._groupItems && !picked._groupItems) picked._groupItems = product._groupItems;
        if (picked && product._groupKey && !picked._groupKey) picked._groupKey = product._groupKey;
        selectProduct(picked);
      }));
    };
    make('talla', 'activeSizeStrip');
    make('color', 'activeColorStrip');
  }

  function selectProduct(product) {
    state.selected = product;
    $$('.product-row').forEach(row => {
      const p = state.currentResults?.[Number(row.dataset.index)];
      row.classList.toggle('active', !!p && !!product && productGroupKey(p) === productGroupKey(product));
    });
    if (!product) {
      $('#activeProductMedia').innerHTML = '<div class="media-empty">Selecciona un producto</div>';
      $('#activeProductName').textContent = 'Busca o selecciona un producto';
      $('#activeProductSku').textContent = 'SKU —';
      ['activeProductLocation','activeProductWarehouse','activeProductBrand','activeProductCategory','activeProductStock','activeProductPrice'].forEach(id => { const el=$(`#${id}`); if(el) el.textContent = '—'; });
      $('#activeProductMeta').textContent = '';
      $('#activeSizeStrip').innerHTML = '';
      $('#activeColorStrip').innerHTML = '';
      return;
    }
    $('#activeProductMedia').innerHTML = renderMedia(product, 'featured');
    $('#activeProductName').textContent = val(product,'nombre') || 'Sin nombre';
    $('#activeProductSku').textContent = `SKU ${val(product,'sku') || val(product,'barras') || '—'}`;
    $('#activeProductLocation').textContent = val(product,'ubicacion') || [product.zona, product.estante, product.nivel, product.slot].filter(Boolean).join(' · ') || '—';
    $('#activeProductWarehouse').textContent = val(product,'almacen') || '—';
    $('#activeProductBrand').textContent = val(product,'marca') || '—';
    $('#activeProductCategory').textContent = val(product,'categoria') || '—';
    $('#activeProductStock') && ($('#activeProductStock').textContent = val(product,'stock') || '—');
    $('#activeProductPrice') && ($('#activeProductPrice').textContent = val(product,'precio') || '—');
    const family = siblingProducts(product);
    $('#activeProductMeta').textContent = '';
    renderVariantChips(product);
    applyCardVisibility();
    updateRequestButtonState();
    updateExpandedSideCards();
  }

  function copySelectedProductInfo() {
    const p = state.selected;
    if (!p) return toast('Selecciona un producto primero.', 'bad');
    const text = [
      val(p,'nombre') || 'Sin nombre',
      `SKU: ${val(p,'sku') || '—'}`,
      `Marca: ${val(p,'marca') || '—'}`,
      `Talla: ${val(p,'talla') || '—'}`,
      `Color: ${val(p,'color') || '—'}`,
      `Ubicación: ${val(p,'ubicacion') || '—'}`,
      `Almacén: ${val(p,'almacen') || '—'}`
    ].join('\n');
    navigator.clipboard?.writeText(text).then(() => toast('Información copiada.')).catch(() => toast(text));
  }



  function requestItemKey(product) {
    return [productGroupKey(product), val(product,'sku'), val(product,'talla'), val(product,'color'), val(product,'variante')].map(norm).join('¦');
  }

  function addSelectedToRequest() {
    const p = state.selected;
    if (!p) return toast('Selecciona un producto primero.', 'bad');
    if (!val(p,'talla') && siblingProducts(p).some(x => val(x,'talla'))) return toast('Selecciona una talla antes de agregar.', 'bad');
    if (!val(p,'color') && siblingProducts(p).some(x => val(x,'color'))) return toast('Selecciona un color antes de agregar.', 'bad');
    const key = requestItemKey(p);
    if ((state.requestItems || []).some(item => item.key === key)) {
      toast('Ese producto ya está en la solicitud.');
      updateRequestButtonState();
      return;
    }
    state.requestItems.push({
      key,
      nombre: val(p,'nombre') || 'Sin nombre',
      sku: val(p,'sku') || val(p,'barras') || '',
      marca: val(p,'marca') || '',
      categoria: val(p,'categoria') || '',
      talla: val(p,'talla') || '',
      color: val(p,'color') || '',
      imagen: val(p,'imagen') || '',
      video: val(p,'video') || ''
    });
    saveRequestCart();
    renderRequestCart();
    updateRequestButtonState();
    toast('Producto agregado a la solicitud.');
  }

  function updateRequestButtonState() {
    const btn = $('#btnShareWhatsApp');
    if (!btn) return;
    const p = state.selected;
    const exists = p && (state.requestItems || []).some(item => item.key === requestItemKey(p));
    btn.textContent = exists ? 'Agregado ✓' : 'Agregar a solicitud';
    btn.classList.toggle('added', !!exists);
  }

  function removeRequestItem(key) {
    state.requestItems = (state.requestItems || []).filter(item => item.key !== key);
    saveRequestCart();
    renderRequestCart();
    updateRequestButtonState();
  }

  function renderRequestCart() {
    const items = state.requestItems || [];
    const count = $('#requestCartCount');
    if (count) count.textContent = String(items.length);
    $('#btnRequestFloating')?.classList.toggle('visible', items.length > 0);
    const list = $('#requestCartList');
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<div class="request-empty">Aún no agregaste productos. Selecciona una talla/color y presiona “Agregar a solicitud”.</div>';
      return;
    }
    list.innerHTML = items.map(item => {
      const src = item.imagen || item.video || '';
      const id = driveId(src);
      const thumb = src ? (id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w220` : src) : '';
      return `<div class="request-item">
        <div class="request-thumb">${thumb ? `<img src="${esc(thumb)}" alt="${esc(item.nombre)}">` : '—'}</div>
        <div class="request-info"><strong>${esc(item.nombre)}</strong><span>${esc([item.sku, item.marca].filter(Boolean).join(' · ') || 'Producto')}</span><small>${esc([item.talla && `Talla ${item.talla}`, item.color && `Color ${item.color}`].filter(Boolean).join(' · ') || 'Sin variante')}</small></div>
        <button type="button" class="request-remove" data-remove-request="${esc(item.key)}">×</button>
      </div>`;
    }).join('');
    $$('[data-remove-request]', list).forEach(btn => btn.addEventListener('click', () => removeRequestItem(btn.dataset.removeRequest)));
  }

  function requestCartText() {
    const items = state.requestItems || [];
    return ['Hola, quiero solicitar estos productos:', ...items.map((item, i) => `${i + 1}. ${item.nombre}${item.sku ? ` · SKU ${item.sku}` : ''}${item.talla ? ` · Talla ${item.talla}` : ''}${item.color ? ` · Color ${item.color}` : ''}`)].join('\n');
  }

  function openRequestDrawer() {
    renderRequestCart();
    $('#requestDrawer')?.classList.add('open');
    $('#requestDrawer')?.setAttribute('aria-hidden', 'false');
  }

  function closeRequestDrawer() {
    $('#requestDrawer')?.classList.remove('open');
    $('#requestDrawer')?.setAttribute('aria-hidden', 'true');
  }

  function clearRequestCart() {
    state.requestItems = [];
    saveRequestCart();
    renderRequestCart();
    updateRequestButtonState();
    toast('Solicitud vacía.');
  }

  function copyRequestCart() {
    if (!(state.requestItems || []).length) return toast('Agrega productos primero.', 'bad');
    const text = requestCartText();
    navigator.clipboard?.writeText(text).then(() => toast('Solicitud copiada.')).catch(() => toast(text));
  }

  function sendRequestCart() {
    if (!(state.requestItems || []).length) return toast('Agrega productos primero.', 'bad');
    window.open(`https://wa.me/?text=${encodeURIComponent(requestCartText())}`, '_blank', 'noopener,noreferrer');
    toast('Solicitud lista para enviar.');
  }

  function hydrateViewerTopbar() {
    const b = getBranch();
    const topbar = $('#viewerTopbar');
    if (!topbar) return;
    const title = topbar.querySelector('strong');
    if (title) title.textContent = b?.name || 'Catálogo de productos';
  }

  function bindClientConfigControls() {
    const controls = $$('[data-config-field]');
    controls.forEach(input => {
      const key = input.dataset.configField;
      input.checked = state.uiConfig?.[key] !== false;
      input.addEventListener('change', () => {
        state.uiConfig[key] = input.checked;
        saveClientConfig();
        applyCardVisibility();
        toast('Vista cliente actualizada.');
      });
    });
    applyCardVisibility();
  }

  function applyCardVisibility() {
    const cfg = state.uiConfig || DEFAULT_UI_CONFIG;
    $$('[data-card-field]').forEach(el => {
      const key = el.dataset.cardField;
      const visible = key === 'request' ? cfg.request !== false : cfg[key] !== false;
      el.classList.toggle('field-hidden', !visible);
    });
  }

  function updateAdminChecklist() {
    const set = (id, ok) => {
      const el = $(`#${id}`);
      if (el) el.classList.toggle('done', !!ok);
    };
    set('checkBranch', !!state.branchId);
    set('checkSheet', !!state.headers?.length);
    set('checkProducts', Number(state.summary?.total || state.products?.length || 0) > 0);
    set('checkLink', ($('#viewerLinkBox')?.textContent || '').startsWith('http'));
  }

  function modalItems() {
    const source = (state.currentGroups && state.currentGroups.length ? state.currentGroups : (state.currentResults && state.currentResults.length ? state.currentResults : state.products));
    return source.filter(Boolean).map(g => {
      const item = g?._groupItems?.find(p => mediaUrl(p)) || g?._groupItems?.[0] || g;
      if (item && g?._groupItems && !item._groupItems) item._groupItems = g._groupItems;
      if (item && g?._groupKey && !item._groupKey) item._groupKey = g._groupKey;
      return item;
    });
  }

  function currentModalIndex() {
    const items = modalItems();
    return Math.max(0, items.findIndex(p => state.selected && productGroupKey(p) === productGroupKey(state.selected)));
  }

  function ensureSideCard(side) {
    let el = document.getElementById(`expandedSideCard-${side}`);
    if (el) return el;
    el = document.createElement('button');
    el.type = 'button';
    el.id = `expandedSideCard-${side}`;
    el.className = `search-card-side-nav ${side}`;
    el.innerHTML = `<div class="side-nav-kicker">${side === 'left' ? 'Anterior' : 'Siguiente'}</div><div class="side-nav-media"></div><div class="side-nav-body"><div class="side-nav-title">—</div><div class="side-nav-sku">SKU —</div><div class="side-nav-mini"><div class="side-nav-pill"><span class="side-nav-label">Ubicación</span><span class="side-nav-value">—</span></div></div></div><div class="side-nav-hint">Haz clic para cambiar de producto</div>`;
    document.body.appendChild(el);
    return el;
  }

  function fillSideCard(el, product, side) {
    if (!product) { el.classList.remove('visible'); return; }
    el.querySelector('.side-nav-kicker').textContent = side === 'left' ? 'Anterior' : 'Siguiente';
    el.querySelector('.side-nav-media').innerHTML = renderMedia(product, 'card');
    el.querySelector('.side-nav-title').textContent = val(product,'nombre') || 'Sin nombre';
    el.querySelector('.side-nav-sku').textContent = `SKU ${val(product,'sku') || '—'}`;
    el.querySelector('.side-nav-value').textContent = val(product,'ubicacion') || '—';
    el.onclick = e => { e.preventDefault(); e.stopPropagation(); selectProduct(product); };
    el.classList.add('visible');
  }

  function updateExpandedSideCards() {
    const card = $('#activeProductCard');
    if (!card?.classList.contains('search-card-expanded') || window.innerWidth <= 980) return hideExpandedSideCards();
    const items = modalItems();
    if (items.length <= 1) return hideExpandedSideCards();
    const idx = currentModalIndex();
    fillSideCard(ensureSideCard('left'), items[(idx - 1 + items.length) % items.length], 'left');
    fillSideCard(ensureSideCard('right'), items[(idx + 1) % items.length], 'right');
  }

  function hideExpandedSideCards() {
    ['left','right'].forEach(side => document.getElementById(`expandedSideCard-${side}`)?.classList.remove('visible'));
  }

  function mountExpandedCardOnTop(card) {
    if (!card || card.dataset.modalMounted === '1') return;
    const placeholder = document.createElement('span');
    placeholder.id = 'activeProductCardPlaceholder';
    placeholder.hidden = true;
    card.parentNode.insertBefore(placeholder, card);
    document.body.appendChild(card);
    card.dataset.modalMounted = '1';
  }

  function restoreExpandedCardHome(card) {
    const placeholder = document.getElementById('activeProductCardPlaceholder');
    if (card && placeholder) {
      placeholder.parentNode.insertBefore(card, placeholder);
      placeholder.remove();
    }
    if (card) {
      card.dataset.modalMounted = '0';
      card.removeAttribute('style');
    }
  }

  function forceExpandedCardLayer(card) {
    if (!card) return;
    Object.assign(card.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '10030',
      isolation: 'isolate',
      visibility: 'visible',
      opacity: '1',
      pointerEvents: 'auto'
    });
    const overlay = $('#searchCardOverlay');
    if (overlay) overlay.style.zIndex = '10000';
    ['left','right'].forEach(side => {
      const sideCard = document.getElementById(`expandedSideCard-${side}`);
      if (sideCard) sideCard.style.zIndex = '10010';
    });
  }


  function autoplayExpandedVideo() {
    const card = $('#activeProductCard');
    const video = card?.querySelector('.product-photo video');
    if (!video) return;
    try {
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.setAttribute('loop', '');
      video.playsInline = true;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.setAttribute('data-autoplay-blocked', '1');
        });
      }
    } catch {}
  }

  function stopExpandedVideo() {
    const card = $('#activeProductCard');
    card?.querySelectorAll('.product-photo video').forEach(video => {
      try { video.pause(); } catch {}
    });
  }

  function openActiveProductCard() {
    if (!state.selected) return toast('Selecciona un producto primero.', 'bad');
    const card = $('#activeProductCard');
    mountExpandedCardOnTop(card);
    $('#searchCardOverlay')?.classList.add('active');
    card?.classList.add('search-card-expanded');
    document.body.classList.add('search-card-modal-open');
    forceExpandedCardLayer(card);
    setTimeout(() => { forceExpandedCardLayer(card); updateExpandedSideCards(); autoplayExpandedVideo(); }, 30);
  }

  function closeActiveProductCard() {
    stopExpandedVideo();
    const card = $('#activeProductCard');
    card?.classList.remove('search-card-expanded');
    $('#searchCardOverlay')?.classList.remove('active');
    document.body.classList.remove('search-card-modal-open');
    hideExpandedSideCards();
    restoreExpandedCardHome(card);
  }

  function handleExpandedKeys(e) {
    const items = modalItems();
    if (items.length <= 1) return;
    const idx = currentModalIndex();
    if (e.key === 'ArrowLeft') { e.preventDefault(); selectProduct(items[(idx - 1 + items.length) % items.length]); }
    if (e.key === 'ArrowRight') { e.preventDefault(); selectProduct(items[(idx + 1) % items.length]); }
  }

  function autoMap(headers) {
    const hNorm = headers.map(h => norm(h));
    const out = {};
    for (const [key,, aliases] of fields) {
      let idx = hNorm.findIndex(h => aliases.some(a => h === norm(a)));
      if (idx < 0) idx = hNorm.findIndex(h => aliases.some(a => h.includes(norm(a)) || norm(a).includes(h)));
      out[key] = idx >= 0 ? headers[idx] : '';
    }
    return out;
  }

  function normalizeMapping(input) {
    if (Array.isArray(input)) {
      const out = {};
      input.forEach(row => {
        const key = row.key || row.field || row.target || row.name;
        const value = row.header || row.source || row.column || row.value;
        if (key) out[key] = value || '';
      });
      return out;
    }
    return input && typeof input === 'object' ? input : {};
  }

  function renderMapping() {
    const panel = $('#mappingPanel');
    if (!state.headers.length) {
      panel.innerHTML = '<div class="import-log">Aún no hay encabezados. Presiona “Leer encabezados”.</div>';
      return;
    }
    if (!Object.keys(state.mapping).length) state.mapping = autoMap(state.headers);
    panel.innerHTML = fields.map(([key,label]) => `
      <div class="map-card">
        <label>${esc(label)}
          <select data-map="${esc(key)}">
            <option value="">No usar</option>
            ${state.headers.map(h => `<option value="${esc(h)}" ${state.mapping[key] === h ? 'selected' : ''}>${esc(h)}</option>`).join('')}
          </select>
        </label>
      </div>`).join('');
    $$('[data-map]', panel).forEach(sel => sel.addEventListener('change', () => { state.mapping[sel.dataset.map] = sel.value; }));
  }

  async function probeSheet() {
    requireAdmin();
    const url = $('#sheetUrl').value.trim();
    const sheet = $('#sheetName').value.trim() || 'Productos';
    if (!url) return toast('Coloca la URL del Sheet.', 'bad');
    $('#importLog').textContent = 'Leyendo encabezados...';
    try {
      const data = await api(`/sheets/probe?url=${encodeURIComponent(url)}&sheet=${encodeURIComponent(sheet)}`);
      state.headers = data.headers || [];
      state.mapping = autoMap(state.headers);
      renderMapping();
      $('#sheetStatus').textContent = `${state.headers.length} encabezados detectados`;
      $('#importLog').textContent = `Encabezados leídos desde ${data.source || 'Google Sheets'}. Filas detectadas: ${data.previewCount ?? '—'}`;
      await saveSheetMetadata(false);
    } catch (err) {
      $('#importLog').textContent = err.message;
      toast(err.message, 'bad');
    }
  }

  function mappedProducts(headers, rows) {
    const index = new Map(headers.map((h,i) => [h, i]));
    const get = (row, key) => {
      const header = state.mapping[key];
      const idx = index.get(header);
      return idx == null ? '' : String(row[idx] ?? '').trim();
    };
    return rows.map((row, i) => {
      const raw = {};
      headers.forEach((h, idx) => raw[h] = String(row[idx] ?? '').trim());
      const p = { id:`sheet-${i+1}`, raw };
      for (const [key] of fields) p[key] = get(row, key);
      if (!p.ubicacion) p.ubicacion = [p.zona, p.estante, p.nivel, p.slot].filter(Boolean).join('-');
      return p;
    }).filter(p => (p.nombre || p.sku || p.barras) && norm(p.nombre) !== 'producto');
  }

  async function saveSheetMetadata(withProducts, products = [], totalRows = 0) {
    const body = {
      sheet_id: $('#sheetUrl').value.trim(),
      sheet_name: $('#sheetName').value.trim() || 'Productos',
      source_type: 'google_sheet',
      sheet_headers: state.headers,
      sheet_header_index: 0,
      sheet_map_rows: state.mapping
    };
    if (withProducts) {
      body.imported_products = products;
      body.last_sheet_count = totalRows || products.length;
    }
    await api(`/branches/${state.branchId}/sheet`, { method:'POST', body: JSON.stringify(body) });
  }

  async function importSheet() {
    requireAdmin();
    const url = $('#sheetUrl').value.trim();
    const sheet = $('#sheetName').value.trim() || 'Productos';
    if (!url) return toast('Coloca la URL del Sheet.', 'bad');
    $('#importLog').textContent = 'Importando hasta 50,000 filas...';
    try {
      if (!state.headers.length) await probeSheet();
      const data = await api(`/sheets/rows?url=${encodeURIComponent(url)}&sheet=${encodeURIComponent(sheet)}&limit=50000`);
      state.headers = data.headers || state.headers;
      if (!Object.keys(state.mapping).length) state.mapping = autoMap(state.headers);
      const products = mappedProducts(state.headers, data.rows || []);
      await saveSheetMetadata(true, products, data.totalRows || products.length);
      $('#sheetStatus').textContent = `${products.length} productos importados`;
      $('#importLog').textContent = `Listo. Importados: ${products.length}\nFilas detectadas en Sheet: ${data.totalRows ?? products.length}\nFuente: ${data.source || 'Google Sheets'}`;
      state.page = 1;
      await loadProducts();
      setView('catalog');
      toast('Productos importados correctamente.');
    } catch (err) {
      $('#importLog').textContent = err.message;
      toast(err.message, 'bad');
    }
  }

  function requireAdmin() {
    if (!state.auth) {
      $('#authModal').classList.add('show');
      throw new Error('Necesitas iniciar sesión como administrador.');
    }
    if (!isAdmin()) {
      toast('Modo viewer: solo puedes observar el catálogo.', 'bad');
      throw new Error('Modo viewer sin permisos de edición.');
    }
  }

  async function createBranch() {
    requireAdmin();
    const name = $('#newBranchName').value.trim();
    if (!name) return toast('Coloca un nombre para la sucursal.', 'bad');
    const warehouses = $('#newBranchWarehouses').value.split(',').map(x => x.trim()).filter(Boolean);
    try {
      const data = await api('/branches', { method:'POST', body: JSON.stringify({ name, type: $('#newBranchType').value.trim() || 'catálogo', warehouses: warehouses.length ? warehouses : ['Principal'] }) });
      state.branchId = data.branch?.id;
      await loadBranches();
      toast('Sucursal creada.');
    } catch (err) { toast(err.message, 'bad'); }
  }

  async function generateViewerLink() {
    requireAdmin();
    if (!state.branchId) return toast('Selecciona una sucursal.', 'bad');
    try {
      const data = await api(`/branches/${state.branchId}/view-link`, { method:'POST', body:'{}' });
      $('#viewerLinkBox').textContent = data.url;
      await navigator.clipboard?.writeText(data.url).catch(() => null);
      toast('Link cliente generado y copiado.');
      updateAdminChecklist();
      setView('settings');
    } catch (err) { toast(err.message, 'bad'); }
  }

  function applyAdminPanelState() {
    document.body.classList.toggle('admin-panel-open', !!state.adminPanelOpen);
    const btn = $('#btnOpenAdminPanel');
    if (btn) btn.classList.toggle('hidden', state.publicMode);
  }

  function openAdminPanel() {
    if (state.publicMode) return;
    state.adminPanelOpen = true;
    applyAdminPanelState();
  }

  function closeAdminPanel() {
    state.adminPanelOpen = false;
    applyAdminPanelState();
  }


  setAuthMode('login');
  init();
})();
