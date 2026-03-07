window.API_BASE = 'http://localhost:4000/api';
/* ===== Reset Inventory – robust wiring (popup order fixed, core unchanged) ===== */
(function () {
    // ---- helpers ----
    const $ = (sel) => document.querySelector(sel);
    const getActiveShopId = () => {
      try {
        if (typeof getCurrentShopId === 'function') {
          const id = getCurrentShopId();
          if (id) return id;
        }
      } catch {}
      return (window.currentShop && window.currentShop.id) || localStorage.getItem('shop:id') || 'shop-1';
    };
    const shopFetch = typeof fetchWithShop === 'function'
      ? fetchWithShop
      : (url, options = {}) => fetch(url, options);
    const shopStorageKey = (base) => `${getActiveShopId()}:${base}`;
  
    function show(el) { el?.classList.add('active'); }
    function hide(el) { el?.classList.remove('active'); }
  
    function closeResetPasswordPopup() {
      const pw = $('#reset-password-popup');
      const inp = $('#reset-password-input');
      hide(pw);
      if (inp) inp.value = '';
      const inlineErr = $('#reset-password-error');
      if (inlineErr) inlineErr.style.display = 'none';
    }
    function closeResetConfirmPopup() {
      hide($('#reset-confirm-popup'));
    }
    function hideErrorPopupIfOpen() {
      // Try the app's closer first (keeps your styling/logic)
      if (typeof closeErrorPopup === 'function') {
        try { closeErrorPopup(); } catch {}
      } else {
        hide($('#error-popup'));
      }
    }
    function bringErrorToFront() {
      const err = $('#error-popup');
      if (err) err.style.zIndex = '9999';
    }
  
    // ✅ Expose for inline onclick="…" in your HTML
    window.closeResetPasswordPopup = closeResetPasswordPopup;
    window.closeResetConfirmPopup  = closeResetConfirmPopup;
  
    // ---- open entry point ----
    $('#reset-inventory-btn')?.addEventListener('click', (e) => {
      // Prevent older handlers from double-opening modals
      e.preventDefault();
      e.stopImmediatePropagation();
      hideErrorPopupIfOpen();
  
      const pw = $('#reset-password-popup');
      if (pw) {
        show(pw);
        setTimeout(() => $('#reset-password-input')?.focus(), 0);
      } else {
        show($('#reset-confirm-popup'));
      }
    });
  
    // ---- password step ----
    $('#cancel-password-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeResetPasswordPopup();
    });

    $('#reset-password-popup-close')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeResetPasswordPopup();
    });
  
    // allow Enter to submit password
    $('#reset-password-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#submit-password-btn')?.click();
    });
  
    $('#submit-password-btn')?.addEventListener('click', (e) => {
      // Stop any previously registered handlers from running (prevents false "incorrect password" popup)
      e.preventDefault();
      e.stopImmediatePropagation();
  
      const btn = e.currentTarget;
  
      // simple re-entry guard
      if (btn.dataset.lock === '1') return;
      btn.dataset.lock = '1';
  
      // Clean up any lingering error UIs before we check
      hideErrorPopupIfOpen();
      const inlineErr = $('#reset-password-error');
      if (inlineErr) { inlineErr.textContent = ''; inlineErr.style.display = 'none'; }
  
      const raw = $('#reset-password-input')?.value ?? '';
      const password = raw.trim();
  
      if (password === '34024742') {
        closeResetPasswordPopup();
        show($('#reset-confirm-popup'));
      } else {
        // Prefer your global error popup if present
        if (typeof showErrorPopup === 'function') {
          showErrorPopup('Incorrect password. Please try again.');
        } else if (inlineErr) {
          inlineErr.textContent = 'Incorrect password. Please try again.';
          inlineErr.style.display = 'block';
        } else {
          alert('Incorrect password. Please try again.');
        }
        bringErrorToFront();
        setTimeout(() => $('#reset-password-input')?.focus(), 0);
      }
  
      delete btn.dataset.lock;
    });
  
    // ---- confirm step ----
    $('#cancel-reset-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeResetConfirmPopup();
    });

    $('#reset-confirm-popup-close')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeResetConfirmPopup();
    });
  
    $('#confirm-reset-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
  
      const btn = e.currentTarget;
      try {
        btn && (btn.disabled = true);
  
        // If you use multi-shop, include 'X-Shop-ID'
        const res = await shopFetch(`${API_BASE}/products/reset/all`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
  
        if (!res.ok) {
          throw new Error(`Reset failed: ${res.status}`);
        }
  
        const { deleted = 0 } = await res.json();
  
        // clear client state
        window.products = [];
        window.serverTotalProducts = 0;
        window.restockCount = 0;
        localStorage.removeItem(shopStorageKey('inventory'));
        localStorage.removeItem(shopStorageKey('restockCount'));
        localStorage.removeItem('inventory');
        localStorage.removeItem('restockCount');
  
        // refresh UI
        typeof renderInventory === 'function' && renderInventory([]);
        typeof updateDashboard === 'function' && updateDashboard();
        typeof updateNotificationBadges === 'function' && updateNotificationBadges();
        typeof updateRestockBadgeFallback === 'function' && updateRestockBadgeFallback();
  
        typeof showToast === 'function'
          ? showToast(`Deleted ${deleted} products from database.`)
          : console.log(`Deleted ${deleted} products from database.`);
  
        closeResetConfirmPopup();
  
        // optional silent refresh
        typeof silentRefreshOnce === 'function' && silentRefreshOnce();
  
      } catch (err) {
        console.error('Reset error:', err);
        if (typeof showErrorPopup === 'function') {
          showErrorPopup(`Reset failed: ${err?.message || 'unknown error'}`);
        } else {
          alert(`Reset failed: ${err?.message || 'unknown error'}`);
        }
        bringErrorToFront();
      } finally {
        btn && (btn.disabled = false);
      }
    });
  })();
