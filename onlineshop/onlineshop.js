const categoriesBtn = document.getElementById("categoriesBtn");
const megaMenu = document.getElementById("megaMenu");
const profileBtn = document.getElementById("profileBtn");
const profileCard = document.getElementById("profileCard");
const profileArea = document.getElementById("profileArea");
const profileTabs = document.querySelectorAll(".profile-tab");
const profilePanels = document.querySelectorAll(".profile-panel");
const profileStatus = document.getElementById("profileStatus");
const profileSwitchLinks = document.querySelectorAll("[data-profile-switch]");

const addressBtn = document.getElementById("addressBtn");
const addressModal = document.getElementById("addressModal");
const closeAddressModalBtn = document.getElementById("closeAddressModal");
const addressForm = document.getElementById("addressForm");
const streetInput = document.getElementById("streetInput");
const houseNumberInput = document.getElementById("houseNumberInput");
const postalCodeInput = document.getElementById("postalCodeInput");
const cityInput = document.getElementById("cityInput");
const addressDisplay = document.getElementById("addressDisplay");
const detectLocationBtn = document.getElementById("detectLocationBtn");
const addressStatus = document.getElementById("addressStatus");
const addressSearch = document.getElementById("addressSearch");
const productCollections = document.getElementById("productCollections");
const productsStatus = document.getElementById("productsStatus");
const refreshProductsBtn = document.getElementById("refreshProductsBtn");
const productDetailPane = document.getElementById("productDetailPane");
const navActionButtons = document.querySelectorAll(".nav-buttons .btn");
const dealsBtn = document.getElementById("dealsBtn");
const exploreBtn = document.getElementById("exploreBtn");
const globalSearchPanel = document.getElementById("globalSearchPanel");
const globalSearchInput = document.getElementById("globalSearchInput");
const globalSearchClear = document.getElementById("globalSearchClear");
const globalSearchToggle = document.getElementById("globalSearchToggle");
const categoryItems = document.querySelectorAll(".categories-grid .category");
const categoryFocusBanner = document.getElementById("categoryFocus");
const categoryStripBoxes = document.querySelectorAll(".category-chip");
const categoryStripTrack = document.getElementById("categoryStripTrack");
const categoryStripNext = document.getElementById("categoryStripNext");

const registerForm = document.getElementById("panel-register");
const loginForm = document.getElementById("panel-login");
const otpSendBtn = document.getElementById("otpSendBtn");
const otpVerifyBtn = document.getElementById("otpVerifyBtn");
const otpInput = document.getElementById("otpInput");
const profileForm = document.getElementById("panel-profile");
const recoveryForm = document.getElementById("panel-recovery");
const guestCheckoutBtn = document.getElementById("guestCheckoutBtn");

const ADDRESS_STORAGE_KEY = "onlineshopDeliveryAddress";
const cartItemsContainer = document.getElementById("cartItems");
const cartSummaryContainer = document.getElementById("cartSummary");
const wishlistContainer = document.getElementById("wishlistItems");
const orderHistoryListEl = document.querySelector(".order-history__list");
const orderConfirmation = document.getElementById("orderConfirmation");
const headerCartBtn = document.getElementById("headerCartBtn");
const headerWishlistBtn = document.getElementById("headerWishlistBtn");
const cartBtnBadge = document.getElementById("cartBtnBadge");
const wishlistBtnBadge = document.getElementById("wishlistBtnBadge");
const cartPanelEl = document.querySelector(".cart-panel");
const wishlistPanelEl = document.querySelector(".wishlist-panel");
const quickPanelSlot = document.getElementById("quickPanelSlot");
const quickPanelContent = document.getElementById("quickPanelContent");
const quickPanelClose = document.getElementById("quickPanelClose");
let continueShoppingBtn = document.getElementById("continueShoppingBtn");
const cartCountLabel = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const paymentMethods = document.getElementById("paymentMethods");
const couponInput = document.getElementById("couponInput");
const couponStatus = document.getElementById("couponStatus");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const mainEl = document.querySelector("main");
const getCartItemById = (productId) => cartItemsData.find((item) => item.id === productId);
const getCartQuantity = (productId) => {
  const item = getCartItemById(productId);
  return item?.qty || 0;
};
const confirmationEmailInput = document.getElementById("confirmationEmail");
const sendConfirmationBtn = document.getElementById("sendConfirmationBtn");
const confirmationStatus = document.getElementById("confirmationStatus");
const confirmationLog = document.getElementById("confirmationLog");
const shippingUpdateBtn = document.getElementById("shippingUpdateBtn");
const shipNotifySms = document.getElementById("shipNotifySms");
const shipNotifyEmail = document.getElementById("shipNotifyEmail");
const shipNotifyPush = document.getElementById("shipNotifyPush");
const shippingStatus = document.getElementById("shippingStatus");
const shippingLog = document.getElementById("shippingLog");
const promoEmailInput = document.getElementById("promoEmail");
const newsletterFrequency = document.getElementById("newsletterFrequency");
const newsletterJoinBtn = document.getElementById("newsletterJoinBtn");
const newsletterStatus = document.getElementById("newsletterStatus");
const supportMessageInput = document.getElementById("supportMessage");
const supportSubmitBtn = document.getElementById("supportSubmitBtn");
const supportStatus = document.getElementById("supportStatus");
const supportChatToggle = document.getElementById("supportChatToggle");
const supportChat = document.getElementById("supportChat");
const supportChatMessages = document.getElementById("supportChatMessages");
const supportChatInput = document.getElementById("supportChatInput");
const supportChatSendBtn = document.getElementById("supportChatSendBtn");
const notificationFeed = document.getElementById("notificationFeed");
const clearNotificationFeedBtn = document.getElementById("clearNotificationFeed");
let cartItemsData = [];
let wishlistData = [];
let orderHistoryData = [
  {
    id: "INV-1042",
    customer: "Lena Fischer",
    address: "Rosenthaler Str. 72, Berlin",
    payment: "Credit Card",
    total: 42.38,
    status: "Out for delivery",
    items: 3,
    tracking: ["Order received", "Preparing package", "Out for delivery"]
  }
];
const COUPON_LIBRARY = {
  SAVE10: { label: "Save 10%", type: "percent", value: 0.1 },
  FREESHIP: { label: "Free shipping", type: "shipping" },
  EMPLOYEE5: { label: "Employee perk", type: "employee", value: 0.05 }
};
let appliedCoupon = null;
const EMPLOYEE_DISCOUNT_RATE = 0.05;
let employeeDiscountActive = false;
let employeeDiscountRate = EMPLOYEE_DISCOUNT_RATE;
const SHIPPING_UPDATES = [
  "Order confirmed and preparing",
  "Packed and ready for courier pickup",
  "Courier departed and on the way",
  "Courier nearby – please be ready",
  "Delivered 🎉"
];
let shippingStepIndex = 0;
const SUPPORT_BOT_REPLIES = [
  "I'm checking that for you right now.",
  "Thanks for the details! A specialist will follow up shortly.",
  "No worries, I've logged this for the operations team.",
  "Got it! You'll receive an email update once it's resolved."
];
const NOTIFICATION_FEED_KEY = "communicationActivityFeed";
let notificationFeedData = [];
const resetCouponState = () => {
  appliedCoupon = null;
  employeeDiscountActive = false;
  employeeDiscountRate = EMPLOYEE_DISCOUNT_RATE;
};
const setCouponStatus = (message = "", isError = false) => {
  if (!couponStatus) return;
  couponStatus.textContent = message;
  couponStatus.classList.toggle("error", Boolean(isError));
};
const panelHomes = new Map();
if (cartPanelEl?.parentElement) panelHomes.set(cartPanelEl, cartPanelEl.parentElement);
if (wishlistPanelEl?.parentElement) panelHomes.set(wishlistPanelEl, wishlistPanelEl.parentElement);
if (cartPanelEl) cartPanelEl.hidden = true;
if (wishlistPanelEl) wishlistPanelEl.hidden = true;
if (quickPanelSlot) quickPanelSlot.hidden = true;
const resolveStored = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const API_BASE_CANDIDATES = [
  window.API_BASE,
  window.POS_API_BASE,
  resolveStored("POS_API_BASE"),
  resolveStored("API_BASE"),
  "http://127.0.0.1:4000/api",
  "http://localhost:4000/api",
  "/api"
].filter((value) => typeof value === "string" && value.trim().length > 0);
const API_BASE = (API_BASE_CANDIDATES[0] || "/api").replace(/\/$/, "");
const INVENTORY_ENDPOINT = `${API_BASE}/products`;
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();
const DEFAULT_PRODUCTS_LIMIT = 60;
const PRODUCT_REFRESH_INTERVAL_MS = 60_000;
let productsRefreshTimer = null;
let isFetchingProducts = false;
const PRODUCT_FILTERS = {
  ALL: "all",
  DEALS: "deals"
};
let activeProductFilter = PRODUCT_FILTERS.ALL;
let fullProductList = [];
let activeSearchQuery = "";
let activeCategoryFilter = null;

