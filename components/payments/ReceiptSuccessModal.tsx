"use client";

import React, { useEffect, useState } from "react";
import { ReceiptPrinter, type ReceiptPrinterStage } from "../ReceiptPrinter";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Download } from "lucide-react";
import confetti from "canvas-confetti";

interface ReceiptSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: string;
  details: { label: string; value: string; isMono?: boolean }[];
  actionLabel?: string;
  onAction?: () => void;
}

let activeAudio: HTMLAudioElement | null = null;

const playPrinterSound = (durationMs: number) => {
  if (typeof window === "undefined") return;
  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    
    const audio = new Audio("/sounds/printer.mp3");
    audio.volume = 0.4;
    audio.playbackRate = 1.5;
    activeAudio = audio;
    
    audio.play().catch(err => console.log("Audio playback blocked/failed:", err));
    
    // Stop playing after the duration has completed
    setTimeout(() => {
      if (activeAudio === audio) {
        audio.pause();
        activeAudio = null;
      }
    }, durationMs);
  } catch (err) {
    console.error("Audio error:", err);
  }
};

const playSuccessSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, delay: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 1.2);
    };
    
    playTone(523.25, 0, 0.12); // C5
    playTone(659.25, 0.06, 0.10); // E5
    playTone(783.99, 0.12, 0.08); // G5
  } catch (err) {
    console.error("Audio error:", err);
  }
};

export default function ReceiptSuccessModal({
  isOpen,
  onClose,
  title,
  amount,
  details,
  actionLabel = "Continue to Portal",
  onAction,
}: ReceiptSuccessModalProps) {
  const [stage, setStage] = useState<ReceiptPrinterStage>("processing");

  useEffect(() => {
    if (!isOpen) return;

    setStage("processing");

    // Phase 1: Processing -> Printing
    const printTimer = setTimeout(() => {
      setStage("printing");
      playPrinterSound(2000); // Trigger printing sound (2.0s)
    }, 100);

    // Phase 2: Printing -> Complete
    const completeTimer = setTimeout(() => {
      setStage("complete");
      playSuccessSound(); // Trigger chime sound
      // Left side cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: ["#1B4332", "#D4AF37", "#22C55E", "#3B82F6"],
      });
      // Right side cannon
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: ["#1B4332", "#D4AF37", "#22C55E", "#3B82F6"],
      });
      // Delayed center explosion
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.45 },
          colors: ["#1B4332", "#D4AF37", "#22C55E", "#3B82F6"],
        });
      }, 300);
    }, 2100);

    return () => {
      clearTimeout(printTimer);
      clearTimeout(completeTimer);
      if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 overflow-y-auto pt-10 sm:pt-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (stage === "complete") onClose();
          }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 14, stiffness: 220 }}
          className="relative w-full max-w-md bg-transparent"
        >
          <ReceiptPrinter.Root stage={stage} feedMotion="smooth" className="mx-auto select-none">
            <ReceiptPrinter.Machine className="border-[#1b4332]/40 shadow-2xl">
              <ReceiptPrinter.Header className="px-1 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Secure Payments
                  </span>
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-black">
                  TT-PAY-v2
                </div>
              </ReceiptPrinter.Header>

              <ReceiptPrinter.Screen className="border-[#1b4332]/30 bg-slate-950/90 text-slate-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        PRODUCT / SERVICE
                      </p>
                      <h4 className="font-extrabold text-sm text-white line-clamp-1">
                        {title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        AMOUNT PAID
                      </p>
                      <strong className="text-base font-black text-[#D4AF37]">
                        {amount}
                      </strong>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-800" />

                  <ReceiptPrinter.Status className="text-xs font-bold" />
                </div>
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Machine>

            <ReceiptPrinter.Output>
              <ReceiptPrinter.Paper className="shadow-lg border border-slate-200">
                <div className="text-center space-y-6 text-slate-800">
                  {/* Receipt Header */}
                  <div className="space-y-1">
                    <div className="font-black text-lg tracking-tight uppercase">
                      SARTHI
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Transaction Receipt
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      DATE: {new Date().toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-slate-300 my-4" />

                  {/* Receipt Body */}
                  <div className="space-y-3 text-[11px] font-mono text-left">
                    {details.map((detail, index) => (
                      <div key={index} className="flex justify-between items-start gap-4">
                        <span className="text-slate-400 uppercase shrink-0">{detail.label}</span>
                        <span
                          className={`text-slate-800 font-bold break-all text-right ${
                            detail.isMono ? "tracking-tighter" : ""
                          }`}
                        >
                          {detail.value}
                        </span>
                      </div>
                    ))}

                    <div className="border-t-2 border-dashed border-slate-300 my-4" />

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs font-black uppercase text-slate-800">
                        TOTAL PAID
                      </span>
                      <span className="text-base font-black text-slate-950">
                        {amount}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Footer */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Enrollment Confirmed</span>
                    </div>
                    <p className="text-[9px] text-slate-400 italic">
                      Thank you for choosing SARTHI. Your onboarding credentials will be sent to your registered email shortly.
                    </p>
                  </div>
                </div>
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Root>

          {/* Action Button at the bottom, fades in when complete */}
          <AnimatePresence>
            {stage === "complete" && (
              <div className="mt-6 flex justify-center w-full">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  onClick={() => {
                    if (onAction) onAction();
                    else onClose();
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-lg hover:shadow-emerald-900/20 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-emerald-500/20"
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
