'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronRight, Clock, BookOpen, ArrowRight, Play, Calculator, FileText, Code, TrendingUp, Users, GraduationCap, Star, CheckCircle } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    Search, ChevronRight, Clock, BookOpen, ArrowRight, Play, Calculator, FileText, Code, TrendingUp, Users, GraduationCap, Star, CheckCircle
};

function IconRenderer({ name, className }: { name: string; className?: string }) {
    const Icon = ICON_MAP[name] || BookOpen;
    return <Icon className={className} />;
}
import { motion } from 'framer-motion';

interface CurriculumClientProps {
    curriculumData: any[];
    stats: any[];
    features: any[];
}

export default function CurriculumClient({ curriculumData, stats, features }: CurriculumClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => 
        searchQuery
            ? curriculumData.map(category => ({
                ...category,
                courses: category.courses.filter((course: any) =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.skills.some((skill: any) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            })).filter(category => category.courses.length > 0)
            : curriculumData,
        [searchQuery, curriculumData]
    );

    return (
        <main className="min-h-screen bg-[#F5F0E8] text-[#1A3C2E]">
            {/* HERO SECTION */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop"
                        alt="Background"
                        fill
                        priority
                        className="object-cover blur-[8px] scale-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0E8]/95 via-[#F5F0E8]/90 to-[#F5F0E8]" />
                </div>

                <div className="absolute inset-0 z-0 opacity-10">
                    <div 
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(45, 106, 79, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(45, 106, 79, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>

                <div className="relative z-10 container mx-auto px-6 pt-32 pb-16 text-center">
                    <nav className="flex items-center justify-center gap-2 mb-6 text-sm">
                        <Link href="/" className="text-[#5F6E5F] hover:text-[#1A3C2E] transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-[#5D705C]" />
                        <span className="text-[#2D6A4F] font-medium">Curriculum</span>
                    </nav>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A3C2E] mb-6 tracking-tight"
                    >
                        Our <span className="text-[#2D6A4F]">Courses</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-[#5F6E5F] max-w-2xl mx-auto mb-8"
                    >
                        Master in-demand skills with our comprehensive courses. 
                        From Python programming to taxation, we&apos;ve got you covered.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-xl mx-auto mb-12"
                    >
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C]" aria-hidden="true" />
                                    <input
                                        type="text"
                                        placeholder="Search courses, skills, or topics..."
                                        aria-label="Search courses, skills, or topics"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-[#E8E2D9] rounded-2xl text-[#1A3C2E] placeholder-[#5D705C] focus:border-[#2D6A4F] focus:outline-none transition-colors shadow-lg"
                                    />
                                </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <IconRenderer name={stat.iconName} className="w-5 h-5 text-[#2D6A4F]" />
                                    <div className="text-3xl font-bold text-[#2D6A4F]">{stat.value}</div>
                                </div>
                                <div className="text-[#5F6E5F] text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* WHY CHOOSE SECTION */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1A3C2E] mb-4">
                            Why Choose SARTHI?
                        </h2>
                        <p className="text-[#5F6E5F] max-w-2xl mx-auto">
                            We provide the best learning experience with industry-recognized courses and expert instructors.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center p-6 rounded-2xl bg-[#F5F0E8] hover:shadow-lg transition-shadow"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#2D6A4F] flex items-center justify-center">
                                    <IconRenderer name={feature.iconName} className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1A3C2E] mb-2">{feature.title}</h3>
                                <p className="text-[#5F6E5F] text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1A3C2E] mb-4">
                            Explore Our <span className="text-[#2D6A4F]">Courses</span>
                        </h2>
                        <p className="text-[#5F6E5F] max-w-2xl mx-auto">
                            Choose from our range of professional courses designed to help you succeed in your career.
                        </p>
                    </motion.div>

                    {filteredData.map((category, index) => (
                        <CategorySection key={category.id} category={category} index={index} />
                    ))}

                    {filteredData.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                                <Search className="w-10 h-10 text-[#5F6E5F]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1A3C2E] mb-2">No courses found</h3>
                            <p className="text-[#5F6E5F] mb-6">Try searching for a different skill or topic.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D6A4F] text-white font-semibold rounded-xl hover:bg-[#1A3C2E] transition-colors"
                            >
                                View All Courses
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 bg-gradient-to-br from-[#2D6A4F] to-[#1A3C2E]">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Start Learning?
                        </h2>
                        <p className="text-white/80 max-w-2xl mx-auto mb-8">
                            Join thousands of students who have transformed their careers with SARTHI courses.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2D6A4F] font-bold rounded-xl hover:bg-[#F5F0E8] transition-colors"
                            >
                                Browse All Courses
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                            >
                                Talk to an Advisor
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}

function CategorySection({ category, index }: { category: any; index: number }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="mb-20"
        >
            <div className={`relative rounded-3xl p-8 md:p-12 ${category.bgColor} border ${category.borderColor} mb-10 overflow-hidden`}>
                <div className="absolute inset-0 opacity-5">
                    <div 
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                        }}
                    />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-6">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                            <IconRenderer name={category.iconName} className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[#1A3C2E] mb-1">
                                {category.title}
                            </h2>
                            <p className="text-lg text-[#2D6A4F] font-medium mb-2">
                                {category.subtitle}
                            </p>
                            <p className="text-[#5F6E5F] max-w-xl">
                                {category.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={`/courses/${category.id}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2D6A4F] text-white font-semibold rounded-xl hover:bg-[#1A3C2E] transition-colors"
                        >
                            Browse {category.title} Courses
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {category.courses.map((course: any, courseIndex: number) => (
                    <CourseCard 
                        key={course.id} 
                        course={course} 
                        categoryId={category.id}
                        index={courseIndex} 
                    />
                ))}
            </div>
        </motion.section>
    );
}

function CourseCard({ course, categoryId, index }: { course: any; categoryId: string; index: number }) {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Advanced': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="course-card group relative bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden hover:border-[#2D6A4F] hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
        >
            <div className="relative h-48 overflow-hidden shrink-0">
                <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(course.level)}`}>
                        {course.level}
                    </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-[#2D6A4F] ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#1A3C2E] mb-2 group-hover:text-[#2D6A4F] transition-colors leading-tight min-h-[3rem]">
                    {course.title}
                </h3>
                <p className="text-[#5F6E5F] text-sm mb-4 line-clamp-2">
                    {course.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-[#5F6E5F] mt-auto">
                    <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-[#2D6A4F]" />
                        <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                        <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
                        <span>{course.lessons} lessons</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {course.skills.slice(0, 4).map((skill: any) => (
                        <span key={skill} className="px-2 py-1 bg-[#F5F0E8] text-[#5F6E5F] text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {skill}
                        </span>
                    ))}
                </div>

                <Link
                    href={`/courses/${categoryId === 'python' ? 'python-beginners' : categoryId === 'excel' ? 'advanced-excel' : 'gst-filing'}`}
                    className="inline-flex items-center gap-2 text-[#2D6A4F] font-bold text-sm hover:gap-3 transition-all duration-300 mt-2"
                >
                    View Course Details <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}

