import bcrypt from "bcrypt";
import type { Admin } from "@prisma/client";
import type { AdminRepository } from "../repositories/admin.repository";
import { ApiError } from "../utils/ApiError";

export interface SafeAdmin {
  id: string;
  name: string;
  email: string;
}

// A valid bcrypt hash used to equalise timing for unknown accounts.
const DUMMY_PASSWORD_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7Q6g4jKxJ8xP1nOQ8v3Xq3R7s8T9a5K";

export function toSafeAdmin(admin: Admin): SafeAdmin {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}

export class AuthService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async authenticate(email: string, password: string): Promise<SafeAdmin> {
    const admin = await this.adminRepository.findByEmail(email);
    const passwordMatches = await bcrypt.compare(
      password,
      admin?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!admin || !admin.isActive || !passwordMatches) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return toSafeAdmin(admin);
  }

  async getActiveAdmin(id: string): Promise<SafeAdmin> {
    const admin = await this.adminRepository.findById(id);

    if (!admin || !admin.isActive) {
      throw ApiError.unauthorized("Session is no longer valid");
    }

    return toSafeAdmin(admin);
  }
}

export function createAuthService(adminRepository: AdminRepository): AuthService {
  return new AuthService(adminRepository);
}
