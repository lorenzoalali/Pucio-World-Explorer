
import React from 'react';
import { ActorData, Language } from '../types';
import { UI_TEXT } from '../constants';

interface StickerBookProps {
  isOpen: boolean;
  onClose: () => void;
  actors: ActorData[];
  discoveredIds: Set<string>;
  language: Language;
}

export const StickerBook: React.FC<StickerBookProps> = ({ isOpen, onClose, actors, discoveredIds, language }) => {
  if (!isOpen) return null;

  const ui = UI_TEXT[language];
  const collectables = actors; 
  const total = collectables.length;
  const found = discoveredIds.size;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-8 border-sage-green relative">
        
        {/* Header */}
        <div className="bg-sage-green p-4 flex justify-between items-center">
          <h2 className="text-3xl font-heading text-white drop-shadow-md">{ui.stickerTitle}</h2>
          <button onClick={onClose} className="bg-white text-sage-green w-10 h-10 rounded-full font-bold text-xl hover:scale-110 transition-transform shadow-md">✕</button>
        </div>

        {/* Progress */}
        <div className="bg-sage-light px-6 py-4 border-b-2 border-sage-green/20">
            <div className="flex justify-between text-dark-text font-bold mb-2 font-hand text-xl">
                <span>{ui.collection}</span>
                <span>{found} / {total}</span>
            </div>
            <div className="w-full bg-white rounded-full h-6 overflow-hidden border-4 border-white shadow-inner">
                <div 
                    className="bg-accent-red h-full transition-all duration-1000 ease-out stripe-pattern"
                    style={{ width: `${(found / total) * 100}%` }}
                />
            </div>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FDFBF7]">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-4">
                {collectables.map(actor => {
                    const isFound = discoveredIds.has(actor.id);
                    return (
                        <div key={actor.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border-4 transition-all duration-500 ${isFound ? 'bg-white border-sage-green scale-100 rotate-0 shadow-lg' : 'bg-gray-200 border-gray-300 scale-95 grayscale opacity-60'}`}>
                            <div className={`text-4xl md:text-5xl mb-2 transition-transform duration-500 ${isFound ? 'scale-100' : 'scale-75 blur-[1px]'}`}>
                                {isFound ? actor.emoji : actor.emoji}
                            </div>
                            <div className="text-sm md:text-base font-bold text-center text-dark-text/80 leading-tight font-hand">
                                {isFound ? actor.name : '???'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      <style>{`
        .stripe-pattern {
            background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
            background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};
