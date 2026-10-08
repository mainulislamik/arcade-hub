import React, { useState } from 'react';
import { GameItem, GameStats } from '../types/game';
import { Play, Trophy, Heart, Star, Flame, Sparkles, Shield, Gamepad2, Info } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

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
  const highScore = stats?.highScore || 0;
  const playCount = stats?.plays || 0;
  const [isCardHovered, setIsCardHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/15 hover:border-indigo-400/80 transition-all duration-300 flex flex-col justify-between overflow-hidden transform-gpu hover:-translate-y-1.5"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      {/* Cinematic-Grade Cover Poster (4:3 aspect) */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
        {game.coverImage ? (
          <img
            src={game.coverImage}
            alt={`${game.title} Official Game Cover`}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-600 to-slate-900'} flex items-center justify-center`}>
            <span className="text-5xl drop-shadow-lg">{game.icon || '🎮'}</span>
          </div>
        )}

        {/* Ambient Dark Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/10 font-mono shadow-sm">
              {game.proBadge || game.category}
            </span>
            {game.badge && (
              <span className="px-2 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm font-mono">
                <Flame className="w-3 h-3 fill-slate-950" />
                {game.badge}
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onToggleFavorite(game.id);
            }}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/10 shadow-sm transition-all duration-200 active:scale-90"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={`Favorite ${game.title}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-400'}`} />
          </button>
        </div>

        {/* Quick Info & Overlay on Hover */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-600/90 text-white border border-indigo-400/30 backdrop-blur-md">
            {game.difficulty}
          </span>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-black bg-slate-950/80 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {game.title}
            </h3>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-normal">
            {game.description}
          </p>
        </div>

        {/* High Score and Play Action */}
        <div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-3 font-mono">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>High: <strong className="text-slate-900">{highScore.toLocaleString()}</strong></span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              0% Lag • Free
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => {
                sounds.playVictory();
                onPlay(game);
              }}
              className="col-span-4 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95 border border-slate-800 group-hover:border-indigo-400"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY NOW</span>
            </button>

            {onOpenInfo && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenInfo(game);
                }}
                className="col-span-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 transition-colors"
                title="View Game Guide & Cheats"
                aria-label={`Guide for ${game.title}`}
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
