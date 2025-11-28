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
      const nextDelay = Math.random() * 4000 + 2000;
      setTimeout(blinkLoop, nextDelay);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Dust Trail Logic
  const [dusts, setDusts] = useState<{ id: number, x: number, y: number }[]>([]);
  const dustIdRef = useRef(0);
  const lastDustTime = useRef(0);

  useEffect(() => {
    if (isMoving) {
      const now = Date.now();
      if (now - lastDustTime.current > 200) {
        lastDustTime.current = now;
        const id = dustIdRef.current++;
        const offsetX = direction === 'right' ? -20 : 20;
        setDusts(prev => [...prev.slice(-5), { id, x: offsetX, y: 0 }]);

        setTimeout(() => {
          setDusts(prev => prev.filter(d => d.id !== id));
        }, 500);
      }
    }
  }, [isMoving, direction]);

  // --- Animation Logic ---
  const jumpStyle = isJumping ? '-translate-y-8 scale-105' : 'translate-y-0';
  const wrapperTransform = direction === 'left' ? 'scale-x-[-1.8] scale-y-[1.8]' : 'scale-[1.8]';

  // Leg movement logic
  const legLeftRot = isMoving ? (tick % 2 === 0 ? 'rotate-[25deg] -translate-y-1' : '-rotate-[15deg]') : '-rotate-1';
  const legRightRot = isMoving ? (tick % 2 === 0 ? '-rotate-[15deg]' : 'rotate-[25deg] -translate-y-1') : 'rotate-1';

  const bodyBob = isMoving
    ? (tick % 2 === 0 ? 'translate-y-1 rotate-1' : 'translate-y-0 -rotate-1')
    : 'animate-breathe';

  const headTilt = isMoving ? (tick % 2 === 0 ? 'rotate-2' : '-rotate-1') : 'rotate-0';
  const eyeStyle = isBlinking ? 'scale-y-[0.1]' : 'scale-y-100';

  // Colors
  const skinColor = "bg-[#FADBC6]";
  const hairColor = "bg-[#281E1A]";
  const cheekColor = "bg-[#FF6B6B]";
  const shoeColor = "bg-[#D95C5C]";

  return (
    <div
      className="absolute transition-transform duration-75 ease-linear will-change-transform pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: 5,
        transform: `translate(-50%, -50%)`,
      }}
    >
      {/* Dust Particles */}
      <div className="absolute bottom-0 left-1/2 w-0 h-0 z-0">
        {dusts.map(d => (
          <div
            key={d.id}
            className="absolute w-3 h-3 bg-[#E8DCC4] rounded-full animate-dust opacity-60"
            style={{ left: d.x, top: d.y }}
          />
        ))}
      </div>

      {/* Main Scaled Wrapper */}
      <div className={`origin-bottom transition-transform duration-300 ${wrapperTransform}`}>

        {/* Action Wrapper */}
        <div className={`relative flex flex-col items-center justify-end w-40 h-64 ${jumpStyle} origin-bottom transition-transform duration-300`}>

          {/* --- CHARACTER --- */}
          <div className={`relative z-20 flex flex-col items-center ${bodyBob} transition-transform duration-300`}>

            {/* --- HEAD GROUP --- */}
            <div className={`relative z-30 transition-transform duration-500 origin-bottom ${headTilt}`}>

              {/* Back Hair (Base shape - The "Bun" or bulk of hair) */}
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-[6.2rem] h-24 ${hairColor} rounded-[45%] shadow-sm`} />

              {/* Ears */}
              <div className={`absolute top-12 -left-2 w-4 h-5 ${skinColor} rounded-full`} />
              <div className={`absolute top-12 -right-2 w-4 h-5 ${skinColor} rounded-full`} />

              {/* Face Shape */}
              <div className={`relative w-28 h-24 ${skinColor} rounded-[42%_42%_48%_48%/45%_45%_55%_55%] overflow-hidden border-b-2 border-black/5 z-10 shadow-inner`}>

                {/* Hair Bangs - Swooping across */}
                <div className={`absolute -top-9 -left-4 w-36 h-20 ${hairColor} rotate-[-8deg] rounded-[50%]`} />

                {/* Eyes - Small and distinct */}
                <div className={`absolute top-[2.6rem] left-[1.8rem] w-[0.85rem] h-[0.85rem] bg-white rounded-full transition-transform duration-100 origin-center flex items-center justify-center ${eyeStyle}`}>
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
                <div className={`absolute top-[2.6rem] right-[1.8rem] w-[0.85rem] h-[0.85rem] bg-white rounded-full transition-transform duration-100 origin-center flex items-center justify-center ${eyeStyle}`}>
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>

                {/* Nose - "Droplet" Shape */}
                <div className="absolute top-[3.0rem] left-1/2 -translate-x-1/2 ml-[2px] w-2.5 h-2.5 bg-[#E69385] rounded-[0%_50%_50%_50%] rotate-[45deg] opacity-90" />

                {/* Cheeks */}
                <div className={`absolute top-[3.3rem] left-2 w-5 h-5 ${cheekColor} rounded-full opacity-60 blur-[3px]`} />
                <div className={`absolute top-[3.3rem] right-2 w-5 h-5 ${cheekColor} rounded-full opacity-60 blur-[3px]`} />

                {/* Mouth - Small Red Tongue */}
                <div className="absolute top-[4.5rem] left-1/2 transform -translate-x-1/2 w-2.5 h-1.5 bg-[#E34848] rounded-b-full" />

                {/* Freckles */}
                <div className="absolute top-[3.6rem] left-3 w-0.5 h-0.5 bg-[#BCAAA4] rounded-full opacity-50" />
                <div className="absolute top-[3.9rem] right-4 w-0.5 h-0.5 bg-[#BCAAA4] rounded-full opacity-50" />
              </div>
            </div>

            {/* --- BODY --- */}
            <div className="relative -mt-3 z-20 flex flex-col items-center">
              {/* Shirt */}
              <div className="w-[4.2rem] h-[5rem] bg-white rounded-[1.8rem] relative shadow-sm z-10 flex flex-col items-center border border-gray-50">
                {/* Small Green Circle P */}
                <div className="mt-5 w-7 h-7 bg-[#C5CD9D] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs leading-none font-sans" style={{ textShadow: '0px 1px 0px rgba(0,0,0,0.1)' }}>P</span>
                </div>
              </div>

              {/* --- ARMS --- */}
              {/* Left Arm */}
              <div className={`absolute top-2 -left-2 w-[1.1rem] h-12 bg-white rounded-full border border-gray-100 flex flex-col items-center overflow-hidden z-20 origin-top transition-transform duration-300 ${isMoving ? 'rotate-[25deg]' : 'rotate-12'}`}>
                <div className="mt-3 w-full h-[2px] bg-gray-300" />
                <div className="mt-2 w-full h-[2px] bg-gray-300" />
                <div className="mt-2 w-full h-[2px] bg-gray-300" />
                <div className={`absolute bottom-0 w-full h-2.5 ${skinColor} rounded-b-full`} />
              </div>

              {/* Right Arm */}
              <div className={`absolute top-2 -right-2 w-[1.1rem] h-12 bg-white rounded-full border border-gray-100 flex flex-col items-center overflow-hidden z-20 origin-top transition-transform duration-300 ${isMoving ? '-rotate-[25deg]' : '-rotate-12'}`}>
                <div className="mt-3 w-full h-[2px] bg-gray-300" />
                <div className="mt-2 w-full h-[2px] bg-gray-300" />
                <div className="mt-2 w-full h-[2px] bg-gray-300" />
                <div className={`absolute bottom-0 w-full h-2.5 ${skinColor} rounded-b-full`} />
              </div>
            </div>

            {/* --- LEGS (Spaced out) --- */}
            <div className="flex -mt-4 space-x-3 z-10">
              {/* Left Leg */}
              <div className={`relative w-[1.1rem] h-14 origin-top transition-transform duration-300 ${legLeftRot}`}>
                <div className="absolute top-0 left-0 w-full h-11 bg-[#2A221B] rounded-sm z-10" />
                <div className={`absolute bottom-0 -left-1 w-[1.6rem] h-4 ${shoeColor} rounded-full z-0`}>
                  <div className="absolute bottom-0 right-1 w-1 h-1 bg-white/20 rounded-full blur-[1px]" />
                </div>
              </div>

              {/* Right Leg */}
              <div className={`relative w-[1.1rem] h-14 origin-top transition-transform duration-300 ${legRightRot}`}>
                <div className="absolute top-0 left-0 w-full h-11 bg-[#2A221B] rounded-sm z-10" />
                <div className={`absolute bottom-0 -left-1 w-[1.6rem] h-4 ${shoeColor} rounded-full z-0`}>
                  <div className="absolute bottom-0 right-1 w-1 h-1 bg-white/20 rounded-full blur-[1px]" />
                </div>
              </div>
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-2 w-24 h-3 bg-black/10 rounded-[50%] blur-sm z-0" />

          </div>
        </div>
      </div>

      {/* Name tag */}
      <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm border border-black/5 px-3 py-1 rounded-xl text-xs font-bold text-gray-600 shadow-sm`}>
        Pucio
      </div>
    </div>
  );
};