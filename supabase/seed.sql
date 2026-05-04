-- QZH20 demo message seed
-- Safe to rerun: it refreshes demo messages for a small sample only.

begin;

insert into public.committee_members (login_id)
values
  ('member1'),
  ('member2'),
  ('member3')
on conflict (login_id) do nothing;

delete from public.messages
where member_id in (
  select id
  from public.committee_members
  where login_id in ('member1', 'member2', 'member3')
);

insert into public.messages (member_id, author_name, content)
select cm.id, msg.author_name, msg.content
from public.committee_members cm
join (
  values
    ('member1', '筹委A', '谢谢你在筹备期间一直帮忙协调流程，真的很稳。'),
    ('member1', '筹委B', '辛苦啦，希望你之后也继续发光发热！'),
    ('member2', '筹委C', '你很细心，活动当天有你在大家都很安心。'),
    ('member3', '筹委D', '谢谢你一直照顾大家，祝你未来一切顺利。')
) as msg(login_id, author_name, content)
on cm.login_id = msg.login_id;

commit;
