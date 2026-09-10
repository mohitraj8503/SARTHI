import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'pm.enthuse@gmail.com' } });
  if (!user) return console.log("User not found");
  const sessions = await prisma.session.findMany({ 
    where: { userId: user.id }, 
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent sessions for Mentor:", sessions);
}
main().catch(console.error);
