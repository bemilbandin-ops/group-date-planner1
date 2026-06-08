# Group Date Planner Pre-Launch Remediation Plan

## Purpose

This document converts the pre-launch review findings into a structured implementation plan for getting Group Date Planner ready for production.

## Current Recommendation

Do **not** go live yet. The app needs type/build stability, security hardening, privacy decisions, schema/migration cleanup, validation, abuse protection, and launch documentation before production release.

## Guiding Principles

- Fix build and type safety before deeper product work.
- Decide the room privacy model before changing database policies or homepage behavior.
- Keep secrets server-side only.
- Treat all anonymous writes as abuse-prone and validate/rate-limit them.
- Keep README, migrations, and deployed behavior aligned.

---

## Phase 1: Stabilize TypeScript and Production Build

### 1.1 Add Explicit Check Scripts

**Problem:** `package.json` currently has no dedicated typecheck or combined verification script.

**Tasks:**

- Add a `typecheck` script that runs `tsc --noEmit`.
- Add a `check` script that runs lint, typecheck, tests, and build once tests exist.
- Ensure CI/Vercel uses the same checks before deployment.

**Acceptance Criteria:**

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes in the deployment environment.
- A single command can verify launch readiness.

---

### 1.2 Fix Suggestion Sorting Types

**Problem:** `getSortedSuggestions()` narrows suggestions to only a `votes` shape, causing TypeScript errors when event-page code accesses fields such as `id`, `date`, `time`, and `suggested_by`.

**Tasks:**

- Make `getSortedSuggestions()` generic so it preserves the full input suggestion type.
- Keep the existing sorting behavior:
  1. Most yes votes first.
  2. Fewest no votes second.
  3. Highest total votes third.
- Add unit tests once the test framework is introduced.

**Acceptance Criteria:**

- Event suggestions retain their full type after sorting.
- TypeScript errors in the event page are resolved.
- Sorting behavior remains unchanged.

---

### 1.3 Fix or Remove `VoteBreakdown`

**Problem:** `VoteBreakdown` uses vote IDs but its prop type does not include `id`. It also appears unused and duplicates utility behavior.

**Tasks:**

Choose one path:

#### Option A: Keep and Use It

- Add `id` to the vote type.
- Import shared utilities from `src/lib/utils.ts` instead of redefining them.
- Render the component in suggestion cards if voter-name breakdown is part of launch scope.

#### Option B: Remove It

- Delete the unused component.
- Update README/product copy if voter-name breakdown is not part of launch scope.

**Acceptance Criteria:**

- No TypeScript errors remain in the component.
- README accurately describes the actual UI.

---

### 1.4 Make Font Builds Reliable

**Problem:** Production build can fail if `next/font/google` cannot fetch Google Fonts during build.

**Recommended Fix:**

Prefer self-hosted fonts with `next/font/local` so builds do not depend on external font fetches.

**Tasks:**

- Add local font files or switch to a reliable local/system font strategy.
- Preserve existing font CSS variables where possible.
- Re-run production build in the deployment environment.

**Acceptance Criteria:**

- `npm run build` passes consistently.
- Production builds are not blocked by unreachable Google Fonts.

---

## Phase 2: Decide and Enforce Privacy/Data Model

### 2.1 Choose a Room Privacy Model

**Problem:** The product implies shareable/private planning rooms, but the homepage currently lists all recent events publicly.

**Recommended Model for v1:**

Use **private-by-link anonymous rooms**:

- Events are not listed publicly.
- Anyone with the link can view, vote, and suggest dates.
- No user accounts are required for v1.
- Admin can moderate/delete through protected admin functionality.

**Acceptance Criteria:**

- Product copy clearly says anyone with the link can participate.
- Homepage does not disclose event details.
- Event links remain shareable.

---

### 2.2 Remove Public Event Listing from Homepage

**Problem:** Publicly listing recent planning rooms leaks event titles, descriptions, and IDs.

