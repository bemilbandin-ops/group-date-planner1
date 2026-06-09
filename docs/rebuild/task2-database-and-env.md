# Task 2 — Database and Environment

## Codex instruction

Add the Neon/Postgres database schema, Drizzle configuration, environment variable contract, and server-only database client. Complete only this task. Do not build public pages, admin flows, or voting UI yet.

## Goal

Make the data model reproducible and easy to deploy on Vercel with a free Neon Postgres database.

## Database choice

Use regular PostgreSQL through `DATABASE_URL`.

Preferred provider for v1:

- Neon Free Postgres.

Also acceptable:

- Vercel Postgres, if it provides a compatible `DATABASE_URL`.

Do not use Supabase in the rebuild.

## Install dependencies

Install these if they are not already present:

```text
drizzle-orm
postgres
drizzle-kit
```

`drizzle-kit` should be a dev dependency.

## Required files

Create or update:

```text
drizzle.config.ts
.env.example
src/db/schema.ts
src/db/index.ts
src/lib/env.ts
src/lib/types.ts
```

The exact paths may differ if the project already has a better convention, but keep the structure simple.

## Environment variables

Create `.env.example` with:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Do not use any Supabase variables.

Remove obsolete references to:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`

## Drizzle config

Create `drizzle.config.ts` using `drizzle-kit`.

Requirements:

- Schema path: `./src/db/schema.ts`
- Migrations output folder: `./drizzle`
- Dialect: PostgreSQL
- Credentials from `DATABASE_URL`

## Schema requirements

Create this schema in `src/db/schema.ts`.

Use three tables only:

1. `events`
2. `date_suggestions`
3. `votes`

### `events`

Columns:

- `id uuid primary key defaultRandom()`
- `title text not null`
- `description text null`
- `created_at timestamp with timezone not null defaultNow()`
- `deleted_at timestamp with timezone null`

Constraints:

- title length between 1 and 120.
- description is null or max 500 characters.

Indexes:

- created_at index.
- deleted_at index.

### `date_suggestions`

Columns:

- `id uuid primary key defaultRandom()`
- `event_id uuid not null references events(id) on delete cascade`
- `date date not null`
- `time time null`
- `suggested_by text not null`
- `created_at timestamp with timezone not null defaultNow()`

Constraints:

- suggested_by length between 1 and 80.

Indexes:

- event_id index.
- date index.

### `votes`

Columns:

- `id uuid primary key defaultRandom()`
- `suggestion_id uuid not null references date_suggestions(id) on delete cascade`
- `voter_name text not null`
- `choice text not null`
- `created_at timestamp with timezone not null defaultNow()`

Constraints:

- voter_name length between 1 and 80.
- choice in `yes`, `maybe`, `no`.
- unique vote per suggestion and voter name: `unique (suggestion_id, voter_name)`.

Indexes:

- suggestion_id index.

## Migration scripts

In `package.json`, add scripts equivalent to:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

If the exact Drizzle CLI commands differ for the installed version, use the correct current commands.

## Generate initial migration

Generate and commit the initial Drizzle migration under:

```text
drizzle/
```

Do not rely only on TypeScript schema. The repo should contain the generated SQL migration.

## `src/lib/env.ts`

Create a small helper that validates required environment variables.

Rules:

- `NEXT_PUBLIC_SITE_URL` may be public.
- `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are server-only.
- Throw a clear error if a required server variable is missing when server code asks for it.

## `src/db/index.ts`

Create a server-only database client.

Requirements:

- Import `server-only`.
- Use `postgres` package.
- Use `drizzle-orm/postgres-js`.
- Use `DATABASE_URL` from the env helper.
- Export `db` or `getDb()`.
- Do not import this file from client components.

## Type alignment

Update `src/lib/types.ts` to match the database shape. Manual types are fine for v1.

## Rules

- No Supabase.
- No browser-side database access.
- No user accounts.
- No realtime.
- No UI mutations in this task.
- No public event listing.

## Acceptance criteria

- `drizzle.config.ts` exists.
- `src/db/schema.ts` defines the three tables.
- Initial Drizzle migration exists under `drizzle/`.
- `.env.example` contains only the required variables above unless another existing variable is truly required.
- No Supabase package or env var is required by the rebuild code.
- `src/db/index.ts` imports `server-only`.
- `npm run typecheck` passes.
- `npm run build` passes without actual env vars unless database code is executed at build time.

## Stop condition

Stop after the database and environment foundation are in place. Do not implement event pages or forms yet.
