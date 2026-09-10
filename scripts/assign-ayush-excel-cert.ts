import { PrismaClient } from '@prisma/client';
import { generateCertificateHash } from '../lib/certificates';
import { captureCertificateSnapshot } from '../lib/certificate/captureCertificateSnapshot';

const prisma = new PrismaClient();

async function main() {
  console.log('=== ASSIGNING & ACTIVATING EXCEL CERTIFICATE FOR AYUSH KUMAR SINGH ===\n');

  const email = 'Ayushkumarsharma8051@gmail.com';
  const fullName = 'Ayush Kumar Singh';
  const certNumber = 'TT-EX-2026-0002';
  const courseTitle = 'Advance Excel & Data Analytics Certificate';
  const specName = 'Excel Data Analytics & Financial Modeling';

  // 1. Find or update user
  let user = await prisma.user.findFirst({
    where: {
      email: { equals: email }
    }
  });

  const enrollmentNo = user?.enrollmentNumber || 'TT-STU-0134';

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: fullName,
        status: 'ACTIVE',
        enrollmentNumber: enrollmentNo,
        emailVerified: user.emailVerified || new Date()
      }
    });
    console.log(`✅ User updated: ${user.name} (${user.id}, ${user.email}, ${user.enrollmentNumber})`);
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        enrollmentNumber: enrollmentNo,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: new Date()
      }
    });
    console.log(`✅ User created: ${user.name} (${user.id}, ${user.email}, ${user.enrollmentNumber})`);
  }

  // 2. Find Course
  const excelCourse = await prisma.course.findFirst({
    where: {
      OR: [
        { title: { contains: 'Excel' } },
        { slug: { contains: 'excel' } }
      ]
    }
  });
  const validCourseId = excelCourse?.id || null;
  console.log(`Course resolved: ${excelCourse?.title || 'None'} (ID: ${validCourseId})`);

  // 3. Ensure Enrollment & Transaction
  if (validCourseId) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: validCourseId
        }
      },
      update: {
        status: 'ACTIVE',
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId: user.id,
        courseId: validCourseId,
        status: 'ACTIVE',
        completed: true,
        completedAt: new Date()
      }
    });
    console.log('✅ Course Enrollment created/activated.');
  }

  // 4. Create/Upsert Certificate in `certificates` table
  const templateConfig = {
    mainTitle: 'ADVANCE EXCEL & DATA ANALYTICS CERTIFICATE',
    subTitle: 'OF COMPLETION',
    certifiesText: 'THIS CERTIFIES THAT',
    courseName: 'Advance Excel & Data Analytics',
    specialization: specName,
    brandName: 'SARTHI',
    tagline: 'INNOVATE TODAY',
    directorName: 'Dr. Mukul Pandey',
    directorTitle: 'CEO & FOUNDER',
    completionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  };

  const metadata = JSON.stringify({
    course_name: courseTitle,
    user_name: user.name,
    credential_id: certNumber,
    enrollment_id: user.enrollmentNumber,
    paymentStatus: 'PAID',
    templateConfig
  });

  const certificateHash = generateCertificateHash(user.name!, courseTitle, new Date(), certNumber);

  const cert = await prisma.certificate.upsert({
    where: { certificateNumber: certNumber },
    update: {
      userId: user.id,
      courseId: validCourseId,
      title: courseTitle,
      issuedAt: new Date(),
      status: 'VALID',
      tier: 'PREMIUM',
      enrollmentId: user.enrollmentNumber,
      metadata,
      certificateHash
    },
    create: {
      certificateNumber: certNumber,
      certificateId: certNumber,
      userId: user.id,
      courseId: validCourseId,
      title: courseTitle,
      issuedAt: new Date(),
      status: 'VALID',
      tier: 'PREMIUM',
      enrollmentId: user.enrollmentNumber,
      metadata,
      certificateHash
    }
  });

  console.log('✅ Certificate persisted in `certificates` table:', {
    id: cert.id,
    certificateNumber: cert.certificateNumber,
    user: user.name,
    status: cert.status
  });

  // 5. Ensure Certification model if available for IssuedCertificate
  let certification = await prisma.certification.findFirst({
    where: {
      OR: [
        { title: { contains: 'Excel' } },
        { slug: { contains: 'excel' } }
      ]
    }
  });

  if (!certification) {
    certification = await prisma.certification.findFirst();
  }

  if (certification) {
    await prisma.issuedCertificate.upsert({
      where: { verificationId: certNumber },
      update: {
        userId: user.id,
        certificationId: certification.id,
        certificateUrl: `/verify/${certNumber}`,
        score: 100,
        status: 'VALID',
        certificateHash
      },
      create: {
        userId: user.id,
        certificationId: certification.id,
        certificateUrl: `/verify/${certNumber}`,
        verificationId: certNumber,
        score: 100,
        status: 'VALID',
        certificateHash
      }
    });
    console.log('✅ IssuedCertificate created in `issued_certificates_v2` table.');
  }

  // 6. Capture Snapshot & Generate PDF/Images
  console.log('\nCapturing HTML snapshot & rendering artifacts...');
  const artifacts = await captureCertificateSnapshot({
    certificateNumber: certNumber,
    studentName: user.name!,
    courseName: 'Advance Excel & Data Analytics',
    specialization: specName,
    issueDate: new Date().toLocaleDateString('en-GB'),
    templateConfig,
    userId: user.id,
    courseId: validCourseId || undefined
  });

  console.log('✅ Snapshot & Artifacts Generated:', {
    hasHtmlSnapshot: !!artifacts.htmlSnapshot,
    pdfUrl: artifacts.pdfUrl,
    imageUrl: artifacts.imageUrl
  });

  // 7. Verify via Raw SQL Query
  console.log('\n--- RAW DB QUERY PROOF ---');
  const dbRows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, certificateNumber, userId, enrollmentId, title, status, issuedAt FROM certificates WHERE certificateNumber = ?`,
    certNumber
  );
  console.log(JSON.stringify(dbRows, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Error assigning certificate:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
