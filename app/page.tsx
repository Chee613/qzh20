"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { CommitteeGroup } from "@/components/home/types";
import { SlideController } from "@/lib/SlideController";

const HomeMascotLoop = dynamic(
  () => import("@/components/home/mascot-loop").then((module) => module.MascotLoop),
);
const HomeMemoriesSection = dynamic(
  () => import("@/components/home/memories-section").then((module) => module.HomeMemoriesSection),
);
const HomeMessagesSection = dynamic(
  () => import("@/components/home/messages-section").then((module) => module.HomeMessagesSection),
);
const HomeLoginSection = dynamic(
  () => import("@/components/home/login-section").then((module) => module.HomeLoginSection),
);

const SECTION_LINKS = [
  { href: "#qzh", label: "全中华" },
  { href: "#memories", label: "回忆" },
  { href: "#messages", label: "感言" },
  { href: "#login-section", label: "圈圈" },
] as const;

type SectionHref = (typeof SECTION_LINKS)[number]["href"];

const TELEPROMPTER_LINES = [
  "这一天终究还是来了🕰️，",
  "后头望去我们相处的时光已经六个月了🗓️，",
  "说长嘛有点太快了感觉恍惚之间就结束💨，",
  "说短吗我们从迎新会的社恐🙈变得越来越熟悉，越来越放开自我🌟。",
  "全中华真的是给我一种很特别的体验✨，",
  "是我这一辈子都应该无法再感受到的感觉🥺。",
  "从最初的犹豫不决🤔，到如今的无悔选择💯，全中华让我看见了一个完全不一样的一面🌈。",
  "与其说它是举办生活营的团体🏕️，不如说它更像是一个心连着心💞、把每件事都做到最好的大家庭🏡。",
  "为什么是”大家庭“？因为这里有“大人”照顾我们这些顽皮的“小孩”👨‍👩‍👧‍👦。",
  "我在这里看到最特别的东西就是大家打破了传统的等级森严🧱，实现了去阶级化的相处方式🤝。",
  "在这里，我也遇见了很多有趣的灵魂👻，很可爱的人❤️。",
  "在这里你可以放开的笑😆，放开的哭😭，做错了也没事，",
  "他们不责怪你，他们包容你的错误🫂，接纳你的脾气，",
  "在这极高包容性的环境，让我感受到了只有家才能给予的温暖☀️。",
  "谢谢你们把我原本黑白暗淡的大一生活🎓，染成了五彩斑斓🎨。",
  "有并肩合作的日子💪，有放声大笑的瞬间😂，也有抱怨却依然坚持的时刻🔥。",
  "这些回忆弥足珍贵💎，将永远刻在我心底💖。",
  "人与人之间相遇的概率只有0.0003%🎲，你我相遇便是一段珍贵的缘分🍀，",
  "全中华20我们不说再见🚫👋，只说期待下一次的相聚（约饭）🍲🍻。",
  "相遇是缘分，再聚是重逢！🥂🎉",
];

const MEMBER_NAMES = [
  "林靖尔",
  "陈学颖",
  "蔡勇翔",
  "许瑜恩",
  "张玮雁",
  "韦晓瑜",
  "陈憶欣",
  "林萱宁",
  "陈一轩",
  "吴俊磔",
  "黄振超",
  "林挺耀",
  "蔡昕颖",
  "李明道",
  "陈怡静",
  "林瑞轩",
  "刘莞筠",
  "杨俊安",
  "周健锋",
  "罗智轩",
  "陈淑娟",
  "龙辉翔",
  "杨佳文",
  "曾浩健",
  "黄哲敔",
  "黄梓宸",
  "张均宏",
  "林纨蒨",
  "欧梨诗",
  "董芯妤",
  "梁淇善",
  "梁慜蕻",
  "萧欣彤",
  "郑凯尹",
  "胡莹莹",
  "梁子琦",
  "戴嘉栗",
  "林京妗",
  "蔡镱欣",
  "朱稼乐",
  "蒋伊晴",
  "陈泽贤",
  "罗泉城",
  "谢锦源",
  "潘枷臻",
  "陈志杰",
] as const;

const COMMITTEE_GROUPS = buildCommitteeGroups();

