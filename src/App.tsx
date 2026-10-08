import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GameItem, GameCategory, PlayerProfile } from './types/game';
import { GAMES_CATALOG } from './data/games';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { GameCard } from './components/GameCard';
import { GamePlayerModal } from './components/GamePlayerModal';
import { StatsDrawer } from './components/StatsDrawer';
import { AchievementsModal } from './components/AchievementsModal';
import {
  getStoredProfile,
  toggleFavoriteGame,
  updateSoundPreference,
  checkAndUnlockAchievements,
} from './utils/storage';
import { updateSEO, updateGameSEO } from './utils/seo';
import {
  Search,
  Sparkles,
  Flame,
  Shield,
  Zap,
  Gamepad2,
  Trophy,
  Award,
  Layers,
  Heart,
  ChevronRight,
  Cpu,
  Monitor,
  HelpCircle,
} from 'lucide-react';
import { sounds } from './utils/soundEngine';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile());
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Sync with URL Query Parameters (?game=slug, ?category=cat)
  const syncFromURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const gameSlug = params.get('game');
    const categoryParam = params.get('category') as GameCategory | null;

    if (gameSlug) {
      const found = GAMES_CATALOG.find((g) => g.slug === gameSlug || g.id === gameSlug);
      if (found) {
        setActiveGame(found);
        updateGameSEO(found);
        return;
      }
    }

    if (categoryParam) {
      setSelectedCategory(categoryParam);
      updateSEO({
        title: `Play Free ${categoryParam.toUpperCase()} Games Online - Arcadex`,
        description: `Explore top free online ${categoryParam} web games. Instant browser play, zero download, zero lag.`,
        canonicalUrl: `http://localhost:3080/?category=${categoryParam}`,
      });
    } else {
      updateSEO({
        title: 'Arcadex - Play 15+ Free Online Web Games (No Download, No Signup)',
        description:
          'Play 15+ free HTML5 web games with zero login, zero downloads, and instant client-side execution. Retro Snake, 2048, Word Quest, Sudoku, Galaxy Defender, and more.',
        canonicalUrl: 'http://localhost:3080/',
      });
    }
  }, []);

  useEffect(() => {
    syncFromURL();
    window.addEventListener('popstate', syncFromURL);
    return () => window.removeEventListener('popstate', syncFromURL);
  }, [syncFromURL]);

  // Keyboard shortcut: '/' to focus search, 'M' to mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !activeGame && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame]);

  // Open Game and update URL state
  const handleSelectGame = (game: GameItem) => {
    sounds.playClick();
    setActiveGame(game);
    const newUrl = `/?game=${game.slug}`;
    window.history.pushState({ game: game.slug }, '', newUrl);
    updateGameSEO(game);
  };

  // Close Game and restore URL state
  const handleCloseGame = () => {
    sounds.playClick();
    setActiveGame(null);
    const newUrl = selectedCategory !== 'all' ? `/?category=${selectedCategory}` : '/';
    window.history.pushState({}, '', newUrl);
    setProfile(getStoredProfile()); // Refresh profile stats/achievements
    syncFromURL();
  };

  // Select Category and update URL
  const handleSelectCategory = (category: GameCategory) => {
    sounds.playClick();
    setSelectedCategory(category);
    setShowFavoritesOnly(false);
    const newUrl = category !== 'all' ? `/?category=${category}` : '/';
    window.history.pushState({ category }, '', newUrl);
    syncFromURL();
  };

  // Toggle Favorite
  const handleToggleFavorite = (gameId: string) => {
    const updated = toggleFavoriteGame(gameId);
    setProfile(updated);
  };

  // Sound preference toggle
  const handleToggleSound = () => {
    const updated = updateSoundPreference(!profile.soundEnabled);
    setProfile(updated);
  };

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
      if (counts[g.category] !== undefined) counts[g.category]++;
    });
    return counts;
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      if (showFavoritesOnly && !profile.favoriteGames.includes(game.id)) {
        return false;
      }
      if (selectedCategory !== 'all' && game.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = game.title.toLowerCase().includes(q);
        const matchDesc = game.description.toLowerCase().includes(q);
        const matchTags = game.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [profile.favoriteGames, searchQuery, selectedCategory, showFavoritesOnly]);

  const featuredGames = useMemo(() => {
    return GAMES_CATALOG.filter((g) => g.isFeatured);
  }, []);

  const unlockedBadgesCount = useMemo(() => {
    return profile.achievements.filter((a) => a.unlocked).length;
  }, [profile.achievements]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Application Header */}
      <Header
        soundEnabled={profile.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoriteCount={profile.favoriteGames.length}
        unlockedAchievementsCount={unlockedBadgesCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Section with Answer-First Microcopy & Quick Stats */}
        {!showFavoritesOnly && selectedCategory === 'all' && !searchQuery && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Zero Server Load • 100% Client-Side Physics</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Instant Web Arcade.{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  No Login. Pure Speed.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Play 15+ curated retro, puzzle, and action arcade games directly in your browser with zero
                downloads, zero auth barriers, and ultra-low latency Web Audio sound synthesis.
              </p>

              {/* Quick Pillars */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Server Load</span>
                    <span className="text-xs font-bold text-white">0% (Client Run)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Sound Engine</span>
                    <span className="text-xs font-bold text-white">Web Audio Synth</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Privacy</span>
                    <span className="text-xs font-bold text-white">100% Local Storage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          </section>
        )}

        {/* Search Bar & Category Tabs */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter Tabs */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              categoryCounts={categoryCounts}
            />

            {/* Search Input with Keyboard Shortcut Hint */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                placeholder="Search games or tags... (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Featured Games Spotlight (if all category) */}
        {!searchQuery && !showFavoritesOnly && selectedCategory === 'all' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Featured Arcade Picks
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredGames.map((game) => (
                <GameCard
                  key={`feat-${game.id}`}
                  game={game}
                  stats={profile.gameStats[game.id]}
                  isFavorite={profile.favoriteGames.includes(game.id)}
                  onSelect={handleSelectGame}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Games Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              {showFavoritesOnly
                ? 'Your Favorite Games'
                : selectedCategory === 'all'
                ? 'Complete Games Collection'
                : `${selectedCategory.toUpperCase()} Games`}
              <span className="text-xs text-slate-400 font-mono">({filteredGames.length})</span>
            </h2>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  stats={profile.gameStats[game.id]}
                  isFavorite={profile.favoriteGames.includes(game.id)}
                  onSelect={handleSelectGame}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-slate-900/50 border border-slate-800/80 p-8 space-y-3">
              <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No games match your search</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching with different keywords or switch categories to explore other arcade titles.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

        {/* Answer-First SEO & Architectural Footer Content */}
        <section className="pt-8 border-t border-slate-800/80 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
            <article className="space-y-2">
              <h3 className="font-bold text-white text-sm">🎮 Why Zero-Login Arcade?</h3>
              <p className="leading-relaxed">
                Arcadex is engineered for instant entertainment without onboarding friction. All game saves,
                high scores, and player achievements are indexed right inside your device's browser using
                HTML5 LocalStorage and IndexedDB.
              </p>
            </article>

            <article className="space-y-2">
              <h3 className="font-bold text-white text-sm">⚡ 0% Server Compute Load</h3>
              <p className="leading-relaxed">
                Unlike cloud-streamed game services, Arcadex offloads 100% of game physics, sprite animations,
                particle calculations, and audio synthesis onto the client CPU and GPU for sub-millisecond
                responsiveness.
              </p>
            </article>

            <article className="space-y-2">
              <h3 className="font-bold text-white text-sm">🔊 Procedural Web Audio</h3>
              <p className="leading-relaxed">
                We generate authentic 8-bit retro sound waves dynamically using the browser's native Web Audio API
                oscillators, eliminating bulky MP3 downloads and ensuring instant playback.
              </p>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Arcadex Studio • Built for High-Performance Client Web Gaming</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
          <a href="/robots.txt" className="hover:text-cyan-400 transition">
            robots.txt
          </a>
          <span>•</span>
          <a href="/sitemap.xml" className="hover:text-cyan-400 transition">
            sitemap.xml
          </a>
          <span>•</span>
          <a href="/llms.txt" className="hover:text-cyan-400 transition">
            llms.txt
          </a>
        </div>
      </footer>

      {/* Active Game Modal */}
      <GamePlayerModal
        game={activeGame}
        onClose={handleCloseGame}
        isFavorite={activeGame ? profile.favoriteGames.includes(activeGame.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Stats & Dashboard Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        onResetProfile={() => {
          localStorage.clear();
          setProfile(getStoredProfile());
        }}
      />

      {/* Achievements & Hall of Fame Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={profile.achievements}
      />
    </div>
  );
};

export default App;
