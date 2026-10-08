import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Flame, RotateCcw, Play, Trophy, Sparkles, Heart, Zap } from 'lucide-react';

interface StickmanRunnerGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'laser' | 'barrier' | 'drone';
  passed?: boolean;
}

interface Gem {
  x: number;
  y: number;
  collected: boolean;
}

export const StickmanRunnerGame: React.FC<StickmanRunnerGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);

  const gameState = useRef<{
    playerY: number;
    playerVy: number;
    isGrounded: boolean;
    isSliding: boolean;
    slideTimer: number;
    jumpCount: number;
    speed: number;
    obstacles: Obstacle[];
    gems: Gem[];
    particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[];
    distance: number;
    score: number;
    coins: number;
  }>({
    playerY: 340,
    playerVy: 0,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0,
    jumpCount: 0,
    speed: 7,
    obstacles: [],
    gems: [],
    particles: [],
    distance: 0,
    score: 0,
    coins: 0
  });

  const startGame = () => {
    gameState.current = {
      playerY: 340,
      playerVy: 0,
      isGrounded: true,
      isSliding: false,
      slideTimer: 0,
      jumpCount: 0,
      speed: 7,
      obstacles: [],
      gems: [],
      particles: [],
      distance: 0,
      score: 0,
      coins: 0
    };
    setScore(0);
    setDistance(0);
    setCoins(0);
    setIsGameOver(false);
    setIsPlaying(true);
    sounds.playVictory();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      const state = gameState.current;

      if (['arrowup', 'arrowdown', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      // Jump (Space / W / ArrowUp)
      if ((e.key === ' ' || e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') && state.jumpCount < 2) {
        state.playerVy = -13;
        state.isGrounded = false;
        state.isSliding = false;
        state.jumpCount++;
        sounds.playJump();
      }
      // Slide (S / ArrowDown)
      else if ((e.key.toLowerCase() === 's' || e.key === 'ArrowDown') && state.isGrounded) {
        state.isSliding = true;
        state.slideTimer = 25;
        sounds.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameState.current;
      const FLOOR_Y = 340;
      const GRAVITY = 0.65;

      // Update Speed & Distance
      state.speed += 0.001;
      state.distance += state.speed * 0.05;
      state.score = Math.floor(state.distance * 10) + state.coins * 50;
      setDistance(Math.floor(state.distance));
      setScore(state.score);
      onScoreUpdate?.(state.score);

      // Physics
      state.playerVy += GRAVITY;
      state.playerY += state.playerVy;

      if (state.playerY >= FLOOR_Y) {
        state.playerY = FLOOR_Y;
        state.playerVy = 0;
        state.isGrounded = true;
        state.jumpCount = 0;
      }

      if (state.isSliding) {
        state.slideTimer--;
        if (state.slideTimer <= 0) {
          state.isSliding = false;
        }
      }

      // Spawn Obstacles & Gems
      if (Math.random() < 0.02 && state.obstacles.length < 5) {
        const lastObstacle = state.obstacles[state.obstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < canvas.width - 250) {
          const types: ('spike' | 'laser' | 'barrier')[] = ['spike', 'laser', 'barrier'];
          const type = types[Math.floor(Math.random() * types.length)];
          const h = type === 'barrier' ? 70 : type === 'laser' ? 25 : 35;
          const y = type === 'laser' ? FLOOR_Y - 50 : FLOOR_Y - h + 10;
          state.obstacles.push({ x: canvas.width + 50, y, w: 30, h, type });

          // Spawn Gem above obstacle
          state.gems.push({
            x: canvas.width + 50,
            y: FLOOR_Y - 80,
            collected: false
          });
        }
      }

      // Move Obstacles
      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= state.speed;

        // Player Hitbox
        const playerBox = state.isSliding
          ? { x: 140, y: state.playerY - 20, w: 45, h: 20 }
          : { x: 140, y: state.playerY - 50, w: 25, h: 50 };

        const isColliding =
          playerBox.x < obs.x + obs.w &&
          playerBox.x + playerBox.w > obs.x &&
          playerBox.y < obs.y + obs.h &&
          playerBox.y + playerBox.h > obs.y;

        if (isColliding && !isGameOver) {
          setIsGameOver(true);
          sounds.playGameOver();
          onGameOver?.(state.score);
        }

        return obs.x > -50;
      });

      // Move Gems
      state.gems = state.gems.filter(gem => {
        gem.x -= state.speed;

        const dist = Math.hypot(150 - gem.x, state.playerY - 30 - gem.y);
        if (dist < 30 && !gem.collected) {
          gem.collected = true;
          state.coins++;
          setCoins(state.coins);
          sounds.playCoin();

          // Particle burst
          for (let i = 0; i < 8; i++) {
            state.particles.push({
              x: gem.x,
              y: gem.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 15,
              color: '#facc15'
            });
          }
        }

        return gem.x > -30 && !gem.collected;
      });

      // Update Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
      });

      // --- RENDER ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cyber City Parallax Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.7, '#1e1b4b');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // City Skyline Silhouettes
      ctx.fillStyle = 'rgba(30, 27, 75, 0.4)';
      for (let i = 0; i < 10; i++) {
        const buildingX = ((i * 120 - state.distance * 2) % (canvas.width + 120)) - 60;
        ctx.fillRect(buildingX, 150 + (i % 3) * 30, 80, 250);
      }

      // Ground Track
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, FLOOR_Y + 10, canvas.width, canvas.height - FLOOR_Y);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, FLOOR_Y + 10, canvas.width, 3);

      // Draw Stickman Runner
      ctx.strokeStyle = '#06b6d4';
      ctx.fillStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      const px = 150;
      const py = state.playerY;

      if (state.isSliding) {
        // Sliding Pose
        ctx.beginPath();
        ctx.arc(px + 20, py - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px + 12, py - 10);
        ctx.lineTo(px - 20, py - 5);
        ctx.lineTo(px - 35, py);
        ctx.stroke();
      } else {
        // Running / Jumping Pose
        const headY = py - 45;
        ctx.beginPath();
        ctx.arc(px, headY, 9, 0, Math.PI * 2);
        ctx.fill();

        // Glowing visor
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px + 4, headY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Spine
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(px, headY + 9);
        ctx.lineTo(px - 4, py - 15);
        ctx.stroke();

        // Arms & Legs
        const legPhase = Math.sin(Date.now() * 0.02) * 20;
        ctx.beginPath();
        ctx.moveTo(px, py - 30);
        ctx.lineTo(px + legPhase * 0.8, py - 15);
        ctx.moveTo(px, py - 30);
        ctx.lineTo(px - legPhase * 0.8, py - 15);

        ctx.moveTo(px - 4, py - 15);
        ctx.lineTo(px + legPhase, py + 10);
        ctx.moveTo(px - 4, py - 15);
        ctx.lineTo(px - legPhase, py + 10);
        ctx.stroke();
      }

      // Draw Obstacles
      state.obstacles.forEach(obs => {
        if (obs.type === 'spike') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.fill();
        } else if (obs.type === 'laser') {
          ctx.fillStyle = '#e11d48';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.shadowColor = '#e11d48';
          ctx.shadowBlur = 10;
          ctx.fillRect(obs.x + 2, obs.y + 2, obs.w - 4, obs.h - 4);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
      });

      // Draw Gems
      state.gems.forEach(g => {
        if (g.collected) return;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, onGameOver, onScoreUpdate]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700">
            <Sparkles className="w-4 h-4" />
            <span>{coins} GEMS</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-sm bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700">
            <Flame className="w-4 h-4" />
            <span>{distance}m</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Score</div>
          <div className="text-xl font-black text-white font-mono">{score}</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full max-w-[800px] max-h-[450px] object-contain rounded-xl shadow-2xl"
      />

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-xl mb-4 animate-bounce">
            <Flame className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            {isGameOver ? 'RUNNER CRASHED' : 'STICKMAN PARKOUR DASH'}
          </h2>

          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            {isGameOver 
              ? `You ran ${distance} meters and collected ${coins} gems!`
              : 'Jump over spikes, slide under high lasers, and double jump across rooftops!'}
          </p>

          <div className="flex items-center gap-3 mb-6 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
            <span>Space / Up: Jump (x2 for Double Jump)</span> • <span>Down / S: Slide</span>
          </div>

          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            {isGameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isGameOver ? 'RETRY RUN' : 'START SPRINT'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
