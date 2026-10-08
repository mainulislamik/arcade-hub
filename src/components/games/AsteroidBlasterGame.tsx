import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Shield, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';

interface AsteroidBlasterProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

interface Ship {
  x: number;
  y: number;
  r: number; // radius
  a: number; // angle in radians
  rot: number; // rotation speed
  thrusting: boolean;
  thrust: { x: number; y: number };
  dead: boolean;
  respawnTimer: number;
  invulnerable: number;
}

interface Laser {
  x: number;
  y: number;
  xv: number;
  yv: number;
  life: number;
}

interface Asteroid {
  x: number;
  y: number;
  xv: number;
  yv: number;
  r: number;
  a: number;
  vert: number;
  offsets: number[];
}

interface Particle {
  x: number;
  y: number;
  xv: number;
  yv: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export const AsteroidBlasterGame: React.FC<AsteroidBlasterProps> = ({ onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const shipRef = useRef<Ship>({
    x: 250,
    y: 250,
    r: 12,
    a: (90 / 180) * Math.PI,
    rot: 0,
    thrusting: false,
    thrust: { x: 0, y: 0 },
    dead: false,
    respawnTimer: 0,
    invulnerable: 60,
  });

  const lasersRef = useRef<Laser[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number>(0);
  const scoreRef = useRef(0);

  const spawnAsteroids = useCallback((count: number, currentWave: number) => {
    const arr: Asteroid[] = [];
    const ship = shipRef.current;
    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      do {
        x = Math.random() * 500;
        y = Math.random() * 500;
      } while (Math.hypot(x - ship.x, y - ship.y) < 100);

      const r = 35 + Math.random() * 10;
      const speed = 1 + currentWave * 0.2;
      const angle = Math.random() * Math.PI * 2;
      const vert = Math.floor(Math.random() * 4) + 8;
      const offsets = Array.from({ length: vert }, () => Math.random() * 0.4 + 0.8);

      arr.push({
        x,
        y,
        xv: Math.cos(angle) * speed,
        yv: Math.sin(angle) * speed,
        r,
        a: Math.random() * Math.PI * 2,
        vert,
        offsets,
      });
    }
    asteroidsRef.current = arr;
  }, []);

  const initGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setWave(1);
    lasersRef.current = [];
    particlesRef.current = [];

    shipRef.current = {
      x: 250,
      y: 250,
      r: 12,
      a: (90 / 180) * Math.PI,
      rot: 0,
      thrusting: false,
      thrust: { x: 0, y: 0 },
      dead: false,
      respawnTimer: 0,
      invulnerable: 90,
    };

    spawnAsteroids(4, 1);
    setGameState('playing');
    sounds.playLaser();
  }, [spawnAsteroids]);

  const shootLaser = useCallback(() => {
    const ship = shipRef.current;
    if (ship.dead || lasersRef.current.length >= 8) return;

    sounds.playLaser();
    lasersRef.current.push({
      x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
      y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
      xv: (400 / 60) * Math.cos(ship.a),
      yv: -(400 / 60) * Math.sin(ship.a),
      life: 50,
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
      if (e.key === ' ' && gameState === 'playing') {
        shootLaser();
      }
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
  }, [gameState, shootLaser]);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 500, 500);

      // Stars background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let s = 0; s < 30; s++) {
        ctx.fillRect((s * 67) % 500, (s * 97) % 500, 1.5, 1.5);
      }

      const ship = shipRef.current;
      const keys = keysRef.current;

