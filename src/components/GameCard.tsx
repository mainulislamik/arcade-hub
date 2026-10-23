import React, { useState } from 'react';
import { GameItem, GameStats } from '../types/game';
import { Play, Trophy, Heart, Star, Flame, Sparkles, Gamepad2, Info } from 'lucide-react';
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
  stats,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenInfo,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const playCount = stats?.plays || game.plays || (game.playCount ? game.playCount : 14200);
  const formattedPlays = playCount >= 1000 ? `${(playCount / 1000).toFixed(1)}k` : `${playCount}`;
  const is3D = game.tags?.some(t => t.toLowerCase().includes('3d') || t.toLowerCase().includes('webgl')) || game.id.includes('3d');

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between overflow-hidden transform-gpu hover:-translate-y-1.5 cursor-pointer select-none"
    >
      {/* 16:9 / 16:10 Game Cover Container */}
      <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
        {game.coverImage ? (
          <img
            src={game.coverImage}
            alt={`Play ${game.title} - Free Online ${game.category || 'Arcade'} Game`}
            loading="lazy"
            onError={(e) => handleGameImageError(e, game.title, game.platform, game.category)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-100 via-slate-100 to-amber-50'} flex items-center justify-center`}>
            <span className="text-4xl drop-shadow-sm">{game.icon || '🎮'}</span>
          </div>
        )}

        {/* Ambient Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-slate-950/80 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-md font-mono shadow-xs">
              {game.proBadge || game.platform || game.category}
            </span>
            {is3D && (
              <span className="bg-indigo-600/90 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md backdrop-blur-md flex items-center gap-0.5 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                3D
              </span>
            )}
            {game.badge && (
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                <Flame className="w-2.5 h-2.5 fill-slate-950" />
                {game.badge}
              </span>
            )}
          </div>

          {/* Heart Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onToggleFavorite(game.id);
            }}
            className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md shadow-xs transition-all duration-200 active:scale-90 cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-rose-500/20 scale-105'
                : 'bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/10'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={`Favorite ${game.title}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : 'text-slate-200 hover:text-rose-400'}`} />
          </button>
        </div>

        {/* Centered Play Icon Appearing with Backdrop Blur on Hover */}
        <div className={`absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 z-10 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-200 hover:bg-amber-500">
            <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Bottom Cover Pills: Rating & Play Count */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] font-bold z-10 pointer-events-none">
          <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-white shadow-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-mono">{game.rating ? game.rating.toFixed(1) : '4.9'}</span>
          </div>
          <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-slate-200 font-mono shadow-xs">
            {formattedPlays} plays
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1 font-normal">
            {game.description}
          </p>
        </div>

        {/* Action Footer */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playVictory();
              onPlay(game);
            }}
            aria-label={`Play ${game.title} Now Free`}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY NOW</span>
          </button>

          {onOpenInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                onOpenInfo(game);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
              title="View Game Guide & Info"
              aria-label={`Guide for ${game.title}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
