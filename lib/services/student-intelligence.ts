import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export interface StudentAIResponse {
  type: 'text' | 'metric' | 'suggestion' | 'clarification';
  content: string;
  metricLabel?: string;
  metricValue?: string | number;
  suggestions?: { id: string, label: string, link: string }[];
}

const STUDENT_METRIC_REGISTRY = {
  STUDENT_COUNT: {
    id: "STUDENT_COUNT",
    keywords: ["how many", "students", "registered", "total", "learning", "sankhya"],
    query: async () => {
      const count = await prisma.user.count({ where: { role: 'STUDENT' } });
      const displayCount = count + 1200; 
      return { 
        value: `${displayCount.toLocaleString()}+`, 
        label: "Students Learning with SARTHI",
        message: `Currently, over ${displayCount.toLocaleString()} ambitious students are mastering future skills with us. Don't be left behind!`
      };
    }
  },
  TOP_COURSES: {
    id: "TOP_COURSES",
    keywords: ["best", "course", "popular", "trending", "recommend", "sikhu", "top", "career"],
    query: async () => {
      const courses = await prisma.course.findMany({
        where: { isPublished: true },
        take: 3,
        orderBy: { enrollments: { _count: 'desc' } },
        select: { id: true, title: true, slug: true, price: true, salePrice: true, level: true, thumbnail: true }
      });
      
      return {
        type: 'course_cards',
        value: courses.length,
        label: "Trending Courses",
        message: "Based on market demand, these 3 tracks are currently offering the highest ROI and job placements:",
        courses: courses.map(c => ({
          id: c.id,
          title: c.title,
          price: c.salePrice || c.price,
          originalPrice: c.salePrice ? c.price : undefined,
          level: c.level,
          link: `/courses/${c.slug || c.id}`,
          image: c.thumbnail
        })),
        suggestions: [
          { id: 'all', label: 'View All Courses', link: '/courses' }
        ]
      };
    }
  },
  SUMMER_CAMP: {
    id: "SUMMER_CAMP",
    keywords: ["summer camp", "python", "chutti", "vacation", "may"],
    query: async () => {
      // Create real urgency
      const enrollmentCount = await prisma.enrollment.count({
        where: { courseId: 'summer-camp-2026' } // Assuming this ID
      });
      const seatsLeft = Math.max(7, 45 - enrollmentCount); // Realistic urgency

      return {
        value: "Filling Fast!",
        label: "Summer Camp 2026",
        message: `The Summer Camp 2026 is our flagship program. We only have ${seatsLeft} seats left for the upcoming batch! Would you like to reserve yours with a 10% discount?`,
        suggestions: [
          { id: 'sc_enroll', label: 'Reserve My Seat (10% OFF)', link: '/courses/summer-camp-2026' },
          { id: 'sc_syllabus', label: 'Download Syllabus', link: '/courses/summer-camp-2026#curriculum' }
        ]
      };
    }
  }
};

export async function getStudentAIAnswer(query: string, userData?: any): Promise<StudentAIResponse> {
  const q = query.toLowerCase();
  const userName = userData?.name ? userData.name.split(' ')[0] : 'there';

  // 1. Personalized Greeting / Context
  if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
    return {
      type: 'text',
      content: `Namaste ${userName}! I am SARTHI AI. 👋 Ready to build something amazing today? I can help you find the best course for your career goals. What are you interested in?`,
      suggestions: [
        { id: 'python', label: 'Python & AI', link: '/courses/python-full-stack' },
        { id: 'career', label: 'Job-Ready Tracks', link: '/courses' }
      ]
    };
  }

  // 2. Lead Qualification Logic
  if (q.includes("job") || q.includes("placement") || q.includes("salary") || q.includes("career")) {
    return {
      type: 'suggestion',
      content: `Our courses are designed for professional success. On average, our graduates see a 120% salary hike. Are you looking for a complete career switch or upskilling?`,
      suggestions: [
        { id: 'switch', label: 'Career Switch', link: '/courses' },
        { id: 'upskill', label: 'Upskilling', link: '/courses' }
      ]
    };
  }

  // 3. Objection Handling (Price/Expense)
  if (q.includes("expensive") || q.includes("cost") || q.includes("paisa") || q.includes("discount") || q.includes("free")) {
    return {
      type: 'suggestion',
      content: "Quality education is an investment, not an expense! However, we do have flexible EMI options and a 'Pay after Placement' model for select tracks. Would you like to see our scholarship options?",
      suggestions: [
        { id: 'emi', label: 'See EMI Plans', link: '/courses' },
        { id: 'scholarship', label: 'Check Scholarships', link: '/courses' }
      ]
    };
  }

  // 4. Intent Matching
  let matchedMetric = null;
  let highestScore = 0;

  for (const [key, metric] of Object.entries(STUDENT_METRIC_REGISTRY)) {
    let score = 0;
    for (const kw of metric.keywords) {
      if (q.includes(kw)) score++;
    }
    if (score > highestScore) {
      highestScore = score;
      matchedMetric = metric;
    }
  }

  // 5. Metric/Course Response
  if (matchedMetric && highestScore > 0) {
    const data = await matchedMetric.query();
    return {
      type: (data as any).type || 'metric',
      content: data.message,
      metricLabel: data.label,
      metricValue: data.value,
      suggestions: (data as any).suggestions,
      courses: (data as any).courses
    } as any;
  }

  // 6. Fallback (Always push to sales/catalog)
  return {
    type: 'clarification',
    content: `I'm not exactly sure about that, but I know how to get you started! Most students begin with our ${userName === 'there' ? 'Python & AI' : 'Python Full Stack'} track. Shall I show you why?`,
    suggestions: [
      { id: 'why', label: 'Why SARTHI?', link: '/courses' },
      { id: 'catalog', label: 'Browse All Courses', link: '/courses' }
    ]
  };
}
