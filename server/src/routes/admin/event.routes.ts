import { Router } from "express";
import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvent,
  listAdminEvents,
  updateAdminEvent,
  updateAdminEventStatus,
} from "../../controllers/admin-event.controller";
import { requireCsrf } from "../../middlewares/csrf.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  adminEventCreateSchema,
  adminEventListQuerySchema,
  adminEventStatusSchema,
  adminEventUpdateSchema,
} from "../../validators/admin-event.validator";
import { eventIdParamSchema } from "../../validators/event.validator";

export const adminEventRouter = Router();

adminEventRouter.use(requireCsrf);

adminEventRouter.get(
  "/",
  validateRequest({ query: adminEventListQuerySchema }),
  asyncHandler(listAdminEvents),
);

adminEventRouter.post(
  "/",
  validateRequest({ body: adminEventCreateSchema }),
  asyncHandler(createAdminEvent),
);

adminEventRouter.get(
  "/:id",
  validateRequest({ params: eventIdParamSchema }),
  asyncHandler(getAdminEvent),
);

adminEventRouter.put(
  "/:id",
  validateRequest({ params: eventIdParamSchema, body: adminEventUpdateSchema }),
  asyncHandler(updateAdminEvent),
);

adminEventRouter.patch(
  "/:id/status",
  validateRequest({
    params: eventIdParamSchema,
    body: adminEventStatusSchema,
  }),
  asyncHandler(updateAdminEventStatus),
);

adminEventRouter.delete(
  "/:id",
  validateRequest({ params: eventIdParamSchema }),
  asyncHandler(deleteAdminEvent),
);
