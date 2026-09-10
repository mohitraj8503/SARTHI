'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  FileSpreadsheet, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Layers, 
  Check, 
  ExternalLink
} from 'lucide-react';
import { useMentorTheme } from './MentorThemeContext';
import { toast } from 'react-hot-toast';

export default function AssignmentAutomationControlPanel() {
  const { isDark } = useMentorTheme();
  
  // Default date in YYYY-MM-DD format (Asia/Kolkata timezone context)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    // Default to 2026-09-07 or current date if later
    const dateStr = now.toISOString().split('T')[0];
    return dateStr < '2026-09-07' ? '2026-09-07' : dateStr;
  });

  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [loadingValidation, setLoadingValidation] = useState<boolean>(false);
  const [loadingRun, setLoadingRun] = useState<boolean>(false);
  const [loadingRetryRunId, setLoadingRetryRunId] = useState<string | null>(null);
  const [confirmRunModalOpen, setConfirmRunModalOpen] = useState<boolean>(false);

  // Fetch audit runs and run validation on date change
  const fetchRunsAndValidate = async (dateStr: string) => {
    setLoadingValidation(true);
    try {
      const res = await fetch(`/api/admin/assignment-automation?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setValidationResult(data.validation || null);
        setRecentRuns(data.recentRuns || []);
      } else {
        toast.error('Failed to load automation data');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error fetching automation data');
    } finally {
      setLoadingValidation(false);
    }
  };

  useEffect(() => {
    fetchRunsAndValidate(selectedDate);
  }, [selectedDate]);

  // Execute manual run
  const handleExecuteRun = async () => {
    setLoadingRun(true);
    try {
      const res = await fetch('/api/admin/assignment-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', date: selectedDate })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Automation executed for ${selectedDate}! ${data.run.createdCount} assignments created, ${data.run.emailSentCount} emails sent.`);
        setConfirmRunModalOpen(false);
        fetchRunsAndValidate(selectedDate);
      } else {
        toast.error(data.error || 'Failed to execute automation run');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error executing automation');
    } finally {
      setLoadingRun(false);
    }
  };

  // Retry failed emails
  const handleRetryEmails = async (runId: string) => {
    setLoadingRetryRunId(runId);
    try {
      const res = await fetch('/api/admin/assignment-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', runId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Retried emails: ${data.sent} sent, ${data.failed} failed.`);
        fetchRunsAndValidate(selectedDate);
      } else {
        toast.error(data.error || 'Retry failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error retrying failed emails');
    } finally {
      setLoadingRetryRunId(null);
    }
  };

  const isDarkBg = isDark ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const subCardBg = isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className={`p-6 rounded-[24px] border shadow-sm ${isDark ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-900/40' : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200'}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Daily Campaign Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">10:00 AM IST Cron</span>
            </div>
            <h2 className="text-2xl font-black font-outfit tracking-tight">
              Internship Assignment Automation
            </h2>
            <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Automated daily assignment generation from the 30-Day Campaign Calendar spreadsheet. Reads intern roles, constructs assignment tasks, attaches recipients, publishes to intern dashboards, and dispatches branded emails.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-600 ml-2" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold px-2 py-1 outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => fetchRunsAndValidate(selectedDate)}
              disabled={loadingValidation}
              className={`p-3 rounded-2xl border transition-all ${isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-slate-100'} shadow-sm`}
              title="Refresh validation data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingValidation ? 'animate-spin text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`} />
            </button>

            <button
              onClick={() => setConfirmRunModalOpen(true)}
              disabled={loadingRun || (validationResult && validationResult.validRows === 0)}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" /> Trigger Automation
            </button>
          </div>
        </div>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-[20px] border ${isDarkBg} shadow-sm`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spreadsheet Rows</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{validationResult ? validationResult.rowCount : '—'}</div>
            <div className="text-xs text-slate-500 mt-1">Actions scheduled for {selectedDate}</div>
          </div>
        </div>

        <div className={`p-5 rounded-[20px] border ${isDarkBg} shadow-sm`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valid Intern Rows</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {validationResult ? validationResult.validRows : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Ready for automated creation</div>
          </div>
        </div>

        <div className={`p-5 rounded-[20px] border ${isDarkBg} shadow-sm`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Intern Match</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {validationResult ? validationResult.internsResolved.length : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Mapped to active platform members</div>
          </div>
        </div>

        <div className={`p-5 rounded-[20px] border ${isDarkBg} shadow-sm`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Template</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
              <Check className="w-4 h-4" /> lib/email/templates/branded.ts
            </div>
            <div className="text-xs text-slate-500 mt-2">Branded HTML template verified</div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pre-Validation Action List (2 Columns Wide) */}
        <div className={`lg:col-span-2 p-6 rounded-[24px] border ${isDarkBg} shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Pre-Validation Action Plan for {selectedDate}
            </h3>
            {validationResult?.errors && validationResult.errors.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {validationResult.errors.length} Warning(s)
              </span>
            )}
          </div>

          {loadingValidation ? (
            <div className="py-12 text-center text-slate-500 animate-pulse">
              Validating Excel source and matching database records...
            </div>
          ) : validationResult?.internsResolved && validationResult.internsResolved.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {validationResult.internsResolved.map((item: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-2xl border ${subCardBg} transition-all hover:border-emerald-500/40`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.internName}
                        </span>
                        <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700">
                          {item.internId}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Day {item.day}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Task: {item.campaignTaskTitle}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>Role: <strong className="text-slate-700 dark:text-slate-300">{item.domainRole}</strong></span>
                        <span>• Email: {item.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(item.domainRole.toLowerCase().includes('software') || item.domainRole.toLowerCase().includes('web')) && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Markly Repo Attached
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Valid
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No daily intern actions scheduled for {selectedDate} in the Excel workbook.
            </div>
          )}
        </div>

        {/* Right Column: Recent Automation Audit Runs */}
        <div className={`p-6 rounded-[24px] border ${isDarkBg} shadow-sm space-y-4`}>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Execution Audit Log
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {recentRuns.length > 0 ? (
              recentRuns.map((run: any) => (
                <div key={run.id} className={`p-4 rounded-2xl border ${subCardBg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {run.dateISO}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      run.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      run.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {run.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>Created: <strong className="text-slate-900 dark:text-white">{run.createdCount}</strong></div>
                    <div>Emails Sent: <strong className="text-slate-900 dark:text-white">{run.emailSentCount}</strong></div>
                    <div>Skipped: <strong className="text-slate-900 dark:text-white">{run.skippedDuplicateCount}</strong></div>
                    <div>Failed: <strong className="text-red-600 dark:text-red-400">{run.failedCount}</strong></div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>By: {run.triggeredBy}</span>
                    {run.failedCount > 0 && (
                      <button
                        onClick={() => handleRetryEmails(run.id)}
                        disabled={loadingRetryRunId === run.id}
                        className="text-xs font-bold text-amber-600 hover:text-amber-500 underline flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingRetryRunId === run.id ? 'animate-spin' : ''}`} /> Retry Failed
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No past execution runs recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Manual Run */}
      {confirmRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl space-y-4`}>
            <div className="flex items-center gap-3 text-emerald-600">
              <Play className="w-6 h-6 fill-current" />
              <h3 className="text-xl font-bold font-outfit">Confirm Automation Execution</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You are about to trigger the daily assignment creation & transactional email workflow for date <strong className="text-slate-900 dark:text-white">{selectedDate}</strong>.
            </p>

            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
              <div>✓ Create {validationResult?.validRows || 0} assignment records in database</div>
              <div>✓ Map to {validationResult?.internsResolved?.length || 0} active interns</div>
              <div>✓ Attach Markly repository to Software & Web Dev tasks</div>
              <div>✓ Dispatch transactional emails using <code className="font-mono font-bold">branded.ts</code></div>
              <div>✓ Protected by strict idempotency key filtering</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmRunModalOpen(false)}
                disabled={loadingRun}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRun}
                disabled={loadingRun}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
              >
                {loadingRun ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Confirm & Run Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
