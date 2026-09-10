'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Cmd+K
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    window.addEventListener('open-command-palette', handleOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpen);
    }
  }, []);

  // Debounced API Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success && json.data?.results) {
          setResults(json.data.results);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Global search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Mock search results (as fallback when search query is empty)
  const quickActions = [
    { label: 'Go to Students', href: '/admin/students', type: 'Navigation' },
    { label: 'Go to Courses', href: '/admin/courses', type: 'Navigation' },
    { label: 'Go to Teachers', href: '/admin/teachers', type: 'Navigation' },
    { label: 'Verify Payments', href: '/admin/payments', type: 'Action' },
    { label: 'Settings', href: '/admin/settings', type: 'System' },
  ];

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Search Trigger Input (Visual Only) */}
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="relative w-full group cursor-pointer"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors" />
        <div className="w-full pl-12 pr-12 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 text-gray-400 text-sm flex items-center justify-between hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
          <span>Search students, courses, payments...</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-xs font-mono font-medium">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[60vh]"
            >
              <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownInput}
                  className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder:text-gray-400"
                />
                <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-500">
                  ESC
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-gray-300 border-t-brand-orange rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-wider font-semibold">Searching...</p>
                  </div>
                ) : query.trim().length >= 2 ? (
                  results.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                        Search Results
                      </div>
                      {results.map((item) => (
                        <button
                          key={`${item.type}-${item.id}`}
                          onClick={() => handleSelect(item.url)}
                          className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-brand-orange group-hover:text-white transition-colors uppercase font-bold text-xs">
                              {item.type?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      <p>No results found for &quot;{query}&quot;</p>
                    </div>
                  )
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                      Quick Actions
                    </div>
                    {filteredActions.map((action) => (
                      <button
                        key={action.href}
                        onClick={() => handleSelect(action.href)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                            {action.type === 'Navigation' ? <ArrowRight className="w-4 h-4" /> : <Command className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                            <p className="text-xs text-gray-500">{action.type}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
