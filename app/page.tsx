"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { SlideController } from "@/lib/SlideController";
import {
  createEmptyMemoryManifest,
  MEMORY_GALLERY_CONFIGS,
  type MemoryGalleryItem,
  type MemoryManifestResponse,
  type MemorySlide,
} from "@/lib/memories";

import { LoginForm } from "./login/login-form";

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
  "在这里，我也遇见了很多有趣的灵魂👻，也遇到了在我心中很重要的人❤️。",
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

const MEMORY_PREVIEW_SLOT_COUNT = 3;
const MEMORY_PREVIEW_HISTORY_ITERATIONS = 10;
const MEMORY_PREVIEW_HISTORY_LIMIT = MEMORY_PREVIEW_SLOT_COUNT * MEMORY_PREVIEW_HISTORY_ITERATIONS;
const MEMORY_PRELOAD_CONCURRENCY = 2;
const MEMORY_BROWSER_FRIENDLY_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "bmp",
  "heic",
  "heif",
]);
const MEMORY_NEXT_OPTIMIZABLE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);

const memoryResolvedCandidateIndexCache = new Map<string, number>();
const memoryPreloadPromiseCache = new Map<string, Promise<number | null>>();

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function buildMemoryGalleries(
  galleriesByFolder: MemoryManifestResponse["galleries"],
): MemoryGalleryItem[] {
  return MEMORY_GALLERY_CONFIGS.map((gallery) => ({
    ...gallery,
    slides: galleriesByFolder[gallery.folder] ?? [],
  }));
}

function createPlaceholderMemorySlide(title: string, slotIndex: number): MemorySlide {
  return {
    id: `memory-placeholder-${title}-${slotIndex + 1}`,
    srcCandidates: [],
    alt: `${title} 回忆照片占位 ${slotIndex + 1}`,
  };
}

async function loadMemoryImageCandidate(src: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const normalizedSrc = src.split("#")[0]?.split("?")[0] ?? src;
  const extension = normalizedSrc.split(".").pop()?.toLowerCase() ?? "";

  if (!MEMORY_BROWSER_FRIENDLY_EXTENSIONS.has(extension)) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const image = new window.Image();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(result);
    };

    image.decoding = "async";
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().then(() => finish(true)).catch(() => finish(true));
        return;
      }

      finish(true);
    };
    image.onerror = () => {
      finish(false);
    };
    image.src = src;

    if (image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === "function") {
        image.decode().then(() => finish(true)).catch(() => finish(true));
        return;
      }

      finish(true);
    }
  });
}

function isOptimizableMemorySrc(src: string | undefined) {
  if (!src) {
    return false;
  }

  const normalizedSrc = src.split("#")[0]?.split("?")[0] ?? src;
  const extension = normalizedSrc.split(".").pop()?.toLowerCase() ?? "";
  return MEMORY_NEXT_OPTIMIZABLE_EXTENSIONS.has(extension);
}

function hasBrowserFriendlyMemoryCandidate(slide: MemorySlide) {
  return slide.srcCandidates.some((src) => {
    const normalizedSrc = src.split("#")[0]?.split("?")[0] ?? src;
    const extension = normalizedSrc.split(".").pop()?.toLowerCase() ?? "";
    return MEMORY_BROWSER_FRIENDLY_EXTENSIONS.has(extension);
  });
}

function preloadMemorySlide(slide: MemorySlide) {
  const cachedCandidateIndex = memoryResolvedCandidateIndexCache.get(slide.id);

  if (cachedCandidateIndex !== undefined) {
    return Promise.resolve(cachedCandidateIndex);
  }

  const existingPromise = memoryPreloadPromiseCache.get(slide.id);

  if (existingPromise) {
    return existingPromise;
  }

  const preloadPromise = (async () => {
    for (let candidateIndex = 0; candidateIndex < slide.srcCandidates.length; candidateIndex += 1) {
      const src = slide.srcCandidates[candidateIndex];

      if (!src) {
        continue;
      }

      const didLoad = await loadMemoryImageCandidate(src);

      if (didLoad) {
        memoryResolvedCandidateIndexCache.set(slide.id, candidateIndex);
        return candidateIndex;
      }
    }

    return null;
  })();

  memoryPreloadPromiseCache.set(slide.id, preloadPromise);

  return preloadPromise.finally(() => {
    memoryPreloadPromiseCache.delete(slide.id);
  });
}

async function preloadMemorySlides(slides: readonly MemorySlide[]) {
  const queue = [...slides];
  const workerCount = Math.min(MEMORY_PRELOAD_CONCURRENCY, queue.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (queue.length > 0) {
        const slide = queue.shift();

        if (!slide) {
          return;
        }

        await preloadMemorySlide(slide);
      }
    }),
  );
}

