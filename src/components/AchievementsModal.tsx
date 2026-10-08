import React from 'react';
import { Achievement } from '../types/game';
import { X, Trophy, Sparkles, CheckCircle2, Lock, Flame } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Arcade Hall of Fame
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">
                Unlocked {unlockedCount} of {achievements.length} Badges ({progressPercent}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2">
          <div
            className="bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Badges Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-slate-850/80 border-cyan-500/30 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-2xl flex items-center justify-center ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-cyan-500/40 text-amber-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-600'
                }`}
              >
                {ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-slate-500" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-bold text-sm ${
                      ach.unlocked ? 'text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    {ach.title}
                  </h4>
                  {ach.unlocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
                {ach.unlocked && ach.unlockedAt && (
                  <span className="text-[10px] text-slate-500 block mt-1.5 font-mono">
                    Earned: {new Date(ach.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
