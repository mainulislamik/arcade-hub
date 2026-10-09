import React, { useState, useEffect } from 'react';
import { Trophy } from '../../utils/achievementEngine';
import { Trophy as TrophyIcon, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

export const AchievementNotification: React.FC = () => {
  const [activeTrophy, setActiveTrophy] = useState<Trophy | null>(null);

  useEffect(() => {
    const handleTrophy = (e: Event) => {
      const customEvent = e as CustomEvent<Trophy>;
      if (customEvent.detail) {
        setActiveTrophy(customEvent.detail);
        sounds.playPowerup();
        setTimeout(() => {
          setActiveTrophy(null);
        }, 5000);
      }
    };

    window.addEventListener('arcadex:trophy_unlocked', handleTrophy);
    return () => window.removeEventListener('arcadex:trophy_unlocked', handleTrophy);
  }, []);

  if (!activeTrophy) return null;

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900 border-amber-500/60 shadow-amber-900/40',
    silver: 'from-slate-400 to-slate-600 border-slate-300/60 shadow-slate-900/40',
    gold: 'from-yellow-400 to-amber-600 border-yellow-300/80 shadow-yellow-500/40',
    platinum: 'from-cyan-400 via-indigo-500 to-purple-600 border-cyan-300/90 shadow-cyan-500/40'
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-bounce-in">
      <div className={`flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r ${tierColors[activeTrophy.tier]} text-white border shadow-2xl backdrop-blur-xl max-w-sm`}>
        <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-2xl shrink-0 border border-white/20">
          {activeTrophy.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-amber-300">
            <TrophyIcon className="w-3 h-3" />
            <span>Achievement Unlocked ({activeTrophy.tier})</span>
            <Sparkles className="w-3 h-3 animate-spin text-yellow-200" />
          </div>
          <h4 className="text-sm font-black text-white truncate drop-shadow">{activeTrophy.title}</h4>
          <p className="text-xs text-white/90 line-clamp-1 leading-snug">{activeTrophy.description}</p>
        </div>
      </div>
    </div>
  );
};
