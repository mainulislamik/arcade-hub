import React, { useState, useMemo } from 'react';
import { GameItem, GameCategory } from '../types/game';
import {
  Play,
  Star,
  Flame,
  Sparkles,
  Heart,
  Trophy,
  Swords,
  Puzzle,
  Crosshair,
  Brain,
  Zap,
  ArrowRight,
  Gamepad2,
  UploadCloud,
  Car,
  Crown,
  Compass,
  Info,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameCard } from './GameCard';
import { CategoryFilter } from './CategoryFilter';
import { handleGameImageError } from '../utils/imageFallback';

interface CrazyGamesGridProps {
  games: GameItem[];
  activeCategory: string;
  onSelectCategory?: (category: GameCategory) => void;
  onSelectGame: (game: GameItem) => void;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  selectedTag?: string | null;
  onOpenAdmin?: () => void;
  onOpenLocalRomModal?: () => void;
  onOpenInfo?: (game: GameItem) => void;
}

export const CrazyGamesGrid: React.FC<CrazyGamesGridProps> = ({
  games,
  activeCategory,
  onSelectCategory,
  onSelectGame,
  favorites,
  onToggleFavorite,
  selectedTag,
  onOpenAdmin,
  onOpenLocalRomModal,
  onOpenInfo,
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Compute live counts for all categories
  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      all: games.length,
      action: 0,
      puzzle: 0,
      retro: 0,
      arcade: 0,
      strategy: 0,
      word: 0,
      driving: 0,
      shooting: 0,
      playstation: 0,
      ps2: 0,
      ps3: 0,
      psp: 0,
      favorites: favorites.length,
    };

    games.forEach((g) => {
      const isPS = ['psx', 'ps2', 'ps3', 'psp'].includes(g.romFormat?.toLowerCase() || '') ||
        g.platform?.toLowerCase().includes('playstation') ||
        g.platform?.toLowerCase().includes('sony') ||
        g.category?.toLowerCase() === 'playstation';

      if (isPS) {
        counts.playstation++;
      }

      const cat = g.category as GameCategory;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  }, [games, favorites]);

  // Filter games based on category or tag
  const filteredGames = useMemo(() => {
    if (selectedTag) {
      return games.filter((g) => g.tags.includes(selectedTag));
    }
    if (activeCategory === 'favorites') {
      return games.filter((g) => favorites.includes(g.id));
    }
    if (activeCategory !== 'all') {
      const catLower = activeCategory.toLowerCase();
      if (catLower === 'playstation') {
        return games.filter((g) =>
          ['psx', 'ps2', 'ps3', 'psp'].includes(g.romFormat?.toLowerCase() || '') ||
          g.platform?.toLowerCase().includes('playstation') ||
          g.platform?.toLowerCase().includes('sony') ||
          g.platform?.toLowerCase().includes('psx') ||
          g.platform?.toLowerCase().includes('ps2') ||
          g.platform?.toLowerCase().includes('ps3') ||
          g.platform?.toLowerCase().includes('psp') ||
          g.category?.toLowerCase() === 'playstation'
        );
      }
      return games.filter((g) =>
        (g.category && g.category.toLowerCase() === catLower) ||
        (g.romFormat && g.romFormat.toLowerCase() === catLower) ||
        (g.platform && g.platform.toLowerCase().includes(catLower))
      );
    }
    return games;
  }, [games, activeCategory, selectedTag, favorites]);

  // Featured Hero Game (prefer high-profile showcase games)
  const featuredGame = useMemo(() => {
    return (
      games.find((g) => g.id === 'drift-hunters') ||
      games.find((g) => g.id === 'slope-3d') ||
      games.find((g) => g.id === 'hexgl') ||
      games.find((g) => g.id === 'subway-surfers') ||
      games.find((g) => g.id === 'outrun-racer') ||
      games.find((g) => g.isFeatured) ||
      games[0]
    );
  }, [games]);

  // Curated Row 1: Trending & Featured Games (6 games)
  const trendingGames = useMemo(() => {
    return games
      .filter((g) => g.isFeatured || g.featured || (g.rating && g.rating >= 4.8) || g.badge)
      .slice(0, 6);
  }, [games]);

  // Curated Row 2: PlayStation & Retro Classics (6 games)
  const retroPlaystationGames = useMemo(() => {
    return games
      .filter((g) =>
        ['psx', 'ps2', 'psp'].includes(g.romFormat?.toLowerCase() || '') ||
        g.platform?.toLowerCase().includes('playstation') ||
        g.category?.toLowerCase() === 'playstation' ||
        g.category?.toLowerCase() === 'retro' ||
        ['gba', 'nes', 'snes', 'sega'].includes(g.romFormat?.toLowerCase() || '')
      )
      .slice(0, 6);
  }, [games]);

  // Curated Row 3: High Speed Racing & 3D WebGL (6 games)
  const racingGames = useMemo(() => {
    return games
      .filter((g) =>
        g.category === 'driving' ||
        g.tags.some((t) => ['racing', 'driving', 'drift', 'car', 'speed'].includes(t.toLowerCase()))
      )
      .slice(0, 6);
  }, [games]);

  // Curated Row 4: Action & Fighting (6 games)
  const actionGames = useMemo(() => {
    return games
      .filter((g) =>
        g.category === 'action' ||
        g.tags.some((t) => ['action', 'fighting', 'combat', 'brawler', 'survival'].includes(t.toLowerCase()))
      )
      .slice(0, 6);
  }, [games]);

  // Curated Row 5: Puzzle & Brain Teasers (6 games)
  const puzzleGames = useMemo(() => {
    return games
      .filter((g) =>
        g.category === 'puzzle' ||
        g.category === 'strategy' ||
        g.tags.some((t) => ['puzzle', 'brain', 'logic', 'match'].includes(t.toLowerCase()))
      )
      .slice(0, 6);
  }, [games]);

  const displayedCatalogGames = filteredGames.slice(0, visibleCount);

  // Section Header Component
  const renderSectionHeader = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    categoryKey?: GameCategory,
    badgeText?: string
  ) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h2>
            {badgeText && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {categoryKey && onSelectCategory && (
        <button
          onClick={() => {
            sounds.playClick();
            onSelectCategory(categoryKey);
          }}
          className="flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Horizontal Category Filter Bar */}
      {onSelectCategory && (
        <CategoryFilter
          activeCategory={activeCategory as GameCategory}
          onSelectCategory={onSelectCategory}
          counts={categoryCounts}
        />
      )}

      {/* Semantic H1 for Category / Tag Views */}
      {activeCategory !== 'all' || selectedTag ? (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase">
              {activeCategory.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {filteredGames.length} games available
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeCategory === 'favorites'
              ? 'Your Favorite Games'
              : selectedTag
              ? `Games Tagged #${selectedTag}`
              : `Free ${activeCategory.toUpperCase()} Games Online`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {activeCategory === 'favorites'
              ? 'Instant play your bookmarked games with zero download.'
              : `Play hundreds of free ${activeCategory} games directly in your browser with zero download and 60 FPS performance.`}
          </p>
        </div>
      ) : (
        <h1 className="sr-only">Arcadex - Free Online Web Games &amp; Retro Arcade</h1>
      )}

      {/* ZapGames Cinema Hero Showcase (Only on Home / All Games) */}
      {activeCategory === 'all' && !selectedTag && featuredGame && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-50/90 via-slate-50 to-amber-50/60 border border-slate-200/90 shadow-sm group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Info Column */}
            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 space-y-4 z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black uppercase tracking-wider shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  #1 Trending Game
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black uppercase tracking-wide">
                  {featuredGame.category.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
                  60 FPS
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {featuredGame.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 max-w-xl leading-relaxed font-normal">
                {featuredGame.description}
              </p>

              {/* Rating & Play Counts */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs font-black text-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 ★ Rating</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs font-black text-slate-800">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                  <span>240K+ Plays</span>
                </div>
              </div>

              {/* Big Energetic Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    sounds.playVictory();
                    onSelectGame(featuredGame);
                  }}
                  aria-label={`Play ${featuredGame.title} Free Online`}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-400/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>PLAY NOW</span>
                </button>

                {/* Favorite Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onToggleFavorite(featuredGame.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                    favorites.includes(featuredGame.id)
                      ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20'
                      : 'bg-white text-slate-700 hover:text-rose-600 hover:bg-slate-50 border-slate-200/90'
                  }`}
                  title={favorites.includes(featuredGame.id) ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={`Favorite ${featuredGame.title}`}
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(featuredGame.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Info Guide Button */}
                {onOpenInfo && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenInfo(featuredGame);
                    }}
                    className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs transition-colors cursor-pointer"
                    title="View Game Guide & Info"
                    aria-label={`Guide for ${featuredGame.title}`}
                  >
                    <Info className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Visual / High-Res Cover Area */}
            <div className="lg:col-span-5 h-64 sm:h-80 lg:h-96 relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
              {featuredGame.coverImage ? (
                <div
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(featuredGame);
                  }}
                  className="w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md group-hover:scale-102 transition-transform duration-500 cursor-pointer relative"
                >
                  <img
                    src={featuredGame.coverImage}
                    alt={`Play ${featuredGame.title} - Free Online ${featuredGame.category || 'Arcade'} Game`}
                    onError={(e) => handleGameImageError(e, featuredGame.title, featuredGame.platform, featuredGame.category)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-slate-950 text-slate-950 ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-100 via-blue-100 to-amber-50 flex items-center justify-center border border-slate-200">
                  <Gamepad2 className="w-24 h-24 text-indigo-600/70" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Client-Side BYOG Emulator Dropzone Banner */}
      {onOpenLocalRomModal && (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>Play Any ROM on Your Device</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase font-mono font-bold">
                  100% Client-Side
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag & Drop your own <strong className="text-slate-700 font-bold">.JAR, .SIS, .GBA, .NES, .SNES, .MD, .SWF</strong> files to run instantly in browser. Zero server upload.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLocalRomModal();
            }}
            aria-label="Open Client-Side ROM Drop & Play Emulator"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>DROP &amp; PLAY ROM</span>
          </button>
        </div>
      )}

      {/* CURATED THEMATIC ROWS (Only on Home / activeCategory === 'all') */}
      {activeCategory === 'all' && !selectedTag ? (
        <div className="space-y-10">
          {/* Row 1: ⚡ Trending & Featured Games */}
          {trendingGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'Trending & Featured Games',
                'Top rated 3D WebGL and viral browser games',
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />,
                undefined,
                'HOT'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {trendingGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onPlay={onSelectGame}
                    onToggleFavorite={onToggleFavorite}
                    onOpenInfo={onOpenInfo}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Row 2: 🕹️ PlayStation & Retro Classics */}
          {retroPlaystationGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'PlayStation & Retro Classics',
                'Authentic PS1 BIOS emulation, GBA, NES, SNES & Genesis games',
                <Gamepad2 className="w-5 h-5 text-indigo-600" />,
                'playstation',
                'RETRO'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {retroPlaystationGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onPlay={onSelectGame}
                    onToggleFavorite={onToggleFavorite}
                    onOpenInfo={onOpenInfo}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Row 3: 🏎️ High Speed Racing & 3D WebGL */}
          {racingGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'High Speed Racing & 3D WebGL',
                'Drift, highway racers, stunt courses, and WebGL physics',
                <Car className="w-5 h-5 text-amber-500" />,
                'driving',
                '3D'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {racingGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onPlay={onSelectGame}
                    onToggleFavorite={onToggleFavorite}
                    onOpenInfo={onOpenInfo}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Row 4: 💥 Action & Fighting */}
          {actionGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'Action & Fighting',
                'Adrenaline brawlers, survival arenas, and combat games',
                <Swords className="w-5 h-5 text-rose-500" />,
                'action'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {actionGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onPlay={onSelectGame}
                    onToggleFavorite={onToggleFavorite}
                    onOpenInfo={onOpenInfo}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Row 5: 🧩 Puzzle & Brain Teasers */}
          {puzzleGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'Puzzle & Brain Teasers',
                'Mind-bending logic challenges, matching, and strategy',
                <Puzzle className="w-5 h-5 text-emerald-500" />,
                'puzzle'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {puzzleGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onPlay={onSelectGame}
                    onToggleFavorite={onToggleFavorite}
                    onOpenInfo={onOpenInfo}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Row 6: 🎮 All Games Collection Catalog with Load More Pagination */}
          <section className="pt-4 border-t border-slate-200">
            {renderSectionHeader(
              'All Games Collection',
              `Explore complete catalog of ${games.length.toLocaleString()} games`,
              <Compass className="w-5 h-5 text-indigo-600" />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {displayedCatalogGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  onPlay={onSelectGame}
                  onToggleFavorite={onToggleFavorite}
                  onOpenInfo={onOpenInfo}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayedCatalogGames.length < filteredGames.length && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setVisibleCount((prev) => prev + 24);
                  }}
                  aria-label={`Load ${Math.min(24, filteredGames.length - displayedCatalogGames.length)} more games`}
                  className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 font-black text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>LOAD MORE GAMES ({filteredGames.length - displayedCatalogGames.length} LEFT)</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Dedicated Category Grid (when category is selected or searching tag) */
        <div className="space-y-6">
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {displayedCatalogGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  onPlay={onSelectGame}
                  onToggleFavorite={onToggleFavorite}
                  onOpenInfo={onOpenInfo}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">No Games Found</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  There are currently no games in this category. Check back soon or try another category!
                </p>
              </div>
            </div>
          )}

          {/* Load More Button for Category View */}
          {displayedCatalogGames.length < filteredGames.length && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => {
                  sounds.playClick();
                  setVisibleCount((prev) => prev + 24);
                }}
                aria-label={`Load ${Math.min(24, filteredGames.length - displayedCatalogGames.length)} more games`}
                className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 font-black text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>LOAD MORE GAMES ({filteredGames.length - displayedCatalogGames.length} LEFT)</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
