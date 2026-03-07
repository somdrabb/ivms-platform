//helper.js
window.API_BASE = window.API_BASE || 'http://127.0.0.1:4000/api';
/* =======================
   Autofill/Autosave Killer
   - No core changes; adds attributes + traps to block browser suggestions
   - Targets:
       • #reset-password-input
       • #search-input
       • any input/textarea with [data-no-autofill]
       • any input inside .popup (password/name fields in modals)
   ======================= */
(function () {
  const SENSITIVE_SELECTORS = [
    '#reset-password-input',
    '#search-input',
    'input[type="password"]',
    'input[data-no-autofill]',
    'textarea[data-no-autofill]',
  ];
  const sensitiveSelector = SENSITIVE_SELECTORS.join(',');
  let pendingHardenFrame = null;

  // Harden a single field
  function harden(el, mode = 'generic') {
    if (!el || el.__hardened) return;
    el.__hardened = true;

    // Baseline: kill common hinting channels
    el.setAttribute('autocomplete', 'off');
    el.setAttribute('aria-autocomplete', 'none');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('spellcheck', 'false');

    // Rotate a per-boot random name -> prevents history suggestions keyed by name
    try {
      const base = el.getAttribute('name') || el.id || 'field';
      const rand = Math.random().toString(36).slice(2);
      el.setAttribute('name', `${base}_${rand}`);
    } catch {}

    // Readonly trap (released on focus). Most password managers skip readOnly fields.
    el.readOnly = true;
    el.addEventListener('focus', () => { el.readOnly = false; }, { once: true });

    // Kill datalist dropdowns if any
    const listId = el.getAttribute('list');
    if (listId) {
      const dl = document.getElementById(listId);
      if (dl) dl.remove();
      el.removeAttribute('list');
    }

    // Mode-specific tweaks
    if (mode === 'password') {
      // Hint that this is *not* a storable credential
      el.setAttribute('autocomplete', 'new-password');
      el.setAttribute('inputmode', 'text');
      if (!el.getAttribute('placeholder')) el.setAttribute('placeholder', 'Password');
    } else if (mode === 'search') {
      el.setAttribute('role', 'searchbox');
      el.setAttribute('inputmode', 'search');
    }

    // If inside a <form>, also disable form-level autocomplete
    const form = el.closest('form');
    if (form) form.setAttribute('autocomplete', 'off');
  }

  function scheduleHardenAll() {
    if (pendingHardenFrame !== null) return;
    pendingHardenFrame = requestAnimationFrame(() => {
      pendingHardenFrame = null;
      hardenAll();
    });
  }

  function hardenAll() {
    if (!sensitiveSelector) return;
    const nodes = document.querySelectorAll(sensitiveSelector);
    nodes.forEach((el) => {
      const id = (el.id || '').toLowerCase();
      const type = (el.type || '').toLowerCase();
      const mode =
        type === 'password' || /password/.test(id) ? 'password' :
        /search/.test(id) ? 'search' : 'generic';
      harden(el, mode);
    });
  }

  // Decoy off-screen form: satisfies some browser heuristics so they don't pester your real fields
  function installDecoyForm() {
    if (document.getElementById('decoy-login-form')) return;
    const f = document.createElement('form');
    f.id = 'decoy-login-form';
    f.autocomplete = 'off';
    f.noValidate = true;
    Object.assign(f.style, { position: 'fixed', left: '-99999px', top: '-99999px', opacity: 0 });

    const u = document.createElement('input');
    u.type = 'text';
    u.name = 'username';
    u.autocomplete = 'off';
    u.readOnly = true;
    u.tabIndex = -1;

    const p = document.createElement('input');
    p.type = 'password';
    p.name = 'password';
    p.autocomplete = 'new-password';
    p.readOnly = true;
    p.tabIndex = -1;

    f.appendChild(u);
    f.appendChild(p);
    document.body.appendChild(f);
  }

  // Neutralize Chrome/Safari autofill styling (yellow background) if they sneak in
  function injectAutofillCSS() {
    if (document.getElementById('no-autofill-css')) return;
    const css = document.createElement('style');
    css.id = 'no-autofill-css';
    css.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      textarea:-webkit-autofill {
        -webkit-text-fill-color: inherit !important;
        transition: background-color 864000s ease-in-out 0s, color 864000s ease-in-out 0s;
      }
    `;
    document.head.appendChild(css);
  }

  // Run now / on ready
  const boot = () => { installDecoyForm(); injectAutofillCSS(); hardenAll(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Re-apply for dynamically added modals/fields
  const observerRoot = document.body || document.documentElement;
  if (observerRoot) {
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof Element)) continue;
            if (node.matches?.(sensitiveSelector) || node.querySelector?.(sensitiveSelector)) {
              scheduleHardenAll();
              return;
            }
          }
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'type') {
          const target = mutation.target;
          if (target instanceof Element && target.matches?.(sensitiveSelector)) {
            scheduleHardenAll();
            return;
          }
        }
      }
    });
    mo.observe(observerRoot, { subtree: true, childList: true, attributes: true, attributeFilter: ['type'] });
  }

  // Last resort: block ArrowUp/Down from opening suggestion menus (keeps caret nav intact)
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) return;
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && sensitiveSelector && t.matches(sensitiveSelector)) {
      e.stopPropagation(); // don't preventDefault; just stop suggestion menus driven by bubbling
    }
  }, true);
})();
