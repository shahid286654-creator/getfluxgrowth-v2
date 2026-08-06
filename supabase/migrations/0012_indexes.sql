create index idx_leads_owner_id on public.leads (owner_id);
create index idx_leads_status on public.leads (status);
create index idx_leads_pipeline_stage on public.leads (pipeline_stage);
create index idx_leads_created_at on public.leads (created_at desc);
create index idx_leads_company_name_trgm on public.leads using gin (company_name gin_trgm_ops);

create index idx_audits_lead_id on public.audits (lead_id);
create index idx_seo_audits_lead_id on public.seo_audits (lead_id);
create index idx_ai_opportunities_lead_id on public.ai_opportunities (lead_id);

create index idx_outreach_lead_id on public.outreach (lead_id);
create index idx_outreach_owner_id on public.outreach (owner_id);

create index idx_activities_lead_id on public.activities (lead_id);
create index idx_activities_created_at on public.activities (created_at desc);

create index idx_notes_lead_id on public.notes (lead_id);

create index idx_api_key_placeholders_owner_id on public.api_key_placeholders (owner_id);
