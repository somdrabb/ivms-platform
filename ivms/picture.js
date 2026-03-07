//picture.js
window.API_BASE = 'http://localhost:4000/api';
(function () {
  if (window.__hasServerPictureHook) return;
  // ------------ DOM refs (existing IDs from your markup) ------------
  const FILE_INPUT = document.getElementById('picture-file-input');
  const PREVIEW_IMG = document.getElementById('picture-preview-img');
  const HIDDEN_DATA = document.getElementById('picture-data-url'); // kept, not required
  const SAVE_BTN = document.getElementById('save-button');
  const EAN_INPUT = document.getElementById('ean-input');
  const URL_INPUT = document.getElementById('picture-url-input');
  const URL_LOAD_BTN = document.getElementById('picture-url-load');
  const TBL = document.getElementById('inventory-table');
  const TBODY = document.getElementById('inventory-body');
  const shopFetch = typeof fetchWithShop === 'function'
    ? fetchWithShop
    : (url, options = {}) => fetch(url, options);
  // ------------ IndexedDB helpers ------------
  const DB_NAME = 'ivms97DB';
  const STORE_NAME = 'pictures';
  let dbPromise = null;
  function openDB() {
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
  }
  async function upsertPicture(ean, blob, mime) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ ean, blob, mime: mime || blob.type || 'image/png', updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function getPictureBlob(ean) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ean);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  }
  // ------------ Utilities ------------
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
      width: '88px',
      height: '88px',
      borderRadius: '10px',
      objectFit: 'cover',
      background: '#f1f5f9',
      boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)'
    });
    img.alt = 'Product picture';
    td.appendChild(img);
    return td;
  }
  // keep track of object URLs to revoke later
  const objectURLCache = new WeakMap(); // imgElement -> objectURL
  async function setRowPicture(tr) {
    const ean = getEANFromRow(tr);
    if (!ean) return;
    // ensure cell at index 0 is the picture cell
    let picCell = tr.children[0];
    if (!(picCell && picCell.classList && picCell.classList.contains('picture-cell'))) {
      const newCell = createPictureCell();
      tr.insertBefore(newCell, tr.firstElementChild);
      picCell = newCell;
    }
    const img = picCell.querySelector('img');
    const blob = await getPictureBlob(ean);
    // revoke old object URL if any
    const prevURL = objectURLCache.get(img);
    if (prevURL) {
      URL.revokeObjectURL(prevURL);
      objectURLCache.delete(img);
    }
    if (blob) {
      const url = URL.createObjectURL(blob);
      img.src = url;
      objectURLCache.set(img, url);
      img.style.visibility = 'visible';
    } else {
      img.removeAttribute('src');
      img.style.visibility = 'hidden'; // keeps layout without showing broken image
    }
  }
  async function refreshAllRowPictures() {
    const rows = TBODY.querySelectorAll('tr');
    for (const tr of rows) {
      await setRowPicture(tr);
    }
  }
  // ------------ File/URL intake ------------
  let pendingBlob = null; // last selected or loaded blob to be saved with this product
  const ctx = window.__pictureUploadContext || (window.__pictureUploadContext = {});
  ctx.hasPending = () => !!pendingBlob;
  ctx.peekPending = () => pendingBlob;

  function clearPendingPreview() {
    pendingBlob = null;
    if (PREVIEW_IMG) {
      PREVIEW_IMG.style.display = 'none';
      PREVIEW_IMG.removeAttribute('src');
    }
    if (HIDDEN_DATA) HIDDEN_DATA.value = '';
  }
  if (FILE_INPUT) {
    FILE_INPUT.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { clearPendingPreview(); return; }
      try {
        pendingBlob = file;
        ctx.hasPending = () => !!pendingBlob;
        ctx.peekPending = () => pendingBlob;
        const fr = new FileReader();
        fr.onload = () => {
          if (HIDDEN_DATA) HIDDEN_DATA.value = fr.result; // optional legacy field
          if (PREVIEW_IMG) {
            PREVIEW_IMG.src = fr.result;
            PREVIEW_IMG.style.display = 'inline-block';
          }
        };
        fr.readAsDataURL(file);
      } catch (err) {
        console.error('Failed to read picture file:', err);
        clearPendingPreview();
      }
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
        pendingBlob = blob;
        ctx.hasPending = () => !!pendingBlob;
        ctx.peekPending = () => pendingBlob;

        // preview
        const reader = new FileReader();
        reader.onload = () => {
          if (HIDDEN_DATA) HIDDEN_DATA.value = reader.result; // optional legacy
          if (PREVIEW_IMG) {
            PREVIEW_IMG.src = reader.result;
            PREVIEW_IMG.style.display = 'inline-block';
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to load image from URL:', err);
        alert('Could not load image from the provided URL.');
        clearPendingPreview();
      }
    });
  }
  // ------------ Hook into Save (augment, do NOT block) ------------
  if (!ctx.uploadForEAN) {
    ctx.uploadForEAN = async (ean) => {
      if (!(ean && pendingBlob)) return null;
      const form = new FormData();
      form.append('picture', pendingBlob, 'upload.' + (pendingBlob.type?.split('/')[1] || 'bin'));
      const base = (window.API_BASE || '').replace(/\/$/, '') || '/api';
      const endpoint = `${base}/products/picture/by-ean/${encodeURIComponent(ean)}`;
      const resp = await shopFetch(endpoint, { method: 'POST', body: form });
      if (!resp.ok) throw new Error('Upload failed: ' + resp.status);
      const json = await resp.json().catch(() => ({}));
      return json?.url || null;
    };
  }
  if (!ctx.clearPending) ctx.clearPending = clearPendingPreview;
  if (!ctx.refreshInventoryPictures) ctx.refreshInventoryPictures = refreshAllRowPictures;

  // ------------ React to table changes ------------
  const observer = new MutationObserver(() => {
    refreshAllRowPictures();
  });
  observer.observe(TBODY, { childList: true });
  // initial paint
  // (ensure "Picture" header exists at index 0; you already added it in <thead>)
  const style = document.createElement('style');
  style.textContent = `
  .inventory-table th[data-column="picture"] { width: 110px; text-align: center; }
  .inventory-table td.picture-cell { text-align: center; padding: 6px; }
  .inventory-table td.picture-cell img { width: 88px; height: 88px; border-radius: 10px; object-fit: cover; box-shadow: 0 6px 18px rgba(15,23,42,0.12); }
`;
  document.head.appendChild(style);
  refreshAllRowPictures();
})();
//++++++++
/**
 * IVMS-97 Enhancer: Cost + Profit% + Stock Status + Expiry + QR
 * Works with your current headers and rows; non-intrusive.
 */
