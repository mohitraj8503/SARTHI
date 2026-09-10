'use client'

export default function SkeletonCard() {
  return (
    <div 
      className="animate-pulse"
      style={{ 
        background: '#FFFFFF', 
        borderRadius: 14, 
        padding: 16, 
        marginBottom: 16,
        border: '1px solid #E5E7EB'
      }}
    >
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#F3F4F6', borderRadius: 8, marginBottom: 12 }} />
      <div style={{ width: '80%', height: 20, background: '#F3F4F6', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: '40%', height: 14, background: '#F3F4F6', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ width: '100%', height: 48, background: '#F3F4F6', borderRadius: 10 }} />
    </div>
  )
}

