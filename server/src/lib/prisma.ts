import { PrismaClient } from "@prisma/client";
import { env, isProduction } from "../config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["error"] : ["error", "warn"],
    datasources: { db: { url: env.DATABASE_URL } },
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
