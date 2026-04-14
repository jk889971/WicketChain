/**
 * Wraps a Supabase query with exponential-backoff retry.
 * Retries up to `maxAttempts` times on transient errors.
 * Network/fetch failures and Supabase errors both trigger a retry.
 */
export async function withRetry<T>(
  fn: () => Promise<{ data: T | null; error: any }>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<{ data: T | null; error: any }> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (!result.error) return result;
      lastError = result.error;
    } catch (err) {
      lastError = err;
    }

    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
    }
  }

  return { data: null, error: lastError };
}
