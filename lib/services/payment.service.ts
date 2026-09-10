import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";

/**
 * UNIFIED PAYMENT STATUS CONTRACT
 * This aligns UI, API, and DB status mapping.
 */
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS;

/**
 * UI -> DB Status Mapper
 * Maps frontend display terms to strict DB status strings.
 */
export function mapUIStatusToDB(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'succeeded':
    case 'success':
      return PAYMENT_STATUS.COMPLETED;
    case 'pending':
    case 'pending_verification':
      return PAYMENT_STATUS.PENDING;
    case 'failed':
      return PAYMENT_STATUS.FAILED;
    case 'refunded':
      return PAYMENT_STATUS.REFUNDED;
    default:
      return status.toUpperCase();
  }
}

/**
 * DB -> UI Status Mapper
 * Ensures the frontend consistently shows user-friendly terms.
 */
export function mapDBStatusToUI(status: string): string {
  switch (status) {
    case PAYMENT_STATUS.COMPLETED:
      return 'Completed';
    case PAYMENT_STATUS.PENDING:
      return 'Pending';
    case PAYMENT_STATUS.FAILED:
      return 'Failed';
    case PAYMENT_STATUS.REFUNDED:
      return 'Refunded';
    default:
      return status;
  }
}

export interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  totalTransactions: number;
}

/**
 * SHARED PAYMENT SERVICE LAYER
 */
export async function getPayments(options: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
} = {}) {
  const { 
    page = 1, 
    pageSize = 10, 
    status, 
    search, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    startDate,
    endDate
  } = options;

  const skip = (page - 1) * pageSize;

  return await withResiliency(async () => {
    // 1. Build Query
    const where: any = {};

    if (status && status !== 'all') {
      where.status = mapUIStatusToDB(status);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { razorpayOrderId: { contains: search } },
        { razorpayPaymentId: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { course: { title: { contains: search } } }
      ];
    }

    // 2. Fetch Data & Stats
    const [payments, total, statsData] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: true
      })
    ]);

    // 3. Aggregate Stats
    const stats: PaymentStats = {
      totalRevenue: statsData.filter(s => s.status === PAYMENT_STATUS.COMPLETED).reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      pendingAmount: statsData.filter(s => s.status === PAYMENT_STATUS.PENDING).reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      failedAmount: statsData.filter(s => s.status === PAYMENT_STATUS.FAILED).reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      refundedAmount: statsData.filter(s => s.status === PAYMENT_STATUS.REFUNDED).reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      totalTransactions: total
    };

    return {
      payments,
      stats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }, 'get-payments-service');
}

export async function updatePaymentStatus(id: string, status: string) {
  return await withResiliency(async () => {
    const dbStatus = mapUIStatusToDB(status);
    
    return await prisma.transaction.update({
      where: { id },
      data: { status: dbStatus },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } }
      }
    });
  }, `update-payment-status-${id}`);
}
