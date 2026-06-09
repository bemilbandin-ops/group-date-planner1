# Task 6 — Deployment Documentation

## Codex instruction

Write the deployment and operations documentation for the simplified rebuild. Complete only this task. Do not add new product features.

## Goal

A new developer or the app owner can deploy the app to Vercel with Supabase using only committed instructions.

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
- Run/check commands.
- Deployment link to `docs/DEPLOYMENT.md`.
- Admin notes.
- Privacy note.

## Deployment doc requirements

In `docs/DEPLOYMENT.md`, include:

### 1. Supabase setup

- Create a Supabase project.
- Run `supabase/migrations/0001_initial_schema.sql`.
- Copy the project URL.
- Copy the service role key.
- Do not expose the service role key publicly.

### 2. Vercel setup

- Import the GitHub repo.
- Set framework preset to Next.js if needed.
- Set env vars:
  - `NEXT_PUBLIC_SITE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`
- Deploy.

### 3. Post-deploy smoke test

Test:

1. Open homepage.
2. Create event.
3. Copy event link.
4. Add suggestion.
5. Vote.
6. Log into admin.
7. Soft-delete test event.
8. Confirm deleted event no longer renders.

### 4. Troubleshooting

Cover common issues:

- Missing env vars.
- Wrong Supabase URL/key.
- Migration not run.
- Admin password not working.
- Build failure.

## Operations doc requirements

In `docs/OPERATIONS.md`, include:

- How to rotate `ADMIN_PASSWORD`.
- How to rotate `ADMIN_SESSION_SECRET` and what it does to sessions.
- How to rotate Supabase service role key.
- How to soft-delete events through admin.
- How to inspect Supabase rows manually.
- Known limitations.

Known limitations to document:

- Anyone with an event link can view event details, names, votes, and suggestions.
- No user accounts.
- No email invite system.
- No realtime updates.
- Login rate limiting may require Vercel/edge/WAF or an external store if not implemented in code.

## `.env.example` check

Ensure `.env.example` matches the actual code exactly.

It should include:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
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

## Acceptance criteria

- README accurately reflects the simplified app.
- Deployment docs are enough to deploy to Vercel and Supabase.
- Operations docs cover secret rotation and limitations.
- `.env.example` matches code.
- No obsolete `NEXT_PUBLIC_ADMIN_PASSWORD` instructions remain.
- `npm run check` passes if available; otherwise run lint, typecheck, and build separately.

## Stop condition

Stop after docs are accurate. Do not add tests or new features in this task.
