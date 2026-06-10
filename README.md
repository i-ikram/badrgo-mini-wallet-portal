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
   Inside `/backend`:
   ```bash
   npx prisma migrate dev --name init
   ```

## Running Tests

To run the integration and E2E tests:

1. **Verify database is running**:
   Ensure PostgreSQL container is started.

2. **Execute backend E2E tests**:
   Inside `/backend`:
   ```bash
   npm run test:e2e
   ```


