-- Support URL-only (lead-less) manual website/SEO audits, alongside the
-- existing lead-linked audits. lead_id becomes optional; a new owner_id
-- column scopes ownership for the rows that have no lead to derive it
-- from. Lead-linked rows are unaffected -- owner_id stays null for them
-- and RLS keeps deriving ownership via the lead as before.

alter table public.audits
  alter column lead_id drop not null,
  add column owner_id uuid references public.profiles (id) on delete cascade;

comment on column public.audits.lead_id is 'Null for URL-only manual audits not tied to a lead.';
comment on column public.audits.owner_id is 'Set only for lead-less audits; lead-linked audits derive ownership via lead_id instead.';

alter table public.seo_audits
  alter column lead_id drop not null,
  add column owner_id uuid references public.profiles (id) on delete cascade;

comment on column public.seo_audits.lead_id is 'Null for URL-only manual audits not tied to a lead.';
comment on column public.seo_audits.owner_id is 'Set only for lead-less audits; lead-linked audits derive ownership via lead_id instead.';

-- Replace the lead-only RLS policies with versions that also cover
-- owner-scoped lead-less rows (mirrors leads_*_own's auth.uid() = owner_id
-- check, just conditional on lead_id being null).

drop policy if exists "audits_all_via_lead_owner" on public.audits;
create policy "audits_all_via_owner"
  on public.audits for all
  using (
    (lead_id is not null and exists (
      select 1 from public.leads l
      where l.id = audits.lead_id and l.owner_id = auth.uid ()
    ))
    or (lead_id is null and owner_id = auth.uid ())
  )
  with check (
    (lead_id is not null and exists (
      select 1 from public.leads l
      where l.id = audits.lead_id and l.owner_id = auth.uid ()
    ))
    or (lead_id is null and owner_id = auth.uid ())
  );

drop policy if exists "seo_audits_all_via_lead_owner" on public.seo_audits;
create policy "seo_audits_all_via_owner"
  on public.seo_audits for all
  using (
    (lead_id is not null and exists (
      select 1 from public.leads l
      where l.id = seo_audits.lead_id and l.owner_id = auth.uid ()
    ))
    or (lead_id is null and owner_id = auth.uid ())
  )
  with check (
    (lead_id is not null and exists (
      select 1 from public.leads l
      where l.id = seo_audits.lead_id and l.owner_id = auth.uid ()
    ))
    or (lead_id is null and owner_id = auth.uid ())
  );
