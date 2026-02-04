# API Client Contract: Todo Frontend UI

**Feature**: 001-todo-frontend-ui
**Date**: 2025-01-15
**Status**: Complete

## Overview

This document defines the contract for `/lib/api.ts` - the centralized API client that all components use to communicate with the backend.

---

## Client Configuration

### Environment Variables

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Base Setup

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

const defaultHeaders = {
  "Content-Type": "application/json",
};
```

---

## Authentication Integration

The API client must attach the Better Auth session token to all requests.

```typescript
import { authClient } from "./auth";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await authClient.getSession();
  if (session?.accessToken) {
    return { Authorization: `Bearer ${session.accessToken}` };
  }
  return {};
}
```

---

## Task Endpoints

### GET /api/tasks

Fetch all tasks for the authenticated user.

**Request**:
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid-1",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

**Response** (401 Unauthorized):
```json
{
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**Client Method**:
```typescript
async function getTasks(): Promise<Task[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/tasks`, {
    method: "GET",
    headers: { ...defaultHeaders, ...headers },
  });

  if (!response.ok) {
    throw await handleError(response);
  }

  return response.json();
}
```

---

### POST /api/tasks

Create a new task.

**Request**:
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New task",
  "description": "Optional description"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-new",
  "title": "New task",
  "description": "Optional description",
  "completed": false,
  "createdAt": "2025-01-15T11:00:00.000Z",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

**Response** (400 Bad Request):
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "title": "Title is required"
  }
}
```

**Client Method**:
```typescript
async function createTask(input: CreateTaskInput): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await handleError(response);
  }

  return response.json();
}
```

---

### PATCH /api/tasks/:id

Update an existing task (partial update).

**Request**:
```http
PATCH /api/tasks/uuid-1
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": "uuid-1",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**Response** (404 Not Found):
```json
{
  "code": "NOT_FOUND",
  "message": "Task not found"
}
```

**Client Method**:
```typescript
async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await handleError(response);
  }

  return response.json();
}
```

---

### DELETE /api/tasks/:id

Delete a task permanently.

**Request**:
```http
DELETE /api/tasks/uuid-1
Authorization: Bearer <token>
```

**Response** (204 No Content):
```
(empty body)
```

**Response** (404 Not Found):
```json
{
  "code": "NOT_FOUND",
  "message": "Task not found"
}
```

**Client Method**:
```typescript
async function deleteTask(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: { ...defaultHeaders, ...headers },
  });

  if (!response.ok) {
    throw await handleError(response);
  }
}
```

---

## Error Handling

### Error Handler

```typescript
interface ApiError extends Error {
  code: string;
  status: number;
  errors?: Record<string, string>;
}

async function handleError(response: Response): Promise<ApiError> {
  let body: ErrorResponse;

  try {
    body = await response.json();
  } catch {
    body = {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
    };
  }

  const error = new Error(body.message) as ApiError;
  error.code = body.code;
  error.status = response.status;
  error.errors = body.errors;

  return error;
}
```

### Error Code to User Message Mapping

```typescript
function getErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "UNAUTHORIZED":
      return "Please sign in to continue";
    case "NOT_FOUND":
      return "Task not found. It may have been deleted.";
    case "VALIDATION_ERROR":
      return error.message;
    case "CONFLICT":
      return "An account with this email already exists";
    case "SERVER_ERROR":
      return "Something went wrong. Please try again.";
    default:
      return "An unexpected error occurred";
  }
}
```

---

## Exported API Object

```typescript
// lib/api.ts
export const api = {
  tasks: {
    list: getTasks,
    create: createTask,
    update: updateTask,
    delete: deleteTask,
  },
};

// Usage in components:
// import { api } from "@/lib/api";
// const tasks = await api.tasks.list();
```

---

## Request Timeout

All requests should have a timeout to prevent hanging.

```typescript
const TIMEOUT_MS = 10000; // 10 seconds

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## Type Exports

```typescript
// lib/api.ts exports
export type { Task, CreateTaskInput, UpdateTaskInput, ApiError };
```

---

## Notes

- All requests include `Content-Type: application/json` header
- All authenticated requests include `Authorization: Bearer <token>` header
- Errors are thrown as `ApiError` objects for consistent handling
- 401 responses should trigger redirect to sign-in page
- Timeout set to 10 seconds to handle slow networks
