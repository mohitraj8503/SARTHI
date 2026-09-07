"use client";

import React, { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminUsersPage() {
  const { users, updateUserStatus, setActiveModal } = useAdmin();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.division.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <AdminShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="admin-main-title" style={{ fontSize: "26px" }}>
            User & Role Management Console
          </h1>
          <p className="admin-main-subtitle">
            Manage 142 registered learners, specialized meteorological instructors, and administrative roles.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search by name, email, center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-form-input"
            style={{ width: "240px", height: "38px" }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-form-select"
            style={{ width: "140px", height: "38px" }}
          >
            <option value="ALL">All Roles</option>
            <option value="TRAINEE">Trainees</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Learner / Officer</th>
                <th>Assigned Role</th>
                <th>IMD Center / Division</th>
                <th>Enrolled Courses</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={u.avatar} alt={u.name} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} />
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
                  <td>{u.enrolledCourses} Courses</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => updateUserStatus(u.id, u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}
                      className={`admin-status-pill ${u.status === "ACTIVE" ? "status-active" : "status-pending"}`}
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td>
                    <span style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>{u.lastLogin}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-admin-light-outline"
                      style={{ padding: "4px 12px", fontSize: "11.5px" }}
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
