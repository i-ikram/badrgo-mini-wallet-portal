# Frontend README

This is the Next.js frontend for the Mini Operations Wallet Portal. It gives operators a simple dashboard to manage users, wallets, transactions, and daily wallet reports.

## What It Includes

- Dashboard with wallet totals and system stats
- User creation and user listing
- Wallet creation for existing users
- Wallet detail page with balance, credit, debit, and ledger history
- Reports page for daily credit/debit summaries
- Shared loading, empty, error, sidebar, header, and stat card components

## Tech Used

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide icons

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in `frontend/` if the API is not running on the default URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:3001` when started through Docker Compose. If you run `npm run dev` directly, Next.js may use `http://localhost:3000` unless another port is provided.

## Main Screens

- `/` - dashboard and wallet list
- `/users` - create and view users
- `/wallets/[id]` - wallet balance, ledger, credit, and debit forms
- `/reports` - daily report summary

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

The frontend does not own business rules. It sends requests to the backend API, then displays the returned wallet balances, transactions, and validation errors.
