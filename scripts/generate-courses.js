const fs = require('fs');
const path = require('path');

// Helper to generate realistic high-quality text for courses
function getCourseData(name, fee, index, category, categoryId, level, slug, originalPrice) {
    const isFree = fee === 0;
    const pricingType = isFree ? 'FREE' : 'PAID';
    
    // Unsplash tech-themed search query terms to make thumbnails look premium
    const keywords = [
        'office', 'workspace', 'coding', 'analytics', 'dashboard', 'python', 
        'data', 'server', 'brain', 'logic', 'developer', 'startup', 'financial',
        'ai', 'robot', 'cloud', 'chart', 'marketing', 'design', 'learning'
    ];
    const term = keywords[index % keywords.length];
    const thumbnail = `https://images.unsplash.com/photo-${1500000000000 + (index * 1234567) % 1000000000}?auto=format&fit=crop&q=80&w=800`;

    // Detailed Description (500-800 words)
    const detailedDesc = `
# Master ${name} – Complete Practical Masterclass
Welcome to the definitive, industry-focused certification program for ${name}, branded under the prestigious **SARTHI Originals** lineup. This program has been meticulously designed from the ground up to offer an application-oriented learning path that bridges the gap between foundational theory and actual production-level implementation. 

Whether you are a student preparing for upcoming placements or a professional seeking to upskill and transition into premium technology and business roles, this course is tailored to deliver maximum impact.

## Why SARTHI Originals?
Every course in the SARTHI Originals lineup represents the gold standard in modern EdTech. We focus heavily on hands-on labs, micro-credentials, and industry-aligned capstone projects. Our courses are structured to be ATS-friendly, helping you list high-impact keywords on your resume that hiring managers actively search for. By completing this program, you will gain the practical confidence needed to handle complex technical tasks and pass competitive corporate assessments.

## Program Highlights and What You Will Build
Throughout this comprehensive journey, you will complete multiple hands-on exercises, assignments, and real-world projects. Rather than copy-pasting code or looking at passive slide decks, you will write code, build dashboards, configure automated workflows, and build systems from scratch. 
1. **Interactive Capstone Projects**: Build real portfolio items that demonstrate your mastery.
2. **Comprehensive Curriculum**: Covering beginner to advanced topics with deep-dive analysis.
3. **Verified Certificate**: Obtain a prestigious, industry-recognized SARTHI Originals certification of completion.
4. **Google Search & ATS Friendly Skills**: Acquire the exact skill sets currently demanded by top multinational corporations and startups.

## Target Audience and Career Pathways
- **Students & Graduates**: Prepare for high-paying placements and technical interviews with verified project portfolios.
- **Working Professionals**: Accelerate your career growth, earn promotions, or transition into developer, analyst, and consultant roles.
- **Freelancers & Entrepreneurs**: Gain the skills to build your own systems, automate workflows, and deliver premium client projects.

By the end of this certification, you will not just understand the syntax or theory; you will have built a functional portfolio showing your command over ${name}. Sign up today and take the first step towards mastering this critical modern skill.
`.trim();

    return {
        id: `course_${slug.replace(/-/g, '_')}`,
        title: `${name} – SARTHI Originals`,
        slug: slug,
        description: detailedDesc,
        shortDescription: `Become an expert in ${name} with this hands-on, application-oriented masterclass. Build real-world projects, learn core methodologies, and earn your verified SARTHI Originals certification.`,
        category: category,
        categoryId: categoryId,
        level: level,
        thumbnail: thumbnail,
        thumbnailIcon: 'code',
        thumbnailColor: '#E8F5EE',
        price: fee,
        originalPrice: originalPrice || Math.round(fee * 1.5),
        pricing_type: pricingType,
        currency: 'INR',
        badge: 'ORIGINALS',
        isFeatured: index < 6, // Feature first 6
        isActive: true,
        rating: +(4.5 + (index % 5) * 0.1).toFixed(1),
        ratingCount: 120 + (index * 47) % 500,
        reviewCount: 120 + (index * 47) % 500,
        studentsEnrolled: 1200 + (index * 153) % 4000,
        totalDuration: 600 + (index * 120) % 1200, // in minutes
        metaTitle: `${name} Certificate Course | SARTHI Originals`,
        metaDescription: `Enroll in the complete ${name} program by SARTHI Originals. Build projects, master industry-focused concepts, and get certified.`,
        instructorId: 'instructor_mohit_raj', // kept for db schema integrity, but hidden in UI
        instructor: {
            id: 'instructor_mohit_raj',
            name: 'SARTHI Originals',
            image: '/images/instructors/mohit-raj-real.jpg',
        },
        curriculum: [
            {
                id: `mod_${slug}_1`,
                title: 'Phase 1: Getting Started & Core Foundations',
                duration: 200,
                isLocked: false,
                lessons: [
                    { id: `les_${slug}_1`, title: 'Lesson 1: Introduction and Environment Setup', videoUrl: 'https://www.youtube.com/watch?v=7wnphiZPqKs', duration: 15, isFreePreview: true, orderNumber: 1 },
                    { id: `les_${slug}_2`, title: 'Lesson 2: Core Concepts & Visual Guide', videoUrl: 'https://www.youtube.com/watch?v=Tto8UfokXN0', duration: 20, isFreePreview: true, orderNumber: 2 },
                    { id: `les_${slug}_3`, title: 'Lesson 3: First Practical Hand-on Exercise', videoUrl: 'https://www.youtube.com/watch?v=05uGjG_hS0M', duration: 25, isFreePreview: false, orderNumber: 3 }
                ]
            },
            {
                id: `mod_${slug}_2`,
                title: 'Phase 2: Advanced Implementation & Capstone Project',
                duration: 400,
                isLocked: false,
                lessons: [
                    { id: `les_${slug}_4`, title: 'Lesson 4: Building the Interactive Solution', videoUrl: 'https://www.youtube.com/watch?v=Xz2Xv7qOaEw', duration: 30, isFreePreview: false, orderNumber: 4 },
                    { id: `les_${slug}_5`, title: 'Lesson 5: Deployment, Best Practices and Optimization', videoUrl: 'https://www.youtube.com/watch?v=XZasN3aA-Sg', duration: 25, isFreePreview: false, orderNumber: 5 }
                ]
            }
        ]
    };
}

