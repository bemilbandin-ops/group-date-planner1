# Task 2 — Database and Environment

## Codex instruction

Add the Supabase database schema, environment variable contract, and server-only Supabase client. Complete only this task. Do not build public pages, admin flows, or voting UI yet.

## Goal

Make the data model reproducible and deployment-friendly.

## Database model

Use three tables only:

1. `events`
2. `date_suggestions`
3. `votes`

Use private-by-link rooms. There is no public event directory.

## Required files

Create or update:

```text
supabase/migrations/0001_initial_schema.sql
.env.example
src/lib/env.ts
src/lib/supabaseServer.ts
src/lib/types.ts
```

## Schema requirements

Create this schema:

### `events`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `title text not null`
- `description text null`
- `created_at timestamptz not null default now()`
- `deleted_at timestamptz null`

Constraints:

- title length between 1 and 120.
- description is null or max 500 characters.

Indexes:

- `events_created_at_idx` on `created_at desc`.
- `events_deleted_at_idx` on `deleted_at`.

### `date_suggestions`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `event_id uuid not null references events(id) on delete cascade`
- `date date not null`
- `time time null`
- `suggested_by text not null`
- `created_at timestamptz not null default now()`

Constraints:

- suggested_by length between 1 and 80.

Indexes:

- `date_suggestions_event_id_idx` on `event_id`.
- `date_suggestions_date_idx` on `date`.

### `votes`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `suggestion_id uuid not null references date_suggestions(id) on delete cascade`
- `voter_name text not null`
- `choice text not null`
- `created_at timestamptz not null default now()`

Constraints:

- voter_name length between 1 and 80.
- choice in `yes`, `maybe`, `no`.
- unique vote per suggestion and voter name: `unique (suggestion_id, voter_name)`.

Indexes:

- `votes_suggestion_id_idx` on `suggestion_id`.

## RLS decision

For v1, keep all database access server-mediated.

In the migration:

- Enable RLS on all tables.
- Do not add permissive public policies.
- Do not allow browser clients to directly insert, update, delete, or list data.

The server can use `SUPABASE_SERVICE_ROLE_KEY` from server-only code. Never expose this key to the browser.

## Environment variables

Create `.env.example` with:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Do not use `NEXT_PUBLIC_ADMIN_PASSWORD`.

## `src/lib/env.ts`

Create a small helper that validates required server environment variables.

Rules:

- `NEXT_PUBLIC_SITE_URL` may be public.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are server-only.
- Throw a clear error if a required server variable is missing when server code asks for it.

## `src/lib/supabaseServer.ts`

Create a server-only Supabase client factory.

Requirements:

- Import `server-only`.
- Use `createClient` from `@supabase/supabase-js`.
- Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Export a function such as `getSupabaseAdmin()`.

Install `@supabase/supabase-js` if it is not already installed.

## Type alignment

Update `src/lib/types.ts` to match the database shape. Keep manually written types for now; do not generate Supabase types in v1.

## Rules

- Do not put service role keys in client components.
- Do not use Supabase from browser code.
- Do not add Supabase Auth.
- Do not add realtime.
- Do not implement UI mutations in this task.

## Acceptance criteria

- Migration file exists and is complete.
- `.env.example` exists and contains only the variables above unless another existing variable is truly required.
- No `NEXT_PUBLIC_ADMIN_PASSWORD` exists.
- `src/lib/supabaseServer.ts` imports `server-only`.
- `npm run typecheck` passes.
- `npm run build` still passes without actual env vars unless server-only Supabase code is not executed at build time.

## Stop condition

Stop after the schema and server Supabase foundation are in place. Do not implement event pages or forms yet.
