// SARTHI AI Knowledge Base
// Comprehensive information about all services offered by SARTHI

export const TECH_TOMORROW_KNOWLEDGE = {
  about: {
    name: "SARTHI",
    tagline: "World-class tech education with live mentorship",
    description: "SARTHI is an NPO (Non-Profit Organization) dedicated to making tech education accessible to everyone. We provide live mentorship from industry experts, real-world project-based learning, and comprehensive courses in various tech domains.",
    mission: "To democratize tech education and help students build successful careers in technology through hands-on learning and expert guidance.",
    values: ["Accessibility", "Excellence", "Community", "Innovation", "Growth"]
  },

  courses: {
    categories: [
      {
        name: "Web Development",
        slug: "web-development",
        description: "Master modern web technologies including HTML, CSS, JavaScript, React, Next.js, and more",
        courses: ["Complete Web Development Bootcamp", "React & Next.js Mastery", "Node.js Backend Development", "Full Stack Projects"],
        level: "Beginner to Advanced",
        careerPaths: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Web Developer"]
      },
      {
        name: "AI & Machine Learning",
        slug: "ai-ml",
        description: "Learn artificial intelligence, machine learning, deep learning, and data science",
        courses: ["Python for AI & ML", "Deep Learning with TensorFlow", "NLP & Computer Vision", "AI Project Development"],
        level: "Intermediate to Advanced",
        careerPaths: ["Machine Learning Engineer", "Data Scientist", "AI Researcher", "MLOps Engineer"]
      },
      {
        name: "Cybersecurity",
        slug: "cybersecurity",
        description: "Learn to protect systems and networks from cyber threats",
        courses: ["Ethical Hacking Fundamentals", "Network Security", "Web Application Security", "Security Operations"],
        level: "Beginner to Advanced",
        careerPaths: ["Security Analyst", "Penetration Tester", "Security Engineer", "SOC Analyst"]
      },
      {
        name: "Data Science",
        slug: "data-science",
        description: "Master data analysis, visualization, and statistical modeling",
        courses: ["Data Science with Python", "SQL & Database Management", "Data Visualization", "Big Data Analytics"],
        level: "Beginner to Advanced",
        careerPaths: ["Data Analyst", "Data Scientist", "Business Analyst", "BI Developer"]
      }
    ],
    features: [
      "Direct mentorship from industry specialists",
      "Hands-on projects with real-world applications",
      "Certificate of Completion",
      "Offline downloads for mobile learning",
      "Community support and peer learning",
      "Lifetime access to course materials",
      "Regular updates to stay current with industry trends"
    ],
    pricing: {
      free: ["Access to free courses", "Community support", "Basic profile"],
      pro: {
        price: "₹299/month",
        features: ["Access to all courses", "Certificate of Completion", "Priority support", "Offline downloads"]
      },
      business: {
        price: "₹999/month",
        features: ["Team management", "Analytics dashboard", "Custom learning paths", "Dedicated account manager"]
      }
    }
  },

  seminars: {
    description: "Live interactive sessions with industry experts",
    features: [
      "Real-time Q&A with instructors",
      "Live coding demonstrations",
      "Project reviews and feedback",
      "Industry insights and trends",
      "Networking opportunities"
    ],
    sessionTypes: [
      { type: "LIVE", label: "Live Now", color: "red" },
      { type: "UPCOMING", label: "Upcoming", color: "orange" },
      { type: "REPLAY", label: "Replays", color: "blue" }
    ],
    levels: ["Beginner", "Intermediate", "Advanced"],
    benefits: [
      "Watch replays anytime",
      "Set reminders for upcoming sessions",
      "Download resources",
      "Earn certificates for participation",
      "Interact with other learners"
    ]
  },

  workshops: {
    description: "Specialized webinars and workshops on cutting-edge topics",
    features: [
      "Deep-dive sessions on specific topics",
      "Guest speakers from top companies",
      "Interactive workshops",
      "Q&A opportunities",
      "Certificate of participation"
    ],
    registrationProcess: [
      "Browse upcoming seminars",
      "Click 'Register Now'",
      "Create an account or login",
      "Receive confirmation email",
      "Join the live session on scheduled date"
    ]
  },

  mentorship: {
    description: "One-on-one guidance from industry professionals",
    features: [
      "Personalized learning path",
      "Code reviews and feedback",
      "Career guidance",
      "Project mentorship",
      "Mock interviews",
      "Resume reviews"
    ],
    mentors: {
      qualifications: ["5+ years industry experience", "Proven track record", "Passion for teaching"],
      areas: ["Frontend Development", "Backend Development", "DevOps", "Machine Learning", "Data Science", "Cybersecurity"]
    },
    howToGetStarted: [
      "Sign up for an account",
      "Choose your learning path",
      "Get matched with a mentor",
      "Schedule your first session",
      "Start your journey"
    ]
  },

  certificates: {
    description: "Industry-recognized certificates to showcase your skills",
    types: [
      { name: "Course Completion", description: "Complete all lessons and assessments in a course" },
      { name: "Project Certification", description: "Build and submit a capstone project" },
      { name: "Skill Mastery", description: "Demonstrate expertise in a specific technology" }
    ],
    verification: "Certificates can be verified using a unique certificate number at /verify",
    benefits: ["Add to LinkedIn profile", "Share with employers", "Build professional credibility"]
  },

  careerSupport: {
    description: "Comprehensive support to help you land your dream job",
    services: [
      {
        name: "Resume Review",
        description: "Get feedback on your resume from industry experts"
      },
      {
        name: "Mock Interviews",
        description: "Practice technical interviews with experienced interviewers"
      },
      {
        name: "Job Board",
        description: "Access exclusive job opportunities from our hiring partners"
      },
      {
        name: "Career Counseling",
        description: "One-on-one sessions to plan your career path"
      }
    ],
    hiringPartners: "Connect with top tech companies actively hiring our graduates"
  },

  payments: {
    methods: ["Razorpay", "Credit/Debit Cards", "Net Banking", "UPI"],
    currency: "INR",
    refundPolicy: "7-day money-back guarantee for all paid plans",
    support: "Contact payments@sarthi-woad.vercel.app for payment-related queries"
  },

  support: {
    channels: [
      { type: "Email", contact: "support@sarthi.in", responseTime: "24-48 hours" },
      { type: "Live Chat", contact: "Available on website", responseTime: "Instant" },
      { type: "Community Forum", contact: "SARTHI Discord", responseTime: "Varies" }
    ],
    commonIssues: [
      "Payment failures",
      "Course access issues",
      "Certificate generation",
      "Technical difficulties",
      "Account recovery"
    ],
    helpCenter: "/support"
  },

  community: {
    platforms: ["Discord", "Twitter", "LinkedIn", "Instagram"],
    discordBenefits: [
      "Connect with fellow learners",
      "Get help with coding questions",
      "Attend community events",
      "Share your projects",
      "Network with mentors"
    ],
    events: ["Weekly coding challenges", "Monthly hackathons", "Career fairs", "Guest speaker sessions"]
  },

  gettingStarted: {
    steps: [
      {
        step: 1,
        title: "Create Your Account",
        description: "Sign up for free at SARTHI",
        link: "/signup"
      },
      {
        step: 2,
        title: "Explore Courses",
        description: "Browse our catalog and find your interests",
        link: "/courses"
      },
      {
        step: 3,
        title: "Start Learning",
        description: "Begin with free courses or upgrade to Pro",
        link: "/pricing"
      },
      {
        step: 4,
        title: "Join Seminars",
        description: "Participate in interactive sessions",
        link: "/seminars"
      },
      {
        step: 5,
        title: "Get Certified",
        description: "Complete projects and earn certificates",
        link: "/certificates"
      }
    ],
    forBeginners: [
      "Start with our free 'Introduction to Programming' course",
      "Join our community Discord for support",
      "Attend beginner-friendly seminars",
      "Build your first project",
      "Connect with a mentor for guidance"
    ]
  },

  careerPaths: {
    options: [
      {
        path: "Web Developer",
        courses: ["HTML & CSS", "JavaScript", "React", "Node.js", "Databases"],
        timeline: "3-6 months",
        salary: "₹3-8 LPA (Entry)",
        demand: "Very High"
      },
      {
        path: "Machine Learning Engineer",
        courses: ["Python", "Math & Statistics", "Machine Learning", "Deep Learning", "MLOps"],
        timeline: "6-12 months",
        salary: "₹6-15 LPA (Entry)",
        demand: "High"
      },
      {
        path: "Data Scientist",
        courses: ["Python", "SQL", "Data Analysis", "Visualization", "ML"],
        timeline: "6-9 months",
        salary: "₹5-12 LPA (Entry)",
        demand: "High"
      },
      {
        path: "Cybersecurity Analyst",
        courses: ["Networking", "Security Fundamentals", "Ethical Hacking", "SIEM Tools"],
        timeline: "4-8 months",
        salary: "₹4-10 LPA (Entry)",
        demand: "Growing"
      }
    ],
    factors: ["Your interests", "Time commitment", "Prior experience", "Career goals"]
  },

  frequentlyAskedQuestions: {
    general: [
      {
        q: "What is SARTHI?",
        a: "SARTHI is an NPO focused on providing world-class tech education through live mentorship, hands-on projects, and comprehensive courses."
      },
      {
        q: "Are the courses free?",
        a: "We offer both free and paid courses. Free courses provide basic access, while Pro and Business plans unlock all content and features."
      },
      {
        q: "Do I need prior experience to start?",
        a: "No! We have courses for all skill levels, from complete beginners to advanced professionals."
      },
      {
        q: "How long does it take to complete a course?",
        a: "Course duration varies. Most beginner courses take 4-8 weeks, while comprehensive programs may take 3-6 months depending on your pace."
      }
    ],
    enrollment: [
      {
        q: "How do I enroll in a course?",
        a: "Simply browse our courses, click on your desired course, and click 'Enroll'. Free courses are immediately accessible, paid courses require checkout."
      },
      {
        q: "Can I switch courses after enrolling?",
        a: "Yes, you can switch between courses. Your progress will be saved, and you can continue from where you left off."
      },
      {
        q: "Is there a limit to how many courses I can take?",
        a: "Pro and Business subscribers have unlimited access to all courses. Free users can access one free course at a time."
      }
    ],
    certificates: [
      {
        q: "How do I get a certificate?",
        a: "Complete all lessons, assignments, and projects in a course to earn your certificate. Certificates are generated automatically upon completion."
      },
      {
        q: "Are certificates verified?",
        a: "Yes, each certificate has a unique verification number that employers can check at /verify."
      },
      {
        q: "Can I download my certificate?",
        a: "Yes, you can download your certificate in PDF format from your dashboard."
      }
    ],
    payments: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards, net banking, UPI, and wallets through Razorpay."
      },
      {
        q: "Do you offer refunds?",
        a: "Yes, we offer a 7-day money-back guarantee. Contact support@sarthi.in for refund requests."
      },
      {
        q: "Can I pause my subscription?",
        a: "Yes, you can pause your subscription for up to 3 months. Contact support to arrange this."
      }
    ],
    technical: [
      {
        q: "Can I access courses on mobile?",
        a: "Yes! Our platform is fully responsive. Pro users can also download lessons for offline viewing."
      },
      {
        q: "What if I face technical issues?",
        a: "Contact our support team at support@sarthi.in or use the live chat on our website."
      },
      {
        q: "Do I need special software?",
        a: "Most courses use free, open-source tools. Any paid software requirements will be listed in the course description."
      }
    ]
  }
};

