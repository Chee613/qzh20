import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("next", request.nextUrl.pathname);
    homeUrl.hash = "login-section";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
