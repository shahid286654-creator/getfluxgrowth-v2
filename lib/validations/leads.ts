import { z } from "zod";

export const leadSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  linkedin_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  notes_summary: z.string().trim().optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
