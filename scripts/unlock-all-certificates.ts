import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- Unlocking all certificates & ensuring TT-EX records exist ---');

  // 1. Update all PENDING_PAYMENT / non-VALID certificates in IssuedCertificate to VALID
  const updatedIssued = await prisma.issuedCertificate.updateMany({
    where: { status: { not: 'VALID' } },
    data: { status: 'VALID' }
  });
  console.log(`Updated ${updatedIssued.count} IssuedCertificate records to status 'VALID'.`);

  // 2. Update all PENDING_PAYMENT / non-VALID certificates in Certificate table to VALID
  const updatedCerts = await prisma.certificate.updateMany({
    where: { status: { not: 'VALID' } },
    data: { status: 'VALID' }
  });
  console.log(`Updated ${updatedCerts.count} Certificate records to status 'VALID'.`);

  // 3. Ensure TT-EX-2026-0002 exists in IssuedCertificate
  const ayushUser = await prisma.user.findFirst({
    where: { OR: [{ id: 'cmqmjmxo2000913c8hn9epgmr' }, { email: 'sharmaayush5644@gmail.com' }] }
  });
  if (ayushUser) {
    await prisma.issuedCertificate.upsert({
      where: { verificationId: 'TT-EX-2026-0002' },
      update: { status: 'VALID' },
      create: {
        id: 'tt-ex-2026-0002-db-record',
        userId: ayushUser.id,
        certificationId: 'advanced-excel-certification-exam',
        certificateUrl: '/verify/TT-EX-2026-0002',
        verificationId: 'TT-EX-2026-0002',
        score: 97,
        issuedAt: new Date('2026-05-08T00:00:00Z'),
        status: 'VALID'
      }
    });
    console.log('Ensured TT-EX-2026-0002 for Ayush Kumar Sharma in IssuedCertificate.');
  }

  // 4. Ensure TT-EX-2026-0003 exists in IssuedCertificate
  const dhanlaxmiUser = await prisma.user.findFirst({
    where: { OR: [{ id: 'cmsetpdc00001fdwfhptf0e6w' }, { email: 'dhanlaxmibagoriya21@gmail.com' }] }
  });
  const pranshuUser = await prisma.user.findFirst({
    where: { OR: [{ id: 'cmqj9wk8b000013tq5nc30hqw' }, { email: 'ps859521@gmail.com' }] }
  });
  if (pranshuUser) {
    await prisma.issuedCertificate.upsert({
      where: { verificationId: 'TT-EX-2026-0003' },
      update: { userId: pranshuUser.id, status: 'VALID' },
      create: {
        id: 'tt-ex-2026-0003-db-record',
        userId: pranshuUser.id,
        certificationId: 'advanced-excel-certification-exam',
        certificateUrl: '/verify/TT-EX-2026-0003',
        verificationId: 'TT-EX-2026-0003',
        score: 97,
        issuedAt: new Date('2026-08-05T13:00:10Z'),
        status: 'VALID'
      }
    });
    console.log('Ensured TT-EX-2026-0003 for Pranshu Kumar Singh in IssuedCertificate.');
  }

  // 5. Ensure TT-EX-2026-0004 exists in IssuedCertificate
  if (dhanlaxmiUser) {
    await prisma.issuedCertificate.upsert({
      where: { verificationId: 'TT-EX-2026-0004' },
      update: { userId: dhanlaxmiUser.id, status: 'VALID' },
      create: {
        id: 'tt-ex-2026-0004-db-record',
        userId: dhanlaxmiUser.id,
        certificationId: 'advanced-excel-certification-exam',
        certificateUrl: '/verify/TT-EX-2026-0004',
        verificationId: 'TT-EX-2026-0004',
        score: 95,
        issuedAt: new Date('2026-08-08T10:00:00Z'),
        status: 'VALID'
      }
    });
    console.log('Ensured TT-EX-2026-0004 for Dhanlaxmi Naresh Bagoria in IssuedCertificate.');
  }

  console.log('--- Certificate unlocking completed successfully ---');
}

main()
  .catch((e) => {
    console.error('Error unlocking certificates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
