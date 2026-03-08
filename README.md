# IVMS — Integrated Inventory, POS, Storefront & Backoffice Platform

<p align="center">
  <b>A full-stack retail operations platform for inventory, POS,S-Go POS, storefront Management for Onlineshop, Online-Shop , backoffice, promotions- Auto generated Prospecats with Autometion, and multi-shop management.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express-API-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=for-the-badge&logo=javascript" />
  <img src="https://img.shields.io/badge/HTML-CSS-orange?style=for-the-badge&logo=html5" />
  <img src="https://img.shields.io/badge/Multi--Shop-Supported-blue?style=for-the-badge" />
</p>

---
## Overview

**IVMS** is a unified **retail operations platform** that combines multiple business-critical tools into one connected system.

Instead of building isolated pages, this project was designed as a **shared platform** where all major interfaces connect to the same backend and database. That means products, stock, pricing, shops, purchases, inventory movements, and operational workflows remain synchronized across the whole ecosystem.

The platform includes:

- **Inventory management console**
- **Backoffice / admin interface**
- **POS (Point of Sale) system**
- **Customer-facing storefront**
- **Prospectus / promotions workspace**
- **Central API and database backend**

This makes IVMS much more than a normal CRUD app. It is a **multi-surface retail platform** built around one shared source of truth.
---

## What this project includes

### 1. Central backend and database
The backend is the shared source of truth for the whole platform. It handles API routing, database access, shop-aware data, product management, purchases, history, warehouses, and authentication. The main server mounts the API and serves the static frontends for the storefront, POS, and backoffice from the same application.

### 2. IVMS frontend console
The IVMS console is the main operational cockpit for staff. It includes dashboard KPIs, inventory management, transfers, purchases, ESL-related tools, shop-aware product operations, image handling, inline editing, and keyboard shortcuts. The main shell is defined in `index.html`, while the behavior is split across focused helper files such as `script.js`, `addshop.js`, `updatepage.js`, `excelInlineEdit.js`, `picture.js`, and `Key_Shortcut.js`.

### 3. POS interface
The storefront is the customer-facing catalog interface. It is designed as a lightweight frontend that reads live product and shop data from the shared API, displays inventory in a polished layout, and supports search, sorting, category filters, availability filters, and quick stock request actions. See `shop.js`, `style.css`, and the storefront HTML files for the current implementation.

### 4. Storefront / online shop
The storefront is the customer-facing catalog interface. It is designed as a lightweight static frontend that reads live product/shop data from the shared API, displays inventory in a polished layout, and supports search, sort, category filters, availability filters, and quick stock request actions. The storefront shell is defined in `index.html` and powered by `shop.js`. 

### 5. Backoffice SPA
The backoffice is a single-page staff/admin interface focused on dashboards, terminals, cashiers, inventory, reporting, payments, and other business-side workflows. The uploaded `backoffice.html` contains the SPA layout and a large amount of inline styling and behavior, and it calls API endpoints such as sales, terminals, and cashier-related routes.

### 6. Prospectus / promotions workspace
The prospectus workspace is used to design promotional layouts and marketing pages. The uploaded `propectas.html` includes editing tools, company profile storage, modal interactions, discount/product loading, zoom support, and client-side persistence. In the current uploaded state, much of this logic is embedded directly in the HTML file rather than split into separate CSS/JS assets.

---

## Core architecture

This project follows a shared-data architecture:

1. The **backend** stores and serves products, shops, purchases, warehouse activity, and history.
2. The **IVMS console** consumes those APIs for inventory and operations.
3. The **storefront** reads the same product/shop data for customer-facing browsing.
4. The **POS** can use the same API host and active shop context for article lookup and transaction-related flows. 
5. The **backoffice** acts as a business operations SPA and also talks to the same backend. 
6. The **prospectus** workspace can pull promotional/inventory data to build marketing content.

That makes IVMS a unified retail platform rather than a collection of unrelated pages.

---

## Tech stack

### Backend
- Node.js
- Express
- MongoDB / Mongoose
- ES Modules
- CORS, Morgan, dotenv

The current backend entry point is `src/index.js` according to the runtime scripts, and the uploaded server file imports database, models, middleware, and routes for products, shops, purchases, warehouses, history, and auth. fileciteturn6file1 fileciteturn6file2

### Frontend
- HTML
- CSS
- Vanilla JavaScript
- Font Awesome
- LocalStorage / IndexedDB where needed
- Some third-party browser helpers such as QR/barcode/chart-related scripts referenced by the frontend shell. fileciteturn6file3

