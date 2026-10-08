import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Maximize2, 
  Share2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Star, 
  Gamepad2, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  HelpCircle, 
  Check, 
  ArrowLeft,
  Info,
  Calendar,
  ShieldCheck,
  Zap,
  Flame,
  Award
} from 'lucide-react';
import { GameItem } from '../types/game';
import { sounds } from '../utils/soundEngine';
import { recordGamePlay } from '../utils/storage';

// Game Component Imports
import { MechaBlaster2Game } from './games/MechaBlaster2Game';
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

interface GameTheaterPageProps {
  game: GameItem;
  allGames: GameItem[];
  onBackToLobby: () => void;
  onSelectGame: (game: GameItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameTheaterPage: React.FC<GameTheaterPageProps> = ({
  game,
  allGames,
  onBackToLobby,
  onSelectGame,
  isFavorite,
  onToggleFavorite,
  soundEnabled,
  onToggleSound
}) => {
  const [isTheaterExpanded, setIsTheaterExpanded] = useState(false);
  const [likes, setLikes] = useState<number>(() => Math.floor((game.plays || 12000) * 0.12));
  const [dislikes, setDislikes] = useState<number>(() => Math.floor((game.plays || 12000) * 0.008));
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [gameKey, setGameKey] = useState<number>(0);

  const theaterContainerRef = useRef<HTMLDivElement | null>(null);

  // Update Page Title & URL for SEO
  useEffect(() => {
    document.title = `${game.title} - Play Free Online on Arcadex`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update query param
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.slug);
    window.history.replaceState({}, '', url.toString());

    // Record game play in storage
    recordGamePlay(game.id, 0);

    return () => {
      document.title = 'Arcadex - Play 18+ Free Instant Online Web Games';
    };
  }, [game]);

  const handleVote = (type: 'like' | 'dislike') => {
    sounds.playClick();
    if (userVote === type) {
      setUserVote(null);
      if (type === 'like') setLikes(l => l - 1);
      else setDislikes(d => d - 1);
    } else {
      if (userVote === 'like') setLikes(l => l - 1);
      if (userVote === 'dislike') setDislikes(d => d - 1);
      setUserVote(type);
      if (type === 'like') setLikes(l => l + 1);
      else setDislikes(d => d + 1);
    }
  };

  const handleShare = () => {
    sounds.playClick();
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleFullscreen = () => {
    sounds.playClick();
    if (theaterContainerRef.current) {
      if (!document.fullscreenElement) {
        theaterContainerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setGameKey(k => k + 1);
  };

  const relatedGames = allGames
    .filter(g => g.id !== game.id)
    .slice(0, 6);

  // Render Game Component by ID
  const renderGame = () => {
    const props = {
      key: `${game.id}-${gameKey}`,
      onScoreUpdate: (s: number) => setCurrentScore(s),
      onGameOver: (s: number) => {
        setCurrentScore(s);
        recordGamePlay(game.id, s);
      }
    };

    switch (game.id) {
      case 'mecha-blaster-2':
        return <MechaBlaster2Game {...props} />;
      case 'snake':
        return <SnakeGame {...props} />;
      case 'game-2048':
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
      case 'wordle':
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
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Gamepad2 className="w-12 h-12 mb-3 text-indigo-500 animate-bounce" />
            <p className="font-bold text-lg text-slate-800">Game Loading...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button 
            onClick={onBackToLobby}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="capitalize text-slate-600 font-bold">{game.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{game.title}</span>
        </div>
      </div>

      {/* Main Theater Stage Container */}
      <div className={`mx-auto px-4 sm:px-6 transition-all duration-300 ${
        isTheaterExpanded ? 'max-w-full' : 'max-w-7xl'
      }`}>
        {/* Game Title Bar */}
        <div className="bg-white rounded-t-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img 
              src={game.coverImage || '/assets/covers/snake-retro.jpg'} 
              alt={game.title} 
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {game.title}
                </h1>
                {game.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">
                    {game.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                <span className="capitalize font-semibold text-indigo-600">{game.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {game.rating}
                </span>
                <span>•</span>
                <span>{(game.plays || 12400).toLocaleString()} Plays</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Likes / Dislikes */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60">
              <button
                onClick={() => handleVote('like')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  userVote === 'like' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Like Game"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{likes}</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-300 mx-1" />
              <button
                onClick={() => handleVote('dislike')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  userVote === 'dislike' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Dislike Game"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onToggleFavorite(game.id);
              }}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite 
                  ? 'bg-rose-50 text-rose-600 border-rose-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all relative"
              title="Share Game"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            <button
              onClick={() => setIsTheaterExpanded(!isTheaterExpanded)}
              className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all hidden sm:block"
              title={isTheaterExpanded ? 'Contract View' : 'Expand Theater Mode'}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
              title="Play in Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Theater Game Canvas Area */}
        <div 
          ref={theaterContainerRef}
          className="relative bg-slate-950 border-x border-b border-slate-200 overflow-hidden min-h-[520px] max-h-[750px] flex items-center justify-center rounded-b-2xl shadow-lg"
        >
          {/* Active Game Component */}
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            {renderGame()}
          </div>
        </div>

        {/* Policy-Safe Leaderboard Ad Placement Placeholder */}
        <div className="my-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            SPONSORED ADVERTISEMENT
          </span>
          <div className="text-xs text-slate-500 font-medium">
            Google AdSense Responsive Leaderboard (728x90 / 970x250 High CTR Slot)
          </div>
        </div>

        {/* Deep Content & SEO Article Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Rich Game Overview, How to Play, Controls & FAQs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview & Long Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                About {game.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-normal mb-4">
                {game.longDescription || game.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {game.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Controls Guide Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-indigo-600" />
                Game Controls & Keybindings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold">
                      <th className="pb-3 px-2">Platform</th>
                      <th className="pb-3 px-2">Input / Keybinding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                        <span>🖥️ Desktop PC</span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 font-mono text-xs">
                        {game.controls.desktop || 'Arrow Keys / WASD, Mouse Click, Spacebar'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                        <span>📱 Mobile / Touch</span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 font-mono text-xs">
                        {game.controls.mobile || 'On-Screen Touch D-Pad, Tap & Swipe Gestures'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* How to Play & Pro Tips */}
            {game.howToPlay && game.howToPlay.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  How to Play & Pro Strategies
                </h2>
                <ul className="space-y-2 mb-6">
                  {game.howToPlay.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {game.tips && game.tips.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600" />
                      Pro Gamer Tips
                    </h3>
                    <ul className="space-y-1.5 text-xs text-amber-900 font-medium">
                      {game.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* FAQ Section with Schema.org Compatibility */}
            {game.faqs && game.faqs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  Frequently Asked Questions (FAQs)
                </h2>
                <div className="space-y-3">
                  {game.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="rounded-xl border border-slate-200 overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-sm text-slate-900 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-4 text-xs sm:text-sm text-slate-600 bg-white leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Game Specifications, Developer Info & Related Games */}
          <div className="space-y-6">
            {/* Game Technical Specs (E-E-A-T Authority) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Game Specifications
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Developer</span>
                  <span className="font-bold text-slate-900">Arcadex Studio</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Release Date</span>
                  <span className="font-bold text-slate-900">{game.releaseDate || 'October 2026'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Technology</span>
                  <span className="font-bold text-slate-900">HTML5, WebGL, Canvas 2D</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Audio</span>
                  <span className="font-bold text-slate-900">Web Audio API Synth</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Platforms</span>
                  <span className="font-bold text-slate-900">Web Browser, Mobile, PC</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Classification</span>
                  <span className="font-bold text-emerald-600">100% Free · No Download</span>
                </div>
              </div>
            </div>

            {/* Skyscraper Ad Placeholder */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                ADVERTISEMENT
              </span>
              <div className="text-xs text-slate-500 font-medium max-w-[200px]">
                Google AdSense High-CTR Skyscraper (300x600 / 300x250)
              </div>
            </div>

            {/* Related Games Carousel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Recommended For You
              </h3>
              <div className="space-y-3">
                {relatedGames.map(relGame => (
                  <div
                    key={relGame.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectGame(relGame);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group border border-slate-100"
                  >
                    <img 
                      src={relGame.coverImage || '/assets/covers/snake-retro.jpg'} 
                      alt={relGame.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                        {relGame.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="capitalize font-semibold text-slate-600">{relGame.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {relGame.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
