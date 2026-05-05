"use client";

import { useEffect, useRef, useState } from "react";

type TransparentMascotVideoProps = {
  src: string;
  className?: string;
  canvasClassName?: string;
  loop?: boolean;
  preload?: "auto" | "metadata" | "none";
  maxFps?: number;
  processingScale?: number;
  visibilityMargin?: string;
  onEnded?: () => void;
  onError?: () => void;
};

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

type BackgroundProfile = {
  referenceColor: RgbColor;
  edgeSeedColors: RgbColor[];
  tolerance: number;
  maxSeedSpread: number;
};

function isDarkEdgePixel(data: Uint8ClampedArray, pixelIndex: number) {
  const red = data[pixelIndex] ?? 0;
  const green = data[pixelIndex + 1] ?? 0;
  const blue = data[pixelIndex + 2] ?? 0;
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const average = (red + green + blue) / 3;

  return average <= 78 && maxChannel <= 92 && maxChannel - minChannel <= 38;
}

function getColorDistance(left: RgbColor, right: RgbColor) {
  const redDelta = left.red - right.red;
  const greenDelta = left.green - right.green;
  const blueDelta = left.blue - right.blue;

  return Math.sqrt(redDelta * redDelta + greenDelta * greenDelta + blueDelta * blueDelta);
}

function sampleRegionColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  sampleSize: number,
) {
  const endX = Math.min(width, startX + sampleSize);
  const endY = Math.min(height, startY + sampleSize);
  let redTotal = 0;
  let greenTotal = 0;
  let blueTotal = 0;
  let sampleCount = 0;

  for (let y = Math.max(0, startY); y < endY; y += 1) {
    for (let x = Math.max(0, startX); x < endX; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      redTotal += data[pixelIndex] ?? 0;
      greenTotal += data[pixelIndex + 1] ?? 0;
      blueTotal += data[pixelIndex + 2] ?? 0;
      sampleCount += 1;
    }
  }

  if (!sampleCount) {
    return { red: 0, green: 0, blue: 0 };
  }

  return {
    red: redTotal / sampleCount,
    green: greenTotal / sampleCount,
    blue: blueTotal / sampleCount,
  };
}

function buildBackgroundProfile(data: Uint8ClampedArray, width: number, height: number): BackgroundProfile {
  const sampleSize = Math.max(6, Math.floor(Math.min(width, height) * 0.08));
  const lastSampleX = Math.max(0, width - sampleSize);
  const lastSampleY = Math.max(0, height - sampleSize);
  const centerX = Math.max(0, Math.floor((width - sampleSize) / 2));
  const centerY = Math.max(0, Math.floor((height - sampleSize) / 2));

  const edgeSeedColors = [
    sampleRegionColor(data, width, height, 0, 0, sampleSize),
    sampleRegionColor(data, width, height, lastSampleX, 0, sampleSize),
    sampleRegionColor(data, width, height, 0, lastSampleY, sampleSize),
    sampleRegionColor(data, width, height, lastSampleX, lastSampleY, sampleSize),
    sampleRegionColor(data, width, height, centerX, 0, sampleSize),
    sampleRegionColor(data, width, height, centerX, lastSampleY, sampleSize),
    sampleRegionColor(data, width, height, 0, centerY, sampleSize),
    sampleRegionColor(data, width, height, lastSampleX, centerY, sampleSize),
  ];

  const anchorColor =
    edgeSeedColors.reduce<{ color: RgbColor; score: number } | null>((bestMatch, candidateColor) => {
      const nearestDistances = edgeSeedColors
        .map((otherColor) => getColorDistance(candidateColor, otherColor))
        .sort((left, right) => left - right);
      const score = nearestDistances
        .slice(0, Math.max(4, Math.ceil(edgeSeedColors.length / 2)))
        .reduce((total, distance) => total + distance, 0);

      if (!bestMatch || score < bestMatch.score) {
        return {
          color: candidateColor,
          score,
        };
      }

      return bestMatch;
    }, null)?.color ?? edgeSeedColors[0];

  const dominantEdgeColors = edgeSeedColors.filter(
    (seedColor) => getColorDistance(seedColor, anchorColor) <= 36,
  );
  const clusteredEdgeColors =
    dominantEdgeColors.length >= 3
      ? dominantEdgeColors
      : [...edgeSeedColors]
          .sort(
            (left, right) =>
              getColorDistance(left, anchorColor) - getColorDistance(right, anchorColor),
          )
          .slice(0, 4);

  const referenceColor = clusteredEdgeColors.reduce<RgbColor>(
    (accumulator, sample) => ({
      red: accumulator.red + sample.red / clusteredEdgeColors.length,
      green: accumulator.green + sample.green / clusteredEdgeColors.length,
      blue: accumulator.blue + sample.blue / clusteredEdgeColors.length,
    }),
    { red: 0, green: 0, blue: 0 },
  );

  const maxSeedSpread = clusteredEdgeColors.reduce((largestDistance, sample) => {
    return Math.max(largestDistance, getColorDistance(sample, referenceColor));
  }, 0);

  return {
    referenceColor,
    edgeSeedColors: clusteredEdgeColors,
    tolerance: Math.max(20, Math.min(48, maxSeedSpread + 18)),
    maxSeedSpread,
  };
}

