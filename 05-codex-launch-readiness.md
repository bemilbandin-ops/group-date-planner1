# Codex Task 05: Launch Readiness

## Goal

Finish production polish, documentation, observability, tests, dependency review, and cleanup.

Start this task only after tasks 01 through 04 are complete.

## Context

The pre-launch review says the app should not go live until public behavior, documentation, error handling, monitoring, tests, and temporary files are cleaned up.

This is the final launch-readiness task.

## Instructions for Codex

1. Confirm tasks 01 through 04 are already complete.
2. Keep changes focused on launch readiness and documentation.
3. Add tests for the most important flows without overbuilding.
4. Remove temporary artifacts.
5. Finish with a single verification command.

## Required Changes

### 1. Add custom 404 and error UI

Add these files if they do not already exist:

```text
src/app/not-found.tsx
src/app/error.tsx
src/app/global-error.tsx
```

Requirements:

- Invalid event links show a friendly not-found page.
- Runtime errors show branded fallback UI.
- Error UI is accessible.
- Error UI matches the app's existing design language.

### 2. Add Open Graph metadata

Add metadata for the root app and event pages.

Requirements:

- Root app links render clean previews.
- Event page links render clean previews.
- Metadata must align with private-by-link privacy expectations.
- Do not leak sensitive event data in public previews if the privacy model requires generic previews.

Include Twitter metadata where appropriate.

Use a static or generated OG image only if it is straightforward and reliable.

### 3. Add privacy copy

Add this or equivalent copy to user-facing surfaces:

> Anyone with this link can view the event details, names, votes, and suggestions. Do not include sensitive information.

Place it at minimum:

- create-event page,
- event page share/copy-link area,
- README/deployment docs.

Do not overpromise privacy. The v1 model is private-by-link, not account-restricted.

### 4. Add monitoring/error reporting

Add production error reporting such as Sentry or an equivalent tool.

Keep setup minimal and documented.

Log important server-side events:

- failed mutations,
- admin login failures,
- admin delete actions,
- rate-limit triggers.

Review logs for secret leakage.

If adding a third-party monitoring dependency is not appropriate for this repo, document the reason and add a clear integration point for production deployment.

### 5. Add analytics or Web Vitals reporting if appropriate

Optional but useful metrics:

- landing page visits,
- event creation starts/completions,
- event page visits,
- votes submitted,
- suggestions added,
- copy-link clicks.

Requirements if analytics are added:

- do not collect unnecessary personal data,
- update privacy documentation,
- avoid exposing sensitive event content.

If analytics are skipped for v1, document that choice briefly.

### 6. Add dependency and license review

Run and address:

```bash
npm audit
npm outdated
```

Do not blindly upgrade major versions if that creates launch risk.

Resolve or document critical/high vulnerabilities.

Review dependency licenses for intended deployment.

Add Dependabot or Renovate if desired and low-risk.

### 7. Add basic automated tests

Add the lightest useful test stack if none exists.

Recommended coverage:

#### Unit tests

- vote counting,
- suggestion sorting,
- validation helpers.

#### Integration tests

- event creation,
- vote upsert behavior,
- suggestion creation,
- admin login/logout/delete.

#### E2E smoke tests

- create event,
- open event,
- submit vote,
- add suggestion,
- admin login and delete event.

Do not overbuild. Prioritize critical user flows and security-sensitive paths.

Ensure `npm test` exists.

Update `npm run check` so the final target is:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### 8. Remove stray temporary files

Remove or justify these known temporary files if present:

```text
patch.diff
src/app/create/test.txt
temp_VoteBreakdown.txt
temp_getSortedSuggestions.txt
temp_getVoteCount.txt
```

Update `.gitignore` if needed to avoid generated artifacts.

README project structure should match actual source layout.

### 9. Final README/deployment update

Update README so it accurately covers:

- private-by-link room model,
- Supabase migration setup,
- server-only admin password,
- environment variables,
- validation/rate-limit behavior,
- monitoring/logging notes,
- test/check commands,
- launch gate.

## Commands to Run

Run final verification:

```bash
npm run check
```

Also run:

```bash
npm audit
npm outdated
```

Document any remaining audit/outdated issues and why they are acceptable for launch.

## Acceptance Criteria

- Custom 404/error UI exists and works.
- Open Graph/Twitter metadata exists and does not violate privacy expectations.
- Privacy copy is visible in the create and event flows.
- Monitoring/error-reporting path exists or is explicitly documented.
- Analytics are either privacy-safe or intentionally skipped and documented.
- `npm test` exists.
- Critical unit/integration/E2E smoke coverage exists.
- Temporary files are removed or explicitly justified.
- README matches actual behavior and setup.
- `npm run check` runs lint, typecheck, tests, and build.
- `npm run check` passes.
- Critical/high vulnerabilities are resolved or documented.

## Launch Gate

Do not go live until all of the following are true:

- All must-do items from tasks 01 through 05 are complete.
- Production build passes in the deployment environment.
- Admin secrets are server-only.
- Supabase policies are production-safe.
- Public pages no longer leak private event data.
- Database migrations are committed and documented.
- Anonymous writes are validated and rate-limited.
- Temporary files are removed.
- `npm run check` passes.
