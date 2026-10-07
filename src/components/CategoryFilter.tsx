import React from 'react';
import { GameCategory } from '../types/game';
import { LayoutGrid, Zap, Puzzle, Gamepad2, Swords, ShieldAlert } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: GameCategory;
  onSelectCategory: (cat: GameCategory) => void;
  counts: Record<GameCategory, number>;
}

const CATEGORIES: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Games', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'arcade', label: 'Arcade', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'retro', label: 'Retro 8-Bit', icon: <Zap className="w-4 h-4" /> },
  { id: 'puzzle', label: 'Puzzle & Mind', icon: <Puzzle className="w-4 h-4" /> },
  { id: 'action', label: 'Action Shooter', icon: <Swords className="w-4 h-4" /> },
  { id: 'strategy', label: 'Strategy', icon: <ShieldAlert className="w-4 h-4" /> },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;
        const count = counts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono ${
                isSelected ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
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
