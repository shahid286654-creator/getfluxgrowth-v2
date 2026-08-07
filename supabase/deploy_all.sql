begin;

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enums

create type lead_status as enum (
  'new',
  'qualified',
  'unqualified',
  'contacted',
  'converted',
  'lost'
);

create type pipeline_stage as enum (
  'new',
  'qualified',
  'contacted',
  'replied',
  'meeting',
  'proposal',
  'won',
  'lost'
);

create type audit_category as enum (
  'performance',
  'mobile',
  'ux',
  'cta',
  'trust',
  'speed',
  'technical_issues'
);

create type seo_audit_category as enum (
  'metadata',
  'headings',
  'schema',
  'internal_links',
  'core_web_vitals',
  'technical_seo'
);

create type score_status as enum (
  'good',
  'needs_improvement',
  'poor'
);

create type ai_opportunity_type as enum (
  'automation',
  'chatbot',
  'crm',
  'email',
  'whatsapp',
  'lead_capture'
);

create type opportunity_impact as enum (
  'low',
  'medium',
  'high'
);

create type opportunity_status as enum (
  'identified',
  'proposed',
  'dismissed'
);

create type outreach_type as enum (
  'email_generator',
  'linkedin_message',
  'follow_up_1',
  'follow_up_2',
  'proposal'
);

create type outreach_status as enum (
  'draft',
  'sent',
  'scheduled',
  'archived'
);

create type activity_type as enum (
  'lead_created',
  'status_changed',
  'stage_changed',
  'email_sent',
  'reply_received',
  'meeting_booked',
  'note_added',
  'audit_completed',
  'outreach_generated'
);

create type integration_status as enum (
  'coming_soon',
  'beta',
  'live'
);

-- public.profiles extends auth.users with app-specific fields.
-- Never add custom columns directly to auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'owner',
  company_name text,
  company_website text,
  company_logo_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user, extending auth.users.';

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

-- Website Audit: one row per lead per category.

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  category audit_category not null,
  score integer check (score between 0 and 100),
  status score_status not null default 'needs_improvement',
  summary text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, category)
);

comment on table public.audits is 'Website audit findings per lead, one row per audit_category.';
comment on column public.audits.details is 'Flexible structured findings for the category, e.g. { "issues": [...] }.';

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

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.notes is 'Free-text notes attached to a lead.';

create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  company_name text,
  website text,
  industry text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.company_settings is 'Agency/company profile shown in Settings > Company.';

create table public.api_key_placeholders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  label text not null,
  masked_value text not null default '••••••••••••',
  is_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.api_key_placeholders is
  'Settings > API Keys placeholder rows. No real secrets are stored here -- '
  'masked_value is decorative until real integrations exist, at which point '
  'actual secrets belong in Supabase Vault, not this table.';

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  status integration_status not null default 'coming_soon',
  icon_name text,
  created_at timestamptz not null default now()
);

comment on table public.integrations is 'Global "coming soon" integration reference cards for Settings > Future Integrations.';

-- updated_at maintenance -----------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create trigger trg_audits_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

create trigger trg_seo_audits_updated_at
  before update on public.seo_audits
  for each row execute function public.set_updated_at();

create trigger trg_ai_opportunities_updated_at
  before update on public.ai_opportunities
  for each row execute function public.set_updated_at();

create trigger trg_outreach_updated_at
  before update on public.outreach
  for each row execute function public.set_updated_at();

create trigger trg_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create trigger trg_company_settings_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

create trigger trg_api_key_placeholders_updated_at
  before update on public.api_key_placeholders
  for each row execute function public.set_updated_at();

-- Auto-create a profile row on signup ------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-log an activity whenever a lead's pipeline stage changes ---------

create or replace function public.log_stage_change()
returns trigger
language plpgsql
as $$
begin
  if new.pipeline_stage is distinct from old.pipeline_stage then
    insert into public.activities (lead_id, actor_id, type, description, metadata)
    values (
      new.id,
      new.owner_id,
      'stage_changed',
      'Stage changed from ' || old.pipeline_stage || ' to ' || new.pipeline_stage,
      jsonb_build_object('from', old.pipeline_stage, 'to', new.pipeline_stage)
    );
  end if;
  return new;
end;
$$;

create trigger trg_leads_log_stage_change
  after update on public.leads
  for each row execute function public.log_stage_change();

-- Auto-log an activity when a lead is first created ----------------------

create or replace function public.log_lead_created()
returns trigger
language plpgsql
as $$
begin
  insert into public.activities (lead_id, actor_id, type, description)
  values (new.id, new.owner_id, 'lead_created', new.company_name || ' was added as a lead');
  return new;
