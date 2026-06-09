# Codex Task 04: Validation and Abuse Protection

## Goal

Harden every anonymous and admin write path with shared validation, relationship checks, rate limiting, and user-safe error handling.

Start this task only after tasks 01 through 03 are complete.

## Context

The pre-launch review found that inputs are only partially validated, some failures are silent, relationships can be tampered with through form inputs, and anonymous write paths are abuse-prone.

This task should make writes safe enough for production v1.

## Instructions for Codex

1. Inventory every mutation path before editing code.
2. Centralize validation instead of scattering one-off checks.
3. Verify database relationships before writing.
4. Add production-safe rate limiting.
5. Improve error handling without exposing secrets or raw database errors.

## Mutation Paths To Cover

Find and harden all write paths, including at minimum:

- event creation,
- date suggestion creation,
- vote submission,
- admin login,
- admin delete.

If the app has additional write paths, include them too.

## Required Changes

### 1. Add shared validation module

Create a shared validation module, preferably:

```text
src/lib/validation.ts
```

Use it from every mutation path.

You may use a lightweight validation library if one already exists in the project. If not, simple explicit TypeScript validation helpers are acceptable.

Suggested limits:

- Event title: 1–120 characters.
- Description: optional, max 500 characters.
- Name: 1–80 characters.
- Date: valid `YYYY-MM-DD`.
- Time: optional valid `HH:mm`.
- Vote type: exactly `yes`, `no`, or `maybe`.
- IDs: valid UUIDs.
- Admin password input: non-empty with a reasonable max length.

Normalize values where appropriate:

- trim names and titles,
- treat empty optional fields as `null` or empty consistently,
- reject malformed dates/times rather than storing them.

### 2. Validate every write before database access

Each mutation path must call shared validation before database writes.

Invalid input should return a user-safe error and must not write to the database.

Do not silently return on failure.

### 3. Verify data relationships before writes

Before voting:

- verify the event exists,
- verify the suggestion exists,
- verify the suggestion belongs to the event route ID,
- reject mismatched or missing records.

Before adding a suggestion:

- verify the event exists,
- reject writes to nonexistent events,
- reject writes to deleted events if soft delete exists.

Before admin delete:

- verify admin session server-side,
- verify target event ID is valid,
- handle missing events safely.

### 4. Add rate limiting

Add production-safe rate limiting for abuse-prone endpoints/actions.

Recommended v1 limits:

- Event creation: 5 per IP per hour.
- Suggestions: 20 per event per IP per hour.
- Votes: 60 per IP per hour.
- Admin login: 5 failed attempts per 15 minutes.

Preferred implementation options:

- Vercel WAF/rate limiting,
- Upstash Redis rate limiting,
- Supabase-backed rate limit table.

Do not rely only on in-memory rate limiting for production. In-memory limiting is acceptable only as a local-development fallback.

Use a helper module such as:

```text
src/lib/rate-limit.ts
```

Rate-limited requests must return `429` or an equivalent safe app-level response.

### 5. Improve error handling and feedback

Avoid silent failures in server actions and route handlers.

Requirements:

- Return user-friendly mutation errors.
- Avoid exposing raw database errors to users.
- Add structured server logs for failed writes and admin actions.
- Do not log passwords, secrets, or unnecessary personal data.
- Make UI forms show whether votes/suggestions/event creation succeeded or failed.

### 6. Keep database policies aligned

If task 02 added RLS or server-mediated policies, keep the write behavior aligned with those policies.

Do not weaken RLS to make this task easier.

## Commands to Run

Run these before finishing:

```bash
npm run lint
npm run typecheck
npm run build
```

If `npm run check` exists, run it too.

## Acceptance Criteria

- Every mutation path uses shared validation.
- Invalid input is rejected before database writes.
- Users cannot vote on unrelated suggestions by editing hidden inputs.
- Users cannot add suggestions to nonexistent or deleted events.
- Admin delete remains protected by server-side auth.
- Rate-limited requests receive `429` or a clear safe equivalent.
- Admin login is brute-force resistant.
- Mutation errors are visible to users and safe to display.
- Server logs are useful and do not expose secrets.
- Lint, typecheck, and build pass.

## Do Not Do In This Task

- Do not add broad visual redesigns.
- Do not add analytics or monitoring unless needed for structured server logs.
- Do not relax security policies to pass tests.
- Do not implement full account-based auth.
