import { prisma } from "@/lib/prisma";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { getCertificateDisplayState } from "@/lib/certificate/getCertificateDisplayState";
import { isValidInternshipCertificate } from "@/lib/certificate/internshipGuardrail";
import InternVerifyViewer from "./InternVerifyViewer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

// Authoritative 11 Active Intern Roster (AGENTS.md Rule 7 - Synced with Real DB Dates)
const AUTHORITATIVE_ROSTER: Record<string, { name: string; email: string; college: string; track: string; refId: string; internId: string; startDate?: string; endDate?: string }> = {
  "TT-INT-2026-0001": { name: "Ranjan Singh", email: "ranjansingh.w@gmail.com", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0001", internId: "TTI000001", startDate: "17 August 2026", endDate: "17 September 2026" },
  "TTI000001": { name: "Ranjan Singh", email: "ranjansingh.w@gmail.com", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0001", internId: "TTI000001", startDate: "17 August 2026", endDate: "17 September 2026" },

  "TT-BIA-2026-08": { name: "Jaanvi Nair", email: "nairjaanvi199@gmail.com", college: "SIES College of Arts, Science and Commerce, Mumbai", track: "Digital Marketing & Social Media", refId: "TT-BIA-2026-08", internId: "TTI000026", startDate: "27 July 2026", endDate: "27 August 2026" },
  "TT-APP-2026-0807-001": { name: "Jaanvi Nair", email: "nairjaanvi199@gmail.com", college: "SIES College of Arts, Science and Commerce, Mumbai", track: "Digital Marketing & Social Media", refId: "TT-APP-2026-0807-001", internId: "TTI000026", startDate: "27 July 2026", endDate: "27 August 2026" },
  "TT-INT-2026-0026": { name: "Jaanvi Nair", email: "nairjaanvi199@gmail.com", college: "SIES College of Arts, Science and Commerce, Mumbai", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0026", internId: "TTI000026", startDate: "27 July 2026", endDate: "27 August 2026" },
  "TTI000026": { name: "Jaanvi Nair", email: "nairjaanvi199@gmail.com", college: "SIES College of Arts, Science and Commerce, Mumbai", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0026", internId: "TTI000026", startDate: "27 July 2026", endDate: "27 August 2026" },

  "TT-INT-2026-0038": { name: "Nandini Katiyar", email: "nandinikatiyar5@gmail.com", college: "PSIT College of Higher Education, Kanpur", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0038", internId: "TTI000038", startDate: "27 July 2026", endDate: "27 August 2026" },
  "TTI000038": { name: "Nandini Katiyar", email: "nandinikatiyar5@gmail.com", college: "PSIT College of Higher Education, Kanpur", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0038", internId: "TTI000038", startDate: "27 July 2026", endDate: "27 August 2026" },

  "TT-INT-2026-0051": { name: "Pranshu Kumar Singh", email: "ps859521@gmail.com", college: "Arka Jain University", track: "Full Stack Web Development", refId: "TT-INT-2026-0051", internId: "TTI000051", startDate: "5 July 2026", endDate: "5 August 2026" },
  "TTI000051": { name: "Pranshu Kumar Singh", email: "ps859521@gmail.com", college: "Arka Jain University", track: "Full Stack Web Development", refId: "TT-INT-2026-0051", internId: "TTI000051", startDate: "5 July 2026", endDate: "5 August 2026" },

  "TT-INT-2026-0060": { name: "Surjo Banerjee", email: "surjobanerjee207@gmail.com", college: "Arka Jain University", track: "Video Editing & Reels Production", refId: "TT-INT-2026-0060", internId: "TTI000060", startDate: "4 August 2026", endDate: "4 September 2026" },
  "TTI000060": { name: "Surjo Banerjee", email: "surjobanerjee207@gmail.com", college: "Arka Jain University", track: "Video Editing & Reels Production", refId: "TT-INT-2026-0060", internId: "TTI000060", startDate: "4 August 2026", endDate: "4 September 2026" },

  "TT-INT-2026-0062": { name: "Keshav Kumar", email: "kumarkeshav10320@gmail.com", college: "Arka Jain University", track: "Creative Writing", refId: "TT-INT-2026-0062", internId: "TTI000062", startDate: "5 July 2026", endDate: "5 August 2026" },
  "TTI000062": { name: "Keshav Kumar", email: "kumarkeshav10320@gmail.com", college: "Arka Jain University", track: "Creative Writing", refId: "TT-INT-2026-0062", internId: "TTI000062", startDate: "5 July 2026", endDate: "5 August 2026" },

  "TT-INT-2026-0066": { name: "Keshav Ruhela", email: "keshavruhela25@gmail.com", college: "IILM University, Greater Noida", track: "Web Development", refId: "TT-INT-2026-0066", internId: "TTI000066", startDate: "17 August 2026", endDate: "17 September 2026" },
  "TTI000066": { name: "Keshav Ruhela", email: "keshavruhela25@gmail.com", college: "IILM University, Greater Noida", track: "Web Development", refId: "TT-INT-2026-0066", internId: "TTI000066", startDate: "17 August 2026", endDate: "17 September 2026" },

  "TT-INT-2026-0083": { name: "Kumari Tejal", email: "kumaritejal535@gmail.com", college: "Arka Jain University", track: "Graphic Design", refId: "TT-INT-2026-0083", internId: "TTI000083", startDate: "19 August 2026", endDate: "19 September 2026" },
  "TTI000083": { name: "Kumari Tejal", email: "kumaritejal535@gmail.com", college: "Arka Jain University", track: "Graphic Design", refId: "TT-INT-2026-0083", internId: "TTI000083", startDate: "19 August 2026", endDate: "19 September 2026" },

  "TT-INT-2026-0086": { name: "Aniket Dutta", email: "aniketdutta615@gmail.com", college: "Arka Jain University", track: "Content Creation", refId: "TT-INT-2026-0086", internId: "TTI000086", startDate: "19 August 2026", endDate: "19 September 2026" },
  "TTI000086": { name: "Aniket Dutta", email: "aniketdutta615@gmail.com", college: "Arka Jain University", track: "Content Creation", refId: "TT-INT-2026-0086", internId: "TTI000086", startDate: "19 August 2026", endDate: "19 September 2026" },

  "TT-INT-2026-0128": { name: "Nitin Sinha", email: "nitinsinha062@gmail.com", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0128", internId: "TTI000128", startDate: "5 August 2026", endDate: "5 September 2026" },
  "TTI000128": { name: "Nitin Sinha", email: "nitinsinha062@gmail.com", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0128", internId: "TTI000128", startDate: "5 August 2026", endDate: "5 September 2026" },

  "TT-INT-2026-0150": { name: "Harsh Nayan", email: "harshnayan018@gmail.com", college: "Arka Jain University", track: "Software Development", refId: "TT-INT-2026-0150", internId: "TTI000150", startDate: "19 August 2026", endDate: "19 September 2026" },
  "TTI000150": { name: "Harsh Nayan", email: "harshnayan018@gmail.com", college: "Arka Jain University", track: "Software Development", refId: "TT-INT-2026-0150", internId: "TTI000150", startDate: "19 August 2026", endDate: "19 September 2026" },
};

/** Helper to format date nicely */
function formatDate(d?: Date | string | null, fallback: string = '15 May 2026') {
  if (!d) return fallback;
  try {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return fallback;
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return fallback;
  }
}

export default async function InternVerificationPage({ params }: Props) {
  const { id } = await params;
  const cleanUpperId = id.toUpperCase().trim();
  let rosterMatch = AUTHORITATIVE_ROSTER[cleanUpperId] || AUTHORITATIVE_ROSTER[id];

  if (!rosterMatch && (cleanUpperId.startsWith('TT-APP') || cleanUpperId.startsWith('TT-INT') || cleanUpperId.startsWith('TTI') || cleanUpperId.startsWith('TT-STU'))) {
    const numMatch = cleanUpperId.match(/(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      if (!isNaN(num) && num > 0) {
        const padded4 = String(num).padStart(4, '0');
        const padded6 = String(num).padStart(6, '0');
        const aliasRefId = `TT-INT-2026-${padded4}`;
        const aliasInternId = `TTI${padded6}`;
        rosterMatch = AUTHORITATIVE_ROSTER[aliasRefId] || AUTHORITATIVE_ROSTER[aliasInternId] || AUTHORITATIVE_ROSTER[`TTI${String(num).padStart(4, '0')}`];
      }
    }
  }

  /** Wraps a Prisma promise with a timeout so a dead DB server doesn't stall the page. */
  async function safeQuery<T>(queryPromise: Promise<T>): Promise<T | null> {
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
      return await Promise.race([queryPromise, timeout]);
    } catch {
      return null;
    }
  }

  // 1. Query dedicated InternshipCertificate table first
  const rawInternCert = await safeQuery(
    prisma.internshipCertificate.findFirst({
      where: {
        OR: [
          { certificateNumber: id },
          { certificateNumber: cleanUpperId },
          { id: id },
        ],
      },
    })
  );

  let certMeta: any = {};
  let validInternCert: any = null;

  if (rawInternCert) {
    try {
      certMeta = typeof rawInternCert.metadata === 'string'
        ? JSON.parse(rawInternCert.metadata)
        : (rawInternCert.metadata || {});
    } catch {}
    validInternCert = rawInternCert;
  } else {
    // Fallback Query on Certificate table
    const rawCert = await safeQuery(
      prisma.certificate.findFirst({
        where: {
          OR: [
            { certificateNumber: id },
            { certificateNumber: cleanUpperId },
            { certificateId: id },
            { certificateId: cleanUpperId },
            { id: id },
          ],
        },
        include: { user: true },
      })
    );

    if (rawCert) {
      try {
        certMeta = typeof rawCert.metadata === 'string'
          ? JSON.parse(rawCert.metadata)
          : (rawCert.metadata || {});
      } catch {}

      if (isValidInternshipCertificate(rawCert, certMeta)) {
        validInternCert = rawCert;
      }
    }
  }

  // 2. Query ManagedIntern (strictly internship management records)
  let managedIntern: any = null;
  if (!validInternCert) {
    managedIntern = await safeQuery(
      prisma.managedIntern.findFirst({
        where: {
          OR: [
            { referenceNumber: id },
            { referenceNumber: cleanUpperId },
            { id: id },
            ...(rosterMatch ? [{ referenceNumber: rosterMatch.refId }] : []),
          ],
        },
        include: { user: true, application: true },
      })
    );
  }

  // 3. Query InternshipApplication (strictly internship applicant records)
  let internApp: any = null;
  if (!validInternCert && !managedIntern) {
    internApp = await safeQuery(
      prisma.internshipApplication.findFirst({
        where: {
          OR: [
            { id: id },
            { studentId: id },
            { paymentId: id },
            { orderId: id },
            ...(rosterMatch ? [{ email: rosterMatch.email }] : []),
          ],
        },
        include: { student: true },
      })
    );
  }

  // 4. Check if a published Letter of Recommendation exists for this intern (Server-side check)
  let hasPublishedLor = false;
  try {
    const allCertsForIntern = await safeQuery(
      prisma.internshipCertificate.findMany({
        where: {
          OR: [
            { certificateNumber: id },
            { certificateNumber: cleanUpperId },
            { id: id },
          ],
          status: { in: ['VALID', 'ACTIVE', 'ISSUED', 'PUBLISHED'] }
        },
        select: { id: true, title: true, metadata: true }
      })
    ) || await safeQuery(
      prisma.certificate.findMany({
        where: {
          OR: [
            { certificateNumber: id },
            { certificateNumber: cleanUpperId },
            { certificateId: id },
            { certificateId: cleanUpperId },
            { id: id },
          ],
          status: { in: ['VALID', 'ACTIVE', 'ISSUED', 'PUBLISHED'] }
        },
        select: { id: true, title: true, metadata: true }
      })
    );

    if (allCertsForIntern && allCertsForIntern.length > 0) {
      for (const cert of allCertsForIntern) {
        let m: any = {};
        try {
          m = typeof cert.metadata === 'string' ? JSON.parse(cert.metadata) : (cert.metadata || {});
        } catch {}

        if (
          m.documentType === 'LETTER_OF_RECOMMENDATION' ||
          m.format === 'LETTER_OF_RECOMMENDATION' ||
          (cert.title && cert.title.toLowerCase().includes('recommendation')) ||
          (cert.title && cert.title.toLowerCase().includes('lor'))
        ) {
          hasPublishedLor = true;
          break;
        }
      }
    }
  } catch (err) {
    console.warn('Error checking LOR availability (non-blocking):', err);
  }

  // Build the cert data object to pass to viewer
  let certData: {
    referenceId: string;
    recipientName: string;
    recipientCollege: string;
    internshipTrack: string;
    startDate: string;
    endDate: string;
    issueDate: string;
    customExposureBody?: string;
    performanceBody?: string;
    closingStatement?: string;
  } | null = null;

  if (validInternCert) {
    certData = {
      referenceId: certMeta.referenceId || validInternCert.certificateNumber || id,
      recipientName: (rosterMatch && certMeta.recipientName === 'Abhishek Raj Permani')
        ? rosterMatch.name
        : (certMeta.recipientName || rosterMatch?.name || validInternCert.user?.name || 'Verified Intern'),
      recipientCollege: (rosterMatch && certMeta.recipientCollege === 'IIT(ISM) Dhanbad' && rosterMatch.college !== 'IIT(ISM) Dhanbad')
        ? rosterMatch.college
        : (certMeta.recipientCollege || rosterMatch?.college || validInternCert.user?.college || 'University / College'),
      internshipTrack: certMeta.internshipTrack || rosterMatch?.track || validInternCert.title || 'Web Development',
      startDate: certMeta.startDate || rosterMatch?.startDate || '15 May 2026',
      endDate: certMeta.endDate || rosterMatch?.endDate || '30 June 2026',
      issueDate: certMeta.issueDate || '20 August 2026',
      customExposureBody: certMeta.customExposureBody,
      performanceBody: certMeta.performanceBody,
      closingStatement: certMeta.closingStatement,
    };
  } else if (managedIntern) {
    certData = {
      referenceId: managedIntern.referenceNumber || id,
      recipientName: managedIntern.fullName || managedIntern.user?.name || rosterMatch?.name || 'Verified Intern',
      recipientCollege: managedIntern.college || managedIntern.user?.college || managedIntern.application?.college || rosterMatch?.college || 'University / College',
      internshipTrack: managedIntern.domain || managedIntern.course || managedIntern.application?.internshipTrack || rosterMatch?.track || 'Web Development',
      startDate: formatDate(managedIntern.joiningDate, '15 May 2026'),
      endDate: formatDate(managedIntern.endDate, '30 June 2026'),
      issueDate: formatDate(managedIntern.createdAt, '20 August 2026'),
    };
  } else if (internApp) {
    certData = {
      referenceId: id,
      recipientName: internApp.name || internApp.student?.name || rosterMatch?.name || 'Verified Intern',
      recipientCollege: internApp.college || internApp.student?.college || rosterMatch?.college || 'University / College',
      internshipTrack: internApp.internshipTrack || internApp.domain || rosterMatch?.track || 'Web Development',
      startDate: formatDate(internApp.offerAcceptedAt || internApp.submittedAt, '15 May 2026'),
      endDate: formatDate(null, '30 June 2026'),
      issueDate: formatDate(internApp.reviewedAt || internApp.submittedAt, '20 August 2026'),
    };
  } else if (rosterMatch) {
    certData = {
      referenceId: rosterMatch.refId,
      recipientName: rosterMatch.name,
      recipientCollege: rosterMatch.college,
      internshipTrack: rosterMatch.track,
      startDate: rosterMatch.startDate || '15 May 2026',
      endDate: rosterMatch.endDate || '30 June 2026',
      issueDate: '20 August 2026',
    };
  }

  // Not found or not an internship credential → return the standard invalid UI
  if (!certData) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 400, background: 'white', borderRadius: 24, padding: 40, border: '2px solid rgba(239,68,68,0.1)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <XCircle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 16px' }} />
          <h1 style={{ color: '#1a3c2e', fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Invalid Internship Credential</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
            Internship Reference ID <span style={{ fontFamily: 'monospace', color: '#ef4444' }}>{id}</span> was not found in our live registry.
          </p>
          <Link href="/verify" style={{ display: 'inline-block', padding: '12px 28px', background: '#1a3c2e', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            Return to Registry
          </Link>
        </div>
      </div>
    );
  }

  // Gate on PENDING_PAYMENT (only applies when valid internship cert was found in DB)
  if (validInternCert) {
    const displayState = getCertificateDisplayState(validInternCert);
    if (displayState.isPendingPayment) {
      return (
        <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: 480, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h4 style={{ margin: '0 0 12px 0', color: '#b45309', fontSize: 18, fontWeight: 800 }}>
              Certificate License Activation Required
            </h4>
            <p style={{ margin: '0 0 8px', color: '#78350f', fontSize: 14, lineHeight: 1.6 }}>
              Certificate <code style={{ fontFamily: 'monospace' }}>{certData.referenceId}</code> is pending activation.
            </p>
            <Link href="/verify" style={{ display: 'inline-block', padding: '12px 24px', background: '#b45309', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              ← Back to Registry
            </Link>
          </div>
        </div>
      );
    }
  }

  // ✅ Render the official Internship Certificate Viewer
  return <InternVerifyViewer certData={certData} hasPublishedLor={hasPublishedLor} />;
}
