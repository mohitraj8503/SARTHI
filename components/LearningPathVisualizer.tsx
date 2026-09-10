import React from 'react';
import { GitBranch, Box } from 'lucide-react';

interface LearningPathVisualizerProps {
  courses: any[];
}

export function LearningPathVisualizer({ courses }: LearningPathVisualizerProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 border border-gray-800 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          Neural Learning Path
        </h3>
        <div className="text-[10px] font-black text-gray-500">VISUALIZATION BETA</div>
      </div>

      <div className="relative h-48 flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 z-0"></div>

        {courses.length > 0 ? (
          courses.map((course, index) => (
            <div
              key={course.courseId}
              className="relative z-10 flex flex-col items-center min-w-[120px]"
            >
              <div
                className={`w-3 h-3 rounded-full mb-2 ${
                  course.isCompleted ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              ></div>
              <div className="w-24 h-24 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center relative hover:scale-105 transition-transform cursor-pointer group hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
                <Box
                  className={`w-8 h-8 ${
                    course.progressPercentage > 0 ? 'text-cyan-400' : 'text-gray-600'
                  }`}
                />
                {course.isCompleted && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                    DONE
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-3 text-center truncate w-full px-2">
                {course.courseTitle}
              </p>
            </div>
          ))
        ) : (
          <div className="w-full text-center text-gray-500 text-xs">
            No active learning path data.
          </div>
        )}
      </div>
    </div>
  );
}

