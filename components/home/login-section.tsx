"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { MascotLoop } from "@/components/home/mascot-loop";
import type { CommitteeGroup } from "@/components/home/types";

const LazyLoginForm = dynamic(
  () => import("@/app/login/login-form").then((module) => module.LoginForm),
  {
    loading: () => (
      <div className="space-y-3">
        <div className="h-11 rounded-2xl border border-zinc-800 bg-zinc-950/70" />
        <div className="h-11 rounded-2xl border border-zinc-800 bg-zinc-950/70" />
        <div className="h-11 rounded-full bg-blue-500/20" />
      </div>
    ),
  },
);

type HomeLoginSectionProps = {
  committeeGroups: readonly CommitteeGroup[];
  defaultMemberName: string;
  sectionSubtitle: string;
  sectionTitle: string;
};

const OFFSCREEN_GROUP_STYLE = {
  containIntrinsicSize: "980px",
  contentVisibility: "auto",
} satisfies CSSProperties;

export function HomeLoginSection({
  committeeGroups,
  defaultMemberName,
  sectionSubtitle,
  sectionTitle,
}: HomeLoginSectionProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const selectedMember =
    committeeGroups
      .flatMap((group) => group.members)
      .find((member) => member.id === selectedMemberId) ?? null;
  const selectedMemberImage = selectedMember?.image ?? "/profiles/member1.png";
  const selectedMemberName = selectedMember?.name ?? defaultMemberName;

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

  return (
    <section
      id="login-section"
      data-nav-short="圈圈"
      data-nav-label="圈圈"
      className="snap-free-section relative min-h-[var(--app-screen-height)] scroll-mt-24 border-t border-zinc-800/50 bg-zinc-950 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <div className="relative mx-auto flex w-fit flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-zinc-100 sm:text-4xl md:text-5xl">{sectionTitle}</h2>
            <p className="mt-1 text-base text-zinc-400 sm:text-lg">{sectionSubtitle}</p>
            <div className="mt-4 flex justify-center md:hidden">
              <MascotLoop
                slotIndex={2}
                className="h-24 w-24 sm:h-28 sm:w-28"
              />
            </div>
            <div className="pointer-events-none absolute left-full top-1/2 ml-4 hidden -translate-y-1/2 md:block">
              <MascotLoop
                slotIndex={2}
                className="h-36 w-36 lg:h-48 lg:w-48"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-20">
          {committeeGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-10" style={OFFSCREEN_GROUP_STYLE}>
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
                      sizes="96px"
                    />
                  </div>
                  <h3 className="text-center text-xl font-bold text-zinc-200 md:text-2xl">
                    {group.title}
                  </h3>
                </div>
                <div className="hidden h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800 sm:block" />
              </div>

              <div className="w-full">
                <div className="mx-auto flex w-full max-w-[1060px] flex-wrap justify-center gap-4 md:gap-6">
                  {group.members.map((member) => (
                    <div key={member.id} className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId(member.id)}
                        className="group relative w-full overflow-visible bg-transparent transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97]"
                      >
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={1200}
                          height={1600}
                          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 240px"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          className="relative z-10 h-auto w-full object-contain object-center"
                          onError={(event) => {
                            event.currentTarget.style.opacity = "0";
                          }}
                        />
                      </button>
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
                    sizes="80px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">{selectedMemberName}</h3>
              </div>

              <LazyLoginForm prefilledLoginId={selectedMemberId} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
