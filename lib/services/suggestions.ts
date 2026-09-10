import { fetchMetricData, METRIC_REGISTRY } from './ai-registry';

export interface Suggestion {
  id: string;
  type: 'URGENT' | 'OPPORTUNITY' | 'MAINTENANCE';
  message: string;
  actionRequired: string;
}

export async function generateSuggestions(): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // Rule 1: High Payment Failures -> URGENT
  const failuresData = await fetchMetricData(METRIC_REGISTRY.PAYMENT_FAILURES, {});
  if (failuresData.value > 10) {
    suggestions.push({
      id: "RULE_HIGH_FAILURES",
      type: "URGENT",
      message: `${failuresData.value} payments failed in the last 24h.`,
      actionRequired: "Check payment gateway integration and logs immediately."
    });
  }

  // Rule 2: Low Active Users -> OPPORTUNITY
  const activeUsersData = await fetchMetricData(METRIC_REGISTRY.USERS_ACTIVE, {});
  if (activeUsersData.value < 50) {
    suggestions.push({
      id: "RULE_LOW_ENGAGEMENT",
      type: "OPPORTUNITY",
      message: `Only ${activeUsersData.value} active users this week.`,
      actionRequired: "Run a re-engagement email campaign for inactive users."
    });
  }

  return suggestions;
}
