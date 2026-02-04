# Implementation Plan: Todo Frontend UI

**Branch**: `001-todo-frontend-ui` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-frontend-ui/spec.md`

## Summary

Build a production-quality frontend for a Todo web application using Next.js App Router with TypeScript and Tailwind CSS. The implementation delivers authentication flows (sign-in/sign-up via Better Auth), a task management dashboard with CRUD operations, modal-based task editing, optimistic UI updates, and comprehensive loading/error states. All API communication routes through a centralized client (`/lib/api.ts`).

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**: Next.js, React 18+, Tailwind CSS, Better Auth
**Storage**: N/A (frontend-only; backend API assumed)
**Testing**: Manual UX flow testing, visual verification against acceptance criteria
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile
**Project Type**: Web application (frontend layer only)
**Performance Goals**: 100ms visual feedback for user actions (SC-002)
**Constraints**: Responsive from 320px to 2560px; WCAG AA accessibility; no business logic in frontend
**Scale/Scope**: Single authenticated user; task list with typical usage of 10-100 tasks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | Plan derived from approved spec.md with 38 FRs |
| II. Layered Architecture | ✅ PASS | Frontend-only; API calls via `/lib/api.ts`; no business logic |
| III. Extension, Not Rewrite | ✅ PASS | Core Todo behaviors (CRUD, complete) preserved |
| IV. API-First Design | ✅ PASS | All data operations via REST API client |
| V. Test-First Development | ✅ PASS | Acceptance scenarios defined; manual test plan included |
| VI. Simplicity and YAGNI | ✅ PASS | Only spec features implemented; no extras |

**Gate Result**: PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-frontend-ui/
├── plan.md              # This file
├── research.md          # Phase 0: Best practices research
├── data-model.md        # Phase 1: Frontend data types
├── quickstart.md        # Phase 1: Developer setup guide
└── contracts/           # Phase 1: API contract definitions
    └── api-client.md    # Frontend API client interface
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing/redirect to dashboard
│   ├── (auth)/
│   │   ├── layout.tsx       # Auth pages layout (no header)
│   │   ├── sign-in/
│   │   │   └── page.tsx     # Sign-in page
│   │   └── sign-up/
│   │       └── page.tsx     # Sign-up page
│   └── (dashboard)/
│       ├── layout.tsx       # Dashboard layout with header
│       └── page.tsx         # Main task list dashboard
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # Reusable button component
│   │   ├── Input.tsx        # Reusable input component
│   │   ├── Modal.tsx        # Reusable modal component
│   │   ├── LoadingSkeleton.tsx
│   │   └── ErrorState.tsx
│   ├── layout/
│   │   ├── Header.tsx       # App header with user menu
│   │   └── PageContainer.tsx
│   ├── auth/
│   │   ├── SignInForm.tsx   # Sign-in form (client component)
│   │   └── SignUpForm.tsx   # Sign-up form (client component)
│   └── tasks/
│       ├── TaskList.tsx     # Task list container
│       ├── TaskItem.tsx     # Individual task row
│       ├── TaskCreateForm.tsx
│       ├── TaskEditModal.tsx
│       ├── TaskDeleteConfirm.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── api.ts               # Centralized API client
│   ├── auth.ts              # Better Auth client setup
│   └── types.ts             # TypeScript type definitions
├── hooks/
│   ├── useTasks.ts          # Task CRUD operations hook
│   └── useAuth.ts           # Authentication state hook
└── styles/
    └── globals.css          # Tailwind base + custom styles
```

**Structure Decision**: Frontend-only web application using Next.js App Router with route groups for auth `(auth)` and protected dashboard `(dashboard)`. Components organized by domain (ui, layout, auth, tasks).

## Architecture Decisions

### AD-1: Modal-Based Task Editing

**Decision**: Use centered modal dialog for task editing instead of inline editing.

**Rationale**:
- Cleaner UX with focused editing experience
- Avoids inline complexity with validation states cluttering the list view
- Standard pattern for professional task apps
- Better mobile experience where inline editing can be awkward

**Alternatives Rejected**:
- Inline editing: Rejected due to UX complexity on mobile and cluttered list view
- Slide-out panel: Over-engineered for simple title/description editing

### AD-2: Server vs Client Component Boundaries

**Decision**: Default to Server Components; use Client Components only for interactivity.

