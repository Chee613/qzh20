import { beforeEach, describe, expect, it } from "vitest";

import { clearServerEnvCacheForTests } from "@/lib/env";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";

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
      loginId: "member1",
      name: "Lin Jing Er",
    });

    const payload = verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.memberId).toBe("member-1");
    expect(payload?.loginId).toBe("member1");
  });

  it("allows a session without a committee member id", () => {
    const token = createSessionToken({
      memberId: null,
      loginId: "member2",
      name: "Chen Xue Ying",
    });

    const payload = verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.memberId).toBeNull();
    expect(payload?.loginId).toBe("member2");
  });

  it("rejects tampered token", () => {
    const token = createSessionToken({
      memberId: "member-1",
      loginId: "member1",
      name: "Lin Jing Er",
    });

    const tampered = `${token}x`;
    expect(verifySessionToken(tampered)).toBeNull();
  });
});
