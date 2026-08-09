"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validations/leads";
import { runWebsiteAudit } from "@/lib/actions/audits.actions";
import type { LeadStatus, PipelineStage } from "@/types";

export type LeadActionState = {
  error?: string;
  success?: boolean;
};

function nullableField(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str === "" ? null : str;
}

function parseLeadForm(formData: FormData) {
  return leadSchema.safeParse({
    company_name: formData.get("company_name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    country: formData.get("country"),
    email: formData.get("email"),
    linkedin_url: formData.get("linkedin_url"),
    notes_summary: formData.get("notes_summary"),
  });
}

export async function createLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const parsed = parseLeadForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      owner_id: user.id,
      company_name: parsed.data.company_name,
      website: nullableField(formData.get("website")),
      industry: nullableField(formData.get("industry")),
      country: nullableField(formData.get("country")),
      email: nullableField(formData.get("email")),
      linkedin_url: nullableField(formData.get("linkedin_url")),
      notes_summary: nullableField(formData.get("notes_summary")),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create lead" };
  }

  // Best-effort automatic audit when the new lead has a website -- never
  // block or fail lead creation if PageSpeed Insights errors out.
  if (parsed.data.website) {
    try {
      const auditForm = new FormData();
      auditForm.set("url", parsed.data.website);
      await runWebsiteAudit(data.id, auditForm);
    } catch {
      // Swallow -- the lead is already created; the audit can be re-run manually.
    }
  }

  revalidatePath("/leads");
  redirect(`/leads/${data.id}`);
}

export async function updateLead(
  id: string,
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const parsed = parseLeadForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      company_name: parsed.data.company_name,
      website: nullableField(formData.get("website")),
      industry: nullableField(formData.get("industry")),
      country: nullableField(formData.get("country")),
      email: nullableField(formData.get("email")),
      linkedin_url: nullableField(formData.get("linkedin_url")),
      notes_summary: nullableField(formData.get("notes_summary")),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true };
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/leads");
  redirect("/leads");
}

export async function changeLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  // status_changed has no DB trigger (only stage_changed does) -- log it here.
  await supabase.from("activities").insert({
    lead_id: id,
    actor_id: user?.id ?? null,
    type: "status_changed",
    description: `Status changed to ${status.replace("_", " ")}`,
    metadata: { to: status },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function changeLeadStage(id: string, stage: PipelineStage) {
  const supabase = await createClient();
  // stage_changed activity is auto-logged by the log_stage_change() DB
  // trigger on leads.pipeline_stage update -- do not insert it manually.
  const { error } = await supabase
    .from("leads")
    .update({ pipeline_stage: stage })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/pipeline");
}
