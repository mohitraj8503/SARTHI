export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Help & Support | SARTHI',
  description: 'Get help with your courses, report technical issues, and connect with our support team.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <SupportClient />
    </div>
  );
}

