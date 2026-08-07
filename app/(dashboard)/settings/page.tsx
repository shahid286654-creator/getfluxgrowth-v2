import type { Metadata } from "next";
import { createClient, getUser } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { TabShell, type TabShellItem } from "@/components/shared/tab-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { KeyRound, Puzzle } from "lucide-react";
import { CompanySettingsForm } from "./company-settings-form";
import { ApiKeyRow } from "./api-key-row";
import { IntegrationCard } from "./integration-card";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const user = await getUser();

  const [{ data: companySettings }, { data: apiKeys }, { data: integrations }] =
    await Promise.all([
      user
        ? supabase.from("company_settings").select("*").eq("owner_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("api_key_placeholders")
            .select("*")
            .eq("owner_id", user.id)
            .order("provider")
        : Promise.resolve({ data: [] }),
      supabase.from("integrations").select("*").order("name"),
    ]);

  const tabs: TabShellItem[] = [
    {
      value: "company",
      label: "Company",
      content: <CompanySettingsForm settings={companySettings ?? null} />,
    },
    {
      value: "api-keys",
      label: "API Keys",
      content:
        apiKeys && apiKeys.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {apiKeys.map((apiKey) => (
              <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
            ))}
          </div>
        ) : (
          <EmptyState icon={KeyRound} title="No API keys configured" />
        ),
    },
    {
      value: "integrations",
      label: "Integrations",
      content:
        integrations && integrations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Puzzle} title="No integrations available yet" />
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your company profile, API keys, and integrations."
      />
      <TabShell items={tabs} />
    </>
  );
}
