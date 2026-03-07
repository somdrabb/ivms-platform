// Prospectas interactive behaviors
console.log('Prospectas module initialized');
let zoomLevel = 0.97;   // ✅ default zoom = 97%
const API_BASE = (window.API_BASE || 'http://127.0.0.1:4000/api').replace(/\/$/, '');
const wrapper = document.getElementById("prospektWrapper");
const zoomDisplay = document.getElementById("zoomDisplay");

function updateZoomDisplay() {
  const percent = Math.round(zoomLevel * 100);
  zoomDisplay.textContent = percent + "%";
}

function applyZoom() {
  wrapper.style.transform = `scale(${zoomLevel})`;
  updateZoomDisplay();
}
function zoomIn() {
  zoomLevel = Math.min(2, zoomLevel + 0.1);
  applyZoom();
}
function zoomOut() {
  zoomLevel = Math.max(0.4, zoomLevel - 0.1);
  applyZoom();
}
applyZoom();

/* TOOLS */
const selector         = document.getElementById("boxSelector");
const bgColorPicker    = document.getElementById("bgColorPicker");
const textArea         = document.getElementById("textContent");
const textColorPicker  = document.getElementById("textColorPicker");
const fontWeightSelect = document.getElementById("fontWeight");
const textAlignSelect  = document.getElementById("textAlign");

const fontSizeDisplay  = document.getElementById("fontSizeDisplay");
const fontSizePlus     = document.getElementById("fontSizePlus");
const fontSizeMinus    = document.getElementById("fontSizeMinus");

/* FONT DROPDOWN ELEMENTS */
const fontFamilyButton = document.getElementById("fontFamilyButton");
const fontFamilyLabel  = document.getElementById("fontFamilyLabel");
const fontFamilyMenu   = document.getElementById("fontFamilyMenu");
const fontItems        = fontFamilyMenu.querySelectorAll(".font-item");

/* BOX references */
const boxA1 = document.querySelector('.edit-box[data-box="A1"]');
const boxC  = document.querySelector('.edit-box[data-box="C"]');

let selectedBox = null;
let currentFontSize = 16;

/* DATE MODAL */
const dateModal  = document.getElementById("dateModal");
const dateFrom   = document.getElementById("dateFrom");
const dateTo     = document.getElementById("dateTo");
const dateApply  = document.getElementById("dateApply");
const dateCancel = document.getElementById("dateCancel");

/* WEEKDAY MODAL */
const weekdayModal   = document.getElementById("weekdayModal");
const weekdayCancel  = document.getElementById("weekdayCancel");
const weekdayButtons = document.querySelectorAll(".weekday-option");

/* COMPANY / USER REGISTER MODAL */
const companyModal      = document.getElementById("companyModal");
const companyUserBtn    = document.getElementById("companyUserBtn");
const companyClose      = document.getElementById("companyClose");
const companyCancel     = document.getElementById("companyCancel");
const companySave       = document.getElementById("companySave");
const companyLogoInput  = document.getElementById("companyLogo");
const discountListEl    = document.getElementById("discountList");
const discountStatusEl  = document.getElementById("discountStatus");
const refreshDiscountsBtn = document.getElementById("refreshDiscounts");
const prospektSlotSelectors = [
  '.edit-box[data-box="B2"]',
  '.edit-box[data-box="A2_2"]',
  '.edit-box[data-box="A3_2"]',
  '.edit-box[data-box="A4_2"]',
  '.edit-box[data-box="B4"]'
];

/* OPENING HOURS ELEMENTS */
const ohFromDay    = document.getElementById("ohFromDay");
const ohToDay      = document.getElementById("ohToDay");
const ohFromTime   = document.getElementById("ohFromTime");
const ohToTime     = document.getElementById("ohToTime");
const ohAddBtn     = document.getElementById("ohAddBtn");
const openingInput = document.getElementById("companyOpeningHours");

/* In-memory data URL for Firmenlogo */
let companyLogoDataUrl = "";
const COMPANY_FORM_STORAGE_KEY = "prospekt-company-form-v1";

/* --- LOCAL STORAGE FOR COMPANY PROFILE --- */
const PROFILE_STORAGE_KEY = "prospektCompanyProfileV1";

function saveProfileToLocalStorage(profile, logoDataUrl) {
  try {
    const payload = {
      ...profile,
      companyLogoDataUrl: logoDataUrl || ""
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Could not save profile to localStorage:", err);
  }
}

function loadProfileFromLocalStorage() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read profile from localStorage:", err);
    return null;
  }
}


