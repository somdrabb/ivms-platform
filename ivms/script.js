// DOM elements
const API_BASE = window.API_BASE || 'http://127.0.0.1:4000/api';
window.API_BASE = API_BASE;
const inventoryBody = document.getElementById("inventory-body");
const addProductPopup = document.getElementById("add-product-popup");
const duplicatePopup = document.getElementById("duplicate-popup");
const inventoryHistoryBtn = document.getElementById('inventory-history-btn');
const bulkDeletePopup = document.getElementById('bulk-delete-popup');
const bulkDeletePasswordInput = document.getElementById('bulk-delete-password');
const bulkDeleteError = document.getElementById('bulk-delete-error');
const bulkDeleteConfirmBtn = document.getElementById('bulk-delete-confirm');
const bulkDeleteCancelBtn = document.getElementById('bulk-delete-cancel');
const eslGrid = document.getElementById('esl-grid');
const eslEmptyState = document.getElementById('esl-empty');
const eslSearchInput = document.getElementById('esl-search');
const eslFormatSelect = document.getElementById('esl-format-select');
const eslHighlightToggle = document.getElementById('esl-highlight-promos');
const eslSelectAllBtn = document.getElementById('esl-select-all');
const eslClearSelectionBtn = document.getElementById('esl-clear-selection');
const eslPrintBtn = document.getElementById('esl-print-btn');
const eslSelectionCount = document.getElementById('esl-selection-count');
const eslPrintContainer = document.getElementById('esl-print-container');
const expiryRelativeSelect = document.getElementById('expiry-relative-select');
const warehouseSelect = document.getElementById('warehouse-select');
const transferModal = document.getElementById('transfer-modal');
const transferForm = document.getElementById('transfer-form');
const transferProductSelect = document.getElementById('transfer-product-select');
const transferSourceSelect = document.getElementById('transfer-source-select');
const transferDestinationSelect = document.getElementById('transfer-destination-select');
const transferQuantityInput = document.getElementById('transfer-quantity-input');
const transferNoteInput = document.getElementById('transfer-note-input');
const transferError = document.getElementById('transfer-error');
const transferSubmitBtn = document.getElementById('transfer-submit-btn');
const transferProductSummary = document.getElementById('transfer-product-summary');
const transferQueueSection = document.getElementById('transfer-queue');
const transferQueueList = document.getElementById('transfer-queue-list');
const retryAllTransfersBtn = document.getElementById('retry-all-transfers-btn');
const clearTransfersBtn = document.getElementById('clear-transfers-btn');
const transferActivityContainer = document.getElementById('transfer-activity');
const transferActivityList = document.getElementById('transfer-activity-list');
const clearTransferActivityBtn = document.getElementById('clear-transfer-activity-btn');
const purchaseTableBody = document.getElementById('purchase-table-body');
const purchaseEmptyState = document.getElementById('purchase-empty');
const purchaseModal = document.getElementById('purchase-modal');
const purchaseForm = document.getElementById('purchase-form');
const purchaseErrorEl = document.getElementById('purchase-error');
const purchaseModalHeadingText = document.getElementById('purchase-modal-heading-text');
const purchaseOrderNumberInput = document.getElementById('purchase-order-number');
const purchaseSupplierInput = document.getElementById('purchase-supplier');
const purchaseStatusSelect = document.getElementById('purchase-status');
const purchaseWarehouseSelect = document.getElementById('purchase-warehouse');
const purchaseExpectedInput = document.getElementById('purchase-expected-date');
const purchaseTotalItemsInput = document.getElementById('purchase-total-items');
const purchaseTotalCostInput = document.getElementById('purchase-total-cost');
const purchaseNotesInput = document.getElementById('purchase-notes');
const purchaseTotalCountEl = document.getElementById('purchase-total-count');
const purchaseOpenCountEl = document.getElementById('purchase-open-count');
const purchaseDueTodayEl = document.getElementById('purchase-due-today');
const purchaseItemsBody = document.getElementById('purchase-items-body');
const purchaseItemsEmptyRow = document.getElementById('purchase-items-empty');
const purchaseAddItemBtn = document.getElementById('purchase-add-item-btn');
const purchaseProductOptions = document.getElementById('purchase-product-options');
const purchaseReceivedDateInput = document.getElementById('purchase-received-date');
const purchaseTrackingNumberInput = document.getElementById('purchase-tracking-number');
const purchaseTotalsWarning = document.getElementById('purchase-totals-warning');
const purchaseAttachmentsInput = document.getElementById('purchase-attachments-input');
const purchaseAttachmentsList = document.getElementById('purchase-attachments-list');
const purchaseNotificationsEl = document.getElementById('purchase-notifications');
const supplierReportBody = document.getElementById('supplier-report-body');
const purchaseSupplierExportBtn = document.getElementById('purchase-supplier-export');
const purchaseStatusFilter = document.getElementById('purchase-filter-status');
const purchaseWarehouseFilter = document.getElementById('purchase-filter-warehouse');
const purchaseSupplierFilter = document.getElementById('purchase-filter-supplier');
const purchaseFilterClearBtn = document.getElementById('purchase-filter-clear');
const createPurchaseBtn = document.getElementById('create-purchase-btn');
const emptyCreatePurchaseBtn = document.getElementById('empty-create-purchase-btn');
const refreshPurchasesBtn = document.getElementById('refresh-purchases-btn');
const savePurchaseBtn = document.getElementById('save-purchase-btn');
const savePurchaseBtnText = document.getElementById('save-purchase-btn-text');
const categoryFilter = document.getElementById('category-filter');

let appInitialized = false;
if (purchaseTotalItemsInput) purchaseTotalItemsInput.readOnly = true;
if (purchaseTotalCostInput) purchaseTotalCostInput.readOnly = true;
const SHELF_LIFE_STORAGE_KEY = 'inventoryShelfLifeCodes';
const WAREHOUSE_STORAGE_KEY = 'inventoryWarehouses';
const WAREHOUSE_TRANSFER_STORAGE_KEY = 'inventoryWarehouseTransfers';
const SHELF_LIFE_OPTIONS = [
    '1D','2D','3D','4D','5D','6D','7D',
    '1W','2W','3W','4W',
    '1M','2M','3M','4M','5M','6M','9M','10M','12M'
];
const warehouseTableBody = document.getElementById('warehouse-table-body');
const warehouseModal = document.getElementById('warehouse-modal');
const warehouseForm = document.getElementById('warehouse-form');
const warehouseTotalCountEl = document.getElementById('warehouse-total-count');
const warehouseActiveCountEl = document.getElementById('warehouse-active-count');
const warehouseInactiveCountEl = document.getElementById('warehouse-inactive-count');
const warehouseAverageSkusEl = document.getElementById('warehouse-average-skus');
let warehouses = [];
let transferDrafts = [];
let purchaseOrders = [];
let purchaseOrdersAll = [];
let purchaseOrdersLoaded = false;
let purchaseEditingId = null;
let currentPurchaseDraft = null;
let purchasePreviousStatus = 'draft';
const purchaseFilterState = {
    status: 'all',
    warehouse: 'all',
    supplier: ''
};
let activeTransferProductId = '';
let transferProductOptionsSignature = '';
let transferRetryTimer = null;
const TRANSFER_RETRY_MIN_DELAY = 5000;
const TRANSFER_RETRY_MAX_DELAY = 60000;
const TRANSFER_RETRY_BATCH_SIZE = 3;
const MAX_TRANSFER_ACTIVITY = 10;
let transferActivityLog = [];
const purchaseProductLabelMap = new Map();
let pendingPurchaseAttachments = [];
let existingPurchaseAttachments = [];
let purchaseInitialTotals = { totalItems: 0, totalCost: 0 };

const onlineShopState = {
    root: document.getElementById('online-shop-root'),
    statusEl: document.getElementById('online-shop-status'),
    openBtn: document.getElementById('online-shop-open'),
    copyBtn: document.getElementById('online-shop-copy'),
    refreshBtn: document.getElementById('online-shop-refresh'),
    reloadPreviewBtn: document.getElementById('online-shop-reload-preview'),
    linksEl: document.getElementById('online-shop-links'),
    nameEl: document.getElementById('online-shop-name'),
    codeEl: document.getElementById('online-shop-code'),
    productsEl: document.getElementById('online-shop-products'),
    linkEl: document.getElementById('online-shop-link'),
    previewEl: document.getElementById('online-shop-preview'),
    baseUrl: null,
    shops: [],
    isLoading: false,
    statusTimer: null,
    initialized: false,
    needsFirstLoad: true
};

function deriveStorefrontBase() {
    if (onlineShopState.baseUrl) return onlineShopState.baseUrl;
    try {
        const apiUrl = new URL(API_BASE);
        let path = apiUrl.pathname.replace(/\/+$/, '');
        if (path.endsWith('/api')) {
            path = path.slice(0, -4);
        }
        apiUrl.pathname = `${path}/storefront/`.replace(/\/{2,}/g, '/');
        apiUrl.search = '';
        apiUrl.hash = '';
        onlineShopState.baseUrl = apiUrl.toString();
    } catch (err) {
        console.warn('Could not derive storefront base from API_BASE:', err);
        onlineShopState.baseUrl = 'http://127.0.0.1:4000/storefront/';
    }
    return onlineShopState.baseUrl;
}

async function fetchJson(url, options = {}) {
    const res = await fetchWithShop(url, {
        mode: 'cors',
        cache: 'no-store',
        ...options,
        headers: { 'Accept': 'application/json', ...(options.headers || {}) }
    });
    const text = await res.text();
    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const parsed = text ? JSON.parse(text) : null;
            if (parsed?.error) message = parsed.error;
        } catch {}
        throw new Error(message);
    }
    return text ? JSON.parse(text) : null;
}

function setOnlineShopStatus(message = '', tone = 'info', timeoutMs = 0) {
    const el = onlineShopState.statusEl;
    if (!el) return;
    if (onlineShopState.statusTimer) {
        clearTimeout(onlineShopState.statusTimer);
        onlineShopState.statusTimer = null;
    }
    if (!message) {
        el.textContent = '';
        el.classList.remove('show', 'is-error', 'is-success');
        return;
    }
    el.textContent = message;
    el.classList.add('show');
    el.classList.toggle('is-error', tone === 'error');
    el.classList.toggle('is-success', tone === 'success');
    if (timeoutMs > 0) {
        onlineShopState.statusTimer = setTimeout(() => setOnlineShopStatus(''), timeoutMs);
    }
}

function buildStorefrontLink(shop, { embed = false, bust = false } = {}) {
    const base = deriveStorefrontBase();
    let url;
    try {
        url = new URL(base);
    } catch {
        url = new URL(base, window.location.origin);
    }
    url.searchParams.set('shop', shop.id);
    if (shop.name) url.searchParams.set('name', shop.name);
    if (embed) url.searchParams.set('embed', '1');
    if (bust) url.searchParams.set('_ts', Date.now().toString(36));
    return url.toString();
}

async function fetchShopProductTotal(shopId) {
    try {
        const url = new URL(`${API_BASE.replace(/\/$/, '')}/products`);
        url.searchParams.set('shop', shopId);
        url.searchParams.set('limit', '1');
        url.searchParams.set('sort', 'updatedAt');
        url.searchParams.set('dir', 'desc');
        const payload = await fetchJson(url.toString());
        if (typeof payload?.total === 'number') return payload.total;
        if (Array.isArray(payload?.data)) return payload.data.length;
        if (Array.isArray(payload)) return payload.length;
    } catch (err) {
        console.warn(`Could not fetch product total for ${shopId}:`, err);
    }
    return 0;
}

async function fetchShopSummaries() {
    const shops = await fetchJson(`${API_BASE.replace(/\/$/, '')}/shops`);
    if (!Array.isArray(shops)) return [];
    const summaries = [];
    for (const shop of shops) {
        const total = await fetchShopProductTotal(shop.id);
        summaries.push({ ...shop, total });
    }
    return summaries;
}

function openStorefrontForShop(shop) {
    if (!shop) return;
    const link = buildStorefrontLink(shop);
    window.open(link, '_blank', 'noopener');
}

async function copyStorefrontLink(shop) {
    if (!shop) return;
    const link = buildStorefrontLink(shop);
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(link);
            setOnlineShopStatus('Storefront link copied to clipboard.', 'success', 2200);
        } else {
            const fallback = prompt('Copy storefront link', link);
            if (typeof fallback === 'string') {
                setOnlineShopStatus('Storefront link ready to share.', 'success', 2200);
            }
        }
    } catch (err) {
        console.warn('Clipboard copy failed:', err);
        const fallback = prompt('Copy storefront link', link);
        if (typeof fallback === 'string') {
            setOnlineShopStatus('Storefront link ready to share.', 'success', 2200);
        }
    }
}

function renderOnlineShopList() {
    const listEl = onlineShopState.linksEl;
    if (!listEl) return;
    if (!onlineShopState.shops.length) {
        listEl.innerHTML = '<li class="online-shop__list-item"><div class="online-shop__list-item-meta"><strong>No shops yet</strong><span>Create a shop to generate storefront links.</span></div></li>';
        return;
    }
    const frag = document.createDocumentFragment();
    onlineShopState.shops.forEach(shop => {
        const li = document.createElement('li');
        li.className = 'online-shop__list-item';
        li.dataset.shopId = shop.id;
        li.dataset.shopName = shop.name || '';

        const meta = document.createElement('div');
        meta.className = 'online-shop__list-item-meta';
        const heading = document.createElement('strong');
        heading.textContent = shop.name || shop.id;
        const info = document.createElement('span');
        const status = shop.isActive === false ? 'Inactive · ' : '';
        info.textContent = `${status}Code ${shop.code || '—'} · ${shop.total || 0} product${shop.total === 1 ? '' : 's'}`;
        const anchor = document.createElement('a');
        anchor.href = buildStorefrontLink(shop);
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.textContent = 'Open storefront';
        meta.append(heading, info, anchor);

        const actions = document.createElement('div');
        actions.className = 'online-shop__list-actions';
        const openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.dataset.action = 'open';
        openBtn.textContent = 'Open';
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.dataset.action = 'copy';
        copyBtn.textContent = 'Copy link';
        actions.append(openBtn, copyBtn);

        li.append(meta, actions);
        frag.appendChild(li);
    });
    listEl.innerHTML = '';
    listEl.appendChild(frag);
}

function updateOnlineShopCard() {
    const currentId = typeof getCurrentShopId === 'function' ? getCurrentShopId() : getActiveShopId();
    const shop = onlineShopState.shops.find(s => s.id === currentId) || { id: currentId, name: currentId, code: '' };

    if (onlineShopState.nameEl) {
        onlineShopState.nameEl.textContent = shop.name || shop.id;
    }
    if (onlineShopState.codeEl) {
        onlineShopState.codeEl.textContent = shop.code || '—';
    }
    if (onlineShopState.productsEl) {
        const total = Number(shop.total) || 0;
        onlineShopState.productsEl.textContent = `${total} product${total === 1 ? '' : 's'}`;
    }
    if (onlineShopState.linkEl) {
        const href = buildStorefrontLink(shop);
        onlineShopState.linkEl.href = href;
        onlineShopState.linkEl.textContent = href;
    }
    const openBtn = onlineShopState.openBtn;
    if (openBtn) {
        openBtn.dataset.shopId = shop.id;
        openBtn.disabled = shop.isActive === false;
        openBtn.title = shop.isActive === false ? 'Activate this shop to use its storefront.' : '';
    }
    const copyBtn = onlineShopState.copyBtn;
    if (copyBtn) {
        copyBtn.dataset.shopId = shop.id;
        copyBtn.disabled = shop.isActive === false;
    }
    if (onlineShopState.previewEl) {
        const previewLink = buildStorefrontLink(shop, { embed: true, bust: true });
        onlineShopState.previewEl.src = previewLink;
    }
}

async function refreshOnlineShopPanel(force = false) {
    if (!onlineShopState.root) return;
    if (onlineShopState.isLoading) return;
    onlineShopState.isLoading = true;
    setOnlineShopStatus('Loading storefront links…');
    try {
        onlineShopState.shops = await fetchShopSummaries();
        renderOnlineShopList();
        updateOnlineShopCard();
        setOnlineShopStatus(`Storefront links updated (${onlineShopState.shops.length})`, 'success', 2200);
        onlineShopState.needsFirstLoad = false;
    } catch (err) {
        console.error('Failed to load online shop links:', err);
        setOnlineShopStatus(err.message || 'Failed to load storefront links.', 'error');
    } finally {
        onlineShopState.isLoading = false;
    }
}

function initializeOnlineShopPanel(options = {}) {
    if (!onlineShopState.root || onlineShopState.initialized) return;
    deriveStorefrontBase();
    onlineShopState.initialized = true;

    const { openBtn, copyBtn, refreshBtn, reloadPreviewBtn, linksEl } = onlineShopState;

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            const shopId = openBtn.dataset.shopId || getActiveShopId();
            const shop = onlineShopState.shops.find(s => s.id === shopId) || { id: shopId, name: shopId };
            openStorefrontForShop(shop);
        });
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const shopId = copyBtn.dataset.shopId || getActiveShopId();
            const shop = onlineShopState.shops.find(s => s.id === shopId) || { id: shopId, name: shopId };
            copyStorefrontLink(shop);
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => refreshOnlineShopPanel(true));
    }
    if (reloadPreviewBtn) {
        reloadPreviewBtn.addEventListener('click', () => {
            updateOnlineShopCard();
            setOnlineShopStatus('Preview refreshed.', 'success', 2000);
        });
    }
    if (linksEl) {
        linksEl.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            const item = event.target.closest('.online-shop__list-item');
            if (!button || !item) return;
            const shopId = item.dataset.shopId;
            const shop = onlineShopState.shops.find(s => s.id === shopId);
            if (!shop) return;
            switch (button.dataset.action) {
                case 'open':
                    openStorefrontForShop(shop);
                    break;
                case 'copy':
                    copyStorefrontLink(shop);
                    break;
                default:
                    break;
            }
        });
    }

    if (!options?.lazyFetch) {
        refreshOnlineShopPanel(true);
    }
    updateOnlineShopCard();
}

function getActiveShopId() {
    try {
        if (typeof getCurrentShopId === 'function') {
            const id = getCurrentShopId();
            if (id) return id;
        }
    } catch {}
    if (window.currentShop?.id) return window.currentShop.id;
    return localStorage.getItem('shop:id') || 'shop-1';
}

function withShopQuery(rawUrl) {
    const shopId = getActiveShopId();
    if (!shopId) return rawUrl;
    try {
        const parsed = new URL(rawUrl, window.location.origin);
        if (!parsed.searchParams.has('shop')) {
            parsed.searchParams.set('shop', shopId);
        }
        if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith('//')) {
            return parsed.toString();
        }
        const pathWithQuery = parsed.pathname + parsed.search + parsed.hash;
        if (rawUrl.startsWith('/')) return pathWithQuery;
        return parsed.origin + pathWithQuery;
    } catch {
        const separator = rawUrl.includes('?') ? '&' : '?';
        return `${rawUrl}${separator}shop=${encodeURIComponent(shopId)}`;
    }
}

function withShopHeaders(options = {}) {
    const headers = { ...(options.headers || {}) };
    const shopId = getActiveShopId();
    if (shopId) headers['X-Shop-ID'] = shopId;
    return { ...options, headers };
}

function fetchWithShop(url, options = {}) {
    return fetch(withShopQuery(url), withShopHeaders(options));
}

function shopStorageKey(baseKey) {
    return `${getActiveShopId()}:${baseKey}`;
}

function belongsToCurrentShop(recordShopId) {
    const current = getActiveShopId();
    if (!recordShopId) {
        return current === 'shop-1' || current === '';
    }
    return String(recordShopId) === current;
}

function escapeSelector(value) {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(String(value));
    }
    return String(value).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function generatePurchaseOrderNumber() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `PO-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function loadShelfLifeMap() {
    try {
        const scopedKey = shopStorageKey(SHELF_LIFE_STORAGE_KEY);
        let raw = localStorage.getItem(scopedKey);
        if (!raw) {
            raw = localStorage.getItem(SHELF_LIFE_STORAGE_KEY);
            if (raw) {
                localStorage.setItem(scopedKey, raw);
                localStorage.removeItem(SHELF_LIFE_STORAGE_KEY);
            }
        }
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
        console.warn('Shelf life map load failed:', err);
        return {};
    }
}

function saveShelfLifeMap(map) {
    try {
        const scopedKey = shopStorageKey(SHELF_LIFE_STORAGE_KEY);
        localStorage.setItem(scopedKey, JSON.stringify(map));
    } catch (err) {
        console.warn('Shelf life map persist failed:', err);
    }
}

let shelfLifeMap = loadShelfLifeMap();

window.addEventListener('shop:switched', () => {
    shelfLifeMap = loadShelfLifeMap();
    warehouses = loadLocalWarehouses();
    renderWarehouses(warehouses);
    populateWarehouseSelectOptions(warehouses);
    transferDrafts = loadLocalTransfers();
    renderTransferQueue();
    resetPurchaseAttachments();
    if (onlineShopState.initialized && !onlineShopState.needsFirstLoad) {
        refreshOnlineShopPanel(true);
    }
});

function populateWarehouseDropdown(selectEl, list = warehouses, placeholder = 'Select warehouse') {
    if (!selectEl) return;
    const previous = selectEl.value;
    const options = [`<option value="">${escapeHtml(placeholder)}</option>`];
    let matched = false;
    list.forEach(warehouse => {
        const rawId = warehouse?.id || warehouse?.code || '';
        const id = String(rawId);
        if (!id) return;
        const label = escapeHtml(warehouse?.name || warehouse?.code || 'Warehouse');
        const isSelected = previous && previous === id;
        if (isSelected) matched = true;
        options.push(`<option value="${escapeHtml(id)}"${isSelected ? ' selected' : ''}>${label}</option>`);
    });
    if (previous && !matched) {
        const fallbackLabel = escapeHtml(getWarehouseDisplayName(previous) || previous);
        options.push(`<option value="${escapeHtml(previous)}" selected>${fallbackLabel}</option>`);
    }
    selectEl.innerHTML = options.join('');
    if (previous && selectEl.value !== previous) {
        selectEl.value = previous;
    }
}

function populateWarehouseSelectOptions(list = warehouses) {
    populateWarehouseDropdown(warehouseSelect, list, 'Assign warehouse');
    populateWarehouseDropdown(transferSourceSelect, list, 'Select source warehouse');
    populateWarehouseDropdown(transferDestinationSelect, list, 'Select destination warehouse');
    populateWarehouseDropdown(purchaseWarehouseSelect, list, 'Assign warehouse');
    populatePurchaseWarehouseFilter(list);
}

function populatePurchaseWarehouseFilter(list = warehouses) {
    if (!purchaseWarehouseFilter) return;
    const previous = purchaseWarehouseFilter.value || 'all';
    const options = ['<option value="all">All warehouses</option>'];
    const seen = new Set();
    list.forEach((warehouse) => {
        const id = String(warehouse?.id || warehouse?.code || '').trim();
        if (!id || seen.has(id)) return;
        seen.add(id);
        const label = escapeHtml(warehouse?.name || warehouse?.code || id);
        options.push(`<option value="${escapeHtml(id)}">${label}</option>`);
    });
    if (Array.isArray(purchaseOrdersAll) && purchaseOrdersAll.length) {
        purchaseOrdersAll.filter(order => belongsToCurrentShop(order.shopId)).forEach((order) => {
            const id = String(order.warehouseId || '').trim();
            if (!id || seen.has(id)) return;
            seen.add(id);
            const label = escapeHtml(getWarehouseDisplayName(id));
            options.push(`<option value="${escapeHtml(id)}">${label}</option>`);
        });
    }
    purchaseWarehouseFilter.innerHTML = options.join('');
    if (previous !== 'all' && !seen.has(previous)) {
        purchaseWarehouseFilter.value = 'all';
        purchaseFilterState.warehouse = 'all';
    } else {
        purchaseWarehouseFilter.value = previous;
        purchaseFilterState.warehouse = purchaseWarehouseFilter.value || 'all';
    }
    applyPurchaseFilters();
}

function getWarehouseDisplayName(id) {
    if (!id) return '—';
    const found = warehouses.find(w => String(w.id || w.code) === String(id));
    if (found) return found.name || found.code || id;
    return typeof id === 'string' ? id : '—';
}

function warehouseSelectMarkup(selectedId = '') {
    const selected = String(selectedId || '');
    const options = ['<option value="">Assign warehouse</option>'];
    let matched = false;
    warehouses.forEach(warehouse => {
        const rawId = warehouse?.id || warehouse?.code || '';
        const id = String(rawId);
        const label = escapeHtml(warehouse?.name || warehouse?.code || 'Warehouse');
        const isSelected = selected && selected === id;
        if (isSelected) matched = true;
        options.push(`<option value="${escapeHtml(id)}"${isSelected ? ' selected' : ''}>${label}</option>`);
    });
    if (selected && !matched) {
        const fallbackLabel = escapeHtml(getWarehouseDisplayName(selected) || selected);
        options.push(`<option value="${escapeHtml(selected)}" selected>${fallbackLabel}</option>`);
    }
    return options.join('');
}

function loadLocalWarehouses() {
    try {
        const key = shopStorageKey(WAREHOUSE_STORAGE_KEY);
        let raw = localStorage.getItem(key);
        if (!raw) {
            raw = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
            if (raw) {
                localStorage.setItem(key, raw);
                localStorage.removeItem(WAREHOUSE_STORAGE_KEY);
            }
        }
        if (!raw) return [];
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch (err) {
        console.warn('Failed to load local warehouses:', err);
        return [];
    }
}

function saveLocalWarehouses(list = warehouses) {
    try {
        const key = shopStorageKey(WAREHOUSE_STORAGE_KEY);
        localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
        console.warn('Failed to store local warehouses:', err);
    }
}

function normalizeTransferDraft(entry = {}) {
    const safeQuantity = Number.parseInt(entry.quantity, 10);
    return {
        ...entry,
        productId: entry.productId || '',
        productName: entry.productName || '',
        fromWarehouseId: entry.fromWarehouseId || entry.fromWarehouse || '',
        toWarehouseId: entry.toWarehouseId || entry.toWarehouse || '',
        quantity: Number.isFinite(safeQuantity) && safeQuantity > 0 ? safeQuantity : Number(entry.quantity) || 0,
        notes: entry.notes || '',
        initiatedBy: entry.initiatedBy || currentUser.email || 'system',
        recordedAt: Number(entry.recordedAt) || Date.now(),
        attempts: Number(entry.attempts) || 0,
        nextAttemptAt: Number(entry.nextAttemptAt) || Date.now(),
        lastError: entry.lastError || entry.error || '',
        syncStatus: entry.syncStatus || 'pending'
    };
}

function loadLocalTransfers() {
    try {
        const key = shopStorageKey(WAREHOUSE_TRANSFER_STORAGE_KEY);
        let raw = localStorage.getItem(key);
        if (!raw) {
            raw = localStorage.getItem(WAREHOUSE_TRANSFER_STORAGE_KEY);
            if (raw) {
                localStorage.setItem(key, raw);
                localStorage.removeItem(WAREHOUSE_TRANSFER_STORAGE_KEY);
            }
        }
        if (!raw) return [];
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list.map(normalizeTransferDraft) : [];
    } catch (err) {
        console.warn('Failed to load local transfers:', err);
        return [];
    }
}

function logTransferActivity(entry) {
    transferActivityLog = Array.isArray(transferActivityLog) ? transferActivityLog : [];
    transferActivityLog.unshift({
        ...entry,
        timestamp: entry.timestamp || Date.now()
    });
    if (transferActivityLog.length > MAX_TRANSFER_ACTIVITY) {
        transferActivityLog = transferActivityLog.slice(0, MAX_TRANSFER_ACTIVITY);
    }
    renderTransferActivity();
}

function renderTransferActivity() {
    if (!transferActivityContainer || !transferActivityList) return;
    if (!Array.isArray(transferActivityLog) || !transferActivityLog.length) {
        transferActivityContainer.hidden = true;
        transferActivityList.innerHTML = '';
        return;
    }
    transferActivityContainer.hidden = false;
    const items = transferActivityLog.map(entry => {
        const statusClass = entry.status === 'success' ? 'is-success' : entry.status === 'error' ? 'is-error' : '';
        const icon = entry.status === 'success' ? 'fa-check-circle' : entry.status === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const message = entry.message || (entry.status === 'success' ? 'Transfer synced' : 'Transfer retry');
        const detail = entry.detail ? `<span>${escapeHtml(entry.detail)}</span>` : '';
        const attempts = Number(entry.attempts) || 0;
        const attemptFragment = attempts ? `<span><i class="fas fa-redo"></i>${attempts} attempt${attempts === 1 ? '' : 's'}</span>` : '';
        const productLabel = entry.productName || entry.productId || 'Unnamed product';
        return `
        <li class="transfer-activity__item ${statusClass}">
            <div class="transfer-activity__message">
                <i class="fas ${icon}"></i>
                <strong>${escapeHtml(message)}</strong>
            </div>
            <div class="transfer-activity__meta">
                <span><i class="fas fa-box"></i>${escapeHtml(productLabel)}</span>
                <span><i class="fas fa-clock"></i>${escapeHtml(formatTransferTimestamp(entry.timestamp))}</span>
                ${attemptFragment}
                ${detail}
            </div>
        </li>`;
    });
    transferActivityList.innerHTML = items.join('');
}

function saveLocalTransfers(list = transferDrafts) {
    try {
        const key = shopStorageKey(WAREHOUSE_TRANSFER_STORAGE_KEY);
        localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
        console.warn('Failed to persist local transfers:', err);
    }
}

function recordLocalTransfer(entry) {
    if (!entry) return;
    transferDrafts = Array.isArray(transferDrafts) ? transferDrafts : [];
    const draft = normalizeTransferDraft({
        ...entry,
        recordedAt: Date.now(),
        attempts: entry.attempts || 0,
        nextAttemptAt: Date.now()
    });
    transferDrafts.unshift(draft);
    if (transferDrafts.length > 50) {
        transferDrafts = transferDrafts.slice(0, 50);
    }
    saveLocalTransfers(transferDrafts);
    renderTransferQueue();
    scheduleTransferRetryLoop();
    logTransferActivity({
        status: 'info',
        message: 'Transfer queued locally',
        productId: draft.productId,
        productName: draft.productName,
        attempts: draft.attempts,
        detail: 'Will retry when service is available'
    });
}

function formatTransferTimestamp(value) {
    const date = new Date(Number(value) || Date.now());
    if (!Number.isFinite(date.getTime())) return 'Just now';
    return date.toLocaleString(undefined, {
        hour12: false,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderTransferQueue() {
    if (!transferQueueSection || !transferQueueList) return;
    const badge = document.getElementById('pending-transfer-badge');
    const count = Array.isArray(transferDrafts) ? transferDrafts.length : 0;
    if (badge) {
        const hasPersistentFailures = Array.isArray(transferDrafts) && transferDrafts.some(d => (d.attempts || 0) >= 3);
        if (count > 0) {
            badge.hidden = false;
            badge.textContent = String(count);
            badge.classList.toggle('transfer-badge--warning', hasPersistentFailures);
        } else {
            badge.hidden = true;
            badge.textContent = '0';
            badge.classList.remove('transfer-badge--warning');
        }
    }
    if (!count) {
        transferQueueSection.hidden = true;
        transferQueueList.innerHTML = '';
        return;
    }
    transferQueueSection.hidden = false;
    const items = transferDrafts.map((draft, index) => {
        const fromName = draft.fromWarehouseId ? getWarehouseDisplayName(draft.fromWarehouseId) : 'Unassigned';
        const toName = draft.toWarehouseId ? getWarehouseDisplayName(draft.toWarehouseId) : 'Unassigned';
        const title = draft.productName || draft.productId || 'Unnamed product';
        const attempts = Number(draft.attempts) || 0;
        const attemptFragment = attempts > 0 ? `<span><i class="fas fa-redo"></i>${attempts} attempt${attempts === 1 ? '' : 's'}</span>` : '';
        const notesFragment = draft.notes ? `<div class="transfer-queue__notes"><i class="fas fa-sticky-note"></i> ${escapeHtml(draft.notes)}</div>` : '';
        const errorFragment = draft.lastError ? `<div class="transfer-queue__error">${escapeHtml(draft.lastError)}</div>` : '';
        return `
        <li class="transfer-queue__item" data-index="${index}">
            <div class="transfer-queue__item-header">
                <span class="transfer-queue__item-title">${escapeHtml(title)}</span>
                <span class="transfer-queue__timestamp">${escapeHtml(formatTransferTimestamp(draft.recordedAt))}</span>
            </div>
            <div class="transfer-queue__meta">
                <span><i class="fas fa-cubes"></i>${escapeHtml(String(draft.quantity || 0))} units</span>
                <span><i class="fas fa-warehouse"></i>${escapeHtml(fromName)} → ${escapeHtml(toName)}</span>
                ${attemptFragment}
            </div>
            ${notesFragment}
            ${errorFragment}
            <div class="transfer-queue__actions-row">
                <button type="button" class="transfer-queue__btn" data-transfer-action="retry" data-index="${index}"><i class="fas fa-redo-alt"></i> Retry</button>
                <button type="button" class="transfer-queue__btn" data-transfer-action="remove" data-index="${index}"><i class="fas fa-times"></i> Remove</button>
            </div>
        </li>`;
    });
    transferQueueList.innerHTML = items.join('');
}

function saveAndRenderTransferQueue() {
    saveLocalTransfers(transferDrafts);
    renderTransferQueue();
    scheduleTransferRetryLoop();
}

async function runTransferRetryCycle() {
    transferRetryTimer = null;
    if (!Array.isArray(transferDrafts) || !transferDrafts.length) return;
    const now = Date.now();
    const due = transferDrafts
        .map((draft, idx) => ({
            idx,
            due: Number(draft.nextAttemptAt) || now
        }))
        .filter(item => item.due <= now)
        .slice(0, TRANSFER_RETRY_BATCH_SIZE);
    if (!due.length) {
        scheduleTransferRetryLoop();
        return;
    }
    for (const item of due) {
        await retryTransferDraft(item.idx, { silent: true });
    }
    scheduleTransferRetryLoop();
}

function scheduleTransferRetryLoop() {
    if (transferRetryTimer) {
        clearTimeout(transferRetryTimer);
        transferRetryTimer = null;
    }
    if (!Array.isArray(transferDrafts) || !transferDrafts.length) return;
    const now = Date.now();
    const nextDue = transferDrafts.reduce((min, draft) => {
        const due = Number(draft.nextAttemptAt) || now;
        return due < min ? due : min;
    }, Infinity);
    const delay = Math.min(
        TRANSFER_RETRY_MAX_DELAY,
        Math.max(TRANSFER_RETRY_MIN_DELAY, nextDue > now ? nextDue - now : 0)
    );
    transferRetryTimer = setTimeout(runTransferRetryCycle, delay);
}

function removeTransferDraft(index, reason = 'Removed by user') {
    if (!Array.isArray(transferDrafts)) return;
    const removed = transferDrafts.splice(index, 1)[0];
    saveAndRenderTransferQueue();
    if (removed) {
        logTransferActivity({
            status: 'info',
            message: 'Pending transfer removed',
            productId: removed.productId,
            productName: removed.productName,
            attempts: removed.attempts,
            detail: reason
        });
    }
}

function normalizePurchaseOrder(order = {}) {
    return {
        ...order,
        id: order.id || order._id || `po_${Math.random().toString(36).slice(2)}`,
        orderNumber: order.orderNumber || '',
        supplier: order.supplier || '',
        status: order.status || 'draft',
        warehouseId: order.warehouseId || '',
        expectedDate: order.expectedDate || order.expectedDateMs || (order.expectedDate ? new Date(order.expectedDate).getTime() : null),
        receivedAt: order.receivedAt || order.receivedAtMs || (order.receivedAt ? new Date(order.receivedAt).getTime() : null),
        shopId: order.shopId || 'shop-1',
        trackingNumber: order.trackingNumber || '',
        totalItems: Number(order.totalItems) || 0,
        totalCost: Number(order.totalCost) || 0,
        notes: order.notes || '',
        items: Array.isArray(order.items) ? order.items : [],
        attachments: Array.isArray(order.attachments) ? order.attachments.map(att => ({
            _id: att._id || att.id || att._id?.$oid,
            id: att._id || att.id || att._id?.$oid,
            filename: att.filename || '',
            originalName: att.originalName || '',
            mimeType: att.mimeType || '',
            size: Number(att.size) || 0,
            url: att.url || `/uploads/purchases/${order.id || order._id}/${att.filename || ''}`,
            uploadedAt: att.uploadedAt ? new Date(att.uploadedAt).getTime() : null
        })) : [],
        createdAt: order.createdAt || order.createdAtMs || Date.now(),
        updatedAt: order.updatedAt || order.updatedAtMs || Date.now()
    };
}

function applyPurchaseFilters() {
    if (!purchaseOrdersLoaded && (!purchaseOrdersAll || !purchaseOrdersAll.length)) return;
    const source = Array.isArray(purchaseOrdersAll) ? purchaseOrdersAll : [];
    const statusFilter = (purchaseFilterState.status || 'all').toLowerCase();
    const warehouseFilter = (purchaseFilterState.warehouse || 'all');
    const supplierFilter = (purchaseFilterState.supplier || '').trim().toLowerCase();

    purchaseOrders = source.filter((order) => {
        if (!belongsToCurrentShop(order.shopId)) return false;
        if (statusFilter !== 'all' && String(order.status).toLowerCase() !== statusFilter) return false;
        if (warehouseFilter !== 'all' && String(order.warehouseId || '') !== warehouseFilter) return false;
        if (supplierFilter) {
            const supplierName = String(order.supplier || '').toLowerCase();
            if (!supplierName.includes(supplierFilter)) return false;
        }
        return true;
    });
    renderPurchaseOrders();
    renderSupplierReport();
    renderPurchaseNotifications();
}

async function loadPurchaseOrders() {
    if (!purchaseTableBody) return;
    purchaseOrdersLoaded = false;
    try {
        const res = await fetchWithShop(`${API_BASE}/purchases?limit=500`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                console.warn('Purchase API denied; continuing in offline mode.');
                purchaseOrdersLoaded = true;
                purchaseOrdersAll = [];
                purchaseOrders = [];
                renderPurchaseOrders();
                renderSupplierReport();
                renderPurchaseNotifications();
                return;
            }
            throw new Error(`Failed to load purchase orders (${res.status})`);
        }
        const payload = await res.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];
        purchaseOrdersLoaded = true;
        purchaseOrdersAll = data.map(normalizePurchaseOrder);
        if (purchaseWarehouseFilter) {
            populatePurchaseWarehouseFilter(warehouses);
        } else {
            applyPurchaseFilters();
        }
    } catch (err) {
        console.error('loadPurchaseOrders error:', err);
        purchaseOrdersLoaded = true;
        purchaseOrdersAll = [];
        purchaseOrders = [];
        renderPurchaseOrders();
        renderSupplierReport();
        renderPurchaseNotifications();
        // stay quiet in UI to avoid noisy toasts when offline
    }
}

function purchaseStatusBadge(status = 'draft') {
    const normalized = String(status || '').toLowerCase();
    const mapping = {
        draft: { label: 'Draft', cls: 'po-status--draft' },
        ordered: { label: 'Ordered', cls: 'po-status--ordered' },
        received: { label: 'Received', cls: 'po-status--received' },
        cancelled: { label: 'Cancelled', cls: 'po-status--cancelled' }
    };
    const config = mapping[normalized] || mapping.draft;
    return `<span class="po-status ${config.cls}">${config.label}</span>`;
}

function ensurePurchaseDraft() {
    if (!currentPurchaseDraft || typeof currentPurchaseDraft !== 'object') {
        currentPurchaseDraft = { items: [] };
    }
    if (!Array.isArray(currentPurchaseDraft.items)) {
        currentPurchaseDraft.items = [];
    }
    return currentPurchaseDraft;
}

function findProductByIdLocal(id) {
    if (!id || !Array.isArray(products)) return null;
    return products.find(p => String(p.id || p._id) === String(id));
}

function buildPurchaseProductLabel(product) {
    if (!product) return '';
    const pieces = [];
    if (product.name) pieces.push(product.name);
    const codes = [];
    if (product.ean) codes.push(`EAN ${product.ean}`);
    if (product.sku) codes.push(`SKU ${product.sku}`);
    if (!codes.length && product.id) codes.push(`#${String(product.id).slice(-4)}`);
    if (codes.length) pieces.push(codes.join(' - '));
    return pieces.join(' - ');
}