const setActiveNavButton = (targetBtn) => {
  navActionButtons.forEach((btn) => {
    if (btn === targetBtn) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
};

navActionButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveNavButton(btn));
});
dealsBtn?.addEventListener("click", () => setProductFilter(PRODUCT_FILTERS.DEALS));
exploreBtn?.addEventListener("click", () => setProductFilter(PRODUCT_FILTERS.ALL));

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const updateCategoryFocusBanner = (categoryName, details = {}) => {
  if (!categoryFocusBanner) return;
  if (!categoryName) {
    categoryFocusBanner.hidden = true;
    categoryFocusBanner.textContent = "";
    return;
  }
  const { exactCount = 0, relatedCount = 0, hasResults = true } = details;
  const summaryParts = [];
  if (hasResults && exactCount) summaryParts.push(`${exactCount} exact match${exactCount === 1 ? "" : "es"}`);
  if (hasResults && relatedCount) summaryParts.push(`${relatedCount} related`);
  const summary = hasResults
    ? summaryParts.join(" · ") || "No matches yet"
    : "No matches yet";
  categoryFocusBanner.hidden = false;
  categoryFocusBanner.innerHTML = `<strong>AI Filter</strong> ${summary} for <strong>${categoryName}</strong>`;
};

let activeProfileTab = "register";
const setProfileTab = (tabId = "register") => {
  activeProfileTab = tabId;
  profileTabs.forEach((tab) => {
    const isMatch = tab.dataset.profileTab === tabId;
    tab.classList.toggle("active", isMatch);
    tab.setAttribute("aria-selected", isMatch ? "true" : "false");
  });
  profilePanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.profilePanel === tabId);
  });
};

profileTabs.forEach((tab) => {
  tab.addEventListener("click", () => setProfileTab(tab.dataset.profileTab));
});

profileSwitchLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = link.dataset.profileSwitch;
    if (target) setProfileTab(target);
  });
});
setProfileTab("register");

const scrollToElement = (el) => {
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const showQuickPanel = (panel) => {
  if (!panel || !quickPanelContent || !panelHomes.has(panel)) return;
  const current = quickPanelContent.firstElementChild;
  if (current && panelHomes.has(current)) {
    panelHomes.get(current).appendChild(current);
    current.hidden = true;
  }
  panel.hidden = false;
  quickPanelContent.appendChild(panel);
  if (quickPanelSlot) {
    quickPanelSlot.hidden = false;
    quickPanelSlot.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.body.classList.toggle("cart-panel-open", panel === cartPanelEl);
};

const closeQuickPanel = () => {
  if (!quickPanelContent) return;
  const current = quickPanelContent.firstElementChild;
  if (current && panelHomes.has(current)) {
    panelHomes.get(current).appendChild(current);
    current.hidden = true;
  }
  if (quickPanelSlot) quickPanelSlot.hidden = true;
  document.body.classList.remove("cart-panel-open");
};

headerCartBtn?.addEventListener("click", () => showQuickPanel(cartPanelEl));
headerWishlistBtn?.addEventListener("click", () => showQuickPanel(wishlistPanelEl));
quickPanelClose?.addEventListener("click", closeQuickPanel);
const bindContinueShopping = () => {
  continueShoppingBtn = document.getElementById("continueShoppingBtn");
  if (!continueShoppingBtn) return;
  continueShoppingBtn.onclick = () => {
    closeQuickPanel();
    document.body.classList.remove("cart-panel-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
};
bindContinueShopping();

const setCategorySelection = (categoryName = null) => {
  categoryItems.forEach((item) => {
    const label = item.dataset.category || item.textContent.trim();
    item.dataset.category = label;
    item.classList.toggle("category-selected", !!categoryName && label === categoryName);
  });
  categoryStripBoxes.forEach((chip) => {
    const label = chip.dataset.category;
    chip.classList.toggle("category-selected", !!categoryName && label === categoryName);
  });
};

categoryItems.forEach((item) => {
  const label = item.textContent.trim();
  item.dataset.category = label;
  item.setAttribute("role", "button");
  item.setAttribute("tabindex", "0");
  const handleSelection = () => {
    const nextFilter = activeCategoryFilter === label ? null : label;
    setCategoryFilter(nextFilter);
    megaMenu.classList.remove("show");
  };
  item.addEventListener("click", handleSelection);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelection();
    }
  });
});

categoryStripBoxes.forEach((chip) => {
  const handleSelection = () => {
    const label = chip.dataset.category;
    const nextFilter = activeCategoryFilter === label ? null : label;
    setCategoryFilter(nextFilter);
  };
  chip.addEventListener("click", handleSelection);
});

categoryStripNext?.addEventListener("click", () => {
  if (!categoryStripTrack) return;
  categoryStripTrack.scrollBy({ left: 200, behavior: "smooth" });
});

const setSearchPanelVisibility = (shouldShow) => {
  if (!globalSearchPanel) return;
  if (shouldShow) {
    globalSearchPanel.hidden = false;
    globalSearchInput?.focus();
  } else {
    globalSearchPanel.hidden = true;
  }
};

const toggleSearchPanel = () => {
  if (!globalSearchPanel) return;
  const isHidden = globalSearchPanel.hidden;
  setSearchPanelVisibility(isHidden);
};

globalSearchToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleSearchPanel();
});

globalSearchClear?.addEventListener("click", () => {
  if (globalSearchInput) globalSearchInput.value = "";
  setSearchQuery("");
  setSearchPanelVisibility(false);
});

globalSearchInput?.addEventListener("input", (event) => {
  setSearchQuery(event.target.value || "");
});

document.addEventListener("click", (event) => {
  if (!globalSearchPanel || globalSearchPanel.hidden) return;
  if (
    globalSearchPanel.contains(event.target) ||
    globalSearchToggle?.contains(event.target)
  ) {
    return;
  }
  setSearchPanelVisibility(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && globalSearchPanel && !globalSearchPanel.hidden) {
    setSearchPanelVisibility(false);
  }
});

const updateCartCountLabel = () => {
  if (!cartCountLabel) return;
  const totalItems = cartItemsData.reduce((sum, item) => sum + item.qty, 0);
  cartCountLabel.textContent = `(${totalItems} item${totalItems === 1 ? "" : "s"})`;
  if (cartBtnBadge) {
    if (totalItems > 0) {
      cartBtnBadge.hidden = false;
      cartBtnBadge.textContent = String(totalItems);
    } else {
      cartBtnBadge.hidden = true;
    }
  }
};

const renderCartSummary = () => {
  if (!cartSummaryContainer) return;
  if (!cartItemsData.length) {
    cartSummaryContainer.innerHTML = `<div class="cart-empty">Add a product to see the summary.</div>`;
    checkoutBtn?.setAttribute("disabled", "true");
    paymentMethods?.setAttribute("hidden", "true");
    if (checkoutBtn) checkoutBtn.textContent = "Proceed to Checkout";
    return;
  }
  checkoutBtn?.removeAttribute("disabled");
  const totals = getCartTotals();
  const summaryRow = (label, value, extraClass = "") =>
    `<div class="order-summary__row ${extraClass}"><span>${label}</span><span>${value}</span></div>`;
  const promoRow = totals.promoSavings
    ? summaryRow("Product discounts", `- ${formatCurrency(totals.promoSavings)}`, "order-summary__row--savings")
    : "";
  const couponRow = totals.couponSavings
    ? summaryRow(
        appliedCoupon?.label || "Promo code",
        `- ${formatCurrency(totals.couponSavings)}`,
        "order-summary__row--savings"
      )
    : "";
  const employeeRow = summaryRow(
    "Employee discount",
    totals.employeeSavings ? `- ${formatCurrency(totals.employeeSavings)}` : formatCurrency(0),
    totals.employeeSavings ? "order-summary__row--savings" : "order-summary__row--muted"
  );
  cartSummaryContainer.innerHTML = `
    ${summaryRow("Cart subtotal", formatCurrency(totals.subtotal))}
    ${promoRow}
    ${couponRow}
    ${summaryRow("Tax (7%)", formatCurrency(totals.tax))}
    ${summaryRow("Shipping", totals.shipping ? formatCurrency(totals.shipping) : "Free", totals.shipping ? "" : "order-summary__row--muted")}
    ${employeeRow}
    <div class="order-summary__total">
      <div>
        <span>Total due</span>
        <strong>${formatCurrency(totals.total)}</strong>
      </div>
      <span>${totals.items} item${totals.items === 1 ? "" : "s"}</span>
    </div>
  `;
  if (paymentMethods?.hasAttribute("hidden")) {
    if (checkoutBtn) checkoutBtn.textContent = "Proceed to Checkout";
  } else if (checkoutBtn) {
    checkoutBtn.textContent = "Hide payment options";
  }
};

