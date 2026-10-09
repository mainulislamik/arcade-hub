import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  X, 
  Award, 
  Crown,
  Medal,
  Star,
  Flame,
  Zap,
  Filter
} from 'lucide-react';
import { AchievementEngine, Trophy as TrophyItem } from '../utils/achievementEngine';
import { sounds } from '../utils/soundEngine';
import { HapticEngine } from '../utils/hapticEngine';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements?: any[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [trophies, setTrophies] = useState<TrophyItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    if (isOpen) {
      setTrophies(AchievementEngine.getAllTrophies());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unlockedCount = trophies.filter(t => t.unlocked).length;
  const totalCount = trophies.length;
  const totalPoints = trophies.filter(t => t.unlocked).reduce((sum, t) => sum + t.points, 0);
  const maxPoints = trophies.reduce((sum, t) => sum + t.points, 0);
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredTrophies = trophies.filter(t => {
    if (activeFilter === 'unlocked') return t.unlocked;
    if (activeFilter === 'locked') return !t.unlocked;
    return true;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'PLATINUM', color: 'from-cyan-400 to-indigo-400 text-slate-950 border-cyan-300' };
      case 'gold':
        return { label: 'GOLD', color: 'from-amber-400 to-yellow-500 text-slate-950 border-amber-300' };
      case 'silver':
        return { label: 'SILVER', color: 'from-slate-200 to-slate-400 text-slate-900 border-slate-200' };
      default:
        return { label: 'BRONZE', color: 'from-amber-700 to-amber-900 text-amber-100 border-amber-600' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden shadow-amber-950/50 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Trophy className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                TROPHY VAULT & GAMERSCORE
                <Crown className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-amber-100 font-medium">Unlock badges & achievements across all 37 Arcadex games</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gamerscore Summary Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Gamerscore</span>
                <span className="text-xl font-black text-amber-300 font-mono">{totalPoints} / {maxPoints} GS</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Trophies Unlocked</span>
              <span className="text-lg font-black text-white">{unlockedCount} of {totalCount} ({progressPercent}%)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full sm:w-48 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => { sounds.playClick(); HapticEngine.lightTick(); setActiveFilter(f); }}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all capitalize cursor-pointer ${
                activeFilter === f
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? `All Trophies (${totalCount})` : f === 'unlocked' ? `Unlocked (${unlockedCount})` : `Locked (${totalCount - unlockedCount})`}
            </button>
          ))}
        </div>

        {/* Trophies Grid */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 max-h-96">
          {filteredTrophies.map(trophy => {
            const tierInfo = getTierBadge(trophy.tier);

            return (
              <div
                key={trophy.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  trophy.unlocked
                    ? 'bg-slate-950/80 border-slate-700 hover:border-amber-500/40'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border ${
                    trophy.unlocked
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {trophy.unlocked ? <Trophy className="w-5 h-5 text-amber-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white truncate">{trophy.title}</h4>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r ${tierInfo.color} border`}>
                        {tierInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{trophy.description}</p>
                    {trophy.unlockedAt && (
                      <span className="text-[10px] text-amber-400/80 font-medium block mt-1">
                        Unlocked on {new Date(trophy.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded-lg">
                    +{trophy.points} GS
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Auto-saved to local browser vault</span>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-900/40 cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