function isBackgroundLikePixel(
  data: Uint8ClampedArray,
  pixelIndex: number,
  backgroundProfile: BackgroundProfile,
) {
  const red = data[pixelIndex] ?? 0;
  const green = data[pixelIndex + 1] ?? 0;
  const blue = data[pixelIndex + 2] ?? 0;
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const average = (red + green + blue) / 3;
  const channelSpread = maxChannel - minChannel;
  const pixelColor = { red, green, blue };
  const nearestSeedDistance = backgroundProfile.edgeSeedColors.reduce((smallestDistance, seedColor) => {
    return Math.min(smallestDistance, getColorDistance(pixelColor, seedColor));
  }, Number.POSITIVE_INFINITY);
  const referenceDistance = getColorDistance(pixelColor, backgroundProfile.referenceColor);

  if (nearestSeedDistance <= backgroundProfile.tolerance) {
    return true;
  }

  if (
    referenceDistance <= backgroundProfile.tolerance * 0.9 &&
    channelSpread <= Math.max(92, backgroundProfile.maxSeedSpread + 28)
  ) {
    return true;
  }

  return average <= 78 && maxChannel <= 92 && channelSpread <= 38;
}

export function TransparentMascotVideo({
  src,
  className = "",
  canvasClassName = "",
  loop = true,
  preload = "metadata",
  maxFps = 14,
  processingScale = 0.7,
  visibilityMargin = "180px",
  onEnded,
  onError,
}: TransparentMascotVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isInViewport, setIsInViewport] = useState(
    () => typeof window !== "undefined" && typeof IntersectionObserver === "undefined",
  );
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInViewport(entry?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: visibilityMargin,
        threshold: 0.01,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [visibilityMargin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });

    if (!canvas || !video || !context) {
      return;
    }

    const shouldAnimate = isInViewport && isPageVisible;
    const safeProcessingScale = Math.min(Math.max(processingScale, 0.35), 1);
    const frameIntervalMs = maxFps > 0 ? 1000 / maxFps : 0;

    let isCancelled = false;
    let animationFrameId: number | null = null;
    let lastRenderedAt = 0;

    const stopDrawing = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const pauseVideo = () => {
      if (!video.paused) {
        video.pause();
      }
    };

    const drawFrame = (timestamp: number) => {
      if (isCancelled) {
        return;
      }

      if (!shouldAnimate) {
        pauseVideo();
        stopDrawing();
        return;
      }

      if (frameIntervalMs > 0 && timestamp - lastRenderedAt < frameIntervalMs) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
        return;
      }

      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;

      if (!sourceWidth || !sourceHeight) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
        return;
      }

      const width = Math.max(1, Math.round(sourceWidth * safeProcessingScale));
      const height = Math.max(1, Math.round(sourceHeight * safeProcessingScale));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);
      context.drawImage(video, 0, 0, width, height);

      const frame = context.getImageData(0, 0, width, height);
      const { data } = frame;
      const backgroundProfile = buildBackgroundProfile(data, width, height);
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];

      const enqueue = (x: number, y: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) {
          return;
        }

        const flatIndex = y * width + x;

        if (visited[flatIndex]) {
          return;
        }

        const pixelIndex = flatIndex * 4;

        if (!isDarkEdgePixel(data, pixelIndex) && !isBackgroundLikePixel(data, pixelIndex, backgroundProfile)) {
          return;
        }

        visited[flatIndex] = 1;
        queue.push(flatIndex);
      };

      for (let x = 0; x < width; x += 1) {
        enqueue(x, 0);
        enqueue(x, height - 1);
      }

      for (let y = 1; y < height - 1; y += 1) {
        enqueue(0, y);
        enqueue(width - 1, y);
      }

      // Remove only edge-connected background pixels so interior mascot details stay intact.
      for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
        const flatIndex = queue[queueIndex];

        if (flatIndex === undefined) {
          continue;
        }

        const x = flatIndex % width;
        const y = Math.floor(flatIndex / width);
        const pixelIndex = flatIndex * 4;
        data[pixelIndex + 3] = 0;

        enqueue(x - 1, y);
        enqueue(x + 1, y);
        enqueue(x, y - 1);
        enqueue(x, y + 1);
      }

      context.putImageData(frame, 0, 0);
      lastRenderedAt = timestamp;
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    const startDrawing = () => {
      if (isCancelled || !shouldAnimate) {
        return;
      }

      void video.play().catch(() => {
        // Keep the hidden source video muted and autoplaying whenever the browser allows it.
      });

      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
      }
    };

    if (shouldAnimate) {
      startDrawing();
    } else {
      pauseVideo();
      stopDrawing();
    }

    video.addEventListener("loadeddata", startDrawing);
    video.addEventListener("play", startDrawing);

    return () => {
      isCancelled = true;

      pauseVideo();
      stopDrawing();

      video.removeEventListener("loadeddata", startDrawing);
      video.removeEventListener("play", startDrawing);
    };
  }, [src, isInViewport, isPageVisible, maxFps, processingScale]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`h-full w-full bg-transparent object-contain ${canvasClassName}`}
      />
      <video
        ref={videoRef}
        key={src}
        src={src}
        autoPlay
        loop={loop}
        muted
        playsInline
        preload={preload}
        aria-hidden="true"
        onEnded={onEnded}
        onError={onError}
        className="pointer-events-none absolute inset-0 opacity-0"
      />
    </div>
  );
}
