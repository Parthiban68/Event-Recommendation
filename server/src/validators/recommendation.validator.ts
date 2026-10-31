import { z } from "zod";
import { canonicalizeTag, isSupportedTag, SUPPORTED_TAGS } from "../utils/tags";
import { eventFilterSchema } from "./event.validator";

const candidateTagSchema = z
  .string()
  .trim()
  .min(1, "Technology cannot be empty")
  .max(60, "Technology must be at most 60 characters")
  .transform(canonicalizeTag)
  .refine(isSupportedTag, {
    message: `Unsupported technology. Allowed values: ${SUPPORTED_TAGS.join(", ")}`,
  });

function tagArray(field: string) {
  return z
    .array(candidateTagSchema, {
      message: `${field} must be an array of technology names`,
    })
    .max(25, `${field} can contain at most 25 entries`)
    .default([])
    .transform((values) => Array.from(new Set(values)));
}

export const recommendationRequestSchema = z.object({
  skills: tagArray("skills"),
  interests: tagArray("interests"),
  filters: eventFilterSchema.optional(),
});

export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;
