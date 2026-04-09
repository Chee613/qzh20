import { describe, expect, it } from "vitest";

import {
  isValidBirthdayPassword,
  verifyBirthdayPassword,
  hashBirthdayPassword,
} from "@/lib/auth/password";

describe("birthday password validation", () => {
  it("accepts valid YYYYMMDD", () => {
    expect(isValidBirthdayPassword("20080512")).toBe(true);
  });

  it("rejects invalid date", () => {
    expect(isValidBirthdayPassword("20080231")).toBe(false);
  });

  it("rejects invalid format", () => {
    expect(isValidBirthdayPassword("2008-05-12")).toBe(false);
    expect(isValidBirthdayPassword("abc")).toBe(false);
  });
});

describe("birthday password hashing", () => {
  it("hashes and verifies correctly", async () => {
    const plain = "20080512";
    const hash = await hashBirthdayPassword(plain);

    await expect(verifyBirthdayPassword(plain, hash)).resolves.toBe(true);
    await expect(verifyBirthdayPassword("20080513", hash)).resolves.toBe(false);
  });
});
