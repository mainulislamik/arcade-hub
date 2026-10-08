import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Gamepad2, BarChart3, Heart, Award } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
  unlockedAchievementsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenStats,
  onOpenAchievements,
  showFavoritesOnly,
  onToggleFavorites,
  favoriteCount,
  unlockedAchievementsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            if (window.location.search) {
              e.preventDefault();
              window.history.pushState({}, '', window.location.pathname);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition duration-300">
            <Gamepad2 className="w-5 h-5 fill-current" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                ARCADEX
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">0% Server Compute • 100% Client Arcade</p>
          </div>
        </a>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Favorites Filter */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFavorites();
            }}
            title="Toggle Favorites"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showFavoritesOnly
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="hidden md:inline">Favorites</span>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Achievements Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            title="Arcade Badges & Achievements"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-850 transition-all"
          >
            <Award className="w-4 h-4" />
            <span className="hidden md:inline">Badges</span>
            {unlockedAchievementsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                {unlockedAchievementsCount}
              </span>
            )}
          </button>

          {/* Stats Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenStats();
            }}
            title="Player Stats & Records"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:bg-slate-850 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Stats</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute Procedural Web Audio' : 'Enable Procedural Web Audio'}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400 hover:bg-cyan-900/50'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
