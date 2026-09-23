# LUMEN

Multi-vendor ecommerce storefront — shop, seller center, and admin — built as a portfolio project.

Customers browse a curated catalog, check out with **Razorpay** (test mode), track orders, and request returns. Sellers manage products and fulfilment. Admins approve stores and run the catalog.

**Live stack:** React 19 + Vite + Tailwind · Express + MongoDB · JWT · Socket.IO · Razorpay · Google sign-in

---

## Features

**Storefront**
- Catalog browse, search, product detail, wishlist
- Multi-cart, compare, coupons
- Razorpay checkout (cards / UPI / wallets in test mode)
- Orders, delivery confirm, returns
- Addresses, account settings, light / dark theme
- Shopping rooms (live) and post-purchase dashboard
- Google sign-in and email + OTP password reset

**Seller** (`/seller`)
- Onboarding, products, orders, returns, payouts, settings

**Admin** (`/admin`)
- Overview, catalog, inventory, customers, discounts, returns, reports, store settings

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Socket.IO client |
| Backend | Node.js, Express, Mongoose, Zod, Helmet, rate limits |
| Auth | JWT (access + refresh), Google OAuth, bcrypt |
| Payments | Razorpay Checkout + optional webhooks |
| Realtime | Socket.IO (order updates, shopping rooms) |
| Email | Resend (optional; sandbox only delivers to your Resend account) |
| Database | MongoDB Atlas (or in-memory Mongo for demos) |

---

## Project layout

```
backend/     Express API (port 4871)
frontend/    Vite + React app (port 5174)
```

---

## Local setup

**Requirements:** Node.js 20+, npm, and a MongoDB URI (Atlas or local).

### 1. Clone and install

```bash
git clone https://github.com/vividh07/Ecommerce.git
cd Ecommerce

npm install --prefix backend
npm install --prefix frontend
```

### 2. Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in JWT secrets (32+ characters), `MONGODB_URI`, Razorpay **test** keys, and (optionally) Google + Resend.

Keep `USE_IN_MEMORY_MONGO` unset or `false` if you want data to persist. Set it `true` only for a throwaway demo DB (wiped on restart).

### 3. Seed and run

```bash
npm run seed --prefix backend
npm run dev --prefix backend    # http://127.0.0.1:4871
npm run dev --prefix frontend   # http://127.0.0.1:5174
```

The Vite app proxies `/api` and `/uploads` to the API.

Seed loads `Data/products.json` when that folder exists locally (`Data/` is gitignored). Otherwise it falls back to a built-in demo catalog.

---

## Demo accounts

Password for all seeded password accounts: `Password123!`

| Role | Email |
| --- | --- |
| Admin | `admin@demo.shop` |
| Customer | `customer@demo.shop` |
| Seller | `studio-supply@demo.shop` |

Coupon: `SAVE10` (10% off).

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas or local Mongo connection string |
| `USE_IN_MEMORY_MONGO` | `true` = ephemeral in-memory DB |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing (32+ chars, unique) |
| `CLIENT_URL` | Frontend origin (CORS + Socket.IO) |
| `PORT` | API port (default `4871`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay test keys |
| `RAZORPAY_WEBHOOK_SECRET` | Optional webhook verify |
| `RESEND_API_KEY` / `RESEND_FROM` | Optional password-reset email |

### Frontend (`frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base (`/api` locally via proxy, or `https://your-api/api` in prod) |
| `VITE_SOCKET_URL` | Socket.IO origin |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_test_...`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## Payments

1. Create [Razorpay test keys](https://dashboard.razorpay.com/app/keys).
2. Set them on the API and `VITE_RAZORPAY_KEY_ID` on the web app.
3. Checkout: `POST /api/checkout/create-order` → Razorpay Checkout → `POST /api/checkout/verify`.
4. Optional webhook: `POST /api/webhooks/razorpay` (`payment.captured` / `payment.failed`).

---

## Deploy (portfolio)

Typical split:

- **API** — Render (or similar). Start: `npm start` in `backend`. Set `PORT` from the host. `CLIENT_URL` must be the **exact** frontend origin.
- **Web** — Vercel, root `frontend`. Set `VITE_API_URL` to `https://<your-api>/api` and `VITE_SOCKET_URL` to `https://<your-api>`.
- **DB** — MongoDB Atlas. Allow the host IPs (or `0.0.0.0/0` for a public demo).

Also add the production URL to Google OAuth **Authorized JavaScript origins**.

**Notes**
- Seller image uploads write to the API disk (`/uploads`). On free hosts that disk resets on deploy/restart. Seeded images under `frontend/public` are fine.
- Password-reset email via Resend’s sandbox only delivers to the Resend account email.

---

## Scripts

| Command | Where | What |
| --- | --- | --- |
| `npm run dev` | `backend` | API with nodemon |
| `npm start` | `backend` | API (production) |
| `npm run seed` | `backend` | Demo users + catalog |
| `npm run dev` | `frontend` | Vite dev server |
| `npm run build` | `frontend` | Typecheck + production build |

From the repo root you can also use `npm run seed`, `npm run dev:api`, and `npm run dev:web`.

---

## Author

[Vividh Choudhary](https://github.com/vividh07) · [LinkedIn](https://www.linkedin.com/in/vividh-choudhary/)
