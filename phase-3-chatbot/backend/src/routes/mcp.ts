import { Router, Request, Response } from "express";
import {
  AddTaskInputSchema,
  ListTasksInputSchema,
  UpdateTaskInputSchema,
  CompleteTaskInputSchema,
  DeleteTaskInputSchema,
} from "../schemas/mcpTools";
import {
  addTask,
  listTasks,
  updateTask,
  completeTask,
  deleteTask,
} from "../services/mcpTools";
import { mcpRateLimiter } from "../middleware/rateLimit";

const router = Router();

// Apply rate limiter to all MCP endpoints
router.use(mcpRateLimiter);

// Content-Type validation middleware for all MCP endpoints
router.use((req: Request, res: Response, next: any) => {
  const contentType = req.headers["content-type"];

  if (!contentType || !contentType.includes("application/json")) {
    return res.status(415).json({
      success: false,
      error: "Unsupported Media Type. Content-Type must be application/json",
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
  }

  next();
});

/**
 * MCP Tool Endpoints
 * These endpoints are called by the AI service to perform task operations.
 * All tools return ToolResponse format: {success, data, error, warning}
 */

/**
 * POST /mcp/add-task
 * Create a new task for the user
 */
router.post("/add-task", async (req: Request, res: Response) => {
  try {
    // Validate input with Zod
    const input = AddTaskInputSchema.parse(req.body);

    // Extract session user ID (would come from AI service request)
    // For now, using the user_id from request body (AI service passes authenticated user_id)
    const sessionUserId = input.user_id;

    // Call MCP tool service
    const result = await addTask(input, sessionUserId);

    res.json(result);
  } catch (error: any) {
    console.error("[MCP:add-task] Error:", error);

    // Validation error
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors.map((e: any) => e.message).join(", ")}`,
      });
    }

    // Internal error
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /mcp/list-tasks
 * Retrieve user's tasks with optional filters
 */
router.post("/list-tasks", async (req: Request, res: Response) => {
  try {
    const input = ListTasksInputSchema.parse(req.body);
    const sessionUserId = input.user_id;

    const result = await listTasks(input, sessionUserId);
    res.json(result);
  } catch (error: any) {
    console.error("[MCP:list-tasks] Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors.map((e: any) => e.message).join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /mcp/update-task
 * Update task fields (title, description, priority, status)
 */
router.post("/update-task", async (req: Request, res: Response) => {
  try {
    const input = UpdateTaskInputSchema.parse(req.body);
    const sessionUserId = input.user_id;

    const result = await updateTask(input, sessionUserId);
    res.json(result);
  } catch (error: any) {
    console.error("[MCP:update-task] Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors.map((e: any) => e.message).join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /mcp/complete-task
 * Mark a task as completed
 */
router.post("/complete-task", async (req: Request, res: Response) => {
  try {
    const input = CompleteTaskInputSchema.parse(req.body);
    const sessionUserId = input.user_id;

    const result = await completeTask(input, sessionUserId);
    res.json(result);
  } catch (error: any) {
    console.error("[MCP:complete-task] Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors.map((e: any) => e.message).join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /mcp/delete-task
 * Delete a task permanently
 */
router.post("/delete-task", async (req: Request, res: Response) => {
  try {
    const input = DeleteTaskInputSchema.parse(req.body);
    const sessionUserId = input.user_id;

    const result = await deleteTask(input, sessionUserId);
    res.json(result);
  } catch (error: any) {
    console.error("[MCP:delete-task] Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors.map((e: any) => e.message).join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