const renderCart = () => {
  if (!cartItemsContainer) return;
  bindContinueShopping();
  updateCartCountLabel();
  if (!cartItemsData.length) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty.</p>
        <p>Add fresh products to get started.</p>
      </div>
    `;
    renderCartSummary();
    syncProductCardQuantities();
    return;
  }
  cartItemsContainer.innerHTML = cartItemsData
    .map((item, index) => {
      const hasDiscount = item.basePrice && item.basePrice > item.price;
      const discountPercent = hasDiscount
        ? Math.round(((item.basePrice - item.price) / item.basePrice) * 100)
        : null;
      const imageSrc = item.image || "https://placehold.co/160x160/DAE5D6/0b4b2e?text=Item";
      return `
        <article class="cart-item" data-cart-index="${index}">
          ${
            discountPercent
              ? `<span class="cart-item__badge">-${discountPercent}%</span>`
              : ""
          }
          <div class="cart-item__media">
            <img src="${imageSrc}" alt="${item.name}">
          </div>
          <div class="cart-item__body">
            <p class="cart-item__name">${item.name}</p>
            ${
              item.unitLabel
                ? `<p class="cart-item__unit">${item.unitLabel}</p>`
                : ""
            }
            <div class="cart-item__pricing">
              <span class="cart-item__price-main">${formatCurrency(item.price)}</span>
              ${
                hasDiscount
                  ? `<span class="cart-item__price-strike">${formatCurrency(item.basePrice)}</span>`
                  : ""
              }
              <button type="button" class="cart-item__heart ${item.savedForLater ? "active" : ""}" data-action="toggle-wishlist" aria-pressed="${item.savedForLater ? "true" : "false"}" aria-label="Save ${item.name} for later">
                <i class="${item.savedForLater ? "fa-solid" : "fa-regular"} fa-heart"></i>
              </button>
            </div>
          </div>
          <div class="cart-item__controls">
            <div class="qty-control" aria-label="Adjust quantity">
              <button type="button" data-action="decrease" aria-label="Decrease quantity">-</button>
              <span>${item.qty}</span>
              <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item__links">
              <button type="button" data-action="wishlist">Save for later</button>
              <button type="button" data-action="remove">Remove</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
  renderCartSummary();
  syncProductCardQuantities();
};

const renderWishlist = () => {
  if (!wishlistContainer) return;
  if (!wishlistData.length) {
    wishlistContainer.innerHTML = `<p class="cart-empty">No saved items yet.</p>`;
    if (wishlistBtnBadge) wishlistBtnBadge.hidden = true;
    syncProductCardFavorites();
    syncProductCardQuantities();
    return;
  }
  wishlistContainer.innerHTML = wishlistData
    .map(
      (item, index) => `
      <div class="wishlist-item" data-wishlist-index="${index}">
        <div class="wishlist-item__media">
          <img src="${item.image || "https://placehold.co/160x160/DAE5D6/0b4b2e?text=Item"}" alt="${item.name}">
        </div>
        <div class="wishlist-item__info">
          <p>${item.name}</p>
          <p class="price">${formatCurrency(item.price)}</p>
        </div>
        <div class="cart-item__links">
          <button type="button" data-action="move-to-cart">Add to cart</button>
          <button type="button" data-action="remove-wish">Remove</button>
        </div>
      </div>
    `
    )
    .join("");
  if (wishlistBtnBadge) {
    wishlistBtnBadge.hidden = false;
    wishlistBtnBadge.textContent = String(wishlistData.length);
  }
  syncProductCardFavorites();
  syncProductCardQuantities();
};

const addProductToCart = (product) => {
  if (!product) return;
  const productId = getProductId(product);
  const { basePrice, promoPrice, hasPromo } = getPriceMeta(product);
  const resolvedPrice =
    (hasPromo && Number.isFinite(promoPrice) ? promoPrice : basePrice) ||
    Number(product.price) ||
    0;
  const unitLabel = formatBasePrice(product, resolvedPrice);
  const image = resolveProductImage(product);
  const existing = cartItemsData.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItemsData.push({
      id: productId,
      name: product.name || "Product",
      price: resolvedPrice,
      basePrice: basePrice || resolvedPrice,
      unitLabel,
      image,
      qty: 1,
      savedForLater: false
    });
  }
  renderCart();
  if (profileStatus) profileStatus.textContent = `${product.name || "Product"} added to cart.`;
};

const decreaseCartItemQuantity = (productId) => {
  const item = getCartItemById(productId);
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) {
    cartItemsData = cartItemsData.filter((entry) => entry.id !== productId);
  }
  renderCart();
};

cartItemsContainer?.addEventListener("click", (event) => {
  const index = event.target.closest(".cart-item")?.dataset.cartIndex;
  if (index === undefined) return;
  const item = cartItemsData[Number(index)];
  if (!item) return;
  const action = event.target.dataset.action;
  if (action === "increase") item.qty += 1;
  if (action === "decrease") {
    item.qty -= 1;
    if (item.qty <= 0) {
      cartItemsData = cartItemsData.filter((_, i) => i !== Number(index));
    }
  }
  if (action === "remove") cartItemsData = cartItemsData.filter((_, i) => i !== Number(index));
  if (action === "wishlist") {
    wishlistData = wishlistData.filter((wish) => wish.sourceId !== item.id);
    wishlistData.push({
      id: `wish-${Date.now()}`,
      sourceId: item.id,
      name: item.name,
      price: item.price,
      basePrice: item.basePrice || item.price,
      unitLabel: item.unitLabel,
      image: item.image
    });
    cartItemsData = cartItemsData.filter((_, i) => i !== Number(index));
  }
  if (action === "toggle-wishlist") {
    if (!item.savedForLater) {
      removeProductFromWishlist(item.id, { resetCart: false });
      wishlistData.push({
        id: `wish-${Date.now()}`,
        name: item.name,
        price: item.price,
        basePrice: item.basePrice || item.price,
        unitLabel: item.unitLabel,
        image: item.image,
        sourceId: item.id
      });
      item.savedForLater = true;
    } else {
      removeProductFromWishlist(item.id);
      item.savedForLater = false;
    }
    renderCart();
    renderWishlist();
    return;
  }
  renderCart();
  renderWishlist();
});

wishlistContainer?.addEventListener("click", (event) => {
  const index = event.target.closest(".wishlist-item")?.dataset.wishlistIndex;
  if (index === undefined) return;
  const action = event.target.dataset.action;
  if (action === "move-to-cart") {
    const item = wishlistData[Number(index)];
    const restoredId = item.sourceId || item.id || `cart-${Date.now()}`;
    cartItemsData.push({
      ...item,
      qty: 1,
      id: restoredId,
      basePrice: item.basePrice || item.price,
      image: item.image || "https://placehold.co/160x160/DAE5D6/0b4b2e?text=Item",
      unitLabel: item.unitLabel || "",
      savedForLater: false
    });
    wishlistData = wishlistData.filter((_, i) => i !== Number(index));
  }
  if (action === "remove-wish") {
    const removed = wishlistData[Number(index)];
    wishlistData = wishlistData.filter((_, i) => i !== Number(index));
    if (removed?.sourceId) {
      const cartItem = cartItemsData.find((entry) => entry.id === removed.sourceId);
      if (cartItem) cartItem.savedForLater = false;
    }
  }
  renderCart();
  renderWishlist();
});

const applyCouponFromInput = () => {
  const code = (couponInput?.value || "").trim().toUpperCase();
  if (!code) {
    resetCouponState();
    setCouponStatus("Coupon cleared.");
    renderCartSummary();
    return;
  }
  const coupon = COUPON_LIBRARY[code];
  if (!coupon) {
    resetCouponState();
    setCouponStatus("Sorry, that code is invalid.", true);
    renderCartSummary();
    return;
  }
  appliedCoupon = { code, ...coupon };
  employeeDiscountActive = coupon.type === "employee";
  employeeDiscountRate = coupon.type === "employee" ? coupon.value || EMPLOYEE_DISCOUNT_RATE : EMPLOYEE_DISCOUNT_RATE;
  setCouponStatus(`Coupon ${code} applied: ${coupon.label}.`);
  renderCartSummary();
};

applyCouponBtn?.addEventListener("click", applyCouponFromInput);
couponInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyCouponFromInput();
  }
});

checkoutBtn?.addEventListener("click", () => {
  if (!cartItemsData.length) return;
  const shouldShow = paymentMethods?.hasAttribute("hidden");
  if (!paymentMethods) return;
  if (shouldShow) {
    paymentMethods.removeAttribute("hidden");
    checkoutBtn.textContent = "Hide payment options";
  } else {
    paymentMethods.setAttribute("hidden", "true");
    checkoutBtn.textContent = "Proceed to Checkout";
  }
});

