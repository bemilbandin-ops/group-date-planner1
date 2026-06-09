# Task 7 — Final Verification and Cleanup

## Codex instruction

Perform final verification of the simplified Neon + Vercel rebuild. Complete only this task. Do not add new product features unless they are required to fix broken acceptance criteria.

## Goal

Confirm the app is clean, coherent, buildable, and ready for a Vercel/Neon deployment attempt.

## Verification checklist

### 1. Repository cleanup

Check for accidental files and remove them if present:

- `patch.diff`
- `src/app/create/test.txt`
- `temp_VoteBreakdown.txt`
- `temp_getSortedSuggestions.txt`
- `temp_getVoteCount.txt`
- Debug logs.
- Unused old components.
- Unused old routes.
- Dead Supabase clients or Supabase setup files from the old plan.

### 2. Secret exposure check

Search the codebase for:

- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` usage outside server-only code, config files, and docs.
- `localStorage` admin auth.
- Password comparisons in client components.
- Database imports in client components.

Fix any exposure.

### 3. Public privacy check

Confirm:

- `/` does not fetch or list events.
- Event pages are accessible only by direct link.
- Event metadata does not leak private event title/description unless intentionally changed.
- README says anyone with the link can view event details, names, votes, and suggestions.

### 4. Data integrity check

Confirm:

- Drizzle schema has exactly the intended v1 tables: `events`, `date_suggestions`, and `votes`.
- Drizzle migration exists under `drizzle/`.
- Votes are unique per suggestion and voter name.
- Updating a vote works.
- Suggestions cannot be added to deleted events.
- Votes cannot be submitted for suggestions from another event.
- Soft-deleted events no longer render publicly.

### 5. Admin check

Confirm:

- `/admin` redirects to login when unauthenticated.
- Correct password logs in.
- Wrong password fails.
- Cookie is HTTP-only.
- Logout clears cookie.
- Soft delete works.

### 6. Build checks

Run the available checks:

```text
npm run lint
npm run typecheck
npm run build
```

If `npm run check` exists, run that too.

Fix failures unless they require changing product scope. If scope would change, document the issue instead.

### 7. Manual smoke test

With local `DATABASE_URL` configured and migrations run, test:

1. Open `/`.
2. Go to `/create`.
3. Create test event.
4. Add date suggestion.
5. Vote yes as one name.
6. Vote maybe as same name and confirm it updates.
7. Add second suggestion.
8. Confirm sorting is sensible.
9. Log into `/admin`.
10. Soft-delete test event.
11. Confirm event page no longer renders.

### 8. Docs check

Confirm docs match implementation:

- README.
- `.env.example`.
- `docs/DEPLOYMENT.md`.
- `docs/OPERATIONS.md`.
- `docs/rebuild/README.md`.

## Optional minimal tests

If there is time and it does not add major complexity, add lightweight tests for pure utilities only:

- Validation helpers.
- Vote counts.
- Suggestion sorting.

Do not add full E2E infrastructure in this task unless it already exists.

## Rules

- Do not add accounts.
- Do not add email invites.
- Do not add realtime.
- Do not add a public event directory.
- Do not add Supabase.
- Do not add a large test framework if none exists.
- Prefer fixing broken code over adding more abstraction.

## Acceptance criteria

- Repo has no obvious temporary/debug files.
- No public admin password exists.
- No Supabase env vars or clients remain in rebuild code.
- No `DATABASE_URL` can reach the browser bundle.
- Public pages satisfy the private-by-link model.
- Admin moderation works.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Docs match the actual implementation.

## Stop condition

Stop after verification and cleanup. Summarize what passed, what was fixed, and any remaining deployment risks.
