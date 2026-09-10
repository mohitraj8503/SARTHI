'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface StudentData {
  id: string;
  name: string;
  engagement: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  connectionStrength: number;
  position: { x: number; y: number };
  peers: string[];
  strengths: string[];
  struggles: string[];
  learningJourney: string[];
  privateNotes: string;
}

interface ConstellationData {
  constellations: StudentData[];
  totalStudents: number;
}

interface StudentHologramProps {
  student: StudentData | null;
  onClose: () => void;
}

function StudentHologram({ student, onClose }: StudentHologramProps) {
  if (!student) return null;

  const getLearningStyleColor = (style: string) => {
    switch (style) {
      case 'visual':
        return 'text-blue-400';
      case 'auditory':
        return 'text-green-400';
      case 'kinesthetic':
        return 'text-orange-400';
      case 'reading':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-brand-dark mb-2">{student.name}</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${getLearningStyleColor(
                    student.learningStyle
                  )} bg-current/10`}
                >
                  {student.learningStyle} learner
                </span>
                <span className="text-sm text-brand-gray-500">
                  Engagement: {Math.round(student.engagement)}%
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Strengths</h3>
              <div className="space-y-2">
                {student.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-brand-gray-600">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Areas for Growth</h3>
              <div className="space-y-2">
                {student.struggles.map((struggle, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-sm text-brand-gray-600">{struggle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold text-brand-dark mb-3">Learning Journey</h3>
            <div className="space-y-2">
              {student.learningJourney.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-brand-deep-knowledge-blue rounded-full"></div>
                  <span className="text-sm text-brand-gray-600">{milestone}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold text-brand-dark mb-3">Private Notes</h3>
            <p className="text-sm text-brand-gray-600 bg-gray-50 p-4 rounded-xl">
              {student.privateNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentConstellations() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [draggedStudent, setDraggedStudent] = useState<StudentData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const { data, isLoading } = useQuery<ConstellationData>({
    queryKey: ['teacher-constellations'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/constellations');
      if (!res.ok) throw new Error('Failed to fetch constellations');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const constellations = useMemo(() => data?.constellations || [], [data?.constellations]);

  // Learning style colors
  const getLearningStyleColor = (style: string) => {
    switch (style) {
      case 'visual':
        return '#3B82F6'; // blue
      case 'auditory':
        return '#10B981'; // green
      case 'kinesthetic':
        return '#F59E0B'; // orange
      case 'reading':
        return '#8B5CF6'; // purple
      default:
        return '#6B7280'; // gray
    }
  };

  // Draw constellation
  const drawConstellation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !constellations.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center of canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw constellation lines first (behind stars)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;

    constellations.forEach((student) => {
      student.peers.forEach((peerId) => {
        const peer = constellations.find((s) => s.id === peerId);
        if (peer) {
          ctx.beginPath();
          ctx.moveTo(centerX + student.position.x, centerY + student.position.y);
          ctx.lineTo(centerX + peer.position.x, centerY + peer.position.y);
          ctx.stroke();
        }
      });
    });

    // Draw stars
    constellations.forEach((student) => {
      const x = centerX + student.position.x;
      const y = centerY + student.position.y;

      // Star size based on engagement
      const baseSize = 4 + (student.engagement / 100) * 8;

      // Brightness based on engagement
      const brightness = 0.3 + (student.engagement / 100) * 0.7;

      // Color based on learning style
      const color = getLearningStyleColor(student.learningStyle);

      // Draw star with glow
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = baseSize * 2;
      ctx.globalAlpha = brightness;

      // Draw star shape
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? baseSize : baseSize * 0.5;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Draw name label for hovered/selected stars
      if (selectedStudent?.id === student.id) {
        ctx.fillStyle = '#1F2937';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(student.name, x, y - baseSize - 8);
      }
    });
  }, [constellations, selectedStudent]);

  // Handle mouse events
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePos({ x, y });

      // Check if hovering over a star
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      let hoveredStudent: StudentData | null = null;
      constellations.forEach((student) => {
        const starX = centerX + student.position.x;
        const starY = centerY + student.position.y;
        const distance = Math.sqrt((x - starX) ** 2 + (y - starY) ** 2);
        const starSize = 4 + (student.engagement / 100) * 8;

        if (distance < starSize + 5) {
          hoveredStudent = student;
        }
      });

      if (hoveredStudent !== selectedStudent) {
        setSelectedStudent(hoveredStudent);
      }
    },
    [constellations, selectedStudent]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      // If clicked on a star, show hologram
      if (selectedStudent) {
        // Could show hologram here, but for now just log
        console.log('Clicked on student:', selectedStudent.name);
      }
    },
    [selectedStudent]
  );

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawConstellation();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawConstellation]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-[2rem] flex items-center justify-center">
        <div className="text-brand-gray-500">Loading constellations...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-brand-dark">Student Constellations</h3>
        <div className="text-sm text-brand-gray-500">{constellations.length} students mapped</div>
      </div>

      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-[2rem] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-pointer"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ imageRendering: 'auto' }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md rounded-xl p-4 text-white text-xs">
          <div className="font-bold mb-2">Learning Styles</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Visual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Auditory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span>Kinesthetic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Reading</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hologram Modal */}
      <StudentHologram student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
}

