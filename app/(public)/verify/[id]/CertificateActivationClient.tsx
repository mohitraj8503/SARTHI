'use client';

import React, { useState } from 'react';
import { Award, ShieldAlert } from 'lucide-react';

interface Props {
  verificationId: string;
}

export default function CertificateActivationClient({ verificationId }: Props) {
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

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/50 border border-amber-500/20 space-y-6 shadow-2xl">
         <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
            <Award className="w-8 h-8 animate-pulse text-amber-500" />
         </div>
         <h1 className="text-2xl font-bold text-slate-100 italic font-black uppercase tracking-wide">Activation Pending</h1>
         <p className="text-slate-400 text-sm leading-relaxed">
            This certification has been successfully earned, but official digital activation is currently pending processing.
         </p>
         
         {error && (
           <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
             <ShieldAlert className="w-4 h-4 shrink-0" />
             <span>{error}</span>
           </div>
         )}

         <div className="pt-2 flex flex-col gap-3">
           <button
             onClick={handleActivate}
             disabled={isProcessing}
             className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2"
           >
             {isProcessing ? (
               <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Processing Activation...
               </>
             ) : (
               'Pay & Activate Certificate (₹2000)'
             )}
           </button>
           
           <button 
             onClick={() => window.location.href = '/certification-exams'} 
             className="w-full py-4 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
           >
             Back to Dashboard
           </button>
         </div>
      </div>
    </main>
  );
}
