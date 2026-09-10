import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, Heart, Laugh, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    senderImage?: string;
    isOwn: boolean;
    isRead: boolean;
    createdAt: string | Date;
    reactions?: Array<{
      type: string;
      count: number;
      me: boolean;
    }>;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFullDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReactionClick = async (reactionType: string) => {
    // In a real implementation, this would call an API to add/remove reactions
    console.log(`Adding reaction ${reactionType} to message ${message.id}`);
    // For now, we'll just simulate it
  };

  return (
    <div
      className={`flex ${message.isOwn ? "justify-end" : "justify-start"} mb-3`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      <div className="flex flex-col items-end max-w-[70%]">
        {/* Avatar and name for others' messages */}
        {!message.isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar 
                user={{
                    name: message.senderName,
                    avatar_url: message.senderImage
                }} 
                size="xs" 
            />
            <span className="text-xs text-slate-500">{message.senderName}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "px-6 py-4 rounded-[1.5rem] relative shadow-none transition-all duration-300",
            message.isOwn
              ? "bg-emerald-50 text-[#174F3A] border border-emerald-200 rounded-br-none"
              : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none"
          )}
        >
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words font-medium">
            {message.content}
          </p>

          {/* Timestamp on hover */}
          <div
            className={`absolute bottom-0 ${message.isOwn ? "right-full mr-3" : "left-full ml-3"
              } mb-2 transition-opacity duration-300 ${showTimestamp ? "opacity-100" : "opacity-0"
              }`}
          >
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap ${message.isOwn
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-400 border border-slate-200"
                }`}
            >
              {formatFullDate(message.createdAt)}
            </span>
          </div>

          {/* Read receipt for own messages */}
          {message.isOwn && (
            <div className="absolute -bottom-5 right-0 flex items-center gap-1">
              <span className={cn(
                "text-[10px] font-black",
                message.isRead ? "text-[#22C55E]" : "text-slate-300"
              )}>
                {message.isRead ? "READ" : "DELIVERED"}
              </span>
              <div className={cn(
                "w-1 h-1 rounded-full",
                message.isRead ? "bg-[#22C55E]" : "bg-slate-200"
              )} />
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-row gap-1 mt-3">
            {message.reactions.map((reaction) => (
              <button
                key={`${message.id}-${reaction.type}`}
                onClick={() => handleReactionClick(reaction.type)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all active:scale-95",
                  reaction.me 
                    ? "bg-[#174F3A]/5 border-[#174F3A]/10 text-[#174F3A]" 
                    : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                )}
              >
                {reaction.type === "thumbsup" && <ThumbsUp className="w-3 h-3" />}
                {reaction.type === "heart" && <Heart className="w-3 h-3" />}
                {reaction.type === "laugh" && <Laugh className="w-3 h-3" />}
                {reaction.type === "eyes" && <Eye className="w-3 h-3" />}
                <span className="text-[10px] font-black">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time below bubble */}
        <span
          className={`text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2 ${message.isOwn ? "text-right" : "text-left"
            }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

