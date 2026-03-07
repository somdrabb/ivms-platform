const DEFAULT_API_BASE = 'http://127.0.0.1:4000/api';
const originBase = window.location.origin && window.location.origin.startsWith('http')
  ? `${window.location.origin.replace(/\/$/, '')}/api`
  : DEFAULT_API_BASE;
const API_BASE = (window.API_BASE || originBase).replace(/\/$/, '');

const params = new URLSearchParams(window.location.search);
const state = {
  shopId: params.get('shop') || 'shop-1',
  shopName: params.get('name') ? decodeURIComponent(params.get('name')) : null,
  category: 'all',
  availability: 'all',
  sort: params.get('sort') || 'featured',
  search: '',
  products: [],
  filtered: [],
  categories: new Set()
};

const els = {
  storeName: document.getElementById('store-name'),
  storeSubtitle: document.getElementById('store-subtitle'),
  shopId: document.getElementById('shop-id'),
  searchInput: document.getElementById('search-input'),
  sortSelect: document.getElementById('sort-select'),
  categoryList: document.getElementById('category-list'),
  statusBanner: document.getElementById('status-banner'),
  productGrid: document.getElementById('product-grid'),
  template: document.getElementById('product-card-template')
};

function cls(el, ...classes) {
  el.className = classes.filter(Boolean).join(' ');
}

function setStatus(message = '', { tone = 'info' } = {}) {
  if (!els.statusBanner) return;
  if (!message) {
    els.statusBanner.textContent = '';
    els.statusBanner.classList.remove('show', 'is-error', 'is-success');
    return;
  }
  els.statusBanner.textContent = message;
  els.statusBanner.classList.add('show');
  els.statusBanner.classList.toggle('is-error', tone === 'error');
  els.statusBanner.classList.toggle('is-success', tone === 'success');
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    mode: 'cors',
    cache: 'no-store',
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    let message = `Request failed (${res.status})`;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed?.error) message = parsed.error;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);
}

function deriveProductImage(product) {
  const pictureUrl = product.pictureUrl || '';
  if (pictureUrl.startsWith('http')) return pictureUrl;
  if (pictureUrl) {
    return `${window.location.origin.replace(/\/$/, '')}${pictureUrl.startsWith('/') ? '' : '/'}${pictureUrl}`;
  }
  const initials = encodeURIComponent((product.name || '?').slice(0, 1).toUpperCase());
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23e2e8f0"/><text x="50%" y="52%" text-anchor="middle" dy=".25em" font-size="96" font-family="Segoe UI,Arial,sans-serif" fill="%2360748b">${initials}</text></svg>`;
}

function buildCategorySet(products) {
  const set = new Set();
  for (const item of products) {
    if (item.category) set.add(item.category);
    if (item.primaryCategory) set.add(item.primaryCategory);
    if (item.secondaryCategory) set.add(item.secondaryCategory);
  }
  return set;
}

