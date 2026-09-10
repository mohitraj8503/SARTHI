const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const teacherId = 'app_cmpjqfuah0004atrsexa8n7ob';
    
    if (teacherId.startsWith('app_')) {
      const appId = teacherId.replace('app_', '');
      console.log('Looking for appId:', appId);
      
      const app = await prisma.teacherApplication.findUnique({
        where: { id: appId },
        include: {
          education: true,
          documents: true,
          user: {
            include: {
              teacher: true,
              _count: { select: { courses: true } },
              courses: {
                select: {
                  id: true,
                  title: true,
                  isPublished: true,
                  price: true,
                  enrolledStudentsCount: true,
                  rating: true,
                  createdAt: true
                }
              }
            }
          }
        }
      });
      
      if (!app) {
        console.log('APP NOT FOUND - returns 404');
        return;
      }
      
      console.log('App found:', app.id, app.email, app.status);
      console.log('app.user:', app.user);
      
      if (app.user) {
        console.log('Has user - normal flow');
      } else {
        console.log('No user - fallback response');
        // Check if app.createdAt exists (it might not)
        console.log('app.createdAt:', app.createdAt);
        console.log('app.submittedAt:', app.submittedAt);
        
        const fallback = {
          id: `app_${app.id}`,
          name: app.fullName,
          email: app.email,
          role: 'APPLICANT',
          bio: app.bio,
          company: null,
          phone: app.phone,
          emailVerified: false,
          googleId: null,
          status: app.status.toLowerCase(),
          onboardingStatus: 'PENDING',
          requiresPasswordChange: false,
          tempPassword: undefined,
          createdAt: app.createdAt, // Does this field exist?
          teacherInfo: null,
          application: app,
          coursesCount: 0,
          courses: []
        };
        console.log('Fallback response would be:', JSON.stringify({ id: fallback.id, email: fallback.email, createdAt: fallback.createdAt }));
      }
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