function buildPurchaseItemLabel(item) {
    if (!item) return '';
    if (item.productId) {
        const product = findProductByIdLocal(item.productId);
        if (product) return buildPurchaseProductLabel(product);
    }
    return item.productName || '';
}

function formatFileSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = value;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }
    const precision = unitIndex === 0 ? 0 : 1;
    return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

function refreshPurchaseProductOptions() {
    if (!purchaseProductOptions) return;
    purchaseProductLabelMap.clear();
    purchaseProductOptions.innerHTML = '';
    if (!Array.isArray(products) || !products.length) return;
    const frag = document.createDocumentFragment();
    products.forEach((product) => {
        const label = buildPurchaseProductLabel(product);
        if (!label || purchaseProductLabelMap.has(label)) return;
        purchaseProductLabelMap.set(label, product.id || product._id);
        const opt = document.createElement('option');
        opt.value = label;
        frag.appendChild(opt);
    });
    purchaseProductOptions.appendChild(frag);
}

function resetPurchaseAttachments() {
    pendingPurchaseAttachments = [];
    existingPurchaseAttachments = Array.isArray(existingPurchaseAttachments) ? existingPurchaseAttachments : [];
    renderPurchaseAttachments();
}

function renderPurchaseAttachments() {
    if (!purchaseAttachmentsList) return;
    const items = [];
    const hasExisting = Array.isArray(existingPurchaseAttachments) && existingPurchaseAttachments.length;
    const hasPending = Array.isArray(pendingPurchaseAttachments) && pendingPurchaseAttachments.length;

    if (hasExisting) {
        existingPurchaseAttachments.forEach((attachment) => {
            const id = attachment?._id || attachment?.id || '';
            const name = attachment?.originalName || attachment?.filename || 'Attachment';
            const size = attachment?.size ? formatFileSize(attachment.size) : '';
            const url = attachment?.url || '';
            const removeBtn = purchaseEditingId
                ? `<button type="button" data-action="remove-existing" data-id="${escapeHtml(id)}" title="Remove attachment"><i class="fas fa-trash"></i></button>`
                : '';
            items.push(
                `<li data-type="existing" data-id="${escapeHtml(id)}">
                    <i class="fas fa-paperclip"></i>
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>
                    <span class="attachment-size">${escapeHtml(size)}</span>
                    <div class="attachment-actions">${removeBtn}</div>
                </li>`
            );
        });
    }

    if (hasPending) {
        pendingPurchaseAttachments.forEach((file, index) => {
            items.push(
                `<li data-type="pending" data-index="${escapeHtml(index)}">
                    <i class="fas fa-paperclip"></i>
                    <span>${escapeHtml(file.name)}</span>
                    <span class="attachment-size">${escapeHtml(formatFileSize(file.size))}</span>
                    <div class="attachment-actions">
                        <button type="button" data-action="remove-pending" data-index="${escapeHtml(index)}" title="Remove pending file"><i class="fas fa-times"></i></button>
                    </div>
                </li>`
            );
        });
    }

    if (!items.length) {
        items.push('<li class="purchase-attachments-empty">No attachments yet.</li>');
    }
    purchaseAttachmentsList.innerHTML = items.join('');
}

function handlePurchaseAttachmentChoose(event) {
    const files = Array.from(event?.target?.files || []);
    if (!files.length) return;
    const existingCount = (existingPurchaseAttachments?.length || 0) + pendingPurchaseAttachments.length;
    const MAX_PURCHASE_ATTACHMENTS = 10;
    const MAX_PURCHASE_ATTACHMENT_SIZE = 5 * 1024 * 1024;
    const availableSlots = MAX_PURCHASE_ATTACHMENTS - existingCount;
    if (availableSlots <= 0) {
        showToast?.('Maximum attachment limit reached.');
        event.target.value = '';
        return;
    }
    const accepted = [];
    files.slice(0, availableSlots).forEach((file) => {
        if (file.size > MAX_PURCHASE_ATTACHMENT_SIZE) {
            showToast?.(`${file.name} exceeds the 5MB limit and was skipped.`);
            return;
        }
        accepted.push(file);
    });
    if (accepted.length) {
        pendingPurchaseAttachments.push(...accepted);
        renderPurchaseAttachments();
    }
    event.target.value = '';
}

function removePendingPurchaseAttachment(index) {
    const idx = Number(index);
    if (!Number.isFinite(idx)) return;
    pendingPurchaseAttachments.splice(idx, 1);
    renderPurchaseAttachments();
}

