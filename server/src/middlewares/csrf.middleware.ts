import type { RequestHandler } from "express";
import { csrfCookieName } from "../config/cookies";
import { ApiError } from "../utils/ApiError";
import { safeEqual } from "../utils/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const requireCsrf: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const headerToken = req.get("x-csrf-token");
  const cookieToken = req.cookies?.[csrfCookieName] as string | undefined;
  const sessionToken = req.auth?.csrfToken;

  if (
    !headerToken ||
    !cookieToken ||
    !sessionToken ||
    !safeEqual(headerToken, cookieToken) ||
    !safeEqual(headerToken, sessionToken)
  ) {
    return next(ApiError.forbidden("CSRF validation failed"));
  }

  return next();
};
