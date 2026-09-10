const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'student@sarthi-woad.vercel.app';
  const courseId = 'course_gst_itr_combo_2024';

  console.log(`--- Enrolling ${email} in course ${courseId} ---`);

  // 1. Find User
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User with email ${email} not found.`);
  }
  console.log('User ID:', user.id);

  // 2. Find Course
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course with ID ${courseId} not found.`);
  }
  console.log('Course Title:', course.title);

  // 3. Create Enrollment if it doesn't exist
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: course.id
    }
  });

  if (!existingEnrollment) {
    const enrollmentCode = 'TT-SC26-TAX-' + Math.random().toString(36).substring(2, 5).toUpperCase();
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

  // 4. Create Transaction record if it doesn't exist
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
        amount: Number(course.price || 0),
        status: 'SUCCESS',
        razorpayOrderId: 'order_TAX_' + Date.now(),
        razorpayPaymentId: 'pay_TAX_' + Date.now(),
        currency: 'INR'
      }
    });
    console.log('✅ Transaction Recorded: Course Activated');
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
