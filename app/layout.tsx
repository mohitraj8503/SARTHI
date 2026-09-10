import { env } from '@/lib/env'
import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import CacheSanitizer from '@/components/CacheSanitizer'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'


// Professional font system for SARTHI





import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#020617',
  viewportFit: 'cover',
}

export const metadata: import('next').Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app'
  ),
  title: {
    default: 'SARTHI — Capacity Building & LMS Portal | IMD',
    template: '%s | SARTHI',
  },
  description: 'Centralized Learning Management Portal for organizational training, competency development, and knowledge sharing at the India Meteorological Department.',
  keywords: ['capacity building', 'LMS', 'training', 'competency tracking', 'IMD', 'skill development', 'government training', 'certification'],
  robots: { index: true, follow: true },
}

const rootOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SARTHI',
  alternateName: ['SARTHI', 'IMD LMS', 'Capacity Building Portal'],
  url: 'https://sarthi-woad.vercel.app',
  logo: 'https://sarthi-woad.vercel.app/sarthi-logo.png',
  description: 'Centralized Learning Management Portal for organizational training, competency development, and knowledge sharing at the India Meteorological Department.',
  sameAs: [
    'https://sarthi-woad.vercel.app',
  ],
};

import ProgressBar from '@/components/Providers/ProgressBar'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Suspense } from 'react'
import { SWRegistration } from '@/components/notifications/SWRegistration'
import { PushPermissionPrompt } from '@/components/notifications/PushPermissionPrompt'
import { SmartInstallPrompt } from '@/components/notifications/SmartInstallPrompt'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={``}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootOrganizationSchema) }}
        />

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-L9LVMT5V0S" strategy="afterInteractive" />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L9LVMT5V0S', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden font-inter antialiased selection:bg-[#10B981]/10 selection:text-[#10B981]" suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <Suspense fallback={null}>
              <ProgressBar />
            </Suspense>
            <SWRegistration />
            <CacheSanitizer />
            <PushPermissionPrompt />
            <SmartInstallPrompt />
            <ErrorBoundary>

              <Suspense fallback={<RootLoading />}>
                <main className="flex-1 flex flex-col">
                  {children}
                </main>
              </Suspense>
              <Script 
                src="https://accounts.google.com/gsi/client" 
                strategy="afterInteractive"
              />
            </ErrorBoundary>
          </Providers>
        </ThemeProvider>
      </body>

    </html>
  )
}

function RootLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FCFCFA] z-[100]">
      <div className="w-8 h-8 border-2 border-[#1A3C2E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
