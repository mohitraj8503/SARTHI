"use client";

import { useEffect, useRef, useState } from "react";

interface SeminarPlayerProps {
    platform: "YOUTUBE" | "GOOGLE_MEET";
    youtubeVideoId?: string | null;
    meetViewLink?: string | null;
    title: string;
    showChat?: boolean;
    status: string;
}

// YouTube IFrame API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function SeminarPlayer({
    platform,
    youtubeVideoId,
    meetViewLink,
    title,
    showChat = false,
    status,
}: SeminarPlayerProps) {
    // ─── GOOGLE MEET PLAYER ───────────────────────────────────────────
    if (platform === "GOOGLE_MEET") {
        if (!meetViewLink) {
            return (
                <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <p className="text-4xl mb-3">📅</p>
                        <p className="font-semibold">Meet link will appear when seminar starts</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden">
                <iframe
                    src={meetViewLink}
                    className="w-full h-full"
                    allow="camera; microphone; fullscreen; display-capture"
                    allowFullScreen
                    title={title}
                />
            </div>
        );
    }

    // ─── YOUTUBE PLAYER ───────────────────────────────────────────────
    return (
        <YouTubePlayer
            videoId={youtubeVideoId!}
            title={title}
            showChat={showChat}
            isLive={status === "LIVE"}
        />
    );
}

// ─── YouTube IFrame API Player ────────────────────────────────────────
function YouTubePlayer({
    videoId,
    title,
    showChat,
    isLive,
}: {
    videoId: string;
    title: string;
    showChat: boolean;
    isLive: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoId) return;

        const initPlayer = () => {
            if (!containerRef.current) return;
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: "100%",
                width: "100%",
                videoId,
                playerVars: {
                    autoplay: isLive ? 1 : 0,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    fs: 1,
                    origin: typeof window !== "undefined" ? window.location.origin : "",
                    enablejsapi: 1,
                },
                events: {
                    onReady: () => setReady(true),
                    onError: (e: any) => {
                        if (e.data === 100) setError("Video not found. Check stream ID.");
                        else if (e.data === 101 || e.data === 150)
                            setError("Embedding not allowed. Set YouTube video to allow embeds.");
                        else setError("Playback error. Please refresh.");
                    },
                },
            });
        };

        if (typeof window !== "undefined" && window.YT?.Player) {
            initPlayer();
        } else {
            if (typeof document !== "undefined" && !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                document.head.appendChild(tag);
            }
            if (typeof window !== "undefined") {
                window.onYouTubeIframeAPIReady = initPlayer;
            }
        }

        return () => {
            playerRef.current?.destroy();
        };
    }, [videoId, isLive]);

    if (error) {
        return (
            <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                    <p className="text-red-400 font-semibold text-lg mb-2">⚠️ {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm mt-2"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-4 ${showChat ? "items-start" : ""}`}>
            {/* Video */}
            <div className={`relative bg-black rounded-2xl overflow-hidden ${showChat ? "flex-1" : "w-full"}`}>
                <div className="aspect-video">
                    <div ref={containerRef} className="w-full h-full" />
                </div>
                {!ready && (
                    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-white text-sm">
                            {isLive ? "Connecting to live stream..." : "Loading video..."}
                        </p>
                    </div>
                )}
            </div>

            {/* YouTube Live Chat */}
            {showChat && isLive && (
                <div className="w-80 shrink-0 bg-gray-900 rounded-2xl overflow-hidden" style={{ height: "480px" }}>
                    <iframe
                        src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${typeof window !== "undefined" ? window.location.hostname : "sarthi-woad.vercel.app"}`}
                        className="w-full h-full"
                        frameBorder="0"
                        title="Live Chat"
                    />
                </div>
            )}
        </div>
    );
}

