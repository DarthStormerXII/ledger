export interface RetryOptions {
  attempts?: number;
  initialMs?: number;
  factor?: number;
  maxMs?: number;
  onAttempt?: (attempt: number, lastError: unknown) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const initialMs = opts.initialMs ?? 200;
  const factor = opts.factor ?? 2;
  const maxMs = opts.maxMs ?? 5_000;
  let delay = initialMs;
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      opts.onAttempt?.(i, err);
      if (i === attempts) break;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * factor, maxMs);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`retry exhausted after ${attempts} attempts`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
