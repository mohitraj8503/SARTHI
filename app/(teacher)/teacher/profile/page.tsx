'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Camera,
  Edit2,
  Save,
  Award,
  BookOpen,
  Users,
  Star,
  Briefcase,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { Avatar } from '@/components/Avatar';
import { useQueryClient } from '@tanstack/react-query';

export default function TeacherProfilePage() {
  const { user: authUser } = useAuth();
  const { user, isLoading, updateProfile } = useUser(authUser?.id);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    title: '',
    location: '',
    website: '',
    profileImage: '',
    company: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || 'Passionate educator transforming lives through technology.',
        title: user.expertise || user.company || 'Senior Instructor',
        location: user.location || 'India',
        website: user.website || '',
        profileImage: user.avatarUrl || user.image || '',
        company: user.company || 'SARTHI',
      });
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        expertise: formData.title,
        image: formData.profileImage,
      });

      // Real-time notification if needed
      const socket = io();
      socket.emit('teacher_profile_updated', {
        teacherId: user.id,
        name: formData.name,
        profilePicture: formData.profileImage,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 2MB.');
      return;
    }

    try {
      setIsAvatarLoading(true);
      const fd = new FormData();
      fd.append('file', file);

      const response = await fetch('/api/users/me/avatar', {
        method: 'PATCH',
        body: fd,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload avatar');

      // Update local state to show new image immediately
      if (data.avatarUrl) {
        setFormData(prev => ({ ...prev, profileImage: data.avatarUrl }));
      }

      // Force refresh user data
      await queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      await queryClient.refetchQueries({ queryKey: ['user', user?.id] });

      alert('Avatar updated successfully! ✓');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload avatar.');
    } finally {
      setIsAvatarLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="pb-20 space-y-12">
        {/* Banner Section */}
        <div className="relative h-80 w-full bg-background overflow-hidden rounded-[3rem] border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-orange-500/10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />

          {/* Background Ambience */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[150px] rounded-full" />

          <div className="absolute top-12 left-8 z-20">
            <button
              onClick={() => router.back()}
              className="bg-white/5 backdrop-blur-xl text-white/70 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-3 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Sidebar Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full md:w-96 bg-card/95 border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              <div className="relative w-40 h-40 mx-auto mb-10">
                <div className="w-full h-full rounded-[2.5rem] border-4 border-background shadow-2xl overflow-hidden bg-white/5 relative group/avatar transition-transform duration-500 hover:scale-105">
                  <Avatar
                    avatarUrl={formData.profileImage}
                    name={formData.name}
                    size={128}
                    isLoading={isAvatarLoading}
                    className="rounded-2xl"
                  />

                  {isEditing && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                    >
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-medium uppercase tracking-wide">
                        Upload
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="text-center mb-10 space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border border-white/10 text-white text-center font-black text-2xl tracking-tight rounded-2xl px-4 py-3 w-full focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border border-white/10 text-primary text-center text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 w-full focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-white/5 border border-white/10 text-white/40 text-center text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 w-full focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Location"
                    />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-white/5 border border-white/10 text-white/40 text-center text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 w-full focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Company"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-black text-white/90 tracking-tight">{formData.name}</h1>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      <Award className="w-3.5 h-3.5" />
                      {formData.title || 'Instructor'}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <div className="p-3 bg-white/5 rounded-xl text-primary border border-white/5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <div className="p-3 bg-white/5 rounded-xl text-primary border border-white/5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span>{formData.company || 'SARTHI'}</span>
                </div>
                <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <div className="p-3 bg-white/5 rounded-xl text-primary border border-white/5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{formData.location}</span>
                </div>
              </div>

              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={isSaving}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-2xl ${isEditing
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                  }`}
              >
                {isEditing ? (
                  isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile
                    </>
                  )
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </>
                )}
              </button>
            </motion.div>

            {/* Main Stats & Info */}
            <div className="flex-1 space-y-8">
              {/* Teacher Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatsCard
                  icon={<BookOpen className="w-6 h-6 text-primary" />}
                  label="Courses Created"
                  value={user.coursesCreated || '3'}
                  color="purple"
                  delay={0.1}
                />
                <StatsCard
                  icon={<Users className="w-6 h-6 text-blue-400" />}
                  label="Students Enrolled"
                  value={user.totalStudents || '120+'}
                  color="blue"
                  delay={0.2}
                />
                <StatsCard
                  icon={<Star className="w-6 h-6 text-yellow-400" />}
                  label="Avg. Rating"
                  value={user.rating || '0.0'}
                  color="yellow"
                  delay={0.3}
                />
                <StatsCard
                  icon={<GraduationCap className="w-6 h-6 text-emerald-400" />}
                  label="Experience"
                  value={user.experience || 'New'}
                  color="green"
                  delay={0.4}
                />
              </div>

              {/* Bio Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl"
              >
                <h2 className="text-xl font-black text-white/90 mb-6 tracking-tight">About the Instructor</h2>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-white/80 min-h-[180px] focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-white/10 font-medium leading-relaxed"
                    placeholder="Write a professional bio..."
                  />
                ) : (
                  <p className="text-white/60 leading-loose text-lg font-medium">{formData.bio}</p>
                )}
              </motion.div>

              {/* Badges / Expertise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl"
              >
                <h2 className="text-xl font-black text-white/90 mb-8 tracking-tight">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {(user?.expertise && user.expertise.length > 0 ? user.expertise : [
                    'Full Stack Development',
                    'React.js',
                    'Node.js',
                    'System Design',
                    'Cloud Architecture',
                  ]).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-6 py-3 bg-white/5 text-white/70 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-primary/20 hover:text-white hover:border-primary/20 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function StatsCard({ icon, label, value, color, delay }: any) {
  const bgColors = {
    purple: 'bg-primary/10 border-primary/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    green: 'bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md hover:border-white/10 transition-all duration-500 group overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`p-4 rounded-2xl border ${bgColors[color as keyof typeof bgColors] || 'bg-white/5'}`}
          >
            {icon}
          </div>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[2px] leading-tight">
            {label}
          </span>
        </div>
        <div className="text-3xl font-black text-white/90 tracking-tight">{value}</div>
      </div>
    </motion.div>
  );
}

