import { readdir } from "node:fs/promises";
import path from "node:path";

const MASCOT_VIDEO_DIRECTORIES = ["mascot-video", "moscot-video"] as const;
const SUPPORTED_MASCOT_VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi"]);

export async function loadMascotVideoUrls() {
  const videoUrls = new Set<string>();

  await Promise.all(
    MASCOT_VIDEO_DIRECTORIES.map(async (directoryName) => {
      const directoryPath = path.join(process.cwd(), "public", directoryName);

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
    left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }),
  );
}
