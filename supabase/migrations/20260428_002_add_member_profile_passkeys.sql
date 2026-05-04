alter table public.member_profiles
add column if not exists birthday_mmdd text;

alter table public.member_profiles
add column if not exists passkey_hash text;

update public.member_profiles
set
  name = seeded.name,
  nickname = seeded.nickname,
  birthday_mmdd = seeded.birthday_mmdd,
  passkey_hash = seeded.passkey_hash,
  updated_at = now()
from (
  values
    ('member1', '林靖尔', '车速第一的鳄鱼', '1102', '$2b$10$nh7qiIcRgOI5K7wQBXVKP.uspcCAgKj/0PBtkCGlatQgqvU4kN9Mq'),
    ('member2', '陈学颖', '喵喵老师', '0307', '$2b$10$U1o5EG6cM/b1T0gF9Qhl5uw2GWfCOozzdw2n83QAVizaYwWOB7O6O'),
    ('member3', '蔡勇翔', '马大最得空学长', '0919', '$2b$10$q.9jVOPdSG1vNJwpRLmRrOWlqYWWmDMGNbT6TfMsJkRLfLQVmDdSy'),
    ('member4', '许瑜恩', '最吵大喇叭', '1031', '$2b$10$ihF6aSq./IWmmGQNDSBC3.GqJD8pjH/J3Uz8EKHlyeBbAc0AC2rDe'),
    ('member5', '张玮雁', '文静少女', '0918', '$2b$10$lOnhtIJM6WNYDH8NNsr4ROg8SJ0gOG.S96SmhoAbvKMrhy0zHJ7S.'),
    ('member6', '韦晓瑜', '可爱爱笑小鱼', '0419', '$2b$10$qi.g/ve/eEKAk1j45HXIw.1t9VloVmkcUqrQGDgIjUBw/Jw3Wp2se'),
    ('member7', '陈憶欣', '凶凶的樱桃', '0915', '$2b$10$Z34dckeDlcjwBKmOyg9ASunI.hflFjZmJx18rB7zGS46L/0y1WA0m'),
    ('member8', '林萱宁', 'kelisa车神酸柠', '1105', '$2b$10$jrPe/xcu4jV9zfBaBiw5MebYVZWGOwDNq04qd2MlIwml/DU0h2Hk6'),
    ('member9', '陈一轩', 'qzh第一走心', '0221', '$2b$10$hgQfZb8B1J0S5mBvlQh8G.1HJSw3/LL4Kj8UbQdxKHMIMYTkRSBVm'),
    ('member10', '吴俊磔', '师傅！魔术高手', '0314', '$2b$10$hXXNxjToTDcYsDwseAAbnu05ou7rHrma.N9FX9qgVCHMaYglokX.q'),
    ('member11', '黄振超', '愤怒emo鸟鸟', '0509', '$2b$10$btApuzuBSXp88O82reKE3OGb1HWCpKdsGLVeiKMP8Ae1D8qHzrWR2'),
    ('member12', '林挺耀', '意大利面男孩', '0329', '$2b$10$zir6EclZJdX76QpC4mOjS.zCFdbkMg5kx4ay3pTWcKc5NemmwzdXy'),
    ('member13', '蔡昕颖', '长腿排球少女', '1213', '$2b$10$Gv0oVj4Fe6ccOgm2mBVKKeyIenIBFAjFZ26NsF7mzB02D4H8qazXq'),
    ('member14', '李明道', 'babi mingdao', '1120', '$2b$10$l1QWvohJfw2BGbaDhN2SCukrmStWkGA0mZTEyfNT/wiFVKQZjqkO6'),
    ('member15', '陈怡静', 'fsktm拖鞋战神', '1231', '$2b$10$dFQkmxGc/Ygvb.ZTD37CsepIu90MDTliv7JF97u2Dn1INxpWWrkL6'),
    ('member16', '林瑞轩', '醉翁胡言乱语', '0407', '$2b$10$UqcL9/BJGBhzUonKtHh3XOiAdf0n3oxM.Y2femMurPBdW7UjLOjW.'),
    ('member17', '刘莞筠', '鼓神老大', '0819', '$2b$10$O4iTYpSMsezP7aYtE18sTummBaj7se8u.bEY19k/ouUE6ymW3Kfem'),
    ('member18', '杨俊安', 'bobo in the sky', '1107', '$2b$10$g4xrNu2EF6kzHHZC0zI2EuzffSRz4MosO.5IPgNCpyQwj.6Whykna'),
    ('member19', '周健锋', 'kk10 bossku', '1019', '$2b$10$NNW0fw0ls3GEDhk.CzarA.KEwC0mrXNG4CzRDL1bfT9S2qQWJQcPi'),
    ('member20', '罗智轩', '阳光大男孩', '0412', '$2b$10$LRGXBiyboTjUO8elUAWqCe0WxCOf6tFNvp/ZkCvAf5W7Z2oIazEnS'),
    ('member21', '陈淑娟', '文抒少女', '0607', '$2b$10$Zxc6G1HPF60pS2PQN8f27ueLFF.UTN4xR4aCdTqELzMSeMhRoOx1S'),
    ('member22', '龙辉翔', '龙的传人', '0109', '$2b$10$14n/fDInWvc766Pw/vUumu6MFcTcY7SeTNh5/E08gTE4gKz0VGDOq'),
    ('member23', '杨佳文', 'banana', '0317', '$2b$10$Tjjjs8MjRCM1lrzFLDiQG.yGgqFc5Kz9TS2PkK7TqM7DZkWvKZVpK'),
    ('member24', '曾浩健', 'abunene韦德', '0806', '$2b$10$UICfvfF./GXWlS3yQDUY7u6g/XGNU9rm.it9nUFzA5SEeZtCGy4pG'),
    ('member25', '黄哲敔', '三技哥', '1225', '$2b$10$aGD.CjBCVwcYULmDJ0G2juLN2Lxczln.7lX3RHCddrBNrUSShMFHS'),
    ('member26', '黄梓宸', 'navy猛男', '0826', '$2b$10$uHvQ6ZULFVJAwa9pMeFJ2OcEjv16z49caJEpt2IbSi7IZ/O7Y30Fa'),
    ('member27', '张均宏', 'jayson', '0514', '$2b$10$fZ9JtxZ1oLMhZkEPeMzYYOvctpIdIm5smwjpX1s6uzEm2.jJz7Wxa'),
    ('member28', '林纨蒨', '最强分数榜', '0218', '$2b$10$B4hPTaM/w7CrzakaGJJeuu9WIKdU3YugU/o7uEL0As2nTPQkkWrdm'),
    ('member29', '欧梨诗', 'lyzz喵喵', '0225', '$2b$10$ZqfcLo9zZtlDT9SqU1waqeLlOBPO6IDLIci2GkHfwp1uwaw5wyd7y'),
    ('member30', '董芯妤', '董总', '0209', '$2b$10$4HInw7vrB5.a3GZguK/VrOrbhoaKSvuUByF71//m1h44POa7jh5yW'),
    ('member31', '梁淇善', '旗扇', '0319', '$2b$10$LfnqnA0eFkS0xTExKriAXeqjPW9A.qGgxL5i3oHfQqmSbCdgOOkdu'),
    ('member32', '梁慜蕻', '文静艺术家', '1207', '$2b$10$KxG8NqSU1smQtJcyefHudOA07XyZaagk2Ay0rf3Ff.fPWFgkyPkzu'),
    ('member33', '萧欣彤', '你是我的神!', '0613', '$2b$10$7hCha3/N2dZqy5AK4mgsfu.SzstOTZ/hh9G4Y5F.IvUDGY9kLmQ26'),
    ('member34', '郑凯尹', '最强三脚架', '0529', '$2b$10$NHh2Cz6VKaIhZ/mnFnIV..io8yyNWOh.6UuGFdbLZQhv7YEj2s3Li'),
    ('member35', '胡莹莹', '赢赢yay', '1117', '$2b$10$BjbrT4/fThTEeWso/FAK9ecK2X8NAN0MKBOHjh/Aeu4ec.e6pxPMa'),
    ('member36', '梁子琦', '国家“动”梁', '0104', '$2b$10$J2CN5hq9VCojEwa.KlIOb.7GZgWrJcsx.Lt2aDbJmIhtzj0FQXHD2'),
    ('member37', '戴嘉栗', '栗栗老师', '0921', '$2b$10$GJAt/G9TYJZsL77I5bo2l.q9Sj6jFXJsECemRGCu1sEPOazLYsUJy'),
    ('member38', '林京妗', 'archibee🐝', '1010', '$2b$10$MyKRhosTOOe4.414FnHcXe64jYiXZy.puY5OiUtTJwLyJNOwc6op.'),
    ('member39', '蔡镱欣', 'pupu🧸🧸', '0604', '$2b$10$VgvX/8X519R06fT8f10iV.eghRWYqCNZt0XdLogJNFWiJK86dgnre'),
    ('member40', '朱稼乐', '合家欢乐', '0312', '$2b$10$/h6RluWyKGdrVOMPOem6.egTGkG3X0L5.cCED18QcIHVyBIsOUg02'),
    ('member41', '蒋伊晴', 'qzh女歌神', '0212', '$2b$10$mSuiYMXCMSaxNaSYdZbwGOY4a/mg2bziDkPygXUaTs4hdiOhrPLSC'),
    ('member42', '陈泽贤', 'qzh男歌神', '0306', '$2b$10$q7o.ceAX0ehr4HDwGBSkgeKyTB51t1KMqlNW.wwvNPAKg0S9hmxle'),
    ('member43', '罗泉城', '老大筹父', '0522', '$2b$10$h5tcg0bN2yE1EOXGfDR2N.tsNFf7.9QfBcpU2uXwVsFWwuPoIHscq'),
    ('member44', '谢锦源', 'qzh小帅姆斯', '0508', '$2b$10$OqUU3ApflTD46oSzfwlBE.ENkXHoL453ErItRyFiuK5eGL/XgRqeW'),
    ('member45', '潘枷臻', 'ensheng很帅', '0110', '$2b$10$k0xC44IcEPmlc5mvsh0e6esIIW1xCOpNVnjaOUJXMKWa8D8Mb02x2'),
    ('member46', '陈志杰', '橙子机长', '0613', '$2b$10$UMm5N33UogPt.3MZuZKVMO8AHTi7HHM6cDhBIigIHeFlmLKTOumvK')
) as seeded(login_id, name, nickname, birthday_mmdd, passkey_hash)
where public.member_profiles.login_id = seeded.login_id;

alter table public.member_profiles
alter column birthday_mmdd set not null;

alter table public.member_profiles
alter column passkey_hash set not null;
