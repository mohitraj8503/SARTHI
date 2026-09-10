'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Room, Participant, Track, createLocalTracks } from 'livekit-client';
import { cn } from '@/lib/utils';
import { Loader2, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Users, MessageSquare, Hand } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface LiveStreamPlayerProps {
  roomName: string;
  token: string;
  isHost?: boolean;
  onParticipantCountChange?: (count: number) => void;
  onMessage?: (message: string, sender: string) => void;
  onHandRaise?: (participantId: string, raised: boolean) => void;
}

interface ParticipantData {
  id: string;
  name: string;
  isHost: boolean;
  videoTrack?: Track;
  audioTrack?: Track;
  handRaised: boolean;
}

export default function LiveStreamPlayer({
  roomName,
  token,
  isHost = false,
  onParticipantCountChange,
  onMessage,
  onHandRaise
}: LiveStreamPlayerProps) {
  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [localParticipant, setLocalParticipant] = useState<ParticipantData | null>(null);

  // Media controls
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(isHost);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // UI states
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Connect to LiveKit room
  const connectToRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 }
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      roomRef.current = room;

      // Event handlers
      room.on('participantConnected', (participant) => {
        console.log('Participant connected:', participant.identity);
        updateParticipantsList();
        triggerHaptic('light');
      });

      room.on('participantDisconnected', (participant) => {
        console.log('Participant disconnected:', participant.identity);
        updateParticipantsList();
      });

      room.on('trackSubscribed', (track, publication, participant) => {
        console.log('Track subscribed:', track.kind, participant.identity);
        updateParticipantsList();
      });

      room.on('trackUnsubscribed', (track, publication, participant) => {
        console.log('Track unsubscribed:', track.kind, participant.identity);
        updateParticipantsList();
      });

      room.on('disconnected', () => {
        console.log('Disconnected from room');
        setIsConnected(false);
        setParticipants([]);
        setLocalParticipant(null);
      });

      room.on('connectionStateChanged', (state) => {
        console.log('Connection state:', state);
        setIsConnected(state === 'connected');
        if (state === 'connected') {
          setIsLoading(false);
          updateParticipantsList();
        }
      });

      // Connect to room
      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

      // Set up local participant
      const local = room.localParticipant;
      setLocalParticipant({
        id: local.identity,
        name: local.name || 'You',
        isHost,
        handRaised: false
      });

    } catch (err) {
      console.error('Failed to connect to room:', err);
      setError('Failed to connect to live stream');
      setIsLoading(false);
    }
  }, [token, isHost, updateParticipantsList]);

  // Update participants list
  const updateParticipantsList = useCallback(() => {
    if (!roomRef.current) return;

    const room = roomRef.current;
    const participantList: ParticipantData[] = [];

    // Add remote participants
    try {
      const parts = (room as any).participants || [];
      if (parts && typeof parts.forEach === 'function') {
        parts.forEach((participant: Participant) => {
          const videoTrack = (participant as any).getTrack?.(Track.Source.Camera);
          const audioTrack = (participant as any).getTrack?.(Track.Source.Microphone);

          participantList.push({
            id: (participant as any).identity || 'unknown',
            name: (participant as any).name || 'Anonymous',
            isHost: (participant as any).permissions?.canPublish || false,
            videoTrack: videoTrack?.track,
            audioTrack: audioTrack?.track,
            handRaised: false
          });
        });
      }
    } catch (e) {
      console.warn('Failed to get participants:', e);
    }

    setParticipants(participantList);
    onParticipantCountChange?.(participantList.length + 1); // +1 for local participant
  }, [onParticipantCountChange]);

  // Toggle microphone
  const toggleMic = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      if (isMicEnabled) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      } else {
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      }
      setIsMicEnabled(!isMicEnabled);
      triggerHaptic('light');
    } catch (err) {
      console.error('Failed to toggle mic:', err);
    }
  }, [isMicEnabled]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      if (isCameraEnabled) {
        await roomRef.current.localParticipant.setCameraEnabled(false);
      } else {
        await roomRef.current.localParticipant.setCameraEnabled(true);
      }
      setIsCameraEnabled(!isCameraEnabled);
      triggerHaptic('light');
    } catch (err) {
      console.error('Failed to toggle camera:', err);
    }
  }, [isCameraEnabled]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setParticipants([]);
    setLocalParticipant(null);
  }, []);

  // Initialize connection
  useEffect(() => {
    connectToRoom();

    return () => {
      leaveRoom();
    };
  }, [connectToRoom, leaveRoom]);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'KeyM':
          e.preventDefault();
          toggleMic();
          break;
        case 'KeyV':
          e.preventDefault();
          toggleCamera();
          break;
        case 'Escape':
          e.preventDefault();
          leaveRoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMic, toggleCamera, leaveRoom]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-red-900 rounded-2xl flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <PhoneOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Connection Failed</h3>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={connectToRoom}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden group">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">Connecting to live stream...</p>
            <p className="text-sm text-gray-400 mt-2">Setting up WebRTC connection</p>
          </div>
        </div>
      )}

      {/* Main Video Area */}
      <div className="relative w-full h-full">
        {/* Host's video (if host is sharing) */}
        {isHost && isCameraEnabled && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Participant grid for non-hosts or when multiple people are active */}
        {!isHost && participants.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 h-full">
            {participants.slice(0, 12).map((participant) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                {participant.videoTrack ? (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-sm font-medium truncate bg-black/50 px-2 py-1 rounded">
                    {participant.name}
                  </p>
                </div>
                {participant.handRaised && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Hand className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Connection status overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
              )} />
              <span className="font-medium">
                {isConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <Users className="w-4 h-4" />
              <span>{participants.length + 1}</span>
            </div>
          </div>
        </div>

        {/* Control bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls || !isConnected ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex items-center justify-center gap-4">
            {/* Mic control */}
            <button
              onClick={toggleMic}
              className={cn(
                "p-3 rounded-full transition-all",
                isMicEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
              aria-label={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* Camera control (only for host) */}
            {isHost && (
              <button
                onClick={toggleCamera}
                className={cn(
                  "p-3 rounded-full transition-all",
                  isCameraEnabled
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                )}
                aria-label={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
            )}

            {/* Chat toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "p-3 rounded-full transition-all",
                showChat ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
              )}
              aria-label="Toggle chat"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Participants toggle */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={cn(
                "p-3 rounded-full transition-all",
                showParticipants ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
              )}
              aria-label="Toggle participants"
            >
              <Users className="w-6 h-6" />
            </button>

            {/* Leave room */}
            <button
              onClick={leaveRoom}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
              aria-label="Leave room"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Click to show controls */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => setShowControls(true)}
          onMouseMove={() => setShowControls(true)}
        />
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
          {/* Chat implementation would go here */}
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-900">Live Chat</h3>
          </div>
          <div className="flex-1 p-4">
            <p className="text-gray-500 text-sm">Chat feature coming soon...</p>
          </div>
        </div>
      )}

      {/* Participants sidebar */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-900">Participants ({participants.length + 1})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Local participant */}
            {localParticipant && (
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {localParticipant.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{localParticipant.name} (You)</p>
                  <p className="text-sm text-gray-500">{localParticipant.isHost ? 'Host' : 'Participant'}</p>
                </div>
              </div>
            )}

            {/* Remote participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="p-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{participant.name}</p>
                  <p className="text-sm text-gray-500">{participant.isHost ? 'Host' : 'Participant'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

