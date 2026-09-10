'use client';

import Link from 'next/link';
import {
  Users,
  BookOpen,
  CreditCard,
  Video,
  GraduationCap,
  BarChart3,
  Settings,
  Search,
} from 'lucide-react';

interface ActionCard {
  label: string;
  description: string;
  href: string;
  icon: 'users' | 'courses' | 'payments' | 'sessions' | 'teachers' | 'analytics' | 'settings' | 'search';
  badge?: number;
}

interface AdminActionGridProps {
  actions?: ActionCard[];
  loading?: boolean;
}

const defaultActions: ActionCard[] = [
  {
    label: 'User Management',
    description: 'Users, roles, permissions',
    href: '/admin/users',
    icon: 'users',
  },
  {
    label: 'Course Management',
    description: 'Courses, modules, content',
    href: '/admin/courses',
    icon: 'courses',
  },
  {
    label: 'Payments & Plans',
    description: 'Transactions, refunds',
    href: '/admin/payments',
    icon: 'payments',
    badge: 3,
  },
  {
    label: 'Seminars',
    description: 'Live class management',
    href: '/admin/seminars',
    icon: 'sessions',
  },
  {
    label: 'Challenges & Ideathons',
    description: 'AI Ideathon & hackathon signups',
    href: '/admin/challenges',
    icon: 'trophy',
  },
  {
    label: 'Teacher Panel',
    description: 'Teacher assignments',
    href: '/admin/teachers',
    icon: 'teachers',
  },
  {
    label: 'Reports & Analytics',
    description: 'Business intelligence',
    href: '/admin/analytics',
    icon: 'analytics',
  },
  {
    label: 'System Settings',
    description: 'Platform configuration',
    href: '/admin/settings',
    icon: 'settings',
  },
];

const iconComponents = {
  users: Users,
  courses: BookOpen,
  payments: CreditCard,
  sessions: Video,
  teachers: GraduationCap,
  analytics: BarChart3,
  settings: Settings,
  search: Search,
};

const iconColors: Record<ActionCard['icon'], { bg: string; color: string }> = {
  users: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  courses: { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' },
  payments: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
  sessions: { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' },
  teachers: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' },
  analytics: { bg: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' },
  settings: { bg: 'rgba(160, 160, 176, 0.1)', color: '#a0a0b0' },
  search: { bg: 'rgba(160, 160, 176, 0.1)', color: '#a0a0b0' },
};

export function AdminActionGrid({ actions = defaultActions, loading }: AdminActionGridProps) {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {actions.map((_, i) => (
          <div key={i} style={{
            background: '#16161f',
            border: '1px solid #2a2a36',
            borderRadius: 8,
            padding: '20px',
            height: 100,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, marginBottom: 12, background: '#2a2a36' }} />
            <div style={{ width: '80%', height: 14, marginBottom: 8, background: '#2a2a36', borderRadius: 4 }} />
            <div style={{ width: '60%', height: 12, background: '#2a2a36', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 12,
    }}>
      {actions.map((action, index) => {
        const Icon = iconComponents[action.icon];
        const colors = iconColors[action.icon];

        return (
          <Link
            key={index}
            href={action.href}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '18px 20px',
              background: '#16161f',
              border: '1px solid #2a2a36',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3a3a4a';
              e.currentTarget.style.background = '#1a1a24';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a36';
              e.currentTarget.style.background = '#16161f';
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: colors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.color,
              flexShrink: 0,
            }}>
              <Icon size={20} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#f0f0f5',
                }}>
                  {action.label}
                </span>
                {action.badge && action.badge > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 20,
                    height: 20,
                    padding: '0 6px',
                    background: '#ef4444',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'white',
                  }}>
                    {action.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 12,
                color: '#606070',
                display: 'block',
                marginTop: 4,
              }}>
                {action.description}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

