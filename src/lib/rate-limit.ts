interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    for (const [ip, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => t > oneMinuteAgo);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  if (timer.unref) {
    timer.unref();
  }
}

/**
 * In-memory sliding window rate limiter
 * Default: 5 requests per minute per IP
 */
export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitMap.get(ip) || { timestamps: [] };
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  record.timestamps.push(now);
  rateLimitMap.set(ip, record);

  return { success: true, remaining: limit - record.timestamps.length };
}

/**
 * Extracts client IP from standard request headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "127.0.0.1";
}
