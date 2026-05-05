import { getMascotVideoManifest } from "@/lib/asset-manifests";

export async function loadMascotVideoUrls() {
  return getMascotVideoManifest();
}
