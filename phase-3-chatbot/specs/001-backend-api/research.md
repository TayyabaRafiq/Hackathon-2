# Research: TodoFlow Backend API

**Feature**: 001-backend-api
**Date**: 2026-01-19
**Status**: Complete

---

## Research Topics

### 1. Backend Technology Choice: Express vs FastAPI

**Context**: Constitution specifies FastAPI + SQLModel, but frontend uses `better-auth/react` client.

**Decision**: Use **Node.js + Express + Better Auth** instead of FastAPI

**Rationale**:
1. **Frontend Compatibility**: The existing frontend (`frontend/lib/auth.ts`) already imports and uses `better-auth/react` client. Better Auth is a JavaScript/TypeScript library that doesn't have a Python equivalent.
2. **Seamless Integration**: Better Auth for Express provides identical APIs that the frontend expects (`/api/auth/sign-up/email`, `/api/auth/sign-in/email`, etc.)
3. **Session Management**: Better Auth handles session cookies, token generation, and password hashing automatically - matching what the frontend expects.
4. **Hackathon Timeline**: Using the same technology as the frontend reduces context switching and debugging time.

**Alternatives Considered**:
- **FastAPI + Custom Auth**: Would require reimplementing all Better Auth endpoints manually (sign-up, sign-in, session management). Significant effort and risk of incompatibility.
- **FastAPI + Third-party Auth**: No equivalent Python library that provides identical API contract as Better Auth.

**Constitution Impact**: This is a justified deviation from constitution's FastAPI requirement due to frontend compatibility constraints. The deviation is documented here and will be noted in the ADR.

---

### 2. Database: SQLite vs PostgreSQL with Prisma

**Decision**: Use **Prisma ORM** with **SQLite (dev)** / **PostgreSQL (prod via Neon)**

**Rationale**:
1. **Better Auth Compatibility**: Better Auth has official Prisma adapter (`@better-auth/prisma-adapter`)
2. **Type Safety**: Prisma provides TypeScript types matching our frontend types
3. **Migration Strategy**: Prisma supports both SQLite and PostgreSQL with same schema
4. **Neon Integration**: Prisma works seamlessly with Neon PostgreSQL for production

**Database Schema Requirements** (from Better Auth docs):
- `User` table: id, email, name, image, emailVerified, createdAt, updatedAt
- `Session` table: id, userId, token, expiresAt, createdAt, updatedAt
- `Account` table: (for OAuth - not needed for email/password only)
- `Task` table: Custom table for our todo items

**Alternatives Considered**:
- **Drizzle ORM**: Good alternative but Prisma has better Better Auth integration
- **Direct SQL**: More setup, loses type safety benefits

---

### 3. Better Auth Express Integration

**Decision**: Use `better-auth` package with `toNodeHandler` for Express integration

**Research Findings**:
```typescript
// Better Auth setup pattern for Express
import { betterAuth } from "better-auth";
import { toNodeHandler } from "better-auth/node";

const auth = betterAuth({
  database: prisma, // Prisma adapter
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
});

// Mount as Express middleware
app.all("/api/auth/*", toNodeHandler(auth));
```

**Key Points**:
- Better Auth handles all `/api/auth/*` routes automatically
- Session stored in httpOnly cookies (secure by default)
- Password hashing uses bcrypt (built-in)
- CORS must be configured for frontend origin

---

### 4. Session Validation for Protected Routes

**Decision**: Create middleware using Better Auth's `auth.api.getSession`

**Pattern**:
```typescript
async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Authentication required"
    });
  }

  req.user = session.user;
  req.session = session.session;
  next();
}
```

---

### 5. CORS Configuration for Frontend

**Decision**: Configure CORS to allow frontend origin with credentials

**Configuration**:
```typescript
import cors from "cors";

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true, // Required for cookies
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

---

### 6. Input Validation Strategy

**Decision**: Use **Zod** for schema validation

**Rationale**:
1. TypeScript-first validation library
2. Works well with Express
3. Provides detailed error messages
4. Can share schemas between frontend and backend

**Task Validation Schema**:
```typescript
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  completed: z.boolean().optional(),
});
```

---

### 7. Rate Limiting Strategy

**Decision**: Use `express-rate-limit` for basic protection

**Configuration**:
```typescript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    code: "RATE_LIMITED",
    message: "Too many requests, please try again later",
  },
});

app.use("/api/auth", authLimiter);
```

---

### 8. Environment Variables

**Required Variables**:

| Variable | Purpose | Dev Value | Prod Value |
|----------|---------|-----------|------------|
| `DATABASE_URL` | Database connection | `file:./dev.db` | Neon PostgreSQL URL |
| `BETTER_AUTH_SECRET` | Session signing key | Random 32+ chars | Secure random string |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` | Production URL |
| `PORT` | Server port | `8000` | Platform-assigned |
| `NODE_ENV` | Environment mode | `development` | `production` |

---

## Summary of Decisions

| Topic | Decision | Key Rationale |
|-------|----------|---------------|
| Backend Framework | Express + TypeScript | Better Auth compatibility |
| Authentication | Better Auth | Frontend already uses it |
| ORM | Prisma | Better Auth adapter, type safety |
| Database (Dev) | SQLite | Zero config, fast iteration |
| Database (Prod) | PostgreSQL (Neon) | Constitution requirement met |
| Validation | Zod | TypeScript-first, detailed errors |
| Rate Limiting | express-rate-limit | Simple, effective |
| Session Storage | Cookies (httpOnly) | Better Auth default, secure |

---

## Constitution Compliance Notes

**Deviation**: Using Express instead of FastAPI
**Justification**: Frontend already uses `better-auth/react` which requires a JavaScript backend. No Python equivalent exists.
**Mitigation**: All other constitution principles (API-First, Test-First, Layer Separation) are fully followed.

**Compliance**:
- ✅ Spec-Driven Development: Implementation follows this specification
- ✅ Layered Architecture: Frontend/Backend/Database clearly separated
- ✅ API-First Design: OpenAPI contract defined in `/contracts/`
- ✅ Test-First Development: Test strategy included in plan
- ✅ Simplicity/YAGNI: Using minimal viable implementation
- ✅ Neon PostgreSQL: Used for production database