/* Helper: style target
   - A1 → Kurz-Keyword
   - C  → .c-company
   - others → whole box
*/
function getStyleTarget() {
  if (!selectedBox) return null;
  const boxId = selectedBox.dataset.box;
  if (boxId === "A1") {
    const kw = selectedBox.querySelector(".a1-company-keyword");
    if (kw) return kw;
  }
  if (boxId === "C") {
    const comp = selectedBox.querySelector(".c-company");
    if (comp) return comp;
  }
  return selectedBox;
}

/* Build final URL from raw text */
function buildSocialUrl(type, raw) {
  if (!raw) return null;
  raw = raw.trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (type === "whatsapp") {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;
    return "https://wa.me/" + digits;
  }

  if (type === "facebook") {
    return "https://facebook.com/" + raw;
  }

  if (type === "instagram") {
    return "https://instagram.com/" + raw;
  }

  return null;
}

function openDateModal()      { dateModal.style.display   = "flex"; }
function closeDateModal()     { dateModal.style.display   = "none"; }
function openWeekdayModal()   { weekdayModal.style.display = "flex"; }
function closeWeekdayModal()  { weekdayModal.style.display = "none"; }

function openCompanyModal()   { companyModal.style.display = "flex"; }
function closeCompanyModal()  { companyModal.style.display = "none"; }

/* Handle Firmenlogo file selection → store data URL */
companyLogoInput.addEventListener("change", () => {
  const file = companyLogoInput.files[0];
  if (!file) {
    companyLogoDataUrl = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    companyLogoDataUrl = reader.result;
  };
  reader.readAsDataURL(file);
});

function getCompanyFormData() {
  return {
    companyId:           document.getElementById("companyId").value.trim(),
    companyName:         document.getElementById("companyName").value.trim(),
    companyKeyword:      document.getElementById("companyKeyword").value.trim(),
    companyAddress:      document.getElementById("companyAddress").value.trim(),
    companyPhone:        document.getElementById("companyPhone").value.trim(),
    companyEmail:        document.getElementById("companyEmail").value.trim(),
    companyOpeningHours: document.getElementById("companyOpeningHours").value.trim(),
    companyWhatsapp:     document.getElementById("companyWhatsapp").value.trim(),
    companyFacebook:     document.getElementById("companyFacebook").value.trim(),
    companyInstagram:    document.getElementById("companyInstagram").value.trim(),
    companyDetails:      document.getElementById("companyDetails").value.trim(),
    ohFromDay:           ohFromDay.value,
    ohToDay:             ohToDay.value,
    ohFromTime:          ohFromTime.value,
    ohToTime:            ohToTime.value,
    companyLogoDataUrl
  };
}

function persistCompanyFormData(data = getCompanyFormData()) {
  try {
    localStorage.setItem(COMPANY_FORM_STORAGE_KEY, JSON.stringify(data));
  } catch (_err) {
    /* ignore storage errors */
  }
}

function loadCompanyFormData() {
  let data = null;
  try {
    const raw = localStorage.getItem(COMPANY_FORM_STORAGE_KEY);
    data = raw ? JSON.parse(raw) : null;
  } catch (_err) {
    data = null;
  }
  if (!data) return null;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && typeof val === "string") el.value = val;
  };

  setVal("companyId", data.companyId || "");
  setVal("companyName", data.companyName || "");
  setVal("companyKeyword", data.companyKeyword || "");
  setVal("companyAddress", data.companyAddress || "");
  setVal("companyPhone", data.companyPhone || "");
  setVal("companyEmail", data.companyEmail || "");
  setVal("companyOpeningHours", data.companyOpeningHours || "");
  setVal("companyWhatsapp", data.companyWhatsapp || "");
  setVal("companyFacebook", data.companyFacebook || "");
  setVal("companyInstagram", data.companyInstagram || "");
  setVal("companyDetails", data.companyDetails || "");

  if (data.ohFromDay) ohFromDay.value = data.ohFromDay;
  if (data.ohToDay)   ohToDay.value   = data.ohToDay;
  if (data.ohFromTime) ohFromTime.value = data.ohFromTime;
  if (data.ohToTime)   ohToTime.value   = data.ohToTime;

  if (data.companyLogoDataUrl) {
    companyLogoDataUrl = data.companyLogoDataUrl;
  }

  return data;
}

