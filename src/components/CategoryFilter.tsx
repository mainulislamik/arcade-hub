import React from 'react';
import { GameCategory } from '../types/game';
import { LayoutGrid, Zap, Puzzle, Gamepad2, Swords, ShieldAlert, BookOpen, Compass } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  categoryCounts: Record<GameCategory, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const categories: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Games', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'arcade', label: 'Arcade', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'puzzle', label: 'Puzzle', icon: <Puzzle className="w-4 h-4" /> },
    { id: 'retro', label: 'Retro', icon: <Zap className="w-4 h-4" /> },
    { id: 'action', label: 'Action', icon: <Swords className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'word', label: 'Word Games', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none select-none max-w-full">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <span className={isSelected ? 'text-slate-950' : 'text-cyan-400'}>{cat.icon}</span>
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
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
