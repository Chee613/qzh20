import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_DIR = path.join(ROOT, "lib", "generated");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "asset-manifests.json");

const MASCOT_VIDEO_DIRECTORIES = ["mascot-videos", "mascot-video", "moscot-video"];
const SUPPORTED_MASCOT_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".avi",
]);

const MEMORY_GALLERIES = [
  { folder: "nanma-fenzhan", title: "Nanma Memories" },
  { folder: "beima-fenzhan", title: "Beima Memories" },
  { folder: "zongzhan", title: "Zongzhan Memories" },
];

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
];

function compareMemoryCandidates(leftFileName, rightFileName) {
  const leftExtension = path.extname(leftFileName).replace(/^\./, "").toLowerCase();
  const rightExtension = path.extname(rightFileName).replace(/^\./, "").toLowerCase();
  const leftPriority = EXTENSION_PRIORITY.indexOf(leftExtension);
  const rightPriority = EXTENSION_PRIORITY.indexOf(rightExtension);
  const normalizedLeftPriority =
    leftPriority === -1 ? EXTENSION_PRIORITY.length : leftPriority;
  const normalizedRightPriority =
    rightPriority === -1 ? EXTENSION_PRIORITY.length : rightPriority;

  if (normalizedLeftPriority !== normalizedRightPriority) {
    return normalizedLeftPriority - normalizedRightPriority;
  }

  return leftFileName.localeCompare(rightFileName, undefined, {
    sensitivity: "accent",
    numeric: true,
  });
}

async function loadMascotVideos() {
  const videoUrls = new Set();

  await Promise.all(
    MASCOT_VIDEO_DIRECTORIES.map(async (directoryName) => {
      const directoryPath = path.join(PUBLIC_DIR, directoryName);

      try {
        const entries = await readdir(directoryPath, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isFile()) {
            continue;
          }

          const extension = path.extname(entry.name).toLowerCase();

          if (!SUPPORTED_MASCOT_VIDEO_EXTENSIONS.has(extension)) {
            continue;
          }

          videoUrls.add(`/${directoryName}/${encodeURIComponent(entry.name)}`);
        }
      } catch {
        // Ignore missing directories so either spelling can be used.
      }
    }),
  );

  return [...videoUrls].sort((left, right) =>
    left.localeCompare(right, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

async function loadMemoryGalleries() {
  const galleries = {};

  await Promise.all(
    MEMORY_GALLERIES.map(async (gallery) => {
      const galleryPath = path.join(PUBLIC_DIR, "memories", gallery.folder);
      const slidesByNumber = new Map();

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
        galleries[gallery.folder] = [];
        return;
      }

      galleries[gallery.folder] = [...slidesByNumber.entries()]
        .sort(([leftNumber], [rightNumber]) => leftNumber - rightNumber)
        .map(([slideNumber, fileNames]) => ({
          id: `${gallery.folder}-${slideNumber}`,
          srcCandidates: [...fileNames]
            .sort(compareMemoryCandidates)
            .map(
              (fileName) =>
                `/memories/${gallery.folder}/${encodeURIComponent(fileName)}`,
            ),
          alt: `${gallery.title} photo ${slideNumber}`,
        }));
    }),
  );

  return galleries;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const manifest = {
    mascotVideos: await loadMascotVideos(),
    memories: await loadMemoryGalleries(),
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

await main();
