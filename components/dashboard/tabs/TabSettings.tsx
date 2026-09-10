'use client';

import { User, Shield, Bell, Moon, LogOut, Loader2, Save, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import ProfilePhotoUploader from '@/components/profile/ProfilePhotoUploader';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

export default function TabSettings({ data: propData }: { data?: any }) {
  const [mounted, setMounted] = useState(false);
  const { user: authUser, updateUser } = useAuth();
  const { data: fetchedData, isLoading, refetch } = useStudentDashboardData();
  const user = authUser || propData?.user || fetchedData?.user;
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const sanitizeFieldValue = (val: any) => {
    if (!val || typeof val !== 'string') return '';
    const trimmed = val.trim();
    if (trimmed.toLowerCase() === 'not specified' || trimmed.toLowerCase() === 'school') return '';
    return trimmed;
  };

  useEffect(() => {
    setMounted(true);
    if (user?.name) setName(user.name);
    
    // Pre-fill application fields
    const app = propData?.application || fetchedData?.internshipApplication;
    setCollege(sanitizeFieldValue(app?.college || user?.college));
    setCourse(sanitizeFieldValue(app?.course || user?.currentCourse));
    setSemester(sanitizeFieldValue(app?.semester || '1'));
    setPhone(sanitizeFieldValue(user?.phone));
    setLinkedin(sanitizeFieldValue(app?.linkedin));
    setGithub(sanitizeFieldValue(app?.github));
  }, [user, propData, fetchedData]);

  const handleUpdateProfile = async () => {
    try {
      if (!college || college.trim().length === 0) {
        setSaveStatus('error');
        setErrorMessage('College / University name is required.');
        return;
      }
      if (!course || course.trim().length === 0) {
        setSaveStatus('error');
        setErrorMessage('Course / Degree program is required.');
        return;
      }

      setSaveStatus('saving');
      setErrorMessage('');
      
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          college, 
          course, 
          semester, 
          phone, 
          linkedin, 
          github 
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || 'Failed to update profile');
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
      if (refetch) await refetch();
    } catch (error: any) {
      console.error('Update failed:', error);
      setSaveStatus('error');
      setErrorMessage(error?.message || 'Failed to save changes. Please try again.');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      if (signOut) {
        signOut();
      } else {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/?signedOut=true';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/?signedOut=true';
    }
  };

  const handlePhotoUpload = async (url: string) => {
    updateUser({ avatar_url: url });
    if (refetch) await refetch();
  };

  const handlePhotoDelete = async () => {
    updateUser({ avatar_url: null });
    if (refetch) await refetch();
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-28 px-4 sm:px-6 bg-[#F8FAFC] min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">SETTINGS ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              ACCOUNT <span className="text-emerald-500">SETTINGS</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">Manage your profile details, security, and preferences.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile & Academic Details Section */}
          <section className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 sm:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Academic & Personal Profile
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details used for Offer Letters & Certificates</p>
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
              <span className="text-base leading-none">📌</span>
              <p className="leading-relaxed font-medium">
                <strong>Important:</strong> Your college name, degree program, and semester appear on your <strong>Official Offer Letter</strong> and <strong>Certificate of Completion</strong>. Ensure they are accurate.
              </p>
            </div>

            {/* Photo Uploader */}
            <div className="flex flex-col items-center justify-center py-2 gap-3">
              <ProfilePhotoUploader
                currentPhoto={user?.avatar_url || user?.avatar || user?.image}
                onUploadComplete={handlePhotoUpload}
                onDelete={handlePhotoDelete}
                size="lg"
                editable={true}
              />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tap photo to view or update</p>
            </div>

            {/* Form Inputs */}
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    College / University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. University of Delhi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Course / Degree Program *
                  </label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Current Semester
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 4th Semester"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    GitHub / Portfolio URL
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
                  {errorMessage}
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={saveStatus === 'saving'}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-emerald-900/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>✓ Profile Saved Successfully!</>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Theme & Display Section */}
          <section className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Appearance</h3>
                <p className="text-xs text-slate-500 font-medium">Switch between light & dark theme</p>
              </div>
            </div>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </section>

          {/* Account Actions Section */}
          <section className="bg-white border border-rose-100 rounded-[32px] p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Account Session</h3>
              <p className="text-xs text-slate-500 font-medium">Sign out of your account on this device</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </section>
        </div>
      </div>
    );
}
