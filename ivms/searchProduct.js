//searchProduct.js
window.API_BASE = 'http://localhost:4000/api';
let _serverSearchActive = false;
// Normalize strings: lowercase + strip accents
function _norm(v) {
  return String(v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
function _statusText(p) {
  const amt = Number(p.amount || 0);
  const threshold = Number.isFinite(p.reorderLevel) ? Number(p.reorderLevel) : 10;
  if (amt <= 0) return 'out of stock';
  if (amt <= threshold) return 'low stock';
  return 'in stock';
}
function _dateTokens(d) {
  if (!d) return [];
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt)) return [];
  const iso = dt.toISOString();                  // 2025-09-03T12:34:56.000Z
  const dateOnly = iso.slice(0,10);              // 2025-09-03
  const locale = dt.toLocaleString();            // 9/3/2025, 12:34:56 PM (depends on browser locale)
  return [iso, dateOnly, locale];
}
function _historyBlob(p) {
  if (!Array.isArray(p.history) || p.history.length === 0) return '';
  const lines = p.history.map(h =>
    [
      `old ${h.oldAmount}`, `new ${h.newAmount}`,
      (h.userName || ''), (h.reason || ''), (h.notes || ''),
      ..._dateTokens(h.timestamp || h.changedAt)
    ].filter(Boolean).join(' ')
  );
  return lines.join(' | ');
}
function _profitText(p) {
  const price = Number(p.price || 0);
  const cost  = Number(p.cost || 0);
  if (price <= 0) return '';
  const pct = ((price - cost) / price) * 100;
  return `${pct.toFixed(2)}%`;
}
  // Build a searchable string for one product (add fields as you like)
  function _productSearchHaystack(p) {
    return _norm([
      // core table columns
      p.ean, p.plu, p.name, p.weight, p.price, p.cost, p.amount,
      p.primaryCategory, p.category,
      _statusText(p),                       // status text ("in stock", "low stock", "out of stock")
      _profitText(p),                       // profit %
  
      // common identifiers / descriptors
      p.sku, p.brand, p.shortDesc, p.longDesc, p.visibility,
      p.dimensions, p.warehouse, p.supplier, p.country,
      p.promoPrice, p.taxClass, p.metaTitle, p.metaDesc,
  
      // dates shown or implied in UI
      ..._dateTokens(p.createdAt),
      ..._dateTokens(p.lastUpdated),
      ..._dateTokens(p.expiryDate),
      ..._dateTokens(p.lastChangeTime),
  
      // trend indicator words (↑/↓ already won’t match; add words)
      (p.lastChange > 0 ? 'increase up plus' :
       p.lastChange < 0 ? 'decrease down minus' : 'no change'),
  
      // history entries (reason, notes, user, old/new amounts, timestamps)
      _historyBlob(p)
    ].filter(Boolean).join(' | '));
  }
  // True if product matches all tokens in q
  function productMatchesQuery(p, q) {
    const hay = _productSearchHaystack(p);
    const tokens = _norm(q).split(/\s+/).filter(Boolean);
    return tokens.every(t => hay.includes(t));
  }

async function searchProducts() {
  window.resetInlineRowEdit?.();
  const rawQ = document.getElementById('search-input').value || '';
  const q = rawQ.trim();
  const category = document.getElementById('category-filter').value || '';

  // Always show page 1 for any search/category
  currentPage = 1;

  // No filters → show all local list
  if (!q && !category) {
    _serverSearchActive = false;
    sortState = { column: null, direction: 'asc' }; // keep default
    renderInventory(products, false, 'all');
    return;
  }

  try {
    // Ask the server so results come from ALL inventory.
    // Pick a sensible first-page size (your UI paginates afterward).
    const { list, total } = await serverSearchProducts(q, category, 500);

    _serverSearchActive = true;

    // Preserve server ranking: disable client-side sort
    sortState = { column: null, direction: 'asc' };

    renderInventory(list, false, 'server-search');

    const indicator = document.getElementById('filter-indicator');
    if (indicator) {
      const tag = q || category;
      indicator.textContent = `Results for "${tag}" (${Math.min(list.length, itemsPerPage)} of ${total})`;
    }
  } catch (err) {
    console.error('Server search error:', err);
    showToast('Search failed.');
    // Fallback to local haystack (optional):
    let filtered = products;
    if (q) filtered = filtered.filter(p => productMatchesQuery(p, q));
    if (category) {
      const c = _norm(category);
      filtered = filtered.filter(p =>
        _norm(p.primaryCategory).includes(c) ||
        _norm(p.category).includes(c)
      );
    }
    _serverSearchActive = false;
    sortState = { column: null, direction: 'asc' };
    renderInventory(filtered, false, q ? 'search' : 'all');
  }
}
