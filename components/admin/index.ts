// Premium Admin Dashboard Components
// Enterprise-grade, minimal, serious UI components

export { AdminHeader } from './AdminHeader';
export { default as AdminSidebar } from './AdminSidebar';
export { AdminKPIStrip, createDefaultKPIs } from './AdminKPIStrip';
export { AdminActionGrid } from './AdminActionGrid';
export { ActivityFeed } from './ActivityFeed';
export { UsersTable } from './UsersTable';
export { UserDetailDrawer } from './UserDetailDrawer';
export { PaymentsPanel } from './PaymentsPanel';
export { SupportInbox } from './SupportInbox';
export { SystemHealth } from './SystemHealth';

// Types
export type { KPIItem } from './AdminKPIStrip';
export type { ActivityItem } from './ActivityFeed';
export type { User } from './UsersTable';
export type { Payment } from './PaymentsPanel';
export type { Ticket } from './SupportInbox';

// Demo Data
export { demoActivities } from './ActivityFeed';
export { demoTickets } from './SupportInbox';

