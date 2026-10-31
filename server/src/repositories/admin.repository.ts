import type { Admin } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class AdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { id } });
  }
}
