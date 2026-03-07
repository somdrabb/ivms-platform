# Prospectas Module

The `Prospectas` folder houses the full prospectus workspace experience (HTML, CSS, JS) that renders `prospectus.html` and powers the interactive toolkit for quickly designing or presenting a marketing layout.

## Purpose & Flow
1. **Layout & Tools:** `prospectus.html` lays out the workspace: toolbar controls (font selector, zoom, colors, dropdowns), a two-column preview of prospectus boxes (`A1` through `C`, `B1`/`B2`/`B3`), modal dialogs (dates, weekdays, company data), and supporting form/UI elements for registering company metadata and discounts.
2. **Styling:** All visual rules live in `prospectas.css` (variables, toolbar styling, preview grid, discount cards, modals, form controls, responsive tweaks). This keeps the presentation separate from behavior and prevents inline tag overrides.
3. **Behavior:** `prospectas.js` drives everything: zooming the prospectus canvas, selecting/averaging boxes via the toolbar or mouse, text/color/font controls, modal show/hide, company profile persistence (localStorage), discount fetching (mocking a backend `products` API), adaptive background removal for thumbnails, and event wiring for every button.
4. **Assets:** The module uses only web fonts and FontAwesome icons; there are no bundled PNG/JPEG assets inside this folder.

## Structure
- `prospectus.html`: Entry point, loads web fonts, FontAwesome, the shared CSS/JS, and contains the DOM for the editor, modals, and discount display. It should remain the single HTML file that references `prospectas.css` and `prospectas.js`.
- `prospectas.css`: Central stylesheet. All `<style>` rules that used to live in `prospectus.html` were extracted here. Update this file whenever you adjust layout, color schemes, typography, or responsive breakpoints.
- `prospectas.js`: Full application logic (zooming, storing company data, fetching discounts, handling modals/dropdowns, and rendering promotional cards inside boxes). The DOM-ready script now executes via `defer`, so it safely queries elements defined in the HTML.
- `public/asset`: This folder exists for future icon/image assets; none are used yet in `prospectus.html`, but projects can reference `public/asset/…` for any visuals they add later.

## Data Management
- **Company profile:** Form fields persist to `localStorage` via keys `prospekt-company-form-v1` (form data) and `prospektCompanyProfileV1` (rendered content), which allows refreshing the page without losing entered data. The modal can preload data, and submitting the form renders the company block in boxes `A1`/`C` with logo, keyword, and chips.
- **Discounts:** `prospectas.js` fetches from `API_BASE/products` (defaults to `http://127.0.0.1:4000/api`) to build promotional cards. It filters valid promos, calculates discount percentages, renders cards inside `B3` and product slots, and strips backgrounds from thumbnails using canvas-based chroma removal.
- **Zoom & layout:** The module recalculates zoom on load/resize via `fitProspektToScreen()`, ensuring the prospectus canvas fills the workspace while maintaining margins. Zoom controls can also adjust `zoomLevel` manually (with keyboard shortcuts or toolbar buttons). Keyboard-based adjustments propagate to the preview and the `%` indicator.

## Connecting to Backends
- **Authentication/Storage:** There is no user auth. Add a backend login flow if needed by integrating your API calls before calling `renderCompanyData` or allowing restricted editing.
- **Product data:** Swap the `loadDiscountedProducts()` URL (`API_BASE/products`) for your real inventory endpoint. The code already handles JSON responses and missing fields, but you can add error logging or caching as needed.
- **Assets:** If you add product photos or company logos that should be downloaded, place them under `public/asset` and reference them via `/Prospectas/public/asset/…` or configure a CDN/base path.

## Notes & Maintenance
- Keep the HTML mostly declarative; avoid inline `<style>` or `<script>` updates—use the dedicated CSS/JS files.
- When adding new interactive controls (buttons, toggles, form fields), extend `prospectas.js` with new selectors and handlers, and add the corresponding CSS classes to `prospectas.css`.
- Because the module runs purely client-side with `defer` JS, ensure the script is referenced after the DOM (currently at the end of `<body>`) so it can find every element before attaching listeners.