function renderCategories() {
  if (!els.categoryList) return;
  els.categoryList.innerHTML = '';
  const frag = document.createDocumentFragment();

  const addChip = (label, value, active = false) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${active ? ' is-active' : ''}`;
    btn.textContent = label;
    btn.dataset.category = value;
    frag.appendChild(btn);
  };

  addChip('All products', 'all', state.category === 'all');
  Array.from(state.categories)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .forEach(cat => addChip(cat, cat, state.category === cat));

  els.categoryList.appendChild(frag);
}

function summarizeAvailability(product) {
  const amount = Number(product.amount) || 0;
  const reorder = Number(product.reorderLevel) || 0;
  if (amount <= 0) return { tone: 'danger', label: 'Out of stock' };
  if (reorder > 0 && amount <= reorder) return { tone: 'warning', label: `Low · ${amount}` };
  return { tone: 'success', label: `In stock · ${amount}` };
}

function matchesSearch(product, query) {
  if (!query) return true;
  const haystack = [
    product.name,
    product.brand,
    product.shortDesc,
    product.longDesc,
    product.sku,
    product.ean,
    product.plu,
    product.category,
    product.primaryCategory,
    product.secondaryCategory
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function filterProducts() {
  const { availability, category, search, sort } = state;
  const query = search.trim().toLowerCase();
  const filtered = state.products.filter(product => {
    if (category !== 'all') {
      const categories = [
        product.category,
        product.primaryCategory,
        product.secondaryCategory
      ].map(v => (v || '').toLowerCase());
      if (!categories.includes(category.toLowerCase())) return false;
    }

    const amount = Number(product.amount) || 0;
    const reorder = Number(product.reorderLevel) || 0;
    if (availability === 'in-stock' && amount <= 0) return false;
    if (availability === 'low-stock' && !(amount > 0 && (reorder ? amount <= reorder : amount <= 5))) return false;
    if (availability === 'out-of-stock' && amount > 0) return false;

    return matchesSearch(product, query);
  });

  const sorted = [...filtered];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
    case 'price-desc':
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    case 'name':
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'newest':
      sorted.sort((a, b) => (Number(b.updatedAtMs) || 0) - (Number(a.updatedAtMs) || 0));
      break;
    default:
      sorted.sort((a, b) => {
        const aWeight = Number(b.amount > 0) - Number(a.amount > 0);
        if (aWeight !== 0) return aWeight;
        return (Number(b.updatedAtMs) || 0) - (Number(a.updatedAtMs) || 0);
      });
      break;
  }
  state.filtered = sorted;
}

function renderProducts() {
  if (!els.productGrid) return;
  filterProducts();

  if (!state.filtered.length) {
    els.productGrid.innerHTML = `
      <div class="empty-state">
        <strong>No products found</strong>
        Adjust your filters or check back once new items are synced from the back office.
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  for (const product of state.filtered) {
    const card = els.template.content.firstElementChild.cloneNode(true);
    const imgEl = card.querySelector('img');
    imgEl.src = deriveProductImage(product);
    imgEl.alt = product.name || 'Product image';

    const stock = summarizeAvailability(product);
    const stockEl = card.querySelector('.product-stock');
    stockEl.textContent = stock.label;
    stockEl.style.backgroundColor =
      stock.tone === 'danger' ? 'rgba(220,38,38,0.88)' :
      stock.tone === 'warning' ? 'rgba(217,119,6,0.88)' :
      'rgba(22,163,74,0.88)';

    card.querySelector('.product-name').textContent = product.name || 'Unnamed product';
    const brandEl = card.querySelector('.product-brand');
    brandEl.textContent = product.brand || '';
    brandEl.style.display = product.brand ? 'block' : 'none';

    const descEl = card.querySelector('.product-desc');
    descEl.textContent = product.shortDesc || product.longDesc || '';
    descEl.style.display = descEl.textContent ? 'block' : 'none';

    card.querySelector('.product-price').textContent = formatCurrency(product.price);
    card.querySelector('.product-sku').textContent =
      product.sku || product.ean || product.plu || '—';
    card.querySelector('.product-category').textContent =
      product.category || product.primaryCategory || product.secondaryCategory || '—';

    const pill = card.querySelector('.product-pill');
    const promo = product.promoPrice ? Number(product.promoPrice) : null;
    if (promo && Number.isFinite(promo)) {
      pill.textContent = `Promo ${formatCurrency(promo)}`;
      pill.style.background = 'rgba(220,38,38,0.15)';
      pill.style.color = '#991b1b';
    } else {
      const updated = product.updatedAt ? new Date(product.updatedAt) : null;
      if (updated) {
        const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
        pill.textContent = `Updated ${formatter.format(updated)}`;
      } else {
        pill.textContent = '';
      }
    }
    pill.style.display = pill.textContent ? 'inline-flex' : 'none';

    const actionBtn = card.querySelector('.product-action');
    actionBtn.addEventListener('click', () => {
      const summary = [
        `Shop: ${state.shopId}`,
        `Product: ${product.name || 'Unnamed product'}`,
        `Price: ${formatCurrency(product.price)}`,
        `SKU: ${product.sku || '—'}`,
        product.ean ? `EAN: ${product.ean}` : '',
        product.plu ? `PLU: ${product.plu}` : ''
      ].filter(Boolean).join('\n');
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(summary).then(() => {
          setStatus('Product details copied to clipboard.', { tone: 'success' });
          setTimeout(() => setStatus(''), 2400);
        }).catch(() => {
          alert(summary);
        });
      } else {
        alert(summary);
      }
    });

    frag.appendChild(card);
  }
  els.productGrid.innerHTML = '';
  els.productGrid.appendChild(frag);
}

