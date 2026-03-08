# IVMS — Integrated Inventory, POS, Storefront & Backoffice Platform

<p align="center">
  <b>A full-stack retail operations platform for inventory, POS, S-Go POS, storefront management for online shop, backoffice, promotions, auto-generated prospectus automation, and multi-shop management.</b>
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
The POS module provides a browser-based point-of-sale experience with login/lockscreen flow, article lookup, keypad interaction, session persistence, and register-oriented screen logic.

### 4. Storefront / online shop
The storefront is the customer-facing catalog interface. It is designed as a lightweight static frontend that reads live product and shop data from the shared API, displays inventory in a polished layout, and supports search, sort, category filters, availability filters, and quick stock request actions. The storefront shell is defined in `index.html` and powered by `shop.js`.

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
