create table public.outreach (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  type outreach_type not null,
  subject text,
  body text,
  status outreach_status not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.outreach is 'Outreach drafts/messages per lead: email, LinkedIn, follow-ups, proposals.';
