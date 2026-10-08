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
  X
} from 'lucide-react';
import { GameCategory } from '../types/game';

interface SidebarProps {
  currentCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onOpenLegal: (page: 'privacy' | 'terms' | 'dmca' | 'about' | 'contact') => void;
  onSelectTag?: (tag: string) => void;
  onOpenRandom?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  favoritesCount: number;
  recentCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const CATEGORIES: { id: GameCategory; label: string; icon: React.ReactNode; count: number }[] = [
  { id: 'all', label: 'All Games', icon: <Gamepad2 className="w-5 h-5 text-indigo-600" />, count: 18 },
  { id: 'action', label: 'Action & Combat', icon: <Swords className="w-5 h-5 text-rose-600" />, count: 3 },
  { id: 'puzzle', label: 'Puzzle & Logic', icon: <Puzzle className="w-5 h-5 text-amber-600" />, count: 5 },
  { id: 'retro', label: 'Retro & Classic', icon: <RotateCcw className="w-5 h-5 text-emerald-600" />, count: 4 },
  { id: 'arcade', label: 'Arcade & Skill', icon: <Flame className="w-5 h-5 text-purple-600" />, count: 3 },
  { id: 'strategy', label: 'Strategy & Brain', icon: <Brain className="w-5 h-5 text-cyan-600" />, count: 2 },
  { id: 'word', label: 'Word & Trivia', icon: <Crosshair className="w-5 h-5 text-pink-600" />, count: 1 },
];

const POPULAR_TAGS = [
  '#2-Player',
  '#Endless',
  '#Space',
  '#Retro',
  '#Physics',
  '#Shooter',
  '#Memory',
  '#Puzzle'
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenLegal,
  onSelectTag,
  onOpenRandom,
  isCollapsed,
  onToggleCollapse,
  favoritesCount,
  recentCount,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white">
      {/* Header & Collapse Toggle */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Navigation
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 ml-auto"
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              currentCategory === 'all' 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5 shrink-0 text-indigo-600" />
            {!isCollapsed && <span>Home</span>}
          </button>

          {onOpenRandom && (
            <button
              onClick={() => {
                onOpenRandom();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
              title="Surprise Me (Random Game)"
            >
              <Dices className="w-5 h-5 shrink-0 text-amber-500 group-hover:rotate-45 transition-transform" />
              {!isCollapsed && <span>Random Game</span>}
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          {!isCollapsed && (
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Categories
            </h3>
          )}
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={cat.label}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={isActive ? 'text-white' : ''}>{cat.icon}</span>
                    {!isCollapsed && <span className="truncate">{cat.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Tags */}
        {!isCollapsed && onSelectTag && (
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-1.5 px-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onSelectTag(tag.replace('#', ''));
                    onCloseMobile();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200/60 rounded-lg transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Platform Legal & Trust (For Google AdSense compliance) */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Platform & Legal
            </h3>
            <button
              onClick={() => {
                onOpenLegal('about');
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>About Arcadex</span>
            </button>
            <button
              onClick={() => {
                onOpenLegal('privacy');
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => {
                onOpenLegal('terms');
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => {
                onOpenLegal('dmca');
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>DMCA Policy</span>
            </button>
            <button
              onClick={() => {
                onOpenLegal('contact');
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Contact Us</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          <p>© 2026 Arcadex Studio</p>
          <p className="font-semibold text-slate-500">100% Client-Side Engine</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside 
        className={`fixed top-16 left-0 bottom-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        } shadow-sm hidden md:flex`}
        aria-label="Sidebar Navigation"
      >
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        >
          <div 
            className="w-72 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
