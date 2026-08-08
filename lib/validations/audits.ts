import { z } from "zod";

export const auditSchema = z.object({
  score: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 100),
      "Score must be a whole number between 0 and 100"
    ),
  summary: z.string().trim().max(2000, "Summary is too long"),
  issues: z.string().trim().max(2000, "Issues list is too long"),
});

export type AuditInput = z.infer<typeof auditSchema>;
