import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';

export interface Seminar {
  id: string;
  title: string;
  startTime: string;
  meetingLink: string;
  instructorId: string;
  courseId: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
  };
}

export function useSeminars(courseId?: string, instructorId?: string) {
  return useQuery({
    queryKey: ['seminars', courseId, instructorId],
    queryFn: async () => {
      let seminars = storage.list<Seminar>('seminars:', true);

      if (courseId) {
        seminars = seminars.filter(s => s.courseId === courseId);
      }

      if (instructorId) {
        seminars = seminars.filter(s => s.instructorId === instructorId);
      }

      // Sort by startTime descending (newest first)
      return seminars.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    },
    staleTime: 1000 * 5,
    refetchInterval: 5000
  });
}

export function useCreateSeminar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      startTime: string;
      courseId?: string;
      instructorId: string;
      instructorName: string;
      instructorEmail: string;
    }) => {
      const id = `seminar_${Date.now()}`;
      const meetingLink = `meet-${id}-${Math.random().toString(36).substr(2, 6)}`;

      // Get course details if courseId is provided
      let courseDetails: { id: string; title: string } | undefined = undefined;
      if (data.courseId) {
        const course = storage.get<{ id: string, title: string }>(`courses:${data.courseId}`, true);
        if (course) courseDetails = { id: course.id, title: course.title };
      }

      const newSeminar: Seminar = {
        id,
        title: data.title,
        startTime: data.startTime,
        meetingLink,
        instructorId: data.instructorId,
        courseId: data.courseId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        instructor: {
          id: data.instructorId,
          name: data.instructorName,
          email: data.instructorEmail
        },
        course: courseDetails
      };

      storage.set(`seminars:${id}`, newSeminar, true);
      return newSeminar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seminars'] });
    },
  });
}
