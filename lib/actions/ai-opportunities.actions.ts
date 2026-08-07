"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aiOpportunitySchema } from "@/lib/validations/ai-opportunities";
import type { OpportunityStatus } from "@/types";

export type OpportunityActionState = {
  error?: string;
  success?: boolean;
};

export async function createOpportunity(
  _prevState: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const parsed = aiOpportunitySchema.safeParse({
    lead_id: formData.get("lead_id"),
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    impact: formData.get("impact"),
    estimated_value: formData.get("estimated_value"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ai_opportunities").insert({
    lead_id: parsed.data.lead_id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description || null,
    impact: parsed.data.impact,
    estimated_value: parsed.data.estimated_value || null,
  });

  if (error) {
    return { error: error.message };
  }

  // No ActivityType maps cleanly to "opportunity identified" -- intentionally
  // not logged to the activity feed.
  revalidatePath("/ai-opportunities");
  revalidatePath(`/leads/${parsed.data.lead_id}`);
  return { success: true };
}

export async function updateOpportunityStatus(
  id: string,
  leadId: string,
  status: OpportunityStatus
) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_opportunities").update({ status }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/ai-opportunities");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteOpportunity(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_opportunities").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/ai-opportunities");
  revalidatePath(`/leads/${leadId}`);
}
