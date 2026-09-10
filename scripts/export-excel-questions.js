const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const cert = await prisma.certification.findUnique({
    where: { slug: 'advanced-excel-certification-exam' },
    include: {
      questionsV2: {
        orderBy: { orderNumber: 'asc' }
      }
    }
  });

  if (!cert) {
    console.error('Certification not found');
    return;
  }

  console.log(`Found ${cert.questionsV2.length} questions for advanced-excel-certification-exam.`);

  // We will structure them by categories/types
  // Based on order Number or we can match their text / ids.
  // The insertion order in seed-excel-certification.js:
  // 1. cleaning (20 questions) -> excel-q-1 to excel-q-20
  // 2. lookups (20 questions) -> excel-q-21 to excel-q-40
  // 3. model (20 questions) -> excel-q-41 to excel-q-60
  // 4. dashboards (20 questions) -> excel-q-61 to excel-q-80
  // 5. forecasting (20 questions) -> excel-q-81 to excel-q-100
  // 6. final (10 questions) -> excel-q-101 to excel-q-110

  const structured = {
    cleaning: [],
    lookups: [],
    model: [],
    dashboards: [],
    forecasting: [],
    final: []
  };

  cert.questionsV2.forEach(q => {
    let options = [];
    try {
      options = JSON.parse(q.options);
    } catch (e) {
      options = q.options;
    }

    const questionObj = {
      id: q.id,
      section: q.difficulty,
      type: 'mcq',
      question: q.questionText,
      options: options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    };

    const idNum = parseInt(q.id.replace('excel-q-', ''), 10);
    if (idNum >= 1 && idNum <= 20) {
      structured.cleaning.push(questionObj);
    } else if (idNum >= 21 && idNum <= 40) {
      structured.lookups.push(questionObj);
    } else if (idNum >= 41 && idNum <= 60) {
      structured.model.push(questionObj);
    } else if (idNum >= 61 && idNum <= 80) {
      structured.dashboards.push(questionObj);
    } else if (idNum >= 81 && idNum <= 100) {
      structured.forecasting.push(questionObj);
    } else if (idNum >= 101 && idNum <= 110) {
      structured.final.push(questionObj);
    }
  });

  const targetPath = path.join(__dirname, '../app/(public)/certification-exams/advanced-excel-questions.json');
  fs.writeFileSync(targetPath, JSON.stringify(structured, null, 2));
  console.log(`Successfully exported questions to ${targetPath}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
