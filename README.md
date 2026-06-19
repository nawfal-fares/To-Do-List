# Clearlist

A focused personal to-do list built with Next.js, Supabase, and shadcn/ui.

## Product scope

- Email and password authentication
- Private task lists protected by PostgreSQL row-level security
- Add, edit, complete, reopen, and delete tasks
- Optional due dates with overdue highlighting
- Open, all, and completed views
- Responsive desktop and mobile layouts

The app intentionally avoids projects, teams, labels, reminders, and other
workflow layers.

## Stack

- Next.js 16 App Router and React 19
- Supabase Auth, PostgreSQL, and Row Level Security
- shadcn/ui with Tailwind CSS 4
- Vercel deployment

## Local development

Copy the environment template and add the Supabase project values:

```bash
cp .env.example .env.local
npm install
npm run dev
```

The database migration lives in
`supabase/migrations/20260620000000_create_tasks.sql`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Supabase Auth URLs

For email confirmation links, configure the deployed site as the Supabase Site
URL and allow these redirect patterns:

```text
http://localhost:3000/**
https://*-your-vercel-account.vercel.app/**
```

The application handles confirmation callbacks at `/auth/confirm`.

## Security

The publishable Supabase key is safe for browser use. Access control is
enforced in PostgreSQL: each task policy checks that the authenticated
`auth.uid()` matches the row's `user_id`. Server Actions repeat authorization
checks before every mutation.
