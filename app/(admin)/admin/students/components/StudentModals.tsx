'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Check, AlertTriangle, Trash2, Play, Pause, Mail, Send, FileText, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Student } from '../types';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

interface AddStudentModalProps extends ModalBaseProps {
  onSubmit: (data: any) => void;
}

export const AddStudentModal = ({ isOpen, onClose, onSubmit, isLoading }: AddStudentModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', email: '', phone: '', status: 'ACTIVE' });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#1C2B4A]">Add New Student</h2>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn("w-full px-4 py-3 border rounded-xl text-sm", errors.name ? "border-red-500" : "border-[#E2E8F4]")}
              placeholder="Enter student's full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={cn("w-full px-4 py-3 border rounded-xl text-sm", errors.email ? "border-red-500" : "border-[#E2E8F4]")}
              placeholder="Enter student's email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm"
              placeholder="Enter phone number (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 bg-[#1C2B4A] text-white rounded-xl text-sm font-bold hover:bg-[#2C3E5F] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Student
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface EditStudentModalProps extends ModalBaseProps {
  student: Student | null;
  onSubmit: (data: any) => void;
}

export const EditStudentModal = ({ isOpen, onClose, student, onSubmit, isLoading }: EditStudentModalProps) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        id: student.id,
        name: student.name || '',
        email: student.email,
        phone: student.phone || '',
        status: student.status || 'ACTIVE',
      });
      setErrors({});
    }
  }, [isOpen, student]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#1C2B4A]">Edit Student</h2>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={cn("w-full px-4 py-3 border rounded-xl text-sm", errors.name ? "border-red-500" : "border-[#E2E8F4]")} placeholder="Enter student's full name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Email Address <span className="text-red-500">*</span></label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={cn("w-full px-4 py-3 border rounded-xl text-sm", errors.email ? "border-red-500" : "border-[#E2E8F4]")} placeholder="Enter student's email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Phone Number</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm" placeholder="Enter phone number" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm">
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 bg-[#1C2B4A] text-white rounded-xl text-sm font-bold hover:bg-[#2C3E5F] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface DeleteConfirmModalProps extends ModalBaseProps {
  onConfirm: () => void;
  studentName: string;
}

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, studentName, isLoading }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">Deactivate Student</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#7A8299] mb-6">
          Are you sure you want to deactivate <strong>{studentName}</strong>?<br /><br />
          <span className="text-sm">This action will:</span>
          <ul className="text-sm list-disc list-inside mt-2">
            <li>Hide the student from normal lists</li>
            <li>Disable their account</li>
            <li>Preserve all payment and certificate records</li>
            <li>Allow restoration later if needed</li>
          </ul>
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Deactivate
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface SuspendModalProps extends ModalBaseProps {
  onConfirm: (reason: string, policy: string) => void;
  studentName: string;
  currentStatus: string;
}

