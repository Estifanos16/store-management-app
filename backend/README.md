# Store Management Backend

Production-oriented backend for the QR-based Store Management App.

## Stack

- Node.js + TypeScript
- Fastify
- PostgreSQL + Prisma
- Zod validation
- JWT authentication
- Argon2 password hashing
- Vitest

## Setup

1. Install dependencies:
   npm install
2. Copy environment variables:
   cp .env.example .env
3. Update the PostgreSQL connection string.
4. Run database migrations:
   npm run prisma:migrate
5. Start in development mode:
   npm run dev

## Security notes

- JWT secrets must be stored in environment variables.
- Shop-scoped access is enforced at the API layer.
- Item sale creation uses transactions and row locks to prevent double selling.

## Core API

The REST API is documented in API.md.
