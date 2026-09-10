'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Users,
  FileText,
  CreditCard,
  CheckCircle,
  Download,
  Loader2,
  Database,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import Papa from 'papaparse';

export default function BulkActionsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'finance'>('users');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // CSV State
  const [csvData, setCsvData] = useState<any[]>([]);

  // Bulk Action State
  const [selectedAction, setSelectedAction] = useState('');
  const [targetIds, setTargetIds] = useState(''); // Text area for IDs for now, ideally a selector
  const [actionParams, setActionParams] = useState<any>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCsvData(results.data);
          addLog(`Parsed ${results.data.length} rows from ${file.name}`, 'info');
        },
        error: (error) => {
          addLog(`Failed to parse CSV: ${error.message}`, 'error');
        },
      });
    }
  };

  const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setLogs((prev) => [{ message, type, timestamp: new Date() }, ...prev]);
  };

  const getTemplate = () => {
    const headers = ['email', 'name', 'role', 'password'];
    const csvContent = headers.join(',') + '\nstudent@example.com,John Doe,STUDENT,Password123!';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const executeCsvImport = async () => {
    if (csvData.length === 0) return;

    setLoading(true);
    try {
      addLog(`Starting import for ${csvData.length} users...`, 'info');

      const res = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: csvData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addLog(
        `Import complete: ${data.created} created, ${data.failed} failed`,
        (data.failed > 0 ? 'error' : 'success') as 'success' | 'error' | 'info'
      );
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err: any) => addLog(`Error: ${err.email} - ${err.error}`, 'error'));
      }
    } catch (error: any) {
      addLog(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeBulkAction = async () => {
    if (!selectedAction || (!targetIds && selectedAction !== 'enroll_all')) {
      addLog('Please select an action and provide target IDs', 'error');
      return;
    }

    setLoading(true);
    try {
      const idsArray = targetIds
        .split(/[\n,]+/)
        .map((id) => id.trim())
        .filter(Boolean);
      addLog(`Executing ${selectedAction} on ${idsArray.length} items...`, 'info');

      let entity = 'students';
      if (activeTab === 'content') entity = 'courses';
      if (activeTab === 'finance') entity = 'finance';

      const res = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: entity,
          ids: idsArray,
          action: selectedAction,
          params: actionParams,
          dryRun: false, // TODO: Implement UI toggle for dry run mode to preview changes before applying
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      addLog(`Success: affected ${result.updated} items`, 'success');
    } catch (error: any) {
      addLog(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bulk Operations Center</h1>
          <p className="text-slate-400 text-sm mt-1">Manage large-scale data updates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700 pb-1">
        {[
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'content', label: 'Content Management', icon: BookOpen },
          { id: 'finance', label: 'Financial Ops', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* CSV Import Card */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#1e293b] border border-slate-700 shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  Bulk User Import
                </h3>
                <button
                  onClick={getTemplate}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-400 transition"
                >
                  <Download className="w-3 h-3" />
                  Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-600 transition-colors bg-slate-900/50">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                      Upload CSV
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">max 5MB</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/50 rounded-xl p-4 h-full border border-slate-700/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Payload Preview
                    </h4>
                    {csvData.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-300">
                          <span>Rows found:</span>
                          <span className="font-mono text-emerald-400">{csvData.length}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-300">
                          <span>Keys:</span>
                          <span className="font-mono text-slate-500">
                            {Object.keys(csvData[0]).join(', ')}
                          </span>
                        </div>
                        <button
                          onClick={executeCsvImport}
                          disabled={loading}
                          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Database className="w-4 h-4" />
                          )}
                          Import Users
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No file loaded yet...</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generic Bulk Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-[#1e293b] border border-slate-700 shadow-xl"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-400" />
              {activeTab === 'users'
                ? 'Mass Enroll / Updates'
                : activeTab === 'content'
                ? 'Content Operations'
                : 'Financial Batch Ops'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Operation</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setSelectedAction(e.target.value)}
                    value={selectedAction}
                  >
                    <option value="">Select Action...</option>
                    {activeTab === 'users' && (
                      <>
                        <option value="enroll_in_course">Enroll In Course</option>
                        <option value="extend_deadline">Extend Deadline</option>
                        <option value="issue_certificate">Issue Certificate</option>
                      </>
                    )}
                    {activeTab === 'content' && (
                      <>
                        <option value="publish_courses">Bulk Publish Courses</option>
                        <option value="unpublish_courses">Bulk Unpublish</option>
                      </>
                    )}
                    {activeTab === 'finance' && (
                      <>
                        <option value="generate_coupons">Generate Coupons</option>
                      </>
                    )}
                  </select>
                </div>

                {/* DYNAMIC INPUTS */}
                {selectedAction === 'enroll_in_course' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase">Course ID</label>
                    <input
                      type="text"
                      placeholder="Enter Course ID"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200"
                      onChange={(e) =>
                        setActionParams({ ...actionParams, courseId: e.target.value })
                      }
                    />
                  </div>
                )}
                {selectedAction === 'extend_deadline' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase">Days</label>
                    <input
                      type="number"
                      placeholder="7"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200"
                      onChange={(e) =>
                        setActionParams({ ...actionParams, days: parseInt(e.target.value) })
                      }
                    />
                  </div>
                )}
                {selectedAction === 'generate_coupons' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase">Discount %</label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200"
                      onChange={(e) =>
                        setActionParams({ ...actionParams, discount: parseInt(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase">
                  Target User IDs (Comma or Newline separated)
                </label>
                <textarea
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 custom-scrollbar"
                  placeholder="clq...123, clq...456"
                  onChange={(e) => setTargetIds(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={executeBulkAction}
                  disabled={loading || !selectedAction}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Execute Batch Operation
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Logs */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 min-h-[500px] flex flex-col">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Operation Logs
              </h3>

              <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 custom-scrollbar pr-2">
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={`text-xs p-3 rounded border font-mono ${
                        log.type === 'error'
                          ? 'bg-rose-900/20 border-rose-900/50 text-rose-400'
                          : log.type === 'success'
                          ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400'
                          : log.type === 'warning'
                          ? 'bg-amber-900/20 border-amber-900/50 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="opacity-50 text-[10px] mb-1">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                      <div>{log.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-600 text-xs py-10 italic">
                    Ready for operations...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

