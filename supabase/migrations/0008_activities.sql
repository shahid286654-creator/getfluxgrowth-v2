-- Append-only timeline feeding Dashboard "Recent Activity" and the
-- Lead Details "Activity" tab.

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type activity_type not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.activities is 'Append-only event log for the dashboard and per-lead activity timeline.';
comment on column public.activities.lead_id is 'Nullable to allow future account-level (non-lead) events.';
