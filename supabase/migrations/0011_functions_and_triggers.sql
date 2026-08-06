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
