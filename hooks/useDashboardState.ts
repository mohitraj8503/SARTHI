import { useState } from 'react';

export function useDashboardState() {
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('month');

  return {
    chartPeriod,
    setChartPeriod,
  };
}
