'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MobileVideoPlayer from '@/components/mobile/MobileVideoPlayer'
import CurriculumSheet from '@/components/mobile/CurriculumSheet'
import ProgressBar from '@/components/mobile/ProgressBar'
import { MoreVertical, ChevronRight, FileText, MessageSquare, Download, Trophy, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MobileLearnPage() {
  const params = useParams();
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string>('');
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/courses/${params.slug}/content`);
        if (res.ok) {
          const data = await res.json();
          setCourseData(data);
          if (data.modules?.length > 0) {
            setActiveModule(data.modules[0].id);
            if (data.modules[0].lessons?.length > 0) {
              setCurrentLessonId(data.modules[0].lessons[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load course content');
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [params.slug]);

  const currentLesson = (courseData?.modules || [])
    ?.flatMap((m: any) => m.lessons || [])
    ?.find((l: any) => l.id === currentLessonId);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justify: 'center', background: '#F5F5F5' }}>Loading...</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
      
      {/* Sticky Video Player */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#000' }}>
        <MobileVideoPlayer 
          url={currentLesson?.videoUrl || ''} 
          title={currentLesson?.title || 'Session'} 
        />
      </div>

      {/* Main Content Area (Scrollable) */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        
        {/* Lesson Header */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
               <span style={{ fontSize: 10, fontWeight: 800, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Currently Streaming</span>
               <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1A1A1A', marginTop: 4, lineHeight: 1.3 }}>{currentLesson?.title}</h1>
            </div>
            <button 
              onClick={() => setIsCurriculumOpen(true)}
              style={{ padding: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12 }}
            >
              <MoreVertical size={20} color="#1A1A1A" />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <div style={{ width: 8, height: 8, backgroundColor: '#2D6A4F', borderRadius: '50%' }} />
             <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Progress: {courseData?.progress || 0}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6', overflowX: 'auto', whiteSpace: 'nowrap' }}>
           {['Overview', 'Notes', 'Resources', 'Discussion'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab.toLowerCase())}
               style={{
                 padding: '16px 20px',
                 fontSize: 13,
                 fontWeight: 800,
                 color: activeTab === tab.toLowerCase() ? '#2D6A4F' : '#9CA3AF',
                 borderBottom: activeTab === tab.toLowerCase() ? '3px solid #2D6A4F' : '3px solid transparent',
                 background: 'none',
                 border: 'none',
                 textTransform: 'uppercase',
                 letterSpacing: '0.05em'
               }}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px 16px' }}>
           {activeTab === 'overview' && (
             <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
               <h3 style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={18} color="#2D6A4F" /> Session_Objectives
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Master the core principles', 'Analyze real-world cases', 'Implement technical solutions'].map((goal, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 10, background: '#F9FAFB', padding: 16, borderRadius: 16 }}>
                       <CheckCircle size={16} color="#2D6A4F" style={{ marginTop: 2 }} />
                       <span style={{ fontSize: 14, fontWeight: 600, color: '#4B5563' }}>{goal}</span>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {activeTab === 'notes' && (
             <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <div style={{ fontSize: 40, marginBottom: 16 }}>✍️</div>
               <p style={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>Take timestamped notes to review later.</p>
               <button style={{ marginTop: 20, padding: '12px 24px', background: '#E8F5EE', color: '#2D6A4F', border: 'none', borderRadius: 12, fontWeight: 800 }}>Create First Note</button>
             </div>
           )}
        </div>
      </main>

      {/* Sticky Bottom Action */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '16px 16px calc(16px + env(safe-area-inset-bottom))', 
          background: '#FFFFFF', 
          borderTop: '1px solid #E5E7EB',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: 12
        }}
      >
        <button 
          style={{ 
            flex: 1, 
            height: 52, 
            background: '#2D6A4F', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: 14, 
            fontWeight: 900, 
            fontSize: 14, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          Mark Complete & Next <ChevronRight size={18} />
        </button>
      </div>

      <CurriculumSheet 
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
        modules={courseData?.modules || []}
        currentLessonId={currentLessonId}
        onSelectLesson={(modId, lesId) => {
          setActiveModule(modId);
          setCurrentLessonId(lesId);
        }}
      />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
