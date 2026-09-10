'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MobileLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Access Granted');
        router.push('/m/dashboard');
      } else {
        toast.error(data.message || 'Authentication Failed');
      }
    } catch (err) {
      toast.error('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '40px 24px' }}>
              <div style={{ width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          <Image src="/sarthi-logo.png" alt="Logo" width={60} height={60} style={{ objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ fontSize: 15, color: '#6B7280' }}>Continue your learning journey</p>
        </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginLeft: 4 }}>EMAIL ADDRESS</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <Mail size={18} color="#9CA3AF" />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="mohit@sarthi-woad.vercel.app" 
              style={{ 
                width: '100%', 
                height: 52, 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB', 
                borderRadius: 12, 
                paddingLeft: 44, 
                paddingRight: 16, 
                fontSize: 16, 
                color: '#1A1A1A',
                outline: 'none'
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginLeft: 4 }}>PASSWORD</label>
            <Link href="/m/forgot-password" style={{ fontSize: 13, fontWeight: 700, color: '#2D6A4F' }}>Forgot?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <Lock size={18} color="#9CA3AF" />
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••" 
              style={{ 
                width: '100%', 
                height: 52, 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB', 
                borderRadius: 12, 
                paddingLeft: 44, 
                paddingRight: 50, 
                fontSize: 16, 
                color: '#1A1A1A',
                outline: 'none'
              }} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            height: 56, 
            backgroundColor: '#2D6A4F', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: 12, 
            fontWeight: 800, 
            fontSize: 16,
            marginTop: 12,
            boxShadow: '0 4px 12px rgba(45,106,79,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            New to SARTHI? <Link href="/m/register" style={{ fontWeight: 800, color: '#2D6A4F' }}>Join for free</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

function GraduationCap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

