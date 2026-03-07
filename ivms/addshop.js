// addshop.js — Multi-shop / branch management
window.API_BASE = window.API_BASE || 'http://127.0.0.1:4000/api';

const shopAwareFetch = typeof fetchWithShop === 'function'
  ? fetchWithShop
  : (url, options = {}) => fetch(url, options);

const SHOP_LIST_KEY = 'shops:list';
const SHOP_ID_KEY = 'shop:id';
const SHOP_NAME_KEY = 'shop:name';
const SHOP_CODE_BASE = 1997;
const DEFAULT_SHOP = { id: 'shop-1', name: 'Shop 1', code: String(SHOP_CODE_BASE), isActive: true };

function loadCachedShops() {
  try {
    const cached = JSON.parse(localStorage.getItem(SHOP_LIST_KEY) || '[]');
    if (Array.isArray(cached) && cached.length) {
      return cached.map(normalizeShopPayload).filter(Boolean);
    }
  } catch (err) {
    console.warn('Shop cache parse failed:', err);
  }
  return [normalizeShopPayload(DEFAULT_SHOP)];
}

function cacheShops(list = []) {
  try {
    localStorage.setItem(SHOP_LIST_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Unable to cache shops:', err);
  }
}

function normalizeShopPayload(shop) {
  if (!shop) return null;
  const id = shop.shopId || shop.id || 'shop-1';
  const code = shop.code || codeFromShopId(id);
  const name = shop.name || `Shop ${parseShopIndex(id) || ''}`.trim();
  return {
    id,
    name,
    code,
    isActive: shop.isActive !== false,
    createdAt: shop.createdAt ? new Date(shop.createdAt).toISOString() : undefined,
    updatedAt: shop.updatedAt ? new Date(shop.updatedAt).toISOString() : undefined
  };
}

function parseShopIndex(shopId = '') {
  const match = String(shopId).match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

let shops = loadCachedShops();
let currentShop = (() => {
  const storedId = localStorage.getItem(SHOP_ID_KEY);
  const storedName = localStorage.getItem(SHOP_NAME_KEY);
  const fallback = shops[0] || normalizeShopPayload(DEFAULT_SHOP);
  const target = shops.find(s => s.id === storedId) || fallback;
  return { id: target.id, name: storedName || target.name, code: target.code };
})();
window.currentShop = { ...currentShop };

function setCurrentShop(shop) {
  if (!shop) return;
  currentShop = { id: shop.id, name: shop.name, code: shop.code };
  window.currentShop = { ...currentShop };
  localStorage.setItem(SHOP_ID_KEY, currentShop.id);
  localStorage.setItem(SHOP_NAME_KEY, currentShop.name);
}

function setShopError(message = '') {
  const banner = document.getElementById('shop-error-banner');
  if (!banner) return;
  if (message) {
    const esc = (typeof window.escapeHtml === 'function')
      ? window.escapeHtml
      : (str = '') => String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
    banner.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${esc(message)}</span>`;
    banner.classList.add('is-visible');
  } else {
    banner.textContent = '';
    banner.classList.remove('is-visible');
  }
}

function ensureCurrentShop() {
  if (!shops.length) {
    shops = [normalizeShopPayload(DEFAULT_SHOP)];
  }
  const storedId = localStorage.getItem(SHOP_ID_KEY);
  const target = shops.find(s => s.id === storedId) || shops[0];
  setCurrentShop(target);
  return currentShop;
}

async function fetchShopsFromServer({ silent = false } = {}) {
  try {
    const res = await shopAwareFetch(`${API_BASE}/shops`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Failed to load shops (${res.status})`);
    const payload = await res.json();
    const list = Array.isArray(payload) && payload.length
      ? payload.map(normalizeShopPayload).filter(Boolean)
      : [normalizeShopPayload(DEFAULT_SHOP)];
    shops = list;
    cacheShops(list);
  } catch (err) {
    if (!silent) {
      console.error('load shops failed:', err);
      showToast?.(err.message || 'Could not load shops from server.');
      setShopError(err.message || 'Failed to load shops.');
    }
  } finally {
    ensureCurrentShop();
    if (!silent) {
      renderShopButtons();
      updateHeaderBadge();
    } else if (document.readyState !== 'loading') {
      renderShopButtons();
      updateHeaderBadge();
    }
  }
}

const shopsReady = fetchShopsFromServer({ silent: true });
window.shopsReady = shopsReady;

function renderShopButtons() {
  const nav = document.getElementById('shop-nav') || document.querySelector('.shop-nav');
  if (!nav) return;

  nav.innerHTML = '';
  if (!shops.length) return;
  const activeCount = shops.filter(s => s.isActive !== false).length;
  setShopError('');

  shops.forEach((shop) => {
    const wrap = document.createElement('div');
    wrap.className = 'shop-entry';

    const btn = document.createElement('button');
    btn.className = 'shop-btn' + (shop.id === currentShop.id ? ' active' : '');
    btn.type = 'button';
    btn.textContent = shop.name;
    if (shop.isActive === false) btn.classList.add('is-inactive');
    if (shop.isActive === false) {
      btn.disabled = true;
      btn.title = 'Activate this shop to switch.';
    } else {
      btn.onclick = () => switchShop(shop.id);
    }
    wrap.appendChild(btn);

    const controls = document.createElement('div');
    controls.className = 'shop-entry-controls';

    const actions = document.createElement('button');
    actions.className = 'shop-control-btn';
    actions.type = 'button';
    actions.title = 'Shop options';
    actions.innerHTML = '⋯';
    controls.appendChild(actions);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'shop-control-btn shop-control-delete';
    deleteBtn.type = 'button';
    deleteBtn.title = 'Delete shop';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteShopConfirm(shop.id);
    };
    const deleteDisabled = shops.length <= 1 || (shop.isActive !== false && activeCount <= 1);
    deleteBtn.disabled = deleteDisabled;
    if (deleteDisabled) {
      deleteBtn.title = 'At least one active shop must remain.';
    }
    controls.appendChild(deleteBtn);
    wrap.appendChild(controls);

    const menu = document.createElement('div');
    menu.className = 'shop-menu';
    const toggleLabel = shop.isActive === false ? 'Activate shop' : 'Deactivate shop';
    menu.innerHTML = `
      <button type="button" data-act="rename">Rename</button>
      <button type="button" data-act="toggle">${toggleLabel}</button>
      <button type="button" data-act="delete" class="shop-danger">Delete shop</button>
    `;
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = e.target?.dataset?.act;
      menu.classList.remove('show');
      if (act === 'rename') renameShopPrompt(shop.id);
      if (act === 'toggle') toggleShopActive(shop.id);
      if (act === 'delete') deleteShopConfirm(shop.id);
    });
    const toggleBtn = menu.querySelector('[data-act="toggle"]');
    if (toggleBtn && shop.isActive && activeCount <= 1) {
      toggleBtn.disabled = true;
      toggleBtn.title = 'At least one shop must remain active.';
    }

    actions.onclick = (e) => {
      e.stopPropagation();
      closeAllShopMenus();
      menu.classList.add('show');
      setTimeout(() => {
        const off = (ev) => {
          if (!menu.contains(ev.target) && ev.target !== actions) {
            menu.classList.remove('show');
            document.removeEventListener('click', off);
          }
        };
        document.addEventListener('click', off);
      }, 0);
    };

    wrap.appendChild(menu);
    nav.appendChild(wrap);
  });

  const addEntry = document.createElement('div');
  addEntry.className = 'shop-entry shop-entry--add';
  const add = document.createElement('button');
  add.className = 'shop-btn add-shop';
  add.type = 'button';
  add.innerHTML = `<i class="fas fa-plus"></i> Add Shop`;
  add.onclick = createAndSwitchShop;
  addEntry.appendChild(add);
  nav.appendChild(addEntry);
}

