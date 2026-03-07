# IVMS-97 Project Architecture

## Overview
The IVMS-97 project is a browser-based inventory operations console built as a single-page dashboard that integrates with the INVENTRA backend API (`/api`). The experience is composed of modular JavaScript snippets that progressively enhance the static `index.html`, so the architecture is entirely front-end driven and communicates with the REST backend via `fetch`/`fetchWithShop`. All assets are served statically (e.g., from a simple HTTP server, `Live Server`, Netlify, etc.) and rely on `window.API_BASE` to target the API host.

## Frontend Layers
- **HTML shell (`index.html`)**: Defines the tab layout (dashboard, product mgmt, warehouse, purchases, ESL, online shop, POS), modals, and placeholders for dynamic sections (`inventory-table`, popups, `shop-nav`, etc.). It also injects CSS dependencies (`index.css`, `dashbord.css`) and third-party libraries (Font Awesome, QRCode.js).
- **Styling**: `index.css` and `dashbord.css` contain layout rules for tabs, cards, tables, popups, and responsive utilities. The CSS files keep the UI consistent across all modules.
- **Global state scripting (`script.js`)**: The main orchestrator. It captures DOM references, defines shared helpers, manages data sets (`products`, `warehouses`, `purchaseOrders`, `transferActivityLog`, etc.), and wires UI components (tables, modals, ESL grid, online shop preview). `script.js` also exposes routines required by other modules (e.g., `renderInventory`, `updateDashboard`, `showToast`).

## Supporting Modules
- **Shop management (`addshop.js`)**: Handles multi-shop awareness. It caches shop metadata in `localStorage`, renders the shop navigation bar, switches/renames/deletes shops, and ensures `window.currentShop` stays in sync. It also exposes `fetchWithShop` when available.
- **Reset workflow (`restinventory.js`)**: Implements the two-step reset modal (password + confirmation) and calls `DELETE /api/products/reset/all`. It cleans caches, refreshes UI, and communicates success/failure via toast/error helpers already defined in `script.js`.
- **Search enhancements (`searchProduct.js`)**: Provides offline/online search. It normalizes product data into searchable haystacks, hits a server search endpoint for precise matches, and falls back to client filtering. It also manages indicators and pagination state when a server search is active.
- **Pagination (`updatepage.js`)**: Calculates windowed pages, renders pagination buttons, and adjusts `itemsPerPage`. It exposes helpers that other modules call when rendering subsets of `_currentList` or `products`.
- **Inline editing (`excelInlineEdit.js`)**: Optional module providing double-click-to-edit cells. It reuses existing APIs (`renderInventory`, `saveProduct`, `_currentList`, etc.) and commits updates through `PUT /api/products/<id>`.
- **Picture upload/cache (`picture.js`)**: Hooks into the add-picture workflow. It reads local files or remote URLs, caches blobs in IndexedDB, populates preview images, and exposes `uploadForEAN` so the add/edit workflow can persist pictures via `POST /api/products/picture/by-ean/<ean>`.
- **Keyboard shortcuts (`Key_Shortcut.js`)**: Supplies a global shortcut layer (Ctrl/⌘ aware) for navigation, search, add/save/reset, and includes a help overlay (F1/Shift+?). It is aware of modals, input focus, and prevents interference with typing.
- **Autofill protection (`helper.js`)**: Prevents browsers from triggering autofill. It marks sensitive inputs as readonly until focus, injects a decoy form, and observes DOM mutations to reapply hardening.

## Data Flow
1. **Initialization**: `script.js` loads on DOM ready, picks the API base (`window.API_BASE`), fetches initial inventory lists, and renders KPIs/panels.
2. **Shop-aware API calls**: `addshop.js` provides shop-scoped wrappers. If `fetchWithShop()` exists globally, every module defers to it for consistent headers (e.g., `X-Shop-ID`).
3. **User actions**:
   - **Search**: `searchProduct.js` intercepts search submissions, optionally queries the server (`GET /api/products/search`), and re-renders via `renderInventory`.
   - **Pagination**: `updatepage.js` updates `currentPage`/`itemsPerPage`, locks container height for smooth UI, and triggers `renderInventory`.
   - **Inline edits**: `excelInlineEdit.js` allows editing numeric fields and posts diffs to the API (`PUT /api/products/<id>`).
   - **Reset**: `restinventory.js` moves through a protected modal, deletes all products, clears caches, and refreshes UI components.
   - **Pictures**: `picture.js` stages blobs, previews them in the table, and uploads them via `POST /api/products/picture/by-ean/<ean>` when saving.
4. **Rendering**: Shared helpers in `script.js` respond to updated data (`products`, `warehouses`, etc.) by regenerating tables, KPIs, ESL grids, and online shop previews.

## Deployment & Extension
- Serve the `ivms/` folder statically (e.g., `python -m http.server 5500` or Netlify). Ensure the API URL is reachable by setting `window.API_BASE`.
- The architecture favors pluggable helpers (`fetchWithShop`, `showToast`, `renderInventory`, `normalizeProduct`). This keeps each module decoupled yet reliant on consistent global state.
- For future extensions, add new helper scripts that call `renderInventory` or `showToast` instead of manipulating the DOM manually.

## Summary
IVMS-97 stitches together several self-contained front-end scripts on top of a static HTML layout to offer multi-shop inventory oversight, purchase/transfer tracking, ESL printing, inline editing, keyboard shortcuts, and automation helpers. It communicates with the backend via REST, caches critical data (shops, transfers, pictures), and layers optional utility scripts for power users.
