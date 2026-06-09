# Codex Task 02: Privacy Model and Data Layer

## Goal

Make event data private-by-link for v1 and make database setup repeatable from committed files.

Start this task only after `01-codex-build-green.md` is complete.

## Context

The product implies shareable planning rooms, but the pre-launch review found that the homepage currently lists recent events publicly. It also found that README setup references schema guidance that is not production-safe or not fully committed.

Recommended v1 model: **private-by-link anonymous rooms**.

- Events are not listed publicly.
- Anyone with the link can view, vote, and suggest dates.
- No user accounts are required for v1.
- Admin moderation/deletion is handled through protected admin functionality in a later task.

## Instructions for Codex

1. Confirm the app currently builds before changes.
2. Implement the private-by-link model for public pages.
3. Add committed Supabase schema/migration files.
4. Replace permissive RLS guidance with production-safe setup notes.
5. Keep this task focused on homepage privacy and database setup. Do not implement admin auth or rate limiting here.

## Required Changes

### 1. Remove public event listing from the homepage

Update the root page `/` so it does not fetch, render, or disclose event data.

Replace any public event list with:

- product explanation,
- create-event call to action,
- privacy note explaining link-based visibility.

The homepage must not reveal:

- event titles,
- descriptions,
- event IDs,
- dates/suggestions,
- names/votes.

Shared event links like `/event/[id]` must continue to work.

### 2. Keep full event listing admin-only

If there is an admin area, ensure the all-events listing is only reachable there.

Do not rely on client-side hiding as the only protection if server code already exists to fetch all events. This task can leave full admin protection for `03-codex-secure-admin.md`, but it must not add new public data leaks.

### 3. Add Supabase migration/schema file

Create:

```text
supabase/migrations/0001_initial_schema.sql
```

The migration should define the app schema from current code behavior. Include tables, constraints, indexes, and RLS policy placeholders or policies appropriate to the chosen architecture.

At minimum, model the existing entities used by the app, likely including:

- events
- date suggestions
- votes

Use UUID primary keys if the app currently expects UUID IDs.

Add sensible constraints such as:

- non-empty event title,
- valid vote values (`yes`, `no`, `maybe`),
- foreign keys between suggestions/votes and events,
- foreign keys between votes and suggestions,
- indexes for event lookup and suggestion/vote lookup.

If the current app uses soft delete, include the column and query implications. If it hard deletes, document that clearly.

### 4. Replace open RLS guidance

Find README or setup documentation that recommends permissive policies like:

```sql
FOR ALL USING (true) WITH CHECK (true)
```

Remove that guidance.

Document the intended v1 access model:

- browser users participate through app routes/server actions,
- server validates writes,
- anonymous users must not be able to list all events directly,
- anonymous users must not be able to delete events, suggestions, or votes directly,
- admin-only actions are protected server-side in the next task.

If the implementation still requires Supabase anonymous client access for reads or inserts, restrict policies narrowly and document the tradeoff.

### 5. Update README setup instructions

README must point developers to the committed migration/schema file.

A new developer should be able to provision the database from committed repo files, not from ad-hoc instructions.

## Commands to Run

Run these before finishing:

```bash
npm run lint
npm run typecheck
npm run build
```

If `npm run check` exists from task 01, run it too.

## Acceptance Criteria

- Visiting `/` does not reveal event data.
- `/event/[id]` still works for shared event links.
- The repo contains `supabase/migrations/0001_initial_schema.sql`.
- README setup instructions match committed files.
- README no longer recommends open `FOR ALL USING (true) WITH CHECK (true)` policies.
- Anonymous users cannot list all events directly through documented Supabase policy guidance.
- Anonymous users cannot delete production data through documented Supabase policy guidance.
- Lint, typecheck, and build pass.

## Do Not Do In This Task

- Do not implement the final admin cookie/session system.
- Do not add rate limiting.
- Do not add monitoring.
- Do not add broad automated test coverage unless required by existing failing checks.