async function loadShopMetadata() {
  try {
    const shops = await fetchJSON(`${API_BASE}/shops`);
    const match = shops.find(shop => shop.id === state.shopId);
    if (!match) return;
    state.shopName = match.name;
    if (els.storeName) els.storeName.textContent = match.name || 'Online Storefront';
    if (els.storeSubtitle) {
      els.storeSubtitle.textContent = `Browse products synced from ${match.name || 'this shop'}.`;
    }
  } catch (err) {
    console.warn('Shop metadata fetch failed:', err);
  }
}

async function loadProducts() {
  setStatus('Loading products…');
  try {
    const url = new URL(`${API_BASE}/products`);
    url.searchParams.set('limit', '500');
    url.searchParams.set('shop', state.shopId);
    url.searchParams.set('sort', 'updatedAt');
    url.searchParams.set('dir', 'desc');
    const payload = await fetchJSON(url.toString());
    const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    state.products = list;
    state.categories = buildCategorySet(list);
    renderCategories();
    renderProducts();
    if (!list.length) {
      setStatus('No products were returned for this shop yet. Add items in the inventory first.', { tone: 'info' });
    } else {
      setStatus(`${list.length} product${list.length === 1 ? '' : 's'} available.`, { tone: 'success' });
      setTimeout(() => setStatus(''), 2500);
    }
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'Failed to load products.', { tone: 'error' });
    els.productGrid.innerHTML = `
      <div class="empty-state">
        <strong>Could not load products</strong>
        ${err.message || 'Please retry later.'}
      </div>`;
  }
}

function bindEvents() {
  if (els.searchInput) {
    els.searchInput.addEventListener('input', (event) => {
      state.search = event.target.value || '';
      renderProducts();
    });
  }

  if (els.sortSelect) {
    els.sortSelect.value = state.sort;
    els.sortSelect.addEventListener('change', (event) => {
      state.sort = event.target.value;
      renderProducts();
    });
  }

  if (els.categoryList) {
    els.categoryList.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-category]');
      if (!btn) return;
      const value = btn.dataset.category || 'all';
      state.category = value;
      Array.from(els.categoryList.querySelectorAll('.chip')).forEach(chip => {
        chip.classList.toggle('is-active', chip === btn);
      });
      renderProducts();
    });
  }

  document.querySelectorAll('.panel [data-availability]').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const value = event.currentTarget.dataset.availability || 'all';
      state.availability = value;
      const container = event.currentTarget.parentElement;
      Array.from(container.querySelectorAll('.chip')).forEach(chip => {
        chip.classList.toggle('is-active', chip === event.currentTarget);
      });
      renderProducts();
    });
  });
}

async function init() {
  const embed = params.get('embed') === '1';
  if (embed) document.body.classList.add('is-embed');

  if (els.shopId) els.shopId.textContent = state.shopId;
  if (state.shopName && els.storeName) {
    els.storeName.textContent = state.shopName;
  }

  bindEvents();
  await loadShopMetadata();
  await loadProducts();
}

init().catch(err => {
  console.error('Storefront init failed:', err);
  setStatus(err.message || 'Failed to initialise storefront.', { tone: 'error' });
});
