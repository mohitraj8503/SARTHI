'use client';

import React, { useState } from 'react';
import { Download, Loader2, FileArchive } from 'lucide-react';

interface BulkDownloadButtonProps {
  userId: string;
  maxCertificates?: number;
  className?: string;
}

/**
 * Bulk Download Button Component
 * Downloads multiple certificates as a ZIP file
 * Pro feature - only available for ₹99 tier
 */
export default function BulkDownloadButton({
  userId,
  maxCertificates = 10,
  className = ''
}: BulkDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBulkDownload = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Fetch user's certificates
      const response = await fetch(`/api/certificates/user/${userId}/list`);
      const certificates = await response.json();

      if (!certificates || certificates.length === 0) {
        alert('No certificates found to download');
        setLoading(false);
        return;
      }

      const limitedCerts = certificates.slice(0, maxCertificates);
      
      // Generate ZIP using JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      let downloaded = 0;

      for (const cert of limitedCerts) {
        try {
          // Fetch each certificate PDF
          const pdfResponse = await fetch(
            `/api/course/certificate/download?courseId=${cert.courseId}`
          );
          
          if (pdfResponse.ok) {
            const blob = await pdfResponse.blob();
            const filename = `${cert.courseTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
            zip.file(filename, blob);
          }
        } catch (err) {
          console.error(`Error downloading certificate ${cert.courseId}:`, err);
        }

        downloaded++;
        setProgress(Math.round((downloaded / limitedCerts.length) * 100));
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `SARTHI_Certificates_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Bulk download error:', error);
      alert('Failed to download certificates. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleBulkDownload}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-[#6B46C1] text-white rounded-lg 
        font-medium text-sm transition-all duration-200
        hover:bg-[#553C9A] hover:shadow-md
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Downloading... {progress}%</span>
        </>
      ) : (
        <>
          <FileArchive className="w-4 h-4" />
          <span>Bulk Download ({maxCertificates} certs)</span>
        </>
      )}
    </button>
  );
}

/**
 * Individual Certificate Download Button
 */
interface DownloadButtonProps {
  courseId: string;
  courseTitle: string;
  className?: string;
}

export function CertificateDownloadButton({
  courseId,
  courseTitle,
  className = ''
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/course/certificate/download?courseId=${courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${courseTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 
        bg-brand-orange text-white rounded-lg 
        text-xs font-medium transition-all duration-200
        hover:opacity-90 disabled:opacity-70
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Download className="w-3 h-3" />
      )}
      Download
    </button>
  );
}