const getCartTotals = () => {
  const subtotal = cartItemsData.reduce((sum, item) => sum + item.price * item.qty, 0);
  const baseSubtotal = cartItemsData.reduce(
    (sum, item) => sum + (item.basePrice || item.price) * item.qty,
    0
  );
  const promoSavings = Math.max(0, baseSubtotal - subtotal);
  let couponSavings = 0;
  let subtotalAfterCoupon = subtotal;
  if (appliedCoupon?.type === "percent" && Number.isFinite(appliedCoupon.value)) {
    const savings = subtotal * appliedCoupon.value;
    couponSavings += savings;
    subtotalAfterCoupon -= savings;
  } else if (appliedCoupon?.type === "flat" && Number.isFinite(appliedCoupon.value)) {
    const savings = Math.min(appliedCoupon.value, subtotalAfterCoupon);
    couponSavings += savings;
    subtotalAfterCoupon -= savings;
  }
  let shipping = subtotal ? 3.5 : 0;
  if (appliedCoupon?.type === "shipping" && shipping) {
    couponSavings += shipping;
    shipping = 0;
  }
  const discountedSubtotal = Math.max(0, subtotalAfterCoupon);
  const tax = discountedSubtotal * 0.07;
  const employeeSavings = employeeDiscountActive
    ? (discountedSubtotal + tax + shipping) * employeeDiscountRate
    : 0;
  const total = Math.max(0, discountedSubtotal + tax + shipping - employeeSavings);
  return {
    subtotal,
    baseSubtotal,
    promoSavings,
    couponSavings,
    discountedSubtotal,
    tax,
    shipping,
    employeeSavings,
    total,
    items: cartItemsData.reduce((sum, item) => sum + item.qty, 0)
  };
};

const updateOrderConfirmation = (order = null) => {
  if (!orderConfirmation) return;
  if (!order) {
    orderConfirmation.innerHTML = "<h2>Order Confirmation</h2><p>No orders submitted yet.</p>";
    return;
  }
  orderConfirmation.innerHTML = `
    <h2>Order Confirmation</h2>
    <p><strong>Order:</strong> ${order.id}</p>
    <p><strong>Ship to:</strong> ${order.customer}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <p><strong>Payment:</strong> ${order.payment}</p>
    <p><strong>Total paid:</strong> ${order.total.toFixed(2)} €</p>
    <p>Status: ${order.status}</p>
  `;
};

const renderOrderHistory = () => {
  if (!orderHistoryListEl) return;
  if (!orderHistoryData.length) {
    orderHistoryListEl.innerHTML = "<li>No orders yet.</li>";
    return;
  }
  orderHistoryListEl.innerHTML = orderHistoryData
    .map(
      (order) => `
      <li class="order-card" data-order-id="${order.id}">
        <div class="order-card__info">
          <strong>${order.id}</strong>
          <p>${order.items} items · ${order.total.toFixed(2)} €</p>
          <p>Status: ${order.status}</p>
        </div>
        <div class="order-card__actions">
          <button type="button" data-action="details">View details</button>
          <button type="button" data-action="track">Track order</button>
        </div>
      </li>
    `
    )
    .join("");
};

const renderOrderTracking = (order = null) => {
  const trackingEl = document.querySelector(".order-tracking__timeline");
  if (!trackingEl) return;
  if (!order) {
    trackingEl.innerHTML = "<p>Select an order to see tracking updates.</p>";
    return;
  }
  const steps = order.tracking || [];
  trackingEl.innerHTML = steps
    .map(
      (step) => `
      <div class="tracking-step">
        <span class="tracking-step__bullet"></span>
        <div class="tracking-step__body">
          <strong>${step}</strong>
        </div>
      </div>
    `
    )
    .join("");
};

const checkoutForm = document.getElementById("checkoutForm");
checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(checkoutForm);
  const name = (formData.get("shippingName") || "").toString().trim() || "Customer";
  const address =
    (formData.get("shippingAddress") || "").toString().trim() || "Address provided at checkout";
  const payment = (formData.get("paymentMethod") || "").toString().trim() || "Saved method";
  const { total } = getCartTotals();
  const newOrder = {
    id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: name,
    address,
    payment,
    total,
    status: "Order received",
    items: cartItemsData.reduce((sum, item) => sum + item.qty, 0),
    tracking: ["Order received", "Preparing package", "Awaiting pickup"]
  };
  orderHistoryData.unshift(newOrder);
  updateOrderConfirmation(newOrder);
  renderOrderHistory();
  renderOrderTracking(newOrder);
  profileStatus.textContent = "Order placed successfully!";
  checkoutForm.reset();
});

orderHistoryListEl?.addEventListener("click", (event) => {
  const orderId = event.target.closest(".order-card")?.dataset.orderId;
  if (!orderId) return;
  const order = orderHistoryData.find((item) => item.id === orderId);
  if (!order) return;
  if (event.target.dataset.action === "details") {
    updateOrderConfirmation(order);
  }
  if (event.target.dataset.action === "track") {
    renderOrderTracking(order);
  }
});
let generatedOtpCode = "";

registerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  profileStatus.textContent = "Account created! Please verify your email to continue.";
  setProfileTab("login");
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  profileStatus.textContent = "Logged in successfully. Welcome back!";
  setProfileMode(false);
});

otpSendBtn?.addEventListener("click", () => {
  generatedOtpCode = String(Math.floor(100000 + Math.random() * 900000));
  profileStatus.textContent = `OTP ${generatedOtpCode} sent. Please enter it below.`;
});

otpVerifyBtn?.addEventListener("click", () => {
  const input = (otpInput?.value || "").trim();
  if (!generatedOtpCode) {
    profileStatus.textContent = "Please request an OTP first.";
    return;
  }
  if (input === generatedOtpCode) {
    profileStatus.textContent = "OTP verified. You are now logged in.";
    generatedOtpCode = "";
    otpInput.value = "";
    setProfileMode(false);
  } else {
    profileStatus.textContent = "Invalid OTP. Please try again.";
  }
});

profileForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  profileStatus.textContent = "Profile updated successfully.";
});

recoveryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  profileStatus.textContent = "Password reset link sent. Please check your inbox.";
  setProfileTab("login");
});

guestCheckoutBtn?.addEventListener("click", () => {
  profileStatus.textContent = "Guest checkout started. You can continue to the cart.";
  setProfileMode(false);
});

const setProfileMode = (isActive) => {
  if (!profileArea) return;
  if (isActive) {
    document.body.classList.add("profile-mode");
    profileArea.classList.add("show");
  } else {
    document.body.classList.remove("profile-mode");
    profileArea.classList.remove("show");
  }
};

const closeProfileMode = () => setProfileMode(false);

const openProfileMode = () => {
  setProfileTab("register");
  if (profileStatus) profileStatus.textContent = "";
  setProfileMode(true);
};

categoriesBtn.addEventListener("click", () => {
  megaMenu.classList.toggle("show");
  closeProfileMode();
});

profileBtn.addEventListener("click", () => {
  const isActive = profileArea?.classList.contains("show");
  if (isActive) {
    closeProfileMode();
  } else {
    openProfileMode();
  }
  megaMenu.classList.remove("show");
});

document.querySelectorAll("[data-close-profile]").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeProfileMode();
  });
});

document.addEventListener("click", (e) => {
  const withinCategoriesBtn = e.target.closest && e.target.closest("#categoriesBtn");
  if (!megaMenu.contains(e.target) && !withinCategoriesBtn) {
    megaMenu.classList.remove("show");
  }
});

// ===== ADDRESS MODAL LOGIC =====
const toggleBodyScroll = (shouldLock) => {
  document.body.style.overflow = shouldLock ? "hidden" : "";
};

const setAddressStatus = (message = "", isError = false) => {
  if (!addressStatus) return;
  addressStatus.textContent = message;
  addressStatus.classList.toggle("error", isError);
};

const setSavedAddressDisplay = (data) => {
  if (!data) return;
  const formatted = `${data.street} ${data.houseNumber}, ${data.postalCode} ${data.city}`;
  addressDisplay.textContent = formatted;
  addressBtn.classList.add("saved");
};

const loadSavedAddress = () => {
  const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.street) {
      streetInput.value = parsed.street || "";
      houseNumberInput.value = parsed.houseNumber || "";
      postalCodeInput.value = parsed.postalCode || "";
      cityInput.value = parsed.city || "";
      setSavedAddressDisplay(parsed);
    }
  } catch (error) {
    console.warn("Failed to parse saved address", error);
  }
};

const openAddressModal = () => {
  if (!addressModal) return;
  addressModal.classList.add("show");
  addressModal.setAttribute("aria-hidden", "false");
  toggleBodyScroll(true);
  setAddressStatus("");
};

const closeAddressModal = () => {
  if (!addressModal) return;
  addressModal.classList.remove("show");
  addressModal.setAttribute("aria-hidden", "true");
  toggleBodyScroll(false);
};

const parseAddressString = (value) => {
  if (!value) return null;
  const [streetPart, cityPart] = value.split(",");
  if (!streetPart || !cityPart) return null;
  const streetPieces = streetPart.trim().split(" ");
  const houseNumber = streetPieces.pop();
  const street = streetPieces.join(" ");
  const cityPieces = cityPart.trim().split(" ");
  const postalCode = cityPieces.shift();
  const city = cityPieces.join(" ");
  if (!street || !houseNumber || !postalCode || !city) return null;
  return { street, houseNumber, postalCode, city };
};

const fillFields = ({ street, houseNumber, postalCode, city }) => {
  if (street) streetInput.value = street;
  if (houseNumber) houseNumberInput.value = houseNumber;
  if (postalCode) postalCodeInput.value = postalCode;
  if (city) cityInput.value = city;
};

