# QZH20 Message Portal

MVP website for committee members to log in with a passkey
and view only their own messages.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (PostgreSQL)
- Vercel deployment target

## Environment Variables

1. Copy `.env.example` to `.env.local`.
2. Fill in values from your Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET` (at least 32 characters)

## Database Setup (Supabase SQL Editor)

Run in this order:

1. `supabase/migrations/20260409_001_init.sql`
2. `supabase/migrations/20260428_001_add_member_profiles.sql`
3. `supabase/migrations/20260428_002_add_member_profile_passkeys.sql`
4. `supabase/migrations/20260430_001_cleanup_committee_members.sql`
5. `supabase/seed.sql`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Run Tests

npm run test

## Health Check

- Endpoint: `/api/health`
- Returns `200` when env and database checks are ready
- Returns `503` with `status: "degraded"` when checks fail

## Deployment Checklist

- See `docs/vercel-deployment-checklist.md` for pre-deploy and post-deploy steps.

## Login Format

- Login ID: `member1` ... `member46`
- Passkey format: `MMDD` + 4-letter secret code
- Example: if birthday is March 7 and secret code is `srls`, the passkey is `0307srls`

## Implemented Features

- Login API with validation and basic rate limiting
- Signed session cookie (httpOnly)
- Protected dashboard route via `proxy.ts`
- Per-user message filtering on server
- Logout API
