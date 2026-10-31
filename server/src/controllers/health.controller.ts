import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let database: "up" | "down" = "up";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }

  const healthy = database === "up";

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? "ok" : "degraded",
      database,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}
