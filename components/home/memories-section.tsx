"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { TransparentMascotVideo } from "@/components/transparent-mascot-video";
import { getMascotVideoManifest, getMemoryManifest } from "@/lib/asset-manifests";
import {
  MEMORY_GALLERY_CONFIGS,
  type MemoryGalleryItem,
  type MemoryManifestResponse,
  type MemorySlide,
} from "@/lib/memories";

type HomeMemoriesSectionProps = {
  badgeLabel: string;
  descriptionLines: readonly string[];
  headlineBottom: string;
  headlineTop: string;
};

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
const MASCOT_INTERACTION_MIN_DELAY_MS = 9_000;
const MASCOT_INTERACTION_MAX_DELAY_MS = 22_000;

const memoryResolvedCandidateIndexCache = new Map<string, number>();
const memoryPreloadPromiseCache = new Map<string, Promise<number | null>>();

const STATIC_MEMORY_MANIFEST = getMemoryManifest();
const STATIC_MASCOT_INTERACTION_VIDEOS = [...getMascotVideoManifest()];

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function buildMemoryGalleries(
  galleriesByFolder: MemoryManifestResponse["galleries"],
): MemoryGalleryItem[] {
  return MEMORY_GALLERY_CONFIGS.map((gallery) => ({
    ...gallery,
    slides: galleriesByFolder[gallery.folder] ?? [],
  }));
}

function getInitialMemoryPreviewIndexes(galleriesByFolder: MemoryManifestResponse["galleries"]) {
  const initialGallery = MEMORY_GALLERY_CONFIGS[0];
  const initialSlides = initialGallery ? galleriesByFolder[initialGallery.folder] ?? [] : [];
  const initialSlideCount = initialSlides.length;

  if (initialSlideCount <= 0) {
    return Array.from({ length: MEMORY_PREVIEW_SLOT_COUNT }, () => 0);
  }

  return Array.from(
    { length: MEMORY_PREVIEW_SLOT_COUNT },
    (_, index) => index % initialSlideCount,
  );
}

function createPlaceholderMemorySlide(title: string, slotIndex: number): MemorySlide {
  return {
    id: `memory-placeholder-${title}-${slotIndex + 1}`,
    srcCandidates: [],
    alt: `${title} memory placeholder ${slotIndex + 1}`,
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
    handleError,
    hasImageError: !currentSrc,
  };
}

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

function pickRandomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomMascotInteraction(
  videos: readonly string[],
  previousIndex: number | null,
): { index: number; src: string } | null {
  if (videos.length <= 0) {
    return null;
  }

  const eligibleIndexes = videos
    .map((_, index) => index)
    .filter((index) => videos.length === 1 || index !== previousIndex);
  const nextIndex = eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)] ?? 0;
  const nextSrc = videos[nextIndex];

  if (!nextSrc) {
    return null;
  }

  return {
    index: nextIndex,
    src: nextSrc,
  };
}

function getMemoryStackState(activeIndex: number, index: number, total: number) {
  const offset = (index - activeIndex + total) % total;

  if (offset === 0) {
    return {
      opacity: 1,
      rotate: 0,
      scale: 1,
      x: 0,
      y: 0,
      zIndex: 30,
    };
  }

  if (offset === 1) {
    return {
      opacity: 0.72,
      rotate: 6,
      scale: 0.9,
      x: 84,
      y: 40,
      zIndex: 20,
    };
  }

  return {
    opacity: 0.56,
    rotate: -7,
    scale: 0.86,
    x: -84,
    y: 58,
    zIndex: 10,
  };
}

type MemoryStationStackCardProps = {
  activeIndex: number;
  gallery: MemoryGalleryItem;
  galleryCount: number;
  index: number;
  onActivate: (index: number, isActive: boolean) => void;
};

