# Data Model: Todo Frontend UI

**Feature**: 001-todo-frontend-ui
**Date**: 2025-01-15
**Status**: Complete

## Overview

This document defines the TypeScript types and data structures used in the frontend. These types represent the contract between frontend and backend API.

---

## Core Entities

### Task

The primary entity representing a user's todo item.

```typescript
interface Task {
  /** Unique identifier (UUID from backend) */
  id: string;

  /** Task title - required, max 200 characters */
  title: string;

  /** Optional description - max 2000 characters */
  description: string | null;

  /** Completion status */
  completed: boolean;

  /** ISO 8601 timestamp - when task was created */
  createdAt: string;

  /** ISO 8601 timestamp - when task was last modified */
  updatedAt: string;
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters, trimmed whitespace
- `description`: Optional, 0-2000 characters
- `completed`: Boolean, defaults to `false` on creation

**Display Sorting**: Tasks sorted by `createdAt` descending (newest first)

---

### User (Auth Context)

User information available from Better Auth session.

```typescript
interface User {
  /** Unique identifier */
  id: string;

  /** User's email address */
  email: string;

  /** Display name (may be derived from email) */
  name: string | null;

  /** Profile image URL (optional) */
  image: string | null;
}
```

**Note**: User entity is managed by Better Auth. Frontend only reads this data.

---

### Session

Authentication session state.

```typescript
interface Session {
  /** Session identifier */
  id: string;

  /** Associated user */
  user: User;

  /** Session expiration timestamp */
  expiresAt: string;
}
```

---

## Input Types (API Requests)

### CreateTaskInput

Used when creating a new task.

```typescript
interface CreateTaskInput {
  /** Task title - required */
  title: string;

  /** Optional description */
  description?: string;
}
```

**Validation**:
- `title`: Must be non-empty after trimming
- `description`: Optional, will be `null` if not provided

---

### UpdateTaskInput

Used when updating an existing task. All fields optional (partial update).

```typescript
interface UpdateTaskInput {
  /** New title */
  title?: string;

  /** New description */
  description?: string;

  /** New completion status */
  completed?: boolean;
}
```

**Validation**:
- If `title` provided, must be non-empty after trimming
- At least one field must be provided

---

## Response Types (API Responses)

### TaskListResponse

Response from fetching all tasks.

```typescript
type TaskListResponse = Task[];
```

**Note**: Empty array returned if user has no tasks.

---

### TaskResponse

Response from creating or updating a single task.

```typescript
type TaskResponse = Task;
```

---

### ErrorResponse

Standard error response from API.

```typescript
interface ErrorResponse {
  /** Error code for programmatic handling */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Field-specific errors (for validation) */
  errors?: Record<string, string>;
}
```

**Common Error Codes**:
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `NOT_FOUND` | 404 | Task not found |
| `CONFLICT` | 409 | Email already exists (signup) |
| `SERVER_ERROR` | 500 | Internal server error |

---

## State Types (Frontend-Only)

### TasksState

State structure for the `useTasks` hook.

```typescript
interface TasksState {
  /** List of tasks */
  tasks: Task[];

  /** Loading state */
  isLoading: boolean;

  /** Error message if fetch failed */
  error: string | null;

  /** Task currently being edited (if modal open) */
  editingTask: Task | null;

  /** Task pending deletion (if confirm dialog open) */
  deletingTask: Task | null;
}
```

---

### FormState

Generic form state for auth and task forms.

```typescript
interface FormState<T> {
  /** Form values */
  values: T;

  /** Field errors */
  errors: Partial<Record<keyof T, string>>;

  /** Submission in progress */
  isSubmitting: boolean;

  /** General error message */
  submitError: string | null;
}
```

**Usage Example**:
```typescript
type SignInFormState = FormState<{
  email: string;
  password: string;
}>;

type TaskFormState = FormState<{
  title: string;
  description: string;
}>;
```

---

## Constants

### Validation Limits

```typescript
const VALIDATION = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  PASSWORD_MIN_LENGTH: 8,
} as const;
```

### Character Counter Thresholds

Show character counter when approaching limit.

```typescript
const COUNTER_THRESHOLD = {
  TITLE: 180,      // Show when 20 chars remaining
  DESCRIPTION: 1900, // Show when 100 chars remaining
} as const;
```

---

## Type Guards

Utility functions for runtime type checking.

```typescript
function isTask(value: unknown): value is Task {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    "completed" in value
  );
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value
  );
}
```

---

## Entity Relationships

```
User (1) ────────< Task (many)
  │
  └── Session (1:1 active)
```

- One User has many Tasks
- One User has one active Session
- Tasks belong to exactly one User
- Session references one User

---

## State Transitions

### Task Lifecycle

```
[New] ──create──> [Pending] ──toggle──> [Completed]
                     │                      │
                     │                      │
                     └──────toggle──────────┘
                     │
                     v
                 [Deleted]
```

### Session Lifecycle

```
[Anonymous] ──sign-up/sign-in──> [Authenticated] ──sign-out/expire──> [Anonymous]
```

---

## Notes

- All timestamps are ISO 8601 strings (e.g., `"2025-01-15T10:30:00.000Z"`)
- IDs are UUIDs as strings
- `null` used for absent optional values (not `undefined`)
- Frontend never generates IDs; always from backend
