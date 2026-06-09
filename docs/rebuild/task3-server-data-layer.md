# Task 3 — Server Data Layer

## Codex instruction

Implement the server-side data layer and validation helpers using Drizzle. Complete only this task. Do not build the final UI yet, except for minimal wiring needed to keep the app compiling.

## Goal

All database reads and writes should go through small server-only functions with validation.

## Required files

Create or update:

```text
src/lib/validation.ts
src/lib/data/events.ts
src/lib/data/suggestions.ts
src/lib/data/votes.ts
src/lib/utils.ts
```

Use folders if needed, but keep the data layer small.

## Database requirement

Use the Drizzle database client from task2.

Rules:

- Do not use Supabase.
- Do not use browser-side database writes.
- Any file that imports the database client must be server-only directly or indirectly.

## Validation requirements

In `src/lib/validation.ts`, implement validation helpers for:

- Event title: required, trim, 1-120 characters.
- Event description: optional, trim, max 500 characters, convert empty string to null.
- Name: required, trim, 1-80 characters.
- Date: required valid `YYYY-MM-DD`.
- Time: optional valid `HH:mm`, convert empty string to null.
- Vote choice: only `yes`, `maybe`, `no`.
- UUID: valid UUID string.

Use simple TypeScript functions. Do not add Zod unless it is already in the project or clearly worth the dependency.

Return clear validation errors. Prefer a result shape like:

```ts
type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

## Event data functions

In `src/lib/data/events.ts`, implement server-only functions:

```ts
createEvent(input: { title: string; description?: string | null }): Promise<{ id: string }>;
getEventById(id: string): Promise<EventWithSuggestions | null>;
softDeleteEvent(id: string): Promise<void>;
listRecentEventsForAdmin(): Promise<EventRecord[]>;
```

Rules:

- `getEventById` must ignore soft-deleted events.
- `getEventById` should return the event with suggestions and votes.
- `listRecentEventsForAdmin` is for admin only and should not be used on the homepage.
- `softDeleteEvent` sets `deleted_at`, not hard delete.

## Suggestion data functions

In `src/lib/data/suggestions.ts`, implement:

```ts
addDateSuggestion(input: {
  eventId: string;
  date: string;
  time?: string | null;
  suggestedBy: string;
}): Promise<void>;
```

Rules:

- Validate all input.
- Verify the event exists and is not deleted before inserting.

## Vote data functions

In `src/lib/data/votes.ts`, implement:

```ts
submitVote(input: {
  eventId: string;
  suggestionId: string;
  voterName: string;
  choice: VoteChoice;
}): Promise<void>;
```

Rules:

- Validate all input.
- Verify the suggestion belongs to the event id.
- Use Drizzle insert with conflict handling on `(suggestion_id, voter_name)` so the same named voter can change their vote.

## Sorting and vote utilities

In `src/lib/utils.ts`, implement:

```ts
getVoteCounts(votes: VoteRecord[]): { yes: number; maybe: number; no: number };
getSortedSuggestions<T extends { votes: VoteRecord[] }>(suggestions: T[]): T[];
```

Sort suggestions by:

1. Most yes votes first.
2. Fewest no votes second.
3. Most total votes third.
4. Earliest date fourth if available.

The generic must preserve each suggestion's full type.

## Error handling

- Throw safe, user-readable errors from validation failures.
- Do not expose raw database errors directly to users.
- Log server errors with enough context for debugging, but do not log secrets.

## Rules

- No Supabase.
- No client-side database access.
- No public event listing.
- No admin auth yet.
- No large abstraction layer.
- No realtime.

## Acceptance criteria

- All data functions compile.
- Data functions use Drizzle, not Supabase.
- `getSortedSuggestions` preserves generic item types.
- `submitVote` verifies event/suggestion relationship.
- `addDateSuggestion` verifies event existence.
- No browser/client component imports `src/db/index.ts`.
- `npm run typecheck` passes.
- `npm run build` passes.

## Stop condition

Stop after the data layer and utilities are complete. Do not build the final pages yet.
