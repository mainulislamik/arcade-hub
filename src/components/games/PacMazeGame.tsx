import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface PacMazeProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

const TILE_SIZE = 20;
const MAP_ROWS = 19;
const MAP_COLS = 19;

// 1 = Wall, 0 = Dot, 2 = Power Energizer, 3 = Empty/Path
const INITIAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,1,1,0,0,0,0,0,0,2,0,1],
  [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,0,1],
  [1,0,1,1,0,1,1,0,0,0,0,1,1,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,0,1,0,1,1,0,0,1],
  [1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,0,1,1,3,3,3,3,1,1,0,1,1,1,1,1],
  [1,1,1,1,0,1,3,3,3,3,3,3,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0,1],
  [1,1,1,1,0,1,3,3,3,3,3,3,1,0,1,1,1,1,1],
  [1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,0,1],
  [1,2,0,1,0,0,0,0,3,3,0,0,0,0,1,0,2,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1,1,1],
  [1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface Ghost {
  x: number;
  y: number;
  color: string;
  dirX: number;
  dirY: number;
}

export const PacMazeGame: React.FC<PacMazeProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('pac-maze'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [frightenedTimer, setFrightenedTimer] = useState(0);

  const mapRef = useRef<number[][]>(INITIAL_MAP.map(r => [...r]));
  const pacRef = useRef({
    x: 9,
    y: 14,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    mouthAngle: 0.2,
    mouthSpeed: 0.05,
  });

  const ghostsRef = useRef<Ghost[]>([
    { x: 8, y: 9, color: '#ef4444', dirX: 0, dirY: -1 },
    { x: 9, y: 9, color: '#f472b6', dirX: 1, dirY: 0 },
    { x: 10, y: 9, color: '#38bdf8', dirX: -1, dirY: 0 },
  ]);

  const scoreRef = useRef(0);
  const frightenedRef = useRef(0);
  const lastStepRef = useRef(0);

  const isWall = (x: number, y: number) => {
    if (x < 0 || x >= MAP_COLS || y < 0 || y >= MAP_ROWS) return true;
    return mapRef.current[y][x] === 1;
  };

  const handleGameOver = useCallback((won = false) => {
    setIsPlaying(false);
    setIsGameOver(true);

    if (won) {
      sounds.playVictory();
      confetti({ particleCount: 100, spread: 70 });
    } else {
      sounds.playGameOver();
    }

    const { isNewHighScore, stats } = recordGamePlay('pac-maze', scoreRef.current);
    if (isNewHighScore) {
      setHighScore(stats.highScore);
    }
    if (onScoreUpdate) onScoreUpdate(scoreRef.current, isNewHighScore);
  }, [onScoreUpdate]);

  const resetGame = () => {
    mapRef.current = INITIAL_MAP.map(r => [...r]);
    pacRef.current = {
      x: 9,
      y: 14,
      dirX: 0,
      dirY: 0,
      nextDirX: 0,
      nextDirY: 0,
      mouthAngle: 0.2,
      mouthSpeed: 0.05,
    };
    ghostsRef.current = [
      { x: 8, y: 9, color: '#ef4444', dirX: 0, dirY: -1 },
      { x: 9, y: 9, color: '#f472b6', dirX: 1, dirY: 0 },
      { x: 10, y: 9, color: '#38bdf8', dirX: -1, dirY: 0 },
    ];
    scoreRef.current = 0;
    frightenedRef.current = 0;
    setScore(0);
    setFrightenedTimer(0);
    setIsGameOver(false);
    setIsPlaying(true);
    sounds.playPowerUp();
  };

  // Main game tick
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      const stepInterval = 170;

      if (isPlaying && !isGameOver) {
        if (timestamp - lastStepRef.current > stepInterval) {
          lastStepRef.current = timestamp;

          if (frightenedRef.current > 0) {
            frightenedRef.current -= 1;
            setFrightenedTimer(frightenedRef.current);
          }

          const pac = pacRef.current;

          // Try switch to next direction
          if (!isWall(pac.x + pac.nextDirX, pac.y + pac.nextDirY)) {
            pac.dirX = pac.nextDirX;
            pac.dirY = pac.nextDirY;
          }

          // Move Pac
          if (!isWall(pac.x + pac.dirX, pac.y + pac.dirY)) {
            pac.x += pac.dirX;
            pac.y += pac.dirY;
          }

          // Eat Dot / Energizer
          const cell = mapRef.current[pac.y][pac.x];
          if (cell === 0) {
            // Normal Dot
            mapRef.current[pac.y][pac.x] = 3;
            scoreRef.current += 10;
            setScore(scoreRef.current);
            sounds.playBeep(450, 'sine', 0.03, 0.05);
          } else if (cell === 2) {
            // Power Energizer
            mapRef.current[pac.y][pac.x] = 3;
            scoreRef.current += 50;
            setScore(scoreRef.current);
            frightenedRef.current = 30; // ~5 seconds
            setFrightenedTimer(30);
            sounds.playPowerUp();
          }

          // Check if all dots eaten
          let dotsLeft = 0;
          for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
              if (mapRef.current[r][c] === 0 || mapRef.current[r][c] === 2) dotsLeft++;
            }
          }
          if (dotsLeft === 0) {
            handleGameOver(true);
          }

          // Move Ghosts
          const dirs = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
          ];

          ghostsRef.current.forEach(g => {
            const validDirs = dirs.filter(d => !isWall(g.x + d.x, g.y + d.y) && !(d.x === -g.dirX && d.y === -g.dirY));
            const chosenDir = validDirs.length > 0 ? validDirs[Math.floor(Math.random() * validDirs.length)] : dirs.find(d => !isWall(g.x + d.x, g.y + d.y));
            if (chosenDir) {
              g.dirX = chosenDir.x;
              g.dirY = chosenDir.y;
              g.x += chosenDir.x;
              g.y += chosenDir.y;
            }

            // Ghost - Pac Collision
            if (g.x === pac.x && g.y === pac.y) {
              if (frightenedRef.current > 0) {
                // Eat ghost
                sounds.playCoin();
                scoreRef.current += 200;
                setScore(scoreRef.current);
                g.x = 9;
                g.y = 9;
              } else {
                handleGameOver(false);
              }
            }
          });
        }
      }

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060a14';
          ctx.fillRect(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

          // Draw Map
          for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
              const cell = mapRef.current[r][c];
              const x = c * TILE_SIZE;
              const y = r * TILE_SIZE;

              if (cell === 1) {
                // Wall
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
              } else if (cell === 0) {
                // Dot
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
              } else if (cell === 2) {
                // Power Energizer
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#f59e0b';
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          }

          // Draw Ghosts
          ghostsRef.current.forEach(g => {
            const gx = g.x * TILE_SIZE + TILE_SIZE / 2;
            const gy = g.y * TILE_SIZE + TILE_SIZE / 2;
            const isFrightened = frightenedRef.current > 0;

            ctx.shadowBlur = 6;
            ctx.shadowColor = isFrightened ? '#3b82f6' : g.color;
            ctx.fillStyle = isFrightened ? '#3b82f6' : g.color;

            ctx.beginPath();
            ctx.arc(gx, gy - 2, TILE_SIZE / 2 - 2, Math.PI, 0, false);
            ctx.lineTo(gx + TILE_SIZE / 2 - 2, gy + TILE_SIZE / 2 - 2);
            ctx.lineTo(gx - TILE_SIZE / 2 + 2, gy + TILE_SIZE / 2 - 2);
            ctx.closePath();
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(gx - 3, gy - 3, 2.5, 0, Math.PI * 2);
            ctx.arc(gx + 3, gy - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(gx - 3 + g.dirX, gy - 3 + g.dirY, 1.2, 0, Math.PI * 2);
            ctx.arc(gx + 3 + g.dirX, gy - 3 + g.dirY, 1.2, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Pac
          const pac = pacRef.current;
          const px = pac.x * TILE_SIZE + TILE_SIZE / 2;
          const py = pac.y * TILE_SIZE + TILE_SIZE / 2;

          ctx.shadowBlur = 10;
          ctx.shadowColor = '#eab308';
          ctx.fillStyle = '#facc15';

          let baseAngle = 0;
          if (pac.dirX === 1) baseAngle = 0;
          if (pac.dirX === -1) baseAngle = Math.PI;
          if (pac.dirY === 1) baseAngle = Math.PI / 2;
          if (pac.dirY === -1) baseAngle = (3 * Math.PI) / 2;

          ctx.beginPath();
          ctx.arc(px, py, TILE_SIZE / 2 - 1, baseAngle + 0.25, baseAngle + Math.PI * 2 - 0.25);
          ctx.lineTo(px, py);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, handleGameOver]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      const pac = pacRef.current;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        pac.nextDirX = 0;
        pac.nextDirY = -1;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        pac.nextDirX = 0;
        pac.nextDirY = 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        pac.nextDirX = -1;
        pac.nextDirY = 0;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        pac.nextDirX = 1;
        pac.nextDirY = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setDir = (x: number, y: number) => {
    pacRef.current.nextDirX = x;
    pacRef.current.nextDirY = y;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-yellow-400">{score}</span>
          </div>
          {frightenedTimer > 0 && (
            <div className="px-2.5 py-1 bg-blue-600/30 border border-blue-500 rounded-lg animate-pulse">
              <span className="text-xs font-bold text-blue-300 font-mono">POWER: {Math.ceil(frightenedTimer / 6)}s</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
          <span className="text-xl font-bold font-mono text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={MAP_COLS * TILE_SIZE}
          height={MAP_ROWS * TILE_SIZE}
          className="w-full h-full block"
        />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 transition-all">
            {isGameOver ? (
              <>
                <h3 className="text-3xl font-extrabold text-rose-500 mb-2 font-display">CAUGHT!</h3>
                <p className="text-slate-300 text-sm mb-4">Final Score: <span className="font-mono text-yellow-400 font-bold text-lg">{score}</span></p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black text-yellow-400 mb-2 font-display">CYBER PAC RUNNER</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">Eat glowing dots & energy orbs to chase vulnerable glitch bots!</p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-yellow-400/30 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Maze
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch D-Pad */}
      <div className="mt-3 flex flex-col items-center gap-1 sm:hidden">
        <button onClick={() => setDir(0, -1)} className="w-12 h-10 bg-slate-800 active:bg-yellow-500 rounded-lg flex items-center justify-center text-white">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setDir(-1, 0)} className="w-12 h-10 bg-slate-800 active:bg-yellow-500 rounded-lg flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setDir(0, 1)} className="w-12 h-10 bg-slate-800 active:bg-yellow-500 rounded-lg flex items-center justify-center text-white">
            <ArrowDown className="w-5 h-5" />
          </button>
          <button onClick={() => setDir(1, 0)} className="w-12 h-10 bg-slate-800 active:bg-yellow-500 rounded-lg flex items-center justify-center text-white">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
