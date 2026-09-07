export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  initialDelayMs?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Performs a fetch request with exponential backoff retry logic.
 * Particularly useful for handling 503 Service Unavailable or transient network glitches.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
  ..._rest: any[]
): Promise<Response> {
  const {
    retries = 3,
    initialDelayMs = 1000,
    onRetry,
    ...fetchOptions
  } = options;

  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, fetchOptions);

      // If server returns 503 Service Unavailable or 429 Too Many Requests, retry
      if ((response.status === 503 || response.status === 429) && attempt < retries) {
        throw new Error(`Server status ${response.status}`);
      }

      return response;
    } catch (error) {
      attempt++;
      if (attempt > retries) {
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
