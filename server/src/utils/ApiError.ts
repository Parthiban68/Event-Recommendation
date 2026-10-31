export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: ErrorDetail[];
  readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code: ErrorCode,
    details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: ErrorDetail[]) {
    return new ApiError(400, message, "VALIDATION_ERROR", details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message: string) {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new ApiError(409, message, "CONFLICT");
  }

  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new ApiError(429, message, "RATE_LIMITED");
  }

  static unavailable(message: string) {
    return new ApiError(503, message, "SERVICE_UNAVAILABLE");
  }
}
