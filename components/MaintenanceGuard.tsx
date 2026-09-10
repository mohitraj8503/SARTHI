"use client";

import { usePathname } from 'next/navigation';

interface Props {
  status: {
    maintenance: boolean;
    dead: boolean;
  };
  children: React.ReactNode;
}

export default function MaintenanceGuard({ status, children }: Props) {
  const pathname = usePathname();

  // 1. ADMIN BYPASS
  // SARTHIIndia must ALWAYS be accessible, even if frontend is "dead"
  if (pathname?.startsWith('/sarthiindia')) {
    return <>{children}</>;
  }

  // 2. DEAD MODE (KILL FRONTEND)
  if (status.dead) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center text-white font-mono p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">CONNECTION_RESET</h1>
          <p className="opacity-50 text-sm">Target host refused connection.</p>
        </div>
      </div>
    );
  }

  // 3. MAINTENANCE MODE
  if (status.maintenance) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl absolute opacity-20 animate-pulse"></div>
        <h1 className="text-3xl font-bold relative z-10">System Maintenance</h1>
        <p className="text-slate-400 mt-4 max-w-md relative z-10 text-sm leading-relaxed">
          SARTHI is currently undergoing critical upgrades. Only authorized personnel can access the root control plane.
          <br /><br />
          We will be back shortly.
        </p>
        <div className="mt-8 text-xs text-slate-600 font-mono">
          STATUS: 503 SERVICE UNAVAILABLE
        </div>
      </div>
    );
  }

  // 4. NORMAL OPERATION
  return <>{children}</>;
}

