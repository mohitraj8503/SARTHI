import { METRIC_REGISTRY } from "./metrics-config";

// Simple In-Memory Cache (5 Minutes)
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function getMetricData(metricId: string, filters: any) {
  const config = METRIC_REGISTRY[metricId];
  if (!config) throw new Error(`Metric ${metricId} not found in registry`);

  const cacheKey = `${metricId}-${JSON.stringify(filters)}`;
  const now = Date.now();

  if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_TTL) {
    return cache[cacheKey].data;
  }

  try {
    const data = await config.fetcher(filters);
    cache[cacheKey] = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error(`DATA FETCHER ERROR [${metricId}]:`, error);
    throw error; // Let the API handler handle the fallback
  }
}
