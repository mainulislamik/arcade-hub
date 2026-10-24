import React, { useState, useMemo } from 'react';
import { GameItem, GameCategory } from '../types/game';
import {
  Flame,
  Gamepad2,
  Car,
  Swords,
  Puzzle,
  Compass,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameCard } from './GameCard';
import { CategoryFilter } from './CategoryFilter';

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
  onOpenInfo,
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(42);

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
      const isPS =
        ['psx', 'ps2', 'ps3', 'psp'].includes(g.romFormat?.toLowerCase() || '') ||
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
      return games.filter(
        (g) =>
          (g.category && g.category.toLowerCase() === catLower) ||
          (g.romFormat && g.romFormat.toLowerCase() === catLower) ||
          (g.platform && g.platform.toLowerCase().includes(catLower))
      );
    }
    return games;
  }, [games, activeCategory, selectedTag, favorites]);

  // Curated Row 1: Top Games on Arcadex / Trending (7 games for 7-column layout)
  const topGames = useMemo(() => {
    return games
      .filter((g) => g.isFeatured || g.featured || (g.rating && g.rating >= 4.8) || g.badge)
      .slice(0, 7);
  }, [games]);

  // Curated Row 2: PlayStation & Retro Classics (7 games)
  const retroPlaystationGames = useMemo(() => {
    return games
      .filter(
        (g) =>
          ['psx', 'ps2', 'psp'].includes(g.romFormat?.toLowerCase() || '') ||
          g.platform?.toLowerCase().includes('playstation') ||
          g.category?.toLowerCase() === 'playstation' ||
          g.category?.toLowerCase() === 'retro' ||
          ['gba', 'nes', 'snes', 'sega'].includes(g.romFormat?.toLowerCase() || '')
      )
      .slice(0, 7);
  }, [games]);

  // Curated Row 3: High Speed Driving & 3D WebGL (7 games)
  const racingGames = useMemo(() => {
    return games
      .filter(
        (g) =>
          g.category === 'driving' ||
          g.tags.some((t) => ['racing', 'driving', 'drift', 'car', 'speed'].includes(t.toLowerCase()))
      )
      .slice(0, 7);
  }, [games]);

  // Curated Row 4: Action & Arcade (7 games)
  const actionGames = useMemo(() => {
    return games
      .filter(
        (g) =>
          g.category === 'action' ||
          g.category === 'arcade' ||
          g.tags.some((t) => ['action', 'fighting', 'combat', 'brawler', 'survival', 'arcade'].includes(t.toLowerCase()))
      )
      .slice(0, 7);
  }, [games]);

  // Curated Row 5: Puzzle & Strategy (7 games)
  const puzzleGames = useMemo(() => {
    return games
      .filter(
        (g) =>
          g.category === 'puzzle' ||
          g.category === 'strategy' ||
          g.tags.some((t) => ['puzzle', 'brain', 'logic', 'match', 'strategy'].includes(t.toLowerCase()))
      )
      .slice(0, 7);
  }, [games]);

  const displayedCatalogGames = filteredGames.slice(0, visibleCount);

  // Clean Minimalist Section Header like ZapGames
  const renderSectionHeader = (
    title: string,
    icon: React.ReactNode,
    count?: number,
    categoryKey?: GameCategory
  ) => (
    <div className="flex items-center justify-between mb-3 px-0.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-xs font-semibold text-slate-600 font-mono">
              ({count})
            </span>
          )}
        </div>
      </div>

      {categoryKey && onSelectCategory && (
        <button
          onClick={() => {
            sounds.playClick();
            onSelectCategory(categoryKey);
          }}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Horizontal Category Pill Filter Bar */}
      {onSelectCategory && (
        <CategoryFilter
          activeCategory={activeCategory as GameCategory}
          onSelectCategory={onSelectCategory}
          counts={categoryCounts}
        />
      )}

      {/* Semantic Title for Category or Tag Views */}
      {activeCategory !== 'all' || selectedTag ? (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase">
              {activeCategory.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">
              {filteredGames.length} games available
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeCategory === 'favorites'
              ? 'Your Favorite Games'
              : selectedTag
              ? `Games Tagged #${selectedTag}`
              : `Free ${activeCategory.toUpperCase()} Games`}
          </h1>
        </div>
      ) : (
        <h1 className="sr-only">Arcadex - Free Online Web Games &amp; Retro Arcade</h1>
      )}

      {/* CURATED HIGH-DENSITY SECTIONS (Home / All Games) */}
      {activeCategory === 'all' && !selectedTag ? (
        <div className="space-y-7">
          {/* Section 1: Top Games on Arcadex */}
          {topGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'Top Games on Arcadex',
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />,
                topGames.length
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                {topGames.map((game) => (
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

          {/* Section 2: PlayStation & Retro Classics */}
          {retroPlaystationGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'PlayStation & Retro Classics',
                <Gamepad2 className="w-4 h-4 text-indigo-600" />,
                categoryCounts.playstation,
                'playstation'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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

          {/* Section 3: High Speed Driving & 3D */}
          {racingGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'High Speed Driving & 3D',
                <Car className="w-4 h-4 text-amber-500" />,
                categoryCounts.driving,
                'driving'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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

          {/* Section 4: Action & Arcade */}
          {actionGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'Action & Arcade',
                <Swords className="w-4 h-4 text-rose-500" />,
                categoryCounts.action + categoryCounts.arcade,
                'action'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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

          {/* Section 5: Puzzle & Strategy */}
          {puzzleGames.length > 0 && (
            <section>
              {renderSectionHeader(
                'Puzzle & Strategy',
                <Puzzle className="w-4 h-4 text-emerald-600" />,
                categoryCounts.puzzle + categoryCounts.strategy,
                'puzzle'
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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

          {/* Section 6: Complete Game Catalog with High-Density Grid */}
          <section className="pt-2 border-t border-slate-200">
            {renderSectionHeader(
              'All Games',
              <Compass className="w-4 h-4 text-indigo-600" />,
              games.length
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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
                    setVisibleCount((prev) => prev + 28);
                  }}
                  aria-label={`Load ${Math.min(28, filteredGames.length - displayedCatalogGames.length)} more games`}
                  className="px-8 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>LOAD MORE GAMES ({filteredGames.length - displayedCatalogGames.length} REMAINING)</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Dedicated Category Grid (when category is selected or filtering by tag) */
        <div className="space-y-6">
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Games Found</h3>
                <p className="text-xs text-slate-500">
                  There are no games matching this category or tag right now.
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
                  setVisibleCount((prev) => prev + 28);
                }}
                aria-label={`Load ${Math.min(28, filteredGames.length - displayedCatalogGames.length)} more games`}
                className="px-8 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>LOAD MORE GAMES ({filteredGames.length - displayedCatalogGames.length} REMAINING)</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
