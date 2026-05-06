"use client";

import { motion } from "framer-motion";
import { useEffect, useEffectEvent, useRef } from "react";

import { MascotLoop } from "@/components/home/mascot-loop";

type HomeMessagesSectionProps = {
  badgeLabel: string;
  introLineOne: string;
  introLineTwo: string;
  onCompletionChange?: (isComplete: boolean) => void;
  teleprompterLines: readonly string[];
};

export function HomeMessagesSection({
  badgeLabel,
  introLineOne,
  introLineTwo,
  onCompletionChange,
  teleprompterLines,
}: HomeMessagesSectionProps) {
  const messagesSectionRef = useRef<HTMLElement | null>(null);
  const teleprompterTrackRef = useRef<HTMLDivElement | null>(null);
  const teleprompterViewportRef = useRef<HTMLDivElement | null>(null);
  const teleprompterTextRef = useRef<HTMLDivElement | null>(null);
  const teleprompterProgressRef = useRef(0);
  const teleprompterTouchStartYRef = useRef<number | null>(null);
  const reportCompletion = useEffectEvent((isComplete: boolean) => {
    onCompletionChange?.(isComplete);
  });

  useEffect(() => {
    const track = teleprompterTrackRef.current;
    const textContainer = teleprompterTextRef.current;
    const messagesSection = messagesSectionRef.current;

    if (!track || !textContainer || !messagesSection) {
      return;
    }

    type TeleprompterLineMeta = {
      letters: HTMLSpanElement[];
      line: HTMLParagraphElement;
      revealOrderByLetter: number[];
      revealableCount: number;
    };

    type TeleprompterStage =
      | {
          fraction: number;
          kind: "reveal";
          lineIndex: number;
        }
      | {
          kind: "hold";
          lineIndex: number;
        }
      | {
          fraction: number;
          kind: "switch";
          lineIndex: number;
          nextLineIndex: number;
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

      for (const lineText of teleprompterLines) {
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
          letters,
          line: lineElement,
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

      for (let index = 0; index < lineMetas.length; index += 1) {
        const revealUnits = revealUnitsByLine[index] ?? 18;
        const revealStart = cursor;
        const revealEnd = revealStart + revealUnits;

        if (targetUnits < revealEnd) {
          return {
            fraction: clamp((targetUnits - revealStart) / revealUnits, 0, 1),
            kind: "reveal",
            lineIndex: index,
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
              fraction: clamp((targetUnits - cursor) / SWITCH_UNITS, 0, 1),
              kind: "switch",
              lineIndex: index,
              nextLineIndex: index + 1,
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

    type ProgressInputSource = "key" | "touch" | "wheel";

    const syncTeleprompterCompletion = (progress: number) => {
      const isComplete = progress >= 0.999;
      messagesSection.dataset.teleprompterStatus = isComplete ? "complete" : "locked";
      messagesSection.dataset.teleprompterProgress = progress.toFixed(3);
      reportCompletion(isComplete);
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

    messagesSection.addEventListener("wheel", handleWheel, { passive: false });
    messagesSection.addEventListener("touchstart", handleTouchStart, { passive: true });
    messagesSection.addEventListener("touchmove", handleTouchMove, { passive: false });
    messagesSection.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      messagesSection.removeEventListener("wheel", handleWheel);
      messagesSection.removeEventListener("touchstart", handleTouchStart);
      messagesSection.removeEventListener("touchmove", handleTouchMove);
      messagesSection.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      reportCompletion(false);
    };
  }, [teleprompterLines]);

  return (
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
          <div className="relative mx-auto mb-8 flex w-fit flex-col items-center text-center sm:mb-10">
            <div className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 sm:text-sm">
              {badgeLabel}
            </div>
            <p className="mt-1 text-base leading-relaxed text-zinc-400 sm:text-lg">{introLineOne}</p>
            <p className="mt-1 text-base leading-relaxed text-zinc-400 sm:text-lg">{introLineTwo}</p>
            <div className="mt-4 flex justify-center md:hidden">
              <MascotLoop
                slotIndex={1}
                className="h-24 w-24 sm:h-28 sm:w-28"
              />
            </div>
            <div className="pointer-events-none absolute left-full top-1/2 ml-4 hidden -translate-y-1/2 md:block">
              <MascotLoop
                slotIndex={1}
                className="h-36 w-36 lg:h-48 lg:w-48"
              />
            </div>
          </div>
        </motion.div>

        <div ref={teleprompterTrackRef} className="teleprompter-track">
          <div ref={teleprompterViewportRef} className="teleprompter-viewport">
            <div ref={teleprompterTextRef} className="teleprompter-text" />
          </div>
        </div>
      </div>
    </section>
  );
}
