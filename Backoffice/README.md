# Backoffice SPA

This folder contains the POS backoffice single-page experience that powers dashboards, POS management, inventory, sales, cash, reports, sync, bank, and settings. It's a static front-end that talks to the API defined by `localStorage`: by default `http://localhost:4000/api`.

## Layout
- `backoffice.html` – the entry HTML (sidebar, header, toast, modal root, main content slot). It links to Font Awesome, the extracted `backoffice.css`, and `backoffice.js`.
- `backoffice.css` – all visual styles (theme variables, sidebar/main layout, cards, tables, toolbar, toast, modal, responsive breakpoints).
- `backoffice.js` – the entire behavior: CONFIG helpers, router, view renderers, modal utilities, toast/clock/theme toggles, fetch wrappers, and actions for each tab.
- `public/assets/` – place shared images/icons that the SPA may consume (the folder includes a README placeholder).

## How it works
1. The script reads `localStorage` for `api_base`, `auth_token`, and `theme` and applies them via `CONFIG`. You can override these before loading `backoffice.js` if you host the SPA elsewhere.
2. `routes` maps sidebar entries to renderers; `navigate()` updates `location.hash`, and `mount()` renders the appropriate view and sets the active link.
3. Each view (`renderDashboard`, `renderTerminals`, `renderCashiers`, etc.) fetches data via `fetchJSON` (wrapping `CONFIG.BASE_URL`) and renders into `#app`. The shared `Loading`, `ErrorBanner`, and `toast` helpers keep UI consistent.
4. Pagination/search state is kept in `pageState`, with independent handlers for terminals/cashiers/inventory/sales tables.
5. The modal is reused for actions such as register terminal, add/edit cashier, new product, etc., and the footer buttons close or submit via `openModal`/`closeModal`.
6. Utility functions include `exportCSV`, a live clock (`updateClock`), and the theme toggle button.

## Assets and extension
- Drop icons or background images into `public/assets` and reference them via relative URLs (e.g., `<img src="public/assets/logo.png" alt="">`).
- To extend the experience, keep `backoffice.js` modular: add a new renderer and a sidebar entry, then update `routes` and `pageState` accordingly.
- For build pipelines, treat this folder as static content. Nothing here depends on bundlers, so you can deploy it to any static host (S3, Netlify, etc.) as long as `fetchJSON` can reach the backend.

## Deployment hints
1. Serve `Backoffice/backoffice.html` from `/Backoffice` or configure rewrites if the folder is served from another base.
2. Ensure `localStorage.api_base` points to the correct API (set it via console or a tiny preload script before `backoffice.js` runs).
3. Copy `public/assets` alongside the HTML/JS/CSS so any asset URLs resolve correctly.
