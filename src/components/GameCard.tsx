import React, { useState } from 'react';
import { GameItem, GameStats } from '../types/game';
import { Play, Heart, Star, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { handleGameImageError } from '../utils/imageFallback';

interface GameCardProps {
  game: GameItem;
  stats?: GameStats;
  isFavorite: boolean;
  onPlay: (game: GameItem) => void;
  onToggleFavorite: (gameId: string) => void;
  onOpenInfo?: (game: GameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const is3D = game.tags?.some((t) => t.toLowerCase().includes('3d') || t.toLowerCase().includes('webgl')) || game.id.includes('3d');

  // Subtle badge priority: explicit badge > 3D > platform/category
  const displayBadge = game.badge
    ? game.badge
    : is3D
    ? '3D'
    : game.platform
    ? game.platform.toUpperCase()
    : null;

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:shadow-slate-900/10 hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden transform-gpu hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* 16:10 Game Cover Container */}
      <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
        {game.coverImage ? (
          <img
            src={game.coverImage}
            alt={game.title}
            loading="lazy"
            onError={(e) => handleGameImageError(e, game.title, game.platform, game.category)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-100 via-slate-100 to-amber-50'} flex items-center justify-center`}>
            <span className="text-3xl sm:text-4xl drop-shadow-xs">{game.icon || '🎮'}</span>
          </div>
        )}

        {/* Top-Left Subtle Badge */}
        {displayBadge && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs flex items-center gap-1 ${
              displayBadge === '3D'
                ? 'bg-indigo-600/90 text-white'
                : game.badge
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950/75 text-white font-mono'
            }`}>
              {displayBadge === '3D' && <Sparkles className="w-2.5 h-2.5" />}
              {displayBadge}
            </span>
          </div>
        )}

        {/* Top-Right Favorite Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sounds.playClick();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer shadow-xs ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-slate-950/50 hover:bg-slate-950/80 text-white/90 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={`Favorite ${game.title}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Play Icon Hover Overlay */}
        <div
          className={`absolute inset-0 bg-slate-950/25 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Clean Minimalist Card Footer */}
      <div className="px-3 py-2.5 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate leading-tight">
            {game.title}
          </h3>
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide truncate block">
            {game.category}
          </span>
        </div>

        {/* Subtle Rating */}
        {game.rating && (
          <div className="flex items-center gap-0.5 shrink-0 text-amber-500 font-bold text-[11px] font-mono">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
