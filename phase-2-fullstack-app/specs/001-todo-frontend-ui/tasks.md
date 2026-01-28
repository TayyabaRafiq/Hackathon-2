# Tasks: Todo Frontend UI

**Input**: Design documents from `/specs/001-todo-frontend-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Manual UX flow testing per plan.md - no automated test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (frontend-only)**: `frontend/` at repository root
- All paths relative to `frontend/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 16+ project with TypeScript, Tailwind CSS, App Router in `frontend/`
- [X] T002 [P] Configure environment variables in `frontend/.env.local` with API URL placeholders
- [X] T003 [P] Configure Tailwind with neutral + blue accent color system in `frontend/tailwind.config.ts`
- [X] T004 [P] Set up globals.css with Tailwind directives in `frontend/app/globals.css`
- [X] T005 Create root layout with HTML structure in `frontend/app/layout.tsx`
- [X] T006 [P] Create auth route group directory structure `frontend/app/(auth)/`
- [X] T007 [P] Create dashboard route group directory structure `frontend/app/(dashboard)/`

**Checkpoint**: Next.js app runs with `npm run dev`, basic routing works

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Define TypeScript types (Task, User, Session, inputs, errors) in `frontend/lib/types.ts`
- [X] T009 [P] Set up Better Auth client configuration in `frontend/lib/auth.ts`
- [X] T010 [P] Implement API client with typed methods and error handling in `frontend/lib/api.ts`
- [X] T011 [P] Create Button component with variants (primary/secondary/danger) in `frontend/components/ui/Button.tsx`
- [X] T012 [P] Create Input component with label and error display in `frontend/components/ui/Input.tsx`
- [X] T013 [P] Create Modal component with focus trap and Escape handling in `frontend/components/ui/Modal.tsx`
- [X] T014 [P] Create LoadingSkeleton component with task variant in `frontend/components/ui/LoadingSkeleton.tsx`
- [X] T015 [P] Create ErrorState component with retry button in `frontend/components/ui/ErrorState.tsx`
- [X] T016 Create auth layout (no header, centered content) in `frontend/app/(auth)/layout.tsx`
- [X] T017 Create dashboard layout (with header slot) in `frontend/app/(dashboard)/layout.tsx`
- [X] T018 Create PageContainer layout component in `frontend/components/layout/PageContainer.tsx`

**Checkpoint**: Foundation ready - all reusable components exist, API client configured

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: New users can create an account and be redirected to dashboard

**Independent Test**: Visit `/sign-up`, enter email/password, submit, verify redirect to dashboard

### Implementation for User Story 1

- [X] T019 [US1] Create SignUpForm client component with email/password fields in `frontend/components/auth/SignUpForm.tsx`
- [X] T020 [US1] Add client-side validation (email format, password 8+ chars) to SignUpForm
- [X] T021 [US1] Wire SignUpForm to Better Auth sign-up endpoint
- [X] T022 [US1] Add loading state during form submission in SignUpForm
- [X] T023 [US1] Add error display for duplicate email and other failures in SignUpForm
- [X] T024 [US1] Create sign-up page that renders SignUpForm in `frontend/app/(auth)/sign-up/page.tsx`
- [X] T025 [US1] Implement redirect to dashboard on successful sign-up

**Checkpoint**: User Story 1 complete - new users can register and reach dashboard

---

## Phase 4: User Story 2 - Returning User Sign In (Priority: P1)

**Goal**: Existing users can sign in and access their dashboard

**Independent Test**: Visit `/sign-in`, enter valid credentials, submit, verify redirect to dashboard

### Implementation for User Story 2

- [X] T026 [US2] Create SignInForm client component with email/password fields in `frontend/components/auth/SignInForm.tsx`
- [X] T027 [US2] Add client-side validation (email format, password required) to SignInForm
- [X] T028 [US2] Wire SignInForm to Better Auth sign-in endpoint
- [X] T029 [US2] Add loading state and submission prevention during sign-in
- [X] T030 [US2] Add generic error display for invalid credentials (security-safe message)
- [X] T031 [US2] Create sign-in page that renders SignInForm in `frontend/app/(auth)/sign-in/page.tsx`
- [X] T032 [US2] Implement redirect to dashboard on successful sign-in
- [X] T033 [US2] Add redirect logic: authenticated users on auth pages → dashboard

**Checkpoint**: User Story 2 complete - returning users can sign in

---

## Phase 5: User Story 3 - View Task List (Priority: P1)

**Goal**: Authenticated users see their tasks in a list with loading/empty/error states

**Independent Test**: Sign in, verify task list loads, shows correct states (loading skeletons, empty message, or tasks)

### Implementation for User Story 3

