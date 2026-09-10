import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RecommendationFullPageClient from "./RecommendationFullPageClient";
import Link from "next/link";
import { XCircle } from "lucide-react";

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

export default async function RecommendationFullPage({ params }: Props) {
  const { id } = await params;
  const cleanUpperId = id.toUpperCase().trim();
  const rosterMatch = AUTHORITATIVE_ROSTER[cleanUpperId] || AUTHORITATIVE_ROSTER[id];

  /** Wraps a Prisma promise with a 5-second timeout */
  async function safeQuery<T>(queryPromise: Promise<T>): Promise<T | null> {
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
      return await Promise.race([queryPromise, timeout]);
    } catch {
      return null;
    }
  }

  // Find all certificates associated with this reference number
  const certs = await safeQuery(
    prisma.certificate.findMany({
      where: {
        OR: [
          { certificateNumber: id },
          { certificateNumber: cleanUpperId },
          { certificateId: id },
          { certificateId: cleanUpperId },
          { id }
        ],
        status: { in: ['VALID', 'ACTIVE', 'ISSUED', 'PUBLISHED'] }
      },
      include: { user: true }
    })
  );

  // Find published LOR document record
  let lorCertRecord: any = null;
  let parsedMeta: any = {};

  if (certs && certs.length > 0) {
    for (const c of certs) {
      let m: any = {};
      try {
        m = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : (c.metadata || {});
      } catch {}

      if (
        m.documentType === 'LETTER_OF_RECOMMENDATION' ||
        m.format === 'LETTER_OF_RECOMMENDATION' ||
        (c.title && c.title.toLowerCase().includes('recommendation')) ||
        (c.title && c.title.toLowerCase().includes('lor'))
      ) {
        lorCertRecord = c;
        parsedMeta = m;
        break;
      }
    }
  }

  // If no published LOR found in DB, return clean 404
  if (!lorCertRecord) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 420, background: 'white', borderRadius: 24, padding: 40, border: '2px solid rgba(239,68,68,0.1)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <XCircle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 16px' }} />
          <h1 style={{ color: '#1a3c2e', fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Letter of Recommendation Unavailable</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
            No active published Letter of Recommendation was found for Intern Reference ID <span style={{ fontFamily: 'monospace', color: '#1B365D', fontWeight: 'bold' }}>{id}</span>.
          </p>
          <Link href={`/verify/interns/${encodeURIComponent(id)}`} style={{ display: 'inline-block', padding: '12px 28px', background: '#1B365D', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            ← Back to Verification
          </Link>
        </div>
      </div>
    );
  }

  const lorData = {
    referenceId: parsedMeta.referenceId || lorCertRecord.certificateNumber || id,
    recipientName: parsedMeta.recipientName || rosterMatch?.name || lorCertRecord.user?.name || 'Verified Intern',
    recipientCollege: parsedMeta.recipientCollege || rosterMatch?.college || lorCertRecord.user?.college || 'University / College',
    internshipTrack: parsedMeta.internshipTrack || rosterMatch?.track || 'Web Development',
    startDate: parsedMeta.startDate || rosterMatch?.startDate || '15 May 2026',
    endDate: parsedMeta.endDate || rosterMatch?.endDate || '30 June 2026',
    issueDate: parsedMeta.issueDate || '20 August 2026',
    projectSummary: parsedMeta.projectSummary,
    performanceParagraph: parsedMeta.performanceParagraph,
    contributionParagraph: parsedMeta.contributionParagraph,
    recommendationStatement: parsedMeta.recommendationStatement,
    ceoName: parsedMeta.ceoName || 'Dr. Mukul Pandey',
    ceoDesignation: parsedMeta.ceoDesignation || 'CEO & Founder',
  };

  return <RecommendationFullPageClient lorData={lorData} />;
}
