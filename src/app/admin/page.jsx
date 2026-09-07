"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminOverviewPage() {
  const {
    adminStats,
    revenueData,
    chartTimeframe,
    setChartTimeframe,
    insights,
    users,
    courses,
    liveOps,
    setActiveModal,
  } = useAdmin();

  const [activeInsightTab, setActiveInsightTab] = useState("alerts"); // 'alerts' | 'growth'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activePoints = chartTimeframe === "week" ? revenueData.week : revenueData.month;
  const pendingCourses = courses.filter((c) => c.status === "PENDING_APPROVAL");

  // SVG Area Chart Calculations
  // Chart width 600, height 200, padding left 60, right 20, top 20, bottom 30
  const chartW = 580;
  const chartH = 190;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const maxVal = chartTimeframe === "week" ? 60000 : 500000;

  const points = activePoints.map((pt, idx) => {
    const x = padL + (idx / (activePoints.length - 1)) * (chartW - padL - padR);
    const y = padT + (1 - pt.revenue / maxVal) * (chartH - padT - padB);
    return { ...pt, x, y };
  });

  // Generate smooth SVG path using Catmull-Rom or cubic Bezier
  const pathData = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaData = `${pathData} L ${points[points.length - 1].x} ${chartH - padB} L ${points[0].x} ${chartH - padB} Z`;

  return (
    <AdminShell>
      {/* 1. 4 KPI CARDS ROW */}
      <section className="admin-stats-grid">
        {/* TOTAL REVENUE */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-orange">₹</div>
            <span className="admin-kpi-label">TOTAL REVENUE</span>
          </div>
          <div className="admin-kpi-value">{adminStats.revenueFormatted}</div>
          <p className="admin-kpi-subtitle">
            <span style={{ color: "#d97706" }}>●</span> {adminStats.revenueGrowth}
          </p>
        </div>

        {/* TOTAL STUDENTS */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="admin-kpi-label">TOTAL STUDENTS</span>
          </div>
          <div className="admin-kpi-value">{adminStats.totalStudents}</div>
          <p className="admin-kpi-subtitle kpi-sub-green">
            <span>●</span> 142 Registered Learners
          </p>
        </div>

        {/* PUBLISHED COURSES */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-blue">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="admin-kpi-label">PUBLISHED COURSES</span>
          </div>
          <div className="admin-kpi-value">{adminStats.publishedCourses}</div>
          <p className="admin-kpi-subtitle kpi-sub-blue">
            <span>●</span> Course Catalog
          </p>
        </div>

        {/* PENDING APPROVALS */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-red">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="admin-kpi-label">PENDING APPROVALS</span>
          </div>
          <div className="admin-kpi-value">{adminStats.pendingApprovals}</div>
          <div>
            <span className="kpi-sub-red">{adminStats.approvalsSubtitle}</span>
          </div>
        </div>
      </section>

      {/* 2. TWO-COLUMN ANALYTICS & INSIGHTS GRID */}
      <section className="admin-analytics-grid">
        {/* Left: REVENUE ANALYTICS AREA CHART */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h2 className="admin-chart-title">
              <span className="admin-orange-dot"></span>
              <span>REVENUE ANALYTICS</span>
            </h2>

            {/* Segmented Filter (MONTH / WEEK) */}
            <div className="admin-time-segment">
              <button
                type="button"
                className={`admin-segment-btn ${chartTimeframe === "month" ? "active" : ""}`}
                onClick={() => setChartTimeframe("month")}
              >
                MONTH
              </button>
              <button
                type="button"
                className={`admin-segment-btn ${chartTimeframe === "week" ? "active" : ""}`}
                onClick={() => setChartTimeframe("week")}
              >
                WEEK
              </button>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="admin-svg-chart-container">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="admin-svg-chart" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines and Y-axis labels */}
              {[
                { label: chartTimeframe === "week" ? "₹60.0k" : "₹500k", frac: 0 },
                { label: chartTimeframe === "week" ? "₹45.0k" : "₹375k", frac: 0.25 },
                { label: chartTimeframe === "week" ? "₹30.0k" : "₹250k", frac: 0.5 },
                { label: chartTimeframe === "week" ? "₹15.0k" : "₹125k", frac: 0.75 },
                { label: "₹0", frac: 1 },
              ].map((grid, gIdx) => {
                const yPos = padT + grid.frac * (chartH - padT - padB);
                return (
                  <g key={gIdx}>
                    <text
                      x={padL - 10}
                      y={yPos + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {grid.label}
                    </text>
                    <line
                      x1={padL}
                      y1={yPos}
                      x2={chartW - padR}
                      y2={yPos}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Gradient Area Fill */}
              <path d={areaData} fill="url(#adminOrangeGrad)" />

              {/* Glowing Curve Line */}
              <path
                d={pathData}
                fill="none"
                stroke="#ea580c"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points and X-Axis Labels */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  {/* X Axis Label */}
                  <text
                    x={pt.x}
                    y={chartH - 8}
                    fill="#64748b"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {pt.day}
                  </text>

                  {/* Dot point */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === idx ? 6 : 4}
                    fill="#ffffff"
                    stroke="#ea580c"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Hover Tooltip Pill */}
                  {hoveredPoint === idx && (
                    <g>
                      <rect
                        x={pt.x - 45}
                        y={pt.y - 34}
                        width="90"
                        height="24"
                        rx="4"
                        fill="#0f172a"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 18}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        ₹{pt.revenue.toLocaleString()}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: ADMIN INSIGHTS PANEL */}
        <div className="admin-insights-card">
          <div className="admin-insights-header">
            <div className="admin-insights-icon-box">⚡</div>
            <div className="admin-insights-title-block">
              <h3 className="admin-insights-title">Admin Insights</h3>
              <span className="admin-live-tag">
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }}></span>
                LIVE ANALYSIS
              </span>
            </div>
          </div>

          {/* Subtabs: Alerts (4) / Growth (3) */}
          <div className="admin-insights-tabs">
            <button
              type="button"
              className={`admin-insight-tab-btn ${activeInsightTab === "alerts" ? "active" : ""}`}
              onClick={() => setActiveInsightTab("alerts")}
            >
              <span>⚡ Alerts ({insights.alerts.length})</span>
            </button>
            <button
              type="button"
              className={`admin-insight-tab-btn ${activeInsightTab === "growth" ? "active" : ""}`}
              onClick={() => setActiveInsightTab("growth")}
            >
              <span>📈 Growth ({insights.growth.length})</span>
            </button>
          </div>

          {/* Insight Cards List */}
          <div className="admin-insights-list">
            {(activeInsightTab === "alerts" ? insights.alerts.slice(0, 2) : insights.growth.slice(0, 2)).map((item) => (
              <div key={item.id} className="admin-insight-item">
                <div className="admin-insight-item-header">
                  <div className="admin-insight-item-left">
                    <span className="admin-insight-symbol">
                      {activeInsightTab === "alerts" ? "↗" : "✦"}
                    </span>
                    <span className="admin-insight-name">{item.title}</span>
                  </div>
                  <span className={item.badgeType === "high" ? "admin-badge-high" : item.badgeType === "med" ? "admin-badge-med" : "admin-badge-growth"}>
                    {item.badge}
                  </span>
                </div>

                <p className="admin-insight-desc">{item.description}</p>

                <div className="admin-insight-metric-tag">
                  <span style={{ color: "var(--adm-text-muted)", fontWeight: "600" }}>{item.metricLabel}: </span>
                  <span style={{ color: "var(--adm-orange)" }}>{item.metricValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OPERATIONAL SECTIONS BELOW THE FOLD */}
      <section className="admin-operations-grid">
        {/* PENDING APPROVAL QUEUE */}
        <div className="admin-section-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>🛡️</span> Course & Curriculum Approvals ({pendingCourses.length})
            </h3>
            <Link href="/admin/courses" style={{ fontSize: "12.5px", color: "var(--adm-orange)", fontWeight: "700", textDecoration: "none" }}>
              View Catalog &rarr;
            </Link>
          </div>

          {pendingCourses.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--adm-text-muted)" }}>
              All submitted curricula have been reviewed and approved.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingCourses.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--adm-surface-alt)", borderRadius: "10px", border: "1px solid var(--adm-border)" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--adm-text-main)" }}>{c.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>Instructor: {c.instructor} &bull; {c.category}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-admin-orange"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => setActiveModal({ type: "approve_course", data: c })}
                  >
                    Review & Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SYSTEM & LIVE OPERATIONS TELEMETRY */}
        <div className="admin-section-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>🖥️</span> Platform Telemetry & Live Concurrency
            </h3>
            <span className="admin-status-pill status-active">
              ● {liveOps.serverStatus}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", background: "var(--adm-surface-alt)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--adm-text-muted)", textTransform: "uppercase" }}>Active WebSocket Sessions</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--adm-text-main)", marginTop: "4px" }}>{liveOps.websocketConnected}</div>
            </div>

            <div style={{ padding: "12px", background: "var(--adm-surface-alt)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--adm-text-muted)", textTransform: "uppercase" }}>Database Latency</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>{liveOps.databaseLatencyMs}</div>
            </div>

            <div style={{ padding: "12px", background: "var(--adm-surface-alt)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--adm-text-muted)", textTransform: "uppercase" }}>Server Uptime</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--adm-text-main)", marginTop: "4px" }}>{liveOps.uptime}</div>
            </div>

            <div style={{ padding: "12px", background: "var(--adm-surface-alt)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--adm-text-muted)", textTransform: "uppercase" }}>Cache Hit Ratio</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#3b82f6", marginTop: "4px" }}>{liveOps.cacheHitRatio}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT USERS DIRECTORY PREVIEW */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <span>👥</span> Registered Learners & Faculty Directory
          </h3>
          <Link href="/admin/users" style={{ fontSize: "12.5px", color: "var(--adm-orange)", fontWeight: "700", textDecoration: "none" }}>
            Manage All 142 Users &rarr;
          </Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User / Officer</th>
                <th>Platform Role</th>
                <th>IMD Center / Division</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={u.avatar} alt={u.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--adm-text-main)" }}>{u.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "800", fontSize: "11.5px", color: u.role === "ADMIN" ? "var(--adm-orange)" : u.role === "FACULTY" ? "#059669" : "#2563eb" }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.division}</td>
                  <td>
                    <span className={`admin-status-pill ${u.status === "ACTIVE" ? "status-active" : "status-pending"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>{u.lastLogin}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-admin-light-outline"
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                      onClick={() => setActiveModal({ type: "user_edit", data: u })}
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
