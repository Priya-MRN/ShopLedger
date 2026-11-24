# Repository Guidelines

## Stack

- Server: Node.js CommonJS modules with Express 4 and `body-parser`.
- Browser: plain HTML, CSS, and JavaScript served from `public/`.
- Persistence: `data/db.json`, read and written by `lib/store.js`.

## Module Map

- `routes/products.js` — product catalog and coupon listing endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/customers.js` — customer and Khata settlement endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and export endpoints.
- `lib/coupons.js` — coupon normalization, validation, and discount calculation.
- `lib/dates.js` — today's date, date-key normalization, and fiscal year helper.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, reservations, and summary.
- `lib/invoice.js` — invoice calculations and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges, reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — subtotal, discount, tax, and order total calculations.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — JSON database loading, persistence, and audit log updates.
- `lib/tax.js` — HSN tax rates and CGST/SGST split.

## Commands

- `npm start` — starts the Express app with `node server.js` (port 3000 unless `PORT` is set).
- `node --test` — runs Node's built-in test runner. No test files are present yet; `npm test` is a placeholder that exits with an error.

## Rules

1. Write characterization tests before changing behavior.
2. Change only the module or modules named in the ticket.
3. Tests must use in-memory data; never read or write `data/db.json`.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current Ticket

Order history sorting and date filtering are broken, and Khata settlements corrupt customer balances. Allowed files: `lib/orders.js` (`list` only), `lib/dates.js`, `lib/ledger.js`, and `routes/customers.js`. Change nothing else.
