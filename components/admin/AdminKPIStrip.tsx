'use client';

import { TrendingUp, TrendingDown, Users, CreditCard, BookOpen, Video, AlertCircle } from 'lucide-react';

export interface KPIItem {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  type?: 'users' | 'revenue' | 'courses' | 'sessions' | 'tickets' | 'custom';
}

interface AdminKPIStripProps {
  kpis: KPIItem[];
  loading?: boolean;
}

export function AdminKPIStrip({ kpis, loading }: AdminKPIStripProps) {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))`,
        gap: 16,
        padding: '20px 0',
      }}>
        {kpis.map((_, i) => (
          <div key={i} style={{
            background: '#16161f',
            border: '1px solid #2a2a36',
            borderRadius: 8,
            padding: '16px 20px',
          }}>
            <div className="admin-skeleton" style={{ width: 80, height: 12, marginBottom: 8 }} />
            <div className="admin-skeleton" style={{ width: 60, height: 28, marginBottom: 4 }} />
            <div className="admin-skeleton" style={{ width: 40, height: 10 }} />
          </div>
        ))}
      </div>
    );
  }

  const getIcon = (type: KPIItem['type']) => {
    switch (type) {
      case 'users': return <Users size={18} />;
      case 'revenue': return <CreditCard size={18} />;
      case 'courses': return <BookOpen size={18} />;
      case 'sessions': return <Video size={18} />;
      case 'tickets': return <AlertCircle size={18} />;
      default: return <Users size={18} />;
    }
  };

  const getIconColor = (type: KPIItem['type']) => {
    switch (type) {
      case 'users': return '#3b82f6';
      case 'revenue': return '#22c55e';
      case 'courses': return '#a855f7';
      case 'sessions': return '#f59e0b';
      case 'tickets': return '#ef4444';
      default: return '#a0a0b0';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))`,
      gap: 16,
      padding: '20px 0',
    }}>
      {kpis.map((kpi, i) => (
        <div
          key={i}
          style={{
            background: '#16161f',
            border: '1px solid #2a2a36',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getIconColor(kpi.type),
            flexShrink: 0,
          }}>
            {getIcon(kpi.type)}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12,
              color: '#606070',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontWeight: 500,
            }}>
              {kpi.label}
            </div>
            
            <div style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#f0f0f5',
              fontFamily: 'var(--admin-font-mono, monospace)',
              lineHeight: 1.2,
            }}>
              {kpi.value}
            </div>
            
            {(kpi.subValue || kpi.trend !== undefined) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 6,
                flexWrap: 'wrap',
              }}>
                {kpi.trend !== undefined && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 500,
                    color: kpi.trend >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {kpi.trend >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {Math.abs(kpi.trend)}%
                  </span>
                )}
                
                {kpi.subValue && (
                  <span style={{
                    fontSize: 12,
                    color: '#606070',
                  }}>
                    {kpi.subValue}
                  </span>
                )}
                
                {kpi.trendLabel && (
                  <span style={{
                    fontSize: 12,
                    color: '#a0a0b0',
                  }}>
                    {kpi.trendLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Default KPI data helper
export function createDefaultKPIs(data: {
  totalUsers: number;
  todayUsers?: number;
  activeStudents: number;
  revenue: number;
  monthRevenue?: number;
  seminars: number;
  openTickets: number;
  userTrend?: number;
  revenueTrend?: number;
}): KPIItem[] {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString()}`;
  };

  return [
    {
      label: 'Total Users',
      value: formatNumber(data.totalUsers),
      subValue: data.todayUsers ? `Today: ${formatNumber(data.todayUsers)}` : undefined,
      trend: data.userTrend,
      type: 'users',
    },
    {
      label: 'Active Students',
      value: formatNumber(data.activeStudents),
      trend: data.userTrend,
      trendLabel: '24h active',
      type: 'users',
    },
    {
      label: 'Revenue',
      value: formatCurrency(data.revenue),
      subValue: data.monthRevenue ? `Month: ${formatCurrency(data.monthRevenue)}` : undefined,
      trend: data.revenueTrend,
      type: 'revenue',
    },
    {
      label: 'Seminars',
      value: data.seminars,
      type: 'sessions',
    },
    {
      label: 'Open Tickets',
      value: data.openTickets,
      type: 'tickets',
    },
  ];
}

