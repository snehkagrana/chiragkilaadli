/// <reference path="../types/youtube.d.ts" />
import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  videoId?: string;
}

const PLAYER_CONTAINER_ID = 'youtube-player-container';
const YT_PLAYER_DIV_ID = 'yt-player';

const MusicPlayer = ({ videoId = 'GxldQ9eX2wo' }: MusicPlayerProps) => {
  const playerRef = useRef<YT.Player | null>(null);
  const initializedRef = useRef(false);
  const autoplayCheckTimeoutRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const clearAutoplayCheck = useCallback(() => {
    if (autoplayCheckTimeoutRef.current) {
      window.clearTimeout(autoplayCheckTimeoutRef.current);
      autoplayCheckTimeoutRef.current = null;
    }
  }, []);

  const destroyPlayer = useCallback(() => {
    clearAutoplayCheck();

    const p = playerRef.current;
    if (p) {
      try {
        p.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }

    initializedRef.current = false;
    setIsReady(false);
    setIsPlaying(false);
  }, [clearAutoplayCheck]);

  const initPlayer = useCallback(() => {
    // Prevent duplicate initialization (React StrictMode can mount/unmount twice in dev)
    if (initializedRef.current) return;

    const container = document.getElementById(PLAYER_CONTAINER_ID);
    if (!container) return;

    // Clean up any leftover instance first
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }

    // Create a stable inner node that YouTube owns
    let playerDiv = document.getElementById(YT_PLAYER_DIV_ID);
    if (!playerDiv) {
      container.innerHTML = '';
      playerDiv = document.createElement('div');
      playerDiv.id = YT_PLAYER_DIV_ID;
      container.appendChild(playerDiv);
    }

    initializedRef.current = true;

    const newPlayer = new window.YT.Player(YT_PLAYER_DIV_ID, {
      height: '0',
      width: '0',
      videoId,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: videoId,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          playerRef.current = newPlayer;
          setIsReady(true);
          setIsMuted(event.target.isMuted());
          event.target.setVolume(50);

          // Try autoplay; if it doesn't transition to PLAYING, show the play button.
          try {
            event.target.playVideo();
          } catch {
            // ignore
          }

          clearAutoplayCheck();
          autoplayCheckTimeoutRef.current = window.setTimeout(() => {
            setNeedsInteraction(true);
          }, 1200);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            event.target.playVideo();
            return;
          }

          if (event.data === window.YT.PlayerState.PLAYING) {
            clearAutoplayCheck();
            setNeedsInteraction(false);
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.CUED) {
            setIsPlaying(false);
          }
        },
      },
    });

    playerRef.current = newPlayer;
  }, [clearAutoplayCheck, videoId]);

  useEffect(() => {
    // Load the YouTube IFrame API if needed
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;

    const start = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      start();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        start();
      };
    }

    return () => {
      // Restore callback in case other instances rely on it
      window.onYouTubeIframeAPIReady = previousCallback;
      destroyPlayer();
      setNeedsInteraction(false);
    };
  }, [destroyPlayer, initPlayer]);

  const startPlayback = () => {
    const p = playerRef.current;
    if (!p || !isReady) return;

    try {
      p.playVideo();
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p || !isReady) return;

    try {
      if (p.isMuted()) {
        p.unMute();
      } else {
        p.mute();
      }
      setIsMuted(p.isMuted());
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Container for YouTube player - YouTube manages the inner content */}
      <div
        id={PLAYER_CONTAINER_ID}
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      />

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Playing indicator */}
        {isPlaying && (
          <span
            className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"
            aria-label="Music is playing"
            role="status"
          />
        )}

        {/* Play button (mobile / autoplay blocked) */}
        {needsInteraction && (
          <button
            onClick={startPlayback}
            className="p-3 rounded-full bg-primary/90 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground hover:bg-primary transition-all duration-300 shadow-lg"
            aria-label="Tap to play music"
          >
            <Play className="w-6 h-6" />
          </button>
        )}

        {/* Mute/Unmute button */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-background/30 backdrop-blur-sm border border-border/40 text-foreground hover:bg-background/40 transition-all duration-300 shadow-lg"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;