**Tasks:**

- Remove public event fetching from the homepage.
- Replace the event list with product information, a create-event CTA, and a privacy note.
- Keep full event listing only in the protected admin area.

**Acceptance Criteria:**

- Visiting `/` does not reveal event data.
- `/event/[id]` still works for shared event links.
- `/admin` is the only place that lists all events.

---

### 2.3 Add Real Database Schema or Migrations

**Problem:** README references `supabase-schema.sql`, but there is no committed schema file.

**Recommended Fix:**

Add Supabase migrations, starting with:

```text
supabase/migrations/0001_initial_schema.sql
```

**Tasks:**

- Create a committed migration/schema file.
- Define tables, constraints, indexes, and RLS policies.
- Update README setup instructions to use the committed migration/schema file.

**Acceptance Criteria:**

- A new developer can provision the database from committed files.
- README instructions match repository contents.
- Schema includes production-safe policies and indexes.

---

### 2.4 Rewrite Supabase RLS Policies

**Problem:** The README currently recommends permissive `FOR ALL USING (true) WITH CHECK (true)` policies.

**Recommended Model:**

Prefer server-mediated database access for v1:

- Client talks to Next.js route handlers/server actions.
- Server validates input.
- Server uses private credentials where needed.
- Public anonymous users cannot directly delete/update arbitrary data.

**Tasks:**

- Remove open `FOR ALL` policy guidance.
- Write production-safe RLS policies.
- Ensure anonymous users cannot delete events, suggestions, or votes directly.
- Decide whether the browser still needs the Supabase anon key.

**Acceptance Criteria:**

- Anonymous users cannot list all events directly through Supabase.
- Anonymous users cannot delete production data.
- Admin-only actions require server-side authorization.

---

## Phase 3: Replace Admin Authentication

### 3.1 Remove Public Admin Password Usage

**Problem:** Current admin code uses `NEXT_PUBLIC_ADMIN_PASSWORD`, compares the password in the browser, and stores auth state in `localStorage`.

**Recommended Fix:**

Use a private server-only environment variable:

```env
ADMIN_PASSWORD=...
```

Do not use `NEXT_PUBLIC_` for secrets.

**Tasks:**

- Remove all `NEXT_PUBLIC_ADMIN_PASSWORD` usage.
- Add server-only admin login/logout APIs.
- Verify admin password only on the server.
- Set a signed HTTP-only, Secure, SameSite cookie on successful login.
- Protect admin event listing and delete APIs through server-side session checks.
- Remove localStorage-based admin auth.

**Acceptance Criteria:**

- Admin secret is never included in the browser bundle.
- Admin delete API returns `401` without a valid admin session.
- Logout clears the admin session cookie.
- Refreshing `/admin` validates auth server-side.

---

### 3.2 Consider Full Auth for Future Scope

If this becomes a public product, consider a real auth provider such as Supabase Auth, Auth.js, Clerk, or another production-grade identity provider.

**Acceptance Criteria:**

- v1 has safe server-side admin protection.
- Future account/auth requirements are documented.

---

## Phase 4: Validation, Abuse Protection, and Error Handling

### 4.1 Centralize Server-Side Validation

**Problem:** Inputs are only partially validated. Some server actions accept raw form values and return silently on failure.

**Tasks:**

- Add a shared validation module, such as `src/lib/validation.ts`.
- Validate every write path:
  - Event creation.
  - Date suggestion creation.
  - Vote submission.
  - Admin login.
  - Admin delete.
- Enforce field length limits and formats.

**Suggested Limits:**

- Event title: 1-120 characters.
- Description: optional, max 500 characters.
- Name: 1-80 characters.
- Date: valid `YYYY-MM-DD`.
- Time: optional valid `HH:mm`.
- Vote type: `yes`, `no`, or `maybe`.
- IDs: valid UUIDs.

**Acceptance Criteria:**

