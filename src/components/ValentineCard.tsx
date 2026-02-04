import { useState, useCallback, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import Confetti from './Confetti';

const noButtonTexts = [
  "No 💔",
  "Wait, what? 😅",
  "Are you sure? 🤔",
  "Think again! 😏",
  "Really?! 😱",
  "You're breaking my heart! 💔",
  "Please reconsider! 🥺",
  "Wrong button! 😜",
  "Oops, try the other one! ☺️",
  "Come on! 😊",
  "Nooo! 😢",
  "Pretty please? 🙏",
  "I'll be sad! 😿",
  "Last chance! 💕",
];

const ValentineCard = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonText, setNoButtonText] = useState("No 💔");
  const [evasionCount, setEvasionCount] = useState(0);
  const [isPositionAbsolute, setIsPositionAbsolute] = useState(false);
  const [yesButtonScale, setYesButtonScale] = useState(1);

  const generateRandomPosition = useCallback(() => {
    const buttonWidth = 160;
    const buttonHeight = 50;
    const padding = 20;
    
    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;
    
    const x = Math.max(padding, Math.random() * maxX);
    const y = Math.max(padding, Math.random() * maxY);
    
    return { x, y };
  }, []);

  const moveNoButton = useCallback(() => {
    if (!isPositionAbsolute) {
      setIsPositionAbsolute(true);
    }
    
    const newPosition = generateRandomPosition();
    setNoButtonPosition(newPosition);
    
    const newCount = evasionCount + 1;
    setEvasionCount(newCount);
    
    const textIndex = Math.min(newCount, noButtonTexts.length - 1);
    setNoButtonText(noButtonTexts[textIndex]);
    
    // Grow the Yes button
    setYesButtonScale(1 + newCount * 0.08);
  }, [evasionCount, generateRandomPosition, isPositionAbsolute]);

  const handleYesClick = () => {
    setShowSuccess(true);
  };

  const handleReset = () => {
    setShowSuccess(false);
    setNoButtonPosition({ x: 0, y: 0 });
    setNoButtonText("No 💔");
    setEvasionCount(0);
    setIsPositionAbsolute(false);
    setYesButtonScale(1);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isPositionAbsolute) {
        const newPosition = generateRandomPosition();
        setNoButtonPosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPositionAbsolute, generateRandomPosition]);

  if (showSuccess) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 gradient-bg overflow-hidden">
        <Confetti />
        
        <div className="success-card animate-bounce-in max-w-lg mx-auto z-10">
          <div className="mb-6 flex justify-center gap-2">
            <Heart className="w-12 h-12 text-primary fill-primary animate-pulse" />
            <Sparkles className="w-12 h-12 text-accent" />
            <Heart className="w-12 h-12 text-primary fill-primary animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Yay! You said Yes! 🎉💕
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            You just made me the happiest person! ❤️✨
          </p>
          
          {evasionCount > 0 && (
            <p className="text-sm text-muted-foreground mb-6">
              (You tried to say no {evasionCount} time{evasionCount > 1 ? 's' : ''}... but love wins! 💪)
            </p>
          )}
          
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all duration-300"
          >
            Start Over 🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 gradient-bg overflow-hidden">
      {/* Main Card */}
      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Heart decoration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Heart className="w-24 h-24 text-primary fill-primary animate-pulse" />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-accent" />
          </div>
        </div>
        
        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-foreground leading-tight">
          Will you be my Valentine? 💕
        </h1>
        
        <p className="text-lg text-muted-foreground mb-10">
          I promise to make you smile every single day ✨
        </p>
        
        {/* Buttons container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Yes Button */}
          <button
            onClick={handleYesClick}
            className="btn-yes pulse-glow"
            style={{
              transform: `scale(${yesButtonScale})`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            Yes! 💖
          </button>
          
          {/* No Button - in flow position */}
          {!isPositionAbsolute && (
            <button
              onMouseEnter={moveNoButton}
              onClick={moveNoButton}
              className="btn-no"
            >
              {noButtonText}
            </button>
          )}
        </div>
        
        {/* Evasion counter */}
        {evasionCount > 0 && (
          <p className="mt-6 text-sm text-muted-foreground animate-fade-in">
            Nice try! The No button escaped {evasionCount} time{evasionCount > 1 ? 's' : ''} 😄
          </p>
        )}
      </div>
      
      {/* No Button - absolute positioned when evading */}
      {isPositionAbsolute && (
        <button
          onMouseEnter={moveNoButton}
          onClick={moveNoButton}
          className="btn-no fixed z-50"
          style={{
            left: `${noButtonPosition.x}px`,
            top: `${noButtonPosition.y}px`,
            transition: 'all 0.3s ease-out',
          }}
        >
          {noButtonText}
        </button>
      )}
    </div>
  );
};

export default ValentineCard;
