import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../lib/logger";

export const requestLogMiddleware: RequestHandler = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info(
      {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      },
      "request completed",
    );
  });

  next();
};
