import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";
import SeminarsPageClient from "./SeminarsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Seminars & Workshops | SARTHI Arena",
  description: "Public knowledge sessions and intensive workshops. Join live discussions or build your skills.",
};

export default async function SeminarsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; sort?: string };
}) {
  let initialEvents: any[] = [];

  try {
    const seminars = await withResiliency(() => prisma.seminar.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        isLive: true,
        date: true,
        thumbnailUrl: true,
        speakerName: true,
        category: true,
        price: true,
        level: true,
        youtubeBroadcastId: true
      },
      orderBy: { date: 'desc' }
    }));

    const transformedSeminars = (seminars.data || []).map(s => ({
      ...s,
      type: 'seminar' as const,
      date: s.date ? new Date(s.date).toISOString() : null,
    }));

    initialEvents = [...transformedSeminars];

  } catch (error) {
    console.error("Failed to fetch events:", error);
    initialEvents = [];
  }

  return (
    <SeminarsPageClient
      initialEvents={initialEvents}
      currentLive={{ videoId: null, title: null, thumbnail: null }}
    />
  );
}

