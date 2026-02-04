# Tasks: TodoFlow Backend API

**Input**: Design documents from `/specs/001-backend-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Not explicitly requested - test tasks omitted. Manual testing via curl/Postman specified in plan.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/prisma/`
- Frontend already exists at `frontend/` - no changes needed

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create backend project structure and install dependencies

- [x] T001 Create backend directory with package.json at `backend/package.json`
- [x] T002 Install production dependencies (express, better-auth, @prisma/client, zod, cors, express-rate-limit, dotenv)
- [x] T003 [P] Install dev dependencies (typescript, ts-node-dev, @types/node, @types/express, @types/cors, prisma)
- [x] T004 [P] Create TypeScript configuration at `backend/tsconfig.json`
- [x] T005 [P] Create environment template at `backend/.env.example`
- [x] T006 Create local environment file at `backend/.env` with development values
- [x] T007 [P] Create .gitignore for backend at `backend/.gitignore`
- [x] T008 Add npm scripts (dev, build, start, db:migrate, db:generate) to `backend/package.json`

**Checkpoint**: `npm install` runs without errors

---

## Phase 2: Foundational (Database & Core Infrastructure)

**Purpose**: Prisma setup and core infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Initialize Prisma with SQLite at `backend/prisma/schema.prisma`
- [x] T010 Define User model in `backend/prisma/schema.prisma` (per data-model.md)
- [x] T011 Define Session model in `backend/prisma/schema.prisma` (per data-model.md)
- [x] T012 Define Task model in `backend/prisma/schema.prisma` (per data-model.md)
- [x] T013 Run initial Prisma migration (`npx prisma migrate dev --name init`)
- [x] T014 Generate Prisma client (`npx prisma generate`)
- [x] T015 Create Prisma client singleton at `backend/src/lib/prisma.ts`
- [x] T016 [P] Create directory structure: `backend/src/middleware/`, `backend/src/routes/`, `backend/src/schemas/`
- [x] T017 Create Express app entry point at `backend/src/index.ts` (basic setup without routes)
- [x] T018 Configure CORS middleware in `backend/src/index.ts`
- [x] T019 Configure JSON body parser in `backend/src/index.ts`
- [x] T020 [P] Create error response types at `backend/src/types/error.ts`
- [x] T021 Create global error handler middleware at `backend/src/middleware/error.ts`

**Checkpoint**: `npm run dev` starts server on port 8000, Prisma Studio shows User/Session/Task tables

---

## Phase 3: User Stories 1 & 2 - Authentication (Priority: P1) MVP

**Goal**: Users can register and sign in via Better Auth

**Independent Test**:
- POST to /api/auth/sign-up/email creates user and returns session cookie
- POST to /api/auth/sign-in/email validates credentials and returns session cookie
- GET to /api/auth/get-session returns current session with user info

### Implementation for Authentication

