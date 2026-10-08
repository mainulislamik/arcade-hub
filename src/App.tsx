import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GameItem, GameCategory, PlayerProfile } from './types/game';
import { GAMES_CATALOG } from './data/games';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CrazyGamesGrid } from './components/CrazyGamesGrid';
import { GameTheaterPage } from './components/GameTheaterPage';
import { LegalPagesModal } from './components/LegalPagesModal';
import { AchievementsModal } from './components/AchievementsModal';
import { StatsDrawer } from './components/StatsDrawer';
import { sounds } from './utils/soundEngine';
import { 
  getFavorites, 
  toggleFavorite as toggleFavStorage, 
  getPlayerProfile, 
  recordGamePlay 
} from './utils/storage';
import { updatePageSEO } from './utils/seo';

export const App: React.FC = () => {
  // Navigation State
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Audio & User state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [profile, setProfile] = useState<PlayerProfile>(() => getPlayerProfile());

  // Modal Dialogs
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'dmca' | 'about' | 'contact' | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // URL Routing Sync (Deep Linking for ?game=slug or ?category=action or ?legal=privacy)
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const gameSlug = params.get('game');
      const catParam = params.get('category') as GameCategory | null;
      const legalParam = params.get('legal') as 'privacy' | 'terms' | 'dmca' | 'about' | 'contact' | null;

      if (gameSlug) {
        const found = GAMES_CATALOG.find((g) => g.slug === gameSlug || g.id === gameSlug);
        if (found) {
          setSelectedGame(found);
          updatePageSEO({
            title: `${found.title} - Play Free Online on Arcadex`,
            description: found.description,
            canonical: `http://localhost:3080/?game=${found.slug}`
          });
          return;
        }
      } else {
        setSelectedGame(null);
      }

      if (catParam && ['all', 'action', 'puzzle', 'retro', 'arcade', 'strategy', 'word'].includes(catParam)) {
        setActiveCategory(catParam);
        updatePageSEO({
          title: `Free ${catParam.toUpperCase()} Games Online - Arcadex`,
          description: `Play top rated ${catParam} browser games without download or login on Arcadex.`,
          canonical: `http://localhost:3080/?category=${catParam}`
        });
      } else if (!gameSlug) {
        updatePageSEO({
          title: 'Arcadex - Free Online Games (CrazyGames Style)',
          description: 'Play 18+ instant browser games online for free. No download, no signup, 0% server load.',
          canonical: 'http://localhost:3080/'
        });
      }

      if (legalParam) {
        setActiveLegalModal(legalParam);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Update URL on game select
  const handleSelectGame = useCallback((game: GameItem) => {
    setSelectedGame(game);
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.slug);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updatePageSEO({
      title: `${game.title} - Play Free Online on Arcadex`,
      description: game.description,
      canonical: `http://localhost:3080/?game=${game.slug}`
    });
  }, []);

  // Back to Lobby / Home
  const handleBackToLobby = useCallback(() => {
    setSelectedGame(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updatePageSEO({
      title: 'Arcadex - Free Online Games (CrazyGames Style)',
      description: 'Play 18+ instant browser games online for free. No download, no signup, 0% server load.',
      canonical: 'http://localhost:3080/'
    });
  }, []);

  // Category Switch
  const handleSelectCategory = useCallback((cat: GameCategory) => {
    setSelectedGame(null);
    setActiveCategory(cat);
    setSelectedTag(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    if (cat === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', cat);
    }
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Tag Click
  const handleSelectTag = useCallback((tag: string) => {
    setSelectedGame(null);
    setSelectedTag(tag);
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Favorite toggle
  const handleToggleFavorite = useCallback((gameId: string) => {
    const updated = toggleFavStorage(gameId);
    setFavorites(updated);
  }, []);

  // Audio Toggle
  const handleToggleSound = useCallback(() => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setEnabled(nextState);
  }, [soundEnabled]);

  // Surprise Me / Random Game launcher
  const handlePlayRandom = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * GAMES_CATALOG.length);
    const randomGame = GAMES_CATALOG[randomIndex];
    handleSelectGame(randomGame);
  }, [handleSelectGame]);

  // Filtered games for homepage
  const displayedGames = useMemo(() => {
    return GAMES_CATALOG.filter((g) => {
      const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
      const matchesTag = !selectedTag || g.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      return matchesCategory && matchesTag;
    });
  }, [activeCategory, selectedTag]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* CrazyGames Top Header */}
      <Header
        games={GAMES_CATALOG}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onSelectGame={handleSelectGame}
        onPlayRandom={handlePlayRandom}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        favoritesCount={favorites.length}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex-1 flex">
        {/* Left Sticky Sidebar Navigation */}
        <Sidebar
          currentCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onOpenLegal={(page) => setActiveLegalModal(page)}
          onSelectTag={handleSelectTag}
          onOpenRandom={handlePlayRandom}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          favoritesCount={favorites.length}
          recentCount={profile.recentGames.length}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main 
          className={`flex-1 transition-all duration-300 min-w-0 ${
            isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          {selectedGame ? (
            /* Dedicated Game Theater & SEO Page */
            <div className="p-3 sm:p-6 max-w-[1500px] mx-auto">
              <GameTheaterPage
                game={selectedGame}
                allGames={GAMES_CATALOG}
                onBackToLobby={handleBackToLobby}
                onSelectGame={handleSelectGame}
                isFavorite={favorites.includes(selectedGame.id)}
                onToggleFavorite={handleToggleFavorite}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
              />
            </div>
          ) : (
            /* Homepage Bento & Category Grids */
            <div className="p-3 sm:p-6 max-w-[1600px] mx-auto">
              {selectedTag && (
                <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-200/80 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase">Filtered by Tag:</span>
                    <span className="text-sm font-black text-indigo-900 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      #{selectedTag}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              <CrazyGamesGrid
                games={displayedGames}
                onSelectGame={handleSelectGame}
                activeCategory={activeCategory}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedTag={selectedTag}
              />
            </div>
          )}
        </main>
      </div>

      {/* Legal & Trust Pages Modal (Privacy, Terms, DMCA, About, Contact) */}
      <LegalPagesModal
        isOpen={activeLegalModal !== null}
        pageType={activeLegalModal || 'privacy'}
        onClose={() => setActiveLegalModal(null)}
        onSwitchPage={(p) => setActiveLegalModal(p)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={profile.achievements}
      />

      {/* Stats Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
      />
    </div>
  );
};

export default App;
