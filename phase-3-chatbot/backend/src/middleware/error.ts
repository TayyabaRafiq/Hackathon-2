import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError, ApiError } from "../types/error.js";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] ${err.message}`, err.stack);

  // Handle our custom AppError
  if (err instanceof AppError) {
    const response: ApiError = {
      code: err.code,
      message: err.message,
    };
    if (err.errors) {
      response.errors = err.errors;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiError = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
    res.status(400).json(response);
    return;
  }

  // Handle unknown errors
  const response: ApiError = {
    code: "INTERNAL_SERVER_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  };
  res.status(500).json(response);
};
