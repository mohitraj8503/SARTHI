import { AlertTriangle } from 'lucide-react';

export default function DemoBadge() {
    const isDemo = process.env.DEMO_MODE === 'true';

    if (!isDemo) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full shadow-lg animate-pulse pointer-events-none">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Demo Data</span>
        </div>
    );
}

