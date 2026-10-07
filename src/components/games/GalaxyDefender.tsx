import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Shield, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface GalaxyDefenderProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy?: boolean;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: 'drone' | 'scout' | 'cruiser';
  color: string;
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
const HEIGHT = 500;

export const GalaxyDefender: React.FC<GalaxyDefenderProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('galaxy-defender'));
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Player state
  const playerRef = useRef({
    x: WIDTH / 2 - 16,
    y: HEIGHT - 60,
    width: 32,
    height: 32,
    speed: 6,
    shooting: false,
    lastShot: 0,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const lastSpawnRef = useRef(0);

  // Initialize background starfield
  useEffect(() => {
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
      });
    }
    starsRef.current = stars;
  }, []);

  const spawnEnemy = useCallback((waveNum: number) => {
    const types: ('drone' | 'scout' | 'cruiser')[] = ['drone', 'drone', 'scout'];
    if (waveNum > 2) types.push('cruiser');
    const type = types[Math.floor(Math.random() * types.length)];

    let width = 24;
    let height = 24;
    let hp = 1;
    let speed = 1.5 + waveNum * 0.2;
    let color = '#ec4899'; // pink

    if (type === 'scout') {
      width = 20;
      height = 20;
      hp = 1;
      speed = 2.8 + waveNum * 0.2;
      color = '#38bdf8'; // cyan
    } else if (type === 'cruiser') {
      width = 36;
      height = 32;
      hp = 3 + Math.floor(waveNum / 2);
      speed = 0.9;
      color = '#f59e0b'; // amber
    }

    enemiesRef.current.push({
      x: Math.random() * (WIDTH - width - 20) + 10,
      y: -height,
      width,
      height,
      hp,
      maxHp: hp,
      speed,
      type,
      color,
    });
  }, []);

  const addExplosion = (x: number, y: number, color: string, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3.5;
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

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    sounds.playGameOver();

    const { isNewHighScore, stats } = recordGamePlay('galaxy-defender', scoreRef.current);
    if (isNewHighScore) {
      setHighScore(stats.highScore);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    if (onScoreUpdate) onScoreUpdate(scoreRef.current, isNewHighScore);
  }, [onScoreUpdate]);

  const startGame = () => {
    playerRef.current.x = WIDTH / 2 - 16;
    playerRef.current.y = HEIGHT - 60;
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    waveRef.current = 1;
    setScore(0);
    setLives(3);
    setWave(1);
    setIsGameOver(false);
    setIsPlaying(true);
    sounds.playPowerUp();
  };

  // Main game update & render loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      // 1. Update Stars
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > HEIGHT) {
          star.y = 0;
          star.x = Math.random() * WIDTH;
        }
      });

      if (isPlaying && !isGameOver) {
        // 2. Player Controls
        const p = playerRef.current;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
          p.x = Math.max(10, p.x - p.speed);
        }
        if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
          p.x = Math.min(WIDTH - p.width - 10, p.x + p.speed);
        }
        if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) {
          p.y = Math.max(HEIGHT / 2, p.y - p.speed);
        }
        if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['S']) {
          p.y = Math.min(HEIGHT - p.height - 10, p.y + p.speed);
        }

        // Auto or Key shoot
        const shouldShoot = keysRef.current[' '] || keysRef.current['Space'] || p.shooting;
        if (shouldShoot && timestamp - p.lastShot > 160) {
          bulletsRef.current.push({
            x: p.x + p.width / 2 - 2,
            y: p.y - 6,
            vx: 0,
            vy: -10,
          });
          sounds.playLaser();
          p.lastShot = timestamp;
        }

        // 3. Enemy Spawning
        const spawnInterval = Math.max(700, 1500 - waveRef.current * 100);
        if (timestamp - lastSpawnRef.current > spawnInterval) {
          spawnEnemy(waveRef.current);
          lastSpawnRef.current = timestamp;
        }

        // 4. Update Bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          b.x += b.vx;
          b.y += b.vy;
          if (b.y < -10 || b.y > HEIGHT + 10) {
            bulletsRef.current.splice(i, 1);
          }
        }

        // 5. Update Enemies & Collision
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i];
          e.y += e.speed;

          // Check hit with player bullets
          for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
            const b = bulletsRef.current[bi];
            if (
              b.x >= e.x &&
              b.x <= e.x + e.width &&
              b.y >= e.y &&
              b.y <= e.y + e.height
            ) {
              bulletsRef.current.splice(bi, 1);
              e.hp -= 1;
              sounds.playHit();
              addExplosion(b.x, b.y, '#38bdf8', 4);

              if (e.hp <= 0) {
                sounds.playExplosion();
                addExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color, 18);
                enemiesRef.current.splice(i, 1);

                const pointVal = e.type === 'cruiser' ? 30 : e.type === 'scout' ? 20 : 10;
                scoreRef.current += pointVal;
                setScore(scoreRef.current);

                // Wave advancement every 150 points
                const nextWave = Math.floor(scoreRef.current / 150) + 1;
                if (nextWave > waveRef.current) {
                  waveRef.current = nextWave;
                  setWave(nextWave);
                  sounds.playPowerUp();
                }
                break;
              }
            }
          }

          // Check hit with Player
          if (
            e.x < p.x + p.width &&
            e.x + e.width > p.x &&
            e.y < p.y + p.height &&
            e.y + e.height > p.y
          ) {
            enemiesRef.current.splice(i, 1);
            sounds.playExplosion();
            addExplosion(p.x + p.width / 2, p.y + p.height / 2, '#ef4444', 25);
            livesRef.current -= 1;
            setLives(livesRef.current);

            if (livesRef.current <= 0) {
              handleGameOver();
            }
            continue;
          }

          // Offscreen
          if (e.y > HEIGHT + 30) {
            enemiesRef.current.splice(i, 1);
          }
        }

        // 6. Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.04;
          if (pt.life <= 0) {
            particlesRef.current.splice(i, 1);
          }
        }
      }

      // 7. Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060913';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Draw Stars
          starsRef.current.forEach(star => {
            ctx.fillStyle = star.size > 1.5 ? '#ffffff' : '#64748b';
            ctx.fillRect(star.x, star.y, star.size, star.size);
          });

          // Draw Particles
          particlesRef.current.forEach(pt => {
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5 * pt.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });

          // Draw Bullets
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#38bdf8';
          ctx.fillStyle = '#38bdf8';
          bulletsRef.current.forEach(b => {
            ctx.fillRect(b.x, b.y, 4, 12);
          });

          // Draw Enemies
          enemiesRef.current.forEach(e => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = e.color;
            ctx.fillStyle = e.color;

            if (e.type === 'drone') {
              ctx.beginPath();
              ctx.moveTo(e.x + e.width / 2, e.y + e.height);
              ctx.lineTo(e.x, e.y);
              ctx.lineTo(e.x + e.width, e.y);
              ctx.closePath();
              ctx.fill();
            } else if (e.type === 'scout') {
              ctx.beginPath();
              ctx.moveTo(e.x + e.width / 2, e.y + e.height);
              ctx.lineTo(e.x + e.width, e.y + e.height / 2);
              ctx.lineTo(e.x + e.width / 2, e.y);
              ctx.lineTo(e.x, e.y + e.height / 2);
              ctx.closePath();
              ctx.fill();
            } else {
              // Cruiser
              ctx.fillRect(e.x, e.y, e.width, e.height);
            }
          });

          // Draw Player Ship
          if (isPlaying && !isGameOver) {
            const p = playerRef.current;
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#06b6d4';
            ctx.fillStyle = '#22d3ee';

            ctx.beginPath();
            ctx.moveTo(p.x + p.width / 2, p.y);
            ctx.lineTo(p.x + p.width, p.y + p.height);
            ctx.lineTo(p.x + p.width / 2, p.y + p.height - 8);
            ctx.lineTo(p.x, p.y + p.height);
            ctx.closePath();
            ctx.fill();

            // Ship Engine Flame
            ctx.shadowColor = '#f97316';
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(p.x + p.width / 2 - 4, p.y + p.height - 6);
            ctx.lineTo(p.x + p.width / 2 + 4, p.y + p.height - 6);
            ctx.lineTo(p.x + p.width / 2, p.y + p.height + 6 + Math.random() * 4);
            ctx.closePath();
            ctx.fill();
          }

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, handleGameOver, spawnEnemy]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
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

  // Touch drag controls
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = ((touch.clientX - rect.left) / rect.width) * WIDTH;
    playerRef.current.x = Math.max(10, Math.min(WIDTH - playerRef.current.width - 10, touchX - playerRef.current.width / 2));
    playerRef.current.shooting = true;
  };

  const handleTouchEnd = () => {
    playerRef.current.shooting = false;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">WAVE</span>
            <span className="text-xl font-bold font-mono text-purple-400">{wave}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Shield
                key={i}
                className={`w-5 h-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
          <div className="text-right pl-2 border-l border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
            <span className="text-sm font-bold font-mono text-amber-400">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-[340px] h-[425px] sm:w-[380px] sm:h-[475px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black"
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
                <h3 className="text-3xl font-extrabold text-rose-500 mb-2 font-display">SHIP DESTROYED</h3>
                <p className="text-slate-300 text-sm mb-4">Final Score: <span className="font-mono text-cyan-400 font-bold text-lg">{score}</span></p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Launch Again
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 mb-2 font-display">GALAXY DEFENDER</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">Blast through enemy squadrons. Arrow keys / A/D to steer, Space to fire lasers.</p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base rounded-xl shadow-lg shadow-purple-500/30 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Launch Starfighter
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-3 text-center">
        Controls: <b>A / D / Arrow Keys</b> + <b>Spacebar</b> to Shoot. Mobile: <b>Drag Finger</b>.
      </p>
    </div>
  );
};
