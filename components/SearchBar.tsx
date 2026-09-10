
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [query, pathname, replace, searchParams]);

  return (
    <div className="relative w-full md:w-96 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={`h-4 w-4 ${isPending ? 'text-premium-muted animate-pulse' : 'text-premium-muted'} group-focus-within:text-premium-accent transition-colors`} />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3 border border-premium-border rounded-xl bg-white text-premium-text placeholder-premium-muted focus:outline-none focus:ring-4 focus:ring-premium-accent/5 focus:border-premium-accent transition-all duration-300 sm:text-sm shadow-sm hover:shadow-md"
        placeholder="Explore courses, skills..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}

