# SHOP — Project backlog & finish plan

Status: **planning only** (no implementation until explicitly started).  
Goal: finish the site ASAP with working data, then bugs one-by-one, then polish (responsive/security/SEO).

---

## Priority order (agreed)

1. Seed / set up **full realistic data** in MongoDB and make the whole site **functionally working**
2. Fix navigation / session bugs (login redirect, scroll restore)
3. Replace **static / dead UI** with backend-backed behaviour
4. Theme toggle (settings)
5. Security + SEO pass
6. Responsiveness polish (**later**)
7. Broken routes list (**user will provide later**)

---

## 1. Post-login opens profile/settings instead of home — DONE

**Bug:** After customer (or any role) opens profile → sign out → login again, the app lands on **settings/profile** (or last protected page) instead of **home**.

**Fixed:** Sign out navigates to `/login` first (no `from` state). Login uses role home (`/` / `/seller` / `/admin`) unless a fresh deep-link `from` is present.

---

## 2. Scroll position not resetting on route change — DONE

**Bug:** After navigation (login, logout, or any route change), the page does **not** scroll to top; it restores the previous scroll position.

**Fixed:** Global `ScrollToTop` scrolls the window to top on `pathname` + `search` change.

---

## 3. Dead / non-dynamic buttons — data first, then full site test

**Approach:** Do **not** chase every dead button in isolation first.

1. Expand **seed data** (catalog, variants, stock, coupons, sample orders across statuses, returns, contact/newsletter samples, approved seller, admin)
2. Walk the full flows: browse → bag → checkout → orders → wishlist → rooms → admin → seller
3. Build a **working checklist** of broken CTAs found during that pass
4. Then fix them one by one

**Known non-working / toast-only (examples):**
- Continue with Google (auth)
- Forgot password
- Many admin/seller row `⋯` menus, Export, Import, Preview, Download invoice
- Some “Demo data” badges / illustrative panels
- UPI/wallet payment options (Stripe card path only)
- Account settings save / addresses / returns form (partial stubs)

---

## 4. Static vs dynamic inventory (env + hardcoded)

### Already env-driven (keep / complete)

| Variable | Where | Purpose |
|----------|--------|---------|
| `MONGODB_URI` | backend `.env` | Database |
| `USE_IN_MEMORY_MONGO` | backend `.env` (optional) | Ephemeral DB for demos |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | backend | Auth tokens |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | backend | Token lifetime |
| `CLIENT_URL` | backend | CORS + Socket origin |
| `PORT` / `NODE_ENV` | backend | Server |
| `STRIPE_SECRET_KEY` | backend | Payments |
| `STRIPE_WEBHOOK_SECRET` | backend | Webhook verify |
| `VITE_API_URL` | frontend `.env` | API base |
| `VITE_STRIPE_PUBLISHABLE_KEY` | frontend `.env` | Stripe.js |
| `VITE_SOCKET_URL` | frontend (optional / defaulted) | Socket.IO |

**Action:** Replace placeholder Stripe keys with real **test** keys; set webhook secret via Stripe CLI for local paid flow.

### Still static / should become dynamic or configurable

| Area | Current state | Should be |
|------|----------------|-----------|
| Currency display (`INR` / `formatINR`) | Hardcoded in frontend | Env or store settings (`currency`) |
| Stripe charge currency (`inr`) | Hardcoded in checkout service | Align with store settings / env |
| Support email `support@example.com` | Hardcoded in contact/help UI | Store settings / env |
| Store URL `demo.shop.com` | Hardcoded admin/seller chrome | Store settings / seller profile |
| Country / timezone (`India`, `Asia/Kolkata`) | Mostly hardcoded | Store settings |
| Promo banner copy | Hardcoded | CMS/settings (optional) |
| FAQ / shipping policy copy | Static in pages | OK short-term; later CMS or DB |
| Privacy / Terms | Stub pages | Real legal content |
| Google OAuth | Toast only | Env client IDs + backend (or remove UI) |
| Password reset | Toast only | Email provider env + flow |
| Image uploads | URL paste only | Upload service (S3/Cloudinary) + env |
| Newsletter / contact | API exists; no email send | Optional SMTP/Resend env |
| Payout bank details | Partial / demo math | Real payout provider later |
| “Demo data” badges | UI chrome | Remove when data is real |
| Shipping fees | Compare/UI only; not charged | Checkout shipping rules |
| Order “invoice / support” buttons | Often inert | Generate PDF / open contact |

---

## 5. Light / dark theme toggle — DONE

**Requirement:** Theme control available (prefer **Settings**; optional top control later).

**Fixed:** CSS variables for light + dark; preference in `localStorage` (`shop.theme`: light / dark / system); control on Account Settings → Appearance. Storefront respects preference; `/admin` forced dark; `/seller` forced light.

---

## 6. No UI that needs a backend without a backend

**Rule:** Every interactive surface that implies persistence or business logic must have an API (or the control must be removed/hidden).

**Pages / flows that must stay backend-backed:**
- Auth, catalog, cart, wishlist, checkout, orders, reviews
- Contact, newsletter, order track
- Admin: overview, products, orders, inventory, customers, discounts, returns, reports, settings, seller approve
- Seller: overview, products, orders, returns, payouts, settings, onboarding/apply

**UI that is OK as static content only (no write API required):**
- About narrative, Help FAQ text, Shipping policy copy (read-only)
- Privacy / Terms (content pages)

**Gaps to close:** any button that currently only `toast`s or does nothing but implies a write/action.

---

## 7. Responsiveness

**Deferred.** Many layouts need mobile polish; do **after** functional + data pass.

---

## 8. Broken routes

**Deferred.** User will list specific broken routes later. Track them in a section below when provided.

### Broken routes (to fill later)

- _(none listed yet)_

---

## 9. Security & SEO (before launch)

### Security
- Rotate any secrets ever pasted in chat (MongoDB password, JWT if exposed)
- Never commit `.env`
- Strong JWT secrets in production (≥32 chars, unique)
- Stripe webhook signature required in production
- Rate limits already present — review auth + contact/newsletter limits
- Coupon ownership checks, catalog approved-seller filter, stock race (known backend gaps)
- Helmet / CORS / sanitize already on API — verify production `CLIENT_URL`
- HTTPS only in production; secure cookies if moving auth to cookies

### SEO
- Per-route `<title>` + meta description (react-helmet-async or similar)
- Open Graph tags for home + product pages
- Semantic headings, alt text on product images
- Public sitemap for home, about, browse, product URLs
- `robots.txt`
- SSR/SSG not required for v1; ensure crawler-friendly public pages and clean URLs
- JSON-LD Product schema on PDP (nice-to-have)

---

## Suggested work batches (when you say go)

| Batch | Focus |
|-------|--------|
| A | Rich seed data + Stripe test keys + full manual walkthrough notes |
| B | Login redirect + ScrollToTop |
| C | Kill/fix dead CTAs found in walkthrough; wire or remove |
| D | Theme toggle in settings |
| E | Security + SEO checklist |
| F | Responsive pass |
| G | User-reported broken routes |

---

## Notes

- Admin and Seller centers are **separate** apps under `/admin` and `/seller`.
- Account **UI redesign** still waiting on user mockups.
- `Data/` UI references stay out of git (gitignored).
