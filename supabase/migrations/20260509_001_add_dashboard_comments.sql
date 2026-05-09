create table if not exists public.dashboard_comments (
  id uuid primary key default gen_random_uuid(),
  login_id text not null references public.member_profiles(login_id) on delete cascade,
  member_name text not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint dashboard_comments_login_id_not_blank check (char_length(trim(login_id)) > 0),
  constraint dashboard_comments_member_name_not_blank check (char_length(trim(member_name)) > 0),
  constraint dashboard_comments_content_not_blank check (char_length(trim(content)) > 0)
);

create index if not exists dashboard_comments_login_id_created_at_idx
on public.dashboard_comments(login_id, created_at desc);

alter table public.dashboard_comments enable row level security;
revoke all on table public.dashboard_comments from anon, authenticated;
