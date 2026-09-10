import RuralInitiativeClient from './RuralInitiativeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rural Initiative | SARTHI',
  description: 'Bringing free digital skills and coding training to rural India. Verified impact across 127 villages and 3,800+ students.',
};

export default function RuralInitiativePage() {
  return <RuralInitiativeClient />;
}
