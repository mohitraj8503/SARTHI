import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function SpeakerDashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Find speaker linked to this user
    const speaker = await prisma.speaker.findUnique({
        where: { userId: user.id },
        include: {
            seminars: {
                orderBy: { scheduledAt: "desc" },
                include: { _count: { select: { registrations: true } } },
            },
        },
    });

    if (!speaker) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-2xl mb-2">🎙️</p>
                    <p className="text-gray-600">You are not registered as a speaker.</p>
                    <p className="text-sm text-gray-400 mt-1">Contact admin if this is an error.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Speaker Header */}
            <div className="flex items-center gap-5 mb-8 p-6 bg-white rounded-2xl border border-gray-200">
                {speaker.photo && (
                    <div className="w-16 h-16 rounded-full overflow-hidden relative shrink-0">
                        <Image src={speaker.photo} alt={speaker.name} fill className="object-cover" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold">{speaker.name}</h1>
                    {speaker.designation && <p className="text-gray-500">{speaker.designation}</p>}
                    <div className="flex gap-2 mt-2">
                        {speaker.expertise ? speaker.expertise.split(',').map((tag) => (
                            <span key={tag} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                {tag.trim()}
                            </span>
                        )) : null}
                    </div>
                </div>
            </div>

            {/* My Seminars */}
            <h2 className="text-lg font-semibold mb-4">My Seminars</h2>
            <div className="space-y-4">
                {speaker.seminars.map((seminar) => (
                    <div key={seminar.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">{seminar.title}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {seminar.scheduledAt
                                        ? new Date(seminar.scheduledAt).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Date TBD"}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    👥 {seminar._count.registrations} registered students
                                </p>
                                <p className="text-sm text-gray-400">
                                    📡 {seminar.streamingPlatform === "YOUTUBE" ? "YouTube (Unlisted)" : "Google Meet"}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${seminar.status === "LIVE" ? "bg-red-100 text-red-700" :
                                        seminar.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                                            seminar.status === "ENDED" ? "bg-green-100 text-green-700" :
                                                "bg-gray-100 text-gray-600"
                                    }`}>
                                    {seminar.status}
                                </span>
                                {seminar.status === "SCHEDULED" && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 max-w-xs">
                                        <p className="font-semibold">📋 Your streaming details will be sent via email by the admin before the session.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {speaker.seminars.length === 0 && (
                    <p className="text-gray-400 text-sm">No seminars assigned yet. Admin will assign one soon.</p>
                )}
            </div>
        </div>
    );
}

