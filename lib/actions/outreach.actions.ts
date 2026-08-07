"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { outreachSchema } from "@/lib/validations/outreach";
import type { OutreachStatus } from "@/types";

export type OutreachActionState = {
  error?: string;
  success?: boolean;
};

function parseOutreachForm(formData: FormData) {
  return outreachSchema.safeParse({
    lead_id: formData.get("lead_id"),
    type: formData.get("type"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
}

export async function createOutreachDraft(
  _prevState: OutreachActionState,
  formData: FormData
): Promise<OutreachActionState> {
  const parsed = parseOutreachForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("outreach").insert({
    lead_id: parsed.data.lead_id,
    owner_id: user?.id ?? null,
    type: parsed.data.type,
    subject: parsed.data.subject || null,
    body: parsed.data.body || null,
    status: "draft",
  });

  if (error) {
    return { error: error.message };
  }

  // outreach_generated has no DB trigger -- log it here.
  await supabase.from("activities").insert({
    lead_id: parsed.data.lead_id,
    actor_id: user?.id ?? null,
    type: "outreach_generated",
    description: "Outreach draft created",
    metadata: { outreach_type: parsed.data.type },
  });

  revalidatePath("/outreach");
  revalidatePath(`/leads/${parsed.data.lead_id}`);
  return { success: true };
}

export async function updateOutreach(
  id: string,
  leadId: string,
  _prevState: OutreachActionState,
  formData: FormData
): Promise<OutreachActionState> {
  const parsed = parseOutreachForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("outreach")
    .update({
      type: parsed.data.type,
      subject: parsed.data.subject || null,
      body: parsed.data.body || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/outreach");
  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

export async function markOutreachSent(id: string, leadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("outreach")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // email_sent has no DB trigger -- log it here (reused generically for
  // any outreach channel, not just email).
  await supabase.from("activities").insert({
    lead_id: leadId,
    actor_id: user?.id ?? null,
    type: "email_sent",
    description: "Outreach marked as sent",
    metadata: {},
  });

  revalidatePath("/outreach");
  revalidatePath(`/leads/${leadId}`);
}

export async function updateOutreachStatus(id: string, leadId: string, status: OutreachStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("outreach").update({ status }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/outreach");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteOutreach(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("outreach").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/outreach");
  revalidatePath(`/leads/${leadId}`);
}
