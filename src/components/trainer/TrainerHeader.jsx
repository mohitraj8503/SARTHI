"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTrainer } from "@/lib/services/TrainerContext";

export default function TrainerHeader({
  searchQuery = "",
  setSearchQuery = () => {},
  placeholder = "Search courses, trainees, submissions, or assessments...",
}) {
  const router = useRouter();
  const { trainer, courses, trainees, submissions, setActiveModal } = useTrainer();
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Sync internal query with prop during render (React recommended pattern)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setInternalQuery(searchQuery);
  }

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setInternalQuery(val);
    setSearchQuery(val);
    setIsSearchOpen(val.trim().length > 0);
  };

  // Search Results
  const searchResults = useMemo(() => {
    const q = (internalQuery || "").trim().toLowerCase();
    if (!q) return { courses: [], trainees: [], submissions: [], total: 0 };

    const matchedCourses = courses.filter((c) =>
      c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    const matchedTrainees = trainees.filter((t) =>
      t.name.toLowerCase().includes(q) || t.division.toLowerCase().includes(q)
    );

    const matchedSubmissions = submissions.filter((s) =>
      s.studentName.toLowerCase().includes(q) || s.assignmentTitle.toLowerCase().includes(q)
    );

    return {
      courses: matchedCourses.slice(0, 3),
      trainees: matchedTrainees.slice(0, 3),
      submissions: matchedSubmissions.slice(0, 3),
      total: matchedCourses.length + matchedTrainees.length + matchedSubmissions.length,
    };
  }, [internalQuery, courses, trainees, submissions]);

  const notifications = [
    {
      id: 1,
      title: "New Assignment Submission",
      desc: "Mohit Raj submitted INSAT-3DR Radiance Calibration report.",
      time: "15 mins ago",
      unread: true,
      link: "/trainer/assignments",
    },
    {
      id: 2,
      title: "Urgent Student Doubt Logged",
      desc: "Mohit Raj inquired about non-linear Planck lookup tables.",
      time: "45 mins ago",
      unread: true,
      link: "/trainer/messages",
    },
    {
      id: 3,
      title: "Certificate Approval Request",
      desc: "Priya Sharma completed NWP Modeling prerequisites with 98% score.",
      time: "2 hours ago",
      unread: false,
      link: "/trainer/certificates",
    },
  ];

  return (
    <header className="trainer-topbar">
      {/* Search Input Bar */}
      <div className="trainer-topbar-left" ref={searchContainerRef}>
        <div className="trainer-search-wrap">
          <svg className="trainer-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="trainer-search-input"
            placeholder={placeholder}
            value={internalQuery}
            onChange={handleQueryChange}
            onFocus={() => internalQuery.trim().length > 0 && setIsSearchOpen(true)}
          />

          {/* Search Dropdown Popover */}
          {isSearchOpen && searchResults.total > 0 && (
            <div style={{ position: "absolute", top: "48px", left: 0, right: 0, background: "#ffffff", border: "1px solid var(--tr-border)", borderRadius: "var(--tr-radius-md)", boxShadow: "var(--tr-shadow-lg)", padding: "12px", zIndex: 50 }}>
              {searchResults.courses.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--tr-text-muted)", textTransform: "uppercase", padding: "0 8px 4px 8px" }}>Courses</div>
                  {searchResults.courses.map((c) => (
                    <Link
                      key={c.id}
                      href="/trainer/courses"
                      onClick={() => setIsSearchOpen(false)}
                      style={{ display: "block", padding: "6px 8px", textDecoration: "none", color: "var(--tr-text-heading)", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}
                    >
                      📚 {c.title}
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.trainees.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--tr-text-muted)", textTransform: "uppercase", padding: "0 8px 4px 8px" }}>Trainees</div>
                  {searchResults.trainees.map((t) => (
                    <Link
                      key={t.id}
                      href="/trainer/students"
                      onClick={() => setIsSearchOpen(false)}
                      style={{ display: "block", padding: "6px 8px", textDecoration: "none", color: "var(--tr-text-heading)", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}
                    >
                      👤 {t.name} ({t.division})
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.submissions.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--tr-text-muted)", textTransform: "uppercase", padding: "0 8px 4px 8px" }}>Submissions</div>
                  {searchResults.submissions.map((s) => (
                    <Link
                      key={s.id}
                      href="/trainer/assignments"
                      onClick={() => setIsSearchOpen(false)}
                      style={{ display: "block", padding: "6px 8px", textDecoration: "none", color: "var(--tr-text-heading)", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}
                    >
                      📝 {s.studentName}: {s.assignmentTitle}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Topbar Right Tools */}
      <div className="trainer-topbar-right">
        {/* Role Badge */}
        <span className="trainer-role-badge-pill">
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669" }}></span>
          IMD Faculty Portal
        </span>

        {/* Quick Actions */}
        <button
          type="button"
          className="trainer-quick-btn trainer-btn-outline"
          onClick={() => setActiveModal({ type: "schedule_live", data: null })}
          title="Schedule Live Session"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          <span>Schedule Live</span>
        </button>

        <button
          type="button"
          className="trainer-quick-btn trainer-btn-green"
          onClick={() => setActiveModal({ type: "broadcast", data: null })}
          title="Broadcast Announcement"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Broadcast Notice</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="trainer-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            title="Faculty Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="trainer-notif-dot"></span>
          </button>

          {showNotifications && (
            <div style={{ position: "absolute", top: "50px", right: 0, width: "320px", background: "#ffffff", border: "1px solid var(--tr-border)", borderRadius: "var(--tr-radius-md)", boxShadow: "var(--tr-shadow-xl)", padding: "12px", zIndex: 50 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid var(--tr-border)", marginBottom: "8px" }}>
                <span style={{ fontWeight: "800", fontSize: "13px", color: "var(--tr-text-heading)" }}>Faculty Notifications</span>
                <span style={{ fontSize: "11px", color: "var(--tr-accent-teal)", cursor: "pointer", fontWeight: "700" }}>Mark read</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setShowNotifications(false)}
                    style={{ textDecoration: "none", padding: "8px 10px", borderRadius: "8px", background: n.unread ? "var(--tr-primary-light)" : "transparent", display: "block" }}
                  >
                    <div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--tr-text-heading)" }}>{n.title}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--tr-text-muted)", marginTop: "2px" }}>{n.desc}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--tr-text-light)", marginTop: "3px" }}>{n.time}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trainer Profile Avatar & Dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "4px 8px", borderRadius: "999px", background: "var(--tr-surface-alt)" }}
          >
            <img src={trainer.avatar || "/images/student-img-1.jpg"} alt={trainer.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--tr-text-heading)" }}>{trainer.name.split(" ")[0]}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          {showUserMenu && (
            <div style={{ position: "absolute", top: "48px", right: 0, width: "220px", background: "#ffffff", border: "1px solid var(--tr-border)", borderRadius: "var(--tr-radius-md)", boxShadow: "var(--tr-shadow-xl)", padding: "10px", zIndex: 50 }}>
              <div style={{ padding: "6px 10px", borderBottom: "1px solid var(--tr-border)", marginBottom: "6px" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--tr-text-heading)" }}>{trainer.name}</div>
                <div style={{ fontSize: "11px", color: "var(--tr-text-muted)" }}>{trainer.title}</div>
              </div>
              <Link href="/trainer/settings" onClick={() => setShowUserMenu(false)} style={{ display: "block", padding: "6px 10px", textDecoration: "none", color: "var(--tr-text-heading)", fontSize: "13px", borderRadius: "6px" }}>
                Faculty Settings
              </Link>
              <Link href="/dashboard" onClick={() => setShowUserMenu(false)} style={{ display: "block", padding: "6px 10px", textDecoration: "none", color: "#059669", fontSize: "13px", fontWeight: "700", borderRadius: "6px" }}>
                Switch to Student View &rarr;
              </Link>
              <Link href="/admin" onClick={() => setShowUserMenu(false)} style={{ display: "block", padding: "6px 10px", textDecoration: "none", color: "#ea580c", fontSize: "13px", fontWeight: "700", borderRadius: "6px" }}>
                👑 Admin Console &rarr;
              </Link>
              <button
                onClick={() => router.push("/login")}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "6px 10px", color: "#dc2626", fontSize: "13px", cursor: "pointer", borderTop: "1px solid var(--tr-border)", marginTop: "6px" }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