- Invalid input is rejected before database writes.
- Errors are returned in user-friendly form.
- Every mutation path uses shared validation.

---

### 4.2 Verify Data Relationships Before Writes

**Problem:** A tampered form could submit a `suggestionId` that does not belong to the current event.

**Tasks:**

- Before voting, verify the suggestion exists and belongs to the event route ID.
- Before adding a suggestion, verify the event exists and is not deleted.
- Reject writes for mismatched or missing records.

**Acceptance Criteria:**

- Users cannot vote on unrelated suggestions by editing hidden inputs.
- Users cannot add suggestions to nonexistent or deleted events.

---

### 4.3 Add Rate Limiting

**Problem:** Anonymous event creation, suggestion submission, voting, and admin login can be abused.

**Recommended v1 Limits:**

- Event creation: 5 per IP per hour.
- Suggestions: 20 per event per IP per hour.
- Votes: 60 per IP per hour.
- Admin login: 5 failed attempts per 15 minutes.

**Implementation Options:**

- Vercel WAF/rate limiting.
- Upstash Redis rate limiting.
- Supabase-backed rate limit table.
- Lightweight in-memory rate limiting only for local development.

**Acceptance Criteria:**

- Abusive requests receive `429` responses.
- Admin login is brute-force resistant.
- Rate limiting is production-safe, not only local-memory based.

---

### 4.4 Improve Error Handling and User Feedback

**Tasks:**

- Avoid silent failures in server actions.
- Surface mutation errors to users.
- Add structured server logs for failed writes and admin actions.
- Avoid exposing secrets or raw database errors to users.

**Acceptance Criteria:**

- Users know whether votes and suggestions succeeded.
- Production logs are useful for debugging.
- Error responses are safe and consistent.

---

## Phase 5: Launch Polish and Operational Readiness

### 5.1 Add Custom 404 and Error UI

**Tasks:**

Add:

```text
src/app/not-found.tsx
src/app/error.tsx
src/app/global-error.tsx
```

**Acceptance Criteria:**

- Invalid event links show a friendly not-found page.
- Runtime errors show branded fallback UI.
- Error UI is accessible and matches the app design.

---

### 5.2 Add Open Graph Metadata

**Tasks:**

- Add Open Graph metadata for the root app.
- Add Open Graph and Twitter metadata for event pages.
- Consider a generated or static OG image.
- Avoid leaking sensitive event data if the privacy model requires generic previews.

**Acceptance Criteria:**

- Shared links render clean previews in chat/social apps.
- Metadata aligns with privacy expectations.

---

### 5.3 Add Privacy Copy

**Recommended Copy:**

> Anyone with this link can view the event details, names, votes, and suggestions. Do not include sensitive information.

**Tasks:**

- Add privacy copy to the create page.
- Add privacy copy near the event page share/copy link area.
- Add privacy notes to README/deployment docs.

**Acceptance Criteria:**

- Users understand link-based visibility.
- Product copy does not overpromise privacy.

---

### 5.4 Add Monitoring and Logging

**Tasks:**

- Add production error reporting, such as Sentry or an equivalent tool.
- Log important server-side events:
  - Failed mutations.
  - Admin login failures.
  - Admin delete actions.
  - Rate-limit triggers.
- Review logs for secret leakage.

**Acceptance Criteria:**

- Production errors are visible to maintainers.
- Admin actions are auditable.
- Logs do not expose secrets or sensitive user input unnecessarily.

---

### 5.5 Add Analytics or Web Vitals Reporting

**Optional but Useful Metrics:**

- Landing page visits.
- Event creation starts/completions.
- Event page visits.
- Votes submitted.
- Suggestions added.
- Copy-link clicks.

**Acceptance Criteria:**

- Analytics do not collect unnecessary personal data.
- Privacy documentation reflects analytics if added.

---

### 5.6 Add Dependency and License Review

**Tasks:**

- Run `npm audit`.
- Run `npm outdated`.
- Review dependency licenses.
- Add Dependabot or Renovate if desired.

