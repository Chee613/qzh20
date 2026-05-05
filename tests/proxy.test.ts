import { beforeEach, describe, expect, it } from "vitest";

import { proxy } from "@/proxy";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { clearServerEnvCacheForTests } from "@/lib/env";
import { NextRequest } from "next/server";

describe("dashboard proxy protection", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.SESSION_SECRET = "this-is-a-test-session-secret-with-32-chars";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    clearServerEnvCacheForTests();
  });

  it("redirects unauthenticated request to login", () => {
    const request = new NextRequest("http://localhost/dashboard");
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/?next=%2Fdashboard#login-section"
    );
  });

  it("allows authenticated request", () => {
    const token = createSessionToken({
      memberId: "member-1",
      loginId: "zhihao",
      name: "陈智豪",
    });

    const request = new NextRequest("http://localhost/dashboard", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const response = proxy(request);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
