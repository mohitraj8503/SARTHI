'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export interface Payment {
  id: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  course: {
    title: string;
  };
  createdAt: string;
  method: string;
}

interface PaymentsPanelProps {
  payments: Payment[];
  loading?: boolean;
  onApprove?: (paymentId: string) => void;
  onReject?: (paymentId: string, reason: string) => void;
  onRefund?: (paymentId: string) => void;
}

export function PaymentsPanel({ payments, loading, onApprove, onReject, onRefund }: PaymentsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').length;
    const success = payments.filter(p => p.status === 'success').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const successAmount = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    
    return { total, pending, success, failed, successAmount };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p => p.user.name?.toLowerCase().includes(term) ||
             p.user.email.toLowerCase().includes(term) ||
             p.course.title.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    
    return result;
  }, [payments, searchTerm, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Payment['status']) => {
    const styles: Record<string, { bg: string; color: string; icon: any; label: string }> = {
      pending: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', icon: Clock, label: 'Pending' },
      success: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: CheckCircle, label: 'Success' },
      failed: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: XCircle, label: 'Failed' },
      refunded: { bg: 'rgba(160, 160, 176, 0.1)', color: '#a0a0b0', icon: RefreshCw, label: 'Refunded' },
    };
    return styles[status];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        <div style={{
          background: '#16161f',
          border: '1px solid #2a2a36',
          borderRadius: 8,
          padding: '16px 20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
            }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: 13, color: '#606070' }}>Total Revenue</span>
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#f0f0f5',
            fontFamily: 'monospace',
          }}>
            {formatCurrency(stats.successAmount)}
          </div>
        </div>

        <div style={{
          background: '#16161f',
          border: '1px solid #2a2a36',
          borderRadius: 8,
          padding: '16px 20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(234, 179, 8, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#eab308',
            }}>
              <Clock size={18} />
            </div>
            <span style={{ fontSize: 13, color: '#606070' }}>Pending</span>
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#f0f0f5',
            fontFamily: 'monospace',
          }}>
            {stats.pending}
          </div>
        </div>

        <div style={{
          background: '#16161f',
          border: '1px solid #2a2a36',
          borderRadius: 8,
          padding: '16px 20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
            }}>
              <CheckCircle size={18} />
            </div>
            <span style={{ fontSize: 13, color: '#606070' }}>Success</span>
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#f0f0f5',
            fontFamily: 'monospace',
          }}>
            {stats.success}
          </div>
        </div>

        <div style={{
          background: '#16161f',
          border: '1px solid #2a2a36',
          borderRadius: 8,
          padding: '16px 20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}>
              <XCircle size={18} />
            </div>
            <span style={{ fontSize: 13, color: '#606070' }}>Failed</span>
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#f0f0f5',
            fontFamily: 'monospace',
          }}>
            {stats.failed}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#16161f',
        border: '1px solid #2a2a36',
        borderRadius: 8,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid #2a2a36',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#606070',
              }} />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 40px',
                  background: '#1a1a24',
                  border: '1px solid #2a2a36',
                  borderRadius: 6,
                  color: '#f0f0f5',
                  fontSize: 14,
                  width: 240,
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#1a1a24',
                border: '1px solid #2a2a36',
                borderRadius: 6,
                color: '#f0f0f5',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div style={{ fontSize: 13, color: '#606070' }}>
            {filteredPayments.length} transactions
          </div>
        </div>

        {/* Payments Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a36' }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Transaction ID
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  User
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Course
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  width: 100,
                }}>
                  Amount
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  width: 120,
                }}>
                  Status
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  width: 140,
                }}>
                  Date
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#a0a0b0',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  width: 140,
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ color: '#606070' }}>Loading payments...</div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ color: '#606070' }}>No payments found</div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #2a2a36' }}>
                      <td style={{ padding: '12px 16px', color: '#a0a0b0', fontSize: 13, fontFamily: 'monospace' }}>
                        {payment.id.slice(0, 12)}...
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <div style={{ fontWeight: 500, color: '#f0f0f5' }}>
                            {payment.user.name || 'Unknown'}
                          </div>
                          <div style={{ fontSize: 12, color: '#606070' }}>
                            {payment.user.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#a0a0b0' }}>
                        {payment.course.title}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontWeight: 500,
                        color: '#f0f0f5',
                        fontFamily: 'monospace',
                      }}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          background: statusBadge.bg,
                          color: statusBadge.color,
                        }}>
                          <StatusIcon size={12} />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#a0a0b0', fontSize: 13 }}>
                        {formatDate(payment.createdAt)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onApprove?.(payment.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(34, 197, 94, 0.1)',
                                  border: '1px solid rgba(34, 197, 94, 0.2)',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  color: '#22c55e',
                                  cursor: 'pointer',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Rejection reason:');
                                  if (reason) onReject?.(payment.id, reason);
                                }}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payment.status === 'success' && (
                            <button
                              onClick={() => onRefund?.(payment.id)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(160, 160, 176, 0.1)',
                                border: '1px solid rgba(160, 160, 176, 0.2)',
                                borderRadius: 6,
                                fontSize: 12,
                                color: '#a0a0b0',
                                cursor: 'pointer',
                              }}
                            >
                              Refund
                            </button>
                          )}
                          <button
                            style={{
                              padding: '6px 8px',
                              background: 'transparent',
                              border: '1px solid #2a2a36',
                              borderRadius: 6,
                              cursor: 'pointer',
                              color: '#606070',
                            }}
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

