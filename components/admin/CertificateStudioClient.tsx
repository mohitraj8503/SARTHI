'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Printer,
  Download,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Search,
  Sliders,
  Palette,
  UserCheck,
  BookOpen,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Grid,
  FileCode,
  Sparkles,
  Upload,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { downloadCertificateAsPdf, downloadCertificateAsPng } from '@/lib/client-certificate-export';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CertificateTemplate from '@/components/certificate/CertificateTemplate';
import { useToast } from '@/components/ToastProvider';

type TemplateStyle = 'modern' | 'classic' | 'minimal' | 'professional';

function safeSetLocalStorage(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    console.warn(`[LOCAL_STORAGE_QUOTA] Could not save ${key} due to quota limits`, e);
    try {
      if (Array.isArray(value)) {
        const sanitized = value.slice(0, 15).map(item => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (copy.bgImage && typeof copy.bgImage === 'string' && copy.bgImage.startsWith('data:')) {
              copy.bgImage = '';
            }
            return copy;
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(sanitized));
      }
    } catch (fallbackErr) {
      console.warn(`[LOCAL_STORAGE_QUOTA] Clearing storage key ${key} to prevent browser quota error`, fallbackErr);
      try {
        localStorage.removeItem(key);
      } catch (clearErr) {}
    }
  }
}

