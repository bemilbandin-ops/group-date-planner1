# Task 6 — Deployment Documentation

## Codex instruction

Write the deployment and operations documentation for the simplified Neon + Vercel rebuild. Complete only this task. Do not add new product features.

## Goal

A new developer or the app owner can deploy the app to Vercel with Neon Postgres using only committed instructions.

## Required files

Create or update:

```text
README.md
.env.example
docs/DEPLOYMENT.md
docs/OPERATIONS.md
```

Keep docs concise and accurate.

## README requirements

Rewrite the README around the simplified v1 product.

Include:

- What the app does.
- What v1 intentionally does not include.
- Tech stack.
- Local setup.
- Database setup.
- Environment variables.
- Drizzle migration commands.
- Run/check commands.
- Deployment link to `docs/DEPLOYMENT.md`.
- Admin notes.
- Privacy note.

## Deployment doc requirements

In `docs/DEPLOYMENT.md`, include:

### 1. Neon setup

- Create a free Neon account/project.
- Create or use the default Postgres database.
- Copy the pooled or standard `DATABASE_URL` connection string.
- Keep `DATABASE_URL` private.

### 2. Local migration setup

Explain how to run migrations against Neon:

```text
npm install
npm run db:migrate
```

If the project uses a different migration command, document the actual command.

### 3. Vercel setup

- Import the GitHub repo.
- Set framework preset to Next.js if needed.
- Set env vars:
  - `NEXT_PUBLIC_SITE_URL`
  - `DATABASE_URL`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`
- Deploy.

### 4. Post-deploy smoke test

Test:

1. Open homepage.
2. Create event.
3. Copy event link.
4. Add suggestion.
5. Vote.
6. Log into admin.
7. Soft-delete test event.
8. Confirm deleted event no longer renders.

### 5. Troubleshooting

Cover common issues:

- Missing env vars.
- Wrong `DATABASE_URL`.
- Migration not run.
- Admin password not working.
- Build failure.
- Database connection limit errors.

## Operations doc requirements

In `docs/OPERATIONS.md`, include:

- How to rotate `ADMIN_PASSWORD`.
- How to rotate `ADMIN_SESSION_SECRET` and what it does to sessions.
- How to rotate Neon database credentials / `DATABASE_URL`.
- How to run Drizzle migrations.
- How to soft-delete events through admin.
- How to inspect database rows manually through Neon or Drizzle Studio.
- Known limitations.

Known limitations to document:

- Anyone with an event link can view event details, names, votes, and suggestions.
- No user accounts.
- No email invite system.
- No realtime updates.
- Login rate limiting may require Vercel/provider protection or an external store if not implemented in code.
- Free hosting/database tiers have usage limits and can change.

## `.env.example` check

Ensure `.env.example` matches the actual code exactly.

It should include:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Do not include obsolete variables.

## Rules

- Do not claim features exist unless they are implemented.
- Do not mention public event listing.
- Do not include real secrets.
- Do not add marketing fluff.
- Do not add new dependencies.
- Do not mention Supabase except possibly in a short note saying the rebuild does not use it.

## Acceptance criteria

- README accurately reflects the simplified app.
- Deployment docs are enough to deploy to Vercel and Neon.
- Operations docs cover secret rotation, migrations, and limitations.
- `.env.example` matches code.
- No obsolete Supabase env vars remain.
- No obsolete `NEXT_PUBLIC_ADMIN_PASSWORD` instructions remain.
- `npm run check` passes if available; otherwise run lint, typecheck, and build separately.

## Stop condition

Stop after docs are accurate. Do not add tests or new features in this task.
