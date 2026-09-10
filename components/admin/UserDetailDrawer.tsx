'use client';

import { useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  CreditCard,
  LogIn,
  Edit,
  Ban,
  CheckCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { User } from './UsersTable';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface UserDetailDrawerProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onAction?: (action: string) => void;
}

export function UserDetailDrawer({ user, open, onClose, onAction }: UserDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const router = useRouter();

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !user) return null;

  const getStatusBadge = (status: User['status']) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Active' },
      suspended: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Suspended' },
      pending: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Pending' },
    };
    return styles[status];
  };

  const statusBadge = getStatusBadge(user.status);

  return (
    <div>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99,
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 440,
          height: '100vh',
          background: '#12121a',
          borderLeft: '1px solid #2a2a36',
          zIndex: 100,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 200ms ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a36',
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#f0f0f5',
            margin: 0,
          }}>
            User Details
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#606070',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}>
          {/* Avatar & Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#2a2a36',
            }}>
               {user.image ? (
                 
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a0a0b0',
                  fontSize: 28,
                  fontWeight: 600,
                }}>
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#f0f0f5',
                margin: '0 0 4px 0',
              }}>
                {user.name || 'Unnamed User'}
              </h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                background: statusBadge.bg,
                color: statusBadge.color,
                textTransform: 'capitalize',
              }}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              background: '#1a1a24',
              border: '1px solid #2a2a36',
              borderRadius: 8,
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#f0f0f5',
                fontFamily: 'monospace',
              }}>
                {user.enrollments}
              </div>
              <div style={{
                fontSize: 11,
                color: '#606070',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Enrolled
              </div>
            </div>
            <div style={{
              background: '#1a1a24',
              border: '1px solid #2a2a36',
              borderRadius: 8,
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#f0f0f5',
                fontFamily: 'monospace',
              }}>
                {user.coursesCount || user._count?.enrollments || 0}
              </div>
              <div style={{
                fontSize: 11,
                color: '#606070',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Completed
              </div>
            </div>
            <div style={{
              background: '#1a1a24',
              border: '1px solid #2a2a36',
              borderRadius: 8,
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#f0f0f5',
                fontFamily: 'monospace',
              }}>
                {user.progress || 'N/A'}
              </div>
              <div style={{
                fontSize: 11,
                color: '#606070',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Progress
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 24,
          }}>
            <button
              onClick={() => onAction?.('impersonate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <LogIn size={16} />
              Login as User
            </button>
            <button
              onClick={() => onAction?.('edit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                background: '#1a1a24',
                border: '1px solid #2a2a36',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#f0f0f5',
                cursor: 'pointer',
              }}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>

          {/* Info Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Contact Info */}
            <div>
              <h4 style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#606070',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
              }}>
                Contact Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#a0a0b0',
                  fontSize: 14,
                }}>
                  <Mail size={16} style={{ color: '#606070' }} />
                  {user.email}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#a0a0b0',
                  fontSize: 14,
                }}>
                  <Calendar size={16} style={{ color: '#606070' }} />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#a0a0b0',
                  fontSize: 14,
                }}>
                  <Clock size={16} style={{ color: '#606070' }} />
                  {user.lastActive ? `Last active ${new Date(user.lastActive).toLocaleDateString()}` : 'Last active: N/A'}
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div>
              <h4 style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#606070',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
              }}>
                Role & Permissions
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: '#1a1a24',
                border: '1px solid #2a2a36',
                borderRadius: 8,
              }}>
                <Shield size={18} style={{ color: '#3b82f6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f0f0f5', textTransform: 'capitalize' }}>
                    {user.role}
                  </div>
                  <div style={{ fontSize: 12, color: '#606070' }}>
                    Full access permissions
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Role change requested for', user?.id);
                  }}
                  style={{
                    padding: '6px 10px',
                    background: 'transparent',
                    border: '1px solid #2a2a36',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#a0a0b0',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#606070',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
              }}>
                Recent Activity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user.recentActivity && user.recentActivity.length > 0 ? (
                  user.recentActivity.map((activity: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      background: '#1a1a24',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: activity.color + '15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: activity.color,
                    }}>
                      <activity.icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#f0f0f5' }}>
                        {activity.text}
                      </div>
                      <div style={{ fontSize: 11, color: '#606070' }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: 'center', color: '#606070', fontSize: 13 }}>
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderTop: '1px solid #2a2a36',
        }}>
          <button
            onClick={() => onAction?.(user.status === 'active' ? 'suspend' : 'activate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: user.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              border: '1px solid ' + (user.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'),
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: user.status === 'active' ? '#ef4444' : '#22c55e',
              cursor: 'pointer',
            }}
          >
            {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
            {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
          </button>

          <button
            onClick={() => {
              if (user?.id) {
                window.location.href = `/admin/students/${user.id}`;
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              fontSize: 13,
              color: '#a0a0b0',
              cursor: 'pointer',
            }}
          >
            View Full Profile
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

