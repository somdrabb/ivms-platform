# IVMS Frontend Console

The `ivms` folder packages the IVMS-97 operational cockpit: a browser-native dashboard that brings KPIs, inventory tables, warehouse/purchase monitoring, ESL/price printing, POS controls, and storefront previews together in one cohesive experience. It is a static, dependency-free bundle that layers focused JavaScript modules on top of `index.html`, so you can host it anywhere while relying on your existing `/api` surface for live data.

## Executive value

- **Command center feel:** The front page showcases a KPI-rich dashboard, followed closely by contextual tabs that surface every operational surface your business needs—inventory management, warehouses, purchases, ESLs, online shop status, and POS insights.
- **Polished, responsive UX:** Chip filters, modal confirmations, keyboard shortcuts, and animated KPI cards were designed to impress leadership and make daily workflows feel smooth.
- **Low-risk architecture:** No bundler, no build step—just HTML/CSS/JS. Drop the folder on a CDN, configure `window.API_BASE`, and you have a secure, shareable console that still connects to authenticated endpoints via `fetchWithShop`.
- **Built for integrations:** Each helper script uses shared data (exposed from `script.js`) so it is easy to hook analytics, notifications, or automation on top without rewriting the UI.

## Product pipeline & API surface

1. **Bootstrap (`script.js`):** Loads first, fetches shops, purchases, warehouses, and inventory lists, exposes shared helpers like `renderInventory`, `showToast`, and `fetchWithShop`, and maintains the global state object consumed by every module.
2. **Shop context (`addshop.js`):** Fetches `/api/shops`, allows switching/renaming, caches metadata, and ensures `window.currentShop` plus all API calls (via `fetchWithShop`) use the correct `X-Shop-ID` headers.
3. **Inventory data (`searchProduct.js`, `updatepage.js`, `excelInlineEdit.js`):** Normalizes product haystacks, manages pagination, intercepts server-side `/api/products/search` calls, and exposes inline editing capabilities that call `PUT /api/products/<id>`.
4. **Imagery (`picture.js`):** Handles uploads/pooling for `POST /api/products/picture/by-ean/<ean>`, caches blobs in IndexedDB, and synchronizes UIs with previews.
5. **Dashboard aggregates (`dashboard.js`):** Runs on top of ApexCharts + FontAwesome to render live KPIs, warning badges, and charts driven by the shared state (active SKUs, units on hand, restock queue, inventory value, profit potential).
6. **Safety & automation (`restinventory.js`, `helper.js`, `Key_Shortcut.js`):** Adds guarded reset flows, autofill hardening, toast messaging, and keyboard shortcuts so power users can fly through workflows.

## Architecture & structure

- `index.html`: Provides the tabbed shell, modal overlays (delete, bulk reset, shop rename), status banners, and containers for each module. External assets (QRCode.js, ApexCharts, FontAwesome, Quagga) are loaded here; scripts sit at the bottom so the DOM is ready before each helper runs.
- `index.css` & `dashbord.css`: Two CSS layers—`index.css` for the global layout (navigation, tables, popups), and `dashbord.css` for the KPI grid, data cards, and responsive hero area.
- `script.js`: The orchestrator that:
  - Maintains shared state (`products`, `warehouses`, `transferActivityLog`, `currentShop`, pagination metadata).
  - Exposes helper hooks (`renderInventory`, `renderESL`, `fetchWithShop`, `showToast`) so other scripts can operate on the same data set.
  - Publishes lifecycle events so modules know when to rerender after API updates.
- `dashboard.js`: Builds KPI cards and charts, responds to state updates, and renders alerts (low stock, restock needed). Works with ApexCharts to show trends without requiring extra bundle size.
- `searchProduct.js`: Handles search, filtering, optional server-side `/api/products/search`, and pagination state. It normalizes every field into a searchable haystack and reports counts to the UI.
- `updatepage.js`: Keeps pagination controls in sync with `renderInventory`, renders page buttons, and stabilizes container heights during data changes.
- `addshop.js`: Manages shop navigation, switching, renaming, and returns `fetchWithShop()` so every request includes the correct shop context.
- `restinventory.js`: Implements a guarded reset modal with password confirmation before firing `DELETE /api/products/reset/all`, then refreshes tables and toasts success/failure.
- `picture.js`: Uploads images (files or URLs), caches them in IndexedDB, previews them immediately, and calls `POST /api/products/picture/by-ean/<ean>` when saving.
- `excelInlineEdit.js`: Lets users edit table cells in place, throttles `PUT /api/products/<id>` calls, and reuses the shared render helpers to refresh rows.
- `helper.js` & `Key_Shortcut.js`: Add utility functions (autofill protection, toasts, modal helpers) and keyboard shortcuts (Focus search, Add product, etc.) for an ergonomic workflow.
- `inventory-all-categories.csv`: Reference export for offline analysis or migrating data between shops.

