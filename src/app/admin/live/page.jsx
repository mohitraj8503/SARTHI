"use client";

import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminLiveOperationsPage() {
  const { liveOps } = useAdmin();

  return (
    <AdminShell>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="admin-main-title" style={{ fontSize: "26px" }}>
          Live Operations & System Telemetry
        </h1>
        <p className="admin-main-subtitle">
          Real-time server concurrency, live video streaming rooms, and infrastructure health across regional centers.
        </p>
      </div>

      {/* Telemetry Dials Row */}
      <div className="admin-stats-grid" style={{ marginBottom: "28px" }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-green">⚡</div>
            <span className="admin-kpi-label">SERVER HEALTH</span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#10b981" }}>{liveOps.serverStatus}</div>
          <p className="admin-kpi-subtitle">
            <span>●</span> Uptime: {liveOps.uptime}
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-blue">👥</div>
            <span className="admin-kpi-label">LIVE CONCURRENCY</span>
          </div>
          <div className="admin-kpi-value">{liveOps.activeSessionsCount}</div>
          <p className="admin-kpi-subtitle kpi-sub-blue">
            <span>●</span> {liveOps.websocketConnected} WebSocket Links
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-orange">🖥️</div>
            <span className="admin-kpi-label">CPU & MEMORY</span>
          </div>
          <div className="admin-kpi-value" style={{ fontSize: "26px" }}>{liveOps.cpuUtilization}</div>
          <p className="admin-kpi-subtitle">
            {liveOps.memoryUsage}
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-green">📡</div>
            <span className="admin-kpi-label">DATABASE LATENCY</span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#059669" }}>{liveOps.databaseLatencyMs}</div>
          <p className="admin-kpi-subtitle kpi-sub-green">
            <span>●</span> Cache Hit: {liveOps.cacheHitRatio}
          </p>
        </div>
      </div>

      {/* Active Streaming Broadcasts */}
      <div className="admin-section-card" style={{ marginBottom: "24px" }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <span>🎥</span> Active Live Meteorological Broadcasts ({liveOps.activeRooms.length})
          </h3>
          <span className="admin-status-pill status-active">2 Rooms On-Air</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {liveOps.activeRooms.map((room) => (
            <div key={room.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--adm-surface-alt)", borderRadius: "10px", border: "1px solid var(--adm-border)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span>
                  <span style={{ fontWeight: "800", fontSize: "14px", color: "var(--adm-text-main)" }}>{room.topic}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>
                  Conducted by: <strong>{room.instructor}</strong> &bull; Duration: {room.duration}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--adm-text-main)" }}>
                  👥 {room.connectedLearners} Trainees
                </span>
                <span className="admin-status-pill status-active">
                  {room.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
