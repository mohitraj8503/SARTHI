import Link from 'next/link';
import { BookOpen, Video, MessageSquare, Bell, GraduationCap, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'courses' | 'live-lessons' | 'messages' | 'notifications' | 'enrollments' | 'search';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const defaultEmptyStates = {
  courses: {
    icon: BookOpen,
    title: 'No courses yet',
    description: 'Start your learning journey by enrolling in a course.',
    actionLabel: 'Browse Courses',
    actionHref: '/courses'
  },
  'live-lessons': {
    icon: Video,
    title: 'No seminars scheduled',
    description: 'Check back later for upcoming seminars.',
    actionLabel: 'View All Sessions',
    actionHref: '/seminars'
  },
  messages: {
    icon: MessageSquare,
    title: 'No messages yet',
    description: 'Start a conversation with your instructors or peers.',
    actionLabel: 'Browse Courses',
    actionHref: '/courses'
  },
  notifications: {
    icon: Bell,
    title: 'No notifications',
    description: "You're all caught up! Check back later for updates.",
    actionLabel: null,
    actionHref: null
  },
  enrollments: {
    icon: GraduationCap,
    title: "You're all caught up",
    description: 'Pick a course from our catalog to get started with your learning journey today.',
    actionLabel: 'Explore Catalog',
    actionHref: '/courses'
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or browse our catalog.',
    actionLabel: 'Browse Courses',
    actionHref: '/courses'
  }
};

/**
 * EmptyState - Premium empty state component
 * 
 * Use this component to show users when there's no data available,
 * instead of filling emptiness with fake/demo items.
 */
export function EmptyState({ 
  type, 
  title, 
  description, 
  actionLabel, 
  actionHref 
}: EmptyStateProps) {
  const defaults = defaultEmptyStates[type];
  const Icon = defaults.icon;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {title || defaults.title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        {description || defaults.description}
      </p>
      {(actionLabel || defaults.actionLabel) && (actionHref || defaults.actionHref) && (
        <Link 
          href={actionHref || defaults.actionHref!}
          className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all"
        >
          {actionLabel || defaults.actionLabel}
        </Link>
      )}
    </div>
  );
}