const rawCourses = [
    // DATA & ANALYTICS
    { name: "Advanced Microsoft Excel Course", fee: 1499, cat: "Business", catId: "cat_business", lvl: "Intermediate", slug: "advanced-microsoft-excel-course" },
    { name: "Excel Dashboard & MIS Reporting", fee: 1499, cat: "Business", catId: "cat_business", lvl: "Intermediate", slug: "excel-dashboard-mis-reporting" },
    { name: "Data Analytics with Excel", fee: 1999, cat: "Business", catId: "cat_business", lvl: "Professional", slug: "data-analytics-with-excel" },
    { name: "Power BI Complete Course", fee: 1999, cat: "Business", catId: "cat_business", lvl: "Professional", slug: "power-bi-complete-course" },
    { name: "Business Analytics Course", fee: 1999, cat: "Business", catId: "cat_business", lvl: "Professional", slug: "business-analytics-course" },
    { name: "SQL for Data Analysis", fee: 1499, cat: "Development", catId: "cat_development", lvl: "Intermediate", slug: "sql-for-data-analysis" },
    { name: "Data Visualization Masterclass", fee: 1499, cat: "Design", catId: "cat_design", lvl: "Intermediate", slug: "data-visualization-masterclass" },

    // AI & GENERATIVE AI
    { name: "Generative AI Complete Course", fee: 2999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "generative-ai-complete-course" },
    { name: "Prompt Engineering Masterclass", fee: 1499, cat: "Development", catId: "cat_development", lvl: "Intermediate", slug: "prompt-engineering-masterclass" },
    { name: "AI Tools for Students & Professionals", fee: 999, cat: "Business", catId: "cat_business", lvl: "Beginner", slug: "ai-tools-for-students-professionals" },
    { name: "AI Automation for Business", fee: 1999, cat: "Business", catId: "cat_business", lvl: "Professional", slug: "ai-automation-for-business" },
    { name: "AI Agents Development Course", fee: 2999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "ai-agents-development-course" },
    { name: "ChatGPT & AI Productivity Masterclass", fee: 1499, cat: "Business", catId: "cat_business", lvl: "Intermediate", slug: "chatgpt-ai-productivity-masterclass" },
    { name: "Generative AI for Content Creation", fee: 1499, cat: "Design", catId: "cat_design", lvl: "Intermediate", slug: "generative-ai-for-content-creation" },

    // PROGRAMMING
    { name: "Python Programming Complete Course", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "python-programming-complete-course" },
    { name: "Advanced Python for Professionals", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "advanced-python-for-professionals" },
    { name: "Python for Data Science", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "python-for-data-science" },
    { name: "Java Programming Masterclass", fee: 1499, cat: "Development", catId: "cat_development", lvl: "Intermediate", slug: "java-programming-masterclass" },
    { name: "C++ Programming Course", fee: 1499, cat: "Development", catId: "cat_development", lvl: "Intermediate", slug: "cpp-programming-course" },
    { name: "JavaScript Complete Course", fee: 1499, cat: "Development", catId: "cat_development", lvl: "Intermediate", slug: "javascript-complete-course" },

    // WEB DEVELOPMENT
    { name: "Full Stack Web Development Course", fee: 3999, cat: "Development", catId: "cat_development", lvl: "Advanced", slug: "full-stack-web-development-course" },
    { name: "MERN Stack Development", fee: 3999, cat: "Development", catId: "cat_development", lvl: "Advanced", slug: "mern-stack-development" },
    { name: "React JS Complete Course", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "react-js-complete-course" },
    { name: "Next.js Development Course", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "nextjs-development-course" },
    { name: "Node.js & Express.js Masterclass", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "nodejs-expressjs-masterclass" },

    // DATA SCIENCE & MACHINE LEARNING
    { name: "Data Science Complete Bootcamp", fee: 3999, cat: "Development", catId: "cat_development", lvl: "Advanced", slug: "data-science-complete-bootcamp" },
    { name: "Machine Learning with Python", fee: 2999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "machine-learning-with-python" },
    { name: "Deep Learning Masterclass", fee: 2999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "deep-learning-masterclass" },
    { name: "Computer Vision using Python", fee: 2499, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "computer-vision-using-python" },
    { name: "Natural Language Processing (NLP)", fee: 2499, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "natural-language-processing-nlp" },

    // CAREER PROGRAMS
    { name: "Data Analyst Job Preparation Program", fee: 2999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "data-analyst-job-preparation-program" },
    { name: "Business Analyst Career Program", fee: 2999, cat: "Business", catId: "cat_business", lvl: "Professional", slug: "business-analyst-career-program" },
    { name: "Python for Placement Preparation", fee: 1499, cat: "Development", catId: "cat_development", lvl: "Intermediate", slug: "python-for-placement-preparation" },
    { name: "DSA with Python", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "dsa-with-python" },
    { name: "DSA with Java", fee: 1999, cat: "Development", catId: "cat_development", lvl: "Professional", slug: "dsa-with-java" },
    { name: "Technical Interview Preparation", fee: 999, cat: "Development", catId: "cat_development", lvl: "Beginner", slug: "technical-interview-preparation" }
];

