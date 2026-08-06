-- SEO Audit: one row per lead per category.

create table public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  category seo_audit_category not null,
  score integer check (score between 0 and 100),
  status score_status not null default 'needs_improvement',
  summary text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, category)
);

comment on table public.seo_audits is 'SEO audit findings per lead, one row per seo_audit_category.';
