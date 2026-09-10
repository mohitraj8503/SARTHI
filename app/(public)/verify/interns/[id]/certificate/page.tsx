import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { isValidInternshipCertificate } from "@/lib/certificate/internshipGuardrail";
import CertificateFullPageClient from "./CertificateFullPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

// Authoritative Roster — synced with Real DB Dates & AGENTS.md Rule 7
const AUTHORITATIVE_ROSTER: Record<string, {
  name: string; college: string; track: string; refId: string; startDate?: string; endDate?: string;
}> = {
  "TT-INT-2026-0001": { name: "Ranjan Singh", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0001", startDate: "17 August 2026", endDate: "17 September 2026" },
  "TTI000001":        { name: "Ranjan Singh", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0001", startDate: "17 August 2026", endDate: "17 September 2026" },

  "TT-INT-2026-0026": { name: "Jaanvi Nair", college: "SIES College of Arts, Science and Commerce, Mumbai", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0026", startDate: "27 July 2026", endDate: "27 August 2026" },
  "TTI000026":        { name: "Jaanvi Nair", college: "SIES College of Arts, Science and Commerce, Mumbai", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0026", startDate: "27 July 2026", endDate: "27 August 2026" },

  "TT-INT-2026-0038": { name: "Nandini Katiyar", college: "PSIT College of Higher Education, Kanpur", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0038", startDate: "27 July 2026", endDate: "27 August 2026" },
  "TTI000038":        { name: "Nandini Katiyar", college: "PSIT College of Higher Education, Kanpur", track: "Digital Marketing & Social Media", refId: "TT-INT-2026-0038", startDate: "27 July 2026", endDate: "27 August 2026" },

  "TT-INT-2026-0051": { name: "Pranshu Kumar Singh", college: "Arka Jain University", track: "Full Stack Web Development", refId: "TT-INT-2026-0051", startDate: "5 July 2026", endDate: "5 August 2026" },
  "TTI000051":        { name: "Pranshu Kumar Singh", college: "Arka Jain University", track: "Full Stack Web Development", refId: "TT-INT-2026-0051", startDate: "5 July 2026", endDate: "5 August 2026" },

  "TT-INT-2026-0060": { name: "Surjo Banerjee", college: "Arka Jain University", track: "Video Editing & Reels Production", refId: "TT-INT-2026-0060", startDate: "4 August 2026", endDate: "4 September 2026" },
  "TTI000060":        { name: "Surjo Banerjee", college: "Arka Jain University", track: "Video Editing & Reels Production", refId: "TT-INT-2026-0060", startDate: "4 August 2026", endDate: "4 September 2026" },

  "TT-INT-2026-0062": { name: "Keshav Kumar", college: "Arka Jain University", track: "Creative Writing", refId: "TT-INT-2026-0062", startDate: "5 July 2026", endDate: "5 August 2026" },
  "TTI000062":        { name: "Keshav Kumar", college: "Arka Jain University", track: "Creative Writing", refId: "TT-INT-2026-0062", startDate: "5 July 2026", endDate: "5 August 2026" },

  "TT-INT-2026-0066": { name: "Keshav Ruhela", college: "IILM University, Greater Noida", track: "Web Development", refId: "TT-INT-2026-0066", startDate: "17 August 2026", endDate: "17 September 2026" },
  "TTI000066":        { name: "Keshav Ruhela", college: "IILM University, Greater Noida", track: "Web Development", refId: "TT-INT-2026-0066", startDate: "17 August 2026", endDate: "17 September 2026" },

  "TT-INT-2026-0083": { name: "Kumari Tejal", college: "Arka Jain University", track: "Graphic Design", refId: "TT-INT-2026-0083", startDate: "19 August 2026", endDate: "19 September 2026" },
  "TTI000083":        { name: "Kumari Tejal", college: "Arka Jain University", track: "Graphic Design", refId: "TT-INT-2026-0083", startDate: "19 August 2026", endDate: "19 September 2026" },

  "TT-INT-2026-0086": { name: "Aniket Dutta", college: "Arka Jain University", track: "Content Creation", refId: "TT-INT-2026-0086", startDate: "19 August 2026", endDate: "19 September 2026" },
  "TTI000086":        { name: "Aniket Dutta", college: "Arka Jain University", track: "Content Creation", refId: "TT-INT-2026-0086", startDate: "19 August 2026", endDate: "19 September 2026" },

  "TT-INT-2026-0128": { name: "Nitin Sinha", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0128", startDate: "5 August 2026", endDate: "5 September 2026" },
  "TTI000128":        { name: "Nitin Sinha", college: "Arka Jain University", track: "Web Development", refId: "TT-INT-2026-0128", startDate: "5 August 2026", endDate: "5 September 2026" },

  "TT-INT-2026-0150": { name: "Harsh Nayan", college: "Arka Jain University", track: "Software Development", refId: "TT-INT-2026-0150", startDate: "19 August 2026", endDate: "19 September 2026" },
  "TTI000150":        { name: "Harsh Nayan", college: "Arka Jain University", track: "Software Development", refId: "TT-INT-2026-0150", startDate: "19 August 2026", endDate: "19 September 2026" },
};

export default async function CertificateFullPage({ params }: Props) {
  const { id } = await params;
  const cleanUpperId = id.toUpperCase().trim();
  const match = AUTHORITATIVE_ROSTER[cleanUpperId] || AUTHORITATIVE_ROSTER[id];

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

  /** Wraps a Prisma promise with a 5-second timeout so a dead DB server doesn't stall the page. */
  async function safeQuery<T>(queryPromise: Promise<T>): Promise<T | null> {
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
      return await Promise.race([queryPromise, timeout]);
    } catch {
      return null;
    }
  }

  // 1. Try dedicated InternshipCertificate table first
  const rawInternCert = await safeQuery(
    prisma.internshipCertificate.findFirst({
      where: {
        OR: [
          { certificateNumber: id },
          { certificateNumber: cleanUpperId },
          { id }
        ]
      },
    })
  );

  if (rawInternCert) {
    let meta: any = {};
    try { meta = typeof rawInternCert.metadata === 'string' ? JSON.parse(rawInternCert.metadata) : (rawInternCert.metadata || {}); } catch {}
    certData = {
      referenceId:        meta.referenceId || rawInternCert.certificateNumber || id,
      recipientName:      meta.recipientName || match?.name || 'Verified Intern',
      recipientCollege:   meta.recipientCollege || match?.college || 'University',
      internshipTrack:    meta.internshipTrack || match?.track || rawInternCert.title || 'Web Development',
      startDate:          meta.startDate || match?.startDate || '15 May 2026',
      endDate:            meta.endDate || match?.endDate || '30 June 2026',
      issueDate:          meta.issueDate || '20 August 2026',
      customExposureBody: meta.customExposureBody,
      performanceBody:    meta.performanceBody,
      closingStatement:   meta.closingStatement,
    };
  }

  // 2. Fallback to Certificate table if needed
  if (!certData) {
    const rawCert = await safeQuery(
      prisma.certificate.findFirst({
        where: {
          OR: [
            { certificateNumber: id },
            { certificateNumber: cleanUpperId },
            { certificateId: id },
            { certificateId: cleanUpperId },
            { id }
          ]
        },
        include: { user: true },
      })
    );

    if (rawCert) {
      let meta: any = {};
      try { meta = typeof rawCert.metadata === 'string' ? JSON.parse(rawCert.metadata) : (rawCert.metadata || {}); } catch {}
      
      if (isValidInternshipCertificate(rawCert, meta)) {
        certData = {
          referenceId:        meta.referenceId || (rawCert as any).certificateNumber || id,
          recipientName:      meta.recipientName || match?.name || rawCert.user?.name || 'Verified Intern',
          recipientCollege:   meta.recipientCollege || match?.college || rawCert.user?.college || 'University',
          internshipTrack:    meta.internshipTrack || match?.track || (rawCert as any).title || 'Web Development',
          startDate:          meta.startDate || match?.startDate || '15 May 2026',
          endDate:            meta.endDate || match?.endDate || '30 June 2026',
          issueDate:          meta.issueDate || '20 August 2026',
          customExposureBody: meta.customExposureBody,
          performanceBody:    meta.performanceBody,
          closingStatement:   meta.closingStatement,
        };
      }
    }
  }

  // Roster fallback
  if (!certData) {
    if (match) {
      certData = {
        referenceId:      match.refId,
        recipientName:    match.name,
        recipientCollege: match.college,
        internshipTrack:  match.track,
        startDate:        match.startDate || '15 May 2026',
        endDate:          match.endDate || '30 June 2026',
        issueDate:        '20 August 2026',
      };
    }
  }

  if (!certData) return notFound();

  return <CertificateFullPageClient certData={certData} />;
}
