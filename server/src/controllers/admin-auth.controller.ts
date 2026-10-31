import type { Request, Response } from "express";
import {
  clearCookieOptions,
  csrfCookieName,
  csrfCookieOptions,
  sessionCookieName,
  sessionCookieOptions,
} from "../config/cookies";
import { authService } from "../container";
import { getValidated } from "../middlewares/validate.middleware";
import { generateCsrfToken, signAdminToken } from "../utils/auth";
import type { LoginInput } from "../validators/auth.validator";

function setAuthCookies(res: Response, token: string, csrfToken: string): void {
  res.cookie(sessionCookieName, token, sessionCookieOptions);
  res.cookie(csrfCookieName, csrfToken, csrfCookieOptions);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = getValidated<LoginInput>(req, "body");
  const admin = await authService.authenticate(email, password);
  const csrfToken = generateCsrfToken();
  const token = signAdminToken(admin, csrfToken);

  setAuthCookies(res, token, csrfToken);

  res.status(200).json({
    success: true,
    data: { authenticated: true, admin, csrfToken },
  });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      authenticated: true,
      admin: req.admin,
      csrfToken: req.auth?.csrfToken,
    },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(sessionCookieName, clearCookieOptions);
  res.clearCookie(csrfCookieName, {
    ...clearCookieOptions,
    httpOnly: false,
  });

  res.status(200).json({
    success: true,
    data: { authenticated: false },
  });
}
