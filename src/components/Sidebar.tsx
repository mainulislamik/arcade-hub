import React from 'react';
import { 
  Gamepad2, 
  Swords, 
  Puzzle, 
  RotateCcw, 
  Crosshair, 
  Brain, 
  Trophy,
  Dices,
  Car,
  Zap,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { GameCategory, GameItem } from '../types/game';

interface SidebarProps {
  games?: GameItem[];
  currentCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onOpenLegal: (page: 'privacy' | 'terms' | 'dmca' | 'about' | 'contact') => void;
  onOpenDeveloperPortal?: () => void;
  onOpenAdminPanel?: () => void;
  onSelectTag?: (tag: string) => void;
  onOpenRandom?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  favoritesCount: number;
  recentCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const POPULAR_TAGS = [
  '#3D-WebGL',
  '#Subway',
  '#Slope',
  '#Drift',
  '#Stickman',
  '#2-Player',
  '#Endless',
  '#Retro'
];

export const Sidebar: React.FC<SidebarProps> = ({
  games = [],
  currentCategory,
  onSelectCategory,
  onOpenLegal,
  onOpenDeveloperPortal,
  onOpenAdminPanel,
  onSelectTag,
  onOpenRandom,
  isCollapsed,
  onToggleCollapse,
  favoritesCount,
  recentCount,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const getCategoryCount = (catId: GameCategory) => {
    if (catId === 'all') return games.length;
    if (catId === 'strategy') {
      return games.filter(g => g.category === 'strategy' || (g.category as string) === 'word').length;
    }
    return games.filter(g => g.category === catId).length;
  };

  const categories: { id: GameCategory; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'action', label: 'Action & 3D', icon: <Swords className="w-4 h-4 text-rose-400" />, count: getCategoryCount('action') },
    { id: 'retro', label: 'Retro & Nokia', icon: <RotateCcw className="w-4 h-4 text-amber-400" />, count: getCategoryCount('retro') },
    { id: 'arcade', label: 'Arcade & Skill', icon: <Zap className="w-4 h-4 text-purple-400" />, count: getCategoryCount('arcade') },
    { id: 'shooting', label: 'Shooting & FPS', icon: <Crosshair className="w-4 h-4 text-cyan-400" />, count: getCategoryCount('shooting') },
    { id: 'driving', label: 'Driving & Cars', icon: <Car className="w-4 h-4 text-amber-400" />, count: getCategoryCount('driving') },
    { id: 'puzzle', label: 'Puzzle & Logic', icon: <Puzzle className="w-4 h-4 text-emerald-400" />, count: getCategoryCount('puzzle') },
    { id: 'strategy', label: 'Strategy & Brain', icon: <Brain className="w-4 h-4 text-blue-400" />, count: getCategoryCount('strategy') },
  ];

  const allGamesCount = getCategoryCount('all');

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      {/* Header & Collapse Toggle */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            ARCADE DISCOVERY
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-auto cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6 scrollbar-thin">
        {/* Main Discovery Quick Links */}
        <div className="space-y-1">
          {/* All Games */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              currentCategory === 'all' 
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-md border border-cyan-500/50' 
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-5 h-5 text-cyan-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">All Games</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  currentCategory === 'all'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}>
                  {allGamesCount}
                </span>
              </div>
            )}
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              onSelectCategory('favorites');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentCategory === 'favorites' 
                ? 'bg-rose-500/20 text-rose-300 shadow-md border border-rose-500/50' 
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5 text-rose-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">Favorites</span>
                {favoritesCount > 0 ? (
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                    {favoritesCount}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700/60">
                    0
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        {/* Categories Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1">
              Top Categories
            </span>
          )}
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40' 
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
                title={isCollapsed ? cat.label : undefined}
              >
                <div className="shrink-0">{cat.icon}</div>
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{cat.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                      isActive 
                        ? 'bg-cyan-400 text-slate-950 font-black' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}>
                      {cat.count}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Trending Tags (Only visible when expanded) */}
        {!isCollapsed && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block">
              Trending Tags
            </span>
            <div className="flex flex-wrap gap-1.5 px-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onSelectTag && onSelectTag(tag.replace('#', ''));
                    onCloseMobile();
                  }}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-500/40 rounded-lg text-[11px] font-medium text-slate-400 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions (Surprise me & Stats) */}
        {!isCollapsed && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                onOpenRandom && onOpenRandom();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Surprise Game (Random)</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer / Copyright / Safe Gaming Badge */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-500 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0% Server Load · 100% Client-Side</span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-cyan-400 transition-colors">Privacy</button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-cyan-400 transition-colors">Terms</button>
            <button onClick={() => onOpenLegal('dmca')} className="hover:text-cyan-400 transition-colors">DMCA</button>
            <button onClick={() => onOpenLegal('about')} className="hover:text-cyan-400 transition-colors">About</button>
            <button onClick={() => onOpenLegal('contact')} className="hover:text-cyan-400 transition-colors">Contact</button>
          </div>

          <div className="text-slate-600 text-[9px] pt-1 border-t border-slate-900">
            © 2026 Arcadex Hub · All Rights Reserved
          </div>
        </div>
      )}
    </div>
  );
};