end;
$$;

create trigger trg_leads_log_created
  after insert on public.leads
  for each row execute function public.log_lead_created();

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

-- Single-tenant RLS: every authenticated user only sees rows they own,
-- either directly (owner_id = auth.uid()) or transitively through a
-- lead they own. See the "Team model upgrade path" note at the bottom
-- of this file for how to move to shared/multi-seat access later.

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.audits enable row level security;
alter table public.seo_audits enable row level security;
alter table public.ai_opportunities enable row level security;
alter table public.outreach enable row level security;
alter table public.activities enable row level security;
alter table public.notes enable row level security;
alter table public.company_settings enable row level security;
alter table public.api_key_placeholders enable row level security;
alter table public.integrations enable row level security;

-- profiles ----------------------------------------------------------------

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid () = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);

-- leads ---------------------------------------------------------------------

create policy "leads_select_own"
  on public.leads for select
  using (auth.uid () = owner_id);

create policy "leads_insert_own"
  on public.leads for insert
  with check (auth.uid () = owner_id);

create policy "leads_update_own"
  on public.leads for update
  using (auth.uid () = owner_id)
  with check (auth.uid () = owner_id);

create policy "leads_delete_own"
  on public.leads for delete
  using (auth.uid () = owner_id);

-- child tables scoped via lead ownership ------------------------------------

create policy "audits_all_via_lead_owner"
  on public.audits for all
  using (
    exists (
      select 1 from public.leads l
      where l.id = audits.lead_id and l.owner_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = audits.lead_id and l.owner_id = auth.uid ()
    )
  );

create policy "seo_audits_all_via_lead_owner"
  on public.seo_audits for all
  using (
    exists (
      select 1 from public.leads l
      where l.id = seo_audits.lead_id and l.owner_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = seo_audits.lead_id and l.owner_id = auth.uid ()
    )
  );

create policy "ai_opportunities_all_via_lead_owner"
  on public.ai_opportunities for all
  using (
    exists (
      select 1 from public.leads l
      where l.id = ai_opportunities.lead_id and l.owner_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = ai_opportunities.lead_id and l.owner_id = auth.uid ()
    )
  );

create policy "outreach_all_via_lead_owner"
  on public.outreach for all
  using (
    exists (
      select 1 from public.leads l
      where l.id = outreach.lead_id and l.owner_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = outreach.lead_id and l.owner_id = auth.uid ()
    )
  );

create policy "activities_all_via_lead_owner"
  on public.activities for all
  using (
    lead_id is null
    or exists (
      select 1 from public.leads l
      where l.id = activities.lead_id and l.owner_id = auth.uid ()
    )
  )
  with check (
    lead_id is null
    or exists (
      select 1 from public.leads l
      where l.id = activities.lead_id and l.owner_id = auth.uid ()
    )
  );

create policy "notes_all_via_lead_owner"
  on public.notes for all
  using (
    exists (
      select 1 from public.leads l
      where l.id = notes.lead_id and l.owner_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = notes.lead_id and l.owner_id = auth.uid ()
    )
  );

-- settings tables -------------------------------------------------------

create policy "company_settings_all_own"
  on public.company_settings for all
  using (auth.uid () = owner_id)
  with check (auth.uid () = owner_id);

create policy "api_key_placeholders_all_own"
  on public.api_key_placeholders for all
  using (auth.uid () = owner_id)
  with check (auth.uid () = owner_id);

-- integrations: public read-only reference data, no owner -----------------

create policy "integrations_select_all"
  on public.integrations for select
  using (true);

-- ---------------------------------------------------------------------------
-- Team model upgrade path (not implemented, documented for future reference)
--
-- To move from single-tenant to a shared multi-seat model:
--   1. create table public.agencies (id uuid primary key default gen_random_uuid(), name text);
--   2. create table public.agency_members (
--        agency_id uuid references public.agencies(id) on delete cascade,
--        user_id uuid references public.profiles(id) on delete cascade,
--        role text not null default 'member',
--        primary key (agency_id, user_id)
--      );
--   3. add `agency_id uuid references public.agencies(id)` to public.leads
--      (and optionally keep owner_id as "assigned owner" separate from tenant).
--   4. Replace every `owner_id = auth.uid()` check above with an EXISTS
--      check against agency_members for the row's agency_id, e.g.:
--        exists (
--          select 1 from public.agency_members m
--          where m.agency_id = leads.agency_id and m.user_id = auth.uid()
--        )
--   5. Child-table policies keep their EXISTS-via-lead pattern unchanged,
--      since they already derive authority from the parent lead.
-- ---------------------------------------------------------------------------

commit;
