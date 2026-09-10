'use client';

import dynamic from 'next/dynamic';

const ClientDataSeeder = dynamic(() => import('@/components/ClientDataSeeder'), {
    ssr: false,
});

export default function DataSeederWrapper() {
    return <ClientDataSeeder />;
}

