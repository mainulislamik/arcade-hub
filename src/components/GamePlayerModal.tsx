import React, { useState, useEffect } from 'react';
import { GameItem } from '../types/game';
import {
  X,
  Maximize2,
  Minimize2,
  HelpCircle,
  Heart,
  ArrowLeft,
  Shield,
  Sparkles,
  BookOpen,
  HelpCircle as QuestionIcon,
  Lightbulb,
  Share2,
  Check,
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';

// Game Components
import { SnakeGame } from './games/SnakeGame';
import { Game2048 } from './games/Game2048';
import { GalaxyDefender } from './games/GalaxyDefender';
import { WordleGame } from './games/WordleGame';
import { AsteroidBlasterGame } from './games/AsteroidBlasterGame';
import { SudokuGame } from './games/SudokuGame';
import { FlappyBirdGame } from './games/FlappyBirdGame';
import { BreakoutGame } from './games/BreakoutGame';
import { TetrisGame } from './games/TetrisGame';
import { ConnectFourGame } from './games/ConnectFourGame';
import { BubbleShooterGame } from './games/BubbleShooterGame';
import { UltimateTicTacToeGame } from './games/UltimateTicTacToeGame';
import { PacMazeGame } from './games/PacMazeGame';
import { MemoryFlipGame } from './games/MemoryFlipGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { CyberPongGame } from './games/CyberPongGame';
import { SimonEchoGame } from './games/SimonEchoGame';

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
  const [showGuide, setShowGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFullscreen]);

  if (!game) return null;

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleShare = () => {
    sounds.playClick();
    const url = `${window.location.origin}/?game=${game.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderActiveGame = () => {
    switch (game.id) {
      case 'snake':
        return <SnakeGame />;
      case '2048':
        return <Game2048 />;
      case 'galaxy-defender':
        return <GalaxyDefender />;
      case 'word-quest':
        return <WordleGame />;
      case 'asteroid-blaster':
        return <AsteroidBlasterGame />;
      case 'sudoku':
        return <SudokuGame />;
      case 'flappy-bird':
        return <FlappyBirdGame />;
      case 'breakout':
        return <BreakoutGame />;
      case 'tetris':
        return <TetrisGame />;
      case 'connect-four':
        return <ConnectFourGame />;
      case 'bubble-shooter':
        return <BubbleShooterGame />;
      case 'ultimate-tictactoe':
        return <UltimateTicTacToeGame />;
      case 'pac-maze':
        return <PacMazeGame />;
      case 'memory-flip':
        return <MemoryFlipGame />;
      case 'minesweeper':
        return <MinesweeperGame />;
      case 'cyber-pong':
        return <CyberPongGame />;
      case 'simon-echo':
        return <SimonEchoGame />;
      default:
        return <SnakeGame />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Games</span>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {game.title}
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {game.category}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Share Link Button */}
          <button
            onClick={handleShare}
            title="Copy Game Direct URL"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition text-xs font-semibold"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden md:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Guide & Strategy Drawer Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowGuide(!showGuide);
            }}
            title="Game Rules & Guide"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              showGuide
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guide & Tips</span>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFavorite(game.id);
            }}
            title="Toggle Favorite"
            className={`p-2 rounded-xl transition ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            title="Close Game"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Screen + Guide Drawer */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Game Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto">
          {renderActiveGame()}
        </div>

        {/* SEO-Rich Game Guide Slideout Drawer */}
        {showGuide && (
          <div className="w-full sm:w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl z-20 animate-slide-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Game Manual & SEO Guide
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview */}
            <div>
              <h4 className="text-xs uppercase font-mono font-bold text-cyan-400 mb-2">Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {game.longDescription || game.description}
              </p>
            </div>

            {/* How to Play */}
            {game.howToPlay && game.howToPlay.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-mono font-bold text-emerald-400 mb-2">
                  How to Play (Step-by-Step)
                </h4>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                  {game.howToPlay.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Strategy & Pro Tips */}
            {game.tips && game.tips.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-mono font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Pro Strategies & High Score Tips
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  {game.tips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Controls Cheat Sheet */}
            <div>
              <h4 className="text-xs uppercase font-mono font-bold text-blue-400 mb-2">Controls</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">Keyboard / PC:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(game.controls.keyboard) ? (
                    game.controls.keyboard.map((ctrl: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                        {ctrl}
                      </span>
                    ))
                  ) : game.controls.keyboard ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                      {game.controls.keyboard}
                    </span>
                  ) : null}
                </div>
                <p className="font-semibold text-slate-200 mt-2">Touch / Mobile:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(game.controls.touch || game.controls.mobile) ? (
                    ((game.controls.touch || game.controls.mobile) as string[]).map((ctrl: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[11px] border border-slate-700">
                        {ctrl}
                      </span>
                    ))
                  ) : (game.controls.touch || game.controls.mobile) ? (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[11px] border border-slate-700">
                      {game.controls.touch || game.controls.mobile}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            {game.faqs && game.faqs.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-mono font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                  <QuestionIcon className="w-4 h-4 text-purple-400" />
                  Frequently Asked Questions
                </h4>
                <div className="space-y-3 text-xs">
                  {game.faqs.map((faq, i) => (
                    <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <p className="font-bold text-slate-200">{faq.question}</p>
                      <p className="text-slate-400 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Guest Session • Zero Server Compute • Auto-saved Locally
        </span>
        <span className="hidden sm:inline text-slate-500">
          Difficulty: <strong className="text-cyan-400">{game.difficulty}</strong> • Rating: ★ {game.rating.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
