import FloatingHearts from '@/components/FloatingHearts';
import MusicPlayer from '@/components/MusicPlayer';
import ValentineCard from '@/components/ValentineCard';

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingHearts />
      <MusicPlayer videoId="GxldQ9eX2wo" />
      <ValentineCard />
    </div>
  );
};

export default Index;
