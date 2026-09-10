import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'omprabhat2106@gmail.com';
  console.log(`Checking user: ${email}...`);
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found, creating user...`);
    user = await prisma.user.create({
      data: {
        email,
        name: 'Om Prabhat',
        role: 'STUDENT',
        image: '/testimonials/OmPrabhat.png',
        oauthImage: '/testimonials/OmPrabhat.png',
        status: 'ACTIVE'
      }
    });
  } else {
    // Make sure image is set correctly
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        image: user.image || '/testimonials/OmPrabhat.png',
      }
    });
  }

  console.log(`User ready: ${user.name} (${user.id})`);

  const projectTitle = 'FTW Championships Season VIII';
  const existingProject = await prisma.project.findFirst({
    where: { title: projectTitle }
  });

  const projectData = {
    title: projectTitle,
    description: 'The Premier FC Mobile Tournament Experience. Compete against the best FC Mobile players, earn rewards, climb the rankings, and leave your legacy in the Hall of Fame. Developed by Om Prabhat.',
    category: 'Technology',
    budget: 7000,
    timeline: 'Completed',
    status: 'OPEN' as const,
    clientId: user.id,
    requirements: 'https://ftw-championships.vercel.app/',
    skills: 'React, Next.js, TailwindCSS, TypeScript, Vercel',
  };

  let project;
  if (existingProject) {
    console.log(`Project "${projectTitle}" already exists. Updating...`);
    project = await prisma.project.update({
      where: { id: existingProject.id },
      data: projectData
    });
  } else {
    console.log(`Creating project "${projectTitle}"...`);
    project = await prisma.project.create({
      data: projectData
    });
  }

  console.log(`✅ Project successfully seeded: ${project.title} (ID: ${project.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
