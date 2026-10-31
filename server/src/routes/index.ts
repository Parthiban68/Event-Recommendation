import { Router } from "express";
import { adminRouter } from "./admin";
import { eventRouter } from "./event.routes";
import { healthRouter } from "./health.routes";
import { recommendationRouter } from "./recommendation.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/events", eventRouter);
apiRouter.use("/recommendations", recommendationRouter);
apiRouter.use("/admin", adminRouter);
