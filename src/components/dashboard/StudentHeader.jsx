"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudent } from "@/lib/services/StudentContext";

export default function StudentHeader({
  searchQuery = "",
  setSearchQuery = () => {},
  placeholder = "Search courses, topics, classes, or assignments...",
}) {
  const router = useRouter();
  const { student, courses, assignments, liveClasses } = useStudent();
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

  // Global Keyboard Shortcuts (⌘K or / to focus search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Debounced search logic
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setInternalQuery(val);
    setSearchQuery(val);
    setIsSearchOpen(val.trim().length > 0);
  };

  // Search Results across Courses, Assignments, and Live Classes
  const searchResults = useMemo(() => {
    const q = (internalQuery || "").trim().toLowerCase();
    if (!q) return { courses: [], assignments: [], classes: [], total: 0 };

    const matchedCourses = courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.instructor?.name?.toLowerCase().includes(q)
    );

    const matchedAssignments = assignments.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.course?.toLowerCase().includes(q)
    );

    const matchedClasses = liveClasses.filter(
      (l) =>
        l.topic?.toLowerCase().includes(q) ||
        l.course?.toLowerCase().includes(q) ||
        l.instructor?.toLowerCase().includes(q)
    );

    return {
      courses: matchedCourses.slice(0, 3),
      assignments: matchedAssignments.slice(0, 3),
      classes: matchedClasses.slice(0, 3),
      total: matchedCourses.length + matchedAssignments.length + matchedClasses.length,
    };
  }, [internalQuery, courses, assignments, liveClasses]);

  const notifications = [
    {
      id: 1,
      title: "New Assignment Published",
      desc: "INSAT-3D & 3DR Radiance Analysis is due in 6 days.",
      time: "10 mins ago",
      unread: true,
      link: "/dashboard/assignments",
    },
    {
      id: 2,
      title: "Live Class Scheduled",
      desc: "Satellite Imagery Live Analysis starts March 10 at 10:00 AM.",
      time: "2 hours ago",
      unread: true,
      link: "/dashboard/live",
    },
    {
      id: 3,
      title: "Grade Released",
      desc: "NWP Boundary Layer Parameterization score: 95/100 XP.",
      time: "1 day ago",
      unread: false,
      link: "/dashboard/assignments",
    },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="db-topbar">
      {/* Live Search Input Bar */}
      <div className="db-search-bar-wrap" ref={searchContainerRef}>
        <div className="db-search-bar">
          <svg
            className="db-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="db-search-input"
            placeholder={placeholder}
            value={internalQuery}
            onChange={handleQueryChange}
            onFocus={() => {
              if (internalQuery.trim().length > 0) setIsSearchOpen(true);
            }}
          />
          {internalQuery ? (
            <button
              onClick={() => {
                setInternalQuery("");
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="db-search-shortcut">⌘ K</span>
          )}
        </div>

        {/* Live Search Results Floating Card */}
        {isSearchOpen && (
          <div className="db-search-dropdown">
            {searchResults.total === 0 ? (
              <div className="db-search-empty">
                <p className="db-search-empty-title">No results found for &ldquo;{internalQuery}&rdquo;</p>
                <p className="db-search-empty-sub">
                  Try searching for &ldquo;Satellite&rdquo;, &ldquo;NWP&rdquo;, &ldquo;Radar&rdquo;, or &ldquo;Monsoon&rdquo;.
                </p>
              </div>
            ) : (
              <div className="db-search-results-list">
                {/* Courses Group */}
                {searchResults.courses.length > 0 && (
                  <div className="db-search-group">
                    <span className="db-search-group-title">Courses</span>
                    {searchResults.courses.map((c) => (
                      <Link
                        key={c.id}
                        href="/dashboard/courses"
                        onClick={() => setIsSearchOpen(false)}
                        className="db-search-item"
                      >
                        <div className="db-search-item-dot green" />
                        <div className="db-search-item-info">
                          <span className="db-search-item-title">{c.title}</span>
                          <span className="db-search-item-meta">{c.instructor?.name} • {c.progress}% complete</span>
                        </div>
                        <span className="db-search-item-badge">{c.category}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Assignments Group */}
                {searchResults.assignments.length > 0 && (
                  <div className="db-search-group">
                    <span className="db-search-group-title">Assignments</span>
                    {searchResults.assignments.map((a) => (
                      <Link
                        key={a.id}
                        href="/dashboard/assignments"
                        onClick={() => setIsSearchOpen(false)}
                        className="db-search-item"
                      >
                        <div className="db-search-item-dot amber" />
                        <div className="db-search-item-info">
                          <span className="db-search-item-title">{a.title}</span>
                          <span className="db-search-item-meta">Due {a.dueDate} • {a.course}</span>
                        </div>
                        <span className="db-search-item-badge status">{a.status}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Live Classes Group */}
                {searchResults.classes.length > 0 && (
                  <div className="db-search-group">
                    <span className="db-search-group-title">Live Classes</span>
                    {searchResults.classes.map((l) => (
                      <Link
                        key={l.id}
                        href="/dashboard/live"
                        onClick={() => setIsSearchOpen(false)}
                        className="db-search-item"
                      >
                        <div className="db-search-item-dot red" />
                        <div className="db-search-item-info">
                          <span className="db-search-item-title">{l.topic}</span>
                          <span className="db-search-item-meta">{l.date} at {l.time} • {l.instructor}</span>
                        </div>
                        <span className="db-search-item-badge live">Live Session</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topbar Right Actions: Notification + User Profile Chip */}
      <div className="db-topbar-actions">
        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="db-notification-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="db-notification-dot"></span>
          </button>

          {showNotifications && (
            <div className="db-dropdown-popover" style={{ width: "320px", right: 0 }}>
              <div className="db-dropdown-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Notifications</span>
                <span style={{ fontSize: "11px", color: "var(--sarthi-primary)", fontWeight: "600", cursor: "pointer" }}>
                  Mark all read
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "6px" }}>
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setShowNotifications(false)}
                    style={{
                      textDecoration: "none",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: n.unread ? "var(--sarthi-mint-50)" : "transparent",
                      border: n.unread ? "1px solid var(--sarthi-border)" : "1px solid transparent",
                      display: "block",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--sarthi-text-heading)" }}>{n.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--sarthi-text-muted)", marginTop: "2px" }}>{n.desc}</div>
                    <div style={{ fontSize: "10px", color: "var(--sarthi-text-light)", marginTop: "3px" }}>{n.time}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Switch to Trainer View Button */}
        <Link
          href="/trainer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "999px",
            background: "#ecfdf5",
            color: "#065f46",
            fontSize: "12px",
            fontWeight: "700",
            border: "1px solid #a7f3d0",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
          title="Switch to Trainer (Faculty) Mission Control"
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669" }}></span>
          <span>Trainer View &rarr;</span>
        </Link>

        {/* User Profile Chip */}
        <div style={{ position: "relative" }}>
          <div
            className="db-top-user-chip"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <img
              src={student.avatar || "/images/student-img-1.jpg"}
              alt={student.name}
              className="db-top-user-avatar"
            />
            <span className="db-top-user-name">{student.name}</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#64748b" }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {showUserMenu && (
            <div className="db-dropdown-popover" style={{ width: "200px", right: 0 }}>
              <div className="db-dropdown-header">{student.name}</div>
              <div className="db-notification-item">
                <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)} style={{ textDecoration: "none", color: "inherit" }}>
                  Account Settings
                </Link>
              </div>
              <div className="db-notification-item">
                <Link href="/dashboard/certificates" onClick={() => setShowUserMenu(false)} style={{ textDecoration: "none", color: "inherit" }}>
                  My Certificates
                </Link>
              </div>
              <div className="db-notification-item">
                <Link href="/trainer" onClick={() => setShowUserMenu(false)} style={{ textDecoration: "none", color: "#059669", fontWeight: "700" }}>
                  Switch to Trainer View &rarr;
                </Link>
              </div>
              <div className="db-notification-item">
                <Link href="/admin" onClick={() => setShowUserMenu(false)} style={{ textDecoration: "none", color: "#ea580c", fontWeight: "700" }}>
                  👑 Admin Console &rarr;
                </Link>
              </div>
              <div className="db-notification-item" style={{ color: "#dc2626" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    padding: 0,
                    font: "inherit",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
