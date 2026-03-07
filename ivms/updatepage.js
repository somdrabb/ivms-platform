// Sort indicator
window.API_BASE = 'http://localhost:4000/api';
function updateSortIndicator() {
    const sortIndicator = document.getElementById('sort-indicator');
    if (sortState.column) {
        const columnName = {
            ean: 'EAN',
            plu: 'PLU',
            name: 'Name',
            price: 'Price',
            weight: 'Weight',
            amount: 'Amount',
            category: 'Category'
        }[sortState.column] || sortState.column;
        sortIndicator.textContent = `Sorted by ${columnName} (${sortState.direction.toUpperCase()})`;
    } else {
        sortIndicator.textContent = '';
    }
}
function getWindowedPages(current, total, maxVisible = 10) {
    if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const half = Math.floor(maxVisible / 2);

    let start = current - half;
    let end = current + half - 1;

    if (start < 1) { start = 1; end = maxVisible; }
    if (end > total) { end = total; start = total - maxVisible + 1; }

    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
}
function renderPaginationControls(totalItems) {
    const host = document.querySelector('.inventory-table-container');
    if (!host) return;
  
    // remove old
    const existing = host.querySelector('.pagination');
    if (existing) existing.remove();
  
    const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const wrap = document.createElement('nav');
    wrap.className = 'pagination';
    wrap.setAttribute('aria-label', 'Pagination');
  
    // helper to make a button
    const makeBtn = (label, page, disabled = false, isCurrent = false) => {
      const b = document.createElement('button');
      b.type = 'button';                  // <- avoid form submit
      b.textContent = String(label);
      b.dataset.page = String(page);      // <- used by delegated handler
      if (disabled) b.disabled = true;
      if (isCurrent) {
        b.classList.add('active');
        b.setAttribute('aria-current', 'page');
      }
      return b;
    };
  
    // Prev
    wrap.appendChild(makeBtn('← Previous', currentPage - 1, currentPage === 1));
  
    // windowed numbers
    const pages = getWindowedPages(currentPage, pageCount, 10);
    pages.forEach(p => wrap.appendChild(makeBtn(p, p, false, p === currentPage)));
  
    // Next
    wrap.appendChild(makeBtn('Next →', currentPage + 1, currentPage === pageCount));
  
    host.appendChild(wrap);
  }
  function changePage(page) {
    const totalItems = _currentList.length ? _currentList.length : products.length;
    const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    currentPage = Math.max(1, Math.min(page, pageCount));
  
    // lock height, then re-render using the cached list
    const container = document.querySelector('.inventory-table-container');
    const prevMin = container?.style?.minHeight || '';
    const lockH = container?.offsetHeight || 0;
    if (container && lockH > 0) container.style.minHeight = lockH + 'px';
  
    requestAnimationFrame(() => {
      renderInventory(_currentList.length ? _currentList : products, false, _currentFilterType);
      renderPaginationControls(totalItems);
      requestAnimationFrame(() => { if (container) container.style.minHeight = prevMin; });
    });
  }
  // ── add this function (called by the <select> onchange) ───────────────────────
function updateItemsPerPage() {
    const sel = document.getElementById('items-per-page');
    const val = parseInt(sel?.value, 10);
    if (Number.isFinite(val) && val > 0) {
      itemsPerPage = val;
    } else {
      itemsPerPage = 10; // fallback
    }
    currentPage = 1; // reset to first page whenever the page size changes
    // re-render whatever list is currently displayed
    renderInventory(_currentList.length ? _currentList : products, false, _currentFilterType);
  }

function attachItemsPerPageListener() {
  document.getElementById('items-per-page')?.addEventListener('change', updateItemsPerPage);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachItemsPerPageListener);
} else {
  attachItemsPerPageListener();
}