| Component | Type | Reason |
|-----------|------|--------|
| Root layout | Server | Static shell, providers |
| Auth layout | Server | Static wrapper |
| Dashboard layout | Server | Static with header |
| SignInForm | Client | Form state, submission |
| SignUpForm | Client | Form state, submission |
| TaskList | Client | Real-time state, optimistic updates |
| TaskItem | Client | Toggle, edit, delete actions |
| TaskEditModal | Client | Form state, focus trap |
| Header | Client | User menu dropdown |
| Button, Input | Client | Interactive elements |
| Modal | Client | Focus trap, keyboard handling |

### AD-3: State Management Approach

**Decision**: Use React hooks with local state; no global state library.

**Rationale**:
- Task list is the only shared state, contained in dashboard
- Better Auth handles auth state internally
- Avoids unnecessary complexity (YAGNI principle)

**Pattern**:
```
useTasks hook → manages task[] state
├── fetchTasks() → GET /api/tasks
├── createTask() → POST /api/tasks (optimistic)
├── updateTask() → PATCH /api/tasks/:id (optimistic)
├── toggleComplete() → PATCH /api/tasks/:id (optimistic)
└── deleteTask() → DELETE /api/tasks/:id (optimistic)
```

### AD-4: Optimistic UI Pattern

**Decision**: Update UI immediately, revert on API failure.

**Implementation**:
1. User action triggers immediate state update
2. API call fires in background
3. On success: state already correct
4. On failure: revert to previous state, show error toast

## Component Specifications

### Reusable UI Components

#### Button
- Props: `variant` (primary | secondary | danger), `size` (sm | md | lg), `loading`, `disabled`
- Accessibility: Focus ring, disabled state, loading spinner
- Tailwind: Consistent padding, colors per variant

#### Input
- Props: `label`, `error`, `type`, `placeholder`
- Accessibility: Label association, error announcement
- Validation: Character counter when approaching limit

#### Modal
- Props: `isOpen`, `onClose`, `title`, `children`
- Accessibility: Focus trap, Escape key close, aria-modal
- Animation: Simple fade-in (no advanced animations per spec)

#### LoadingSkeleton
- Props: `variant` (task | form | page)
- Tailwind: Animate-pulse, matching real component dimensions

#### ErrorState
- Props: `message`, `onRetry`
- UI: Clear error icon, message, retry button

### Domain Components

#### TaskItem
- Display: Checkbox, title, description preview, edit/delete actions
- States: Pending (normal), completed (strikethrough, muted)
- Actions: Toggle, edit (opens modal), delete (opens confirm)

#### TaskList
- Renders: TaskItem[] sorted by createdAt DESC
- States: Loading (skeletons), empty (EmptyState), error (ErrorState)

#### TaskEditModal
- Form: Title (required), description (optional)
- Validation: Title not empty, character limits
- Actions: Save, Cancel

#### TaskDeleteConfirm
- Modal with: Warning message, "This action is permanent", Cancel/Delete buttons

## API Client Contract

### `/lib/api.ts` Responsibilities

1. **Base Configuration**: API base URL from environment
2. **Token Injection**: Attach Better Auth session token to requests
3. **Error Transformation**: Convert API errors to user-friendly messages
4. **Type Safety**: All requests/responses typed

### Endpoints (Frontend Perspective)

```typescript
// Task Operations
GET    /api/tasks         → Task[]        // Fetch all user tasks
POST   /api/tasks         → Task          // Create new task
PATCH  /api/tasks/:id     → Task          // Update task (title, description, completed)
DELETE /api/tasks/:id     → void          // Delete task

// Auth (handled by Better Auth)
POST   /api/auth/sign-up  → Session       // Create account
POST   /api/auth/sign-in  → Session       // Authenticate
POST   /api/auth/sign-out → void          // End session
GET    /api/auth/session  → Session|null  // Check current session
```

### Type Definitions

