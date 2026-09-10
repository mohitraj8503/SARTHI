'use client';

import React from 'react';
import ProfessionalCertificate from "@/components/ProfessionalCertificate";

interface Props {
  recipientName: string;
  certTitle: string;
  credentialId: string;
  issuedDate: string;
}

export default function CertificatePrint({
  recipientName,
  certTitle,
  credentialId,
  issuedDate,
}: Props) {
  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 297mm;
          height: 210mm;
          overflow: hidden !important;
          background: white !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-sizing: border-box;
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>

      {/* Full A4 landscape canvas */}
      <div
        style={{
          width: '297mm',
          height: '210mm',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
        }}
      >
        <ProfessionalCertificate
          organization="SARTHI"
          studentName={recipientName}
          courseName={certTitle}
          supportingLineTop="Presented to"
          supportingLineBottom="For successfully completing the Advanced Certification Program with distinction."
          issueDate={issuedDate}
          dateLabel="Date of Issue"
          certificateId={credentialId}
          idLabel="Certificate ID"
          verificationUrl="https://sarthi-woad.vercel.app/verify/"
          signatureName="Dr. Mukul Pandey"
          signatureRole="CEO & FOUNDER, SARTHI"
          signatureLabel="Authorized Signature"
          qrLabel="Verify Certificate"
          logoUrl="/sarthi-logo.png"
        />
      </div>
    </>
  );
}
