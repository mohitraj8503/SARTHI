'use client';

import { useState, useEffect } from 'react';

export type CertificateStatusType = 'VALID' | 'PENDING_PAYMENT' | 'UNATTEMPTED' | 'REVOKED' | 'NOT_FOUND';

export interface CertificateStatusResult {
  loading: boolean;
  status: CertificateStatusType;
  isPaid: boolean;
  canPrint: boolean;
  canView: boolean;
  canShare: boolean;
  certificateNumber: string | null;
  error: string | null;
  certData: any | null;
  refetch: () => Promise<void>;
}

/**
 * Single Source of Truth Hook for Certificate Status
 * Enforces that isPaid, canPrint, canView, and canShare are derived strictly from status === 'VALID'.
 */
export function useCertificateStatus(idOrSlug: string | null): CertificateStatusResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<CertificateStatusType>('NOT_FOUND');
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);
  const [certData, setCertData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!idOrSlug) {
      setLoading(false);
      setStatus('NOT_FOUND');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Try querying /api/certificates/verify?id=...
      const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(idOrSlug)}`);
      
      if (res.ok) {
        const data = await res.json();
        setCertData(data);
        const certStatus: CertificateStatusType = data.status === 'VALID' ? 'VALID' : (data.status || 'PENDING_PAYMENT');
        setStatus(certStatus);
        setCertificateNumber(data.certificateNumber || data.id || idOrSlug);
        setLoading(false);
        return;
      }

      // If 403 Forbidden with PENDING status
      if (res.status === 403) {
        const data = await res.json();
        setCertData(data);
        setStatus('PENDING_PAYMENT');
        setCertificateNumber(data.certificateNumber || data.id || idOrSlug);
        setLoading(false);
        return;
      }

      // 2. If pathway slug, try /api/certifications/paths/[slug]/progress
      const pathRes = await fetch(`/api/certifications/paths/${encodeURIComponent(idOrSlug)}/progress`);
      if (pathRes.ok) {
        const pathData = await pathRes.json();
        setCertData(pathData);
        const certStatus: CertificateStatusType = pathData.isPaid ? 'VALID' : (pathData.status || 'PENDING_PAYMENT');
        setStatus(certStatus);
        setCertificateNumber(pathData.credentialId || null);
        setLoading(false);
        return;
      }

      setStatus('NOT_FOUND');
    } catch (err: any) {
      console.error('useCertificateStatus error:', err);
      setError(err.message || 'Error fetching status');
      setStatus('NOT_FOUND');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [idOrSlug]);

  const isValid = status === 'VALID';

  return {
    loading,
    status,
    isPaid: isValid,
    canPrint: isValid,
    canView: isValid,
    canShare: isValid,
    certificateNumber,
    error,
    certData,
    refetch: fetchStatus
  };
}
