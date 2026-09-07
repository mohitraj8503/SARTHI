"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminModals from "./AdminModals";

export default function AdminShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-app-layout">
      {/* Dark Forest Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <div className="admin-main-container">
          <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main>{children}</main>
        </div>
      </div>

      {/* Interactive Admin Modals */}
      <AdminModals />
    </div>
  );
}
