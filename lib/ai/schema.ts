import { z } from "zod";

export const tutorResponseSchema = z.object({
  answer: z.string(),
  highlights: z
    .array(
      z.object({
        page: z.number(),
        text: z.string(),
      })
    )
    .optional(),
  annotations: z
    .array(
      z.object({
        page: z.number().min(1, "Page number must be >= 1"),
        term: z.string().min(1, "Term must not be empty"),
        annotation: z.string().optional(),
      })
    )
    .optional(),
  citations: z
    .array(
      z.object({
        page: z.number(),
        reference: z.string(),
      })
    )
    .optional(),
});
