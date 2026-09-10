'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, DollarSign, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function BecomeInstructorPage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="pb-20">
                <section className="relative py-20 overflow-hidden pt-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                                    Share your knowledge, <br /><span className="text-primary">Inspire the world.</span>
                                </h1>
                                <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                                    Join our community of expert instructors and help students around the globe achieve their goals. Monetize your expertise today.
                                </p>
                                <Link href="/teach/apply" className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary transition-colors shadow-xl">
                                    Start Teaching <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                            <div className="relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
                                <Image
                                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Instructor"
                                    width={600}
                                    height={600}
                                    priority
                                    fetchPriority="high"
                                    className="rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-secondary">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-foreground mb-4">Why Teach With Us?</h2>
                            <p className="text-muted-foreground">We provide the tools and support you need to succeed.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-background p-8 rounded-3xl shadow-sm border border-border text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <DollarSign className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">Earn Money</h3>
                                <p className="text-muted-foreground">Get paid for every student who enrolls in your course. Top instructors earn over $5,000/month.</p>
                            </div>
                            <div className="bg-background p-8 rounded-3xl shadow-sm border border-border text-center">
                                <div className="w-16 h-16 bg-sky-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-400">
                                    <Users className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">Inspire Students</h3>
                                <p className="text-muted-foreground">Reach millions of students worldwide and make a positive impact on their lives and careers.</p>
                            </div>
                            <div className="bg-background p-8 rounded-3xl shadow-sm border border-border text-center">
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">Flexible Schedule</h3>
                                <p className="text-muted-foreground">Teach what you want, when you want. You have complete control over your curriculum and schedule.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

