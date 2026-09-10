'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, X, Mic, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getChatMemory, addToHistory, ADMIN_NAME, saveChatMemory } from '@/lib/chat-memory';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  correctedQuery?: string;
}

export default function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- INITIALIZE MEMORY ---
  useEffect(() => {
    const mem = getChatMemory();
    setMemory(mem);
    
    // Load history or welcome
    if (mem.conversationHistory.length > 0) {
      const history = mem.conversationHistory.map((h: any, i: number) => [
        { id: `h-u-${i}`, role: 'user' as const, content: h.userQuery, timestamp: new Date(h.timestamp) },
        { id: `h-a-${i}`, role: 'assistant' as const, content: h.aiResponse, timestamp: new Date(h.timestamp) }
      ]).flat();
      setMessages(history);
    } else {
      setMessages([{
        id: '1', role: 'assistant', timestamp: new Date(),
        content: `Online. Ready to help, ${ADMIN_NAME}.`
      }]);
    }
  }, []);

  // --- AUTO SCROLL ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- VOICE INPUT ---
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (err: any) => {
      console.error('Mic error:', err.error);
      setIsListening(false);
      if (err.error === 'not-allowed') {
        alert("Microphone access denied. Please allow mic access in settings.");
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Recognition start failed:', e);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      startListening();
    }
  };

  // --- SEND HANDLER ---
  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;

    // Small talk / Identity handling
    const q = query.toLowerCase();
    if (q.includes('who am i') || q.includes('mera naam') || q.includes('my name')) {
      const resp = `You're ${ADMIN_NAME}, the platform administrator.`;
      const uMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: query, timestamp: new Date() };
      const aMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'assistant', content: resp, timestamp: new Date() };
      setMessages(prev => [...prev, uMsg, aMsg]);
      addToHistory(query, resp);
      setInput('');
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "No data available.",
        suggestions: data.suggestions,
        correctedQuery: data.correctedQuery,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      addToHistory(query, data.answer);
      
      // Update local memory state for name recognition
      const updatedMem = { ...memory, preferences: { ...memory.preferences, lastQuery: query } };
      setMemory(updatedMem);
      saveChatMemory(updatedMem);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Unable to fetch data. Check system status.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return (
    <motion.button 
      layoutId="chat-box"
      onClick={() => setIsOpen(true)}
      className="fixed bottom-8 right-8 w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center z-50 shadow-2xl hover:scale-110 transition-all group border border-white/10"
    >
      <div className="absolute inset-[-4px] bg-orange-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative w-full h-full rounded-full flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden z-10 shadow-lg">
          <Image src="/sarthi-logo.png" alt="TT" width={64} height={64} className="w-[80%] h-[80%] object-contain" />
        </div>
      </div>
    </motion.button>
  );

  return (
    <AnimatePresence>
      <motion.div 
        layoutId="chat-box"
        className={cn(
          "fixed bottom-6 right-6 z-[100] flex flex-col bg-white rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden transition-all duration-500",
          isExpanded ? "w-[600px] h-[800px]" : "w-[380px] h-[580px]"
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                <Image src="/sarthi-logo.png" alt="SARTHI" width={36} height={36} className="w-[75%] h-[75%] object-contain" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">Admin Intelligence</h3>
              <p className="text-[10px] text-gray-400 mt-1">Ready to assist, {ADMIN_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mb-1">
                    <Image src="/sarthi-logo.png" alt="AI" width={24} height={24} className="w-[70%] h-[70%] object-contain" />
                  </div>
                )}
                
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all whitespace-pre-wrap",
                  msg.role === 'user' 
                    ? "bg-gray-900 text-white rounded-tr-none font-medium" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium"
                )}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 mb-1">
                    <Image src="/images/mukul-pandey.jpg" alt="Mukul" width={24} height={24} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {msg.correctedQuery && (
                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-[10px] text-gray-400 font-medium">Did you mean:</span>
                  <button 
                    onClick={() => handleSend(msg.correctedQuery!)}
                    className="px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    {msg.correctedQuery}
                  </button>
                </div>
              )}

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {msg.suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(s)}
                      className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                <Image src="/sarthi-logo.png" alt="AI" width={24} height={24} className="w-[70%] h-[70%] object-contain" />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-white border-t border-gray-50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="flex items-center gap-2 bg-gray-50/80 px-4 py-2.5 rounded-2xl border border-gray-100 transition-all focus-within:bg-white focus-within:shadow-sm focus-within:border-gray-200"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-2 rounded-full transition-all",
                isListening ? "bg-red-50 text-red-500 scale-110 animate-pulse" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              )}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <Mic size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask about revenue, users..."}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-gray-900 text-white rounded-xl disabled:opacity-20 hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

