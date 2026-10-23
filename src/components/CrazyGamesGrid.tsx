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
  Tv,
  UploadCloud
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameCardPreview } from './cards/GameCardPreview';
import { handleGameImageError } from '../utils/imageFallback';

interface CrazyGamesGridProps {
  games: Game[];
  activeCategory: string;
  onSelectGame: (game: Game) => void;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  selectedTag?: string | null;
  onOpenAdmin?: () => void;
  onOpenLocalRomModal?: () => void;
}

export const CrazyGamesGrid: React.FC<CrazyGamesGridProps> = ({
  games,
  activeCategory,
  onSelectGame,
  favorites,
  onToggleFavorite,
  selectedTag,
  onOpenAdmin,
  onOpenLocalRomModal
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
    const catLower = activeCategory.toLowerCase();
    if (catLower === 'playstation') {
      filteredGames = games.filter(g => 
        ['psx', 'ps2', 'ps3', 'psp'].includes(g.romFormat?.toLowerCase() || '') ||
        g.platform?.toLowerCase().includes('playstation') ||
        g.platform?.toLowerCase().includes('sony') ||
        g.platform?.toLowerCase().includes('psx') ||
        g.platform?.toLowerCase().includes('ps2') ||
        g.platform?.toLowerCase().includes('ps3') ||
        g.platform?.toLowerCase().includes('psp') ||
        g.category?.toLowerCase() === 'playstation'
      );
    } else {
      filteredGames = games.filter(g => 
        (g.category && g.category.toLowerCase() === catLower) || 
        (g.romFormat && g.romFormat.toLowerCase() === catLower) ||
        (g.platform && g.platform.toLowerCase().includes(catLower))
      );
    }
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
        className={`group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1 select-none ${
          size === 'large' ? 'sm:col-span-2 sm:row-span-2' : ''
        }`}
      >
        {/* Cover / Interactive Live Canvas Area */}
        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
          {/* Static Cover Image */}
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={`Play ${game.title} - Free Online ${game.category || 'Arcade'} Game`}
              onError={(e) => handleGameImageError(e, game.title, game.platform, game.category)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100 p-4 text-center transition-opacity ${
              isHovered ? 'opacity-0' : 'opacity-100'
            }`}>
              <Gamepad2 className="w-10 h-10 text-indigo-600/60 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-800 tracking-wider uppercase">{game.title}</span>
            </div>
          )}

          {/* Live Animated Canvas Preview on Hover */}
          {isHovered && (
            <div className="absolute inset-0 z-10 animate-in fade-in duration-200">
              <GameCardPreview gameId={game.id} category={game.category} />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 border border-indigo-200 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1 shadow-sm">
                <Tv className="w-2.5 h-2.5 text-indigo-600 animate-pulse" />
                <span>LIVE PREVIEW</span>
              </div>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-700 border border-slate-200 shadow-sm">
                {game.category}
              </span>
              {is3D && (
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[9px] font-black text-indigo-700 flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
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
              aria-label={isFav ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
              className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
                isFav
                  ? 'bg-rose-500 text-white shadow-rose-500/20 scale-110'
                  : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white border border-slate-200'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Hover Play Button Overlay */}
          <div className={`absolute inset-0 bg-indigo-950/20 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 z-20 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>

          {/* Bottom stats pill on image */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold z-20">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200 text-slate-800 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{game.rating ? game.rating.toFixed(1) : '4.9'}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] text-slate-600 shadow-sm">
              {game.plays ? `${(game.plays / 1000).toFixed(1)}k plays` : '12.4k plays'}
            </div>
          </div>
        </div>

        {/* Card Info Footer */}
        <div className="p-3 bg-white flex flex-col justify-between flex-1 border-t border-slate-100">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {game.title}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
              {game.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden mt-2 pt-2 border-t border-slate-100">
            {game.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
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
      {/* Semantic H1 for Lobby Home & Category views */}
      {activeCategory === 'all' && !selectedTag ? (
        <h1 className="sr-only">Arcadex - Free Online Web Games &amp; Retro Arcade</h1>
      ) : (
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeCategory === 'favorites'
              ? 'Your Favorite Games - Arcadex'
              : `Free ${activeCategory.toUpperCase()} Games Online - Arcadex`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {activeCategory === 'favorites'
              ? 'Instant play your bookmarked games with zero download.'
              : `Play hundreds of free ${activeCategory} games directly in your browser with zero download and 60 FPS performance.`}
          </p>
        </div>
      )}

      {/* Featured Big Bento Spotlight Banner (When browsing All / Home) */}
      {activeCategory === 'all' && !selectedTag && featuredGame && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-white border border-indigo-100 shadow-sm group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Info Column */}
            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 space-y-4 z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                  #1 Trending Game of the Week
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold">
                  {featuredGame.category.toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {featuredGame.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 max-w-xl leading-relaxed">
                {featuredGame.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(featuredGame);
                  }}
                  aria-label={`Play ${featuredGame.title} Free Online`}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  PLAY NOW FREE
                </button>

                <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>4.95 Rating</span>
                  </div>
                  <div className="w-1 h-3 bg-slate-200 rounded-full" />
                  <span>240K+ Plays</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Art Area */}
            <div className="lg:col-span-5 h-64 lg:h-80 relative overflow-hidden flex items-center justify-center p-4">
              {featuredGame.coverImage ? (
                <img
                  src={featuredGame.coverImage}
                  alt={`Play ${featuredGame.title} - Free Online ${featuredGame.category || 'Arcade'} Game`}
                  onError={(e) => handleGameImageError(e, featuredGame.title, featuredGame.platform, featuredGame.category)}
                  className="w-full h-full object-cover rounded-2xl border border-slate-200 shadow-md group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-100 via-blue-100 to-indigo-50 flex items-center justify-center border border-indigo-200">
                  <Gamepad2 className="w-24 h-24 text-indigo-600/70" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Client-Side BYOG Emulator Dropzone Banner */}
      {onOpenLocalRomModal && (
        <div className="mb-6 rounded-2xl bg-white border border-indigo-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                Play Any ROM on Your Device <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase font-mono">100% Client-Side</span>
              </h3>
              <p className="text-xs text-slate-500">
                Drag & Drop your own <strong className="text-slate-700">.JAR, .SIS, .GBA, .NES, .SNES, .MD, .SWF</strong> files to run instantly in browser. Zero server upload.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPowerup();
              onOpenLocalRomModal();
            }}
            aria-label="Open Client-Side ROM Drop & Play Emulator"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>DROP & PLAY ROM</span>
          </button>
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
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-indigo-200 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">No Games Found</h3>
            <p className="text-xs text-slate-500 max-w-md">
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
            aria-label={`Load ${Math.min(24, filteredGames.length - displayedGames.length)} more games`}
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-black text-sm shadow-sm hover:border-indigo-400 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>LOAD MORE GAMES ({filteredGames.length - displayedGames.length} LEFT)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};