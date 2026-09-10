'use client';

import React, { useState, lazy, Suspense } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Star,
    LogOut,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/haptics';

const IconBookOpen = lazy(() => import('lucide-react').then(mod => Promise.resolve({ default: mod.BookOpen })));
const IconUser = lazy(() => import('lucide-react').then(mod => Promise.resolve({ default: mod.User })));
const IconAward = lazy(() => import('lucide-react').then(mod => Promise.resolve({ default: mod.Award })));
const IconSettings = lazy(() => import('lucide-react').then(mod => Promise.resolve({ default: mod.Settings })));
const IconMessageSquare = lazy(() => import('lucide-react').then(mod => Promise.resolve({ default: mod.MessageSquare })));
const IconHelpCircle = lazy(() => import('lucide-react').then(mod => Promise.resolve({ default: mod.HelpCircle })));

const APP_VERSION = 'v1.0.4';
const ANIMATION_DELAY_BASE = 0.1;
const GRID_GAP = 'gap-4';
const SECTION_SPACING = 'mt-8';
const TOUCH_TARGET_MIN = 48;

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
}

function ConfirmDialog({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant = 'danger' }: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
        >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100"
        >
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${variant === 'danger' ? 'bg-rose-100' : 'bg-amber-100'}`}>
                        <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} />
                    </div>
                    <h3 id="confirm-title" className="text-xl font-bold text-[#1A3C2E]">{title}</h3>
                </div>
                <p id="confirm-message" className="text-[#5F6E5F] mb-6 font-medium">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
                            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function LoadingFallback() {
    return (
        <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        </div>
    );
}

const IconButton = ({ icon: Icon, className, label }: { icon: React.ComponentType<{ className?: string }>; className?: string; label: string }) => (
    <Suspense fallback={<LoadingFallback />}>
        <Icon className={className} />
    </Suspense>
);

const NAVIGATION_ITEMS = [
    { label: 'My Learning', href: '/dashboard', icon: IconBookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Full Profile', href: '/profile', icon: IconUser, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Achievements', href: '/dashboard?tab=achievements', icon: IconAward, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Settings', href: '/dashboard/settings', icon: IconSettings, color: 'text-slate-600', bg: 'bg-slate-50' },
] as const;

const SUPPORT_ITEMS = [
    { label: 'Community Chat', icon: IconMessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', action: 'chat' as const },
    { label: 'Help Center', icon: IconHelpCircle, color: 'text-teal-600', bg: 'bg-teal-50', action: 'help' as const },
] as const;

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    const handleLogoutClick = () => {
        triggerHaptic('heavy');
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = async () => {
        await signOut();
        setShowLogoutConfirm(false);
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    if (loading) {
        return (
            <div
                className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center bg-[#f8f9fb]"
                role="status"
                aria-live="polite"
                aria-label="Loading profile"
            >
                <div className="w-12 h-12 border-3 border-gray-200 border-t-[#1A3C2E] rounded-full animate-spin" />
                <p className="mt-4 text-[#6b7280] font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 bg-[#f8f9fb] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#e8f5ee] to-[#f8f9fb] pointer-events-none" />

                <div className="max-w-md mx-auto relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6"
                    >
                        <Star className="w-10 h-10 text-[#2D6A4F]" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-[#1a1a1a] tracking-tight mb-4"
                    >
                        Your Journey <br />Starts Here
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ANIMATION_DELAY_BASE }}
                        className="text-[#6b7280] font-medium mb-8 max-w-xs leading-relaxed"
                    >
                        Login to track your progress, earn certificates, and build production-grade projects.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ANIMATION_DELAY_BASE * 2 }}
                        className="w-full space-y-3"
                    >
                        <Link href="/login" className="block w-full">
                            <button
                                className="w-full bg-[#1A3C2E] text-white h-14 rounded-xl font-semibold uppercase tracking-wider hover:bg-[#2D6A4F] transition-all duration-200 active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 group"
                                onClick={() => triggerHaptic('medium')}
                            >
                                <span className="group-hover:scale-105 transition-transform">Sign In</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link href="/signup" className="block w-full">
                            <button
                                className="w-full bg-white text-[#1a1a1a] h-14 rounded-xl font-semibold uppercase tracking-wider border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98] shadow-sm group"
                            >
                                <span className="group-hover:scale-105 transition-transform">Create Account</span>
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </main>
        );
    }

    const displayName = user.name || 'User';
    const displayEmail = user.email || 'No email';
    const initials = displayName[0]?.toUpperCase() || 'U';
    const points = user.totalPoints ?? 0;
    const status = user.role === 'student' ? 'Student' : user.role === 'teacher' ? 'Instructor' : user.role === 'admin' ? 'Admin' : 'Active';

    return (
        <main className="min-h-screen pt-24 pb-28 sm:pt-28 bg-[#f8f9fb] overflow-x-hidden relative">
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#e8f5ee] to-[#f8f9fb] pointer-events-none" />

            <div className="max-w-lg mx-auto px-4 sm:px-6 relative z-10 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 mt-4 shadow-lg border border-gray-100/50"
                    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A3C2E] to-[#2D6A4F] flex items-center justify-center shadow-md">
                                {user.image || user.profilePicture ? (
                                    <Image
                                        src={(user.image || user.profilePicture)!}
                                        alt={displayName}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover rounded-xl"
                                        priority={false}
                                    />
                                ) : (
                                    <span className="text-lg font-bold text-white">{initials}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#E8B84B] rounded-full border-2 border-white flex items-center justify-center">
                                <Star className="w-2.5 h-2.5 text-[#1A3C2E] fill-current" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-[#1a1a1a] truncate">
                                {displayName}
                            </h1>
                            <p className="text-sm text-[#6b7280] truncate">
                                {displayEmail}
                            </p>
                            <div className="inline-flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-medium text-[#6b7280] capitalize">
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1">Points</p>
                            <p className="text-xl font-bold text-[#1a1a1a]">{points}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1">Status</p>
                            <p className="text-xl font-bold text-[#1a1a1a]">Active</p>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider px-1">Your Activity</h3>
                        <div className="space-y-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ANIMATION_DELAY_BASE }}
                            >
                                <Link href="/dashboard" className="block">
                                    <button
                                        className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 hover:border-gray-200 transition-all duration-200 active:scale-[0.98] group"
                                        onClick={() => triggerHaptic('light')}
                                        style={{ minHeight: '56px' }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center transition-transform group-hover:scale-105">
                                                <IconButton icon={IconBookOpen} className="w-5 h-5 text-blue-600" label="My Learning" />
                                            </div>
                                            <span className="font-semibold text-[#1a1a1a] text-base">My Learning</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#6b7280] transition-transform group-hover:translate-x-1" />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider px-1">Account</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Full Profile', href: '/profile', icon: IconUser, color: 'text-orange-600', bg: 'bg-orange-50' },
                                { label: 'Achievements', href: '/dashboard?tab=achievements', icon: IconAward, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                { label: 'Settings', href: '/dashboard/settings', icon: IconSettings, color: 'text-slate-600', bg: 'bg-slate-50' },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: ANIMATION_DELAY_BASE + 0.1 + (index * 0.05) }}
                                >
                                    <Link href={item.href} className="block">
                                        <button
                                            className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 hover:border-gray-200 transition-all duration-200 active:scale-[0.98] group"
                                            onClick={() => triggerHaptic('light')}
                                            style={{ minHeight: '56px' }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                                                    <IconButton icon={item.icon} className={`w-5 h-5 ${item.color}`} label={item.label} />
                                                </div>
                                                <span className="font-medium text-[#1a1a1a] text-base">{item.label}</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-[#6b7280] transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider px-1">Support</h3>
                        <div className="space-y-2">
                            {SUPPORT_ITEMS.map((item, index) => (
                                <motion.div
                                    key={item.action}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: ANIMATION_DELAY_BASE + 0.3 + (index * 0.05) }}
                                >
                                    <button
                                        className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 hover:border-gray-200 transition-all duration-200 active:scale-[0.98] group"
                                        onClick={() => {
                                            triggerHaptic('medium');
                                            if (item.action === 'chat') {
                                                window.open('https://discord.gg/sarthi', '_blank');
                                            } else if (item.action === 'help') {
                                                window.location.href = '/help';
                                            }
                                        }}
                                        aria-label={item.label}
                                        style={{ minHeight: '56px' }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                                                <IconButton icon={item.icon} className={`w-5 h-5 ${item.color}`} label={item.label} />
                                            </div>
                                            <span className="font-medium text-[#1a1a1a] text-base">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#6b7280] transition-transform group-hover:translate-x-1" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ANIMATION_DELAY_BASE * 2 }}
                    className={`${SECTION_SPACING} space-y-3`}
                >
                    <h3 className="text-[11px] font-bold text-[#5F6E5F] uppercase tracking-[0.3em] px-2">Support</h3>
                    <div className="space-y-2">
                        {SUPPORT_ITEMS.map((item, index) => (
                            <motion.div
                                key={item.action}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ANIMATION_DELAY_BASE * 2 + (index * 0.1) }}
                            >
                                <button
                                    className="w-full bg-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-[#E8E2D9] transition-all active:scale-[0.98] min-h-[48px] hover:shadow-xl group"
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        if (item.action === 'chat') {
                                            // Open community chat - could be a modal, redirect, or external link
                                            window.open('https://discord.gg/sarthi', '_blank');
                                        } else if (item.action === 'help') {
                                            // Open help center - could be a modal or redirect
                                            window.location.href = '/help';
                                        }
                                    }}
                                    aria-label={item.label}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl ${item.bg} flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg`}>
                                            <IconButton icon={item.icon} className={`w-5 h-5 ${item.color}`} label={item.label} />
                                        </div>
                                        <span className="font-bold text-[#1A3C2E] text-sm sm:text-base group-hover:text-[#2D6A4F] transition-colors">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[#5D705C] opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[#2D6A4F]" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ANIMATION_DELAY_BASE + 0.4 }}
                    className="mt-8"
                >
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: ANIMATION_DELAY_BASE + 0.5 }}
                        onClick={handleLogoutClick}
                        className="w-full bg-white border border-red-200 p-4 rounded-xl flex items-center justify-center gap-3 text-red-600 font-semibold transition-all duration-200 active:scale-[0.98] hover:bg-red-50 hover:border-red-300 group"
                        aria-label="Sign out of your account"
                        style={{ minHeight: '56px' }}
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        <span className="group-hover:text-red-700 transition-colors">Sign Out</span>
                    </motion.button>
                    <p className="text-center text-xs font-medium text-[#6b7280] uppercase tracking-wide mt-6">
                        SARTHI India {APP_VERSION}
                    </p>
                </motion.div>
            </div>

            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Sign Out?"
                message="Are you sure you want to sign out of your account?"
                confirmLabel="Sign Out"
                cancelLabel="Cancel"
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                variant="danger"
            />
        </main>
    );
}

