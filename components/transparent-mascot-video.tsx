"use client";

import { useEffect, useRef } from "react";

type TransparentMascotVideoProps = {
  src: string;
  className?: string;
  canvasClassName?: string;
  loop?: boolean;
  onEnded?: () => void;
  onError?: () => void;
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

export function TransparentMascotVideo({
  src,
  className = "",
  canvasClassName = "",
  loop = true,
  onEnded,
  onError,
}: TransparentMascotVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });

    if (!canvas || !video || !context) {
      return;
    }

    let isCancelled = false;
    let animationFrameId: number | null = null;

    const drawFrame = () => {
      if (isCancelled) {
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
        return;
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);
      context.drawImage(video, 0, 0, width, height);

      const frame = context.getImageData(0, 0, width, height);
      const { data } = frame;
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

        if (!isDarkEdgePixel(data, pixelIndex)) {
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

      // Remove only dark pixels that are connected to the video edges, preserving interior details.
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
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    const startDrawing = () => {
      if (isCancelled) {
        return;
      }

      void video.play().catch(() => {
        // Keep the hidden source video muted and autoplaying whenever the browser allows it.
      });

      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
      }
    };

    startDrawing();
    video.addEventListener("loadeddata", startDrawing);
    video.addEventListener("play", startDrawing);

    return () => {
      isCancelled = true;

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      video.removeEventListener("loadeddata", startDrawing);
      video.removeEventListener("play", startDrawing);
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
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
        preload="auto"
        aria-hidden="true"
        onEnded={onEnded}
        onError={onError}
        className="pointer-events-none absolute inset-0 opacity-0"
      />
    </div>
  );
}
