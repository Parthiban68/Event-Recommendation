import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\//i.test(value),
    "Enter a valid http(s) URL",
  );

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Use YYYY-MM-DD format",
  );

const optionalTime = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
    "Use HH:MM format",
  );

export const adminEventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(160, "Title must be at most 160 characters"),
    summary: z
      .string()
      .trim()
      .max(300, "Summary must be at most 300 characters"),
    description: z
      .string()
      .trim()
      .max(10_000, "Description is too long"),
    category: z.string().trim().max(60, "Category is too long"),
    requiredSkills: z
      .array(z.string())
      .max(25, "Select at most 25 skills"),
    interests: z.array(z.string()).max(25, "Select at most 25 interests"),
    bannerUrl: optionalUrl,
    eventDate: optionalDate,
    startTime: optionalTime,
    endTime: optionalTime,
    timezone: z
      .string()
      .trim()
      .min(1, "Timezone is required")
      .max(64, "Timezone is too long"),
    location: z.string().trim().max(160, "Location is too long"),
    isOnline: z.boolean(),
    registrationUrl: optionalUrl,
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
  });

export type AdminEventFormValues = z.infer<typeof adminEventFormSchema>;
