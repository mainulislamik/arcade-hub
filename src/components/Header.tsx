import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Gamepad2, BarChart3, Heart } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenStats,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400">
                ARCADEX
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                NO LOGIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Zero Server Compute • 100% Client-Side Games
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Favorites Filter */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              showFavoritesOnly
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Show Favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="hidden md:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-slate-950 text-[10px] font-black rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? 'bg-slate-900/80 border-slate-800 text-cyan-400 hover:bg-slate-800'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Mute 8-Bit Audio' : 'Unmute 8-Bit Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stats & Highscores Drawer Trigger */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>My Stats</span>
          </button>
        </div>
      </div>
    </header>
  );
};
