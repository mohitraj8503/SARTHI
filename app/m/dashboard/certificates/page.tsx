'use client'

import { useEffect, useState } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import { Download, Share2, Award, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { downloadCertificateAsPdf } from '@/lib/client-certificate-export'

export default function MobileCertificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCerts() {
      try {
        const res = await fetch('/api/student/certificates');
        if (res.ok) {
          const json = await res.json();
          setCerts(json.certificates || []);
        }
      } catch (err) {
        console.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    }
    fetchCerts();
  }, []);

  return (
    <>
      <MobileHeader title="Certificates" />
      
      <main style={{ padding: '16px' }}>
        {/* Top Badge */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)', 
            borderRadius: 16, 
            padding: 20, 
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24
          }}
        >
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12 }}>
            <Award size={32} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0' }}>{certs.length} Achieved</h2>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Validated Professional Milestones</p>
          </div>
        </div>

        {/* Certificate Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingBottom: 40 }}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse" style={{ height: 180, background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB' }} />
            ))
          ) : certs.length > 0 ? (
            certs.map((cert) => (
              <div 
                key={cert.id} 
                style={{ 
                  background: '#FFFFFF', 
                  borderRadius: 14, 
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1.4/1', backgroundColor: '#F9FAFB' }}>
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                      <Award size={64} color="#2D6A4F" />
                   </div>
                   {/* Thumbnail if available */}
                   <Image 
                     src={cert.courseThumbnail || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&fit=crop'} 
                     alt={cert.courseTitle}
                     fill
                     style={{ objectFit: 'cover', opacity: 0.8 }}
                   />
                </div>
                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.2, height: 28, overflow: 'hidden' }}>
                    {cert.courseTitle}
                  </h3>
                  <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 12 }}>
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button 
                      onClick={() => {
                        if (cert.htmlSnapshot) {
                          downloadCertificateAsPdf(cert.htmlSnapshot);
                        } else if (cert.downloadUrl) {
                          window.open(cert.downloadUrl, '_blank');
                        } else {
                          window.location.href = `/verify/${cert.certificateNumber || cert.id}`;
                        }
                      }}
                      style={{ flex: 1, height: 32, background: '#F3F4F6', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Download size={14} color="#4B5563" />
                    </button>
                    <button 
                      onClick={() => window.open(`/verify/${cert.certificateNumber || cert.id}`, '_blank')}
                      style={{ flex: 1, height: 32, background: '#E8F5EE', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Share2 size={14} color="#2D6A4F" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Earn your first badge</h3>
              <p style={{ fontSize: 14, color: '#6B7280' }}>Complete a course and pass the final assessment to unlock your official certificate.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

