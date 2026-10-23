import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameItem, GameCategory, PlayerProfile } from './types/game';
import { GAMES_CATALOG } from './data/games';
import { getPlayerProfile, getFavorites, toggleFavorite as toggleFavStorage } from './utils/storage';
import { getCustomGames } from './utils/customGamesStorage';
import { sounds } from './utils/soundEngine';
import { updateGameSEO, updateCategorySEO, resetToHomeSEO, updatePageSEO } from './utils/seo';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CrazyGamesGrid } from './components/CrazyGamesGrid';
import { GameTheaterPage } from './components/GameTheaterPage';
import { AchievementsModal } from './components/AchievementsModal';
import { StatsDrawer } from './components/StatsDrawer';
import { LegalPagesModal } from './components/LegalPagesModal';
import { DeveloperPortalModal } from './components/developer/DeveloperPortalModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { DailyQuestsModal } from './components/gamification/DailyQuestsModal';
import { ArcadexLevelStudioModal } from './components/studio/ArcadexLevelStudioModal';
import { ClientLocalRomModal } from './components/player/ClientLocalRomModal';
import { ChiptuneJukebox } from './components/player/ChiptuneJukebox';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { LanguageCode } from './utils/i18n';

export const App: React.FC = () => {
  // Navigation & Category Filtering State
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('arcadex_lang') as LanguageCode) || 'en';
  });

  // Player & System Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [profile, setProfile] = useState<PlayerProfile>(() => getPlayerProfile());

  // Dynamic Vault Games from IndexedDB / Storage
  const [customGames, setCustomGames] = useState<GameItem[]>([]);

  const refreshCustomGames = useCallback(async () => {
    try {
      const stored = await getCustomGames();
      setCustomGames(stored);
    } catch (e) {
      console.warn('Failed to load custom vault games:', e);
    }
  }, []);

  // Initial Load & Event Listeners
  useEffect(() => {
    refreshCustomGames();

    const handleGamesUpdate = () => {
      refreshCustomGames();
    };

    window.addEventListener('arcadex:games_updated', handleGamesUpdate);
    window.addEventListener('storage', handleGamesUpdate);

    return () => {
      window.removeEventListener('arcadex:games_updated', handleGamesUpdate);
      window.removeEventListener('storage', handleGamesUpdate);
    };
  }, [refreshCustomGames]);

  // Combined Live Catalog (Vault Uploads + Static Catalog)
  const allGames = useMemo(() => {
    return [...customGames, ...GAMES_CATALOG];
  }, [customGames]);

  // Modal Dialogs
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'dmca' | 'about' | 'contact' | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isDailyQuestsOpen, setIsDailyQuestsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDeveloperPortalOpen, setIsDeveloperPortalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLocalRomModalOpen, setIsLocalRomModalOpen] = useState(false);
  const [isSuperAdminRoute, setIsSuperAdminRoute] = useState<boolean>(() => {
    return window.location.pathname === '/imon' || window.location.pathname.startsWith('/imon/');
  });

  // URL Routing Sync (Deep Linking for /imon, ?game=slug or ?category=action or ?admin=true or ?legal=privacy)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === '/imon' || path.startsWith('/imon/')) {
        setIsSuperAdminRoute(true);
        return;
      } else {
        setIsSuperAdminRoute(false);
      }

      const params = new URLSearchParams(window.location.search);
      const gameSlug = params.get('game');
      const catParam = params.get('category') as GameCategory | null;
      const legalParam = params.get('legal') as 'privacy' | 'terms' | 'dmca' | 'about' | 'contact' | null;
      const adminParam = params.get('admin');

      if (adminParam === 'true' || window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }

      if (gameSlug) {
        const found = allGames.find((g) => g.slug === gameSlug || g.id === gameSlug);
        if (found) {
          setSelectedGame(found);
          updateGameSEO(found);
          return;
        }
      } else {
        setSelectedGame(null);
      }

      if (catParam && ['all', 'action', 'puzzle', 'retro', 'arcade', 'strategy', 'word', 'driving', 'shooting', 'playstation', 'favorites'].includes(catParam)) {
        setActiveCategory(catParam);
        if (catParam === 'all') {
          resetToHomeSEO();
        } else {
          updateCategorySEO(catParam);
        }
      } else if (!gameSlug) {
        resetToHomeSEO();
      }

      if (legalParam) {
        setActiveLegalModal(legalParam);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [allGames]);

  // Update URL on game select
  const handleSelectGame = useCallback((game: GameItem) => {
    setSelectedGame(game);
    setIsAdminOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.slug);
    url.searchParams.delete('category');
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateGameSEO(game);
  }, []);

  // Back to Lobby / Home
  const handleBackToLobby = useCallback(() => {
    setSelectedGame(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });

    resetToHomeSEO();
  }, []);

  // Category Switch
  const handleSelectCategory = useCallback((cat: GameCategory) => {
    setSelectedGame(null);
    setActiveCategory(cat);
    setSelectedTag(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    url.searchParams.delete('admin');
    if (cat === 'all') {
      url.searchParams.delete('category');
      resetToHomeSEO();
    } else {
      url.searchParams.set('category', cat);
      updateCategorySEO(cat);
    }
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Tag Click
  const handleSelectTag = useCallback((tag: string) => {
    setSelectedGame(null);
    setSelectedTag(tag);
    setActiveCategory('all');
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.toString());
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
    if (allGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allGames.length);
    const randomGame = allGames[randomIndex];
    handleSelectGame(randomGame);
  }, [allGames, handleSelectGame]);

  // Language Change
  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('arcadex_lang', lang);
  };

  // Dedicated Full-Page Super Admin Portal for /imon Route
  if (isSuperAdminRoute) {
    return (
      <SuperAdminDashboard
        allGames={allGames}
        onGameAddedOrUpdated={refreshCustomGames}
        onExitToLobby={() => {
          window.history.pushState({}, '', '/');
          setIsSuperAdminRoute(false);
        }}
        onPlayGame={(game) => {
          window.history.pushState({}, '', `/?game=${game.slug || game.id}`);
          setIsSuperAdminRoute(false);
          setSelectedGame(game);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* CrazyGames Top Header */}
      <Header
        games={allGames}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onSelectGame={handleSelectGame}
        onPlayRandom={handlePlayRandom}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenDailyQuests={() => setIsDailyQuestsOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenDeveloperPortal={() => setIsDeveloperPortalOpen(true)}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
        onOpenLocalRomModal={() => setIsLocalRomModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        favoritesCount={favorites.length}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      <div className="flex-1 flex">
        {/* Left Sticky Sidebar Navigation with Live Games Count */}
        <Sidebar
          games={allGames}
          currentCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onOpenLegal={(page) => setActiveLegalModal(page)}
          onOpenDeveloperPortal={() => setIsDeveloperPortalOpen(true)}
          onOpenAdminPanel={() => setIsAdminOpen(true)}
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
        <main className="flex-1 transition-all duration-300 min-w-0 w-full">
          {selectedGame ? (
            /* Dedicated Game Theater & SEO Page */
            <div className="p-3 sm:p-6 w-full">
              <GameTheaterPage
                game={selectedGame}
                allGames={allGames}
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
            <div className="p-3 sm:p-6 w-full">
              {selectedTag && (
                <div className="mb-4 flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase">Filtered by Tag:</span>
                    <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      #{selectedTag}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              <CrazyGamesGrid
                games={allGames}
                onSelectGame={handleSelectGame}
                activeCategory={activeCategory}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedTag={selectedTag}
                onOpenAdmin={() => setIsAdminOpen(true)}
                onOpenLocalRomModal={() => setIsLocalRomModalOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Client-Side BYOG Emulator Drop & Run Modal */}
      {isLocalRomModalOpen && (
        <ClientLocalRomModal
          isOpen={isLocalRomModalOpen}
          onClose={() => setIsLocalRomModalOpen(false)}
          onPlayGame={(game: GameItem) => {
            handleSelectGame(game);
          }}
        />
      )}

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboardModal
          isOpen={isAdminOpen}
          onClose={() => {
            setIsAdminOpen(false);
            const url = new URL(window.location.href);
            url.searchParams.delete('admin');
            window.history.pushState({}, '', url.toString());
          }}
          onGameAddedOrUpdated={refreshCustomGames}
          onPlayGame={(game: GameItem) => {
            handleSelectGame(game);
          }}
        />
      )}

      {/* Stats Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
      />

      {/* Achievements Modal */}
      {isAchievementsOpen && (
        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          achievements={profile.achievements}
        />
      )}

      {/* Daily Quests Modal */}
      {isDailyQuestsOpen && (
        <DailyQuestsModal
          isOpen={isDailyQuestsOpen}
          onClose={() => setIsDailyQuestsOpen(false)}
        />
      )}

      {/* Legal & Trust Pages Modal */}
      <LegalPagesModal
        isOpen={activeLegalModal !== null}
        pageType={activeLegalModal || 'privacy'}
        onClose={() => setActiveLegalModal(null)}
        onSwitchPage={(p) => setActiveLegalModal(p)}
      />

      {/* Developer Portal Modal */}
      {isDeveloperPortalOpen && (
        <DeveloperPortalModal
          isOpen={isDeveloperPortalOpen}
          onClose={() => setIsDeveloperPortalOpen(false)}
        />
      )}

      {/* Arcadex Visual Level Creator / Map Studio Modal */}
      {isStudioOpen && (
        <ArcadexLevelStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
        />
      )}

      {/* Floating Retro Synth Chiptune Radio */}
      <ChiptuneJukebox />
    </div>
  );
};

export default App;
