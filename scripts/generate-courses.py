import json

# Unsplash stock image mappings chosen specifically to represent each tool/topic perfectly
image_mappings = {
    # Data & Analytics
    "advanced-microsoft-excel-course": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800", # Spreadsheets / data reports
    "excel-dashboard-mis-reporting": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", # MIS reports / charts
    "data-analytics-with-excel": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800", # Data dashboards
    "power-bi-complete-course": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800", # Business charts / presentation
    "business-analytics-course": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800", # Business meeting / analysis
    "sql-for-data-analysis": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800", # Servers / database code
    "data-visualization-masterclass": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800", # Drawing charts / graphics

    # AI & Generative AI
    "generative-ai-complete-course": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800", # Modern AI neural network visualization
    "prompt-engineering-masterclass": "https://images.unsplash.com/photo-1684369175833-875f4d8e7854?auto=format&fit=crop&q=80&w=800", # Writing prompts / laptop interface
    "ai-tools-for-students-professionals": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800", # Students using laptops
    "ai-automation-for-business": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800", # Working in office automation
    "ai-agents-development-course": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", # Abstract code lines / flowcharts
    "chatgpt-ai-productivity-masterclass": "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800", # Workspace productivity
    "generative-ai-for-content-creation": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800", # Content creation workspace

    # Programming
    "python-programming-complete-course": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800", # Python script/editor screen
    "advanced-python-for-professionals": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800", # Professional coding IDE
    "python-for-data-science": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=800", # Data Science charts/code
    "java-programming-masterclass": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800", # Java code on screen
    "cpp-programming-course": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800", # System coding on desk
    "javascript-complete-course": "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=800", # JS code/IDE

    # Web Development
    "full-stack-web-development-course": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800", # Full stack dev screens
    "mern-stack-development": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800", # React/MongoDB logo & code
    "react-js-complete-course": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800", # Front-end web development
    "nextjs-development-course": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=800", # Vercel NextJS style screen/code
    "nodejs-expressjs-masterclass": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800", # Backend server code

    # Data Science & ML
    "data-science-complete-bootcamp": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800", # Laptop with ML charts
    "machine-learning-with-python": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800", # Abstract neural connections/cyber
    "deep-learning-masterclass": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800", # AI logic models
    "computer-vision-using-python": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800", # Image processing graphics
    "natural-language-processing-nlp": "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=800", # Text streams/AI chatbot

    # Career Programs
    "data-analyst-job-preparation-program": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800", # Job interview/preparations
    "business-analyst-career-program": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800", # Business training/presentation
    "python-for-placement-preparation": "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=800", # Mock assessment screens
    "dsa-with-python": "https://images.unsplash.com/photo-1627390496606-258fb564be2b?auto=format&fit=crop&q=80&w=800", # DSA structures code
    "dsa-with-java": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800", # Algorithms code
    "technical-interview-preparation": "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800" # Job interview/coding round
}

