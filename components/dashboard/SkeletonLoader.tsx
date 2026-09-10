export function DashboardSkeleton() {
    return (
        <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-12 animate-pulse min-h-screen bg-[#FDFBF7]">
            {/* Top Bar Skeleton */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="h-14 w-full max-w-md bg-white/60 rounded-2xl border border-white shadow-sm" />
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/60 rounded-2xl border border-white shadow-sm" />
                    <div className="h-12 w-48 bg-white/60 rounded-2xl border border-white shadow-sm" />
                </div>
            </div>

            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="h-14 w-80 bg-white/80 rounded-2xl border border-white shadow-md" />
                <div className="h-5 w-[500px] bg-white/40 rounded-lg" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-48 bg-white rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="h-[450px] bg-white rounded-[3.5rem] border border-white shadow-xl shadow-black/5" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="h-96 bg-white rounded-[3.5rem] border border-white shadow-xl shadow-black/5" />
                        <div className="h-96 bg-white rounded-[3.5rem] border border-white shadow-xl shadow-black/5" />
                    </div>
                </div>
                <div className="space-y-10">
                    <div className="h-72 bg-white rounded-[3rem] border border-white shadow-xl shadow-black/5" />
                    <div className="h-[400px] bg-white rounded-[3rem] border border-white shadow-xl shadow-black/5" />
                </div>
            </div>
        </div>
    );
}

