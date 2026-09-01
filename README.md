# SHOP.CO

A full-stack, multi-vendor e-commerce platform built with **React** and **Laravel**. Customer storefront, vendor portal, and admin portal all run as **one React SPA** served by **one Laravel application** on a single origin, backed by a REST API and role-based authentication.

## Overview

SHOP.CO provides:

- **Customer** shopping experience — browse, filter, cart, coupons, checkout, reviews
- **Vendor** portal — product management with an approval workflow and order fulfilment
- **Admin** portal — user/vendor/product/order management and product approval
- **REST API** with token-based, role-based authentication
- Server-authoritative pricing, stock, and order totals

## Architecture

```
SHOP.CO
│
├── React SPA  (one app, role-based routes)
│   ├── Customer   /            (storefront, shop, product, cart)
│   ├── Vendor     /vendor/*     (dashboard, products, orders, profile)
│   └── Admin      /admin/*      (dashboard, users, vendors, products, orders …)
│
├── Laravel REST API   /api/*
│
└── Database (SQLite in dev, MySQL-compatible migrations)
```

Customer, Vendor, and Admin are part of **one** React SPA. Laravel serves the built SPA and handles every `/api/*` request from the **same origin**, so the frontend calls the API with a relative `/api` base — no CORS or second server required.

## Tech Stack

- React 18 · JavaScript · React Router 6
- Vite 5 · Tailwind CSS 3
- Laravel 13 · PHP 8.3+
- Laravel Sanctum (Bearer tokens)
- SQLite (dev) / MySQL-compatible migrations
- REST API · Git / GitHub

## Features

### Customer
- Product browsing, categories, search & filtering (dynamic price range, color, size)
- Product details with variants and reviews
- Cart with guest-token support
- Coupon validation and checkout/order workflow

### Vendor
- Vendor authentication and dashboard
- Product CRUD with variants
- Product approval workflow (submissions start as `pending`)
- Order management and status updates
- Store profile
- Vendor data isolation (a vendor only ever sees its own data)

### Admin
- Admin authentication and dashboard
- User and vendor management
- Product management with approval / rejection (with reason)
- Order management and order detail
- Category CRUD, review moderation, coupon CRUD

## Authentication & Security

- **Laravel Sanctum** personal access tokens (`Authorization: Bearer <token>`)
- Role-based authorization (customer / vendor / admin) enforced by middleware and policies
- Vendor ownership isolation on every vendor resource
- Server-side control of privileged fields — `vendor_id`, `approval_status`, `price`, `discount`, `stock`
- Server-authoritative cart pricing and checkout totals (client-supplied prices are ignored)

## API

Base URL: `/api` · consistent envelope `{ "success", "message", "data" }`.

```
/api/auth        /api/cart        /api/orders      /api/vendor/*
/api/products    /api/checkout    /api/reviews     /api/admin/*
/api/categories  /api/wishlist    /api/coupons
```

Full endpoint reference: [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Database

Main entities: **Users, Vendors, Categories, Products, Product Images, Product Variants, Carts, Cart Items, Orders, Order Items, Reviews, Coupons, Wishlists.**

## Testing

```bash
php artisan test     # 39 passed (101 assertions)
npm run build        # Vite production build succeeds
```

Verified: backend test suite passes (39 tests / 101 assertions) and the frontend production build completes successfully.

## Local Setup

Single Laravel application serving the React SPA:

```bash
git clone <repository-url>
cd shop-co

composer install
npm install

cp .env.example .env
php artisan key:generate

# SQLite (default): create the dev database file, then migrate + seed
touch database/database.sqlite      # Windows: New-Item database/database.sqlite
php artisan migrate --seed

# Development (two watchers)
npm run dev          # Vite dev server (hot reload)
php artisan serve    # http://localhost:8000

# Production-style (single origin)
npm run build
php artisan serve    # serves the built SPA + API at http://localhost:8000
```

### Demo credentials (development only)

Seeded by `php artisan migrate:fresh --seed`. **For local/demo use only — not production accounts.**

| Role     | Email             | Password   |
| -------- | ----------------- | ---------- |
| Admin    | admin@shop.co     | `password` |
| Vendor   | vendor@shop.co    | `password` |
| Customer | customer@shop.co  | `password` |

Admins sign in at `/admin/login`; customers and vendors sign in at `/login`.

## Demo

- Live Demo: Coming soon
- GitHub: `<repository-url>`

## Project Structure

```
app/          Laravel: controllers, models, resources, services, middleware
routes/       web.php (serves SPA) · api.php (REST API)
database/     migrations · seeders · factories
resources/js/ React SPA (pages, components, layouts, context, services)
resources/css/ Tailwind entry
public/       compiled assets (public/build) + images
tests/        Feature & Unit tests
```

## License

Portfolio project. Not intended for commercial redistribution.
