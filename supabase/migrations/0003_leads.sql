create table public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  company_name text not null,
  website text,
  industry text,
  country text,
  email text,
  linkedin_url text,
  status lead_status not null default 'new',
  pipeline_stage pipeline_stage not null default 'new',
  notes_summary text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is 'Prospective agency clients tracked through acquisition and the CRM pipeline.';
comment on column public.leads.source is 'Origin of the lead, e.g. manual, import. Future: scraper.';
