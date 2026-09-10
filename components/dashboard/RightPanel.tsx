
"use client";
import { GlassCard } from './GlassCard';
import { Bell, Calendar, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';

export function RightPanel({ assignments, notifications, studyGroups }: any) {
    return (
        <div className="space-y-6">

            {/* Notifications */}
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-400" />
                        Updates
                    </h3>
                    <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
                        {notifications?.length || 0}
                    </span>
                </div>
                <div className="space-y-3">
                    {notifications?.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No new notifications</p>
                    )}
                    {notifications?.slice(0, 3).map((n: any) => (
                        <div key={n.id} className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300 font-medium leading-tight">{n.message}</p>
                                <span className="text-xs text-gray-500 mt-1 block">
                                    {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Due Soon */}
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#22D3EE]" />
                        Due Soon
                    </h3>
                    <Link href="/assignments" className="text-xs text-[#22D3EE] hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                    {assignments?.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No pending assignments</p>
                    )}
                    {assignments?.slice(0, 3).map((a: any) => (
                        <div key={a.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="p-2 rounded-full bg-white/5 text-gray-400 group-hover:bg-[#22D3EE]/10 group-hover:text-[#22D3EE] transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-200 truncate">{a.title}</h4>
                                <p className="text-xs text-gray-500 truncate">{a.course} • Due {format(new Date(a.dueDate), 'MMM d')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Study Groups */}
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#6E7BFF]" />
                        Study Groups
                    </h3>
                    <button className="text-xs bg-[#6E7BFF]/10 text-[#6E7BFF] px-2 py-1 rounded-md hover:bg-[#6E7BFF]/20 transition-colors">
                        + New
                    </button>
                </div>
                <div className="space-y-3">
                    {studyGroups?.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">Join a group to collaborate!</p>
                    )}
                    {studyGroups?.map((g: any) => (
                        <div key={g.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                            <div>
                                <h4 className="text-sm font-medium text-gray-200">{g.name}</h4>
                                <p className="text-xs text-gray-500">{g.course}</p>
                            </div>
                            <div className="flex -space-x-2">
                                {g.members?.map((m: any, i: number) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-[#0B0F1A] flex items-center justify-center text-[10px] overflow-hidden">
                                        {m.avatar_url ? (
                                            <Image src={m.avatar_url} alt="" fill className="object-cover" />
                                        ) : (
                                            <span className="text-gray-400">?</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

        </div>
    );
}

