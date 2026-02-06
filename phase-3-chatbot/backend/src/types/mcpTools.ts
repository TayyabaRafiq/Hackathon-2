/**
 * MCP Tool Response Interface
 * Consistent response format for all MCP tools to ensure AI agent can parse results reliably.
 */

export interface ToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
}

/**
 * Task data structure returned by MCP tools
 */
export interface TaskData {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

/**
 * List tasks response data
 */
export interface ListTasksData {
  tasks: TaskData[];
  total_count: number;
}

/**
 * Add task response data
 */
export interface AddTaskData {
  task_id: string;
}

/**
 * Update task response data
 */
export interface UpdateTaskData {
  task_id: string;
  updated_fields: string[]; // List of fields that were updated
}

/**
 * Complete task response data
 */
export interface CompleteTaskData {
  task_id: string;
  completed_at: string; // ISO 8601 format
}

/**
 * Delete task response data
 */
export interface DeleteTaskData {
  task_id: string;
  deleted_at: string; // ISO 8601 format
}
