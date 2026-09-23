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
  const isAiOrHeavy = 
    url.includes('summarize') || 
    url.includes('parse') || 
    url.includes('generate') || 
    url.includes('coach') || 
    url.includes('search') || 
    url.includes('scan') || 
    url.includes('bilingual') || 
    url.includes('tts') ||
    url.includes('sync');

  const defaultTimeout = isAiOrHeavy ? 45000 : 15000;

  const {
    retries = 2,
    initialDelayMs = 400,
    timeoutMs = defaultTimeout,
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
  retryOverrides?: FetchWithRetryOptions
): Promise<T> {
  const mergedOptions = retryOverrides ? { ...options, ...retryOverrides } : options;
  const res = await fetchWithRetry(url, mergedOptions);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}