### Design approach
- Static frontends that can be served directly by Express
- API-first communication between frontend and backend
- Multi-shop awareness via shop IDs and shop-scoped requests
- Lightweight browser-native modules without bundler dependency in the uploaded version

---

## Main features

### Inventory and product management
- Product listing and editing
- Shop-aware inventory handling
- Search and pagination
- Inline stock editing
- Product pictures / image workflows
- CSV-related support utilities
- Inventory reset flow with confirmation safeguards
- Transfer queue and retry support in the IVMS console. 

### Dashboard and operations
- KPI cards and overview panels
- Multi-tab operational cockpit
- Purchase and warehouse-related visibility
- Activity indicators and notifications
- Keyboard shortcuts and utility helpers. 

### Multi-shop support
- Shop-aware requests
- Shop metadata loading and persistence
- Storefront shop targeting
- POS shop selection fallback logic. 

### Storefront capabilities
- Product grid
- Search and sort
- Category and availability filters
- Customer-facing request-stock workflow
- Shop-specific storefront view.

### POS capabilities
- Login/lockscreen flow
- Soft keypad / numeric input
- Product/article lookup
- Session persistence in localStorage
- Shop-aware API base detection and product fetch attempts.

### Backoffice capabilities
- Dashboard widgets
- Sales views
- POS terminal management
- Cashier management
- Business/admin workflow screens.

### Prospectus capabilities
- Editable promotion canvas
- Company profile persistence
- Discount/product loading
- Zoom controls
- Modal-based content editing. 

---

## Suggested project structure

The uploaded files indicate a strong system, but the repository would be easier to maintain with a clearer split between backend and frontend modules. A clean structure would look like this:

```text
ivms-platform/
├─ package.json
├─ package-lock.json
├─ README.md
├─ .env
├─ .env.example
├─ uploads/
├─ src/
│  ├─ index.js
│  ├─ db.js
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ models/
│  │  ├─ product.js
│  │  ├─ purchaseOrder.js
│  │  ├─ shop.js
│  │  └─ user.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ products.js
│  │  ├─ purchases.js
│  │  ├─ shops.js
│  │  ├─ warehouses.js
│  │  └─ history.js
│  └─ utils/
│     ├─ csv.js
│     ├─ password.js
│     └─ token.js
├─ frontend/
│  ├─ ivms/
│  ├─ storefront/
│  ├─ pos/
│  ├─ backoffice/
│  └─ prospectus/
└─ docs/
   └─ screenshots/
```

This structure matches the architecture already implied by the current server imports and npm scripts. fileciteturn6file2 fileciteturn6file1

---
# IVMS — Integrated Inventory, POS, Storefront & Backoffice Platform

<p align="center">
  <b>A full-stack retail operations platform for inventory, POS, storefront, backoffice, promotions, and multi-shop management.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express-API-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=for-the-badge&logo=javascript" />
  <img src="https://img.shields.io/badge/HTML-CSS-orange?style=for-the-badge&logo=html5" />
  <img src="https://img.shields.io/badge/Multi--Shop-Supported-blue?style=for-the-badge" />
</p>

---

## Overview

**IVMS** is a unified **retail operations platform** that combines multiple business-critical tools into one connected system.

Instead of building isolated pages, this project was designed as a **shared platform** where all major interfaces connect to the same backend and database. That means products, stock, pricing, shops, purchases, inventory movements, and operational workflows remain synchronized across the whole ecosystem.

The platform includes:

- **Inventory management console**
- **Backoffice / admin interface**
- **POS (Point of Sale) system**
- **Customer-facing storefront**
- **Prospectus / promotions workspace**
- **Central API and database backend**

This makes IVMS much more than a normal CRUD app. It is a **multi-surface retail platform** built around one shared source of truth.

---

## Platform Modules

### 1. Inventory & Operations Console
The main IVMS console is the internal operational cockpit used to manage products, stock, warehouses, purchases, transfers, ESL-related workflows, images, inline editing, search, and pagination.

### 2. Backoffice SPA
The backoffice is an admin/business-focused interface for dashboards, sales views, terminal handling, cashier-related workflows, and other staff-facing business operations.

### 3. POS Interface
The POS module provides a browser-based point-of-sale experience with login/lockscreen flow, article lookup, keypad interaction, session persistence, and register-oriented screen logic.

### 4. Customer Storefront
The storefront is a customer-facing catalog experience that reads live data from the shared API and supports search, sorting, category filters, availability filters, and quick stock-request interactions.

### 5. Prospectus / Promotions Workspace
The prospectus module acts as a promotional editor and marketing workspace that supports editable layouts, company profile data, zooming, discount/product loading, and local persistence.

