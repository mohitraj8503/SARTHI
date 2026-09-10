import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'mohitraj8503.edu@gmail.com';
  console.log(`Checking user: ${email}...`);
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`User ${email} not found!`);
    process.exit(1);
  }

  console.log(`User ready: ${user.name} (${user.id})`);

  const projectTitle = 'Git & GitHub Masterclass LMS';
  const existingProject = await prisma.project.findFirst({
    where: { title: projectTitle }
  });

  const projectData = {
    title: projectTitle,
    description: "Gamified Learning Management System designed to handle registrations, track live attendance, manage assignments, and show leaderboards. Developed by Mohit Raj.",
    category: 'Technology',
    budget: 45000,
    timeline: 'Completed',
    status: 'OPEN' as const,
    clientId: user.id,
    requirements: 'https://github.com/mohitraj8503/Git-GitHub-Masterclass',
    skills: 'React, Next.js, Supabase, PostgreSQL, TailwindCSS, TypeScript',
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
