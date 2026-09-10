import { prisma } from '../prisma';
import { getRazorpayInstance } from '../razorpay';

export async function createOrGetPlan(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      subscriptionMonthlyAmount: true,
      razorpayPlanId: true,
    },
  });

  if (!course) {
    throw new Error(`Course with ID ${courseId} not found`);
  }

  if (course.razorpayPlanId) {
    return course.razorpayPlanId;
  }

  if (!course.subscriptionMonthlyAmount) {
    throw new Error(`Course ${course.title} does not have subscriptionMonthlyAmount set`);
  }

  const rzp = getRazorpayInstance();
  if (!rzp) {
    throw new Error('Razorpay instance could not be initialized');
  }

  console.log(`[RAZORPAY_PLAN] Creating plan on Razorpay for course: ${course.title}, amount: ${course.subscriptionMonthlyAmount}`);
  const plan = await rzp.plans.create({
    period: 'monthly',
    interval: 1,
    item: {
      name: course.title.substring(0, 100), // Razorpay limit name to 100 chars
      amount: course.subscriptionMonthlyAmount,
      currency: 'INR',
    },
  });

  if (!plan || !plan.id) {
    throw new Error('Failed to create plan on Razorpay');
  }

  console.log(`[RAZORPAY_PLAN] Plan created successfully: ${plan.id}. Caching in DB...`);

  await prisma.course.update({
    where: { id: course.id },
    data: { razorpayPlanId: plan.id },
  });

  return plan.id;
}
