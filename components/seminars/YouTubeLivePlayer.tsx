"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubeLivePlayerProps {
    videoId: string;
    title?: string;
    showChat?: boolean;
    autoplay?: boolean;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function YouTubeLivePlayer({
    videoId,
    title = "Live Session",
    showChat = false,
    autoplay = true,
}: YouTubeLivePlayerProps) {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            tag.async = true;
            document.head.appendChild(tag);
        }

        const initPlayer = () => {
            if (!containerRef.current) return;

            playerRef.current = new window.YT.Player(containerRef.current, {
                height: "100%",
                width: "100%",
                videoId: videoId,
                playerVars: {
                    autoplay: autoplay ? 1 : 0,
                    controls: 1,
                    rel: 0,           // No related videos
                    modestbranding: 1, // Minimal YouTube branding
                    iv_load_policy: 3, // No video annotations
                    fs: 1,             // Allow fullscreen
                    origin: window.location.origin,
                    enablejsapi: 1,
                },
                events: {
                    onReady: (event: any) => {
                        setPlayerReady(true);
                        if (autoplay) event.target.playVideo();
                    },
                    onError: (event: any) => {
                        console.error("YouTube player error:", event.data);
                        if (event.data === 100) {
                            setError("Video not found. Please check the stream ID.");
                        } else if (event.data === 101 || event.data === 150) {
                            setError("This video cannot be embedded. Please set YouTube video to allow embedding.");
                        } else {
                            setError("Video playback error. Please refresh.");
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId, autoplay]);

    if (error) {
        return (
            <div className="w-full aspect-video bg-gray-900 flex items-center justify-center rounded-xl">
                <div className="text-center text-white p-6">
                    <p className="text-red-400 text-lg font-semibold mb-2">⚠️ Playback Error</p>
                    <p className="text-gray-300 text-sm">{error}</p>
                    <button
                        onClick={() => { setError(null); window.location.reload(); }}
                        className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-4 ${showChat ? "flex-col lg:flex-row" : "flex-col"}`}>
            {/* Video Player */}
            <div className={`relative bg-black rounded-xl overflow-hidden ${showChat ? "flex-1" : "w-full"}`}>
                <div className="aspect-video">
                    <div ref={containerRef} className="w-full h-full" />
                </div>
                {!playerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-white text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-sm">Loading live stream...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Chat (optional) */}
            {showChat && (
                <div className="w-full lg:w-96 bg-gray-900 rounded-xl overflow-hidden min-h-[400px]">
                    <iframe
                        src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : ''}`}
                        className="w-full h-full border-none"
                        title="Live Chat"
                    />
                </div>
            )}
        </div>
    );
}