function buildCommitteeGroups(): CommitteeGroup[] {
  const departments = [
    { title: "主席团，约饭喝茶鼻祖 🍵🍚", count: 3, sticker: "/stickers/主席团.png" },
    { title: "行政，行政行政吵吵吵🐟🐠🕊️🍒", count: 4, sticker: "/stickers/行政.png" },
    { title: "节目，出意外就完美🍋🐦", count: 7, sticker: "/stickers/节目.png" },
    { title: "课程，对不起老师🧑‍🏫👉👈", count: 8, sticker: "/stickers/课程.png" },
    { title: "总务，很重！很重！肯定！！🪑🪑", count: 8, sticker: "/stickers/总务.png" },
    { title: "美术，穿小太阳的方大同kawaiii🫘🎨", count: 6, sticker: "/stickers/美术.png" },
    { title: "联宣，圆圆圈圈圈圈圆圆🫨😵 💫", count: 6, sticker: "/stickers/联宣.png" },
    { title: "筹募，DDKing金主爸爸😎💰🤑", count: 4, sticker: "/stickers/筹募.png" },
  ];

  let globalIndex = 1;

  return departments.map((department) => {
    const members = Array.from({ length: department.count }, () => {
      const id = globalIndex++;

      return {
        displayId: id,
        id: `member${id}`,
        image: `/profiles/member${id}.png`,
        name: MEMBER_NAMES[id - 1] ?? `Member ${id}`,
      };
    });

    return {
      members,
      sticker: department.sticker,
      title: department.title,
    };
  });
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionHref>("#qzh");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const teleprompterCompletedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries.length === 0) {
          return;
        }

        const mostVisible = visibleEntries[0];
        const nextActive = `#${mostVisible.target.id}` as SectionHref;
        setActiveSection(nextActive);
      },
      {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    for (const link of SECTION_LINKS) {
      const sectionId = link.href.slice(1);
      const section = document.getElementById(sectionId);
      if (section) {
        observer.observe(section);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;

      if (mobileMenuRef.current?.contains(targetNode)) {
        return;
      }

      if (mobileMenuButtonRef.current?.contains(targetNode)) {
        return;
      }

      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const slideController = new SlideController({
      sectionSelector: "main > section",
      threshold: 0.5,
      lockDurationMs: 600,
      swipeThresholdPx: 50,
      mobileSwipeThresholdPx: 86,
      mobileSwipeDamping: 0.7,
      mobileLockDurationMs: 820,
      disableSwipeSelector: "main > section:not(#messages), #messages .teleprompter-track",
      dotLabelAttribute: "data-nav-short",
      canTransition: ({ currentSection, targetSection }) => {
        const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

        if (
          !isMobileViewport &&
          currentSection.id === "messages" &&
          targetSection.id !== "messages" &&
          !teleprompterCompletedRef.current
        ) {
          return false;
        }

        return true;
      },
    });

    slideController.init();

    return () => {
      slideController.destroy();
    };
  }, []);

  function getDesktopLinkClass(href: string) {
    return `transition-colors ${
      activeSection === href ? "text-blue-300" : "text-zinc-400 hover:text-zinc-100"
    }`;
  }

  function getMobileLinkClass(href: string) {
    return `block rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
      activeSection === href
        ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
        : "border-transparent text-zinc-200 hover:border-zinc-800 hover:bg-zinc-900"
    }`;
  }

  function scrollToSection(href: SectionHref) {
    const sectionId = href.slice(1);
    const section = document.getElementById(sectionId);

    setActiveSection(href);
    setIsMobileMenuOpen(false);

    if (!section) {
      window.history.replaceState(null, "", href);
      return;
    }

    const navHeight = getComputedStyle(document.documentElement).getPropertyValue("--site-nav-height").trim();
    const navOffset = navHeight ? Number.parseFloat(navHeight) * 16 : 76;
    const targetTop = Math.max(0, section.getBoundingClientRect().top + window.scrollY - navOffset);

    window.history.replaceState(null, "", href);
    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-[var(--app-screen-height)] bg-zinc-950 font-sans text-zinc-50 selection:bg-blue-500/30">
      <div className="fixed inset-x-0 top-0 z-50">
        <nav className="flex w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-950/70 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 md:px-8">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14">
              <Image
                src="/main-logo.png"
                alt="Club Main Logo"
                fill
                className="object-contain drop-shadow-md"
              />
            </div>
            <div className="group relative hidden overflow-hidden sm:block">
              <span className="text-lg font-bold tracking-wide text-zinc-100 md:text-xl">全中华20</span>
              <div aria-hidden="true" className="nav-shine" />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <div className="hidden items-center gap-8 text-sm font-medium md:flex">
              {SECTION_LINKS.slice(0, 3).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={getDesktopLinkClass(link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <a
              href="#login-section"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#login-section");
              }}
              className="group hidden items-center gap-3 rounded-full border border-blue-600 bg-white px-5 py-2.5 text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:bg-zinc-50 sm:flex"
            >
              <span className="text-sm font-bold">圈圈</span>
              <div className="rounded-full bg-blue-700 p-1 text-white transition-transform duration-300 group-hover:rotate-45">
                <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" className="-rotate-45 transform">
                  <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
                </svg>
              </div>
            </a>

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 md:hidden"
            >
              <span
                className={`h-[2px] w-5 rounded-full bg-zinc-100 transition-transform duration-300 ${
                  isMobileMenuOpen ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[2px] w-5 rounded-full bg-zinc-100 transition-transform duration-300 ${
                  isMobileMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        <div
          id="mobile-nav-menu"
          ref={mobileMenuRef}
          className={`overflow-hidden border-b border-zinc-800/50 bg-zinc-950/95 px-3 backdrop-blur-xl transition-[max-height,opacity,padding] duration-200 ease-out md:hidden ${
            isMobileMenuOpen ? "max-h-72 py-2 opacity-100" : "pointer-events-none max-h-0 py-0 opacity-0"
          }`}
        >
          <div className="space-y-1">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(link.href);
                }}
                className={getMobileLinkClass(link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <section
        id="qzh"
        data-nav-short="QZH"
        data-nav-label="全中华"
        className="relative flex min-h-[calc(var(--app-screen-height)-var(--site-nav-height))] scroll-mt-24 flex-col items-center justify-start overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pt-32 md:justify-center md:pb-0"
      >
        <div className="absolute left-1/4 top-1/4 -z-10 h-[320px] w-[320px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[260px] w-[260px] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen sm:h-[400px] sm:w-[400px]" />

        <div className="z-10 mx-auto max-w-4xl text-center">
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="relative mb-3 h-20 w-20 sm:mb-4 sm:h-24 sm:w-24 md:h-32 md:w-32">
              <Image src="/20th-logo.png" alt="20th Anniversary" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>
          <div className="relative mx-auto flex w-fit flex-col items-center">
            <div className="text-center">
              <h1 className="text-4xl font-black leading-[1.05] tracking-tighter sm:text-5xl md:text-8xl">
                <span className="bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
                  全中华
                </span>
                <br /> 专属留言板
              </h1>
              <p className="mt-1 text-base leading-relaxed text-zinc-400 sm:text-lg md:text-2xl">
                自：橙子🍊 机长✈️
              </p>
            </div>
            <div className="mt-4 flex justify-center md:hidden">
              <HomeMascotLoop
                slotIndex={0}
                className="h-24 w-24 sm:h-28 sm:w-28"
              />
            </div>
            <div className="pointer-events-none absolute left-full top-1/2 ml-4 hidden -translate-y-1/2 md:block">
              <HomeMascotLoop
                slotIndex={0}
                className="h-36 w-36 lg:h-48 lg:w-48"
              />
            </div>
          </div>
        </div>
      </section>

      <HomeMemoriesSection
        badgeLabel="回忆 MEMORIES"
        headlineTop="全中华20"
        headlineBottom="我们走到啦！🥳"
        descriptionLines={[
          "很开心成功走完分站和总站，",
          "我收获的永远不止有成就感，",
          "还有一群很onzzzz的朋友😆",
        ]}
      />

      <HomeMessagesSection
        badgeLabel="感言:眼睛尿尿了"
        introLineOne="阅读我这段真心的感受🥺"
        introLineTwo="有你，有我，有全中华！🥰"
        teleprompterLines={TELEPROMPTER_LINES}
        onCompletionChange={(isComplete) => {
          teleprompterCompletedRef.current = isComplete;
        }}
      />

      <HomeLoginSection
        committeeGroups={COMMITTEE_GROUPS}
        defaultMemberName="成员"
        sectionTitle="圈圈 ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧"
        sectionSubtitle="快找你们帅帅美美的头像吧！！！！"
      />
    </main>
  );
}
