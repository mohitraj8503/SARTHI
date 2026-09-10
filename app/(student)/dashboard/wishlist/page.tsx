'use client';

import { useState, useEffect } from 'react';
import { PageHeader, EmptyState } from '@/components/ui/DashboardUI';
import { Heart, Search, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/student/wishlist');
      const data = await res.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Fetch wishlist failed');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (courseId: string) => {
    try {
      const res = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      if (res.ok) {
        setWishlist(wishlist.filter((item: any) => item.course.id !== courseId));
      }
    } catch (error) {
      console.error('Remove failed');
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      <PageHeader 
        title="MY WISHLIST" 
        subtitle="Saved professional tracks for your future learning journey."
      />

      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-12 h-12 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <EmptyState 
            icon={<Heart className="w-12 h-12 text-gray-200" />}
            title="Wishlist is Empty"
            message="You haven't saved any specializations yet. Browse our catalog to find your next professional challenge."
            buttonText="Browse Catalog"
            buttonHref="/courses"
            buttonIcon={<Search className="w-5 h-5" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <AnimatePresence mode='popLayout'>
              {wishlist.map((item: any, idx: number) => (
                <motion.div 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden h-[180px] md:h-auto">
                    {item.course.thumbnail ? (
                      <Image src={item.course.thumbnail} alt={item.course.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-[#1B4332]/5 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[#1B4332]/10" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeItem(item.course.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <h3 className="text-[18px] md:text-xl font-black text-[#1B4332] mb-2 leading-tight uppercase italic line-clamp-2">{item.course.title}</h3>
                    <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest italic opacity-60 mb-6">by {item.course.instructor?.name || 'SARTHI Faculty'}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#D4915C] uppercase tracking-widest italic leading-none mb-1">Tuition_Fee</span>
                        <span className="text-xl font-black text-[#1B4332] italic">₹{item.course.price}</span>
                      </div>
                      <Link 
                        href={`/courses/${item.course.slug || item.course.id}`}
                        className="h-[56px] px-6 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] italic flex items-center justify-center gap-2 hover:bg-[#D4915C] transition-all shadow-xl active:scale-95"
                      >
                        Enroll_Now <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

