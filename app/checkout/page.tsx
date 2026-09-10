'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseId = searchParams.get('course');
  const ref = searchParams.get('ref');
  const token = searchParams.get('token');
  const price = searchParams.get('price');
  const original = searchParams.get('original');

  useEffect(() => {
    if (courseId) {
      const query = new URLSearchParams();
      if (ref) query.set('ref', ref);
      if (token) query.set('token', token);
      if (price) query.set('price', price);
      if (original) query.set('original', original);
      
      const queryString = query.toString();
      router.replace(`/checkout/${courseId}${queryString ? `?${queryString}` : ''}`);
    } else {
      router.replace('/');
    }
  }, [courseId, ref, token, price, original, router]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
