import { PrismaClient } from '@prisma/client';
import { sendTransactionalEmail } from '../lib/email/send';

const prisma = new PrismaClient();

async function main() {
  const email = 'ashishsay133@gmail.com';
  const name = 'Ashish';
  const courseId = 'summer-camp-2026';

  console.log(`--- Enrolling ${name} (${email}) in ${courseId} ---`);

  // 1. Find or create user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      status: 'active',
      onboarded: true,
      role: 'STUDENT'
    },
    create: {
      email,
      name,
      status: 'active',
      onboarded: true,
      role: 'STUDENT'
    }
  });

  console.log('✅ User Upserted:', user.id);

  // 2. Fetch course details
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course ${courseId} not found in database.`);
  }

  // 3. Create Enrollment
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: course.id
    }
  });

  let enrollmentCode = '';
  if (!existingEnrollment) {
    const code = 'TT-SC26-ELITE-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: 'active',
        progressPercentage: 0,
        enrollmentCode: code,
        enrollmentNo: Math.floor(3000 + Math.random() * 7000)
      }
    });
    enrollmentCode = enrollment.enrollmentCode;
    console.log('✅ Enrollment Created:', enrollmentCode);
  } else {
    enrollmentCode = existingEnrollment.enrollmentCode;
    console.log('✅ Enrollment already exists:', enrollmentCode);
  }

  // 4. Create Transaction record
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
        razorpayOrderId: 'order_ELITE_' + Date.now(),
        razorpayPaymentId: 'pay_ELITE_' + Date.now(),
        currency: 'INR'
      }
    });
    console.log('✅ Transaction Recorded: SUCCESS');
  } else {
    console.log('✅ Transaction already exists');
  }

  // 5. Send Transactional Welcome Email
  console.log('📡 Dispatching welcome email to:', email);
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #030712; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f2937;">
      <h2 style="color: #FBBF24; text-align: center;">Welcome to SARTHI</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You have successfully registered for <strong>Summer Camp 2026</strong>!</p>
      <p>Your enrollment code is: <strong style="color: #FBBF24; font-family: monospace; font-size: 16px;">${enrollmentCode}</strong></p>
      <p>Your enrollment is now fully active. Log in to start your coding adventure.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sarthi-woad.vercel.app/login" style="background-color: #FBBF24; color: #020617; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase;">Start Learning</a>
      </div>
      <p style="border-top: 1px solid #1f2937; padding-top: 15px; font-size: 12px; color: #6b7280; text-align: center;">
        Payments encrypted & securely processed by SARTHI Secure Onboarding.
      </p>
    </div>
  `;

  await sendTransactionalEmail({
    to: email,
    subject: `Welcome to Summer Camp 2026!`,
    html: emailHtml,
    type: 'enrollment'
  });

  console.log('🎉 System Process Complete.');
}

main()
  .catch((e) => {
    console.error('❌ Process Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
