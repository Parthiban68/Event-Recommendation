import { z } from "zod";
import { parseDateOnly } from "../utils/date";
import { isHttpUrl } from "../utils/url";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .transform((value) => value || undefined);

const optionalDate = (field: string) =>
  z
    .string()
    .trim()
    .refine((value) => parseDateOnly(value) !== null, {
      message: `${field} must be a valid date in YYYY-MM-DD format`,
    })
    .transform((value) => parseDateOnly(value) as Date)
    .optional();

const eventFilterShape = {
  search: optionalText(100),
  category: optionalText(60),
  technology: optionalText(60),
  dateFrom: optionalDate("dateFrom"),
  dateTo: optionalDate("dateTo"),
  isOnline: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true")
    .optional(),
};

function validateDateRange(
  data: { dateFrom?: Date; dateTo?: Date },
  ctx: z.RefinementCtx,
) {
  if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
    ctx.addIssue({
      code: "custom",
      path: ["dateTo"],
      message: "dateTo must be on or after dateFrom",
    });
  }
}

export const eventFilterSchema = z
  .object(eventFilterShape)
  .superRefine(validateDateRange);

export const eventListQuerySchema = z
  .object({
    page: z.coerce
      .number({ message: "page must be a number" })
      .int("page must be an integer")
      .min(1, "page must be at least 1")
      .default(1),
    limit: z.coerce
      .number({ message: "limit must be a number" })
      .int("limit must be an integer")
      .min(1, "limit must be at least 1")
      .max(50, "limit must be at most 50")
      .default(9),
    ...eventFilterShape,
  })
  .superRefine(validateDateRange);

export const eventIdParamSchema = z.object({
  id: z.string().uuid("Event id must be a valid UUID"),
});

export const registrationUrlSchema = z
  .string()
  .trim()
  .min(1, "registrationUrl is required")
  .refine(isHttpUrl, "registrationUrl must be a valid http(s) URL");

export interface EventFilters {
  search?: string;
  category?: string;
  technology?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isOnline?: boolean;
}

export type EventListQuery = z.infer<typeof eventListQuerySchema>;
export type EventIdParams = z.infer<typeof eventIdParamSchema>;
