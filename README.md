# MarketFlow

Supermarket management system: your original HTML interface, now served by a Node.js + Express backend.

## Run it (VS Code terminal)
    npm install
    copy .env.example .env    # then edit .env
    npm run db:deploy
    npm run db:seed
    npm run dev               # auto-restarts while you work
Open http://localhost:3000 and sign in with a seeded account:

| Username | Password (default) | Role |
|---|---|---|
| admin | admin123 | Admin: everything, plus staff accounts |
| manager | manager123 | Manager: products, stock, customers, suppliers, sales |
| cashier | cashier123 | Cashier: sell at the till, view products, add customers |

Set the `SEED_*_PASSWORD` values before seeding. Seed accounts are only created when missing; changing a seed password later does not change an existing account.

## Database
Prisma stores users, products, customers, suppliers, sales, and sale items in PostgreSQL. The schema is in `prisma/schema.prisma`; committed migrations are applied with `npm run db:deploy`. `DATABASE_URL` should be the provider's pooled connection URL for app requests; `DIRECT_URL` should be its direct (non-pooled) URL for migrations.

### Deploy to Vercel
1. Create a hosted PostgreSQL database (for example, through Vercel's Neon integration).
2. In Vercel project settings, add `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SEED_ADMIN_PASSWORD`, `SEED_MANAGER_PASSWORD`, and `SEED_CASHIER_PASSWORD` for Production and Preview. Use the pooled URL for `DATABASE_URL` and direct URL for `DIRECT_URL`; use a separate database for Preview if available.
3. Leave Vercel's Build Command override disabled so it uses `vercel.json`. That file applies the Prisma migrations and creates any missing seed accounts during each build. Set the seed passwords before the first deploy; they are not changed on later deploys.
4. Deploy the `main` branch. Vercel serves `public/` assets and runs the exported Express app for API requests.

The committed migrations target PostgreSQL. Switching back to SQLite later will require changing the Prisma datasource and creating SQLite migrations; SQLite files are not durable on Vercel. A new PostgreSQL database starts empty; data in any existing SQLite file is not copied automatically.

The API uses the database, but the current browser screens still include demo data and are not yet wired to load/save all records through the API.

## Structure
    public/        your frontend (index.html, css/app.css, js/app.js, assets/ logos)
    src/
      server.js    starts the server
      app.js       builds Express (security headers, JSON, static files, API)
      config/      settings from .env + the role list
      routes/      URL -> who may use it -> controller
      controllers/ read the request, send the response
      services/    business rules (login, stock checks on sale...)
      repositories/ Prisma-backed data access
    prisma/       PostgreSQL schema, migrations, and seed script
      middleware/  sign-in check, role check, error handling
    tests/         npm test

## What works now
- Real login (hashed passwords, httpOnly cookie) replaces the old browser-side check.
- API (all under /api, sign-in required): /auth, /users (admin), /products, /customers, /suppliers, /sales.
- Selling checks stock and lowers it.

## Not yet done (next steps)
1. Connect each screen's demo data (products, customers, suppliers, sales) to the API, one screen at a time.
2. Reports endpoints calculated from real sales; CSV download.
3. Login rate limiting; self-host the Inter font.

## Deploy later (Linux VPS)
    pm2 start ecosystem.config.js
Use `nginx.conf.example` as the Nginx proxy, set `NODE_ENV=production`, a strong `JWT_SECRET`, and both PostgreSQL connection URLs.
