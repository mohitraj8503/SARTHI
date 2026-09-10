'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Share2, Bookmark, Clock, MessageSquare, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { sanitizeRichHtml } from '@/lib/html-sanitizer';

// Mock data (matching the main blog page)
const blogPosts = [
    {
        id: 1,
        title: 'The Future of Online Education in 2025',
        content: `
            <p className="lead">Virtual Reality (VR) and Artificial Intelligence (AI) are no longer just buzzwords; they are actively reshaping how we learn and teach.</p>
            <h2 className="text-3xl font-black mt-12 mb-6">The Rise of the Meta-University</h2>
            <p>Imagine attending a lecture on Ancient Rome while virtually standing in the middle of the Colosseum. In 2025, this will be the norm. Universities are investing heavily in 'Digital Twins' of their campuses, allowing students from across the globe to interact in a shared, immersive space.</p>
            <blockquote className="border-l-4 border-brand-orange pl-6 my-10 italic text-xl font-medium text-gray-700">
                "Education is the most powerful weapon which you can use to change the world, and technology is the delivery system that makes it accessible to everyone."
            </blockquote>
            <h2 className="text-3xl font-black mt-12 mb-6">AI as the Ultimate Tutor</h2>
            <p>Adaptive learning algorithms are now sophisticated enough to detect a student's frustration in real-time. By analyzing micro-expressions and response patterns, AI tutors can adjust the difficulty level of a lesson on the fly, ensuring no student is left behind while also challenging high achievers.</p>
            <p>As we move towards 2026, the focus will shift from 'learning content' to 'experiencing content'. The static PDF is dead; the interactive simulation is the new standard.</p>
        `,
        image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200' as string,
        date: 'Dec 15, 2024',
        author: 'Sarah Johnson',
        authorRole: 'EdTech Specialist',
        authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' as string,
        category: 'EdTech',
        readTime: '8 min read'
    },
    // ... other posts would go here
];

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params?.id as string);
    const post = blogPosts.find(p => p.id === id) || blogPosts[0]; // Fallback to first if not found
    const sanitizedContent = sanitizeRichHtml(post.content);

    return (
        <div className="min-h-screen bg-white">

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <header className="max-w-4xl mx-auto px-4 mb-16">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-brand-orange transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Articles
                    </motion.button>

                    <div className="space-y-6">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-full">
                            {post.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-none">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 pt-4 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                    <Image src={post.authorImage} alt={post.author} fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-brand-dark">{post.author}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{post.authorRole}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</div>
                                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="max-w-7xl mx-auto px-4 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative h-[400px] md:h-[600px] w-full rounded-[4rem] overflow-hidden shadow-2xl"
                    >
                        <Image src={post.image} alt={post.title} fill className="object-cover" priority />
                    </motion.div>
                </div>

                {/* Content Block */}
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Share Sidebar (Floating) */}
                    <aside className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-40 flex flex-col items-center gap-4">
                            <ShareButton icon={<Twitter />} label="Twitter" />
                            <ShareButton icon={<Facebook />} label="Facebook" />
                            <ShareButton icon={<LinkIcon />} label="Copy" />
                            <div className="h-20 w-px bg-gray-100 my-4" />
                            <ShareButton icon={<Bookmark />} label="Save" />
                        </div>
                    </aside>

                    {/* Article Body */}
                    <article className="lg:col-span-8 lg:col-start-3 text-gray-700">
                        <div
                            className="prose prose-xl prose-orange max-w-none font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />

                        {/* Tags / Meta */}
                        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-wrap gap-4">
                            {['E-Learning', 'Technology', 'Innovation', 'Future'].map(tag => (
                                <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-brand-orange hover:bg-orange-50 cursor-pointer transition-all">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Author Bio Card */}
                        <div className="mt-20 p-10 bg-gray-50 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
                            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 shadow-xl">
                                <Image src={post.authorImage} alt={post.author} fill className="object-cover" />
                            </div>
                            <div className="text-center md:text-left space-y-3">
                                <h3 className="text-2xl font-black text-brand-dark">{post.author}</h3>
                                <p className="text-gray-500 font-medium">Sarah is an Educational Technology strategist with over 15 years of experience in implementing digital learning solutions for Fortune 500 companies.</p>
                                <div className="flex justify-center md:justify-start gap-4">
                                    <button className="text-brand-orange font-black text-xs uppercase tracking-widest hover:underline">Follow Author</button>
                                    <button className="text-brand-dark font-black text-xs uppercase tracking-widest hover:underline">Other Articles</button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar / Recommended */}
                    <aside className="lg:col-span-3 lg:col-start-10 space-y-12">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-dark mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-orange rounded-full" /> Related Stories
                            </h3>
                            <div className="space-y-8">
                                {[1, 2].map((i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] mb-2">Development</p>
                                        <h4 className="font-bold text-gray-900 group-hover:text-brand-orange transition-colors leading-tight">Mastering Next.js 14 Server Components in Practice</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-brand-dark p-8 rounded-[2.5rem] text-white space-y-6">
                            <h3 className="text-xl font-black tracking-tight leading-none">Weekly Tech Intelligence</h3>
                            <p className="text-gray-400 text-xs font-medium leading-relaxed">Join 50k+ readers getting the edge in EdTech and Development.</p>
                            <input type="email" placeholder="email@address.com" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
                            <button className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-900/40">Subscribe Now</button>
                        </div>
                    </aside>
                </div>
            </main>


            <style jsx global>{`
                .prose p.lead {
                    font-size: 1.5rem;
                    line-height: 1.6;
                    color: #1a1a1a;
                    font-weight: 700;
                    margin-bottom: 2rem;
                }
                .prose p {
                    margin-bottom: 1.5rem;
                }
            `}</style>
        </div>
    );
}

function ShareButton({ icon, label }: { icon: any, label: string }) {
    return (
        <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-orange hover:border-brand-orange/20 hover:shadow-xl hover:-translate-y-1 transition-all group relative">
            {icon}
            <span className="absolute left-full ml-4 px-2 py-1 bg-brand-dark text-white rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {label}
            </span>
        </button>
    );
}