- [X] T034 [US3] Create useTasks hook with fetchTasks and state management in `frontend/hooks/useTasks.ts`
- [X] T035 [US3] Create TaskItem component displaying title, description, checkbox in `frontend/components/tasks/TaskItem.tsx`
- [X] T036 [US3] Add completed/pending visual distinction (strikethrough, muted) to TaskItem
- [X] T037 [US3] Create EmptyState component with guidance message in `frontend/components/tasks/EmptyState.tsx`
- [X] T038 [US3] Create TaskList component rendering TaskItem[] in `frontend/components/tasks/TaskList.tsx`
- [X] T039 [US3] Add loading skeleton state to TaskList
- [X] T040 [US3] Add error state with retry to TaskList
- [X] T041 [US3] Add empty state rendering to TaskList
- [X] T042 [US3] Implement sort by createdAt DESC in TaskList
- [X] T043 [US3] Create dashboard page wiring TaskList to useTasks in `frontend/app/(dashboard)/page.tsx`
- [X] T044 [US3] Add redirect logic: unauthenticated users on dashboard → sign-in

**Checkpoint**: User Story 3 complete - users see their tasks with all states handled

---

## Phase 6: User Story 4 - Create New Task (Priority: P1)

**Goal**: Users can add new tasks with title (required) and description (optional)

**Independent Test**: Enter task title, submit, verify task appears at top of list immediately

### Implementation for User Story 4

- [X] T045 [US4] Add createTask method to useTasks hook with optimistic update in `frontend/hooks/useTasks.ts`
- [X] T046 [US4] Create TaskCreateForm component with title/description inputs in `frontend/components/tasks/TaskCreateForm.tsx`
- [X] T047 [US4] Add title validation (required, max 200 chars) with error display
- [X] T048 [US4] Add description field with character counter (max 2000 chars)
- [X] T049 [US4] Add submit and cancel buttons to TaskCreateForm
- [X] T050 [US4] Wire TaskCreateForm to useTasks.createTask
- [X] T051 [US4] Add loading state during task creation
- [X] T052 [US4] Add error handling with retry (preserve form data on failure)
- [X] T053 [US4] Integrate TaskCreateForm into dashboard page

**Checkpoint**: User Story 4 complete - users can create tasks with immediate feedback

---

## Phase 7: User Story 5 - Mark Task Complete/Incomplete (Priority: P2)

**Goal**: Users can toggle task completion status with single click and immediate feedback

**Independent Test**: Click checkbox on task, verify visual toggle within 100ms, verify state persists

### Implementation for User Story 5

- [X] T054 [US5] Add toggleComplete method to useTasks hook with optimistic update in `frontend/hooks/useTasks.ts`
- [X] T055 [US5] Add debouncing for rapid toggle actions (300ms) in useTasks
- [X] T056 [US5] Add rollback on API failure with error toast
- [X] T057 [US5] Wire TaskItem checkbox to toggleComplete action
- [X] T058 [US5] Add click handler and optimistic visual update to TaskItem

**Checkpoint**: User Story 5 complete - task completion toggle works with optimistic UI

---

## Phase 8: User Story 6 - Edit Existing Task (Priority: P2)

**Goal**: Users can edit task title/description via modal dialog

**Independent Test**: Click edit on task, modify title in modal, save, verify update persists after refresh

### Implementation for User Story 6

- [X] T059 [US6] Add updateTask method to useTasks hook with optimistic update in `frontend/hooks/useTasks.ts`
- [X] T060 [US6] Add editingTask state management to useTasks hook
- [X] T061 [US6] Create TaskEditModal component using Modal base in `frontend/components/tasks/TaskEditModal.tsx`
- [X] T062 [US6] Pre-fill form with current task values in TaskEditModal
- [X] T063 [US6] Add title validation (required) to TaskEditModal
- [X] T064 [US6] Add character counters to TaskEditModal fields
- [X] T065 [US6] Add Save and Cancel buttons to TaskEditModal
- [X] T066 [US6] Wire TaskEditModal to useTasks.updateTask
- [X] T067 [US6] Add edit button to TaskItem that opens TaskEditModal
- [X] T068 [US6] Integrate TaskEditModal rendering in dashboard page

**Checkpoint**: User Story 6 complete - users can edit tasks via modal

---

## Phase 9: User Story 7 - Delete Task (Priority: P2)

**Goal**: Users can delete tasks with confirmation dialog

**Independent Test**: Click delete on task, confirm in dialog, verify task removed from list

### Implementation for User Story 7

- [X] T069 [US7] Add deleteTask method to useTasks hook with optimistic update in `frontend/hooks/useTasks.ts`
- [X] T070 [US7] Add deletingTask state management to useTasks hook
- [X] T071 [US7] Create TaskDeleteConfirm modal component in `frontend/components/tasks/DeleteConfirmDialog.tsx`
- [X] T072 [US7] Add permanent deletion warning message to TaskDeleteConfirm
- [X] T073 [US7] Add Confirm and Cancel buttons to TaskDeleteConfirm
- [X] T074 [US7] Wire TaskDeleteConfirm to useTasks.deleteTask
- [X] T075 [US7] Add error handling with rollback on deletion failure
- [X] T076 [US7] Add delete button to TaskItem that opens TaskDeleteConfirm
- [X] T077 [US7] Integrate TaskDeleteConfirm rendering in dashboard page

**Checkpoint**: User Story 7 complete - users can delete tasks with confirmation

---

