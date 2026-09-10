'use client';

import React from 'react';
import SummerCampCertificate from '@/components/SummerCampCertificate';

export default function TestCertificatePage() {
  return (
    <div className="min-h-screen bg-slate-900 pt-28 px-10 pb-16 flex flex-col items-center">
      <h1 className="text-white text-3xl font-bold mb-8">SARTHI Summer Camp Certificate Preview</h1>
      <div className="w-full max-w-[1200px] shadow-2xl">
        <SummerCampCertificate 
          studentName="Mohit Raj"
          campName="SARTHI SUMMER CAMP 2026"
          completionDate="June 20, 2026"
          credentialId="TT-SC-2026-0814"
        />
      </div>
      <div className="mt-10">
        <button 
          onClick={() => window.print()}
          className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}


