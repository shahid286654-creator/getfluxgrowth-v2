import { z } from "zod";

export const noteSchema = z.object({
  body: z.string().trim().min(1, "Note can't be empty"),
});

export type NoteInput = z.infer<typeof noteSchema>;
