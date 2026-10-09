import React, { useState } from 'react';
import { Game } from '../types/game';
import { 
  Play, 
  Star, 
  Flame, 
  Sparkles, 
  Heart, 
  Trophy, 
  Swords, 
  Puzzle, 
  RotateCcw, 
  Crosshair, 
  Brain, 
  Zap,
  ArrowRight,
  TrendingUp,
  Gamepad2,
  Tv
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameCardPreview } from './cards/GameCardPreview';

interface CrazyGamesGridProps {
  games: Game[];
  activeCategory: string;
  onSelectGame: (game: Game) => void;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  selectedTag?: string | null;
  onOpenAdmin?: () => void;
}

export const CrazyGamesGrid: React.FC<CrazyGamesGridProps> = ({
  games,
  activeCategory,
  onSelectGame,
  favorites,
  onToggleFavorite,
  selectedTag,
  onOpenAdmin
}) => {
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Filter games based on category or tag
  let filteredGames = games;
  if (selectedTag) {
    filteredGames = games.filter(g => g.tags.includes(selectedTag));
  } else if (activeCategory === 'favorites') {
    filteredGames = games.filter(g => favorites.includes(g.id));
  } else if (activeCategory !== 'all') {
    filteredGames = games.filter(g => g.category === activeCategory);
  }

  const displayedGames = filteredGames.slice(0, visibleCount);

  // Top featured game
  const featuredGame = games.find(g => g.id === 'hexgl') || games.find(g => g.id === 'outrun-racer') || games.find(g => g.id === 'underrun') || games[0];

  const renderGameCard = (game: Game, size: 'normal' | 'large' | 'compact' = 'normal') => {
    const isFav = favorites.includes(game.id);
    const isHovered = hoveredGameId === game.id;
    const is3D = game.tags?.some(t => t.toLowerCase().includes('3d') || t.toLowerCase().includes('webgl')) || game.id.includes('3d');

    return (
      <div
        key={game.id}
        onMouseEnter={() => setHoveredGameId(game.id)}
        onMouseLeave={() => setHoveredGameId(null)}
        onClick={() => {
          sounds.playClick();
          onSelectGame(game);
        }}
        className={`group relative rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 shadow-md hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:border-cyan-500/70 transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1.5 select-none ${
          size === 'large' ? 'sm:col-span-2 sm:row-span-2' : ''
        }`}
      >
        {/* Cover / Interactive Live Canvas Area */}
        <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden">
          {/* Static Cover Image */}
          {game.coverImage ? (
            <img 
              src={game.coverImage} 
              alt={game.title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-4 text-center transition-opacity ${
              isHovered ? 'opacity-0' : 'opacity-100'
            }`}>
              <Gamepad2 className="w-10 h-10 text-cyan-400/60 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-white/90 tracking-wider uppercase">{game.title}</span>
            </div>
          )}

          {/* Live Animated Canvas Preview on Hover */}
          {isHovered && (
            <div className="absolute inset-0 z-10 animate-in fade-in duration-200">
              <GameCardPreview gameId={game.id} category={game.category} />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1 shadow-sm">
                <Tv className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                <span>LIVE PREVIEW</span>
              </div>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-200 border border-white/10 shadow-sm">
                {game.category}
              </span>
              {is3D && (
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-400/60 text-[9px] font-black text-cyan-300 flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  3D
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playPowerup();
                onToggleFavorite(game.id);
              }}
              className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md transition-all ${
                isFav 
                  ? 'bg-rose-500 text-white shadow-sm scale-110' 
                  : 'bg-slate-950/60 text-white/70 hover:text-white hover:bg-slate-950/90'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Hover Play Button Overlay */}
          <div className={`absolute inset-0 bg-cyan-950/30 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 z-20 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>

          {/* Bottom stats pill on image */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold text-white/90 drop-shadow-md z-20">
            <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{game.rating ? game.rating.toFixed(1) : '4.9'}</span>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[10px] text-slate-300">
              {game.plays ? `${(game.plays / 1000).toFixed(1)}k plays` : '12.4k plays'}
            </div>
          </div>
        </div>

        {/* Card Info Footer */}
        <div className="p-3 bg-slate-900/90 flex flex-col justify-between flex-1 border-t border-slate-800/80">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
              {game.title}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-tight">
              {game.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden mt-2 pt-2 border-t border-slate-800/60">
            {game.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-[10px] font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/40 px-1.5 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Featured Big Bento Spotlight Banner (When browsing All / Home) */}
      {activeCategory === 'all' && !selectedTag && featuredGame && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Info Column */}
            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 space-y-4 z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-black uppercase tracking-wider animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-cyan-400" />
                  #1 3D Trending Game of the Week
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                  {featuredGame.category.toUpperCase()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                {featuredGame.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 max-w-xl leading-relaxed">
                {featuredGame.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(featuredGame);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  PLAY NOW FREE
                </button>

                <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>4.95 Rating</span>
                  </div>
                  <div className="w-1 h-3 bg-white/20 rounded-full" />
                  <span>240K+ Plays</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Art Area */}
            <div className="lg:col-span-5 h-64 lg:h-80 relative overflow-hidden flex items-center justify-center p-4">
              {featuredGame.coverImage ? (
                <img 
                  src={featuredGame.coverImage} 
                  alt={featuredGame.title}
                  className="w-full h-full object-cover rounded-2xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-pink-600 flex items-center justify-center">
                  <Gamepad2 className="w-24 h-24 text-white/80" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Game Grid */}
      {displayedGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {displayedGames.map((game, index) => {
            const isLarge = index === 0 && activeCategory !== 'all';
            return renderGameCard(game, isLarge ? 'large' : 'normal');
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-dashed border-cyan-500/30 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">No Games Found</h3>
            <p className="text-xs text-slate-400 max-w-md">
              There are currently no games in this category. Check back soon for new additions!
            </p>
          </div>
        </div>
      )}

      {/* Load More Trigger */}
      {displayedGames.length < filteredGames.length && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => {
              sounds.playClick();
              setVisibleCount(prev => prev + 24);
            }}
            className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 font-black text-sm shadow-md hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>LOAD MORE GAMES ({filteredGames.length - displayedGames.length} LEFT)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};