- [x] T022 [US1] [US2] Create Better Auth configuration at `backend/src/auth.ts`
- [x] T023 [US1] [US2] Configure Prisma adapter in `backend/src/auth.ts`
- [x] T024 [US1] [US2] Configure email/password provider with min 8 char password in `backend/src/auth.ts`
- [x] T025 [US1] [US2] Configure trusted origins for CORS in `backend/src/auth.ts`
- [x] T026 [US1] [US2] Export auth handler using toNodeHandler in `backend/src/auth.ts`
- [x] T027 [US1] [US2] Mount Better Auth handler at /api/auth/* in `backend/src/index.ts`
- [x] T028 [US1] [US2] Test sign-up endpoint via curl: `POST /api/auth/sign-up/email`
- [x] T029 [US1] [US2] Test sign-in endpoint via curl: `POST /api/auth/sign-in/email`
- [x] T030 [US1] [US2] Test get-session endpoint via curl: `GET /api/auth/get-session`

**Checkpoint**: Can register user, sign in, and retrieve session - authentication MVP complete

---

## Phase 4: Session Middleware (Foundational for Task APIs)

**Purpose**: Protected route middleware required before Task CRUD

- [x] T031 Create Express type augmentation for user/session at `backend/src/types/express.d.ts`
- [x] T032 Create session verification middleware at `backend/src/middleware/auth.ts`
- [x] T033 Implement requireAuth function that extracts session via Better Auth API
- [x] T034 Return 401 with standard error format for unauthenticated requests
- [x] T035 Attach user and session to request object for downstream handlers

**Checkpoint**: Unauthenticated requests to protected routes return 401 UNAUTHORIZED

---

## Phase 5: User Story 3 - Create Task (Priority: P2)

**Goal**: Authenticated users can create new tasks

**Independent Test**: POST /api/tasks with valid title creates task with completed=false

### Implementation for Create Task

- [x] T036 [P] [US3] Create Zod schema for task creation at `backend/src/schemas/task.ts`
- [x] T037 [P] [US3] Create validation middleware at `backend/src/middleware/validation.ts`
- [x] T038 [US3] Create task router at `backend/src/routes/tasks.ts`
- [x] T039 [US3] Implement POST /api/tasks handler in `backend/src/routes/tasks.ts`
- [x] T040 [US3] Validate title (required, max 200 chars) and description (optional, max 2000 chars)
- [x] T041 [US3] Create task in database with userId from session
- [x] T042 [US3] Return 201 with created task including id, createdAt, updatedAt
- [x] T043 [US3] Mount task router at /api/tasks in `backend/src/index.ts`
- [x] T044 [US3] Test create task via curl with session cookie

**Checkpoint**: Can create tasks for authenticated user - Create Task complete

---

## Phase 6: User Story 4 - View Tasks (Priority: P2)

**Goal**: Authenticated users can view their tasks (only their own)

**Independent Test**: GET /api/tasks returns only tasks belonging to authenticated user

### Implementation for View Tasks

- [x] T045 [US4] Implement GET /api/tasks handler in `backend/src/routes/tasks.ts`
- [x] T046 [US4] Query tasks filtered by userId from session
- [x] T047 [US4] Return 200 with array of tasks (empty array if none)
- [x] T048 [US4] Verify task isolation: User A cannot see User B's tasks
- [x] T049 [US4] Test list tasks via curl with session cookie

**Checkpoint**: Can view tasks with proper user isolation - View Tasks complete

---

## Phase 7: User Story 5 - Update Task (Priority: P2)

**Goal**: Authenticated users can update their tasks (title, description, completed)

**Independent Test**: PATCH /api/tasks/:id updates task and returns updated task

### Implementation for Update Task

- [x] T050 [P] [US5] Create Zod schema for task update at `backend/src/schemas/task.ts`
- [x] T051 [P] [US5] Create Zod schema for task ID validation at `backend/src/schemas/task.ts`
- [x] T052 [US5] Implement PATCH /api/tasks/:id handler in `backend/src/routes/tasks.ts`
- [x] T053 [US5] Validate task ID format (CUID)
- [x] T054 [US5] Find task by ID AND userId (ensures ownership)
- [x] T055 [US5] Return 404 if task not found or not owned by user
- [x] T056 [US5] Apply partial update (title, description, completed - any combination)
- [x] T057 [US5] Return 200 with updated task including refreshed updatedAt
- [x] T058 [US5] Test update task via curl with session cookie

**Checkpoint**: Can update tasks with ownership validation - Update Task complete

---

## Phase 8: User Story 6 - Delete Task (Priority: P3)

**Goal**: Authenticated users can delete their tasks

**Independent Test**: DELETE /api/tasks/:id removes task permanently

### Implementation for Delete Task

- [x] T059 [US6] Implement DELETE /api/tasks/:id handler in `backend/src/routes/tasks.ts`
- [x] T060 [US6] Validate task ID format
- [x] T061 [US6] Find and delete task by ID AND userId (ensures ownership)
- [x] T062 [US6] Return 404 if task not found or not owned by user
- [x] T063 [US6] Return 200 with success response
- [x] T064 [US6] Test delete task via curl with session cookie

**Checkpoint**: Can delete tasks with ownership validation - Delete Task complete

---

## Phase 9: User Story 7 - Sign Out (Priority: P3)

**Goal**: Authenticated users can sign out to end their session

**Independent Test**: POST /api/auth/sign-out invalidates session

### Implementation for Sign Out

- [x] T065 [US7] Verify sign-out endpoint works (provided by Better Auth)
- [x] T066 [US7] Test sign-out via curl with session cookie
- [x] T067 [US7] Verify session is invalidated (get-session returns null after sign-out)
- [x] T068 [US7] Verify task API returns 401 after sign-out

**Checkpoint**: Sign out invalidates session - Sign Out complete

---

## Phase 10: Security & Error Handling

**Purpose**: Production-ready security and error handling

- [x] T069 [P] Create rate limiter configuration at `backend/src/middleware/rateLimit.ts`
- [x] T070 Apply rate limiting to /api/auth/* endpoints (10 req/min per IP)
- [x] T071 Ensure all validation errors return proper format: { code, message, errors }
- [x] T072 Ensure 401 errors include UNAUTHORIZED code
- [x] T073 Ensure 404 errors include NOT_FOUND code
- [x] T074 Ensure 409 errors (duplicate email) include CONFLICT code
- [x] T075 [P] Add input sanitization to prevent injection attacks

**Checkpoint**: All error responses follow spec format, rate limiting active

---

## Phase 11: Frontend Integration

**Purpose**: Connect frontend to real backend

- [ ] T076 Update `frontend/.env.local` with NEXT_PUBLIC_DEMO_MODE=false
- [ ] T077 Update `frontend/.env.local` with NEXT_PUBLIC_API_URL=http://localhost:8000/api
- [ ] T078 Update `frontend/.env.local` with NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/auth
- [ ] T079 Start backend server (`npm run dev` in backend/)
- [ ] T080 Start frontend server (`npm run dev` in frontend/)
- [ ] T081 Test sign-up flow from frontend UI
- [ ] T082 Test sign-in flow from frontend UI
- [ ] T083 Test create task from dashboard
- [ ] T084 Test view tasks on dashboard
- [ ] T085 Test update task (toggle complete, edit title)
- [ ] T086 Test delete task from dashboard
- [ ] T087 Test sign-out from header

**Checkpoint**: Complete user journey works in browser - Frontend Integration complete

---

## Phase 12: Polish & Documentation

**Purpose**: Final cleanup and documentation

- [ ] T088 [P] Update `backend/.env.example` with all required variables documented
- [ ] T089 [P] Verify all endpoints match OpenAPI contract in `specs/001-backend-api/contracts/openapi.yaml`
- [ ] T090 Run full end-to-end test: register → sign-in → create tasks → update → delete → sign-out
- [ ] T091 Test error scenarios: invalid credentials, duplicate email, missing title, invalid task ID
- [ ] T092 [P] Update README or quickstart.md with any discovered issues

**Checkpoint**: Backend complete and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────────────────────────┐
                                                      │
Phase 2: Foundational ◄──────────────────────────────┘
    │
    ├──► Phase 3: Authentication (US1, US2) ──┐
    │                                          │
    └──► Phase 4: Session Middleware ◄────────┘
            │
            ├──► Phase 5: Create Task (US3) ──────┐
            │                                      │
            ├──► Phase 6: View Tasks (US4) ◄──────┤
            │                                      │
            ├──► Phase 7: Update Task (US5) ◄─────┤
            │                                      │
            └──► Phase 8: Delete Task (US6) ◄─────┤
                                                   │
Phase 9: Sign Out (US7) ◄─────────────────────────┘
                                                   │
Phase 10: Security ◄──────────────────────────────┘
    │
Phase 11: Frontend Integration ◄──────────────────┘
    │
Phase 12: Polish ◄────────────────────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Registration) | Phase 2 | Foundational complete |
| US2 (Sign In) | Phase 2 | Foundational complete |
| US3 (Create Task) | Phase 4 | Session Middleware complete |
| US4 (View Tasks) | Phase 4 | Session Middleware complete |
| US5 (Update Task) | US3 | Create Task complete (needs tasks to update) |
| US6 (Delete Task) | US3 | Create Task complete (needs tasks to delete) |
| US7 (Sign Out) | US1, US2 | Authentication complete |

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Can run in parallel:
Task T003: Install dev dependencies
Task T004: Create TypeScript configuration
Task T005: Create environment template
Task T007: Create .gitignore
```

**Phase 2 (Foundational)**:
```bash
# Can run in parallel:
Task T016: Create directory structure
Task T020: Create error response types
```

**Phase 5-8 (Task CRUD)**:
```bash
# Within each phase, schemas can be created in parallel:
Task T036: Create Zod schema for task creation
Task T037: Create validation middleware
Task T050: Create Zod schema for task update
Task T051: Create Zod schema for task ID
```

---

## Implementation Strategy

### MVP First (Authentication + View + Create)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: Authentication (US1, US2)
4. Complete Phase 4: Session Middleware
5. Complete Phase 5: Create Task (US3)
6. Complete Phase 6: View Tasks (US4)
7. **STOP and VALIDATE**: Test with frontend - can register, sign in, create tasks, view tasks

### Full Implementation

Continue with:
8. Phase 7: Update Task (US5)
9. Phase 8: Delete Task (US6)
10. Phase 9: Sign Out (US7)
11. Phase 10: Security
12. Phase 11: Frontend Integration
13. Phase 12: Polish

---

## Summary

| Phase | Tasks | User Stories |
|-------|-------|--------------|
| Phase 1: Setup | T001-T008 (8 tasks) | - |
| Phase 2: Foundational | T009-T021 (13 tasks) | - |
| Phase 3: Authentication | T022-T030 (9 tasks) | US1, US2 |
| Phase 4: Session Middleware | T031-T035 (5 tasks) | - |
| Phase 5: Create Task | T036-T044 (9 tasks) | US3 |
| Phase 6: View Tasks | T045-T049 (5 tasks) | US4 |
| Phase 7: Update Task | T050-T058 (9 tasks) | US5 |
| Phase 8: Delete Task | T059-T064 (6 tasks) | US6 |
| Phase 9: Sign Out | T065-T068 (4 tasks) | US7 |
| Phase 10: Security | T069-T075 (7 tasks) | - |
| Phase 11: Frontend Integration | T076-T087 (12 tasks) | - |
| Phase 12: Polish | T088-T092 (5 tasks) | - |

**Total: 92 tasks**

---

## Notes

- All file paths are relative to repository root
- [P] tasks can run in parallel (different files, no dependencies)
- [US*] labels map tasks to specific user stories
- Test tasks via curl before moving to next phase
- Commit after each phase completion
- Stop at any checkpoint to validate independently
