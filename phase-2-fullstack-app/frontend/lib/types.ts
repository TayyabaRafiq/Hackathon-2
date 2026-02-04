// Core Entities

/** Task - the primary entity representing a user's todo item */
export interface Task {
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

/** User information available from Better Auth session */
export interface User {
  /** Unique identifier */
  id: string;

  /** User's email address */
  email: string;

  /** Display name (may be derived from email) */
  name: string | null;

  /** Profile image URL (optional) */
  image: string | null;
}

/** Authentication session state */
export interface Session {
  /** Session identifier */
  id: string;

  /** Associated user */
  user: User;

  /** Session expiration timestamp */
  expiresAt: string;
}

// Input Types (API Requests)

/** Used when creating a new task */
export interface CreateTaskInput {
  /** Task title - required */
  title: string;

  /** Optional description */
  description?: string;
}

/** Used when updating an existing task. All fields optional (partial update) */
export interface UpdateTaskInput {
  /** New title */
  title?: string;

  /** New description */
  description?: string;

  /** New completion status */
  completed?: boolean;
}

// Response Types (API Responses)

/** Response from fetching all tasks */
export type TaskListResponse = Task[];

/** Response from creating or updating a single task */
export type TaskResponse = Task;

/** Standard error response from API */
export interface ErrorResponse {
  /** Error code for programmatic handling */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Field-specific errors (for validation) */
  errors?: Record<string, string>;
}

// State Types (Frontend-Only)

/** State structure for the useTasks hook */
export interface TasksState {
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

/** Generic form state for auth and task forms */
export interface FormState<T> {
  /** Form values */
  values: T;

  /** Field errors */
  errors: Partial<Record<keyof T, string>>;

  /** Submission in progress */
  isSubmitting: boolean;

  /** General error message */
  submitError: string | null;
}

// Constants

export const VALIDATION = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const COUNTER_THRESHOLD = {
  TITLE: 180,
  DESCRIPTION: 1900,
} as const;

// Extended Error Types

export interface ApiError extends Error {
  code: string;
  status: number;
  errors?: Record<string, string>;
}

// Type Guards

export function isTask(value: unknown): value is Task {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    "completed" in value
  );
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value
  );
}
