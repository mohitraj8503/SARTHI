const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workshop = await prisma.workshop.upsert({
    where: { slug: 'git-gitlab-workshop' },
    update: {
      title: 'Git & GitLab Workshop',
      description: 'Master the essentials of Git and GitLab, including branching strategies, merges, merge requests, CI/CD integrations, and collaboration workflows.',
      instructorName: 'Mohit Raj',
      date: new Date(0), // 1970-01-01, representing "no date" (TBD)
      duration: '2 Hours',
      price: 0,
      originalPrice: 499,
      seats: 100,
      seatsLeft: 100,
      category: 'DevOps',
      tags: 'git, gitlab, version-control, devops',
      thumbnail: '/course-thumbnails/git-gitlab.png',
      status: 'PUBLISHED'
    },
    create: {
      title: 'Git & GitLab Workshop',
      slug: 'git-gitlab-workshop',
      description: 'Master the essentials of Git and GitLab, including branching strategies, merges, merge requests, CI/CD integrations, and collaboration workflows.',
      instructorName: 'Mohit Raj',
      date: new Date(0), // 1970-01-01, representing "no date" (TBD)
      duration: '2 Hours',
      price: 0,
      originalPrice: 499,
      seats: 100,
      seatsLeft: 100,
      category: 'DevOps',
      tags: 'git, gitlab, version-control, devops',
      thumbnail: '/course-thumbnails/git-gitlab.png',
      status: 'PUBLISHED'
    }
  });

  console.log('Workshop created/updated successfully:', workshop);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
