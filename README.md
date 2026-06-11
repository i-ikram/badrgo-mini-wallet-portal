# Mini Operations Wallet Portal

This system serves as a financial control area similar to those used internally in ride-hailing or delivery platforms to monitor users, manage active wallets, and oversee ledger events.

---

## Tech Stack

- **Backend**: NestJS (v11) - modular, type-safe backend framework
- **Database**: PostgreSQL (v15) - relational database engine
- **ORM**: Prisma (v6) - type-safe database access layer
- **Frontend**: Next.js (v16) - React framework (App Router)
- **Styling**: Tailwind CSS (v4) - modern utility-first CSS layout
- **Validation**: `class-validator` & `class-transformer`
- **API Documentation**: OpenAPI / Swagger (`@nestjs/swagger`)
- **Testing**: Jest & Supertest (E2E integration suite)
- **Local Setup**: Docker Compose

---

## Architecture Overview

The codebase is organized as a monorepo consisting of:
- **`/backend`**: Encapsulates the REST API using a clean NestJS module structure. It implements a Layered Architecture separating routers (`Controllers`), business logic (`Services`), data structures (`DTOs`), and data access (`Prisma`).
- **`/frontend`**: Built with Next.js App Router. It utilizes client-side state management to load ledger feeds and financial aggregate statistics, routing through an Axios client instance with type-safe representations. No business rules are hardcoded in the frontend.

```mermaid
graph TD
    A[Next.js Client] -->|HTTP REST| B[NestJS Controllers]
    B -->|DTO Validation| C[NestJS Services]
    C -->|SELECT FOR UPDATE Lock| D[PostgreSQL DB via Prisma]
```

### Folder Structure
```
/
├── backend/                  # NestJS backend application
│   ├── src/
│   │   ├── main.ts           # App bootstrap with Swagger and Cors
│   │   ├── app.module.ts     # Main module importing config & feature areas
│   │   ├── prisma/           # Database module & service
│   │   ├── users/            # Users resource (Module, Controller, Service, DTO)
│   │   ├── wallets/          # Wallets resource (Module, Controller, Service, DTO)
│   │   ├── reports/          # Daily Summary & Dashboard aggregator module
│   ├── test/                 # E2E integration test suites
│   ├── Dockerfile
│   └── prisma/schema.prisma  # Prisma Database Schema definitions
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js App Router views (Layouts, Pages)
│   │   ├── components/       # Reusable components (Loading, Empty, Error, Sidebar)
│   │   ├── lib/              # API Client (Axios configuration and endpoints)
│   ├── Dockerfile
├── docker-compose.yml        # Orchestrates Postgres, Backend, and Frontend
└── package.json              # Workspace root prefix-scripts manager
```

---

## Environment Variables

A `.env` or `.env.example` file at the root contains:
```env
# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wallet_db
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wallet_db?schema=public

# Backend API config
PORT=3000
BACKEND_URL=http://localhost:3000

# Frontend config
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT_FRONTEND=3001
```

---

## Local Setup & Commands

You can control both applications directly from the workspace root using the following prefix-delegated scripts:

### 1. Database Setup
Start the PostgreSQL container:
```bash
docker-compose up -d postgres
```

### 2. Database Migrations
Apply the Prisma schema to the database:
```bash
npm run backend:migrate
```

### 3. Running the Backend
Launch the NestJS development server:
```bash
npm run backend:dev
```
- API Endpoint: `http://localhost:3000`
- Swagger Documentation UI: `http://localhost:3000/docs`

### 4. Running the Frontend
Launch the Next.js development server:
```bash
npm run frontend:dev
```
- Portal UI: `http://localhost:3001`

### 5. Running E2E Integration Tests
Ensure the postgres container is running, then execute:
```bash
npm run backend:test:e2e
```

---

## 🐳 Docker setup (Production Deployment)

To build and run all services in unified containers:
```bash
docker-compose up --build
```
This launches:
- `wallet_postgres` on port `5432`
- `wallet_backend` on port `3000` (auto-runs migrations before starting)
- `wallet_frontend` on port `3001`

---

## Critical Business Rules & Explanations

### 1. Money Handling
- **Rule**: Float operations in JavaScript are prone to binary rounding errors (e.g. `0.1 + 0.2 === 0.30000000000000004`).
- **Implementation**: We handle all money amounts as **integers in minor units** (e.g. cents). 
  - `1000` represents `10.00 USD`.
  - `250` represents `2.50 USD`.
  - All conversions happen strictly during rendering or initial decimal parsing, and the database stores absolute integer values.

