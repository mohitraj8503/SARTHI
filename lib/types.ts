export interface MetricConfig {
  id: string;
  label: string;
  keywords: string[];
  synonyms: string[];
  weight: number;
  uiType: 'kpi' | 'trend' | 'table' | 'chart';
}

export type IntentType = 'greeting' | 'help' | 'thanks' | 'metric' | 'unknown';

export interface IntentResult {
  type: IntentType;
  metricId: string | null;
  confidence: number;
  originalQuery: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  suggestions?: string[];
  timestamp: Date;
}

export interface AIResponse {
  success: boolean;
  answer: string;
  metric?: string;
  data?: any;
  suggestions: string[];
  error?: string;
}
