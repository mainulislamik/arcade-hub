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
  Lightbulb,
  Share2,
  Star,
  Check,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
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
import { WordleGame } from './games/WordleGame';
import { AsteroidBlasterGame } from './games/AsteroidBlasterGame';
import { SudokuGame } from './games/SudokuGame';
import { ConnectFourGame } from './games/ConnectFourGame';
import { SimonEchoGame } from './games/SimonEchoGame';
import { BubbleShooterGame } from './games/BubbleShooterGame';
import { UltimateTicTacToeGame } from './games/UltimateTicTacToeGame';

interface GamePlayerModalProps {
  game: GameItem | null;
  onClose: () => void;
  onRecordGameOver?: (gameId: string, finalScore: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
}

export const GamePlayerModal: React.FC<GamePlayerModalProps> = ({
  game,
  onClose,
  onRecordGameOver,
  isFavorite,
  onToggleFavorite,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  if (!game) return null;

  const handleShareGame = () => {
    sounds.playClick();
    const shareUrl = `${window.location.origin}/?game=${game.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleGameOver = (score: number) => {
    if (onRecordGameOver) {
      onRecordGameOver(game.id, score);
    }
  };

  // Render specific interactive game component
  const renderGameComponent = () => {
    const props = {
      onGameOver: handleGameOver,
      onScoreUpdate: (s: number) => {},
    };

    switch (game.id) {
      case 'snake':
        return <SnakeGame {...props} />;
      case '2048':
        return <Game2048 {...props} />;
      case 'galaxy-defender':
        return <GalaxyDefender {...props} />;
      case 'flappy-bird':
        return <FlappyBirdGame {...props} />;
      case 'breakout':
        return <BreakoutGame {...props} />;
      case 'tetris':
        return <TetrisGame {...props} />;
      case 'pac-maze':
        return <PacMazeGame {...props} />;
      case 'memory-flip':
        return <MemoryFlipGame {...props} />;
      case 'minesweeper':
        return <MinesweeperGame {...props} />;
      case 'cyber-pong':
        return <CyberPongGame {...props} />;
      case 'word-quest':
        return <WordleGame {...props} />;
      case 'asteroid-blaster':
        return <AsteroidBlasterGame {...props} />;
      case 'sudoku':
        return <SudokuGame {...props} />;
      case 'connect-four':
        return <ConnectFourGame {...props} />;
      case 'simon-echo':
        return <SimonEchoGame {...props} />;
      case 'bubble-shooter':
        return <BubbleShooterGame {...props} />;
      case 'ultimate-tictactoe':
        return <UltimateTicTacToeGame {...props} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-600">
            <p>Game engine initialized. Ready to play!</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Top Controls Bar */}
      <div className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">{game.icon || '🎮'}</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {game.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="capitalize">{game.category}</span>
                <span>•</span>
                <span className="text-indigo-600 font-semibold">{game.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Share Direct Game Link */}
          <button
            onClick={handleShareGame}
            title="Copy Direct Game URL"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline">Share</span>
              </>
            )}
          </button>

          {/* Toggle Favorite */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFavorite(game.id);
            }}
            title={isFavorite ? 'Remove Favorite' : 'Save Favorite'}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Rules & Strategy Drawer Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowInfo(!showInfo);
            }}
            title="View Game Rules & SEO Guide"
            className={`p-2 rounded-xl transition ${
              showInfo
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition hidden sm:block"
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
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Stage & Rules Splitter */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-100">
        {/* Game Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-3 sm:p-6 shadow-xl border border-slate-200 flex flex-col items-center justify-center">
            {renderGameComponent()}
          </div>
        </div>

        {/* Game Guide & SEO Info Drawer */}
        {showInfo && (
          <div className="w-full sm:w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-6 shadow-2xl z-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Game Guide & Manual</h3>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview */}
            <div>
              <h4 className="text-xs uppercase font-mono font-bold text-indigo-600 mb-2">Overview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {game.longDescription || game.description}
              </p>
            </div>

            {/* How to Play */}
            {game.howToPlay && game.howToPlay.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-mono font-bold text-emerald-600 mb-2">
                  How to Play (Step-by-Step)
                </h4>
                <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
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
                <h4 className="text-xs uppercase font-mono font-bold text-amber-600 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Pro Strategies & High Score Tips
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
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
              <h4 className="text-xs uppercase font-mono font-bold text-blue-600 mb-2">Controls</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Keyboard / PC:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(game.controls.keyboard) ? (
                    game.controls.keyboard.map((ctrl: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                        {ctrl}
                      </span>
                    ))
                  ) : game.controls.keyboard ? (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                      {game.controls.keyboard}
                    </span>
                  ) : null}
                </div>
                <p className="font-semibold text-slate-800 mt-2">Touch / Mobile:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(game.controls.touch || game.controls.mobile) ? (
                    ((game.controls.touch || game.controls.mobile) as string[]).map((ctrl: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                        {ctrl}
                      </span>
                    ))
                  ) : (game.controls.touch || game.controls.mobile) ? (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                      {game.controls.touch || game.controls.mobile}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            {game.faqs && game.faqs.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-mono font-bold text-purple-600 mb-2 flex items-center gap-1.5">
                  <QuestionIcon className="w-4 h-4 text-purple-600" />
                  Frequently Asked Questions
                </h4>
                <div className="space-y-3 text-xs">
                  {game.faqs.map((faq, i) => (
                    <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-900">{faq.question}</p>
                      <p className="text-slate-600 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          Guest Session • 0% Server Compute • Auto-saved Locally
        </span>
        <span className="hidden sm:inline text-slate-500">
          Difficulty: <strong className="text-indigo-600">{game.difficulty}</strong> • Rating: ★ {game.rating.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
