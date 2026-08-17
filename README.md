# Valiant

A full-stack e-commerce storefront for a clothing brand — product catalog, cart,
checkout with card and cash-on-delivery payments, order tracking, and an admin
dashboard.

## Stack

**Backend** — NestJS 10, MongoDB (Mongoose), JWT auth in httpOnly cookies with
per-device refresh-token rotation, Paymob card payments, Nodemailer, Zod
validation, Swagger.

**Frontend** — Next.js 16 (App Router, Turbopack), React 19, TanStack Query,
Tailwind CSS v4, shadcn/ui, React Hook Form, Zustand.

## Features

- Catalog with categories, subcategories, search, filtering, and sale pricing
- Server-authoritative cart — prices and stock are always re-read from the
  database, never trusted from the client
- Checkout with stock reservation, idempotent order creation, and coupons
- Paymob card payments with HMAC-verified webhooks, plus cash on delivery
- Accounts: email/password with OTP verification, Google OAuth, password reset,
  addresses, order history, wishlist
- Reviews, newsletter signup, and back-in-stock notifications
- Admin area: dashboard, products, stock movements, orders, categories,
  coupons, customers, reviews, settings, and an audit log

## Prerequisites

- Node.js 20+
- MongoDB running locally (or a connection string to a hosted instance)

## Setup

Install dependencies for each app separately — this is not a monorepo, and there
is no root package manifest.

```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### Backend environment

Copy the example file and fill it in:

```bash
cd Backend && cp .env.example .env
```

`MONGODB_URI` and `JWT_SECRET` are required — `JWT_SECRET` must be at least 32
characters. Generate one with:

```bash
openssl rand -base64 48
```

Email, Google OAuth, and Paymob variables are optional; card checkout stays
disabled unless all four `PAYMOB_*` values are set. The server validates its
environment on boot and refuses to start with an invalid config.

### Frontend environment

Create `Frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Seed the database

Categories must be seeded before products, since products resolve their category
by slug.

```bash
cd Backend
npm run seed:categories
npm run seed:products
```

Product image URLs are built from `FRONTEND_URL` at seed time, so set that to the
right origin before seeding.

## Running

Start the backend first — the frontend's initial requests will fail until the API
is up.

```bash
cd Backend && npm run start:dev    # http://localhost:3000
```

```bash
cd Frontend && npm run dev         # http://localhost:3001
```

Swagger docs are served at `http://localhost:3000/api` in non-production
environments only.

## Tests

```bash
cd Backend && npm test
```

## Notes

Product and category images are currently served by the frontend itself out of
`Frontend/public/images`. `next.config.ts` allows `localhost:3001` as an image
origin and sets `dangerouslyAllowLocalIP` to work around Next.js's SSRF guard in
development — both need replacing with the real image host before deploying.

`products_imgs/` at the repo root holds the original source photography and is
not used at runtime.

## Troubleshooting

**Images or pages fail to load after an abrupt shutdown.** If the dev server was
killed rather than stopped, Next.js's build cache can be left locked, producing
`EPERM: operation not permitted` rename errors on the next start. Delete
`Frontend/.next` and start again.
