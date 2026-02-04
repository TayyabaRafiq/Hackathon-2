# Data Model: TodoFlow Backend API

**Feature**: 001-backend-api
**Date**: 2026-01-19
**Database**: SQLite (dev) / PostgreSQL (prod)
**ORM**: Prisma

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Session     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ email (unique)  │  │    │ userId (FK)     │──┐
│ name            │  │    │ token           │  │
│ image           │  │    │ expiresAt       │  │
│ emailVerified   │  │    │ createdAt       │  │
│ createdAt       │  │    │ updatedAt       │  │
│ updatedAt       │  │    └─────────────────┘  │
└─────────────────┘  │                         │
        │            └─────────────────────────┘
        │ 1:N
        ▼
┌─────────────────┐
│      Task       │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ title           │
│ description     │
│ completed       │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

// ============================================
// Better Auth Required Tables
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  tasks         Task[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

// ============================================
// Application Tables
// ============================================

model Task {
  id          String   @id @default(cuid())
  userId      String
  title       String   @db.VarChar(200)
  description String?  @db.VarChar(2000)
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("tasks")
}
```

---

## Entity Details

### User (Better Auth Managed)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Unique identifier |
| email | String | UNIQUE, NOT NULL | User's email address |
| name | String | NULLABLE | Display name |
| image | String | NULLABLE | Profile image URL |
| emailVerified | Boolean | DEFAULT false | Email verification status |
| createdAt | DateTime | DEFAULT now() | Account creation timestamp |
| updatedAt | DateTime | AUTO | Last modification timestamp |

**Relations**:
- Has many Sessions (1:N)
- Has many Tasks (1:N)

---

### Session (Better Auth Managed)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Session identifier |
| userId | String | FK → User.id | Owner of session |
| token | String | UNIQUE | Session token (in cookie) |
| expiresAt | DateTime | NOT NULL | Expiration timestamp |
| createdAt | DateTime | DEFAULT now() | Session creation time |
| updatedAt | DateTime | AUTO | Last activity time |

**Relations**:
- Belongs to User (N:1)

**Cascade Behavior**: When User is deleted, all Sessions are deleted.

---

### Task (Application Managed)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Task identifier |
| userId | String | FK → User.id | Owner of task |
| title | String | MAX 200, NOT NULL | Task title |
| description | String | MAX 2000, NULLABLE | Task description |
| completed | Boolean | DEFAULT false | Completion status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last modification time |

**Relations**:
- Belongs to User (N:1)

**Cascade Behavior**: When User is deleted, all Tasks are deleted.

---

## Validation Rules

### User Validation
- `email`: Valid email format, unique in database
- `name`: Optional, derived from email prefix on sign-up
- `password`: Min 8 characters (validated by Better Auth, hashed before storage)

### Task Validation
- `title`: Required, 1-200 characters, no leading/trailing whitespace
- `description`: Optional, 0-2000 characters
- `completed`: Boolean, defaults to false

---

## State Transitions

### Task States

```
┌──────────────┐
│   Created    │
│ completed=   │
│    false     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  Incomplete  │◄───►│   Complete   │
│ completed=   │     │ completed=   │
│    false     │     │    true      │
└──────────────┘     └──────────────┘
       │                    │
       └────────┬───────────┘
                ▼
         ┌──────────────┐
         │   Deleted    │
         │ (removed)    │
         └──────────────┘
```

### Session States

```
┌──────────────┐
│   Created    │
│ (sign-in)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Active     │
│ expiresAt >  │
│    now()     │
└──────┬───────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Expired    │   │  Invalidated │
│ expiresAt <  │   │ (sign-out)   │
│    now()     │   │              │
└──────────────┘   └──────────────┘
```

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | PRIMARY | id | Primary key lookup |
| users | UNIQUE | email | Email uniqueness, login lookup |
| sessions | PRIMARY | id | Primary key lookup |
| sessions | UNIQUE | token | Token-based session lookup |
| sessions | INDEX | userId | Find user's sessions |
| tasks | PRIMARY | id | Primary key lookup |
| tasks | INDEX | userId | Find user's tasks (main query) |

---

## Migration Strategy

### Development (SQLite)

```bash
# Initialize Prisma
npx prisma init --datasource-provider sqlite

# Generate migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Production (PostgreSQL)

```bash
# Update schema.prisma provider to "postgresql"
# Set DATABASE_URL to Neon connection string

# Deploy migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## Sample Data (Seed)

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Note: Users should be created via Better Auth sign-up
  // This is only for development testing

  console.log("Seeding complete. Create users via /api/auth/sign-up/email");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
