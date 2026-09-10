'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, Award, ShieldCheck, CheckCircle2, AlertCircle, Clock, 
  ArrowRight, UserCheck, Calendar, Trophy, Flame, Eye, ClipboardList,
  MessageSquare, User, Activity, FileText, CheckSquare, Sparkles, BookOpen, 
  Star, AlertTriangle, Search, Filter, Plus, ChevronDown, Check, Trash,
  Send, Users, BarChart3, Settings, ShieldAlert, AwardIcon, FileSpreadsheet,
  X, CheckSquare2, MinusCircle, MessageCircle, Pin, Inbox, BookMarked, HelpCircle,
  Printer, Download, Share2, FileCheck, ExternalLink, Github, Linkedin, Globe,
  ChevronLeft, CreditCard, Sliders, DollarSign
} from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';
import { useMentorTheme } from '@/components/mentor/MentorThemeContext';
import { updateProfile, changePassword } from '@/app/actions/profile';
import { useMessages } from '@/hooks/use-messages';
import MentorEmailPortal from '@/components/mentor/MentorEmailPortal';
import { isIilmUniversity } from '@/lib/utils/iilm';
import MentorCertificateStudioClient from '@/components/mentor/MentorCertificateStudioClient';
import AssignmentAutomationControlPanel from '@/components/mentor/AssignmentAutomationControlPanel';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ClientProps {
  initialData: {
    batches: any[];
    applications: any[];
    recentActivities: any[];
    topPerformers: any[];
    needsAttention: any[];
    stats: {
      activeInterns: number;
      activeCohorts: number;
      pendingReviews: number;
      reviewedToday: number;
      avgPerformanceRating: number;
      totalXpAwarded: number;
      certificatesRecommended: number;
      onlineInterns: number;
      averageProgress: number;
      currentResponseTime: string;
    };
  };
  currentTab: string;
  user: any;
}