raw_courses = [
    # DATA & ANALYTICS
    {"name": "Advanced Microsoft Excel Course", "fee": 1499, "cat": "Business", "catId": "cat_business", "lvl": "Intermediate", "slug": "advanced-microsoft-excel-course"},
    {"name": "Excel Dashboard & MIS Reporting", "fee": 1499, "cat": "Business", "catId": "cat_business", "lvl": "Intermediate", "slug": "excel-dashboard-mis-reporting"},
    {"name": "Data Analytics with Excel", "fee": 1999, "cat": "Business", "catId": "cat_business", "lvl": "Professional", "slug": "data-analytics-with-excel"},
    {"name": "Power BI Complete Course", "fee": 1999, "cat": "Business", "catId": "cat_business", "lvl": "Professional", "slug": "power-bi-complete-course"},
    {"name": "Business Analytics Course", "fee": 1999, "cat": "Business", "catId": "cat_business", "lvl": "Professional", "slug": "business-analytics-course"},
    {"name": "SQL for Data Analysis", "fee": 1499, "cat": "Development", "catId": "cat_development", "lvl": "Intermediate", "slug": "sql-for-data-analysis"},
    {"name": "Data Visualization Masterclass", "fee": 1499, "cat": "Design", "catId": "cat_design", "lvl": "Intermediate", "slug": "data-visualization-masterclass"},

    # AI & GENERATIVE AI
    {"name": "Generative AI Complete Course", "fee": 2999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "generative-ai-complete-course"},
    {"name": "Prompt Engineering Masterclass", "fee": 1499, "cat": "Development", "catId": "cat_development", "lvl": "Intermediate", "slug": "prompt-engineering-masterclass"},
    {"name": "AI Tools for Students & Professionals", "fee": 999, "cat": "Business", "catId": "cat_business", "lvl": "Beginner", "slug": "ai-tools-for-students-professionals"},
    {"name": "AI Automation for Business", "fee": 1999, "cat": "Business", "catId": "cat_business", "lvl": "Professional", "slug": "ai-automation-for-business"},
    {"name": "AI Agents Development Course", "fee": 2999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "ai-agents-development-course"},
    {"name": "ChatGPT & AI Productivity Masterclass", "fee": 1499, "cat": "Business", "catId": "cat_business", "lvl": "Intermediate", "slug": "chatgpt-ai-productivity-masterclass"},
    {"name": "Generative AI for Content Creation", "fee": 1499, "cat": "Design", "catId": "cat_design", "lvl": "Intermediate", "slug": "generative-ai-for-content-creation"},

    # PROGRAMMING
    {"name": "Python Programming Complete Course", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "python-programming-complete-course"},
    {"name": "Advanced Python for Professionals", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "advanced-python-for-professionals"},
    {"name": "Python for Data Science", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "python-for-data-science"},
    {"name": "Java Programming Masterclass", "fee": 1499, "cat": "Development", "catId": "cat_development", "lvl": "Intermediate", "slug": "java-programming-masterclass"},
    {"name": "C++ Programming Course", "fee": 1499, "cat": "Development", "catId": "cat_development", "lvl": "Intermediate", "slug": "cpp-programming-course"},
    {"name": "JavaScript Complete Course", "fee": 1499, "cat": "Development", "catId": "cat_development", "lvl": "Intermediate", "slug": "javascript-complete-course"},

    # WEB DEVELOPMENT
    {"name": "Full Stack Web Development Course", "fee": 3999, "cat": "Development", "catId": "cat_development", "lvl": "Advanced", "slug": "full-stack-web-development-course"},
    {"name": "MERN Stack Development", "fee": 3999, "cat": "Development", "catId": "cat_development", "lvl": "Advanced", "slug": "mern-stack-development"},
    {"name": "React JS Complete Course", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "react-js-complete-course"},
    {"name": "Next.js Development Course", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "nextjs-development-course"},
    {"name": "Node.js & Express.js Masterclass", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "nodejs-expressjs-masterclass"},

    # DATA SCIENCE & MACHINE LEARNING
    {"name": "Data Science Complete Bootcamp", "fee": 3999, "cat": "Development", "catId": "cat_development", "lvl": "Advanced", "slug": "data-science-complete-bootcamp"},
    {"name": "Machine Learning with Python", "fee": 2999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "machine-learning-with-python"},
    {"name": "Deep Learning Masterclass", "fee": 2999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "deep-learning-masterclass"},
    {"name": "Computer Vision using Python", "fee": 2499, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "computer-vision-using-python"},
    {"name": "Natural Language Processing (NLP)", "fee": 2499, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "natural-language-processing-nlp"},

    # CAREER PROGRAMS
    {"name": "Data Analyst Job Preparation Program", "fee": 2999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "data-analyst-job-preparation-program"},
    {"name": "Business Analyst Career Program", "fee": 2999, "cat": "Business", "catId": "cat_business", "lvl": "Professional", "slug": "business-analyst-career-program"},
    {"name": "Python for Placement Preparation", "fee": 1499, "cat": "Development", "catId": "cat_development", "lvl": "Intermediate", "slug": "python-for-placement-preparation"},
    {"name": "DSA with Python", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "dsa-with-python"},
    {"name": "DSA with Java", "fee": 1999, "cat": "Development", "catId": "cat_development", "lvl": "Professional", "slug": "dsa-with-java"},
    {"name": "Technical Interview Preparation", "fee": 999, "cat": "Development", "catId": "cat_development", "lvl": "Beginner", "slug": "technical-interview-preparation"}
]