export const SuspendModal = ({ isOpen, onClose, onConfirm, studentName, currentStatus, isLoading }: SuspendModalProps) => {
  const [reason, setReason] = useState('');
  const [policy, setPolicy] = useState('soft_suspend');
  const [notifyStudent, setNotifyStudent] = useState(true);
  const isRestoring = currentStatus === 'SUSPENDED';

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setPolicy('soft_suspend');
      setNotifyStudent(true);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRestoring && !reason.trim()) return;
    onConfirm(reason, policy);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isRestoring ? "bg-green-50" : "bg-orange-50")}>
              {isRestoring ? <Play className="w-5 h-5 text-green-600" /> : <Pause className="w-5 h-5 text-orange-600" />}
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">{isRestoring ? 'Restore Student' : 'Suspend Student'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#7A8299] mb-6">
          {isRestoring ? <>Are you sure you want to restore access for <strong>{studentName}</strong>? The student will be able to log in again.</> : <>Are you sure you want to suspend <strong>{studentName}</strong>? This action will restrict their access according to the policy selected below.</>}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRestoring && (
            <>
              <div>
                <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Suspension Policy <span className="text-red-500">*</span></label>
                <select value={policy} onChange={(e) => setPolicy(e.target.value)} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm">
                  <option value="soft_suspend">Soft Suspend - Block login, keep enrollments</option>
                  <option value="access_pause">Access Pause - Block login + pause course access</option>
                  <option value="compliance_block">Compliance Block - Disable all access</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Reason for Suspension <span className="text-red-500">*</span></label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm min-h-[100px]" placeholder="Enter the reason for suspension" required={!isRestoring} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="notifyStudent" checked={notifyStudent} onChange={(e) => setNotifyStudent(e.target.checked)} className="w-4 h-4 rounded border-[#E2E8F4] text-[#1C2B4A] focus:ring-[#E8B84B]" />
                <label htmlFor="notifyStudent" className="text-sm text-[#1C2B4A]">Notify student via email about this action</label>
              </div>
            </>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isLoading || (!isRestoring && !reason)} className={cn("flex-1 px-6 py-3 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2", isRestoring ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600")}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isRestoring ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isRestoring ? 'Restore Access' : 'Suspend Student'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface BulkEmailModalProps extends ModalBaseProps {
  selectedCount: number;
  onSend: (subject: string, body: string) => Promise<void>;
}

export const BulkEmailModal = ({ isOpen, onClose, selectedCount, onSend }: BulkEmailModalProps) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSubject('');
      setBody('');
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setIsSending(true);
    try {
      await onSend(subject, body);
      onClose();
    } catch (error) {
      // Handled by parent
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">Send Bulk Email</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#7A8299] mb-4">You are about to send an email to <strong>{selectedCount} students</strong>.</p>
        <div className="mb-4">
          <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Subject <span className="text-red-500">*</span></label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm" placeholder="Enter email subject" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Message <span className="text-red-500">*</span></label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm min-h-[120px]" placeholder="Enter your message" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isSending} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
          <button onClick={handleSend} disabled={isSending || !subject || !body} className="flex-1 px-6 py-3 bg-[#1C2B4A] text-white rounded-xl text-sm font-bold hover:bg-[#2C3E5F] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Send Email
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface BulkSuspendModalProps extends ModalBaseProps {
  selectedCount: number;
  onConfirm: (reason: string) => void;
}

export const BulkSuspendModal = ({ isOpen, onClose, selectedCount, onConfirm, isLoading }: BulkSuspendModalProps) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Pause className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">Suspend Students</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#7A8299] mb-4">You are about to suspend <strong>{selectedCount} students</strong>. They will lose access to the platform.</p>
        <div className="mb-6">
          <label className="block text-sm font-bold text-[#1C2B4A] mb-2">Reason for bulk suspension <span className="text-red-500">*</span></label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 border border-[#E2E8F4] rounded-xl text-sm min-h-[80px]" placeholder="Enter reason for this bulk action" required />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={isLoading || !reason} className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Pause className="w-4 h-4" />}
            Suspend {selectedCount} Students
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const BulkDeleteModal = ({ isOpen, onClose, onConfirm, isLoading }: ModalBaseProps & { onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">Bulk Deactivate</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#7A8299] mb-6">
          You are about to deactivate multiple students. This action will hide them from normal lists while preserving their records.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Deactivate Students
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface ResetPasswordModalProps extends ModalBaseProps {
  studentName: string;
  onConfirm: () => void;
}

export const ResetPasswordModal = ({ isOpen, onClose, studentName, onConfirm, isLoading }: ResetPasswordModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">Reset Password</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A8299] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#7A8299] mb-6">
          Are you sure you want to send a password reset email to <strong>{studentName}</strong>?<br /><br />
          <span className="text-sm">They will receive a secure link to create a new password. The link will expire in 24 hours.</span>
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-sm font-bold hover:bg-[#F8F9FC] transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-6 py-3 bg-[#1C2B4A] text-white rounded-xl text-sm font-bold hover:bg-[#2C3E5F] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Send Reset Link
          </button>
        </div>
      </motion.div>
    </div>
  );
};

