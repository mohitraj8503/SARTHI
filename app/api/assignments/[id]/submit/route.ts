import { prisma } from '@/lib/prisma';
import { authenticateStudent } from '@/lib/auth/middleware';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { API } from '@/lib/api/response';
import { logError } from '@/lib/logger';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await authenticateStudent(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) return API.err('File required', 'MISSING_FILE', 400);
    
    // Upload to Cloudinary with validation
    const uploadResult = await uploadToCloudinary(file, {
      folder: 'assignments',
      allowedFormats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'zip'],
      maxSize: 50 * 1024 * 1024 // 50MB
    });
    
    // Create submission with atomic transaction
    const submission = await prisma.$transaction(async (tx) => {
      // Find assignment to get instructor info
      const assignment = await tx.assignment.findUnique({
        where: { id: params.id },
        include: { lesson: { include: { course: { include: { instructor: true } } } } }
      });

      if (!assignment) throw new Error('Assignment not found');

      const sub = await tx.assignmentSubmission.create({
        data: {
          assignmentId: params.id,
          userId,
          fileUrl: uploadResult.secure_url || uploadResult.url,
          fileName: file.name,
          fileSize: file.size,
          submittedAt: new Date(),
          status: 'submitted',
          attempt: 1 // Simplified for minimal code
        }
      });
      
      // ✅ Notify teacher immediately
      const instructorUserId = assignment.lesson.course.instructor.userId;
      if (instructorUserId) {
        await tx.notification.create({
          data: {
            userId: instructorUserId,
            type: 'SUBMISSION_RECEIVED',
            title: 'New Assignment Submission',
            message: `A student submitted "${assignment.title}"`,
            data: { assignmentId: params.id, submissionId: sub.id, studentId: userId },
            priority: 'high'
          }
        });
        
        // Push via WebSocket if connected
        const io = (global as any).websocketServer;
        if (io) {
          io.to(`teacher:${instructorUserId}`).emit('notification', {
            type: 'SUBMISSION_RECEIVED',
            assignmentId: params.id,
            submissionId: sub.id,
            timestamp: Date.now()
          });
        }
      }
      
      return sub;
    });
    
    return API.ok({ submission, message: 'Assignment submitted successfully' });
    
  } catch (error: any) {
    await logError('ASSIGNMENT_SUBMIT_ERROR', { error: error.message });
    return API.server();
  }
}
