export interface Student {
  id: string;
  name: string | null;
  email: string;
  enrollmentNumber?: string | null;
  studentId?: string | null;
  image: string | null;
  createdAt: string;
  status?: string;
  phone?: string;
  coursesCount?: number;
  lastActive?: string | null;
  lastLogin?: string | null;
  platformSegment?: 'MAIN' | 'JUNIOR';
  educationLevel?: string | null;
  _count?: {
    enrollments: number;
  };
}

export interface StudentSummary {
  totalStudents: number;
  activeThisWeek: number;
  newThisMonth: number;
}

export interface Course {
  id: string;
  courseId: string;
  courseName: string;
  courseDescription: string | null;
  courseThumbnail: string | null;
  status: string;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

