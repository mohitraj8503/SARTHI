'use client';

import { Printer, Download } from 'lucide-react';

export default function PrintButton() {
  return (
    <div className="flex items-center justify-center gap-4 mt-8 print:hidden">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <Printer className="w-5 h-5" />
        Print Invoice
      </button>
      <button
        onClick={() => {
          // Trigger print which allows saving as PDF usually
          window.print();
        }}
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-100 transform hover:-translate-y-0.5"
      >
        <Download className="w-5 h-5" />
        Download PDF
      </button>
    </div>
  );
}

