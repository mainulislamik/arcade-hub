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
  recordGamePlay,
  toggleFavoriteGame,
  updateSoundPreference,
  checkAndUnlockAchievements,
} from './utils/storage';
import { updateSEO, updateGameSEO } from './utils/seo';
import { sounds } from './utils/soundEngine';
import {
  Search,
  Sparkles,
  Flame,
  Gamepad2,
  Trophy,
  Zap,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Clock,
  Layers,
  Award,
} from 'lucide-react';

export const App: React.FC = () => {
  // State
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile());
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Sync sound engine enabled state
  useEffect(() => {
    sounds.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Handle URL Query Params for deep-linking & SEO indexing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameSlug = params.get('game');
    const categoryParam = params.get('category') as GameCategory | null;
    const searchParam = params.get('search');

    if (gameSlug) {
      const matched = GAMES_CATALOG.find((g) => g.slug === gameSlug || g.id === gameSlug);
      if (matched) {
        setActiveGame(matched);
        updateGameSEO(matched);
      }
    } else {
      updateSEO({
        title: 'Arcadex - Play 15+ Free Online Web Games (No Download, No Signup)',
        description:
          'Play 15+ free HTML5 web games with zero login, zero downloads, and instant client-side execution. Retro Snake, 2048, Word Quest, Sudoku, Galaxy Defender, and more.',
        canonicalUrl: window.location.origin + '/',
      });
    }

    if (categoryParam && ['all', 'arcade', 'puzzle', 'retro', 'action', 'strategy', 'word'].includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    // Handle Browser Popstate (Back/Forward)
    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const curGameSlug = updatedParams.get('game');
      const curCat = updatedParams.get('category') as GameCategory | null;

      if (curGameSlug) {
        const matched = GAMES_CATALOG.find((g) => g.slug === curGameSlug || g.id === curGameSlug);
        setActiveGame(matched || null);
        if (matched) updateGameSEO(matched);
      } else {
        setActiveGame(null);
        updateSEO({
          title: 'Arcadex - Play 15+ Free Online Web Games (No Download, No Signup)',
          description:
            'Play 15+ free HTML5 web games with zero login, zero downloads, and instant client-side execution. Retro Snake, 2048, Word Quest, Sudoku, Galaxy Defender, and more.',
          canonicalUrl: window.location.origin + '/',
        });
      }

      if (curCat) {
        setActiveCategory(curCat);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL Query params cleanly
  const updateUrlParams = useCallback((game: GameItem | null, cat?: GameCategory) => {
    const url = new URL(window.location.href);
    if (game) {
      url.searchParams.set('game', game.slug);
    } else {
      url.searchParams.delete('game');
    }

    if (cat && cat !== 'all') {
      url.searchParams.set('category', cat);
    } else if (cat === 'all') {
      url.searchParams.delete('category');
    }

    window.history.pushState({}, '', url.toString());
  }, []);

  // Handlers
  const handleOpenGame = (game: GameItem) => {
    setActiveGame(game);
    updateGameSEO(game);
    updateUrlParams(game, activeCategory);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
    updateUrlParams(null, activeCategory);
    updateSEO({
      title: 'Arcadex - Play 15+ Free Online Web Games (No Download, No Signup)',
      description:
        'Play 15+ free HTML5 web games with zero login, zero downloads, and instant client-side execution. Retro Snake, 2048, Word Quest, Sudoku, Galaxy Defender, and more.',
      canonicalUrl: window.location.origin + '/',
    });
  };

  const handleSelectCategory = (cat: GameCategory) => {
    sounds.playClick();
    setActiveCategory(cat);
    updateUrlParams(activeGame, cat);
  };

  const handleToggleFavorite = (gameId: string) => {
    const updated = toggleFavoriteGame(gameId);
    setProfile(updated);
  };

  const handleToggleSound = () => {
    const newSoundState = !profile.soundEnabled;
    const updated = updateSoundPreference(newSoundState);
    setProfile(updated);
  };

  const handleRecordGameOver = (gameId: string, finalScore: number) => {
    const updated = recordGamePlay(gameId, finalScore);
    const withAchievements = checkAndUnlockAchievements(updated);
    setProfile(withAchievements);
  };

  // Filtered Games Calculation
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
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = game.title.toLowerCase().includes(q);
        const matchDesc = game.description.toLowerCase().includes(q);
        const matchTags = game.tags.some((t) => t.toLowerCase().includes(q));
        const matchCat = game.category.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchTags || matchCat;
      }
      return true;
    });
  }, [activeCategory, showFavoritesOnly, profile.favoriteGames, searchQuery]);

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

  const featuredGames = useMemo(() => {
    return GAMES_CATALOG.filter((g) => g.isFeatured || g.badge);
  }, []);

  const unlockedAchievementsCount = useMemo(() => {
    return profile.achievements.filter((a) => a.unlocked).length;
  }, [profile.achievements]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col light-dot-grid">
      {/* Top Navigation */}
      <Header
        soundEnabled={profile.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        favoritesCount={profile.favoriteGames.length}
        unlockedAchievementsCount={unlockedAchievementsCount}
        totalAchievementsCount={profile.achievements.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Banner (Spacious, High-Contrast Light Mode) */}
        <section className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-slate-800">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -top-16 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-white/10 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>100% Client-Side Physics • 0% Server Compute</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Instant Casual Gaming. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
                Zero Downloads. Zero Sign-Ups.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Enjoy 15+ curated retro classics, brain puzzles, and high-speed action games running directly on your browser's hardware with procedural 8-bit sound synthesis.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>15+ Active Games</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Local Highscore Vault</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Privacy First (Guest Mode)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex-1 overflow-hidden">
              <CategoryFilter
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                counts={categoryCounts}
              />
            </div>

            {/* Search Input Bar */}
            <div className="relative min-w-[260px] sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, tags, rules..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Featured Showcase (if showing All games without active search) */}
        {activeCategory === 'all' && !searchQuery && !showFavoritesOnly && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Featured & Trending Hits
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Handpicked Favorites</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredGames.slice(0, 4).map((game) => (
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
          </section>
        )}

        {/* Main Games Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {showFavoritesOnly
                  ? 'Your Favorite Games'
                  : activeCategory === 'all'
                  ? 'All Games Library'
                  : `${activeCategory.toUpperCase()} Games`}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold font-mono">
                {filteredGames.length}
              </span>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No games matched your criteria</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for another keyword or switch category filter to see all available games.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setShowFavoritesOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* SEO & Knowledge Section (Answer-First for Google & AI Engines) */}
        <section className="mt-12 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Frequently Asked Questions & Platform Overview
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Everything you need to know about playing free HTML5 web games on Arcadex.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">How does Arcadex achieve 0% server compute load?</h4>
              <p>
                Every game in the Arcadex library runs 100% on the client side using HTML5 Canvas, WebGL, and JavaScript event loops. All physics, collision detection, and procedural sound generation occur inside your browser's CPU/GPU. The hosting server only serves static files via high-speed Nginx Alpine caching.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Do I need to sign up or create an account to save high scores?</h4>
              <p>
                No account or sign-up is required. All your high scores, gameplay statistics, unlocked achievements, and favorite games are automatically saved locally on your device via HTML5 LocalStorage. You can also export or import your save data at any time from the "My Stats" drawer.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Are these games mobile-friendly with touch controls?</h4>
              <p>
                Yes! Every game comes with dedicated touch controls, on-screen responsive D-pads, swipe gestures, and virtual action buttons designed for smooth play on smartphones, tablets, and touch-screen laptops.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Can I play these games offline as a Web App (PWA)?</h4>
              <p>
                Yes. Arcadex includes a valid Web App Manifest (`manifest.json`) and service worker caching headers. You can install it on your Android or iOS home screen and launch games with instant sub-millisecond startup times.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-slate-800">Arcadex Web Games Hub</span>
            <span>• 100% Free & Open-Source</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-600">
            <a href="/robots.txt" className="hover:text-indigo-600 transition">Robots.txt</a>
            <a href="/sitemap.xml" className="hover:text-indigo-600 transition">Sitemap.xml</a>
            <a href="/llms.txt" className="hover:text-indigo-600 transition">llms.txt (AI Index)</a>
            <span className="text-slate-400">|</span>
            <span>Created for Imon Khan</span>
          </div>
        </div>
      </footer>

      {/* Game Player Modal */}
      <GamePlayerModal
        game={activeGame}
        onClose={handleCloseGame}
        onRecordGameOver={handleRecordGameOver}
        isFavorite={activeGame ? profile.favoriteGames.includes(activeGame.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Player Stats & Save Data Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        onUpdateProfile={(newProf) => setProfile(newProf)}
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
