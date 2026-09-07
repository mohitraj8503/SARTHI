"use client";

import React, { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminEmailPortalPage() {
  const { emailLogs, sendBroadcastEmail } = useAdmin();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Learners (142)");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      sendBroadcastEmail({ subject, message, audience });
      setIsSending(false);
      setSentSuccess(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSentSuccess(false), 4000);
    }, 600);
  };

  return (
    <AdminShell>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="admin-main-title" style={{ fontSize: "26px" }}>
          Email Portal & Dispatcher
        </h1>
        <p className="admin-main-subtitle">
          Dispatch official announcements, circulars, and system notices to meteorological trainees and faculty cohorts.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* COMPOSE EMAIL NOTICE */}
        <div className="admin-section-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>✉️</span> Compose National Bulletin / Circular
            </h3>
          </div>

          {sentSuccess && (
            <div style={{ padding: "10px 14px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "8px", color: "#065f46", fontSize: "13px", fontWeight: "700", marginBottom: "14px" }}>
              ✓ Email circular dispatched successfully to {audience}!
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Recipient Group / Cohort:</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="admin-form-select">
                <option value="All Learners (142)">All Registered Learners (142 Trainees)</option>
                <option value="All Faculty (18)">All Faculty & Course Instructors (18 Members)</option>
                <option value="Entire Workforce (186)">Entire Platform Workforce (186 Users)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Subject / Circular Title:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Schedule for Monsoonal Severe Weather Simulation Exam"
                required
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Official Circular Content:</label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the official dispatch notes..."
                required
                className="admin-form-textarea"
              />
            </div>

            <button type="submit" className="btn-admin-orange" disabled={isSending}>
              {isSending ? "Dispatching..." : "Send Official Bulletin"}
            </button>
          </form>
        </div>

        {/* EMAIL DISPATCH LOGS */}
        <div className="admin-section-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>📋</span> Recent Email Dispatches & Delivery Logs
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {emailLogs.map((log) => (
              <div key={log.id} style={{ padding: "14px", background: "var(--adm-surface-alt)", borderRadius: "8px", border: "1px solid var(--adm-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "700", fontSize: "13.5px", color: "var(--adm-text-main)" }}>{log.subject}</div>
                  <span className="admin-status-pill status-active">{log.status}</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>
                  Recipients: {log.recipientsCount} &bull; Open Rate: {log.openRate} &bull; Sent: {log.sentAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
