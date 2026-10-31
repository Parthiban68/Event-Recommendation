import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    ApiError.notFound(`Route ${req.method} ${req.originalUrl} was not found`),
  );
};
