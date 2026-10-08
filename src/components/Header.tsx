import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Gamepad2, BarChart3, Heart, Award } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  favoritesCount: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenStats,
  onOpenAchievements,
  favoritesCount,
  unlockedAchievementsCount,
  totalAchievementsCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.location.href = '/'}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center">
                ARCAD<span className="text-indigo-600">EX</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Zero Server Compute • Instant Web Arcade
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Favorites Filter */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFavoritesOnly();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showFavoritesOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-rose-600'
            }`}
            title="Toggle Favorites Filter"
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Achievements Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all shadow-sm"
            title="View Achievements"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Trophies</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {unlockedAchievementsCount}/{totalAchievementsCount}
            </span>
          </button>

          {/* Stats Drawer Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenStats();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all shadow-sm"
            title="Player Stats & Save Data"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline">My Stats</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Mute Sound Synthesis' : 'Unmute Sound Synthesis'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