/* Parse dd.mm.yyyy → Date */
function parseGermanDate(str) {
  if (!str) return null;
  const parts = str.trim().split(".");
  if (parts.length !== 3) return null;
  const dd = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  const yyyy = parseInt(parts[2], 10);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) {
    return null;
  }
  return d;
}

/* Select helper */
function selectBoxElement(el) {
  if (selectedBox) selectedBox.classList.remove("selected-box");
  selectedBox = el;
  if (!selectedBox) return;

  selectedBox.classList.add("selected-box");

  const boxName = selectedBox.dataset.box;
  if (boxName) selector.value = boxName;

  // Textarea content (only safe for A1 and simple boxes; C is layout-driven)
  if (boxName === "A1") {
    const kw = selectedBox.querySelector(".a1-company-keyword");
    textArea.value = kw ? kw.textContent.trim() : "";
  } else if (boxName === "C") {
    const comp = selectedBox.querySelector(".c-company");
    textArea.value = comp ? comp.innerText.trim() : "";
  } else {
    textArea.value = selectedBox.textContent.trim();
  }

  const target = getStyleTarget();
  const fs = target ? window.getComputedStyle(target).fontSize : null;
  currentFontSize = fs ? parseInt(fs, 10) : 16;
  fontSizeDisplay.value = currentFontSize + "px";
}

/* Select via dropdown */
selector.addEventListener("change", () => {
  const boxName = selector.value;
  if (!boxName) {
    if (selectedBox) selectedBox.classList.remove("selected-box");
    selectedBox = null;
    textArea.value = "";
    fontSizeDisplay.value = "16px";
    return;
  }
  const el = document.querySelector('.edit-box[data-box="' + boxName + '"]');
  if (el) selectBoxElement(el);
});

/* Select via click / dblclick */
const editableBoxes = document.querySelectorAll(".edit-box");
editableBoxes.forEach(box => {
  box.addEventListener("click", (e) => {
    e.stopPropagation();
    selectBoxElement(box);
    if (box.dataset.box === "B1") {
      openDateModal();
    }
  });

  box.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    selectBoxElement(box);
    const id = box.dataset.box;
    if (id === "A2_1" || id === "A3_1" || id === "A4_1") {
      openWeekdayModal();
    }
  });
});

/* Background color (whole box) */
bgColorPicker.addEventListener("input", () => {
  if (selectedBox) selectedBox.style.background = bgColorPicker.value;
});

/* Text content:
   - A1 → only Kurz-Keyword
   - C  → ignored (content comes from register form, but style is editable)
   - others → change whole box text
*/
textArea.addEventListener("input", () => {
  if (!selectedBox) return;
  const boxId = selectedBox.dataset.box;
  if (boxId === "A1") {
    const kw = selectedBox.querySelector(".a1-company-keyword");
    if (kw) kw.textContent = textArea.value;
  } else if (boxId === "C") {
    return; // don't break C layout
  } else {
    selectedBox.textContent = textArea.value;
  }
});

/* Text color → style target */
textColorPicker.addEventListener("input", () => {
  const target = getStyleTarget();
  if (target) target.style.color = textColorPicker.value;
});

/* FONT DROPDOWN LOGIC */
function setFontFromItem(item) {
  const value = item.dataset.value;
  const label = item.dataset.label;
  const style = item.style.fontFamily;

  fontItems.forEach(i => i.classList.remove("font-item-active"));
  item.classList.add("font-item-active");

  fontFamilyLabel.textContent = label;
  fontFamilyLabel.style.fontFamily = style || "system-ui, sans-serif";

  const target = getStyleTarget();
  if (target) {
    target.style.fontFamily = value ? value : "";
  }
}

fontFamilyButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = fontFamilyMenu.style.display === "block";
  fontFamilyMenu.style.display = isOpen ? "none" : "block";
});

fontItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    setFontFromItem(item);
    fontFamilyMenu.style.display = "none";
  });
});

/* Font weight → style target */
fontWeightSelect.addEventListener("change", () => {
  const target = getStyleTarget();
  if (!target) return;
  target.style.fontWeight = fontWeightSelect.value || "";
});

