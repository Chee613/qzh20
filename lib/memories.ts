export type MemoryGalleryFolder = "nanma-fenzhan" | "beima-fenzhan" | "zongzhan";

export type MemorySlide = {
  id: string;
  srcCandidates: readonly string[];
  alt: string;
};

export type MemoryGalleryConfig = {
  folder: MemoryGalleryFolder;
  title: string;
  glowClassName: string;
};

export type MemoryGalleryItem = MemoryGalleryConfig & {
  slides: readonly MemorySlide[];
};

export type MemoryManifestResponse = {
  galleries: Record<MemoryGalleryFolder, readonly MemorySlide[]>;
};

export const MEMORY_GALLERY_CONFIGS: readonly MemoryGalleryConfig[] = [
  {
    folder: "nanma-fenzhan",
    title: "南马分站",
    glowClassName: "from-amber-300/30 via-orange-500/12 to-rose-400/30",
  },
  {
    folder: "beima-fenzhan",
    title: "北马分站",
    glowClassName: "from-sky-300/30 via-cyan-500/12 to-indigo-400/28",
  },
  {
    folder: "zongzhan",
    title: "总站",
    glowClassName: "from-emerald-300/28 via-teal-500/12 to-yellow-300/22",
  },
];

export function createEmptyMemoryManifest(): MemoryManifestResponse["galleries"] {
  return MEMORY_GALLERY_CONFIGS.reduce<MemoryManifestResponse["galleries"]>(
    (manifest, gallery) => ({
      ...manifest,
      [gallery.folder]: [],
    }),
    {
      "nanma-fenzhan": [],
      "beima-fenzhan": [],
      "zongzhan": [],
    },
  );
}
