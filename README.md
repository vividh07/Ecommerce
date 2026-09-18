# Nexus Market — Multi-Vendor Ecommerce (Phase 1)

Portfolio-grade multi-vendor storefront with JWT auth, Stripe checkout (test mode), seller and admin dashboards, and a futuristic React UI.

## Stack

- **Backend:** Node.js, Express, Mongoose, Stripe, JWT (access + refresh)
- **Frontend:** React, Vite, Tailwind CSS v4, Framer Motion, Stripe Elements
- **Database:** MongoDB (Atlas recommended for production)

## Quick start

### 1. MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) or local MongoDB. For local development without Mongo installed, the backend supports in-memory MongoDB:

```bash
USE_IN_MEMORY_MONGO=true
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Set JWT secrets (32+ chars), STRIPE_SECRET_KEY, CLIENT_URL, MONGODB_URI
npm install
npm run seed   # demo users + catalog
npm run dev    # http://127.0.0.1:4871
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_STRIPE_PUBLISHABLE_KEY (pk_test_...)
npm install
npm run dev    # http://127.0.0.1:5174 (proxies /api → backend)
```

### Demo accounts (after seed)

| Role     | Email              | Password      |
|----------|--------------------|---------------|
| Admin    | admin@demo.shop    | Password123!  |
| Seller   | seller@demo.shop   | Password123!  |
| Customer | customer@demo.shop | Password123!  |

## Stripe

1. Create a [Stripe test](https://dashboard.stripe.com/test/apikeys) secret + publishable key.
2. Set `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`.
3. For webhooks locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:4871/api/webhooks/stripe
```

Set `STRIPE_WEBHOOK_SECRET` from the CLI output. Payment success webhooks finalize orders and deduct stock inside a MongoDB transaction.

## API overview

- `POST /api/auth/register|login|refresh`
- `GET /api/catalog/products` — search, filters, pagination
- `GET /api/cart`, checkout via `POST /api/checkout/payment-intent`
- Seller: `GET/POST /api/products`, variants, `GET /api/orders/seller/mine`
- Admin: `GET /api/admin/sellers/pending`, approve/reject

## Phase scope

Phase 1 includes core catalog, cart, Stripe checkout, orders, reviews, and basic multi-vendor. Wishlist, coupons, advanced tracking, and unique features (Shopping Room, multi-cart, etc.) are planned for later phases.

## Deployment

- **API:** Render (set env vars, expose port `4871` or `PORT`)
- **Web:** Vercel (`frontend`, set `VITE_API_URL` to your API origin)
- **DB:** MongoDB Atlas free tier
