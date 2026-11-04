# MarketFlow

Supermarket management system: your original HTML interface, now served by a Node.js + Express backend.

## Run it (VS Code terminal)
    npm install
    cp .env.example .env      # then edit .env
    npm run dev               # auto-restarts while you work
Open http://localhost:3000 and sign in with a seeded account:

| Username | Password (default) | Role |
|---|---|---|
| admin | admin123 | Admin: everything, plus staff accounts |
| manager | manager123 | Manager: products, stock, customers, suppliers, sales |
| cashier | cashier123 | Cashier: sell at the till, view products, add customers |

Change these in `.env` (`SEED_*_PASSWORD`) before real use.

## Structure
    public/        your frontend (index.html, css/app.css, js/app.js, assets/ logos)
    src/
      server.js    starts the server
      app.js       builds Express (security headers, JSON, static files, API)
      config/      settings from .env + the role list
      routes/      URL -> who may use it -> controller
      controllers/ read the request, send the response
      services/    business rules (login, stock checks on sale...)
      repositories/ ALL data storage. Currently in memory; swap for the real DB here
      middleware/  sign-in check, role check, error handling
    tests/         npm test

## What works now
- Real login (hashed passwords, httpOnly cookie) replaces the old browser-side check.
- API (all under /api, sign-in required): /auth, /users (admin), /products, /customers, /suppliers, /sales.
- Selling checks stock and lowers it.

## Not yet done (next steps)
1. Pick the database and replace `src/repositories/memoryRepository.js`. Data resets on restart until then.
2. Connect each screen's demo data (products, customers, suppliers, sales) to the API, one screen at a time.
3. Reports endpoints calculated from real sales; CSV download.
4. Login rate limiting; self-host the Inter font.

## Deploy later (Linux VPS)
    pm2 start ecosystem.config.js
Use `nginx.conf.example` as the Nginx proxy, set `NODE_ENV=production` and a strong `JWT_SECRET`. Keep PM2 at 1 instance while data is in memory.
