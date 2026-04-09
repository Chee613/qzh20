const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

type AttemptBucket = {
  count: number;
  resetAt: number;
};

const loginBuckets = new Map<string, AttemptBucket>();

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function consumeLoginAttempt(key: string): RateLimitResult {
  const now = Date.now();
  const existing = loginBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    loginBuckets.set(key, {
      count: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });

    return {
      limited: false,
      remaining: MAX_LOGIN_ATTEMPTS - 1,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  loginBuckets.set(key, existing);

  const limited = existing.count > MAX_LOGIN_ATTEMPTS;
  const retryAfterSeconds = limited
    ? Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    : 0;

  if (loginBuckets.size > 2000) {
    for (const [bucketKey, bucket] of loginBuckets.entries()) {
      if (bucket.resetAt <= now) {
        loginBuckets.delete(bucketKey);
      }
    }
  }

  return {
    limited,
    remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - existing.count),
    retryAfterSeconds,
  };
}

export function resetLoginAttempts(key: string): void {
  loginBuckets.delete(key);
}
