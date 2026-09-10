'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, User, X, MessageSquare, Maximize2, Minimize2, Download, Mic, Bell, RefreshCcw, Zap, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    type: 'metric' | 'text' | 'chart' | 'suggestion' | 'clarification';
    label?: string;
    value?: number | string;
    displayValue?: string;
    trend?: number;
    suggestions?: string[];
    error?: string | null;
  }
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Namaste! I'm SARTHI AI. Ask me anything about revenue, users, or courses! 👋", 
      metadata: { type: 'text' } 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowNotification(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isFullScreen]);

  const handleSend = async (customQuery?: string) => {
    const queryToSend = customQuery || input;
    if (!queryToSend.trim() || isTyping) return;

    const userMessage = queryToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });
      const data = await res.json();
      
      if (data.error || !data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.answer || "I encountered a synchronization glitch. Please try again.", 
          metadata: { type: 'text', error: data.error || 'ERROR' } 
        }]);
        return;
      }

      const aiResponse = data.answer;
      if (typeof aiResponse === 'object') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse.content, 
          metadata: { ...aiResponse, type: data.type, suggestions: data.suggestions } 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse, 
          metadata: { type: data.type, suggestions: data.suggestions } 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Neural link severed. Please check your connection. 📡", 
        metadata: { type: 'text', error: 'NETWORK_ERROR' } 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const initialSuggestions = [
    "Revenue Analysis",
    "Active Users",
    "Growth Trends",
    "Course Metrics"
  ];

  if (!mounted) return null;

  const content = (
    <>
      {/* Background Dim & Blur Overlay when Open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9998] animate-in fade-in duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed z-[9999] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isFullScreen ? "inset-0 flex items-center justify-center p-4" : "bottom-6 right-6 flex flex-col items-end"
      )}>
        {/* Floating Trigger Button */}
        {!isOpen && !isFullScreen && (
          <div className="relative group">
            {showNotification && (
              <div className="absolute bottom-20 right-0 w-72 bg-white shadow-2xl rounded-2xl p-5 animate-in slide-in-from-bottom-4 fade-in duration-500 border border-slate-100 z-[10000] cursor-pointer" onClick={() => setIsOpen(true)}>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-500 text-white rounded-xl">
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">System Ready</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">I&apos;ve analyzed the latest platform data. Want to see the growth trends?</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}
                  className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <button
              onClick={() => { setIsOpen(true); setShowNotification(false); }}
              className="w-16 h-16 bg-[#1a1a2e] rounded-full flex items-center justify-center text-orange-500 shadow-2xl hover:scale-110 transition-all duration-300 group relative"
            >
              <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-ping opacity-20" />
              <Bot className="w-8 h-8 relative z-10" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border-4 border-white rounded-full" />
            </button>
          </div>
        )}

        {/* Main Assistant Panel */}
        {isOpen && (
          <div className={cn(
            "bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-500 ease-out",
            isFullScreen 
              ? "w-full h-full max-w-5xl max-h-[90vh] rounded-3xl" 
              : "w-[380px] h-[580px] rounded-2xl border border-slate-100"
          )}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4 flex items-center justify-between shadow-lg relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-inner">
                    <Bot size={22} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1a1a2e] rounded-full" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white leading-tight">AI Assistant</h3>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title={isFullScreen ? "Minimize" : "Fullscreen"}
                >
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-slate-50/50 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mb-5 shadow-sm">
                      <Bot size={16} className="text-slate-600" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col gap-1.5",
                    msg.role === 'user' ? "items-end max-w-[85%]" : "items-start max-w-[85%]"
                  )}>
                    <div className={cn(
                      "px-4 py-3 text-[13.5px] leading-relaxed shadow-sm",
                      msg.role === 'assistant' 
                        ? (msg.metadata?.error 
                            ? "bg-[#FFF0F0] text-red-800 border-l-4 border-[#E53E3E] rounded-[18px] rounded-tl-none" 
                            : "bg-white text-slate-800 border border-slate-100 rounded-[18px] rounded-tl-none")
                        : "bg-orange-500 text-white rounded-[18px] rounded-tr-none font-medium"
                    )}>
                      {msg.content}
                      
                      {/* Metric Data In-Line */}
                      {msg.metadata?.type === 'metric' && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{msg.metadata.label}</p>
                          <p className="text-3xl font-black text-slate-900 tracking-tight">{msg.metadata.displayValue}</p>
                          {msg.metadata.trend && (
                            <div className={cn(
                              "flex items-center gap-1 text-[11px] font-bold mt-2",
                              msg.metadata.trend > 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              <TrendingUp size={12} className={cn(msg.metadata.trend < 0 && "rotate-180")} />
                              {Math.abs(msg.metadata.trend)}% from last week
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Suggestions within bot message */}
                    {msg.role === 'assistant' && msg.metadata?.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-1">
                        {msg.metadata.suggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => handleSend(s)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-[11px] font-bold hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm active:scale-95"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 font-medium px-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-end gap-2.5 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mb-1">
                    <Bot size={16} className="text-slate-600" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-slate-100 rounded-[18px] rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar Section */}
            <div className="p-4 border-t border-slate-100 bg-white relative z-10">
              {/* Quick Action Pills */}
              {messages.length < 3 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {initialSuggestions.map(s => (
                    <button 
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[11px] font-bold hover:bg-orange-100 hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles size={12} className="text-orange-400" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                className="flex items-center gap-2.5"
              >
                <div className="relative flex-1 group">
                  <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask anything about your platform..."
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/5 rounded-full outline-none text-[13.5px] text-slate-800 placeholder:text-slate-400 transition-all shadow-inner"
                  />
                  <button 
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-all"
                  >
                    <Mic size={16} />
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-11 h-11 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-orange-500/20 flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
              
              <div className="flex justify-center items-center gap-3 mt-3 opacity-20">
                <div className="w-8 h-px bg-slate-300" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered by SARTHI AI</p>
                <div className="w-8 h-px bg-slate-300" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(content, document.body);
}

