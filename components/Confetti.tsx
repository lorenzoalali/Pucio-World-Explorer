import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  delay: number;
}

export const Confetti: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#D65A5A', '#C8D1A0', '#FFD700', '#4CAF50', '#2196F3'];
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200, // Spread X
      y: (Math.random() - 1) * 200, // Spread Y (upwards mostly)
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 0.2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm animate-[bounce_1s_ease-out_forwards]"
          style={{
            backgroundColor: p.color,
            '--tw-translate-x': `${p.x}px`,
            '--tw-translate-y': `${p.y}px`,
            '--tw-rotate': `${p.rotation}deg`,
             animation: `fall 1s ease-out forwards ${p.delay}s`
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tw-translate-x), 300px) rotate(var(--tw-rotate)); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
