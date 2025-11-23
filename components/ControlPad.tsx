
import React from 'react';

interface ControlPadProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

export const ControlPad: React.FC<ControlPadProps> = ({ onMove, onStop }) => {
  // Helper to prevent default context menu on long press
  const handleStart = (e: React.SyntheticEvent, dx: number, dy: number) => {
    e.preventDefault();
    onMove(dx, dy);
  };

  // Jelly button style: Large, rounded, bottom border for depth/3D feel, squishy on active
  const btnClass = "w-16 h-16 bg-white/90 backdrop-blur-sm border-b-[6px] border-r-[2px] border-gray-200/80 active:border-b-0 active:border-t-[6px] active:translate-y-[6px] rounded-2xl shadow-xl flex items-center justify-center text-3xl select-none touch-none transition-all duration-75 text-sky-500 hover:text-sky-600 hover:bg-white";

  return (
    <div className="absolute bottom-6 left-6 flex flex-col items-center gap-3 z-40 md:hidden opacity-90 pb-4 pl-2">
      <button 
        className={btnClass}
        onPointerDown={(e) => handleStart(e, 0, -1.5)} 
        onPointerUp={onStop}
        onPointerLeave={onStop}
        aria-label="Haut"
      >
        ⬆️
      </button>
      <div className="flex gap-3">
        <button 
            className={btnClass}
            onPointerDown={(e) => handleStart(e, -1.5, 0)} 
            onPointerUp={onStop}
            onPointerLeave={onStop}
            aria-label="Gauche"
        >
            ⬅️
        </button>
        <button 
            className={btnClass}
            onPointerDown={(e) => handleStart(e, 0, 1.5)} 
            onPointerUp={onStop}
            onPointerLeave={onStop}
            aria-label="Bas"
        >
            ⬇️
        </button>
        <button 
            className={btnClass}
            onPointerDown={(e) => handleStart(e, 1.5, 0)} 
            onPointerUp={onStop}
            onPointerLeave={onStop}
            aria-label="Droite"
        >
            ➡️
        </button>
      </div>
    </div>
  );
};
