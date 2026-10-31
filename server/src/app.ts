import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { allowedOrigins, env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { generalRateLimiter } from "./middlewares/rateLimit.middleware";
import { requestLogMiddleware } from "./middlewares/requestLog.middleware";
import { apiRouter } from "./routes";

const allowAllOrigins =
  allowedOrigins.includes("*") || env.CLIENT_ORIGIN === "*";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestLogMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: allowAllOrigins ? true : allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Accept", "X-CSRF-Token"],
      exposedHeaders: ["X-Request-Id"],
      credentials: true,
      maxAge: 600,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        name: "Recommended Events API",
        version: "2.0.0",
        endpoints: [
          "GET /api/health",
          "GET /api/events",
          "GET /api/events/:id",
          "POST /api/recommendations",
          "POST /api/admin/auth/login",
          "GET /api/admin/auth/session",
          "POST /api/admin/auth/logout",
          "GET /api/admin/dashboard/stats",
          "GET /api/admin/dashboard/recent-events",
          "GET /api/admin/events",
          "POST /api/admin/events",
          "GET /api/admin/events/:id",
          "PUT /api/admin/events/:id",
          "PATCH /api/admin/events/:id/status",
          "DELETE /api/admin/events/:id",
        ],
      },
    });
  });

  app.use("/api", generalRateLimiter, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