## Deployment & operations

1. **Static hosting:** Drop `ivms/` onto any static server (Python, Netlify, Vercel, S3). No npm build steps required.
2. **Configure API base:** Set `window.API_BASE` to point at your API host (defaults to `http://127.0.0.1:4000/api`). You can override it per-environment before loading the console.
3. **CORS/auth:** Ensure the API accepts requests from the console’s origin and honors the `X-Shop-ID` header set by `fetchWithShop()`. JWT tokens or cookies can be used if you layer auth in front of the API.
4. **CI/CD pipeline:** Redistribute the folder from your pipeline to keep it accessible at `/ivms/` or a similar route. Coordinate deployments with backend releases when you change endpoints or data contracts.
5. **Monitoring:** Hook the `loadProducts()`/`renderInventory()` lifecycle in `script.js` for logging or alerting if the console fails to retrieve data (e.g., API downtime, network errors).

## Extension ideas that impress

1. **New contextual tabs:** Add a new `section` to `index.html`, load a helper script after `script.js`, and have it consume the shared state (no new fetch logic required).
2. **Integrate automation:** Replace `Request Stock` clipboard calls with a webhook or messaging API for instant alerts to sales or procurement.
3. **Custom analytics:** Inject scripts that call `renderInventory()` or `showToast()` to highlight business rules (e.g., flagged suppliers, high-margin products).
4. **Embed view:** Extract the dashboard or inventory list into an iframe for secure sharing. The console’s modular scripts already allow targeted rendering.

## How to run

1. Serve the `ivms/` folder statically (e.g., `cd ivms && python -m http.server 5500` or host it behind Netlify, Vercel, or a CDN). The experience is pure HTML/CSS/JS—no build step needed.
2. Point your API host at `window.API_BASE` (defaults to `http://127.0.0.1:4000/api`). Alternatively, set it globally before loading the console to satisfy different environments (dev/stage/prod).
3. Open `index.html`; `script.js` bootstraps, fetches shops/purchases/warehouses, and then loads the supporting helpers.
4. Use the navigation tabs to switch contexts. Each module reuses the same shared state, keeping product lists, filters, and KPIs synchronized.
5. Keyboard shortcuts (via `Key_Shortcut.js`) accelerate power users—pressing `S` focuses search, `N` adds a new product, etc., so day-to-day actions become muscle memory.

## Notes

- The SPA boots with deferred scripts at the bottom of `index.html`, guaranteeing the DOM is ready when each helper runs.
- The folder still includes `inventory-all-categories.csv` as a reference export from the back office.
- Hooks like `window.renderInventory` allow for automated UI tests or external integrations that reuse the same rendering logic.

## Directory structure & responsibilities

- `index.html`: Declares the tabbed navigation, modals (delete, bulk reset, shop rename), placeholders (`#inventory-table`, `#dashboard`, status panels), and loads external assets (FontAwesome, QRCode.js, Quagga, ApexCharts). Scripts are deferred near the end so the DOM is ready before JS runs.
- `index.css` & `dashbord.css`: Two-tier styling. `index.css` provides global layout (colors, sidebar, dropdowns, modals), while `dashbord.css` focuses exclusively on the KPI grid, chart cards, and responsive dashboard view.
- `script.js`: The orchestrator. It:
  - Maintains shared state (products, warehouses, transfers, shops, current shop, pagination).
  - Exposes helpers like `renderInventory()`, `showToast()`, `fetchWithShop()`, and `normalizeProduct()` for consistent rendering.
  - Loads the initial datasets and publishes events for other modules to consume.
