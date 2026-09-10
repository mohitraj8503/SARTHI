import { PrismaClient } from '@prisma/client';
import { pythonHardQuestions } from '../app/(public)/certification-exams/python-professional-questions';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Python Professional Developer Certification into DB (All 60 Questions)...');

  // 1. Find or create instructor
  let instructor = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'TEACHER'] } }
  });

  if (!instructor) {
    console.log('No instructor found, creating a default admin...');
    instructor = await prisma.user.create({
      data: {
        email: 'admin@sarthi.in',
        name: 'Mohit Raj',
        role: 'ADMIN',
        status: 'ACTIVE',
        onboarded: true
      }
    });
  }
  console.log('Using Instructor:', instructor.name, '(ID:', instructor.id, ')');

  const certId = 'python-professional-developer';

  // 2. Clean up python-professional-developer
  console.log('Cleaning up existing python-professional-developer certification and questions...');
  const existingDev = await prisma.certification.findFirst({
    where: { OR: [{ id: certId }, { slug: certId }] }
  });
  if (existingDev) {
    await prisma.certificationQuestion.deleteMany({
      where: { certificationId: existingDev.id }
    });
    await prisma.certification.delete({
      where: { id: existingDev.id }
    });
  }

  // 3. Create Certification for python-professional-developer
  const pythonCert = await prisma.certification.create({
    data: {
      id: certId,
      title: 'Python Professional Developer',
      slug: 'python-professional-developer',
      description: 'Presented in recognition of exceptional performance, technical expertise, and successful completion of the Python Professional Developer Certification Program.',
      duration: 45,
      passingScore: 80,
      price: 39,
      premiumPrice: 49,
      proPrice: 99,
      difficulty: 'Expert',
      assessmentDurationMinutes: 45,
      status: 'PUBLISHED',
      instructorId: instructor.id,
      questions: '[]'
    }
  });

  console.log('Created Certification:', pythonCert.title, 'with ID:', pythonCert.id);

  // 4. Seed all 60 questions from pythonHardQuestions
  console.log(`Inserting ${pythonHardQuestions.length} questions...`);
  let order = 1;
  for (const q of pythonHardQuestions) {
    await prisma.certificationQuestion.create({
      data: {
        id: q.id,
        certificationId: pythonCert.id,
        questionText: q.question,
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 'HARD',
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer, // e.g. 'A', 'B', 'C', 'D'
        explanation: q.explanation,
        marks: 5,
        marksCorrect: 5,
        marksWrong: -1,
        orderNumber: order,
        order: order
      }
    });
    order++;
  }

  // 5. Let's also verify/seed for python-pro-dev slug (Python Core Expert)
  const pythonProDevId = 'python-pro-dev';
  
  // Clean up python-pro-dev
  console.log('Cleaning up existing python-pro-dev certification and questions...');
  const existingPro = await prisma.certification.findFirst({
    where: { OR: [{ id: pythonProDevId }, { slug: pythonProDevId }] }
  });
  if (existingPro) {
    await prisma.certificationQuestion.deleteMany({
      where: { certificationId: existingPro.id }
    });
    await prisma.certification.delete({
      where: { id: existingPro.id }
    });
  }

  const pythonProDev = await prisma.certification.create({
    data: {
      id: pythonProDevId,
      title: 'Python Core Expert',
      slug: 'python-pro-dev',
      description: 'Master core python fundamentals, advanced memory management, concurrency, and OOP concepts.',
      duration: 45,
      passingScore: 80,
      price: 39,
      premiumPrice: 49,
      proPrice: 99,
      difficulty: 'Expert',
      assessmentDurationMinutes: 45,
      status: 'PUBLISHED',
      instructorId: instructor.id,
      questions: '[]'
    }
  });

  console.log('Created Certification:', pythonProDev.title, 'with ID:', pythonProDev.id);

  console.log(`Inserting ${pythonHardQuestions.length} questions for python-pro-dev...`);
  order = 1;
  for (const q of pythonHardQuestions) {
    await prisma.certificationQuestion.create({
      data: {
        id: `${q.id}-pro-dev`,
        certificationId: pythonProDev.id,
        questionText: q.question,
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 'HARD',
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: 5,
        marksCorrect: 5,
        marksWrong: -1,
        orderNumber: order,
        order: order
      }
    });
    order++;
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
