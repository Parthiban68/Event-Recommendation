import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { isProduction } from "../config/env";
import { logger } from "../lib/logger";
import { ApiError } from "../utils/ApiError";

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

function sendError(
  statusCode: number,
  code: string,
  message: string,
  details?: Array<{ path: string; message: string }>,
) {
  const body: ErrorBody = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };

  return { statusCode, body };
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    const { statusCode, body } = sendError(
      error.statusCode,
      error.code,
      error.message,
      error.details,
    );
    return res.status(statusCode).json(body);
  }

  if (error instanceof SyntaxError && "body" in error) {
    const { statusCode, body } = sendError(
      400,
      "VALIDATION_ERROR",
      "Request body contains invalid JSON",
    );
    return res.status(statusCode).json(body);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    const { statusCode, body } = sendError(
      404,
      "NOT_FOUND",
      "The requested resource was not found",
    );
    return res.status(statusCode).json(body);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code.startsWith("P10")) {
      const { statusCode, body } = sendError(
        503,
        "SERVICE_UNAVAILABLE",
        "The database is currently unavailable",
      );
      return res.status(statusCode).json(body);
    }

    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta?.target.join(", ")
        : String(error.meta?.target ?? "field");
      const { statusCode, body } = sendError(
        409,
        "CONFLICT",
        "An event with the same unique value already exists",
        [{ path: target, message: "Must be unique" }],
      );
      return res.status(statusCode).json(body);
    }

    if (error.code === "P2003") {
      const { statusCode, body } = sendError(
        409,
        "CONFLICT",
        "The operation conflicts with related data",
      );
      return res.status(statusCode).json(body);
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    const { statusCode, body } = sendError(
      503,
      "SERVICE_UNAVAILABLE",
      "The database is currently unavailable",
    );
    return res.status(statusCode).json(body);
  }

  const isPayloadTooLarge =
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large";

  if (isPayloadTooLarge) {
    const { statusCode, body } = sendError(
      413,
      "VALIDATION_ERROR",
      "Request body is too large",
    );
    return res.status(statusCode).json(body);
  }

  logger.error(
    {
      err: isProduction
        ? { message: error instanceof Error ? error.message : String(error) }
        : error,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    },
    "unhandled request error",
  );

  const { statusCode, body } = sendError(
    500,
    "INTERNAL_ERROR",
    "An unexpected error occurred",
  );
  return res.status(statusCode).json(body);
};
