import React from 'react';
import { GameCategory } from '../types/game';
import { LayoutGrid, Zap, Puzzle, Gamepad2, Swords, ShieldAlert, BookOpen, Sparkles } from 'lucide-react';

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
  const categories: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Games', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'retro', label: 'Retro Classics', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'puzzle', label: 'Puzzle & Logic', icon: <Puzzle className="w-4 h-4" /> },
    { id: 'word', label: 'Word Games', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'arcade', label: 'Arcade & Action', icon: <Zap className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy & 2P', icon: <Swords className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = counts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 shadow-sm'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-slate-500'}>
              {cat.icon}
            </span>
            <span>{cat.label}</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
