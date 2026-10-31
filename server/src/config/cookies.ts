import type { CookieOptions } from "express";
import { env, isProduction } from "./env";
import { sessionMaxAgeMs } from "../utils/auth";

const baseOptions: CookieOptions = {
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export const sessionCookieOptions: CookieOptions = {
  ...baseOptions,
  httpOnly: true,
  maxAge: sessionMaxAgeMs,
};

export const csrfCookieOptions: CookieOptions = {
  ...baseOptions,
  httpOnly: false,
  maxAge: sessionMaxAgeMs,
};

export const clearCookieOptions: CookieOptions = {
  ...baseOptions,
  httpOnly: true,
};

export const sessionCookieName = env.SESSION_COOKIE_NAME;
export const csrfCookieName = env.CSRF_COOKIE_NAME;
