import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { GameItem, GameCategory, PlayerProfile } from './types/game';
import { GAMES_CATALOG } from './data/games';
import { Header } from './components/Header';
import { Arcade3DHero } from './components/Arcade3DHero';
import { InfiniteMarquee } from './components/InfiniteMarquee';
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

  // Sound Engine Mute Toggle
  const handleToggleSound = useCallback(() => {
    const next = !profile.soundEnabled;
    const updated = updateSoundPreference(next);
    sounds.setEnabled(next);
    setProfile(updated);
    if (next) sounds.playLaser();
  }, [profile.soundEnabled]);

  // Toggle Favorite
  const handleToggleFavorite = useCallback((gameId: string) => {
    sounds.playLaser();
    const updated = toggleFavoriteGame(gameId);
    setProfile(updated);
  }, []);

  // Game Over Handler
  const handleRecordGameOver = useCallback((gameId: string, finalScore: number) => {
    const { profile: updatedProfile, isNewHighScore } = recordGamePlay(gameId, finalScore, 60);
    setProfile(updatedProfile);
    if (isNewHighScore) {
      sounds.playVictory();
    }
  }, []);

  // Scroll to Game Catalog
  const handleScrollToCatalog = useCallback(() => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Pick and Play Random Game
  const handlePlayRandomGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * GAMES_CATALOG.length);
    const randomGame = GAMES_CATALOG[randomIndex];
    if (randomGame) {
      handleOpenGame(randomGame);
    }
  }, [handleOpenGame]);

  // Filtered & Sorted Games List
  const filteredGames = useMemo(() => {
    let list = GAMES_CATALOG.filter((game) => {
      const matchCat = activeCategory === 'all' || game.category === activeCategory;
      const matchFav = !showFavoritesOnly || profile.favoriteGames.includes(game.id);
      const matchQuery =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchFav && matchQuery;
    });

    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: Popularity / Plays
      list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    }

    return list;
  }, [activeCategory, searchQuery, showFavoritesOnly, profile.favoriteGames, sortBy]);

  const categoryCounts: Record<GameCategory, number> = useMemo(() => ({
    all: GAMES_CATALOG.length,
    arcade: GAMES_CATALOG.filter((g) => g.category === 'arcade').length,
    puzzle: GAMES_CATALOG.filter((g) => g.category === 'puzzle').length,
    retro: GAMES_CATALOG.filter((g) => g.category === 'retro').length,
    action: GAMES_CATALOG.filter((g) => g.category === 'action').length,
    strategy: GAMES_CATALOG.filter((g) => g.category === 'strategy').length,
    word: GAMES_CATALOG.filter((g) => g.category === 'word').length,
  }), []);

  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        soundEnabled={profile.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStats={() => {
          sounds.playLaser();
          setIsStatsOpen(true);
        }}
        onOpenAchievements={() => {
          sounds.playLaser();
          setIsAchievementsOpen(true);
        }}
        favoritesCount={profile.favoriteGames.length}
        unlockedAchievementsCount={unlockedCount}
        totalAchievementsCount={profile.achievements.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => {
          sounds.playClick();
          setShowFavoritesOnly((prev) => !prev);
        }}
      />

      <main className="flex-1 pb-16">
        {/* Interactive 3D WebGL Hero Showcase */}
        <Arcade3DHero
          onExploreGames={handleScrollToCatalog}
          onPlayRandom={handlePlayRandomGame}
          totalGames={GAMES_CATALOG.length}
        />

        {/* Bidirectional Infinite Games Marquee Ticker */}
        <InfiniteMarquee
          games={GAMES_CATALOG}
          onSelectGame={handleOpenGame}
        />

        {/* Modern Bento Grid: Daily Quest, XP Level, Roulette & Quick Launch */}
        <BentoGridSection
          games={GAMES_CATALOG}
          profile={profile}
          onSelectGame={handleOpenGame}
          onOpenAchievements={() => {
            sounds.playLaser();
            setIsAchievementsOpen(true);
          }}
          onOpenStats={() => {
            sounds.playLaser();
            setIsStatsOpen(true);
          }}
        />

        {/* Main Game Catalog Grid Anchor */}
        <div ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Catalog Title & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Gamepad2 className="w-7 h-7 text-indigo-600" />
                <span>All Games Collection</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                  {filteredGames.length}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Filter by genre or search instantly. All games run directly in your browser.
              </p>
            </div>

            {/* Search Input and Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search games or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs w-48 sm:w-60"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-8">
            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              counts={categoryCounts}
            />
          </div>

          {/* Games Card Grid */}
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
              <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No games found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                No titles match your current filter or search criteria "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Rich SEO & FAQ Section for Search Engine / AI Crawlers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold mb-4">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Platform FAQ & Architecture</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Frequently Asked Questions About Arcadex
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>How do games run with 0% server lag?</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Arcadex utilizes HTML5 Canvas, WebGL, and the Web Audio API. 100% of game physics, rendering loops, and audio synthesis are computed locally by your device's browser, providing zero-latency 60 FPS gameplay with zero backend computing load.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Do I need to create an account to save progress?</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No sign-up or login is ever required. Your high scores, unlockable achievements, and favorite games are automatically saved locally inside your browser's private localStorage.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>Can I play Arcadex games on mobile and tablets?</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yes. Every game includes custom responsive touch controls and virtual on-screen d-pads/buttons for smooth gameplay on smartphones, iPads, and touch-screen laptops.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Are there new games and challenges added regularly?</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Arcadex features deterministic Daily Quests that refresh automatically every 24 hours, alongside a continuous rollout of client-side retro, word, and strategy games.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern High-Contrast Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              A
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm tracking-tight">Arcadex</span>
              <p className="text-[11px] text-slate-500">Instant Free Web Gaming Portal</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => handleSelectCategory('retro')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Retro Classics
            </button>
            <button
              onClick={() => handleSelectCategory('puzzle')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Puzzle & Logic
            </button>
            <button
              onClick={() => handleSelectCategory('word')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Word Games
            </button>
            <button
              onClick={() => handleSelectCategory('strategy')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Strategy
            </button>
            <button
              onClick={() => {
                sounds.playLaser();
                setIsAchievementsOpen(true);
              }}
              className="hover:text-indigo-600 transition-colors cursor-pointer text-indigo-600"
            >
              Trophy Hall
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            © 2026 Arcadex Studio. 0% Server Load.
          </div>
        </div>
      </footer>

      {/* Game Player Fullscreen Modal */}
      <GamePlayerModal
        game={selectedGame}
        onClose={handleCloseGame}
        onRecordGameOver={handleRecordGameOver}
        isFavorite={Boolean(selectedGame && profile.favoriteGames.includes(selectedGame.id))}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Stats & Highscores Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        onUpdateProfile={(newProf) => setProfile(newProf)}
      />

      {/* Achievements & Trophies Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={profile.achievements}
      />
    </div>
  );
};
export default App;
