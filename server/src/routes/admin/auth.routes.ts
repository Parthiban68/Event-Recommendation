import { Router } from "express";
import {
  getSession,
  login,
  logout,
} from "../../controllers/admin-auth.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { requireCsrf } from "../../middlewares/csrf.middleware";
import { loginRateLimiter } from "../../middlewares/rateLimit.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginSchema } from "../../validators/auth.validator";

export const adminAuthRouter = Router();

adminAuthRouter.post(
  "/login",
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(login),
);

adminAuthRouter.get("/session", requireAdmin, asyncHandler(getSession));

adminAuthRouter.post(
  "/logout",
  requireAdmin,
  requireCsrf,
  asyncHandler(logout),
);
