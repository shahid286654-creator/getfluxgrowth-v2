"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { noteSchema } from "@/lib/validations/notes";

export type NoteActionState = {
  error?: string;
  success?: boolean;
};

export async function createNote(
  leadId: string,
  _prevState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const parsed = noteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("notes").insert({
    lead_id: leadId,
    author_id: user?.id ?? null,
    body: parsed.data.body,
  });

  if (error) {
    return { error: error.message };
  }

  // note_added has no DB trigger -- log it here.
  await supabase.from("activities").insert({
    lead_id: leadId,
    actor_id: user?.id ?? null,
    type: "note_added",
    description: "Note added",
    metadata: {},
  });

  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

export async function deleteNote(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/leads/${leadId}`);
}
