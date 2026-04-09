import { beforeEach, describe, expect, it } from "vitest";

import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";
import { clearServerEnvCacheForTests } from "@/lib/env";

describe("session token", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.SESSION_SECRET = "this-is-a-test-session-secret-with-32-chars";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    clearServerEnvCacheForTests();
  });

  it("verifies a valid signed token", () => {
    const token = createSessionToken({
      memberId: "member-1",
      loginId: "zhihao",
      name: "陈智豪",
    });

    const payload = verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.memberId).toBe("member-1");
    expect(payload?.loginId).toBe("zhihao");
  });

  it("rejects tampered token", () => {
    const token = createSessionToken({
      memberId: "member-1",
      loginId: "zhihao",
      name: "陈智豪",
    });

    const tampered = `${token}x`;
    expect(verifySessionToken(tampered)).toBeNull();
  });
});