async function deleteExistingPurchaseAttachment(attachmentId) {
    if (!purchaseEditingId || !attachmentId) return;
    try {
        const res = await fetchWithShop(`${API_BASE}/purchases/${encodeURIComponent(purchaseEditingId)}/attachments/${encodeURIComponent(attachmentId)}`, {
            method: 'DELETE'
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(payload?.error || `Failed to delete attachment (${res.status})`);
        }
        const attachments = Array.isArray(payload?.attachments) ? payload.attachments : existingPurchaseAttachments.filter(att => String(att._id || att.id) !== String(attachmentId));
        existingPurchaseAttachments = attachments;
        updateLocalPurchaseOrder(purchaseEditingId, (order) => {
            order.attachments = attachments.slice();
        });
        renderPurchaseAttachments();
        showToast?.('Attachment removed.');
    } catch (err) {
        console.error('deleteExistingPurchaseAttachment error:', err);
        showToast?.(err.message || 'Could not remove attachment.');
    }
}

async function uploadPurchaseAttachments(orderId, files) {
    if (!orderId || !files.length) return;
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    try {
        const res = await fetchWithShop(`${API_BASE}/purchases/${encodeURIComponent(orderId)}/attachments`, {
            method: 'POST',
            body: formData
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(payload?.error || `Failed to upload attachments (${res.status})`);
        }
        const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
        existingPurchaseAttachments = attachments;
        pendingPurchaseAttachments = [];
        updateLocalPurchaseOrder(orderId, (order) => {
            order.attachments = attachments;
        });
        renderPurchaseAttachments();
        showToast?.('Attachments uploaded.');
    } catch (err) {
        console.error('uploadPurchaseAttachments error:', err);
        showToast?.(err.message || 'Attachment upload failed.');
    }
}

function refreshPurchaseTotalsWarning(currentTotals = null) {
    if (!purchaseTotalsWarning) return;
    if (!purchaseInitialTotals) {
        purchaseTotalsWarning.textContent = '';
        purchaseTotalsWarning.classList.remove('is-visible');
        return;
    }
    if (!currentTotals) {
        currentTotals = {
            totalItems: Number(purchaseTotalItemsInput?.value) || 0,
            totalCost: Number(purchaseTotalCostInput?.value) || 0
        };
    }
    const diffItems = Math.abs((currentTotals.totalItems || 0) - (purchaseInitialTotals.totalItems || 0));
    const diffCost = Math.abs((currentTotals.totalCost || 0) - (purchaseInitialTotals.totalCost || 0));
    if (diffItems > 0.01 || diffCost > 0.01) {
        purchaseTotalsWarning.textContent = `Original totals were ${purchaseInitialTotals.totalItems} items, ${formatCurrency(purchaseInitialTotals.totalCost || 0)}. Saving will use the updated totals shown above.`;
        purchaseTotalsWarning.classList.add('is-visible');
    } else {
        purchaseTotalsWarning.textContent = '';
        purchaseTotalsWarning.classList.remove('is-visible');
    }
}

function updateLineTotalForRow(row) {
    if (!row) return;
    const index = Number(row.dataset.index);
    const draft = ensurePurchaseDraft();
    const item = draft.items[index];
    if (!item) return;
    const cell = row.querySelector('[data-role="line-total"]');
    if (!cell) return;
    const total = (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
    cell.textContent = formatCurrency(total);
}

function updatePurchaseTotalsFromItems() {
    const draft = ensurePurchaseDraft();
    const totals = draft.items.reduce((acc, item) => {
        const qty = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0;
        const cost = Number.isFinite(Number(item.unitCost)) ? Number(item.unitCost) : 0;
        acc.totalItems += qty;
        acc.totalCost += qty * cost;
        return acc;
    }, { totalItems: 0, totalCost: 0 });
    if (purchaseTotalItemsInput) purchaseTotalItemsInput.value = String(totals.totalItems);
    if (purchaseTotalCostInput) purchaseTotalCostInput.value = totals.totalCost.toFixed(2);
    refreshPurchaseTotalsWarning(totals);
    return totals;
}

function applyPurchaseProductSelection(input, { allowFreeText = false } = {}) {
    if (!input) return;
    const row = input.closest('tr');
    const index = Number(row?.dataset.index);
    if (!Number.isFinite(index)) return;
    const draft = ensurePurchaseDraft();
    const item = draft.items[index];
    if (!item) return;

    const rawValue = (input.value || '').trim();
    if (!rawValue) {
        item.productId = '';
        item.productName = '';
        input.dataset.productId = '';
        updateLineTotalForRow(row);
        return;
    }

    const directId = purchaseProductLabelMap.get(rawValue);
    let product = directId ? findProductByIdLocal(directId) : null;
    if (!product) {
        const lower = rawValue.toLowerCase();
        product = (products || []).find(p => {
            return [p.name, p.ean, p.sku].some(val => val && String(val).toLowerCase() === lower);
        });
    }

    if (product) {
        item.productId = product.id || product._id;
        item.productName = product.name || rawValue;
        input.dataset.productId = item.productId;
        input.value = buildPurchaseProductLabel(product);
        if (!item.unitCost && Number(product.cost)) {
            item.unitCost = Number(product.cost);
            const costInput = row.querySelector('input[data-role="unit-cost"]');
            if (costInput) {
                costInput.value = item.unitCost.toFixed(2);
            }
        }
    } else if (allowFreeText) {
        item.productId = '';
        item.productName = rawValue;
        input.dataset.productId = '';
    } else {
        input.value = buildPurchaseItemLabel(item);
    }
    updateLineTotalForRow(row);
    updatePurchaseTotalsFromItems();
}

function attachPurchaseItemRow(row, item, index) {
    row.dataset.index = String(index);

    const productCell = document.createElement('td');
    const productInput = document.createElement('input');
    productInput.type = 'text';
    productInput.placeholder = 'Search product';
    productInput.autocomplete = 'off';
    productInput.setAttribute('list', 'purchase-product-options');
    productInput.dataset.role = 'product';
    productInput.dataset.productId = item.productId || '';
    productInput.value = buildPurchaseItemLabel(item);
    productInput.addEventListener('change', (event) => applyPurchaseProductSelection(event.target));
    productInput.addEventListener('blur', (event) => applyPurchaseProductSelection(event.target, { allowFreeText: true }));
    productCell.appendChild(productInput);
    row.appendChild(productCell);

    const qtyCell = document.createElement('td');
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.step = '1';
    qtyInput.dataset.role = 'quantity';
    qtyInput.value = Number.isFinite(Number(item.quantity)) ? String(item.quantity) : '0';
    qtyInput.addEventListener('input', () => {
        const value = Math.max(0, Math.floor(Number(qtyInput.value) || 0));
        item.quantity = value;
        qtyInput.value = String(value);
        updateLineTotalForRow(row);
        updatePurchaseTotalsFromItems();
    });
    qtyCell.appendChild(qtyInput);
    row.appendChild(qtyCell);

    const costCell = document.createElement('td');
    const costInput = document.createElement('input');
    costInput.type = 'number';
    costInput.min = '0';
    costInput.step = '0.01';
    costInput.dataset.role = 'unit-cost';
    costInput.value = Number.isFinite(Number(item.unitCost)) ? Number(item.unitCost).toFixed(2) : '0.00';
    costInput.addEventListener('input', () => {
        const value = Math.max(0, Number(costInput.value) || 0);
        item.unitCost = value;
        updateLineTotalForRow(row);
        updatePurchaseTotalsFromItems();
    });
    costInput.addEventListener('blur', () => {
        const value = Number(item.unitCost) || 0;
        item.unitCost = value;
        costInput.value = value.toFixed(2);
        updateLineTotalForRow(row);
    });
    costCell.appendChild(costInput);
    row.appendChild(costCell);

    const totalCell = document.createElement('td');
    totalCell.dataset.role = 'line-total';
    totalCell.className = 'purchase-line-total';
    totalCell.textContent = formatCurrency((Number(item.quantity) || 0) * (Number(item.unitCost) || 0));
    row.appendChild(totalCell);

    const actionCell = document.createElement('td');
    actionCell.className = 'action-col';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.title = 'Remove item';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    removeBtn.addEventListener('click', () => removePurchaseItem(index));
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);
}

function renderPurchaseItems() {
    if (!purchaseItemsBody) return;
    ensurePurchaseDraft();
    purchaseItemsBody.querySelectorAll('tr').forEach((row) => {
        if (row.id !== 'purchase-items-empty') row.remove();
    });

    if (!currentPurchaseDraft.items.length) {
        if (purchaseItemsEmptyRow) purchaseItemsEmptyRow.hidden = false;
        updatePurchaseTotalsFromItems();
        return;
    }

    if (purchaseItemsEmptyRow) purchaseItemsEmptyRow.hidden = true;
    currentPurchaseDraft.items.forEach((item, index) => {
        const row = document.createElement('tr');
        attachPurchaseItemRow(row, item, index);
        purchaseItemsBody.appendChild(row);
    });
    updatePurchaseTotalsFromItems();
}

function addPurchaseItem(defaults = {}) {
    const draft = ensurePurchaseDraft();
    draft.items.push({
        productId: defaults.productId || '',
        productName: defaults.productName || '',
        quantity: Number.isFinite(Number(defaults.quantity)) ? Number(defaults.quantity) : 1,
        unitCost: Number.isFinite(Number(defaults.unitCost)) ? Number(defaults.unitCost) : 0
    });
    renderPurchaseItems();
    const lastRow = purchaseItemsBody?.querySelector('tr:last-of-type input[data-role="product"]');
    lastRow?.focus();
}

function removePurchaseItem(index) {
    const draft = ensurePurchaseDraft();
    draft.items.splice(index, 1);
    renderPurchaseItems();
}

function clonePurchaseItems(items = []) {
    return items.map(item => ({
        productId: item.productId || item.id || '',
        productName: item.productName || item.name || '',
        quantity: Number(item.quantity) || 0,
        unitCost: Number(item.unitCost) || 0
    }));
}

function formatPurchaseDate(value) {
    if (!value && value !== 0) return '—';
    const date = new Date(Number(value));
    if (!Number.isFinite(date.getTime())) return '—';
    return date.toLocaleDateString();
}

function renderPurchaseOrders() {
    if (!purchaseTableBody) return;
    const totalForCurrentShop = (Array.isArray(purchaseOrdersAll) ? purchaseOrdersAll : []).filter(order => belongsToCurrentShop(order.shopId)).length;
    const hasAnyOrders = totalForCurrentShop > 0;

    if (!Array.isArray(purchaseOrders) || !purchaseOrders.length) {
        const message = hasAnyOrders
            ? 'No purchase orders match the current filters.'
            : 'No purchase orders found.';
        purchaseTableBody.innerHTML = `<tr><td colspan="8" class="purchase-empty">${escapeHtml(message)}</td></tr>`;
        if (purchaseEmptyState) {
            if (hasAnyOrders) purchaseEmptyState.setAttribute('hidden', '');
            else purchaseEmptyState.removeAttribute('hidden');
        }
        updatePurchaseMetrics();
        return;
    }

    purchaseEmptyState?.setAttribute('hidden', '');

    const rows = purchaseOrders.map(order => {
        const expected = order.expectedDate ? formatPurchaseDate(order.expectedDate) : '—';
        const received = order.receivedAt ? formatPurchaseDate(order.receivedAt) : '—';
        const warehouseName = order.warehouseId ? getWarehouseDisplayName(order.warehouseId) : '—';
        const itemCount = Number(order.totalItems) || (Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0);
        const detailId = `po-details-${order.id}`;
        const itemsHtml = Array.isArray(order.items) && order.items.length
            ? `<table class="purchase-detail-table">
                <thead>
                  <tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Unit Cost</th><th scope="col">Line Total</th></tr>
                </thead>
                <tbody>
                  ${order.items.map(item => {
                        const name = escapeHtml(buildPurchaseItemLabel(item) || item.productName || 'Item');
                        const qty = Number(item.quantity) || 0;
                        const unitCost = Number(item.unitCost) || 0;
                        const lineTotal = qty * unitCost;
                        return `<tr><td>${name}</td><td>${escapeHtml(String(qty))}</td><td>${formatCurrency(unitCost)}</td><td>${formatCurrency(lineTotal)}</td></tr>`;
                    }).join('')}
                </tbody>
              </table>`
            : '<p class="purchase-detail-empty">No line items recorded.</p>';
        const tracking = order.trackingNumber ? escapeHtml(order.trackingNumber) : '—';
        const notesBlock = order.notes ? `<div class="purchase-detail-notes"><span>Notes</span><p>${escapeHtml(order.notes)}</p></div>` : '';
        const attachmentsBlock = Array.isArray(order.attachments) && order.attachments.length
            ? `<div class="purchase-detail-attachments"><span>Attachments</span><ul>${order.attachments.map(att => {
                    const url = escapeHtml(att.url || '');
                    const name = escapeHtml(att.originalName || att.filename || 'Attachment');
                    const size = att.size ? ` (${escapeHtml(formatFileSize(att.size))})` : '';
                    return `<li><a href="${url}" target="_blank" rel="noopener">${name}</a>${size}</li>`;
                }).join('')}</ul></div>`
            : '';

        return `
        <tr data-id="${escapeHtml(order.id)}" data-details-id="${escapeHtml(detailId)}" aria-expanded="false">
            <td>${escapeHtml(order.orderNumber || '')}</td>
            <td>${escapeHtml(order.supplier || '—')}</td>
            <td>${purchaseStatusBadge(order.status)}</td>
            <td>${escapeHtml(warehouseName)}</td>
            <td>${escapeHtml(expected)}</td>
            <td>${escapeHtml(String(itemCount))}</td>
            <td>${formatCurrency(order.totalCost || 0)}</td>
            <td>
                <div class="purchase-actions-cell">
                    <button class="purchase-action" data-action="view" data-id="${escapeHtml(order.id)}" title="View details"><i class="fas fa-eye"></i></button>
                    <button class="purchase-action" data-action="edit" data-id="${escapeHtml(order.id)}" title="Edit purchase order"><i class="fas fa-edit"></i></button>
                    <button class="purchase-action purchase-action--danger" data-action="delete" data-id="${escapeHtml(order.id)}" title="Delete purchase order"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
        <tr class="purchase-details-row" data-detail-for="${escapeHtml(order.id)}" id="${escapeHtml(detailId)}" hidden>
            <td colspan="8">
                <div class="purchase-details-card">
                    <div class="purchase-detail-meta">
                        <div><span>Expected</span><strong>${escapeHtml(expected)}</strong></div>
                        <div><span>Received</span><strong>${escapeHtml(received)}</strong></div>
                        <div><span>Tracking</span><strong>${tracking}</strong></div>
                    </div>
                    <div class="purchase-detail-items">${itemsHtml}</div>
                    ${attachmentsBlock}
                    ${notesBlock}
                </div>
            </td>
        </tr>`;
    }).join('');

    purchaseTableBody.innerHTML = rows;
    updatePurchaseMetrics();
}

function updateLocalPurchaseOrder(orderId, updater) {
    if (!orderId || typeof updater !== 'function') return;
    let updated = false;
    purchaseOrdersAll = purchaseOrdersAll.map((order) => {
        if (String(order.id) !== String(orderId)) return order;
        const next = { ...order };
        updater(next);
        updated = true;
        return next;
    });
    if (!updated) {
        const draft = {};
        updater(draft);
        if (!draft.id) draft.id = orderId;
        if (!draft.shopId) draft.shopId = getActiveShopId();
        purchaseOrdersAll = [...purchaseOrdersAll, draft];
    }
    applyPurchaseFilters();
}

function renderPurchaseNotifications() {
    if (!purchaseNotificationsEl) return;
    const source = (Array.isArray(purchaseOrdersAll) ? purchaseOrdersAll : []).filter(order => belongsToCurrentShop(order.shopId));
    if (!source.length) {
        purchaseNotificationsEl.innerHTML = '<div class="purchase-notification is-empty"><i class="fas fa-check-circle"></i><span>All caught up. No status alerts.</span></div>';
        return;
    }
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dayMs = 24 * 60 * 60 * 1000;
    const recentReceived = source.filter(order => order.status === 'received' && Number(order.receivedAt) && (now - Number(order.receivedAt)) <= dayMs);
    const overdue = source.filter(order => {
        if (!order.expectedDate) return false;
        if (order.status === 'received' || order.status === 'cancelled') return false;
        const expected = new Date(Number(order.expectedDate));
        expected.setHours(0, 0, 0, 0);
        return expected.getTime() < startOfToday.getTime();
    });

    const notifications = [];
    if (overdue.length) {
        const sample = overdue.slice(0, 3).map(order => escapeHtml(order.orderNumber || order.supplier || 'Order')).join(', ');
        notifications.push(`<div class="purchase-notification is-warning"><i class="fas fa-exclamation-triangle"></i><span>${overdue.length} overdue purchase order(s). ${sample}${overdue.length > 3 ? ', …' : ''}</span></div>`);
    }
    if (recentReceived.length) {
        const sample = recentReceived.slice(0, 3).map(order => escapeHtml(order.orderNumber || order.supplier || 'Order')).join(', ');
        notifications.push(`<div class="purchase-notification"><i class="fas fa-circle-check"></i><span>${recentReceived.length} order(s) received in the last 24h. ${sample}${recentReceived.length > 3 ? ', …' : ''}</span></div>`);
    }
    if (!notifications.length) {
        notifications.push('<div class="purchase-notification is-empty"><i class="fas fa-check-circle"></i><span>All caught up. No status alerts.</span></div>');
    }
    purchaseNotificationsEl.innerHTML = notifications.join('');
}

function buildSupplierSummary() {
    const source = (Array.isArray(purchaseOrdersAll) ? purchaseOrdersAll : []).filter(order => belongsToCurrentShop(order.shopId));
    const map = new Map();
    source.forEach((order) => {
        const supplier = (order.supplier || 'Unknown').trim() || 'Unknown';
        if (!map.has(supplier)) {
            map.set(supplier, {
                supplier,
                totalOrders: 0,
                openOrders: 0,
                receivedOrders: 0,
                totalItems: 0,
                totalCost: 0
            });
        }
        const entry = map.get(supplier);
        entry.totalOrders += 1;
        if (order.status === 'draft' || order.status === 'ordered') entry.openOrders += 1;
        if (order.status === 'received') entry.receivedOrders += 1;
        entry.totalItems += Number(order.totalItems) || 0;
        entry.totalCost += Number(order.totalCost) || 0;
    });
    return Array.from(map.values()).sort((a, b) => a.supplier.localeCompare(b.supplier, undefined, { sensitivity: 'base' }));
}

function renderSupplierReport() {
    if (!supplierReportBody) return;
    const summary = buildSupplierSummary();
    if (purchaseSupplierExportBtn) purchaseSupplierExportBtn.disabled = summary.length === 0;
    if (!summary.length) {
        supplierReportBody.innerHTML = '<tr><td colspan="6" class="supplier-report-empty">Load purchase orders to see supplier insights.</td></tr>';
        return;
    }
    supplierReportBody.innerHTML = summary.map(row => `
        <tr>
            <td>${escapeHtml(row.supplier)}</td>
            <td>${escapeHtml(String(row.totalOrders))}</td>
            <td>${escapeHtml(String(row.openOrders))}</td>
            <td>${escapeHtml(String(row.receivedOrders))}</td>
            <td>${escapeHtml(String(row.totalItems))}</td>
            <td>${formatCurrency(row.totalCost)}</td>
        </tr>
    `).join('');
}

function exportSupplierReport() {
    const summary = buildSupplierSummary();
    if (!summary.length) {
        showToast?.('No supplier data to export yet.');
        return;
    }
    const header = ['Supplier', 'Total Orders', 'Open Orders', 'Received Orders', 'Total Items', 'Total Cost'];
    const lines = summary.map(row => [
        row.supplier,
        row.totalOrders,
        row.openOrders,
        row.receivedOrders,
        row.totalItems,
        row.totalCost.toFixed(2)
    ]);
    const csv = [header, ...lines].map(cols => cols.map(value => {
        const str = String(value ?? '').replace(/"/g, '""');
        return /[",\n]/.test(str) ? `"${str}"` : str;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supplier_report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function togglePurchaseDetailsRow(id) {
    if (!purchaseTableBody || !id) return;
    const primaryRow = purchaseTableBody.querySelector(`tr[data-id="${escapeSelector(id)}"]`);
    const detailRow = purchaseTableBody.querySelector(`tr[data-detail-for="${escapeSelector(id)}"]`);
    if (!primaryRow || !detailRow) return;
    const isOpen = !detailRow.hasAttribute('hidden');
    if (isOpen) {
        detailRow.setAttribute('hidden', '');
        primaryRow.setAttribute('aria-expanded', 'false');
        primaryRow.classList.remove('is-expanded');
    } else {
        detailRow.removeAttribute('hidden');
        primaryRow.setAttribute('aria-expanded', 'true');
        primaryRow.classList.add('is-expanded');
    }
}

function updatePurchaseMetrics() {
    const all = Array.isArray(purchaseOrdersAll) ? purchaseOrdersAll : [];
    const filteredAll = all.filter(order => belongsToCurrentShop(order.shopId));
    const source = filteredAll.length ? filteredAll : purchaseOrders;
    const total = Array.isArray(source) ? source.length : 0;
    const open = Array.isArray(source) ? source.filter(order => ['draft', 'ordered'].includes(order.status)).length : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueToday = Array.isArray(source)
        ? source.filter(order => {
            if (!order.expectedDate) return false;
            const date = new Date(order.expectedDate);
            date.setHours(0, 0, 0, 0);
            return Number.isFinite(date.getTime()) && date.getTime() === today.getTime();
        }).length
        : 0;
    if (purchaseTotalCountEl) purchaseTotalCountEl.textContent = String(total);
    if (purchaseOpenCountEl) purchaseOpenCountEl.textContent = String(open);
    if (purchaseDueTodayEl) purchaseDueTodayEl.textContent = String(dueToday);
}

function setPurchaseError(message = '') {
    if (!purchaseErrorEl) return;
    purchaseErrorEl.textContent = message;
    if (message) {
        purchaseErrorEl.classList.remove('hidden');
    } else {
        purchaseErrorEl.classList.add('hidden');
    }
}

function clearPurchaseEditingState() {
    purchaseEditingId = null;
    purchasePreviousStatus = 'draft';
    purchaseInitialTotals = null;
    currentPurchaseDraft = { items: [] };
    purchaseForm?.setAttribute('data-mode', 'create');
    if (purchaseModalHeadingText) purchaseModalHeadingText.textContent = 'New Purchase Order';
    if (savePurchaseBtnText) savePurchaseBtnText.textContent = 'Save Purchase';
    if (savePurchaseBtn) {
        savePurchaseBtn.disabled = false;
        delete savePurchaseBtn.dataset.loading;
    }
    if (purchaseOrderNumberInput) purchaseOrderNumberInput.value = generatePurchaseOrderNumber();
    if (purchaseReceivedDateInput) purchaseReceivedDateInput.value = '';
    if (purchaseTrackingNumberInput) purchaseTrackingNumberInput.value = '';
    resetPurchaseAttachments();
    renderPurchaseItems();
}

function resetPurchaseForm() {
    purchaseForm?.reset();
    setPurchaseError('');
    if (purchaseStatusSelect) purchaseStatusSelect.value = 'draft';
    if (purchaseTotalItemsInput) purchaseTotalItemsInput.value = '0';
    if (purchaseTotalCostInput) purchaseTotalCostInput.value = '0.00';
    if (purchaseWarehouseSelect) purchaseWarehouseSelect.value = '';
    if (purchaseExpectedInput) purchaseExpectedInput.value = '';
    if (purchaseReceivedDateInput) purchaseReceivedDateInput.value = '';
    if (purchaseTrackingNumberInput) purchaseTrackingNumberInput.value = '';
    if (purchaseNotesInput) purchaseNotesInput.value = '';
    ensurePurchaseDraft();
    currentPurchaseDraft.items = [];
    pendingPurchaseAttachments = [];
    existingPurchaseAttachments = [];
    purchaseInitialTotals = null;
    renderPurchaseAttachments();
    renderPurchaseItems();
    updatePurchaseTotalsFromItems();
    handlePurchaseStatusChange();
}

function openPurchaseModal(order = null) {
    if (!purchaseModal) return;
    resetPurchaseForm();
    clearPurchaseEditingState();
    if (order) {
        purchaseEditingId = order.id || order._id || null;
        purchasePreviousStatus = order.status || 'draft';
        purchaseInitialTotals = {
            totalItems: Number(order.totalItems) || 0,
            totalCost: Number(order.totalCost) || 0
        };
        currentPurchaseDraft = {
            ...order,
            items: Array.isArray(order.items) ? order.items.map(item => ({ ...item })) : []
        };
        purchaseForm?.setAttribute('data-mode', 'edit');
        if (purchaseModalHeadingText) purchaseModalHeadingText.textContent = 'Edit Purchase Order';
        if (savePurchaseBtnText) savePurchaseBtnText.textContent = 'Update Purchase';
        if (purchaseOrderNumberInput) purchaseOrderNumberInput.value = order.orderNumber || generatePurchaseOrderNumber();
        if (purchaseSupplierInput) purchaseSupplierInput.value = order.supplier || '';
        if (purchaseStatusSelect) purchaseStatusSelect.value = order.status || 'draft';
        handlePurchaseStatusChange();
        const expectedValue = order.expectedDate ? toDateInputValue(order.expectedDate) : '';
        if (purchaseExpectedInput) purchaseExpectedInput.value = expectedValue;
        if (purchaseTotalItemsInput) purchaseTotalItemsInput.value = String(order.totalItems ?? 0);
        if (purchaseTotalCostInput) purchaseTotalCostInput.value = String(Number(order.totalCost ?? 0).toFixed(2));
        if (purchaseNotesInput) purchaseNotesInput.value = order.notes || '';
        if (purchaseWarehouseSelect) {
            const target = order.warehouseId || '';
            purchaseWarehouseSelect.value = target;
            if (target && purchaseWarehouseSelect.value !== target) {
                const opt = document.createElement('option');
                opt.value = target;
                opt.textContent = getWarehouseDisplayName(target) || target;
                purchaseWarehouseSelect.appendChild(opt);
                purchaseWarehouseSelect.value = target;
            }
        }
        if (purchaseReceivedDateInput) {
            const receivedValue = order.receivedAt ? toDateInputValue(order.receivedAt) : '';
            purchaseReceivedDateInput.value = receivedValue;
        }
        if (purchaseTrackingNumberInput) purchaseTrackingNumberInput.value = order.trackingNumber || '';
        existingPurchaseAttachments = Array.isArray(order.attachments) ? order.attachments.map(att => ({ ...att })) : [];
        renderPurchaseAttachments();
        ensurePurchaseDraft();
        currentPurchaseDraft.items = clonePurchaseItems(order.items || []);
        renderPurchaseItems();
    } else {
        ensurePurchaseDraft();
        currentPurchaseDraft.items = [];
        purchasePreviousStatus = 'draft';
        purchaseInitialTotals = null;
        existingPurchaseAttachments = [];
        pendingPurchaseAttachments = [];
        renderPurchaseAttachments();
        renderPurchaseItems();
        handlePurchaseStatusChange();
    }
    purchaseModal.classList.add('active');
    purchaseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    purchaseOrderNumberInput?.focus();
}

function closePurchaseModal() {
    if (!purchaseModal) return;
    purchaseModal.classList.remove('active');
    purchaseModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    resetPurchaseForm();
    clearPurchaseEditingState();
}

function gatherPurchaseFormValues() {
    ensurePurchaseDraft();
    const orderNumber = purchaseOrderNumberInput?.value.trim() || '';
    const supplier = purchaseSupplierInput?.value.trim() || '';
    const status = purchaseStatusSelect?.value || 'draft';
    const warehouseId = purchaseWarehouseSelect?.value || '';
    const expectedDate = purchaseExpectedInput?.value ? new Date(purchaseExpectedInput.value).toISOString() : null;
    const receivedAt = purchaseReceivedDateInput?.value ? new Date(purchaseReceivedDateInput.value).toISOString() : null;
    const trackingNumber = purchaseTrackingNumberInput?.value.trim() || '';
    const notes = purchaseNotesInput?.value.trim() || '';
    const items = clonePurchaseItems(currentPurchaseDraft.items || []).filter(item => {
        const qty = Number(item.quantity) || 0;
        const name = (item.productName || '').trim();
        return qty > 0 && name;
    });
    let totalItems = 0;
    let totalCost = 0;
    items.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        totalItems += qty;
        totalCost += qty * cost;
    });
    if (purchaseTotalItemsInput) purchaseTotalItemsInput.value = String(totalItems);
    if (purchaseTotalCostInput) purchaseTotalCostInput.value = totalCost.toFixed(2);
    refreshPurchaseTotalsWarning({ totalItems, totalCost });
    return {
        orderNumber,
        supplier,
        status,
        warehouseId,
        expectedDate,
        receivedAt: status === 'received' ? (receivedAt || new Date().toISOString()) : null,
        trackingNumber,
        totalItems,
        totalCost,
        notes,
        items
    };
}

function handlePurchaseStatusChange() {
    const status = purchaseStatusSelect?.value || 'draft';
    const isReceived = status === 'received';
    if (purchaseReceivedDateInput) {
        purchaseReceivedDateInput.disabled = !isReceived;
        if (!isReceived) {
            purchaseReceivedDateInput.value = '';
        } else if (!purchaseReceivedDateInput.value) {
            purchaseReceivedDateInput.value = toDateInputValue(new Date());
        }
    }
}

async function handleSavePurchase() {
    if (!purchaseModal) return;
    try {
        setPurchaseError('');
        const payload = gatherPurchaseFormValues();
        if (!payload.orderNumber) throw new Error('Order number is required.');
        if (!payload.supplier) throw new Error('Supplier is required.');
        if (!payload.items.length) throw new Error('Add at least one line item with quantity above zero.');
        if (payload.totalItems <= 0) throw new Error('Total items must be greater than zero.');
        if (payload.totalCost < 0) throw new Error('Total cost cannot be negative.');
        const statusChangedToReceived = payload.status === 'received' && purchasePreviousStatus !== 'received';
        const isEdit = Boolean(purchaseEditingId);
        const endpoint = isEdit ? `${API_BASE}/purchases/${encodeURIComponent(purchaseEditingId)}` : `${API_BASE}/purchases`;
        const method = isEdit ? 'PUT' : 'POST';
        const body = {
            ...payload,
            items: payload.items,
            updatedBy: currentUser.email
        };
        if (!isEdit) body.createdBy = currentUser.email;
        if (savePurchaseBtn) {
            savePurchaseBtn.disabled = true;
            savePurchaseBtn.dataset.loading = '1';
        }
        const res = await fetchWithShop(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const responseText = await res.text();
        let savedOrder = null;
        if (responseText) {
            try {
                savedOrder = JSON.parse(responseText);
            } catch (err) {
                console.warn('Could not parse purchase save response:', err);
            }
        }
        if (!res.ok) {
            let message = `Save failed (${res.status})`;
            if (savedOrder?.error) message = savedOrder.error;
            throw new Error(message);
        }
        if (!savedOrder) {
            savedOrder = { ...payload, id: purchaseEditingId };
        }
        const orderId = savedOrder.id || savedOrder._id;
        if (orderId) {
            const normalizedSnapshot = normalizePurchaseOrder(savedOrder);
            updateLocalPurchaseOrder(orderId, (order) => Object.assign(order, normalizedSnapshot));
        }
        if (payload.status === 'received' && (statusChangedToReceived || !isEdit)) {
            await syncPurchaseReceiptToInventory(savedOrder);
        }
        if (orderId && pendingPurchaseAttachments.length) {
            await uploadPurchaseAttachments(orderId, pendingPurchaseAttachments.slice());
        }
        await loadPurchaseOrders();
        closePurchaseModal();
        showToast?.(isEdit ? 'Purchase order updated.' : 'Purchase order created.');
    } catch (err) {
        console.error('handleSavePurchase error:', err);
        setPurchaseError(err.message || 'Failed to save purchase order.');
    } finally {
        if (savePurchaseBtn) {
            savePurchaseBtn.disabled = false;
            delete savePurchaseBtn.dataset.loading;
        }
    }
}

async function syncPurchaseReceiptToInventory(order, { silent = false } = {}) {
    if (!order || order.status !== 'received') return;
    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) return;

    let applied = 0;
    const failures = [];

    for (const item of items) {
        const qty = Number(item.quantity) || 0;
        if (!qty) continue;
        const productId = item.productId || item.id || '';
        if (!productId) {
            failures.push(item.productName || 'Unlinked item');
            continue;
        }
        const product = findProductByIdLocal(productId);
        if (!product) {
            failures.push(item.productName || `Product ${productId}`);
            continue;
        }
        const oldAmount = Number(product.amount) || 0;
        const newAmount = oldAmount + qty;
        try {
            const res = await fetchWithShop(`${API_BASE}/products/${encodeURIComponent(productId)}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                cache: 'no-store',
                body: JSON.stringify({
                    newAmount,
                    oldAmount,
                    reason: 'Purchase receipt',
                    notes: `Purchase order ${order.orderNumber || ''}`,
                    userName: currentUser.email || 'system'
                })
            });
            const text = await res.text();
            if (!res.ok) {
                let message = text || res.statusText || 'Stock update failed';
                try {
                    const maybe = text ? JSON.parse(text) : null;
                    if (maybe?.error) message = maybe.error;
                } catch {}
                throw new Error(message);
            }
            let updatedProduct = null;
            if (text) {
                try {
                    updatedProduct = JSON.parse(text);
                } catch (err) {
                    console.warn('Stock update parse error:', err);
                }
            }
            if (updatedProduct) {
                const normalized = normalizeProduct(updatedProduct);
                rememberShelfLifeCode(normalized, normalized.shelfLifeCode || '');
                updateLocalCollections(normalized);
            }
            applied += 1;
        } catch (error) {
            console.error('Failed to sync purchase receipt:', error);
            failures.push(item.productName || findProductByIdLocal(productId)?.name || `Product ${productId}`);
        }
    }

    if (applied) {
        await saveProducts();
    }
    if (silent) return;
    if (failures.length && applied) {
        showToast?.(`Inventory updated with warnings. ${failures.length} item(s) need attention.`);
    } else if (failures.length) {
        showToast?.('Could not update inventory for received items. Check console for details.');
    } else if (applied) {
        showToast?.('Inventory updated with received items.');
    }
}

async function deletePurchaseById(id) {
    if (!id) return;
    const confirmed = window.confirm('Delete this purchase order?');
    if (!confirmed) return;
    try {
        const res = await fetchWithShop(`${API_BASE}/purchases/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            throw new Error(`Delete failed (${res.status})`);
        }
        purchaseOrdersAll = purchaseOrdersAll.filter(order => String(order.id) !== String(id));
        applyPurchaseFilters();
        showToast?.('Purchase order deleted.');
    } catch (err) {
        console.error('deletePurchaseById error:', err);
        showToast?.(err.message || 'Could not delete purchase order');
    }
}

function startPurchaseEdit(id) {
    if (!id) return;
    const source = Array.isArray(purchaseOrdersAll) && purchaseOrdersAll.length ? purchaseOrdersAll : purchaseOrders;
    const order = source.find(po => String(po.id) === String(id));
    if (!order) {
        showToast?.('Purchase order not found.');
        return;
    }
    openPurchaseModal(order);
}

async function retryTransferDraft(index, { silent = false } = {}) {
    if (!Array.isArray(transferDrafts) || !transferDrafts[index]) return false;
    const draft = transferDrafts[index];
    const now = Date.now();
    if (draft.nextAttemptAt && now < draft.nextAttemptAt) {
        scheduleTransferRetryLoop();
        return false;
    }
    const retryBtn = transferQueueList?.querySelector(`button[data-transfer-action="retry"][data-index="${index}"]`);
    if (retryBtn && !silent) {
        retryBtn.disabled = true;
        retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying';
    }
    try {
        const payload = {
            productId: draft.productId,
            fromWarehouseId: draft.fromWarehouseId,
            toWarehouseId: draft.toWarehouseId,
            quantity: draft.quantity,
            notes: draft.notes,
            initiatedBy: draft.initiatedBy,
            productName: draft.productName
        };
        const res = await fetchWithShop(`${API_BASE}/warehouses/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        if (!res.ok) {
            let msg = `Transfer failed (${res.status})`;
            try {
                if (text) {
                    const maybeJson = JSON.parse(text);
                    if (maybeJson?.error) msg = maybeJson.error;
                }
            } catch {}
            draft.lastError = msg;
            draft.attempts = (draft.attempts || 0) + 1;
            draft.nextAttemptAt = Date.now() + Math.min(300000, Math.pow(2, draft.attempts) * 1000);
            saveAndRenderTransferQueue();
            if (!silent) showToast?.(msg);
            logTransferActivity({
                status: 'error',
                message: 'Transfer retry failed',
                productId: draft.productId,
                productName: draft.productName,
                attempts: draft.attempts,
                detail: msg
            });
            return false;
        }
        let responseJson = {};
        if (text) {
            try {
                responseJson = JSON.parse(text);
            } catch (parseErr) {
                console.warn('Transfer retry response parse error:', parseErr);
            }
        }
        if (responseJson?.product) {
            const updatedProduct = normalizeProduct(responseJson.product);
            rememberShelfLifeCode(updatedProduct, updatedProduct.shelfLifeCode || '');
            updateLocalCollections(updatedProduct);
            await rerenderAfterDataChange();
            updateDashboard();
            updateNotificationBadges();
            updateRestockBadgeFallback();
            await refreshDuplicateBadge();
            await silentRefreshOnce?.();
        }
        transferDrafts.splice(index, 1);
        saveAndRenderTransferQueue();
        if (!silent) showToast?.(responseJson?.message || 'Transfer synced successfully.');
        logTransferActivity({
            status: 'success',
            message: 'Transfer synced',
            productId: draft.productId,
            productName: draft.productName,
            attempts: draft.attempts,
            detail: responseJson?.message || ''
        });
        return true;
    } catch (err) {
        console.error('Retry transfer error:', err);
        draft.lastError = err.message || 'Transfer failed.';
        draft.attempts = (draft.attempts || 0) + 1;
        draft.nextAttemptAt = Date.now() + Math.min(300000, Math.pow(2, draft.attempts) * 1000);
        saveAndRenderTransferQueue();
        if (!silent) showToast?.(draft.lastError);
        logTransferActivity({
            status: 'error',
            message: 'Transfer retry failed',
            productId: draft.productId,
            productName: draft.productName,
            attempts: draft.attempts,
            detail: draft.lastError
        });
        return false;
    } finally {
        if (retryBtn && !silent) {
            retryBtn.disabled = false;
            retryBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Retry';
        }
        scheduleTransferRetryLoop();
    }
}

async function retryAllTransfers() {
    if (!Array.isArray(transferDrafts) || !transferDrafts.length) return;
    const originalLabel = retryAllTransfersBtn?.innerHTML;
    if (retryAllTransfersBtn) {
        retryAllTransfersBtn.disabled = true;
        retryAllTransfersBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying';
    }
    try {
        logTransferActivity({
            status: 'info',
            message: 'Retrying all pending transfers',
            detail: `Scheduled ${transferDrafts.length} item(s) for retry`
        });
        for (let i = transferDrafts.length - 1; i >= 0; i--) {
            await retryTransferDraft(i, { silent: true });
        }
        showToast?.('Pending transfers queued for retry.');
    } finally {
        if (retryAllTransfersBtn) {
            retryAllTransfersBtn.disabled = false;
            retryAllTransfersBtn.innerHTML = originalLabel || '<i class="fas fa-redo-alt"></i> Retry All';
        }
    }
}

function clearTransferQueue() {
    if (!Array.isArray(transferDrafts) || !transferDrafts.length) return;
    const confirmed = window.confirm('Clear all pending transfers? This cannot be undone.');
    if (!confirmed) return;
    transferDrafts = [];
    saveAndRenderTransferQueue();
    showToast?.('Pending transfers cleared.');
    logTransferActivity({
        status: 'info',
        message: 'Pending transfers cleared',
        detail: 'All queued transfers removed by user'
    });
}

function handleTransferQueueClick(event) {
    const button = event.target.closest('button[data-transfer-action]');
    if (!button) return;
    event.preventDefault();
    const index = Number.parseInt(button.dataset.index, 10);
    if (!Number.isFinite(index) || index < 0) return;
    const action = button.dataset.transferAction;
    if (action === 'retry') {
        retryTransferDraft(index);
    } else if (action === 'remove') {
        removeTransferDraft(index);
        showToast?.('Pending transfer removed.');
    }
}

function rememberShelfLifeCode(product, code) {
    if (!product || (!product.id && !product.ean)) return;
    const existing = (product.id && shelfLifeMap[product.id]) || (product.ean && shelfLifeMap[product.ean]) || '';
    if (!code && !existing) return;
    if (code && existing === code) return;
    if (!code) {
        if (product.id) delete shelfLifeMap[product.id];
        if (product.ean) delete shelfLifeMap[product.ean];
    } else {
        if (product.id) shelfLifeMap[product.id] = code;
        if (product.ean) shelfLifeMap[product.ean] = code;
    }
    saveShelfLifeMap(shelfLifeMap);
}

function applyRememberedShelfLife(product) {
    if (!product) return;
    const remembered = (product.id && shelfLifeMap[product.id]) || (product.ean && shelfLifeMap[product.ean]) || '';
    if (remembered) {
        product.shelfLifeCode = remembered;
    }
}

function resetWarehouseForm() {
    if (!warehouseForm) return;
    warehouseForm.reset();
    warehouseForm.dataset.mode = 'create';
    warehouseForm.dataset.warehouseId = '';
    setWarehouseError('');
}

function openWarehouseModal() {
    if (!warehouseModal) return;
    resetWarehouseForm();
    warehouseModal.classList.add('active');
    warehouseModal.setAttribute('aria-hidden', 'false');
    warehouseForm?.querySelector('#warehouse-code')?.focus();
    document.body.classList.add('modal-open');
}

function closeWarehouseModal() {
    if (!warehouseModal) return;
   warehouseModal.classList.remove('active');
    warehouseModal.setAttribute('aria-hidden', 'true');
    resetWarehouseForm();
    document.body.classList.remove('modal-open');
}

function clearTransferError() {
    if (transferError) {
        transferError.textContent = '';
        transferError.classList.remove('show');
    }
}

function showTransferError(message) {
    if (transferError) {
        transferError.textContent = message;
        transferError.classList.add('show');
    }
}

function resetTransferForm() {
    transferForm?.reset();
    activeTransferProductId = '';
    clearTransferError();
    if (transferQuantityInput) transferQuantityInput.value = '1';
    if (transferSourceSelect) transferSourceSelect.value = '';
    if (transferDestinationSelect) transferDestinationSelect.value = '';
    if (transferNoteInput) transferNoteInput.value = '';
    if (transferProductSummary) {
        transferProductSummary.innerHTML = 'Select a product to view current stock and warehouse assignment.';
    }
}

function populateTransferProductOptions(list = products) {
    if (!transferProductSelect) return;
    const productList = Array.isArray(list) ? list : [];
    const signature = productList
        .map(p => `${p.id || ''}|${p.name || ''}|${p.ean || ''}|${p.plu || ''}`)
        .join('||');
    if (signature === transferProductOptionsSignature) return;
    transferProductOptionsSignature = signature;
    const options = ['<option value="">Select product</option>'];
    productList.forEach(product => {
        const id = product?.id;
        if (!id) return;
        const parts = [
            product.name || 'Unnamed product',
            product.ean ? `EAN ${product.ean}` : '',
            product.plu ? `PLU ${product.plu}` : ''
        ].filter(Boolean);
        options.push(`<option value="${escapeHtml(String(id))}">${escapeHtml(parts.join(' · '))}</option>`);
    });
    transferProductSelect.innerHTML = options.join('');
    if (activeTransferProductId) {
        transferProductSelect.value = activeTransferProductId;
        if (transferProductSelect.value !== activeTransferProductId) {
            activeTransferProductId = '';
        }
    }
}

function setActiveTransferProduct(product) {
    activeTransferProductId = product?.id ? String(product.id) : '';
    if (transferProductSelect) {
        if (activeTransferProductId) {
            transferProductSelect.value = activeTransferProductId;
            if (transferProductSelect.value !== activeTransferProductId) {
                transferProductSelect.value = '';
                activeTransferProductId = '';
            }
        } else {
            transferProductSelect.value = '';
        }
    }
    if (transferProductSummary) {
        if (product) {
            const badgeParts = [];
            if (product.ean) badgeParts.push(`<span><i class="fas fa-barcode"></i>${escapeHtml(String(product.ean))}</span>`);
            if (product.plu) badgeParts.push(`<span><i class="fas fa-tag"></i>PLU ${escapeHtml(String(product.plu))}</span>`);
            const warehouseName = getWarehouseDisplayName(product.warehouseId || product.warehouse);
            const stockLine = `<span><i class="fas fa-boxes"></i>${escapeHtml(formatNumber(product.amount ?? 0, 0))} in stock</span>`;
            const warehouseLine = warehouseName && warehouseName !== '—'
                ? `<span><i class="fas fa-warehouse"></i>${escapeHtml(warehouseName)}</span>`
                : '';
            const badgeHtml = badgeParts.length ? `<div class="transfer-modal__meta">${badgeParts.join('')}</div>` : '';
            const metaHtml = `<div class="transfer-modal__meta">${stockLine}${warehouseLine ? ` ${warehouseLine}` : ''}</div>`;
            transferProductSummary.innerHTML = `<strong>${escapeHtml(product.name || 'Unnamed product')}</strong>${badgeHtml}${metaHtml}`;
        } else {
            transferProductSummary.innerHTML = 'Select a product to view current stock and warehouse assignment.';
        }
    }
    if (transferSourceSelect) {
        const suggestedSource = product?.warehouseId || product?.warehouse || '';
        transferSourceSelect.value = suggestedSource ? String(suggestedSource) : '';
        if (suggestedSource && transferSourceSelect.value !== String(suggestedSource)) {
            populateWarehouseSelectOptions();
            transferSourceSelect.value = String(suggestedSource);
        }
    }
    if (transferQuantityInput) {
        if (product && Number.isFinite(Number(product.amount))) {
            transferQuantityInput.max = Math.max(0, Number(product.amount));
        } else {
            transferQuantityInput.removeAttribute('max');
        }
        if (!transferQuantityInput.value || Number(transferQuantityInput.value) <= 0) {
            transferQuantityInput.value = '1';
        }
    }
}

function openTransferModal(initial = {}) {
    if (!transferModal) return;
    resetTransferForm();
    populateWarehouseSelectOptions(warehouses);
    populateTransferProductOptions(products);
    clearTransferError();
    const productId = initial?.productId ? String(initial.productId) : '';
    let product = null;
    if (productId) {
        product = products.find(p => String(p.id || '') === productId) || null;
    }
    setActiveTransferProduct(product);
    if (productId && !product) {
        activeTransferProductId = productId;
    }
    if (initial?.source && transferSourceSelect) {
        transferSourceSelect.value = String(initial.source);
        if (transferSourceSelect.value !== String(initial.source)) {
            populateWarehouseSelectOptions();
            transferSourceSelect.value = String(initial.source);
        }
    }
    if (initial?.destination && transferDestinationSelect) {
        transferDestinationSelect.value = String(initial.destination);
    } else if (transferDestinationSelect && transferDestinationSelect.value === transferSourceSelect?.value) {
        transferDestinationSelect.value = '';
    }
    if (transferQuantityInput) {
        const qty = Number.parseInt(initial?.quantity, 10);
        transferQuantityInput.value = Number.isFinite(qty) && qty > 0 ? String(qty) : '1';
    }
    if (transferNoteInput) {
        transferNoteInput.value = initial?.notes || '';
    }
    transferModal.classList.add('active');
    transferModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => {
        (transferQuantityInput || transferProductSelect)?.focus?.();
    });
}

function closeTransferModal() {
    if (!transferModal) return;
    transferModal.classList.remove('active');
    transferModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    resetTransferForm();
}

function handleTransferProductChange(event) {
    const productId = event?.target?.value || '';
    const product = products.find(p => String(p.id || '') === productId);
    setActiveTransferProduct(product || null);
}

async function handleTransferSubmit(event) {
    event?.preventDefault?.();
    clearTransferError();
    const productId = transferProductSelect?.value || activeTransferProductId;
    if (!productId) {
        showTransferError('Select a product to transfer.');
        return;
    }
    const sourceId = transferSourceSelect?.value || '';
    const destId = transferDestinationSelect?.value || '';
    if (!sourceId || !destId) {
        showTransferError('Choose both source and destination warehouses.');
        return;
    }
    if (sourceId === destId) {
        showTransferError('Source and destination warehouses must be different.');
        return;
    }
    const quantity = Number.parseInt(transferQuantityInput?.value, 10);
    if (!Number.isFinite(quantity) || quantity <= 0) {
        showTransferError('Enter a quantity greater than zero.');
        return;
    }
    const product = products.find(p => String(p.id || '') === productId) || null;
    if (product && Number.isFinite(Number(product.amount)) && quantity > Number(product.amount)) {
        showTransferError('Transfer quantity exceeds current stock.');
        return;
    }
    const notes = transferNoteInput?.value.trim() || '';
    const payload = {
        productId,
        fromWarehouseId: sourceId,
        toWarehouseId: destId,
        quantity,
        notes,
        initiatedBy: currentUser.email,
        productName: product?.name || ''
    };
    const originalLabel = transferSubmitBtn?.innerHTML;
    if (transferSubmitBtn) {
        transferSubmitBtn.disabled = true;
        transferSubmitBtn.dataset.loading = '1';
        transferSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording';
    }
    try {
        let message = 'Transfer recorded successfully.';
        try {
            const res = await fetchWithShop(`${API_BASE}/warehouses/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            let responseJson = null;
            const text = await res.text();
            if (!res.ok) {
                let msg = `Transfer failed (${res.status})`;
                try {
                    if (text) {
                        const maybeJson = JSON.parse(text);
                        if (maybeJson?.error) msg = maybeJson.error;
                    }
                } catch {}
                if (res.status === 404 || res.status === 503) {
                    recordLocalTransfer({ ...payload, syncStatus: 'pending', error: msg });
                    console.warn('Transfer endpoint unavailable; saved locally for later sync.');
                    message = msg.includes('Transfer failed') ? 'Transfer saved locally. Sync when the warehouse service is available.' : msg;
                } else {
                    const error = new Error(msg);
                    error.isServer = true;
                    throw error;
                }
            } else {
                responseJson = {};
                if (text) {
                    try {
                        responseJson = JSON.parse(text);
                    } catch (parseErr) {
                        console.warn('Transfer response parse error:', parseErr);
                    }
                }
                message = responseJson?.message || message;
                if (responseJson?.product) {
                    const updatedProduct = normalizeProduct(responseJson.product);
                    rememberShelfLifeCode(updatedProduct, updatedProduct.shelfLifeCode || '');
                    updateLocalCollections(updatedProduct);
                    await rerenderAfterDataChange();
                    updateDashboard();
                    updateNotificationBadges();
                    updateRestockBadgeFallback();
                    await refreshDuplicateBadge();
                    await silentRefreshOnce?.();
                }
            }
        } catch (err) {
            if (err?.isServer) throw err;
            recordLocalTransfer({ ...payload, syncStatus: 'pending' });
            console.warn('Transfer request failed; saved locally for later sync:', err);
            message = 'Transfer saved locally. Sync when the warehouse service is available.';
        }
        showToast?.(message);
        closeTransferModal();
    } catch (err) {
        console.error('Transfer submit error:', err);
        showTransferError(err.message || 'Failed to record transfer.');
    } finally {
        if (transferSubmitBtn) {
            transferSubmitBtn.disabled = false;
            delete transferSubmitBtn.dataset.loading;
            transferSubmitBtn.innerHTML = originalLabel || '<i class="fas fa-exchange-alt"></i> Record Transfer';
        }
    }
}

function warehouseStatusPill(status = 'inactive') {
    const state = (status || '').toLowerCase();
    const label = state === 'active' ? 'Active' : 'Inactive';
    const cls = state === 'active' ? 'status-pill is-active' : 'status-pill is-inactive';
    return `<span class="${cls}">${label}</span>`;
}

function buildWarehouseRow(warehouse) {
    const {
        code = '—',
        name = '—',
        address = '—',
        manager = '—',
        status = 'inactive',
        totalSkus = 0,
        capacityUsedPct = 0
    } = warehouse || {};
    const utilisation = Math.min(100, Math.max(0, Number(capacityUsedPct) || 0));
    return `
    <tr data-warehouse-id="${warehouse?.id || ''}">
      <td>${escapeHtml(code)}</td>
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(address || '—')}</td>
      <td>${escapeHtml(manager || '—')}</td>
      <td>${warehouseStatusPill(status)}</td>
      <td>${Number(totalSkus) || 0}</td>
      <td>
        <div class="capacity-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${utilisation}">
          <span style="width:${utilisation}%"></span>
        </div>
      </td>
      <td>
        <button type="button" class="btn-link" data-action="edit-warehouse">Edit</button>
        <button type="button" class="btn-link text-danger" data-action="delete-warehouse">Delete</button>
      </td>
    </tr>`;
}

function updateWarehouseMetrics(list = warehouses) {
    if (!warehouseTotalCountEl) return;
    const total = list.length;
    const active = list.filter(w => (w.status || '').toLowerCase() === 'active').length;
    const inactive = total - active;
    const averageSkus = total ? Math.round(list.reduce((sum, w) => sum + (Number(w.totalSkus) || 0), 0) / total) : 0;
    warehouseTotalCountEl.textContent = String(total);
    warehouseActiveCountEl.textContent = String(active);
    warehouseInactiveCountEl.textContent = String(inactive);
    warehouseAverageSkusEl.textContent = String(averageSkus);
}

function renderWarehouses(list = warehouses) {
    if (!warehouseTableBody) return;
    if (!list.length) {
        warehouseTableBody.innerHTML = `<tr><td colspan="8" class="warehouse-empty">No warehouses yet. Click “Add Warehouse” to create your first location.</td></tr>`;
        updateWarehouseMetrics(list);
        return;
    }
    warehouseTableBody.innerHTML = list.map(buildWarehouseRow).join('');
    updateWarehouseMetrics(list);
}

async function loadWarehouses() {
    if (!warehouseTableBody) return;
    warehouses = loadLocalWarehouses();
    renderWarehouses();
    populateWarehouseSelectOptions(warehouses);
    let fallbackUsed = false;
    try {
        const res = await fetchWithShop(`${API_BASE}/warehouses?limit=500`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        const raw = await res.text();
        if (!res.ok) {
            console.error('Failed to load warehouses:', res.status, raw);
            fallbackUsed = true;
            throw new Error('Server unavailable');
        } else {
            const payload = raw ? JSON.parse(raw) : [];
            if (Array.isArray(payload?.data)) {
                warehouses = payload.data;
            } else if (Array.isArray(payload)) {
                warehouses = payload;
            } else {
                warehouses = [];
            }
            saveLocalWarehouses(warehouses);
        }
    } catch (err) {
        console.error('Warehouse fetch error:', err);
        if (!warehouses.length) {
            warehouses = loadLocalWarehouses();
        }
        if (!fallbackUsed) {
            showToast?.('Could not connect to warehouse service. Showing cached data.');
        }
    }
    renderWarehouses();
    populateWarehouseSelectOptions(warehouses);
    if (products?.length) renderInventory(products, false, _currentFilterType || 'all');
}

function setWarehouseError(message = '') {
    const errorEl = document.getElementById('warehouse-error');
    if (!errorEl) return;
    if (message) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    } else {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }
}

async function saveWarehouse() {
    if (!warehouseForm) return;
    const formData = new FormData(warehouseForm);
    const payload = {
        code: formData.get('warehouse-code')?.toString().trim() || document.getElementById('warehouse-code')?.value.trim(),
        name: formData.get('warehouse-name')?.toString().trim() || document.getElementById('warehouse-name')?.value.trim(),
        status: document.getElementById('warehouse-status')?.value || 'active',
        manager: document.getElementById('warehouse-manager')?.value.trim() || '',
        phone: document.getElementById('warehouse-phone')?.value.trim() || '',
        email: document.getElementById('warehouse-email')?.value.trim() || '',
        address: document.getElementById('warehouse-address')?.value.trim() || '',
        notes: document.getElementById('warehouse-notes')?.value.trim() || ''
    };

    if (!payload.code) { showToast?.('Warehouse code is required.'); return; }
    if (!payload.name) { showToast?.('Warehouse name is required.'); return; }

    try {
        setWarehouseError('');
        const res = await fetchWithShop(`${API_BASE}/warehouses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(payload)
        });
        const raw = await res.text();
        if (!res.ok) {
            let message = 'Failed to save warehouse.';
            try {
                const json = raw ? JSON.parse(raw) : null;
                if (json?.error) message = json.error;
            } catch {}
            throw new Error(message);
        }
        const saved = raw ? JSON.parse(raw) : payload;
        warehouses.unshift(saved);
        saveLocalWarehouses(warehouses);
        renderWarehouses();
        populateWarehouseSelectOptions(warehouses);
        closeWarehouseModal();
        showToast?.('Warehouse saved successfully.');
    } catch (err) {
        console.error('Save warehouse error:', err);
        const localWarehouse = {
            ...payload,
            id: `wh_${Date.now()}`,
            createdAt: Date.now(),
            status: payload.status || 'active',
            totalSkus: 0,
            capacityUsedPct: 0
        };
        warehouses.unshift(localWarehouse);
        saveLocalWarehouses(warehouses);
        renderWarehouses();
        populateWarehouseSelectOptions(warehouses);
        closeWarehouseModal();
        showToast?.('Warehouse saved locally (offline mode).');
    }
}
const escapeHtml = (str = '') =>
    String(str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));

const PRIMARY_CATEGORY_OPTIONS = [
    'Troso',
    'Trocken',
    'Mopo',
    'Tiko',
    'Frisch-Fleisch',
    'Kosmetick',
    'Food',
    'Non food',
    'Gemüse',
    'Getranke',
    'Obst',
    'Brotschen',
    'Brot',
    'Suesswaren',
    'Snacks'
];

const CATEGORY_BADGE_MAP = {
    'troso':      { icon: 'fas fa-fire',             theme: 'hot',       label: 'Hot' },
    'mopo':       { icon: 'fas fa-snowflake',        theme: 'cold',      label: 'Cold' },
    'frisch-fleisch': { icon: 'fas fa-drumstick-bite', theme: 'meat',    label: 'Frisch-Fleisch' },
    'tiko':       { icon: 'fas fa-temperature-low',  theme: 'ultracold', label: 'Tiko', html: '<span class="badge-text">&minus;23&deg;C</span>' },
    'kosmetick':  { icon: 'fas fa-spray-can',        theme: 'kosmetick', label: 'Kosmetick' },
    'food':       { icon: 'fas fa-utensils',         theme: 'food',      label: 'Food' },
    'non food':   { icon: 'fas fa-box-open',         theme: 'nonfood',   label: 'Non food' },
    'gemüse':     { icon: 'fas fa-carrot',           theme: 'produce',   label: 'Gemüse' },
    'getranke':   { icon: 'fas fa-wine-bottle',      theme: 'drink',     label: 'Getranke' },
    'obst':       { icon: 'fas fa-apple-alt',        theme: 'produce',   label: 'Obst' },
    'brotschen':  { icon: 'fas fa-bread-slice',      theme: 'bakery',    label: 'Brotschen' },
    'brot':       { icon: 'fas fa-bread-slice',      theme: 'bakery',    label: 'Brot' },
    'suesswaren': { icon: 'fas fa-cookie-bite',      theme: 'sweet',     label: 'Suesswaren' },
    'snacks':     { icon: 'fas fa-cookie-bite',      theme: 'snack',     label: 'Snacks' }
};

const BULK_DELETE_PASSWORD = '34024742';
let bulkSelectionMode = false;
const selectedProductIds = new Set();
let bulkSelectBtn = null;
let bulkDeleteBtn = null;
const eslSelectedIds = new Set();
let eslFilterTerm = '';
let eslCurrentFormat = 'standard';
let eslHighlightPromos = true;

function updateSecondaryCategories() {
    const primarySelect = document.getElementById('primary-category-input');
    const secondaryGroup = document.getElementById('secondary-category-group');
    const secondarySelect = document.getElementById('secondary-category-input');
    if (!primarySelect || !secondaryGroup || !secondarySelect) return;

    const hierarchy = window.categoryHierarchy || {};
    const primaryCategory = primarySelect.value || '';
    if (primaryCategory && Array.isArray(hierarchy[primaryCategory])) {
        secondaryGroup.style.display = 'block';
        secondarySelect.innerHTML = '<option value="">Select Secondary Category</option>';
        hierarchy[primaryCategory].forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            secondarySelect.appendChild(opt);
        });
    } else {
        secondaryGroup.style.display = 'none';
        secondarySelect.innerHTML = '<option value=\"\">Select Secondary Category</option>';
    }
}

function categoryBadgeMarkup(product) {
    const primary = (product?.primaryCategory || product?.category || '').trim().toLowerCase();
    if (!primary) return '';
    const config = CATEGORY_BADGE_MAP[primary];
    if (!config) return '';
    const labelText = config.label || primary;
    const iconHtml = config.icon ? `<i class="${config.icon}" aria-hidden="true"></i>` : '';
    const textHtml = config.html ? config.html : (config.text ? `<span class="badge-text">${escapeHtml(config.text)}</span>` : '');
    return `<span class="category-badge badge-${config.theme}" role="img" aria-label="${escapeHtml(labelText)}" title="${escapeHtml(labelText)}">${iconHtml}${textHtml}</span>`;
}

function categorySelectOptions(selected = '') {
    const selLower = String(selected || '').toLowerCase();
    return PRIMARY_CATEGORY_OPTIONS.map(option => {
        const isSelected = selLower === option.toLowerCase();
        return `<option value="${escapeHtml(option)}"${isSelected ? ' selected' : ''}>${escapeHtml(option)}</option>`;
    }).join('');
}

function setupPrimaryTabs() {
    const navButtons = Array.from(document.querySelectorAll('.primary-nav .nav-pill'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));
    if (!navButtons.length || !panels.length) return;

    const tabStorageKey = shopStorageKey('ui:activeTab');

    const persistActiveTab = (tab) => {
        try {
            if (tab) localStorage.setItem(tabStorageKey, tab);
        } catch (err) {
            console.warn('Could not persist active tab:', err);
        }
    };

    const showPanel = (tab) => {
        panels.forEach(panel => {
            const match = panel.dataset.tab === tab;
            panel.classList.toggle('is-active', !!match);
            if (match) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
        });
        navButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        if (tab !== 'product-management' && bulkSelectionMode) {
            setBulkSelectionMode(false);
        }
        persistActiveTab(tab);
        if (tab === 'online-shop') {
            initializeOnlineShopPanel();
            if (onlineShopState.needsFirstLoad) {
                refreshOnlineShopPanel(true);
            } else {
                updateOnlineShopCard();
            }
        }
    };

    const focusTabAt = (index) => {
        const target = navButtons[index];
        if (!target) return;
        showPanel(target.dataset.tab);
        target.focus();
    };

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => showPanel(btn.dataset.tab));
        btn.addEventListener('keydown', (event) => {
            const currentIndex = navButtons.indexOf(btn);
            if (currentIndex < 0) return;
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    focusTabAt((currentIndex + 1) % navButtons.length);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    focusTabAt((currentIndex - 1 + navButtons.length) % navButtons.length);
                    break;
                case 'Home':
                    event.preventDefault();
                    focusTabAt(0);
                    break;
                case 'End':
                    event.preventDefault();
                    focusTabAt(navButtons.length - 1);
                    break;
                default:
                    break;
            }
        });
    });

    let initialTab;
    try {
        const saved = localStorage.getItem(tabStorageKey);
        if (saved && navButtons.some(btn => btn.dataset.tab === saved)) {
            initialTab = saved;
        }
    } catch {}
    if (!initialTab) {
        initialTab = navButtons.find(btn => btn.classList.contains('is-active'))?.dataset.tab ||
            navButtons[0]?.dataset.tab;
    }
    if (initialTab) showPanel(initialTab);
}

function setBulkSelectionMode(active) {
    bulkSelectionMode = !!active;
    document.body.classList.toggle('bulk-selection-active', bulkSelectionMode);
    if (bulkSelectBtn) {
        bulkSelectBtn.classList.toggle('is-active', bulkSelectionMode);
        bulkSelectBtn.setAttribute('aria-pressed', bulkSelectionMode ? 'true' : 'false');
    }
    if (!bulkSelectionMode) {
        selectedProductIds.clear();
    }
    updateBulkDeleteButtonState();
    refreshBulkSelectionHighlights();
}

function toggleBulkSelectionMode() {
    setBulkSelectionMode(!bulkSelectionMode);
    if (bulkSelectionMode && selectedProductIds.size === 0 && typeof showToast === 'function') {
        showToast('Selection mode enabled. Click rows to select products.');
    }
}

function updateBulkDeleteButtonState() {
    const count = selectedProductIds.size;
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = !count;
        bulkDeleteBtn.classList.toggle('is-active', !!count);
        bulkDeleteBtn.title = count
            ? `Delete ${count} selected product${count === 1 ? '' : 's'}`
            : 'Delete selected rows';
    }
    if (bulkSelectBtn) {
        bulkSelectBtn.title = bulkSelectionMode
            ? (count ? `${count} selected` : 'Selection mode active')
            : 'Select rows';
    }
}

function refreshBulkSelectionHighlights() {
    if (!inventoryBody) return;
    const rows = inventoryBody.querySelectorAll('tr.expanded-row');
    rows.forEach(row => {
        const id = row.dataset.id;
        const isSelected = bulkSelectionMode && id && selectedProductIds.has(id);
        row.classList.toggle('is-selected', isSelected);
        const detailsRow = row.nextElementSibling;
        if (detailsRow && detailsRow.classList.contains('expanded-details')) {
            detailsRow.classList.toggle('is-selected', isSelected);
        }
    });
    updateBulkDeleteButtonState();
}

function toggleRowSelection(productId) {
    if (!bulkSelectionMode || !productId) return;
    const key = String(productId);
    if (selectedProductIds.has(key)) {
        selectedProductIds.delete(key);
    } else {
        selectedProductIds.add(key);
    }
    refreshBulkSelectionHighlights();
}

function setBulkDeleteError(message = '') {
    if (!bulkDeleteError) return;
    if (message) {
        bulkDeleteError.textContent = message;
        bulkDeleteError.classList.add('is-visible');
    } else {
        bulkDeleteError.textContent = '';
        bulkDeleteError.classList.remove('is-visible');
    }
}

function showBulkDeletePopup() {
    if (!bulkDeletePopup) return;
    setBulkDeleteError('');
    if (bulkDeletePasswordInput) {
        bulkDeletePasswordInput.value = '';
        setTimeout(() => bulkDeletePasswordInput.focus(), 0);
    }
    bulkDeletePopup.classList.add('active');
}

function closeBulkDeletePopup() {
    if (!bulkDeletePopup) return;
    bulkDeletePopup.classList.remove('active');
    if (bulkDeletePasswordInput) bulkDeletePasswordInput.value = '';
    setBulkDeleteError('');
}

window.closeBulkDeletePopup = closeBulkDeletePopup;

async function performBulkDelete() {
    try {
        const ids = Array.from(selectedProductIds);
        const res = await fetchWithShop(`${API_BASE}/products/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        if (!res.ok) throw new Error(`Bulk delete failed: ${res.status}`);
        const data = await res.json().catch(() => ({}));
        const deletedCount = data.deleted ?? ids.length;

        if (deletedCount > 0) {
            products = products.filter(p => !selectedProductIds.has(String(p.id)));
            serverTotalProducts = Math.max(0, (serverTotalProducts || 0) - deletedCount);
        }

        setBulkSelectionMode(false);
        renderInventory(products);
        updateNotificationBadges();
        await loadMetrics();
        updateRestockBadgeFallback();
        await refreshDuplicateBadge();

        showToast(`Deleted ${deletedCount} product${deletedCount === 1 ? '' : 's'}.`);
        return true;
    } catch (err) {
        console.error('Bulk delete error:', err);
        showToast(err.message || 'Error deleting selected products.');
        return false;
    }
}

async function handleBulkDeleteConfirm(event) {
    event?.preventDefault?.();
    if (!selectedProductIds.size) {
        setBulkDeleteError('No products selected.');
        return;
    }
    if (!bulkDeletePasswordInput) {
        await performBulkDelete();
        return;
    }
    const password = bulkDeletePasswordInput.value.trim();
    if (!password) {
        setBulkDeleteError('Password is required.');
        bulkDeletePasswordInput.focus();
        return;
    }
    if (password !== BULK_DELETE_PASSWORD) {
        setBulkDeleteError('Incorrect password. Please try again.');
        bulkDeletePasswordInput.select();
        showToast('Incorrect password.');
        return;
    }
    const btn = event?.currentTarget;
    try {
        if (btn) btn.disabled = true;
        const success = await performBulkDelete();
        if (success) closeBulkDeletePopup();
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function handleBulkDeleteClick() {
    if (!selectedProductIds.size) {
        showToast('Select at least one product first.');
        return;
    }
    if (bulkDeletePopup) {
        showBulkDeletePopup();
        return;
    }
    const password = prompt('Enter reset password to delete selected products:');
    if (password === null) return;
    if (password.trim() !== BULK_DELETE_PASSWORD) {
        showToast('Incorrect password.');
        return;
    }
    await performBulkDelete();
}

function computeStockValue(product) {
    const cost = Number(product.cost) || 0;
    const amount = Number(product.amount) || 0;
    return cost * amount;
}

function formatCurrency(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '—';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value, decimals = 2) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '—';
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatEuro(value) {
    const formatted = formatCurrency(value);
    return formatted === '—' ? '—' : formatted;
}

function getESLId(product = {}) {
    return String(
        product.id ??
        product._id ??
        product.ean ??
        product.plu ??
        product.sku ??
        product.name ??
        Math.random().toString(36).slice(2)
    );
}

function eslMatchesFilter(product, term) {
    if (!term) return true;
    const needle = term.trim().toLowerCase();
    if (!needle) return true;
    const fields = [
        product.name,
        product.brand,
        product.ean,
        product.plu,
        product.sku,
        product.primaryCategory,
        product.category
    ];
    return fields.some(value => String(value ?? '').toLowerCase().includes(needle));
}

function computeESLPricing(product) {
    const basePrice = Number(product.price) || 0;
    const promoValue = toNumberMaybe?.(product.promoPrice, NaN);
    const promoPrice = Number.isFinite(promoValue) ? promoValue : NaN;
    const hasPromo = Number.isFinite(promoPrice) && promoPrice > 0 && promoPrice < basePrice;
    const discountPct = hasPromo ? Math.round((1 - promoPrice / basePrice) * 100) : 0;
    return {
        basePrice,
        promoPrice,
        hasPromo,
        discountPct
    };
}

function parseUnitQuantity(raw) {
    if (!raw) return null;
    const str = String(raw).toLowerCase();
    const literMatch = str.match(/(\d+(?:[.,]\d+)?)\s*(l|liter|ltr)/);
    if (literMatch) {
        const qty = parseFloat(literMatch[1].replace(',', '.'));
        if (Number.isFinite(qty) && qty > 0) return { quantity: qty, unit: 'L' };
    }
    const mlMatch = str.match(/(\d+(?:[.,]\d+)?)\s*ml/);
    if (mlMatch) {
        const qty = parseFloat(mlMatch[1].replace(',', '.'));
        if (Number.isFinite(qty) && qty > 0) return { quantity: qty / 1000, unit: 'L' };
    }
    const kgMatch = str.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilogramm)/);
    if (kgMatch) {
        const qty = parseFloat(kgMatch[1].replace(',', '.'));
        if (Number.isFinite(qty) && qty > 0) return { quantity: qty, unit: 'kg' };
    }
    const gMatch = str.match(/(\d+(?:[.,]\d+)?)\s*g/);
    if (gMatch) {
        const qty = parseFloat(gMatch[1].replace(',', '.'));
        if (Number.isFinite(qty) && qty > 0) return { quantity: qty / 1000, unit: 'kg' };
    }
    return null;
}

function formatEuroCompact(value) {
    if (!Number.isFinite(value)) return '—';
    const num = Number(value).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return num;
}

function formatBasePriceText(product, unitPrice) {
    const direct = product.basePriceText || product.basePrice;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    if (Number.isFinite(Number(direct)) && Number(direct) > 0 && product.basePriceUnit) {
        const text = formatEuroCompact(Number(direct));
        return text === '—' ? '' : `${text}/${product.basePriceUnit}`;
    }
    const parsedDim = parseUnitQuantity(product.dimensions)
        || parseUnitQuantity(product.shortDesc)
        || parseUnitQuantity(product.longDesc)
        || parseUnitQuantity(product.metaDesc);
    const weight = Number(product.weight);
    if (parsedDim) {
        const perUnit = parsedDim.quantity ? unitPrice / parsedDim.quantity : NaN;
        if (Number.isFinite(perUnit) && perUnit > 0) {
            const text = formatEuroCompact(perUnit);
            return text === '—' ? '' : `${text}/${parsedDim.unit}`;
        }
    } else if (Number.isFinite(weight) && weight > 0) {
        const perUnit = unitPrice / weight;
        if (Number.isFinite(perUnit) && perUnit > 0) {
            const unit = weight >= 1 ? 'kg' : (weight >= 0.1 ? 'kg' : '100g');
            if (unit === '100g') {
                const text = formatEuroCompact(perUnit * 0.1);
                return text === '—' ? '' : `${text}/100g`;
            }
            const text = formatEuroCompact(perUnit);
            return text === '—' ? '' : `${text}/${unit}`;
        }
    }
    return '';
}

function toDateInputValue(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

function computeRelativeExpiryValue(product) {
    if (!product) return null;
    const raw = product.expiryDate || product.bestBefore;
    if (!raw) return null;
    const date = raw instanceof Date ? raw : new Date(raw);
    const targetTime = date?.getTime?.();
    if (!Number.isFinite(targetTime)) return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffMs = startOfTarget - startOfToday;
    if (diffMs <= 0) return '0D';

    const DAY_MS = 86_400_000;
    const diffDays = Math.ceil(diffMs / DAY_MS);

    if (diffDays < 7) {
        return `${diffDays}D`;
    }
    if (diffDays <= 28) {
        return `${Math.ceil(diffDays / 7)}W`;
    }
    return `${Math.ceil(diffDays / 30)}M`;
}

function computeExpiryDateFromRelative(code) {
    if (!code) return null;
    const match = /^([0-9]+)([DWM])$/i.exec(code.trim());
    if (!match) return null;
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value <= 0) return null;
    const unit = match[2].toUpperCase();
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    let daysToAdd = 0;
    if (unit === 'D') {
        daysToAdd = value;
    } else if (unit === 'W') {
        daysToAdd = value * 7;
    } else if (unit === 'M') {
        daysToAdd = value * 30;
    }
    const result = new Date(base.getTime() + daysToAdd * 86_400_000);
    return result;
}

function formatBestBefore(product) {
    const code = product?.shelfLifeCode || computeRelativeExpiryValue(product);
    return code ? `Max. Haltb.: ${code}` : 'Max. Haltb.: —';
}

function formatCountry(product) {
    if (!product.country) return '';
    return `Herkunftsland: ${product.country}`;
}

function formatVatText(product) {
    if (product.taxClass === 0 || product.taxClass) {
        return `inkl. MwSt. (${formatNumber(product.taxClass, 0)}%)`;
    }
    return 'inkl. MwSt.';
}

function formatSupplierCode(product) {
    if (product.supplierCode) return `LIF: ${product.supplierCode}`;
    if (product.supplier) return `LIF: ${product.supplier}`;
    return '';
}

function derivePromotionTag(product, hasPromo) {
    const desc = String(product.metaDesc || '').toLowerCase();
    if (product.promoLabel) return product.promoLabel;
    if (hasPromo) return 'Aktion';
    if (desc.includes('bio')) return 'Bio';
    if (desc.includes('vegan')) return 'Vegan';
    if (product.metaTitle) return product.metaTitle;
    if (product.visibility && product.visibility.toLowerCase() !== 'public') return product.visibility;
    return '';
}

function buildESLCard(product) {
    const id = getESLId(product);
    const { basePrice, promoPrice, hasPromo, discountPct } = computeESLPricing(product);
    const highlightPromo = eslHighlightPromos && hasPromo;
    const formatClass = `esl-label--${eslCurrentFormat}`;
    const isSelected = eslSelectedIds.has(id);
    const safeName = escapeHtml(product.name || 'Unnamed product');
    const category = product.primaryCategory || product.category || '';
    const skuRaw = product.sku ? String(product.sku).toUpperCase() : '';
    const weightValue = Number(product.weight);
    const weightText = Number.isFinite(weightValue) && weightValue > 0
        ? `${formatNumber(weightValue, 2)} kg`
        : '';
    const unitText = 'pro Einheit';
    const priceText = formatEuro(basePrice);
    const promoText = highlightPromo ? formatEuro(promoPrice) : '';
    const ean = product.ean ? String(product.ean) : '';
    const plu = product.plu ? String(product.plu) : '';
    const barcodeDigits = ean;
    const qrValue = ean || plu || product.sku || product.name || id;
    const discountBadge = highlightPromo && discountPct > 0
        ? `<div class="esl-label__discount">-${discountPct}%</div>`
        : '';
    const promoMarkup = highlightPromo
        ? `<div class="esl-label__promo">
                <div class="esl-label__promo-price">${promoText}</div>
                <div class="esl-label__promo-note">Promo</div>
           </div>`
        : '';
    const basePriceText = formatBasePriceText(product, basePrice);
    const promotionTag = derivePromotionTag(product, highlightPromo);
    const tagMarkup = promotionTag ? `<span class="esl-label__tag">${escapeHtml(promotionTag)}</span>` : '';
    const qrMarkup = `<div class="esl-label__qr" data-qr="${escapeHtml(qrValue)}"></div>`;
    const pluCaption = plu ? `<div class="esl-label__qr-caption">PLU ${escapeHtml(plu)}</div>` : '';
    const qrWrap = `<div class="esl-label__qr-wrap">${basePriceText ? `<div class="esl-label__base esl-label__base--qr">${escapeHtml(basePriceText)}</div>` : ''}${qrMarkup}${pluCaption}</div>`;
    const baseRowMarkup = `<div class="esl-label__base-row">${qrWrap}</div>`;
    const bestBefore = formatBestBefore(product);
    const country = formatCountry(product);
    const vatText = formatVatText(product);
    const supplierCode = formatSupplierCode(product);
    const skuLine = skuRaw ? `<div class="esl-label__sku">${escapeHtml(skuRaw)}</div>` : '';
    const contentInfo = weightText ? `<div class="esl-label__content">Inhalt: ${escapeHtml(weightText)}</div>` : '';
    const detailsItems = [
        category ? `Kat.: ${category}` : ''
    ].filter(Boolean);
    if (country) detailsItems.push(country);
    const detailsMarkup = detailsItems
        .map(value => `<span class="esl-label__meta-item">${escapeHtml(String(value))}</span>`).join('');
    const metaItems = '';
    const footerLeft = bestBefore ? `<span class="esl-label__code-info">${escapeHtml(bestBefore)}</span>` : '';
    const footerRight = supplierCode ? `<span class="esl-label__code-info esl-label__code-info--right">${escapeHtml(supplierCode)}</span>` : '';
    const codeFooter = footerLeft || footerRight
        ? `<div class="esl-label__code-meta">${footerLeft}${footerRight}</div>`
        : '';
    const barcodeCaption = barcodeDigits
        ? escapeHtml(`${barcodeDigits}`)
        : '';
    return `
<article class="esl-card${isSelected ? ' is-selected' : ''}${highlightPromo ? ' is-promo' : ''}" data-id="${escapeHtml(id)}">
  <div class="esl-card__toolbar">
    <label class="esl-card__select">
      <input type="checkbox" data-esl-select value="${escapeHtml(id)}"${isSelected ? ' checked' : ''}>
      <span>Select</span>
    </label>
    <button type="button" class="esl-card__print" data-esl-print="${escapeHtml(id)}" title="Print ${safeName}">
      <i class="fas fa-print"></i>
    </button>
  </div>
  <div class="esl-label ${formatClass}">
    ${discountBadge}
    <div class="esl-label__header">
      <div>
        <div class="esl-label__name">${safeName}</div>
        ${skuLine}
      </div>
      <div class="esl-label__header-side">
        ${tagMarkup}
        <div class="esl-label__unit">${escapeHtml(unitText)}</div>
      </div>
    </div>
    <div class="esl-label__body">
      <div class="esl-label__price-row">
        <div class="esl-label__price${hasPromo ? ' is-crossed' : ''}">${priceText}</div>
        ${vatText ? `<div class="esl-label__vat">${escapeHtml(vatText)}</div>` : ''}
        ${promoMarkup}
      </div>
      ${contentInfo}
      ${baseRowMarkup}
      <div class="esl-label__details">${detailsMarkup}</div>
      <div class="esl-label__meta">${metaItems}</div>
      <div class="esl-label__codes">
        <div class="esl-label__barcode">
          <svg class="esl-barcode-svg" data-ean="${escapeHtml(barcodeDigits)}"></svg>
          ${barcodeCaption ? `<div class="esl-label__barcode-digits">${barcodeCaption}</div>` : ''}
        </div>
      </div>
    </div>
    ${codeFooter}
  </div>
</article>`;
}

function buildESLPrintLabel(product) {
    const id = getESLId(product);
    const safeName = escapeHtml(product.name || 'Unnamed product');
    const brandText = product.brand ? escapeHtml(product.brand) : '';
    const { basePrice, promoPrice, hasPromo, discountPct } = computeESLPricing(product);
    const priceText = formatEuro(basePrice);
    const promoText = hasPromo ? formatEuro(promoPrice) : '';
    const basePriceText = formatBasePriceText(product, basePrice);
    const qrValue = product.ean || product.plu || product.sku || product.name || id;
    const bestBefore = formatBestBefore(product);
    const country = formatCountry(product);
    const vatText = formatVatText(product);
    const supplierCode = formatSupplierCode(product);
    const sku = product.sku ? `SKU ${product.sku}` : '';
    const weight = Number(product.weight) > 0 ? `${formatNumber(product.weight, 2)} kg` : '';
    const eanValue = product.ean ? String(product.ean) : '';
    const ean = eanValue ? `EAN ${eanValue}` : '';
    const plu = product.plu ? `PLU ${product.plu}` : '';
    const category = product.primaryCategory || product.category || '';
    const tag = derivePromotionTag(product, hasPromo);
    const tagMarkup = tag ? `<span class="esl-print-tag">${escapeHtml(tag)}</span>` : '';
    const meta = [
        category,
        sku,
        weight,
        ean,
        plu,
        country,
        bestBefore,
        vatText,
        supplierCode
    ].filter(Boolean)
        .map(value => `<span>${escapeHtml(String(value))}</span>`).join('');
return `
<section class="esl-print-label${hasPromo ? ' esl-print-label--promo' : ''}">
  ${hasPromo ? `<div class="esl-print-discount">-${discountPct}%</div>` : ''}
  <h3>${safeName}</h3>
  ${brandText ? `<div class="esl-print-brand">${brandText}</div>` : ''}
  ${tagMarkup}
  <p class="esl-print-price${hasPromo ? ' is-sale' : ''}">${hasPromo ? promoText : priceText}</p>
${hasPromo ? `<p class="esl-print-price esl-print-price--original">${priceText}</p>` : ''}
  ${basePriceText ? `<div class="esl-print-base">${escapeHtml(basePriceText)}</div>` : ''}
  <div class="esl-print-meta">${meta}</div>
  <div class="esl-print-codes">
    <div class="esl-print-barcode">
      <svg class="esl-barcode-svg" data-ean="${escapeHtml(eanValue)}"></svg>
      ${eanValue ? `<div class="esl-barcode-digits">EAN ${escapeHtml(eanValue)}</div>` : ''}
    </div>
    <div class="esl-print-qr" data-qr="${escapeHtml(qrValue)}"></div>
  </div>
</section>`;
}

function updateESLSelectionSummary(visibleCount = 0) {
    if (eslSelectionCount) {
        const count = eslSelectedIds.size;
        const summary = visibleCount ? `${count} selected · ${visibleCount} shown` : `${count} selected`;
        eslSelectionCount.textContent = summary;
    }
    if (eslPrintBtn) {
        eslPrintBtn.disabled = eslSelectedIds.size === 0;
    }
}

function renderESLLabels() {
    if (!eslGrid) return;
    const dataset = Array.isArray(products) ? products : [];
    const validIds = new Set(dataset.map(getESLId));
    eslSelectedIds.forEach(id => {
        if (!validIds.has(id)) eslSelectedIds.delete(id);
    });
    const filtered = dataset.filter(product => eslMatchesFilter(product, eslFilterTerm));
    if (eslEmptyState) {
        eslEmptyState.hidden = filtered.length > 0;
    }
    if (!filtered.length) {
        eslGrid.innerHTML = '';
        updateESLSelectionSummary(0);
        return;
    }
    const capped = filtered.slice(0, 300); // safety cap
    eslGrid.innerHTML = capped.map(buildESLCard).join('');
    updateESLSelectionSummary(filtered.length);
    requestAnimationFrame(() => {
        renderESLQRCodes(eslGrid, eslCurrentFormat === 'large' ? 120 : 96);
        renderEANBarcodes(eslGrid, eslCurrentFormat === 'large' ? 80 : 60);
    });
}

function toggleESLSelection(id, selected) {
    if (!id) return;
    if (selected) eslSelectedIds.add(id);
    else eslSelectedIds.delete(id);
    updateESLSelectionSummary();
}

function clearESLSelection() {
    eslSelectedIds.clear();
    updateESLSelectionSummary();
    renderESLLabels();
}

function selectAllVisibleESLProducts() {
    if (!eslGrid) return;
    eslGrid.querySelectorAll('[data-esl-select]').forEach(input => {
        input.checked = true;
        const id = input.value;
        if (id) eslSelectedIds.add(id);
    });
    updateESLSelectionSummary();
    eslGrid.querySelectorAll('.esl-card').forEach(card => card.classList.add('is-selected'));
}

function printESLLabels(productsToPrint) {
    if (!eslPrintContainer) {
        showToast?.('Print container missing from the page.');
        return;
    }
    if (!productsToPrint.length) {
        showToast?.('Select at least one product to print.');
        return;
    }
    eslPrintContainer.innerHTML = productsToPrint.map(buildESLPrintLabel).join('');
    document.body.classList.add('printing-esl');

    let cleanupDone = false;
    const finalizePrint = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        document.body.classList.remove('printing-esl');
        eslPrintContainer.innerHTML = '';
        window.removeEventListener('afterprint', finalizePrint);
    };

    window.addEventListener('afterprint', finalizePrint, { once: true });

    requestAnimationFrame(() => {
        renderESLQRCodes(eslPrintContainer, eslCurrentFormat === 'large' ? 120 : 96);
        renderEANBarcodes(eslPrintContainer, 80);
        setTimeout(() => {
            try {
                window.print();
            } catch (err) {
                console.error('Print failed:', err);
                finalizePrint();
            }
        }, 250);
    });

    setTimeout(() => finalizePrint(), 60000); // ultimate fallback
}

function updateStockHealth(totalProducts, lowStock) {
    const labelEl = document.getElementById('stock-health-label');
    const barEl = document.getElementById('stock-health-bar');
    if (!labelEl || !barEl) return;

    const productsCount = Number(totalProducts) || 0;
    const lowCount = Math.max(0, Number(lowStock) || 0);

    if (productsCount <= 0) {
        labelEl.textContent = 'No products available yet';
        barEl.style.width = '0%';
        barEl.classList.remove('is-low');
        return;
    }

    const healthy = Math.max(0, productsCount - lowCount);
    const pct = Math.round((healthy / productsCount) * 100);
    const clampedPct = Math.max(0, Math.min(100, pct));

    labelEl.textContent = `${healthy} healthy SKUs (${clampedPct}%)`;
    barEl.style.width = `${clampedPct}%`;
    barEl.classList.toggle('is-low', clampedPct < 40);
}

function updateValuePerSku(totalCostValue, totalProducts) {
    const el = document.getElementById('value-per-sku');
    if (!el) return;
    const productsCount = Number(totalProducts) || 0;
    if (productsCount <= 0) {
        el.textContent = '0.00';
        return;
    }
    el.textContent = formatEuro(totalCostValue / productsCount);
}

function updateWeightPerSku(totalWeightKg, totalProducts) {
    const el = document.getElementById('weight-per-sku');
    if (!el) return;
    const productsCount = Number(totalProducts) || 0;
    if (productsCount <= 0) {
        el.textContent = '0 kg';
        return;
    }
    const average = totalWeightKg / productsCount;
    const formatted = formatNumber(average, 2);
    el.textContent = formatted === '—' ? '—' : `${formatted} kg`;
}

function resolveAssetUrl(path) {
    if (!path) return '';
    const trimmed = String(path).trim();
    if (!trimmed) return '';
    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
        return trimmed;
    }
    const apiOrigin = API_BASE.replace(/\/api\/?$/, '');
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${apiOrigin}${normalizedPath}`;
}

function reorderStatusChip(product) {
    const amount = Number(product.amount) || 0;
    const reorderLevel = Number(product.reorderLevel ?? 10);
    let label = 'Stock OK';
    let cls = 'reorder-ok';
    if (amount <= 0) {
        label = 'Out of stock';
        cls = 'reorder-critical';
    } else if (amount <= reorderLevel) {
        label = 'Reorder now';
        cls = 'reorder-warning';
    }
    return `<span class="reorder-chip ${cls}">${label}</span>`;
}

function latestRestockTimestamp(product) {
    if (!Array.isArray(product?.history)) return Number(product.lastUpdated) || null;
const increases = product.history
        .filter(h => Number(h.newAmount || 0) > Number(h.oldAmount || 0))
        .map(h => h.changedAtMs ?? h.changedAt ?? (h.timestamp ? new Date(h.timestamp).getTime() : null))
        .filter(ts => Number.isFinite(ts));
    if (increases.length) {
        return increases.sort((a, b) => b - a)[0];
    }
    return Number(product.lastUpdated) || Number(product.updatedAt) || null;
}

function renderProductImage(product) {
    const badge = categoryBadgeMarkup(product);
    const rawSrc = product.pictureUrl || product.pictureDataUrl || '';
    const src = resolveAssetUrl(rawSrc);
    const wrapperClass = src ? 'picture-wrapper has-image' : 'picture-wrapper';
    const altText = escapeHtml(product.name || 'Product image');
    if (src) {
        return `<div class="${wrapperClass}">${badge}<img src="${src}" alt="${altText}" loading="lazy"></div>`;
    }
    return `<div class="${wrapperClass}">${badge}<img src="" alt="${altText}" class="is-empty"><div class="picture-placeholder"><i class="fas fa-image"></i></div></div>`;
}
// Create inventory history popup
const inventoryHistoryPopup = document.createElement('div');
inventoryHistoryPopup.className = 'popup';
inventoryHistoryPopup.id = 'inventory-history-popup';
inventoryHistoryPopup.innerHTML = `
    <div class="popup-content" style="width: 90%; max-width: 800px; max-height: 90vh;">
        <div class="popup-header" style="margin-bottom: 20px;">
            <h3 style="margin: 0;"><i class="fas fa-history"></i> Full Inventory History</h3>
            <button class="popup-close" onclick="closeInventoryHistory()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #757575;">×</button>
        </div>
        <div id="inventory-history-content" style="flex: 1; overflow-y: auto; padding: 0 10px;"></div>
        <div class="inventory-history-actions">
            <button class="history-download-btn" onclick="downloadHistory()">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="history-print-btn" onclick="printHistory()">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
    </div>
`;
document.body.appendChild(inventoryHistoryPopup);
// Global variables
let products = [];
let editIndex = -1;
let currentUser = { email: 'golam.rabbani@inventra.com' };
let restockCount = 0; // Track restocked products
let serverTotalProducts = 0;   // comes from API payload.total
let currentPage = 1;
let itemsPerPage = 10;
let sortState = { column: null, direction: 'asc' };
let _currentList = [];
let _currentFilterType = 'all';
let editingRowId = null;
window.__rowEditingEnabled = true;
function resetInlineRowEdit() {
    if (editingRowId !== null) editingRowId = null;
}
window.resetInlineRowEdit = resetInlineRowEdit;
window.openTransferModalForProduct = openTransferModalForProduct;
transferDrafts = loadLocalTransfers();
renderTransferQueue();
scheduleTransferRetryLoop();
renderTransferActivity();
// Save products to local storage
async function saveProducts() {
    updateDashboard();
    updateNotificationBadges();
    updateRestockBadgeFallback();
    renderInventory(products);
    refreshPurchaseProductOptions();
    await refreshDuplicateBadge();
}
// Toggle row (kept for potential use, though not currently called)
function toggleRow(row) {
    const isExpanded = row.getAttribute('aria-expanded') === 'true';
    row.setAttribute('aria-expanded', !isExpanded);
    const nextDetailRow = row.nextElementSibling;
    if (nextDetailRow) {
        nextDetailRow.style.display = isExpanded ? 'none' : 'table-row';
    }
}
// Set up all event listeners
function setupEventListeners() {
    const deletePopup = document.getElementById('delete-confirm-popup');
    const closablePopups = [
        { el: deletePopup, close: closeDeletePopup },
        { el: bulkDeletePopup, close: closeBulkDeletePopup }
    ];
    if (warehouseModal) closablePopups.push({ el: warehouseModal, close: closeWarehouseModal });
    if (transferModal) closablePopups.push({ el: transferModal, close: closeTransferModal });
    if (purchaseModal) closablePopups.push({ el: purchaseModal, close: closePurchaseModal });
    closablePopups.forEach(({ el, close }) => {
        el?.addEventListener('click', (event) => {
            if (event.target === el) close();
        });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closablePopups.forEach(({ el, close }) => {
            if (el?.classList.contains('active')) close();
        });
    });
    eslSearchInput?.addEventListener('input', (event) => {
        eslFilterTerm = event.target.value || '';
        renderESLLabels();
    });
    eslFormatSelect?.addEventListener('change', (event) => {
        eslCurrentFormat = event.target.value || 'standard';
        renderESLLabels();
    });
    eslHighlightToggle?.addEventListener('change', (event) => {
        eslHighlightPromos = !!event.target.checked;
        renderESLLabels();
    });
    eslSelectAllBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        selectAllVisibleESLProducts();
    });
    eslClearSelectionBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        clearESLSelection();
    });
    eslPrintBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        const selectedIds = Array.from(eslSelectedIds);
        if (!selectedIds.length) {
            showToast?.('Select at least one product to print.');
            return;
        }
        const list = products.filter(product => selectedIds.includes(getESLId(product)));
        printESLLabels(list);
    });
    eslGrid?.addEventListener('change', (event) => {
        if (!event.target.matches('[data-esl-select]')) return;
        const input = event.target;
        const id = input.value;
        toggleESLSelection(id, input.checked);
        input.closest('.esl-card')?.classList.toggle('is-selected', input.checked);
    });
    eslGrid?.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-esl-print]');
        if (!btn) return;
        event.preventDefault();
        const id = btn.getAttribute('data-esl-print');
        const product = products.find(p => getESLId(p) === id);
        if (product) {
            printESLLabels([product]);
        }
    });
    bulkDeleteCancelBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        closeBulkDeletePopup();
    });
    bulkDeleteConfirmBtn?.addEventListener('click', handleBulkDeleteConfirm);
    bulkDeletePasswordInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            bulkDeleteConfirmBtn?.click();
        }
    });
    const expiryInputEl = document.getElementById('expiry-input');
    if (expiryRelativeSelect) {
        expiryRelativeSelect.addEventListener('change', () => {
            const code = expiryRelativeSelect.value;
            if (!code) return;
            const computed = computeExpiryDateFromRelative(code);
            if (computed && expiryInputEl) {
                expiryInputEl.value = toDateInputValue(computed);
            }
        });
    }
    expiryInputEl?.addEventListener('input', () => {
        if (expiryRelativeSelect) expiryRelativeSelect.value = '';
    });
    document.getElementById('create-warehouse-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        openWarehouseModal();
    });
    document.getElementById('close-warehouse-modal')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeWarehouseModal();
    });
    document.getElementById('cancel-warehouse-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeWarehouseModal();
    });
    document.getElementById('save-warehouse-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        saveWarehouse();
    });
    document.getElementById('transfer-stock-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        openTransferModal();
    });
    document.getElementById('transfer-close-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeTransferModal();
    });
    document.getElementById('transfer-cancel-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closeTransferModal();
    });
    transferProductSelect?.addEventListener('change', handleTransferProductChange);
    transferForm?.addEventListener('submit', handleTransferSubmit);
    transferQueueList?.addEventListener('click', handleTransferQueueClick);
    retryAllTransfersBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        await retryAllTransfers();
    });
    clearTransfersBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        clearTransferQueue();
    });
    clearTransferActivityBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        transferActivityLog = [];
        renderTransferActivity();
        showToast?.('Transfer activity log cleared.');
    });
    purchaseTableBody?.addEventListener('click', (event) => {
        const btn = event.target.closest('.purchase-action');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (!id) return;
        if (action === 'delete') {
            deletePurchaseById(id);
        } else if (action === 'view') {
            togglePurchaseDetailsRow(id);
        } else if (action === 'edit') {
            startPurchaseEdit(id);
        }
    });
    createPurchaseBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        openPurchaseModal();
    });
    emptyCreatePurchaseBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        openPurchaseModal();
    });
    refreshPurchasesBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        await loadPurchaseOrders();
        showToast?.('Purchase orders refreshed.');
    });
    purchaseAddItemBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        addPurchaseItem();
    });
    purchaseStatusSelect?.addEventListener('change', handlePurchaseStatusChange);
    purchaseAttachmentsInput?.addEventListener('change', handlePurchaseAttachmentChoose);
    purchaseAttachmentsList?.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'remove-pending') {
            removePendingPurchaseAttachment(btn.dataset.index);
        } else if (action === 'remove-existing') {
            deleteExistingPurchaseAttachment(btn.dataset.id);
        }
    });
    purchaseStatusFilter?.addEventListener('change', (event) => {
        purchaseFilterState.status = (event.target.value || 'all');
        applyPurchaseFilters();
    });
    purchaseWarehouseFilter?.addEventListener('change', (event) => {
        purchaseFilterState.warehouse = (event.target.value || 'all');
        applyPurchaseFilters();
    });
    purchaseSupplierFilter?.addEventListener('input', (event) => {
        purchaseFilterState.supplier = (event.target.value || '');
        applyPurchaseFilters();
    });
    purchaseFilterClearBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        purchaseFilterState.status = 'all';
        purchaseFilterState.warehouse = 'all';
        purchaseFilterState.supplier = '';
        if (purchaseStatusFilter) purchaseStatusFilter.value = 'all';
        if (purchaseWarehouseFilter) purchaseWarehouseFilter.value = 'all';
        if (purchaseSupplierFilter) purchaseSupplierFilter.value = '';
        applyPurchaseFilters();
    });
    purchaseSupplierExportBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        exportSupplierReport();
    });
    document.getElementById('save-purchase-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        handleSavePurchase();
    });
    document.getElementById('cancel-purchase-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        closePurchaseModal();
    });
    document.getElementById('close-purchase-modal')?.addEventListener('click', (event) => {
        event.preventDefault();
        closePurchaseModal();
    });
    purchaseForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSavePurchase();
    });
    handlePurchaseStatusChange();
    // Add product button
    document.getElementById('add-btn').addEventListener('click', () => {
        editIndex = -1;
        clearForm();
        addProductPopup.classList.add('active');
    });
    // Close popup buttons
    document.getElementById('close-popup').addEventListener('click', () => {
        addProductPopup.classList.remove('active');
    });
    document.getElementById('close-duplicate-popup').addEventListener('click', () => {
        duplicatePopup.classList.remove('active');
    });
    document.getElementById('cancel-button').addEventListener('click', () => {
        addProductPopup.classList.remove('active');
    });
    document.getElementById('cancel-duplicate').addEventListener('click', () => {
        duplicatePopup.classList.remove('active');
    });
    // Save product button
    document.getElementById('save-button').addEventListener('click', saveProduct);

    // Search button
    document.getElementById('search-button').addEventListener('click', searchProducts);

    // Search input (for live search)
    document.getElementById('search-input').addEventListener('input', searchProducts);

    // Duplicate products button
    document.getElementById('duplicate-btn').addEventListener('click', checkForDuplicates);

    // Confirm duplicate removal
    document.getElementById('confirm-duplicate').addEventListener('click', removeDuplicateEANs);

    inventoryHistoryBtn.addEventListener('click', showInventoryHistory);

    // Inventory filter buttons
    document.getElementById('inventory-allstock-btn').addEventListener('click', function () {
        resetInlineRowEdit();
        renderInventory(products, false, 'all');
        showToast("Showing all inventory items");
    });

    document.getElementById('inventory-lowstock-btn').addEventListener('click', function () {
        resetInlineRowEdit();
        const lowStockItems = getLowStockItems();
        renderInventory(lowStockItems, false, 'low-stock');
        showToast(`Showing ${lowStockItems.length} low stock items`);
    });

    document.getElementById('inventory-stockin-btn').addEventListener('click', function () {
        resetInlineRowEdit();
        const stockInItems = getStockInItems();
        renderInventory(stockInItems, false, 'stock-in');
        showToast(`Showing ${stockInItems.length} products with stock increases`);
    });

    document.getElementById('inventory-stockout-btn').addEventListener('click', function () {
        resetInlineRowEdit();
        const stockOutItems = getStockOutItems();
        renderInventory(stockOutItems, false, 'stock-out');
        showToast(`Showing ${stockOutItems.length} products with stock decreases`);
    });

    // Close history popups
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.pagination button');
        if (!btn || btn.disabled) return;
        const targetPage = parseInt(btn.dataset.page, 10);
        if (Number.isFinite(targetPage)) changePage(targetPage);
      });
      

    // Restock button
    document.getElementById('restock-btn').addEventListener('click', () => {
        resetInlineRowEdit();
        const restockedProducts = getRestockedItems();
        renderInventory(restockedProducts, false, 'restock');
        showToast(`Showing ${restockedProducts.length} restocked products`);
    });
    // csv import event listener 
    document.getElementById('import-csv-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = importProductsFromCSV;
        input.click();
    });

    // csv export event listener
    document.getElementById('export-csv-btn').addEventListener('click', exportProductsToCSV);

    bulkSelectBtn = document.getElementById('bulk-select-btn');
    bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    bulkSelectBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleBulkSelectionMode();
    });
    bulkDeleteBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        handleBulkDeleteClick();
    });
    updateBulkDeleteButtonState();
}
async function startApp() {
    if (appInitialized) return;
    appInitialized = true;
    initializeOnlineShopPanel({ lazyFetch: true });
    await loadProducts();
    renderShopButtons();
    await loadMetrics();
    await loadWarehouses();
    await loadPurchaseOrders();
    renderPurchaseAttachments();
    updateRestockBadgeFallback();
    await refreshDuplicateBadge();
    setupPrimaryTabs();
    setupEventListeners();
    initializeDashboardKPIDrilldown();
    renderDashboardCardCharts();
    populateCategoryFilter();
    renderESLLabels();
    const themeBtn = document.getElementById('theme-toggle');
    const sel = document.getElementById('items-per-page');
    if (sel) sel.value = String(itemsPerPage);
    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeBtn.querySelector('i');
        icon?.classList.toggle('fa-moon');
        icon?.classList.toggle('fa-sun');
    });
    startAutoRefresh();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await startApp();
});
(function autoQrOnTbodyChange() {
    const tbody = document.getElementById('inventory-body');
    if (!tbody) return;
    const mo = new MutationObserver(() => generateQRCodesFromExistingTable());
    mo.observe(tbody, { childList: true });
})();
(async () => {
    try {
        const r = await fetchWithShop(`${API_BASE}/health`, { method: 'GET', cache: 'no-store', mode: 'cors' });
        console.log('Health:', r.status, await r.json());
    } catch (e) {
        console.error('Health check failed:', e);
    }
})();


// Global variables for pagination and sorting
// Render inventory
function getLowStockItems() {
    const lowStockThreshold = 10;
    return products
        .filter(product => {
            const currentStock = product.amount || 0;
            const reorderLevel = product.reorderLevel || lowStockThreshold;
            return currentStock <= reorderLevel;
        })
        .sort((a, b) => (b.lastUpdated || b.createdAt || 0) - (a.lastUpdated || a.createdAt || 0));
}

function getStockInItems() {
    return products
        .filter(product => product.history?.some(item => item.newAmount > item.oldAmount))
        .sort((a, b) => (b.lastUpdated || b.createdAt || 0) - (a.lastUpdated || a.createdAt || 0));
}

function getStockOutItems() {
    return products
        .filter(product => product.history?.some(item => item.newAmount < item.oldAmount))
        .sort((a, b) => (b.lastUpdated || b.createdAt || 0) - (a.lastUpdated || a.createdAt || 0));
}

function getRestockedItems() {
    return products
        .filter(product =>
            product.isRestocked === true ||
            product.history?.some(h => (h.oldAmount || 0) === 0 && (h.newAmount || 0) > 0)
        )
        .sort((a, b) => (b.lastUpdated || b.createdAt || 0) - (a.lastUpdated || a.createdAt || 0));
}

function updateLocalCollections(updatedProduct) {
    products = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    _currentList = _currentList.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
}

async function rerenderAfterDataChange() {
    switch (_currentFilterType) {
        case 'low-stock':
            renderInventory(getLowStockItems(), false, 'low-stock');
            break;
        case 'stock-in':
            renderInventory(getStockInItems(), false, 'stock-in');
            break;
        case 'stock-out':
            renderInventory(getStockOutItems(), false, 'stock-out');
            break;
        case 'restock':
            renderInventory(getRestockedItems(), false, 'restock');
            break;
        case 'server-search':
        case 'search':
            await searchProducts();
            break;
        default:
            renderInventory(products, false, 'all');
    }
}

function getRowInputValue(row, field) {
    return (row.querySelector(`input[data-field="${field}"]`)?.value || '').trim();
}

function assertUniqueIdentifiers({ ean, plu }, ignoreId = null) {
    const targetEan = ean ? String(ean).trim() : '';
    const targetPlu = plu ? String(plu).trim() : '';
    const normalizeId = (value) => value == null ? '' : String(value);
    const skipId = normalizeId(ignoreId);

    if (targetEan) {
        const clash = products.find(p => {
            if (!p) return false;
            const pid = normalizeId(p.id || p._id);
            if (skipId && pid === skipId) return false;
            return String(p.ean ?? '').trim() === targetEan;
        });
        if (clash) throw new Error(`EAN ${targetEan} already exists for ${clash.name || 'another product'}.`);
    }

    if (targetPlu) {
        const clash = products.find(p => {
            if (!p) return false;
            const pid = normalizeId(p.id || p._id);
            if (skipId && pid === skipId) return false;
            return String(p.plu ?? '').trim() === targetPlu;
        });
        if (clash) throw new Error(`PLU ${targetPlu} already exists for ${clash.name || 'another product'}.`);
    }
}

function gatherInlineRowValues(row) {
    const ean = getRowInputValue(row, 'ean');
    const plu = getRowInputValue(row, 'plu');
    const name = getRowInputValue(row, 'name');
    const priceRaw = getRowInputValue(row, 'price');
    const promoRaw = getRowInputValue(row, 'promoPrice');
    const weightRaw = getRowInputValue(row, 'weight');
    const amountRaw = getRowInputValue(row, 'amount');
    const expiryRaw = getRowInputValue(row, 'expiryDate');
    const warehouseIdRaw = getRowInputValue(row, 'warehouseId');
    const categorySelect = row.querySelector('select[data-field="primaryCategory"]');
    const primaryCategory = categorySelect ? categorySelect.value.trim() : '';

    if (!ean && !plu) throw new Error('Provide at least an EAN or a PLU.');
    if (ean && !/^\d{8,13}$/.test(ean)) throw new Error('EAN must be 8-13 digits.');
    if (plu && !/^\d{1,3}$/.test(plu)) throw new Error('PLU must be 1-3 digits.');
    if (!name) throw new Error('Product name is required.');
    if (!primaryCategory) throw new Error('Category is required.');

    const price = Number.parseFloat(priceRaw.replace(',', '.'));
    if (!Number.isFinite(price) || price < 0) throw new Error('Price must be zero or greater.');

    const weight = weightRaw === '' ? 0 : Number.parseFloat(weightRaw.replace(',', '.'));
    if (!Number.isFinite(weight) || weight < 0) throw new Error('Weight must be zero or greater.');

    const amount = amountRaw === '' ? 0 : Number.parseInt(amountRaw, 10);
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Amount must be zero or greater.');

    let promoPrice = '';
    if (promoRaw !== '') {
        const promoVal = Number.parseFloat(promoRaw.replace(',', '.'));
        if (!Number.isFinite(promoVal) || promoVal < 0) throw new Error('Promo price must be zero or greater.');
        promoPrice = promoVal.toFixed(2);
    }

    const result = {
        ean,
        plu,
        name,
        primaryCategory,
        price: Number(price.toFixed(2)),
        weight: Number(weight.toFixed(3)),
        amount,
        expiryDate: expiryRaw || null,
        warehouseId: warehouseIdRaw || ''
    };
    if (promoRaw === '') {
        result.promoPrice = '';
    } else {
        result.promoPrice = promoPrice;
    }
    return result;
}

function focusFirstEditableInput(row) {
    requestAnimationFrame(() => {
        const input = row.querySelector('input[data-field="name"]') || row.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
    });
}

function buildEditableRow(product, changeIndicator) {
    const row = document.createElement('tr');
    row.className = 'expanded-row is-editing';
    row.dataset.id = product.id || '';
    const priceDisplay = (Number(product.price) || 0).toFixed(2);
    const promoDisplayRaw = toNumberMaybe(product.promoPrice, NaN);
    const promoDisplay = Number.isFinite(promoDisplayRaw) && promoDisplayRaw > 0
        ? promoDisplayRaw.toFixed(2)
        : '';
    const weightDisplay = product.weight ?? '';
    const amountDisplay = product.amount ?? 0;
    const costDisplay = Number.isFinite(Number(product.cost)) ? Number(product.cost).toFixed(2) : '—';
    const profitDisplay = formatProfit(profitPercent(product.price, product.cost));
    const statusDisplay = stockStatusBadge(product.amount);
    const currentCategory = product.primaryCategory || product.category || '';
    const categorySelect = `<select data-field="primaryCategory"><option value=""${currentCategory ? '' : ' selected'}>Select Category</option>${categorySelectOptions(currentCategory)}</select>`;
    const stockValue = formatCurrency(computeStockValue(product));
    const reorderChip = reorderStatusChip(product);
    const lastPurchaseTs = latestRestockTimestamp(product);
    const lastPurchaseText = lastPurchaseTs ? formatHistoryDate(lastPurchaseTs) : '—';
    const supplierText = escapeHtml(product.supplier || '—');
    const warehouseSelectHtml = warehouseSelectMarkup(product.warehouseId || product.warehouse || '');
    const expiryInputValue = toDateInputValue(product.expiryDate);
    row.innerHTML = `
    <td class="picture-cell">${renderProductImage(product)}</td>
    <td><input data-field="ean" inputmode="numeric" maxlength="13" pattern="\\d{8,13}" value="${escapeHtml(product.ean || '')}"></td>
    <td><input data-field="plu" inputmode="numeric" maxlength="3" pattern="\\d{1,3}" value="${escapeHtml(product.plu || '')}"></td>
    <td><input data-field="name" value="${escapeHtml(product.name || '')}"></td>
    <td class="price-edit-cell">
        <input data-field="price" type="number" step="0.01" min="0" value="${priceDisplay}">
        <input data-field="promoPrice" type="number" step="0.01" min="0" placeholder="Promo price" value="${promoDisplay}">
    </td>
    <td><input data-field="weight" type="number" step="0.01" min="0" value="${weightDisplay === '' ? '' : Number(weightDisplay)}"></td>
    <td>
        <input data-field="amount" type="number" step="1" min="0" value="${amountDisplay}">
        ${changeIndicator ? `<div class="row-change-indicator">${changeIndicator}</div>` : ''}
    </td>
    <td class="stock-value-cell">${stockValue}</td>
    <td class="reorder-status-cell">${reorderChip}</td>
    <td><div class="category-container">${categorySelect}</div></td>
    <td class="supplier-cell">${supplierText}</td>
    <td class="last-purchase-cell">${lastPurchaseText}</td>
    <td class="expiry-cell"><input data-field="expiryDate" type="date" value="${expiryInputValue}"></td>
    <td class="warehouse-cell"><select data-field="warehouseId">${warehouseSelectHtml}</select></td>
    <td class="edit-actions">
        <button type="button" class="btn-update" data-action="update"><i class="fas fa-save"></i> Update</button>
        <button type="button" class="btn-cancel" data-action="cancel">Cancel</button>
    </td>
    <td>${costDisplay}</td>
    <td>${profitDisplay}</td>
    <td>${statusDisplay}</td>
    <td class="qr-cell">—</td>
  `;
    return row;
}

function attachEditableRowHandlers(row, product) {
    const updateBtn = row.querySelector('[data-action="update"]');
    const cancelBtn = row.querySelector('[data-action="cancel"]');

    if (updateBtn) {
        updateBtn.addEventListener('click', () => handleInlineRowUpdate(row, product, updateBtn));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelInlineRowEdit);
    }
    row.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            cancelInlineRowEdit();
        } else if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault();
            updateBtn?.click();
        }
    });
}

function startInlineRowEdit(product) {
    if (!product) return;
    editingRowId = product.id;
    const baseList = (_currentFilterType === 'all' || !_currentList.length) ? products : [..._currentList];
    renderInventory(baseList, false, _currentFilterType);
}

function cancelInlineRowEdit() {
    if (editingRowId === null) return;
    resetInlineRowEdit();
    rerenderAfterDataChange();
}

async function handleInlineRowUpdate(row, product, updateBtn) {
    if (!product) return;
    try {
        const values = gatherInlineRowValues(row);
        assertUniqueIdentifiers(values, product.id);
    const warehouseName = getWarehouseDisplayName(values.warehouseId);
    const payload = {
        ...values,
        updatedBy: currentUser.email,
        category: values.primaryCategory,
        warehouseName,
        warehouse: warehouseName || values.warehouseId || '',
        shelfLifeCode: product.shelfLifeCode || ''
    };

        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.dataset.loading = '1';
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving';
        }

        const res = await fetchWithShop(`${API_BASE}/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        if (!res.ok) {
            let message = `Update failed (${res.status})`;
            try {
                const errJson = text ? JSON.parse(text) : null;
                if (errJson?.error) message = errJson.error;
            } catch {}
            throw new Error(message);
        }
        const saved = text ? JSON.parse(text) : {};
        const updatedProduct = normalizeProduct(saved);
        updatedProduct.plu = values.plu;
        rememberShelfLifeCode(updatedProduct, updatedProduct.shelfLifeCode || payload.shelfLifeCode || '');
        updateLocalCollections(updatedProduct);
        resetInlineRowEdit();
        await rerenderAfterDataChange();
        updateDashboard();
        updateNotificationBadges();
        updateRestockBadgeFallback();
        await refreshDuplicateBadge();
        await silentRefreshOnce?.();
        showToast('Product updated successfully.');
    } catch (err) {
        console.error('Inline update error:', err);
        showToast(err.message || 'Failed to update product');
        if (updateBtn) {
            updateBtn.disabled = false;
            delete updateBtn.dataset.loading;
            updateBtn.innerHTML = '<i class="fas fa-save"></i> Update';
        }
        return;
    }
}

function renderInventory(list = products, readOnly = false, filterType = 'all') {
    _currentList = Array.isArray(list) ? list : [];
    _currentFilterType = filterType;
    let sortedList = [..._currentList];

    if (selectedProductIds.size) {
        const existingIds = new Set(products.map(p => String(p.id || '')));
        selectedProductIds.forEach(id => {
            if (!existingIds.has(id)) selectedProductIds.delete(id);
        });
    }

    if (sortState.column) {
        sortedList.sort((a, b) => {
            let valA = a[sortState.column] || '';
            let valB = b[sortState.column] || '';
            if (sortState.column === 'price' || sortState.column === 'amount' || sortState.column === 'weight') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else if (sortState.column === 'expiryDate') {
                const toMs = (value) => {
                    if (!value) return 0;
                    const date = value instanceof Date ? value : new Date(value);
                    return Number.isFinite(date.getTime()) ? date.getTime() : 0;
                };
                valA = toMs(a.expiryDate);
                valB = toMs(b.expiryDate);
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
            }
            return sortState.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedList = sortedList.slice(start, end);
    const tbody = document.getElementById('inventory-body');
    if (!tbody) {
        console.error('Inventory table body not found');
        showToast('Error rendering inventory. Please refresh the page.');
        return;
    }
    tbody.innerHTML = '';

    const filterIndicator = document.getElementById('filter-indicator');
    if (filterIndicator) {
        filterIndicator.textContent = filterType === 'all' ? '' : `(Filtered by: ${filterType.replace('-', ' ')})`;
    }

    paginatedList.forEach(product => {
        const rowClasses = ['expanded-row'];
        if (filterType === 'low-stock') rowClasses.push('low-stock-row');
        else if (filterType === 'stock-in') rowClasses.push('stock-in-row');
        else if (filterType === 'stock-out') rowClasses.push('stock-out-row');
        else if (filterType === 'restock') rowClasses.push('restock-row');

        let changeIndicator = '';
        if (product.lastChangeTime) {
            const changeClass = product.lastChange > 0 ? 'stock-increase' :
                product.lastChange < 0 ? 'stock-decrease' : 'stock-nochange';
            const changeSymbol = product.lastChange > 0 ? '↑' :
                product.lastChange < 0 ? '↓' : '→';
            changeIndicator = `<span class="stock-change ${changeClass}">${changeSymbol} ${product.lastChangeTime}</span>`;
        }

        const { hasPromo, promoPrice } = computeESLPricing(product);
        const priceStackClass = hasPromo ? 'price-stack is-promo' : 'price-stack';
        const priceCellMarkup = hasPromo
            ? `<div class="${priceStackClass}"><span class="price-main">${formatCurrency(product.price)}</span><span class="price-promo">${formatCurrency(promoPrice)}</span></div>`
            : `<div class="${priceStackClass}"><span class="price-main">${formatCurrency(product.price)}</span></div>`;

        const safePrimary = escapeHtml(product.primaryCategory || product.category || '');
        let categoryDisplay = '';
        if (safePrimary) {
            categoryDisplay = `<span class="category-primary">${safePrimary}</span>`;
        } else {
            categoryDisplay = '<span class="category-primary">—</span>';
        }

        if (product.id === editingRowId) {
            const editRow = buildEditableRow(product, changeIndicator);
            editRow.className = rowClasses.concat('is-editing').join(' ');
            tbody.appendChild(editRow);
            attachEditableRowHandlers(editRow, product);
            focusFirstEditableInput(editRow);
            return;
        }

        const stockValueText = formatCurrency(computeStockValue(product));
        const reorderChip = reorderStatusChip(product);
        const supplierText = escapeHtml(product.supplier || '—');
        const lastPurchaseTs = latestRestockTimestamp(product);
        const lastPurchaseText = lastPurchaseTs ? formatHistoryDate(lastPurchaseTs) : '—';
        const expiryDisplay = product.shelfLifeCode || computeRelativeExpiryValue(product) || '—';
        const warehouseName = getWarehouseDisplayName(product.warehouseId || product.warehouse);
        const nameCell = `${escapeHtml(product.name || '')} ${filterType !== 'all' ? `<span class="filter-indicator">${getFilterIndicator(product, filterType)}</span>` : ''}`;
        const weightText = (product.weight !== undefined && product.weight !== null && product.weight !== '')
            ? formatNumber(product.weight, 3)
            : '—';

        const row = document.createElement('tr');
        row.className = rowClasses.join(' ');
        const productId = String(product.id || '');
        row.dataset.id = productId;
        row.innerHTML = `
  <td class="picture-cell">${renderProductImage(product)}</td>
  <td class="ean-cell">${escapeHtml(product.ean || '')}</td>
  <td class="plu-cell">${escapeHtml(product.plu || '')}</td>
  <td>${nameCell}</td>
  <td class="price-cell">${priceCellMarkup}</td>
  <td>${weightText}</td>
  <td>
      <div class="stock-controls">
          <button onclick="changeAmountById('${product.id}', -1)">-</button>
          <input id="amount-${product.id}" value="${product.amount || 0}">
          <button onclick="changeAmountById('${product.id}', 1)">+</button>
          <button id="done-${product.id}" data-id="${product.id}" style="display:none;">Save</button>
          <div class="notification-container">
              <button class="notification-btn" onclick="toggleHistoryPopup('${product.id}', event)">
                  <i class="fas fa-history"></i>
                  <span class="notification-badge">${product.history?.length || 0}</span>
              </button>
          </div>
          ${changeIndicator}
      </div>
  </td>
  <td class="stock-value-cell">${stockValueText}</td>
  <td class="reorder-status-cell">${reorderChip}</td>
  <td><div class="category-container">${categoryDisplay}</div></td>
  <td class="supplier-cell">${supplierText}</td>
  <td class="last-purchase-cell">${lastPurchaseText}</td>
  <td class="expiry-cell">${expiryDisplay}</td>
  <td class="warehouse-cell">${escapeHtml(warehouseName)}</td>
  <td>
      <button onclick="openTransferModalForProduct('${escapeHtml(productId)}')" title="Transfer stock"><i class="fas fa-exchange-alt"></i></button>
      <button onclick="editDetailsById('${product.id}')"><i class="fas fa-edit"></i></button>
      <button onclick="deleteProductById('${product.id}')"><i class="fas fa-trash"></i></button>
  </td>

  <!-- NEW: Cost Price -->
  <td>${formatCurrency(product.cost)}</td>

  <!-- NEW: Profit % = (price - cost) / price -->
  <td>${formatProfit(
            profitPercent(product.price, product.cost)
        )
            }</td>

  <!-- NEW: Stock Status badge -->
  <td>${stockStatusBadge(product.amount)}</td>

  <!-- NEW: Barcode (auto from EAN) -->
  <td class="qr-cell">${product.ean ? `<div class="qr" data-ean="${String(product.ean).trim()}"></div>` : '—'}</td>

`;


        const detailsRow = document.createElement('tr');
        detailsRow.className = 'expanded-details';
        detailsRow.innerHTML = `
            <td colspan="7">
                <div>
                    ${product.sku ? `<strong>SKU:</strong> ${escapeHtml(product.sku)}<br>` : ''}
                    ${product.brand ? `<strong>Brand:</strong> ${escapeHtml(product.brand)}<br>` : ''}
                    ${product.shortDesc ? `<strong>Short Description:</strong> ${escapeHtml(product.shortDesc)}<br>` : ''}
                    ${product.longDesc ? `<strong>Long Description:</strong> ${escapeHtml(product.longDesc)}<br>` : ''}
                    ${product.promoPrice ? `<strong>Promotional Price:</strong> ${escapeHtml(product.promoPrice)}<br>` : ''}
                    ${product.taxClass ? `<strong>Tax Class:</strong> ${escapeHtml(String(product.taxClass))}%<br>` : ''}
                    ${product.dimensions ? `<strong>Dimensions:</strong> ${escapeHtml(product.dimensions)}<br>` : ''}
                    ${(product.warehouseId || product.warehouse) ? `<strong>Warehouse:</strong> ${escapeHtml(warehouseName)}<br>` : ''}
                    ${Number.isFinite(Number(product.reorderLevel)) ? `<strong>Reorder Level:</strong> ${formatNumber(product.reorderLevel, 0)}<br>` : ''}
                    ${product.supplier ? `<strong>Supplier:</strong> ${escapeHtml(product.supplier)}<br>` : ''}
                    ${product.country ? `<strong>Country of Origin:</strong> ${escapeHtml(product.country)}<br>` : ''}
                    ${product.metaTitle ? `<strong>Meta Title:</strong> ${escapeHtml(product.metaTitle)}<br>` : ''}
                    ${product.metaDesc ? `<strong>Meta Description:</strong> ${escapeHtml(product.metaDesc)}<br>` : ''}
                    ${product.visibility ? `<strong>Visibility Status:</strong> ${escapeHtml(product.visibility)}<br>` : ''}
                </div>
            </td>
        `;

        tbody.appendChild(row);
        tbody.appendChild(detailsRow);
        // NEW: make the details row span all visible columns
        const headCols = document.querySelectorAll('#inventory-table thead th').length;
        detailsRow.querySelector('td').colSpan = headCols;

        if (bulkSelectionMode && selectedProductIds.has(productId)) {
            row.classList.add('is-selected');
            detailsRow.classList.add('is-selected');
        }

        // Add click event for row expansion
        row.addEventListener('click', (e) => {
            if (bulkSelectionMode) {
                if (e.target.closest('button, input, select, textarea, a')) return;
                e.preventDefault();
                toggleRowSelection(productId);
                return;
            }
            if (editingRowId !== null) return;
            e.preventDefault();
            if (e.detail > 1) return;
            const isActionButton = e.target.closest('button');
            if (isActionButton) return; // Ignore clicks on action buttons
            if (e.target.closest('input[type="checkbox"]')) return;
            const isExpanded = row.classList.contains('active');
            document.querySelectorAll('.expanded-row').forEach(r => r.classList.remove('active'));
            const nextDetailRow = row.nextElementSibling;
            if (nextDetailRow && nextDetailRow.classList.contains('expanded-details')) {
                if (!isExpanded) {
                    row.classList.add('active');
                } else {
                    row.classList.remove('active');
                }
            }
        });
        detailsRow.addEventListener('click', (e) => {
            if (!bulkSelectionMode) return;
            if (e.target.closest('button, input, select, textarea, a')) return;
            e.preventDefault();
            toggleRowSelection(productId);
        });
        row.addEventListener('dblclick', (e) => {
            if (bulkSelectionMode) return;
            if (e.target.closest('button') || e.target.closest('.stock-controls') || e.target.closest('.notification-btn')) return;
            if (e.target.closest('input[type="checkbox"]')) return;
            e.preventDefault();
            e.stopPropagation();
            startInlineRowEdit(product);
        });
    });
    populateTransferProductOptions(products);
    refreshBulkSelectionHighlights();

    renderPaginationControls(sortedList.length);
    updateSortIndicator();
    generateQRCodesFromExistingTable();
    renderESLLabels();
}
function renderQRCodeHolders(holders, size = 84) {
    if (!window.QRCode) return;
    Array.from(holders || []).forEach(holder => {
        if (!holder) return;
        const qrText = holder.getAttribute('data-qr') || holder.getAttribute('data-ean');
        if (!qrText) return;
        if (holder.dataset.rendered === '1' && holder.childElementCount) return;
        holder.innerHTML = '';
        try {
            new QRCode(holder, {
                text: qrText,
                width: size,
                height: size,
                correctLevel: QRCode.CorrectLevel.M
            });
            holder.dataset.rendered = '1';
        } catch (err) {
            console.error('QR code render failed:', err);
        }
    });
}

function generateQRCodesFromExistingTable() {
    const table = document.getElementById('inventory-table');
    const tbody = document.getElementById('inventory-body');
    if (!table || !tbody) return;

    const ths = table.querySelectorAll('thead th');
    const eanIdx = [...ths].findIndex(th => (th.dataset.column || '').toLowerCase() === 'ean');
    const holders = [];

    for (const tr of tbody.rows) {
        const holder = tr.querySelector('td.qr-cell .qr');
        if (!holder) continue;
        let qrText = holder.getAttribute('data-qr') || holder.getAttribute('data-ean') || '';
        if (!qrText && eanIdx >= 0 && tr.cells[eanIdx]) {
            qrText = (tr.cells[eanIdx].textContent || '').trim();
        }
        if (!qrText) continue;
        holder.setAttribute('data-qr', qrText);
        holder.dataset.rendered = '';
        holders.push(holder);
    }
    if (holders.length) renderQRCodeHolders(holders, 84);
}

function renderESLQRCodes(root = eslGrid, size = 84) {
    if (!root) return;
    const nodes = root.querySelectorAll('[data-qr]');
    if (!nodes.length) return;
    renderQRCodeHolders(nodes, size);
}

const EAN_ENCODINGS = {
    L: ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],
    G: ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],
    R: ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
};

const EAN13_PARITY = {
    '0': 'LLLLLL', '1': 'LLGLGG', '2': 'LLGGLG', '3': 'LLGGGL', '4': 'LGLLGG',
    '5': 'LGGLLG', '6': 'LGGGLL', '7': 'LGLGLG', '8': 'LGLGGL', '9': 'LGGLGL'
};

function computeEANChecksum(value) {
    let sum = 0;
    for (let i = value.length - 1, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) {
        sum += Number(value[i]) * weight;
    }
    return (10 - (sum % 10)) % 10;
}

function encodeEAN(value) {
    const digitsOnly = String(value || '').replace(/\D/g, '');
    if (!digitsOnly) return null;

    if (digitsOnly.length === 12 || digitsOnly.length === 13) {
        const base = digitsOnly.slice(0, 12);
        const check = computeEANChecksum(base);
        const full = base + check;
        const digits = digitsOnly.length === 13 ? digitsOnly : full;
        return buildEAN13Bits(digits);
    }

    if (digitsOnly.length === 7 || digitsOnly.length === 8) {
        const base = digitsOnly.slice(0, 7);
        const check = computeEANChecksum(base);
        const full = base + check;
        const digits = digitsOnly.length === 8 ? digitsOnly : full;
        return buildEAN8Bits(digits);
    }

    return null;
}

function buildEAN13Bits(digits) {
    if (digits.length !== 13) return null;
    const parity = EAN13_PARITY[digits[0]];
    if (!parity) return null;

    let bits = '101';
    for (let i = 1; i <= 6; i++) {
        const encoding = parity[i - 1];
        bits += EAN_ENCODINGS[encoding][Number(digits[i])];
    }
    bits += '01010';
    for (let i = 7; i < 13; i++) bits += EAN_ENCODINGS.R[Number(digits[i])];
    bits += '101';
    return { bits, digits };
}

function buildEAN8Bits(digits) {
    if (digits.length !== 8) return null;
    let bits = '101';
    for (let i = 0; i < 4; i++) bits += EAN_ENCODINGS.L[Number(digits[i])];
    bits += '01010';
    for (let i = 4; i < 8; i++) bits += EAN_ENCODINGS.R[Number(digits[i])];
    bits += '101';
    return { bits, digits };
}

function renderEANBarcodes(root = document, pixelHeight = 52) {
    if (!root) return;
    const svgs = root.querySelectorAll('.esl-barcode-svg[data-ean]');
    svgs.forEach(svg => {
        const value = (svg.getAttribute('data-ean') || '').trim();
        if (!value) {
            svg.innerHTML = '';
            return;
        }
        const encoded = encodeEAN(value);
        if (!encoded) {
            svg.innerHTML = '';
            return;
        }

        const { bits } = encoded;
        const modules = bits.length;
        const height = Math.max(10, pixelHeight);

        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${modules} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        for (let i = 0; i < modules; i++) {
            if (bits[i] === '1') {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', String(i));
                rect.setAttribute('y', '0');
                rect.setAttribute('width', '1');
                rect.setAttribute('height', String(height));
                rect.setAttribute('fill', '#0f172a');
                svg.appendChild(rect);
            }
        }
    });
}
// Helper to get current filter type
function getCurrentFilterType() {
    const filterText = document.getElementById('filter-indicator').textContent;
    return filterText.match(/Filtered by: ([\w\s-]+)/)?.[1].replace(' ', '-') || 'all';
}
function renderPaginationControls(totalItems) {
    const existing = document.querySelector('.pagination');
    if (existing) existing.remove();
    const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const wrap = document.createElement('div');
    wrap.className = 'pagination';
    // Previous
    const prev = document.createElement('button');
    prev.textContent = '← Previous';
    prev.disabled = currentPage === 1;
    prev.onclick = () => changePage(currentPage - 1);
    wrap.appendChild(prev);
    // Windowed page numbers (max 10)
    const windowPages = getWindowedPages(currentPage, pageCount, 10);
    windowPages.forEach(p => {
        const btn = document.createElement('button');
        btn.textContent = String(p);
        if (p === currentPage) btn.classList.add('active');
        btn.onclick = () => changePage(p);
        wrap.appendChild(btn);
    });

    // Next
    const next = document.createElement('button');
    next.textContent = 'Next →';
    next.disabled = currentPage === pageCount;
    next.onclick = () => changePage(currentPage + 1);
    wrap.appendChild(next);

    document.querySelector('.inventory-table-container').appendChild(wrap);
}


// Helper function for filter indicators
function getFilterIndicator(product, filterType) {
    switch (filterType) {
        case 'low-stock':
            const threshold = product.reorderLevel || 10;
            return `(Low stock: ${product.amount || 0}/${threshold})`;
        case 'stock-in':
            const lastIncrease = product.history?.slice().reverse().find(h => h.newAmount > h.oldAmount);
            return lastIncrease ? `(+${lastIncrease.newAmount - lastIncrease.oldAmount} on ${formatHistoryDate(lastIncrease.timestamp || lastIncrease.changedAt)})` : '';
        case 'stock-out':
            const lastDecrease = product.history?.slice().reverse().find(h => h.newAmount < h.oldAmount);
            return lastDecrease ? `(${lastDecrease.newAmount - lastDecrease.oldAmount} on ${formatHistoryDate(lastDecrease.timestamp || lastDecrease.changedAt)})` : '';
        case 'restock':
            return `(Restocked on ${formatHistoryDate(product.lastUpdated)})`;
        default:
            return '';
    }
}
// Update dashboard stats
async function updateDashboard() {
    try {
        await loadMetrics();
        updateRestockBadgeFallback();
        renderDashboardCardCharts();
        if (dashboardKPIState.activeKPI) {
            rebuildDashboardCache();
            renderKPIDetailView(dashboardKPIState.activeKPI, dashboardKPIState.activeTab, 'panel');
            renderKPIDetailView(dashboardKPIState.activeKPI, dashboardKPIState.activeTab, 'subview');
        }
    } catch (e) {
        console.error(e);
    }
}
// Clear the add/edit form
function clearForm() {
    document.getElementById('ean-input').value = '';
    document.getElementById('plu-input').value = '';
    document.getElementById('name-input').value = '';
    document.getElementById('price-input').value = '';
    document.getElementById('cost-input').value = '';
    document.getElementById('weight-input').value = '';
    document.getElementById('amount-input').value = '';
    document.getElementById('primary-category-input').value = '';
    updateSecondaryCategories();
    const secondaryCategoryField = document.getElementById('secondary-category-input');
    if (secondaryCategoryField) secondaryCategoryField.value = '';
    document.getElementById('reorder-input').value = '';
    const expiryField = document.getElementById('expiry-input');
    if (expiryField) expiryField.value = '';
    if (expiryRelativeSelect) expiryRelativeSelect.value = '';
    if (warehouseSelect) warehouseSelect.value = '';
    const reorderPreset = document.getElementById('reorder-level-input');
    if (reorderPreset) reorderPreset.value = '';
}

// Save product (add or update)
async function saveProduct() {
    try {
        const ean = document.getElementById('ean-input').value.trim();
        const plu = document.getElementById('plu-input').value.trim();
        const name = document.getElementById('name-input').value.trim();
        const price = parseFloat(document.getElementById('price-input').value) || 0;
        const cost = parseFloat(document.getElementById('cost-input').value) || 0;
        const weight = parseFloat(document.getElementById('weight-input').value) || 0;
        const amount = parseInt(document.getElementById('amount-input').value) || 0;
        const primaryCategory = document.getElementById('primary-category-input').value.trim();
        const secondaryCategory = document.getElementById('secondary-category-input')?.value.trim() || '';
        const reorderLevel = parseInt(document.getElementById('reorder-input').value) || 10;
        const sku = document.getElementById('sku-input').value.trim();
        const brand = document.getElementById('brand-input').value.trim();
        const shortDesc = document.getElementById('short-desc-input').value.trim();
        const longDesc = document.getElementById('long-desc-input').value.trim();
        const promoPrice = document.getElementById('promo-price-input').value.trim();
        const taxClass = parseFloat(document.getElementById('tax-class-input').value) || undefined;
        const dimensions = document.getElementById('dimensions-input').value.trim();
        const supplier = document.getElementById('supplier-input').value.trim();
        const country = document.getElementById('country-input').value;
        const metaTitle = document.getElementById('meta-title-input').value.trim();
        const metaDesc = document.getElementById('meta-desc-input').value.trim();
        const visibility = document.getElementById('visibility-input').value;
        const expiryDateInput = (document.getElementById('expiry-input')?.value || '').trim();
        const expiryRelative = expiryRelativeSelect?.value || '';
        let expiryDate = expiryDateInput;
        if (expiryRelative) {
            const computedExpiry = computeExpiryDateFromRelative(expiryRelative);
            if (computedExpiry) {
                expiryDate = toDateInputValue(computedExpiry);
            }
        }
        const warehouseId = warehouseSelect?.value || '';
        const warehouseName = warehouseId ? getWarehouseDisplayName(warehouseId) : '';

        // validations
        if (!name) throw new Error('Product name is required.');
        if (name.length > 100) throw new Error('Product name must be 100 characters or less.');
        if (price < 0) throw new Error('Selling price cannot be negative.');
        if (amount < 0) throw new Error('Initial stock cannot be negative.');
        if (!ean && !plu) throw new Error('Provide at least an EAN or a PLU.');
        if (ean && !/^\d{8,13}$/.test(ean)) throw new Error('EAN must be 8-13 digits.');
        if (plu && !/^\d{1,3}$/.test(plu)) throw new Error('PLU must be 1-3 digits.');
        if (!primaryCategory) throw new Error('Category is required.');
        const currentId = editIndex > -1 && products[editIndex]?.id ? products[editIndex].id : null;
        assertUniqueIdentifiers({ ean, plu }, currentId);

        const body = {
            ean, plu, name, price, cost, weight, amount,
            primaryCategory,
            secondaryCategory,
            category: secondaryCategory || primaryCategory,
            reorderLevel, sku, brand, shortDesc, longDesc,
            promoPrice, taxClass, dimensions, supplier, country,
            metaTitle, metaDesc, visibility,
            expiryDate: expiryDate || undefined,
            shelfLifeCode: expiryRelative || undefined,
            warehouseId: warehouseId || undefined,
            warehouseName: warehouseName || undefined,
            warehouse: (warehouseName || warehouseId || '').trim() || undefined,
            createdBy: currentUser.email, updatedBy: currentUser.email
        };

        let res;
        const now = Date.now();
        const fallbackLocal = () => {
            const localProduct = normalizeProduct({
                ...body,
                id: currentId || `local-${now}`,
                createdAt: now,
                lastUpdated: now
            });
            if (editIndex > -1) {
                products[editIndex] = localProduct;
            } else {
                products.unshift(localProduct);
                serverTotalProducts = Number(serverTotalProducts || 0) + 1;
            }
            renderInventory(products);
            addProductPopup.classList.remove('active');
            updateDashboard();
            updateNotificationBadges();
            updateRestockBadgeFallback();
            refreshPurchaseProductOptions();
            refreshDuplicateBadge();
            showToast(editIndex > -1 ? 'Product updated locally (server unavailable)' : 'Product saved locally (server unavailable)');
            editIndex = -1;
        };
        if (editIndex > -1 && products[editIndex]?.id) {
            // UPDATE
            const id = products[editIndex].id;
            try {
                res = await fetchWithShop(`${API_BASE}/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (err) {
                console.warn('Update failed, using local fallback:', err);
                fallbackLocal();
                return;
            }
        } else {
            // CREATE
            try {
                res = await fetchWithShop(`${API_BASE}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (err) {
                console.warn('Create failed, using local fallback:', err);
                fallbackLocal();
                return;
            }
        }
        if (!res.ok) {
            if (res.status === 401 || res.status === 403 || res.status === 503) {
                console.warn(`Server rejected save (${res.status}); storing locally.`);
                fallbackLocal();
                return;
            }
            throw new Error(`Save failed: ${res.status}`);
        }
        const saved = await res.json();
        const normalized = normalizeProduct(saved);
        normalized.plu = plu;
        normalized.primaryCategory = primaryCategory;
        normalized.secondaryCategory = secondaryCategory;
        normalized.category = secondaryCategory || primaryCategory || normalized.category;
        normalized.shelfLifeCode = body.shelfLifeCode || normalized.shelfLifeCode || '';
        if (!normalized.expiryDate && expiryDate) {
            const fallbackExpiry = new Date(expiryDate);
            if (Number.isFinite(fallbackExpiry.getTime())) {
                normalized.expiryDate = fallbackExpiry;
            }
        }
        normalized.warehouseId = body.warehouseId || normalized.warehouseId || '';
        normalized.warehouseName = body.warehouseName || normalized.warehouseName || getWarehouseDisplayName(normalized.warehouseId);
        rememberShelfLifeCode(normalized, normalized.shelfLifeCode);
        if (editIndex > -1) {
            // update local row
            products[editIndex] = normalized;
        } else {
            // add to top and bump total
            products.unshift(normalized);
            serverTotalProducts = Number(serverTotalProducts || 0) + 1;
        }

        const pictureCtx = window.__pictureUploadContext;
        if (pictureCtx?.hasPending?.()) {
            const targetEan = normalized.ean || ean;
            if (targetEan) {
                try {
                    const uploadedUrl = await pictureCtx.uploadForEAN(targetEan);
                    if (uploadedUrl) {
                        normalized.pictureUrl = uploadedUrl;
                        if (editIndex > -1) {
                            products[editIndex].pictureUrl = uploadedUrl;
                        } else if (products.length) {
                            products[0].pictureUrl = uploadedUrl;
                        }
                    }
                } catch (err) {
                    console.warn('Deferred picture upload failed:', err);
                } finally {
                    pictureCtx.clearPending?.();
                    pictureCtx.refreshInventoryPictures?.();
                }
            } else {
                pictureCtx.clearPending?.();
            }
        }

        renderInventory(products);
        addProductPopup.classList.remove('active');
        updateDashboard();
        updateNotificationBadges();
        updateRestockBadgeFallback();

        silentRefreshOnce?.();
        showToast(editIndex > -1 ? 'Product updated!' : 'Product added!');
        editIndex = -1;
    } catch (error) {
        console.error('Save error:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showToast(error.message);
        }
    }
}

// Edit product details
function editDetailsById(id) {
    //++new
    const expiryEl = document.getElementById('expiry-input'); // NEW
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (expiryEl) {
        // Expecting ISO date; if server stored full ISO, slice to yyyy-mm-dd for <input type="date">
        const iso = product.expiryDate ? new Date(product.expiryDate).toISOString().slice(0, 10) : '';
        expiryEl.value = iso;
    }
    if (expiryRelativeSelect) {
        const preferredCode = product.shelfLifeCode || computeRelativeExpiryValue(product) || '';
        if (preferredCode && SHELF_LIFE_OPTIONS.includes(preferredCode)) {
            expiryRelativeSelect.value = preferredCode;
        } else {
            expiryRelativeSelect.value = '';
        }
    }


    editIndex = products.findIndex(p => p.id === id);

    document.getElementById('ean-input').value = product.ean || '';
    document.getElementById('plu-input').value = product.plu || '';
    document.getElementById('name-input').value = product.name || '';
    document.getElementById('price-input').value = product.price || '';
    document.getElementById('cost-input').value = product.cost || '';
    document.getElementById('weight-input').value = product.weight || '';
    document.getElementById('amount-input').value = product.amount || '';
    document.getElementById('primary-category-input').value = product.primaryCategory || '';
    updateSecondaryCategories();
    const secondaryField = document.getElementById('secondary-category-input');
    if (secondaryField) secondaryField.value = product.secondaryCategory || '';
    document.getElementById('reorder-input').value = product.reorderLevel || '';
    document.getElementById('sku-input').value = product.sku || '';
    document.getElementById('brand-input').value = product.brand || '';
    document.getElementById('short-desc-input').value = product.shortDesc || '';
    document.getElementById('long-desc-input').value = product.longDesc || '';
    document.getElementById('promo-price-input').value = product.promoPrice || '';
    document.getElementById('tax-class-input').value = product.taxClass || '';
    document.getElementById('dimensions-input').value = product.dimensions || '';
    if (warehouseSelect) {
        const targetValue = product.warehouseId || product.warehouse || '';
        warehouseSelect.value = targetValue;
        if (targetValue && warehouseSelect.value !== targetValue) {
            const opt = document.createElement('option');
            opt.value = targetValue;
            opt.textContent = getWarehouseDisplayName(targetValue) || targetValue;
            warehouseSelect.appendChild(opt);
            warehouseSelect.value = targetValue;
        }
    }
    document.getElementById('reorder-level-input').value = product.reorderLevel || '';
    document.getElementById('supplier-input').value = product.supplier || '';
    document.getElementById('country-input').value = product.country || '';
    document.getElementById('meta-title-input').value = product.metaTitle || '';
    document.getElementById('meta-desc-input').value = product.metaDesc || '';
    document.getElementById('visibility-input').value = product.visibility || '';

    addProductPopup.classList.add('active');
}

function openTransferModalForProduct(id) {
    const targetId = id ? String(id) : '';
    const product = products.find(p => String(p.id || '') === targetId);
    openTransferModal({
        productId: product ? String(product.id) : '',
        source: product?.warehouseId || product?.warehouse || ''
    });
}

// Delete product
let productToDelete = null;

function showDeleteConfirmation(product) {
    productToDelete = product;
    document.getElementById('product-to-delete-name').textContent = product.name || 'this product';
    document.getElementById('delete-confirm-popup').classList.add('active');

    // Set up delete button with a proper function
    const deleteBtn = document.getElementById('confirm-delete-btn');

    deleteBtn.onclick = async function () {
        try {
            const res = await fetchWithShop(`${API_BASE}/products/${productToDelete.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            products = products.filter(p => p.id !== productToDelete.id);
            renderInventory(products);
            updateDashboard();
            updateNotificationBadges();
            updateRestockBadgeFallback();
            refreshPurchaseProductOptions();
            await refreshDuplicateBadge();

            showToast("Product deleted successfully!");
            closeDeletePopup();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting product: " + error.message);
        }
    };
}

function closeDeletePopup() {
    productToDelete = null;
    document.getElementById('delete-confirm-popup').classList.remove('active');
}

async function deleteProductById(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    showDeleteConfirmation(product);
}

// Change stock amount
function changeAmountById(id, delta) {
    const input = document.getElementById(`amount-${id}`);
    if (!input) {
        console.error(`Input field for ID ${id} not found`);
        showToast("Error: Unable to update stock. Please refresh and try again.");
        return;
    }

    let current = parseInt(input.value) || 0;
    current = Math.max(0, current + delta);
    input.value = current;

    const doneBtn = document.getElementById(`done-${id}`);
    if (doneBtn) doneBtn.style.display = 'inline-block';
    updateStatusCellFromInput(id, current);

}
//++++new added 
function updateStatusCellFromInput(id, newAmount) {
    const table = document.getElementById('inventory-table');
    const tbody = document.getElementById('inventory-body');
    if (!table || !tbody) return;

    const ths = table.querySelectorAll('thead th');
    const statusIdx = [...ths].findIndex(th => (th.dataset.column || '').toLowerCase() === 'status');
    if (statusIdx < 0) return;

    // find the row that contains this input
    const row = [...tbody.querySelectorAll('tr.expanded-row')]
        .find(tr => tr.querySelector(`#amount-${escapeSelector(id)}`));
    if (!row) return;

    row.cells[statusIdx].innerHTML = stockStatusBadge(newAmount);
}
document.querySelector('#reason-popup .popup-close')?.addEventListener('click', closeReasonPopup);
document.querySelector('#reason-popup .btn-cancel')?.addEventListener('click', closeReasonPopup);
document.getElementById('confirm-reason-btn')?.addEventListener('click', saveStockWithReason);




// Stock adjustment (kept as is)
let currentStockAdjustment = {
    productId: null,
    newAmount: null,
    oldAmount: null,
    productName: null
  };

  document.getElementById('inventory-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[id^="done-"], button[data-id]');
    if (!btn) return;
    e.stopPropagation();
    const id = btn.dataset.id || btn.id.replace(/^done-/, '');
    saveStockById(id);
  });
  
  
  document.addEventListener('DOMContentLoaded', () => {
    const rp = document.getElementById('reason-popup');
    if (!rp) return;
    rp.querySelector('.popup-close')?.addEventListener('click', closeReasonPopup);
    rp.querySelector('.btn-cancel')?.addEventListener('click', closeReasonPopup);
    rp.querySelector('#confirm-reason-btn')?.addEventListener('click', saveStockWithReason);
  });
  
  function showReasonPopup(product, newAmt, oldAmt) {
    const modal = document.getElementById('reason-popup');
    if (!modal) { console.error('reason-popup not in DOM'); showToast('Reason popup missing in page.'); return; }
  
    currentStockAdjustment = { productId: product.id, newAmount: newAmt, oldAmount: oldAmt, productName: product.name };
  
    // Reset notes (scoped to modal)
    const notesEl = modal.querySelector('#reason-notes');
    if (notesEl) notesEl.value = '';
  
    // Prefer "damage"; otherwise pick the first radio if it exists
    modal.querySelectorAll('input[name="adjustment-reason"]').forEach(cb => {
      cb.checked = false;
    });

    modal.classList.add('active');
  }

  function closeReasonPopup() {
    const modal = document.getElementById('reason-popup');
    if (!modal) return;
  
    modal.querySelectorAll('input[name="adjustment-reason"]').forEach(cb => {
      cb.checked = false;
    });
    const notesEl = modal.querySelector('#reason-notes');
    if (notesEl) notesEl.value = '';
  
    modal.classList.remove('active');
    currentStockAdjustment = { productId: null, newAmount: null, oldAmount: null, productName: null };
  }

// Update saveStockById
function saveStockById(id) {
    const input = document.getElementById(`amount-${id}`);
    if (!input) { console.error(`Input field for ID ${id} not found in DOM`); showToast("Error: Unable to find stock input. Please refresh and try again."); return; }
  
    const nextAmount = parseInt(input.value, 10) || 0;      // ← renamed
    const product = products.find(p => p.id === id);
    if (!product) { console.error(`Product with ID ${id} not found in products array`); showToast("Error: Product not found. Please try again."); return; }
  
    const oldAmount = product.amount || 0;
  
    if (nextAmount === oldAmount) {
      const doneBtn = document.getElementById(`done-${id}`);
      if (doneBtn) doneBtn.style.display = 'none';
      return;
    }
  
    showReasonPopup(product, nextAmount, oldAmount);         // ← renamed
  }
  
// Save stock with reason
async function saveStockWithReason() {
    try {
      const modal = document.getElementById('reason-popup');
      const selectedReasons = modal ? [...modal.querySelectorAll('input[name="adjustment-reason"]:checked')] : [];
      const reason = selectedReasons.length ? selectedReasons.map(cb => cb.value).join(', ') : 'N/A';
      const notes  = (document.getElementById('reason-notes').value || '').trim();
      const { productId, newAmount, oldAmount } = currentStockAdjustment || {};
      if (!productId) { showToast("No product selected."); return; }
  
      const res = await fetchWithShop(`${API_BASE}/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        cache: 'no-store',
        mode: 'cors',
        body: JSON.stringify({
          newAmount: parseInt(newAmount) || 0,
          oldAmount: parseInt(oldAmount) || 0,
          reason, notes,
          userName: currentUser.email || 'system'
        })
      });
  
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('Stock update failed:', res.status, res.statusText, txt);
        throw new Error(`Stock update failed: ${res.status} ${txt}`);
      }
  
      const updated = await res.json();
  
      // update local item
      const idx = products.findIndex(p => p.id === productId);
      if (idx > -1) {
        const normalized = { ...normalizeProduct(updated), id: updated._id || updated.id };
        // restock flag if crossed 0 -> >0
        const wasZero = (currentStockAdjustment.oldAmount || 0) <= 0;
        if (wasZero && (currentStockAdjustment.newAmount || 0) > 0) normalized.isRestocked = true;
        products[idx] = normalized;
      }
      renderInventory(products);
      updateDashboard();
      updateNotificationBadges();
      await refreshDuplicateBadge();
      updateRestockBadgeFallback();
      setRestockBadge(computeClientRestockCount());
  
      const doneBtn = document.getElementById(`done-${productId}`);
      if (doneBtn) doneBtn.style.display = 'none';
  
      showToast("Stock updated successfully!");
      closeReasonPopup();
    } catch (error) {
      console.error('Error in saveStockWithReason:', error);
      showToast(error.message || 'Error updating stock');
    }
}


 

  
  
  

// Populate category filter
function populateCategoryFilter() {
    if (!categoryFilter) return;
    const existing = new Set();
    Array.from(categoryFilter.options || []).forEach(opt => {
        if (opt.value) existing.add(opt.value);
    });
    PRIMARY_CATEGORY_OPTIONS.forEach(primary => {
        if (existing.has(primary)) return;
        const option = document.createElement('option');
        option.value = primary;
        option.textContent = primary;
        categoryFilter.appendChild(option);
    });
}

// Server search products
async function serverSearchProducts(q, category, limit = 100) {
    const params = new URLSearchParams({ page: 1, limit });
    if (q) params.set('q', q);
    if (category) params.set('category', category);

    // Fast path: exact EAN search if the query looks like an EAN
    const isEAN = /^\d{8,13}$/.test(q || '');
    if (isEAN) {
        params.set('ean', q);
    }
    const isPLU = /^\d{1,3}$/.test(q || '');
    if (isPLU) {
        params.set('plu', q);
    }

    const res = await fetchWithShop(`${API_BASE}/products/search?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const payload = await res.json();
    const list = Array.isArray(payload?.data) ? payload.data.map(normalizeProduct) : [];
    return { list, total: Number(payload?.total ?? list.length) };
}

// Check for duplicate products
async function checkForDuplicates() {
    const listEl = document.getElementById('duplicate-list');
    const msgEl = document.getElementById('popup-message');
    const content = document.getElementById('duplicate-content');
    const loader = document.getElementById('duplicate-loader');
    const confirmBtn = document.getElementById('confirm-duplicate'); // we’ll re-use as "Merge All"

    duplicatePopup.classList.add('active');
    msgEl.textContent = 'Scanning duplicates...';
    listEl.innerHTML = '';
    loader.classList.add('hidden');
    content.style.display = 'block';
    confirmBtn.style.display = 'none';

    try {
        const res = await fetchWithShop(`${API_BASE}/products/duplicates/by-ean`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Duplicates fetch failed: ${res.status}`);
        const dupes = await res.json();

        if (!Array.isArray(dupes) || !dupes.length) {
            msgEl.textContent = 'No duplicate products found!';
            return;
        }

        msgEl.textContent = `Found ${dupes.length} duplicate EAN group(s):`;
        listEl.innerHTML = '';

        // render each group
        dupes.forEach(g => {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid #eee';
            div.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div>
              <strong>EAN:</strong> ${g._id}
              <span style="color:#757575;">(${g.count} items)</span>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-merge-one" data-ean="${g._id}">Merge</button>
            </div>
          </div>
        `;
            listEl.appendChild(div);
        });

        // attach merge-one handlers
        listEl.querySelectorAll('.btn-merge-one').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const ean = e.currentTarget.dataset.ean;
                await mergeDuplicateEAN(ean);
            });
        });

        // show Merge All
        confirmBtn.style.display = 'inline-block';
        confirmBtn.textContent = 'Merge All';
        confirmBtn.onclick = async () => {
            for (const g of dupes) {
                try { await mergeDuplicateEAN(g._id, /*quiet*/true); }
                catch (e) { console.error('merge group error', g._id, e); }
            }
            showToast('All duplicate groups merged.');
            duplicatePopup.classList.remove('active');
            await silentRefreshOnce?.();
            await loadProducts();
            await loadMetrics();
            updateRestockBadgeFallback();
            await refreshDuplicateBadge();
            updateNotificationBadges();
        };

    } catch (err) {
        console.error('checkForDuplicates error:', err);
        msgEl.textContent = 'Error while checking duplicates.';
    }
}

async function mergeDuplicateEAN(ean, quiet = false) {
    try {
        const res = await fetchWithShop(`${API_BASE}/products/merge/by-ean`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ean, updatedBy: currentUser.email })
        });
        if (!res.ok) throw new Error(`Merge failed: ${res.status}`);
        const out = await res.json();

        // Update local state: remove losers; update winner if present in page
        const winnerId = out.merged?._id || out.merged?.id;
        const losers = new Set(out.deletedIds?.map(String) || []);

        products = products
            .filter(p => !losers.has(String(p.id)))
            .map(p => (String(p.id) === String(winnerId) ? { ...normalizeProduct(out.merged), id: winnerId } : p));

        // keep totals correct
        serverTotalProducts = Math.max(0, (serverTotalProducts || 0) - (out.deletedCount || 0));

        renderInventory(products);
        await loadProducts();
        await loadMetrics();
        updateNotificationBadges();
        await refreshDuplicateBadge();
        updateRestockBadgeFallback();

        if (!quiet) showToast(`Merged EAN ${ean} (removed ${out.deletedCount || 0})`);
        await silentRefreshOnce?.(); // pull fresh server view silently
    } catch (err) {
        console.error('mergeDuplicateEAN error:', err);
        showErrorPopup(err.message || `Merge failed for ${ean}`);
    }
}

// Remove duplicate products (kept for legacy, but merge is preferred)
function removeDuplicateEANs() {
    const duplicateList = document.getElementById('duplicate-list');
    duplicateList.innerHTML = '<p>Processing duplicates...</p>';
    document.getElementById('duplicate-loader').classList.remove('hidden');
    document.getElementById('duplicate-content').style.display = 'none';

    // Group duplicates by EAN
    const duplicatesByEAN = {};
    products.forEach(product => {
        if (!product.ean) return;

        if (!duplicatesByEAN[product.ean]) {
            duplicatesByEAN[product.ean] = [];
        }
        duplicatesByEAN[product.ean].push(product);
    });

    // For each EAN with duplicates, keep one and delete others
    Object.keys(duplicatesByEAN).forEach(ean => {
        const productsWithEAN = duplicatesByEAN[ean];
        if (productsWithEAN.length > 1) {
            // Sort by amount (descending) to keep the one with highest stock
            productsWithEAN.sort((a, b) => (b.amount || 0) - (a.amount || 0));
            // Keep the first product, remove the rest
            for (let i = 1; i < productsWithEAN.length; i++) {
                products = products.filter(p => p.id !== productsWithEAN[i].id);
            }
        }
    });
    saveProducts();
    document.getElementById('duplicate-loader').classList.add('hidden');
    document.getElementById('duplicate-content').style.display = 'block';
    document.getElementById('popup-message').textContent = "Duplicates removed successfully!";
    document.getElementById('duplicate-list').innerHTML = '';
    document.getElementById('confirm-duplicate').style.display = 'none';

    setTimeout(() => {
        duplicatePopup.classList.remove('active');
        renderInventory(products);
    }, 1500);
}

document.getElementById('inventory-history-btn')
  ?.addEventListener('click', () => showInventoryHistory());

  function formatHistoryDate(ts) {
    if (typeof ts === 'number') return new Date(ts).toLocaleString();
    if (ts && !Number.isNaN(Date.parse(ts))) return new Date(ts).toLocaleString();
    return 'Unknown date';
  }
  
  // Merged: shop-scoped, limit=2000, header shows "ShopName.<code>"
// Single, merged version — shop-scoped, limit=2000, header shows "ShopName.<code>"
async function showInventoryHistory() {
    try {
      const shopId = (typeof getCurrentShopId === 'function')
        ? getCurrentShopId()
        : (localStorage.getItem('shop:id') || 'shop-1');
  
      const url = `${API_BASE}/history?shop=${encodeURIComponent(shopId)}&limit=2000`;
      const res = await fetchWithShop(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        mode: 'cors'
      });
  
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('History load failed:', res.status, res.statusText, txt);
        throw new Error(`History load failed: ${res.status}`);
      }
  
      const history = await res.json();
      const el = document.getElementById('inventory-history-content');
      if (!el) return;
  
      el.innerHTML = Array.isArray(history) && history.length
        ? renderFullHistory(history)
        : '<p>No inventory history found for this shop.</p>';
  
      // ----- Header label: "Full Inventory History — ShopName.<code>" -----
      const h3 = inventoryHistoryPopup.querySelector('.popup-header h3');
      const shopsList = (window.shops || []);
      const shopObj = shopsList.find(s => s.id === shopId);
      const name = shopObj?.name || localStorage.getItem('shop:name') || shopId;
  
      // Prefer server header; else stored code; else derive from id (shop-1 => 1997)
      const serverCode = res.headers.get('X-Shop-Code');
      const derivedCode = (typeof codeFromShopId === 'function') ? codeFromShopId(shopId) : '1997';
      const code = shopObj?.code || serverCode || derivedCode;
  
      if (h3) {
        h3.innerHTML = `<i class="fas fa-history"></i> Full Inventory History — ${name}.${code}`;
      }
  
      inventoryHistoryPopup.classList.add('active');
    } catch (err) {
      console.error('showInventoryHistory error:', err);
      showToast('Could not load history from server.');
    }
  }
  function closeInventoryHistory() {
    inventoryHistoryPopup.classList.remove('active');
    const h3 = inventoryHistoryPopup.querySelector('.popup-header h3');
    if (h3) h3.innerHTML = `<i class="fas fa-history"></i> Full Inventory History`;
  }
