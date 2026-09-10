'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Download, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ClaimCertificateButtonProps {
  attemptId: string;
  certificationId: string;
  price: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ClaimCertificateButton({ attemptId, certificationId, price }: ClaimCertificateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(false);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const router = useRouter();

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      if (price === 0) {
        try {
          const genRes = await fetch(`/api/certifications/${certificationId}/generate-certificate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              attemptId,
              razorpay_payment_id: "FREE_CERT",
              razorpay_order_id: "FREE_CERT",
              razorpay_signature: "FREE_CERT_SIGNATURE",
            }),
          });

          const genData = await genRes.json();

          if (genData.success) {
            setIssued(true);
            setCertUrl(genData.certificate.certificateUrl);
            toast.success('Certificate claimed successfully!');
            router.push('/dashboard/achievements');
          } else {
            toast.error(genData.error || 'Failed to issue certificate');
          }
        } catch (error) {
          toast.error('Failed to generate free certificate');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 1. Initiate Payment (Create Order)
      const initRes = await fetch(`/api/certifications/attempts/${attemptId}/initiate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });

      const orderData = await initRes.json();

      if (!initRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // 2. Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: orderData.razorpayKey || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SARTHI',
        description: `Professional Certification: ${orderData.certificationTitle || (orderData.certification && orderData.certification.title) || 'Certification'}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 4. Generate Certificate after successful payment
            const genRes = await fetch(`/api/certifications/${certificationId}/generate-certificate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                attemptId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const genData = await genRes.json();

            if (genData.success) {
              setIssued(true);
              setCertUrl(genData.certificate.certificateUrl);
              toast.success('Certificate issued successfully!');
            } else {
              toast.error(genData.error || 'Failed to issue certificate');
            }
          } catch (error) {
            toast.error('Failed to verify payment and generate certificate');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '', // Will be filled by Razorpay if user is logged in
          email: '',
        },
        theme: {
          color: '#F97316',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (issued && certUrl) {
    return (
      <a 
        href={certUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/40 flex items-center gap-2 group"
      >
        DOWNLOAD CERTIFICATE
        <Download className="w-4 h-4" />
      </a>
    );
  }

  return (
    <button 
      onClick={handleClaim}
      disabled={loading}
      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/40 flex items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          PROCESSING...
        </>
      ) : (
        <>
          PAY & CLAIM CERTIFICATE
          <CreditCard className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

