import { z } from "zod";

export const companySettingsSchema = z.object({
  company_name: z.string().trim().optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().optional().or(z.literal("")),
  logo_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
