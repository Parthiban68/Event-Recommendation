import type { Request, Response } from "express";
import type { EventStatus } from "@prisma/client";
import { adminEventService } from "../container";
import { getValidated } from "../middlewares/validate.middleware";
import type {
  AdminEventCreateInput,
  AdminEventListQuery,
  AdminEventUpdateInput,
} from "../validators/admin-event.validator";
import type { EventIdParams } from "../validators/event.validator";

export async function listAdminEvents(
  req: Request,
  res: Response,
): Promise<void> {
  const query = getValidated<AdminEventListQuery>(req, "query");
  const result = await adminEventService.list(query);

  res.status(200).json({
    success: true,
    data: result.events,
    meta: result.pagination,
  });
}

export async function getAdminEvent(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = getValidated<EventIdParams>(req, "params");
  const event = await adminEventService.getById(id);

  res.status(200).json({ success: true, data: event });
}

export async function createAdminEvent(
  req: Request,
  res: Response,
): Promise<void> {
  const input = getValidated<AdminEventCreateInput>(req, "body");
  const event = await adminEventService.create(input, req.admin!.id);

  res.status(201).json({ success: true, data: event });
}

export async function updateAdminEvent(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = getValidated<EventIdParams>(req, "params");
  const input = getValidated<AdminEventUpdateInput>(req, "body");
  const event = await adminEventService.update(id, input);

  res.status(200).json({ success: true, data: event });
}

export async function updateAdminEventStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = getValidated<EventIdParams>(req, "params");
  const { status } = getValidated<{ status: EventStatus }>(req, "body");
  const event = await adminEventService.updateStatus(id, status);

  res.status(200).json({ success: true, data: event });
}

export async function deleteAdminEvent(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = getValidated<EventIdParams>(req, "params");
  await adminEventService.delete(id);

  res.status(200).json({ success: true, data: { deleted: true } });
}
