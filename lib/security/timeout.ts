/**
 * Production Stability Utility: Fetch with Timeout
 * Prevents hanging requests from overloading the server (503 prevention).
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Higher-order function for server actions with resilience
 */
export async function withResilience<T>(
  action: () => Promise<T>,
  fallback: T,
  label: string = 'Service'
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    console.error(`[Resilience] ${label} failed:`, error);
    return fallback;
  }
}