/* Text alignment + center-both → style target */
textAlignSelect.addEventListener("change", () => {
  const target = getStyleTarget();
  if (!target) return;

  target.classList.remove("center-both");
  target.style.textAlign = "";

  const mode = textAlignSelect.value;
  if (mode === "") return;

  if (mode === "left") target.style.textAlign = "left";
  else if (mode === "center") target.style.textAlign = "center";
  else if (mode === "right") target.style.textAlign = "right";
  else if (mode === "justify") target.style.textAlign = "justify";
  else if (mode === "center-both") target.classList.add("center-both");
});

window.addEventListener("load", fitProspektToScreen);
window.addEventListener("resize", fitProspektToScreen);


/* Font size +/- → style target */
function applyFontSize() {
  const target = getStyleTarget();
  if (!target) return;
  target.style.fontSize = currentFontSize + "px";
  fontSizeDisplay.value = currentFontSize + "px";
}

fontSizePlus.addEventListener("click", () => {
  currentFontSize += 1;
  applyFontSize();
});

fontSizeMinus.addEventListener("click", () => {
  currentFontSize = Math.max(1, currentFontSize - 1);
  applyFontSize();
});

/* DATE modal logic for B1 */
dateCancel.addEventListener("click", closeDateModal);

dateApply.addEventListener("click", () => {
  if (!selectedBox || selectedBox.dataset.box !== "B1") {
    closeDateModal();
    return;
  }
  const from = parseGermanDate(dateFrom.value);
  const to   = parseGermanDate(dateTo.value);
  if (!from || !to) {
    closeDateModal();
    return;
  }

  const fd = String(from.getDate()).padStart(2, "0");
  const fm = String(from.getMonth() + 1).padStart(2, "0");
  const td = String(to.getDate()).padStart(2, "0");
  const tm = String(to.getMonth() + 1).padStart(2, "0");

  const weekdays = [
    "Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"
  ];
  const weekdayName = weekdays[from.getDay()];

  const text = `Ab ${weekdayName} ${fd}.${fm} - ${td}.${tm}`;

  selectedBox.textContent = text;
  textArea.value = text;

  selectedBox.classList.add("center-both");
  textAlignSelect.value = "center-both";

  closeDateModal();
});

/* WEEKDAY modal logic for A2.1/A3.1/A4.1 */
weekdayCancel.addEventListener("click", closeWeekdayModal);

weekdayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!selectedBox) return;
    const day = btn.dataset.day;
    const text = `Ab ${day}`;
    selectedBox.textContent = text;
    textArea.value = text;

    selectedBox.classList.add("center-both");
    textAlignSelect.value = "center-both";

    closeWeekdayModal();
  });
});

/* OPENING HOURS + BUTTON LOGIC */
ohAddBtn.addEventListener("click", () => {
  const fromDay  = ohFromDay.value;
  const toDay    = ohToDay.value;
  const fromTime = ohFromTime.value;
  const toTime   = ohToTime.value;

  if (!fromDay || !fromTime || !toTime) return;

  let segment = "";
  if (fromDay === toDay) {
    segment = `${fromDay}. ${fromTime}-${toTime}`;
  } else {
    segment = `${fromDay}-${toDay}. ${fromTime}-${toTime}`;
  }

  if (openingInput.value.trim() === "") {
    openingInput.value = segment;
  } else {
    openingInput.value = openingInput.value.trim().replace(/;?$/, "") + "; " + segment;
  }
});

/* COMPANY modal logic */
companyUserBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openCompanyModal();
});

companyClose.addEventListener("click", closeCompanyModal);
companyCancel.addEventListener("click", closeCompanyModal);

