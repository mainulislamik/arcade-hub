import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';

interface BubbleShooterProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

const BUBBLE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
const ROWS = 8;
const COLS = 8;
const RADIUS = 18;

interface Bubble {
  color: string;
  x: number;
  y: number;
}

export const BubbleShooterGame: React.FC<BubbleShooterProps> = ({ onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');
  const [currentBubbleColor, setCurrentBubbleColor] = useState(BUBBLE_COLORS[0]);
  const [nextBubbleColor, setNextBubbleColor] = useState(BUBBLE_COLORS[1]);

  const gridRef = useRef<(Bubble | null)[][]>([]);
  const shooterRef = useRef({
    angle: Math.PI / 2,
    bullet: null as { x: number; y: number; vx: number; vy: number; color: string } | null,
  });
  const scoreRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  const getRandomColor = () => BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

  const initGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    const newGrid: (Bubble | null)[][] = [];
    for (let r = 0; r < ROWS; r++) {
      newGrid[r] = [];
      for (let c = 0; c < COLS; c++) {
        if (r < 4) {
          const x = c * RADIUS * 2 + RADIUS + (r % 2 === 1 ? RADIUS : 0);
          const y = r * RADIUS * 1.8 + RADIUS;
          newGrid[r][c] = { color: getRandomColor(), x, y };
        } else {
          newGrid[r][c] = null;
        }
      }
    }
    gridRef.current = newGrid;
    setCurrentBubbleColor(getRandomColor());
    setNextBubbleColor(getRandomColor());
    shooterRef.current.bullet = null;
    shooterRef.current.angle = Math.PI / 2;
    setGameState('playing');
    sounds.playLaser();
  }, []);

  // Aiming logic
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const sx = canvas.width / 2;
    const sy = canvas.height - 30;
    const dx = mx - sx;
    const dy = sy - my;
    if (dy > 10) {
      shooterRef.current.angle = Math.atan2(dy, dx);
    }
  };

  const handleShoot = () => {
    if (gameState !== 'playing' || shooterRef.current.bullet) return;
    const speed = 12;
    const angle = shooterRef.current.angle;
    shooterRef.current.bullet = {
      x: (canvasRef.current?.width || 320) / 2,
      y: (canvasRef.current?.height || 480) - 30,
      vx: Math.cos(angle) * speed,
      vy: -Math.sin(angle) * speed,
      color: currentBubbleColor,
    };
    setCurrentBubbleColor(nextBubbleColor);
    setNextBubbleColor(getRandomColor());
    sounds.playLaser();
  };

  // Find matches recursively
  const findMatches = (startR: number, startC: number, matchColor: string) => {
    const matches: { r: number; c: number }[] = [];
    const visited: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const queue: { r: number; c: number }[] = [{ r: startR, c: startC }];
    visited[startR][startC] = true;

    while (queue.length > 0) {
      const { r, c } = queue.shift()!;
      matches.push({ r, c });

      const neighbors = [
        { r: r - 1, c }, { r: r + 1, c },
        { r, c: c - 1 }, { r, c: c + 1 },
        { r: r - 1, c: r % 2 === 1 ? c + 1 : c - 1 },
        { r: r + 1, c: r % 2 === 1 ? c + 1 : c - 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
          const cell = gridRef.current[n.r][n.c];
          if (cell && cell.color === matchColor && !visited[n.r][n.c]) {
            visited[n.r][n.c] = true;
            queue.push(n);
          }
        }
      }
    }
    return matches;
  };

  // Main render loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Bubbles
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const b = gridRef.current[r]?.[c];
          if (b) {
            ctx.fillStyle = b.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, RADIUS - 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Update and Draw Bullet
      const bullet = shooterRef.current.bullet;
      if (bullet) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Bounce walls
        if (bullet.x - RADIUS <= 0 || bullet.x + RADIUS >= canvas.width) {
          bullet.vx = -bullet.vx;
          sounds.playHit();
        }

        // Snap to top or hit bubble
        let collided = false;
        let snapR = 0;
        let snapC = 0;

        if (bullet.y - RADIUS <= 0) {
          collided = true;
          snapR = 0;
          snapC = Math.max(0, Math.min(COLS - 1, Math.floor(bullet.x / (RADIUS * 2))));
        } else {
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const target = gridRef.current[r]?.[c];
              if (target) {
                const dist = Math.hypot(bullet.x - target.x, bullet.y - target.y);
                if (dist < RADIUS * 1.8) {
                  collided = true;
                  // Find nearest empty cell
                  snapR = Math.min(ROWS - 1, r + 1);
                  snapC = Math.max(0, Math.min(COLS - 1, Math.floor(bullet.x / (RADIUS * 2))));
                  break;
                }
              }
            }
            if (collided) break;
          }
        }

        if (collided) {
          const x = snapC * RADIUS * 2 + RADIUS + (snapR % 2 === 1 ? RADIUS : 0);
          const y = snapR * RADIUS * 1.8 + RADIUS;
          gridRef.current[snapR][snapC] = { color: bullet.color, x, y };
          shooterRef.current.bullet = null;

          const matches = findMatches(snapR, snapC, bullet.color);
          if (matches.length >= 3) {
            matches.forEach((m) => {
              gridRef.current[m.r][m.c] = null;
            });
            sounds.playExplosion();
            const points = matches.length * 50;
            scoreRef.current += points;
            setScore(scoreRef.current);
            if (onScoreUpdate) onScoreUpdate(scoreRef.current);

            // Check Win Condition
            const hasBubbles = gridRef.current.some((row) => row.some((cell) => cell !== null));
            if (!hasBubbles) {
              setGameState('won');
              sounds.playVictory();
              confetti({ particleCount: 100, spread: 80 });
              recordGamePlay('bubble-shooter', scoreRef.current + 1000);
            }
          } else {
            sounds.playHit();
          }

          // Check GameOver
          if (snapR >= ROWS - 1) {
            setGameState('gameover');
            sounds.playGameOver();
            recordGamePlay('bubble-shooter', scoreRef.current);
            if (onGameOver) onGameOver(scoreRef.current);
          }
        }

        // Draw bullet
        if (bullet) {
          ctx.fillStyle = bullet.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = bullet.color;
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, RADIUS - 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Shooter cannon & aimer
      const sx = canvas.width / 2;
      const sy = canvas.height - 30;
      const angle = shooterRef.current.angle;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle) * 35, sy - Math.sin(angle) * 35);
      ctx.stroke();

      // Current Shooter bubble
      ctx.fillStyle = currentBubbleColor;
      ctx.beginPath();
      ctx.arc(sx, sy, RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Next bubble preview
      ctx.fillStyle = nextBubbleColor;
      ctx.beginPath();
      ctx.arc(sx - 50, sy + 5, RADIUS * 0.7, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [currentBubbleColor, gameState, nextBubbleColor, onGameOver, onScoreUpdate]);

  return (
    <div className="flex flex-col items-center justify-center max-w-md w-full bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl backdrop-blur select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🫧</span>
          <div>
            <h3 className="text-sm font-bold text-white">Bubble Shooter</h3>
            <p className="text-[10px] text-slate-400">Match 3 or more of same color</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Score</span>
            <span className="text-base font-bold font-mono text-cyan-400">{score}</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              initGame();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner">
        <canvas
          ref={canvasRef}
          width={320}
          height={460}
          onMouseMove={handleMouseMove}
          onClick={handleShoot}
          className="w-[300px] h-[430px] sm:w-[320px] sm:h-[460px] block cursor-crosshair"
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {gameState === 'won' ? '🎉 ALL CLEARED!' : gameState === 'gameover' ? '💥 CEILING COLLAPSE' : 'NEON BUBBLE SHOOTER'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Aim your bubble cannon, bounce off the walls, match clusters of 3, and clear the screen!
            </p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-5 h-5 fill-current" />
              {gameState === 'idle' ? 'Start Shooting' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
