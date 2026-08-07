-- Fixes "insert or update on table leads violates foreign key
-- constraint leads_owner_id_fkey" for any auth.users row that
-- predates public.profiles / the on_auth_user_created trigger (e.g.
-- accounts created before 0002_profiles.sql / 0011_functions_and_
-- triggers.sql were ever run against this project). Backfill is
-- additive only -- it never touches an existing profiles row.

insert into public.profiles (id, full_name)
select u.id, u.raw_user_meta_data ->> 'full_name'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Make handle_new_user idempotent so a retried/duplicate signup event
-- can never violate profiles' primary key and block auth.users
-- insert.
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

-- Re-create defensively in case this project's on_auth_user_created
-- trigger is missing or stale (drop/create since Postgres has no
-- "create trigger if not exists").
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
