'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MobileRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Account Created');
        router.push('/m/dashboard');
      } else {
        toast.error(data.message || 'Registration Failed');
      }
    } catch (err) {
      toast.error('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: '8+ Characters', met: formData.password.length >= 8 },
    { label: 'Contains Numbers', met: /\d/.test(formData.password) },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Join SARTHI</h1>
        <p style={{ fontSize: 15, color: '#6B7280' }}>Start your professional journey today</p>
      </div>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginLeft: 4 }}>FULL NAME</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <User size={18} color="#9CA3AF" />
            </div>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Mohit Raj" 
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
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginLeft: 4 }}>EMAIL ADDRESS</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <Mail size={18} color="#9CA3AF" />
            </div>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="mohit@example.com" 
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
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginLeft: 4 }}>CREATE PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <Lock size={18} color="#9CA3AF" />
            </div>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="••••••••" 
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
          
          <div style={{ display: 'flex', gap: 12, marginTop: 4, marginLeft: 4 }}>
            {passwordChecks.map((check) => (
              <div key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ 
                  width: 14, 
                  height: 14, 
                  borderRadius: '50%', 
                  backgroundColor: check.met ? '#2D6A4F' : '#E5E7EB', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {check.met && <Check size={8} color="#FFFFFF" />}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: check.met ? '#2D6A4F' : '#9CA3AF' }}>{check.label}</span>
              </div>
            ))}
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
          {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 40 }}>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Already have an account? <Link href="/m/login" style={{ fontWeight: 800, color: '#2D6A4F' }}>Log in</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