addressBtn?.addEventListener("click", openAddressModal);
closeAddressModalBtn?.addEventListener("click", closeAddressModal);
addressModal?.addEventListener("click", (e) => {
  if (e.target === addressModal) {
    closeAddressModal();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && addressModal?.classList.contains("show")) {
    closeAddressModal();
  }
});

addressSearch?.addEventListener("change", (e) => {
  const parsed = parseAddressString(e.target.value);
  if (parsed) {
    fillFields(parsed);
    setAddressStatus("Address populated from the search suggestion.");
  }
});

addressForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const addressPayload = {
    street: streetInput.value.trim(),
    houseNumber: houseNumberInput.value.trim(),
    postalCode: postalCodeInput.value.trim(),
    city: cityInput.value.trim(),
  };

  if (Object.values(addressPayload).some((value) => !value)) {
    setAddressStatus("Please complete all fields before saving.", true);
    return;
  }

  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addressPayload));
  setSavedAddressDisplay(addressPayload);
  setAddressStatus("Address saved. You can close this window.");
  setTimeout(closeAddressModal, 800);
});

const reverseGeocode = async (lat, lon) => {
  const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const response = await fetch(endpoint, {
    headers: {
      "Accept-Language": "en",
    },
  });
  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }
  return response.json();
};

const handleDetectLocation = () => {
  if (!navigator.geolocation) {
    setAddressStatus("Geolocation is not supported in this browser.", true);
    return;
  }

  setAddressStatus("Detecting your current location...");
  detectLocationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        setAddressStatus("Fetching address details...");
        const data = await reverseGeocode(latitude, longitude);
        const address = data.address || {};
        fillFields({
          street: address.road || address.pedestrian || "",
          houseNumber: address.house_number || "",
          postalCode: address.postcode || "",
          city: address.city || address.town || address.village || "",
        });
        setAddressStatus("Address detected. Please confirm and save.");
      } catch (error) {
        console.error(error);
        setAddressStatus("Could not detect the address automatically.", true);
      } finally {
        detectLocationBtn.disabled = false;
      }
    },
    (error) => {
      console.error(error);
      setAddressStatus("Permission denied or location unavailable.", true);
      detectLocationBtn.disabled = false;
    }
  );
};

detectLocationBtn?.addEventListener("click", handleDetectLocation);
loadSavedAddress();

// ===== PRODUCT GRID LOGIC =====
const selectedProductIds = new Set();
const CATEGORY_PRIORITY = ["Obst", "Non-Food"];
const productCache = new Map();
const isProductFavorited = (productId) =>
  wishlistData.some((item) => item.sourceId === productId);

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return NaN;
  const str = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const num = Number.parseFloat(str);
  return Number.isFinite(num) ? num : NaN;
};

const getPriceMeta = (product = {}) => {
  const basePrice = Number(product.price) || 0;
  const promoPriceCandidate = parseNumber(product.promoPrice);
  const hasPromo =
    Number.isFinite(promoPriceCandidate) &&
    promoPriceCandidate > 0 &&
    promoPriceCandidate < basePrice;
  return {
    basePrice,
    hasPromo,
    promoPrice: hasPromo ? promoPriceCandidate : null
  };
};

const parseUnitQuantity = (raw) => {
  if (!raw) return null;
  const str = String(raw).toLowerCase();
  const pattern = [
    { regex: /(\d+(?:[.,]\d+)?)\s*(kg|kilogram)/, factor: 1, unit: "kg" },
    { regex: /(\d+(?:[.,]\d+)?)\s*g/, factor: 0.001, unit: "kg" },
    { regex: /(\d+(?:[.,]\d+)?)\s*(l|liter|ltr)/, factor: 1, unit: "L" },
    { regex: /(\d+(?:[.,]\d+)?)\s*ml/, factor: 0.001, unit: "L" }
  ];
  for (const { regex, factor, unit } of pattern) {
    const match = str.match(regex);
    if (match) {
      const qty = parseFloat(match[1].replace(",", "."));
      if (Number.isFinite(qty) && qty > 0) {
        return { quantity: qty * factor, unit };
      }
    }
  }
  return null;
};

const formatBasePrice = (product, unitPrice) => {
  const explicitPrice = parseNumber(product.basePrice);
  if (Number.isFinite(explicitPrice) && explicitPrice > 0 && product.basePriceUnit) {
    return `${formatCurrency(explicitPrice)}/${product.basePriceUnit}`;
  }
  const parsedDimensions =
    parseUnitQuantity(product.dimensions) ||
    parseUnitQuantity(product.shortDesc) ||
    parseUnitQuantity(product.longDesc) ||
    parseUnitQuantity(product.metaDesc);
  if (parsedDimensions?.quantity) {
    const perUnit = unitPrice / parsedDimensions.quantity;
    if (Number.isFinite(perUnit) && perUnit > 0) {
      return `${formatCurrency(perUnit)}/${parsedDimensions.unit}`;
    }
  }
  const weight = Number(product.weight);
  if (Number.isFinite(weight) && weight > 0) {
    const perUnit = unitPrice / weight;
    if (Number.isFinite(perUnit) && perUnit > 0) {
      if (weight < 0.1) {
        return `${formatCurrency(perUnit * 0.1)}/100g`;
      }
      return `${formatCurrency(perUnit)}/kg`;
    }
  }
  return "";
};

const PLACEHOLDER_PRODUCT_IMAGE = "https://placehold.co/200x200/DAE5D6/0b4b2e?text=INVENTRA";

