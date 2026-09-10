import { IntentResult } from "./ai-types";
import { METRIC_REGISTRY } from "./metrics-config";

export function parseQuery(query: string): IntentResult {
  const q = query.toLowerCase();
  let matchedMetricId: string | 'UNKNOWN' = 'UNKNOWN';
  let highestScore = 0;

  for (const [id, config] of Object.entries(METRIC_REGISTRY)) {
    let score = 0;
    
    // Check primary keywords (Weight: 1.0)
    config.keywords.forEach(kw => {
      if (q.includes(kw)) score += 1.0;
    });

    // Check synonyms (Weight: 0.5)
    config.synonyms.forEach(syn => {
      if (q.includes(syn)) score += 0.5;
    });

    if (score > highestScore) {
      highestScore = score;
      matchedMetricId = id;
    }
  }

  // Calculate confidence (0 to 1)
  const confidence = Math.min(highestScore / 1.5, 1.0);

  return {
    metricId: matchedMetricId,
    confidence,
    filters: {} // Can be expanded for date range extraction
  };
}
