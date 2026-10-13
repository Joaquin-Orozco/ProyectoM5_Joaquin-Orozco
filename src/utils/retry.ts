type RetryableError = Error & {
  status?: number;
  response?: { headers?: Record<string, string | number | undefined> };
};
type RetryOptions = { maxRetries?: number; wait?: (milliseconds: number) => Promise<void> };
const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function retryDelay(error: RetryableError, attempt: number): number | undefined {
  const headers = error.response?.headers;
  const rateLimited = error.status === 429 || (error.status === 403 && (
    String(headers?.['x-ratelimit-remaining'] ?? '') === '0' || /rate limit/i.test(error.message)
  ));
  if (!rateLimited) return undefined;
  const retryAfter = Number(headers?.['retry-after']);
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter <= 60 ? retryAfter * 1000 : undefined;
  const resetAt = Number(headers?.['x-ratelimit-reset']);
  if (Number.isFinite(resetAt) && resetAt > 0) {
    const resetDelay = Math.max(resetAt * 1000 - Date.now(), 1000);
    return resetDelay <= 60_000 ? resetDelay : undefined;
  }
  return Math.min(1000 * 2 ** (attempt - 1), 60_000);
}

export async function withRateLimitRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? 1;
  const wait = options.wait ?? delay;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const milliseconds = retryDelay(error as RetryableError, attempt + 1);
      if (milliseconds === undefined || attempt >= maxRetries) throw error;
      await wait(milliseconds);
    }
  }
}