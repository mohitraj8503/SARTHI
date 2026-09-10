import { useRouter } from 'next/navigation';
import { Metrics } from '@/hooks/useDashboardData';

interface UseDashboardActionsProps {
  metrics: Metrics;
}

export function useDashboardActions({ metrics }: UseDashboardActionsProps) {
  const router = useRouter();

  const handleExport = () => {
    const data = JSON.stringify({
      stats: metrics,
      timestamp: new Date().toISOString()
    });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCourse = () => {
    router.push('/admin/courses');
  };

  return {
    handleExport,
    handleAddCourse,
  };
}
