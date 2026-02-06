import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  videoId?: string;
}

const PLAYER_CONTAINER_ID = 'youtube-player-container';

const MusicPlayer = ({ videoId = "GxldQ9eX2wo" }: MusicPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [player, setPlayer] = useState<YT.Player | null>(null);

  const initPlayer = useCallback(() => {
    // Check if container exists
    const container = document.getElementById(PLAYER_CONTAINER_ID);
    if (!container) return;

    // Create a new div for YouTube to replace (don't let it touch React-managed elements)
    const playerDiv = document.createElement('div');
    playerDiv.id = 'yt-player';
    container.innerHTML = '';
    container.appendChild(playerDiv);

    const newPlayer = new window.YT.Player('yt-player', {
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
          setPlayer(newPlayer);
          event.target.setVolume(50);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            event.target.playVideo();
          }
        },
      },
    });
  }, [videoId]);

  useEffect(() => {
    // Load YouTube IFrame API script if not already loaded
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    // Wait for API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };
    }

    // Cleanup: destroy player but don't touch the DOM (let React handle the container)
    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [initPlayer]);

  const toggleMute = () => {
    if (player && isReady) {
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Container for YouTube player - YouTube will manage the inner content */}
      <div 
        id={PLAYER_CONTAINER_ID} 
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      />
      
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
