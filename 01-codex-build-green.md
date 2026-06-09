# Codex Task 01: Build Green

## Goal

Make the app pass local and production verification before deeper product or security work.

Work in a small PR focused only on TypeScript/build stability.

## Context

The pre-launch review says the app should not go live until build/type safety is stable. The repo currently needs dedicated verification scripts, type fixes around suggestion sorting, a decision on `VoteBreakdown`, and reliable font loading.

## Instructions for Codex

1. Inspect the current project structure and package scripts.
2. Read relevant local Next.js documentation under `node_modules/next/dist/docs/` before changing Next.js-specific code.
3. Make the smallest changes needed to get lint, typecheck, and production build passing.
4. Do not start privacy, database, admin-auth, validation, rate-limit, or launch-polish work in this task.

## Required Changes

### 1. Add explicit check scripts

Update `package.json`:

- Add `typecheck` using `tsc --noEmit`.
- Add `check` as the combined launch-readiness command.
- If no test framework exists yet, make `check` run only the commands that exist now, but leave a clear TODO or later-task note for adding `npm test`.

Preferred eventual target:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

For this task, do not invent a weak placeholder test just to satisfy the script.

### 2. Fix suggestion sorting types

Find `getSortedSuggestions()`.

Make it generic so it preserves the full input suggestion type while still requiring the vote data needed for sorting.

Sorting behavior must stay the same:

1. Most `yes` votes first.
2. Fewest `no` votes second.
3. Highest total votes third.

After the fix, event-page suggestion objects must still expose fields such as:

- `id`
- `date`
- `time`
- `suggested_by`
- any other existing fields used by the page

### 3. Fix or remove `VoteBreakdown`

Inspect whether `VoteBreakdown` is used.

Choose the simpler production-safe path:

- If unused, delete it and remove references/imports.
- If used, fix its prop type to include vote IDs and reuse shared utilities from `src/lib/utils.ts` instead of redefining duplicated logic.

Keep README/product copy aligned with actual UI behavior. If voter-name breakdown is not shown, do not claim it is shown.

### 4. Stabilize font loading

Inspect current font usage.

If the project uses `next/font/google`, remove build-time dependence on external Google Font fetching by switching to one of these reliable strategies:

- `next/font/local` with committed local font files, or
- a system font stack if local font files are not already present.

Preserve existing CSS variable names where practical so the visual code needs minimal changes.

## Commands to Run

Run these before finishing:

```bash
npm run lint
npm run typecheck
npm run build
```

If any command fails, fix the failure within the scope of this task.

## Acceptance Criteria

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `package.json` has a dedicated `typecheck` script.
- `package.json` has a combined `check` script.
- `getSortedSuggestions()` preserves full suggestion object types.
- `VoteBreakdown` no longer causes TypeScript errors.
- Production build does not depend on fetching Google Fonts.

## Do Not Do In This Task

- Do not change the room privacy model.
- Do not rewrite Supabase RLS policies.
- Do not implement admin authentication.
- Do not add rate limiting.
- Do not add broad test infrastructure unless it is already present and only needs wiring.
