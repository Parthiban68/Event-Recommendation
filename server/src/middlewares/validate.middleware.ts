import type { Request, RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError, type ErrorDetail } from "../utils/ApiError";

type RequestPart = "body" | "query" | "params";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validateRequest(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    const validated: NonNullable<typeof req.validated> = {
      ...(req.validated ?? {}),
    };

    for (const part of Object.keys(schemas) as RequestPart[]) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);

      if (!result.success) {
        const details: ErrorDetail[] = result.error.issues.map((issue) => ({
          path: issue.path.length ? issue.path.map(String).join(".") : part,
          message: issue.message,
        }));

        return next(
          ApiError.badRequest("Request validation failed", details),
        );
      }

      validated[part] = result.data;
    }

    req.validated = validated;
    return next();
  };
}

export function getValidated<T>(req: Request, part: RequestPart): T {
  const value = req.validated?.[part];

  if (value === undefined) {
    throw new Error(`Missing validated request ${part}`);
  }

  return value as T;
}
