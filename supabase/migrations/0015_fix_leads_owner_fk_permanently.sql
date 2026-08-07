-- Permanent, idempotent fix for:
--   insert or update on table "leads" violates foreign key
--   constraint "leads_owner_id_fkey"
--
-- Schema audit (no structural change needed -- this confirms intent,
-- it does not alter the constraint):
--   public.leads.owner_id  references  public.profiles.id
--   public.profiles.id     references  auth.users.id
-- This is the correct, standard Supabase pattern (extend auth.users
-- via a public.profiles table; other app tables FK to profiles, not
-- directly to the auth schema). lib/actions/leads.actions.ts already
-- sets owner_id from auth.uid() correctly -- no frontend change
-- needed. The failure happens whenever an authenticated auth.users
-- row has no matching public.profiles row for owner_id to reference,
-- which occurs for any account created before public.profiles (and
-- its sync trigger) existed on this project.
--
-- Safe to run any number of times, in any order relative to earlier
-- migrations: every statement below is additive-only or uses
-- drop-if-exists/create-or-replace, so nothing here can fail because
-- it "already exists" and nothing here deletes or overwrites
-- existing leads/profiles/auth data.
--
-- No begin/commit here (consistent with every other file in this
-- directory) -- deploy_all.sql supplies one outer transaction when
-- concatenating all migrations. Wrap this file's contents in your own
-- begin/commit if pasting it standalone into the SQL Editor.

-- 1. Backfill: give every existing auth.users row a matching profile.
--    Only inserts rows that don't already have one.
insert into public.profiles (id, full_name)
select u.id, u.raw_user_meta_data ->> 'full_name'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2. Sync trigger: auth.users -> public.profiles on every future signup.
--    on conflict do nothing makes this safe against retried signup
--    events or being re-run after a manual backfill.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Re-affirm RLS on the two tables involved in this failure, in
--    case an earlier partial run left either without policies.
--    profiles gets no INSERT policy: rows are only ever created by
--    the SECURITY DEFINER trigger above, which runs as the table
--    owner and bypasses RLS -- the app itself never inserts into
--    profiles directly (confirmed: only a SELECT in
--    app/(dashboard)/layout.tsx).
alter table public.profiles enable row level security;
alter table public.leads enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid () = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);

drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select
  using (auth.uid () = owner_id);

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own"
  on public.leads for insert
  with check (auth.uid () = owner_id);

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own"
  on public.leads for update
  using (auth.uid () = owner_id)
  with check (auth.uid () = owner_id);

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own"
  on public.leads for delete
  using (auth.uid () = owner_id);
