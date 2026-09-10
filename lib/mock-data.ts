
/**
 * Mock Data Layer for SARTHI
 * Used when DATABASE_MODE=mock
 */

export const MOCK_USERS = [
  {
    id: 'user_admin_imd',
    name: 'SARTHI Super Admin',
    email: 'admin@imd.gov.in',
    password: '$2b$10$uBWM./K0rE7Rmgur5LnSQugspg0a2C2yQccf0qvmkPkG4sODWpd2m', // AdminDemo@123
    avatar_url: '/sarthi-logo.png',
    role: 'ADMIN',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_admin_demo_imd',
    name: 'SARTHI Super Admin',
    email: 'admin.demo@imd.gov.in',
    password: '$2b$10$uBWM./K0rE7Rmgur5LnSQugspg0a2C2yQccf0qvmkPkG4sODWpd2m', // AdminDemo@123
    avatar_url: '/sarthi-logo.png',
    role: 'ADMIN',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_1',
    name: 'SARTHI Admin',
    email: 'admin@sarthi.in',
    password: '$2b$10$uBWM./K0rE7Rmgur5LnSQugspg0a2C2yQccf0qvmkPkG4sODWpd2m', // AdminDemo@123 / SARTHI2026
    avatar_url: '/sarthi-logo.png',
    role: 'ADMIN',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_trainer_demo',
    name: 'IMD Senior Trainer',
    email: 'trainer.demo@imd.gov.in',
    password: '$2b$10$NxCs4TdL1cJD.7Mfezy9I.bCut/biFVpRJAiIbzf2Mek8/hD43Zxa', // TrainerDemo@123
    avatar_url: '/images/instructors/mohit-raj-real.jpg',
    role: 'TEACHER',
    status: 'ACTIVE',
    onboarded: true,
    department: 'India Meteorological Department - Capacity Building Division',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_trainer_sarthi',
    name: 'IMD Faculty Trainer',
    email: 'trainer@sarthi.gov.in',
    password: '$2b$10$NxCs4TdL1cJD.7Mfezy9I.bCut/biFVpRJAiIbzf2Mek8/hD43Zxa', // TrainerDemo@123
    avatar_url: '/images/instructors/mohit-raj-real.jpg',
    role: 'TEACHER',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_faculty_demo',
    name: 'IMD Faculty Trainer',
    email: 'faculty.demo@imd.gov.in',
    password: '$2b$10$NxCs4TdL1cJD.7Mfezy9I.bCut/biFVpRJAiIbzf2Mek8/hD43Zxa', // TrainerDemo@123
    avatar_url: '/images/instructors/mohit-raj-real.jpg',
    role: 'TEACHER',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_student_demo',
    name: 'Mohit Raj',
    email: 'student.demo@imd.gov.in',
    password: '$2b$10$rGDmv3ib3tsrNlLWyS4Wmu696PvaPjTVN9gqaeT0ebaoEoBUuX8rq', // StudentDemo@123
    role: 'STUDENT',
    status: 'ACTIVE',
    onboarded: true,
    college: 'India Meteorological Department / Arka Jain University',
    currentCourse: 'Meteorological Computing & Applied AI',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_mohit_mentor',
    name: 'Mohit Raj',
    email: 'pm.enthuse@gmail.com',
    password: '$2b$10$YbX5PAWmEYv19gaJqfGiN.3GilnuzpbAB6wvugthwxblGdg4kkZyO', // SARTHI2026
    avatar_url: '/sarthi-logo.png',
    role: 'MENTOR',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_2',
    name: 'Student User',
    email: 'student@example.com',
    password: '$2b$10$YbX5PAWmEYv19gaJqfGiN.3GilnuzpbAB6wvugthwxblGdg4kkZyO', // SARTHI2026
    role: 'STUDENT',
    status: 'ACTIVE',
    onboarded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user_nitin_sinha',
    name: 'Nitin Sinha',
    email: 'nitinsinha062@gmail.com',
    password: '$2b$10$YbX5PAWmEYv19gaJqfGiN.3GilnuzpbAB6wvugthwxblGdg4kkZyO', // SARTHI2026
    role: 'STUDENT',
    status: 'ACTIVE',
    onboarded: true,
    college: 'Arka Jain University',
    currentCourse: 'B.Tech Computer Science (Sem 3)',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

import { INITIAL_COURSES } from './initial-data';

export const MOCK_COURSES = [
  ...INITIAL_COURSES.map(c => ({
    ...c,
    isPublished: c.isActive !== false,
    instructorId: c.instructorId || 'user_1',
    instructor: c.instructor || { name: 'SARTHI Admins', avatar_url: '/sarthi-logo.png' },
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
];

export const MOCK_ENROLLMENTS = [
  {
    id: 'enroll_1',
    userId: 'user_2',
    courseId: 'course_1',
    createdAt: new Date(),
  }
];

export const MOCK_BLOGS = [
  {
    id: 'blog_2',
    title: 'Why Python is the King of 2024 for Indian Students',
    slug: 'why-python-king-2024',
    excerpt: 'In 2024, Python has officially surpassed Java as the most demanded language in the Indian tech market. From AI to Web Development, Python is the foundational skill every student needs to master.',
    content: `
      <h2>Why Python is the King of 2024</h2>
      <p>If coding is a superpower, Python is the easiest way to acquire it. In 2024, it's not just a language; it's a career insurance policy for Indian students.</p>
      
      <h3>1. The Gateway to AI & Machine Learning</h3>
      <p>From ChatGPT to automated trading bots in Mumbai's financial hubs, Python is the engine. If you want to work in the future, you need to speak Python.</p>

      <h3>2. High Demand, Higher Packages</h3>
      <p>Top Indian tech firms and global startups are prioritising Python developers over traditional Java/C++ roles for modern full-stack and data positions.</p>

      <h3>3. The "English" of Programming</h3>
      <p>Its simple, English-like syntax means you spend less time worrying about semicolons and more time solving real-world problems.</p>

      <h2>Start Your Journey Today</h2>
      <p>Don't just learn syntax. Build projects that get you hired. Join our 2024 Python Masterclass.</p>
    `,
    category: 'Technology',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070',
    tags: 'Python, Programming, India Tech',
    authorId: 'user_1',
    author: { name: 'SARTHI Admins', avatar_url: '/sarthi-logo.png' },
    publishedAt: new Date(Date.now() - 86400000),
    views: 3500,
    readTime: '4 min'
  },
  {
    id: 'blog_3',
    title: 'The AI Revolution: How to Future-Proof Your Tech Career',
    slug: 'ai-revolution-future-proof',
    excerpt: 'AI is changing the job market faster than ever. Are you ready? Learn how to leverage AI tools to become a 10x developer and stay relevant in the age of automation.',
    content: `
      <h2>AI is a Tool, Not a Replacement</h2>
      <p>The fear of AI taking jobs is real, but the reality is that developers who use AI will replace those who don't.</p>
      
      <h3>1. Master Prompt Engineering</h3>
      <p>Learning how to communicate with LLMs is the new coding skill.</p>

      <h3>2. Understand the Fundamentals</h3>
      <p>AI can write code, but it can't always debug architecture. You still need deep computer science fundamentals.</p>

      <h3>3. Constant Re-skilling</h3>
      <p>At SARTHI, we update our curriculum every month to keep up with the pace of AI innovation.</p>
    `,
    category: 'Career',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070',
    tags: 'AI, Career, Future Tech',
    authorId: 'user_1',
    author: { name: 'SARTHI Admins', avatar_url: '/sarthi-logo.png' },
    publishedAt: new Date(Date.now() - 172800000),
    views: 5200,
    readTime: '6 min'
  }
];

export const MOCK_CERTIFICATIONS = [
  {
    id: 'cert_1',
    title: 'Python Professional Developer',
    slug: 'python-professional',
    description: 'Comprehensive certification for Python mastery including software architecture, backend systems, and automation.',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80',
    difficulty: 'Expert',
    assessmentDurationMinutes: 60,
    passingScore: 80,
    price: 39,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cert_2',
    title: 'C++ Master Architect',
    slug: 'cpp-master',
    description: 'Advanced C++ certification focusing on low-level memory management, template metaprogramming, and high-performance systems.',
    thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80',
    difficulty: 'Expert',
    assessmentDurationMinutes: 90,
    passingScore: 90,
    price: 49,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cert_3',
    title: 'Modern Web Architecture',
    slug: 'web-dev-professional',
    description: 'Master modern frontend and backend architectures using Next.js, AI agents, and resilient database patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&q=80',
    difficulty: 'Advanced',
    assessmentDurationMinutes: 75,
    passingScore: 85,
    price: 29,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const MOCK_CERT_ATTEMPTS: any[] = [];
export const MOCK_ISSUED_CERTIFICATES: any[] = [];
export const MOCK_CERT_PAYMENTS: any[] = [];
export const MOCK_SYSTEM_COUNTERS: any[] = [];
export const MOCK_PROGRESS: any[] = [];
export const MOCK_MODULES: any[] = [];
export const MOCK_LESSONS: any[] = [];
export const MOCK_TEACHERS: any[] = [
  {
    id: 'teacher_trainer_demo',
    userId: 'user_trainer_demo',
    title: 'Senior Meteorological Faculty & Technical Trainer',
    bio: 'Lead instructor for Atmospheric Sciences and Operational Forecasting modules at IMD Capacity Building Division.',
    status: 'APPROVED',
    canCreateCourses: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'teacher_trainer_sarthi',
    userId: 'user_trainer_sarthi',
    title: 'Faculty Trainer',
    bio: 'IMD Capacity Building Trainer',
    status: 'APPROVED',
    canCreateCourses: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'teacher_faculty_demo',
    userId: 'user_faculty_demo',
    title: 'Faculty Trainer',
    bio: 'IMD Faculty Trainer',
    status: 'APPROVED',
    canCreateCourses: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_INTERNSHIP_BATCHES: any[] = [
  {
    id: 'batch_web_dev_2026',
    internshipId: 'internship_web_dev',
    name: 'August 2026 Web Development Cohort',
    mentorName: 'Mohit Raj',
    mentorTitle: 'Program Director & Mentor',
    mentorEmail: 'admin@sarthi.in',
    duration: '3 Months',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignments: [],
  }
];

export const MOCK_INTERNSHIP_APPLICATIONS: any[] = [
  {
    id: 'app_nitin_sinha',
    studentId: 'user_nitin_sinha',
    name: 'Nitin Sinha',
    email: 'nitinsinha062@gmail.com',
    phone: '9876543210',
    college: 'Arka Jain University',
    course: 'B.Tech Computer Science',
    semester: '3',
    domain: 'Web Development',
    status: 'OFFER_ACCEPTED',
    paymentStatus: 'paid',
    amountPaidInr: 2000,
    paidAt: new Date(),
    offerAcceptedAt: new Date(),
    submittedAt: new Date(),
    reviewedAt: new Date(),
    reviewedBy: 'admin@sarthi.in',
    student: MOCK_USERS[2],
  },
  {
    id: 'app_ntnsinha0623',
    studentId: 'user_ntnsinha0623',
    name: 'Nitin Sinha',
    email: 'ntnsinha0623@gmail.com',
    phone: '9876543210',
    college: 'Arka Jain University',
    course: 'B.Tech Computer Science',
    semester: '3',
    domain: 'Web Development',
    status: 'OFFER_ACCEPTED',
    paymentStatus: 'paid',
    amountPaidInr: 2000,
    paidAt: new Date(),
    offerAcceptedAt: new Date(),
    submittedAt: new Date(),
    reviewedAt: new Date(),
    reviewedBy: 'admin@sarthi.in',
    student: MOCK_USERS[3],
  }
];

export const MOCK_BATCH_MEMBERS: any[] = [
  {
    id: 'member_nitin_sinha',
    userId: 'user_nitin_sinha',
    batchId: 'batch_web_dev_2026',
    status: 'ACTIVE',
    currentXp: 500,
    currentLevel: 2,
    referenceNumber: 'TT-INT-2026-0061',
    permanentInternId: 'TTI000061',
    user: MOCK_USERS[2],
    batch: MOCK_INTERNSHIP_BATCHES[0],
    submissions: [],
    badges: [],
    checkIns: [],
    attendances: [],
    certificates: [],
    xpTransactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'member_ntnsinha0623',
    userId: 'user_ntnsinha0623',
    batchId: 'batch_web_dev_2026',
    status: 'ACTIVE',
    currentXp: 500,
    currentLevel: 2,
    referenceNumber: 'TT-INT-2026-0062',
    permanentInternId: 'TTI000062',
    user: MOCK_USERS[3],
    batch: MOCK_INTERNSHIP_BATCHES[0],
    submissions: [],
    badges: [],
    checkIns: [],
    attendances: [],
    certificates: [],
    xpTransactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
MOCK_INTERNSHIP_BATCHES[0].members = MOCK_BATCH_MEMBERS;

// Populate MOCK_MODULES and MOCK_LESSONS from MOCK_COURSES
MOCK_COURSES.forEach((course: any) => {
  if (course.curriculum && Array.isArray(course.curriculum)) {
    course.curriculum.forEach((mod: any, mIdx: number) => {
      const modId = mod.id || `module_${course.id}_${mIdx}`;
      MOCK_MODULES.push({
        id: modId,
        title: mod.title,
        courseId: course.id,
        order: mIdx + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (mod.lessons && Array.isArray(mod.lessons)) {
        mod.lessons.forEach((lesson: any, lIdx: number) => {
          MOCK_LESSONS.push({
            id: lesson.id || `lesson_${modId}_${lIdx}`,
            title: lesson.title,
            description: lesson.description || '',
            content: lesson.content || '',
            duration: lesson.duration || 10,
            videoUrl: lesson.videoUrl || '',
            youtube_video_id: lesson.youtube_video_id || '',
            type: lesson.type || 'video',
            liveStatus: lesson.liveStatus || null,
            scheduledAt: lesson.scheduledAt || null,
            courseId: course.id,
            moduleId: modId,
            orderNumber: lesson.orderNumber || (lIdx + 1),
            isPublished: true,
            isFreePreview: lesson.isFreePreview || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }
    });
  }
});

/**
 * Proxy handler to simulate Prisma operations
 */
export const createMockProxy = (data: any[]) => {
  const matchFilter = (item: any, where: any): boolean => {
    if (!where) return true;
    return Object.keys(where).every(key => {
      const val = where[key];
      if (val === undefined) return true;
      if (key === 'AND' && Array.isArray(val)) {
        return val.every(cond => matchFilter(item, cond));
      }
      if (key === 'OR' && Array.isArray(val)) {
        return val.some(cond => matchFilter(item, cond));
      }
      if (key === 'NOT') {
        if (Array.isArray(val)) return !val.some(cond => matchFilter(item, cond));
        return !matchFilter(item, val);
      }
      if (key === 'publish_state') {
        return item.publish_state === val || (val === 'published' && (item.isPublished || item.isActive !== false));
      }
      if (key === 'isActive') {
        return item.isActive === val || (val === true && item.isActive !== false);
      }
      if (key === 'isPublished') {
        return item.isPublished === val || (val === true && item.isPublished !== false);
      }
      if (key === 'badge') {
        if (val === 'ORIGINALS') return item.badge === 'ORIGINALS';
        // Exclude originals filter, let's ignore it in mock mode so courses show up.
        return true;
      }
      if (val && typeof val === 'object') {
        if ('equals' in val) return item[key] === val.equals;
        if ('in' in val) return Array.isArray(val.in) && val.in.includes(item[key]);
        if ('not' in val) {
          if (key === 'badge' && val.not === 'ORIGINALS') return true; // ignore originals exclusion
          return item[key] !== val.not;
        }
        if ('startsWith' in val) return typeof item[key] === 'string' && item[key].startsWith(val.startsWith);
        if ('contains' in val) {
          const itemVal = item[key];
          return typeof itemVal === 'string' && itemVal.toLowerCase().includes(String(val.contains).toLowerCase());
        }
      }
      return item[key] === val;
    });
  };

  const filterAndJoin = (item: any, args: any) => {
    let result = { ...item };
    
    if (args?.include) {
      for (const relationKey of Object.keys(args.include)) {
        if (args.include[relationKey]) {
          if (relationKey === '_count') {
            result._count = {
              lessons: MOCK_LESSONS.filter(l => l.courseId === item.id).length || 14,
              enrollments: MOCK_ENROLLMENTS.filter(e => e.courseId === item.id).length || item.studentsEnrolled || 950
            };
          }
          if (relationKey === 'modules') {
            const courseMods = MOCK_MODULES.filter(m => m.courseId === item.id);
            result.modules = courseMods.length > 0 ? courseMods.map(m => ({
              ...m,
              lessons: MOCK_LESSONS.filter(l => l.moduleId === m.id)
            })) : (item.curriculum || []);
          }
          if (relationKey === 'lessons') {
            result.lessons = MOCK_LESSONS.filter(l => (l.moduleId === item.id || l.courseId === item.id) && l.isPublished);
          }
          if (relationKey === 'instructor') {
            result.instructor = item.instructor || MOCK_USERS.find(u => u.id === item.instructorId) || { name: 'Expert Mentor', image: '/images/instructors/mohit-raj-real.jpg' };
          }
          if (relationKey === 'user') {
            result.user = MOCK_USERS.find(u => u.id === item.userId);
          }
          if (relationKey === 'progress') {
            result.progress = MOCK_PROGRESS.filter(p => p.userId === item.userId && p.courseId === item.courseId);
          }
          if (relationKey === 'certification') {
            result.certification = { title: 'Full Stack Web Development Mastery', description: 'Verified pathway professional credential.' };
          }
        }
      }
    }
    return result;
  };

  return {
    findMany: async (args: any) => {
      let filtered = [...data];
      if (args?.where) {
        filtered = filtered.filter(item => matchFilter(item, args.where));
      }
      
      if (args?.orderBy) {
        const orderByKeys = Object.keys(args.orderBy);
        if (orderByKeys.length > 0) {
          const key = orderByKeys[0];
          const direction = args.orderBy[key];
          filtered.sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
      }

      if (args?.skip !== undefined) {
        filtered = filtered.slice(args.skip);
      }
      if (args?.take !== undefined) {
        filtered = filtered.slice(0, args.take);
      }

      return filtered.map(item => filterAndJoin(item, args));
    },
    findUnique: async (args: any) => {
      const { where } = args || {};
      if (!where) return null;
      const found = data.find(item => {
        if (Object.keys(where).some(key => key.includes('_'))) {
          // Compound key logic
          return Object.keys(where).every(key => {
            const val = where[key];
            if (key.includes('_')) {
              const compoundKeys = Object.keys(val);
              return compoundKeys.every(subKey => item[subKey] === val[subKey]);
            }
            return item[key] === (val?.equals !== undefined ? val.equals : val);
          });
        }
        return matchFilter(item, where);
      });
      return found ? filterAndJoin(found, args) : null;
    },
    findFirst: async (args: any) => {
      const { where } = args || {};
      const found = data.find(item => matchFilter(item, where));
      return found ? filterAndJoin(found, args) : null;
    },
    groupBy: async (args: any) => {
      const { by, where } = args || {};
      let filtered = [...data];
      if (where) {
        filtered = filtered.filter(item => matchFilter(item, where));
      }
      if (by && by.includes('isPublished')) {
        const published = filtered.filter(item => item.isPublished).length;
        const drafts = filtered.filter(item => !item.isPublished).length;
        return [
          { isPublished: true, _count: published },
          { isPublished: false, _count: drafts }
        ];
      }
      return [];
    },
    aggregate: async (args: any) => {
      const { where } = args || {};
      let filtered = [...data];
      if (where) {
        filtered = filtered.filter(item => matchFilter(item, where));
      }
      const sumAmount = filtered.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      return {
        _sum: {
          amount: sumAmount
        }
      };
    },
    count: async (args: any) => {
      let filtered = [...data];
      if (args?.where) {
        filtered = filtered.filter(item => matchFilter(item, args.where));
      }
      return filtered.length;
    },
    create: async ({ data: newItem }: any) => {
      const created = { ...newItem, id: newItem.id || `mock_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date(), updatedAt: new Date() };
      data.push(created);
      return created;
    },
    update: async ({ where, data: updates }: any) => {
      const index = data.findIndex(item => matchFilter(item, where));
      if (index === -1) throw new Error('Not found');
      
      const resolvedUpdates = { ...updates };
      for (const key of Object.keys(resolvedUpdates)) {
        const val = resolvedUpdates[key];
        if (val && typeof val === 'object') {
          if ('increment' in val) {
            resolvedUpdates[key] = (Number(data[index][key]) || 0) + Number(val.increment);
          } else if ('decrement' in val) {
            resolvedUpdates[key] = (Number(data[index][key]) || 0) - Number(val.decrement);
          }
        }
      }
      
      data[index] = { ...data[index], ...resolvedUpdates, updatedAt: new Date() };
      return data[index];
    },
    delete: async ({ where }: any) => {
      const index = data.findIndex(item => matchFilter(item, where));
      if (index === -1) throw new Error('Not found');
      const deleted = data.splice(index, 1);
      return deleted[0];
    },
    upsert: async ({ where, update, create }: any) => {
      const index = data.findIndex(item => matchFilter(item, where));
      if (index !== -1) {
        const existing = data[index];
        const resolvedUpdate = { ...update };
        for (const key of Object.keys(resolvedUpdate)) {
          const val = resolvedUpdate[key];
          if (val && typeof val === 'object') {
            if ('increment' in val) {
              resolvedUpdate[key] = (Number(existing[key]) || 0) + Number(val.increment);
            } else if ('decrement' in val) {
              resolvedUpdate[key] = (Number(existing[key]) || 0) - Number(val.decrement);
            }
          }
        }
        data[index] = { ...existing, ...resolvedUpdate, updatedAt: new Date() };
        return data[index];
      }
      const created = { ...create, id: create.id || `mock_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date(), updatedAt: new Date() };
      data.push(created);
      return created;
    }
  };
};;