function closeAllShopMenus() {
  document.querySelectorAll('.shop-menu.show').forEach((el) => el.classList.remove('show'));
}

async function createAndSwitchShop() {
  try {
    await shopsReady;
    const suggested = `Shop ${shops.length + 1}`;
    const name = await openPrompt({
      title: 'Add Shop',
      message: 'Shop name:',
      value: suggested,
      placeholder: 'e.g., Berlin West'
    });
    if (name === null) return;
    const payload = { name: name.trim() || suggested };
    const res = await shopAwareFetch(`${API_BASE}/shops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || `Failed to create shop (${res.status})`);
    }
    const created = normalizeShopPayload(await res.json());
    await fetchShopsFromServer();
    await switchShop(created?.id || created?.shopId);
    showToast?.('Shop created');
    setShopError('');
  } catch (err) {
    console.error('create shop failed:', err);
    showToast?.(err.message || 'Could not create shop.');
    setShopError(err.message || 'Failed to create shop.');
  }
}

async function renameShopPrompt(id) {
  await shopsReady;
  const shop = shops.find(s => s.id === id);
  if (!shop) return;
  const name = await openPrompt({
    title: 'Rename Shop',
    message: 'New shop name:',
    value: shop.name,
    placeholder: 'e.g., Downtown Branch'
  });
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) {
    showToast?.('Shop name cannot be empty.');
    return;
  }
  try {
    const res = await shopAwareFetch(`${API_BASE}/shops/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: trimmed })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || `Rename failed (${res.status})`);
    }
    await fetchShopsFromServer();
    if (currentShop.id === id) {
      const updated = shops.find(s => s.id === id);
      if (updated) setCurrentShop(updated);
      updateHeaderBadge();
    }
    showToast?.('Shop renamed');
    setShopError('');
  } catch (err) {
    console.error('rename shop failed:', err);
    showToast?.(err.message || 'Could not rename shop.');
    setShopError(err.message || 'Rename failed.');
  }
}

