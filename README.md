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

This repository demonstrates **system-level thinking**, not just page-level coding.

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
┌────▼────┐ ┌──▼───────┐ ┌▼────────────┐            ┌────▼────────────┐
│  POS    │ │Storefront│ │ Prospectus │            │ Shared Frontend │
│ Register│ │ Catalog   │ │ Promotions │            │ Static Delivery │
└─────────┘ └───────────┘ └────────────┘            └─────────────────┘

```
---
```text
Core architecture

This project follows a shared-data architecture:

The backend stores and serves products, shops, purchases, warehouse activity, and history.

The IVMS console consumes those APIs for inventory and operations.

The storefront reads the same product and shop data for customer-facing browsing.

The POS can use the same API host and active shop context for article lookup and transaction-related flows.

The backoffice acts as a business operations SPA and also talks to the same backend.

The prospectus workspace can pull promotional and inventory data to build marketing content.

That makes IVMS a unified retail platform rather than a collection of unrelated pages.

Platform modules
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

Tech stack
Backend

Node.js

Express

MongoDB / Mongoose

ES Modules

CORS

Morgan

dotenv

Frontend

HTML

CSS

Vanilla JavaScript

Font Awesome

LocalStorage

IndexedDB where needed

Some third-party browser helpers such as QR, barcode, and chart-related scripts referenced by the frontend shell

Design approach

Static frontends that can be served directly by Express

API-first communication between frontend and backend

Multi-shop awareness via shop IDs and shop-scoped requests

Lightweight browser-native modules without bundler dependency in the current uploaded version

Main features
Inventory and product management

Product listing and editing

Shop-aware inventory handling

Search and pagination

Inline stock editing

Product pictures and image workflows

CSV-related support utilities

Inventory reset flow with confirmation safeguards

Transfer queue and retry support in the IVMS console

Dashboard and operations

KPI cards and overview panels

Multi-tab operational cockpit

Purchase and warehouse-related visibility

Activity indicators and notifications

Keyboard shortcuts and utility helpers

Multi-shop support

Shop-aware requests

Shop metadata loading and persistence

Storefront shop targeting

POS shop selection fallback logic

Storefront capabilities

Product grid

Search and sort

Category and availability filters

Customer-facing request-stock workflow

Shop-specific storefront view

POS capabilities

Login and lockscreen flow

Soft keypad and numeric input

Product and article lookup

Session persistence in localStorage

Shop-aware API base detection and product fetch attempts

Backoffice capabilities

Dashboard widgets

Sales views

POS terminal management

Cashier management

Business and admin workflow screens

Prospectus capabilities

Editable promotion canvas

Company profile persistence

Discount and product loading

Zoom controls

Modal-based content editing
