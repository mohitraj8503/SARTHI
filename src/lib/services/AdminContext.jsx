"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialAdminProfile,
  initialAdminStats,
  initialRevenueChartData,
  initialAdminInsights,
  initialAdminUsers,
  initialAdminCourses,
  initialLiveOperations,
  initialEmailLogs,
} from "./adminData";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminProfile, setAdminProfile] = useState(initialAdminProfile);
  const [adminStats, setAdminStats] = useState(initialAdminStats);
  const [revenueData, setRevenueData] = useState(initialRevenueChartData);
  const [chartTimeframe, setChartTimeframe] = useState("week"); // 'week' | 'month'
  const [insights, setInsights] = useState(initialAdminInsights);
  const [users, setUsers] = useState(initialAdminUsers);
  const [courses, setCourses] = useState(initialAdminCourses);
  const [liveOps, setLiveOps] = useState(initialLiveOperations);
  const [emailLogs, setEmailLogs] = useState(initialEmailLogs);
  const [activeModal, setActiveModal] = useState(null);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("sarthi_admin_stats");
      if (savedStats) setAdminStats(JSON.parse(savedStats));

      const savedUsers = localStorage.getItem("sarthi_admin_users");
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedCourses = localStorage.getItem("sarthi_admin_courses");
      if (savedCourses) setCourses(JSON.parse(savedCourses));

      const savedLogs = localStorage.getItem("sarthi_admin_emails");
      if (savedLogs) setEmailLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.warn("Admin localStorage read error:", e);
    }
  }, []);

  const saveStats = (data) => {
    setAdminStats(data);
    try { localStorage.setItem("sarthi_admin_stats", JSON.stringify(data)); } catch (e) {}
  };

  const saveUsers = (data) => {
    setUsers(data);
    try { localStorage.setItem("sarthi_admin_users", JSON.stringify(data)); } catch (e) {}
  };

  const saveCourses = (data) => {
    setCourses(data);
    try { localStorage.setItem("sarthi_admin_courses", JSON.stringify(data)); } catch (e) {}
  };

  const saveEmailLogs = (data) => {
    setEmailLogs(data);
    try { localStorage.setItem("sarthi_admin_emails", JSON.stringify(data)); } catch (e) {}
  };

  // Actions: Course creation & approval
  const addCourse = (courseData) => {
    const newCourse = {
      id: `crs-${Date.now()}`,
      title: courseData.title,
      category: courseData.category || "Meteorology",
      instructor: courseData.instructor || "IMD Faculty",
      enrolled: 0,
      completionRate: "0%",
      status: "PUBLISHED",
      dateAdded: new Date().toISOString().split("T")[0],
      price: "₹0 (Govt Subsidized)",
    };
    const updated = [newCourse, ...courses];
    saveCourses(updated);
    saveStats({
      ...adminStats,
      publishedCourses: adminStats.publishedCourses + 1,
    });
    return newCourse;
  };

  const approveCourse = (courseId) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, status: "PUBLISHED" } : c
    );
    saveCourses(updated);
    const pendingCount = updated.filter((c) => c.status === "PENDING_APPROVAL").length;
    saveStats({
      ...adminStats,
      publishedCourses: adminStats.publishedCourses + 1,
      pendingApprovals: pendingCount,
    });
  };

  // Actions: User management
  const updateUserStatus = (userId, newStatus) => {
    const updated = users.map((u) =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    saveUsers(updated);
  };

  const updateUserRole = (userId, newRole) => {
    const updated = users.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    saveUsers(updated);
  };

  // Actions: Dismiss alert
  const dismissAlert = (alertId) => {
    setInsights((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== alertId),
    }));
  };

  // Actions: Email broadcast
  const sendBroadcastEmail = ({ subject, message, audience = "All Learners (142)" }) => {
    const now = new Date();
    const sentAt = now.toISOString().replace("T", " ").slice(0, 16) + " IST";
    const newLog = {
      id: `em-${Date.now()}`,
      subject,
      recipientsCount: audience.includes("142") ? 142 : 186,
      sentAt,
      sender: adminProfile.email,
      status: "DELIVERED",
      openRate: "92.0%",
    };
    const updated = [newLog, ...emailLogs];
    saveEmailLogs(updated);
    return newLog;
  };

  // Actions: Export report simulation
  const exportReport = (format = "PDF") => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          filename: `SARTHI_Admin_Platform_Report_${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`,
          format,
        });
      }, 800);
    });
  };

  const value = {
    adminProfile,
    adminStats,
    revenueData,
    chartTimeframe,
    setChartTimeframe,
    insights,
    users,
    courses,
    liveOps,
    emailLogs,
    activeModal,
    setActiveModal,
    addCourse,
    approveCourse,
    updateUserStatus,
    updateUserRole,
    dismissAlert,
    sendBroadcastEmail,
    exportReport,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
