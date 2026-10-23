import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Volume2,
  VolumeX,
  Heart,
  Search,
  Dices,
  Menu,
  X,
  Star,
  Flame,
  Gamepad2,
  Globe,
  UploadCloud,
  Command,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameItem, GameCategory } from '../types/game';
import { handleGameImageError } from '../utils/imageFallback';
import { LanguageCode } from '../utils/i18n';
import { HapticEngine } from '../utils/hapticEngine';

interface HeaderProps {
  games: GameItem[];
  activeCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onSelectGame: (game: GameItem) => void;
  onPlayRandom: () => void;
  onOpenStats?: () => void;
  onOpenAchievements?: () => void;
  onOpenDailyQuests?: () => void;
  onOpenStudio?: () => void;
  onOpenDeveloperPortal?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenLocalRomModal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  favoritesCount: number;
  onOpenMobileSidebar: () => void;
  currentLanguage?: LanguageCode;
  onSelectLanguage?: (lang: LanguageCode) => void;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export const Header: React.FC<HeaderProps> = ({
  games,
  activeCategory,
  onSelectCategory,
  onSelectGame,
  onPlayRandom,
  onOpenStats,
  onOpenAchievements,
  onOpenDailyQuests,
  onOpenStudio,
  onOpenDeveloperPortal,
  onOpenAdminPanel,
  onOpenLocalRomModal,
  soundEnabled,
  onToggleSound,
  favoritesCount,
  onOpenMobileSidebar,
  currentLanguage = 'en',
  onSelectLanguage
}) => {
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K shortcut to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Filtered games based on search query
  const searchResults = query.trim()
    ? games.filter((g) => {
        const q = query.toLowerCase().trim();
        return (
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        onSelectGame(searchResults[selectedIndex]);
        setIsSearchOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMobileSidebar();
            }}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('all');
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* ZapGames electric icon badge */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-400/20 group-hover:scale-105 group-hover:shadow-amber-400/30 transition-all duration-300">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950 transform -rotate-6 group-hover:rotate-0 transition-transform" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                  ARCADEX
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 border border-amber-300/60 text-[9px] font-black uppercase tracking-wider font-mono">
                  ZAP
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
                3D ARCADE HUB
              </span>
            </div>
          </a>
        </div>

        {/* Center: ZapGames Capsule Search Bar with Autocomplete & Ctrl+K */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearchOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search 5,500+ free games (Slope, Subway Runner, Hyper Drift, PS1...)"
              className="w-full pl-11 pr-20 py-2.5 rounded-full bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs sm:text-sm font-medium border border-slate-200/90 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/80 outline-none transition-all placeholder:text-slate-400 shadow-inner"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query ? (
                <button
                  onClick={() => {
                    setQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs pointer-events-none">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown - High Contrast Light Mode Card */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-600 uppercase tracking-wider px-4 flex items-center justify-between">
                <span>Matching Games ({searchResults.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Use ↑↓ keys + Enter</span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((game, index) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectGame(game);
                      setIsSearchOpen(false);
                      setQuery('');
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-indigo-50/80 text-indigo-900' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/90 shadow-xs">
                      {game.coverImage ? (
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          onError={(e) => handleGameImageError(e, game.title, game.platform, game.category)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                          <Gamepad2 className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 truncate">{game.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {game.rating && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {game.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase border border-slate-200">
                            {game.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{game.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Action Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Search Games"
            aria-label="Search games"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Random Game Shuffle Dice Button */}
          <button
            onClick={() => {
              sounds.playClick();
              HapticEngine.lightTick();
              onPlayRandom();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all active:scale-95 cursor-pointer font-bold text-xs"
            title="Play Random Game"
            aria-label="Launch a random game"
          >
            <Dices className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline">Random</span>
          </button>

          {/* Favorites Pill Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onSelectCategory('favorites');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer border ${
              activeCategory === 'favorites'
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-rose-500/10'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 hover:border-slate-300'
            }`}
            title="View Favorite Games"
            aria-label="View favorite games"
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Favorites</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              favoritesCount > 0
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {favoritesCount}
            </span>
          </button>

          {/* Client-Side BYOG Emulator Loader ("Drop ROM") */}
          {onOpenLocalRomModal && (
            <button
              onClick={() => {
                sounds.playClick();
                HapticEngine.lightTick();
                onOpenLocalRomModal();
              }}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border border-indigo-200/90 text-xs font-black flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-95 cursor-pointer"
              title="Play Local ROM from your PC (.JAR, .SIS, .GBA, .NES, .SWF) - Zero Server Upload"
              aria-label="Drop ROM emulator"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">DROP ROM</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
              soundEnabled
                ? 'bg-white text-indigo-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switcher Dropdown */}
          {onSelectLanguage && (
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Change Language"
                aria-label="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="uppercase font-mono">{currentLanguage}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 hidden group-hover:block z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Select Language
                </div>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      sounds.playClick();
                      onSelectLanguage(l.code);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                      currentLanguage === l.code ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-sm">{l.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3 pb-3 border-t border-slate-100 pt-2 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search 5,500+ free games..."
              className="w-full pl-10 pr-9 py-2 rounded-full bg-slate-100 text-slate-900 text-xs font-medium border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isSearchOpen && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(game);
                    setIsSearchOpen(false);
                    setIsMobileSearchOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-2.5 p-2.5 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {game.coverImage ? (
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        onError={(e) => handleGameImageError(e, game.title, game.platform, game.category)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Gamepad2 className="w-5 h-5 text-indigo-600 m-1.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{game.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{game.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
