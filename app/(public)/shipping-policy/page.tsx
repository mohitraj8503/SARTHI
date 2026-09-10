'use client';

import { motion } from 'framer-motion';
import {
  Truck, Package, Smartphone, MapPin, AlertCircle,
  ArrowRight, Sparkles, Mail, CheckCircle2, Zap, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  const lastUpdated = 'September 2026';

  return (
    <div className="relative min-h-screen bg-[#F5F0E8] text-[#1A3C2E] selection:bg-[#2D6A4F] selection:text-white overflow-x-hidden pt-28 pb-20">

      {/* Ambient Backdrop Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[-4%] w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-[#E8B84B]/8 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(#1A3C2E 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <main className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. HERO SECTION */}
        <section className="pt-10 pb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#C5D5C0] text-[#2D6A4F] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2.5px] mb-6 shadow-sm"
          >
            <Truck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Instant Digital Delivery & Logistics
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A3C2E] tracking-tight leading-[1.08] mb-6"
          >
            Shipping & <span className="text-[#2D6A4F]">Delivery.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[16px] sm:text-[17px] leading-[1.65] max-w-[620px] font-medium"
          >
            SARTHI delivers digital learning programs instantly across the globe, along with expedited courier logistics for physical certificates and cohort swags.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider bg-white/70 border border-[#E8E2D9] px-4 py-1.5 rounded-full"
          >
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>All India Coverage & Instant LMS Provisioning</span>
          </motion.div>
        </section>

        {/* 2. DUAL DELIVERY MODES SUMMARY */}
        <section className="grid md:grid-cols-2 gap-8 mb-14">
          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(26,60,46,0.04)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Zap className="w-6 h-6" />
            </div>
            <div className="inline-block bg-[#E8F5EE] text-[#2D6A4F] border border-[#C5D5C0] text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
              Primary Mode
            </div>
            <h3 className="text-xl font-bold text-[#1A3C2E]">Digital Products & Services</h3>
            <p className="text-sm text-[#5D705C] leading-relaxed font-medium">
              Course modules, interactive labs, verified digital credentials, and cohort memberships are unlocked <strong>instantly (within 5 minutes)</strong> upon successful Razorpay payment.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(26,60,46,0.04)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Package className="w-6 h-6" />
            </div>
            <div className="inline-block bg-[#F5F0E8] text-[#1A3C2E] border border-[#E8E2D9] text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
              Select Programs
            </div>
            <h3 className="text-xl font-bold text-[#1A3C2E]">Physical Kits & Certificates</h3>
            <p className="text-sm text-[#5D705C] leading-relaxed font-medium">
              Hardware project kits, printed hardcopy certificates, and welcome merchandise are shipped via premium couriers with a delivery timeframe of <strong>3 to 7 business days</strong> across India.
            </p>
          </div>
        </section>

        {/* 3. POLICY DETAILS */}
        <section className="space-y-8 mb-16">

          {/* Section 1 */}
          <PolicyCard
            num="01"
            title="Instant Digital Fulfillment Protocol"
            icon={<Zap className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                When you purchase any digital program on SARTHI:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
                  <span><strong>Immediate Access:</strong> Your student account is granted immediate permission to access video modules, code repositories, and quizzes in your Student Dashboard.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
                  <span><strong>Email Confirmation:</strong> A confirmation email containing your onboarding credentials, curriculum overview, and GST tax invoice is dispatched automatically within minutes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
                  <span><strong>Credentials & Verifiable Badges:</strong> Upon course completion, certificates are generated digitally in high resolution with a tamper-proof QR code verifiable 24/7 on <code className="text-xs font-mono">sarthi-woad.vercel.app/verify</code>.</span>
                </li>
              </ul>
            </div>
          </PolicyCard>

          {/* Section 2 */}
          <PolicyCard
            num="02"
            title="Physical Goods Dispatch & Timelines"
            icon={<Package className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-4 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                For cohort kits, robotics modules, or optional printed certificate plaques:
              </p>
              <div className="overflow-x-auto rounded-2xl border border-[#E8E2D9]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F5F0E8] border-b border-[#E8E2D9] text-[11px] font-black uppercase tracking-wider text-[#1A3C2E]">
                    <tr>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Processing Time</th>
                      <th className="px-5 py-3.5">Estimated Delivery</th>
                      <th className="px-5 py-3.5">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9] text-xs font-medium">
                    <tr>
                      <td className="px-5 py-4 font-bold text-[#1A3C2E]">Digital LMS Access</td>
                      <td className="px-5 py-4">Instant</td>
                      <td className="px-5 py-4 text-[#2D6A4F] font-bold">5 - 15 Minutes</td>
                      <td className="px-5 py-4">Global Access</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 font-bold text-[#1A3C2E]">Metro Cities (Physical)</td>
                      <td className="px-5 py-4">1 - 2 Business Days</td>
                      <td className="px-5 py-4">2 - 4 Business Days</td>
                      <td className="px-5 py-4">Tier-1 Metros</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 font-bold text-[#1A3C2E]">Rest of India (Physical)</td>
                      <td className="px-5 py-4">1 - 2 Business Days</td>
                      <td className="px-5 py-4">4 - 7 Business Days</td>
                      <td className="px-5 py-4">All Standard PIN Codes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </PolicyCard>

          {/* Section 3 */}
          <PolicyCard
            num="03"
            title="Consignment Tracking & Logistics Partners"
            icon={<Smartphone className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-4 font-medium">
              We partner with trusted courier networks including <strong>BlueDart, Delhivery, DTDC, and India Post Speed Post</strong>. Once your physical package is dispatched from our fulfillment center, you will receive an automated tracking link via SMS and email.
            </p>
          </PolicyCard>

          {/* Section 4 */}
          <PolicyCard
            num="04"
            title="Address Verification & Delivery Guidelines"
            icon={<MapPin className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Accurate Details:</strong> Please ensure your complete postal address with landmark and an active 10-digit mobile number are provided during registration.
              </p>
              <p>
                • <strong>Damaged Packages:</strong> If your physical kit or certificate arrives in a visibly damaged condition, please report it to <a href="mailto:support@sarthi.in" className="text-[#2D6A4F] font-bold underline">support@sarthi.in</a> within 48 hours of delivery with unboxing photos for a free replacement.
              </p>
            </div>
          </PolicyCard>

        </section>

        {/* 4. HELP CONTACT BANNER */}
        <section className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-[#1A3C2E]">Have a question regarding shipping or access?</h4>
            <p className="text-xs sm:text-sm text-[#5D705C]">Our operations team will assist you with shipment tracking and LMS provisioning.</p>
          </div>
          <Link href="/contact">
            <button className="bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shrink-0">
              Contact Logistics Helpdesk <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </section>

      </main>
    </div>
  );
}

function PolicyCard({
  num,
  title,
  icon,
  children
}: {
  num: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(26,60,46,0.03)]">
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#E8E2D9]">
        <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <span className="text-[11px] font-black tracking-[2px] uppercase text-[#2D6A4F] block">Section {num}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A3C2E] tracking-tight">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}