**Acceptance Criteria:**

- Critical/high vulnerabilities are resolved or documented.
- Licenses are acceptable for the intended deployment.
- Dependency update process is documented.

---

### 5.7 Add Basic Automated Tests

**Recommended Test Coverage:**

#### Unit Tests

- Vote counting.
- Suggestion sorting.
- Validation helpers.

#### Integration Tests

- Event creation.
- Vote upsert behavior.
- Suggestion creation.
- Admin login/logout/delete.

#### E2E Smoke Tests

- Create event.
- Open event.
- Submit vote.
- Add suggestion.
- Admin login and delete event.

**Acceptance Criteria:**

- `npm test` exists.
- Critical user flows are covered.
- CI runs tests before deployment.

---

### 5.8 Remove Stray Temporary Files

**Known Files to Remove or Justify:**

```text
patch.diff
src/app/create/test.txt
temp_VoteBreakdown.txt
temp_getSortedSuggestions.txt
temp_getVoteCount.txt
```

**Acceptance Criteria:**

- Repository contains no accidental temp/test artifacts.
- `.gitignore` covers generated artifacts.
- README project structure reflects actual source layout.

---

## Milestone Roadmap

### Milestone 1: Build Green

**Goal:** App passes local and CI verification.

**Tasks:**

1. Read relevant Next.js docs under `node_modules/next/dist/docs/` before code changes.
2. Add `typecheck` and `check` scripts.
3. Fix suggestion sorting types.
4. Fix or remove `VoteBreakdown`.
5. Stabilize font loading.
6. Run lint, typecheck, and build.

**Deliverable:** A PR that gets all core checks passing.

---

### Milestone 2: Privacy Model and Data Layer

**Goal:** Event data is not accidentally public, and database setup is repeatable.

**Tasks:**

1. Choose private-by-link, public, or authenticated room model.
2. Remove public homepage event listing if private-by-link is chosen.
3. Add Supabase migration/schema file.
4. Add indexes and constraints.
5. Replace open RLS guidance.
6. Decide whether database access is direct anon RLS or server-mediated.

**Deliverable:** A PR with schema/migrations and updated privacy behavior.

---

### Milestone 3: Secure Admin

**Goal:** Admin secrets never reach the browser.

**Tasks:**

1. Remove `NEXT_PUBLIC_ADMIN_PASSWORD`.
2. Add server-only `ADMIN_PASSWORD`.
3. Add server-side login/logout/session handling.
4. Protect event listing and delete APIs.
5. Remove localStorage-based admin auth.

**Deliverable:** A PR where admin authentication is server-side and cookie-based.

---

### Milestone 4: Validation and Abuse Protection

**Goal:** Anonymous writes are controlled and safe.

**Tasks:**

1. Add shared validation module.
2. Validate create/vote/suggest/admin inputs.
3. Verify event/suggestion relationships before writes.
4. Add rate limiting.
5. Improve UI error feedback.

**Deliverable:** A PR that hardens all write paths.

---

### Milestone 5: Launch Readiness

**Goal:** Product is documented, observable, tested, and polished.

**Tasks:**

1. Add 404/error pages.
2. Add Open Graph metadata.
3. Add privacy copy.
4. Add monitoring/error reporting.
5. Add dependency/license review.
6. Add automated tests.
7. Remove temp files.
8. Update README deployment docs.

**Deliverable:** A final launch-readiness PR.

---

## Final Pre-Launch Verification Target

The final launch verification should be a single command such as:

```bash
npm run check
```

Where `check` runs:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Launch Gate

Do not go live until:

- All `Must Do` items are complete.
- Production build passes in the deployment environment.
- Admin secrets are server-only.
- Supabase policies are production-safe.
- Public pages no longer leak private event data.
- Database migrations are committed and documented.
- Anonymous writes are validated and rate-limited.
- Temporary files are removed.
