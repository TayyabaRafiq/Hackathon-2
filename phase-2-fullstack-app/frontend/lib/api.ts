import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ErrorResponse,
  ApiError,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
const TIMEOUT_MS = 10000;

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Better Auth stores session in cookies, which are automatically sent
  // If you need Bearer token auth, import authClient and get session
  return {};
}

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
      credentials: "include",
    });
  } finally {
    clearTimeout(timeoutId);
  }
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

export function getErrorMessage(error: ApiError): string {
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

// Task API Methods

async function getTasks(): Promise<Task[]> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_BASE}/tasks`, {
    method: "GET",
    headers: { ...defaultHeaders, ...headers },
  });

  if (!response.ok) {
    throw await handleError(response);
  }

  return response.json();
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await handleError(response);
  }

  return response.json();
}

async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await handleError(response);
  }

  return response.json();
}

async function deleteTask(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: { ...defaultHeaders, ...headers },
  });

  if (!response.ok) {
    throw await handleError(response);
  }
}

export const api = {
  tasks: {
    list: getTasks,
    create: createTask,
    update: updateTask,
    delete: deleteTask,
  },
};

export type { Task, CreateTaskInput, UpdateTaskInput, ApiError };