const resolveImageUrl = (path = "") => {
  const trimmed = String(path || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

const resolveProductImage = (product = {}) => {
  const candidate =
    product.pictureUrl ||
    product.picture ||
    product.image ||
    product.imageUrl ||
    "";
  const trimmedCandidate = String(candidate || "").trim();
  if (!trimmedCandidate) return PLACEHOLDER_PRODUCT_IMAGE;
  return resolveImageUrl(trimmedCandidate) || PLACEHOLDER_PRODUCT_IMAGE;
};

const getProductId = (product = {}) => product.id || product._id || product.ean || product.plu || "";

const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const scrollToCategorySection = (sectionId) => {
  if (!sectionId) return;
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const syncProductCardFavorites = () => {
  if (!productCollections) return;
  productCollections.querySelectorAll(".product-card__favorite").forEach((button) => {
    const productId = button.dataset.productId;
    const active = isProductFavorited(productId);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    const icon = button.querySelector("i");
    if (icon) {
      icon.className = `${active ? "fa-solid" : "fa-regular"} fa-heart`;
    }
  });
};

const syncProductCardQuantities = () => {
  if (!productCollections) return;
  productCollections.querySelectorAll(".product-card").forEach((card) => {
    const productId = card.dataset.productId;
    if (!productId) return;
    const qty = getCartQuantity(productId);
    const addBtn = card.querySelector(".product-card__add");
    const qtyBox = card.querySelector(".product-card__qty");
    const controlShell = card.querySelector(".product-card__controls");
    const qtyValue = card.querySelector(".product-card__qty-value");
    if (!addBtn || !qtyBox || !qtyValue) return;
    qtyValue.textContent = qty > 0 ? qty : "0";
    if (controlShell) controlShell.classList.toggle("is-active", qty > 0);
  });
};

const setCartSavedState = (productId, isSaved) => {
  cartItemsData.forEach((item) => {
    if (item.id === productId) item.savedForLater = isSaved;
  });
};

const removeProductFromWishlist = (productId, { resetCart = true } = {}) => {
  wishlistData = wishlistData.filter((item) => item.sourceId !== productId);
  if (resetCart) setCartSavedState(productId, false);
};

const appendCommLog = (listEl, message) => {
  if (!listEl) return;
  const entry = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  entry.textContent = `${timestamp} · ${message}`;
  listEl.prepend(entry);
  while (listEl.children.length > 6) {
    listEl.lastElementChild?.remove();
  }
};

const addProductToWishlistFromCatalog = (productId) => {
  const product = productCache.get(productId);
  if (!product) return;
  removeProductFromWishlist(productId, { resetCart: false });
  const { basePrice, hasPromo, promoPrice } = getPriceMeta(product);
  const fallbackPrice = Number(product.price) || basePrice || 0;
  const calculatedPrice =
    hasPromo && Number.isFinite(promoPrice) ? promoPrice : basePrice;
  const resolvedPrice = Number.isFinite(calculatedPrice) ? calculatedPrice : fallbackPrice;
  wishlistData.push({
    id: `wish-${productId}-${Date.now()}`,
    sourceId: productId,
    name: product.name || "Product",
    price: resolvedPrice,
    basePrice: basePrice || resolvedPrice,
    unitLabel: formatBasePrice(product, resolvedPrice),
    image: resolveProductImage(product)
  });
  setCartSavedState(productId, true);
};

const toggleProductFavorite = (productId) => {
  if (!productId) return;
  if (isProductFavorited(productId)) {
    removeProductFromWishlist(productId);
  } else {
    addProductToWishlistFromCatalog(productId);
  }
  renderWishlist();
};

const buildProductCard = (product) => {
  const productId = getProductId(product);
  if (!productId) return null;
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.productId = productId;

  const { basePrice, hasPromo, promoPrice } = getPriceMeta(product);
  const priceLabel = formatCurrency(hasPromo ? promoPrice : basePrice);
  const baseLabel = hasPromo ? formatCurrency(basePrice) : "";
  const unitLabel = formatBasePrice(product, hasPromo ? promoPrice : basePrice);
  const imageUrl = resolveProductImage(product);
  const discountPercent =
    hasPromo && basePrice > 0
      ? Math.round(((basePrice - promoPrice) / basePrice) * 100)
      : null;
  const favorited = isProductFavorited(productId);
  const quantityInCart = getCartQuantity(productId);
  const hasQuantity = quantityInCart > 0;

  card.innerHTML = `
    <div class="product-card__image" data-product-id="${productId}">
      ${
        discountPercent
          ? `<span class="product-card__badge">-${discountPercent}%</span>`
          : ""
      }
      <img src="${imageUrl}" alt="${product.name || "Product"}" loading="lazy">
      <div class="product-card__controls ${hasQuantity ? "is-active" : ""}" data-product-id="${productId}">
        <div class="product-card__qty" data-product-id="${productId}">
          <button type="button" class="product-card__qty-btn" data-product-id="${productId}" data-action="decrease" aria-label="Decrease quantity">-</button>
          <span class="product-card__qty-value">${hasQuantity ? quantityInCart : 0}</span>
          <button type="button" class="product-card__qty-btn" data-product-id="${productId}" data-action="increase" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="product-card__add" data-product-id="${productId}" aria-label="Add ${product.name || "product"} to cart">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <button type="button" class="product-card__favorite ${favorited ? "active" : ""}" data-product-id="${productId}" aria-pressed="${favorited ? "true" : "false"}" aria-label="Save ${product.name || "product"} for later">
        <i class="${favorited ? "fa-solid" : "fa-regular"} fa-heart"></i>
      </button>
    </div>
    <div class="product-card__pricing">
      <span class="product-card__price ${hasPromo ? "product-card__promo" : ""}">${priceLabel}</span>
      ${
        hasPromo
          ? `<span class="product-card__price product-card__price--striked">${baseLabel}</span>`
          : ""
      }
    </div>
    <p class="product-card__name">${product.name || "Unnamed product"}</p>
    ${unitLabel ? `<p class="product-card__unit">${unitLabel}</p>` : ""}
  `;

  return card;
};

const buildBreadcrumbTrail = (product = {}) => {
  const crumbItems = [{ label: "Home", target: "home" }];
  const rawCrumbs = [
    product.primaryCategory,
    product.secondaryCategory,
    product.category
  ].filter((value) => typeof value === "string" && value.trim().length);
  const seen = new Set();
  rawCrumbs.forEach((value) => {
    const slug = slugify(value);
    if (!seen.has(slug)) {
      seen.add(slug);
      crumbItems.push({ label: value, target: `category-${slug}` });
    }
  });
  crumbItems.push({ label: product.name || "Product", target: null });
  const items = crumbItems.map((crumb, index) => {
    const isLast = index === crumbItems.length - 1;
    if (isLast || !crumb.target) {
      return `<li ${isLast ? 'aria-current="page"' : ""}>${crumb.label}</li>`;
    }
    return `<li><button type="button" class="breadcrumb-link" data-breadcrumb-target="${crumb.target}">${crumb.label}</button></li>`;
  });
  return `<nav class="product-detail-breadcrumb" aria-label="Breadcrumb"><ol>${items.join(
    ""
  )}</ol></nav>`;
};

const buildDetailInfoMarkup = (product = {}) => {
  const sections = [];
  const pushSection = (title, value) => {
    if (!value) return;
    sections.push(`<h4>${title}</h4><p>${value}</p>`);
  };
  pushSection("Description", product.shortDesc || product.longDesc);
  pushSection("Long description", product.longDesc && product.longDesc !== product.shortDesc ? product.longDesc : "");
  pushSection("Ingredients", product.metaDesc);
  pushSection("Dimensions", product.dimensions);
  pushSection("Supplier", product.supplier);
  pushSection("Brand", product.brand);
  if (!sections.length) {
    return "<p>More product information will be available soon.</p>";
  }
  return sections.join("");
};

const renderDetailPane = (product = null) => {
  if (!productDetailPane) return;
  if (!product) {
    productDetailPane.hidden = true;
    productDetailPane.classList.remove("show");
    productDetailPane.innerHTML = "";
    return;
  }
  const productId = getProductId(product);
  const { basePrice, hasPromo, promoPrice } = getPriceMeta(product);
  const priceLabel = formatCurrency(hasPromo ? promoPrice : basePrice);
  const unitLabel = formatBasePrice(product, hasPromo ? promoPrice : basePrice);
  const breadcrumb = buildBreadcrumbTrail(product);
  const infoMarkup = buildDetailInfoMarkup(product);
  const imageUrl = resolveProductImage(product);

  productDetailPane.innerHTML = `
    <div class="product-detail-shell">
      ${breadcrumb}
      <div class="product-detail-layout">
        <div class="product-detail-media">
          <img src="${imageUrl}" alt="${product.name || "Product"} detail image">
        </div>
        <div class="product-detail-card">
          <div>
            <div class="product-detail-brand">${product.brand || ""}</div>
            <h3>${product.name || "Product"}</h3>
            <p class="product-detail-price">${priceLabel}</p>
            ${unitLabel ? `<p class="product-detail-unit">${unitLabel}</p>` : ""}
          </div>
          <button type="button" class="product-detail-add" data-product-id="${productId}">Add Item</button>
          <div class="product-detail-info" data-open="false">
            <button type="button" class="product-detail-info__toggle" aria-expanded="false">
              Product information
              <span class="product-detail-info__chevron">⌄</span>
            </button>
            <div class="product-detail-info__body">
              ${infoMarkup}
            </div>
          </div>
          <button type="button" class="product-detail-close">Close details</button>
        </div>
      </div>
    </div>
  `;
  productDetailPane.hidden = false;
  productDetailPane.classList.add("show");

  const infoWrapper = productDetailPane.querySelector(".product-detail-info");
  const infoToggle = productDetailPane.querySelector(".product-detail-info__toggle");
  infoToggle?.addEventListener("click", () => {
    const isOpen = infoWrapper.classList.toggle("open");
    infoToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  const detailAddBtn = productDetailPane.querySelector(".product-detail-add");
  detailAddBtn?.addEventListener("click", () => {
    handleDetailAdd(productId, detailAddBtn);
  });

  productDetailPane.querySelector(".product-detail-close")?.addEventListener("click", () => {
    renderDetailPane(null);
  });
};

const loadNotificationFeed = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_FEED_KEY);
    if (stored) {
      notificationFeedData = JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Unable to load notification feed", error);
  }
};

const persistNotificationFeed = () => {
  try {
    localStorage.setItem(NOTIFICATION_FEED_KEY, JSON.stringify(notificationFeedData.slice(0, 12)));
  } catch (error) {
    console.warn("Unable to persist notification feed", error);
  }
};

const renderNotificationFeed = () => {
  if (!notificationFeed) return;
  if (!notificationFeedData.length) {
    notificationFeed.innerHTML = "<li>No notifications yet.</li>";
    return;
  }
  notificationFeed.innerHTML = notificationFeedData
    .map(
      (entry) => `
        <li>
          <span>${entry.type}</span>
          <div>${entry.message}</div>
        </li>
      `
    )
    .join("");
};

const pushNotificationFeed = (type, message) => {
  notificationFeedData.unshift({ type, message, ts: Date.now() });
  if (notificationFeedData.length > 12) notificationFeedData.pop();
  persistNotificationFeed();
  renderNotificationFeed();
};

productDetailPane?.addEventListener("click", (event) => {
  const crumbButton = event.target.closest("[data-breadcrumb-target]");
  if (crumbButton) {
    event.preventDefault();
    const targetId = crumbButton.dataset.breadcrumbTarget;
    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderDetailPane(null);
      return;
    }
    const navigateToSection = () => {
      scrollToCategorySection(targetId);
      renderDetailPane(null);
    };
    if (activeProductFilter !== PRODUCT_FILTERS.ALL) {
      setProductFilter(PRODUCT_FILTERS.ALL);
      setTimeout(navigateToSection, 80);
    } else {
      navigateToSection();
    }
  }
});

const setProductsStatus = (message, tone = "neutral") => {
  if (!productsStatus) return;
  productsStatus.textContent = message;
  productsStatus.dataset.tone = tone;
};

const getCategoryName = (product = {}) => {
  const candidates = [
    product.secondaryCategory,
    product.primaryCategory,
    product.category,
    product.metaTitle,
    "Other"
  ];
  return candidates.find((value) => typeof value === "string" && value.trim().length) || "Other";
};

const sortCategories = (categories = []) => {
  const weight = (name) => {
    const normalized = name.toLowerCase();
    const idx = CATEGORY_PRIORITY.findIndex(
      (entry) => entry.toLowerCase() === normalized
    );
    return idx === -1 ? CATEGORY_PRIORITY.length : idx;
  };
  return categories.sort((a, b) => {
    const wDiff = weight(a) - weight(b);
    if (wDiff !== 0) return wDiff;
    return a.localeCompare(b, "de", { sensitivity: "base" });
  });
};

const renderProducts = (products = [], categoryContext = null, overrideEmptyMessage = null) => {
  if (!productCollections) return;
  productCollections.innerHTML = "";
  const isDealsView = activeProductFilter === PRODUCT_FILTERS.DEALS;
  const isSearching = Boolean(activeSearchQuery.trim().length);
  if (!products.length) {
    const infoMessage =
      overrideEmptyMessage ||
      (isSearching
        ? `We couldn't find anything for “${activeSearchQuery}”. Please try another keyword or adjust your filters.`
        : isDealsView
        ? "No discounted products are available right now."
        : "No inventory items are available yet.");
    setProductsStatus(infoMessage, "info");
    productCollections.innerHTML = `
      <div class="products-empty">
        <div class="products-empty__emoji">🛒</div>
        <p>${infoMessage}</p>
      </div>
    `;
    return;
  }
  products.forEach((product) => {
    const productId = getProductId(product);
    if (productId) productCache.set(productId, product);
  });
  const groups = new Map();
  products.forEach((product) => {
    const productId = getProductId(product);
    if (!productId) return;
    const category = getCategoryName(product);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(product);
  });

  const categoryOrder = sortCategories([...groups.keys()]);
  const fragment = document.createDocumentFragment();
  const renderedIds = new Set();

  const appendCollection = (title, collectionProducts = [], anchorId = null) => {
    if (!collectionProducts.length) return;
    const sectionEl = document.createElement("section");
    sectionEl.className = "product-collection";
    if (anchorId) sectionEl.id = anchorId;

    const titleEl = document.createElement("h3");
    titleEl.className = "product-collection__title";
    titleEl.textContent = title;

    const gridEl = document.createElement("div");
    gridEl.className = "product-grid";
    collectionProducts.forEach((product) => {
      const productId = getProductId(product);
      if (productId) renderedIds.add(productId);
      const card = buildProductCard(product);
      if (card) gridEl.appendChild(card);
    });

    sectionEl.appendChild(titleEl);
    sectionEl.appendChild(gridEl);
    fragment.appendChild(sectionEl);
  };

  if (categoryContext?.exact?.length) {
    appendCollection(
      categoryContext.categoryName || "Exact matches",
      categoryContext.exact,
      `category-focus-${slugify(categoryContext.categoryName || "exact")}`
    );
  }

  if (categoryContext?.related?.length) {
    appendCollection(
      `Related to ${categoryContext.categoryName}`,
      categoryContext.related,
      `category-related-${slugify(categoryContext.categoryName || "related")}`
    );
  }

  categoryOrder.forEach((categoryName) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "product-collection";
    const categorySlug = slugify(categoryName);
    sectionEl.id = `category-${categorySlug}`;

    const titleEl = document.createElement("h3");
    titleEl.className = "product-collection__title";
    titleEl.textContent = categoryName;

    const gridEl = document.createElement("div");
    gridEl.className = "product-grid";
    gridEl.dataset.category = categoryName;

    groups.get(categoryName).forEach((product) => {
      const productId = getProductId(product);
      if (renderedIds.has(productId)) return;
      const card = buildProductCard(product);
      if (card) gridEl.appendChild(card);
      renderedIds.add(productId);
    });

    if (gridEl.children.length) {
      sectionEl.appendChild(titleEl);
      sectionEl.appendChild(gridEl);
      fragment.appendChild(sectionEl);
    }
  });
  productCollections.appendChild(fragment);
  syncProductCardFavorites();
  syncProductCardQuantities();
  let statusLabel = "";
  if (categoryContext?.categoryName) {
    const exactCount = categoryContext.exact?.length || 0;
    const relatedCount = categoryContext.related?.length || 0;
    statusLabel = `AI filter · ${exactCount} exact match${exactCount === 1 ? "" : "es"} and ${relatedCount} related for “${categoryContext.categoryName}”.`;
    if (isSearching) {
      statusLabel += ` · Search: “${activeSearchQuery}”`;
    }
    if (isDealsView) {
      statusLabel += " · Deals active";
    }
  } else if (isDealsView) {
    statusLabel = `${products.length} discounted product${products.length === 1 ? "" : "s"} ready to order.`;
  } else {
    statusLabel = `${products.length} product${products.length === 1 ? "" : "s"} ready to order.`;
  }
  if (!categoryContext?.categoryName && isSearching) {
    statusLabel = `${products.length} result${products.length === 1 ? "" : "s"} for “${activeSearchQuery}”.`;
  }
  setProductsStatus(statusLabel, "success");
  renderDetailPane(null);
};

const filterProductsByMode = (products, mode) => {
  if (!Array.isArray(products)) return [];
  if (mode === PRODUCT_FILTERS.DEALS) {
    return products.filter((product) => getPriceMeta(product).hasPromo);
  }
  return [...products];
};

const productMatchesSearch = (product = {}, query = "") => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  const productId = getProductId(product);
  const { basePrice, promoPrice } = getPriceMeta(product);
  const priceBucket = [basePrice, promoPrice]
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => [value.toString(), formatCurrency(value).toLowerCase()]);
  const textBucket = [
    productId,
    product.name,
    product.brand,
    product.category,
    product.primaryCategory,
    product.secondaryCategory,
    product.shortDesc,
    product.longDesc,
    product.metaTitle,
    product.metaDesc,
    product.supplier,
    product.dimensions
  ]
    .filter((value) => typeof value === "string" && value.trim().length)
    .map((value) => value.toLowerCase());
  return (
    textBucket.some((value) => value.includes(normalized)) ||
    priceBucket.some((pair) => pair.some((value) => value.includes(normalized)))
  );
};

