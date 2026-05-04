alter table public.committee_members
drop column if exists name;

alter table public.committee_members
drop column if exists birthday;

alter table public.committee_members
drop column if exists birthday_hash;

insert into public.committee_members (login_id)
select mp.login_id
from public.member_profiles mp
on conflict (login_id) do nothing;
