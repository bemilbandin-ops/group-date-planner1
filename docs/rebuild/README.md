# Simplified Rebuild Plan

This folder is the Codex execution plan for rebuilding Group Date Planner from scratch in a simpler, deployment-friendly form.

## Goal

Rebuild the app as a small Next.js + Supabase project that is easy to deploy on Vercel.

## Product scope for v1

Keep only this:

1. Landing page with a create-event call to action.
2. Create event form.
3. Private-by-link event page.
4. Suggested dates.
5. Votes: yes / maybe / no.
6. Copy/share event link.
7. Simple password-protected admin page for deletion/moderation.
8. README with deployment instructions.

Do not build this in v1:

- User accounts.
- Public event directory.
- Teams/workspaces.
- Email invites.
- Realtime subscriptions.
- Complex analytics.
- Complex rate limiting beyond a simple production-safe middleware/helper.
- A large component library.

## Recommended stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Supabase Postgres.
- `@supabase/supabase-js` used only from server-side code.
- Vercel deployment.
- System fonts only. Do not use `next/font/google` for v1.

## Execution order

Run the tasks in order:

1. `task1-reset-and-foundation.md`
2. `task2-database-and-env.md`
3. `task3-server-data-layer.md`
4. `task4-public-pages.md`
5. `task5-admin.md`
6. `task6-deployment-docs.md`
7. `task7-final-verification.md`

## How to use with Codex

Start a new Codex task for each file. Use this exact style:

```text
Read docs/rebuild/task1-reset-and-foundation.md and complete the task exactly. Do not start task2. Stop when the acceptance criteria pass.
```

After Codex finishes a task, review the diff, run the checks named in that task, then move to the next task.

## Global rules for Codex

- Prefer deleting old code over adapting broken code.
- Keep the app boring and small.
- Do not add a dependency unless the task explicitly asks for it or it clearly reduces code.
- Do not use browser-side Supabase writes.
- Do not expose service-role keys or admin passwords to the browser.
- Use server actions or route handlers for writes.
- Keep every page deployable on Vercel.
- Keep `npm run check` green after every task once it exists.
