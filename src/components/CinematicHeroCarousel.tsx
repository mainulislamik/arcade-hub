import React, { useState, useEffect } from 'react';
import { GameItem } from '../types/game';
import { Play, Sparkles, Star, Trophy, Info, ChevronLeft, ChevronRight, Gamepad2, Shield, Heart, Eye, Box } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface CinematicHeroCarouselProps {
  games: GameItem[];
  onPlayGame: (game: GameItem) => void;
  onOpenInfo: (game: GameItem) => void;
  onToggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  onToggle3DView: () => void;
  is3DViewActive: boolean;
}

export const CinematicHeroCarousel: React.FC<CinematicHeroCarouselProps> = ({
  games,
  onPlayGame,
  onOpenInfo,
  onToggleFavorite,
  isFavorite,
  onToggle3DView,
  is3DViewActive
}) => {
  const featuredGames = games.filter(g => g.heroImage || g.isFeatured || ['galaxy-defender', 'word-quest', 'asteroid-blaster', 'snake'].includes(g.id));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto rotate carousel every 7 seconds when not hovered
  useEffect(() => {
    if (isHovered || is3DViewActive || featuredGames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredGames.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, is3DViewActive, featuredGames.length]);

  if (featuredGames.length === 0) return null;
  const currentGame = featuredGames[currentIndex] || featuredGames[0];
  const fav = isFavorite(currentGame.id);

  const handleSelect = (index: number) => {
    sounds.playClick();
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    sounds.playClick();
    setCurrentIndex(prev => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  const handleNext = () => {
    sounds.playClick();
    setCurrentIndex(prev => (prev + 1) % featuredGames.length);
  };

  return (
    <section 
      className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-2xl transition-all duration-500 mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Hero Key Art with High-Grade Contrast Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentGame.heroImage || currentGame.coverImage}
          alt={currentGame.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out filter brightness-90"
        />
        {/* Cinematic Dual Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
      </div>

      {/* Top Floating Utility Bar */}
      <div className="relative z-20 flex items-center justify-between p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600/90 text-white font-bold text-xs tracking-wider uppercase backdrop-blur-md shadow-lg shadow-indigo-500/30 border border-indigo-400/40">
            <Sparkles className="w-3.5 h-3.5" />
            {currentGame.proBadge || 'ARCADE SPOTLIGHT'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 text-emerald-400 font-semibold text-xs border border-slate-700/60 backdrop-blur-md">
            <Shield className="w-3 h-3" /> 0% SERVER COMPUTE
          </span>
        </div>

        {/* 3D WebGL vs Cinematic Mode Switcher */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggle3DView();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border backdrop-blur-md shadow-lg ${
            is3DViewActive
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
          title="Toggle interactive 3D WebGL Arcade Machine"
        >
          <Box className="w-4 h-4 animate-pulse" />
          <span>{is3DViewActive ? 'Interactive 3D Active' : 'Switch to 3D Stage'}</span>
        </button>
      </div>

      {/* Hero Content Section */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 sm:px-10 pb-8 pt-2">
        <div className="lg:col-span-8 flex flex-col justify-end">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
              {currentGame.category.toUpperCase()} • 60 FPS WEB
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {currentGame.rating.toFixed(1)} ★ ({currentGame.reviewCount || 1200}+ verified)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700">
              {currentGame.difficulty} Mode
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            {currentGame.title}
          </h1>

          {/* Long / Rich Description */}
          <p className="text-slate-300 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 max-w-2xl mb-6 font-normal leading-relaxed">
            {currentGame.longDescription || currentGame.description}
          </p>

          {/* Action Buttons (Cinematic Style) */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                sounds.playVictory();
                onPlayGame(currentGame);
              }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-indigo-600/40 hover:shadow-indigo-500/60 transition-all duration-200 border border-indigo-400/50 group"
            >
              <Play className="w-5 h-5 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>PLAY NOW</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onOpenInfo(currentGame);
              }}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all duration-200"
            >
              <Info className="w-4 h-4 text-slate-300" />
              <span>GAME GUIDE & CHEATS</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onToggleFavorite(currentGame.id);
              }}
              className={`p-4 rounded-2xl border transition-all duration-200 backdrop-blur-md ${
                fav
                  ? 'bg-rose-600/90 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 text-slate-300 hover:text-white border-white/20 hover:bg-white/20'
              }`}
              title={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Side PlayStation Miniature Thumbnails Carousel */}
        <div className="lg:col-span-4 flex flex-col justify-end">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Featured Spotlight ({currentIndex + 1}/{featuredGames.length})</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                aria-label="Previous Spotlight"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                aria-label="Next Spotlight"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {featuredGames.map((game, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={game.id}
                  onClick={() => handleSelect(idx)}
                  className={`relative rounded-xl overflow-hidden aspect-[3/4] transition-all duration-300 border-2 text-left group ${
                    active
                      ? 'border-indigo-500 ring-4 ring-indigo-500/30 scale-105 shadow-xl z-10'
                      : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={game.coverImage || game.heroImage}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <p className="text-[10px] font-bold text-white truncate leading-tight">
                      {game.title}
                    </p>
                  </div>
                  {active && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
