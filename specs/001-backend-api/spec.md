# Feature Specification: TodoFlow Backend API

**Feature Branch**: `001-backend-api`
**Created**: 2026-01-19
**Status**: Draft
**Input**: Backend API specification for TodoFlow - Authentication + Task Management with Better Auth integration

---

## Overview

This specification defines the backend system for TodoFlow Phase 2, providing authentication and task management APIs that integrate with the existing Next.js frontend. The backend uses **Better Auth** for authentication (matching the frontend's `better-auth/react` client) and exposes RESTful APIs for task CRUD operations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration (Priority: P1)

A new user visits the application and creates an account to start managing their tasks.

**Why this priority**: Without user registration, no one can use the authenticated features of the app. This is the entry point for all new users.

**Independent Test**: Can be fully tested by submitting the sign-up form with valid credentials and verifying the user can subsequently sign in.

**Acceptance Scenarios**:

1. **Given** a visitor on the sign-up page, **When** they submit valid email, password (8+ chars), and confirm password, **Then** an account is created and they are automatically signed in and redirected to dashboard
2. **Given** a visitor attempting sign-up, **When** they use an email that already exists, **Then** they see error "An account with this email already exists"
3. **Given** a visitor attempting sign-up, **When** they submit an invalid email format, **Then** they see a validation error before submission
4. **Given** a visitor attempting sign-up, **When** password is less than 8 characters, **Then** they see error "Password must be at least 8 characters"

---

### User Story 2 - User Sign In (Priority: P1)

A registered user signs into their account to access their tasks.

**Why this priority**: Sign-in is equally critical as registration - existing users must be able to access their data.

**Independent Test**: Can be fully tested by signing in with valid credentials and verifying access to dashboard with user's tasks.

**Acceptance Scenarios**:

1. **Given** a registered user on sign-in page, **When** they enter valid email and password, **Then** they are authenticated and redirected to dashboard
2. **Given** a user attempting sign-in, **When** they enter incorrect password, **Then** they see error "Invalid email or password"
3. **Given** a user attempting sign-in, **When** they enter non-existent email, **Then** they see error "Invalid email or password" (same message for security)
4. **Given** an authenticated user, **When** they close browser and return later (within session validity), **Then** they remain signed in

---

### User Story 3 - Create Task (Priority: P2)

An authenticated user creates a new task to track something they need to do.

**Why this priority**: Creating tasks is the primary value proposition after authentication is working.

**Independent Test**: Can be fully tested by creating a task and verifying it appears in the task list.

**Acceptance Scenarios**:

1. **Given** an authenticated user on dashboard, **When** they submit a task with title "Buy groceries", **Then** the task is created with `completed: false` and appears in their task list
2. **Given** an authenticated user, **When** they create task with title and description, **Then** both fields are saved and visible
3. **Given** an authenticated user, **When** they submit task with empty title, **Then** they see validation error "Title is required"
4. **Given** an authenticated user, **When** they submit task with title > 200 characters, **Then** they see validation error about max length

---

### User Story 4 - View Tasks (Priority: P2)

An authenticated user views all their tasks on the dashboard.

**Why this priority**: Users need to see their tasks to manage them effectively.

**Independent Test**: Can be fully tested by loading the dashboard and verifying all user's tasks are displayed.

**Acceptance Scenarios**:

1. **Given** an authenticated user with 5 tasks, **When** they load the dashboard, **Then** all 5 tasks are displayed
2. **Given** an authenticated user with no tasks, **When** they load dashboard, **Then** they see an empty state message
3. **Given** two different users with separate tasks, **When** User A loads dashboard, **Then** they see only their own tasks (not User B's)
4. **Given** an unauthenticated visitor, **When** they try to access /dashboard, **Then** they are redirected to sign-in

---

### User Story 5 - Update Task (Priority: P2)

An authenticated user modifies an existing task (title, description, or completion status).

**Why this priority**: Updating tasks (especially marking complete) is core to task management workflow.

**Independent Test**: Can be fully tested by editing a task's title and toggling its completion status.

**Acceptance Scenarios**:

1. **Given** a user with task "Buy groceries", **When** they update title to "Buy organic groceries", **Then** the change is saved and reflected
2. **Given** a user with incomplete task, **When** they mark it as completed, **Then** `completed` becomes `true` and `updatedAt` is refreshed
3. **Given** a user with completed task, **When** they mark it as incomplete, **Then** `completed` becomes `false`
4. **Given** User A, **When** they try to update User B's task, **Then** they receive 404 Not Found (task isolation)

---

### User Story 6 - Delete Task (Priority: P3)

An authenticated user removes a task they no longer need.

**Why this priority**: Deletion is less frequent than create/update but necessary for task management.

**Independent Test**: Can be fully tested by deleting a task and verifying it no longer appears.

**Acceptance Scenarios**:

1. **Given** a user with task "Old task", **When** they delete it, **Then** the task is permanently removed from their list
2. **Given** User A, **When** they try to delete User B's task, **Then** they receive 404 Not Found
3. **Given** a user, **When** they try to delete non-existent task ID, **Then** they receive 404 Not Found

---

### User Story 7 - Sign Out (Priority: P3)

An authenticated user signs out to end their session.

**Why this priority**: Sign-out is important for security but not blocking core functionality.

**Independent Test**: Can be fully tested by signing out and verifying dashboard is no longer accessible.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click sign out, **Then** their session is invalidated and they are redirected to sign-in
2. **Given** a signed-out user, **When** they try to access /dashboard, **Then** they are redirected to sign-in
3. **Given** a signed-out user, **When** they try to call task APIs, **Then** they receive 401 Unauthorized

---

### Edge Cases

- What happens when a user's session expires mid-operation? → Return 401 Unauthorized with clear message
- How does system handle concurrent updates to the same task? → Last write wins with `updatedAt` tracking
- What happens if database is temporarily unavailable? → Return 503 Service Unavailable with retry guidance
- What if a task ID in URL is malformed (not UUID)? → Return 400 Bad Request with validation error

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication (Better Auth)**

- **FR-001**: System MUST use Better Auth library for authentication, matching frontend's `better-auth/react` client
- **FR-002**: System MUST support email/password sign-up with: email (valid format), password (min 8 characters), name (derived from email prefix)
- **FR-003**: System MUST support email/password sign-in returning session data
- **FR-004**: System MUST hash passwords securely (Better Auth handles this with bcrypt by default)
- **FR-005**: System MUST create and manage sessions via cookies (httpOnly, secure in production)
- **FR-006**: System MUST provide sign-out endpoint that invalidates the session
- **FR-007**: System MUST prevent duplicate email registration with appropriate error message

**Task Management**

- **FR-008**: System MUST allow authenticated users to create tasks with: title (required, max 200 chars), description (optional, max 2000 chars)
- **FR-009**: System MUST auto-generate for new tasks: id (UUID), createdAt (ISO 8601), updatedAt (ISO 8601), completed (false)
- **FR-010**: System MUST return all tasks for the authenticated user on GET /api/tasks
- **FR-011**: System MUST support partial updates via PATCH /api/tasks/:id with any combination of: title, description, completed
- **FR-012**: System MUST update `updatedAt` timestamp on every task modification
- **FR-013**: System MUST support task deletion via DELETE /api/tasks/:id
- **FR-014**: System MUST enforce task isolation - users can only access their own tasks

**API Design**

- **FR-015**: System MUST accept and return JSON with Content-Type: application/json
- **FR-016**: System MUST use standard HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 409 (Conflict), 500 (Server Error)
- **FR-017**: System MUST return errors in format: `{ "code": "ERROR_CODE", "message": "Human readable message", "errors": {...} }`
- **FR-018**: System MUST validate all input and return field-specific errors for validation failures

**Security**

- **FR-019**: System MUST use environment variables for all secrets (database URL, auth secret)
- **FR-020**: System MUST configure CORS to allow requests from the frontend origin
- **FR-021**: System MUST implement basic rate limiting on authentication endpoints (10 requests/minute per IP)
- **FR-022**: System MUST sanitize input to prevent injection attacks

---

### Key Entities

**User** (managed by Better Auth)
- `id`: Unique identifier (UUID)
- `email`: User's email address (unique, required)
- `name`: Display name (nullable)
- `image`: Profile image URL (nullable)
- `emailVerified`: Whether email is verified (boolean)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp

**Session** (managed by Better Auth)
- `id`: Session identifier
- `userId`: Reference to User
- `token`: Session token (stored in cookie)
- `expiresAt`: Session expiration timestamp

**Task**
- `id`: Unique identifier (UUID)
- `userId`: Reference to owning User (foreign key)
- `title`: Task title (required, max 200 characters)
- `description`: Task description (nullable, max 2000 characters)
- `completed`: Completion status (boolean, default false)
- `createdAt`: Creation timestamp (ISO 8601)
- `updatedAt`: Last modification timestamp (ISO 8601)

---

## API Specification

### Authentication Endpoints (Better Auth)

Better Auth exposes its routes under `/api/auth/*`. The frontend is configured to call `http://localhost:8000/api/auth`.

| Endpoint                  | Method | Description         |
|---------------------------|--------|---------------------|
| `/api/auth/sign-up/email` | POST   | Register new user   |
| `/api/auth/sign-in/email` | POST   | Sign in user        |
| `/api/auth/sign-out`      | POST   | Sign out user       |
| `/api/auth/get-session`   | GET    | Get current session |

**Sign Up Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "user"
}
```

**Sign In Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Session Response**:
```json
{
  "session": {
    "id": "session-id",
    "userId": "user-uuid",
    "expiresAt": "2026-01-26T10:00:00Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "user",
    "image": null
  }
}
```

---

### Task Endpoints

| Endpoint          | Method | Auth     | Description                          |
|-------------------|--------|----------|--------------------------------------|
| `/api/tasks`      | GET    | Required | List all tasks for authenticated user |
| `/api/tasks`      | POST   | Required | Create a new task                    |
| `/api/tasks/:id`  | PATCH  | Required | Update a task                        |
| `/api/tasks/:id`  | DELETE | Required | Delete a task                        |

**GET /api/tasks**

Response (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2026-01-19T10:00:00Z",
    "updatedAt": "2026-01-19T10:00:00Z"
  }
]
```

**POST /api/tasks**

Request:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2026-01-19T10:00:00Z",
  "updatedAt": "2026-01-19T10:00:00Z"
}
```

**PATCH /api/tasks/:id**

Request (partial update):
```json
{
  "completed": true
}
```

Response (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "createdAt": "2026-01-19T10:00:00Z",
  "updatedAt": "2026-01-19T10:30:00Z"
}
```

