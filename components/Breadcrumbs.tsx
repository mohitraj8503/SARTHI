'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname() || '';
  const segments = pathname.split('/').filter(Boolean);

  // Don't show on root admin dashboard where the title is redundant
  if (pathname === '/admin') return null;

  return (
    <nav className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
      <Link
        href="/admin"
        className="hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-900/10 p-1.5 rounded-lg transition-all"
      >
        <Home className="w-4 h-4" />
      </Link>

      {segments.slice(1).map((segment, index) => {
        const href = `/admin/${segments.slice(1, index + 2).join('/')}`;
        const isLast = index === segments.length - 2;

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            <Link
              href={href}
              className={`
                                capitalize px-2 py-1 rounded-lg transition-all
                                ${isLast
                  ? 'font-semibold text-gray-900 dark:text-white bg-gray-100/50 dark:bg-gray-800/50'
                  : 'hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-900/10'
                }
                            `}
            >
              {segment.replace(/-/g, ' ')}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

