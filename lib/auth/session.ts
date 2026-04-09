import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";

export const SESSION_COOKIE_NAME = "qzh20_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionIdentity = {
  memberId: string;
  loginId: string;
  name: string;
};

export type SessionPayload = SessionIdentity & {
  exp: number;
};

function getSessionSecret(): string {
  return getServerEnv().SESSION_SECRET;
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export function createSessionToken(identity: SessionIdentity): string {
  const payload: SessionPayload = {
    ...identity,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, incomingSignature] = token.split(".");

  if (!encodedPayload || !incomingSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const incomingBuffer = Buffer.from(incomingSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    incomingBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(incomingBuffer, expectedBuffer)
  ) {
    return null;
  }

  const parsed = safeJsonParse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  );

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const payload = parsed as Partial<SessionPayload>;
  if (
    typeof payload.memberId !== "string" ||
    typeof payload.loginId !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload as SessionPayload;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function getSessionFromServerCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