**DELETE /api/tasks/:id**

Response (200 OK): Empty body or `{ "success": true }`

---

### Error Response Format

All errors follow this structure:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "title": "Title is required"
  }
}
```

**Error Codes**:

| Code             | HTTP Status | Description                              |
|------------------|-------------|------------------------------------------|
| UNAUTHORIZED     | 401         | Not authenticated or session expired     |
| NOT_FOUND        | 404         | Resource not found                       |
| VALIDATION_ERROR | 400         | Input validation failed                  |
| CONFLICT         | 409         | Resource already exists (duplicate email) |
| SERVER_ERROR     | 500         | Internal server error                    |

---

## Technical Recommendations

### Recommended Stack: Node.js + Express + Better Auth

**Justification**:
1. **Better Auth Compatibility**: Native JavaScript/TypeScript library - seamless integration
2. **Frontend Alignment**: Same language as Next.js frontend reduces context switching
3. **Simplicity**: Express is minimal and beginner-friendly for hackathon timeline
4. **Deployment**: Easy to deploy on Railway, Render, or Vercel Serverless

### Database: SQLite (Development) / PostgreSQL (Production)

**Justification**:
1. **SQLite for Dev**: Zero configuration, file-based, perfect for hackathon
2. **PostgreSQL for Prod**: Better Auth has built-in support, scales well
3. **Prisma ORM**: Type-safe database access with easy migrations

### Project Structure

```
backend/
├── src/
│   ├── index.ts           # Entry point, Express app setup
│   ├── auth.ts            # Better Auth configuration
│   ├── routes/
│   │   └── tasks.ts       # Task CRUD routes
│   ├── middleware/
│   │   ├── auth.ts        # Session verification middleware
│   │   └── validation.ts  # Input validation middleware
│   └── lib/
│       └── prisma.ts      # Prisma client instance
├── prisma/
│   └── schema.prisma      # Database schema
├── .env.example           # Environment template
├── .env                   # Local environment (gitignored)
├── package.json
└── tsconfig.json
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration and sign-in flow in under 30 seconds
- **SC-002**: Task CRUD operations complete within 500ms under normal load
- **SC-003**: System correctly isolates tasks between users (0% cross-user data leakage)
- **SC-004**: 100% of authentication attempts are properly logged
- **SC-005**: All API endpoints return appropriate status codes for success and error cases
- **SC-006**: System handles 50 concurrent users without degradation
- **SC-007**: Frontend integration works without modification to existing frontend code

