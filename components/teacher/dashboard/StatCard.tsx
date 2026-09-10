import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: "emerald" | "blue" | "amber" | "rose" | "indigo";
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "emerald",
  isLoading
}: StatCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100" />
          <div className="w-16 h-6 bg-slate-100 rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="w-24 h-8 bg-slate-100 rounded-lg" />
          <div className="w-20 h-4 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  const colorStyles = {
    emerald: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
      accent: "from-emerald-400 to-teal-500",
      text: "text-slate-800",
    },
    blue: {
      bg: "bg-blue-50 text-blue-600 border-blue-100/50",
      accent: "from-blue-400 to-indigo-500",
      text: "text-slate-800",
    },
    amber: {
      bg: "bg-amber-50 text-amber-600 border-amber-100/50",
      accent: "from-amber-400 to-orange-500",
      text: "text-slate-800",
    },
    rose: {
      bg: "bg-rose-50 text-rose-600 border-rose-100/50",
      accent: "from-rose-400 to-pink-500",
      text: "text-slate-800",
    },
    indigo: {
      bg: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
      accent: "from-indigo-400 to-purple-500",
      text: "text-slate-800",
    },
  };

  const trendIsPositive = change !== undefined && change >= 0;

  return (
    <div className="relative bg-white rounded-[32px] p-6 lg:p-8 border border-[#EAF0F7] shadow-[0_14px_35px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden stat-card w-full group flex flex-col justify-between min-h-[190px]">
      {/* Dynamic top gradient line */}
      <div className={cn("absolute top-0 left-0 h-[5px] w-full bg-gradient-to-r", colorStyles[color].accent)} />
      
      <div className="flex justify-between items-start mb-5">
        <div className={cn(
          "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border shrink-0",
          colorStyles[color].bg
        )}>
          <Icon className="w-6 h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border transition-all duration-300 shrink-0 shadow-xs",
            trendIsPositive 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100/60" 
              : "bg-rose-50 text-rose-600 border-rose-100/60"
          )}>
            {trendIsPositive ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
            {change}%
          </div>
        )}
      </div>

      <div className="pt-1">
        <h3 className="text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-emerald-600 transition-colors">
          {value ?? "N/A"}
        </h3>
        <p className="text-xs lg:text-[13px] font-black text-slate-400 uppercase tracking-[0.18em] truncate">
          {title}
        </p>
      </div>
    </div>
  );
};

export default React.memo(StatCard);