(function () {
  const TBL = document.getElementById('inventory-table');
  const TBODY = document.getElementById('inventory-body');
  if (!TBL || !TBODY) return;
  /* ---------- helpers ---------- */
  function idxOf(col) {
    const ths = TBL.querySelectorAll('thead th');
    for (let i = 0; i < ths.length; i++) {
      if ((ths[i].dataset.column || '') === col) return i;
    }
    return -1;
  }
  function getTextCell(tr, col) {
    const i = idxOf(col);
    if (i < 0 || i >= tr.children.length) return '';
    return tr.children[i].textContent.trim();
  }
  function ensureCell(tr, col) {
    const i = idxOf(col);
    if (i < 0) return null;
    while (tr.children.length <= i) tr.appendChild(document.createElement('td'));
    return tr.children[i];
  }
  /* small cache for product lookups by EAN */
  const cache = new Map(); // ean -> product
  async function fetchProductByEAN(ean) {
    if (!ean) return null;
    if (cache.has(ean)) return cache.get(ean);
    try {
      const r = await shopFetch(`/api/products/search?ean=${encodeURIComponent(ean)}&limit=1`);
      if (!r.ok) { cache.set(ean, null); return null; }
      const json = await r.json();
      const p = (json?.data && json.data[0]) || null;
      cache.set(ean, p);
      return p;
    } catch { cache.set(ean, null); return null; }
  }
  /* calculators/formatters */
  const num = v => Number.parseFloat(String(v).replace(',', '.'));
  function calcMargin(price, cost) {
    price = num(price); cost = num(cost);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(cost)) return null;
    return ((price - cost) / price) * 100;
  }
  function fmtPct(n) {
    if (!Number.isFinite(n)) return '—';
    return (Math.round(n * 10) / 10).toFixed(1) + '%';
  }
  function statusBadge(amount, reorderLevel) {
    amount = Number.parseInt(amount, 10);
    reorderLevel = Number.parseInt(reorderLevel ?? 10, 10);
    const s = document.createElement('span'); s.className = 'stock-badge';
    if (!Number.isFinite(amount) || amount <= 0) { s.classList.add('stock-out'); s.textContent = 'Out of Stock'; }
    else if (amount <= reorderLevel) { s.classList.add('stock-low'); s.textContent = 'Low Stock'; }
    else { s.classList.add('stock-ok'); s.textContent = 'In Stock'; }
    return s;
  }
  function qrImg(ean) {
    const img = document.createElement('img');
    img.className = 'qr-img';
    img.alt = 'QR';
    img.loading = 'lazy';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(ean)}`;
    return img;
  }
  /* enhance a single row */
  async function enhanceRow(tr) {
    const ean = getTextCell(tr, 'ean');
    const price = num(getTextCell(tr, 'price'));
    // try to read cost/reorder/expiry from existing cells, otherwise from API
    let cost = num(getTextCell(tr, 'cost'));
    let reorderLevel;

    if (!Number.isFinite(cost)) {
      const p = await fetchProductByEAN(ean);
      if (p) cost = num(p.cost);
    } else {
      fetchProductByEAN(ean); // warm cache for others
    }
    {
      const p = cache.get(ean);
      if (p) {
        if (reorderLevel === undefined) reorderLevel = p.reorderLevel ?? 10;
        // add to model if you want to persist
      }
    }

    /* fill Cost */
    const costTd = ensureCell(tr, 'cost');
    if (costTd) costTd.textContent = Number.isFinite(cost) ? cost.toFixed(2) : '—';

    /* fill Profit % */
    const marginTd = ensureCell(tr, 'margin');
    if (marginTd) {
      marginTd.innerHTML = '';
      const m = calcMargin(price, cost);
      const span = document.createElement('span');
      span.className = 'profit-badge ' + (m >= 0 ? 'profit-pos' : 'profit-neg');
      span.textContent = m === null ? '—' : (m >= 0 ? '+' : '') + fmtPct(m);
      marginTd.appendChild(span);
    }

    /* fill Stock Status — REPLACE THIS WHOLE BLOCK */
    const statusTd = ensureCell(tr, 'status');
    if (statusTd) {
      // 1) Prefer the <input id="amount-..."> inside this row
      let n;
      const amountInput = tr.querySelector('input[id^="amount-"]');
      if (amountInput) {
        n = parseInt(amountInput.value, 10);
      } else {
        // 2) Fallback: try to pull the last integer from the cell text
        const raw = getTextCell(tr, 'amount') || '';
        const nums = raw.match(/-?\d+/g);
        n = nums ? parseInt(nums[nums.length - 1], 10) : NaN;
      }
      if (!Number.isFinite(n)) n = 0;
      statusTd.innerHTML = '';
      if (n < 1) statusTd.innerHTML = `<span class="stock-badge stock-out">Out of Stock</span>`;
      else if (n < 5) statusTd.innerHTML = `<span class="stock-badge stock-low">Low Stock</span>`;
      else if (n > 50) statusTd.innerHTML = `<span class="stock-badge stock-high">High Stock</span>`;
      else statusTd.innerHTML = `<span class="stock-badge stock-medium">Medium Stock</span>`;
    }
    /* fill QR */
    const qrTd = ensureCell(tr, 'barcode');
    if (qrTd) {
      qrTd.innerHTML = '';
      if (ean) qrTd.appendChild(qrImg(ean));
      else qrTd.textContent = '—';
    }
  }
  function enhanceAll() {
    const rows = TBODY.querySelectorAll('tr');
    rows.forEach(r => enhanceRow(r));
  }
  /* run initially and whenever rows change */
  const obs = new MutationObserver(enhanceAll);
  obs.observe(TBODY, { childList: true });
  enhanceAll();
})();


// ---- NEW HELPERS ----
// REPLACE the old stockStatusBadge(...)
function stockStatusBadge(amount) {
  const n = Number.parseInt(amount, 10) || 0;
  if (n < 1) return `<span class="stock-badge stock-out">Out of Stock</span>`;
  if (n < 5) return `<span class="stock-badge stock-low">Low Stock</span>`;
  if (n > 50) return `<span class="stock-badge stock-high">High Stock</span>`;
  return `<span class="stock-badge stock-medium">Medium Stock</span>`; // 5–50 inclusive -> Medium
}
function profitPercent(price, cost) {
  const p = Number(price) || 0;
  const c = Number(cost) || 0;
  if (p <= 0) return null;
  return ((p - c) / p) * 100;
}
function formatProfit(pct) {
  if (pct === null) return '—';
  const v = Math.round(pct * 10) / 10;
  const sign = v >= 0 ? '+' : '';
  const cls = v >= 0 ? 'profit-pos' : 'profit-neg';
  return `<span class="profit-badge ${cls}">${sign}${v.toFixed(1)}%</span>`;
}
// Use bwip-js API to render a real barcode image from the EAN
function barcodeUrlFromEAN(ean) {
  const t = String(ean || '').trim();
  if (!t) return '';
  // choose symbology by length
  const bcid = t.length === 8 ? 'ean8' : 'ean13';
  return `https://bwipjs-api.metafloor.com/?bcid=${bcid}&text=${encodeURIComponent(t)}&includetext&scale=2`;
}
function fillQrCell(td, ean){
  td.className = 'qr-cell';
  td.innerHTML = '<div class="qr"></div>';
  new QRCode(td.firstChild, {
    text: String(ean || ''),
    width: 84,
    height: 84,
    correctLevel: QRCode.CorrectLevel.M
  });
}
