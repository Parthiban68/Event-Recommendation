import type { Event } from "@prisma/client";
import type { EventRepository } from "../repositories/event.repository";
import { startOfUtcDay } from "../utils/date";

export interface DashboardStats {
  total: number;
  published: number;
  draft: number;
  upcoming: number;
  past: number;
}

export class DashboardService {
  constructor(private readonly eventRepository: EventRepository) {}

  async getStats(): Promise<DashboardStats> {
    const today = startOfUtcDay(new Date());

    const [total, published, draft, upcoming, past] = await Promise.all([
      this.eventRepository.count(),
      this.eventRepository.count({ status: "PUBLISHED" }),
      this.eventRepository.count({ status: "DRAFT" }),
      this.eventRepository.count({
        status: "PUBLISHED",
        eventDate: { gte: today },
      }),
      this.eventRepository.count({
        status: "PUBLISHED",
        eventDate: { lt: today },
      }),
    ]);

    return { total, published, draft, upcoming, past };
  }

  async getRecentEvents(limit = 6): Promise<Event[]> {
    return this.eventRepository.findRecent(limit);
  }
}
