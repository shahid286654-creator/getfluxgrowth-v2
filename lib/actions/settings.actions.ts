"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { companySettingsSchema } from "@/lib/validations/settings";

export type SettingsActionState = {
  error?: string;
  success?: boolean;
};

export async function updateCompanySettings(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const parsed = companySettingsSchema.safeParse({
    company_name: formData.get("company_name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    logo_url: formData.get("logo_url"),
  });

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

  const { error } = await supabase.from("company_settings").upsert(
    {
      owner_id: user.id,
      company_name: parsed.data.company_name || null,
      website: parsed.data.website || null,
      industry: parsed.data.industry || null,
      logo_url: parsed.data.logo_url || null,
    },
    { onConflict: "owner_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function toggleApiKeyConnection(id: string, isConnected: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("api_key_placeholders")
    .update({ is_connected: isConnected })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}
