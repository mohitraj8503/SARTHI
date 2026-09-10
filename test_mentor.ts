import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const mentors = await prisma.user.findMany({ where: { role: 'MENTOR' }, select: { id: true, email: true, role: true } });
  console.log("Mentors found:", mentors);
}
main().catch(console.error);
