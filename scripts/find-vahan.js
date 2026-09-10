const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("=== Querying Teacher Applications ===");
    const apps = await prisma.teacherApplication.findMany({
      include: {
        user: true,
      }
    });
    console.log(`Found ${apps.length} applications total.`);
    for (const app of apps) {
      console.log(`- App ID: ${app.id}, FullName: ${app.fullName}, Email: ${app.email}, Status: ${app.status}, UserId: ${app.userId}`);
    }

    console.log("\n=== Querying Users matching 'vahan' ===");
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'vahan' } },
          { email: { contains: 'vahan' } }
        ]
      },
      include: {
        teacher: true,
      }
    });
    console.log(`Found ${users.length} users matching 'vahan':`);
    for (const u of users) {
      console.log(`- User ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, TeacherStatus: ${u.teacher?.status}`);
    }
    
    console.log("\n=== Querying Applications matching 'vahan' ===");
    const appsVahan = await prisma.teacherApplication.findMany({
      where: {
        OR: [
          { fullName: { contains: 'vahan' } },
          { email: { contains: 'vahan' } }
        ]
      }
    });
    console.log(`Found ${appsVahan.length} applications matching 'vahan':`);
    for (const a of appsVahan) {
      console.log(JSON.stringify(a, null, 2));
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
