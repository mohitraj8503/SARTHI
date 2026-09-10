'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Lock, CheckCircle, ChevronDown } from 'lucide-react'

interface CurriculumSheetProps {
  isOpen: boolean;
  onClose: () => void;
  modules: any[];
  currentLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
}

export default function CurriculumSheet({ isOpen, onClose, modules, currentLessonId, onSelectLesson }: CurriculumSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 300 }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80vh',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 301
            }}
          >
            <div style={{ padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Curriculum</h2>
              <button onClick={onClose} style={{ padding: 8, background: '#F3F4F6', borderRadius: '50%', border: 'none' }}>
                <X size={20} color="#6B7280" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 40px' }}>
              {modules.map((module) => (
                <div key={module.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 4, height: 16, backgroundColor: '#2D6A4F', borderRadius: 2 }} />
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{module.title}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(module.lessons || []).map((lesson: any) => {
                      const isActive = lesson.id === currentLessonId;
                      const isLocked = lesson.status === 'locked';
                      const isCompleted = lesson.status === 'completed';

                      return (
                        <button
                          key={lesson.id}
                          disabled={isLocked}
                          onClick={() => {
                            onSelectLesson(module.id, lesson.id);
                            onClose();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 12px',
                            backgroundColor: isActive ? '#E8F5EE' : 'transparent',
                            borderRadius: 12,
                            border: 'none',
                            textAlign: 'left',
                            opacity: isLocked ? 0.5 : 1,
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isCompleted ? <CheckCircle size={18} color="#2D6A4F" fill="#E8F5EE" /> :
                             isLocked ? <Lock size={18} color="#9CA3AF" /> :
                             <Play size={18} color={isActive ? '#2D6A4F' : '#6B7280'} fill={isActive ? '#2D6A4F' : 'transparent'} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: isActive ? '#2D6A4F' : '#1A1A1A' }}>{lesson.title}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>{lesson.duration || '10m'}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

