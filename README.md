# IVMS — Integrated Inventory, POS, Storefront & Backoffice Platform

<p align="center">
  <b>A full-stack retail operations platform for inventory, POS, S-Go POS, storefront management, backoffice workflows, promotions, auto-generated prospectus automation, and multi-shop management.</b>
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

## Why this project stands out

This repository is strong because it demonstrates **system-level thinking**, not just page-level coding.

It combines:

- inventory management
- multi-shop operations
- admin workflows
- customer-facing retail UI
- POS-style interactions
- purchase and warehouse processes
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
```
### Core architecture

This project follows a shared-data architecture:

The backend stores and serves products, shops, purchases, warehouse activity, and history.

The IVMS console consumes those APIs for inventory and operations.

The storefront reads the same product and shop data for customer-facing browsing.

The POS can use the same API host and active shop context for article lookup and transaction-related flows.

The backoffice acts as a business operations SPA and also talks to the same backend.

The prospectus workspace can pull promotional and inventory data to build marketing content.

That makes IVMS a unified retail platform rather than a collection of unrelated pages.

### Platform modules
1. Central backend and database

The backend is the shared source of truth for the whole platform. It handles API routing, database access, shop-aware data, product management, purchases, history, warehouses, and authentication. The main server mounts the API and serves the static frontends for the storefront, POS, and backoffice from the same application.

2. IVMS frontend console

The IVMS console is the main operational cockpit for staff. It includes dashboard KPIs, inventory management, transfers, purchases, ESL-related tools, shop-aware product operations, image handling, inline editing, and keyboard shortcuts. The main shell is defined in index.html, while the behavior is split across focused helper files such as script.js, addshop.js, updatepage.js, excelInlineEdit.js, picture.js, and Key_Shortcut.js.

3. POS interface

The POS module provides a browser-based point-of-sale experience with login and lockscreen flow, article lookup, keypad interaction, session persistence, and register-oriented screen logic.

4. Storefront / online shop

The storefront is the customer-facing catalog interface. It is designed as a lightweight static frontend that reads live product and shop data from the shared API, displays inventory in a polished layout, and supports search, sort, category filters, availability filters, and quick stock request actions. The storefront shell is defined in index.html and powered by shop.js.

5. Backoffice SPA

The backoffice is a single-page staff and admin interface focused on dashboards, terminals, cashiers, inventory, reporting, payments, and other business-side workflows. The current backoffice.html contains the SPA layout and a large amount of inline styling and behavior.

6. Prospectus / promotions workspace

The prospectus workspace is used to design promotional layouts and marketing pages. The uploaded propectas.html includes editing tools, company profile storage, modal interactions, discount and product loading, zoom support, and client-side persistence. In the current state, much of this logic is embedded directly in the HTML file rather than split into separate CSS and JS assets.

## Technology Landscape

<div align="center">

| Platform Layer | Technologies |
|---|---|
| **Backend Services** | Node.js, Express, MongoDB, Mongoose, ES Modules |
| **Frontend Applications** | HTML, CSS, Vanilla JavaScript |
| **Client-Side Persistence** | LocalStorage, IndexedDB |
| **UI & Interaction** | Font Awesome, browser-native UI modules, QR / barcode / chart helpers |
| **Runtime & Developer Tooling** | dotenv, CORS, Morgan |

</div>

### Engineering Approach
- **Unified platform architecture** with a shared backend serving multiple operational interfaces
- **API-first integration model** connecting internal tools, POS, storefront, and promotional workflows
- **Multi-shop aware request handling** through shop-scoped data access and context-based operations
- **Browser-native frontend delivery** with lightweight modules and no mandatory bundler dependency
- **Express-served static applications** for simplified deployment and centralized platform delivery

---

## Core Business Capabilities

### Inventory Operations
- Centralized product catalog management
- Stock editing, updates, and inventory control
- Shop-aware inventory workflows across multiple outlets
- Search, filtering, and pagination for large product datasets
- Inline editing for faster operational updates
- Product image handling and CSV-based support utilities
- Controlled inventory reset workflow with confirmation safeguards
- Transfer queue and retry handling within the IVMS console

### Operational Intelligence & Control
- KPI dashboards and executive overview panels
- Multi-tab operational cockpit for day-to-day workflows
- Purchase and warehouse activity visibility
- Status indicators, alerts, and notification support
- Keyboard shortcuts and workflow acceleration utilities

### Multi-Shop Administration
- Shop-scoped request handling
- Shop metadata loading and persistence
- Outlet-aware data targeting across platform modules
- POS fallback logic for shop selection and active context handling

### Storefront Commerce Experience
- Customer-facing product catalog presentation
- Search, sorting, category filtering, and availability filtering
- Shop-specific storefront rendering
- Request-stock workflow for customer and sales-side interaction

### Point of Sale
- Login and lockscreen workflow
- Soft keypad and register-style numeric input
- Product and article lookup flows
- Session persistence through LocalStorage
- Shared API base awareness aligned with the wider platform

### Backoffice Administration
- Dashboard widgets and business overview screens
- Sales visibility and staff-facing management views
- POS terminal administration
- Cashier management workflows
- Business and administrative process screens

### Prospectus & Promotional Workspace
- Editable promotion canvas for marketing content
- Company profile persistence
- Discount and promotional product loading
- Zoom and presentation controls
- Modal-based editing and prospectus composition workflows

### Project structure

```text
ivms-platform/
├── package.json
├── package-lock.json
├── README.md
├── .env
├── .env.example
│
├── src/                                 # Backend / API layer
│   ├── index.js                         # Express app entry point
│   ├── db.js                            # Database connection
│   │
│   ├── middleware/                      # Cross-cutting backend middleware
│   │   └── auth.js                      # Authentication / request protection
│   │
│   ├── models/                          # Database models / schemas
│   │   ├── product.js                   # Product data model
│   │   ├── purchaseOrder.js             # Purchase order model
│   │   ├── shop.js                      # Shop / outlet model
│   │   └── user.js                      # User / access model
│   │
│   ├── routes/                          # API route modules
│   │   ├── auth.js                      # Authentication routes
│   │   ├── products.js                  # Product and inventory routes
│   │   ├── purchases.js                 # Purchase workflow routes
│   │   ├── shops.js                     # Shop management routes
│   │   ├── warehouses.js                # Warehouse-related routes
│   │   └── history.js                   # Stock / audit history routes
│   │
│   └── utils/                           # Shared backend utilities
│       ├── csv.js                       # CSV import / export helpers
│       ├── password.js                  # Password hashing / validation
│       └── token.js                     # Token / auth helpers
│
├── frontend/                            # Frontend applications
│   ├── ivms/                            # Main inventory & operations console
│   │   ├── index.html                   # Main application shell
│   │   ├── index.css                    # Global UI styling
│   │   ├── dashbord.css                 # Dashboard-specific styling
│   │   ├── script.js                    # Core app state / rendering logic
│   │   ├── addshop.js                   # Shop switching / shop-aware logic
│   │   ├── updatepage.js                # Pagination helpers
│   │   ├── excelInlineEdit.js           # Inline editing workflow
│   │   ├── helper.js                    # Shared UI / browser helpers
│   │   ├── picture.js                   # Product image handling
│   │   ├── restinventory.js             # Inventory reset workflow
│   │   ├── Key_Shortcut.js              # Keyboard shortcut support
│   │   ├── serchproduct.js              # Search and filtering logic
│   │   └── public/                      # IVMS static assets
│   │
│   ├── storefront/                      # Customer-facing online shop
│   │   ├── index.html                   # Storefront page shell
│   │   ├── style.css                    # Storefront styling
│   │   ├── shop.js                      # Catalog rendering / filters
│   │   └── public/                      # Storefront static assets
│   │
│   ├── onlineshop/                      # Additional online shop frontend
│   │   ├── onlineshop.html              # Online shop page
│   │   ├── onlineshop.css               # Online shop styling
│   │   ├── onlineshop.js                # Online shop logic
│   │   └── public/                      # Online shop static assets
│   │
│   ├── pos/                             # Point-of-sale interface
│   │   ├── pos.html                     # POS screen layout
│   │   ├── pos.css                      # POS styling
│   │   ├── pos.js                       # POS interactions / session logic
│   │   └── public/                      # POS images / slideshow assets
│   │
│   ├── backoffice/                      # Admin / business operations SPA
│   │   ├── backoffice.html              # Backoffice SPA shell
│   │   ├── backoffice.css               # Backoffice styling
│   │   ├── backoffice.js                # Backoffice application logic
│   │   └── public/                      # Backoffice static assets
│   │
│   └── prospectus/                      # Promotions / prospectus workspace
│       ├── prospectus.html              # Prospectus editor workspace
│       ├── prospectus.css               # Prospectus styling
│       ├── prospectus.js                # Prospectus interactions / logic
│       └── public/                      # Prospectus static assets
│
├── uploads/                             # Uploaded runtime assets / product images
│
└── docs/                                # Project documentation
    └── screenshots/                     # UI previews and repository visuals
