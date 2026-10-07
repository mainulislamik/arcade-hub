import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface FlappyBirdGameProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

const WIDTH = 360;
const HEIGHT = 500;
const GAP = 135;
const PIPE_WIDTH = 55;
const GRAVITY = 0.32;
const JUMP = -6.8;

export const FlappyBirdGame: React.FC<FlappyBirdGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('flappy-bird'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Bird physics state
  const birdRef = useRef({
    x: 70,
    y: HEIGHT / 2,
    radius: 14,
    velocity: 0,
    rotation: 0,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const frameCountRef = useRef(0);

  const flap = useCallback(() => {
    if (!isPlaying) {
      // Start game
      birdRef.current.y = HEIGHT / 2;
      birdRef.current.velocity = JUMP;
      pipesRef.current = [];
      particlesRef.current = [];
      scoreRef.current = 0;
      setScore(0);
      setIsGameOver(false);
      setIsPlaying(true);
      sounds.playJump();
      return;
    }

    if (isGameOver) return;

    birdRef.current.velocity = JUMP;
    sounds.playJump();

    // Add wing flap particles
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: birdRef.current.x - 8,
        y: birdRef.current.y + 4,
        vx: -Math.random() * 2 - 1,
        vy: (Math.random() - 0.5) * 2,
        color: '#38bdf8',
        life: 1.0,
      });
    }
  }, [isPlaying, isGameOver]);

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    sounds.playGameOver();

    const { isNewHighScore, stats } = recordGamePlay('flappy-bird', scoreRef.current);
    if (isNewHighScore) {
      setHighScore(stats.highScore);
      confetti({ particleCount: 80, spread: 70 });
    }
    if (onScoreUpdate) onScoreUpdate(scoreRef.current, isNewHighScore);
  }, [onScoreUpdate]);

  useEffect(() => {
    let animId: number;

    const loop = () => {
      frameCountRef.current++;

      if (isPlaying && !isGameOver) {
        const bird = birdRef.current;

        // Apply physics
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;
        bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.08));

        // Floor / Ceiling Collision
        if (bird.y + bird.radius >= HEIGHT - 20 || bird.y - bird.radius <= 0) {
          handleGameOver();
        }

        // Spawn Pipes
        if (frameCountRef.current % 100 === 0) {
          const topH = Math.floor(Math.random() * (HEIGHT - GAP - 140)) + 50;
          pipesRef.current.push({
            x: WIDTH + 20,
            topHeight: topH,
            bottomY: topH + GAP,
            passed: false,
          });
        }

        // Move Pipes & Check Collision
        for (let i = pipesRef.current.length - 1; i >= 0; i--) {
          const p = pipesRef.current[i];
          p.x -= 2.5;

          // Check if bird passed pipe
          if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
            p.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            sounds.playCoin();
          }

          // Pipe Box Collision
          const inX = bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + PIPE_WIDTH;
          const inTopY = bird.y - bird.radius < p.topHeight;
          const inBottomY = bird.y + bird.radius > p.bottomY;

          if (inX && (inTopY || inBottomY)) {
            handleGameOver();
          }

          // Remove off-screen pipes
          if (p.x + PIPE_WIDTH < -20) {
            pipesRef.current.splice(i, 1);
          }
        }

        // Update particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.04;
          if (pt.life <= 0) particlesRef.current.splice(i, 1);
        }
      }

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Night Sky Gradient
          const skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(1, '#020617');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Subtle Cyber Grid Floor
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, HEIGHT - 20);
          ctx.lineTo(WIDTH, HEIGHT - 20);
          ctx.stroke();

          // Render Pipes
          pipesRef.current.forEach(p => {
            // Top Pipe
            const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
            pipeGrad.addColorStop(0, '#0284c7');
            pipeGrad.addColorStop(0.5, '#38bdf8');
            pipeGrad.addColorStop(1, '#0369a1');

            ctx.fillStyle = pipeGrad;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#0284c7';
            ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
            ctx.fillRect(p.x - 3, p.topHeight - 16, PIPE_WIDTH + 6, 16);

            // Bottom Pipe
            ctx.fillRect(p.x, p.bottomY, PIPE_WIDTH, HEIGHT - p.bottomY);
            ctx.fillRect(p.x - 3, p.bottomY, PIPE_WIDTH + 6, 16);
          });

          // Render Particles
          particlesRef.current.forEach(pt => {
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5 * pt.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });

          // Render Cyber Bird
          const bird = birdRef.current;
          ctx.save();
          ctx.translate(bird.x, bird.y);
          ctx.rotate(bird.rotation);

          ctx.shadowBlur = 12;
          ctx.shadowColor = '#38bdf8';
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
          ctx.fill();

          // Bird Eye & Beak
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(6, -4, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(8, -4, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(18, 3);
          ctx.lineTo(10, 6);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, handleGameOver]);

  // Handle Space & Click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
          <span className="text-xl font-bold font-mono text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div
        onClick={flap}
        className="relative w-[340px] h-[470px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 cursor-pointer"
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
                <h3 className="text-3xl font-extrabold text-rose-500 mb-2 font-display">CRASHED!</h3>
                <p className="text-slate-300 text-sm mb-4">Score: <span className="font-mono text-cyan-400 font-bold text-xl">{score}</span></p>
                <button
                  onClick={flap}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Tap to Replay
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black text-cyan-400 mb-2 font-display">FLAPPY CYBER BIRD</h3>
                <p className="text-slate-300 text-xs mb-6 max-w-xs">Tap screen or press Spacebar to flap and pass through energy gates.</p>
                <button
                  onClick={flap}
                  className="flex items-center gap-2 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-cyan-400/30 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Tap To Play
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-3 text-center">
        Click or Tap screen / Press <b>Spacebar</b> to Flap.
      </p>
    </div>
  );
};
