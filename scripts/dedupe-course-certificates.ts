/**
 * Audits, then (only with --apply) merges duplicate course/path certificates.
 * This is intentionally generic: never create a one-off script for a student.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

type Candidate = {
  id: string; userId: string; courseId: string | null; certificateNumber: string;
  status: string; issuedAt: Date; htmlSnapshot: string | null; imageUrl: string | null;
  pdfUrl: string | null; metadata: string | null;
};

function logicalKey(cert: Candidate) {
  try {
    const pathSlug = JSON.parse(cert.metadata || '{}').path_slug;
    if (pathSlug) return `${cert.userId}:path:${pathSlug}`;
  } catch { /* malformed metadata is reported under its physical key */ }
  return `${cert.userId}:course:${cert.courseId || 'none'}`;
}

function rank(cert: Candidate) {
  return (cert.status === 'VALID' ? 100 : 0) + (cert.htmlSnapshot ? 10 : 0) +
    (cert.imageUrl ? 2 : 0) + (cert.pdfUrl ? 1 : 0);
}

async function main() {
  const certificates = await prisma.certificate.findMany({
    select: {
      id: true, userId: true, courseId: true, certificateNumber: true, status: true,
      issuedAt: true, htmlSnapshot: true, imageUrl: true, pdfUrl: true, metadata: true,
    },
    orderBy: { issuedAt: 'asc' },
  });
  const groups = new Map<string, Candidate[]>();
  for (const certificate of certificates) {
    const key = logicalKey(certificate);
    groups.set(key, [...(groups.get(key) || []), certificate]);
  }
  const duplicates = [...groups.entries()].filter(([, records]) => records.length > 1);

  console.table(duplicates.flatMap(([key, records]) => records.map(record => ({
    logicalKey: key, certificateNumber: record.certificateNumber, status: record.status,
    courseId: record.courseId, hasSnapshot: !!record.htmlSnapshot,
  }))));
  console.log(`Duplicate logical completions: ${duplicates.length}`);
  if (!apply) {
    console.log('Dry run only. Re-run with --apply after reviewing this report.');
    return;
  }

  for (const [, records] of duplicates) {
    const ordered = [...records].sort((a, b) => rank(b) - rank(a) || a.issuedAt.getTime() - b.issuedAt.getTime());
    const [canonical, ...redundant] = ordered;
    const richest = ordered.find(record => record.htmlSnapshot || record.imageUrl || record.pdfUrl);
    await prisma.$transaction([
      prisma.certificate.update({
        where: { id: canonical.id },
        data: {
          status: canonical.status === 'VALID' ? 'VALID' : (richest?.status || canonical.status),
          htmlSnapshot: canonical.htmlSnapshot || richest?.htmlSnapshot || null,
          imageUrl: canonical.imageUrl || richest?.imageUrl || null,
          pdfUrl: canonical.pdfUrl || richest?.pdfUrl || null,
        },
      }),
      ...redundant.map(record => prisma.certificate.delete({ where: { id: record.id } })),
    ]);
    console.log(`Kept ${canonical.certificateNumber}; removed ${redundant.map(r => r.certificateNumber).join(', ')}`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
