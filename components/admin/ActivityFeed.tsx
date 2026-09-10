'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  BookOpen,
  Award,
  Video,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Play,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ActivityItem {
  id: string;
  type: 'user_joined' | 'payment_success' | 'payment_failed' | 'enrollment' | 'certificate' | 'session_started' | 'support_ticket';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    userName?: string;
    courseName?: string;
    ticketId?: string;
  };
  read?: boolean;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
  onItemClick?: (item: ActivityItem) => void;
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ActivityFeed({
  activities = [],
  loading = false,
  onItemClick,
  maxItems = 10,
  autoRefresh = true,
  refreshInterval = 30000,
}: ActivityFeedProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [localActivities, setLocalActivities] = useState<ActivityItem[]>(activities);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  useEffect(() => {
    if (!autoRefresh || isPaused) return;

    const interval = setInterval(() => {
      setLocalActivities(activities);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isPaused, refreshInterval, activities]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_joined': return <Users size={16} />;
      case 'payment_success': return <CheckCircle2 size={16} />;
      case 'payment_failed': return <XCircle size={16} />;
      case 'enrollment': return <BookOpen size={16} />;
      case 'certificate': return <Award size={16} />;
      case 'session_started': return <Video size={16} />;
      case 'support_ticket': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_joined': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'payment_success': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'payment_failed': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'enrollment': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      case 'certificate': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
      case 'session_started': return { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' };
      case 'support_ticket': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { bg: 'rgba(160, 160, 176, 0.1)', color: '#a0a0b0' };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const displayedActivities = localActivities.slice(0, maxItems);

  return (
    <div style={{
      background: '#16161f',
      border: '1px solid #2a2a36',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid #2a2a36',
        background: '#12121a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5' }}>
            Activity Feed
          </span>
          <span style={{
            fontSize: 11,
            color: '#606070',
            padding: '2px 6px',
            background: '#1a1a24',
            borderRadius: 4,
          }}>
            LIVE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid #2a2a36',
              borderRadius: 6,
              fontSize: 12,
              color: '#a0a0b0',
              cursor: 'pointer',
            }}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid #2a2a36',
              borderRadius: 6,
              fontSize: 12,
              color: '#a0a0b0',
              cursor: 'pointer',
            }}
          >
            <Loader2 size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div style={{
        maxHeight: 400,
        overflowY: 'auto',
      }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Loader2 size={24} style={{ color: '#606070', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#606070', marginTop: 8 }}>Loading activities...</p>
          </div>
        ) : displayedActivities.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: '#404050', marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: '#606070' }}>No recent activity</p>
          </div>
        ) : (
          displayedActivities.map((item, index) => {
            const colors = getActivityColor(item.type);
            return (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: index < displayedActivities.length - 1 ? '1px solid #2a2a36' : 'none',
                  cursor: onItemClick ? 'pointer' : 'default',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1a1a24';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.color,
                  flexShrink: 0,
                }}>
                  {getActivityIcon(item.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 2,
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#f0f0f5',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: '#606070',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}>
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12,
                    color: '#a0a0b0',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.description}
                  </p>
                  {item.metadata && (
                    <div style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 6,
                      flexWrap: 'wrap',
                    }}>
                      {item.metadata.userName && (
                        <span style={{ fontSize: 11, color: '#606070' }}>
                          {item.metadata.userName}
                        </span>
                      )}
                      {item.metadata.amount && (
                        <span style={{ fontSize: 11, color: '#22c55e' }}>
                          ₹{item.metadata.amount.toLocaleString()}
                        </span>
                      )}
                      {item.metadata.courseName && (
                        <span style={{ fontSize: 11, color: '#a855f7' }}>
                          {item.metadata.courseName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #2a2a36',
        textAlign: 'center',
      }}>
<button
  onClick={() => {
    router.push('/admin/activity');
  }}
  style={{
    fontSize: 12,
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  }}
>
  View all activity
  <ExternalLink size={12} />
</button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Demo data - ONLY used when DEMO_MODE=true
export const demoActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'user_joined',
    title: 'New user registered',
    description: 'John Doe joined the platform',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    metadata: { userName: 'John Doe' },
  },
  {
    id: '2',
    type: 'payment_success',
    title: 'Payment successful',
    description: '₹2,500 received for React Fundamentals',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    metadata: { amount: 2500, userName: 'Rahul S.', courseName: 'React Fundamentals' },
  },
  {
    id: '3',
    type: 'enrollment',
    title: 'New enrollment',
    description: 'Student enrolled in Node.js Mastery',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    metadata: { userName: 'Priya M.', courseName: 'Node.js Mastery' },
  },
  {
    id: '4',
    type: 'payment_failed',
    title: 'Payment failed',
    description: 'Payment of ₹1,500 could not be processed',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    metadata: { amount: 1500, userName: 'Amit K.' },
  },
  {
    id: '5',
    type: 'certificate',
    title: 'Certificate issued',
    description: 'Certificate awarded for Python Complete',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    metadata: { userName: 'Sarah L.', courseName: 'Python Complete' },
  },
  {
    id: '6',
    type: 'session_started',
    title: 'Live session started',
    description: 'Live class for DSA Interview Prep is now live',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    metadata: { courseName: 'DSA Interview Prep' },
  },
];