### 6. Central Backend & Database
The backend is the shared API and data layer that powers all modules. It handles products, shops, purchases, warehouses, stock history, authentication, and static frontend delivery.

---

## Why this project is strong

This repository is strong because it demonstrates **system-level thinking**, not just page-level coding.

### It combines:
- inventory management
- multi-shop operations
- admin workflows
- customer-facing retail UI
- POS-style interactions
- purchase / warehouse processes
- promotional tooling
- one shared backend and database architecture

That makes it far more realistic than a basic tutorial app.

---

## Architecture

```text
                         ┌───────────────────────────┐
                         │        MongoDB            │
                         │   Products / Shops /      │
                         │ Purchases / Users / Logs  │
                         └─────────────┬─────────────┘
                                       │
                                       │
                          ┌────────────▼────────────┐
                          │   Node.js + Express API │
                          │  Auth / Products /      │
                          │  Shops / Purchases /    │
                          │  Warehouses / History   │
                          └───────┬───────┬─────────┘
                                  │       │
               ┌──────────────────┘       └──────────────────┐
               │                                             │
     ┌─────────▼─────────┐                         ┌─────────▼─────────┐
     │  IVMS Console     │                         │   Backoffice SPA  │
     │ Inventory / KPIs  │                         │ Admin / Sales /   │
     │ Warehouse / Shop  │                         │ Cashier / Reports │
     └─────────┬─────────┘                         └───────────────────┘
               │
     ┌─────────┼─────────┬───────────────────────────────┐
     │         │         │                               │
┌────▼────┐ ┌──▼──────┐ ┌▼────────────┐            ┌─────▼──────────┐
│  POS    │ │Storefront│ │ Prospectus │            │ Shared Frontend │
│ Register│ │ Catalog   │ │ Promotions │            │ Static Delivery │
└─────────┘ └───────────┘ └────────────┘            └────────────────┘

## Repository layout in the current uploaded version
---

### Backend-related files
- `db.js`
- `index.js`
- `auth.js`
- `product.js`
- `purchaseOrder.js`
- `shop.js`
- `user.js`
- `history.js`
- `products.js`
- `purchases.js`
- `shops.js`
- `warehouses.js`
- `csv.js`
- `password.js`
- `purchaseItems.js`
- `token.js`

### IVMS / operational console files
- `index.html`
- `index.css`
- `dashbord.css`
- `script.js`
- `addshop.js`
- `updatepage.js`
- `excelInlineEdit.js`
- `helper.js`
- `picture.js`
- `restinventory.js`
- `Key_Shortcut.js`
- `serchproduct.js`

### Storefront / online shop files
- `index.html` / `shop.js` / `style.css`
- `onlineshop.html` / `onlineshop.css` / `onlineshop.js`

### POS files
- `pos.html`
- `pos.js`

### Backoffice files
- `backoffice.html`

### Prospectus files
- `propectas.html`

---

## Backend overview

The backend is the platform backbone.

### Entry point
The server initializes Express, configures middleware, connects the database, mounts API routers, exposes a health check, and serves static frontend folders for the storefront, POS, and backoffice. 

### API resources
Based on the uploaded routing setup, the backend currently exposes:
- `/api/auth`
- `/api/products`
- `/api/history`
- `/api/warehouses`
- `/api/purchases`
- `/api/shops`
- `/api/health` 

The existing root README also lists product-oriented routes such as list, create, update, delete, stock patching, duplicate checking, CSV export, and history access. 

### Database role
MongoDB stores the central product, purchase, shop, and user data. The server also performs a default shop backfill so legacy products/purchase orders without a `shopId` can be normalized into a default shop context. 

### Authentication note
The project includes auth routes, token utilities, and auth middleware, but production hardening should be reviewed carefully before deployment because the security model needs to match the intended real-world exposure. This repository is a strong platform foundation, but security review should be part of production readiness.

---

## Frontend module details

## IVMS operational console
The IVMS console is your main internal operations area.

### Responsibilities
- Dashboard overview
- Product and stock management
- Purchase and warehouse flows
- Transfer tracking
- ESL / shelf / preview support
- Shop-aware inventory actions
- Bulk/product utilities
- Staff productivity helpers like inline editing and shortcuts. 

### Important files
- `index.html` — main shell and tab system
- `script.js` — global state, rendering, loaders, shared helpers
- `dashbord.css` — dashboard presentation
- `index.css` — shared styles
- `addshop.js` — shop awareness and switching
- `updatepage.js` — pagination logic
- `excelInlineEdit.js` — editable table cells
- `picture.js` — image, status, barcode-related enhancements
- `restinventory.js` — protected reset flow
- `Key_Shortcut.js` — keyboard productivity layer
- `helper.js` — utility/autofill/browser helpers
- `serchproduct.js` — product search helpers

### Why it is valuable
This part of the project demonstrates strong front-end problem solving for real business workflows. It is not a simple CRUD page; it includes state management, fallback logic, queue/retry behavior, operational UX, and multi-shop awareness. 

---

## Storefront
The storefront provides a clean customer-facing catalog that syncs with inventory.

### Responsibilities
- Show product cards
- Display stock status and price information
- Support search and filtering
- Provide a simple request-stock interaction
- Present shop-specific catalog data. 

### Why it is valuable
It demonstrates that the backend data model is reusable beyond staff tools. Instead of stopping at admin CRUD, the project exposes the same product system to customers in a safe, polished interface.

---

## POS
The POS interface provides a kiosk-style register experience.

### Responsibilities
- Lock and unlock POS access
- Collect keypad input
- Manage current scanned/entered product flow
- Perform product/article lookups
- Maintain temporary session state
- Reuse the same API base conventions as the rest of the platform. 

### Why it is valuable
It shows that the project is not just inventory software but also operational retail software. Building POS-oriented screen flows is a different skill than building dashboards, and this module makes the project much stronger as a portfolio piece.

---

## Backoffice SPA
The backoffice provides a more business/admin-centric control surface.

### Responsibilities
- Management dashboard
- Terminal-related views
- Sales visibility
- Cashier workflows
- Business-oriented SPA navigation and modal interactions. 

### Important note
In the uploaded version, `backoffice.html` contains inline CSS and JavaScript. For maintainability and professionalism, this should be split into dedicated `backoffice.css` and `backoffice.js` files if those are not already present in another folder version.

---

## Prospectus workspace
The prospectus page is a marketing/promo editor tied to the operational data model.

### Responsibilities
- Edit promotional boxes/layouts
- Persist company profile data in localStorage
- Load discounted products
- Support zoom and presentation adjustments
- Combine business data with marketing presentation. 

### Why it is valuable
This module adds a unique business layer to the project. It shows that the system is not only about storage and selling but also about merchandising and promotion.

---

## How to run the project

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on your environment.
3. Make sure MongoDB is running.
4. Start the backend:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```
5. Open the frontends served by the API server. The current README confirms these routes:
   - `http://localhost:4000/storefront/`
   - `http://localhost:4000/pos/pos.html`
   - `http://localhost:4000/backoffice/backoffice.html` 

