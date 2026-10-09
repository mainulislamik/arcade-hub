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
  Gift, 
  Tv, 
  Car, 
  Crosshair, 
  ShieldCheck,
  Leaf,
  Wrench
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { GameItem, GameCategory } from '../types/game';
import { LanguageCode } from '../utils/i18n';
import { Globe } from 'lucide-react';
import { EcoEngine } from '../utils/ecoEngine';
import { HapticEngine } from '../utils/hapticEngine';

interface HeaderProps {
  games: GameItem[];
  activeCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onSelectGame: (game: GameItem) => void;
  onPlayRandom: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenDailyQuests?: () => void;
  onOpenStudio?: () => void;
  onOpenDeveloperPortal?: () => void;
  onOpenAdminPanel?: () => void;
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
  const [isEcoMode, setIsEcoMode] = useState(EcoEngine.isEco());
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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMobileSidebar();
            }}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-white tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
                ARCADEX
              </span>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none mt-0.5">
                3D WebGL Arcade
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
              placeholder="Search 3D Slope, Subway Runner, Hyper Drift, Stickman, Voxel Strike..."
              className="w-full pl-10 pr-9 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800/80 focus:bg-slate-900 text-white text-xs sm:text-sm font-medium border border-slate-800 focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] outline-none transition-all placeholder:text-slate-500"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                Matching Games ({searchResults.length})
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
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
                      index === selectedIndex ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      {game.coverImage ? (
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-cyan-950/60">
                          <Gamepad2 className="w-5 h-5 text-cyan-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white truncate">{game.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                          {game.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{game.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions, Gamification, Sound & Language */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Daily Quests & Spin Button */}
          {onOpenDailyQuests && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenDailyQuests();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer animate-pulse"
              title="Daily Quests & Lucky Spin"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">QUESTS</span>
            </button>
          )}

          {/* Random Game Shuffle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onPlayRandom();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
            title="Play Random Game"
          >
            <Dices className="w-4 h-4" />
          </button>

          {/* Leaderboard / Achievements */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
            title="View Achievements"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Level Studio / Map Maker */}
          {onOpenStudio && (
            <button
              onClick={() => {
                sounds.playClick();
                HapticEngine.lightTick();
                onOpenStudio();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Arcadex Level Studio & Map Maker"
            >
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline text-xs font-bold text-cyan-300">Studio</span>
            </button>
          )}

          {/* Eco-Friendly Mode Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              HapticEngine.lightTick();
              const newEco = EcoEngine.toggleEco();
              setIsEcoMode(newEco);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              isEcoMode
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-900/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-emerald-400'
            }`}
            title={isEcoMode ? 'Eco Battery Saver: Active (Low CPU/Power)' : 'Enable Eco-Friendly Battery Saver'}
          >
            <Leaf className={`w-4 h-4 ${isEcoMode ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
            <span className="hidden md:inline text-[10px] uppercase font-black">{isEcoMode ? 'ECO' : 'ECO'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          {onSelectLanguage && (
            <div className="relative group">
              <button 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="uppercase">{currentLanguage}</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      sounds.playClick();
                      onSelectLanguage(l.code);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                      currentLanguage === l.code ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span>{l.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
