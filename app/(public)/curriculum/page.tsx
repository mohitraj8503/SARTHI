import { Code, Calculator, FileText, Users, BookOpen, GraduationCap, Star, Play, CheckCircle, TrendingUp } from 'lucide-react';
import CurriculumClient from './CurriculumClient';

const CURRICULUM_DATA = [
  {
    id: 'python',
    title: 'Python Programming',
    subtitle: 'Master the language of data & AI',
    description: 'From zero to building real-world applications. Learn programming fundamentals, data structures, and problem-solving with Python.',
    iconName: 'Code',
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    courses: [
      {
        id: 'python-beginners',
        title: 'Python for Beginners',
        description: 'Start your programming journey with Python. Learn syntax, variables, loops, functions, and build your first programs.',
        duration: '6-8 weeks',
        lessons: 45,
        level: 'Beginner',
        skills: ['Python Basics', 'Data Types', 'Control Flow', 'Functions', 'OOP Basics'],
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop'
      },
      {
        id: 'python-advanced',
        title: 'Python Advanced',
        description: 'Take your Python skills to the next level with advanced concepts, libraries, and real-world projects.',
        duration: '8-10 weeks',
        lessons: 60,
        level: 'Intermediate',
        skills: ['Advanced OOP', 'File Handling', 'Database', 'APIs', 'Automation'],
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop'
      }
    ]
  },
  {
    id: 'excel',
    title: 'AI-Powered Advanced Excel',
    subtitle: 'Master data analysis & visualization',
    description: 'Transform raw data into powerful insights. Learn formulas, pivot tables, macros, and data visualization techniques.',
    iconName: 'Calculator',
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    courses: [
      {
        id: 'excel-beginner',
        title: 'Excel Fundamentals',
        description: 'Build a strong foundation with formulas, basic functions, and data organization techniques.',
        duration: '4-6 weeks',
        lessons: 30,
        level: 'Beginner',
        skills: ['Formulas', 'Functions', 'Basic Charts', 'Data Formatting', 'Tables'],
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop'
      },
      {
        id: 'excel-advanced',
        title: 'AI-Powered Advanced Excel Mastery',
        description: 'Master complex formulas, pivot tables, macros, VBA, and create automated dashboards.',
        duration: '6-8 weeks',
        lessons: 50,
        level: 'Advanced',
        skills: ['Pivot Tables', 'VLOOKUP', 'Macros', 'VBA', 'Dashboards', 'Power Query'],
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
      }
    ]
  },
  {
    id: 'taxation',
    title: 'Taxation',
    subtitle: 'GST & Income Tax Experts',
    description: 'Become a certified tax professional. Learn Artificial Intelligence in GST Filing, Income Tax Returns, and financial planning.',
    iconName: 'FileText',
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    courses: [
      {
        id: 'gst',
        title: 'Artificial Intelligence in GST Filing',
        description: 'Complete GST training from registration to returns. Understand GST laws, Input Tax Credit, and filing procedures.',
        duration: '4-6 weeks',
        lessons: 35,
        level: 'Intermediate',
        skills: ['GST Registration', 'GST Laws', 'Input Tax Credit', 'GST Returns', 'E-Way Bills'],
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop'
      },
      {
        id: 'itr',
        title: 'Income Tax Returns',
        description: 'Learn to file ITR for individuals and businesses. Understand deductions, exemptions, and tax planning.',
        duration: '4-6 weeks',
        lessons: 40,
        level: 'Intermediate',
        skills: ['ITR Forms', 'Deductions', 'Tax Planning', 'Form 16', 'Tax Audit'],
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop'
      },
      {
        id: 'gst-itr-combo',
        title: 'GST & Income Tax Combo',
        description: 'Master both GST and Income Tax with this comprehensive bundle. Save 30% and become a complete tax expert.',
        duration: '10-12 weeks',
        lessons: 75,
        level: 'Advanced',
        skills: ['All GST Topics', 'All ITR Topics', 'Tax Planning', 'Financial Planning', 'Client Management'],
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop'
      }
    ]
  }
];

const STATS = [
  { iconName: 'Users', value: '15,000+', label: 'Students Enrolled' },
  { iconName: 'BookOpen', value: '150+', label: 'Video Lessons' },
  { iconName: 'GraduationCap', value: '5,000+', label: 'Certificates Issued' },
  { iconName: 'Star', value: '4.9', label: 'Average Rating' },
];

const FEATURES = [
  { iconName: 'Play', title: 'Video-Based Learning', description: 'High-quality video lessons that you can watch anytime, anywhere.' },
  { iconName: 'CheckCircle', title: 'Hands-On Projects', description: 'Apply what you learn with real-world projects and assignments.' },
  { iconName: 'Users', title: 'Expert Instructors', description: 'Learn from industry professionals with years of experience.' },
  { iconName: 'TrendingUp', title: 'Career Support', description: 'Get guidance for career opportunities after course completion.' }
];

export default function CurriculumPage() {
  return (
    <CurriculumClient 
      curriculumData={CURRICULUM_DATA} 
      stats={STATS} 
      features={FEATURES} 
    />
  );
}

