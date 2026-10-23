import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../types/game';
import { 
  Play, 
  Download, 
  Cpu, 
  HardDrive, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Smartphone,
  Gamepad,
  Monitor
} from 'lucide-react';
import { AdaptiveGameControls } from './AdaptiveGameControls';
import { sounds } from '../../utils/soundEngine';

// Import All Native Canvas Game Components
import { SnakeGame } from '../games/SnakeGame';
import { Game2048 } from '../games/Game2048';
import { GalaxyDefender } from '../games/GalaxyDefender';
import { FlappyBirdGame } from '../games/FlappyBirdGame';
import { BreakoutGame } from '../games/BreakoutGame';
import { TetrisGame } from '../games/TetrisGame';
import { PacMazeGame } from '../games/PacMazeGame';
import { MemoryFlipGame } from '../games/MemoryFlipGame';
import { MinesweeperGame } from '../games/MinesweeperGame';
import { CyberPongGame } from '../games/CyberPongGame';
import { WordleGame } from '../games/WordleGame';
import { AsteroidBlasterGame } from '../games/AsteroidBlasterGame';
import { SudokuGame } from '../games/SudokuGame';
import { ConnectFourGame } from '../games/ConnectFourGame';
import { SimonEchoGame } from '../games/SimonEchoGame';
import { BubbleShooterGame } from '../games/BubbleShooterGame';
import { UltimateTicTacToeGame } from '../games/UltimateTicTacToeGame';
import { MechaBlaster2Game } from '../games/MechaBlaster2Game';
import { HextrisGame } from '../games/HextrisGame';
import { CyberStackGame } from '../games/CyberStackGame';
import { CyberDinoGame } from '../games/CyberDinoGame';
import { SolitaireGame } from '../games/SolitaireGame';
import { CyberChessGame } from '../games/CyberChessGame';
import { StickmanFighterGame } from '../games/StickmanFighterGame';
import { StickmanArcherGame } from '../games/StickmanArcherGame';
import { StickmanRunnerGame } from '../games/StickmanRunnerGame';
import { StickmanSniperGame } from '../games/StickmanSniperGame';
import { StickmanWarriorsGame } from '../games/StickmanWarriorsGame';
import { SubwaySurferGame } from '../games/SubwaySurferGame';
import { TempleDashGame } from '../games/TempleDashGame';
import { HillClimbGame } from '../games/HillClimbGame';
import { FruitSlashGame } from '../games/FruitSlashGame';
import { Slope3DGame } from '../games/Slope3DGame';
import { Drift3DGame } from '../games/Drift3DGame';
import { Subway3DGame } from '../games/Subway3DGame';
import { CyberKnife3DGame } from '../games/CyberKnife3DGame';
import { VoxelShooter3DGame } from '../games/VoxelShooter3DGame';
import { UniversalProceduralCore } from './UniversalProceduralCore';
import { UniversalWasmRunner } from './UniversalWasmRunner';
import { UniversalMouseOverlay } from './UniversalMouseOverlay';

// Complete registry of all 37 rich native React/Canvas games
export const NATIVE_GAME_IDS = new Set([
  'mecha-blaster-2',
  'snake',
  'game-2048',
  'galaxy-defender',
  'flappy-bird',
  'breakout',
  'tetris',
  'pac-maze',
  'memory-flip',
  'minesweeper',
  'cyber-pong',
  'wordle',
  'asteroid-blaster',
  'sudoku',
  'connect-four',
  'simon-echo',
  'bubble-shooter',
  'ultimate-tictactoe',
  'hextris',
  'cyber-stack',
  'cyber-dino',
  'solitaire-pro',
  'cyber-chess',
  'stickman-fighter',
  'stickman-archer',
  'stickman-runner',
  'stickman-sniper',
  'stickman-warriors',
  'subway-surfer',
  'temple-dash',
  'hill-climb',
  'fruit-slash',
  'slope-3d',
  'drift-3d',
  'subway-3d',
  'knife-3d',
  'voxel-3d'
]);

