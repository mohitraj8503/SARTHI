'use client'

import Image from 'next/image'
import ProgressBar from './ProgressBar'
import { useRouter } from 'next/navigation'

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  slug?: string;
}

export default function CourseCard({ id, title, instructor, thumbnail, progress, slug }: CourseCardProps) {
  const router = useRouter();
  
  return (
    <div 
      style={{ 
        background: '#FFFFFF', 
        borderRadius: 14, 
        padding: 16, 
        marginBottom: 16,
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
      onClick={() => router.push(`/m/dashboard/courses/${slug || id}`)}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
        <Image 
          src={thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'} 
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
      
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#2D6A4F', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SARTHI Originals</p>
      
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{progress}% Complete</span>
        </div>
        <ProgressBar progress={progress} />
      </div>
      
      <button 
        style={{ 
          width: '100%', 
          height: 48, 
          backgroundColor: '#2D6A4F', 
          color: '#FFFFFF', 
          border: 'none', 
          borderRadius: 10, 
          fontWeight: 700, 
          fontSize: 14,
          cursor: 'pointer'
        }}
      >
        {progress > 0 ? 'Continue' : 'Start Learning'}
      </button>
    </div>
  )
}

