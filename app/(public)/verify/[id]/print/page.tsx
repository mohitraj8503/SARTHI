// ATOOT KADI: Print page — used by Playwright (/api/pdf/[id]) to generate official PDF.
// When htmlSnapshot is available in DB, serve it as full-page HTML (no wrapper).
// Fallback to CertificatePrint component only when no snapshot exists.

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import CertificatePrint from "./CertificatePrint";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CertificatePrintPage({ params }: Props) {
  const { id } = await params;

  let finalCert: any = null;
  const isMock =
    id === "sample-id" ||
    id.startsWith("sample-") ||
    id === "TT-PY-2026-X7B9K";
  const hasDb = !!process.env.DATABASE_URL;

  if (!isMock && hasDb) {
    try {
      // 1. IssuedCertificate v2
      let certV2 = await prisma.issuedCertificate.findFirst({
        where: { certificateHash: id },
        include: { user: true, certification: true },
      });
      if (!certV2) {
        certV2 = await prisma.issuedCertificate.findUnique({
          where: { verificationId: id },
          include: { user: true, certification: true },
        });
      }
      if (certV2) {
        finalCert = certV2;
      }

      // 2. Legacy userCertification
      if (!finalCert) {
        const certLegacy = await prisma.userCertification.findFirst({
          where: { certNumber: id },
          include: { user: true, certification: true },
        });
        finalCert = certLegacy;
      }

      // 3. Course certificate (has htmlSnapshot from Certificate Studio)
      if (!finalCert) {
        const courseCert = await prisma.certificate.findFirst({
          where: {
            OR: [
              { certificateNumber: id },
              { certificateId: id },
              { id: id },
            ],
          },
          include: { user: true, course: true },
        });
        finalCert = courseCert;
      }
    } catch (err) {
      console.error("DB error in print page:", err);
    }
  }

  const mockCert =
    id === "sample-id" || id.startsWith("sample-")
      ? { issuedAt: new Date(), user: { name: "Mohit Raj" }, certification: { title: "Advanced NLP with GPT Models" }, certNumber: id, htmlSnapshot: null, metadata: null }
      : id === "TT-PY-2026-X7B9K"
      ? { issuedAt: new Date("2026-05-01T00:00:00Z"), user: { name: "Rajdip Ghosh" }, certification: { title: "Python Professional Developer Certification" }, certNumber: id, htmlSnapshot: null, metadata: null }
      : null;

  const cert = finalCert || mockCert;
  if (!cert) notFound();

  const c = cert as any;

  // ── If the DB record has an htmlSnapshot, render it as a raw HTML page for Playwright ──
  // This makes the PDF identical to what Certificate Studio renders.
  if (c.htmlSnapshot && typeof c.htmlSnapshot === "string" && c.htmlSnapshot.length > 100) {
    // Inject print CSS to ensure exact 1050×787.5px output
    const printReadyHtml = c.htmlSnapshot.replace(
      "</head>",
      `<style>
        @page { size: A4 landscape; margin: 0 !important; }
        html, body { width: 297mm !important; height: 210mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style></head>`
    );
    // Return raw HTML response — Next.js will serve it as HTML, Playwright will capture it
    return (
      <div
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: printReadyHtml }}
      />
    );
  }

  const cleanUpperId = id.toUpperCase();
  const isExPattern = cleanUpperId.startsWith('TT-EX-') || cleanUpperId.startsWith('GT-');

  if (!isMock && !c?.htmlSnapshot && !isExPattern) {
    return <div>Certificate snapshot unavailable. Please regenerate it from Certificate Studio.</div>;
  }

  // Demo-only fallback for explicit sample IDs.
  let certTitle =
    c?.certification?.title || c?.course?.title || "Professional Certification";
  try {
    const meta = typeof c?.metadata === "string" ? JSON.parse(c.metadata) : c?.metadata;
    if (meta?.course_name) certTitle = meta.course_name;
  } catch {}

  const credentialId = c?.certNumber || c?.certificateNumber || c?.verificationId || id;
  const recipientName = cert.user?.name || "Student";
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <CertificatePrint
      recipientName={recipientName}
      certTitle={certTitle}
      credentialId={credentialId}
      issuedDate={issuedDate}
    />
  );
}