```
db.js

index.js

auth.js

product.js

purchaseOrder.js

shop.js

user.js

history.js

products.js

purchases.js

shops.js

warehouses.js

csv.js

password.js

purchaseItems.js

token.js

IVMS / operational console files

index.html

index.css

dashbord.css

script.js

addshop.js

updatepage.js

excelInlineEdit.js

helper.js

picture.js

restinventory.js

Key_Shortcut.js

serchproduct.js

Storefront / online shop files

index.html / shop.js / style.css

onlineshop.html / onlineshop.css / onlineshop.js

POS files

pos.html

pos.js

Backoffice files

backoffice.html

Prospectus files

propectas.html

Backend overview

The backend is the platform backbone.

Entry point

The server initializes Express, configures middleware, connects the database, mounts API routers, exposes a health check, and serves static frontend folders for the storefront, POS, and backoffice.

API resources

The backend currently exposes:

/api/auth

/api/products

/api/history

/api/warehouses

/api/purchases

/api/shops

/api/health

It also supports product-oriented operations such as list, create, update, delete, stock patching, duplicate checking, CSV export, and history access.

Database role

MongoDB stores the central product, purchase, shop, and user data. The server also performs a default shop backfill so legacy products and purchase orders without a shopId can be normalized into a default shop context.

Authentication note

The project includes auth routes, token utilities, and auth middleware, but production hardening should be reviewed carefully before deployment because the security model needs to match the intended real-world exposure.

Frontend module details
IVMS operational console

The IVMS console is the main internal operations area.

Responsibilities

Dashboard overview

Product and stock management

Purchase and warehouse flows

Transfer tracking

ESL / shelf / preview support

Shop-aware inventory actions

Bulk and product utilities

Staff productivity helpers like inline editing and shortcuts

Important files

index.html — main shell and tab system

script.js — global state, rendering, loaders, shared helpers

dashbord.css — dashboard presentation

index.css — shared styles

addshop.js — shop awareness and switching

updatepage.js — pagination logic

excelInlineEdit.js — editable table cells

picture.js — image, status, barcode-related enhancements

restinventory.js — protected reset flow

Key_Shortcut.js — keyboard productivity layer

helper.js — utility, autofill, and browser helpers

serchproduct.js — product search helpers

Why it is valuable

This part of the project demonstrates strong frontend problem solving for real business workflows. It is not a simple CRUD page; it includes state management, fallback logic, queue and retry behavior, operational UX, and multi-shop awareness.

Storefront

The storefront provides a clean customer-facing catalog that syncs with inventory.

Responsibilities

Show product cards

Display stock status and price information

Support search and filtering

Provide a simple request-stock interaction

Present shop-specific catalog data

Why it is valuable

It demonstrates that the backend data model is reusable beyond staff tools. Instead of stopping at admin CRUD, the project exposes the same product system to customers in a safe, polished interface.

POS

The POS interface provides a kiosk-style register experience.

Responsibilities

Lock and unlock POS access

Collect keypad input

Manage current scanned and entered product flow

Perform product and article lookups

Maintain temporary session state

Reuse the same API base conventions as the rest of the platform

Why it is valuable

It shows that the project is not just inventory software but also operational retail software. Building POS-oriented screen flows is a different skill than building dashboards, and this module makes the project much stronger as a portfolio piece.

Backoffice SPA

The backoffice provides a more business and admin-centric control surface.

Responsibilities

Management dashboard

Terminal-related views

Sales visibility

Cashier workflows

Business-oriented SPA navigation and modal interactions

Important note

In the current uploaded version, backoffice.html contains inline CSS and JavaScript. For maintainability and professionalism, this should be split into dedicated backoffice.css and backoffice.js files if those are not already present in another folder version.

Prospectus workspace

The prospectus page is a marketing and promo editor tied to the operational data model.

Responsibilities

Edit promotional boxes and layouts

Persist company profile data in localStorage

Load discounted products

Support zoom and presentation adjustments

Combine business data with marketing presentation

Why it is valuable

This module adds a unique business layer to the project. It shows that the system is not only about storage and selling but also about merchandising and promotion.

Screenshots
```text
## Screenshots

