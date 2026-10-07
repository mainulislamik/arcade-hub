import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface BreakoutGameProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

const WIDTH = 400;
const HEIGHT = 480;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 16;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 15;

const ROW_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('breakout'));
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Paddle & Ball
  const paddleRef = useRef({
    x: WIDTH / 2 - 40,
    y: HEIGHT - 35,
    w: 80,
    h: 12,
    speed: 7,
  });

  const ballRef = useRef({
    x: WIDTH / 2,
    y: HEIGHT - 60,
    radius: 6,
    vx: 3.5,
    vy: -4,
  });

  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const brickW = (WIDTH - BRICK_OFFSET_LEFT * 2 - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (brickW + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
          w: brickW,
          h: BRICK_HEIGHT,
          color: ROW_COLORS[r],
          points: (BRICK_ROWS - r) * 10,
          alive: true,
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const addBrickExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
      });
    }
  };

  const handleGameOver = useCallback((won = false) => {
    setIsPlaying(false);
    setIsGameOver(true);
    setIsVictory(won);

    if (won) {
      sounds.playVictory();
      confetti({ particleCount: 120, spread: 80 });
    } else {
      sounds.playGameOver();
    }

    const { isNewHighScore, stats } = recordGamePlay('breakout', scoreRef.current);
    if (isNewHighScore) {
      setHighScore(stats.highScore);
    }
    if (onScoreUpdate) onScoreUpdate(scoreRef.current, isNewHighScore);
  }, [onScoreUpdate]);

  const resetBall = () => {
    paddleRef.current.x = WIDTH / 2 - 40;
    ballRef.current.x = WIDTH / 2;
    ballRef.current.y = HEIGHT - 60;
    ballRef.current.vx = (Math.random() > 0.5 ? 1 : -1) * 3.5;
    ballRef.current.vy = -4;
  };

  const startGame = () => {
    initBricks();
    particlesRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsVictory(false);
    resetBall();
    setIsPlaying(true);
    sounds.playMove();
  };

  useEffect(() => {
    initBricks();
  }, [initBricks]);

  // Main game loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (isPlaying && !isGameOver) {
        const paddle = paddleRef.current;
        const ball = ballRef.current;

        // Move paddle via keyboard
        if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
          paddle.x = Math.max(5, paddle.x - paddle.speed);
        }
        if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
          paddle.x = Math.min(WIDTH - paddle.w - 5, paddle.x + paddle.speed);
        }

        // Move Ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Ball Left/Right Wall Collision
        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx;
          sounds.playHit();
        } else if (ball.x + ball.radius >= WIDTH) {
          ball.x = WIDTH - ball.radius;
          ball.vx = -ball.vx;
          sounds.playHit();
        }

        // Ball Top Wall Collision
        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
          sounds.playHit();
        }

        // Ball Paddle Collision
        if (
          ball.y + ball.radius >= paddle.y &&
          ball.y - ball.radius <= paddle.y + paddle.h &&
          ball.x >= paddle.x &&
          ball.x <= paddle.x + paddle.w
        ) {
          // Dynamic angle based on where it hits the paddle
          const hitOffset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const currentSpeed = Math.hypot(ball.vx, ball.vy);
          ball.vx = hitOffset * 4.5;
          ball.vy = -Math.sqrt(Math.max(4, currentSpeed * currentSpeed - ball.vx * ball.vx));
          sounds.playBeep(520, 'square', 0.05, 0.1);
        }

        // Ball Bottom (Miss)
        if (ball.y - ball.radius > HEIGHT) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          sounds.playHit();

          if (livesRef.current <= 0) {
            handleGameOver(false);
          } else {
            resetBall();
          }
        }

        // Ball Brick Collision
        let aliveCount = 0;
        bricksRef.current.forEach(brick => {
          if (!brick.alive) return;
          aliveCount++;

          if (
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.w &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.h
          ) {
            brick.alive = false;
            ball.vy = -ball.vy;
            scoreRef.current += brick.points;
            setScore(scoreRef.current);
            sounds.playCoin();
            addBrickExplosion(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
          }
        });

        if (aliveCount === 0) {
          handleGameOver(true);
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.05;
          if (pt.life <= 0) particlesRef.current.splice(i, 1);
        }
      }

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Draw Bricks
          bricksRef.current.forEach(brick => {
            if (!brick.alive) return;
            ctx.shadowBlur = 6;
            ctx.shadowColor = brick.color;
            ctx.fillStyle = brick.color;
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 3);
            ctx.fill();
          });

          // Draw Particles
          particlesRef.current.forEach(pt => {
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2 * pt.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });

          // Draw Paddle
          const paddle = paddleRef.current;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
          ctx.fill();

          // Draw Ball
          const ball = ballRef.current;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
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
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch slide for paddle
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * WIDTH;
    paddleRef.current.x = Math.max(5, Math.min(WIDTH - paddleRef.current.w - 5, touchX - paddleRef.current.w / 2));
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
          </div>
          <div className="flex gap-1 ml-2">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
          <span className="text-xl font-bold font-mono text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        onTouchMove={handleTouchMove}
        className="relative w-[340px] h-[410px] sm:w-[380px] sm:h-[455px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black"
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full h-full block"
        />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 transition-all">
            {isGameOver ? (
              <>
                <h3 className={`text-3xl font-extrabold mb-2 font-display ${isVictory ? 'text-yellow-400' : 'text-rose-500'}`}>
                  {isVictory ? 'STAGE CLEARED!' : 'GAME OVER'}
                </h3>
                <p className="text-slate-300 text-sm mb-4">Final Score: <span className="font-mono text-cyan-400 font-bold text-lg">{score}</span></p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 mb-2 font-display">NEON BREAKOUT</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">Deflect the ball to break through all neon layers without letting it drop!</p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-base rounded-xl shadow-lg shadow-pink-500/30 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Game
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-3 text-center">
        Use <b>Left / Right Arrows</b> or <b>Touch & Slide</b> paddle on mobile.
      </p>
    </div>
  );
};
