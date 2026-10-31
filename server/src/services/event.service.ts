import type { Event } from "@prisma/client";
import type { EventRepository } from "../repositories/event.repository";
import { ApiError } from "../utils/ApiError";
import type {
  EventFilters,
  EventListQuery,
} from "../validators/event.validator";

export interface EventListResult {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async listEvents(query: EventListQuery): Promise<EventListResult> {
    const { events, total } = await this.eventRepository.findMany(query);

    return {
      events,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findPublishedById(id);

    if (!event) {
      throw ApiError.notFound("Event not found");
    }

    return event;
  }

  async findUpcoming(filters: EventFilters): Promise<Event[]> {
    return this.eventRepository.findUpcoming(filters);
  }
}
