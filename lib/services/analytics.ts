import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function calculateTrend(currentValue: number, previousValue: number) {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

export async function detectAnomalies(metricId: string, currentValue: number) {
  // Simple moving average anomaly detection (simulated without historical table for now)
  // In a real scenario, fetch last 7 days of this metric from a snapshot table
  const baseline = 100; // Simulated historical average
  const threshold = 0.5; // 50% deviation is an anomaly

  if (Math.abs(currentValue - baseline) / baseline > threshold) {
    return {
      isAnomaly: true,
      severity: currentValue < baseline ? 'NEGATIVE' : 'POSITIVE',
      message: `Value ${currentValue} is significantly different from historical average of ${baseline}.`
    };
  }
  return { isAnomaly: false };
}

export async function generateForecast(metricId: string) {
  // Simple linear projection (Last 7 days average * 30 for monthly forecast)
  const last7DaysAverage = 15; // Simulated
  return {
    forecast30Days: last7DaysAverage * 30,
    confidence: "MEDIUM",
    model: "LINEAR_SMA"
  };
}
