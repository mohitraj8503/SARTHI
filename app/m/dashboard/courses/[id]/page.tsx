'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MobileHeader from '@/components/mobile/MobileHeader'
import ProgressBar from '@/components/mobile/ProgressBar'
import Image from 'next/image'
import { Play, FileText, Download, ChevronRight, Lock } from 'lucide-react'

export default function MobileCourseDetail() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum');

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}/content`);
        if (res.ok) {
          const json = await res.json();
          setCourse(json);
        }
      } catch (err) {
        console.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div className="animate-pulse" style={{ width: '100%', aspectRatio: '16/9', background: '#E5E7EB', borderRadius: 16, marginBottom: 20 }} />
        <div className="animate-pulse" style={{ width: '60%', height: 24, background: '#E5E7EB', borderRadius: 4, marginBottom: 12 }} />
        <div className="animate-pulse" style={{ width: '100%', height: 100, background: '#E5E7EB', borderRadius: 12 }} />
      </div>
    );
  }

  if (!course) return <div style={{ padding: 40, textAlign: 'center' }}>Course not found</div>;

  return (
    <>
      <MobileHeader title={course.title} showBack={true} />
      
      <main style={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
          <Image 
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop'} 
            alt={course.title}
            fill
            style={{ objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center' }}>
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div style={{ padding: 20, background: '#FFFFFF' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', marginBottom: 8, lineHeight: 1.3 }}>{course.title}</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>by <span style={{ fontWeight: 700, color: '#2D6A4F' }}>{course.instructor}</span></p>
          
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F' }}>{course.progress}%</span>
            </div>
            <ProgressBar progress={course.progress} height={8} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF', sticky: 'top', top: 56, zIndex: 10 }}>
          {['Overview', 'Curriculum', 'Resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              style={{
                flex: 1,
                padding: '16px 0',
                fontSize: 14,
                fontWeight: 700,
                color: activeTab === tab.toLowerCase() ? '#2D6A4F' : '#6B7280',
                borderBottom: activeTab === tab.toLowerCase() ? '3px solid #2D6A4F' : '3px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 20 }}>
          {activeTab === 'overview' && (
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#4B5563' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Course Description</h3>
              <p>{course.description || 'Level up your skills with this industry-grade masterclass.'}</p>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(course.modules || []).map((module: any) => (
                <div key={module.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
                  <div style={{ padding: 16, background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{module.title}</h4>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{module.lessons?.length || 0} Lessons</span>
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    {(module.lessons || []).map((lesson: any) => (
                      <div 
                        key={lesson.id} 
                        style={{ 
                          padding: '12px 16px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12,
                          borderBottom: '1px solid #F3F4F6'
                        }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: lesson.status === 'locked' ? '#F3F4F6' : '#E8F5EE', display: 'flex', alignItems: 'center', justify: 'center' }}>
                          {lesson.status === 'locked' ? <Lock size={16} color="#9CA3AF" /> : <Play size={16} color="#2D6A4F" fill="#2D6A4F" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: lesson.status === 'locked' ? '#9CA3AF' : '#1A1A1A' }}>{lesson.title}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{lesson.duration || '10:00'}</div>
                        </div>
                        {!lesson.status === 'locked' && <ChevronRight size={16} color="#D1D5DB" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Source Code', 'Course Slides', 'Cheat Sheet'].map((res, i) => (
                <div key={i} style={{ padding: 16, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ backgroundColor: '#F3F4F6', padding: 10, borderRadius: 10 }}>
                    <Download size={20} color="#6B7280" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{res}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>PDF • 2.4 MB</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div 
          style={{ 
            position: 'fixed', 
            bottom: 64, 
            left: 0, 
            right: 0, 
            padding: '12px 16px', 
            backgroundColor: '#FFFFFF', 
            borderTop: '1px solid #E5E7EB',
            zIndex: 90
          }}
        >
          <button 
            style={{ 
              width: '100%', 
              height: 52, 
              backgroundColor: '#2D6A4F', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: 12, 
              fontWeight: 800, 
              fontSize: 16,
              boxShadow: '0 4px 12px rgba(45,106,79,0.3)'
            }}
          >
            {course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
          </button>
        </div>
      </main>
    </>
  )
}
