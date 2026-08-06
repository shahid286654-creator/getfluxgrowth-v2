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
