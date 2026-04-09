import type { NextRequest } from "next/server";

type AuditLevel = "info" | "warn" | "error";

type AuditPayload = {
  ts: string;
  event: string;
  level: AuditLevel;
  details: Record<string, unknown>;
};

export function getRequestIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return "unknown";
}

export function logAuditEvent(
  event: string,
  details: Record<string, unknown>,
  level: AuditLevel = "info"
): void {
  const payload: AuditPayload = {
    ts: new Date().toISOString(),
    event,
    level,
    details,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}
