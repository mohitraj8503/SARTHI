import { prisma } from '../lib/prisma';

async function main() {
  const emails = ['saket7174@gmail.com', 'souravroy00458@gmail.com'];

  console.log('=== Skipping Onboarding for Saket & Sourav ===');

  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          onboarded: true,
          onboardingStatus: 'COMPLETED',
          requiresPasswordChange: false,
        },
      });

      console.log(`✓ Updated ${email}:`);
      console.log({
        email: updatedUser.email,
        onboarded: updatedUser.onboarded,
        onboardingStatus: updatedUser.onboardingStatus,
        requiresPasswordChange: updatedUser.requiresPasswordChange,
      });
    } else {
      console.log(`❌ User with email ${email} not found.`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error updating onboarding status:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
