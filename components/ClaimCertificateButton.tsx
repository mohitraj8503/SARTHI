'use client';

import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CertificateTierSelector from './CertificateTierSelector';

interface ClaimCertificateButtonProps {
  courseId: string;
}

export default function ClaimCertificateButton({ courseId }: ClaimCertificateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <PartyPopper className="w-5 h-5" />
          Claim My Certificate
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="bg-background rounded-[3rem] p-8 md:p-12 border border-border shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl md:text-4xl font-black text-center text-foreground">
              Choose Your Certificate Tier
            </DialogTitle>
            <p className="text-muted-foreground text-center mt-2 font-medium">
              Upgrade to Premium for LinkedIn sharing, QR verification and more!
            </p>
          </DialogHeader>
          
          <CertificateTierSelector courseId={courseId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

