import { z } from "zod";

export const aiOpportunitySchema = z.object({
  lead_id: z.string().uuid("Select a lead"),
  type: z.enum(["automation", "chatbot", "crm", "email", "whatsapp", "lead_capture"]),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  impact: z.enum(["low", "medium", "high"]),
  estimated_value: z.string().trim().optional().or(z.literal("")),
});

export type AiOpportunityInput = z.infer<typeof aiOpportunitySchema>;
