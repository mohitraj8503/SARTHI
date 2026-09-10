'use client'

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ProgressBar({ 
  progress, 
  height = 6, 
  color = '#2D6A4F', 
  backgroundColor = '#E5E7EB' 
}: ProgressBarProps) {
  return (
    <div 
      style={{ 
        width: '100%', 
        height, 
        backgroundColor, 
        borderRadius: height / 2,
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          width: `${Math.min(100, Math.max(0, progress))}%`, 
          height: '100%', 
          backgroundColor: color,
          borderRadius: height / 2,
          transition: 'width 0.3s ease-out'
        }}
      />
    </div>
  )
}

