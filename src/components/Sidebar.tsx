import React from 'react';
import { 
  Home, 
  Flame, 
  Sparkles, 
  Heart, 
  Clock, 
  Gamepad2, 
  Swords, 
  Puzzle, 
  RotateCcw, 
  Crosshair, 
  Brain, 
  Trophy,
  Dices,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Car,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { GameCategory } from '../types/game';
import { GAMES_CATALOG } from '../data/games';

interface SidebarProps {
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

const getCategoryCount = (catId: GameCategory) => {
  if (catId === 'all') return GAMES_CATALOG.length;
  return GAMES_CATALOG.filter(g => g.category === catId).length;
};

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
  const categories: { id: GameCategory; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All Games', icon: <Gamepad2 className="w-5 h-5 text-cyan-400" />, count: getCategoryCount('all') },
    { id: 'action', label: 'Action & 3D', icon: <Swords className="w-5 h-5 text-rose-400" />, count: getCategoryCount('action') },
    { id: 'driving', label: 'Driving & Cars', icon: <Car className="w-5 h-5 text-amber-400" />, count: getCategoryCount('driving') },
    { id: 'shooting', label: 'Shooting & FPS', icon: <Crosshair className="w-5 h-5 text-cyan-400" />, count: getCategoryCount('shooting') },
    { id: 'arcade', label: 'Arcade & Skill', icon: <Zap className="w-5 h-5 text-purple-400" />, count: getCategoryCount('arcade') },
    { id: 'puzzle', label: 'Puzzle & Logic', icon: <Puzzle className="w-5 h-5 text-emerald-400" />, count: getCategoryCount('puzzle') },
    { id: 'strategy', label: 'Strategy & Brain', icon: <Brain className="w-5 h-5 text-blue-400" />, count: getCategoryCount('strategy') },
  ];

  const content = (
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
        {/* Main Quick Links */}
        <div className="space-y-1">
          <button
            onClick={() => {
              onSelectCategory('all');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentCategory === 'all' 
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40' 
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-5 h-5 text-cyan-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Featured 3D & Hits</span>}
          </button>

          <button
            onClick={() => {
              onSelectCategory('favorites');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentCategory === 'favorites' 
                ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/40' 
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5 text-rose-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">Favorites</span>
                {favoritesCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                    {favoritesCount}
                  </span>
                )}
              </div>
            )}
          </button>

          {onOpenAdminPanel && (
            <button
              onClick={() => {
                onOpenAdminPanel();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all border border-cyan-500/30 shadow-sm cursor-pointer"
              title={isCollapsed ? 'IT Admin Vault Gateway' : undefined}
            >
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate font-bold">Admin Vault</span>
                  <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[9px] font-black uppercase">
                    IT
                  </span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Categories Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1">
              Top Categories
            </span>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentCategory === cat.id 
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40' 
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
              title={isCollapsed ? cat.label : undefined}
            >
              <div className="shrink-0">{cat.icon}</div>
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{cat.label}</span>
                  <span className="text-[11px] text-slate-500 font-bold">{cat.count}</span>
                </div>
              )}
            </button>
          ))}
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
                    if (onSelectTag) onSelectTag(tag.replace('#', '').toLowerCase());
                    onCloseMobile();
                  }}
                  className="text-[11px] font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 bg-slate-800/50 border border-slate-700/40 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Legal Links */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-300 cursor-pointer">Privacy</button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-slate-300 cursor-pointer">Terms</button>
            <button onClick={() => onOpenLegal('dmca')} className="hover:text-slate-300 cursor-pointer">DMCA</button>
            <button onClick={() => onOpenLegal('about')} className="hover:text-slate-300 cursor-pointer">About</button>
            <button onClick={() => onOpenLegal('contact')} className="hover:text-slate-300 cursor-pointer">Contact</button>
          </div>
          <div className="text-[10px] text-slate-600">
            © 2026 Arcadex. 100% Client-Side WebGL.
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300 shrink-0 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-900 z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
