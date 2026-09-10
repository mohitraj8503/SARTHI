'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { Loader2, Check, Award, Rocket, PartyPopper, ExternalLink, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateTier {
  name: string;
  id: string;
  price: number; // in rupees
  features: string[];
  color: string;
}

const tiers: CertificateTier[] = [
  {
    name: 'Basic',
    id: 'basic',
    price: 0,
    features: ['PDF Certificate', 'SARTHI Branding', 'Certificate ID'],
    color: 'bg-gray-100 dark:bg-zinc-800'
  },
  {
    name: 'Premium',
    id: 'premium',
    price: 99,
    features: [
      'Enhanced Design',
      'LinkedIn Share',
      'QR Verification',
      'Priority Support',
    ],
    color: 'bg-orange-500/10'
  },
];

import Script from 'next/script';

export default function CertificateTierSelector({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState<string | null>(null);
  const [payError, setPayError] = useState('');
  const router = useRouter();
  const { addToast } = useToast();
  
  // ... rest of the code


  const handlePayment = async (tier: CertificateTier) => {
    setLoading(tier.id);
    try {
      if (tier.price === 0) {
        // Free tier - generate directly
        const response = await fetch('/api/course/certificate/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, tier: tier.id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to generate certificate');
        }

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF8A00', '#FFD700', '#1A3C2E']
        });

        addToast({
          message: 'Congratulations! Your free certificate is ready! 🎓',
          type: 'success'
        });

        router.refresh();
      } else {
        // Paid tier - create real Razorpay Order
        const res = await fetch('/api/certificate/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, tier: tier.id }),
        });
        
        const data = await res.json();
        if (data.success && data.orderId) {
          // Open real Razorpay modal instead of a simple link
          const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "SARTHI",
            description: `Upgrade to ${tier.name} Certificate`,
            order_id: data.orderId,
            handler: async (response: any) => {
              // Automatically call verify after payment success
              handleVerify(tier.id, response);
            },
            theme: { color: "#ea580c" },
            modal: {
              ondismiss: () => setLoading(null)
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          
          // Show verification button for this tier just in case
          setShowVerify(tier.id);
        } else {
            throw new Error(data.message || 'Payment initiation failed');
        }
      }
    } catch (error: any) {
      setPayError(error.message || 'Something went wrong');
      addToast({
        message: error.message || 'Something went wrong',
        type: 'error'
      });
      setLoading(null);
    }
  };

  const handleVerify = async (tierId: string, responseData?: any) => {
    setLoading(tierId);
    try {
      const response = await fetch('/api/certificate/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            courseId, 
            tier: tierId,
            ...(responseData || {}) // Include razorpay details if from handler
        }),
      });

      if (response.ok) {
        // If verified, generate the certificate now
        const genRes = await fetch('/api/course/certificate/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, tier: tierId }),
        });

        if (genRes.ok) {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.7 },
          });
          addToast({
            message: 'Payment verified! Generating your premium certificate... 🌟',
            type: 'success'
          });
          router.refresh();
        }
      } else {
        addToast({
          message: 'Payment not found or still pending. 🕰️',
          type: 'error'
        });
      }
    } catch (error: any) {
      addToast({
        message: 'Error verifying payment. ❌',
        type: 'error'
      });
    } finally {
      setLoading(null);
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {tiers.map((tier) => (
        <div 
          key={tier.id} 
          className={`flex flex-col p-8 rounded-[2rem] border border-border/50 relative overflow-hidden transition-all hover:shadow-2xl hover:border-orange-500/30 ${tier.price > 0 ? 'bg-orange-500/5' : 'bg-secondary/50'}`}
        >
          {tier.price > 0 && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
              Most Popular
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-xl font-black text-foreground mb-1">{tier.name}</h3>
            <p className="text-3xl font-black text-foreground">
              {tier.price === 0 ? 'Free' : `₹${tier.price}`}
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-1">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.price > 0 ? 'bg-orange-500/10' : 'bg-foreground/5'}`}>
                  <Check className={`w-3 h-3 ${tier.price > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          {showVerify === tier.id ? (
            <button
              onClick={() => handleVerify(tier.id)}
              disabled={loading === tier.id}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading === tier.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'I\'ve Paid - Verify Now'}
            </button>
          ) : (
            <button
              onClick={() => handlePayment(tier)}
              disabled={loading !== null}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-xl ${
                tier.price === 0 
                  ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border shadow-secondary/20' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20'
              }`}
            >
              {loading === tier.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {tier.price === 0 ? <Award className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
                  {tier.price === 0 ? 'Generate Free' : 'Pay & Generate'}
                </>
              )}
            </button>
          )}
        </div>
      ))}
      
      <div className="md:col-span-2 mt-8 text-center bg-secondary/30 py-4 rounded-3xl border border-border/50">
        <a 
          href="https://razorpay.me/@sarthi" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-600 transition-colors text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          <Rocket className="w-3.5 h-3.5 group-hover:animate-bounce" /> 
          Switch to Manual Flexible Payment
        </a>
      </div>
    </div>
  );
}

