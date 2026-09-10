'use client';

import { useState } from 'react';
import { internshipFields } from '@/components/internship/InternshipApplicationForm';
import { isIilmUniversity } from '@/lib/utils/iilm';

interface TrackConfigClientProps {
  initialConfigs: any[];
  initialApplications?: any[];
}

export default function TrackConfigClient({
  initialConfigs,
  initialApplications = [],
}: TrackConfigClientProps) {
  const [activeTab, setActiveTab] = useState<'configs' | 'applications'>('configs');
  const [configs, setConfigs] = useState(initialConfigs);
  const [applications, setApplications] = useState(initialApplications);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Filters state
  const [filterField, setFilterField] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');

  // Modal State for Manual Override
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('paid');
  const [modalNote, setModalNote] = useState<string>('');
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleTogglePayment = async (trackSlug: string, currentRequired: boolean) => {
    const newRequired = !currentRequired;
    setSavingSlug(trackSlug);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/internship-config/${trackSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRequired: newRequired }),
      });

      const data = await res.json();
      if (res.ok && data.config) {
        setConfigs((prev) =>
          prev.map((c) => (c.trackSlug === trackSlug ? data.config : c))
        );
        setMessage(`Updated ${trackSlug}: Payment Required = ${newRequired}`);
      } else {
        alert(data.error || 'Failed to update config');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to update track config');
    } finally {
      setSavingSlug(null);
    }
  };

  const handleUpdatePrice = async (trackSlug: string, newPriceInr: number) => {
    setSavingSlug(trackSlug);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/internship-config/${trackSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentAmountInr: newPriceInr }),
      });

      const data = await res.json();
      if (res.ok && data.config) {
        setConfigs((prev) =>
          prev.map((c) => (c.trackSlug === trackSlug ? data.config : c))
        );
        setMessage(`Updated ${trackSlug}: Fee = ₹${newPriceInr}`);
      } else {
        alert(data.error || 'Failed to update price');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to update price');
    } finally {
      setSavingSlug(null);
    }
  };

  const openOverrideModal = (app: any) => {
    setSelectedApp(app);
    setModalStatus(app.paymentStatus || 'paid');
    setModalNote(app.paymentOverrideNote || '');
    setModalError(null);
  };

  const handleSaveManualOverride = async () => {
    if (!selectedApp) return;

    if (!modalNote || modalNote.trim().length < 10) {
      setModalError('Please enter a detailed audit note (minimum 10 characters).');
      return;
    }

    setUpdatingAppId(selectedApp.id);
    setModalError(null);

    try {
      const res = await fetch(
        `/api/admin/internship/applications/${selectedApp.id}/payment-status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus: modalStatus,
            note: modalNote.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.application) {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? data.application : a))
        );
        setMessage(
          `Manually updated payment status for ${selectedApp.name} to ${modalStatus}`
        );
        setSelectedApp(null);
      } else {
        setModalError(data.error || 'Failed to update payment status');
      }
    } catch (err: any) {
      console.error(err);
      setModalError('Network error updating payment status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('configs')}
          className={`pb-3 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'configs'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Track Pricing & Gating ({configs.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'applications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Applications & Payment Overrides ({applications.length})
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-4 rounded-xl">
          ✓ {message}
        </div>
      )}

      {/* TRACK CONFIGS TAB */}
      {activeTab === 'configs' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Track Slug</th>
                <th className="px-6 py-4">Payment Gating Status</th>
                <th className="px-6 py-4">Application Fee (INR ₹)</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {configs.map((config) => (
                <tr key={config.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wide">
                    {config.trackSlug}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePayment(config.trackSlug, config.paymentRequired)}
                      disabled={savingSlug === config.trackSlug}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                        config.paymentRequired
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-amber-100 text-amber-700 border border-amber-300'
                      }`}
                    >
                      {config.paymentRequired
                        ? 'Enabled (Paid Checkout)'
                        : 'Disabled (Free Auto-Accept)'}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    ₹{config.paymentAmountInr}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        const input = prompt(
                          `Enter new price in INR for ${config.trackSlug}:`,
                          String(config.paymentAmountInr)
                        );
                        if (input && !isNaN(Number(input))) {
                          handleUpdatePrice(config.trackSlug, Number(input));
                        }
                      }}
                      disabled={savingSlug === config.trackSlug}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Edit Price
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPLICATIONS OVERRIDE TAB */}
      {activeTab === 'applications' && (() => {
        const filteredApps = applications.filter((app) => {
          const fieldMatch = filterField === 'all' || app.preferredField === filterField;
          const trackMatch = filterTrack === 'all' || app.internshipTrack === filterTrack;
          return fieldMatch && trackMatch;
        });

        return (
          <div className="space-y-4">
            {/* Filters panel */}
            <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Filter by Preferred Field
                </label>
                <select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Fields</option>
                  {internshipFields.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Filter by Internship Track
                </label>
                <select
                  value={filterTrack}
                  onChange={(e) => setFilterTrack(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Tracks</option>
                  <option value="experienced">Experienced Track</option>
                  <option value="learning">Learning & Development Track</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Track Slug</th>
                    <th className="px-6 py-4">Preferred Field</th>
                    <th className="px-6 py-4">Internship Track</th>
                    <th className="px-6 py-4">Internship Fee</th>
                    <th className="px-6 py-4">Application Status</th>
                    <th className="px-6 py-4">Payment Status & Audit Source</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{app.name}</p>
                        <p className="text-[10px] text-slate-400">{app.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 uppercase">
                        {app.trackSlug || 'ai-development'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {app.preferredField || <span className="text-slate-400 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        {app.internshipTrack ? (
                          <>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase block w-fit ${
                                app.internshipTrack === 'experienced'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}
                            >
                              {app.internshipTrack === 'experienced' ? 'Experienced Track' : 'Learning Track'}
                            </span>
                            {app.internshipTrack === 'learning' && (
                              <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">
                                Learning Internship + Placement Support
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {app.internshipTrack === 'experienced'
                          ? '₹300'
                          : app.internshipTrack === 'learning'
                          ? '₹1,100'
                          : app.amountPaidInr
                          ? `₹${app.amountPaidInr}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {isIilmUniversity(app.college) ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            NOT APPLIED
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              app.status === 'accepted' || app.status === 'APPROVED' || app.status === 'OFFER_ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              app.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : app.paymentStatus === 'refunded'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : app.paymentStatus === 'failed'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {app.paymentStatus || 'unpaid'}
                          </span>

                          {app.paymentStatusSource === 'manual_admin' ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[9px] font-extrabold rounded" title={`Override note: ${app.paymentOverrideNote || 'N/A'}`}>
                              [Manually Edited] manually set by Admin
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              via Razorpay
                            </span>
                          )}
                        </div>
                        {app.paymentOverrideNote && (
                          <p className="text-[10px] text-slate-500 italic max-w-xs truncate">
                            Note: &ldquo;{app.paymentOverrideNote}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openOverrideModal(app)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          Edit Payment Status
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredApps.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No matching applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* EDIT PAYMENT STATUS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                Manual Payment Override
              </h3>
              <p className="text-xs text-slate-500">
                Applicant: <strong className="text-slate-800">{selectedApp.name}</strong> ({selectedApp.email})
              </p>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl">
                ⚠️ {modalError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                  New Payment Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="paid">paid (Auto-accepts application)</option>
                  <option value="unpaid">unpaid</option>
                  <option value="failed">failed</option>
                  <option value="refunded">refunded (Preserves app status)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                  Required Audit Note / Reason (Min 10 chars)
                </label>
                <textarea
                  rows={3}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="e.g. Paid via offline UPI screenshot, verified by admin"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualOverride}
                disabled={updatingAppId === selectedApp.id}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                {updatingAppId === selectedApp.id ? 'Saving Audit...' : 'Save Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
