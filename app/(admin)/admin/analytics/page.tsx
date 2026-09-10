'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  BookOpen,
  IndianRupee,
  Activity,
  Calendar,
  ChevronDown,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsPage() {
  const queryClient = useQueryClient();

  // Date Dropdown State Fixes
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('30d');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time Granularity
  const [chartGranularity, setChartGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Map ranges
  const rangeLabels: Record<string, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '365d': 'Last Year'
  };

  // Click outside to close fix
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDateMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDateMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Soft auto-refresh handling (only when tab is active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['admin-analytics', selectedRange] });
      }
    }, 60000); // 60s soft refresh
    return () => clearInterval(interval);
  }, [queryClient, selectedRange]);

  // Adjust granularity defaults when range changes
  useEffect(() => {
    if (selectedRange === '7d') setChartGranularity('daily');
    if (selectedRange === '365d') setChartGranularity('monthly');
  }, [selectedRange]);

  // Fetch with abort signal handled automatically by react-query
  const { data: analyticsData, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin-analytics', selectedRange, chartGranularity],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        range: selectedRange,
        granularity: chartGranularity
      });
      const res = await fetch(`/api/admin/analytics?${params.toString()}`, { signal });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  const handleRangeSelect = (range: string) => {
    if (range === selectedRange) {
      setIsDateMenuOpen(false);
      return;
    }
    setSelectedRange(range);
    setIsDateMenuOpen(false);
  };

  // Grouped KPIs defined by the spec
  const businessKPIs = [
    { label: 'Total Revenue', value: analyticsData?.data?.business?.totalRevenue || 0, trend: null, isCurrency: true, subtitle: 'All time net revenue' },
    { label: 'Revenue in Range', value: analyticsData?.data?.business?.revenueInRange || 0, trend: analyticsData?.data?.business?.revenueTrendPct, isCurrency: true, subtitle: rangeLabels[selectedRange] },
    { label: 'Revenue MTD', value: analyticsData?.data?.business?.revenueMTD || 0, trend: null, isCurrency: true, subtitle: 'Current Calendar Month' },
    { label: 'Avg Rev / Paid Student', value: analyticsData?.data?.business?.avgRevenuePerPaidStudent || 0, trend: null, isCurrency: true, subtitle: 'Total Rev / Distinct Users' },
  ];

  const learnerKPIs = [
    { label: 'Total Students', value: analyticsData?.data?.learner?.totalStudents || 0, trend: null, isCurrency: false, subtitle: 'All Time' },
    { label: 'New Students', value: analyticsData?.data?.learner?.newStudentsInRange || 0, trend: analyticsData?.data?.learner?.newStudentsTrendPct, isCurrency: false, subtitle: rangeLabels[selectedRange] },
    { label: 'Active Students', value: analyticsData?.data?.learner?.activeStudentsInRange || 0, trend: null, isCurrency: false, subtitle: 'Sessions ' + rangeLabels[selectedRange] },
    { label: 'Course Completions', value: analyticsData?.data?.learner?.courseCompletionsInRange || 0, trend: analyticsData?.data?.learner?.completionsTrendPct, isCurrency: false, subtitle: rangeLabels[selectedRange] },
  ];

  const contentKPIs = [
    { label: 'Total Courses', value: analyticsData?.data?.content?.totalCourses || 0, trend: null, isCurrency: false, subtitle: 'All Time' },
    { label: 'Published Courses', value: analyticsData?.data?.content?.publishedCourses || 0, trend: null, isCurrency: false, subtitle: 'Live now' },
    { label: 'Avg Learner Progress', value: analyticsData?.data?.content?.avgLearnerProgress || 0, trend: null, isCurrency: false, isPercentage: true, subtitle: 'Across active enrollments' },
  ];

  const paymentKPIs = [
    { label: 'Success Transactions', value: analyticsData?.data?.payment?.successfulTxInRange || 0, trend: analyticsData?.data?.payment?.successTxTrendPct, isCurrency: false, subtitle: rangeLabels[selectedRange], icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Failed Transactions', value: analyticsData?.data?.payment?.failedTxInRange || 0, trend: analyticsData?.data?.payment?.failedTxTrendPct, isCurrency: false, subtitle: rangeLabels[selectedRange], icon: XCircle, color: 'text-red-600' },
    { label: 'Refund Count', value: analyticsData?.data?.payment?.refundCountInRange || 0, trend: null, isCurrency: false, subtitle: rangeLabels[selectedRange], icon: RefreshCw, color: 'text-amber-500' },
    { label: 'Refund Rate', value: analyticsData?.data?.payment?.refundRate || 0, trend: null, isCurrency: false, isPercentage: true, subtitle: '% of successful orders', icon: Activity, color: 'text-blue-500' },
  ];

  const youtubeKPIs = analyticsData?.data?.youtube ? [
    { label: 'YT Subscribers', value: analyticsData.data.youtube.subscribers || 0, trend: null, isCurrency: false, subtitle: 'Total Channel subs', icon: Users, color: 'text-red-600' },
    { label: 'YT Total Views', value: analyticsData.data.youtube.views || 0, trend: null, isCurrency: false, subtitle: 'Lifetime views', icon: Activity, color: 'text-red-500' },
    { label: 'YT Uploads', value: analyticsData.data.youtube.videos || 0, trend: null, isCurrency: false, subtitle: 'Videos on channel', icon: BookOpen, color: 'text-gray-600' },
  ] : [];

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPercentage = (val: number) => `${Number(val).toFixed(1)}%`;

  const KPICard = ({ item, isRefetching }: { item: any, isRefetching: boolean }) => (
    <div className="bg-white p-6 rounded-[20px] border border-[#E2E8F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all text-left">
      {isRefetching && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#1C2B4A] animate-spin" />
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <p className="text-[12px] font-bold text-[#7A8FAF] uppercase tracking-widest">{item.label}</p>
        {item.icon && (
          <item.icon className={cn("w-5 h-5", item.color || "text-[#1C2B4A]")} />
        )}
      </div>
      <div className="flex items-end gap-3 text-left">
        <h3 className="text-[28px] font-black text-[#1C2B4A] leading-none">
          {item.isCurrency ? formatCurrency(item.value) : item.isPercentage ? formatPercentage(item.value) : Number(item.value).toLocaleString()}
        </h3>
        {item.trend !== null && item.trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-bold pb-1",
            item.trend >= 0 ? "text-[#1A7A4A]" : "text-[#C0392B]"
          )}>
            {item.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(item.trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[11px] text-[#A8B8D8] font-medium mt-3">{item.subtitle}</p>
    </div>
  );

  const revenueTrend = analyticsData?.data?.revenueTrend || [];
  const topCourses = analyticsData?.data?.topCourses || [];

  const maxGross = revenueTrend.length > 0 ? Math.max(...revenueTrend.map((d: any) => d.gross), 1) : 1;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-[#1C2B4A]">Unable to load intelligence module</h3>
        <p className="text-[#7A8FAF] mt-2 mb-6 text-sm">Our analytics core encountered a synchronization error.</p>
        <button onClick={() => refetch()} className="px-6 py-2.5 bg-[#1C2B4A] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#2C3E5F] transition-all flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header & Date Range Handle */}
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">SYSTEM TELEMETRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            ANALYTICS <span className="text-[#F97316]">CENTER</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
            Real-time executive performance metrics, revenue trendlines, and growth intelligence.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isFetching && !isLoading && (
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
            </span>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              disabled={isFetching && isLoading}
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 bg-white border rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-sm outline-none",
                isDateMenuOpen ? "border-[#1C2B4A] text-[#1C2B4A] shadow-md" : "border-[#E2E8F4] text-[#7A8FAF] hover:border-[#1C2B4A] hover:text-[#1C2B4A]",
                (isFetching && isLoading) ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <Calendar className="w-4 h-4" />
              <span className="min-w-[100px] text-left">{rangeLabels[selectedRange]}</span>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <ChevronDown className={cn("w-4 h-4 transition-transform", isDateMenuOpen && "rotate-180")} />}
            </button>

            <AnimatePresence>
              {isDateMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[110%] w-[200px] bg-white rounded-[16px] shadow-2xl border border-[#E2E8F4] p-1.5 z-50 overflow-hidden"
                >
                  {Object.entries(rangeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleRangeSelect(key)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all",
                        selectedRange === key ? "bg-[#1C2B4A] text-white" : "text-[#7A8FAF] hover:bg-[#F8F9FC] hover:text-[#1C2B4A]"
                      )}
                    >
                      {label}
                      {selectedRange === key && <CheckCircle2 className="w-4 h-4 text-[#E8B84B]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[20px] border border-[#E2E8F4] h-32 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Business KPIs */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-[0.2em] px-2">Business & Revenue Matrix</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {businessKPIs.map((kpi, i) => <KPICard key={i} item={kpi} isRefetching={isFetching && !isLoading} />)}
            </div>
          </div>

          {/* YouTube Insights Row (Dynamic) */}
          {youtubeKPIs.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#FF0000] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF0000] rounded-full animate-pulse" />
                Audience Intelligence (YouTube)
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {youtubeKPIs.map((kpi, i) => <KPICard key={i} item={kpi} isRefetching={isFetching && !isLoading} />)}
              </div>
            </div>
          )}

          {/* Learner & Content KPIs Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#1A7A4A] uppercase tracking-[0.2em] px-2">Learner Intelligence</h4>
              <div className="grid grid-cols-2 gap-6">
                {learnerKPIs.map((kpi, i) => <KPICard key={i} item={kpi} isRefetching={isFetching && !isLoading} />)}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#3A6BC4] uppercase tracking-[0.2em] px-2">Content & Catalog</h4>
              <div className="grid grid-cols-2 gap-6">
                {contentKPIs.map((kpi, i) => <KPICard key={i} item={kpi} isRefetching={isFetching && !isLoading} />)}
                {/* Span 2 cols for completion if wanted, but fine here */}
              </div>
            </div>
          </div>

          {/* Transaction Health */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-[#E8B84B] uppercase tracking-[0.2em] px-2">Transaction Health</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {paymentKPIs.map((kpi, i) => <KPICard key={i} item={kpi} isRefetching={isFetching && !isLoading} />)}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Dynamic Trend Chart */}
            <div className="bg-white p-8 rounded-[24px] border border-[#E2E8F4] shadow-sm relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[24px]"></div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1C2B4A]">Net Revenue Trend</h3>
                  <p className="text-[12px] text-[#7A8FAF] font-medium mt-1 tracking-wide">Gross vs Returns • {rangeLabels[selectedRange]}</p>
                </div>

                <div className="flex bg-[#F8F9FC] p-1.5 rounded-[12px] border border-[#E2E8F4]">
                  {['daily', 'weekly', 'monthly'].map(g => {
                    // Disable invalid combos
                    const disabled = (selectedRange === '7d' && g !== 'daily') || (selectedRange === '30d' && g === 'monthly') || (selectedRange === '365d' && g === 'daily');
                    if (disabled) return null;
                    return (
                      <button
                        key={g}
                        onClick={() => setChartGranularity(g as any)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          chartGranularity === g ? "bg-white text-[#1C2B4A] shadow-sm border border-[#E2E8F4]" : "text-[#7A8FAF] hover:text-[#1C2B4A]"
                        )}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-[320px] w-full relative flex items-end justify-between gap-1 border-b border-[#F0F2F8] pb-1 z-10">
                {revenueTrend.length > 0 ? revenueTrend.map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Advanced Tooltip */}
                    <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="bg-[#1C2B4A] text-white p-4 rounded-2xl shadow-xl w-[180px] pointer-events-none transform -translate-x-1/2 left-1/2">
                        <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest mb-3 border-b border-white/10 pb-2">{d.label}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-[#A8B8D8]">Gross</span>
                            <span className="font-bold">₹{d.gross.toLocaleString()}</span>
                          </div>
                          {d.refunds > 0 && (
                            <div className="flex justify-between items-center text-[12px] text-red-400">
                              <span>Refunds</span>
                              <span className="font-bold">-₹{d.refunds.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[13px] text-[#E8B84B] pt-2 border-t border-white/10 mt-2 font-black">
                            <span>Net</span>
                            <span>₹{d.netRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((d.gross / maxGross) * 100, 1)}%` }}
                      className="w-full bg-[#1C2B4A]/5 group-hover:bg-[#1C2B4A]/20 rounded-t-sm transition-colors relative flex items-end border-b-2 border-transparent group-hover:border-[#E8B84B]"
                    >
                      {d.netRevenue > 0 && (
                        <div
                          style={{ height: `${(d.netRevenue / d.gross) * 100}%` }}
                          className="w-full bg-[#1C2B4A] rounded-t-sm transition-all"
                        />
                      )}
                    </motion.div>
                  </div>
                )) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#7A8FAF] opacity-50">
                    <LineChart className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-[14px] font-bold uppercase tracking-widest">No Revenue Activity</p>
                    <p className="text-[11px] mt-1">For selected timeframe</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-bold text-[#A8B8D8] uppercase tracking-wider">
                {revenueTrend.length > 0 && [revenueTrend[0].label, revenueTrend[revenueTrend.length - 1].label].map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </div>

            {/* Top Courses Ranked */}
            <div className="bg-white p-8 rounded-[24px] border border-[#E2E8F4] shadow-sm relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[24px]"></div>
              )}
              <div className="flex flex-col gap-1 mb-8">
                <h3 className="text-[18px] font-bold text-[#1C2B4A]">Top Performers</h3>
                <p className="text-[12px] text-[#7A8FAF] font-medium tracking-wide">Ranked by Net Revenue • {rangeLabels[selectedRange]}</p>
              </div>

              <div className="space-y-6">
                {topCourses.length > 0 ? topCourses.map((c: any, i: number) => (
                  <div key={c.id} className="group relative">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#F8F9FC] text-[#1C2B4A] font-black text-[14px] flex items-center justify-center shrink-0 group-hover:bg-[#1C2B4A] group-hover:text-white transition-colors border border-[#E2E8F4]">
                        {i + 1}
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <h4 className="text-[13px] font-bold text-[#1C2B4A] truncate pr-4 group-hover:text-[#3A6BC4] transition-colors">{c.title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#A8B8D8] font-bold uppercase tracking-widest">Revenue</span>
                            <span className="text-[12px] font-bold text-[#1A7A4A]">₹{c.revenue.toLocaleString()}</span>
                          </div>
                          <div className="w-px h-6 bg-[#F0F2F8]"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#A8B8D8] font-bold uppercase tracking-widest">Enrolls</span>
                            <span className="text-[12px] font-bold text-[#1C2B4A]">{c.enrollments}</span>
                          </div>
                          <div className="w-px h-6 bg-[#F0F2F8]"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#A8B8D8] font-bold uppercase tracking-widest">V/S PREV</span>
                            <span className="text-[12px] font-bold text-[#1C2B4A] flex items-center gap-0.5">
                              {c.trendPct > 0 ? <ArrowUpRight className="w-3 h-3 text-[#1A7A4A]" /> : c.trendPct < 0 ? <ArrowDownRight className="w-3 h-3 text-red-500" /> : null}
                              {Math.abs(c.trendPct).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 flex flex-col items-center justify-center text-[#7A8FAF] opacity-50">
                    <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                    <span className="text-[12px] font-bold uppercase tracking-widest">No course activity</span>
                  </div>
                )}

              </div>

              {topCourses.length > 0 && (
                <button className="w-full mt-8 py-3 bg-[#F8F9FC] text-[#1C2B4A] font-bold text-[11px] uppercase tracking-widest border border-[#E2E8F4] rounded-xl hover:bg-[#1C2B4A] hover:text-white transition-all">
                  Full Catalog Report
                </button>
              )}
            </div>
          </div>

        </>
      )}

    </div>
  );
}

// Loader Component for inline importing if needed
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}

