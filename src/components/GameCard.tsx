import React from 'react';
import { GameItem, GameStats } from '../types/game';
import { Play, Trophy, Heart, Star, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface GameCardProps {
  game: GameItem;
  stats?: GameStats;
  isFavorite: boolean;
  onPlay: (game: GameItem) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  stats,
  isFavorite,
  onPlay,
  onToggleFavorite,
}) => {
  const highScore = stats?.highScore || 0;
  const playCount = stats?.plays || 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Gradient & Icon */}
      <div className={`relative h-28 w-full bg-gradient-to-br ${game.gradient || 'from-indigo-500 to-blue-600'} flex items-center justify-center p-4 overflow-hidden`}>
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sounds.playClick();
            onToggleFavorite(game.id);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/85 hover:bg-white text-slate-700 backdrop-blur-md shadow-sm transition-all z-10"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'}`} />
        </button>

        {/* Category & Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/40 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md font-mono">
            {game.category}
          </span>
          {game.badge && (
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm font-mono">
              <Flame className="w-3 h-3 fill-slate-950" />
              {game.badge}
            </span>
          )}
        </div>

        {/* Center Game Icon / Title */}
        <div className="relative z-10 text-center transform group-hover:scale-110 transition-transform duration-300">
          <div className="text-3xl drop-shadow-md">{game.icon || '🎮'}</div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {game.title}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {game.description}
          </p>
        </div>

        {/* Meta stats & Launch Button */}
        <div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-3 font-mono">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>High: <strong className="text-slate-900">{highScore.toLocaleString()}</strong></span>
            </div>
            <span>
              {playCount > 0 ? `${playCount} plays` : (
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Instant Play
                </span>
              )}
            </span>
          </div>

          {/* Play Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onPlay(game);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:shadow-md group-hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