const filterProductsBySearch = (products = [], query = "") => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...products];
  return products.filter((product) => productMatchesSearch(product, normalized));
};

const getCategoryMatchScore = (product = {}, normalizedTarget = "") => {
  if (!normalizedTarget) return 0;
  const categoryFields = [
    product.category,
    product.primaryCategory,
    product.secondaryCategory,
    getCategoryName(product)
  ]
    .filter((value) => typeof value === "string" && value.trim().length)
    .map((value) => normalizeText(value));
  if (categoryFields.some((value) => value === normalizedTarget)) return 2;
  const textFields = [
    product.name,
    product.brand,
    product.shortDesc,
    product.longDesc,
    product.metaTitle,
    product.metaDesc,
    product.supplier
  ]
    .filter((value) => typeof value === "string" && value.trim().length)
    .map((value) => normalizeText(value));
  if (textFields.some((value) => value.includes(normalizedTarget))) return 1;
  return 0;
};

const filterProductsByCategory = (products = [], categoryName = null) => {
  if (!categoryName) return { list: products, context: null };
  const normalizedTarget = normalizeText(categoryName);
  const scored = products.map((product) => ({
    product,
    score: getCategoryMatchScore(product, normalizedTarget)
  }));
  const exact = scored.filter(({ score }) => score === 2).map(({ product }) => product);
  const related = scored.filter(({ score }) => score === 1).map(({ product }) => product);
  const remainder = scored.filter(({ score }) => score === 0).map(({ product }) => product);
  if (!exact.length && !related.length) {
    return {
      list: [],
      context: {
        categoryName,
        exact,
        related,
        remainder,
        emptyMessage: `We currently do not sell ${categoryName} products, but they are coming soon.`
      }
    };
  }
  return {
    list: products,
    context: {
      categoryName,
      exact,
      related,
      remainder
    }
  };
};

function applyProductFilter() {
  const filteredByMode = filterProductsByMode(fullProductList, activeProductFilter);
  const filteredBySearch = filterProductsBySearch(filteredByMode, activeSearchQuery);
  const categoryResult = filterProductsByCategory(filteredBySearch, activeCategoryFilter);
  if (categoryResult.context?.emptyMessage) {
    updateCategoryFocusBanner(activeCategoryFilter, { hasResults: false });
    renderProducts([], null, categoryResult.context.emptyMessage);
    return;
  }
  if (!activeCategoryFilter) {
    updateCategoryFocusBanner(null);
  } else {
    updateCategoryFocusBanner(activeCategoryFilter, {
      exactCount: categoryResult.context?.exact?.length || 0,
      relatedCount: categoryResult.context?.related?.length || 0,
      hasResults: true
    });
  }
  renderProducts(categoryResult.list, categoryResult.context);
}

function setProductFilter(mode = PRODUCT_FILTERS.ALL) {
  const normalized = Object.values(PRODUCT_FILTERS).includes(mode) ? mode : PRODUCT_FILTERS.ALL;
  activeProductFilter = normalized;
  if (normalized === PRODUCT_FILTERS.DEALS) {
    setActiveNavButton(dealsBtn);
  } else {
    setActiveNavButton(exploreBtn);
  }
  applyProductFilter();
}

