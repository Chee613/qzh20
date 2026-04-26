import { readdir } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import {
  createEmptyMemoryManifest,
  MEMORY_GALLERY_CONFIGS,
  type MemoryGalleryConfig,
  type MemoryManifestResponse,
  type MemorySlide,
} from "@/lib/memories";

const EXTENSION_PRIORITY = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "heic",
  "heif",
  "bmp",
  "tif",
  "tiff",
  "cr2",
] as const;

function compareMemoryCandidates(leftFileName: string, rightFileName: string) {
  const leftExtension = path.extname(leftFileName).replace(/^\./, "").toLowerCase();
  const rightExtension = path.extname(rightFileName).replace(/^\./, "").toLowerCase();
  const leftPriority = EXTENSION_PRIORITY.indexOf(leftExtension as (typeof EXTENSION_PRIORITY)[number]);
  const rightPriority = EXTENSION_PRIORITY.indexOf(rightExtension as (typeof EXTENSION_PRIORITY)[number]);
  const normalizedLeftPriority = leftPriority === -1 ? EXTENSION_PRIORITY.length : leftPriority;
  const normalizedRightPriority = rightPriority === -1 ? EXTENSION_PRIORITY.length : rightPriority;

  if (normalizedLeftPriority !== normalizedRightPriority) {
    return normalizedLeftPriority - normalizedRightPriority;
  }

  return leftFileName.localeCompare(rightFileName, undefined, { sensitivity: "accent", numeric: true });
}

async function loadGallerySlides(gallery: MemoryGalleryConfig): Promise<readonly MemorySlide[]> {
  const galleryPath = path.join(process.cwd(), "public", "memories", gallery.folder);
  const slidesByNumber = new Map<number, string[]>();

  try {
    const entries = await readdir(galleryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const parsedFile = path.parse(entry.name);

      if (!/^\d+$/.test(parsedFile.name) || parsedFile.ext.length === 0) {
        continue;
      }

      const slideNumber = Number.parseInt(parsedFile.name, 10);
      const existingCandidates = slidesByNumber.get(slideNumber) ?? [];
      existingCandidates.push(entry.name);
      slidesByNumber.set(slideNumber, existingCandidates);
    }
  } catch {
    return [];
  }

  return [...slidesByNumber.entries()]
    .sort(([leftNumber], [rightNumber]) => leftNumber - rightNumber)
    .map(([slideNumber, fileNames]) => ({
      id: `${gallery.folder}-${slideNumber}`,
      srcCandidates: [...fileNames]
        .sort(compareMemoryCandidates)
        .map((fileName) => `/memories/${gallery.folder}/${encodeURIComponent(fileName)}`),
      alt: `${gallery.title} 回忆照片 ${slideNumber}`,
    }));
}

export async function GET() {
  const galleries = createEmptyMemoryManifest();

  await Promise.all(
    MEMORY_GALLERY_CONFIGS.map(async (gallery) => {
      galleries[gallery.folder] = await loadGallerySlides(gallery);
    }),
  );

  const body: MemoryManifestResponse = {
    galleries,
  };

  return NextResponse.json(body);
}
