import { PrismaClient } from "@prisma/client";
import {
  AddTaskInput,
  ListTasksInput,
  UpdateTaskInput,
  CompleteTaskInput,
  DeleteTaskInput,
} from "../schemas/mcpTools.js";
import {
  ToolResponse,
  AddTaskData,
  ListTasksData,
  UpdateTaskData,
  CompleteTaskData,
  DeleteTaskData,
  TaskData,
} from "../types/mcpTools.js";

const prisma = new PrismaClient();

/**
 * Authorization Helper: Verify user ownership
 * CRITICAL: All MCP tools MUST call this before database operations
 */
export function verifyUserOwnership<T>(
  requestUserId: string,
  sessionUserId: string
): ToolResponse<T> | null {
  if (requestUserId !== sessionUserId) {
    return {
      success: false,
      error: "Unauthorized: Cannot access other users' tasks",
    } as ToolResponse<T>;
  }
  return null; // Authorization passed
}

/**
 * MCP Tool: add_task
 * Creates a new task for the authenticated user
 */
export async function addTask(
  input: AddTaskInput,
  sessionUserId: string
): Promise<ToolResponse<AddTaskData>> {
  try {
    // CRITICAL: Verify user ownership
    const authError = verifyUserOwnership<AddTaskData>(input.user_id, sessionUserId);
    if (authError) return authError;

    // Create task via Prisma ORM (SQL injection safe)
    const task = await prisma.task.create({
      data: {
        userId: input.user_id,
        title: input.title,
        description: input.description || null,
        completed: false,
      },
    });

    return {
      success: true,
      data: {
        task_id: task.id,
      },
    };
  } catch (error: any) {
    console.error("[MCP:add_task] Error:", error);
    return {
      success: false,
      error: `Failed to create task: ${error.message}`,
    };
  }
}

/**
 * MCP Tool: list_tasks
 * Retrieves user's tasks with optional filters
 */
export async function listTasks(
  input: ListTasksInput,
  sessionUserId: string
): Promise<ToolResponse<ListTasksData>> {
  try {
    // CRITICAL: Verify user ownership
    const authError = verifyUserOwnership<ListTasksData>(input.user_id, sessionUserId);
    if (authError) return authError;

    // Build query filters
    const where: any = {
      userId: input.user_id,
    };

    if (input.status === "pending") {
      where.completed = false;
    } else if (input.status === "completed") {
      where.completed = true;
    }
    // "all" status: no completed filter

    if (input.priority) {
      // Note: Current schema doesn't have priority field, this is for future extension
      // For now, skip priority filtering
    }

    // Query tasks via Prisma ORM
    const tasks = await prisma.task.findMany({
      where,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    });

    // Transform to TaskData format
    const taskData: TaskData[] = tasks.map((task) => ({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: {
        tasks: taskData,
        total_count: taskData.length,
      },
    };
  } catch (error: any) {
    console.error("[MCP:list_tasks] Error:", error);
    return {
      success: false,
      error: `Failed to list tasks: ${error.message}`,
    };
  }
}

/**
 * MCP Tool: update_task
 * Updates task fields (title, description, priority, status)
 */
export async function updateTask(
  input: UpdateTaskInput,
  sessionUserId: string
): Promise<ToolResponse<UpdateTaskData>> {
  try {
    // CRITICAL: Verify user ownership
    const authError = verifyUserOwnership<UpdateTaskData>(input.user_id, sessionUserId);
    if (authError) return authError;

    // Verify task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: input.task_id,
        userId: input.user_id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it",
      };
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    const updatedFields: string[] = [];

    if (input.title !== undefined) {
      updateData.title = input.title;
      updatedFields.push("title");
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
      updatedFields.push("description");
    }
    if (input.status !== undefined) {
      updateData.completed = input.status === "completed";
      updatedFields.push("status");
    }

    // Update task via Prisma ORM
    await prisma.task.update({
      where: { id: input.task_id },
      data: updateData,
    });

    return {
      success: true,
      data: {
        task_id: input.task_id,
        updated_fields: updatedFields,
      },
    };
  } catch (error: any) {
    console.error("[MCP:update_task] Error:", error);
    return {
      success: false,
      error: `Failed to update task: ${error.message}`,
    };
  }
}

/**
 * MCP Tool: complete_task
 * Marks a task as completed
 */
export async function completeTask(
  input: CompleteTaskInput,
  sessionUserId: string
): Promise<ToolResponse<CompleteTaskData>> {
  try {
    // CRITICAL: Verify user ownership
    const authError = verifyUserOwnership<CompleteTaskData>(input.user_id, sessionUserId);
    if (authError) return authError;

    // Verify task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: input.task_id,
        userId: input.user_id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: "Task not found or you don't have permission to complete it",
      };
    }

    if (existingTask.completed) {
      return {
        success: true,
        data: {
          task_id: input.task_id,
          completed_at: existingTask.updatedAt.toISOString(),
        },
        warning: "Task was already completed",
      };
    }

    // Mark task as completed via Prisma ORM
    await prisma.task.update({
      where: { id: input.task_id },
      data: { completed: true },
    });

    return {
      success: true,
      data: {
        task_id: input.task_id,
        completed_at: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[MCP:complete_task] Error:", error);
    return {
      success: false,
      error: `Failed to complete task: ${error.message}`,
    };
  }
}

/**
 * MCP Tool: delete_task
 * Deletes a task permanently
 */
export async function deleteTask(
  input: DeleteTaskInput,
  sessionUserId: string
): Promise<ToolResponse<DeleteTaskData>> {
  try {
    // CRITICAL: Verify user ownership
    const authError = verifyUserOwnership<DeleteTaskData>(input.user_id, sessionUserId);
    if (authError) return authError;

    // Verify task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: input.task_id,
        userId: input.user_id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: "Task not found or you don't have permission to delete it",
      };
    }

    // Delete task via Prisma ORM
    await prisma.task.delete({
      where: { id: input.task_id },
    });

    return {
      success: true,
      data: {
        task_id: input.task_id,
        deleted_at: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[MCP:delete_task] Error:", error);
    return {
      success: false,
      error: `Failed to delete task: ${error.message}`,
    };
  }
}
