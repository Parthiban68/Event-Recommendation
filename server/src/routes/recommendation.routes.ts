import { Router } from "express";
import { getRecommendations } from "../controllers/recommendation.controller";
import { recommendationRateLimiter } from "../middlewares/rateLimit.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { recommendationRequestSchema } from "../validators/recommendation.validator";

export const recommendationRouter = Router();

recommendationRouter.post(
  "/",
  recommendationRateLimiter,
  validateRequest({ body: recommendationRequestSchema }),
  asyncHandler(getRecommendations),
);
