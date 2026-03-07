# Inventory API Platform

The `src` folder implements the Node/Express API backbone for the inventory platform. It is optimized for clarity, testability, and a predictable contract that all frontends (`ivms`, `storefront`, `pos`, etc.) can rely on.

## Vision & value

- **Unified source of truth:** Every product, purchase, shop, and warehouse lives here, so dashboards, storefronts, and automation always operate on the same record.
- **Transparent layers:** Models, routes, middleware, and utilities are separated to allow teams to reason about how data flows from MongoDB to the browser.
- **REST-first contract:** Responses consistently follow `{ success, data, error }`, enabling clients to handle success/failure uniformly while letting helpers such as `fetchWithShop()` manage auth/shopping context.
- **Secure operations:** JWT-based authentication, guarded reset flows, and auth middleware keep the console suitable for external exposure.

## Folder anatomy

| Layer | Purpose |
| --- | --- |
| `index.js` | App entry point. Configures Express (JSON parsing, CORS, rate limiting), mounts routers (`/api/auth`, `/api/products`, `/api/purchases`, `/api/shops`, `/api/warehouses`, `/api/history`), hooks global error handling, and starts the server after `connectToDatabase()` resolves. |
| `config/db.js` | Singleton MongoDB connector that reads `MONGO_URI`, logs connection health, and exports `connectToDatabase()` for modules that must await readiness. |
| `models/` | Mongoose schemas for `Product`, `PurchaseOrder`, `Shop`, and `User`. Each schema declares field validation, defaults, indexes, and helper methods utilized across services. |
| `routes/` | Express routers grouped by resource. They validate inputs, interact with models, and wrap responses in the standard envelope. |
| `middleware/` | Shared middleware such as `auth.js` (JWT validation) plus any rate limiting, sanitization, or logging hooks. |
| `utils/` | Utility helpers (`utils/csv.js`, `utils/password.js`, `utils/token.js`) used across routes to keep cross-cutting logic centralized. |

## API surface & responsibilities

| Feature | Endpoints | Description |
| --- | --- | --- |
| **Authentication** | `POST /api/auth/login`, `POST /api/auth/register` | JWT issuance via `utils/token.js`. Returns `{ success, data: { token, user } }`. |
| **Products** | `GET /api/products`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /api/products/search`, `DELETE /api/products/reset/all`, `POST /api/products/picture/by-ean/:ean` | Catalog sync, filtering, pagination, search, inline edits, reset, and image uploads used by dashboards, the storefront, and REST operations. |
| **Purchases** | `GET /api/purchases`, `POST`, `PUT /:id` | Tracks purchase orders, approvals, receipts, and feeds KPI calculations. |
| **Shops** | `GET /api/shops`, `POST`, `PATCH /:id` | Manages multi-shop metadata so `addshop.js` can populate nav bars and provide `fetchWithShop()` with context. |
| **Warehouses** | `GET /api/warehouses`, `PUT /:id` | Surfaces warehouse status and activity for dashboards and analytics. |
| **History** | `GET /api/history` | Returns audit entries (price changes, stock edits) for reporting and compliance. |

All routes respond using `{ success: boolean, data: any, error?: string }` for predictable parsing. Protected routes call `middleware/auth.js` to ensure valid `Authorization: Bearer <token>` headers.

## Data contracts

- **Product** documents include `name`, `sku`, `ean`, `plu`, `price`, `cost`, `amount`, `reorderLevel`, `category`, `primaryCategory`, `secondaryCategory`, `brand`, `pictureUrl`, `promoPrice`, `visibility`, `weight`, `warehouse`, `supplier`, `createdAt`, `updatedAt`. Frontends leverage these to compute KPIs, render the inventory grid, and make filtering decisions.
- **Shop** objects expose `id`, `name`, `currency`, `timezone`, `logo`, `description`. These values are displayed in the UI and ensure `X-Shop-ID` headers target the correct context.
- **PurchaseOrder** records contain `items`, `supplier`, `status`, `requestedBy`, `approvedBy`, `receivedAt`, `total`, which power purchase workflows and dashboard insights.
- **Response envelope** `{ success, data, error?: string }` keeps client-side logic simple, letting UI helpers show toasts/status banners without inspecting payload shapes.

## API usage pipeline

1. **Bootstrapping**: Frontends call `/api/shops` to populate shop selection and define `window.currentShop` plus `fetchWithShop()` context.
2. **Catalog sync**: `GET /api/products?shop=<id>&limit=500&sort=updatedAt` seeds dashboards (`IVMS`), inventory lists, and the storefront catalog.
3. **Updates**: Inline edits (`PUT /api/products/:id`), resets (`DELETE /api/products/reset/all`), and picture uploads (`POST /api/products/picture/by-ean/:ean`) all route through `routes/products.js` so they can reuse validation and response logic.
4. **KPIs & analytics**: `/api/purchases` and `/api/warehouses` feed the KPI cards in `dashboard.js`, while `/api/history` fuels audit/external reporting panels.
5. **Authentication**: `/api/auth` issues JWTs consumed by `fetchWithShop()` and other helpers to add `Authorization` headers automatically.

## Getting started

1. Copy `.env.example` to `.env` and populate `MONGO_URI`, `JWT_SECRET`, `PORT`, and any environment-specific values.
2. Install dependencies with `npm install` at the repository root.
3. Run `npm run dev` (watch mode) or `npm start` to launch the Express app (`src/index.js`).
4. Use Postman/curl to call `/api/auth/login`, store the JWT, and use it for protected routes such as `/api/products` and `/api/purchases`.
5. Point `ivms`, `storefront`, or `pos` clients at this API via `window.API_BASE` so they consume the same datasets.

## Development & extension notes

- **Extract services as needed**: While routers currently encapsulate business logic, feel free to refactor complex flows into dedicated service modules when reuse or testing becomes necessary.
- **Add new resources**: Create `routes/*.js`, export the router, and mount it inside `index.js` with optional middleware (e.g., `auth`). Update clients to use the new endpoint.
- **Share utilities**: Keep reused helpers (CSV parsing, password hashing, tokens) in `utils/` so they can be reused by multiple routers.
- **Testing hooks**: Spin up the Express app with `mongodb-memory-server` in integration tests to validate authentication and product flows.
- **Coordinate with frontends**: Anytime you change a product/shop attribute, update `ivms`, `storefront`, and `pos` to prevent rendering mismatches.
- **Instrument observability**: Enhance `config/db.js` with logging, and wrap routes with logging/error reporting (Sentry, Winston) for production diagnostics.

## Deployment checklist

1. Secure `.env` secrets (`JWT_SECRET`, database credentials) per environment.
2. Run the service via PM2, Docker, or systemd and expose the configured `PORT`.
3. Monitor MongoDB connectivity via logs from `config/db.js` or external monitoring tools.
4. Ensure CORS/auth policies allow the static frontends to reach `/api` securely.
5. Log API errors, consider request tracing, and hook health checks for uptime monitoring.

## Security & compliance

- JWT authentication lives in `middleware/auth.js`; protected routes call `authenticateToken` to verify tokens before accessing sensitive mutations.
- Reset flows (`DELETE /api/products/reset/all`) should stay gated with additional client-side confirmations (via `restinventory.js`).
- Extend `middleware/` with rate limiting or additional sanitization if you anticipate high-volume or public exposure.

## Notes

- Never commit real secrets; keep `.env` out of source control and only populate it in deployment environments.
- `inventory-all-categories.csv` remains a reference export for manual analysis or cross-team sharing.
- Hooks like `window.renderInventory` in the frontend share rendering logic, enabling automated UI tests or external integrations that reuse the same pipeline.
