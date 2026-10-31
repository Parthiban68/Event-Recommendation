import { Router } from "express";
import { getEvent, listEvents } from "../controllers/event.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  eventIdParamSchema,
  eventListQuerySchema,
} from "../validators/event.validator";

export const eventRouter = Router();

eventRouter.get(
  "/",
  validateRequest({ query: eventListQuerySchema }),
  asyncHandler(listEvents),
);

eventRouter.get(
  "/:id",
  validateRequest({ params: eventIdParamSchema }),
  asyncHandler(getEvent),
);
