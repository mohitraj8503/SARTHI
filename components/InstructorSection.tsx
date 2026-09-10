'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Globe, Award } from 'lucide-react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

import { useQuery } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { INITIAL_INSTRUCTORS } from '@/lib/initial-data';

interface Instructor {
    name: string;
    role: string;
    bio: string;
    image: string;
    company: string;
}

export default function InstructorSection() {
    const { data: instructors, isLoading } = useQuery<Instructor[]>({
        queryKey: ['instructors'],
        queryFn: async () => {
            // Wait for hydration/seeding
            await new Promise(resolve => setTimeout(resolve, 100));
            const data = storage.list<Instructor>('instructors:', true);
            // If empty, return initial (fallback)
            if (!data || data.length === 0) {
                return INITIAL_INSTRUCTORS;
            }
            return data;
        },
        refetchInterval: 5000
    });

    if (isLoading) {
        return (
            <section id="instructors" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
                    Loading instructors...
                </div>
            </section>
        );
    }

    if (!instructors || instructors.length === 0) {
        return null;
    }

    return (
        <section id="instructors" className="py-24 bg-brand-cream/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-2">Our Mentors</h2>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-extrabold text-brand-dark mb-4 tracking-tight"
                    >
                        Learn from the <span className="text-brand-orange">Masters</span>
                    </motion.h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Our instructors are industry leaders, innovators, and pioneers in their fields.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {instructors.map((instructor, index) => (
                        <motion.div
                            key={instructor.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-2 duration-300"
                        >
                            <div className="relative h-72 w-full cursor-pointer overflow-hidden bg-gray-100">
                                <Image
                                    src={instructor.image}
                                    alt={instructor.name}
                                    fill
                                    quality={85}
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute bottom-6 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-3">
                                    <button className="p-3 bg-white rounded-full hover:bg-brand-orange hover:text-white transition-colors text-brand-dark shadow-lg"><LinkedinIcon className="w-4 h-4" /></button>
                                    <button className="p-3 bg-white rounded-full hover:bg-brand-orange hover:text-white transition-colors text-brand-dark shadow-lg"><TwitterIcon className="w-4 h-4" /></button>
                                    <button className="p-3 bg-white rounded-full hover:bg-brand-orange hover:text-white transition-colors text-brand-dark shadow-lg"><Globe className="w-4 h-4" /></button>
                                </div>

                            </div>

                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-brand-dark mb-1 group-hover:text-brand-orange transition-colors">{instructor.name}</h3>
                                <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
                                    {instructor.role}
                                </p>
                                <div className="inline-block px-4 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500 mb-4 border border-gray-100">
                                    Ex-{instructor.company}
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                    {instructor.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

