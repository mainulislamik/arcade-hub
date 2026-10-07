import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Pause, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface SnakeGameProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('snake'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Game state refs for smooth animation loop
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const dirRef = useRef<Direction>('UP');
  const nextDirRef = useRef<Direction>('UP');
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const goldenFoodRef = useRef<Point | null>(null);
  const scoreRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const speedRef = useRef(110); // ms per step

  const generateFood = useCallback((): Point => {
    while (true) {
      const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE));
      const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE));
      const onSnake = snakeRef.current.some(s => s.x === x && s.y === y);
      if (!onSnake) return { x, y };
    }
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dirRef.current = 'UP';
    nextDirRef.current = 'UP';
    foodRef.current = generateFood();
    goldenFoodRef.current = null;
    particlesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = 110;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    sounds.playMove();
  }, [generateFood]);

  const addParticles = (x: number, y: number, color: string, count = 12) => {
    const px = x * GRID_SIZE + GRID_SIZE / 2;
    const py = y * GRID_SIZE + GRID_SIZE / 2;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
      });
    }
  };

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    sounds.playGameOver();

    const { isNewHighScore, stats } = recordGamePlay('snake', scoreRef.current);
    if (isNewHighScore) {
      setHighScore(stats.highScore);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    if (onScoreUpdate) onScoreUpdate(scoreRef.current, isNewHighScore);
  }, [onScoreUpdate]);

  const update = useCallback(() => {
    const head = { ...snakeRef.current[0] };
    dirRef.current = nextDirRef.current;

    if (dirRef.current === 'UP') head.y -= 1;
    if (dirRef.current === 'DOWN') head.y += 1;
    if (dirRef.current === 'LEFT') head.x -= 1;
    if (dirRef.current === 'RIGHT') head.x += 1;

    // Wall collision
    const maxX = CANVAS_WIDTH / GRID_SIZE;
    const maxY = CANVAS_HEIGHT / GRID_SIZE;
    if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
      handleGameOver();
      return;
    }

    // Self collision
    if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }

    snakeRef.current.unshift(head);

    // Food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      sounds.playCoin();
      addParticles(foodRef.current.x, foodRef.current.y, '#22c55e');
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = generateFood();

      // Chance for golden food
      if (Math.random() < 0.25 && !goldenFoodRef.current) {
        goldenFoodRef.current = generateFood();
      }

      // Slightly increase speed
      speedRef.current = Math.max(60, speedRef.current - 1.5);
    } else if (goldenFoodRef.current && head.x === goldenFoodRef.current.x && head.y === goldenFoodRef.current.y) {
      sounds.playPowerUp();
      addParticles(goldenFoodRef.current.x, goldenFoodRef.current.y, '#fbbf24', 20);
      scoreRef.current += 35;
      setScore(scoreRef.current);
      goldenFoodRef.current = null;
    } else {
      snakeRef.current.pop();
    }
  }, [generateFood, handleGameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board with subtle grid background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Draw Regular Food (Neon Green Apple)
    const fx = foodRef.current.x * GRID_SIZE;
    const fy = foodRef.current.y * GRID_SIZE;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22c55e';
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(fx + GRID_SIZE / 2, fy + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Golden Food
    if (goldenFoodRef.current) {
      const gx = goldenFoodRef.current.x * GRID_SIZE;
      const gy = goldenFoodRef.current.y * GRID_SIZE;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gx + GRID_SIZE / 2, gy + GRID_SIZE / 2, GRID_SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Snake
    snakeRef.current.forEach((seg, idx) => {
      const sx = seg.x * GRID_SIZE;
      const sy = seg.y * GRID_SIZE;
      const isHead = idx === 0;

      ctx.shadowBlur = isHead ? 12 : 6;
      ctx.shadowColor = isHead ? '#38bdf8' : '#0ea5e9';
      ctx.fillStyle = isHead ? '#38bdf8' : `rgb(14, ${Math.max(120, 165 - idx * 3)}, ${Math.max(180, 233 - idx * 2)})`;

      ctx.beginPath();
      ctx.roundRect(sx + 1, sy + 1, GRID_SIZE - 2, GRID_SIZE - 2, isHead ? 5 : 3);
      ctx.fill();

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        const eyeOffset = 4;
        let e1 = { x: sx + 5, y: sy + 5 };
        let e2 = { x: sx + 12, y: sy + 5 };
        if (dirRef.current === 'DOWN') {
          e1 = { x: sx + 5, y: sy + 12 };
          e2 = { x: sx + 12, y: sy + 12 };
        } else if (dirRef.current === 'LEFT') {
          e1 = { x: sx + 5, y: sy + 5 };
          e2 = { x: sx + 5, y: sy + 12 };
        } else if (dirRef.current === 'RIGHT') {
          e1 = { x: sx + 12, y: sy + 5 };
          e2 = { x: sx + 12, y: sy + 12 };
        }
        ctx.beginPath();
        ctx.arc(e1.x, e1.y, 2, 0, Math.PI * 2);
        ctx.arc(e2.x, e2.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.shadowBlur = 0;
  }, []);

  // Animation & Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const loop = (timestamp: number) => {
      if (isPlaying && !isPaused && !isGameOver) {
        if (timestamp - lastTimeRef.current > speedRef.current) {
          update();
          lastTimeRef.current = timestamp;
        }
      }
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isPaused, isGameOver, update, draw]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (!isPlaying) {
          resetGame();
        } else {
          setIsPaused(p => !p);
        }
        return;
      }

      const cur = dirRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && cur !== 'DOWN') {
        nextDirRef.current = 'UP';
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && cur !== 'UP') {
        nextDirRef.current = 'DOWN';
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && cur !== 'RIGHT') {
        nextDirRef.current = 'LEFT';
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && cur !== 'LEFT') {
        nextDirRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, resetGame]);

  const handleDPad = (dir: Direction) => {
    const cur = dirRef.current;
    if (dir === 'UP' && cur !== 'DOWN') nextDirRef.current = 'UP';
    if (dir === 'DOWN' && cur !== 'UP') nextDirRef.current = 'DOWN';
    if (dir === 'LEFT' && cur !== 'RIGHT') nextDirRef.current = 'LEFT';
    if (dir === 'RIGHT' && cur !== 'LEFT') nextDirRef.current = 'RIGHT';
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Score</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Best</span>
          <span className="text-xl font-bold font-mono text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative w-[360px] h-[360px] sm:w-[400px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-cyan-950/40 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full block"
        />

        {/* Start / Game Over Overlay */}
        {(!isPlaying || isPaused || isGameOver) && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 transition-all">
            {isGameOver ? (
              <>
                <h3 className="text-3xl font-bold text-red-500 mb-2 font-display">GAME OVER</h3>
                <p className="text-slate-300 text-sm mb-4">Final Score: <span className="font-mono text-cyan-400 font-bold text-lg">{score}</span></p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
              </>
            ) : isPaused ? (
              <>
                <h3 className="text-2xl font-bold text-cyan-400 mb-4 font-display">GAME PAUSED</h3>
                <button
                  onClick={() => setIsPaused(false)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <Play className="w-4 h-4" /> Resume
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-100 mb-2 font-display">RETRO SNAKE 2.0</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">Use Arrow Keys or on-screen D-Pad to eat glowing apples & boost your score!</p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-cyan-500/30 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Game
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch / Mobile D-Pad */}
      <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
        <button
          onClick={() => handleDPad('UP')}
          className="w-14 h-12 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-lg flex items-center justify-center text-slate-200"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleDPad('LEFT')}
            className="w-14 h-12 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-lg flex items-center justify-center text-slate-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDPad('DOWN')}
            className="w-14 h-12 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-lg flex items-center justify-center text-slate-200"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDPad('RIGHT')}
            className="w-14 h-12 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-lg flex items-center justify-center text-slate-200"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
