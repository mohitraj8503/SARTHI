'use client';

import { useState } from 'react';
import { Check, Loader2, Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageHeader from '@/components/common/PageHeader';
import PublicPageWrapper from '@/components/layout/PublicPageWrapper';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

const plans = [
  {
    id: 'basic',
    name: 'Starter',
    price: '0',
    period: '/month',
    description: 'Perfect for exploring engineering fundamentals',
    features: ['Access to all free courses', 'Community forum access', 'Public profile', 'Standard learning paths'],
    cta: 'Get Started Free',
    popular: false,
    color: 'text-[#5D705C]'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '299',
    period: '/month',
    description: 'For career-focused engineers & builders',
    features: [
      'Unlimited Pro Course access',
      'Production certifications',
      'Priority slack support',
      'Offline video access',
      'Industrial automation modules',
      'Early access to seminars'
    ],
    cta: 'Ascend to Pro',
    popular: true,
    color: 'text-[#2D6A4F]'
  },
  {
    id: 'business',
    name: 'Enterprise',
    price: '999',
    period: '/month',
    description: 'For teams driving technological change',
    features: [
      'Team skill analytics',
      'Custom cohort paths',
      'LMS integration (SSO)',
      'Quarterly engineering audit',
      'Dedicated success manager'
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'text-[#1A3C2E]'
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscription = async (planId: string) => {
    if (planId === 'basic') {
        if (user) router.push('/dashboard');
        else router.push('/login');
        return;
    }

    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoadingPlan(planId);

    try {
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start subscription');

      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'SARTHI Academy',
        description: `${planId.toUpperCase()} Subscription`,
        image: '/logo.jpg',
        handler: async function (response: RazorpayResponse) {
          try {
            const verifyRes = await fetch('/api/payments/verify-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, planType: planId }),
            });

            if (verifyRes.ok) router.push('/courses?subscription=success');
            else alert('Subscription verification failed.');
          } catch (err) { console.error(err); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#1A3C2E' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <PublicPageWrapper>
        <PageHeader 
            title="Invest in Mastery."
            description="Simple, transparent pricing for engineers. High-bandwidth learning, zero nonsense. Choose the intensity of your growth."
        />

        <div className="mx-auto max-w-7xl px-6 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-12">
            {plans.map((plan, index) => (
                <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`
                        bg-white rounded-[40px] p-10 lg:p-14 border transition-all duration-500 flex flex-col h-full
                        ${plan.popular 
                            ? 'border-[#2D6A4F] shadow-[0_40px_80px_-20px_rgba(26,60,46,0.16)] ring-1 ring-[#2D6A4F]/20 relative md:-translate-y-4' 
                            : 'border-[#E8E2D9] hover:border-[#1A3C2E]/20 hover:shadow-[0_20px_40px_-15px_rgba(26,60,46,0.08)]'}
                    `}
                >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2D6A4F] text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.3em] flex items-center gap-2 shadow-xl whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 fill-current" /> Most Popular Selection
                  </div>
                )}
                
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className={`w-4 h-4 ${plan.color}`} />
                        <h3 className={`text-[11px] font-black uppercase tracking-[3px] ${plan.color}`}>
                            {plan.name} Tier
                        </h3>
                    </div>
                    <p className="text-[#1A3C2E] text-2xl font-black leading-tight tracking-tight">
                        {plan.description}
                    </p>
                </div>

                <div className="flex items-baseline gap-2 mb-12">
                  <span className="text-[56px] font-black text-[#1A3C2E] tracking-tighter leading-none">
                    ₹{plan.price}
                  </span>
                  <span className="text-[#5D705C] font-black uppercase text-[12px] tracking-widest pb-2">
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-6 mb-16 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 text-[15px] font-medium text-[#1A3C2E]/70 leading-relaxed">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' : 'bg-[#F5F0E8] text-[#5D705C]'}`}>
                        <Check className="w-3 h-3" strokeWidth={5} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscription(plan.id)}
                  disabled={loadingPlan !== null}
                  className={`
                    w-full py-6 rounded-[24px] font-black uppercase tracking-[2px] text-[13px] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50
                    ${plan.popular 
                        ? 'bg-[#1A3C2E] text-white shadow-2xl shadow-[#1A3C2E]/20 hover:bg-[#2D6A4F]' 
                        : 'bg-white text-[#1A3C2E] border-2 border-[#E8E2D9] hover:border-[#1A3C2E]'}
                  `}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-20 p-12 bg-[#F5F0E8]/50 rounded-[40px] border border-dashed border-[#E8E2D9] text-center"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-[#2D6A4F]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1A3C2E]">Scholarship Program</span>
                </div>
                <p className="text-[#5D705C] font-medium max-w-xl mx-auto">
                    Are you a student in India with limited resources but high ambition? Apply for our 100% scholarship tracks. We believe talent is universal, but opportunity is not.
                </p>
                <button className="mt-8 text-[#1A3C2E] font-black uppercase tracking-widest text-[11px] border-b-2 border-[#1A3C2E] pb-1 hover:text-[#2D6A4F] hover:border-[#2D6A4F] transition-all">
                    Apply for Scholorship
                </button>
            </motion.div>
        </div>
    </PublicPageWrapper>
  );
}

