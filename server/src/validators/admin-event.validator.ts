import { z } from "zod";
import { differenceInUtcDays, parseDateOnly } from "../utils/date";
import { isHttpUrl } from "../utils/url";
import {
  canonicalizeTag,
  isSupportedTag,
  SUPPORTED_TAGS,
} from "../utils/tags";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const trimmedText = (max: number) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).optional();

const technologySchema = z
  .string()
  .trim()
  .min(1, "Technology cannot be empty")
  .max(60, "Technology must be at most 60 characters")
  .transform(canonicalizeTag)
  .refine(isSupportedTag, {
    message: `Unsupported technology. Allowed values: ${SUPPORTED_TAGS.join(", ")}`,
  });

const technologyArray = (field: string) =>
  z
    .array(technologySchema, {
      message: `${field} must be an array of technology names`,
    })
    .max(25, `${field} can contain at most 25 entries`)
    .optional()
    .transform((values) =>
      values === undefined ? undefined : Array.from(new Set(values)),
    );

const urlInput = z
  .union([
    z
      .string()
      .trim()
      .refine(isHttpUrl, "Must be a valid http(s) URL"),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => (value === "" || value === undefined ? value : value));

const dateInput = z
  .union([
    z
      .string()
      .trim()
      .refine((value) => parseDateOnly(value) !== null, {
        message: "Date must be valid and use YYYY-MM-DD format",
      }),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === "" || value === null) return null;
    return parseDateOnly(value);
  });

const timeInput = z
  .union([
    z.string().trim().regex(timePattern, "Time must use HH:MM format"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => (value === "" ? "" : value));

const timezoneInput = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Timezone must be a valid IANA timezone")
  .optional();

const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

const baseShape = {
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(160, "Title must be at most 160 characters"),
  summary: trimmedText(300),
  description: trimmedText(10_000),
  category: trimmedText(60),
  requiredSkills: technologyArray("requiredSkills"),
  interests: technologyArray("interests"),
  bannerUrl: urlInput,
  eventDate: dateInput,
  startTime: timeInput,
  endTime: timeInput,
  timezone: timezoneInput,
  location: trimmedText(160),
  isOnline: z.boolean().optional(),
  registrationUrl: urlInput,
  status: statusSchema.optional(),
};

function validateTimes(
  data: { startTime?: string; endTime?: string },
  ctx: z.RefinementCtx,
) {
  if (
    data.startTime &&
    data.endTime &&
    data.endTime !== "" &&
    data.endTime <= data.startTime
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "End time must be after start time",
    });
  }
}

const baseSchema = z.object(baseShape);

export const adminEventCreateSchema = baseSchema.superRefine(validateTimes);
export const adminEventUpdateSchema = baseSchema
  .partial()
  .superRefine(validateTimes);

export const adminEventStatusSchema = z.object({
  status: statusSchema,
});

export const adminEventListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: statusSchema.optional(),
    category: z.string().trim().max(60).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.search === "") {
      ctx.addIssue({
        code: "custom",
        path: ["search"],
        message: "Search cannot be empty",
      });
    }
  });

export type AdminEventCreateInput = z.infer<typeof adminEventCreateSchema>;
export type AdminEventUpdateInput = z.infer<typeof adminEventUpdateSchema>;
export type AdminEventListQuery = z.infer<typeof adminEventListQuerySchema>;

export function isPastEventDate(eventDate: Date | null): boolean {
  return eventDate ? differenceInUtcDays(eventDate, new Date()) < 0 : false;
}

export function eventDateInFuture(eventDate: Date | null): boolean {
  return eventDate ? differenceInUtcDays(eventDate, new Date()) >= 0 : false;
}
