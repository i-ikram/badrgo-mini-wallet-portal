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

