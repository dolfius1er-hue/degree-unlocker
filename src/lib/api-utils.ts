export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  initialDelayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Performs a fetch request with exponential backoff retry logic and automatic AbortController timeout.
 * Prevents requests from hanging indefinitely on slow/unresponsive endpoints.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
  ..._rest: any[]
): Promise<Response> {
  const {
    retries = 2,
    initialDelayMs = 300,
    timeoutMs = 4000,
    onRetry,
    signal: userSignal,
    ...fetchOptions
  } = options;

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Merge custom user signal if provided
    let combinedSignal = controller.signal;
    if (userSignal) {
      if (userSignal.aborted) {
        controller.abort();
      } else {
        userSignal.addEventListener('abort', () => controller.abort());
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      // If server returns 503 Service Unavailable or 429 Too Many Requests, retry
      if ((response.status === 503 || response.status === 429) && attempt < retries) {
        throw new Error(`Server status ${response.status}`);
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      attempt++;

      if (attempt > retries) {
        if (error?.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw error;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      if (onRetry) {
        onRetry(attempt, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Convenience helper that calls fetchWithRetry and parses JSON response.
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {},
  ...rest: any[]
): Promise<T> {
  const res = await fetchWithRetry(url, options, ...rest);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}
