import { NextResponse } from "next/server";
import { loadMascotVideoUrls } from "@/lib/mascot-videos";

export const dynamic = "force-static";

export async function GET() {
  const videos = await loadMascotVideoUrls();

  return NextResponse.json({ videos });
}
