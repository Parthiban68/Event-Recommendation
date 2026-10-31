import { randomBytes, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";

export interface AdminTokenClaims {
  id: string;
  email: string;
  csrfToken: string;
}

const tokenPayloadSchema = z
  .object({
    sub: z.string().uuid(),
    email: z.string().email(),
    role: z.literal("admin"),
    csrf: z.string().min(16),
    iat: z.number(),
    exp: z.number(),
  })
  .passthrough();

const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)$/;
const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDurationMs(value: string, fallbackMs = 30 * 60_000): number {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2]!;
  return amount * UNIT_MS[unit]!;
}

export const sessionMaxAgeMs = parseDurationMs(env.JWT_EXPIRES_IN);

export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function signAdminToken(admin: { id: string; email: string }, csrfToken: string): string {
  return jwt.sign(
    { email: admin.email, role: "admin", csrf: csrfToken },
    env.JWT_SECRET,
    {
      subject: admin.id,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

export function verifyAdminToken(token: string): AdminTokenClaims {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

  const parsed = tokenPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Invalid token claims");
  }

  return {
    id: parsed.data.sub,
    email: parsed.data.email,
    csrfToken: parsed.data.csrf,
  };
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
