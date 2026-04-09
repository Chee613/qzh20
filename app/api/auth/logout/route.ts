import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRequestIp, logAuditEvent } from "@/lib/audit";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);

  logAuditEvent("auth.logout.success", {
    ip: getRequestIp(request),
  });

  return response;
}