- `dashboard.js`: Renders KPI cards, shields, and ApexCharts. It listens for state changes and rerenders the dashboard grid with live totals (active SKUs, units on hand, restock alerts, potential profit).
- `searchProduct.js`: Powers search/autocomplete. It can query `/api/products/search` for server-side matches but also normalizes the local list for offline filtering. The module feeds `renderInventory()` and integrates with the pagination controls.
- `updatepage.js`: Manages pagination UI (prev/next buttons, page numbers, items-per-page). It ensures the table height stays stable during page switches and that `renderInventory()` displays the correct slice.
- `addshop.js`: Handles shop switching/creation/renaming, updates the `shop-nav`, caches metadata, and exposes `fetchWithShop()` so scripts automatically send the header `X-Shop-ID`.
- `restinventory.js`: Implements the two-step reset workflow with password verification, deletes all products, clears caches, and refreshes UI components via the shared `script.js` helpers.
- `picture.js`: Accepts local file drops or URLs, caches them in IndexedDB, previews them instantly, and uploads via `POST /api/products/picture/by-ean/<ean>` during saves.
- `excelInlineEdit.js`: Adds inline editing to table rows. Double-click a cell, type a new value, and the script issues a `PUT /api/products/<id>`. It throttles requests and reuses helper functions for patching the shared data.
- `helper.js` & `Key_Shortcut.js`: Support utilities for autofill hardening, keyboard shortcuts, toast messaging, and shared DOM helpers.

## Data signals & integrations

- **Products:** Primary payload for the console. The modules expect each product to include `name`, `sku`, `price`, `amount`, `category`, `primaryCategory`, `promoPrice`, `pictureUrl`, `brand`, `updatedAt`, `reorderLevel`, `ean`, `plu`. Scripts normalize amounts, stock statuses, and promotional messaging from these fields.
- **Shops:** `/api/shops` feeds `addshop.js`. The active shop sets `window.currentShop`, updates the UI header, and ensures API calls target the right warehouse.
- **Warehouses & purchases:** Additional endpoints fill the dashboard KPIs and triggers (low-stock, purchase trends, restock queue). `script.js` exposes helper loaders for each dataset.
- **Status messages:** `setStatus()` and the toast layer provide live feedback (loading, success, errors). They are triggered from `loadProducts()`, clipboard actions, reset flows, etc.
- **Clipboard & sharing:** “Request Stock” buttons create pre-formatted summaries that copy to the clipboard. You can replace the clipboard logic with webhooks or messaging APIs to integrate with CRM/WhatsApp/Slack.

## Extension & customization ideas

1. **Add new modules:** Append sections to `index.html` with unique IDs, then load an additional JS file after `script.js` that listens for `window` events or uses `fetchWithShop()` helpers.
2. **Swap styling:** Use `dashbord.css` and `index.css` as blueprints. You can rebrand by overriding CSS variables and rewriting grid layout rules.
3. **Hook into analytics:** Add new helper scripts that call `renderInventory()` or `showToast()` from `script.js` to surface custom metrics or automation triggers.
4. **Tighten security:** Wrap API calls returned from `fetchWithShop()` with your auth layer (e.g., tokens stored in IndexedDB, session storage, or cookies).
5. **Embed insights:** Extract the dashboard into an iframe by reusing `dashboard.js` and the shared CSS for secure remote tools.

## Deployment & operational checklist

- Serve the folder from any static host (CDN, S3, Netlify, Vercel, Apache, etc.). No bundling is required.
- Configure CORS on the API host so the static console can call `/api` from a different domain.
- Use your CI/CD pipelines to publish the `ivms/` folder at a dedicated route (`/ivms/`), ensuring scripts still find `inventory-all-categories.csv`.
- Monitor the console by reusing the `loadProducts()` promise results—hook custom logging or analytics into the `script.js` lifecycle.
- Test keyboard shortcuts, modal behaviors, and inline edits across browsers; the helper modules already provide cross-browser fallbacks (e.g., `navigator.clipboard` fallback to `alert`).

## Notes

