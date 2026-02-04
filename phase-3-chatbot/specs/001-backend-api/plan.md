# Implementation Plan: TodoFlow Backend API

**Branch**: `001-backend-api` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-api/spec.md`

---

## Summary

Build a production-ready backend API for TodoFlow that provides:
1. **Authentication** via Better Auth (sign-up, sign-in, sign-out, session management)
2. **Task Management** CRUD operations (create, read, update, delete)
3. **Frontend Integration** with existing Next.js application using cookie-based sessions

**Technical Approach**: Node.js + Express + Better Auth + Prisma ORM with SQLite (dev) / PostgreSQL (prod)

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+
**Primary Dependencies**: Express 4.x, Better Auth, Prisma, Zod, cors, express-rate-limit
**Storage**: SQLite (development) / PostgreSQL via Neon (production)
**Testing**: Vitest for unit tests, Supertest for API tests
**Target Platform**: Node.js server (Railway/Render deployment)
**Project Type**: Web application (backend component)
**Performance Goals**: <500ms API response time, 50 concurrent users
**Constraints**: Must integrate with existing frontend's Better Auth client
**Scale/Scope**: MVP for hackathon, single-tenant

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Implementation follows approved spec |
| II. Layered Architecture | ✅ PASS | Backend layer clearly separated from frontend |
| III. Extension, Not Rewrite | ✅ PASS | Extends Phase I todo concepts to web |
| IV. API-First Design | ✅ PASS | OpenAPI contract defined in `/contracts/` |
| V. Test-First Development | ✅ PASS | Test strategy defined below |
| VI. Simplicity/YAGNI | ✅ PASS | Minimal viable implementation |

**Technology Deviation**: Using Express instead of FastAPI
- **Reason**: Frontend uses `better-auth/react` which requires JavaScript backend
- **Justification**: No Python equivalent for Better Auth; rewriting auth would be significant effort
- **Mitigation**: All other constitution principles fully followed

---

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-api/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Prisma schema and entity details
├── quickstart.md        # Developer setup guide
├── contracts/
│   └── openapi.yaml     # API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── index.ts              # Entry point, Express app setup
│   ├── auth.ts               # Better Auth configuration
│   ├── lib/
│   │   └── prisma.ts         # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts           # Session verification middleware
│   │   ├── validation.ts     # Zod validation middleware
│   │   └── error.ts          # Error handling middleware
│   ├── routes/
│   │   └── tasks.ts          # Task CRUD routes
│   └── schemas/
│       └── task.ts           # Zod validation schemas
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── tests/
│   ├── unit/                 # Unit tests
│   └── integration/          # API integration tests
├── .env.example              # Environment template
├── .env                      # Local environment (gitignored)
├── package.json
├── tsconfig.json
└── vitest.config.ts

frontend/                     # Already exists - no changes needed
└── ...
```

**Structure Decision**: Web application with separate backend directory. Frontend already exists at `frontend/`.

---

## Implementation Phases

### Phase 1: Project Setup & Database

**Goal**: Backend project initialized with Prisma and database ready

**Tasks**:
1. Create `backend/` directory with package.json
2. Install dependencies (express, better-auth, prisma, zod, cors, etc.)
3. Configure TypeScript (tsconfig.json)
4. Set up Prisma with schema from data-model.md
5. Create initial migration
6. Set up environment variables (.env.example, .env)

**Verification**: `npm run dev` starts without errors, Prisma Studio shows tables

---

### Phase 2: Better Auth Integration

