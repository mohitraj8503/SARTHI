export interface ApiErrorDetail {
  path?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: ApiErrorDetail[];
}

export interface PaginatedMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface DashboardAssignmentDetail {
  id: string;
  lessonId: string;
  courseId: string;
  courseSlug: string | null;
  title: string;
  description: string;
  dueDate: string | null;
  maxScore: number;
  passingScore: number;
  courseName: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
  attachments: string[];
  instructor: {
    name: string;
    email: string | null;
  };
}

export interface DashboardRecording {
  id: string;
  title: string;
  date: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  courseName?: string;
}

export interface DashboardQuizQuestion {
  id: string;
  question: string;
  options: string[];
  orderNumber: number;
  points: number;
}

export interface DashboardQuizDetail {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  questions: DashboardQuizQuestion[];
  submission: {
    score: number;
    maxScore: number;
    passed: boolean;
    createdAt: string;
  } | null;
}

export interface DashboardQuizListItem {
  id: string;
  title: string;
  course: string;
  questions: number;
  duration: number;
  status: 'pending' | 'completed' | 'overdue';
  dueDate?: string | null;
  attempts: number;
  bestScore: number | null;
}
