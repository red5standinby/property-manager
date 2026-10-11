-- ─── VestaOS Phase 2 schema (Supabase / Postgres) ────────────────────
--
-- Mirrors the app's AppState entities exactly. `owner_id` ties every row to
-- auth.users. IDs are app-generated TEXT (nanoid-style) so local data can be
-- migrated up 1:1 without remapping.
--
-- Run this in the Supabase SQL editor after creating the project.

-- ── profiles: app role (admin | user) keyed to the auth user ──
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row on signup.
create or replace function handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── entities ──
create table if not exists properties (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  name text not null,
  address text not null,
  type text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenants (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  name text not null,
  email text,
  phone text,
  property_id text not null,
  unit text,
  lease_start date,
  lease_end date,
  rent numeric,
  status text,
  since text,
  lease_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leases (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  property_id text not null,
  unit text,
  tenant_ids jsonb not null default '[]',
  start_date date,
  end_date date,
  rent numeric,
  term text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  lease_id text,
  tenant_id text,
  property_id text,
  period_start date,
  period_end date,
  amount numeric,
  late_fee numeric default 0,
  late_fee_waived boolean default false,
  type text,
  method text,
  status text,
  paid_at text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists maintenance_requests (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  unit text,
  tenant_id text,
  property_id text not null,
  priority text,
  status text,
  category text,
  submitted date,
  status_history jsonb not null default '[]',
  cost numeric,
  resolved_at text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Row-Level Security ──
alter table profiles             enable row level security;
alter table properties           enable row level security;
alter table tenants              enable row level security;
alter table leases               enable row level security;
alter table payments             enable row level security;
alter table maintenance_requests enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Owner-or-admin full access, repeated per table. Users may only create rows
-- they own (with check), but admins can read/update everything in the org.
do $$
declare t text;
begin
  foreach t in array array[
    'properties','tenants','leases','payments','maintenance_requests'
  ] loop
    execute format($f$
      drop policy if exists own_%1$s on %1$s;
      create policy own_%1$s on %1$s
        for all
        using (owner_id = auth.uid() or is_admin())
        with check (owner_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- Profiles: a user sees their own; admins see all. Profile rows are created
-- by the signup trigger, so no client insert policy is needed.
drop policy if exists own_profiles_select on profiles;
create policy own_profiles_select on profiles
  for select using (id = auth.uid() or is_admin());

-- ── Promote the first user to admin (run manually after signup) ──
-- update profiles set role = 'admin' where id = '<their-auth-uid>';