export default function MentorDashboardClient({ initialData, currentTab, user }: ClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(currentTab);

  React.useEffect(() => {
    const handleUrlUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'dashboard';
      setActiveTab(tab === 'logs' ? 'logs' : tab);
    };

    handleUrlUpdate();
    window.addEventListener('popstate', handleUrlUpdate);
    return () => window.removeEventListener('popstate', handleUrlUpdate);
  }, [currentTab]);

  // Core database state
  const [batches, setBatches] = useState(initialData.batches);
  const [applications, setApplications] = useState(initialData.applications);
  const [stats, setStats] = useState(initialData.stats);
  const [recentActivities, setRecentActivities] = useState(initialData.recentActivities);
  const [topPerformers, setTopPerformers] = useState(initialData.topPerformers);
  const [attentionList, setAttentionList] = useState(initialData.needsAttention);
  const [subFilter, setSubFilter] = useState<'All' | 'Submitted' | 'Waiting for Review' | 'Needs Changes' | 'Approved' | 'Rejected'>('All');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentTabStatusFilter, setAssignmentTabStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [assignmentCategoryFilter, setAssignmentCategoryFilter] = useState<string>('ALL');
  const [assignmentSortByIntern, setAssignmentSortByIntern] = useState<boolean>(false);
  const [expandedCompletedIds, setExpandedCompletedIds] = useState<string[]>([]);
  const [expandedRecipientIds, setExpandedRecipientIds] = useState<string[]>([]);
  const [isSyncingGoogleSheets, setIsSyncingGoogleSheets] = useState<boolean>(false);

  // Letter Studio State
  const [docType, setDocType] = useState<'offer' | 'lor' | 'completion' | 'transcript'>('offer');
  const [selectedInternId, setSelectedInternId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>(
    'Demonstrated outstanding technical competence, high-signal problem solving skills, and consistent commitment to software engineering excellence throughout the SARTHI Internship Program.'
  );
  const [isSendingDoc, setIsSendingDoc] = useState<boolean>(false);

  // Editable Offer Letter Docx Template State (Mohit_Raj_Offer_Letter_Editable.docx)
  const [offerRecipientName, setOfferRecipientName] = useState<string>('Kunal Ranjan');
  const [offerRecipientEmail, setOfferRecipientEmail] = useState<string>('kunal.ranjan@example.com');
  const [offerDegree, setOfferDegree] = useState<string>('Computer Science');
  const [offerCollege, setOfferCollege] = useState<string>('Arka Jain University');
  const [offerCity, setOfferCity] = useState<string>('Jamshedpur, Jharkhand');
  const [offerPosition, setOfferPosition] = useState<string>('Software Development');
  const [offerStartDate, setOfferStartDate] = useState<string>('06-Jul-2026');
  const [offerEndDate, setOfferEndDate] = useState<string>('06-Sept-2026');
  const [offerRefNo, setOfferRefNo] = useState<string>('TT-INT-2026-0007');
  const [offerMentor, setOfferMentor] = useState<string>('Mohit Raj');
  const [offerDeadline, setOfferDeadline] = useState<string>('08-Jul-2026');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false);

  // Candidates database for Letter Studio
  const candidateOptions = [
    {
      id: 'kunal-ranjan',
      name: 'Kunal Ranjan',
      email: 'kunal.ranjan@example.com',
      degree: 'Computer Science',
      college: 'Arka Jain University',
      city: 'Jamshedpur, Jharkhand',
      position: 'Software Development',
      refNo: 'TT-INT-2026-0007',
      startDate: '06-Jul-2026',
      endDate: '06-Sept-2026',
      deadline: '08-Jul-2026',
      mentor: 'Mohit Raj'
    },
    {
      id: 'mohit-raj',
      name: 'Mohit Raj',
      email: 'pm.enthuse@gmail.com',
      degree: 'B.Tech, Artificial Intelligence & Data Science',
      college: 'Arka Jain University',
      city: 'Jamshedpur, Jharkhand',
      position: 'Research and Development Intern',
      refNo: 'TT-INT-2026-0006',
      startDate: '06-Jul-2026',
      endDate: '06-Sep-2026',
      deadline: '07-Jul-2026',
      mentor: 'Mohit Raj'
    },
    {
      id: 'aakash-sharma',
      name: 'Aakash Sharma',
      email: 'aakash@example.com',
      degree: 'B.Tech, Artificial Intelligence',
      college: 'NIT Jamshedpur',
      city: 'Jamshedpur, Jharkhand',
      position: 'AI & Data Engineering Intern',
      refNo: 'TT-INT-2026-0008',
      startDate: '06-Jul-2026',
      endDate: '06-Sept-2026',
      deadline: '08-Jul-2026',
      mentor: 'Mohit Raj'
    },
    {
      id: 'sabiha-siddiqui',
      name: 'Sabiha Siddiqui',
      email: 'sabiha@example.com',
      degree: 'B.Tech, Information Technology',
      college: 'Arka Jain University',
      city: 'Jamshedpur, Jharkhand',
      position: 'Cloud & DevOps Intern',
      refNo: 'TT-INT-2026-0009',
      startDate: '06-Jul-2026',
      endDate: '06-Sept-2026',
      deadline: '08-Jul-2026',
      mentor: 'Mohit Raj'
    },
    ...applications.map((app, idx) => ({
      id: app.id,
      name: app.name,
      email: app.email,
      degree: app.course || app.semester || 'Computer Science',
      college: app.college || 'Arka Jain University',
      city: app.city || 'Jamshedpur, Jharkhand',
      position: app.domain || 'Software Development',
      refNo: `TT-INT-2026-${String(idx + 10).padStart(4, '0')}`,
      startDate: '06-Jul-2026',
      endDate: '06-Sept-2026',
      deadline: '08-Jul-2026',
      mentor: 'Mohit Raj'
    }))
  ];

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedInternId(candidateId);
    setIsGeneratingPreview(true);

    const match = candidateOptions.find(c => c.id === candidateId || c.email === candidateId);
    if (match) {
      setOfferRecipientName(match.name);
      setOfferRecipientEmail(match.email);
      setOfferDegree(match.degree);
      setOfferCollege(match.college);
      setOfferCity(match.city);
      setOfferPosition(match.position);
      setOfferRefNo(match.refNo);
      setOfferStartDate(match.startDate);
      setOfferEndDate(match.endDate);
      setOfferDeadline(match.deadline);
      setOfferMentor(match.mentor);
    }

    setTimeout(() => {
      setIsGeneratingPreview(false);
    }, 350);
  };

  // Sync state with incoming server props when router.refresh() runs
  React.useEffect(() => {
    setBatches(initialData.batches);
    setApplications(initialData.applications);
    setStats(initialData.stats);
    setRecentActivities(initialData.recentActivities);
    setTopPerformers(initialData.topPerformers);
    setAttentionList(initialData.needsAttention);
  }, [initialData]);

  // Derived arrays (declared upfront to allow usage inside state initialization)
  const allMembers = batches.flatMap(b => b.members.map(m => ({ ...m, batch: b })))
    .sort((a, b) => (a.permanentInternId || '').localeCompare(b.permanentInternId || ''));

  // Exclude suspended members & users across all dashboard lists
  const activeMembersOnly = allMembers.filter(m => m.status !== 'SUSPENDED' && m.user?.status !== 'SUSPENDED');

  const allSubmissions = batches.flatMap(b => 
    b.members
      .filter(m => m.status !== 'SUSPENDED' && m.user?.status !== 'SUSPENDED')
      .flatMap(m => 
        m.submissions.map((sub: any) => ({
          ...sub,
          member: m,
          batch: b,
          assignment: b.assignments.find((a: any) => a.id === sub.assignmentId)
        }))
      )
  );

  const allAssignments = batches.flatMap(b => 
    b.assignments.map(a => ({
      ...a,
      batch: b,
      recipients: (a.recipients || []).filter((r: any) => 
        r.member?.status !== 'SUSPENDED' && r.member?.user?.status !== 'SUSPENDED'
      ),
      submissions: (a.submissions || []).filter((sub: any) => 
        sub.member?.status !== 'SUSPENDED' && sub.member?.user?.status !== 'SUSPENDED'
      )
    }))
  );

  // State parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');
  
  // Modals & Active Profiles
  const [active360Intern, setActive360Intern] = useState<any | null>(null);
  const [active360Tab, setActive360Tab] = useState('overview');
  const [activeReviewSub, setActiveReviewSub] = useState<any | null>(null);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showXpModal, setShowXpModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendForm, setSuspendForm] = useState({ memberId: '', reason: 'Attendance requirement non-compliance' });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [bulkXpValue, setBulkXpValue] = useState(100);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeAmountInr, setFeeAmountInr] = useState<number>(2000);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [sendingLinkedInReminder, setSendingLinkedInReminder] = useState(false);

  React.useEffect(() => {
    fetch('/api/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-internship-fee', payload: {} }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.amount !== undefined) {
          setFeeAmountInr(data.amount);
        }
      })
      .catch((err) => console.warn('Failed to fetch fee:', err));
  }, []);

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFee(true);
    const tid = toast.loading('Syncing internship fee to database...');
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-internship-fee',
          payload: { amount: feeAmountInr },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.paymentRequired
            ? `Internship Apply Fee updated to ₹${data.amount} in real-time!`
            : `Internship Apply Fee set to FREE (₹0). Payment waived for applicants!`,
          { id: tid }
        );
        setShowFeeModal(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(data.error || 'Failed to update fee', { id: tid });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating fee', { id: tid });
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handleSyncGoogleSheets = async () => {
    const tid = toast.loading('Syncing all candidates to Google Sheet (Team Sankalp)...');
    setIsSyncingGoogleSheets(true);
    try {
      const res = await fetch('/api/mentor/google-sheets/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`✓ Successfully synced ${data.count} candidates to Team Sankalp Google Sheet!`, { id: tid });
      } else {
        toast.error(data.error || 'Google Sheets sync failed', { id: tid });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error syncing with Google Sheets', { id: tid });
    } finally {
      setIsSyncingGoogleSheets(false);
    }
  };

  const handleSendLinkedInReminder = async (memberIds: string[], sendToAllMissing = false) => {
    try {
      setSendingLinkedInReminder(true);
      const res = await fetch('/api/mentor/interns/send-linkedin-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds, sendToAllMissing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send LinkedIn reminder');
      toast.success(data.message || 'LinkedIn reminder email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Error sending reminder email');
    } finally {
      setSendingLinkedInReminder(false);
    }
  };

  // Forms
  const [newAssignment, setNewAssignment] = useState({
    memberId: '',
    title: '',
    description: '',
    category: 'Daily Assignment',
    difficulty: 'Intermediate',
    estimatedTime: '2 Hours',
    xpReward: 100,
    deadline: '',
  });
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'field' | 'all' | 'individual'>('field');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [releaseAt, setReleaseAt] = useState<string>('');

  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    rating: 5,
    publicFeedback: '',
    privateNotes: '',
    xpBonus: 0,
    xpPenalty: 0,
    reason: '',
  });

  const [xpForm, setXpForm] = useState({
    memberId: '',
    amount: 100,
    description: '',
  });

  const [badgeForm, setBadgeForm] = useState({
    memberId: '',
    name: '',
    description: '',
    icon: '🏆',
  });

  // DM search & mobile pane state
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [mobileDmView, setMobileDmView] = useState<'list' | 'chat'>('list');
  const [selectedInternForAssignments, setSelectedInternForAssignments] = useState<string>('');


  // Dark / Light mode from sidebar toggle
  const { isDark } = useMentorTheme();
  // Reusable class tokens — NO backdrop-blur in dark mode (causes GPU compositor seams)
  const card   = isDark ? 'bg-slate-950/80 border border-white/10 text-white' : 'bg-white/75 border border-white/20';
  const cardSm = isDark ? 'bg-slate-900/70 border border-white/10 text-white' : 'bg-white/75 border border-white/20';
  const label  = isDark ? 'text-slate-300' : 'text-gray-500';
  const value  = isDark ? 'text-white' : 'text-[#0F172A]';
  const sub    = isDark ? 'text-slate-400' : 'text-gray-400';
  const hero   = isDark ? 'bg-slate-950/80 border border-white/10 text-white' : 'bg-white/80 border border-white/20';

  const [activeDmRecipientId, setActiveDmRecipientId] = useState(allMembers[0]?.user?.id || '');
  const [directMessageBody, setDirectMessageBody] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  const parseContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && 'text' in parsed) {
        return {
          text: parsed.text || "",
          replyTo: parsed.replyTo,
          attachments: parsed.attachments || [],
          isPinned: parsed.isPinned || false,
          pinnedBy: parsed.pinnedBy,
          editedAt: parsed.editedAt,
          deletedAt: parsed.deletedAt
        };
      }
    } catch (e) {}
    return {
      text: content,
      replyTo: undefined,
      attachments: [],
      isPinned: false,
      pinnedBy: undefined,
      editedAt: undefined,
      deletedAt: undefined
    };
  };

  const loadConversations = React.useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const {
    messages: dmMessages,
    isLoading: isDMLoading,
    isPaginationLoading,
    hasMore,
    fetchMessages: fetchDMMessages,
    fetchOlderMessages,
    sendMessage: sendDM,
    editMessage: editDM,
    deleteMessage: deleteDM,
    togglePinMessage,
    addReaction,
    markAsRead: markDMsAsRead,
    typingUsers: dmTypingUsers,
    handleTextChange: handleDMTextChange,
  } = useMessages(selectedConversationId);

  React.useEffect(() => {
    loadConversations();
  }, [loadConversations, selectedConversationId]);

  React.useEffect(() => {
    if (!activeDmRecipientId) return;
    const loadConversation = async () => {
      try {
        const res = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: activeDmRecipientId }),
        });
        const data = await res.json();
        if (data.conversationId) {
          setSelectedConversationId(data.conversationId);
        }
      } catch (err) {
        console.error("Failed to load conversation for DM:", err);
      }
    };
    loadConversation();
  }, [activeDmRecipientId]);

  React.useEffect(() => {
    if (selectedConversationId) {
      fetchDMMessages();
      markDMsAsRead();
    }
  }, [selectedConversationId, fetchDMMessages, markDMsAsRead]);

  // Live real-time dashboard auto-sync polling every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMessageBody.trim() || !selectedConversationId) return;
    const msg = await sendDM(directMessageBody, replyingTo);
    if (msg) {
      setDirectMessageBody('');
      setReplyingTo(null);
    }
  };

  // Settings & Scheduler configs
  const [officeHours, setOfficeHours] = useState([
    { day: 'Monday', time: '6:00 PM - 8:00 PM', enabled: true },
    { day: 'Wednesday', time: '7:00 PM - 9:00 PM', enabled: true },
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: '1', action: 'Workspace Loaded', details: 'Operational command center sync verified', time: new Date().toLocaleTimeString() },
  ]);

  const addAuditLog = (action: string, details: string) => {
    setAuditLogs(prev => [
      { id: Math.random().toString(), action, details, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };


  const handleSuspendIntern = async () => {
    if (!suspendForm.memberId) {
      toast.error('Please select an intern to suspend');
      return;
    }
    const internName = allMembers.find(m => m.id === suspendForm.memberId)?.user?.name || 'Intern';
    await executeApiAction(
      'suspend-intern',
      { memberId: suspendForm.memberId, reason: suspendForm.reason },
      `Intern ${internName} permanently suspended & branded notice emailed successfully.`
    );
    setShowSuspendModal(false);
  };

  const handleResendOfferLetter = async (app: any) => {
    await executeApiAction(
      'resend-offer-letter',
      { applicationId: app.id },
      `Updated Offer Letter PDF regenerated & emailed to ${app.email}!`
    );
  };

  const handleImpersonateIntern = async (targetUserId: string, targetName: string) => {
    const tid = toast.loading(`Switching to ${targetName}'s student workspace...`);
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'impersonate-intern',
          payload: { userId: targetUserId }
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Logged in as ${targetName}! Redirecting...`, { id: tid });
        window.location.href = data.redirectUrl || '/dashboard';
      } else {
        toast.error(data.error || 'Failed to impersonate intern', { id: tid });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Impersonation failed', { id: tid });
    }
  };

  // Actions handlers
  const executeApiAction = async (action: string, payload: any, successMessage: string) => {
    const tid = toast.loading('Processing request...');
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (res.ok) {
        addAuditLog(successMessage, 'Operation completed successfully');
        if (action === 'manage-application' && payload.status === 'APPROVED') {
          if (data.autoOfferLetterStatus === 'SUCCESS') {
            toast.success('Application Approved! Official Offer Letter PDF generated & emailed via Resend API.', { id: tid });
          } else if (data.autoOfferLetterStatus === 'SKIPPED_ALREADY_SENT') {
            toast.success('Application Approved! (Offer letter already sent previously).', { id: tid });
          } else if (data.autoOfferLetterStatus === 'FAILED') {
            toast.error(`Application Approved! Warning: Offer letter auto-send failed (${data.autoOfferLetterError || 'Error'}). You can retry in Letter Studio.`, { id: tid });
          } else {
            toast.success(successMessage, { id: tid });
          }
        } else {
          toast.success(successMessage, { id: tid });
        }
        startTransition(() => {
          router.refresh();
        });
        return true;
      } else {
        toast.error(data?.error || `Action failed: ${res.status}`, { id: tid });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Network error occurred', { id: tid });
    }
    return false;
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingAssignment) return;

    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one intern for this assignment.');
      return;
    }

    if (isScheduled) {
      if (!releaseAt) {
        toast.error('Please select a Release Date & Time.');
        return;
      }
      const relDate = new Date(releaseAt);
      const deadDate = new Date(newAssignment.deadline);
      const now = new Date();
      const maxRel = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (relDate <= now) {
        toast.error('Release Date/Time must be in the future.');
        return;
      }
      if (relDate > maxRel) {
        toast.error('Release Date/Time must be within the next 7 days.');
        return;
      }
      if (deadDate <= relDate) {
        toast.error('Deadline Date/Time must be strictly after the Release Date/Time.');
        return;
      }
    }

    setIsCreatingAssignment(true);
    try {
      const res = await fetch('/api/mentor/assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: selectedMemberIds,
          title: newAssignment.title,
          description: newAssignment.description,
          category: newAssignment.category,
          difficulty: newAssignment.difficulty,
          estimatedTime: newAssignment.estimatedTime,
          xpReward: Number(newAssignment.xpReward),
          deadline: newAssignment.deadline,
          scheduled: isScheduled,
          releaseAt: isScheduled ? releaseAt : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create bulk assignment.');
      }

      toast.success(
        data.isScheduled
          ? `Assignment scheduled for ${data.assignedCount} intern(s)!`
          : `Assignment published & emailed to ${data.assignedCount} intern(s)!`
      );

      setShowAssignModal(false);
      setNewAssignment({
        memberId: '',
        title: '',
        description: '',
        category: 'Daily Assignment',
        difficulty: 'Intermediate',
        estimatedTime: '2 Hours',
        xpReward: 100,
        deadline: '',
      });
      setIsScheduled(false);
      setReleaseAt('');
      setSelectedMemberIds([]);

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error creating bulk assignment');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewSub) return;
    const ok = await executeApiAction('review-submission', {
      submissionId: activeReviewSub.id,
      ...reviewForm,
    }, `Graded Submission: ${activeReviewSub.assignment?.title}`);
    if (ok) {
      setActiveReviewSub(null);
      setReviewForm({
        status: 'Approved',
        rating: 5,
        publicFeedback: '',
        privateNotes: '',
        xpBonus: 0,
        xpPenalty: 0,
        reason: '',
      });
    }
  };

  const handleAdjustXp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await executeApiAction('adjust-xp', xpForm, `XP Adjusted: ${xpForm.amount} XP`);
    if (ok) {
      setShowXpModal(false);
      setXpForm({ memberId: '', amount: 100, description: '' });
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await executeApiAction('award-badge', badgeForm, `Awarded Badge: ${badgeForm.name}`);
    if (ok) {
      setShowBadgeModal(false);
      setBadgeForm({ memberId: '', name: '', description: '', icon: '🏆' });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    await executeApiAction('delete-assignment', { assignmentId }, 'Deleted Assignment');
  };

  const handleBulkAwardXp = async () => {
    if (selectedMembers.length === 0) return;
    for (const memberId of selectedMembers) {
      await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust-xp',
          payload: { memberId, amount: bulkXpValue, description: 'Bulk XP adjustment by mentor' },
        }),
      });
    }
    addAuditLog('Bulk XP Awarded', `Adjusted XP for ${selectedMembers.length} interns.`);
    setSelectedMembers([]);
    startTransition(() => router.refresh());
  };

  const handleApplicationReview = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    let rejectionReason = undefined;
    if (status === 'REJECTED') {
      const reason = prompt('Please enter the reason for rejection:');
      if (reason === null) return; // User cancelled
      rejectionReason = reason || 'Information provided did not meet our current requirements.';
    }
    await executeApiAction('manage-application', { applicationId, status, rejectionReason }, `Reviewed Application ${status}`);
  };

  const handleAttendanceChange = async (memberId: string, action: 'approve' | 'reject') => {
    await executeApiAction('manage-attendance', { memberId, action }, `Check-in updated`);
  };

  const handleRecommendCertificate = async (memberId: string) => {
    await executeApiAction('recommend-certificate', {
      memberId,
      certUrl: '/certificates/cert-template.pdf',
      lorUrl: '/certificates/lor-template.pdf',
    }, 'Recommended Certificate LOR');
  };

  // Filtered members (excludes suspended interns from active mentor view)
  const filteredMembers = allMembers.filter(m => {
    const isNotSuspended = m.status !== 'SUSPENDED' && m.user?.status !== 'SUSPENDED';
    const matchSearch = m.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.permanentInternId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBatch = batchFilter === 'ALL' || m.batchId === batchFilter;
    return isNotSuspended && matchSearch && matchBatch;
  });

  return (
    <>
      {/* Scoped dark-mode text overrides — avoids editing every hardcoded color class */}
      {isDark && (
        <style>{`
          .mentor-dark-content h1,
          .mentor-dark-content h2,
          .mentor-dark-content h3,
          .mentor-dark-content h4,
          .mentor-dark-content h5,
          .mentor-dark-content p,
          .mentor-dark-content span,
          .mentor-dark-content strong,
          .mentor-dark-content small,
          .mentor-dark-content div > span,
          .mentor-dark-content label {
            color: rgba(255, 255, 255, 0.95) !important;
          }
          .mentor-dark-content .text-slate-800,
          .mentor-dark-content .text-slate-700,
          .mentor-dark-content .text-\\[\\#0F172A\\],
          .mentor-dark-content .text-black,
          .mentor-dark-content .command-black-text {
            color: rgba(255, 255, 255, 0.98) !important;
          }
          .mentor-dark-content .text-slate-600,
          .mentor-dark-content .text-slate-500,
          .mentor-dark-content .text-gray-600,
          .mentor-dark-content .text-gray-500,
          .mentor-dark-content .text-gray-450,
          .mentor-dark-content .text-slate-455 {
            color: rgba(203, 213, 225, 0.85) !important;
          }
          .mentor-dark-content .text-slate-400,
          .mentor-dark-content .text-gray-400,
          .mentor-dark-content .text-slate-300 {
            color: rgba(148, 163, 184, 0.9) !important;
          }
          .mentor-dark-content .bg-white {
            background-color: rgba(15, 23, 42, 0.9) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          .mentor-dark-content .bg-slate-50 {
            background-color: rgba(30, 41, 59, 0.8) !important;
            color: white !important;
          }
          .mentor-dark-content table thead {
            background-color: rgba(15, 23, 42, 0.95) !important;
          }
          .mentor-dark-content table tbody tr {
            border-bottom-color: rgba(255, 255, 255, 0.1) !important;
          }
          .mentor-dark-content table tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          .mentor-dark-content input,
          .mentor-dark-content select,
          .mentor-dark-content textarea {
            background-color: rgba(30, 41, 59, 0.9) !important;
            color: white !important;
            border-color: rgba(255, 255, 255, 0.15) !important;
          }
          .mentor-dark-content .border-b {
            border-color: rgba(255, 255, 255, 0.15) !important;
          }
          .mentor-dark-content .border-slate-150,
          .mentor-dark-content .border-slate-200,
          .mentor-dark-content .border-gray-100,
          .mentor-dark-content .border-gray-205,
          .mentor-dark-content .border-slate-100 {
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
          /* Keep accent colors intact */
          .mentor-dark-content .text-emerald-600,
          .mentor-dark-content .text-emerald-700,
          .mentor-dark-content .text-emerald-500 {
            color: #34d399 !important;
          }
          .mentor-dark-content .text-red-500,
          .mentor-dark-content .text-red-600 {
            color: #f87171 !important;
          }
          .mentor-dark-content .text-orange-500,
          .mentor-dark-content .text-amber-500 {
            color: #fb923c !important;
          }
        `}</style>
      )}

    <div className={`space-y-8 font-inter text-[#0F172A] max-w-7xl mx-auto px-4 md:px-8 pb-32${isDark ? ' mentor-dark-content' : ''}`}>
      {/* Workspace Menu Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/30 pb-6">
        <div>
          <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase block mb-1">SARTHI</span>
          <h1 className="text-2xl font-black font-outfit uppercase tracking-tight drop-shadow-sm">
            <span className="command-black-text" style={{ color: isDark ? '#ffffff' : '#000000' }}>Command</span> <span className="text-orange-500">Center</span>
          </h1>
        </div>
        
        {/* Tab Selection */}
        <div className="w-full lg:w-auto flex flex-col items-stretch lg:items-center">
          {/* Dropdown for Mobile View */}
          <div className="block lg:hidden w-full relative">
            <select
              value={activeTab}
              onChange={(e) => {
                const tabId = e.target.value;
                setActiveTab(tabId);
                const params = new URLSearchParams(window.location.search);
                params.set('tab', tabId);
                window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
              }}
              className={`w-full px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl border ${
                isDark 
                  ? 'bg-slate-900 border-white/10 text-white' 
                  : 'bg-white border-slate-200 text-slate-800'
              } outline-none appearance-none cursor-pointer pr-10 shadow-sm`}
            >
              {[
                { id: 'dashboard', label: 'Command Center' },
                { id: 'interns', label: 'My Interns' },
                { id: 'submissions', label: 'Submissions' },
                { id: 'assignments', label: 'Assignments' },
                { id: 'automation', label: '⚡ Daily Automation' },
                { id: 'review', label: 'Review' },
                { id: 'email', label: 'Email Portal' },
                { id: 'discussions', label: 'Discussions' },
                { id: 'logs', label: 'Audit Logs' },
                { id: 'applications', label: 'Applications' },
                { id: 'certificate-studio', label: '🎓 Certificate Studio' },
                { id: 'settings', label: 'Settings' },
              ].map(tab => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Row of Tabs for Desktop View */}
          <div className={`hidden lg:flex gap-1.5 p-1 ${isDark ? "bg-slate-900/60 border border-white/10" : "bg-white/60 border border-white/10"} rounded-2xl overflow-x-auto`}>
            {[
              { id: 'dashboard', label: 'Command Center' },
              { id: 'interns', label: 'My Interns' },
              { id: 'submissions', label: 'Submissions' },
              { id: 'assignments', label: 'Assignments' },
              { id: 'automation', label: '⚡ Daily Automation' },
              { id: 'review', label: 'Review' },
              { id: 'email', label: 'Email Portal' },
              { id: 'discussions', label: 'Discussions' },
              { id: 'logs', label: 'Audit Logs' },
              { id: 'applications', label: 'Applications' },
              { id: 'certificate-studio', label: '🎓 Certificate Studio' },
              { id: 'settings', label: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const params = new URLSearchParams(window.location.search);
                  params.set('tab', tab.id);
                  window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                }}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#174F3A] text-white shadow-sm' 
                    : isDark 
                      ? 'text-slate-400 hover:bg-white/10 hover:text-white' 
                      : 'text-slate-600 hover:bg-white/40 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- COMMAND CENTER HOMEPAGE --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* HERO SECTION */}
          <div className={`relative overflow-hidden ${hero} rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6`}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-[#174F3A]/10 text-[#174F3A] font-black tracking-widest text-[9px] uppercase rounded-full border border-[#174F3A]/5">
                  Mentor Workspace
                </span>
                <span className="text-slate-400 text-xs">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-800">
                  Good Afternoon, {user.name?.split(' ')[0] || 'Mohit'} 👋
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Software Development & Mentorship Program • <strong className="text-emerald-700">{batches.length} Active Cohorts</strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 pt-1">
                <div className="flex items-center gap-2 bg-white/40 px-3.5 py-2 rounded-xl border border-white/30">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Today&apos;s Focus: <strong className="text-slate-800">Review {stats.pendingReviews} pending submissions</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white/40 px-3.5 py-2 rounded-xl border border-white/30">
                  <span className="w-1.5 h-1.5 bg-[#174F3A] rounded-full" />
                  <span>Office Hours: <strong className="text-slate-800">6PM – 8PM</strong></span>
                </div>
                <button 
                  onClick={() => setShowFeeModal(true)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-300 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Apply Fee: <strong className="text-emerald-800">{feeAmountInr === 0 ? 'FREE (₹0)' : `₹${feeAmountInr}`}</strong></span>
                  <span className="text-[9px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Adjust Charge Bar</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Action Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <button 
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-3 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 border border-transparent"
              >
                <Plus className="w-3.5 h-3.5" /> Create Task
              </button>
              <button 
                onClick={() => setShowXpModal(true)}
                className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 border border-transparent"
              >
                <Zap className="w-3.5 h-3.5" /> Adjust XP
              </button>
              <button 
                onClick={() => setShowBadgeModal(true)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 border border-transparent"
              >
                <Award className="w-3.5 h-3.5" /> Award Badge
              </button>
              <button 
                onClick={() => setActiveTab('submissions')}
                className="px-4 py-3 bg-white/80 hover:bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Clock className="w-3.5 h-3.5" /> Review Queue
              </button>
            </div>
          </div>

          {/* DYNAMIC ANALYTICS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Active Interns', value: stats.activeInterns, trend: `+0 today`, sub: 'Assigned to cohorts', icon: Users, color: 'text-[#174F3A] bg-[#174F3A]/5 border-[#174F3A]/10' },
              { label: 'Interns Online', value: stats.onlineInterns, trend: `Active now`, sub: 'Realtime session sync', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-100' },
              { label: 'Pending Reviews', value: stats.pendingReviews, trend: `+${stats.pendingReviews} pending`, sub: 'Requires attention', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Average Progress', value: `${stats.averageProgress}%`, trend: `Completion rate`, sub: 'Accepted tasks', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-100' },
              { label: 'Reviewed Today', value: stats.reviewedToday, trend: `Completed today`, sub: 'Evaluations output', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={`${card} p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 group`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{c.label}</span>
                    <div className={`p-2 rounded-xl border ${c.color} transition-colors group-hover:bg-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-outfit text-slate-800">{c.value}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{c.trend}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PRIORITY QUEUE PANEL */}
            <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-5`}>
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Priority Queue</h3>
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className={`p-4 ${isDark ? "bg-slate-900/60 border border-white/10 hover:bg-slate-800/70" : "bg-white/60 border border-slate-150 hover:bg-white"} rounded-2xl flex items-center justify-between text-xs transition-all group`}>
                  <div>
                    <p className="font-bold text-slate-800">Submission Review</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stats.pendingReviews} waiting grading</p>
                  </div>
                  <button onClick={() => setActiveTab('submissions')} className="px-3 py-1.5 bg-slate-900 text-white font-black uppercase text-[9px] rounded-lg tracking-wider hover:bg-[#174F3A] transition-all">Open →</button>
                </div>

                <div className={`p-4 ${isDark ? "bg-slate-900/60 border border-white/10 hover:bg-slate-800/70" : "bg-white/60 border border-slate-150 hover:bg-white"} rounded-2xl flex items-center justify-between text-xs transition-all group`}>
                  <div>
                    <p className="font-bold text-slate-800">Candidate Applications</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{applications.filter(a => a.status === 'SUBMITTED').length} pending review</p>
                  </div>
                  <button onClick={() => setActiveTab('applications')} className="px-3 py-1.5 bg-slate-900 text-white font-black uppercase text-[9px] rounded-lg tracking-wider hover:bg-[#174F3A] transition-all">Evaluate →</button>
                </div>
              </div>
            </div>

            {/* TODAY'S SCHEDULE TIMELINE */}
            <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-5`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">Today&apos;s Schedule</h3>
              <div className="space-y-4 text-xs relative pl-4 border-l border-slate-200">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#174F3A] border-2 border-white" />
                  <p className="font-mono text-[9px] text-[#174F3A] font-black uppercase tracking-wider">6:00 PM</p>
                  <p className="font-bold text-slate-850">Office Hours Slot</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Students booking open</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white" />
                  <p className="font-mono text-[9px] text-slate-450 font-black uppercase tracking-wider">7:00 PM</p>
                  <p className="font-bold text-slate-850">1:1 Code Reviews</p>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY TIMELINE */}
            <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-5`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">Recent Activity</h3>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="p-1.5 bg-[#174F3A]/5 text-[#174F3A] rounded-lg mt-0.5 border border-[#174F3A]/10 shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{act.title}</p>
                      <p className="text-[9px] text-slate-400 truncate">{act.desc}</p>
                    </div>
                    <span className="text-[8px] text-slate-400 whitespace-nowrap mt-0.5">Just now</span>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">🎉 No recent activities to display.</div>
                )}
              </div>
            </div>
          </div>

          {/* INTERN SNAPSHOTS (HORIZONTAL CARD PROFILE LISTS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> Top Performers
              </h3>
              <div className="space-y-3">
                {topPerformers.map((perf) => (
                  <div key={perf.id} className={`flex items-center justify-between p-3.5 ${isDark ? "bg-slate-900/60 border border-white/10 hover:bg-slate-800/70" : "bg-white/60 border border-slate-150 hover:bg-white"} rounded-2xl text-xs transition-all`}>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={perf.user} size="sm" className="border-2 border-green-500/20" />
                      <div>
                        <span className="font-bold text-slate-800 block">{perf.user.name}</span>
                        <span className="text-[9px] text-slate-400">Cohort: {perf.batchName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 bg-[#174F3A]/5 text-[#174F3A] text-[9px] font-black rounded">Lvl {perf.currentLevel}</span>
                      <span className="font-bold text-emerald-600">{perf.currentXp} XP</span>
                    </div>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <div className="text-center py-8 text-slate-400">No batch members registered yet.</div>
                )}
              </div>
            </div>

            {/* Interns Needing Attention */}
            <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Interns Needing Attention
              </h3>
              <div className="space-y-3">
                {attentionList.map((perf) => (
                  <div key={perf.id} className={`flex items-center justify-between p-3.5 ${isDark ? "bg-slate-900/60 border border-white/10 hover:bg-slate-800/70" : "bg-white/60 border border-red-100/50 hover:bg-white"} rounded-2xl text-xs transition-all`}>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={perf.user} size="sm" className="border-2 border-red-500/20" />
                      <div>
                        <span className="font-bold text-slate-800 block">{perf.user.name}</span>
                        <span className="text-[9px] text-red-500 font-bold">Requires Attention: low XP status</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-black rounded">Lvl {perf.currentLevel}</span>
                      <span className="font-bold text-red-600">{perf.currentXp} XP</span>
                    </div>
                  </div>
                ))}
                {attentionList.length === 0 && (
                  <div className="text-center py-8 text-slate-400">🎉 Great job! All interns are progressing fine.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (() => {
        const list = allSubmissions.filter(s => subFilter === 'All' || s.status === subFilter);
        return (
          <div className="space-y-6 text-xs text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-150 shadow-sm">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Submission Board</h3>
                <p className="text-[10px] text-gray-400 mt-1">Review and provide feedbacks on intern assignment submissions</p>
              </div>
              <div className="flex items-center gap-2 font-black font-mono">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                  {allSubmissions.length} Total Submissions
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap bg-white/40 p-1.5 rounded-2xl border border-white/20 gap-1.5 max-w-max">
              {(['All', 'Submitted', 'Waiting for Review', 'Needs Changes', 'Approved', 'Rejected'] as const).map(tab => {
                const count = tab === 'All' ? allSubmissions.length : allSubmissions.filter(s => s.status === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setSubFilter(tab)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                      subFilter === tab 
                        ? "bg-[#174F3A] text-white shadow-md" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-transparent border-none"
                    )}
                  >
                    {tab}
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono",
                      subFilter === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submissions Grid List */}
            {list.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-150 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 text-lg mb-3">
                  🎉
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase">No Submissions Found</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-1.5">No submissions match the "{subFilter}" filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map(sub => {
                  const statusColors = {
                    'Submitted': 'bg-blue-50 border-blue-100 text-blue-700',
                    'Waiting for Review': 'bg-amber-50 border-amber-100 text-amber-700',
                    'Needs Changes': 'bg-indigo-50 border-indigo-100 text-indigo-700',
                    'Approved': 'bg-emerald-50 border-emerald-100 text-emerald-700',
                    'Rejected': 'bg-rose-50 border-rose-100 text-rose-700',
                  }[sub.status] || 'bg-slate-50 border-slate-100 text-slate-700';

                  return (
                    <div 
                      key={sub.id}
                      onClick={() => setActiveReviewSub(sub)}
                      className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group hover:border-[#174F3A]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-550 rounded font-black text-[9px] uppercase tracking-wider">
                            {sub.assignment?.category || 'Assignment'}
                          </span>
                          <span className={cn("px-2 py-0.5 border rounded font-black text-[9px] uppercase tracking-wider", statusColors)}>
                            {sub.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-[#174F3A] transition-colors mt-1">
                          {sub.assignment?.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Submitted {new Date(sub.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-[#174F3A] text-[10px]">
                            {sub.member.user?.name ? sub.member.user.name.charAt(0).toUpperCase() : 'I'}
                          </div>
                          <div>
                            <p className="font-black text-slate-700 text-[10px]">{sub.member.user?.name || 'Anonymous'}</p>
                            <p className="text-[9px] text-gray-400 font-medium">{sub.batch?.name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 font-mono bg-slate-50 px-2 py-0.5 border border-slate-150 rounded">
                          V{sub.versions?.[0]?.versionNumber || 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* --- INTERNS DIRECTORY --- */}
      {activeTab === 'interns' && (
        <div className="space-y-6 text-xs text-left">
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-150 shadow-sm">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Active Intern Directory</h3>
              <p className="text-[10px] text-gray-400 mt-1">Manage intern check-ins, adjust experience points (XP), and award badges.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search interns..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#174F3A] transition-all w-48"
                />
              </div>
              {/* Cohort Select */}
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#174F3A] cursor-pointer"
              >
                <option value="ALL">All Cohorts</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions Header */}
          {selectedMembers.length > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <span className="text-xs font-black text-emerald-855 uppercase tracking-wider">{selectedMembers.length} Interns Selected</span>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-emerald-800">XP Points:</label>
                <input 
                  type="number" 
                  value={bulkXpValue}
                  onChange={(e) => setBulkXpValue(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-emerald-200 bg-white rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                />
                <button 
                  onClick={handleBulkAwardXp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-sm border-none cursor-pointer"
                >
                  Bulk Award XP
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[10px] text-slate-700 uppercase bg-slate-50/80 border-b border-slate-150 font-black tracking-wider">
                  <tr>
                    <th className="px-5 py-4 w-10">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-[#174F3A] focus:ring-[#174F3A] cursor-pointer"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers(filteredMembers.map(m => m.id));
                          } else {
                            setSelectedMembers([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-5 py-4">Intern Details</th>
                    <th className="px-5 py-4">Batch</th>
                    <th className="px-5 py-4">XP Points</th>
                    <th className="px-5 py-4">Consistency</th>
                    <th className="px-5 py-4">Last Active / Login</th>
                    <th className="px-5 py-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-[#174F3A] focus:ring-[#174F3A] cursor-pointer"
                          checked={selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers(prev => [...prev, member.id]);
                            } else {
                              setSelectedMembers(prev => prev.filter(id => id !== member.id));
                            }
                          }}
                        />
                      </td>
                      <td 
                        className="px-5 py-4 flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          setActive360Intern(member);
                          setActive360Tab('overview');
                        }}
                      >
                        <UserAvatar user={member.user} size="sm" />
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-black text-slate-800 group-hover:text-[#174F3A] group-hover:underline transition-all text-xs">{member.user.name}</p>
                            {(() => {
                              const app = member.user?.internshipApplications?.[0];
                              let displayDomain = app?.domain;
                              if (!displayDomain || displayDomain.toLowerCase().includes('writing') || displayDomain.toLowerCase().includes('content') || displayDomain.toLowerCase().includes('creator')) {
                                displayDomain = 'creator & creative writer';
                              }
                              
                              let emoji = '💻';
                              if (displayDomain.toLowerCase().includes('writer') || displayDomain.toLowerCase().includes('writing') || displayDomain.toLowerCase().includes('creator')) emoji = '🎬';
                              else if (displayDomain.toLowerCase().includes('research')) emoji = '🔬';
                              else if (displayDomain.toLowerCase().includes('analysis')) emoji = '📊';
                              else if (displayDomain.toLowerCase().includes('editor')) emoji = '✂️';
                              
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[8px] font-black uppercase text-slate-550 tracking-wider">
                                  {emoji} {displayDomain}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-[9px] text-slate-400 font-black font-mono mt-0.5 tracking-wider uppercase">{member.permanentInternId || 'No ID'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{member.batch.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-[#174F3A] font-black rounded text-[9px]">Lvl {member.currentLevel}</span>
                          <span className="font-black font-mono text-slate-800">{member.currentXp} XP</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-slate-800">{member.attendances?.[0]?.consistency || 0}%</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{member.attendances?.[0]?.daysActive || 0} active days</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {(() => {
                          const lastDate = member.user?.lastLogin || member.user?.lastActive || member.joinedAt;
                          if (!lastDate) return <span className="text-[10px] text-slate-400 font-medium">Never logged in</span>;
                          const dateObj = new Date(lastDate);
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-800 text-[11px]">
                                {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap pr-6">
                        <button 
                          onClick={() => handleImpersonateIntern(member.userId || member.user?.id, member.user?.name || 'Intern')}
                          className="text-[10px] text-purple-700 font-black hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          👁️ Impersonate
                        </button>
                        <button 
                          onClick={() => {
                            setXpForm(prev => ({ ...prev, memberId: member.id }));
                            setShowXpModal(true);
                          }}
                          className="text-[10px] text-amber-700 font-black hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Adjust XP
                        </button>
                        <button 
                          onClick={() => {
                            setBadgeForm(prev => ({ ...prev, memberId: member.id }));
                            setShowBadgeModal(true);
                          }}
                          className="text-[10px] text-blue-700 font-black hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Award Badge
                        </button>
                        <button 
                          onClick={() => handleAttendanceChange(member.id, 'approve')}
                          className="text-[10px] text-slate-700 font-black hover:text-[#174F3A] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Check-in
                        </button>
                        <button 
                          onClick={() => {
                            setSuspendForm({ memberId: member.id, reason: 'Attendance requirement non-compliance' });
                            setShowSuspendModal(true);
                          }}
                          className="text-[10px] text-rose-700 font-black hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Suspend
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* --- INTERNSHIP APPLICATIONS PANEL --- */}
      {activeTab === 'applications' && (
        <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Candidate Internship Applications</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100 font-black">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">College & Course</th>
                  <th className="px-4 py-3">Documents</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-b border-gray-55">
                    <td className="px-4 py-4 font-bold text-gray-850">{app.name}<p className="text-[9px] text-gray-400">{app.email}</p></td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{app.preferredField || app.domain || 'N/A'}</td>
                    <td className="px-4 py-4">
                      {app.internshipTrack ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            app.internshipTrack === 'experienced'
                              ? 'bg-blue-55 text-blue-800 border border-blue-200'
                              : 'bg-indigo-55 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {app.internshipTrack === 'experienced' ? 'Experienced' : 'Learning'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{app.college} <p className="text-[9px] text-gray-400">{app.course} (Sem {app.semester})</p></td>
                    <td className="px-4 py-4 space-x-2">
                      {app.resume && <a href={app.resume} target="_blank" rel="noreferrer" className="text-[#174F3A] hover:underline">Resume</a>}
                      {app.github && <a href={app.github} target="_blank" rel="noreferrer" className="text-[#174F3A] hover:underline">GitHub</a>}
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-600">
                      <div className="flex flex-col gap-1">
                        {app.paymentStatus === 'paid' ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-max">
                              ✓ Auto-accepted via payment
                            </span>
                            {app.paymentStatusSource === 'manual_admin' && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded w-max" title={app.paymentOverrideNote || ''}>
                                ✍️ Manual Override
                              </span>
                            )}
                          </div>
                        ) : isIilmUniversity(app.college) ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded w-max uppercase">
                            NOT APPLIED
                          </span>
                        ) : app.paymentStatus === 'unpaid' && (app.status === 'pending' || app.status === 'SUBMITTED') ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded w-max">
                            ⏳ Awaiting Payment
                          </span>
                        ) : (
                          <span>{app.status}</span>
                        )}
                        {!isIilmUniversity(app.college) && app.offerAcceptedAt ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded w-max">
                            ✓ Offer Letter Sent
                          </span>
                        ) : !isIilmUniversity(app.college) && (app.status === 'APPROVED' || app.status === 'OFFER_ACCEPTED' || app.status === 'accepted') && app.paymentStatus !== 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded w-max">
                            ⚠ Offer Failed (Not Sent)
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {app.paymentStatus === 'paid' ? (
                        <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          Auto-accepted via payment
                        </span>
                      ) : (app.status === 'SUBMITTED' || app.status === 'pending' || (!app.offerAcceptedAt && (app.status === 'APPROVED' || app.status === 'OFFER_ACCEPTED'))) ? (
                        <>
                          <button 
                            onClick={() => handleApplicationReview(app.id, 'APPROVED')}
                            className="px-2 py-1 bg-emerald-50 text-[#174F3A] hover:bg-emerald-100 border border-emerald-200 font-bold rounded text-xs transition-all"
                          >
                            {app.offerAcceptedAt ? 'Approve' : (app.status === 'APPROVED' || app.status === 'OFFER_ACCEPTED') ? 'Retry Send Offer' : 'Approve'}
                          </button>
                          {(app.status === 'SUBMITTED' || app.status === 'pending') && (
                            <button 
                              onClick={() => handleApplicationReview(app.id, 'REJECTED')}
                              className="px-2 py-1 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 font-bold rounded text-xs transition-all"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      ) : app.offerAcceptedAt ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResendOfferLetter(app)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black rounded text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            Resend Offer Letter
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-450">Evaluated</span>
                      )}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">No applications waiting for review.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SCHEDULER & OFFICE HOURS --- */}
      {activeTab === 'office-hours' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-gray-100 pb-3">Office Hours Setup</h3>
            <div className="space-y-4">
              {officeHours.map(hours => (
                <div key={hours.day} className={`flex items-center justify-between p-3.5 ${isDark ? "bg-slate-900/60 border border-white/10" : "bg-white/60 border border-slate-150"} rounded-2xl`}>
                  <div>
                    <span className="font-bold text-gray-800 text-xs">{hours.day}</span>
                    <p className="text-[10px] text-gray-450 mt-0.5">{hours.time}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setOfficeHours(prev => prev.map(h => h.day === hours.day ? { ...h, enabled: !h.enabled } : h));
                      addAuditLog('Updated Availability', `Toggled ${hours.day} office hours`);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      hours.enabled ? 'bg-emerald-50 text-[#174F3A] border border-emerald-100' : 'bg-gray-100 text-gray-450'
                    }`}
                  >
                    {hours.enabled ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-gray-100 pb-3">Book review sessions</h3>
            <div className="space-y-3">
              <div className={`p-3.5 ${isDark ? "bg-slate-900/60 border border-white/10" : "bg-white/60 border border-slate-150"} rounded-2xl space-y-1 text-xs`}>
                <span className="font-bold text-gray-700">1:1 Performance Evaluation</span>
                <p className="text-[10px] text-gray-400">Scheduled: Friday, 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGNMENTS LIST (SIMPLIFIED & DE-DUPLICATED) --- */}
      {activeTab === 'assignments' && (() => {
        // Helper to compute recipient and completion stats for an assignment
        const getAssignmentStats = (a: any) => {
          const totalRecipients = a.recipients?.length || 0;
          // Count distinct members with Approved submissions
          const approvedCount = (a.submissions || []).filter((sub: any) => sub.status === 'Approved').length;
          const isCompleted = totalRecipients > 0 && approvedCount >= totalRecipients;
          const percentage = totalRecipients > 0 ? Math.round((approvedCount / totalRecipients) * 100) : 0;
          return { totalRecipients, approvedCount, isCompleted, percentage };
        };

        // Extract categories for filter
        const categories = Array.from(new Set(allAssignments.map(a => a.category).filter(Boolean)));

        // Extract selected intern object if filter is active
        const selectedInternObj = selectedInternForAssignments
          ? allMembers.find(m => 
              m.id === selectedInternForAssignments || 
              m.userId === selectedInternForAssignments || 
              (m.user?.email || '').toLowerCase() === selectedInternForAssignments.toLowerCase()
            )
          : null;

        // Filter assignments by search, category, and selected intern
        const filtered = allAssignments.filter(a => {
          if (a.status === 'scheduled') return false; // Rendered in dedicated scheduled section
          
          const matchIntern = !selectedInternForAssignments || a.recipients?.some((r: any) => 
            r.memberId === selectedInternForAssignments || 
            r.member?.id === selectedInternForAssignments ||
            r.member?.userId === selectedInternForAssignments ||
            (r.member?.user?.email || '').toLowerCase() === selectedInternForAssignments.toLowerCase() ||
            (r.member?.user?.name || '').toLowerCase().includes(selectedInternForAssignments.toLowerCase())
          );

          const matchSearch = !assignmentSearch || 
            a.title.toLowerCase().includes(assignmentSearch.toLowerCase()) || 
            a.category.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
            a.recipients?.some((r: any) => (r.member?.user?.name || '').toLowerCase().includes(assignmentSearch.toLowerCase()));

          const matchCategory = assignmentCategoryFilter === 'ALL' || a.category === assignmentCategoryFilter;

          return matchIntern && matchSearch && matchCategory;
        });

        // Helper to get first recipient name for sorting
        const getFirstRecipientName = (a: any) => {
          const first = a.recipients?.[0]?.member?.user?.name || '';
          return first.toLowerCase();
        };

        // Split into Pending and Completed lists
        const pendingList = filtered
          .filter(a => !getAssignmentStats(a).isCompleted)
          .sort((a, b) => {
            if (assignmentSortByIntern) {
              const nameA = getFirstRecipientName(a);
              const nameB = getFirstRecipientName(b);
              if (nameA !== nameB) return nameA.localeCompare(nameB);
            }
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });

        const completedList = filtered
          .filter(a => getAssignmentStats(a).isCompleted)
          .sort((a, b) => {
            if (assignmentSortByIntern) {
              const nameA = getFirstRecipientName(a);
              const nameB = getFirstRecipientName(b);
              if (nameA !== nameB) return nameA.localeCompare(nameB);
            }
            return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
          });

        // Apply Tab Status Filter (all, pending, completed)
        const visiblePending = (assignmentTabStatusFilter === 'all' || assignmentTabStatusFilter === 'pending') ? pendingList : [];
        const visibleCompleted = (assignmentTabStatusFilter === 'all' || assignmentTabStatusFilter === 'completed') ? completedList : [];

        const scheduledList = allAssignments.filter(a => a.status === 'scheduled');

        return (
          <div className="space-y-6 text-xs text-left">
            {/* Header Block with Summary Counters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-150 shadow-sm">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Course Assignments</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 font-mono font-bold">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px]">
                    ⏳ {pendingList.length} Pending
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px]">
                    🟢 {completedList.length} Completed
                  </span>
                  {scheduledList.length > 0 && (
                    <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-[10px]">
                      🚀 {scheduledList.length} Scheduled
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowAssignModal(true)}
                className="px-5 py-3 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 border-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Create Assignment
              </button>
            </div>

            {/* Filters and Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search assignments or interns..."
                  value={assignmentSearch}
                  onChange={e => setAssignmentSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#174F3A] transition-all"
                />
              </div>

              {/* Controls: Sort & Filter by Intern & Status Filters & Categories */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Intern Quick Selector Dropdown */}
                <select
                  value={selectedInternForAssignments}
                  onChange={e => setSelectedInternForAssignments(e.target.value)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 outline-none shadow-xs",
                    selectedInternForAssignments
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                      : "bg-emerald-50 text-[#174F3A] border-emerald-300 hover:bg-emerald-100/80"
                  )}
                >
                  <option value="" className="text-slate-800 bg-white">👤 Filter by Intern ({allMembers.length} Active)</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id} className="text-slate-900 bg-white font-medium">
                      {m.user?.name || 'Intern'} — {m.referenceNumber || m.user?.email || 'TT-INT'}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setAssignmentSortByIntern(prev => !prev)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5",
                    assignmentSortByIntern
                      ? "bg-emerald-50 text-[#174F3A] border-emerald-300 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                  title="Sort assignments alphabetically by Intern Name"
                >
                  <User className="w-3.5 h-3.5" />
                  Sort A-Z {assignmentSortByIntern && '✓'}
                </button>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl">
                  {(['all', 'pending', 'completed'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAssignmentTabStatusFilter(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none",
                        assignmentTabStatusFilter === tab
                          ? "bg-[#174F3A] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 bg-transparent"
                      )}
                    >
                      {tab === 'all' ? `All (${filtered.length})` : tab === 'pending' ? `Pending (${pendingList.length})` : `Completed (${completedList.length})`}
                    </button>
                  ))}
                </div>

                {/* Category Dropdown Filter */}
                {categories.length > 0 && (
                  <select
                    value={assignmentCategoryFilter}
                    onChange={e => setAssignmentCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#174F3A]"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                {selectedInternForAssignments && (
                  <button
                    onClick={() => setSelectedInternForAssignments('')}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    ✕ Clear Intern Filter
                  </button>
                )}
              </div>
            </div>

            {/* Selected Intern Command & Analytics Card */}
            {selectedInternObj && (
              <div className="bg-gradient-to-br from-emerald-950/95 via-slate-900 to-emerald-900 p-6 rounded-[2.5rem] text-white space-y-6 shadow-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedInternObj.user?.avatar_url || selectedInternObj.user?.image || '/sarthi-logo.png'} 
                      alt={selectedInternObj.user?.name || 'Intern'}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md bg-emerald-900/60" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-white">{selectedInternObj.user?.name || 'Intern'}</h3>
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase">
                          {selectedInternObj.referenceNumber || 'TT-INT'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/90 font-medium mt-0.5">{selectedInternObj.user?.email} • {selectedInternObj.user?.college || 'PSIT College'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedInternObj.batch?.name || 'July 2026 Batch'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedInternForAssignments('')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                    >
                      ✕ Close & Show All Interns
                    </button>
                  </div>
                </div>

                {/* Analytics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-emerald-300 font-black uppercase tracking-wider">Completion Rate</p>
                    <p className="text-2xl font-black text-white font-outfit">
                      {(() => {
                        const internAssignments = allAssignments.filter(a => 
                          a.recipients?.some((r: any) => 
                            r.memberId === selectedInternObj.id || 
                            r.member?.userId === selectedInternObj.userId ||
                            (r.member?.user?.email || '').toLowerCase() === (selectedInternObj.user?.email || '').toLowerCase()
                          )
                        );
                        const internActiveTasks = internAssignments.filter(a => a.status === 'active');
                        const internCompletedTasks = internAssignments.filter(a => 
                          (a.submissions || []).some((sub: any) => 
                            (sub.memberId === selectedInternObj.id || sub.member?.userId === selectedInternObj.userId) && sub.status === 'Approved'
                          )
                        );
                        const totalAssignedCount = internActiveTasks.length + internCompletedTasks.length;
                        return totalAssignedCount > 0 ? Math.round((internCompletedTasks.length / totalAssignedCount) * 100) : 0;
                      })()}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-amber-300 font-black uppercase tracking-wider">Pending Active Tasks</p>
                    <p className="text-2xl font-black text-amber-400 font-outfit">
                      {(() => {
                        const internAssignments = allAssignments.filter(a => 
                          a.recipients?.some((r: any) => 
                            r.memberId === selectedInternObj.id || 
                            r.member?.userId === selectedInternObj.userId ||
                            (r.member?.user?.email || '').toLowerCase() === (selectedInternObj.user?.email || '').toLowerCase()
                          )
                        );
                        const internActiveTasks = internAssignments.filter(a => a.status === 'active');
                        return internActiveTasks.filter(a => 
                          !(a.submissions || []).some((sub: any) => 
                            (sub.memberId === selectedInternObj.id || sub.member?.userId === selectedInternObj.userId) && sub.status === 'Approved'
                          )
                        ).length;
                      })()}
                    </p>
                    <p className="text-[9px] text-slate-400">Needs submission/review</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-purple-300 font-black uppercase tracking-wider">Upcoming Scheduled</p>
                    <p className="text-2xl font-black text-purple-300 font-outfit">
                      {(() => {
                        return allAssignments.filter(a => 
                          a.status === 'scheduled' &&
                          a.recipients?.some((r: any) => 
                            r.memberId === selectedInternObj.id || 
                            r.member?.userId === selectedInternObj.userId ||
                            (r.member?.user?.email || '').toLowerCase() === (selectedInternObj.user?.email || '').toLowerCase()
                          )
                        ).length;
                      })()}
                    </p>
                    <p className="text-[9px] text-slate-400">Queued for release</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-emerald-300 font-black uppercase tracking-wider">Total XP Earned</p>
                    <p className="text-2xl font-black text-emerald-400 font-outfit">{selectedInternObj.currentXp || 0} XP</p>
                    <p className="text-[9px] text-slate-400">Level {selectedInternObj.currentLevel || 1}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Assignments Section */}
            {scheduledList.length > 0 && (
              <div className="bg-purple-50/40 p-5 rounded-[1.5rem] border border-purple-200/60 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-purple-100 rounded-lg text-purple-700"><Clock className="w-4 h-4" /></span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-900">Scheduled Assignments (Pending Release)</h4>
                      <p className="text-[10px] text-purple-600">Hidden from interns until scheduled release timestamp</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-200 text-purple-800 rounded-full font-black text-[10px]">
                    {scheduledList.length} Scheduled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduledList.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-between gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-black uppercase">
                            {a.category}
                          </span>
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                            title="Cancel Scheduled Assignment"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h5 className="font-black text-slate-800 text-xs">{a.title}</h5>
                        <p className="text-gray-500 text-[11px] line-clamp-2">{a.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                        <div className="flex justify-between items-center text-purple-800 font-bold">
                          <span>🚀 Release Time:</span>
                          <span className="font-black">
                            {a.releaseAt ? new Date(a.releaseAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-medium">
                          <span>📅 Deadline:</span>
                          <span className="font-bold">{new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-400">
                          Recipients: {a.recipients?.length || 0} intern(s)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PENDING / INCOMPLETE ASSIGNMENTS SECTION */}
            {visiblePending.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending & Active Tasks ({visiblePending.length})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">Sorted by deadline (soonest first)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visiblePending.map(a => {
                    const stats = getAssignmentStats(a);
                    const isRecipientsExpanded = expandedRecipientIds.includes(a.id);
                    const recipientsList = a.recipients || [];
                    const displayRecipients = isRecipientsExpanded ? recipientsList : recipientsList.slice(0, 4);
                    const overflowCount = recipientsList.length - 4;

                    return (
                      <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 text-xs group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-[#174F3A] rounded font-black text-[9px] uppercase tracking-wider">{a.category}</span>
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 text-slate-500 text-[8px] font-black uppercase tracking-wider rounded">{a.difficulty}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteAssignment(a.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors border-none bg-transparent"
                              title="Delete Assignment"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-xs font-black text-slate-800 line-clamp-2">{a.title}</h4>
                          <p className="text-gray-500 font-medium leading-relaxed line-clamp-2">{a.description}</p>
                          
                          {/* Completion Progress Bar */}
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-extrabold text-slate-700">Completion Status</span>
                              <span className="font-mono font-black text-[#174F3A]">{stats.approvedCount}/{stats.totalRecipients} Done ({stats.percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#174F3A] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Compact Assigned To Chips */}
                          {recipientsList.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 pt-1">
                              <span className="font-black uppercase text-[8px] text-[#174F3A] tracking-wider mr-1">Assigned To ({recipientsList.length}):</span>
                              {displayRecipients.map((r: any) => (
                                <button
                                  key={r.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedInternForAssignments(r.memberId || r.member?.id || r.member?.user?.email || '');
                                  }}
                                  className="px-2 py-0.5 bg-slate-50 hover:bg-emerald-100 hover:text-[#174F3A] hover:border-emerald-300 border border-slate-150 rounded-md font-bold text-slate-700 text-[9px] transition-all cursor-pointer"
                                  title={`Click to view ${r.member?.user?.name || 'Intern'}'s assignment analytics`}
                                >
                                  👤 {r.member?.user?.name || 'Intern'}
                                </button>
                              ))}
                              {overflowCount > 0 && !isRecipientsExpanded && (
                                <button
                                  onClick={() => setExpandedRecipientIds(prev => [...prev, a.id])}
                                  className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-[#174F3A] rounded-md font-black text-[9px] hover:bg-emerald-100 transition-colors"
                                >
                                  +{overflowCount} more
                                </button>
                              )}
                              {isRecipientsExpanded && (
                                <button
                                  onClick={() => setExpandedRecipientIds(prev => prev.filter(id => id !== a.id))}
                                  className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-bold text-[9px] hover:bg-slate-300 transition-colors"
                                >
                                  Show Less
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-600 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>No recipients assigned</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-slate-100 pt-3 mt-1 font-bold">
                          <span>Reward: <strong className="text-[#174F3A] font-black font-mono">{a.xpReward} XP</strong></span>
                          <span>Deadline: <strong className="text-slate-700 font-black">{new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMPLETED ASSIGNMENTS SECTION (MINIMIZED COLLAPSIBLE ROWS) */}
            {visibleCompleted.length > 0 && (
              <div className="space-y-3 bg-emerald-50/30 p-5 rounded-[1.5rem] border border-emerald-100">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed Assignments ({visibleCompleted.length})
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-semibold">Fully finished by all assigned interns</span>
                </div>

                <div className="space-y-2">
                  {visibleCompleted.map(a => {
                    const isExpanded = expandedCompletedIds.includes(a.id);
                    const stats = getAssignmentStats(a);

                    return (
                      <div key={a.id} className="bg-white rounded-xl border border-slate-150 shadow-2xs overflow-hidden">
                        {/* Compact Minimized Row Header */}
                        <div 
                          onClick={() => {
                            setExpandedCompletedIds(prev => 
                              isExpanded ? prev.filter(id => id !== a.id) : [...prev, a.id]
                            );
                          }}
                          className="p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-black text-slate-800 text-xs truncate">{a.title}</h5>
                                <span className="px-2 py-0.5 bg-emerald-50 text-[#174F3A] border border-emerald-100 rounded text-[9px] font-black uppercase shrink-0">
                                  {a.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                Deadline: {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px] font-mono">
                              {stats.approvedCount}/{stats.totalRecipients} Done ✅
                            </span>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                          </div>
                        </div>

                        {/* Inline Expanded Details */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                            <p className="text-slate-600 font-medium leading-relaxed">{a.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                              <span className="font-black uppercase text-[8px] text-[#174F3A] tracking-wider mr-1">Completed By ({a.recipients?.length || 0}):</span>
                              {a.recipients?.map((r: any) => (
                                <span key={r.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-slate-700 text-[9px]">
                                  {r.member?.user?.name || 'Intern'}
                                </span>
                              ))}
                            </div>

                            <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-200 text-slate-400 font-bold">
                              <span>Reward: <strong className="text-[#174F3A] font-black font-mono">{a.xpReward} XP</strong></span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAssignment(a.id);
                                }}
                                className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[9px] font-black uppercase transition-colors border-none cursor-pointer"
                              >
                                Delete Record
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-150 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400 text-lg mb-3">
                  🔍
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase">No Assignments Found</h3>
                <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-1.5">Try adjusting your search query or filters.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* --- REVIEW TAB --- */}
      {activeTab === 'review' && (() => {
        const pendingSubmissions = allSubmissions.filter(s => 
          s.status === 'Submitted' || 
          s.status === 'Waiting for Review' || 
          s.status === 'Rejected' || 
          s.status === 'Needs Changes'
        );
        return (
          <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-6 text-xs text-left`}>
            <div className="border-b border-gray-150 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CheckSquare2 className="w-4 h-4 text-[#2D6A4F]" />
                  Submissions Awaiting Review
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Review, grade, and provide feedback on pending internship assignments.</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3 h-3" />
                {pendingSubmissions.length} Pending
              </span>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 text-xl">
                  🎉
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase">All Caught Up!</p>
                <p className="text-xs text-gray-400 font-medium">There are no pending submissions waiting for review in this cohort.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingSubmissions.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="p-5 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.02)] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-200 group/item"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 font-black text-[9px] uppercase">
                          {sub.assignment?.category || 'Assignment'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-black text-[9px] uppercase">
                          Version {sub.versions?.[0]?.versionNumber || 1}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Submitted on {new Date(sub.updatedAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-gray-800 tracking-tight group-hover/item:text-[#2D6A4F] transition-colors">
                        {sub.assignment?.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-[#40916C]" />
                        <span>Intern: <strong className="text-gray-700">{sub.member.user?.name}</strong> ({sub.batch?.name})</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveReviewSub(sub)}
                      className="px-5 py-3 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] hover:from-[#2D6A4F] hover:to-[#40916C] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(45,106,79,0.15)] flex items-center gap-1.5"
                    >
                      <span>Review Submission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* --- EMAIL PORTAL TAB --- */}
      {activeTab === 'email' && (() => {
        const emailInternsList = allMembers.map(m => ({
          id: m.id,
          student: {
            id: m.userId,
            name: m.user?.name || 'Intern',
            email: m.user?.email || '',
          },
          course: {
            title: m.batch?.name || 'Internship Cohort',
          }
        }));
        return <MentorEmailPortal students={emailInternsList} isDark={isDark} />;
      })()}

      {/* --- DISCUSSIONS TAB: DIRECT MESSAGES (full-width, redesigned) --- */}
      {activeTab === 'discussions' && (
        <div className={`${card} rounded-[2rem] shadow-sm text-xs text-left overflow-hidden flex flex-col`} style={{ height: 'calc(100vh - 220px)', minHeight: '520px' }}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Direct Messages</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">End-to-end chat with your interns</p>
            </div>
            {allMembers.length > 0 && (
              <span className="px-2.5 py-1 bg-[#174F3A]/8 text-[#174F3A] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#174F3A]/15">
                {allMembers.length} Intern{allMembers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ── Two-pane body ── */}
          <div className="flex flex-1 min-h-0">

            {/* ── LEFT: Intern list (hidden on mobile when chat is open) ── */}
            <div className={`w-72 border-r border-slate-100 flex flex-col shrink-0 ${
              mobileDmView === 'chat' ? 'hidden md:flex' : 'flex'
            }`}>

              {/* Search */}
              <div className="px-4 py-3 border-b border-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search interns..."
                    value={dmSearchQuery}
                    onChange={e => setDmSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium focus:outline-none focus:border-[#174F3A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Intern rows */}
              <div className="flex-1 overflow-y-auto">
                {allMembers
                  .filter(m => !dmSearchQuery || m.user?.name?.toLowerCase().includes(dmSearchQuery.toLowerCase()))
                  .map((m) => {
                    const memberId = m.user?.id;
                    const conv = conversations.find(c => c.participants.some((p: any) => p.id === memberId));
                    const unread = conv?.unreadCount || 0;
                    const lastMsgMeta = conv?.lastMessage ? parseContent(conv.lastMessage.content) : null;
                    const isSelected = activeDmRecipientId === memberId;
                    const initials = (m.user?.name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

                    return (
                      <button
                        key={memberId}
                        onClick={() => {
                          setActiveDmRecipientId(memberId);
                          setMobileDmView('chat');
                        }}
                        className={`w-full text-left px-4 py-3.5 transition-all flex items-center gap-3 border-b border-slate-50/80 ${
                          isSelected
                            ? 'bg-[#174F3A]/8 border-l-2 border-l-[#174F3A]'
                            : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isSelected ? 'bg-[#174F3A] text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {initials}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-[11px] truncate flex items-center gap-1.5 ${
                            unread > 0 ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {m.user?.name}
                          </div>
                          {lastMsgMeta ? (
                            <div className={`text-[9px] truncate mt-0.5 ${
                              unread > 0 ? 'text-slate-600 font-semibold' : 'text-slate-400 font-medium'
                            }`}>
                              {lastMsgMeta.text}
                            </div>
                          ) : (
                            <div className="text-[9px] text-slate-300 mt-0.5 italic">No messages yet</div>
                          )}
                        </div>

                        {/* Unread badge */}
                        {unread > 0 && (
                          <span className="h-5 min-w-5 px-1 flex items-center justify-center bg-[#174F3A] text-white rounded-full text-[8px] font-black shrink-0">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {allMembers.filter(m => !dmSearchQuery || m.user?.name?.toLowerCase().includes(dmSearchQuery.toLowerCase())).length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-[10px]">
                    {dmSearchQuery ? `No interns matching "${dmSearchQuery}"` : 'No interns assigned.'}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Chat area (hidden on mobile when list is shown) ── */}
            <div className={`flex-1 flex flex-col min-w-0 ${
              mobileDmView === 'list' ? 'hidden md:flex' : 'flex'
            }`}>

              {activeDmRecipientId ? (
                <>
                  {/* Chat header */}
                  {(() => {
                    const activeMember = allMembers.find(m => m.user?.id === activeDmRecipientId);
                    const initials = (activeMember?.user?.name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 shrink-0 bg-white/60">
                        {/* Back button — mobile only */}
                        <button
                          onClick={() => setMobileDmView('list')}
                          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mr-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#174F3A] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-black text-[11px] text-slate-800">{activeMember?.user?.name || 'Intern'}</div>
                          <div className="text-[9px] text-slate-400 font-medium">{activeMember?.field || activeMember?.batch?.name || 'Intern'}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Pinned messages bar */}
                  {(() => {
                    const pinned = dmMessages.filter(m => parseContent(m.content).isPinned);
                    if (pinned.length === 0) return null;
                    return (
                      <div className="bg-amber-50/80 border-b border-amber-200/60 px-5 py-2.5 text-[10px] space-y-1 shrink-0">
                        <div className="font-extrabold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Pin className="w-3 h-3 text-amber-700 rotate-45" />
                          Pinned ({pinned.length})
                        </div>
                        {pinned.slice(0, 2).map((pm: any) => {
                          const meta = parseContent(pm.content);
                          return (
                            <div key={pm.id} className="flex justify-between items-center gap-3">
                              <span className="text-gray-700 truncate">{meta.text}</span>
                              <button
                                onClick={() => togglePinMessage(pm.id, false)}
                                className="text-[9px] text-amber-800 hover:text-amber-950 font-black uppercase tracking-wider shrink-0"
                              >
                                Unpin
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Message thread */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1" id="dm-thread">
                    {hasMore && dmMessages.length > 0 && (
                      <button
                        onClick={fetchOlderMessages}
                        disabled={isPaginationLoading}
                        className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-wider mb-2 border border-slate-100 disabled:opacity-50 transition-all"
                      >
                        {isPaginationLoading ? 'Loading...' : 'Load older messages'}
                      </button>
                    )}

                    {isDMLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-5 h-5 border-2 border-[#174F3A]/20 border-t-[#174F3A] rounded-full animate-spin" />
                      </div>
                    ) : dmMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                        <MessageSquare className="w-8 h-8 text-slate-200" />
                        <p className="text-[11px] text-slate-400 font-medium">No messages yet — say hello!</p>
                      </div>
                    ) : (
                      dmMessages.map((msg: any, idx: number) => {
                        const isMe = msg.senderId === user.id;
                        const meta = parseContent(msg.content);
                        const isDeleted = !!meta.deletedAt;
                        // Group: hide sender name if same sender as previous
                        const prevMsg = dmMessages[idx - 1];
                        const isSameGroup = prevMsg && prevMsg.senderId === msg.senderId;

                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSameGroup ? 'mt-0.5' : 'mt-3'} group/msg`}>
                            {/* Sender label — only first of group */}
                            {!isSameGroup && !isMe && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 ml-2 mb-1">
                                {msg.senderName || 'Intern'}
                              </span>
                            )}

                            <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                              {/* Bubble */}
                              <div className={`relative px-3.5 py-2.5 rounded-2xl shadow-sm ${
                                isMe
                                  ? 'bg-[#174F3A] text-white rounded-tr-sm'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                              } ${isSameGroup ? (isMe ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}>

                                {/* Reply context */}
                                {meta.replyTo && (
                                  <div className={`px-2 py-1.5 rounded-lg text-[9px] border mb-2 truncate max-w-[220px] ${
                                    isMe ? 'bg-black/20 border-white/10 text-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-500'
                                  }`}>
                                    <span className="font-black block">{meta.replyTo.senderName}</span>
                                    <span className="italic">{meta.replyTo.content}</span>
                                  </div>
                                )}

                                {/* Edit mode */}
                                {editingMessageId === msg.id ? (
                                  <div className="space-y-1.5 min-w-[180px]">
                                    <input
                                      type="text"
                                      value={editMessageText}
                                      onChange={(e) => setEditMessageText(e.target.value)}
                                      className="w-full px-2 py-1 text-slate-800 text-[11px] rounded border focus:outline-none focus:border-emerald-600 bg-white"
                                    />
                                    <div className="flex gap-1 justify-end text-[9px]">
                                      <button onClick={() => { editDM(msg.id, editMessageText); setEditingMessageId(null); }} className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded">Save</button>
                                      <button onClick={() => setEditingMessageId(null)} className="px-2 py-0.5 bg-gray-200 text-gray-700 font-bold rounded">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className={`text-[11px] leading-relaxed whitespace-pre-wrap ${isDeleted ? 'italic opacity-50' : ''}`}>
                                    {meta.text}
                                  </p>
                                )}

                                {/* Timestamp + delivery tick */}
                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-[8px] ${isMe ? 'text-emerald-200/70' : 'text-slate-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {meta.editedAt && !isDeleted && (
                                    <span className={`text-[7px] font-bold uppercase ${isMe ? 'text-emerald-300/60' : 'text-slate-400'}`}>(edited)</span>
                                  )}
                                  {isMe && !isDeleted && (
                                    <span className="text-[9px] ml-0.5">
                                      {msg.status === 'sending' ? (
                                        <Clock className="w-2.5 h-2.5 text-emerald-300/70 animate-pulse inline" />
                                      ) : msg.isRead ? (
                                        <span className="text-sky-300 font-black">✓✓</span>
                                      ) : (
                                        <span className="text-emerald-300/60 font-black">✓</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Hover actions */}
                              {!isDeleted && (
                                <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm gap-0.5 shrink-0">
                                  <button onClick={() => setReplyingTo(msg)} className="p-1 hover:bg-slate-100 rounded text-slate-400" title="Reply">
                                    <MessageSquare className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => togglePinMessage(msg.id, !meta.isPinned)} className={`p-1 hover:bg-slate-100 rounded ${meta.isPinned ? 'text-amber-500' : 'text-slate-400'}`} title={meta.isPinned ? 'Unpin' : 'Pin'}>
                                    <Pin className="w-3 h-3" />
                                  </button>
                                  {isMe && (
                                    <>
                                      <button onClick={() => { setEditingMessageId(msg.id); setEditMessageText(meta.text); }} className="p-1 hover:bg-slate-100 rounded text-slate-400" title="Edit">
                                        <FileText className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => deleteDM(msg.id)} className="p-1 hover:bg-red-50 rounded text-red-400" title="Delete">
                                        <Trash className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Reactions */}
                            {!isDeleted && (msg.reactions || []).length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {(msg.reactions || []).map((r: any) => (
                                  <button
                                    key={r.id}
                                    onClick={() => addReaction(msg.id, r.type)}
                                    className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-[9px] flex items-center gap-1 hover:bg-slate-100 font-bold text-slate-600"
                                  >
                                    <span>{r.type === 'thumbsup' ? '👍' : r.type === 'heart' ? '❤️' : r.type === 'laugh' ? '😂' : '👀'}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Typing indicator */}
                    {dmTypingUsers.length > 0 && (
                      <div className="flex justify-start mt-2">
                        <div className="px-3 py-2 bg-slate-100 text-slate-400 text-[9px] rounded-2xl italic animate-pulse border border-slate-100">
                          Intern is typing…
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Composer — sticky at bottom */}
                  <div className="shrink-0 border-t border-slate-100 px-4 py-3 bg-white/80 sticky bottom-0">
                    {/* Reply preview */}
                    {replyingTo && (
                      <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-[10px] font-bold text-slate-600 mb-2">
                        <span className="truncate">Replying to {replyingTo.senderName}: &quot;{parseContent(replyingTo.content).text}&quot;</span>
                        <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 ml-2 shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}

                    <form onSubmit={handleSendDirectMessage} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder={`Message ${allMembers.find(m => m.user?.id === activeDmRecipientId)?.user?.name?.split(' ')[0] || 'intern'}…`}
                        value={directMessageBody}
                        onChange={e => {
                          setDirectMessageBody(e.target.value);
                          handleDMTextChange();
                        }}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] focus:ring-2 focus:ring-[#174F3A]/10 bg-slate-50 font-medium text-[11px] transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!directMessageBody.trim()}
                        className="px-4 py-2.5 bg-[#174F3A] hover:bg-[#0E2E1E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* Empty state: no intern selected */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Select an intern to start chatting</p>
                    <p className="text-[10px] text-slate-400">Choose a conversation from the list on the left</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- AUDIT LOGS TAB --- */}
      {/* --- AUDIT LOGS TAB --- */}
      {activeTab === 'logs' && (
        <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-gray-100 pb-3">Mentor Operations Audit Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100 font-black">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Command</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-55 hover:bg-white/40">
                    <td className="px-4 py-4 font-mono text-[10px] text-slate-400">{log.time}</td>
                    <td className="px-4 py-4 font-bold text-slate-800">{log.action}</td>
                    <td className="px-4 py-4 text-slate-500">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* --- MENTOR CERTIFICATE STUDIO TAB --- */}
      {activeTab === 'certificate-studio' && (
        <MentorCertificateStudioClient
          initialInterns={activeMembersOnly}
          initialApplications={applications}
          user={user}
        />
      )}

      {/* --- ASSIGNMENT AUTOMATION ENGINE TAB --- */}
      {activeTab === 'automation' && (
        <AssignmentAutomationControlPanel />
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-left">
          {/* PROFILE CARD */}
          <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Personal Information</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Manage your personal profile details</p>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const image = (form.elements.namedItem('image') as HTMLInputElement).value;
                const res = await updateProfile({ name, image });
                if (res.success) {
                  addAuditLog('Settings Updated', 'User profile details changed successfully');
                  router.refresh();
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Display Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={user?.name || ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#174F3A] bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Profile Image URL</label>
                <input
                  type="url"
                  name="image"
                  defaultValue={user?.image || ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#174F3A] bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  defaultValue={user?.email || ''}
                  className="w-full px-3 py-2 border border-slate-150 rounded-lg bg-gray-100 text-gray-450 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md"
              >
                Save Profile
              </button>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className={`${card} p-6 rounded-[2rem] shadow-sm space-y-4`}>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Security Configuration</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Update account login password parameters</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const current = (form.elements.namedItem('current') as HTMLInputElement).value;
                const newPass = (form.elements.namedItem('new') as HTMLInputElement).value;
                const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;
                
                const res = await changePassword({ current, new: newPass, confirm });
                if (res.success) {
                  addAuditLog('Security Updated', 'Account login password changed successfully');
                  form.reset();
                } else {
                  alert(res.error || 'Failed to change password');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Current Password</label>
                <input
                  type="password"
                  name="current"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#174F3A] bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">New Password</label>
                <input
                  type="password"
                  name="new"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#174F3A] bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#174F3A] bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- INTERN 360 DEGREE PROFILE MODAL --- */}
      {active360Intern && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={active360Intern.user} size="md" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black font-outfit uppercase">{active360Intern.user?.name}</h3>
                  <p className="text-xs text-gray-500">{active360Intern.permanentInternId} • Cohort: {active360Intern.batch?.name}</p>
                  
                  {/* Social Links UI */}
                  {(() => {
                    let links: any = {};
                    try { links = active360Intern.user?.socialLinks ? JSON.parse(active360Intern.user.socialLinks) : {}; } catch(e){}
                    return (
                      <div className="flex items-center gap-3 pt-1">
                        {links.github ? (
                          <a href={links.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-slate-900 transition-colors flex items-center gap-1.5" title="GitHub">
                            <Github className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">GitHub</span>
                          </a>
                        ) : (
                          <span className="text-gray-300 cursor-not-allowed flex items-center gap-1.5" title="GitHub Not Added">
                            <Github className="w-3.5 h-3.5 opacity-50" /> <span className="text-[10px] font-medium opacity-50">Not added</span>
                          </span>
                        )}
                        {links.linkedin ? (
                          <a href={links.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors flex items-center gap-1.5" title="LinkedIn">
                            <Linkedin className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">LinkedIn</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 cursor-not-allowed flex items-center gap-1.5" title="LinkedIn Not Added">
                              <Linkedin className="w-3.5 h-3.5 opacity-50" /> <span className="text-[10px] font-medium opacity-50">Not added</span>
                            </span>
                            <button
                              disabled={sendingLinkedInReminder}
                              onClick={() => handleSendLinkedInReminder([active360Intern.id])}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[9px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Send branded email reminder to intern to add LinkedIn"
                            >
                              {sendingLinkedInReminder ? 'Sending...' : 'Send Reminder 🚀'}
                            </button>
                          </div>
                        )}
                        {links.website ? (
                          <a href={links.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-700 transition-colors flex items-center gap-1.5" title="Website">
                            <Globe className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">Website</span>
                          </a>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleImpersonateIntern(active360Intern.userId || active360Intern.user?.id, active360Intern.user?.name || 'Intern')}
                  className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <span>👁️ Impersonate Student Dashboard</span>
                </button>
                <button onClick={() => setActive360Intern(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Profile Dialog Tabs */}
            <div className="flex gap-4 border-b border-gray-150 pb-2">
              {['overview', 'assignments', 'xp', 'badges', 'sessions'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActive360Tab(tab)}
                  className={`text-xs font-black uppercase tracking-wider pb-2 relative transition-all ${
                    active360Tab === tab ? 'text-[#174F3A]' : 'text-gray-450 hover:text-gray-650'
                  }`}
                >
                  {tab}
                  {active360Tab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#174F3A] rounded-full" />}
                </button>
              ))}
            </div>

            {active360Tab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Internship Timeline Status</h4>
                  <div className="space-y-3 bg-gray-50 p-4 border border-gray-100 rounded-xl">
                    <p className="flex justify-between"><strong>Orientation:</strong> <span className="text-emerald-600 font-bold">Completed</span></p>
                    <p className="flex justify-between"><strong>Weekly Assignments:</strong> <span className="text-gray-600 font-bold">{active360Intern.submissions?.length || 0} Submitted</span></p>
                    <p className="flex justify-between"><strong>Level Status:</strong> <span className="text-[#10B981] font-bold">Level {active360Intern.currentLevel} ({active360Intern.currentXp} XP)</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700">Certificate & Recommendations</h4>
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-3">
                    {active360Intern.certificates?.length > 0 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approved Certificate</span>
                    ) : (
                      <button 
                        onClick={() => handleRecommendCertificate(active360Intern.id)}
                        className="w-full py-2 bg-[#174F3A] text-white font-black uppercase tracking-wider rounded-lg"
                      >
                        Recommend Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {active360Tab === 'xp' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-gray-700">XP Transaction Logs</h4>
                <div className="space-y-2">
                  {active360Intern.xpTransactions?.map((t: any) => (
                    <div key={t.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between">
                      <div>
                        <p className="font-bold text-gray-850">{t.description}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-mono font-bold ${t.amount >= 0 ? 'text-emerald-650' : 'text-red-500'}`}>
                        {t.amount >= 0 ? `+${t.amount}` : t.amount} XP
                      </span>
                    </div>
                  ))}
                  {(!active360Intern.xpTransactions || active360Intern.xpTransactions.length === 0) && (
                    <div className="text-center py-6 text-gray-400">No XP transactions.</div>
                  )}
                </div>
              </div>
            )}

            {active360Tab === 'assignments' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-gray-700">Intern Submissions</h4>
                <div className="space-y-4">
                  {active360Intern.submissions?.map((s: any) => {
                    const latest = s.versions?.[0];
                    return (
                      <div key={s.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start border-b border-gray-200/60 pb-2">
                          <div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{s.assignment?.category || 'Daily Assignment'}</span>
                            <h5 className="text-xs font-black text-slate-800 mt-0.5">{s.assignment?.title || 'Untitled Assignment'}</h5>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            s.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            s.status === 'Needs Changes' ? 'bg-amber-50 text-amber-700' :
                            s.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                          }`}>{s.status}</span>
                        </div>

                        {/* Submission URLs / Files */}
                        {latest ? (
                          <div className="space-y-1.5 text-gray-650 bg-white p-3 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono pb-1 border-b border-gray-55 mb-1.5">
                              <span>LATEST VERSION (v{latest.versionNumber})</span>
                              <span>Submitted: {new Date(latest.createdAt).toLocaleString()}</span>
                            </div>
                            {latest.githubUrl && (
                              <p className="flex justify-between gap-4">
                                <strong className="text-gray-700">GitHub:</strong> 
                                <a href={latest.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate max-w-xs">{latest.githubUrl}</a>
                              </p>
                            )}
                            {latest.liveUrl && (
                              <p className="flex justify-between gap-4">
                                <strong className="text-gray-700">Live URL:</strong> 
                                <a href={latest.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate max-w-xs">{latest.liveUrl}</a>
                              </p>
                            )}
                            {latest.driveLink && (
                              <p className="flex justify-between gap-4">
                                <strong className="text-gray-700">Drive Link:</strong> 
                                <a href={latest.driveLink} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate max-w-xs">{latest.driveLink}</a>
                              </p>
                            )}
                            {latest.fileUrl && (
                              <p className="flex justify-between gap-4">
                                <strong className="text-gray-700">Uploaded File:</strong> 
                                <a href={latest.fileUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate max-w-xs">Download / View File</a>
                              </p>
                            )}
                            {latest.comments && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <strong className="text-gray-700 block text-[9px] uppercase tracking-wider text-gray-400">Intern Comments:</strong>
                                <p className="text-gray-600 bg-gray-50/50 p-2 rounded border border-gray-100 mt-1 block italic">{latest.comments}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-gray-400 italic">No files or links submitted for this version.</div>
                        )}

                        {/* All Version History if multiple versions exist */}
                        {s.versions && s.versions.length > 1 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Submission History</span>
                            <div className="space-y-1">
                              {s.versions.slice(1).map((v: any) => (
                                <div key={v.id} className="p-2 bg-white/40 border border-gray-100 rounded-lg text-[10px] text-gray-500 flex justify-between items-center">
                                  <span>Version {v.versionNumber} ({v.comments ? 'with comments' : 'no comments'})</span>
                                  <span className="font-mono text-[9px]">{new Date(v.createdAt).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feedbacks / Reviews */}
                        {s.feedbacks && s.feedbacks.length > 0 && (
                          <div className="space-y-2 border-t border-gray-100 pt-2.5">
                            <span className="text-[9px] font-black text-gray-450 uppercase tracking-widest block">Mentor Feedback</span>
                            {s.feedbacks.map((f: any) => (
                              <div key={f.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-mono text-[9px] text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                                  <span className="font-bold text-[#174F3A]">{f.rating}/5 ⭐</span>
                                </div>
                                <p className="text-gray-600 block">{f.publicFeedback}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!active360Intern.submissions || active360Intern.submissions.length === 0) && (
                    <div className="text-center py-10 text-gray-400">No submissions found for this intern.</div>
                  )}
                </div>
              </div>
            )}

            {active360Tab === 'badges' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-gray-700">Earned Badges</h4>
                <div className="grid grid-cols-2 gap-3">
                  {active360Intern.badges?.map((b: any) => (
                    <div key={b.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                      <span className="text-2xl">{b.icon || '🏆'}</span>
                      <div>
                        <p className="font-bold text-slate-800">{b.name}</p>
                        <p className="text-[9px] text-gray-400">{b.description}</p>
                      </div>
                    </div>
                  ))}
                  {(!active360Intern.badges || active360Intern.badges.length === 0) && (
                    <div className="col-span-2 text-center py-6 text-gray-400">No badges earned yet.</div>
                  )}
                </div>
              </div>
            )}

            {active360Tab === 'sessions' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Active & Historical Sessions (Login/Logout Logs)</h4>
                </div>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {/* Sessions (active / inactive login instances) */}
                  {active360Intern.user?.sessions?.map((session: any) => (
                    <div key={session.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-start hover:border-gray-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-[10px]">Session: {session.id.slice(-6).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            session.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {session.isValid ? 'Logged In / Active' : 'Logged Out / Expired'}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-1 font-mono">
                          IP: <strong className="text-gray-700">{session.ipAddress || 'Unknown'}</strong>
                        </p>
                        <p className="text-[9px] text-gray-500 font-mono truncate max-w-md" title={session.userAgent}>
                          UA: {session.userAgent || 'Unknown'}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                          Last Active: {new Date(session.lastActive || session.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono text-right shrink-0">
                        Started:<br />{new Date(session.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  {/* Security events like LOGIN_SUCCESS / LOGOUT */}
                  {active360Intern.user?.securityEvents?.map((event: any) => (
                    <div key={event.id} className="p-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          event.type.includes('SUCCESS') ? 'bg-emerald-50 text-emerald-700' :
                          event.type.includes('SUSPICIOUS') ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {event.type}
                        </span>
                        {event.description && <p className="text-[10px] text-gray-600 mt-1">{event.description}</p>}
                        <p className="text-[9px] text-gray-450 font-mono mt-1">IP: {event.ipAddress || 'Unknown'}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono">{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                  ))}

                  {((!active360Intern.user?.sessions || active360Intern.user.sessions.length === 0) &&
                    (!active360Intern.user?.securityEvents || active360Intern.user.securityEvents.length === 0)) && (
                      <div className="text-center py-8 text-gray-400 font-medium">No login, logout, or session history found for this intern.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* --- CREATE TASK MODAL --- */}
      {showAssignModal && (() => {
        const getMemberDomain = (m: any) => {
          const app = m.user?.internshipApplications?.[0];
          return app?.domain && app.domain.trim().length > 0 ? app.domain.trim() : 'Software Development';
        };

        const distinctDomains = Array.from(new Set(allMembers.map(m => getMemberDomain(m)))).filter(Boolean).sort();

        const selectedInternObjects = allMembers.filter(m => selectedMemberIds.includes(m.id));

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl w-full max-w-xl p-6 space-y-4 my-8">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" /> Create Cohort Assignment
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Bulk assignment & scheduled task creation for interns</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* 1. SELECTION MODES SEGMENTED CONTROL */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Recipient Selection Mode</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-center text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode('field');
                      const field = selectedField || distinctDomains[0] || '';
                      setSelectedField(field);
                      const matched = allMembers.filter(m => getMemberDomain(m).toLowerCase() === field.toLowerCase()).map(m => m.id);
                      setSelectedMemberIds(matched);
                    }}
                    className={cn(
                      'py-2 px-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider',
                      selectionMode === 'field'
                        ? 'bg-white text-[#174F3A] shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Mode A: By Field
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode('all');
                      setSelectedMemberIds(allMembers.map(m => m.id));
                    }}
                    className={cn(
                      'py-2 px-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider',
                      selectionMode === 'all'
                        ? 'bg-white text-[#174F3A] shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Mode B: Select All
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode('individual');
                    }}
                    className={cn(
                      'py-2 px-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider',
                      selectionMode === 'individual'
                        ? 'bg-white text-[#174F3A] shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Mode C: Individual
                  </button>
                </div>
              </div>

              {/* MODE SPECIFIC CONTROLS */}
              {selectionMode === 'field' && (
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-bold text-gray-700 uppercase text-[9px] tracking-wider">Select Intern Field / Track</label>
                  <select
                    value={selectedField || distinctDomains[0] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedField(val);
                      const matched = allMembers.filter(m => getMemberDomain(m).toLowerCase() === val.toLowerCase()).map(m => m.id);
                      setSelectedMemberIds(matched);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-white font-semibold text-xs text-slate-800"
                  >
                    {distinctDomains.map((dom) => {
                      const count = allMembers.filter(m => getMemberDomain(m).toLowerCase() === dom.toLowerCase()).length;
                      return (
                        <option key={dom} value={dom}>
                          {dom} ({count} intern{count !== 1 ? 's' : ''})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {selectionMode === 'all' && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div>
                    <span className="font-black text-xs text-[#174F3A] block">All Active Cohort Interns</span>
                    <span className="text-[10px] text-emerald-700">Assigning task to every active intern regardless of field</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds(allMembers.map(m => m.id))}
                    className="px-3 py-1.5 bg-[#174F3A] text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-[#0E2E1E] transition-all"
                  >
                    Select All ({allMembers.length})
                  </button>
                </div>
              )}

              {selectionMode === 'individual' && (
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                  <label className="block font-bold text-gray-700 uppercase text-[9px] tracking-wider mb-2">Check Individual Interns</label>
                  <div className="space-y-1.5">
                    {allMembers.map((m) => {
                      const isChecked = selectedMemberIds.includes(m.id);
                      const dom = getMemberDomain(m);
                      return (
                        <label key={m.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-150 cursor-pointer hover:bg-slate-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedMemberIds(prev =>
                                isChecked ? prev.filter(id => id !== m.id) : [...prev, m.id]
                              );
                            }}
                            className="rounded text-[#174F3A] focus:ring-[#174F3A] w-3.5 h-3.5"
                          />
                          <span className="font-semibold text-xs text-slate-800">{m.user?.name || 'Intern'}</span>
                          <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-auto">{dom}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CHIP LIST OF SELECTED INTERNS WITH COUNT */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-[9px] uppercase tracking-wider text-slate-700">
                    Selected Recipients ({selectedMemberIds.length})
                  </span>
                  {selectedMemberIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      className="text-[9px] font-bold text-red-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedMemberIds.length === 0 ? (
                  <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-semibold text-center">
                    ⚠️ No interns selected. Please select at least one intern above.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                    {selectedInternObjects.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shadow-2xs"
                      >
                        <span>{m.user?.name || 'Intern'}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedMemberIds(prev => prev.filter(id => id !== m.id))}
                          className="text-slate-400 hover:text-red-600 rounded p-0.5 transition-colors"
                          title="Remove from batch"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Assignment Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Database Indexing Optimization"
                    value={newAssignment.title}
                    onChange={e => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Description / Guidelines</label>
                    <button
                      type="button"
                      onClick={() => {
                        const todayEnd = new Date();
                        todayEnd.setHours(23, 59, 0, 0);
                        const localIso = new Date(todayEnd.getTime() - (todayEnd.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

                        setNewAssignment(prev => ({
                          ...prev,
                          title: 'Task 1 – Mandatory LinkedIn Introduction Post',
                          category: 'Mandatory Onboarding Task',
                          difficulty: 'Easy',
                          estimatedTime: '30 Mins',
                          xpReward: 200,
                          deadline: localIso,
                          description: `📌 Task 1 (For New Interns) – LinkedIn Introduction Post (Mandatory)

If you are new to the internship, your first task is to publish a LinkedIn post announcing your internship.

Include:
• That you've joined SARTHI as a Digital Marketing Intern.
• What you're excited to learn.
• A picture of your Internship Offer Letter (hide any sensitive information if required).
• Mention what you hope to contribute during your internship.

Tag:
@sarthiglobal (SARTHI LinkedIn page)

Hashtags:
#SARTHI #Internship #DigitalMarketing #Students #CareerGrowth #Learning

After posting, submit your direct LinkedIn post URL in your dashboard submission section.`
                        }));
                      }}
                      className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      ⚡ Preset: Task 1 LinkedIn Post
                    </button>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide instruction guidelines..."
                    value={newAssignment.description}
                    onChange={e => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Category</label>
                    <select
                      value={newAssignment.category}
                      onChange={e => setNewAssignment(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                    >
                      <option value="Daily Assignment">Daily Assignment</option>
                      <option value="Weekly Project">Weekly Project</option>
                      <option value="Induction Task">Induction Task</option>
                      <option value="Milestone Challenge">Milestone Challenge</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Difficulty</label>
                    <select
                      value={newAssignment.difficulty}
                      onChange={e => setNewAssignment(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">XP Reward</label>
                  <input
                    required
                    type="number"
                    value={newAssignment.xpReward}
                    onChange={e => setNewAssignment(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  />
                </div>

                {/* SCHEDULING TOGGLE */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-700 uppercase text-[9px] tracking-wider block">Schedule For Later</span>
                      <span className="text-[10px] text-slate-500">Hold release until a specific date/time (within next 7 days)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={e => setIsScheduled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#174F3A]"></div>
                    </label>
                  </div>

                  {isScheduled ? (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div className="space-y-1">
                        <label className="block font-bold text-emerald-800 uppercase text-[9px] tracking-wider">Release Date & Time</label>
                        <input
                          required
                          type="datetime-local"
                          value={releaseAt}
                          onChange={e => setReleaseAt(e.target.value)}
                          className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-xl focus:outline-none focus:border-[#174F3A] font-semibold text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-600 uppercase text-[9px] tracking-wider">Deadline Date & Time</label>
                        <input
                          required
                          type="datetime-local"
                          value={newAssignment.deadline}
                          onChange={e => setNewAssignment(prev => ({ ...prev, deadline: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#174F3A] font-semibold text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Deadline Date & Time</label>
                      <input
                        required
                        type="datetime-local"
                        value={newAssignment.deadline}
                        onChange={e => setNewAssignment(prev => ({ ...prev, deadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#174F3A] font-semibold text-xs"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAssignment || selectedMemberIds.length === 0}
                  className="w-full py-3.5 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingAssignment
                    ? 'Processing...'
                    : isScheduled
                    ? `Schedule Assignment for ${selectedMemberIds.length} Intern(s)`
                    : `Assign to ${selectedMemberIds.length} Intern(s) & Email`}
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* --- REVIEW SUBMISSION MODAL --- */}
      {activeReviewSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Review Task Submission
              </h3>
              <button onClick={() => setActiveReviewSub(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="text-xs space-y-3 border-b border-gray-100 pb-3 text-left">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <div>
                  <p className="font-black text-slate-800 text-xs">{activeReviewSub.member?.user?.name || 'Intern'}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{activeReviewSub.assignment?.title}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-black rounded-md">
                  V{activeReviewSub.versions?.[0]?.versionNumber || 1}
                </span>
              </div>

              {/* Latest Submission URLs & Notes */}
              {(() => {
                const latestVersion = activeReviewSub.versions?.[0] || {};
                const github = latestVersion.githubUrl || activeReviewSub.githubUrl;
                const live = latestVersion.liveUrl || activeReviewSub.liveUrl;
                const drive = latestVersion.driveLink || activeReviewSub.driveLink;
                const file = latestVersion.fileUrl || activeReviewSub.fileUrl;
                const comments = latestVersion.comments || activeReviewSub.comments;

                return (
                  <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Latest Submission Links:</span>
                    {github && (
                      <p><strong>GitHub URL:</strong> <a href={github} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{github}</a></p>
                    )}
                    {live && (
                      <p><strong>Live URL:</strong> <a href={live} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{live}</a></p>
                    )}
                    {drive && (
                      <p><strong>Drive Link:</strong> <a href={drive} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{drive}</a></p>
                    )}
                    {file && (
                      <p><strong>Uploaded File:</strong> <a href={file} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">Download File</a></p>
                    )}
                    {comments && (
                      <div className="mt-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Intern Comment:</span>
                        <p className="text-gray-700 bg-white p-2 rounded-lg border border-slate-200 mt-0.5 text-[11px] font-medium">{comments}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Version History & Prior Mentor Feedback */}
              {activeReviewSub.versions && activeReviewSub.versions.length > 1 && (
                <div className="space-y-1.5 bg-amber-50/40 p-3 rounded-xl border border-amber-200/60 max-h-36 overflow-y-auto">
                  <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider block">
                    📜 Previous Versions & Review History ({activeReviewSub.versions.length} versions)
                  </span>
                  <div className="space-y-2">
                    {activeReviewSub.versions.map((ver: any, idx: number) => (
                      <div key={ver.id || idx} className="bg-white p-2 rounded-lg border border-amber-100 text-[10px] space-y-1">
                        <div className="flex justify-between items-center font-bold text-slate-700">
                          <span>Version {ver.versionNumber}</span>
                          <span className="text-[9px] text-slate-400">{new Date(ver.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        {ver.comments && <p className="text-slate-500 italic">"{ver.comments}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleReviewSubmission} className="space-y-3.5 text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Status Outcome</label>
                  <select
                    value={reviewForm.status}
                    onChange={e => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  >
                    <option value="Approved">Approved ✅</option>
                    <option value="Needs Changes">Needs Changes ⚠️</option>
                    <option value="Rejected">Rejected ✕</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Rating Score (1-5)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  >
                    {[5, 4, 3, 2, 1].map(score => (
                      <option key={score} value={score}>{score} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Public Feedback (Visible to Intern)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Keep it descriptive and constructive..."
                  value={reviewForm.publicFeedback}
                  onChange={e => setReviewForm(prev => ({ ...prev, publicFeedback: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Private Notes (Internal Only)</label>
                <input
                  type="text"
                  placeholder="Evaluation reminders..."
                  value={reviewForm.privateNotes}
                  onChange={e => setReviewForm(prev => ({ ...prev, privateNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">XP Bonus (Optional)</label>
                  <input
                    type="number"
                    value={reviewForm.xpBonus}
                    onChange={e => setReviewForm(prev => ({ ...prev, xpBonus: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">XP Penalty (Optional)</label>
                  <input
                    type="number"
                    value={reviewForm.xpPenalty}
                    onChange={e => setReviewForm(prev => ({ ...prev, xpPenalty: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Evaluation Reason (Prisma Log)</label>
                <input
                  type="text"
                  placeholder="Approved submission check..."
                  value={reviewForm.reason}
                  onChange={e => setReviewForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
              >
                Submit Evaluation Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADJUST XP MODAL --- */}
      {showXpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Adjust Intern XP
              </h3>
              <button onClick={() => setShowXpModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdjustXp} className="space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Select Intern</label>
                <select
                  required
                  value={xpForm.memberId}
                  onChange={e => setXpForm(prev => ({ ...prev, memberId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                >
                  <option value="" disabled>Choose an intern...</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.user?.name} ({m.batch?.name})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">XP Amount (Positive or Negative)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 100 or -50"
                  value={xpForm.amount}
                  onChange={e => setXpForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Description/Reason</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Exceptional contribution in team live sync"
                  value={xpForm.description}
                  onChange={e => setXpForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
              >
                Apply XP Adjustments
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- AWARD BADGE MODAL --- */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" /> Award Cohort Achievement Badge
              </h3>
              <button onClick={() => setShowBadgeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAwardBadge} className="space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Select Intern</label>
                <select
                  required
                  value={badgeForm.memberId}
                  onChange={e => setBadgeForm(prev => ({ ...prev, memberId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                >
                  <option value="" disabled>Choose an intern...</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.user?.name} ({m.batch?.name})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Badge Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bug Squasher"
                    value={badgeForm.name}
                    onChange={e => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Icon Emoji</label>
                  <input
                    required
                    type="text"
                    value={badgeForm.icon}
                    onChange={e => setBadgeForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-center focus:border-[#174F3A] bg-slate-50 font-semibold text-lg"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Description/Critieria</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Fixed 5 critical staging bugs in one sprint"
                  value={badgeForm.description}
                  onChange={e => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#174F3A] bg-slate-50 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
              >
                Award Achievement Badge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADJUST INTERNSHIP ACCEPTANCE / APPLY FEE MODAL --- */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-2xl w-full max-w-lg p-6 space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Adjust Internship Acceptance Fee
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Regulate Razorpay apply/acceptance charge for student checkout in real-time
                </p>
              </div>
              <button onClick={() => setShowFeeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-6">
              {/* Active Status Badge */}
              <div className={cn(
                "p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition-all",
                feeAmountInr === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              )}>
                <Zap className={cn("w-5 h-5 shrink-0", feeAmountInr === 0 ? "text-emerald-600" : "text-blue-600")} />
                <div>
                  <div className="font-bold uppercase tracking-wider text-[10px]">
                    {feeAmountInr === 0 ? '⚡ FREE MODE ACTIVE' : `💳 RAZORPAY CHARGE ACTIVE: ₹${feeAmountInr}`}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {feeAmountInr === 0
                      ? 'Students will be auto-accepted without any Razorpay payment.'
                      : `Students will be charged ₹${feeAmountInr} INR at checkout on Razorpay.`}
                  </p>
                </div>
              </div>

              {/* Slider Bar */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                    Adjust Charge Bar (Free ₹0 to ₹5,000)
                  </label>
                  <span className="text-xl font-black text-emerald-800 font-outfit">
                    {feeAmountInr === 0 ? 'FREE (₹0)' : `₹${feeAmountInr}`}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={feeAmountInr}
                  onChange={(e) => setFeeAmountInr(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(feeAmountInr / 5000) * 100}%, #e2e8f0 ${(feeAmountInr / 5000) * 100}%, #e2e8f0 100%)`
                  }}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />

                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>₹0 (Free)</span>
                  <span>₹2,500</span>
                  <span>₹5,000 (Max)</span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-600 uppercase text-[9px] tracking-wider">Quick Presets</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1000, 2000, 3500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFeeAmountInr(preset)}
                      className={cn(
                        "py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer",
                        feeAmountInr === preset
                          ? "bg-[#174F3A] text-white border-[#174F3A] shadow-sm scale-105"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {preset === 0 ? 'FREE' : `₹${preset}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingFee}
                  className="px-5 py-2.5 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingFee ? 'Syncing...' : 'Save & Sync Real-Time Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PERMANENT SUSPENSION MODAL --- */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-rose-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-rose-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" /> Permanent Intern Suspension
              </h3>
              <button onClick={() => setShowSuspendModal(false)} className="p-1 hover:bg-rose-50 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSuspendSubmit} className="space-y-4 text-xs text-left">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <p className="text-[11px] font-bold text-rose-900">⚠️ Permanent Disqualification Notice</p>
                <p className="text-[10px] text-rose-700 leading-normal">
                  Suspending an intern revokes all dashboard access, forfeits certification, and dispatches an official branded suspension notice to their email address.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Select Intern to Suspend</label>
                <select
                  required
                  value={suspendForm.memberId}
                  onChange={e => setSuspendForm(prev => ({ ...prev, memberId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 bg-slate-50 font-semibold"
                >
                  <option value="" disabled>Choose an intern...</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.user?.name} ({m.batch?.name || 'Cohort'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[9px] tracking-wider">Reason for Permanent Suspension</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter reason for suspension..."
                  value={suspendForm.reason}
                  onChange={e => setSuspendForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 bg-slate-50 font-medium leading-relaxed"
                />
                <div className="flex gap-2 pt-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reason Pre-templates:</span>
                  <button
                    type="button"
                    onClick={() => setSuspendForm(prev => ({ ...prev, reason: 'Attendance requirement non-compliance and unexcused absence' }))}
                    className="text-[9px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg font-bold hover:bg-rose-100 transition-colors"
                  >
                    Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuspendForm(prev => ({ ...prev, reason: 'Incomplete project deliverables and missed cohort milestones' }))}
                    className="text-[9px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                  >
                    Deliverables
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
