import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../types/error.js";

/**
 * Creates a validation middleware for request body
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const response: ApiError = {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        };
        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
}

/**
 * Creates a validation middleware for request params
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const response: ApiError = {
          code: "VALIDATION_ERROR",
          message: "Invalid parameters",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        };
        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
}
