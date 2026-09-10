'use client'

import { useEffect, useState } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import { ChevronDown, ChevronUp, FileText, CheckCircle } from 'lucide-react'

export default function MobileGrades() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch('/api/student/grades');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load grades');
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#E8F5EE', text: '#2D6A4F', border: '#2D6A4F' };
    if (score >= 60) return { bg: '#FFF7ED', text: '#F4821E', border: '#F4821E' };
    return { bg: '#FEF2F2', text: '#EF4444', border: '#EF4444' };
  };

  return (
    <>
      <MobileHeader title="Academic Transcript" />
      
      <main style={{ padding: '16px' }}>
        {/* GPA Summary Card */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            borderRadius: 16, 
            padding: 24, 
            textAlign: 'center', 
            border: '1px solid #E5E7EB',
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            OVERALL AVERAGE
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#1A1A1A', lineHeight: 1 }}>
            {loading ? '—' : `${data?.averageScore || 0}%`}
          </div>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#E8F5EE', color: '#2D6A4F', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
             <CheckCircle size={14} /> Status: Elite
          </div>
        </div>

        {/* Course Grades List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 40 }}>
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="animate-pulse" style={{ height: 72, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB' }} />
            ))
          ) : data?.courses?.length > 0 ? (
            data.courses.map((course: any) => {
              const isExpanded = expanded === course.id;
              const colors = getScoreColor(course.score);
              
              return (
                <div key={course.id} style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setExpanded(isExpanded ? null : course.id)}
                    style={{ 
                      width: '100%', 
                      padding: 16, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{course.title}</h4>
                      <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{course.assessmentCount || 0} Assessments</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        backgroundColor: colors.bg, 
                        color: colors.text, 
                        padding: '4px 8px', 
                        borderRadius: 8, 
                        fontSize: 14, 
                        fontWeight: 900 
                      }}>
                        {course.score}%
                      </div>
                      {isExpanded ? <ChevronUp size={20} color="#9CA3AF" /> : <ChevronDown size={20} color="#9CA3AF" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 16px 16px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                      {(course.assessments || []).map((asm: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px 0', borderBottom: i === course.assessments.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FileText size={16} color="#6B7280" />
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#4B5563' }}>{asm.title}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A' }}>{asm.score}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: 14, color: '#6B7280' }}>No grade data available yet.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

