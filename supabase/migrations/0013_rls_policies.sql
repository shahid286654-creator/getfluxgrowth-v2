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
