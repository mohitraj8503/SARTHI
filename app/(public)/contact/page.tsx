'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, MapPin, CheckCircle2, Loader2,
  ChevronDown, Facebook, Twitter, Linkedin,
  MessageSquare, Send, ArrowUpRight
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: 'General Inquiry', message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');
      setSent(true);
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    { q: 'What are your business hours?', a: 'Our office hours are Monday to Friday, 9:00 AM - 6:00 PM IST. Our online support is available 24/7.' },
    { q: 'How do I get technical support?', a: 'You can reach our technical support team by emailing support@sarthi.in or through our contact form below.' },
    { q: 'Where is SARTHI located?', a: 'Our registered office is in Baridih, Jamshedpur, Jharkhand - 831017.' },
    { q: 'Can I visit your office?', a: 'Yes, visitors are welcome during our business hours. Please schedule an appointment via email for a better experience.' },
    { q: "What's the best way to reach customer service?", a: 'For immediate assistance, call us at +91 98350 19509. Otherwise, the contact form or email is highly recommended.' },
  ];

  const inputClass = "w-full bg-white border border-[#E8E2D9] rounded-[10px] px-4 py-3.5 text-[14px] font-medium text-[#1A3C2E] placeholder-[#5D705C] focus:outline-none focus:border-[#2D6A4F] focus:shadow-[0_0_0_3px_rgba(45,106,79,0.08)] transition-all";

  return (
    <div className="relative min-h-screen bg-[#F5F0E8] text-[#1A3C2E] selection:bg-[#2D6A4F]/20 overflow-x-hidden pt-24 pb-20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[-4%] w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-[#E8B84B]/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(#1A3C2E 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      <main className="relative z-10">

        {/* Cinematic Hero Section */}
        <section className="px-6 pt-16 pb-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#C5D5C0] text-[#2D6A4F] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[3px] mb-6 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Support 24/7
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-3xl md:text-5xl font-bold text-[#1A3C2E] tracking-tight leading-[1.05] mb-5"
          >
            Let&apos;s start a <span className="text-[#2D6A4F]">conversation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[17px] leading-[1.65] max-w-[520px] font-medium"
          >
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
          </motion.p>
        </section>

        {/* Contact Cards Grid */}
        <section className="max-w-[1200px] mx-auto px-6 -mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ContactCard
              icon={<MapPin className="w-5 h-5" />}
              title="Visit Office"
              lines={['SARTHI HQ', 'Baridih, Jamshedpur', 'Jharkhand - 831017']}
              delay={0.3}
            />
            <ContactCard
              icon={<Phone className="w-5 h-5" />}
              title="Call Us"
              lines={['+91 98350 19509', 'Mon-Fri, 10am-7pm', 'Sat-Sun, Support Only']}
              delay={0.4}
            />
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              title="Email Us"
              lines={['support@sarthi.in', 'admissions@sarthi-woad.vercel.app', 'contact@sarthi-woad.vercel.app']}
              delay={0.5}
            />
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="max-w-4xl mx-auto px-6 mt-24">
          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 md:p-14 shadow-sm relative overflow-hidden">
            <div className="text-center mb-12">
              <h2 className="text-[32px] font-bold text-[#1A3C2E] tracking-tight mb-3">Send us a message</h2>
              <p className="text-[#5D705C] font-medium text-[15px]">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
            </div>

            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 relative z-10"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[1.5px]">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[1.5px]">Email Address</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[1.5px]">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                        placeholder="+91 ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[1.5px]">Subject</label>
                      <div className="relative">
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option>General Inquiry</option>
                          <option>Technical Support</option>
                          <option>Sales Question</option>
                          <option>Partnership</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D705C] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[1.5px]">Message</label>
                    <textarea
                      required
                      maxLength={500}
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`${inputClass} resize-none`}
                      placeholder="How can we help you?"
                    ></textarea>
                    <div className="text-right text-[11px] text-[#5D705C] font-medium tracking-wide">
                      {formData.message.length} / 500
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[#1c4a38] text-white border-0 rounded-[10px] px-7 py-4 text-[14px] font-bold tracking-[0.5px] hover:bg-[#1A3C2E] active:scale-95 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-4 h-4" /></>}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-[#E8F5EE] text-[#2D6A4F] rounded-full flex items-center justify-center mx-auto border border-[#C5D5C0]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-[28px] font-bold text-[#1A3C2E]">Message Sent!</h3>
                  <p className="text-[#5D705C] font-medium max-w-md mx-auto text-[15px]">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 inline-block text-[12px] font-bold text-[#2D6A4F] uppercase tracking-[1px] hover:text-[#1A3C2E] border-b border-[#2D6A4F] hover:border-[#1A3C2E] transition-all cursor-pointer pb-0.5"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-6 mt-32">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E8F5EE] border border-[#C5D5C0] rounded-full text-[#2D6A4F] text-[11px] font-bold uppercase tracking-[3px]">
              FAQ
            </div>
            <h2 className="text-[36px] font-bold text-[#1A3C2E] tracking-tight">Common Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white border border-[#E8E2D9] rounded-[16px] overflow-hidden hover:border-[#C5D5C0] transition-colors shadow-sm"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-bold text-[#1A3C2E] text-[15px] group-hover:text-[#2D6A4F] transition-colors">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-[#5D705C] group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-6 text-[#5D705C] text-[14px] leading-relaxed border-t border-[#F5F0E8] pt-4 font-medium">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <div className="max-w-[1200px] mx-auto px-6 mt-32">
          <div className="w-full rounded-[24px] overflow-hidden relative border border-[#E8E2D9] shadow-sm bg-white">
            <div className="grid gap-0 md:grid-cols-[1.3fr_0.9fr]">
              <div className="relative min-h-[400px] bg-[linear-gradient(135deg,#f7f2ea_0%,#edf7f1_100%)] p-8 md:p-10">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#1A3C2E 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10 max-w-xl space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#C5D5C0] bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-[#2D6A4F]">
                    <MapPin className="h-3.5 w-3.5" />
                    Visit SARTHI
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-[32px] font-bold tracking-tight text-[#1A3C2E]">Baridih, Jamshedpur</h2>
                    <p className="max-w-lg text-[15px] font-medium leading-7 text-[#5A7065]">
                      Our team works out of Baridih, Jamshedpur, Jharkhand 831017. If you are planning to visit, share your preferred time and we will help coordinate the fastest route and the right person to meet.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-[#E8E2D9] bg-white/80 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#5D705C]">Office Hours</p>
                      <p className="mt-2 text-[15px] font-bold text-[#1A3C2E]">Mon to Fri, 9 AM to 6 PM IST</p>
                    </div>
                    <div className="rounded-[18px] border border-[#E8E2D9] bg-white/80 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#5D705C]">Visitor Note</p>
                      <p className="mt-2 text-[15px] font-bold text-[#1A3C2E]">Appointments help us host you better</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[400px] flex-col justify-between border-t border-[#E8E2D9] bg-[#FCFAF6] p-8 md:border-l md:border-t-0 md:p-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#5D705C]">Open In Maps</p>
                    <p className="mt-3 text-[15px] font-medium leading-7 text-[#5A7065]">
                      We removed the blocked embedded map and replaced it with a direct map handoff, which is faster, cleaner, and works reliably under the current content security policy.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-[#E8E2D9] bg-white p-5 shadow-sm">
                    <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#1A3C2E]">SARTHI HQ</p>
                    <p className="mt-3 text-[14px] leading-7 text-[#5A7065]">
                      Baridih, Jamshedpur
                      <br />
                      Jharkhand - 831017
                      <br />
                      India
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Baridih%2C+Jamshedpur%2C+Jharkhand+831017"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#1c4a38] px-6 py-4 text-[13px] font-bold uppercase tracking-[1px] text-white transition-all hover:bg-[#163a2c]"
                >
                  Open Google Maps
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Assist */}
        <section className="mt-24 text-center">
          <p className="text-[#1A3C2E] font-bold mb-6 text-[15px]">
            Need immediate assistance? Call us at <a href="tel:+919835019509" className="text-[#2D6A4F] hover:text-[#1A3C2E] transition-colors underline decoration-[#C5D5C0] underline-offset-4">+91 98350 19509</a>
          </p>
          <div className="flex justify-center gap-4">
            <SocialIcon icon={<Linkedin className="w-4 h-4 shadow-sm" />} href="https://linkedin.com/company/sarthi" label="Visit SARTHI on LinkedIn" />
            <SocialIcon icon={<Twitter className="w-4 h-4 shadow-sm" />} href="https://twitter.com/sarthi" label="Visit SARTHI on Twitter" />
          </div>
        </section>
      </main>
    </div>
  );
}

function ContactCard({ icon, title, lines, delay }: { icon: React.ReactNode; title: string; lines: string[]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white border border-[#E8E2D9] rounded-[20px] p-8 text-center flex flex-col items-center group hover:shadow-[0_16px_40px_rgba(26,60,46,0.08)] hover:-translate-y-[6px] transition-all duration-300 gpu-accelerated cursor-pointer"
    >
      <div className="w-[52px] h-[52px] bg-[#E8F5EE] rounded-[14px] flex items-center justify-center mb-6 text-[#2D6A4F] border border-[#C5D5C0] group-hover:bg-[#1A3C2E] group-hover:text-white group-hover:border-[#1A3C2E] transition-colors duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-[#1A3C2E] uppercase tracking-[1px] mb-3">{title}</h3>
        <div className="space-y-1.5">
          {lines.map((line, idx) => (
            <p key={idx} className="text-[13px] text-[#5D705C] font-medium leading-[1.4]">
              {line}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SocialIcon({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center text-[#5D705C] hover:text-[#1A3C2E] border border-[#E8E2D9] hover:border-[#2D6A4F] transition-all hover:shadow-[0_4px_12px_rgba(45,106,79,0.1)] hover:-translate-y-0.5"
    >
      {icon}
    </a>
  );
}

