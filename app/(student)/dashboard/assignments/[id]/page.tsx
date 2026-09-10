'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Send,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchJsonWithRetry } from '@/lib/dashboard-api';
import type { DashboardAssignmentDetail } from '@/lib/types/dashboard';

export default function AssignmentPage() {
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<DashboardAssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState({
    files: [] as File[],
    comment: '',
    submitting: false,
  });

  const fetchAssignmentDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchJsonWithRetry<DashboardAssignmentDetail>(`/api/assignments/${assignmentId}`, {
        cache: 'no-store',
        headers: {},
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load assignment');
      }

      setAssignment(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment');
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignmentDetail();
  }, [fetchAssignmentDetail]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(e.target.files || []);
    setSubmission((prev) => ({ ...prev, files: nextFiles }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || submission.files.length === 0) return;

    try {
      setSubmission((prev) => ({ ...prev, submitting: true }));
      setError(null);

      const formData = new FormData();
      submission.files.forEach((file) => formData.append('files', file));
      if (submission.comment.trim()) {
        formData.append('comment', submission.comment.trim());
      }

      if (assignment.status !== 'graded') {
        setAssignment((prev) =>
          prev
            ? {
                ...prev,
                status: 'submitted',
                submittedAt: new Date().toISOString(),
              }
            : prev
        );
      }

      const response = await fetchJsonWithRetry<{
        submissionId: string;
        status: string;
        submittedAt: string;
        attachments: string[];
      }>(`/api/assignments/${assignment.id}/submit`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit assignment');
      }

      setSubmission({ files: [], comment: '', submitting: false });
      await fetchAssignmentDetail();
    } catch (err: any) {
      setSubmission((prev) => ({ ...prev, submitting: false }));
      setError(err.message || 'Failed to submit assignment');
    }
  };

  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = !!assignment && !!dueDate && dueDate < new Date() && assignment.status === 'pending';
  const daysLeft = dueDate
    ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const statusLabel = useMemo(() => {
    if (!assignment) return '';
    if (assignment.status === 'overdue') return 'overdue';
    return assignment.status;
  }, [assignment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F4] rounded-lg" />
            <div className="h-6 bg-[#E2E8F4] rounded w-24" />
          </div>
          <div className="bg-white rounded-[20px] p-5 sm:p-8 border border-[#E2E8F4] space-y-6">
            <div className="flex justify-between">
              <div className="space-y-3 w-2/3">
                <div className="h-8 bg-[#E2E8F4] rounded w-full" />
                <div className="h-4 bg-[#E2E8F4] rounded w-3/4" />
              </div>
              <div className="w-24 h-8 bg-[#E2E8F4] rounded-full" />
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-[#E2E8F4] rounded w-full" />
              <div className="h-4 bg-[#E2E8F4] rounded w-full" />
              <div className="h-4 bg-[#E2E8F4] rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-[#7A8FAF]">{error || 'Assignment not found'}</p>
          <Link
            href="/dashboard/assignments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4956A] text-white rounded-lg hover:bg-[#2A3828] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/assignments" className="p-2 hover:bg-[#E2E8F4] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#7A8FAF]" />
          </Link>
          <div className="flex-1">
            <span className="text-xs font-semibold text-[#D4956A] uppercase tracking-wider px-3 py-1 bg-[#D4956A]/10 rounded-full">
              {assignment.courseName}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 sm:p-8 border border-[#E2E8F4]">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1F2937] leading-tight mb-2">
                  {assignment.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#7A8FAF]">
                  {dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {dueDate.toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Max Score: {assignment.maxScore} points
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Passing Score: {assignment.passingScore}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                    assignment.status === 'graded'
                      ? 'bg-green-100 text-green-700'
                      : assignment.status === 'submitted'
                        ? 'bg-blue-100 text-blue-700'
                        : isOverdue
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                  )}
                >
                  {statusLabel}
                </span>
                {assignment.status === 'graded' && assignment.score !== null && (
                  <p className="text-sm font-bold text-[#1F2937] mt-1">
                    Score: {assignment.score}/{assignment.maxScore}
                  </p>
                )}
              </div>
            </div>

            {assignment.status === 'pending' && dueDate && (
              <div
                className={cn(
                  'p-4 rounded-lg border',
                  isOverdue
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : (daysLeft ?? 99) <= 1
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                )}
              >
                <div className="flex items-center gap-2">
                  {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span className="font-medium">
                    {isOverdue
                      ? 'Overdue'
                      : daysLeft === 0
                        ? 'Due today'
                        : daysLeft === 1
                          ? 'Due tomorrow'
                          : `${daysLeft} days left`}
                  </span>
                </div>
              </div>
            )}

            <div className="prose prose-sm max-w-none text-[#1F2937] leading-relaxed">
              {assignment.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-6 border-t border-[#E2E8F4]">
              <h3 className="font-semibold text-[#1F2937] mb-2">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4956A] rounded-full flex items-center justify-center text-white font-semibold">
                  {assignment.instructor.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-[#1F2937]">{assignment.instructor.name}</p>
                  {assignment.instructor.email && (
                    <p className="text-sm text-[#7A8FAF]">{assignment.instructor.email}</p>
                  )}
                </div>
              </div>
            </div>

            {assignment.attachments.length > 0 && (
              <div className="pt-6 border-t border-[#E2E8F4]">
                <h3 className="font-semibold text-[#1F2937] mb-3">Latest Submission</h3>
                <div className="space-y-2">
                  {assignment.attachments.map((attachment) => (
                    <a
                      key={attachment}
                      href={attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-[#D4956A] hover:text-[#2A3828] transition-colors"
                    >
                      {attachment.split('/').pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 rounded-[20px] p-5 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {(assignment.status === 'pending' || assignment.status === 'overdue') && (
          <div className="bg-white rounded-[20px] p-5 sm:p-8 border border-[#E2E8F4]">
            <h2 className="text-xl font-bold text-[#1F2937] mb-6">Submit Assignment</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Upload your solution
                </label>
                <div className="border-2 border-dashed border-[#E2E8F4] rounded-lg p-6 sm:p-8 text-center hover:border-[#D4956A] transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".js,.jsx,.ts,.tsx,.zip,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-[#7A8FAF] mx-auto mb-2" />
                    <p className="text-[#1F2937] font-medium">
                      {submission.files.length > 0
                        ? `${submission.files.length} file(s) selected`
                        : 'Click to upload your files'}
                    </p>
                    <p className="text-sm text-[#7A8FAF] mt-1">
                      Supported formats: JS, TS, ZIP, PDF, DOC, JPG, PNG
                    </p>
                  </label>
                </div>
                {submission.files.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-[#7A8FAF]">
                    {submission.files.map((file) => (
                      <li key={`${file.name}-${file.size}`}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Notes for your instructor
                </label>
                <textarea
                  value={submission.comment}
                  onChange={(e) => setSubmission((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share context, links, or anything your instructor should know."
                  className="w-full p-4 border border-[#E2E8F4] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#D4956A] focus:border-transparent"
                  rows={4}
                  disabled={submission.submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submission.submitting || submission.files.length === 0}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors w-full justify-center',
                  submission.submitting || submission.files.length === 0
                    ? 'bg-[#E2E8F4] text-[#7A8FAF] cursor-not-allowed'
                    : 'bg-[#D4956A] text-white hover:bg-[#2A3828]'
                )}
              >
                {submission.submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Assignment
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {assignment.status === 'submitted' && (
          <div className="bg-green-50 rounded-[20px] p-5 sm:p-8 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Assignment Submitted</h3>
                <p className="text-sm text-green-700">
                  Submitted on {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'recently'}
                </p>
              </div>
            </div>
          </div>
        )}

        {assignment.status === 'graded' && (
          <div className="bg-blue-50 rounded-[20px] p-5 sm:p-8 border border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Assignment Graded</h3>
                <p className="text-sm text-blue-700">
                  Score: {assignment.score}/{assignment.maxScore} points
                </p>
                {assignment.feedback && (
                  <p className="text-sm text-blue-800 mt-2">{assignment.feedback}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
