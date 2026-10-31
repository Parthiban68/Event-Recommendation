import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { validateAdminOrigin } from "../../middlewares/adminOrigin.middleware";
import { adminAuthRouter } from "./auth.routes";
import { adminEventRouter } from "./event.routes";
import { dashboardRouter } from "./dashboard.routes";

export const adminRouter = Router();

adminRouter.use(validateAdminOrigin);
adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/dashboard", requireAdmin, dashboardRouter);
adminRouter.use("/events", requireAdmin, adminEventRouter);
