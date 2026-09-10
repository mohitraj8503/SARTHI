const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ankit250114@arkajainuniversity.ac.in';
  const slug = 'advanced-excel-certification-exam';
  
  console.log(`Searching for user: ${email}...`);
  let user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    process.exit(1);
  }
  
  // Update name to 'Ankit Topno'
  user = await prisma.user.update({
    where: { email },
    data: { name: 'Ankit Topno' }
  });
  console.log(`Found User (updated): ${user.name} (ID: ${user.id})`);
  
  console.log(`Searching for certification: ${slug}...`);
  const cert = await prisma.certification.findUnique({
    where: { slug }
  });
  
  if (!cert) {
    console.error(`❌ Certification not found with slug: ${slug}`);
    process.exit(1);
  }
  console.log(`Found Certification: ${cert.title} (ID: ${cert.id})`);
  
  // 1. Clean up any existing attempt or certificate to avoid duplicate key errors
  console.log('Cleaning up existing attempts or certificates for this user and certification...');
  await prisma.issuedCertificate.deleteMany({
    where: {
      userId: user.id,
      certificationId: cert.id
    }
  });
  await prisma.userCertification.deleteMany({
    where: {
      userId: user.id,
      certificationId: cert.id
    }
  });
  await prisma.certificationAttempt.deleteMany({
    where: {
      userId: user.id,
      certificationId: cert.id
    }
  });
  
  // 2. Create a mock attempt
  const attemptId = `mock-attempt-${Date.now()}`;
  console.log(`Creating CertificationAttempt...`);
  const attempt = await prisma.certificationAttempt.create({
    data: {
      id: attemptId,
      userId: user.id,
      certificationId: cert.id,
      score: 92,
      passed: true,
      answers: '[]',
      status: 'COMPLETED',
      completedAt: new Date(),
      startedAt: new Date(),
      totalQuestions: 110
    }
  });
  console.log(`Created attempt with ID: ${attempt.id}`);
  
  // 3. Count existing certificates for this certification to compute sequence
  const count = await prisma.issuedCertificate.count({
    where: { certificationId: cert.id }
  });
  
  const seqNum = count + 1;
  const year = new Date().getFullYear(); // e.g. 2026
  const seqString = String(seqNum).padStart(5, '0');
  const verificationId = `TT-AEX-C-${year}-${seqString}`;
  
  console.log(`Creating IssuedCertificate with Verification ID: ${verificationId}...`);
  const issuedCertificate = await prisma.issuedCertificate.create({
    data: {
      userId: user.id,
      certificationId: cert.id,
      certificateUrl: '#',
      verificationId: verificationId,
      score: 92,
      status: 'VALID',
      issuedAt: new Date()
    }
  });

  console.log(`Creating UserCertification...`);
  const userCert = await prisma.userCertification.create({
    data: {
      userId: user.id,
      certificationId: cert.id,
      certNumber: verificationId,
      status: 'VALID',
      issuedAt: new Date()
    }
  });
  
  console.log(`✅ Certificate and UserCertification issued successfully!`);
  console.log(`-----------------------------------------------`);
  console.log(`User:              ${user.name} (${user.email})`);
  console.log(`Certification:     ${cert.title}`);
  console.log(`Verification ID:   ${verificationId}`);
  console.log(`Localhost Link:    http://localhost:3000/certification-exams/verify/${verificationId}`);
  console.log(`-----------------------------------------------`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
