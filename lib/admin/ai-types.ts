export interface MetricConfig {
  id: string;
  keywords: string[];
  synonyms: string[];
  label: string;
  unit?: string;
  fetcher: (filters?: any) => Promise<any>;
  suggestionRules: (data: any) => string[];
}

export interface IntentResult {
  metricId: string | 'UNKNOWN';
  confidence: number;
  filters: any;
}

export interface AIResponse {
  answer: string | object;
  suggestions?: string[];
  error: string | null;
  type: 'metric' | 'text' | 'clarification' | 'suggestion';
}
