'use client';

import { useState } from 'react';
import {
  AdminSidebar,
  AdminHeader,
  AdminKPIStrip,
  AdminActionGrid,
  ActivityFeed,
  UsersTable,
  UserDetailDrawer,
  PaymentsPanel,
  SupportInbox,
  SystemHealth,
  demoActivities,
  demoTickets,
  User,
  Payment,
} from '@/components/admin';

// Demo data
const demoUsers: User[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', image: null, role: 'student', status: 'active', createdAt: '2024-01-15', enrollments: 5, lastActive: '2024-02-01' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', image: null, role: 'student', status: 'active', createdAt: '2024-01-20', enrollments: 3, lastActive: '2024-02-01' },
  { id: '3', name: 'Amit Kumar', email: 'amit@example.com', image: null, role: 'student', status: 'suspended', createdAt: '2024-01-25', enrollments: 2, lastActive: '2024-01-30' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah@example.com', image: null, role: 'teacher', status: 'active', createdAt: '2023-12-01', enrollments: 0, lastActive: '2024-02-01' },
  { id: '5', name: 'John Doe', email: 'john@example.com', image: null, role: 'student', status: 'pending', createdAt: '2024-02-01', enrollments: 0, lastActive: '2024-02-01' },
];

const demoPayments: Payment[] = [
  { id: 'pay_001', user: { name: 'Rahul Sharma', email: 'rahul@example.com', image: null }, amount: 2500, status: 'success', course: { title: 'React Complete' }, createdAt: '2024-02-01T10:30:00Z', method: 'UPI' },
  { id: 'pay_002', user: { name: 'Priya Patel', email: 'priya@example.com', image: null }, amount: 1500, status: 'pending', course: { title: 'Python Basics' }, createdAt: '2024-02-01T11:00:00Z', method: 'Card' },
  { id: 'pay_003', user: { name: 'Amit Kumar', email: 'amit@example.com', image: null }, amount: 3000, status: 'failed', course: { title: 'Node.js Mastery' }, createdAt: '2024-02-01T11:30:00Z', method: 'UPI' },
  { id: 'pay_004', user: { name: 'Sarah Johnson', email: 'sarah@example.com', image: null }, amount: 5000, status: 'success', course: { title: 'Data Science' }, createdAt: '2024-02-01T12:00:00Z', method: 'Card' },
  { id: 'pay_005', user: { name: 'John Doe', email: 'john@example.com', image: null }, amount: 2000, status: 'refunded', course: { title: 'JavaScript Pro' }, createdAt: '2024-02-01T12:30:00Z', method: 'UPI' },
];

export default function AdminPreviewPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleAction = (action: string) => {
    setDrawerOpen(false);
  };

  const kpis = [
    { label: 'Total Users', value: '12,458', subValue: 'Today: +45', trend: 4, type: 'users' as const },
    { label: 'Active Students', value: '892', subValue: '24h active', trend: 12, type: 'users' as const },
    { label: 'Revenue', value: '₹2.4L', subValue: 'Month: ₹18.5L', trend: 8, type: 'revenue' as const },
    { label: 'Seminars', value: '12', type: 'sessions' as const },
    { label: 'Open Tickets', value: '7', type: 'tickets' as const },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <AdminSidebar />
      
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader systemStatus={{ status: 'operational', message: 'All systems operational' }} pendingCount={3} />
        
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f0f0f5', margin: '0 0 4px 0' }}>Executive Dashboard</h1>
              <p style={{ fontSize: 14, color: '#606070', margin: 0 }}>Real-time overview of your platform</p>
            </div>

            {/* KPI Strip */}
            <section style={{ marginBottom: 32 }}>
              <AdminKPIStrip kpis={kpis} />
            </section>

            {/* Quick Actions */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', margin: '0 0 16px 0' }}>Quick Actions</h2>
              <AdminActionGrid />
            </section>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, marginBottom: 32 }}>
              {/* Users Table */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', margin: 0 }}>Recent Users</h2>
                </div>
                <UsersTable users={demoUsers} onRowClick={handleUserClick} />
              </section>

              {/* Activity Feed */}
              <section>
                <ActivityFeed activities={demoActivities} />
              </section>
            </div>

            {/* System Health */}
            <section style={{ marginBottom: 32 }}>
              <SystemHealth />
            </section>

            {/* Payments */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', margin: '0 0 16px 0' }}>Recent Payments</h2>
              <PaymentsPanel payments={demoPayments} />
            </section>

            {/* Support Tickets */}
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f5', margin: '0 0 16px 0' }}>Support Tickets</h2>
              <SupportInbox tickets={demoTickets} />
            </section>
          </div>
        </main>
      </div>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAction={handleAction}
      />
    </div>
  );
}