**Goal**: Authentication endpoints working (/api/auth/*)

**Tasks**:
1. Create `src/auth.ts` with Better Auth configuration
2. Configure Prisma adapter for Better Auth
3. Mount Better Auth handler on Express app
4. Configure CORS for frontend origin
5. Test sign-up, sign-in, sign-out, get-session

**Verification**: Frontend can sign up, sign in, and maintain session

---

### Phase 3: Session Middleware

**Goal**: Protected routes require authentication

**Tasks**:
1. Create `src/middleware/auth.ts` with session verification
2. Extract user from session for route handlers
3. Return 401 for unauthenticated requests

**Verification**: Unauthenticated requests to /api/tasks return 401

---

### Phase 4: Task CRUD Implementation

**Goal**: All task endpoints working per spec

**Tasks**:
1. Create Zod schemas for task validation
2. Implement GET /api/tasks (list user's tasks)
3. Implement POST /api/tasks (create task)
4. Implement PATCH /api/tasks/:id (update task)
5. Implement DELETE /api/tasks/:id (delete task)
6. Ensure task isolation (users only see their own tasks)

**Verification**: All CRUD operations work via curl/Postman

---

### Phase 5: Error Handling & Security

**Goal**: Production-ready error handling and security

**Tasks**:
1. Create global error handler middleware
2. Implement rate limiting on auth endpoints
3. Add input sanitization
4. Ensure proper HTTP status codes
5. Format errors per spec (code, message, errors)

**Verification**: Invalid requests return proper error format

---

### Phase 6: Frontend Integration Testing

**Goal**: Frontend works with real backend

**Tasks**:
1. Update frontend .env.local (DEMO_MODE=false)
2. Test sign-up flow from frontend
3. Test sign-in flow from frontend
4. Test all task operations from frontend
5. Test sign-out flow

**Verification**: Complete user journey works in browser

---

## File-by-File Implementation Guide

### 1. `backend/src/index.ts`

**Purpose**: Express app entry point

**Key Responsibilities**:
- Load environment variables (dotenv)
- Configure Express middleware (json, cors)
- Mount Better Auth handler at /api/auth/*
- Mount task routes at /api/tasks
- Global error handler
- Start server on PORT

**Dependencies**: express, cors, dotenv, ./auth, ./routes/tasks

---

### 2. `backend/src/auth.ts`

**Purpose**: Better Auth configuration

**Key Responsibilities**:
- Initialize Better Auth with Prisma adapter
- Configure email/password authentication
- Set minimum password length (8)
- Export auth instance and handler

**Example**:
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { toNodeHandler } from "better-auth/node";
import { prisma } from "./lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3000"],
});

export const authHandler = toNodeHandler(auth);
```

---

### 3. `backend/src/lib/prisma.ts`

**Purpose**: Prisma client singleton

**Key Responsibilities**:
- Create single Prisma client instance
- Handle connection in development (hot reload)

**Example**:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

### 4. `backend/src/middleware/auth.ts`

**Purpose**: Session verification middleware

**Key Responsibilities**:
- Extract session from request headers/cookies
- Validate session with Better Auth
- Attach user to request object
- Return 401 if not authenticated

**Example**:
```typescript
import { auth } from "../auth";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: req.headers as Headers,
  });

  if (!session) {
    return res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  req.user = session.user;
  req.session = session.session;
  next();
}
```

---

### 5. `backend/src/routes/tasks.ts`

**Purpose**: Task CRUD route handlers

**Key Responsibilities**:
- GET / - List all tasks for authenticated user
- POST / - Create new task with validation
- PATCH /:id - Update task (partial)
- DELETE /:id - Delete task

**Key Logic**:
- All operations filtered by userId from session
- Validate input with Zod schemas
- Return proper HTTP status codes
- Task isolation enforced (404 for other users' tasks)

---

### 6. `backend/src/schemas/task.ts`

**Purpose**: Zod validation schemas

**Schemas**:
```typescript
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  completed: z.boolean().optional(),
});

export const taskIdSchema = z.object({
  id: z.string().cuid(),
});
```

---

## Testing Strategy

### Unit Tests

**Location**: `backend/tests/unit/`

**Coverage**:
- Validation schemas (valid/invalid inputs)
- Error formatting utilities

### Integration Tests

**Location**: `backend/tests/integration/`

**Coverage**:
- Auth endpoints (sign-up, sign-in, sign-out)
- Task CRUD with authentication
- Error responses
- Task isolation between users

**Example Test**:
```typescript
describe("POST /api/tasks", () => {
  it("creates task for authenticated user", async () => {
    // Sign in first
    const signIn = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email: "test@example.com", password: "password123" });

    const cookies = signIn.headers["set-cookie"];

    const response = await request(app)
      .post("/api/tasks")
      .set("Cookie", cookies)
      .send({ title: "Test task" });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test task");
    expect(response.body.completed).toBe(false);
  });

  it("returns 401 without authentication", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "Test task" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });
});
```

---

## Complexity Tracking

> **No constitution violations requiring justification**

The Express/Better Auth choice is documented in research.md and justified by frontend compatibility requirements.

---

## Dependencies & Versions

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18 | Web framework |
| better-auth | ^1.x | Authentication |
| @prisma/client | ^5.x | Database ORM |
| prisma | ^5.x | Prisma CLI |
| zod | ^3.x | Input validation |
| cors | ^2.8 | CORS middleware |
| express-rate-limit | ^7.x | Rate limiting |
| dotenv | ^16.x | Environment variables |
| typescript | ^5.x | Type safety |
| ts-node-dev | ^2.x | Development server |
| vitest | ^1.x | Testing framework |
| supertest | ^6.x | API testing |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | SQLite or PostgreSQL connection |
| BETTER_AUTH_SECRET | Yes | - | 32+ char secret for sessions |
| BETTER_AUTH_URL | Yes | - | Backend base URL |
| CORS_ORIGIN | Yes | - | Frontend origin URL |
| PORT | No | 8000 | Server port |
| NODE_ENV | No | development | Environment mode |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Better Auth integration issues | Medium | High | Follow official docs, test early |
| CORS configuration errors | Medium | Medium | Test with actual frontend early |
| Session cookie issues | Low | High | Use httpOnly, secure in prod |
| Database migration failures | Low | Medium | Test migrations in dev first |

---

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Implement Phase 1 (Project Setup)
3. Test each phase before proceeding
4. Run frontend integration tests at Phase 6

---

## Related Documents

- [Specification](./spec.md) - Feature requirements
- [Research](./research.md) - Technology decisions
- [Data Model](./data-model.md) - Database schema
- [OpenAPI Contract](./contracts/openapi.yaml) - API specification
- [Quickstart](./quickstart.md) - Developer setup guide
