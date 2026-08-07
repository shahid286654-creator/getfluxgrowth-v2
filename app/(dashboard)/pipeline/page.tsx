import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/shared/kanban/kanban-board";

export const metadata: Metadata = { title: "CRM Pipeline" };

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="CRM Pipeline"
        description="Drag leads across stages as deals progress."
      />
      <KanbanBoard initialLeads={leads ?? []} />
    </>
  );
}
