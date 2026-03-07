
// excelInlineEdit.js
// Excel-like double-click to edit cells and save on Enter/blur (Esc to cancel).
// This file is self-contained; include it after your other JS files.
// It integrates with globals from your app: `products`, `renderInventory`, `saveProducts`,
// `_currentList`, `_currentFilterType`, `currentPage`, `itemsPerPage`, `changeAmountById`.
//
// How it works:
// - Double‑click a supported table cell to edit (EAN, Name, Price, Weight, Cost).
// - Press Enter or click outside to save; press Esc to cancel.
// - Amount edits are delegated to your existing `changeAmountById` flow.
// - Edits call `saveProducts()` and re-render the current page/filter.
//
// To enable: add <script src="excelInlineEdit.js"></script> at the end of <body> AFTER other scripts.

(function () {
  const TBL = document.getElementById('inventory-table');
  const TBODY = document.getElementById('inventory-body');
  if (window.__rowEditingEnabled) return;
  if (!TBL || !TBODY) return;

  // Map <th data-column="..."> to product field names
  const COLUMN_FIELD_MAP = {
    ean: 'ean',
    plu: 'plu',
    name: 'name',
    price: 'price',
    weight: 'weight',
    cost: 'cost',
    // amount handled specially because your UI uses +/- controls
    // category columns are composite; skip inline edit there
  };

  const NUMERIC_FIELDS = new Set(['price', 'weight', 'cost']);

  function $(s, r = document) { return r.querySelector(s); }
  function $all(s, r = document) { return Array.from(r.querySelectorAll(s)); }

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
    return (cells[eanIdx].textContent || '').trim();
  }

  function getProductIdFromRow(tr) {
    // Find amount input id="amount-<id>"
    const amt = tr.querySelector('input[id^="amount-"]');
    if (amt && amt.id) {
      const id = amt.id.replace(/^amount-/, '');
      if (id) return id;
    }
    return null;
  }

  function findProductForRow(tr) {
    try {
      // Prefer ID lookup (stable even if EAN is edited)
      const pid = getProductIdFromRow(tr);
      if (pid && Array.isArray(window.products)) {
        const byId = window.products.find(p => String(p.id) === String(pid));
        if (byId) return byId;
      }
      // Fallback by EAN
      const ean = getEANFromRow(tr);
      if (ean && Array.isArray(window.products)) {
        const byEan = window.products.find(p => String(p.ean).trim() === ean);
        if (byEan) return byEan;
      }
    } catch {}
    return null;
  }

  const API_BASE = window.API_BASE || 'http://127.0.0.1:4000/api';
  const shopFetch = typeof fetchWithShop === 'function'
    ? fetchWithShop
    : (url, options = {}) => fetch(url, options);

  function coerceValue(field, raw) {
    if (NUMERIC_FIELDS.has(field)) {
      const v = parseFloat(String(raw).replace(',', '.'));
      return Number.isFinite(v) ? v : 0;
    }
    return String(raw ?? '').trim();
  }

  async function commitEdit(tr, td, input, field) {
    const product = findProductForRow(tr);
    if (!product) { cancelEdit(td, input); return; }

    const productId = product.id || product._id;
    if (!productId) {
      console.warn('Inline edit: missing product id');
      cancelEdit(td, input);
      return;
    }

    const newVal = coerceValue(field, input.value);
    const oldVal = product[field];
    const oldDisplay = displayValue(field, oldVal);

    // If value didn't change, just cancel gracefully
    const equal = (NUMERIC_FIELDS.has(field))
      ? (Number(oldVal) === Number(newVal))
      : (String(oldVal ?? '') === String(newVal));

    if (equal) {
      cancelEdit(td, input);
      return;
    }

    const payload = { [field]: newVal, updatedBy: (window.currentUser?.email || 'inline-edit') };
    const url = `${API_BASE}/products/${encodeURIComponent(productId)}`;

    input.disabled = true;
    td.classList.add('is-saving');

    try {
      const res = await shopFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const raw = await res.text();
      if (!res.ok) {
        let message = `Update failed (${res.status})`;
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed?.error) message = parsed.error;
        } catch {}
        throw new Error(message);
      }

      let updatedDoc = null;
      try {
        updatedDoc = raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn('Inline edit: could not parse response JSON', err);
      }

      if (updatedDoc && typeof window.normalizeProduct === 'function') {
        const normalized = window.normalizeProduct(updatedDoc);
        Object.assign(product, normalized);
      } else {
        product[field] = newVal;
        product.lastUpdated = Date.now();
      }

      td.innerText = displayValue(field, product[field]);
      td.dataset.editing = '0';
      td.classList.remove('is-saving');

      if (typeof window.saveProducts === 'function') {
        try {
          await window.saveProducts();
        } catch (err) {
          console.error('Inline edit: saveProducts() failed after update', err);
        }
      }

      if (typeof window.showToast === 'function') {
        window.showToast('Product updated successfully');
      }
    } catch (err) {
      console.error('Inline edit update failed:', err);
      td.classList.remove('is-saving');
      input.disabled = false;
      input.value = oldDisplay;
      input.dataset.originalValue = oldDisplay;
      setTimeout(() => {
        input.focus();
        input.select();
      }, 0);
      if (typeof window.showToast === 'function') {
        window.showToast(err.message || 'Error saving product');
      } else {
        alert(err.message || 'Error saving product');
      }
    }
  }

  function cancelEdit(td, input) {
    td.innerText = input.dataset.originalValue || '';
    td.dataset.editing = '0';
  }

  function displayValue(field, val) {
    if (field === 'price' || field === 'cost') {
      const n = Number(val);
      return Number.isFinite(n) ? n.toFixed(2) : String(val ?? '');
    }
    return String(val ?? '');
  }

  function beginEdit(tr, td, field) {
    if (td.dataset.editing === '1') return;
    td.dataset.editing = '1';

    const original = td.textContent.trim();
    td.innerHTML = '';

    const input = document.createElement('input');
    input.type = NUMERIC_FIELDS.has(field) ? 'number' : 'text';
    if (NUMERIC_FIELDS.has(field)) input.step = 'any';
    input.value = original;
    input.dataset.originalValue = original;
    input.style.width = '98%';
    input.style.padding = '6px';
    input.style.font = 'inherit';
    input.style.boxSizing = 'border-box';
    td.appendChild(input);
    input.focus();
    input.select();

    const finish = () => commitEdit(tr, td, input, field);
    const cancel  = () => cancelEdit(td, input);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    });
    input.addEventListener('blur', finish);
  }

  function isSupportedCell(td) {
    // Determine the field for this cell by header index + map
    const idx = Array.prototype.indexOf.call(td.parentElement.children, td);
    const ths = TBL.querySelectorAll('thead th');
    if (!ths[idx]) return null;
    const col = (ths[idx].dataset.column || '').toLowerCase();
    const field = COLUMN_FIELD_MAP[col];
    return field || null;
  }

  function attachRow(row) {
    // Skip details rows (they have a single <td colspan="...">)
    if (row.classList.contains('expanded-details')) return;
    const tds = row.querySelectorAll('td');

    tds.forEach((td) => {
      const field = isSupportedCell(td);
      if (!field) return;

      // Don't attach to QR/picture/actions or the amount controls cell
      if (td.querySelector('.stock-controls') || td.classList.contains('picture-cell') || td.classList.contains('qr-cell')) return;

      // Avoid double-binding
      if (td.__excelBound) return;
      td.__excelBound = true;

      td.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const f = isSupportedCell(td);
        if (!f) return;
        beginEdit(row, td, f);
      });

      // Single click focuses existing inline editor input if present
      td.addEventListener('click', () => {
        const inp = td.querySelector('input');
        if (inp) { inp.focus(); inp.select(); }
      });
    });
  }

  function attachAll() {
    const rows = TBODY.querySelectorAll('tr');
    rows.forEach(attachRow);
  }

  // Re-attach whenever the tbody changes (your app re-renders often)
  const mo = new MutationObserver(() => attachAll());
  mo.observe(TBODY, { childList: true, subtree: true });

  // Initial attach
  attachAll();

  // Expose a manual hook if you ever need it
  window.attachExcelEditing = attachAll;
})();
