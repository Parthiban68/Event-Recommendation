import { Router } from "express";
import {
  getDashboardStats,
  getRecentEvents,
} from "../../controllers/dashboard.controller";
import { asyncHandler } from "../../utils/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", asyncHandler(getDashboardStats));
dashboardRouter.get("/recent-events", asyncHandler(getRecentEvents));