## Phase 10: User Story 8 - User Logout (Priority: P3)

**Goal**: Users can securely log out and be redirected to sign-in

**Independent Test**: Click logout in header menu, verify redirect to sign-in, verify dashboard inaccessible

### Implementation for User Story 8

- [X] T078 [US8] Create useAuth hook for session state and logout in `frontend/lib/auth.ts` (using Better Auth useSession)
- [X] T079 [US8] Create Header component with app name and user menu in `frontend/components/layout/Header.tsx`
- [X] T080 [US8] Add user profile dropdown to Header
- [X] T081 [US8] Add logout button to user dropdown
- [X] T082 [US8] Wire logout button to Better Auth sign-out
- [X] T083 [US8] Implement redirect to sign-in after logout
- [X] T084 [US8] Integrate Header into dashboard layout

**Checkpoint**: User Story 8 complete - users can log out securely

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T085 [P] Add visible focus states to all Button components
- [X] T086 [P] Add visible focus states to all Input components
- [X] T087 [P] Verify and fix color contrast for WCAG AA compliance
- [ ] T088 Test keyboard navigation through all interactive elements
- [ ] T089 Test responsive layout at 320px, 768px, 1024px, 1440px, 2560px
- [ ] T090 Add root page redirect logic (authenticated → dashboard, else → sign-in) in `frontend/app/page.tsx`
- [ ] T091 Final review against 8 success criteria from spec.md
- [ ] T092 Run quickstart.md validation to verify setup instructions

**Checkpoint**: All success criteria verified, production-ready quality achieved

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (Registration) and US2 (Sign In) can run in parallel
  - US3 (View Tasks) depends on auth being complete (US1 or US2)
  - US4 (Create Task) depends on US3 (task list display)
  - US5, US6, US7 can run in parallel after US4
  - US8 (Logout) depends on Header integration with dashboard
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
┌───────────────────────────────────────┐
│  US1 (Sign Up)  ←→  US2 (Sign In)    │  ← P1: Can run in parallel
└───────────────────────────────────────┘
    ↓
US3 (View Tasks) ← P1: Needs auth working
    ↓
US4 (Create Task) ← P1: Needs task list
    ↓
┌───────────────────────────────────────┐
│  US5 (Toggle)  US6 (Edit)  US7 (Del) │  ← P2: Can run in parallel
└───────────────────────────────────────┘
    ↓
US8 (Logout) ← P3: Needs Header in dashboard
    ↓
Phase 11 (Polish)
```

### Parallel Opportunities

**Within Phase 1 (Setup)**:
```
T002, T003, T004 can run in parallel
T006, T007 can run in parallel
```

**Within Phase 2 (Foundational)**:
```
T009, T010 can run in parallel (lib files)
T011, T012, T013, T014, T015 can run in parallel (UI components)
```

**Across User Stories (after Phase 2)**:
```
US1 and US2 can run in parallel (different form components)
US5, US6, US7 can run in parallel (different task operations)
```

---

## Implementation Strategy

### MVP First (User Stories 1-4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - New User Registration
4. Complete Phase 4: US2 - Returning User Sign In
5. Complete Phase 5: US3 - View Task List
6. Complete Phase 6: US4 - Create New Task
7. **STOP and VALIDATE**: First-time user can sign up and create tasks
8. Deploy/demo if ready - this is the MVP!

### Incremental Delivery

1. Setup + Foundational → Framework ready
2. US1 + US2 → Auth works
3. US3 → Task list displays (read-only MVP)
4. US4 → Create tasks (full write MVP)
5. US5 + US6 + US7 → Task management complete
6. US8 → Logout functionality
7. Polish → Production quality

---

## Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 7 | 5 |
| Foundational | 11 | 8 |
| US1 (Registration) | 7 | 0 |
| US2 (Sign In) | 8 | 0 |
| US3 (View Tasks) | 11 | 0 |
| US4 (Create Task) | 9 | 0 |
| US5 (Toggle Complete) | 5 | 0 |
| US6 (Edit Task) | 10 | 0 |
| US7 (Delete Task) | 9 | 0 |
| US8 (Logout) | 7 | 0 |
| Polish | 8 | 3 |
| **Total** | **92** | **16** |

### Tasks per User Story

| User Story | Priority | Task Count |
|------------|----------|------------|
| US1 - Registration | P1 | 7 |
| US2 - Sign In | P1 | 8 |
| US3 - View Tasks | P1 | 11 |
| US4 - Create Task | P1 | 9 |
| US5 - Toggle | P2 | 5 |
| US6 - Edit | P2 | 10 |
| US7 - Delete | P2 | 9 |
| US8 - Logout | P3 | 7 |

### Suggested MVP Scope

Complete through **Phase 6 (US4 - Create Task)** for minimal viable product:
- Setup: 7 tasks
- Foundational: 11 tasks
- US1-US4: 35 tasks
- **MVP Total: 53 tasks**

---

## Notes

- [P] tasks = different files, no dependencies on other tasks in same phase
- [USn] label maps task to specific user story for traceability
- Each user story should be independently completable and testable at checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to `frontend/` directory
