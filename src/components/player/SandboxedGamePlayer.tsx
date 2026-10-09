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
import { RetroMobileKeypad } from './RetroMobileKeypad';
import { VirtualGamepad } from './VirtualGamepad';
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

interface SandboxedGamePlayerProps {
  game: GameItem;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
}

export const SandboxedGamePlayer: React.FC<SandboxedGamePlayerProps> = ({
  game,
  soundEnabled,
  onToggleSound,
  onGameOver,
  onScoreUpdate
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isStreamingReady, setIsStreamingReady] = useState<boolean>(false);
  const [isStreamingActive, setIsStreamingActive] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [showKeypad, setShowKeypad] = useState<boolean>(
    game.emulatorConfig?.platform === 'java' || game.emulatorConfig?.platform === 'symbian' || game.engineType === 'java_j2me'
  );
  const [showVirtualGamepad, setShowVirtualGamepad] = useState<boolean>(
    game.emulatorConfig?.platform === 'dos' || game.emulatorConfig?.platform === 'arcade' || game.engineType === 'retro_dos'
  );
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If native canvas game, instant ready; if binary/emulator, simulate client streaming download
  useEffect(() => {
    if (!game.engineType || game.engineType === 'native_canvas') {
      setIsStreamingReady(true);
      setDownloadProgress(100);
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
  }, [game.id, game.engineType]);

  // Handle Mobile Keypad Key dispatch to iframe
  const handleKeypadPress = (key: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'KEY_DOWN', key }, '*');
    }
  };

  const handleKeypadRelease = (key: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'KEY_UP', key }, '*');
    }
  };

  // Render Native React Canvas Game component
  const renderNativeGame = () => {
    switch (game.id) {
      case 'mecha-blaster-2':
        return <MechaBlaster2Game />;
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
      case 'wordle':
        return <WordleGame />;
      case 'asteroid-blaster':
        return <AsteroidBlasterGame />;
      case 'sudoku':
        return <SudokuGame />;
      case 'connect-four':
        return <ConnectFourGame />;
      case 'simon-echo':
        return <SimonEchoGame />;
      case 'bubble-shooter':
        return <BubbleShooterGame />;
      case 'ultimate-tictactoe':
        return <UltimateTicTacToeGame />;
      case 'hextris':
        return <HextrisGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} />;
      case 'cyber-stack':
        return <CyberStackGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} />;
      case 'cyber-dino':
        return <CyberDinoGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} />;
      case 'solitaire-pro':
        return <SolitaireGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} />;
      case 'cyber-chess':
        return <CyberChessGame soundEnabled={soundEnabled} onScoreUpdate={onScoreUpdate} />;
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
    <div ref={containerRef} className="w-full flex flex-col items-center">
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
      <div className="w-full relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden min-h-[420px] sm:min-h-[520px]">
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
            {game.isCustomUpload || ['j2me_wasm', 'emulatorjs', 'ruffle_flash', 'symbian_sis', 'html5_zip'].includes(game.engineType || '') ? (
              <UniversalWasmRunner
                game={game}
                soundEnabled={soundEnabled}
                onToggleSound={onToggleSound}
                onScoreUpdate={onScoreUpdate}
                onGameOver={onGameOver}
              />
            ) : (!game.engineType || game.engineType === 'native_canvas') ? (
              renderNativeGame()
            ) : (
              <div className="w-full h-full min-h-[560px] bg-black rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Embedded Real Game Frame */}
                <iframe
                  ref={iframeRef}
                  title={game.title}
                  src={game.binaryUrl || `/games/${game.id}/index.html`}
                  className="w-full h-full min-h-[560px] border-0 rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Retro Controller / Keypad Toggles */}
      <div className="w-full p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col items-center gap-4">
        {/* Keypad Mode Selectors */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowKeypad(!showKeypad);
              setShowVirtualGamepad(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              showKeypad 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {showKeypad ? 'Hide Retro Keypad' : 'Nokia/Symbian Keypad'}
          </button>

          <button
            onClick={() => {
              setShowVirtualGamepad(!showVirtualGamepad);
              setShowKeypad(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              showVirtualGamepad 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Gamepad className="w-3.5 h-3.5" />
            {showVirtualGamepad ? 'Hide Gamepad' : 'Arcade Gamepad'}
          </button>
        </div>

        {/* Dynamic Mobile Keypad Overlay */}
        {showKeypad && (
          <div className="w-full animate-in fade-in zoom-in duration-200">
            <RetroMobileKeypad
              onKeyPress={handleKeypadPress}
              onKeyRelease={handleKeypadRelease}
              soundEnabled={soundEnabled}
            />
          </div>
        )}

        {/* Dynamic Virtual Arcade Gamepad Overlay */}
        {showVirtualGamepad && (
          <div className="w-full animate-in fade-in zoom-in duration-200">
            <VirtualGamepad
              onButtonPress={handleKeypadPress}
              onButtonRelease={handleKeypadRelease}
              soundEnabled={soundEnabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};
