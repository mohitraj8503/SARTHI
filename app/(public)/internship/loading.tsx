import { Search, Zap, Clock, Users } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#F5F0E8] overflow-hidden">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-[0.012]"
            style={{ backgroundImage: 'radial-gradient(#1A3C2E 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container mx-auto max-w-screen-xl pt-16 pb-32 relative z-10 px-6 md:px-12" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Skeleton Header */}
        <header className="mb-20 pt-0">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[#E8E2D9] pb-16">
                <div className="max-w-2xl space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#2D6A4F]/20 rounded-full animate-pulse" />
                        <div className="h-4 w-32 bg-[#1A3C2E]/[0.05] rounded-full animate-pulse" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="h-16 w-[300px] md:w-[500px] bg-[#1A3C2E]/[0.08] rounded-2xl animate-pulse" />
                        <div className="h-16 w-[200px] md:w-[400px] bg-[#1A3C2E]/[0.04] rounded-2xl animate-pulse" />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="h-4 w-full max-w-md bg-[#1A3C2E]/[0.03] rounded-full animate-pulse" />
                        <div className="h-4 w-2/3 max-w-md bg-[#1A3C2E]/[0.03] rounded-full animate-pulse" />
                    </div>
                </div>

                <div className="flex-1 max-w-[400px] w-full h-[60px] bg-white border border-[#E8E2D9] rounded-2xl animate-pulse" />
             </div>
        </header>

        {/* Skeleton Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 items-start">
            <aside className="hidden lg:block space-y-12 h-64 w-full bg-white/40 border border-[#E8E2D9] rounded-[32px] animate-pulse" />

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-[#E8E2D9] rounded-[28px] h-[450px] p-8 md:p-10 space-y-10">
                        <div className="w-full aspect-[16/10] bg-[#1A3C2E]/[0.03] rounded-2xl animate-pulse" />
                        <div className="space-y-6 pt-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-24 bg-[#1A3C2E]/[0.05] rounded-full animate-pulse" />
                                <div className="h-4 w-24 bg-[#1A3C2E]/[0.05] rounded-full animate-pulse" />
                            </div>
                            <div className="h-10 w-full bg-[#1A3C2E]/[0.08] rounded-xl animate-pulse" />
                            <div className="h-12 w-full bg-[#1A3C2E]/[0.03] rounded-xl animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

