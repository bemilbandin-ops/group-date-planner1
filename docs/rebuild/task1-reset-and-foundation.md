# Task 1 — Reset and Foundation

## Codex instruction

Rebuild the project foundation so the repository has a clean, minimal Next.js app. Complete only this task. Do not implement database features, event creation, voting, admin, or deployment docs yet.

## Context

The previous direction tried to repair the existing project. This rebuild should be simpler. Prefer removing old code and replacing it with a small working foundation.

## Goal

Create a clean app shell that builds reliably on Vercel and is ready for the later Supabase tasks.

## Required outcome

A minimal Next.js App Router project with:

- TypeScript.
- Tailwind CSS.
- No Google font build dependency.
- A simple landing page.
- A simple create-event placeholder page.
- A simple event placeholder page.
- A simple admin placeholder page.
- Shared layout and basic styling.
- Clean scripts for checking the project.

## Steps

### 1. Inspect the current repo

Check the current file tree and identify old files that conflict with a clean rebuild.

Remove or replace accidental temporary files if present, especially:

- `patch.diff`
- `src/app/create/test.txt`
- `temp_VoteBreakdown.txt`
- `temp_getSortedSuggestions.txt`
- `temp_getVoteCount.txt`

### 2. Keep or create the app structure

Use this target structure:

```text
src/
  app/
    admin/
      page.tsx
    create/
      page.tsx
    event/
      [id]/
        page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    AppShell.tsx
  lib/
    constants.ts
    types.ts
```

Add only files needed for this task.

### 3. Configure scripts

In `package.json`, ensure these scripts exist:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "check": "npm run lint && npm run typecheck && npm run build"
}
```

If the project uses a newer Next.js setup where `next lint` is unavailable, use the existing working lint command and keep `npm run check` equivalent.

### 4. Remove Google font dependency

Do not use `next/font/google`. Use system fonts in CSS, for example:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 5. Implement placeholder pages

Create these pages:

- `/` — short product explanation and link to `/create`.
- `/create` — placeholder form shell, not connected to database yet.
- `/event/[id]` — placeholder that shows the event id and says event data comes in a later task.
- `/admin` — placeholder that says admin comes in a later task.

Do not add Supabase yet.

### 6. Add simple shared types

In `src/lib/types.ts`, define only the core types expected later:

```ts
export type VoteChoice = "yes" | "maybe" | "no";

export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type DateSuggestionRecord = {
  id: string;
  event_id: string;
  date: string;
  time: string | null;
  suggested_by: string;
  created_at: string;
};

export type VoteRecord = {
  id: string;
  suggestion_id: string;
  voter_name: string;
  choice: VoteChoice;
  created_at: string;
};
```

These may be refined later, but keep them simple.

## Rules

- Do not implement database logic.
- Do not add authentication.
- Do not add realtime.
- Do not add tests unless needed to satisfy existing tooling.
- Do not preserve broken code just because it exists.
- Keep UI simple and readable.

## Acceptance criteria

- `npm install` succeeds if dependencies changed.
- `npm run lint` passes or the repo's equivalent lint command passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `/`, `/create`, `/event/example-id`, and `/admin` render without database environment variables.
- No `next/font/google` usage remains.
- Temporary files listed above are removed if present.

## Stop condition

Stop after the foundation builds. Do not start database work.