Because the Express app serves the bundled frontends, you do not necessarily need separate static hosting during local development. 

---

## Example environment values

Create a `.env` file with values such as:

```env
MONGODB_URI=mongodb://localhost:27017/inventory
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret
```

Adjust names to match the exact variables used in your backend.

---

## Why this project is strong

This repository stands out because it combines several real business concerns in one system:
- inventory management
- multi-shop support
- operational dashboards
- POS workflows
- storefront catalog delivery
- admin/backoffice tools
- marketing/prospectus tooling
- centralized API + database design

That makes it much stronger than a normal “products CRUD” app. It shows system thinking, not only page building.

---

## Current improvement opportunities

The project is strong, but these improvements would make it more professional:

1. **Clean folder structure**
   Move backend files into `src/` subfolders and split frontend modules into dedicated directories.

2. **Fix naming consistency**
   Rename files like `dashbord.css`, `serchproduct.js`, and `propectas.html` to cleaner names.

3. **Split inline-heavy files**
   Separate large inline HTML/CSS/JS in `backoffice.html` and `propectas.html` into dedicated files.

4. **Align README and actual structure**
   The project description should match the exact files and routes that currently exist.

5. **Harden auth and production security**
   Before production deployment, review route protection, token handling, admin-only actions, and destructive operations.

6. **Add screenshots and architecture diagrams**
   This would improve portfolio and GitHub presentation significantly.

---

## Portfolio value

As a portfolio project, IVMS is very good because it demonstrates:
- full-stack architecture
- API design
- modular front-end organization
- real-world business logic
- operational UX thinking
- multi-surface product design

A recruiter or client can immediately see that this is closer to a real internal business platform than a tutorial project.

---

## Final summary

IVMS is a unified retail operations platform built around one central backend and multiple role-specific frontends. It combines internal operations, customer-facing sales, register workflows, administration, and promotional tooling into one shared system. The codebase already shows strong practical capability; with cleaner structure, naming consistency, and production hardening, it can become an even more professional GitHub and portfolio project.
