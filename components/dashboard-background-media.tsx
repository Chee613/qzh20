"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";

type DashboardBackgroundMediaProps = {
  backgroundStyle: CSSProperties;
  loginId: string;
};

export function DashboardBackgroundMedia({
  backgroundStyle,
  loginId,
}: DashboardBackgroundMediaProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasEnabledAudio, setHasEnabledAudio] = useState(false);

  async function toggleAudio() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isMuted) {
      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
        setIsMuted(false);
        setHasEnabledAudio(true);
      } catch {
        video.muted = true;
        setIsMuted(true);
      }

      return;
    }

    video.muted = true;
    setIsMuted(true);
  }

  const audioButtonLabel = isMuted
    ? hasEnabledAudio
      ? "后悔还来得及"
      : "不要点击"
    : "都讲不要按料咯";

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0" style={backgroundStyle} />
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            aria-hidden="true"
            autoPlay
            className="h-[162%] w-full -translate-y-[36%] object-cover object-top opacity-[0.52] sm:h-full sm:translate-y-0 sm:object-center"
            disablePictureInPicture
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
          >
            <source src={`/dashboard-backgrounds/${loginId}.webm`} type="video/webm" />
            <source src={`/dashboard-backgrounds/${loginId}.mp4`} type="video/mp4" />
            <source src="/dashboard-backgrounds/default.webm" type="video/webm" />
            <source src="/dashboard-backgrounds/default.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,18,22,0.08),rgba(14,18,22,0.18)_55%,rgba(11,14,17,0.34))]" />
        <div className="absolute inset-0 bg-black/16 backdrop-blur-[1.5px]" />
      </div>

      <div className="fixed bottom-3 left-3 z-20 sm:bottom-5 sm:left-5">
        <button
          type="button"
          aria-pressed={!isMuted}
          onClick={() => {
            void toggleAudio();
          }}
          className="pointer-events-auto rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/60 sm:px-4 sm:py-2 sm:text-[0.68rem]"
        >
          {audioButtonLabel}
        </button>
      </div>
    </>
  );
}