const processedCourses = rawCourses.map((c, i) => getCourseData(c.name, c.fee, i, c.cat, c.catId, c.lvl, c.slug));

const categoriesContent = `
export const INITIAL_CATEGORIES = [
  {
    id: 'cat_development',
    name: 'Development',
    slug: 'development',
    color_bg: '#E8F5EE',
    color_text: '#2D6A4F',
    icon: 'code'
  },
  {
    id: 'cat_finance',
    name: 'Finance',
    slug: 'finance',
    color_bg: '#FDF6E3',
    color_text: '#B8860B',
    icon: 'dollar-sign'
  },
  {
    id: 'cat_business',
    name: 'Business',
    slug: 'business',
    color_bg: '#F0F9FF',
    color_text: '#0369A1',
    icon: 'briefcase'
  },
  {
    id: 'cat_design',
    name: 'Design',
    slug: 'design',
    color_bg: '#FAF5FF',
    color_text: '#7E22CE',
    icon: 'pen-tool'
  }
];
`;

const instructorsContent = `
export const INITIAL_INSTRUCTORS = [
  {
    id: 'instructor_mohit_raj',
    name: 'SARTHI Originals',
    role: 'Academy Director',
    company: 'SARTHI',
    bio: 'Premium curriculum and learning paths curated directly by the SARTHI Originals team.',
    image: '',
  }
];
`;

const seminarsContent = `
export const INITIAL_SEMINARS = [];
`;

const workshopsContent = `
export const INITIAL_WORKSHOPS = [];
`;

const fileContent = `
${categoriesContent}

export const INITIAL_COURSES = ${JSON.stringify(processedCourses, null, 2)};

${instructorsContent}

${seminarsContent}

${workshopsContent}
`;

fs.writeFileSync(path.join(__dirname, '../lib/initial-data.ts'), fileContent.trim() + '\n');
console.log('✅ Generated initial-data.ts with all 36 branded courses.');