function useMemoryImageSource(imageId: string, srcCandidates: readonly string[]) {
  const [fallbackState, setFallbackState] = useState(() => ({
    imageId,
    candidateIndex: 0,
    failedSrc: null as string | null,
  }));

  const isCurrentImage = fallbackState.imageId === imageId;
  const cachedCandidateIndex = memoryResolvedCandidateIndexCache.get(imageId) ?? 0;
  const candidateIndex = isCurrentImage ? fallbackState.candidateIndex : cachedCandidateIndex;
  const failedSrc = isCurrentImage ? fallbackState.failedSrc : null;
  const currentSrc = srcCandidates[candidateIndex] ?? srcCandidates[0];

  function handleError() {
    if (!currentSrc || failedSrc === currentSrc) {
      return;
    }

    setFallbackState((current) => {
      const nextCandidateIndex =
        current.imageId === imageId ? current.candidateIndex : cachedCandidateIndex;
      const nextFailedSrc = current.imageId === imageId ? current.failedSrc : null;

      if (nextFailedSrc === currentSrc) {
        return current;
      }

      return {
        imageId,
        candidateIndex: nextCandidateIndex + 1,
        failedSrc: currentSrc,
      };
    });
  }

  return {
    currentSrc,
    hasImageError: !currentSrc,
    handleError,
  };
}

type MemoryPhotoSurfaceProps = {
  slide: MemorySlide;
  title: string;
  bottomLeftLabel: string;
  bottomRightLabel: string;
  sizes: string;
  priority?: boolean;
  showFooter?: boolean;
  className?: string;
};

