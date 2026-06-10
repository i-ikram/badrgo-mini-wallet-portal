# Mini Operations Wallet Portal

This is a production-quality full-stack technical assessment project for Badrgo.


## Project Structure
- `/backend`: NestJS backend application.
- `/frontend`: Next.js frontend application.

## Database Migration & Setup

To run migrations and set up the PostgreSQL database locally:

1. **Start the database container**:
   ```bash
   docker-compose up -d postgres
   ```

2. **Run Prisma Migrations**:
   You can run migrations from the root folder:
   ```bash
   npm run backend:migrate
   ```
   Or inside `/backend`:
   ```bash
   npx prisma migrate dev --name init
   ```

## Running the Backend

You can start the backend from the root folder:
```bash
npm run backend:dev
```
Or inside `/backend`:
```bash
npm run start:dev
```

## Running Tests

To run the integration and E2E tests:

1. **Verify database is running**:
   Ensure PostgreSQL container is started.

2. **Execute backend E2E tests**:
   From the root folder:
   ```bash
   npm run backend:test:e2e
   ```
   Or inside `/backend`:
   ```bash
   npm run test:e2e
   ```



