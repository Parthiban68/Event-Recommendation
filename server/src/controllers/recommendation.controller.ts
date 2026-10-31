import type { Request, Response } from "express";
import { recommendationService } from "../container";
import { getValidated } from "../middlewares/validate.middleware";
import { SCORE_WEIGHTS } from "../services/recommendation.scoring";
import type { RecommendationRequest } from "../validators/recommendation.validator";

export async function getRecommendations(
  req: Request,
  res: Response,
): Promise<void> {
  const { skills, interests, filters } = getValidated<RecommendationRequest>(
    req,
    "body",
  );

  const scoredEvents = await recommendationService.recommend(
    { skills, interests },
    filters ?? {},
  );

  const recommendations = scoredEvents.map(({ event, ...recommendation }) => ({
    ...event,
    ...recommendation,
  }));

  res.status(200).json({
    success: true,
    data: {
      recommendations,
      meta: {
        total: recommendations.length,
        generatedAt: new Date().toISOString(),
        candidate: { skills, interests },
        weights: SCORE_WEIGHTS,
      },
    },
  });
}
