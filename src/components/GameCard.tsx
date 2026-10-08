import React from 'react';
import { GameItem, GameStats } from '../types/game';
import { Play, Trophy, Heart, Star, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface GameCardProps {
  game: GameItem;
  stats?: GameStats;
  isFavorite: boolean;
  onSelect?: (game: GameItem) => void;
  onPlay?: (game: GameItem) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  stats,
  isFavorite,
  onSelect,
  onPlay,
  onToggleFavorite,
}) => {
  const handleCardClick = () => {
    sounds.playClick();
    if (onSelect) onSelect(game);
    else if (onPlay) onPlay(game);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-950/40 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top Banner & Badges */}
      <div>
        <div
          className={`h-36 rounded-2xl bg-gradient-to-br ${game.thumbnailGradient} p-4 flex flex-col justify-between relative overflow-hidden shadow-inner`}
        >
          <div className="flex items-center justify-between z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-950/70 text-cyan-300 backdrop-blur border border-white/10">
              {game.category}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                onToggleFavorite(game.id);
              }}
              title="Add to Favorites"
              className={`p-2 rounded-xl backdrop-blur transition ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-slate-950/60 text-white/80 hover:text-white hover:bg-slate-950/90'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="z-10 flex items-end justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-slate-950/70 px-2.5 py-1 rounded-xl backdrop-blur border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{game.rating.toFixed(1)}</span>
            </div>

            {game.isFeatured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur">
                <Flame className="w-3 h-3 text-amber-400" /> Featured
              </span>
            )}
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Title & Description */}
        <div className="mt-3.5 space-y-1.5">
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition flex items-center justify-between">
            <span>{game.title}</span>
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {stats && stats.highScore > 0 ? (
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best: {stats.highScore.toLocaleString()}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px] font-mono">Difficulty: {game.difficulty}</span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition group-hover:shadow-lg group-hover:shadow-cyan-500/25"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play</span>
        </button>
      </div>
    </div>
  );
};
