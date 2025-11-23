import React, { useEffect, useState, useRef } from 'react';
import { Position } from '../types';

interface PucioProps {
  position: Position;
  isMoving: boolean;
  direction: 'left' | 'right';
  isJumping?: boolean;
}

export const Pucio: React.FC<PucioProps> = ({ position, isMoving, direction, isJumping }) => {
  const [tick, setTick] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Animation tick for walking cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 200); 
    return () => clearInterval(interval);
  }, []);

  // Blinking Logic
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      
      // Random blink interval between 2s and 6s
      const nextDelay = Math.random() * 4000 + 2000;
      setTimeout(blinkLoop, nextDelay);
    };

    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Dust Trail Logic
  const [dusts, setDusts] = useState<{id: number, x: number, y: number}[]>([]);
  const dustIdRef = useRef(0);
  const lastDustTime = useRef(0);

  useEffect(() => {
      if (isMoving) {
          const now = Date.now();
          if (now - lastDustTime.current > 200) { 
              lastDustTime.current = now;
              const id = dustIdRef.current++;
              // Offset dust based on direction
              const offsetX = direction === 'right' ? -20 : 20;
              setDusts(prev => [...prev.slice(-5), { id, x: offsetX, y: 0 }]);
              
              setTimeout(() => {
                  setDusts(prev => prev.filter(d => d.id !== id));
              }, 500);
          }
      }
  }, [isMoving, direction]);

  // --- Animation Logic from updated design ---
  
  // Jump: Applied to inner container. Preserves scale-105 animation effect relative to base scale.
  const jumpStyle = isJumping ? '-translate-y-6 scale-105' : 'translate-y-0';
  
  // Base Scale & Direction: Applied to wrapper.
  const wrapperTransform = direction === 'left' ? 'scale-x-[-2] scale-y-[2]' : 'scale-[2]';
  
  // Walking: simple leg sway logic
  const legLeftRot = isMoving ? (tick % 2 === 0 ? 'rotate-[25deg]' : '-rotate-[15deg]') : '-rotate-6';
  const legRightRot = isMoving ? (tick % 2 === 0 ? '-rotate-[15deg]' : 'rotate-[25deg]') : 'rotate-6';
  
  // Body bobbing when moving or breathing when idle
  const bodyBob = isMoving 
    ? (tick % 2 === 0 ? 'translate-y-1' : 'translate-y-0') 
    : 'animate-breathe';
  
  // Head tilt
  const headTilt = isMoving ? (tick % 2 === 0 ? 'rotate-2' : '-rotate-1') : 'rotate-0';

  // Eye Blink
  const eyeStyle = isBlinking ? 'scale-y-[0.1]' : 'scale-y-100';

  return (
    <div
      className="absolute transition-transform duration-75 ease-linear will-change-transform pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: 5, // Adjusted to keep Pucio behind actors regardless of position
        transform: `translate(-50%, -50%)`,
      }}
    >
       {/* Dust Particles Container */}
       <div className="absolute bottom-2 left-1/2 w-0 h-0 z-0">
          {dusts.map(d => (
              <div 
                key={d.id}
                className="absolute w-4 h-4 bg-white/40 rounded-full animate-dust blur-[1px]"
                style={{ left: d.x, top: d.y }}
              />
          ))}
      </div>

      {/* Character Visuals Wrapper - Handles Base Scale (2x) & Direction Flip */}
      <div className={`origin-bottom transition-transform duration-300 ${wrapperTransform}`}>
          
          {/* Inner Character Container - Handles Jump Animation & Dimensions */}
          <div
            className={`relative flex flex-col items-center justify-end w-48 h-64 ${jumpStyle} origin-bottom transition-transform duration-300`}
          >
            {/* --- CHARACTER BODY PARTS --- */}
            <div className={`relative z-20 flex flex-col items-center ${bodyBob} transition-transform duration-300`}>

                {/* --- HEAD --- */}
                <div className={`relative z-30 transition-transform duration-500 origin-bottom ${headTilt}`}>
                    {/* Hair Back (Bun/Volume) */}
                    <div className="absolute -top-1 left-0 w-20 h-20 bg-[#2A221B] rounded-full shadow-sm" />
                    
                    {/* Face Shape */}
                    <div className="relative w-20 h-20 bg-[#FADBC6] rounded-full overflow-hidden border-b-2 border-black/5 z-10">
                        {/* Hair Bangs */}
                        <div className="absolute top-0 w-full h-8 bg-[#2A221B]">
                            <div className="absolute bottom-0 w-full h-2 bg-[#2A221B] rounded-b-xl" />
                            <div className="absolute -bottom-1 left-2 w-4 h-4 bg-[#2A221B] rounded-full" />
                            <div className="absolute -bottom-2 right-4 w-6 h-6 bg-[#2A221B] rounded-full" />
                        </div>
                        
                        {/* Eyes */}
                        <div className={`absolute top-9 left-5 w-2 h-2 bg-white rounded-full transition-transform duration-100 origin-center ${eyeStyle}`}>
                            <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-black rounded-full" />
                        </div>
                        <div className={`absolute top-9 right-5 w-2 h-2 bg-white rounded-full transition-transform duration-100 origin-center ${eyeStyle}`}>
                            <div className="absolute top-1 left-0.5 w-0.5 h-0.5 bg-black rounded-full" />
                        </div>

                        {/* Nose */}
                        <div className="absolute top-11 left-1/2 transform -translate-x-1/2 w-1.5 h-2 bg-[#E8A696] rounded-full opacity-80" />

                        {/* Cheeks */}
                        <div className="absolute top-12 left-2 w-3 h-3 bg-[#E8A696] rounded-full opacity-40 blur-[1px]" />
                        <div className="absolute top-12 right-2 w-3 h-3 bg-[#E8A696] rounded-full opacity-40 blur-[1px]" />

                        {/* Mouth */}
                        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-black/20 rounded-full" />
                    </div>

                    {/* Ears */}
                    <div className="absolute top-9 -left-1 w-2 h-3 bg-[#FADBC6] rounded-l-full z-0" />
                    <div className="absolute top-9 -right-1 w-2 h-3 bg-[#FADBC6] rounded-r-full z-0" />
                </div>

                {/* --- BODY --- */}
                <div className="relative -mt-2 z-20 flex flex-col items-center">
                    {/* Shirt */}
                    <div className="w-16 h-20 bg-white rounded-3xl relative shadow-sm z-10">
                        {/* Green Circle P */}
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#C5CD9D] rounded-full flex items-center justify-center overflow-hidden">
                            <span className="text-white font-bold text-sm select-none">P</span>
                        </div>
                    </div>
                    
                    {/* Arms/Sleeves */}
                    {/* Left Arm */}
                    <div className={`absolute top-2 -left-1 w-4 h-12 bg-gray-200 rounded-full border-2 border-white flex flex-col justify-evenly overflow-hidden z-20 origin-top transition-transform duration-300 ${isMoving ? 'rotate-[20deg]' : 'rotate-12'}`}>
                        <div className="w-full h-[2px] bg-gray-400" />
                        <div className="w-full h-[2px] bg-gray-400" />
                        <div className="w-full h-[2px] bg-gray-400" />
                        <div className="absolute bottom-0 w-full h-3 bg-[#FADBC6] rounded-b-full" />
                    </div>

                    {/* Right Arm */}
                    <div className={`absolute top-2 -right-1 w-4 h-12 bg-gray-200 rounded-full border-2 border-white flex flex-col justify-evenly overflow-hidden z-20 origin-top transition-transform duration-300 ${isMoving ? '-rotate-[20deg]' : '-rotate-12'}`}>
                        <div className="w-full h-[2px] bg-gray-400" />
                        <div className="w-full h-[2px] bg-gray-400" />
                        <div className="w-full h-[2px] bg-gray-400" />
                        <div className="absolute bottom-0 w-full h-3 bg-[#FADBC6] rounded-b-full" />
                    </div>
                </div>

                {/* --- LEGS WITH FEET --- */}
                <div className="flex -mt-3 space-x-2 z-10">
                    
                    {/* Left Leg + Shoe */}
                    <div className={`relative w-5 h-12 origin-top transition-transform duration-300 ${legLeftRot}`}>
                        {/* Pant Leg */}
                        <div className="absolute top-0 left-0 w-full h-9 bg-[#2A221B] rounded-t-lg rounded-b-sm z-10" />
                        {/* Red Sneaker */}
                        <div className="absolute bottom-0 -left-1 w-8 h-4 bg-[#D95C5C] rounded-full z-0">
                            {/* White Sole */}
                            <div className="absolute bottom-0 w-full h-1.5 bg-white rounded-full border-t border-black/5" />
                            {/* Toe Highlight */}
                            <div className="absolute top-1 right-1 w-2 h-1.5 bg-white/30 rounded-full blur-[0.5px]" />
                        </div>
                    </div>

                    {/* Right Leg + Shoe */}
                    <div className={`relative w-5 h-12 origin-top transition-transform duration-300 ${legRightRot}`}>
                        {/* Pant Leg */}
                        <div className="absolute top-0 left-0 w-full h-9 bg-[#2A221B] rounded-t-lg rounded-b-sm z-10" />
                        {/* Red Sneaker */}
                        <div className="absolute bottom-0 -left-1 w-8 h-4 bg-[#D95C5C] rounded-full z-0">
                            {/* White Sole */}
                            <div className="absolute bottom-0 w-full h-1.5 bg-white rounded-full border-t border-black/5" />
                            {/* Toe Highlight */}
                            <div className="absolute top-1 right-1 w-2 h-1.5 bg-white/30 rounded-full blur-[0.5px]" />
                        </div>
                    </div>
                    
                </div>

                {/* Shadow */}
                <div className="absolute -bottom-1 w-28 h-2 bg-black/10 rounded-full blur-sm z-0 transition-all duration-300 scale-x-100" />

            </div>
          </div>
      </div>
      
      {/* Name tag below character */}
      <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 border-2 border-black/5 px-2 py-0.5 rounded-full text-xs font-bold text-dark-text whitespace-nowrap shadow-sm`}>
        Pucio
      </div>
    </div>
  );
};