      // Handle Ship rotation & thrust
      if (!ship.dead) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
          ship.rot = ((360 / 180) * Math.PI) / 60;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
          ship.rot = -((360 / 180) * Math.PI) / 60;
        } else {
          ship.rot = 0;
        }
        ship.a += ship.rot;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
          ship.thrusting = true;
          ship.thrust.x += (5 / 60) * Math.cos(ship.a);
          ship.thrust.y -= (5 / 60) * Math.sin(ship.a);

          // Exhaust particles
          if (Math.random() < 0.6) {
            particlesRef.current.push({
              x: ship.x - ship.r * Math.cos(ship.a),
              y: ship.y + ship.r * Math.sin(ship.a),
              xv: -Math.cos(ship.a) * 2 + (Math.random() - 0.5),
              yv: Math.sin(ship.a) * 2 + (Math.random() - 0.5),
              size: Math.random() * 3 + 1,
              color: '#38bdf8',
              life: 15,
              maxLife: 15,
            });
          }
        } else {
          ship.thrusting = false;
          ship.thrust.x *= 0.985;
          ship.thrust.y *= 0.985;
        }

        // Move Ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // Screen wrap
        if (ship.x < 0 - ship.r) ship.x = 500 + ship.r;
        else if (ship.x > 500 + ship.r) ship.x = 0 - ship.r;
        if (ship.y < 0 - ship.r) ship.y = 500 + ship.r;
        else if (ship.y > 500 + ship.r) ship.y = 0 - ship.r;

        if (ship.invulnerable > 0) ship.invulnerable--;

        // Draw Ship
        if (ship.invulnerable % 10 < 6) {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Nose
          ctx.moveTo(
            ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
            ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
          );
          // Rear Left
          ctx.lineTo(
            ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
          );
          // Rear Center
          ctx.lineTo(
            ship.x - (2 / 3) * ship.r * Math.cos(ship.a),
            ship.y + (2 / 3) * ship.r * Math.sin(ship.a)
          );
          // Rear Right
          ctx.lineTo(
            ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
          );
          ctx.closePath();
          ctx.stroke();

          // Thrust flame
          if (ship.thrusting) {
            ctx.fillStyle = '#f59e0b';
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(
              ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
              ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo(
              ship.x - (5 / 3) * ship.r * Math.cos(ship.a),
              ship.y + (5 / 3) * ship.r * Math.sin(ship.a)
            );
            ctx.lineTo(
              ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
              ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }
      }

      // Lasers update & draw
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const l = lasersRef.current[i];
        l.x += l.xv;
        l.y += l.yv;
        l.life--;

        // Screen wrap
        if (l.x < 0) l.x = 500;
        else if (l.x > 500) l.x = 0;
        if (l.y < 0) l.y = 500;
        else if (l.y > 500) l.y = 0;

        if (l.life <= 0) {
          lasersRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Asteroids update & collision check
      for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
        const a = asteroidsRef.current[i];
        a.x += a.xv;
        a.y += a.yv;

        // Screen wrap
        if (a.x < 0 - a.r) a.x = 500 + a.r;
        else if (a.x > 500 + a.r) a.x = 0 - a.r;
        if (a.y < 0 - a.r) a.y = 500 + a.r;
        else if (a.y > 500 + a.r) a.y = 0 - a.r;

        // Laser vs Asteroid Collision
        for (let j = lasersRef.current.length - 1; j >= 0; j--) {
          const l = lasersRef.current[j];
          if (Math.hypot(a.x - l.x, a.y - l.y) < a.r) {
            lasersRef.current.splice(j, 1);
            sounds.playExplosion();

            // Spawn blast particles
            for (let p = 0; p < 12; p++) {
              particlesRef.current.push({
                x: a.x,
                y: a.y,
                xv: (Math.random() - 0.5) * 5,
                yv: (Math.random() - 0.5) * 5,
                size: Math.random() * 3 + 1,
                color: '#e2e8f0',
                life: 25,
                maxLife: 25,
              });
            }

            // Split asteroid if big
            if (a.r > 20) {
              const newR = a.r / 2;
              for (let s = 0; s < 2; s++) {
                const angle = Math.random() * Math.PI * 2;
                asteroidsRef.current.push({
                  x: a.x,
                  y: a.y,
                  xv: Math.cos(angle) * (Math.abs(a.xv) + 0.5),
                  yv: Math.sin(angle) * (Math.abs(a.yv) + 0.5),
                  r: newR,
                  a: Math.random() * Math.PI * 2,
                  vert: Math.floor(Math.random() * 3) + 7,
                  offsets: Array.from({ length: 9 }, () => Math.random() * 0.4 + 0.8),
                });
              }
            }

            const points = a.r > 30 ? 50 : a.r > 20 ? 100 : 200;
            scoreRef.current += points;
            setScore(scoreRef.current);
            if (onScoreUpdate) onScoreUpdate(scoreRef.current);

            asteroidsRef.current.splice(i, 1);
            break;
          }
        }

        // Ship vs Asteroid Collision
        if (!ship.dead && ship.invulnerable <= 0 && Math.hypot(a.x - ship.x, a.y - ship.y) < a.r + ship.r) {
          sounds.playHit();
          ship.dead = true;
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameState('gameover');
              sounds.playGameOver();
              recordGamePlay('asteroid-blaster', scoreRef.current);
              if (onGameOver) onGameOver(scoreRef.current);
            } else {
              setTimeout(() => {
                shipRef.current.dead = false;
                shipRef.current.x = 250;
                shipRef.current.y = 250;
                shipRef.current.thrust = { x: 0, y: 0 };
                shipRef.current.invulnerable = 90;
              }, 1000);
            }
            return nextL;
          });
        }

        // Draw Asteroid
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let v = 0; v < a.vert; v++) {
          const angle = (v / a.vert) * Math.PI * 2 + a.a;
          const dist = a.r * (a.offsets[v] || 1);
          const px = a.x + dist * Math.cos(angle);
          const py = a.y + dist * Math.sin(angle);
          if (v === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Wave Complete Check
      if (asteroidsRef.current.length === 0) {
        sounds.playVictory();
        setWave((w) => {
          const nextW = w + 1;
          spawnAsteroids(4 + nextW, nextW);
          return nextW;
        });
      }

      // Particles
      for (let p = particlesRef.current.length - 1; p >= 0; p--) {
        const pt = particlesRef.current[p];
        pt.x += pt.xv;
        pt.y += pt.yv;
        pt.life--;
        if (pt.life <= 0) {
          particlesRef.current.splice(p, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, spawnAsteroids, onScoreUpdate, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl backdrop-blur select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg transition ${
                  i < lives ? 'opacity-100 scale-100' : 'opacity-20 scale-75'
                }`}
              >
                🚀
              </span>
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            WAVE {wave}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Score</span>
            <span className="text-lg font-bold font-mono text-white">{score}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} width={500} height={500} className="w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] block" />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {gameState === 'gameover' ? '💥 SYSTEM DESTROYED' : 'ASTEROID BLASTER'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Rotate ship, thrust vector thrusters, shoot asteroids, and survive infinite alien waves!
            </p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-5 h-5 fill-current" />
              {gameState === 'gameover' ? 'Play Again' : 'Launch Ship'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="w-full mt-3 grid grid-cols-4 gap-2 sm:hidden">
        <button
          onTouchStart={() => (keysRef.current['ArrowLeft'] = true)}
          onTouchEnd={() => (keysRef.current['ArrowLeft'] = false)}
          className="p-3 bg-slate-800 rounded-xl text-cyan-400 font-bold text-center active:bg-cyan-600 active:text-white"
        >
          ◀
        </button>
        <button
          onTouchStart={() => (keysRef.current['ArrowUp'] = true)}
          onTouchEnd={() => (keysRef.current['ArrowUp'] = false)}
          className="p-3 bg-slate-800 rounded-xl text-cyan-400 font-bold text-center active:bg-cyan-600 active:text-white"
        >
          ▲ Thrust
        </button>
        <button
          onTouchStart={() => (keysRef.current['ArrowRight'] = true)}
          onTouchEnd={() => (keysRef.current['ArrowRight'] = false)}
          className="p-3 bg-slate-800 rounded-xl text-cyan-400 font-bold text-center active:bg-cyan-600 active:text-white"
        >
          ▶
        </button>
        <button
          onTouchStart={shootLaser}
          className="p-3 bg-cyan-600 rounded-xl text-slate-950 font-extrabold text-center active:bg-cyan-400"
        >
          ⚡ Fire
        </button>
      </div>
    </div>
  );
};
