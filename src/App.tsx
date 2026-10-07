import React, { useState, useMemo, useEffect } from 'react';
import { GameItem, GameCategory, PlayerProfile } from './types/game';
import { GAMES_CATALOG } from './data/games';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { GameCard } from './components/GameCard';
import { GamePlayerModal } from './components/GamePlayerModal';
import { StatsDrawer } from './components/StatsDrawer';
import { getPlayerProfile, toggleFavoriteGame, resetPlayerProfile } from './utils/storage';
import { sounds } from './utils/soundEngine';
import { Search, Sparkles, Gamepad2, Zap, Flame, Shield, Cpu, Play, Award, Terminal, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile>(() => getPlayerProfile());
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  // Reload profile state from storage
  const refreshProfile = () => {
    setProfile(getPlayerProfile());
  };

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const handleToggleFavorite = (gameId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playCoin();
    const updated = toggleFavoriteGame(gameId);
    setProfile(updated);
  };

  const handleResetData = () => {
    resetPlayerProfile();
    refreshProfile();
    sounds.playHit();
  };

  const handlePlayGame = (game: GameItem) => {
    setActiveGame(game);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      all: GAMES_CATALOG.length,
      arcade: 0,
      retro: 0,
      puzzle: 0,
      action: 0,
      strategy: 0,
    };
    GAMES_CATALOG.forEach(g => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter(game => {
      if (showFavoritesOnly && !profile.favoriteGames.includes(game.id)) {
        return false;
      }
      if (selectedCategory !== 'all' && game.category !== selectedCategory) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !game.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !game.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !game.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery, showFavoritesOnly, profile.favoriteGames]);

  // Recently played games list
  const recentGames = useMemo(() => {
    return profile.recentGames
      .map(id => GAMES_CATALOG.find(g => g.id === id))
      .filter((g): g is GameItem => Boolean(g));
  }, [profile.recentGames]);

  // Featured Game (e.g. Galaxy Defender or Retro Snake)
  const featuredGame = GAMES_CATALOG[2]; // Galaxy Defender

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 scanline-bg">
      {/* Top Navigation */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStats={() => {
          sounds.playClick();
          setIsStatsOpen(true);
        }}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(f => !f)}
        favoritesCount={profile.favoriteGames.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-6 sm:p-10 shadow-2xl shadow-cyan-950/20">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Web Arcade • No Registration</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white leading-tight">
                Play Instantly in Your Browser{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                  With Zero Latency
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Enjoy 10 handcrafted retro and arcade classics powered 100% by your browser's CPU/GPU.
                No sign-up, no downloads, and zero server processing load.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>100% Client-Side</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant Play</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Local High Scores</span>
                </div>
              </div>
            </div>

            {/* Featured Game Card */}
            {featuredGame && (
              <div
                onClick={() => handlePlayGame(featuredGame)}
                className="w-full lg:w-80 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" /> FEATURED GAME
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                    {featuredGame.category}
                  </span>
                </div>
                <div className={`w-full h-32 rounded-xl bg-gradient-to-tr ${featuredGame.thumbnailGradient} flex items-center justify-center p-3 mb-3 shadow-inner group-hover:scale-[1.02] transition-transform`}>
                  <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg group-hover:bg-cyan-400 transition-colors">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-100 text-base font-display group-hover:text-cyan-400 transition-colors">
                  {featuredGame.title}
                </h4>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                  {featuredGame.description}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Search and Filters Strip */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search games by title, genre, or tag..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={cat => {
                sounds.playClick();
                setSelectedCategory(cat);
              }}
              counts={categoryCounts}
            />
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory !== 'all' || showFavoritesOnly || searchQuery) && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span>Showing results for:</span>
              {selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 bg-slate-800 rounded-md text-cyan-400 font-semibold uppercase">
                  Category: {selectedCategory}
                </span>
              )}
              {showFavoritesOnly && (
                <span className="px-2 py-0.5 bg-rose-500/20 rounded-md text-rose-400 font-semibold">
                  Favorites Only
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 bg-slate-800 rounded-md text-amber-400 font-semibold">
                  Query: "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                  setSearchQuery('');
                }}
                className="text-cyan-400 hover:underline ml-2 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Reset filters
              </button>
            </div>
          )}
        </section>

        {/* Recently Played Strip */}
        {recentGames.length > 0 && !searchQuery && selectedCategory === 'all' && !showFavoritesOnly && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> RECENTLY PLAYED
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentGames.slice(0, 5).map(game => (
                <div
                  key={game.id}
                  onClick={() => handlePlayGame(game)}
                  className="bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3 cursor-pointer group transition"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${game.thumbnailGradient} flex items-center justify-center text-sm shadow-inner group-hover:scale-105 transition-transform`}>
                    🎮
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                      {game.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      Best: {profile.gameStats[game.id]?.highScore || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Games Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 font-display flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <span>GAME CATALOG ({filteredGames.length})</span>
            </h2>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
              <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No games matched your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for different keywords or clear the category filters to browse all games.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl transition"
              >
                Show All Games
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  stats={profile.gameStats[game.id]}
                  isFavorite={profile.favoriteGames.includes(game.id)}
                  onPlay={handlePlayGame}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-8 px-4 mt-12 text-xs text-slate-500 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 font-display font-bold text-slate-400">
          <span>ARCADEX</span>
          <span>•</span>
          <span>Client-First Web Arcade</span>
        </div>
        <p className="max-w-xl mx-auto text-[11px] text-slate-500 leading-relaxed">
          Designed for pure performance. Games run completely inside your web browser via HTML5 Canvas,
          Web Audio synthesizer, and local storage. No user accounts, cookies, or backend computational overhead.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-mono">
          <span>React 18 + Vite</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>Nginx Alpine Docker</span>
        </div>
      </footer>

      {/* Active Game Player Modal */}
      {activeGame && (
        <GamePlayerModal
          game={activeGame}
          onClose={() => {
            setActiveGame(null);
            refreshProfile();
          }}
          isFavorite={profile.favoriteGames.includes(activeGame.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Stats Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
        onResetData={handleResetData}
      />
    </div>
  );
};

export default App;
