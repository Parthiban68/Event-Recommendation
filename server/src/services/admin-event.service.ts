import type { Event, EventStatus, Prisma } from "@prisma/client";
import type { EventRepository } from "../repositories/event.repository";
import { ApiError, type ErrorDetail } from "../utils/ApiError";
import { differenceInUtcDays } from "../utils/date";
import { isHttpUrl } from "../utils/url";
import type {
  AdminEventCreateInput,
  AdminEventListQuery,
  AdminEventUpdateInput,
} from "../validators/admin-event.validator";

interface PublishableEvent {
  title: string;
  summary: string;
  description: string;
  category: string;
  requiredSkills: string[];
  interests: string[];
  bannerUrl: string | null;
  eventDate: Date | null;
  startTime: string;
  endTime: string | null;
  timezone: string;
  location: string;
  isOnline: boolean;
  registrationUrl: string;
  status: EventStatus;
}

function assertPublishable(event: PublishableEvent): void {
  const issues: ErrorDetail[] = [];

  if (event.title.trim().length < 5) {
    issues.push({ path: "title", message: "Title must be at least 5 characters" });
  }
  if (event.summary.trim().length < 10) {
    issues.push({
      path: "summary",
      message: "Summary must be at least 10 characters before publishing",
    });
  }
  if (event.description.trim().length < 30) {
    issues.push({
      path: "description",
      message: "Description must be at least 30 characters before publishing",
    });
  }
  if (event.category.trim().length < 2) {
    issues.push({
      path: "category",
      message: "Category is required before publishing",
    });
  }
  if (event.requiredSkills.length === 0) {
    issues.push({
      path: "requiredSkills",
      message: "Select at least one required skill before publishing",
    });
  }
  if (event.interests.length === 0) {
    issues.push({
      path: "interests",
      message: "Select at least one interest before publishing",
    });
  }
  if (!event.eventDate) {
    issues.push({
      path: "eventDate",
      message: "Event date is required before publishing",
    });
  } else if (differenceInUtcDays(event.eventDate, new Date()) < 0) {
    issues.push({
      path: "eventDate",
      message: "Published events must use a future date",
    });
  }
  if (!event.startTime) {
    issues.push({
      path: "startTime",
      message: "Start time is required before publishing",
    });
  }
  if (!event.timezone) {
    issues.push({
      path: "timezone",
      message: "Timezone is required before publishing",
    });
  }
  if (!event.location.trim()) {
    issues.push({
      path: "location",
      message: "Venue or online location is required before publishing",
    });
  }
  if (!event.registrationUrl || !isHttpUrl(event.registrationUrl)) {
    issues.push({
      path: "registrationUrl",
      message: "A valid registration URL is required before publishing",
    });
  }
  if (event.bannerUrl && !isHttpUrl(event.bannerUrl)) {
    issues.push({
      path: "bannerUrl",
      message: "Banner URL must be a valid http(s) URL",
    });
  }
  if (
    event.startTime &&
    event.endTime &&
    event.endTime <= event.startTime
  ) {
    issues.push({
      path: "endTime",
      message: "End time must be after start time",
    });
  }

  if (issues.length > 0) {
    throw ApiError.badRequest("Event is not ready to publish", issues);
  }
}

function mergedEvent(
  existing: Event,
  input: AdminEventUpdateInput,
  status: EventStatus,
): PublishableEvent {
  return {
    title: input.title ?? existing.title,
    summary: input.summary ?? existing.summary,
    description: input.description ?? existing.description,
    category: input.category ?? existing.category,
    requiredSkills: input.requiredSkills ?? existing.requiredSkills,
    interests: input.interests ?? existing.interests,
    bannerUrl:
      input.bannerUrl === undefined
        ? existing.bannerUrl
        : input.bannerUrl || null,
    eventDate:
      input.eventDate === undefined ? existing.eventDate : input.eventDate,
    startTime: input.startTime ?? existing.startTime,
    endTime:
      input.endTime === undefined ? existing.endTime : input.endTime || null,
    timezone: input.timezone ?? existing.timezone,
    location: input.location ?? existing.location,
    isOnline: input.isOnline ?? existing.isOnline,
    registrationUrl:
      input.registrationUrl === undefined
        ? existing.registrationUrl
        : input.registrationUrl || "",
    status,
  };
}

function buildUpdateData(
  input: AdminEventUpdateInput,
  status: EventStatus,
): Prisma.EventUncheckedUpdateInput {
  const data: Prisma.EventUncheckedUpdateInput = { status };

  if (input.title !== undefined) data.title = input.title;
  if (input.summary !== undefined) data.summary = input.summary;
  if (input.description !== undefined) data.description = input.description;
  if (input.category !== undefined) data.category = input.category;
  if (input.requiredSkills !== undefined) {
    data.requiredSkills = input.requiredSkills;
  }
  if (input.interests !== undefined) data.interests = input.interests;
  if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl || null;
  if (input.eventDate !== undefined) data.eventDate = input.eventDate;
  if (input.startTime !== undefined) data.startTime = input.startTime;
  if (input.endTime !== undefined) data.endTime = input.endTime || null;
  if (input.timezone !== undefined) data.timezone = input.timezone;
  if (input.location !== undefined) data.location = input.location;
  if (input.isOnline !== undefined) data.isOnline = input.isOnline;
  if (input.registrationUrl !== undefined) {
    data.registrationUrl = input.registrationUrl || "";
  }

  return data;
}

export class AdminEventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async list(query: AdminEventListQuery) {
    const { events, total } = await this.eventRepository.findAdminMany(query);

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

  async getById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw ApiError.notFound("Event not found");
    }

    return event;
  }

  async create(input: AdminEventCreateInput, adminId: string): Promise<Event> {
    const status = input.status ?? "DRAFT";
    const draft: PublishableEvent = {
      title: input.title,
      summary: input.summary ?? "",
      description: input.description ?? "",
      category: input.category ?? "",
      requiredSkills: input.requiredSkills ?? [],
      interests: input.interests ?? [],
      bannerUrl: input.bannerUrl || null,
      eventDate: input.eventDate ?? null,
      startTime: input.startTime ?? "",
      endTime: input.endTime || null,
      timezone: input.timezone ?? "UTC",
      location: input.location ?? "",
      isOnline: input.isOnline ?? false,
      registrationUrl: input.registrationUrl || "",
      status,
    };

    if (status === "PUBLISHED") {
      assertPublishable(draft);
    }

    return this.eventRepository.create({
      ...draft,
      createdById: adminId,
    });
  }

  async update(id: string, input: AdminEventUpdateInput): Promise<Event> {
    const existing = await this.getById(id);
    const status = input.status ?? existing.status;
    const merged = mergedEvent(existing, input, status);

    if (status === "PUBLISHED") {
      assertPublishable(merged);
    }

    return this.eventRepository.update(id, buildUpdateData(input, status));
  }

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    const existing = await this.getById(id);

    if (status === "PUBLISHED") {
      assertPublishable(mergedEvent(existing, {}, status));
    }

    return this.eventRepository.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw ApiError.notFound("Event not found");
    }

    await this.eventRepository.delete(id);
  }
}
