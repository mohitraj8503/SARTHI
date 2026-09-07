"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminHeader() {
  const { setActiveModal, exportReport } = useAdmin();
  const [isExporting, setIsExporting] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    const result = await exportReport(format);
    setIsExporting(false);
    alert(`Report generated successfully: ${result.filename}`);
  };

  return (
    <header className="admin-header-row">
      <div className="admin-header-left">
        <div className="admin-control-tag">
          <span className="admin-control-bar"></span>
          <span>ADMIN CONTROL</span>
        </div>
        <h1 className="admin-main-title">
          Welcome back, <span className="admin-title-highlight">Administrator</span>
        </h1>
        <p className="admin-main-subtitle">
          Real-time platform telemetry, user management, and operational growth analytics.
        </p>
      </div>

      <div className="admin-header-actions">
        {/* Role Switcher Pill */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="btn-admin-light-outline"
            style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "999px" }}
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
            <span>Switch Role ▾</span>
          </button>

          {showRoleSwitcher && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: 0,
                width: "210px",
                background: "#ffffff",
                border: "1px solid var(--adm-border)",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                padding: "8px",
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--adm-text-muted)", padding: "4px 8px 6px" }}>
                SELECT ACTIVE PORTAL
              </div>
              <Link
                href="/dashboard"
                onClick={() => setShowRoleSwitcher(false)}
                style={{ display: "block", padding: "8px 10px", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", color: "var(--adm-text-main)", borderRadius: "6px" }}
              >
                🎓 Student Mission Control
              </Link>
              <Link
                href="/trainer"
                onClick={() => setShowRoleSwitcher(false)}
                style={{ display: "block", padding: "8px 10px", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", color: "var(--adm-text-main)", borderRadius: "6px" }}
              >
                👨‍🏫 Trainer Command Center
              </Link>
              <Link
                href="/admin"
                onClick={() => setShowRoleSwitcher(false)}
                style={{ display: "block", padding: "8px 10px", fontSize: "12.5px", fontWeight: "700", textDecoration: "none", color: "var(--adm-orange)", borderRadius: "6px", background: "var(--adm-orange-light)" }}
              >
                👑 Admin Console (Current)
              </Link>
            </div>
          )}
        </div>

        {/* + NEW COURSE */}
        <button
          type="button"
          className="btn-admin-orange"
          onClick={() => setActiveModal({ type: "new_course", data: null })}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>NEW COURSE</span>
        </button>

        {/* EXPORT PDF */}
        <button
          type="button"
          className="btn-admin-dark-outline"
          onClick={() => handleExport("PDF")}
          disabled={isExporting}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>EXPORT PDF</span>
        </button>

        {/* EXPORT CSV */}
        <button
          type="button"
          className="btn-admin-light-outline"
          onClick={() => handleExport("CSV")}
          disabled={isExporting}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>EXPORT CSV</span>
        </button>
      </div>
    </header>
  );
}
