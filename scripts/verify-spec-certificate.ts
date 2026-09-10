import { PrismaClient } from '@prisma/client';
import { generateCredentialId } from '../lib/certificates';
import { captureCertificateSnapshot } from '../lib/certificate/captureCertificateSnapshot';

const prisma = new PrismaClient();

async function main() {
  console.log('=== CERTIFICATE STUDIO VERIFICATION RUN ===\n');

  // 1. Resolve or create test student (Dhanlaxmi Naresh Bagoria / TT-STU-0133)
  const studentEmail = 'dhanlaxmibagoriya21@gmail.com';
  const enrollmentNo = 'TT-STU-0133';
  const studentName = 'Dhanlaxmi Naresh Bagoria';

  let student = await prisma.user.findFirst({
    where: {
      OR: [
        { enrollmentNumber: enrollmentNo },
        { email: studentEmail }
      ]
    }
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        email: studentEmail,
        name: studentName,
        enrollmentNumber: enrollmentNo,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: new Date()
      }
    });
    console.log(`✅ Created test student user: ${student.name} (${student.id}, ${student.enrollmentNumber})`);
  } else {
    console.log(`✅ Found existing test student user: ${student.name} (${student.id}, ${student.enrollmentNumber})`);
  }

  // 2. Generate standardized credential ID
  const courseTitle = 'Advance Excel & Data Analytics';
  const certId = generateCredentialId(courseTitle);
  console.log(`\nGenerated Certificate ID: ${certId}`);

  // 3. Issue certificate and write directly to Prisma Certificate model
  const metadata = JSON.stringify({
    course_name: courseTitle,
    user_name: student.name,
    credential_id: certId,
    enrollment_id: student.enrollmentNumber,
    templateConfig: {
      mainTitle: 'ADVANCE EXCEL & DATA ANALYTICS CERTIFICATE',
      subTitle: 'OF COMPLETION',
      certifiesText: 'THIS CERTIFIES THAT',
      courseName: courseTitle,
      specialization: 'Excel Data Analytics & Dashboarding',
      directorName: 'Dr. Mukul Pandey',
      directorTitle: 'CEO & FOUNDER'
    }
  });

  const createdCert = await prisma.certificate.upsert({
    where: { certificateNumber: certId },
    update: {
      userId: student.id,
      title: courseTitle,
      issuedAt: new Date(),
      status: 'VALID',
      tier: 'PREMIUM',
      enrollmentId: student.enrollmentNumber,
      metadata
    },
    create: {
      certificateNumber: certId,
      certificateId: certId,
      userId: student.id,
      title: courseTitle,
      issuedAt: new Date(),
      status: 'VALID',
      tier: 'PREMIUM',
      enrollmentId: student.enrollmentNumber,
      metadata
    }
  });

  console.log('✅ Certificate persisted in `certificates` table:');
  console.log({
    id: createdCert.id,
    certificateNumber: createdCert.certificateNumber,
    userId: createdCert.userId,
    enrollmentId: createdCert.enrollmentId,
    status: createdCert.status
  });

  // 4. Capture snapshot & sync artifacts
  console.log('\nCapturing HTML snapshot & syncing artifacts...');
  const artifacts = await captureCertificateSnapshot({
    certificateNumber: certId,
    studentName: student.name || 'Student',
    courseName: courseTitle,
    issueDate: new Date().toLocaleDateString('en-GB'),
    templateConfig: {
      mainTitle: 'ADVANCE EXCEL & DATA ANALYTICS CERTIFICATE',
      courseName: courseTitle,
      specialization: 'Excel Data Analytics & Dashboarding',
      directorName: 'Dr. Mukul Pandey',
      directorTitle: 'CEO & FOUNDER'
    },
    userId: student.id
  });

  console.log('✅ Captured Snapshot Result:', {
    hasHtmlSnapshot: !!artifacts.htmlSnapshot,
    pdfUrl: artifacts.pdfUrl,
    imageUrl: artifacts.imageUrl
  });

  // 5. Query Raw MySQL DB using Prisma $queryRaw to prove row existence in `certificates`
  console.log('\n--- RAW DB QUERY PROOF ---');
  const rawRows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, certificateNumber, userId, enrollmentId, title, status, issuedAt FROM certificates WHERE certificateNumber = ?`,
    certId
  );
  console.log('Raw SQL query result (SELECT * FROM certificates WHERE certificateNumber = ...):');
  console.log(JSON.stringify(rawRows, null, 2));

  // 6. List last 5 issued certificate numbers to prove format consistency
  console.log('\n--- LAST 5 ISSUED CERTIFICATE NUMBERS IN DB ---');
  const recentCerts = await prisma.certificate.findMany({
    take: 5,
    orderBy: { issuedAt: 'desc' },
    select: {
      certificateNumber: true,
      title: true,
      issuedAt: true,
      user: { select: { name: true, email: true } }
    }
  });
  console.log(JSON.stringify(recentCerts, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Error during verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