// Helper function to generate responses based on user queries
export function generateResponse(userQuery: string, knowledge: typeof TECH_TOMORROW_KNOWLEDGE): string {
  const query = userQuery.toLowerCase();

  // Match keywords to generate appropriate responses
  if (query.includes("course") || query.includes("learn") || query.includes("study")) {
    return JSON.stringify(knowledge.courses, null, 2);
  }
  if (query.includes("live session") || query.includes("mentor") || query.includes("class")) {
    return JSON.stringify(knowledge.seminars, null, 2);
  }
  if (query.includes("price") || query.includes("cost") || query.includes("pay") || query.includes("subscription")) {
    return JSON.stringify(knowledge.payments, null, 2);
  }
  if (query.includes("certificate") || query.includes("certification") || query.includes("verify")) {
    return JSON.stringify(knowledge.certificates, null, 2);
  }
  if (query.includes("job") || query.includes("career") || query.includes("placement") || query.includes("hire")) {
    return JSON.stringify(knowledge.careerSupport, null, 2);
  }
  if (query.includes("start") || query.includes("beginner") || query.includes("how to begin")) {
    return JSON.stringify(knowledge.gettingStarted, null, 2);
  }
  if (query.includes("refund") || query.includes("money back")) {
    return JSON.stringify(knowledge.payments, null, 2);
  }
  if (query.includes("support") || query.includes("help") || query.includes("contact")) {
    return JSON.stringify(knowledge.support, null, 2);
  }
  if (query.includes("community") || query.includes("discord") || query.includes("forum")) {
    return JSON.stringify(knowledge.community, null, 2);
  }

  return "";
}

export default TECH_TOMORROW_KNOWLEDGE;
