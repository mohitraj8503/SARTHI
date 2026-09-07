"use client";

import React, { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminSettingsPage() {
  const { adminProfile } = useAdmin();
  const [saved, setSaved] = useState(false);

  const auditLogs = [
    { id: "log-1", action: "Course Published", details: "Doppler Weather Radar (DWR) & Severe Storms", admin: "Mukul Pandey", time: "2 hours ago" },
    { id: "log-2", action: "User Role Updated", details: "Deepak Choudhury marked for pending review", admin: "Mukul Pandey", time: "5 hours ago" },
    { id: "log-3", action: "Email Circular Sent", details: "Mandatory Pre-Monsoon Training Assessment Schedule", admin: "System Admin", time: "1 day ago" },
    { id: "log-4", action: "Database Backup Completed", details: "PostgreSQL automated snapshot taken (4.2GB)", admin: "Automated Daemon", time: "1 day ago" },
  ];

  return (
    <AdminShell>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="admin-main-title" style={{ fontSize: "26px" }}>
          System Configuration & Audit Logs
        </h1>
        <p className="admin-main-subtitle">
          Platform security protocols, Supabase database integration, and administrative audit trails.
        </p>
      </div>

      {saved && (
        <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "8px", color: "#065f46", fontSize: "13.5px", fontWeight: "700", marginBottom: "20px" }}>
          ✓ Platform settings updated successfully.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* PLATFORM PARAMETERS */}
        <div className="admin-section-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>⚙️</span> Core LMS Parameters
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Platform Portal Name:</label>
              <input type="text" defaultValue="SARTHI – Meteorological Capacity Building LMS" className="admin-form-input" />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Lead Administrator:</label>
              <input type="text" defaultValue={`${adminProfile.name} (${adminProfile.email})`} disabled className="admin-form-input" style={{ background: "var(--adm-surface-alt)" }} />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Security & Authentication Mode:</label>
              <select className="admin-form-select" defaultValue="SSO_GOV">
                <option value="SSO_GOV">MoES / IMD Gov SSO + Multi-Factor Auth (Active)</option>
                <option value="PASSWORD_ONLY">Password + Email Token</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Automatic Course Backup Frequency:</label>
              <select className="admin-form-select" defaultValue="DAILY">
                <option value="HOURLY">Every Hour</option>
                <option value="DAILY">Daily at 02:00 IST (Recommended)</option>
                <option value="WEEKLY">Weekly Snapshot</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-admin-orange"
              style={{ alignSelf: "flex-start", marginTop: "8px" }}
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* AUDIT TRAIL LOGS */}
        <div className="admin-section-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>📜</span> Administrative Audit Trail
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ padding: "12px 14px", background: "var(--adm-surface-alt)", borderRadius: "8px", border: "1px solid var(--adm-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "800", fontSize: "13px", color: "var(--adm-text-main)" }}>{log.action}</span>
                  <span style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>{log.time}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--adm-text-body)" }}>{log.details}</div>
                <div style={{ fontSize: "11px", color: "var(--adm-orange)", marginTop: "4px", fontWeight: "600" }}>
                  Executed by: {log.admin}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
