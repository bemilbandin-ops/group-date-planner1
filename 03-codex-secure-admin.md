# Codex Task 03: Secure Admin

## Goal

Move admin authentication fully server-side so admin secrets never reach the browser.

Start this task only after `01-codex-build-green.md` and `02-codex-privacy-data-layer.md` are complete.

## Context

The pre-launch review found unsafe admin authentication using a public environment variable, browser-side password comparison, and `localStorage` auth state.

The secure v1 target is:

- server-only `ADMIN_PASSWORD`,
- password verification only on the server,
- signed HTTP-only cookie session,
- server-side protection for admin event listing and delete actions,
- no admin secret in the browser bundle.

## Instructions for Codex

1. Inspect all admin-related pages, components, routes, server actions, and environment variable usage.
2. Remove browser-side admin secret handling.
3. Implement a minimal server-side admin session suitable for v1.
4. Keep this task focused on admin security. Do not add full user accounts or external auth providers.

## Required Changes

### 1. Remove public admin password usage

Search for and remove usage of:

```text
NEXT_PUBLIC_ADMIN_PASSWORD
```

Do not replace it with another `NEXT_PUBLIC_` secret.

Use a server-only variable:

```env
ADMIN_PASSWORD=...
```

Update `.env.example`, README, or deployment docs accordingly.

### 2. Add server-side admin login

Implement a server-side login path using a Next.js route handler or server action.

Requirements:

- Accept submitted password.
- Validate input shape and length.
- Compare only against `process.env.ADMIN_PASSWORD` on the server.
- Avoid logging the submitted password.
- Return a safe error on failure.
- On success, set a signed HTTP-only cookie.

Cookie requirements:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax` or stricter
- reasonable expiration
- signed or otherwise tamper-resistant

Use standard Web Crypto or a small existing dependency if already present. Do not add a heavy auth framework for this task.

### 3. Add logout

Implement logout through a server-side route/action that clears the admin session cookie.

### 4. Protect admin pages and APIs server-side

Protect any admin event listing and delete functionality with a server-side session check.

Requirements:

- Unauthenticated admin page access should redirect to login or show a login screen.
- Admin delete API/action must return `401` without a valid admin session.
- Refreshing `/admin` must validate auth server-side.
- Do not rely on `localStorage` for admin authorization.

### 5. Remove localStorage-based admin auth

Delete or replace any code that treats `localStorage` as proof of admin login.

Client state may be used only for UI convenience, never as authorization.

### 6. Document future auth scope

Add a short note in README or launch docs:

- v1 uses server-side password-protected admin.
- If this becomes a broader public product, consider Supabase Auth, Auth.js, Clerk, or another production-grade identity provider.

## Commands to Run

Run these before finishing:

```bash
npm run lint
npm run typecheck
npm run build
```

If `npm run check` exists, run it too.

## Acceptance Criteria

- `NEXT_PUBLIC_ADMIN_PASSWORD` is no longer used anywhere.
- `ADMIN_PASSWORD` is server-only and documented.
- Admin secret is not included in client/browser code.
- Admin login verifies password only on the server.
- Successful login sets an HTTP-only session cookie.
- Logout clears the session cookie.
- Admin event listing requires a valid server-side session.
- Admin delete requires a valid server-side session and returns `401` otherwise.
- Refreshing `/admin` validates auth server-side.
- Lint, typecheck, and build pass.

## Do Not Do In This Task

- Do not implement public user accounts.
- Do not add OAuth or third-party auth unless already installed and trivial to activate.
- Do not add rate limiting here; that is task 04.
- Do not rewrite unrelated product UI.