function MemoryStationStackCard({
  activeIndex,
  gallery,
  galleryCount,
  index,
  onActivate,
}: MemoryStationStackCardProps) {
  const coverSlide =
    gallery.slides[0] ??
    ({
      id: `${gallery.title}-cover`,
      srcCandidates: [],
      alt: `${gallery.title} cover`,
    } satisfies MemorySlide);
  const stackState = getMemoryStackState(activeIndex, index, galleryCount);
  const isActive = index === activeIndex;
  const {
    currentSrc: coverSrc,
    handleError: handleCoverError,
    hasImageError,
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
            <p className="mt-2 text-sm text-zinc-400">Add a cover image and it will appear here.</p>
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
  const { currentSrc, handleError, hasImageError } = useMemoryImageSource(slide.id, slide.srcCandidates);
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

export function HomeMemoriesSection({
  badgeLabel,
  descriptionLines,
  headlineBottom,
  headlineTop,
}: HomeMemoriesSectionProps) {
  const memoryGalleries = buildMemoryGalleries(STATIC_MEMORY_MANIFEST);
  const memoryRecentHistoryRef = useRef<number[][]>(
    MEMORY_GALLERY_CONFIGS.map((_gallery, galleryIndex) =>
      galleryIndex === 0 ? getInitialMemoryPreviewIndexes(STATIC_MEMORY_MANIFEST) : [],
    ),
  );
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
  const [memoryPreviewIndexes, setMemoryPreviewIndexes] = useState<number[]>(() =>
    getInitialMemoryPreviewIndexes(STATIC_MEMORY_MANIFEST),
  );
  const [isMemoriesPrimed, setIsMemoriesPrimed] = useState(false);
  const [isMemoriesVisible, setIsMemoriesVisible] = useState(false);
  const [activeMascotInteractionSrc, setActiveMascotInteractionSrc] = useState<string | null>(null);
  const memoriesSectionRef = useRef<HTMLElement | null>(null);
  const lastMascotInteractionIndexRef = useRef<number | null>(null);

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
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeMemoryItem.slides.length, isMemoriesVisible]);

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
        } else {
          setActiveMascotInteractionSrc(null);
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
    if (!isMemoriesVisible) {
      return;
    }

    if (activeMascotInteractionSrc || STATIC_MASCOT_INTERACTION_VIDEOS.length <= 0) {
      return;
    }

    const delay = pickRandomDelay(
      MASCOT_INTERACTION_MIN_DELAY_MS,
      MASCOT_INTERACTION_MAX_DELAY_MS,
    );
    const timeoutId = window.setTimeout(() => {
      const nextInteraction = pickRandomMascotInteraction(
        STATIC_MASCOT_INTERACTION_VIDEOS,
        lastMascotInteractionIndexRef.current,
      );

      if (!nextInteraction) {
        return;
      }

      lastMascotInteractionIndexRef.current = nextInteraction.index;
      setActiveMascotInteractionSrc(nextInteraction.src);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeMascotInteractionSrc, isMemoriesVisible]);

  return (
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
            {badgeLabel}
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-zinc-100 sm:text-4xl md:text-5xl">
              <span className="block">{headlineTop}</span>
              <span className="mt-2 block text-blue-100">{headlineBottom}</span>
            </h2>
            <div className="mt-5 space-y-2 text-base leading-8 text-zinc-400 sm:text-lg">
              {descriptionLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="group relative mt-10 h-56 w-56 sm:h-72 sm:w-72 md:h-96 md:w-96">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 to-emerald-400/30 transition-all duration-500 ${
                activeMascotInteractionSrc ? "scale-105 blur-2xl" : "blur-3xl group-hover:blur-2xl"
              }`}
            />
            <div className="relative z-10 flex h-full w-full items-center justify-center overflow-visible transition-transform duration-500 hover:-translate-y-4">
              <Image
                src="/mascot.png"
                alt="QZH20 Dinosaur Mascot"
                fill
                className={`object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-opacity duration-300 ${
                  activeMascotInteractionSrc ? "opacity-0" : "opacity-100"
                }`}
              />
              <AnimatePresence>
                {activeMascotInteractionSrc ? (
                  <motion.div
                    key={activeMascotInteractionSrc}
                    initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.96, rotate: 2 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <TransparentMascotVideo
                      src={activeMascotInteractionSrc}
                      loop={false}
                      preload="metadata"
                      maxFps={16}
                      processingScale={0.72}
                      onEnded={() => {
                        setActiveMascotInteractionSrc(null);
                      }}
                      onError={() => {
                        setActiveMascotInteractionSrc(null);
                      }}
                      className="h-full w-full"
                      canvasClassName="h-full w-full drop-shadow-[0_0_42px_rgba(96,165,250,0.45)]"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
