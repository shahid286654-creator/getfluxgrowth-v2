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
