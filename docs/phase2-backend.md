# VestaOS Phase 2 — Backend + Auth Runbook

Step-by-step to flip the localStorage prototype onto Supabase + a real API.
Code is already staged (`storage-remote.ts`, adapter selection in `storage.ts`,
`/api/*` route stubs). This runbook is the external-account side + the SQL.

Owner: Ohm. Reviewed by Chombi. See `Agent-OpenClaw/vestaos-phase2-plan.md`.

---

## 0. Prereqs

- Supabase account (free tier).
- Vercel account (free tier) — or decide to self-host.
- Node deps: `npm i @supabase/supabase-js @supabase/ssr`

---

## 1. Create the Supabase project

1. New project → note the **Project URL** and **anon key** (Settings → API).
2. Copy `.env.local.example` → `.env.local`, fill:
   - `NEXT_PUBLIC_VESTAOS_BACKEND=remote`
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...` (server-only; migration script)

---

## 2. Schema (SQL editor)

Mirrors the app entities exactly. `owner_id` ties rows to `auth.users`.

```sql
-- profiles: role lives here (admin | user)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

create table properties (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  name text not null,
  address text not null,
  type text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tenants (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  property_id text not null,
  name text not null,
  email text,
  phone text,
  unit text,
  lease_start date,
  lease_end date,
  rent numeric,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leases (
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

create table payments (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  lease_id text,
  tenant_id text,
  period_start date,
  period_end date,
  amount numeric,
  late_fee numeric default 0,
  late_fee_waived boolean default false,
  type text,
  method text,
  status text,
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table maintenance_requests (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  property_id text not null,
  title text not null,
  description text,
  priority text,
  status text,
  status_history jsonb not null default '[]',
  cost numeric,
  submitted date,
  resolved date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 3. Row-Level Security

Enable RLS on every table; owner sees own rows; admins see all.

```sql
alter table properties          enable row level security;
alter table tenants             enable row level security;
alter table leases              enable row level security;
alter table payments            enable row level security;
alter table maintenance_requests enable row level security;
alter table profiles            enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Owner-or-admin full access, per table (repeat the pattern).
create policy own_properties on properties
  for all using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid());

-- ...repeat `create policy own_<table>` for tenants, leases, payments,
-- maintenance_requests with the same predicate (swap table name).

create policy own_profile on profiles
  for select using (id = auth.uid() or is_admin());
```

First user: after signing up once, promote to admin:
```sql
update profiles set role = 'admin' where id = '<their-auth-uid>';
```

---

## 4. Flip the app

1. Ensure `.env.local` has `NEXT_PUBLIC_VESTAOS_BACKEND=remote`.
2. Remove `output: "export"` from `next.config.ts` (and drop basePath/
   assetPrefix if deploying to a real origin like Vercel).
3. `npm run build && npm start` (or deploy to Vercel).

The store calls `remoteStorage.hydrate()` on mount (see context.tsx wiring
note) — the adapter loads `/api/state` from the backend.

---

## 5. Migrate existing local data

In the old browser session:
1. Open DevTools → Application → Local Storage → copy `vestaos-state` value.
2. Save it to `migration/vestaos-state.json`.
3. Run:
   ```
   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
   node scripts/migrate-local-to-remote.mjs migration/vestaos-state.json <owner-uuid>
   ```
4. Verify counts match (properties/tenants/leases/payments/maintenance).
   **Do not** clear localStorage until the remote round-trip is confirmed.

---

## 6. Auth + 2FA (Ohm)

- `/login` page → `supabase.auth.signInWithPassword`.
- Middleware guards all app routes → redirect to `/login` when no session.
- Settings → Security tab → TOTP enroll/verify (`supabase.auth.mfa.*`).
- Sign-out in the app shell menu.

---

## 7. QA (Surge)

- [ ] Login → session persists across reload.
- [ ] TOTP enroll → verify → required on next login.
- [ ] Two devices show identical data after an edit.
- [ ] `user`-role account cannot read/write another owner's rows (prove it).
- [ ] Migration: entity counts match local, field-for-field.
- [ ] No hydration warnings (#418) on the new auth-aware render path.
