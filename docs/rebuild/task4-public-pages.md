# Task 4 — Public Pages and User Flows

## Codex instruction

Build the public user-facing flows using the server data layer from task3. Complete only this task. Do not build admin authentication except for preserving the existing admin placeholder.

## Goal

Users can create a planning event, share the private link, suggest dates, and vote.

## Routes to implement

```text
/
/create
/event/[id]
```

## Product behavior

### `/`

Landing page only. It must not query or list events.

Content:

- Clear title: `Group Date Planner`.
- Short explanation: create a link, share it, collect votes.
- CTA to `/create`.
- Privacy note: anyone with the event link can view details, names, suggestions, and votes.

### `/create`

Create event form.

Fields:

- Event title, required.
- Description, optional.

On submit:

- Validate server-side.
- Create the event.
- Redirect to `/event/[id]`.

### `/event/[id]`

Event page.

Behavior:

- Validate id as UUID.
- Load event with suggestions and votes.
- Show not found if missing, invalid, or soft-deleted.
- Show event title and description.
- Show copy/share link area.
- Show privacy note.
- Show suggestions sorted by `getSortedSuggestions`.
- Show vote counts for each suggestion.
- Let a user submit or update a vote by entering their name and choosing `yes`, `maybe`, or `no`.
- Let a user suggest another date with name, date, and optional time.

## Implementation guidance

Use server actions unless the current project structure makes route handlers more reliable. Keep the simplest working method.

Suggested files:

```text
src/app/create/actions.ts
src/app/create/page.tsx
src/app/event/[id]/actions.ts
src/app/event/[id]/page.tsx
src/components/CreateEventForm.tsx
src/components/SuggestionForm.tsx
src/components/VoteForm.tsx
src/components/ShareLink.tsx
```

Use client components only where necessary for form state or copy-to-clipboard.

## Error handling

- Invalid form submissions should show a readable error.
- Successful vote/suggestion submissions should refresh the event page.
- Do not show raw database errors.
- Do not silently fail.

## Design requirements

Keep the UI simple:

- Responsive single-column layout.
- Good spacing.
- Native form controls are fine.
- No heavy UI library.
- Accessible labels for all inputs.

## Privacy requirement

Do not expose any route that lists all events publicly.

The root page must not fetch from Supabase.

## Metadata

Add basic metadata:

- Root title and description.
- Generic event page metadata that does not leak private event details, for example `Group Date Planner event`.

## Rules

- No public event listing.
- No accounts.
- No realtime.
- No email invites.
- No admin implementation in this task.
- No browser-side Supabase usage.

## Acceptance criteria

- A user can create an event and land on `/event/[id]`.
- A user can add a date suggestion.
- A user can vote yes/maybe/no on a suggestion.
- A user can change their vote by submitting again with the same name.
- Invalid event ids show a not-found page or equivalent safe fallback.
- Soft-deleted events do not render.
- `/` does not query or reveal events.
- `npm run typecheck` passes.
- `npm run build` passes.

## Stop condition

Stop after public create, suggestion, and voting flows work. Do not implement admin yet.