const setSearchQuery = (value = "") => {
  const cleaned = value.trim();
  if (cleaned === activeSearchQuery.trim()) return;
  activeSearchQuery = cleaned;
  applyProductFilter();
};

function setCategoryFilter(categoryName = null) {
  activeCategoryFilter = categoryName;
  setCategorySelection(categoryName);
  if (!categoryName) {
    updateCategoryFocusBanner(null);
  }
  applyProductFilter();
}

const fetchProducts = async () => {
  if (!productCollections) return;
  if (isFetchingProducts) return;
  isFetchingProducts = true;
  try {
    setProductsStatus("Loading inventory…", "neutral");
    refreshProductsBtn?.setAttribute("aria-busy", "true");
    refreshProductsBtn?.setAttribute("disabled", "true");
    const params = new URLSearchParams({
      limit: String(DEFAULT_PRODUCTS_LIMIT),
      sort: "updatedAt",
      dir: "desc"
    });
    const response = await fetch(`${INVENTORY_ENDPOINT}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Inventory request failed (${response.status})`);
    }
    const payload = await response.json();
    fullProductList = Array.isArray(payload?.data) ? payload.data : [];
    applyProductFilter();
  } catch (error) {
    console.error("Failed to load products", error);
    setProductsStatus("Could not load products. Please try refreshing.", "error");
  } finally {
    refreshProductsBtn?.removeAttribute("aria-busy");
    refreshProductsBtn?.removeAttribute("disabled");
    isFetchingProducts = false;
  }
};

const handleDetailAdd = (productId, triggerBtn) => {
  if (!productId) return;
  const product =
    productCache.get(productId) ||
    fullProductList.find((item) => getProductId(item) === productId);
  if (product) {
    addProductToCart(product);
    selectedProductIds.add(productId);
  }
  if (triggerBtn) {
    triggerBtn.setAttribute("disabled", "true");
    triggerBtn.classList.add("added");
    triggerBtn.textContent = "Added";
  }
  const button = document.querySelector(`.product-card__add[data-product-id="${productId}"]`);
  if (button) {
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    setTimeout(() => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    }, 600);
  }
};

productCollections?.addEventListener("click", (event) => {
  const qtyControlBtn = event.target.closest(".product-card__qty-btn");
  if (qtyControlBtn) {
    event.preventDefault();
    event.stopPropagation();
    const productId = qtyControlBtn.dataset.productId;
    const action = qtyControlBtn.dataset.action;
    if (!productId || !action) return;
    if (action === "increase") {
      const product = productCache.get(productId);
      if (product) addProductToCart(product);
    } else if (action === "decrease") {
      decreaseCartItemQuantity(productId);
    }
    return;
  }
  const favoriteBtn = event.target.closest(".product-card__favorite");
  if (favoriteBtn) {
    event.preventDefault();
    event.stopPropagation();
    const productId = favoriteBtn.dataset.productId;
    toggleProductFavorite(productId);
    return;
  }
  const button = event.target.closest(".product-card__add");
  if (button) {
    const productId = button.dataset.productId;
    if (!productId) return;
    const product = productCache.get(productId);
    addProductToCart(product);
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    setTimeout(() => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    }, 600);
    return;
  }

  if (event.target.closest(".product-card__add")) return;
  const cardEl = event.target.closest(".product-card");
  if (!cardEl) return;
  const productId = cardEl.dataset.productId;
  const product = productCache.get(productId);
  if (!product) return;
  renderDetailPane(product);
});

refreshProductsBtn?.addEventListener("click", fetchProducts);
const scheduleProductsAutoRefresh = () => {
  if (productsRefreshTimer) clearInterval(productsRefreshTimer);
  productsRefreshTimer = setInterval(() => {
    fetchProducts();
  }, PRODUCT_REFRESH_INTERVAL_MS);
};
fetchProducts();
scheduleProductsAutoRefresh();
renderCart();
renderWishlist();
renderOrderHistory();
updateOrderConfirmation(orderHistoryData[0]);
renderOrderTracking(orderHistoryData[0]);
const setCommStatus = (el, message, isError = false) => {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", Boolean(isError));
};

sendConfirmationBtn?.addEventListener("click", () => {
  const email = (confirmationEmailInput?.value || "").trim();
  const orderId = (document.getElementById("confirmationOrderId")?.value || "").trim() || "INV-0000";
  const eta = (document.getElementById("confirmationEta")?.value || "").trim() || "Today";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setCommStatus(confirmationStatus, "Enter a valid email address.", true);
    return;
  }
  const preview = `Order ${orderId} is confirmed. Expect delivery ${eta}.`;
  const previewBox = document.getElementById("confirmationPreview");
  if (previewBox) previewBox.innerHTML = `<strong>Preview:</strong><p>${preview}</p>`;
  setCommStatus(confirmationStatus, `Test confirmation sent to ${email}.`);
  appendCommLog(confirmationLog, `Confirmation email dispatched to ${email}`);
  pushNotificationFeed("Email", `Confirmation sent to ${email} (Order ${orderId})`);
});

shippingUpdateBtn?.addEventListener("click", () => {
  if (!shippingStatus) return;
  const channels = [
    shipNotifySms?.checked ? "SMS" : null,
    shipNotifyEmail?.checked ? "Email" : null,
    shipNotifyPush?.checked ? "Push" : null
  ].filter(Boolean);
  if (!channels.length) {
    setCommStatus(shippingStatus, "Select at least one notification channel.", true);
    return;
  }
  const templateSelect = document.getElementById("shippingTemplate");
  const selectedTemplate = templateSelect?.value || SHIPPING_UPDATES[shippingStepIndex];
  const previewBox = document.getElementById("shippingPreview");
  if (previewBox) {
    previewBox.innerHTML = `<strong>Preview:</strong><p>${channels.join(" & ")} · ${selectedTemplate}</p>`;
  }
  setCommStatus(shippingStatus, `Sent "${selectedTemplate}" via ${channels.join(", ")}.`);
  appendCommLog(shippingLog, `${selectedTemplate} (${channels.join(", ")})`);
  pushNotificationFeed("Shipping", `"${selectedTemplate}" via ${channels.join(", ")}`);
  shippingStepIndex = (shippingStepIndex + 1) % SHIPPING_UPDATES.length;
});

newsletterJoinBtn?.addEventListener("click", () => {
  const email = (promoEmailInput?.value || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setCommStatus(newsletterStatus, "Please enter a valid email address.", true);
    return;
  }
  const frequency = newsletterFrequency?.value || "Weekly";
  setCommStatus(newsletterStatus, `You're in! Expect ${frequency} updates at ${email}.`);
  appendCommLog(confirmationLog, `Newsletter opted-in (${frequency}) for ${email}`);
  pushNotificationFeed("Promo", `${frequency} newsletter subscribed: ${email}`);
  promoEmailInput.value = "";
});

supportSubmitBtn?.addEventListener("click", () => {
  const message = (supportMessageInput?.value || "").trim();
  if (!message) {
    setCommStatus(supportStatus, "Let us know what's wrong so we can help.", true);
    return;
  }
  setCommStatus(supportStatus, "Thanks! A support agent will respond shortly.");
  appendCommLog(shippingLog, `Support ticket logged: "${message.slice(0, 60)}"`);
  pushNotificationFeed("Support", `Ticket received: "${message.slice(0, 60)}..."`);
  supportMessageInput.value = "";
});

const appendChatMessage = (role, text) => {
  if (!supportChatMessages) return;
  const bubble = document.createElement("div");
  bubble.className = `support-chat__message ${role}`;
  bubble.textContent = text;
  supportChatMessages.appendChild(bubble);
  supportChatMessages.scrollTop = supportChatMessages.scrollHeight;
};

const sendChatResponse = () => {
  const reply =
    SUPPORT_BOT_REPLIES[Math.floor(Math.random() * SUPPORT_BOT_REPLIES.length)];
  appendChatMessage("bot", reply);
  pushNotificationFeed("Chat", `Agent reply: "${reply}"`);
};

const handleChatSend = () => {
  const text = (supportChatInput?.value || "").trim();
  if (!text) return;
  appendChatMessage("user", text);
  pushNotificationFeed("Chat", `Customer: "${text}"`);
  supportChatInput.value = "";
  setTimeout(sendChatResponse, 900);
};

supportChatToggle?.addEventListener("click", () => {
  if (!supportChat) return;
  const isHidden = supportChat.hasAttribute("hidden");
  if (isHidden) {
    supportChat.removeAttribute("hidden");
    supportChatToggle.innerHTML = `<i class="fa-solid fa-comments"></i> Close Live Chat`;
    supportChatInput?.focus();
  } else {
    supportChat.setAttribute("hidden", "true");
    supportChatToggle.innerHTML = `<i class="fa-solid fa-comments"></i> Open Live Chat`;
  }
});

supportChatSendBtn?.addEventListener("click", handleChatSend);
supportChatInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleChatSend();
  }
});
clearNotificationFeedBtn?.addEventListener("click", () => {
  notificationFeedData = [];
  persistNotificationFeed();
  renderNotificationFeed();
});
loadNotificationFeed();
renderNotificationFeed();
