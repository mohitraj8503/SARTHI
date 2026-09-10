import { prisma } from '@/lib/prisma';
import { Search, ChevronRight, MessageSquare, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { FAQItem } from '@/components/help/FAQItem';

export const dynamic = 'force-dynamic';

/**
 * Intelligent Help Center & FAQ Hub
 * Features search-first architecture and categorization for rapid support.
 */
export default async function HelpCenterPage(
  props: { 
    searchParams: Promise<{ q?: string }> 
  }
) {
  const searchParams = await props.searchParams;
  const query = searchParams.q?.toLowerCase();

  const faqs = await prisma.fAQ.findMany({
    where: query ? {
      OR: [
        { question: { contains: query } },
        { answer: { contains: query } },
        { category: { contains: query } }
      ]
    } : {},
    orderBy: { helpfulCount: 'desc' },
    take: 50
  });

  const categories = [...new Set(faqs.map(f => f.category))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-emerald-900 pt-32 pb-24 px-6 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">How can we help you today?</h1>
          <p className="text-emerald-100/60 font-medium max-w-xl mx-auto">
            Search our knowledge base for instant answers to common questions about missions, payments, and certificates.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
          <form action="/help" method="GET">
            <input 
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search help articles..."
              className="w-full h-18 bg-white border-none rounded-[2rem] pl-16 pr-6 text-slate-900 shadow-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
            />
          </form>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {/* Categorized FAQs */}
          {categories.map(cat => (
            <div key={cat} className="space-y-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{cat}</h2>
              <div className="grid gap-4">
                {faqs.filter(f => f.category === cat).map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border border-slate-100">
              <h3 className="text-lg font-black text-slate-900">No matching articles found</h3>
              <p className="text-slate-400 text-sm font-medium">Try different keywords or browse common topics.</p>
              <Link href="/help" className="inline-block text-emerald-600 font-black uppercase tracking-widest text-[10px]">Reset Search</Link>
            </div>
          )}

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                <Mail size={24} />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">Email Us</h4>
              <p className="text-xs font-medium text-slate-400">Response within 24h</p>
              <a href="mailto:support@sarthi.in" className="block text-sm font-bold text-slate-900 hover:text-emerald-600">support@sarthi.in</a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                <Phone size={24} />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">Call Support</h4>
              <p className="text-xs font-medium text-slate-400">10 AM - 6 PM IST</p>
              <a href="tel:+917061600818" className="block text-sm font-bold text-slate-900 hover:text-emerald-600">+91-7061600818</a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                <MessageSquare size={24} />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">Live Chat</h4>
              <p className="text-xs font-medium text-slate-400">Instant assistance</p>
              <button className="text-sm font-bold text-slate-900 hover:text-emerald-600">Start Conversation</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
