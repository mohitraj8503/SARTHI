"use client";

import React, { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminCoursesPage() {
  const { courses, setActiveModal } = useAdmin();
  const [tab, setTab] = useState("all"); // 'all' | 'published' | 'pending'

  const filteredCourses = courses.filter((c) => {
    if (tab === "published") return c.status === "PUBLISHED";
    if (tab === "pending") return c.status === "PENDING_APPROVAL";
    return true;
  });

  return (
    <AdminShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="admin-main-title" style={{ fontSize: "26px" }}>
            Course Catalog & Curriculum Approvals
          </h1>
          <p className="admin-main-subtitle">
            Review academic curricula submitted by IMD training divisions and manage national course access.
          </p>
        </div>

        <button
          type="button"
          className="btn-admin-orange"
          onClick={() => setActiveModal({ type: "new_course", data: null })}
        >
          + NEW COURSE
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`btn-admin-light-outline ${tab === "all" ? "btn-admin-dark-outline" : ""}`}
          style={{ padding: "6px 16px", fontSize: "12.5px" }}
        >
          All Curricula ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("published")}
          className={`btn-admin-light-outline ${tab === "published" ? "btn-admin-dark-outline" : ""}`}
          style={{ padding: "6px 16px", fontSize: "12.5px" }}
        >
          Published ({courses.filter((c) => c.status === "PUBLISHED").length})
        </button>
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={`btn-admin-light-outline ${tab === "pending" ? "btn-admin-dark-outline" : ""}`}
          style={{ padding: "6px 16px", fontSize: "12.5px" }}
        >
          Pending Sign-off ({courses.filter((c) => c.status === "PENDING_APPROVAL").length})
        </button>
      </div>

      <div className="admin-section-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Domain Category</th>
                <th>Lead Instructor</th>
                <th>Enrolled</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: "700", color: "var(--adm-text-main)" }}>{c.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>Added: {c.dateAdded}</div>
                  </td>
                  <td>{c.category}</td>
                  <td>{c.instructor}</td>
                  <td>{c.enrolled} Trainees</td>
                  <td>
                    <span className={`admin-status-pill ${c.status === "PUBLISHED" ? "status-published" : "status-pending"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === "PENDING_APPROVAL" ? (
                      <button
                        type="button"
                        className="btn-admin-orange"
                        style={{ padding: "4px 12px", fontSize: "11.5px" }}
                        onClick={() => setActiveModal({ type: "approve_course", data: c })}
                      >
                        Approve Now
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>✓ Live</span>
                    )}
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