function renderCompanyData(data) {
  if (!data) return;

  /* Place Firmenlogo + Kurz-Keyword into box A1 */
  if (boxA1) {
    boxA1.innerHTML = "";

    if (data.companyLogoDataUrl) {
      const logoWrapper = document.createElement("div");
      logoWrapper.className = "a1-logo-wrapper";

      const img = document.createElement("img");
      img.className = "a1-company-logo";
      img.src = data.companyLogoDataUrl;
      img.alt = data.companyName || "Firmenlogo";

      logoWrapper.appendChild(img);
      boxA1.appendChild(logoWrapper);
    }

    if (data.companyKeyword) {
      const kw = document.createElement("div");
      kw.className = "a1-company-keyword";
      kw.textContent = data.companyKeyword;
      boxA1.appendChild(kw);
    }

    boxA1.style.display = "flex";
    boxA1.style.flexDirection = "column";
    boxA1.style.alignItems = "center";
    boxA1.style.justifyContent = "center";
  }

  /* Fill box C:
     left column = logo + name
     right = description | address | email | phone | opening hours | socials
  */
  if (boxC) {
    boxC.innerHTML = "";

    const container = document.createElement("div");
    container.className = "c-company";

    // LEFT: logo + name column
    const logoCol = document.createElement("div");
    logoCol.className = "c-logo-column";

    if (data.companyLogoDataUrl) {
      const smallImg = document.createElement("img");
      smallImg.className = "c-logo-small";
      smallImg.src = data.companyLogoDataUrl;
      smallImg.alt = data.companyName || "Firmenlogo";
      logoCol.appendChild(smallImg);
    }

    if (data.companyName) {
      const nameEl = document.createElement("div");
      nameEl.className = "c-name";
      nameEl.textContent = data.companyName;
      logoCol.appendChild(nameEl);
    }

    // RIGHT: horizontal chips row
    const infoRow = document.createElement("div");
    infoRow.className = "c-info-horizontal";

    function addChipText(text) {
      if (!text) return null;
      const chip = document.createElement("span");
      chip.className = "c-chip";
      chip.textContent = text;
      infoRow.appendChild(chip);
      return chip;
    }

    function addChipEmail(email) {
      if (!email) return null;
      const chip = document.createElement("span");
      chip.className = "c-chip";
      const a = document.createElement("a");
      a.href = "mailto:" + email;
      a.textContent = email;
      chip.appendChild(a);
      infoRow.appendChild(chip);
      return chip;
    }

    function addSeparatorIfNeeded(alreadyAddedSomething) {
      if (!alreadyAddedSomething) return;
      const sep = document.createElement("span");
      sep.className = "c-separator";
      sep.textContent = "|";
      infoRow.appendChild(sep);
    }

    let hasChip = false;

    // 1) Company description
    if (data.companyDetails) {
      addChipText(data.companyDetails);
      hasChip = true;
    }

    // 2) Address
    if (data.companyAddress) {
      addSeparatorIfNeeded(hasChip);
      addChipText(data.companyAddress);
      hasChip = true;
    }

    // 3) Email
    if (data.companyEmail) {
      addSeparatorIfNeeded(hasChip);
      addChipEmail(data.companyEmail);
      hasChip = true;
    }

    // 4) Phone
    if (data.companyPhone) {
      addSeparatorIfNeeded(hasChip);
      addChipText("Tel: " + data.companyPhone);
      hasChip = true;
    }

    // 5) Opening hours
    if (data.companyOpeningHours) {
      addSeparatorIfNeeded(hasChip);
      addChipText(data.companyOpeningHours);
      hasChip = true;
    }

    // 6) Socials
    const hasWhatsapp  = !!buildSocialUrl("whatsapp",  data.companyWhatsapp || "");
    const hasInstagram = !!buildSocialUrl("instagram", data.companyInstagram || "");
    const hasFacebook  = !!buildSocialUrl("facebook",  data.companyFacebook || "");

    if (hasWhatsapp || hasInstagram || hasFacebook) {
      addSeparatorIfNeeded(hasChip);

      const socialChip = document.createElement("span");
      socialChip.className = "c-chip c-chip-social";

      function addSocialBtn(type, iconClass, rawValue) {
        const url = buildSocialUrl(type, rawValue || "");
        if (!url) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `c-social-btn c-social-btn-${type}`;
        const icon = document.createElement("i");
        icon.className = iconClass;
        btn.appendChild(icon);
        btn.addEventListener("click", () => {
          window.open(url, "_blank");
        });
        socialChip.appendChild(btn);
      }

      addSocialBtn("whatsapp",  "fa-brands fa-whatsapp",   data.companyWhatsapp);
      addSocialBtn("instagram", "fa-brands fa-instagram",  data.companyInstagram);
      addSocialBtn("facebook",  "fa-brands fa-facebook-f", data.companyFacebook);

      infoRow.appendChild(socialChip);
    }

    container.appendChild(logoCol);
    container.appendChild(infoRow);
    if (data.companyLogoDataUrl) {
      const watermark = document.createElement("img");
      watermark.className = "c-watermark";
      watermark.src = data.companyLogoDataUrl;
      watermark.alt = data.companyName || "Firmenlogo";
      container.appendChild(watermark);
    }
    boxC.appendChild(container);
  }
  fitProspektToScreen();
}

