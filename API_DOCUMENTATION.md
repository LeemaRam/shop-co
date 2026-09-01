# Shop.co REST API Documentation

Base URL: `http://localhost:8000/api`

Authentication: **Laravel Sanctum** personal access tokens (Bearer).
Send `Authorization: Bearer <token>` for protected endpoints.
Guest carts are identified with an `X-Cart-Token: <uuid>` header.

All responses follow a consistent envelope:

```json
{ "success": true, "message": "…", "data": … }
```

Errors:

```json
{ "success": false, "message": "…", "errors": { "field": ["…"] } }
```

Paginated list endpoints add a `meta` object: `current_page`, `last_page`, `per_page`, `total`.

---

## Authentication

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/register` | – | `name, email, password, password_confirmation, phone?` |
| POST | `/auth/register/vendor` | – | `name, email, password, password_confirmation, store_name, store_description?, phone?` |
| POST | `/auth/login` | – | `email, password` |
| POST | `/auth/logout` | Bearer | – |
| GET  | `/auth/me` | Bearer | – |

Register/login return `{ data: { user, token } }`.

---

## Public Catalog

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/products` | Filters: `category, min_price, max_price, size, color, rating, vendor, style, search`. Sort: `latest, price_low, price_high, rating`. Pagination: `page, per_page`. |
| GET | `/products/featured` | Top/featured products. |
| GET | `/products/new-arrivals` | Latest products. |
| GET | `/products/sale` | Discounted products. |
| GET | `/products/{slug}` | Single product (by slug). |
| GET | `/products/{slug}/reviews` | Approved reviews (paginated). |
| GET | `/categories` | Active categories with product counts. |
| GET | `/categories/{slug}` | Single category. |
| GET | `/categories/{slug}/products` | Products in a category (paginated). |
| POST | `/coupons/validate` | Body: `code, subtotal`. Returns `{ code, discount }`. |

Only **approved + active** products appear in public endpoints.

Product resource shape (matches the React frontend):

```json
{
  "id": 1, "slug": "one-life-graphic-tshirt", "name": "…",
  "image": "/images/…webp", "gallery": ["/images/…webp"],
  "price": 260, "oldPrice": 300, "discount": 40,
  "rating": 4.5, "reviewsCount": 3,
  "colors": ["#4F4631"], "sizes": ["Small","Medium"],
  "style": "Casual", "category": "T-shirts", "tags": ["shop"],
  "description": "…"
}
```

---

## Cart (guest + authenticated)

Guests must send `X-Cart-Token`. Authenticated users use their token; the cart is tied to the user.

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/cart` | – |
| POST | `/cart/items` | `product_id, variant_id?, quantity` |
| PATCH | `/cart/items/{item}` | `quantity` |
| DELETE | `/cart/items/{item}` | – |
| DELETE | `/cart` | – |

Prices are always resolved server-side from the database; client-supplied prices are ignored. Stock and approval status are validated on add/update.

---

## Checkout & Orders

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/checkout` | Optional | `customer_name, customer_email, customer_phone?, shipping_address{line1,city,state?,postal_code,country}, billing_address?, coupon_code?` |
| GET | `/orders` | Bearer | – |
| GET | `/orders/{order}` | Bearer | – |

Checkout is transactional: validates cart, snapshots prices, applies coupon, reduces variant stock, clears the cart. Guest orders have `user_id = null`.

---

## Wishlist & Reviews (authenticated customer)

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/wishlist` | – |
| POST | `/wishlist/items` | `product_id` |
| DELETE | `/wishlist/items/{product}` | – |
| POST | `/products/{product}/reviews` | `rating(1-5), comment?` (must have purchased) |
| PUT | `/reviews/{review}` | `rating, comment?` |
| DELETE | `/reviews/{review}` | – |

---

## Vendor (`role:vendor`)

| Method | Endpoint |
|--------|----------|
| GET | `/vendor/dashboard` |
| GET | `/vendor/products` |
| POST | `/vendor/products` |
| GET | `/vendor/products/{id}` |
| PUT | `/vendor/products/{id}` |
| DELETE | `/vendor/products/{id}` |
| GET | `/vendor/orders` |
| GET | `/vendor/orders/{id}` |
| PATCH | `/vendor/orders/{id}/status` |
| GET | `/vendor/profile` |
| PUT | `/vendor/profile` |

Product create/update body: `name, price, description?, category_id?, compare_at_price?, discount?, style?, tags?, status?, images[]{image,is_primary?}, variants[]{size?,color?,price?,stock?}`.

- `vendor_id` is always the authenticated vendor; client values are ignored.
- New/updated products are set to `approval_status = pending`.
- Vendors only see and manage **their own** products and order items. Status can only be changed on single-vendor orders.

---

## Admin (`role:admin`)

| Method | Endpoint |
|--------|----------|
| GET | `/admin/dashboard` |
| GET | `/admin/users` (`role?, search?`) |
| GET | `/admin/vendors` |
| GET | `/admin/products` (`approval_status?, vendor_id?`) |
| GET | `/admin/products/pending` |
| PATCH | `/admin/products/{id}/approve` |
| PATCH | `/admin/products/{id}/reject` (`reason`) |
| GET | `/admin/orders` (`status?`) |
| GET | `/admin/orders/{order}` |
| PATCH | `/admin/orders/{order}/status` (`status`) |
| GET / POST | `/admin/categories` |
| PUT / DELETE | `/admin/categories/{id}` |
| GET | `/admin/reviews` (`product_id?`) |
| DELETE | `/admin/reviews/{review}` |
| GET / POST | `/admin/coupons` |
| PUT / DELETE | `/admin/coupons/{coupon}` |

---

## Order status values

`pending, confirmed, processing, shipped, delivered, cancelled`

## Payment status values

`pending, paid, failed, refunded`

## Seeded test accounts (password: `password`)

| Role | Email |
|------|-------|
| Admin | `admin@shop.co` |
| Customer | `customer@shop.co` |
| Vendor | `vendor@shop.co`, `vendor2@shop.co`, `vendor3@shop.co` |

Coupons: `WELCOME10` (10% off, min $100, max $50), `SAVE20` ($20 off, min $150).
