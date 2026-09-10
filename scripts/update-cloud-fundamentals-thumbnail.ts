import { PrismaClient } from '@prisma/client';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log("Checking certifications in the database...");
  const certs = await prisma.certification.findMany();
  console.log("All certifications found:", JSON.stringify(certs.map(c => ({ id: c.id, title: c.title, thumbnail: c.thumbnail })), null, 2));

  // Find the one matching "Cloud Fundamentals"
  const target = certs.find(c => c.title.toLowerCase().includes("cloud fundamentals"));
  if (target) {
    console.log(`Found target: "${target.title}" (ID: ${target.id}). Updating thumbnail...`);
    const updated = await prisma.certification.update({
      where: { id: target.id },
      data: { thumbnail: '/images/certifications/cloud-fundamentals-microsoft.png' }
    });
    console.log("Updated certification:", updated);
  } else {
    console.log("Cloud Fundamentals certification not found in the database. Creating it or checking existing ones...");
    // Let's check if we should create a certification if it doesn't exist,
    // but usually it exists. Let's run the inspect first.
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
