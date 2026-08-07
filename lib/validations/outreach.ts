import { z } from "zod";

export const outreachSchema = z.object({
  lead_id: z.string().uuid("Select a lead"),
  type: z.enum(["email_generator", "linkedin_message", "follow_up_1", "follow_up_2", "proposal"]),
  subject: z.string().trim().optional().or(z.literal("")),
  body: z.string().trim().optional().or(z.literal("")),
});

export type OutreachInput = z.infer<typeof outreachSchema>;
