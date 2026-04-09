# Vercel Deployment Checklist

## 1. Pre-Deploy

- [ ] Supabase project is created
- [ ] Migration executed: `supabase/migrations/20260409_001_init.sql`
- [ ] Seed executed (optional for staging): `supabase/seed.sql`
- [ ] Local checks pass: `npm run lint`, `npm run test`, `npm run build`

## 2. Environment Variables (Vercel)

Set for Preview and Production:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SESSION_SECRET` (at least 32 chars)

## 3. Vercel Project Settings

- [ ] Framework preset is Next.js
- [ ] Node version compatible with Next.js 16
- [ ] Production branch configured correctly

## 4. Post-Deploy Smoke Test

- [ ] `GET /api/health` returns `200` with `ready: true`
- [ ] `GET /login` loads successfully
- [ ] Valid user login works
- [ ] Invalid login shows generic error
- [ ] Dashboard shows only current user's messages
- [ ] Logout clears session and redirects to login

## 5. Security Verification

- [ ] No service role key exposed in client code
- [ ] Session cookie is `httpOnly`
- [ ] Login endpoint rate limiting is active
- [ ] Audit logs visible in deployment logs

## 6. Rollback Plan

- [ ] Previous successful deployment identified
- [ ] Rollback owner assigned
- [ ] Rollback communication channel agreed