/* COMPANY SAVE → fill A1 + C */
companySave.addEventListener("click", () => {
  const data = {
    companyId:           document.getElementById("companyId").value.trim(),
    companyName:         document.getElementById("companyName").value.trim(),
    companyKeyword:      document.getElementById("companyKeyword").value.trim(),
    companyAddress:      document.getElementById("companyAddress").value.trim(),
    companyPhone:        document.getElementById("companyPhone").value.trim(),
    companyEmail:        document.getElementById("companyEmail").value.trim(),
    companyOpeningHours: document.getElementById("companyOpeningHours").value.trim(),
    companyWhatsapp:     document.getElementById("companyWhatsapp").value.trim(),
    companyFacebook:     document.getElementById("companyFacebook").value.trim(),
    companyInstagram:    document.getElementById("companyInstagram").value.trim(),
    companyDetails:      document.getElementById("companyDetails").value.trim(),
    ohFromDay:           ohFromDay.value,
    ohToDay:             ohToDay.value,
    ohFromTime:          ohFromTime.value,
    ohToTime:            ohToTime.value,
    companyLogoDataUrl
  };

  persistCompanyFormData(data);
  console.log("Company registration data:", data);

  renderCompanyData(data);

  closeCompanyModal();
});

/* Persist company form on change + restore on load */
const companyFormFieldIds = [
  "companyId",
  "companyName",
  "companyKeyword",
  "companyAddress",
  "companyPhone",
  "companyEmail",
  "companyOpeningHours",
  "companyWhatsapp",
  "companyFacebook",
  "companyInstagram",
  "companyDetails",
  "ohFromDay",
  "ohToDay",
  "ohFromTime",
  "ohToTime"
];

companyFormFieldIds.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const handler = () => persistCompanyFormData();
  el.addEventListener("input", handler);
  el.addEventListener("change", handler);
});

const restoredCompanyData = loadCompanyFormData();
if (restoredCompanyData) {
  renderCompanyData(restoredCompanyData);
}


/* DISCOUNTED PRODUCTS (inventory promotions) */
function parsePriceValue(value) {
  if (value === undefined || value === null || value === "") return NaN;
  const numeric = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(numeric) ? numeric : NaN;
}

function formatCurrencyValue(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  } catch (_err) {
    return num.toFixed(2);
  }
}

function resolveImageUrl(path) {
  if (!path) return "";
  try {
    const apiRoot = API_BASE.replace(/\/api$/, "");
    return new URL(path, apiRoot + "/").toString();
  } catch (_err) {
    return path;
  }
}

/* Adaptive background remover:
   - Samples corner pixels to detect the dominant background color
   - Removes pixels within a configurable tolerance of that color
   Note: This is heuristic-based (no AI model) but much more accurate than a fixed white threshold.
*/
const REMOVE_BG_ENABLED = true;
const REMOVE_BG_FUZZ = 32;        // tolerance (0-255) for similarity to background
const REMOVE_BG_MIN_BRIGHT = 180; // skip removal if detected background is dark
const _chromaCache = new Map();

function averageCorners(data, width, height) {
  const samplePoints = [
    [0, 0], [width - 1, 0],
    [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
    [Math.floor(width / 2), height - 1]
  ];
  let r = 0, g = 0, b = 0, count = 0;
  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * 4;
    r += data[idx];
    g += data[idx + 1];
    b += data[idx + 2];
    count++;
  }
  return [r / count, g / count, b / count];
}

