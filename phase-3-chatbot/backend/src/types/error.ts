export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  errors?: ValidationError[];
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public errors?: ValidationError[]
  ) {
    super(message);
    this.name = "AppError";
  }
}
