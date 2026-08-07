"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteAudit(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("audits").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/website-audit");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteSeoAudit(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("seo_audits").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/seo-audit");
  revalidatePath(`/leads/${leadId}`);
}