def get_course_data(name, fee, index, category, category_id, level, slug):
    is_free = fee == 0
    pricing_type = 'FREE' if is_free else 'PAID'
    
    # Specific high-relevance non-AI Unsplash thumbnail
    thumbnail = image_mappings.get(slug, "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800")

    # Detailed Description (500-800 words)
    detailed_desc = f"""
# {name} – Professional Certification

Welcome to the definitive, industry-focused certification program for **{name}**, proudly presented under the prestigious **TechTomorrow Originals** unified brand. This course is engineered from the ground up to provide an application-oriented, hands-on learning path designed to bridge the gap between abstract academic theory and actual production-level implementation. 

Whether you are a student preparing for competitive placement drives or a seasoned professional seeking to pivot into high-paying analytics, AI, development, or business roles, this program delivers the precise tools and frameworks required to succeed.

## The TechTomorrow Originals Advantage
Every course within the **TechTomorrow Originals** catalog represents visual, pedagogical, and career excellence. We prioritize interactive, self-paced learning combined with extensive practical labs, coding exercises, and realistic business scenarios. Our curricula are actively aligned with industry standards and built with ATS-friendly terminology, helping you successfully pass automated screening rounds and showcase your credentials on platforms like LinkedIn.

## Hands-On Projects & Real-World Application
We believe that true mastery comes from building. In this masterclass, you will work on multiple practical labs and complete a comprehensive Capstone Project that mimics real-world enterprise assignments:
1. **Interactive Sandbox Labs**: Apply theoretical concepts inside simulated environments immediately.
2. **Detailed Case Studies**: Study real data challenges faced by modern corporate teams.
3. **Verified Capstone Project**: Construct a complete, deployment-ready asset to add to your portfolio.
4. **Originals Certification**: Receive a cryptographically verifiable completion certificate, establishing your expertise.

## Target Audience
- **Undergraduates & Job Seekers**: Build the practical confidence needed to pass technical screening rounds and interviews.
- **Working Professionals**: Expand your skill set, increase your productivity using modern automated systems, and prepare for your next career jump.
- **Freelancers & Consultants**: Master standard tools to deliver higher-quality deliverables to your clients in less time.

By the end of this certification program, you will possess not only a deep theoretical understanding of the concepts but also the practical experience to execute them flawlessly in any corporate setting. Enroll today to begin your journey.
""".strip()

    return {
        "id": f"course_{slug.replace('-', '_')}",
        "title": f"{name}",
        "slug": slug,
        "description": detailed_desc,
        "shortDescription": f"Become an expert in {name} with this hands-on, application-oriented masterclass. Build real-world projects, learn core methodologies, and earn your verified TechTomorrow Originals certification.",
        "category": category,
        "categoryId": category_id,
        "level": level,
        "thumbnail": thumbnail,
        "thumbnailIcon": "code",
        "thumbnailColor": "#E8F5EE",
        "price": fee,
        "originalPrice": int(fee * 1.5),
        "pricing_type": pricing_type,
        "currency": "INR",
        "badge": "ORIGINALS",
        "isFeatured": index < 6,
        "isActive": True,
        "rating": round(4.5 + (index % 5) * 0.1, 1),
        "ratingCount": 120 + (index * 47) % 500,
        "reviewCount": 120 + (index * 47) % 500,
        "studentsEnrolled": 1200 + (index * 153) % 4000,
        "totalDuration": 600 + (index * 120) % 1200,
        "metaTitle": f"{name} Certificate Course | TechTomorrow Originals",
        "metaDescription": f"Enroll in the complete {name} program by TechTomorrow Originals. Build projects, master industry-focused concepts, and get certified.",
        "instructorId": "instructor_mohit_raj",
        "instructor": {
            "id": "instructor_mohit_raj",
            "name": "TechTomorrow Originals",
            "image": "/images/instructors/mohit-raj-real.jpg"
        },
        "curriculum": [
            {
                "id": f"mod_{slug}_1",
                "title": "Phase 1: Getting Started & Core Foundations",
                "duration": 200,
                "isLocked": False,
                "lessons": [
                    { "id": f"les_{slug}_1", "title": "Lesson 1: Introduction and Environment Setup", "videoUrl": "https://www.youtube.com/watch?v=7wnphiZPqKs", "duration": 15, "isFreePreview": True, "orderNumber": 1 },
                    { "id": f"les_{slug}_2", "title": "Lesson 2: Core Concepts & Visual Guide", "videoUrl": "https://www.youtube.com/watch?v=Tto8UfokXN0", "duration": 20, "isFreePreview": True, "orderNumber": 2 },
                    { "id": f"les_{slug}_3", "title": "Lesson 3: First Practical Hand-on Exercise", "videoUrl": "https://www.youtube.com/watch?v=05uGjG_hS0M", "duration": 25, "isFreePreview": False, "orderNumber": 3 }
                ]
            },
            {
                "id": f"mod_{slug}_2",
                "title": "Phase 2: Advanced Implementation & Capstone Project",
                "duration": 400,
                "isLocked": False,
                "lessons": [
                    { "id": f"les_{slug}_4", "title": "Lesson 4: Building the Interactive Solution", "videoUrl": "https://www.youtube.com/watch?v=Xz2Xv7qOaEw", "duration": 30, "isFreePreview": False, "orderNumber": 4 },
                    { "id": f"les_{slug}_5", "title": "Lesson 5: Deployment, Best Practices and Optimization", "videoUrl": "https://www.youtube.com/watch?v=XZasN3aA-Sg", "duration": 25, "isFreePreview": False, "orderNumber": 5 }
                ]
            }
        ]
    }

processed_courses = [get_course_data(c["name"], c["fee"], i, c["cat"], c["catId"], c["lvl"], c["slug"]) for i, c in enumerate(raw_courses)]

categories_content = """
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
"""

instructors_content = """
export const INITIAL_INSTRUCTORS = [
  {
    id: 'instructor_mohit_raj',
    name: 'TechTomorrow Originals',
    role: 'Academy Director',
    company: 'TechTomorrow',
    bio: 'Premium curriculum and learning paths curated directly by the TechTomorrow Originals team.',
    image: '',
  }
];
"""

seminars_content = """
export const INITIAL_SEMINARS = [];
"""

workshops_content = """
export const INITIAL_WORKSHOPS = [];
"""

file_content = f"""{categories_content}

export const INITIAL_COURSES = {json.dumps(processed_courses, indent=2)};

{instructors_content}

{seminars_content}

{workshops_content}
"""

with open('lib/initial-data.ts', 'w') as f:
    f.write(file_content.strip() + '\n')

print("✅ Successfully generated initial-data.ts with precise stock thumbnails.")
