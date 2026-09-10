import { prisma } from '../lib/prisma';

// Authoritative 11 Active Intern Roster (AGENTS.md Rule 7)
const AUTHORITATIVE_ROSTER: Record<string, { name: string; email: string; college: string; track: string; refId: string; internId: string }> = {
  "TT-INT-2026-0001": { name: "Ranjan Singh", email: "ranjansingh.w@gmail.com", college: "IIT(ISM) Dhanbad", track: "Web Development", refId: "TT-INT-2026-0001", internId: "TTI000001" },
  "TT-INT-2026-0026": { name: "Jaanvi Nair", email: "nairjaanvi199@gmail.com", college: "IILM University", track: "Full Stack Web Development", refId: "TT-INT-2026-0026", internId: "TTI000026" },
  "TT-INT-2026-0038": { name: "Nandini Katiyar", email: "nandinikatiyar5@gmail.com", college: "IILM University", track: "Web Development", refId: "TT-INT-2026-0038", internId: "TTI000038" },
  "TT-INT-2026-0051": { name: "Pranshu Kumar Singh", email: "ps859521@gmail.com", college: "IIT(ISM) Dhanbad", track: "Full Stack Web Development", refId: "TT-INT-2026-0051", internId: "TTI000051" },
  "TT-INT-2026-0060": { name: "Surjo Banerjee", email: "surjobanerjee207@gmail.com", college: "IILM University", track: "Web Development", refId: "TT-INT-2026-0060", internId: "TTI000060" },
  "TT-INT-2026-0062": { name: "Keshav Kumar", email: "kumarkeshav10320@gmail.com", college: "IILM University", track: "Web Development", refId: "TT-INT-2026-0062", internId: "TTI000062" },
  "TT-INT-2026-0066": { name: "Keshav Ruhela", email: "keshavruhela25@gmail.com", college: "IILM University", track: "Web Development", refId: "TT-INT-2026-0066", internId: "TTI000066" },
  "TT-INT-2026-0083": { name: "Kumari Tejal", email: "kumaritejal535@gmail.com", college: "IILM University", track: "Full Stack Web Development", refId: "TT-INT-2026-0083", internId: "TTI000083" },
  "TT-INT-2026-0086": { name: "Aniket Dutta", email: "aniketdutta615@gmail.com", college: "IIT(ISM) Dhanbad", track: "Web Development", refId: "TT-INT-2026-0086", internId: "TTI000086" },
  "TT-INT-2026-0128": { name: "Nitin Sinha", email: "nitinsinha062@gmail.com", college: "IIT(ISM) Dhanbad", track: "Full Stack Web Development", refId: "TT-INT-2026-0128", internId: "TTI000128" },
  "TT-INT-2026-0150": { name: "Harsh Nayan", email: "harshnayan018@gmail.com", college: "IIT(ISM) Dhanbad", track: "Web Development", refId: "TT-INT-2026-0150", internId: "TTI000150" },
};

async function main() {
  console.log('Auditing Certificate DB Records vs Authoritative Roster...');

  const certs = await prisma.certificate.findMany();
  console.log(`Found ${certs.length} certificates in DB.`);

  for (const cert of certs) {
    const certNum = (cert.certificateNumber || cert.certificateId || '').toUpperCase();
    const rosterMatch = AUTHORITATIVE_ROSTER[certNum];

    let meta: any = {};
    try {
      meta = typeof cert.metadata === 'string' ? JSON.parse(cert.metadata) : (cert.metadata || {});
    } catch {}

    if (rosterMatch) {
      console.log(`Certificate ${certNum} -> DB Recipient: "${meta.recipientName || 'N/A'}", Roster Recipient: "${rosterMatch.name}"`);
      if (meta.recipientName && meta.recipientName !== rosterMatch.name) {
        console.log(`  updating DB record ${cert.id} to match roster name "${rosterMatch.name}"...`);
        const newMeta = {
          ...meta,
          recipientName: rosterMatch.name,
          recipientCollege: rosterMatch.college,
          internshipTrack: rosterMatch.track
        };
        await prisma.certificate.update({
          where: { id: cert.id },
          data: { metadata: JSON.stringify(newMeta) }
        });
        console.log(`  Updated ${certNum} successfully!`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
