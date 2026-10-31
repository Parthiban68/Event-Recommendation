import { pino } from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "recommended-events-api" },
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "res.headers.set-cookie",
      "password",
      "passwordHash",
      "token",
      "jwt",
    ],
    remove: true,
  },
});
