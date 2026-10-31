import "dotenv/config";
import { z } from "zod";

const rateLimitNumber = (fallback: number) =>
  z.coerce.number().int().positive().default(fallback);

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .refine(
        (value) => /^postgres(ql)?:\/\//.test(value),
        "DATABASE_URL must be a PostgreSQL connection string",
      ),
    CLIENT_URL: z.string().optional(),
    CLIENT_ORIGIN: z.string().optional(),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters")
      .default("development-only-secret-change-me-1234567890"),
    JWT_EXPIRES_IN: z.string().default("30m"),
    SESSION_COOKIE_NAME: z.string().min(1).default("eventmatch_admin"),
    CSRF_COOKIE_NAME: z.string().min(1).default("eventmatch_csrf"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    GENERAL_RATE_LIMIT_MAX: rateLimitNumber(600),
    GENERAL_RATE_LIMIT_WINDOW_MS: rateLimitNumber(15 * 60 * 1000),
    LOGIN_RATE_LIMIT_MAX: rateLimitNumber(10),
    LOGIN_RATE_LIMIT_WINDOW_MS: rateLimitNumber(15 * 60 * 1000),
    RECOMMENDATION_RATE_LIMIT_MAX: rateLimitNumber(60),
    RECOMMENDATION_RATE_LIMIT_WINDOW_MS: rateLimitNumber(15 * 60 * 1000),
    SEED_ADMIN_NAME: z.string().optional(),
    SEED_ADMIN_EMAIL: z.string().optional(),
    SEED_ADMIN_PASSWORD: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.CLIENT_URL && !value.CLIENT_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["CLIENT_URL"],
        message: "CLIENT_URL or CLIENT_ORIGIN is required",
      });
    }

    if (value.NODE_ENV === "production") {
      if (value.JWT_SECRET.startsWith("development-only")) {
        ctx.addIssue({
          code: "custom",
          path: ["JWT_SECRET"],
          message: "Set a strong JWT_SECRET in production",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(
    `Invalid environment configuration:\n${issues}\n\nCopy server/.env.example to server/.env and configure it.`,
  );
  process.exit(1);
}

export const env = parsed.data;

export const allowedOrigins = [...(env.CLIENT_URL ?? "").split(","), ...(env.CLIENT_ORIGIN ?? "").split(",")]
  .map((origin) => origin.trim())
  .filter(Boolean)
  .filter((origin, index, list) => list.indexOf(origin) === index);

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
export const isDevelopment = env.NODE_ENV === "development";
