import { prisma } from '../lib/prisma';

async function main() {
  const app = await prisma.teacherApplication.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });

  if (!app) {
    console.error('Application not found');
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  console.log('App profilePhotoUrl length:', app.profilePhotoUrl?.length);

  // Link Application to User
  await prisma.teacherApplication.update({
    where: { id: app.id },
    data: { userId: user.id },
  });

  // Set User image & avatar_url
  if (app.profilePhotoUrl) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: app.profilePhotoUrl,
        avatar_url: app.profilePhotoUrl,
      },
    });
    console.log('✓ Successfully updated User image & avatar_url with profilePhotoUrl!');
  } else {
    console.log('Warning: profilePhotoUrl is empty on TeacherApplication');
  }
}

main().finally(() => prisma.$disconnect());
