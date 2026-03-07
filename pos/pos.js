  /* ===== iOS 100vh fix (optional insurance) ===== */
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  setVH();

  /* ===== Fluid sizing: fill screen & widen with display while keeping proportions ===== */
  const BASE = {
    W: 1280, H: 1024,
    header: 60, footer: 55,
    B1W: 640, B2W: 640,
    B1Top: 500, B1Bottom: 360,
    B2Sub1: 860
  };

  function applyFluidLayout() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // vertical scaling based on height
    const ry = h / BASE.H;

    // horizontal widths scale with available width proportionally to base splits
    const b1w = (BASE.B1W / BASE.W) * w;
    const b2w = (BASE.B2W / BASE.W) * w;

    const root = document.documentElement;
    root.style.setProperty('--display-width', w + 'px');
    root.style.setProperty('--display-height', h + 'px');

    root.style.setProperty('--header-height', (BASE.header * ry) + 'px');
    root.style.setProperty('--footer-height', (BASE.footer * ry) + 'px');

    root.style.setProperty('--B1-width', b1w + 'px');
    root.style.setProperty('--B2-width', b2w + 'px');

    root.style.setProperty('--B1-top-height', (BASE.B1Top * ry) + 'px');
    root.style.setProperty('--B1-bottom-height', (BASE.B1Bottom * ry) + 'px');
    root.style.setProperty('--B2-sub1-height', (BASE.B2Sub1 * ry) + 'px');
  }
  window.addEventListener('resize', applyFluidLayout);
  applyFluidLayout();

  /* ===== Fullscreen toggle (works on iPad with user gesture) ===== */
  const fsBtn = document.getElementById('fsBtn');
  if (fsBtn) {
    const fullscreenTarget = document.getElementById('display') || document.documentElement;
    fsBtn.addEventListener('click', async () => {
      const el = fullscreenTarget;
      try {
        const request = el.requestFullscreen
          || el.webkitRequestFullscreen
          || el.webkitRequestFullScreen
          || el.mozRequestFullScreen
          || el.msRequestFullscreen;
        const exit = document.exitFullscreen
          || document.webkitExitFullscreen
          || document.webkitCancelFullScreen
          || document.mozCancelFullScreen
          || document.msExitFullscreen;
        const isFullscreen = Boolean(
          document.fullscreenElement
          || document.webkitFullscreenElement
          || document.webkitIsFullScreen
          || document.mozFullScreen
          || document.msFullscreenElement
        );

        if (!isFullscreen) {
          if (request) {
            await request.call(el);
          } else {
            console.warn('Fullscreen API not supported by this browser.');
          }
        } else {
          if (exit) {
            await exit.call(document);
          } else {
            console.warn('Fullscreen exit API not supported by this browser.');
          }
        }
      } catch(err) {
        console.warn('Fullscreen toggle failed', err);
      }
    });
  }

  /* ===== Clock ===== */
  function updateDateTime() {
    const now = new Date();
    document.getElementById('time').textContent =
      now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date').textContent =
      now.toLocaleDateString('de-DE', { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' });
  }
  setInterval(updateDateTime, 1000); updateDateTime();

  /* ===== Lockscreen: keyboard & auth ===== */
  const VALID_USER = "34024742";
  const VALID_PASS = "34024742";

  const userInput = document.getElementById("userId");
  const passInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const inputs = [userInput, passInput];
  const keyboard = document.getElementById("keyboard");
  const keyboardBody = document.getElementById("keyboardBody");
  let activeInput = null;
  let hideTimer = null;

  const numericLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["Clear", "0", "Enter"]
  ];

  function renderKeyboard() {
    if (!keyboardBody) return;
    keyboardBody.innerHTML = "";
    numericLayout.forEach(row => {
      row.forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'key';
        if (key === 'Clear') btn.classList.add('key-clear');
        if (key === 'Enter') btn.classList.add('key-enter');
        btn.textContent = key;
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          resetHideTimer();
          handleKeyPress(key);
          checkLoginVisibility();
        });
        keyboardBody.appendChild(btn);
      });
    });
  }

  function handleKeyPress(key) {
    if (key === 'Clear') {
      if (activeInput) activeInput.value = '';
      checkLoginVisibility();
      return;
    }
    if (key === 'Enter') {
      if (activeInput === userInput && passInput && !passInput.disabled) {
        passInput.focus();
        activeInput = passInput;
        checkLoginVisibility();
        return;
      }
      tryLogin();
      keyboard.style.display = 'none';
      return;
    }
    if (!activeInput) return;
    activeInput.value += key;
  }

  function checkLoginVisibility() {
    if (!loginBtn) return;
    const passFilled = !!passInput?.value.trim();
    const userFilled = !!userInput?.value.trim();
    const needsUser = lockMode !== LOCK_MODE_PASSWORD;
    const shouldShow = needsUser ? (userFilled && passFilled) : passFilled;
    loginBtn.style.display = shouldShow ? "inline-block" : "none";
  }

  inputs.forEach(input => {
    input.addEventListener("input", checkLoginVisibility);
    input.addEventListener("focus", () => {
      activeInput = input; renderKeyboard(); keyboard.style.display = "flex"; resetHideTimer();
    });
  });

  document.addEventListener("mousedown", (e) => {
    if (!keyboard.contains(e.target) && !inputs.includes(e.target)) {
      keyboard.style.display = "none";
    }
  });

  function resetHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => keyboard.style.display = "none", 60000);
  }

  keyboard.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });

  function tryLogin() {
    const passValue = passInput.value.trim();
    const userValue = userInput.value.trim();

    if (!passValue) {
      flashLoginError(lockMode === LOCK_MODE_PASSWORD ? 'Passwort erforderlich' : 'Falsche Daten');
      return;
    }

    if (lockMode === LOCK_MODE_PASSWORD) {
      const storedUser = currentUserId || safeGet(SESSION_USER_KEY) || userValue;
      if (!storedUser) {
        setLockscreenMode(LOCK_MODE_FULL);
        flashLoginError('Bitte anmelden');
        return;
      }
      if (storedUser === VALID_USER && passValue === VALID_PASS) {
        currentUserId = storedUser;
        showPosView({ preserveState: true });
        return;
      }
      flashLoginError('Falsches Passwort');
      return;
    }

    if (userValue === VALID_USER && passValue === VALID_PASS) {
      currentUserId = userValue;
      safeSet(SESSION_KEY, '1');
      safeSet(SESSION_USER_KEY, currentUserId);
      stornoCount = 0;
      showPosView({ preserveState: false });
      return;
    }

    flashLoginError('Falsche Daten');
  }
  loginBtn.addEventListener("click", tryLogin);
  [userInput, passInput].forEach(el => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const passFilled = !!passInput.value.trim();
        const userFilled = !!userInput.value.trim();
        if ((lockMode === LOCK_MODE_PASSWORD && passFilled) ||
            (lockMode !== LOCK_MODE_PASSWORD && passFilled && userFilled)) {
          tryLogin();
        }
      }
    });
  });

  /* ===== Slideshows (Lockscreen & POS left banner) ===== */
  // Lockscreen slideshow
  const lockSlides = document.querySelectorAll(".slideLock img");
  let lockIdx = 0;
  setInterval(() => {
    lockSlides[lockIdx].classList.remove("active");
    lockIdx = (lockIdx + 1) % lockSlides.length;
    lockSlides[lockIdx].classList.add("active");
  }, 5000);

  // POS left slideshow
  const posSlides = document.querySelectorAll(".slideshow-container .slide");
  let posIdx = 0;
  setInterval(() => {
    posSlides[posIdx].classList.remove("active");
    posIdx = (posIdx + 1) % posSlides.length;
    posSlides[posIdx].classList.add("active");
  }, 3000);

  /* ===== POS input logic ===== */
  const inputDisplay = document.getElementById("inputDisplay");
  const backspaceBtn = document.getElementById("backspace");
  const clearBtn = document.getElementById("clear");
  let currentValue = "";

  const posSlideshow = document.getElementById("posSlideshow");
  const productDisplay = document.getElementById("productDisplay");
  const productMessage = document.getElementById("productMessage");
  const productListEl = document.getElementById("productList");
  const productTotalEl = document.getElementById("productTotal");
  const productCountEl = document.getElementById("productCount");
  const productTotalSumEl = document.getElementById("productTotalSum");
  const totalAmountTopEl = document.getElementById("totalAmount");
  const duplicateBtn = document.querySelector('.grid-4-horizontal .cell[data-action="duplicate-last"]');
  const stornoBtn = document.querySelector('.grid-4-horizontal .cell[data-action="storno"]');
  const bonAbbruchBtn = document.querySelector('.grid-4-horizontal .cell[data-action="bon-abbruch"]');
  const toastEl = document.getElementById("toast");
  const toastMessageEl = document.getElementById("toastMessage");
  const lookupPopup = document.getElementById("lookupPopup");
  const lookupPopupTitle = document.getElementById("lookupPopupTitle");
  const lookupPopupDetail = document.getElementById("lookupPopupDetail");
  const lookupPopupClose = document.getElementById("lookupPopupClose");
  const adminModal = document.getElementById('adminModal');
  const adminModalMessage = document.getElementById('adminModalMessage');
  const adminModalInput = document.getElementById('adminModalInput');
  const adminModalError = document.getElementById('adminModalError');
  const adminModalCancel = document.getElementById('adminModalCancel');
  const adminModalConfirm = document.getElementById('adminModalConfirm');
  const adminModalTitle = document.getElementById('adminModalTitle');
  const confirmModal = document.getElementById('confirmModal');
  const confirmModalMessage = document.getElementById('confirmModalMessage');
  const confirmModalCancel = document.getElementById('confirmModalCancel');
  const confirmModalConfirm = document.getElementById('confirmModalConfirm');
  const searchModal = document.getElementById('searchModal');
  const searchModalInput = document.getElementById('searchModalInput');
  const searchModalSearch = document.getElementById('searchModalSearch');
  const searchModalPrice = document.getElementById('searchModalPrice');
  const searchModalError = document.getElementById('searchModalError');
  const searchModalCancel = document.getElementById('searchModalCancel');
  const searchModalBuy = document.getElementById('searchModalBuy');
  const logoutBtn = document.getElementById('logoutBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const articleSearchBtn = document.getElementById('articleSearchBtn');
  const obstButton = document.getElementById('obstButton');
  const gemueseButton = document.getElementById('gemueseButton');
  const suessigkeitenButton = document.getElementById('suessigkeitenButton');
  const snacksButton = document.getElementById('snacksButton');
  const brotButton = document.getElementById('brotButton');
  const broetchenButton = document.getElementById('broetchenButton');
  const nonFoodButton = document.getElementById('nonFoodButton');
  const papiertascheKleinButton = document.getElementById('papiertascheKleinButton');
  const papiertascheGrossButton = document.getElementById('papiertascheGrossButton');
  const petTascheButton = document.getElementById('petTascheButton');
  const stoffTascheButton = document.getElementById('stoffTascheButton');
  const klotenbeutelButton = document.getElementById('klotenbeutelButton');
  const obstOverlay = document.getElementById('obstOverlay');
  const obstOverlayTitle = document.getElementById('obstOverlayTitle');
  const obstCloseBtn = document.getElementById('obstCloseBtn');
  const obstGrid = document.getElementById('obstGrid');
  const obstPlaceholder = document.getElementById('obstPlaceholder');
  const currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  const formatAmount = (value) => currencyFormatter.format(value).replace(/[\s€]/g, '');
  const CATEGORY_STATES = new Map();
  const overlayState = {
    currentCategory: null,
    triggerButton: null
  };
  const urlParams = new URLSearchParams(window.location.search);
  const scannedItems = [];
  let selectedIndex = null;
  const DEFAULT_INPUT_PROMPT = "Position scannen/manuell erfassen";
  let toastTimer = null;
  const ADMIN_PASSWORD = '34024742';
  const STORNO_LIMIT = 3;
  const ADMIN_PRICE_THRESHOLD = 20;
  const BON_ABBRUCH_ADMIN_THRESHOLD = ADMIN_PRICE_THRESHOLD;
  let stornoCount = 0;
  let adminModalResolver = null;
  let confirmModalResolver = null;
  const SESSION_KEY = 'POS_SESSION_ACTIVE';
  const SESSION_USER_KEY = 'POS_SESSION_USER';
  const LOCK_MODE_KEY = 'POS_LOCK_MODE';
  const LOCK_MODE_FULL = 'full';
  const LOCK_MODE_PASSWORD = 'password-only';
  const LOGIN_BTN_DEFAULT_BG = '#68d255';
  const defaultUserPlaceholder = userInput?.getAttribute('placeholder') || '';
  const defaultPassPlaceholder = passInput?.getAttribute('placeholder') || '';
  const defaultLoginLabel = loginBtn?.textContent?.trim() || 'Login';
  let lockMode = LOCK_MODE_FULL;
  let currentUserId = null;
  let searchModalResult = null;
  let searchModalResultType = null;
  let searchModalResultCode = null;

  function safeGet(key) {
    try { return window.localStorage ? window.localStorage.getItem(key) : null; }
    catch (_err) { return null; }
  }
  function safeSet(key, value) {
    try {
      if (!window.localStorage) return;
      if (value !== undefined && value !== null) window.localStorage.setItem(key, value);
    } catch (_err) { /* ignore inaccessible storage */ }
  }
  function safeRemove(key) {
    try {
      if (!window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (_err) { /* ignore inaccessible storage */ }
  }

  function setLockscreenMode(mode) {
    lockMode = mode === LOCK_MODE_PASSWORD ? LOCK_MODE_PASSWORD : LOCK_MODE_FULL;
    const needsUser = lockMode !== LOCK_MODE_PASSWORD;
    if (userInput) {
      userInput.style.display = needsUser ? '' : 'none';
      userInput.disabled = !needsUser;
      if (!needsUser && currentUserId) {
        userInput.value = currentUserId;
      }
      if (needsUser) {
        userInput.placeholder = defaultUserPlaceholder || 'User ID';
      }
    }
    if (passInput) {
      const passwordPlaceholder = defaultPassPlaceholder || 'Password';
      passInput.placeholder = lockMode === LOCK_MODE_PASSWORD ? 'Passwort' : passwordPlaceholder;
    }
    if (loginBtn) {
      loginBtn.textContent = lockMode === LOCK_MODE_PASSWORD ? 'Entsperren' : defaultLoginLabel;
      loginBtn.style.background = LOGIN_BTN_DEFAULT_BG;
    }
    checkLoginVisibility();
  }

  function flashLoginError(message) {
    if (!loginBtn) return;
    loginBtn.textContent = message;
    loginBtn.style.background = '#e53e3e';
    loginBtn.style.display = 'inline-block';
    setTimeout(() => {
      if (!loginBtn) return;
      loginBtn.textContent = lockMode === LOCK_MODE_PASSWORD ? 'Entsperren' : defaultLoginLabel;
      loginBtn.style.background = LOGIN_BTN_DEFAULT_BG;
      checkLoginVisibility();
    }, 1200);
  }

  function detectLookupMode(code) {
    const digits = normalizeDigits(code);
    if (!digits) return null;
    if (/^\d{1,3}$/.test(digits)) return { type: 'plu', code: digits };
    if (/^\d{8,13}$/.test(digits)) return { type: 'ean', code: digits };
    return null;
  }

  function resetSearchModalState() {
    searchModalResult = null;
    searchModalResultType = null;
    searchModalResultCode = null;
    if (searchModalPrice) searchModalPrice.textContent = '';
    if (searchModalError) searchModalError.textContent = '';
    if (searchModalBuy) searchModalBuy.disabled = true;
  }

  function openSearchModalOverlay() {
    if (!searchModal) return;
    resetSearchModalState();
    if (searchModalInput) {
      const seed = lastLookupCode || '';
      searchModalInput.value = seed;
      if (seed) searchModalInput.select?.();
    }
    searchModal.removeAttribute('hidden');
    requestAnimationFrame(() => searchModal.classList.add('visible'));
    setTimeout(() => searchModalInput?.focus(), 60);
  }

  function hideSearchModalOverlay() {
    if (!searchModal) return;
    searchModal.classList.remove('visible');
    resetSearchModalState();
    setTimeout(() => {
      if (!searchModal.classList.contains('visible')) {
        searchModal.setAttribute('hidden', '');
      }
    }, 180);
  }

  function cleanBase(base) {
    if (!base) return '';
    const trimmed = String(base).trim();
    return trimmed ? trimmed.replace(/\/+$/, '') : '';
  }

  function collectApiBaseCandidates() {
    const list = [];
    const queryApi = urlParams.get('api');
    if (queryApi) {
      const cleaned = cleanBase(queryApi);
      if (cleaned) {
        safeSet('POS_API_BASE', cleaned);
        list.push(cleaned);
      }
    }
    if (typeof window.POS_API_BASE === 'string' && window.POS_API_BASE.trim()) {
      list.push(cleanBase(window.POS_API_BASE));
    }
    const storedApi = safeGet('POS_API_BASE');
    if (storedApi) list.push(cleanBase(storedApi));
    const origin = window.location.origin;
    if (origin && origin !== 'null') list.push(cleanBase(`${origin}/api`));
    if (window.location.protocol === 'file:') {
      list.push('http://localhost:4000/api');
      list.push('http://127.0.0.1:4000/api');
    }
    list.push('/api');
    return Array.from(new Set(list.filter(Boolean)));
  }

  function collectShopIdCandidates() {
    const list = [];
    const queryShop = urlParams.get('shop');
    if (queryShop) {
      const trimmed = String(queryShop).trim();
      if (trimmed) {
        safeSet('POS_SHOP_ID', trimmed);
        list.push(trimmed);
      }
    }
    if (typeof window.POS_SHOP_ID === 'string' && window.POS_SHOP_ID.trim()) {
      list.push(window.POS_SHOP_ID.trim());
    }
    const storedShop = safeGet('POS_SHOP_ID');
    if (storedShop) list.push(storedShop);
    list.push('shop-1');
    return Array.from(new Set(list.filter(Boolean)));
  }

  const API_BASE_CANDIDATES = collectApiBaseCandidates();
  const SHOP_ID_CANDIDATES = collectShopIdCandidates();
  let activeApiBase = API_BASE_CANDIDATES[0] || '/api';
  let activeShopId = SHOP_ID_CANDIDATES[0] || '';
  let lastLookupType = null;
  let lastLookupCode = null;

  function setActiveApiBase(base) {
    const cleaned = cleanBase(base);
    if (!cleaned) return;
    activeApiBase = cleaned;
    safeSet('POS_API_BASE', cleaned);
  }

  function buildLookupHeaders() {
    const headers = { Accept: 'application/json' };
    if (activeShopId) headers['X-Shop-ID'] = activeShopId;
    return headers;
  }

  function getApiBaseAttemptList() {
    const extras = ['http://localhost:4000/api', 'http://127.0.0.1:4000/api', '/api'];
    const combined = [activeApiBase, ...API_BASE_CANDIDATES, ...extras];
    return Array.from(new Set(combined.filter(Boolean).map(cleanBase)));
  }

  function setInputDisplayText(text) {
    if (!inputDisplay) return;
    const value = (text ?? '').toString().trim();
    inputDisplay.textContent = value || DEFAULT_INPUT_PROMPT;
  }

  function updateInputDisplayFromValue() {
    setInputDisplayText(currentValue);
  }

  function clearInputValue() {
    currentValue = "";
    setInputDisplayText('');
  }

  function updateDisplayVisibility() {
    const hasMessage = !!(productMessage && productMessage.textContent.trim());
    const hasItems = scannedItems.length > 0;
    if (productDisplay) productDisplay.hidden = !(hasItems || hasMessage);
    if (posSlideshow) posSlideshow.style.display = (hasItems || hasMessage) ? 'none' : '';
  }

  function showToast(text) {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = text;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2800);
  }

  function showNotFoundToast(detail) {
    const parts = ['Product not found'];
    if (detail) parts.push(detail);
    showToast(parts.join('\n'));
  }

  function showLookupPopup(message, detail) {
    if (!lookupPopup || !lookupPopupTitle) return;
    lookupPopupTitle.textContent = message || 'Kein Artikel gefunden.';
    if (lookupPopupDetail) {
      lookupPopupDetail.textContent = detail || '';
      lookupPopupDetail.style.display = detail ? 'block' : 'none';
    }
    lookupPopup.removeAttribute('hidden');
    requestAnimationFrame(() => lookupPopup.classList.add('visible'));
    lookupPopupClose?.focus({ preventScroll: true });
  }

  function hideLookupPopup() {
    if (!lookupPopup) return;
    lookupPopup.classList.remove('visible');
    setTimeout(() => {
      if (!lookupPopup.classList.contains('visible')) {
        lookupPopup.setAttribute('hidden', '');
      }
    }, 180);
  }

  /* ===== Obst overlay helpers ===== */
  function updateObstPlaceholder(title, detail) {
    if (!obstPlaceholder) return;
    obstPlaceholder.innerHTML = '';
    if (title) {
      const heading = document.createElement('strong');
      heading.textContent = title;
      obstPlaceholder.appendChild(heading);
    }
    if (detail) {
      const message = document.createElement('div');
      message.textContent = detail;
      obstPlaceholder.appendChild(message);
    }
    obstPlaceholder.hidden = false;
    if (obstGrid) obstGrid.hidden = true;
  }

  function showObstGrid() {
    if (obstPlaceholder) obstPlaceholder.hidden = true;
    if (obstGrid) obstGrid.hidden = false;
  }

  function resolveObstImageUrl(product) {
    const candidates = [
      product?.pictureUrl,
      product?.imageUrl,
      product?.image,
      product?.photoUrl
    ];
    const raw = candidates.find(value => typeof value === 'string' && value.trim());
    if (!raw) return '';
    const trimmed = raw.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    try {
      const apiUrl = new URL(activeApiBase, window.location.origin);
      if (trimmed.startsWith('/')) {
        return `${apiUrl.origin}${trimmed}`;
      }
      return new URL(trimmed, apiUrl).toString();
    } catch (_err) {
      return trimmed;
    }
  }

  function renderObstCards(products, categoryLabel = 'Artikel') {
    if (!obstGrid) return;
    obstGrid.innerHTML = '';
    if (!Array.isArray(products) || products.length === 0) {
      const safeLabel = categoryLabel || 'Artikel';
      updateObstPlaceholder(
        `Keine ${safeLabel}-Artikel gefunden`,
        `Bitte erfassen Sie ${safeLabel}-Produkte im Inventar.`
      );
      return;
    }
    showObstGrid();
    const fragment = document.createDocumentFragment();
    products.forEach(product => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'obst-card';
      card.dataset.plu = product?.plu || '';
      const fallbackName = `${categoryLabel} Artikel`;
      const labelName = (product?.name || fallbackName).trim();
      card.setAttribute('aria-label', product?.plu ? `${labelName}, PLU ${product.plu}` : labelName);

      const media = document.createElement('div');
      media.className = 'obst-card-media';
      const pictureUrl = resolveObstImageUrl(product);
      const ensurePlaceholder = () => {
        if (!media.querySelector('.obst-card-media-placeholder')) {
          const placeholder = document.createElement('div');
          placeholder.className = 'obst-card-media-placeholder';
          placeholder.textContent = labelName.slice(0, 18) || 'Kein Bild';
          media.appendChild(placeholder);
        }
      };
      if (pictureUrl) {
        const img = document.createElement('img');
        img.src = pictureUrl;
        img.alt = labelName;
        img.loading = 'lazy';
        img.addEventListener('error', () => {
          img.remove();
          ensurePlaceholder();
        }, { once: true });
        media.appendChild(img);
      } else {
        ensurePlaceholder();
      }

      if (product?.plu) {
        const pluEl = document.createElement('span');
        pluEl.className = 'obst-card-plu';
        pluEl.textContent = `PLU ${product.plu}`;
        media.appendChild(pluEl);
      }

      const pricing = computeProductPricing(product);
      if (Number.isFinite(pricing.unit) && pricing.unit > 0) {
        const priceEl = document.createElement('div');
        priceEl.className = 'obst-card-price';
        priceEl.textContent = currencyFormatter.format(pricing.unit);
        media.appendChild(priceEl);
      }

      const nameEl = document.createElement('div');
      nameEl.className = 'obst-card-name';
      nameEl.textContent = labelName;

      card.append(media, nameEl);
      card.addEventListener('click', () => handleObstProductSelect(product));
      fragment.appendChild(card);
    });
    obstGrid.appendChild(fragment);
  }

  function normalizeCategoryProducts(list = [], categoryLabel = '') {
    const named = list
      .filter(item => item && typeof item.name === 'string' && item.name.trim());
    const targetLabel = (categoryLabel || '').trim();
    const normalizedTarget = targetLabel
      ? targetLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      : '';
    const matchingCategory = normalizedTarget ? named.filter(item => {
      const categories = [
        item.category,
        item.primaryCategory,
        item.secondaryCategory
      ].map(value => (typeof value === 'string')
        ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        : '');
      return categories.some(cat => cat.includes(normalizedTarget));
    }) : named;
    const target = normalizedTarget ? matchingCategory : named;
    return target.sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }));
  }

  function getCategoryKey(category) {
    const raw = typeof category === 'string' ? category.trim() : '';
    return raw || '__ALL__';
  }

  function getCategoryState(category) {
    const key = getCategoryKey(category);
    if (!CATEGORY_STATES.has(key)) {
      CATEGORY_STATES.set(key, {
        products: [],
        isLoaded: false,
        loadingPromise: null
      });
    }
    return CATEGORY_STATES.get(key);
  }

  function getCategoryLabel(category) {
    const raw = typeof category === 'string' ? category.trim() : '';
    return raw || 'Artikel';
  }

  async function loadCategoryProducts(category) {
    const state = getCategoryState(category);
    const label = getCategoryLabel(category);
    const attemptBases = getApiBaseAttemptList();
    const params = new URLSearchParams({
      page: '1',
      limit: '500',
      sort: 'name',
      dir: 'asc'
    });
    if (category) params.set('category', category);
    if (activeShopId) params.set('shop', activeShopId);
    let lastError = null;
    for (const base of attemptBases) {
      const url = `${base}/products?${params}`;
      try {
        const response = await fetch(url, {
          headers: buildLookupHeaders(),
          cache: 'no-store'
        });
        if (!response.ok) {
          lastError = new Error(`Request failed: ${response.status} ${response.statusText}`);
          continue;
        }
        const payload = await response.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const normalized = normalizeCategoryProducts(data, label);
        state.products = normalized;
        state.isLoaded = true;
        setActiveApiBase(base);
        return normalized;
      } catch (err) {
        lastError = err;
      }
    }
    state.isLoaded = false;
    state.products = [];
    throw lastError || new Error(`${label}-Produkte konnten nicht geladen werden.`);
  }

  async function ensureCategoryProductsLoaded(category, { force = false } = {}) {
    const state = getCategoryState(category);
    if (state.isLoaded && !force) {
      return state.products;
    }
    if (state.loadingPromise) {
      try {
        return await state.loadingPromise;
      } catch (err) {
        throw err;
      }
    }
    state.loadingPromise = loadCategoryProducts(category)
      .catch(err => {
        state.isLoaded = false;
        state.products = [];
        throw err;
      })
      .finally(() => {
        state.loadingPromise = null;
      });
    return state.loadingPromise;
  }

  function handleObstOverlayKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeObstOverlay();
    }
  }

  async function openCategoryOverlay({ category, title, label, triggerButton, forceReload = false } = {}) {
    if (!obstOverlay) return;
    const safeLabel = getCategoryLabel(label || category);
    const heading = title || `${safeLabel} – Artikelauswahl`;
    overlayState.currentCategory = category;
    overlayState.triggerButton = triggerButton || null;
    if (obstOverlayTitle) obstOverlayTitle.textContent = heading;
    updateObstPlaceholder(`${safeLabel}-Liste wird geladen…`, 'Bitte warten Sie einen Moment.');
    obstOverlay.removeAttribute('hidden');
    document.addEventListener('keydown', handleObstOverlayKeydown, true);
    try {
      const products = await ensureCategoryProductsLoaded(category, { force: forceReload });
      if (Array.isArray(products) && products.length) {
        renderObstCards(products, safeLabel);
      } else {
        renderObstCards([], safeLabel);
      }
    } catch (err) {
      updateObstPlaceholder('Fehler beim Laden', err?.message || 'Die Artikelliste konnte nicht geladen werden.');
    }
    setTimeout(() => obstCloseBtn?.focus({ preventScroll: true }), 30);
  }

  function closeObstOverlay({ restoreFocus = true } = {}) {
    if (!obstOverlay) return;
    obstOverlay.setAttribute('hidden', '');
    document.removeEventListener('keydown', handleObstOverlayKeydown, true);
    if (restoreFocus) {
      const target = overlayState.triggerButton || obstButton;
      target?.focus({ preventScroll: true });
    }
    overlayState.triggerButton = null;
    overlayState.currentCategory = null;
  }

  function handleObstProductSelect(product) {
    if (!product) return;
    const code = product?.plu || product?.ean || product?.sku || '';
    renderProduct(product, product?.plu ? 'plu' : 'ean', code);
    closeObstOverlay();
  }

  function openAdminModal(config = '') {
    if (!adminModal) return Promise.resolve(false);
    if (adminModalResolver) {
      adminModalResolver(false);
      adminModalResolver = null;
    }
    const DEFAULT_TITLE = 'Admin-Bestätigung erforderlich';
    const DEFAULT_MESSAGE = 'Bitte geben Sie das Admin-Passwort ein.';
    const opts = (typeof config === 'object' && config !== null)
      ? config
      : { message: config };
    const rawMessage = typeof opts.message === 'string' ? opts.message : '';
    const sanitizedMessage = rawMessage && !/[>]=/.test(rawMessage) ? rawMessage : DEFAULT_MESSAGE;
    if (adminModalTitle) adminModalTitle.textContent = opts.title || DEFAULT_TITLE;
    if (adminModalMessage) adminModalMessage.textContent = sanitizedMessage;
    if (adminModalError) adminModalError.textContent = '';
    if (adminModalInput) {
      adminModalInput.value = '';
      adminModalInput.placeholder = opts.placeholder || 'Admin Passwort';
    }
    adminModal.removeAttribute('hidden');
    adminModal.classList.add('visible');
    setTimeout(() => adminModalInput?.focus(), 40);
    return new Promise(resolve => {
      adminModalResolver = resolve;
    });
  }

  function hideAdminModal(result = false) {
    if (!adminModal) return;
    adminModal.classList.remove('visible');
    adminModal.setAttribute('hidden', '');
    if (adminModalInput) {
      adminModalInput.value = '';
      adminModalInput.placeholder = 'Admin Passwort';
    }
    if (adminModalError) adminModalError.textContent = '';
    if (adminModalTitle) adminModalTitle.textContent = 'Admin-Bestätigung erforderlich';
    if (adminModalMessage) adminModalMessage.textContent = 'Bitte geben Sie das Admin-Passwort ein.';
    const resolver = adminModalResolver;
    adminModalResolver = null;
    if (resolver) resolver(Boolean(result));
  }

  async function requestAdminAuthorization(reason = '') {
    if (!ADMIN_PASSWORD) return true;
    return openAdminModal({ message: reason });
  }

  function openConfirmModal(message = '') {
    if (!confirmModal) return Promise.resolve(false);
    if (confirmModalResolver) {
      confirmModalResolver(false);
      confirmModalResolver = null;
    }
    confirmModalMessage.textContent = message || 'Sind Sie sicher?';
    confirmModal.removeAttribute('hidden');
    confirmModal.classList.add('visible');
    setTimeout(() => confirmModalConfirm?.focus(), 30);
    return new Promise(resolve => {
      confirmModalResolver = resolve;
    });
  }

  function hideConfirmModal(result = false) {
    if (!confirmModal) return;
    confirmModal.classList.remove('visible');
    confirmModal.setAttribute('hidden', '');
    const resolver = confirmModalResolver;
    confirmModalResolver = null;
    if (resolver) resolver(Boolean(result));
  }

  function normalizeDigits(value) {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\D/g, '');
  }

  function matchesLookupCode(product, type, code) {
    if (!product || !code) return false;
    const target = normalizeDigits(code);
    if (!target) return false;
    const candidates = [];
    if (type === 'plu') {
      candidates.push(
        product.plu,
        product.pluCode,
        product.PLU,
        product.sku,
        product.articleNumber,
        product.articleNo
      );
    } else {
      candidates.push(
        product.ean,
        product.EAN,
        product.eanCode,
        product.barcode,
        product.gtin,
        product.gtin13,
        product.gtin14,
        product.upc,
        product.ean13
      );
    }
    return candidates.some(candidate => normalizeDigits(candidate) === target);
  }

  function setMessage(text) {
    if (!productMessage) return;
    const normalized = (text || '').trim();
    productMessage.textContent = normalized;
    productMessage.style.display = normalized ? 'block' : 'none';
    updateDisplayVisibility();
  }

  function parsePrice(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value.trim()) return NaN;
    const normalized = value.replace(/[^\d,.\-]/g, '').replace(',', '.');
    const result = parseFloat(normalized);
    return Number.isFinite(result) ? result : NaN;
  }

  function computeProductPricing(product) {
    const basePrice = parsePrice(product?.price);
    const promoPrice = parsePrice(product?.promoPrice);
    const hasPromo = Number.isFinite(promoPrice) && promoPrice > 0 && (!Number.isFinite(basePrice) || promoPrice < basePrice);
    const effectiveBase = Number.isFinite(basePrice) ? basePrice : (hasPromo ? promoPrice : NaN);
    const effectiveUnit = hasPromo ? promoPrice : effectiveBase;
    return {
      base: Number.isFinite(effectiveBase) ? effectiveBase : NaN,
      unit: Number.isFinite(effectiveUnit) ? effectiveUnit : NaN,
      promo: Number.isFinite(promoPrice) ? promoPrice : NaN,
      hasPromo
    };
  }

  function amountToCents(value) {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return 0;
      return Math.round((value + Number.EPSILON) * 100);
    }
    const parsed = parsePrice(value);
    return Number.isFinite(parsed) ? Math.round((parsed + Number.EPSILON) * 100) : 0;
  }

  function getActiveTotal() {
    return scannedItems.reduce((sum, item) => {
      if (!item || item.isCanceled) return sum;
      const unit = Number.isFinite(item.unitPrice) ? item.unitPrice : parsePrice(item.price);
      const quantity = Number.isFinite(item?.quantity) && item.quantity > 0 ? item.quantity : 1;
      const safeUnit = Number.isFinite(unit) ? unit : 0;
      return sum + safeUnit * quantity;
    }, 0);
  }

  function renderScannedItems(preservedSelection = selectedIndex) {
    if (!productListEl || !productTotalEl) {
      updateDisplayVisibility();
      return;
    }
    productListEl.innerHTML = '';
    let total = 0;
    let totalQuantity = 0;
    const maxIndex = scannedItems.length ? scannedItems.length - 1 : null;
    if (maxIndex === null) selectedIndex = null;
    else if (Number.isInteger(preservedSelection) && preservedSelection >= 0 && preservedSelection <= maxIndex) selectedIndex = preservedSelection;
    else selectedIndex = null;
    if (Number.isInteger(selectedIndex) && scannedItems[selectedIndex]?.isCanceled) selectedIndex = null;

    scannedItems.forEach((item, idx) => {
      const unitPrice = Number.isFinite(item?.unitPrice) ? item.unitPrice : parsePrice(item?.price);
      const baseUnit = Number.isFinite(item?.basePrice) ? item.basePrice : unitPrice;
      const promoUnit = Number.isFinite(item?.promoPrice) ? item.promoPrice : null;
      const quantity = Number.isFinite(item?.quantity) && item.quantity > 0 ? item.quantity : 1;
      const effectiveUnit = Number.isFinite(unitPrice) ? unitPrice : 0;
      const lineTotal = effectiveUnit * quantity;
      const originalTotal = (Number.isFinite(baseUnit) ? baseUnit : effectiveUnit) * quantity;
      const discountTotal = Math.max(0, originalTotal - lineTotal);
      const hasPromo = discountTotal > 0.0001 || (promoUnit !== null && promoUnit < baseUnit);

      const isCanceled = Boolean(item?.isCanceled);
      if (!isCanceled) {
        total += lineTotal;
        totalQuantity += quantity;
      }

      const row = document.createElement('div');
      row.className = 'product-row';
      row.classList.add(idx % 2 === 0 ? 'is-alt' : 'is-base');

      const contentWrap = document.createElement('div');
      contentWrap.className = 'product-row-content';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'product-row-name';
      nameSpan.textContent = item.name || 'Artikel';
      contentWrap.appendChild(nameSpan);

      if (quantity > 1) {
        const detailSpan = document.createElement('span');
        detailSpan.className = 'product-row-detail';
        detailSpan.textContent = `${quantity} × ${formatAmount(effectiveUnit)}`;
        contentWrap.appendChild(detailSpan);
      }

      const priceSpan = document.createElement('span');
      priceSpan.className = 'product-row-price';

      const priceLine = document.createElement('span');
      priceLine.className = 'price-original';
      priceLine.textContent = formatAmount(originalTotal);
      priceSpan.appendChild(priceLine);

      if (hasPromo && discountTotal > 0.0001) {
        const discountSpan = document.createElement('span');
        discountSpan.className = 'price-discount';
        discountSpan.textContent = `-${formatAmount(discountTotal)}`;
        priceSpan.appendChild(discountSpan);
      }

      if (isCanceled) row.classList.add('is-canceled');
      if (isCanceled) {
        const canceledNote = document.createElement('span');
        canceledNote.className = 'product-row-detail';
        canceledNote.textContent = 'Storniert';
        contentWrap.appendChild(canceledNote);
      }

      row.append(contentWrap, priceSpan);
      if (!isCanceled && idx === selectedIndex) row.classList.add('selected');
      if (!isCanceled) row.addEventListener('click', () => selectItem(idx));
      productListEl.appendChild(row);
    });

    const hasRows = scannedItems.length > 0;
    productListEl.style.display = hasRows ? 'flex' : 'none';
    const formattedTotal = formatAmount(total);
    if (productCountEl) productCountEl.textContent = hasRows ? String(totalQuantity) : '';
    if (productTotalSumEl) productTotalSumEl.textContent = hasRows ? `Summe: ${formattedTotal}` : '';
    if (productTotalEl) productTotalEl.style.display = hasRows ? 'flex' : 'none';
    if (totalAmountTopEl) totalAmountTopEl.textContent = formattedTotal;
    updateDisplayVisibility();
    if (hasRows) {
      requestAnimationFrame(() => {
        productListEl.scrollTop = productListEl.scrollHeight;
      });
    }
  }

  function selectItem(index) {
    if (index < 0 || index >= scannedItems.length) return;
    if (scannedItems[index]?.isCanceled) return;
    if (selectedIndex === index) selectedIndex = null;
    else selectedIndex = index;
    Array.from(productListEl.children).forEach((row, idx) => {
      row.classList.toggle('selected', idx === selectedIndex);
    });
    setMessage('');
  }

  function duplicateLastItem() {
    const hasSelection = Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < scannedItems.length && !scannedItems[selectedIndex]?.isCanceled;
    const digitsOnly = currentValue.replace(/[^\d]/g, '');
    const qty = digitsOnly ? parseInt(digitsOnly, 10) : NaN;

    if (hasSelection) {
      if (!digitsOnly || !Number.isInteger(qty) || qty <= 0) {
        setMessage('Bitte gültige Menge eingeben.');
        return;
      }
      scannedItems[selectedIndex].quantity = qty;
      renderScannedItems(selectedIndex);
      clearInputValue();
      setMessage('');
      return;
    }

    if (!scannedItems.length) {
      setMessage('Kein Artikel zum Duplizieren.');
      return;
    }
    const activeIndexes = scannedItems.map((item, idx) => (!item?.isCanceled ? idx : null)).filter(idx => idx !== null);
    if (!activeIndexes.length) {
      setMessage('Kein Artikel zum Duplizieren.');
      return;
    }
    const last = scannedItems[activeIndexes[activeIndexes.length - 1]];
    const unitPrice = Number.isFinite(last?.unitPrice) ? last.unitPrice : parsePrice(last?.price);
    const basePrice = Number.isFinite(last?.basePrice) ? last.basePrice : unitPrice;
    const promoPrice = Number.isFinite(last?.promoPrice) ? last.promoPrice : null;
    const quantity = Number.isFinite(last?.quantity) && last.quantity > 0 ? last.quantity : 1;

    scannedItems.push({
      name: last?.name || 'Artikel',
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      basePrice: Number.isFinite(basePrice) ? basePrice : Number.isFinite(unitPrice) ? unitPrice : 0,
      promoPrice: Number.isFinite(promoPrice) ? promoPrice : null,
      quantity,
      isCanceled: false
    });
    renderScannedItems(selectedIndex);
    clearInputValue();
    setMessage('');
  }

  async function handleStorno() {
    if (!scannedItems.length) {
      showToast('Kein Artikel zum Storno.');
      return;
    }
    const activeIndexes = scannedItems
      .map((item, idx) => (!item?.isCanceled ? idx : null))
      .filter(idx => idx !== null);
    if (!activeIndexes.length) {
      showToast('Kein Artikel zum Storno.');
      return;
    }
    const targetIndex = (Number.isInteger(selectedIndex) && activeIndexes.includes(selectedIndex))
      ? selectedIndex
      : activeIndexes[activeIndexes.length - 1];
    const candidate = scannedItems[targetIndex];
    if (!candidate) {
      showToast('Kein Artikel zum Storno.');
      return;
    }
    const unitPrice = Number.isFinite(candidate?.unitPrice) ? candidate.unitPrice : parsePrice(candidate?.price);
    const quantity = Number.isFinite(candidate?.quantity) && candidate.quantity > 0 ? candidate.quantity : 1;
    const lineTotal = (Number.isFinite(unitPrice) ? unitPrice : 0) * quantity;
    const activeTotalBefore = getActiveTotal();
    const thresholdCents = amountToCents(ADMIN_PRICE_THRESHOLD);
    const lineCents = amountToCents(lineTotal);
    const totalCents = amountToCents(activeTotalBefore);

    const exceedsLineThreshold = lineCents >= thresholdCents;
    const exceedsTotalThreshold = totalCents >= thresholdCents;
    const requiresAdmin = stornoCount >= STORNO_LIMIT || exceedsLineThreshold || exceedsTotalThreshold;
    let reason = 'Storno erfordert Freigabe.';
    if (exceedsLineThreshold) {
      reason = `Artikel >= ${formatAmount(ADMIN_PRICE_THRESHOLD)} (Zeile: ${formatAmount(lineTotal)})`;
    } else if (exceedsTotalThreshold) {
      reason = `Bon >= ${formatAmount(ADMIN_PRICE_THRESHOLD)} (Summe: ${formatAmount(activeTotalBefore)})`;
    } else if (stornoCount >= STORNO_LIMIT) {
      reason = `Storno-Limit (${STORNO_LIMIT}) erreicht`;
    }
    if (requiresAdmin) {
      const granted = await requestAdminAuthorization(reason);
      if (!granted) {
        showToast('Admin-Freigabe erforderlich.');
        return;
      }
    }

    candidate.isCanceled = true;
    candidate.canceledAt = new Date().toISOString();
    stornoCount += 1;
    selectedIndex = null;
    renderScannedItems();
    setMessage('');
    showToast('Produkt storniert.');
  }

  async function handleBonAbbruch() {
    const hasActiveItems = scannedItems.some(item => item && !item.isCanceled);
    if (!hasActiveItems) {
      showToast('Kein Bon zum Abbruch.');
      return;
    }

    const confirmed = await openConfirmModal('Wirklich möchtest du Bonabbruch?');
    if (!confirmed) return;

    const activeTotal = getActiveTotal();
    const thresholdCents = amountToCents(BON_ABBRUCH_ADMIN_THRESHOLD);
    const activeCents = amountToCents(activeTotal);
    if (activeCents >= thresholdCents) {
      const reason = `Bon-Abbruch >= ${formatAmount(BON_ABBRUCH_ADMIN_THRESHOLD)} (Summe: ${formatAmount(activeTotal)})`;
      const granted = await requestAdminAuthorization(reason);
      if (!granted) {
        showToast('Admin-Freigabe erforderlich.');
        return;
      }
    }

    hideLookupPopup();
    resetProductDisplay({ clearItems: true });
    clearInputValue();
    showToast('Bon abgebrochen.');
  }

  function addScannedItem(product) {
    const pricing = computeProductPricing(product);
    const effectiveUnit = Number.isFinite(pricing.unit) ? pricing.unit : 0;
    const effectiveBase = Number.isFinite(pricing.base) ? pricing.base : effectiveUnit;
    const promoValue = pricing.hasPromo && Number.isFinite(pricing.promo) ? pricing.promo : null;

    scannedItems.push({
      name: product?.name || 'Artikel',
      unitPrice: effectiveUnit,
      basePrice: Number.isFinite(effectiveBase) ? effectiveBase : effectiveUnit,
      promoPrice: promoValue,
      quantity: 1,
      isCanceled: false
    });
    renderScannedItems(selectedIndex);
    setMessage('');
  }

  function clearScannedItems() {
    scannedItems.length = 0;
    selectedIndex = null;
    renderScannedItems();
  }

  function resetProductDisplay({ clearItems = false } = {}) {
    if (clearItems) clearScannedItems();
    setMessage('');
    lastLookupType = null;
    lastLookupCode = null;
    if (clearItems) stornoCount = 0;
  }

  function renderProduct(product, type, code) {
    addScannedItem(product);
    lastLookupType = type;
    lastLookupCode = code;
  }

  async function fetchProductBy(type, code) {
    const attemptBases = getApiBaseAttemptList();
    const params = new URLSearchParams({ limit: '1' });
    params.set(type === 'plu' ? 'plu' : 'ean', code);
    if (activeShopId) params.set('shop', activeShopId);

    for (const base of attemptBases) {
      const url = `${base}/products/search?${params}`;
      try {
        const response = await fetch(url, {
          headers: buildLookupHeaders(),
          cache: 'no-store'
        });
        if (!response.ok) {
          console.warn(`Lookup failed at ${base}:`, response.status, response.statusText);
          continue;
        }
        const payload = await response.json();
        const product = Array.isArray(payload?.data) ? payload.data[0] : null;
        if (product && matchesLookupCode(product, type, code)) {
          setActiveApiBase(base);
          return product;
        }
      } catch (err) {
        console.warn(`Lookup error at ${base}:`, err);
      }
    }
    return null;
  }

  async function handleSearchModalLookup() {
    if (!searchModalInput) return;
    const rawInput = searchModalInput.value.trim();
    resetSearchModalState();
    if (!rawInput) {
      if (searchModalError) searchModalError.textContent = 'Bitte zuerst eine Nummer eingeben.';
      return;
    }
    const detection = detectLookupMode(rawInput);
    if (!detection) {
      if (searchModalError) searchModalError.textContent = 'Ungültige Eingabe.';
      return;
    }

    if (searchModalSearch) {
      searchModalSearch.disabled = true;
      searchModalSearch.textContent = 'Suche...';
    }

    try {
      if (searchModalError) searchModalError.textContent = '';
      if (searchModalPrice) searchModalPrice.textContent = '';
      const product = await fetchProductBy(detection.type, detection.code);
      if (!product) {
        if (searchModalError) searchModalError.textContent = 'Kein Artikel gefunden.';
        return;
      }
      const pricing = computeProductPricing(product);
      if (!Number.isFinite(pricing.unit)) {
        if (searchModalError) searchModalError.textContent = 'Preis nicht verfügbar.';
        return;
      }
      searchModalResult = product;
      searchModalResultType = detection.type;
      searchModalResultCode = detection.code;
      if (searchModalPrice) searchModalPrice.textContent = formatAmount(pricing.unit);
      if (searchModalBuy) searchModalBuy.disabled = false;
    } finally {
      if (searchModalSearch) {
        searchModalSearch.disabled = false;
        searchModalSearch.textContent = 'Suchen';
      }
    }
  }

  function handleSearchModalBuy() {
    if (!searchModalResult) return;
    renderProduct(searchModalResult, searchModalResultType || 'ean', searchModalResultCode || '');
    if (!viewPos?.classList.contains('active')) {
      showToast('Artikel gespeichert. Bitte anmelden, um fortzufahren.');
    } else {
      showToast('Produkt hinzugefügt.');
    }
    hideSearchModalOverlay();
  }

  function renderLookupMessage(kind, code, message, extra) {
    const lines = [];
    if (message) lines.push(message);
    if (code) lines.push(`Eingabe: ${code}`);
    if (extra) lines.push(extra);
    setMessage(lines.join('\n'));
    lastLookupType = kind;
    lastLookupCode = code;
  }

  renderScannedItems();
  setMessage('');
  updateInputDisplayFromValue();

  async function quickAddByPlu(pluCode) {
    const normalized = normalizeDigits(pluCode);
    if (!normalized) return;
    try {
      const product = await fetchProductBy('plu', normalized);
      if (!product) {
        showToast(`PLU ${normalized} nicht gefunden.`);
        return;
      }
      renderProduct(product, 'plu', normalized);
      showToast(`${product?.name || 'Artikel'} hinzugefügt.`);
    } catch (err) {
      console.error('Quick add failed', err);
      showToast('Artikel konnte nicht geladen werden.');
    }
  }

  async function lookupProductBy(type, code) {
    const trimmed = (code || '').trim();
    hideLookupPopup();
    if (!trimmed) {
      clearInputValue();
      renderLookupMessage(type, '', 'Bitte zuerst eine Nummer eingeben.');
      showNotFoundToast('Bitte zuerst eine Nummer eingeben.');
      return;
    }

    const isPlu = type === 'plu';
    const valid = isPlu ? /^\d{1,3}$/.test(trimmed) : /^\d{8,13}$/.test(trimmed);
    if (!valid) {
      clearInputValue();
      const label = isPlu ? 'PLU' : 'EAN';
      setMessage('');
      showLookupPopup(`${label} ungültig`, `Eingabe: ${trimmed}`);
      showNotFoundToast(isPlu ? `PLU ${trimmed} ist ungültig.` : `EAN ${trimmed} ist ungültig.`);
      return;
    }

    const attemptBases = getApiBaseAttemptList();
    clearInputValue();
    renderLookupMessage(type, trimmed, 'Suche läuft...');

    const params = new URLSearchParams({ limit: '1' });
    params.set(isPlu ? 'plu' : 'ean', trimmed);
    if (activeShopId) params.set('shop', activeShopId);

    for (const base of attemptBases) {
      const url = `${base}/products/search?${params}`;
      try {
        const response = await fetch(url, {
          headers: buildLookupHeaders(),
          cache: 'no-store'
        });
        if (!response.ok) {
          console.warn(`Lookup failed at ${base}:`, response.status, response.statusText);
          continue;
        }

        const payload = await response.json();
        setActiveApiBase(base);
        const product = Array.isArray(payload?.data) ? payload.data[0] : null;
        if (product && matchesLookupCode(product, type, trimmed)) {
          renderProduct(product, type, trimmed);
          return;
        }
        setMessage('');
        showLookupPopup('Kein Artikel gefunden.', `Eingabe: ${trimmed}`);
        showNotFoundToast(`Eingabe: ${trimmed}`);
        return;
      } catch (err) {
        console.warn(`Lookup error at ${base}:`, err);
      }
    }

    setMessage('');
    showLookupPopup('Fehler bei der Suche.', `Eingabe: ${trimmed}`);
    showNotFoundToast(`Eingabe: ${trimmed}`);
  }

  document.querySelectorAll('.grid-3-vertical .cell[data-action]').forEach(cell => {
    cell.addEventListener('click', () => {
      const action = cell.dataset.action;
      if (action === 'plu' || action === 'ean') {
        lookupProductBy(action, currentValue);
      }
    });
  });

  document.querySelectorAll(".grid-12 button").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.textContent.trim();
      const startingFresh = currentValue.length === 0;
      currentValue += val;
      updateInputDisplayFromValue();
      if (startingFresh && productMessage && productMessage.textContent) setMessage('');
    });
  });

  if (duplicateBtn) duplicateBtn.addEventListener("click", () => {
    duplicateLastItem();
  });

  if (stornoBtn) stornoBtn.addEventListener("click", () => {
    handleStorno().catch(err => console.error('Storno failed', err));
  });

  if (bonAbbruchBtn) bonAbbruchBtn.addEventListener('click', () => {
    handleBonAbbruch().catch(err => console.error('Bon Abbruch failed', err));
  });

  if (backspaceBtn) backspaceBtn.addEventListener("click", () => {
    currentValue = currentValue.slice(0, -1);
    updateInputDisplayFromValue();
    if (!currentValue) resetProductDisplay();
  });

  if (clearBtn) clearBtn.addEventListener("click", () => {
    clearInputValue();
    resetProductDisplay();
  });

  if (lookupPopupClose) lookupPopupClose.addEventListener('click', hideLookupPopup);
  if (lookupPopup) {
    lookupPopup.addEventListener('click', (e) => {
      if (e.target === lookupPopup) hideLookupPopup();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lookupPopup && lookupPopup.classList.contains('visible')) hideLookupPopup();
      if (confirmModal && confirmModal.classList.contains('visible')) hideConfirmModal(false);
      if (searchModal && searchModal.classList.contains('visible')) hideSearchModalOverlay();
    }
  });
  if (confirmModalCancel) confirmModalCancel.addEventListener('click', () => hideConfirmModal(false));
  if (confirmModalConfirm) confirmModalConfirm.addEventListener('click', () => hideConfirmModal(true));
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) hideConfirmModal(false);
    });
  }
  if (obstButton) {
    obstButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Obst',
      title: 'Obst – Artikelauswahl',
      label: 'Obst',
      triggerButton: obstButton
    }));
  }
  if (gemueseButton) {
    gemueseButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Gemüse',
      title: 'Gemüse – Artikelauswahl',
      label: 'Gemüse',
      triggerButton: gemueseButton
    }));
  }
  if (suessigkeitenButton) {
    suessigkeitenButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Suesswaren',
      title: 'Süßigkeiten – Artikelauswahl',
      label: 'Süßigkeiten',
      triggerButton: suessigkeitenButton
    }));
  }
  if (snacksButton) {
    snacksButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Snacks',
      title: 'Snacks – Artikelauswahl',
      label: 'Snacks',
      triggerButton: snacksButton
    }));
  }
  if (brotButton) {
    brotButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Brot',
      title: 'Brot – Artikelauswahl',
      label: 'Brot',
      triggerButton: brotButton
    }));
  }
  if (broetchenButton) {
    broetchenButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Brotschen',
      title: 'Brotschen – Artikelauswahl',
      label: 'Brotschen',
      triggerButton: broetchenButton
    }));
  }
  if (nonFoodButton) {
    nonFoodButton.addEventListener('click', () => openCategoryOverlay({
      category: 'Non food',
      title: 'Non-Food – Artikelauswahl',
      label: 'Non-Food',
      triggerButton: nonFoodButton
    }));
  }
  if (papiertascheKleinButton) {
    papiertascheKleinButton.addEventListener('click', () => quickAddByPlu('001'));
  }
  if (papiertascheGrossButton) {
    papiertascheGrossButton.addEventListener('click', () => quickAddByPlu('002'));
  }
  if (petTascheButton) {
    petTascheButton.addEventListener('click', () => quickAddByPlu('003'));
  }
  if (stoffTascheButton) {
    stoffTascheButton.addEventListener('click', () => quickAddByPlu('004'));
  }
  if (klotenbeutelButton) {
    klotenbeutelButton.addEventListener('click', () => quickAddByPlu('005'));
  }
  if (obstCloseBtn) {
    obstCloseBtn.addEventListener('click', () => closeObstOverlay());
  }
  if (obstOverlay) {
    obstOverlay.addEventListener('click', (e) => {
      if (e.target === obstOverlay) closeObstOverlay();
    });
  }
  if (articleSearchBtn) {
    articleSearchBtn.addEventListener('click', () => openSearchModalOverlay());
  }
  if (searchModalCancel) searchModalCancel.addEventListener('click', () => hideSearchModalOverlay());
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) hideSearchModalOverlay();
    });
  }
  if (searchModalSearch) searchModalSearch.addEventListener('click', () => {
    handleSearchModalLookup().catch(err => console.error('Search lookup failed', err));
  });
  if (searchModalInput) {
    searchModalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchModalLookup().catch(err => console.error('Search lookup failed', err));
      }
    });
    searchModalInput.addEventListener('input', () => {
      if (searchModalError) searchModalError.textContent = '';
      if (searchModalPrice) searchModalPrice.textContent = '';
      if (searchModalBuy) searchModalBuy.disabled = true;
      searchModalResult = null;
      searchModalResultType = null;
      searchModalResultCode = null;
    });
  }
  if (searchModalBuy) searchModalBuy.addEventListener('click', () => handleSearchModalBuy());
  if (adminModalCancel) adminModalCancel.addEventListener('click', () => hideAdminModal(false));
  if (adminModalConfirm) adminModalConfirm.addEventListener('click', () => {
    const value = adminModalInput?.value?.trim() || '';
    if (value === ADMIN_PASSWORD) hideAdminModal(true);
    else if (adminModalError) adminModalError.textContent = 'Falsches Passwort.';
  });
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) hideAdminModal(false);
    });
  }
  if (adminModalInput) {
    adminModalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        adminModalConfirm?.click();
      } else if (e.key === 'Escape') {
        hideAdminModal(false);
      }
    });
    adminModalInput.addEventListener('input', () => {
      if (adminModalError) adminModalError.textContent = '';
    });
  }

  /* ===== View switching & logout ===== */
  const viewLock = document.getElementById('view-lock');
  const viewPos  = document.getElementById('view-pos');
  function showPosView({ preserveState = false } = {}) {
    if (!viewLock || !viewPos) return;
    setLockscreenMode(LOCK_MODE_FULL);
    viewLock.classList.remove('active');
    viewPos.classList.add('active');
    if (passInput) passInput.value = '';
    if (!preserveState && userInput) userInput.value = '';
    if (loginBtn) loginBtn.style.display = 'none';
    if (keyboard) keyboard.style.display = 'none';
    safeRemove(LOCK_MODE_KEY);
    safeSet(SESSION_KEY, '1');
    if (currentUserId) safeSet(SESSION_USER_KEY, currentUserId);
    if (!preserveState) {
      clearInputValue();
      resetProductDisplay({ clearItems: true });
      stornoCount = 0;
    }
  }

  function showLockView(mode = LOCK_MODE_FULL, { clearSession = false, clearState = false } = {}) {
    if (!viewLock || !viewPos) return;
    let targetMode = mode === LOCK_MODE_PASSWORD ? LOCK_MODE_PASSWORD : LOCK_MODE_FULL;
    if (targetMode === LOCK_MODE_PASSWORD) {
      const storedUser = currentUserId || safeGet(SESSION_USER_KEY);
      if (storedUser) {
        currentUserId = storedUser;
        if (userInput) userInput.value = storedUser;
      } else {
        targetMode = LOCK_MODE_FULL;
        currentUserId = null;
        safeRemove(SESSION_KEY);
        safeRemove(SESSION_USER_KEY);
      }
    }
    setLockscreenMode(targetMode);
    viewPos.classList.remove('active');
    viewLock.classList.add('active');
    if (targetMode === LOCK_MODE_FULL && userInput) {
      userInput.value = '';
    }
    if (passInput) passInput.value = '';
    if (loginBtn) loginBtn.style.display = 'none';
    if (keyboard) keyboard.style.display = 'none';
    if (clearState) {
      clearInputValue();
      resetProductDisplay({ clearItems: true });
      stornoCount = 0;
    }
    if (clearSession) {
      currentUserId = null;
      safeRemove(SESSION_KEY);
      safeRemove(SESSION_USER_KEY);
    } else if (currentUserId) {
      safeSet(SESSION_KEY, '1');
      safeSet(SESSION_USER_KEY, currentUserId);
    }
    if (targetMode === LOCK_MODE_PASSWORD) {
      safeSet(LOCK_MODE_KEY, LOCK_MODE_PASSWORD);
      setTimeout(() => passInput?.focus(), 150);
    } else {
      safeRemove(LOCK_MODE_KEY);
    }
  }

  async function handleLogoutRequest() {
    if (!viewPos?.classList.contains('active')) return;
    const confirmed = await openAdminModal({
      title: 'Abmelden bestätigen',
      message: 'Bitte Passwort eingeben, um sich abzumelden.',
      placeholder: 'Passwort'
    });
    if (!confirmed) return;
    safeRemove(LOCK_MODE_KEY);
    showLockView(LOCK_MODE_FULL, { clearSession: true, clearState: true });
  }

  function handlePauseRequest() {
    if (!viewPos?.classList.contains('active')) return;
    if (!currentUserId) {
      currentUserId = safeGet(SESSION_USER_KEY) || VALID_USER;
    }
    safeSet(SESSION_KEY, '1');
    showLockView(LOCK_MODE_PASSWORD, { clearSession: false, clearState: false });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (viewPos?.classList.contains('active')) handleLogoutRequest();
    });
  }
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (viewPos?.classList.contains('active')) handlePauseRequest();
    });
  }

  currentUserId = safeGet(SESSION_USER_KEY) || currentUserId;
  const storedSessionActive = safeGet(SESSION_KEY) === '1';
  const storedLockMode = safeGet(LOCK_MODE_KEY);
  if (storedSessionActive) {
    if (storedLockMode === LOCK_MODE_PASSWORD) {
      showLockView(LOCK_MODE_PASSWORD, { clearSession: false, clearState: false });
    } else {
      showPosView({ preserveState: true });
    }
  } else {
    showLockView(LOCK_MODE_FULL, { clearSession: true, clearState: true });
  }