- The SPA boots with deferred scripts at the bottom of `index.html`, guaranteeing the DOM is ready when each helper runs.
- `inventory-all-categories.csv` remains as a quick export from the backend for offline analysis or handoff to other teams.
- Hooks like `window.renderInventory` allow you to write automated UI tests or even external integrations that reuse the same rendering logic.
## How to run

1. Serve the `ivms/` folder statically (e.g., `cd ivms && python -m http.server 5500`).
2. Ensure your backend API (`/api`) is accessible at the host you configured via `window.API_BASE` (default is `http://127.0.0.1:4000/api`).
3. Open `index.html` in the browser; the global `script.js` will bootstrap, fetch shops/purchases/warehouses, and then load the supporting modules (dashboard, product search, etc.).
4. Use the navigation tabs to switch between panels; the DOM modules will show/hide sections and render data from the shared state.

## Directory structure

- `index.html`: Shell with tabbed navigation, modals, buttons, and placeholders for the dashboard, grids, popups, and embedded tools (online shop preview, POS). It loads CSS, FontAwesome, third-party scripts (QRCode.js, Quagga, ApexCharts), and every helper module at the bottom.
- `index.css` & `dashbord.css`: Shared styling for the entire layout (`index.css`) and the dashboard-specific grid, KPIs, and overview cards (`dashbord.css`).
- `script.js`: Core orchestrator. It stores global state (`products`, `warehouses`, `shops`, etc.), exports helpers (e.g., `renderInventory`, `showToast`, `fetchWithShop`), wires to the tabs, and loads contextual data used by the peripheral scripts.
- `dashboard.js`: Renders the KPI grid, charts, schedule widgets, and navigational prompts inside the dashboard tab. It consumes the global data from `script.js` and reacts to updates.
- `searchProduct.js`: Adds lightweight, offline-friendly search/pagination. It normalizes product records, optionally hits `/api/products/search`, and exposes pagination state for the inventory grid.
- `updatepage.js`: Handles table pagination controls, rendering buttons, and keeping `currentPage`/`itemsPerPage` in sync with `renderInventory`.
- `addshop.js`: Manages shop metadata (listing, switching, renaming) and exposes `fetchWithShop()` and `window.currentShop` so other modules call the API with `X-Shop-ID` headers.
- `restinventory.js`: Implements the reset workflow (confirmation modal + password). It calls `DELETE /api/products/reset/all`, clears caches, and refreshes UI components via shared helpers.
- `picture.js`: Manages product image uploads/caching. It reads files or URLs, caches blobs in IndexedDB, previews photos, and uploads via `POST /api/products/picture/by-ean/<ean>`.
- `excelInlineEdit.js`: Enables inline editing of inventory rows. Double-click cells, edit numeric fields, and commit changes through `PUT /api/products/<id>`.
- `helper.js` & `Key_Shortcut.js`: Utility modules for form autofill hardening, keyboard shortcuts, and global helper functions.

## Data signals

- **Products:** Fetched via `script.js` (and optionally `searchProduct.js`). Helpers expect fields such as `name`, `sku`, `price`, `amount`, `category`, `primaryCategory`, `promoPrice`, `pictureUrl`, `brand`, `updatedAt`, `reorderLevel`.
- **Shops:** Served by `/api/shops`. `addshop.js` caches their metadata and ensures every module uses the same `shopId`.
- **Warehouses/purchases:** `script.js` provides loaders for rounding out the KPIs in the dashboard and other tabs.

## Extensions

1. **Add new tab modules:** Extend `index.html` with a new `section`, then load a dedicated JS file after `script.js` that hooks into the shared helpers.
2. **Replace styling:** Update `dashbord.css` or `index.css` to tweak the layout—each CSS file is scoped so you can refactor per module.
3. **API integration:** Adjust the helper functions (e.g., `fetchWithShop`, `renderInventory`) in `script.js` to match new endpoints or authentication layers.
4. **Deploy:** Bundle the folder with your CI/CD or host it inside your main web app; the scripts load asynchronously and do not depend on bundlers.

## Notes

- The SPA boots with deferred scripts at the bottom of `index.html`, so the DOM is ready when each helper runs.
- The folder still includes `inventory-all-categories.csv` as a reference export from the back office.
- Testing hooks (e.g., `window.renderInventory`) exposed by `script.js` can be repurposed for automated UI/unit tests if needed.
