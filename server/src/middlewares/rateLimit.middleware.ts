import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { env } from "../config/env";

interface LimiterOptions {
  windowMs: number;
  limit: number;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter({
  windowMs,
  limit,
  skipSuccessfulRequests = false,
}: LimiterOptions): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again later.",
        },
      });
    },
  });
}

export const generalRateLimiter = createRateLimiter({
  windowMs: env.GENERAL_RATE_LIMIT_WINDOW_MS,
  limit: env.GENERAL_RATE_LIMIT_MAX,
});

export const loginRateLimiter = createRateLimiter({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true,
});

export const recommendationRateLimiter = createRateLimiter({
  windowMs: env.RECOMMENDATION_RATE_LIMIT_WINDOW_MS,
  limit: env.RECOMMENDATION_RATE_LIMIT_MAX,
});
