import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { GameItem, GameCategory, PlayerProfile } from './types/game';
import { GAMES_CATALOG } from './data/games';
import { Header } from './components/Header';
import { CinematicHeroCarousel } from './components/CinematicHeroCarousel';
import { Arcade3DHero } from './components/Arcade3DHero';
import { InfiniteMarquee } from './components/InfiniteMarquee';
import { GamerActivityFeed } from './components/GamerActivityFeed';
import { BentoGridSection } from './components/BentoGridSection';
import { CategoryFilter } from './components/CategoryFilter';
import { GameCard } from './components/GameCard';
import { GamePlayerModal } from './components/GamePlayerModal';
import { StatsDrawer } from './components/StatsDrawer';
import { AchievementsModal } from './components/AchievementsModal';
import {
  getStoredProfile,
  toggleFavoriteGame,
  recordGamePlay,
  updateSoundPreference,
  defaultProfile,
} from './utils/storage';
import { updateGameSEO, resetToHomeSEO } from './utils/seo';
import { sounds } from './utils/soundEngine';
import {
  Gamepad2,
  Trophy,
  Flame,
  Search,
  SlidersHorizontal,
  Sparkles,
  Zap,
  HelpCircle,
  ShieldCheck,
  Globe,
  Award,
} from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'title'>('popular');
  const [is3DViewActive, setIs3DViewActive] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  // Initialize Profile & Sound on Mount
  useEffect(() => {
    const saved = getStoredProfile();
    setProfile(saved);
    sounds.setEnabled(saved.soundEnabled);
  }, []);

  // Sync with URL Query Parameters (?game=slug, ?category=cat)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameSlug = params.get('game');
    const categoryParam = params.get('category') as GameCategory;

    if (categoryParam && ['all', 'arcade', 'puzzle', 'retro', 'action', 'strategy', 'word'].includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }

    if (gameSlug) {
      const match = GAMES_CATALOG.find((g) => g.slug === gameSlug || g.id === gameSlug);
      if (match) {
        setSelectedGame(match);
        updateGameSEO(match);
      }
    } else {
      resetToHomeSEO();
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const slug = p.get('game');
      const cat = p.get('category') as GameCategory;
      if (cat) setActiveCategory(cat);
      if (slug) {
        const found = GAMES_CATALOG.find((g) => g.slug === slug || g.id === slug);
        setSelectedGame(found || null);
        if (found) updateGameSEO(found);
      } else {
        setSelectedGame(null);
        resetToHomeSEO();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL and SEO when Game opens/closes
  const handleOpenGame = useCallback((game: GameItem) => {
    setSelectedGame(game);
    updateGameSEO(game);
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.slug);
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleCloseGame = useCallback(() => {
    setSelectedGame(null);
    resetToHomeSEO();
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.toString());
  }, []);

  // Select Category with URL update
  const handleSelectCategory = useCallback((category: GameCategory) => {
    sounds.playClick();
    setActiveCategory(category);
    const url = new URL(window.location.href);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  // Sound Toggle Handler
  const handleToggleSound = useCallback(() => {
    const nextState = !profile.soundEnabled;
    const updated = updateSoundPreference(nextState);
    setProfile(updated);
    sounds.setEnabled(nextState);
    if (nextState) sounds.playVictory();
  }, [profile.soundEnabled]);

  // Favorite Toggle Handler
  const handleToggleFavorite = useCallback((gameId: string) => {
    const updated = toggleFavoriteGame(gameId);
    setProfile(updated);
  }, []);

  // Game Play Recorder Callback
  const handleRecordPlay = useCallback((gameId: string, score: number, durationSeconds: number) => {
    const updated = recordGamePlay(gameId, score, durationSeconds);
    setProfile(updated);
  }, []);

  // Filter & Search Logic
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      // Category Filter
      if (activeCategory !== 'all' && game.category !== activeCategory) {
        return false;
      }
      // Favorites Filter
      if (showFavoritesOnly && !profile.favoriteGames.includes(game.id)) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesDesc = game.description.toLowerCase().includes(query);
        const matchesTags = game.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (b.plays || 0) - (a.plays || 0);
    });
  }, [activeCategory, showFavoritesOnly, profile.favoriteGames, searchQuery, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      all: GAMES_CATALOG.length,
      arcade: 0,
      puzzle: 0,
      retro: 0,
      action: 0,
      strategy: 0,
      word: 0,
    };
    GAMES_CATALOG.forEach((g) => {
      if (counts[g.category] !== undefined) {
        counts[g.category]++;
      }
    });
    return counts;
  }, []);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        soundEnabled={profile.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        favoritesCount={profile.favoriteGames.length}
        unlockedAchievementsCount={profile.achievements.filter((a) => a.unlocked).length}
        totalAchievementsCount={profile.achievements.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => {
          sounds.playClick();
          setShowFavoritesOnly((prev) => !prev);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Toggle between Cinematic Pro Cinematic Spotlight and 3D WebGL Arcade Hero */}
        {is3DViewActive ? (
          <div className="mb-8">
            <Arcade3DHero
              onPlayRandom={() => {
                const random = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
                handleOpenGame(random);
              }}
              onExploreGames={scrollToCatalog}
              totalGames={GAMES_CATALOG.length}
            />
            <div className="text-center mt-3">
              <button
                onClick={() => setIs3DViewActive(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm transition-colors"
              >
                <span>◀ Return to Cinematic Pro Spotlight Carousel</span>
              </button>
            </div>
          </div>
        ) : (
          <CinematicHeroCarousel
            games={GAMES_CATALOG}
            onPlayGame={handleOpenGame}
            onOpenInfo={handleOpenGame}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={(id) => profile.favoriteGames.includes(id)}
            onToggle3DView={() => setIs3DViewActive(true)}
            is3DViewActive={is3DViewActive}
          />
        )}

        {/* Cinematic Pro Network Live Activity Pulse */}
        <GamerActivityFeed />

        {/* Dual-Row Infinite Gamer Marquee */}
        <InfiniteMarquee
          games={GAMES_CATALOG}
          onSelectGame={handleOpenGame}
        />

        {/* Modern Bento Grid Showcase */}
        <BentoGridSection
          games={GAMES_CATALOG}
          profile={profile}
          onSelectGame={handleOpenGame}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* Game Catalog Section */}
        <div ref={catalogRef} className="pt-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Game Vault & Catalog
                </h2>
              </div>
              <p className="text-sm text-slate-600">
                17 high-performance, zero-lag browser games. 100% free with local autosave.
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search games, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-sm"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'title')}
                  className="bg-transparent text-xs font-semibold text-slate-700 py-1 pr-3 focus:outline-none cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-6">
            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              counts={categoryCounts}
            />
          </div>

          {/* Game Cards Grid */}
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  stats={profile.gameStats[game.id]}
                  isFavorite={profile.favoriteGames.includes(game.id)}
                  onPlay={handleOpenGame}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenInfo={handleOpenGame}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">No Games Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                No titles match your current search or category filter. Try clearing filters to view all 17 games.
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery('');
                  setActiveCategory('all');
                  setShowFavoritesOnly(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Global Strategy & SEO Content Section */}
        <section className="mt-16 pt-12 border-t border-slate-200/90 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-black text-slate-900 text-base">100% Client-Side Physics</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Every arcade engine, collision detector, particle system, and sound generator runs locally in your browser. Zero latency, zero login requirements, and minimal memory overhead.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-amber-500">
              <Trophy className="w-5 h-5" />
              <h4 className="font-black text-slate-900 text-base">Trophy & Score Vault</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Your high scores, unlocked achievements, play duration, and favorite games persist in your browser's private storage. Reset or backup your stats whenever you wish.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-emerald-600">
              <Globe className="w-5 h-5" />
              <h4 className="font-black text-slate-900 text-base">Desktop & Mobile Ready</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Optimized for both high-precision mechanical keyboards and responsive touch screens. Supports fullscreen mode, custom key mappings, and adaptive resolution scaling.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Arcadex Gaming Platform</span>
            <span>• 17 Web Games Active</span>
          </div>
          <p className="text-slate-400">
            Engineered with React, TypeScript, Three.js & HTML5 Canvas. Zero Server Load.
          </p>
        </div>
      </footer>

      {/* Game Player Modal */}
      {selectedGame && (
        <GamePlayerModal
          game={selectedGame}
          isFavorite={profile.favoriteGames.includes(selectedGame.id)}
          onClose={handleCloseGame}
          onToggleFavorite={handleToggleFavorite}
          onRecordGameOver={(gameId, finalScore) => handleRecordPlay(gameId, finalScore, 60)}
        />
      )}

      {/* Stats Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        onUpdateProfile={(newProfile) => setProfile(newProfile)}
        onResetProfile={() => setProfile(defaultProfile)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={profile.achievements}
      />
    </div>
  );
};

export default App;
