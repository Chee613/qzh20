-- QZH20 MVP seed data
-- birthday password format: YYYYMMDD

begin;

delete from public.messages;
delete from public.committee_members;

insert into public.committee_members (name, login_id, birthday, birthday_hash)
values
  (
    '陈智豪',
    'zhihao',
    date '2008-05-12',
    '$2b$10$.fe/E5VqCerq.PJCdBge2.0rebmAV4S9oeAkTrJUFNMaQh/jE1mJy'
  ),
  (
    '李欣怡',
    'xinyi',
    date '2007-02-03',
    '$2b$10$XeHDDonlFAL502qfxw.tdOkHmfCQU23tO0.R7KduQwQKnKZUP8rJq'
  ),
  (
    '王俊凯',
    'junkai',
    date '2006-11-30',
    '$2b$10$s2.HN.TX3r1Vuxh9lKbceOV1QivalS3siPEJlfjGgRGkulVPiI4KK'
  );

insert into public.messages (member_id, author_name, content)
select cm.id, msg.author_name, msg.content
from public.committee_members cm
join (
  values
    ('zhihao', '筹委A', '谢谢你在筹备期间一直帮忙协调流程，真的很稳。'),
    ('zhihao', '筹委B', '辛苦啦，希望你之后也继续发光发热！'),
    ('xinyi', '筹委C', '你很细心，活动当天有你在大家都很安心。'),
    ('junkai', '筹委D', '谢谢你一直照顾大家，祝你未来一切顺利。')
) as msg(login_id, author_name, content)
on cm.login_id = msg.login_id;

commit;
