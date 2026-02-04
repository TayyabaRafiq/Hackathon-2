# Quickstart: TodoFlow Backend API

**Feature**: 001-backend-api
**Date**: 2026-01-19

---

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Git

---

## 1. Project Setup

```bash
# Navigate to project root
cd todo-phase2-hack-2

# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express better-auth @prisma/client cors zod express-rate-limit dotenv

# Install dev dependencies
npm install -D typescript ts-node-dev @types/node @types/express @types/cors prisma
```

---

## 2. TypeScript Configuration

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 3. Environment Setup

Create `backend/.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars-here"
BETTER_AUTH_URL="http://localhost:8000"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Server
PORT=8000
NODE_ENV=development
```

Create `backend/.env` (copy from example and fill values):

```bash
cp .env.example .env
# Edit .env with your values
# Generate a secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Prisma Setup

```bash
# Initialize Prisma
npx prisma init --datasource-provider sqlite

# This creates:
# - prisma/schema.prisma
# - .env (if not exists)
```

Update `backend/prisma/schema.prisma` with the schema from `specs/001-backend-api/data-model.md`.

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 5. Project Structure

Create the following directory structure:

```
backend/
├── src/
│   ├── index.ts           # Entry point
│   ├── auth.ts            # Better Auth configuration
│   ├── lib/
│   │   └── prisma.ts      # Prisma client instance
│   ├── middleware/
│   │   ├── auth.ts        # Session verification
│   │   └── validation.ts  # Zod validation middleware
│   ├── routes/
│   │   └── tasks.ts       # Task CRUD routes
│   └── schemas/
│       └── task.ts        # Zod schemas
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

Create directories:

```bash
mkdir -p src/lib src/middleware src/routes src/schemas
```

---

## 6. Package.json Scripts

Update `backend/package.json`:

```json
{
  "name": "todoflow-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

---

## 7. Run Development Server

```bash
# Start development server
npm run dev

# Server runs at http://localhost:8000
```

---

## 8. Frontend Integration

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/auth
```

Restart frontend:

```bash
cd ../frontend
npm run dev
```

---

## 9. Test Endpoints

### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}' \
  -c cookies.txt
```

### Sign In
```bash
curl -X POST http://localhost:8000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Get Session
```bash
curl http://localhost:8000/api/auth/get-session \
  -b cookies.txt
```

### Create Task
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","description":"Testing the API"}' \
  -b cookies.txt
```

### List Tasks
```bash
curl http://localhost:8000/api/tasks \
  -b cookies.txt
```

---

## 10. Production Deployment

### Update for PostgreSQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set production environment variables:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
BETTER_AUTH_SECRET="production-secret-key"
CORS_ORIGIN="https://your-frontend.vercel.app"
NODE_ENV="production"
```

3. Deploy migrations:
```bash
npx prisma migrate deploy
```

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Include protocol (http:// or https://)

### Session Not Working
- Check `credentials: "include"` in frontend fetch calls
- Verify `BETTER_AUTH_SECRET` is set and consistent

### Database Errors
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations

### Port Already in Use
- Change `PORT` in `.env` or kill existing process
