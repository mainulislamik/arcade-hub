import React from 'react';
import { GameItem, GameStats } from '../types/game';
import { Play, Trophy, Heart, Star, Flame } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface GameCardProps {
  game: GameItem;
  stats?: GameStats;
  isFavorite: boolean;
  onPlay: (game: GameItem) => void;
  onToggleFavorite: (gameId: string, e: React.MouseEvent) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  stats,
  isFavorite,
  onPlay,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
      className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-950/30 cursor-pointer overflow-hidden"
    >
      {/* Thumbnail Banner with Gradient */}
      <div
        className={`relative w-full h-36 rounded-xl bg-gradient-to-tr ${game.thumbnailGradient} p-3 flex flex-col justify-between overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300`}
      >
        {/* Background glow overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/15 rounded-lg">
            {game.category}
          </span>
          <button
            onClick={e => onToggleFavorite(game.id, e)}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition active:scale-90"
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Play Overlay Button */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-cyan-400 transition-all duration-300">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Stats Badge */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/90">
          <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {game.rating}
          </span>
          <span className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-md font-mono">
            {game.difficulty}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="font-bold text-slate-100 font-display text-base group-hover:text-cyan-400 transition-colors line-clamp-1">
              {game.title}
            </h3>
          </div>
          <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Highscore & Play Button Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">HIGH SCORE</span>
              <span className="text-xs font-mono font-bold text-amber-400 leading-tight">
                {stats?.highScore ?? 0}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-cyan-400 group-hover:underline flex items-center gap-1">
            Play Now →
          </span>
        </div>
      </div>
    </div>
  );
};
