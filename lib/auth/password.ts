import bcrypt from "bcryptjs";

const PASSKEY_REGEX = /^\d{4}[a-z]{4}$/;

export function normalizePasskey(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidPasskey(value: string): boolean {
  const normalized = normalizePasskey(value);

  if (!PASSKEY_REGEX.test(normalized)) {
    return false;
  }

  const month = Number(normalized.slice(0, 2));
  const day = Number(normalized.slice(2, 4));

  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(2000, month - 1, day));
  return (
    date.getUTCFullYear() === 2000 &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function hashPasskey(passkey: string): Promise<string> {
  const normalized = normalizePasskey(passkey);

  if (!isValidPasskey(normalized)) {
    throw new Error("Passkey must be in MMDDcode format");
  }

  return bcrypt.hash(normalized, 10);
}

export async function verifyPasskey(
  plainPasskey: string,
  hash: string
): Promise<boolean> {
  const normalized = normalizePasskey(plainPasskey);

  if (!isValidPasskey(normalized)) {
    return false;
  }

  return bcrypt.compare(normalized, hash);
}
