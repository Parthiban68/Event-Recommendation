import type { Request, Response } from "express";
import { eventService } from "../container";
import {
  getValidated,
} from "../middlewares/validate.middleware";
import type {
  EventIdParams,
  EventListQuery,
} from "../validators/event.validator";

export async function listEvents(req: Request, res: Response): Promise<void> {
  const query = getValidated<EventListQuery>(req, "query");
  const result = await eventService.listEvents(query);

  res.status(200).json({
    success: true,
    data: result.events,
    meta: result.pagination,
  });
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<EventIdParams>(req, "params");
  const event = await eventService.getEventById(id);

  res.status(200).json({ success: true, data: event });
}
