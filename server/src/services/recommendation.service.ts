import type { EventRepository } from "../repositories/event.repository";
import type { EventFilters } from "../validators/event.validator";
import {
  buildRecommendations,
  type CandidateProfile,
  type ScoredEvent,
} from "./recommendation.scoring";

export class RecommendationService {
  constructor(private readonly eventRepository: EventRepository) {}

  async recommend(
    profile: CandidateProfile,
    filters: EventFilters,
    now: Date = new Date(),
  ): Promise<ScoredEvent[]> {
    const candidates = await this.eventRepository.findUpcoming(filters);
    return buildRecommendations(candidates, profile, now);
  }
}

export function createRecommendationService(
  eventRepository: EventRepository,
): RecommendationService {
  return new RecommendationService(eventRepository);
}
