import InductionHubClient from './InductionHubClient';
import { getInductionStats } from '@/lib/services/induction.service';

/**
 * ARCHITECTURAL INDUCTION HUB
 * Re-orchestrated for high-fidelity performance and SaaS standard UI.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminInductionHub() {
  const result = await getInductionStats();

  const {
    activePrograms = 0,
    pendingApps = 0,
    totalEnrolled = 0,
    creatorTotal = 0,
    creatorPending = 0,
    builderTotal = 0,
    builderPending = 0,
    blogTotal = 0,
    blogPending = 0
  } = result.data || {};

  const statsData = [
    {
      label: "Active Programs",
      value: activePrograms,
      icon: "Layers",
      color: "text-blue-600",
      bg: "bg-blue-100",
      footnote: "Live induction tracks"
    },
    {
      label: "Pending Review",
      value: pendingApps + creatorPending + builderPending + blogPending,
      icon: "Clock",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      footnote: "Applications awaiting audit"
    },
    {
      label: "Total Enrolled",
      value: totalEnrolled + (creatorTotal - creatorPending) + (builderTotal - builderPending) + (blogTotal - blogPending),
      icon: "Users",
      color: "text-amber-600",
      bg: "bg-amber-100",
      footnote: "Learners in pipeline"
    },
    {
      label: "Success Rate",
      value: "94%",
      icon: "Target",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      footnote: "Graduation performance"
    }
  ];

  const hubsData = [
    {
      id: "blog",
      title: "Blog Writer Induction",
      description: "Manage technical writers, review samples, and approve community contributors.",
      href: "/admin/blog-writers",
      stats: { total: blogTotal, new: blogPending, active: blogTotal - blogPending }
    },
    {
      id: "pro",
      title: "Professional Induction",
      description: "Orchestrate specialized fellowship tracks and high-performance career bridging.",
      href: "/admin/inductions/programs",
      stats: { total: activePrograms, new: pendingApps, active: activePrograms }
    },
    {
      id: "creator",
      title: "Creator Programme",
      description: "Performance-based induction for elite creators. Review videos and select top talent.",
      href: "/admin/inductions/creator",
      stats: { total: creatorTotal, new: creatorPending, active: creatorTotal - creatorPending }
    },
    {
      id: "builder",
      title: "Builder Track",
      description: "Evaluate technical projects, score architecture, and select elite builders.",
      href: "/admin/inductions/builder",
      stats: { total: builderTotal, new: builderPending, active: builderTotal - builderPending }
    },
    {
      id: "workshops",
      title: "Workshop Orchestration",
      description: "Intensive cohort-based training and technical skill development tracks.",
      href: "/admin/workshops",
      stats: { total: 0, new: 0, active: 0 }
    }
  ];

  return <InductionHubClient stats={statsData as any} hubs={hubsData as any} />;
}
