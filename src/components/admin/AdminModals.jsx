"use client";

import React, { useState } from "react";
import { useAdmin } from "@/lib/services/AdminContext";

export default function AdminModals() {
  const { activeModal, setActiveModal, addCourse, approveCourse, updateUserRole } = useAdmin();

  if (!activeModal) return null;

  const closeModal = () => setActiveModal(null);

  switch (activeModal.type) {
    case "new_course":
      return <NewCourseModal onClose={closeModal} onAdd={addCourse} />;
    case "approve_course":
      return <ApproveCourseModal course={activeModal.data} onClose={closeModal} onApprove={approveCourse} />;
    case "user_edit":
      return <UserEditModal user={activeModal.data} onClose={closeModal} onUpdate={updateUserRole} />;
    default:
      return null;
  }
}

// 1. NEW COURSE MODAL
function NewCourseModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Satellite Remote Sensing");
  const [instructor, setInstructor] = useState("Dr. R. K. Sharma (Scientist-F)");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, category, instructor });
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Publish New Course to Catalog</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Course Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cyclone Track Prediction & Early Warning"
                required
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Domain / Category:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-form-select">
                <option value="Satellite Remote Sensing">Satellite Remote Sensing</option>
                <option value="Atmospheric Modeling">Atmospheric Modeling</option>
                <option value="Radar Meteorology">Radar Meteorology</option>
                <option value="Climatology & Monsoon">Climatology & Monsoon</option>
                <option value="Aviation Meteorology">Aviation Meteorology</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Lead Instructor / Faculty:</label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
                className="admin-form-input"
              />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn-admin-light-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-admin-orange">Publish Course</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. APPROVE COURSE MODAL
function ApproveCourseModal({ course, onClose, onApprove }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Curriculum Approval Request</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="admin-modal-body">
          <div style={{ background: "var(--adm-surface-alt)", padding: "16px", borderRadius: "10px", border: "1px solid var(--adm-border)" }}>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "var(--adm-text-main)" }}>{course.title}</h4>
            <div style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>Submitted by: {course.instructor}</div>
            <div style={{ fontSize: "12px", color: "var(--adm-orange)", fontWeight: "700", marginTop: "4px" }}>
              Category: {course.category} &bull; Status: PENDING APPROVAL
            </div>
          </div>

          <p style={{ fontSize: "13.5px", color: "var(--adm-text-body)", lineHeight: 1.5, margin: 0 }}>
            This course curriculum has completed pedagogical review by the IMD Academic Council. Approving will publish the course to the SARTHI national learner catalog and notify 142 registered trainees.
          </p>
        </div>
        <div className="admin-modal-footer">
          <button type="button" className="btn-admin-light-outline" onClick={onClose}>Close</button>
          <button
            type="button"
            className="btn-admin-orange"
            onClick={() => {
              onApprove(course.id);
              onClose();
            }}
          >
            Approve & Publish to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. USER EDIT MODAL
function UserEditModal({ user, onClose, onUpdate }) {
  const [role, setRole] = useState(user.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(user.id, role);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Modify User Role & Access</h3>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--adm-surface-alt)", borderRadius: "8px" }}>
              <img src={user.avatar || "/images/student-img-1.jpg"} alt={user.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontWeight: "700", color: "var(--adm-text-main)", fontSize: "14px" }}>{user.name}</div>
                <div style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>{user.email} &bull; {user.division}</div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Platform Role Assignment:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="admin-form-select">
                <option value="TRAINEE">TRAINEE (Student Learner)</option>
                <option value="FACULTY">FACULTY (Trainer / Instructor)</option>
                <option value="ADMIN">ADMIN (Full Console Access)</option>
              </select>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn-admin-light-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-admin-orange">Save Role</button>
          </div>
        </form>
      </div>
    </div>
  );
}
