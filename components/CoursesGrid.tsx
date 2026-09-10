
"use client";

import { motion } from "framer-motion";
import CourseCard from "./CourseCard";

interface CoursesGridProps {
  courses: any[];
}

export default function CoursesGrid({ courses }: CoursesGridProps) {
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
    >
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <motion.div
            key={course.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <CourseCard course={course} index={index} />
          </motion.div>
        ))
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-full text-center py-32 bg-white rounded-3xl border border-premium-border shadow-soft"
        >
          <div className="text-7xl mb-6">🔍</div>
          <h3 className="text-3xl font-black text-premium-primary mb-3">No courses found</h3>
          <p className="text-premium-muted text-lg font-medium">Try adjusting your search or filters to find what you&apos;re looking for.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

