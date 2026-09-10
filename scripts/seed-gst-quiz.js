const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courseId = 'course_gst_itr_combo_2024';

  console.log(`--- Seeding Quiz for course: ${courseId} ---`);

  // Ensure course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course with ID ${courseId} not found.`);
  }

  // Delete existing quizzes for this course
  await prisma.quiz.deleteMany({ where: { courseId } });

  // Create Quiz
  const quiz = await prisma.quiz.create({
    data: {
      id: 'quiz_gst_itr_foundation',
      title: 'GST & Income Tax Foundation Quiz',
      timeLimit: 15,
      passingScore: 60,
      courseId
    }
  });

  console.log('✅ Quiz created:', quiz.title);

  // Create QuizQuestions
  const questions = [
    {
      question: 'What is the maximum GST rate slab in India?',
      options: JSON.stringify(['18%', '28%', '12%', '5%']),
      correctAnswer: 1, // '28%'
      points: 10,
      orderNumber: 1
    },
    {
      question: 'Which form is used for filing GST annual return?',
      options: JSON.stringify(['GSTR-1', 'GSTR-3B', 'GSTR-9', 'GSTR-4']),
      correctAnswer: 2, // 'GSTR-9'
      points: 10,
      orderNumber: 2
    },
    {
      question: 'Under which section of the Income Tax Act can you claim deductions for PPF contributions?',
      options: JSON.stringify(['Section 80D', 'Section 80C', 'Section 80G', 'Section 80EE']),
      correctAnswer: 1, // 'Section 80C'
      points: 10,
      orderNumber: 3
    }
  ];

  for (const q of questions) {
    await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        orderNumber: q.orderNumber
      }
    });
  }

  console.log('✅ Quiz questions seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
