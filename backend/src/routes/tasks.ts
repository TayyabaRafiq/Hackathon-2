import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validation.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  CreateTaskInput,
  UpdateTaskInput,
} from "../schemas/task.js";
import { AppError } from "../types/error.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/tasks - Create a new task
 */
router.post(
  "/",
  validateBody(createTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description } = req.body as CreateTaskInput;
      const userId = req.user!.id;

      const task = await prisma.task.create({
        data: {
          userId,
          title,
          description: description || null,
          completed: false,
        },
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/tasks - List all tasks for authenticated user
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/tasks/:id - Update a task
 */
router.patch(
  "/:id",
  validateParams(taskIdSchema),
  validateBody(updateTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id as string;
      const updates = req.body as UpdateTaskInput;

      // Find task and verify ownership
      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        throw new AppError("NOT_FOUND", 404, "Task not found");
      }

      // Apply updates
      const task = await prisma.task.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && {
            description: updates.description,
          }),
          ...(updates.completed !== undefined && {
            completed: updates.completed,
          }),
        },
      });

      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/tasks/:id - Delete a task
 */
router.delete(
  "/:id",
  validateParams(taskIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id as string;

      // Find task and verify ownership
      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        throw new AppError("NOT_FOUND", 404, "Task not found");
      }

      await prisma.task.delete({
        where: { id },
      });

      res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
