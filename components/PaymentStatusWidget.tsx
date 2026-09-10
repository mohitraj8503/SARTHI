'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Clock, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PendingPayment {
  orderId: string;
  courseName: string;
  amount: number;
  status: 'awaiting_payment' | 'proof_uploaded' | 'verified' | 'rejected';
  timestamp: number;
  transactionId?: string;
}

export default function PaymentStatusWidget({ userEmail }: { userEmail: string }) {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  useEffect(() => {
    // Fetch all orders for this user
    const allOrders = storage.list<any>('order:', true);
    const userOrders = allOrders
      .filter((order) => order.studentEmail === userEmail)
      .filter((order) => order.status !== 'verified'); // Only show non-verified

    setPendingPayments(userOrders);
  }, [userEmail]);

  if (pendingPayments.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {pendingPayments.map((payment) => (
        <div
          key={payment.orderId}
          className={`rounded-2xl p-4 border-2 ${
            payment.status === 'proof_uploaded'
              ? 'bg-blue-50 border-blue-200'
              : payment.status === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {payment.status === 'proof_uploaded' ? (
                  <Clock className="w-5 h-5 text-blue-600" />
                ) : payment.status === 'rejected' ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                <h3 className="font-bold text-gray-900">{payment.courseName}</h3>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Order ID:{' '}
                <code className="font-mono text-xs bg-white px-2 py-0.5 rounded">
                  {payment.orderId}
                </code>
              </p>

              <p className="text-sm text-gray-600">
                Amount: <span className="font-bold">₹{payment.amount.toLocaleString()}</span>
              </p>

              {payment.status === 'proof_uploaded' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Payment verification in progress...</span>
                </div>
              )}

              {payment.status === 'rejected' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-700">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">
                    Payment verification pending. Please contact support.
                  </span>
                </div>
              )}
            </div>

            {payment.status === 'awaiting_payment' && (
              <Link
                href={`/payment/${payment.orderId}`}
                className="shrink-0 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors"
              >
                Complete Payment
              </Link>
            )}

            {payment.status === 'rejected' && (
              <a
                href="https://api.whatsapp.com/send?phone=919835019509"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors"
              >
                Contact Support
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

