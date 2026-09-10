import type { ApiResponse } from '@/lib/types/dashboard';

export const DASHBOARD_REQUEST_TIMEOUT_MS = 10000;
export const DASHBOARD_RETRY_ATTEMPTS = 2;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJsonWithRetry<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retries: number = DASHBOARD_RETRY_ATTEMPTS
): Promise<ApiResponse<T>> {
  let attempt = 0;

  while (attempt <= retries) {
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DASHBOARD_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(init.headers || {}),
        },
      });

      clearTimeout(timeoutId);
      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        return json as ApiResponse<T>;
      }

      const shouldRetry = response.status >= 500 && attempt < retries;
      if (!shouldRetry) {
        return {
          success: false,
          error: json.error || 'Request failed',
          code: json.code || `HTTP_${response.status}`,
          details: json.details || [],
        };
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      const isAbort = error?.name === 'AbortError';
      if (attempt >= retries) {
        return {
          success: false,
          error: isAbort ? 'Request timed out' : 'Network request failed',
          code: isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
        };
      }
    }

    attempt += 1;
    await wait(Math.min(1000 * 2 ** attempt, 4000));
  }

  return {
    success: false,
    error: 'Unexpected request failure',
    code: 'UNKNOWN_ERROR',
  };
}