// Aliases mapping common search/catalog names to native implementations
export const NATIVE_ID_ALIASES: Record<string, string> = {
  'space-invaders': 'galaxy-defender',
  'pacman': 'pac-maze',
  'pong': 'cyber-pong',
  'asteroids': 'asteroid-blaster',
  'dino': 'cyber-dino',
  '2048': 'game-2048',
  'solitaire': 'solitaire-pro',
  'chess': 'cyber-chess',
  'stack': 'cyber-stack',
  'knife': 'knife-3d',
  'cyber-knife-3d': 'knife-3d',
  'knife-hit': 'knife-3d',
  // Popular Android Games ID Mappings
  'subway-surfers': 'subway-surfer',
  'temple-run': 'temple-dash',
  'fruit-ninja': 'fruit-slash',
  'hill-climb-racing': 'hill-climb',
  'geometry-dash': 'slope-3d',
  'stickman-hook': 'stickman-runner',
  'bowmasters': 'stickman-archer',
  'sniper-3d': 'stickman-sniper',
  'shadow-fight': 'stickman-fighter',
  'vector': 'stickman-runner',
  'pixel-gun-3d': 'voxel-3d',
  'drift-max': 'drift-3d',
  'crossy-road': 'subway-3d',
  'bad-piggies': 'hill-climb',
  'cut-the-rope': 'fruit-slash',
  'doodle-jump': 'cyber-stack',
  'jetpack-joyride': 'stickman-runner',
  'angry-birds': 'stickman-archer',
  'plants-vs-zombies': 'galaxy-defender'
};

/**
 * Resolves the primary native ID (handling aliases and Android prefixes)
 */
export const getResolvedNativeId = (game: GameItem): string => {
  if (!game) return '';

  if (game.romUrl && game.romUrl.startsWith('native:')) {
    const rawNative = game.romUrl.replace('native:', '').trim().toLowerCase();
    if (NATIVE_GAME_IDS.has(rawNative)) return rawNative;
    if (NATIVE_ID_ALIASES[rawNative]) return NATIVE_ID_ALIASES[rawNative];
  }

  const id = game.id?.toLowerCase() || '';
  const normalizedId = id.replace(/_/g, '-');

  // Direct alias match
  if (NATIVE_ID_ALIASES[id]) return NATIVE_ID_ALIASES[id];
  if (NATIVE_ID_ALIASES[normalizedId]) return NATIVE_ID_ALIASES[normalizedId];

  // Prefix matching for Android mobile games
  if (normalizedId.startsWith('android-subway-surfers')) return 'subway-surfer';
  if (normalizedId.startsWith('android-temple-run')) return 'temple-dash';
  if (normalizedId.startsWith('android-fruit-ninja')) return 'fruit-slash';
  if (normalizedId.startsWith('android-hill-climb')) return 'hill-climb';
  if (normalizedId.startsWith('android-flappy-bird')) return 'flappy-bird';
  if (normalizedId.startsWith('android-2048')) return 'game-2048';
  if (normalizedId.startsWith('android-shadow-fight')) return 'stickman-fighter';
  if (normalizedId.startsWith('android-geometry-dash')) return 'slope-3d';
  if (normalizedId.startsWith('android-cut-the-rope')) return 'fruit-slash';
  if (normalizedId.startsWith('android-doodle-jump')) return 'cyber-stack';
  if (normalizedId.startsWith('android-jetpack-joyride')) return 'stickman-runner';
  if (normalizedId.startsWith('android-angry-birds')) return 'stickman-archer';
  if (normalizedId.startsWith('android-crossy-road')) return 'subway-3d';
  if (normalizedId.startsWith('android-plants-vs-zombies')) return 'galaxy-defender';
  if (normalizedId.startsWith('android-bad-piggies')) return 'hill-climb';
  if (normalizedId.startsWith('android-knife-hit')) return 'knife-3d';
  if (normalizedId.startsWith('android-stickman-hook')) return 'stickman-runner';
  if (normalizedId.startsWith('android-vector')) return 'stickman-runner';
  if (normalizedId.startsWith('android-bowmasters')) return 'stickman-archer';
  if (normalizedId.startsWith('android-sniper-3d')) return 'stickman-sniper';
  if (normalizedId.startsWith('android-pixel-gun')) return 'voxel-3d';
  if (normalizedId.startsWith('android-drift-max')) return 'drift-3d';
  if (normalizedId.startsWith('android-slope')) return 'slope-3d';
  if (normalizedId.startsWith('android-bubble-shooter')) return 'bubble-shooter';

  return NATIVE_ID_ALIASES[id] || NATIVE_ID_ALIASES[normalizedId] || normalizedId;
};

