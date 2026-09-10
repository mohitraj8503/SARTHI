import { prisma } from '../lib/prisma';

async function testStudentSearchAndLinking() {
  console.log('=== Step 1: Testing Student Search Queries against Real DB Data ===');

  // Search by partial name: "Mohit"
  const searchByName = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Mohit' } },
        { email: { contains: 'Mohit' } },
        { enrollmentNumber: { contains: 'Mohit' } },
        { studentId: { contains: 'Mohit' } }
      ]
    },
    select: { id: true, name: true, email: true, enrollmentNumber: true, studentId: true },
    take: 5
  });
  console.log('Search by Partial Name ("Mohit"):', searchByName);

  if (searchByName.length === 0) {
    throw new Error('No students found matching "Mohit"');
  }

  const testUser = searchByName[0];
  const testUserEmail = testUser.email;
  const testUserEnrollment = testUser.enrollmentNumber || testUser.studentId || testUser.id;

  // Search by exact/partial email
  const searchByEmail = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: testUserEmail } },
        { email: { contains: testUserEmail } },
        { enrollmentNumber: { contains: testUserEmail } },
        { studentId: { contains: testUserEmail } }
      ]
    },
    select: { id: true, name: true, email: true, enrollmentNumber: true, studentId: true },
    take: 5
  });
  console.log(`Search by Email ("${testUserEmail}"):`, searchByEmail);

  // Search by Enrollment ID
  const searchByEnrollment = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: testUserEnrollment } },
        { email: { contains: testUserEnrollment } },
        { enrollmentNumber: { contains: testUserEnrollment } },
        { studentId: { contains: testUserEnrollment } },
        { id: { contains: testUserEnrollment } }
      ]
    },
    select: { id: true, name: true, email: true, enrollmentNumber: true, studentId: true },
    take: 5
  });
  console.log(`Search by Enrollment ID ("${testUserEnrollment}"):`, searchByEnrollment);

  console.log('\n=== Step 2: Simulating Studio Certificate Issuance linked to User ===');
  const testCertId = `TT-PE-2026-TEST-${Math.floor(100000 + Math.random() * 900000)}`;

  const createdCert = await prisma.certificate.upsert({
    where: { certificateNumber: testCertId },
    update: {
      userId: testUser.id,
      title: 'Artificial Intelligence Certificate of Completion',
      issuedAt: new Date(),
      status: 'VALID',
      tier: 'PREMIUM',
      enrollmentId: testUserEnrollment,
      metadata: JSON.stringify({
        course_name: 'Artificial Intelligence Certificate of Completion',
        user_name: testUser.name,
        credential_id: testCertId,
        enrollment_id: testUserEnrollment
      })
    },
    create: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: testUser.id,
      title: 'Artificial Intelligence Certificate of Completion',
      issuedAt: new Date(),
      status: 'VALID',
      tier: 'PREMIUM',
      enrollmentId: testUserEnrollment,
      metadata: JSON.stringify({
        course_name: 'Artificial Intelligence Certificate of Completion',
        user_name: testUser.name,
        credential_id: testCertId,
        enrollment_id: testUserEnrollment
      })
    }
  });

  console.log('Issued Certificate Record Created:', createdCert);

  console.log('\n=== Step 3: Raw DB Verification Query for Foreign Key Linkage ===');
  const rawCertRow = await prisma.certificate.findUnique({
    where: { id: createdCert.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          enrollmentNumber: true,
          studentId: true,
          role: true
        }
      }
    }
  });

  console.log('Raw DB Query Result with User Foreign Key Relation:', rawCertRow);

  if (!rawCertRow || !rawCertRow.user || rawCertRow.userId !== testUser.id) {
    throw new Error('FAILED: Certificate row userId FK mismatch!');
  }
  console.log('✓ VERIFIED: Certificate has non-null userId matching real User row ID:', rawCertRow.user.id);

  console.log('\n=== Step 4: Verifying Student Dashboard Grades API Output ===');
  const studioCerts = await prisma.certificate.findMany({
    where: { userId: testUser.id },
    orderBy: { issuedAt: 'desc' }
  });

  const foundInUserCerts = studioCerts.find(c => c.certificateNumber === testCertId || c.certificateId === testCertId);
  console.log('Found Issued Certificate in Student Dashboard Query Output:', foundInUserCerts);

  if (!foundInUserCerts) {
    throw new Error('FAILED: Issued certificate not found in student dashboard query!');
  }
  console.log('✓ VERIFIED: Issued certificate appears in Student Grades / Achievements payload!');
}

testStudentSearchAndLinking()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
