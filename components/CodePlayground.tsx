'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal, Code2, Globe, Cpu, Zap, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodePlayground() {
  const [code, setCode] = useState(`class SARTHI:\n    def __init__(self):\n        self.mission = "Accessible Education"\n        self.status = "Innovating"\n\n    def execute(self):\n        return f"Status: {self.status} | Mission: {self.mission}"\n\ntt = SARTHI()\nprint(tt.execute())`);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState('Python');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const runCode = () => {
    setIsRunning(true);
    // Add realistic system logs before final output
    setOutput(prev => [...prev, `[SYSTEM] Initializing ${activeLang} runtime...`, `[SYSTEM] Allocated 512MB memory...`]);

    setTimeout(() => {
      let finalOutput = '';
      if (code.includes('print')) {
        if (code.includes('execute')) {
          finalOutput = "Status: Innovating | Mission: Accessible Education";
        } else if (code.includes('sum') || code.includes('+')) {
          finalOutput = "Result: 30";
        } else {
          finalOutput = "Process finished with exit code 0";
        }
      } else {
        finalOutput = "> Code executed. No standard output.";
      }

      setOutput(prev => [...prev, `> ${finalOutput}`]);
      setIsRunning(false);
    }, 1200);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0E] text-[#E0E0E0] font-inter rounded-[24px] overflow-hidden border border-[#2A2A2E] shadow-2xl relative group">
      {/* GLOW EFFECT */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#D4956A]/0 via-[#D4956A]/5 to-[#D4956A]/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#161618] border-b border-[#2A2A2E] z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm shadow-[#FF5F56]/20" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm shadow-[#FFBD2E]/20" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm shadow-[#27C93F]/20" />
          </div>
          <div className="h-4 w-px bg-[#2A2A2E] mx-2" />
          <div className="flex items-center gap-4">
            {['Python', 'JavaScript', 'SQL'].map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`text-[11px] font-black uppercase tracking-[2px] transition-all ${activeLang === lang ? 'text-[#D4956A]' : 'text-[#5D705C] hover:text-[#E0E0E0]'
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyCode}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-[#5D705C] hover:text-[#E0E0E0] flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="p-2 hover:bg-white/5 rounded-xl text-[#5D705C] transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 z-10">
        {/* Editor */}
        <div className="flex-1 relative flex flex-col">
          <div className="absolute top-4 left-4 flex flex-col gap-1 text-[#2A2A2E] select-none text-[12px] font-mono leading-relaxed">
            {Array.from({ length: 15 }).map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent text-[#D4D4D4] pl-12 pr-6 py-4 outline-none resize-none font-mono text-[14px] leading-relaxed selection:bg-[#D4956A]/30"
            spellCheck={false}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            disabled={isRunning}
            className="absolute bottom-6 right-6 bg-[#D4956A] text-[#1A3C2E] px-6 py-3 rounded-2xl shadow-xl shadow-[#D4956A]/20 flex items-center gap-3 text-[12px] font-black uppercase tracking-[2px] transition-all disabled:opacity-50"
          >
            {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Compile & Execute
          </motion.button>
        </div>

        {/* Console */}
        <div className="h-2/5 md:h-auto md:w-[320px] bg-[#09090A] border-t md:border-t-0 md:border-l border-[#2A2A2E] flex flex-col">
          <div className="px-6 py-4 border-b border-[#2A2A2E] flex items-center justify-between bg-[#111113]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#D4956A]" />
              <span className="text-[10px] font-black uppercase tracking-[2px] text-[#5D705C]">Standard Output</span>
            </div>
            <button onClick={() => setOutput([])} className="text-[#5D705C] hover:text-[#E0E0E0] p-1">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 p-6 font-mono text-[13px] overflow-y-auto space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {output.length === 0 && !isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#2A2A2E] flex flex-col items-center justify-center h-full text-center gap-3"
                >
                  <Cpu className="w-8 h-8 opacity-20" />
                  <p className="max-w-[120px]">Ready for execution...</p>
                </motion.div>
              )}
              {output.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${line.startsWith('[') ? 'text-[#5D705C]' : 'text-emerald-400 font-bold'}`}
                >
                  {line}
                </motion.div>
              ))}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-[#D4956A] animate-pulse"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Compiling binary...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

