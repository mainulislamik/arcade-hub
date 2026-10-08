import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trophy, 
  Gamepad2, 
  BarChart3, 
  Heart, 
  Search, 
  Dices,
  Menu,
  X,
  Star,
  Flame,
  Swords,
  Puzzle,
  RotateCcw,
  Code2,
  Gift
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameItem, GameCategory } from '../types/game';
import { LanguageCode } from '../utils/i18n';
import { Globe } from 'lucide-react';

interface HeaderProps {
  games: GameItem[];
  activeCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onSelectGame: (game: GameItem) => void;
  onPlayRandom: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenDailyQuests?: () => void;
  onOpenDeveloperPortal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  favoritesCount: number;
  onOpenMobileSidebar: () => void;
  currentLanguage?: LanguageCode;
  onSelectLanguage?: (lang: LanguageCode) => void;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'bn', label: 'বাং', flag: '🇧🇩' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'hi', label: 'हिं', flag: '🇮🇳' },
  { code: 'ar', label: 'عر', flag: '🇸🇦' },
];

const CATEGORY_PILLS: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: '🔥 All Games', icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'action', label: '⚔️ Action', icon: <Swords className="w-3.5 h-3.5 text-rose-500" /> },
  { id: 'puzzle', label: '🧩 Puzzle', icon: <Puzzle className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'retro', label: '🕹️ Retro', icon: <RotateCcw className="w-3.5 h-3.5 text-emerald-500" /> },
  { id: 'arcade', label: '⚡ Arcade', icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" /> },
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
  onOpenDeveloperPortal,
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
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      }).slice(0, 7)
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMobileSidebar();
            }}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Toggle Navigation Menu"
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-all">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                ARCADEX
              </span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-0.5">
                CrazyGames Style
              </span>
            </div>
          </a>
        </div>

        {/* Center: Live Instant Autocomplete Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-lg hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearchOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search 1,115+ free games (e.g. Mecha Blaster, Hextris, Dino, Solitaire, Chess)..."
              className="w-full pl-10 pr-9 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-900 text-xs sm:text-sm font-medium border border-transparent focus:border-indigo-500 focus:shadow-sm outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                Matching Games ({searchResults.length})
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
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
                    className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-indigo-50/80 text-indigo-900' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      {game.coverImage ? (
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{game.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{game.description}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{game.rating ? game.rating.toFixed(1) : '4.9'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Developer Portal / Upload Hub */}
          {onOpenDeveloperPortal && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenDeveloperPortal();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/80 text-xs font-bold transition-all active:scale-95"
              title="Submit Games & 50% Revenue Share"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden xl:inline">DEV HUB</span>
              <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-md">50% REV</span>
            </button>
          )}

          {/* Daily Quests & Lucky Wheel */}
          {onOpenDailyQuests && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenDailyQuests();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95 animate-pulse"
              title="Daily Quests & Lucky Spin Wheel"
            >
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">QUESTS</span>
            </button>
          )}

          {/* Surprise Me / Random Game Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onPlayRandom();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95"
            title="Play a random game"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden lg:inline">SURPRISE ME</span>
          </button>

          {/* Achievements Trophy */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="View Achievements"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Stats Drawer */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenStats();
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="Player Stats"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Language Selector Dropdown */}
          {onSelectLanguage && (
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="uppercase text-[11px]">{currentLanguage || 'en'}</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1 px-1 min-w-[120px] hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      sounds.playClick();
                      onSelectLanguage(lang.code);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLanguage === lang.code && <span className="text-indigo-600 text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl transition-colors ${
              soundEnabled ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={soundEnabled ? 'Mute Web Audio' : 'Unmute Web Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Quick Category Navigation Pills (CrazyGames Subheader) */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-3 sm:px-6 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORY_PILLS.map((pill) => (
          <button
            key={pill.id}
            onClick={() => {
              sounds.playClick();
              onSelectCategory(pill.id);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === pill.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
            }`}
          >
            <span>{pill.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
