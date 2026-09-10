'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { gravity, GravitationalSignature, GravityEvent } from '@/lib/gravity';
import { storage } from '@/lib/storage';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

interface GravityContextType {
  signature: GravitationalSignature | null;
  isGravitationallyBound: boolean;
  constellation: Record<string, 'ONLINE' | 'OFFLINE'>;
}

const GravityContext = createContext<GravityContextType | undefined>(undefined);

// BRUTE FORCE PROTECTION: Global lock to prevent infinite reconnection madness
let _gravityInitialized = false;

export function GravityField({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const [signature, setSignature] = useState<GravitationalSignature | null>(null);
  const [constellation, setConstellation] = useState<Record<string, 'ONLINE' | 'OFFLINE'>>({});
  const router = useRouter();
  const signatureRef = React.useRef<GravitationalSignature | null>(null);

  const initRealTime = useCallback((_userId: string) => {
    /* Connection disabled */
  }, []);

  useEffect(() => {
    if (!loading && user) {
      // Check for existing signature
      const existing = storage.get<GravitationalSignature>('gravity:signature', true);

      if (existing && existing.mass.id === user.id) {
        if (!signature) {
          setSignature(existing);
          signatureRef.current = existing;
        }
        // initRealTime(user.id);
      } else if (!signature) {
        // Perform Ignition
        gravity.ignite(user as any).then((sig) => {
          setSignature(sig);
          signatureRef.current = sig;
          // initRealTime(user.id);
        });
      }
    } else if (!loading && !user) {
      setSignature(null);
      signatureRef.current = null;
      _gravityInitialized = false;
    }
  }, [loading, user, initRealTime, signature]); // Added initRealTime and signature if needed, but signature changes will trigger this and ignite is only needed if no signature.

  // Keep active status updated in local mass
  useEffect(() => {
    if (!signature) return;

    const interval = setInterval(() => {
      if (Date.now() > signature.expiresAt - 60000) {
        // 1 min before expiry
        gravity.renewOrbital(signature).then(setSignature);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [signature]);

  return (
    <GravityContext.Provider
      value={{
        signature,
        isGravitationallyBound: !!signature,
        constellation,
      }}
    >
      <div className={`gravity-field ${signature ? 'bound' : 'weightless'}`}>{children}</div>
    </GravityContext.Provider>
  );
}

export const useGravity = () => {
  const context = useContext(GravityContext);
  if (context === undefined) {
    throw new Error('useGravity must be used within a GravityField');
  }
  return context;
};

