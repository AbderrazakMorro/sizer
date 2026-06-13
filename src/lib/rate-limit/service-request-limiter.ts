import { RATE_LIMIT_CONFIG } from "@/lib/validations/service-request";

/**
 * In-memory rate limiting store for service request submissions
 * In production, consider using Redis or a database-backed solution
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private ipStore = new Map<string, RateLimitEntry>();
  private emailStore = new Map<string, RateLimitEntry>();

  /**
   * Check if an IP address has exceeded the rate limit
   */
  checkIpLimit(ipAddress: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    return this.checkLimit(
      this.ipStore,
      ipAddress,
      RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_IP
    );
  }

  /**
   * Check if an email address has exceeded the rate limit
   */
  checkEmailLimit(email: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const normalizedEmail = email.toLowerCase().trim();
    return this.checkLimit(
      this.emailStore,
      normalizedEmail,
      RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_EMAIL
    );
  }

  /**
   * Record a successful submission for rate limiting
   */
  recordSubmission(ipAddress: string, email: string): void {
    const now = Date.now();
    const resetAt = now + RATE_LIMIT_CONFIG.TIME_WINDOW_MS;

    // Record IP
    const ipEntry = this.ipStore.get(ipAddress);
    if (ipEntry && ipEntry.resetAt > now) {
      ipEntry.count++;
    } else {
      this.ipStore.set(ipAddress, { count: 1, resetAt });
    }

    // Record email
    const normalizedEmail = email.toLowerCase().trim();
    const emailEntry = this.emailStore.get(normalizedEmail);
    if (emailEntry && emailEntry.resetAt > now) {
      emailEntry.count++;
    } else {
      this.emailStore.set(normalizedEmail, { count: 1, resetAt });
    }

    // Clean up expired entries periodically
    this.cleanup();
  }

  /**
   * Generic rate limit check
   */
  private checkLimit(
    store: Map<string, RateLimitEntry>,
    key: string,
    maxRequests: number
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = store.get(key);

    // No entry or expired entry
    if (!entry || entry.resetAt <= now) {
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + RATE_LIMIT_CONFIG.TIME_WINDOW_MS,
      };
    }

    // Check if limit exceeded
    const allowed = entry.count < maxRequests;
    const remaining = Math.max(0, maxRequests - entry.count);

    return {
      allowed,
      remaining,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean IP store
    for (const [key, entry] of this.ipStore.entries()) {
      if (entry.resetAt <= now) {
        this.ipStore.delete(key);
      }
    }

    // Clean email store
    for (const [key, entry] of this.emailStore.entries()) {
      if (entry.resetAt <= now) {
        this.emailStore.delete(key);
      }
    }
  }

  /**
   * Get current stats (for debugging/monitoring)
   */
  getStats(): {
    ipEntries: number;
    emailEntries: number;
  } {
    return {
      ipEntries: this.ipStore.size,
      emailEntries: this.emailStore.size,
    };
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.ipStore.clear();
    this.emailStore.clear();
  }
}

// Singleton instance
export const serviceRequestLimiter = new RateLimiter();

/**
 * Helper to get client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  // Check common headers for IP address (in order of preference)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to a default value (should not happen in production)
  return "unknown";
}

/**
 * Format time remaining for user-friendly display
 */
export function formatTimeRemaining(resetAt: number): string {
  const now = Date.now();
  const remainingMs = resetAt - now;

  if (remainingMs <= 0) {
    return "now";
  }

  const minutes = Math.ceil(remainingMs / 60000);

  if (minutes < 1) {
    return "less than a minute";
  } else if (minutes === 1) {
    return "1 minute";
  } else {
    return `${minutes} minutes`;
  }
}

// Made with Bob
