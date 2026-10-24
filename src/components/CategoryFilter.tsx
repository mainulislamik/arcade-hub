import React, { useRef } from 'react';
import { GameCategory } from '../types/game';
import {
  Zap,
  Gamepad2,
  Car,
  Swords,
  Puzzle,
  Crown,
  Brain,
  Crosshair,
  Heart,
  ChevronLeft,
  ChevronRight,
  Flame,
  Smartphone
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface CategoryFilterProps {
  activeCategory: GameCategory;
  onSelectCategory: (cat: GameCategory) => void;
  counts: Record<GameCategory, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Games', icon: <Zap className="w-4 h-4 text-amber-500 fill-amber-400" /> },
    { id: 'android', label: 'Android & Mobile', icon: <Smartphone className="w-4 h-4 text-emerald-500" /> },
    { id: 'arcade', label: 'Arcade & Skill', icon: <Zap className="w-4 h-4 text-purple-500" /> },
    { id: 'puzzle', label: 'Puzzle & Brain', icon: <Puzzle className="w-4 h-4 text-emerald-500" /> },
    { id: 'action', label: 'Action & 3D', icon: <Swords className="w-4 h-4 text-rose-500" /> },
    { id: 'driving', label: 'Driving & Racing', icon: <Car className="w-4 h-4 text-amber-500" /> },
    { id: 'shooting', label: 'Shooting & FPS', icon: <Crosshair className="w-4 h-4 text-cyan-500" /> },
    { id: 'strategy', label: 'Strategy & 2-Player', icon: <Brain className="w-4 h-4 text-blue-500" /> },
    { id: 'playstation', label: 'PlayStation (PS1/PS2/PSP)', icon: <Gamepad2 className="w-4 h-4 text-indigo-500" /> },
    { id: 'retro', label: 'Retro Classics', icon: <Crown className="w-4 h-4 text-yellow-500" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4 text-rose-500" /> },
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group w-full mb-6">
      {/* Scroll Left Button */}
      <button
        onClick={() => handleScroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white text-slate-700 border border-slate-200 shadow-md hover:bg-slate-50 hover:text-slate-900 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Categories Scroll Strip */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 select-none"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = counts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                onSelectCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white font-extrabold shadow-md shadow-slate-900/15 border border-slate-900'
                  : 'bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 shadow-xs'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : ''}`}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => handleScroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white text-slate-700 border border-slate-200 shadow-md hover:bg-slate-50 hover:text-slate-900 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