---

## Frontend Integration Guide

### Environment Configuration

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/auth
```

### Auth Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │    Database     │
│   (Next.js)     │     │ (Express+Auth)  │     │   (SQLite/PG)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. POST /sign-up/email│                       │
         │ {email, password}     │                       │
         │──────────────────────>│                       │
         │                       │ 2. Hash password      │
         │                       │ 3. INSERT user        │
         │                       │──────────────────────>│
         │                       │<──────────────────────│
         │                       │ 4. Create session     │
         │                       │──────────────────────>│
         │ 5. Set-Cookie: token  │<──────────────────────│
         │<──────────────────────│                       │
         │                       │                       │
         │ 6. GET /api/tasks     │                       │
         │ Cookie: token         │                       │
         │──────────────────────>│                       │
         │                       │ 7. Validate session   │
         │                       │──────────────────────>│
         │                       │<──────────────────────│
         │                       │ 8. SELECT tasks       │
         │                       │──────────────────────>│
         │ 9. JSON: tasks[]      │<──────────────────────│
         │<──────────────────────│                       │
```

---

## Deployment Readiness

### Local Development
```bash
cd backend
npm install
cp .env.example .env  # Edit with your values
npx prisma migrate dev
npm run dev  # Starts on port 8000
```

### Production Deployment (Railway/Render)
1. Set environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGIN`
2. Run `npx prisma migrate deploy`
3. Start with `npm start`

### Required Environment Variables

| Variable           | Description                   | Example                             |
|--------------------|-------------------------------|-------------------------------------|
| DATABASE_URL       | Database connection string    | `postgresql://...` or `file:./dev.db` |
| BETTER_AUTH_SECRET | Secret for session signing    | Random 32+ char string              |
| CORS_ORIGIN        | Allowed frontend origin       | `http://localhost:3000`             |
| PORT               | Server port                   | `8000`                              |

