import { useEffect, useState } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  type: 'heart' | 'sparkle' | 'star';
  color: string;
  size: number;
}

const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = [
      'text-primary',
      'text-accent',
      'text-rose-400',
      'text-pink-300',
      'text-red-400',
    ];
    const types: ConfettiPiece['type'][] = ['heart', 'sparkle', 'star'];

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 2,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 16 + 10,
      });
    }
    setPieces(newPieces);
  }, []);

  const getIcon = (type: ConfettiPiece['type'], size: number, color: string) => {
    const props = { size, className: `${color} fill-current` };
    switch (type) {
      case 'heart':
        return <Heart {...props} />;
      case 'sparkle':
        return <Sparkles {...props} />;
      case 'star':
        return <Star {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          {getIcon(piece.type, piece.size, piece.color)}
        </div>
      ))}
    </div>
  );
};

export default Confetti;
