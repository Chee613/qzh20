"use client";

import { motion } from "framer-motion";

import { TransparentMascotVideo } from "@/components/transparent-mascot-video";
import { getMascotVideoManifest } from "@/lib/asset-manifests";

type MascotLoopProps = {
  className?: string;
  slotIndex: number;
  videoClassName?: string;
};

const MASCOT_LOOP_VIDEOS = [...getMascotVideoManifest()];

function getMascotLoopVideoSrc(slotIndex: number) {
  if (MASCOT_LOOP_VIDEOS.length <= 0) {
    return null;
  }

  return MASCOT_LOOP_VIDEOS[slotIndex % MASCOT_LOOP_VIDEOS.length] ?? MASCOT_LOOP_VIDEOS[0] ?? null;
}

export function MascotLoop({
  className = "",
  slotIndex,
  videoClassName = "",
}: MascotLoopProps) {
  const src = getMascotLoopVideoSrc(slotIndex);

  if (!src) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`pointer-events-none relative ${className}`}
    >
      <TransparentMascotVideo
        src={src}
        className="h-full w-full"
        canvasClassName={videoClassName}
        preload="none"
        maxFps={10}
        processingScale={0.55}
      />
    </motion.div>
  );
}
