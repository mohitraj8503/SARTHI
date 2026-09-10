
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterTabsProps {
  categories: string[];
  currentCategory: string;
}

export default function FilterTabs({ categories, currentCategory }: FilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-5 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
            currentCategory === category
              ? "bg-premium-primary text-white shadow-[0_8px_16px_rgba(15,23,42,0.15)]"
              : "bg-white text-premium-muted border border-premium-border hover:border-premium-primary hover:text-premium-primary"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

