// ============================================
// paint_n_meraki — RATE LIMITING SERVICE
// In-Memory sliding window rate limiter for auth endpoints
// ============================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Check if an IP/key exceeds allowed requests within a window
 * @param key Unique identifier (e.g. IP + action)
 * @param maxAttempts Maximum allowed requests
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up if expired
  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfterSeconds: 0,
    };
  }

  // Increment
  record.count += 1;
  rateLimitStore.set(key, record);

  if (record.count > maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Clear rate limit on successful action (e.g. successful login)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
