# QZH20 MVP Implementation Plan

## 1. Project Goal
Build an internal message website for camp committee members.
Users log in with their birthday password (format: `YYYYMMDD`) and can only view messages that belong to themselves.

## 2. Fixed Tech Stack
- Framework: Next.js (App Router) + TypeScript
- Database: Supabase (PostgreSQL)
- Deployment: Vercel
- Auth model (MVP): Custom login with birthday password

## 3. MVP Scope
### In Scope
- Login page
- Authentication by user identifier + birthday password (`YYYYMMDD`)
- Protected user dashboard page
- Show only the logged-in user's messages
- Basic logout
- Seed/import-ready user and message data structure

### Out of Scope (Later)
- Admin dashboard UI
- Multi-role RBAC
- Advanced moderation workflow
- Rich media messages
- 2FA

## 4. Functional Requirements
1. A user can access the login page.
2. A user can submit credentials (identifier + birthday password).
3. System validates credentials server-side.
4. On success, user gets a secure session and is redirected to dashboard.
5. Dashboard shows only that user's messages.
6. Unauthenticated users cannot open dashboard.
7. Invalid login shows generic error (no account enumeration).

## 5. Data Model (Supabase)
## 5.1 Table: `committee_members`
- `id` (uuid, primary key)
- `name` (text, not null)
- `login_id` (text, unique, not null)  
  Example: short code/username used for login
- `birthday` (date, not null)
- `birthday_hash` (text, not null)  
  Store hashed `YYYYMMDD`, never plain text
- `created_at` (timestamp with time zone, default now())

## 5.2 Table: `messages`
- `id` (uuid, primary key)
- `member_id` (uuid, foreign key -> committee_members.id, not null)
- `author_name` (text, nullable)
- `content` (text, not null)
- `created_at` (timestamp with time zone, default now())

## 5.3 Indexes
- Unique index on `committee_members.login_id`
- Index on `messages.member_id`

## 6. Security Requirements (MVP Minimum)
1. Hash birthday password before storing (bcrypt/argon2).
2. Login validation must run on server only.
3. Store session in httpOnly cookie.
4. Add basic rate-limit for login endpoint.
5. Generic login error messages.
6. Enforce HTTPS in production (Vercel default).
7. Never expose service-role key to client.

## 7. App Architecture
## 7.1 Routes
- `/login` -> login form
- `/dashboard` -> protected page that lists current user's messages
- `/api/auth/login` -> POST login
- `/api/auth/logout` -> POST logout

## 7.2 Core Modules
- `lib/supabase/server.ts` -> server-side Supabase client
- `lib/auth/session.ts` -> create/read/clear session cookie
- `lib/auth/password.ts` -> hash/verify birthday password
- `middleware.ts` -> protect dashboard route

## 8. Step-by-Step Implementation Phases
## Phase 0 - Project Bootstrap
- Initialize Next.js + TypeScript + ESLint app
- Add env template (`.env.example`)
- Install dependencies for auth, cookies, validation

Deliverable:
- Project runs with `npm run dev`

## Phase 1 - Supabase Setup
- Create Supabase project
- Create `committee_members` and `messages` tables
- Add SQL migration file in repo
- Prepare seed SQL for test users/messages

Deliverable:
- Database schema created and test data query works

## Phase 2 - Auth Core
- Implement birthday hashing utilities
- Implement session cookie helpers
- Implement `/api/auth/login` + `/api/auth/logout`
- Add basic login rate-limit

Deliverable:
- Login/logout API tested via Postman/browser

## Phase 3 - Pages + Protection
- Build `/login` UI
- Build protected `/dashboard` UI
- Implement `middleware.ts` for route protection
- Render only current user's messages

Deliverable:
- End-to-end login -> dashboard flow works

## Phase 4 - Hardening + QA
- Improve error handling and empty states
- Add minimal tests for auth + protected route behavior
- Validate production env configuration

Deliverable:
- MVP ready for Vercel deployment

## 9. Testing Plan
1. Valid login redirects to dashboard.
2. Invalid birthday password fails with generic message.
3. Access `/dashboard` without session redirects to `/login`.
4. Logged-in member cannot access another member's messages.
5. Logout invalidates session and redirects to login.

## 10. Deployment Plan (Vercel)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `SESSION_SECRET`
4. Deploy Preview, run smoke tests.
5. Promote to Production.

## 11. Risks and Mitigations
- Weak credential (birthday) -> add rate-limit + future 2FA plan.
- Data privacy -> strict server-side filtering by `member_id`.
- Secret leakage -> keep service role key server-only.

## 12. Future Enhancements
1. Admin panel for CSV import and account management.
2. Optional OTP or magic link second factor.
3. Message categories/tags and search.
4. Printable message card view.
