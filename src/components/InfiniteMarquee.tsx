import React from 'react';
import { GameItem } from '../types/game';
import { Flame, Star, Sparkles, Trophy, Zap, Gamepad2, Play } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface InfiniteMarqueeProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({ games, onSelectGame }) => {
  const row1Games = games.slice(0, Math.ceil(games.length / 2));
  const row2Games = games.slice(Math.ceil(games.length / 2));

  // Duplicate arrays to create continuous infinite loop
  const row1List = [...row1Games, ...row1Games, ...row1Games];
  const row2List = [...row2Games, ...row2Games, ...row2Games];

  return (
    <div className="w-full py-6 overflow-hidden bg-slate-100/60 border-y border-slate-200/80 my-8">
      <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
            Trending Games & Instant Launchers
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
          Click any badge to jump directly into action
        </span>
      </div>

      {/* Row 1: Moving Right-to-Left */}
      <div className="relative w-full overflow-hidden flex items-center mb-3">
        <div className="flex gap-3 animate-marquee-slow whitespace-nowrap hover:[animation-play-state:paused]">
          {row1List.map((game, idx) => (
            <button
              key={`r1-${game.id}-${idx}`}
              onClick={() => {
                sounds.playLaser();
                onSelectGame(game);
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl shadow-xs transition-all text-left cursor-pointer group shrink-0"
            >
              <span className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </span>
                  {game.badge && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                      {game.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="capitalize">{game.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {game.rating}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Moving Left-to-Right */}
      <div className="relative w-full overflow-hidden flex items-center">
        <div className="flex gap-3 animate-marquee-reverse whitespace-nowrap hover:[animation-play-state:paused]">
          {row2List.map((game, idx) => (
            <button
              key={`r2-${game.id}-${idx}`}
              onClick={() => {
                sounds.playLaser();
                onSelectGame(game);
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl shadow-xs transition-all text-left cursor-pointer group shrink-0"
            >
              <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                <Gamepad2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </span>
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">
                    {game.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="capitalize">{game.category}</span>
                  <span>•</span>
                  <span className="text-slate-500">{game.plays || 0} plays</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
