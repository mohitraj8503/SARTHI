"use client";

import React, { useState } from "react";
import ReceiptSuccessModal from "@/components/payments/ReceiptSuccessModal";

export default function PaymentReceiptDemoPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-250 inline-block shadow-sm">
            TACTILE RECEIPT DEMO
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Payment Complete Preview
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Click the button below to test the tactile receipt printer animation. This simulates the exact experience a user gets immediately after a successful Razorpay payment.
          </p>
        </div>

        <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm text-left uppercase tracking-wider">
            Mock Payment Config
          </h3>
          <div className="space-y-2 text-xs text-left text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Merchant</span>
              <span className="font-bold text-slate-800">SARTHI</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Currency</span>
              <span className="font-bold text-slate-800">INR (₹)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Amount</span>
              <span className="font-bold text-emerald-600">₹1,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Course</span>
              <span className="font-bold text-slate-800">Python Summer Masterclass</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl transition-all shadow-lg hover:shadow-emerald-950/20 text-sm uppercase tracking-wider cursor-pointer active:scale-95 border border-emerald-500/20"
        >
          ⚡ Start Receipt Animation
        </button>
      </div>

      <ReceiptSuccessModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Python Summer Masterclass"
        amount="₹1,000"
        actionLabel="Enter Dashboard"
        onAction={() => setIsOpen(false)}
        details={[
          { label: "Candidate", value: "Aarav Sharma" },
          { label: "Email", value: "aarav.sharma@gmail.com" },
          { label: "Payment ID", value: "pay_RZP8917265", isMono: true },
          { label: "Order ID", value: "order_SC26_928", isMono: true },
          { label: "Program", value: "Summer Camp 2026" },
        ]}
      />
    </div>
  );
}
