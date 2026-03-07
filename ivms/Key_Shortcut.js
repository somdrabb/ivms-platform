
window.API_BASE = 'http://localhost:4000/api';
/* =========================================================
   IVMS-97 — Unified Keyboard Shortcuts (Ctrl/⌘ aware)
   - No core functions changed; only calls your existing ones
   - Skips plain typing in inputs/textareas/contenteditable
   - Provides a help overlay (Shift + / or F1)
   ========================================================= */
(function () {
  // ---------- helpers ----------
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
  const modHeld = (e) => isMac ? e.metaKey : e.ctrlKey;

  const isEditable = (el) => {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    return el.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
  };

  const focusAndSelect = (el) => { if (!el) return; el.focus(); if (el.select) el.select(); };

  const clickById = (id) => { const el = document.getElementById(id); if (el) el.click(); };
  const pressButton = (sel) => { const el = $(sel); if (el) el.click(); };

  const closeTopmostPopup = () => {
    // Prefer any .popup.active, otherwise .popup.show; fall back to close buttons
    const popups = $$('.popup.active, .popup.show');
    const top = popups[popups.length - 1];
    if (top) {
      const closer = top.querySelector('.popup-close,[data-close],.btn-cancel,.btn-ghost');
      if (closer) { closer.click(); return true; }
      top.classList.remove('active','show');
      return true;
    }
    return false;
  };
  const gotoPage = (n) => {
    if (typeof changePage === 'function') { changePage(n); return; }
    // fallback: click pagination button with text = n
    const btn = $(`.pagination button:not([disabled])`);
    const all = $$('.pagination button');
    const target = all.find(b => b.textContent.trim() === String(n));
    if (target) target.click();
  };

  const inPopup = () => !!$('.popup.active, .popup.show');

  // Handle amount +/- when an amount input is focused
  const adjustFocusedAmount = (delta) => {
    const el = document.activeElement;
    if (!el || !el.id || !el.id.startsWith('amount-')) return false;
    const id = el.id.replace('amount-', '');
    if (typeof changeAmountById === 'function') {
      changeAmountById(id, delta);
      // show the "Save" button if present
      const doneBtn = document.getElementById(`done-${id}`);
      if (doneBtn) doneBtn.style.display = 'inline-block';
      return true;
    }
    return false;
  };

  const triggerSearch = () => {
    if (typeof searchProducts === 'function') { searchProducts(); return; }
    clickById('search-button');
  };

  const triggerSave = () => {
    // Prefer explicit form submit/save
    if (typeof saveProduct === 'function') { saveProduct(); return; }
    pressButton('#product-form button[type="submit"]') || clickById('save-button');
  };

  const toggleTheme = () => clickById('theme-toggle');

  // ---------- help overlay ----------
  function ensureHelpOverlay() {
    if (document.getElementById('kbd-help')) return;
    const box = document.createElement('div');
    box.id = 'kbd-help';
    Object.assign(box.style, {
      position: 'fixed', inset: '0',
      display: 'none', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)', zIndex: 10000, padding: '24px'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: 'min(900px, 96vw)', maxHeight: '80vh', overflow: 'auto',
      background: 'var(--card-bg, #fff)', color: 'inherit',
      borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      padding: '20px 24px', lineHeight: 1.5
    });

    const h = (k, d) => `<tr><td><code>${k}</code></td><td>${d}</td></tr>`;
    const mod = isMac ? '⌘' : 'Ctrl';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <h3 style="margin:0">Keyboard Shortcuts</h3>
        <button class="popup-close" aria-label="Close" style="font-size:20px;background:none;border:none;cursor:pointer">×</button>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left;width:260px">Shortcut</th><th style="text-align:left">Action</th></tr></thead>
        <tbody>
          ${h(`${mod} + A`, 'Add product')}
          ${h(`${mod} + S`, 'Search')}
          ${h(`${mod} + Enter`, 'Save product / confirm')}
          ${h(`${mod} + E`, 'Export CSV')}
          ${h(`${mod} + I`, 'Import CSV')}
          ${h(`${mod} + R`, 'Reset inventory')}
          ${h(`${mod} + N`, 'Next page')}${h(`${mod} + P`, 'Previous page')}
          ${h(`1..9`, 'Go to page # (when not typing)')}
          ${h(`/ or ${mod} + F`, 'Focus search')}
          ${h(`${mod} + L`, 'Focus EAN field')}
          ${h(`${mod} + Shift + S`, 'Toggle dark mode')}
          ${h(`${mod} + Shift + U`, 'Check duplicates')}
          ${h(`${mod} + Shift + H`, 'Open full inventory history')}
          ${h(`${mod} + Shift + D`, 'Download history (in modal)')}
          ${h(`${mod} + Shift + P`, 'Print history (in modal)')}
          ${h(`Alt + = / Alt + -`, 'Increase / Decrease focused amount')}
          ${h(`Enter`, 'Context submit (form/search/confirm)')}
          ${h(`Esc`, 'Close top popup')}
          ${h(`F1 or ?`, 'Show this help')}
          ${h(`Home / End`, 'Scroll to top / bottom')}
          ${h(`PageUp / PageDown`, 'Page scroll')}
          ${h(`ArrowUp / ArrowDown`, 'Scroll or change option in <select>')}
        </tbody>
      </table>
    `;
    box.appendChild(card);
    card.querySelector('.popup-close').addEventListener('click', () => box.style.display = 'none');
    box.addEventListener('click', (e) => { if (e.target === box) box.style.display = 'none'; });
    document.body.appendChild(box);

    // Dark-mode friendly
    const s = document.createElement('style');
    s.textContent = `
      #kbd-help table td, #kbd-help table th { padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,0.08); }
      body.dark-mode #kbd-help .popup-close { color: #fff; }
      body.dark-mode #kbd-help div[style*="--card-bg"] { --card-bg: #1f2937; color: #e5e7eb; }
      #kbd-help code { background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 6px; }
      body.dark-mode #kbd-help code { background: rgba(255,255,255,0.08); }
    `;
    document.head.appendChild(s);
  }
  const openHelp = () => { ensureHelpOverlay(); $('#kbd-help').style.display = 'flex'; };

  // ---------- central dispatcher ----------
  document.addEventListener('keydown', (e) => {
    const target = e.target;

    // F1 or "?" (Shift + /) => help
    if ((e.key === 'F1') || (!modHeld(e) && !e.altKey && e.shiftKey && e.key === '?')) {
      e.preventDefault(); openHelp(); return;
    }

    // Esc => close topmost popup (including custom modals)
    if (e.key === 'Escape') {
      e.preventDefault();
      if (closeTopmostPopup()) return;
      // also close reason popup if open
      if ($('#reason-popup')?.classList.contains('active')) { closeReasonPopup?.(); return; }
      return;
    }

    // If the user is typing in an editable element, only catch MOD combos and Enter.
    const typing = isEditable(target);

    // ----- MOD combos (Ctrl on Win/Linux, ⌘ on macOS) -----
    if (modHeld(e)) {
      // Prevent browser default for our handled combos
      const key = e.key.toLowerCase();

      // Save / confirm
      if (key === 'enter') {
        e.preventDefault();
        // Context-aware: if reason popup active -> save reason; confirm dialogs; else save product
        if ($('#reason-popup')?.classList.contains('active')) { saveStockWithReason?.(); return; }
        if ($('#reset-confirm-popup')?.classList.contains('active')) { clickById('confirm-reset-btn'); return; }
        triggerSave();
        return;
      }

      // Add product
      if (key === 'a') { e.preventDefault(); clickById('add-btn'); return; }

      // Search
      if (key === 's' && !e.shiftKey) { e.preventDefault(); triggerSearch(); return; }

      // Export CSV
      if (key === 'e') { e.preventDefault(); clickById('export-csv-btn'); return; }

      // Import CSV
      if (key === 'i') { e.preventDefault(); clickById('import-csv-btn'); return; }

      // Reset inventory
      if (key === 'r') { e.preventDefault(); clickById('reset-inventory-btn'); return; }

      // Pagination next/prev
      if (key === 'n') { e.preventDefault(); if (typeof changePage === 'function') changePage(currentPage + 1); return; }
      if (key === 'p') { e.preventDefault(); if (typeof changePage === 'function') changePage(currentPage - 1); return; }

      // Focus fields
      if (key === 'f' && !e.shiftKey) { e.preventDefault(); focusAndSelect($('#search-input')); return; }
      if (key === 'l') { e.preventDefault(); focusAndSelect($('#ean-input')); return; }

      // Theme
      if (key === 's' && e.shiftKey) { e.preventDefault(); toggleTheme(); return; }

      // Duplicates
      if (key === 'u' && e.shiftKey) { e.preventDefault(); clickById('duplicate-btn'); return; }

      // Full inventory history
      if (key === 'h' && e.shiftKey) { e.preventDefault(); clickById('inventory-history-btn'); return; }

      // History actions (only useful when history popup is open)
      if (key === 'd' && e.shiftKey) { e.preventDefault(); downloadHistory?.(); return; }
      if (key === 'p' && e.shiftKey) { e.preventDefault(); printHistory?.(); return; }
    }

    // ----- single keys (when NOT typing) -----
    if (!typing) {
      // "/" focuses search (also common UX)
      if (!e.shiftKey && !e.altKey && e.key === '/') {
        e.preventDefault(); focusAndSelect($('#search-input')); return;
      }

      // Digits 1..9 => jump to that page (if pagination exists)
      if (!e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault(); gotoPage(parseInt(e.key, 10)); return;
      }
    }

    // ----- universal navigation -----
    // Enter: context submit (form/search/confirm) even while typing
    if (e.key === 'Enter') {
      const active = document.activeElement;
      // If focused inside add/edit popup content or explicit product form id
      if (active?.closest?.('#add-product-popup, #add-popup-content, #product-form')) {
        e.preventDefault(); triggerSave(); return;
      }
      // If focused on search input
      if (active?.id === 'search-input') {
        e.preventDefault(); triggerSearch(); return;
      }
      // If confirm dialogs are open
      if ($('#reset-confirm-popup')?.classList.contains('active')) {
        e.preventDefault(); clickById('confirm-reset-btn'); return;
      }
      if ($('#delete-confirm-popup')?.classList.contains('active')) {
        e.preventDefault(); clickById('confirm-delete-btn'); return;
      }
      if ($('#reason-popup')?.classList.contains('active')) {
        e.preventDefault(); saveStockWithReason?.(); return;
      }
    }

    // Arrow keys: preserve your current behavior + select navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      window.scrollBy(0, 50);
      const sel = document.activeElement?.tagName === 'SELECT' ? document.activeElement : null;
      if (sel) {
        const i = sel.selectedIndex + 1;
        if (i < sel.options.length) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change')); }
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      window.scrollBy(0, -50);
      const sel = document.activeElement?.tagName === 'SELECT' ? document.activeElement : null;
      if (sel) {
        const i = sel.selectedIndex - 1;
        if (i >= 0) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change')); }
      }
      return;
    }

    // Page navigation
    if (e.key === 'PageDown') { e.preventDefault(); window.scrollBy(0, window.innerHeight - 100); return; }
    if (e.key === 'PageUp')   { e.preventDefault(); window.scrollBy(0, -(window.innerHeight - 100)); return; }
    if (e.key === 'Home')     { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (e.key === 'End')      { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); return; }

    // Delete (when a delete button is focused)
    if ((e.key === 'Delete' || (e.ctrlKey && e.key.toLowerCase() === 'd')) && !modHeld(e)) {
      // keep your legacy Ctrl+D path but add Delete key too
      e.preventDefault();
      const focusedDel = document.querySelector('.inventory-table button[title="Delete"]:focus');
      if (focusedDel) { focusedDel.click(); return; }
    }

    // Amount quick adjust when focused on amount input
    if (e.altKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault(); if (adjustFocusedAmount(+1)) return;
    }
    if (e.altKey && e.key === '-') {
      e.preventDefault(); if (adjustFocusedAmount(-1)) return;
    }
  }, true); // capture to beat site defaults where needed
})();