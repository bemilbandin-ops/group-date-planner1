# Task 5 — Simple Admin

## Codex instruction

Add a small password-protected admin area for moderation. Complete only this task. Do not add user accounts, Supabase Auth, or a public event directory.

## Goal

The app owner can log in, view recent events, open event links, and soft-delete events.

## Routes

Implement:

```text
/admin
/admin/login
```

Use route handlers or server actions for login/logout/delete.

## Authentication model

Use a single server-side password for v1.

Environment variables:

```text
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Rules:

- Never use `NEXT_PUBLIC_ADMIN_PASSWORD`.
- Never compare the admin password in browser JavaScript.
- Never store admin auth in `localStorage`.
- Set an HTTP-only cookie after successful login.
- Cookie must be `Secure` in production.
- Cookie must be `SameSite=Lax`.
- Sign the cookie value using `ADMIN_SESSION_SECRET`.

## Required files

Suggested files:

```text
src/lib/adminAuth.ts
src/app/admin/login/page.tsx
src/app/admin/login/actions.ts
src/app/admin/page.tsx
src/app/admin/actions.ts
```

Use a different file structure if it is simpler, but keep it small.

## Admin page behavior

### Unauthenticated user

- Visiting `/admin` redirects to `/admin/login`.

### Login page

- Shows password field.
- Submits to server.
- On success, sets signed HTTP-only cookie and redirects to `/admin`.
- On failure, shows a generic invalid password error.

### Authenticated admin page

Show recent non-deleted events:

- Title.
- Created date.
- Link to `/event/[id]`.
- Soft-delete button.

### Delete behavior

- Delete action requires valid admin session.
- It must call `softDeleteEvent(id)`.
- It must not hard-delete rows.
- After delete, refresh `/admin`.

### Logout

Add a logout action that clears the cookie and redirects to `/admin/login`.

## Security requirements

- Use constant-time comparison if practical.
- Use generic login error message.
- Do not expose whether env vars are missing to public users; log server-side and show generic error.
- Admin-only data fetching must happen server-side.
- No admin API should work without a valid signed cookie.

## Rate limiting

Add a minimal production-safe login throttle if straightforward. Prefer a simple helper keyed by IP and backed by a deployment-safe store only if already available. If no deployment-safe store exists, document the limitation in `docs/rebuild/task6-deployment-docs.md` later rather than adding fragile in-memory-only security.

## Rules

- No Supabase Auth.
- No accounts.
- No role system.
- No public event listing.
- No client-side service-role access.

## Acceptance criteria

- `/admin` redirects unauthenticated users to `/admin/login`.
- Correct password logs in and sets an HTTP-only signed cookie.
- Wrong password does not log in.
- Refreshing `/admin` keeps the admin logged in while the cookie is valid.
- Logout clears the session.
- Admin can see recent non-deleted events.
- Admin can soft-delete an event.
- Deleted events no longer render on `/event/[id]`.
- `NEXT_PUBLIC_ADMIN_PASSWORD` does not exist.
- `npm run typecheck` passes.
- `npm run build` passes.

## Stop condition

Stop after simple admin moderation works. Do not add deployment docs or extra product features.
