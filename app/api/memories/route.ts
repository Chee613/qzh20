import { NextResponse } from "next/server";

import { getMemoryManifest } from "@/lib/asset-manifests";
import type { MemoryManifestResponse } from "@/lib/memories";

export const dynamic = "force-static";

export async function GET() {
  const body: MemoryManifestResponse = {
    galleries: getMemoryManifest(),
  };

  return NextResponse.json(body);
}
