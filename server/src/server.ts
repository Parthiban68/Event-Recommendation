import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

async function start(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Database connection established");
  } catch (error) {
    logger.error(
      { err: error },
      "Unable to connect to the database. Check DATABASE_URL in server/.env.",
    );
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });

    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

void start();
