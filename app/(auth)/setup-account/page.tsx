'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

export default function SetupAccountPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isSessionAuth, setIsSessionAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const res = await fetch(`/api/auth/setup-account/verify?token=${token}`);
                    const data = await res.json();
                    if (res.ok) {
                        setUserData(data.user);
                    } else {
                        setError(data.error || 'Token verification failed.');
                    }
                } catch (err) {
                    setError('Failed to verify setup link.');
                } finally {
                    setIsVerifying(false);
                }
            } else {
                // Check if user is logged in via session
                try {
                    const res = await fetch('/api/user/me');
                    const data = await res.json();
                    if (res.ok && data && data.user !== null) {
                        setUserData(data.user ? data.user : data);
                        setIsSessionAuth(true);
                    } else {
                        setError('Unauthorized access. Please use your temporary credentials or setup link.');
                    }
                } catch (err) {
                    setError('Authentication check failed.');
                } finally {
                    setIsVerifying(false);
                }
            }
        };

        checkAuth();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast({ type: 'error', title: 'Password Mismatch', message: 'Passwords do not match.' });
            return;
        }
        if (password.length < 8) {
            addToast({ type: 'error', title: 'Weak Password', message: 'Password must be at least 8 characters long.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/auth/setup-account/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                addToast({ type: 'success', title: 'Account Ready!', message: 'Your instructor profile is now active.' });
                setTimeout(() => router.push('/login'), 3000);
            } else {
                addToast({ type: 'error', title: 'Setup Failed', message: data.error || 'Failed to complete setup.' });
            }
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-[#174F3A] animate-spin mx-auto" />
                    <p className="text-[#174F3A] font-bold animate-pulse uppercase tracking-widest text-xs">Securing Identity...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-xl border border-red-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-[#1B4332]">Invalid Setup Link</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full h-16 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-xl border border-emerald-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-[#1B4332]">Account Verified!</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">Your password has been set and your instructor dashboard is ready. Redirecting to login...</p>
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mt-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl border border-gray-100"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-[#1B4332] mb-2">Secure Your Account</h1>
                    <p className="text-slate-400 text-sm font-medium">Welcome, <span className="text-[#174F3A] font-bold">{userData?.name}</span>. Let&apos;s finalize your institutional access.</p>
                </div>

                <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Premium Security</p>
                        <p className="text-xs text-blue-700 font-medium">Force password reset and Google linking required for faculty.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Official Email</label>
                        <div className="h-16 px-6 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center text-slate-500 font-bold">
                            {userData?.email}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Choose Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full h-16 px-6 pr-14 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#1B4332] font-bold transition-all"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1B4332] transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm Password</label>
                        <input 
                            type="password"
                            className="w-full h-16 px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#1B4332] font-bold transition-all"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#1B4332]/20 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <Lock size={18} />
                                Finalize & Secure Account
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Highly Recommended</p>
                    <button 
                        onClick={() => {
                            const role = userData?.role?.toLowerCase() === 'admin' ? 'admin' : 'teacher';
                            router.push(`/api/auth/login/google?redirect=/${role}/dashboard`);
                        }}
                        className="w-full h-14 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group"
                    >
                        <Image 
                            src="https://www.google.com/favicon.ico" 
                            width={16} 
                            height={16} 
                            className="group-hover:scale-110 transition-transform" 
                            alt="Google" 
                        />
                        Link Institutional Google Account
                    </button>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SARTHI Instructor Network</p>
                </div>
            </motion.div>
        </div>
    );
}
