'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  Printer,
  Download,
  Search,
  Sliders,
  UserCheck,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  CheckCircle2,
  FileText,
  Sparkles,
  Layers
} from 'lucide-react';

import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { downloadCertificateAsPdf, downloadCertificateAsPng } from '@/lib/client-certificate-export';
import InternshipCertificateTemplate from '@/components/certificate/InternshipCertificateTemplate';
import InternshipLORTemplate from '@/components/certificate/InternshipLORTemplate';

interface MentorCertificateStudioProps {
  initialInterns?: any[];
  initialApplications?: any[];
  user?: any;
}

export default function MentorCertificateStudioClient({
  initialInterns = [],
  initialApplications = [],
  user
}: MentorCertificateStudioProps) {
  // DOCUMENT MODE SWITCH: COMPLETION_LETTER (Default, Untouched) vs LETTER_OF_RECOMMENDATION (New)
  const [documentType, setDocumentType] = useState<'COMPLETION_LETTER' | 'LETTER_OF_RECOMMENDATION'>('COMPLETION_LETTER');

  // Studio View Tabs: Designer vs Issued Registry
  const [activeTab, setActiveTab] = useState<'designer' | 'registry'>('designer');

  // Search & Student Selection State
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // SECTION 1: RECIPIENT FIELDS (Shared)
  const [recipientName, setRecipientName] = useState('Ranjan Singh');
  const [recipientCollege, setRecipientCollege] = useState('IIT(ISM) Dhanbad');

  // SECTION 2: INTERNSHIP FIELDS (Shared)
  const [internshipTrack, setInternshipTrack] = useState('Web Development');
  const [referenceId, setReferenceId] = useState('TT-INT-2026-0001');
  const [startDate, setStartDate] = useState('15 May 2026');
  const [endDate, setEndDate] = useState('30 June 2026');
  const [issueDate, setIssueDate] = useState('20 August 2026');

  // COMPLETION CERTIFICATE PARAGRAPHS (Untouched, Original)
  const [customExposureBody, setCustomExposureBody] = useState(
    'During the internship, the intern was exposed to various activities in the Web Development domain, including HTML, CSS, React.js, Node.js, and Full-Stack Software Engineering skills.'
  );

  const [performanceBody, setPerformanceBody] = useState(
    'Throughout the internship, the intern demonstrated sincerity, discipline, and a willingness to learn and contribute to assigned responsibilities.'
  );

  const [closingStatement, setClosingStatement] = useState(
    "We appreciate the intern's efforts and contribution during the internship and wish the intern continued success in future academic and professional pursuits."
  );

  // LOR-SPECIFIC STRUCTURED PARAGRAPHS (Natural, Professional, Non-Repetitive)
  const [lorProjectSummary, setLorProjectSummary] = useState(
    'responsive web interfaces and backend services'
  );

  const [lorIntroParagraph, setLorIntroParagraph] = useState(
    'I am writing to provide a formal recommendation for **Ranjan Singh**, who completed an industry internship at **SARTHI** within our **Web Development** team from 15 May 2026 to 30 June 2026.'
  );

  const [lorPerformanceParagraph, setLorPerformanceParagraph] = useState(
    'During the tenure of this internship, Ranjan Singh exhibited a solid grasp of fundamental concepts, methodical thinking, and a proactive approach toward solving technical challenges. The intern adapted quickly to new tools and consistently approached learning with intellectual curiosity and dedication.'
  );

  const [lorContributionParagraph, setLorContributionParagraph] = useState(
    'On assigned project milestones, Ranjan Singh contributed effectively to development tasks in the Web Development domain, delivering well-structured work and adhering to team standards. The intern took ownership of assigned deliverables and demonstrated a steady commitment to quality execution.'
  );

  const [lorRecommendationStatement, setLorRecommendationStatement] = useState(
    'In addition to technical competence, Ranjan Singh displayed commendable professionalism, reliability, and collaborative teamwork throughout the engagement. The intern communicates clearly, receives constructive feedback with maturity, and works seamlessly with peers and mentors alike.'
  );

  const [lorClosingStatement, setLorClosingStatement] = useState(
    'Based on observed conduct and contributions, I recommend Ranjan Singh for future academic, professional, and career opportunities. I wish Ranjan Singh all the best in future endeavors.'
  );

  // LOR PRESET QUALITY TAGS
  const [selectedLorQualities, setSelectedLorQualities] = useState<string[]>([
    'Problem Solving',
    'Technical Competence',
    'Teamwork',
    'Quick Learner'
  ]);

  const availableQualities = [
    'Problem Solving',
    'Technical Competence',
    'Clear Communication',
    'Teamwork',
    'Leadership',
    'Quick Learner',
    'Professionalism',
    'Discipline',
    'Initiative',
    'Adaptability',
    'Reliability',
    'Creativity'
  ];

  // Helper to generate dynamic random LOR ID on candidate selection or regeneration
  const generateRandomLorId = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let b1 = '', b2 = '';
    for (let i = 0; i < 4; i++) b1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) b2 += chars.charAt(Math.floor(Math.random() * chars.length));
    return `TT-26-${b1}-${b2}`;
  };

  // Helper to get domain-specific certificate paragraphs based on track
  const getDefaultParagraphsForTrack = (track: string) => {
    const t = (track || '').toLowerCase();
    if (t.includes('video') || t.includes('reels') || t.includes('editing')) {
      return {
        exposure: 'During the internship, the intern was exposed to various activities in the Video Editing & Reels Production domain, including short-form vertical video editing, reel creation, motion graphics, audio synchronization, color grading, visual pacing, and high-impact storytelling for digital media.',
        performance: 'Throughout the internship, the intern demonstrated creativity, technical proficiency in video editing workflows, discipline, and a strong commitment to delivering engaging visual content within scheduled production timelines.',
        closing: "We appreciate the intern's creative efforts and dedication to quality content production during the internship and wish the intern continued success in all future academic and professional creative pursuits."
      };
    }
    if (t.includes('marketing') || t.includes('social media')) {
      return {
        exposure: 'During the internship, the intern was exposed to various activities in the Digital Marketing & Social Media domain, including content strategy, social media campaigns, audience analytics, engagement optimization, and digital brand positioning.',
        performance: 'Throughout the internship, the intern demonstrated analytical thinking, creative campaign execution, discipline, and a proactive approach toward assigned marketing initiatives.',
        closing: "We appreciate the intern's strategic contributions and marketing efforts during the internship and wish the intern continued success in future academic and professional pursuits."
      };
    }
    if (t.includes('graphic') || t.includes('design')) {
      return {
        exposure: 'During the internship, the intern was exposed to various activities in the Graphic Design domain, including visual branding, digital illustration, creative layout design, social media asset creation, and typography standards.',
        performance: 'Throughout the internship, the intern demonstrated strong aesthetic sensibility, attention to detail, discipline, and a commitment to high-quality visual deliverables.',
        closing: "We appreciate the intern's creative design contributions during the internship and wish the intern continued success in future academic and professional pursuits."
      };
    }
    if (t.includes('content') || t.includes('writing') || t.includes('creative')) {
      return {
        exposure: 'During the internship, the intern was exposed to various activities in the Content Creation & Writing domain, including research-driven drafting, storytelling, copywriting, editorial workflows, and audience-centric communication.',
        performance: 'Throughout the internship, the intern demonstrated intellectual curiosity, articulate expression, discipline, and a steady commitment to quality execution.',
        closing: "We appreciate the intern's editorial contributions and dedication during the internship and wish the intern continued success in future academic and professional pursuits."
      };
    }
    if (t.includes('software')) {
      return {
        exposure: 'During the internship, the intern was exposed to various activities in the Software Development domain, including algorithm design, backend architectures, system optimization, API engineering, and professional software practices.',
        performance: 'Throughout the internship, the intern demonstrated problem-solving acumen, methodical thinking, discipline, and a proactive approach toward software quality.',
        closing: "We appreciate the intern's engineering contributions during the internship and wish the intern continued success in future academic and professional pursuits."
      };
    }
    return {
      exposure: 'During the internship, the intern was exposed to various activities in the Web Development domain, including HTML, CSS, React.js, Node.js, and Full-Stack Software Engineering skills.',
      performance: 'Throughout the internship, the intern demonstrated sincerity, discipline, and a willingness to learn and contribute to assigned responsibilities.',
      closing: "We appreciate the intern's efforts and contribution during the internship and wish the intern continued success in future academic and professional pursuits."
    };
  };

  // SECTION 3: SIGNATORY (CEO ONLY - DR. MUKUL PANDEY)
  const [ceoName, setCeoName] = useState('Dr. Mukul Pandey');
  const [ceoDesignation, setCeoDesignation] = useState('CEO & Founder');

  // SECTION 4: VERIFICATION & QR CODE
  const [isQrEnabled, setIsQrEnabled] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [verificationUrl, setVerificationUrl] = useState<string>('');

  // CANVAS PREVIEW ZOOM
  const [zoomScale, setZoomScale] = useState<number>(0.65);
  const certRef = useRef<HTMLDivElement>(null);

  // ISSUED REGISTRY & PUBLISHING STATE
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [isIssuing, setIsIssuing] = useState(false);
  const [publishedModal, setPublishedModal] = useState<{
    referenceId: string;
    recipientName: string;
    url: string;
    docType: string;
  } | null>(null);
  const [publishStatusMessage, setPublishStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize dynamic name in exposure and closing text if default names are edited
  const handleNameChange = (newName: string) => {
    setRecipientName(newName);
    // Update LOR paragraphs with new recipient name
    setLorIntroParagraph(
      `I am writing to provide a formal recommendation for **${newName}**, who completed an industry internship at **SARTHI** within our **${internshipTrack}** team from ${startDate} to ${endDate}.`
    );
    setLorPerformanceParagraph(
      `During the tenure of this internship, ${newName} exhibited a solid grasp of fundamental concepts, methodical thinking, and a proactive approach toward solving technical challenges. The intern adapted quickly to new tools and consistently approached learning with intellectual curiosity and dedication.`
    );
    setLorContributionParagraph(
      `On assigned project milestones, ${newName} contributed effectively to development tasks in the ${internshipTrack} domain, delivering well-structured work and adhering to team standards. The intern took ownership of assigned deliverables and demonstrated a steady commitment to quality execution.`
    );
    setLorRecommendationStatement(
      `In addition to technical competence, ${newName} displayed commendable professionalism, reliability, and collaborative teamwork throughout the engagement. The intern communicates clearly, receives constructive feedback with maturity, and works seamlessly with peers and mentors alike.`
    );
    setLorClosingStatement(
      `Based on observed conduct and contributions, I recommend ${newName} for future academic, professional, and career opportunities. I wish ${newName} all the best in future endeavors.`
    );
  };

  const toggleQualityChip = (quality: string) => {
    setSelectedLorQualities(prev => {
      const next = prev.includes(quality) ? prev.filter(q => q !== quality) : [...prev, quality];
      const joined = next.join(', ');
      setLorPerformanceParagraph(
        `Throughout the internship tenure, ${recipientName} demonstrated exceptional strengths in ${joined || 'problem-solving and engineering execution'}. The intern consistently exhibited professionalism, fast learning agility, and reliable teamwork.`
      );
      return next;
    });
  };

  // Reference ID is the official Intern Reference ID (e.g. TT-INT-2026-0001)
  const activeReferenceId = referenceId;

  // Generate real online verification QR payload whenever Reference ID changes
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.sarthi-woad.vercel.app';
    const cleanId = activeReferenceId.trim().toUpperCase() || 'TT-INT-2026-0001';
    const fullUrl = `${origin}/verify/interns/${encodeURIComponent(cleanId)}`;
    setVerificationUrl(fullUrl);

    if (!isQrEnabled) {
      setQrCodeDataUrl('');
      return;
    }

    let isActive = true;
    QRCode.toDataURL(fullUrl, {
      width: 280,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then(url => {
        if (isActive) setQrCodeDataUrl(url);
      })
      .catch(err => console.error('QR Code generation error:', err));

    return () => {
      isActive = false;
    };
  }, [activeReferenceId, isQrEnabled, documentType]);

  // Combine database candidates & Authoritative 11 Active Intern Roster for search
  const combinedCandidates = React.useMemo(() => {
    const list: any[] = [];
    const seenEmails = new Set<string>();

    const authoritativeRosterList = [
      { id: 'TTI000001', name: 'Ranjan Singh', email: 'ranjansingh.w@gmail.com', college: 'Arka Jain University', track: 'Web Development', refNo: 'TT-INT-2026-0001', startDate: '17 August 2026', endDate: '17 September 2026', type: 'INTERN' },
      { id: 'TTI000026', name: 'Jaanvi Nair', email: 'nairjaanvi199@gmail.com', college: 'SIES College of Arts, Science and Commerce, Mumbai', track: 'Digital Marketing & Social Media', refNo: 'TT-INT-2026-0026', startDate: '27 July 2026', endDate: '27 August 2026', type: 'INTERN' },
      { id: 'TTI000038', name: 'Nandini Katiyar', email: 'nandinikatiyar5@gmail.com', college: 'PSIT College of Higher Education, Kanpur', track: 'Digital Marketing & Social Media', refNo: 'TT-INT-2026-0038', startDate: '27 July 2026', endDate: '27 August 2026', type: 'INTERN' },
      { id: 'TTI000051', name: 'Pranshu Kumar Singh', email: 'ps859521@gmail.com', college: 'Arka Jain University', track: 'Full Stack Web Development', refNo: 'TT-INT-2026-0051', startDate: '5 July 2026', endDate: '5 August 2026', type: 'INTERN' },
      { id: 'TTI000060', name: 'Surjo Banerjee', email: 'surjobanerjee207@gmail.com', college: 'Arka Jain University', track: 'Video Editing & Reels Production', refNo: 'TT-INT-2026-0060', startDate: '4 August 2026', endDate: '4 September 2026', type: 'INTERN' },
      { id: 'TTI000062', name: 'Keshav Kumar', email: 'kumarkeshav10320@gmail.com', college: 'Arka Jain University', track: 'Creative Writing', refNo: 'TT-INT-2026-0062', startDate: '5 July 2026', endDate: '5 August 2026', type: 'INTERN' },
      { id: 'TTI000066', name: 'Keshav Ruhela', email: 'keshavruhela25@gmail.com', college: 'IILM University, Greater Noida', track: 'Web Development', refNo: 'TT-INT-2026-0066', startDate: '17 August 2026', endDate: '17 September 2026', type: 'INTERN' },
      { id: 'TTI000083', name: 'Kumari Tejal', email: 'kumaritejal535@gmail.com', college: 'Arka Jain University', track: 'Graphic Design', refNo: 'TT-INT-2026-0083', startDate: '19 August 2026', endDate: '19 September 2026', type: 'INTERN' },
      { id: 'TTI000086', name: 'Aniket Dutta', email: 'aniketdutta615@gmail.com', college: 'Arka Jain University', track: 'Content Creation', refNo: 'TT-INT-2026-0086', startDate: '19 August 2026', endDate: '19 September 2026', type: 'INTERN' },
      { id: 'TTI000128', name: 'Nitin Sinha', email: 'nitinsinha062@gmail.com', college: 'Arka Jain University', track: 'Web Development', refNo: 'TT-INT-2026-0128', startDate: '5 August 2026', endDate: '5 September 2026', type: 'INTERN' },
      { id: 'TTI000150', name: 'Harsh Nayan', email: 'harshnayan018@gmail.com', college: 'Arka Jain University', track: 'Software Development', refNo: 'TT-INT-2026-0150', startDate: '19 August 2026', endDate: '19 September 2026', type: 'INTERN' },
      { id: 'TTI000051-2', name: 'Arpit Jha', email: 'arpitjha1647@gmail.com', college: 'IILM University, Greater Noida', track: 'Software Development', refNo: 'TT-INT-2026-0051', startDate: '31 July 2026', endDate: '31 August 2026', type: 'INTERN' },
      { id: 'TTI000005', name: 'Aditya Singh', email: 'adityasin473@gmail.com', college: 'IILM University, Greater Noida', track: 'Web Development', refNo: 'TT-INT-2026-000005', startDate: '31 July 2026', endDate: '31 August 2026', type: 'INTERN' },
      { id: 'TTI000014', name: 'Pushan Tanwani', email: 'tanwanipushan9@gmail.com', college: 'IILM University, Greater Noida', track: 'Web Development', refNo: 'TT-INT-2026-000014', startDate: '27 July 2026', endDate: '27 August 2026', type: 'INTERN' },
      { id: 'TTI000016', name: 'Heril Bhuptawat', email: 'herilbhuptawat@gmail.com', college: 'IILM University, Greater Noida', track: 'Web Development', refNo: 'TT-INT-2026-000016', startDate: '31 July 2026', endDate: '31 August 2026', type: 'INTERN' },
      { id: 'TTI000013', name: 'Ayush Jha', email: 'ayushjhaayush2006@gmail.com', college: 'Arka Jain University', track: 'Web Development', refNo: 'TT-INT-2026-000013', startDate: '31 July 2026', endDate: '31 August 2026', type: 'INTERN' }
    ];

    authoritativeRosterList.forEach(item => {
      seenEmails.add(item.email.toLowerCase());
      list.push(item);
    });

    initialInterns.forEach(intern => {
      const email = intern.user?.email || intern.email;
      if (email && !seenEmails.has(email.toLowerCase())) {
        seenEmails.add(email.toLowerCase());
        list.push({
          id: intern.id,
          name: intern.user?.name || intern.name || 'Intern',
          email: email,
          college: intern.user?.college || intern.college || 'IILM University',
          track: intern.user?.internshipTrack || 'Web Development',
          refNo: intern.permanentInternId ? `TT-INT-2026-${intern.permanentInternId.replace(/\D/g, '').padStart(4, '0')}` : 'TT-INT-2026-0001',
          type: 'INTERN'
        });
      }
    });

    initialApplications.forEach(app => {
      const email = app.email;
      if (email && !seenEmails.has(email.toLowerCase())) {
        seenEmails.add(email.toLowerCase());
        list.push({
          id: app.id,
          name: app.name || 'Applicant',
          email: email,
          college: app.college || 'IILM University',
          track: app.internshipTrack || 'Web Development',
          refNo: 'TT-INT-2026-0001',
          type: 'APPLICANT'
        });
      }
    });

    return list;
  }, [initialInterns, initialApplications]);

  const filteredCandidates = combinedCandidates.filter(c => {
    const q = searchStudentQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.college.toLowerCase().includes(q) ||
      c.refNo.toLowerCase().includes(q)
    );
  });

  const handleSelectCandidate = (candidate: any) => {
    setSelectedStudent(candidate);
    handleNameChange(candidate.name);
    const trackName = candidate.track || 'Web Development';
    setInternshipTrack(trackName);

    // Auto-fill domain-specific certificate paragraphs for the candidate's track
    const trackParas = getDefaultParagraphsForTrack(trackName);
    setCustomExposureBody(trackParas.exposure);
    setPerformanceBody(trackParas.performance);
    setClosingStatement(trackParas.closing);

    if (candidate.refNo) {
      setReferenceId(candidate.refNo);
      // Generate unpredictable, non-sequential randomized LOR reference ID (TT-26-XXXX-XXXX)
      setLorReferenceId(generateRandomLorId());
    }
    if (candidate.startDate) setStartDate(candidate.startDate);
    if (candidate.endDate) setEndDate(candidate.endDate);
    toast.success(`Loaded candidate details for ${candidate.name}`);
  };

  // Validation Before Issue
  const validateBeforeIssue = (): boolean => {
    if (!recipientName.trim()) {
      toast.error('Recipient Name is required.');
      return false;
    }
    if (!recipientCollege.trim()) {
      toast.error('College / University is required.');
      return false;
    }
    if (!startDate.trim() || !endDate.trim()) {
      toast.error('Start Date and End Date are required.');
      return false;
    }
    if (!internshipTrack.trim()) {
      toast.error('Internship Track is required.');
      return false;
    }
    if (documentType === 'COMPLETION_LETTER' && !referenceId.trim()) {
      toast.error('Certificate Reference ID is required.');
      return false;
    }
    if (documentType === 'LETTER_OF_RECOMMENDATION' && !lorReferenceId.trim()) {
      toast.error('LOR Reference ID is required.');
      return false;
    }
    if (!ceoName.trim()) {
      toast.error('CEO Signatory Name is required.');
      return false;
    }
    return true;
  };

  const handleExportPdf = async () => {
    if (!validateBeforeIssue()) return;
    if (!certRef.current) return;
    const docLabel = documentType === 'COMPLETION_LETTER' ? 'Certificate' : 'Recommendation_Letter';
    const activeRef = activeReferenceId;
    const tid = toast.loading(`Exporting High-Resolution A4 ${docLabel} PDF (300 DPI)...`);
    try {
      await downloadCertificateAsPdf(certRef.current, `${docLabel}_${activeRef}_${recipientName.replace(/\s+/g, '_')}`);
      toast.success(`Official ${docLabel} PDF exported successfully!`, { id: tid });
    } catch (err: any) {
      console.error(err);
      toast.error('Export failed: ' + (err?.message || err), { id: tid });
    }
  };

  const handleExportPng = async () => {
    if (!validateBeforeIssue()) return;
    if (!certRef.current) return;
    const docLabel = documentType === 'COMPLETION_LETTER' ? 'Certificate' : 'Recommendation_Letter';
    const activeRef = activeReferenceId;
    const tid = toast.loading(`Exporting A4 ${docLabel} PNG Image...`);
    try {
      await downloadCertificateAsPng(certRef.current, `${docLabel}_${activeRef}_${recipientName.replace(/\s+/g, '_')}`);
      toast.success(`${docLabel} PNG image exported!`, { id: tid });
    } catch (err: any) {
      console.error(err);
      toast.error('Export failed: ' + (err?.message || err), { id: tid });
    }
  };

  const handleIssueAndPublish = async () => {
    if (!validateBeforeIssue()) return;
    setIsIssuing(true);
    setPublishStatusMessage(null);
    const docLabel = documentType === 'COMPLETION_LETTER' ? 'Certificate' : 'Letter of Recommendation';
    const activeRef = activeReferenceId.trim().toUpperCase();
    const tid = toast.loading(`Publishing ${docLabel} & Registering Online Verification...`);
    try {
      const rawOuterHtml = certRef.current ? certRef.current.outerHTML : '';
      const htmlSnapshotData = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact;
    }
    .lor-heading-serif, .certificate-heading-serif { font-family: 'Playfair Display', serif; }
    img { max-width: 100% !important; height: auto !important; object-fit: contain !important; }
  </style>
</head>
<body class="bg-white text-[#0F172A] w-full h-full overflow-hidden flex flex-col justify-between">
  ${rawOuterHtml}
</body>
</html>`;

      const payload = {
        documentType,
        recipientName,
        recipientEmail: selectedStudent?.email || `${recipientName.toLowerCase().replace(/\s+/g, '')}@sarthi-woad.vercel.app`,
        college: recipientCollege,
        internshipTrack,
        certificateNumber: activeRef,
        issueDate,
        startDate,
        endDate,
        customExposureBody: documentType === 'COMPLETION_LETTER' ? customExposureBody : undefined,
        performanceBody: documentType === 'COMPLETION_LETTER' ? performanceBody : undefined,
        closingStatement: documentType === 'COMPLETION_LETTER' ? closingStatement : undefined,
        // LOR fields
        introParagraph: documentType === 'LETTER_OF_RECOMMENDATION' ? lorIntroParagraph : undefined,
        performanceParagraph: documentType === 'LETTER_OF_RECOMMENDATION' ? lorPerformanceParagraph : undefined,
        contributionParagraph: documentType === 'LETTER_OF_RECOMMENDATION' ? lorContributionParagraph : undefined,
        recommendationStatement: documentType === 'LETTER_OF_RECOMMENDATION' ? lorRecommendationStatement : undefined,
        lorClosingStatement: documentType === 'LETTER_OF_RECOMMENDATION' ? lorClosingStatement : undefined,
        format: 'A4_PORTRAIT_LETTER',
        htmlSnapshot: htmlSnapshotData
      };

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || `Failed to issue ${docLabel} (HTTP ${res.status})`);
      }

      const verifyPath = `/verify/interns/${encodeURIComponent(activeRef)}`;
      const fullVerifyUrl = `${window.location.origin}${verifyPath}`;

      const newRecord = {
        id: activeRef,
        docType: documentType,
        name: recipientName,
        email: selectedStudent?.email || 'N/A',
        college: recipientCollege,
        track: internshipTrack,
        issueDate,
        verificationUrl: verifyPath,
        status: 'VALID'
      };

      setIssuedCertificates(prev => [newRecord, ...prev]);
      toast.success(`${docLabel} ${activeRef} successfully published to Live Verification System!`, { id: tid });

      setPublishStatusMessage({
        type: 'success',
        text: `${docLabel} ${activeRef} issued & published live!`
      });

      setPublishedModal({
        referenceId: activeRef,
        recipientName,
        url: fullVerifyUrl,
        docType: documentType
      });
    } catch (e: any) {
      console.error(`Error publishing ${docLabel}:`, e);
      const errMsg = e.message || 'Server Error';
      toast.error(`Publishing Failed: ${errMsg}`, { id: tid });
      setPublishStatusMessage({
        type: 'error',
        text: `Publishing Failed: ${errMsg}`
      });
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 border border-slate-200 p-5 rounded-3xl shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#174F3A]/10 border border-[#174F3A]/20 text-[#174F3A] rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase font-outfit">
                CERTIFICATE STUDIO — A4 PORTRAIT
              </h1>
              <span className="px-2.5 py-0.5 bg-[#174F3A]/10 text-[#174F3A] text-[10px] font-black uppercase tracking-wider rounded-full border border-[#174F3A]/20">
                OFFICIAL PRODUCTION SPEC
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Official Verifiable Documents (210 × 297 mm A4 Canvas)
            </p>
          </div>
        </div>

        {/* TOP TAB, MODE SWITCH & EXPORT ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* MODE SWITCH PILL: COMPLETION LETTER vs LETTER OF RECOMMENDATION */}
          <div className="flex p-1 bg-slate-100/90 border border-slate-250 rounded-2xl shadow-inner">
            <button
              onClick={() => {
                setDocumentType('COMPLETION_LETTER');
                toast.success('Switched to Completion Letter Mode');
              }}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                documentType === 'COMPLETION_LETTER'
                  ? 'bg-[#174F3A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎓 Completion Letter
            </button>
            <button
              onClick={() => {
                setDocumentType('LETTER_OF_RECOMMENDATION');
                toast.success('Switched to Letter of Recommendation (LOR) Mode');
              }}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                documentType === 'LETTER_OF_RECOMMENDATION'
                  ? 'bg-[#1B365D] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📄 Recommendation Letter
            </button>
          </div>

          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-2xl">
            <button
              onClick={() => setActiveTab('designer')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'designer' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🎨 Designer
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'registry' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              📋 Issued ({issuedCertificates.length})
            </button>
          </div>

          <button
            onClick={handleExportPng}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-2xl border border-slate-250 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#174F3A]" /> PNG
          </button>
          <button
            onClick={handleExportPdf}
            className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer ${
              documentType === 'COMPLETION_LETTER' ? 'bg-[#174F3A] hover:bg-[#0E2E1E]' : 'bg-[#1B365D] hover:bg-[#0F172A]'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> PRINT / PDF
          </button>
        </div>
      </div>

      {activeTab === 'designer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: A4 PORTRAIT CANVAS PREVIEW */}
          <div className="lg:col-span-7 space-y-4">
            {/* CANVAS TOOLBAR */}
            <div className="flex items-center justify-between bg-white/80 border border-slate-200 px-5 py-3 rounded-2xl backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Document:</span>
                <span className={`px-3 py-1 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 border ${
                  documentType === 'COMPLETION_LETTER'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-[#1B365D] border-blue-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    documentType === 'COMPLETION_LETTER' ? 'bg-emerald-500' : 'bg-blue-600'
                  }`} />
                  {documentType === 'COMPLETION_LETTER' ? 'Completion Certificate (210 × 297 mm)' : 'Letter of Recommendation (210 × 297 mm)'}
                </span>
              </div>

              {/* ZOOM CONTROLS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomScale(z => Math.max(0.5, z - 0.1))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 border border-slate-200 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 px-2">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale(z => Math.min(1.3, z + 0.1))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 border border-slate-200 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A4 CANVAS CONTAINER */}
            <div className="w-full overflow-hidden p-4 md:p-6 bg-slate-100/70 border border-slate-250 rounded-3xl flex justify-center items-start shadow-inner">
              <div
                style={{
                  width: '880px',
                  minWidth: '880px',
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  marginBottom: `calc(-1250px * ${1 - zoomScale})`,
                  transition: 'transform 0.2s ease-out, margin-bottom 0.2s ease-out'
                }}
                className="shrink-0"
              >
                {/* CONDITIONAL DOCUMENT RENDERING: COMPLETION LETTER vs LOR */}
                {documentType === 'COMPLETION_LETTER' ? (
                  /* =========================================================
                     SPECIFICATION-COMPLIANT A4 PORTRAIT CANVAS (100% UNCHANGED)
                     ========================================================= */
                  <InternshipCertificateTemplate
                    innerRef={certRef}
                    recipientName={recipientName}
                    recipientCollege={recipientCollege}
                    internshipTrack={internshipTrack}
                    referenceId={referenceId}
                    startDate={startDate}
                    endDate={endDate}
                    issueDate={issueDate}
                    customExposureBody={customExposureBody}
                    performanceBody={performanceBody}
                    closingStatement={closingStatement}
                    ceoName={ceoName}
                    ceoDesignation={ceoDesignation}
                    qrCodeDataUrl={qrCodeDataUrl}
                    isQrEnabled={isQrEnabled}
                  />
                ) : (
                  /* =========================================================
                     NEW LETTER OF RECOMMENDATION A4 CANVAS (210 × 297 mm)
                     ========================================================= */
                  <InternshipLORTemplate
                    innerRef={certRef}
                    recipientName={recipientName}
                    recipientCollege={recipientCollege}
                    internshipTrack={internshipTrack}
                    referenceId={referenceId}
                    startDate={startDate}
                    endDate={endDate}
                    issueDate={issueDate}
                    projectSummary={lorProjectSummary}
                    introParagraph={lorIntroParagraph}
                    performanceParagraph={lorPerformanceParagraph}
                    contributionParagraph={lorContributionParagraph}
                    recommendationStatement={lorRecommendationStatement}
                    closingStatement={lorClosingStatement}
                    ceoName={ceoName}
                    ceoDesignation={ceoDesignation}
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SPECIFICATION SECTION CONTROLS */}
          <div className="lg:col-span-5 space-y-6 text-slate-800">
            {/* DATABASE CANDIDATE QUICK SELECTOR */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#174F3A]" /> SEARCH STUDENT (DATABASE)
                </h3>
                <span className="text-[9px] bg-emerald-150 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-300">
                  AUTO-POPULATE
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchStudentQuery}
                  onChange={e => setSearchStudentQuery(e.target.value)}
                  placeholder="Type student name, email, college, ref ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#174F3A] font-medium"
                />
              </div>

              {searchStudentQuery.trim() && (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCandidate(c)}
                        className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.email} • {c.college}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2 text-center">No candidates found for &quot;{searchStudentQuery}&quot;</p>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 1 — RECIPIENT */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3.5 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#174F3A]" /> SECTION 1 — RECIPIENT
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#174F3A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">College / University</label>
                  <input
                    type="text"
                    value={recipientCollege}
                    onChange={e => setRecipientCollege(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#174F3A]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 — INTERNSHIP & PARAGRAPHS */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3.5 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#174F3A]" /> SECTION 2 — INTERNSHIP & DATES
              </h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Internship Track</label>
                    <input
                      type="text"
                      value={internshipTrack}
                      onChange={e => setInternshipTrack(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Intern Reference ID (RID)
                    </label>
                    <input
                      type="text"
                      value={referenceId}
                      onChange={e => setReferenceId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-[#174F3A] focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Internship Duration Presets</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const d = new Date(startDate);
                            if (!isNaN(d.getTime())) {
                              d.setMonth(d.getMonth() + 1);
                              setEndDate(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
                              toast.success('Set 1 Month Duration');
                            } else {
                              setEndDate('30 June 2026');
                            }
                          } catch {
                            setEndDate('30 June 2026');
                          }
                        }}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#174F3A] text-[9px] font-bold rounded cursor-pointer"
                      >
                        1 Month
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const d = new Date(startDate);
                            if (!isNaN(d.getTime())) {
                              d.setMonth(d.getMonth() + 2);
                              setEndDate(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
                              toast.success('Set 2 Months Duration');
                            } else {
                              setEndDate('15 July 2026');
                            }
                          } catch {
                            setEndDate('15 July 2026');
                          }
                        }}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#174F3A] text-[9px] font-bold rounded cursor-pointer"
                      >
                        2 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const d = new Date(startDate);
                            if (!isNaN(d.getTime())) {
                              d.setMonth(d.getMonth() + 3);
                              setEndDate(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
                              toast.success('Set 3 Months Duration');
                            } else {
                              setEndDate('15 August 2026');
                            }
                          } catch {
                            setEndDate('15 August 2026');
                          }
                        }}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#174F3A] text-[9px] font-bold rounded cursor-pointer"
                      >
                        3 Months
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 font-semibold block mb-0.5 uppercase">Start Date</label>
                      <input
                        type="text"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#174F3A]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-semibold block mb-0.5 uppercase">End Date</label>
                      <input
                        type="text"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#174F3A]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-semibold block mb-0.5 uppercase">Issue Date</label>
                      <input
                        type="text"
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#174F3A]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3 — DOCUMENT SPECIFIC EDITORS */}
            {documentType === 'COMPLETION_LETTER' ? (
              /* COMPLETION CERTIFICATE PARAGRAPHS (Original System) */
              <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#174F3A]" /> SECTION 3 — CERTIFICATE PARAGRAPHS
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const trackParas = getDefaultParagraphsForTrack(internshipTrack);
                      setCustomExposureBody(trackParas.exposure);
                      setPerformanceBody(trackParas.performance);
                      setClosingStatement(trackParas.closing);
                      toast.success(`Loaded defaults for ${internshipTrack}`);
                    }}
                    className="text-[10px] font-bold text-[#174F3A] bg-[#174F3A]/10 hover:bg-[#174F3A]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto-Fill Track Defaults
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Custom Exposure Paragraph</label>
                    <textarea
                      rows={3}
                      value={customExposureBody}
                      onChange={e => setCustomExposureBody(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed text-xs focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Performance / Sincerity Paragraph</label>
                    <textarea
                      rows={2}
                      value={performanceBody}
                      onChange={e => setPerformanceBody(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed text-xs focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Closing Statement</label>
                    <textarea
                      rows={2}
                      value={closingStatement}
                      onChange={e => setClosingStatement(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed text-xs focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* SIMPLIFIED LOR SECTION 3 — 4-PARAGRAPH GENERATION WITH 2 SIMPLE TEXTAREAS */
              <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" /> SECTION 3 — RECOMMENDATION
                  </h3>
                  <span className="text-[9px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase border border-blue-200">
                    CONCISE LOR (~150-180 WORDS)
                  </span>
                </div>

                {/* Professional Qualities Chips */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                    Professional Qualities (Select to auto-inject):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableQualities.map(quality => {
                      const isSelected = selectedLorQualities.includes(quality);
                      return (
                        <button
                          key={quality}
                          type="button"
                          onClick={() => toggleQualityChip(quality)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#1B365D] text-white border-[#1B365D] shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {quality}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1. Main Recommendation & Performance Textarea */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Performance & Professional Qualities
                  </label>
                  <textarea
                    rows={3}
                    value={lorPerformanceParagraph}
                    onChange={e => setLorPerformanceParagraph(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed text-xs focus:outline-none focus:border-[#1B365D]"
                    placeholder="Describe the intern's strengths, attitude, and learning agility..."
                  />
                </div>

                {/* 2. Optional Project / Work Contribution Textarea */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Project / Work Contributions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={lorContributionParagraph}
                    onChange={e => setLorContributionParagraph(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed text-xs focus:outline-none focus:border-[#1B365D]"
                    placeholder="Describe specific tasks, contributions, or project achievements..."
                  />
                </div>

                {/* 3. Recommendation Statement Textarea */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Recommendation & Closing Statement
                  </label>
                  <textarea
                    rows={2}
                    value={lorRecommendationStatement}
                    onChange={e => setLorRecommendationStatement(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed text-xs focus:outline-none focus:border-[#1B365D]"
                  />
                </div>
              </div>
            )}

            {/* SECTION 4 — SIGNATORY */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3.5 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#174F3A]" /> SECTION 4 — SIGNATORY (REAL CEO SIGNATURE)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CEO / Director Name</label>
                    <input
                      type="text"
                      value={ceoName}
                      onChange={e => setCeoName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Designation</label>
                    <input
                      type="text"
                      value={ceoDesignation}
                      onChange={e => setCeoDesignation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#174F3A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5 — VERIFICATION & PUBLISHING */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#174F3A]" /> SECTION 5 — VERIFICATION & PUBLISHING
              </h3>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">Enable Online QR Verification</p>
                  <p className="text-[10px] text-slate-500">Generates scannable QR Code for online verification</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrEnabled(!isQrEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    isQrEnabled ? 'bg-[#174F3A]' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isQrEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <button
                onClick={handleIssueAndPublish}
                disabled={isIssuing}
                className={`w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${
                  documentType === 'COMPLETION_LETTER'
                    ? 'bg-[#174F3A] hover:bg-[#0E2E1E]'
                    : 'bg-[#1B365D] hover:bg-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {isIssuing
                  ? 'Publishing Document & Registering Live...'
                  : documentType === 'COMPLETION_LETTER'
                  ? 'ISSUE & PUBLISH LIVE VERIFIABLE CERTIFICATE'
                  : 'ISSUE & PUBLISH LIVE LETTER OF RECOMMENDATION'}
              </button>

              {/* INLINE STATUS BANNER FEEDBACK */}
              {publishStatusMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 border ${
                    publishStatusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{publishStatusMessage.text}</span>
                  </div>
                  {publishedModal && (
                    <a
                      href={publishedModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#174F3A] text-white text-[11px] font-bold rounded-xl shrink-0 hover:bg-[#0E2E1E] transition-colors"
                    >
                      View Live ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ISSUED CERTIFICATES & LOR REGISTRY VIEW */
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight font-outfit">
                ISSUED DOCUMENTS REGISTRY
              </h2>
              <p className="text-xs text-slate-500 font-medium">View and verify all official A4 certificates and Letters of Recommendation.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              Total Issued: {issuedCertificates.length}
            </span>
          </div>

          {issuedCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issuedCertificates.map((cert, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 hover:border-emerald-400 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                          cert.docType === 'LETTER_OF_RECOMMENDATION'
                            ? 'bg-blue-100 text-[#1B365D] border border-blue-200'
                            : 'bg-emerald-100 text-[#174F3A] border border-emerald-200'
                        }`}>
                          {cert.docType === 'LETTER_OF_RECOMMENDATION' ? 'LOR' : 'Certificate'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{cert.name}</h4>
                      <p className="text-xs text-slate-500">{cert.email}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#174F3A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cert.id}
                    </span>
                  </div>

                  <div className="text-xs text-slate-[#475569] space-y-1">
                    <p>College: <strong className="text-slate-900">{cert.college}</strong></p>
                    <p>Track: <strong className="text-emerald-800">{cert.track}</strong></p>
                    <p>Issue Date: <span className="text-slate-500">{cert.issueDate}</span></p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#174F3A] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Verify Online <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Award className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
              <p className="text-sm text-slate-500 font-medium">No documents issued in this session yet.</p>
              <button
                onClick={() => setActiveTab('designer')}
                className="px-4 py-2 bg-[#174F3A] text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Go to Studio Designer
              </button>
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED SUCCESS MODAL POPUP */}
      {publishedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm border ${
              publishedModal.docType === 'LETTER_OF_RECOMMENDATION'
                ? 'bg-blue-100 border-blue-200 text-blue-700'
                : 'bg-emerald-100 border-emerald-200 text-emerald-600'
            }`}>
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight uppercase font-outfit">
                {publishedModal.docType === 'LETTER_OF_RECOMMENDATION' ? 'Recommendation Letter Published!' : 'Certificate Published!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official credential <span className="font-mono font-bold text-[#174F3A]">{publishedModal.referenceId}</span> has been issued to <strong className="text-slate-800">{publishedModal.recipientName}</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Live Verification URL</span>
              <p className="text-xs font-mono font-semibold text-[#174F3A] truncate select-all">{publishedModal.url}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publishedModal.url);
                  toast.success('Verification URL copied to clipboard!');
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
              >
                📋 Copy Link
              </button>
              <a
                href={publishedModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-[#174F3A] hover:bg-[#0E2E1E] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View Live ↗
              </a>
            </div>

            <button
              onClick={() => setPublishedModal(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider pt-1 block mx-auto cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
