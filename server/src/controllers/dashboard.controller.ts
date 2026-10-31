import type { Request, Response } from "express";
import { dashboardService } from "../container";

export async function getDashboardStats(
  _req: Request,
  res: Response,
): Promise<void> {
  const stats = await dashboardService.getStats();

  res.status(200).json({ success: true, data: stats });
}

export async function getRecentEvents(
  _req: Request,
  res: Response,
): Promise<void> {
  const events = await dashboardService.getRecentEvents();

  res.status(200).json({ success: true, data: events });
}
