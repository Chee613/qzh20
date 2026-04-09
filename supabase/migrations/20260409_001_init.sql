-- QZH20 MVP schema
-- Login credential is birthday in YYYYMMDD format, stored as a bcrypt hash.

create extension if not exists pgcrypto;

create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  login_id text not null unique,
  birthday date not null,
  birthday_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint committee_members_login_id_not_blank check (char_length(trim(login_id)) > 0)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.committee_members(id) on delete cascade,
  author_name text,
  content text not null,
  created_at timestamptz not null default now(),
  constraint messages_content_not_blank check (char_length(trim(content)) > 0)
);

create index if not exists messages_member_id_idx on public.messages(member_id);
create index if not exists messages_member_id_created_at_idx on public.messages(member_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists committee_members_set_updated_at on public.committee_members;
create trigger committee_members_set_updated_at
before update on public.committee_members
for each row
execute function public.set_updated_at();

alter table public.committee_members enable row level security;
alter table public.messages enable row level security;

-- This app uses server-side service-role access only for MVP.
-- Keep anon/authenticated clients blocked from direct table reads/writes.
revoke all on table public.committee_members from anon, authenticated;
revoke all on table public.messages from anon, authenticated;