export default function CertificateStudioClient() {
  const { addToast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Mode: Designer vs Registry
  const [activeTab, setActiveTab] = useState<'designer' | 'registry'>('designer');

  // Template Format Selection
  const [templateStyle, setTemplateStyle] = useState<string>('ai43');

  // Cloned Custom Templates State (initialized lazily from LocalStorage)
  const [customTemplates, setCustomTemplates] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tt_custom_certificate_templates');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.slice(0, 15).map((item) => {
              if (item && item.bgImage && typeof item.bgImage === 'string' && item.bgImage.startsWith('data:')) {
                return { ...item, bgImage: '' };
              }
              return item;
            });
          }
        }
      } catch (e) {
        console.error('Failed reading custom certificate templates from storage:', e);
        try { localStorage.removeItem('tt_custom_certificate_templates'); } catch (err) {}
      }
    }
    return [];
  });
  const [activeBgImage, setActiveBgImage] = useState<string>('#ffffff'); // default white background for cloned
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newBgOption, setNewBgOption] = useState<'white' | 'upload' | 'url'>('white');
  const [newCustomBgUrl, setNewCustomBgUrl] = useState('');
  const [assignedCourseId, setAssignedCourseId] = useState('ALL');
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  const [targetType, setTargetType] = useState<'all' | 'course' | 'certification'>('all');
  const [assignedId, setAssignedId] = useState<string>('ALL');
  const [registryFilter, setRegistryFilter] = useState<'all' | 'courses' | 'exams'>('all');
  const [enrollmentId, setEnrollmentId] = useState('ENR-2026-' + Math.floor(100000 + Math.random() * 900000));
  const [loadingClone, setLoadingClone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ message: 'Please select a valid image file', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewCustomBgUrl(dataUrl);
      addToast({ message: `Loaded image "${file.name}" from device`, type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  // Raw HTML File State
  const [rawHtmlTemplate, setRawHtmlTemplate] = useState<string>('');
  const [rawExcelHtmlTemplate, setRawExcelHtmlTemplate] = useState<string>('');
  const [rawPythonHtmlTemplate, setRawPythonHtmlTemplate] = useState<string>('');

  // Customization Form State - Full Text Editable Controls
  const [studentName, setStudentName] = useState('John Doe');
  const [courseName, setCourseName] = useState('Artificial Intelligence');
  const [specialization, setSpecialization] = useState('Prompt Engineering');
  const [completionDate, setCompletionDate] = useState(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  });
  const [credentialId, setCredentialId] = useState('TT-PE-2026-08503');
  const [verificationUrl, setVerificationUrl] = useState('https://sarthi-woad.vercel.app/verify/');
  const [directorName, setDirectorName] = useState('Dr. Mukul Pandey');
  const [directorTitle, setDirectorTitle] = useState('CEO & FOUNDER');
  const [brandName, setBrandName] = useState('SARTHI');
  const [tagline, setTagline] = useState('INNOVATE TODAY');

  // Extended Full Certificate Text Fields
  const [mainTitle, setMainTitle] = useState('AI CERTIFICATE');
  const [subTitle, setSubTitle] = useState('OF COMPLETION');
  const [certifiesText, setCertifiesText] = useState('THIS CERTIFIES THAT');
  const [descriptionText, setDescriptionText] = useState(
    'has successfully completed a comprehensive program in Artificial Intelligence, covering core and advanced modules in machine learning, data analysis, neural networks, and real-world AI applications.'
  );

  // Canvas Controls State
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);

  // Registry / Existing Certificates State
  const [existingCerts, setExistingCerts] = useState<any[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Student Search & Selection State
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Debounced Student Search Effect
  useEffect(() => {
    if (!studentSearchQuery.trim() || studentSearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearchingStudents(true);
      fetch(`/api/students/search?q=${encodeURIComponent(studentSearchQuery.trim())}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            setSearchResults(json.data);
          } else {
            setSearchResults([]);
          }
        })
        .catch((err) => {
          console.error('Student search error:', err);
          setSearchResults([]);
        })
        .finally(() => setSearchingStudents(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery]);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setStudentName(student.name || 'Student');
    setEnrollmentId(student.enrollmentId || student.id);
    setSearchResults([]);
    setStudentSearchQuery('');
    // Auto-set date of issue to TODAY when selecting a student
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    setCompletionDate(`${dd}.${mm}.${yyyy}`);
    addToast({ message: `Selected student: ${student.name} (${student.enrollmentId})`, type: 'success' });
  };

  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    setStudentName('John Doe');
    setEnrollmentId('ENR-2026-' + Math.floor(100000 + Math.random() * 900000));
    setStudentSearchQuery('');
    setSearchResults([]);
    addToast({ message: 'Student selection cleared', type: 'info' });
  };

  // Helper to derive 2-letter course/specialization prefix code
  const getCourseCode = (spec: string, course: string) => {
    const target = (spec || course || '').trim().toUpperCase();
    if (!target) return 'PE';
    if (target.includes('EXCEL')) return 'EX';
    if (target.includes('PROMPT ENG')) return 'PE';
    if (target.includes('PYTHON')) return 'PM';
    if (target.includes('ARTIFICIAL') || target === 'AI') return 'AI';
    if (target.includes('DATA SCIENCE')) return 'DS';
    if (target.includes('WEB DEV') || target.includes('FULL STACK')) return 'WD';
    if (target.includes('MACHINE LEARNING')) return 'ML';

    const words = target.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return target.slice(0, 2).toUpperCase();
  };

  // Fetch Courses, Certifications & Custom Templates on mount
  useEffect(() => {
    try {
      const localSaved = localStorage.getItem('tt_custom_certificate_templates');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomTemplates(parsed);
        }
      }
    } catch (err) {
      console.error(err);
    }

    fetch('/api/admin/courses')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCoursesList(json.data);
      })
      .catch((err) => console.error('Failed fetching courses:', err));

    fetch('/api/admin/certifications')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const list = Array.isArray(json.data) ? json.data : json.data.certifications || json.data.items || [];
          setCertificationsList(list);
        }
      })
      .catch((err) => console.error('Failed fetching certifications:', err));

    fetch('/api/admin/certificate-templates')
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          const apiCustoms = json.data.filter((t: any) => !t.isSystem);
          if (apiCustoms.length > 0) {
            setCustomTemplates((prev) => {
              const combined = [...apiCustoms, ...prev];
              const uniqueMap = new Map();
              combined.forEach((item) => uniqueMap.set(item.id, item));
              const result = Array.from(uniqueMap.values());
              safeSetLocalStorage('tt_custom_certificate_templates', result);
              return result;
            });
          }
        }
      })
      .catch((err) => console.error('Failed fetching custom templates:', err));
  }, []);

  // Fetch next sequential Certificate ID from API whenever courseName changes
  useEffect(() => {
    if (!courseName || courseName === 'Artificial Intelligence') return;
    const fetchNextId = async () => {
      try {
        const res = await fetch(`/api/admin/certificates/next-id?courseName=${encodeURIComponent(courseName)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.credentialId) {
            setCredentialId(json.data.credentialId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch next certificate ID:', err);
      }
    };
    fetchNextId();
  }, [courseName]);

  // Fetch Raw HTML Files directly on mount
  useEffect(() => {
    fetch('/certificate_4_3.html')
      .then((res) => res.text())
      .then((html) => setRawHtmlTemplate(html))
      .catch((err) => console.error('Error fetching certificate_4_3.html:', err));

    fetch('/excel_4_3.html')
      .then((res) => res.text())
      .then((html) => setRawExcelHtmlTemplate(html))
      .catch((err) => console.error('Error fetching excel_4_3.html:', err));

    fetch('/python_4_3.html')
      .then((res) => res.text())
      .then((html) => setRawPythonHtmlTemplate(html))
      .catch((err) => console.error('Error fetching python_4_3.html:', err));
  }, []);

  // Compute processed HTML string directly from HTML file
  const getProcessedHtml = () => {
    let baseTemplate = rawHtmlTemplate;
    if (templateStyle === 'excel43') baseTemplate = rawExcelHtmlTemplate;
    if (templateStyle === 'python43') baseTemplate = rawPythonHtmlTemplate;
    if (!baseTemplate) return '';

    // Dynamically update background for custom cloned templates
    let processed = baseTemplate;
    const isCustom = templateStyle.startsWith('tmpl_custom_');
    if (isCustom || activeBgImage) {
      let bgStyle = activeBgImage;
      if (templateStyle === 'ai43') bgStyle = '/certificate-bg.png';
      if (templateStyle === 'excel43') bgStyle = '/excel-bg.jpg';
      if (templateStyle === 'python43') bgStyle = '/python-bg.jpg';

      if (bgStyle && (bgStyle.startsWith('#') || bgStyle.startsWith('rgb') || bgStyle === 'white')) {
        processed = processed
          .replace(/background-image:\s*url\('[^']+'\);/gi, `background: ${bgStyle}; background-image: none;`)
          .replace(/background-image:\s*url\('[^']+'\)\s*!important;/gi, `background: ${bgStyle} !important; background-image: none !important;`);
      } else if (bgStyle && bgStyle !== 'none') {
        processed = processed
          .replace(/background-image:\s*url\('[^']+'\);/gi, `background-image: url('${bgStyle}'); background-size: cover;`)
          .replace(/background-image:\s*url\('[^']+'\)\s*!important;/gi, `background-image: url('${bgStyle}') !important; background-size: cover !important;`);
      }
    }

    return processed
      .replace(/<div class="brand-name">.*?<\/div>/gi, `<div class="brand-name">${brandName}</div>`)
      .replace(/<div class="tagline">.*?<\/div>/gi, `<div class="tagline">${tagline}</div>`)
      .replace(/<div class="main-title">.*?<\/div>/gi, `<div class="main-title">${mainTitle}</div>`)
      .replace(/<div class="subtitle">.*?<\/div>/gi, `<div class="subtitle">${subTitle}</div>`)
      .replace(/<div class="certifies-text">.*?<\/div>/gi, `<div class="certifies-text">${certifiesText}</div>`)
      .replace(/<div class="recipient-name">.*?<\/div>/gi, `<div class="recipient-name">${studentName}</div>`)
      .replace(/<div class="description">[\s\S]*?<\/div>/gi, `<div class="description">${descriptionText}</div>`)
      .replace(/<div class="specialization-section">[\s\S]*?<\/div>/gi, `<div class="specialization-section"><strong>Specialization:</strong> ${specialization}</div>`)
      .replace(/<div class="footer-value-above">\d{2}\.\d{2}\.\d{4}<\/div>/gi, `<div class="footer-value-above">${completionDate}</div>`)
      .replace(/<div class="footer-value-above">TT-[A-Z0-9-]+<\/div>/gi, `<div class="footer-value-above">${credentialId}</div>`)
      .replace(/<div class="footer-primary-text">.*?<\/div>/gi, `<div class="footer-primary-text">${directorName}</div>`)
      .replace(/<div class="footer-sub-label">CEO &amp; FOUNDER<\/div>/gi, `<div class="footer-sub-label">${directorTitle}</div>`)
      .replace(/<div class="footer-sub-label">CEO & FOUNDER<\/div>/gi, `<div class="footer-sub-label">${directorTitle}</div>`);
  };

  // Fetch next sequential Certificate ID from API (button click)
  const generateNewId = async () => {
    try {
      const res = await fetch(`/api/admin/certificates/next-id?courseName=${encodeURIComponent(courseName)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.credentialId) {
          setCredentialId(json.data.credentialId);
          addToast({ message: `Next available ID: ${json.data.credentialId}`, type: 'info' });
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch next certificate ID:', err);
    }
    // Fallback if API fails
    const code = getCourseCode(specialization, courseName);
    const year = new Date().getFullYear();
    const fallback = `TT-${code}-${year}-0001`;
    setCredentialId(fallback);
    addToast({ message: `Using fallback ID: ${fallback}`, type: 'info' });
  };

  // Fetch Existing Certificates from Registry with fallback presets
  useEffect(() => {
    const fetchRegistry = async () => {
      setLoadingRegistry(true);
      try {
        const res = await fetch(`/api/admin/certificates?pageSize=30&search=${searchQuery}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setExistingCerts(json.data);
            setLoadingRegistry(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load certificates registry', err);
      }

      // Fallback sample certificates list
      const defaultSamples = [
        {
          id: 'cert_sample_1',
          certificateNumber: 'TT-PE-2026-08503',
          certificateId: 'TT-PE-2026-08503',
          issuedAt: '2025-06-13T10:00:00.000Z',
          status: 'VALID',
          tier: 'PRO',
          user: { name: 'Rohit Kumar', email: 'rohit@sarthi-woad.vercel.app' },
          course: { title: 'Artificial Intelligence' }
        },
        {
          id: 'cert_sample_2',
          certificateNumber: 'TT-EX-2026-09142',
          certificateId: 'TT-EX-2026-09142',
          issuedAt: '2025-07-20T14:30:00.000Z',
          status: 'VALID',
          tier: 'PREMIUM',
          user: { name: 'Priya Sharma', email: 'priya@example.com' },
          course: { title: 'Advance Excel & Data Analytics' }
        },
        {
          id: 'cert_sample_3',
          certificateNumber: 'TT-PM-2026-04819',
          certificateId: 'TT-PM-2026-04819',
          issuedAt: '2025-05-10T09:15:00.000Z',
          status: 'VALID',
          tier: 'PRO',
          user: { name: 'Amit Patel', email: 'amit@example.com' },
          course: { title: 'Python Masterclass & Automation' }
        },
        {
          id: 'cert_sample_4',
          certificateNumber: 'TT-AI-2026-07731',
          certificateId: 'TT-AI-2026-07731',
          issuedAt: '2025-04-18T16:45:00.000Z',
          status: 'VALID',
          tier: 'PRO',
          user: { name: 'Neha Gupta', email: 'neha@example.com' },
          course: { title: 'Generative AI & LLM Engineering' }
        },
        {
          id: 'cert_sample_5',
          certificateNumber: 'TT-DS-2026-03318',
          certificateId: 'TT-DS-2026-03318',
          issuedAt: '2025-03-25T11:20:00.000Z',
          status: 'VALID',
          tier: 'PREMIUM',
          user: { name: 'Vikram Singh', email: 'vikram@example.com' },
          course: { title: 'Data Science & Machine Learning' }
        }
      ];
      setExistingCerts(defaultSamples);
      setLoadingRegistry(false);
    };

    if (activeTab === 'registry') {
      fetchRegistry();
    }
  }, [activeTab, searchQuery]);

  // Copy Verification Link
  const handleCopyLink = () => {
    const fullUrl = `${verificationUrl}${credentialId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    addToast({ message: 'Verification URL copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Print Certificate directly from iframe with forced landscape and exact 1:1 pixel colors
  const handlePrint = () => {
    downloadCertificateAsPdf(getProcessedHtml());
  };

  // Export high-resolution PNG certificate (Exact 1:1 pixel rendering with sharp background)
  const handleDownloadPng = async () => {
    try {
      addToast({ message: 'Generating high-resolution PNG image...', type: 'info' });
      const filename = `certificate-${studentName.replaceAll(' ', '_')}-${credentialId}.png`;
      await downloadCertificateAsPng(getProcessedHtml(), filename);
      addToast({ message: 'PNG Certificate downloaded successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to export PNG', err);
      addToast({ message: 'Failed to generate PNG image', type: 'error' });
    }
  };

  // Load Certificate from Registry into Designer
  const loadCertIntoDesigner = (cert: any) => {
    setStudentName(cert.user?.name || 'Student');
    setCourseName(cert.course?.title || 'Artificial Intelligence');
    setCredentialId(cert.certificateNumber || cert.certificateId || 'TT-PT-2026-08503');
    if (cert.issuedAt) {
      setCompletionDate(new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    }
    setActiveTab('designer');
    addToast({ message: `Loaded certificate for ${cert.user?.name} into Designer`, type: 'success' });
  };
  // Save Cloned Template
  const handleSaveCloneTemplate = async () => {
    if (!newTemplateName.trim()) {
      addToast({ message: 'Please enter a template name', type: 'error' });
      return;
    }

    setLoadingClone(true);
    const bgImage = newBgOption === 'white' ? '#ffffff' : (newCustomBgUrl || '#ffffff');

    try {
      let assignedTitle = '';
      if (targetType === 'course') {
        const c = coursesList.find((x) => x.id === assignedId);
        if (c) assignedTitle = c.title;
      } else if (targetType === 'certification') {
        const cert = certificationsList.find((x) => x.id === assignedId);
        if (cert) assignedTitle = cert.title;
      }

      const res = await fetch('/api/admin/certificate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName.trim(),
          bgImage,
          targetType,
          assignedId,
          assignedTitle,
          courseId: targetType === 'course' ? assignedId : 'ALL',
          certificationId: targetType === 'certification' ? assignedId : 'ALL',
          baseTemplateId: 'ai43'
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setCustomTemplates((prev) => {
          const updated = [json.data, ...prev];
          safeSetLocalStorage('tt_custom_certificate_templates', updated);
          return updated;
        });
        setTemplateStyle(json.data.id);
        setActiveBgImage(bgImage);

        if (assignedTitle) {
          setCourseName(assignedTitle);
        }

        setIsCloneModalOpen(false);
        setNewTemplateName('');
        setNewCustomBgUrl('');
        addToast({ message: `Cloned template: "${json.data.name}"`, type: 'success' });
      } else {
        addToast({ message: (typeof json.error === 'object' ? json.error?.message : json.error) || 'Failed to clone template', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      addToast({ message: 'Error saving cloned template', type: 'error' });
    } finally {
      setLoadingClone(false);
    }
  };

  // Delete Custom Template
  const handleDeleteCustomTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete custom template "${templateName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/certificate-templates?id=${templateId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCustomTemplates((prev) => {
          const updated = prev.filter((t) => t.id !== templateId);
          safeSetLocalStorage('tt_custom_certificate_templates', updated);
          return updated;
        });
        if (templateStyle === templateId) {
          setTemplateStyle('ai43');
          setActiveBgImage('/certificate-bg.png');
        }
        addToast({ message: `Deleted custom template "${templateName}"`, type: 'info' });
      }
    } catch (err) {
      console.error(err);
      addToast({ message: 'Failed to delete template', type: 'error' });
    }
  };

  // Save Permanent Template Structure & Design (Excludes dynamic student/recipient instance data)
  const handleSaveActiveTemplateChanges = async () => {
    try {
      addToast({ message: 'Saving template design & structure...', type: 'info' });

      let assignedTitle = '';
      if (targetType === 'course') {
        const c = coursesList.find((x) => x.id === assignedId);
        if (c) assignedTitle = c.title;
      } else if (targetType === 'certification') {
        const cert = certificationsList.find((x) => x.id === assignedId);
        if (cert) assignedTitle = cert.title;
      }

      // Permanent Template Design Config (Dynamic student data excluded)
      const updatedConfig = {
        mainTitle,
        subTitle,
        certifiesText,
        descriptionText,
        courseName,
        specialization,
        brandName,
        tagline,
        directorName,
        directorTitle,
        targetType,
        assignedId,
        assignedTitle,
        bgImage: activeBgImage,
        updatedAt: new Date().toISOString()
      };

      const existingIdx = customTemplates.findIndex(t => t.id === templateStyle);

      let updatedList = [...customTemplates];

      if (existingIdx !== -1) {
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          bgImage: activeBgImage,
          config: updatedConfig
        };
      } else {
        const newCustom = {
          id: `tmpl_custom_${Date.now()}`,
          name: `${courseName || 'Custom'} Template`,
          bgImage: activeBgImage || '#ffffff',
          courseId: 'ALL',
          config: updatedConfig,
          createdAt: new Date().toISOString(),
          isSystem: false
        };
        updatedList.unshift(newCustom);
        setTemplateStyle(newCustom.id);
      }

      setCustomTemplates(updatedList);
      safeSetLocalStorage('tt_custom_certificate_templates', updatedList);

      await fetch('/api/admin/certificate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: templateStyle,
          name: `${courseName || 'Custom'} Template`,
          bgImage: activeBgImage,
          config: updatedConfig
        })
      });

      addToast({ message: 'All changes saved to template successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ message: 'Error saving template changes', type: 'error' });
    }
  };

  // Issue & Mark Paid Certificate for Student Enrollment
  const handleIssueCertificate = async () => {
    if (!selectedStudent) {
      addToast({ message: 'No student selected — please search and select a student first', type: 'error' });
      return;
    }

    try {
      addToast({ message: `Issuing official certificate to ${studentName}...`, type: 'info' });

      const isExam = targetType === 'certification';
      const certTitle = (mainTitle && !mainTitle.includes('AI CERTIFICATE')) ? mainTitle : (courseName || 'Professional Certification');

      const templateConfig = {
        mainTitle,
        subTitle,
        certifiesText,
        descriptionText,
        courseName,
        specialization,
        brandName,
        tagline,
        directorName,
        directorTitle,
        bgImage: activeBgImage,
        logoUrl: '/sarthi-logo.png',
        signatureUrl: '/signature-mukul-pandey.png',
        completionDate: completionDate || undefined,
      };

      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent.id || selectedStudent.enrollmentId,
          courseId: assignedId !== 'ALL' ? assignedId : 'course_gen',
          title: certTitle,
          studentName: studentName.trim(),
          credentialId,
          issueDate: completionDate,
          status: 'VALID',
          paymentStatus: 'PAID',
          isExam: isExam,
          tier: 'PREMIUM',
          enrollmentId: selectedStudent.enrollmentId || enrollmentId,
          templateConfig
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const issuedCertId = json.data.certificateNumber || json.data.certificateId || credentialId;
        // Store in local storage cache for immediate admin feedback
        const certRecord = {
          id: issuedCertId,
          verificationId: issuedCertId,
          studentName: studentName.trim(),
          enrollmentId: selectedStudent.enrollmentId || enrollmentId,
          title: certTitle,
          authority: 'SARTHI',
          issuedAt: json.data.issuedAt || new Date().toISOString(),
          issueDate: completionDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          status: 'VERIFIED',
          paymentStatus: 'PAID',
          isExam: isExam,
          type: isExam ? 'Certification Exam' : 'Professional Certification'
        };

        try {
          const existing = localStorage.getItem('tt_issued_certificates');
          const parsed = existing ? JSON.parse(existing) : [];
          parsed.unshift(certRecord);
          safeSetLocalStorage('tt_issued_certificates', parsed);
        } catch (e) {
          console.error('Failed saving issued cert locally:', e);
        }

        addToast({
          message: `🎓 Certificate issued & persisted in DB! Certificate ID: ${issuedCertId}`,
          type: 'success'
        });
      } else {
        const errMsg = typeof json.error === 'object' ? (json.error?.message || JSON.stringify(json.error)) : (json.error || 'Failed to issue certificate on database server');
        addToast({
          message: `❌ DB Write Failed: ${errMsg}`,
          type: 'error'
        });
      }
    } catch (err: any) {
      console.error(err);
      addToast({
        message: err.message || 'Error issuing certificate',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen relative text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 pb-12 overflow-x-hidden">
      {/* Mountain Climbing Pixabay Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
        style={{
          backgroundImage: `url('https://cdn.pixabay.com/photo/2017/03/07/14/19/mountain-climbing-2124113_1280.jpg')`
        }}
      />
      {/* Dark Glass Overlay for optimal visual readability */}
      <div className="fixed inset-0 z-0 bg-slate-950/65 backdrop-blur-[3px] pointer-events-none" />

      <div className="relative z-10 space-y-0">
        {/* Semi-transparent Glass Header Bar */}
        <header className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-xl border-b border-slate-700/60 px-3 md:px-5 py-2.5 shadow-xl text-white">
          <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 shadow-sm flex items-center justify-center shrink-0">
                <Image src="/sarthi-logo.png" alt="SARTHI" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-white tracking-tight font-outfit uppercase">Certificate Studio</h1>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    ⚡ 4:3 Live Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Design & issue verified 4:3 certificate templates</p>
              </div>
            </div>

          {/* Mode Switcher Tabs & Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('designer')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  activeTab === 'designer' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" /> Studio Designer
              </button>
              <button
                onClick={() => setActiveTab('registry')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  activeTab === 'registry' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Existing Certificates
              </button>
            </div>

            <button
              onClick={handleDownloadPng}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" /> Download PNG
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-[1780px] mx-auto px-2 md:px-4 pt-3">
        {activeTab === 'designer' ? (
          <div className="flex flex-col lg:flex-row-reverse gap-3.5 items-start">
            
            {/* Control Sidebar (Clean Solid Surface) */}
            <div className="w-full lg:w-[430px] xl:w-[480px] shrink-0 bg-white border border-[#EAF0F7] rounded-[32px] p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] space-y-4">
              
              {/* Section 1: Template Structure & Design (Saved Permanently to Template) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-outfit">
                    🎨 1. Template Permanent Design
                  </label>

                  {/* Compact Zoom Controls on the Right Side of Section 1 Header */}
                  <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-xl text-white text-[11px] border border-slate-700/60 shadow-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                      className="p-0.5 hover:bg-white/20 rounded transition-all cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-amber-300 w-8 text-center text-[10px]">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                      className="p-0.5 hover:bg-white/20 rounded transition-all cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-0.5 rounded transition-all cursor-pointer ${
                        showGrid ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/20 text-white'
                      }`}
                      title="Toggle Grid"
                    >
                      <Grid className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Main Certificate Title & Subtitle */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 flex items-center justify-between">
                      <span>🏷️ Main Title</span>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = (courseName || '').split('—')[0].split('-')[0].trim().toUpperCase();
                          if (clean) setMainTitle(`${clean} CERTIFICATE`);
                        }}
                        className="text-[9px] text-amber-600 font-bold hover:underline"
                        title="Auto sync from course title"
                      >
                        ⚡ Sync
                      </button>
                    </label>
                    <input
                      type="text"
                      value={mainTitle}
                      onChange={(e) => setMainTitle(e.target.value)}
                      placeholder="e.g. POWER BI MASTERY CERTIFICATE"
                      className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600">📌 Subtitle</label>
                    <input
                      type="text"
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      placeholder="e.g. OF COMPLETION"
                      className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Course Title & Specialization */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-600">📚 Course / Exam Title</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setCourseName(newTitle);
                      const clean = newTitle.split('—')[0].split('-')[0].trim().toUpperCase();
                      if (clean) setMainTitle(`${clean} CERTIFICATE`);
                      
                      // Auto-generate description with high score marks (90-100%)
                      if (newTitle.trim()) {
                        const score = Math.floor(Math.random() * 11) + 90;
                        setDescriptionText(`has successfully completed a comprehensive program in ${newTitle.trim()}, covering core and advanced modules in machine learning, data analysis, neural networks, and real-world AI applications with an outstanding grade of ${score}%.`);
                      }
                    }}
                    className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Description Body Paragraph */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-600">📝 Description Body Text</label>
                  <textarea
                    rows={3}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all resize-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-600">🎯 Specialization Text</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Certifies Header */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-600">📜 Certifies Header Text</label>
                  <input
                    type="text"
                    value={certifiesText}
                    onChange={(e) => setCertifiesText(e.target.value)}
                    placeholder="e.g. THIS CERTIFIES THAT"
                    className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Brand Name & Tagline */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600">🏛️ Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600">⚡ Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Signatures & Authority */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600">✍️ Signatory Name</label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600">💼 Signatory Title</label>
                    <input
                      type="text"
                      value={directorTitle}
                      onChange={(e) => setDirectorTitle(e.target.value)}
                      className="w-full mt-1 bg-white/75 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveActiveTemplateChanges}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer mt-1"
                >
                  💾 Save Permanent Template
                </button>
              </div>

              {/* Section 2: Dynamic Recipient Instance Data (Relational Student Binding) */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80 bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-outfit">
                    👤 2. Recipient Data (Dynamic)
                  </label>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase">
                    Linked to DB User
                  </span>
                </div>

                {/* Search Student Input Field */}
                <div className="relative">
                  <label className="text-[10px] font-extrabold uppercase text-slate-700 flex items-center justify-between mb-1">
                    <span>🔍 Search Student (Name / Email / Enrollment ID)</span>
                    {searchingStudents && <span className="text-[9px] text-amber-600 animate-pulse font-bold">Searching...</span>}
                  </label>
                  
                  {selectedStudent ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 shadow-xs text-xs font-bold text-emerald-900">
                      <div className="flex items-center gap-2 truncate">
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{selectedStudent.name}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          {selectedStudent.enrollmentId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedStudent}
                        className="text-[10px] font-black uppercase bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded-lg transition-all ml-2 cursor-pointer shrink-0"
                      >
                        ✕ Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          placeholder="Type name, email, or ENR-..."
                          className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                        />
                      </div>

                      {/* Dropdown Results */}
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {searchResults.map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleSelectStudent(st)}
                              className="w-full text-left p-2.5 hover:bg-amber-50/80 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="truncate">
                                <div className="text-xs font-black text-slate-900 truncate">{st.name}</div>
                                <div className="text-[10px] text-slate-500 truncate">{st.email}</div>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-[9px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  {st.enrollmentId}
                                </span>
                                <span className="text-[8px] font-black text-emerald-700 uppercase mt-0.5">
                                  {st.paidStatus}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 flex items-center justify-between">
                    <span>🎓 Student / Recipient Name</span>
                    {selectedStudent && <span className="text-[9px] font-bold text-emerald-700">🔒 Locked (Linked)</span>}
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    readOnly={!!selectedStudent}
                    onChange={(e) => setStudentName(e.target.value)}
                    className={`w-full mt-1 rounded-xl px-3 py-2 text-xs font-black text-slate-900 transition-all shadow-xs ${
                      selectedStudent ? 'bg-slate-100 border border-slate-300 text-slate-700 cursor-not-allowed' : 'bg-white/80 border border-slate-200/90 focus:bg-white focus:border-amber-500 focus:outline-none'
                    }`}
                  />
                </div>

                {/* Student Enrollment ID */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 flex items-center justify-between">
                    <span>🆔 Student Enrollment / User ID</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {selectedStudent ? '🔒 Locked (Linked)' : 'PAID & VERIFIED'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={enrollmentId}
                    readOnly={!!selectedStudent}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    placeholder="e.g. ENR-2026-08503"
                    className={`w-full mt-1 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 transition-all shadow-xs ${
                      selectedStudent ? 'bg-slate-100 border border-slate-300 text-slate-700 cursor-not-allowed' : 'bg-white/80 border border-slate-200/90 focus:bg-white focus:border-amber-500 focus:outline-none'
                    }`}
                  />
                </div>

                {/* Issue Date & Certificate ID */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600">📅 Date of Issue</label>
                    <input
                      type="text"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="w-full mt-1 bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 flex items-center justify-between">
                      <span>🔑 Certificate ID</span>
                      <button onClick={generateNewId} title="Generate new ID" className="text-amber-600 hover:text-amber-700 cursor-pointer">
                        <RefreshCw className="w-3 h-3 inline" />
                      </button>
                    </label>
                    <input
                      type="text"
                      value={credentialId}
                      onChange={(e) => setCredentialId(e.target.value)}
                      className="w-full mt-1 bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[11px] font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Issue Certificate & Mark Paid Action Button */}
                <button
                  type="button"
                  onClick={handleIssueCertificate}
                  disabled={!selectedStudent}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-1 ${
                    selectedStudent
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {selectedStudent ? '🎓 Issue Certificate & Mark Paid' : '🔒 Search & Select Student First'}
                </button>
              </div>

              {/* Quick Link Action */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
                  {copiedLink ? 'Link Copied!' : 'Copy Verification Link'}
                </button>
              </div>
            </div>

            {/* Canvas Live Preview Window - Direct IFrame HTML Render */}
            <div className="flex-1 w-full min-w-0">
              {/* Certificate Stage Frame - Rendering RAW HTML File directly in IFRAME */}
              <div className="relative bg-slate-900/40 backdrop-blur-md border border-white/30 rounded-3xl p-4 md:p-6 overflow-hidden flex items-center justify-center min-h-[680px] shadow-2xl">
                {showGrid && (
                  <div className="absolute inset-0 z-40 pointer-events-none bg-[linear-gradient(to_right,#0000000c_1px,transparent_1px),linear-gradient(to_bottom,#0000000c_1px,transparent_1px)] bg-[size:20px_20px]" />
                )}

                <div
                  className="w-full max-w-[1050px] transition-transform duration-200 origin-top shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden shrink-0 flex justify-center"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {templateStyle === 'professional' ? (
                    <CertificateTemplate
                      template={{
                        mainTitle,
                        subTitle,
                        certifiesText,
                        descriptionText,
                        courseName,
                        specialization,
                        brandName,
                        tagline,
                        directorName,
                        directorTitle,
                        bgImage: activeBgImage
                      }}
                      recipient={{
                        studentName,
                        enrollmentNo,
                        issueDate: completionDate,
                        certificateId: credentialId,
                      }}
                    />
                  ) : (
                    <iframe
                      ref={iframeRef}
                      srcDoc={getProcessedHtml()}
                      className="w-[1050px] h-[787.5px] border-0 overflow-hidden rounded-[32px]"
                      title="Direct Certificate HTML File Preview"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Existing Certificates & All Templates Registry View (2 Sections: Courses vs Certification Exams) */
          <div className="space-y-8">
            {/* Top Action Header (Translucent Glassmorphism) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Certificate Templates Registry
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Browse and manage templates assigned to <strong>Courses</strong> or <strong>Certification Exams</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('designer');
                  setIsCloneModalOpen(true);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Copy className="w-4 h-4" /> Clone New Template
              </button>
            </div>

            {/* Helper function to compute template list */}
            {(() => {
              const allTemplateItems = [
                { id: 'ai43', name: 'AI Glassmorphism', bgImage: '/certificate-bg.png', targetLabel: 'Artificial Intelligence', targetBadge: '📚 Course', targetType: 'course', spec: 'Prompt Engineering', isSystem: true },
                { id: 'excel43', name: 'Advance Excel', bgImage: '/excel-bg.jpg', targetLabel: 'Advance Excel & Data Analytics', targetBadge: '📚 Course', targetType: 'course', spec: 'Advanced Excel & Dashboards', isSystem: true },
                { id: 'python43', name: 'Python Masterclass', bgImage: '/python-bg.jpg', targetLabel: 'Python Masterclass & Automation', targetBadge: '📚 Course', targetType: 'course', spec: 'Python Full-Stack & Automation', isSystem: true },
                ...customTemplates.map((t: any) => {
                  let targetLabel = 'All Courses & Exams (Generic)';
                  let targetBadge = '🌐 Generic';
                  let tType = t.targetType || 'all';

                  if (tType === 'certification' || (t.certificationId && t.certificationId !== 'ALL')) {
                    tType = 'certification';
                    const certId = t.certificationId || t.assignedId;
                    const cert = certificationsList.find((c: any) => c.id === certId);
                    targetLabel = cert ? cert.title : (t.assignedTitle || 'Certification Exam');
                    targetBadge = '🎓 Certification Exam';
                  } else {
                    const cId = t.courseId || t.assignedId;
                    if (cId && cId !== 'ALL') {
                      const course = coursesList.find((c: any) => c.id === cId);
                      targetLabel = course ? course.title : (t.assignedTitle || 'Course');
                      targetBadge = '📚 Course';
                      tType = 'course';
                    }
                  }

                  return {
                    id: t.id,
                    name: t.name,
                    bgImage: t.bgImage || '#ffffff',
                    targetLabel,
                    targetBadge,
                    targetType: tType,
                    config: t.config,
                    isSystem: false
                  };
                })
              ];

              const courseTemplates = allTemplateItems.filter(t => t.targetType === 'course' || t.targetType === 'all');
              const examTemplates = allTemplateItems.filter(t => t.targetType === 'certification');

              const renderCard = (tmpl: any) => (
                <div
                  key={tmpl.id}
                  className="bg-white/85 backdrop-blur-xl border border-white/60 hover:border-amber-400 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between group"
                >
                  {/* Visual Demo Photo Header (Exact 4:3 Aspect Ratio) */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 flex items-center justify-center p-4">
                    {tmpl.bgImage && (tmpl.bgImage.startsWith('/') || tmpl.bgImage.startsWith('http') || tmpl.bgImage.startsWith('data:')) ? (
                      <img
                        src={tmpl.bgImage}
                        alt={tmpl.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-white" />
                    )}

                    {/* Mini Glass Certificate Demo Card */}
                    <div className="relative z-10 w-[90%] h-[84%] bg-white/75 backdrop-blur-xs rounded-xl border border-white/90 shadow-md p-2.5 flex flex-col justify-between text-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                          <Award className="w-2.5 h-2.5 text-amber-700" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 font-mono">4:3 RATIO</span>
                      </div>
                      <div className="text-center my-auto">
                        <div className="text-[10px] font-black tracking-tight text-slate-900 uppercase truncate">{tmpl.name}</div>
                        <div className="text-[8px] text-slate-500 font-medium truncate mt-0.5">CERTIFICATE OF COMPLETION</div>
                      </div>
                      <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono border-t border-slate-200/60 pt-1">
                        <span>SARTHI</span>
                        <span className="text-emerald-600 font-bold">VERIFIED</span>
                      </div>
                    </div>

                    {/* Badge */}
                    <span
                      className={`absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs ${
                        tmpl.isSystem ? 'bg-slate-900/80 text-white backdrop-blur-xs' : 'bg-amber-500 text-white shadow-sm'
                      }`}
                    >
                      {tmpl.isSystem ? 'System' : 'Cloned'}
                    </span>
                  </div>

                  {/* Card Content & Actions */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                        {tmpl.name}
                      </h4>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-[9px] font-extrabold rounded-md text-slate-700 uppercase">
                          {tmpl.targetBadge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                        Target: <strong className="text-slate-800">{tmpl.targetLabel}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setTemplateStyle(tmpl.id);
                          setActiveBgImage(tmpl.bgImage);
                          if (tmpl.config) {
                            if (tmpl.config.mainTitle) setMainTitle(tmpl.config.mainTitle);
                            if (tmpl.config.subTitle) setSubTitle(tmpl.config.subTitle);
                            if (tmpl.config.certifiesText) setCertifiesText(tmpl.config.certifiesText);
                            if (tmpl.config.descriptionText) setDescriptionText(tmpl.config.descriptionText);
                            if (tmpl.config.courseName) setCourseName(tmpl.config.courseName);
                            if (tmpl.config.specialization) setSpecialization(tmpl.config.specialization);
                            if (tmpl.config.brandName) setBrandName(tmpl.config.brandName);
                            if (tmpl.config.tagline) setTagline(tmpl.config.tagline);
                            if (tmpl.config.directorName) setDirectorName(tmpl.config.directorName);
                            if (tmpl.config.directorTitle) setDirectorTitle(tmpl.config.directorTitle);
                          } else if (tmpl.targetLabel && tmpl.targetLabel !== 'All Courses & Exams (Generic)') {
                            setCourseName(tmpl.targetLabel);
                          }
                          setActiveTab('designer');
                          addToast({ message: `Loaded template "${tmpl.name}" into Studio`, type: 'success' });
                        }}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Open in Studio
                      </button>

                      {!tmpl.isSystem && (
                        <button
                          onClick={() => handleDeleteCustomTemplate(tmpl.id, tmpl.name)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all cursor-pointer"
                          title="Delete Custom Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <div className="space-y-6">
                  {/* Filter Selection Bar (Translucent Glassmorphism) */}
                  <div className="flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-2.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => setRegistryFilter('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                        registryFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white/60 text-slate-700 border border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      🌐 Show All ({allTemplateItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistryFilter('courses')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                        registryFilter === 'courses'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white/60 text-slate-700 border border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      📚 Courses Only ({courseTemplates.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistryFilter('exams')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                        registryFilter === 'exams'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white/60 text-slate-700 border border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      🎓 Certification Exams Only ({examTemplates.length})
                    </button>
                  </div>

                  {/* SECTION A: Course Templates */}
                  {(registryFilter === 'all' || registryFilter === 'courses') && (
                    <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            📚 1. Course Certificate Templates
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Templates assigned to library courses (sarthi-woad.vercel.app/courses)</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black rounded-lg">
                          {courseTemplates.length} Templates
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {courseTemplates.map(renderCard)}
                      </div>
                    </div>
                  )}

                  {/* SECTION B: Certification Exam Templates */}
                  {(registryFilter === 'all' || registryFilter === 'exams') && (
                    <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            🎓 2. Certification Exam Templates
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Templates assigned to certification exams (sarthi-woad.vercel.app/certification-exams)</p>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-black rounded-lg">
                          {examTemplates.length} Templates
                        </span>
                      </div>

                      {examTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {examTemplates.map(renderCard)}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-500">No Certification Exam templates created yet.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetType('certification');
                              setIsCloneModalOpen(true);
                            }}
                            className="mt-2 text-xs font-black text-amber-600 hover:underline"
                          >
                            + Clone Template for a Certification Exam
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Clone Template Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Clone AI Glassmorphism Template</h3>
              </div>
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                  1. Template Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GST Mastery Glassmorphism"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                  2. Background Image / Color
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewBgOption('white');
                      setNewCustomBgUrl('#ffffff');
                    }}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      newBgOption === 'white'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⚪ Solid White
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewBgOption('upload');
                      fileInputRef.current?.click();
                    }}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      newBgOption === 'upload'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    💻 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBgOption('url')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      newBgOption === 'url'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔗 Image URL
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleDeviceImageUpload}
                  className="hidden"
                />

                {newBgOption === 'upload' && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer group"
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                      <span className="text-xs font-bold text-slate-700">
                        {newCustomBgUrl && newCustomBgUrl.startsWith('data:image') ? 'Change Selected Device Image' : 'Choose image file from your computer'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Supports JPG, PNG, WEBP, SVG</span>
                    </button>
                  </div>
                )}

                {newBgOption === 'url' && (
                  <input
                    type="text"
                    placeholder="Enter image URL (e.g. /python-bg.jpg or https://...)"
                    value={newCustomBgUrl}
                    onChange={(e) => setNewCustomBgUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                )}

                {newCustomBgUrl && newCustomBgUrl !== '#ffffff' && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-20 bg-slate-900 flex items-center justify-center mt-2">
                    <img src={newCustomBgUrl} alt="Background Preview" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px] font-bold uppercase tracking-wider">
                      Selected Background Preview
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                  3. Assign Template Target (Automatic Certificate Issuance)
                </label>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('all');
                      setAssignedId('ALL');
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      targetType === 'all'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌐 Generic
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('course')}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      targetType === 'course'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📚 Course
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('certification')}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      targetType === 'certification'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🎓 Exam
                  </button>
                </div>

                {targetType === 'course' && (
                  <select
                    value={assignedId}
                    onChange={(e) => setAssignedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  >
                    <option value="ALL">Select Course (Library)</option>
                    {coursesList.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}

                {targetType === 'certification' && (
                  <select
                    value={assignedId}
                    onChange={(e) => setAssignedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  >
                    <option value="ALL">Select Certification Exam</option>
                    {certificationsList.map((cert: any) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCloneModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingClone}
                onClick={handleSaveCloneTemplate}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
              >
                {loadingClone ? 'Cloning...' : 'Save & Clone Template'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
