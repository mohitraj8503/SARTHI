'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Activity,
  Search,
  Clock,
  Bell,
  Download,
  FileText,
  MoreVertical,
  X,
  ExternalLink,
  Copy,
  Filter,
  WifiOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowUp,
  User,
  BookOpen,
  GraduationCap,
  CreditCard,
  Server,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Types
interface ActivityEvent {
  id: string;
  timestamp: string;
  source: string;
  action: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  actor: {
    name: string;
    role: string;
    id: string;
    avatarUrl?: string;
  };
  entity: {
    type: string;
    id: string;
    name: string;
  };
  meta: Record<string, unknown>;
  isRead: boolean;
  links: {
    entityUrl?: string;
    detailsUrl: string;
  };
}

interface ActivitySummary {
  todayCount: number;
  weekCount: number;
  systemHealth: number;
  criticalEvents: number;
  warningEvents: number;
  unreadCount: number;
  recentCritical: Array<{
    id: string;
    type: string;
    action: string;
    actorName: string;
    targetName: string;
    timestamp: string;
  }>;
}

interface Notification {
  id: string;
  type: string;
  action: string;
  severity: string;
  source: string;
  actorName: string;
  targetName: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

// Tab configuration
const TABS = [
  { id: 'all', label: 'All Activity', source: undefined },
  { id: 'students', label: 'Students', source: 'students' },
  { id: 'teachers', label: 'Teachers', source: 'teachers' },
  { id: 'courses', label: 'Courses', source: 'courses' },
  { id: 'system', label: 'System', source: 'system' },
];

// Source icons type
type SourceIconType = {
  students: typeof User;
  teachers: typeof GraduationCap;
  courses: typeof BookOpen;
  payments: typeof CreditCard;
  system: typeof Server;
};

// Severity colors
const SEVERITY_COLORS = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

const SEVERITY_BG_COLORS = {
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  critical: 'bg-red-50 text-red-700',
};

// Helper functions
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatExactTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

// Skeleton loader for activity rows
function ActivityRowSkeleton() {
  return (
    <div className="p-6 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-64 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // URL params
  const sourceParam = searchParams.get('source') || 'all';
  const qParam = searchParams.get('q') || '';

  // Local state
  const [source, setSource] = useState(sourceParam);
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activityListRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (source !== 'all') params.set('source', source);
    if (debouncedSearch) params.set('q', debouncedSearch);
    const newUrl = params.toString() ? `?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [source, debouncedSearch, pathname, router]);

   // Fetch activities
   const { data: activitiesData, isLoading } = useQuery({
     queryKey: ['activities', source, debouncedSearch],
     queryFn: async () => {
       const params = new URLSearchParams();
       if (source !== 'all') params.set('source', source);
       if (debouncedSearch) params.set('q', debouncedSearch);
       params.set('limit', '20');

       const res = await fetch(`/api/activity/feed?${params.toString()}`);
       if (!res.ok) throw new Error('Failed to fetch activities');
       return res.json();
     },
     refetchInterval: 30000, // Refetch every 30 seconds for "live" updates
   });

  // Fetch summary
  const { data: summaryData } = useQuery({
    queryKey: ['activity-summary'],
    queryFn: async () => {
      const res = await fetch('/api/activity/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json() as Promise<ActivitySummary>;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/activity/notifications?limit=10');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json() as Promise<{ notifications: Notification[]; unreadCount: number }>;
    },
    refetchInterval: 15000,
  });

  // Load more activities
  const loadMore = async () => {
    if (!activitiesData?.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (source !== 'all') params.set('source', source);
      if (debouncedSearch) params.set('q', debouncedSearch);
      params.set('limit', '20');
      params.set('cursor', activitiesData.items[activitiesData.items.length - 1]?.id || '');

      const res = await fetch(`/api/activity/feed?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch more activities');
      const data = await res.json();

      queryClient.setQueryData(['activities', source, debouncedSearch], {
        ...data,
        items: [...(activitiesData?.items || []), ...data.items],
      });
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle SSE connection
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      setConnectionStatus('connecting');
      eventSource = new EventSource('/api/activity/sse');

      eventSource.onopen = () => {
        setConnectionStatus('online');
      };

      eventSource.onerror = () => {
        setConnectionStatus('offline');
        eventSource?.close();
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };

      eventSource.addEventListener('connected', () => {
        setConnectionStatus('online');
      });
    };

    connectSSE();

    return () => {
      eventSource?.close();
    };
  }, []);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setSelectedEvent(null);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Prepend new activities when scrolled to top
  const handleNewActivitiesClick = () => {
    if (activityListRef.current) {
      activityListRef.current.scrollTop = 0;
    }
    setNewActivitiesCount(0);
    queryClient.invalidateQueries({ queryKey: ['activities'] });
  };

  // Export data
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (source !== 'all') params.set('source', source);
      if (debouncedSearch) params.set('q', debouncedSearch);
      params.set('format', format);

      const res = await fetch(`/api/activity/feed?${params.toString()}`, {
        method: 'GET',
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Mark notifications as read
  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/activity/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notifications:', error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Get border color based on source
  const getBorderColor = (src: string) => {
    switch (src) {
      case 'students':
        return 'border-l-[#3A6BC4]';
      case 'teachers':
        return 'border-l-[#E8B84B]';
      case 'courses':
        return 'border-l-[#1A7A4A]';
      case 'payments':
        return 'border-l-[#8B5CF6]';
      case 'system':
        return 'border-l-[#7A8299]';
      default:
        return 'border-l-[#E2E8F4]';
    }
  };

  // Get status message
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'online':
        return 'All systems operational';
      case 'connecting':
        return 'Connecting...';
      case 'offline':
        return 'Reconnecting...';
    }
  };

  const activities = activitiesData?.items || [];
  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const summary = summaryData || { todayCount: 0, weekCount: 0, systemHealth: 100 };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in pb-12">
      {/* Main Feed */}
      <div className="flex-1 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title and Live Badge */}
          <div className="flex items-center gap-4">
            <h1 className="text-[32px] font-bold text-[#1C2B4A] tracking-tight">Activity Feed</h1>
            <div
              className={cn(
                'flex items-center border rounded-full px-4 py-1.5 shadow-sm',
                connectionStatus === 'online'
                  ? 'bg-[#E8F5EE] border-[#E8F5EE]'
                  : connectionStatus === 'connecting'
                  ? 'bg-[#FEF3C7] border-[#FEF3C7]'
                  : 'bg-red-50 border-red-200'
              )}
            >
              {connectionStatus === 'online' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#1A7A4A] mr-2 animate-pulse shadow-[0_0_8px_rgba(26,122,74,0.3)]" />
                  <span className="text-[10px] font-bold text-[#1A7A4A] tracking-widest uppercase">Live</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Loader2 className="w-3 h-3 text-amber-600 mr-2 animate-spin" />
                  <span className="text-[10px] font-bold text-amber-600 tracking-widest uppercase">Connecting</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-600 mr-2" />
                  <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search system..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 lg:w-80 border border-[#E2E8F4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B] focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 border border-[#E2E8F4] rounded-lg hover:bg-[#F8F9FC] transition-colors relative"
              >
                <Bell className="w-5 h-5 text-[#7A8FAF]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Drawer */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E2E8F4] rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-[#F0F2F8] flex items-center justify-between">
                    <h3 className="font-bold text-[#1C2B4A]">Notifications</h3>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[#7A8FAF] hover:text-[#1C2B4A]"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-[#7A8FAF] text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setSelectedEvent({
                              id: n.id,
                              timestamp: n.timestamp,
                              source: n.source,
                              action: n.action,
                              severity: n.severity as any,
                              actor: { name: n.actorName, role: '', id: '' },
                              entity: { type: '', id: '', name: n.targetName || '' },
                              meta: n.metadata,
                              isRead: false,
                              links: { detailsUrl: `/admin/activity/${n.id}` },
                            });
                            setShowNotifications(false);
                          }}
                          className="p-4 border-b border-[#F0F2F8] hover:bg-[#F8F9FC] cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full mt-2',
                                SEVERITY_COLORS[n.severity as keyof typeof SEVERITY_COLORS]
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1C2B4A] truncate">
                                {n.actorName} - {n.action}
                              </p>
                              <p className="text-xs text-[#7A8FAF] truncate">{n.targetName}</p>
                              <p className="text-xs text-[#7A8FAF] mt-1">
                                {formatRelativeTime(n.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-[#F0F2F8]">
                    <button
                      onClick={() => {
                        router.push('/admin/activity?source=system');
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-sm text-[#E8B84B] font-medium hover:underline"
                    >
                      View in Activity Feed
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E2B84B] bg-[#E8B84B]/10 text-[#E8B84B] rounded-lg hover:bg-[#E8B84B]/20 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-[#E2E8F4] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F8F9FC] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F8F9FC] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-[#E2E8F4] w-fit shadow-sm overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSource(tab.id)}
              className={cn(
                'px-6 py-2.5 rounded-lg text-[12px] font-bold transition-all uppercase tracking-widest whitespace-nowrap',
                source === tab.id
                  ? 'bg-[#E8B84B] text-white shadow-lg shadow-[#E8B84B]/20'
                  : 'text-[#7A8FAF] hover:text-[#1C2B4A]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* New Activities Banner */}
        {newActivitiesCount > 0 && (
          <button
            onClick={handleNewActivitiesClick}
            className="w-full py-3 bg-[#E8B84B] text-white rounded-lg flex items-center justify-center gap-2 shadow-lg animate-bounce"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="font-bold">{newActivitiesCount} new activities</span>
          </button>
        )}

        {/* Feed Card */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F4] shadow-sm overflow-hidden">
          <div ref={activityListRef} className="divide-y divide-[#F0F2F8] max-h-[calc(100vh-400px)] overflow-y-auto">
            {isLoading ? (
              <>
                <ActivityRowSkeleton />
                <ActivityRowSkeleton />
                <ActivityRowSkeleton />
                <ActivityRowSkeleton />
                <ActivityRowSkeleton />
              </>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 text-[#E2E8F4] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#1C2B4A] mb-2">No activity found</h3>
                <p className="text-[#7A8FAF] mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSource('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#E8B84B] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              activities.map((activity: ActivityEvent) => (
                <div
                  key={activity.id}
                  className={cn(
                    'p-6 flex items-center justify-between group hover:bg-[#F8F9FC] transition-all border-l-[4px] relative cursor-pointer',
                    getBorderColor(activity.source)
                  )}
                  onClick={() => setSelectedEvent(activity)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#1C2B4A]/5 flex items-center justify-center font-bold text-[#1C2B4A] border border-[#1C2B4A]/10 shadow-sm relative overflow-hidden transition-transform group-hover:scale-110">
                      {activity.actor.avatarUrl ? (
                        <Image
                          src={activity.actor.avatarUrl}
                          alt={activity.actor.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(activity.actor.name)
                      )}
                      {/* Severity dot */}
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                          SEVERITY_COLORS[activity.severity]
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-0.5">
                      <p className="text-[15px] font-bold text-[#1C2B4A] transition-colors">
                        {activity.actor.name}
                        {activity.action !== 'GENERIC' && (
                          <span className="text-[#7A8FAF] font-normal">
                            {' '}
                            {activity.action.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        )}
                        {activity.entity.name && (
                          <span className="text-[#E8B84B]"> {activity.entity.name}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#7A8FAF] font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        {formatRelativeTime(activity.timestamp)} •
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {activity.source !== 'system' && (
                          <>
                            {' '}
                            •{' '}
                            <span className="capitalize">{activity.source}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === activity.id ? null : activity.id);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 text-[#7A8FAF] hover:text-[#1C2B4A] transition-all"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === activity.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F4] rounded-lg shadow-lg z-50 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(activity);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[#F8F9FC] flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          View details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(activity.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[#F8F9FC] flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy event ID
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSource(activity.source);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[#F8F9FC] flex items-center gap-2"
                        >
                          <Filter className="w-4 h-4" />
                          Filter by {activity.source}
                        </button>
                        {activity.links.entityUrl && (
                          <a
                            href={activity.links.entityUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-[#F8F9FC] flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View {activity.entity.type}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {activitiesData?.hasMore && (
            <div className="p-6 bg-[#F8F9FC] text-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="text-[12px] font-bold text-[#1C2B4A] uppercase tracking-widest hover:bg-[#1C2B4A]/5 py-2 px-8 rounded-full border border-[#E2E8F4] transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Activity'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - 280px */}
      <div className="w-full lg:w-[280px] space-y-6">
        {/* Activity Summary */}
        <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F4] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#1C2B4A] uppercase tracking-widest mb-6 border-b border-[#F0F2F8] pb-4">
            Activity Summary
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#7A8FAF] font-medium">Today&apos;s Actions</span>
              <span className="px-3 py-1 bg-blue-50 text-[#3A6BC4] rounded-lg text-[12px] font-bold">
                {summary.todayCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#7A8FAF] font-medium">This Week</span>
              <span className="px-3 py-1 bg-amber-50 text-[#B8860B] rounded-lg text-[12px] font-bold">
                {summary.weekCount}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#F0F2F8] pt-4">
              <span className="text-[13px] text-[#7A8FAF] font-medium">System Health</span>
              <div
                className={cn(
                  'flex items-center gap-1.5 font-bold text-[12px]',
                  summary.systemHealth >= 80
                    ? 'text-[#1A7A4A]'
                    : summary.systemHealth >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                )}
              >
                {summary.systemHealth >= 80 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : summary.systemHealth >= 50 ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {summary.systemHealth}%
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F4] shadow-sm">
          <div
            className={cn(
              'flex items-center gap-3 mb-4',
              connectionStatus === 'online'
                ? 'text-[#1A7A4A]'
                : connectionStatus === 'connecting'
                ? 'text-amber-600'
                : 'text-red-600'
            )}
          >
            <Database className="w-5 h-5" />
            <h3 className="text-[14px] font-bold uppercase tracking-widest">System Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full shadow-[0_0_8px_rgba(26,122,74,0.3)]',
                  connectionStatus === 'online'
                    ? 'bg-[#1A7A4A]'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-red-500'
                )}
              />
              <span className="text-[12px] font-bold text-[#1C2B4A]">{getStatusMessage()}</span>
            </div>
            <p className="text-[11px] text-[#7A8FAF] leading-relaxed">
              {connectionStatus === 'online'
                ? 'Infrastructure clusters are running at optimal capacity with no detected latency issues.'
                : connectionStatus === 'connecting'
                ? 'Attempting to establish real-time connection...'
                : 'Real-time updates paused. Reconnecting automatically...'}
            </p>
          </div>
        </div>
      </div>

      {/* Event Details Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setSelectedEvent(null)}
          />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-[#E2E8F4] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1C2B4A]">Event Details</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-[#F8F9FC] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#7A8FAF]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Severity Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold uppercase',
                    SEVERITY_BG_COLORS[selectedEvent.severity]
                  )}
                >
                  {selectedEvent.severity}
                </span>
                <span className="text-xs text-[#7A8FAF] uppercase">{selectedEvent.source}</span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4A]">
                  {selectedEvent.actor.name}
                </h3>
                <p className="text-[#7A8FAF]">
                  {selectedEvent.action.replace(/_/g, ' ').toLowerCase()}
                  {selectedEvent.entity.name && ` ${selectedEvent.entity.name}`}
                </p>
              </div>

              {/* Timestamp */}
              <div className="bg-[#F8F9FC] rounded-lg p-4">
                <p className="text-xs text-[#7A8FAF] uppercase tracking-wider mb-1">Timestamp</p>
                <p className="text-sm font-medium text-[#1C2B4A]">
                  {formatExactTime(selectedEvent.timestamp)}
                </p>
              </div>

              {/* Actor */}
              <div>
                <h4 className="text-xs text-[#7A8FAF] uppercase tracking-wider mb-2">Actor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C2B4A]/5 flex items-center justify-center font-bold text-[#1C2B4A]">
                    {getInitials(selectedEvent.actor.name)}
                  </div>
                  <div>
                    <p className="font-medium text-[#1C2B4A]">{selectedEvent.actor.name}</p>
                    <p className="text-xs text-[#7A8FAF] capitalize">{selectedEvent.actor.role || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Entity */}
              {selectedEvent.entity.name && (
                <div>
                  <h4 className="text-xs text-[#7A8FAF] uppercase tracking-wider mb-2">Entity</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1C2B4A]">{selectedEvent.entity.name}</p>
                      <p className="text-xs text-[#7A8FAF] capitalize">{selectedEvent.entity.type || 'Unknown'}</p>
                    </div>
                    {selectedEvent.links.entityUrl && (
                      <a
                        href={selectedEvent.links.entityUrl}
                        className="flex items-center gap-1 text-sm text-[#E8B84B] hover:underline"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {Object.keys(selectedEvent.meta).length > 0 && (
                <div>
                  <h4 className="text-xs text-[#7A8FAF] uppercase tracking-wider mb-2">Additional Details</h4>
                  <div className="bg-[#F8F9FC] rounded-lg p-4 space-y-2">
                    {Object.entries(selectedEvent.meta).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-[#7A8FAF] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-[#1C2B4A] font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event ID */}
              <div>
                <h4 className="text-xs text-[#7A8FAF] uppercase tracking-wider mb-2">Event ID</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#F8F9FC] rounded px-3 py-2 text-xs font-mono text-[#1C2B4A]">
                    {selectedEvent.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedEvent.id)}
                    className="p-2 hover:bg-[#F8F9FC] rounded transition-colors"
                    title="Copy Event ID"
                  >
                    <Copy className="w-4 h-4 text-[#7A8FAF]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



