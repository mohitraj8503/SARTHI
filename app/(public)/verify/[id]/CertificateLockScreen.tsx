'use client';

import React, { useState } from 'react';
import { Award, ShieldAlert, Check } from 'lucide-react';

interface Props {
  verificationId: string;
}

export default function CertificateLockScreen({ verificationId }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleActivate = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/certifications/create-activation-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize activation order');

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Payment gateway failed to load.');

      // 3. Configure checkout options
      const options: any = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SARTHI',
        description: `Certificate Activation: ${orderData.title}`,
        image: '/images/sarthi_logo.jpg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 4. Verify payment
            const verifyRes = await fetch('/api/certifications/verify-activation-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                verificationId
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');

            // Success: Reload to show the active certificate!
            window.location.reload();
          } catch (err: any) {
            setError(err.message || 'Payment verification failed.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || '',
          contact: orderData.user?.phone || ''
        },
        theme: { color: '#059669' },
        modal: { ondismiss: () => setIsProcessing(false), escape: false },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setError(resp.error?.description || 'Payment Failed');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Activation failed to initialize');
      setIsProcessing(false);
    }
  };

  const checklist = [
    "Printable Certificate",
    "Professional Credential",
    "Verification QR",
    "Verification Link",
    "Public Credential Page",
    "LinkedIn Sharing",
    "Lifetime Credential Record"
  ];

  return (
    <div style={{
      minHeight: '80vh',
      background: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px 60px 20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.02)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 72,
          height: 72,
          background: '#fef3c7',
          color: '#d97706',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1)'
        }}>
          <Award style={{ width: 36, height: 36 }} />
        </div>
        
        <h1 style={{
          fontSize: 24,
          fontWeight: 900,
          color: '#0f172a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 10
        }}>
          Activate Certificate
        </h1>
        
        <p style={{
          color: '#64748b',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 28,
          lineHeight: 1.5
        }}>
          Complete your professional credential activation to access your verified certificate.
        </p>

        <div style={{
          background: '#f8fafc',
          borderRadius: 16,
          padding: '24px',
          textAlign: 'left',
          marginBottom: 28,
          border: '1px solid #f1f5f9'
        }}>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Unlocks Premium Features
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {checklist.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#334155', fontSize: 14, fontWeight: 500 }}>
                <div style={{ background: '#dcfce7', padding: 4, borderRadius: '50%', display: 'flex' }}>
                  <Check style={{ width: 14, height: 14, color: '#16a34a' }} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            One-time Activation Fee
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ color: '#0f172a', fontSize: 36, fontWeight: 900 }}>₹49</span>
            <span style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>INR</span>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#ef4444',
            padding: '14px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <ShieldAlert style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            onClick={handleActivate}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '18px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: isProcessing ? 0.8 : 1,
              boxShadow: '0 4px 14px 0 rgba(5, 150, 105, 0.39)',
              transition: 'all 0.2s ease-in-out',
              transform: isProcessing ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {isProcessing ? (
              <>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              'Activate Now'
            )}
          </button>

          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              width: '100%',
              padding: '16px',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
