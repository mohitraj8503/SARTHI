const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const students = [
  {
    email: 'suman251791@arkajainuniversity.ac.in',
    name: 'Suman Kumari'
  },
  {
    email: 'preety250575@arkajainuniversity.ac.in',
    name: 'Preety Kumari'
  }
];

const slug = 'advanced-excel-certification-exam';

async function generateCert(student) {
  const { email, name } = student;
  console.log(`\n-----------------------------------------------`);
  console.log(`Processing student: ${name} (${email})...`);
  
  let user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    return;
  }
  
  // Update name to formatted version
  user = await prisma.user.update({
    where: { email },
    data: { name: name }
  });
  console.log(`Found & updated User: ${user.name} (ID: ${user.id})`);
  
  const cert = await prisma.certification.findUnique({
    where: { slug }
  });
  
  if (!cert) {
    console.error(`❌ Certification not found with slug: ${slug}`);
    return;
  }
  
  // 1. Clean up existing records to prevent unique constraints issues
  console.log('Cleaning up existing attempts and certificates...');
  await prisma.issuedCertificate.deleteMany({
    where: { userId: user.id, certificationId: cert.id }
  });
  await prisma.userCertification.deleteMany({
    where: { userId: user.id, certificationId: cert.id }
  });
  await prisma.certificationAttempt.deleteMany({
    where: { userId: user.id, certificationId: cert.id }
  });
  
  // 2. Create mock attempt
  const attemptId = `mock-attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  console.log(`Creating mock attempt...`);
  const attempt = await prisma.certificationAttempt.create({
    data: {
      id: attemptId,
      userId: user.id,
      certificationId: cert.id,
      score: 90,
      passed: true,
      answers: '[]',
      status: 'COMPLETED',
      completedAt: new Date(),
      startedAt: new Date(),
      totalQuestions: 110
    }
  });
  console.log(`Created attempt ID: ${attempt.id}`);
  
  // 3. Count existing certs to get the next sequence number
  const count = await prisma.issuedCertificate.count({
    where: { certificationId: cert.id }
  });
  
  const seqNum = count + 1;
  const year = new Date().getFullYear();
  const seqString = String(seqNum).padStart(5, '0');
  const verificationId = `TT-AEX-C-${year}-${seqString}`;
  
  console.log(`Creating IssuedCertificate: ${verificationId}...`);
  await prisma.issuedCertificate.create({
    data: {
      userId: user.id,
      certificationId: cert.id,
      certificateUrl: '#',
      verificationId: verificationId,
      score: 90,
      status: 'VALID',
      issuedAt: new Date()
    }
  });
  
  console.log(`Creating UserCertification...`);
  await prisma.userCertification.create({
    data: {
      userId: user.id,
      certificationId: cert.id,
      certNumber: verificationId,
      status: 'VALID',
      issuedAt: new Date()
    }
  });
  
  console.log(`✅ Certificate generated successfully!`);
  console.log(`Verification ID:   ${verificationId}`);
  console.log(`Verification URL:  /certification-exams/verify/${verificationId}`);
}

async function main() {
  console.log('🌱 Starting Certificate generation for Suman and Preety...');
  for (const student of students) {
    await generateCert(student);
  }
}

main()
  .catch(e => {
    console.error('❌ Generation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
