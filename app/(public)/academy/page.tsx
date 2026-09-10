import { Metadata } from 'next';
import CategoryNavHub from '@/components/CategoryNavHub';

export const metadata: Metadata = {
  title: 'Academy | SARTHI',
  description: 'Programs, hands-on workshops, and specialized training pathways by SARTHI.',
};

export default function AcademyPage() {
  return (
    <CategoryNavHub 
      categoryLabel="Academy"
      categoryEmoji="🎓"
      categorySubtitle="Programs & Hands-on Learning"
      subItems={[
        { label: 'Workshops', href: '/workshops', icon: 'Wrench', iconColor: '#F59E0B', desc: 'Live hands-on build sessions', badge: 'HOT' },
        { label: 'Industry Automation', href: '/industry-automation', icon: 'Factory', iconColor: '#3B82F6', desc: 'Real-world industrial training', badge: 'NEW' },
        { label: 'Seminars', href: '/seminars', icon: 'Mic', iconColor: '#8B5CF6', desc: 'Expert talks & guest lectures', badge: 'EVENT' },
        { label: 'Student Ambassadors Program', href: '/student-ambassadors', icon: 'Users', iconColor: '#A78BFA', desc: 'Represent us on campus', badge: 'NEW' },
        { label: 'Internship', href: '/internship', icon: 'GraduationCap', iconColor: '#22C55E', desc: 'Start your learning journey here', badge: 'LIVE' },
      ]}
      featuredData={{
        title: "Upcoming Internship Cohort 2026",
        icon: "GraduationCap",
        iconColor: "#22C55E",
        meta: "Starts 15 July  •  Interactive live cohort  •  42 Seats Left",
        badge: "LIVE COHORT",
        ctaText: "Register Now",
        ctaHref: "/internship"
      }}
    />
  );
}
