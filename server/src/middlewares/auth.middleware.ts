import { sessionCookieName } from "../config/cookies";
import { adminRepository } from "../container";
import { ApiError } from "../utils/ApiError";
import { verifyAdminToken } from "../utils/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[sessionCookieName] as string | undefined;

  if (!token) {
    throw ApiError.unauthorized();
  }

  let claims;
  try {
    claims = verifyAdminToken(token);
  } catch {
    throw ApiError.unauthorized("Session expired or invalid");
  }

  const admin = await adminRepository.findById(claims.id);

  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized("Session is no longer valid");
  }

  req.admin = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
  req.auth = { csrfToken: claims.csrfToken };

  next();
});
