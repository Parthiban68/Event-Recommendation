import type { Event, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { startOfUtcDay } from "../utils/date";
import { canonicalizeTag } from "../utils/tags";
import type { AdminEventListQuery } from "../validators/admin-event.validator";
import type {
  EventFilters,
  EventListQuery,
} from "../validators/event.validator";

const MAX_RECOMMENDATION_CANDIDATES = 500;

export interface PaginatedEvents {
  events: Event[];
  total: number;
}

interface WhereOptions {
  publishedOnly?: boolean;
  upcomingOnly?: boolean;
}

function buildWhere(
  filters: EventFilters,
  options: WhereOptions = {},
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};

  if (options.publishedOnly) {
    where.status = "PUBLISHED";
  }

  const today = startOfUtcDay(new Date());
  const lowerBound = options.upcomingOnly
    ? filters.dateFrom && filters.dateFrom > today
      ? filters.dateFrom
      : today
    : filters.dateFrom;

  if (options.publishedOnly || options.upcomingOnly) {
    where.eventDate = { not: null };
  }

  if (lowerBound || filters.dateTo) {
    where.eventDate = {
      ...(where.eventDate as Prisma.DateTimeNullableFilter),
      ...(lowerBound ? { gte: lowerBound } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  if (filters.category) {
    where.category = { equals: filters.category, mode: "insensitive" };
  }

  if (filters.technology) {
    const technology = canonicalizeTag(filters.technology);
    where.OR = [
      { requiredSkills: { has: technology } },
      { interests: { has: technology } },
    ];
  }

  if (filters.search) {
    const search = filters.search;
    const searchConditions: Prisma.EventWhereInput[] = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];

    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  if (typeof filters.isOnline === "boolean") {
    where.isOnline = filters.isOnline;
  }

  return where;
}

export class EventRepository {
  async findMany(query: EventListQuery): Promise<PaginatedEvents> {
    const where = buildWhere(query, {
      publishedOnly: true,
      upcomingOnly: true,
    });
    const skip = (query.page - 1) * query.limit;

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        orderBy: [{ eventDate: "asc" }, { startTime: "asc" }, { title: "asc" }],
        skip,
        take: query.limit,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } });
  }

  async findPublishedById(id: string): Promise<Event | null> {
    return prisma.event.findFirst({
      where: {
        id,
        status: "PUBLISHED",
        eventDate: { not: null },
      },
    });
  }

  async findUpcoming(filters: EventFilters): Promise<Event[]> {
    return prisma.event.findMany({
      where: buildWhere(filters, {
        publishedOnly: true,
        upcomingOnly: true,
      }),
      orderBy: [{ eventDate: "asc" }, { startTime: "asc" }, { title: "asc" }],
      take: MAX_RECOMMENDATION_CANDIDATES,
    });
  }

  async findAdminMany(query: AdminEventListQuery): Promise<PaginatedEvents> {
    const where: Prisma.EventWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.category
        ? { category: { equals: query.category, mode: "insensitive" } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { summary: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
              { category: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { title: "asc" }],
        skip,
        take: query.limit,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  async findRecent(limit = 6): Promise<Event[]> {
    return prisma.event.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  async count(where: Prisma.EventWhereInput = {}): Promise<number> {
    return prisma.event.count({ where });
  }

  async create(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  async update(
    id: string,
    data: Prisma.EventUncheckedUpdateInput,
  ): Promise<Event> {
    return prisma.event.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Event> {
    return prisma.event.delete({ where: { id } });
  }
}
