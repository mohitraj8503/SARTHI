import { Award } from 'lucide-react';
import Link from 'next/link';

interface CertificateProgress {
    courseId: string;
    courseName: string;
    progress: number;
    requirements: {
        lessonsCompleted: number;
        totalLessons: number;
    };
    canClaim: boolean;
}

function CertificatesWidget({ certificates }: { certificates: CertificateProgress[] }) {
    if (certificates.length === 0) return null;
    
    const inProgress = certificates.filter(c => !c.canClaim && c.progress > 0);
    const ready = certificates.filter(c => c.canClaim);
    
    return (
        <div className="bg-white p-6 rounded-[16px] border border-[#EAE6DF]/60 shadow-[0_2px_8px_rgba(45,74,62,0.02)] transition-all hover:border-[#D4956A]/10">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#D4956A]" />
                    <span className="text-[13px] font-outfit font-medium text-[#2A3828]">Certificates</span>
                </div>
                {ready.length > 0 && (
                    <span className="text-[10px] font-outfit font-medium text-green-500 bg-green-50 px-3 py-1 rounded-full">
                        {ready.length} ready
                    </span>
                )}
            </div>
            
            {ready.length > 0 && (
                <div className="space-y-2 mb-4">
                    {ready.slice(0, 2).map(cert => (
                        <div key={cert.courseId} className="p-3 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-[11px] font-medium text-[#2A3828] truncate">{cert.courseName}</p>
                            <Link 
                                href="/dashboard/certificates" 
                                className="text-[9px] font-bold text-green-600 hover:underline"
                            >
                                Claim Now →
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            
            {inProgress.length > 0 && (
                <div className="space-y-2">
                    {inProgress.slice(0, 1).map(cert => (
                        <div key={cert.courseId}>
                            <div className="flex justify-between text-[9px] mb-1">
                                <span className="text-[#5D705C] font-outfit truncate">{cert.courseName}</span>
                                <span className="font-medium text-[#D4956A]">{cert.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#F7F4EF] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#D4956A] to-[#2A3828]/20 rounded-full transition-all duration-1000"
                                    style={{ width: `${cert.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {certificates.length === 0 && (
                <p className="text-[10px] text-[#5D705C] text-center py-2">
                    Enroll in courses to earn certificates
                </p>
            )}
        </div>
    );
}

export default CertificatesWidget;

