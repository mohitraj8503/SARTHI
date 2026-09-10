import { Flame } from 'lucide-react';

interface StreakData {
    currentStreak: number;
    weeklyGoalProgress: number;
    weeklyMinutes: number;
    weeklyGoal: number;
}

function LearningStreak({ streak }: { streak: StreakData }) {
    return (
        <div className="bg-gradient-to-br from-[#FF6B35]/5 to-[#F7C94B]/5 p-6 rounded-[16px] border border-[#FF6B35]/10 shadow-[0_2px_12px_rgba(255,107,53,0.02)] transition-all hover:border-[#FF6B35]/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-[13px] font-outfit font-medium text-[#2A3828]">Learning streak</span>
                </div>
                {streak.currentStreak > 0 && (
                    <span className="text-[10px] font-bold text-[#FF6B35] bg-white px-2 py-0.5 rounded-full">
                        🔥 {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-[#1F2937]/60 font-outfit tracking-wider uppercase text-[9px] font-bold">Weekly goal</span>
                    <span className="font-bold text-[#1F2937]">{streak.weeklyGoalProgress}%</span>
                </div>
                <div className="w-full h-1 bg-white/40 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-[#FF6B35] to-[#F7C94B] rounded-full transition-all duration-700"
                        style={{ width: `${streak.weeklyGoalProgress}%` }}
                    />
                </div>
                <p className="text-[10px] text-[#5D705C]/60 italic">
                    {streak.weeklyMinutes} of {streak.weeklyGoal} min this week
                </p>
            </div>
        </div>
    );
}

export default LearningStreak;