### IVMS Dashboard
![IVMS Dashboard](docs/screenshots/ivms-dashboard.png)

### Inventory Management
![Inventory](docs/screenshots/inventory.png)

### POS Interface
![POS](docs/screenshots/pos.png)

### Storefront
![Storefront](docs/screenshots/storefront.png)

### Backoffice
![Backoffice](docs/screenshots/backoffice.png)

### Prospectus Workspace
![Prospectus](docs/screenshots/prospectus.png)
```
How to run the project
Local development

Install dependencies:

npm install

Create a .env file based on your environment.

Make sure MongoDB is running.

Start the backend:

npm run dev

or

npm start

Open the frontends served by the API server:

http://localhost:4000/storefront/

http://localhost:4000/pos/pos.html

http://localhost:4000/backoffice/backoffice.html

Because the Express app serves the bundled frontends, you do not necessarily need separate static hosting during local development.

Future improvements

Move backend files into a cleaner src/ structure

Split large inline files into separate HTML, CSS, and JS assets

Rename inconsistent files such as:

dashbord.css → dashboard.css

serchproduct.js → searchProduct.js

propectas.html → prospectus.html

Improve production auth and security hardening

Add screenshots and architecture diagrams

Add tests for API and frontend modules

Containerize with Docker

Add CI/CD pipeline

Summary

IVMS is a unified retail operations platform built around one central backend and multiple role-specific frontends. It combines internal operations, customer-facing sales, register workflows, administration, and promotional tooling into one shared system.

The codebase already shows strong practical capability. With cleaner structure, naming consistency, screenshots, and production hardening, it can become an even more professional GitHub and portfolio project.


