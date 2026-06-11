# Backend README

This is the NestJS API for the Mini Operations Wallet Portal. It handles users, wallets, credits, debits, transaction history, and reporting for the frontend dashboard.

## What It Does

- Creates and lists platform users
- Creates wallets for users
- Credits and debits wallet balances
- Stores every wallet movement as a transaction
- Blocks duplicate `referenceId` values so the same payment is not processed twice
- Prevents debit operations that would make a wallet balance negative
- Exposes daily summary and dashboard stats APIs
- Provides Swagger docs at `/docs`

## Tech Used

- NestJS
- Prisma
- PostgreSQL
- Swagger / OpenAPI
- Jest and Supertest for tests

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wallet_db?schema=public
PORT=3000
```

Run database migrations:

```bash
npm run migrate
```

Start the API in development mode:

```bash
npm run start:dev
```

The API runs at `http://localhost:3000`, and Swagger is available at `http://localhost:3000/docs`.

## Main Endpoints

- `POST /users` - create a user
- `GET /users` - list users
- `POST /wallets` - create a wallet
- `GET /wallets` - list wallets
- `GET /wallets/:id` - get one wallet
- `POST /wallets/:id/credit` - add money to a wallet
- `POST /wallets/:id/debit` - remove money from a wallet
- `GET /wallets/:id/transactions` - view wallet ledger
- `GET /reports/daily-summary` - daily totals
- `GET /reports/dashboard-stats` - dashboard metrics

## Useful Commands

```bash
npm run build
npm run start:prod
npm run test
npm run test:e2e
npm run lint
```

## Notes

Money is stored in minor units, so `1000` means `10.00`. This avoids floating point issues when adding or subtracting balances.
