import React, { useState, useEffect } from 'react';
import { GameItem } from '../types/game';
import { X, Maximize2, Minimize2, HelpCircle, Heart, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

// Game Components
import { SnakeGame } from './games/SnakeGame';
import { Game2048 } from './games/Game2048';
import { GalaxyDefender } from './games/GalaxyDefender';
import { FlappyBirdGame } from './games/FlappyBirdGame';
import { BreakoutGame } from './games/BreakoutGame';
import { TetrisGame } from './games/TetrisGame';
import { PacMazeGame } from './games/PacMazeGame';
import { MemoryFlipGame } from './games/MemoryFlipGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { CyberPongGame } from './games/CyberPongGame';

interface GamePlayerModalProps {
  game: GameItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
}

export const GamePlayerModal: React.FC<GamePlayerModalProps> = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!game) return null;

  const renderGame = () => {
    switch (game.id) {
      case 'snake':
        return <SnakeGame />;
      case 'game-2048':
        return <Game2048 />;
      case 'galaxy-defender':
        return <GalaxyDefender />;
      case 'flappy-bird':
        return <FlappyBirdGame />;
      case 'breakout':
        return <BreakoutGame />;
      case 'tetris':
        return <TetrisGame />;
      case 'pac-maze':
        return <PacMazeGame />;
      case 'memory-flip':
        return <MemoryFlipGame />;
      case 'minesweeper':
        return <MinesweeperGame />;
      case 'cyber-pong':
        return <CyberPongGame />;
      default:
        return <div className="text-center text-slate-400 py-12">Game not found</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2 px-3 sm:px-4 bg-slate-900/90 border border-slate-800 rounded-2xl mb-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Arcade</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 font-display">
                {game.title}
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md">
                {game.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite(game.id)}
            className={`p-2 rounded-xl border transition ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Favorite Game"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Controls Toggle */}
          <button
            onClick={() => setShowControls(c => !c)}
            className={`p-2 rounded-xl border transition ${
              showControls
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white rounded-xl transition"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Info Drawer */}
      {showControls && (
        <div className="w-full max-w-4xl bg-slate-900 border border-cyan-500/30 p-4 rounded-2xl mb-3 animate-in slide-in-from-top-4 shadow-xl text-xs text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 font-display text-sm">
              <Sparkles className="w-4 h-4" /> HOW TO PLAY & CONTROLS
            </h4>
            <button onClick={() => setShowControls(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">⌨️ Keyboard Controls:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {game.controls.keyboard.map((ctrl, i) => (
                  <li key={i}>{ctrl}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">📱 Mobile / Touch Controls:</span>
              <p className="text-slate-400">{game.controls.touch}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Game Arena */}
      <div className="flex-1 w-full max-w-4xl flex items-center justify-center min-h-[460px]">
        {renderGame()}
      </div>

      {/* Bottom Guest Mode Footer */}
      <div className="w-full max-w-4xl text-center py-2 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Guest Mode Active • High scores saved to your browser • 0 Server Latency</span>
      </div>
    </div>
  );
};