/**
 * Checks whether a game should render directly using our high-performance
 * native React canvas engines instead of running through UniversalWasmRunner.
 */
export const isNativeGame = (game: GameItem): boolean => {
  if (!game) return false;
  // User custom uploaded ROMs with binary keys always route to WASM runner
  if (game.isCustomUpload && game.customRomKey) return false;

  const id = game.id?.toLowerCase() || '';
  const normalizedId = id.replace(/_/g, '-');

  if (game.romUrl?.startsWith('native:')) return true;

  const resolved = getResolvedNativeId(game);
  if (NATIVE_GAME_IDS.has(resolved)) return true;

  // Direct match or alias match
  if (NATIVE_GAME_IDS.has(id) || NATIVE_GAME_IDS.has(normalizedId)) return true;
  if (NATIVE_ID_ALIASES[id] || NATIVE_ID_ALIASES[normalizedId]) return true;

  // Engine type explicitly specifying native canvas
  if (['native_canvas', 'canvas_native', 'canvas', 'native', 'react_canvas'].includes(game.engineType || '')) {
    return true;
  }

  // Fallback web-runner games with no heavy emulator engine
  if (game.romUrl === '/games/web-runner.html' && (!game.engineType || game.engineType === 'iframe_web' || game.engineType === 'native_canvas' || game.engineType === 'canvas_native')) {
    return true;
  }

  return false;
};

interface SandboxedGamePlayerProps {
  game: GameItem;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  aspectRatio?: string;
}