function colorDistance(r, g, b, ref) {
  const dr = r - ref[0];
  const dg = g - ref[1];
  const db = b - ref[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function chromaRemoveAdaptive(src) {
  if (_chromaCache.has(src)) return _chromaCache.get(src);
  const job = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        const bg = averageCorners(data, img.width, img.height);
        const bgBrightness = (bg[0] + bg[1] + bg[2]) / 3;
        const fuzz = Math.max(8, REMOVE_BG_FUZZ);

        // Only remove if background is reasonably bright (common for product cutouts)
        if (bgBrightness < REMOVE_BG_MIN_BRIGHT) {
          resolve(canvas.toDataURL("image/png"));
          return;
        }

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = colorDistance(r, g, b, bg);
          if (dist <= fuzz) {
            data[i + 3] = 0; // transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
  _chromaCache.set(src, job);
  return job;
}

function applyBgRemoval(imgEl, src) {
  if (!REMOVE_BG_ENABLED || !src) return;
  chromaRemoveAdaptive(src).then((processed) => {
    imgEl.src = processed;
  }).catch(() => {
    /* fall back silently */
  });
}

function renderDiscountedProducts(items) {
  if (!discountListEl || !discountStatusEl) return;
  discountListEl.innerHTML = "";

  if (!items.length) {
    discountStatusEl.textContent = "No discounted products in inventory yet.";
    return;
  }

  discountStatusEl.textContent = `Showing ${items.length} discounted product${items.length === 1 ? "" : "s"}`;

  const frag = document.createDocumentFragment();

  items.forEach(({ product, basePrice, promoPrice, discountPct }) => {
    const card = document.createElement("article");
    card.className = "discount-card";

    const thumb = document.createElement("div");
    thumb.className = "discount-thumb";
    const imgSrc = resolveImageUrl(product.pictureUrl || product.pictureDataUrl || "");
    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = product.name || "Product image";
      thumb.appendChild(img);
      applyBgRemoval(img, imgSrc);
    } else {
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-box-open";
      thumb.appendChild(icon);
    }

    const body = document.createElement("div");
    body.className = "discount-body";

    const nameRow = document.createElement("div");
    nameRow.className = "discount-row";
    const name = document.createElement("div");
    name.className = "discount-name";
    name.textContent = product.name || "Unbenanntes Produkt";
    const chip = document.createElement("span");
    chip.className = "discount-chip";
    chip.textContent = `-${discountPct}%`;
    nameRow.appendChild(name);
    nameRow.appendChild(chip);

    const priceRow = document.createElement("div");
    priceRow.className = "discount-prices";
    const oldPrice = document.createElement("span");
    oldPrice.className = "discount-old-price";
    oldPrice.textContent = formatCurrencyValue(basePrice);
    const newPrice = document.createElement("span");
    newPrice.className = "discount-new-price";
    newPrice.textContent = formatCurrencyValue(promoPrice);
    priceRow.appendChild(oldPrice);
    priceRow.appendChild(newPrice);

    body.appendChild(nameRow);
    body.appendChild(priceRow);

    card.appendChild(thumb);
    card.appendChild(body);
    frag.appendChild(card);
  });

  discountListEl.appendChild(frag);
}

function makeProspektProductCard(item) {
  const { product, basePrice, promoPrice, discountPct } = item;
  const card = document.createElement("div");
  card.className = "prospekt-product";

  const thumb = document.createElement("div");
  thumb.className = "p-thumb";
  const imgSrc = resolveImageUrl(product.pictureUrl || product.pictureDataUrl || "");
  if (imgSrc) {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = product.name || "Produktbild";
    thumb.appendChild(img);
    applyBgRemoval(img, imgSrc);
  } else {
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-image";
    thumb.appendChild(icon);
  }

  const body = document.createElement("div");
  body.className = "p-body";
  const name = document.createElement("div");
  name.className = "p-name";
  name.textContent = product.name || "Unbenannt";

  const prices = document.createElement("div");
  prices.className = "p-prices";
  const oldPrice = document.createElement("span");
  oldPrice.className = "p-old";
  oldPrice.textContent = formatCurrencyValue(basePrice);
  const newPrice = document.createElement("span");
  newPrice.className = "p-new";
  newPrice.textContent = formatCurrencyValue(promoPrice);

  prices.appendChild(oldPrice);
  prices.appendChild(newPrice);

  const badge = document.createElement("span");
  badge.className = "p-badge";
  const badgeText = document.createElement("span");
  badgeText.className = "p-badge-text";
  badgeText.textContent = `-${discountPct}%`;
  badge.appendChild(badgeText);

  body.appendChild(name);

  card.appendChild(thumb);
  card.appendChild(badge);
  card.appendChild(prices);
  card.appendChild(body);
  return card;
}

function fillProspektWithDiscounts(items) {
  const b3Slot = document.querySelector('.edit-box[data-box="B3"]');
  if (b3Slot) {
    b3Slot.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "b3-grid";
    const firstThree = items.slice(0, 3);
    for (let i = 0; i < 3; i++) {
      const cell = document.createElement("div");
      cell.className = "b3-grid-cell";
      const item = firstThree[i];
      if (item) {
        cell.appendChild(makeProspektProductCard(item));
      } else {
        const empty = document.createElement("div");
        empty.className = "prospekt-product prospekt-empty";
        empty.textContent = "Kein Rabattartikel";
        cell.appendChild(empty);
      }
      grid.appendChild(cell);
    }
    b3Slot.appendChild(grid);
  }

  const slots = prospektSlotSelectors
    .map(sel => document.querySelector(sel))
    .filter(Boolean);

  slots.forEach((slot, idx) => {
    slot.innerHTML = "";
    const item = items[idx + 3]; // skip first three used in B3
    if (!item) {
      const empty = document.createElement("div");
      empty.className = "prospekt-product prospekt-empty";
      empty.textContent = "Kein Rabattartikel";
      slot.appendChild(empty);
      return;
    }
    slot.appendChild(makeProspektProductCard(item));
  });
}

async function loadDiscountedProducts() {
  if (!discountListEl || !discountStatusEl) return;
  discountStatusEl.textContent = "Loading discounted products…";
  discountListEl.innerHTML = "";
  try {
    const url = new URL(`${API_BASE}/products`);
    url.searchParams.set("limit", "100000");
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const list = Array.isArray(payload?.data)
      ? payload.data
      : (Array.isArray(payload) ? payload : []);
    const discounted = list.reduce((acc, product) => {
      const basePrice = parsePriceValue(product.price);
      const promoPrice = parsePriceValue(product.promoPrice);
      if (!Number.isFinite(basePrice) || basePrice <= 0) return acc;
      if (!Number.isFinite(promoPrice) || promoPrice <= 0 || promoPrice >= basePrice) return acc;
      const discountPct = Math.round((1 - promoPrice / basePrice) * 100);
      acc.push({ product, basePrice, promoPrice, discountPct });
      return acc;
    }, []).sort((a, b) => b.discountPct - a.discountPct || a.promoPrice - b.promoPrice);
    renderDiscountedProducts(discounted);
    fillProspektWithDiscounts(discounted);
        fitProspektToScreen();

  } catch (err) {
    console.error("Failed to load discounted products", err);
    discountStatusEl.textContent = "Could not load discounted products from inventory.";
  }
}

refreshDiscountsBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  loadDiscountedProducts();
});
loadDiscountedProducts();
/* Click outside → unselect + close modals + close font menu */
document.addEventListener("click", (e) => {
  const insideProspekt    = e.target.closest(".prospekt");
  const insideTools       = e.target.closest(".top-toolbar");
  const insideDateBox     = e.target.closest(".date-modal-content");
  const insideWeekBox     = e.target.closest(".weekday-modal-content");
  const insideFontBox     = e.target.closest(".font-dropdown");
  const insideCompanyBox  = e.target.closest(".company-modal-content");
  if (!insideFontBox) {
    fontFamilyMenu.style.display = "none";
  }
  if (!insideProspekt && !insideTools && !insideDateBox && !insideWeekBox && !insideCompanyBox) {
    if (selectedBox) selectedBox.classList.remove("selected-box");
    selectedBox = null;
    selector.value = "";
    textArea.value = "";
    fontSizeDisplay.value = "16px";
  }
  if (e.target.id === "dateModal") closeDateModal();
  if (e.target.id === "weekdayModal") closeWeekdayModal();
  if (e.target.id === "companyModal") closeCompanyModal();
});

/* --- RESTORE PROFILE FROM LOCAL STORAGE ON LOAD --- */
(function restoreProfileOnLoad() {
  const saved = loadProfileFromLocalStorage();
  if (!saved) return;
  renderCompanyData(saved);  // use existing function
})();

function fitProspektToScreen() {
  const panel = document.querySelector(".prospekt-area");
  const page  = document.getElementById("mainProspekt");
  if (!panel || !page) return;

  // reset scale to measure real size
  wrapper.style.transform = "scale(1)";

  const panelWidth  = panel.clientWidth;
  const panelHeight = panel.clientHeight;

  const rect = page.getBoundingClientRect();
  const pageWidth  = rect.width;
  const pageHeight = rect.height;

  const scaleX = panelWidth  / pageWidth;
  const scaleY = panelHeight / pageHeight;

  // a tiny safety margin (0.95) so nothing touches the edges
  zoomLevel = Math.min(scaleX, scaleY) * 0.95;
  if (!Number.isFinite(zoomLevel) || zoomLevel <= 0) {
    zoomLevel = 0.9;
  }
  applyZoom();
}
