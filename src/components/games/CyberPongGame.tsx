import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Users, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface CyberPongProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

const WIDTH = 450;
const HEIGHT = 320;
const PADDLE_HEIGHT = 65;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 6;
const WINNING_SCORE = 7;

export const CyberPongGame: React.FC<CyberPongProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [isTwoPlayer, setIsTwoPlayer] = useState(false);
  const [highScore, setHighScore] = useState(() => getGameHighScore('cyber-pong'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const paddle1Y = useRef(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const paddle2Y = useRef(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const ball = useRef({
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 4,
    vy: 2.5,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const s1Ref = useRef(0);
  const s2Ref = useRef(0);
  const trailRef = useRef<{ x: number; y: number; life: number }[]>([]);

  const resetBall = (serveToLeft = false) => {
    ball.current.x = WIDTH / 2;
    ball.current.y = HEIGHT / 2;
    const angle = (Math.random() - 0.5) * (Math.PI / 3);
    const speed = 4.5;
    ball.current.vx = (serveToLeft ? -1 : 1) * Math.cos(angle) * speed;
    ball.current.vy = Math.sin(angle) * speed;
  };

  const handleGameOver = useCallback(
    (winText: string) => {
      setIsPlaying(false);
      setIsGameOver(true);
      setWinner(winText);

      if (winText.includes('Player 1') || winText.includes('You')) {
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 70 });
        const finalScore = s1Ref.current * 100;
        const { isNewHighScore, stats } = recordGamePlay('cyber-pong', finalScore);
        if (isNewHighScore) setHighScore(stats.highScore);
        if (onScoreUpdate) onScoreUpdate(finalScore, isNewHighScore);
      } else {
        sounds.playGameOver();
      }
    },
    [onScoreUpdate]
  );

  const startGame = () => {
    s1Ref.current = 0;
    s2Ref.current = 0;
    setScore1(0);
    setScore2(0);
    paddle1Y.current = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    paddle2Y.current = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    trailRef.current = [];
    setIsGameOver(false);
    setWinner(null);
    resetBall(Math.random() > 0.5);
    setIsPlaying(true);
    sounds.playMove();
  };

  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (isPlaying && !isGameOver) {
        // 1. Move Player 1
        if (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['ArrowUp']) {
          if (!isTwoPlayer && keysRef.current['ArrowUp']) {
            paddle1Y.current = Math.max(5, paddle1Y.current - 6);
          } else if (keysRef.current['w'] || keysRef.current['W']) {
            paddle1Y.current = Math.max(5, paddle1Y.current - 6);
          }
        }
        if (keysRef.current['s'] || keysRef.current['S'] || keysRef.current['ArrowDown']) {
          if (!isTwoPlayer && keysRef.current['ArrowDown']) {
            paddle1Y.current = Math.min(HEIGHT - PADDLE_HEIGHT - 5, paddle1Y.current + 6);
          } else if (keysRef.current['s'] || keysRef.current['S']) {
            paddle1Y.current = Math.min(HEIGHT - PADDLE_HEIGHT - 5, paddle1Y.current + 6);
          }
        }

        // 2. Move Player 2 (or AI)
        if (isTwoPlayer) {
          if (keysRef.current['ArrowUp']) {
            paddle2Y.current = Math.max(5, paddle2Y.current - 6);
          }
          if (keysRef.current['ArrowDown']) {
            paddle2Y.current = Math.min(HEIGHT - PADDLE_HEIGHT - 5, paddle2Y.current + 6);
          }
        } else {
          // AI Logic
          const targetY = ball.current.y - PADDLE_HEIGHT / 2;
          const aiSpeed = 4.0;
          if (paddle2Y.current < targetY - 4) {
            paddle2Y.current = Math.min(HEIGHT - PADDLE_HEIGHT - 5, paddle2Y.current + aiSpeed);
          } else if (paddle2Y.current > targetY + 4) {
            paddle2Y.current = Math.max(5, paddle2Y.current - aiSpeed);
          }
        }

        // 3. Move Ball
        const b = ball.current;
        b.x += b.vx;
        b.y += b.vy;

        // Trail
        trailRef.current.push({ x: b.x, y: b.y, life: 1.0 });
        for (let i = trailRef.current.length - 1; i >= 0; i--) {
          trailRef.current[i].life -= 0.08;
          if (trailRef.current[i].life <= 0) trailRef.current.splice(i, 1);
        }

        // Top / Bottom Wall Bounce
        if (b.y - BALL_RADIUS <= 0) {
          b.y = BALL_RADIUS;
          b.vy = -b.vy;
          sounds.playHit();
        } else if (b.y + BALL_RADIUS >= HEIGHT) {
          b.y = HEIGHT - BALL_RADIUS;
          b.vy = -b.vy;
          sounds.playHit();
        }

        // Left Paddle Bounce (P1)
        if (
          b.x - BALL_RADIUS <= 20 + PADDLE_WIDTH &&
          b.x + BALL_RADIUS >= 20 &&
          b.y >= paddle1Y.current &&
          b.y <= paddle1Y.current + PADDLE_HEIGHT &&
          b.vx < 0
        ) {
          const delta = (b.y - (paddle1Y.current + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
          b.vx = Math.min(8, -b.vx * 1.05);
          b.vy = delta * 5.0;
          sounds.playBeep(480, 'square', 0.04, 0.1);
        }

        // Right Paddle Bounce (P2/AI)
        if (
          b.x + BALL_RADIUS >= WIDTH - 20 - PADDLE_WIDTH &&
          b.x - BALL_RADIUS <= WIDTH - 20 &&
          b.y >= paddle2Y.current &&
          b.y <= paddle2Y.current + PADDLE_HEIGHT &&
          b.vx > 0
        ) {
          const delta = (b.y - (paddle2Y.current + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
          b.vx = Math.max(-8, -b.vx * 1.05);
          b.vy = delta * 5.0;
          sounds.playBeep(440, 'square', 0.04, 0.1);
        }

        // Scoring
        if (b.x < -10) {
          // P2 scores
          s2Ref.current += 1;
          setScore2(s2Ref.current);
          sounds.playCoin();
          if (s2Ref.current >= WINNING_SCORE) {
            handleGameOver(isTwoPlayer ? 'Player 2 Wins!' : 'AI Opponent Wins!');
          } else {
            resetBall(false);
          }
        } else if (b.x > WIDTH + 10) {
          // P1 scores
          s1Ref.current += 1;
          setScore1(s1Ref.current);
          sounds.playCoin();
          if (s1Ref.current >= WINNING_SCORE) {
            handleGameOver(isTwoPlayer ? 'Player 1 Wins!' : 'You Win!');
          } else {
            resetBall(true);
          }
        }
      }

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060a14';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Center dashed line
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(WIDTH / 2, 0);
          ctx.lineTo(WIDTH / 2, HEIGHT);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ball Trail
          trailRef.current.forEach(t => {
            ctx.fillStyle = '#38bdf8';
            ctx.globalAlpha = t.life * 0.4;
            ctx.beginPath();
            ctx.arc(t.x, t.y, BALL_RADIUS * t.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });

          // P1 Paddle (Cyan)
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.roundRect(20, paddle1Y.current, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
          ctx.fill();

          // P2 Paddle (Rose/Purple)
          ctx.shadowColor = '#f43f5e';
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.roundRect(WIDTH - 20 - PADDLE_WIDTH, paddle2Y.current, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
          ctx.fill();

          // Ball
          const b = ball.current;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, isTwoPlayer, handleGameOver]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', ' '].includes(e.key)) e.preventDefault();
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

  // Touch drag for left/right side
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const touchX = ((touch.clientX - rect.left) / rect.width) * WIDTH;
      const touchY = ((touch.clientY - rect.top) / rect.height) * HEIGHT;

      if (touchX < WIDTH / 2) {
        paddle1Y.current = Math.max(5, Math.min(HEIGHT - PADDLE_HEIGHT - 5, touchY - PADDLE_HEIGHT / 2));
      } else if (isTwoPlayer) {
        paddle2Y.current = Math.max(5, Math.min(HEIGHT - PADDLE_HEIGHT - 5, touchY - PADDLE_HEIGHT / 2));
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400">P1</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">{score1}</span>
          </div>
          <span className="text-slate-600 font-bold text-lg">:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{score2}</span>
            <span className="text-xs font-bold text-rose-400">{isTwoPlayer ? 'P2' : 'AI'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsTwoPlayer(p => !p);
              if (isPlaying) startGame();
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg flex items-center gap-1.5 transition"
          >
            {isTwoPlayer ? <Users className="w-3.5 h-3.5 text-rose-400" /> : <User className="w-3.5 h-3.5 text-cyan-400" />}
            {isTwoPlayer ? '2-PLAYER' : 'VS AI'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        onTouchMove={handleTouchMove}
        className="relative w-[340px] h-[242px] sm:w-[450px] sm:h-[320px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black"
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
                <h3 className="text-3xl font-extrabold text-yellow-400 mb-2 font-display">{winner}</h3>
                <p className="text-slate-300 text-sm mb-4">First to 7 Match Complete</p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Rematch
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-rose-400 mb-2 font-display">NEON CYBER PONG</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">High-speed paddle duel against adaptive bot or 2-player split screen.</p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-cyan-400/30 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Duel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-3 text-center">
        Controls: <b>W / S</b> or <b>Arrow Keys</b>. On Mobile: <b>Drag Finger</b> vertically.
      </p>
    </div>
  );
};
