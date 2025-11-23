
import React from 'react';
import { Language } from '../types';

interface LanguageMenuProps {
  onSelect: (lang: Language) => void;
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({ onSelect }) => {
  return (
    <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-[#E6EBC5]">

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#C8D1A0 15%, transparent 15%), radial-gradient(#C8D1A0 15%, transparent 15%)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
        }}
      />

      <div className="relative z-10 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-white flex flex-col items-center gap-8 max-w-md w-full mx-4 animate-pop-in">

        <div className="text-center">
          <h1 className="text-4xl font-heading text-accent-red mb-2 drop-shadow-sm">Pucio World Explorer</h1>
          <p className="text-dark-text font-hand text-xl opacity-80">Jeux Sonores / Sound Games / Zabawy Dźwiękowe</p>
        </div>

        <div className="flex flex-col w-full gap-4">
          <button
            onClick={() => onSelect('fr')}
            className="group relative w-full bg-white border-2 border-gray-200 hover:border-sky-400 rounded-xl p-4 flex items-center gap-4 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="text-4xl">🇫🇷</span>
            <span className="font-heading text-xl text-dark-text group-hover:text-sky-500">Français</span>
          </button>

          <button
            onClick={() => onSelect('pl')}
            className="group relative w-full bg-white border-2 border-gray-200 hover:border-accent-red rounded-xl p-4 flex items-center gap-4 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="text-4xl">🇵🇱</span>
            <span className="font-heading text-xl text-dark-text group-hover:text-accent-red">Polski</span>
          </button>

          <button
            onClick={() => onSelect('en')}
            className="group relative w-full bg-white border-2 border-gray-200 hover:border-sage-green rounded-xl p-4 flex items-center gap-4 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="text-4xl">🇬🇧</span>
            <span className="font-heading text-xl text-dark-text group-hover:text-sage-green">English</span>
          </button>
        </div>

        <div className="text-center text-lg text-dark-text/90 mt-6 px-2 font-hand font-bold leading-relaxed">
          Based on the character Pucio created by Dr. Marta Galewska-Kustra, published by Nasza Księgarnia.
          <br />
          <a
            href="https://nk.com.pl/oferta-specjalna/pucio.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 underline hover:text-sky-800 text-base font-normal block mt-1"
          >
            https://nk.com.pl/oferta-specjalna/pucio.html
          </a>
          <div className="mt-4 font-normal text-base">
            Game created by Lorenzo Alali <a href="https://github.com/lorenzoalali" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800">https://github.com/lorenzoalali</a>
          </div>
        </div>
      </div>
    </div>
  );
};
