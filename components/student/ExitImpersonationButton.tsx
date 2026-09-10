'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExitImpersonationButton() {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleExit = async () => {
    setIsExiting(true);
    try {
      const res = await fetch('/api/auth/exit-impersonation', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          window.location.href = '/mentor/dashboard';
        }
      } else {
        alert('Failed to exit impersonation. Please logout manually.');
        setIsExiting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error exiting impersonation.');
      setIsExiting(false);
    }
  };

  return (
    <button
      onClick={handleExit}
      disabled={isExiting}
      className="ml-4 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider rounded shadow transition-colors disabled:opacity-50"
    >
      {isExiting ? 'Exiting...' : 'Exit Impersonation'}
    </button>
  );
}
