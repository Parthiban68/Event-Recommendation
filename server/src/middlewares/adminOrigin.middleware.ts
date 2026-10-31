import type { RequestHandler } from "express";
import { allowedOrigins } from "../config/env";
import { ApiError } from "../utils/ApiError";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const validateAdminOrigin: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  // Non-browser clients do not send Origin. Cookie-authenticated browser
  // requests always do, so an absent Origin is not a browser CSRF vector.
  if (!origin) {
    return next();
  }

  if (!allowedOrigins.includes(origin)) {
    return next(ApiError.forbidden("Request origin is not allowed"));
  }

  return next();
};
