# MarketFlow

Supermarket management system: your original HTML interface, now served by a Node.js + Express backend.

## Run it (VS Code terminal)
    npm install
    copy .env.example .env    # then edit .env
    npm run db:deploy
    npm run dev               # auto-restarts while you work
Open http://localhost:3000 and sign in with a seeded account:

| Username | Password (default) | Role |
|---|---|---|
| admin | admin123 | Admin: everything, plus staff accounts |
| manager | manager123 | Manager: products, stock, customers, suppliers, sales |
| cashier | cashier123 | Cashier: sell at the till, view products, add customers |

Set the `SEED_*_PASSWORD` values before the first run. Seed accounts are only created when missing; changing a seed password later does not change an existing account.

## Database
Prisma stores users, products, customers, suppliers, sales, and sale items in SQLite. The schema is in `prisma/schema.prisma`; committed migrations are applied with `npm run db:deploy`. Locally, `DATABASE_URL="file:./dev.db"` stores the database at `prisma/dev.db` (ignored by Git).

For Render, attach a persistent disk mounted at `/var/data`, set `DATABASE_URL` to `file:/var/data/marketflow.db`, and use `npm run db:deploy && npm start` as the start command. Also set `NODE_ENV=production` and a strong `JWT_SECRET`. SQLite files are not durable on Vercel, so this configuration is intended for a server with persistent storage, not Vercel.

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
    prisma/       SQLite schema, migrations, and seed script
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
Use `nginx.conf.example` as the Nginx proxy, set `NODE_ENV=production` and a strong `JWT_SECRET`. Keep PM2 at 1 instance when using SQLite.
