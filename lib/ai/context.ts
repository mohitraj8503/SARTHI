import { prisma } from '../prisma';
import { Intent } from './intent';

export interface ContextOptions {
  intent: Intent;
  query: string;
  userId?: string;
}

export async function buildDatabaseContext(options: ContextOptions): Promise<string> {
  const { intent, query, userId } = options;
  const q = query.toLowerCase().trim();

  let context = "";

  try {
    // 1. Get User/Enrollment Context if authenticated
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          role: true,
          totalPoints: true,
          createdAt: true,
          enrollments: {
            include: {
              course: {
                select: { title: true, level: true }
              }
            }
          },
          issuedCertificates: {
            select: { id: true, createdAt: true, certificateNumber: true }
          }
        }
      });

      if (user) {
        context += `USER CONTEXT:\n- Student Name: ${user.name}\n- Enrolled Courses: ${
          user.enrollments.length > 0 
            ? user.enrollments.map(e => `"${e.course.title}" (${e.course.level || 'All Levels'})`).join(', ') 
            : 'None yet'
        }\n- Active Certificates: ${
          user.issuedCertificates.length > 0 
            ? user.issuedCertificates.map(c => `Cert #${c.certificateNumber}`).join(', ') 
            : 'None'
        }\n- Student XP points: ${user.totalPoints}\n\n`;
      }
    }

    // 2. Fetch Course/Pricing Context
    if (intent === 'COURSE_SEARCH' || intent === 'PRICE_QUERY') {
      const courses = await prisma.course.findMany({
        where: {
          isPublished: true,
          publish_state: 'published',
          isActive: true,
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { shortDescription: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          shortDescription: true,
          price: true,
          originalPrice: true,
          effective_price_amount: true,
          discountPercent: true,
          level: true,
          category: true,
          duration: true,
        },
        take: 5
      });

      // If specific search returns nothing, pull top popular courses
      const targetCourses = courses.length > 0 ? courses : await prisma.course.findMany({
        where: { isPublished: true, publish_state: 'published', isActive: true },
        select: {
          id: true,
          title: true,
          shortDescription: true,
          price: true,
          originalPrice: true,
          effective_price_amount: true,
          discountPercent: true,
          level: true,
          category: true,
          duration: true,
        },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 4
      });

      context += "AVAILABLE SARTHI COURSES:\n";
      targetCourses.forEach((c, idx) => {
        const displayPrice = c.effective_price_amount ?? Number(c.price);
        const origPrice = c.originalPrice ?? Number(c.price);
        const discountStr = c.discountPercent ? ` (${c.discountPercent}% Off, Was ₹${origPrice})` : "";
        context += `${idx + 1}. "${c.title}" (ID: ${c.id})\n`;
        context += `   - Category: ${c.category || 'Technology'}\n`;
        context += `   - Level: ${c.level || 'All levels'}\n`;
        context += `   - Price: ₹${displayPrice}${discountStr}\n`;
        context += `   - Duration: ${c.duration ? c.duration + ' Hours' : 'Self-paced'}\n`;
        context += `   - Description: ${c.shortDescription || 'Master industry-ready tech skills with real-world projects.'}\n`;
      });
      context += "\n";
    }

    // 3. Fetch Internship/Career Context
    if (intent === 'CAREER_GUIDANCE') {
      const activeBatches = await prisma.internshipBatch.findMany({
        where: { status: 'ACTIVE' },
        select: {
          name: true,
          mentorName: true,
          duration: true,
          internship: {
            select: { title: true, description: true }
          }
        },
        take: 2
      });

      if (activeBatches.length > 0) {
        context += "ACTIVE INTERNSHIP PROGRAMS:\n";
        activeBatches.forEach(b => {
          context += `- Program: ${b.internship.title}\n`;
          context += `  - Active Batch: ${b.name}\n`;
          context += `  - Mentor: ${b.mentorName}\n`;
          context += `  - Duration: ${b.duration}\n`;
          context += `  - Description: ${b.internship.description || 'Live tasks, mentor reviews, and certified completions.'}\n`;
        });
        context += "\n";
      }
    }

  } catch (err) {
    console.error("Context building error:", err);
    context += "Database details are temporarily offline.\n";
  }

  return context.trim();
}
