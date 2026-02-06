import { z } from "zod";

/**
 * MCP Tool Input Schemas
 * All MCP tools use Zod for input validation to ensure type safety and data integrity.
 */

// AddTask MCP Tool Input
export const AddTaskInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  title: z.string().min(1, "Title is required").max(500, "Title too long (max 500 chars)"),
  description: z.string().max(5000, "Description too long (max 5000 chars)").optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  due_date: z.string().datetime().optional(), // ISO 8601 format
});

export type AddTaskInput = z.infer<typeof AddTaskInputSchema>;

// ListTasks MCP Tool Input
export const ListTasksInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  status: z.enum(["pending", "completed", "all"]).default("pending"),
  priority: z.enum(["low", "normal", "high"]).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type ListTasksInput = z.infer<typeof ListTasksInputSchema>;

// UpdateTask MCP Tool Input
export const UpdateTaskInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  task_id: z.string().cuid("Invalid task ID format"),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  status: z.enum(["pending", "completed"]).optional(),
  due_date: z.string().datetime().optional(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

// CompleteTask MCP Tool Input
export const CompleteTaskInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  task_id: z.string().cuid("Invalid task ID format"),
});

export type CompleteTaskInput = z.infer<typeof CompleteTaskInputSchema>;

// DeleteTask MCP Tool Input
export const DeleteTaskInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  task_id: z.string().cuid("Invalid task ID format"),
});

export type DeleteTaskInput = z.infer<typeof DeleteTaskInputSchema>;