### 2. Concurrency Safety (`SELECT ... FOR UPDATE`)
- **Rule**: Two simultaneous debit requests must not corrupt the balance or allow overdrafts (double spending).
- **Implementation**: Inside NestJS, we execute all credits and debits inside a Prisma database transaction block (`this.prisma.$transaction`). Before inspecting or modifying balances, we acquire an exclusive PostgreSQL row lock:
  ```sql
  SELECT * FROM "Wallet" WHERE "id" = $1 LIMIT 1 FOR UPDATE;
  ```
  Prisma processes this raw block sequentially. If request B comes in while request A is running, B is blocked at the database layer until A commits or rolls back. This guarantees absolute consistency.

### 3. Idempotency Checks
- **Rule**: The same transaction request (with the same `referenceId`) must not be processed twice.
- **Implementation**: We place a `UNIQUE` constraint index on `Transaction.referenceId` at the database level. In our transaction block, we check for duplicate references after obtaining the wallet lock. If a duplicate is submitted, we immediately throw a `409 ConflictException` and roll back.

### 4. Negative Balance Prevention
- **Rule**: Wallet balances must never become negative.
- **Implementation**: The service checks the locked wallet row's balance before updating. If `balanceBefore < amount`, a `400 BadRequestException` ("Insufficient funds") is thrown.

---

## API Endpoints Summary

- **POST `/users`** : Register a platform user. Throws `409` if email is duplicated.
- **GET `/users`** : List all registered users.
- **POST `/wallets`** : Create a wallet for a user. Defaults balance to `0` and status to `ACTIVE`.
- **GET `/wallets`** : List all wallets.
- **GET `/wallets/:id`** : Get balance and owner details.
- **POST `/wallets/:id/credit`** : Deposit funds (requires `amount` and unique `referenceId`).
- **POST `/wallets/:id/debit`** : Withdraw funds (requires `amount` and unique `referenceId`).
- **GET `/wallets/:id/transactions`** : Fetch paginated ledger transactions feed.
- **GET `/reports/daily-summary`** : Retrieve financial metrics for a specific date (optional `date` filter in `YYYY-MM-DD` format).

---

## Frontend Portal Views

1. **Dashboard**: Shows metrics (Total Wallets, System Balance, Total Credits/Debits, Events) and a list of all wallets, including a quick-form to open a wallet for any user.
2. **Users**: Control page to register new accounts and list existing ones.
3. **Wallet Details**: Shows available balance in card format, transactional ledger list, and side forms to Credit/Debit balances with an auto-reference generator.
4. **Daily Report**: Financial ledger summaries by date.

---

## Manual Frontend Test Checklist

- **Create User**: Open `http://localhost:3001/users`, type name, phone, and unique email. Submit, verify the new user card appears in the grid.
- **Create Duplicate User**: Attempt to register with the same email. Verify a clean error alert appears.
- **Create Wallet**: Go to Dashboard (`/`), select the newly created user in the dropdown, choose currency, and click "Create". Verify the wallet appears in the ledger list.
- **Credit Wallet**: Click "Details" next to the new wallet. Click "Generate Ref" to fill a unique reference code, type `50.00` in the amount input, and click "Credit Wallet". Verify the balance increases to `$50.00` and a credit event is logged below.
- **Duplicate Credit (Idempotency)**: Without changing the reference ID, click "Credit Wallet" again. Verify a `409 Conflict` error alert appears and the balance remains at `$50.00`.
- **Debit Wallet**: Type `20.00` in the amount input, click "Generate Ref", and click "Debit Wallet". Verify balance drops to `$30.00` and a debit transaction is logged.
- **Overdraft Prevention**: Click "Generate Ref", type `40.00` (which is > `$30.00`), and click "Debit Wallet". Verify an "Insufficient funds" error is displayed and the balance remains at `$30.00`.
- **Daily Report**: Go to Reports `/reports`. Select today's date. Verify that the sum of credits ($50.00), debits ($20.00), cash flow ($30.00), transaction count (2), and active wallets (1) are accurately displayed.

---

## Known Limitations

1. **Single Currency Aggregations**: The daily report sums amounts directly. If the system supports multiple currencies (e.g. USD, EUR), sums will mix values. Currently, the daily report assumes a single-currency environment (defaulting all wallets to USD) for aggregate correctness. In a multi-currency production environment, groupings by currency are required.
2. **No User Authentication**: For assessment simplicity, there is no Auth token mechanism. Users are selected and managed openly.

---

## AI Usage Disclosure

AI tools were used as an assistant for planning, architecture review, README wording, and checking edge cases around wallet idempotency and concurrent debit handling. The implementation decisions, database schema, service logic, validation rules, and final testing were manually reviewed and adapted for this assessment. I understand the code and can explain or modify it live.
