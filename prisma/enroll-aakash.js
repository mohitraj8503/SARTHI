const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Assigning Summer Camp to Aakash Verma ---');

  // 1. Find or create Aakash Verma
  const email = 'aakash.verma@example.com';
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Aakash Verma',
      status: 'active',
      onboarded: true,
      role: 'STUDENT'
    },
    create: {
      email,
      name: 'Aakash Verma',
      status: 'active',
      onboarded: true,
      role: 'STUDENT'
    }
  });

  console.log('User ID:', user.id);

  // 2. Ensure Course exists
  const courseId = 'summer-camp-2026';
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  
  if (!course) {
    throw new Error('Course summer-camp-2026 not found. Please run the course seed script first.');
  }

  // 3. Create Enrollment (Check if exists first)
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: course.id
    }
  });

  if (!existingEnrollment) {
    const enrollmentCode = 'TT-SC26-ELITE-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: 'active',
        progressPercentage: 0,
        enrollmentCode,
        enrollmentNo: Math.floor(3000 + Math.random() * 7000)
      }
    });
    console.log('✅ Enrollment Created:', enrollment.enrollmentCode);
  } else {
    console.log('✅ Enrollment already exists:', existingEnrollment.enrollmentCode);
  }

  // 4. Create Transaction record (Only use fields in schema)
  const existingTx = await prisma.transaction.findFirst({
    where: {
      userId: user.id,
      courseId: course.id
    }
  });

  if (!existingTx) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: Number(course.price),
        status: 'SUCCESS',
        razorpayOrderId: 'order_ELITE_' + Date.now(),
        razorpayPaymentId: 'pay_ELITE_' + Date.now(),
        currency: 'INR'
      }
    });
    console.log('✅ Transaction Recorded: Elite Status Activated');
  } else {
    console.log('✅ Transaction already exists');
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
