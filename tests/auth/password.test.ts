import { describe, expect, it } from "vitest";

import {
  hashPasskey,
  isValidPasskey,
  normalizePasskey,
  verifyPasskey,
} from "@/lib/auth/password";

describe("passkey validation", () => {
  it("accepts valid MMDDcode", () => {
    expect(isValidPasskey("0307srls")).toBe(true);
  });

  it("rejects invalid date", () => {
    expect(isValidPasskey("0231srls")).toBe(false);
  });

  it("rejects invalid format", () => {
    expect(isValidPasskey("03-07srls")).toBe(false);
    expect(isValidPasskey("0307sr")).toBe(false);
  });

  it("normalizes casing and whitespace", () => {
    expect(normalizePasskey(" 0307SRLS ")).toBe("0307srls");
  });
});

describe("passkey hashing", () => {
  it("hashes and verifies correctly", async () => {
    const plain = "0307srls";
    const hash = await hashPasskey(plain);

    await expect(verifyPasskey(plain, hash)).resolves.toBe(true);
    await expect(verifyPasskey("0308srls", hash)).resolves.toBe(false);
  });
});
