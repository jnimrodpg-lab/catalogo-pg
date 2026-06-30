/* WMS_V97_BUTTON_NO_BOUNCE_FIX */
/* WMS_V96_ZOOM_NO_BOUNCE_FIX */
/* WMS_V95_LAYOUT_STATE_SCROLL_WIDTH_FIX */
/* v94: centro real del muro */
/* v93: alineado a extremos reales del muro */
/* WMS_V91_FIX_PUBLIC_RENDERER_SAVE_LAYOUT */
/* WMS_V89_FORCE_FROM_V84: reemplazo real del renderer v84 de vanos/puertas */
(() => {
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
  const appRoot = $('#appRoot');
  const toggleSidebar = $('#toggleSidebar');
  $$('.menu-item[data-screen="card"]').forEach(el => el.remove());
  const menuItems = $$('.menu-item');
  const searchInput = $('#searchInput');
  const btnSearch = $('#btnSearch');
  const btnScanCode = $('#btnScanCode');
  const scannerModal = $('#scannerModal');
  const btnCloseScanner = $('#btnCloseScanner');
  const btnStopScanner = $('#btnStopScanner');
  const scannerHint = $('#scannerHint');
  const productList = $('#productList');
  const countProducts = $('#countProducts');
  const searchBranchHost = $('#searchBranchHost');
  const productSummary = $('#productSummary');
  const productToolbar = $('.product-toolbar');
  const activeProductName = $('#activeProductName');
  const activeProductSku = $('#activeProductSku');
  const activeProductMeta = $('#activeProductMeta');
  const activeLocation = $('#activeLocation');
  const activeStoreLocation = $('#activeStoreLocation');
  const activeProductImageWrap = $('#activeProductImageWrap');
  const activeProductImage = $('#activeProductImage');
  const activeProductGallery = $('#activeProductGallery');
  const activeProductGalleryCounter = $('#activeProductGalleryCounter');
  const activeProductGalleryPrev = $('#activeProductGalleryPrev');
  const activeProductGalleryNext = $('#activeProductGalleryNext');
  const activeSizeStrip = $('#activeSizeStrip');
  const activeColorStrip = $('#activeColorStrip');
  const btnFocusProductMap = $('#btnFocusProductMap');
  const btnOpenViewerFromProduct = $('#btnOpenViewerFromProduct');
  let activeImageCycleTimer = null;
  let activeImageCycleUrls = [];
  let activeMediaCycleItems = [];
  let activeImageCycleIndex = 0;
  let activeImageGalleryBound = false;
  const sheetStatusChip = $('#sheetStatusChip');
  const authModal = $('#authModal');
  const btnAuthAction = $('#btnAuthAction');
  const btnAuthClose = $('#btnAuthClose');
  const btnDoLogin = $('#btnDoLogin');
  const loginUsername = $('#loginUsername');
  const loginPassword = $('#loginPassword');
  const authMode = $('#authMode');
  const authCompanyWrap = $('#authCompanyWrap');
  const authCompanyCodeWrap = $('#authCompanyCodeWrap');
  const authCompanyName = $('#authCompanyName');
  const authCompanyCode = $('#authCompanyCode');
  const authRole = $('#authRole');
  const btnToggleAuthMode = $('#btnToggleAuthMode');
  const authStatus = $('#authStatus');
  const contentTitle = $('#contentTitle');
  const contentSubtitle = $('#contentSubtitle');
  const contentTags = $('#contentTags');
  const contentWrap = $('#contentWrap');
  const contentPanel = $('.content-panel');
  const detailPanel = $('.detail-panel');
  const contentStatus = $('#contentStatus');
  const contentFootRight = $('#contentFootRight');
  const detailTitle = $('#detailTitle');
  const detailSubtitle = $('#detailSubtitle');
  const detailWrap = $('#detailWrap');
  const detailStatus = $('#detailStatus');
  const detailChip = $('#detailChip');

  const appState = {
    screen: 'admin',
    products: [],
    filtered: [],
    selectedProduct: null,
    selectedRack: '',
    selectedZoneId: 'Z1',
    selectedVertex: { zoneId:'', idx:-1 },
    selectedEdge: { zoneId:'', a:-1, b:-1 },
    selectedRackLayoutId: '',
    selectedRackLayoutIds: [],
    selectedWallId: '',
    selectedOpeningId: '',
    highlightedRackIds: [],
    primaryHighlightedRackId: '',
    selectedModelId: 'std_4',
    sheetConfig: { url:'', sheetName:'Productos', lastMode:'demo' },
    layout: {
      zones: [],
      racks: [],
      walls: [],
      openings: []
    },
    branchLayouts: loadBranchLayouts(),
    activeLayoutBranchIndex: 0,
    editor: {
      mode: 'select',
      dragging: null,
      offset: {x:0,y:0},
      viewBox: { x:0, y:0, w:900, h:620 },
      sectionVisible: true,
      racksVisible: true,
      rackPropsOpen: true,
      sectionCuts: {
        x: { pos:.5, dir:1 },
        y: { pos:.5, dir:1 }
      },
      view: 'ortho',
      zonesLocked: false,
      showDims: true,
      showGrid: true,
      showZones: true,
      showLabels: true,
      showMiniMap: true,
      snapEnabled: true,
      snapSize: 2,
      dimFontSize: 32,
      rightPanelOpen: true,
      stackMenu: { open:false, rackId:'', x:0, y:0 },
      inspectorStackOpen: false,
      dragSelect: { active:false, additive:false, start:null, end:null },
      snapPreview: null,
      viewBoxCustomized: false
    },
    models: [
      { id:'std_4', name:'Rack estándar 4 niveles', levels:4, slots:2, width:120, depth:40, height:240, clearance:0, style:'metallic' },
      { id:'wide_5', name:'Rack ancho 5 niveles', levels:5, slots:2, width:120, depth:40, height:240, clearance:0, style:'wide' },
      { id:'compact_3', name:'Rack compacto 3 niveles', levels:3, slots:2, width:120, depth:40, height:240, clearance:0, style:'melamine' },
      { id:'under_stairs', name:'Mueble bajo escalera', levels:4, slots:1, width:180, depth:45, height:240, leftHeight:240, rightHeight:70, topLength:60, mirrored:false, clearance:0, style:'under_stairs', levelHeights:[60,60,60,60], levelSlots:[1,1,1,1] },
      { id:'under_stairs_reflected', name:'Mueble bajo escalera reflejado', levels:4, slots:1, width:180, depth:45, height:240, leftHeight:240, rightHeight:70, topLength:60, mirrored:true, clearance:0, style:'under_stairs_reflected', levelHeights:[60,60,60,60], levelSlots:[1,1,1,1] }
    ],
    admin: loadAdminState(),
    ui: { sheetExpanded:false, productGroupMode:true, rackLibraryOpenIds:['std_4'], isoView:'NE', isoIsolation:'all', isoGhost:true },
    auth: { loggedIn:false, user:'', role:'', company:'', companyCode:'' },
    sheetWizard: { step: 1, url:'', selectedSheet:'', availableSheets:[], headers:[], mapping:{ sku:'', nombre:'', variante:'', barras:'', ubicacion:'', almacen:'' }, imported:false, loading:false, error:'' },
    productFilters: {
      brand:'',
      category:'',
      gender:'',
      warehouse:'',
      zone:'',
      rack:'',
      image_state:'',
      location_state:'',
      stock_state:''
    },
    productFacets: { brands:[], categories:[], warehouses:[], zones:[], racks:[] },
    productSummaryData: null,
    searchIndex: [],
    productPaging: { mode:'local', page:1, limit:120, total:0, totalPages:1, branchId:0, query:'', loading:false, lastError:'' },
    history: {
      layout: { undoStack: [], redoStack: [], isApplying: false, max: 80 },
      racks: { undoStack: [], redoStack: [], isApplying: false, max: 80 }
    }
  };

  const storedRackModels = loadRackModels();
  if (storedRackModels) appState.models = storedRackModels.map(m => ({ ...m, leftHeight: Number(m.leftHeight || m.height || 240), rightHeight: Number(m.rightHeight || Math.max(40, (m.height || 240) * 0.35)), mirrored: isUnderStairsStyle(m?.style) ? (normalizeRackStyle(m?.style) === 'under_stairs_reflected' ? true : false) : !!m.mirrored }));

  let html5QrScanner = null;
  let scannerRunning = false;

  const appModalBackdrop = document.getElementById('appModalBackdrop');
  const appModalTitle = document.getElementById('appModalTitle');
  const appModalBody = document.getElementById('appModalBody');
  const appModalActions = document.getElementById('appModalActions');
  const appModalClose = document.getElementById('appModalClose');
  const toastStack = document.getElementById('toastStack');
  const configImportInput = document.getElementById('configImportInput');
  let modalResolver = null;

  function ensureProductPagingState(){
    const base = { mode:'local', page:1, limit:120, total:0, totalPages:1, branchId:0, query:'', loading:false, lastError:'', backendUnavailable:false };
    if(!appState.productPaging || typeof appState.productPaging !== 'object'){
      appState.productPaging = { ...base };
    }else{
      appState.productPaging = { ...base, ...appState.productPaging };
    }
    if(!['local','backend'].includes(appState.productPaging.mode)) appState.productPaging.mode = 'local';
    appState.productPaging.page = Math.max(1, Number(appState.productPaging.page || 1));
    appState.productPaging.totalPages = Math.max(1, Number(appState.productPaging.totalPages || 1));
    appState.productPaging.total = Math.max(0, Number(appState.productPaging.total || 0));
    appState.productPaging.limit = Math.max(1, Number(appState.productPaging.limit || 120));
    return appState.productPaging;
  }

  function ensureBranchRuntimeShape(branch){
    if(!branch || typeof branch !== 'object') return branch;
    if(!Array.isArray(branch.sheetPreviewProducts)) branch.sheetPreviewProducts = [];
    if(!Array.isArray(branch.sheetMapRows)) branch.sheetMapRows = [];
    if(!Array.isArray(branch.sheetHeaders)) branch.sheetHeaders = [];
    if(!branch.sheetStatusText) branch.sheetStatusText = '';
    return branch;
  }

  function ensureAppRuntimeState(){
    ensureProductPagingState();
    if(!appState.ui || typeof appState.ui !== 'object') appState.ui = { sheetExpanded:false, productGroupMode:true, rackLibraryOpenIds:['std_4'] };
    appState.ui = { sheetExpanded:false, productGroupMode:true, rackLibraryOpenIds:['std_4'], isoView:'NE', isoIsolation:'all', isoGhost:true, nav3DRoof:false, nav3DArchitectural:false, ...appState.ui };
    if(typeof appState.ui.productGroupMode !== 'boolean') appState.ui.productGroupMode = true;
    if(!Array.isArray(appState.ui.rackLibraryOpenIds)) appState.ui.rackLibraryOpenIds = ['std_4'];
    if(!['NE','NW','SE','SW'].includes(appState.ui.isoView)) appState.ui.isoView = 'NE';
    if(!['all','zone','rack'].includes(appState.ui.isoIsolation)) appState.ui.isoIsolation = 'all';
    if(typeof appState.ui.isoGhost !== 'boolean') appState.ui.isoGhost = true;
    if(!appState.admin || typeof appState.admin !== 'object') appState.admin = { branches:[], users:[], company:{} };
    if(!Array.isArray(appState.admin.branches)) appState.admin.branches = [];
    if(!Array.isArray(appState.admin.users)) appState.admin.users = [];
    if(!appState.admin.company || typeof appState.admin.company !== 'object') appState.admin.company = {};
    appState.admin.branches.forEach(ensureBranchRuntimeShape);
    if(!appState.layout || typeof appState.layout !== 'object') appState.layout = { zones:[], racks:[], walls:[], openings:[] };
    if(!Array.isArray(appState.layout.zones)) appState.layout.zones = [];
    if(!Array.isArray(appState.layout.racks)) appState.layout.racks = [];
    if(!Array.isArray(appState.layout.walls)) appState.layout.walls = [];
    if(!Array.isArray(appState.layout.openings)) appState.layout.openings = [];
    if(!appState.editor || typeof appState.editor !== 'object'){
      appState.editor = {
        mode:'select', dragging:null, offset:{x:0,y:0}, viewBox:{x:0,y:0,w:900,h:620}, sectionVisible:true,
        racksVisible:true, wallsVisible:true, openingsVisible:true, rackPropsOpen:true, sectionCuts:{ x:{pos:.5,dir:1}, y:{pos:.5,dir:1} }, view:'ortho',
        zonesLocked:false, showDims:true, snapEnabled:true, snapSize:2, dimFontSize:32, stackMenu:{ open:false, rackId:'', x:0, y:0 }, inspectorStackOpen:false,
        dragSelect:{ active:false, additive:false, start:null, end:null }, snapPreview:null, viewBoxCustomized:false, pendingWallPoint:null
      };
    }
    if(typeof appState.editor.mode !== 'string' || !appState.editor.mode) appState.editor.mode = 'select';
    if(!appState.history || typeof appState.history !== 'object') appState.history = { layout:{ undoStack:[], redoStack:[], isApplying:false, max:80 }, racks:{ undoStack:[], redoStack:[], isApplying:false, max:80 } };
    if(!appState.auth || typeof appState.auth !== 'object') appState.auth = { loggedIn:false, user:'', role:'', company:'', companyCode:'' };
    if(!appState.productFilters || typeof appState.productFilters !== 'object') appState.productFilters = { brand:'', category:'', gender:'', warehouse:'', zone:'', rack:'', image_state:'', location_state:'', stock_state:'' };
    if(!appState.productFacets || typeof appState.productFacets !== 'object') appState.productFacets = { brands:[], categories:[], warehouses:[], zones:[], racks:[] };
    return appState;
  }

  function showToast(message, type='success', timeout=2600){
    if(!toastStack) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = String(message || '').trim() || 'Listo';
    toastStack.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(6px)'; }, Math.max(500, timeout-260));
    setTimeout(()=> el.remove(), timeout);
  }

  function closeAppModal(result=false){
    if(appModalBackdrop) appModalBackdrop.classList.remove('show');
    if(modalResolver){ const r = modalResolver; modalResolver=null; r(result); }
  }

  function openAppModal({title='Aviso', message='', actions=[]}={}){
    if(!appModalBackdrop) return Promise.resolve(false);
    appModalTitle.textContent = title;
    appModalBody.innerHTML = Array.isArray(message) ? message.map(line => `<div>${escapeHtml(String(line))}</div>`).join('') : `<div>${escapeHtml(String(message))}</div>`;
    appModalActions.innerHTML = '';
    return new Promise(resolve => {
      modalResolver = resolve;
      const finalActions = actions.length ? actions : [{label:'Cerrar', value:true, cls:'secondary'}];
      finalActions.forEach(action => {
        const btn = document.createElement('button');
        btn.type='button';
        btn.className = `btn ${action.cls || 'secondary'}`.trim();
        btn.textContent = action.label || 'Aceptar';
        btn.onclick = ()=> closeAppModal(action.value);
        appModalActions.appendChild(btn);
      });
      appModalBackdrop.classList.add('show');
    });
  }

  if(appModalClose) appModalClose.onclick = ()=> closeAppModal(false);
  if(appModalBackdrop) appModalBackdrop.addEventListener('click', e=>{ if(e.target === appModalBackdrop) closeAppModal(false); });

  const __nativeAlert = window.alert ? window.alert.bind(window) : null;
  let alertQueue = Promise.resolve();
  let lastAlertMessage = '';
  let lastAlertAt = 0;
  window.alert = function(message='Aviso'){
    const msg = String(message || '').trim() || 'Aviso';
    const now = Date.now();
    if(msg === lastAlertMessage && (now - lastAlertAt) < 900) return Promise.resolve(true);
    lastAlertMessage = msg;
    lastAlertAt = now;
    alertQueue = alertQueue.then(()=> openAppModal({ title:'Aviso', message:msg, actions:[{label:'Aceptar', value:true, cls:'primary'}] })).catch(()=>true);
    return alertQueue;
  };

  function branchLabel(branch, index){ return String(branch?.name || `Sucursal ${Number(index)+1}`); }

  function exportAdminConfig(){
    try{
      const payload = { exportedAt:new Date().toISOString(), version:'fase3', admin:sanitizedAdminState(), branchLayouts:loadBranchLayouts(), models:appState.models };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `wms-config-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(a.href), 800);
      showToast('Configuración exportada.', 'success');
    }catch(err){ showToast(err.message || 'No se pudo exportar la configuración.', 'error', 3600); }
  }

  function triggerImportConfig(){ if(configImportInput) configImportInput.click(); }

  async function handleConfigImportFile(file){
    if(!file) return;
    try{
      const text = await file.text();
      const data = JSON.parse(text);
      const ok = await openAppModal({ title:'Importar configuración', message:'Esto reemplazará la configuración local actual de empresa, sucursales, layouts y racks. ¿Deseas continuar?', actions:[{label:'Cancelar', value:false, cls:'secondary'},{label:'Importar', value:true, cls:'primary'}] });
      if(!ok) return;
      if(data.admin) appState.admin = normalizeAdminState(data.admin);
      if(Array.isArray(data.branchLayouts)) appState.branchLayouts = normalizeBranchLayouts(data.branchLayouts);
      if(Array.isArray(data.models) && data.models.length) appState.models = data.models.map(m => ({ ...m }));
      saveAdminState();
      saveBranchLayouts();
      saveRackModels(appState.models);
      renderApp();
      showToast('Configuración importada correctamente.', 'success');
    }catch(err){ showToast(err.message || 'No se pudo importar el archivo.', 'error', 3600); }
    finally{ if(configImportInput) configImportInput.value=''; }
  }

  if(configImportInput) configImportInput.addEventListener('change', e => handleConfigImportFile(e.target.files?.[0]));

  function validateBranchSheetSetup(branch){
    const issues = [];
    const url = String(branch?.sheetUrl || '').trim();
    const sheetName = String(branch?.sheetName || '').trim();
    if(!url) issues.push('Falta la URL o ID del Sheet.');
    if(!sheetName) issues.push('Falta el nombre de la hoja.');
    const headers = Array.isArray(branch?.sheetHeaders) ? branch.sheetHeaders.filter(Boolean) : [];
    if(!headers.length) issues.push('Primero debes leer la fila 1.');
    const rows = Array.isArray(branch?.sheetMapRows) ? branch.sheetMapRows : [];
    const required = ['sku','nombre','ubicacion'];
    required.forEach(field => {
      const found = rows.find(row => row.field === field && String(row.header || '').trim());
      if(!found) issues.push(`Falta mapear el campo ${field.toUpperCase()}.`);
    });
    return issues;
  }

  function copyBranchSheetConfig(fromIndex, toIndex){
    const from = appState.admin.branches[fromIndex];
    const to = appState.admin.branches[toIndex];
    if(!from || !to || fromIndex===toIndex) return;
    ensureBranchSheetFields();
    to.sheetMapRows = JSON.parse(JSON.stringify(from.sheetMapRows || defaultSheetMapRows()));
    to.sheetHeaders = Array.isArray(from.sheetHeaders) ? from.sheetHeaders.slice() : [];
    to.sheetHeaderIndex = Number(from.sheetHeaderIndex || 0);
    to.sheetConnected = !!to.sheetHeaders.length;
    to.sheetStatusText = `Mapeo copiado desde ${branchLabel(from, fromIndex)}.`;
    markBranchDirty(toIndex);
    saveAdminState();
    renderSheetScreen();
    showToast(`Configuración copiada a ${branchLabel(to, toIndex)}.`, 'success');
  }

  async function clearBranchImportedData(index, mode='products'){
    const branch = appState.admin.branches[index];
    if(!branch) return;
    const isActiveBranch = Number(appState.activeBranchIndex) === Number(index) || Number(appState.viewerBranchIndex) === Number(index) || Number(appState.admin?.activeBranch) === Number(index);
    if(mode === 'cache'){
      if(isActiveBranch){
        appState.searchIndex = buildProductSearchIndex(appState.products || []);
        appState.filtered = Array.isArray(appState.products) ? appState.products.slice() : [];
        renderProducts(appState.filtered || []);
        renderMapView();
      }
      branch.sheetStatusText = 'Búsqueda reconstruida para esta sucursal.';
      saveAdminState();
      renderSheetScreen();
      showToast(branch.sheetStatusText, 'success', 2800);
      return;
    }
    clearImportedProductsForBranch(index, { resetUi:isActiveBranch, clearHeaders:false });
    branch.sheetStatusText = 'Productos importados eliminados. El mapeo se conservó.';
    setBranchMetaStatus(branch, branch.sheetHeaders?.length ? BRANCH_STATUS.MAPPED : BRANCH_STATUS.LINKED, { productCount:0, headerCount:getSheetBranchHeaderCount(branch) });
    if(isActiveBranch){
      setProductDataset([]);
      appState.filtered = [];
      appState.searchIndex = [];
      appState.selectedProduct = null;
      renderProducts([]);
      renderMapView();
    }
    saveAdminState();
    renderSheetScreen();
    showToast(branch.sheetStatusText, 'warn', 3200);
  }

  const DEFAULT_ZONE_COLOR = '#ffd84d';
  const DEFAULT_ZONE_SIZE = { w:580, h:420 };
  const BRANCH_STATUS = {
    EMPTY:'EMPTY',
    LINKED:'LINKED',
    HEADERS_LOADED:'HEADERS_LOADED',
    MAPPED:'MAPPED',
    IMPORTED:'IMPORTED',
    DIRTY:'DIRTY',
    ERROR:'ERROR',
    LOADING:'LOADING'
  };

  function sortProductsStable(list){
    const arr = Array.isArray(list) ? list.slice() : [];
    return arr.sort((a,b)=> String(a?.nombre||'').localeCompare(String(b?.nombre||''), 'es', { sensitivity:'base' }) || String(a?.variante||'').localeCompare(String(b?.variante||''), 'es', { sensitivity:'base' }) || String(a?.sku||'').localeCompare(String(b?.sku||''), 'es', { sensitivity:'base' }));
  }
  function buildProductSearchIndex(products){
    return (Array.isArray(products) ? products : []).map((p, idx) => {
      const familyText = norm([p.marca, p.codigo, p.cod, p.modelo, p.nombre].filter(Boolean).join(' '));
      const variantText = norm([getProductSizeValue(p), getProductColorValue(p), p.variante, p.sku, p.barras].filter(Boolean).join(' '));
      const locationText = norm([p.ubicacion, p.almacen, p.rack, p.rackStore].filter(Boolean).join(' '));
      const nameOnly = norm(p.nombre || '');
      const nameVariant = norm(`${p.nombre || ''} ${p.variante || ''}`);
      return {
        p,
        idx,
        familyText,
        variantText,
        locationText,
        haystack: [familyText, variantText, locationText].filter(Boolean).join(' '),
        nameOnly,
        nameVariant,
        exactSku: norm(p.sku || ''),
        exactRack: norm(p.rack || ''),
        exactRackStore: norm(p.rackStore || ''),
        exactUbic: norm(p.ubicacion || ''),
        exactAlm: norm(p.almacen || '')
      };
    });
  }
  function setProductDataset(list, options = {}){
    const paging = ensureProductPagingState();
    const next = options.keepOrder ? (Array.isArray(list) ? list.slice() : []) : sortProductsStable(list);
    appState.products = next;
    appState.filtered = next.slice();
    appState.searchIndex = buildProductSearchIndex(next);
    if(paging.mode !== 'backend'){
      paging.total = next.length;
      paging.totalPages = 1;
      paging.page = 1;
    }
  }

  function apiGetJson(url){
    return fetch(url, { credentials:'include', cache:'no-store' }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if(!res.ok || data?.ok === false){
        const err = new Error(data?.error || `HTTP ${res.status}`);
        err.status = Number(res.status || 0);
        err.payload = data;
        throw err;
      }
      return data;
    });
  }
  function getBranchByIndex(branchIndex){
    return (appState.admin?.branches || [])[Number(branchIndex)] || null;
  }
  function getCurrentProductsTotal(){
    const paging = ensureProductPagingState();
    return Number(paging.total || 0) || (Array.isArray(appState.products) ? appState.products.length : 0);
  }
  function ensureProductPagerUi(){
    if(!productToolbar || document.getElementById('productPager')) return;
    const pager = document.createElement('div');
    pager.className = 'product-pager';
    pager.id = 'productPager';
    pager.innerHTML = `
      <button class="pager-btn" id="productPrevPage" type="button">←</button>
      <div class="pager-info" id="productPageInfo">Página 1 / 1</div>
      <button class="pager-btn" id="productNextPage" type="button">→</button>
      <span class="pager-mode" id="productModeChip">local</span>
    `;
    productToolbar.appendChild(pager);
    const prev = document.getElementById('productPrevPage');
    const next = document.getElementById('productNextPage');
    prev?.addEventListener('click', () => {
      if((appState.productPaging?.page || 1) <= 1) return;
      requestProductsPage({ page: (appState.productPaging.page || 1) - 1 });
    });
    next?.addEventListener('click', () => {
      if((appState.productPaging?.page || 1) >= (appState.productPaging?.totalPages || 1)) return;
      requestProductsPage({ page: (appState.productPaging.page || 1) + 1 });
    });
  }
  function updateProductPagerUi(){
    const paging = ensureProductPagingState();
    const info = document.getElementById('productPageInfo');
    const prev = document.getElementById('productPrevPage');
    const next = document.getElementById('productNextPage');
    const chip = document.getElementById('productModeChip');
    const total = Number(paging.total || 0);
    if(info) info.textContent = `Página ${paging.page || 1} / ${paging.totalPages || 1} • ${total.toLocaleString('es-PE')} registros`;
    if(prev) prev.disabled = (paging.page || 1) <= 1 || !!paging.loading;
    if(next) next.disabled = (paging.page || 1) >= (paging.totalPages || 1) || !!paging.loading;
    if(chip) chip.textContent = paging.mode === 'backend' ? 'api' : 'local';
  }

  function getActiveProductFilters(){
    return { ...(appState.productFilters || {}) };
  }

  function getNormalizedProductFilterEntries(filters = null){
    const src = filters || appState.productFilters || {};
    return Object.entries(src).map(([key, value]) => [key, String(value || '').trim()]).filter(([, value]) => value);
  }

  function updateFilterSummaryChip(){
    const chip = document.getElementById('productFilterSummary');
    if(!chip) return;
    const activeCount = getNormalizedProductFilterEntries().length;
    chip.textContent = activeCount ? `${activeCount} filtro${activeCount === 1 ? '' : 's'} activo${activeCount === 1 ? '' : 's'}` : 'Sin filtros';
    chip.dataset.active = activeCount ? '1' : '0';
  }

  function buildFacetOptionsHtml(items = [], label = 'Todos'){
    const normalized = Array.isArray(items)
      ? items.map(item => typeof item === 'string' ? { value:item, count:null } : item).filter(item => String(item?.value || '').trim())
      : [];
    return [`<option value="">${label}</option>`].concat(normalized.map(item => {
      const value = escapeHtml(item.value || '');
      const suffix = item.count != null ? ` (${Number(item.count || 0).toLocaleString('es-PE')})` : '';
      return `<option value="${value}">${value}${suffix}</option>`;
    })).join('');
  }

  function ensureProductFilterBar(){
    const existing = document.getElementById('productFilterBar');
    if(existing) existing.remove();
    return null;
  }

  function syncProductFilterUi(){
    // Filtros avanzados ocultos en esta versión estable: se conserva solo buscador principal.
    ensureProductFilterBar();
    updateFilterSummaryChip();
    updateCategoryFilterButton();
  }

  function readProductRawValue(product, aliases = []){
    const raw = product?._raw && typeof product._raw === 'object' ? product._raw : null;
    if(!raw) return '';
    const entries = Object.entries(raw);
    for(const alias of aliases){
      const wanted = norm(alias);
      const hit = entries.find(([key]) => norm(key) === wanted);
      if(hit && String(hit[1] || '').trim()) return String(hit[1] || '').trim();
    }
    return '';
  }

  function getProductCategoryValue(product){
    const p = product || {};
    return String(
      p.category || p.categoria || p.categoría || p.Categoria || p.Categoría ||
      readProductRawValue(p, ['categoria','categoría','category']) || ''
    ).trim();
  }

  function canonicalGenderValue(value){
    const raw = String(value || '').trim();
    const n = norm(raw);
    if(!n) return '';
    if(['varon','hombre','caballero','masculino'].includes(n)) return 'Varón';
    if(['mujer','dama','femenino'].includes(n)) return 'Mujer';
    if(['nino','niño','ninos','niños','kidboy','boy'].includes(n)) return 'Niños';
    if(['nina','niña','ninas','niñas','kidgirl','girl'].includes(n)) return 'Niñas';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function getProductGenderValue(product){
    const p = product || {};
    return canonicalGenderValue(
      p.gender || p.genero || p.género || p.Genero || p.Género ||
      readProductRawValue(p, ['genero','género','gender']) || ''
    );
  }

  function getCategoryDisplayName(value){
    const raw = String(value || '').trim();
    return raw || 'Sin categoría';
  }

  function getCategoryStats(genderFilter = ''){
    const products = Array.isArray(appState.products) ? appState.products : [];
    const activeGender = canonicalGenderValue(genderFilter || appState.productFilters?.gender || '');
    const groups = new Map();
    products.forEach(p => {
      if(activeGender && getProductGenderValue(p) !== activeGender) return;
      const raw = getProductCategoryValue(p);
      if(!raw) return;
      const key = norm(raw);
      if(!groups.has(key)) groups.set(key, { key, value: raw, label: getCategoryDisplayName(raw), count:0, families:new Set(), images:[] });
      const g = groups.get(key);
      g.count += 1;
      g.families.add(norm(p?.nombre || '') || String(p?.sku || ''));
      if(g.images.length < 4){
        const img = getProductImageUrls(p)[0] || '';
        if(img && !g.images.includes(img)) g.images.push(img);
      }
    });
    return Array.from(groups.values()).map(g => ({ ...g, familiesCount:g.families.size })).sort((a,b) => {
      return b.familiesCount - a.familiesCount || b.count - a.count || a.label.localeCompare(b.label, 'es', { sensitivity:'base' });
    });
  }

  function updateCategoryFilterButton(){
    const btn = document.getElementById('btnOpenCategoryPinterest');
    if(!btn) return;
    const active = String(appState.productFilters?.category || '').trim();
    const activeGender = canonicalGenderValue(appState.productFilters?.gender || '');
    btn.classList.toggle('active', !!(active || activeGender));
    if(active && activeGender) btn.innerHTML = `Categoría: <span>${escapeHtml(active)}</span> · ${escapeHtml(activeGender)}`;
    else if(active) btn.innerHTML = `Categoría: <span>${escapeHtml(active)}</span>`;
    else if(activeGender) btn.innerHTML = `Categorías · ${escapeHtml(activeGender)}`;
    else btn.innerHTML = 'Categorías';
    btn.title = active || activeGender ? `Filtro activo: ${[active, activeGender].filter(Boolean).join(' · ')}` : 'Filtrar por categoría';
  }

  function openCategoryPinterestModal(){
    const existing = document.getElementById('categoryPinterestModal');
    if(existing) existing.remove();
    const active = String(appState.productFilters?.category || '').trim();
    let activeGender = canonicalGenderValue(appState.productFilters?.gender || '');
    const totalProducts = Array.isArray(appState.products) ? appState.products.length : 0;
    const modal = document.createElement('div');
    modal.id = 'categoryPinterestModal';
    modal.className = 'category-pinterest-backdrop show';
    modal.innerHTML = `
      <div class="category-pinterest-shell">
        <div class="category-pinterest-head">
          <div>
            <div class="search-card-kicker">Filtro visual</div>
            <h2>Categorías</h2>
            <p>Selecciona una categoría para filtrar el listado de productos. Vista tipo Pinterest para navegar más rápido.</p>
          </div>
          <div class="category-pinterest-actions">
            <span class="chip">${totalProducts.toLocaleString('es-PE')} registros</span>
            <button class="btn secondary" id="btnClearCategoryFilter" type="button">Todas</button>
            <button class="location-modal-close" type="button" id="btnCloseCategoryPinterest" aria-label="Cerrar">✕</button>
          </div>
        </div>
        <div class="category-pinterest-toolbar">
          <input id="categoryPinterestSearch" placeholder="Buscar categoría..." autocomplete="off">
          <span class="muted tiny" id="categoryPinterestCounter">0 categorías detectadas</span>
        </div>
        <div class="category-pinterest-genders" id="categoryPinterestGenders">
          ${['Mujer','Varón','Niños','Niñas'].map(label => `<button type="button" class="category-gender-pill ${activeGender===label?'active':''}" data-gender-value="${label}">${label}</button>`).join('')}
        </div>
        <div class="category-pinterest-grid" id="categoryPinterestGrid"></div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('#btnCloseCategoryPinterest')?.addEventListener('click', close);
    modal.addEventListener('click', e => { if(e.target === modal) close(); });
    modal.querySelector('#btnClearCategoryFilter')?.addEventListener('click', () => {
      appState.productFilters.category = '';
      appState.productFilters.gender = '';
      close();
      filterProducts();
      updateCategoryFilterButton();
    });
    const grid = modal.querySelector('#categoryPinterestGrid');
    const search = modal.querySelector('#categoryPinterestSearch');
    const counter = modal.querySelector('#categoryPinterestCounter');
    const renderGrid = () => {
      const categories = getCategoryStats(activeGender);
      const q = norm(search?.value || '');
      const filtered = categories.filter(cat => !q || norm(`${cat.label} ${cat.value}`).includes(q));
      counter.textContent = `${categories.length.toLocaleString('es-PE')} categorías detectadas`;
      if(!filtered.length){
        grid.innerHTML = `<div class="empty compact"><b>No hay categorías detectadas</b><div class="muted tiny">Verifica que el Sheet tenga valores en la columna Categoria y, si usas género, prueba con otra opción como Mujer, Varón, Niños o Niñas.</div></div>`;
        return;
      }
      grid.innerHTML = filtered.map((cat, idx) => {
        const isActive = active && cat.value === active;
        const media = cat.images.length
          ? `<div class="category-pinterest-media count-${Math.min(cat.images.length,4)}">${cat.images.slice(0,4).map(url => `<img src="${escapeHtml(url)}" alt="${escapeHtml(cat.label)}">`).join('')}</div>`
          : `<div class="category-pinterest-media empty"><span>${escapeHtml(cat.label.slice(0,2).toUpperCase())}</span></div>`;
        return `<button class="category-pinterest-card ${isActive ? 'active' : ''} size-${(idx % 5) + 1}" type="button" data-category-value="${escapeHtml(cat.value)}">
          ${media}
          <div class="category-pinterest-card-body">
            <div><b>${escapeHtml(cat.label)}</b><small>${cat.familiesCount.toLocaleString('es-PE')} producto${cat.familiesCount === 1 ? '' : 's'} • ${cat.count.toLocaleString('es-PE')} variante${cat.count === 1 ? '' : 's'}</small></div>
            <span>${isActive ? 'Activo' : 'Filtrar'}</span>
          </div>
        </button>`;
      }).join('');
      grid.querySelectorAll('[data-category-value]').forEach(btn => {
        btn.addEventListener('click', () => {
          appState.productFilters.category = String(btn.dataset.categoryValue || '').trim();
          appState.productFilters.gender = activeGender || '';
          close();
          filterProducts();
          updateCategoryFilterButton();
        });
      });
    };
    modal.querySelectorAll('[data-gender-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const clicked = canonicalGenderValue(btn.dataset.genderValue || '');
        activeGender = activeGender === clicked ? '' : clicked;
        appState.productFilters.gender = activeGender;
        modal.querySelectorAll('[data-gender-value]').forEach(pill => pill.classList.toggle('active', canonicalGenderValue(pill.dataset.genderValue || '') === activeGender));
        filterProducts();
        updateCategoryFilterButton();
        renderGrid();
      });
    });
    search?.addEventListener('input', renderGrid);
    renderGrid();
    window.setTimeout(() => search?.focus(), 80);
  }

  function updateProductAnalyticsSummary(){
    const summary = appState.productSummaryData || null;
    const foot = document.getElementById('contentFootRight');
    if(!summary){ if(foot) foot.textContent = '—'; return; }
    const pieces = [];
    if(Number(summary.with_location || 0) || Number(summary.total || 0)) pieces.push(`${Number(summary.with_location || 0).toLocaleString('es-PE')} con ubicación`);
    if(Number(summary.with_image || 0) || Number(summary.total || 0)) pieces.push(`${Number(summary.with_image || 0).toLocaleString('es-PE')} con imagen`);
    if(Number(summary.with_stock || 0) || Number(summary.total || 0)) pieces.push(`${Number(summary.with_stock || 0).toLocaleString('es-PE')} con stock`);
    if(foot) foot.textContent = pieces.length ? pieces.join(' • ') : '—';
  }

  async function fetchProductsSummary(branchIndex = null){
    const targetBranchIndex = Number.isFinite(branchIndex) ? Number(branchIndex) : getActiveBranchIndex();
    const branch = getBranchByIndex(targetBranchIndex);
    if(!branch?.id) return null;
    try{
      const data = await apiGetJson(`/api/branches/${branch.id}/products-summary`);
      appState.productSummaryData = data?.summary || null;
      if(data?.facets) appState.productFacets = data.facets;
      syncProductFilterUi();
      updateProductAnalyticsSummary();
      return data;
    }catch(_err){
      return null;
    }
  }
  async function fetchBranchProductsPage(branchIndex, { query = '', page = 1, limit = null, filters = null } = {}){
    const paging = ensureProductPagingState();
    const branch = getBranchByIndex(branchIndex);
    if(!branch?.id) return null;
    const pageSize = Number(limit || paging.limit || 120);
    const params = new URLSearchParams();
    if(query) params.set('q', query);
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    getNormalizedProductFilterEntries(filters).forEach(([key, value]) => params.set(key, value));
    return apiGetJson(`/api/branches/${branch.id}/products?${params.toString()}`);
  }
  async function requestProductsPage({ branchIndex = null, query = null, page = null, silent = false } = {}){
    ensureAppRuntimeState();
    const paging = ensureProductPagingState();
    const targetBranchIndex = Number.isFinite(branchIndex) ? Number(branchIndex) : getActiveBranchIndex();
    const nextQuery = query != null ? String(query || '').trim() : String(paging?.query || '').trim();
    const nextPage = Math.max(1, Number(page || paging?.page || 1));
    const branch = getBranchByIndex(targetBranchIndex);
    if(!branch?.id) return false;
    if(paging.backendUnavailable){
      appState.productPaging = { ...paging, mode:'local', loading:false, query:nextQuery };
      filterProducts();
      return false;
    }
    try{
      appState.productPaging.loading = true;
      appState.productPaging.branchId = Number(branch.id || 0);
      updateProductPagerUi();
      const activeFilters = getActiveProductFilters();
      const data = await fetchBranchProductsPage(targetBranchIndex, { query: nextQuery, page: nextPage, filters: activeFilters });
      const items = Array.isArray(data?.items) ? data.items : [];
      if(data?.facets) appState.productFacets = data.facets;
      appState.productPaging = {
        ...appState.productPaging,
        mode:'backend',
        page:Number(data?.page || nextPage || 1),
        limit:Number(data?.limit || appState.productPaging.limit || 120),
        total:Number(data?.total || items.length || 0),
        totalPages:Number(data?.total_pages || 1),
        query:nextQuery,
        loading:false,
        branchId:Number(branch.id || 0),
        filters:activeFilters,
        lastError:''
      };
      setProductDataset(items, { keepOrder:true });
      appState.filtered = appState.products.filter(p => productMatchesLocalFilters(p));
      countProducts.textContent = getCurrentProductsTotal().toLocaleString('es-PE');
      syncProductFilterUi();
      renderProducts(appState.filtered);
      const selectedKey = getProductIdentityKey(appState.selectedProduct);
      const selectedStillVisible = items.find(p => getProductIdentityKey(p) === selectedKey);
      if(selectedStillVisible) updateActiveProductCard(selectedStillVisible);
      else if(items[0]) selectProduct(items[0]);
      else updateActiveProductCard(null);
      if(!silent) syncActiveProductCardHint();
      if(!silent || !appState.productSummaryData) fetchProductsSummary(targetBranchIndex);
      updateProductPagerUi();
      return true;
    }catch(err){
      const status = Number(err?.status || 0);
      if(status === 404){
        appState.productPaging = {
          ...ensureProductPagingState(),
          mode:'local',
          page:1,
          total:Array.isArray(appState.products) ? appState.products.length : 0,
          totalPages:1,
          query:nextQuery,
          loading:false,
          branchId:Number(branch.id || 0),
          filters:getActiveProductFilters(),
          lastError:'backend_404_local_fallback',
          backendUnavailable:true
        };
        filterProducts();
        updateProductPagerUi();
        return false;
      }
      appState.productPaging.loading = false;
      appState.productPaging.lastError = String(err?.message || err || 'error');
      updateProductPagerUi();
      return false;
    }
  }

  function getHistoryBucket(type){
    if(!appState.history) appState.history = { layout:{ undoStack:[], redoStack:[], isApplying:false, max:80 }, racks:{ undoStack:[], redoStack:[], isApplying:false, max:80 } };
    return appState.history[type];
  }
  function snapshotForType(type){
    if(type === 'layout') return clone(appState.layout || defaultLayout());
    if(type === 'racks') return clone(appState.models || []);
    return null;
  }
  function recordHistorySnapshot(type, snapshot = null){
    const bucket = getHistoryBucket(type);
    if(!bucket || bucket.isApplying) return;
    const snap = snapshot == null ? snapshotForType(type) : clone(snapshot);
    const serialized = JSON.stringify(snap);
    const last = bucket.undoStack[bucket.undoStack.length - 1];
    if(last === serialized) return;
    bucket.undoStack.push(serialized);
    if(bucket.undoStack.length > (bucket.max || 80)) bucket.undoStack.shift();
    bucket.redoStack = [];
    updateUndoRedoUi();
  }
  function applyHistoryState(type, payload){
    if(type === 'layout'){
      appState.layout = clone(payload || defaultLayout());
      ensureLayoutMeta();
      normalizeLayoutSectionState();
      appState.selectedZoneId = appState.layout?.zones?.[0]?.id || '';
      appState.selectedRackLayoutId = appState.layout?.racks?.[0]?.id || '';
      appState.selectedVertex = { zoneId:'', idx:-1 };
      appState.selectedEdge = { zoneId:'', a:-1, b:-1 };
      persistActiveLayout();
      if(appState.screen === 'layout'){ renderLayoutEditor(); renderLayoutInspector(); }
      else if(appState.screen === 'viewer' || appState.screen === 'products') renderMapView();
    } else if(type === 'racks'){
      appState.models = clone(Array.isArray(payload) ? payload : []);
      if(!appState.models.length){ updateUndoRedoUi(); return; }
      if(!appState.models.some(m => m.id === appState.selectedModelId)) appState.selectedModelId = appState.models[0].id;
      saveRackModels();
      if(appState.screen === 'racks') renderRackModels(); else renderRackModelPreview();
    }
    updateUndoRedoUi();
  }
  function undoHistory(type){
    const bucket = getHistoryBucket(type);
    if(!bucket || !bucket.undoStack.length) return;
    const current = JSON.stringify(snapshotForType(type));
    const previous = bucket.undoStack.pop();
    if(previous === current && bucket.undoStack.length){
      bucket.redoStack.push(current);
      const prev2 = bucket.undoStack.pop();
      if(prev2 == null){ updateUndoRedoUi(); return; }
      bucket.isApplying = true;
      try{ applyHistoryState(type, JSON.parse(prev2)); }
      finally{ bucket.isApplying = false; }
      return;
    }
    bucket.redoStack.push(current);
    bucket.isApplying = true;
    try{ applyHistoryState(type, JSON.parse(previous)); }
    finally{ bucket.isApplying = false; }
  }
  function redoHistory(type){
    const bucket = getHistoryBucket(type);
    if(!bucket || !bucket.redoStack.length) return;
    const current = JSON.stringify(snapshotForType(type));
    const next = bucket.redoStack.pop();
    bucket.undoStack.push(current);
    bucket.isApplying = true;
    try{ applyHistoryState(type, JSON.parse(next)); }
    finally{ bucket.isApplying = false; }
  }
  function updateUndoRedoUi(){
    ['layout','racks'].forEach(type => {
      const bucket = getHistoryBucket(type);
      const undoBtn = document.querySelector(`[data-history-undo="${type}"]`);
      const redoBtn = document.querySelector(`[data-history-redo="${type}"]`);
      if(undoBtn) undoBtn.disabled = !bucket.undoStack.length;
      if(redoBtn) redoBtn.disabled = !bucket.redoStack.length;
    });
  }
  let productSearchDebounce = null;

  function loadRackModels(){
    try{
      const raw = localStorage.getItem('wms_rack_models_v3');
      if(!raw) return null;
      const arr = JSON.parse(raw);
      if(!Array.isArray(arr) || !arr.length) return null;
      const baseDefaults = { std_4:{ width:120, depth:40, height:240 }, wide_5:{ width:120, depth:40, height:240 }, compact_3:{ width:120, depth:40, height:240 } };
      arr.forEach(model => {
        if(!model || !baseDefaults[model.id]) return;
        model.width = baseDefaults[model.id].width;
        model.depth = baseDefaults[model.id].depth;
        model.height = baseDefaults[model.id].height;
      });
      return arr;
    }catch{ return null; }
  }
  function saveRackModels(){
    try{ localStorage.setItem('wms_rack_models_v3', JSON.stringify(appState.models || [])); }catch{}
  }

  function makeDemoProducts(total = 8000){
    const bases = [
      ['Widget','Rojo'],['Gadget','Mediano'],['Componente','Azul'],['Producto','XL'],['Sensor','Negro'],['Caja técnica','Gris']
    ];
    const racks = buildDefaultLayoutForBranch(0).racks.map(r => r.id);
    const out = [];
    for(let i=1;i<=total;i++){
      const [n,v] = bases[i % bases.length];
      const rack = racks[i % racks.length];
      const lvl = (i % 4) + 1;
      const slot = (i % 2) + 1;
      const storageRack = racks[(i+3) % racks.length].startsWith('ALM') ? racks[(i+3)%racks.length] : 'ALM-E1';
      out.push({
        sku: 'SKU' + String(i).padStart(5,'0'),
        nombre: n + ' ' + ((i%12)+1),
        variante: v,
        ubicacion: `${rack}-N${lvl}-S${slot}`,
        almacen: `${storageRack}-N${((i+1)%4)+1}-S${((i+1)%2)+1}`,
        rack,
        rackStore: storageRack,
        zona: rack.split('-')[0],
        nivel: lvl,
        slot
      });
    }
    return out;
  }

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function debounce(fn, ms=120){ let t; return (...args) => { clearTimeout(t); t=setTimeout(() => fn(...args), ms); }; }
  function getIsoViewConfig(view = appState?.ui?.isoView || 'NE'){
    const configs = {
      NE:{ label:'Iso NE', sx: 1, sy: 1, compass:'N ↗' },
      NW:{ label:'Iso NW', sx:-1, sy: 1, compass:'N ↖' },
      SE:{ label:'Iso SE', sx: 1, sy:-1, compass:'S ↘' },
      SW:{ label:'Iso SW', sx:-1, sy:-1, compass:'S ↙' }
    };
    return configs[view] || configs.NE;
  }
  function toIso(x,y,z=0){
    const a = Math.PI/6;
    const cfg = getIsoViewConfig();
    const xx = Number(x || 0) * cfg.sx;
    const yy = Number(y || 0) * cfg.sy;
    return { x:(xx-yy)*Math.cos(a), y:(xx+yy)*Math.sin(a)-z };
  }
  function rotateIsoView(direction = 1){
    const order = ['NE','SE','SW','NW'];
    const current = appState.ui?.isoView || 'NE';
    const idx = Math.max(0, order.indexOf(current));
    appState.ui.isoView = order[(idx + direction + order.length) % order.length];
  }
  function setIsoView(view){
    ensureAppRuntimeState();
    appState.ui.isoView = ['NE','NW','SE','SW'].includes(view) ? view : 'NE';
  }
  const ISO_Z_SCALE = 0.42;
  function svgEl(tag, attrs={}){ const el = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v)); return el; }
  function face(points, attrs={}){ const d = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`; const baseAttrs = { d, 'stroke-linejoin':'round', 'stroke-linecap':'round', 'vector-effect':'non-scaling-stroke' }; return svgEl('path', { ...baseAttrs, ...attrs }); }
  function centroid(pts){ const s=pts.reduce((a,p)=>({x:a.x+p.x,y:a.y+p.y}),{x:0,y:0}); return { x:s.x/pts.length, y:s.y/pts.length }; }
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

  function parseSheetId(input){
    const value = String(input || '').trim();
    const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
    return match ? match[1] : value;
  }

  function parseSheetUrl(url){
    const t = String(url||'').trim();
    const m = t.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if(m) return m[1];
    if(/^[a-zA-Z0-9-_]{20,}$/.test(t)) return t;
    return '';
  }

  function normalizeLocationCode(txt){
    let raw = String(txt || '').trim().toUpperCase();
    if (!raw) return '';
    raw = raw.replace(/\s+/g, '-').replace(/--+/g, '-');
    raw = raw.replace(/([A-Z0-9]+)\s*(E\d+)/g, '$1-$2');
    raw = raw.replace(/(E\d+)\s*(N\d+)/g, '$1-$2');
    raw = raw.replace(/(N\d+)\s*([SP]\d+)/g, '$1-$2');
    raw = raw.replace(/[^A-Z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
    raw = raw.replace(/^ALM\d+(?=-E\d+$)/i, 'ALM');
    return raw;
  }
  function parseLocationCode(txt, fallbackRack='Z1-E1'){
    const raw = normalizeLocationCode(txt);
    const fallbackNorm = normalizeLocationCode(fallbackRack || 'Z1-E1') || 'Z1-E1';
    const fallbackZoneToken = (fallbackNorm.split('-')[0] || 'Z1').toUpperCase();
    const rawZoneToken = ((raw.match(/^([A-Z0-9]+)(?=-E\d+)/i) || [,''])[1] || fallbackZoneToken || 'Z1').toUpperCase();
    let zoneId = rawZoneToken;
    let zoneIndex = 0;
    if(/^ALM(?:ACEN)?$/i.test(rawZoneToken)){
      zoneId = 'ALM';
    } else {
      const zm = rawZoneToken.match(/^Z(\d+)$/i);
      if(zm){
        zoneIndex = Math.max(1, parseInt(zm[1], 10) || 1);
        zoneId = `Z${zoneIndex}`;
      } else {
        const fb = fallbackZoneToken.match(/^Z(\d+)$/i);
        if(/^ALM(?:ACEN)?$/i.test(fallbackZoneToken)){
          zoneId = 'ALM';
        } else if(fb){
          zoneIndex = Math.max(1, parseInt(fb[1], 10) || 1);
          zoneId = `Z${zoneIndex}`;
        } else {
          zoneId = 'Z1';
          zoneIndex = 1;
        }
      }
    }
    const est = Math.max(1, parseInt((raw.match(/-E(\d+)/i)||[])[1] || (fallbackNorm.match(/-E(\d+)/i)||[])[1] || '1', 10) || 1);
    const nivel = Math.max(1, parseInt((raw.match(/-N(\d+)/i)||[])[1] || '1', 10) || 1);
    const slot = Math.max(1, parseInt((raw.match(/-(?:S|P)(\d+)/i)||[])[1] || '1', 10) || 1);
    return { raw, zoneId, zoneIndex, rackId:`${zoneId}-E${est}`, level:nivel, slot, est, isStorage: zoneId === 'ALM' };
  }

  function isStorageZoneLike(value, name=''){
    const zid = String(value || '').trim().toUpperCase();
    const zname = norm(name || '');
    return /^ALM(?:ACEN)?$/i.test(zid) || /^ALM\d+$/i.test(zid) || zname === 'almacen';
  }
  function zoneBoundsOf(zone){
    const pts = Array.isArray(zone?.pts) ? zone.pts : [];
    const xs = pts.map(p=>Number(p.x)||0), ys = pts.map(p=>Number(p.y)||0);
    return { minX:Math.min(...xs), maxX:Math.max(...xs), minY:Math.min(...ys), maxY:Math.max(...ys) };
  }
  function isRectZone(zone){
    if(!zone || !Array.isArray(zone.pts) || zone.pts.length !== 4) return false;
    const b = zoneBoundsOf(zone);
    const expected = new Set([
      `${b.minX}|${b.minY}`,
      `${b.maxX}|${b.minY}`,
      `${b.maxX}|${b.maxY}`,
      `${b.minX}|${b.maxY}`
    ]);
    return zone.pts.every(pt => expected.has(`${Number(pt.x)||0}|${Number(pt.y)||0}`));
  }
  function setRectZoneBounds(zone, bounds){
    zone.pts = [
      { x:bounds.minX, y:bounds.minY },
      { x:bounds.maxX, y:bounds.minY },
      { x:bounds.maxX, y:bounds.maxY },
      { x:bounds.minX, y:bounds.maxY }
    ];
  }
  function guessAutoRackWidth(slots, baseWidth=150, baseSlots=2){
    const s = Math.max(1, Number(slots)||1);
    const bs = Math.max(1, Number(baseSlots)||2);
    if(s <= bs) return Math.max(baseWidth, 120);
    return Math.round(baseWidth + (s - bs) * Math.max(42, Math.round(baseWidth / (bs + 1))));
  }
  function ensureAutoRackModel(levels, slots, preferredModelId='std_4'){
    const pref = rackModel(preferredModelId) || rackModel('std_4') || appState.models[0] || { id:'std_4', name:'Rack', levels:4, slots:2, width:120, depth:40, height:240, clearance:0, style:'metallic' };
    const lv = Math.max(1, parseInt(levels || pref.levels || 4, 10) || 4);
    const sl = Math.max(1, parseInt(slots || pref.slots || 2, 10) || 2);
    const style = pref.style || 'standard';
    const id = `auto_${style}_${lv}n_${sl}s`;
    let model = appState.models.find(m => m.id === id);
    if(!model){
      model = {
        id,
        name:`Auto ${lv} niveles / ${sl} slots`,
        levels: lv,
        slots: sl,
        width: guessAutoRackWidth(sl, Number(pref.width)||120, Number(pref.slots)||2),
        depth: Math.max(40, Number(pref.depth)||40),
        height: Math.max(140, Number(pref.height)||240, 80 + lv * 40),
        clearance: Math.max(0, Number(pref.clearance)||0),
        style,
        beam: Math.max(4, Number(pref.beam)||6)
      };
      appState.models.push(model);
      saveRackModels();
    } else {
      model.levels = Math.max(model.levels||0, lv);
      model.slots = Math.max(model.slots||0, sl);
      model.width = Math.max(Number(model.width)||0, guessAutoRackWidth(sl, Number(pref.width)||120, Number(pref.slots)||2));
      model.depth = Math.max(Number(model.depth)||0, Math.max(40, Number(pref.depth)||40));
      model.height = Math.max(Number(model.height)||0, Math.max(140, Number(pref.height)||240, 80 + lv * 40));
    }
    return model.id;
  }
  function createAutoZone(zoneId, branchIndex=0){
    ensureBranchLayouts();
    const idx = Number.isFinite(Number(branchIndex)) ? Number(branchIndex) : getActiveLayoutBranchIndex();
    const layout = appState.branchLayouts?.[idx] || appState.layout || { zones:[] };
    const zones = Array.isArray(layout.zones) ? layout.zones : [];
    const gap = 120;
    const cols = 3;
    const existing = zones.length;
    const col = existing % cols;
    const row = Math.floor(existing / cols);
    const baseX = 80;
    const baseY = 80;
    const startX = baseX + col * (DEFAULT_ZONE_SIZE.w + gap);
    const startY = baseY + row * (DEFAULT_ZONE_SIZE.h + gap);
    const zoneName = String(zoneId).toUpperCase() === 'ALM' ? 'Almacén' : `Zona ${String(zoneId).toUpperCase().replace(/^Z/, '')}`;
    return makeRectZone(zoneId, zoneName, getBranchColor(branchIndex), startX, startY, DEFAULT_ZONE_SIZE.w, DEFAULT_ZONE_SIZE.h);
  }
  function ensureRackFitsZoneRect(zone, rack, margin=28){
    if(!isRectZone(zone) || !rack) return;
    const b = zoneBoundsOf(zone);
    let minX = b.minX, minY = b.minY, maxX = b.maxX, maxY = b.maxY;
    if(rack.x < minX + margin) minX = rack.x - margin;
    if(rack.y < minY + margin) minY = rack.y - margin;
    if(rack.x + rack.w > maxX - margin) maxX = rack.x + rack.w + margin;
    if(rack.y + rack.h > maxY - margin) maxY = rack.y + rack.h + margin;
    setRectZoneBounds(zone, { minX, minY, maxX, maxY });
  }
  function placeRackInZone(layout, zone, rack){
    const margin = 28, gap = 18;
    const b = zoneBoundsOf(zone);
    const sameZone = (layout.racks || []).filter(r => r.zoneId === zone.id && r.id !== rack.id).sort((a,b)=>(a.y-b.y)||(a.x-b.x));
    let x = b.minX + margin;
    let y = b.minY + margin;
    if(sameZone.length){
      const last = sameZone[sameZone.length - 1];
      x = last.x + last.w + gap;
      y = last.y;
      if(x + rack.w > b.maxX - margin){
        x = b.minX + margin;
        y = Math.max(...sameZone.map(r => r.y + r.h), b.minY + margin) + gap;
      }
    }
    rack.x = x;
    rack.y = y;
    ensureRackFitsZoneRect(zone, rack, margin);
  }
  function syncBranchLayoutWithProducts(branchIndex, products=[]){
    ensureBranchLayouts();
    const idx = Number.isFinite(Number(branchIndex)) ? Number(branchIndex) : getActiveLayoutBranchIndex();
    const layout = clone(appState.branchLayouts[idx] || buildDefaultLayoutForBranch(idx));
    if(!Array.isArray(layout.zones)) layout.zones = [];
    if(!Array.isArray(layout.racks)) layout.racks = [];
    if(!layout.meta || typeof layout.meta !== 'object') layout.meta = { createdAt: Date.now(), scaleCmPerUnit: 1 };

    const zoneIdRemap = new Map();
    (layout.zones || []).forEach(z => {
      const previousId = String(z?.id || '').toUpperCase();
      if(isStorageZoneLike(previousId, z?.name)){
        if(previousId && previousId !== 'ALM') zoneIdRemap.set(previousId, 'ALM');
        z.id = 'ALM';
        z.name = 'Almacén';
      }
    });
    (layout.racks || []).forEach(r => {
      const zid = String(r?.zoneId || '').toUpperCase();
      const nextZoneId = zoneIdRemap.get(zid) || (isStorageZoneLike(zid) ? 'ALM' : '');
      if(nextZoneId === 'ALM'){
        r.zoneId = 'ALM';
        r.id = String(r.id || '').replace(/^[A-Z0-9]+-E/i, 'ALM-E');
      }
    });

    const zoneReqs = new Map();
    let maxZoneIndex = 0;
    let hasALM = false;
    const touchZoneReq = zoneId => {
      if(!zoneReqs.has(zoneId)) zoneReqs.set(zoneId, { zoneId, maxRack:0, maxLevel:0, maxSlot:0, hits:0 });
      return zoneReqs.get(zoneId);
    };
    const pushReq = (loc, fallbackRack, forceZoneId='') => {
      const rawLoc = normalizeLocationCode(loc);
      if(!rawLoc && !forceZoneId) return;
      const parsed = parseLocationCode(rawLoc || forceZoneId, fallbackRack);
      let zoneId = forceZoneId || parsed.zoneId;
      let zoneIndex = parsed.zoneIndex || 0;
      if(!forceZoneId && /^ALM(?:ACEN)?(?:-|$)/i.test(rawLoc)) zoneId = 'ALM';
      if(!zoneId) return;
      if(zoneId === 'ALM') hasALM = true;
      else if(/^Z\d+$/i.test(zoneId)) maxZoneIndex = Math.max(maxZoneIndex, zoneIndex || 0);
      const req = touchZoneReq(zoneId);
      req.maxRack = Math.max(req.maxRack, parsed.est || 1);
      req.maxLevel = Math.max(req.maxLevel, parsed.level || 1);
      req.maxSlot = Math.max(req.maxSlot, parsed.slot || 1);
      req.hits += 1;
    };
    (products || []).forEach(p => {
      if(p?.ubicacion){
        const rawMain = normalizeLocationCode(p.ubicacion);
        const forceMainZone = /^ALM(?:ACEN)?(?:-|$)/i.test(rawMain) ? 'ALM' : '';
        pushReq(rawMain, p.rack || (forceMainZone === 'ALM' ? 'ALM-E1' : 'Z1-E1'), forceMainZone);
      }
      if(p?.almacen){
        const rawStore = normalizeLocationCode(p.almacen);
        const forceStoreZone = /^ALM(?:ACEN)?(?:-|$)/i.test(rawStore) ? 'ALM' : '';
        pushReq(rawStore, p.rackStore || (forceStoreZone === 'ALM' ? 'ALM-E1' : 'Z1-E1'), forceStoreZone);
      }
    });
    if((products || []).some(p => {
      const rawMain = normalizeLocationCode(p?.ubicacion);
      const rawStore = normalizeLocationCode(p?.almacen);
      return /^ALM(?:ACEN)?(?:-|$)/i.test(rawMain) || /^ALM(?:ACEN)?(?:-|$)/i.test(rawStore);
    })){
      hasALM = true;
      touchZoneReq('ALM');
    }

    const desiredZoneIds = [];
    for(let i=1;i<=Math.max(0, maxZoneIndex);i++) desiredZoneIds.push(`Z${i}`);
    if(hasALM || zoneReqs.has('ALM')) desiredZoneIds.push('ALM');
    const desiredZoneSet = new Set(desiredZoneIds);

    layout.zones = layout.zones.filter(z => {
      const zid = String(z?.id || '').toUpperCase();
      if(/^Z\d+$/.test(zid) || zid === 'ALM') return desiredZoneSet.has(zid);
      return true;
    });
    layout.racks = layout.racks.filter(r => {
      const zid = String(r?.zoneId || '').toUpperCase();
      if(/^Z\d+$/.test(zid) || zid === 'ALM') return desiredZoneSet.has(zid);
      return true;
    });

    desiredZoneIds.forEach(zoneId => {
      if(!layout.zones.some(z => z.id === zoneId)) layout.zones.push(createAutoZone(zoneId, idx));
    });

    desiredZoneIds.forEach(zoneId => {
      const req = zoneReqs.get(zoneId) || { maxRack:0, maxLevel:0, maxSlot:0 };
      const zone = layout.zones.find(z => z.id === zoneId) || createAutoZone(zoneId, idx);
      if(!layout.zones.some(z => z.id === zoneId)) layout.zones.push(zone);
      const maxRack = Math.max(0, req.maxRack || 0);
      const maxLevel = Math.max(1, req.maxLevel || 1);
      const maxSlot = Math.max(1, req.maxSlot || 1);

      if(maxRack > 0){
        const zoneRacks = layout.racks.filter(r => r.zoneId === zoneId);
        zoneRacks.forEach(r => {
          const m = String(r.id || '').match(/-E(\d+)$/i);
          const num = Math.max(1, parseInt(m?.[1] || '1', 10) || 1);
          if(num > maxRack) r.__drop = true;
        });
        layout.racks = layout.racks.filter(r => !r.__drop);
        const autoModelId = ensureAutoRackModel(maxLevel, maxSlot, zoneRacks[0]?.modelId || 'std_4');
        for(let e=1; e<=maxRack; e++){
          const rackId = `${zoneId}-E${e}`;
          let rack = layout.racks.find(r => r.id === rackId);
          if(!rack){
            rack = { id:rackId, zoneId, x:0, y:0, w:84, h:46, rot:0, modelId:autoModelId, front:'auto', baseHeight:0, rackHeight:238 };
            layout.racks.push(rack);
          }
          rack.zoneId = zoneId;
          rack.modelId = autoModelId;
          rack.rackHeight = Math.max(120, Number(rackModel(autoModelId)?.height || rack.rackHeight || 238));
          syncRackFootprint(rack, rack.x > 0 || rack.y > 0);
          if(!(Number.isFinite(rack.x) && Number.isFinite(rack.y)) || (rack.x === 0 && rack.y === 0)) placeRackInZone(layout, zone, rack);
          ensureRackFitsZoneRect(zone, rack);
        }
      }
    });

    layout.zones.sort((a,b) => {
      const aa = String(a?.id || '').toUpperCase(), bb = String(b?.id || '').toUpperCase();
      if(aa === 'ALM' && bb !== 'ALM') return 1;
      if(bb === 'ALM' && aa !== 'ALM') return -1;
      const na = parseInt((aa.match(/^Z(\d+)$/)||[])[1] || '9999', 10);
      const nb = parseInt((bb.match(/^Z(\d+)$/)||[])[1] || '9999', 10);
      return na - nb;
    });
    layout.zones.forEach(z => ensureZoneSectionCuts(z));
    appState.branchLayouts[idx] = layout;
    if(getActiveLayoutBranchIndex() === idx || appState.activeBranchIndex === idx){
      appState.layout = clone(layout);
      ensureLayoutMeta();
      ensureRackProps();
      appState.selectedZoneId = appState.selectedZoneId && appState.layout.zones.some(z => z.id === appState.selectedZoneId) ? appState.selectedZoneId : (appState.layout.zones[0]?.id || '');
      appState.selectedRackLayoutId = appState.selectedRackLayoutId && appState.layout.racks.some(r => r.id === appState.selectedRackLayoutId) ? appState.selectedRackLayoutId : (appState.layout.racks[0]?.id || '');
    }
    saveBranchLayouts();
  }
  function pointInPoly(point, vs){
    let inside = false;
    for (let i=0,j=vs.length-1;i<vs.length;j=i++){
      const xi=vs[i].x, yi=vs[i].y, xj=vs[j].x, yj=vs[j].y;
      const intersect = ((yi>point.y)!==(yj>point.y)) && (point.x < (xj-xi)*(point.y-yi)/(yj-yi+0.00001)+xi);
      if(intersect) inside = !inside;
    }
    return inside;
  }
  function dist2(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx + dy*dy; }
  function projectPointToSegment(p,a,b){
    const vx=b.x-a.x, vy=b.y-a.y, wx=p.x-a.x, wy=p.y-a.y;
    const vv = vx*vx + vy*vy || 1;
    let t = (wx*vx + wy*vy)/vv; t=Math.max(0,Math.min(1,t));
    return { x:a.x+t*vx, y:a.y+t*vy, t };
  }

  function getScaleCmPerUnit(){
    const v = Number(appState.layout?.meta?.scaleCmPerUnit);
    return Number.isFinite(v) && v > 0 ? v : 1;
  }
  function ensureLayoutMeta(){
    if(!appState.layout.meta || typeof appState.layout.meta !== 'object') appState.layout.meta = {};
    if(!Number.isFinite(Number(appState.layout.meta.scaleCmPerUnit)) || Number(appState.layout.meta.scaleCmPerUnit) <= 0) appState.layout.meta.scaleCmPerUnit = 1;
    return appState.layout.meta;
  }
  function unitsToCm(units){ return Number(units || 0) * getScaleCmPerUnit(); }
  function formatDistanceCm(units){
    const cm = unitsToCm(units);
    if(cm >= 100) return `${(cm/100).toFixed(2).replace(/\.00$/,'')} m`;
    return `${Math.round(cm)} cm`;
  }
  function formatDistanceShort(units){ return `${Math.round(unitsToCm(units))} cm`; }
  function polygonArea(pts){ let sum = 0; for(let i=0;i<pts.length;i++){ const a = pts[i], b = pts[(i+1)%pts.length]; sum += a.x*b.y - b.x*a.y; } return sum/2; }
  function polygonCentroid(pts){ const area = polygonArea(pts) || 1; let cx = 0, cy = 0; for(let i=0;i<pts.length;i++){ const a = pts[i], b = pts[(i+1)%pts.length]; const f = a.x*b.y - b.x*a.y; cx += (a.x + b.x) * f; cy += (a.y + b.y) * f; } return { x: cx / (6*area), y: cy / (6*area) }; }
  function pointNearPolygonEdge(point, pts, tolerance = 8){ for(let i=0;i<pts.length;i++){ const a = pts[i], b = pts[(i+1)%pts.length]; const proj = projectPointToSegment(point, a, b); if(Math.sqrt(dist2(point, proj)) <= tolerance) return true; } return false; }
  function rackCorners(rack){
    if(!rack) return [];
    const fp = getRackFootprint(rack.modelId, rack.rot || 0);
    const bw = fp.baseW || rack.w || 0;
    const bh = fp.baseH || rack.h || 0;
    const ang = normalizeAngle(rack.rot || 0) * Math.PI / 180;
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const cx = rack.x + (rack.w || fp.w || bw) / 2;
    const cy = rack.y + (rack.h || fp.h || bh) / 2;
    const pts = [
      { x:-bw/2, y:-bh/2 },
      { x:bw/2, y:-bh/2 },
      { x:bw/2, y:bh/2 },
      { x:-bw/2, y:bh/2 }
    ];
    return pts.map(pt => ({
      x: cx + pt.x * cos - pt.y * sin,
      y: cy + pt.x * sin + pt.y * cos
    }));
  }
  function rackFullyInsideZone(rack, zone){ return !!(rack && zone) && rackCorners(rack).every(pt => pointInPoly(pt, zone.pts) || pointNearPolygonEdge(pt, zone.pts, 1)); }
  function collectSnapPoints(exceptZoneId = ''){ const out = []; (appState.layout?.zones || []).forEach(zone => zone.pts.forEach((pt, idx) => { if(zone.id !== exceptZoneId) out.push({ x:pt.x, y:pt.y, zoneId:zone.id, idx }); })); return out; }
  function snapPointAdvanced(point, { zoneId = '', keepAxis = null, origin = null } = {}){
    let x = snapGrid(point.x), y = snapGrid(point.y);
    if(keepAxis === 'x' && origin) y = origin.y;
    if(keepAxis === 'y' && origin) x = origin.x;
    if(!isSnapEnabled()) return { x, y };
    const threshold = Math.max(4, Math.min(20, getSnapSize() * 1.6));
    collectSnapPoints(zoneId).forEach(pt => { if(Math.abs(pt.x - x) <= threshold) x = pt.x; if(Math.abs(pt.y - y) <= threshold) y = pt.y; });
    return { x, y };
  }
  function getRackOccupancy(rackId){ let total = 0; for(const p of (appState.products || [])){ if(p.rack === rackId || p.rackStore === rackId) total++; } return total; }

  function seedState(){
    ensureBranchLayouts();
    loadLayoutForBranch(getActiveLayoutBranchIndex());
    setProductDataset(makeDemoProducts());
    appState.filtered = appState.products.slice(0, 400);
    appState.selectedProduct = appState.products[0];
    appState.selectedRack = appState.products[0].rack;
    appState.selectedRackLayoutId = appState.products[0].rack;
  }

  function isCompactViewport(){
    return window.innerWidth <= 1280;
  }

  function renderViewerMenu(){
    ensureAppRuntimeState();
    const host = document.getElementById('viewerBranchMenu');
    if(!host) return;
    const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
    const activeViewerIndex = Number(appState.viewerBranchIndex ?? -1);
    host.innerHTML = branches.length ? branches.map((b, i) => {
      const active = appState.screen === 'viewer' && activeViewerIndex === i;
      return `<div class="menu-item ${active ? 'active' : ''}" data-screen="viewer" data-viewer-branch-menu="${i}">👁 <span>${escapeHtml(b?.name || ('Sucursal ' + (i + 1)))}</span></div>`;
    }).join('') : '<div class="menu-item active" data-screen="viewer" data-viewer-branch-menu="-1">👁 <span>Visualizar</span></div>';
    host.querySelectorAll('[data-viewer-branch-menu]').forEach(item => {
      item.onclick = async () => {
        const idx = Number(item.getAttribute('data-viewer-branch-menu'));
        appState.viewerBranchIndex = idx;
        setScreen('viewer');
        if(idx >= 0) await switchViewerBranch(idx);
        else renderViewerBranchHost(-1);
        renderViewerMenu();
      };
    });
  }

  function normalizeAppScreenName(screen){
    const value = String(screen || '').trim();
    const allowed = ['admin','sheet','layout','racks','dashboard','viewer'];
    if(value === 'card' || value === 'products') return 'sheet';
    return allowed.includes(value) ? value : 'viewer';
  }
  function getLastAppScreen(){
    try{
      const saved = normalizeAppScreenName(localStorage.getItem('wms_last_screen_v95') || '');
      return ['admin','sheet','layout','racks','dashboard','viewer'].includes(saved) ? saved : 'admin';
    }catch(_err){ return 'admin'; }
  }
  function persistLastAppScreen(screen){
    try{
      const normalized = normalizeAppScreenName(screen);
      if(['admin','sheet','layout','racks','dashboard','viewer'].includes(normalized)) localStorage.setItem('wms_last_screen_v95', normalized);
    }catch(_err){}
  }

  function setScreen(screen){
    ensureAppRuntimeState();
    screen = normalizeAppScreenName(screen);
    if(screen === 'card') screen = 'sheet';
    if(!appState.auth?.loggedIn && !appState.auth?.viewerGuest && screen !== 'viewer'){
      appState.ui = appState.ui || {};
      appState.ui.pendingScreenAfterLogin = screen;
      openAuthModal('');
      screen = 'viewer';
    }
    if((appState.auth?.viewerGuest || String(appState.auth?.role||'') === 'viewer') && screen !== 'viewer'){ screen = 'viewer'; }
    cleanupLayoutAutoFit();
    appState.screen = screen;
    persistLastAppScreen(screen);
    menuItems.forEach(i => i.classList.toggle('active', i.dataset.screen === screen));
    renderViewerMenu();
    const showSearch = ['sheet','viewer'].includes(screen);
    const compactViewport = isCompactViewport();
    const isSheetLayout = screen === 'sheet';
    const isCardDesignerScreen = false;
    appRoot.classList.toggle('card-designer-layout', isCardDesignerScreen);
    appRoot.classList.toggle('sheet-swap-layout', isSheetLayout);
    appRoot.classList.toggle('sheet-expanded', isSheetLayout && !!appState.ui.sheetExpanded);
    if(showSearch){
      document.querySelector('.search-panel').style.display='';
      const isViewer = screen === 'viewer';
      appRoot.classList.toggle('viewer-product-layout', isViewer);
      if(isViewer){
        if(contentPanel) contentPanel.style.display = 'none';
        if(detailPanel) detailPanel.style.display = '';
        contentPanel.classList.remove('full-span');
        contentPanel.style.gridColumn = '';
        contentPanel.style.gridRow = '';
        if(detailPanel){
          detailPanel.style.gridColumn = '';
          detailPanel.style.gridRow = '';
        }
        appRoot.style.gridTemplateColumns = compactViewport ? '' : (appRoot.classList.contains('sidebar-collapsed') ? 'var(--sidebar-w-collapsed) minmax(520px,1fr) minmax(430px,520px)' : 'var(--sidebar-w) minmax(520px,1fr) minmax(430px,520px)');
      }else{
        if(contentPanel) contentPanel.style.display = '';
        detailPanel.style.display = isSheetLayout ? 'none' : '';
        contentPanel.classList.remove('full-span');
        contentPanel.style.gridColumn = '';
        contentPanel.style.gridRow = '';
        if(detailPanel){
          detailPanel.style.gridColumn = '';
          detailPanel.style.gridRow = '';
        }
        appRoot.style.gridTemplateColumns = compactViewport ? '' : '';
      }
    }else{
      appRoot.classList.remove('sheet-swap-layout');
      appRoot.classList.remove('sheet-expanded');
      appRoot.classList.remove('viewer-product-layout');
      if(contentPanel) contentPanel.style.display = '';
      document.querySelector('.search-panel').style.display='none';
      const isRackModels = screen === 'racks';
      const isLayoutScreen = screen === 'layout';
      const isCardDesigner = false;
      detailPanel.style.display = (isRackModels || isLayoutScreen) ? 'none' : '';
      contentPanel.classList.toggle('full-span', isRackModels || isLayoutScreen);
      contentPanel.style.gridColumn = compactViewport ? '' : ((isRackModels || isLayoutScreen) ? '2 / -1' : '');
      if(compactViewport){
        appRoot.style.gridTemplateColumns = '';
      }else if(isRackModels || isLayoutScreen){
        appRoot.style.gridTemplateColumns = appRoot.classList.contains('sidebar-collapsed') ? 'var(--sidebar-w-collapsed) minmax(0,1fr)' : 'var(--sidebar-w) minmax(0,1fr)';
      }else if(isCardDesigner){
        appRoot.style.gridTemplateColumns = appRoot.classList.contains('sidebar-collapsed') ? 'var(--sidebar-w-collapsed) minmax(640px,1fr) minmax(640px,1fr)' : 'var(--sidebar-w) minmax(640px,1fr) minmax(640px,1fr)';
      }else{
        appRoot.style.gridTemplateColumns = appRoot.classList.contains('sidebar-collapsed') ? 'var(--sidebar-w-collapsed) 1fr 320px' : 'var(--sidebar-w) 1fr 320px';
      }
    }
    contentWrap.innerHTML = '';
    detailWrap.innerHTML = '';
    renderViewerBranchHost(screen === 'viewer' ? getActiveBranchContextIndex() : -1);
    contentStatus.textContent = 'Cargando vista…';
    detailStatus.textContent = '—';
    detailChip.textContent = '—';
    try{
      if(screen === 'admin') renderAdminScreen();
      else if(screen === 'sheet') (typeof renderSheetScreen==='function'?renderSheetScreen():renderMapView());
      else if(screen === 'layout') renderLayoutEditor();
      else if(screen === 'racks') renderRackModels();
      else if(screen === 'dashboard') renderDashboard();
      else renderMapView();
    }catch(err){
      console.error('Error al cambiar de pantalla:', err);
      contentTitle.textContent = 'Error de navegación';
      contentSubtitle.textContent = 'No se pudo abrir la vista solicitada.';
      contentWrap.innerHTML = `<div class="empty"><b>No se pudo abrir la pantalla.</b><div class="muted tiny" style="margin-top:8px">${escapeHtml(err.message || 'Error desconocido')}</div></div>`;
      detailTitle.textContent = 'Detalle';
      detailSubtitle.textContent = 'Sin información';
      detailWrap.innerHTML = '';
      contentStatus.textContent = 'Error al abrir la vista';
    }
  }

  function setTags(tags=[]){
    contentTags.innerHTML = tags.map(t => {
      const item = typeof t === 'string' ? { label:t, active:true } : (t || {});
      const label = escapeHtml(String(item.label || ''));
      const cls = (item.active === false ? 'tag inactive' : 'tag active') + (item.extraClass ? ` ${escapeHtml(String(item.extraClass))}` : '');
      if(item.action){
        const historyType = item.action === 'history-undo-layout' || item.action === 'history-redo-layout' ? 'layout' : (item.action === 'history-undo-racks' || item.action === 'history-redo-racks' ? 'racks' : '');
        const historyAttr = item.action.startsWith('history-undo') ? ` data-history-undo="${historyType}"` : (item.action.startsWith('history-redo') ? ` data-history-redo="${historyType}"` : '');
        return `<button type="button" class="${cls}" data-layout-tag-action="${escapeHtml(String(item.action))}"${historyAttr}>${label}</button>`;
      }
      return `<span class="${cls}">${label}</span>`;
    }).join('');
  }

  function getProductSizeValue(product){
    if(!product) return '';
    const raw = String(product.talla || '').trim();
    if(raw) return raw.toUpperCase();
    const variant = String(product.variante || '').trim();
    if(!variant) return '';
    const match = variant.match(/(?:^|\b)(?:talla\s*)?(XXXL|XXL|XXS|XS|XL|L|M|S|3XL|2XL|4XL|5XL|U|UNICA|ÚNICA)(?:\b|$)/i);
    return match ? match[1].toUpperCase().replace('ÚNICA','UNICA') : '';
  }

  function getProductColorValue(product){
    if(!product) return '';
    const raw = String(product.color || '').trim();
    if(raw) return raw;
    const variant = String(product.variante || '').trim();
    if(!variant) return '';
    let cleaned = variant
      .replace(/(?:^|\b)talla\b/ig, ' ')
      .replace(/(?:^|\b)(XXXL|XXL|XXS|XS|XL|L|M|S|3XL|2XL|4XL|5XL|U|UNICA|ÚNICA)(?:\b|$)/ig, ' ')
      .replace(/[\-_/,]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  }


  function getViewerProductFamilyItems(product){
    if(!product) return [];
    const list = Array.isArray(appState.products) ? appState.products : [];
    const nameKey = norm(product.nombre || '');
    const variantKey = norm(product.variante || '');
    const skuBase = norm(String(product.sku || '').replace(/[-_ ]?(?:xs|s|m|l|xl|xxl|xxxl|\d+)$/i,''));
    const sameName = nameKey ? list.filter(p => norm(p?.nombre || '') === nameKey) : [];
    if(sameName.length > 1) return sameName;
    if(skuBase){
      const sameSkuBase = list.filter(p => norm(String(p?.sku || '').replace(/[-_ ]?(?:xs|s|m|l|xl|xxl|xxxl|\d+)$/i,'')) === skuBase);
      if(sameSkuBase.length > 1) return sameSkuBase;
    }
    if(variantKey && nameKey){
      const fuzzy = list.filter(p => norm(p?.nombre || '') === nameKey || norm(p?.variante || '') === variantKey);
      if(fuzzy.length > 1) return fuzzy;
    }
    return [product];
  }

  function getViewerProductFamilySummary(product){
    const items = getViewerProductFamilyItems(product);
    const sizes = Array.from(new Set(items.map(p => getProductSizeValue(p)).filter(Boolean)));
    sizes.sort((a,b) => {
      const rank = getLogicalSizeRank(a) - getLogicalSizeRank(b);
      return rank || String(a).localeCompare(String(b), 'es', { sensitivity:'base', numeric:true });
    });
    const colors = Array.from(new Set(items.map(p => getProductColorValue(p)).filter(Boolean)));
    colors.sort((a,b) => String(a).localeCompare(String(b), 'es', { sensitivity:'base', numeric:true }));
    return { items, sizes, colors };
  }


  function getViewerColorChipStyle(colorName){
    const key = norm(colorName || '');
    const palette = {
      'amarillo': { bg:'#f3cf4f', text:'#3f2c00', border:'#f7dd80' },
      'arena': { bg:'#cfbfa0', text:'#352b1a', border:'#dfd1b5' },
      'azalea': { bg:'#c9b3e6', text:'#352450', border:'#dac9ef' },
      'blanco': { bg:'#f3f4f6', text:'#31353b', border:'#ffffff' },
      'melon': { bg:'#d6dd88', text:'#334015', border:'#e4e8ae' },
      'negro': { bg:'#23272f', text:'#f3f7fb', border:'#4a5360' },
      'plomo': { bg:'#858b95', text:'#10151d', border:'#aab0b8' },
      'coral': { bg:'#ff9478', text:'#4b2115', border:'#ffb39f' },
      'rojo': { bg:'#de5a54', text:'#fff5f4', border:'#ea827d' },
      'beige': { bg:'#dac8ab', text:'#342a1b', border:'#e7dbc7' },
      'palo rosa': { bg:'#d792a7', text:'#472434', border:'#e7b7c5' },
      'azul': { bg:'#6a93d8', text:'#f4f8ff', border:'#8cb0ea' },
      'verde': { bg:'#71bf8d', text:'#143322', border:'#95d2aa' },
      'lila': { bg:'#c3abdd', text:'#352549', border:'#d6c5ea' },
      'rosado': { bg:'#efb6c9', text:'#4a2330', border:'#f3cad7' },
      'fucsia': { bg:'#d964a8', text:'#fff4fb', border:'#e58abf' },
      'marron': { bg:'#8b6148', text:'#fff8f4', border:'#a67a5d' },
      'chocolate': { bg:'#6f5238', text:'#fff8f1', border:'#8d6b4c' },
      'indigo': { bg:'#6674b8', text:'#f5f7ff', border:'#8894cd' },
      'índigo': { bg:'#6674b8', text:'#f5f7ff', border:'#8894cd' },
      'perla': { bg:'#ece7da', text:'#3b3730', border:'#faf6ea' },
      'melange': { bg:'#b6b6b1', text:'#21242b', border:'#d0d0ca' },
      'gris': { bg:'#9aa1ab', text:'#151922', border:'#bbc0c7' }
    };
    const tone = palette[key] || { bg:'rgba(255,255,255,.08)', text:'#effbf4', border:'rgba(255,255,255,.16)' };
    return `background:${tone.bg};color:${tone.text};border-color:${tone.border};`;
  }

  function normalizeVariantValue(value){
    return norm(String(value || '').trim());
  }

  function getVariantToneKey(value){
    const key = normalizeVariantValue(value);
    if(!key) return 'tone-1';
    let hash = 0;
    for(let i = 0; i < key.length; i++){
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash % 6) + 1;
    return `tone-${idx}`;
  }
  function getProductSearchText(product){
    if(!product) return '';
    return norm([
      product.marca,
      product.codigo,
      product.cod,
      product.modelo,
      product.nombre,
      getProductSizeValue(product),
      getProductColorValue(product),
      product.variante,
      product.sku,
      product.barras,
      product.ubicacion,
      product.almacen,
      product.rack,
      product.rackStore
    ].filter(Boolean).join(' '));
  }


  function buildVariantGroups(product){
    if(!product) return { sizes: [], colors: [] };
    const siblings = appState.products.filter(p => norm(p.nombre) === norm(product.nombre));
    const pool = siblings.length ? siblings : [product];
    const activeSizeKey = normalizeVariantValue(getProductSizeValue(product));
    const activeColorKey = normalizeVariantValue(getProductColorValue(product));
    const sizeSeen = new Set();
    const colorSeen = new Set();
    const sizes = [];
    const colors = [];
    const sizeOrder = ['XXS','XS','S','M','L','XL','XXL','XXXL','2XL','3XL','4XL','5XL','U','UNICA'];
    const sizeRank = v => { const i = sizeOrder.indexOf(String(v||'').toUpperCase()); return i >= 0 ? i : 999; };
    const availableByActiveColor = activeColorKey ? new Set(pool.filter(p => normalizeVariantValue(getProductColorValue(p)) === activeColorKey).map(p => normalizeVariantValue(getProductSizeValue(p))).filter(Boolean)) : new Set();
    const availableByActiveSize = activeSizeKey ? new Set(pool.filter(p => normalizeVariantValue(getProductSizeValue(p)) === activeSizeKey).map(p => normalizeVariantValue(getProductColorValue(p))).filter(Boolean)) : new Set();
    pool.forEach(p => {
      const size = getProductSizeValue(p);
      const color = getProductColorValue(p);
      if(size){
        const key = normalizeVariantValue(size);
        if(!sizeSeen.has(key)){
          sizeSeen.add(key);
          sizes.push({ label:size, product:p, active:key === activeSizeKey, available: !activeColorKey || availableByActiveColor.has(key) });
        }
      }
      if(color){
        const key = normalizeVariantValue(color);
        if(!colorSeen.has(key)){
          colorSeen.add(key);
          colors.push({ label:color, product:p, active:key === activeColorKey, available: !activeSizeKey || availableByActiveSize.has(key) });
        }
      }
    });
    sizes.sort((a,b) => sizeRank(a.label) - sizeRank(b.label) || String(a.label).localeCompare(String(b.label)));
    colors.sort((a,b) => String(a.label).localeCompare(String(b.label)));
    return { sizes, colors };
  }

  function getColorChipStyle(label){
    const colorName = norm(label || '');
    const presets = [
      { keys:['blanco','white'], bg:'#f5f5f2', fg:'#545b56', border:'#d7ddd9' },
      { keys:['negro','black'], bg:'#2e3331', fg:'#f5fffb', border:'#4f5854' },
      { keys:['gris','gray','grey'], bg:'#dce2df', fg:'#51605a', border:'#c2cbc6' },
      { keys:['rojo','red'], bg:'#f6c6c6', fg:'#8a2f2f', border:'#e5aaaa' },
      { keys:['vino','burgundy','guinda'], bg:'#dcc3d0', fg:'#6a314f', border:'#caa8b9' },
      { keys:['rosa','pink'], bg:'#f3d5de', fg:'#8a4560', border:'#e5bfd0' },
      { keys:['azul','blue','uva'], bg:'#cfe1f7', fg:'#315a88', border:'#bad2ef' },
      { keys:['celeste','sky'], bg:'#d8eef8', fg:'#3d6780', border:'#c6e4f0' },
      { keys:['verde','green'], bg:'#d8f0df', fg:'#35694a', border:'#c2e3ce' },
      { keys:['amarillo','yellow','coral'], bg:'#f6e6b3', fg:'#8b6a12', border:'#ebd788' },
      { keys:['lila','morado','violeta','purple','azalea'], bg:'#e6daf8', fg:'#6b4f99', border:'#d4c2f1' },
      { keys:['beige','nude','natural'], bg:'#eadfcf', fg:'#7a6751', border:'#deceb7' },
    ];
    const hit = presets.find(p => p.keys.some(k => colorName.includes(k)));
    const chosen = hit || { bg:'rgba(255,255,255,.08)', fg:'var(--text)', border:'rgba(255,255,255,.12)' };
    return `background:${chosen.bg};color:${chosen.fg};border-color:${chosen.border}`;
  }

  function renderVariantStrip(target, items, emptyLabel, clickFactory, type='default'){
    if(!target) return;
    target.innerHTML = '';
    if(!items.length){
      const empty = document.createElement('span');
      empty.className = 'muted tiny';
      empty.textContent = emptyLabel;
      target.appendChild(empty);
      return;
    }
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `variant-chip ${type === 'color' ? 'variant-color' : getVariantToneKey(item.label)}${item.active ? ' active' : ''}${item.available === false ? ' muted' : ''}`;
      btn.textContent = item.label;
      btn.title = item.label;
      if(type === 'color') btn.style.cssText = getColorChipStyle(item.label);
      btn.addEventListener('click', () => clickFactory(item));
      target.appendChild(btn);
    });
  }

  function toCssImageUrl(url){
    const value = String(url || '').trim();
    if(!value) return 'none';
    return `url("${value.replace(/"/g, '\"')}")`;
  }

  function splitMediaValues(values){
    const split = [];
    values.filter(Boolean).map(v => String(v).trim()).forEach(value => {
      if(/[|\n;]/.test(value)) split.push(...value.split(/[|\n;]+/));
      else split.push(value);
    });
    const out = [];
    const seen = new Set();
    split.map(v => String(v || '').trim()).filter(Boolean).forEach(url => {
      if(!seen.has(url)){ seen.add(url); out.push(url); }
    });
    return out;
  }

  function imageHeaderRank(header){
    const key = norm(header).replace(/[^a-z0-9]+/g,'');
    if(!key) return null;
    const patterns = [
      /^(imagen|image|foto|fotografia|img)(\d+)?$/,
      /^(urlimagen|imagenurl|linkimagen|enlaceimagen)(\d+)?$/,
      /^(imageurl|urlimage|linkimage)(\d+)?$/
    ];
    for(const rx of patterns){
      const m = key.match(rx);
      if(m) return m[2] ? Number(m[2]) : 1;
    }
    return null;
  }

  function isImageHeaderName(header){
    return imageHeaderRank(header) !== null;
  }

  function getRawImageValues(product){
    const raw = product && product._raw && typeof product._raw === 'object' ? product._raw : null;
    if(!raw) return [];
    return Object.entries(raw)
      .map(([header, value], idx) => ({ header, value:String(value || '').trim(), idx, rank:imageHeaderRank(header) }))
      .filter(item => item.value && item.rank !== null)
      .sort((a,b) => (a.rank - b.rank) || (a.idx - b.idx))
      .map(item => item.value);
  }

  function getProductImageUrls(product){
    if(!product) return [];
    const explicit = [
      product._card_image_url,
      product.imagen, product.imagen1, product.image, product.image1, product.imagen_url, product.image_url, product.foto, product.foto1, product.img, product.img1,
      product.imagen2, product.image2, product.foto2, product.img2,
      product.imagen3, product.image3, product.foto3, product.img3,
      product.imagen4, product.image4, product.foto4, product.img4,
      product.imagen5, product.image5, product.foto5, product.img5,
      product.imagen6, product.image6, product.foto6, product.img6,
      product.imagen7, product.image7, product.foto7, product.img7,
      product.imagen8, product.image8, product.foto8, product.img8,
      ...(Array.isArray(product.imagenes) ? product.imagenes : []),
      ...getRawImageValues(product)
    ];
    return splitMediaValues(explicit);
  }

  function getProductBackdropUrl(product, fallbackUrl=''){
    if(!product) return fallbackUrl || '';
    const raw = splitMediaValues([
      product._card_backdrop_url, product.fondo_card, product.background_card, product.imagen_fondo, product.background_image,
      product.fondo, product.backdrop, product.backdrop_url
    ]);
    return raw[0] || fallbackUrl || '';
  }

  function getProductVideoUrls(product){
    if(!product) return [];
    return splitMediaValues([
      product._card_video_url, product.video, product.video_url, product.video_link, product.link_video, product.enlace_video,
      product.url_video, product.video_producto, product.product_video
    ]);
  }

  function isGifLikeUrl(url){
    return /\.(gif|apng)(\?|#|$)/i.test(String(url || ''));
  }

  function getDriveFileInfo(url){
    const raw = String(url || '').trim();
    if(!raw) return null;
    try{
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./,'').toLowerCase();
      if(!host.includes('drive.google.com') && !host.includes('docs.google.com')) return null;
      const parts = u.pathname.split('/').filter(Boolean);
      const dIdx = parts.indexOf('d');
      const fileIdx = parts.indexOf('file');
      const id = (dIdx >= 0 && parts[dIdx + 1])
        ? parts[dIdx + 1]
        : ((fileIdx >= 0 && parts[fileIdx + 2]) ? parts[fileIdx + 2] : (u.searchParams.get('id') || ''));
      if(!id) return null;
      const resourcekey = u.searchParams.get('resourcekey') || '';
      return { id, resourcekey };
    }catch(_){ return null; }
  }

  function getDrivePreviewUrl(url){
    const info = getDriveFileInfo(url);
    if(!info?.id) return '';
    return `https://drive.google.com/file/d/${info.id}/preview${info.resourcekey ? `?resourcekey=${encodeURIComponent(info.resourcekey)}` : ''}`;
  }

  function getDriveDirectVideoUrl(url){
    const raw = String(url || '').trim();
    const info = getDriveFileInfo(raw);
    if(!info?.id) return '';
    const qp = new URLSearchParams();
    qp.set('id', info.id);
    if(info.resourcekey) qp.set('resourcekey', info.resourcekey);
    qp.set('source', raw);
    return `/api/drive-video?${qp.toString()}`;
  }

  function getVideoEmbedUrl(url, { autoplay=false }={}){
    const raw = String(url || '').trim();
    if(!raw) return '';
    try{
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./,'').toLowerCase();
      if(host === 'youtu.be'){
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1&mute=1&playsinline=1&rel=0' : '?rel=0'}` : '';
      }
      if(host.includes('youtube.com')){
        const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
        return id ? `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1&mute=1&playsinline=1&rel=0' : '?rel=0'}` : '';
      }
      if(host.includes('vimeo.com')){
        const id = u.pathname.split('/').filter(Boolean).pop();
        return id ? `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1&muted=1&playsinline=1' : ''}` : '';
      }
      if(host.includes('drive.google.com') || host.includes('docs.google.com')){
        return getDrivePreviewUrl(raw);
      }
      if(host.includes('dropbox.com')){
        const direct = new URL(raw);
        direct.searchParams.set('raw', '1');
        return direct.toString();
      }
    }catch(_){}
    return '';
  }

  function isDirectVideoUrl(url){
    return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(String(url || ''));
  }

  function canInlineVideoUrl(url){
    return isDirectVideoUrl(url) || !!getDriveFileInfo(url) || !!getVideoEmbedUrl(url);
  }

  function getProductMediaItems(product){
    return getProductImageUrls(product).map((url, idx) => ({ type:'image', url, label:`Imagen ${idx + 1}` }));
  }

  function clearActiveProductVideo(){
    if(!activeProductImageWrap) return;
    activeProductImageWrap.querySelectorAll('.active-product-video-frame,.active-product-video,.active-product-video-placeholder').forEach(el => el.remove());
  }

  function stopActiveProductImageCycle(){
    if(activeImageCycleTimer){ clearInterval(activeImageCycleTimer); activeImageCycleTimer = null; }
    activeImageCycleUrls = [];
    activeMediaCycleItems = [];
    activeImageCycleIndex = 0;
  }

  function renderActiveProductGallery(){
    if(!activeProductGallery || !activeProductGalleryCounter) return;
    const items = (Array.isArray(activeMediaCycleItems) && activeMediaCycleItems.length)
      ? activeMediaCycleItems.slice()
      : (Array.isArray(activeImageCycleUrls) ? activeImageCycleUrls.map(url => ({ type:'image', url })) : []);
    activeProductGallery.innerHTML = '';
    const total = items.length;
    const index = Math.max(0, Math.min(activeImageCycleIndex, Math.max(0, total - 1)));
    activeImageCycleIndex = index;
    if(!total){
      activeProductGalleryCounter.textContent = '00 / 00';
      if(activeProductGalleryPrev) activeProductGalleryPrev.disabled = true;
      if(activeProductGalleryNext) activeProductGalleryNext.disabled = true;
      return;
    }
    items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-card-thumb' + (idx === index ? ' active' : '') + (item.type === 'video' ? ' is-video' : '');
      btn.setAttribute('aria-label', item.type === 'video' ? `Video ${idx + 1}` : `Imagen ${idx + 1}`);
      if(item.type === 'video'){
        const mark = document.createElement('span');
        mark.className = 'video-thumb-mark';
        mark.textContent = '▶ Video';
        btn.appendChild(mark);
      }else{
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = `Vista ${idx + 1}`;
        btn.appendChild(img);
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showActiveProductImageAt(idx);
      });
      activeProductGallery.appendChild(btn);
    });
    activeProductGalleryCounter.textContent = `${String(index + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    if(activeProductGalleryPrev) activeProductGalleryPrev.disabled = total <= 1;
    if(activeProductGalleryNext) activeProductGalleryNext.disabled = total <= 1;
  }

  function showActiveProductImageAt(index = 0){
    if(!activeProductImageWrap || !activeProductImage) return;
    const items = (Array.isArray(activeMediaCycleItems) && activeMediaCycleItems.length)
      ? activeMediaCycleItems.filter(item => item && item.url)
      : (Array.isArray(activeImageCycleUrls) ? activeImageCycleUrls.filter(Boolean).map(url => ({ type:'image', url })) : []);
    const mediaCol = activeProductImageWrap.closest('.search-card-media-col');
    clearActiveProductVideo();
    const activeCard = document.getElementById('activeProductCard');
    if(!items.length){
      activeProductImage.removeAttribute('src');
      activeProductImage.style.display = 'none';
      activeProductImageWrap.classList.add('empty');
      activeProductImageWrap.classList.remove('has-video');
      if(activeCard) activeCard.classList.remove('card-video-overlay');
      if(mediaCol){
        mediaCol.style.setProperty('--product-bg-image', 'none');
        mediaCol.classList.remove('has-backdrop-image');
      }
      renderActiveProductGallery();
      return;
    }
    activeImageCycleIndex = Math.max(0, Math.min(Number(index) || 0, items.length - 1));
    const item = items[activeImageCycleIndex];
    const currentUrl = item.url;
    activeProductImageWrap.classList.remove('empty');
    if(activeCard) activeCard.classList.toggle('card-video-overlay', item.type === 'video');
    if(item.type === 'video'){
      activeProductImage.removeAttribute('src');
      activeProductImage.style.display = 'none';
      activeProductImageWrap.classList.add('has-video');
      const driveDirectUrl = getDriveDirectVideoUrl(currentUrl);
      if(isDirectVideoUrl(currentUrl) || driveDirectUrl){
        const video = document.createElement('video');
        video.className = 'active-product-video';
        video.src = driveDirectUrl || currentUrl;
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.setAttribute('playsinline','');
        video.setAttribute('webkit-playsinline','');
        activeProductImageWrap.appendChild(video);
        const tryPlay = () => video.play().catch(()=>{});
        video.addEventListener('loadedmetadata', tryPlay, { once:true });
        setTimeout(tryPlay, 160);
      }else{
        const embedUrl = getVideoEmbedUrl(currentUrl, { autoplay:true });
        if(embedUrl){
          const iframe = document.createElement('iframe');
          iframe.className = 'active-product-video-frame';
          iframe.src = embedUrl;
          iframe.title = 'Video del producto';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          activeProductImageWrap.appendChild(iframe);
        }else{
          const placeholder = document.createElement('div');
          placeholder.className = 'active-product-video-placeholder';
          placeholder.innerHTML = `<div class="play">▶</div><div><b>Video externo</b><small>No se puede reproducir automáticamente este enlace dentro del card.</small><a href="${escapeHtml(currentUrl)}" target="_blank" rel="noopener noreferrer">Abrir video</a></div>`;
          activeProductImageWrap.appendChild(placeholder);
        }
      }
    }else{
      activeProductImageWrap.classList.remove('has-video');
      activeProductImage.src = currentUrl;
      activeProductImage.style.display = 'block';
    }
    if(mediaCol){
      const backdropUrl = getProductBackdropUrl(appState.selectedProduct, item.type === 'image' ? currentUrl : '');
      mediaCol.style.setProperty('--product-bg-image', toCssImageUrl(backdropUrl || (item.type === 'image' ? currentUrl : '')));
      mediaCol.classList.toggle('has-backdrop-image', !!(backdropUrl || item.type === 'image'));
    }
    renderActiveProductGallery();
  }

  function bindActiveProductGalleryControls(){
    if(activeImageGalleryBound) return;
    if(activeProductGalleryPrev){
      activeProductGalleryPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if(!activeImageCycleUrls.length) return;
        showActiveProductImageAt((activeImageCycleIndex - 1 + activeImageCycleUrls.length) % activeImageCycleUrls.length);
      });
    }
    if(activeProductGalleryNext){
      activeProductGalleryNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if(!activeImageCycleUrls.length) return;
        showActiveProductImageAt((activeImageCycleIndex + 1) % activeImageCycleUrls.length);
      });
    }
    activeImageGalleryBound = true;
  }

  function startActiveProductImageCycle(urls, product){
    stopActiveProductImageCycle();
    const mediaItems = product ? getProductMediaItems(product) : [];
    activeMediaCycleItems = mediaItems.length ? mediaItems : (Array.isArray(urls) ? urls.filter(Boolean).map(url => ({ type:'image', url })) : []);
    activeImageCycleUrls = activeMediaCycleItems.map(item => item.url).filter(Boolean);
    bindActiveProductGalleryControls();
    showActiveProductImageAt(0);
  }

  function renderActiveVariantStrip(product){
    const groups = buildVariantGroups(product);
    renderVariantStrip(activeSizeStrip, groups.sizes, 'Sin tallas relacionadas', (item) => {
      const currentColor = getProductColorValue(product);
      const siblings = appState.products.filter(p => norm(p.nombre) === norm(product?.nombre));
      const exact = siblings.find(p => normalizeVariantValue(getProductSizeValue(p)) === normalizeVariantValue(item.label) && normalizeVariantValue(getProductColorValue(p)) === normalizeVariantValue(currentColor));
      selectProduct(exact || item.product);
    }, 'size');
    renderVariantStrip(activeColorStrip, groups.colors, 'Sin colores relacionados', (item) => {
      const currentSize = getProductSizeValue(product);
      const siblings = appState.products.filter(p => norm(p.nombre) === norm(product?.nombre));
      const exact = siblings.find(p => normalizeVariantValue(getProductColorValue(p)) === normalizeVariantValue(item.label) && normalizeVariantValue(getProductSizeValue(p)) === normalizeVariantValue(currentSize));
      selectProduct(exact || item.product);
    }, 'color');
  }

  function updateActiveProductCard(p){
    if(!activeProductName) return;
    const hasProduct = !!p;
    const cfg = getActiveCardConfig();
    const cardProduct = hasProduct ? hydrateProductForCard(p) : p;
    const titleValue = hasProduct ? (productHeaderValue(p, cfg.titleHeader) || p.nombre || 'Sin nombre') : '—';
    const subtitleValue = hasProduct ? (productHeaderValue(p, cfg.subtitleHeader) || p.sku || '—') : '—';
    activeProductName.textContent = titleValue;
    if(activeProductSku) activeProductSku.textContent = hasProduct ? `${cfg.subtitleHeader ? cfg.subtitleHeader + ': ' : 'SKU '}${subtitleValue}` : 'SKU —';
    const sizeText = hasProduct ? getProductSizeValue(p) : '';
    const colorText = hasProduct ? getProductColorValue(p) : '';
    activeProductMeta.textContent = hasProduct ? `Variante activa: talla ${sizeText || '—'}${colorText ? ` • color ${colorText}` : ''}` : 'Selecciona un producto para enfocarlo rápido.';
    activeLocation.textContent = hasProduct ? (p.ubicacion || '—') : '—';
    if(activeStoreLocation) activeStoreLocation.textContent = hasProduct ? (p.almacen || '—') : '—';
    const activeCard = document.getElementById('activeProductCard');
    if(activeCard) applyCardLayoutConfigToElement(activeCard, cfg);
    if(activeProductImageWrap && activeProductImage){
      startActiveProductImageCycle(getProductImageUrls(cardProduct), cardProduct);
    }
    renderActiveCardCustomFields(p);
    renderActiveVariantStrip(p);
    if(document.body.classList.contains('search-card-modal-open')) setTimeout(updateExpandedSideCards, 20);
  }

  function syncSelectedProductLocation(product){
    if(!product) return;
    appState.selectedRack = product.rack || product.rackStore || '';
    appState.selectedRackLayoutId = product.rack || product.rackStore || '';
    appState.selectedRackLayoutIds = [product.rack, product.rackStore].filter(Boolean);
    appState.selectedZoneId = product.zona || product.zonaStore || appState.selectedZoneId || '';
  }

  function focusSelectedProductInViewer(options = {}){
    const opts = options || {};
    const product = opts.product || appState.selectedProduct;
    if(!product){
      showToast('Selecciona un producto primero.', 'warning');
      return false;
    }
    syncSelectedProductLocation(product);
    updateActiveProductCard(product);
    syncActiveProductCardHint();
    if(opts.switchScreen !== false){
      setScreen('viewer');
    } else if(['products','viewer','dashboard'].includes(appState.screen)) {
      renderMapView();
    }
    setTimeout(() => {
      if(appState.screen === 'viewer') renderMapView();
      else if(appState.screen === 'dashboard') renderDashboard();
      renderProducts(appState.filtered);
    }, 10);
    return true;
  }

  function applyProductSelectionEffects(product){
    if(!product) return;
    syncSelectedProductLocation(product);
  }

  function syncExpandedModalSelection(product){
    appState.selectedProduct = product || null;
    applyProductSelectionEffects(product);
    updateActiveProductCard(product);
    syncActiveProductCardHint();
    const rows = document.querySelectorAll('.product-row');
    rows.forEach(row => {
      const key = row.getAttribute('data-product-key') || '';
      row.classList.toggle('active', !!product && key === getProductIdentityKey(product));
    });
    setTimeout(updateExpandedSideCards, 20);
  }

  const LOGICAL_SIZE_ORDER = ['XXXS','3XS','XXS','2XS','XS','S','M','L','XL','XXL','2XL','XXXL','3XL','XXXXL','4XL','5XL','6XL','U','UNICA','ÚNICA','ONE SIZE'];
  function getLogicalSizeRank(value){
    const raw = String(value || '').trim().toUpperCase();
    if(!raw) return 9999;
    const normalized = raw
      .replace(/TALLA\s+/g, '')
      .replace(/\s+/g, '')
      .replace(/^ÚNICA$/, 'UNICA');
    const directIndex = LOGICAL_SIZE_ORDER.indexOf(normalized);
    if(directIndex >= 0) return directIndex;
    const num = normalized.match(/^(\d{1,3})$/);
    if(num) return 500 + Number(num[1]);
    return 9999;
  }

  function splitAlphaNumericLead(value){
    const text = String(value || '').trim();
    if(!text) return { type:2, normalized:'', text:'' };
    const first = text.charAt(0);
    const isLetter = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(first);
    const isDigit = /\d/.test(first);
    return { type:isLetter ? 0 : (isDigit ? 1 : 2), normalized:norm(text), text };
  }

  function compareTextLettersFirst(a,b){
    const aa = splitAlphaNumericLead(a);
    const bb = splitAlphaNumericLead(b);
    if(aa.type !== bb.type) return aa.type - bb.type;
    return aa.text.localeCompare(bb.text, 'es', { sensitivity:'base', numeric:true });
  }

  function compareProductsAZ(a,b){
    const nameCmp = compareTextLettersFirst(a?.nombre || '', b?.nombre || '');
    if(nameCmp) return nameCmp;
    const sizeA = getProductSizeValue(a) || '';
    const sizeB = getProductSizeValue(b) || '';
    const sizeRankCmp = getLogicalSizeRank(sizeA) - getLogicalSizeRank(sizeB);
    if(sizeRankCmp) return sizeRankCmp;
    const sizeCmp = String(sizeA).localeCompare(String(sizeB), 'es', { sensitivity:'base', numeric:true });
    if(sizeCmp) return sizeCmp;
    const colorCmp = String(getProductColorValue(a) || '').localeCompare(String(getProductColorValue(b) || ''), 'es', { sensitivity:'base', numeric:true });
    if(colorCmp) return colorCmp;
    const variantCmp = String(a?.variante || '').localeCompare(String(b?.variante || ''), 'es', { sensitivity:'base', numeric:true });
    if(variantCmp) return variantCmp;
    const skuCmp = String(a?.sku || '').localeCompare(String(b?.sku || ''), 'es', { sensitivity:'base', numeric:true });
    if(skuCmp) return skuCmp;
    return String(a?.ubicacion || '').localeCompare(String(b?.ubicacion || ''), 'es', { sensitivity:'base', numeric:true });
  }

  function shouldForceIndividualView(list){
    const rawQ = String(searchInput?.value || '').trim();
    if(!rawQ) return false;
    const items = Array.isArray(list) ? list.filter(Boolean) : [];
    if(items.length <= 1) return false;
    const familyKeys = Array.from(new Set(items.map(p => norm(p?.nombre || '') || '__sin_nombre__'))).filter(Boolean);
    return familyKeys.length === 1;
  }

  function renderProducts(list){
    ensureAppRuntimeState();
    list = Array.isArray(list) ? list : [];
    const frag = document.createDocumentFragment();
    const forceIndividual = shouldForceIndividualView(list);
    const groupedMode = true; // V25: el listado del viewer siempre trabaja por producto/familia
    const maxRows = groupedMode ? 220 : 450;
    const items = [];
    const sortedList = (Array.isArray(list) ? list.slice() : []).sort(compareProductsAZ);
    if(groupedMode){
      const groups = new Map();
      sortedList.forEach(p => {
        const key = norm(p.nombre || '') || '__sin_nombre__';
        if(!groups.has(key)) groups.set(key, { nombre:p.nombre || 'Sin nombre', items:[], sample:p });
        groups.get(key).items.push(p);
      });
      Array.from(groups.values())
        .sort((a,b) => compareTextLettersFirst(a.nombre || '', b.nombre || ''))
        .slice(0, maxRows)
        .forEach(g => items.push({ type:'group', data:g }));
    } else {
      sortedList.slice(0, maxRows).forEach(p => items.push({ type:'product', data:p }));
    }
    productList.innerHTML = '';
    items.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'product-row' + ((entry.type==='product' && getProductIdentityKey(appState.selectedProduct) === getProductIdentityKey(entry.data)) ? ' active' : '');
      if(entry.type === 'group'){
        const g = entry.data;
        const first = g.items[0];
        const variantes = Array.from(new Set(g.items.map(p => (p.variante || '').trim()).filter(Boolean)));
        const ubicaciones = Array.from(new Set(g.items.map(p => (p.ubicacion || '').trim()).filter(Boolean)));
        const thumb = (getProductImageUrls(first)[0] || '').trim();
        row.innerHTML = `
          <div class="product-cell-sku"><span class="product-select-box"></span>${thumb ? `<img class="product-row-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(g.nombre)}">` : '<span class="product-row-thumb empty"></span>'}<b>${escapeHtml(first.sku || '—')}</b></div>
          <div class="product-cell-name">${escapeHtml(g.nombre)}</div>
          <div><span class="variant-chip muted" style="padding:6px 10px;border-radius:10px;min-width:auto;cursor:default">${variantes.length} variante${variantes.length === 1 ? '' : 's'}</span></div>
          <div><span class="loc-pill">${escapeHtml(first.ubicacion || '—')}</span></div>
          <div>${escapeHtml(first.almacen || '—')}</div>`;
        row.title = 'Familia agrupada por nombre de producto';
        row.addEventListener('click', () => selectProduct(first));
      } else {
        const p = entry.data;
        row.setAttribute('data-product-key', getProductIdentityKey(p));
        const thumb = (getProductImageUrls(p)[0] || '').trim();
        row.innerHTML = `
          <div class="product-cell-sku"><span class="product-select-box"></span>${thumb ? `<img class="product-row-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(p.nombre || 'Producto')}">` : '<span class="product-row-thumb empty"></span>'}<b>${escapeHtml(p.sku || '—')}</b></div>
          <div class="product-cell-name">${escapeHtml(p.nombre || 'Sin nombre')}</div>
          <div><span class="variant-chip muted ${getVariantToneKey(p.variante)}" style="padding:6px 10px;border-radius:10px;min-width:auto;cursor:default">${escapeHtml(p.variante || '—')}</span></div>
          <div><span class="loc-pill">${escapeHtml(p.ubicacion || '—')}</span></div>
          <div>${escapeHtml(p.almacen || '—')}</div>`;
        row.addEventListener('click', () => selectProduct(p));
      }
      frag.appendChild(row);
    });
    productList.appendChild(frag);
    countProducts.textContent = getCurrentProductsTotal().toLocaleString('es-PE');
    const shown = items.length;
    const modeLabel = groupedMode ? 'familias' : 'resultados';
    const modeInfo = forceIndividual
      ? ' • vista por unidad automática para variantes del mismo producto'
      : (groupedMode ? ' • agrupado por producto / nombre' : (list.length > maxRows ? ' • usa el buscador para acotar' : ''));
    const totalRecords = getCurrentProductsTotal();
    const paging = ensureProductPagingState();
    const pageInfo = paging.mode === 'backend' ? ` • página ${paging.page || 1}/${paging.totalPages || 1}` : '';
    productSummary.textContent = `Mostrando ${shown.toLocaleString('es-PE')} ${modeLabel} de ${totalRecords.toLocaleString('es-PE')} registros` + modeInfo + pageInfo;
    updateProductPagerUi();
  }


  let activeExpandedSearchCard = null;
  let activeExpandedSearchCardPlaceholder = null;
  let activeExpandedSearchCardParent = null;
  let activeExpandedSearchCardNextSibling = null;
  let activeExpandedSideCardsBound = false;

  function getProductIdentityKey(p){
    return [p?.sku || '', p?.nombre || '', p?.variante || '', p?.ubicacion || '', p?.almacen || ''].join('¦');
  }
  function getExpandedCarouselBaseList(){
    const source = Array.isArray(appState?.filtered) && appState.filtered.length ? appState.filtered.slice() : (Array.isArray(appState?.products) ? appState.products.slice() : []);
    return source.sort(compareProductsAZ);
  }
  function getExpandedCarouselItems(){
    const list = getExpandedCarouselBaseList();
    const forceIndividual = shouldForceIndividualView(list);
    const groupedMode = !!appState?.ui?.productGroupMode && !forceIndividual;
    if(!groupedMode) return list;
    const groups = new Map();
    list.forEach((p) => {
      const key = norm(p?.nombre || '') || '__sin_nombre__';
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    });
    return Array.from(groups.values()).map(items => items[0]).filter(Boolean);
  }
  function getExpandedCarouselIndex(items){
    if(!Array.isArray(items) || !items.length) return -1;
    const selected = appState?.selectedProduct;
    const selectedKey = getProductIdentityKey(selected);
    let idx = items.findIndex((p) => getProductIdentityKey(p) === selectedKey);
    if(idx >= 0) return idx;
    idx = items.findIndex((p) => (p?.sku || '') === (selected?.sku || '') && (p?.variante || '') === (selected?.variante || ''));
    if(idx >= 0) return idx;
    idx = items.findIndex((p) => norm(p?.nombre || '') === norm(selected?.nombre || ''));
    return idx >= 0 ? idx : 0;
  }
  function ensureExpandedSideCard(side){
    let el = document.getElementById('expandedSideCard-' + side);
    if(el) return el;
    el = document.createElement('button');
    el.type = 'button';
    el.id = 'expandedSideCard-' + side;
    el.className = 'search-card-side-nav ' + side;
    el.setAttribute('aria-label', side === 'left' ? 'Producto anterior' : 'Producto siguiente');
    el.innerHTML = `
      <div class="side-nav-topline"><span class="side-nav-arrow">${side === 'left' ? '‹' : '›'}</span><div class="side-nav-kicker">${side === 'left' ? 'Anterior' : 'Siguiente'}</div></div>
      <div class="side-nav-media"><img alt="Vista previa del producto" /></div>
      <div class="side-nav-body">
        <div class="side-nav-title">—</div>
        <div class="side-nav-sku">SKU —</div>
        <div class="side-nav-swatches"></div>
        <div class="side-nav-sizes"></div>
      </div>
      <div class="side-nav-hint">Haz clic para cambiar de producto</div>
    `;
    document.body.appendChild(el);
    return el;
  }
  function fillExpandedSideCard(el, product, side){
    if(!el) return;
    if(!product){
      el.classList.remove('visible');
      el.onclick = null;
      return;
    }
    const urls = getProductImageUrls(product);
    const img = el.querySelector('img');
    const swatches = el.querySelector('.side-nav-swatches');
    const sizes = el.querySelector('.side-nav-sizes');
    el.querySelector('.side-nav-kicker').textContent = side === 'left' ? 'Anterior' : 'Siguiente';
    el.querySelector('.side-nav-title').textContent = product.nombre || 'Sin nombre';
    el.querySelector('.side-nav-sku').textContent = `SKU ${product.sku || '—'}`;
    if(swatches){
      const sibs = appState.products.filter(p => norm(p?.nombre || '') === norm(product?.nombre || ''));
      const colorItems = Array.from(new Set(sibs.map(p => getProductColorValue(p)).filter(Boolean))).slice(0,4);
      swatches.innerHTML = colorItems.map(color => `<span class="side-swatch" style="${getColorChipStyle(color)}"></span>`).join('');
    }
    if(sizes){
      const sibs = appState.products.filter(p => norm(p?.nombre || '') === norm(product?.nombre || ''));
      const sizeItems = Array.from(new Set(sibs.map(p => getProductSizeValue(p)).filter(Boolean))).slice(0,4);
      sizes.innerHTML = sizeItems.map(size => `<span class="side-size-chip">${escapeHtml(size)}</span>`).join('');
    }
    if(img){
      if(urls && urls[0]){ 
        img.src = urls[0]; 
        img.style.display = ''; 
        const backdropUrl = getProductBackdropUrl(product, urls[0]);
        el.style.setProperty('--side-card-bg', toCssImageUrl(backdropUrl || urls[0]));
        el.classList.add('has-side-image');
      }
      else { 
        img.removeAttribute('src'); 
        img.style.display = 'none'; 
        el.style.setProperty('--side-card-bg', 'none');
        el.classList.remove('has-side-image');
      }
    }
    el.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      syncExpandedModalSelection(product);
    };
    el.classList.add('visible');
  }
  function hideExpandedSideCards(){
    ['left','right'].forEach(side => {
      const el = document.getElementById('expandedSideCard-' + side);
      if(el) el.classList.remove('visible');
    });
  }
  function updateExpandedSideCards(){
    const main = document.getElementById('activeProductCard');
    if(!main || !main.classList.contains('search-card-expanded') || window.innerWidth <= 980){ hideExpandedSideCards(); return; }
    const items = getExpandedCarouselItems();
    if(items.length <= 1){ hideExpandedSideCards(); return; }
    const idx = getExpandedCarouselIndex(items);
    const prev = items[(idx - 1 + items.length) % items.length];
    const next = items[(idx + 1) % items.length];
    fillExpandedSideCard(ensureExpandedSideCard('left'), prev, 'left');
    fillExpandedSideCard(ensureExpandedSideCard('right'), next, 'right');
  }
  function bindExpandedSideCardKeys(){
    if(activeExpandedSideCardsBound) return;
    activeExpandedSideCardsBound = true;
    document.addEventListener('keydown', (e) => {
      const main = document.getElementById('activeProductCard');
      if(!main || !main.classList.contains('search-card-expanded')) return;
      const items = getExpandedCarouselItems();
      if(items.length <= 1) return;
      const idx = getExpandedCarouselIndex(items);
      if(e.key === 'ArrowLeft'){
        e.preventDefault();
        syncExpandedModalSelection(items[(idx - 1 + items.length) % items.length]);
      }else if(e.key === 'ArrowRight'){
        e.preventDefault();
        syncExpandedModalSelection(items[(idx + 1) % items.length]);
      }
    });
    window.addEventListener('resize', () => setTimeout(updateExpandedSideCards, 40));
  }
  function syncActiveProductCardHint(){
    const card = document.getElementById('activeProductCard');
    const hint = card ? card.querySelector('.search-card-expand-hint') : null;
    if(!hint || !card) return;
    const hasProduct = !!(appState && appState.selectedProduct && (appState.selectedProduct.nombre || appState.selectedProduct.sku));
    hint.style.display = hasProduct ? '' : 'none';
  }
  function openActiveProductCard(){
    const card = document.getElementById('activeProductCard');
    const overlay = document.getElementById('searchCardOverlay');
    if(!card || !overlay) return;
    if(card.classList.contains('search-card-expanded')) return;
    activeExpandedSearchCard = card;
    activeExpandedSearchCardParent = card.parentNode;
    activeExpandedSearchCardNextSibling = card.nextSibling;
    activeExpandedSearchCardPlaceholder = document.createElement('div');
    activeExpandedSearchCardPlaceholder.className = 'search-card-placeholder';
    activeExpandedSearchCardPlaceholder.style.height = card.offsetHeight + 'px';
    activeExpandedSearchCardPlaceholder.style.borderRadius = '24px';
    if(activeExpandedSearchCardParent){
      activeExpandedSearchCardParent.insertBefore(activeExpandedSearchCardPlaceholder, activeExpandedSearchCardNextSibling);
    }
    document.body.appendChild(card);
    card.classList.add('search-card-expanded');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('search-card-modal-open');
    bindExpandedSideCardKeys();
    setTimeout(updateExpandedSideCards, 40);
  }
  function closeActiveProductCard(){
    const card = activeExpandedSearchCard || document.getElementById('activeProductCard');
    const overlay = document.getElementById('searchCardOverlay');
    if(card){
      card.classList.remove('search-card-expanded');
      if(activeExpandedSearchCardParent){
        if(activeExpandedSearchCardPlaceholder && activeExpandedSearchCardPlaceholder.parentNode === activeExpandedSearchCardParent){
          activeExpandedSearchCardParent.insertBefore(card, activeExpandedSearchCardPlaceholder);
          activeExpandedSearchCardPlaceholder.remove();
        }else if(activeExpandedSearchCardNextSibling && activeExpandedSearchCardNextSibling.parentNode === activeExpandedSearchCardParent){
          activeExpandedSearchCardParent.insertBefore(card, activeExpandedSearchCardNextSibling);
        }else{
          activeExpandedSearchCardParent.appendChild(card);
        }
      }
    }
    if(overlay){
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden','true');
    }
    document.body.classList.remove('search-card-modal-open');
    hideExpandedSideCards();
    activeExpandedSearchCard = null;
    activeExpandedSearchCardPlaceholder = null;
    activeExpandedSearchCardParent = null;
    activeExpandedSearchCardNextSibling = null;
  }
  function bindActiveProductCardExpansion(){
    const card = document.getElementById('activeProductCard');
    const overlay = document.getElementById('searchCardOverlay');
    const closeBtn = document.getElementById('activeProductCardClose');
    if(!card || card.dataset.expandBound === '1') return;
    card.dataset.expandBound = '1';
    card.addEventListener('click', (e) => {
      if(e.target && e.target.closest('#activeProductCardClose')) return;
      if(card.classList.contains('search-card-expanded')) return;
      openActiveProductCard();
    });
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        if(card.classList.contains('search-card-expanded')) closeActiveProductCard();
        else openActiveProductCard();
      }
      if(e.key === 'Escape') closeActiveProductCard();
    });
    if(overlay && overlay.dataset.boundCardExpand !== '1'){ overlay.addEventListener('click', closeActiveProductCard); overlay.dataset.boundCardExpand = '1'; }
    if(closeBtn && closeBtn.dataset.boundCardExpand !== '1'){ closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeActiveProductCard(); }); closeBtn.dataset.boundCardExpand = '1'; }
    if(document.body.dataset.boundCardExpandEsc !== '1'){ document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeActiveProductCard(); }); document.body.dataset.boundCardExpandEsc = '1'; }
    syncActiveProductCardHint();
  }

  function productMatchesLocalFilters(product, filters = null){
    const p = product || {};
    const f = filters || appState.productFilters || {};
    const exactChecks = [
      ['brand', p.brand || p.marca || ''],
      ['category', getProductCategoryValue(p)],
      ['gender', getProductGenderValue(p)],
      ['warehouse', p.warehouse || p.almacen || ''],
      ['zone', p.zone || p.zona || ''],
      ['rack', p.rack || p.estante || ''],
    ];
    for(const [key, rawValue] of exactChecks){
      const expected = String(f?.[key] || '').trim();
      if(expected && String(rawValue || '').trim() !== expected) return false;
    }
    const imageState = String(f?.image_state || '').trim();
    const hasImage = !!String(p.image_url || p.imagen || '').trim();
    if(imageState === 'with_image' && !hasImage) return false;
    if(imageState === 'without_image' && hasImage) return false;
    const locationState = String(f?.location_state || '').trim();
    const hasLocation = !!String(p.location || p.ubicacion || '').trim();
    if(locationState === 'complete' && !hasLocation) return false;
    if(locationState === 'incomplete' && hasLocation) return false;
    const stockState = String(f?.stock_state || '').trim();
    const stock = Number(p.stock || 0);
    if(stockState === 'with_stock' && !(stock > 0)) return false;
    if(stockState === 'without_stock' && stock > 0) return false;
    return true;
  }

  function filterProducts(){
    ensureAppRuntimeState();
    const rawQ = String(searchInput?.value || '').trim();
    const q = norm(rawQ);
    // En esta versión estable el buscador trabaja localmente para evitar fallos por endpoints remotos incompletos.
    appState.productPaging = {
      ...ensureProductPagingState(),
      mode:'local',
      page:1,
      query:rawQ,
      loading:false,
      lastError:''
    };
    const source = Array.isArray(appState.products) ? appState.products.slice() : [];
    if(!q){
      appState.filtered = source.filter(p => productMatchesLocalFilters(p));
      clearSearchHighlights();
      const selected = appState.selectedProduct && appState.filtered.find(p => getProductIdentityKey(p) === getProductIdentityKey(appState.selectedProduct));
      appState.selectedProduct = selected || appState.filtered[0] || null;
      updateActiveProductCard(appState.selectedProduct || null);
      syncActiveProductCardHint();
      renderProducts(appState.filtered);
      if(appState.screen === 'dashboard') renderDashboard();
      else if(['products','viewer'].includes(appState.screen)) renderMapView();
      else if(appState.screen === 'layout'){ renderLayoutEditor(); renderLayoutInspector(); }
      return;
    }
    const tokens = q.split(/\s+/).map(t => t.trim()).filter(Boolean);
    const compactQuery = q.replace(/\s+/g, ' ').trim();
    const index = Array.isArray(appState.searchIndex) && appState.searchIndex.length
      ? appState.searchIndex
      : buildProductSearchIndex(source);
    const scored = index.map(entry => {
      const { p, familyText, variantText, locationText, haystack, nameOnly, nameVariant, exactSku, exactRack, exactRackStore, exactUbic, exactAlm, idx } = entry;
      const phraseInFamily = familyText.includes(compactQuery);
      const phraseInNameVariant = nameVariant.includes(compactQuery);
      const phraseInFull = haystack.includes(compactQuery);
      let score = 0;
      if (exactSku === q) score += 260;
      if (familyText === q || nameOnly === q) score += 220;
      if (nameVariant === q) score += 180;
      if (phraseInFamily) score += 170;
      if (phraseInNameVariant) score += 140;
      if (phraseInFull) score += 95;
      if (exactRack === q || exactRackStore === q) score += 90;
      if (exactUbic === q || exactAlm === q) score += 90;
      let familyMatches = 0, variantMatches = 0, locationMatches = 0, matchedTokens = 0;
      tokens.forEach(t => {
        let matched = false;
        if (familyText.includes(t)) { familyMatches += 1; score += 30; matched = true; if (nameOnly.includes(t)) score += 12; if (familyText.startsWith(t) || nameOnly.startsWith(t)) score += 14; }
        if (variantText.includes(t)) { variantMatches += 1; score += 20; matched = true; if (exactSku.startsWith(t)) score += 20; }
        if (locationText.includes(t)) { locationMatches += 1; score += 10; matched = true; }
        if (matched) matchedTokens += 1;
      });
      const allTokensPresent = tokens.length ? matchedTokens === tokens.length : false;
      if (allTokensPresent) score += 36 + tokens.length * 7;
      const contentMatches = familyMatches + variantMatches;
      const strongPhrase = phraseInFamily || phraseInNameVariant || phraseInFull || exactSku === q || exactUbic === q || exactAlm === q;
      let passes = false;
      if (tokens.length === 1) passes = contentMatches >= 1 || locationMatches >= 1 || strongPhrase || exactSku.includes(compactQuery);
      else if (tokens.length === 2) passes = allTokensPresent && (contentMatches >= 2 || strongPhrase || (familyMatches >= 1 && variantMatches >= 1));
      else passes = allTokensPresent && (contentMatches >= Math.max(2, tokens.length - 1) || strongPhrase || familyMatches >= Math.max(2, tokens.length - 1));
      return { p, score, matchedTokens, familyMatches, variantMatches, passes, idx };
    }).filter(x => x.passes && x.score >= (tokens.length >= 3 ? 60 : tokens.length === 2 ? 34 : 10))
      .sort((a,b) => b.score - a.score || b.familyMatches - a.familyMatches || b.variantMatches - a.variantMatches || a.idx - b.idx);
    appState.filtered = scored.map(x => x.p).filter(p => productMatchesLocalFilters(p));
    const primary = appState.filtered[0] || null;
    if(primary){
      appState.selectedProduct = primary;
      appState.selectedRack = primary.rack || primary.rackStore || appState.selectedRack;
      appState.selectedRackLayoutId = primary.rack || primary.rackStore || appState.selectedRackLayoutId;
    }
    const rackIds = [];
    appState.filtered.slice(0, 250).forEach(p => { if(p.rack) rackIds.push(p.rack); if(p.rackStore) rackIds.push(p.rackStore); });
    setSearchHighlightedRacks(rackIds, primary?.rack || primary?.rackStore || '');
    if(primary){ updateActiveProductCard(primary); applyProductSelectionEffects(primary); }
    else { updateActiveProductCard(null); clearSearchHighlights(); }
    syncActiveProductCardHint();
    renderProducts(appState.filtered);
    if(appState.screen === 'dashboard') renderDashboard();
    else if(['products','viewer'].includes(appState.screen)) renderMapView();
    else if(appState.screen === 'layout'){ renderLayoutEditor(); renderLayoutInspector(); }
  }

  function selectProduct(p){
    if(document.body.classList.contains('search-card-modal-open')){
      syncExpandedModalSelection(p);
      return;
    }
    appState.selectedProduct = p;
    applyProductSelectionEffects(p);
    updateActiveProductCard(p);
    syncActiveProductCardHint();
    if(appState.screen === 'dashboard'){
      renderDashboard();
    } else if(['products','reports','viewer'].includes(appState.screen)){
      renderMapView();
      renderRackDetail(p.rack || p.rackStore, p);
    } else if (appState.screen === 'layout') {
      renderLayoutEditor();
      renderLayoutInspector();
    } else if (appState.screen === 'racks') {
      renderRackModels();
      renderRackModelPreview();
    }
    renderProducts(appState.filtered);
  }

  function findRackById(id){ return appState.layout.racks.find(r => r.id === id); }
  function findZoneById(id){ return appState.layout.zones.find(z => z.id === id); }
  function rackModel(id){ return appState.models.find(m => m.id === id) || appState.models[0]; }
  function getSelectedRackIds(){
    const ids = Array.isArray(appState.selectedRackLayoutIds) ? appState.selectedRackLayoutIds.filter(Boolean) : [];
    if(appState.selectedRackLayoutId && !ids.includes(appState.selectedRackLayoutId)) ids.unshift(appState.selectedRackLayoutId);
    return Array.from(new Set(ids));
  }
  function setSelectedRackIds(ids){
    const clean = Array.from(new Set((ids||[]).filter(Boolean)));
    appState.selectedRackLayoutIds = clean;
    appState.selectedRackLayoutId = clean[0] || '';
    if(appState.selectedRackLayoutId){
      const rack = findRackById(appState.selectedRackLayoutId);
      if(rack) appState.selectedZoneId = rack.zoneId;
    }
  }
  function isRackSelected(id){ return getSelectedRackIds().includes(id); }
  function toggleRackSelection(id){
    const ids = getSelectedRackIds();
    const idx = ids.indexOf(id);
    if(idx >= 0) ids.splice(idx,1); else ids.push(id);
    setSelectedRackIds(ids);
  }
  function clearRackSelection(){ setSelectedRackIds([]); }
  function setSearchHighlightedRacks(ids, primary=''){
    const clean = Array.from(new Set((ids||[]).filter(Boolean)));
    appState.highlightedRackIds = clean;
    appState.primaryHighlightedRackId = primary && clean.includes(primary) ? primary : (clean[0] || '');
  }
  function isRackSearchHit(id){ return (appState.highlightedRackIds || []).includes(id); }
  function clearSearchHighlights(){ setSearchHighlightedRacks([], ''); }
  function getDragSelectionBox(){
    const ds = appState.editor?.dragSelect;
    if(!ds?.start || !ds?.end) return null;
    const x = Math.min(ds.start.x, ds.end.x), y = Math.min(ds.start.y, ds.end.y);
    return { x, y, w:Math.abs(ds.end.x - ds.start.x), h:Math.abs(ds.end.y - ds.start.y) };
  }
  function rackIntersectsBox(rack, box){
    return !!box && rack.x < box.x + box.w && rack.x + rack.w > box.x && rack.y < box.y + box.h && rack.y + rack.h > box.y;
  }
  function startDragSelection(startPoint, additive=false){
    appState.editor.dragSelect = { active:true, additive:!!additive, start:{x:startPoint.x,y:startPoint.y}, end:{x:startPoint.x,y:startPoint.y} };
    if(!additive) clearRackSelection();
  }
  function updateDragSelection(point){
    const ds = appState.editor?.dragSelect;
    if(!ds?.active) return;
    ds.end = { x:point.x, y:point.y };
  }
  function commitDragSelection(){
    const ds = appState.editor?.dragSelect;
    if(!ds?.active) return false;
    const box = getDragSelectionBox();
    if(box && box.w >= 6 && box.h >= 6){
      const ids = ds.additive ? getSelectedRackIds() : [];
      (appState.layout.racks || []).forEach(r => { if(rackIntersectsBox(r, box)) ids.push(r.id); });
      setSelectedRackIds(ids);
      appState.editor.dragSelect = { active:false, additive:false, start:null, end:null };
      return true;
    }
    appState.editor.dragSelect = { active:false, additive:false, start:null, end:null };
    return false;
  }
  function applyModelToSelectedRacks(){
    const ids = getSelectedRackIds();
    const model = rackModel(appState.selectedModelId);
    if(!model || !ids.length) return;
    ids.forEach(id => {
      const rack = findRackById(id);
      if(!rack) return;
      const prev = clone(rack);
      const center = { x: rack.x + rack.w/2, y: rack.y + rack.h/2 };
      const fp = getRackFootprint(model.id, rack.rot || 0);
      rack.modelId = model.id;
      rack.w = fp.w; rack.h = fp.h;
      rack.rackHeight = Number(model.height || rack.rackHeight || 238);
      rack.x = snapGrid(center.x - rack.w/2);
      rack.y = snapGrid(center.y - rack.h/2);
      const zone = findZoneById(rack.zoneId) || nearestZoneForPoint(center);
      if(zone){
        keepRackSnapped(rack, zone);
        if(!rackFullyInsideZone(rack, zone)){
          rack.x = prev.x; rack.y = prev.y; rack.w = prev.w; rack.h = prev.h; rack.modelId = prev.modelId; rack.rackHeight = prev.rackHeight;
        }
      }
    });
    normalizeZoneAndRackIds();
    persistActiveLayout();
    renderLayoutEditor();
  }
  function nextRackId(zoneId){
    const vals = appState.layout.racks.filter(r => r.zoneId === zoneId).map(r => parseInt((r.id.match(/-E(\d+)/)||[])[1] || '0', 10));
    return `${zoneId}-E${(Math.max(0,...vals)+1)}`;
  }
  function nextZoneId(){
    const nums = appState.layout.zones
      .map(z => { const m = String(z.id || '').match(/^Z(\d+)$/i); return m ? parseInt(m[1], 10) : 0; })
      .filter(Boolean);
    const next = Math.max(2, ...nums) + 1;
    return 'Z' + next;
  }

  function normalizeZoneCode(code){
    return String(code || '').trim().toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  }
  function renameZoneId(oldId, nextId){
    const current = normalizeZoneCode(oldId);
    const target = normalizeZoneCode(nextId);
    if(!current || !target || current === target) return current || target;
    if(appState.layout.zones.some(z => z.id === target && z.id !== current)){
      alert('La nomenclatura de zona ya existe.');
      return current;
    }
    const zone = findZoneById(current);
    if(!zone) return current;
    zone.id = target;
    appState.layout.racks.filter(r => r.zoneId === current).forEach(r => {
      r.zoneId = target;
      const suffix = (String(r.id).match(/-E\d+$/i) || ['-E1'])[0];
      r.id = `${target}${suffix}`;
    });
    if(appState.selectedZoneId === current) appState.selectedZoneId = target;
    if(appState.selectedEdge.zoneId === current) appState.selectedEdge.zoneId = target;
    if(appState.selectedVertex.zoneId === current) appState.selectedVertex.zoneId = target;
    if(appState.editor.dragging?.zoneId === current) appState.editor.dragging.zoneId = target;
    if(appState.selectedRackLayoutId){
      const found = appState.layout.racks.find(r => r.id === appState.selectedRackLayoutId);
      if(!found){
        const zoneRack = appState.layout.racks.find(r => r.zoneId === target);
        appState.selectedRackLayoutId = zoneRack?.id || '';
      }
    }
    return target;
  }

  const DEFAULT_GRID_SIZE = 2;
  const DEFAULT_DIM_FONT_SIZE = 32;
  function isSnapEnabled(){ return appState.editor?.snapEnabled !== false; }
  function getSnapSize(){
    const raw = Number(appState.editor?.snapSize);
    if(!Number.isFinite(raw) || raw <= 0) return DEFAULT_GRID_SIZE;
    return Math.max(1, Math.min(80, raw));
  }
  function getDimFontSize(){
    const raw = Number(appState.editor?.dimFontSize);
    if(!Number.isFinite(raw) || raw <= 0) return DEFAULT_DIM_FONT_SIZE;
    return Math.max(14, Math.min(72, raw));
  }
  function snapGrid(n){
    const value = Number(n) || 0;
    if(!isSnapEnabled()) return value;
    const step = getSnapSize();
    return Math.round(value / step) * step;
  }
  function normalizeAngle(a){ return (((Number(a) || 0) % 360) + 360) % 360; }
  function getRackBaseSize(modelId){
    const m = rackModel(modelId);
    const scale = 1;
    return {
      w: Math.max(44, Math.round((m.width || 150) * scale)),
      h: Math.max(24, Math.round((m.depth || 82) * scale))
    };
  }
  function getRackFootprint(modelId, rot = 0){
    const base = getRackBaseSize(modelId);
    const rad = normalizeAngle(rot) * Math.PI / 180;
    const c = Math.abs(Math.cos(rad)), s = Math.abs(Math.sin(rad));
    const w = Math.max(40, Math.round(base.w * c + base.h * s));
    const h = Math.max(40, Math.round(base.w * s + base.h * c));
    return { w, h, baseW: base.w, baseH: base.h };
  }

  function getRackStackLevel(rack){
    return Math.max(0, parseInt(rack?.stackLevel || 0, 10) || 0);
  }
  function racksCanOverlapByLevel(a, b){
    return getRackStackLevel(a) !== getRackStackLevel(b);
  }
  function rackStackKey(r){
    return [String(r.zoneId||''), Math.round(Number(r.x||0)), Math.round(Number(r.y||0))].join('|');
  }
  function getRackStackMembers(rack){
    if(!rack) return [];
    const key = rackStackKey(rack);
    return (appState.layout.racks || [])
      .filter(r => rackStackKey(r) === key)
      .sort((a,b) => (getRackStackLevel(a) - getRackStackLevel(b)) || ((a.baseHeight||0) - (b.baseHeight||0)) || (a.id > b.id ? 1 : -1));
  }
  function getRackStackCount(rack){
    return getRackStackMembers(rack).length;
  }
  function syncStackGroupHeights(group){
    const members = Array.isArray(group) ? group.slice().sort((a,b) => (getRackStackLevel(a) - getRackStackLevel(b)) || (a.id > b.id ? 1 : -1)) : [];
    if(!members.length) return;
    if(members.length === 1){
      const only = members[0];
      const h = Math.max(60, Number(only.rackHeight || rackModel(only.modelId)?.height || 240) || 240);
      only.baseHeight = getRackStackLevel(only) * h;
      return;
    }
    let cumulative = 0;
    members.forEach((member, idx) => {
      member.stackLevel = idx;
      member.baseHeight = cumulative;
      cumulative += Math.max(60, Number(member.rackHeight || rackModel(member.modelId)?.height || 240) || 240);
    });
  }
  function recalcAllRackStackHeights(){
    const groups = new Map();
    (appState.layout?.racks || []).forEach(r => {
      const key = rackStackKey(r);
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    });
    groups.forEach(group => syncStackGroupHeights(group));
  }
  function rackStackSummary(rack){
    const members = getRackStackMembers(rack);
    return {
      members,
      count: members.length,
      isStacked: members.length > 1,
      level: getRackStackLevel(rack),
      key: members.length ? rackStackKey(members[0]) : ''
    };
  }
  function duplicateRackAbove(rackId){
    const rack = findRackById(rackId);
    if(!rack) return;
    const zone = findZoneById(rack.zoneId);
    if(!zone) return;
    const cloneRack = clone(rack);
    cloneRack.id = nextRackId(rack.zoneId);
    cloneRack.stackLevel = getRackStackLevel(rack) + 1;
    cloneRack.baseHeight = 0;
    cloneRack.zoneId = rack.zoneId;
    cloneRack.x = rack.x;
    cloneRack.y = rack.y;
    cloneRack.rot = normalizeAngle(rack.rot || 0);
    cloneRack.rackHeight = Math.max(60, Number(rack.rackHeight || rackModel(rack.modelId)?.height || 240) || 240);
    syncRackFootprint(cloneRack, false);
    appState.layout.racks.push(cloneRack);
    recalcAllRackStackHeights();
    appState.selectedRackLayoutId = cloneRack.id;
    appState.selectedZoneId = cloneRack.zoneId;
    persistActiveLayout();
    renderLayoutEditor();
  }
  function openStackMenuForRack(rackId, evt){
    const rack = findRackById(rackId);
    if(!rack) return;
    const summary = rackStackSummary(rack);
    if(summary.count <= 1){
      appState.editor.stackMenu = { open:false, rackId:'', x:0, y:0 };
      return;
    }
    let x = 28, y = 74;
    const svg = document.getElementById('layoutSvg');
    if(svg){
      const svgRect = svg.getBoundingClientRect();
      if(evt && Number.isFinite(evt.clientX) && Number.isFinite(evt.clientY)){
        x = evt.clientX - svgRect.left + 12;
        y = evt.clientY - svgRect.top + 12;
      } else {
        x = 28; y = 74;
      }
    }
    appState.editor.stackMenu = { open:true, rackId, x, y };
  }
  function closeStackMenu(){
    appState.editor.stackMenu = { open:false, rackId:'', x:0, y:0 };
  }
  function getFrontLine(baseW, baseH){
    const pad = 8;
    // El frente siempre es el lado más largo del rack.
    // Si el ancho base es mayor o igual al fondo, el frente es el borde superior.
    // Si el fondo es mayor, el frente es el borde derecho.
    if(baseW >= baseH){
      return { x1: -baseW/2 + 12, y1: -baseH/2 + pad, x2: baseW/2 - 12, y2: -baseH/2 + pad, ax: 0, ay: -baseH/2 - 10, dir:'up' };
    }
    return { x1: baseW/2 - pad, y1: -baseH/2 + 12, x2: baseW/2 - pad, y2: baseH/2 - 12, ax: baseW/2 + 10, ay: 0, dir:'right' };
  }
  function frontArrowPath(x, y, dir){
    if(dir === 'right') return `M ${x-9} ${y-6} L ${x-9} ${y+6} L ${x+4} ${y} Z`;
    if(dir === 'down') return `M ${x-6} ${y-9} L ${x+6} ${y-9} L ${x} ${y+4} Z`;
    if(dir === 'left') return `M ${x+9} ${y-6} L ${x+9} ${y+6} L ${x-4} ${y} Z`;
    return `M ${x-6} ${y+9} L ${x+6} ${y+9} L ${x} ${y-4} Z`;
  }
  function syncRackFootprint(rack, preserveCenter = true){
    if(!rack) return;
    const oldW = rack.w || 48, oldH = rack.h || 90;
    const cx = rack.x + oldW / 2, cy = rack.y + oldH / 2;
    const fp = getRackFootprint(rack.modelId, rack.rot || 0);
    rack.w = fp.w; rack.h = fp.h;
    if(preserveCenter){
      rack.x = cx - rack.w / 2;
      rack.y = cy - rack.h / 2;
    }
  }
  function applyRackRotation(rack, nextAngle, { preserveCenter = true, snap = true } = {}){
    if(!rack) return;
    const cx = rack.x + (rack.w || 0) / 2;
    const cy = rack.y + (rack.h || 0) / 2;
    rack.rot = normalizeAngle(nextAngle);
    syncRackFootprint(rack, false);
    if(preserveCenter){
      rack.x = cx - rack.w / 2;
      rack.y = cy - rack.h / 2;
    }
    const host = findZoneById(rack.zoneId) || nearestZoneForPoint({ x:cx, y:cy });
    if(host){
      keepRackSnapped(rack, host);
      rack.zoneId = host.id;
    }
  }

  function rotatePointAround(point, center, degrees){
    const rad = (Number(degrees) || 0) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const dx = (Number(point?.x) || 0) - center.x;
    const dy = (Number(point?.y) || 0) - center.y;
    return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos };
  }

  function getZoneRotationDegrees(zone){
    if(!zone || !Array.isArray(zone.pts) || zone.pts.length < 2) return 0;
    const a = zone.pts[0], b = zone.pts[1];
    return normalizeAngle(Math.atan2((Number(b.y)||0) - (Number(a.y)||0), (Number(b.x)||0) - (Number(a.x)||0)) * 180 / Math.PI);
  }

  function rotateZoneWithContents(zoneId, deltaDegrees, { persist=true, rerender=true } = {}){
    const zone = findZoneById(zoneId);
    if(!zone || !Array.isArray(zone.pts) || zone.pts.length < 3) return;
    const delta = Number(deltaDegrees) || 0;
    if(!delta) return;
    const center = polygonCentroid(zone.pts);
    zone.pts = zone.pts.map(pt => rotatePointAround(pt, center, delta));
    (appState.layout.racks || []).filter(r => r.zoneId === zone.id).forEach(rack => {
      const oldCx = (Number(rack.x)||0) + (Number(rack.w)||0) / 2;
      const oldCy = (Number(rack.y)||0) + (Number(rack.h)||0) / 2;
      const nextCenter = rotatePointAround({ x:oldCx, y:oldCy }, center, delta);
      rack.rot = normalizeAngle((Number(rack.rot)||0) + delta);
      syncRackFootprint(rack, false);
      rack.x = nextCenter.x - (Number(rack.w)||0) / 2;
      rack.y = nextCenter.y - (Number(rack.h)||0) / 2;
      rack.zoneId = zone.id;
    });
    appState.selectedZoneId = zone.id;
    clearRackSnapPreview();
    if(persist) persistActiveLayout();
    if(rerender) renderLayoutEditor();
  }

  function setZoneRotation(zoneId, targetDegrees){
    const zone = findZoneById(zoneId);
    if(!zone) return;
    const current = getZoneRotationDegrees(zone);
    let delta = (Number(targetDegrees) || 0) - current;
    if(delta > 180) delta -= 360;
    if(delta < -180) delta += 360;
    rotateZoneWithContents(zoneId, delta);
  }

  function ensureRackProps(){
    if(appState.editor.racksVisible !== false) appState.layout.racks.forEach(r => {
      r.rot = normalizeAngle(r.rot || 0);
      const model = rackModel(r.modelId);
      const defaultHeight = Math.max(120, Number(model?.height || 238) || 238);
      const legacyStack = Math.max(0, parseInt(r.stackLevel || 0, 10) || 0);
      if(!Number.isFinite(Number(r.baseHeight))) r.baseHeight = legacyStack * defaultHeight;
      if(!Number.isFinite(Number(r.rackHeight)) || Number(r.rackHeight) <= 0) r.rackHeight = defaultHeight;
      r.baseHeight = Math.max(0, Number(r.baseHeight) || 0);
      r.rackHeight = Math.max(60, Number(r.rackHeight) || defaultHeight);
      syncRackFootprint(r, false);
    });
  }


  async function loadSheetFromConfig(){
    const url = appState.sheetConfig.url;
    const sheetName = appState.sheetConfig.sheetName || 'Productos';
    const id = parseSheetUrl(url);
    if(!id){ alert('URL o ID de Google Sheet inválido.'); return; }
    sheetStatusChip.textContent = 'Cargando sheet...';
    contentStatus.textContent = 'Intentando leer Google Sheet...';
    try {
      const endpoint = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=0&sheet=${encodeURIComponent(sheetName)}`;
      const text = await fetch(endpoint).then(r => r.text());
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows || [];
      const rowValues = rows.map(r => (r.c || []).map(c => String(c?.v ?? '').trim()));

      const normalizeHeaderKey = (v) => {
        const s = norm(String(v || ''));
        const compact = s.replace(/\s+/g, '');
        const map = {
          'sku':'sku',
          'nombre':'nombre',
          'variante':'variante',
          'barras':'barras',
          'barra':'barras',
          'ubicacion':'ubicacion',
          'ubiccaion':'ubicacion',
          'ubicaion':'ubicacion',
          'ubiccacion':'ubicacion',
          'almacen':'almacen',
          'alamacen':'almacen',
          'alamacenf':'almacen',
          'alamacenfinal':'almacen',
          'alamacen2':'almacen',
          'alamacen1':'almacen',
          'alamacenprincipal':'almacen',
          'alamacenrespaldo':'almacen',
          'alamacenreserva':'almacen',
          'alamacenstock':'almacen',
          'alamacenubicacion':'almacen',
          'alamacenubi':'almacen',
          'alamacenn':'almacen',
          'alamacenx':'almacen',
          'alamacenw':'almacen',
          'alamacenv':'almacen',
          'alamacenq':'almacen',
          'alamacenr':'almacen',
          'alamacenm':'almacen',
          'alamaacen':'almacen',
          'alamacn':'almacen',
          'alamac':'almacen',
          'alam':'almacen',
          'alamacen ':'almacen',
          'alamacen_':'almacen',
          'almacen':'almacen',
          'almacenubicado':'almacen',
          'zona':'zona',
          'estante':'estante',
          'nivel':'nivel',
          'slot':'slot'
        };
        return map[compact] || compact;
      };

      const expected = ['sku','nombre','variante','barras','ubicacion','almacen','zona','estante','nivel','slot'];
      const scoreHeaderRow = (vals, rowIndex) => {
        const keys = vals.map(normalizeHeaderKey).filter(Boolean);
        const set = new Set(keys);
        let score = 0;
        expected.forEach(k => { if (set.has(k)) score += 3; });
        if (set.has('sku')) score += 5;
        if (set.has('nombre')) score += 5;
        if (set.has('variante')) score += 4;
        if (set.has('barras')) score += 4;
        if (set.has('ubicacion')) score += 8; // priorizar columna fusionada
        if (set.has('almacen')) score += 8;   // priorizar columna fusionada
        if (rowIndex === 1 && score > 0) score += 6; // preferir fila 2 si coincide
        return score;
      };

      let headerRowIndex = 0;
      let bestScore = -1;
      for (let i = 0; i < Math.min(12, rowValues.length); i++){
        const score = scoreHeaderRow(rowValues[i], i);
        if (score > bestScore){
          bestScore = score;
          headerRowIndex = i;
        }
      }

      const headerVals = rowValues[headerRowIndex] || [];
      const headers = headerVals.map((raw, idx) => ({ raw, key: normalizeHeaderKey(raw), idx }));
      const duplicates = (name) => headers.filter(h => h.key === name).map(h => h.idx);
      const firstOf = (...names) => {
        for (const n of names){
          const key = normalizeHeaderKey(n);
          const hit = headers.find(h => h.key === key);
          if (hit) return hit.idx;
        }
        return -1;
      };
      const val = (vals, i) => String(vals?.[i] ?? '').trim();

      // Fallback fijo por columnas: J barras, K sku, L nombre, M variante, R ubicacion, W almacen
      // N/O/P/Q = zona/estante/nivel/slot principal
      // S/T/U/V = zona/estante/nivel/slot almacén
      const fallback = {
        barras: 9,
        sku: 10,
        nombre: 11,
        variante: 12,
        zona1: 13,
        estante1: 14,
        nivel1: 15,
        slot1: 16,
        ubicacion: 17,
        zona2: 18,
        estante2: 19,
        nivel2: 20,
        slot2: 21,
        almacen: 22
      };

      const iSKU = firstOf('sku') >= 0 ? firstOf('sku') : fallback.sku;
      const iNombre = firstOf('nombre') >= 0 ? firstOf('nombre') : fallback.nombre;
      const iVar = firstOf('variante') >= 0 ? firstOf('variante') : fallback.variante;
      const iBarras = firstOf('barras','barra') >= 0 ? firstOf('barras','barra') : fallback.barras;
      const iImagen = firstOf('imagen','imagen 1','imagen1','image','image 1','image1','foto','foto 1','foto1','img','img 1','img1');
      const iImagen2 = firstOf('imagen 2','imagen2','image 2','image2','foto 2','foto2','img 2','img2');
      const iImagen3 = firstOf('imagen 3','imagen3','image 3','image3','foto 3','foto3','img 3','img3');
      const iImagen4 = firstOf('imagen 4','imagen4','image 4','image4','foto 4','foto4','img 4','img4');
      const iFondoCard = firstOf('fondo card','fondo_card','background card','background_card','imagen fondo','imagen_fondo','url fondo','link fondo');
      const iTalla = firstOf('talla','size');
      const iColor = firstOf('color','colour');
      const iUb = firstOf('ubicacion','ubiccaion','ubicaion','ubiccacion') >= 0 ? firstOf('ubicacion','ubiccaion','ubicaion','ubiccacion') : fallback.ubicacion;
      const iAlm = firstOf('almacen','alamacen','almacen','alamaacen','alamacn','alamac') >= 0 ? firstOf('almacen','alamacen','almacen','alamaacen','alamacn','alamac') : fallback.almacen;

      const zonas = duplicates('zona');
      const estantes = duplicates('estante');
      const niveles = duplicates('nivel');
      const slots = duplicates('slot');
      const mainZona = zonas[0] ?? fallback.zona1, storeZona = zonas[1] ?? fallback.zona2;
      const mainEst = estantes[0] ?? fallback.estante1, storeEst = estantes[1] ?? fallback.estante2;
      const mainNiv = niveles[0] ?? fallback.nivel1, storeNiv = niveles[1] ?? fallback.nivel2;
      const mainSlot = slots[0] ?? fallback.slot1, storeSlot = slots[1] ?? fallback.slot2;

      const buildLocation = (z,e,n,s) => {
        const zzRaw = String(z || '').trim().toUpperCase();
        const zz = /^ALM(?:ACEN)?$/.test(zzRaw) ? 'ALM' : zzRaw;
        const ee = String(e || '').trim().toUpperCase();
        const nn = String(n || '').trim().toUpperCase();
        const ss = String(s || '').trim().toUpperCase();
        const parts = [zz, ee, nn, ss].filter(Boolean);
        if (!parts.length) return '';
        return parts.join('-');
      };

      const normalizeLocationString = normalizeLocationCode;

      const parseLoc = (txt, fallbackRack='Z1-E1') => {
        const parsed = parseLocationCode(txt, fallbackRack);
        return { raw: parsed.raw, rack: parsed.rackId, zona: parsed.zoneId, nivel: parsed.level, slot: parsed.slot };
      };

      const dataRows = rowValues.slice(headerRowIndex + 1);
      const parsed = dataRows.map((vals, dataIndex) => {
        const rawRecord = {};
        headerVals.forEach((h, hi) => { if(String(h||'').trim()) rawRecord[String(h).trim()] = String(vals[hi] || '').trim(); });
        const sku = val(vals, iSKU);
        const nombre = val(vals, iNombre);
        const variante = val(vals, iVar);
        const barras = val(vals, iBarras);
        const imagen = val(vals, iImagen);
        const imagen2 = val(vals, iImagen2);
        const imagen3 = val(vals, iImagen3);
        const imagen4 = val(vals, iImagen4);
        const imagenes = [imagen, imagen2, imagen3, imagen4].filter(Boolean);
        const fondo_card = val(vals, iFondoCard);
        const talla = val(vals, iTalla);
        const color = val(vals, iColor);

        // Prioridad total a columnas fusionadas Ubiccaion y Alamacen
        let ubicacion = normalizeLocationString(val(vals, iUb));
        let almacen = normalizeLocationString(val(vals, iAlm));

        if (!ubicacion){
          ubicacion = buildLocation(val(vals, mainZona), val(vals, mainEst), val(vals, mainNiv), val(vals, mainSlot));
        }
        if (!almacen){
          almacen = buildLocation(val(vals, storeZona), val(vals, storeEst), val(vals, storeNiv), val(vals, storeSlot));
        }

        const main = parseLoc(ubicacion, 'Z1-E1');
        const store = parseLoc(almacen, 'ALM-E1');

        return {
          sku,
          barras,
          nombre,
          variante,
          imagen,
          imagen2,
          imagen3,
          imagen4,
          imagenes,
          fondo_card,
          talla,
          color,
          categoria,
          category: categoria,
          genero,
          gender: genero,
          ubicacion: main.raw || ubicacion,
          almacen: store.raw || almacen,
          rack: main.rack,
          rackStore: store.rack,
          zona: main.zona,
          zonaStore: store.zona,
          nivel: main.nivel,
          slot: main.slot,
          nivelStore: store.nivel,
          slotStore: store.slot,
          _raw: rawRecord,
          _rowIndex: headerRowIndex + 1 + dataIndex
        };
      }).filter(x => x.sku || x.nombre || x.barras);

      if(parsed.length){
        setProductDataset(parsed);
        appState.filtered = appState.products.slice();
        appState.sheetConfig.lastMode = 'google';
        syncBranchLayoutWithProducts(getActiveLayoutBranchIndex(), parsed);
        sheetStatusChip.textContent = `${parsed.length.toLocaleString('es-PE')} filas`;
        contentStatus.textContent = `Sheet vinculado. Encabezados detectados en fila ${headerRowIndex + 1}. Columnas: SKU ${iSKU+1}, Nombre ${iNombre+1}, Variante ${iVar+1}, Ubicación ${iUb+1}, Almacén ${iAlm+1}. Layout sincronizado por niveles/slots.`;
        selectProduct(parsed[0]);
        renderProducts(parsed);
        renderCurrentScreen();
      } else {
        throw new Error('No se encontraron filas útiles.');
      }
    } catch (err) {
      console.error(err);
      sheetStatusChip.textContent = 'Error de lectura';
      contentStatus.textContent = 'No se pudo leer la hoja. Verifica permisos, URL, fila de encabezados y nombre de hoja.';
      alert('No se pudo leer el Google Sheet. Verifica que esté compartido y que el nombre de hoja sea correcto.');
    }
  }




  function loadBranchLayouts(){
    try{
      const raw = localStorage.getItem('wms_branch_layouts_v2');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    }catch{ return {}; }
  }
  function saveBranchLayouts(){
    try{ localStorage.setItem('wms_branch_layouts_v2', JSON.stringify(appState.branchLayouts||{})); }catch{}
  }
  const ZONE_COLOR_PALETTE = ['#ffd84d','#58c5ff','#6ef0a8','#ff8f70','#c48bff','#7cf0ff','#ff5db1','#9ee65e','#ffb84d','#63a4ff'];
  function getBranchColor(index){
    return (appState.admin?.branches?.[index]?.color) || ZONE_COLOR_PALETTE[(Number(index)||0) % ZONE_COLOR_PALETTE.length] || DEFAULT_ZONE_COLOR;
  }
  function getNextZoneColor(preferred = ''){
    const used = new Set((appState.layout?.zones || []).map(z => String(z?.color || '').toLowerCase()).filter(Boolean));
    const pref = String(preferred || '').toLowerCase();
    if(pref && !used.has(pref)) return preferred;
    const pick = ZONE_COLOR_PALETTE.find(c => !used.has(String(c).toLowerCase()));
    if(pick) return pick;
    const idx = (appState.layout?.zones || []).length % ZONE_COLOR_PALETTE.length;
    return ZONE_COLOR_PALETTE[idx] || DEFAULT_ZONE_COLOR;
  }
  function makeRectZone(id,name,color,x,y,w,h){
    const safeName = name || (String(id).toUpperCase() === 'ALM' ? 'Almacén' : `Zona ${id}`);
    return { id, name:safeName, color: color || DEFAULT_ZONE_COLOR, wallThickness:14, pts:[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}], sectionCuts:{ x:{pos:.5,dir:1,depth:100}, y:{pos:.5,dir:1,depth:100} } };
  }
  function buildDefaultLayoutForBranch(branchIndex){
    const branch = (appState.admin?.branches||[])[branchIndex] || {};
    const zoneId = 'Z1';
    const zoneName = branch.name ? `Zona ${zoneId}` : `Zona ${zoneId}`;
    const zx = 90, zy = 80, zw = DEFAULT_ZONE_SIZE.w, zh = DEFAULT_ZONE_SIZE.h;
    const zone = makeRectZone(zoneId, zoneName, getBranchColor(branchIndex), zx, zy, zw, zh);
    const gap = 0, rackW = 84, rackH = 46;
    const startX = zx + 40;
    const y = zy + 26;
    const racks = Array.from({length:4}, (_,i)=>({
      id:`${zoneId}-E${i+1}`,
      zoneId,
      x:startX + i*(rackW+gap),
      y,
      w:rackW,
      h:rackH,
      rot:0,
      modelId:i===2?'wide_5':'std_4',
      front:'auto',
      baseHeight:0,
      rackHeight:rackModel(i===2?'wide_5':'std_4').height || 238
    }));
    racks.forEach(r=>syncRackFootprint(r,false));
    return { zones:[zone], racks, meta:{ createdAt: Date.now(), scaleCmPerUnit: 1 } };
  }
  function ensureBranchLayouts(){
    const branches = appState.admin?.branches || [];
    if(!appState.branchLayouts || typeof appState.branchLayouts !== 'object') appState.branchLayouts = {};
    branches.forEach((_,i)=>{
      if(!appState.branchLayouts[i] || !Array.isArray(appState.branchLayouts[i].zones) || !Array.isArray(appState.branchLayouts[i].racks)){
        appState.branchLayouts[i] = buildDefaultLayoutForBranch(i);
      }
    });
    Object.keys(appState.branchLayouts).forEach(k=>{ if(Number(k) >= branches.length) delete appState.branchLayouts[k]; });
    normalizeLayoutSectionState();
    saveBranchLayouts();
  }
  function getActiveLayoutBranchIndex(){
    return Number.isFinite(appState.activeLayoutBranchIndex) ? appState.activeLayoutBranchIndex : (Number.isFinite(appState.activeBranchIndex) ? appState.activeBranchIndex : 0);
  }
  function ensureZoneSectionCuts(zone){
    if(!zone) return { x:{pos:.5,dir:1,range:1}, y:{pos:.5,dir:1,range:1} };
    if(!zone.sectionCuts || typeof zone.sectionCuts !== 'object') zone.sectionCuts = {};
    if(!zone.sectionCuts.x) zone.sectionCuts.x = { pos:.5, dir:1, depth:100 };
    if(!zone.sectionCuts.y) zone.sectionCuts.y = { pos:.5, dir:1, depth:100 };
    zone.sectionCuts.x.pos = Math.max(.06, Math.min(.94, Number(zone.sectionCuts.x.pos) || .5));
    zone.sectionCuts.y.pos = Math.max(.06, Math.min(.94, Number(zone.sectionCuts.y.pos) || .5));
    zone.sectionCuts.x.dir = zone.sectionCuts.x.dir === -1 ? -1 : 1;
    zone.sectionCuts.y.dir = zone.sectionCuts.y.dir === -1 ? -1 : 1;
    const bounds = zoneBounds(zone);
    const maxDepthX = Math.max(1, bounds.maxX - bounds.minX);
    const maxDepthY = Math.max(1, bounds.maxY - bounds.minY);
    const oldRangeX = Number(zone.sectionCuts.x.range);
    const oldRangeY = Number(zone.sectionCuts.y.range);
    const baseDepthX = Number(zone.sectionCuts.x.depth);
    const baseDepthY = Number(zone.sectionCuts.y.depth);
    zone.sectionCuts.x.depth = Math.max(Math.min(100, maxDepthX), Math.min(maxDepthX, Number.isFinite(baseDepthX) ? (baseDepthX <= 10 ? 100 : baseDepthX) : (Number.isFinite(oldRangeX) ? maxDepthX * oldRangeX : 100)));
    zone.sectionCuts.y.depth = Math.max(Math.min(100, maxDepthY), Math.min(maxDepthY, Number.isFinite(baseDepthY) ? (baseDepthY <= 10 ? 100 : baseDepthY) : (Number.isFinite(oldRangeY) ? maxDepthY * oldRangeY : 100)));
    delete zone.sectionCuts.x.range;
    delete zone.sectionCuts.y.range;
    return zone.sectionCuts;
  }
  function normalizeLayoutSectionState(){
    (appState.layout?.zones || []).forEach(zone => ensureZoneSectionCuts(zone));
  }
  function persistActiveLayout(){
    if(!(appState.history?.layout?.isApplying)) recordHistorySnapshot('layout');
    const idx = getActiveLayoutBranchIndex();
    if(!appState.branchLayouts) appState.branchLayouts = {};
    normalizeLayoutSectionState();
    ensureLayoutMeta();
    appState.branchLayouts[idx] = clone(appState.layout);
    saveBranchLayouts();
  }
  function loadLayoutForBranch(branchIndex){
    ensureBranchLayouts();
    const source = appState.branchLayouts[branchIndex] || buildDefaultLayoutForBranch(branchIndex);
    appState.layout = clone(source);
    ensureLayoutMeta();
    appState.activeLayoutBranchIndex = branchIndex;
    appState.selectedZoneId = appState.layout.zones[0]?.id || '';
    appState.selectedRackLayoutId = appState.layout.racks[0]?.id || '';
    appState.selectedVertex = { zoneId:'', idx:-1 };
    appState.selectedEdge = { zoneId:'', a:-1, b:-1 };
    appState.editor.dragging = null;
    appState.editor.mode = 'select';
    ensureRackProps();
  }
  function setLayoutBranch(branchIndex){
    persistActiveLayout();
    loadLayoutForBranch(branchIndex);
  }
  function zoneBounds(zone){
    const xs = zone.pts.map(p=>p.x), ys = zone.pts.map(p=>p.y);
    return { minX:Math.min(...xs), maxX:Math.max(...xs), minY:Math.min(...ys), maxY:Math.max(...ys) };
  }
  function nearestZoneForPoint(point){
    const zones = appState.layout.zones || [];
    let best = null, bestDist = Infinity;
    zones.forEach(z=>{
      const c = centroid(z.pts); const d = dist2(point,c); if(d<bestDist){ best=z; bestDist=d; }
    });
    return best;
  }
  function keepRackInsideZone(rack, zone){
    const fp = getRackFootprint(rack.modelId, rack.rot || 0);
    const b = zoneBounds(zone);
    const margin = 0;
    const effW = Math.max(0, Number(rack.w || fp.w || fp.baseW || 0));
    const effH = Math.max(0, Number(rack.h || fp.h || fp.baseH || 0));
    const minX = b.minX + margin, maxX = b.maxX - effW - margin;
    const minY = b.minY + margin, maxY = b.maxY - effH - margin;
    rack.x = Math.max(minX, Math.min(maxX, rack.x));
    rack.y = Math.max(minY, Math.min(maxY, rack.y));
    if(rackFullyInsideZone(rack, zone)) return;
    const original = { x:rack.x, y:rack.y };
    for(let step=0; step<=48; step+=4){
      const candidates = [
        { x:original.x-step, y:original.y }, { x:original.x+step, y:original.y },
        { x:original.x, y:original.y-step }, { x:original.x, y:original.y+step },
        { x:original.x-step, y:original.y-step }, { x:original.x+step, y:original.y+step }
      ];
      const found = candidates.find(pos => { rack.x = pos.x; rack.y = pos.y; return rackFullyInsideZone(rack, zone); });
      if(found) return;
    }
    rack.x = original.x; rack.y = original.y;
  }
  function snapRackToZoneEdges(rack, zone, threshold = 28){
    if(!rack || !zone) return;
    const bounds = zoneBounds(zone);
    const edges = [];
    for(let i=0;i<zone.pts.length;i++){
      const a = zone.pts[i], b = zone.pts[(i+1)%zone.pts.length];
      if(Math.abs(a.x - b.x) <= 0.001) edges.push({type:'v', value:a.x, min:Math.min(a.y,b.y), max:Math.max(a.y,b.y)});
      else if(Math.abs(a.y - b.y) <= 0.001) edges.push({type:'h', value:a.y, min:Math.min(a.x,b.x), max:Math.max(a.x,b.x)});
    }
    let bestX = null, bestDX = Infinity;
    let bestY = null, bestDY = Infinity;
    const rackMidY = rack.y + rack.h/2;
    const rackMidX = rack.x + rack.w/2;
    edges.forEach(edge => {
      if(edge.type === 'v' && rackMidY >= edge.min-8 && rackMidY <= edge.max+8){
        const leftTarget = edge.value;
        const rightTarget = edge.value - rack.w;
        const dLeft = Math.abs(rack.x - leftTarget);
        const dRight = Math.abs(rack.x - rightTarget);
        if(dLeft < bestDX && dLeft <= threshold){ bestDX = dLeft; bestX = leftTarget; }
        if(dRight < bestDX && dRight <= threshold){ bestDX = dRight; bestX = rightTarget; }
      }
      if(edge.type === 'h' && rackMidX >= edge.min-8 && rackMidX <= edge.max+8){
        const topTarget = edge.value;
        const bottomTarget = edge.value - rack.h;
        const dTop = Math.abs(rack.y - topTarget);
        const dBottom = Math.abs(rack.y - bottomTarget);
        if(dTop < bestDY && dTop <= threshold){ bestDY = dTop; bestY = topTarget; }
        if(dBottom < bestDY && dBottom <= threshold){ bestDY = dBottom; bestY = bottomTarget; }
      }
    });
    if(bestX === null){
      const boundLeft = Math.abs(rack.x - bounds.minX);
      const boundRight = Math.abs(rack.x - (bounds.maxX - rack.w));
      if(boundLeft <= threshold || boundRight <= threshold) bestX = boundLeft <= boundRight ? bounds.minX : (bounds.maxX - rack.w);
    }
    if(bestY === null){
      const boundTop = Math.abs(rack.y - bounds.minY);
      const boundBottom = Math.abs(rack.y - (bounds.maxY - rack.h));
      if(boundTop <= threshold || boundBottom <= threshold) bestY = boundTop <= boundBottom ? bounds.minY : (bounds.maxY - rack.h);
    }
    if(bestX !== null) rack.x = bestX;
    if(bestY !== null) rack.y = bestY;
    rack.x = Math.max(bounds.minX, Math.min(bounds.maxX - rack.w, rack.x));
    rack.y = Math.max(bounds.minY, Math.min(bounds.maxY - rack.h, rack.y));
  }
  function rangesOverlap(a1, a2, b1, b2, tolerance = 4){
    return Math.min(a2, b2) >= Math.max(a1, b1) - tolerance;
  }
  function rackBox(rack){
    return { left:rack.x, right:rack.x + rack.w, top:rack.y, bottom:rack.y + rack.h, width:rack.w, height:rack.h };
  }
  function rackAxisData(rack){
    if(!rack) return null;
    const fp = getRackFootprint(rack.modelId, rack.rot || 0);
    const baseW = Math.max(8, fp.baseW || rack.w || 0);
    const baseH = Math.max(8, fp.baseH || rack.h || 0);
    const angle = normalizeAngle(rack.rot || 0) * Math.PI / 180;
    const ux = Math.cos(angle), uy = Math.sin(angle);
    const vx = -uy, vy = ux;
    return {
      cx: rack.x + (rack.w || fp.w || baseW) / 2,
      cy: rack.y + (rack.h || fp.h || baseH) / 2,
      baseW, baseH, angle, ux, uy, vx, vy
    };
  }
  function shortestAngleDelta(a, b){
    const da = normalizeAngle(a) - normalizeAngle(b);
    return ((da + 540) % 360) - 180;
  }
  function clearRackSnapPreview(){
    if(appState?.editor) appState.editor.snapPreview = null;
  }
  function setRackSnapPreview(preview){
    if(appState?.editor) appState.editor.snapPreview = preview || null;
  }
  function clampAlongForNeighbor(targetAlong, rackAxis, otherAxis){
    const halfRange = Math.max(0, (otherAxis.baseW - rackAxis.baseW) / 2);
    return Math.max(-halfRange, Math.min(halfRange, targetAlong));
  }
  function moveRackCenterTo(rack, cx, cy){
    if(!rack) return;
    rack.x = snapGrid(cx - (rack.w || 0) / 2);
    rack.y = snapGrid(cy - (rack.h || 0) / 2);
  }
  function rectsOverlap(a, b, tolerance = 0.001){
    return a.left < b.right - tolerance && a.right > b.left + tolerance && a.top < b.bottom - tolerance && a.bottom > b.top + tolerance;
  }
  function resolveRackOverlap(rack, zone){
    if(!rack || !zone) return;
    const neighbors = (appState.layout.racks || []).filter(r => r !== rack && r.zoneId === zone.id && !racksCanOverlapByLevel(rack, r));
    let moved = false;
    neighbors.forEach(other => {
      const a = rackBox(rack), b = rackBox(other);
      if(!rectsOverlap(a, b)) return;
      const pushLeft = Math.abs(a.right - b.left);
      const pushRight = Math.abs(b.right - a.left);
      const pushUp = Math.abs(a.bottom - b.top);
      const pushDown = Math.abs(b.bottom - a.top);
      const candidates = [
        { axis:'x', value: other.x - rack.w, d: pushLeft },
        { axis:'x', value: other.x + other.w, d: pushRight },
        { axis:'y', value: other.y - rack.h, d: pushUp },
        { axis:'y', value: other.y + other.h, d: pushDown },
      ].sort((m,n)=>m.d-n.d);
      const pick = candidates[0];
      if(!pick) return;
      if(pick.axis === 'x') rack.x = pick.value;
      else rack.y = pick.value;
      moved = true;
    });
    return moved;
  }
  function snapRackToNeighbors(rack, zone, threshold = 18){
    if(!rack || !zone) return;
    clearRackSnapPreview();
    const neighbors = (appState.layout.racks || []).filter(r => r !== rack && r.zoneId === zone.id && !racksCanOverlapByLevel(rack, r));
    let bestX = null, bestDX = Infinity;
    let bestY = null, bestDY = Infinity;
    const a = rackBox(rack);
    neighbors.forEach(other => {
      const b = rackBox(other);
      const verticalGap = Math.min(Math.abs(a.bottom - b.top), Math.abs(b.bottom - a.top));
      const horizontalGap = Math.min(Math.abs(a.right - b.left), Math.abs(b.right - a.left));
      const verticallyAligned = rangesOverlap(a.top, a.bottom, b.top, b.bottom, 0.001) || verticalGap <= threshold;
      const horizontallyAligned = rangesOverlap(a.left, a.right, b.left, b.right, 0.001) || horizontalGap <= threshold;
      if(verticallyAligned){
        const targetRight = b.right;
        const targetLeft = b.left - a.width;
        const dAttachLeft = Math.abs(a.left - targetRight);
        const dAttachRight = Math.abs(a.left - targetLeft);
        if(dAttachLeft < bestDX && dAttachLeft <= threshold){ bestDX = dAttachLeft; bestX = targetRight; }
        if(dAttachRight < bestDX && dAttachRight <= threshold){ bestDX = dAttachRight; bestX = targetLeft; }
      }
      if(horizontallyAligned){
        const targetBottom = b.bottom;
        const targetTop = b.top - a.height;
        const dAttachTop = Math.abs(a.top - targetBottom);
        const dAttachBottom = Math.abs(a.top - targetTop);
        if(dAttachTop < bestDY && dAttachTop <= threshold){ bestDY = dAttachTop; bestY = targetBottom; }
        if(dAttachBottom < bestDY && dAttachBottom <= threshold){ bestDY = dAttachBottom; bestY = targetTop; }
      }
    });
    if(bestX !== null) rack.x = bestX;
    if(bestY !== null) rack.y = bestY;

    const rackAxis = rackAxisData(rack);
    if(!rackAxis) return;

    const SNAP_TOL = {
      angleSoft: 8,
      angleHard: 3,
      side: Math.max(20, threshold * 1.6),
      end: Math.max(18, threshold * 1.25),
      align: Math.max(22, threshold * 1.8),
      exact: Math.max(10, threshold * 0.9)
    };
    const MIN_SEPARATION = 0;
    let best = null;
    neighbors.forEach(other => {
      const deltaAngle = Math.abs(shortestAngleDelta(rack.rot || 0, other.rot || 0));
      if(deltaAngle > SNAP_TOL.angleSoft) return;
      const otherAxis = rackAxisData(other);
      if(!otherAxis) return;
      const dx = rackAxis.cx - otherAxis.cx;
      const dy = rackAxis.cy - otherAxis.cy;
      const along = dx * otherAxis.ux + dy * otherAxis.uy;
      const lateral = dx * otherAxis.vx + dy * otherAxis.vy;
      const sideTargetAbs = (rackAxis.baseH + otherAxis.baseH) / 2 + MIN_SEPARATION;
      const endTargetAbs = (rackAxis.baseW + otherAxis.baseW) / 2 + MIN_SEPARATION;
      const sideGap = Math.abs(Math.abs(lateral) - sideTargetAbs);
      const endGap = Math.abs(Math.abs(along) - endTargetAbs);
      const alignGap = Math.abs(along);
      const overlapAlong = otherAxis.baseW - Math.abs(along);
      const overlapEnough = overlapAlong >= Math.max(8, Math.min(rackAxis.baseW, otherAxis.baseW) * 0.25);
      const edgeNear = alignGap <= otherAxis.baseW / 2 + rackAxis.baseW / 2 + SNAP_TOL.align;
      const anglePenalty = deltaAngle <= SNAP_TOL.angleHard ? 0 : (deltaAngle - SNAP_TOL.angleHard) * 2.2;

      if(sideGap <= SNAP_TOL.side && (overlapEnough || edgeNear)){
        const signLat = lateral >= 0 ? 1 : -1;
        const targetLat = signLat * sideTargetAbs;
        const targetAlong = clampAlongForNeighbor(along, rackAxis, otherAxis);
        const targetCx = otherAxis.cx + otherAxis.vx * targetLat + otherAxis.ux * targetAlong;
        const targetCy = otherAxis.cy + otherAxis.vy * targetLat + otherAxis.uy * targetAlong;
        const lanePenalty = overlapEnough ? 0 : Math.max(0, Math.abs(along) - (otherAxis.baseW/2 + rackAxis.baseW/2)) * 0.6;
        const score = sideGap + anglePenalty + lanePenalty;
        if(!best || score < best.score){
          best = { type:'side', score, cx:targetCx, cy:targetCy, otherId:other.id, side:[{x:otherAxis.cx + otherAxis.vx * targetLat + otherAxis.ux * (-otherAxis.baseW/2), y:otherAxis.cy + otherAxis.vy * targetLat + otherAxis.uy * (-otherAxis.baseW/2)}, {x:otherAxis.cx + otherAxis.vx * targetLat + otherAxis.ux * (otherAxis.baseW/2), y:otherAxis.cy + otherAxis.vy * targetLat + otherAxis.uy * (otherAxis.baseW/2)}] };
        }
      }

      if(endGap <= SNAP_TOL.end && Math.abs(lateral) <= Math.max(rackAxis.baseH, otherAxis.baseH) * 0.7 + SNAP_TOL.exact){
        const signAlong = along >= 0 ? 1 : -1;
        const targetAlong = signAlong * endTargetAbs;
        const targetLat = Math.abs(lateral) <= SNAP_TOL.exact ? 0 : lateral;
        const targetCx = otherAxis.cx + otherAxis.ux * targetAlong + otherAxis.vx * targetLat;
        const targetCy = otherAxis.cy + otherAxis.uy * targetAlong + otherAxis.vy * targetLat;
        const score = endGap + anglePenalty + Math.abs(targetLat) * 0.2;
        if(!best || score < best.score){
          best = { type:'end', score, cx:targetCx, cy:targetCy, otherId:other.id, side:[{x:otherAxis.cx + otherAxis.ux * targetAlong + otherAxis.vx * (-otherAxis.baseH/2), y:otherAxis.cy + otherAxis.uy * targetAlong + otherAxis.vy * (-otherAxis.baseH/2)}, {x:otherAxis.cx + otherAxis.ux * targetAlong + otherAxis.vx * (otherAxis.baseH/2), y:otherAxis.cy + otherAxis.uy * targetAlong + otherAxis.vy * (otherAxis.baseH/2)}] };
        }
      }
    });
    if(best){
      moveRackCenterTo(rack, best.cx, best.cy);
      setRackSnapPreview({ type:best.type, rackId:rack.id, otherId:best.otherId, line:best.side, strength: best.score <= threshold ? 'hard' : (best.score <= threshold * 1.45 ? 'medium' : 'soft') });
    }
  }
  function keepRackSnapped(rack, zone){
    if(!rack || !zone) return;
    if(!isSnapEnabled()){
      clearRackSnapPreview();
      resolveRackOverlap(rack, zone);
      keepRackInsideZone(rack, zone);
      recalcAllRackStackHeights();
      return;
    }
    snapRackToZoneEdges(rack, zone);
    snapRackToNeighbors(rack, zone);
    resolveRackOverlap(rack, zone);
    keepRackInsideZone(rack, zone);
    snapRackToZoneEdges(rack, zone, Math.max(3, getSnapSize() * 0.6));
    snapRackToNeighbors(rack, zone, Math.max(5, getSnapSize()));
    recalcAllRackStackHeights();
  }
  function renameRackByZone(rack, zoneId, seq){
    rack.zoneId = zoneId;
    rack.id = `${zoneId}-E${seq}`;
  }
  function assignRackToZone(rack, zoneId){
    if(!rack || !zoneId) return;
    if(rack.zoneId === zoneId && String(rack.id||'').startsWith(`${zoneId}-E`)) return;
    rack.zoneId = zoneId;
    rack.id = nextRackId(zoneId);
  }
  function normalizeZoneAndRackIds(){
    const zones = appState.layout.zones || [];
    const zoneRemap = new Map();
    zones.forEach((z, zi)=>{
      const previousId = String(z?.id || '').toUpperCase();
      let nextId = previousId;
      if(isStorageZoneLike(previousId, z?.name)) nextId = 'ALM';
      else if(!/^Z\d+$/i.test(previousId)) nextId = `Z${zi+1}`;
      if(previousId && nextId !== previousId) zoneRemap.set(previousId, nextId);
      z.id = nextId;
      if(z.id === 'ALM') z.name = z.name && norm(z.name) !== 'almacen' ? z.name : 'Almacén';
      else if(!z.name) z.name = `Zona ${z.id}`;
    });
    if(appState.selectedZoneId && zoneRemap.has(String(appState.selectedZoneId).toUpperCase())){
      appState.selectedZoneId = zoneRemap.get(String(appState.selectedZoneId).toUpperCase());
    }
    (appState.layout.racks||[]).forEach(r=>{
      if(!r) return;
      if(zoneRemap.has(String(r.zoneId || '').toUpperCase())) r.zoneId = zoneRemap.get(String(r.zoneId || '').toUpperCase());
      if(r.zoneId === 'ALM' && !String(r.id || '').toUpperCase().startsWith('ALM-E')){
        const est = parseInt((String(r.id || '').match(/-E(\d+)/i)||[])[1] || '1', 10) || 1;
        r.id = `ALM-E${est}`;
      }
      const fallbackW = Math.max(0, Number(r.w || 0));
      const fallbackH = Math.max(0, Number(r.h || 0));
      const anchorX = Number(r.x || 0);
      const anchorY = Number(r.y || 0);
      syncRackFootprint(r, false);
      if(!Number.isFinite(Number(r.x))) r.x = anchorX;
      if(!Number.isFinite(Number(r.y))) r.y = anchorY;
      const probe = { x: anchorX + Math.max(r.w || 0, fallbackW) / 2, y: anchorY + Math.max(r.h || 0, fallbackH) / 2 };
      const host = findZoneById(r.zoneId) || zones.find(z => pointInPoly(probe, z.pts));
      if(host){
        if(r.zoneId !== host.id) assignRackToZone(r, host.id);
        keepRackSnapped(r, host);
      }
    });
  }
  function renameZoneId(current, requested){
    const zone = findZoneById(current); if(!zone) return current;
    let raw = String(requested||'').trim();
    let target = raw.toUpperCase().replace(/\s+/g,'');
    if(!target) target = current;
    if(/^ALM(?:ACEN)?$/i.test(target)) target = 'ALM';
    else if(!/^Z\d+$/.test(target)){
      const num = parseInt((target.match(/(\d+)/)||[])[1] || '0',10);
      target = `Z${num || (appState.layout.zones.indexOf(zone)+1)}`;
    }
    if(target !== current && appState.layout.zones.some(z=>z.id===target)) return current;
    zone.id = target;
    if(target === 'ALM' && (!zone.name || norm(zone.name) === 'almacen')) zone.name = 'Almacén';
    else if(!zone.name) zone.name = `Zona ${target}`;
    normalizeZoneAndRackIds();
    persistActiveLayout();
    return zone.id;
  }

  function zoneRackSequence(zoneId){
    return (appState.layout.racks||[]).filter(r => r.zoneId === zoneId).sort((a,b)=> (a.x-b.x) || (a.y-b.y) || String(a.id).localeCompare(String(b.id)));
  }
  function duplicateSelectedRack(){
    const rack = findRackById(appState.selectedRackLayoutId); if(!rack) return;
    const zone = findZoneById(rack.zoneId); if(!zone) return;
    const copy = clone(rack);
    copy.id = nextRackId(zone.id);
    copy.x = snapGrid(rack.x + rack.w + 12);
    copy.y = snapGrid(rack.y);
    keepRackSnapped(copy, zone);
    appState.layout.racks.push(copy);
    appState.selectedRackLayoutId = copy.id;
    persistActiveLayout();
    renderLayoutEditor();
  }
  function duplicateSelectedZone(){
    const zone = findZoneById(appState.selectedZoneId); if(!zone) return;
    const sourceRacks = (appState.layout.racks||[]).filter(r => r.zoneId === zone.id).sort((a,b)=> (a.x-b.x) || (a.y-b.y));
    const cloneZone = clone(zone);
    const newId = nextZoneId();
    cloneZone.id = newId;
    cloneZone.name = `${zone.name || ('Zona '+zone.id)} copia`;
    cloneZone.color = getNextZoneColor(zone.color);
    cloneZone.pts = cloneZone.pts.map(pt => ({ x:snapGrid(pt.x + 60), y:snapGrid(pt.y + 40) }));
    ensureZoneSectionCuts(cloneZone);
    appState.layout.zones.push(cloneZone);
    sourceRacks.forEach((rack, idx) => {
      const copy = clone(rack);
      copy.zoneId = newId;
      copy.id = `${newId}-E${idx+1}`;
      copy.x = snapGrid(rack.x + 60);
      copy.y = snapGrid(rack.y + 40);
      keepRackSnapped(copy, cloneZone);
      appState.layout.racks.push(copy);
    });
    appState.selectedZoneId = newId;
    appState.selectedRackLayoutId = appState.layout.racks.find(r => r.zoneId === newId)?.id || '';
    persistActiveLayout();
    renderLayoutEditor();
  }
  function drawArrowHead(layer, x, y, angle, color){
    const size = 6;
    const a1 = angle + Math.PI * 0.8;
    const a2 = angle - Math.PI * 0.8;
    layer.appendChild(svgEl('line',{x1:x,y1:y,x2:x + Math.cos(a1)*size,y2:y + Math.sin(a1)*size,stroke:color,'stroke-width':'1.2'}));
    layer.appendChild(svgEl('line',{x1:x,y1:y,x2:x + Math.cos(a2)*size,y2:y + Math.sin(a2)*size,stroke:color,'stroke-width':'1.2'}));
  }
  function getZoneOutwardEdgeNormal(zone, a, b){
    const dx = b.x-a.x, dy = b.y-a.y;
    const len = Math.hypot(dx,dy) || 1;
    let nx = -dy/len, ny = dx/len;
    const ctr = polygonCentroid(zone.pts);
    const mid = { x:(a.x+b.x)/2, y:(a.y+b.y)/2 };
    const probeA = { x:mid.x + nx*12, y:mid.y + ny*12 };
    const probeB = { x:mid.x - nx*12, y:mid.y - ny*12 };
    const insideA = pointInPoly(probeA, zone.pts);
    const insideB = pointInPoly(probeB, zone.pts);
    const distA = Math.hypot(probeA.x - ctr.x, probeA.y - ctr.y);
    const distB = Math.hypot(probeB.x - ctr.x, probeB.y - ctr.y);
    if((insideA && !insideB) || (distA < distB)){ nx *= -1; ny *= -1; }
    const finalProbe = { x:mid.x + nx*18, y:mid.y + ny*18 };
    if(pointInPoly(finalProbe, zone.pts)){ nx *= -1; ny *= -1; }
    return { x:nx, y:ny };
  }

  function getZoneOutwardVertexNormal(zone, idx){
    const pts = zone?.pts || [];
    const count = pts.length || 0;
    if(count < 2) return { x:0, y:-1 };
    const p = pts[idx];
    const prev = pts[(idx - 1 + count) % count];
    const next = pts[(idx + 1) % count];
    const n1 = getZoneOutwardEdgeNormal(zone, prev, p);
    const n2 = getZoneOutwardEdgeNormal(zone, p, next);
    let nx = n1.x + n2.x, ny = n1.y + n2.y;
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    const probe = { x:p.x + nx*16, y:p.y + ny*16 };
    if(pointInPoly(probe, pts)){ nx *= -1; ny *= -1; }
    return { x:nx, y:ny };
  }

  function drawRackMeasureLine(layer, x1,y1,x2,y2,label,color='#8fb7df', offset=0, formatter=formatDistanceCm, opts={}){
    const dx = x2-x1, dy = y2-y1;
    const len = Math.hypot(dx,dy) || 1;
    const settings = Object.assign({ showTextBox:false, textGap:10, dashed:true, normalOverride:null }, opts || {});
    let nx = -dy/len, ny = dx/len;
    if(settings.normalOverride && Number.isFinite(settings.normalOverride.x) && Number.isFinite(settings.normalOverride.y)){
      const nLen = Math.hypot(settings.normalOverride.x, settings.normalOverride.y) || 1;
      nx = settings.normalOverride.x / nLen;
      ny = settings.normalOverride.y / nLen;
    }
    const ax1 = x1 + nx*offset, ay1 = y1 + ny*offset;
    const ax2 = x2 + nx*offset, ay2 = y2 + ny*offset;
    layer.appendChild(svgEl('line',{
      x1:ax1,y1:ay1,x2:ax2,y2:ay2,stroke:color,'stroke-width':'1.4',
      ...(settings.dashed ? {'stroke-dasharray':'5 4'} : {}),opacity:'.98'
    }));
    layer.appendChild(svgEl('line',{x1:x1,y1:y1,x2:ax1,y2:ay1,stroke:color,'stroke-width':'1.1',opacity:'.78'}));
    layer.appendChild(svgEl('line',{x1:x2,y1:y2,x2:ax2,y2:ay2,stroke:color,'stroke-width':'1.1',opacity:'.78'}));
    const ang = Math.atan2(ay2-ay1, ax2-ax1);
    drawArrowHead(layer, ax1, ay1, ang, color);
    drawArrowHead(layer, ax2, ay2, ang + Math.PI, color);
    const tx = (ax1+ax2)/2 + nx*settings.textGap;
    const ty = (ay1+ay2)/2 + ny*settings.textGap;
    const textValue = typeof formatter === 'function' ? formatter(label) : String(Math.round(label));
    const text = svgEl('text',{x:tx,y:ty+1,class:'ortho-dim-text','text-anchor':'middle',style:`font-size:${getDimFontSize()}px`});
    text.textContent = textValue;
    const angDeg = ang*180/Math.PI + (Math.abs(ang) > Math.PI/2 ? 180 : 0);
    text.setAttribute('transform',`rotate(${angDeg} ${tx} ${ty+1})`);
    if(settings.showTextBox){
      const fontSize = getDimFontSize();
      const bgW = Math.max(72, Math.min(220, textValue.length * fontSize * .68 + 26));
      const bgH = Math.max(26, fontSize + 12);
      const bg = svgEl('rect',{x:tx-bgW/2,y:ty-bgH/2,width:bgW,height:bgH,rx:'8',fill:'rgba(8,18,30,.92)',stroke:color,'stroke-width':'1'});
      bg.setAttribute('transform',`rotate(${angDeg} ${tx} ${ty+1})`);
      layer.appendChild(bg);
    }
    layer.appendChild(text);
  }
  function drawZoneEdgeDimensions(layer, zone){
    if(!layer || !zone || !appState.editor.showDims) return;
    const cmPerUnit = Math.max(.01, getScaleCmPerUnit());
    const edgeOffsetUnits = 30 / cmPerUnit;
    zone.pts.forEach((a, i) => {
      const b = zone.pts[(i+1)%zone.pts.length];
      const len = Math.hypot(b.x-a.x,b.y-a.y) || 1;
      const n = getZoneOutwardEdgeNormal(zone, a, b);
      drawRackMeasureLine(layer, a.x, a.y, b.x, b.y, len, '#ff9f2f', edgeOffsetUnits, formatDistanceCm, {
        showTextBox:false,
        textGap:12,
        dashed:true,
        normalOverride:n
      });
    });
  }
  function drawSelectedRackMeasurements(layer, rack, zone){
    if(!layer || !rack || !zone || !appState.editor.showDims) return;
    const fp = getRackFootprint(rack.modelId, rack.rot || 0);
    const geomW = Math.max(8, fp.baseW || rack.w || 0);
    const geomH = Math.max(8, fp.baseH || rack.h || 0);
    const cx = rack.x + Math.max(8, rack.w || fp.w || geomW)/2;
    const cy = rack.y + Math.max(8, rack.h || fp.h || geomH)/2;
    const angle = normalizeAngle(rack.rot || 0) * Math.PI / 180;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const ux = { x: cos, y: sin };
    const uy = { x: -sin, y: cos };
    const p1 = { x: cx - ux.x * geomW/2 - uy.x * geomH/2, y: cy - ux.y * geomW/2 - uy.y * geomH/2 };
    const p2 = { x: cx + ux.x * geomW/2 - uy.x * geomH/2, y: cy + ux.y * geomW/2 - uy.y * geomH/2 };
    const p3 = { x: cx + ux.x * geomW/2 + uy.x * geomH/2, y: cy + ux.y * geomW/2 + uy.y * geomH/2 };
    drawRackMeasureLine(layer, p1.x, p1.y, p2.x, p2.y, geomW, '#ff9f2f', 14, formatDistanceCm, {
      showTextBox:false,
      textGap:10,
      dashed:true,
      normalOverride:{ x:-uy.x, y:-uy.y }
    });
    drawRackMeasureLine(layer, p2.x, p2.y, p3.x, p3.y, geomH, '#ff9f2f', 14, formatDistanceCm, {
      showTextBox:false,
      textGap:10,
      dashed:true,
      normalOverride:{ x:ux.x, y:ux.y }
    });
  }
  function drawSelectedZoneMeasurements(layer, zone){
    if(!layer || !zone) return;
    drawZoneEdgeDimensions(layer, zone);
  }

  function loadAdminState(){
    try{ const raw = localStorage.getItem('wms_admin_cfg_v2'); if(raw) return JSON.parse(raw); }catch{}
    const fallbackColor = '#ffd84d';
    return { company:'WMS Industrial', logo:'', branding:{ colors:['#6ff0a8','#1f8d68','#324d57','#d9b45e','#20323b'], activeColor:0 }, branches:[{name:'Sucursal principal', type:'tienda', color:fallbackColor, warehouses:['Almacén principal'], sheetUrl:'', sheetName:'Productos', sheetConnected:false, lastSheetCount:0, expanded:true}], activeBranch:0 };
  }
  function sanitizedAdminState(){
    const admin = clone(appState.admin || {});
    admin.branches = (admin.branches || []).map(b => ({
      ...b,
      sheetPreviewProducts: [],
      sheetHeaders: Array.isArray(b.sheetHeaders) ? b.sheetHeaders : [],
      sheetMapRows: Array.isArray(b.sheetMapRows) ? b.sheetMapRows : [],
      sheetMeta: {
        status: b?.sheetMeta?.status || '',
        lastHeadersReadAt: Number(b?.sheetMeta?.lastHeadersReadAt || 0),
        lastImportedAt: Number(b?.sheetMeta?.lastImportedAt || 0),
        productCount: Number(b?.sheetMeta?.productCount || 0),
        headerCount: Number(b?.sheetMeta?.headerCount || 0),
        error: b?.sheetMeta?.error || '',
        loadingMessage: b?.sheetMeta?.loadingMessage || ''
      }
    }));
    return admin;
  }
  function saveAdminState(){
    try{ localStorage.setItem('wms_admin_cfg_v2', JSON.stringify(sanitizedAdminState())); }catch(err){ console.warn('No se pudo guardar admin local:', err); }
    ensureBranchLayouts(); saveBranchLayouts(); applyBrand();
  }
  function getActiveBrandColor(){
    const colors = Array.isArray(appState.admin?.branding?.colors) ? appState.admin.branding.colors : [];
    const idx = Math.max(0, Math.min(Number(appState.admin?.branding?.activeColor || 0), Math.max(0, colors.length - 1)));
    return colors[idx] || '#6ff0a8';
  }
  function hexToRgbTriplet(hex){
    let value = String(hex || '').trim().replace('#','');
    if(value.length === 3) value = value.split('').map(ch => ch + ch).join('');
    const num = /^[0-9a-f]{6}$/i.test(value) ? parseInt(value, 16) : 0x6ff0a8;
    return `${(num>>16)&255}, ${(num>>8)&255}, ${num&255}`;
  }
  function applyBrand(){
    const companyInfo = appState.admin?.company;
    const companyName = typeof companyInfo === 'string' ? companyInfo : (companyInfo?.name || companyInfo?.company || 'WMS Industrial');
    const brandTitle = document.querySelector('.brand-text b'); if(brandTitle) brandTitle.textContent = companyName || 'WMS Industrial';
    const brandSub = document.querySelector('.brand-text .muted'); if(brandSub) brandSub.textContent = 'Interfaz renovada • visual premium';
    const box = document.querySelector('.brand-box');
    if(box){ box.innerHTML = appState.admin.logo ? `<img src="${appState.admin.logo}" alt="Logo" style="width:100%;height:100%;object-fit:contain;display:block">` : 'W'; }
    const accent = getActiveBrandColor();
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-rgb', hexToRgbTriplet(accent));
    document.documentElement.style.setProperty('--brand-active', accent);
  }
  function getAdminCompanyName(){
    const company = appState.admin?.company;
    return typeof company === 'string' ? company : (company?.name || company?.company || 'WMS Industrial');
  }
  function ensureAdminVisualState(){
    if(!appState.admin || typeof appState.admin !== 'object') appState.admin = loadAdminState();
    if(typeof appState.admin.company !== 'string') appState.admin.company = getAdminCompanyName();
    if(!Array.isArray(appState.admin.branches) || !appState.admin.branches.length) appState.admin.branches = [{name:'Sucursal principal', type:'tienda', color:'#6ff0a8', warehouses:['Almacén principal'], sheetUrl:'', sheetName:'Productos', sheetConnected:false, lastSheetCount:0}];
    if(typeof appState.admin.activeBranch !== 'number') appState.admin.activeBranch = 0;
    if(!appState.admin.branding || typeof appState.admin.branding !== 'object') appState.admin.branding = {};
    if(!Array.isArray(appState.admin.branding.colors) || !appState.admin.branding.colors.length){
      appState.admin.branding.colors = ['#6ff0a8','#1f8d68','#324d57','#d9b45e','#20323b'];
    }
    if(typeof appState.admin.branding.activeColor !== 'number') appState.admin.branding.activeColor = 0;
    appState.admin.branches = appState.admin.branches.map((branch, idx) => ({
      sheetUrl:'', sheetName:'Productos', sheetConnected:false, lastSheetCount:0,
      color:'#6ff0a8',
      ...branch,
      name: String(branch?.name || `Sucursal ${idx+1}`),
      type: String(branch?.type || 'tienda'),
      warehouses: Array.isArray(branch?.warehouses) && branch.warehouses.length ? branch.warehouses.map(w => String(w || 'Almacén principal')) : ['Almacén principal'],
      mainWarehouse: String(branch?.mainWarehouse || (Array.isArray(branch?.warehouses) && branch.warehouses[0]) || 'Almacén principal'),
      color: String(branch?.color || '#6ff0a8'),
      expanded: branch?.expanded !== false
    }));
    if(appState.admin.activeBranch >= appState.admin.branches.length) appState.admin.activeBranch = 0;
  }
  function renderCompanySectionHeader(step, title, subtitle=''){
    return `<div class="company-config-section-header"><span class="company-config-step">${escapeHtml(String(step || '•'))}</span><div class="company-config-section-copy"><b>${escapeHtml(title || '')}</b>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ''}</div></div>`;
  }

  function renderAdminBranchCard(branch, index){
    const expanded = branch.expanded !== false;
    const statusLabel = index === 0 ? 'Principal' : 'Secundaria';
    const warehouses = Array.isArray(branch.warehouses) ? branch.warehouses : ['Almacén principal'];
    const warehouseOptions = warehouses.map(name => `<option value="${escapeHtml(name)}" ${norm(name) === norm(branch.mainWarehouse) ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('');
    const rows = warehouses.map((name, wi) => `
      <div class="company-warehouse-row${norm(name) === norm(branch.mainWarehouse) ? ' is-main' : ''}">
        <div class="company-warehouse-index">${wi+1}</div>
        <input data-field="warehouse-name" data-bindex="${index}" data-windex="${wi}" value="${escapeHtml(name)}">
        <div class="company-warehouse-tag">${norm(name) === norm(branch.mainWarehouse) ? 'Principal' : 'Adicional'}</div>
        <button class="company-icon-btn" type="button" data-action="set-main-warehouse" data-bindex="${index}" data-windex="${wi}" title="Definir principal">⌂</button>
        <button class="company-icon-btn danger" type="button" data-action="delete-warehouse" data-bindex="${index}" data-windex="${wi}" title="Eliminar almacén">🗑</button>
      </div>`).join('');
    return `
      <article class="company-branch-card${expanded ? ' expanded' : ' collapsed'}" data-branch-card="${index}">
        <div class="company-branch-head">
          <button class="company-branch-toggle" type="button" data-action="toggle-branch" data-index="${index}">${expanded ? '−' : '+'}</button>
          <div class="company-branch-name-wrap">
            <div class="company-branch-title-row">
              <span class="company-branch-dot" style="background:${escapeHtml(branch.color)}"></span>
              <input class="company-branch-name-input" data-field="branch-name" data-index="${index}" value="${escapeHtml(branch.name)}">
              <span class="company-status-badge${index===0 ? ' primary' : ''}">${statusLabel}</span>
              ${expanded ? `<span class="company-status-badge success">Activa</span>` : ''}
            </div>
          </div>
          <div class="company-branch-type-pill">${escapeHtml(branch.type === 'almacen' ? 'Almacén' : branch.type === 'showroom' ? 'Showroom' : 'Tienda')}</div>
          <div class="company-branch-actions">
            <button class="company-icon-btn" type="button" data-action="move-up" data-index="${index}" title="Subir">↑</button>
            <button class="company-icon-btn" type="button" data-action="move-down" data-index="${index}" title="Bajar">↓</button>
            <button class="company-icon-btn danger" type="button" data-action="delete-branch" data-index="${index}" title="Eliminar">🗑</button>
          </div>
        </div>
        <div class="company-branch-body">
          ${renderCompanySectionHeader('A', 'Configuración de sucursal', 'Datos principales y almacén principal.')}
          <div class="company-branch-fields two">
            <div class="grid"><label>Tipo</label><select data-field="branch-type" data-index="${index}"><option value="tienda" ${branch.type==='tienda'?'selected':''}>Tienda</option><option value="almacen" ${branch.type==='almacen'?'selected':''}>Almacén</option><option value="showroom" ${branch.type==='showroom'?'selected':''}>Showroom</option></select></div>
            <div class="grid"><label>Almacén principal</label><select data-field="branch-main-warehouse" data-index="${index}">${warehouseOptions}</select></div>
          </div>
          ${renderCompanySectionHeader('B', `Almacenes adicionales (${warehouses.length})`, 'Administra los almacenes vinculados a esta sucursal.')}
          <div class="company-warehouse-list">${rows}</div>
          <button class="company-add-inline" type="button" data-action="add-warehouse" data-index="${index}">＋ Agregar almacén adicional</button>
          ${renderCompanySectionHeader('C', 'Layout y operación', 'Cada sucursal mantiene su propio plano, racks, productos y diagnóstico.')}
          <div class="branch-layout-actions">
            <button class="company-mini-action" type="button" data-action="edit-branch-layout" data-index="${index}">Editar layout</button>
            <button class="company-mini-action" type="button" data-action="view-branch-products" data-index="${index}">Ver productos</button>
            <button class="company-mini-action" type="button" data-action="health-branch" data-index="${index}">Salud</button>
          </div>
        </div>
      </article>`;
  }
  function renderAdminScreen(){
    ensureAdminVisualState();
    renderViewerMenu();
    const cfg = appState.admin;
    const summaryBranches = cfg.branches.length;
    const summaryWarehouses = cfg.branches.reduce((a,b)=>a+(b.warehouses?.length||0),0);
    const companyName = getAdminCompanyName();
    const brandingColors = cfg.branding.colors || [];
    const activeColorIdx = Math.max(0, Math.min(Number(cfg.branding.activeColor || 0), brandingColors.length - 1));
    contentTitle.textContent = 'Configuración de Empresa';
    contentSubtitle.textContent = 'Administrador';
    setTags([]);
    detailTitle.textContent='Resumen';
    detailSubtitle.textContent='Información general de tu empresa.';
    detailStatus.textContent='Empresa';
    detailChip.textContent='config';
    detailWrap.innerHTML = `
      <div class="company-summary-v2">
        <div class="company-summary-head"><b>Resumen</b><span class="company-summary-star">★</span></div>
        <div class="company-summary-card"><div class="company-summary-icon">⌂</div><div><strong>${summaryBranches}</strong><span>Sucursales</span><small>Total configuradas</small></div></div>
        <div class="company-summary-card"><div class="company-summary-icon">▣</div><div><strong>${summaryWarehouses}</strong><span>Almacenes</span><small>Total de almacenes</small></div></div>
        <div class="company-summary-card"><div class="company-summary-icon accent">◔</div><div><span>Última actualización</span><small>${new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric'})} • ${appState.auth?.user || 'admin'}</small></div></div>
        <div class="company-warehouse-illu"><div class="warehouse-floor"></div><div class="warehouse-box warehouse-a"></div><div class="warehouse-box warehouse-b"></div><div class="warehouse-box warehouse-c"></div><div class="warehouse-building"></div><div class="warehouse-door"></div><div class="warehouse-truck"></div><div class="warehouse-pin"></div></div>
      </div>`;
    contentWrap.innerHTML = `
      <div class="company-config-v2">
        <div class="company-topbar-v2"><div class="company-title-stack"><h3>Configuración de Empresa</h3><div class="muted">Administrador</div></div><button class="btn secondary company-preview-btn" id="companyPreviewBtn" type="button">Vista previa pública ↗</button></div>
        <section class="company-top-grid">
          <article class="company-card company-info-card">
            ${renderCompanySectionHeader(1, 'Información general', 'Datos principales de la empresa y logo.')}
            <div class="grid"><label>Nombre de la Empresa</label><input id="companyNameInput" value="${escapeHtml(companyName)}"></div>
            <div class="company-logo-grid">
              <div class="grid"><label>Logo</label><div class="company-logo-drop"><div class="company-logo-drop-inner">${cfg.logo ? `<img src="${cfg.logo}" alt="Logo actual">` : '<span class="company-logo-mark">⌂</span><span>Logo actual</span>'}</div></div></div>
              <div class="company-upload-card"><input type="file" id="companyLogoInput" accept="image/*" style="display:none"><button class="company-logo-btn" id="companyLogoBtn">☁ Subir logo</button><small>PNG, JPG o SVG.<br>Máx. 2MB</small></div>
            </div>
            <div class="company-inline-note">ⓘ Los cambios se guardarán de forma inmediata.</div>
          </article>
          <article class="company-card company-brand-card">
            ${renderCompanySectionHeader(2, 'Branding', 'Colores, acentos y vista previa visual.')}
            <div class="grid"><label>Colores principales</label><div class="company-swatch-row">${brandingColors.map((color, idx)=>`<button class="company-swatch${idx===activeColorIdx?' active':''}" type="button" data-action="branding-color" data-index="${idx}" title="Aplicar color ${escapeHtml(color)}" style="--sw:${escapeHtml(color)}"></button>`).join('')}<button class="company-swatch add" type="button" data-action="branding-add">＋</button></div><div class="company-brand-actions"><input type="color" id="brandingColorPicker" value="${escapeHtml(brandingColors[activeColorIdx] || '#6ff0a8')}"><button class="btn secondary compact" id="brandingApplyBtn" type="button">Aplicar color</button></div></div>
            <div class="grid"><label>Vista previa</label><div class="company-brand-preview"><span class="company-brand-cube">◫</span><b>${escapeHtml(companyName)}</b></div></div>
          </article>
        </section>
        <section class="company-card company-branches-panel">
          <div class="company-panel-head sectionized"><div>${renderCompanySectionHeader(3, 'Sucursales y almacenes', 'Organiza sucursales, almacenes y ubicaciones principales.')}</div><button class="btn" id="addBranchBtn">＋ Nueva sucursal</button></div>
          <div class="company-branch-list">${cfg.branches.map((branch, idx)=>renderAdminBranchCard(branch, idx)).join('')}</div>
          <div class="company-drag-note">ⓘ Arrastra las sucursales para reordenarlas. La primera sucursal será la principal.</div>
        </section>
        <div class="company-save-row"><button class="btn company-save-btn" id="saveCompanyBtn">💾 Guardar configuración</button><div class="muted">Entorno: ${document.body.classList.contains('theme-light') ? 'Modo día' : 'Producción'}</div></div>
      </div>`;
    bindAdminScreenEvents();
  }
  function bindAdminScreenEvents(){
    ensureAdminVisualState();
    const companyInput = $('#companyNameInput');
    if(companyInput) companyInput.addEventListener('input', e=>{ appState.admin.company = e.target.value; applyBrand(); });
    const logoBtn = $('#companyLogoBtn');
    const logoInput = $('#companyLogoInput');
    if(logoBtn && logoInput) logoBtn.onclick = ()=> logoInput.click();
    if(logoInput) logoInput.addEventListener('change', e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ appState.admin.logo=r.result; saveAdminState(); renderAdminScreen(); }; r.readAsDataURL(f); });
    const addBranchBtn = $('#addBranchBtn');
    if(addBranchBtn) addBranchBtn.onclick = ()=>{ const n='Sucursal '+(appState.admin.branches.length+1); appState.admin.branches.push({name:n,type:'tienda',color:(ZONE_COLOR_PALETTE[(appState.admin?.branches?.length||0)%ZONE_COLOR_PALETTE.length] || '#6ff0a8'),warehouses:['Almacén principal'],mainWarehouse:'Almacén principal',sheetUrl:'', sheetName:'Productos', sheetConnected:false, lastSheetCount:0}); appState.admin.activeBranch=appState.admin.branches.length-1; renderAdminScreen(); };
    const saveCompanyBtn = $('#saveCompanyBtn');
    if(saveCompanyBtn) saveCompanyBtn.onclick = async ()=>{ const names=appState.admin.branches.map(b=>norm(b.name)); if(new Set(names).size!==names.length) return alert('Hay sucursales con nombres repetidos.'); for(const b of appState.admin.branches){ const ws=(b.warehouses||[]).map(x=>norm(x)); if(new Set(ws).size!==ws.length) return alert(`Hay almacenes repetidos en ${b.name}.`); } saveAdminState(); await saveRemoteAppState('empresa'); showToast('Configuración guardada.', 'success'); renderAdminScreen(); };
    const previewBtn = $('#companyPreviewBtn');
    if(previewBtn) previewBtn.onclick = () => {
      saveAdminState();
      showToast('Vista previa pública abierta en modo viewer.', 'success');
      setScreen('viewer');
    };
    const picker = $('#brandingColorPicker');
    const applyColorBtn = $('#brandingApplyBtn');
    const applyPickerColor = () => {
      const value = (picker?.value || '').trim();
      if(!value) return;
      const idx = Math.max(0, Math.min(Number(appState.admin.branding.activeColor || 0), appState.admin.branding.colors.length - 1));
      appState.admin.branding.colors[idx] = value;
      saveAdminState();
      renderAdminScreen();
    };
    if(applyColorBtn) applyColorBtn.onclick = applyPickerColor;
    if(picker) picker.oninput = e => {
      const idx = Math.max(0, Math.min(Number(appState.admin.branding.activeColor || 0), appState.admin.branding.colors.length - 1));
      appState.admin.branding.colors[idx] = e.target.value;
      applyBrand();
    };
    contentWrap.querySelectorAll('[data-field="branch-name"]').forEach(el=>{ el.oninput=e=>appState.admin.branches[+e.target.dataset.index].name=e.target.value; el.onchange=()=>saveAdminState(); });
    contentWrap.querySelectorAll('[data-field="branch-type"]').forEach(el=>el.onchange=e=>{ appState.admin.branches[+e.target.dataset.index].type=e.target.value; saveAdminState(); renderAdminScreen(); });
    contentWrap.querySelectorAll('[data-field="branch-main-warehouse"]').forEach(el=>el.onchange=e=>{ appState.admin.branches[+e.target.dataset.index].mainWarehouse=e.target.value; saveAdminState(); renderAdminScreen(); });
    contentWrap.querySelectorAll('[data-field="warehouse-name"]').forEach(el=>{ el.oninput=e=>{ const bi=+e.target.dataset.bindex, wi=+e.target.dataset.windex; const branch = appState.admin.branches[bi]; const oldName = branch.warehouses[wi]; branch.warehouses[wi]=e.target.value; if(norm(branch.mainWarehouse)===norm(oldName)) branch.mainWarehouse=e.target.value; }; el.onchange=()=>saveAdminState(); });
    contentWrap.querySelectorAll('[data-action="branding-color"]').forEach(el=>el.onclick=e=>{ appState.admin.branding.activeColor = +e.currentTarget.dataset.index; saveAdminState(); renderAdminScreen(); });
    contentWrap.querySelector('[data-action="branding-add"]')?.addEventListener('click', ()=>{ const next = prompt('Nuevo color HEX para branding:', '#c7d6d2') || '#c7d6d2'; appState.admin.branding.colors.push(/^#[0-9a-f]{6}$/i.test(next.trim()) ? next.trim() : '#c7d6d2'); appState.admin.branding.activeColor = appState.admin.branding.colors.length - 1; saveAdminState(); renderAdminScreen(); });
    contentWrap.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=e=>{
      const a=e.currentTarget.dataset.action, i=+e.currentTarget.dataset.index, bi=+e.currentTarget.dataset.bindex, wi=+e.currentTarget.dataset.windex;
      if(a==='toggle-branch'){
        const branch = appState.admin.branches[i];
        if(branch) branch.expanded = branch.expanded === false ? true : false;
        appState.admin.activeBranch = branch?.expanded ? i : -1;
        saveAdminState(); renderAdminScreen(); return;
      }
      if(a==='move-up'&&i>0){ const arr=appState.admin.branches; [arr[i-1],arr[i]]=[arr[i],arr[i-1]]; appState.admin.activeBranch=i-1; saveAdminState(); renderAdminScreen(); return; }
      if(a==='move-down'&&i<appState.admin.branches.length-1){ const arr=appState.admin.branches; [arr[i+1],arr[i]]=[arr[i],arr[i+1]]; appState.admin.activeBranch=i+1; saveAdminState(); renderAdminScreen(); return; }
      if(a==='delete-branch'){ if(!confirm('¿Eliminar sucursal?')) return; if(appState.admin.branches.length===1) return alert('Debe quedar al menos una sucursal.'); appState.admin.branches.splice(i,1); appState.admin.activeBranch=Math.max(0,Math.min(appState.admin.activeBranch, appState.admin.branches.length-1)); saveAdminState(); renderAdminScreen(); return; }
      if(a==='add-warehouse'){ const name = 'Nuevo almacén '+((appState.admin.branches[i].warehouses?.length||0)+1); appState.admin.branches[i].warehouses.push(name); if(!appState.admin.branches[i].mainWarehouse) appState.admin.branches[i].mainWarehouse=name; appState.admin.branches[i].expanded = true; saveAdminState(); renderAdminScreen(); return; }
      if(a==='delete-warehouse'){ if(!confirm('¿Eliminar almacén?')) return; const branch = appState.admin.branches[bi]; const removed = branch.warehouses.splice(wi,1)[0]; if(!branch.warehouses.length) branch.warehouses=['Almacén principal']; if(norm(branch.mainWarehouse)===norm(removed)) branch.mainWarehouse=branch.warehouses[0]; saveAdminState(); renderAdminScreen(); return; }
      if(a==='set-main-warehouse'){ const branch = appState.admin.branches[bi]; branch.mainWarehouse = branch.warehouses[wi] || branch.mainWarehouse; saveAdminState(); renderAdminScreen(); return; }
      if(a==='edit-branch-layout'){ setLayoutBranch(i); appState.admin.activeBranch=i; saveAdminState(); setScreen('layout'); return; }
      if(a==='view-branch-products'){ setGlobalBranch(i, { screen:'viewer' }); return; }
      if(a==='health-branch'){ setGlobalBranch(i).then(()=>openDataQualityModal()); return; }
    });
    applyBrand();
  }

  function dedupeSheetHeadersLocal(headers){
    const seen = new Map();
    return (headers || []).map((h, i) => {
      const base = String(h || `Columna ${i + 1}`).trim() || `Columna ${i + 1}`;
      const key = norm(base) || `columna_${i+1}`;
      const count = (seen.get(key) || 0) + 1;
      seen.set(key, count);
      return count > 1 ? `${base} ${count}` : base;
    });
  }

  function parseCsvRowsLocal(csvText){
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    const text = String(csvText || '').replace(/^\uFEFF/, '');
    for(let i = 0; i < text.length; i += 1){
      const ch = text[i];
      const next = text[i + 1];
      if(inQuotes){
        if(ch === '"' && next === '"') { cell += '"'; i += 1; }
        else if(ch === '"') inQuotes = false;
        else cell += ch;
      }else{
        if(ch === '"') inQuotes = true;
        else if(ch === ',') { row.push(String(cell || '').trim()); cell = ''; }
        else if(ch === '\n') { row.push(String(cell || '').trim()); rows.push(row); row = []; cell = ''; }
        else if(ch === '\r') { /* ignorar */ }
        else cell += ch;
      }
    }
    row.push(String(cell || '').trim());
    if(row.some(v => String(v || '').trim()) || rows.length) rows.push(row);
    return rows;
  }

  function normalizeSheetMatrixLocal(rawRows){
    const rowsIn = Array.isArray(rawRows) ? rawRows : [];
    const nonEmpty = rowsIn.filter(row => Array.isArray(row) && row.some(v => String(v || '').trim()));
    if(!nonEmpty.length) throw new Error('La hoja está vacía o no se pudo leer.');
    let headerIndex = 0;
    let headerRow = nonEmpty[0] || [];
    if(headerRow.filter(v => String(v || '').trim()).length <= 1 && nonEmpty[1] && nonEmpty[1].filter(v => String(v || '').trim()).length >= 2){
      headerIndex = 1;
      headerRow = nonEmpty[1] || [];
    }
    const dataRowsAllRaw = nonEmpty.slice(headerIndex + 1);
    const maxLen = Math.max(headerRow.length, ...dataRowsAllRaw.map(r => Array.isArray(r) ? r.length : 0), 0);
    let lastCol = 0;
    for(let i = 0; i < maxLen; i += 1){
      if(String(headerRow[i] || '').trim()) lastCol = i;
      else if(dataRowsAllRaw.slice(0,500).some(r => String((r || [])[i] || '').trim())) lastCol = i;
    }
    const headers = dedupeSheetHeadersLocal(headerRow.slice(0, lastCol + 1));
    const rows = dataRowsAllRaw.map(r => (r || []).slice(0, lastCol + 1));
    return { headers, rows, headerIndex, totalRows: rows.length };
  }

  async function fetchSheetRowsLocal(apiUrl){
    const params = new URLSearchParams(String(apiUrl).split('?')[1] || '');
    const id = parseSheetId(params.get('url') || params.get('id') || '');
    const sheet = String(params.get('sheet') || 'Productos').trim();
    const headerOnly = String(params.get('headerOnly') || '') === '1';
    const limit = Math.max(1, Math.min(50000, Number(params.get('limit') || (headerOnly ? 1 : 50000)) || (headerOnly ? 1 : 50000)));
    if(!id || !sheet) throw new Error('URL/ID y hoja son obligatorios.');

    // Live Server no tiene backend. Para evitar el corte típico de 500 filas del visor JSON,
    // primero se lee como CSV por Google GViz con rango amplio. Esto permite buscar sobre toda la hoja.
    const rangeRows = Math.max(limit + 5, 1000);
    const csvEndpoint = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(sheet)}&range=${encodeURIComponent('A1:AZ' + rangeRows)}`;
    try{
      const csvText = await fetch(csvEndpoint, { cache:'no-store' }).then(r => {
        if(!r.ok) throw new Error('No se pudo leer Google Sheet en modo CSV.');
        return r.text();
      });
      const parsed = normalizeSheetMatrixLocal(parseCsvRowsLocal(csvText));
      const rowsLimited = parsed.rows.slice(0, limit);
      if(headerOnly) return { ok:true, headers:parsed.headers, headerIndex:parsed.headerIndex, previewCount:parsed.totalRows, source:'local-gviz-csv-full' };
      return { ok:true, headers:parsed.headers, rows:rowsLimited, headerIndex:parsed.headerIndex, totalRows:parsed.totalRows, source:'local-gviz-csv-full' };
    }catch(csvErr){
      console.warn('Fallback CSV falló, intentando JSON GViz:', csvErr);
    }

    const endpoint = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=0&sheet=${encodeURIComponent(sheet)}&range=${encodeURIComponent('A1:AZ' + rangeRows)}`;
    const text = await fetch(endpoint, { cache:'no-store' }).then(r => {
      if(!r.ok) throw new Error('No se pudo leer Google Sheet. Revisa permisos o nombre de hoja.');
      return r.text();
    });
    const jsonText = text.replace(/^.*?setResponse\(/s, '').replace(/\);?\s*$/s, '');
    const json = JSON.parse(jsonText);
    const rawRows = (json.table?.rows || []).map(r => (r.c || []).map(c => String(c?.v ?? c?.f ?? '').trim()));
    const parsed = normalizeSheetMatrixLocal(rawRows);
    const rowsLimited = parsed.rows.slice(0, limit);
    if(headerOnly) return { ok:true, headers:parsed.headers, headerIndex:parsed.headerIndex, previewCount:parsed.totalRows, source:'local-gviz-json-range' };
    return { ok:true, headers:parsed.headers, rows:rowsLimited, headerIndex:parsed.headerIndex, totalRows:parsed.totalRows, source:'local-gviz-json-range' };
  }

  async function httpJson(url, opts={}){
    if(typeof isLocalRuntimeForAuth === 'function' && isLocalRuntimeForAuth() && typeof url === 'string' && url.startsWith('/api/sheets/rows')){
      return fetchSheetRowsLocal(url);
    }
    const finalOpts = { credentials:'include', ...opts };
    if(opts.headers) finalOpts.headers = opts.headers;
    const res=await fetch(url, finalOpts);
    const txt=await res.text();
    let data={};
    try{data=txt?JSON.parse(txt):{}}catch{data={raw:txt}}
    if(!res.ok) throw new Error(data.error||txt||'Error');
    return data;
  }

  function coerceRemoteModels(models){
    if(!Array.isArray(models) || !models.length) return null;
    return models.map(m => ({ ...m, leftHeight: Number(m.leftHeight || m.height || 240), rightHeight: Number(m.rightHeight || Math.max(40, (m.height || 240) * 0.35)), mirrored: isUnderStairsStyle(m?.style) ? (normalizeRackStyle(m?.style) === 'under_stairs_reflected' ? true : false) : !!m.mirrored }));
  }
  function normalizeRemoteBranchLayouts(layouts){
    if(!layouts || typeof layouts !== 'object') return null;
    const out = {};
    Object.keys(layouts).forEach(key => {
      const layout = layouts[key];
      if(layout && Array.isArray(layout.zones) && Array.isArray(layout.racks)) out[key] = layout;
    });
    return out;
  }
  function getPersistedPreferredBranchIndex(){
    const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
    if(!branches.length) return 0;
    const preferred = Number.isFinite(Number(appState.admin?.activeBranch)) ? Number(appState.admin.activeBranch) : (Number.isFinite(Number(appState.activeBranchIndex)) ? Number(appState.activeBranchIndex) : 0);
    if(Number.isFinite(preferred) && preferred >= 0 && branches[preferred]) return preferred;
    const linkedIdx = branches.findIndex(b => (Array.isArray(b?.sheetPreviewProducts) && b.sheetPreviewProducts.length) || Number(b?.lastSheetCount || 0) > 0 || String(b?.sheetUrl || '').trim());
    return linkedIdx >= 0 ? linkedIdx : 0;
  }
  function rehydratePersistedBranchView(){
    ensureBranchSheetFields();
    ensureBranchLayouts();
    const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
    if(!branches.length) return false;
    const idx = getPersistedPreferredBranchIndex();
    appState.activeBranchIndex = idx;
    if(appState.admin) appState.admin.activeBranch = idx;
    try{ loadLayoutForBranch(idx); }catch(_err){}
    const branch = branches[idx];
    if(Array.isArray(branch?.sheetPreviewProducts) && branch.sheetPreviewProducts.length){
      setProductDataset(branch.sheetPreviewProducts.slice(0,50000));
      appState.filtered = appState.products.slice();
      return true;
    }
    const fallbackIdx = branches.findIndex(b => Array.isArray(b?.sheetPreviewProducts) && b.sheetPreviewProducts.length);
    if(fallbackIdx >= 0){
      appState.activeBranchIndex = fallbackIdx;
      if(appState.admin) appState.admin.activeBranch = fallbackIdx;
      try{ loadLayoutForBranch(fallbackIdx); }catch(_err){}
      const fallbackBranch = branches[fallbackIdx];
      setProductDataset(fallbackBranch.sheetPreviewProducts.slice(0,50000));
      appState.filtered = appState.products.slice();
      return true;
    }
    setProductDataset([]);
    appState.filtered = [];
    return false;
  }
  function applyRemoteAppState(state){
    if(!state || typeof state !== 'object') return;
    if(state.admin && typeof state.admin === 'object') appState.admin = state.admin;
    ensureAppRuntimeState();
    const models = coerceRemoteModels(state.models);
    if(models) appState.models = models;
    const branchLayouts = normalizeRemoteBranchLayouts(state.branchLayouts);
    if(branchLayouts) appState.branchLayouts = branchLayouts;
    rehydratePersistedBranchView();
  }
  async function loadAllBranchSheetConfigsFromServer(){
    ensureAppRuntimeState();
    ensureBranchSheetFields();
    const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
    if(!branches.length) return false;
    let changed = false;
    for(const branch of branches){
      const branchId = Number(branch?.id || 0);
      if(!branchId) continue;
      try{
        const data = await httpJson(`/api/branches/${branchId}/sheet`);
        const cfg = data?.config || {};
        ensureBranchRuntimeShape(branch);
        if(String(cfg.sheet_id || '').trim()) branch.sheetUrl = String(cfg.sheet_id || '').trim();
        if(String(cfg.sheet_name || '').trim()) branch.sheetName = String(cfg.sheet_name || 'Productos').trim();
        if(Array.isArray(cfg.sheet_map_rows)) branch.sheetMapRows = cfg.sheet_map_rows;
        if(Array.isArray(cfg.sheet_headers)) branch.sheetHeaders = cfg.sheet_headers;
        if(Number.isFinite(Number(cfg.sheet_header_index))) branch.sheetHeaderIndex = Number(cfg.sheet_header_index || 0);
        branch.lastImportAt = cfg.last_imported_at || '';
        branch.lastImportStatus = cfg.last_import_status || '';
        branch.lastImportSource = cfg.last_import_source || '';
        branch.lastImportError = cfg.last_import_error || '';
        if(Array.isArray(cfg.imported_products) && cfg.imported_products.length){
          branch.sheetPreviewProducts = cfg.imported_products.slice(0,50000);
          branch.lastSheetCount = Number(cfg.last_sheet_count || cfg.imported_products.length || 0);
          branch.sheetConnected = true;
          branch.sheetStatusText = branch.sheetStatusText || `Importados: ${branch.sheetPreviewProducts.length.toLocaleString('es-PE')}`;
          changed = true
        }
      }catch(_err){}
    }
    rehydratePersistedBranchView();
    if(Array.isArray(appState.products) && appState.products.length){
      renderProducts(appState.filtered);
      countProducts.textContent = appState.products.length.toLocaleString('es-PE');
      if(appState.products[0]) appState.selectedProduct = appState.products[0];
    }else{
      renderProducts([]);
      countProducts.textContent = '0';
    }
    return changed;
  }

  async function loadRemoteAppState(){
    try{
      const data = await httpJson('/api/app-state');
      if(data?.state) applyRemoteAppState(data.state);
      return true;
    }catch(err){
      console.warn('No se pudo cargar persistencia remota:', err);
      return false;
    }
  }
  async function saveRemoteAppState(reason=''){
    try{
      persistActiveLayout();
      await httpJson('/api/app-state', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ admin: sanitizedAdminState(), models: appState.models, branchLayouts: appState.branchLayouts })
      });
      contentStatus.textContent = reason ? `Guardado: ${reason}` : 'Cambios guardados en el servidor.';
      return true;
    }catch(err){
      console.error(err);
      alert(err.message || 'No se pudo guardar en el servidor.');
      return false;
    }
  }
  function getSheetSourceSignature(url, sheetName){
    const sheetId = parseSheetId(url || '');
    const cleanName = norm(sheetName || 'productos').replace(/[^a-z0-9]+/g,'_');
    return `${sheetId || 'sinurl'}__${cleanName || 'sinhoja'}`;
  }
  function getBranchStoragePrefix(branchIndex){
    const branch = (appState.admin?.branches || [])[branchIndex] || {};
    const branchName = norm(branch.name || `branch_${branchIndex}`).replace(/[^a-z0-9]+/g,'_');
    return `wms_products_branch_v2_${branchName}__`;
  }
  function getBranchStorageKey(branchIndex){
    const branch = (appState.admin?.branches || [])[branchIndex] || {};
    const branchName = norm(branch.name || `branch_${branchIndex}`).replace(/[^a-z0-9]+/g,'_');
    const sheetUrl = parseSheetId(branch.sheetUrl || '');
    const sheetName = norm(branch.sheetName || 'productos').replace(/[^a-z0-9]+/g,'_');
    return `wms_products_branch_v2_${branchName}__${sheetUrl || 'sinurl'}__${sheetName || 'sinhoja'}`;
  }
  function saveProductsLocal(branchIndex){
    try{
      const payload = JSON.stringify((appState.products || []));
      const key = (Number.isFinite(branchIndex) && branchIndex >= 0) ? getBranchStorageKey(branchIndex) : 'wms_products_v2';
      localStorage.setItem(key, payload);
      if(Number.isFinite(branchIndex) && branchIndex >= 0){
        localStorage.setItem(`wms_products_branch_${branchIndex}`, payload);
      }
      localStorage.setItem('wms_products_v2', payload);
    }catch{}
  }
  function loadProductsLocal(){ try{ const raw=localStorage.getItem('wms_products_v2'); if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)&&arr.length){ appState.products=arr; appState.filtered=arr; } } }catch{} }
  function applyBranchProducts(arr, branchIndex){
    ensureAppRuntimeState();
    if(!Array.isArray(arr) || !arr.length) return false;
    setProductDataset(arr);
    appState.filtered = appState.products.slice();
    appState.activeBranchIndex = branchIndex;
    renderProducts(appState.filtered);
    if(arr[0]) selectProduct(arr[0]);
    countProducts.textContent = arr.length.toLocaleString('es-PE');
    return true;
  }
  function loadBranchProducts(branchIndex){
    try{
      const modernKey = getBranchStorageKey(branchIndex);
      const rawModern = localStorage.getItem(modernKey);
      if(rawModern){
        const arr = JSON.parse(rawModern);
        if(applyBranchProducts(arr, branchIndex)) return true;
      }
      const rawLegacy = localStorage.getItem(`wms_products_branch_${branchIndex}`);
      if(rawLegacy){
        const arr = JSON.parse(rawLegacy);
        if(applyBranchProducts(arr, branchIndex)){
          try{ localStorage.setItem(modernKey, rawLegacy); }catch{}
          return true;
        }
      }
    }catch{}
    return false;
  }
  async function activateBranchSelection(branchIndex){
    ensureBranchSheetFields();
    appState.activeBranchIndex = branchIndex;
    appState.admin.activeBranch = branchIndex;
    if(Number.isFinite(Number(branchIndex))) appState.activeLayoutBranchIndex = Number(branchIndex);
    const branch = (appState.admin?.branches || [])[branchIndex];
    if(!branch) return false;
    if(loadBranchProducts(branchIndex)) {
      appState.productPaging = { ...appState.productPaging, mode:'local', page:1, total:appState.products.length, totalPages:1, query:String(searchInput?.value || '').trim(), branchId:Number(branch.id || 0), lastError:'', backendUnavailable:true };
      updateProductPagerUi();
      return true;
    }
    if(Array.isArray(branch.sheetPreviewProducts) && branch.sheetPreviewProducts.length){
      applyBranchProducts(branch.sheetPreviewProducts, branchIndex);
      appState.productPaging = { ...appState.productPaging, mode:'local', page:1, total:appState.products.length, totalPages:1, query:String(searchInput?.value || '').trim(), branchId:Number(branch.id || 0), lastError:'', backendUnavailable:true };
      updateProductPagerUi();
      return true;
    }
    if(branch.id && appState.auth?.loggedIn && !ensureProductPagingState().backendUnavailable){
      const ok = await requestProductsPage({ branchIndex, query:String(searchInput?.value || '').trim(), page:1, silent:true });
      if(ok) return true;
    }
    const hasLink = String(branch.sheetUrl||'').trim() && String(branch.sheetName||'').trim();
    if(hasLink){
      try{ await importBranchSheet(branchIndex); return true; }catch{}
    }
    setProductDataset([]);
    appState.filtered = [];
    appState.productPaging = { ...appState.productPaging, mode:'local', page:1, total:0, totalPages:1, query:'', branchId:Number(branch.id || 0), lastError:'' };
    renderProducts([]);
    countProducts.textContent = '0';
    updateProductPagerUi();
    return false;
  }
  function resetSheetPanelList(){ productList.innerHTML = '<div class="empty" style="padding:18px">Aún no hay productos importados en este asistente.</div>'; productSummary.textContent = 'Importa productos en el paso 3 para verlos aquí.'; countProducts.textContent='0'; }
  function clearImportedProductsForBranch(branchIndex, { resetUi=false, clearHeaders=false } = {}){
    try{
      const branch = (appState.admin?.branches || [])[branchIndex];
      const prefix = getBranchStoragePrefix(branchIndex);
      const staleKeys = [];
      for(let i=0;i<localStorage.length;i+=1){
        const key = localStorage.key(i);
        if(key && key.startsWith(prefix)) staleKeys.push(key);
      }
      staleKeys.forEach(key=>localStorage.removeItem(key));
      localStorage.removeItem(`wms_products_branch_${branchIndex}`);
      localStorage.removeItem('wms_products_v2');
      if(branch){
        branch.sheetPreviewProducts = [];
        branch.lastSheetCount = 0;
        branch.sheetConnected = false;
        branch.lastImportedSourceSignature = '';
        const meta = ensureBranchMeta(branch);
        meta.productCount = 0;
        meta.lastImportedAt = 0;
        if(clearHeaders){
          branch.sheetHeaders = [];
          branch.sheetHeaderIndex = 0;
          branch.sheetMapRows = (branch.sheetMapRows||[]).map(row=>({ ...row, header:'' }));
          meta.headerCount = 0;
          meta.lastHeadersReadAt = 0;
        }
        setBranchMetaStatus(branch, deriveBranchStatusAfterCleanup(branch), { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
      }
    }catch{}
    if(resetUi){
      appState.products = [];
      appState.filtered = [];
      appState.selectedProduct = null;
      appState.selectedRack = '';
      appState.selectedRackLayoutId = '';
      renderProducts([]);
      resetSheetPanelList();
      countProducts.textContent='0';
    }
  }

  function clearCurrentProductsForSheetLink(branchIndex){
    setProductDataset([]);
    appState.filtered = [];
    appState.selectedProduct = null;
    appState.selectedRack = '';
    appState.selectedRackLayoutId = '';
    try{
      if(Number.isFinite(branchIndex) && branchIndex >= 0){
        const branch = (appState.admin?.branches || [])[branchIndex];
        if(branch){
          branch.sheetPreviewProducts = [];
          branch.lastSheetCount = 0;
        }
        clearImportedProductsForBranch(branchIndex, { resetUi:false, clearHeaders:false });
      }
    }catch{}
    renderProducts([]);
    resetSheetPanelList();
  }
  function detectHeaderMap(headers){ const normed=headers.map(h=>({raw:h,key:norm(h).replace(/\s+/g,'')})); const pick=(...names)=>{ for(const n of names){ const hit=normed.find(h=>h.key.includes(n)); if(hit) return hit.raw; } return ''; }; return { sku:pick('sku','codigo'), nombre:pick('nombre','name','producto'), variante:pick('variante','variant'), talla:pick('talla','size'), color:pick('color','colour'), categoria:pick('categoria','categoría','category'), genero:pick('genero','género','gender'), barras:pick('barras','barcode','barra'), ubicacion:pick('ubicacion','ubiccaion','location'), almacen:pick('almacen','warehouse','alamacen') }; }


  function defaultSheetMapRows(){
    return [
      { id: uid('map'), field:'sku', label:'SKU', header:'' },
      { id: uid('map'), field:'nombre', label:'Nombre', header:'' },
      { id: uid('map'), field:'variante', label:'Variante', header:'' },
      { id: uid('map'), field:'talla', label:'Talla', header:'' },
      { id: uid('map'), field:'color', label:'Color', header:'' },
      { id: uid('map'), field:'categoria', label:'Categoría', header:'' },
      { id: uid('map'), field:'genero', label:'Género', header:'' },
      { id: uid('map'), field:'imagen', label:'Imagen 1', header:'' },
      { id: uid('map'), field:'imagen2', label:'Imagen 2', header:'' },
      { id: uid('map'), field:'imagen3', label:'Imagen 3', header:'' },
      { id: uid('map'), field:'fondo_card', label:'Fondo card', header:'' },
      { id: uid('map'), field:'ubicacion', label:'Ubicación', header:'' },
    ];
  }
  function uid(prefix='id'){ return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`; }

  function ensureBranchMeta(branch){
    if(!branch) return { status:BRANCH_STATUS.EMPTY, lastHeadersReadAt:0, lastImportedAt:0, productCount:0, headerCount:0, error:'', loadingMessage:'' };
    if(!branch.sheetMeta || typeof branch.sheetMeta !== 'object') branch.sheetMeta = {};
    branch.sheetMeta = {
      status: branch.sheetMeta.status || '',
      lastHeadersReadAt: Number(branch.sheetMeta.lastHeadersReadAt || 0),
      lastImportedAt: Number(branch.sheetMeta.lastImportedAt || 0),
      productCount: Number(branch.sheetMeta.productCount || 0),
      headerCount: Number(branch.sheetMeta.headerCount || 0),
      error: String(branch.sheetMeta.error || ''),
      loadingMessage: String(branch.sheetMeta.loadingMessage || '')
    };
    return branch.sheetMeta;
  }
  function formatMetaDate(ts){
    const n = Number(ts || 0);
    if(!n) return '—';
    try{ return new Date(n).toLocaleString('es-PE', { hour12:true }); }catch{ return '—'; }
  }
  function getSheetBranchProductCount(branch){
    if(Array.isArray(branch?.sheetPreviewProducts) && branch.sheetPreviewProducts.length) return branch.sheetPreviewProducts.length;
    const meta = ensureBranchMeta(branch);
    return Number(meta.productCount || branch?.lastSheetCount || 0);
  }
  function getSheetBranchHeaderCount(branch){
    if(Array.isArray(branch?.sheetHeaders) && branch.sheetHeaders.length) return branch.sheetHeaders.length;
    return Number(ensureBranchMeta(branch).headerCount || 0);
  }
  function branchHasMappedHeaders(branch){
    return Array.isArray(branch?.sheetMapRows) && branch.sheetMapRows.some(row => String(row?.header || '').trim());
  }
  function getSheetBranchStatusInfo(branch){
    const meta = ensureBranchMeta(branch);
    let key = meta.status;
    if(!key){
      if(getSheetBranchProductCount(branch)) key = BRANCH_STATUS.IMPORTED;
      else if(branchHasMappedHeaders(branch)) key = BRANCH_STATUS.MAPPED;
      else if(getSheetBranchHeaderCount(branch)) key = BRANCH_STATUS.HEADERS_LOADED;
      else if(String(branch?.sheetUrl || '').trim() || String(branch?.sheetName || '').trim()) key = BRANCH_STATUS.LINKED;
      else key = BRANCH_STATUS.EMPTY;
    }
    const labels = {
      [BRANCH_STATUS.EMPTY]:'Sin vincular',
      [BRANCH_STATUS.LINKED]:'Vinculada',
      [BRANCH_STATUS.HEADERS_LOADED]:'Encabezados leídos',
      [BRANCH_STATUS.MAPPED]:'Mapeo listo',
      [BRANCH_STATUS.IMPORTED]:'Productos importados',
      [BRANCH_STATUS.DIRTY]:'Cambios pendientes',
      [BRANCH_STATUS.ERROR]:'Error',
      [BRANCH_STATUS.LOADING]:(meta.loadingMessage || 'Procesando…')
    };
    const cls = key === BRANCH_STATUS.ERROR ? 'error' : (key === BRANCH_STATUS.DIRTY || key === BRANCH_STATUS.EMPTY ? 'warn' : (key === BRANCH_STATUS.LOADING ? 'loading' : 'ok'));
    return { key, label: labels[key] || labels[BRANCH_STATUS.EMPTY], cls };
  }
  function setBranchMetaStatus(branch, status, extra={}){
    const meta = ensureBranchMeta(branch);
    meta.status = status;
    if(Object.prototype.hasOwnProperty.call(extra, 'loadingMessage')) meta.loadingMessage = String(extra.loadingMessage || '');
    if(Object.prototype.hasOwnProperty.call(extra, 'error')) meta.error = String(extra.error || '');
    if(Object.prototype.hasOwnProperty.call(extra, 'headerCount')) meta.headerCount = Number(extra.headerCount || 0);
    if(Object.prototype.hasOwnProperty.call(extra, 'productCount')) meta.productCount = Number(extra.productCount || 0);
    if(extra.touchHeadersReadAt) meta.lastHeadersReadAt = Date.now();
    if(extra.touchImportedAt) meta.lastImportedAt = Date.now();
    if(status !== BRANCH_STATUS.LOADING && !Object.prototype.hasOwnProperty.call(extra, 'loadingMessage')) meta.loadingMessage = '';
    if(status !== BRANCH_STATUS.ERROR && !Object.prototype.hasOwnProperty.call(extra, 'error')) meta.error = '';
    branch.sheetMeta = meta;
    return meta;
  }
  function deriveBranchStatusAfterCleanup(branch){
    if(getSheetBranchProductCount(branch)) return BRANCH_STATUS.IMPORTED;
    if(branchHasMappedHeaders(branch)) return BRANCH_STATUS.MAPPED;
    if(getSheetBranchHeaderCount(branch)) return BRANCH_STATUS.HEADERS_LOADED;
    if(String(branch?.sheetUrl || '').trim() || String(branch?.sheetName || '').trim()) return BRANCH_STATUS.LINKED;
    return BRANCH_STATUS.EMPTY;
  }
  function markBranchDirty(index){
    ensureBranchSheetFields();
    const branch = appState.admin?.branches?.[index];
    if(!branch) return;
    const meta = ensureBranchMeta(branch);
    if(meta.status === BRANCH_STATUS.LOADING) return;
    setBranchMetaStatus(branch, BRANCH_STATUS.DIRTY, { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    branch.sheetStatusText = 'Cambios pendientes por guardar.';
  }

  function setUnifiedMapLayout(){}
  
  function focusBoundsForProduct(product = appState.selectedProduct){
    const ctx = getViewerProductLocationContext(product);
    const prod = product || ctx.prod;
    if(!prod) return null;
    const mode = appState.ui?.locationFocusMode || 'both';
    const ids = [];
    if((mode === 'primary' || mode === 'both') && ctx.primaryRackId) ids.push(ctx.primaryRackId);
    if((mode === 'store' || mode === 'both') && ctx.storeRackId && ctx.storeRackId !== ctx.primaryRackId) ids.push(ctx.storeRackId);
    if(!ids.length && ctx.primaryRackId) ids.push(ctx.primaryRackId);
    const points = [];
    ids.forEach(id => {
      const rack = findRackById(id);
      if(!rack) return;
      const plan = getRackIsoPlan(rack);
      (plan?.corners || []).forEach(p => points.push(toIso(p.x, p.y, 0)));
      (plan?.corners || []).forEach(p => points.push(toIso(p.x, p.y, getRackRenderHeight3D(rack))));
    });
    const zoneIds = new Set();
    if((mode === 'primary' || mode === 'both') && prod.zona) zoneIds.add(prod.zona);
    if((mode === 'store' || mode === 'both') && prod.zonaStore) zoneIds.add(prod.zonaStore);
    (appState.layout?.zones || []).forEach(z => {
      if(zoneIds.has(z.id)) (z.pts || []).forEach(p => points.push(toIso(p.x, p.y, 0)));
    });
    if(!points.length) return null;
    return {
      minX: Math.min(...points.map(p => p.x)),
      maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxY: Math.max(...points.map(p => p.y))
    };
  }
  function getActiveSheetBranch(){
    ensureBranchSheetFields();
    const branches = appState.admin.branches || [];
    // Prioridad: sucursal actualmente abierta en el acordeón
    if(Number.isFinite(appState.activeBranchIndex) && branches[appState.activeBranchIndex]) {
      return branches[appState.activeBranchIndex];
    }
    return branches.find(b => b.sheetConnected) || branches[0] || null;
  }
  function getActiveBranchIndex(){
    const branches = appState.admin.branches || [];
    if(Number.isFinite(appState.activeBranchIndex) && branches[appState.activeBranchIndex]) return appState.activeBranchIndex;
    const idx = branches.findIndex(b => b.sheetConnected);
    return idx >= 0 ? idx : 0;
  }
  function getActiveSheetBranchIndex(){
    return getActiveBranchIndex();
  }
  function getActiveBranchContextIndex(fallback = 0){
    const branches = appState.admin?.branches || [];
    const candidates = [
      Number(appState.viewerBranchIndex),
      Number(appState.activeBranchIndex),
      Number(appState.activeLayoutBranchIndex),
      Number(appState.admin?.activeBranch),
      Number(fallback)
    ];
    const found = candidates.find(i => Number.isFinite(i) && i >= 0 && i < branches.length);
    return Number.isFinite(found) ? found : 0;
  }

  function getBranchWarehouseList(branchIndex = null){
    const idx = Number.isFinite(Number(branchIndex)) ? Number(branchIndex) : getActiveBranchContextIndex();
    const branch = (appState.admin?.branches || [])[idx] || {};
    const fromConfig = Array.isArray(branch.warehouses) ? branch.warehouses : [];
    const fromProducts = Array.from(new Set((appState.products || []).map(p => String(p?.almacen || p?.warehouse || '').trim()).filter(Boolean)));
    const merged = Array.from(new Set(fromConfig.concat(fromProducts).map(x => String(x || '').trim()).filter(Boolean)));
    return merged.length ? merged : ['Almacén principal'];
  }

  async function setGlobalBranch(branchIndex, { screen = null } = {}){
    const idx = Number(branchIndex);
    const branches = appState.admin?.branches || [];
    if(!Number.isFinite(idx) || !branches[idx]) return;
    appState.admin.activeBranch = idx;
    appState.activeBranchIndex = idx;
    appState.viewerBranchIndex = idx;
    appState.productFilters = { ...(appState.productFilters || {}), warehouse:'' };
    saveAdminState();
    loadLayoutForBranch(idx);
    await activateBranchSelection(idx);
    if(screen || appState.screen === 'viewer') setScreen(screen || 'viewer');
    else {
      renderViewerBranchHost(idx);
      if(appState.screen === 'layout') renderLayoutEditor();
      if(appState.screen === 'dashboard') renderDashboard();
    }
  }

  function renderViewerBranchHost(activeBranchIndex){
    ensureAppRuntimeState();
    const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
    const index = branches.length ? getActiveBranchContextIndex(activeBranchIndex) : -1;
    appState.viewerBranchIndex = index;
    renderViewerMenu();
    if(!searchBranchHost) return;
    if(!branches.length){
      searchBranchHost.classList.remove('active');
      searchBranchHost.innerHTML = '';
      return;
    }
    const branch = branches[index] || branches[0];
    const warehouses = getBranchWarehouseList(index);
    const activeWarehouse = String(appState.productFilters?.warehouse || '').trim();
    searchBranchHost.classList.add('active');
    searchBranchHost.innerHTML = `
      <div class="branch-switch-card v53">
        <div class="branch-switch-main">
          <div class="branch-switch-dot" style="background:${escapeHtml(branch?.color || getActiveBrandColor())}"></div>
          <div class="branch-switch-copy">
            <span>Sucursal activa</span>
            <b>${escapeHtml(branch?.name || 'Sucursal')}</b>
          </div>
        </div>
        <div class="branch-switch-controls">
          <select id="globalBranchSelect" title="Cambiar sucursal">${branches.map((b,i)=>`<option value="${i}" ${i===index?'selected':''}>${escapeHtml(b?.name || ('Sucursal '+(i+1)))}</option>`).join('')}</select>
          <select id="globalWarehouseSelect" title="Filtrar almacén"><option value="">Todos los almacenes</option>${warehouses.map(w=>`<option value="${escapeHtml(w)}" ${w===activeWarehouse?'selected':''}>${escapeHtml(w)}</option>`).join('')}</select>
        </div>
        <div class="branch-switch-actions">
          <button type="button" class="tiny-btn" id="branchGoLayout">Layout</button>
          <button type="button" class="tiny-btn" id="branchGoHealth">Salud</button>
        </div>
      </div>`;
    const branchSelect = document.getElementById('globalBranchSelect');
    if(branchSelect) branchSelect.onchange = e => setGlobalBranch(Number(e.target.value), { screen:'viewer' });
    const warehouseSelect = document.getElementById('globalWarehouseSelect');
    if(warehouseSelect) warehouseSelect.onchange = e => {
      appState.productFilters.warehouse = String(e.target.value || '').trim();
      filterProducts();
      renderViewerBranchHost(index);
    };
    document.getElementById('branchGoLayout')?.addEventListener('click', () => { setLayoutBranch(index); setScreen('layout'); });
    document.getElementById('branchGoHealth')?.addEventListener('click', () => openDataQualityModal());
  }
  function getBranchPreviewProducts(branch){
    return Array.isArray(branch?.sheetPreviewProducts) ? branch.sheetPreviewProducts : [];
  }

  function renderSheetDetailPreview(){
    const branchIdx = getActiveBranchIndex();
    const branch = (appState.admin.branches||[])[branchIdx];
    const products = getBranchPreviewProducts(branch).slice(0, 20);
    const rowsHtml = products.length ? products.map(p => `<tr><td>${escapeHtml(p.sku||'')}</td><td>${escapeHtml(p.nombre||'')}</td><td>${escapeHtml(p.variante||'')}</td><td>${escapeHtml(p.ubicacion||'')}</td></tr>`).join('') : `<tr><td colspan="4" class="muted" style="padding:18px">Aún no hay productos importados en esta sucursal.</td></tr>`;
    detailTitle.textContent='Vista previa de productos';
    detailSubtitle.textContent=`Sucursal activa: ${branch?.name||'—'}`;
    detailWrap.innerHTML = `<div class="card" style="height:100%;display:flex;flex-direction:column"><div class="card-body" style="display:flex;flex-direction:column;gap:12px;height:100%"><div class="kv"><div class="kv-row"><div class="tiny muted">Sucursal</div><div>${escapeHtml(branch?.name||'—')}</div></div><div class="kv-row"><div class="tiny muted">Productos cargados</div><div>${appState.products.length.toLocaleString('es-PE')}</div></div><div class="kv-row"><div class="tiny muted">Total detectados</div><div>${Number(branch?.lastSheetCount||0).toLocaleString('es-PE')}</div></div></div><div class="tiny muted">Vista previa (${products.length} filas)</div><div style="overflow:auto;flex:1;border:1px solid rgba(255,255,255,.08);border-radius:12px"><table class="table"><thead><tr><th>SKU</th><th>Nombre</th><th>Variante</th><th>Ubicación</th></tr></thead><tbody>${rowsHtml}</tbody></table></div></div></div>`;
    detailStatus.textContent='Sheet';
    detailChip.textContent=`${products.length} filas`;
  }

  function ensureBranchSheetFields(){
    appState.admin.branches = (appState.admin.branches||[]).map(b => ({
      ...b,
      sheetUrl: b.sheetUrl || '',
      sheetName: b.sheetName || 'Productos',
      sheetConnected: !!b.sheetConnected,
      lastSheetCount: Number(b.lastSheetCount || 0),
      sheetHeaders: Array.isArray(b.sheetHeaders) ? b.sheetHeaders : [],
      sheetStatusText: b.sheetStatusText || '',
      sheetHeaderIndex: Number.isFinite(Number(b.sheetHeaderIndex)) ? Number(b.sheetHeaderIndex) : 0,
      sheetPreviewProducts: Array.isArray(b.sheetPreviewProducts) ? b.sheetPreviewProducts : [],
      sheetMapRows: (Array.isArray(b.sheetMapRows) && b.sheetMapRows.length ? b.sheetMapRows : defaultSheetMapRows()).filter(row => row?.field !== 'video_url'),
      cardConfig: b.cardConfig && typeof b.cardConfig === 'object' ? b.cardConfig : null,
      sheetMeta: {
        status: b?.sheetMeta?.status || '',
        lastHeadersReadAt: Number(b?.sheetMeta?.lastHeadersReadAt || 0),
        lastImportedAt: Number(b?.sheetMeta?.lastImportedAt || 0),
        productCount: Number(b?.sheetMeta?.productCount || 0),
        headerCount: Number(b?.sheetMeta?.headerCount || 0),
        error: b?.sheetMeta?.error || '',
        loadingMessage: b?.sheetMeta?.loadingMessage || ''
      },
    }));
    appState.admin.branches.forEach(branch => { if(!Array.isArray(branch.sheetMapRows) || !branch.sheetMapRows.length) branch.sheetMapRows = defaultSheetMapRows(); ensureBranchMeta(branch); ensureBranchCardConfig(branch); });
  }

  
  function getSheetHeaderOptions(branch){
    const explicit = Array.isArray(branch?.sheetHeaders) ? branch.sheetHeaders.filter(Boolean) : [];
    const mapped = Array.isArray(branch?.sheetMapRows) ? branch.sheetMapRows.map(r => String(r?.header||'').trim()).filter(Boolean) : [];
    return Array.from(new Set([...explicit, ...mapped]));
  }

  function defaultCardConfig(branch){
    const headers = getSheetHeaderOptions(branch || {});
    const pick = (...keys) => headers.find(h => keys.some(k => norm(h).includes(norm(k)))) || '';
    return {
      titleHeader: pick('nombre','producto','descripcion') || 'Nombre',
      subtitleHeader: pick('sku','cod','modelo','barras') || 'Sku',
      imageHeader: pick('imagen','foto','image','img'),
      videoHeader: '',
      backdropHeader: pick('fondo','background'),
      mediaMode: 'image-first',
      layout: {
        width: 1180,
        height: 820,
        mediaPosition: 'left',
        alignX: 'center',
        alignY: 'top',
        offsetX: 0,
        offsetY: 0,
      },
      showDefaultLocation: true,
      showVariants: true,
      showActions: true,
      fields: [
        { id: uid('cardfld'), label:'Marca', header: pick('marca','brand'), visible: !!pick('marca','brand') },
        { id: uid('cardfld'), label:'Categoría', header: pick('categoria','categoría','category'), visible: !!pick('categoria','categoría','category') },
        { id: uid('cardfld'), label:'Precio', header: pick('p.lista','precio','price'), visible: !!pick('p.lista','precio','price') },
        { id: uid('cardfld'), label:'Restock', header: pick('restock','stock','cantidad'), visible: !!pick('restock','stock','cantidad') }
      ]
    };
  }

  function sanitizeCardLayout(layout){
    const source = layout && typeof layout === 'object' ? layout : {};
    const clamp = (value, min, max, fallback) => {
      const n = Number(value);
      if(!Number.isFinite(n)) return fallback;
      return Math.max(min, Math.min(max, n));
    };
    const allow = (value, list, fallback) => list.includes(value) ? value : fallback;
    return {
      width: clamp(source.width, 380, 1600, 1180),
      height: clamp(source.height, 420, 1200, 820),
      mediaPosition: allow(String(source.mediaPosition || ''), ['left','right','top'], 'left'),
      alignX: allow(String(source.alignX || ''), ['left','center','right'], 'center'),
      alignY: allow(String(source.alignY || ''), ['top','center','bottom'], 'top'),
      offsetX: clamp(source.offsetX, -320, 320, 0),
      offsetY: clamp(source.offsetY, -320, 320, 0)
    };
  }

  function ensureBranchCardConfig(branch){
    if(!branch || typeof branch !== 'object') return defaultCardConfig({});
    const base = defaultCardConfig(branch);
    const cfg = branch.cardConfig && typeof branch.cardConfig === 'object' ? branch.cardConfig : {};
    const isVideoHeader = (value) => ['video','video url','video_url','url video','url_video','link video','link_video','enlace video','enlace_video','video producto','video_producto'].includes(norm(value));
    const fields = (Array.isArray(cfg.fields) ? cfg.fields : base.fields).filter(f => !isVideoHeader(f?.header) && !isVideoHeader(f?.label));
    branch.cardConfig = {
      ...base,
      ...cfg,
      videoHeader: '',
      mediaMode: 'image-first',
      layout: sanitizeCardLayout(cfg.layout || base.layout),
      fields: fields.map((f, idx) => ({ id:f?.id || uid('cardfld'), label:String(f?.label || `Dato ${idx+1}`), header:String(f?.header || ''), visible:f?.visible !== false }))
    };
    return branch.cardConfig;
  }

  function getCardLayoutConfig(cfg){
    return sanitizeCardLayout(cfg?.layout || {});
  }

  function applyCardLayoutConfigToElement(element, cfg, { preview=false }={}){
    if(!element) return;
    const layout = getCardLayoutConfig(cfg);
    element.dataset.mediaPosition = layout.mediaPosition;
    element.dataset.previewAlignX = layout.alignX;
    element.dataset.previewAlignY = layout.alignY;
    element.style.setProperty('--card-custom-width', `${layout.width}px`);
    element.style.setProperty('--card-custom-height', `${layout.height}px`);
    element.style.setProperty('--card-offset-x', `${layout.offsetX}px`);
    element.style.setProperty('--card-offset-y', `${layout.offsetY}px`);
    if(preview){
      element.style.setProperty('--preview-offset-x', `${layout.offsetX}px`);
      element.style.setProperty('--preview-offset-y', `${layout.offsetY}px`);
    }
  }

  function getCardPreviewMediaHtml(item){
    if(!item || !item.url) return '<div class="designer-preview-empty">Sin imagen ni video</div>';
    if(item.type === 'video'){
      const driveDirectUrl = getDriveDirectVideoUrl(item.url);
      if(isDirectVideoUrl(item.url) || driveDirectUrl){
        return `<video src="${escapeHtml(driveDirectUrl || item.url)}" controls autoplay muted loop playsinline preload="auto"></video>`;
      }
      const embed = getVideoEmbedUrl(item.url, { autoplay:true });
      if(embed){
        return `<iframe src="${escapeHtml(embed)}" title="Video del producto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      }
      return `<div class="designer-preview-video-placeholder"><div class="play">▶</div><div><b>Video externo</b><small>Este enlace no se puede reproducir automáticamente dentro del card.</small><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Abrir video</a></div></div>`;
    }
    return `<img src="${escapeHtml(item.url)}" alt="Imagen del producto">`;
  }

  function buildCardDesignerPreviewMarkup(product, cfg){
    const previewProduct = product ? hydrateProductForCard(product) : null;
    const titleValue = previewProduct ? (productHeaderValue(previewProduct, cfg.titleHeader) || previewProduct.nombre || 'Sin nombre') : 'Sin producto';
    const subtitleValue = previewProduct ? (productHeaderValue(previewProduct, cfg.subtitleHeader) || previewProduct.sku || '—') : '—';
    const locationValue = previewProduct ? (previewProduct.ubicacion || '—') : '—';
    const storeValue = previewProduct ? (previewProduct.almacen || '—') : '—';
    const sizeValue = previewProduct ? getProductSizeValue(previewProduct) : '';
    const colorValue = previewProduct ? getProductColorValue(previewProduct) : '';
    const mediaItems = previewProduct ? getProductMediaItems(previewProduct) : [];
    const firstMedia = mediaItems[0] || null;
    const backdropUrl = previewProduct ? getProductBackdropUrl(previewProduct, firstMedia?.type === 'image' ? firstMedia?.url : '') : '';
    const mediaHeaders = new Set([cfg.imageHeader, cfg.videoHeader, cfg.backdropHeader].map(v => String(v || '').trim()).filter(Boolean));
    const customRows = (cfg.fields || []).filter(f => f.visible !== false && String(f.header || '').trim() && !mediaHeaders.has(String(f.header || '').trim())).map(f => {
      const value = previewProduct ? productHeaderValue(previewProduct, f.header) : '';
      if(!value) return '';
      return `<div class="active-card-custom-field"><span>${escapeHtml(f.label || f.header)}</span><b>${escapeHtml(value)}</b></div>`;
    }).filter(Boolean).join('');
    const thumbs = mediaItems.map((item, index) => `<button class="search-card-thumb ${index===0?'active':''}" type="button" tabindex="-1"><span>${item.type === 'video' ? '▶' : String(index+1).padStart(2,'0')}</span></button>`).join('');
    const variantsHtml = cfg.showVariants === false ? '' : `<div class="variant-groups"><div class="variant-group"><div class="variant-group-label">Talla</div><div class="variant-strip">${sizeValue ? `<button class="variant-chip active" type="button">${escapeHtml(sizeValue)}</button>` : '<span class="muted tiny">Sin talla detectada</span>'}</div></div><div class="variant-group"><div class="variant-group-label">Color</div><div class="variant-strip">${colorValue ? `<button class="variant-chip active" type="button">${escapeHtml(colorValue)}</button>` : '<span class="muted tiny">Sin color detectado</span>'}</div></div></div>`;
    const actionsHtml = cfg.showActions === false ? '' : `<div class="search-card-actions-row"><button class="action-btn secondary search-card-action" type="button">Ver ubicación</button><button class="action-btn primary search-card-action" type="button">Abrir visor</button></div>`;
    const metaHtml = cfg.showDefaultLocation === false ? '' : `<div class="search-card-meta"><div class="search-meta-block"><span class="search-meta-label">Ubicación</span><span class="search-meta-value">${escapeHtml(locationValue)}</span></div><div class="search-meta-block"><span class="search-meta-label">Ubicación en almacén</span><span class="search-meta-value store">${escapeHtml(storeValue)}</span></div></div>`;
    const layout = getCardLayoutConfig(cfg);
    const overlayClass = firstMedia?.type === 'video' ? ' card-video-overlay' : '';
    return `<div class="card-designer-stage"><div class="card-designer-stage-note tiny muted">Preview editable del card expandido. Ajusta medidas, posición y ubicación desde la configuración.</div><div class="card-designer-preview-host align-x-${layout.alignX} align-y-${layout.alignY}" id="cardDesignerPreviewHost"><div class="search-card search-card-expanded designer-preview-card${overlayClass}" id="cardDesignerPreviewCard" style="--product-bg-image:${toCssImageUrl(backdropUrl || (firstMedia?.type === 'image' ? firstMedia.url : ''))};"><div class="search-card-media-col ${backdropUrl || firstMedia?.type==='image' ? 'has-backdrop-image' : ''}"><div class="product-photo ${firstMedia ? '' : 'empty'}">${getCardPreviewMediaHtml(firstMedia)}</div><div class="search-card-gallery">${thumbs}</div><div class="search-card-gallery-nav"><button class="gallery-nav-btn" type="button" tabindex="-1">‹</button><span class="gallery-counter">${String(Math.max(1, mediaItems.length)).padStart(2,'0')} / ${String(Math.max(1, mediaItems.length)).padStart(2,'0')}</span><button class="gallery-nav-btn" type="button" tabindex="-1">›</button></div></div><div class="search-card-body"><div class="search-card-title-row"><div><div class="search-card-kicker">Producto</div><div class="search-card-title">${escapeHtml(titleValue)}</div><div class="search-card-sku">${escapeHtml(subtitleValue)}</div></div></div>${metaHtml}<div>${customRows ? `<div id="activeCardCustomFields" class="active-card-custom-fields">${customRows}</div>` : ''}<div class="muted tiny search-card-variant-copy">Variante activa: talla ${escapeHtml(sizeValue || '—')}${colorValue ? ` • color ${escapeHtml(colorValue)}` : ''}</div>${variantsHtml}</div>${actionsHtml}</div></div></div></div>`;
  }

  function renderCardDesignerPreviewPane(branch, cfg, product){
    detailWrap.innerHTML = `<div class="card-designer-preview-shell"><div class="card-designer-preview-meta"><div><div class="tiny muted">Producto usado para vista previa</div><h3>${escapeHtml(product?.nombre || 'Sin producto seleccionado')}</h3><div class="muted tiny">${escapeHtml(product?.sku || '')}</div></div><div class="designer-preview-asset-list"><div><span>Imagen detectada</span><b>${escapeHtml(productHeaderValue(product, cfg.imageHeader) || product?.imagen || '—')}</b></div><div><span>Video detectado</span><b>${escapeHtml(productHeaderValue(product, cfg.videoHeader) || product?.video_url || '—')}</b></div></div></div>${buildCardDesignerPreviewMarkup(product, cfg)}</div>`;
    const previewCard = document.getElementById('cardDesignerPreviewCard');
    if(previewCard) applyCardLayoutConfigToElement(previewCard, cfg, { preview:true });
    fitCardDesignerPreview();
  }

  function fitCardDesignerPreview(){
    const host = document.getElementById('cardDesignerPreviewHost');
    const card = document.getElementById('cardDesignerPreviewCard');
    if(!host || !card) return;
    const width = parseFloat(card.style.getPropertyValue('--card-custom-width') || card.style.width || 1180);
    const height = parseFloat(card.style.getPropertyValue('--card-custom-height') || card.style.height || 820);
    const rect = host.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    const scale = Math.max(0.22, Math.min((rect.width - 28) / width, (rect.height - 28) / height, 1));
    card.style.setProperty('--preview-scale', String(Number(scale.toFixed(3))));
  }

  function getActiveCardBranch(){
    const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
    const idx = Number.isFinite(Number(appState.activeBranchIndex)) ? Number(appState.activeBranchIndex) : Number(appState.admin?.activeBranch || 0);
    return branches[idx] || branches[0] || null;
  }

  function getActiveCardConfig(){
    return ensureBranchCardConfig(getActiveCardBranch());
  }

  function productHeaderValue(product, header){
    if(!product || !header) return '';
    const h = String(header || '').trim();
    if(!h) return '';
    if(product._raw && Object.prototype.hasOwnProperty.call(product._raw, h)) return String(product._raw[h] ?? '').trim();
    const branch = getActiveCardBranch();
    const mapped = Array.isArray(branch?.sheetMapRows) ? branch.sheetMapRows.find(r => String(r?.header||'').trim() === h) : null;
    if(mapped?.field && product[mapped.field] != null) return String(product[mapped.field] ?? '').trim();
    const compact = norm(h).replace(/[^a-z0-9]+/g,'');
    const aliases = {
      sku:['sku','codigo','codmodelo','codigomodelo','modelo'],
      nombre:['nombre','producto','descripcion','description','name'],
      variante:['variante','variant','linea'],
      talla:['talla','size'],
      color:['color','colour'],
      barras:['barras','barra','barcode','codigobarras'],
      imagen:['imagen','imagen1','image','image1','foto','foto1','fotografia','img','img1','urlimagen','linkimagen'],
      imagen2:['imagen2','image2','foto2','img2','urlimagen2','linkimagen2'],
      imagen3:['imagen3','image3','foto3','img3','urlimagen3','linkimagen3'],
      imagen4:['imagen4','image4','foto4','img4','urlimagen4','linkimagen4'],
      imagen5:['imagen5','image5','foto5','img5','urlimagen5','linkimagen5'],
      imagen6:['imagen6','image6','foto6','img6','urlimagen6','linkimagen6'],
      fondo_card:['fondocard','backgroundcard','imagenfondo','urlfondo','linkfondo'],
      ubicacion:['ubicacion','ubicacionfinal','location'],
      almacen:['almacen','ubicacionalmacen','warehouse'],
      zona:['zona'], estante:['estante','rack'], nivel:['nivel'], slot:['slot','posicion'],
      marca:['marca','brand'], categoria:['categoria','category'], genero:['genero','gender'], estado:['estado','status'], linea:['linea'], precio:['precio','plistaigv','plistamasigv','plist'], restock:['cantrestock','restock','stock','cantidad']
    };
    for(const [field, keys] of Object.entries(aliases)){
      if(keys.includes(compact) && product[field] != null) return String(product[field] ?? '').trim();
    }
    const directKey = Object.keys(product).find(k => norm(k).replace(/[^a-z0-9]+/g,'') === compact);
    return directKey ? String(product[directKey] ?? '').trim() : '';
  }

  function hydrateProductForCard(product){
    if(!product) return product;
    const cfg = getActiveCardConfig();
    const copy = { ...product };
    const img = productHeaderValue(product, cfg.imageHeader);
    const back = productHeaderValue(product, cfg.backdropHeader);
    if(img) copy._card_image_url = img;
    if(back) copy._card_backdrop_url = back;
    return copy;
  }

  function renderActiveCardCustomFields(product){
    const body = document.querySelector('#activeProductCard .search-card-body');
    if(!body) return;
    let host = document.getElementById('activeCardCustomFields');
    if(!host){
      host = document.createElement('div');
      host.id = 'activeCardCustomFields';
      host.className = 'active-card-custom-fields';
      const meta = document.getElementById('activeProductMeta');
      if(meta && meta.parentNode) meta.parentNode.insertBefore(host, meta.nextSibling);
      else body.appendChild(host);
    }
    const cfg = getActiveCardConfig();
    const mediaHeaders = new Set([cfg.imageHeader, cfg.videoHeader, cfg.backdropHeader].map(v => String(v || '').trim()).filter(Boolean));
    const rows = (cfg.fields || []).filter(f => f.visible !== false && String(f.header||'').trim() && !mediaHeaders.has(String(f.header || '').trim())).map(f => {
      const value = productHeaderValue(product, f.header);
      if(!value) return '';
      return `<div class="active-card-custom-field"><span>${escapeHtml(f.label || f.header)}</span><b>${escapeHtml(value)}</b></div>`;
    }).filter(Boolean);
    host.innerHTML = rows.join('');
    host.style.display = rows.length ? '' : 'none';
    const metaWrap = document.querySelector('#activeProductCard .search-card-meta');
    if(metaWrap) metaWrap.style.display = cfg.showDefaultLocation === false ? 'none' : '';
    const variants = document.querySelector('#activeProductCard .variant-groups');
    if(variants) variants.style.display = cfg.showVariants === false ? 'none' : '';
    const actions = document.querySelector('#activeProductCard .search-card-actions-row');
    if(actions) actions.style.display = cfg.showActions === false ? 'none' : '';
  }

  async function saveCardConfigForBranch(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index];
    if(!branch) return;
    ensureBranchCardConfig(branch);
    saveAdminState();
    if(!(typeof isLocalRuntimeForAuth === 'function' && isLocalRuntimeForAuth())){
      await saveRemoteAppState('Configuración');
    }
    updateActiveProductCard(appState.selectedProduct);
    showToast('Configuración guardada.', 'success');
  }

  function renderCardDesigner(){
    setScreen('sheet');
  }

function getSheetBranchOpenMap(){
    if(!appState.sheetBranchOpen || typeof appState.sheetBranchOpen !== 'object') appState.sheetBranchOpen = {0:true};
    return appState.sheetBranchOpen;
  }
  function getCurrentSheetBranchIndex(){
    const openMap = getSheetBranchOpenMap();
    const openKey = Object.keys(openMap).find(k => !!openMap[k]);
    const openIndex = Number(openKey);
    if(Number.isFinite(openIndex) && openIndex >= 0) return openIndex;
    const activeIndex = Number.isFinite(Number(appState.activeBranchIndex)) ? Number(appState.activeBranchIndex) : Number(appState.admin?.activeBranch || 0);
    return Number.isFinite(activeIndex) && activeIndex >= 0 ? activeIndex : 0;
  }

  async function readBranchHeaders(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index];
    if(!branch) return;
    const url = String(branch.sheetUrl||'').trim();
    const sheetName = String(branch.sheetName||'').trim();
    if(!url || !sheetName) throw new Error('Completa la URL/ID del Sheet y el nombre de la hoja.');
    setBranchMetaStatus(branch, BRANCH_STATUS.LOADING, { loadingMessage:'Leyendo fila 1…', headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    saveAdminState();
    const data = await httpJson(`/api/sheets/rows?url=${encodeURIComponent(url)}&sheet=${encodeURIComponent(sheetName)}&headerOnly=1`);
    const detectedHeaders = Array.isArray(data.headers) ? data.headers.filter(Boolean) : [];
    if(!detectedHeaders.length){ throw new Error('La hoja no devolvió encabezados válidos en la fila 1.'); }
    const preservedHeaders = Array.isArray(branch.sheetHeaders) ? branch.sheetHeaders.filter(Boolean) : [];
    branch.sheetHeaders = detectedHeaders.length ? detectedHeaders : preservedHeaders;
    branch.sheetHeaderIndex = Number(data.headerIndex || branch.sheetHeaderIndex || 0);
    branch.sheetConnected = branch.sheetHeaders.length > 0;
    branch.sheetStatusText = detectedHeaders.length ? `Encabezados leídos: ${detectedHeaders.length} • fila ${branch.sheetHeaderIndex + 1}` : (branch.sheetConnected ? 'Usando encabezados guardados hasta releer la fila 1' : 'Sin encabezados');
    setBranchMetaStatus(branch, getSheetBranchProductCount(branch) ? BRANCH_STATUS.IMPORTED : (branch.sheetHeaders.length ? BRANCH_STATUS.HEADERS_LOADED : deriveBranchStatusAfterCleanup(branch)), { touchHeadersReadAt: !!detectedHeaders.length, headerCount: branch.sheetHeaders.length, productCount:getSheetBranchProductCount(branch) });
    const prefer = {
      sku:['sku','cod modelo','codigo','código'], nombre:['nombre','name','producto','descripcion'], variante:['variante','variant'], talla:['talla','size'], color:['color','colour'], ubicacion:['ubicacion','ubicación','location','ubicacion final'],
      barras:['barras','barcode','barra'], almacen:['almacen','almacén','warehouse'], zona:['zona'], estante:['estante','rack'], nivel:['nivel'], slot:['slot','posicion','posición']
    };
    (branch.sheetMapRows||[]).forEach(r=>{
      if(r.header) return;
      const hit = (branch.sheetHeaders||[]).find(h => (prefer[r.field]||[]).some(k => norm(h).includes(norm(k))));
      if(hit) r.header = hit;
    });
    saveAdminState();
    showToast(`Encabezados leídos: ${branch.sheetHeaders.length}.`, 'success');
  }


  async function persistBranchSheet(index, { includeProducts=false }={}){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index];
    if(!branch) return false;
    const branchId = Number(branch.id || 0);
    if(!branchId) throw new Error('La sucursal no tiene ID válido.');
    const payload = {
      sheet_id: String(branch.sheetUrl || '').trim(),
      sheet_name: String(branch.sheetName || 'Productos').trim(),
      source_type: 'google_sheet',
      sheet_map_rows: Array.isArray(branch.sheetMapRows) ? branch.sheetMapRows : null,
      last_sheet_count: Number(branch.lastSheetCount || 0),
      sheet_headers: Array.isArray(branch.sheetHeaders) ? branch.sheetHeaders : [],
      sheet_header_index: Number(branch.sheetHeaderIndex || 0)
    };
    if(includeProducts){
      payload.imported_products = (Array.isArray(branch.sheetPreviewProducts) && branch.sheetPreviewProducts.length)
        ? branch.sheetPreviewProducts.slice(0,50000)
        : ((Array.isArray(appState.products) && appState.products.length) ? appState.products.slice(0,50000) : []);
      payload.import_source = 'google-sheet-ui';
    }
    await httpJson(`/api/branches/${branchId}/sheet`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  }

  async function persistBranchSheetMetadataOnly(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index];
    if(!branch) return false;
    const branchId = Number(branch.id || 0);
    if(!branchId) throw new Error('La sucursal no tiene ID válido.');
    const payload = {
      sheet_id: String(branch.sheetUrl || '').trim(),
      sheet_name: String(branch.sheetName || 'Productos').trim(),
      source_type: 'google_sheet',
      sheet_map_rows: Array.isArray(branch.sheetMapRows) ? branch.sheetMapRows : null,
      sheet_headers: Array.isArray(branch.sheetHeaders) ? branch.sheetHeaders : [],
      sheet_header_index: Number(branch.sheetHeaderIndex || 0)
    };
    await httpJson(`/api/branches/${branchId}/sheet-metadata`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  }

  async function saveBranchSheetLink(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index];
    if(!branch) return;
    branch.sheetUrl = String(branch.sheetUrl||'').trim();
    branch.sheetName = String(branch.sheetName||'').trim();
    branch.sheetStatusText = 'Leyendo fila 1...';
    setBranchMetaStatus(branch, BRANCH_STATUS.LOADING, { loadingMessage:'Leyendo fila 1…', headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    appState.sheetConfig.lastMode = 'google';
    saveAdminState();
    renderSheetScreen();
    try{
      await readBranchHeaders(index);
      await persistBranchSheet(index, { includeProducts:false });
      setBranchMetaStatus(branch, getSheetBranchProductCount(branch) ? BRANCH_STATUS.IMPORTED : (branch.sheetHeaders.length ? BRANCH_STATUS.HEADERS_LOADED : BRANCH_STATUS.LINKED), { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
      contentStatus.textContent = 'Vinculación de sheet guardada en servidor.';
      renderSheetScreen();
    }catch(err){
      branch.sheetConnected = false;
      branch.sheetStatusText = err.message || 'No se pudieron leer encabezados';
      setBranchMetaStatus(branch, BRANCH_STATUS.ERROR, { error:branch.sheetStatusText, headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
      saveAdminState();
      renderSheetScreen();
      showToast(branch.sheetStatusText, 'error', 3800);
    }
  }

  function addSheetMapRow(index){
    const branch = appState.admin.branches[index]; if(!branch) return;
    branch.sheetMapRows.push({ id: uid('map'), field:'personalizado', label:'Encabezado', header:'' });
    saveAdminState(); renderSheetScreen();
  }
  function deleteSheetMapRow(index,rowId){
    const branch = appState.admin.branches[index]; if(!branch) return;
    branch.sheetMapRows = (branch.sheetMapRows||[]).filter(r=>r.id!==rowId);
    if(!branch.sheetMapRows.length) branch.sheetMapRows = defaultSheetMapRows();
    saveAdminState(); renderSheetScreen();
  }
  function moveSheetMapRow(index,rowId,dir){
    const branch = appState.admin.branches[index]; if(!branch) return;
    const rows = branch.sheetMapRows||[];
    const idx = rows.findIndex(r=>r.id===rowId); if(idx<0) return;
    const ni = idx + dir; if(ni<0 || ni>=rows.length) return;
    const tmp = rows[idx]; rows[idx]=rows[ni]; rows[ni]=tmp;
    saveAdminState(); renderSheetScreen();
  }
  async function saveBranchSheetMapping(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index]; if(!branch) return;
    const root = contentWrap.querySelector(`[data-sheet-branch="${index}"]`);
    if(!root) return;
    (branch.sheetMapRows||[]).forEach(row=>{
      const sel = root.querySelector(`[data-map-header="${row.id}"]`);
      const fld = root.querySelector(`[data-map-field="${row.id}"]`);
      const lbl = root.querySelector(`[data-map-label="${row.id}"]`);
      if(fld) row.field = fld.value;
      if(lbl) row.label = lbl.value;
      if(sel) row.header = sel.value;
    });
    branch.sheetStatusText = 'Mapeo guardado';
    setBranchMetaStatus(branch, getSheetBranchProductCount(branch) ? BRANCH_STATUS.IMPORTED : BRANCH_STATUS.MAPPED, { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    saveAdminState();
    if(!(typeof isLocalRuntimeForAuth === 'function' && isLocalRuntimeForAuth())){
      await persistBranchSheet(index, { includeProducts:false });
      contentStatus.textContent = 'Columnas de sheet guardadas en servidor.';
    }else{
      contentStatus.textContent = 'Columnas de sheet guardadas localmente.';
    }
    renderSheetScreen();
    showToast('Columnas visibles guardadas.', 'success');
  }

  async function saveBranchSheetCurrent(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index];
    if(!branch) return;
    appState.activeBranchIndex = index;
    if(appState.admin) appState.admin.activeBranch = index;

    const previousSourceSignature = getSheetSourceSignature(branch.sheetUrl || '', branch.sheetName || '');
    const previewBackup = Array.isArray(branch.sheetPreviewProducts) ? branch.sheetPreviewProducts.slice(0,50000) : [];
    const productsBackup = Array.isArray(appState.products) ? appState.products.slice(0,50000) : [];
    const filteredBackup = Array.isArray(appState.filtered) ? appState.filtered.slice(0,50000) : [];
    const selectedBackup = appState.selectedProduct ? { ...appState.selectedProduct } : null;

    const urlInput = contentWrap.querySelector(`[data-sheet-url="${index}"]`);
    const nameInput = contentWrap.querySelector(`[data-sheet-name="${index}"]`);
    if(urlInput) branch.sheetUrl = String(urlInput.value || '').trim();
    if(nameInput) branch.sheetName = String(nameInput.value || '').trim();
    const nextSourceSignature = getSheetSourceSignature(branch.sheetUrl || '', branch.sheetName || '');
    const sourceChanged = previousSourceSignature !== nextSourceSignature;
    const root = contentWrap.querySelector(`[data-sheet-branch="${index}"]`);
    if(root){
      (branch.sheetMapRows||[]).forEach(row=>{
        const sel = root.querySelector(`[data-map-header="${row.id}"]`);
        const fld = root.querySelector(`[data-map-field="${row.id}"]`);
        const lbl = root.querySelector(`[data-map-label="${row.id}"]`);
        if(fld) row.field = fld.value;
        if(lbl) row.label = lbl.value;
        if(sel) row.header = sel.value;
      });
    }

    if(sourceChanged){
      clearImportedProductsForBranch(index, { resetUi: appState.activeBranchIndex===index, clearHeaders:false });
      branch.sheetStatusText = 'Vinculación actualizada. Se conservaron los encabezados/mapeo guardados; vuelve a leer fila 1 si quieres revalidarlos antes de importar.';
      setBranchMetaStatus(branch, deriveBranchStatusAfterCleanup(branch), { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    }else{
      branch.sheetConnected = !!branch.sheetConnected || previewBackup.length > 0 || productsBackup.length > 0;
      branch.lastSheetCount = Number(branch.lastSheetCount || previewBackup.length || productsBackup.length || 0);
      branch.sheetStatusText = 'Cambios guardados';
      setBranchMetaStatus(branch, deriveBranchStatusAfterCleanup(branch), { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    }

    try{
      if(!(typeof isLocalRuntimeForAuth === 'function' && isLocalRuntimeForAuth())) await persistBranchSheetMetadataOnly(index);
      if(sourceChanged){
        setBranchMetaStatus(branch, deriveBranchStatusAfterCleanup(branch), { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
        renderProducts(appState.filtered || []);
        countProducts.textContent = (appState.products || []).length.toLocaleString('es-PE');
        renderViewerMenu();
    renderSheetDetailPreview();
        contentStatus.textContent = 'Guardado: se limpió la importación anterior de la sucursal.';
      }else{
        setBranchMetaStatus(branch, deriveBranchStatusAfterCleanup(branch), { headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
        // Restaurar SIEMPRE el estado visible. Este botón no debe tocar productos ni vista previa.
        branch.sheetPreviewProducts = previewBackup.slice(0,50000);
        setProductDataset(productsBackup.slice(0,50000));
        appState.filtered = sortProductsStable((filteredBackup.length ? filteredBackup : productsBackup).slice(0,50000));
        if(selectedBackup) appState.selectedProduct = selectedBackup;
        renderProducts(appState.filtered);
        countProducts.textContent = appState.products.length.toLocaleString('es-PE');
        renderSheetDetailPreview();
        contentStatus.textContent = 'Guardado: cambios de vinculación';
      }
    }catch(err){
      console.error(err);
      if(!sourceChanged){
        branch.sheetPreviewProducts = previewBackup.slice(0,50000);
        setProductDataset(productsBackup.slice(0,50000));
        appState.filtered = sortProductsStable((filteredBackup.length ? filteredBackup : productsBackup).slice(0,50000));
      }
      if(selectedBackup) appState.selectedProduct = selectedBackup;
      setBranchMetaStatus(branch, BRANCH_STATUS.ERROR, { error:err.message || 'No se pudieron guardar los cambios de vinculación.', headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
      renderProducts(appState.filtered);
      countProducts.textContent = appState.products.length.toLocaleString('es-PE');
      renderSheetDetailPreview();
      alert(err.message || 'No se pudieron guardar los cambios de vinculación.');
    }
  }

  function buildImportedLocation(rec, mode='main'){
    const isStore = mode === 'store';
    const direct = String(isStore ? (rec.almacen || '') : (rec.ubicacion || '')).trim();
    if(direct) return direct;
    const z = String(isStore ? (rec.zona2 || rec.zonaStore || '') : (rec.zona || '')).trim();
    const e = String(isStore ? (rec.estante2 || rec.estanteStore || '') : (rec.estante || '')).trim();
    const n = String(isStore ? (rec.nivel2 || rec.nivelStore || '') : (rec.nivel || '')).trim();
    const s = String(isStore ? (rec.slot2 || rec.slotStore || '') : (rec.slot || '')).trim();
    return [z,e?`E${String(e).replace(/^E/i,'')}`:'',n?`N${String(n).replace(/^N/i,'')}`:'',s?`S${String(s).replace(/^S/i,'')}`:''].filter(Boolean).join('-');
  }

  async function importBranchSheet(index){
    ensureBranchSheetFields();
    const branch = appState.admin.branches[index]; if(!branch) return;
    const url = String(branch.sheetUrl||'').trim(); const sheetName = String(branch.sheetName||'').trim();
    if(!url || !sheetName){ showToast('Completa la URL/ID del Sheet y el nombre de la hoja.', 'error', 3600); return; }
    const issues = validateBranchSheetSetup(branch).filter(msg => !/leer la fila 1/i.test(msg) || !!(branch.sheetHeaders && branch.sheetHeaders.length));
    const currentSourceSignature = getSheetSourceSignature(url, sheetName);
    const hadImportedProducts = (Array.isArray(branch.sheetPreviewProducts) && branch.sheetPreviewProducts.length) || Number(branch.lastSheetCount || 0) > 0 || (appState.activeBranchIndex===index && Array.isArray(appState.products) && appState.products.length);
    if(hadImportedProducts){
      const replaceOk = await openAppModal({ title:'Reemplazar importación', message:[`La sucursal ${branchLabel(branch, index)} ya tiene productos importados.`,`Se reemplazará la información anterior por la nueva importación.`], actions:[{label:'Cancelar', value:false, cls:'secondary'},{label:'Reemplazar', value:true, cls:'primary'}] });
      if(!replaceOk) return;
      clearImportedProductsForBranch(index, { resetUi: appState.activeBranchIndex===index, clearHeaders:false });
    }
    if(issues.length){ await openAppModal({ title:'Validación de hoja', message: issues, actions:[{label:'Entendido', value:true, cls:'secondary'}] }); return; }
    if(!branch.sheetHeaders || !branch.sheetHeaders.length) {
      branch.sheetStatusText = 'Leyendo fila 1...';
      setBranchMetaStatus(branch, BRANCH_STATUS.LOADING, { loadingMessage:'Leyendo fila 1…', headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
      saveAdminState(); renderSheetScreen();
      try { await readBranchHeaders(index); } catch(err){ setBranchMetaStatus(branch, BRANCH_STATUS.ERROR, { error:err.message||'No se pudieron leer encabezados', headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) }); showToast(err.message||'No se pudieron leer encabezados', 'error', 3800); return; }
    }
    await saveBranchSheetMapping(index);
    branch.sheetStatusText = 'Importando productos sin borrar el mapeo de columnas...';
    setBranchMetaStatus(branch, BRANCH_STATUS.LOADING, { loadingMessage:'Importando productos…', headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
    saveAdminState(); renderSheetScreen();
    try{
      const data = await httpJson(`/api/sheets/rows?url=${encodeURIComponent(url)}&sheet=${encodeURIComponent(sheetName)}&limit=50000`);
      const headers = Array.isArray(data.headers)?data.headers:[];
      const rows = Array.isArray(data.rows)?data.rows:[];
      const headerIndex = Number(data.headerIndex || branch.sheetHeaderIndex || 0);
      const totalRows = Number(data.totalRows || rows.length || 0);
      const normalizedLookup = {};
      headers.forEach((h,i)=>{ normalizedLookup[norm(h)] = i; });
      const idxByHeader = Object.fromEntries(headers.map((h,i)=>[h,i]));
      const aliasByField = {
        sku:['sku','codigo','código','cod modelo','cod / modelo','modelo'],
        nombre:['nombre','producto','descripcion','descripción','name'],
        variante:['variante','variant','linea'],
        talla:['talla','size'],
        color:['color','colour'],
        categoria:['categoria','categoría','category'],
        genero:['genero','género','gender'],
        imagen:['imagen','imagen 1','imagen1','image','image 1','image1','foto','foto 1','foto1','fotografia','fotografía','img','img 1','img1','image url','url imagen','url de imagen','link imagen','enlace imagen'],
        imagen2:['imagen 2','imagen2','image 2','image2','foto 2','foto2','img 2','img2','url imagen 2','image url 2','link imagen 2','enlace imagen 2'],
        imagen3:['imagen 3','imagen3','image 3','image3','foto 3','foto3','img 3','img3','url imagen 3','image url 3','link imagen 3','enlace imagen 3'],
        imagen4:['imagen 4','imagen4','image 4','image4','foto 4','foto4','img 4','img4','url imagen 4','image url 4','link imagen 4','enlace imagen 4'],
        imagen5:['imagen 5','imagen5','image 5','image5','foto 5','foto5','img 5','img5','url imagen 5','image url 5','link imagen 5','enlace imagen 5'],
        imagen6:['imagen 6','imagen6','image 6','image6','foto 6','foto6','img 6','img6','url imagen 6','image url 6','link imagen 6','enlace imagen 6'],
        fondo_card:['fondo card','fondo_card','background card','background_card','imagen fondo','imagen_fondo','fondo','background image','background','url fondo','link fondo'],
        barras:['barras','barra','barcode','codigo de barras'],
        almacen:['almacen','almacén','warehouse','ubicacion almacen','ubicación almacén','ubicacion en almacen','ubicación en almacén'],
        zona:['zona'],
        estante:['estante','rack'],
        nivel:['nivel'],
        slot:['slot','posicion','posición'],
        ubicacion:['ubicacion','ubicación','ubicacion final','location'],
        zona2:['zona 2','zona2','zona (2)','zona(2)','zona almacen','zona almacén'],
        estante2:['estante 2','estante2','estante (2)','estante(2)','rack 2','rack2','rack almacen'],
        nivel2:['nivel 2','nivel2','nivel (2)','nivel(2)','nivel almacen'],
        slot2:['slot 2','slot2','slot (2)','slot(2)','posicion 2','posición 2','slot almacen']
      };
      const getVal = (row, header)=> header && Object.prototype.hasOwnProperty.call(idxByHeader, header) ? String(row[idxByHeader[header]]||'').trim() : '';
      const getAliasVal = (row, field) => {
        const aliases = aliasByField[field] || [];
        for (const alias of aliases){
          const idx = normalizedLookup[norm(alias)];
          if(Number.isInteger(idx)){
            const value = String(row[idx] || '').trim();
            if(value) return value;
          }
        }
        return '';
      };
      const list = rows.map((row,ri)=>{
        const rec = {};
        const rawRecord = {};
        headers.forEach((h, hi) => { if(String(h||'').trim()) rawRecord[String(h).trim()] = String(row[hi] || '').trim(); });
        (branch.sheetMapRows||[]).forEach(m=>{ if(m.header && m.field) rec[m.field]=getVal(row,m.header); });
        ['sku','nombre','variante','talla','color','categoria','genero','imagen','imagen2','imagen3','imagen4','imagen5','imagen6','fondo_card','barras','almacen','zona','estante','nivel','slot','ubicacion','zona2','estante2','nivel2','slot2'].forEach(field=>{
          if(!String(rec[field]||'').trim()) rec[field] = getAliasVal(row, field);
        });
        const ubicacion = normalizeLocationCode(buildImportedLocation(rec, 'main'));
        const almacenRaw = normalizeLocationCode(buildImportedLocation(rec, 'store'));
        const mainParsed = parseLocationCode(ubicacion || buildImportedLocation(rec, 'main'), 'Z1-E1');
        const storeFallback = /^Z\d+/i.test(almacenRaw || '') ? 'Z1-E1' : 'ALM-E1';
        const storeParsed = parseLocationCode(almacenRaw || '', storeFallback);
        const sku = String(rec.sku || '').trim();
        const nombre = String(rec.nombre || '').trim();
        const variante = String(rec.variante || '').trim();
        const barras = String(rec.barras || '').trim();
        const imagen = String(rec.imagen || '').trim();
        const talla = String(rec.talla || '').trim();
        const color = String(rec.color || '').trim();
        const categoria = String(rec.categoria || readProductRawValue({ _raw: rawRecord }, ['categoria','categoría','category']) || '').trim();
        const genero = canonicalGenderValue(String(rec.genero || readProductRawValue({ _raw: rawRecord }, ['genero','género','gender']) || '').trim());
        const imagen2 = String(rec.imagen2 || '').trim();
        const imagen3 = String(rec.imagen3 || '').trim();
        const imagen4 = String(rec.imagen4 || '').trim();
        const imagen5 = String(rec.imagen5 || '').trim();
        const imagen6 = String(rec.imagen6 || '').trim();
        const imagenes = [imagen, imagen2, imagen3, imagen4, imagen5, imagen6].filter(Boolean);
        const fondo_card = String(rec.fondo_card || '').trim();
        const almacen = storeParsed.raw || almacenRaw || '';
        return {
          sku,
          nombre,
          variante,
          barras,
          imagen,
          imagen2,
          imagen3,
          imagen4,
          imagenes,
          fondo_card,
          talla,
          color,
          categoria,
          category: categoria,
          genero,
          gender: genero,
          ubicacion: mainParsed.raw || ubicacion,
          almacen,
          zona: mainParsed.zoneId,
          rack: mainParsed.rackId,
          nivel: mainParsed.level,
          slot: mainParsed.slot,
          zonaStore: storeParsed.zoneId,
          rackStore: storeParsed.rackId,
          nivelStore: storeParsed.level,
          slotStore: storeParsed.slot,
          _raw: rawRecord,
          _rowIndex:ri + headerIndex + 2
        };
      }).filter(p=>p.sku || p.nombre || p.barras || p.ubicacion || p.almacen);

      setProductDataset(list);
      appState.filtered = appState.products.slice();
      syncBranchLayoutWithProducts(index, list);
      appState.activeBranchIndex = index;
      branch.sheetPreviewProducts = list.slice(0, 50000);
      branch.lastImportedSourceSignature = currentSourceSignature;
      if(list[0]) selectProduct(list[0]); else appState.selectedProduct = null;
      renderProducts(appState.filtered);
      saveProductsLocal(index);
      branch.lastSheetCount = totalRows || list.length;
      branch.sheetConnected = true;
      branch.sheetStatusText = `Importados: ${list.length.toLocaleString('es-PE')} • detectados ${branch.lastSheetCount.toLocaleString('es-PE')}`;
      branch.lastImportAt = new Date().toISOString();
      branch.lastImportStatus = list.length ? 'success' : 'empty';
      branch.lastImportSource = 'google-sheet-ui';
      branch.lastImportError = '';
      setBranchMetaStatus(branch, BRANCH_STATUS.IMPORTED, { touchImportedAt:true, headerCount:getSheetBranchHeaderCount(branch), productCount:list.length });
      saveAdminState();
      if(!(typeof isLocalRuntimeForAuth === 'function' && isLocalRuntimeForAuth())){
        await persistBranchSheet(index, { includeProducts:true });
        await fetchProductsSummary(index);
        contentStatus.textContent = 'Productos importados y guardados en servidor.';
      }else{
        contentStatus.textContent = 'Productos importados y guardados localmente.';
      }
      renderSheetScreen();
      showToast(`Se importaron ${list.length.toLocaleString('es-PE')} productos.`, 'success', 3200);
    }catch(err){
      branch.sheetStatusText = err.message || 'Error al importar';
      branch.lastImportStatus = 'error';
      branch.lastImportError = branch.sheetStatusText;
      setBranchMetaStatus(branch, BRANCH_STATUS.ERROR, { error:branch.sheetStatusText, headerCount:getSheetBranchHeaderCount(branch), productCount:getSheetBranchProductCount(branch) });
      saveAdminState(); renderSheetScreen(); showToast(branch.sheetStatusText, 'error', 4000);
    }
  }

  function toggleSheetExpanded(){
    appState.ui.sheetExpanded = !appState.ui.sheetExpanded;
    appRoot.classList.toggle('sheet-expanded', !!appState.ui.sheetExpanded);
    if(appState.screen === 'sheet') renderSheetScreen();
  }

  function renderSheetScreen(){
    ensureAppRuntimeState();
    ensureBranchSheetFields();
    const openMap = getSheetBranchOpenMap();
    contentTitle.textContent='Vincular Google Sheet';
    contentSubtitle.textContent='Guarda la URL del Sheet, la hoja y elige qué columnas quieres usar por sucursal';
    setTags([]);
    contentTags.insertAdjacentHTML('beforeend', `<button type="button" class="btn primary" id="btnSheetSaveCurrent">Guardar cambios</button>`);
    renderSheetDetailPreview();
    const currentSheetIndex = getCurrentSheetBranchIndex();
    const currentSheetBranch = (appState.admin?.branches || [])[currentSheetIndex];
    if(currentSheetBranch && Array.isArray(currentSheetBranch.sheetPreviewProducts) && currentSheetBranch.sheetPreviewProducts.length){
      applyBranchProducts(currentSheetBranch.sheetPreviewProducts.slice(0,50000), currentSheetIndex);
      if(currentSheetBranch.sheetPreviewProducts[0]) appState.selectedProduct = currentSheetBranch.sheetPreviewProducts[0];
      countProducts.textContent = currentSheetBranch.sheetPreviewProducts.length.toLocaleString('es-PE');
    }

    contentWrap.innerHTML = `<div class="form-wrap" style="height:100%;display:flex;flex-direction:column"><div class="branches-panel" style="min-height:0;flex:1;border-radius:22px;background:linear-gradient(180deg,rgba(9,22,40,.78),rgba(6,16,30,.9));box-shadow:0 20px 46px rgba(0,0,0,.24)"><div class="branches-scroll" style="max-height:none;flex:1;padding:18px" id="sheetBranchesList">${appState.admin.branches.map((b,i)=>{
      const isOpen = !!openMap[i];
      const statusInfo = getSheetBranchStatusInfo(b);
      const statusClass = `${statusInfo.cls} ${statusInfo.key.toLowerCase()}`;
      const statusText = statusInfo.label;
      const helperText = String(b.sheetStatusText || '').trim();
      const helperHtml = helperText && helperText !== statusText ? `<div class="tiny muted sheet-helper-text">${escapeHtml(helperText)}</div>` : '';
      const importStamp = b.lastImportAt || ensureBranchMeta(b).lastImportedAt;
      const importBadge = b.lastImportStatus ? `<span>Estado importación: ${escapeHtml(String(b.lastImportStatus || '').toUpperCase())}</span>` : '';
      const sourceBadge = b.lastImportSource ? `<span>Origen: ${escapeHtml(b.lastImportSource)}</span>` : '';
      const metaHtml = `<div class="sheet-branch-submeta"><span>Headers: ${Number(getSheetBranchHeaderCount(b) || 0).toLocaleString('es-PE')}</span><span>Productos: ${Number(getSheetBranchProductCount(b) || 0).toLocaleString('es-PE')}</span><span>Última importación: ${escapeHtml(formatMetaDate(importStamp))}</span>${importBadge}${sourceBadge}</div>`;
      const headerOptions = ['<option value="">(Sin seleccionar)</option>'].concat(getSheetHeaderOptions(b).map(h=>`<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`)).join('');
      const rowsHtml = (b.sheetMapRows||[]).map((row,idx)=>`<div class="sheet-map-row" style="display:grid;grid-template-columns:140px 1fr 34px 34px 34px;gap:8px;align-items:center;margin-top:10px"><select data-map-field="${row.id}"><option value="sku" ${row.field==='sku'?'selected':''}>SKU</option><option value="nombre" ${row.field==='nombre'?'selected':''}>Nombre</option><option value="variante" ${row.field==='variante'?'selected':''}>Variante</option><option value="talla" ${row.field==='talla'?'selected':''}>Talla</option><option value="color" ${row.field==='color'?'selected':''}>Color</option><option value="categoria" ${row.field==='categoria'?'selected':''}>Categoría</option><option value="genero" ${row.field==='genero'?'selected':''}>Género</option><option value="imagen" ${row.field==='imagen'?'selected':''}>Imagen 1</option><option value="imagen2" ${row.field==='imagen2'?'selected':''}>Imagen 2</option><option value="imagen3" ${row.field==='imagen3'?'selected':''}>Imagen 3</option><option value="imagen4" ${row.field==='imagen4'?'selected':''}>Imagen 4</option><option value="imagen5" ${row.field==='imagen5'?'selected':''}>Imagen 5</option><option value="imagen6" ${row.field==='imagen6'?'selected':''}>Imagen 6</option><option value="fondo_card" ${row.field==='fondo_card'?'selected':''}>Fondo card</option><option value="ubicacion" ${row.field==='ubicacion'?'selected':''}>Ubicación</option><option value="barras" ${row.field==='barras'?'selected':''}>Código de barras</option><option value="almacen" ${row.field==='almacen'?'selected':''}>Almacén</option><option value="zona" ${row.field==='zona'?'selected':''}>Zona</option><option value="estante" ${row.field==='estante'?'selected':''}>Estante</option><option value="nivel" ${row.field==='nivel'?'selected':''}>Nivel</option><option value="slot" ${row.field==='slot'?'selected':''}>Slot</option><option value="personalizado" ${row.field==='personalizado'?'selected':''}>Personalizado</option></select><select data-map-header="${row.id}">${headerOptions.replace(`value="${escapeHtml(row.header||'')}"`,`value="${escapeHtml(row.header||'')}" selected`)}</select><button class="tiny-btn" data-map-up="${i}:${row.id}">↑</button><button class="tiny-btn" data-map-down="${i}:${row.id}">↓</button><button class="tiny-btn" data-map-del="${i}:${row.id}">✕</button></div>`).join('');
      const isBusy = statusInfo.key === BRANCH_STATUS.LOADING;
      return `<div class="sheet-branch-card ${isOpen?'open':''}" data-sheet-branch="${i}"><div class="sheet-branch-head" data-sheet-toggle="${i}"><span class="sheet-branch-dot" style="background:${escapeHtml(b.color||(ZONE_COLOR_PALETTE[0] || '#ffd84d'))}"></span><div><div style="font-weight:800">${escapeHtml(b.name||('Sucursal '+(i+1)))}</div><div class="tiny muted">${escapeHtml((b.type||'tienda').toUpperCase())}</div>${helperHtml}</div><div class="sheet-branch-meta"><span class="status-badge ${statusClass}" data-status="${statusInfo.key}">${escapeHtml(statusText)}</span><button class="tiny-btn" type="button">${isOpen?'−':'+'}</button></div></div><div class="sheet-branch-body"><div class="sheet-branch-grid"><div class="grid"><label>URL / ID del Sheet</label><input data-sheet-url="${i}" placeholder="https://docs.google.com/spreadsheets/d/..." value="${escapeHtml(b.sheetUrl||'')}"></div><div class="grid"><label>Nombre de la hoja</label><input data-sheet-name="${i}" placeholder="Ej: Productos" value="${escapeHtml(b.sheetName||'Productos')}"></div></div><div class="sheet-actions"><button class="btn primary" data-sheet-save="${i}" ${isBusy?'disabled':''}>Leer fila 1</button><button class="btn secondary" data-sheet-import="${i}" ${isBusy?'disabled':''}>Importar productos</button><button class="btn secondary" data-sheet-clear-products="${i}" ${isBusy?'disabled':''}>Limpiar productos</button></div>${metaHtml}<div class="sheet-mini-preview"><div class="tiny muted">Paso 2 • Encabezados disponibles en la fila 1</div><div class="sheet-preview-row">${getSheetHeaderOptions(b).length ? getSheetHeaderOptions(b).map(h=>`<span class="sheet-preview-chip">${escapeHtml(h)}</span>`).join('') : '<span class="tiny muted">Aún no se leyeron encabezados.</span>'}</div><div style="margin-top:16px"><div class="sheet-actions" style="justify-content:flex-start"><button class="btn secondary" data-sheet-add-header="${i}">+ Encabezado</button><span class="tiny muted">Paso 3 • Elige qué columnas usar para producto, ubicación e imágenes</span></div>${rowsHtml}<div class="sheet-actions"><button class="btn secondary" data-sheet-map-save="${i}">Guardar columnas visibles</button></div></div></div></div></div>`;
    }).join('')}</div></div></div>`;

    contentWrap.querySelectorAll('[data-sheet-toggle]').forEach(el=>el.onclick=async (e)=>{ const i=+e.currentTarget.dataset.sheetToggle; const wasOpen=!!openMap[i]; Object.keys(openMap).forEach(k=>{openMap[k]=false;}); openMap[i]=!wasOpen; if(openMap[i]){ await activateBranchSelection(i); } renderSheetScreen(); });
    contentWrap.querySelectorAll('[data-sheet-url]').forEach(el=>{
      el.oninput=(e)=>{ const idx=+e.target.dataset.sheetUrl; appState.admin.branches[idx].sheetUrl=e.target.value; };
      el.onchange=(e)=>{ const idx=+e.target.dataset.sheetUrl; appState.admin.branches[idx].sheetUrl=e.target.value; markBranchDirty(idx); saveAdminState(); renderSheetScreen(); };
    });
    contentWrap.querySelectorAll('[data-sheet-name]').forEach(el=>{
      el.oninput=(e)=>{ const idx=+e.target.dataset.sheetName; appState.admin.branches[idx].sheetName=e.target.value; };
      el.onchange=(e)=>{ const idx=+e.target.dataset.sheetName; appState.admin.branches[idx].sheetName=e.target.value; markBranchDirty(idx); saveAdminState(); renderSheetScreen(); };
    });
    contentWrap.querySelectorAll('[data-sheet-save]').forEach(el=>el.onclick=(e)=>saveBranchSheetLink(+e.currentTarget.dataset.sheetSave));
    contentWrap.querySelectorAll('[data-sheet-import]').forEach(el=>el.onclick=(e)=>importBranchSheet(+e.currentTarget.dataset.sheetImport));
    contentWrap.querySelectorAll('[data-sheet-clear-products]').forEach(el=>el.onclick=(e)=>clearBranchImportedData(+e.currentTarget.dataset.sheetClearProducts,'products'));
        contentWrap.querySelectorAll('[data-sheet-map-save]').forEach(el=>el.onclick=(e)=>saveBranchSheetMapping(+e.currentTarget.dataset.sheetMapSave));
    contentWrap.querySelectorAll('[data-sheet-add-header]').forEach(el=>el.onclick=(e)=>addSheetMapRow(+e.currentTarget.dataset.sheetAddHeader));
    contentWrap.querySelectorAll('[data-map-del]').forEach(el=>el.onclick=(e)=>{ const [i,id] = e.currentTarget.dataset.mapDel.split(':'); deleteSheetMapRow(+i,id); });
    contentWrap.querySelectorAll('[data-map-up]').forEach(el=>el.onclick=(e)=>{ const [i,id] = e.currentTarget.dataset.mapUp.split(':'); moveSheetMapRow(+i,id,-1); });
    contentWrap.querySelectorAll('[data-map-down]').forEach(el=>el.onclick=(e)=>{ const [i,id] = e.currentTarget.dataset.mapDown.split(':'); moveSheetMapRow(+i,id,1); });
    contentWrap.querySelectorAll('[data-map-field],[data-map-header]').forEach(el=>el.onchange=(e)=>{
      const card=e.target.closest('[data-sheet-branch]');
      const idx=card?Number(card.dataset.sheetBranch):-1;
      if(idx<0) return;
      const branch = appState.admin.branches[idx];
      if(!branch) return;
      const rowId = e.target.dataset.mapField || e.target.dataset.mapHeader;
      const row = (branch.sheetMapRows||[]).find(item => item.id === rowId);
      if(row){
        if(e.target.dataset.mapField) row.field = e.target.value;
        if(e.target.dataset.mapHeader) row.header = e.target.value;
      }
      markBranchDirty(idx);
      saveAdminState();
      renderSheetScreen();
    });
    const btnSheetExpand = document.getElementById('btnSheetExpand');
    if(btnSheetExpand) btnSheetExpand.onclick = toggleSheetExpanded;
    const btnExportConfig = document.getElementById('btnExportConfig'); if(btnExportConfig) btnExportConfig.onclick = exportAdminConfig;
    const btnImportConfig = document.getElementById('btnImportConfig'); if(btnImportConfig) btnImportConfig.onclick = triggerImportConfig;
    const btnSheetSaveCurrent = document.getElementById('btnSheetSaveCurrent');
    if(btnSheetSaveCurrent) btnSheetSaveCurrent.onclick = async ()=>{ const idx = getCurrentSheetBranchIndex(); await saveBranchSheetCurrent(idx); };
  }


  function buildDashboardData(){
    const products = Array.isArray(appState.filtered) && appState.filtered.length ? appState.filtered : (appState.products || []);
    const racks = appState.layout?.racks || [];
    const zones = appState.layout?.zones || [];
    const byRack = new Map();
    products.forEach(p => {
      const rid = p?.rack || p?.rackStore || '';
      if(!rid) return;
      byRack.set(rid, (byRack.get(rid) || 0) + 1);
    });
    const rackStats = racks.map(r => {
      const model = rackModel(r.modelId) || {};
      const capacity = getRackCapacity(model);
      const occupied = byRack.get(r.id) || 0;
      return {
        id: r.id,
        zoneId: r.zoneId || '—',
        model: model.name || r.modelId || '—',
        capacity,
        occupied,
        free: Math.max(0, capacity - occupied),
        occupancy: Math.min(100, capacity ? (occupied / capacity) * 100 : 0)
      };
    }).sort((a,b) => b.occupancy - a.occupancy || b.occupied - a.occupied || String(a.id).localeCompare(String(b.id)));
    const zoneStats = zones.map(z => {
      const zr = rackStats.filter(r => r.zoneId === z.id);
      const slots = zr.reduce((s,r) => s + r.capacity, 0);
      const occupied = zr.reduce((s,r) => s + r.occupied, 0);
      return {
        id: z.id,
        name: z.name || z.id,
        racks: zr.length,
        slots,
        occupied,
        free: Math.max(0, slots - occupied),
        occupancy: slots ? (occupied / slots) * 100 : 0
      };
    }).sort((a,b) => b.occupancy - a.occupancy || String(a.id).localeCompare(String(b.id)));
    const totalSlots = rackStats.reduce((s,r) => s + r.capacity, 0);
    const occupiedSlots = rackStats.reduce((s,r) => s + r.occupied, 0);
    const freeSlots = Math.max(0, totalSlots - occupiedSlots);
    const skuCount = new Set(products.map(p => (p.sku || '').trim()).filter(Boolean)).size;
    const noRack = products.filter(p => !(p?.rack || p?.rackStore)).length;
    const racksNoLoad = rackStats.filter(r => r.occupied === 0).length;
    const topZone = zoneStats[0] || null;
    const fullestRack = rackStats[0] || null;
    return {
      products,
      racks,
      zones,
      skuCount,
      totalProducts: products.length,
      totalRacks: racks.length,
      totalZones: zones.length,
      totalSlots,
      occupiedSlots,
      freeSlots,
      occPct: totalSlots ? (occupiedSlots / totalSlots) * 100 : 0,
      noRack,
      racksNoLoad,
      topZone,
      fullestRack,
      zoneStats,
      rackStats
    };
  }

  function dashboardBarClass(value){
    if(value >= 85) return 'down';
    if(value >= 65) return 'warn';
    return 'good';
  }

  function renderDashboard(){
    setUnifiedMapLayout(false);
    const data = buildDashboardData();
    const selectedRackId = appState.selectedRackLayoutId || appState.selectedRack || data.rackStats[0]?.id || appState.layout?.racks?.[0]?.id || '';
    const selectedRack = findRackById(selectedRackId) || appState.layout?.racks?.[0] || null;
    const selectedZone = findZoneById(appState.selectedZoneId) || (selectedRack ? findZoneById(selectedRack.zoneId) : null) || appState.layout?.zones?.[0] || null;
    if(selectedRack && !appState.selectedRackLayoutId) appState.selectedRackLayoutId = selectedRack.id;
    if(selectedZone && !appState.selectedZoneId) appState.selectedZoneId = selectedZone.id;

    contentTitle.textContent = 'Dashboard WMS';
    const branchIdx = getActiveBranchContextIndex();
    const branchName = appState.admin?.branches?.[branchIdx]?.name || 'Sucursal activa';
    contentSubtitle.textContent = `Resumen operativo de ${branchName} con ocupación, alertas y foco rápido.`;
    setTags([`Sucursal: ${branchName}`, 'KPI', 'ocupación', 'alertas', 'racks', 'zonas']);

    const kpis = [
      { label:'Productos analizados', value:data.totalProducts.toLocaleString('es-PE'), foot:`${data.skuCount.toLocaleString('es-PE')} SKU únicos`, trend:'up', trendText:'Inventario' },
      { label:'Capacidad total', value:data.totalSlots.toLocaleString('es-PE'), foot:`${data.freeSlots.toLocaleString('es-PE')} slots libres`, trend:data.freeSlots ? 'up' : 'down', trendText:data.freeSlots ? 'Disponible' : 'Lleno' },
      { label:'Ocupación general', value:`${Math.round(data.occPct)}%`, foot:`${data.occupiedSlots.toLocaleString('es-PE')} ocupados`, trend:dashboardBarClass(data.occPct), trendText:data.occPct >= 85 ? 'Crítico' : data.occPct >= 65 ? 'Atención' : 'Saludable' },
      { label:'Calidad de datos', value:`${data.noRack}`, foot:'productos sin rack', trend:data.noRack ? 'warn' : 'up', trendText:data.noRack ? 'Revisar' : 'OK' }
    ];

    const alerts = [];
    if(data.noRack) alerts.push({ cls:'warn', title:'Productos sin ubicación', text:`Hay ${data.noRack} productos sin rack asignado.` });
    if(data.fullestRack && data.fullestRack.occupancy >= 90) alerts.push({ cls:'down', title:'Rack casi saturado', text:`${data.fullestRack.id} está al ${Math.round(data.fullestRack.occupancy)}% de ocupación.` });
    if(data.racksNoLoad) alerts.push({ cls:'good', title:'Racks disponibles', text:`${data.racksNoLoad} racks no tienen carga y pueden recibir productos.` });
    if(!alerts.length) alerts.push({ cls:'good', title:'Sin alertas críticas', text:'La estructura actual no muestra bloqueos evidentes.' });

    contentWrap.innerHTML = `
      <div class="dashboard-grid">
        ${kpis.map(k => `<div class="dashboard-card kpi-card"><span class="tiny muted">${k.label}</span><b>${k.value}</b><div class="kpi-foot"><span>${k.foot}</span><span class="kpi-trend ${k.trend}">${k.trendText}</span></div></div>`).join('')}
        <div class="dashboard-card wide tall">
          <h4>Ocupación por zona</h4>
          <span class="tiny muted">Haz clic para enfocar una zona.</span>
          <div class="dash-zone-grid" style="margin-top:12px;">
            ${data.zoneStats.map(zone => `<button class="dash-zone-card ${selectedZone?.id===zone.id?'active':''}" data-dash-zone="${zone.id}" type="button"><div class="dash-progress-head"><b>${escapeHtml(zone.id)}</b><span>${Math.round(zone.occupancy)}%</span></div><div class="dash-bar ${dashboardBarClass(zone.occupancy)}"><span style="width:${Math.max(4, Math.min(100, zone.occupancy))}%"></span></div><div class="dash-mini-kv"><span>${zone.racks} racks</span><span>${zone.occupied}/${zone.slots} slots</span></div></button>`).join('') || `<div class="empty">No hay zonas cargadas.</div>`}
          </div>
        </div>
        <div class="dashboard-card wide tall">
          <h4>Racks con mayor ocupación</h4>
          <span class="tiny muted">Selecciona uno para verlo en detalle.</span>
          <div class="dash-top-list" style="margin-top:12px;">
            ${data.rackStats.slice(0,8).map(rack => `<button class="dash-top-item ${selectedRackId===rack.id?'active':''}" type="button" data-dash-rack="${rack.id}"><div class="dash-top-head"><b>${escapeHtml(rack.id)}</b><span>${Math.round(rack.occupancy)}%</span></div><div class="dash-bar ${dashboardBarClass(rack.occupancy)}"><span style="width:${Math.max(4, Math.min(100, rack.occupancy))}%"></span></div><div class="dash-top-meta"><span>${escapeHtml(rack.zoneId)} · ${escapeHtml(rack.model)}</span><span>${rack.occupied}/${rack.capacity}</span></div></button>`).join('') || `<div class="empty">No hay racks cargados.</div>`}
          </div>
        </div>
        <div class="dashboard-card wide">
          <h4>Alertas operativas</h4>
          <div class="dash-alert-list" style="margin-top:12px;">
            ${alerts.map(a => `<div class="dash-alert-item ${a.cls}"><b>${a.title}</b><span class="tiny muted">${a.text}</span></div>`).join('')}
          </div>
        </div>
        <div class="dashboard-card wide">
          <h4>Resumen rápido</h4>
          <div class="dash-alert-list" style="margin-top:12px;">
            <div class="dash-alert-item good"><b>Zonas activas</b><span class="tiny muted">${data.totalZones} zonas y ${data.totalRacks} racks modelados.</span></div>
            <div class="dash-alert-item ${dashboardBarClass(data.occPct)}"><b>Ocupación total</b><span class="tiny muted">${data.occupiedSlots} ocupados de ${data.totalSlots} slots.</span></div>
            <div class="dash-alert-item ${data.topZone ? dashboardBarClass(data.topZone.occupancy) : 'good'}"><b>Zona más exigida</b><span class="tiny muted">${data.topZone ? `${escapeHtml(data.topZone.id)} al ${Math.round(data.topZone.occupancy)}%` : 'Sin datos'}</span></div>
            <div class="dash-alert-item ${data.noRack ? 'warn' : 'good'}"><b>Integridad</b><span class="tiny muted">${data.noRack ? `${data.noRack} productos requieren ubicación.` : 'Todos los productos visibles tienen rack.'}</span></div>
          </div>
        </div>
      </div>`;

    detailTitle.textContent = selectedRack ? `Rack ${selectedRack.id}` : 'Detalle de rack';
    detailSubtitle.textContent = selectedRack ? `Zona ${selectedRack.zoneId || '—'} • Vista rápida del rack seleccionado` : 'Selecciona una zona o rack desde el dashboard.';
    detailWrap.innerHTML = `
      <div class="dash-detail-grid">
        <div class="dash-svg-wrap"><svg id="dashboardRackSvg" viewBox="-230 -310 470 520"></svg></div>
        <div class="dash-alert-list">
          <div class="dash-alert-item ${selectedRack ? dashboardBarClass((data.rackStats.find(r=>r.id===selectedRack.id)?.occupancy)||0) : 'good'}"><b>Rack activo</b><span class="tiny muted">${selectedRack ? `${escapeHtml(selectedRack.id)} • ${escapeHtml(selectedRack.zoneId || '—')}` : 'No hay rack seleccionado.'}</span></div>
          <div class="dash-alert-item good"><b>Modelo</b><span class="tiny muted">${selectedRack ? escapeHtml((rackModel(selectedRack.modelId)||{}).name || selectedRack.modelId || '—') : '—'}</span></div>
          <div class="dash-alert-item good"><b>Capacidad</b><span class="tiny muted">${selectedRack ? (()=>{ const s = data.rackStats.find(r=>r.id===selectedRack.id); return s ? `${s.capacity} slots • ${s.occupied} ocupados` : '—'; })() : '—'}</span></div>
          <div class="dash-alert-item ${selectedZone ? dashboardBarClass((data.zoneStats.find(z=>z.id===selectedZone.id)?.occupancy)||0) : 'good'}"><b>Zona enfocada</b><span class="tiny muted">${selectedZone ? `${escapeHtml(selectedZone.id)} • ${(data.zoneStats.find(z=>z.id===selectedZone.id)?.racks)||0} racks` : '—'}</span></div>
        </div>
      </div>`;

    const dashSvg = document.getElementById('dashboardRackSvg');
    if(dashSvg && selectedRack){
      const stat = data.rackStats.find(r => r.id === selectedRack.id);
      const level = stat?.occupied ? 1 : 0;
      renderRackDetail(selectedRack.id, { nivel: level, slot: stat?.occupied ? 1 : 0, label:'Rack activo', fullLabel:selectedRack.id }, dashSvg, rackModel(selectedRack.modelId), selectedRack);
    }

    contentStatus.textContent = `Dashboard listo • ${data.totalProducts.toLocaleString('es-PE')} productos analizados`;
    contentFootRight.textContent = selectedZone ? `${selectedZone.id} • ${Math.round((data.zoneStats.find(z=>z.id===selectedZone.id)?.occupancy)||0)}% ocupación` : '—';
    detailStatus.textContent = selectedRack ? `${selectedRack.id} • ${(data.rackStats.find(r=>r.id===selectedRack.id)?.occupied)||0} ocupados` : 'Sin rack seleccionado';
    detailChip.textContent = selectedRack ? `${(data.rackStats.find(r=>r.id===selectedRack.id)?.capacity)||0} slots` : '—';

    contentWrap.querySelectorAll('[data-dash-zone]').forEach(btn => btn.addEventListener('click', () => {
      appState.selectedZoneId = btn.dataset.dashZone;
      const firstRack = appState.layout.racks.find(r => r.zoneId === appState.selectedZoneId);
      if(firstRack) appState.selectedRackLayoutId = firstRack.id;
      renderDashboard();
    }));
    contentWrap.querySelectorAll('[data-dash-rack]').forEach(btn => btn.addEventListener('click', () => {
      const rackId = btn.dataset.dashRack;
      appState.selectedRackLayoutId = rackId;
      const rack = findRackById(rackId);
      if(rack?.zoneId) appState.selectedZoneId = rack.zoneId;
      renderDashboard();
    }));
  }


  function getViewerProductLocationContext(product = appState.selectedProduct){
    const layoutBranchIndex = getActiveLayoutBranchIndex();
    const branches = appState.admin?.branches || [];
    const activeBranch = branches[layoutBranchIndex] || branches[getActiveSheetBranchIndex()] || null;
    const rackIdsInLayout = new Set((appState.layout?.racks || []).map(r => r.id));
    const selectedProd = product || null;
    const productMatchesLayout = selectedProd && (
      (selectedProd.rack && rackIdsInLayout.has(selectedProd.rack)) ||
      (selectedProd.rackStore && rackIdsInLayout.has(selectedProd.rackStore))
    );
    const prod = productMatchesLayout ? selectedProd : selectedProd;
    const primaryRackId = (selectedProd?.rack && rackIdsInLayout.has(selectedProd.rack) ? selectedProd.rack : '') || (appState.selectedRack && rackIdsInLayout.has(appState.selectedRack) ? appState.selectedRack : '') || appState.layout.racks[0]?.id || '';
    const storeRackId = (selectedProd?.rackStore && rackIdsInLayout.has(selectedProd.rackStore) ? selectedProd.rackStore : '') || primaryRackId;
    const primaryLoc = selectedProd?.ubicacion || primaryRackId || '—';
    const storeLoc = selectedProd?.almacen || storeRackId || '—';
    return { layoutBranchIndex, activeBranch, rackIdsInLayout, prod, productMatchesLayout, primaryRackId, storeRackId, primaryLoc, storeLoc };
  }

  function renderIsoLocationSvg(svg, prod = appState.selectedProduct){
    if(!svg) return;
    svg.innerHTML = '';
    const defs = svgEl('defs');
    const glow = svgEl('filter',{id:'mapGlowLocationModal',x:'-40%',y:'-40%',width:'180%',height:'180%'});
    glow.appendChild(svgEl('feDropShadow',{dx:'0',dy:'0',stdDeviation:'10','flood-color':'#50e37b','flood-opacity':'.55'}));
    defs.appendChild(glow); svg.appendChild(defs);
    const root = svgEl('g',{id:'locationModalMapRoot',transform:'translate(0 0) scale(1)'}); svg.appendChild(root);

    const bounds = getLayoutContentBounds();
    const padX = Math.max(280, bounds.w * 0.22);
    const padY = Math.max(280, bounds.h * 0.22);
    const floorRect = { x: bounds.x - padX, y: bounds.y - padY, w: bounds.w + padX * 2, h: bounds.h + padY * 2 };
    const floor = face([
      toIso(floorRect.x, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y + floorRect.h, 0),
      toIso(floorRect.x, floorRect.y + floorRect.h, 0)
    ],{fill:'rgba(255,255,255,.025)',stroke:'rgba(255,255,255,.08)','stroke-width':'2'});
    root.appendChild(floor);
    const isoGrid = svgEl('g',{opacity:'.36'});
    const gridStep = Math.max(4, getSnapSize() * 2);
    for(let gx = Math.floor(floorRect.x / gridStep) * gridStep; gx <= floorRect.x + floorRect.w; gx += gridStep){
      const a = toIso(gx, floorRect.y, 0); const b = toIso(gx, floorRect.y + floorRect.h, 0);
      isoGrid.appendChild(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'rgba(120,162,210,.22)','stroke-width':'1'}));
    }
    for(let gy = Math.floor(floorRect.y / gridStep) * gridStep; gy <= floorRect.y + floorRect.h; gy += gridStep){
      const a = toIso(floorRect.x, gy, 0); const b = toIso(floorRect.x + floorRect.w, gy, 0);
      isoGrid.appendChild(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'rgba(120,162,210,.22)','stroke-width':'1'}));
    }
    root.appendChild(isoGrid);

    let projected = [
      toIso(floorRect.x, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y + floorRect.h, 0),
      toIso(floorRect.x, floorRect.y + floorRect.h, 0)
    ];
    (appState.layout?.zones || []).forEach(z => {
      const pts = z.pts.map(p => toIso(p.x, p.y, 0));
      projected.push(...pts);
      const isMainZone = prod?.zona === z.id;
      const isStoreZone = prod?.zonaStore === z.id;
      const isSearchZone = (prod?.zona || prod?.zonaStore) === z.id;
      const zoneColor = z.color || getBranchColor(getActiveLayoutBranchIndex()) || '#ffd84d';
      const path = svgEl('path',{d:`M ${pts.map(pt => `${pt.x} ${pt.y}`).join(' L ')} Z`,class:'zone-floor' + (isMainZone ? ' active' : '') + (isStoreZone ? ' storage' : '') + (isSearchZone ? ' search-focus' : ''),fill:hexToRgba(zoneColor, isSearchZone ? 0.30 : 0.22),stroke:hexToRgba(zoneColor, isSearchZone ? 0.98 : 0.92),'stroke-width':isSearchZone ? '2.8' : '2.1'});
      root.appendChild(path);
      const c = centroid(z.pts); const ci = toIso(c.x,c.y,0);
      projected.push(ci);
      const label = svgEl('text',{x:ci.x,y:ci.y,class:'zone-label','text-anchor':'middle'}); label.textContent = z.id; root.appendChild(label);
    });
    const racks = (appState.layout?.racks || []).slice().sort((a,b)=>(a.x+a.y+Number(a.baseHeight||0))-(b.x+b.y+Number(b.baseHeight||0)));
    racks.forEach(r => {
      const rackGroup = buildIsoRack(r, prod);
      root.appendChild(rackGroup.group);
      if(Array.isArray(rackGroup.projectedPoints)) projected.push(...rackGroup.projectedPoints);
    });
    if(projected.length){
      const minX = Math.min(...projected.map(p => p.x)); const maxX = Math.max(...projected.map(p => p.x));
      const minY = Math.min(...projected.map(p => p.y)); const maxY = Math.max(...projected.map(p => p.y));
      const padVX = Math.max(80, (maxX - minX) * 0.12); const padVY = Math.max(80, (maxY - minY) * 0.16);
      svg.setAttribute('viewBox', `${Math.floor(minX - padVX)} ${Math.floor(minY - padVY)} ${Math.ceil((maxX - minX) + padVX * 2)} ${Math.ceil((maxY - minY) + padVY * 2)}`);
    }
    enablePanZoom(svg, root, focusBoundsForProduct(prod), { tx:0, ty:0, scale:1.25 });
  }



  function getRackRenderHeight3D(r){
    const model = appState.models.find(m => m.id === r.modelId) || appState.models[0] || {};
    return Math.max(50, Number(r.rackHeight || model.height || 180) * 0.65);
  }

  function getScene3DBounds(){
    const pts = [];
    (appState.layout?.zones || []).forEach(z => (z.pts || []).forEach(pt => pts.push({x:Number(pt.x)||0,y:Number(pt.y)||0})));
    (appState.layout?.racks || []).forEach(r => {
      const x=Number(r.x)||0, y=Number(r.y)||0, w=Math.max(10,Number(r.w)||80), d=Math.max(10,Number(r.h)||40);
      pts.push({x,y},{x:x+w,y},{x:x+w,y:y+d},{x,y:y+d});
    });
    if(!pts.length) pts.push({x:-200,y:-160},{x:200,y:160});
    const minX = Math.min(...pts.map(p=>p.x)), maxX = Math.max(...pts.map(p=>p.x));
    const minY = Math.min(...pts.map(p=>p.y)), maxY = Math.max(...pts.map(p=>p.y));
    return { minX, maxX, minY, maxY, w:Math.max(1,maxX-minX), h:Math.max(1,maxY-minY), cx:(minX+maxX)/2, cy:(minY+maxY)/2 };
  }


  function productHasValidLocation(product){
    const p = product || {};
    return !!String(p.ubicacion || p.location || '').trim();
  }

  function isProbablyUrl(value){
    const v = String(value || '').trim();
    if(!v) return false;
    if(/^https?:\/\//i.test(v)) return true;
    if(/^data:image\//i.test(v)) return true;
    if(/^\/\//.test(v)) return true;
    if(/^\/[^\s]+\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(v)) return true;
    return false;
  }

  function getProductLocationIssue(product, mode='primary'){
    const p = product || {};
    const loc = String(mode === 'store' ? (p.almacen || '') : (p.ubicacion || '')).trim();
    if(!loc) return mode === 'store' ? 'Sin ubicación de almacén' : 'Sin ubicación';
    const parsed = mode === 'store'
      ? parseLocationCode(loc, /^Z\d+/i.test(loc) ? 'Z1-E1' : 'ALM-E1')
      : parseLocationCode(loc, 'Z1-E1');
    const rackId = mode === 'store' ? (p.rackStore || parsed.rackId || '') : (p.rack || parsed.rackId || '');
    if(rackId && !findRackById(rackId)) return `Rack no existe: ${rackId}`;
    if(rackId){
      const rack = findRackById(rackId);
      const model = rack ? (appState.models.find(m => m.id === rack.modelId) || appState.models[0] || {}) : {};
      const levels = Math.max(1, Number(model.levels || 4));
      const slots = Math.max(1, Number(model.slots || 2));
      const level = Number(mode === 'store' ? (p.nivelStore || parsed.level || 0) : (p.nivel || parsed.level || 0));
      const slot = Number(mode === 'store' ? (p.slotStore || parsed.slot || 0) : (p.slot || parsed.slot || 0));
      if(level && (level < 1 || level > levels)) return `Nivel fuera de rango: N${level} / máximo N${levels}`;
      if(slot && (slot < 1 || slot > slots)) return `Slot fuera de rango: S${slot} / máximo S${slots}`;
    }
    return '';
  }

  function analyzeInventoryData(){
    const products = Array.isArray(appState.products) ? appState.products : [];
    const racks = Array.isArray(appState.layout?.racks) ? appState.layout.racks : [];
    const zones = Array.isArray(appState.layout?.zones) ? appState.layout.zones : [];
    const counters = {
      total:products.length,
      missingName:0,
      missingSku:0,
      missingBarcode:0,
      missingCategory:0,
      missingGender:0,
      missingImage:0,
      invalidImage:0,
      missingLocation:0,
      missingStoreLocation:0,
      badLocation:0,
      badStoreLocation:0,
      rackMissing:0,
      duplicateSku:0,
      duplicateBarcode:0,
      emptyRacks:0,
      occupiedRacks:0,
      overCapacityRacks:0,
      racksTotal:racks.length,
      zonesTotal:zones.length
    };
    const issues = [];
    const skuMap = new Map();
    const barcodeMap = new Map();
    const rackUsage = new Map(racks.map(r => [r.id, { id:r.id, products:0, capacity:0, zoneId:r.zoneId || '', overflow:0 }]));
    const zoneUsage = new Map(zones.map(z => [z.id, { id:z.id, name:z.name || z.id, products:0, racks:0 }]));
    racks.forEach(r => {
      const model = appState.models.find(m => m.id === r.modelId) || appState.models[0] || {};
      const capacity = Math.max(1, Number(model.levels || 4)) * Math.max(1, Number(model.slots || 2));
      const item = rackUsage.get(r.id);
      if(item) item.capacity = capacity;
      const z = zoneUsage.get(r.zoneId);
      if(z) z.racks += 1;
    });
    const addIssue = (severity, type, detail, product=null, extra={}) => {
      const row = product?._rowIndex || extra.row || '—';
      const sku = String(product?.sku || extra.sku || '').trim() || '—';
      const name = String(product?.nombre || extra.name || '').trim() || '—';
      issues.push({ severity, row, sku, name, type, detail, ...extra });
    };
    products.forEach((p, idx) => {
      const sku = String(p?.sku || '').trim();
      const barcode = String(p?.barras || '').trim();
      const name = String(p?.nombre || '').trim();
      if(sku){ const key = norm(sku); if(!skuMap.has(key)) skuMap.set(key, []); skuMap.get(key).push(p); }
      if(barcode){ const key = norm(barcode); if(!barcodeMap.has(key)) barcodeMap.set(key, []); barcodeMap.get(key).push(p); }
      if(!name){ counters.missingName++; addIssue('Alta','Sin nombre','El producto no tiene nombre. Esto impide mostrarlo correctamente.',p); }
      if(!sku){ counters.missingSku++; addIssue('Alta','Sin SKU','No se detectó SKU/código. Afecta búsqueda, picking y cruce con Bsale.',p); }
      if(!barcode){ counters.missingBarcode++; }
      if(!getProductCategoryValue(p)){ counters.missingCategory++; addIssue('Media','Sin categoría','Completa la columna Categoria/Categoría para que los filtros funcionen.',p); }
      if(!getProductGenderValue(p)){ counters.missingGender++; addIssue('Media','Sin género','Completa la columna Genero/Género: Mujer, Varón, Niños o Niñas.',p); }
      const imgs = getProductImageUrls(p);
      if(!imgs.length){ counters.missingImage++; addIssue('Baja','Sin imagen','No hay Imagen 1–6 para este producto.',p); }
      else {
        const badImgs = imgs.filter(v => !isProbablyUrl(v));
        if(badImgs.length){ counters.invalidImage++; addIssue('Media','Imagen inválida',`Hay ${badImgs.length} imagen(es) con formato no reconocido. Usa URL https o data:image.`,p); }
      }
      const locIssue = getProductLocationIssue(p, 'primary');
      if(locIssue){
        if(locIssue === 'Sin ubicación') counters.missingLocation++;
        else counters.badLocation++;
        if(locIssue.startsWith('Rack no existe')) counters.rackMissing++;
        addIssue(locIssue === 'Sin ubicación' ? 'Alta' : 'Alta','Ubicación principal',locIssue,p);
      }
      const storeIssue = getProductLocationIssue(p, 'store');
      if(storeIssue){
        if(storeIssue === 'Sin ubicación de almacén') counters.missingStoreLocation++;
        else counters.badStoreLocation++;
        if(storeIssue.startsWith('Rack no existe')) counters.rackMissing++;
        addIssue(storeIssue === 'Sin ubicación de almacén' ? 'Media' : 'Alta','Ubicación almacén',storeIssue,p);
      }
      [p?.rack, p?.rackStore].filter(Boolean).forEach(rid => {
        const usage = rackUsage.get(rid);
        if(usage) usage.products += 1;
      });
      [p?.zona, p?.zonaStore].filter(Boolean).forEach(zid => {
        const usage = zoneUsage.get(zid);
        if(usage) usage.products += 1;
      });
    });
    skuMap.forEach((items, key) => {
      if(items.length > 1){
        counters.duplicateSku += items.length;
        items.slice(0, 30).forEach(p => addIssue('Alta','SKU duplicado',`El SKU aparece ${items.length} veces. Revisa variantes o códigos repetidos.`,p,{ duplicateKey:key }));
      }
    });
    barcodeMap.forEach((items, key) => {
      if(items.length > 1){
        counters.duplicateBarcode += items.length;
        items.slice(0, 30).forEach(p => addIssue('Media','Barras duplicadas',`El código de barras aparece ${items.length} veces.`,p,{ duplicateKey:key }));
      }
    });
    const rackStats = Array.from(rackUsage.values()).map(r => {
      const overflow = Math.max(0, Number(r.products || 0) - Number(r.capacity || 0));
      r.overflow = overflow;
      if(Number(r.products || 0) <= 0) counters.emptyRacks++;
      else counters.occupiedRacks++;
      if(overflow > 0){ counters.overCapacityRacks++; addIssue('Media','Rack sobrecapacidad',`${r.id} tiene ${r.products} productos para ${r.capacity} posiciones estimadas.`,null,{ row:'—', sku:r.id, name:'Rack', rackId:r.id }); }
      return r;
    }).sort((a,b) => (b.products - a.products) || String(a.id).localeCompare(String(b.id)));
    const zoneStats = Array.from(zoneUsage.values()).sort((a,b) => (b.products - a.products) || String(a.id).localeCompare(String(b.id)));
    const high = issues.filter(i => i.severity === 'Alta').length;
    const medium = issues.filter(i => i.severity === 'Media').length;
    const low = issues.filter(i => i.severity === 'Baja').length;
    const weighted = high * 3 + medium * 1.6 + low * .6;
    const base = Math.max(1, counters.total * 3);
    const score = Math.max(0, Math.min(100, Math.round(100 - (weighted / base) * 100)));
    return { counters, issues, rackStats, zoneStats, score, severity:{ high, medium, low } };
  }

  function exportDataQualityCsv(report){
    const data = report || analyzeInventoryData();
    const header = ['Severidad','Fila','SKU','Producto','Tipo','Detalle'];
    const esc = value => `"${String(value ?? '').replace(/"/g,'""')}"`;
    const lines = [header.map(esc).join(',')].concat((data.issues || []).map(i => [i.severity,i.row,i.sku,i.name,i.type,i.detail].map(esc).join(',')));
    const blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-wms-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast('Reporte CSV descargado.', 'success');
  }

  function openDataQualityModal(){
    const existing = document.getElementById('dataQualityModal');
    if(existing) existing.remove();
    const report = analyzeInventoryData();
    const { counters, issues, rackStats, zoneStats, score, severity } = report;
    const cards = [
      ['Productos', counters.total, 'registros importados', 'ok'],
      ['Calidad', `${score}%`, `${severity.high} altas · ${severity.medium} medias`, score >= 85 ? 'ok' : 'warn'],
      ['Sin ubicación', counters.missingLocation, 'ubicación principal vacía', 'warn'],
      ['Ubicación inválida', counters.badLocation + counters.badStoreLocation, 'rack, nivel o slot', 'warn'],
      ['Racks no encontrados', counters.rackMissing, 'no existen en layout', 'warn'],
      ['SKU duplicado', counters.duplicateSku, 'registros afectados', 'warn'],
      ['Barras duplicadas', counters.duplicateBarcode, 'registros afectados', 'warn'],
      ['Sin nombre', counters.missingName, 'deben corregirse', 'warn'],
      ['Sin SKU', counters.missingSku, 'afecta búsquedas', 'warn'],
      ['Sin categoría', counters.missingCategory, 'afecta filtros', 'warn'],
      ['Sin género', counters.missingGender, 'afecta filtros', 'warn'],
      ['Imágenes inválidas', counters.invalidImage, 'URL no reconocida', 'warn'],
      ['Racks vacíos', counters.emptyRacks, `${counters.racksTotal} racks en layout`, counters.emptyRacks ? 'neutral' : 'ok'],
      ['Sobrecapacidad', counters.overCapacityRacks, 'racks con exceso estimado', 'warn'],
      ['Zonas', counters.zonesTotal, 'zonas del layout', 'ok'],
      ['Racks ocupados', counters.occupiedRacks, 'con productos vinculados', 'ok']
    ].map(([label, value, hint, state]) => `<div class="dq-card ${state === 'warn' && Number(value)>0 ? 'warn' : state === 'neutral' ? 'neutral' : ''}"><b>${typeof value === 'number' ? Number(value||0).toLocaleString('es-PE') : escapeHtml(value)}</b><span>${escapeHtml(label)}</span><small>${escapeHtml(hint)}</small></div>`).join('');
    const rows = issues.slice(0, 160).map(item => `<tr><td><span class="dq-severity ${norm(item.severity)}">${escapeHtml(item.severity)}</span></td><td>${escapeHtml(String(item.row))}</td><td>${escapeHtml(item.sku)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.detail)}</td></tr>`).join('');
    const rackRows = rackStats.slice(0, 18).map(r => `<tr><td>${escapeHtml(r.id)}</td><td>${escapeHtml(r.zoneId || '—')}</td><td>${Number(r.products||0).toLocaleString('es-PE')}</td><td>${Number(r.capacity||0).toLocaleString('es-PE')}</td><td>${r.overflow ? `<span class="dq-severity media">+${r.overflow}</span>` : 'OK'}</td></tr>`).join('');
    const zoneRows = zoneStats.slice(0, 12).map(z => `<tr><td>${escapeHtml(z.id)}</td><td>${escapeHtml(z.name || z.id)}</td><td>${Number(z.racks||0).toLocaleString('es-PE')}</td><td>${Number(z.products||0).toLocaleString('es-PE')}</td></tr>`).join('');
    const modal = document.createElement('div');
    modal.id = 'dataQualityModal';
    modal.className = 'data-quality-backdrop show';
    modal.innerHTML = `
      <div class="data-quality-shell dq-health-shell">
        <div class="data-quality-head">
          <div><div class="search-card-kicker">Control de calidad · v53</div><h2>Salud del almacén</h2><p>Sucursal: ${escapeHtml((appState.admin?.branches || [])[getActiveBranchContextIndex()]?.name || 'Sucursal activa')} · valida productos, ubicaciones, racks, duplicados e imágenes antes de operar picking, reposición o Bsale.</p></div>
          <div class="data-quality-actions"><span class="dq-score ${score < 75 ? 'danger' : score < 90 ? 'warning' : ''}">Calidad ${score}%</span><button class="iso-tool" type="button" data-dq-export>Exportar CSV</button><button class="location-modal-close" type="button" aria-label="Cerrar">✕</button></div>
        </div>
        <div class="data-quality-grid dq-health-grid">${cards}</div>
        <div class="dq-health-tabs">
          <button class="active" data-dq-tab="issues">Observaciones</button>
          <button data-dq-tab="racks">Racks</button>
          <button data-dq-tab="zones">Zonas</button>
        </div>
        <div class="data-quality-table-wrap dq-tab-panel active" data-dq-panel="issues">
          <div class="data-quality-table-head"><b>Observaciones detectadas</b><span>${issues.length.toLocaleString('es-PE')} alertas encontradas · se muestran hasta 160</span></div>
          <table class="data-quality-table"><thead><tr><th>Severidad</th><th>Fila</th><th>SKU</th><th>Producto</th><th>Tipo</th><th>Detalle</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No se detectaron observaciones críticas.</td></tr>'}</tbody></table>
        </div>
        <div class="data-quality-table-wrap dq-tab-panel" data-dq-panel="racks">
          <div class="data-quality-table-head"><b>Uso por rack</b><span>${rackStats.length.toLocaleString('es-PE')} racks revisados</span></div>
          <table class="data-quality-table"><thead><tr><th>Rack</th><th>Zona</th><th>Productos</th><th>Capacidad estimada</th><th>Estado</th></tr></thead><tbody>${rackRows || '<tr><td colspan="5">No hay racks creados en el layout.</td></tr>'}</tbody></table>
        </div>
        <div class="data-quality-table-wrap dq-tab-panel" data-dq-panel="zones">
          <div class="data-quality-table-head"><b>Uso por zona</b><span>${zoneStats.length.toLocaleString('es-PE')} zonas revisadas</span></div>
          <table class="data-quality-table"><thead><tr><th>Zona</th><th>Nombre</th><th>Racks</th><th>Productos vinculados</th></tr></thead><tbody>${zoneRows || '<tr><td colspan="4">No hay zonas creadas en el layout.</td></tr>'}</tbody></table>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('.location-modal-close')?.addEventListener('click', close);
    modal.querySelector('[data-dq-export]')?.addEventListener('click', () => exportDataQualityCsv(report));
    modal.querySelectorAll('[data-dq-tab]').forEach(btn => btn.addEventListener('click', () => {
      const tab = btn.dataset.dqTab;
      modal.querySelectorAll('[data-dq-tab]').forEach(b => b.classList.toggle('active', b === btn));
      modal.querySelectorAll('[data-dq-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.dqPanel === tab));
    }));
    modal.addEventListener('click', e => { if(e.target === modal) close(); });
  }

  function openProductVariantsModal(product = appState.selectedProduct){
    const prod = product || appState.selectedProduct;
    if(!prod){ showToast('Selecciona un producto primero.', 'warning'); return; }
    const key = norm(prod.nombre || prod.sku || '');
    const variants = (appState.products || []).filter(p => norm(p.nombre || p.sku || '') === key);
    const existing = document.getElementById('productVariantsModal');
    if(existing) existing.remove();
    const rows = variants.map((v, idx) => {
      const color = getProductColorValue(v);
      const colorChip = color ? `<span class="viewer-variant-chip color" style="${getViewerColorChipStyle(color)}">${escapeHtml(color)}</span>` : '—';
      return `<tr data-variant-idx="${idx}"><td>${escapeHtml(v.sku || '—')}</td><td>${escapeHtml(getProductSizeValue(v) || '—')}</td><td>${colorChip}</td><td>${escapeHtml(v.ubicacion || '—')}</td><td>${escapeHtml(v.almacen || '—')}</td><td><button class="tiny-btn" data-select-variant="${idx}">Ver</button></td></tr>`;
    }).join('');
    const modal = document.createElement('div');
    modal.id = 'productVariantsModal';
    modal.className = 'data-quality-backdrop show';
    modal.innerHTML = `
      <div class="product-variants-shell">
        <div class="data-quality-head"><div><div class="search-card-kicker">Variantes</div><h2>${escapeHtml(prod.nombre || 'Producto')}</h2><p>${variants.length.toLocaleString('es-PE')} variantes detectadas para este modelo.</p></div><button class="location-modal-close" type="button" aria-label="Cerrar">✕</button></div>
        <div class="variant-table-wrap"><table class="data-quality-table"><thead><tr><th>SKU</th><th>Talla</th><th>Color</th><th>Ubicación</th><th>Almacén</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="6">No hay variantes detectadas.</td></tr>'}</tbody></table></div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('.location-modal-close')?.addEventListener('click', close);
    modal.addEventListener('click', e => { if(e.target === modal) close(); });
    modal.querySelectorAll('[data-select-variant]').forEach(btn => btn.addEventListener('click', () => {
      const v = variants[Number(btn.dataset.selectVariant || 0)];
      if(v){ close(); selectProduct(v); focusSelectedProductInViewer({ product:v, switchScreen:false }); }
    }));
  }

  async function copySelectedProductLocation(product = appState.selectedProduct){
    const prod = product || appState.selectedProduct;
    if(!prod){ showToast('Selecciona un producto primero.', 'warning'); return; }
    const ctx = getViewerProductLocationContext(prod);
    const textToCopy = `SKU: ${prod.sku || '—'} | ${prod.nombre || 'Producto'} | Ubicación: ${ctx.primaryLoc || '—'} | Almacén: ${ctx.storeLoc || '—'}`;
    try{
      await navigator.clipboard.writeText(textToCopy);
      showToast('Ubicación copiada al portapapeles.', 'success');
    }catch{
      const ta = document.createElement('textarea');
      ta.value = textToCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      showToast('Ubicación copiada.', 'success');
    }
  }

  function openNavigable3DModal(prod = appState.selectedProduct){
    const existing = document.getElementById('navigable3DModal');
    if(existing) existing.remove();
    const ctx = getViewerProductLocationContext(prod);
    ensureAppRuntimeState();
    const currentVisualMode = appState.ui?.nav3DVisualMode || 'operativo';
    const modal = document.createElement('div');
    modal.id = 'navigable3DModal';
    modal.className = 'nav3d-backdrop show';
    modal.innerHTML = `
      <div class="nav3d-shell">
        <div class="nav3d-head">
          <div>
            <div class="search-card-kicker">Visor libre</div>
            <h2>Entorno 3D navegable</h2>
            <p>Arrastra para orbitar, rueda para zoom, Shift + arrastrar para mover la cámara.</p>
          </div>
          <div class="nav3d-actions">
            <div class="nav3d-head-location">${escapeHtml(ctx.primaryLoc || 'Sin ubicación')}</div>
            <div class="nav3d-target-switch" id="nav3dTargetSwitch">
              <button type="button" class="active" data-nav3d-target="primary">Ubicación</button>
              <button type="button" data-nav3d-target="store">Almacén</button>
              <button type="button" data-nav3d-target="both">Ambas</button>
            </div>
            <button class="iso-tool nav3d-solo-location active" data-nav3d-action="solo">Solo ubicación</button>
            <button class="iso-tool" data-nav3d-action="focus">Centrar</button>
            <button class="iso-tool ${appState.ui?.nav3DWallCut ? 'active' : ''}" data-nav3d-action="wall-cut">Vista corte</button>
            <div class="nav3d-visual-switch">
              <button class="iso-tool visual-mode" data-nav3d-action="visual-dark">Oscuro</button>
              <button class="iso-tool visual-mode active" data-nav3d-action="visual-operativo">Operativo</button>
              <button class="iso-tool visual-mode" data-nav3d-action="visual-claro">Claro</button>
            </div>
            <button class="location-modal-close" type="button" aria-label="Cerrar">✕</button>
          </div>
        </div>
        <div class="nav3d-body">
          <div class="nav3d-stage">
            <canvas id="nav3dCanvas"></canvas>
            <div class="nav3d-hud">
              <b>Controles</b>
              <span>Arrastrar: orbitar</span>
              <span>Rueda: zoom</span>
              <span>Shift + arrastrar: pan</span>
            </div>
            <div class="nav3d-compass" id="nav3dCompass">N</div>
          </div>
          <div class="nav3d-side">
            <div class="nav3d-rack-card is-primary">
              <div class="nav3d-rack-head">
                <div><b>Rack de ubicación</b><div class="muted tiny">${escapeHtml(ctx.primaryLoc || 'Sin ubicación principal')}</div></div>
                <div class="nav3d-rack-tools">
                  <span class="chip">${escapeHtml(ctx.primaryRackId || '—')}</span>
                  <button class="nav3d-rack-expand" type="button" data-rack-expand="primary" aria-label="Ampliar rack de ubicación">⤢</button>
                </div>
              </div>
              <div class="nav3d-rack-stage">
                <svg id="nav3dRackPrimary"></svg>
              </div>
              <div class="nav3d-rack-meta" id="nav3dRackPrimaryMeta">
                <span class="nav3d-rack-badge">Vista 3D</span>
                <span class="nav3d-rack-badge">Nivel —</span>
                <span class="nav3d-rack-badge">Slot —</span>
              </div>
            </div>
            <div class="nav3d-rack-card is-store">
              <div class="nav3d-rack-head">
                <div><b>Rack de almacén</b><div class="muted tiny">${escapeHtml(ctx.storeLoc || 'Sin ubicación de almacén')}</div></div>
                <div class="nav3d-rack-tools">
                  <span class="chip">${escapeHtml(ctx.storeRackId || '—')}</span>
                  <button class="nav3d-rack-expand" type="button" data-rack-expand="store" aria-label="Ampliar rack de almacén">⤢</button>
                </div>
              </div>
              <div class="nav3d-rack-stage">
                <svg id="nav3dRackStore"></svg>
              </div>
              <div class="nav3d-rack-meta" id="nav3dRackStoreMeta">
                <span class="nav3d-rack-badge">Vista 3D</span>
                <span class="nav3d-rack-badge">Nivel —</span>
                <span class="nav3d-rack-badge">Slot —</span>
              </div>
            </div>
          </div>
        </div>
        <div class="nav3d-rack-zoom" id="nav3dRackZoom" hidden>
          <div class="nav3d-rack-zoom-card">
            <div class="nav3d-rack-zoom-head">
              <div>
                <div class="search-card-kicker">Vista ampliada</div>
                <b id="nav3dRackZoomTitle">Rack</b>
              </div>
              <div class="nav3d-rack-tools">
                <span class="chip" id="nav3dRackZoomChip">—</span>
                <button class="nav3d-rack-expand" type="button" data-rack-zoom-close aria-label="Cerrar ampliación">✕</button>
              </div>
            </div>
            <div class="nav3d-rack-zoom-stage"><svg id="nav3dRackZoomSvg"></svg></div>
            <div class="nav3d-rack-meta" id="nav3dRackZoomMeta"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const canvas = modal.querySelector('#nav3dCanvas');
    const compass = modal.querySelector('#nav3dCompass');
    const rackPrimarySvg = modal.querySelector('#nav3dRackPrimary');
    const rackStoreSvg = modal.querySelector('#nav3dRackStore');
    const rackZoom = modal.querySelector('#nav3dRackZoom');
    const rackZoomSvg = modal.querySelector('#nav3dRackZoomSvg');
    const rackZoomTitle = modal.querySelector('#nav3dRackZoomTitle');
    const rackZoomChip = modal.querySelector('#nav3dRackZoomChip');
    const rackZoomMeta = modal.querySelector('#nav3dRackZoomMeta');
    const rackExpandButtons = Array.from(modal.querySelectorAll('[data-rack-expand]'));
    const state = {
      yaw: -Math.PI/4, pitch:.78, zoom:1, panX:0, panY:0,
      targetYaw: -Math.PI/4, targetPitch:.78, targetZoom:1, targetPanX:0, targetPanY:0,
      isolation:'all', ghost:true, labels:true, route:true,
      dragging:false, lastX:0, lastY:0, raf:0
    };
    const baseRackModel = () => rackModel(appState.selectedModelId) || appState.models?.[0] || { id:'std_4', name:'Rack estándar', levels:4, slots:2, width:120, depth:40, height:240, clearance:0, style:'metallic' };
    const makeVirtualRack = (rackId, loc, isStore=false, index=0) => {
      const model = baseRackModel();
      const parsed = parseLocationCode(loc || rackId || '', isStore ? 'ALM-E1' : 'Z1-E1');
      const id = rackId || parsed.rackId || (isStore ? 'ALM-E1' : 'Z1-E1');
      return {
        id,
        modelId:model.id,
        zoneId:parsed.zoneId || (isStore ? 'ALM' : 'Z1'),
        x:isStore ? 190 : 0,
        y:index * 110,
        w:Number(model.width || 120) || 120,
        h:Number(model.depth || 56) || 56,
        rackHeight:Number(model.height || 240) || 240,
        baseHeight:0,
        _virtual:true
      };
    };
    const getVirtualRacks = () => {
      const liveCtx = getViewerProductLocationContext(prod);
      const out = [];
      if(liveCtx.primaryRackId && !findRackById(liveCtx.primaryRackId)) out.push(makeVirtualRack(liveCtx.primaryRackId, liveCtx.primaryLoc, false, 0));
      if(liveCtx.storeRackId && liveCtx.storeRackId !== liveCtx.primaryRackId && !findRackById(liveCtx.storeRackId)) out.push(makeVirtualRack(liveCtx.storeRackId, liveCtx.storeLoc, true, 1));
      if(!out.length && !(appState.layout?.racks || []).length){
        out.push(makeVirtualRack(liveCtx.primaryRackId || 'Z1-E1', liveCtx.primaryLoc || 'Z1-E1-N1-S1', false, 0));
        if(liveCtx.storeRackId && liveCtx.storeRackId !== liveCtx.primaryRackId) out.push(makeVirtualRack(liveCtx.storeRackId, liveCtx.storeLoc, true, 1));
      }
      return out;
    };
    const getNav3DRacks = () => {
      const real = Array.isArray(appState.layout?.racks) ? appState.layout.racks.slice() : [];
      const virtual = getVirtualRacks();
      const realIds = new Set(real.map(r => r.id));
      virtual.forEach(r => { if(!realIds.has(r.id)) real.push(r); });
      return real;
    };
    const findNav3DRackById = (id) => findRackById(id) || getVirtualRacks().find(r => r.id === id) || null;
    const getNav3DZones = () => {
      const zones = Array.isArray(appState.layout?.zones) ? appState.layout.zones.slice() : [];
      const zoneIds = new Set(zones.map(z => z.id));
      getNav3DRacks().forEach(r => {
        if(!zoneIds.has(r.zoneId)){
          const x=Number(r.x)||0, y=Number(r.y)||0, w=Math.max(140,Number(r.w)||120), h=Math.max(90,Number(r.h)||56);
          zones.push({ id:r.zoneId || 'Z1', name:r.zoneId || 'Zona', wallThickness:14, pts:[{x:x-60,y:y-40},{x:x+w+60,y:y-40},{x:x+w+60,y:y+h+60},{x:x-60,y:y+h+60}], _virtual:true });
          zoneIds.add(r.zoneId);
        }
      });
      return zones;
    };
    const getNav3DSceneBounds = () => {
      const pts = [];
      getNav3DZones().forEach(z => (z.pts || []).forEach(pt => pts.push({x:Number(pt.x)||0,y:Number(pt.y)||0})));
      getNav3DRacks().forEach(r => { const x=Number(r.x)||0,y=Number(r.y)||0,w=Math.max(10,Number(r.w)||80),d=Math.max(10,Number(r.h)||40); pts.push({x,y},{x:x+w,y},{x:x+w,y:y+d},{x,y:y+d}); });
      if(!pts.length) pts.push({x:-200,y:-160},{x:200,y:160});
      const minX=Math.min(...pts.map(p=>p.x)), maxX=Math.max(...pts.map(p=>p.x));
      const minY=Math.min(...pts.map(p=>p.y)), maxY=Math.max(...pts.map(p=>p.y));
      return { minX,maxX,minY,maxY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY),cx:(minX+maxX)/2,cy:(minY+maxY)/2 };
    };
    const close = () => { window.removeEventListener('resize', render); modal.remove(); };
    modal.querySelector('.location-modal-close')?.addEventListener('click', close);
    modal.addEventListener('click', e => { if(e.target === modal) close(); });
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const requestSmoothRender = () => {
      if(state.raf) return;
      const tick = () => {
        state.raf = 0;
        const ease = 0.18;
        state.yaw += (state.targetYaw - state.yaw) * ease;
        state.pitch += (state.targetPitch - state.pitch) * ease;
        state.zoom += (state.targetZoom - state.zoom) * ease;
        state.panX += (state.targetPanX - state.panX) * ease;
        state.panY += (state.targetPanY - state.panY) * ease;
        render();
        const moving = Math.abs(state.targetYaw - state.yaw) > 0.0008 || Math.abs(state.targetPitch - state.pitch) > 0.0008 || Math.abs(state.targetZoom - state.zoom) > 0.001 || Math.abs(state.targetPanX - state.panX) > 0.2 || Math.abs(state.targetPanY - state.panY) > 0.2;
        if(moving) state.raf = requestAnimationFrame(tick);
      };
      state.raf = requestAnimationFrame(tick);
    };
    function getFocusSets(){
      const focusRackIds = new Set([prod?.rack, prod?.rackStore].filter(Boolean));
      const focusZoneIds = new Set([prod?.zona, prod?.zonaStore].filter(Boolean));
      focusRackIds.forEach(rid => { const r = findNav3DRackById(rid); if(r?.zoneId) focusZoneIds.add(r.zoneId); });
      return { focusRackIds, focusZoneIds };
    }
    function projectFactory(width,height){
      const bounds = getNav3DSceneBounds();
      const base = Math.min(width/(bounds.w*1.45 || 1), height/(bounds.h*1.2 + 220 || 1));
      const scale = Math.max(0.4, Math.min(3.2, base * 0.95 * state.zoom));
      const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw), cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
      return function project(x,y,z=0){
        const dx = x - bounds.cx, dy = y - bounds.cy;
        const rx = dx * cy - dy * sy;
        const ry = dx * sy + dy * cy;
        const screenY = ry * cp - z * sp;
        const depth = ry * sp + z * cp;
        return { x: width/2 + state.panX + rx * scale, y: height/2 + 90 + state.panY + screenY * scale, depth };
      };
    }
    function drawPoly(ctx2, pts, fill, stroke='rgba(255,255,255,.14)', lw=1){
      if(!pts.length) return;
      ctx2.beginPath(); ctx2.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p=>ctx2.lineTo(p.x,p.y)); ctx2.closePath();
      if(fill){ ctx2.fillStyle = fill; ctx2.fill(); }
      if(stroke){ ctx2.strokeStyle = stroke; ctx2.lineWidth = lw; ctx2.stroke(); }
    }
    function drawLabel(ctx2, p, text, active=false){
      if(!state.labels || !text) return;
      ctx2.save(); ctx2.font = active ? '800 13px system-ui' : '700 11px system-ui';
      const pad=7, w=ctx2.measureText(text).width + pad*2, h=24;
      ctx2.fillStyle = active ? 'rgba(47,193,119,.90)' : 'rgba(6,16,28,.74)';
      ctx2.strokeStyle = active ? 'rgba(143,255,191,.72)' : 'rgba(255,255,255,.14)'; ctx2.lineWidth = 1;
      ctx2.beginPath(); ctx2.roundRect(p.x - w/2, p.y - h - 6, w, h, 9); ctx2.fill(); ctx2.stroke();
      ctx2.fillStyle = active ? '#fff' : '#dceee6'; ctx2.textAlign='center'; ctx2.textBaseline='middle'; ctx2.fillText(text, p.x, p.y - h/2 - 6); ctx2.restore();
    }
    function drawRackShape(ctx2, project, r, active=false, ghost=false){
      const x=Number(r.x)||0, y=Number(r.y)||0, w=Math.max(18,Number(r.w)||80), d=Math.max(18,Number(r.h)||40), h=getRackRenderHeight3D(r);
      const rackRef = findNav3DRackById(r.id) || r;
      const model = rackModel(rackRef?.modelId) || baseRackModel();
      const slots = Math.max(1, Math.min(6, Number(model.slots || model.capacity || 2) || 2));
      const levels = Math.max(1, Math.min(9, Number(model.levels || 4) || 4));
      const alpha = ghost ? 0.15 : 0.98;
      const steelStroke = active ? 'rgba(138,255,183,.85)' : `rgba(214,231,248,${ghost ? .10 : .36})`;
      const postStroke = active ? 'rgba(143,255,191,.95)' : `rgba(214,231,248,${ghost ? .16 : .50})`;
      const shelfTop = active ? `rgba(84,234,142,${alpha*.40})` : `rgba(145,177,206,${alpha*.22})`;
      const shelfFront = active ? `rgba(59,196,110,${alpha*.34})` : `rgba(96,127,160,${alpha*.26})`;
      const boxFill = active ? `rgba(255,215,92,${ghost ? .20 : .90})` : `rgba(215,160,88,${ghost ? .16 : .76})`;
      const boxSide = active ? `rgba(224,180,72,${ghost ? .18 : .82})` : `rgba(192,133,60,${ghost ? .14 : .68})`;
      const boxTop = active ? `rgba(255,232,154,${ghost ? .22 : .92})` : `rgba(235,198,131,${ghost ? .18 : .74})`;
      const floorPts = [[x-10,y-8,0],[x+w+10,y-8,0],[x+w+10,y+d+10,0],[x-10,y+d+10,0]].map(c => project(c[0],c[1],c[2]));
      drawPoly(ctx2, floorPts, ghost ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.04)', `rgba(255,255,255,${ghost ? .08 : .14})`, 1);

      const edges = [
        [[x,y,0],[x,y,h]], [[x+w,y,0],[x+w,y,h]], [[x+w,y+d,0],[x+w,y+d,h]], [[x,y+d,0],[x,y+d,h]],
        [[x,y,0],[x+w,y,0]], [[x+w,y,0],[x+w,y+d,0]], [[x+w,y+d,0],[x,y+d,0]], [[x,y+d,0],[x,y,0]],
        [[x,y,h],[x+w,y,h]], [[x+w,y,h],[x+w,y+d,h]], [[x+w,y+d,h],[x,y+d,h]], [[x,y+d,h],[x,y,h]]
      ];
      ctx2.save();
      if(active){ ctx2.shadowColor='rgba(89,255,155,.22)'; ctx2.shadowBlur=16; }
      edges.forEach(seg => {
        const a = project(seg[0][0],seg[0][1],seg[0][2]);
        const b = project(seg[1][0],seg[1][1],seg[1][2]);
        ctx2.beginPath();
        ctx2.moveTo(a.x,a.y); ctx2.lineTo(b.x,b.y);
        ctx2.strokeStyle = (seg[0][2] !== seg[1][2]) ? postStroke : steelStroke;
        ctx2.lineWidth = (seg[0][2] !== seg[1][2]) ? 2.6 : 1.6;
        ctx2.stroke();
      });
      ctx2.restore();

      const levelStep = h / levels;
      for(let li=0; li<levels; li++){
        const z0 = li * levelStep + 2;
        const zShelf = Math.max(0, z0 - 3);
        const shelf = [
          [x,y,zShelf],[x+w,y,zShelf],[x+w,y+d,zShelf],[x,y+d,zShelf]
        ].map(c => project(c[0],c[1],c[2]));
        drawPoly(ctx2, [shelf[0], shelf[1], shelf[2], shelf[3]], shelfTop, steelStroke, 1);
        const front = [[x,y+d,zShelf],[x+w,y+d,zShelf],[x+w,y+d,zShelf+3],[x,y+d,zShelf+3]].map(c => project(c[0],c[1],c[2]));
        drawPoly(ctx2, front, shelfFront, null, 0);

        const slotGap = Math.max(2, w * 0.03);
        const innerW = Math.max(10, w - slotGap * (slots + 1));
        const boxW = innerW / slots;
        const boxH = Math.max(10, levelStep * 0.72);
        const boxD = Math.max(8, d * 0.72);
        for(let si=0; si<slots; si++){
          const bx = x + slotGap + si * (boxW + slotGap);
          const by = y + (d - boxD) * 0.54;
          const bz = z0 + Math.max(2, (levelStep - boxH) * 0.18);
          const isTarget = active && Number(prod?.nivel || prod?.nivelStore || 0) === li + 1 && Number(prod?.slot || prod?.slotStore || 0) === si + 1;
          const corners = [[bx,by,bz],[bx+boxW,by,bz],[bx+boxW,by+boxD,bz],[bx,by+boxD,bz],[bx,by,bz+boxH],[bx+boxW,by,bz+boxH],[bx+boxW,by+boxD,bz+boxH],[bx,by+boxD,bz+boxH]].map(c => project(c[0],c[1],c[2]));
          const faces = [
            {idx:[4,5,6,7], fill:isTarget ? 'rgba(163,255,88,.92)' : boxTop},
            {idx:[3,2,6,7], fill:isTarget ? 'rgba(122,230,64,.88)' : boxFill},
            {idx:[1,2,6,5], fill:isTarget ? 'rgba(99,194,51,.86)' : boxSide}
          ];
          faces.forEach(f => drawPoly(ctx2, f.idx.map(i => corners[i]), f.fill, isTarget ? 'rgba(255,255,190,.95)' : `rgba(255,255,255,${ghost ? .06 : .16})`, isTarget ? 1.6 : 0.8));
        }
      }
      if(active){ const topCenter = project(x+w/2, y+d/2, h+20); ctx2.save(); ctx2.shadowColor='rgba(89,255,155,.75)'; ctx2.shadowBlur=18; ctx2.fillStyle='#5cff9a'; ctx2.beginPath(); ctx2.arc(topCenter.x, topCenter.y, 7, 0, Math.PI*2); ctx2.fill(); ctx2.restore(); }
      drawLabel(ctx2, project(x+w/2, y+d/2, h+38), r.id, active);
    }


    function drawRackBasic(ctx2, project, r, active=false, ghost=false){
      const x=Number(r.x)||0, y=Number(r.y)||0, w=Math.max(18,Number(r.w)||80), d=Math.max(18,Number(r.h)||40), h=getRackRenderHeight3D(r);
      const fillTop = active ? `rgba(132,255,176,${ghost ? .18 : .34})` : `rgba(174,204,236,${ghost ? .08 : .16})`;
      const fillFront = active ? `rgba(96,235,150,${ghost ? .18 : .28})` : `rgba(111,145,179,${ghost ? .08 : .18})`;
      const fillSide = active ? `rgba(75,214,132,${ghost ? .16 : .22})` : `rgba(86,118,154,${ghost ? .08 : .14})`;
      const stroke = active ? `rgba(134,255,183,${ghost ? .45 : .9})` : `rgba(214,231,248,${ghost ? .12 : .28})`;
      const corners = [[x,y,0],[x+w,y,0],[x+w,y+d,0],[x,y+d,0],[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]].map(c => project(c[0],c[1],c[2]));
      drawPoly(ctx2, [corners[4], corners[5], corners[6], corners[7]], fillTop, stroke, 1);
      drawPoly(ctx2, [corners[3], corners[2], corners[6], corners[7]], fillFront, stroke, 1);
      drawPoly(ctx2, [corners[1], corners[2], corners[6], corners[5]], fillSide, stroke, 1);
      const floorPts = [[x-8,y-6,0],[x+w+8,y-6,0],[x+w+8,y+d+8,0],[x-8,y+d+8,0]].map(c => project(c[0],c[1],c[2]));
      drawPoly(ctx2, floorPts, ghost ? 'rgba(255,255,255,.01)' : 'rgba(255,255,255,.03)', `rgba(255,255,255,${ghost ? .06 : .10})`, 1);
      if(active){
        const topCenter = project(x+w/2, y+d/2, h+16);
        ctx2.save();
        ctx2.shadowColor='rgba(89,255,155,.65)';
        ctx2.shadowBlur=16;
        ctx2.fillStyle='#5cff9a';
        ctx2.beginPath();
        ctx2.arc(topCenter.x, topCenter.y, 5.5, 0, Math.PI*2);
        ctx2.fill();
        ctx2.restore();
      }
      drawLabel(ctx2, project(x+w/2, y+d/2, h+28), r.id, active);
    }


    function getProductMarkerPoint(project, r){
      if(!prod || !r) return null;
      const model = appState.models.find(m => m.id === r.modelId) || appState.models[0] || {};
      const slots = Math.max(1, Number(model.slots || 2));
      const levels = Math.max(1, Number(model.levels || 4));
      const x=Number(r.x)||0, y=Number(r.y)||0, w=Math.max(10,Number(r.w)||80), d=Math.max(10,Number(r.h)||40), h=getRackRenderHeight3D(r);
      const slot = Math.min(slots, Math.max(1, Number(prod.slot || prod.slotStore || 1)));
      const level = Math.min(levels, Math.max(1, Number(prod.nivel || prod.nivelStore || 1)));
      const px = x + (slot - .5) * (w / slots), py = y + d * .52, pz = (level / levels) * h;
      return { point: project(px,py,pz+16), labelPoint: project(px,py,pz+46), level, slot, x:px, y:py, z:pz };
    }

    function drawProductRoute(ctx2, project, r){
      if(!state.route || !prod || !r) return;
      const z = (appState.layout?.zones || []).find(zone => zone.id === r.zoneId || zone.id === prod.zona || zone.id === prod.zonaStore);
      const c = z ? centroid(z.pts || []) : { x:Number(r.x)||0, y:Number(r.y)||0 };
      const rackCenter = project((Number(r.x)||0)+(Math.max(10,Number(r.w)||80)/2), (Number(r.y)||0)+(Math.max(10,Number(r.h)||40)/2), getRackRenderHeight3D(r)+20);
      const start = project(c.x, c.y, 16);
      const marker = getProductMarkerPoint(project, r);
      if(!marker) return;
      ctx2.save();
      ctx2.strokeStyle='rgba(255,216,90,.95)'; ctx2.lineWidth=4; ctx2.setLineDash([12,8]); ctx2.lineCap='round'; ctx2.lineJoin='round';
      ctx2.shadowColor='rgba(255,216,90,.65)'; ctx2.shadowBlur=12;
      ctx2.beginPath(); ctx2.moveTo(start.x,start.y); ctx2.lineTo(rackCenter.x,rackCenter.y); ctx2.lineTo(marker.point.x,marker.point.y); ctx2.stroke();
      [start,rackCenter,marker.point].forEach((p,i)=>{ ctx2.fillStyle=i===2?'#ffd85a':'#55e591'; ctx2.beginPath(); ctx2.arc(p.x,p.y,i===2?7:5,0,Math.PI*2); ctx2.fill(); });
      ctx2.restore();
    }

    function drawProductMarker(ctx2, project, r){
      if(!prod || !r) return;
      const model = appState.models.find(m => m.id === r.modelId) || appState.models[0] || {};
      const slots = Math.max(1, Number(model.slots || 2));
      const levels = Math.max(1, Number(model.levels || 4));
      const x=Number(r.x)||0, y=Number(r.y)||0, w=Math.max(10,Number(r.w)||80), d=Math.max(10,Number(r.h)||40), h=getRackRenderHeight3D(r);
      const slot = Math.min(slots, Math.max(1, Number(prod.slot || prod.slotStore || 1)));
      const level = Math.min(levels, Math.max(1, Number(prod.nivel || prod.nivelStore || 1)));
      const px = x + (slot - .5) * (w / slots), py = y + d * .52, pz = (level / levels) * h;
      const p = project(px,py,pz+16); ctx2.save(); ctx2.shadowColor='rgba(255,215,95,.95)'; ctx2.shadowBlur=20; ctx2.fillStyle='#ffd85a'; ctx2.strokeStyle='rgba(30,18,0,.72)'; ctx2.lineWidth=2; ctx2.beginPath(); ctx2.arc(p.x,p.y,9,0,Math.PI*2); ctx2.fill(); ctx2.stroke(); ctx2.restore();
      drawLabel(ctx2, project(px,py,pz+46), `N${level} · S${slot}`, true);
    }

    const buildRackMetaHtml = (rackId, nivel, slot, extraActive = '') => {
      const rack = findRackById(rackId);
      const model = rackModel(rack?.modelId) || rackModel(appState.selectedModelId) || {};
      const levelCount = Math.max(1, Number(model.levels || rack?.levels || 1) || 1);
      const slotCount = Math.max(1, Number(model.slots || model.capacity || rack?.slots || 1) || 1);
      return `
        <span class="nav3d-rack-badge">Vista 3D</span>
        <span class="nav3d-rack-badge">Niveles ${levelCount}</span>
        <span class="nav3d-rack-badge">Slots ${slotCount}</span>
        <span class="nav3d-rack-badge is-active">Nivel ${Math.max(1, Number(nivel || 1) || 1)}</span>
        <span class="nav3d-rack-badge is-active">Slot ${Math.max(1, Number(slot || 1) || 1)}</span>
        ${extraActive ? `<span class="nav3d-rack-badge is-accent">${extraActive}</span>` : ''}`;
    };
    const closeRackZoom = () => {
      if(!rackZoom) return;
      rackZoom.hidden = true;
      rackZoom.classList.remove('show');
    };
    const openRackZoom = (type) => {
      if(!rackZoom || !rackZoomSvg) return;
      const liveCtx = getViewerProductLocationContext(prod);
      const isPrimary = type === 'primary';
      const rackId = isPrimary ? liveCtx.primaryRackId : liveCtx.storeRackId;
      const fullLabel = isPrimary ? (liveCtx.primaryLoc || 'Sin ubicación principal') : (liveCtx.storeLoc || 'Sin ubicación de almacén');
      const nivel = isPrimary ? (prod?.nivel || 0) : (prod?.nivelStore || 0);
      const slot = isPrimary ? (prod?.slot || 0) : (prod?.slotStore || 0);
      rackZoomTitle.textContent = isPrimary ? 'Rack de ubicación' : 'Rack de almacén';
      rackZoomChip.textContent = rackId || '—';
      rackZoomMeta.innerHTML = buildRackMetaHtml(rackId, nivel, slot, fullLabel);
      renderRackDetail(rackId, { nivel, slot, label: isPrimary ? 'Ubicación' : 'Almacén', fullLabel }, rackZoomSvg, null, findNav3DRackById(rackId));
      rackZoom.hidden = false;
      rackZoom.classList.add('show');
    };
    rackExpandButtons.forEach(btn => btn.addEventListener('click', () => openRackZoom(btn.dataset.rackExpand)));
    modal.querySelector('[data-rack-zoom-close]')?.addEventListener('click', closeRackZoom);
    rackZoom?.addEventListener('click', e => { if(e.target === rackZoom) closeRackZoom(); });
    function renderNav3DSideRacks(){
      const liveCtx = getViewerProductLocationContext(prod);
      if(rackPrimarySvg){
        renderRackDetail(liveCtx.primaryRackId, { nivel: prod?.nivel || 0, slot: prod?.slot || 0, label:'Ubicación', fullLabel: liveCtx.primaryLoc || 'Sin ubicación' }, rackPrimarySvg, null, findNav3DRackById(liveCtx.primaryRackId));
      }
      if(rackStoreSvg){
        renderRackDetail(liveCtx.storeRackId, { nivel: prod?.nivelStore || 0, slot: prod?.slotStore || 0, label:'Almacén', fullLabel: liveCtx.storeLoc || 'Sin ubicación de almacén' }, rackStoreSvg, null, findNav3DRackById(liveCtx.storeRackId));
      }
      modal.querySelectorAll('.nav3d-rack-card .chip').forEach((chip, idx) => {
        const value = idx === 0 ? (liveCtx.primaryRackId || '—') : (liveCtx.storeRackId || '—');
        chip.textContent = value;
      });
      const tiny = modal.querySelectorAll('.nav3d-rack-head .muted.tiny');
      if(tiny[0]) tiny[0].textContent = liveCtx.primaryLoc || 'Sin ubicación principal';
      if(tiny[1]) tiny[1].textContent = liveCtx.storeLoc || 'Sin ubicación de almacén';
      const fillMeta = (id, rackId, nivel, slot) => {
        const meta = modal.querySelector(id);
        if(!meta) return;
        meta.innerHTML = buildRackMetaHtml(rackId, nivel, slot);
      };
      fillMeta('#nav3dRackPrimaryMeta', liveCtx.primaryRackId, prod?.nivel, prod?.slot);
      fillMeta('#nav3dRackStoreMeta', liveCtx.storeRackId, prod?.nivelStore, prod?.slotStore);
    }
    function render(){
      if(!canvas.isConnected) return;
      const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width)), h = Math.max(240, Math.floor(rect.height));
      canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
      const ctx2 = canvas.getContext('2d'); ctx2.setTransform(dpr,0,0,dpr,0,0); ctx2.clearRect(0,0,w,h);
      const grad = ctx2.createLinearGradient(0,0,0,h); grad.addColorStop(0,'#0c1724'); grad.addColorStop(1,'#050b13'); ctx2.fillStyle=grad; ctx2.fillRect(0,0,w,h);
      const project = projectFactory(w,h); const { focusRackIds, focusZoneIds } = getFocusSets();
      const zones = getNav3DZones().filter(z => state.isolation==='all' || focusZoneIds.has(z.id));
      const racks = getNav3DRacks().filter(r => state.isolation==='all' || (state.isolation==='zone' ? focusZoneIds.has(r.zoneId) : focusRackIds.has(r.id)));
      zones.forEach(z => { const active = focusZoneIds.has(z.id); const pts = (z.pts||[]).map(pt => project(Number(pt.x)||0, Number(pt.y)||0, 0)); drawPoly(ctx2, pts, active ? 'rgba(87,210,146,.18)' : 'rgba(125,170,210,.13)', active ? 'rgba(112,255,177,.52)' : 'rgba(180,220,255,.17)', active ? 2 : 1); const c = centroid(z.pts || []); drawLabel(ctx2, project(c.x,c.y,8), z.name || z.id, active); });
      racks.slice().sort((a,b)=> ((Number(a.y)||0)+(Number(a.x)||0)) - ((Number(b.y)||0)+(Number(b.x)||0)) ).forEach(r => {
        const isActiveRack = focusRackIds.has(r.id);
        const isGhostRack = state.ghost && !!prod && !isActiveRack;
        if(isActiveRack) drawRackShape(ctx2, project, r, true, false);
        else drawRackBasic(ctx2, project, r, false, isGhostRack);
      });
      focusRackIds.forEach(rid => { const r = findNav3DRackById(rid); if(r) drawProductRoute(ctx2, project, r); });
      focusRackIds.forEach(rid => { const r = findNav3DRackById(rid); if(r) drawProductMarker(ctx2, project, r); });
      if(compass){ const deg = Math.round((((state.yaw * 180/Math.PI) % 360) + 360) % 360); compass.textContent = `N · ${deg}°`; }
      renderNav3DSideRacks();
    }
    function resetFocus(){
      state.targetYaw = -Math.PI/4;
      state.targetPitch = .78;
      state.targetZoom = 1;
      state.targetPanX = 0;
      state.targetPanY = 0;
      requestSmoothRender();
    }
    modal.querySelectorAll('[data-nav3d-action]').forEach(btn => btn.addEventListener('click', () => {
      const action = btn.dataset.nav3dAction;
      if(action === 'all' || action === 'zone' || action === 'rack') state.isolation = action;
      if(action === 'ghost') state.ghost = !state.ghost;
      if(action === 'labels') state.labels = !state.labels;
      if(action === 'route') state.route = !state.route;
      if(action === 'slot'){
        state.isolation='rack';
        resetFocus();
        state.targetZoom = 1.75;
      }
      if(action === 'focus') resetFocus();
      modal.querySelectorAll('[data-nav3d-action="all"],[data-nav3d-action="zone"],[data-nav3d-action="rack"]').forEach(b => b.classList.toggle('active', b.dataset.nav3dAction === state.isolation));
      modal.querySelector('[data-nav3d-action="ghost"]')?.classList.toggle('active', state.ghost);
      modal.querySelector('[data-nav3d-action="labels"]')?.classList.toggle('active', state.labels);
      modal.querySelector('[data-nav3d-action="route"]')?.classList.toggle('active', state.route);
      requestSmoothRender();
    }));
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('pointerdown', e => { state.dragging = true; state.lastX=e.clientX; state.lastY=e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if(!state.dragging) return;
      const dx=e.clientX-state.lastX, dy=e.clientY-state.lastY;
      state.lastX=e.clientX; state.lastY=e.clientY;
      if(e.shiftKey || e.buttons === 4 || e.button === 1){
        state.targetPanX += dx * 0.72;
        state.targetPanY += dy * 0.72;
      } else {
        state.targetYaw += dx * 0.0032;
        state.targetPitch = clamp(state.targetPitch + dy * 0.0024, 0.34, 1.18);
      }
      requestSmoothRender();
    });
    canvas.addEventListener('pointerup', e => { state.dragging=false; try{canvas.releasePointerCapture(e.pointerId)}catch{}; });
    canvas.addEventListener('pointerleave', () => { state.dragging = false; });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.94 : 1.06;
      state.targetZoom = clamp(state.targetZoom * factor, .45, 3.2);
      requestSmoothRender();
    }, { passive:false });
    window.addEventListener('resize', render);
    setTimeout(() => { render(); requestSmoothRender(); }, 40);
  }


  // V45: Three.js/WebGL paso 2: materiales, luces, sombras y ruta 3D con glow.
  function loadThreeRuntime(){
    if(window.THREE) return Promise.resolve(window.THREE);
    if(window.__threeRuntimePromise) return window.__threeRuntimePromise;
    window.__threeRuntimePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      script.async = true;
      script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error('Three.js no quedó disponible'));
      script.onerror = () => reject(new Error('No se pudo cargar Three.js'));
      document.head.appendChild(script);
    });
    return window.__threeRuntimePromise;
  }

  function openNavigable3DModal(prod = appState.selectedProduct){
    const existing = document.getElementById('navigable3DModal');
    if(existing) existing.remove();
    const ctx = getViewerProductLocationContext(prod);
    ensureAppRuntimeState();
    const currentVisualMode = appState.ui?.nav3DVisualMode || 'operativo';
    const modal = document.createElement('div');
    modal.id = 'navigable3DModal';
    modal.className = 'nav3d-backdrop show nav3d-webgl-mode';
    modal.innerHTML = `
      <div class="nav3d-shell">
        <div class="nav3d-head">
          <div>
            <div class="search-card-kicker">Ubicación visual · WebGL</div>
            <h2>3D enfocado al producto</h2>
            <p>Visualización 3D limpia del rack activo dentro del espacio del local.</p>
          </div>
          <div class="nav3d-actions">
            <div class="nav3d-head-location">${escapeHtml(ctx.primaryLoc || 'Sin ubicación')}</div>
            <div class="nav3d-target-switch" id="nav3dTargetSwitch">
              <button type="button" class="active" data-nav3d-target="primary">Ubicación</button>
              <button type="button" data-nav3d-target="store">Almacén</button>
              <button type="button" data-nav3d-target="both">Ambas</button>
            </div>
            <button class="iso-tool nav3d-solo-location active" data-nav3d-action="solo">Solo ubicación</button>
            <button class="iso-tool" data-nav3d-action="focus">Centrar</button>
            <button class="iso-tool ${appState.ui?.nav3DWallCut ? 'active' : ''}" data-nav3d-action="wall-cut">Vista corte</button>
            <button class="iso-tool ${appState.ui?.nav3DArchitectural ? 'active' : ''}" data-nav3d-action="arch-mode">Arquitectónico</button>
            <button class="iso-tool ${appState.ui?.nav3DRoof ? 'active' : ''}" data-nav3d-action="roof-toggle">Techo</button>
            <button class="iso-tool" data-nav3d-action="camera-top">Planta 3D</button>
            <div class="nav3d-visual-switch">
              <button class="iso-tool visual-mode" data-nav3d-action="visual-dark">Oscuro</button>
              <button class="iso-tool visual-mode active" data-nav3d-action="visual-operativo">Operativo</button>
              <button class="iso-tool visual-mode" data-nav3d-action="visual-claro">Claro</button>
            </div>
            <button class="location-modal-close" type="button" aria-label="Cerrar">✕</button>
          </div>
        </div>
        <div class="nav3d-body">
          <div class="nav3d-stage">
            <canvas id="nav3dCanvas"></canvas>
            <div class="nav3d-hud">
              <b>Controles</b>
              <span>Arrastrar: orbitar suave</span>
              <span>Rueda: zoom progresivo</span>
              <span>Shift + arrastrar: pan</span>
            </div>
            <div class="nav3d-compass" id="nav3dCompass">N</div>
            <div class="nav3d-loading" id="nav3dLoading">Cargando motor 3D…</div>
            <div class="nav3d-product-card" id="nav3dProductCard"></div>
            <div class="nav3d-minimap" id="nav3dMiniMap"></div>
            <div class="nav3d-rack-popover" id="nav3dRackPopover" hidden></div>
            <div class="nav3d-hover-label" id="nav3dHoverLabel" hidden></div>
          </div>
          <div class="nav3d-side">
            <div class="nav3d-rack-card is-primary">
              <div class="nav3d-rack-head">
                <div><b>Rack de ubicación</b><div class="muted tiny">${escapeHtml(ctx.primaryRackId || '—')}</div></div>
                <div class="nav3d-rack-tools"><button class="nav3d-rack-expand" type="button" data-rack-expand="primary">⤢</button></div>
              </div>
              <div class="nav3d-rack-stage"><svg id="nav3dRackPrimary"></svg></div>
              <div class="nav3d-rack-meta" id="nav3dRackPrimaryMeta"></div>
            </div>
            <div class="nav3d-rack-card is-store">
              <div class="nav3d-rack-head">
                <div><b>Rack de almacén</b><div class="muted tiny">${escapeHtml(ctx.storeRackId || '—')}</div></div>
                <div class="nav3d-rack-tools"><button class="nav3d-rack-expand" type="button" data-rack-expand="store">⤢</button></div>
              </div>
              <div class="nav3d-rack-stage"><svg id="nav3dRackStore"></svg></div>
              <div class="nav3d-rack-meta" id="nav3dRackStoreMeta"></div>
            </div>
          </div>
        </div>
        <div class="nav3d-rack-zoom" id="nav3dRackZoom" hidden>
          <div class="nav3d-rack-zoom-card">
            <div class="nav3d-rack-zoom-head">
              <div><div class="search-card-kicker">Vista ampliada</div><b id="nav3dRackZoomTitle">Rack</b></div>
              <div class="nav3d-rack-tools"><span class="chip" id="nav3dRackZoomChip">—</span><button class="nav3d-rack-expand" type="button" data-rack-zoom-close>✕</button></div>
            </div>
            <div class="nav3d-rack-zoom-stage"><svg id="nav3dRackZoomSvg"></svg></div>
            <div class="nav3d-rack-meta" id="nav3dRackZoomMeta"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const canvas = modal.querySelector('#nav3dCanvas');
    const loading = modal.querySelector('#nav3dLoading');
    const compass = modal.querySelector('#nav3dCompass');
    const rackPopover = modal.querySelector('#nav3dRackPopover');
    const hoverLabel = modal.querySelector('#nav3dHoverLabel');
    const productCard = modal.querySelector('#nav3dProductCard');
    const miniMap = modal.querySelector('#nav3dMiniMap');
    const rackPrimarySvg = modal.querySelector('#nav3dRackPrimary');
    const rackStoreSvg = modal.querySelector('#nav3dRackStore');
    const rackZoom = modal.querySelector('#nav3dRackZoom');
    const rackZoomSvg = modal.querySelector('#nav3dRackZoomSvg');
    const rackZoomTitle = modal.querySelector('#nav3dRackZoomTitle');
    const rackZoomChip = modal.querySelector('#nav3dRackZoomChip');
    const rackZoomMeta = modal.querySelector('#nav3dRackZoomMeta');
    const baseRackModel = () => rackModel(appState.selectedModelId) || appState.models?.[0] || { id:'std_4', name:'Rack estándar', levels:4, slots:2, width:120, depth:40, height:240, clearance:0, style:'metallic' };
    const makeVirtualRack = (rackId, loc, isStore=false, index=0) => {
      const model = baseRackModel();
      const parsed = parseLocationCode(loc || rackId || '', isStore ? 'ALM-E1' : 'Z1-E1');
      const id = rackId || parsed.rackId || (isStore ? 'ALM-E1' : 'Z1-E1');
      return { id, modelId:model.id, zoneId:parsed.zoneId || (isStore ? 'ALM' : 'Z1'), x:isStore ? 200 : 0, y:index * 150, w:Number(model.width || 120) || 120, h:Number(model.depth || 56) || 56, rackHeight:Number(model.height || 240) || 240, baseHeight:0, _virtual:true };
    };
    const getVirtualRacks = () => {
      const liveCtx = getViewerProductLocationContext(prod);
      const out = [];
      if(liveCtx.primaryRackId && !findRackById(liveCtx.primaryRackId)) out.push(makeVirtualRack(liveCtx.primaryRackId, liveCtx.primaryLoc, false, 0));
      if(liveCtx.storeRackId && liveCtx.storeRackId !== liveCtx.primaryRackId && !findRackById(liveCtx.storeRackId)) out.push(makeVirtualRack(liveCtx.storeRackId, liveCtx.storeLoc, true, 1));
      if(!out.length && !(appState.layout?.racks || []).length){
        out.push(makeVirtualRack(liveCtx.primaryRackId || 'Z1-E1', liveCtx.primaryLoc || 'Z1-E1-N1-S1', false, 0));
        if(liveCtx.storeRackId && liveCtx.storeRackId !== liveCtx.primaryRackId) out.push(makeVirtualRack(liveCtx.storeRackId, liveCtx.storeLoc, true, 1));
      }
      return out;
    };
    const getNav3DRacks = () => {
      const real = Array.isArray(appState.layout?.racks) ? appState.layout.racks.slice() : [];
      const realIds = new Set(real.map(r => r.id));
      getVirtualRacks().forEach(r => { if(!realIds.has(r.id)) real.push(r); });
      return real;
    };
    const findNav3DRackById = (id) => findRackById(id) || getVirtualRacks().find(r => r.id === id) || null;
    const getTargetRackId = () => {
      const liveCtx = getViewerProductLocationContext(prod);
      if(ui.target === 'store') return liveCtx.storeRackId || prod?.rackStore || '';
      return liveCtx.primaryRackId || prod?.rack || '';
    };
    const getTargetLoc = () => {
      const liveCtx = getViewerProductLocationContext(prod);
      if(ui.target === 'both') return `${liveCtx.primaryLoc || 'Sin ubicación principal'}${liveCtx.storeLoc && liveCtx.storeLoc !== liveCtx.primaryLoc ? ' · ' + liveCtx.storeLoc : ''}`;
      return ui.target === 'store' ? (liveCtx.storeLoc || 'Sin ubicación de almacén') : (liveCtx.primaryLoc || 'Sin ubicación principal');
    };
    const getFocusSets = () => {
      const liveCtx = getViewerProductLocationContext(prod);
      const targetRackId = getTargetRackId();
      const focusRackIds = new Set([targetRackId, ui.selectedRackId, appState.ui?.nav3DSelectedRackId].filter(Boolean));
      if(ui.isolation === 'solo') [liveCtx.primaryRackId, liveCtx.storeRackId].filter(Boolean).forEach(id => focusRackIds.add(id));
      const focusZoneIds = new Set([]);
      if((ui.target === 'store' || ui.target === 'both') && prod?.zonaStore) focusZoneIds.add(prod.zonaStore);
      if((ui.target !== 'store' || ui.target === 'both') && prod?.zona) focusZoneIds.add(prod.zona);
      focusRackIds.forEach(rid => { const r = findNav3DRackById(rid); if(r?.zoneId) focusZoneIds.add(r.zoneId); });
      return { focusRackIds, focusZoneIds };
    };
    const getBounds = () => {
      const pts = [];
      (Array.isArray(appState.layout?.zones) ? appState.layout.zones : []).forEach(z => (z.pts || []).forEach(pt => pts.push({x:Number(pt.x)||0,y:Number(pt.y)||0})));
      getNav3DRacks().forEach(r => { const x=Number(r.x)||0,y=Number(r.y)||0,w=Math.max(10,Number(r.w)||80),d=Math.max(10,Number(r.h)||40); pts.push({x,y},{x:x+w,y},{x:x+w,y:y+d},{x,y:y+d}); });
      if(!pts.length) pts.push({x:-250,y:-180},{x:250,y:180});
      const minX=Math.min(...pts.map(p=>p.x)), maxX=Math.max(...pts.map(p=>p.x)), minY=Math.min(...pts.map(p=>p.y)), maxY=Math.max(...pts.map(p=>p.y));
      return { minX,maxX,minY,maxY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY),cx:(minX+maxX)/2,cy:(minY+maxY)/2 };
    };
    const buildRackMetaHtml = (rackId, nivel, slot, extraActive = '') => {
      const rack = findNav3DRackById(rackId);
      const model = rackModel(rack?.modelId) || baseRackModel();
      const levelCount = Math.max(1, Number(model.levels || 1) || 1);
      const slotCount = Math.max(1, Number(model.slots || model.capacity || 1) || 1);
      const activeLevel = Math.max(1, Number(nivel || 1) || 1);
      const activeSlot = Math.max(1, Number(slot || 1) || 1);
      return `<span class="nav3d-rack-badge is-active">Activo N${activeLevel} · S${activeSlot}</span><span class="nav3d-rack-badge">${levelCount} niveles</span><span class="nav3d-rack-badge">${slotCount} slots</span>${extraActive ? `<span class="nav3d-rack-badge is-accent">${escapeHtml(extraActive)}</span>` : ''}`;
    };
    const renderSideRacks = () => {
      const liveCtx = getViewerProductLocationContext(prod);
      renderRackDetail(liveCtx.primaryRackId, { nivel: prod?.nivel || 0, slot: prod?.slot || 0, label:'Ubicación', fullLabel:liveCtx.primaryLoc || 'Sin ubicación' }, rackPrimarySvg, null, findNav3DRackById(liveCtx.primaryRackId));
      renderRackDetail(liveCtx.storeRackId, { nivel: prod?.nivelStore || 0, slot: prod?.slotStore || 0, label:'Almacén', fullLabel:liveCtx.storeLoc || 'Sin ubicación de almacén' }, rackStoreSvg, null, findNav3DRackById(liveCtx.storeRackId));
      modal.querySelector('#nav3dRackPrimaryMeta').innerHTML = buildRackMetaHtml(liveCtx.primaryRackId, prod?.nivel, prod?.slot);
      modal.querySelector('#nav3dRackStoreMeta').innerHTML = buildRackMetaHtml(liveCtx.storeRackId, prod?.nivelStore, prod?.slotStore);
      modal.querySelector('.nav3d-rack-card.is-primary')?.classList.toggle('target-active', ui.target === 'primary' || ui.target === 'both');
      modal.querySelector('.nav3d-rack-card.is-store')?.classList.toggle('target-active', ui.target === 'store' || ui.target === 'both');
      renderProductOperationalCard();
      renderMiniMap();
    };
    const openRackZoom = (type) => {
      const liveCtx = getViewerProductLocationContext(prod);
      const isPrimary = type === 'primary';
      const rackId = isPrimary ? liveCtx.primaryRackId : liveCtx.storeRackId;
      const fullLabel = isPrimary ? liveCtx.primaryLoc : liveCtx.storeLoc;
      const nivel = isPrimary ? prod?.nivel : prod?.nivelStore;
      const slot = isPrimary ? prod?.slot : prod?.slotStore;
      rackZoomTitle.textContent = isPrimary ? 'Rack de ubicación' : 'Rack de almacén';
      rackZoomChip.textContent = rackId || '—';
      rackZoomMeta.innerHTML = buildRackMetaHtml(rackId, nivel, slot, fullLabel);
      renderRackDetail(rackId, { nivel, slot, label: isPrimary ? 'Ubicación' : 'Almacén', fullLabel }, rackZoomSvg, null, findNav3DRackById(rackId));
      rackZoom.hidden = false; rackZoom.classList.add('show');
    };

    let renderer = null, scene = null, camera = null, animation = 0, resizeObserver = null;
    const activePulseTargets = [];
    const ui = { isolation:'solo', ghost:true, labels:true, route:true, visual: currentVisualMode, target: appState.ui?.nav3DTarget || 'primary', selectedRackId: appState.ui?.nav3DSelectedRackId || '', arch:!!appState.ui?.nav3DArchitectural, roof:!!appState.ui?.nav3DRoof };
    const close = () => { cancelAnimationFrame(animation); resizeObserver?.disconnect(); renderer?.dispose?.(); modal.remove(); };
    modal.querySelector('.location-modal-close')?.addEventListener('click', close);
    modal.addEventListener('click', e => { if(e.target === modal) close(); });
    modal.querySelectorAll('[data-rack-expand]').forEach(btn => btn.addEventListener('click', () => openRackZoom(btn.dataset.rackExpand)));
    modal.querySelector('[data-rack-zoom-close]')?.addEventListener('click', () => { rackZoom.hidden=true; rackZoom.classList.remove('show'); });
    rackZoom?.addEventListener('click', e => { if(e.target === rackZoom){ rackZoom.hidden=true; rackZoom.classList.remove('show'); } });

    const syncToolbar = () => {
      modal.querySelectorAll('[data-nav3d-action="all"],[data-nav3d-action="zone"],[data-nav3d-action="rack"],[data-nav3d-action="solo"]').forEach(b => b.classList.toggle('active', b.dataset.nav3dAction === ui.isolation));
      modal.querySelector('[data-nav3d-action="ghost"]')?.classList.toggle('active', ui.ghost);
      modal.querySelector('[data-nav3d-action="labels"]')?.classList.toggle('active', ui.labels);
      modal.querySelector('[data-nav3d-action="route"]')?.classList.toggle('active', ui.route);
      modal.querySelectorAll('[data-nav3d-action^="visual-"]').forEach(b => b.classList.toggle('active', b.dataset.nav3dAction === `visual-${ui.visual}`));
      modal.querySelector('[data-nav3d-action="wall-cut"]')?.classList.toggle('active', !!appState.ui?.nav3DWallCut);
      modal.querySelector('[data-nav3d-action="arch-mode"]')?.classList.toggle('active', !!appState.ui?.nav3DArchitectural);
      modal.querySelector('[data-nav3d-action="roof-toggle"]')?.classList.toggle('active', !!appState.ui?.nav3DRoof);
      modal.querySelectorAll('[data-nav3d-target]').forEach(b => b.classList.toggle('active', b.dataset.nav3dTarget === ui.target));
    };

    const rackStatsForPopover = (rackId) => {
      const rack = findNav3DRackById(rackId);
      const model = rackModel(rack?.modelId) || baseRackModel();
      const levelCount = Math.max(1, Number(model.levels || 1) || 1);
      const slotCount = Math.max(1, Number(model.slots || model.capacity || 1) || 1);
      const liveCtx = getViewerProductLocationContext(prod);
      const isPrimary = rackId && rackId === liveCtx.primaryRackId;
      const isStore = rackId && rackId === liveCtx.storeRackId;
      const level = isPrimary ? (prod?.nivel || 1) : (isStore ? (prod?.nivelStore || 1) : 1);
      const slot = isPrimary ? (prod?.slot || 1) : (isStore ? (prod?.slotStore || 1) : 1);
      return { rack, model, levelCount, slotCount, level, slot, isPrimary, isStore };
    };
    const renderRackPopover = (rackId) => {
      if(!rackPopover) return;
      const { rack, levelCount, slotCount, level, slot, isPrimary, isStore } = rackStatsForPopover(rackId);
      if(!rack || !rackId){ rackPopover.hidden = true; return; }
      const zone = rack.zoneId || (isStore ? 'Almacén' : 'Zona');
      rackPopover.hidden = false;
      rackPopover.innerHTML = `
        <div class="nav3d-popover-head"><span>${isPrimary ? 'Ubicación' : isStore ? 'Almacén' : 'Rack'}</span><b>${escapeHtml(rackId)}</b></div>
        <div class="nav3d-popover-grid compact">
          <span>Zona</span><b>${escapeHtml(zone)}</b>
          <span>Activo</span><b>N${escapeHtml(String(level))} · S${escapeHtml(String(slot))}</b>
        </div>
        <div class="nav3d-popover-actions">
          <button type="button" data-popover-action="center">Enfocar slot</button>
        </div>`;
    };

    const renderProductOperationalCard = () => {
      if(!productCard) return;
      const liveCtx = getViewerProductLocationContext(prod);
      const isBoth = ui.target === 'both';
      const targetLoc = getTargetLoc();
      const level = ui.target === 'store' ? (prod?.nivelStore || '—') : (prod?.nivel || '—');
      const slot = ui.target === 'store' ? (prod?.slotStore || '—') : (prod?.slot || '—');
      const rackId = ui.target === 'store' ? (liveCtx.storeRackId || prod?.rackStore || '—') : (liveCtx.primaryRackId || prod?.rack || '—');
      productCard.innerHTML = `
        <div class="nav3d-product-topline compact">
          <div>
            <div class="nav3d-product-kicker">Producto activo</div>
            <b>${escapeHtml(prod?.nombre || 'Producto sin nombre')}</b>
          </div>
          <div class="nav3d-product-sku">${escapeHtml(prod?.sku || 'SKU —')}</div>
        </div>
        <div class="nav3d-product-inline-location">${escapeHtml(isBoth ? `${liveCtx.primaryLoc || '—'} · ${liveCtx.storeLoc || '—'}` : targetLoc)}</div>
        ${isBoth ? `
          <div class="nav3d-product-focus dual">
            <span class="nav3d-focus-pill">Ubicación <b>${escapeHtml(liveCtx.primaryRackId || '—')}</b></span>
            <span class="nav3d-focus-pill">Almacén <b>${escapeHtml(liveCtx.storeRackId || '—')}</b></span>
          </div>` : `
          <div class="nav3d-product-focus">
            <span class="nav3d-focus-pill">Rack <b>${escapeHtml(rackId)}</b></span>
            <span class="nav3d-focus-pill">Nivel <b>${escapeHtml(String(level))}</b></span>
            <span class="nav3d-focus-pill nav3d-focus-pill-slot">Slot <b>${escapeHtml(String(slot))}</b></span>
          </div>`}
        <div class="nav3d-product-actions nav3d-product-actions-focused compact">
          <button type="button" data-nav3d-product-action="center">Enfocar slot</button>
          <button type="button" data-nav3d-product-action="isolate">Aislar rack</button>
        </div>`;
    };
    const renderMiniMap = () => {
      if(!miniMap) return;
      const b = getBounds();
      const w = 210, h = 140, pad = 14;
      const sx = (x) => pad + ((Number(x||0) - b.minX) / Math.max(1,b.w)) * (w - pad*2);
      const sy = (y) => pad + ((Number(y||0) - b.minY) / Math.max(1,b.h)) * (h - pad*2);
      const { focusRackIds, focusZoneIds } = getFocusSets();
      const zones = Array.isArray(appState.layout?.zones) ? appState.layout.zones : [];
      const zonePaths = zones.map(z => {
        const pts = (z.pts || []).map((pt,i) => `${i?'L':'M'} ${sx(pt.x).toFixed(1)} ${sy(pt.y).toFixed(1)}`).join(' ');
        const active = focusZoneIds.has(z.id);
        return `<path d="${pts} Z" class="${active?'active':''}"/>`;
      }).join('');
      const rackDots = getNav3DRacks().map(r => {
        const cx = sx(Number(r.x||0)+Number(r.w||80)/2), cy = sy(Number(r.y||0)+Number(r.h||40)/2);
        const active = focusRackIds.has(r.id);
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${active?4.4:2.4}" class="${active?'active':''}"><title>${escapeHtml(r.id)}</title></circle>`;
      }).join('');
      const targetLabel = ui.target === 'store' ? 'Almacén activo' : ui.target === 'both' ? 'Ubicaciones activas' : 'Rack activo';
      miniMap.innerHTML = `<div class="nav3d-mini-head"><b>Mini mapa</b><span>${escapeHtml(getTargetRackId() || '—')}</span></div><div class="nav3d-mini-sub">${targetLabel}</div><svg viewBox="0 0 ${w} ${h}" aria-label="Mini mapa de layout">${zonePaths}${rackDots}</svg>`;
    };

    loadThreeRuntime().then(THREE => {
      loading?.remove();
      renderSideRacks();
      const visualProfiles = {
        oscuro: { bg:0x061018, fog:.022, exposure:1.10, ambient:.52, hemi:.95, key:2.8, fill:.78, rim:1.15, active:2.0, floor:0x0b1722, floorA:'#102235', floorB:'#091827', floorC:'#07121d', grid:.36, ghost:.12, wire:.22 },
        operativo: { bg:0x081722, fog:.014, exposure:1.48, ambient:.82, hemi:1.42, key:3.75, fill:1.15, rim:1.55, active:2.9, floor:0x132638, floorA:'#183149', floorB:'#102338', floorC:'#0c1b2c', grid:.58, ghost:.20, wire:.40 },
        claro: { bg:0x0d2232, fog:.010, exposure:1.72, ambient:1.05, hemi:1.70, key:4.25, fill:1.38, rim:1.75, active:3.2, floor:0x1a3347, floorA:'#234159', floorB:'#173047', floorC:'#102538', grid:.68, ghost:.26, wire:.52 }
      };
      const visual = visualProfiles[ui.visual] || visualProfiles.operativo;
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const pickables = [];
      let hoveredRackId = '';
      let downX = 0, downY = 0, downTime = 0, downMoved = false;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(visual.bg);
      scene.fog = new THREE.FogExp2(visual.bg, visual.fog);
      renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'high-performance' });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = visual.exposure;
      camera = new THREE.PerspectiveCamera(42, 1, .1, 500);
      const ambient = new THREE.AmbientLight(0xc7e7ff, visual.ambient); scene.add(ambient);
      const hemi = new THREE.HemisphereLight(0xf2fbff, 0x153047, visual.hemi); scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, visual.key); key.position.set(16,38,22); key.castShadow = true; key.shadow.mapSize.set(2048,2048); key.shadow.camera.near=.5; key.shadow.camera.far=90; key.shadow.camera.left=-38; key.shadow.camera.right=38; key.shadow.camera.top=38; key.shadow.camera.bottom=-38; scene.add(key);
      const fill = new THREE.DirectionalLight(0x8fc5ff, visual.fill); fill.position.set(-26,18,24); scene.add(fill);
      const rim = new THREE.DirectionalLight(0x70ffb1, visual.rim); rim.position.set(-22,24,-18); scene.add(rim);
      const activeLight = new THREE.PointLight(0x57ff98, visual.active, 26, 1.7); activeLight.position.set(0, 5.2, 0); scene.add(activeLight);

      const bounds = getBounds();
      const scale = 0.035;
      const hScale = 0.020;
      const world = new THREE.Group(); scene.add(world);
      // V49: sistema único layout 2D → mundo 3D.
      // El editor usa X hacia la derecha e Y hacia abajo. En Three.js usamos X igual y Z como profundidad positiva,
      // para que una vista superior conserve la misma lectura del plano 2D.
      const layoutToWorld = (x, y, z=0) => new THREE.Vector3((Number(x||0)-bounds.cx)*scale, z*hScale, (Number(y||0)-bounds.cy)*scale);
      const layoutToShapePoint = (pt) => new THREE.Vector2((Number(pt?.x||0)-bounds.cx)*scale, -(Number(pt?.y||0)-bounds.cy)*scale);
      const toWorld = layoutToWorld;
      const rackYaw = (r) => -THREE.MathUtils.degToRad(Number(r?.rot || 0) || 0);
      const makeFloorTexture = () => {
        const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
        const g = c.getContext('2d');
        const grad = g.createLinearGradient(0,0,1024,1024);
        grad.addColorStop(0, visual.floorA); grad.addColorStop(.55, visual.floorB); grad.addColorStop(1, visual.floorC);
        g.fillStyle = grad; g.fillRect(0,0,1024,1024);
        g.strokeStyle = ui.visual === 'oscuro' ? 'rgba(125,210,185,.13)' : 'rgba(145,225,205,.18)'; g.lineWidth = 1;
        for(let i=0;i<=1024;i+=64){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,1024); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(1024,i); g.stroke(); }
        g.strokeStyle = ui.visual === 'oscuro' ? 'rgba(255,190,72,.20)' : 'rgba(255,205,82,.30)'; g.lineWidth = 3;
        for(let i=128;i<1024;i+=256){ g.beginPath(); g.moveTo(0,i); g.lineTo(1024,i); g.stroke(); }
        g.fillStyle = 'rgba(255,255,255,.025)';
        for(let i=0;i<180;i++){ const x=Math.random()*1024,y=Math.random()*1024; g.fillRect(x,y,1.2,1.2); }
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2,2); return tex;
      };
      const floorW = Math.max(12, bounds.w*scale + 6), floorD = Math.max(12, bounds.h*scale + 6);
      const { focusRackIds, focusZoneIds } = getFocusSets();
      const layoutZonesRaw = Array.isArray(appState.layout?.zones) ? appState.layout.zones.filter(z => (z.pts || []).length >= 3) : [];
      // V62: mantener el layout completo como referencia espacial. Las zonas fuera del foco quedan en modo ghost,
      // mientras que la zona activa conserva mayor presencia visual.
      const layoutZones = layoutZonesRaw;
      const floorMat = new THREE.MeshStandardMaterial({ color:visual.floor, map:layoutZones.length ? null : makeFloorTexture(), roughness:.46, metalness:.22, envMapIntensity:.45, transparent:!!layoutZones.length, opacity:layoutZones.length ? .055 : 1 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), floorMat); floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; world.add(floor);
      const grid = new THREE.GridHelper(Math.max(floorW,floorD), Math.max(12, Math.round(Math.max(floorW,floorD)*2.6)), 0x6ff0b4, 0x2f6680); grid.position.y=.028; grid.material.transparent = true; grid.material.opacity = appState.ui?.nav3DArchitectural ? Math.min(.16, visual.grid*.24) : Math.min(.34, visual.grid*.48); world.add(grid);

      const DEFAULT_WALL_HEIGHT = 290;
      const DEFAULT_WALL_THICKNESS = 14;
      const buildWallSegmentsFromLayout = () => {
        try { syncZonePerimeterWalls(); ensureLayoutDecorations(); } catch(_err) {}
        const walls = Array.isArray(appState.layout?.walls) ? appState.layout.walls : [];
        return walls.map(w => ({
          raw:w,
          a:{ x:Number(w.x1||0), y:Number(w.y1||0) },
          b:{ x:Number(w.x2||0), y:Number(w.y2||0) },
          zoneIds:new Set([w.zoneId].filter(Boolean)),
          thickness:Number(w.thickness || DEFAULT_WALL_THICKNESS),
          height:Number(w.height || DEFAULT_WALL_HEIGHT),
          id:w.id,
          type:w.kind || 'wall',
          autoZoneEdge:!!w.autoZoneEdge,
          zoneId:w.zoneId || '',
          edgeIndex:Number(w.edgeIndex),
          side:getWallSideSign(w.side)
        })).filter(seg => Math.hypot(seg.b.x - seg.a.x, seg.b.y - seg.a.y) > 2);
      };
      const getSegmentNormal = (seg) => {
        if(seg?.autoZoneEdge && seg.zoneId && Number.isFinite(seg.edgeIndex)){
          const zone = findZoneById(seg.zoneId);
          if(zone?.pts?.[seg.edgeIndex] && zone?.pts?.[(seg.edgeIndex + 1) % zone.pts.length]){
            const a = zone.pts[seg.edgeIndex];
            const b = zone.pts[(seg.edgeIndex + 1) % zone.pts.length];
            const n = getZoneOutwardEdgeNormal(zone, a, b);
            return { x:n.x * getWallSideSign(seg.side), y:n.y * getWallSideSign(seg.side) };
          }
        }
        const dx = Number(seg.b?.x||0) - Number(seg.a?.x||0);
        const dy = Number(seg.b?.y||0) - Number(seg.a?.y||0);
        const len = Math.hypot(dx, dy) || 1;
        return { x:-dy/len, y:dx/len };
      };
      const makeWallPrismGeometry = (footprint=[], height=2.8) => {
        const pts = (footprint || []).filter(Boolean).map(pt => ({
          x:(Number(pt.x || 0) - bounds.cx) * scale,
          z:(Number(pt.y || 0) - bounds.cy) * scale
        }));
        if(pts.length < 3 || !Number.isFinite(height) || height <= 0) return null;
        const positions = [];
        pts.forEach(pt => positions.push(pt.x, 0, pt.z));
        pts.forEach(pt => positions.push(pt.x, height, pt.z));
        const indices = [];
        const n = pts.length;
        for(let i=1; i<n-1; i++){
          indices.push(0, i+1, i);
          indices.push(n, n+i, n+i+1);
        }
        for(let i=0; i<n; i++){
          const j = (i + 1) % n;
          indices.push(i, j, n+j);
          indices.push(i, n+j, n+i);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
      };
      const makeWallBandGeometry = (seg, t0, t1, y0, y1, thicknessUnits, offsetUnits=0) => {
        const height = Math.max(.02, Number(y1 || 0) - Number(y0 || 0));
        if(t1 - t0 <= .002 || height <= .02) return null;
        const ax = Number(seg.a?.x || 0), ay = Number(seg.a?.y || 0);
        const bx = Number(seg.b?.x || 0), by = Number(seg.b?.y || 0);
        const n = getSegmentNormal(seg);
        const a = { x:ax + (bx-ax)*t0, y:ay + (by-ay)*t0 };
        const b = { x:ax + (bx-ax)*t1, y:ay + (by-ay)*t1 };
        const offset = Number(offsetUnits || 0);
        const footprint = [
          { x:a.x + n.x*offset, y:a.y + n.y*offset },
          { x:b.x + n.x*offset, y:b.y + n.y*offset },
          { x:b.x + n.x*(offset + thicknessUnits), y:b.y + n.y*(offset + thicknessUnits) },
          { x:a.x + n.x*(offset + thicknessUnits), y:a.y + n.y*(offset + thicknessUnits) }
        ];
        const basePts = footprint.map(pt => ({ x:(Number(pt.x || 0)-bounds.cx)*scale, z:(Number(pt.y || 0)-bounds.cy)*scale }));
        const positions = [];
        basePts.forEach(pt => positions.push(pt.x, y0, pt.z));
        basePts.forEach(pt => positions.push(pt.x, y1, pt.z));
        const indices = [0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
      };
      const getWallOpeningsForSegment = (seg, rawLengthUnits) => {
        const wallOpenings = (appState.layout?.openings || []).filter(o => o.wallId === seg.id);
        return wallOpenings.map(o => {
          const width = Math.max(40, Math.min(rawLengthUnits * .86, Number(o.width || (o.type === 'window' ? 120 : 90)) || 90));
          const half = (width / 2) / Math.max(1, rawLengthUnits);
          const t = Math.max(half, Math.min(1-half, Number(o.t || .5)));
          const sillUnits = o.type === 'window' ? Math.max(0, Number(o.sill || 90) || 90) : 0;
          const heightUnits = Math.max(30, Number(o.height || (o.type === 'window' ? 100 : 210)) || 210);
          return { ...o, t, t0:Math.max(0, t-half), t1:Math.min(1, t+half), sillUnits, heightUnits };
        }).sort((a,b)=>a.t0-b.t0);
      };
      const addWallMesh = (group, geo, mat, isActive, wallId='') => {
        if(!geo) return null;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.wallId = wallId || '';
        group.add(mesh);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color:isActive ? 0xffffff : 0xd7e7f4, transparent:true, opacity:isActive ? .70 : .36 })
        );
        group.add(edges);
        return mesh;
      };
      const buildArchitecturalRoofGroup = (zones=[], activeZoneIds=new Set(), wallHeight=2.8) => {
        const group = new THREE.Group();
        if(!appState.ui?.nav3DRoof) return group;
        const roofMat = new THREE.MeshStandardMaterial({ color:0xe8f1f7, transparent:true, opacity:.18, roughness:.72, metalness:.02, side:THREE.DoubleSide, depthWrite:false });
        const roofEdgeMat = new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:.38 });
        zones.forEach(z => {
          const pts = (z.pts || []).map(layoutToShapePoint);
          if(pts.length < 3) return;
          const shape = new THREE.Shape(pts);
          const geo = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geo, roofMat);
          mesh.rotation.x = -Math.PI/2;
          mesh.position.y = Math.max(1.25, wallHeight + .035);
          group.add(mesh);
          const linePts = pts.concat([pts[0]]).map(v => new THREE.Vector3(v.x, mesh.position.y + .01, -v.y));
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), roofEdgeMat));
        });
        return group;
      };

      const buildWallGroup = (segments=[], activeZoneIds=new Set()) => {
        const group = new THREE.Group();
        if(!segments.length) return group;
        segments.forEach(seg => {
          const dx = Number(seg.b?.x||0) - Number(seg.a?.x||0);
          const dy = Number(seg.b?.y||0) - Number(seg.a?.y||0);
          const rawLengthUnits = Math.hypot(dx, dy);
          const length = rawLengthUnits * scale;
          if(length <= .08) return;
          const isActive = [...(seg.zoneIds || [])].some(id => activeZoneIds.has(id));
          const wallCut = !!appState.ui?.nav3DWallCut;
          const baseHeight = Math.max(2.8, (Number(seg.height || DEFAULT_WALL_HEIGHT) || DEFAULT_WALL_HEIGHT) * hScale);
          const height = wallCut ? Math.min(1.25, baseHeight) : baseHeight;
          const thicknessUnits = Math.max(8, Number(seg.thickness || DEFAULT_WALL_THICKNESS) || DEFAULT_WALL_THICKNESS);
          const thickness = Math.max(.24, thicknessUnits * scale);
          const wallMat = new THREE.MeshStandardMaterial({
            color:isActive ? 0xf2f7fb : 0xb8c8d8,
            transparent:true,
            opacity:appState.ui?.nav3DArchitectural ? (wallCut ? (isActive ? .74 : .48) : (isActive ? .98 : .86)) : (wallCut ? (isActive ? .62 : .38) : (isActive ? .96 : .72)),
            roughness:.78,
            metalness:.03,
            side:THREE.DoubleSide
          });
          const glassMat = new THREE.MeshStandardMaterial({ color:0x8feaff, transparent:true, opacity:appState.ui?.nav3DArchitectural ? .46 : .32, roughness:.18, metalness:.04, side:THREE.DoubleSide, depthWrite:false });
          const leafMat = new THREE.MeshStandardMaterial({ color:0x9aa8b4, transparent:true, opacity:appState.ui?.nav3DArchitectural ? .62 : .46, roughness:.55, metalness:.08, side:THREE.DoubleSide });
          const openings = getWallOpeningsForSegment(seg, rawLengthUnits);
          if(openings.length){
            let cursor = 0;
            openings.forEach(o => {
              const safeT0 = Math.max(cursor, o.t0);
              const safeT1 = Math.max(safeT0, o.t1);
              if(safeT0 > cursor + .004){
                addWallMesh(group, makeWallBandGeometry(seg, cursor, safeT0, 0, height, thicknessUnits), wallMat, isActive, seg.id);
              }
              const sill = Math.max(0, Number(o.sillUnits || 0) * hScale);
              const openingTop = Math.min(height, Math.max(.08, (Number(o.sillUnits || 0) + Number(o.heightUnits || 210)) * hScale));
              if(sill > .035){
                addWallMesh(group, makeWallBandGeometry(seg, safeT0, safeT1, 0, Math.min(sill, height), thicknessUnits), wallMat, isActive, seg.id);
              }
              if(openingTop < height - .035){
                addWallMesh(group, makeWallBandGeometry(seg, safeT0, safeT1, openingTop, height, thicknessUnits), wallMat, isActive, seg.id);
              }
              // v84: el vano se representa como vacío real en 3D.
              // No añadimos hojas, marcos sólidos ni vidrios fantasma dentro del hueco.
              cursor = Math.max(cursor, safeT1);
            });
            if(cursor < .996){
              addWallMesh(group, makeWallBandGeometry(seg, cursor, 1, 0, height, thicknessUnits), wallMat, isActive, seg.id);
            }
            return;
          }
          const autoPoly = seg.autoZoneEdge && seg.zoneId && Number.isFinite(seg.edgeIndex) ? getAutoWallPolygon(seg.raw || seg) : null;
          let wall = null;
          if(Array.isArray(autoPoly) && autoPoly.length >= 4){
            const geo = makeWallPrismGeometry(autoPoly, height);
            if(geo) wall = new THREE.Mesh(geo, wallMat);
          }
          if(!wall){
            const n = getSegmentNormal(seg);
            const midX = (Number(seg.a?.x||0) + Number(seg.b?.x||0))/2 + n.x * (thicknessUnits / 2);
            const midY = (Number(seg.a?.y||0) + Number(seg.b?.y||0))/2 + n.y * (thicknessUnits / 2);
            const mid = toWorld(midX, midY, 0);
            const angle = -Math.atan2(dy, dx);
            wall = new THREE.Mesh(new THREE.BoxGeometry(length, height, thickness), wallMat);
            wall.position.set(mid.x, height/2, mid.z);
            wall.rotation.y = angle;
          }
          wall.castShadow = true;
          wall.receiveShadow = true;
          wall.userData.wallId = seg.id || '';
          group.add(wall);
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(wall.geometry),
            new THREE.LineBasicMaterial({ color:isActive ? 0xffffff : 0xd7e7f4, transparent:true, opacity:isActive ? .70 : .36 })
          );
          edges.position.copy(wall.position);
          edges.rotation.copy(wall.rotation);
          edges.scale.copy(wall.scale);
          group.add(edges);
        });
        return group;
      };
      const makeZoneMaterials = (active=false) => ({
        floor: new THREE.MeshStandardMaterial({ color:active ? (appState.ui?.nav3DArchitectural ? 0xd9e4ec : 0x18394b) : (appState.ui?.nav3DArchitectural ? 0x2b3c4b : visual.floor), roughness:.62, metalness:.08, transparent:true, opacity:appState.ui?.nav3DArchitectural ? (active ? .36 : .10) : (active ? .54 : .07), side:THREE.DoubleSide, depthWrite:active }),
        overlay: new THREE.MeshBasicMaterial({ color:active ? (appState.ui?.nav3DArchitectural ? 0xe9f3fa : 0x43e68c) : 0x8eb3ca, transparent:true, opacity:appState.ui?.nav3DArchitectural ? (active ? .08 : .012) : (active ? (ui.visual === 'oscuro' ? .08 : .12) : .014), side:THREE.DoubleSide, depthWrite:false }),
        line: new THREE.LineBasicMaterial({ color:active ? (appState.ui?.nav3DArchitectural ? 0xffffff : 0x86ffd0) : 0x91bad3, transparent:true, opacity:active ? (appState.ui?.nav3DArchitectural ? .78 : (ui.visual === 'oscuro' ? .52 : .70)) : .12 })
      });
      layoutZones.forEach(z => {
        const pts = (z.pts || []).map(layoutToShapePoint);
        if(pts.length >= 3){
          const isActiveZone = focusZoneIds.has(z.id);
          const mats = makeZoneMaterials(isActiveZone);
          const shape = new THREE.Shape(pts);
          const geo = new THREE.ShapeGeometry(shape);
          const floorMesh = new THREE.Mesh(geo, mats.floor); floorMesh.rotation.x = -Math.PI/2; floorMesh.position.y=isActiveZone ? .022 : .012; floorMesh.receiveShadow = isActiveZone; world.add(floorMesh);
          const overlay = new THREE.Mesh(geo.clone(), mats.overlay); overlay.rotation.x = -Math.PI/2; overlay.position.y=isActiveZone ? .044 : .031; world.add(overlay);
          const linePts = pts.concat([pts[0]]).map(v => new THREE.Vector3(v.x, isActiveZone ? .064 : .045, -v.y));
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), mats.line); world.add(line);
        }
      });
      const zoneWallSegments = buildWallSegmentsFromLayout();
      const zoneWallsGroup = buildWallGroup(zoneWallSegments, focusZoneIds);
      zoneWallsGroup.position.y = .01;
      world.add(zoneWallsGroup);
      const maxWallHeight = Math.max(2.8, ...zoneWallSegments.map(s => (Number(s.height || DEFAULT_WALL_HEIGHT) || DEFAULT_WALL_HEIGHT) * hScale));
      const roofGroup = buildArchitecturalRoofGroup(layoutZones, focusZoneIds, appState.ui?.nav3DWallCut ? Math.min(1.25, maxWallHeight) : maxWallHeight);
      world.add(roofGroup);

      const matGhost = new THREE.MeshStandardMaterial({ color:0x9eb6d0, transparent:true, opacity:Math.min(visual.ghost, .10), roughness:.86, metalness:.08, depthWrite:false });
      const matGhostWire = new THREE.LineBasicMaterial({ color:0xd0ecff, transparent:true, opacity:Math.min(visual.wire, .24) });
      const matFrame = new THREE.MeshStandardMaterial({ color:0x0b4f82, roughness:.31, metalness:.72 });
      const matBeam = new THREE.MeshStandardMaterial({ color:0xe88a2f, roughness:.42, metalness:.48 });
      const matBox = new THREE.MeshStandardMaterial({ color:0xca9a5a, roughness:.86, metalness:.025 });
      const matBox2 = new THREE.MeshStandardMaterial({ color:0xd8d1bd, roughness:.74, metalness:.02 });
      const matWrap = new THREE.MeshStandardMaterial({ color:0xeff3e9, roughness:.62, metalness:.03 });
      const matActive = new THREE.MeshStandardMaterial({ color:0xd7ff64, emissive:0x92ff76, emissiveIntensity:1.55, transparent:true, opacity:.68, roughness:.22, metalness:.06 });
      const matRoute = new THREE.MeshStandardMaterial({ color:0x47ff91, emissive:0x38ff86, emissiveIntensity:1.12, roughness:.24, metalness:.04 });
      const matRouteHalo = new THREE.MeshBasicMaterial({ color:0x38ff86, transparent:true, opacity:ui.visual === 'oscuro' ? .12 : .18, depthWrite:false });
      const createSlotLabelSprite = (textLabel) => {
        const tag = document.createElement('canvas');
        tag.width = 256; tag.height = 96;
        const g = tag.getContext('2d');
        g.clearRect(0,0,tag.width,tag.height);
        g.fillStyle = 'rgba(6,18,28,.92)';
        g.strokeStyle = 'rgba(126,255,184,.92)';
        g.lineWidth = 4;
        const radius = 20;
        g.beginPath();
        g.moveTo(radius, 6);
        g.lineTo(tag.width - radius, 6);
        g.quadraticCurveTo(tag.width - 6, 6, tag.width - 6, radius);
        g.lineTo(tag.width - 6, tag.height - radius);
        g.quadraticCurveTo(tag.width - 6, tag.height - 6, tag.width - radius, tag.height - 6);
        g.lineTo(radius, tag.height - 6);
        g.quadraticCurveTo(6, tag.height - 6, 6, tag.height - radius);
        g.lineTo(6, radius);
        g.quadraticCurveTo(6, 6, radius, 6);
        g.closePath();
        g.fill(); g.stroke();
        g.font = '900 34px Inter, Arial, sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = '#ecfff5';
        g.fillText(textLabel, tag.width/2, tag.height/2 + 2);
        const texture = new THREE.CanvasTexture(tag);
        if('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.SpriteMaterial({ map:texture, transparent:true, depthWrite:false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.55, .58, 1);
        return sprite;
      };

      const addBox = (group, w,h,d, x,y,z, mat, cast=true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; group.add(m); return m; };
      const addCylinderBetween = (group, start, end, radius, mat, cast=false) => {
        const dir = new THREE.Vector3().subVectors(end,start);
        const len = dir.length(); if(len <= .001) return null;
        const geo = new THREE.CylinderGeometry(radius, radius, len, 16, 1, false);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(start).addScaledVector(dir,.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
        mesh.castShadow = cast; mesh.receiveShadow = true; group.add(mesh); return mesh;
      };
      const activeInfoForRack = (r) => {
        const liveCtx = getViewerProductLocationContext(prod);
        const isStore = r.id === liveCtx.storeRackId || r.id === prod?.rackStore;
        return { level: Math.max(1, Number(isStore ? prod?.nivelStore : prod?.nivel) || 1), slot: Math.max(1, Number(isStore ? prod?.slotStore : prod?.slot) || 1) };
      };
      const targetFocusForRack = (r, mode='slot') => {
        if(!r) return new THREE.Vector3(0,0,0);
        const model = rackModel(r.modelId) || baseRackModel();
        const w = Math.max(.8, (Number(r.w || model.width || 120))*scale);
        const d = Math.max(.45, (Number(r.h || model.depth || 56))*scale);
        const rackH = Math.max(1.2, (Number(r.rackHeight || model.height || 240))*hScale);
        const levels = Math.max(1, Math.min(8, Number(model.levels || 4) || 4));
        const slots = Math.max(1, Math.min(6, Number(model.slots || model.capacity || 2) || 2));
        const target = activeInfoForRack(r);
        const level = Math.max(1, Math.min(levels, Number(target.level || 1)));
        const slot = Math.max(1, Math.min(slots, Number(target.slot || 1)));
        const rackCenter = toWorld(Number(r.x||0) + Number(r.w||model.width||120)/2, Number(r.y||0) + Number(r.h||model.depth||56)/2, 0);
        if(mode !== 'slot') return new THREE.Vector3(rackCenter.x, Math.min(rackH*.55, 3.8), rackCenter.z);
        const bw = (w*.78)/slots;
        const localX = -w*.39 + bw*(slot-.5);
        const localZ = d*.05;
        const yaw = rackYaw(r);
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const worldX = rackCenter.x + localX * cos + localZ * sin;
        const worldZ = rackCenter.z - localX * sin + localZ * cos;
        const y = Math.max(.55, Math.min(rackH*.92, ((level-.5)/levels)*rackH + .35));
        return new THREE.Vector3(worldX, y, worldZ);
      };
      const buildDetailedRack = (r, active=false) => {
        const group = new THREE.Group();
        const model = rackModel(r.modelId) || baseRackModel();
        const w = Math.max(.8, (Number(r.w || model.width || 120))*scale);
        const d = Math.max(.45, (Number(r.h || model.depth || 56))*scale);
        const rackH = Math.max(1.2, (Number(r.rackHeight || model.height || 240))*hScale);
        const levels = Math.max(1, Math.min(8, Number(model.levels || 4) || 4));
        const slots = Math.max(1, Math.min(6, Number(model.slots || model.capacity || 2) || 2));
        const p = toWorld(Number(r.x||0) + Number(r.w||model.width||120)/2, Number(r.y||0) + Number(r.h||model.depth||56)/2, 0);
        group.position.set(p.x, 0, p.z);
        group.rotation.y = rackYaw(r);
        const postW = Math.max(.045, w*.045);
        const beamH = Math.max(.035, rackH*.014);
        [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(([x,z]) => addBox(group, postW, rackH, postW, x, rackH/2, z, matFrame));
        for(let i=0;i<=levels;i++){
          const y = (rackH/levels)*i;
          addBox(group, w+postW, beamH, postW, 0, y, -d/2, matBeam);
          addBox(group, w+postW, beamH, postW, 0, y, d/2, matBeam);
          addBox(group, postW, beamH, d+postW, -w/2, y, 0, matBeam);
          addBox(group, postW, beamH, d+postW, w/2, y, 0, matBeam);
        }
        const target = activeInfoForRack(r);
        for(let li=1; li<=levels; li++){
          const baseY = ((li-1)/levels)*rackH + beamH*3;
          const boxH = Math.max(.18, rackH/levels*.52);
          const boxD = d*.58;
          for(let si=1; si<=slots; si++){
            const bw = (w*.78)/slots;
            const bx = -w*.39 + bw*(si-.5);
            const isTarget = active && li === target.level && si === target.slot;
            const box = addBox(group, bw*.76, boxH, boxD, bx, baseY + boxH/2, d*.05, ((li+si)%4===0) ? matWrap : ((li+si)%2 ? matBox : matBox2));
            if(isTarget){
              const activeShell = addBox(group, bw*.96, boxH*1.18, boxD*1.18, bx, baseY + boxH/2, d*.05, matActive, false);
              const glowShell = addBox(group, bw*1.08, boxH*1.26, boxD*1.26, bx, baseY + boxH/2, d*.05, new THREE.MeshBasicMaterial({ color:0xffdd70, transparent:true, opacity:.14, depthWrite:false }), false);
              const markerY = baseY + boxH + .28;
              const slotLabel = createSlotLabelSprite(`N${li} · S${si}`);
              slotLabel.position.set(bx, markerY + .42, d*.05);
              group.add(slotLabel);
              activePulseTargets.push({ activeShell, glowShell, slotLabel, baseScale:1, labelY:slotLabel.position.y });
            }
          }
        }
        if(active){
          const haloGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w+.18, rackH+.18, d+.18));
          const halo = new THREE.LineSegments(haloGeo, new THREE.LineBasicMaterial({ color:0x7dffab, transparent:true, opacity:.98 }));
          halo.position.y = rackH/2; group.add(halo);
          const glow = new THREE.PointLight(0x55ff99, 1.1, 8, 1.7);
          glow.position.set(0, rackH*.72, 0); group.add(glow);
          activeLight.position.copy(group.position).add(new THREE.Vector3(0, rackH*.65, 0));
        }
        return group;
      };
      const buildBasicRack = (r, active=false, ghost=true) => {
        const group = new THREE.Group();
        const model = rackModel(r.modelId) || baseRackModel();
        const w = Math.max(.8, (Number(r.w || model.width || 120))*scale), d = Math.max(.45, (Number(r.h || model.depth || 56))*scale), rackH = Math.max(1.1, (Number(r.rackHeight || model.height || 240))*hScale);
        const p = toWorld(Number(r.x||0)+Number(r.w||model.width||120)/2, Number(r.y||0)+Number(r.h||model.depth||56)/2, 0);
        group.position.set(p.x,0,p.z);
        group.rotation.y = rackYaw(r);
        const mesh = addBox(group, w, rackH, d, 0, rackH/2, 0, ghost ? matGhost : matActive, false);
        mesh.material.opacity = active ? .34 : (ghost ? .13 : .24);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), active ? new THREE.LineBasicMaterial({ color:0x55ff99, transparent:true, opacity:.85 }) : matGhostWire);
        edges.position.copy(mesh.position); group.add(edges);
        return group;
      };

      const visibleRacks = getNav3DRacks().filter(r => {
        if(ui.isolation === 'all') return true;
        if(ui.isolation === 'zone') return focusZoneIds.has(r.zoneId);
        if(ui.isolation === 'solo') return focusRackIds.has(r.id) || focusZoneIds.has(r.zoneId);
        return focusRackIds.has(r.id);
      });
      visibleRacks.forEach(r => {
        const active = focusRackIds.has(r.id);
        const rackObject = active ? buildDetailedRack(r, true) : buildBasicRack(r, false, true);
        rackObject.userData.rackId = r.id;
        rackObject.traverse(obj => {
          obj.userData.rackId = r.id;
          obj.userData.isRackPickable = true;
          if(obj.isMesh) pickables.push(obj);
        });
        world.add(rackObject);
      });
      if(ui.route && prod && !appState.ui?.nav3DArchitectural){
        const activeRack = visibleRacks.find(r => r.id === getTargetRackId()) || visibleRacks.find(r => focusRackIds.has(r.id));
        if(activeRack){
          const routeGroup = new THREE.Group();
          const relatedZone = (Array.isArray(appState.layout?.zones) ? appState.layout.zones : []).find(z => z.id === activeRack.zoneId || focusZoneIds.has(z.id));
          const zoneCenter = relatedZone ? centroid(relatedZone.pts || []) : { x: bounds.minX + bounds.w*.12, y: bounds.minY + bounds.h*.82 };
          const start = toWorld(zoneCenter.x, zoneCenter.y, 0);
          const end = toWorld(Number(activeRack.x||0)+Number(activeRack.w||120)/2, Number(activeRack.y||0)+Number(activeRack.h||56)/2, 0);
          const mid = new THREE.Vector3((start.x+end.x)/2, .055, start.z);
          const points = [new THREE.Vector3(start.x,.065,start.z), mid, new THREE.Vector3(end.x,.065,end.z)];
          for(let i=0;i<points.length-1;i++){
            addCylinderBetween(routeGroup, points[i], points[i+1], .026, matRoute, false);
            addCylinderBetween(routeGroup, points[i].clone().setY(.055), points[i+1].clone().setY(.055), .074, matRouteHalo, false);
          }
          [start,end].forEach((p,idx)=>{
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(idx ? .18 : .10, 24, 12), matRoute);
            sphere.position.set(p.x,.14,p.z); sphere.castShadow=false; routeGroup.add(sphere);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(idx ? .30 : .18, .018, 12, 64), idx ? matRoute : matRouteHalo);
            ring.position.set(p.x,.075,p.z); ring.rotation.x = Math.PI/2; routeGroup.add(ring);
          });
          world.add(routeGroup);
        }
      }

      const cameraFocusRack = visibleRacks.find(r => r.id === getTargetRackId()) || visibleRacks.find(r => focusRackIds.has(r.id));
      const initialPan = cameraFocusRack
        ? targetFocusForRack(cameraFocusRack, 'slot')
        : new THREE.Vector3(0,0,0);
      const initialDistance = Math.max(4.6, Math.max(floorW,floorD) * (ui.isolation === 'solo' ? .29 : .54));
      const controls = { yaw:-Math.PI/4, pitch:.68, distance:initialDistance, pan:initialPan.clone(), targetYaw:-Math.PI/4, targetPitch:.68, targetDistance:initialDistance, targetPan:initialPan.clone(), dragging:false, lastX:0, lastY:0 };
      const selectedInitial = getTargetRackId() || ui.selectedRackId || appState.ui?.nav3DSelectedRackId || '';
      if(selectedInitial) { ui.selectedRackId = selectedInitial; appState.ui.nav3DSelectedRackId = selectedInitial; if(rackPopover) rackPopover.hidden = true; }
      const updateCamera = () => {
        controls.yaw += (controls.targetYaw-controls.yaw)*.16;
        controls.pitch += (controls.targetPitch-controls.pitch)*.16;
        controls.distance += (controls.targetDistance-controls.distance)*.16;
        controls.pan.lerp(controls.targetPan,.16);
        const x = Math.cos(controls.pitch)*Math.sin(controls.yaw)*controls.distance;
        const y = Math.sin(controls.pitch)*controls.distance;
        const z = Math.cos(controls.pitch)*Math.cos(controls.yaw)*controls.distance;
        camera.position.set(controls.pan.x+x, controls.pan.y+y, controls.pan.z+z);
        camera.lookAt(controls.pan);
        if(compass){ const deg = Math.round((((controls.yaw * 180/Math.PI) % 360) + 360) % 360); compass.textContent = `N · ${deg}°`; }
      };
      const setPointerFromEvent = (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
      };
      const pickRackId = (e) => {
        if(!pickables.length) return '';
        setPointerFromEvent(e);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(pickables, false)[0];
        return hit?.object?.userData?.rackId || '';
      };
      const focusRackCamera = (rackId, closeDistance = false) => {
        const rack = findNav3DRackById(rackId);
        if(!rack) return;
        const target = targetFocusForRack(rack, closeDistance ? 'slot' : 'rack');
        controls.targetPan.copy(target);
        controls.targetDistance = closeDistance ? Math.max(3.8, initialDistance * .30) : Math.max(4.8, initialDistance * .48);
      };
      const selectRackFromScene = (rackId, center = false) => {
        if(!rackId) return;
        appState.ui.nav3DSelectedRackId = rackId;
        ui.selectedRackId = rackId;
        const liveCtxSel = getViewerProductLocationContext(prod);
        if(rackId === liveCtxSel.primaryRackId) { ui.target = 'primary'; appState.ui.nav3DTarget = 'primary'; }
        if(rackId === liveCtxSel.storeRackId) { ui.target = 'store'; appState.ui.nav3DTarget = 'store'; }
        renderRackPopover(rackId);
        if(center) focusRackCamera(rackId, true);
        else focusRackCamera(rackId, false);
        setTimeout(() => { renderSideRacks(); renderProductOperationalCard(); renderMiniMap(); syncToolbar(); }, 60);
      };
      const resize = () => { const rect = canvas.getBoundingClientRect(); renderer.setSize(Math.max(320,rect.width), Math.max(260,rect.height), false); camera.aspect = Math.max(1,rect.width)/Math.max(1,rect.height); camera.updateProjectionMatrix(); };
      resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); resize();
      const animate = () => { animation = requestAnimationFrame(animate); updateCamera(); const t = performance.now() * 0.0032; activePulseTargets.forEach(item => { const pulse = 0.72 + (Math.sin(t) + 1) * 0.34; if(item.activeShell?.material){ item.activeShell.material.opacity = 0.48 + pulse * 0.24; item.activeShell.material.emissiveIntensity = 1.25 + pulse * 1.15; } if(item.glowShell){ const s = 0.98 + pulse * 0.08; item.glowShell.scale.set(s,s,s); if(item.glowShell.material) item.glowShell.material.opacity = 0.07 + pulse * 0.11; } if(item.slotLabel){ item.slotLabel.material.opacity = 0.74 + pulse * 0.22; item.slotLabel.position.y = item.labelY + pulse * 0.04; } }); renderer.render(scene,camera); };
      animate();
      canvas.addEventListener('pointerdown', e => { controls.dragging=true; controls.lastX=e.clientX; controls.lastY=e.clientY; downX=e.clientX; downY=e.clientY; downTime=Date.now(); downMoved=false; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', e => {
        if(!controls.dragging){
          const rid = pickRackId(e);
          if(rid !== hoveredRackId){
            hoveredRackId = rid;
            canvas.style.cursor = rid ? 'pointer' : 'grab';
            if(hoverLabel){
              hoverLabel.hidden = !rid;
              hoverLabel.textContent = rid || '';
            }
          }
          if(rid && hoverLabel){
            const rect = canvas.getBoundingClientRect();
            hoverLabel.style.left = `${e.clientX - rect.left + 14}px`;
            hoverLabel.style.top = `${e.clientY - rect.top + 14}px`;
          }
          return;
        }
        const dx=e.clientX-controls.lastX, dy=e.clientY-controls.lastY; controls.lastX=e.clientX; controls.lastY=e.clientY;
        if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY) > 6) downMoved = true;
        if(e.shiftKey){ const side = new THREE.Vector3().subVectors(camera.position, controls.pan).cross(new THREE.Vector3(0,1,0)).normalize(); const up = new THREE.Vector3(0,1,0); controls.targetPan.addScaledVector(side, -dx*.012).addScaledVector(up, dy*.012); }
        else { controls.targetYaw -= dx*.0032; controls.targetPitch = Math.max(.28, Math.min(1.16, controls.targetPitch + dy*.0022)); }
      });
      canvas.addEventListener('pointerup', e => {
        controls.dragging=false;
        try{canvas.releasePointerCapture(e.pointerId)}catch{};
        if(!downMoved && Date.now() - downTime < 420){
          const rid = pickRackId(e);
          if(rid) selectRackFromScene(rid, false);
        }
      });
      canvas.addEventListener('dblclick', e => { const rid = pickRackId(e); if(rid) selectRackFromScene(rid, true); });
      canvas.addEventListener('pointerleave', () => { controls.dragging=false; hoveredRackId=''; canvas.style.cursor='grab'; if(hoverLabel) hoverLabel.hidden = true; });
      canvas.addEventListener('wheel', e => { e.preventDefault(); controls.targetDistance = Math.max(4.5, Math.min(120, controls.targetDistance * (e.deltaY > 0 ? 1.07 : .93))); }, { passive:false });
      modal.querySelectorAll('[data-nav3d-target]').forEach(btn => btn.addEventListener('click', () => {
        ui.target = btn.dataset.nav3dTarget || 'primary';
        appState.ui.nav3DTarget = ui.target;
        syncToolbar();
        if(action === 'camera-top') return;
        close();
        openNavigable3DModal(prod);
      }));
      productCard?.addEventListener('click', e => {
        const action = e.target?.dataset?.nav3dProductAction;
        if(!action) return;
        if(action === 'variants') openProductVariantsModal(prod);
        if(action === 'center') focusRackCamera(getTargetRackId(), true);
        if(action === 'isolate') { ui.isolation = 'rack'; syncToolbar(); close(); openNavigable3DModal(prod); }
      });
      modal.querySelectorAll('[data-nav3d-action]').forEach(btn => btn.addEventListener('click', () => {
        const action = btn.dataset.nav3dAction;
        if(action === 'focus' || action === 'slot'){
          controls.targetYaw = -Math.PI/4;
          controls.targetPitch = .68;
          controls.targetDistance = action === 'slot' ? Math.max(4.2, initialDistance*.36) : Math.max(5.2, initialDistance*.48);
          controls.targetPan.copy(initialPan);
        }
        if(action && action.startsWith('visual-')){
          const mode = action.replace('visual-','');
          appState.ui.nav3DVisualMode = mode;
          ui.visual = mode;
        }
        if(action === 'wall-cut'){
          appState.ui.nav3DWallCut = !appState.ui.nav3DWallCut;
        }
        if(action === 'arch-mode'){
          appState.ui.nav3DArchitectural = !appState.ui.nav3DArchitectural;
          if(appState.ui.nav3DArchitectural) ui.route = false;
        }
        if(action === 'roof-toggle'){
          appState.ui.nav3DRoof = !appState.ui.nav3DRoof;
        }
        if(action === 'camera-top'){
          controls.targetYaw = 0;
          controls.targetPitch = 1.20;
          controls.targetDistance = Math.max(7.2, initialDistance*.78);
          controls.targetPan.copy(initialPan);
        }
        if(action === 'all' || action === 'zone' || action === 'rack' || action === 'solo') ui.isolation = action;
        if(action === 'ghost') ui.ghost = !ui.ghost;
        if(action === 'labels') ui.labels = !ui.labels;
        if(action === 'route') ui.route = !ui.route;
        syncToolbar();
        close();
        openNavigable3DModal(prod);
      }));
      rackPopover?.addEventListener('click', e => {
        const action = e.target?.dataset?.popoverAction;
        if(!action) return;
        const rid = ui.selectedRackId || appState.ui?.nav3DSelectedRackId;
        if(action === 'center') focusRackCamera(rid, true);
        if(action === 'isolate') { ui.isolation = 'rack'; syncToolbar(); close(); openNavigable3DModal(prod); }
        if(action === 'detail') openRackZoom(rid === getViewerProductLocationContext(prod).storeRackId ? 'store' : 'primary');
      });
      syncToolbar();
    }).catch(err => {
      console.error(err);
      if(loading) loading.innerHTML = '<b>No se pudo cargar Three.js</b><span>Revisa conexión o bloqueos del navegador.</span>';
      showToast('No se pudo cargar el motor 3D.', 'warning');
    });
  }

  function openProductLocationModal(product = appState.selectedProduct){
    ensureAppRuntimeState();
    if(!appState.ui.locationFocusMode) appState.ui.locationFocusMode = 'primary';
    appState.ui.isoIsolation = 'rack';
    appState.ui.isoGhost = true;
    const ctx = getViewerProductLocationContext(product);
    const prod = product || ctx.prod;
    if(!prod){ showToast('Selecciona un producto primero.', 'warning'); return; }
    let modal = document.getElementById('productLocationModal');
    if(modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'productLocationModal';
    modal.className = 'location-modal-backdrop show';
    modal.innerHTML = `
      <div class="location-modal-card">
        <div class="location-modal-head">
          <div>
            <b>Plano de ubicación del producto</b>
            <div class="muted tiny">Enfoque directo al rack, nivel y slot del producto seleccionado.</div>
          </div>
          <div class="location-modal-head-actions">
            <span class="chip location-focus-chip">${escapeHtml(prod.sku || 'SKU —')}</span>
            <button class="btn secondary nav3d-open-btn" type="button" id="btnOpenNavigable3DFromLocation">Abrir 3D</button>
            <button class="location-modal-close" type="button" aria-label="Cerrar">✕</button>
          </div>
        </div>
        <div class="location-modal-focus-strip">
          <div class="location-focus-product"><span>Producto</span><b>${escapeHtml(prod.nombre || 'Sin nombre')}</b><small>${escapeHtml(prod.sku || 'SKU —')}</small></div>
          <div class="location-focus-target"><span>Ubicación principal</span><b>${escapeHtml(ctx.primaryLoc)}</b><small>Rack ${escapeHtml(ctx.primaryRackId || '—')} · N${escapeHtml(prod.nivel || '—')} · S${escapeHtml(prod.slot || '—')}</small></div>
          <div class="location-focus-target ${ctx.storeRackId && ctx.storeRackId !== ctx.primaryRackId ? '' : 'muted-target'}"><span>Ubicación en almacén</span><b>${escapeHtml(ctx.storeLoc)}</b><small>Rack ${escapeHtml(ctx.storeRackId || '—')} · N${escapeHtml(prod.nivelStore || prod.nivel || '—')} · S${escapeHtml(prod.slotStore || prod.slot || '—')}</small></div>
          <div class="location-focus-tabs" role="group" aria-label="Enfoque de ubicación">
            <button type="button" data-location-focus="primary" class="iso-tool ${appState.ui.locationFocusMode === 'primary' ? 'active' : ''}">Ubicación</button>
            <button type="button" data-location-focus="store" class="iso-tool ${appState.ui.locationFocusMode === 'store' ? 'active' : ''}">Almacén</button>
            <button type="button" data-location-focus="both" class="iso-tool ${appState.ui.locationFocusMode === 'both' ? 'active' : ''}">Ambas</button>
          </div>
        </div>
        <div class="location-modal-body v60-product-location-body">
          <div class="location-modal-main dual-rack-card v60-focused-map">
            <div class="dual-rack-head modal-iso-head">
              <div><b>Plano 2D enfocado al producto</b><div class="muted tiny">Abre con el rack del producto aislado. Usa Zona o Todo solo si necesitas contexto.</div></div>
              <div class="iso-toolbar modal-iso-toolbar" id="locationModalIsoToolbar">
                ${['NE','NW','SE','SW'].map(v => `<button type="button" class="iso-tool ${appState.ui.isoView===v?'active':''}" data-modal-iso-view="${v}">${v}</button>`).join('')}
                <button type="button" class="iso-tool" data-modal-iso-rotate="-1">↺</button>
                <button type="button" class="iso-tool" data-modal-iso-rotate="1">↻</button>
                <button type="button" class="iso-tool ${appState.ui.isoIsolation==='zone'?'active':''}" data-modal-iso-isolate="zone">Zona</button>
                <button type="button" class="iso-tool ${appState.ui.isoIsolation==='rack'?'active':''}" data-modal-iso-isolate="rack">Rack</button>
                <button type="button" class="iso-tool ${appState.ui.isoIsolation==='all'?'active':''}" data-modal-iso-isolate="all">Todo</button>
                <button type="button" class="iso-tool ${appState.ui.isoGhost?'active':''}" data-modal-iso-ghost="toggle">Ghost</button>
                <span class="iso-compass">${escapeHtml(getIsoViewConfig().compass)}</span>
              </div>
            </div>
            <div class="detail-stage"><svg id="locationModalIsoMap" viewBox="-560 -160 1220 820"></svg></div>
          </div>
          <div class="location-modal-side">
            <div class="dual-rack-card"><div class="dual-rack-head"><div><b>Rack de ubicación</b><div class="muted tiny">${escapeHtml(ctx.primaryLoc)}</div></div><span class="chip">${escapeHtml(ctx.primaryRackId || '—')}</span></div><div class="detail-stage dual-rack-svg"><svg id="locationModalRackPrimary"></svg></div></div>
            <div class="dual-rack-card"><div class="dual-rack-head"><div><b>Rack de almacén</b><div class="muted tiny">${escapeHtml(ctx.storeLoc)}</div></div><span class="chip">${escapeHtml(ctx.storeRackId || '—')}</span></div><div class="detail-stage dual-rack-svg"><svg id="locationModalRackStore"></svg></div></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.location-modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
    modal.querySelector('#btnOpenNavigable3DFromLocation')?.addEventListener('click', () => openNavigable3DModal(prod));
    const redrawModalViews = () => {
      const updatedCtx = getViewerProductLocationContext(prod);
      const iso = modal.querySelector('#locationModalIsoMap');
      const rackPrimary = modal.querySelector('#locationModalRackPrimary');
      const rackStore = modal.querySelector('#locationModalRackStore');
      const toolbar = modal.querySelector('#locationModalIsoToolbar');
      if(toolbar){
        toolbar.innerHTML = `${['NE','NW','SE','SW'].map(v => `<button type="button" class="iso-tool ${appState.ui.isoView===v?'active':''}" data-modal-iso-view="${v}">${v}</button>`).join('')}<button type="button" class="iso-tool" data-modal-iso-rotate="-1">↺</button><button type="button" class="iso-tool" data-modal-iso-rotate="1">↻</button><button type="button" class="iso-tool ${appState.ui.isoIsolation==='rack'?'active':''}" data-modal-iso-isolate="rack">Rack</button><button type="button" class="iso-tool ${appState.ui.isoIsolation==='zone'?'active':''}" data-modal-iso-isolate="zone">Zona</button><button type="button" class="iso-tool ${appState.ui.isoIsolation==='all'?'active':''}" data-modal-iso-isolate="all">Todo</button><button type="button" class="iso-tool ${appState.ui.isoGhost?'active':''}" data-modal-iso-ghost="toggle">Ghost</button><span class="iso-compass">${escapeHtml(getIsoViewConfig().compass)}</span>`;
      }
      renderIsoLocationSvg(iso, prod);
      renderRackDetail(updatedCtx.primaryRackId, { nivel: prod?.nivel || 0, slot: prod?.slot || 0, label: 'Ubicación', fullLabel: updatedCtx.primaryLoc }, rackPrimary);
      renderRackDetail(updatedCtx.storeRackId, { nivel: prod?.nivelStore || 0, slot: prod?.slotStore || 0, label: 'Almacén', fullLabel: updatedCtx.storeLoc }, rackStore);
      modal.querySelectorAll('[data-modal-iso-view]').forEach(btn => { btn.onclick = () => { setIsoView(btn.dataset.modalIsoView || 'NE'); redrawModalViews(); }; });
      modal.querySelectorAll('[data-modal-iso-rotate]').forEach(btn => { btn.onclick = () => { rotateIsoView(Number(btn.dataset.modalIsoRotate || 1)); redrawModalViews(); }; });
      modal.querySelectorAll('[data-modal-iso-isolate]').forEach(btn => { btn.onclick = () => { appState.ui.isoIsolation = btn.dataset.modalIsoIsolate || 'all'; redrawModalViews(); }; });
      modal.querySelectorAll('[data-modal-iso-ghost]').forEach(btn => { btn.onclick = () => { appState.ui.isoGhost = !appState.ui.isoGhost; redrawModalViews(); }; });
      modal.querySelectorAll('[data-location-focus]').forEach(btn => {
        btn.classList.toggle('active', appState.ui.locationFocusMode === btn.dataset.locationFocus);
        btn.onclick = () => { appState.ui.locationFocusMode = btn.dataset.locationFocus || 'primary'; redrawModalViews(); };
      });
    };
    redrawModalViews();
  }


  let viewerImageRotationTimer = null;
  function clearViewerImageRotationTimer(){
    if(viewerImageRotationTimer){
      clearInterval(viewerImageRotationTimer);
      viewerImageRotationTimer = null;
    }
  }

  function bindViewerProductImageCarousel(host, images, productLabel){
    clearViewerImageRotationTimer();
    if(!host || !Array.isArray(images) || !images.length) return;
    const mediaImg = host.querySelector('.viewer-product-media img');
    const thumbButtons = Array.from(host.querySelectorAll('.viewer-product-thumb'));
    const expandBtn = host.querySelector('.viewer-media-expand');
    if(!mediaImg) return;
    let currentIndex = 0;
    const setActive = (index) => {
      if(!images.length) return;
      currentIndex = ((index % images.length) + images.length) % images.length;
      mediaImg.src = images[currentIndex];
      mediaImg.alt = `${productLabel || 'Producto'} · imagen ${currentIndex + 1}`;
      thumbButtons.forEach((btn, idx) => btn.classList.toggle('active', idx === currentIndex));
    };
    const restartTimer = () => {
      clearViewerImageRotationTimer();
      if(images.length <= 1) return;
      viewerImageRotationTimer = setInterval(() => setActive(currentIndex + 1), 2600);
    };
    thumbButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        setActive(idx);
        restartTimer();
      });
    });
    expandBtn?.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'media-lightbox';
      modal.innerHTML = `<button class="media-lightbox-close" type="button" aria-label="Cerrar">✕</button><img src="${escapeHtml(images[currentIndex])}" alt="${escapeHtml(productLabel || 'Producto')}">`;
      document.body.appendChild(modal);
      const close = () => modal.remove();
      modal.querySelector('.media-lightbox-close')?.addEventListener('click', close);
      modal.addEventListener('click', e => { if(e.target === modal) close(); });
    });
    host.addEventListener('mouseenter', () => clearViewerImageRotationTimer(), { passive:true });
    host.addEventListener('mouseleave', () => restartTimer(), { passive:true });
    setActive(0);
    restartTimer();
  }

  function renderViewerProductInfoPanel(){
    clearViewerImageRotationTimer();
    const ctx = getViewerProductLocationContext(appState.selectedProduct);
    const prod = appState.selectedProduct || null;
    detailTitle.textContent = 'Información del producto';
    detailSubtitle.textContent = '';
    detailStatus.textContent = prod ? `Producto activo: ${prod.sku || '—'}` : 'Sin selección';
    detailChip.textContent = prod ? (prod.ubicacion || '—') : '—';
    if(!prod){
      detailWrap.innerHTML = `<div class="viewer-product-info-card empty"><div class="empty compact"><b>Sin producto seleccionado</b><div class="muted tiny">Usa la búsqueda central para seleccionar un producto y ver sus variantes.</div></div></div>`;
      return;
    }
    const images = getProductImageUrls(prod).filter(Boolean);
    const img = images[0] || '';
    const thumbs = images.slice(0, 6).map((url, idx) => `<button class="viewer-product-thumb ${idx === 0 ? 'active' : ''}" type="button"><img src="${escapeHtml(url)}" alt="Vista ${idx + 1}"></button>`).join('');
    const family = getViewerProductFamilySummary(prod);
    const sizesHtml = family.sizes.length
      ? family.sizes.map(size => `<span class="viewer-variant-chip size">${escapeHtml(size)}</span>`).join('')
      : '<span class="muted tiny">Sin tallas detectadas</span>';
    const colorsHtml = family.colors.length
      ? family.colors.map(color => `<span class="viewer-variant-chip color" style="${getViewerColorChipStyle(color)}">${escapeHtml(color)}</span>`).join('')
      : '<span class="muted tiny">Sin colores detectados</span>';
    detailWrap.innerHTML = `
      <div class="viewer-product-info-card viewer-product-premium-card compact-fit product-only-panel">
        <div class="viewer-product-top-layout">
          <div class="viewer-media-col">
            <div class="viewer-product-media ${img ? '' : 'empty'}">
              ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(prod.nombre || 'Producto')}">` : '<span>Sin imagen</span>'}
              ${img ? '<button class="viewer-media-expand" type="button" title="Ampliar imagen">⛶</button>' : ''}
            </div>
            ${thumbs ? `<div class="viewer-product-thumbs">${thumbs}</div>` : ''}
          </div>
          <div class="viewer-side-col">
            <div class="viewer-product-copy tight">
              <div class="search-card-kicker">Producto</div>
              <h2>${escapeHtml(prod.nombre || 'Sin nombre')}</h2>
              <div class="viewer-sku-pill">${escapeHtml(prod.sku || 'SKU —')}</div>
            </div>
            <div class="viewer-info-grid viewer-info-icon-grid top-right-grid location-only-grid">
              <div class="search-meta-block emphasis"><span class="viewer-info-icon">⌖</span><span class="search-meta-label">Ubicación</span><span class="search-meta-value">${escapeHtml(ctx.primaryLoc)}</span></div>
              <div class="search-meta-block emphasis"><span class="viewer-info-icon">◫</span><span class="search-meta-label">Ubicación en almacén</span><span class="search-meta-value store">${escapeHtml(ctx.storeLoc)}</span></div>
            </div>
          </div>
        </div>
        <div class="viewer-bottom-info product-variants-only">
          <div class="viewer-variant-panel">
            <div class="viewer-variant-head"><span class="viewer-info-icon">T</span><div><b>Tallas del modelo</b><small>${family.sizes.length || 0} registradas</small></div></div>
            <div class="viewer-variant-chip-wrap">${sizesHtml}</div>
          </div>
          <div class="viewer-variant-panel">
            <div class="viewer-variant-head"><span class="viewer-info-icon color-dot"></span><div><b>Colores del modelo</b><small>${family.colors.length || 0} registrados</small></div></div>
            <div class="viewer-variant-chip-wrap">${colorsHtml}</div>
          </div>
        </div>
        <div class="viewer-location-actions viewer-location-actions-extended"><button class="btn primary viewer-location-btn" type="button" id="btnOpenLocationModal"><span>⌖</span> Ver ubicación</button><button class="btn secondary viewer-location-btn nav3d-inline-btn" type="button" id="btnOpenNavigable3D"><span>◈</span> 3D navegable</button><button class="btn secondary viewer-location-btn" type="button" id="btnOpenVariants"><span>▦</span> Variantes</button></div>
      </div>`;
    document.getElementById('btnOpenLocationModal')?.addEventListener('click', () => openProductLocationModal(prod));
    document.getElementById('btnOpenNavigable3D')?.addEventListener('click', () => openNavigable3DModal(prod));
    document.getElementById('btnOpenVariants')?.addEventListener('click', () => openProductVariantsModal(prod));
    bindViewerProductImageCarousel(detailWrap, images, prod.nombre || prod.sku || 'Producto');
  }

  function renderMapView(){
    const layoutBranchIndex = getActiveLayoutBranchIndex();
    const branches = appState.admin?.branches || [];
    const activeBranch = branches[layoutBranchIndex] || branches[getActiveSheetBranchIndex()] || null;
    const rackIdsInLayout = new Set((appState.layout?.racks || []).map(r => r.id));
    const selectedProd = appState.selectedProduct;
    const productMatchesLayout = selectedProd && (
      (selectedProd.rack && rackIdsInLayout.has(selectedProd.rack)) ||
      (selectedProd.rackStore && rackIdsInLayout.has(selectedProd.rackStore))
    );
    const prod = productMatchesLayout ? selectedProd : null;
    if(!productMatchesLayout && appState.selectedProduct){
      appState.selectedProduct = null;
    }
    setUnifiedMapLayout(true);
    contentTitle.textContent = 'Plano general 3D isométrico';
    contentSubtitle.textContent = 'Sección unificada: arriba plano general; abajo racks de ubicación y almacén.';
    setTags(['isométrico', 'pan + zoom', 'resaltado', 'racks realistas']);

    const primaryRackId = (prod?.rack && rackIdsInLayout.has(prod.rack) ? prod.rack : '') || (appState.selectedRack && rackIdsInLayout.has(appState.selectedRack) ? appState.selectedRack : '') || appState.layout.racks[0]?.id || '';
    const storeRackId = (prod?.rackStore && rackIdsInLayout.has(prod.rackStore) ? prod.rackStore : '') || primaryRackId;
    const primaryLoc = prod?.ubicacion || primaryRackId || '—';
    const storeLoc = prod?.almacen || storeRackId || '—';

    renderViewerBranchHost(layoutBranchIndex);
    if(appState.screen === 'viewer'){
      if(contentWrap) contentWrap.innerHTML = '';
      renderViewerProductInfoPanel();
      contentStatus.textContent = prod ? `Producto activo: ${prod.sku || '—'}` : 'Busca y selecciona un producto';
      contentFootRight.textContent = prod ? `${primaryLoc} • ALM: ${storeLoc}` : `${(appState.products || []).length.toLocaleString('es-PE')} productos`;
      return;
    }

    contentWrap.innerHTML = `
      <div class="map-unified" style="grid-template-columns:minmax(0,1fr) clamp(320px,28vw,420px);grid-template-rows:minmax(0,1fr);gap:8px;">
        <div class="dual-rack-card" style="min-height:0;display:grid;grid-template-rows:auto 1fr;">
          <div class="dual-rack-head">
            <div>
              <b>Plano general 3D isométrico</b>
              <div class="muted tiny">Mapa navegable con foco en el producto activo.</div>
              <span class="loc-full">Sucursal: ${escapeHtml(activeBranch?.name || '—')} • Ubicación: ${primaryLoc} • Almacén: ${storeLoc}</span>
            </div>
            <div class="iso-toolbar" id="isoToolbar">
              ${['NE','NW','SE','SW'].map(v => `<button type="button" class="iso-tool ${appState.ui.isoView===v?'active':''}" data-iso-view="${v}">${v}</button>`).join('')}
              <button type="button" class="iso-tool" data-iso-rotate="-1">↺</button>
              <button type="button" class="iso-tool" data-iso-rotate="1">↻</button>
              <button type="button" class="iso-tool ${appState.ui.isoIsolation==='zone'?'active':''}" data-iso-isolate="zone">Aislar zona</button>
              <button type="button" class="iso-tool ${appState.ui.isoIsolation==='rack'?'active':''}" data-iso-isolate="rack">Aislar rack</button>
              <button type="button" class="iso-tool ${appState.ui.isoIsolation==='all'?'active':''}" data-iso-isolate="all">Todo</button>
              <button type="button" class="iso-tool ${appState.ui.isoGhost?'active':''}" data-iso-ghost="toggle">Ghost</button>
              <span class="iso-compass">${escapeHtml(getIsoViewConfig().compass)}</span>
            </div>
          </div>
          <div class="detail-stage"><svg id="isoMap" viewBox="-560 -160 1220 820"></svg></div>
        </div>
        <div class="map-bottom-split" style="grid-template-columns:1fr;grid-template-rows:1fr 1fr;height:100%;min-height:0;width:100%;gap:8px;">
          <div class="dual-rack-card">
            <div class="dual-rack-head">
              <div>
                <b>Rack de ubicación</b>
                <div class="muted tiny">Ubicación principal del producto</div>
                <span class="loc-full" id="rackPrimaryLoc">—</span>
              </div>
              <span class="chip" id="rackPrimaryChip">—</span>
            </div>
            <div class="detail-stage dual-rack-svg"><svg id="rackViewPrimary" viewBox="-121.59515592786995 -225.15226089174166 324.75952572292744 432.80452177622624"></svg></div>
          </div>
          <div class="dual-rack-card">
            <div class="dual-rack-head">
              <div>
                <b>Rack de almacén</b>
                <div class="muted tiny">Ubicación de respaldo / almacén</div>
                <span class="loc-full" id="rackStoreLoc">—</span>
              </div>
              <span class="chip" id="rackStoreChip">—</span>
            </div>
            <div class="detail-stage dual-rack-svg"><svg id="rackViewStore" viewBox="-134.86196899414062 -198.444665512236 282.6610565185547 387.889331024472"></svg></div>
          </div>
        </div>
      </div>`;
    detailWrap.innerHTML = `
      <div class="viewer-focus-banner">
        <div class="focus-copy">
          <div class="focus-title">${prod ? escapeHtml(prod.nombre || 'Producto activo') : 'Plano listo para explorar'}</div>
          <div class="focus-sub">${prod ? `Zona ${escapeHtml(prod.zona || '—')} • Rack ${escapeHtml(primaryRackId || '—')} • Nivel ${escapeHtml(String(prod.nivel || 0))} • Slot ${escapeHtml(String(prod.slot || 0))}` : 'Selecciona un producto desde la lista y el visor centrará zona, rack y ubicación principal.'}</div>
        </div>
        <div class="focus-actions">
          <button class="btn secondary" type="button" id="viewerCenterSelectedBtn">Centrar producto</button>
          <button class="btn secondary" type="button" id="viewerRefreshMapBtn">Actualizar visor</button>
        </div>
      </div>
      <div class="panel-shell">
        <div class="panel-shell-head">
          <div>
            <b>Ubicación principal y de almacén</b>
            <div class="muted tiny">Resumen uniforme para leer rápido la ruta del producto dentro del plano.</div>
          </div>
          <span class="chip">${prod ? escapeHtml(prod.sku || 'SKU —') : 'Sin selección'}</span>
        </div>
        <div class="panel-shell-grid-2">
          <div class="metric-tile">
            <span class="metric-label">Ubicación principal</span>
            <span class="metric-value">${escapeHtml(primaryLoc)}</span>
            <span class="metric-note">Zona ${escapeHtml(prod?.zona || '—')} • Rack ${escapeHtml(primaryRackId || '—')} • Nivel ${escapeHtml(String(prod?.nivel || 0))} • Slot ${escapeHtml(String(prod?.slot || 0))}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Ubicación de almacén</span>
            <span class="metric-value">${escapeHtml(storeLoc)}</span>
            <span class="metric-note">Zona ${escapeHtml(prod?.zonaStore || '—')} • Rack ${escapeHtml(storeRackId || '—')} • Nivel ${escapeHtml(String(prod?.nivelStore || 0))} • Slot ${escapeHtml(String(prod?.slotStore || 0))}</span>
          </div>
        </div>
      </div>
      <div class="panel-shell compact">
        <div class="panel-shell-grid-3">
          <div class="metric-tile">
            <span class="metric-label">Sucursal</span>
            <span class="metric-value">${escapeHtml(activeBranch?.name || '—')}</span>
            <span class="metric-note">Visor conectado a la sucursal activa.</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Rack activo</span>
            <span class="metric-value">${escapeHtml(primaryRackId || '—')}</span>
            <span class="metric-note">${prod ? 'Se resalta en el mapa isométrico.' : 'Selecciona un producto para resaltarlo.'}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Estado visual</span>
            <span class="metric-value">${prod ? 'En foco' : 'Exploración libre'}</span>
            <span class="metric-note">${prod ? 'Zona, rack y slots sincronizados.' : 'Puedes navegar por el plano manualmente.'}</span>
          </div>
        </div>
      </div>`;
    detailTitle.textContent = 'Ruta visual del producto';
    detailSubtitle.textContent = prod ? 'La selección actual ya está conectada con zona, rack, nivel y slot.' : 'Resumen operativo del visor isométrico.';
    detailStatus.textContent = prod ? `${primaryRackId} / ${storeRackId}` : '—';
    detailChip.textContent = prod ? `U: N${prod.nivel||0} S${prod.slot||0} • A: N${prod.nivelStore||0} S${prod.slotStore||0}` : '—';
    const svg = $('#isoMap');
    const rackSvgPrimary = $('#rackViewPrimary');
    const rackSvgStore = $('#rackViewStore');
    const defs = svgEl('defs');
    const glow = svgEl('filter',{id:'mapGlow',x:'-40%',y:'-40%',width:'180%',height:'180%'});
    glow.appendChild(svgEl('feDropShadow',{dx:'0',dy:'0',stdDeviation:'10','flood-color':'#50e37b','flood-opacity':'.55'}));
    defs.appendChild(glow); svg.appendChild(defs);
    const root = svgEl('g',{id:'mapRoot',transform:'translate(0 0) scale(1)'}); svg.appendChild(root);

    const bounds = getLayoutContentBounds();
    const padX = Math.max(280, bounds.w * 0.22);
    const padY = Math.max(280, bounds.h * 0.22);
    const floorRect = {
      x: bounds.x - padX,
      y: bounds.y - padY,
      w: bounds.w + padX * 2,
      h: bounds.h + padY * 2
    };
    const floor = face([
      toIso(floorRect.x, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y + floorRect.h, 0),
      toIso(floorRect.x, floorRect.y + floorRect.h, 0)
    ],{fill:'rgba(255,255,255,.025)',stroke:'rgba(255,255,255,.08)','stroke-width':'2'});
    root.appendChild(floor);
    const isoGrid = svgEl('g',{opacity:'.36'});
    const gridStep = Math.max(4, getSnapSize() * 2);
    for(let gx = Math.floor(floorRect.x / gridStep) * gridStep; gx <= floorRect.x + floorRect.w; gx += gridStep){
      const a = toIso(gx, floorRect.y, 0);
      const b = toIso(gx, floorRect.y + floorRect.h, 0);
      isoGrid.appendChild(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'rgba(120,162,210,.22)','stroke-width':'1'}));
    }
    for(let gy = Math.floor(floorRect.y / gridStep) * gridStep; gy <= floorRect.y + floorRect.h; gy += gridStep){
      const a = toIso(floorRect.x, gy, 0);
      const b = toIso(floorRect.x + floorRect.w, gy, 0);
      isoGrid.appendChild(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'rgba(120,162,210,.22)','stroke-width':'1'}));
    }
    root.appendChild(isoGrid);

    let projected = [
      toIso(floorRect.x, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y, 0),
      toIso(floorRect.x + floorRect.w, floorRect.y + floorRect.h, 0),
      toIso(floorRect.x, floorRect.y + floorRect.h, 0)
    ];

    const isolation = appState.ui?.isoIsolation || 'all';
    const focusZoneIds = new Set([prod?.zona, prod?.zonaStore].filter(Boolean));
    const focusRackIds = new Set([primaryRackId, storeRackId].filter(Boolean));
    const visibleZones = appState.layout.zones.filter(z => isolation === 'all' || focusZoneIds.has(z.id));
    const visibleZoneIds = new Set(visibleZones.map(z => z.id));

    visibleZones.forEach(z => {
      const pts = z.pts.map(p => toIso(p.x, p.y, 0));
      projected.push(...pts);
      const isMainZone = prod?.zona === z.id;
      const isStoreZone = prod?.zonaStore === z.id;
      const isSearchZone = (prod?.zona || prod?.zonaStore) === z.id;
      const ghostZone = appState.ui.isoGhost && prod && isolation === 'all' && !isSearchZone;
      const cls = 'zone-floor' + (isMainZone ? ' active' : '') + (isStoreZone ? ' storage' : '') + (isSearchZone ? ' search-focus' : '') + (ghostZone ? ' iso-ghost' : '');
      const zoneColor = z.color || getBranchColor(layoutBranchIndex) || '#ffd84d';
      const baseFill = hexToRgba(zoneColor, ghostZone ? 0.08 : (isSearchZone ? 0.30 : 0.22));
      const baseStroke = hexToRgba(zoneColor, ghostZone ? 0.34 : (isSearchZone ? 0.98 : 0.92));
      const path = svgEl('path',{d:`M ${pts.map(pt => `${pt.x} ${pt.y}`).join(' L ')} Z`,class:cls,fill:baseFill,stroke:baseStroke,'stroke-width':isSearchZone ? '2.8' : '2.1'});
      root.appendChild(path);
      const c = centroid(z.pts); const ci = toIso(c.x,c.y,0);
      projected.push(ci);
      const label = svgEl('text',{x:ci.x,y:ci.y,class:'zone-label','text-anchor':'middle'}); label.textContent = z.id; root.appendChild(label);
      if(z.name && z.name.toUpperCase() !== z.id.toUpperCase()){
        const sub = svgEl('text',{x:ci.x,y:ci.y + 22,class:'ortho-label','text-anchor':'middle'}); sub.textContent = z.name; root.appendChild(sub);
      }
    });

    const racks = appState.layout.racks.slice()
      .filter(r => {
        if(isolation === 'rack') return focusRackIds.has(r.id);
        if(isolation === 'zone') return visibleZoneIds.has(r.zoneId);
        return true;
      })
      .sort((a,b)=>(a.x+a.y+Number(a.baseHeight||0))-(b.x+b.y+Number(b.baseHeight||0)));
    racks.forEach(r => {
      const rackGroup = buildIsoRack(r, prod);
      if(appState.ui.isoGhost && prod && isolation === 'all' && !focusRackIds.has(r.id)){
        rackGroup.group.setAttribute('opacity','.32');
      }
      root.appendChild(rackGroup.group);
      if(Array.isArray(rackGroup.projectedPoints)) projected.push(...rackGroup.projectedPoints);
    });

    if(projected.length){
      const minX = Math.min(...projected.map(p => p.x));
      const maxX = Math.max(...projected.map(p => p.x));
      const minY = Math.min(...projected.map(p => p.y));
      const maxY = Math.max(...projected.map(p => p.y));
      const padVX = Math.max(80, (maxX - minX) * 0.12);
      const padVY = Math.max(80, (maxY - minY) * 0.16);
      svg.setAttribute('viewBox', `${Math.floor(minX - padVX)} ${Math.floor(minY - padVY)} ${Math.ceil((maxX - minX) + padVX * 2)} ${Math.ceil((maxY - minY) + padVY * 2)}`);
    }

    enablePanZoom(svg, root, focusBoundsForProduct(prod), { tx:0, ty:0, scale:1.35 });

    renderRackDetail(primaryRackId, { nivel: prod?.nivel || 0, slot: prod?.slot || 0, label: 'Ubicación', fullLabel: primaryLoc }, rackSvgPrimary);
    renderRackDetail(storeRackId, { nivel: prod?.nivelStore || 0, slot: prod?.slotStore || 0, label: 'Almacén', fullLabel: storeLoc }, rackSvgStore);
    if($('#rackPrimaryChip')) $('#rackPrimaryChip').textContent = primaryRackId || '—';
    if($('#rackStoreChip')) $('#rackStoreChip').textContent = storeRackId || '—';
    if($('#rackPrimaryLoc')) $('#rackPrimaryLoc').textContent = primaryLoc;
    if($('#rackStoreLoc')) $('#rackStoreLoc').textContent = storeLoc;
    contentStatus.textContent = prod ? `Producto activo: ${prod.sku} • ${prod.rack}` : 'Visualizando layout actual';
    contentFootRight.textContent = prod ? `${primaryLoc} • ALM: ${storeLoc}` : `${(appState.layout?.zones || []).length} zonas • ${(appState.layout?.racks || []).length} racks`;
    document.querySelectorAll('[data-iso-view]').forEach(btn => {
      btn.onclick = () => { setIsoView(btn.dataset.isoView || 'NE'); renderMapView(); };
    });
    document.querySelectorAll('[data-iso-rotate]').forEach(btn => {
      btn.onclick = () => { rotateIsoView(Number(btn.dataset.isoRotate || 1)); renderMapView(); };
    });
    document.querySelectorAll('[data-iso-isolate]').forEach(btn => {
      btn.onclick = () => { appState.ui.isoIsolation = btn.dataset.isoIsolate || 'all'; renderMapView(); };
    });
    document.querySelectorAll('[data-iso-ghost]').forEach(btn => {
      btn.onclick = () => { appState.ui.isoGhost = !appState.ui.isoGhost; renderMapView(); };
    });
    const centerBtn = document.getElementById('viewerCenterSelectedBtn');
    if(centerBtn) centerBtn.onclick = () => { appState.ui.isoIsolation = appState.ui.isoIsolation || 'all'; focusSelectedProductInViewer({ switchScreen:false }); };
    const refreshBtn = document.getElementById('viewerRefreshMapBtn');
    if(refreshBtn) refreshBtn.onclick = () => renderMapView();
  }

  function buildBlinkMarker(x, y, color = '#ffd84d', store = false){
    const g = svgEl('g',{class:'marker-blink' + (store ? ' store' : ''), transform:`translate(${x} ${y})`});
    const stem = svgEl('line',{x1:'0',y1:'-18',x2:'0',y2:'-2',stroke:color,'stroke-width':'2.6','stroke-linecap':'round',opacity:'.92'});
    const circle = svgEl('circle',{cx:'0',cy:'-22',r:'5.5',fill:'none',stroke:color,'stroke-width':'2',opacity:'.8'});
    const arrow = svgEl('path',{class:'arrow-core',d:'M 0 0 L -8 -14 L -2 -14 L -2 -30 L 2 -30 L 2 -14 L 8 -14 Z',fill:color,stroke:'rgba(255,255,255,.45)','stroke-width':'0.8'});
    g.appendChild(circle);
    g.appendChild(stem);
    g.appendChild(arrow);
    return g;
  }

  function getRackIsoPlan(r){
    const fp = getRackFootprint(r.modelId, 0);
    const bw = fp.baseW || r.w || 120;
    const bd = fp.baseH || r.h || 80;
    const cx = Number(r.x || 0) + Number(r.w || bw) / 2;
    const cy = Number(r.y || 0) + Number(r.h || bd) / 2;
    const ang = normalizeAngle(r.rot || 0) * Math.PI / 180;
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const local = [
      { x:-bw/2, y:-bd/2 },
      { x:bw/2, y:-bd/2 },
      { x:bw/2, y:bd/2 },
      { x:-bw/2, y:bd/2 }
    ];
    const corners = local.map(pt => ({ x:cx + pt.x * cos - pt.y * sin, y:cy + pt.x * sin + pt.y * cos }));
    return { corners, center:{ x:cx, y:cy }, bw, bd };
  }



  function clampUnderStairsTopLength(model){
    const width = Math.max(30, Number(model?.width || 180) || 180);
    const raw = Number(model?.topLength || model?.topWidth || Math.round(width * 0.33)) || Math.round(width * 0.33);
    return Math.max(8, Math.min(width - 8, raw));
  }
  function isUnderStairsStyle(style){
    const normalized = normalizeRackStyle(style);
    return normalized === 'under_stairs' || normalized === 'under_stairs_reflected';
  }
  function isUnderStairsMirrored(model){
    const style = normalizeRackStyle(model?.style);
    return style === 'under_stairs_reflected' ? true : !!model?.mirrored;
  }
  function getAdaptiveSlotCount(requestedSlots, availableWidth, minSlotWidth = 18){
    const desired = Math.max(1, Math.min(6, Number(requestedSlots || 1) || 1));
    const fit = Math.max(1, Math.floor(Math.max(6, Number(availableWidth || 0)) / Math.max(8, Number(minSlotWidth || 18))));
    return Math.max(1, Math.min(desired, fit));
  }

  function getUnderStairsShape(model){
    const width = Math.max(30, Number(model?.width || 180) || 180);
    const depth = Math.max(20, Number(model?.depth || 45) || 45);
    const rawLeftHeight = Math.max(20, Number(model?.leftHeight || model?.height || 240) || 240);
    const rawRightHeight = Math.max(20, Number(model?.rightHeight || Math.max(40, ((model?.height || 240) * 0.35))) || Math.max(40, ((model?.height || 240) * 0.35)));
    const mirrored = isUnderStairsMirrored(model);
    const panel1Height = Math.max(rawLeftHeight, rawRightHeight);
    const panel2Height = Math.min(rawLeftHeight, rawRightHeight);
    const leftHeight = mirrored ? panel2Height : panel1Height;
    const rightHeight = mirrored ? panel1Height : panel2Height;
    const rawTopLength = Math.max(8, Number(model?.topLength || clampUnderStairsTopLength(model)) || clampUnderStairsTopLength(model));
    const tallerLeft = leftHeight >= rightHeight;
    const tallHeight = tallerLeft ? leftHeight : rightHeight;
    const lowHeight = tallerLeft ? rightHeight : leftHeight;
    const topLength = Math.max(8, Math.min(width - 8, rawTopLength));
    const flatStart = tallerLeft ? 0 : Math.max(0, width - topLength);
    const flatEnd = tallerLeft ? Math.min(width, topLength) : width;
    const slopeSpan = Math.max(8, width - (flatEnd - flatStart));
    const roofEdgeLength = Math.sqrt((slopeSpan * slopeSpan) + Math.pow(tallHeight - lowHeight, 2));
    const topHeightAt = (xValue) => {
      const x = Math.max(0, Math.min(width, Number(xValue) || 0));
      if(Math.abs(tallHeight - lowHeight) < 0.001) return tallHeight;
      if(tallerLeft){
        if(x <= flatEnd) return tallHeight;
        const t = Math.max(0, Math.min(1, (x - flatEnd) / Math.max(1, width - flatEnd)));
        return tallHeight + ((lowHeight - tallHeight) * t);
      }
      if(x >= flatStart) return tallHeight;
      const t = Math.max(0, Math.min(1, x / Math.max(1, flatStart)));
      return lowHeight + ((tallHeight - lowHeight) * t);
    };
    const shelfRangeAtZ = (zValue) => {
      const z = Math.max(0, Number(zValue) || 0);
      if(Math.abs(tallHeight - lowHeight) < 0.001 || z <= lowHeight) return { start:0, end:width };
      if(z >= tallHeight) return { start:flatStart, end:flatEnd };
      const ratio = Math.max(0, Math.min(1, (tallHeight - z) / Math.max(1, tallHeight - lowHeight)));
      if(tallerLeft){
        const end = flatEnd + (width - flatEnd) * ratio;
        return { start:0, end:Math.max(flatEnd, Math.min(width, end)) };
      }
      const start = flatStart * (1 - ratio);
      return { start:Math.max(0, Math.min(flatStart, start)), end:width };
    };
    return { width, depth, leftHeight, rightHeight, topLength, roofEdgeLength, tallerLeft, tallHeight, lowHeight, flatStart, flatEnd, slopeSpan, mirrored, rawLeftHeight, rawRightHeight, panel1Height, panel2Height, topHeightAt, shelfRangeAtZ };
  }



  function getRackBoxDepth(furnitureDepth, paddingCm = 3, minDepth = 12){
    const fd = Math.max(0, Number(furnitureDepth) || 0);
    return Math.max(minDepth, fd - paddingCm);
  }

  const UNDER_STAIRS_BOX_FORWARD_CM = 2;
  const UNDER_STAIRS_SLOPE_COLLISION_CLEARANCE_CM = 3;


  function getUnderStairsSafeSlotRange(shape, baseRange, boxTopZ, roofThickness = 0, sideMargin = 2.2, slopeClearance = UNDER_STAIRS_SLOPE_COLLISION_CLEARANCE_CM){
    const range = {
      start: Math.max(0, Number(baseRange?.start || 0) || 0),
      end: Math.max(0, Number(baseRange?.end || 0) || 0)
    };
    if(range.end <= range.start) return null;
    const safeProbeZ = Math.max(0, Number(boxTopZ || 0) + Math.max(2.2, Number(roofThickness || 0)) + 1.2);
    const topRange = shape?.shelfRangeAtZ ? shape.shelfRangeAtZ(safeProbeZ) : range;
    const slopeGap = Math.max(0, Number(slopeClearance || 0) || 0);
    let start = Math.max(range.start, Number(topRange?.start || range.start) || range.start) + sideMargin;
    let end = Math.min(range.end, Number(topRange?.end || range.end) || range.end) - sideMargin;
    if(shape?.tallerLeft){
      end -= slopeGap;
    } else {
      start += slopeGap;
    }
    if(end <= start) return null;
    return { start, end };
  }

  function drawStandardIsoStorageBox(target, toIsoFn, options = {}){
    const {
      slotClass = false,
      bx = 0,
      bw = 20,
      by = 0,
      boxDepth = 20,
      boxBottomZ = 0,
      dividerTopZ = 40,
      shelfY0 = 0,
      shelfY1 = 30,
      glowFilter = ''
    } = options;
    const boxHeight = Math.max(20, Math.min((dividerTopZ - boxBottomZ) - 4, (dividerTopZ - boxBottomZ) * 0.72));
    const effectiveTopZ = boxBottomZ + boxHeight;
    const lidRise = Math.max(2.4, Math.min(5.2, boxHeight * 0.08));
    const lidTopZ = Math.min(dividerTopZ - 2, effectiveTopZ + lidRise);
    const lidOverhang = Math.max(0.7, Math.min(1.35, bw * 0.018));
    const lidFront = by;
    const lidBack = by + boxDepth;
    const tapeX0 = bx + bw * 0.42;
    const tapeX1 = tapeX0 + Math.max(4, bw * 0.09);
    const labelW = Math.max(10, bw * 0.26);
    const labelH = Math.max(6, boxHeight * 0.15);
    const labelX = bx + bw * 0.2;
    const labelY = by + boxDepth - 0.6;
    const labelTopZ = boxBottomZ + boxHeight * 0.38;
    const handleW = 0;
    const handleH = 0;
    const handleX = 0;
    const handleTopZ = 0;
    const handleY = 0;
    const colors = slotClass ? {top:'#8cff4b', front:'#69e230', right:'#5dd228', lid:'#b0ff79', lidFront:'#8de75d', lidRight:'#7ad848', tape:'#78cc45', shadow:'rgba(73,120,42,.18)'}
                             : {top:'#ebbb7a', front:'#d8a260', right:'#c98e4d', lid:'#f2c98f', lidFront:'#dfb273', lidRight:'#cf9853', tape:'#b67a3d', shadow:'rgba(88,58,22,.16)'};
    target.appendChild(face([
      toIsoFn(bx + 1.3, by + 1.3, boxBottomZ + 0.25),
      toIsoFn(bx+bw + 1.3, by + 1.3, boxBottomZ + 0.25),
      toIsoFn(bx+bw + 1.3, by+boxDepth + 1.3, boxBottomZ + 0.25),
      toIsoFn(bx + 1.3, by+boxDepth + 1.3, boxBottomZ + 0.25)
    ],{fill:colors.shadow,stroke:'none'}));
    target.appendChild(face([
      toIsoFn(bx, by, effectiveTopZ),
      toIsoFn(bx+bw, by, effectiveTopZ),
      toIsoFn(bx+bw, by+boxDepth, effectiveTopZ),
      toIsoFn(bx, by+boxDepth, effectiveTopZ)
    ],{fill:colors.top,stroke:slotClass?'#53d61d':'#9b6829','stroke-width':'1.1',filter:slotClass && glowFilter ? glowFilter : ''}));
    target.appendChild(face([
      toIsoFn(bx, by+boxDepth, effectiveTopZ),
      toIsoFn(bx+bw, by+boxDepth, effectiveTopZ),
      toIsoFn(bx+bw, by+boxDepth, boxBottomZ),
      toIsoFn(bx, by+boxDepth, boxBottomZ)
    ],{fill:colors.front,stroke:'rgba(128,83,25,.55)','stroke-width':'0.8'}));
    target.appendChild(face([
      toIsoFn(bx+bw, by, effectiveTopZ),
      toIsoFn(bx+bw, by+boxDepth, effectiveTopZ),
      toIsoFn(bx+bw, by+boxDepth, boxBottomZ),
      toIsoFn(bx+bw, by, boxBottomZ)
    ],{fill:colors.right,stroke:'rgba(116,75,22,.45)','stroke-width':'0.8'}));
    target.appendChild(face([
      toIsoFn(bx-lidOverhang, lidFront, lidTopZ),
      toIsoFn(bx+bw+lidOverhang, lidFront, lidTopZ),
      toIsoFn(bx+bw+lidOverhang, lidBack, lidTopZ),
      toIsoFn(bx-lidOverhang, lidBack, lidTopZ)
    ],{fill:colors.lid,stroke:'rgba(176,116,49,.65)','stroke-width':'0.9'}));
    target.appendChild(face([
      toIsoFn(bx-lidOverhang, lidBack, lidTopZ),
      toIsoFn(bx+bw+lidOverhang, lidBack, lidTopZ),
      toIsoFn(bx+bw+lidOverhang, lidBack, effectiveTopZ),
      toIsoFn(bx-lidOverhang, lidBack, effectiveTopZ)
    ],{fill:colors.lidFront}));
    target.appendChild(face([
      toIsoFn(bx+bw+lidOverhang, lidFront, lidTopZ),
      toIsoFn(bx+bw+lidOverhang, lidBack, lidTopZ),
      toIsoFn(bx+bw+lidOverhang, lidBack, effectiveTopZ),
      toIsoFn(bx+bw+lidOverhang, lidFront, effectiveTopZ)
    ],{fill:colors.lidRight}));
    target.appendChild(face([
      toIsoFn(tapeX0, lidFront + 0.5, lidTopZ + 0.03),
      toIsoFn(tapeX1, lidFront + 0.5, lidTopZ + 0.03),
      toIsoFn(tapeX1, lidBack - 0.5, lidTopZ + 0.03),
      toIsoFn(tapeX0, lidBack - 0.5, lidTopZ + 0.03)
    ],{fill:colors.tape,stroke:'none'}));
    target.appendChild(face([
      toIsoFn(labelX, labelY, labelTopZ),
      toIsoFn(labelX + labelW, labelY, labelTopZ),
      toIsoFn(labelX + labelW, labelY, labelTopZ - labelH),
      toIsoFn(labelX, labelY, labelTopZ - labelH)
    ],{fill:'rgba(255,248,234,.96)',stroke:'rgba(214,194,162,.65)','stroke-width':'0.45'}));
  }


  function buildUnderStairsIsoRack(r, prod){
    const model = rackModel(r.modelId) || {};
    const g = svgEl('g',{class:'rack-iso under-stairs','data-rack':r.id});
    const main = prod?.rack === r.id;
    const store = prod?.rackStore === r.id;
    const selected = (appState.selectedRack || prod?.rack) === r.id;
    const searchHit = isRackSearchHit(r.id);
    const searchPrimary = appState.primaryHighlightedRackId === r.id;
    const levelHighlight = main ? Number(prod?.nivel || 0) : (store ? Number(prod?.nivelStore || 0) : 0);
    if(main) g.classList.add('active');
    if(store) g.classList.add('storage');
    if(selected || searchPrimary) g.classList.add('selected');
    if(searchHit) g.classList.add('search-hit');
    if(prod && !main && !store && !searchHit) g.classList.add('dim');

    const plan = getRackIsoPlan(r);
    const baseHeight = Math.max(0, Number(r.baseHeight || 0) * ISO_Z_SCALE);
    const modelWidth = Math.max(30, Number(model.width || plan.bw || 180) || 180);
    const scaledTop = clampUnderStairsTopLength(model) * (Math.max(30, plan.bw || modelWidth) / modelWidth);
    const baseShape = getUnderStairsShape({
      width: Math.max(30, plan.bw || modelWidth),
      depth: Math.max(20, plan.bd || model.depth || 45),
      leftHeight: Math.max(20, Number(model.leftHeight || model.height || 238) || 238),
      rightHeight: Math.max(20, Number(model.rightHeight || Math.max(40, (model.height||238) * 0.35)) || Math.max(40, (model.height||238) * 0.35)),
      topLength: scaledTop,
      mirrored: isUnderStairsMirrored(model)
    });
    const scaledRackHeight = Math.max(40, Number(r.rackHeight || model.height || baseShape.tallHeight || 238) * ISO_Z_SCALE);
    const shapeHeightScale = scaledRackHeight / Math.max(1, baseShape.tallHeight || 1);
    const shape = getUnderStairsShape({
      width: baseShape.width,
      depth: baseShape.depth,
      leftHeight: Math.max(20, baseShape.leftHeight * shapeHeightScale),
      rightHeight: Math.max(20, baseShape.rightHeight * shapeHeightScale),
      topLength: baseShape.topLength,
      mirrored: isUnderStairsMirrored(model)
    });
    const colors = {
      flatTop:'rgba(226,235,244,.94)',
      slopeTop: levelHighlight ? '#ffe27f' : 'rgba(220,231,241,.92)',
      left:'rgba(122,145,170,.34)',
      right:'rgba(104,127,152,.48)',
      front:'rgba(205,217,230,.72)',
      post:'#355a83',
      beam:'rgba(229,237,247,.98)',
      beamFront:'rgba(168,189,210,.96)',
      beamSide:'rgba(193,206,220,.94)',
      divider:'rgba(214,224,235,.94)',
      diagonal:'rgba(229,236,244,.92)',
      diagonalLip:'rgba(194,208,223,.98)',
      stroke:'#6d8daf'
    };
    const c = plan.corners;
    const bottom = c.map(pt => toIso(pt.x, pt.y, baseHeight));
    const projectedPoints = [...bottom];
    const project = (pt, z = 0) => {
      const p = toIso(pt.x, pt.y, z + baseHeight);
      projectedPoints.push(p);
      return p;
    };
    const lerpPt = (a, b, t) => ({ x:a.x + (b.x - a.x) * t, y:a.y + (b.y - a.y) * t });
    const leftBack = c[0], rightBack = c[1], rightFront = c[2], leftFront = c[3];
    const leftBackTop = project(leftBack, shape.leftHeight);
    const leftFrontTop = project(leftFront, shape.leftHeight);
    const rightBackTop = project(rightBack, shape.rightHeight);
    const rightFrontTop = project(rightFront, shape.rightHeight);
    const flatBack = lerpPt(leftBack, rightBack, shape.flatEnd / Math.max(1, shape.width));
    const flatFront = lerpPt(leftFront, rightFront, shape.flatEnd / Math.max(1, shape.width));
    const flatBackTop = project(flatBack, shape.tallHeight);
    const flatFrontTop = project(flatFront, shape.tallHeight);
    const flatBackStart = lerpPt(leftBack, rightBack, shape.flatStart / Math.max(1, shape.width));
    const flatFrontStart = lerpPt(leftFront, rightFront, shape.flatStart / Math.max(1, shape.width));
    const flatBackStartTop = project(flatBackStart, shape.tallHeight);
    const flatFrontStartTop = project(flatFrontStart, shape.tallHeight);
    const roofThickness = Math.max(2.4, Math.min(6, shape.tallHeight * 0.03));
    const slopeBackStartTop = shape.tallerLeft ? flatBackTop : flatBackStartTop;
    const slopeFrontStartTop = shape.tallerLeft ? flatFrontTop : flatFrontStartTop;
    const slopeBackEndTop = shape.tallerLeft ? rightBackTop : leftBackTop;
    const slopeFrontEndTop = shape.tallerLeft ? rightFrontTop : leftFrontTop;
    const slopeFrontStartBase = shape.tallerLeft ? flatFront : flatFrontStart;
    const slopeFrontEndBase = shape.tallerLeft ? rightFront : leftFront;
    const slopeEndHeight = shape.tallerLeft ? shape.rightHeight : shape.leftHeight;

    const overlayFaces = [];
    const slopeFrontLowerEnd = project(slopeFrontEndBase, Math.max(0, slopeEndHeight - roofThickness));
    const slopeFrontLowerStart = project(slopeFrontStartBase, Math.max(0, shape.tallHeight - roofThickness));
    const frontDiagonalTopEdgeStart = slopeFrontStartTop;
    const frontDiagonalTopEdgeEnd = slopeFrontEndTop;
    const frontDiagonalTallOuter = shape.tallerLeft ? leftFrontTop : rightFrontTop;
    const frontDiagonalPanel = null;
    const rearSlopeTopFace = face([slopeBackStartTop, slopeBackEndTop, slopeFrontEndTop, slopeFrontStartTop],{fill:colors.slopeTop,stroke:levelHighlight ? '#ffca2f' : colors.stroke,'stroke-width':levelHighlight ? '1.6' : '1.05'});
    const slopeFrontLip = face([
      slopeFrontStartTop,
      slopeFrontEndTop,
      slopeFrontLowerEnd,
      slopeFrontLowerStart
    ],{fill:'#d7e1eb',stroke:'rgba(158,178,201,.98)','stroke-width':'1.08'});
    const isReflectedUnderStairs = normalizeRackStyle(model.style) === 'under_stairs_reflected';
    if(isReflectedUnderStairs){
      g.appendChild(rearSlopeTopFace);
    } else {
      overlayFaces.push(rearSlopeTopFace);
    }
    g.appendChild(face([leftBackTop, leftFrontTop, bottom[3], bottom[0]],{fill:colors.left,stroke:colors.stroke,'stroke-width':'1'}));
    if(isReflectedUnderStairs){
      g.appendChild(slopeFrontLip);
    }
    if(shape.flatEnd - shape.flatStart > 1.5){
      overlayFaces.push(face([flatBackStartTop, flatBackTop, flatFrontTop, flatFrontStartTop],{fill:colors.flatTop,stroke:levelHighlight ? '#ffca2f' : colors.stroke,'stroke-width':levelHighlight ? '1.5' : '1.05'}));
      overlayFaces.push(face([
        flatFrontStartTop,
        flatFrontTop,
        project(flatFront, Math.max(0, shape.tallHeight - roofThickness)),
        project(flatFrontStart, Math.max(0, shape.tallHeight - roofThickness))
      ],{fill:colors.diagonalLip,stroke:'none'}));
      overlayFaces.push(svgEl('line',{x1:slopeFrontStartTop.x,y1:slopeFrontStartTop.y,x2:slopeBackStartTop.x,y2:slopeBackStartTop.y,stroke:levelHighlight ? '#ffca2f' : '#c9d6e5','stroke-width':'1.1','stroke-linecap':'round',opacity:'.95'}));
    }

    const levels = Math.max(2, Number(model.levels || 4) || 4);
    const levelHeights = buildLevelHeights(model);
    const levelSlots = buildLevelSlots(model);
    const totalLevelHeight = Math.max(1, levelHeights.reduce((sum, value) => sum + Math.max(10, Number(value) || 10), 0));
    const usableHeight = Math.max(18, shape.tallHeight - 16);
    let zCursor = 10;
    for(let i=0;i<levels;i++){
      const levelH = Math.max(10, Number(levelHeights[i] || 10));
      const z = zCursor;
      zCursor += (levelH / totalLevelHeight) * usableHeight;
      const levelTopZ = zCursor;
      const range = shape.shelfRangeAtZ(z + 2.2);
      const shelfW = Math.max(12, range.end - range.start);
      if(shelfW <= 10) continue;
      const t0 = range.start / shape.width;
      const t1 = range.end / shape.width;
      const backA = lerpPt(leftBack, rightBack, t0);
      const backB = lerpPt(leftBack, rightBack, t1);
      const frontA = lerpPt(leftFront, rightFront, t0);
      const frontB = lerpPt(leftFront, rightFront, t1);
      const p1 = project(backA, z);
      const p2 = project(backB, z);
      const p3 = project(frontB, z);
      const p4 = project(frontA, z);
      const activeShelf = levelHighlight === (i + 1);
      g.appendChild(face([p1,p2,p3,p4],{fill:activeShelf ? '#ffe27f' : colors.beam,stroke:activeShelf ? '#ffca2f' : colors.stroke,'stroke-width':activeShelf ? '1.45' : '0.95'}));
      g.appendChild(face([
        project(frontA, z),
        project(frontB, z),
        project(frontB, Math.max(0, z - 2.5)),
        project(frontA, Math.max(0, z - 2.5))
      ],{fill:colors.beamFront,stroke:'none'}));
      g.appendChild(face([
        project(backB, z),
        project(frontB, z),
        project(frontB, Math.max(0, z - 2.5)),
        project(backB, Math.max(0, z - 2.5))
      ],{fill:colors.beamSide,stroke:'none'}));
      const desiredSlots = Math.max(1, Number(levelSlots[i] || model.slots || 1) || 1);
      const slots = getAdaptiveSlotCount(desiredSlots, shelfW - 10, 18);
      const span = shelfW / Math.max(1, slots);
      for(let s=1;s<slots;s++){
        const sx = range.start + span * s;
        const dividerThickness = 2;
        const divX0 = Math.max(range.start + 0.4, sx - dividerThickness / 2);
        const divX1 = Math.min(range.end - 0.4, sx + dividerThickness / 2);
        if(divX1 <= divX0) continue;
        const t0Div = divX0 / Math.max(1, shape.width);
        const t1Div = divX1 / Math.max(1, shape.width);
        const divBack0 = lerpPt(leftBack, rightBack, t0Div);
        const divFront0 = lerpPt(leftFront, rightFront, t0Div);
        const divBack1 = lerpPt(leftBack, rightBack, t1Div);
        const divFront1 = lerpPt(leftFront, rightFront, t1Div);
        const roofHere = Math.min(shape.topHeightAt(divX0), shape.topHeightAt(divX1), shape.topHeightAt(sx));
        const nextShelfZ = i < levels - 1 ? (levelTopZ + 0.6) : null;
        const divTop = i < levels - 1
          ? Math.min(roofHere - roofThickness - 1.2, nextShelfZ)
          : Math.min(roofHere - roofThickness - 1.2, roofHere - roofThickness - 1.2);
        const divBottom = z + 0.15;
        if(divTop <= divBottom + 8) continue;
        const pA = project(divBack0, divBottom);
        const pB = project(divFront0, divBottom);
        const pC = project(divFront0, divTop);
        const pD = project(divBack0, divTop);
        const pE = project(divBack1, divBottom);
        const pF = project(divFront1, divBottom);
        const pG = project(divFront1, divTop);
        const pH = project(divBack1, divTop);
        overlayFaces.push(face([pD,pH,pG,pC],{fill:'#f1f6fb',stroke:'#9eb2c9','stroke-width':'1.05'}));
        overlayFaces.push(face([pA,pB,pC,pD],{fill:'#d8e2ec',stroke:'#90a7c2','stroke-width':'0.95'}));
        overlayFaces.push(face([pE,pF,pG,pH],{fill:'#b9c9da',stroke:'#89a0ba','stroke-width':'0.9'}));
        overlayFaces.push(face([pB,pF,pG,pC],{fill:'#cfd9e5',stroke:'rgba(123,145,168,.78)','stroke-width':'0.82'}));
        overlayFaces.push(face([pA,pE,pH,pD],{fill:'#e5edf5',stroke:'rgba(123,145,168,.56)','stroke-width':'0.7'}));
      }
      for(let s=0;s<slots;s++){
        const rawSlotStart = range.start + span * s;
        const rawSlotEnd = range.start + span * (s + 1);
        const boxBottomZ = z + 4;
        const roofMid = shape.topHeightAt((rawSlotStart + rawSlotEnd) / 2);
        const dividerTopZ = Math.min(roofMid - 4, levelTopZ - 3);
        if(dividerTopZ <= boxBottomZ + 4) continue;
        const safeRange = getUnderStairsSafeSlotRange(shape, { start: rawSlotStart, end: rawSlotEnd }, dividerTopZ, roofThickness, Math.max(2.2, span * 0.08), 3);
        if(!safeRange || (safeRange.end - safeRange.start) < 8) continue;
        const bx = safeRange.start;
        const bw = Math.max(8, safeRange.end - safeRange.start);
        const boxDepth = getRackBoxDepth(shape.depth, 3, 14);
        const by = Math.min(Math.max(0.5, shape.depth * 0.14) + UNDER_STAIRS_BOX_FORWARD_CM, Math.max(0.5, shape.depth - boxDepth - 0.5));
        drawStandardIsoStorageBox(g, (xx,yy,zz)=>{
          const u = xx / Math.max(1, shape.width);
          const v = yy / Math.max(1, shape.depth);
          const worldPt = {
            x: leftBack.x + (rightBack.x - leftBack.x) * u + (leftFront.x - leftBack.x) * v,
            y: leftBack.y + (rightBack.y - leftBack.y) * u + (leftFront.y - leftBack.y) * v
          };
          return project(worldPt, zz);
        }, {
          slotClass: false,
          bx, bw, by, boxDepth,
          boxBottomZ,
          dividerTopZ,
          shelfY0: 0,
          shelfY1: shape.depth,
          glowFilter: 'url(#slotGlow)'
        });
      }
    }

    const sidePanelT = 2;
    const rightInnerBack = lerpPt(leftBack, rightBack, Math.max(0, (shape.width - sidePanelT) / Math.max(1, shape.width)));
    const rightInnerFront = lerpPt(leftFront, rightFront, Math.max(0, (shape.width - sidePanelT) / Math.max(1, shape.width)));
    const rightInnerBackTop = project(rightInnerBack, shape.topHeightAt(Math.max(0, shape.width - sidePanelT)));
    const rightInnerFrontTop = project(rightInnerFront, shape.topHeightAt(Math.max(0, shape.width - sidePanelT)));
    const rightInnerBackBottom = project(rightInnerBack, 0);
    const rightInnerFrontBottom = project(rightInnerFront, 0);
    overlayFaces.push(face([rightBackTop, rightFrontTop, bottom[2], bottom[1]],{fill:colors.right,stroke:colors.stroke,'stroke-width':'1'}));
    overlayFaces.push(face([rightInnerFrontTop, rightFrontTop, bottom[2], rightInnerFrontBottom],{fill:'#c5d3e0',stroke:'rgba(117,140,165,.92)','stroke-width':'0.86'}));
    overlayFaces.push(face([rightInnerBackTop, rightBackTop, rightFrontTop, rightInnerFrontTop],{fill:'#edf3f9',stroke:'rgba(117,140,165,.72)','stroke-width':'0.78'}));
    overlayFaces.forEach(el => g.appendChild(el));
    if(frontDiagonalPanel) g.appendChild(frontDiagonalPanel);

    [0,1,2,3].forEach(i => {
      const topPoint = i === 0 ? leftBackTop : i === 1 ? rightBackTop : i === 2 ? rightFrontTop : leftFrontTop;
      g.appendChild(svgEl('line',{x1:bottom[i].x,y1:bottom[i].y,x2:topPoint.x,y2:topPoint.y,stroke:colors.post,'stroke-width':'2.65','stroke-linecap':'round'}));
    });
    g.appendChild(svgEl('line',{x1:leftFrontTop.x,y1:leftFrontTop.y,x2:leftBackTop.x,y2:leftBackTop.y,stroke:colors.post,'stroke-width':'2.1','stroke-linecap':'round'}));
    g.appendChild(svgEl('line',{x1:rightFrontTop.x,y1:rightFrontTop.y,x2:rightBackTop.x,y2:rightBackTop.y,stroke:colors.post,'stroke-width':'2.1','stroke-linecap':'round'}));
    g.appendChild(svgEl('line',{x1:bottom[3].x,y1:bottom[3].y,x2:bottom[2].x,y2:bottom[2].y,stroke:'rgba(119,143,168,.9)','stroke-width':'1.8','stroke-linecap':'round'}));

    const labelAnchor = project(lerpPt(leftFront, rightFront, 0.5), shape.tallHeight + 18);
    const label = svgEl('text',{x:labelAnchor.x,y:labelAnchor.y,class:'rack-title','text-anchor':'middle'});
    label.textContent = r.id;
    g.appendChild(label);
    if(main || store){
      const mk = project(lerpPt(leftFront, rightFront, 0.5), shape.tallHeight + 52);
      g.appendChild(buildBlinkMarker(mk.x, mk.y, main ? '#ffd84d' : '#72f29d', store && !main));
    }
    g.addEventListener('click', e => { e.stopPropagation(); appState.selectedRack = r.id; appState.selectedRackLayoutId = r.id; renderMapView(); });
    return { group:g, projectedPoints };
  }

  function renderUnderStairsDetail(rackId, prod = null, targetSvg = null, forcedModel = null, forcedRack = null){
    const rack = forcedRack || findRackById(rackId) || appState.layout.racks[0];
    const model = forcedModel || (rack ? rackModel(rack.modelId) : rackModel(appState.selectedModelId));
    const holder = targetSvg || $('#rackView');
    if(!holder || !model) return;
    holder.innerHTML = '';
    holder.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const root = svgEl('g',{transform:'translate(0 108)'}); holder.appendChild(root);

    const shape = getUnderStairsShape(model);
    const w = shape.width, depth = shape.depth, hL = shape.leftHeight, hR = shape.rightHeight;
    const levels = Math.max(2, Number(model.levels || 4) || 4);
    const levelHeightsCm = buildLevelHeights(model).slice(0, levels);
    const levelSlots = buildLevelSlots(model).slice(0, levels);
    const totalCm = Math.max(1, levelHeightsCm.reduce((s,v)=>s + Math.max(10, Number(v)||10), 0));
    const x = -92, y = -26, z = 0;

    const flatStartX = x + shape.flatStart;
    const flatEndX = x + shape.flatEnd;
    const flatBackA = toIso(flatStartX, y, shape.tallHeight);
    const flatBackB = toIso(flatEndX, y, shape.tallHeight);
    const flatFrontA = toIso(flatStartX, y + depth, shape.tallHeight);
    const flatFrontB = toIso(flatEndX, y + depth, shape.tallHeight);
    const A = toIso(x, y, hL), B = toIso(x + w, y, hR), C = toIso(x + w, y + depth, hR), D = toIso(x, y + depth, hL);
    const a = toIso(x, y, z), b = toIso(x + w, y, z), c = toIso(x + w, y + depth, z), d0 = toIso(x, y + depth, z);
    const roofT = Math.max(2.4, Math.min(5.5, shape.tallHeight * 0.022));
    const slopeBackStartTop = shape.tallerLeft ? flatBackB : flatBackA;
    const slopeFrontStartTop = shape.tallerLeft ? flatFrontB : flatFrontA;
    const slopeBackEndTop = shape.tallerLeft ? B : A;
    const slopeFrontEndTop = shape.tallerLeft ? C : D;
    const slopeEndX = shape.tallerLeft ? (x + w) : x;
    const slopeStartX = shape.tallerLeft ? flatEndX : flatStartX;
    const slopeEndHeight = shape.tallerLeft ? hR : hL;

    const overlayFaces = [];
    const frontDiagonalTopEdge = toIso(slopeStartX, y + depth, shape.tallHeight);
    const frontDiagonalBottomEdge = toIso(slopeEndX, y + depth, slopeEndHeight);
    const frontDiagonalInnerBottomStart = toIso(slopeStartX, y + depth, Math.max(0, shape.tallHeight - roofT));
    const frontDiagonalInnerBottomEnd = toIso(slopeEndX, y + depth, Math.max(0, slopeEndHeight - roofT));
    const frontTallOuter = shape.tallerLeft ? D : C;
    const metallic = {
      post:'#355a83',
      stroke:'#6d8daf',
      shellLeft:'#7a91aa',
      shellRight:'#687f98',
      shellFront:'#cdd9e6',
      topFlat:'#e2ebf4',
      topSlope:'#dce7f1',
      diagonal:'#e5ecf4',
      diagonalLip:'#c2d0df',
      shelfTop:'#e5edf7',
      shelfFront:'#a8bdd2',
      divider:'#d6e0eb'
    };
    const frontDiagonalPanel = null;
    const rearSlopeTopFace = face([slopeBackStartTop,slopeBackEndTop,slopeFrontEndTop,slopeFrontStartTop],{fill:metallic.topSlope,stroke:metallic.stroke,'stroke-width':'1.15'});
    const slopeFrontLip = face([
      slopeFrontStartTop,
      slopeFrontEndTop,
      toIso(slopeEndX, y + depth, Math.max(0, slopeEndHeight - roofT)),
      toIso(slopeStartX, y + depth, Math.max(0, shape.tallHeight - roofT))
    ],{fill:metallic.diagonalLip,stroke:'none'});
    const isReflectedUnderStairs = normalizeRackStyle(model.style) === 'under_stairs_reflected';
    if(isReflectedUnderStairs){
      root.appendChild(rearSlopeTopFace);
    } else {
      overlayFaces.push(rearSlopeTopFace);
    }
    root.appendChild(face([A,D,d0,a],{fill:metallic.shellLeft,stroke:metallic.stroke,'stroke-width':'1'}));
    if(isReflectedUnderStairs){
      root.appendChild(slopeFrontLip);
    }
    if(shape.flatEnd - shape.flatStart > 1.5){
      overlayFaces.push(face([flatBackA,flatBackB,flatFrontB,flatFrontA],{fill:metallic.topFlat,stroke:metallic.stroke,'stroke-width':'1.15'}));
      overlayFaces.push(face([
        flatFrontA,
        flatFrontB,
        toIso(flatEndX, y + depth, Math.max(0, shape.tallHeight - roofT)),
        toIso(flatStartX, y + depth, Math.max(0, shape.tallHeight - roofT))
      ],{fill:'#b1c1d1',stroke:'none'}));
      overlayFaces.push(svgEl('line',{x1:slopeFrontStartTop.x,y1:slopeFrontStartTop.y,x2:slopeBackStartTop.x,y2:slopeBackStartTop.y,stroke:'#d7e3ee','stroke-width':'1.1','stroke-linecap':'round'}));
    }

    [
      [a,A],[b,B],[c,C],[d0,D],
      [toIso(flatStartX,y,z),flatBackA],[toIso(flatEndX,y,z),flatBackB],
      [toIso(flatStartX,y+depth,z),flatFrontA],[toIso(flatEndX,y+depth,z),flatFrontB]
    ].forEach(pair => root.appendChild(svgEl('line',{x1:pair[0].x,y1:pair[0].y,x2:pair[1].x,y2:pair[1].y,stroke:metallic.post,'stroke-width':'2.55','stroke-linecap':'round'})));

    const selectedLevel = Math.max(0, Number(prod?.nivel || 0));
    const selectedSlot = Math.max(0, Number(prod?.slot || 0));
    let accCm = 0;
    for(let i=0;i<levels;i++){
      const levelCm = Math.max(10, Number(levelHeightsCm[i] || 10) || 10);
      const floorZ = (accCm / totalCm) * shape.tallHeight;
      const topZ = ((accCm + levelCm) / totalCm) * shape.tallHeight;
      accCm += levelCm;
      const shelfZ = floorZ + 3;
      const usable = shape.shelfRangeAtZ(shelfZ + 2.2);
      const availW = Math.max(0, usable.end - usable.start);
      if(availW < 18) continue;
      const lx0 = usable.start + 3;
      const lx1 = usable.end - 3;
      if(lx1 - lx0 < 12) continue;
      const q1 = toIso(x + lx0, y, shelfZ), q2 = toIso(x + lx1, y, shelfZ), q3 = toIso(x + lx1, y + depth, shelfZ), q4 = toIso(x + lx0, y + depth, shelfZ);
      const levelActive = selectedLevel === (i + 1);
      root.appendChild(face([q1,q2,q3,q4],{fill:levelActive?'#ffe27f':metallic.shelfTop,stroke:levelActive?'#ffca2f':metallic.stroke,'stroke-width':levelActive?'1.35':'0.9'}));
      root.appendChild(face([
        q4,
        q3,
        toIso(x + lx1, y + depth, Math.max(0, shelfZ - 2.4)),
        toIso(x + lx0, y + depth, Math.max(0, shelfZ - 2.4))
      ],{fill:metallic.shelfFront,stroke:'none'}));

      const desiredSlots = Math.max(1, Number(levelSlots[i] || model.slots || 1) || 1);
      const slots = getAdaptiveSlotCount(desiredSlots, lx1 - lx0, 18);
      const span = (lx1 - lx0) / Math.max(1, slots);
      const dividerByIndex = [];
      for(let s=1;s<slots;s++){
        const sx = lx0 + span * s;
        const roofHere = shape.topHeightAt(sx);
        const nextShelfZ = i < levels - 1 ? ((((accCm) / totalCm) * shape.tallHeight) + 3) : null;
        const topDiv = i < levels - 1 ? Math.min(roofHere - 3, nextShelfZ) : (roofHere - 3);
        if(topDiv <= shelfZ + 4) continue;
        const dividerHeight = topDiv;
        const halfThick = 1;
        const x0Div = x + sx - halfThick;
        const x1Div = x + sx + halfThick;
        const frontFace = face([
          toIso(x0Div, y + depth, shelfZ),
          toIso(x1Div, y + depth, shelfZ),
          toIso(x1Div, y + depth, dividerHeight),
          toIso(x0Div, y + depth, dividerHeight)
        ],{fill:'#d7e2ec',stroke:metallic.stroke,'stroke-width':'0.96'});
        const sideFace = face([
          toIso(x1Div, y, shelfZ),
          toIso(x1Div, y + depth, shelfZ),
          toIso(x1Div, y + depth, dividerHeight),
          toIso(x1Div, y, dividerHeight)
        ],{fill:'#c2d1df',stroke:metallic.stroke,'stroke-width':'0.9'});
        const topFace = face([
          toIso(x0Div, y, dividerHeight),
          toIso(x1Div, y, dividerHeight),
          toIso(x1Div, y + depth, dividerHeight),
          toIso(x0Div, y + depth, dividerHeight)
        ],{fill:'#e6eef7',stroke:metallic.stroke,'stroke-width':'0.82'});
        const dividerGroup = svgEl('g', {'data-understairs-divider': `${i + 1}-${s}`});
        dividerGroup.appendChild(sideFace);
        dividerGroup.appendChild(frontFace);
        dividerGroup.appendChild(topFace);
        dividerByIndex[s] = dividerGroup;
      }
      for(let s=0;s<slots;s++){
        const slotNo = s + 1;
        const rawBx0 = lx0 + span * s;
        const rawBx1 = lx0 + span * (s + 1);
        const baseBoxDepth = Math.max(12, depth * 0.48);
        const frontClearance = 2;
        const by1 = y + depth - frontClearance;
        const by0 = Math.max(y + 4, by1 - baseBoxDepth);
        const boxBottom = shelfZ + 2;
        const roofMid = shape.topHeightAt((rawBx0 + rawBx1) / 2);
        const boxTop = Math.min(roofMid - 6, topZ - 4, boxBottom + Math.max(12, Math.min(22, (topZ - shelfZ) * 0.58)));
        const active = levelActive && selectedSlot === slotNo;
        const safeRange = boxTop > boxBottom + 2
          ? getUnderStairsSafeSlotRange(shape, { start: rawBx0, end: rawBx1 }, boxTop, roofT, Math.max(2.2, span * 0.08), 3)
          : null;
        if(safeRange && (safeRange.end - safeRange.start) >= 8){
          drawStandardIsoStorageBox(root, (xx,yy,zz)=>toIso(xx,yy,zz), {
            slotClass: active,
            bx: x + safeRange.start,
            bw: Math.max(8, safeRange.end - safeRange.start),
            by: by0,
            boxDepth: Math.max(12, by1 - by0),
            boxBottomZ: boxBottom,
            dividerTopZ: Math.max(boxBottom + 8, topZ - 3),
            shelfY0: y,
            shelfY1: y + depth,
            glowFilter: 'url(#slotGlow)'
          });
        }
        if(dividerByIndex[slotNo]) root.appendChild(dividerByIndex[slotNo]);
      }
    }
    overlayFaces.push(slopeFrontLip);
    const sidePanelT = 2;
    const innerRightX = x + w - sidePanelT;
    const innerRightTop = shape.topHeightAt(Math.max(0, w - sidePanelT));
    const innerB = toIso(innerRightX, y, innerRightTop);
    const innerC = toIso(innerRightX, y + depth, innerRightTop);
    const innerb = toIso(innerRightX, y, z);
    const innerc = toIso(innerRightX, y + depth, z);
    overlayFaces.push(face([B,C,c,b],{fill:metallic.shellRight,stroke:metallic.stroke,'stroke-width':'1'}));
    overlayFaces.push(face([innerC,C,c,innerc],{fill:'#c5d3e0',stroke:'rgba(117,140,165,.92)','stroke-width':'0.86'}));
    overlayFaces.push(face([innerB,B,C,innerC],{fill:'#edf3f9',stroke:'rgba(117,140,165,.72)','stroke-width':'0.78'}));
    overlayFaces.forEach(el => root.appendChild(el));
    if(frontDiagonalPanel) root.appendChild(frontDiagonalPanel);

    const label = svgEl('text',{x:(A.x + C.x) / 2,y:Math.min(A.y,B.y) - 18,class:'rack-title','text-anchor':'middle'});
    label.textContent = rack?.id || model.name || 'Bajo escalera';
    root.appendChild(label);
    holder.setAttribute('viewBox','-190 -65 380 330');
    fitSelectedViewerRackPreview(holder, root, 0.9);
  }
  function buildIsoRack(r, prod){
    const model = rackModel(r.modelId) || {};
    const g = svgEl('g',{class:'rack-iso','data-rack':r.id});
    const main = prod?.rack === r.id;
    const store = prod?.rackStore === r.id;
    const selected = (appState.selectedRack || prod?.rack) === r.id;
    const levelHighlight = main ? Number(prod?.nivel || 0) : (store ? Number(prod?.nivelStore || 0) : 0);
    const searchHit = isRackSearchHit(r.id);
    const searchPrimary = appState.primaryHighlightedRackId === r.id;
    if(main) g.classList.add('active');
    if(store) g.classList.add('storage');
    if(selected) g.classList.add('selected');
    if(searchHit) g.classList.add('search-hit');
    if(searchPrimary) g.classList.add('selected');
    if(prod && !main && !store && !searchHit) g.classList.add('dim');

    const styleKind = normalizeRackStyle(model.style);
    if(isUnderStairsStyle(styleKind)) return buildUnderStairsIsoRack(rack, prod);

    const plan = getRackIsoPlan(r);
    const levels = Math.max(2, Number(model.levels || 4) || 4);
    const levelHeights = buildLevelHeights(model);
    const levelSlots = buildLevelSlots(model);
    const H = Math.max(72, Number(r.rackHeight || model.height || 238) * ISO_Z_SCALE);
    const baseHeight = Math.max(0, Number(r.baseHeight || 0) * 0.42);
    const projectedPoints = [];
    const project = (x, y, z = 0) => {
      const p = toIso(x, y, z + baseHeight);
      projectedPoints.push(p);
      return p;
    };
    const P0 = plan.corners[0], P1 = plan.corners[1], P3 = plan.corners[3];
    const ux = { x:(P1.x - P0.x) / Math.max(1, plan.bw), y:(P1.y - P0.y) / Math.max(1, plan.bw) };
    const uy = { x:(P3.x - P0.x) / Math.max(1, plan.bd), y:(P3.y - P0.y) / Math.max(1, plan.bd) };
    const lp = (lx, ly, lz = 0) => project(P0.x + ux.x * lx + uy.x * ly, P0.y + ux.y * lx + uy.y * ly, lz);
    const quad = (x0, y0, x1, y1, z) => [lp(x0,y0,z), lp(x1,y0,z), lp(x1,y1,z), lp(x0,y1,z)];
    const faceFront = (x0, x1, y, z0, z1) => [lp(x0,y,z1), lp(x1,y,z1), lp(x1,y,z0), lp(x0,y,z0)];
    const faceSide = (x, y0, y1, z0, z1) => [lp(x,y0,z1), lp(x,y1,z1), lp(x,y1,z0), lp(x,y0,z0)];
    const top = quad(0,0,plan.bw,plan.bd,H);
    const bottom = quad(0,0,plan.bw,plan.bd,0);

    const colors = styleKind === 'melamine'
      ? { top:'rgba(239,244,250,.97)', side:'rgba(193,208,224,.95)', front:'rgba(213,223,235,.95)', beamTop:'#edf3fa', beamFront:'#d9e4ef', post:'#c7d5e3', stroke:'#93a9c2', boxTop:'#efc98b', boxFront:'#d9a45f', boxSide:'#c98d46', divider:'#d5e0ea', back:'rgba(226,234,243,.92)' }
      : { top:'rgba(230,237,246,.97)', side:'rgba(142,168,197,.94)', front:'rgba(166,188,212,.95)', beamTop:'#e4edf7', beamFront:'#afc4d8', post:'#3f6287', stroke:'#6f8dad', boxTop:'#e4ba79', boxFront:'#ce9650', boxSide:'#bd7f39', divider:'#8ea8c4', back:'rgba(196,211,227,.72)' };

    const thickness = styleKind === 'melamine' ? 2 : 3;
    const shellT = styleKind === 'melamine' ? 2 : 0;
    const rackW = plan.bw;
    const rackD = plan.bd;
    const rackH = H;
    const floorY = 0;
    const melInnerX0 = shellT;
    const melInnerX1 = rackW - shellT;
    const melInnerY0 = 0;
    const melInnerY1 = rackD;

    if(styleKind === 'metallic'){
      const openRail = (x0, y0, z0, x1, y1, z1, width = '1.2', opacity = '1') => {
        const a = lp(x0, y0, z0);
        const b = lp(x1, y1, z1);
        g.appendChild(svgEl('line',{
          x1:a.x, y1:a.y, x2:b.x, y2:b.y,
          stroke:colors.post, 'stroke-width':width, 'stroke-linecap':'round', opacity
        }));
      };
      [0, rackW].forEach(x => {
        openRail(x, rackD, floorY, x, rackD, floorY + rackH, '2.2');
        openRail(x, 0, floorY, x, 0, floorY + rackH, '1.8', '.78');
      });
      openRail(0, 0, floorY, rackW, 0, floorY, '1.2', '.4');
      openRail(0, rackD, floorY, rackW, rackD, floorY, '1.4', '.55');
      openRail(0, 0, floorY + rackH, rackW, 0, floorY + rackH, '1.1', '.26');
      openRail(0, rackD, floorY + rackH, rackW, rackD, floorY + rackH, '1.2', '.38');
      openRail(0, 0, floorY, 0, rackD, floorY, '1.0', '.32');
      openRail(rackW, 0, floorY, rackW, rackD, floorY, '1.0', '.4');
    } else {
      g.appendChild(face(faceSide(0, 0, rackD, floorY, floorY + rackH), { fill:'#edf2f8', stroke:'#97abc1', 'stroke-width':'1.18' }));
      g.appendChild(face(faceFront(0, shellT, rackD, floorY, floorY + rackH), { fill:'#d8e2ec', stroke:'#92a8bf', 'stroke-width':'0.98' }));
      g.appendChild(face(faceFront(0, rackW, 0, floorY, floorY + rackH), { fill:'rgba(228,236,245,.92)', stroke:'rgba(132,153,177,.86)', 'stroke-width':'1.08' }));
      g.appendChild(face(faceFront(0, rackW, rackD, floorY, floorY - shellT), { fill:'#cad5e2', stroke:'none' }));
    }

    const totalLevelHeight = Math.max(1, levelHeights.reduce((sum, value) => sum + Math.max(10, Number(value) || 10), 0));
    const usableH = Math.max(40, rackH - 24);
    const levelScale = usableH / totalLevelHeight;
    const levelTopInset = 12;
    const levelZs = [];
    const levelClearHeights = [];
    let zCursor = floorY + levelTopInset;
    for(let i=0;i<levels;i++){
      levelZs.push(zCursor);
      const clearH = Math.max(16, (Math.max(10, Number(levelHeights[i] || 10)) * levelScale) - thickness - 2);
      levelClearHeights.push(clearH);
      zCursor += Math.max(10, Number(levelHeights[i] || 10)) * levelScale;
    }

    const drawMelamineDivider = (z, centerX, dividerY0, dividerY1, dividerW, dividerTopZ) => {
      const dx0 = centerX - dividerW / 2;
      const dx1 = centerX + dividerW / 2;
      const capZ = z + thickness + 0.08;
      g.appendChild(face([lp(dx0, dividerY0, capZ), lp(dx1, dividerY0, capZ), lp(dx1, dividerY1, capZ), lp(dx0, dividerY1, capZ)],{fill:'#f3f7fb',stroke:'#9fb0c3','stroke-width':'0.95'}));
      g.appendChild(face(faceFront(dx0, dx1, dividerY1, capZ, dividerTopZ),{fill:'#d6e1ec',stroke:'rgba(136,153,171,.42)','stroke-width':'0.55'}));
      g.appendChild(face(faceSide(dx1, dividerY0, dividerY1, capZ, dividerTopZ),{fill:'#c3d0de',stroke:'rgba(128,146,166,.38)','stroke-width':'0.55'}));
    };

    for(let i=0;i<levels;i++){
      const level = i + 1;
      const z = levelZs[i];
      const levelClass = levelHighlight === level;
      const shelfX0 = styleKind === 'melamine' ? melInnerX0 : 0;
      const shelfX1 = styleKind === 'melamine' ? melInnerX1 : rackW;
      const shelfY0 = styleKind === 'melamine' ? melInnerY0 : 0;
      const shelfY1 = styleKind === 'melamine' ? melInnerY1 : rackD;
      const levelTopPts = [lp(shelfX0, shelfY0, z), lp(shelfX1, shelfY0, z), lp(shelfX1, shelfY1, z), lp(shelfX0, shelfY1, z)];
      g.appendChild(face(levelTopPts,{fill:levelClass?'#ffe27f':'#e5edf7',stroke:levelClass?'#ffca2f':'#6c88a8','stroke-width':levelClass?'1.8':'1',filter:levelClass?'url(#mapGlow)':''}));
      g.appendChild(face(faceFront(shelfX0, shelfX1, shelfY1, z - thickness, z),{fill:levelClass?'#f4c73f':'#a8bdd2',stroke:'none'}));
      g.appendChild(face(faceSide(shelfX1, shelfY0, shelfY1, z - thickness, z),{fill:levelClass?'#e6b021':'#c1cedc',stroke:'none'}));

      const slotCount = Math.max(1, Number(levelSlots[i] || model.slots || 1) || 1);
      const sideInset = styleKind === 'melamine' ? 3 : 6;
      const slotDepthInset = styleKind === 'melamine' ? 0 : 8;
      const usableSlotWidth = Math.max(16, (shelfX1 - shelfX0) - sideInset * 2);
      const slotSpan = usableSlotWidth / slotCount;
      const dividerW = styleKind === 'melamine' ? shellT : Math.max(3, Math.min(6, rackW * 0.024));
      const dividerY0 = styleKind === 'melamine' ? 0 : (shelfY0 + slotDepthInset);
      const dividerY1 = styleKind === 'melamine' ? rackD : (shelfY1 - slotDepthInset);
      const dividerTopZ = (i < levelZs.length - 1) ? Math.max(z + thickness + 12, levelZs[i + 1] - thickness) : Math.max(z + thickness + 18, floorY + rackH - shellT);
      const dividerH = Math.max(18, dividerTopZ - (z + thickness));

      const slotGeometries = [];
      for(let s=1;s<=slotCount;s++){
        const slotStart = shelfX0 + sideInset + (s - 1) * slotSpan;
        const slotInnerPad = 2;
        const x0 = slotStart + slotInnerPad;
        const sw = Math.max(10, slotSpan - slotInnerPad * 2 - (styleKind === 'melamine' ? dividerW * 0.25 : 0));
        const slotClass = (levelHighlight === level && (main ? Number(prod?.slot || 0) : (store ? Number(prod?.slotStore || 0) : 0)) === s);
        slotGeometries.push({ s, slotClass, x0, sw });
      }

      const drawSlotBox = ({ s, slotClass, x0, sw }) => {
        g.appendChild(face([lp(x0, shelfY0 + 8, z + 1), lp(x0 + sw, shelfY0 + 8, z + 1), lp(x0 + sw, shelfY1 - 8, z + 1), lp(x0, shelfY1 - 8, z + 1)],{fill:slotClass?'rgba(255,216,77,.86)':'transparent',stroke:slotClass?'#ffc400':'rgba(201,216,237,.18)','stroke-width':slotClass?'1.5':'1',filter:slotClass?'url(#mapGlow)':''}));
        const boxDepth = getRackBoxDepth(shelfY1 - shelfY0, 3, 18);
        if(styleKind === 'melamine'){
          const boxInsetX = Math.max(2.6, Math.min(4.8, sw * 0.06));
          const bx = x0 + boxInsetX;
          const bw = Math.max(14, sw - boxInsetX * 2);
          const by = shelfY0 + 0.8;
          const boxBottomZ = z + thickness + 2;
          drawStandardIsoStorageBox(g, lp, { slotClass, bx, bw, by, boxDepth, boxBottomZ, dividerTopZ, shelfY0, shelfY1, glowFilter:'url(#mapGlow)' });
        } else {
          const bx = x0 + 2;
          const bw = Math.max(8, sw - 4);
          const by = shelfY0 + 5;
          const boxBottomZ = z + 4;
          drawStandardIsoStorageBox(g, lp, { slotClass, bx, bw, by, boxDepth, boxBottomZ, dividerTopZ, shelfY0, shelfY1, glowFilter:'url(#mapGlow)' });
        }
      };

      if(styleKind === 'melamine'){
        slotGeometries.forEach((geom, idx) => {
          drawSlotBox(geom);
          if(idx < slotCount - 1){
            const centerX = shelfX0 + sideInset + slotSpan * (idx + 1);
            drawMelamineDivider(z, centerX, dividerY0, dividerY1, dividerW, dividerTopZ);
          }
        });
      } else {
        slotGeometries.forEach(drawSlotBox);
      }

      const refSpacing = i < levelClearHeights.length ? levelClearHeights[i] : (usableH / Math.max(1, levels));
      const lt = lp(rackW + 14, rackD * 0.72, z + Math.max(10, refSpacing * 0.42));
      const txt = svgEl('text',{x:lt.x,y:lt.y,fill:levelClass ? '#ffd84d' : '#cbdcf4','font-size':levelClass ? '11' : '10','font-weight':'900','text-anchor':'start'});
      txt.textContent = 'N' + level;
      g.appendChild(txt);
    }

    if(styleKind === 'metallic'){
      g.appendChild(svgEl('line',{x1:lp(0, rackD * 0.08, floorY).x, y1:lp(0, rackD * 0.08, floorY).y, x2:lp(rackW, rackD * 0.08, floorY).x, y2:lp(rackW, rackD * 0.08, floorY).y, stroke:'rgba(95,127,160,.45)', 'stroke-width':'0.95', 'stroke-linecap':'round'}));
      g.appendChild(svgEl('line',{x1:lp(0, rackD * 0.08, floorY + rackH).x, y1:lp(0, rackD * 0.08, floorY + rackH).y, x2:lp(rackW, rackD * 0.08, floorY + rackH).x, y2:lp(rackW, rackD * 0.08, floorY + rackH).y, stroke:'rgba(95,127,160,.22)', 'stroke-width':'0.85', 'stroke-linecap':'round'}));
    } else {
      g.appendChild(face(faceFront(rackW - shellT, rackW, rackD, floorY, floorY + rackH), { fill:'#d8e2ec', stroke:'#8ea5bc', 'stroke-width':'1.02' }));
      g.appendChild(face(faceSide(rackW, 0, rackD, floorY, floorY + rackH), { fill:'#b7c7d8', stroke:'#7f99b5', 'stroke-width':'1.22' }));
      g.appendChild(face(top,{fill:levelHighlight ? '#ffe27f' : '#f3f6fb',stroke:levelHighlight ? '#ffca2f' : '#9fb2c7','stroke-width':levelHighlight ? '1.7' : '1.08',filter:levelHighlight ? 'url(#mapGlow)' : ''}));
      g.appendChild(face(faceFront(0, rackW, rackD, floorY + rackH - shellT, floorY + rackH),{fill:'#cfd9e6',stroke:'none'}));
      g.appendChild(face(faceSide(rackW, 0, rackD, floorY + rackH - shellT, floorY + rackH),{fill:'#d6e0ea',stroke:'none'}));
    }

    const frontTopA = lp(0, plan.bd, H);
    const frontTopB = lp(plan.bw, plan.bd, H);
    g.appendChild(svgEl('line',{x1:frontTopA.x,y1:frontTopA.y,x2:frontTopB.x,y2:frontTopB.y,class:'rack-front-line'}));
    const midFront = { x:(frontTopA.x + frontTopB.x) / 2, y:(frontTopA.y + frontTopB.y) / 2 };
    const centerTop = lp(plan.bw / 2, plan.bd / 2, H);
    const arrowDir = { x:midFront.x - centerTop.x, y:midFront.y - centerTop.y };
    const arrowLen = Math.hypot(arrowDir.x, arrowDir.y) || 1;
    const ax = midFront.x + (arrowDir.x / arrowLen) * 16;
    const ay = midFront.y + (arrowDir.y / arrowLen) * 16;
    const sideX = (arrowDir.x / arrowLen) * 6;
    const sideY = (arrowDir.y / arrowLen) * 6;
    const perpX = -(arrowDir.y / arrowLen) * 5;
    const perpY = (arrowDir.x / arrowLen) * 5;
    g.appendChild(svgEl('path',{class:'rack-front-arrow',d:`M ${ax + sideX} ${ay + sideY} L ${ax - sideX + perpX} ${ay - sideY + perpY} L ${ax - sideX - perpX} ${ay - sideY - perpY} Z`}));

    const labelPos = lp(plan.bw / 2, plan.bd / 2, H + 18);
    const label = svgEl('text',{x:labelPos.x,y:labelPos.y,class:'rack-title','text-anchor':'middle'});
    label.textContent = r.id;
    g.appendChild(label);
    if(main || store){
      const mk = lp(plan.bw / 2, plan.bd / 2, H + 72);
      g.appendChild(buildBlinkMarker(mk.x, mk.y, main ? '#ffd84d' : '#72f29d', store && !main));
    }
    g.addEventListener('click', e => { e.stopPropagation(); appState.selectedRack = r.id; appState.selectedRackLayoutId = r.id; renderMapView(); });
    return { group:g, projectedPoints };
  }

  function renderRackDetail(rackId, prod = null, targetSvg = null, forcedModel = null, forcedRack = null){
    const fallbackModel = rackModel(appState.selectedModelId) || appState.models?.[0] || { id:'std_4', name:'Rack estándar', levels:4, slots:2, width:120, depth:40, height:240, clearance:0, style:'metallic' };
    const foundRack = forcedRack || findRackById(rackId) || appState.layout?.racks?.[0] || null;
    const rack = foundRack || { id:rackId || fallbackModel.id || 'Rack', modelId:fallbackModel.id, x:0, y:0, w:fallbackModel.width || 120, h:fallbackModel.depth || 40, rackHeight:fallbackModel.height || 240, zoneId:'' };
    const model = forcedModel || rackModel(rack.modelId) || fallbackModel;
    const holder = targetSvg || $('#rackView');
    if(model && isUnderStairsStyle(model.style)) return renderUnderStairsDetail(rackId, prod, holder, model, rack);
    if(!holder || !model) return;
    holder.innerHTML = '';
    holder.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const defs = svgEl('defs');
    const filter = svgEl('filter',{id:'slotGlow',x:'-90%',y:'-90%',width:'280%',height:'280%'});
    filter.appendChild(svgEl('feDropShadow',{dx:'0',dy:'0',stdDeviation:'12','flood-color':'#9eff49','flood-opacity':'.95'}));
    filter.appendChild(svgEl('feDropShadow',{dx:'0',dy:'0',stdDeviation:'22','flood-color':'#ffe066','flood-opacity':'.42'}));
    defs.appendChild(filter); holder.appendChild(defs);

    const clearance = Math.max(0, model.clearance || 0);
    const levelSlots = buildLevelSlots(model);
    const levelHeights = buildLevelHeights(model);
    const styleKind = normalizeRackStyle(model.style);
    if(isUnderStairsStyle(styleKind)) return buildUnderStairsIsoRack(rack, prod);
    const rackDims = { x:-68, y:-22, w:model.width || 150, d:model.depth || 82, h:model.height || 238, levels:model.levels || 4, slots:Math.max(1, Math.min(6, Number(model.slots || model.capacity || 2) || 2)), clearance };
    const selectedLayoutRack = forcedRack || findRackById(rackId) || null;
    const renderContextMode = !!selectedLayoutRack && ['rackViewPrimary','rackViewStore','nav3dRackPrimary','nav3dRackStore'].includes(holder.id);
    const root = svgEl('g',{transform:`translate(0 118)`}); holder.appendChild(root);
    const floorY = clearance;
    const contextView = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const computeIsoPrismBounds = (x0, y0, z0, w, d, h) => {
      const pts = [
        toIso(x0, y0, z0), toIso(x0 + w, y0, z0), toIso(x0 + w, y0 + d, z0), toIso(x0, y0 + d, z0),
        toIso(x0, y0, z0 + h), toIso(x0 + w, y0, z0 + h), toIso(x0 + w, y0 + d, z0 + h), toIso(x0, y0 + d, z0 + h)
      ];
      return pts.reduce((acc, p) => {
        if(p.x < acc.minX) acc.minX = p.x;
        if(p.x > acc.maxX) acc.maxX = p.x;
        if(p.y < acc.minY) acc.minY = p.y;
        if(p.y > acc.maxY) acc.maxY = p.y;
        return acc;
      }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    };
    const trackIsoPrismBounds = (x0, y0, z0, w, d, h) => {
      const bounds = computeIsoPrismBounds(x0, y0, z0, w, d, h);
      if(bounds.minX < contextView.minX) contextView.minX = bounds.minX;
      if(bounds.maxX > contextView.maxX) contextView.maxX = bounds.maxX;
      if(bounds.minY < contextView.minY) contextView.minY = bounds.minY;
      if(bounds.maxY > contextView.maxY) contextView.maxY = bounds.maxY;
    };
    const drawContextRack = (x0, y0, z0, w, d, h, isStacked = false) => {
      const topFill = isStacked ? 'rgba(110,191,255,.42)' : 'rgba(161,187,219,.28)';
      const frontFill = isStacked ? 'rgba(90,154,232,.34)' : 'rgba(112,138,170,.24)';
      const sideFill = isStacked ? 'rgba(74,132,206,.28)' : 'rgba(89,113,145,.20)';
      const stroke = isStacked ? 'rgba(140,205,255,.86)' : 'rgba(171,192,219,.48)';
      root.appendChild(face([
        toIso(x0, y0, z0 + h),
        toIso(x0 + w, y0, z0 + h),
        toIso(x0 + w, y0 + d, z0 + h),
        toIso(x0, y0 + d, z0 + h)
      ],{fill:topFill,stroke,'stroke-width':'1'}));
      root.appendChild(face([
        toIso(x0, y0 + d, z0 + h),
        toIso(x0 + w, y0 + d, z0 + h),
        toIso(x0 + w, y0 + d, z0),
        toIso(x0, y0 + d, z0)
      ],{fill:frontFill,stroke:'rgba(120,145,178,.26)','stroke-width':'0.8'}));
      root.appendChild(face([
        toIso(x0 + w, y0, z0 + h),
        toIso(x0 + w, y0 + d, z0 + h),
        toIso(x0 + w, y0 + d, z0),
        toIso(x0 + w, y0, z0)
      ],{fill:sideFill,stroke:'rgba(120,145,178,.22)','stroke-width':'0.8'}));
      trackIsoPrismBounds(x0, y0, z0, w, d, h);
    };
    root.appendChild(face([toIso(rackDims.x-28,rackDims.y-20,floorY),toIso(rackDims.x+rackDims.w+28,rackDims.y-20,floorY),toIso(rackDims.x+rackDims.w+28,rackDims.y+rackDims.d+20,floorY),toIso(rackDims.x-28,rackDims.y+rackDims.d+20,floorY)],{fill:'rgba(255,255,255,.04)',stroke:'rgba(146,170,198,.22)','stroke-width':'1.2'}));
    trackIsoPrismBounds(rackDims.x - 28, rackDims.y - 20, floorY - 2, rackDims.w + 56, rackDims.d + 40, 2);
    const isRackCardView = ['rackViewPrimary','rackViewStore','nav3dRackPrimary','nav3dRackStore'].includes(holder.id);
    if(isRackCardView){
      const focusPad = 10;
      const focusLabelPadRight = 24;
      const focusBounds = computeIsoPrismBounds(
        rackDims.x - focusPad,
        rackDims.y - focusPad,
        floorY - focusPad,
        rackDims.w + (focusPad * 2) + focusLabelPadRight,
        rackDims.d + (focusPad * 2),
        rackDims.h + (focusPad * 2)
      );
      holder.__rackCardFocusBounds = focusBounds;
    } else if(holder.__rackCardFocusBounds){
      delete holder.__rackCardFocusBounds;
    }
    if(renderContextMode && selectedLayoutRack){
      const contextPaddingUnits = 10;
      const sideContextUnits = contextPaddingUnits;
      const depthContextUnits = contextPaddingUnits;
      const verticalContextUnits = contextPaddingUnits;
      const selectedX = Number(selectedLayoutRack.x || 0);
      const selectedY = Number(selectedLayoutRack.y || 0);
      const selectedW = Number(selectedLayoutRack.w || 0);
      const selectedH = Number(selectedLayoutRack.h || 0);
      const rangeX0 = selectedX - sideContextUnits;
      const rangeX1 = selectedX + selectedW + sideContextUnits;
      const rangeY0 = selectedY - depthContextUnits;
      const rangeY1 = selectedY + selectedH + depthContextUnits;
      const selectedCenterX = selectedX + selectedW / 2;
      const selectedCenterY = selectedY + selectedH / 2;
      const selectedBaseHeight = Math.max(0, Number(selectedLayoutRack.baseHeight || 0) || 0);
      const selectedRackHeight = Math.max(60, Number(selectedLayoutRack.rackHeight || model.height || 238) || 238);
      const selectedTopHeight = selectedBaseHeight + selectedRackHeight;
      const rangeZ0 = selectedBaseHeight - verticalContextUnits;
      const rangeZ1 = selectedTopHeight + verticalContextUnits;
      const scaleX = rackDims.w / Math.max(1, Number(selectedLayoutRack.w || rackDims.w) || rackDims.w);
      const scaleY = rackDims.d / Math.max(1, Number(selectedLayoutRack.h || rackDims.d) || rackDims.d);
      const scaleZ = rackDims.h / Math.max(60, selectedRackHeight);
      const neighbors = (appState.layout.racks || [])
        .filter(r => r && r.zoneId === selectedLayoutRack.zoneId)
        .filter(r => {
          if(r.id === selectedLayoutRack.id) return false;
          const rx0 = Number(r.x || 0), ry0 = Number(r.y || 0);
          const rw0 = Number(r.w || 0), rh0 = Number(r.h || 0);
          const rx1 = rx0 + rw0, ry1 = ry0 + rh0;
          const baseZ = Number(r.baseHeight || 0) || 0;
          const heightZ = Math.max(60, Number(r.rackHeight || rackModel(r.modelId)?.height || 238) || 238);
          const topZ = baseZ + heightZ;
          const sameDepthBand = !(ry1 < rangeY0 || ry0 > rangeY1);
          const withinSideBand = !(rx1 < rangeX0 || rx0 > rangeX1);
          const withinVerticalBand = !(topZ < rangeZ0 || baseZ > rangeZ1);
          const stacked = Math.round(rx0) === Math.round(selectedX) && Math.round(ry0) === Math.round(selectedY);
          return stacked || (sameDepthBand && withinSideBand && withinVerticalBand);
        })
        .sort((a,b) => ((Math.hypot((Number(a.x || 0) + Number(a.w || 0)/2) - selectedCenterX, (Number(a.y || 0) + Number(a.h || 0)/2) - selectedCenterY) - Math.hypot((Number(b.x || 0) + Number(b.w || 0)/2) - selectedCenterX, (Number(b.y || 0) + Number(b.h || 0)/2) - selectedCenterY)) || (Number(a.baseHeight || 0) - Number(b.baseHeight || 0)) || ((a.id || '').localeCompare(b.id || ''))))
        .slice(0, 10);
      neighbors.forEach(r => {
        const ctxModel = rackModel(r.modelId);
        const rw = Math.max(26, (Number(ctxModel?.width || r.w || 100) || 100) * scaleX);
        const rd = Math.max(18, (Number(ctxModel?.depth || r.h || 60) || 60) * scaleY);
        const rh = Math.max(34, (Number(r.rackHeight || ctxModel?.height || 238) || 238) * scaleZ);
        const centerX = Number(r.x || 0) + Number(r.w || 0) / 2;
        const centerY = Number(r.y || 0) + Number(r.h || 0) / 2;
        const localCx = rackDims.x + rackDims.w / 2 + ((centerX - selectedCenterX) * scaleX);
        const localCy = rackDims.y + rackDims.d / 2 + ((centerY - selectedCenterY) * scaleY);
        const localX = localCx - rw / 2;
        const localY = localCy - rd / 2;
        const localBase = floorY + ((Number(r.baseHeight || 0) - selectedBaseHeight) * scaleZ);
        const isStacked = Math.round(Number(r.x || 0)) === Math.round(Number(selectedLayoutRack.x || 0)) && Math.round(Number(r.y || 0)) === Math.round(Number(selectedLayoutRack.y || 0));
        drawContextRack(localX, localY, localBase, rw, rd, rh, isStacked);
        const lbl = toIso(localCx, localY + rd * 0.5, localBase + rh + 14);
        const txt = svgEl('text',{x:lbl.x,y:lbl.y,fill:isStacked?'rgba(179,228,255,.9)':'rgba(190,208,231,.82)','font-size':'10','font-weight':'800','text-anchor':'middle'});
        txt.textContent = r.id || '';
        root.appendChild(txt);
      });
    }
    const thickness = 3;
    const line = (a,b, opacity='1')=>svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#355a83','stroke-width':'4','stroke-linecap':'round','stroke-opacity':opacity});
    const selectedLevel = Number(prod?.nivel || 0);
    const selectedSlot = Number(prod?.slot || 0);
    const totalLevelHeight = Math.max(1, levelHeights.reduce((sum, v) => sum + Math.max(10, Number(v) || 10), 0));
    const usableHeight = Math.max(40, rackDims.h - 24);
    const levelScale = usableHeight / totalLevelHeight;
    const levelTopInset = 12;
    const levelZs = [];
    const levelClearHeights = [];
    let zCursor = floorY + levelTopInset;
    for(let i=0;i<rackDims.levels;i++){
      levelZs.push(zCursor);
      const clearH = Math.max(16, (Math.max(10, Number(levelHeights[i] || 10)) * levelScale) - thickness - 2);
      levelClearHeights.push(clearH);
      zCursor += Math.max(10, Number(levelHeights[i] || 10)) * levelScale;
    }
    const shellT = styleKind === 'melamine' ? 2 : 0;
    const melInnerX0 = rackDims.x + shellT;
    const melInnerX1 = rackDims.x + rackDims.w - shellT;
    const melInnerY0 = rackDims.y;
    const melInnerY1 = rackDims.y + rackDims.d;
    const melInnerW = Math.max(20, melInnerX1 - melInnerX0);
    const melInnerD = Math.max(20, melInnerY1 - melInnerY0);

    let drawMelamineRightShell = null;
    let drawMelamineTopShell = null;
    if(styleKind === 'metallic'){
      [
        line(toIso(rackDims.x+rackDims.w,rackDims.y,floorY),toIso(rackDims.x+rackDims.w,rackDims.y,rackDims.h+floorY),'0.98'),
        line(toIso(rackDims.x,rackDims.y,floorY),toIso(rackDims.x,rackDims.y,rackDims.h+floorY),'0.98')
      ].forEach(el=>root.appendChild(el));
    } else {
      const shellFill = '#edf2f8';
      const shellFillDark = '#dbe4ef';
      const shellStroke = '#a8b8ca';
      const appendMelamineRightShell = () => {
        // front strip first, then outer right face so the panel reads with actual 2 cm thickness
        root.appendChild(face([
          toIso(rackDims.x + rackDims.w - shellT, rackDims.y + rackDims.d, floorY),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w - shellT, rackDims.y + rackDims.d, floorY + rackDims.h)
        ],{fill:'#d8e2ec',stroke:'#8ea5bc','stroke-width':'1.02'}));
        root.appendChild(face([
          toIso(rackDims.x+rackDims.w, rackDims.y, floorY),
          toIso(rackDims.x+rackDims.w, rackDims.y + rackDims.d, floorY),
          toIso(rackDims.x+rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h),
          toIso(rackDims.x+rackDims.w, rackDims.y, floorY + rackDims.h)
        ],{fill:'#b7c7d8',stroke:'#7f99b5','stroke-width':'1.22'}));
      };
      const appendMelamineTopShell = () => {
        root.appendChild(face([
          toIso(rackDims.x, rackDims.y, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w, rackDims.y, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h),
          toIso(rackDims.x, rackDims.y + rackDims.d, floorY + rackDims.h)
        ],{fill:'#f3f6fb',stroke:'#9fb2c7','stroke-width':'1.08'}));
        root.appendChild(face([
          toIso(rackDims.x, rackDims.y + rackDims.d, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h - shellT),
          toIso(rackDims.x, rackDims.y + rackDims.d, floorY + rackDims.h - shellT)
        ],{fill:'#cfd9e6'}));
        root.appendChild(face([
          toIso(rackDims.x + rackDims.w, rackDims.y, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h),
          toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY + rackDims.h - shellT),
          toIso(rackDims.x + rackDims.w, rackDims.y, floorY + rackDims.h - shellT)
        ],{fill:'#d6e0ea'}));
      };
      // left wall stays behind the contents
      root.appendChild(face([
        toIso(rackDims.x, rackDims.y, floorY),
        toIso(rackDims.x, rackDims.y + rackDims.d, floorY),
        toIso(rackDims.x, rackDims.y + rackDims.d, floorY + rackDims.h),
        toIso(rackDims.x, rackDims.y, floorY + rackDims.h)
      ],{fill:shellFill,stroke:'#97abc1','stroke-width':'1.18'}));
      // visible front strip so the left side panel has real thickness
      root.appendChild(face([
        toIso(rackDims.x, rackDims.y + rackDims.d, floorY),
        toIso(rackDims.x + shellT, rackDims.y + rackDims.d, floorY),
        toIso(rackDims.x + shellT, rackDims.y + rackDims.d, floorY + rackDims.h),
        toIso(rackDims.x, rackDims.y + rackDims.d, floorY + rackDims.h)
      ],{fill:'#d8e2ec',stroke:'#92a8bf','stroke-width':'0.98'}));
      // optional back panel to close the cubicles visually
      root.appendChild(face([
        toIso(rackDims.x, rackDims.y, floorY),
        toIso(rackDims.x + rackDims.w, rackDims.y, floorY),
        toIso(rackDims.x + rackDims.w, rackDims.y, floorY + rackDims.h),
        toIso(rackDims.x, rackDims.y, floorY + rackDims.h)
      ],{fill:'rgba(228,236,245,.92)',stroke:'rgba(132,153,177,.86)','stroke-width':'1.08'}));
      // en melamina la base visible del mueble es el Nivel 1; evitamos una segunda bandeja extra en el piso
      root.appendChild(face([
        toIso(rackDims.x, rackDims.y + rackDims.d, floorY),
        toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY),
        toIso(rackDims.x + rackDims.w, rackDims.y + rackDims.d, floorY - shellT),
        toIso(rackDims.x, rackDims.y + rackDims.d, floorY - shellT)
      ],{fill:'#cad5e2'}));
      drawMelamineRightShell = appendMelamineRightShell;
      drawMelamineTopShell = appendMelamineTopShell;
    }

    for(let i=0;i<rackDims.levels;i++){
      const level = i+1, z = levelZs[i];
      const levelClass = selectedLevel === level;
      root.appendChild(face([toIso(styleKind === 'melamine' ? melInnerX0 : rackDims.x, styleKind === 'melamine' ? melInnerY0 : rackDims.y, z),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY0 : rackDims.y, z),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z),toIso(styleKind === 'melamine' ? melInnerX0 : rackDims.x, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z)],{fill:levelClass?'#ffe27f':'#e5edf7',stroke:levelClass?'#ffca2f':'#6c88a8','stroke-width':levelClass?'1.8':'1',filter:levelClass?'url(#slotGlow)':''}));
      root.appendChild(face([toIso(styleKind === 'melamine' ? melInnerX0 : rackDims.x, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z-thickness),toIso(styleKind === 'melamine' ? melInnerX0 : rackDims.x, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z-thickness)],{fill:levelClass?'#f4c73f':'#a8bdd2'}));
      root.appendChild(face([toIso(styleKind === 'melamine' ? melInnerX0 : rackDims.x, (styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d) - 1.2, z - 0.05),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, (styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d) - 1.2, z - 0.05),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z - thickness - 0.2),toIso(styleKind === 'melamine' ? melInnerX0 : rackDims.x, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z - thickness - 0.2)],{fill:'rgba(69,95,128,.10)',stroke:'none'}));
      root.appendChild(face([toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY0 : rackDims.y, z),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY1 : rackDims.y+rackDims.d, z-thickness),toIso(styleKind === 'melamine' ? melInnerX1 : rackDims.x+rackDims.w, styleKind === 'melamine' ? melInnerY0 : rackDims.y, z-thickness)],{fill:levelClass?'#e6b021':'#c1cedc'}));
      const slotCount = Math.max(1, levelSlots[i] || rackDims.slots || 1);
      const sideInset = styleKind === 'melamine' ? 3 : 6;
      const slotDepthInset = styleKind === 'melamine' ? 0 : 8;
      const shelfX0 = styleKind === 'melamine' ? melInnerX0 : rackDims.x;
      const shelfX1 = styleKind === 'melamine' ? melInnerX1 : (rackDims.x + rackDims.w);
      const shelfY0 = styleKind === 'melamine' ? melInnerY0 : rackDims.y;
      const shelfY1 = styleKind === 'melamine' ? melInnerY1 : (rackDims.y + rackDims.d);
      const usableSlotWidth = Math.max(16, (shelfX1 - shelfX0) - sideInset * 2);
      const slotSpan = usableSlotWidth / slotCount;
      const dividerW = styleKind === 'melamine' ? shellT : Math.max(3, Math.min(6, rackDims.w * 0.024));
      const dividerY0 = styleKind === 'melamine' ? rackDims.y : (shelfY0 + slotDepthInset);
      const dividerY1 = styleKind === 'melamine' ? (rackDims.y + rackDims.d) : (shelfY1 - slotDepthInset);
      const dividerTopZ = (i < levelZs.length - 1)
        ? Math.max(z + thickness + 12, levelZs[i + 1] - thickness)
        : Math.max(z + thickness + 18, floorY + rackDims.h - shellT);
      const dividerH = Math.max(18, dividerTopZ - (z + thickness));

      const drawMelamineDivider = (centerX) => {
        const dx0 = centerX - dividerW / 2;
        const dx1 = centerX + dividerW / 2;
        const capZ = z + thickness + 0.08;
        const dividerFront = '#d6e1ec';
        const dividerSide = '#c3d0de';
        const dividerTop = '#f3f7fb';
        root.appendChild(face([
          toIso(dx0, dividerY0, capZ),
          toIso(dx1, dividerY0, capZ),
          toIso(dx1, dividerY1, capZ),
          toIso(dx0, dividerY1, capZ)
        ],{fill:dividerTop,stroke:'#9fb0c3','stroke-width':'0.95'}));
        root.appendChild(face([
          toIso(dx0, dividerY1, capZ),
          toIso(dx1, dividerY1, capZ),
          toIso(dx1, dividerY1, dividerTopZ),
          toIso(dx0, dividerY1, dividerTopZ)
        ],{fill:dividerFront,stroke:'rgba(136,153,171,.42)','stroke-width':'0.55'}));
        root.appendChild(face([
          toIso(dx1, dividerY0, capZ),
          toIso(dx1, dividerY1, capZ),
          toIso(dx1, dividerY1, dividerTopZ),
          toIso(dx1, dividerY0, dividerTopZ)
        ],{fill:dividerSide,stroke:'rgba(128,146,166,.38)','stroke-width':'0.55'}));
      };

      const slotGeometries = [];
      for(let s=1;s<=slotCount;s++){
        const slotStart = shelfX0 + sideInset + (s-1) * slotSpan;
        const slotInnerPad = styleKind === 'melamine' ? 2 : 2;
        const x0 = slotStart + slotInnerPad;
        const sw = Math.max(10, slotSpan - slotInnerPad * 2 - (styleKind === 'melamine' ? dividerW * 0.25 : 0));
        const slotClass = (selectedLevel === level && selectedSlot === s);
        slotGeometries.push({ s, slotClass, x0, sw });
      }

      const drawStorageBox = ({slotClass, bx, bw, by, boxDepth, boxBottomZ, boxTopZ, dividerTopZ}) => {
        drawStandardIsoStorageBox(root, toIso, { slotClass, bx, bw, by, boxDepth, boxBottomZ, dividerTopZ, shelfY0, shelfY1, glowFilter:'url(#slotGlow)' });
      };

      const drawSlotBox = ({ s, slotClass, x0, sw }) => {
        root.appendChild(face([
          toIso(x0, shelfY0 + 8, z + 1),
          toIso(x0+sw, shelfY0 + 8, z + 1),
          toIso(x0+sw, shelfY1 - 8, z + 1),
          toIso(x0, shelfY1 - 8, z + 1)
        ],{fill:slotClass?'rgba(255,216,77,.92)':'transparent',stroke:slotClass?'#ffc400':'rgba(201,216,237,.18)','stroke-width':slotClass?'2.35':'1',filter:slotClass?'url(#slotGlow)':''}));

        if(styleKind === 'melamine'){
          const boxDepth = getRackBoxDepth(shelfY1 - shelfY0, 3, 18);
          const boxInsetX = Math.max(2.6, Math.min(4.8, sw * 0.06));
          const bx = x0 + boxInsetX;
          const bw = Math.max(14, sw - boxInsetX * 2);
          const by = shelfY0 + 0.8;
          const boxBottomZ = z + thickness + 2;
          drawStorageBox({ slotClass, bx, bw, by, boxDepth, boxBottomZ, boxTopZ: dividerTopZ - 6, dividerTopZ });
        } else {
          const boxDepth = getRackBoxDepth(shelfY1 - shelfY0, 3, 18);
          const bx = x0 + 2, bw = Math.max(8, sw - 4);
          const by = shelfY0 + 5;
          const boxBottomZ = z + 4;
          drawStorageBox({ slotClass, bx, bw, by, boxDepth, boxBottomZ, boxTopZ: dividerTopZ - 8, dividerTopZ });
        }
      };

      if(styleKind === 'melamine'){
        slotGeometries.forEach((geom, idx) => {
          drawSlotBox(geom);
          if(idx < slotCount - 1){
            const centerX = shelfX0 + sideInset + slotSpan * (idx + 1);
            drawMelamineDivider(centerX);
          }
        });
      } else {
        slotGeometries.forEach(drawSlotBox);
      }
      const refSpacing = i < levelClearHeights.length ? levelClearHeights[i] : (usableHeight / Math.max(1, rackDims.levels));
      const lt = toIso(rackDims.x + rackDims.w + 18, rackDims.y + rackDims.d * 0.72, z + Math.max(12, refSpacing * 0.42));
      const txt = svgEl('text',{x:lt.x,y:lt.y,fill:levelClass?'#ffd84d':'#cbdcf4','font-size':levelClass?'13':'12','font-weight':'900','text-anchor':'start'}); txt.textContent = 'N' + level; root.appendChild(txt);
    }

    if(styleKind === 'metallic'){
      [
        line(toIso(rackDims.x,rackDims.y+rackDims.d,floorY),toIso(rackDims.x,rackDims.y+rackDims.d,rackDims.h+floorY)),
        line(toIso(rackDims.x+rackDims.w,rackDims.y+rackDims.d,floorY),toIso(rackDims.x+rackDims.w,rackDims.y+rackDims.d,rackDims.h+floorY))
      ].forEach(el=>root.appendChild(el));
    } else {
      if(drawMelamineRightShell) drawMelamineRightShell();
      if(drawMelamineTopShell) drawMelamineTopShell();
    }
    const title = svgEl('text',{x:toIso(rackDims.x+rackDims.w/2,rackDims.y+rackDims.d/2,rackDims.h+24).x,y:toIso(rackDims.x+rackDims.w/2,rackDims.y+rackDims.d/2,rackDims.h+24).y,fill:'#eaf3ff','font-size':'14','font-weight':'900','text-anchor':'middle'});
    title.textContent = rackId || model.name; root.appendChild(title);
    const floorLabelPos = toIso(rackDims.x + rackDims.w/2, rackDims.y + rackDims.d + 28, floorY);
    const floorLabel = svgEl('text',{x:floorLabelPos.x,y:floorLabelPos.y,fill:'#8fa8c7','font-size':'11','font-weight':'700','text-anchor':'middle'});
    floorLabel.textContent = `Piso ${clearance}cm`; root.appendChild(floorLabel);
    try {
      const isPreviewSvg = holder && holder.id === 'rackModelSvg';
      const sideMargin = renderContextMode ? 10 : (isPreviewSvg ? 2 : 10);
      const topMargin = renderContextMode ? 10 : (isPreviewSvg ? 0 : 100);
      const frontMargin = renderContextMode ? 10 : 0;
      const bottomMargin = renderContextMode ? 10 : (isPreviewSvg ? 0 : 100);
      const envX0 = rackDims.x - sideMargin;
      const envX1 = rackDims.x + rackDims.w + sideMargin;
      const envY0 = rackDims.y - frontMargin;
      const envY1 = rackDims.y + rackDims.d + frontMargin;
      const envZ0 = floorY - bottomMargin;
      const envZ1 = floorY + rackDims.h + topMargin;
      trackIsoPrismBounds(envX0, envY0, envZ0, envX1 - envX0, envY1 - envY0, envZ1 - envZ0);
      const pts = [
        toIso(envX0, envY0, envZ0), toIso(envX1, envY0, envZ0), toIso(envX1, envY1, envZ0), toIso(envX0, envY1, envZ0),
        toIso(envX0, envY0, envZ1), toIso(envX1, envY0, envZ1), toIso(envX1, envY1, envZ1), toIso(envX0, envY1, envZ1)
      ];
      const minX = Number.isFinite(contextView.minX) ? contextView.minX : Math.min(...pts.map(p => p.x));
      const maxX = Number.isFinite(contextView.maxX) ? contextView.maxX : Math.max(...pts.map(p => p.x));
      const minY = Number.isFinite(contextView.minY) ? contextView.minY : Math.min(...pts.map(p => p.y));
      const maxY = Number.isFinite(contextView.maxY) ? contextView.maxY : Math.max(...pts.map(p => p.y));
      const chromePadX = renderContextMode ? 26 : (isPreviewSvg ? 0 : 18);
      const chromePadY = renderContextMode ? 26 : (isPreviewSvg ? 0 : 18);
      holder.setAttribute('viewBox', `${Math.floor(minX - chromePadX)} ${Math.floor(minY - chromePadY)} ${Math.ceil((maxX - minX) + chromePadX * 2)} ${Math.ceil((maxY - minY) + chromePadY * 2)}`);
    } catch(err) {}
    fitSelectedViewerRackPreview(holder, root, 0.9);
    detailStatus.textContent = prod ? `${rackId} • N${prod.nivel} • S${prod.slot}` : (rackId || model.name);
    detailChip.textContent = `${model.levels} niveles`;
  }


  function fitSelectedViewerRackPreview(holder, root, fillRatio = 0.88){
    try {
      if(!holder || !root) return;
      const holderId = holder.id || '';
      const isRackCardView = /^(rackViewPrimary|rackViewStore|nav3dRackPrimary|nav3dRackStore)$/.test(holderId);
      const cardFillRatio = isRackCardView ? 0.8 : fillRatio;
      const focusBounds = isRackCardView && holder.__rackCardFocusBounds ? holder.__rackCardFocusBounds : null;
      const bbox = focusBounds
        ? { x: focusBounds.minX, y: focusBounds.minY, width: focusBounds.maxX - focusBounds.minX, height: focusBounds.maxY - focusBounds.minY }
        : root.getBBox();
      if(!bbox || !Number.isFinite(bbox.width) || !Number.isFinite(bbox.height) || bbox.width <= 0 || bbox.height <= 0) return;
      const vb = holder.viewBox && holder.viewBox.baseVal ? holder.viewBox.baseVal : null;
      const targetW = Math.max(220, Number(vb?.width || 470) || 470);
      const targetH = Math.max(220, Number(vb?.height || 520) || 520);
      const aspect = targetW / Math.max(1, targetH);
      const desiredW = bbox.width / Math.max(0.1, cardFillRatio);
      const desiredH = bbox.height / Math.max(0.1, cardFillRatio);
      let viewW = desiredW;
      let viewH = desiredH;
      if((viewW / Math.max(1, viewH)) > aspect){
        viewH = viewW / aspect;
      } else {
        viewW = viewH * aspect;
      }
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      const cardOffsetY = 0;
      holder.setAttribute('viewBox', `${cx - viewW / 2} ${(cy - viewH / 2) - cardOffsetY} ${viewW} ${viewH}`);
    } catch(err) {}
  }

  function enablePanZoom(svg, target, focusBounds = null, initialTransform = null){
    const ZOOM_MIN = 0.55;
    const ZOOM_MAX = 4.8;
    const ZOOM_STEP = 0.14;
    let scale = Number(initialTransform?.scale || 1.35) || 1.35, tx = Number(initialTransform?.tx || 20) || 0, ty = Number(initialTransform?.ty || 170) || 0, dragging = false, sx = 0, sy = 0;
    const apply = () => target.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);

    if(focusBounds){
      const vb = svg.viewBox?.baseVal;
      const vw = Math.max(640, Number(vb?.width || 1220) || 1220);
      const vh = Math.max(420, Number(vb?.height || 820) || 820);
      const bw = Math.max(120, focusBounds.maxX - focusBounds.minX);
      const bh = Math.max(120, focusBounds.maxY - focusBounds.minY);
      const pad = 80;
      scale = Math.max(1.05, Math.min(2.8, Math.min((vw - pad) / bw, (vh - pad) / bh)));
      const cx = (focusBounds.minX + focusBounds.maxX) / 2;
      const cy = (focusBounds.minY + focusBounds.maxY) / 2;
      tx = (vw / 2) - (cx * scale);
      ty = (vh / 2) - (cy * scale);
    }

    apply();
    svg.onwheel = e => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, scale + (direction * ZOOM_STEP)));
      apply();
    };
    svg.onpointerdown = e => { if(e.target.closest('.rack-iso')) return; dragging = true; sx = e.clientX - tx; sy = e.clientY - ty; svg.setPointerCapture(e.pointerId); };
    svg.onpointermove = e => { if(!dragging) return; tx = e.clientX - sx; ty = e.clientY - sy; apply(); };
    svg.onpointerup = () => dragging = false; svg.onpointercancel = () => dragging = false;
  }


  function ensureLayoutEditorState(){
    if(!appState.editor || typeof appState.editor !== 'object') appState.editor = {};
    ensureLayoutDecorations();
    if(appState.editor.showGrid === undefined) appState.editor.showGrid = true;
    if(appState.editor.showZones === undefined) appState.editor.showZones = true;
    if(appState.editor.showLabels === undefined) appState.editor.showLabels = true;
    if(appState.editor.racksVisible === undefined) appState.editor.racksVisible = true;
    if(appState.editor.wallsVisible === undefined) appState.editor.wallsVisible = true;
    if(appState.editor.openingsVisible === undefined) appState.editor.openingsVisible = true;
    if(appState.editor.showDims === undefined) appState.editor.showDims = true;
    if(appState.editor.showMiniMap === undefined) appState.editor.showMiniMap = true;
    if(appState.editor.snapEnabled === undefined) appState.editor.snapEnabled = true;
    if(appState.editor.pendingWallPoint === undefined) appState.editor.pendingWallPoint = null;
    // Migración: versiones antiguas dejaban el snap en 20 unidades; ahora se baja a 2 para precisión fina.
    if(!appState.editor.snapPrecisionMigrated && Number(appState.editor.snapSize || 0) >= 20){
      appState.editor.snapSize = DEFAULT_GRID_SIZE;
      appState.editor.snapPrecisionMigrated = true;
    }
    if(!appState.editor.dimFontMigrated && Number(appState.editor.dimFontSize || 0) <= 20){
      appState.editor.dimFontSize = DEFAULT_DIM_FONT_SIZE;
      appState.editor.dimFontMigrated = true;
    }
    appState.editor.snapSize = getSnapSize();
    appState.editor.dimFontSize = getDimFontSize();
    if(appState.editor.rightPanelOpen === undefined) appState.editor.rightPanelOpen = true;
  }


  function ensureZoneEdgeWalls(zone){
    if(!zone || typeof zone !== 'object') return {};
    if(!zone.edgeWalls || typeof zone.edgeWalls !== 'object' || Array.isArray(zone.edgeWalls)) zone.edgeWalls = {};
    return zone.edgeWalls;
  }
  function getZoneEdgeWall(zone, edgeIndex){
    const walls = ensureZoneEdgeWalls(zone);
    const key = String(edgeIndex);
    return walls[key] || null;
  }
  function isZoneEdgeWallEnabled(zone, edgeIndex){
    return !!getZoneEdgeWall(zone, edgeIndex)?.enabled;
  }
  function setZoneEdgeWall(zone, edgeIndex, updates={}){
    if(!zone || edgeIndex < 0) return null;
    const walls = ensureZoneEdgeWalls(zone);
    const key = String(edgeIndex);
    const prev = walls[key] || {};
    const nextSide = Number((updates.side ?? prev.side ?? 1));
    walls[key] = {
      enabled:true,
      thickness:Number(prev.thickness || getZoneWallThickness(zone) || 14),
      height:Number(prev.height || appState.layout?.meta?.defaultWallHeight || 290),
      side:Number.isFinite(nextSide) && nextSide < 0 ? -1 : 1,
      ...prev,
      ...updates,
      side:Number.isFinite(nextSide) && nextSide < 0 ? -1 : 1,
      enabled: updates.enabled === false ? false : true
    };
    return walls[key];
  }
  function removeZoneEdgeWall(zone, edgeIndex){
    if(!zone || !zone.edgeWalls) return;
    delete zone.edgeWalls[String(edgeIndex)];
  }

  function getWallSideSign(value){
    const n = Number(value);
    return Number.isFinite(n) && n < 0 ? -1 : 1;
  }

  function lineIntersection2D(a1, a2, b1, b2){
    const x1 = Number(a1?.x || 0), y1 = Number(a1?.y || 0);
    const x2 = Number(a2?.x || 0), y2 = Number(a2?.y || 0);
    const x3 = Number(b1?.x || 0), y3 = Number(b1?.y || 0);
    const x4 = Number(b2?.x || 0), y4 = Number(b2?.y || 0);
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if(Math.abs(den) < 0.00001) return null;
    const px = ((x1*y2 - y1*x2) * (x3 - x4) - (x1 - x2) * (x3*y4 - y3*x4)) / den;
    const py = ((x1*y2 - y1*x2) * (y3 - y4) - (y1 - y2) * (x3*y4 - y3*x4)) / den;
    return Number.isFinite(px) && Number.isFinite(py) ? { x:px, y:py } : null;
  }

  function getZoneEdgeWallPolygon(zone, edgeIndex, wallData = null){
    if(!zone || !Array.isArray(zone.pts) || zone.pts.length < 2 || edgeIndex < 0) return null;
    const count = zone.pts.length;
    const a = zone.pts[edgeIndex];
    const b = zone.pts[(edgeIndex + 1) % count];
    const wall = wallData || getZoneEdgeWall(zone, edgeIndex);
    if(!a || !b || !wall || wall.enabled === false) return null;
    const thickness = Math.max(8, Number(wall.thickness || getZoneWallThickness(zone) || 14));
    const side = getWallSideSign(wall.side);
    const baseN = getZoneOutwardEdgeNormal(zone, a, b);
    const n = { x:baseN.x * side, y:baseN.y * side };
    let outerA = { x:Number(a.x||0) + n.x * thickness, y:Number(a.y||0) + n.y * thickness };
    let outerB = { x:Number(b.x||0) + n.x * thickness, y:Number(b.y||0) + n.y * thickness };

    const prevIdx = (edgeIndex - 1 + count) % count;
    const prevWall = getZoneEdgeWall(zone, prevIdx);
    if(prevWall?.enabled && getWallSideSign(prevWall.side) === side){
      const pa = zone.pts[prevIdx];
      const pb = zone.pts[edgeIndex];
      const prevNBase = getZoneOutwardEdgeNormal(zone, pa, pb);
      const prevN = { x:prevNBase.x * side, y:prevNBase.y * side };
      const prevTh = Math.max(8, Number(prevWall.thickness || getZoneWallThickness(zone) || 14));
      const hit = lineIntersection2D(
        { x:Number(pa.x||0) + prevN.x * prevTh, y:Number(pa.y||0) + prevN.y * prevTh },
        { x:Number(pb.x||0) + prevN.x * prevTh, y:Number(pb.y||0) + prevN.y * prevTh },
        outerA,
        outerB
      );
      if(hit) outerA = hit;
    }

    const nextIdx = (edgeIndex + 1) % count;
    const nextWall = getZoneEdgeWall(zone, nextIdx);
    if(nextWall?.enabled && getWallSideSign(nextWall.side) === side){
      const na = zone.pts[nextIdx];
      const nb = zone.pts[(nextIdx + 1) % count];
      const nextNBase = getZoneOutwardEdgeNormal(zone, na, nb);
      const nextN = { x:nextNBase.x * side, y:nextNBase.y * side };
      const nextTh = Math.max(8, Number(nextWall.thickness || getZoneWallThickness(zone) || 14));
      const hit = lineIntersection2D(
        outerA,
        outerB,
        { x:Number(na.x||0) + nextN.x * nextTh, y:Number(na.y||0) + nextN.y * nextTh },
        { x:Number(nb.x||0) + nextN.x * nextTh, y:Number(nb.y||0) + nextN.y * nextTh }
      );
      if(hit) outerB = hit;
    }

    return [
      { x:Number(a.x || 0), y:Number(a.y || 0) },
      { x:Number(b.x || 0), y:Number(b.y || 0) },
      outerB,
      outerA
    ];
  }

  function wallPolygonPath(poly){
    if(!Array.isArray(poly) || poly.length < 3) return '';
    return poly.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${Number(pt.x||0)} ${Number(pt.y||0)}`).join(' ') + ' Z';
  }

  function getAutoWallPolygon(wall){
    if(!wall?.autoZoneEdge) return null;
    const zone = findZoneById(wall.zoneId);
    const edgeIndex = Number(wall.edgeIndex);
    if(!zone || !Number.isFinite(edgeIndex)) return null;
    return getZoneEdgeWallPolygon(zone, edgeIndex, wall);
  }
  function getSelectedEdgeWallContext(){
    const sel = appState.selectedEdge || { zoneId:'', a:-1, b:-1 };
    const zone = findZoneById(sel.zoneId);
    if(!zone || sel.a < 0 || !zone.pts?.[sel.a] || !zone.pts?.[sel.b]) return null;
    const edgeIndex = sel.a;
    const wall = getZoneEdgeWall(zone, edgeIndex);
    const a = zone.pts[sel.a], b = zone.pts[sel.b];
    return { zone, edgeIndex, a, b, wall, isWall:!!wall?.enabled, length:Math.sqrt(dist2(a,b)) };
  }
  function convertSelectedEdgeToWall(updates={}){
    const ctx = getSelectedEdgeWallContext();
    if(!ctx) return null;
    const wall = setZoneEdgeWall(ctx.zone, ctx.edgeIndex, updates);
    syncZonePerimeterWalls();
    appState.selectedWallId = zoneEdgeWallId(ctx.zone.id, ctx.edgeIndex);
    return wall;
  }

  function getZoneWallThickness(zone){
    const raw = Number(zone?.wallThickness);
    if(Number.isFinite(raw) && raw > 0) return Math.max(8, raw);
    const metaRaw = Number(appState.layout?.meta?.defaultWallThickness);
    if(Number.isFinite(metaRaw) && metaRaw > 0) return Math.max(8, metaRaw);
    return 14;
  }
  function zoneEdgeWallId(zoneId, edgeIndex){ return `ZW-${String(zoneId || 'Z')}-${edgeIndex}`; }
  function syncZonePerimeterWalls(layout = appState.layout){
    if(!layout || typeof layout !== 'object') return { walls:[], openings:[] };
    if(!Array.isArray(layout.walls)) layout.walls = [];
    if(!Array.isArray(layout.openings)) layout.openings = [];
    const existingById = new Map((layout.walls || []).map(w => [String(w.id || ''), w]));
    const autoWalls = [];
    (layout.zones || []).forEach(zone => {
      if(!zone || !Array.isArray(zone.pts) || zone.pts.length < 2) return;
      for(let idx = 0; idx < zone.pts.length; idx += 1){
        const edgeWall = getZoneEdgeWall(zone, idx);
        if(!edgeWall?.enabled) continue;
        const a = zone.pts[idx];
        const b = zone.pts[(idx + 1) % zone.pts.length];
        if(!a || !b) continue;
        const id = zoneEdgeWallId(zone.id, idx);
        const prev = existingById.get(id) || {};
        autoWalls.push({
          ...prev,
          id,
          name:`Pared ${zone.id}-${idx + 1}`,
          x1:Number(a.x || 0),
          y1:Number(a.y || 0),
          x2:Number(b.x || 0),
          y2:Number(b.y || 0),
          thickness:Math.max(8, Number(edgeWall.thickness || getZoneWallThickness(zone) || 14)),
          height:Math.max(120, Number(edgeWall.height || appState.layout?.meta?.defaultWallHeight || 290)),
          side:getWallSideSign(edgeWall.side),
          kind:'zone-wall',
          autoZoneEdge:true,
          zoneId:zone.id,
          edgeIndex:idx,
          locked:true
        });
      }
    });
    const manualWalls = (layout.walls || []).filter(w => !w?.autoZoneEdge);
    layout.walls = [...autoWalls, ...manualWalls];
    return layout;
  }
  function ensureLayoutDecorations(layout = appState.layout){
    if(!layout || typeof layout !== 'object') return { walls:[], openings:[] };
    if(!Array.isArray(layout.walls)) layout.walls = [];
    if(!Array.isArray(layout.openings)) layout.openings = [];
    syncZonePerimeterWalls(layout);
    return layout;
  }

  function nextWallId(){
    ensureLayoutDecorations();
    const vals = (appState.layout.walls || []).map(w => {
      const m = String(w.id || '').match(/^W(\d+)$/i);
      return m ? parseInt(m[1], 10) : NaN;
    }).filter(Number.isFinite);
    return `W${(Math.max(0, ...vals) + 1)}`;
  }
  function nextOpeningId(){
    ensureLayoutDecorations();
    const vals = (appState.layout.openings || []).map(o => parseInt(String(o.id || '').replace(/\D+/g,''), 10)).filter(Number.isFinite);
    return `O${(Math.max(0, ...vals) + 1)}`;
  }
  function findWallById(id){ ensureLayoutDecorations(); return (appState.layout.walls || []).find(w => w.id === id); }
  function findOpeningById(id){ ensureLayoutDecorations(); return (appState.layout.openings || []).find(o => o.id === id); }
  function wallLength(wall){ return wall ? Math.sqrt(((Number(wall.x2||0)-Number(wall.x1||0))**2)+((Number(wall.y2||0)-Number(wall.y1||0))**2)) : 0; }
  function wallDirection(wall){
    const len = Math.max(1, wallLength(wall));
    return wall ? { x:(Number(wall.x2||0)-Number(wall.x1||0))/len, y:(Number(wall.y2||0)-Number(wall.y1||0))/len } : {x:1,y:0};
  }
  function wallNormal(wall){ const d = wallDirection(wall); return { x:-d.y, y:d.x }; }
  function openingClampT(wall, width, t){
    const len = Math.max(1, wallLength(wall));
    const half = Math.max(6, Number(width || 90) / 2) / len;
    return Math.max(half, Math.min(1 - half, Number(t || .5)));
  }
  function getOpeningSegment(opening, wall=findWallById(opening?.wallId)){
    if(!opening || !wall) return null;
    const len = Math.max(1, wallLength(wall));
    const width = Math.max(40, Number(opening.width || 90) || 90);
    const halfT = Math.min(.48, (width / 2) / len);
    const t = openingClampT(wall, width, opening.t);
    const a = { x:Number(wall.x1||0), y:Number(wall.y1||0) };
    const b = { x:Number(wall.x2||0), y:Number(wall.y2||0) };
    const vx = b.x - a.x, vy = b.y - a.y;
    return {
      a: { x:a.x + vx * Math.max(0, t - halfT), y:a.y + vy * Math.max(0, t - halfT) },
      b: { x:a.x + vx * Math.min(1, t + halfT), y:a.y + vy * Math.min(1, t + halfT) },
      center: { x:a.x + vx * t, y:a.y + vy * t },
      width,
      t
    };
  }

  function getWallOpeningNormal(wall){
    if(wall?.autoZoneEdge){
      const zone = findZoneById(wall.zoneId);
      const idx = Number(wall.edgeIndex || 0) || 0;
      const a = zone?.pts?.[idx];
      const b = zone?.pts?.[(idx + 1) % (zone?.pts?.length || 1)];
      if(zone && a && b){
        const base = getZoneOutwardEdgeNormal(zone, a, b);
        const side = typeof getWallSideSign === 'function' ? getWallSideSign(wall.side) : (Number(wall.side || 1) >= 0 ? 1 : -1);
        return { x:base.x * side, y:base.y * side };
      }
    }
    return wallNormal(wall);
  }

  function getWallSlicePolygon(wall, t0=0, t1=1, inflate=1){
    if(!wall) return null;
    const len = Math.max(1, wallLength(wall));
    const start = Math.max(0, Math.min(1, Number(t0) || 0));
    const end = Math.max(start, Math.min(1, Number(t1) || 1));
    if((end - start) * len < 1) return null;
    const ax = Number(wall.x1 || 0), ay = Number(wall.y1 || 0);
    const bx = Number(wall.x2 || 0), by = Number(wall.y2 || 0);
    const dir = { x:(bx-ax) / len, y:(by-ay) / len };
    const p0 = { x:ax + (bx-ax) * start, y:ay + (by-ay) * start };
    const p1 = { x:ax + (bx-ax) * end, y:ay + (by-ay) * end };
    const normal = getWallOpeningNormal(wall);
    const rawThickness = Math.max(8, Number(wall.thickness || 14) || 14) * Math.max(.1, Number(inflate || 1));
    if(wall.autoZoneEdge){
      return {
        normal,
        poly:[
          { x:p0.x, y:p0.y },
          { x:p1.x, y:p1.y },
          { x:p1.x + normal.x * rawThickness, y:p1.y + normal.y * rawThickness },
          { x:p0.x + normal.x * rawThickness, y:p0.y + normal.y * rawThickness }
        ],
        center:{ x:(p0.x+p1.x)/2 + normal.x * rawThickness * .5, y:(p0.y+p1.y)/2 + normal.y * rawThickness * .5 },
        thickness:rawThickness,
        dir,
        a:p0,
        b:p1
      };
    }
    const half = rawThickness / 2;
    return {
      normal,
      poly:[
        { x:p0.x - normal.x * half, y:p0.y - normal.y * half },
        { x:p1.x - normal.x * half, y:p1.y - normal.y * half },
        { x:p1.x + normal.x * half, y:p1.y + normal.y * half },
        { x:p0.x + normal.x * half, y:p0.y + normal.y * half }
      ],
      center:{ x:(p0.x+p1.x)/2, y:(p0.y+p1.y)/2 },
      thickness:rawThickness,
      dir,
      a:p0,
      b:p1
    };
  }

  function getOpeningFootprint(opening, wall=findWallById(opening?.wallId), inflate=1){
    const seg = getOpeningSegment(opening, wall);
    if(!seg || !wall) return null;
    const len = Math.max(1, wallLength(wall));
    const width = Math.max(40, Number(opening.width || 90) || 90);
    const start = Math.max(0, (seg.t * len - width / 2) / len);
    const end = Math.min(1, (seg.t * len + width / 2) / len);
    const slice = getWallSlicePolygon(wall, start, end, inflate);
    return slice ? { seg, normal:slice.normal, poly:slice.poly } : null;
  }

  function normalizeOpeningType(type){
    if(type === 'window') return 'window';
    if(type === 'free' || type === 'open') return 'free';
    if(type === 'gate') return 'gate';
    return 'door';
  }
  function openingDefaultForType(type){
    const kind = normalizeOpeningType(type);
    if(kind === 'window') return { width:120, height:100, sill:90 };
    if(kind === 'gate') return { width:180, height:240, sill:0 };
    if(kind === 'free') return { width:120, height:260, sill:0 };
    return { width:90, height:210, sill:0 };
  }
  function getOpeningPositionInfo(opening, wall=findWallById(opening?.wallId)){
    if(!opening || !wall) return null;
    const len = Math.max(1, wallLength(wall));
    const width = Math.max(40, Number(opening.width || openingDefaultForType(opening.type).width) || 90);
    const t = openingClampT(wall, width, opening.t);
    const start = Math.max(0, t * len - width / 2);
    const end = Math.min(len, t * len + width / 2);
    return { len, width, t, start, end, left:start, right:Math.max(0, len-end), center:t*len };
  }
  function setOpeningPositionFromPoint(opening, point, opts={}){
    const wall = findWallById(opening?.wallId);
    if(!opening || !wall || !point) return null;
    const proj = projectPointToSegment(point, {x:Number(wall.x1||0), y:Number(wall.y1||0)}, {x:Number(wall.x2||0), y:Number(wall.y2||0)});
    const len = Math.max(1, wallLength(wall));
    const width = Math.max(40, Number(opening.width || openingDefaultForType(opening.type).width) || 90);
    let dist = proj.t * len;
    if(opts.snap !== false){
      const step = Math.max(1, Number(appState.editor?.snapSize || DEFAULT_GRID_SIZE || 2) || 2);
      dist = Math.round(dist / step) * step;
    }
    opening.t = openingClampT(wall, width, dist / len);
    return opening;
  }
  function resizeOpeningFromPoint(opening, point, edge='end'){
    const wall = findWallById(opening?.wallId);
    if(!opening || !wall || !point) return null;
    const len = Math.max(1, wallLength(wall));
    const info = getOpeningPositionInfo(opening, wall);
    if(!info) return null;
    const proj = projectPointToSegment(point, {x:Number(wall.x1||0), y:Number(wall.y1||0)}, {x:Number(wall.x2||0), y:Number(wall.y2||0)});
    let moving = proj.t * len;
    const step = Math.max(1, Number(appState.editor?.snapSize || DEFAULT_GRID_SIZE || 2) || 2);
    moving = Math.round(moving / step) * step;
    let start = info.start, end = info.end;
    const minWidth = 40;
    if(edge === 'start') start = Math.min(end - minWidth, moving);
    else end = Math.max(start + minWidth, moving);
    start = Math.max(0, Math.min(len - minWidth, start));
    end = Math.max(start + minWidth, Math.min(len, end));
    const width = Math.max(minWidth, Math.min(360, end - start));
    opening.width = Math.round(width);
    opening.t = openingClampT(wall, opening.width, ((start + end) / 2) / len);
    return opening;
  }
  function duplicateOpening(opening){
    const wall = findWallById(opening?.wallId);
    if(!opening || !wall) return null;
    const next = clone(opening);
    next.id = nextOpeningId();
    const len = Math.max(1, wallLength(wall));
    const offset = Math.min(.18, Math.max(.08, (Number(next.width || 90) * 1.35) / len));
    next.t = openingClampT(wall, next.width, Math.min(.98, Number(opening.t || .5) + offset));
    appState.layout.openings.push(next);
    appState.selectedOpeningId = next.id;
    appState.selectedWallId = next.wallId;
    return next;
  }
  function startOpeningDrag(e, openingId, mode='move'){
    if(appState.editor.mode !== 'select') return;
    e.stopPropagation();
    const opening = findOpeningById(openingId);
    const wall = findWallById(opening?.wallId);
    if(!opening || !wall) return;
    const svg = $('#layoutSvg');
    const p = svgPoint(e, svg);
    appState.selectedOpeningId = opening.id;
    appState.selectedWallId = opening.wallId;
    appState.selectedRackLayoutId = '';
    closeStackMenu();
    appState.editor.dragging = { type:'opening', openingId:opening.id, mode, start:p, original:clone(opening) };
    if(svg) svg.style.cursor = mode === 'move' ? 'grabbing' : 'ew-resize';
    renderLayoutSvg(svg); renderLayoutSection(); renderLayoutInspector();
  }
  function findNearestWallProjection(point, threshold = 22){
    ensureLayoutDecorations();
    let best = null;
    (appState.layout.walls || []).forEach(wall => {
      const proj = projectPointToSegment(point, {x:Number(wall.x1||0), y:Number(wall.y1||0)}, {x:Number(wall.x2||0), y:Number(wall.y2||0)});
      const d = Math.sqrt(dist2(point, proj));
      if(d <= threshold && (!best || d < best.d)) best = { wall, proj, d };
    });
    return best;
  }
  function createWallSegment(a, b){
    ensureLayoutDecorations();
    const dx = Number(b.x||0) - Number(a.x||0), dy = Number(b.y||0) - Number(a.y||0);
    if(Math.sqrt(dx*dx + dy*dy) < 24) return null;
    const wall = { id:nextWallId(), name:'Pared', x1:snapGrid(a.x), y1:snapGrid(a.y), x2:snapGrid(b.x), y2:snapGrid(b.y), thickness:12, kind:'wall' };
    appState.layout.walls.push(wall);
    appState.selectedWallId = wall.id;
    appState.selectedOpeningId = '';
    appState.selectedRackLayoutId = '';
    return wall;
  }
  function createOpeningAtPoint(point, type='door'){
    ensureLayoutDecorations();
    const nearest = findNearestWallProjection(point, 28);
    if(!nearest || !nearest.wall) return null;
    const def = openingDefaultForType(type);
    const hostDepth = Math.max(8, Number(nearest.wall.thickness || 14) || 14);
    const opening = { id:nextOpeningId(), wallId:nearest.wall.id, t:nearest.proj.t, width:def.width, height:def.height, sill:def.sill, depth:hostDepth, type:normalizeOpeningType(type), swing:1 };
    opening.t = openingClampT(nearest.wall, opening.width, opening.t);
    appState.layout.openings.push(opening);
    appState.selectedOpeningId = opening.id;
    appState.selectedWallId = nearest.wall.id;
    appState.selectedRackLayoutId = '';
    return opening;
  }

  function createOpeningOnWall(wallId, type='door'){
    ensureLayoutDecorations();
    const wall = findWallById(wallId);
    if(!wall) return null;
    const def = openingDefaultForType(type);
    const hostDepth = Math.max(8, Number(wall.thickness || 14) || 14);
    const opening = { id:nextOpeningId(), wallId:wall.id, t:.5, width:def.width, height:def.height, sill:def.sill, depth:hostDepth, type:normalizeOpeningType(type), swing:1 };
    opening.t = openingClampT(wall, opening.width, opening.t);
    appState.layout.openings.push(opening);
    appState.selectedOpeningId = opening.id;
    appState.selectedWallId = wall.id;
    appState.selectedRackLayoutId = '';
    return opening;
  }
  function cleanupDetachedOpenings(){
    ensureLayoutDecorations();
    const ids = new Set((appState.layout.walls || []).map(w => w.id));
    appState.layout.openings = (appState.layout.openings || []).filter(o => ids.has(o.wallId));
    if(appState.selectedOpeningId && !findOpeningById(appState.selectedOpeningId)) appState.selectedOpeningId = '';
    if(appState.selectedWallId && !findWallById(appState.selectedWallId)) appState.selectedWallId = '';
  }

  function layoutSelectedSummary(){
    const opening = findOpeningById(appState.selectedOpeningId);
    const wall = findWallById(appState.selectedWallId);
    const zone = findZoneById(appState.selectedZoneId);
    const rack = findRackById(appState.selectedRackLayoutId);
    if(opening){
      const host = findWallById(opening.wallId);
      return { type:'opening', title:opening.type === 'window' ? 'Ventana' : 'Puerta / vano', subtitle:`${opening.id} · ${host?.id || 'sin pared'} · ${Math.round(Number(opening.width||90))} u` };
    }
    if(wall){
      return { type:'wall', title:wall.name || wall.id, subtitle:`${wall.id} · ${Math.round(wallLength(wall))} u · espesor ${Math.round(Number(wall.thickness||12))}` };
    }
    if(rack) return { type:'rack', title:rack.id, subtitle:`${rack.zoneId} · ${escapeHtml((rackModel(rack.modelId)||{}).name || rack.modelId || 'Rack')}` };
    if(zone) return { type:'zone', title:zone.name || zone.id, subtitle:`${zone.id} · ${(appState.layout.racks||[]).filter(r=>r.zoneId===zone.id).length} racks` };
    return { type:'none', title:'Sin selección', subtitle:'Selecciona una zona, rack, pared o vano' };
  }

  function formatUnitNumber(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }

  function setRectZoneBounds(zone, updates={}){
    if(!zone || !Array.isArray(zone.pts) || zone.pts.length < 3) return;
    const b = zoneBounds(zone);
    const nextX = Number.isFinite(Number(updates.x)) ? Number(updates.x) : b.minX;
    const nextY = Number.isFinite(Number(updates.y)) ? Number(updates.y) : b.minY;
    const nextW = Math.max(40, Number.isFinite(Number(updates.w)) ? Number(updates.w) : (b.maxX - b.minX));
    const nextH = Math.max(40, Number.isFinite(Number(updates.h)) ? Number(updates.h) : (b.maxY - b.minY));
    // Mantener forma rectangular si la zona tiene 4 vértices; si tiene más, escalar proporcionalmente.
    if(zone.pts.length === 4){
      zone.pts = [
        {x:snapGrid(nextX), y:snapGrid(nextY)},
        {x:snapGrid(nextX+nextW), y:snapGrid(nextY)},
        {x:snapGrid(nextX+nextW), y:snapGrid(nextY+nextH)},
        {x:snapGrid(nextX), y:snapGrid(nextY+nextH)}
      ];
    } else {
      const oldW = Math.max(1, b.maxX - b.minX), oldH = Math.max(1, b.maxY - b.minY);
      zone.pts = zone.pts.map(pt => ({
        x: snapGrid(nextX + ((pt.x - b.minX) / oldW) * nextW),
        y: snapGrid(nextY + ((pt.y - b.minY) / oldH) * nextH)
      }));
    }
    // Mantener racks contenidos después de redimensionar.
    (appState.layout.racks||[]).filter(r=>r.zoneId===zone.id).forEach(r => keepRackInsideZone(r, zone));
  }

  function addWarehouseTemplate(){
    const bounds = getLayoutContentBounds();
    const x = snapGrid(bounds.x + bounds.w + 100);
    const y = snapGrid(bounds.y + 60);
    const id = nextZoneId();
    const zone = { id, name:'Almacén', color:'#62d7a0', wallThickness:14, pts:[{x,y},{x:x+520,y},{x:x+520,y:y+360},{x,y:y+360}] };
    appState.layout.zones.push(zone);
    appState.selectedZoneId = zone.id;
    appState.selectedRackLayoutId = '';
    normalizeZoneAndRackIds();
    persistActiveLayout();
    renderLayoutEditor();
  }

  function addZoneWithRackTemplate(){
    const bounds = getLayoutContentBounds();
    const x = snapGrid(bounds.x + bounds.w + 90);
    const y = snapGrid(bounds.y + 80);
    const id = nextZoneId();
    const zone = { id, name:`Zona ${id}`, color:getNextZoneColor(getBranchColor(getActiveLayoutBranchIndex())), wallThickness:14, pts:[{x,y},{x:x+420,y},{x:x+420,y:y+280},{x,y:y+280}] };
    appState.layout.zones.push(zone);
    const fp = getRackFootprint(appState.selectedModelId, 0);
    const rack = { id:`${id}-E1`, zoneId:id, x:x+40, y:y+40, w:fp.w, h:fp.h, rot:0, modelId:appState.selectedModelId, front:'auto', baseHeight:0, rackHeight:(rackModel(appState.selectedModelId)?.height || 238) };
    appState.layout.racks.push(rack);
    appState.selectedZoneId = id;
    appState.selectedRackLayoutId = rack.id;
    normalizeZoneAndRackIds();
    persistActiveLayout();
    renderLayoutEditor();
  }

  function addRackRowTemplate(count=5){
    const zone = findZoneById(appState.selectedZoneId) || appState.layout.zones[0];
    if(!zone){ addZoneWithRackTemplate(); return; }
    const b = zoneBounds(zone);
    const fp = getRackFootprint(appState.selectedModelId, 0);
    const gap = 16;
    const totalW = (fp.w * count) + (gap * (count - 1));
    const startX = snapGrid(b.minX + Math.max(18, ((b.maxX - b.minX) - totalW) / 2));
    const y = snapGrid(b.minY + 38);
    for(let i=0;i<count;i++){
      const rack = { id:nextRackId(zone.id), zoneId:zone.id, x:startX + i*(fp.w+gap), y, w:fp.w, h:fp.h, rot:0, modelId:appState.selectedModelId, front:'auto', baseHeight:0, rackHeight:(rackModel(appState.selectedModelId)?.height || 238) };
      keepRackInsideZone(rack, zone);
      appState.layout.racks.push(rack);
      appState.selectedRackLayoutId = rack.id;
    }
    normalizeZoneAndRackIds();
    persistActiveLayout();
    renderLayoutEditor();
  }

  function distributeSelectedZoneRacks(){
    const zone = findZoneById(appState.selectedZoneId);
    if(!zone) return;
    const racks = (appState.layout.racks||[]).filter(r=>r.zoneId===zone.id).sort((a,b)=>a.x-b.x || a.y-b.y);
    if(racks.length < 2) return;
    const b = zoneBounds(zone);
    const margin = 24;
    const maxRackW = Math.max(...racks.map(r=>Number(r.w||0)), 1);
    const usableW = Math.max(1, (b.maxX-b.minX) - margin*2 - maxRackW);
    const step = racks.length === 1 ? 0 : usableW/(racks.length-1);
    racks.forEach((rack,i)=>{
      rack.x = snapGrid(b.minX + margin + step*i);
      rack.y = snapGrid(Math.max(b.minY+margin, Math.min(b.maxY - rack.h - margin, rack.y)));
      keepRackInsideZone(rack, zone);
    });
    persistActiveLayout();
    renderLayoutEditor();
  }

  function renderLayoutMiniMapMarkup(){
    const bounds = getLayoutContentBounds();
    const pad = 30;
    const vb = `${bounds.x-pad} ${bounds.y-pad} ${bounds.w+pad*2} ${bounds.h+pad*2}`;
    const zones = (appState.layout.zones||[]).map(zone => {
      const d = zone.pts.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ') + ' Z';
      const active = zone.id === appState.selectedZoneId;
      return `<path d="${escapeHtml(d)}" class="mini-zone ${active?'active':''}" fill="${escapeHtml(hexToRgba(zone.color||'#6ff0a8', active ? .32 : .16))}" stroke="${escapeHtml(zone.color||'#6ff0a8')}"/>`;
    }).join('');
    const walls = (appState.layout.walls||[]).map(w => `<line x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${w.id===appState.selectedWallId?'#ffd66f':'#d7e5f5'}" stroke-width="${Math.max(2, Number(w.thickness||12)/4)}" stroke-linecap="round" opacity=".9"/>`).join('');
    const openings = (appState.layout.openings||[]).map(o => { const wall=(appState.layout.walls||[]).find(w=>w.id===o.wallId); if(!wall) return ''; const seg=getOpeningSegment(o, wall); if(!seg) return ''; const d=wallDirection(wall); const n=getWallOpeningNormal(wall); const w=Math.max(28, Number(o.width||90)||90); const h=Math.max(48, Math.min(120, Number(o.visualHeight||80)||80)); const a={x:seg.center.x-d.x*h/2-n.x*w/2,y:seg.center.y-d.y*h/2-n.y*w/2}; const b={x:seg.center.x-d.x*h/2+n.x*w/2,y:seg.center.y-d.y*h/2+n.y*w/2}; const c={x:seg.center.x+d.x*h/2+n.x*w/2,y:seg.center.y+d.y*h/2+n.y*w/2}; const e={x:seg.center.x+d.x*h/2-n.x*w/2,y:seg.center.y+d.y*h/2-n.y*w/2}; return `<path d="M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${e.x} ${e.y} Z" fill="rgba(8,27,40,.92)" stroke="${o.id===appState.selectedOpeningId?'#7dffaf':'#5bf3d0'}" stroke-width="2"/>`; }).join('');
    const racks = (appState.layout.racks||[]).map(r => `<rect x="${r.x}" y="${r.y}" width="${Math.max(2,r.w)}" height="${Math.max(2,r.h)}" rx="4" class="mini-rack ${r.id===appState.selectedRackLayoutId?'active':''}"/>`).join('');
    return `<svg class="layout-mini-svg" viewBox="${vb}">${zones}${walls}${openings}${racks}</svg>`;
  }

  function renderLayerToggle(id, label, checked){
    return `<label class="layout-layer-toggle"><input type="checkbox" id="${id}" ${checked?'checked':''}><span>${label}</span></label>`;
  }

  function renderLayoutRightPanelMarkup(){
    ensureLayoutEditorState();
    const zone = findZoneById(appState.selectedZoneId);
    const rack = findRackById(appState.selectedRackLayoutId);
    const summary = layoutSelectedSummary();
    const zoneB = zone ? zoneBounds(zone) : null;
    const model = rack ? rackModel(rack.modelId) : null;
    const fp = rack ? getRackFootprint(rack.modelId, rack.rot || 0) : null;
    const modelOptions = appState.models.map(m=>`<option value="${escapeHtml(m.id)}" ${rack?.modelId===m.id?'selected':''}>${escapeHtml(m.name)}</option>`).join('');
    return `
      <div class="layout-right-head">
        <div><b>Propiedades</b><small>${escapeHtml(summary.subtitle)}</small></div>
        <span class="layout-type-pill">${summary.type === 'rack' ? 'Rack' : summary.type === 'zone' ? 'Zona' : summary.type === 'wall' ? 'Pared' : summary.type === 'opening' ? 'Vano' : 'Plano'}</span>
      </div>
      <div class="layout-right-scroll">
        <section class="layout-prop-card selected-summary">
          <div class="layout-prop-title">Selección activa</div>
          <div class="layout-selected-title">${escapeHtml(summary.title)}</div>
          <div class="tiny muted">Modo actual: ${escapeHtml(appState.editor.mode || 'select')}</div>
        </section>
        <section class="layout-prop-card">
          <div class="layout-prop-title">Capas</div>
          <div class="layout-layer-grid">
            ${renderLayerToggle('lyGrid','Grilla', appState.editor.showGrid !== false)}
            ${renderLayerToggle('lyZones','Zonas', appState.editor.showZones !== false)}
            ${renderLayerToggle('lyWalls','Paredes', appState.editor.wallsVisible !== false)}
            ${renderLayerToggle('lyOpenings','Aberturas', appState.editor.openingsVisible !== false)}
            ${renderLayerToggle('lyRacks','Racks', appState.editor.racksVisible !== false)}
            ${renderLayerToggle('lyLabels','Etiquetas', appState.editor.showLabels !== false)}
            ${renderLayerToggle('lyDims','Cotas', !!appState.editor.showDims)}
            ${renderLayerToggle('lyMini','Mini mapa', appState.editor.showMiniMap !== false)}
          </div>
        </section>
        <section class="layout-prop-card">
          <div class="layout-prop-title">Snap y precisión</div>
          <div class="layout-prop-grid two">
            <label>Snap<input id="rpSnapEnabled" type="checkbox" ${isSnapEnabled()?'checked':''}></label>
            <label>Tamaño snap<input id="rpSnapSize" type="number" min="1" max="80" step="1" value="${formatUnitNumber(getSnapSize())}"></label>
            <label>Tamaño letra cotas<input id="rpDimFontSize" type="number" min="14" max="72" step="1" value="${formatUnitNumber(getDimFontSize())}"></label>
            <label>Estado<input value="${isSnapEnabled() ? 'Activo' : 'Desactivado'}" disabled></label>
          </div>
          <div class="tiny muted" style="margin-top:8px">Menor número = más precisión. Recomendado: 2, 5 o 10 unidades.</div>
        </section>
        <section class="layout-prop-card">
          <div class="layout-prop-title">Plantillas rápidas</div>
          <div class="layout-template-grid">
            <button class="seg-btn" id="tplZoneRack">Zona + rack</button>
            <button class="seg-btn" id="tplWarehouse">Almacén</button>
            <button class="seg-btn" id="tplRackRow">Fila de racks</button>
            <button class="seg-btn" id="tplDistribute">Distribuir racks</button>
          </div>
        </section>
        <section class="layout-prop-card">
          <div class="layout-prop-title">Plano de fondo</div>
          <input type="file" id="layoutBgInput" accept="image/*" style="display:none">
          <div class="layout-template-grid">
            <button class="seg-btn" id="btnLayoutBgUpload">Subir imagen</button>
            <button class="seg-btn" id="btnLayoutBgClear" ${appState.layout?.meta?.backgroundImage ? '' : 'disabled'}>Quitar fondo</button>
          </div>
          <div class="tiny muted" style="margin-top:8px">Úsalo para calcar encima de un plano real. Queda bloqueado detrás de zonas y racks.</div>
        </section>
        ${zone ? `<section class="layout-prop-card">
          <div class="layout-prop-title">Zona</div>
          <div class="layout-prop-grid two">
            <label>Nombre<input id="rpZoneName" value="${escapeHtml(zone.name||'')}"></label>
            <label>Código<input id="rpZoneCode" value="${escapeHtml(zone.id||'')}"></label>
            <label>X<input id="rpZoneX" type="number" value="${formatUnitNumber(zoneB.minX)}"></label>
            <label>Y<input id="rpZoneY" type="number" value="${formatUnitNumber(zoneB.minY)}"></label>
            <label>Ancho<input id="rpZoneW" type="number" min="40" value="${formatUnitNumber(zoneB.maxX-zoneB.minX)}"></label>
            <label>Alto<input id="rpZoneH" type="number" min="40" value="${formatUnitNumber(zoneB.maxY-zoneB.minY)}"></label>
            <label>Color<input id="rpZoneColor" type="color" value="${escapeHtml(zone.color||'#6ff0a8')}"></label>
            <label>Escala cm/u<input id="rpScaleCm" type="number" min="0.1" step="0.1" value="${getScaleCmPerUnit()}"></label>
            <label>Rotación zona<input id="rpZoneRot" type="number" step="1" value="${Math.round(getZoneRotationDegrees(zone))}"></label>
            <label>Contenido<input value="${(appState.layout.racks||[]).filter(r => r.zoneId === zone.id).length} racks vinculados" disabled></label>
          </div>
          <div class="layout-template-grid zone-rotate-grid" style="margin-top:10px"><button class="seg-btn" id="rpZoneMinus15">Girar -15°</button><button class="seg-btn" id="rpZone15">Girar 15°</button><button class="seg-btn" id="rpZone45">Girar 45°</button><button class="seg-btn" id="rpZone90">Girar 90°</button><button class="seg-btn" id="rpDuplicateZone">Duplicar zona</button><button class="seg-btn" id="rpLockZones">${appState.editor.zonesLocked?'Desbloquear zonas':'Bloquear zonas'}</button><button class="seg-btn" id="rpAllEdgesWalls">Todas aristas → pared</button><button class="seg-btn" id="rpClearEdgesWalls">Quitar paredes zona</button></div>
        </section>` : ''}
        ${rack ? `<section class="layout-prop-card">
          <div class="layout-prop-title">Rack</div>
          <div class="layout-prop-grid two">
            <label>ID<input value="${escapeHtml(rack.id)}" disabled></label>
            <label>Zona<input value="${escapeHtml(rack.zoneId)}" disabled></label>
            <label>Modelo<select id="rpRackModel">${modelOptions}</select></label>
            <label>Rotación<input id="rpRackRot" type="number" step="1" value="${Math.round(Number(rack.rot||0))}"></label>
            <label>X<input id="rpRackX" type="number" value="${formatUnitNumber(rack.x)}"></label>
            <label>Y<input id="rpRackY" type="number" value="${formatUnitNumber(rack.y)}"></label>
            <label>Huella<input value="${formatUnitNumber(fp?.w||rack.w)} × ${formatUnitNumber(fp?.h||rack.h)}" disabled></label>
            <label>Altura<input id="rpRackHeight" type="number" min="60" step="10" value="${Math.round(Number(rack.rackHeight || model?.height || 238))}"></label>
          </div>
          <div class="layout-template-grid" style="margin-top:10px"><button class="seg-btn" id="rpDuplicateRack">Duplicar rack</button><button class="seg-btn" id="rpRack45">Girar 45°</button><button class="seg-btn" id="rpRack90">Girar 90°</button><button class="seg-btn" id="rpAddAbove">Agregar encima</button></div>
        </section>` : ''}
        ${findWallById(appState.selectedWallId) ? `<section class="layout-prop-card">
          <div class="layout-prop-title">Pared</div>
          <div class="layout-prop-grid two">
            <label>ID<input value="${escapeHtml(findWallById(appState.selectedWallId).id)}" disabled></label>
            <label>Nombre<input id="rpWallName" value="${escapeHtml(findWallById(appState.selectedWallId).name||'Pared')}"></label>
            <label>Espesor<input id="rpWallThickness" type="number" min="4" max="80" step="1" value="${formatUnitNumber(findWallById(appState.selectedWallId).thickness||12)}"></label>
            <label>Largo<input value="${formatUnitNumber(wallLength(findWallById(appState.selectedWallId)))}" disabled></label>
            ${findWallById(appState.selectedWallId).autoZoneEdge ? `<label>Lado<select id="rpWallSide"><option value="1" ${getWallSideSign(findWallById(appState.selectedWallId).side)===1?'selected':''}>Fuera de zona</option><option value="-1" ${getWallSideSign(findWallById(appState.selectedWallId).side)===-1?'selected':''}>Dentro de zona</option></select></label>` : `<label>Lado<input value="Manual" disabled></label>`}
          </div>
          <div class="layout-template-grid" style="margin-top:10px">
            ${findWallById(appState.selectedWallId).autoZoneEdge ? `<button class="seg-btn" id="rpWallFlip">Invertir muro</button>` : ''}
            <button class="seg-btn" id="rpWallAddDoor">Agregar puerta</button>
            <button class="seg-btn" id="rpWallAddWindow">Agregar ventana</button>
          </div>
          <div class="tiny muted" style="margin-top:8px">La pared puede ir por fuera o por dentro de la zona. Los vanos se recortan también en 3D.</div>
        </section>` : ''}
        ${findOpeningById(appState.selectedOpeningId) ? `<section class="layout-prop-card opening-editor-card">
          <div class="layout-prop-title">Vano seleccionado</div>
          ${(() => { const op=findOpeningById(appState.selectedOpeningId); const wall=findWallById(op?.wallId); const info=getOpeningPositionInfo(op, wall); const type=normalizeOpeningType(op.type); return `<div class="tiny muted" style="margin-bottom:10px">Arrastra el vano sobre el muro o ajusta su posición exacta. ${wall ? `Pared ${escapeHtml(wall.id)}` : ''}</div>
          <div class="layout-prop-grid two">
            <label>ID<input value="${escapeHtml(op.id)}" disabled></label>
            <label>Tipo<select id="rpOpeningType"><option value="door" ${type==='door'?'selected':''}>Puerta</option><option value="window" ${type==='window'?'selected':''}>Ventana</option><option value="free" ${type==='free'?'selected':''}>Vano libre</option><option value="gate" ${type==='gate'?'selected':''}>Portón</option></select></label>
            <label>Ancho<input id="rpOpeningWidth" type="number" min="40" max="360" step="5" value="${formatUnitNumber(op.width||90)}"></label>
            <label>Alto<input id="rpOpeningHeight" type="number" min="40" max="320" step="5" value="${formatUnitNumber(op.height || openingDefaultForType(type).height)}"></label>
            <label>Alféizar<input id="rpOpeningSill" type="number" min="0" max="260" step="5" value="${formatUnitNumber(op.sill || 0)}"></label>
            <label>Profundidad<input id="rpOpeningDepth" type="number" min="4" max="120" step="1" value="${formatUnitNumber(op.depth || wall?.thickness || 14)}"></label>
            <label>Posición %<input id="rpOpeningT" type="number" min="1" max="99" step="1" value="${Math.round((op.t || .5)*100)}"></label>
            <label>Desde inicio<input id="rpOpeningLeft" type="number" min="0" step="5" value="${info ? formatUnitNumber(info.left) : 0}"></label>
            <label>Hasta final<input value="${info ? formatUnitNumber(info.right) : 0}" disabled></label>
            <label>Muro<input value="${wall ? formatUnitNumber(wall.thickness || 14) : 14}" disabled></label>
          </div>
          <div class="opening-position-control">
            <div class="opening-position-line"><span style="left:${Math.max(1,Math.min(99,Math.round((op.t||.5)*100)))}%"></span></div>
            <input id="rpOpeningSlider" type="range" min="1" max="99" step="1" value="${Math.round((op.t || .5)*100)}" style="width:100%;margin-top:10px">
          </div>
          <div class="layout-template-grid" style="margin-top:10px"><button class="seg-btn" id="rpOpening25">25%</button><button class="seg-btn" id="rpOpeningCenter">50%</button><button class="seg-btn" id="rpOpening75">75%</button><button class="seg-btn" id="rpOpeningNudgeLeft">◀ 0.25 m</button><button class="seg-btn" id="rpOpeningNudgeRight">0.25 m ▶</button><button class="seg-btn" id="rpOpeningDuplicate">Duplicar</button><button class="seg-btn" id="rpOpeningFlip">Invertir apertura</button><button class="seg-btn" id="rpOpeningDelete">Eliminar</button></div>
          <div class="tiny muted" style="margin-top:8px">Tip: arrastra el vano a lo largo del muro. La abertura queda embebida y el 3D se recorta como hueco real.</div>` })()}
        </section>` : ''}
        ${appState.editor.showMiniMap !== false ? `<section class="layout-prop-card"><div class="layout-prop-title">Mini mapa</div>${renderLayoutMiniMapMarkup()}</section>` : ''}
      </div>`;
  }

  function bindLayoutRightPanel(){
    const rightScroller = document.querySelector('#layoutRightPanel .layout-right-scroll');
    if(rightScroller){
      rightScroller.scrollTop = appState.editor?.rightPanelScrollTop || 0;
      rightScroller.onscroll = () => { appState.editor.rightPanelScrollTop = rightScroller.scrollTop || 0; };
    }
    const bindCheck = (id, key, rerender=true) => {
      const el = document.getElementById(id);
      if(!el) return;
      el.onchange = e => { appState.editor[key] = !!e.target.checked; if(rerender) renderLayoutEditor(); else renderLayoutSvg(document.getElementById('layoutSvg')); };
    };
    bindCheck('lyGrid','showGrid');
    bindCheck('lyZones','showZones');
    bindCheck('lyWalls','wallsVisible');
    bindCheck('lyOpenings','openingsVisible');
    bindCheck('lyRacks','racksVisible');
    bindCheck('lyLabels','showLabels');
    bindCheck('lyDims','showDims');
    bindCheck('lyMini','showMiniMap');
    if($('#rpSnapEnabled')) $('#rpSnapEnabled').onchange = e => { appState.editor.snapEnabled = !!e.target.checked; clearRackSnapPreview(); persistActiveLayout(); renderLayoutEditor(); };
    const updateSnapSize = value => { appState.editor.snapSize = Math.max(1, Math.min(80, Number(value || DEFAULT_GRID_SIZE) || DEFAULT_GRID_SIZE)); appState.editor.snapPrecisionMigrated = true; persistActiveLayout(); renderLayoutEditor(); };
    const updateDimFont = value => { appState.editor.dimFontSize = Math.max(14, Math.min(72, Number(value || DEFAULT_DIM_FONT_SIZE) || DEFAULT_DIM_FONT_SIZE)); appState.editor.dimFontMigrated = true; persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpSnapSize')) $('#rpSnapSize').onchange = e => updateSnapSize(e.target.value);
    if($('#rpDimFontSize')) $('#rpDimFontSize').onchange = e => updateDimFont(e.target.value);
    if($('#layoutSnapEnabled')) $('#layoutSnapEnabled').onchange = e => { appState.editor.snapEnabled = !!e.target.checked; clearRackSnapPreview(); persistActiveLayout(); renderLayoutEditor(); };
    if($('#layoutSnapSize')) $('#layoutSnapSize').onchange = e => updateSnapSize(e.target.value);
    if($('#layoutDimFontSize')) $('#layoutDimFontSize').onchange = e => updateDimFont(e.target.value);
    const zone = findZoneById(appState.selectedZoneId);
    const rack = findRackById(appState.selectedRackLayoutId);
    const applyZoneGeometry = () => {
      if(!zone) return;
      setRectZoneBounds(zone, { x:$('#rpZoneX')?.value, y:$('#rpZoneY')?.value, w:$('#rpZoneW')?.value, h:$('#rpZoneH')?.value });
      persistActiveLayout(); renderLayoutEditor();
    };
    if($('#rpZoneName')) $('#rpZoneName').onchange = e => { zone.name = e.target.value; persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpZoneCode')) $('#rpZoneCode').onchange = e => { renameZoneId(zone.id, e.target.value); renderLayoutEditor(); };
    ['rpZoneX','rpZoneY','rpZoneW','rpZoneH'].forEach(id=>{ const el=$('#'+id); if(el) el.onchange = applyZoneGeometry; });
    if($('#rpZoneColor')) $('#rpZoneColor').oninput = e => { zone.color=e.target.value; persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpScaleCm')) $('#rpScaleCm').onchange = e => { ensureLayoutMeta(); appState.layout.meta.scaleCmPerUnit = Math.max(0.1, Number(e.target.value||1)||1); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpZoneRot')) $('#rpZoneRot').onchange = e => { if(zone) setZoneRotation(zone.id, Number(e.target.value || 0) || 0); };
    if($('#rpZoneMinus15')) $('#rpZoneMinus15').onclick = () => { if(zone) rotateZoneWithContents(zone.id, -15); };
    if($('#rpZone15')) $('#rpZone15').onclick = () => { if(zone) rotateZoneWithContents(zone.id, 15); };
    if($('#rpZone45')) $('#rpZone45').onclick = () => { if(zone) rotateZoneWithContents(zone.id, 45); };
    if($('#rpZone90')) $('#rpZone90').onclick = () => { if(zone) rotateZoneWithContents(zone.id, 90); };
    if($('#rpDuplicateZone')) $('#rpDuplicateZone').onclick = () => duplicateSelectedZone();
    if($('#rpLockZones')) $('#rpLockZones').onclick = () => { appState.editor.zonesLocked = !appState.editor.zonesLocked; persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpAllEdgesWalls')) $('#rpAllEdgesWalls').onclick = () => {
      if(!zone) return;
      (zone.pts || []).forEach((_, idx) => setZoneEdgeWall(zone, idx, { thickness:getZoneWallThickness(zone), height:Number(appState.layout?.meta?.defaultWallHeight || 290) || 290 }));
      syncZonePerimeterWalls(); persistActiveLayout(); renderLayoutEditor();
    };
    if($('#rpClearEdgesWalls')) $('#rpClearEdgesWalls').onclick = () => {
      if(!zone) return;
      zone.edgeWalls = {}; syncZonePerimeterWalls(); cleanupDetachedOpenings(); persistActiveLayout(); renderLayoutEditor();
    };

    const applyRackPosition = () => {
      if(!rack) return;
      rack.x = snapGrid(Number($('#rpRackX')?.value || rack.x) || 0);
      rack.y = snapGrid(Number($('#rpRackY')?.value || rack.y) || 0);
      const host = findZoneById(rack.zoneId) || nearestZoneForPoint({x:rack.x+rack.w/2,y:rack.y+rack.h/2});
      if(host) keepRackSnapped(rack, host);
      persistActiveLayout(); renderLayoutEditor();
    };
    if($('#rpRackModel')) $('#rpRackModel').onchange = e => { if(!rack) return; rack.modelId=e.target.value; syncRackFootprint(rack,true); const host=findZoneById(rack.zoneId); if(host) keepRackSnapped(rack, host); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpRackRot')) $('#rpRackRot').onchange = e => { if(!rack) return; applyRackRotation(rack, Number(e.target.value||0)||0); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpRackX')) $('#rpRackX').onchange = applyRackPosition;
    if($('#rpRackY')) $('#rpRackY').onchange = applyRackPosition;
    if($('#rpRackHeight')) $('#rpRackHeight').onchange = e => { if(!rack) return; rack.rackHeight = Math.max(60, Number(e.target.value||60)||60); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpDuplicateRack')) $('#rpDuplicateRack').onclick = () => duplicateSelectedRack();
    if($('#rpRack45')) $('#rpRack45').onclick = () => { if(!rack) return; applyRackRotation(rack, Number(rack.rot||0)+45); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpRack90')) $('#rpRack90').onclick = () => { if(!rack) return; applyRackRotation(rack, Number(rack.rot||0)+90); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpAddAbove')) $('#rpAddAbove').onclick = () => { if(!rack) return; duplicateRackLayout(rack.id); };

    const selectedWall = findWallById(appState.selectedWallId);
    const selectedOpening = findOpeningById(appState.selectedOpeningId);
    if($('#rpWallName')) $('#rpWallName').onchange = e => { if(!selectedWall) return; selectedWall.name = e.target.value || 'Pared'; persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpWallThickness')) $('#rpWallThickness').onchange = e => {
      if(!selectedWall) return;
      const nextThickness = Math.max(8, Math.min(80, Number(e.target.value || 14) || 14));
      selectedWall.thickness = nextThickness;
      if(selectedWall.autoZoneEdge){
        const zone = findZoneById(selectedWall.zoneId);
        if(zone) setZoneEdgeWall(zone, Number(selectedWall.edgeIndex || 0) || 0, { thickness:nextThickness });
      }
      syncZonePerimeterWalls();
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#rpWallSide')) $('#rpWallSide').onchange = e => {
      if(!selectedWall || !selectedWall.autoZoneEdge) return;
      const nextSide = getWallSideSign(Number(e.target.value || 1));
      selectedWall.side = nextSide;
      const zone = findZoneById(selectedWall.zoneId);
      if(zone) setZoneEdgeWall(zone, Number(selectedWall.edgeIndex || 0) || 0, { side:nextSide });
      syncZonePerimeterWalls();
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#rpWallFlip')) $('#rpWallFlip').onclick = () => {
      if(!selectedWall || !selectedWall.autoZoneEdge) return;
      const nextSide = getWallSideSign(selectedWall.side) * -1;
      selectedWall.side = nextSide;
      const zone = findZoneById(selectedWall.zoneId);
      if(zone) setZoneEdgeWall(zone, Number(selectedWall.edgeIndex || 0) || 0, { side:nextSide });
      syncZonePerimeterWalls();
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#rpWallAddDoor')) $('#rpWallAddDoor').onclick = () => { if(!selectedWall) return; createOpeningOnWall(selectedWall.id, 'door'); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpWallAddWindow')) $('#rpWallAddWindow').onclick = () => { if(!selectedWall) return; createOpeningOnWall(selectedWall.id, 'window'); persistActiveLayout(); renderLayoutEditor(); };
    const persistOpeningUpdate = () => { if(!selectedOpening) return; const host=findWallById(selectedOpening.wallId); if(host) selectedOpening.t = openingClampT(host, selectedOpening.width, selectedOpening.t); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpOpeningType')) $('#rpOpeningType').onchange = e => { if(!selectedOpening) return; const nextType=normalizeOpeningType(e.target.value); selectedOpening.type = nextType; const def=openingDefaultForType(nextType); const host=findWallById(selectedOpening.wallId); if(!Number(selectedOpening.width) || selectedOpening.width < def.width*.65) selectedOpening.width = def.width; selectedOpening.height = def.height; selectedOpening.sill = def.sill; selectedOpening.depth = Math.max(4, Math.min(120, Number(selectedOpening.depth || host?.thickness || 14) || 14)); persistOpeningUpdate(); };
    if($('#rpOpeningWidth')) {
      const commitOpeningWidth = e => {
        if(!selectedOpening) return;
        selectedOpening.width = Math.max(40, Math.min(360, Number(e.target.value || selectedOpening.width || 90) || 90));
        persistOpeningUpdate();
      };
      $('#rpOpeningWidth').onchange = commitOpeningWidth;
      $('#rpOpeningWidth').onblur = commitOpeningWidth;
    }
    if($('#rpOpeningHeight')) $('#rpOpeningHeight').onchange = e => { if(!selectedOpening) return; selectedOpening.height = Math.max(40, Math.min(320, Number(e.target.value || 210) || 210)); persistOpeningUpdate(); };
    if($('#rpOpeningSill')) $('#rpOpeningSill').onchange = e => { if(!selectedOpening) return; selectedOpening.sill = (normalizeOpeningType(selectedOpening.type) === 'window') ? Math.max(0, Math.min(260, Number(e.target.value || 0) || 0)) : Math.max(0, Math.min(80, Number(e.target.value || 0) || 0)); persistOpeningUpdate(); };
    if($('#rpOpeningDepth')) $('#rpOpeningDepth').onchange = e => { if(!selectedOpening) return; const host=findWallById(selectedOpening.wallId); const maxDepth=Math.max(4, Math.min(120, Number(host?.thickness || 14) || 14)); selectedOpening.depth = Math.max(4, Math.min(maxDepth, Number(e.target.value || maxDepth) || maxDepth)); persistOpeningUpdate(); };
    const setOpeningPositionPct = value => { if(!selectedOpening) return; selectedOpening.t = Math.max(.01, Math.min(.99, (Number(value || 50) || 50) / 100)); persistOpeningUpdate(); };
    if($('#rpOpeningT')) $('#rpOpeningT').onchange = e => setOpeningPositionPct(e.target.value);
    if($('#rpOpeningSlider')) $('#rpOpeningSlider').oninput = e => { if($('#rpOpeningT')) $('#rpOpeningT').value = e.target.value; setOpeningPositionPct(e.target.value); };
    if($('#rpOpeningLeft')) $('#rpOpeningLeft').onchange = e => { if(!selectedOpening) return; const wall=findWallById(selectedOpening.wallId); if(!wall) return; const len=Math.max(1, wallLength(wall)); const width=Math.max(40, Number(selectedOpening.width||90)||90); const left=Math.max(0, Math.min(len-width, Number(e.target.value||0)||0)); selectedOpening.t = openingClampT(wall, width, (left + width/2) / len); persistOpeningUpdate(); };
    if($('#rpOpening25')) $('#rpOpening25').onclick = () => setOpeningPositionPct(25);
    if($('#rpOpeningCenter')) $('#rpOpeningCenter').onclick = () => setOpeningPositionPct(50);
    if($('#rpOpening75')) $('#rpOpening75').onclick = () => setOpeningPositionPct(75);
    const nudgeOpening = delta => { if(!selectedOpening) return; const wall=findWallById(selectedOpening.wallId); if(!wall) return; const len=Math.max(1, wallLength(wall)); const info=getOpeningPositionInfo(selectedOpening, wall); if(!info) return; selectedOpening.t = openingClampT(wall, info.width, (info.center + delta) / len); persistOpeningUpdate(); };
    if($('#rpOpeningNudgeLeft')) $('#rpOpeningNudgeLeft').onclick = () => nudgeOpening(-25);
    if($('#rpOpeningNudgeRight')) $('#rpOpeningNudgeRight').onclick = () => nudgeOpening(25);
    if($('#rpOpeningDuplicate')) $('#rpOpeningDuplicate').onclick = () => { if(!selectedOpening) return; duplicateOpening(selectedOpening); persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpOpeningFlip')) $('#rpOpeningFlip').onclick = () => { if(!selectedOpening) return; selectedOpening.swing = Number(selectedOpening.swing || 1) * -1; persistActiveLayout(); renderLayoutEditor(); };
    if($('#rpOpeningDelete')) $('#rpOpeningDelete').onclick = () => { if(!selectedOpening) return; appState.layout.openings = (appState.layout.openings || []).filter(o => o.id !== selectedOpening.id); appState.selectedOpeningId = ''; persistActiveLayout(); renderLayoutEditor(); };

    if($('#tplZoneRack')) $('#tplZoneRack').onclick = addZoneWithRackTemplate;
    if($('#tplWarehouse')) $('#tplWarehouse').onclick = addWarehouseTemplate;
    if($('#tplRackRow')) $('#tplRackRow').onclick = () => addRackRowTemplate(5);
    if($('#tplDistribute')) $('#tplDistribute').onclick = distributeSelectedZoneRacks;
    if($('#btnLayoutBgUpload')) $('#btnLayoutBgUpload').onclick = () => $('#layoutBgInput')?.click();
    if($('#layoutBgInput')) $('#layoutBgInput').onchange = e => {
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => { ensureLayoutMeta(); appState.layout.meta.backgroundImage = String(reader.result || ''); persistActiveLayout(); renderLayoutEditor(); };
      reader.readAsDataURL(file);
    };
    if($('#btnLayoutBgClear')) $('#btnLayoutBgClear').onclick = () => { ensureLayoutMeta(); delete appState.layout.meta.backgroundImage; persistActiveLayout(); renderLayoutEditor(); };
  }

  function renderLayoutEditor(){
    document.body.dataset.wmsLayoutVersion = 'v95-layout-fixes';
    const __layoutRightScrollBefore = document.querySelector('#layoutRightPanel .layout-right-scroll')?.scrollTop ?? appState.editor?.rightPanelScrollTop ?? 0;
    ensureLayoutEditorState();
    appState.editor.rightPanelScrollTop = __layoutRightScrollBefore;
    if(!(appState.history?.layout?.undoStack?.length)) recordHistorySnapshot('layout');
    ensureRackProps();
    contentTitle.textContent = 'Edición de Layout';
    appState.editor.view = 'ortho';
    const isIsoView = false;
    const selectedRack = findRackById(appState.selectedRackLayoutId);
    const selectedRackModel = selectedRack ? rackModel(selectedRack.modelId) : null;
    const selectedRackFootprint = selectedRack ? getRackFootprint(selectedRack.modelId, selectedRack.rot || 0) : null;
    contentSubtitle.textContent = 'Vista ortogonal editable · Modo CAD';
    detailTitle.textContent = 'Edición de layout';
    detailSubtitle.textContent = 'Opciones y propiedades integradas en el panel lateral.';
    setTags([
      { label:'↶ Undo', active: true, action:'history-undo-layout', extraClass:'history-chip' },
      { label:'↷ Redo', active: true, action:'history-redo-layout', extraClass:'history-chip' },
      { label:'Navegar', active: appState.editor.mode === 'navigate', action:'toggle-nav' },
      { label:`Snap ${isSnapEnabled() ? getSnapSize() : 'OFF'}`, active: isSnapEnabled(), action:'toggle-snap' },
      { label:'Cotas', active: !!appState.editor.showDims, action:'toggle-dims' },
      { label:'Sección', active: !!appState.editor.sectionVisible, action:'toggle-section' },
      { label:'Opción 4', active: true, action:'toggle-right-props' }
    ]);

    contentWrap.innerHTML = `
      <div class="stage layout-premium-render layout-cad-v80" style="position:relative;height:100%">
        <div class="layout-cad-shell-v80 ${appState.editor.rightPanelOpen === false ? 'right-collapsed' : ''}">
          <div class="layout-cad-localbar-v80">
            <button class="btn primary v80-zone-btn" id="btnZonePlus">+ Zona</button>
            <select id="layoutBranchSelect" class="seg-btn v80-branch-select">${(appState.admin.branches||[]).map((b,i)=>`<option value="${i}" ${i===getActiveLayoutBranchIndex()?'selected':''}>${escapeHtml(b.name||('Sucursal '+(i+1)))}</option>`).join('')}</select>
            <select class="seg-btn v80-unit-select" aria-label="Unidades"><option>m</option><option>cm</option></select>
            <button class="seg-btn v80-icon-btn" data-layout-tag-action="toggle-dims" title="Cotas">▦</button>
            <button class="seg-btn v80-icon-btn" data-layout-tag-action="toggle-snap" title="Snap">⌁</button>
            <button class="seg-btn v80-icon-btn" id="btnZoomFit" title="Ajustar vista">□</button>
            <button class="btn primary v90-save-layout-btn" id="btnSaveLayoutVisible" type="button">Guardar layout</button>
            <span class="v90-version-badge">v97 buttons fix</span>
          </div>
          <div class="layout-cad-workspace-v80">
            <main class="layout-main-stage v80-main-stage ${appState.editor.sectionVisible ? 'with-section' : ''}">
              <div class="layout-canvas-wrap v80-canvas-wrap">
                <div class="layout-canvas-card detail-stage v80-canvas-card">
                  <svg id="layoutSvg"></svg>
                  <div class="v80-tool-rail" aria-label="Herramientas de layout">
                    <button class="v80-tool-btn seg-btn ${appState.editor.mode==='zone'?'active':''}" id="btnZonePlusRail" data-tool-proxy="btnZonePlus"><span class="v80-tool-ico">□</span><b>Agregar<br>zona</b></button>
                    <button class="v80-tool-btn seg-btn ${appState.editor.mode==='rack'?'active':''}" data-emode="rack"><span class="v80-tool-ico">▤</span><b>Agregar<br>rack</b></button>
                    <button class="v80-tool-btn seg-btn" data-layout-tag-action="toggle-walls"><span class="v80-tool-ico">▱</span><b>Paredes</b></button>
                    <button class="v80-tool-btn seg-btn ${appState.editor.mode==='opening'?'active':''}" id="btnOpeningPlus"><span class="v80-tool-ico">▭</span><b>Vanos</b></button>
                    <button class="v80-tool-btn seg-btn" data-layout-tag-action="toggle-dims"><span class="v80-tool-ico">↔</span><b>Cotas</b></button>
                  </div>
                  ${appState.editor.showMiniMap !== false ? `<div class="v80-minimap-card"><div class="v80-minimap-title">Mini mapa</div>${renderLayoutMiniMapMarkup()}</div>` : ''}
                  <div class="v80-canvas-footer">
                    <span>X: 8.60 m</span><span>Y: 10.20 m</span>
                    <span>Rejilla: <b>${formatUnitNumber(getSnapSize() / Math.max(1, getSnapSize()) * 0.25)} m</b></span>
                    <button class="seg-btn" id="btnZoomOut">−</button><span class="zoom-chip" id="zoomLabel">100%</span><button class="seg-btn" id="btnZoomIn">+</button>
                  </div>
                  <button class="v90-floating-save-layout" id="btnSaveLayoutFloat" type="button">Guardar layout</button>
                  <div id="layoutStackMenu" class="layout-stack-overlay"></div>
                </div>
                <div id="layoutSectionWrap" class="v80-section-floating"></div>
              </div>
            </main>
            <aside id="layoutRightPanel" class="layout-right-panel v80-right-panel">${renderLayoutRightPanelMarkup()}</aside>
          </div>
          <div class="v80-hidden-actions" aria-hidden="true">
            <button class="seg-btn" id="btnDuplicateZone">Duplicar zona</button>
            <button class="seg-btn" id="btnVertexPlus">Agregar vértice</button>
            <button class="seg-btn" id="btnDuplicateRack">Duplicar rack</button>
            <button class="seg-btn" id="btnDeleteSelected">Eliminar selección</button>
            <button class="seg-btn" id="btnSaveLayoutTop">Guardar layout</button>
            <button class="seg-btn" id="btnSaveLayoutRemote">Guardar layout</button>
            <label><input type="checkbox" id="layoutSnapEnabled" ${isSnapEnabled()?'checked':''}></label>
            <input id="layoutSnapSize" value="${formatUnitNumber(getSnapSize())}">
            <input id="layoutDimFontSize" value="${formatUnitNumber(getDimFontSize())}">
          </div>
        </div>
      </div>`
    const svg = $('#layoutSvg');
    const currentBox = appState.editor.viewBox || { x:0, y:0, w:900, h:620 };
    if(!appState.editor.viewBoxInitialized){
      fitLayoutViewBox();
      appState.editor.viewBoxInitialized = true;
    }else if(!appState.editor.viewBoxCustomized && (currentBox.x===0 && currentBox.y===0 && currentBox.w===900 && currentBox.h===620)){
      fitLayoutViewBox();
    }
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    renderLayoutSvg(svg);
    renderLayoutSection();
    renderLayoutInspector();
    renderLayoutStackMenu();
    const layoutStageRoot = document.querySelector('.layout-cad-v80');
    if(layoutStageRoot) layoutStageRoot.addEventListener('pointerdown', evt => {
      if(evt.target && evt.target.closest('button, select, input, .seg-btn')) markLayoutManualInteraction();
    }, { capture:true });
    bindLayoutToolbar();
    document.querySelectorAll('[data-tool-proxy]').forEach(btn => {
      btn.onclick = () => { const target = document.getElementById(btn.getAttribute('data-tool-proxy')); if(target) target.click(); };
    });
    bindLayoutRightPanel();
    requestAnimationFrame(() => {
      const scroller = document.querySelector('#layoutRightPanel .layout-right-scroll');
      if(scroller) scroller.scrollTop = appState.editor?.rightPanelScrollTop || __layoutRightScrollBefore || 0;
    });
    bindLayoutAutoFit();
    const undoBtn = document.querySelector('[data-history-undo="layout"]'); if(undoBtn) undoBtn.onclick = () => undoHistory('layout');
    const redoBtn = document.querySelector('[data-history-redo="layout"]'); if(redoBtn) redoBtn.onclick = () => redoHistory('layout');
    updateUndoRedoUi();
    const zl = $('#zoomLabel'); if(zl){ const vb = appState.editor.viewBox || {w:900}; zl.textContent = `${Math.round((900 / vb.w) * 100)}%`; }
  }

  function renderLayoutStackMenu(){
    const mount = document.getElementById('layoutStackMenu');
    if(!mount) return;
    const state = appState.editor.stackMenu || { open:false };
    const rack = findRackById(state.rackId);
    const summary = rack ? rackStackSummary(rack) : { count:0, members:[] };
    if(!state.open || !rack || summary.count <= 1){
      mount.innerHTML = '';
      return;
    }
    const rows = summary.members.map(member => {
      const active = member.id === appState.selectedRackLayoutId;
      const model = rackModel(member.modelId);
      const topCm = Number(member.baseHeight||0) + Number(member.rackHeight || model.height || 238);
      return `<button type="button" class="stack-row ${active?'active':''}" data-stack-rack="${member.id}" style="width:100%;text-align:left;border:1px solid rgba(255,255,255,.08);background:${active?'rgba(86,210,255,.15)':'rgba(255,255,255,.03)'};color:#e8f1fb;border-radius:12px;padding:10px 12px;cursor:pointer;display:grid;gap:4px"><b>${escapeHtml(member.id)}</b><span class="tiny muted">N${getRackStackLevel(member)} · ${escapeHtml(model.name)} · ${model.levels||4} niveles · ${formatDistanceCm(topCm)}</span></button>`;
    }).join('');
    mount.innerHTML = `<div style="position:absolute;left:${Math.max(12,state.x)}px;top:${Math.max(58,state.y)}px;z-index:8;min-width:260px;max-width:320px;background:rgba(7,17,29,.98);border:1px solid rgba(255,255,255,.10);box-shadow:0 18px 40px rgba(0,0,0,.38);border-radius:16px;padding:12px;display:grid;gap:10px"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><div style="font-weight:800">Superposición de racks</div><div class="tiny muted">${summary.count} racks en la misma huella</div></div><button type="button" id="stackMenuCloseBtn" class="seg-btn" style="padding:8px 10px">Cerrar</button></div><div style="display:grid;gap:8px">${rows}</div></div>`;
    const closeBtn = document.getElementById('stackMenuCloseBtn');
    if(closeBtn) closeBtn.onclick = () => { closeStackMenu(); renderLayoutStackMenu(); };
    mount.querySelectorAll('[data-stack-rack]').forEach(btn => btn.onclick = () => {
      const rackId = btn.getAttribute('data-stack-rack');
      const target = findRackById(rackId);
      if(!target) return;
      appState.selectedRackLayoutId = target.id;
      appState.selectedZoneId = target.zoneId;
      renderLayoutEditor();
    });
  }



  function findZoneBadgePlacement(zone, badgeW, badgeH){
    const zb = zoneBoundsOf(zone);
    const racks = (appState.layout.racks||[]).filter(r => r.zoneId === zone.id);
    const candidates = [
      {x:zb.minX+12,y:zb.minY+12},
      {x:zb.maxX-badgeW-12,y:zb.minY+12},
      {x:zb.minX+12,y:zb.maxY-badgeH-12},
      {x:zb.maxX-badgeW-12,y:zb.maxY-badgeH-12}
    ];
    const overlap=(c)=>racks.some(r=>{
      const fp=getRackFootprint(r.modelId, r.rot||0); const w=fp.w||r.w||40, h=fp.h||r.h||28;
      const cx=(r.x||0)+w/2, cy=(r.y||0)+h/2; const rx=cx-w/2-10, ry=cy-h/2-10, rw=w+20, rh=h+20;
      return !(c.x+badgeW < rx || c.x > rx+rw || c.y+badgeH < ry || c.y > ry+rh);
    });
    return candidates.find(c=>!overlap(c)) || candidates[0];
  }


  function getLayoutContentBounds(){
    ensureLayoutDecorations();
    const zones = appState.layout?.zones || [];
    const racks = appState.layout?.racks || [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    zones.forEach(zone => {
      const zb = zoneBounds(zone);
      minX = Math.min(minX, zb.minX);
      minY = Math.min(minY, zb.minY);
      maxX = Math.max(maxX, zb.maxX);
      maxY = Math.max(maxY, zb.maxY);
    });
    racks.forEach(r => {
      const x = Number(r.x || 0), y = Number(r.y || 0);
      const w = Math.max(1, Number(r.w || 0)), h = Math.max(1, Number(r.h || 0));
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });
    (appState.layout?.walls || []).forEach(w => {
      const t = Math.max(4, Number(w.thickness || 12) || 12);
      minX = Math.min(minX, Number(w.x1 || 0) - t, Number(w.x2 || 0) - t);
      minY = Math.min(minY, Number(w.y1 || 0) - t, Number(w.y2 || 0) - t);
      maxX = Math.max(maxX, Number(w.x1 || 0) + t, Number(w.x2 || 0) + t);
      maxY = Math.max(maxY, Number(w.y1 || 0) + t, Number(w.y2 || 0) + t);
    });
    if(!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return { x:0, y:0, w:900, h:620 };
    return { x:minX, y:minY, w:Math.max(240, maxX - minX), h:Math.max(180, maxY - minY) };
  }

  function fitLayoutViewBox(){
    const bounds = getLayoutContentBounds();
    const svg = document.getElementById('layoutSvg');
    const width = Math.max(1, svg?.clientWidth || 0);
    const height = Math.max(1, svg?.clientHeight || 0);
    const viewportRatio = width && height ? width / height : 1.65;
    const padX = Math.max(52, bounds.w * 0.08);
    const padY = Math.max(46, bounds.h * 0.08);
    let box = {
      x: bounds.x - padX,
      y: bounds.y - padY,
      w: bounds.w + padX * 2,
      h: bounds.h + padY * 2
    };
    const targetRatio = viewportRatio > 0 ? viewportRatio : (box.w / box.h);
    const currentRatio = box.w / box.h;
    if(currentRatio < targetRatio){
      const targetW = box.h * targetRatio;
      box.x -= (targetW - box.w) / 2;
      box.w = targetW;
    } else if(currentRatio > targetRatio){
      const targetH = box.w / targetRatio;
      box.y -= (targetH - box.h) / 2;
      box.h = targetH;
    }
    appState.editor.viewBox = box;
    appState.editor.viewBoxCustomized = false;
    return box;
  }


  function cleanupLayoutAutoFit(){
    const cleanup = appState.editor?.layoutAutoFitCleanup;
    if(typeof cleanup === 'function'){
      try{ cleanup(); }catch(_err){}
    }
    if(appState.editor) appState.editor.layoutAutoFitCleanup = null;
  }

  function scheduleLayoutAutoFit(force=false){
    if(appState.editor?.dragging || appState.editor?.dragSelect?.active) return;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if(!force && appState.editor?.suppressAutoFitUntil && now < appState.editor.suppressAutoFitUntil) return;
    if(!force && appState.editor?.viewBoxCustomized && appState.editor?.lastZoomAt && (now - appState.editor.lastZoomAt) < 520) return;
    if(!force && appState.editor?.viewBoxInitialized) return;
    window.cancelAnimationFrame(appState.editor?.layoutAutoFitRaf || 0);
    const run = () => {
      if(appState.editor?.dragging || appState.editor?.dragSelect?.active) return;
      const svg = document.getElementById('layoutSvg');
      if(!svg) return;
      const nowRun = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      if(!force && appState.editor?.suppressAutoFitUntil && nowRun < appState.editor.suppressAutoFitUntil) return;
      if(!force && appState.editor?.viewBoxCustomized && appState.editor?.lastZoomAt && (nowRun - appState.editor.lastZoomAt) < 520) return;
      if(!force && appState.editor?.viewBoxInitialized) return;
      if(force || !appState.editor.viewBoxCustomized) fitLayoutViewBox();
      if(force) appState.editor.viewBoxInitialized = true;
      renderLayoutSvg(svg);
      renderLayoutSection();
    };
    if(!appState.editor) return run();
    appState.editor.layoutAutoFitRaf = window.requestAnimationFrame(run);
  }

  function bindLayoutAutoFit(){
    cleanupLayoutAutoFit();
    const shell = document.querySelector('.layout-main-stage');
    const svg = document.getElementById('layoutSvg');
    if(!shell || !svg || typeof ResizeObserver === 'undefined') return;
    let lastW = 0, lastH = 0;
    const ro = new ResizeObserver(entries => {
      const rect = entries && entries[0] ? entries[0].contentRect : shell.getBoundingClientRect();
      const w = Math.round(rect?.width || 0);
      const h = Math.round(rect?.height || 0);
      if(!w || !h) return;
      if(Math.abs(w - lastW) < 6 && Math.abs(h - lastH) < 6) return;
      lastW = w; lastH = h;
      scheduleLayoutAutoFit(false);
    });
    ro.observe(shell);
    window.addEventListener('resize', scheduleLayoutAutoFit, { passive:true });
    appState.editor.layoutAutoFitCleanup = () => {
      try{ ro.disconnect(); }catch(_err){}
      window.removeEventListener('resize', scheduleLayoutAutoFit, { passive:true });
      window.cancelAnimationFrame(appState.editor?.layoutAutoFitRaf || 0);
      if(appState.editor) appState.editor.layoutAutoFitRaf = null;
    };
  }

  function getLayoutRenderViewBox(svg, vb){
    const width = Math.max(1, svg?.clientWidth || 0);
    const height = Math.max(1, svg?.clientHeight || 0);
    if(!width || !height) return vb;
    const viewportRatio = width / height;
    const viewRatio = vb.w / vb.h;
    if(Math.abs(viewportRatio - viewRatio) < 0.01) return vb;
    if(viewportRatio > viewRatio){
      const targetW = vb.h * viewportRatio;
      return { x: vb.x - (targetW - vb.w) / 2, y: vb.y, w: targetW, h: vb.h };
    }
    const targetH = vb.w / viewportRatio;
    return { x: vb.x, y: vb.y - (targetH - vb.h) / 2, w: vb.w, h: targetH };
  }

  function renderLayoutSvg(svg){
    svg = svg || document.getElementById('layoutSvg') || document.getElementById('layout-svg');
    if(!svg) return;
    appState.editor.view = 'ortho';
    svg.innerHTML = '';
    svg.style.setProperty('--layout-dim-font-size', `${getDimFontSize()}px`);
    const vb = appState.editor.viewBox || { x:0, y:0, w:900, h:620 };
    const renderVb = getLayoutRenderViewBox(svg, vb);
    svg.setAttribute('viewBox', `${renderVb.x} ${renderVb.y} ${renderVb.w} ${renderVb.h}`);
    const panSurface = svgEl('rect',{x:vb.x-1400,y:vb.y-1400,width:vb.w+2800,height:vb.h+2800,fill:'transparent',class:'layout-pan-surface',style:'cursor:grab'});
    svg.appendChild(panSurface);
    panSurface.addEventListener('pointerdown', evt => {
      const shouldPan = appState.editor.mode === 'navigate' || evt.shiftKey || evt.button === 1;
      if(!shouldPan) return;
      evt.preventDefault();
      evt.stopPropagation();
      appState.editor.dragging = { type:'pan-layout', startClient:{ x:evt.clientX, y:evt.clientY }, originalViewBox: clone(appState.editor.viewBox || { x:0, y:0, w:900, h:620 }) };
      appState.editor.viewBoxCustomized = true;
      svg.setPointerCapture?.(evt.pointerId);
    });
    const contentBounds = getLayoutContentBounds();
    const gridStep = Math.max(4, getSnapSize() * 2);
    const gridPad = 2400;
    const gridMinX = Math.floor(Math.min(renderVb.x, contentBounds.x) - gridPad);
    const gridMaxX = Math.ceil(Math.max(renderVb.x + renderVb.w, contentBounds.x + contentBounds.w) + gridPad);
    const gridMinY = Math.floor(Math.min(renderVb.y, contentBounds.y) - gridPad);
    const gridMaxY = Math.ceil(Math.max(renderVb.y + renderVb.h, contentBounds.y + contentBounds.h) + gridPad);
    if(appState.editor.showGrid !== false){
      const grid = svgEl('g',{class:'ortho-grid'});
      for(let x=Math.floor(gridMinX / gridStep) * gridStep; x<=gridMaxX; x+=gridStep) grid.appendChild(svgEl('line',{x1:x,y1:gridMinY,x2:x,y2:gridMaxY}));
      for(let y=Math.floor(gridMinY / gridStep) * gridStep; y<=gridMaxY; y+=gridStep) grid.appendChild(svgEl('line',{x1:gridMinX,y1:y,x2:gridMaxX,y2:y}));
      svg.appendChild(grid);
    }
    const bgImage = appState.layout?.meta?.backgroundImage;
    if(bgImage){
      const b = getLayoutContentBounds();
      const bg = svgEl('image',{href:bgImage,x:b.x,y:b.y,width:b.w,height:b.h,preserveAspectRatio:'xMidYMid meet',class:'layout-bg-image'});
      svg.appendChild(bg);
    }

    const edgeLayer = svgEl('g');
    const zoneLayer = svgEl('g');
    const wallLayer = svgEl('g');
    const openingLayer = svgEl('g');
    const guideLayer = svgEl('g');
    const rackLayer = svgEl('g');
    const measureLayer = svgEl('g');
    const vertexLayer = svgEl('g');
    if(appState.editor.showZones === false){ zoneLayer.setAttribute('style','display:none'); vertexLayer.setAttribute('style','display:none'); edgeLayer.setAttribute('style','display:none'); }
    if(appState.editor.wallsVisible === false) wallLayer.setAttribute('style','display:none');
    if(appState.editor.openingsVisible === false) openingLayer.setAttribute('style','display:none');
    svg.append(edgeLayer, zoneLayer, wallLayer, openingLayer, rackLayer, guideLayer, measureLayer, vertexLayer);


    const flipSectionDirection = (axis) => {
      const cut = getSectionCut(axis);
      cut.dir = cut.dir === -1 ? 1 : -1;
      renderLayoutEditor();
    };

    const drawSectionGuide = (zone, axis) => {
      const zb = zoneBounds(zone);
      const isY = axis === 'y';
      const color = isY ? '#ff5b5b' : '#58c5ff';
      const cut = clampSectionCut(zone, axis);
      const linePos = getSectionLinePosition(zone, axis);
      const extend = 38;
      const x1 = isY ? zb.minX - extend : linePos;
      const y1 = isY ? linePos : zb.minY - extend;
      const x2 = isY ? zb.maxX + extend : linePos;
      const y2 = isY ? linePos : zb.maxY + extend;
      const guide = svgEl('line',{ x1,y1,x2,y2, stroke:color, 'stroke-width':'2.5', 'stroke-dasharray':'10 8', opacity:'.98', style:isY ? 'cursor:ns-resize' : 'cursor:ew-resize' });
      guide.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'line'));
      guideLayer.appendChild(guide);
      const rangeLimit = getSectionRangeLimit(zone, axis);
      if(isY){
        const bandY1 = Math.min(linePos, rangeLimit), bandY2 = Math.max(linePos, rangeLimit);
        guideLayer.appendChild(svgEl('rect',{x:zb.minX,y:bandY1,width:Math.max(1,zb.maxX-zb.minX),height:Math.max(1,bandY2-bandY1),class:'section-range-fill'}));
        const rangeLine = svgEl('line',{x1:zb.minX-8,y1:rangeLimit,x2:zb.maxX+8,y2:rangeLimit,stroke:color,'stroke-width':'2.5','stroke-dasharray':'10 8',opacity:'.98',style:'cursor:ns-resize'});
        rangeLine.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rangeLine);
        const rHandleL = svgEl('circle',{cx:zb.minX-8, cy:rangeLimit, r:'6', class:'section-range-handle', fill:color, stroke:color});
        rHandleL.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rHandleL);
        const rHandleR = svgEl('circle',{cx:zb.maxX+8, cy:rangeLimit, r:'6', class:'section-range-handle', fill:color, stroke:color});
        rHandleR.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rHandleR);
        const rHandle = svgEl('circle',{cx:(zb.minX+zb.maxX)/2, cy:rangeLimit, r:'7', class:'section-range-handle', fill:color, stroke:color});
        rHandle.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rHandle);
        const rLabel = svgEl('text',{x:zb.maxX+18,y:rangeLimit-6,class:'section-range-label',fill:color}); rLabel.textContent='Límite Y'; guideLayer.appendChild(rLabel);
      } else {
        const bandX1 = Math.min(linePos, rangeLimit), bandX2 = Math.max(linePos, rangeLimit);
        guideLayer.appendChild(svgEl('rect',{x:bandX1,y:zb.minY,width:Math.max(1,bandX2-bandX1),height:Math.max(1,zb.maxY-zb.minY),class:'section-range-fill'}));
        const rangeLine = svgEl('line',{x1:rangeLimit,y1:zb.minY-8,x2:rangeLimit,y2:zb.maxY+8,stroke:color,'stroke-width':'2.5','stroke-dasharray':'10 8',opacity:'.98',style:'cursor:ew-resize'});
        rangeLine.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rangeLine);
        const rHandleT = svgEl('circle',{cx:rangeLimit, cy:zb.minY-8, r:'6', class:'section-range-handle', fill:color, stroke:color});
        rHandleT.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rHandleT);
        const rHandleB = svgEl('circle',{cx:rangeLimit, cy:zb.maxY+8, r:'6', class:'section-range-handle', fill:color, stroke:color});
        rHandleB.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rHandleB);
        const rHandle = svgEl('circle',{cx:rangeLimit, cy:(zb.minY+zb.maxY)/2, r:'7', class:'section-range-handle', fill:color, stroke:color});
        rHandle.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'range'));
        guideLayer.appendChild(rHandle);
        const rLabel = svgEl('text',{x:rangeLimit+10,y:zb.minY-14,class:'section-range-label',fill:color}); rLabel.textContent='Límite X'; guideLayer.appendChild(rLabel);
      }
      const label = svgEl('text',{ x:isY ? (zb.minX + zb.maxX)/2 : linePos + 18, y:isY ? linePos - 10 : (zb.minY + zb.maxY)/2, fill:color, 'font-size':'11', 'font-weight':'800', 'text-anchor':'middle', style:'paint-order:stroke;stroke:#05101c;stroke-width:4px;stroke-linejoin:round;pointer-events:none;' });
      label.textContent = isY ? 'Línea de corte Y' : 'Línea de corte X';
      guideLayer.appendChild(label);
      const dir = cut.dir === -1 ? -1 : 1;
      const mkArrow = (pts) => {
        const path = svgEl('path',{ d:`M ${pts.map(pt => `${pt[0]} ${pt[1]}`).join(' L ')} Z`, fill:color, stroke:'rgba(255,255,255,.18)', 'stroke-width':'1', 'stroke-linejoin':'round', opacity:'.98', style:'cursor:pointer' });
        path.addEventListener('pointerdown', (evt) => startSectionGuideDrag(evt, axis, 'arrow'));
        return path;
      };
      if(isY){
        const leftX = x1, rightX = x2, ay = linePos;
        const targetDown = rangeLimit > linePos;
        const leftArrow = targetDown
          ? [[leftX, ay+14],[leftX-10, ay-6],[leftX+10, ay-6]]
          : [[leftX, ay-14],[leftX-10, ay+6],[leftX+10, ay+6]];
        const rightArrow = targetDown
          ? [[rightX, ay+14],[rightX-10, ay-6],[rightX+10, ay-6]]
          : [[rightX, ay-14],[rightX-10, ay+6],[rightX+10, ay+6]];
        guideLayer.appendChild(mkArrow(leftArrow));
        guideLayer.appendChild(mkArrow(rightArrow));
      } else {
        const ax = linePos, topY = y1, botY = y2;
        const topArrow = dir === 1
          ? [[ax+14, topY],[ax-6, topY-10],[ax-6, topY+10]]
          : [[ax-14, topY],[ax+6, topY-10],[ax+6, topY+10]];
        const botArrow = dir === 1
          ? [[ax+14, botY],[ax-6, botY-10],[ax-6, botY+10]]
          : [[ax-14, botY],[ax+6, botY-10],[ax+6, botY+10]];
        guideLayer.appendChild(mkArrow(topArrow));
        guideLayer.appendChild(mkArrow(botArrow));
      }
      const handle = svgEl('circle',{ cx:isY ? (zb.minX+zb.maxX)/2 : linePos, cy:isY ? linePos : (zb.minY+zb.maxY)/2, r:'7', fill:color, stroke:'#05101c', 'stroke-width':'2', style:isY ? 'cursor:ns-resize' : 'cursor:ew-resize' });
      handle.addEventListener('pointerdown', evt => startSectionGuideDrag(evt, axis, 'handle'));
      guideLayer.appendChild(handle);
    };

    appState.layout.zones.forEach(zone => {
      const d = zone.pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
      const zoneWallThickness = getZoneWallThickness(zone);
      const wallInsetOpacity = appState.editor.wallsVisible === false ? (appState.selectedZoneId===zone.id ? .34 : .22) : (appState.selectedZoneId===zone.id ? .20 : .12);
      const path = svgEl('path',{d,class:'ortho-zone' + (appState.selectedZoneId===zone.id ? ' selected' : ''),fill:hexToRgba(zone.color || '#ffd84d', wallInsetOpacity),stroke:hexToRgba(zone.color || '#ffd84d', appState.editor.wallsVisible === false ? .98 : .46),'stroke-width':'1.4','data-zone-id':zone.id});
      path.addEventListener('pointerdown', e => {
        try{ e.currentTarget?.setPointerCapture?.(e.pointerId); }catch(_){}
        startZoneDrag(e, zone.id);
      }); if(appState.editor.zonesLocked) path.style.cursor='default';
      zoneLayer.appendChild(path);
      const c = centroid(zone.pts);
      const zb = zoneBoundsOf(zone);
      const zoneTitle = String(zone.name || zone.id || '').trim() || String(zone.id || '');
      const zoneSub = String(zone.id || '').trim().toUpperCase();
      const padX = 12, padY = 10;
      const badgeW = Math.min(Math.max(88, zoneTitle.length * 8.2 + 24), Math.max(96, zb.maxX - zb.minX - 24));
      const hasSub = zoneSub && zoneSub !== zoneTitle.toUpperCase();
      const badgeH = hasSub ? 42 : 28;
      const badgePos = findZoneBadgePlacement(zone, badgeW, badgeH);
      const badgeX = badgePos.x;
      const badgeY = badgePos.y;
      const badge = svgEl('g',{transform:`translate(${badgeX} ${badgeY})`,style: appState.editor.showLabels === false ? 'display:none;pointer-events:none' : 'pointer-events:none'});
      badge.appendChild(svgEl('rect',{x:0,y:0,width:badgeW,height:badgeH,rx:'10',fill:'rgba(5,16,28,.86)',stroke:hexToRgba(zone.color || '#B0E4CC', .95),'stroke-width':'1.4'}));
      const badgeText = svgEl('text',{x:padX,y:hasSub ? 16 : 18,class:'zone-badge-text','text-anchor':'start'});
      badgeText.textContent = zoneTitle;
      badge.appendChild(badgeText);
      if(hasSub){
        const badgeSub = svgEl('text',{x:padX,y:31,class:'zone-badge-sub','text-anchor':'start'});
        badgeSub.textContent = zoneSub;
        badge.appendChild(badgeSub);
      }
      zoneLayer.appendChild(badge);
      if(appState.selectedZoneId===zone.id && appState.editor.showLabels !== false){
        const centerLabel = svgEl('text',{x:c.x,y:c.y,class:'ortho-label','text-anchor':'middle',style:'opacity:.28;pointer-events:none'});
        centerLabel.textContent = zoneSub || zoneTitle;
        zoneLayer.appendChild(centerLabel);
      }
      if(appState.editor.showDims) drawZoneEdgeDimensions(edgeLayer, zone);

      if(appState.selectedZoneId===zone.id){
        if(appState.editor.sectionVisible){
          drawSectionGuide(zone, 'x');
          drawSectionGuide(zone, 'y');
        }
        const handleOffsetUnits = 15 / Math.max(.01, getScaleCmPerUnit());
        zone.pts.forEach((p, idx) => {
          const vn = getZoneOutwardVertexNormal(zone, idx);
          const hx = p.x + vn.x * handleOffsetUnits;
          const hy = p.y + vn.y * handleOffsetUnits;
          const selectedVertex = appState.selectedVertex.zoneId===zone.id && appState.selectedVertex.idx===idx;
          const hit = svgEl('circle',{cx:hx,cy:hy,r:'14',class:'vertex-hit'});
          const v = svgEl('circle',{cx:hx,cy:hy,r:selectedVertex?'8':'7',class:'vertex' + (selectedVertex ? ' selected' : '')});
          [hit, v].forEach(el => { el.addEventListener('pointerdown', e => startVertexDrag(e, zone.id, idx)); if(appState.editor.zonesLocked) el.style.pointerEvents='none'; });
          vertexLayer.appendChild(hit);
          vertexLayer.appendChild(v);
        });
        zone.pts.forEach((p, idx) => {
          const q = zone.pts[(idx+1)%zone.pts.length];
          const en = getZoneOutwardEdgeNormal(zone, p, q);
          const mx = (p.x + q.x)/2, my = (p.y + q.y)/2;
          const hx = mx + en.x * handleOffsetUnits;
          const hy = my + en.y * handleOffsetUnits;
          const activeEdge = (appState.selectedEdge.zoneId===zone.id && appState.selectedEdge.a===idx);
          const edgeLineHit = svgEl('line',{x1:p.x + en.x*4,y1:p.y + en.y*4,x2:q.x + en.x*4,y2:q.y + en.y*4,class:'edge-hit','stroke-width':'20'});
          edgeLineHit.addEventListener('pointerdown', e => startEdgeDrag(e, zone.id, idx, (idx+1)%zone.pts.length)); if(appState.editor.zonesLocked) edgeLineHit.style.pointerEvents='none';
          edgeLayer.appendChild(edgeLineHit);
          if(activeEdge) edgeLayer.appendChild(svgEl('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:'edge-guide'}));
          const hitBox = svgEl('circle',{cx:hx,cy:hy,r:14,class:'edge-hit'});
          const handle = svgEl('circle',{cx:hx,cy:hy,r:8,class:'edge-handle' + (activeEdge ? ' active' : '')});
          [hitBox, handle].forEach(el => { el.addEventListener('pointerdown', e => startEdgeDrag(e, zone.id, idx, (idx+1)%zone.pts.length)); if(appState.editor.zonesLocked) el.style.pointerEvents='none'; });
          edgeLayer.appendChild(hitBox);
          edgeLayer.appendChild(handle);
          const edgeWall = getZoneEdgeWall(zone, idx);
          const isWallEdge = !!edgeWall?.enabled;
          const pillW = isWallEdge ? 72 : 86;
          const pillH = 22;
          const pillX = hx + en.x * 20 - pillW / 2;
          const pillY = hy + en.y * 20 - pillH / 2;
          const pill = svgEl('g',{class:'edge-wall-pill' + (isWallEdge ? ' active' : ''), transform:`translate(${pillX} ${pillY})`, style:'cursor:pointer'});
          pill.appendChild(svgEl('rect',{x:0,y:0,width:pillW,height:pillH,rx:'11',fill:isWallEdge?'rgba(255,216,77,.96)':'rgba(7,18,30,.94)',stroke:isWallEdge?'#fff2a6':'rgba(255,255,255,.26)','stroke-width':'1.2'}));
          const pillText = svgEl('text',{x:pillW/2,y:14,'text-anchor':'middle',style:`font-size:10px;font-weight:900;fill:${isWallEdge?'#1c1600':'#d9e9f8'};pointer-events:none`});
          pillText.textContent = isWallEdge ? 'PARED' : '+ PARED';
          pill.appendChild(pillText);
          pill.addEventListener('pointerdown', e => {
            e.stopPropagation();
            appState.selectedZoneId = zone.id;
            appState.selectedEdge = { zoneId:zone.id, a:idx, b:(idx+1)%zone.pts.length };
            if(isWallEdge){ removeZoneEdgeWall(zone, idx); appState.selectedWallId = ''; }
            else { setZoneEdgeWall(zone, idx, { thickness:getZoneWallThickness(zone), height:Number(appState.layout?.meta?.defaultWallHeight || 290) || 290 }); appState.selectedWallId = zoneEdgeWallId(zone.id, idx); }
            syncZonePerimeterWalls();
            cleanupDetachedOpenings();
            persistActiveLayout();
            renderLayoutEditor();
          });
          edgeLayer.appendChild(pill);
        });
        if(appState.selectedEdge.zoneId===zone.id && appState.selectedEdge.a>=0){
          const a = zone.pts[appState.selectedEdge.a], b = zone.pts[appState.selectedEdge.b];
          edgeLayer.appendChild(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'edge-guide'}));
        }
      }
    });


    ensureLayoutDecorations();
    cleanupDetachedOpenings();

    const getRenderableWallOpenings = wall => {
      const len = Math.max(1, wallLength(wall));
      return (appState.layout.openings || []).filter(o => o.wallId === wall.id).map(o => {
        const width = Math.max(40, Math.min(len * .86, Number(o.width || openingDefaultForType(o.type).width) || 90));
        const half = width / 2 / len;
        const t = openingClampT(wall, width, o.t);
        return { opening:o, width, t0:Math.max(0, t - half), t1:Math.min(1, t + half) };
      }).sort((a,b) => a.t0 - b.t0);
    };

    const renderWallSlice = (wall, t0, t1, selected) => {
      if(t1 - t0 <= .002) return;
      const isAutoZoneEdge = !!wall.autoZoneEdge;
      const outerStroke = selected ? '#ffe08a' : (isAutoZoneEdge ? 'rgba(231,239,247,.98)' : '#dce8f5');
      const innerStroke = selected ? 'rgba(255,190,80,.95)' : (isAutoZoneEdge ? 'rgba(43,58,78,.76)' : 'rgba(34,48,66,.55)');
      const slice = getWallSlicePolygon(wall, t0, t1, 1);
      if(!slice?.poly) return;
      const d = wallPolygonPath(slice.poly);
      const hit = svgEl('path',{ d, fill:'transparent', stroke:'transparent', 'stroke-width':'14', style:'cursor:pointer' });
      const fill = svgEl('path',{ d, fill:selected ? 'rgba(255,224,138,.90)' : 'rgba(231,239,247,.95)', stroke:outerStroke, 'stroke-width':'1.4', opacity:selected ? '.99' : '.98', style:'cursor:pointer' });
      const accent = svgEl('line',{ x1:slice.a.x, y1:slice.a.y, x2:slice.b.x, y2:slice.b.y, stroke:innerStroke, 'stroke-width':'1.8', 'stroke-linecap':'round', opacity:'.92', style:'pointer-events:none' });
      const selectWall = evt => {
        evt.stopPropagation();
        appState.selectedWallId = wall.id;
        appState.selectedOpeningId = '';
        appState.selectedRackLayoutId = '';
        renderLayoutEditor();
      };
      [fill, hit].forEach(el => el.addEventListener('pointerdown', selectWall));
      wallLayer.append(fill, accent, hit);
    };

    (appState.layout.walls || []).forEach(wall => {
      const selected = appState.selectedWallId === wall.id;
      const label = svgEl('text',{x:(Number(wall.x1)+Number(wall.x2))/2,y:(Number(wall.y1)+Number(wall.y2))/2 - 10,class:'ortho-dim-text','text-anchor':'middle',style:(appState.editor.showLabels===false || wall.autoZoneEdge)?'display:none;pointer-events:none':'pointer-events:none;font-size:11px'});
      label.textContent = wall.id;
      const openings = getRenderableWallOpenings(wall);
      if(openings.length){
        let cursor = 0;
        openings.forEach(item => {
          const t0 = Math.max(cursor, item.t0);
          const t1 = Math.max(t0, item.t1);
          if(t0 > cursor + .002) renderWallSlice(wall, cursor, t0, selected);
          cursor = Math.max(cursor, t1);
        });
        if(cursor < .998) renderWallSlice(wall, cursor, 1, selected);
      } else {
        renderWallSlice(wall, 0, 1, selected);
      }
      wallLayer.appendChild(label);
    });

    // v89 FORCE: puertas con modelo de imagen 2; reemplaza definitivamente el modelo viejo de rombos.
    const openingTypeName = type => {
      const kind = normalizeOpeningType(type);
      if(kind === 'window') return 'VENTANA';
      if(kind === 'gate') return 'PORTÓN';
      if(kind === 'free') return 'VANO';
      return 'PUERTA';
    };
    const openingAccentForType = (type, selected=false) => selected ? '#36f58d' : (normalizeOpeningType(type) === 'window' ? '#53e7ff' : normalizeOpeningType(type) === 'free' ? '#c7fff0' : '#36f58d');
    const clampOpeningCardSize = (value, fallback, min, max) => Math.max(min, Math.min(max, Number(value || fallback) || fallback));
    const ptAdd = (p, v, scale=1) => ({ x:p.x + v.x * scale, y:p.y + v.y * scale });
    const ptMid = (a,b) => ({ x:(a.x+b.x)/2, y:(a.y+b.y)/2 });
    const ptDist = (a,b) => Math.hypot((b.x-a.x),(b.y-a.y));
    const ptNorm = v => { const len = Math.hypot(v.x||0, v.y||0) || 1; return { x:(v.x||0)/len, y:(v.y||0)/len }; };
    const doorCardRect = (center, longDir, shortDir, cardHeight, cardWidth) => {
      const halfH = Math.max(8, cardHeight) / 2;
      const halfW = Math.max(8, cardWidth) / 2;
      const topCenter = ptAdd(center, longDir, -halfH);
      const bottomCenter = ptAdd(center, longDir, halfH);
      const topLeft = ptAdd(topCenter, shortDir, -halfW);
      const topRight = ptAdd(topCenter, shortDir, halfW);
      const bottomRight = ptAdd(bottomCenter, shortDir, halfW);
      const bottomLeft = ptAdd(bottomCenter, shortDir, -halfW);
      return {
        center, topCenter, bottomCenter,
        leftCenter:ptAdd(center, shortDir, -halfW),
        rightCenter:ptAdd(center, shortDir, halfW),
        topLeft, topRight, bottomRight, bottomLeft,
        poly:[topLeft, topRight, bottomRight, bottomLeft]
      };
    };
    const appendOpeningMeasure = (a, b, dir, side, value, title='', selected=true, offsetOverride=null) => {
      if(!a || !b || !dir || !side) return;
      const isVertical = Math.abs(dir.y) > Math.abs(dir.x);
      const offset = Number.isFinite(Number(offsetOverride)) ? Number(offsetOverride) : (selected ? 36 : 26);
      const pA = { x:a.x + side.x*offset, y:a.y + side.y*offset };
      const pB = { x:b.x + side.x*offset, y:b.y + side.y*offset };
      const color = selected ? '#ffa728' : 'rgba(255,167,40,.72)';
      const dimLine = svgEl('line',{x1:pA.x,y1:pA.y,x2:pB.x,y2:pB.y,class:'opening-dim-line',stroke:color,'stroke-width':selected?'1.8':'1.2',opacity:selected?'.98':'.66'});
      const extA = svgEl('line',{x1:a.x,y1:a.y,x2:pA.x,y2:pA.y,class:'opening-dim-ext',stroke:color,'stroke-width':'1.1','stroke-dasharray':'4 4',opacity:selected?'.92':'.55'});
      const extB = svgEl('line',{x1:b.x,y1:b.y,x2:pB.x,y2:pB.y,class:'opening-dim-ext',stroke:color,'stroke-width':'1.1','stroke-dasharray':'4 4',opacity:selected?'.92':'.55'});
      const tick = 5;
      const n = { x:-dir.y, y:dir.x };
      const tA = svgEl('line',{x1:pA.x-n.x*tick,y1:pA.y-n.y*tick,x2:pA.x+n.x*tick,y2:pA.y+n.y*tick,stroke:color,'stroke-width':'1.8',opacity:'.95'});
      const tB = svgEl('line',{x1:pB.x-n.x*tick,y1:pB.y-n.y*tick,x2:pB.x+n.x*tick,y2:pB.y+n.y*tick,stroke:color,'stroke-width':'1.8',opacity:'.95'});
      openingLayer.append(extA, extB, dimLine, tA, tB);
      const mid = { x:(pA.x+pB.x)/2, y:(pA.y+pB.y)/2 };
      const txtAnchor = isVertical ? (side.x >= 0 ? 'start' : 'end') : 'middle';
      const tx = isVertical ? mid.x + (side.x >= 0 ? 10 : -10) : mid.x;
      const ty = isVertical ? mid.y - (title ? 4 : -2) : mid.y + (side.y >= 0 ? 18 : -12);
      const labelMain = svgEl('text',{x:tx,y:ty,class:'opening-dim-text','text-anchor':txtAnchor,style:`font-size:${selected?13:11}px`});
      labelMain.textContent = formatDistanceCm(value);
      openingLayer.append(labelMain);
      if(title){
        const labelSub = svgEl('text',{x:tx,y:ty+14,class:'opening-dim-title','text-anchor':txtAnchor,style:`font-size:${selected?9:8}px`});
        labelSub.textContent = title;
        openingLayer.append(labelSub);
      }
    };
    const appendOpeningPill = (opening, anchorPoint, outwardDir, type, accentColor) => {
      const dir = outwardDir || {x:-1,y:0};
      const text = openingTypeName(type);
      const pillW = Math.max(72, Math.min(112, 44 + text.length * 7));
      const pillH = 24;
      const cx = anchorPoint.x + dir.x * (pillW/2 + 20);
      const cy = anchorPoint.y + dir.y * (pillH/2 + 20);
      const x = cx - pillW/2;
      const y = cy - pillH/2;
      const edgeDist = Math.abs(dir.x) >= Math.abs(dir.y) ? (pillW/2 + 2) : (pillH/2 + 2);
      const from = { x:cx - dir.x*edgeDist, y:cy - dir.y*edgeDist };
      const elbow = { x:from.x - dir.x*13, y:from.y - dir.y*13 };
      const to = { x:anchorPoint.x + dir.x*6, y:anchorPoint.y + dir.y*6 };
      const g = svgEl('g',{class:'opening-callout',style:'cursor:grab'});
      const connector = svgEl('polyline',{points:`${from.x},${from.y} ${elbow.x},${elbow.y} ${to.x},${to.y}`,fill:'none',stroke:accentColor,'stroke-width':'1.3',opacity:'.94'});
      const rect = svgEl('rect',{x,y,width:pillW,height:pillH,rx:'9',fill:'rgba(7,25,36,.96)',stroke:accentColor,'stroke-width':'1.6'});
      const dot = svgEl('circle',{cx:x+14,cy:cy,r:'4.5',fill:accentColor,stroke:'rgba(3,20,15,.8)','stroke-width':'1'});
      const label = svgEl('text',{x:x+26,y:cy+4,class:'opening-pill-text',style:'font-size:11px'});
      label.textContent = text;
      g.append(connector, rect, dot, label);
      g.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
      openingLayer.appendChild(g);
    };

    (appState.layout.openings || []).forEach(opening => {
      const wall = findWallById(opening.wallId);
      const seg = getOpeningSegment(opening, wall);
      if(!wall || !seg) return;
      const selected = appState.selectedOpeningId === opening.id;
      const footprint = getOpeningFootprint(opening, wall, 1);
      const type = normalizeOpeningType(opening.type);
      const accentColor = openingAccentForType(type, selected);
      const dir = wallDirection(wall);
      const normal = footprint?.normal || getWallOpeningNormal(wall);
      const poly = footprint?.poly || [];
      const p0 = poly[0], p1 = poly[1], p2 = poly[2], p3 = poly[3];
      const isDoor = true; // v94: todos los vanos usan el render rectangular modelo 2
      const wallThickness = Math.max(8, Number(wall?.thickness || opening.depth || 14) || 14);
      const doorCardWidthMin = Math.max(8, wallThickness / 2);
      const doorCardWidthMax = Math.max(doorCardWidthMin, wallThickness);
      const doorCardWidth = clampOpeningCardSize(opening.depth || wallThickness, wallThickness, doorCardWidthMin, doorCardWidthMax);
      const wallCardCenter = wall?.autoZoneEdge ? ptAdd(seg.center, normal, wallThickness / 2) : seg.center;
      const card = isDoor ? doorCardRect(
        wallCardCenter,
        dir,
        normal,
        clampOpeningCardSize(opening.width || 90, 90, 40, Math.max(40, Math.min(wallLength(wall) * .86, 360))),
        doorCardWidth
      ) : null;
      const hitPoly = card?.poly?.length ? card.poly : poly;
      const hitPath = hitPoly.length >= 4 ? svgEl('path',{ d:wallPolygonPath(hitPoly), fill:'rgba(0,0,0,.001)', stroke:'transparent', 'stroke-width':'12', style:'cursor:grab' }) : null;
      if(hitPath){
        hitPath.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
        openingLayer.appendChild(hitPath);
      }

      if(isDoor && card){
        const panel = svgEl('path',{
          d:wallPolygonPath(card.poly),
          class:'opening-void-body' + (selected ? ' selected' : ''),
          fill:selected ? 'rgba(8,27,40,.98)' : 'rgba(6,20,31,.78)',
          stroke:accentColor,
          'stroke-width':selected?'3.4':'2.0',
          opacity:selected?'.99':'.92',
          style:'cursor:grab'
        });
        panel.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
        openingLayer.appendChild(panel);
        openingLayer.appendChild(svgEl('line',{x1:card.topCenter.x,y1:card.topCenter.y,x2:card.bottomCenter.x,y2:card.bottomCenter.y,stroke:accentColor,'stroke-width':selected?'1.9':'1.1','stroke-linecap':'round',opacity:selected?'.78':'.50',style:'pointer-events:none'}));
      } else {
        if(poly.length >= 4){
          const panel = svgEl('path',{d:wallPolygonPath(poly),class:'opening-void-body' + (selected ? ' selected' : ''),fill:selected ? 'rgba(7,26,39,.90)' : 'rgba(4,16,26,.58)',stroke:accentColor,'stroke-width':selected?'2.3':'1.25',opacity:selected?'.99':'.82',style:'cursor:grab'});
          panel.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
          openingLayer.appendChild(panel);
        }
        if(p0 && p3){
          const jambA = svgEl('line',{x1:p0.x,y1:p0.y,x2:p3.x,y2:p3.y,class:'opening-jamb',stroke:accentColor,'stroke-width':selected?'2.2':'1.45',opacity:selected?'.96':'.74',style:'cursor:grab'});
          jambA.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
          openingLayer.appendChild(jambA);
        }
        if(p1 && p2){
          const jambB = svgEl('line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,class:'opening-jamb',stroke:accentColor,'stroke-width':selected?'2.2':'1.45',opacity:selected?'.96':'.74',style:'cursor:grab'});
          jambB.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
          openingLayer.appendChild(jambB);
        }
        if(type === 'window' && p0 && p1 && p2 && p3){
          const midA = { x:(p0.x + p3.x) / 2, y:(p0.y + p3.y) / 2 };
          const midB = { x:(p1.x + p2.x) / 2, y:(p1.y + p2.y) / 2 };
          const glass = svgEl('line',{x1:midA.x,y1:midA.y,x2:midB.x,y2:midB.y,class:'opening-window-glass',stroke:accentColor,'stroke-width':'1.3','stroke-dasharray':'6 4',opacity:selected?'.86':'.55',style:'cursor:grab'});
          glass.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
          openingLayer.appendChild(glass);
        }
      }

      if(selected){
        if(isDoor && card){
          const labelDir = Math.abs(dir.y) > Math.abs(dir.x) ? {x:-1,y:0} : {x:0,y:-1};
          const labelAnchor = Math.abs(labelDir.x) > Math.abs(labelDir.y)
            ? (labelDir.x < 0 ? card.leftCenter : card.rightCenter)
            : (labelDir.y < 0 ? card.topCenter : card.bottomCenter);
          appendOpeningPill(opening, labelAnchor, labelDir, type, accentColor);
          appendOpeningMeasure(card.topLeft, card.topRight, normal, { x:-dir.x, y:-dir.y }, doorCardWidth, '', true, 18);
          const hSide = Math.abs(dir.y) > Math.abs(dir.x) ? {x:1,y:0} : {x:0,y:-1};
          appendOpeningMeasure(card.topRight, card.bottomRight, dir, hSide, Number(opening.width || 90) || 90, 'ANCHO', true, 22);
          const handleR = 6.8;
          const hA = svgEl('circle',{cx:card.topCenter.x,cy:card.topCenter.y,r:handleR,fill:'#4cff9b',stroke:'#06251a','stroke-width':'2',class:'opening-resize-handle',style:'cursor:ew-resize'});
          const hB = svgEl('circle',{cx:card.bottomCenter.x,cy:card.bottomCenter.y,r:handleR,fill:'#4cff9b',stroke:'#06251a','stroke-width':'2',class:'opening-resize-handle',style:'cursor:ew-resize'});
          hA.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'resize-start'));
          hB.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'resize-end'));
          openingLayer.append(hA,hB);
          const center = svgEl('g',{class:'opening-move-handle',style:'cursor:grab'});
          center.appendChild(svgEl('circle',{cx:card.center.x,cy:card.center.y,r:'13',fill:'#4cff9b',stroke:'#06251a','stroke-width':'2.2'}));
          center.appendChild(svgEl('line',{x1:card.center.x-6,y1:card.center.y,x2:card.center.x+6,y2:card.center.y,stroke:'#063020','stroke-width':'2.2','stroke-linecap':'round'}));
          center.appendChild(svgEl('line',{x1:card.center.x,y1:card.center.y-6,x2:card.center.x,y2:card.center.y+6,stroke:'#063020','stroke-width':'2.2','stroke-linecap':'round'}));
          center.appendChild(svgEl('path',{d:`M ${card.center.x-8} ${card.center.y} L ${card.center.x-4} ${card.center.y-3} L ${card.center.x-4} ${card.center.y+3} Z`,fill:'#063020'}));
          center.appendChild(svgEl('path',{d:`M ${card.center.x+8} ${card.center.y} L ${card.center.x+4} ${card.center.y-3} L ${card.center.x+4} ${card.center.y+3} Z`,fill:'#063020'}));
          center.appendChild(svgEl('path',{d:`M ${card.center.x} ${card.center.y-8} L ${card.center.x-3} ${card.center.y-4} L ${card.center.x+3} ${card.center.y-4} Z`,fill:'#063020'}));
          center.appendChild(svgEl('path',{d:`M ${card.center.x} ${card.center.y+8} L ${card.center.x-3} ${card.center.y+4} L ${card.center.x+3} ${card.center.y+4} Z`,fill:'#063020'}));
          center.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
          openingLayer.appendChild(center);
        } else {
          appendOpeningPill(opening, seg.center, {x:-normal.x, y:-normal.y}, type, accentColor);
          const info = getOpeningPositionInfo(opening, wall);
          if(info){ appendOpeningMeasure(seg.a, seg.b, dir, { x:-normal.x, y:-normal.y }, info.width, Math.abs(dir.y) > Math.abs(dir.x) ? 'ALTURA' : 'ANCHO', true); }
          const handleR = 6.8;
          const hA = svgEl('circle',{cx:seg.a.x,cy:seg.a.y,r:handleR,fill:'#4cff9b',stroke:'#06251a','stroke-width':'2',class:'opening-resize-handle',style:'cursor:ew-resize'});
          const hB = svgEl('circle',{cx:seg.b.x,cy:seg.b.y,r:handleR,fill:'#4cff9b',stroke:'#06251a','stroke-width':'2',class:'opening-resize-handle',style:'cursor:ew-resize'});
          hA.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'resize-start'));
          hB.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'resize-end'));
          openingLayer.append(hA,hB);
          const center = svgEl('g',{class:'opening-move-handle',style:'cursor:grab'});
          center.appendChild(svgEl('circle',{cx:seg.center.x,cy:seg.center.y,r:'13',fill:'#4cff9b',stroke:'#06251a','stroke-width':'2.2'}));
          center.addEventListener('pointerdown', evt => startOpeningDrag(evt, opening.id, 'move'));
          openingLayer.appendChild(center);
        }
      }
    });

    if(appState.editor.pendingWallPoint){
      const pending = appState.editor.pendingWallPoint;
      guideLayer.appendChild(svgEl('circle',{cx:pending.x, cy:pending.y, r:'7', fill:'#ffd84d', stroke:'#fff', 'stroke-width':'1.5'}));
      const hint = svgEl('text',{x:pending.x + 12, y:pending.y - 10, class:'ortho-dim-text', style:'font-size:11px;fill:#ffd84d'});
      hint.textContent = 'Punto inicial';
      guideLayer.appendChild(hint);
    }

    if(appState.editor.racksVisible !== false) appState.layout.racks.forEach(r => {
      r.rot = normalizeAngle(r.rot || 0);
      r.front = r.front || 'top';
      const fp = getRackFootprint(r.modelId, r.rot || 0);
      const baseW = fp.baseW, baseH = fp.baseH;
      const bboxW = fp.w || r.w || baseW, bboxH = fp.h || r.h || baseH;
      const cx = r.x + bboxW/2, cy = r.y + bboxH/2;
      const g = svgEl('g',{
        class:'layout-rack-wrap',
        transform:`translate(${cx} ${cy}) rotate(${r.rot || 0})`,
        'data-rack-id':r.id
      });
      const hit = svgEl('rect',{
        x:-(bboxW/2)-14,y:-(bboxH/2)-14,width:bboxW+28,height:bboxH+28,rx:'14',
        class:'ortho-rack-hit',style:'cursor:move'
      });
      const geomW = Math.max(8, baseW);
      const geomH = Math.max(8, baseH);
      const strokeInset = 0;
      const bodyInset = 0;
      const visualW = Math.max(4, geomW - bodyInset * 2);
      const visualH = Math.max(4, geomH - bodyInset * 2);
      const cornerRadius = Math.min(5, Math.max(2, Math.min(visualW, visualH) / 12));
      if(appState.selectedRackLayoutId===r.id) g.classList.add('selected');
      if(isRackSelected(r.id)) g.classList.add('multi-selected');
      if(isRackSearchHit(r.id)) g.classList.add('search-hit');
      if(appState.primaryHighlightedRackId===r.id) g.classList.add('search-primary');
      g.classList.add('ortho-rack-group');
      const body = svgEl('rect',{
        x:-(visualW/2),y:-(visualH/2),width:visualW,height:visualH,rx:String(cornerRadius),
        class:'ortho-rack-body'
      });
      const outlineInset = 0;
      const outlineW = Math.max(4, geomW - outlineInset * 2);
      const outlineH = Math.max(4, geomH - outlineInset * 2);
      const outlineRadius = Math.min(4, Math.max(2, Math.min(outlineW, outlineH) / 12));
      const outline = svgEl('rect',{
        x:-(outlineW/2),y:-(outlineH/2),width:outlineW,height:outlineH,rx:String(outlineRadius),
        class:'ortho-rack-outline'
      });
      const fl = getFrontLine(visualW, visualH);
      const frontLine = svgEl('line',{x1:fl.x1,y1:fl.y1,x2:fl.x2,y2:fl.y2,class:'rack-front-line'});
      const frontArrow = svgEl('path',{d:frontArrowPath(fl.ax, fl.ay, fl.dir), class:'rack-front-arrow'});
      const t = svgEl('text',{
        x:0,y:4,class:'ortho-label','text-anchor':'middle','dominant-baseline':'middle',
        style:'pointer-events:none', transform:`rotate(${-normalizeAngle(r.rot||0)})`
      });
      t.textContent = r.id;
      const baseHVal = Math.round(Number(r.baseHeight || 0));
      const levelBadge = svgEl('g',{transform:`translate(${-visualW/2 + 18} ${-visualH/2 + 10})`,style:'pointer-events:none'});
      levelBadge.appendChild(svgEl('rect',{x:-18,y:-12,width:36,height:18,rx:'9',fill:'rgba(8,18,30,.95)',stroke:'#56d2ff','stroke-width':'1'}));
      const levelTxt = svgEl('text',{x:0,y:1,class:'ortho-dim-text','text-anchor':'middle',style:'font-size:10px'});
      levelTxt.textContent = `N${getRackStackLevel(r)}`;
      levelBadge.appendChild(levelTxt);
      g.appendChild(levelBadge);
      if(baseHVal > 0){
        const badge = svgEl('g',{transform:`translate(${visualW/2 - 10} ${-visualH/2 + 10})`,style:'pointer-events:none'});
        badge.appendChild(svgEl('rect',{x:-20,y:-12,width:40,height:18,rx:'9',fill:'rgba(8,18,30,.95)',stroke:'#56d2ff','stroke-width':'1'}));
        const bt = svgEl('text',{x:0,y:1,class:'ortho-dim-text','text-anchor':'middle',style:'font-size:10px'});
        bt.textContent = `+${baseHVal}`;
        badge.appendChild(bt);
        g.appendChild(badge);
      }
      const stackInfo = rackStackSummary(r);
      if(stackInfo.count > 1){
        const stackBadge = svgEl('g',{transform:`translate(${visualW/2 - 14} ${visualH/2 - 14})`,style:'cursor:pointer'});
        stackBadge.appendChild(svgEl('rect',{x:-18,y:-11,width:36,height:20,rx:'10',fill:'rgba(5,15,24,.96)',stroke:'#ffd84d','stroke-width':'1.2'}));
        const st = svgEl('text',{x:0,y:2,class:'ortho-dim-text','text-anchor':'middle',style:'font-size:11px;fill:#ffd84d;font-weight:900'});
        st.textContent = `×${stackInfo.count}`;
        stackBadge.appendChild(st);
        stackBadge.addEventListener('click', evt => { evt.stopPropagation(); appState.selectedRackLayoutId = r.id; appState.selectedZoneId = r.zoneId; openStackMenuForRack(r.id, evt); renderLayoutEditor(); });
        g.appendChild(stackBadge);
      }
      g.append(hit, body, outline, frontLine, frontArrow, t);
      g.addEventListener('pointerdown', e => startRackDrag(e, r.id));
      g.addEventListener('dblclick', e => { e.stopPropagation(); openStackMenuForRack(r.id, e); renderLayoutStackMenu(); renderLayoutInspector(); });
      rackLayer.appendChild(g);
    });


    const dsBox = getDragSelectionBox();
    const snapPreview = appState.editor?.snapPreview;
    if(snapPreview?.line && Array.isArray(snapPreview.line) && snapPreview.line.length === 2){
      const [p1,p2] = snapPreview.line;
      const dash = snapPreview.strength === 'hard' ? 'none' : (snapPreview.strength === 'medium' ? '8 5' : '4 6');
      guideLayer.appendChild(svgEl('line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,stroke:snapPreview.type==='side' ? '#65f0a8' : '#56d2ff','stroke-width': snapPreview.strength === 'hard' ? '4' : '3','stroke-dasharray':dash,opacity:'.96'}));
      guideLayer.appendChild(svgEl('circle',{cx:p1.x,cy:p1.y,r:'5',fill:'#65f0a8',opacity:'.95'}));
      guideLayer.appendChild(svgEl('circle',{cx:p2.x,cy:p2.y,r:'5',fill:'#65f0a8',opacity:'.95'}));
    }

    if(dsBox && appState.editor?.dragSelect?.active){
      overlayLayer.appendChild(svgEl('rect',{x:dsBox.x,y:dsBox.y,width:dsBox.w,height:dsBox.h,class:'drag-select-box'}));
    }
    const selectedRack = findRackById(appState.selectedRackLayoutId);
    const selectedZone = selectedRack ? (findZoneById(selectedRack.zoneId) || findZoneById(appState.selectedZoneId)) : findZoneById(appState.selectedZoneId);
    if(selectedZone){
      drawSelectedZoneMeasurements(measureLayer, selectedZone);
    }
    if(selectedRack && selectedZone){
      drawSelectedRackMeasurements(measureLayer, selectedRack, selectedZone);
    }

    svg.addEventListener('pointerdown', handleLayoutCanvasDown);
    svg.addEventListener('pointermove', handleLayoutMove);
    svg.addEventListener('pointerup', stopEditorDrag);
    svg.addEventListener('pointerleave', stopEditorDrag);
  }


  function getSectionCut(axis, zone){
    const targetZone = zone || findZoneById(appState.selectedZoneId) || appState.layout.zones[0];
    const cuts = ensureZoneSectionCuts(targetZone);
    return cuts[axis] || cuts.x;
  }
  function clampSectionCut(zone, axis){
    const cut = getSectionCut(axis, zone);
    cut.pos = Math.max(.06, Math.min(.94, Number(cut.pos) || .5));
    cut.dir = cut.dir === -1 ? -1 : 1;
    return cut;
  }
  function getSectionLinePosition(zone, axis){
    const zb = zoneBounds(zone);
    const cut = clampSectionCut(zone, axis);
    return axis === 'x'
      ? zb.minX + (zb.maxX - zb.minX) * cut.pos
      : zb.minY + (zb.maxY - zb.minY) * cut.pos;
  }
  function updateSectionCutFromPoint(zone, axis, point){
    const zb = zoneBounds(zone);
    const span = axis === 'x' ? Math.max(1, zb.maxX - zb.minX) : Math.max(1, zb.maxY - zb.minY);
    const raw = axis === 'x' ? (point.x - zb.minX) / span : (point.y - zb.minY) / span;
    const cut = getSectionCut(axis, zone);
    cut.pos = Math.max(.06, Math.min(.94, raw));
  }
  function updateSectionRangeFromPoint(zone, axis, point){
    const zb = zoneBounds(zone);
    const cut = clampSectionCut(zone, axis);
    const line = getSectionLinePosition(zone, axis);
    const minEdge = axis === 'x' ? zb.minX : zb.minY;
    const maxEdge = axis === 'x' ? zb.maxX : zb.maxY;
    const target = axis === 'x' ? point.x : point.y;
    const maxDist = cut.dir === 1 ? (maxEdge - line) : (line - minEdge);
    if(maxDist <= 1){ cut.depth = maxDist; return; }
    let dist = cut.dir === 1 ? (target - line) : (line - target);
    dist = Math.max(100, Math.min(maxDist, dist));
    cut.depth = dist;
  }
  function getSectionRangeLimit(zone, axis){
    const zb = zoneBounds(zone);
    const cut = clampSectionCut(zone, axis);
    const line = getSectionLinePosition(zone, axis);
    const maxDist = cut.dir === 1
      ? ((axis === 'x' ? zb.maxX : zb.maxY) - line)
      : (line - (axis === 'x' ? zb.minX : zb.minY));
    const depth = Math.max(Math.min(100, maxDist), Math.min(maxDist, Number(cut.depth) || 100));
    return line + (cut.dir * depth);
  }
  function sectionVisibleRacks(zone, racks, axis){
    if(!zone) return [];
    const line = getSectionLinePosition(zone, axis);
    const limit = getSectionRangeLimit(zone, axis);
    const minV = Math.min(line, limit) - 0.25;
    const maxV = Math.max(line, limit) + 0.25;
    return (racks||[]).filter(r => {
      const start = axis === 'x' ? Number(r.x || 0) : Number(r.y || 0);
      const size = axis === 'x' ? Number(r.w || 0) : Number(r.h || 0);
      const end = start + size;
      return end >= minV && start <= maxV;
    });
  }


  function renderSectionAxisSvg(svg, zone, racks, axis){
    if(!svg) return;
    const mountWidth = Math.max(320, Math.floor((svg.parentElement?.clientWidth || 520) - 4));
    const width = mountWidth, height = 260, groundY = 220;
    const padX = 24;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.appendChild(svgEl('rect',{x:0,y:0,width,height,rx:18,fill:'rgba(6,16,28,.98)'}));
    svg.appendChild(svgEl('line',{x1:padX,y1:groundY,x2:width-padX,y2:groundY,class:'section-ground'}));
    if(!zone || !racks.length){
      const txt = svgEl('text',{x:width/2,y:height/2,class:'section-text','text-anchor':'middle'});
      txt.textContent = 'Selecciona una zona con racks para ver la sección.';
      svg.appendChild(txt);
      return;
    }
    const zb = zoneBounds(zone);
    const visible = sectionVisibleRacks(zone, racks, axis);
    const displayAxisKey = axis === 'x' ? 'y' : 'x';
    const displaySizeKey = axis === 'x' ? 'h' : 'w';
    const displayMin = axis === 'x' ? zb.minY : zb.minX;
    const displayMax = axis === 'x' ? zb.maxY : zb.minX + Math.max(1, zb.maxX-zb.minX);
    const displaySpan = Math.max(1, displayMax - displayMin);
    const innerWidth = Math.max(120, width - padX * 2);
    if(!visible.length){
      const txt = svgEl('text',{x:width/2,y:height/2,class:'section-text','text-anchor':'middle'});
      txt.textContent = 'No hay racks visibles desde esta línea de sección.';
      svg.appendChild(txt);
      return;
    }
    const maxTop = Math.max(...visible.map(r => (Number(r.baseHeight||0) + Number(r.rackHeight || rackModel(r.modelId).height || 238))), 240);
    const usableHeight = 160;
    const rackHeightScale = usableHeight / maxTop;
    const ordered = visible.slice().sort((a,b)=> ((a[displayAxisKey] || 0) - (b[displayAxisKey] || 0)) || ((a.baseHeight||0)-(b.baseHeight||0)) || (a.id > b.id ? 1 : -1));
    const sectionItems = ordered.map(r => {
      const model = rackModel(r.modelId);
      const pos = Number(r[displayAxisKey] || 0);
      const size = Math.max(8, Number(r[displaySizeKey] || 44));
      const rw = Math.max(18, Math.round((size / displaySpan) * innerWidth));
      const rackHeight = Math.max(60, Number(r.rackHeight || model.height || 238));
      const baseHeight = Math.max(0, Number(r.baseHeight || 0));
      const rh = Math.max(48, Math.round(rackHeight * rackHeightScale));
      const relStart = (pos - displayMin) / displaySpan;
      const rx = Math.round(padX + relStart * innerWidth);
      return { r, model, rw, rh, baseHeight, rackHeight, rx };
    });

    sectionItems.forEach(it => {
      const { r, model, rw, rh, baseHeight, rackHeight } = it;
      let rx = it.rx;
      rx = Math.max(padX, Math.min(width - padX - rw, rx));
      const ry = groundY - Math.round((baseHeight + rackHeight) * rackHeightScale);
      const sectionInset = 1;
      const rect = svgEl('rect',{x:rx+sectionInset,y:ry+sectionInset,width:Math.max(8,rw-sectionInset*2),height:Math.max(8,rh-sectionInset*2),rx:16,class:'section-rack' + (appState.selectedRackLayoutId===r.id ? ' selected' : '')});
      rect.setAttribute('filter','drop-shadow(0 10px 18px rgba(0,0,0,.25))');
      rect.addEventListener('pointerdown', evt => { evt.stopPropagation(); appState.selectedRackLayoutId = r.id; appState.selectedZoneId = r.zoneId; renderLayoutEditor(); });
      svg.appendChild(rect);
      const orangeInset = 14;
      const frontY = ry + 16;
      svg.appendChild(svgEl('line',{x1:rx+orangeInset,y1:frontY,x2:rx+rw-orangeInset,y2:frontY,stroke:'#ff9848','stroke-width':'4.5','stroke-linecap':'round'}));
      svg.appendChild(svgEl('path',{d:`M ${rx+rw/2} ${ry-6} l 10 0 l -5 -12 z`, fill:'#ff9848', opacity:'0.95'}));
      const levels = Math.max(2, parseInt(model.levels || 4, 10));
      for(let i=1;i<levels;i++){
        const ly = ry + (rh/levels) * i;
        svg.appendChild(svgEl('line',{x1:rx+8,y1:ly,x2:rx+rw-8,y2:ly,class:'section-deck'}));
      }
      const label = svgEl('text',{x:rx+rw/2,y:ry+rh/2+6,class:'section-text','text-anchor':'middle'});
      label.textContent = `${r.id} · N${getRackStackLevel(r)}`;
      svg.appendChild(label);
      const baseText = svgEl('text',{x:rx+rw/2,y:ry+rh+16,class:'section-text','text-anchor':'middle',style:'font-size:11px;fill:#9db8d4'});
      baseText.textContent = `Base ${formatDistanceShort(baseHeight)}`;
      svg.appendChild(baseText);
    });
  }

  function renderLayoutSection(){
    const mount = $('#layoutSectionWrap');
    if(!mount) return;
    if(!appState.editor.sectionVisible || appState.editor.racksVisible === false){ mount.innerHTML = ''; mount.style.display='none'; return; }
    mount.style.display='block';
    const zone = findZoneById(appState.selectedZoneId) || appState.layout.zones[0];
    const racks = zone ? (appState.layout.racks||[]).filter(r => r.zoneId === zone.id) : [];
    mount.innerHTML = `
      <div class="layout-section-wrap layout-section-panel">
        <div class="layout-section-head">
          <div>
            <div class="layout-section-title">Vistas de sección</div>
            <div class="layout-section-sub">Lectura vertical tipo arquitectura en ambos ejes para revisar apilado y distribución de racks. Muestran solo lo que queda dentro del área delimitada por las 2 líneas de corte.</div>
          </div>
          <div class="section-stack-chip">${zone ? zone.id : 'Sin zona'} • ${racks.length} racks</div>
        </div>
        <div class="layout-section-body layout-section-grid">
          <div class="layout-section-card">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
              <div class="layout-section-sub">Sección eje X</div>
              <button class="seg-btn" id="btnFlipSectionX">Invertir dirección</button>
            </div>
            <svg id="layoutSectionSvg"></svg>
          </div>
          <div class="layout-section-card">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
              <div class="layout-section-sub">Sección eje Y</div>
              <button class="seg-btn" id="btnFlipSectionY">Invertir dirección</button>
            </div>
            <svg id="layoutSectionSvgY"></svg>
          </div>
        </div>
      </div>`;
    renderSectionAxisSvg($('#layoutSectionSvg'), zone, racks, 'x');
    renderSectionAxisSvg($('#layoutSectionSvgY'), zone, racks, 'y');
    $('#btnFlipSectionX').onclick = () => { const cut = getSectionCut('x', zone); cut.dir *= -1; persistActiveLayout(); renderLayoutEditor(); };
    $('#btnFlipSectionY').onclick = () => { const cut = getSectionCut('y', zone); cut.dir *= -1; persistActiveLayout(); renderLayoutEditor(); };
  }

  function hexToRgba(hex, a){ const h = hex.replace('#',''); const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16); return `rgba(${r},${g},${b},${a})`; }
  function svgPoint(evt, svg){ const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
  function renderLayoutViewportOnly(){
    const svg = document.getElementById('layoutSvg');
    if(!svg) return;
    window.cancelAnimationFrame(appState.editor?.layoutAutoFitRaf || 0);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    renderLayoutSvg(svg);
    renderLayoutSection();
    renderLayoutStackMenu();
    const zl = document.getElementById('zoomLabel');
    if(zl){
      const vb = appState.editor.viewBox || {w:900};
      zl.textContent = `${Math.round((900 / Math.max(1, vb.w)) * 100)}%`;
    }
  }
  function zoomLayout(factor, center){
    const vb = appState.editor.viewBox || { x:0, y:0, w:900, h:620 };
    const cx = center ? center.x : vb.x + vb.w/2;
    const cy = center ? center.y : vb.y + vb.h/2;
    const nw = Math.max(220, Math.min(2400, vb.w * factor));
    const nh = Math.max(160, Math.min(1800, vb.h * factor));
    appState.editor.viewBox = {
      x: cx - ((cx - vb.x) / vb.w) * nw,
      y: cy - ((cy - vb.y) / vb.h) * nh,
      w: nw,
      h: nh
    };
    appState.editor.viewBoxCustomized = true;
    appState.editor.lastZoomAt = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    renderLayoutViewportOnly();
  }

  function markLayoutManualInteraction(){
    if(!appState.editor) return;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    appState.editor.viewBoxInitialized = true;
    appState.editor.lastLayoutButtonAt = now;
    appState.editor.suppressAutoFitUntil = now + 850;
  }

  function bindLayoutToolbar(){
    $$('.seg-btn[data-emode]').forEach(btn => btn.onclick = () => { markLayoutManualInteraction(); appState.editor.mode = btn.dataset.emode; renderLayoutEditor(); });
    $$('[data-layout-tag-action]').forEach(btn => btn.onclick = () => {
      markLayoutManualInteraction();
      const action = btn.getAttribute('data-layout-tag-action');
      if(action === 'toggle-select') appState.editor.mode = appState.editor.mode === 'select' ? 'navigate' : 'select';
      else if(action === 'toggle-nav') appState.editor.mode = appState.editor.mode === 'navigate' ? 'select' : 'navigate';
      else if(action === 'toggle-lock-zones') appState.editor.zonesLocked = !appState.editor.zonesLocked;
      else if(action === 'toggle-dims') appState.editor.showDims = !appState.editor.showDims;
      else if(action === 'toggle-snap') { appState.editor.snapEnabled = !isSnapEnabled(); clearRackSnapPreview(); }
      else if(action === 'toggle-section') appState.editor.sectionVisible = !appState.editor.sectionVisible;
      else if(action === 'toggle-walls') appState.editor.wallsVisible = appState.editor.wallsVisible === false ? true : false;
      else if(action === 'toggle-openings') appState.editor.openingsVisible = appState.editor.openingsVisible === false ? true : false;
      else if(action === 'toggle-racks') appState.editor.racksVisible = appState.editor.racksVisible === false ? true : false;
      else if(action === 'toggle-zone-props') appState.editor.inspectorZoneOpen = !appState.editor.inspectorZoneOpen;
      else if(action === 'toggle-rack-props') appState.editor.rackPropsOpen = !appState.editor.rackPropsOpen;
      else if(action === 'toggle-right-props') appState.editor.rightPanelOpen = appState.editor.rightPanelOpen === false ? true : false;
      else if(action === 'noop-layers'){ appState.editor.rightPanelOpen = true; }
      else if(action === 'history-undo-layout'){ undoHistory('layout'); return; }
      else if(action === 'history-redo-layout'){ redoHistory('layout'); return; }
      else if(action === 'history-undo-racks'){ undoHistory('racks'); return; }
      else if(action === 'history-redo-racks'){ redoHistory('racks'); return; }
      renderLayoutEditor();
    });
    if($('#layoutBranchSelect')) $('#layoutBranchSelect').onchange = e => { markLayoutManualInteraction(); setLayoutBranch(+e.target.value || 0); renderLayoutEditor(); };
    if($('#btnZonePlus')) $('#btnZonePlus').onclick = () => { markLayoutManualInteraction(); appState.editor.mode = 'zone'; appState.editor.pendingWallPoint = null; renderLayoutEditor(); };
    if($('#btnOpeningPlus')) $('#btnOpeningPlus').onclick = () => { markLayoutManualInteraction(); appState.editor.mode = 'opening'; appState.editor.pendingWallPoint = null; renderLayoutEditor(); };
    if($('#btnVertexPlus')) $('#btnVertexPlus').onclick = () => { markLayoutManualInteraction(); insertVertexOnSelectedEdge(); };
    if($('#btnDuplicateRack')) $('#btnDuplicateRack').onclick = () => { markLayoutManualInteraction(); duplicateSelectedRack(); };
    if($('#btnDuplicateZone')) $('#btnDuplicateZone').onclick = () => { markLayoutManualInteraction(); duplicateSelectedZone(); };
    if($('#btnDeleteSelected')) $('#btnDeleteSelected').onclick = () => {
      markLayoutManualInteraction();
      const selectedIds = getSelectedRackIds();
      const rid = appState.selectedRackLayoutId; const zid = appState.selectedZoneId;
      const oid = appState.selectedOpeningId; const wid = appState.selectedWallId;
      if(selectedIds.length){
        appState.layout.racks = appState.layout.racks.filter(r => !selectedIds.includes(r.id));
        clearRackSelection();
      }
      else if(oid){ appState.layout.openings = (appState.layout.openings || []).filter(o => o.id !== oid); appState.selectedOpeningId = ''; }
      else if(wid){ appState.layout.walls = (appState.layout.walls || []).filter(w => w.id !== wid); appState.layout.openings = (appState.layout.openings || []).filter(o => o.wallId !== wid); appState.selectedWallId = ''; appState.selectedOpeningId = ''; }
      else if(rid){ appState.layout.racks = appState.layout.racks.filter(r => r.id !== rid); clearRackSelection(); }
      else if(zid && appState.layout.zones.length > 1){ appState.layout.zones = appState.layout.zones.filter(z => z.id !== zid); appState.layout.racks = appState.layout.racks.filter(r => r.zoneId !== zid); appState.selectedZoneId = appState.layout.zones[0]?.id || ''; normalizeZoneAndRackIds(); }
      cleanupDetachedOpenings();
      persistActiveLayout(); renderLayoutEditor();
    };
    const runSaveLayout = async () => { persistActiveLayout(); if(await saveRemoteAppState('layout')) alert('Layout guardado.'); };
    if($('#btnSaveLayoutRemote')) $('#btnSaveLayoutRemote').onclick = runSaveLayout;
    if($('#btnSaveLayoutTop')) $('#btnSaveLayoutTop').onclick = runSaveLayout;
    if($('#btnSaveLayoutVisible')) $('#btnSaveLayoutVisible').onclick = runSaveLayout;
    if($('#btnSaveLayoutFloat')) $('#btnSaveLayoutFloat').onclick = runSaveLayout;
    if($('#btnZoomIn')) $('#btnZoomIn').onclick = () => { markLayoutManualInteraction(); zoomLayout(0.86); };
    if($('#btnZoomOut')) $('#btnZoomOut').onclick = () => { markLayoutManualInteraction(); zoomLayout(1.16); };
    if($('#btnZoomFit')) $('#btnZoomFit').onclick = () => { 
      markLayoutManualInteraction();
      fitLayoutViewBox();
      appState.editor.viewBoxInitialized = true;
      renderLayoutViewportOnly();
    };
    window.requestAnimationFrame(() => {
      const stageSvg = document.getElementById('layoutSvg');
      if(!stageSvg) return;
      if(!appState.editor.viewBoxInitialized){
        fitLayoutViewBox();
        appState.editor.viewBoxInitialized = true;
      }
      renderLayoutSvg(stageSvg);
      renderLayoutSection();
    });
    const svg = $('#layoutSvg');
    svg.onwheel = e => {
      e.preventDefault();
      markLayoutManualInteraction();
      const factor = e.deltaY > 0 ? 1.10 : 0.90;
      zoomLayout(factor, svgPoint(e, svg));
    };
  }


  function renderLayoutIsoSvg(svg){
    svg.innerHTML = '';
    const iso = (x,y,z=0) => ({ x:(x-y)*0.72, y:(x+y)*0.36 - z });
    const zones = appState.layout.zones || [];
    const racks = appState.layout.racks || [];
    const pts=[];
    zones.forEach(z=> (z.pts||[]).forEach(p=>{ const q=iso(p.x,p.y,0); pts.push(q); }));
    racks.forEach(r=>{
      const h = Math.max(48, Math.round((getModelById(r.modelId)?.height || 220) * (ISO_Z_SCALE * 0.6666667)));
      [[r.x,r.y,0],[r.x+r.w,r.y,0],[r.x+r.w,r.y+r.h,0],[r.x,r.y+r.h,0],[r.x,r.y,h],[r.x+r.w,r.y,h],[r.x+r.w,r.y+r.h,h],[r.x,r.y+r.h,h]].forEach(([x,y,z])=>pts.push(iso(x,y,z)));
    });
    if(!pts.length){ svg.setAttribute('viewBox','-400 -260 800 520'); return; }
    let minX=Math.min(...pts.map(p=>p.x)), maxX=Math.max(...pts.map(p=>p.x)), minY=Math.min(...pts.map(p=>p.y)), maxY=Math.max(...pts.map(p=>p.y));
    const pad=80;
    svg.setAttribute('viewBox', `${minX-pad} ${minY-pad} ${Math.max(600,maxX-minX+pad*2)} ${Math.max(420,maxY-minY+pad*2)}`);
    const grid = svgEl('g',{opacity:'.22'});
    for(let i=-1200;i<=1200;i+=80){
      const a=iso(i,-1200,0), b=iso(i,1200,0); grid.appendChild(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'rgba(86,124,170,.28)','stroke-width':'1'}));
      const c=iso(-1200,i,0), d=iso(1200,i,0); grid.appendChild(svgEl('line',{x1:c.x,y1:c.y,x2:d.x,y2:d.y,stroke:'rgba(86,124,170,.28)','stroke-width':'1'}));
    }
    svg.appendChild(grid);
    const zoneLayer=svgEl('g'), rackLayer=svgEl('g'), textLayer=svgEl('g');
    svg.append(zoneLayer,rackLayer,textLayer);
    zones.forEach(zone=>{
      const base=(zone.pts||[]).map(p=>iso(p.x,p.y,0));
      zoneLayer.appendChild(svgEl('path',{d:base.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ')+' Z', fill:hexToRgba(zone.color||'#ffd84d', .22), stroke:hexToRgba(zone.color||'#ffd84d', .96), 'stroke-width':'2'}));
      const c=centroid(zone.pts||[]); const ci=iso(c.x,c.y,0);
      const t=svgEl('text',{x:ci.x,y:ci.y,class:'ortho-label','text-anchor':'middle'}); t.textContent=zone.id; textLayer.appendChild(t);
    });
    racks.forEach(r=>{
      const h = Math.max(48, Math.round((getModelById(r.modelId)?.height || 220) * (ISO_Z_SCALE * 0.6666667)));
      const p0=iso(r.x,r.y,0), p1=iso(r.x+r.w,r.y,0), p2=iso(r.x+r.w,r.y+r.h,0), p3=iso(r.x,r.y+r.h,0);
      const t0=iso(r.x,r.y,h), t1=iso(r.x+r.w,r.y,h), t2=iso(r.x+r.w,r.y+r.h,h), t3=iso(r.x,r.y+r.h,h);
      const cls = appState.selectedRackLayoutId===r.id ? ' selected' : '';
      rackLayer.appendChild(svgEl('path',{d:`M ${p3.x} ${p3.y} L ${p2.x} ${p2.y} L ${t2.x} ${t2.y} L ${t3.x} ${t3.y} Z`, class:'rack-iso'+cls, fill:'rgba(55,87,120,.55)', stroke:'#9db8d4','stroke-width':'2'}));
      rackLayer.appendChild(svgEl('path',{d:`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${t2.x} ${t2.y} L ${t1.x} ${t1.y} Z`, class:'rack-iso'+cls, fill:'rgba(40,64,96,.65)', stroke:'#88acd1','stroke-width':'2'}));
      rackLayer.appendChild(svgEl('path',{d:`M ${t0.x} ${t0.y} L ${t1.x} ${t1.y} L ${t2.x} ${t2.y} L ${t3.x} ${t3.y} Z`, class:'rack-iso'+cls, fill:'rgba(255,255,255,.08)', stroke:'#c7d8ea','stroke-width':'2'}));
      const center=iso(r.x+r.w/2,r.y+r.h/2,h+10); const tx=svgEl('text',{x:center.x,y:center.y,class:'ortho-label','text-anchor':'middle'}); tx.textContent=r.id; textLayer.appendChild(tx);
    });
  }

  function startLayoutPan(e){
    const svg = $('#layoutSvg');
    const vb = clone(appState.editor.viewBox || { x:0, y:0, w:900, h:620 });
    appState.editor.dragging = { type:'pan-layout', startClient:{ x:e.clientX, y:e.clientY }, originalViewBox:vb };
    if(svg) svg.style.cursor = 'grabbing';
  }

  function handleLayoutCanvasDown(e){
    const svg = e.currentTarget; const raw = svgPoint(e, svg); const p = { x:snapGrid(raw.x), y:snapGrid(raw.y) };
    const target = e.target;
    const isPanSurface = target === svg || (target && target.classList && target.classList.contains('layout-pan-surface'));
    if(appState.editor.dragging?.type === 'pan-layout') return;
    if(isPanSurface && (appState.editor.mode === 'navigate' || e.shiftKey || e.button === 1)){
      startLayoutPan(e);
      return;
    }
    if(appState.editor.mode === 'select' && isPanSurface){
      closeStackMenu();
      appState.selectedWallId = '';
      appState.selectedOpeningId = '';
      renderLayoutInspector();
      renderLayoutSection();
      return;
    }
    if(appState.editor.mode === 'wall'){
      if(!appState.editor.pendingWallPoint){
        appState.editor.pendingWallPoint = { x:p.x, y:p.y };
        appState.selectedWallId = '';
        appState.selectedOpeningId = '';
        renderLayoutEditor();
        return;
      }
      createWallSegment(appState.editor.pendingWallPoint, p);
      appState.editor.pendingWallPoint = null;
      appState.editor.mode = 'select';
      persistActiveLayout();
      renderLayoutEditor();
      return;
    }
    if(appState.editor.mode === 'opening'){
      const created = createOpeningAtPoint(p, 'door');
      if(created){
        appState.editor.mode = 'select';
        persistActiveLayout();
        renderLayoutEditor();
      }
      return;
    }
    if(appState.editor.mode === 'zone'){
      const id = nextZoneId();
      appState.layout.zones.push({ id, name:'Zona ' + id, color:getNextZoneColor(getBranchColor(getActiveLayoutBranchIndex())), wallThickness:14, pts:[{x:p.x-60,y:p.y-40},{x:p.x+60,y:p.y-40},{x:p.x+60,y:p.y+40},{x:p.x-60,y:p.y+40}] });
      normalizeZoneAndRackIds(); persistActiveLayout();
      appState.selectedZoneId = id; appState.editor.mode = 'select'; renderLayoutEditor(); return;
    }
    if(appState.editor.mode === 'rack'){
      const zone = appState.layout.zones.find(z => pointInPoly(p, z.pts)) || findZoneById(appState.selectedZoneId) || appState.layout.zones[0];
      const id = nextRackId(zone.id);
      const fp = getRackFootprint(appState.selectedModelId, 0);
      const rackObj = { id, zoneId:zone.id, x:snapGrid(p.x-fp.w/2), y:snapGrid(p.y-fp.h/2), w:fp.w, h:fp.h, rot:0, modelId:appState.selectedModelId, front:'auto', baseHeight:0, rackHeight:(rackModel(appState.selectedModelId)?.height || 238) };
      keepRackSnapped(rackObj, zone); appState.layout.racks.push(rackObj); persistActiveLayout();
      appState.selectedRackLayoutId = rackObj.id; appState.editor.mode = 'select'; renderLayoutEditor(); return;
    }
    pickNearestEdge(p);
    renderLayoutInspector();
  }

  function pickNearestEdge(p){
    const zone = findZoneById(appState.selectedZoneId); if(!zone) return;
    let best = { d: Infinity, a:-1, b:-1 };
    for(let i=0;i<zone.pts.length;i++){
      const a = zone.pts[i], b = zone.pts[(i+1)%zone.pts.length];
      const pr = projectPointToSegment(p, a, b); const d = dist2(p, pr);
      if(d < best.d){ best = { d, a:i, b:(i+1)%zone.pts.length }; }
    }
    if(best.d < 180) appState.selectedEdge = { zoneId:zone.id, a:best.a, b:best.b };
    else appState.selectedEdge = { zoneId:'', a:-1, b:-1 };
  }

  function insertVertexOnSelectedEdge(){
    const sel = appState.selectedEdge; const zone = findZoneById(sel.zoneId); if(!zone || sel.a<0) return;
    const a = zone.pts[sel.a], b = zone.pts[sel.b];
    zone.pts.splice(sel.b, 0, { x:(a.x+b.x)/2, y:(a.y+b.y)/2 });
    appState.selectedVertex = { zoneId:zone.id, idx:sel.b };
    persistActiveLayout(); renderLayoutEditor();
  }

  function removeSelectedVertex(){
    const sel = appState.selectedVertex || { zoneId:'', idx:-1 };
    const zone = findZoneById(sel.zoneId);
    if(!zone || sel.idx < 0 || !Array.isArray(zone.pts) || zone.pts.length <= 3) return;
    zone.pts.splice(sel.idx, 1);
    appState.selectedVertex = { zoneId:'', idx:-1 };
    appState.selectedEdge = { zoneId:'', a:-1, b:-1 };
    persistActiveLayout();
    renderLayoutEditor();
  }


  function dragZoneFromState(d){
    if(!d) return null;
    if(Number.isInteger(d.zoneIndex) && appState.layout?.zones?.[d.zoneIndex]) return appState.layout.zones[d.zoneIndex];
    return findZoneById(d.zoneId);
  }

  function startZoneDrag(e, zoneId){
    if(appState.editor.mode !== 'select' || appState.editor.zonesLocked) return;
    e.stopPropagation();
    const svg = $('#layoutSvg'); const p = svgPoint(e, svg);
    appState.selectedZoneId = zoneId; appState.selectedRackLayoutId = ''; appState.selectedWallId = ''; appState.selectedOpeningId = '';
    closeStackMenu();
    const zone = findZoneById(zoneId);
    if(!zone) return;
    const zoneIndex = (appState.layout?.zones || []).findIndex(z => z === zone);
    appState.editor.dragging = { type:'zone', zoneId, zoneIndex, start:p, original: clone(zone.pts), racks: clone(appState.layout.racks.filter(r => r.zoneId === zoneId)) };
    renderLayoutSvg(svg); renderLayoutSection(); renderLayoutInspector();
  }
  function startVertexDrag(e, zoneId, idx){
    if(appState.editor.mode !== 'select' || appState.editor.zonesLocked) return;
    e.stopPropagation();
    const svg = $('#layoutSvg'); const p = svgPoint(e, svg);
    const zone = findZoneById(zoneId);
    if(!zone) return;
    const zoneIndex = (appState.layout?.zones || []).findIndex(z => z === zone);
    appState.selectedZoneId = zoneId; appState.selectedVertex = { zoneId, idx }; appState.selectedRackLayoutId = ''; appState.selectedWallId = ''; appState.selectedOpeningId = '';
    closeStackMenu();
    appState.editor.dragging = { type:'vertex', zoneId, zoneIndex, idx, start:p, original: clone(zone.pts[idx]) };
    renderLayoutSvg(svg); renderLayoutSection(); renderLayoutInspector();
  }
  function startEdgeDrag(e, zoneId, a, b){
    if(appState.editor.mode !== 'select' || appState.editor.zonesLocked) return;
    e.stopPropagation();
    const svg = $('#layoutSvg'); const p = svgPoint(e, svg);
    const zone = findZoneById(zoneId);
    if(!zone) return;
    const zoneIndex = (appState.layout?.zones || []).findIndex(z => z === zone);
    appState.selectedZoneId = zoneId;
    appState.selectedEdge = { zoneId, a, b };
    appState.selectedRackLayoutId = '';
    appState.selectedWallId = '';
    appState.selectedOpeningId = '';
    closeStackMenu();
    appState.editor.dragging = { type:'edge', zoneId, zoneIndex, a, b, start:p, originalA: clone(zone.pts[a]), originalB: clone(zone.pts[b]) };
    renderLayoutSvg(svg); renderLayoutSection(); renderLayoutInspector();
  }
  function startSectionGuideDrag(e, axis, source='line'){
    if(!appState.editor.sectionVisible) return;
    e.stopPropagation();
    const zone = findZoneById(appState.selectedZoneId) || appState.layout.zones[0];
    if(!zone) return;
    const svg = $('#layoutSvg'); const p = svgPoint(e, svg);
    appState.editor.dragging = { type:'section-guide', axis, zoneId:zone.id, start:p, moved:false, source };
  }

  function startRackDrag(e, rackId){
    if(appState.editor.mode !== 'select') return;
    e.stopPropagation();
    const rack = findRackById(rackId);
    if(!rack) return;
    closeStackMenu();
    if(e.shiftKey){
      toggleRackSelection(rackId);
      appState.selectedZoneId = rack.zoneId;
      const activeSvg = document.getElementById('layoutSvg');
      renderLayoutSvg(activeSvg); renderLayoutSection(); renderLayoutInspector();
      return;
    }
    setSelectedRackIds([rackId]);
    const svg = $('#layoutSvg'); const p = svgPoint(e, svg);
    const cx = rack.x + rack.w/2, cy = rack.y + rack.h/2;
    appState.selectedZoneId = rack.zoneId;
    appState.selectedWallId = '';
    appState.selectedOpeningId = '';
    appState.editor.dragging = { type:'rack', rackId, start:p, original: { x:rack.x, y:rack.y, cx, cy, zoneId:rack.zoneId } };
    renderLayoutSvg(svg); renderLayoutSection(); renderLayoutInspector();
  }

  function handleLayoutMove(e){
    const svg = $('#layoutSvg'); const p = svgPoint(e, svg);
    const d = appState.editor.dragging;
    if(!d && !appState.editor?.dragSelect?.active) return;
    if(d && d.type === 'pan-layout'){
      const rect = svg.getBoundingClientRect();
      const vb = d.originalViewBox || appState.editor.viewBox || { x:0, y:0, w:900, h:620 };
      const scaleX = vb.w / Math.max(1, rect.width);
      const scaleY = vb.h / Math.max(1, rect.height);
      const dxClient = e.clientX - d.startClient.x;
      const dyClient = e.clientY - d.startClient.y;
      appState.editor.viewBox = {
        x: vb.x - dxClient * scaleX,
        y: vb.y - dyClient * scaleY,
        w: vb.w,
        h: vb.h
      };
      renderLayoutSvg(svg); renderLayoutSection();
      return;
    }
    if(appState.editor?.dragSelect?.active){
      updateDragSelection(p);
      renderLayoutSvg(svg); renderLayoutSection();
      return;
    }
    const dx = snapGrid(p.x - d.start.x), dy = snapGrid(p.y - d.start.y);
    if(d.type === 'zone'){
      const zone = dragZoneFromState(d);
      if(!zone) return;
      zone.pts = d.original.map(pt => ({ x: snapGrid(pt.x + dx), y: snapGrid(pt.y + dy) }));
      const racks = appState.layout.racks.filter(r => r.zoneId === zone.id);
      racks.forEach((r, i) => {
        const base = d.racks[i] || { x:r.x, y:r.y };
        r.x = snapGrid(base.x + dx);
        r.y = snapGrid(base.y + dy);
      });
      clearRackSnapPreview();
      renderLayoutSvg(svg); renderLayoutSection();
    } else if(d.type === 'vertex'){
      const zone = dragZoneFromState(d);
      if(!zone) return;
      const lockAxis = e.shiftKey ? (Math.abs(p.x - d.start.x) >= Math.abs(p.y - d.start.y) ? 'x' : 'y') : null;
      const snapped = snapPointAdvanced(p, { zoneId:d.zoneId, keepAxis:lockAxis, origin:d.original });
      clearRackSnapPreview();
      zone.pts[d.idx] = { x:snapped.x, y:snapped.y }; pickNearestEdge(snapped); renderLayoutSvg(svg); renderLayoutSection();
    } else if(d.type === 'edge'){
      const zone = dragZoneFromState(d);
      if(!zone) return;
      const a0 = d.originalA, b0 = d.originalB;
      const horizontal = Math.abs(a0.y - b0.y) <= Math.abs(a0.x - b0.x);
      if(horizontal){
        const ny = snapGrid(a0.y + dy);
        zone.pts[d.a].y = ny; zone.pts[d.b].y = ny;
      } else {
        const nx = snapGrid(a0.x + dx);
        zone.pts[d.a].x = nx; zone.pts[d.b].x = nx;
      }
      clearRackSnapPreview();
      appState.selectedEdge = { zoneId:d.zoneId, a:d.a, b:d.b };
      renderLayoutSvg(svg); renderLayoutSection();
    } else if(d.type === 'section-guide'){
      const zone = findZoneById(d.zoneId) || appState.layout.zones[0];
      if(zone){
        if(d.source === 'range') updateSectionRangeFromPoint(zone, d.axis, p);
        else updateSectionCutFromPoint(zone, d.axis, p);
        clearRackSnapPreview();
        d.moved = true;
        renderLayoutSvg(svg); renderLayoutSection();
      }
    } else if(d.type === 'opening'){
      const opening = findOpeningById(d.openingId);
      if(!opening) return;
      if(d.mode === 'resize-start') resizeOpeningFromPoint(opening, p, 'start');
      else if(d.mode === 'resize-end') resizeOpeningFromPoint(opening, p, 'end');
      else setOpeningPositionFromPoint(opening, p);
      clearRackSnapPreview();
      renderLayoutSvg(svg); renderLayoutSection(); renderLayoutInspector();
    } else if(d.type === 'rack'){
      const rack = findRackById(d.rackId);
      const rawDX = p.x - d.start.x;
      const rawDY = p.y - d.start.y;
      const ncx = d.original.cx + rawDX;
      const ncy = d.original.cy + rawDY;
      rack.x = ncx - rack.w/2;
      rack.y = ncy - rack.h/2;
      const center = { x:ncx, y:ncy };
      const currentZone = findZoneById((d.original && d.original.zoneId) || rack.zoneId);
      const targetZone = (appState.layout.zones||[]).find(z => pointInPoly(center, z.pts) && rackCorners(rack).every(pt => pointInPoly(pt, z.pts) || pointNearPolygonEdge(pt, z.pts, 1)));
      const host = targetZone || currentZone || nearestZoneForPoint(center);
      if(host){ keepRackSnapped(rack, host); rack.zoneId = host.id; }
      if(host && !rackFullyInsideZone(rack, host) && d.original){ rack.x = d.original.x; rack.y = d.original.y; rack.zoneId = d.original.zoneId; }
      renderLayoutSvg(svg); renderLayoutSection();
    }
  }
  function stopEditorDrag(){
    if(appState.editor?.dragSelect?.active){
      commitDragSelection();
      persistActiveLayout();
      if(appState.screen==='layout') renderLayoutEditor();
      return;
    }
    const d = appState.editor.dragging;
    const svg = $('#layoutSvg');
    if(svg) svg.style.cursor = '';
    if(d && d.type==='section-guide'){
      const zone = findZoneById(d.zoneId) || appState.layout.zones[0];
      if(zone && d.source === 'arrow' && !d.moved){
        const cut = getSectionCut(d.axis, zone);
        cut.dir *= -1;
      }
    }
    if(d && d.type==='rack'){
      const rack = findRackById(d.rackId);
      if(rack){
        const center = { x:rack.x + rack.w/2, y:rack.y + rack.h/2 };
        const originalZone = findZoneById((d.original && d.original.zoneId) || rack.zoneId) || findZoneById(rack.zoneId);
        const targetZone = (appState.layout.zones||[]).find(z=>pointInPoly(center, z.pts));
        const host = targetZone || originalZone || nearestZoneForPoint(center) || findZoneById(rack.zoneId);
        if(host){
          const previousZoneId = (d.original && d.original.zoneId) || rack.zoneId;
          if(targetZone && previousZoneId !== host.id) assignRackToZone(rack, host.id);
          else rack.zoneId = host.id;
          keepRackSnapped(rack, host);
          if(!rackFullyInsideZone(rack, host) && d.original){ rack.x = d.original.x; rack.y = d.original.y; rack.zoneId = previousZoneId; }
        }
      }
      normalizeZoneAndRackIds();
    }
    if(d && d.type==='zone'){ normalizeZoneAndRackIds(); }
    clearRackSnapPreview();
    appState.editor.dragging = null;
    persistActiveLayout();
    if(appState.screen==='layout') renderLayoutEditor();
  }

  function renderLayoutInspector(){
    const mount = $('#layoutSidebarInspector'); if(!mount) return;
    const headerMount = $('#layoutHeaderCards');
    const zone = findZoneById(appState.selectedZoneId);
    const rack = findRackById(appState.selectedRackLayoutId);
    const zoneOpen = !!appState.editor?.inspectorZoneOpen;
    const rackPropsOpen = !!appState.editor?.rackPropsOpen;
    const stackOpen = !!appState.editor?.inspectorStackOpen;
    const sectionOpen = !!appState.editor?.inspectorSectionOpen;
    const stack = rack ? rackStackSummary(rack) : { count:0, isStacked:false, members:[] };
    const selectedRackModel = rack ? rackModel(rack.modelId) : null;
    const selectedRackFootprint = rack ? getRackFootprint(rack.modelId, rack.rot || 0) : null;
    const edgeWallCtx = getSelectedEdgeWallContext();

    if(headerMount){
      headerMount.innerHTML = `
        ${zoneOpen ? `
        <div class="layout-header-card">
          <div class="layout-tool-group">
            <div class="layout-tool-group-title">Propiedades de zona</div>
            ${!zone ? `<div class="empty" style="padding:14px 8px"><b>Sin zona seleccionada</b><div class="muted tiny" style="margin-top:8px">Selecciona una zona para abrir sus propiedades de edición.</div></div>` : `
            <div class="grid">
              <label class="tiny muted">Nombre visible de la zona</label>
              <input id="insZoneName" value="${zone.name}">
              <label class="tiny muted">Nomenclatura / código de zona</label>
              <input id="insZoneCode" value="${zone.id}" placeholder="Ej: Z1, Z2, ALM, A" />
              <div class="two">
                <div>
                  <label class="tiny muted">Color</label>
                  <input id="insZoneColor" type="color" value="${zone.color}" style="height:44px;padding:6px">
                  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${ZONE_COLOR_PALETTE.map(color => `<button type="button" data-zone-swatch="${color}" title="${color}" style="width:26px;height:26px;border-radius:999px;border:${String(zone.color||'').toLowerCase()===String(color).toLowerCase()?'2px solid #ffffff':'1px solid rgba(255,255,255,.24)'};background:${color};cursor:pointer"></button>`).join('')}</div>
                </div>
                <div><label class="tiny muted">Vértices</label><div class="chip">${zone.pts.length}</div></div>
              </div>
              <div class="three"><div><label class="tiny muted">Ancho</label><input value="${formatDistanceShort(zoneBounds(zone).maxX-zoneBounds(zone).minX)}" disabled></div><div><label class="tiny muted">Alto</label><input value="${formatDistanceShort(zoneBounds(zone).maxY-zoneBounds(zone).minY)}" disabled></div><div><label class="tiny muted">Racks</label><input value="${appState.layout.racks.filter(r=>r.zoneId===zone.id).length}" disabled></div></div>
              <div><label class="tiny muted">Escala cm/u</label><input id="insScaleCm" type="number" min="0.1" step="0.1" value="${getScaleCmPerUnit()}"></div>
            </div>`}
          </div>
        </div>` : ''}
        ${rackPropsOpen ? `
        <div class="layout-header-card">
          <div class="layout-tool-group">
            <div class="layout-tool-group-title">Propiedades de rack</div>
            ${!rack ? `
              <div class="tiny muted" style="padding:6px 4px 2px">Selecciona un rack para editar su modelo, altura y rotación desde aquí.</div>
            ` : `
              <label class="tiny muted">Modelo de rack</label>
              <div class="rack-model-picker" id="sideRackModelPicker" data-picker-mode="viewer">
                <input id="sideRackModel" type="hidden" value="${rack.modelId}">
                <button type="button" id="sideRackModelTrigger" class="seg-btn rack-model-picker-trigger"><span>${escapeHtml((rackModel(rack.modelId)||{}).name || rack.modelId || 'Seleccionar modelo')}</span><span class="rack-model-picker-caret">▾</span></button>
                <div class="rack-model-picker-menu" id="sideRackModelMenu">
                  <div class="rack-model-picker-list">
                    ${appState.models.map(m => `<button type="button" class="rack-model-option ${m.id===rack.modelId?'active':''}" data-rack-model-option="${m.id}" title="${escapeHtml(m.name)}"><span class="rack-model-option-name">${escapeHtml(m.name)}</span></button>`).join('')}
                  </div>
                </div>
                <div class="rack-model-fixed-viewer">
                  <div class="tiny muted">Visor del modelo</div>
                  <div class="rack-model-fixed-viewer-layout">
                    <div class="rack-model-mini-stage"><svg id="sideRackModelViewerSvg" viewBox="0 0 320 260"></svg></div>
                    <div class="rack-model-mini-meta">
                      <div class="mini-field">
                        <label class="tiny muted">Rotación</label>
                        <input id="sideRackRot" type="number" step="1" value="${Math.round(Number(rack.rot || 0))}">
                      </div>
                      <div class="mini-field">
                        <label class="tiny muted">Nivel apilado</label>
                        <input id="sideRackStackLevel" type="number" min="0" step="1" value="${getRackStackLevel(rack)}">
                      </div>
                      <div class="mini-field">
                        <label class="tiny muted">Altura base</label>
                        <input id="sideRackBaseH" type="number" min="0" step="10" value="${Math.round(Number(rack.baseHeight || 0))}" disabled>
                      </div>
                      <div class="mini-field">
                        <label class="tiny muted">Altura rack</label>
                        <input id="sideRackHeight" type="number" min="60" step="10" value="${Math.round(Number(rack.rackHeight || selectedRackModel?.height || 238))}">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ${isUnderStairsStyle(selectedRackModel?.style) ? `
              <div class="layout-inline-3" style="grid-template-columns:repeat(3,minmax(0,1fr))">
                <div>
                  <label class="tiny muted">Lateral 1</label>
                  <input id="sideRackLeftHeight" type="number" min="40" step="1" value="${Math.round(Number(selectedRackModel?.leftHeight || selectedRackModel?.height || 240))}">
                </div>
                <div>
                  <label class="tiny muted">Lateral 2</label>
                  <input id="sideRackRightHeight" type="number" min="20" step="1" value="${Math.round(Number(selectedRackModel?.rightHeight || Math.max(40, (selectedRackModel?.height||240)*0.35)))}">
                </div>
                <div>
                  <label class="tiny muted">Largo top</label>
                  <input id="sideRackTopLength" type="number" min="8" step="1" value="${Math.round(Number(selectedRackModel?.topLength || clampUnderStairsTopLength(selectedRackModel)))}">
                </div>
              </div>` : ''}
              <div class="layout-inline-2">
                <div class="kv-row" style="padding:10px 12px"><b>Vista sección</b><span>${appState.editor.sectionVisible ? 'Activa' : 'Oculta'}</span></div>
                <div class="kv-row" style="padding:10px 12px"><b>Cota superior</b><span>${formatDistanceCm((Number(rack.baseHeight||0) + Number(rack.rackHeight || selectedRackModel?.height || 238)))}</span></div>
              </div>
              <div class="layout-inline-3" style="grid-template-columns:repeat(3,minmax(0,1fr))">
                <div class="kv-row" style="padding:10px 12px"><b>Ancho</b><span>${formatDistanceShort(selectedRackFootprint?.baseW || 0)}</span></div>
                <div class="kv-row" style="padding:10px 12px"><b>Fondo</b><span>${formatDistanceShort(selectedRackFootprint?.baseH || 0)}</span></div>
                <div class="kv-row" style="padding:10px 12px"><b>Zona</b><span>${escapeHtml(rack.zoneId)}</span></div>
              </div>
              <div class="layout-inline-2">
                <button class="seg-btn" id="btnAddRackAbove">Agregar encima</button>
                <div class="kv-row" style="padding:10px 12px"><b>Seleccionados</b><span>${getSelectedRackIds().length || 0}</span></div>
              </div>
              <div class="kv-row" style="padding:10px 12px"><b>Referencia visual</b><span>Línea naranja = frente del rack · N = nivel</span></div>
            `}
          </div>
        </div>` : ''}`;
    }

    mount.innerHTML = `
      ${edgeWallCtx ? `
      <div class="layout-tool-group" style="margin-top:2px">
        <div class="layout-tool-group-title">Arista seleccionada</div>
        <div class="grid">
          <div class="kv-row"><b>Zona</b><span>${escapeHtml(edgeWallCtx.zone.id)}</span></div>
          <div class="kv-row"><b>Arista</b><span>${edgeWallCtx.edgeIndex + 1}</span></div>
          <div class="kv-row"><b>Largo</b><span>${formatDistanceShort(edgeWallCtx.length)}</span></div>
          <div class="kv-row"><b>Estado</b><span>${edgeWallCtx.isWall ? 'Pared activa' : 'Solo arista'}</span></div>
          <div class="two">
            <button class="seg-btn ${edgeWallCtx.isWall ? 'active' : ''}" id="btnEdgeMakeWall">${edgeWallCtx.isWall ? 'Actualizar pared' : 'Convertir en pared'}</button>
            <button class="seg-btn" id="btnEdgeRemoveWall" ${edgeWallCtx.isWall ? '' : 'disabled'}>Quitar pared</button>
          </div>
          <div class="two">
            <label class="layout-mini-field">Espesor<input id="edgeWallThickness" type="number" min="8" max="80" step="1" value="${Math.round(Number(edgeWallCtx.wall?.thickness || getZoneWallThickness(edgeWallCtx.zone) || 14))}"></label>
            <label class="layout-mini-field">Altura 3D<input id="edgeWallHeight" type="number" min="120" max="600" step="10" value="${Math.round(Number(edgeWallCtx.wall?.height || appState.layout?.meta?.defaultWallHeight || 290))}"></label>
          </div>
          <div class="two">
            <button class="seg-btn" id="btnEdgeAddDoor">${edgeWallCtx.isWall ? 'Agregar puerta' : 'Crear pared + puerta'}</button>
            <button class="seg-btn" id="btnEdgeAddWindow">${edgeWallCtx.isWall ? 'Agregar ventana' : 'Crear pared + ventana'}</button>
          </div>
          <div class="tiny muted">Selecciona una arista y agrega el vano directamente. Si todavía no es pared, se convierte automáticamente.</div>
        </div>
      </div>` : ''}
      ${stackOpen ? `
      <div class="layout-tool-group" style="margin-top:2px">
        <div class="layout-tool-group-title">Superposición / pila</div>
        ${!rack ? `<div class="empty" style="padding:14px 8px"><b>Sin rack seleccionado</b><div class="muted tiny" style="margin-top:8px">Selecciona un rack para revisar si comparte huella con otros racks.</div></div>` : `
        <div class="grid">
          <div class="kv-row"><b>Estado</b><span>${stack.isStacked ? 'Apilado' : 'Individual'}</span></div>
          <div class="kv-row"><b>Cantidad en pila</b><span>${stack.count}</span></div>
          <div class="kv-row"><b>Nivel activo</b><span>N${getRackStackLevel(rack)}</span></div>
          <div class="kv-row"><b>Rack activo</b><span>${escapeHtml(rack.id)}</span></div>
          <div class="kv-row"><b>Huella compartida</b><span>${escapeHtml(rack.zoneId)} · (${Math.round(rack.x)}, ${Math.round(rack.y)})</span></div>
          ${stack.isStacked ? `<div style="display:grid;gap:8px">${stack.members.map(member => `<button type="button" class="seg-btn stack-ins-btn ${member.id===rack.id?'active':''}" data-stack-ins-rack="${member.id}" style="text-align:left;padding:10px 12px">N${getRackStackLevel(member)} · ${escapeHtml(member.id)} · ${escapeHtml(rackModel(member.modelId).name)}</button>`).join('')}</div>` : `<div class="tiny muted">Este rack no comparte su base con otros racks.</div>`}
          <div class="two">
            <button class="seg-btn" id="insAddRackAbove">Agregar encima</button>
            <button class="seg-btn" id="insOpenStackMenu" ${stack.isStacked ? '' : 'disabled'}>Ver selector flotante</button>
          </div>
          <div class="two">
            <button class="seg-btn" id="insCloseStackMenu">Ocultar selector</button>
            <div class="tiny muted" style="display:flex;align-items:center;justify-content:flex-end">Solo el mismo nivel bloquea colisión XY</div>
          </div>
        </div>`}
      </div>` : ''}
      ${sectionOpen ? `
      <div class="layout-tool-group" style="margin-top:2px">
        <div class="layout-tool-group-title">Propiedades de sección</div>
        <div class="grid">
          <div class="two">
            <div><label class="tiny muted">Corte X</label><div class="chip">${getSectionCut('x').dir===1 ? 'hacia derecha' : 'hacia izquierda'}</div></div>
            <div><label class="tiny muted">Corte Y</label><div class="chip">${getSectionCut('y').dir===1 ? 'hacia abajo' : 'hacia arriba'}</div></div>
          </div>
          <div class="two">
            <div><label class="tiny muted">Rango X (u)</label><input id="insSectionRangeX" type="number" min="10" max="2000" step="1" value="${Math.round((getSectionCut('x').depth || 100))}"></div>
            <div><label class="tiny muted">Rango Y (u)</label><input id="insSectionRangeY" type="number" min="10" max="2000" step="1" value="${Math.round((getSectionCut('y').depth || 100))}"></div>
          </div>
          <div class="kv-row"><b>Comportamiento</b><span>Solo se abre manualmente desde el icono de desplegar</span></div>
        </div>
      </div>` : ''}`;

    if($('#btnEdgeMakeWall')) $('#btnEdgeMakeWall').onclick = () => {
      const thickness = Math.max(8, Math.min(80, Number($('#edgeWallThickness')?.value || 14) || 14));
      const height = Math.max(120, Math.min(600, Number($('#edgeWallHeight')?.value || 290) || 290));
      convertSelectedEdgeToWall({ thickness, height });
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#btnEdgeRemoveWall')) $('#btnEdgeRemoveWall').onclick = () => {
      const ctx = getSelectedEdgeWallContext();
      if(!ctx) return;
      removeZoneEdgeWall(ctx.zone, ctx.edgeIndex);
      appState.selectedWallId = '';
      syncZonePerimeterWalls();
      cleanupDetachedOpenings();
      persistActiveLayout();
      renderLayoutEditor();
    };
    const addOpeningFromSelectedEdge = (type='door') => {
      const ctx = getSelectedEdgeWallContext();
      if(!ctx) return;
      if(!ctx.isWall){
        setZoneEdgeWall(ctx.zone, ctx.edgeIndex, { thickness:Math.max(8, Math.min(80, Number($('#edgeWallThickness')?.value || 14) || 14)), height:Math.max(120, Math.min(600, Number($('#edgeWallHeight')?.value || 290) || 290)) });
        syncZonePerimeterWalls();
      }
      const wallId = zoneEdgeWallId(ctx.zone.id, ctx.edgeIndex);
      createOpeningOnWall(wallId, type);
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#btnEdgeAddDoor')) $('#btnEdgeAddDoor').onclick = () => addOpeningFromSelectedEdge('door');
    if($('#btnEdgeAddWindow')) $('#btnEdgeAddWindow').onclick = () => addOpeningFromSelectedEdge('window');
    if($('#edgeWallThickness')) $('#edgeWallThickness').onchange = e => {
      const ctx = getSelectedEdgeWallContext();
      if(!ctx?.isWall) return;
      setZoneEdgeWall(ctx.zone, ctx.edgeIndex, { thickness:Math.max(8, Math.min(80, Number(e.target.value || 14) || 14)) });
      syncZonePerimeterWalls();
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#edgeWallHeight')) $('#edgeWallHeight').onchange = e => {
      const ctx = getSelectedEdgeWallContext();
      if(!ctx?.isWall) return;
      setZoneEdgeWall(ctx.zone, ctx.edgeIndex, { height:Math.max(120, Math.min(600, Number(e.target.value || 290) || 290)) });
      syncZonePerimeterWalls();
      persistActiveLayout();
      renderLayoutEditor();
    };

    if($('#insZoneName')) {
      $('#insZoneName').oninput = e => { zone.name = e.target.value; };
      $('#insZoneName').onchange = () => { persistActiveLayout(); renderLayoutEditor(); };
    }
    if($('#insZoneCode')) {
      const commitZoneCode = (value) => {
        const previous = zone.id;
        const updated = renameZoneId(previous, value);
        const el = $('#insZoneCode');
        if(el) el.value = updated;
        renderLayoutEditor();
      };
      $('#insZoneCode').onchange = e => commitZoneCode(e.target.value);
      $('#insZoneCode').onblur = e => commitZoneCode(e.target.value);
    }
    if($('#insZoneColor')) $('#insZoneColor').oninput = e => { zone.color = e.target.value; persistActiveLayout(); renderLayoutEditor(); };
    $$('[data-zone-swatch]').forEach(btn => btn.onclick = () => { zone.color = btn.getAttribute('data-zone-swatch') || zone.color; persistActiveLayout(); renderLayoutEditor(); });
    if($('#insScaleCm')) $('#insScaleCm').onchange = e => { ensureLayoutMeta(); appState.layout.meta.scaleCmPerUnit = Math.max(0.1, Number(e.target.value || 1) || 1); persistActiveLayout(); renderLayoutEditor(); };
    if($('#sideRackModel')) $('#sideRackModel').onchange = e => { if(!rack) return; const oldDefault = rackModel(rack.modelId).height || 238; const prevHeight = Number(rack.rackHeight || oldDefault); rack.modelId = e.target.value; const newDefault = rackModel(rack.modelId).height || 238; if(!Number.isFinite(prevHeight) || Math.abs(prevHeight - oldDefault) < 1) rack.rackHeight = newDefault; syncRackFootprint(rack, true); const host=findZoneById(rack.zoneId); if(host){ keepRackSnapped(rack, host); } persistActiveLayout(); renderLayoutEditor(); };
    initSideRackModelPicker(rack);
    if($('#sideRackRot')) {
      const applySideRotation = (value) => {
        if(!rack) return;
        rack.rot = normalizeAngle(Number(value || 0) || 0);
        syncRackFootprint(rack, true);
        const host = findZoneById(rack.zoneId);
        if(host) keepRackSnapped(rack, host);
        persistActiveLayout();
        renderLayoutEditor();
      };
      $('#sideRackRot').oninput = e => { if(!rack) return; rack.rot = Number(e.target.value || 0) || 0; };
      $('#sideRackRot').onchange = e => applySideRotation(e.target.value);
      $('#sideRackRot').onblur = e => applySideRotation(e.target.value);
    }
    if($('#insRackBaseH')) {
      $('#insRackBaseH').oninput = e => { rack.baseHeight = Math.max(0, Number(e.target.value || 0) || 0); };
      $('#insRackBaseH').onchange = e => { rack.baseHeight = Math.max(0, Number(e.target.value || 0) || 0); persistActiveLayout(); renderLayoutEditor(); };
    }
    if($('#sideRackBaseH')) {
      $('#sideRackBaseH').oninput = e => { if(!rack) return; rack.baseHeight = Math.max(0, Number(e.target.value || 0) || 0); };
      $('#sideRackBaseH').onchange = e => { if(!rack) return; rack.baseHeight = Math.max(0, Number(e.target.value || 0) || 0); persistActiveLayout(); renderLayoutEditor(); };
    }
    if($('#sideRackStackLevel')) {
      $('#sideRackStackLevel').oninput = e => { if(!rack) return; rack.stackLevel = Math.max(0, parseInt(e.target.value || 0, 10) || 0); recalcAllRackStackHeights(); };
      $('#sideRackStackLevel').onchange = e => { if(!rack) return; rack.stackLevel = Math.max(0, parseInt(e.target.value || 0, 10) || 0); recalcAllRackStackHeights(); persistActiveLayout(); renderLayoutEditor(); };
    }
    if($('#insRackHeight')) {
      $('#insRackHeight').oninput = e => { rack.rackHeight = Math.max(60, Number(e.target.value || 0) || 60); };
      $('#insRackHeight').onchange = e => { rack.rackHeight = Math.max(60, Number(e.target.value || 0) || 60); persistActiveLayout(); renderLayoutEditor(); };
    }
    if($('#sideRackHeight')) {
      $('#sideRackHeight').oninput = e => { if(!rack) return; rack.rackHeight = Math.max(60, Number(e.target.value || 0) || 60); };
      $('#sideRackHeight').onchange = e => { if(!rack) return; rack.rackHeight = Math.max(60, Number(e.target.value || 0) || 60); persistActiveLayout(); renderLayoutEditor(); };
    }
    const syncSelectedUnderStairsModel = () => {
      if(!rack) return;
      const model = rackModel(rack.modelId);
      if(!model || normalizeRackStyle(model.style) !== 'under_stairs') return;
      if($('#sideRackLeftHeight')) model.leftHeight = Math.max(40, Number($('#sideRackLeftHeight').value || model.leftHeight || model.height || 240) || 240);
      if($('#sideRackRightHeight')) model.rightHeight = Math.max(20, Number($('#sideRackRightHeight').value || model.rightHeight || Math.max(40, (model.height||240)*0.35)) || Math.max(40, (model.height||240)*0.35));
      if($('#sideRackTopLength')) model.topLength = Math.max(8, Number($('#sideRackTopLength').value || model.topLength || clampUnderStairsTopLength(model)) || clampUnderStairsTopLength(model));
      model.mirrored = false;
      model.topLength = clampUnderStairsTopLength(model);
      persistActiveLayout();
      renderLayoutEditor();
    };
    if($('#sideRackLeftHeight')) { $('#sideRackLeftHeight').oninput = syncSelectedUnderStairsModel; $('#sideRackLeftHeight').onchange = syncSelectedUnderStairsModel; }
    if($('#sideRackRightHeight')) { $('#sideRackRightHeight').oninput = syncSelectedUnderStairsModel; $('#sideRackRightHeight').onchange = syncSelectedUnderStairsModel; }
    if($('#sideRackTopLength')) { $('#sideRackTopLength').oninput = syncSelectedUnderStairsModel; $('#sideRackTopLength').onchange = syncSelectedUnderStairsModel; }
    if($('#insSectionRangeX')) $('#insSectionRangeX').onchange = e => { setSectionCutDepth('x', Math.max(10, Number(e.target.value||10)||10)); persistActiveLayout(); renderLayoutEditor(); };
    if($('#insSectionRangeY')) $('#insSectionRangeY').onchange = e => { setSectionCutDepth('y', Math.max(10, Number(e.target.value||10)||10)); persistActiveLayout(); renderLayoutEditor(); };
    $$('.quick-angle').forEach(btn => btn.onclick = () => { if(!rack) return; rack.rot = normalizeAngle((Number(rack.rot || 0) || 0) + (Number(btn.dataset.angle||0)||0)); syncRackFootprint(rack, true); const host=findZoneById(rack.zoneId); if(host){ keepRackSnapped(rack, host); } persistActiveLayout(); renderLayoutEditor(); });
    $$('.quick-zone-angle').forEach(btn => btn.onclick = () => { const zoneId = appState.selectedZoneId; if(!zoneId) return; rotateZoneWithContents(zoneId, Number(btn.dataset.angle || 0) || 0); });
    $$('.rotate-step').forEach(btn => btn.onclick = () => { if(!rack) return; rack.rot = normalizeAngle((Number(rack.rot || 0) || 0) + (Number(btn.dataset.step || 0) || 0)); syncRackFootprint(rack, true); const host=findZoneById(rack.zoneId); if(host){ keepRackSnapped(rack, host); } persistActiveLayout(); renderLayoutEditor(); });
    if($('#insDupRack')) $('#insDupRack').onclick = () => { if(!rack) return; duplicateRackLayout(rack.id); };
    if($('#insDupZone')) $('#insDupZone').onclick = () => { if(zone) duplicateZone(zone.id); else if(rack) duplicateZone(rack.zoneId); };
    document.querySelectorAll('[data-stack-ins-rack]').forEach(btn => btn.onclick = () => {
      const target = findRackById(btn.getAttribute('data-stack-ins-rack'));
      if(!target) return;
      appState.selectedRackLayoutId = target.id;
      appState.selectedZoneId = target.zoneId;
      renderLayoutEditor();
    });
    if($('#insOpenStackMenu')) $('#insOpenStackMenu').onclick = () => { if(!rack) return; openStackMenuForRack(rack.id); renderLayoutStackMenu(); };
    if($('#insCloseStackMenu')) $('#insCloseStackMenu').onclick = () => { closeStackMenu(); renderLayoutStackMenu(); };
    if($('#insAddRackAbove')) $('#insAddRackAbove').onclick = () => { if(!rack) return; duplicateRackAbove(rack.id); };
    if($('#btnAddRackAbove')) $('#btnAddRackAbove').onclick = () => { if(!rack) return; duplicateRackAbove(rack.id); };
  }

  function resetRackPreviewCamera(){
    if(!appState.ui) appState.ui = {};
    appState.ui.rackPreviewCamera = null;
  }


  function rerenderRackEditorPreservingState(options = {}){
    const main = document.querySelector('.rack-models-main');
    const list = document.getElementById('modelsList');
    const mainScroll = main ? main.scrollTop : 0;
    const listScroll = list ? list.scrollTop : 0;

    renderModelsList();
    renderRackModelPreview();
    if(window.contentFootRight) contentFootRight.textContent = `${appState.models.length} modelos`;

    requestAnimationFrame(() => {
      const nextMain = document.querySelector('.rack-models-main');
      const nextList = document.getElementById('modelsList');
      if(nextMain){
        const maxMainScroll = Math.max(0, nextMain.scrollHeight - nextMain.clientHeight);
        nextMain.scrollTop = Math.min(Math.max(0, mainScroll), maxMainScroll);
      }
      if(nextList){
        const maxListScroll = Math.max(0, nextList.scrollHeight - nextList.clientHeight);
        nextList.scrollTop = Math.min(Math.max(0, listScroll), maxListScroll);
      }
    });
  }

  async function switchViewerBranch(branchIndex){
    const index = Number(branchIndex);
    if(!Number.isFinite(index)) return;
    await activateBranchSelection(index);
    loadLayoutForBranch(index);
    if(Array.isArray(appState.filtered) && appState.filtered.length){
      const preferred = appState.selectedProduct && appState.filtered.find(p => p.sku === appState.selectedProduct.sku && p.ubicacion === appState.selectedProduct.ubicacion);
      appState.selectedProduct = preferred || appState.filtered[0];
      appState.selectedRack = appState.selectedProduct?.rack || appState.selectedProduct?.rackStore || ''; 
      appState.selectedRackLayoutId = appState.selectedRack;
    } else {
      appState.selectedProduct = null;
      appState.selectedRack = appState.layout?.racks?.[0]?.id || ''; 
      appState.selectedRackLayoutId = appState.selectedRack;
    }
    renderProducts(appState.filtered || []);
    renderMapView();
  }

  function renderRackModels(){
    if(!(appState.history?.racks?.undoStack?.length)) recordHistorySnapshot('racks');
    const previousScreen = appState.screen;
    appState.screen = 'racks';
    if(previousScreen !== 'racks') resetRackPreviewCamera();
    contentTitle.textContent = 'Edición de Rack';
    contentSubtitle.textContent = 'Diseña modelos reutilizables de rack, sus niveles y su preview técnico.';
    detailTitle.textContent = 'Preview del modelo';
    detailSubtitle.textContent = 'Arrastra para mover y usa la rueda para acercar o alejar.';
    setTags([
      { label:'↶ Undo', active:true, action:'history-undo-racks', extraClass:'history-chip' },
      { label:'↷ Redo', active:true, action:'history-redo-racks', extraClass:'history-chip' },
      'modelos', 'niveles', 'preview', 'biblioteca'
    ]);

    if (!Array.isArray(appState.models) || !appState.models.length){
      appState.models = [
        { id:'std_4', name:'Rack estándar 4 niveles', levels:4, width:120, depth:40, height:240, clearance:0, style:'metallic', slots:2, beam:2 },
        { id:'wide_5', name:'Rack ancho 5 niveles', levels:5, width:172, depth:90, height:270, clearance:0, style:'wide', slots:2, beam:2 },
        { id:'compact_3', name:'Rack compacto 3 niveles', levels:3, width:132, depth:76, height:200, clearance:0, style:'melamine', slots:2, beam:2 }
      ];
      saveRackModels();
    }
    if (!Array.isArray(appState.ui.rackLibraryOpenIds)) appState.ui.rackLibraryOpenIds = [];
    if (!Array.isArray(appState.ui.rackLibraryLevelsOpenIds)) appState.ui.rackLibraryLevelsOpenIds = [];
    if (!appState.selectedModelId || !appState.models.some(m => m.id === appState.selectedModelId)){
      appState.selectedModelId = appState.models[0].id;
    }
    
    const active = rackModel(appState.selectedModelId) || appState.models[0];

    contentWrap.innerHTML = `
      <div class="rack-models-page">
        <div class="rack-models-main">
          <section class="rack-block">
            <div class="rack-block-head">
              <div>
                <h3>Acciones del modelo</h3>
                <div class="rack-block-sub">Selecciona un modelo desde la biblioteca y edítalo directamente ahí. Los cambios afectan el preview en tiempo real.</div>
              </div>
              <div class="tag-row">
                <span class="tag">Modelo activo</span>
                <span class="tag">${escapeHtml(active?.name || '')}</span>
              </div>
            </div>
            <div class="model-actions">
              <button class="btn" id="btnSaveModel">Guardar modelo</button>
              <button class="btn alt" id="btnNewModel">Nuevo modelo</button>
              <button class="btn alt" id="btnDuplicateModel">Duplicar modelo</button>
              <button class="btn alt" id="btnDeleteModel">Eliminar modelo</button>
            </div>
          </section>

          <section class="rack-block rack-library-editor-block">
            <div class="rack-block-head">
              <div>
                <h3>Biblioteca de modelos</h3>
                <div class="rack-block-sub">Cada modelo tiene su propio editor y su editor de niveles dentro del acordeón.</div>
              </div>
              <div class="tag-row">
                <span class="tag">${appState.models.length} modelos</span>
                <span class="tag">Editor integrado</span>
              </div>
            </div>
            <div id="modelsList" class="model-library library-list model-library-scroll library-master"></div>
          </section>
        </div>

        <aside class="rack-models-side">
          <section class="rack-block preview-box-3d">
            <div class="rack-block-head">
              <div>
                <h3>Preview del modelo</h3>
                <div class="rack-block-sub">Vista grande y centrada para revisar la estructura del modelo activo.</div>
              </div>
            </div>
            <div class="detail-stage is-navigable" id="rackPreviewStage"><svg id="rackModelSvg" viewBox="0 0 520 480"></svg></div>
          </section>
        </aside>
      </div>`;

    detailWrap.innerHTML = '';
    const saveBtn = $('#btnSaveModel');
    if (saveBtn) saveBtn.onclick = saveRackModel;
    if ($('#btnNewModel')) $('#btnNewModel').onclick = createNewRackModelDraft;
    if ($('#btnDuplicateModel')) $('#btnDuplicateModel').onclick = () => duplicateRackModel(appState.selectedModelId);
    if ($('#btnDeleteModel')) $('#btnDeleteModel').onclick = () => deleteRackModel(appState.selectedModelId);
    const undoRackBtn = document.querySelector('[data-history-undo="racks"]'); if(undoRackBtn) undoRackBtn.onclick = () => undoHistory('racks');
    const redoRackBtn = document.querySelector('[data-history-redo="racks"]'); if(redoRackBtn) redoRackBtn.onclick = () => redoHistory('racks');

    renderModelsList();
    renderRackModelPreview();
    updateUndoRedoUi();
    contentStatus.textContent = 'Modo activo: EDICIÓN DE RACK • biblioteca editable, niveles integrados y preview técnico.';
    contentFootRight.textContent = `${appState.models.length} modelos`;
  }

  function renderModelsList(){
    const mount = $('#modelsList');
    if (!mount) return;
    if (!Array.isArray(appState.models)) appState.models = [];
    if (!Array.isArray(appState.ui.rackLibraryOpenIds)) appState.ui.rackLibraryOpenIds = [];
    if (!Array.isArray(appState.ui.rackLibraryLevelsOpenIds)) appState.ui.rackLibraryLevelsOpenIds = [];
    mount.className = 'model-library library-list model-library-scroll';
    const orderedModels = [...appState.models];
    mount.innerHTML = orderedModels.map(m => {
      const open = appState.ui.rackLibraryOpenIds.includes(m.id);
      const levelsOpen = appState.ui.rackLibraryLevelsOpenIds.includes(m.id);
      const levelHeights = buildLevelHeights(m);
      return `
      <div class="library-item ${m.id===appState.selectedModelId?'active':''} ${open?'open':''}" data-mid="${m.id}">
        <div class="library-item-head" data-library-toggle="${m.id}">
          <div class="library-item-left">
            <div class="library-item-title">${escapeHtml(m.name)}</div>
            <div class="library-item-sub">${rackStyleSub(m.style)}</div>
          </div>
          <div class="library-inline-meta">
            <span class="library-inline-pill">${m.levels} niveles</span>
            <span class="library-inline-pill">${m.width}×${m.depth}×${m.height} cm</span>
          </div>
          <span class="tag">${rackStyleLabel(m.style)}</span>
          <button class="library-toggle" type="button" data-library-toggle-btn="${m.id}" aria-label="${open?'Minimizar modelo':'Desplegar modelo'}">${open?'−':'+'}</button>
        </div>
        ${open ? `
        <div class="library-item-body">
          <div class="model-inline-grid-2">
            <div>
              <label class="field-label">Nombre del modelo</label>
              <input data-model-input="name" data-mid="${m.id}" value="${escapeHtml(m.name)}" />
            </div>
            <div>
              <label class="field-label">Tipo</label>
              <select data-model-input="style" data-mid="${m.id}">
                <option value="metallic" ${normalizeRackStyle(m.style)==='metallic'?'selected':''}>Metálico</option>
                <option value="melamine" ${normalizeRackStyle(m.style)==='melamine'?'selected':''}>Melamina</option>
                <option value="under_stairs" ${normalizeRackStyle(m.style)==='under_stairs'?'selected':''}>Bajo escalera</option>
                <option value="under_stairs_reflected" ${normalizeRackStyle(m.style)==='under_stairs_reflected'?'selected':''}>Bajo escalera reflejado</option>
              </select>
            </div>
          </div>
          ${isUnderStairsStyle(m.style) ? `
          <div style="display:grid;gap:12px;margin-top:4px">
            <div style="padding:12px;border:1px solid rgba(212,170,64,.24);border-radius:12px;background:rgba(9,21,36,.45)">
              <div class="tiny muted" style="margin-bottom:8px;font-weight:700;letter-spacing:.02em">DIMENSIONES GENERALES</div>
              <div class="model-inline-grid-4">
                <div><label class="field-label">Largo (cm)</label><input type="number" min="30" step="1" data-model-input="width" data-mid="${m.id}" value="${m.width}" /></div>
                <div><label class="field-label">Ancho (cm)</label><input type="number" min="20" step="1" data-model-input="depth" data-mid="${m.id}" value="${m.depth}" /></div>
                <div><label class="field-label">Alto total (cm)</label><input type="number" min="60" step="1" data-model-input="height" data-mid="${m.id}" value="${m.height}" /></div>
                <div><label class="field-label">Altura desde el piso (cm)</label><input type="number" min="0" max="120" step="1" data-model-input="clearance" data-mid="${m.id}" value="${m.clearance || 0}" /></div>
              </div>
            </div>
            <div style="padding:12px;border:1px solid rgba(212,170,64,.24);border-radius:12px;background:rgba(9,21,36,.45)">
              <div class="tiny muted" style="margin-bottom:8px;font-weight:700;letter-spacing:.02em">ALTURAS Y PENDIENTE</div>
              <div class="model-inline-grid-3" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
                <div><label class="field-label">Altura lateral 1 (cm)</label><input type="number" min="40" step="1" data-model-input="leftHeight" data-mid="${m.id}" value="${Math.round(Number(m.leftHeight || m.height || 240))}" /></div>
                <div><label class="field-label">Altura lateral 2 (cm)</label><input type="number" min="20" step="1" data-model-input="rightHeight" data-mid="${m.id}" value="${Math.round(Number(m.rightHeight || Math.max(40, (m.height||240)*0.35)))}" /></div>
                <div><label class="field-label">Largo top (cm)</label><input type="number" min="8" step="1" data-model-input="topLength" data-mid="${m.id}" value="${Math.round(Number(m.topLength || Math.max(8, Math.min((m.width||180)-8, (m.width||180)*0.33))))}" /></div>
              </div>
              <div class="tiny muted" style="margin-top:8px">El largo top crea un techo horizontal antes de iniciar la pendiente hacia el lateral opuesto.</div>
            </div>
            <div style="padding:12px;border:1px solid rgba(212,170,64,.24);border-radius:12px;background:rgba(9,21,36,.45)">
              <div class="tiny muted" style="margin-bottom:8px;font-weight:700;letter-spacing:.02em">CONFIGURACIÓN DE NIVELES</div>
              <div class="model-inline-grid-4">
                <div><label class="field-label">Niveles</label><input type="number" min="2" max="12" step="1" data-model-input="levels" data-mid="${m.id}" value="${m.levels}" /></div>
                <div><label class="field-label">Slots por nivel</label><input type="number" min="1" max="6" step="1" data-model-input="slots" data-mid="${m.id}" value="${m.slots || m.capacity || 2}" /></div>
                <div></div>
                <div class="library-inline-actions-box"><button class="mini-btn" data-level-toggle="${m.id}">${levelsOpen?'Ocultar niveles':'Editar niveles'}</button></div>
              </div>
            </div>
          </div>` : `
          <div style="display:grid;gap:12px;margin-top:4px">
            <div style="padding:12px;border:1px solid rgba(212,170,64,.24);border-radius:12px;background:rgba(9,21,36,.45)">
              <div class="tiny muted" style="margin-bottom:8px;font-weight:700;letter-spacing:.02em">DIMENSIONES GENERALES</div>
              <div class="model-inline-grid-4">
                <div><label class="field-label">Largo (cm)</label><input type="number" min="30" step="1" data-model-input="width" data-mid="${m.id}" value="${m.width}" /></div>
                <div><label class="field-label">Ancho (cm)</label><input type="number" min="20" step="1" data-model-input="depth" data-mid="${m.id}" value="${m.depth}" /></div>
                <div><label class="field-label">Alto total (cm)</label><input type="number" min="60" step="1" data-model-input="height" data-mid="${m.id}" value="${m.height}" /></div>
                <div><label class="field-label">Altura desde el piso (cm)</label><input type="number" min="0" max="120" step="1" data-model-input="clearance" data-mid="${m.id}" value="${m.clearance || 0}" /></div>
              </div>
            </div>
            <div style="padding:12px;border:1px solid rgba(212,170,64,.24);border-radius:12px;background:rgba(9,21,36,.45)">
              <div class="tiny muted" style="margin-bottom:8px;font-weight:700;letter-spacing:.02em">CONFIGURACIÓN DE NIVELES</div>
              <div class="model-inline-grid-4">
                <div><label class="field-label">Niveles</label><input type="number" min="2" max="12" step="1" data-model-input="levels" data-mid="${m.id}" value="${m.levels}" /></div>
                <div><label class="field-label">Slots por nivel</label><input type="number" min="1" max="6" step="1" data-model-input="slots" data-mid="${m.id}" value="${m.slots || m.capacity || 2}" /></div>
                <div></div>
                <div class="library-inline-actions-box"><button class="mini-btn" data-level-toggle="${m.id}">${levelsOpen?'Ocultar niveles':'Editar niveles'}</button></div>
              </div>
            </div>
          </div>`}

          ${levelsOpen ? `
          <div class="library-levels-panel open" data-level-panel="${m.id}">
            <div class="level-editor-tools inline-level-tools">
              <span class="tag">${levelHeights.length} niveles</span>
              <button class="mini-btn" data-model-auto-levels="${m.id}">Auto distribuir</button>
            </div>
            <div class="level-editor-list embedded-level-list">
              ${Array.from({length: levelHeights.length}, (_, displayPos) => {
                const idx = levelHeights.length - 1 - displayPos;
                const value = levelHeights[idx];
                const displayLevel = idx + 1;
                return `
                <div class="level-row compact">
                  <strong>Nivel ${displayLevel}</strong>
                  <input type="number" min="10" step="1" value="${value}" data-level-height-model="${m.id}" data-level-height-index="${idx}" />
                  <div class="level-slot-inline">
                    <label>Slots</label>
                    <input type="number" min="1" max="6" step="1" value="${Math.max(1, Math.min(6, buildLevelSlots(m)[idx] || Math.max(1, Number(m.slots||2)||2)))}" data-level-slot-model="${m.id}" data-level-slot-index="${idx}" />
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>` : ''}
          <div class="model-card-actions">
            <button class="mini-btn" data-model-action="duplicate" data-mid="${m.id}">Duplicar</button>
            <button class="mini-btn" data-model-action="delete" data-mid="${m.id}">Eliminar</button>
            <button class="mini-btn" data-model-action="use" data-mid="${m.id}">Activar</button>
          </div>
        </div>` : ''}
      </div>`;
    }).join('');

    $$('[data-library-toggle]').forEach(head => head.onclick = (e) => {
      if(e.target.closest('[data-library-toggle-btn]')) return;
      const id = head.getAttribute('data-library-toggle');
      const changed = appState.selectedModelId !== id;
      appState.selectedModelId = id;
      if(changed) resetRackPreviewCamera();
      appState.ui.rackLibraryOpenIds = [id];
      rerenderRackEditorPreservingState({ focusId:id });
    });

    $$('[data-library-toggle-btn]').forEach(btn => {
      const toggleModelCard = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-library-toggle-btn');
        const openIds = Array.isArray(appState.ui.rackLibraryOpenIds) ? [...appState.ui.rackLibraryOpenIds] : [];
        const isOpen = openIds.includes(id);
        appState.ui.rackLibraryOpenIds = isOpen ? openIds.filter(x => x !== id) : [id];
        if(isOpen){
          appState.ui.rackLibraryLevelsOpenIds = appState.ui.rackLibraryLevelsOpenIds.filter(x => x !== id);
        }
        if(!isOpen && appState.selectedModelId !== id){
          appState.selectedModelId = id;
          resetRackPreviewCamera();
        }
        rerenderRackEditorPreservingState({ focusId:id });
      };
      btn.onclick = toggleModelCard;
      btn.onpointerdown = (e) => { e.stopPropagation(); };
    });

    $$('[data-model-input]').forEach(el => {
      const handler = () => updateRackModelField(
        el.getAttribute('data-mid'),
        el.getAttribute('data-model-input'),
        el.type === 'checkbox' ? !!el.checked : el.value
      );
      if(el.type === 'checkbox') el.onchange = handler;
      else {
        el.oninput = handler;
        if(el.tagName === 'SELECT') el.onchange = handler;
      }
    });

    $$('[data-level-toggle]').forEach(btn => btn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = btn.getAttribute('data-level-toggle');
      const open = appState.ui.rackLibraryLevelsOpenIds.includes(id);
      const changed = appState.selectedModelId !== id;
      appState.selectedModelId = id;
      if(changed) resetRackPreviewCamera();
      appState.ui.rackLibraryLevelsOpenIds = open ? appState.ui.rackLibraryLevelsOpenIds.filter(x => x!==id) : [...appState.ui.rackLibraryLevelsOpenIds.filter(x => x!==id), id];
      rerenderRackEditorPreservingState({ focusId:id });
    });

    $$('[data-level-height-model]').forEach(inp => inp.oninput = () => {
      const id = inp.getAttribute('data-level-height-model');
      const idx = Number(inp.getAttribute('data-level-height-index') || 0);
      const model = rackModel(id);
      if(!model) return;
      const heights = buildLevelHeights(model);
      heights[idx] = Math.max(10, Number(inp.value || 10) || 10);
      model.levelHeights = heights;
      appState.selectedModelId = id;
      renderRackModelPreview();
    });
    $$('[data-level-slot-model]').forEach(inp => {
      const applyValue = (nextValue) => {
        const id = inp.getAttribute('data-level-slot-model');
        const idx = Number(inp.getAttribute('data-level-slot-index') || 0);
        const model = rackModel(id);
        if(!model) return;
        const slots = buildLevelSlots(model);
        const current = Number(nextValue ?? inp.value);
        slots[idx] = Math.max(1, Math.min(6, current || 1));
        model.levelSlots = slots;
        model.slots = Math.max(...slots);
        appState.selectedModelId = id;
        rerenderRackEditorPreservingState({ focusId:id });
      };
      inp.oninput = () => applyValue();
      inp.onchange = () => applyValue();
    });

    $$('[data-level-slot-step]').forEach(btn => btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-level-slot-model');
      const idx = Number(btn.getAttribute('data-level-slot-index') || 0);
      const step = Number(btn.getAttribute('data-level-slot-step') || 0) || 0;
      const model = rackModel(id);
      if(!model) return;
      const slots = buildLevelSlots(model);
      slots[idx] = Math.max(1, Math.min(6, (Number(slots[idx] || model.slots || 2) || 2) + step));
      model.levelSlots = slots;
      model.slots = Math.max(...slots);
      appState.selectedModelId = id;
      rerenderRackEditorPreservingState({ focusId:id });
    });

    $$('[data-model-auto-levels]').forEach(btn => btn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      autoDistributeLevels(btn.getAttribute('data-model-auto-levels'));
    });

    $$('[data-model-action]').forEach(btn => btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-mid');
      const action = btn.getAttribute('data-model-action');
      if(action === 'duplicate') duplicateRackModel(id);
      else if(action === 'delete') deleteRackModel(id);
      else if(action === 'use'){ const changed = appState.selectedModelId !== id; appState.selectedModelId = id; if(changed) resetRackPreviewCamera(); rerenderRackEditorPreservingState({ focusId:id }); }
    });
  }

  function buildLevelHeights(model){
    const count = Math.max(2, Math.min(12, Number(model?.levels || 4) || 4));
    const stored = Array.isArray(model?.levelHeights) ? model.levelHeights.map(v => Math.max(10, Number(v)||10)) : [];
    if (stored.length === count) return stored;
    const usable = Math.max(20, (Number(model?.height || 238) || 238) - (Number(model?.clearance || 0) || 0));
    const each = Math.max(10, Math.round((usable / count) * 10) / 10);
    return Array.from({length: count}, () => each);
  }
  function buildLevelSlots(model){
    const count = Math.max(2, Math.min(12, Number(model?.levels || 4) || 4));
    const fallback = Math.max(1, Math.min(6, Number(model?.slots || model?.capacity || 2) || 2));
    const stored = Array.isArray(model?.levelSlots) ? model.levelSlots.map(v => Math.max(1, Math.min(6, Number(v)||fallback))) : [];
    if (stored.length === count) return stored;
    return Array.from({length: count}, (_, idx) => stored[idx] || fallback);
  }
  function getRackCapacity(model){
    const levelSlots = buildLevelSlots(model || {});
    return Math.max(1, levelSlots.reduce((sum, v) => sum + Math.max(1, Number(v)||0), 0));
  }

  function normalizeRackStyle(style){
    const raw = String(style || '').toLowerCase();
    if(raw === 'melamine' || raw === 'melamina' || raw === 'compact') return 'melamine';
    if(raw === 'under_stairs_reflected' || raw === 'bajo_escalera_reflejado' || raw === 'bajo escalera reflejado' || raw === 'under stairs reflected') return 'under_stairs_reflected';
    if(raw === 'under_stairs' || raw === 'bajo_escalera' || raw === 'bajo escalera') return 'under_stairs';
    return 'metallic';
  }
  function rackStyleLabel(style){
    const normalized = normalizeRackStyle(style);
    if(normalized === 'melamine') return 'Melamina';
    if(normalized === 'under_stairs_reflected') return 'Bajo escalera reflejado';
    return normalized === 'under_stairs' ? 'Bajo escalera' : 'Metálico';
  }
  function rackStyleSub(style){
    const normalized = normalizeRackStyle(style);
    if(normalized === 'melamine') return 'Rack melamina';
    if(normalized === 'under_stairs_reflected') return 'Mueble bajo escalera reflejado';
    return normalized === 'under_stairs' ? 'Mueble bajo escalera' : 'Rack metálico';
  }

  
  function syncLevelEditorCount(modelId){
    const model = rackModel(modelId || appState.selectedModelId);
    if(!model) return;
    const count = Math.max(2, Math.min(12, Number(model.levels || 4) || 4));
    const current = buildLevelHeights(model);
    if(current.length !== count){
      const next = Array.from({length: count}, (_, idx) => current[idx] || current[current.length - 1] || 60);
      model.levelHeights = next;
    }
    const currentSlots = buildLevelSlots(model);
    if(currentSlots.length !== count){
      const nextSlots = Array.from({length: count}, (_, idx) => currentSlots[idx] || currentSlots[currentSlots.length - 1] || Math.max(1, Number(model.slots||2)||2));
      model.levelSlots = nextSlots;
    }
  }

  function renderLevelEditor(){ return; }

  
  function createNewRackModelDraft(){
    recordHistorySnapshot('racks');
    const base = {
      id: 'm_' + Math.random().toString(16).slice(2,8),
      name: 'Nuevo modelo',
      levels: 4,
      width: 120,
      depth: 40,
      height: 240,
      clearance: 0,
      slots: 2,
      beam: 2,
      style: 'metallic',
      levelHeights: [60,60,60,58],
      levelSlots: [2,2,2,2],
      leftHeight: 240,
      rightHeight: 84,
      topLength: 60,
      mirrored: false
    };
    appState.models.push(base);
    appState.selectedModelId = base.id;
    resetRackPreviewCamera();
    appState.ui.rackLibraryOpenIds = [base.id];
    appState.ui.rackLibraryLevelsOpenIds = [];
    saveRackModels();
    renderRackModels();
  }

  
  function duplicateRackModel(id){
    recordHistorySnapshot('racks');
    const model = rackModel(id);
    if(!model) return;
    const copy = {
      ...clone(model),
      id: 'm_' + Math.random().toString(16).slice(2,8),
      name: `${model.name} copia`
    };
    appState.models.unshift(copy);
    appState.selectedModelId = copy.id;
    resetRackPreviewCamera();
    appState.ui.rackLibraryOpenIds = [copy.id];
    saveRackModels();
    renderRackModels();
  }

  
  function deleteRackModel(id){
    recordHistorySnapshot('racks');
    if(!id || !Array.isArray(appState.models) || appState.models.length <= 1) return;
    appState.models = appState.models.filter(m => m.id !== id);
    if(!appState.models.some(m => m.id === appState.selectedModelId)) appState.selectedModelId = appState.models[0]?.id || '';
    resetRackPreviewCamera();
    appState.ui.rackLibraryOpenIds = appState.selectedModelId ? [appState.selectedModelId] : [];
    appState.ui.rackLibraryLevelsOpenIds = appState.ui.rackLibraryLevelsOpenIds.filter(mid => mid !== id);
    saveRackModels();
    renderRackModels();
  }

  
  function useRackModel(id){
    const changed = appState.selectedModelId !== id;
    appState.selectedModelId = id;
    if(changed) resetRackPreviewCamera();
    appState.ui.rackLibraryOpenIds = [id];
    renderRackModels();
  }

  
  function autoDistributeLevels(modelId){
    recordHistorySnapshot('racks');
    const targetId = modelId || appState.selectedModelId;
    const draft = rackModel(targetId);
    if(!draft) return;
    const count = Math.max(2, Number(draft.levels||4)||4);
    const usable = Math.max(20, draft.height - draft.clearance);
    const each = Math.max(10, Math.round((usable / count) * 10) / 10);
    draft.levelHeights = Array.from({length: count}, () => each);
    draft.levelSlots = Array.from({length: count}, () => Math.max(1, Math.min(6, Number(draft.slots || 2) || 2)));
    appState.selectedModelId = targetId;
    renderRackModels();
  }

  
  function rackModelDraft(){
    const active = rackModel(appState.selectedModelId) || appState.models?.[0] || {
      id:'std_4', name:'Rack estándar 4 niveles', levels:4, width:120, depth:40, height:240, clearance:0, style:'metallic', slots:2, beam:2, levelSlots:[2,2,2,2]
    };
    return clone(active);
  }

  
  async function saveRackModel(){
    recordHistorySnapshot('racks');
    saveRackModels();
    await saveRemoteAppState('modelo de rack');
    renderRackModels();
  }


  function updateRackModelField(id, field, rawValue){
    recordHistorySnapshot('racks');
    const model = rackModel(id);
    if(!model) return;
    appState.selectedModelId = id;
    if(field === 'name') model.name = String(rawValue || '').trimStart() || 'Sin nombre';
    else if(field === 'style') {
      model.style = normalizeRackStyle(rawValue || model.style || 'metallic');
      if(model.style === 'under_stairs_reflected') model.mirrored = true;
      else if(model.style === 'under_stairs') model.mirrored = false;
    }
    else if(field === 'levels'){
      model.levels = Math.max(2, Math.min(12, Number(rawValue || 4) || 4));
      syncLevelEditorCount(id);
    } else if(field === 'width') model.width = Math.max(30, Number(rawValue || model.width || 150) || 150);
    else if(field === 'depth') model.depth = Math.max(20, Number(rawValue || model.depth || 82) || 82);
    else if(field === 'height') model.height = Math.max(60, Number(rawValue || model.height || 238) || 238);
    else if(field === 'leftHeight') model.leftHeight = Math.max(40, Number(rawValue || model.leftHeight || model.height || 238) || 238);
    else if(field === 'rightHeight') model.rightHeight = Math.max(20, Number(rawValue || model.rightHeight || Math.max(40,(model.height||238)*0.35)) || Math.max(40,(model.height||238)*0.35));
    else if(field === 'topLength') model.topLength = Math.max(8, Number(rawValue || model.topLength || Math.max(8, ((model.width||150) * 0.33))) || Math.max(8, ((model.width||150) * 0.33)));
    else if(field === 'mirrored') model.mirrored = !!rawValue;
    else if(field === 'clearance') model.clearance = Math.max(0, Math.min(120, Number(rawValue || model.clearance || 0) || 0));
    else if(field === 'slots'){
      model.slots = Math.max(1, Math.min(6, Number(rawValue || model.slots || 2) || 2));
      model.levelSlots = Array.from({length: Math.max(2, Math.min(12, Number(model.levels || 4) || 4))}, () => model.slots);
    }
    else if(field === 'beam') model.beam = Math.max(2, Math.min(20, Number(rawValue || model.beam || 6) || 6));
    if(field === 'height' || field === 'clearance' || field === 'levels') syncLevelEditorCount(id);
    if(isUnderStairsStyle(model.style)){
      model.leftHeight = Math.max(40, Number(model.leftHeight || model.height || 238) || 238);
      model.rightHeight = Math.max(20, Number(model.rightHeight || Math.max(40, (model.height||238) * 0.35)) || Math.max(40, (model.height||238) * 0.35));
      model.height = Math.max(Number(model.height || 0), Number(model.leftHeight || 0), Number(model.rightHeight || 0));
      model.topLength = clampUnderStairsTopLength(model);
      model.mirrored = normalizeRackStyle(model.style) === 'under_stairs_reflected' ? true : !!model.mirrored;
    }
    renderRackModelPreview();
  }

  
  function buildRackModelSummary(model){ return ''; }

  function renderRackPickerPreview(target, modelId, rackRef = null){
    const svg = typeof target === 'string' ? $(target) : target;
    if(!svg) return;
    const model = rackModel(modelId) || appState.models?.[0];
    if(!model){ svg.innerHTML = ''; return; }
    const rack = rackRef || (appState.selectedRackLayoutId ? findRackById(appState.selectedRackLayoutId) : null) || appState.layout?.racks?.[0] || null;
    const previewRack = rack ? { ...rack, id: rack.id || model.name || 'modelo', modelId: model.id, rackHeight: Math.max(60, Number(rack.rackHeight || model.height || 238) || 238) } : { id: model.name || 'modelo', modelId: model.id, x:0, y:0, w:model.width || 120, h:model.depth || 82, rot:0, baseHeight:0, rackHeight:model.height || 238 };
    renderRackDetail(previewRack.id || model.name || 'modelo', null, svg, model, previewRack);
    try{
      const vb = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
      if(vb && vb.width && vb.height){
        const fit = computePreviewFitView(svg, { x: vb.x, y: vb.y, width: vb.width, height: vb.height }, 20, modelId);
        let finalFit = fit;
        if(svg.id === 'sideRackModelViewerSvg'){
          const cx = fit.x + fit.w / 2;
          const cy = fit.y + fit.h / 2;
          const zoom = 0.7;
          const nw = fit.w * zoom;
          const nh = fit.h * zoom;
          finalFit = { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
        }
        svg.setAttribute('viewBox', `${finalFit.x} ${finalFit.y} ${finalFit.w} ${finalFit.h}`);
      }
    } catch(err) {}
    svg.style.pointerEvents = 'none';
  }

  function initSideRackModelPicker(rack){
    const picker = $('#sideRackModelPicker');
    if(!picker || !rack) return;
    const hidden = $('#sideRackModel');
    const trigger = $('#sideRackModelTrigger');
    const hoverSvg = $('#sideRackModelHoverSvg');
    const viewerSvg = $('#sideRackModelViewerSvg');
    const opts = Array.from($$('[data-rack-model-option]'));
    const selectedId = () => hidden?.value || rack.modelId;
    const updateTrigger = (id) => {
      const model = rackModel(id) || appState.models?.[0];
      const label = trigger ? trigger.querySelector('span') : null;
      if(label) label.textContent = model?.name || id || 'Seleccionar modelo';
      opts.forEach(btn => btn.classList.toggle('active', (btn.getAttribute('data-rack-model-option') || '') === (id || '')));
    };
    const renderFor = (id) => {
      const modelId = id || selectedId();
      if(hoverSvg) renderRackPickerPreview(hoverSvg, modelId, rack);
      if(viewerSvg) renderRackPickerPreview(viewerSvg, modelId, rack);
    };
    updateTrigger(selectedId());
    renderFor(selectedId());
    if(trigger){
      trigger.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        picker.classList.toggle('open');
        renderFor(selectedId());
      };
    }
    opts.forEach(btn => {
      btn.onmouseenter = () => renderFor(btn.getAttribute('data-rack-model-option'));
      btn.onfocus = () => renderFor(btn.getAttribute('data-rack-model-option'));
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-rack-model-option');
        if(hidden){
          hidden.value = id;
          updateTrigger(id);
          renderFor(id);
          hidden.dispatchEvent(new Event('change', { bubbles:true }));
        }
        picker.classList.remove('open');
      };
    });
    picker.onmouseleave = () => renderFor(selectedId());
    if(!window.__rackPickerDocBound){
      document.addEventListener('click', (evt) => {
        document.querySelectorAll('.rack-model-picker.open').forEach(node => {
          if(!node.contains(evt.target)) node.classList.remove('open');
        });
      });
      window.__rackPickerDocBound = true;
    }
  }

  function renderRackModelPreview(){
    const svg = $('#rackModelSvg'); 
    if(!svg) return;
    svg.innerHTML = '';

    const rid = appState.selectedRackLayoutId || appState.selectedProduct?.rack;
    const rack = rid ? findRackById(rid) : (appState.layout?.racks?.[0] || null);
    const activeModelId = appState.selectedModelId || rack?.modelId;
    const hasDraft = false;
    const previewModel = hasDraft ? rackModelDraft() : (rackModel(activeModelId) || appState.models?.[0]);
    const previewRack = rack ? { ...rack, modelId: previewModel?.id || rack.modelId } : { id: previewModel?.name || 'modelo', modelId: previewModel?.id || activeModelId };

    renderRackDetail(rid || previewModel?.name || 'modelo', appState.selectedProduct && rid === appState.selectedProduct.rack ? appState.selectedProduct : null, svg, previewModel, previewRack);
    detailStatus.textContent = rack ? `${rack.id} • ${previewModel?.name || ''}` : (previewModel?.name || '');
    detailChip.textContent = `${previewModel?.levels || 0} niveles • Piso ${previewModel?.clearance || 0}cm`;
    enableRackPreviewNavigation(svg, previewModel?.id || activeModelId);
  }

  function computePreviewFitView(svg, vb, padding = 20, modelId = null){
    const aspect = Math.max(0.3, (svg.clientWidth || 780) / Math.max(1, (svg.clientHeight || 640)));
    const pad = Math.max(0, Number(padding) || 0);
    const innerW = Math.max(1, vb.width);
    const innerH = Math.max(1, vb.height);
    const targetW = innerW + pad * 2;
    const targetH = innerH + pad * 2;
    const cx = vb.x + innerW / 2;
    const cy = vb.y + innerH / 2;
    let w = targetW;
    let h = targetH;
    const currentAspect = targetW / Math.max(1, targetH);
    if(currentAspect > aspect){
      h = w / aspect;
    } else {
      w = h * aspect;
    }
    let view = { x: cx - w / 2, y: cy - h / 2, w, h };
    const model = modelId ? rackModel(modelId) : null;
    const styleKind = normalizeRackStyle(model?.style || '');
    if(styleKind === 'metallic' || styleKind === 'melamine'){
      const zoomFactor = 0.9;
      view = {
        x: view.x + (view.w * (1 - zoomFactor) / 2),
        y: view.y + (view.h * (1 - zoomFactor) / 2) + 120,
        w: Math.max(120, view.w * zoomFactor),
        h: Math.max(140, view.h * zoomFactor)
      };
    } else if(styleKind === 'under_stairs'){
      const zoomFactor = 0.847; // alejar 10% adicional desde 0.77
      view = {
        x: view.x + (view.w * (1 - zoomFactor) / 2),
        y: view.y + (view.h * (1 - zoomFactor) / 2) + 95,
        w: Math.max(120, view.w * zoomFactor),
        h: Math.max(140, view.h * zoomFactor)
      };
    } else if(styleKind === 'under_stairs_reflected'){
      const zoomFactor = 0.7;
      view = {
        x: view.x + (view.w * (1 - zoomFactor) / 2),
        y: view.y + (view.h * (1 - zoomFactor) / 2) + 115,
        w: Math.max(120, view.w * zoomFactor),
        h: Math.max(140, view.h * zoomFactor)
      };
    }
    return view;
  }

  function getCenteredPreviewView(svg, vb, modelId = null){
    return computePreviewFitView(svg, vb, 20, modelId);
  }

  function enableRackPreviewNavigation(svg, modelId){
    if(!svg) return;
    const vb = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
    if(!vb || !vb.width || !vb.height) return;
    if(!appState.ui) appState.ui = {};
    const saved = appState.ui.rackPreviewCamera;
    const initialView = getCenteredPreviewView(svg, { x: vb.x, y: vb.y, width: vb.width, height: vb.height }, modelId);
    let view = (saved && saved.modelId === modelId && saved.view) ? { ...saved.view } : { ...initialView };
    let dragging = false;
    let start = null;
    const apply = () => { svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`); appState.ui.rackPreviewCamera = { modelId, view: { ...view } }; };
    apply();
    svg.onwheel = (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const px = rect.width ? (e.clientX - rect.left) / rect.width : 0.5;
      const py = rect.height ? (e.clientY - rect.top) / rect.height : 0.5;
      const mx = view.x + view.w * px;
      const my = view.y + view.h * py;
      const factor = e.deltaY > 0 ? 1.08 : 0.92;
      const nw = Math.max(120, Math.min(1600, view.w * factor));
      const nh = Math.max(140, Math.min(1800, view.h * factor));
      view.x = mx - nw * px;
      view.y = my - nh * py;
      view.w = nw;
      view.h = nh;
      apply();
    };
    svg.onpointerdown = (e) => {
      dragging = true;
      start = { x: e.clientX, y: e.clientY, viewX: view.x, viewY: view.y, w: view.w, h: view.h };
      const stage = document.getElementById('rackPreviewStage');
      if(stage) stage.classList.add('dragging');
      svg.setPointerCapture?.(e.pointerId);
    };
    svg.onpointermove = (e) => {
      if(!dragging || !start) return;
      const rect = svg.getBoundingClientRect();
      const dx = ((e.clientX - start.x) / Math.max(1, rect.width)) * start.w;
      const dy = ((e.clientY - start.y) / Math.max(1, rect.height)) * start.h;
      view.x = start.viewX - dx;
      view.y = start.viewY - dy;
      apply();
    };
    svg.onpointerup = () => { dragging = false; start = null; const stage = document.getElementById('rackPreviewStage'); if(stage) stage.classList.remove('dragging'); };
    svg.onpointercancel = svg.onpointerup;
  }

  function renderReports(){
    renderMapView();
    contentTitle.textContent = 'Reportes';
    contentSubtitle.textContent = 'Resumen visual rápido del inventario y ubicación.';
    setTags(['resumen', 'zonas', 'racks', 'inventario']);
    contentStatus.textContent = 'Vista rápida de reportes.';
  }

  async function stopScanner(){
    try{
      if (html5QrScanner && scannerRunning) await html5QrScanner.stop();
    } catch (e) { console.warn(e); }
    scannerRunning = false;
    if (html5QrScanner){
      try { await html5QrScanner.clear(); } catch(e){}
      html5QrScanner = null;
    }
    scannerModal.classList.remove('show');
  }

  async function openScanner(mode='qr'){
    scannerHint.textContent = mode === 'bar' ? 'Apunta al código de barras con buena luz y distancia.' : 'Apunta al QR o código de barras.';
    scannerModal.classList.add('show');
    if (!window.Html5Qrcode) {
      alert('No se pudo cargar la librería del escáner. Revisa tu conexión.');
      return;
    }
    if (html5QrScanner){ await stopScanner(); scannerModal.classList.add('show'); }
    html5QrScanner = new Html5Qrcode('scannerReader');
    const formats = mode === 'bar'
      ? [ Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E, Html5QrcodeSupportedFormats.ITF ]
      : [ Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E ];
    try{
      const cameras = await Html5Qrcode.getCameras();
      const cameraId = (cameras.find(c => /back|rear|trasera/i.test(c.label || '')) || cameras[0] || {}).id;
      if (!cameraId) throw new Error('No se detectó cámara.');
      await html5QrScanner.start(
        cameraId,
        { fps: 12, qrbox: { width: 260, height: 180 }, formatsToSupport: formats, aspectRatio: 1.777 },
        (decodedText) => {
          searchInput.value = decodedText;
          filterProducts();
          const exact = appState.products.find(p => [p.sku,p.barras,p.rack,p.ubicacion].some(v => String(v||'').toLowerCase() === String(decodedText).toLowerCase()));
          if (exact) selectProduct(exact);
          stopScanner();
        },
        () => {}
      );
      scannerRunning = true;
    } catch(err){
      console.error(err);
      alert('No se pudo iniciar el escáner. Asegúrate de estar en localhost o https y de dar permiso a la cámara.');
      stopScanner();
    }
  }


  function syncAuthModeUi(){
    const mode = authMode?.value || 'login';
    const role = authRole?.value || 'admin';
    if(authCompanyWrap) authCompanyWrap.style.display = mode === 'register' && role !== 'viewer' ? '' : 'none';
    if(authCompanyCodeWrap) authCompanyCodeWrap.style.display = mode === 'register' && role === 'viewer' ? '' : 'none';
    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    if(title) title.textContent = mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión';
    if(subtitle) subtitle.textContent = mode === 'register'
      ? (role === 'viewer' ? 'Crea un acceso viewer separado del administrador usando el código de empresa.' : 'Crea una cuenta administradora para gestionar sucursales, racks y layouts persistentes.')
      : (role === 'viewer' ? 'Ingresa como viewer para consultar productos y ubicaciones sin editar.' : 'Ingresa como administrador para gestionar cambios y guardados persistentes.');
    if(btnDoLogin){ const nextLabel = mode === 'register' ? 'Crear e ingresar' : 'Ingresar'; btnDoLogin.dataset.label = nextLabel; if(!authBusy) btnDoLogin.textContent = nextLabel; }
    if(btnToggleAuthMode) btnToggleAuthMode.textContent = mode === 'register' ? 'Ya tengo cuenta' : 'Crear cuenta';
    document.querySelectorAll('.auth-segment-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    document.querySelectorAll('.auth-role-card').forEach(btn => btn.classList.toggle('active', btn.dataset.role === role));
  }

  function setAuthMode(mode){
    if(authMode) authMode.value = mode === 'register' ? 'register' : 'login';
    syncAuthModeUi();
  }

  function setAuthRole(role){
    if(authRole) authRole.value = role === 'viewer' ? 'viewer' : 'admin';
    syncAuthModeUi();
  }

  function openAuthModal(message=''){
    if(!authModal) return;
    authModal.classList.add('show');
    authModal.style.display = 'flex';
    document.body.classList.add('auth-open');
    if(authStatus) authStatus.textContent = message || '';
    if(loginPassword) loginPassword.value = '';
    if(authMode && !authMode.value) authMode.value = 'login';
    if(authRole && !authRole.value) authRole.value = 'admin';
    syncAuthModeUi();
    setTimeout(()=>{ if(loginPassword) loginPassword.focus(); }, 20);
  }

  function closeAuthModal(force=false){
    if(!authModal) return;
    if(!force && !appState.auth?.loggedIn && !appState.auth?.viewerGuest) return;
    authModal.classList.remove('show');
    authModal.style.display = 'none';
    document.body.classList.remove('auth-open');
    if(authStatus) authStatus.textContent = '';
    setAuthPending(false);
  }

  function updateAuthUi(){
    if(!btnAuthAction) return;
    if(appState.auth?.loggedIn){
      btnAuthAction.textContent = `Salir · ${appState.auth.user || 'admin'}${appState.auth.role ? ' ('+appState.auth.role+')' : ''}`;
      btnAuthAction.classList.add('active');
    }else{
      btnAuthAction.textContent = 'Iniciar sesión';
      btnAuthAction.classList.remove('active');
    }
  }

  function applyRoleUi(){
    const isViewer = String(appState.auth?.role || '') === 'viewer' || !!appState.auth?.viewerGuest;
    document.body.classList.toggle('role-viewer', isViewer);
    document.querySelectorAll('[data-admin-only="1"]').forEach(el=>{ el.style.display = isViewer ? 'none' : ''; });
    if(isViewer && appState.screen !== 'viewer'){ appState.screen = 'viewer'; setActiveMenu && setActiveMenu('viewer'); }
  }

  function hasSessionCookie(){
    try{
      return /(?:^|;\s*)wms\.sid=/.test(String(document.cookie || '')) || /(?:^|;\s*)connect\.sid=/.test(String(document.cookie || ''));
    }catch(_err){
      return false;
    }
  }

  function isLocalRuntimeForAuth(){
    try{
      const host = String(window.location.hostname || '').toLowerCase();
      return host === 'localhost' || host === '127.0.0.1' || host === '' || String(window.location.port || '') === '5500' || window.location.protocol === 'file:';
    }catch(_err){ return false; }
  }

  function wait(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

  let authBusy = false;
  function setAuthPending(pending, message=''){
    authBusy = !!pending;
    if(btnDoLogin){
      btnDoLogin.disabled = !!pending;
      btnDoLogin.dataset.label = btnDoLogin.dataset.label || btnDoLogin.textContent || 'Ingresar';
      btnDoLogin.textContent = pending ? 'Ingresando…' : (btnDoLogin.dataset.label || btnDoLogin.textContent || 'Ingresar');
      btnDoLogin.classList.toggle('is-loading', !!pending);
    }
    if(btnContinueViewer){
      btnContinueViewer.disabled = !!pending;
      btnContinueViewer.classList.toggle('is-loading', !!pending);
    }
    if(loginUsername) loginUsername.disabled = !!pending;
    if(loginPassword) loginPassword.disabled = !!pending;
    if(authMode) authMode.disabled = !!pending;
    if(authRole) authRole.disabled = !!pending;
    document.querySelectorAll('.auth-role-card,.auth-segment-btn').forEach(el=>{
      el.classList.toggle('disabled', !!pending);
      el.style.pointerEvents = pending ? 'none' : '';
      el.setAttribute('aria-disabled', pending ? 'true' : 'false');
    });
    if(authStatus && pending) authStatus.textContent = message || 'Validando acceso…';
  }

  async function warmService(maxAttempts=6){
    for(let i=0;i<maxAttempts;i++){
      try{
        const res = await fetch('/healthz', { credentials:'include', cache:'no-store' });
        if(res.ok) return true;
      }catch(_err){}
      await wait(900 + (i*350));
    }
    return false;
  }

  async function fetchSessionWithRetry(maxAttempts=5){
    let lastStatus = 0;
    let lastErr = null;
    for(let i=0;i<maxAttempts;i++){
      try{
        const res = await fetch('/api/session', { credentials:'include', cache:'no-store' });
        lastStatus = Number(res.status || 0);
        if(res.ok){
          const data = await res.json();
          return { ok:true, data };
        }
        if(res.status === 401){
          if(hasSessionCookie() && i < maxAttempts - 1){
            await wait(700 + (i*300));
            continue;
          }
          return { ok:false, unauthorized:true, status:401 };
        }
        if(res.status >= 500 && i < maxAttempts - 1){
          await wait(900 + (i*400));
          continue;
        }
        return { ok:false, status:lastStatus };
      }catch(err){
        lastErr = err;
        if(i < maxAttempts - 1){
          await wait(900 + (i*400));
          continue;
        }
      }
    }
    return { ok:false, status:lastStatus, error:lastErr };
  }

  async function checkSession(){
    if(isLocalRuntimeForAuth()){
      appState.auth = { loggedIn:false, user:'', role:'', company:'', companyCode:'', viewerGuest:false, localMode:true };
      updateAuthUi();
      applyRoleUi();
      return;
    }
    const hadCookie = hasSessionCookie();
    await warmService(hadCookie ? 8 : 2);
    const outcome = await fetchSessionWithRetry(hadCookie ? 7 : 3);
    if(outcome.ok && outcome.data){
      const data = outcome.data;
      appState.auth = { loggedIn:true, user:data.user || 'admin', role:data.role || 'admin', company:data.company_name || '', companyCode:data.company_code || '', viewerGuest:false };
      try{ await loadRemoteAppState(); await loadAllBranchSheetConfigsFromServer(); }catch(_e){}
    }else if(outcome.unauthorized){
      appState.auth = { loggedIn:false, user:'', role:'', company:'', companyCode:'', viewerGuest:false };
    }else{
      console.warn('Sesión temporalmente no disponible; se conserva el estado actual.', outcome.status || outcome.error || 'sin-detalle');
      if(!appState.auth?.loggedIn){
        appState.auth = { loggedIn:false, user:'', role:'', company:'', companyCode:'', viewerGuest:false, transientUnavailable:true };
      }
    }
    updateAuthUi();
    applyRoleUi();
  }

  function getViewerTokenFromUrl(){
    try{
      const path = String(window.location.pathname || '');
      const m = path.match(/^\/viewer\/([^/?#]+)/i);
      if(m && m[1]) return decodeURIComponent(m[1]);
      const qs = new URLSearchParams(window.location.search || '');
      return String(qs.get('viewerToken') || qs.get('token') || '').trim();
    }catch(_err){
      return '';
    }
  }

  async function loadViewerLinkState(token){
    const safeToken = String(token || '').trim();
    if(!safeToken) return false;
    const data = await httpJson(`/api/view-links/${encodeURIComponent(safeToken)}`);
    const branch = data?.branch || {};
    const layoutPayload = data?.layout || {};
    const sheet = data?.sheet || {};
    const imported = Array.isArray(sheet.imported_products) ? sheet.imported_products.slice(0,50000) : [];
    const viewerBranch = {
      id: Number(branch.id || 1),
      name: String(branch.name || 'Sucursal'),
      type: String(branch.type || 'tienda'),
      color: (appState.admin?.branches?.[0]?.color) || '#ffd84d',
      warehouses: Array.isArray(branch.warehouses_json) ? branch.warehouses_json : (Array.isArray(branch.warehouses) ? branch.warehouses : ['Almacén principal']),
      sheetUrl: String(sheet.sheet_id || ''),
      sheetName: String(sheet.sheet_name || 'Productos'),
      sheetConnected: imported.length > 0,
      lastSheetCount: Number(sheet.last_sheet_count || imported.length || 0),
      sheetMapRows: Array.isArray(sheet.sheet_map_rows) ? sheet.sheet_map_rows : defaultSheetMapRows(),
      sheetHeaders: Array.isArray(sheet.sheet_headers) ? sheet.sheet_headers : [],
      sheetHeaderIndex: Number(sheet.sheet_header_index || 0),
      sheetPreviewProducts: imported,
      sheetStatusText: imported.length ? `Importados: ${imported.length.toLocaleString('es-PE')}` : 'Sin productos importados'
    };
    appState.admin.branches = [viewerBranch];
    appState.admin.activeBranch = 0;
    appState.activeBranchIndex = 0;
    appState.layout = layoutPayload.layout || defaultLayout();
    if(appState.editor) appState.editor.viewBox = layoutPayload.viewBox || { x:0, y:0, w:900, h:620 };
    setProductDataset(imported);
    appState.filtered = appState.products.slice();
    appState.auth = { loggedIn:false, user:'', role:'viewer', company:'', companyCode:'', viewerGuest:true };
    return true;
  }

  function continueAsViewer(){
    if(authBusy) return;
    if(appState.ui) appState.ui.pendingScreenAfterLogin = '';
    appState.auth = { loggedIn:false, user:'', role:'viewer', company:'', companyCode:'', viewerGuest:true };
    updateAuthUi();
    applyRoleUi();
    setScreen('viewer');
    closeAuthModal(true);
  }

  async function doLogin(){
    if(authBusy) return false;
    const username = String(loginUsername?.value || '').trim();
    const password = String(loginPassword?.value || '');
    const mode = String(authMode?.value || 'login');
    const role = String(authRole?.value || 'admin');
    if(!username || !password){ if(authStatus) authStatus.textContent = 'Completa usuario y contraseña.'; return false; }
    setAuthPending(true, mode === 'register' ? 'Creando acceso…' : 'Ingresando…');
    try{
      if(isLocalRuntimeForAuth()){
        const okLocalLogin = mode === 'register' || (username.toLowerCase() === 'admin' && password === 'admin123');
        if(!okLocalLogin) throw new Error('En Live Server usa admin / admin123 o crea una cuenta local.');
        appState.auth = { loggedIn:true, user:username || 'admin', role:role || 'admin', company:getAdminCompanyName ? getAdminCompanyName() : 'WMS Local', companyCode:'LOCAL', viewerGuest:false, localMode:true };
        updateAuthUi();
        applyRoleUi();
        const targetScreen = String(appState.ui?.pendingScreenAfterLogin || '').trim() || (appState.auth?.role === 'viewer' ? 'viewer' : 'admin');
        if(appState.ui) appState.ui.pendingScreenAfterLogin = '';
        closeAuthModal(true);
        setScreen(targetScreen);
        showToast('Modo local activo para Live Server.', 'success', 2200);
        return true;
      }
      const payload = { username, password };
      let endpoint = '/api/login';
      if(mode === 'register'){
        endpoint = role === 'viewer' ? '/api/viewers/register' : '/api/register';
        payload.role = role;
        payload.companyName = String(authCompanyName?.value || '').trim();
        payload.companyCode = String(authCompanyCode?.value || '').trim();
      }
      const res = await fetch(endpoint, { method:'POST', credentials:'include', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok) throw new Error(data.error || 'No se pudo iniciar sesión');

      appState.auth = { loggedIn:true, user:data.user || username, role:data.role || 'admin', company:data.company_name || '', companyCode:data.company_code || '', viewerGuest:false };
      updateAuthUi();
      applyRoleUi();

      const targetScreen = String(appState.ui?.pendingScreenAfterLogin || '').trim() || (appState.auth?.role === 'viewer' ? 'viewer' : 'admin');
      if(appState.ui) appState.ui.pendingScreenAfterLogin = '';
      closeAuthModal(true);
      setScreen(targetScreen);

      Promise.allSettled([loadRemoteAppState(), loadAllBranchSheetConfigsFromServer()]).then(() => {
        try{
          ensureProductPagerUi();
          ensureProductFilterBar();
          syncProductFilterUi();
          renderCurrentScreen();
        }catch(_err){}
      });
      return true;
    }catch(err){
      const msg = err.message || 'Error al iniciar sesión';
      if(authStatus) authStatus.textContent = msg;
      if(/network|fetch|servidor|disponible|timeout/i.test(String(msg))) showToast(msg, 'error', 3200);
      return false;
    }finally{
      setAuthPending(false);
    }
  }

  async function doLogout(){
    try{ await fetch('/api/logout', { method:'POST', credentials:'include' }); }catch(_err){}
    appState.auth = { loggedIn:false, user:'', role:'', company:'', companyCode:'', viewerGuest:false };
    updateAuthUi();
    applyRoleUi();
    openAuthModal('');
    showToast('Sesión cerrada.', 'success', 1800);
  }

  function renderCurrentScreen(){
    if(appState.screen === 'admin') return renderAdminScreen();
    if(appState.screen === 'viewer') return renderMapView();
    if(appState.screen === 'dashboard') return renderDashboard();
    if(appState.screen === 'products') { appState.screen = 'viewer'; setActiveMenu && setActiveMenu('viewer'); return renderMapView(); }
    setUnifiedMapLayout(false);
    if(appState.screen === 'sheet') (typeof renderSheetScreen==='function'?renderSheetScreen():renderMapView());
    else if(appState.screen === 'layout') renderLayoutEditor();
    else if(appState.screen === 'racks') renderRackModels();
  }

  function applyUiTheme(theme){
    const next = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('theme-light', next === 'light');
    document.body.classList.toggle('theme-dark', next === 'dark');
    try{ localStorage.setItem('wms_ui_theme', next); }catch{}
    const toggleThemeCheckbox = document.getElementById('toggleThemeCheckbox');
    if(toggleThemeCheckbox) toggleThemeCheckbox.checked = next === 'light';
  }

  function loadUiTheme(){
    let theme = 'dark';
    try{ theme = localStorage.getItem('wms_ui_theme') || 'dark'; }catch{}
    applyUiTheme(theme);
  }

  const toggleThemeCheckbox = document.getElementById('toggleThemeCheckbox');
  if(toggleThemeCheckbox) toggleThemeCheckbox.addEventListener('change', (e) => {
    applyUiTheme(e.target.checked ? 'light' : 'dark');
  });

  // V54 - Picking por lista de SKUs / códigos
  function ensurePickingUi(){
    if(!document.getElementById('btnOpenPicking')){
      const searchbar = document.querySelector('.searchbar');
      const before = document.getElementById('btnScanCode');
      const btn = document.createElement('button');
      btn.className = 'action-btn picking-launch-btn';
      btn.id = 'btnOpenPicking';
      btn.type = 'button';
      btn.textContent = 'Picking';
      if(searchbar) searchbar.insertBefore(btn, before || null);
      btn.addEventListener('click', openPickingModal);
    }
    const adminMenu = document.querySelector('.menu-section .menu-items');
    if(adminMenu && !document.getElementById('menuPickingBtn')){
      const item = document.createElement('div');
      item.className = 'menu-item';
      item.id = 'menuPickingBtn';
      item.innerHTML = '🧾 <span>Picking</span>';
      item.addEventListener('click', (e)=>{ e.preventDefault(); openPickingModal(); });
      adminMenu.appendChild(item);
    }
  }

  function normalizePickingToken(value){
    return norm(String(value || '').replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ_-]+/g,' ').trim());
  }

  function splitPickingInput(raw){
    return String(raw || '')
      .split(/[\n,;\t]+/)
      .map(x => x.trim())
      .filter(Boolean)
      .map((token, index) => ({ token, key:normalizePickingToken(token), index:index + 1 }));
  }

  function productPickingKeys(product){
    const sku = normalizePickingToken(product?.sku || '');
    const barras = normalizePickingToken(product?.barras || product?.barcode || '');
    const nombre = normalizePickingToken(product?.nombre || product?.name || '');
    const variante = normalizePickingToken(product?.variante || '');
    const color = normalizePickingToken(getProductColorValue(product));
    const talla = normalizePickingToken(getProductSizeValue(product));
    return { sku, barras, nombre, variante, color, talla, joined:[sku,barras,nombre,variante,color,talla].filter(Boolean).join(' ') };
  }

  function findPickingProduct(tokenObj, indexMaps){
    if(!tokenObj?.key) return null;
    const key = tokenObj.key;
    if(indexMaps.bySku.has(key)) return { product:indexMaps.bySku.get(key), match:'SKU exacto' };
    if(indexMaps.byBar.has(key)) return { product:indexMaps.byBar.get(key), match:'Barras exacto' };
    if(indexMaps.byLocation.has(key)) return { product:indexMaps.byLocation.get(key), match:'Ubicación exacta' };
    const partial = indexMaps.products.find(p => {
      const k = p.__pickKeys;
      return k?.sku?.includes(key) || k?.barras?.includes(key) || k?.nombre?.includes(key) || k?.joined?.includes(key);
    });
    return partial ? { product:partial, match:'Coincidencia parcial' } : null;
  }

  function buildPickingIndex(products){
    const bySku = new Map(), byBar = new Map(), byLocation = new Map();
    const list = (products || []).map(p => ({ ...p, __pickKeys:productPickingKeys(p) }));
    list.forEach(p => {
      if(p.__pickKeys.sku && !bySku.has(p.__pickKeys.sku)) bySku.set(p.__pickKeys.sku, p);
      if(p.__pickKeys.barras && !byBar.has(p.__pickKeys.barras)) byBar.set(p.__pickKeys.barras, p);
      const locKey = normalizePickingToken(p.ubicacion || p.almacen || '');
      if(locKey && !byLocation.has(locKey)) byLocation.set(locKey, p);
    });
    return { products:list, bySku, byBar, byLocation };
  }

  function getPickingSortInfo(product){
    const parsed = parseLocationCode(product?.ubicacion || product?.almacen || '', product?.rack || product?.rackStore || 'Z1-E1');
    return { parsed, zone:parsed.zoneId || 'ZZ', est:Number(parsed.est || 999), level:Number(parsed.level || 999), slot:Number(parsed.slot || 999), rack:parsed.rackId || product?.rack || product?.rackStore || '' };
  }

  function analyzePickingInput(raw){
    const tokens = splitPickingInput(raw);
    const products = Array.isArray(appState.filtered) && appState.filtered.length ? appState.filtered : (appState.products || []);
    const indexMaps = buildPickingIndex(products);
    const rows = tokens.map(tokenObj => {
      const hit = findPickingProduct(tokenObj, indexMaps);
      if(!hit) return { ...tokenObj, found:false, product:null, match:'No encontrado', sort:{ zone:'ZZZ', est:999, level:999, slot:999, rack:'' } };
      const sort = getPickingSortInfo(hit.product);
      return { ...tokenObj, found:true, product:hit.product, match:hit.match, sort };
    });
    rows.sort((a,b) => {
      if(a.found !== b.found) return a.found ? -1 : 1;
      return String(a.sort.zone).localeCompare(String(b.sort.zone),'es',{numeric:true}) || a.sort.est-b.sort.est || a.sort.level-b.sort.level || a.sort.slot-b.sort.slot || a.index-b.index;
    });
    return rows;
  }

  function pickingCsv(rows){
    const header = ['orden','buscado','estado','sku','nombre','variante','ubicacion','almacen','rack','nivel','slot','match'];
    const esc = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
    const lines = [header.join(',')];
    rows.forEach((r,i)=>{
      const p = r.product || {};
      lines.push([
        i+1, r.token, r.found ? 'ENCONTRADO' : 'NO ENCONTRADO', p.sku, p.nombre, p.variante, p.ubicacion, p.almacen,
        r.sort?.rack || p.rack || p.rackStore || '', r.sort?.parsed?.level || '', r.sort?.parsed?.slot || '', r.match
      ].map(esc).join(','));
    });
    return lines.join('\n');
  }

  function downloadPickingCsv(rows){
    const csv = pickingCsv(rows);
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picking_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 700);
  }

  function renderPickingResults(modal, rows){
    const host = modal.querySelector('#pickingResults');
    const stats = modal.querySelector('#pickingStats');
    const found = rows.filter(r=>r.found).length;
    const missing = rows.length - found;
    const zones = Array.from(new Set(rows.filter(r=>r.found).map(r=>r.sort.zone).filter(Boolean)));
    stats.innerHTML = `
      <div class="picking-stat"><b>${rows.length}</b><span>Total</span></div>
      <div class="picking-stat success"><b>${found}</b><span>Encontrados</span></div>
      <div class="picking-stat danger"><b>${missing}</b><span>Faltantes</span></div>
      <div class="picking-stat"><b>${zones.length}</b><span>Zonas</span></div>`;
    if(!rows.length){
      host.innerHTML = '<div class="empty picking-empty">Pega una lista de SKUs, códigos de barras o nombres para generar el recorrido.</div>';
      return;
    }
    host.innerHTML = rows.map((r,i)=>{
      const p = r.product || {};
      const img = r.found ? (getProductImageUrls(p)[0] || '') : '';
      const loc = p.ubicacion || p.almacen || '—';
      const zoneBadge = r.found ? `${escapeHtml(r.sort.zone)} · ${escapeHtml(r.sort.rack || '')} · N${escapeHtml(r.sort.parsed?.level || '')}-S${escapeHtml(r.sort.parsed?.slot || '')}` : 'Sin coincidencia';
      return `<article class="picking-row ${r.found ? 'is-found' : 'is-missing'}" data-pick-row="${i}">
        <div class="picking-order">${i+1}</div>
        <div class="picking-thumb ${img ? '' : 'empty'}">${img ? `<img src="${escapeHtml(img)}" alt="">` : '—'}</div>
        <div class="picking-main">
          <div class="picking-title">${escapeHtml(p.nombre || r.token)}</div>
          <div class="picking-sub">${escapeHtml(p.sku || r.token)} ${p.variante ? '· '+escapeHtml(p.variante) : ''}</div>
          <div class="picking-badges"><span>${escapeHtml(zoneBadge)}</span><span>${escapeHtml(r.match)}</span></div>
        </div>
        <div class="picking-loc"><small>Ubicación</small><b>${escapeHtml(loc)}</b></div>
        <div class="picking-actions">
          ${r.found ? `<button class="mini-btn" data-pick-action="select" data-index="${i}">Seleccionar</button><button class="mini-btn" data-pick-action="loc" data-index="${i}">Ver ubicación</button><button class="mini-btn" data-pick-action="copy" data-index="${i}">Copiar</button>` : `<span class="picking-missing">Revisar Sheet</span>`}
        </div>
      </article>`;
    }).join('');
    host.querySelectorAll('[data-pick-action]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const r = rows[Number(btn.dataset.index)];
        if(!r?.product) return;
        if(btn.dataset.pickAction === 'select'){
          selectProduct(r.product);
          showToast('Producto seleccionado en el viewer.', 'success');
        }
        if(btn.dataset.pickAction === 'loc'){
          selectProduct(r.product);
          openProductLocationModal(r.product);
        }
        if(btn.dataset.pickAction === 'copy'){
          navigator.clipboard?.writeText(r.product.ubicacion || r.product.almacen || '');
          showToast('Ubicación copiada.', 'success');
        }
      });
    });
  }

  function openPickingModal(){
    ensureAppRuntimeState();
    let modal = document.getElementById('pickingModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'pickingModal';
      modal.className = 'modal picking-modal';
      modal.innerHTML = `<div class="modal-card picking-card">
        <button class="modal-close" id="btnClosePicking" type="button">✕</button>
        <div class="modal-head picking-head">
          <div>
            <h2>Picking por lista de SKUs</h2>
            <p>Pega SKUs, códigos de barras o nombres. La app los ordena por zona, rack, nivel y slot para armar un recorrido operativo.</p>
          </div>
          <div class="picking-head-actions">
            <button class="action-btn" id="btnAnalyzePicking" type="button">Generar recorrido</button>
            <button class="seg-btn" id="btnExportPicking" type="button">Exportar CSV</button>
          </div>
        </div>
        <div class="picking-context" id="pickingContext"></div>
        <textarea id="pickingInput" class="picking-input" placeholder="Ejemplo:\nSKU-001\n7894561230001\nProducto color negro talla M"></textarea>
        <div class="picking-stats" id="pickingStats"></div>
        <div class="picking-results" id="pickingResults"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e=>{ if(e.target === modal) modal.classList.remove('show'); });
      modal.querySelector('#btnClosePicking').addEventListener('click', ()=>modal.classList.remove('show'));
    }
    const branch = (appState.admin?.branches || [])[getActiveBranchIndex?.() ?? appState.activeBranchIndex] || {};
    modal.querySelector('#pickingContext').innerHTML = `<span>Sucursal: <b>${escapeHtml(branch.name || 'Actual')}</b></span><span>Productos cargados: <b>${Number((appState.products || []).length).toLocaleString('es-PE')}</b></span><span>Orden: <b>Zona → Rack → Nivel → Slot</b></span>`;
    let currentRows = [];
    const input = modal.querySelector('#pickingInput');
    const analyze = () => { currentRows = analyzePickingInput(input.value); renderPickingResults(modal, currentRows); };
    modal.querySelector('#btnAnalyzePicking').onclick = analyze;
    modal.querySelector('#btnExportPicking').onclick = () => currentRows.length ? downloadPickingCsv(currentRows) : showToast('Primero genera un recorrido.', 'warn');
    input.onkeydown = e => { if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); analyze(); } };
    renderPickingResults(modal, currentRows);
    modal.classList.add('show');
    setTimeout(()=>input.focus(), 80);
  }

  ensurePickingUi();


  // V55 - Reposición / Restock operativo
  function ensureRestockUi(){
    if(!document.getElementById('btnOpenRestock')){
      const anchor = document.getElementById('btnOpenPicking') || document.querySelector('.search-action-bar .action-btn, .viewer-toolbar .action-btn, .viewer-actions .action-btn');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'action-btn restock-launch-btn';
      btn.id = 'btnOpenRestock';
      btn.textContent = 'Reposición';
      btn.title = 'Ver productos con cantidad de restock y generar ruta de reposición';
      btn.addEventListener('click', openRestockModal);
      if(anchor?.parentNode) anchor.parentNode.insertBefore(btn, anchor.nextSibling);
      else document.body.appendChild(btn);
    }
    const adminMenu = document.querySelector('.sidebar-menu, .menu-list, nav');
    if(adminMenu && !document.getElementById('menuRestockBtn')){
      const item = document.createElement('a');
      item.href = '#';
      item.id = 'menuRestockBtn';
      item.className = 'menu-item restock-menu-item';
      item.innerHTML = '📦 <span>Reposición</span>';
      item.addEventListener('click', (e)=>{ e.preventDefault(); openRestockModal(); });
      const pickItem = document.getElementById('menuPickingBtn');
      if(pickItem?.parentNode) pickItem.parentNode.insertBefore(item, pickItem.nextSibling);
      else adminMenu.appendChild(item);
    }
  }

  function parseRestockNumber(value){
    if(value == null) return 0;
    const raw = String(value).trim();
    if(!raw) return 0;
    const cleaned = raw.replace(/[^0-9,.-]/g,'').replace(/,/g,'.');
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function getRestockValue(product){
    if(!product) return 0;
    const direct = parseRestockNumber(product.restock ?? product.cantRestock ?? product.cantidad_restock ?? product.cant_restock);
    if(direct > 0) return direct;
    const headers = ['Cant. Restock','Cant Restock','Cantidad Restock','Restock','Cant. restock','cant restock'];
    for(const h of headers){
      try{
        const v = typeof productHeaderValue === 'function' ? productHeaderValue(product, h) : '';
        const n = parseRestockNumber(v);
        if(n > 0) return n;
      }catch(_err){}
    }
    const raw = product._raw && typeof product._raw === 'object' ? product._raw : {};
    for(const [k,v] of Object.entries(raw)){
      const key = String(k || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      if((key.includes('restock') || (key.includes('cant') && key.includes('stock'))) && !key.includes('precio')){
        const n = parseRestockNumber(v);
        if(n > 0) return n;
      }
    }
    return 0;
  }

  function getRestockKey(product){
    return normalizePickingToken?.(product?.sku || product?.barras || `${product?.nombre || ''}-${product?.ubicacion || ''}-${product?.almacen || ''}`) || String(product?.sku || product?.nombre || Math.random());
  }

  function ensureRestockState(){
    ensureAppRuntimeState();
    if(!appState.ui) appState.ui = {};
    if(!appState.ui.restockReviewed || typeof appState.ui.restockReviewed !== 'object') appState.ui.restockReviewed = {};
    if(!appState.ui.restockFilters || typeof appState.ui.restockFilters !== 'object') appState.ui.restockFilters = { search:'', pendingOnly:false, group:'zone' };
  }

  function getRestockRows(){
    ensureRestockState();
    const base = Array.isArray(appState.filtered) && appState.filtered.length ? appState.filtered : (appState.products || []);
    const rows = base.map(product => {
      const qty = getRestockValue(product);
      if(qty <= 0) return null;
      const sort = getPickingSortInfo(product);
      const key = getRestockKey(product);
      return { product, qty, key, reviewed: !!appState.ui.restockReviewed[key], sort };
    }).filter(Boolean);
    rows.sort((a,b) => String(a.sort.zone).localeCompare(String(b.sort.zone),'es',{numeric:true}) || a.sort.est-b.sort.est || a.sort.level-b.sort.level || a.sort.slot-b.sort.slot || String(a.product?.sku||'').localeCompare(String(b.product?.sku||''),'es',{numeric:true}));
    return rows;
  }

  function filterRestockRows(rows, modal){
    ensureRestockState();
    const q = normalizePickingToken?.(modal?.querySelector('#restockSearch')?.value || appState.ui.restockFilters.search || '') || '';
    const pendingOnly = !!modal?.querySelector('#restockPendingOnly')?.checked;
    appState.ui.restockFilters.search = q;
    appState.ui.restockFilters.pendingOnly = pendingOnly;
    return (rows || []).filter(r => {
      if(pendingOnly && r.reviewed) return false;
      if(!q) return true;
      const p = r.product || {};
      const hay = [p.sku,p.barras,p.nombre,p.variante,p.color,p.talla,p.ubicacion,p.almacen,r.sort.zone,r.sort.rack].map(v => normalizePickingToken?.(v || '') || '').join(' ');
      return hay.includes(q);
    });
  }

  function restockCsv(rows){
    const header = ['orden','estado','cantidad_restock','sku','barras','nombre','variante','ubicacion','almacen','zona','rack','nivel','slot'];
    const esc = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
    const lines = [header.join(',')];
    rows.forEach((r,i)=>{
      const p = r.product || {};
      lines.push([i+1, r.reviewed ? 'REVISADO' : 'PENDIENTE', r.qty, p.sku, p.barras, p.nombre, p.variante, p.ubicacion, p.almacen, r.sort.zone, r.sort.rack, r.sort.parsed?.level || '', r.sort.parsed?.slot || ''].map(esc).join(','));
    });
    return lines.join('\n');
  }

  function downloadRestockCsv(rows){
    const csv = restockCsv(rows);
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reposicion_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 700);
  }

  function renderRestockResults(modal){
    const allRows = getRestockRows();
    const rows = filterRestockRows(allRows, modal);
    const stats = modal.querySelector('#restockStats');
    const host = modal.querySelector('#restockResults');
    const totalQty = rows.reduce((s,r)=>s + Number(r.qty || 0),0);
    const pending = rows.filter(r=>!r.reviewed).length;
    const reviewed = rows.length - pending;
    const zones = Array.from(new Set(rows.map(r=>r.sort.zone).filter(Boolean)));
    const racks = Array.from(new Set(rows.map(r=>r.sort.rack).filter(Boolean)));
    stats.innerHTML = `
      <div class="picking-stat restock-stat"><b>${rows.length}</b><span>Productos</span></div>
      <div class="picking-stat restock-stat success"><b>${Number(totalQty).toLocaleString('es-PE')}</b><span>Und. por reponer</span></div>
      <div class="picking-stat restock-stat danger"><b>${pending}</b><span>Pendientes</span></div>
      <div class="picking-stat restock-stat"><b>${zones.length}</b><span>Zonas · ${racks.length} racks</span></div>`;
    modal.__restockRows = rows;
    if(!rows.length){
      host.innerHTML = '<div class="empty picking-empty">No hay productos con Cant. Restock mayor a 0 en el filtro actual.</div>';
      return;
    }
    const groupMode = modal.querySelector('#restockGroupMode')?.value || 'zone';
    let lastGroup = '';
    host.innerHTML = rows.map((r,i)=>{
      const p = r.product || {};
      const img = getProductImageUrls(p)[0] || '';
      const loc = p.ubicacion || p.almacen || '—';
      const group = groupMode === 'rack' ? (r.sort.rack || 'Sin rack') : (r.sort.zone || 'Sin zona');
      const heading = group !== lastGroup ? `<div class="restock-group-title">${escapeHtml(groupMode === 'rack' ? 'Rack ' : 'Zona ')}${escapeHtml(group)}</div>` : '';
      lastGroup = group;
      const place = `${escapeHtml(r.sort.zone)} · ${escapeHtml(r.sort.rack || '')} · N${escapeHtml(r.sort.parsed?.level || '')}-S${escapeHtml(r.sort.parsed?.slot || '')}`;
      return `${heading}<article class="picking-row restock-row ${r.reviewed ? 'is-reviewed' : 'is-pending'}" data-restock-row="${i}">
        <div class="picking-order restock-qty">${escapeHtml(r.qty)}</div>
        <div class="picking-thumb ${img ? '' : 'empty'}">${img ? `<img src="${escapeHtml(img)}" alt="">` : '—'}</div>
        <div class="picking-main">
          <div class="picking-title">${escapeHtml(p.nombre || 'Sin nombre')}</div>
          <div class="picking-sub">${escapeHtml(p.sku || 'Sin SKU')} ${p.variante ? '· '+escapeHtml(p.variante) : ''}</div>
          <div class="picking-badges"><span>${place}</span><span>${r.reviewed ? 'Revisado' : 'Pendiente'}</span></div>
        </div>
        <div class="picking-loc"><small>Ubicación</small><b>${escapeHtml(loc)}</b></div>
        <div class="picking-actions">
          <button class="mini-btn" data-restock-action="review" data-index="${i}">${r.reviewed ? 'Desmarcar' : 'Marcar revisado'}</button>
          <button class="mini-btn" data-restock-action="select" data-index="${i}">Seleccionar</button>
          <button class="mini-btn" data-restock-action="loc" data-index="${i}">Ver ubicación</button>
          <button class="mini-btn" data-restock-action="copy" data-index="${i}">Copiar</button>
        </div>
      </article>`;
    }).join('');
    host.querySelectorAll('[data-restock-action]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const r = rows[Number(btn.dataset.index)];
        if(!r?.product) return;
        const action = btn.dataset.restockAction;
        if(action === 'review'){
          appState.ui.restockReviewed[r.key] = !appState.ui.restockReviewed[r.key];
          try{ saveAdminState?.(); }catch(_err){}
          renderRestockResults(modal);
          showToast(appState.ui.restockReviewed[r.key] ? 'Producto marcado como revisado.' : 'Producto regresó a pendiente.', 'success');
          return;
        }
        if(action === 'select'){
          selectProduct(r.product);
          showToast('Producto seleccionado en el viewer.', 'success');
        }
        if(action === 'loc'){
          selectProduct(r.product);
          openProductLocationModal(r.product);
        }
        if(action === 'copy'){
          navigator.clipboard?.writeText(r.product.ubicacion || r.product.almacen || '');
          showToast('Ubicación copiada.', 'success');
        }
      });
    });
  }

  function openRestockModal(){
    ensureRestockState();
    let modal = document.getElementById('restockModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'restockModal';
      modal.className = 'modal picking-modal restock-modal';
      modal.innerHTML = `<div class="modal-card picking-card restock-card">
        <button class="modal-close" id="btnCloseRestock" type="button">✕</button>
        <div class="modal-head picking-head restock-head">
          <div>
            <h2>Reposición / Restock</h2>
            <p>Lista los productos con Cant. Restock mayor a 0, los ordena por zona, rack, nivel y slot, y permite marcar cada ítem como revisado.</p>
          </div>
          <div class="picking-head-actions">
            <button class="action-btn" id="btnRefreshRestock" type="button">Actualizar ruta</button>
            <button class="seg-btn" id="btnExportRestock" type="button">Exportar CSV</button>
          </div>
        </div>
        <div class="picking-context" id="restockContext"></div>
        <div class="restock-controls">
          <input id="restockSearch" class="restock-search" placeholder="Filtrar por SKU, nombre, color, talla, rack o ubicación">
          <select id="restockGroupMode" class="restock-select"><option value="zone">Agrupar por zona</option><option value="rack">Agrupar por rack</option></select>
          <label class="restock-check"><input id="restockPendingOnly" type="checkbox"> Solo pendientes</label>
        </div>
        <div class="picking-stats" id="restockStats"></div>
        <div class="picking-results restock-results" id="restockResults"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e=>{ if(e.target === modal) modal.classList.remove('show'); });
      modal.querySelector('#btnCloseRestock').addEventListener('click', ()=>modal.classList.remove('show'));
      modal.querySelector('#restockSearch').addEventListener('input', debounce(()=>renderRestockResults(modal), 90));
      modal.querySelector('#restockGroupMode').addEventListener('change', ()=>renderRestockResults(modal));
      modal.querySelector('#restockPendingOnly').addEventListener('change', ()=>renderRestockResults(modal));
      modal.querySelector('#btnRefreshRestock').addEventListener('click', ()=>renderRestockResults(modal));
      modal.querySelector('#btnExportRestock').addEventListener('click', ()=>{
        const rows = modal.__restockRows || [];
        rows.length ? downloadRestockCsv(rows) : showToast('No hay productos para exportar.', 'warn');
      });
    }
    const branch = (appState.admin?.branches || [])[getActiveBranchIndex?.() ?? appState.activeBranchIndex] || {};
    modal.querySelector('#restockContext').innerHTML = `<span>Sucursal: <b>${escapeHtml(branch.name || 'Actual')}</b></span><span>Productos cargados: <b>${Number((appState.products || []).length).toLocaleString('es-PE')}</b></span><span>Fuente: <b>Cant. Restock</b></span><span>Orden: <b>Zona → Rack → Nivel → Slot</b></span>`;
    const input = modal.querySelector('#restockSearch');
    input.value = appState.ui.restockFilters.search || '';
    modal.querySelector('#restockPendingOnly').checked = !!appState.ui.restockFilters.pendingOnly;
    modal.querySelector('#restockGroupMode').value = appState.ui.restockFilters.group || 'zone';
    renderRestockResults(modal);
    modal.classList.add('show');
    setTimeout(()=>input.focus(), 80);
  }

  ensureRestockUi();


  toggleSidebar.addEventListener('click', () => {
    appRoot.classList.toggle('sidebar-collapsed');
    toggleSidebar.textContent = appRoot.classList.contains('sidebar-collapsed') ? '❯' : '❮';
    if(appState && appState.screen) setScreen(appState.screen);
  });

  let responsiveResizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(responsiveResizeTimer);
    responsiveResizeTimer = setTimeout(() => {
      if(appState && appState.screen) setScreen(appState.screen);
    }, 90);
  });
  menuItems.forEach(item => {
    if(item.dataset.screen === 'card'){ item.remove(); return; }
    item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); setScreen(item.dataset.screen); return false; };
  });
  if(btnSearch) btnSearch.addEventListener('click', (e)=>{ e.preventDefault(); filterProducts(); });
  if(searchInput){
    searchInput.addEventListener('input', debounce(filterProducts, 90));
    searchInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); filterProducts(); } });
  }
  if($('#btnOpenCategoryPinterest')) { $('#btnOpenCategoryPinterest').addEventListener('click', openCategoryPinterestModal); updateCategoryFilterButton(); }
  if($('#btnOpenDataQuality')) { $('#btnOpenDataQuality').addEventListener('click', openDataQualityModal); }
  if($('#toggleGroupProducts')) { $('#toggleGroupProducts').classList.add('active'); $('#toggleGroupProducts').textContent = 'Productos'; $('#toggleGroupProducts').onclick = () => { appState.ui.productGroupMode = true; renderProducts(appState.filtered && appState.filtered.length ? appState.filtered : appState.products); }; }
  if(btnScanCode) btnScanCode.addEventListener('click', () => openScanner('qr'));
  btnCloseScanner.addEventListener('click', stopScanner);
  btnStopScanner.addEventListener('click', stopScanner);
  scannerModal.addEventListener('click', (e) => { if (e.target === scannerModal) stopScanner(); });

console.info('*** REHYDRATION + SESSION RETRY FIX ACTIVE ***');
  async function bootstrapApp(){
    ensureAppRuntimeState();
    loadUiTheme();
    const viewerToken = getViewerTokenFromUrl();
    if(viewerToken){
      try{
        await loadViewerLinkState(viewerToken);
      }catch(err){
        console.error('No se pudo cargar el link de visualización:', err);
        alert(err.message || 'No se pudo abrir el link de visualización.');
      }
    }else{
      await checkSession();
      if(appState.auth?.loggedIn){
        await loadRemoteAppState();
        await loadAllBranchSheetConfigsFromServer();
        rehydratePersistedBranchView();
      }
    }
    const hasRemoteProducts = Array.isArray(appState.products) && appState.products.length;
    if(!hasRemoteProducts){
      if(viewerToken){
        // En modo viewer por token no usar demo ni localStorage, solo datos remotos.
      }else if(appState.auth?.loggedIn){
        const branches = Array.isArray(appState.admin?.branches) ? appState.admin.branches : [];
        const activeIdx = getPersistedPreferredBranchIndex();
        const linkedIdx = branches.findIndex(b => (Array.isArray(b?.sheetPreviewProducts) && b.sheetPreviewProducts.length) || String(b?.sheetUrl || '').trim() || Number(b?.lastSheetCount || 0) > 0);
        if(linkedIdx >= 0){
          const targetIdx = activeIdx >= 0 ? activeIdx : linkedIdx;
          const targetBranch = branches[targetIdx] || branches[linkedIdx];
          if(Array.isArray(targetBranch?.sheetPreviewProducts) && targetBranch.sheetPreviewProducts.length){
            applyBranchProducts(targetBranch.sheetPreviewProducts.slice(0,50000), targetIdx);
            try{ loadLayoutForBranch(targetIdx); }catch(_err){}
          }else{
            await activateBranchSelection(targetIdx >= 0 ? targetIdx : linkedIdx);
          }
        }else{
          rehydratePersistedBranchView();
        }
      }else if(appState.auth?.transientUnavailable){
        console.warn('Se evita cargar demo porque el servicio/sesión aún se está recuperando.');
      }else{
        seedState();
        loadProductsLocal();
      }
    }else{
      rehydratePersistedBranchView();
    }
    renderProducts(appState.filtered && appState.filtered.length ? appState.filtered : appState.products);
    bindActiveProductCardExpansion();
    if(appState.products[0]) selectProduct(appState.products[0]);
    else syncActiveProductCardHint();
    applyBrand();
    if(viewerToken){
      setScreen('viewer');
      closeAuthModal(true);
    }else if(appState.auth?.loggedIn){
      const preferredScreen = appState.auth?.role === 'viewer' ? 'viewer' : getLastAppScreen();
      setScreen(preferredScreen);
      closeAuthModal(true);
    }else if(appState.auth?.transientUnavailable){
      setScreen('viewer');
      openAuthModal('Conectando con el servicio…');
    }else{
      appState.auth = { ...(appState.auth||{}), loggedIn:false, viewerGuest:false, role:'viewer' };
      setScreen('viewer');
      openAuthModal('');
    }
    applyRoleUi();
  }

  if(btnAuthAction) btnAuthAction.onclick = () => { if(appState.auth?.loggedIn) doLogout(); else openAuthModal(); };
  if(btnFocusProductMap) btnFocusProductMap.onclick = (e) => { e.stopPropagation(); openProductLocationModal(appState.selectedProduct); };
  if(btnOpenViewerFromProduct) btnOpenViewerFromProduct.onclick = (e) => { e.stopPropagation(); setScreen('viewer'); renderMapView(); };
  if(btnAuthClose) btnAuthClose.onclick = () => closeAuthModal();
  if(btnDoLogin){ btnDoLogin.onclick = doLogin; }
  if(authMode) authMode.addEventListener('change', syncAuthModeUi);
  if(authRole) authRole.addEventListener('change', syncAuthModeUi);
  document.querySelectorAll('.auth-segment-btn').forEach(btn => btn.addEventListener('click', ()=> setAuthMode(btn.dataset.mode || 'login')));
  document.querySelectorAll('.auth-role-card').forEach(btn => btn.addEventListener('click', ()=> setAuthRole(btn.dataset.role || 'admin')));
  if(btnToggleAuthMode){ const __toggleAuthMode = () => setAuthMode((authMode?.value || 'login') === 'register' ? 'login' : 'register'); btnToggleAuthMode.onclick = __toggleAuthMode; }
  if(authModal) authModal.addEventListener('click', (e) => { if(e.target === authModal) closeAuthModal(); });
  if(btnContinueViewer){ btnContinueViewer.onclick = continueAsViewer; }
  if(loginPassword) loginPassword.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') doLogin(); });
  if(loginUsername) loginUsername.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') doLogin(); });



  // V56 - Enfoque principal: visualización de ubicación del producto
  function getLocationPartsForVisual(product, type='primary'){
    const prod = product || {};
    const isStore = type === 'store';
    const ctx = getViewerProductLocationContext(prod);
    const rackId = isStore ? (ctx.storeRackId || prod.rackStore || '') : (ctx.primaryRackId || prod.rack || '');
    const rack = rackId ? findRackById(rackId) : null;
    const zone = rack?.zoneId ? findZoneById(rack.zoneId) : null;
    const locText = isStore ? (ctx.storeLoc || prod.almacen || '') : (ctx.primaryLoc || prod.ubicacion || '');
    return {
      label: isStore ? 'Ubicación en almacén' : 'Ubicación principal',
      shortLabel: isStore ? 'Almacén' : 'Ubicación',
      icon: isStore ? '◫' : '⌖',
      loc: locText || '—',
      zone: prod[isStore ? 'zonaStore' : 'zona'] || zone?.name || zone?.id || '—',
      rack: rackId || prod[isStore ? 'rackStore' : 'rack'] || '—',
      level: prod[isStore ? 'nivelStore' : 'nivel'] || prod.nivel || '—',
      slot: prod[isStore ? 'slotStore' : 'slot'] || prod.slot || '—',
      hasRack: !!rackId,
      rackFound: !!rack,
      zoneFound: !!zone
    };
  }
  function renderVisualLocationCard(parts, active=false){
    const state = parts.rackFound ? 'Rack encontrado en layout' : (parts.hasRack ? 'Rack no encontrado en layout' : 'Ubicación incompleta');
    return `<article class="visual-location-card ${active ? 'active' : ''} ${parts.rackFound ? 'ok' : 'warn'}">
      <div class="visual-location-card-head">
        <div class="visual-loc-icon">${escapeHtml(parts.icon)}</div>
        <div><b>${escapeHtml(parts.label)}</b><small>${escapeHtml(state)}</small></div>
      </div>
      <div class="visual-loc-full">${escapeHtml(parts.loc)}</div>
      <div class="visual-loc-breakdown">
        <span><small>Zona</small><b>${escapeHtml(parts.zone)}</b></span>
        <span><small>Rack</small><b>${escapeHtml(parts.rack)}</b></span>
        <span><small>Nivel</small><b>${escapeHtml(parts.level)}</b></span>
        <span><small>Slot</small><b>${escapeHtml(parts.slot)}</b></span>
      </div>
    </article>`;
  }
  function getProductFamilyVariants(product){
    const prod = product || {};
    const byName = norm(prod.nombre || '');
    const bySku = norm(prod.sku || '');
    const products = Array.isArray(appState.products) ? appState.products : [];
    return products.filter(p => {
      if(byName && norm(p.nombre || '') === byName) return true;
      if(bySku && norm(p.sku || '') === bySku) return true;
      return false;
    }).slice(0, 80);
  }
  function renderVariantLocationRows(product){
    const items = getProductFamilyVariants(product);
    if(!items.length) return '<div class="muted tiny">No se detectaron variantes relacionadas.</div>';
    return items.slice(0, 12).map((p, idx) => {
      const color = getProductColorValue(p) || p.color || '—';
      const size = getProductSizeValue(p) || p.talla || '—';
      const active = getProductIdentityKey(p) === getProductIdentityKey(product);
      const loc = p.ubicacion || p.almacen || '—';
      return `<button class="variant-location-row ${active ? 'active' : ''}" type="button" data-v56-variant-index="${idx}">
        <span class="variant-location-main"><b>${escapeHtml(p.variante || p.sku || 'Variante')}</b><small>${escapeHtml(color)} · Talla ${escapeHtml(size)}</small></span>
        <span class="variant-location-loc">${escapeHtml(loc)}</span>
      </button>`;
    }).join('') + (items.length > 12 ? `<div class="muted tiny visual-more-note">+ ${items.length - 12} variantes adicionales. Usa el botón Variantes para ver todas.</div>` : '');
  }
  function removeOperationalStockUi(){
    ['btnOpenPicking','btnOpenRestock','menuPickingBtn','menuRestockBtn'].forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('.picking-launch-btn,.restock-launch-btn,.picking-menu-item,.restock-menu-item').forEach(el => el.remove());
  }

  renderViewerProductInfoPanel = function(){
    clearViewerImageRotationTimer();
    removeOperationalStockUi();
    const ctx = getViewerProductLocationContext(appState.selectedProduct);
    const prod = appState.selectedProduct || null;
    detailTitle.textContent = 'Ubicación del producto';
    detailSubtitle.textContent = prod ? 'Visualización principal de zona, rack, nivel y slot.' : '';
    detailStatus.textContent = prod ? `Producto activo: ${prod.sku || '—'}` : 'Sin selección';
    detailChip.textContent = prod ? (prod.ubicacion || prod.almacen || '—') : '—';
    if(!prod){
      detailWrap.innerHTML = `<div class="viewer-product-info-card empty"><div class="empty compact"><b>Sin producto seleccionado</b><div class="muted tiny">Busca por SKU, código de barras, nombre, talla o color para ver su ubicación visual.</div></div></div>`;
      return;
    }
    const images = getProductImageUrls(prod).filter(Boolean);
    const img = images[0] || '';
    const thumbs = images.slice(0, 6).map((url, idx) => `<button class="viewer-product-thumb ${idx === 0 ? 'active' : ''}" type="button"><img src="${escapeHtml(url)}" alt="Vista ${idx + 1}"></button>`).join('');
    const family = getViewerProductFamilySummary(prod);
    const primary = getLocationPartsForVisual(prod, 'primary');
    const store = getLocationPartsForVisual(prod, 'store');
    const sizesHtml = family.sizes.length ? family.sizes.map(size => `<span class="viewer-variant-chip size">${escapeHtml(size)}</span>`).join('') : '<span class="muted tiny">Sin tallas detectadas</span>';
    const colorsHtml = family.colors.length ? family.colors.map(color => `<span class="viewer-variant-chip color" style="${getViewerColorChipStyle(color)}">${escapeHtml(color)}</span>`).join('') : '<span class="muted tiny">Sin colores detectados</span>';
    detailWrap.innerHTML = `
      <div class="viewer-product-info-card viewer-product-premium-card compact-fit product-only-panel visual-location-panel">
        <div class="visual-location-hero">
          <div class="viewer-media-col visual-media-col">
            <div class="viewer-product-media ${img ? '' : 'empty'}">
              ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(prod.nombre || 'Producto')}">` : '<span>Sin imagen</span>'}
              ${img ? '<button class="viewer-media-expand" type="button" title="Ampliar imagen">⛶</button>' : ''}
            </div>
            ${thumbs ? `<div class="viewer-product-thumbs">${thumbs}</div>` : ''}
          </div>
          <div class="visual-location-main-panel">
            <div class="viewer-product-copy tight">
              <div class="search-card-kicker">Producto seleccionado</div>
              <h2>${escapeHtml(prod.nombre || 'Sin nombre')}</h2>
              <div class="viewer-sku-pill">${escapeHtml(prod.sku || 'SKU —')}</div>
            </div>
            <div class="visual-location-cards">
              ${renderVisualLocationCard(primary, true)}
              ${renderVisualLocationCard(store, false)}
            </div>
          </div>
        </div>
        <div class="visual-location-quick-actions">
          <button class="btn primary viewer-location-btn" type="button" id="btnOpenLocationModal"><span>⌖</span> Ver en plano 2D</button>
          <button class="btn secondary viewer-location-btn nav3d-inline-btn" type="button" id="btnOpenNavigable3D"><span>◈</span> Ver en 3D</button>
          <button class="btn secondary viewer-location-btn" type="button" id="btnCopyLocation"><span>⧉</span> Copiar ubicación</button>
          <button class="btn secondary viewer-location-btn" type="button" id="btnOpenVariants"><span>▦</span> Variantes</button>
        </div>
        <div class="visual-location-support-grid">
          <div class="viewer-variant-panel visual-location-variants-card">
            <div class="viewer-variant-head"><span class="viewer-info-icon">▦</span><div><b>Variantes y ubicación</b><small>Selecciona una variante para cambiar el foco visual.</small></div></div>
            <div class="variant-location-list">${renderVariantLocationRows(prod)}</div>
          </div>
          <div class="viewer-variant-panel visual-location-summary-card">
            <div class="viewer-variant-head"><span class="viewer-info-icon">T</span><div><b>Tallas y colores del modelo</b><small>${family.sizes.length || 0} tallas · ${family.colors.length || 0} colores</small></div></div>
            <div class="viewer-variant-chip-wrap compact"><b class="visual-mini-label">Tallas</b>${sizesHtml}</div>
            <div class="viewer-variant-chip-wrap compact"><b class="visual-mini-label">Colores</b>${colorsHtml}</div>
          </div>
        </div>
      </div>`;
    document.getElementById('btnOpenLocationModal')?.addEventListener('click', () => openProductLocationModal(prod));
    document.getElementById('btnOpenNavigable3D')?.addEventListener('click', () => openNavigable3DModal(prod));
    document.getElementById('btnOpenVariants')?.addEventListener('click', () => openProductVariantsModal(prod));
    document.getElementById('btnCopyLocation')?.addEventListener('click', () => copySelectedProductLocation(prod));
    detailWrap.querySelectorAll('[data-v56-variant-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.v56VariantIndex || 0);
        const item = getProductFamilyVariants(prod)[idx];
        if(item){ selectProduct(item); showToast('Variante enfocada en el visor.', 'success'); }
      });
    });
    bindViewerProductImageCarousel(detailWrap, images, prod.nombre || prod.sku || 'Producto');
  };

  const __v56OriginalOpenProductLocationModal = openProductLocationModal;
  openProductLocationModal = function(product = appState.selectedProduct){
    const previousIso = appState.ui.isoIsolation;
    appState.ui.isoIsolation = 'rack';
    __v56OriginalOpenProductLocationModal(product);
    const modal = document.getElementById('productLocationModal');
    if(modal){
      modal.classList.add('v56-visual-location-modal');
      const title = modal.querySelector('.location-modal-head b');
      if(title) title.textContent = 'Plano de ubicación del producto';
      const desc = modal.querySelector('.modal-iso-head .muted');
      if(desc) desc.textContent = 'Vista enfocada en zona, rack, nivel y slot del producto seleccionado.';
      const head = modal.querySelector('.location-modal-head-actions');
      if(head && !modal.querySelector('#btnV56CopyLocationModal')){
        const btn = document.createElement('button');
        btn.className = 'btn secondary';
        btn.id = 'btnV56CopyLocationModal';
        btn.type = 'button';
        btn.textContent = 'Copiar ubicación';
        btn.addEventListener('click', () => copySelectedProductLocation(product));
        head.insertBefore(btn, head.querySelector('.location-modal-close'));
      }
    }
    setTimeout(() => { appState.ui.isoIsolation = previousIso || appState.ui.isoIsolation; }, 0);
  };

  function applyV56VisualLocationFocus(){
    removeOperationalStockUi();
    const productTitle = document.querySelector('.search-panel .panel-header h2');
    if(productTitle) productTitle.textContent = 'Buscar ubicación';
    const productHint = document.querySelector('.search-panel .panel-header .muted.tiny');
    if(productHint) productHint.textContent = 'Busca un producto para ver zona, rack, nivel y slot en 2D/3D.';
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.placeholder = 'Buscar producto para ubicar: SKU, barras, nombre, color o talla...';
    const activeBtn = document.getElementById('btnFocusProductMap');
    if(activeBtn) activeBtn.textContent = 'Ver ubicación visual';
    const viewerBtn = document.getElementById('btnOpenViewerFromProduct');
    if(viewerBtn) viewerBtn.textContent = 'Abrir visor de ubicación';
  }
  setTimeout(applyV56VisualLocationFocus, 0);
  setTimeout(applyV56VisualLocationFocus, 600);
  setTimeout(applyV56VisualLocationFocus, 1600);


  // V57 - Limpieza del visor: sin información redundante ni botón copiar ubicación
  function renderCompactVariantLocationRowsV57(product){
    const items = getProductFamilyVariants(product);
    if(!items.length) return '<div class="muted tiny">No se detectaron variantes relacionadas.</div>';
    return items.slice(0, 10).map((p, idx) => {
      const color = getProductColorValue(p) || p.color || '—';
      const size = getProductSizeValue(p) || p.talla || '—';
      const active = getProductIdentityKey(p) === getProductIdentityKey(product);
      const loc = p.ubicacion || p.almacen || '—';
      return `<button class="variant-location-row ${active ? 'active' : ''}" type="button" data-v57-variant-index="${idx}">
        <span class="variant-location-main"><b>${escapeHtml(p.variante || color || p.sku || 'Variante')}</b><small>Talla ${escapeHtml(size)} · ${escapeHtml(color)}</small></span>
        <span class="variant-location-loc">${escapeHtml(loc)}</span>
      </button>`;
    }).join('') + (items.length > 10 ? `<div class="muted tiny visual-more-note">+ ${items.length - 10} variantes adicionales.</div>` : '');
  }

  renderViewerProductInfoPanel = function(){
    clearViewerImageRotationTimer();
    removeOperationalStockUi();
    const prod = appState.selectedProduct || null;
    detailTitle.textContent = 'Ubicación del producto';
    detailSubtitle.textContent = '';
    detailStatus.textContent = prod ? '' : 'Sin selección';
    detailChip.textContent = '';
    if(!prod){
      detailWrap.innerHTML = `<div class="viewer-product-info-card empty"><div class="empty compact"><b>Sin producto seleccionado</b><div class="muted tiny">Busca un producto para ver su zona, rack, nivel y slot.</div></div></div>`;
      return;
    }
    const images = getProductImageUrls(prod).filter(Boolean);
    const img = images[0] || '';
    const thumbs = images.slice(0, 5).map((url, idx) => `<button class="viewer-product-thumb ${idx === 0 ? 'active' : ''}" type="button"><img src="${escapeHtml(url)}" alt="Vista ${idx + 1}"></button>`).join('');
    const primary = getLocationPartsForVisual(prod, 'primary');
    const store = getLocationPartsForVisual(prod, 'store');
    const showStore = String(store.full || '').trim() && String(store.full || '').trim() !== String(primary.full || '').trim();
    detailWrap.innerHTML = `
      <div class="viewer-product-info-card viewer-product-premium-card compact-fit product-only-panel visual-location-panel v57-clean-location-panel">
        <div class="visual-location-hero v57-location-hero">
          <div class="viewer-media-col visual-media-col">
            <div class="viewer-product-media ${img ? '' : 'empty'}">
              ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(prod.nombre || 'Producto')}">` : '<span>Sin imagen</span>'}
              ${img ? '<button class="viewer-media-expand" type="button" title="Ampliar imagen">⛶</button>' : ''}
            </div>
            ${thumbs ? `<div class="viewer-product-thumbs">${thumbs}</div>` : ''}
          </div>
          <div class="visual-location-main-panel">
            <div class="viewer-product-copy tight v57-product-title-block">
              <h2>${escapeHtml(prod.nombre || 'Sin nombre')}</h2>
              ${prod.sku ? `<div class="viewer-sku-pill">${escapeHtml(prod.sku)}</div>` : ''}
            </div>
            <div class="visual-location-cards v57-location-cards">
              ${renderVisualLocationCard(primary, true)}
              ${showStore ? renderVisualLocationCard(store, false) : ''}
            </div>
          </div>
        </div>
        <div class="visual-location-quick-actions v57-location-actions">
          <button class="btn primary viewer-location-btn" type="button" id="btnOpenLocationModal"><span>⌖</span> Ver en plano 2D</button>
          <button class="btn secondary viewer-location-btn nav3d-inline-btn" type="button" id="btnOpenNavigable3D"><span>◈</span> Ver en 3D</button>
          <button class="btn secondary viewer-location-btn" type="button" id="btnOpenVariants"><span>▦</span> Variantes</button>
        </div>
        <div class="viewer-variant-panel visual-location-variants-card v57-variants-card">
          <div class="viewer-variant-head"><span class="viewer-info-icon">▦</span><div><b>Variantes con ubicación</b><small>Solo muestra variantes relacionadas y su ubicación.</small></div></div>
          <div class="variant-location-list">${renderCompactVariantLocationRowsV57(prod)}</div>
        </div>
      </div>`;
    document.getElementById('btnOpenLocationModal')?.addEventListener('click', () => openProductLocationModal(prod));
    document.getElementById('btnOpenNavigable3D')?.addEventListener('click', () => openNavigable3DModal(prod));
    document.getElementById('btnOpenVariants')?.addEventListener('click', () => openProductVariantsModal(prod));
    detailWrap.querySelectorAll('[data-v57-variant-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.v57VariantIndex || 0);
        const item = getProductFamilyVariants(prod)[idx];
        if(item){ selectProduct(item); showToast('Variante enfocada en el visor.', 'success'); }
      });
    });
    bindViewerProductImageCarousel(detailWrap, images, prod.nombre || prod.sku || 'Producto');
  };

  openProductLocationModal = function(product = appState.selectedProduct){
    const previousIso = appState.ui.isoIsolation;
    appState.ui.isoIsolation = 'rack';
    __v56OriginalOpenProductLocationModal(product);
    const modal = document.getElementById('productLocationModal');
    if(modal){
      modal.classList.add('v56-visual-location-modal','v57-clean-location-modal');
      const title = modal.querySelector('.location-modal-head b');
      if(title) title.textContent = 'Plano de ubicación del producto';
      const desc = modal.querySelector('.modal-iso-head .muted');
      if(desc) desc.textContent = 'Vista enfocada en zona, rack, nivel y slot.';
      modal.querySelector('#btnV56CopyLocationModal')?.remove();
    }
    setTimeout(() => { appState.ui.isoIsolation = previousIso || appState.ui.isoIsolation; }, 0);
  };

  function applyV57CleanLocationFocus(){
    applyV56VisualLocationFocus();
    document.getElementById('btnCopyLocation')?.remove();
    document.getElementById('btnV56CopyLocationModal')?.remove();
    document.querySelectorAll('[data-nav3d-product-action="copy"]').forEach(el => el.remove());
    const activeBtn = document.getElementById('btnFocusProductMap');
    if(activeBtn) activeBtn.textContent = 'Ver ubicación';
    const viewerBtn = document.getElementById('btnOpenViewerFromProduct');
    if(viewerBtn) viewerBtn.textContent = 'Abrir visor';
  }
  setTimeout(applyV57CleanLocationFocus, 0);
  setTimeout(applyV57CleanLocationFocus, 700);
  setTimeout(applyV57CleanLocationFocus, 1800);


  // V58 - Restaura el cuadro de propiedades del producto al diseño v54, manteniendo el resto del flujo actual.
  renderViewerProductInfoPanel = function(){
    clearViewerImageRotationTimer();
    if(typeof removeOperationalStockUi === 'function') removeOperationalStockUi();
    const ctx = getViewerProductLocationContext(appState.selectedProduct);
    const prod = appState.selectedProduct || null;
    detailTitle.textContent = 'Información del producto';
    detailSubtitle.textContent = '';
    detailStatus.textContent = prod ? `Producto activo: ${prod.sku || '—'}` : 'Sin selección';
    detailChip.textContent = prod ? (prod.ubicacion || '—') : '—';
    if(!prod){
      detailWrap.innerHTML = `<div class="viewer-product-info-card empty"><div class="empty compact"><b>Sin producto seleccionado</b><div class="muted tiny">Usa la búsqueda central para seleccionar un producto y ver sus variantes.</div></div></div>`;
      return;
    }
    const images = getProductImageUrls(prod).filter(Boolean);
    const img = images[0] || '';
    const thumbs = images.slice(0, 6).map((url, idx) => `<button class="viewer-product-thumb ${idx === 0 ? 'active' : ''}" type="button"><img src="${escapeHtml(url)}" alt="Vista ${idx + 1}"></button>`).join('');
    const family = getViewerProductFamilySummary(prod);
    const sizesHtml = family.sizes.length
      ? family.sizes.map(size => `<span class="viewer-variant-chip size">${escapeHtml(size)}</span>`).join('')
      : '<span class="muted tiny">Sin tallas detectadas</span>';
    const colorsHtml = family.colors.length
      ? family.colors.map(color => `<span class="viewer-variant-chip color" style="${getViewerColorChipStyle(color)}">${escapeHtml(color)}</span>`).join('')
      : '<span class="muted tiny">Sin colores detectados</span>';
    detailWrap.innerHTML = `
      <div class="viewer-product-info-card viewer-product-premium-card compact-fit product-only-panel v58-restored-product-panel">
        <div class="viewer-product-top-layout">
          <div class="viewer-media-col">
            <div class="viewer-product-media ${img ? '' : 'empty'}">
              ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(prod.nombre || 'Producto')}">` : '<span>Sin imagen</span>'}
              ${img ? '<button class="viewer-media-expand" type="button" title="Ampliar imagen">⛶</button>' : ''}
            </div>
            ${thumbs ? `<div class="viewer-product-thumbs">${thumbs}</div>` : ''}
          </div>
          <div class="viewer-side-col">
            <div class="viewer-product-copy tight">
              <div class="search-card-kicker">Producto</div>
              <h2>${escapeHtml(prod.nombre || 'Sin nombre')}</h2>
              <div class="viewer-sku-pill">${escapeHtml(prod.sku || 'SKU —')}</div>
            </div>
            <div class="viewer-info-grid viewer-info-icon-grid top-right-grid location-only-grid">
              <div class="search-meta-block emphasis"><span class="viewer-info-icon">⌖</span><span class="search-meta-label">Ubicación</span><span class="search-meta-value">${escapeHtml(ctx.primaryLoc)}</span></div>
              <div class="search-meta-block emphasis"><span class="viewer-info-icon">◫</span><span class="search-meta-label">Ubicación en almacén</span><span class="search-meta-value store">${escapeHtml(ctx.storeLoc)}</span></div>
            </div>
          </div>
        </div>
        <div class="viewer-bottom-info product-variants-only">
          <div class="viewer-variant-panel">
            <div class="viewer-variant-head"><span class="viewer-info-icon">T</span><div><b>Tallas del modelo</b><small>${family.sizes.length || 0} registradas</small></div></div>
            <div class="viewer-variant-chip-wrap">${sizesHtml}</div>
          </div>
          <div class="viewer-variant-panel">
            <div class="viewer-variant-head"><span class="viewer-info-icon color-dot"></span><div><b>Colores del modelo</b><small>${family.colors.length || 0} registrados</small></div></div>
            <div class="viewer-variant-chip-wrap">${colorsHtml}</div>
          </div>
        </div>
        <div class="viewer-location-actions viewer-location-actions-extended"><button class="btn primary viewer-location-btn" type="button" id="btnOpenLocationModal"><span>⌖</span> Ver ubicación</button><button class="btn secondary viewer-location-btn nav3d-inline-btn" type="button" id="btnOpenNavigable3D"><span>◈</span> 3D navegable</button><button class="btn secondary viewer-location-btn" type="button" id="btnOpenVariants"><span>▦</span> Variantes</button></div>
      </div>`;
    document.getElementById('btnOpenLocationModal')?.addEventListener('click', () => openProductLocationModal(prod));
    document.getElementById('btnOpenNavigable3D')?.addEventListener('click', () => openNavigable3DModal(prod));
    document.getElementById('btnOpenVariants')?.addEventListener('click', () => openProductVariantsModal(prod));
    bindViewerProductImageCarousel(detailWrap, images, prod.nombre || prod.sku || 'Producto');
  };



  // V59 - Restaura el cuadro de propiedades del producto al diseño base v54, manteniendo el resto del sistema actual.
  renderViewerProductInfoPanel = function(){
    clearViewerImageRotationTimer();
    if(typeof removeOperationalStockUi === 'function') removeOperationalStockUi();
    const ctx = getViewerProductLocationContext(appState.selectedProduct);
    const prod = appState.selectedProduct || null;
    detailTitle.textContent = 'Información del producto';
    detailSubtitle.textContent = '';
    detailStatus.textContent = prod ? `Producto activo: ${prod.sku || '—'}` : 'Sin selección';
    detailChip.textContent = prod ? (prod.ubicacion || '—') : '—';
    if(!prod){
      detailWrap.innerHTML = `<div class="viewer-product-info-card empty"><div class="empty compact"><b>Sin producto seleccionado</b><div class="muted tiny">Usa la búsqueda central para seleccionar un producto y ver sus variantes.</div></div></div>`;
      return;
    }
    const images = getProductImageUrls(prod).filter(Boolean);
    const img = images[0] || '';
    const thumbs = images.slice(0, 6).map((url, idx) => `<button class="viewer-product-thumb ${idx === 0 ? 'active' : ''}" type="button"><img src="${escapeHtml(url)}" alt="Vista ${idx + 1}"></button>`).join('');
    const family = getViewerProductFamilySummary(prod);
    const sizesHtml = family.sizes.length
      ? family.sizes.map(size => `<span class="viewer-variant-chip size">${escapeHtml(size)}</span>`).join('')
      : '<span class="muted tiny">Sin tallas detectadas</span>';
    const colorsHtml = family.colors.length
      ? family.colors.map(color => `<span class="viewer-variant-chip color" style="${getViewerColorChipStyle(color)}">${escapeHtml(color)}</span>`).join('')
      : '<span class="muted tiny">Sin colores detectados</span>';
    detailWrap.innerHTML = `
      <div class="viewer-product-info-card viewer-product-premium-card compact-fit product-only-panel">
        <div class="viewer-product-top-layout">
          <div class="viewer-media-col">
            <div class="viewer-product-media ${img ? '' : 'empty'}">
              ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(prod.nombre || 'Producto')}">` : '<span>Sin imagen</span>'}
              ${img ? '<button class="viewer-media-expand" type="button" title="Ampliar imagen">⛶</button>' : ''}
            </div>
            ${thumbs ? `<div class="viewer-product-thumbs">${thumbs}</div>` : ''}
          </div>
          <div class="viewer-side-col">
            <div class="viewer-product-copy tight">
              <div class="search-card-kicker">Producto</div>
              <h2>${escapeHtml(prod.nombre || 'Sin nombre')}</h2>
              <div class="viewer-sku-pill">${escapeHtml(prod.sku || 'SKU —')}</div>
            </div>
            <div class="viewer-info-grid viewer-info-icon-grid top-right-grid location-only-grid">
              <div class="search-meta-block emphasis"><span class="viewer-info-icon">⌖</span><span class="search-meta-label">Ubicación</span><span class="search-meta-value">${escapeHtml(ctx.primaryLoc)}</span></div>
              <div class="search-meta-block emphasis"><span class="viewer-info-icon">◫</span><span class="search-meta-label">Ubicación en almacén</span><span class="search-meta-value store">${escapeHtml(ctx.storeLoc)}</span></div>
            </div>
          </div>
        </div>
        <div class="viewer-bottom-info product-variants-only">
          <div class="viewer-variant-panel">
            <div class="viewer-variant-head"><span class="viewer-info-icon">T</span><div><b>Tallas del modelo</b><small>${family.sizes.length || 0} registradas</small></div></div>
            <div class="viewer-variant-chip-wrap">${sizesHtml}</div>
          </div>
          <div class="viewer-variant-panel">
            <div class="viewer-variant-head"><span class="viewer-info-icon color-dot"></span><div><b>Colores del modelo</b><small>${family.colors.length || 0} registrados</small></div></div>
            <div class="viewer-variant-chip-wrap">${colorsHtml}</div>
          </div>
        </div>
        <div class="viewer-location-actions viewer-location-actions-extended"><button class="btn primary viewer-location-btn" type="button" id="btnOpenLocationModal"><span>⌖</span> Ver ubicación</button><button class="btn secondary viewer-location-btn nav3d-inline-btn" type="button" id="btnOpenNavigable3D"><span>◈</span> 3D navegable</button><button class="btn secondary viewer-location-btn" type="button" id="btnOpenVariants"><span>▦</span> Variantes</button></div>
      </div>`;
    document.getElementById('btnOpenLocationModal')?.addEventListener('click', () => openProductLocationModal(prod));
    document.getElementById('btnOpenNavigable3D')?.addEventListener('click', () => openNavigable3DModal(prod));
    document.getElementById('btnOpenVariants')?.addEventListener('click', () => openProductVariantsModal(prod));
    bindViewerProductImageCarousel(detailWrap, images, prod.nombre || prod.sku || 'Producto');
  };




  bootstrapApp();

})();
