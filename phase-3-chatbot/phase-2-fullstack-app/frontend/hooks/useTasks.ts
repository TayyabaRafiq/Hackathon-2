"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { DEMO_AUTH_MODE } from "@/lib/config";
import type { Task, CreateTaskInput, UpdateTaskInput, ApiError } from "@/lib/types";

// Factory function to create demo tasks (called only on client after mount)
function createDemoTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: "demo-1",
      title: "Welcome to TodoFlow!",
      description: "This is a demo task. Try editing or completing it.",
      completed: false,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    },
    {
      id: "demo-2",
      title: "Create your first real task",
      description: "Click the 'Add Task' button above to create a new task.",
      completed: false,
      createdAt: new Date(now - 60000).toISOString(),
      updatedAt: new Date(now - 60000).toISOString(),
    },
    {
      id: "demo-3",
      title: "Explore the features",
      description: "You can toggle completion, edit tasks, and delete them.",
      completed: true,
      createdAt: new Date(now - 120000).toISOString(),
      updatedAt: new Date(now - 120000).toISOString(),
    },
  ];
}

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  editingTask: Task | null;
  deletingTask: Task | null;
  fetchTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task | null>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task | null>;
  toggleComplete: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<boolean>;
  setEditingTask: (task: Task | null) => void;
  setDeletingTask: (task: Task | null) => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Debounce tracking for toggle
  const pendingTogglesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Track client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchTasks = useCallback(async () => {
    // Don't fetch until mounted (prevents SSR issues)
    if (!isMounted) return;

    setIsLoading(true);
    setError(null);

    // In demo mode, use mock data (created on client only)
    if (DEMO_AUTH_MODE) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      setTasks(createDemoTasks());
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.tasks.list();
      // Sort by createdAt DESC (newest first)
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTasks(sorted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(getErrorMessage(apiError));
    } finally {
      setIsLoading(false);
    }
  }, [isMounted]);

  // Fetch tasks after mount
  useEffect(() => {
    if (isMounted) {
      fetchTasks();
    }
  }, [isMounted, fetchTasks]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task | null> => {
    // Create task with unique ID
    const now = Date.now();
    const newId = DEMO_AUTH_MODE ? `demo-${now}` : `temp-${now}`;
    const newTask: Task = {
      id: newId,
      title: input.title,
      description: input.description || null,
      completed: false,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    // In demo mode, just add to local state
    if (DEMO_AUTH_MODE) {
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    }

    // Optimistic update
    setTasks((prev) => [newTask, ...prev]);

    try {
      const createdTask = await api.tasks.create(input);
      // Replace optimistic with real task
      setTasks((prev) =>
        prev.map((t) => (t.id === newId ? createdTask : t))
      );
      return createdTask;
    } catch (err) {
      // Rollback on failure
      setTasks((prev) => prev.filter((t) => t.id !== newId));
      const apiError = err as ApiError;
      throw new Error(getErrorMessage(apiError));
    }
  }, []);

  const updateTask = useCallback(async (
    id: string,
    input: UpdateTaskInput
  ): Promise<Task | null> => {
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) return null;

    const now = new Date().toISOString();
    const updatedTask = { ...originalTask, ...input, updatedAt: now };

    // In demo mode, just update local state
    if (DEMO_AUTH_MODE) {
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...input, updatedAt: now }
          : t
      )
    );

    try {
      const updated = await api.tasks.update(id, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      // Rollback on failure
      setTasks((prev) => prev.map((t) => (t.id === id ? originalTask : t)));
      const apiError = err as ApiError;
      throw new Error(getErrorMessage(apiError));
    }
  }, [tasks]);

  const toggleComplete = useCallback(async (task: Task): Promise<void> => {
    const newCompleted = !task.completed;
    const now = new Date().toISOString();

    // Update state immediately
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: newCompleted, updatedAt: now }
          : t
      )
    );

    // In demo mode, no API call needed
    if (DEMO_AUTH_MODE) {
      return;
    }

    // Cancel any pending toggle for this task
    const existingTimeout = pendingTogglesRef.current.get(task.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        await api.tasks.update(task.id, { completed: newCompleted });
        pendingTogglesRef.current.delete(task.id);
      } catch (err) {
        // Rollback on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, completed: task.completed } : t
          )
        );
        const apiError = err as ApiError;
        setError(getErrorMessage(apiError));
      }
    }, 300);

    pendingTogglesRef.current.set(task.id, timeoutId);
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) return false;

    // Remove from state
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeletingTask(null);

    // In demo mode, no API call needed
    if (DEMO_AUTH_MODE) {
      return true;
    }

    try {
      await api.tasks.delete(id);
      return true;
    } catch (err) {
      // Rollback on failure
      setTasks((prev) => {
        const restored = [...prev, originalTask];
        return restored.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      const apiError = err as ApiError;
      setError(getErrorMessage(apiError));
      return false;
    }
  }, [tasks]);

  return {
    tasks,
    isLoading,
    error,
    editingTask,
    deletingTask,
    fetchTasks,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    setEditingTask,
    setDeletingTask,
  };
}
