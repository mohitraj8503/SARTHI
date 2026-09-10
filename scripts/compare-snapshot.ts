#!/usr/bin/env tsx
import { prisma } from '../lib/prisma';
import { buildCertificateHtmlSnapshot } from '../lib/certificate/captureCertificateSnapshot';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) {
    console.error('Usage: npx tsx scripts/compare-snapshot.ts <certificateId> [moreIds...]');
    process.exit(1);
  }

  for (const id of ids) {
    console.log(`\n--- Comparing snapshot for: ${id}`);
    // Try multiple tables
    let cert: any = null;
    try {
      cert = await prisma.certificate.findFirst({ where: { OR: [{ certificateNumber: id }, { id }, { certificateId: id }] }, include: { user: true } });
    } catch (e) {}
    if (!cert) {
      try {
        cert = await prisma.issuedCertificate.findFirst({ where: { OR: [{ verificationId: id }, { id }] }, include: { user: true, certification: true } });
      } catch (e) {}
    }

    if (!cert) {
      console.error(`  ✖ Certificate ${id} not found in DB`);
      continue;
    }

    const stored = cert.htmlSnapshot || null;
    const meta = cert.metadata ? JSON.parse(cert.metadata) : {};
    const templateConfig = cert.templateConfig || meta?.templateConfig || null;
    const studentName = cert.user?.name || meta?.user_name || 'Student';
    const courseName = meta?.course_name || (cert.course?.title) || (cert.certification?.title) || (templateConfig?.courseName) || 'Professional Certification';
    const issueDate = (cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-GB') : (templateConfig?.completionDate || undefined));

    const rebuilt = buildCertificateHtmlSnapshot({
      certificateNumber: id,
      studentName,
      courseName,
      issueDate,
      templateConfig
    });

    if (!stored) {
      console.warn('  ⚠ No stored htmlSnapshot found — verify page will fallback to image or placeholder.');
    }

    const tmpDir = path.join(process.cwd(), 'tmp', 'cert-compare');
    fs.mkdirSync(tmpDir, { recursive: true });
    const storedFile = path.join(tmpDir, `${id}.stored.html`);
    const rebuiltFile = path.join(tmpDir, `${id}.rebuilt.html`);
    fs.writeFileSync(storedFile, stored || '<!-- NO STORED SNAPSHOT -->');
    fs.writeFileSync(rebuiltFile, rebuilt);

    try {
      const diff = execSync(`diff -u ${storedFile} ${rebuiltFile}`, { encoding: 'utf8' });
      if (!diff) {
        console.log('  ✓ Snapshots are identical');
      } else {
        console.log('  ✖ Snapshots differ — showing unified diff:\n');
        console.log(diff);
      }
    } catch (err: any) {
      if (err.status === 1) {
        // diff returns exit code 1 when files differ and prints the diff to stdout
        console.log('  ✖ Snapshots differ — showing unified diff:\n');
        console.log(err.stdout || err.message);
      } else {
        console.error('  Error running diff:', err.message || err);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