```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

interface CreateTaskInput {
  title: string;
  description?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

## Implementation Phases

### Phase 1: Project Setup & Routing (Foundation)

**Goal**: Working Next.js app with routing structure

**Tasks**:
1. Initialize Next.js 16+ with TypeScript, Tailwind CSS, App Router
2. Configure Tailwind with custom color palette (neutral + accent)
3. Create route structure: `(auth)/sign-in`, `(auth)/sign-up`, `(dashboard)`
4. Create root layout with Tailwind globals
5. Create auth layout (no header)
6. Create dashboard layout (with header placeholder)

**Deliverable**: App runs, routes navigate correctly

### Phase 2: Core UI Components

**Goal**: Reusable components ready for pages

**Tasks**:
1. Implement Button component with variants
2. Implement Input component with validation display
3. Implement Modal component with focus trap
4. Implement LoadingSkeleton variants
5. Implement ErrorState with retry
6. Implement Header with user menu placeholder

**Deliverable**: Storybook-style isolation testing of each component

### Phase 3: Authentication Pages

**Goal**: Working sign-in and sign-up flows

**Tasks**:
1. Set up Better Auth client in `/lib/auth.ts`
2. Implement SignInForm with validation
3. Implement SignUpForm with validation
4. Add loading states during auth operations
5. Implement redirect logic (auth → dashboard, protected → auth)
6. Wire up auth forms to Better Auth

**Deliverable**: Users can sign up, sign in, and are redirected appropriately

### Phase 4: API Client & Task Types

**Goal**: Type-safe API communication layer

**Tasks**:
1. Define Task types in `/lib/types.ts`
2. Implement `/lib/api.ts` with typed methods
3. Add token injection from Better Auth session
4. Add error handling and transformation
5. Create `useTasks` hook with CRUD operations

**Deliverable**: API client can fetch/create/update/delete tasks (mock or real backend)

### Phase 5: Task List & Dashboard

**Goal**: Main dashboard with task display

**Tasks**:
1. Implement TaskItem component
2. Implement TaskList with loading/empty/error states
3. Implement EmptyState with call-to-action
4. Implement TaskCreateForm (inline on dashboard)
5. Wire dashboard page to useTasks hook
6. Implement sort by createdAt DESC

**Deliverable**: Dashboard shows tasks, empty state, loading skeletons

### Phase 6: Task Operations

**Goal**: Full CRUD with optimistic updates

**Tasks**:
1. Implement toggle completion (optimistic)
2. Implement TaskEditModal
3. Implement TaskDeleteConfirm
4. Add optimistic update pattern to useTasks
5. Add error rollback and toast notifications
6. Add debouncing for rapid actions

**Deliverable**: All task operations work with immediate feedback

### Phase 7: Polish & Accessibility

**Goal**: Production-ready quality

**Tasks**:
1. Add focus states to all interactive elements
2. Verify color contrast (WCAG AA)
3. Test keyboard navigation throughout
4. Test responsive layout (320px to 2560px)
5. Add character counters to inputs
6. Final review against acceptance criteria

**Deliverable**: All 8 success criteria verified

## Testing & Validation Strategy

### Manual UX Flow Testing

| Flow | Steps | Expected Result |
|------|-------|-----------------|
| First-time user | Sign up → Dashboard → Create task | Complete in <2 min |
| Returning user | Sign in → See existing tasks | Tasks sorted newest first |
| Create task | Enter title → Submit | Task appears immediately |
| Edit task | Click edit → Modify → Save | Modal closes, task updated |
| Complete task | Click checkbox | Visual toggle within 100ms |
| Delete task | Click delete → Confirm | Task removed from list |
| Error handling | Simulate API failure | Error message with retry |
| Empty state | Delete all tasks | Friendly empty message |

### Responsive Testing Checklist

- [ ] 320px (mobile portrait)
- [ ] 375px (iPhone SE)
- [ ] 768px (tablet)
- [ ] 1024px (desktop minimum)
- [ ] 1440px (desktop standard)
- [ ] 2560px (ultra-wide)

### Accessibility Testing Checklist

- [ ] Tab navigation through all interactive elements
- [ ] Focus visible on all focusable elements
- [ ] Modal traps focus correctly
- [ ] Escape closes modal
- [ ] Error messages announced to screen readers
- [ ] Color contrast meets WCAG AA

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Complexity Level | Justification |
|----------|-----------------|---------------|
| Modal for editing | Low | Standard pattern, better UX |
| Optimistic updates | Medium | Required by spec (100ms feedback) |
| Client components | As needed | Only where interactivity required |

## Out of Scope (Confirmed)

- Backend API implementation
- Database schema
- Advanced animations
- Real-time collaboration
- Offline support
- Integration testing with FastAPI

## Next Steps

1. Run `/sp.tasks` to generate task list from this plan
2. Execute Phase 1 (Project Setup)
3. Iterate through phases sequentially
4. Verify against acceptance criteria after each phase
