import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  videoId?: string;
}

const MusicPlayer = ({ videoId = "GxldQ9eX2wo" }: MusicPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Load YouTube IFrame API
    const loadAPI = () => {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    // Initialize player when API is ready
    const initPlayer = () => {
      if (containerRef.current && !playerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '0',
          width: '0',
          videoId: videoId,
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
              setIsReady(true);
              event.target.setVolume(50);
            },
            onStateChange: (event) => {
              // If video ends, replay it
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      loadAPI();
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const toggleMute = () => {
    if (playerRef.current && isReady) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Hidden YouTube player */}
      <div ref={containerRef} className="hidden" />
      
      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-foreground hover:bg-white/30 transition-all duration-300 shadow-lg"
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default MusicPlayer;