async function deleteShopConfirm(id) {
  await shopsReady;
  const shop = shops.find(s => s.id === id);
  if (!shop) return;
  if (shops.length <= 1) {
    showToast?.('You must keep at least one shop.');
    return;
  }
  const ok = await openConfirm({
    title: 'Delete Shop',
    message: `Delete “${shop.name}” and all its inventory? This cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    danger: true
  });
  if (!ok) return;
  await deleteShop(id);
}

async function deleteShop(id) {
  try {
    const remainingActive = shops.filter(s => s.id !== id && s.isActive !== false).length;
    if (!remainingActive) {
      showToast?.('At least one active shop must remain.');
      setShopError('At least one active shop must remain.');
      return;
    }
    const res = await shopAwareFetch(`${API_BASE}/shops/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || `Delete failed (${res.status})`);
    }
    // purge per-shop caches
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${id}:`)) localStorage.removeItem(key);
    });
    await fetchShopsFromServer();
    if (!shops.find(s => s.id === currentShop.id)) {
      ensureCurrentShop();
      await switchShop(currentShop.id);
    } else {
      renderShopButtons();
      updateHeaderBadge();
    }
    showToast?.('Shop deleted');
    setShopError('');
  } catch (err) {
    console.error('delete shop failed:', err);
    showToast?.(err.message || 'Could not delete shop.');
    setShopError(err.message || 'Delete failed.');
  }
}

async function switchShop(id) {
  await shopsReady;
  const target = shops.find(s => s.id === id);
  if (!target) {
    await fetchShopsFromServer({ silent: true });
  }
  const finalTarget = shops.find(s => s.id === id) || shops[0];
  if (!finalTarget) return;
  if (finalTarget.isActive === false) {
    showToast?.('Activate this shop before switching.');
    setShopError('Activate this shop before switching.');
    return;
  }

  try { stopAutoRefresh?.(); } catch {}

  setCurrentShop(finalTarget);
  window.dispatchEvent(new Event('shop:switched'));

  // Clear client-side caches
  try {
    products = [];
    currentPage = 1;
    serverTotalProducts = 0;
    if (typeof _lastSig !== 'undefined') _lastSig = '';
    if (typeof _refreshBackoffMs !== 'undefined') _refreshBackoffMs = 0;
  } catch {}

  renderShopButtons?.();
  updateHeaderBadge();

  // Reload shop-scoped data
  try { await loadProducts?.(); } catch {}
  try { await loadMetrics?.(); } catch {}
  try { updateNotificationBadges?.(); } catch {}
  try { updateRestockBadgeFallback?.(); } catch {}
  try { refreshDuplicateBadge?.(); } catch {}
  try { await loadWarehouses?.(); } catch {}
  try { await loadPurchaseOrders?.(); } catch {}

  try { startAutoRefresh?.(); } catch {}
  showToast?.(`Switched to ${finalTarget.name}`);
}

function updateHeaderBadge() {
  const h1 = document.querySelector('header h1');
  if (!h1) return;
  const shop = shops.find(s => s.id === currentShop.id) || currentShop;
  const code = shop.code || codeFromShopId(shop.id);
  h1.setAttribute('data-shop', `${shop.name}.${code}`);
}

function getCurrentShopId() {
  return currentShop?.id || 'shop-1';
}

function codeFromShopId(shopId) {
  const idx = parseShopIndex(shopId);
  if (idx > 0) return String(SHOP_CODE_BASE - 1 + idx);
  return String(SHOP_CODE_BASE);
}

document.addEventListener('DOMContentLoaded', () => {
  ensureCurrentShop();
  renderShopButtons();
  updateHeaderBadge();
  shopsReady.finally(() => {
    ensureCurrentShop();
    renderShopButtons();
    updateHeaderBadge();
  });
});

// ---------- Simple modals (confirm/prompt) ----------
(function () {
  const overlay = document.getElementById('modal-overlay');
  const modals = [document.getElementById('confirm-modal'), document.getElementById('prompt-modal')];

  function open(modal) {
    overlay?.classList.add('show'); modal?.classList.add('show');
    setTimeout(() => modal?.querySelector('button,[href],input,select,textarea')?.focus(), 0);
    document.addEventListener('keydown', onKey);
  }
  function close(modal) {
    overlay?.classList.remove('show'); modal?.classList.remove('show');
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') {
      const openModal = modals.find(m => m?.classList.contains('show'));
      if (openModal) {
        openModal.querySelector('[data-close]')?.click();
      }
    }
  }
  window.openConfirm = function ({ title = 'Confirm', message = 'Are you sure?', confirmText = 'OK', cancelText = 'Cancel', danger = false } = {}) {
    return new Promise(resolve => {
      const modal = document.getElementById('confirm-modal');
      modal.querySelector('#confirm-title').textContent = title;
      modal.querySelector('#confirm-desc').textContent = message;
      const icon = modal.querySelector('.modal-icon');
      icon.classList.toggle('danger', !!danger);
      const btnCancel = modal.querySelector('[data-close]');
      const btnConfirm = modal.querySelector('[data-confirm]');
      btnConfirm.textContent = confirmText; btnCancel.textContent = cancelText;
      const clean = () => {
        btnCancel.removeEventListener('click', onCancel);
        btnConfirm.removeEventListener('click', onOk);
        overlay?.removeEventListener('click', onCancel);
        close(modal);
      };
      const onCancel = () => { clean(); resolve(false); };
      const onOk = () => { clean(); resolve(true); };
      btnCancel.addEventListener('click', onCancel);
      overlay?.addEventListener('click', onCancel);
      btnConfirm.addEventListener('click', onOk);
      open(modal);
    });
  };
  window.openPrompt = function ({ title = 'Input', message = 'Enter a value', value = '', placeholder = '' } = {}) {
    return new Promise(resolve => {
      const modal = document.getElementById('prompt-modal');
      modal.querySelector('#prompt-title').textContent = title;
      modal.querySelector('#prompt-desc').textContent = message;
      const input = modal.querySelector('#prompt-input');
      input.value = value || '';
      input.placeholder = placeholder || '';
      const btnCancel = modal.querySelector('[data-close]');
      const btnSubmit = modal.querySelector('[data-submit]');
      const clean = () => {
        btnCancel.removeEventListener('click', onCancel);
        btnSubmit.removeEventListener('click', onSubmit);
        overlay?.removeEventListener('click', onCancel);
        modal.removeEventListener('keydown', onEnter);
        close(modal);
      };
      const onCancel = () => { clean(); resolve(null); };
      const onSubmit = () => { clean(); resolve(input.value.trim()); };
      const onEnter = (e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(); } };
      btnCancel.addEventListener('click', onCancel);
      overlay?.addEventListener('click', onCancel);
      btnSubmit.addEventListener('click', onSubmit);
      modal.addEventListener('keydown', onEnter);
      open(modal);
    });
  };
})();

// Expose helpers globally
window.renderShopButtons = renderShopButtons;
window.getCurrentShopId = getCurrentShopId;
window.codeFromShopId = codeFromShopId;
window.switchShop = switchShop;
window.toggleShopActive = toggleShopActive;

async function toggleShopActive(id) {
  await shopsReady;
  const shop = shops.find(s => s.id === id);
  if (!shop) return;
  const nextState = !shop.isActive;
    if (!nextState) {
      const activeCount = shops.filter(s => s.isActive !== false).length;
      if (activeCount <= 1) {
        showToast?.('At least one shop must remain active.');
        setShopError('At least one shop must remain active.');
        return;
      }
    }
  try {
    const res = await shopAwareFetch(`${API_BASE}/shops/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ isActive: nextState })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || `Update failed (${res.status})`);
    }
    await fetchShopsFromServer();
    const updated = shops.find(s => s.id === id);
    if (updated?.isActive === false && currentShop.id === id) {
      const fallback = shops.find(s => s.isActive !== false && s.id !== id) || shops.find(s => s.isActive !== false) || shops[0];
      if (fallback) {
        await switchShop(fallback.id);
      }
    } else {
      ensureCurrentShop();
      renderShopButtons();
      updateHeaderBadge();
    }
    showToast?.(nextState ? 'Shop activated' : 'Shop deactivated');
    setShopError('');
  } catch (err) {
    console.error('toggle shop active failed:', err);
    showToast?.(err.message || 'Could not update shop status.');
    setShopError(err.message || 'Update failed.');
  }
}
