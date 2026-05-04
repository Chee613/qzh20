create table if not exists public.member_profiles (
  login_id text primary key,
  name text not null,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_profiles_login_id_not_blank check (char_length(trim(login_id)) > 0),
  constraint member_profiles_name_not_blank check (char_length(trim(name)) > 0),
  constraint member_profiles_nickname_not_blank check (char_length(trim(nickname)) > 0)
);

drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at
before update on public.member_profiles
for each row
execute function public.set_updated_at();

alter table public.member_profiles enable row level security;
revoke all on table public.member_profiles from anon, authenticated;

insert into public.member_profiles (login_id, name, nickname)
values
  ('member1', '林靖尔', '车速第一的鳄鱼'),
  ('member2', '陈学颖', '喵喵老师'),
  ('member3', '蔡勇翔', '马大最得空学长'),
  ('member4', '许瑜恩', '最吵大喇叭'),
  ('member5', '张玮雁', '文静少女'),
  ('member6', '韦晓瑜', '可爱爱笑小鱼'),
  ('member7', '陈憶欣', '凶凶的樱桃'),
  ('member8', '林萱宁', 'kelisa车神酸柠'),
  ('member9', '陈一轩', 'qzh第一走心'),
  ('member10', '吴俊磔', '师傅！魔术高手'),
  ('member11', '黄振超', '愤怒emo鸟鸟'),
  ('member12', '林挺耀', '意大利面男孩'),
  ('member13', '蔡昕颖', '长腿排球少女'),
  ('member14', '李明道', 'babi mingdao'),
  ('member15', '陈怡静', '不要跌倒老师！'),
  ('member16', '林瑞轩', 'fsktm拖鞋战神'),
  ('member17', '刘莞筠', '鼓神老大'),
  ('member18', '杨俊安', 'bobo in the sky'),
  ('member19', '周健锋', 'kk10 bossku'),
  ('member20', '罗智轩', '阳光大男孩'),
  ('member21', '陈淑娟', '文抒少女'),
  ('member22', '龙辉翔', '龙的传人'),
  ('member23', '杨佳文', 'banana'),
  ('member24', '曾浩健', 'abunene韦德'),
  ('member25', '黄哲敔', '三技哥'),
  ('member26', '黄梓宸', 'navy猛男'),
  ('member27', '张均宏', 'jayson'),
  ('member28', '林纨蒨', '最强分数榜'),
  ('member29', '欧梨诗', 'lyzz喵喵'),
  ('member30', '董芯妤', '董总'),
  ('member31', '梁淇善', '旗扇'),
  ('member32', '梁慜蕻', '文静艺术家'),
  ('member33', '萧欣彤', '你是我的神!'),
  ('member34', '郑凯尹', '最强三脚架'),
  ('member35', '胡莹莹', '赢赢yay'),
  ('member36', '梁子琦', '国家“动”梁'),
  ('member37', '戴嘉栗', '栗栗老师'),
  ('member38', '林京妗', 'archibee🐝'),
  ('member39', '蔡镱欣', 'pupu🧸🧸'),
  ('member40', '朱稼乐', '合家欢乐'),
  ('member41', '蒋伊晴', 'qzh女歌神'),
  ('member42', '陈泽贤', 'qzh男歌神'),
  ('member43', '罗泉城', '老大筹父'),
  ('member44', '谢锦源', 'qzh小帅姆斯'),
  ('member45', '潘枷臻', 'ensheng很帅'),
  ('member46', '陈志杰', '橙子机长')
on conflict (login_id) do update
set
  name = excluded.name,
  nickname = excluded.nickname,
  updated_at = now();
