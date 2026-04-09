import { describe, expect, it } from "vitest";

import {
  consumeLoginAttempt,
  resetLoginAttempts,
} from "@/lib/auth/rate-limit";

describe("login rate limit", () => {
  it("blocks after max attempts and clears after reset", () => {
    const key = "127.0.0.1:zhihao";

    for (let i = 0; i < 8; i += 1) {
      const result = consumeLoginAttempt(key);
      expect(result.limited).toBe(false);
    }

    const blocked = consumeLoginAttempt(key);
    expect(blocked.limited).toBe(true);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    resetLoginAttempts(key);
    const afterReset = consumeLoginAttempt(key);
    expect(afterReset.limited).toBe(false);
  });
});