export const SandboxedGamePlayer: React.FC<SandboxedGamePlayerProps> = ({
  game,
  soundEnabled,
  onToggleSound,
  onGameOver,
  onScoreUpdate,
  aspectRatio = 'auto'
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isStreamingReady, setIsStreamingReady] = useState<boolean>(false);
  const [isStreamingActive, setIsStreamingActive] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isNative = isNativeGame(game);

  // If native canvas game, instant ready; if binary/emulator, simulate client streaming download
  useEffect(() => {
    if (isNative || !game.engineType || game.engineType === 'native_canvas') {
      setIsStreamingReady(true);
      setDownloadProgress(100);
      setIsStreamingActive(false);
      return;
    }

    // Reset download progress for binary game files
    setIsStreamingReady(false);
    setIsStreamingActive(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsStreamingReady(true);
          setIsStreamingActive(false);
          sounds.playPowerup();
          return 100;
        }
        const step = Math.floor(Math.random() * 25) + 15;
        return Math.min(prev + step, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [game.id, game.engineType, isNative]);

  // Handle Mobile Keypad Key dispatch to window, document and iframe
  const handleKeypadPress = (key: string) => {
    let code = key;
    let eventKey = key;
    if (key === 'UP') { code = 'ArrowUp'; eventKey = 'ArrowUp'; }
    else if (key === 'DOWN') { code = 'ArrowDown'; eventKey = 'ArrowDown'; }
    else if (key === 'LEFT') { code = 'ArrowLeft'; eventKey = 'ArrowLeft'; }
    else if (key === 'RIGHT') { code = 'ArrowRight'; eventKey = 'ArrowRight'; }
    else if (key === 'A') { code = 'KeyX'; eventKey = 'x'; }
    else if (key === 'B') { code = 'KeyZ'; eventKey = 'z'; }
    else if (key === 'X') { code = 'KeyS'; eventKey = 's'; }
    else if (key === 'Y') { code = 'KeyA'; eventKey = 'a'; }
    else if (key === 'START') { code = 'Enter'; eventKey = 'Enter'; }
    else if (key === 'SELECT') { code = 'KeyV'; eventKey = 'v'; }

    try {
      const evt = new KeyboardEvent('keydown', { key: eventKey, code, bubbles: true, cancelable: true });
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    } catch (_) {}

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: 'KEY_DOWN', key: eventKey, code }, '*');
      } catch (_) {}
    }
  };

  const handleKeypadRelease = (key: string) => {
    let code = key;
    let eventKey = key;
    if (key === 'UP') { code = 'ArrowUp'; eventKey = 'ArrowUp'; }
    else if (key === 'DOWN') { code = 'ArrowDown'; eventKey = 'ArrowDown'; }
    else if (key === 'LEFT') { code = 'ArrowLeft'; eventKey = 'ArrowLeft'; }
    else if (key === 'RIGHT') { code = 'ArrowRight'; eventKey = 'ArrowRight'; }
    else if (key === 'A') { code = 'KeyX'; eventKey = 'x'; }
    else if (key === 'B') { code = 'KeyZ'; eventKey = 'z'; }
    else if (key === 'X') { code = 'KeyS'; eventKey = 's'; }
    else if (key === 'Y') { code = 'KeyA'; eventKey = 'a'; }
    else if (key === 'START') { code = 'Enter'; eventKey = 'Enter'; }
    else if (key === 'SELECT') { code = 'KeyV'; eventKey = 'v'; }

    try {
      const evt = new KeyboardEvent('keyup', { key: eventKey, code, bubbles: true, cancelable: true });
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    } catch (_) {}

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: 'KEY_UP', key: eventKey, code }, '*');
      } catch (_) {}
    }
  };

  // Universal Send Key dispatcher for AdaptiveGameControls
  const sendKey = (key: string, type: 'keydown' | 'keyup') => {
    let code = key;
    let eventKey = key;
    if (key === 'ArrowUp') { code = 'ArrowUp'; eventKey = 'ArrowUp'; }
    else if (key === 'ArrowDown') { code = 'ArrowDown'; eventKey = 'ArrowDown'; }
    else if (key === 'ArrowLeft') { code = 'ArrowLeft'; eventKey = 'ArrowLeft'; }
    else if (key === 'ArrowRight') { code = 'ArrowRight'; eventKey = 'ArrowRight'; }
    else if (key === 'KeyX' || key === 'x' || key === 'X') { code = 'KeyX'; eventKey = 'x'; }
    else if (key === 'KeyZ' || key === 'z' || key === 'Z') { code = 'KeyZ'; eventKey = 'z'; }
    else if (key === 'KeyS' || key === 's' || key === 'S') { code = 'KeyS'; eventKey = 's'; }
    else if (key === 'KeyA' || key === 'a' || key === 'A') { code = 'KeyA'; eventKey = 'a'; }
    else if (key === 'KeyW' || key === 'w' || key === 'W') { code = 'KeyW'; eventKey = 'w'; }
    else if (key === 'KeyD' || key === 'd' || key === 'D') { code = 'KeyD'; eventKey = 'd'; }
    else if (key === 'Space' || key === ' ' || key === 'ACTION' || key === 'FIRE') { code = 'Space'; eventKey = ' '; }
    else if (key === 'Enter') { code = 'Enter'; eventKey = 'Enter'; }
    else if (key === 'KeyV' || key === 'v') { code = 'KeyV'; eventKey = 'v'; }
    else if (key === 'Shift' || key === 'ShiftLeft' || key === 'ShiftRight') { code = 'ShiftLeft'; eventKey = 'Shift'; }
    else if (key === 'Escape') { code = 'Escape'; eventKey = 'Escape'; }

    const keyCodes: Record<string, number> = {
      ArrowUp: 38,
      ArrowDown: 40,
      ArrowLeft: 37,
      ArrowRight: 39,
      ' ': 32,
      Space: 32,
      Enter: 13,
      Escape: 27,
      Shift: 16,
      x: 88,
      z: 90,
      s: 83,
      a: 65,
      w: 87,
      d: 68,
      v: 86
    };
    const numericCode = keyCodes[eventKey] || keyCodes[code] || 0;

    try {
      const evt = new KeyboardEvent(type, {
        key: eventKey,
        code,
        keyCode: numericCode,
        which: numericCode,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    } catch (_) {}

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: type === 'keydown' ? 'KEY_DOWN' : 'KEY_UP', key: eventKey, code }, '*');
        iframeRef.current.contentWindow.postMessage({ type: 'EMULATOR_KEY', key, eventType: type }, '*');
        iframeRef.current.contentWindow.postMessage({ type: 'NOKIA_KEY', key, eventType: type }, '*');
      } catch (_) {}
    }
  };

  // Render Native React Canvas Game component
  const renderNativeGame = () => {
    const targetId = getResolvedNativeId(game);
    switch (targetId) {
      case 'mecha-blaster-2':
        return <MechaBlaster2Game onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'snake':
        return <SnakeGame onScoreUpdate={onScoreUpdate} />;
      case 'game-2048':
        return <Game2048 onScoreUpdate={onScoreUpdate} />;
      case 'galaxy-defender':
        return <GalaxyDefender onScoreUpdate={onScoreUpdate} />;
      case 'flappy-bird':
        return <FlappyBirdGame onScoreUpdate={onScoreUpdate} />;
      case 'breakout':
        return <BreakoutGame onScoreUpdate={onScoreUpdate} />;
      case 'tetris':
        return <TetrisGame onScoreUpdate={onScoreUpdate} />;
      case 'pac-maze':
        return <PacMazeGame onScoreUpdate={onScoreUpdate} />;
      case 'memory-flip':
        return <MemoryFlipGame onScoreUpdate={onScoreUpdate} />;
      case 'minesweeper':
        return <MinesweeperGame onScoreUpdate={onScoreUpdate} />;
      case 'cyber-pong':
        return <CyberPongGame onScoreUpdate={onScoreUpdate} />;
      case 'wordle':
        return <WordleGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'asteroid-blaster':
        return <AsteroidBlasterGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'sudoku':
        return <SudokuGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'connect-four':
        return <ConnectFourGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'simon-echo':
        return <SimonEchoGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'bubble-shooter':
        return <BubbleShooterGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'ultimate-tictactoe':
        return <UltimateTicTacToeGame onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'hextris':
        return <HextrisGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'cyber-stack':
        return <CyberStackGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'cyber-dino':
        return <CyberDinoGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'solitaire-pro':
        return <SolitaireGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'cyber-chess':
        return <CyberChessGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'stickman-fighter':
        return <StickmanFighterGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'stickman-archer':
        return <StickmanArcherGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'stickman-runner':
        return <StickmanRunnerGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'stickman-sniper':
        return <StickmanSniperGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'stickman-warriors':
        return <StickmanWarriorsGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'subway-surfer':
        return <SubwaySurferGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'temple-dash':
        return <TempleDashGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'hill-climb':
        return <HillClimbGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'fruit-slash':
        return <FruitSlashGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'slope-3d':
        return <Slope3DGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'drift-3d':
        return <Drift3DGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'subway-3d':
        return <Subway3DGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'knife-3d':
        return <CyberKnife3DGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      case 'voxel-3d':
        return <VoxelShooter3DGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} onGameOver={onGameOver} />;
      default:
        return (
          <UniversalProceduralCore
            game={game}
            soundEnabled={soundEnabled}
            onScoreUpdate={onScoreUpdate}
            onGameOver={onGameOver}
          />
        );
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex-1 flex flex-col items-center">
      {/* 0% Server Load Execution Meter HUD */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Zap className="w-3.5 h-3.5 fill-emerald-400 animate-pulse" />
            0% SERVER LOAD
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:flex items-center gap-1 text-sky-400">
            <Cpu className="w-3.5 h-3.5" />
            100% CLIENT GPU/WASM
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center gap-1 text-amber-400">
            <HardDrive className="w-3.5 h-3.5" />
            {game.engineType === 'java_j2me' 
              ? 'J2ME WASM CORE' 
              : game.engineType === 'retro_dos' 
              ? 'DOSBOX-X WASM' 
              : 'CANVAS 2D 60FPS'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">{fps} FPS</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {game.licenseType || 'DMCA Clean'}
          </span>
        </div>
      </div>

      {/* Main Game Screen Canvas / Iframe */}
      <div className="w-full flex-1 h-full relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden min-h-[580px] sm:min-h-[640px]">
        {/* Streaming / Binary Loading Progress Overlay */}
        {isStreamingActive && !isStreamingReady && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-indigo-600/20 border-2 border-indigo-500 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
              <Download className="w-10 h-10 text-indigo-400 animate-bounce" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Streaming {game.title} Binary to Browser
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Downloading client-side WebAssembly emulator core. All computations execute directly in your browser without loading our servers.
            </p>

            {/* High-tech Progress Bar */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>BUFFERING STREAM</span>
                <span className="text-amber-400 font-bold">{downloadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-150"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Game Runtime */}
        {isStreamingReady && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {isNative ? (
              <UniversalMouseOverlay onSendKey={sendKey} className="w-full h-full flex items-center justify-center">
                {renderNativeGame()}
              </UniversalMouseOverlay>
            ) : game.isCustomUpload || Boolean(game.romUrl) || ['j2me_wasm', 'emulatorjs', 'ruffle_flash', 'symbian_sis', 'html5_zip', 'dosbox_wasm', 'scummvm_wasm', 'wasm_emscripten', 'ps2_wasm'].includes(game.engineType || '') ? (
              <UniversalWasmRunner
                game={game}
                soundEnabled={soundEnabled}
                onToggleSound={onToggleSound}
                onScoreUpdate={onScoreUpdate}
                onGameOver={onGameOver}
                aspectRatio={aspectRatio}
              />
            ) : (!game.engineType || game.engineType === 'native_canvas') ? (
              <UniversalMouseOverlay onSendKey={sendKey} className="w-full h-full flex items-center justify-center">
                {renderNativeGame()}
              </UniversalMouseOverlay>
            ) : (
              <UniversalMouseOverlay onSendKey={sendKey} className="w-full h-full min-h-[560px]">
                <div className="w-full h-full min-h-[560px] bg-black rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden shadow-2xl">
                  {/* Embedded Real Game Frame */}
                  <iframe
                    ref={iframeRef}
                    title={game.title}
                    src={game.binaryUrl || (game.romUrl && game.romUrl.startsWith('http') ? game.romUrl : `/games/web-runner.html?game=${encodeURIComponent(game.title)}`)}
                    className="w-full h-full min-h-[560px] border-0 rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
                  />
                </div>
              </UniversalMouseOverlay>
            )}
          </div>
        )}
      </div>

      {/* For Non-WASM Runner Games (Canvas / Native React / HTML5 Games), Render AdaptiveGameControls */}
      {(isNative || !(game.isCustomUpload || Boolean(game.romUrl) || ['j2me_wasm', 'emulatorjs', 'ruffle_flash', 'symbian_sis', 'html5_zip', 'dosbox_wasm', 'scummvm_wasm', 'wasm_emscripten', 'ps2_wasm'].includes(game.engineType || ''))) && (
        <AdaptiveGameControls
          game={game}
          format={isNative ? 'canvas' : (game.romFormat || 'html')}
          onSendKey={sendKey}
          onRefocus={() => {
            iframeRef.current?.focus();
            iframeRef.current?.contentWindow?.focus();
          }}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
};
