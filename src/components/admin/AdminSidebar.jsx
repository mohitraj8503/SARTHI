"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminSidebar({ isOpen = false }) {
  const pathname = usePathname();
  const { adminProfile, adminStats } = useAdmin();
  const [expandedSection, setExpandedSection] = useState({
    users: false,
    content: false,
    finance: false,
    system: false,
  });
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div>
        {/* Brand Header */}
        <div className="admin-sidebar-brand">
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img src="/images/sarthi-logo.png" alt="SARTHI Logo" className="admin-brand-icon" />
            <div className="admin-brand-details">
              <span className="admin-brand-title">SARTHI</span>
              <span className="admin-brand-tag">ADMIN CONSOLE</span>
            </div>
          </Link>
        </div>

        {/* Quick Search Admin */}
        <div className="admin-sidebar-search">
          <svg className="admin-sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="admin-sidebar-search-input"
            placeholder="Quick search admin..."
          />
        </div>

        {/* SECTION 1: CORE CONTROL */}
        <div className="admin-sidebar-section">
          <div className="admin-section-heading">CORE CONTROL</div>
          <ul className="admin-nav-list">
            <li>
              <Link
                href="/admin"
                className={`admin-nav-item-btn ${pathname === "/admin" ? "active" : ""}`}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span>Overview</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/live"
                className={`admin-nav-item-btn ${pathname.startsWith("/admin/live") ? "active" : ""}`}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
                  <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M12 14v8" />
                </svg>
                <span>Live Operations</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/email"
                className={`admin-nav-item-btn ${pathname.startsWith("/admin/email") ? "active" : ""}`}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Email Portal</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* SECTION 2: MANAGEMENT */}
        <div className="admin-sidebar-section">
          <div className="admin-section-heading">MANAGEMENT</div>
          <ul className="admin-nav-list">
            {/* Users */}
            <li>
              <button
                type="button"
                className={`admin-nav-item-btn ${pathname.startsWith("/admin/users") ? "active" : ""}`}
                onClick={() => toggleSection("users")}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Users</span>
                <svg
                  className="admin-chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: expandedSection.users ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSection.users && (
                <ul className="admin-nav-submenu">
                  <li>
                    <Link href="/admin/users" className="admin-submenu-link">
                      Learners Directory ({adminStats.totalStudents})
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/users" className="admin-submenu-link">
                      Faculty & Instructors
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Content */}
            <li>
              <button
                type="button"
                className={`admin-nav-item-btn ${pathname.startsWith("/admin/courses") ? "active" : ""}`}
                onClick={() => toggleSection("content")}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>Content</span>
                <svg
                  className="admin-chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: expandedSection.content ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSection.content && (
                <ul className="admin-nav-submenu">
                  <li>
                    <Link href="/admin/courses" className="admin-submenu-link">
                      Course Catalog ({adminStats.publishedCourses})
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/courses" className="admin-submenu-link">
                      Approvals ({adminStats.pendingApprovals})
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Finance */}
            <li>
              <button
                type="button"
                className={`admin-nav-item-btn ${pathname.startsWith("/admin/finance") ? "active" : ""}`}
                onClick={() => toggleSection("finance")}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <span>Finance</span>
                <svg
                  className="admin-chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: expandedSection.finance ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSection.finance && (
                <ul className="admin-nav-submenu">
                  <li>
                    <Link href="/admin/finance" className="admin-submenu-link">
                      Budget & MoES Grants
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* System */}
            <li>
              <button
                type="button"
                className={`admin-nav-item-btn ${pathname.startsWith("/admin/settings") ? "active" : ""}`}
                onClick={() => toggleSection("system")}
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>System</span>
                <svg
                  className="admin-chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: expandedSection.system ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSection.system && (
                <ul className="admin-nav-submenu">
                  <li>
                    <Link href="/admin/settings" className="admin-submenu-link">
                      Audit Logs & Telemetry
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Support */}
            <li>
              <Link
                href="/admin/email"
                className="admin-nav-item-btn"
              >
                <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.999-3.199a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                <span>Support</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* FOOTER: Mukul Pandey ADMIN + Switch Role */}
      <div className="admin-sidebar-footer" style={{ position: "relative" }}>
        <div className="admin-user-pill">
          <img
            src={adminProfile.avatar || "/images/student-img-2.jpg"}
            alt={adminProfile.name}
            className="admin-user-avatar"
          />
          <div className="admin-user-details">
            <span className="admin-user-name">{adminProfile.name}</span>
            <span className="admin-user-role-badge">{adminProfile.role}</span>
          </div>

          <button
            type="button"
            className="admin-switch-icon-btn"
            title="Switch Dashboard Role"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Role Switcher Popover */}
        {showRoleSwitcher && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "10px",
              right: "10px",
              background: "#041f18",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              padding: "8px",
              zIndex: 60,
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", padding: "4px 8px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              SWITCH PORTAL VIEW
            </div>
            <Link
              href="/dashboard"
              onClick={() => setShowRoleSwitcher(false)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", textDecoration: "none", color: "#ffffff", fontSize: "12.5px", fontWeight: "600", borderRadius: "6px" }}
            >
              🎓 Student Mission Control
            </Link>
            <Link
              href="/trainer"
              onClick={() => setShowRoleSwitcher(false)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", textDecoration: "none", color: "#ffffff", fontSize: "12.5px", fontWeight: "600", borderRadius: "6px" }}
            >
              👨‍🏫 Trainer Command Center
            </Link>
            <Link
              href="/login"
              onClick={() => setShowRoleSwitcher(false)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", textDecoration: "none", color: "#ef4444", fontSize: "12.5px", fontWeight: "700", borderRadius: "6px", borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              🚪 Exit to Sign In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
