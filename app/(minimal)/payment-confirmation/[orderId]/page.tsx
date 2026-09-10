'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { storage } from '@/lib/storage'
import { CheckCircle, Home, BookOpen, Clock, ArrowRight } from 'lucide-react'

export default function PaymentConfirmationPage() {
    const params = useParams()
    const orderId = params?.orderId as string | undefined
    const router = useRouter()
    const [orderData, setOrderData] = useState<any>(null)

    const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId

    useEffect(() => {
        if (!orderIdStr) return

        const order = storage.get<any>(`order:${orderIdStr}`, true)
        if (order) {
            setOrderData(order)
        }
    }, [orderIdStr])

    if (!orderData) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center bg-white rounded-[2rem] p-10 shadow-2xl border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-orange/10 text-brand-orange mx-auto mb-6">
                        <Home className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-black text-brand-dark mb-4">Order not found</h1>
                    <p className="text-sm text-slate-500 mb-8">
                        We couldn’t locate your payment confirmation. This often happens when the page is refreshed before the order details are persisted locally.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/courses"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-orange text-white py-4 font-bold uppercase tracking-[1px] transition hover:bg-[#166534]"
                        >
                            Browse courses
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 py-4 font-bold uppercase tracking-[1px] transition hover:bg-slate-50"
                        >
                            Go to homepage
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Success Animation */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-green-500 rounded-full mb-8 animate-bounce">
                        <CheckCircle className="w-20 h-20 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-brand-dark mb-4">Payment Proof Submitted!</h1>
                    <p className="text-xl text-gray-600 font-medium">We&apos;ve received your payment details</p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-8 mb-8">
                    <div className="text-center pb-8 border-b-2 border-gray-100">
                        <h2 className="text-2xl font-black text-brand-dark mb-2">Order Confirmation</h2>
                        <p className="text-gray-500 font-medium">Your enrollment will be activated after verification</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Order ID</p>
                            <p className="font-mono text-lg font-bold text-brand-dark">{orderData.orderId}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Transaction ID</p>
                            <p className="font-mono text-lg font-bold text-brand-dark">{orderData.transactionId}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Course</p>
                            <p className="text-lg font-bold text-brand-dark">{orderData.courseName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount Paid</p>
                            <p className="text-2xl font-black text-green-600">₹{orderData.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Student Name</p>
                            <p className="text-lg font-bold text-brand-dark">{orderData.studentName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Submitted At</p>
                            <p className="text-lg font-bold text-brand-dark">
                                {new Date(orderData.submittedAt).toLocaleString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 mb-8">
                    <h3 className="text-2xl font-black text-brand-dark mb-6 flex items-center gap-3">
                        <Clock className="w-8 h-8 text-brand-orange" />
                        What Happens Next?
                    </h3>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-black shrink-0">1</div>
                            <div>
                                <h4 className="font-black text-brand-dark mb-2">Verification (Within 24 hours)</h4>
                                <p className="text-gray-600 font-medium">Our team will verify your payment details and transaction ID</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-black shrink-0">2</div>
                            <div>
                                <h4 className="font-black text-brand-dark mb-2">Enrollment Activation</h4>
                                <p className="text-gray-600 font-medium">Once verified, you&apos;ll receive WhatsApp confirmation and course access</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-black shrink-0">3</div>
                            <div>
                                <h4 className="font-black text-brand-dark mb-2">Start Learning</h4>
                                <p className="text-gray-600 font-medium">Access all course materials and start your learning journey!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 rounded-[3rem] p-10 border-2 border-yellow-200 mb-8">
                    <h3 className="text-xl font-black text-yellow-900 mb-4">📌 Important Notes</h3>
                    <ul className="space-y-3 text-yellow-800 font-medium">
                        <li className="flex gap-3">
                            <span className="text-yellow-600">•</span>
                            <span>Verification typically takes 2-6 hours during business hours</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-yellow-600">•</span>
                            <span>You&apos;ll receive a WhatsApp confirmation once your enrollment is activated</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-yellow-600">•</span>
                            <span>Keep your Order ID and Transaction ID safe for future reference</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-yellow-600">•</span>
                            <span>For any queries, contact us on WhatsApp: +91 98350 19509</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-brand-dark py-5 rounded-2xl font-black uppercase tracking-widest hover:border-brand-orange hover:text-brand-orange transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </Link>
                    <Link
                        href="/courses"
                        className="flex-1 flex items-center justify-center gap-3 bg-brand-orange text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:-translate-y-1 transition-all"
                    >
                        <BookOpen className="w-5 h-5" />
                        Browse More Courses
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </main>
    )
}
