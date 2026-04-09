import bcrypt from "bcryptjs";

const BIRTHDAY_PASSWORD_REGEX = /^\d{8}$/;

export function isValidBirthdayPassword(value: string): boolean {
  if (!BIRTHDAY_PASSWORD_REGEX.test(value)) {
    return false;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function hashBirthdayPassword(password: string): Promise<string> {
  if (!isValidBirthdayPassword(password)) {
    throw new Error("Birthday password must be in YYYYMMDD format");
  }

  return bcrypt.hash(password, 10);
}

export async function verifyBirthdayPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  if (!isValidBirthdayPassword(plainPassword)) {
    return false;
  }

  return bcrypt.compare(plainPassword, hash);
}
