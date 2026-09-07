"use client";

import React from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminFinancePage() {
  const budgetAllocations = [
    { head: "HPC Modeling Cluster Workstations", allocated: "₹12,50,000", utilized: "₹11,20,000", balance: "₹1,30,000", status: "On Track" },
    { head: "Doppler Weather Radar License Pack", allocated: "₹6,80,000", utilized: "₹6,50,000", balance: "₹30,000", status: "On Track" },
    { head: "Satellite Data Processing Bandwidth", allocated: "₹3,50,000", utilized: "₹2,90,000", balance: "₹60,000", status: "On Track" },
    { head: "Trainee Certification & Examination Logistics", allocated: "₹2,00,000", utilized: "₹1,40,000", balance: "₹60,000", status: "Surplus" },
  ];

  return (
    <AdminShell>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="admin-main-title" style={{ fontSize: "26px" }}>
          Budget Allocations & MoES Grants
        </h1>
        <p className="admin-main-subtitle">
          Fiscal breakdown for national capacity building, HPC lab clusters, and meteorological learning licenses.
        </p>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: "28px" }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-orange">₹</div>
            <span className="admin-kpi-label">TOTAL APPROVED GRANT</span>
          </div>
          <div className="admin-kpi-value">₹24.8L</div>
          <p className="admin-kpi-subtitle">
            MoES FY 2025-26 Capacity Scheme
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-green">₹</div>
            <span className="admin-kpi-label">UTILIZED AMOUNT</span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#059669" }}>₹22.0L</div>
          <p className="admin-kpi-subtitle kpi-sub-green">
            88.7% Fiscal Burn Rate
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-blue">₹</div>
            <span className="admin-kpi-label">REMAINING BALANCE</span>
          </div>
          <div className="admin-kpi-value">₹2.8L</div>
          <p className="admin-kpi-subtitle kpi-sub-blue">
            Surplus for Q4 Assessments
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-pill kpi-icon-green">🛡️</div>
            <span className="admin-kpi-label">AUDIT STATUS</span>
          </div>
          <div className="admin-kpi-value" style={{ fontSize: "24px", color: "#10b981" }}>COMPLIANT</div>
          <p className="admin-kpi-subtitle">
            CAG Audit Cleared
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <span>🏛️</span> Expenditure Heads & Allocations
          </h3>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Budget Head</th>
                <th>Sanctioned Amount</th>
                <th>Utilized Expenditure</th>
                <th>Remaining Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {budgetAllocations.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "700", color: "var(--adm-text-main)" }}>{item.head}</td>
                  <td>{item.allocated}</td>
                  <td style={{ fontWeight: "700", color: "#059669" }}>{item.utilized}</td>
                  <td>{item.balance}</td>
                  <td>
                    <span className="admin-status-pill status-active">{item.status}</span>
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