---

## Phase 2 Backend Completion Checklist

- [ ] Backend project initialized with Express + TypeScript
- [ ] Better Auth configured and working with frontend
- [ ] Prisma schema defined for User, Session, Task
- [ ] Database migrations created and applied
- [ ] Sign-up endpoint working (creates user, returns session)
- [ ] Sign-in endpoint working (validates credentials, returns session)
- [ ] Sign-out endpoint working (invalidates session)
- [ ] GET /api/tasks returns user's tasks only
- [ ] POST /api/tasks creates task with validation
- [ ] PATCH /api/tasks/:id updates task (partial)
- [ ] DELETE /api/tasks/:id removes task
- [ ] All endpoints return proper error responses
- [ ] CORS configured for frontend origin
- [ ] Environment variables documented and used
- [ ] Frontend connects successfully with DEMO_MODE=false
- [ ] Manual end-to-end testing completed

---

## Assumptions

1. **Single-device sessions**: Users access from one device at a time; no explicit multi-device session management needed for MVP
2. **No email verification**: For hackathon scope, email verification is skipped
3. **No password reset**: Password reset flow is out of scope for Phase 2
4. **No task sharing**: Tasks are private to the user who created them
5. **English only**: No internationalization required
6. **Soft delete not required**: Tasks are hard-deleted (permanently removed)