function renderFullHistory(history) {
    return history.map(item => `
        <div class="history-item">
            <div class="history-header">
                <div class="history-date">${formatHistoryDate(item.timestamp || item.changedAt)}</div>
                <div class="history-user">${item.userName || 'System'}</div>
            </div>
            <div class="history-product">
                ${item.productName} <span style="color:#757575;">(${item.productEAN || 'No EAN'})</span>
            </div>
            <div class="history-change">
                <span class="old-amount">${item.oldAmount}</span>
                <span class="change-arrow">→</span>
                <span class="new-amount">${item.newAmount}</span>
                <span class="change-difference" style="color: ${getChangeColor(item.newAmount - item.oldAmount)}">
                    (${item.newAmount - item.oldAmount > 0 ? '+' : ''}${item.newAmount - item.oldAmount})
                </span>
            </div>
            ${item.reason ? `
                <div class="history-reason">
                    <strong>Reason:</strong> ${capitalizeFirstLetter(item.reason)}
                </div>
            ` : ''}
            ${item.notes ? `
                <div class="history-notes">
                    <strong>Notes:</strong> ${item.notes}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function downloadHistory() {
    const content = document.getElementById('inventory-history-content').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-history-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function printHistory() {
    const printContent = document.getElementById('inventory-history-content').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
        <h1>Inventory History</h1>
        <div>${printContent}</div>
        <div>Printed on: ${new Date().toLocaleString()}</div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    showInventoryHistory();
}

// Show toast notification
function showToast(message) {
    // Ensure DOM is ready
    if (!document.body) {
        return;
    }

    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#2e7d32';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '1000';
    toast.style.animation = 'fadeIn 0.3s';
    toast.textContent = message;

    document.body.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
`;
document.head.appendChild(style);

// Render product history
function renderProductHistory(history = []) {
    if (!history || history.length === 0) {
        return '<div class="empty-history">No stock changes recorded yet</div>';
    }

    return history.map(entry => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">${formatHistoryDate(entry.timestamp || entry.changedAt)}</span>
                <span class="history-user">by ${entry.userName || 'System'}</span>
            </div>
            <div class="history-change">
                <span class="old-amount">${entry.oldAmount}</span>
                <span class="change-arrow">→</span>
                <span class="new-amount">${entry.newAmount}</span>
                <span class="change-difference" style="margin-left: 12px; color: ${getChangeColor(entry.newAmount - entry.oldAmount)}">
                    (${entry.newAmount - entry.oldAmount > 0 ? '+' : ''}${entry.newAmount - entry.oldAmount})
                </span>
            </div>
            ${entry.reason ? `
                <div class="history-reason">
                    <strong>Reason:</strong> ${capitalizeFirstLetter(entry.reason || 'N/A')}
                </div>
            ` : ''}
            ${entry.notes ? `
                <div class="history-notes">
                    <strong>Notes:</strong> ${entry.notes || 'N/A'}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function exportHistoryAsText(productId) {
    const historyContent = document.getElementById(`history-content-${productId}`).innerText;
    const blob = new Blob([historyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${productId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showToast("History exported as text.");
}

function exportHistoryAsPDF(productId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const historyContent = document.getElementById(`history-content-${productId}`);
    const productName = historyContent.closest('.popup-content').querySelector('h3').textContent.replace('History for ', '');

    doc.setFontSize(16);
    doc.text(`Inventory History - ${productName}`, 10, 10);

    const elements = historyContent.getElementsByClassName('history-entry');
    let yOffset = 20;
    const lineHeight = 10;
    const pageHeight = 290; // jsPDF default page height in mm

    for (let element of elements) {
        const text = element.innerText.split('\n').filter(line => line.trim());
        for (let line of text) {
            if (yOffset > pageHeight - lineHeight) {
                doc.addPage();
                yOffset = 10;
            }
            doc.setFontSize(12);
            doc.text(line, 10, yOffset);
            yOffset += lineHeight;
        }
        yOffset += 2; // Small gap between entries
    }

    doc.save(`history_${productId}.pdf`);
    showToast("History exported as PDF.");
}

// Helper functions
function formatHistoryDate(timestamp) {
    const fallback = () => new Date().toLocaleString();
    if (!timestamp && timestamp !== 0) return fallback();
    if (typeof timestamp === 'number') {
        const date = new Date(timestamp);
        return Number.isNaN(date.getTime()) ? fallback() : date.toLocaleString();
    }
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? fallback() : date.toLocaleString();
}

function getChangeColor(difference) {
    return difference > 0 ? '#2e7d32' : difference < 0 ? '#d32f2f' : '#424242';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Toggle history popup
function toggleHistoryPopup(productId, event) {
    event.stopPropagation();
    closeAllHistoryPopups();

    let popup = document.getElementById(`history-popup-${productId}`);
    if (popup) {
        document.body.removeChild(popup); // Remove old popup to avoid stale content
    }
    // Create new popup with latest data
    popup = document.createElement('div');
    popup.className = 'history-popup';
    popup.id = `history-popup-${productId}`;
    const product = products.find(p => p.id === productId);
    popup.innerHTML = `
        <div class="popup-content" style="max-width: 400px; max-height: 70vh; overflow-y: auto;">
            <div class="popup-header">
                <h3>History for ${product?.name || 'Unknown Product'}</h3>
                <button class="popup-close" onclick="closeHistoryPopup('${productId}')" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #757575;">×</button>
            </div>
            <div id="history-content-${productId}" class="history-container">
                ${renderProductHistory(product?.history || [])}
            </div>
            <div class="popup-footer">
                <button class="btn-export" onclick="exportHistoryAsText('${productId}')">Export as Text</button>
                <button class="btn-export" onclick="exportHistoryAsPDF('${productId}')">Export as PDF</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    popup.classList.add('show');

    // Scroll to top and animate items
    const content = document.getElementById(`history-content-${productId}`);
    if (content) {
        content.scrollTop = 0;
        const items = content.querySelectorAll('.history-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }
}

// Close individual history popup
function closeHistoryPopup(productId) {
    const popup = document.getElementById(`history-popup-${productId}`);
    if (popup) {
        popup.classList.remove('show');
    }
}

function closeAllHistoryPopups() {
    document.querySelectorAll('.history-popup').forEach(popup => {
        popup.classList.remove('show');
    });
}

// Error popup
function showErrorPopup(message, fieldName = null) {
    const errorPopup = document.getElementById('error-popup');
    document.getElementById('error-message-text').textContent = message;
    // Highlight the problematic field if specified
    const errorHighlight = document.getElementById('error-field-highlight');
    if (fieldName) {
        const fieldLabel = {
            'category': 'Category',
            'name': 'Product Name',
            'price': 'Selling Price'
        }[fieldName] || fieldName;

        errorHighlight.innerHTML = `<strong>Missing Field:</strong> ${fieldLabel}`;
        errorHighlight.style.display = 'block';

        // Scroll to and focus the problematic field
        const inputField = document.getElementById(`${fieldName}-input`);
        if (inputField) {
            inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputField.focus();
            inputField.style.borderColor = '#ff5252';
            inputField.style.boxShadow = '0 0 0 2px rgba(255, 82, 82, 0.3)';

            // Remove highlighting after focus is lost
            inputField.addEventListener('blur', function () {
                this.style.borderColor = '#c8e6c9';
                this.style.boxShadow = 'none';
            }, { once: true });
        }
    } else {
        errorHighlight.style.display = 'none';
    }
    errorPopup.classList.add('active');
}

function closeErrorPopup() {
    document.getElementById('error-popup').classList.remove('active');
}

// Update notification badges
function updateNotificationBadges() {
    try {
        const historyCount = products.reduce((sum, product) => sum + (product.history?.length || 0), 0);
        document.getElementById('history-count').textContent = historyCount || 0;

        const totalForBadge =
            Number.isFinite(serverTotalProducts) ? serverTotalProducts : (products?.length || 0);
        document.getElementById('allstock-count').textContent = totalForBadge;

        const lowStockThreshold = 10;
        const lowStockCount = products.filter(p => (p.amount || 0) <= (p.reorderLevel || lowStockThreshold)).length;
        document.getElementById('lowstock-count').textContent = lowStockCount || 0;

        const stockInCount = products.filter(p => p.history?.some(h => h.newAmount > h.oldAmount)).length;
        document.getElementById('stockin-count').textContent = stockInCount || 0;

        const stockOutCount = products.filter(p => p.history?.some(h => h.newAmount < h.oldAmount)).length;
        document.getElementById('stockout-count').textContent = stockOutCount || 0;
    } catch (error) {
        console.error('Error updating notification badges:', error);
    }
}

// Table headers event listeners for sorting
const tableHeaders = document.querySelectorAll('.inventory-table th');
tableHeaders.forEach((header, index) => {
    if (index < 6) {
        header.dataset.column = header.textContent.toLowerCase();
        header.setAttribute('tabindex', '0');
        header.addEventListener('click', () => {
            const direction = sortState.column === header.dataset.column && sortState.direction === 'asc' ? 'desc' : 'asc';
            sortInventory(header.dataset.column, direction);
        });
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    }
});

// Sort inventory
function sortInventory(column, direction = 'asc') {
    sortState = { column, direction };
    const headers = document.querySelectorAll('.inventory-table th');
    headers.forEach(header => {
        header.setAttribute('aria-sort', header.dataset.column === column ? direction : 'none');
    });
    renderInventory(products);
}

function calculateTotalSellingAmount() {
    const totalSellingAmount = products.reduce((sum, product) => {
        return sum + ((product.amount || 0) * (product.price || 0));
    }, 0);
    const element = document.getElementById('totall-selling-amount');
    if (element) {
        element.textContent = formatEuro(totalSellingAmount);
    }
}

function calculateTotalBuyingAmount() {
    const totalBuyingAmount = products.reduce((sum, product) => {
        return sum + ((product.amount || 0) * (product.cost || 0));
    }, 0);
    const element = document.getElementById('total-buying-amount');
    if (element) {
        element.textContent = formatEuro(totalBuyingAmount);
    }
}

function calculateTotalWeight() {
    const totalWeight = products.reduce((sum, product) => {
        return sum + ((product.amount || 0) * (product.weight || 0));
    }, 0) / 1000; // Convert grams to kilograms
    const element = document.getElementById('total-weight');
    if (element) {
        const formatted = formatNumber(totalWeight, 2);
        element.textContent = formatted === '—' ? '—' : `${formatted} kg`;
    }
}

function calculateTotalStockQuantity() {
    const totalStock = products.reduce((sum, product) => {
        return sum + (product.amount || 0);
    }, 0);
    const element = document.getElementById('total-stock-quantity');
    if (element) {
        element.textContent = formatNumber(totalStock, 0);
    }
}

async function fetchAllProductsForExport(batchSize = 10000) {
    let all = [];
    let page = 1;
    let total = Infinity;

    while (all.length < total) {
        const res = await fetchWithShop(
            `${API_BASE}/products?page=${page}&limit=${batchSize}`,
            { cache: 'no-store', headers: { 'Accept': 'application/json' } }
        );
        if (!res.ok) throw new Error(`Load page ${page} failed: ${res.status}`);
        const payload = await res.json();

        const list = Array.isArray(payload?.data) ? payload.data : [];
        if (!list.length) break;

        all = all.concat(list.map(normalizeProduct));
        total = Number(payload?.total ?? all.length); // respect server total
        page++;
    }
    return all;
}

async function exportProductsToCSV() {
    try {
        // If we didn't load everything, fetch all pages before exporting
        const rows = (serverTotalProducts && products.length < serverTotalProducts)
            ? await fetchAllProductsForExport(10000)
            : products;

        if (!rows?.length) { showToast('No products to export.'); return; }

        const headers = [
            'ean', 'plu', 'name', 'price', 'cost', 'weight', 'amount', 'primaryCategory', 'reorderLevel',
            'sku', 'brand', 'shortDesc', 'longDesc', 'promoPrice', 'taxClass', 'dimensions', 'warehouse', 'supplier', 'country',
            'metaTitle', 'metaDesc', 'visibility'
        ];

        const escapeVal = (v) => {
            if (v === null || v === undefined) return '';
            const s = String(v);
            return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
        };

        let csv = headers.join(',') + '\n';
        for (const p of rows) csv += headers.map(h => escapeVal(p[h])).join(',') + '\n';

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`Exported ${rows.length} products.`);
    } catch (e) {
        console.error('export csv:', e);
        showToast(`Export failed: ${e.message}`);
    }
}

// Normalize server docs to what the UI expects
function normalizeProduct(p) {
    const out = { ...p };
    // Ensure we always have "id"
    out.id = p._id || p.id || `p_${Math.random().toString(36).slice(2)}`;

    // Coerce numeric fields to numbers so math doesn’t explode
    const asNum = (v, d = 0) => {
        const n = Number.parseFloat(v);
        return Number.isFinite(n) ? n : d;
    };
    const asInt = (v, d = 0) => {
        const n = Number.parseInt(v, 10);
        return Number.isFinite(n) ? n : d;
    };

    out.price = asNum(p.price, 0);
    out.cost = asNum(p.cost, 0);
    out.weight = asNum(p.weight, 0);
    out.amount = asInt(p.amount, 0);
    out.reorderLevel = asInt(p.reorderLevel, 10);
    out.ean = p.ean != null ? String(p.ean).trim() : '';
    out.plu = p.plu != null ? String(p.plu).trim() : '';
    out.primaryCategory = p.primaryCategory != null ? String(p.primaryCategory).trim() : String(p.category || '').trim();
    out.secondaryCategory = p.secondaryCategory != null ? String(p.secondaryCategory).trim() : '';
    out.category = out.primaryCategory || out.secondaryCategory || p.category || '';
    out.supplier = p.supplier != null ? String(p.supplier).trim() : '';
    out.brand = p.brand != null ? String(p.brand).trim() : '';
    out.shelfLifeCode = p.shelfLifeCode != null ? String(p.shelfLifeCode).trim() : '';
    out.warehouseId = p.warehouseId != null ? String(p.warehouseId).trim() : (p.warehouse || '');
    out.warehouseName = p.warehouseName != null ? String(p.warehouseName).trim() : getWarehouseDisplayName(out.warehouseId);
    out.shopId = p.shopId ? String(p.shopId) : 'shop-1';
    const toMs = (value) => {
        if (value === undefined || value === null || value === '') return null;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const date = new Date(value);
        return Number.isFinite(date.getTime()) ? date.getTime() : null;
    };
    out.updatedAt = toMs(p.updatedAt) || toMs(p.updatedAtMs) || out.updatedAt || null;
    out.createdAt = toMs(p.createdAt) || toMs(p.createdAtMs) || out.createdAt || null;
    out.lastUpdated = toMs(p.lastUpdated) || out.updatedAt || out.createdAt || Date.now();
    // Ensure history array exists (preserve if present, else [])
    out.history = Array.isArray(p.history) ? p.history : (out.history || []);
    if (p.expiryDate) {
        const parsedExpiry = p.expiryDate instanceof Date ? p.expiryDate : new Date(p.expiryDate);
        out.expiryDate = Number.isFinite(parsedExpiry.getTime()) ? parsedExpiry : null;
    } else {
        out.expiryDate = null;
    }
    if (out.pictureUrl) {
        out.pictureUrl = resolveAssetUrl(out.pictureUrl);
    }
    applyRememberedShelfLife(out);
    rememberShelfLifeCode(out, out.shelfLifeCode || '');
    return out;
}

function addProductsLocally(list = []) {
    if (!Array.isArray(list) || !list.length) return [];
    const now = Date.now();
    const normalized = list.map((p, idx) => {
        const base = { ...p };
        if (!base.id && !base._id) base.id = `local-${now}-${idx}`;
        if (!base.createdAt) base.createdAt = now;
        if (!base.lastUpdated && base.updatedAt) base.lastUpdated = base.updatedAt;
        if (!base.lastUpdated) base.lastUpdated = now;
        base.shopId = base.shopId || getActiveShopId();
        return normalizeProduct(base);
    });
    products = normalized.concat(products);
    renderInventory(products);
    updateDashboard();
    updateNotificationBadges();
    updateRestockBadgeFallback();
    refreshPurchaseProductOptions();
    refreshDuplicateBadge();
    return normalized;
}
// Load products (increased limit to handle more products and fix badge issues)
async function loadProducts(page = 1, limit = 100000) {
    const url = `${API_BASE}/products?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;
    // 1) NETWORK PHASE — keep errors separate
    let payload;
    try {
        const res = await fetchWithShop(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        const raw = await res.text(); // read raw so we can debug if JSON invalid
        if (!res.ok) {
            console.error('Server responded non-OK:', res.status, res.statusText, raw);
            // Stay quiet (offline mode) and keep whatever data we already have
            return;
        }
        try {
            payload = JSON.parse(raw);
            serverTotalProducts = Number(payload?.total ?? serverTotalProducts ?? 0);
        } catch (e) {
            console.error('JSON parse error. Raw response:', raw);
            showToast('Could not load from server (bad JSON)');
            return;
        }
    } catch (err) {
        console.error('Network error loading products:', err);
        // Stay quiet (offline mode) and keep whatever data we already have
        return;
    }

    // 2) DATA SHAPE PHASE — normalize before UI
    try {
        const list = Array.isArray(payload?.data) ? payload.data : [];
        const normalized = list.map(normalizeProduct);
        products = normalized.filter(prod => belongsToCurrentShop(prod.shopId));

        // 3) UI PHASE — if anything here throws, we show a *different* message
        renderInventory(products, false);
        updateDashboard();
        updateNotificationBadges();
        refreshPurchaseProductOptions();
    } catch (err) {
        console.error('UI render error after load:', err);
        showToast(`UI error: ${err.message || 'failed to render'}`);
    }
}

function parseCSV(text) {
    const rows = [];
    let row = [], cur = '', inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
            } else {
                cur += c;
            }
        } else {
            if (c === '"') inQuotes = true;
            else if (c === ',') { row.push(cur); cur = ''; }
            else if (c === '\r') { /* ignore CR */ }
            else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
            else { cur += c; }
        }
    }
    row.push(cur);
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
    return rows;
}

function toNumberMaybe(v, def = 0) {
    if (v === undefined || v === null || v === '') return def;
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : def;
}

async function importProductsFromCSV(event) {
    const file = event.target.files?.[0];
    if (!file) return showToast('No file selected.');
    if (!file.name.toLowerCase().endsWith('.csv')) return showToast('Please upload a .csv file.');

    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) return showToast('CSV is empty.');

    // Normalize helper: trim, strip BOM, remove spaces, lowercase
    const norm = (s) => String(s ?? '')
        .replace(/^\uFEFF/, '')       // strip BOM if present
        .trim()
        .replace(/\s+/g, '')
        .toLowerCase();

    // Build a header map so column order doesn't matter
    const headerRow = rows[0];
    const headerMap = {};
    headerRow.forEach((h, i) => { headerMap[norm(h)] = i; });

    const expected = [
        'ean', 'plu', 'name', 'price', 'cost', 'weight', 'amount', 'primaryCategory', 'reorderLevel',
        'sku', 'brand', 'shortDesc', 'longDesc', 'promoPrice', 'taxClass', 'dimensions', 'warehouse', 'supplier',
        'country', 'metaTitle', 'metaDesc', 'visibility'
    ];

    // Check we have all required headers (order not required)
    const missing = expected.filter(h => !(norm(h) in headerMap));
    if (missing.length) {
        console.error('CSV header row seen:', headerRow);
        return showToast(`Invalid CSV headers. Missing: ${missing.join(', ')}`);
    }

    const idx = (h) => headerMap[norm(h)];
    const get = (row, h) => row[idx(h)] ?? '';

    const payload = [];
    const now = Date.now();

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0 || r.every(c => !String(c ?? '').trim())) continue;

        const amountInt = parseInt(String(get(r, 'amount') || '0'), 10) || 0;
        const reorderInt = parseInt(String(get(r, 'reorderLevel') || '10'), 10) || 10;

        const rawPlu = String(get(r, 'plu') || '').trim();
        if (!/^\d{1,3}$/.test(rawPlu)) {
            showToast(`Invalid PLU at row ${i + 1}. Must be 1-3 digits.`);
            return;
        }

        const obj = {
            ean: get(r, 'ean'),
            plu: rawPlu,
            name: get(r, 'name'),
            price: toNumberMaybe(get(r, 'price'), 0),      // accepts 12,34 or 12.34
            cost: toNumberMaybe(get(r, 'cost'), 0),
            weight: toNumberMaybe(get(r, 'weight'), 0),
            amount: amountInt,
            primaryCategory: get(r, 'primaryCategory'),
            reorderLevel: reorderInt,
            sku: get(r, 'sku'),
            brand: get(r, 'brand'),
            shortDesc: get(r, 'shortDesc'),
            longDesc: get(r, 'longDesc'),
            promoPrice: get(r, 'promoPrice'),              // keep as-is (can be "15,88")
            taxClass: (get(r, 'taxClass') === '' ? undefined : toNumberMaybe(get(r, 'taxClass'))),
            dimensions: get(r, 'dimensions'),
            warehouse: get(r, 'warehouse'),
            supplier: get(r, 'supplier'),
            country: get(r, 'country'),
            metaTitle: get(r, 'metaTitle'),
            metaDesc: get(r, 'metaDesc'),
            visibility: get(r, 'visibility'),
            category: get(r, 'primaryCategory'),
            createdAt: now,
            lastUpdated: now,
            createdBy: currentUser.email,
            updatedBy: currentUser.email,
            history: [],
            isRestocked: amountInt > 0
        };

        if (!obj.name) continue; // skip blank lines
        payload.push(obj);
    }

    if (!payload.length) return showToast('No valid rows found.');

    try {
        const res = await fetchWithShop(`${API_BASE}/products/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Import failed (${res.status}): ${text}`);
        }
        const json = await res.json();
        showToast(`Imported ${json.inserted || 0} products.`);
        await loadProducts();
        await refreshDuplicateBadge();
        updateRestockBadgeFallback();
    } catch (err) {
        console.error('CSV import error:', err);
        addProductsLocally(payload);
        showToast('Server import failed; added products locally.');
    }
}

//+++++++restock
function setRestockBadge(val) {
    const el = document.getElementById('restock-count');
    if (!el) return;
    const n = Number.isFinite(val) && val >= 0 ? Math.floor(val) : 0;
    el.textContent = String(n);
}

function setRestockMetric(val) {
    const el = document.getElementById('restock-metric');
    if (!el) return;
    const n = Number.isFinite(val) && val >= 0 ? val : 0;
    el.textContent = formatNumber(n, 0);
}


function computeClientRestockCount() {
    try {
        return products.filter(p =>
            p.isRestocked === true ||
            p.history?.some(h => (h.oldAmount || 0) === 0 && (h.newAmount || 0) > 0)
        ).length;
    } catch {
        return 0;
    }
}

function updateRestockBadgeFallback() {
    // Always recompute from the current products on the page
    const count = computeClientRestockCount();
    setRestockBadge(count);
    setRestockMetric(count);
}


async function loadMetrics() {
    try {
        const res = await fetchWithShop(`${API_BASE}/products/metrics`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`metrics ${res.status}`);
        const m = await res.json();

        const totalProducts = Number(m.totalProducts ?? 0);
        const totalStockQuantity = Number(m.totalStockQuantity ?? 0);
        const lowStockItems = Number(m.lowStockItems ?? 0);
        const totalCostValue = Number(m.totalCostValue ?? 0);
        const totalSalesValue = Number(m.totalSalesValue ?? 0);
        const totalWeightKg = Number(m.totalWeightKg ?? 0);
        const serverRestock = Number(m.restockedItems ?? m.restockCount ?? m.restockedCount);

        const formatInt = (value) => formatNumber(Number(value) || 0, 0);
        const weight = (value) => {
            const formatted = formatNumber(value, 2);
            return formatted === '—' ? '—' : `${formatted} kg`;
        };

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('total-products', formatInt(totalProducts));
        setText('total-stock-quantity', formatInt(totalStockQuantity));
        setText('low-stock', formatInt(lowStockItems));
        setText('total-buying-amount', formatEuro(totalCostValue));
        setText('totall-selling-amount', formatEuro(totalSalesValue));
        setText('total-weight', weight(totalWeightKg));

        updateStockHealth(totalProducts, lowStockItems);
        updateValuePerSku(totalCostValue, totalProducts);
        updateWeightPerSku(totalWeightKg, totalProducts);

        const profitValue = totalSalesValue - totalCostValue;
        setText('potential-profit', formatEuro(profitValue));

        const marginEl = document.getElementById('kpi-delta-profit');
        const marginPct = Number.isFinite(totalCostValue) && totalCostValue > 0
            ? (profitValue / totalCostValue) * 100
            : null;
        if (marginEl) {
            if (marginPct === null || !Number.isFinite(marginPct)) {
                marginEl.textContent = 'Margin —';
                marginEl.classList.remove('metric-loss');
            } else {
                marginEl.textContent = `Margin ${formatNumber(marginPct, 1)}%`;
                marginEl.classList.toggle('metric-loss', profitValue < 0);
            }
        }

        const avgUnitCost = totalStockQuantity > 0 ? totalCostValue / totalStockQuantity : null;
        setText('average-unit-cost', avgUnitCost === null ? '—' : formatEuro(avgUnitCost));

        if (Number.isFinite(serverRestock)) {
            setRestockBadge(serverRestock);
            setRestockMetric(serverRestock);
        } else {
            const fallback = computeClientRestockCount();
            setRestockBadge(fallback);
            setRestockMetric(fallback);
        }

    } catch (e) {
        console.error('loadMetrics error:', e);
        // Fallback to client-side calculations
        const totalProducts = products.length || 0;
        const totalStock = products.reduce((sum, product) => sum + (product.amount || 0), 0);
        const lowStock = products.filter(p => (p.amount || 0) <= (p.reorderLevel || 10)).length || 0;
        const totalCost = products.reduce((sum, product) => sum + ((product.amount || 0) * (product.cost || 0)), 0);
        const totalSales = products.reduce((sum, product) => sum + ((product.amount || 0) * (product.price || 0)), 0);
        const totalWeight = products.reduce((sum, product) => sum + ((product.amount || 0) * (product.weight || 0)), 0) / 1000;

        const formatInt = (value) => formatNumber(Number(value) || 0, 0);
        const weight = (value) => {
            const formatted = formatNumber(value, 2);
            return formatted === '—' ? '—' : `${formatted} kg`;
        };

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('total-products', formatInt(totalProducts));
        setText('total-stock-quantity', formatInt(totalStock));
        setText('low-stock', formatInt(lowStock));
        setText('total-buying-amount', formatEuro(totalCost));
        setText('totall-selling-amount', formatEuro(totalSales));
        setText('total-weight', weight(totalWeight));

        updateStockHealth(totalProducts, lowStock);
        updateValuePerSku(totalCost, totalProducts);
        updateWeightPerSku(totalWeight, totalProducts);

        const profitValue = totalSales - totalCost;
        setText('potential-profit', formatEuro(profitValue));

        const marginEl = document.getElementById('kpi-delta-profit');
        const marginPct = totalCost > 0 ? (profitValue / totalCost) * 100 : null;
        if (marginEl) {
            if (marginPct === null || !Number.isFinite(marginPct)) {
                marginEl.textContent = 'Margin —';
                marginEl.classList.remove('metric-loss');
            } else {
                marginEl.textContent = `Margin ${formatNumber(marginPct, 1)}%`;
                marginEl.classList.toggle('metric-loss', profitValue < 0);
            }
        }

        const avgUnitCost = totalStock > 0 ? totalCost / totalStock : null;
        setText('average-unit-cost', avgUnitCost === null ? '—' : formatEuro(avgUnitCost));

        const restockCount = computeClientRestockCount();
        setRestockBadge(restockCount);
        setRestockMetric(restockCount);
    }
}

let _autoTimer = null;
let _autoAbort = null;
let _lastSig = '';
let _refreshBaseMs = 30000;  // 30s
let _refreshBackoffMs = 0;   // grows on errors

function snapshotSignature(list) {
    // Fast signature: sample the list to avoid heavy CPU on large arrays
    let acc = `${list.length}|`;
    const step = Math.max(1, Math.floor(list.length / 200)); // sample up to ~200 rows
    for (let i = 0; i < list.length; i += step) {
        const p = list[i];
        acc += `${p.id}:${p.amount}:${p.price}:${p.plu || ''}:${p.lastUpdated || p.updatedAt || 0};`;
    }
    // tiny hash
    let h = 0;
    for (let i = 0; i < acc.length; i++) h = (h * 31 + acc.charCodeAt(i)) | 0;
    return String(h);
}

async function silentRefreshOnce() {
    // cancel any in-flight refresh
    if (_autoAbort) _autoAbort.abort();
    _autoAbort = new AbortController();
    const signal = _autoAbort.signal;

    try {
        // 1) refresh metrics quietly (if your /metrics route exists)
        if (typeof loadMetrics === 'function') {
            loadMetrics().catch(() => { });
        }
        if (typeof refreshDuplicateBadge === 'function') {
            refreshDuplicateBadge().catch(() => { });
        }
        // 2) refresh the products quietly
        const url =
            `${API_BASE}/products?page=${encodeURIComponent(1)}` +
            `&limit=${encodeURIComponent(100000)}&sort=lastUpdated&dir=desc`;

        const res = await fetchWithShop(url, { signal, cache: 'no-store', headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const raw = await res.text();
        const payload = JSON.parse(raw);
        const list = Array.isArray(payload?.data) ? payload.data.map(normalizeProduct) : [];
        serverTotalProducts = Number(payload?.total ?? serverTotalProducts ?? 0);


        // Only update the DOM if something meaningful changed
        const sig = snapshotSignature(list);
        if (sig === _lastSig) {
            _refreshBackoffMs = 0; // success; keep normal cadence
            return;
        }
        _lastSig = sig;
        // Preserve scroll & focus to avoid "jump"
        const scrollY = window.scrollY;
        const activeId = document.activeElement?.id;
        products = list;
        // Apply UI updates on the next frame to keep it smooth
        requestAnimationFrame(() => {
            renderInventory(products, false, getCurrentFilterType());
            updateDashboard();
            updateNotificationBadges();
            updateRestockBadgeFallback();
            setRestockBadge(computeClientRestockCount());

            window.scrollTo(0, scrollY);
            if (activeId) document.getElementById(activeId)?.focus?.();
        });

        _refreshBackoffMs = 0; // reset backoff on success
    } catch (_err) {
        // gentle backoff so we don't hammer on errors
        _refreshBackoffMs = Math.min(120000, Math.max(45000, (_refreshBackoffMs || _refreshBaseMs) * 2));
    }
}

function scheduleNextRefresh() {
    const delay = (_refreshBackoffMs || _refreshBaseMs);
    _autoTimer = setTimeout(async () => {
        if (!document.hidden) await silentRefreshOnce();
        scheduleNextRefresh(); // loop
    }, delay);
}

function startAutoRefresh() {
    stopAutoRefresh();
    _refreshBackoffMs = 0;
    // small delay after page load to avoid initial flicker
    _autoTimer = setTimeout(async () => {
        if (!document.hidden) await silentRefreshOnce();
        scheduleNextRefresh();
    }, 2000);
}

function stopAutoRefresh() {
    if (_autoTimer) clearTimeout(_autoTimer);
    _autoTimer = null;
    if (_autoAbort) _autoAbort.abort();
    _autoAbort = null;
}

// Pause when tab is hidden; resume when visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoRefresh();
    else startAutoRefresh();
});

async function refreshDuplicateBadge() {
    try {
        const r = await fetchWithShop(`${API_BASE}/products/duplicates/by-ean`, { cache: 'no-store' });
        if (!r.ok) throw new Error(`status ${r.status}`);
        const groups = await r.json();
        const el = document.getElementById('duplicate-count');
        if (el) el.textContent = Array.isArray(groups) ? groups.length : 0;
    } catch (e) {
        console.warn('duplicate badge refresh failed:', e);
    }
}
/*** IVMS-97 Product Pictures (server-backed)*/
(function () {
    if (window.__hasServerPictureHook) return;
    window.__hasServerPictureHook = true;
    const FILE_INPUT = document.getElementById('picture-file-input');
    const PREVIEW_IMG = document.getElementById('picture-preview-img');
    const HIDDEN_DATA = document.getElementById('picture-data-url');
    const SAVE_BTN = document.getElementById('save-button');
    const EAN_INPUT = document.getElementById('ean-input');
    const URL_INPUT = document.getElementById('picture-url-input');
    const URL_LOAD_BTN = document.getElementById('picture-url-load');
    const TBL = document.getElementById('inventory-table');
    const TBODY = document.getElementById('inventory-body');

    const objectURLCache = new WeakMap();

    const supportsIDB = typeof indexedDB !== 'undefined';
    const ctx = window.__pictureUploadContext || (window.__pictureUploadContext = {});
    if (!('blob' in ctx)) ctx.blob = null;
    const getBlob = () => ctx.blob;
    const setBlob = (value) => { ctx.blob = value; };
    ctx.hasPending = () => !!ctx.blob;
    ctx.peekPending = () => ctx.blob;

    if (supportsIDB && !ctx.cache) {
        const DB_NAME = 'ivms97DB';
        const STORE_NAME = 'pictures';
        let dbPromise = null;
        const openDB = () => {
            if (dbPromise) return dbPromise;
            dbPromise = new Promise((resolve, reject) => {
                const req = indexedDB.open(DB_NAME, 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'ean' });
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            return dbPromise;
        };
        const cachePut = async (ean, blob, mime) => {
            if (!ean || !blob) return false;
            try {
                const db = await openDB();
                return await new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    store.put({ ean, blob, mime: mime || blob.type || 'image/png', updatedAt: Date.now() });
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => reject(tx.error);
                });
            } catch {
                return false;
            }
        };
        const cacheGet = async (ean) => {
            if (!ean) return null;
            try {
                const db = await openDB();
                return await new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.get(ean);
                    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
                    req.onerror = () => reject(req.error);
                });
            } catch {
                return null;
            }
        };
        ctx.cache = { put: cachePut, get: cacheGet };
    } else if (!ctx.cache) {
        ctx.cache = {
            put: async () => false,
            get: async () => null,
        };
    }
    const cachePut = ctx.cache.put;
    const cacheGet = ctx.cache.get;
    ctx.writeToCache = cachePut;
    ctx.readFromCache = cacheGet;

    function getHeaderIndexByDataColumn(columnName) {
        const ths = TBL.querySelectorAll('thead th');
        for (let i = 0; i < ths.length; i++) {
            if ((ths[i].dataset.column || '').toLowerCase() === columnName.toLowerCase()) return i;
        }
        return -1;
    }
    function getEANFromRow(tr) {
        const eanIdx = getHeaderIndexByDataColumn('ean');
        if (eanIdx === -1) return null;
        const cells = tr.children;
        if (cells.length <= eanIdx) return null;
        return cells[eanIdx].textContent.trim();
    }
    function createPictureCell() {
        const td = document.createElement('td');
        td.className = 'picture-cell';

        const img = document.createElement('img');
        Object.assign(img.style, {
            width: '25mm',
            height: '25mm',
            borderRadius: '6mm',
            display: 'block',
            objectFit: 'cover',
            background: '#f8fafc',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.18)'
        });
        img.alt = 'Product picture';

        td.appendChild(img);
        return td;
    }
    async function setRowPicture(tr) {
        const ean = getEANFromRow(tr);
        if (!ean) return;
        let picCell = tr.children[0];
        if (!(picCell && picCell.classList && picCell.classList.contains('picture-cell'))) {
            picCell = createPictureCell();
            tr.insertBefore(picCell, tr.firstElementChild);
        }
        const img = picCell.querySelector('img');

        const prev = objectURLCache.get(img);
        if (prev) {
            URL.revokeObjectURL(prev);
            objectURLCache.delete(img);
        }

        let blob = await cacheGet?.(ean);
        if (!blob) {
            try {
                const endpoint = `${API_BASE.replace(/\/$/, '')}/products/picture/by-ean/${encodeURIComponent(ean)}?t=${Date.now()}`;
                const res = await fetchWithShop(endpoint, { mode: 'cors' });
                if (res.ok && res.status !== 204) {
                    blob = await res.blob();
                    cachePut?.(ean, blob, blob.type).catch(() => {});
                }
            } catch (err) {
                console.warn('Picture fetch failed:', err);
            }
        }

        if (blob) {
            const url = URL.createObjectURL(blob);
            objectURLCache.set(img, url);
            img.src = url;
            img.style.visibility = 'visible';
        } else {
            img.removeAttribute('src');
            img.style.visibility = 'hidden';
        }
    }
    async function refreshAllRowPictures() {
        const rows = TBODY.querySelectorAll('tr');
        for (const tr of rows) {
            await setRowPicture(tr);
        }
    }
    function clearPendingPreview() {
        setBlob(null);
        if (PREVIEW_IMG) { PREVIEW_IMG.style.display = 'none'; PREVIEW_IMG.removeAttribute('src'); }
        if (HIDDEN_DATA) HIDDEN_DATA.value = '';
    }
    if (FILE_INPUT) {
        FILE_INPUT.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) { clearPendingPreview(); return; }
            setBlob(file);
            const fr = new FileReader();
            fr.onload = () => {
                if (HIDDEN_DATA) HIDDEN_DATA.value = fr.result;
                if (PREVIEW_IMG) { PREVIEW_IMG.src = fr.result; PREVIEW_IMG.style.display = 'inline-block'; }
            };
            fr.readAsDataURL(file);
        });
    }
    if (URL_LOAD_BTN && URL_INPUT) {
        URL_LOAD_BTN.addEventListener('click', async () => {
            const url = URL_INPUT.value.trim();
            if (!url) return;
            try {
                const res = await fetch(url, { mode: 'cors' });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const blob = await res.blob();
                setBlob(blob);
                const reader = new FileReader();
                reader.onload = () => {
                    if (HIDDEN_DATA) HIDDEN_DATA.value = reader.result;
                    if (PREVIEW_IMG) { PREVIEW_IMG.src = reader.result; PREVIEW_IMG.style.display = 'inline-block'; }
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error('Failed to load image from URL:', err);
                alert('Could not load image from the provided URL.');
                clearPendingPreview();
            }
        });
    }
    async function uploadPendingToServer(ean) {
        const pendingBlob = getBlob();
        if (!pendingBlob) return null;
        const form = new FormData();
        form.append('picture', pendingBlob, 'upload.' + (pendingBlob.type?.split('/')[1] || 'bin'));
        const endpoint = `${API_BASE.replace(/\/$/, '')}/products/picture/by-ean/${encodeURIComponent(ean)}`;
        const r = await fetchWithShop(endpoint, {
            method: 'POST',
            body: form,
            mode: 'cors'
        });
        if (!r.ok) throw new Error('Upload failed: ' + r.status);
        let url = null;
        try {
            const json = await r.json();
            url = json?.url || null;
        } catch {/* ignore parse errors */}
        cachePut?.(ean, pendingBlob, pendingBlob.type).catch(() => {});
        return url;
    }
    if (!ctx.uploadForEAN) ctx.uploadForEAN = uploadPendingToServer;
    if (!ctx.clearPending) ctx.clearPending = clearPendingPreview;
    if (!ctx.refreshInventoryPictures) ctx.refreshInventoryPictures = refreshAllRowPictures;
    if (SAVE_BTN) {
        SAVE_BTN.addEventListener('click', () => {
            // Actual upload happens after the product is persisted (saveProduct success)
            setTimeout(refreshAllRowPictures, 0);
        });
    }
    const observer = new MutationObserver(refreshAllRowPictures);
    observer.observe(TBODY, { childList: true });
    const style = document.createElement('style');
    style.textContent = `
    .inventory-table th[data-column="picture"] { width: 40mm; text-align: center; }
    .inventory-table td.picture-cell { text-align: center; padding: 1.5mm; display:flex;align-items:center;justify-content:center; }
  `;
    document.head.appendChild(style);
    refreshAllRowPictures();
})();