function MemoryPhotoSurface({
  slide,
  title,
  bottomLeftLabel,
  bottomRightLabel,
  sizes,
  priority = false,
  showFooter = true,
  className = "",
}: MemoryPhotoSurfaceProps) {
  const { currentSrc, hasImageError, handleError } = useMemoryImageSource(slide.id, slide.srcCandidates);
  const canUseNextOptimization = isOptimizableMemorySrc(currentSrc);

  return (
    <div
      className={`relative overflow-hidden border border-white/10 bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_40%),linear-gradient(150deg,rgba(24,24,27,0.96),rgba(9,9,11,0.92))]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.24em] text-zinc-300">
          照片位置
        </span>
        <p className="mt-4 text-2xl font-semibold tracking-[0.08em] text-zinc-100">{title}</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-400">
          {hasImageError ? "把照片放进对应文件夹后，这里会直接显示。" : "这里会自动轮播这一组照片。"}
        </p>
      </div>
      {hasImageError ? null : (
        <Image
          key={`${slide.id}-${currentSrc}`}
          src={currentSrc}
          alt={slide.alt}
          fill
          preload={priority}
          loading="eager"
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          quality={canUseNextOptimization ? 70 : undefined}
          unoptimized={!canUseNextOptimization}
          className="relative z-10 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={handleError}
        />
      )}
      {showFooter ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-full border border-white/10 bg-black/45 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white/78 backdrop-blur">
          <span>{bottomLeftLabel}</span>
          <span>{bottomRightLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

void MemoryPhotoSurface;

function shuffleIndexes(indexes: readonly number[]) {
  const next = [...indexes];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentValue = next[index];
    const randomValue = next[randomIndex];

    if (currentValue === undefined || randomValue === undefined) {
      continue;
    }

    next[index] = randomValue;
    next[randomIndex] = currentValue;
  }

  return next;
}

function pickRandomPoolIndexes(
  pool: readonly number[],
  count: number,
  previous: readonly number[] = [],
  recentHistory: readonly number[] = [],
) {
  if (pool.length <= 0) {
    return Array.from({ length: count }, () => 0);
  }

  const uniquePickCount = Math.min(pool.length, count);
  const recentSet = new Set(recentHistory.slice(-MEMORY_PREVIEW_HISTORY_LIMIT));
  const previousSet = new Set(previous);
  const picks: number[] = [];
  const prioritizedPools = [
    shuffleIndexes(pool.filter((index) => !recentSet.has(index))),
    shuffleIndexes(pool.filter((index) => !previousSet.has(index))),
    shuffleIndexes(pool),
  ];

  for (const prioritizedPool of prioritizedPools) {
    for (const index of prioritizedPool) {
      if (picks.includes(index)) {
        continue;
      }

      picks.push(index);

      if (picks.length >= uniquePickCount) {
        break;
      }
    }

    if (picks.length >= uniquePickCount) {
      break;
    }
  }

  while (picks.length < count) {
    picks.push(picks[picks.length % Math.max(picks.length, 1)] ?? 0);
  }

  if (pool.length > 1 && picks.length === previous.length && picks.every((value, index) => value === previous[index])) {
    const alternative = shuffleIndexes(
      pool.filter((index) => !picks.includes(index) || !previousSet.has(index)),
    )[0];

    if (alternative !== undefined) {
      picks[picks.length - 1] = alternative;
    }
  }

  return picks;
}

function pickRandomSlideIndexes(
  total: number,
  count: number,
  previous: readonly number[] = [],
  recentHistory: readonly number[] = [],
) {
  return pickRandomPoolIndexes(
    Array.from({ length: total }, (_, index) => index),
    count,
    previous,
    recentHistory,
  );
}

function getMemoryStackState(activeIndex: number, index: number, total: number) {
  const offset = (index - activeIndex + total) % total;

  if (offset === 0) {
    return {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
    };
  }

  if (offset === 1) {
    return {
      x: 84,
      y: 40,
      rotate: 6,
      scale: 0.9,
      opacity: 0.72,
      zIndex: 20,
    };
  }

  return {
    x: -84,
    y: 58,
    rotate: -7,
    scale: 0.86,
    opacity: 0.56,
    zIndex: 10,
  };
}

type MemoryStationStackCardProps = {
  gallery: MemoryGalleryItem;
  index: number;
  activeIndex: number;
  galleryCount: number;
  onActivate: (index: number, isActive: boolean) => void;
};

function MemoryStationStackCard({
  gallery,
  index,
  activeIndex,
  galleryCount,
  onActivate,
}: MemoryStationStackCardProps) {
  const coverSlide =
    gallery.slides[0] ??
    ({
      id: `${gallery.title}-cover`,
      srcCandidates: [],
      alt: `${gallery.title} 封面`,
    } satisfies MemorySlide);
  const stackState = getMemoryStackState(activeIndex, index, galleryCount);
  const isActive = index === activeIndex;
  const {
    currentSrc: coverSrc,
    hasImageError,
    handleError: handleCoverError,
  } = useMemoryImageSource(coverSlide.id, coverSlide.srcCandidates);
  const canUseNextOptimization = isOptimizableMemorySrc(coverSrc);

  return (
    <motion.button
      type="button"
      onClick={() => onActivate(index, isActive)}
      initial={false}
      animate={stackState}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group absolute left-1/2 top-0 aspect-[5/4] w-[78%] -translate-x-1/2 overflow-hidden rounded-[1.8rem] text-left shadow-[0_26px_70px_rgba(3,7,18,0.38)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gallery.glowClassName}`} />
      <div className="absolute inset-0 bg-black/14" />
      {hasImageError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 px-6 text-center">
          <div>
            <p className="text-xl font-semibold text-zinc-100">{gallery.title}</p>
            <p className="mt-2 text-sm text-zinc-400">放入封面图后这里会显示固定代表照片。</p>
          </div>
        </div>
      ) : (
        <Image
          key={`${coverSlide.id}-${coverSrc}`}
          src={coverSrc}
          alt={coverSlide.alt}
          fill
          loading={isActive ? "eager" : "lazy"}
          fetchPriority={isActive ? "high" : "low"}
          sizes="(max-width: 768px) 80vw, 520px"
          quality={canUseNextOptimization ? 72 : undefined}
          unoptimized={!canUseNextOptimization}
          decoding="async"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          onError={handleCoverError}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
      <div
        className={`absolute inset-x-6 bottom-5 z-20 flex items-end justify-between gap-4 transition-opacity duration-200 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-xl font-semibold text-white sm:text-2xl">{gallery.title}</p>
        <span
          className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.26em] transition-colors ${
            isActive ? "bg-white/88 text-zinc-950" : "bg-black/35 text-white/78"
          }`}
        >
          →
        </span>
      </div>
    </motion.button>
  );
}

type MemoryRandomTileProps = {
  slide: MemorySlide;
  slotIndex: number;
};

function MemoryRandomTile({ slide, slotIndex }: MemoryRandomTileProps) {
  const { currentSrc, hasImageError, handleError } = useMemoryImageSource(slide.id, slide.srcCandidates);
  const canUseNextOptimization = isOptimizableMemorySrc(currentSrc);

  return (
    <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-2 shadow-[0_16px_34px_rgba(2,6,23,0.24)] backdrop-blur-md">
      <div className="relative aspect-square overflow-hidden rounded-[1rem]">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={`${slide.id}-${slotIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className="relative h-full overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_38%),linear-gradient(150deg,rgba(24,24,27,0.96),rgba(9,9,11,0.92))]">
              {hasImageError ? null : (
                <Image
                  key={`${slide.id}-${currentSrc}`}
                  src={currentSrc}
                  alt={slide.alt}
                  fill
                  loading="lazy"
                  fetchPriority={slotIndex === 0 ? "high" : "auto"}
                  sizes="(max-width: 768px) 33vw, 220px"
                  quality={canUseNextOptimization ? 70 : undefined}
                  unoptimized={!canUseNextOptimization}
                  decoding="async"
                  className="object-cover"
                  onError={handleError}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memorySlidesByFolder, setMemorySlidesByFolder] = useState(createEmptyMemoryManifest);
  const memoryGalleries = buildMemoryGalleries(memorySlidesByFolder);
  const memoryRecentHistoryRef = useRef<number[][]>(MEMORY_GALLERY_CONFIGS.map(() => []));

  const [activeSection, setActiveSection] = useState<SectionHref>("#qzh");
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
  const [memoryPreviewIndexes, setMemoryPreviewIndexes] = useState<number[]>(() =>
    pickRandomSlideIndexes(0, MEMORY_PREVIEW_SLOT_COUNT),
  );
  const [isMemoriesPrimed, setIsMemoriesPrimed] = useState(false);
  const [isMemoriesVisible, setIsMemoriesVisible] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const memoriesSectionRef = useRef<HTMLElement | null>(null);
  const messagesSectionRef = useRef<HTMLElement | null>(null);
  const teleprompterTrackRef = useRef<HTMLDivElement | null>(null);
  const teleprompterViewportRef = useRef<HTMLDivElement | null>(null);
  const teleprompterTextRef = useRef<HTMLDivElement | null>(null);
  const teleprompterProgressRef = useRef(0);
  const teleprompterCompletedRef = useRef(false);
  const teleprompterTouchStartYRef = useRef<number | null>(null);

  // Define the department categories, their member counts, and sticker paths.
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

  // Generate the members continuously while keeping them grouped.
  let globalIndex = 1;
  const committeeGroups = departments.map((dept) => {
    const members = Array.from({ length: dept.count }, () => {
      const id = globalIndex++;
      return {
        displayId: id,
        id: `member${id}`,
        name: MEMBER_NAMES[id - 1] ?? `Member ${id}`,
        image: `/profiles/member${id}.png`,
      };
    });

    return { title: dept.title, members, sticker: dept.sticker };
  });

  const selectedMemberImage =
    committeeGroups
      .flatMap((group) => group.members)
      .find((member) => member.id === selectedMemberId)?.image ?? "/profiles/member1.png";
  const selectedMemberName =
    committeeGroups
      .flatMap((group) => group.members)
      .find((member) => member.id === selectedMemberId)?.name ?? "成员";
  const activeMemoryItem = memoryGalleries[activeMemoryIndex] ?? memoryGalleries[0];
  const activeMemoryPreviewSlides = memoryPreviewIndexes.map(
    (slideIndex, index) =>
      activeMemoryItem.slides[slideIndex] ??
      activeMemoryItem.slides[0] ??
      createPlaceholderMemorySlide(activeMemoryItem.title, index),
  );

  function getMemoryCandidatePool(gallery: MemoryGalleryItem) {
    const browserFriendlyIndexes = gallery.slides.flatMap((slide, index) =>
      hasBrowserFriendlyMemoryCandidate(slide) ? [index] : [],
    );

    if (browserFriendlyIndexes.length > 0) {
      return browserFriendlyIndexes;
    }

    return Array.from({ length: gallery.slides.length }, (_, index) => index);
  }

  function getNextMemoryPreviewIndexes(galleryIndex: number, previous: readonly number[] = []) {
    const gallery = memoryGalleries[galleryIndex];

    if (!gallery) {
      return Array.from({ length: MEMORY_PREVIEW_SLOT_COUNT }, () => 0);
    }

    const candidatePool = getMemoryCandidatePool(gallery);
    const recentHistory = memoryRecentHistoryRef.current[galleryIndex] ?? [];
    const nextIndexes = pickRandomPoolIndexes(
      candidatePool,
      MEMORY_PREVIEW_SLOT_COUNT,
      previous,
      recentHistory,
    );

    memoryRecentHistoryRef.current[galleryIndex] = [...recentHistory, ...nextIndexes].slice(
      -MEMORY_PREVIEW_HISTORY_LIMIT,
    );

    return nextIndexes;
  }

  function activateMemoryGallery(index: number, isActive: boolean) {
    const nextIndex = isActive ? (index + 1) % memoryGalleries.length : index;
    const nextGallery = memoryGalleries[nextIndex];

    if (!nextGallery) {
      return;
    }

    setActiveMemoryIndex(nextIndex);
    setMemoryPreviewIndexes(() => getNextMemoryPreviewIndexes(nextIndex));
  }

  const rotateMemoryPreview = useEffectEvent(() => {
    setMemoryPreviewIndexes((current) => {
      const gallery = memoryGalleries[activeMemoryIndex];

      if (!gallery) {
        return current;
      }

      const candidatePool = getMemoryCandidatePool(gallery);
      const recentHistory = memoryRecentHistoryRef.current[activeMemoryIndex] ?? [];
      const nextIndexes = pickRandomPoolIndexes(
        candidatePool,
        MEMORY_PREVIEW_SLOT_COUNT,
        current,
        recentHistory,
      );

      memoryRecentHistoryRef.current[activeMemoryIndex] = [...recentHistory, ...nextIndexes].slice(
        -MEMORY_PREVIEW_HISTORY_LIMIT,
      );

      return nextIndexes;
    });
  });

  useEffect(() => {
    if (!isMemoriesPrimed) {
      return;
    }

    const visibleSlides = [
      activeMemoryItem.slides[0],
      ...memoryPreviewIndexes.map((index) => activeMemoryItem.slides[index]),
    ].filter((slide): slide is MemorySlide => Boolean(slide));
    const slidesToPreload = visibleSlides.filter(
      (slide, index, slides) => slides.findIndex((candidate) => candidate.id === slide.id) === index,
    );

    if (slidesToPreload.length === 0) {
      return;
    }

    let isCancelled = false;
    let fallbackTimerId: number | null = null;
    let idleCallbackId: number | null = null;

    const startPreload = () => {
      if (isCancelled) {
        return;
      }

      void preloadMemorySlides(slidesToPreload);
    };

    const idleWindow = window as IdleWindow;

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleCallbackId = idleWindow.requestIdleCallback(startPreload, { timeout: 700 });
    } else {
      fallbackTimerId = window.setTimeout(startPreload, 120);
    }

    return () => {
      isCancelled = true;

      if (fallbackTimerId !== null) {
        window.clearTimeout(fallbackTimerId);
      }

      if (idleCallbackId !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleCallbackId);
      }
    };
  }, [activeMemoryItem, isMemoriesPrimed, memoryPreviewIndexes]);

  useEffect(() => {
    if (!isMemoriesVisible || activeMemoryItem.slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      rotateMemoryPreview();
    }, 2000);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeMemoryIndex, activeMemoryItem.slides.length, isMemoriesVisible]);

  useEffect(() => {
    const memoriesSection = memoriesSectionRef.current;

    if (!memoriesSection) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        setIsMemoriesVisible(entry.isIntersecting);

        if (entry.isIntersecting) {
          setIsMemoriesPrimed(true);
        }
      },
      {
        root: null,
        rootMargin: "240px 0px -12% 0px",
        threshold: 0.18,
      },
    );

    observer.observe(memoriesSection);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMemoryManifest() {
      try {
        const response = await fetch("/api/memories", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data: MemoryManifestResponse = await response.json();

        if (!isMounted) {
          return;
        }

        setMemorySlidesByFolder(data.galleries);

        const initialGallery = MEMORY_GALLERY_CONFIGS[0];
        const initialSlideCount = initialGallery ? data.galleries[initialGallery.folder].length : 0;
        const initialIndexes = pickRandomSlideIndexes(initialSlideCount, MEMORY_PREVIEW_SLOT_COUNT);

        memoryRecentHistoryRef.current = MEMORY_GALLERY_CONFIGS.map(() => []);
        memoryRecentHistoryRef.current[0] = initialIndexes.slice(-MEMORY_PREVIEW_HISTORY_LIMIT);
        setMemoryPreviewIndexes(initialIndexes);
      } catch {
        // Keep the placeholder state when the manifest cannot be loaded.
      }
    }

    void loadMemoryManifest();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

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
    if (!selectedMemberId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMemberId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMemberId]);

  useEffect(() => {
    const track = teleprompterTrackRef.current;
    const textContainer = teleprompterTextRef.current;
    const messagesSection = messagesSectionRef.current;

    if (!track || !textContainer || !messagesSection) {
      return;
    }

    type TeleprompterLineMeta = {
      line: HTMLParagraphElement;
      letters: HTMLSpanElement[];
      revealOrderByLetter: number[];
      revealableCount: number;
    };

    type TeleprompterStage =
      | {
          kind: "reveal";
          lineIndex: number;
          fraction: number;
        }
      | {
          kind: "hold";
          lineIndex: number;
        }
      | {
          kind: "switch";
          lineIndex: number;
          nextLineIndex: number;
          fraction: number;
        };

    let lineMetas: TeleprompterLineMeta[] = [];
    let revealUnitsByLine: number[] = [];
    let totalTimelineUnits = 1;

    const HOLD_UNITS = 7;
    const SWITCH_UNITS = 8;
    const SWITCH_OUTGOING_CUTOFF = 0.62;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
    const isMobileViewport = () => window.matchMedia("(max-width: 768px)").matches;

    const buildTeleprompter = () => {
      textContainer.innerHTML = "";
      lineMetas = [];

      for (const lineText of TELEPROMPTER_LINES) {
        const lineElement = document.createElement("p");
        lineElement.className = "teleprompter-line";

        const letters: HTMLSpanElement[] = [];
        const revealOrderByLetter: number[] = [];
        let revealableCount = 0;

        for (const character of [...lineText]) {
          const letterElement = document.createElement("span");
          letterElement.className = "teleprompter-letter";

          if (character === " ") {
            letterElement.innerHTML = "&nbsp;";
            revealOrderByLetter.push(-1);
          } else {
            letterElement.textContent = character;
            revealOrderByLetter.push(revealableCount);
            revealableCount += 1;
          }

          letters.push(letterElement);
          lineElement.appendChild(letterElement);
        }

        textContainer.appendChild(lineElement);

        lineMetas.push({
          line: lineElement,
          letters,
          revealOrderByLetter,
          revealableCount,
        });
      }

      revealUnitsByLine = lineMetas.map((meta) => Math.max(meta.revealableCount * 0.58, 18));
      totalTimelineUnits =
        lineMetas.reduce((sum, _meta, index) => {
          const revealUnits = revealUnitsByLine[index] ?? 18;
          const switchUnits = index < lineMetas.length - 1 ? SWITCH_UNITS : HOLD_UNITS * 0.8;
          return sum + revealUnits + HOLD_UNITS + switchUnits;
        }, 0) || 1;
    };

    const resetLineStates = () => {
      lineMetas.forEach((meta) => {
        meta.line.classList.remove("is-active", "is-outgoing", "is-incoming");
        meta.line.classList.add("is-hidden");
        meta.line.style.removeProperty("--switch");
        meta.letters.forEach((letter) => {
          letter.classList.remove("active");
        });
      });
    };

    const revealLetters = (meta: TeleprompterLineMeta, revealCount: number) => {
      meta.letters.forEach((letter, letterIndex) => {
        const revealOrder = meta.revealOrderByLetter[letterIndex];
        if (revealOrder < 0 || revealOrder < revealCount) {
          letter.classList.add("active");
        } else {
          letter.classList.remove("active");
        }
      });
    };

    const revealAllLetters = (meta: TeleprompterLineMeta) => {
      revealLetters(meta, meta.revealableCount);
    };

    const resolveStage = (progress: number): TeleprompterStage => {
      const targetUnits = clamp(progress, 0, 1) * totalTimelineUnits;
      let cursor = 0;

      for (let index = 0; index < lineMetas.length; index++) {
        const revealUnits = revealUnitsByLine[index] ?? 18;
        const revealStart = cursor;
        const revealEnd = revealStart + revealUnits;

        if (targetUnits < revealEnd) {
          return {
            kind: "reveal",
            lineIndex: index,
            fraction: clamp((targetUnits - revealStart) / revealUnits, 0, 1),
          };
        }

        const holdEnd = revealEnd + HOLD_UNITS;
        if (targetUnits < holdEnd) {
          return {
            kind: "hold",
            lineIndex: index,
          };
        }

        cursor = holdEnd;

        if (index < lineMetas.length - 1) {
          const switchEnd = cursor + SWITCH_UNITS;
          if (targetUnits < switchEnd) {
            return {
              kind: "switch",
              lineIndex: index,
              nextLineIndex: index + 1,
              fraction: clamp((targetUnits - cursor) / SWITCH_UNITS, 0, 1),
            };
          }
          cursor = switchEnd;
        } else {
          const lastTailEnd = cursor + HOLD_UNITS * 0.8;
          if (targetUnits < lastTailEnd) {
            return {
              kind: "hold",
              lineIndex: index,
            };
          }
          cursor = lastTailEnd;
        }
      }

      return {
        kind: "hold",
        lineIndex: Math.max(0, lineMetas.length - 1),
      };
    };

    const applyTeleprompterState = (progress: number) => {
      if (lineMetas.length === 0) {
        return;
      }

      const stage = resolveStage(progress);
      resetLineStates();

      if (stage.kind === "reveal") {
        const meta = lineMetas[stage.lineIndex];
        if (!meta) {
          return;
        }

        meta.line.classList.remove("is-hidden");
        meta.line.classList.add("is-active");
        revealAllLetters(meta);
        return;
      }

      if (stage.kind === "hold") {
        const meta = lineMetas[stage.lineIndex];
        if (!meta) {
          return;
        }

        meta.line.classList.remove("is-hidden");
        meta.line.classList.add("is-active");
        revealAllLetters(meta);
        return;
      }

      const currentMeta = lineMetas[stage.lineIndex];
      const nextMeta = lineMetas[stage.nextLineIndex];
      if (!currentMeta || !nextMeta) {
        return;
      }

      const switchProgress = easeOutCubic(stage.fraction);

      if (switchProgress < SWITCH_OUTGOING_CUTOFF) {
        const outgoingProgress = clamp(switchProgress / SWITCH_OUTGOING_CUTOFF, 0, 1);
        currentMeta.line.classList.remove("is-hidden");
        currentMeta.line.classList.add("is-outgoing");
        currentMeta.line.style.setProperty("--switch", `${outgoingProgress}`);
        revealAllLetters(currentMeta);
        return;
      }

      const incomingProgress = clamp(
        (switchProgress - SWITCH_OUTGOING_CUTOFF) / (1 - SWITCH_OUTGOING_CUTOFF),
        0,
        1,
      );
      nextMeta.line.classList.remove("is-hidden");
      nextMeta.line.classList.add("is-incoming");
      nextMeta.line.style.setProperty("--switch", `${incomingProgress}`);
      revealAllLetters(nextMeta);
    };

    const isInLockZone = () => {
      const sectionRect = messagesSection.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.5;
      return sectionRect.top <= viewportCenter && sectionRect.bottom >= viewportCenter;
    };

    type ProgressInputSource = "wheel" | "touch" | "key";

    const syncTeleprompterCompletion = (progress: number) => {
      const isComplete = progress >= 0.999;
      teleprompterCompletedRef.current = isComplete;
      messagesSection.dataset.teleprompterStatus = isComplete ? "complete" : "locked";
      messagesSection.dataset.teleprompterProgress = progress.toFixed(3);
    };

    const updateProgressByDelta = (deltaY: number, source: ProgressInputSource) => {
      const mobile = isMobileViewport();
      const sourceAdjustedDelta =
        source === "touch" && mobile
          ? deltaY * 0.58
          : source === "wheel" && mobile
            ? deltaY * 0.82
            : deltaY;
      const normalizedDelta =
        Math.sign(sourceAdjustedDelta) *
        Math.min(Math.abs(sourceAdjustedDelta), mobile ? 48 : 72);
      const perDeltaUnit =
        1 / Math.max(totalTimelineUnits * (mobile ? 3.25 : 2.5), 1);
      const current = teleprompterProgressRef.current;
      const next = clamp(current + normalizedDelta * perDeltaUnit, 0, 1);

      if (next === current) {
        return;
      }

      teleprompterProgressRef.current = next;
      applyTeleprompterState(next);
      syncTeleprompterCompletion(next);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!isInLockZone()) {
        return;
      }

      const progress = teleprompterProgressRef.current;
      const scrollingDown = event.deltaY > 0;
      const scrollingUp = event.deltaY < 0;

      if ((scrollingDown && progress < 1) || (scrollingUp && progress > 0)) {
        event.preventDefault();
        updateProgressByDelta(event.deltaY, "wheel");
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      teleprompterTouchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isInLockZone()) {
        return;
      }

      const startY = teleprompterTouchStartYRef.current;
      const currentY = event.touches[0]?.clientY;

      if (startY === null || currentY === undefined) {
        return;
      }

      const deltaY = startY - currentY;
      const progress = teleprompterProgressRef.current;
      const scrollingDown = deltaY > 0;
      const scrollingUp = deltaY < 0;

      if ((scrollingDown && progress < 1) || (scrollingUp && progress > 0)) {
        event.preventDefault();
        updateProgressByDelta(deltaY, "touch");
        teleprompterTouchStartYRef.current = currentY;
      }
    };

    const handleTouchEnd = () => {
      teleprompterTouchStartYRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInLockZone()) {
        return;
      }

      const progress = teleprompterProgressRef.current;

      if ((event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") && progress < 1) {
        event.preventDefault();
        updateProgressByDelta(220, "key");
      }

      if ((event.key === "ArrowUp" || event.key === "PageUp") && progress > 0) {
        event.preventDefault();
        updateProgressByDelta(-220, "key");
      }
    };

    const handleResize = () => {
      buildTeleprompter();
      const clampedProgress = clamp(teleprompterProgressRef.current, 0, 1);
      teleprompterProgressRef.current = clampedProgress;
      applyTeleprompterState(clampedProgress);
      syncTeleprompterCompletion(clampedProgress);
    };

    buildTeleprompter();
    const initialProgress = clamp(teleprompterProgressRef.current, 0, 1);
    teleprompterProgressRef.current = initialProgress;
    applyTeleprompterState(initialProgress);
    syncTeleprompterCompletion(initialProgress);

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
        if (
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

  function handleMenuLinkClick() {
    setIsMobileMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 font-sans text-zinc-50 selection:bg-blue-500/30">
      <div className="fixed inset-x-0 top-0 z-50">
        {/* Navigation (Framer Style) */}
        <nav className="flex w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-950/70 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 md:px-8">
          {/* Left Corner: Main Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14">
              <Image
                src="/main-logo.png"
                alt="Club Main Logo"
                fill
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Text with subtle shine animation like the video */}
            <div className="group relative hidden overflow-hidden sm:block">
              <span className="text-lg font-bold tracking-wide text-zinc-100 md:text-xl">全中华20</span>
              <motion.div
                className="absolute left-[-100%] top-0 h-full w-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ left: "200%" }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 2 }}
              />
            </div>
          </div>

          {/* Center/Right: Nav Links & Buttons */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            {/* Desktop Links */}
            <div className="hidden items-center gap-8 text-sm font-medium md:flex">
              {SECTION_LINKS.slice(0, 3).map((link) => (
                <a key={link.href} href={link.href} className={getDesktopLinkClass(link.href)}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Framer 'Get Ticket' Style Login Button */}
            <a
              href="#login-section"
              className="group hidden items-center gap-3 rounded-full border border-blue-600 bg-white px-5 py-2.5 text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:bg-zinc-50 sm:flex"
            >
              <span className="text-sm font-bold">圈圈</span>
              <div className="rounded-full bg-blue-700 p-1 text-white transition-transform duration-300 group-hover:rotate-45">
                <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" className="-rotate-45 transform">
                  <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
                </svg>
              </div>
            </a>
            {/* Mobile Hamburger Menu */}
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

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              id="mobile-nav-menu"
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-b border-zinc-800/50 bg-zinc-950/95 px-3 py-2 backdrop-blur-xl md:hidden"
            >
              <div className="space-y-1">
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveSection(link.href);
                      handleMenuLinkClick();
                    }}
                    className={getMobileLinkClass(link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* SECTION 1: 全中华 (Hero Section) */}
      <section
        id="qzh"
        data-nav-short="QZH"
        data-nav-label="全中华"
        className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-4 pb-8 pt-24 sm:px-6 sm:pt-28 md:pb-0"
      >
        <div className="absolute left-1/4 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 mx-auto max-w-4xl text-center"
        >
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="relative mb-3 h-20 w-20 sm:mb-4 sm:h-24 sm:w-24 md:h-32 md:w-32">
              <Image src="/20th-logo.png" alt="20th Anniversary" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>
          <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-tighter sm:mb-6 sm:text-5xl md:text-8xl">
            <span className="bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
              全中华
            </span>
            <br /> 专属留言板
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-2xl">
            自：橙子🍊 机长✈️
          </p>
        </motion.div>
      </section>

      {/* SECTION 2: 回忆 (Memories & Mascot) */}
      <section
        ref={memoriesSectionRef}
        id="memories"
        data-nav-short="回忆"
        data-nav-label="回忆"
        className="relative scroll-mt-24 overflow-hidden border-t border-zinc-800/50 px-4 py-20 sm:px-6 sm:py-24 md:py-32"
      >
        <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <div className="mx-auto w-full max-w-2xl md:mx-0">
              <div className="relative h-[20rem] sm:h-[24rem] md:h-[28rem]">
                {memoryGalleries.map((gallery, index) => (
                  <MemoryStationStackCard
                    key={gallery.title}
                    gallery={gallery}
                    index={index}
                    activeIndex={activeMemoryIndex}
                    galleryCount={memoryGalleries.length}
                    onActivate={activateMemoryGallery}
                  />
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {activeMemoryPreviewSlides.map((slide, index) => (
                  <MemoryRandomTile
                    key={`${activeMemoryItem.title}-${index}-${slide.id}`}
                    slide={slide}
                    slotIndex={index}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 flex flex-col items-center text-center md:order-2 md:items-end md:text-right"
          >
            <div className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-blue-400 sm:text-sm">
              回忆 MEMORIES
            </div>
            <div className="max-w-md">
              <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-zinc-100 sm:text-4xl md:text-5xl">
                <span className="block">全中华20</span>
                <span className="mt-2 block text-blue-100">我们走到啦！🥳</span>
              </h2>
              <div className="mt-5 space-y-2 text-base leading-8 text-zinc-400 sm:text-lg">
                <p>很开心成功走完分站和总站，</p>
                <p>我收获的永远不止有成就感，</p>
                <p>还有一群很onzzzz的朋友😆</p>
              </div>
            </div>

            <div className="group relative mt-10 h-56 w-56 sm:h-72 sm:w-72 md:h-96 md:w-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 to-emerald-400/30 blur-3xl transition-all duration-500 group-hover:blur-2xl" />
              <div className="relative z-10 flex h-full w-full items-center justify-center transition-transform duration-500 hover:-translate-y-4">
                <Image
                  src="/mascot.png"
                  alt="QZH20 Dinosaur Mascot"
                  fill
                  className="object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: 感言 (Testimonials/Messages Preview) */}
      <section
        ref={messagesSectionRef}
        id="messages"
        data-nav-short="感言"
        data-nav-label="感言"
        className="snap-lock-section relative scroll-mt-24 overflow-hidden border-t border-zinc-800/50 bg-zinc-900/30 px-4 py-20 sm:px-6 sm:py-24 md:py-32"
      >
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 sm:text-sm">
              感言:眼睛尿尿了
            </div>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mb-10 sm:text-lg">阅读我这段真心的感受🥺</p>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mb-10 sm:text-lg">有你，有我，有全中华！🥰</p>
          </motion.div>

          {/* Scroll-interactive Teleprompter */}
          <div ref={teleprompterTrackRef} className="teleprompter-track">
            <div ref={teleprompterViewportRef} className="teleprompter-viewport">
              <div ref={teleprompterTextRef} className="teleprompter-text" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: 寻找自己 (Find Yourself / Login Grid) */}
      <section
        id="login-section"
        data-nav-short="圈圈"
        data-nav-label="圈圈"
        className="snap-free-section relative min-h-screen scroll-mt-24 border-t border-zinc-800/50 bg-zinc-950 px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-zinc-100 sm:text-4xl md:text-5xl">圈圈 ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧</h2>
            <p className="text-base text-zinc-400 sm:text-lg">
              快找你们帅帅妹妹的头像吧！！！！
            </p>
          </div>

          {/* Grouped Grid of Members */}
          <div className="mx-auto max-w-7xl space-y-20">
            {committeeGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-10">
                {/* Department Title */}
                <div className="flex items-center justify-center gap-4">
                  <div className="hidden h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800 sm:block" />
                  <div className="flex items-center gap-3 px-2 sm:px-4">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={group.sticker}
                        alt={`${group.title} Sticker`}
                        fill
                        className="object-contain drop-shadow-[0_0_14px_rgba(59,130,246,0.35)]"
                        priority={groupIdx < 2}
                      />
                    </div>
                    <h3 className="text-center text-xl font-bold text-zinc-200 md:text-2xl">
                      {group.title}
                    </h3>
                  </div>
                  <div className="hidden h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800 sm:block" />
                </div>

                {/* Member Grid */}
                <div className="w-full">
                  <div className="mx-auto flex w-full max-w-[1060px] flex-wrap justify-center gap-4 md:gap-6">
                    {group.members.map((member) => (
                      <div key={member.id} className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04, zIndex: 10 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedMemberId(member.id)}
                          className="group relative w-full overflow-visible bg-transparent transition-transform"
                        >
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={1200}
                            height={1600}
                            unoptimized
                            className="relative z-10 h-auto w-full object-contain object-center"
                            onError={(event) => {
                              event.currentTarget.style.opacity = "0";
                            }}
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedMemberId ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.button
                type="button"
                aria-label="Close member login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMemberId(null)}
                className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-700/50 bg-zinc-900 p-6 shadow-2xl sm:p-8"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

                <button
                  type="button"
                  onClick={() => setSelectedMemberId(null)}
                  className="absolute right-4 top-4 rounded-full bg-zinc-800/50 p-2 text-zinc-500 transition-colors hover:text-zinc-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="mb-6 mt-2 text-center">
                  <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-zinc-800 bg-zinc-950">
                    <Image
                      src={selectedMemberImage}
                      alt="Selected profile"
                      width={1024}
                      height={1024}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100">{selectedMemberName}</h3>
                </div>

                <LoginForm prefilledLoginId={selectedMemberId} />
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}

