'use client'

import { useState } from 'react';
import { ChevronDown, ThumbsUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

/**
 * Accessible FAQ Accordion
 * Features smooth transitions and helpfulness tracking.
 */
export function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState(false);
  const [marked, setMarked] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all hover:border-emerald-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left group"
      >
        <span className="font-black text-slate-900 group-hover:text-emerald-900 transition-colors">{faq.question}</span>
        <ChevronDown 
          className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} 
          size={20} 
        />
      </button>
      
      {isOpen && (
        <div className="px-8 pb-8 space-y-6">
          <div className="text-slate-600 leading-relaxed font-medium text-sm">
            {faq.answer}
          </div>
          
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Was this helpful?</span>
            <button 
              onClick={() => setMarked(true)}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${marked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-900'}`}
            >
              <ThumbsUp size={14} /> {marked ? 'Thank You!' : 'Yes, Helped'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
