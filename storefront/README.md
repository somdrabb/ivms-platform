# Storefront Module (A–Z)

The `storefront` folder is the public-facing extension of your inventory platform. It mirrors the inventory state that the back-office console manages but keeps the experience lightweight, branded, and safe for sharing with customers, partners, or internal sales reps.

## A. Architecture and Structure

- **`index.html`** is the single entry point. It lays out:
  - A hero header with brand, subtitle, and controls (search + sort).
  - A sidebar with filter panels (categories, availability, quick info).
  - A main area containing a status banner and a responsive product grid.
  - A `<template>` for product cards so the JS can instantiate each card without heavy DOM creation logic.
  - The only script it loads is `shop.js` (module) and the stylesheet `style.css`, keeping the bundle dependency-free.
- **`style.css`** defines the design system: gradients, chip buttons, panels, cards, badges, responsive grid, and focus/hover styles. It exposes CSS variables for quick rebranding (colors, typography, spacing) and uses modern layout techniques (flex, grid, clamp) for a polished look.
- **`shop.js`** is the entire behavior layer. It:
  - Picks an API base (`window.API_BASE`, `window.location`, or default `http://127.0.0.1:4000/api`).
  - Parses query parameters (`shop`, `name`, `sort`, `embed`) and stores them in a `state` object along with results, filters, and categories.
  - Holds DOM references (search input, sort select, category list, product grid, template, status banner). It exposes helper functions (`setStatus`, `fetchJSON`, `renderProducts`, `bindEvents`).
  - Loads shop metadata and product listings, then re-renders the UI whenever filters change.

## B. Data Flow (How it Works)

1. On load, `shop.js` sets the banner to “Loading products…” via `setStatus` and then calls `loadShopMetadata()`.
2. `loadShopMetadata()` hits `GET /api/shops`, finds the active shop by query param `shop` (default `shop-1`), and updates the header title/subtitle to reflect the shop name.
3. `loadProducts()` constructs a URL (`/api/products?limit=500&shop=<id>&sort=updatedAt&dir=desc`), fetches product records, and stores them in `state.products`.
4. `state.categories` is derived from each product’s `category`, `primaryCategory`, and `secondaryCategory`, and used to populate the filter chips.
5. `renderProducts()` applies filtering/sorting/searching:
   - Category filter: only cards whose category matches the active chip remain.
   - Availability filter: only show in-stock/low-stock/out-of-stock respectively.
   - Search input: matches name, brand, SKU, descriptions, category fields.
   - Sort dropdown: sorts by price (asc/desc), name, newest, or default featured logic (stocked items first, then update date).
6. For each card, the script clones the template, fills in image/alt text, brand, description, price, SKU, category, promo badge, and stock pill. `summarizeAvailability()` decides the tone of the stock pill based on quantity vs. reorder level.
7. Each “Request Stock” button copies a summary (shop, product name, price, SKU/EAN/PLU) to the clipboard (or falls back to `alert`). The banner briefly shows success.
8. If any fetch fails, the status banner turns red and displays the error.
9. The sidebar chips and toolbar inputs are bound to events so the UI rerenders live as users interact with filters/search.

## C. Details of Every Component

- **Header (`store-header`)**: Shows the boutique name (updated from API), a subtitle describing the synced catalog, a search input, and a sort dropdown.
- **Sidebar (`store-sidebar`)**: Contains three panels:
  - Categories: chips generated from product metadata (default “All products”).
  - Availability: static chips for All/In stock/Low stock/Out of stock.
  - Info panel: explains the tooltip about the “Request Stock” clipboard action.
- **Main content (`store-content`)**: Houses the status banner (hidden until set) and the product grid.
- **Product card template**: Includes an image, stock badge, name/brand, description, metadata list (price, SKU, category), a “Request Stock” button, and a promo/updated pill.
- **Status banner**: Shows loading, success, or error states. It removes classes when cleared.
- **Product interactions**: Buttons copy details to clipboard for easy sharing. Sorting/filtering/searching all happen client-side with the cached product list.

## D. Connections and Integrations

- The storefront communicates with the same `/api` backend used by the rest of the platform. `shop.js` expects endpoints:
  - `GET /api/shops`: returns metadata (id, name, description).
  - `GET /api/products`: returns product arrays. Each item should contain `name`, `sku`, `price`, `amount`, `category`/`primaryCategory`, optional `secondaryCategory`, `promoPrice`, `pictureUrl`, `brand`, `updatedAt`, `reorderLevel`, `ean`, `plu`.
- The clipboard action can be replaced by a custom integration (email, chat, CRM) by changing the `actionBtn` event handler.
- Query params allow embedding or specifying a shop. Add `embed=1` to apply `.is-embed` on `<body>` for custom styles.

## E. Customization & Extension

1. **Rebranding**: Adjust CSS variables in `:root` within `style.css` to tweak colors, accent hues, typography, or backgrounds.
2. **New filters**: Add new chips or controls in the sidebar and update `bindEvents()` plus `filterProducts()` to respect them.
3. **Extended cards**: Modify the `<template>` to show extra fields (e.g., vendor, margin). Update `renderProducts()` to fill the new elements.
4. **Alternate fetch logic**: Swap `loadProducts()` with a server-side filter/pagination flow; keep the same `state` object so the render functions still work.
5. **Clipboard agent**: Instead of `navigator.clipboard`, call a webhook or messaging API to notify sales reps when they request stock.
6. **Embed-friendly mode**: When `embed=1`, the script adds `is-embed` to `<body>`. You can target that class in CSS to remove margins, hide the footer, or apply transparent backgrounds.

## F. Running & Deployment Checklist

- Install nothing—this is vanilla HTML/CSS/JS. Just serve the folder statically (`python -m http.server`, Netlify, etc.).
- Ensure CORS is configured on the API host if you serve the storefront from a different origin.
- Use build pipelines (CI/CD) to copy this folder into your static site host so it can be referenced at `/storefront/index.html`.
- To preview locally, run `cd storefront && python -m http.server 4321` and open `http://localhost:4321/index.html`.

## G. Troubleshooting

- **Empty grid**: Ensure the API returns JSON with a `data` array. The script falls back to arrays directly from the response if `.data` is missing.
- **Status banner stuck**: The banner auto-clears after a delay when successful; call `setStatus('...')` to override or clear by calling `setStatus('')`.
- **Slow fetch**: Increase the `limit` parameter or implement server-side pagination if your catalog exceeds 500 items.
- **Images missing**: The fallback uses inline SVG with the first letter of the product name. Supply `pictureUrl` to avoid this.

This README should give readers a complete A–Z of how the storefront is structured, what motivates each part, how it interacts with data, and how to customize or troubleshoot it. Let me know if you’d like a similar breakdown for another module.
