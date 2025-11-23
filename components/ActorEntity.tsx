import React, { useState, useEffect } from 'react';
import { ActorData } from '../types';

interface ActorEntityProps {
  data: ActorData;
  isActive: boolean; // If currently triggering sound
  isNear: boolean;   // If Pucio is close enough to interact
  isCelebrating?: boolean;
  onClick: () => void;
}

export const ActorEntity: React.FC<ActorEntityProps> = ({ data, isActive, isNear, isCelebrating, onClick }) => {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Style construction for transform
  const transformStyle = [
    data.scale ? `scale(${data.scale})` : '',
    data.flip ? 'scaleX(-1)' : '',
    data.rotation ? `rotate(${data.rotation}deg)` : '',
    // Celebration overrides interaction scale
    isCelebrating ? 'scale(3)' : (isNear && !isActive && !data.isObstacle ? 'scale(1.1)' : '') 
  ].filter(Boolean).join(' ');

  const isSky = data.placement === 'sky';
  const isObstacle = data.isObstacle;

  // Disable animation during celebration to prevent CSS transform conflicts
  const animationClass = isCelebrating 
    ? '' 
    : (data.animation || (isSky ? 'animate-float' : 'animate-breathe'));

  return (
    <div
      className={`absolute flex justify-center items-center cursor-pointer transition-all duration-300 select-none group`}
      style={{
        left: `${data.defaultPos.x}%`,
        top: `${data.defaultPos.y}%`,
        // Sky elements are always "behind" tall ground elements usually, but we rely on Y sort for ground
        // For sky, we force a high Z if it's "flying over", or low Z if it's background. 
        // We force high Z-index if celebrating so it pops over everything.
        zIndex: isCelebrating ? 200 : Math.floor(data.defaultPos.y), 
        transform: `translate(-50%, -50%)`,
      }}
      onClick={onClick}
    >
      {/* Shadow / Grounding */}
      {isSky ? (
        // Shadow projected on ground for flying objects
        <div className="absolute top-[120px] w-16 h-4 bg-black/10 blur-md rounded-full animate-float" />
      ) : (
        // Shadow for ground objects
        <div className={`absolute top-[60%] w-[80%] h-[30%] bg-black/20 blur-sm rounded-[50%] ${isObstacle ? 'w-[90%] h-[40%] opacity-40' : ''}`} />
      )}

      {/* Interaction Halo/Glow when near (Only for non-obstacles) */}
      {!isObstacle && (
        <>
            <div 
                className={`absolute w-[110%] h-[110%] rounded-full bg-white/50 -z-10 transition-all duration-500 blur-xl
                ${isNear ? 'opacity-100 scale-110 animate-pulse' : 'opacity-0 scale-0'}`}
            />
            <div 
                className={`absolute w-[130%] h-[130%] rounded-full border-[3px] border-dashed border-accent-red -z-10 transition-all duration-300
                ${isNear ? 'opacity-70 rotate-180' : 'opacity-0 rotate-0'}`}
            />
        </>
      )}

      {/* Speech Bubble */}
      {showBubble && (
        <div className={`absolute -top-28 left-1/2 -translate-x-1/2 bg-white border-4 border-dark-text text-dark-text px-6 py-3 rounded-3xl rounded-bl-none whitespace-nowrap font-heading text-3xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)] z-[100] animate-pop-in ${data.flip ? 'scale-x-[-1]' : ''}`}>
          {data.sound}
        </div>
      )}

      {/* Emoji Content Container */}
      <div 
        className={`
            transition-transform duration-300 
            ${animationClass} 
            ${isNear && !isObstacle ? '-translate-y-4' : ''}
            text-[6rem] md:text-[8rem]
        `}
        style={{ 
            transform: transformStyle,
            filter: 'drop-shadow(0px 4px 0px rgba(0,0,0,0.1)) drop-shadow(0 0 2px rgba(255,255,255,1))' 
        }}
      >
        {data.emoji}
      </div>
    </div>
  );
};