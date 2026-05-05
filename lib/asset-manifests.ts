import assetManifests from "@/lib/generated/asset-manifests.json";
import type { MemoryManifestResponse } from "@/lib/memories";

type AssetManifestShape = {
  mascotVideos: string[];
  memories: MemoryManifestResponse["galleries"];
};

const typedAssetManifests = assetManifests as AssetManifestShape;

export function getMascotVideoManifest(): readonly string[] {
  return typedAssetManifests.mascotVideos;
}

export function getMemoryManifest(): MemoryManifestResponse["galleries"] {
  return typedAssetManifests.memories;
}
