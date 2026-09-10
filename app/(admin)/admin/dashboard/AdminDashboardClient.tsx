'use client';

import React, { useState } from 'react';
import { Plus, Download, FileSpreadsheet, MessageSquare, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { StatsSection } from './StatsSection';
import AnalyticsChart from './AnalyticsChart';
import InsightsPanel from '@/components/admin/InsightsPanel';
import AIChatBox from '@/components/admin/AIChatBox';
import { useToast } from '@/components/ToastProvider';
import MentorEmailPortal from '@/components/mentor/MentorEmailPortal';

interface AdminDashboardClientProps {
  initialData: any;
  currentTab?: string;
  students?: any[];
}

export default function AdminDashboardClient({ initialData, currentTab = 'dashboard', students = [] }: AdminDashboardClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [range, setRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState(currentTab);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  React.useEffect(() => {
    const handleUrlUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'dashboard';
      setActiveTab(tab);
    };

    handleUrlUpdate();
    window.addEventListener('popstate', handleUrlUpdate);
    return () => window.removeEventListener('popstate', handleUrlUpdate);
  }, [currentTab]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/dashboard/stats?range=${range}`);
      const result = await res.json();
      return result.data;
    },
    initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes (Keep in memory)
  });

  const metrics = data?.metrics || {};
  const revenueChartData = data?.revenueChartData || [];

  const handleExportPDF = async () => {
    setIsExporting(true);
    addToast({
      type: 'info',
      title: 'Generating Report',
      message: 'Compiling real-time platform executive business ledger...'
    });

    try {
      const res = await fetch(`/api/admin/dashboard/export?range=${range}`);
      if (!res.ok) throw new Error('Failed to retrieve dashboard export logs');

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Server error');

      // Dynamically import PDF renderer and component
      const { pdf } = await import('@react-pdf/renderer');
      const { PremiumReportPDF } = await import('../students/components/PremiumReportPDF');

      // Compile report
      const blob = await pdf(<PremiumReportPDF type="dashboard" data={result.data} />).toBlob();

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Export Finalized',
        message: 'Platform executive PDF report exported successfully'
      });
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'An error occurred during PDF generation'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      addToast({
        type: 'info',
        title: 'Generating CSV',
        message: 'Compiling real-time dashboard ledger...'
      });

      const metrics = data?.metrics || {};
      const activities = data?.activities || [];
      const alerts = data?.alerts || [];
      const health = data?.health || [];

      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Section 1: Executive KPI Metrics
      csvContent += "SECTION 1: PLATFORM KPI METRICS\n";
      csvContent += "Metric Name,Value,Growth Rate\n";
      csvContent += `Total Revenue,INR ${metrics.totalRevenue || 0},${metrics.revenueChangePct || 0}%\n`;
      csvContent += `Active Students,${metrics.activeStudents || 0},${metrics.activeStudentsChangePct || 0}%\n`;
      csvContent += `Published Courses,${metrics.publishedCourses || 0},N/A\n`;
      csvContent += `Pending Approvals,${metrics.pendingApplications || 0},N/A\n`;
      csvContent += `Today's Enrollments,${metrics.todaysEnrollment || 0},${metrics.todaysEnrollmentChangePct || 0}%\n`;
      csvContent += `Completion Rate,${metrics.completionRatePct || 0}%,${metrics.completionRateChangePct || 0}%\n\n`;

      // Section 2: Platform Alerts
      csvContent += "SECTION 2: CRITICAL PLATFORM ALERTS\n";
      csvContent += "Severity,Alert Message,Status\n";
      if (alerts.length > 0) {
        alerts.forEach((a: any) => {
          csvContent += `"${a.severity}","${a.message.replace(/"/g, '""')}","Action Required"\n`;
        });
      } else {
        csvContent += "Healthy,All Systems Operational,✓ Normal\n";
      }
      csvContent += "\n";

      // Section 3: System Health Uptime
      csvContent += "SECTION 3: SYSTEM HEALTH AUDIT\n";
      csvContent += "Service Name,Details,Status\n";
      if (health.length > 0) {
        health.forEach((h: any) => {
          csvContent += `"${h.name}","${h.details}","${h.status.toUpperCase()}"\n`;
        });
      } else {
        csvContent += "Database Connectivity,Prisma PostgreSQL,HEALTHY\n";
      }
      csvContent += "\n";

      // Section 4: Live Activity Ledger
      csvContent += "SECTION 4: PLATFORM OPERATIONS ACTIVITY LEDGER\n";
      csvContent += "Actor,Event Type,Description,Timestamp\n";
      activities.forEach((act: any) => {
        csvContent += `"${act.actorName}","${act.type}","${act.description.replace(/"/g, '""')}","${act.timestamp}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        type: 'success',
        title: 'Export Finalized',
        message: 'Dashboard CSV report exported successfully'
      });
    } catch (err: any) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'An error occurred during CSV generation'
      });
    }
  };

  return (
    <>
    <div className="relative flex-1 w-full animate-fade-in">
      {/* Background Atmosphere - Same as Students/Teachers */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
      </div>

      {activeTab === 'email' ? (
        <div className="pb-20">
          <div className="mb-8 space-y-2 text-center sm:text-left">
            <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
              <div className="w-8 h-1.5 bg-orange-500 rounded-full" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Communication</span>
            </div>
            <h1 className="text-3xl sm:text-[44px] font-black text-[#0F172A] tracking-tighter uppercase leading-[1.1] sm:leading-[0.9]">
              Email <span className="text-orange-500">Portal</span>
            </h1>
            <p className="text-[13px] sm:text-[14px] font-medium text-slate-400 max-w-[550px] leading-relaxed mx-auto sm:mx-0">
              Dispatch high-impact institutional announcements and targeted communications directly via Resend.
            </p>
          </div>
          <MentorEmailPortal students={students} />
        </div>
      ) : (
        <div className="space-y-10 pb-20">          {/* Header Section with Standardized Typography and Actions */}
          <header className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-10">
            <div className="space-y-1.5 text-left relative">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="h-1.5 w-5 bg-orange-500 rounded-full" />
                <span className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-[0.25em]">ADMIN CONTROL</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]">
                Welcome back, <span className="text-orange-500">Administrator</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5 max-w-2xl">
                Real-time platform telemetry, user management, and operational growth analytics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 w-full xl:w-auto">
              <button
                onClick={() => router.push('/admin/courses?action=new')}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> New Course
              </button>

              <button
                onClick={() => handleExportPDF()}
                disabled={isExporting}
                className="flex items-center justify-center gap-2.5 bg-[#0F172A] text-white px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>

              <button
                onClick={() => handleExportCSV()}
                className="flex items-center justify-center gap-2.5 bg-slate-100 text-[#0F172A] border border-slate-200 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </header>

          {/* Admin Voice Feedback Modal */}
          {isFeedbackOpen && (
            <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left relative animate-scaleUp">
                <button 
                  onClick={() => setIsFeedbackOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-5 bg-orange-500 rounded-full" />
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.25em]">ADMIN VOICE</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Share Your Feedback</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Share suggestions, platform feature requests, or rate your admin console workflow experience!
                  </p>
                </div>

                {feedbackSubmitted ? (
                  <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl text-center space-y-2 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                      ✓
                    </div>
                    <h4 className="text-base font-black text-orange-900 uppercase">Thank You!</h4>
                    <p className="text-xs text-orange-800 font-medium">
                      Your {rating}-star rating and feedback have been logged with our core development team.
                    </p>
                    <button 
                      onClick={() => {
                        setIsFeedbackOpen(false);
                        setFeedbackSubmitted(false);
                        setFeedbackText('');
                      }}
                      className="mt-3 px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-700 transition-all"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!feedbackText.trim()) return;
                      try {
                        await fetch('/api/feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ feedback: feedbackText, rating, page: 'admin-dashboard' })
                        }).catch(() => {});
                      } catch (err) {}
                      setFeedbackSubmitted(true);
                    }} 
                    className="space-y-4"
                  >
                    {/* 5-Star Rating Selector */}
                    <div className="space-y-1.5 text-left bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Rate Your Console Experience
                        </label>
                        <span className="text-xs font-black text-amber-500">
                          {hoverRating || rating} / 5 Stars
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-all focus:outline-none"
                            title={`${star} Star`}
                          >
                            <Star 
                              className={cn(
                                "w-6 h-6 transition-all",
                                (hoverRating ? star <= hoverRating : star <= rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300 fill-slate-100"
                              )} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea 
                      rows={4}
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Type admin console suggestions, feature requests, or feedback..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                    />
                    <div className="flex justify-end gap-3 pt-1">
                      <button 
                        type="button"
                        onClick={() => setIsFeedbackOpen(false)}
                        className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-[#0F172A] hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Stats Section - Uses same card style as Students/Teachers */}
          <StatsSection metrics={metrics} isLoading={isLoading} />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area (8 Columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Analytics Chart - Same card style as data tables */}
              <div className="bg-white p-4 sm:p-8 rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.2em]">Revenue Analytics</h3>
                  </div>
                  <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100 justify-center">
                    {['month', 'week'].map(r => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={cn(
                          "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", 
                          range === r ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-[#0F172A]"
                        )}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <AnalyticsChart data={revenueChartData} />
              </div>
            </div>

            {/* Right Panel (4 Columns) */}
            <div className="lg:col-span-4 h-full">
              <InsightsPanel />
            </div>
          </div>
        </div>
      )}
    </div>
    <AIChatBox />
    </>
  );
}

