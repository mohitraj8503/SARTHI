import { Trophy, Brain, Code, Star, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface OlympiadBadge {
  id: string;
  name: string;
  level: number;
  icon: string;
  color: string;
}

interface AICurriculumProgress {
  topicsCompleted: number;
  totalTopics: number;
  currentClass: number;
  topics: {
    id: string;
    name: string;
    completed: boolean;
  }[];
}

interface CSProgress {
  topicsCompleted: number;
  totalTopics: number;
  currentClass: number;
  topics: {
    id: string;
    name: string;
    completed: boolean;
  }[];
}

interface AchievementCertificate {
  id: string;
  name: string;
  date: string;
  level: string;
  icon: string;
}

interface LeaderboardPosition {
  rank: number;
  totalStudents: number;
  score: number;
  change: number; // positive for improvement, negative for decline
}

interface UpcomingOlympiad {
  id: string;
  name: string;
  date: string;
  registrationDeadline: string;
  registrationOpen: boolean;
}

interface SkillPathNode {
  id: string;
  name: string;
  completed: boolean;
  current: boolean;
  prerequisiteIds: string[];
}

interface OlympiadProgressProps {
  badges: OlympiadBadge[];
  aiProgress: AICurriculumProgress;
  csProgress: CSProgress;
  achievements: AchievementCertificate[];
  leaderboard: LeaderboardPosition;
  upcomingOlympiads: UpcomingOlympiad[];
  skillPath: SkillPathNode[];
}

function OlympiadProgress({
  badges,
  aiProgress,
  csProgress,
  achievements,
  leaderboard,
  upcomingOlympiads,
  skillPath,
}: OlympiadProgressProps) {
  const getBadgeColorClass = (level: number) => {
    if (level >= 5) return 'bg-yellow-100 text-yellow-800';
    if (level >= 3) return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-[#D4956A] to-[#2A3828]/20';
    if (percentage >= 60) return 'bg-gradient-to-r from-[#FBBF24] to-[#2A3828]/20';
    return 'bg-gradient-to-r from-[#EF4444] to-[#2A3828]/20';
  };

  return (
    <div className="bg-white p-6 rounded-[16px] border border-[#EAE6DF]/60 shadow-[0_2px_8px_rgba(45,74,62,0.02)] transition-all hover:border-[#D4956A]/10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#D4956A]" />
          <span className="text-[13px] font-outfit font-medium text-[#2A3828]">Olympiad Progress</span>
        </div>
        <Link 
          href="/dashboard/olympiad" 
          className="text-[9px] font-outfit font-medium text-[#D4956A] hover:underline"
        >
          View All →
        </Link>
      </div>

      {/* Badges/Levels Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-outfit font-medium text-[#5D705C]">Badges & Levels</span>
          <span className="text-[9px] font-outfit text-[#D4956A]">{badges.length} earned</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`
                flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-medium rounded-full
                ${getBadgeColorClass(badge.level)}
              `}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.color }}></span>
              <span>{badge.name} Lv.{badge.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Curriculum Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#2A3828]" />
            <span className="text-[11px] font-outfit font-medium text-[#5D705C]">AI Curriculum (Class {aiProgress.currentClass})</span>
          </div>
          <span className="text-[10px] font-medium">{Math.round((aiProgress.topicsCompleted / aiProgress.totalTopics) * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-[#F7F4EF] rounded-full overflow-hidden mb-1">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(
              (aiProgress.topicsCompleted / aiProgress.totalTopics) * 100
            )}`}
            style={{ width: `${(aiProgress.topicsCompleted / aiProgress.totalTopics) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#5D705C]/60 font-nunito">
          <span>{aiProgress.topicsCompleted}/{aiProgress.totalTopics} topics</span>
          <span>Class {aiProgress.currentClass} Progress</span>
        </div>
      </div>

      {/* CS Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#2A3828]" />
            <span className="text-[11px] font-outfit font-medium text-[#5D705C]">Computer Science (Class {csProgress.currentClass})</span>
          </div>
          <span className="text-[10px] font-medium">{Math.round((csProgress.topicsCompleted / csProgress.totalTopics) * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-[#F7F4EF] rounded-full overflow-hidden mb-1">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(
              (csProgress.topicsCompleted / csProgress.totalTopics) * 100
            )}`}
            style={{ width: `${(csProgress.topicsCompleted / csProgress.totalTopics) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#5D705C]/60 font-nunito">
          <span>{csProgress.topicsCompleted}/{csProgress.totalTopics} topics</span>
          <span>Class {csProgress.currentClass} Progress</span>
        </div>
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-outfit font-medium text-[#5D705C]">Achievements</span>
            <span className="text-[9px] font-outfit text-[#D4956A]">{achievements.length} earned</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 3).map((achievement) => (
              <div 
                key={achievement.id} 
                className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-medium bg-yellow-50 rounded-full border border-yellow-200"
              >
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{achievement.name}</span>
              </div>
            ))}
            {achievements.length > 3 && (
              <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-medium text-[#D4956A] bg-yellow-50 rounded-full border border-yellow-200">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>+{achievements.length - 3} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2A3828]" />
            <span className="text-[11px] font-outfit font-medium text-[#5D705C]">School Ranking</span>
          </div>
          <span className={`text-[10px] font-medium ${
            leaderboard.rank <= 3 ? 'text-amber-800' : 
            leaderboard.rank <= 10 ? 'text-blue-800' : 
            'text-gray-600'
          }`}>
            #{leaderboard.rank}
          </span>
        </div>
        <div className="flex justify-between text-[9px] text-[#5D705C]/60 font-nunito">
          <span>{leaderboard.rank} of {leaderboard.totalStudents}</span>
          <span className={`text-[9px] font-medium ${
            leaderboard.change > 0 ? 'text-green-500' : 
            leaderboard.change < 0 ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {leaderboard.change >= 0 ? `+${leaderboard.change}` : leaderboard.change}
          </span>
        </div>
      </div>

      {/* Upcoming Olympiads */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2A3828]" />
            <span className="text-[11px] font-outfit font-medium text-[#5D705C]">Upcoming Events</span>
          </div>
          <span className="text-[9px] font-outfit text-[#D4956A]">{upcomingOlympiads.length} events</span>
        </div>
        <div className="space-y-2">
          {upcomingOlympiads.slice(0, 2).map((olympiad) => (
            <div 
              key={olympiad.id} 
              className="p-2.5 bg-[#F7F4EF] rounded-xl border border-[#EAE6DF]/40"
            >
              <div className="flex justify-between text-[9px]">
                <span className="font-medium text-[#2A3828]">{olympiad.name}</span>
                <span className={`text-[8px] font-medium ${
                  olympiad.registrationOpen ? 'text-green-600' : 'text-red-500'
                }`}>
                  {olympiad.registrationOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between text-[8px] text-[#5D705C]/60 mt-0.5">
                <span>Date: {new Date(olympiad.date).toLocaleDateString()}</span>
                <span>Deadline: {new Date(olympiad.registrationDeadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {upcomingOlympiads.length > 2 && (
            <div className="text-center text-[8px] text-[#5D705C]/60 italic mt-2">
              +{upcomingOlympiads.length - 2} more events
            </div>
          )}
        </div>
      </div>

      {/* Skill Development Path */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#2A3828]" />
            <span className="text-[11px] font-outfit font-medium text-[#5D705C]">Skill Path</span>
          </div>
          <span className="text-[9px] font-medium text-[#D4956A]">
            {skillPath.filter(node => node.completed).length}/{skillPath.length}
          </span>
        </div>
        <div className="space-y-2">
          {skillPath.slice(0, 3).map((node) => (
            <div 
              key={node.id} 
              className="flex items-center gap-2 p-2.5 bg-[#F7F4EF] rounded-xl border border-[#EAE6DF]/40"
            >
              <div className="w-2 h-2 rounded-full" style={{
                backgroundColor: node.current 
                  ? '#D4956A' 
                  : node.completed 
                    ? '#10B981' 
                    : '#D1D5DB'
              }}></div>
              <div>
                <span className="block text-[9px] font-medium text-[#2A3828]">{node.name}</span>
                {node.prerequisiteIds.length > 0 && (
                  <span className="block text-[8px] text-[#5D705C]/60">
                    Prerequisites: {node.prerequisiteIds.length}
                  </span>
                )}
              </div>
            </div>
          ))}
          {skillPath.length > 3 && (
            <div className="text-center text-[8px] text-[#5D705C]/60 italic mt-2">
              +{skillPath.length - 3} more skills
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OlympiadProgress;

