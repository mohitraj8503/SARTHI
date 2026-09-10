import Header from '@/components/Header'
import FooterGate from '@/components/FooterGate'
import MainContent from '@/components/MainContent'
import MobileNav from '@/components/MobileNav'
import StudentAIChat from '@/components/StudentAIChat'
import FeedbackWidget from '@/components/FeedbackWidget'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />

      <MainContent>
        {children}
      </MainContent>

      <MobileNav />
      <FeedbackWidget />
      <StudentAIChat />

      <FooterGate />
    </>
  )
}

