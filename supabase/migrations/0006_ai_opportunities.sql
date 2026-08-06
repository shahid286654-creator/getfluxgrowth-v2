-- Identified automation/AI opportunities per lead. Kept separate from
-- `activities` (an append-only event log) since opportunities are
-- structured records queried by type/impact/status, not timeline events.

create table public.ai_opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  type ai_opportunity_type not null,
  title text not null,
  description text,
  impact opportunity_impact not null default 'medium',
  estimated_value text,
  status opportunity_status not null default 'identified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_opportunities is 'Automation/AI opportunities identified for a lead (chatbot, CRM, email, WhatsApp, lead capture, etc.).';
comment on column public.ai_opportunities.estimated_value is 'Free-text estimated value/impact, e.g. "$500-1200/mo".';
