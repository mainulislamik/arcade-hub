import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Heart, Flame, Bomb } from 'lucide-react';

interface FruitSlashGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

export const FruitSlashGame: React.FC<FruitSlashGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    slicePoints: [] as Array<{ x: number; y: number; time: number }>,
    fruits: [] as Array<{
      id: number;
      type: 'watermelon' | 'orange' | 'banana' | 'coconut' | 'bomb';
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      rotation: number;
      rotSpeed: number;
      sliced: boolean;
      sliceAngle: number;
      splitOffset: number;
    }>,
    splatters: [] as Array<{
      x: number;
      y: number;
      color: string;
      radius: number;
      alpha: number;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      life: number;
    }>,
    spawnTimer: 0,
    lastTime: 0,
  });

  const startGame = useCallback(() => {
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.combo = 0;
    stateRef.current.comboTimer = 0;
    stateRef.current.slicePoints = [];
    stateRef.current.fruits = [];
    stateRef.current.splatters = [];
    stateRef.current.particles = [];
    stateRef.current.spawnTimer = 0;
    stateRef.current.lastTime = performance.now();

    setGameState('playing');
    setScore(0);
    setLives(3);
    setCombo(0);

    if (soundEnabled) sounds.playClick();
  }, [soundEnabled]);

  const handleGameOver = useCallback(() => {
    stateRef.current.gameState = 'gameover';
    setGameState('gameover');
    const finalScore = stateRef.current.score;
    if (soundEnabled) sounds.playGameOver();
    if (onGameOver) onGameOver(finalScore);
  }, [soundEnabled, onGameOver]);

  // Pointer Slice Trail Handling (Mouse + Touch)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDown = false;

    const addPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      stateRef.current.slicePoints.push({ x, y, time: performance.now() });

      // Check intersection with active fruits
      if (stateRef.current.gameState === 'playing') {
        const s = stateRef.current;
        let slicedThisSwipe = 0;

        s.fruits.forEach((f) => {
          if (!f.sliced && Math.hypot(f.x - x, f.y - y) < f.radius + 15) {
            f.sliced = true;
            f.sliceAngle = Math.random() * Math.PI;

            if (f.type === 'bomb') {
              if (soundEnabled) sounds.playExplosion();
              handleGameOver();
              return;
            }

            slicedThisSwipe++;
            s.score += 10;
            setScore(s.score);
            if (onScoreUpdate) onScoreUpdate(s.score);
            if (soundEnabled) sounds.playLaser();

            // Spawn Juice Splatters & Particles
            const colors: Record<string, string> = {
              watermelon: '#ef4444',
              orange: '#f97316',
              banana: '#eab308',
              coconut: '#ffffff',
            };
            const col = colors[f.type] || '#22c55e';

            s.splatters.push({
              x: f.x,
              y: f.y,
              color: col,
              radius: f.radius * 1.5,
              alpha: 0.7,
            });

            for (let i = 0; i < 15; i++) {
              s.particles.push({
                x: f.x,
                y: f.y,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 400,
                color: col,
                life: 0.6,
              });
            }
          }
        });

        if (slicedThisSwipe > 1) {
          s.combo += slicedThisSwipe;
          s.score += slicedThisSwipe * 15;
          setScore(s.score);
          setCombo(s.combo);
          if (soundEnabled) sounds.announceCombo?.(slicedThisSwipe);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDown = true;
      addPoint(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      addPoint(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      isDown = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handleGameOver, onScoreUpdate, soundEnabled]);

  // Main Fruit Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const s = stateRef.current;
      const dt = Math.min((time - s.lastTime) / 1000, 0.05);
      s.lastTime = time;

      const width = canvas.width;
      const height = canvas.height;

      if (s.gameState === 'playing') {
        // Prune old slice trail points
        s.slicePoints = s.slicePoints.filter((p) => time - p.time < 120);

        // Spawn Fruits
        s.spawnTimer += dt;
        if (s.spawnTimer > 1.2) {
          s.spawnTimer = 0;
          const count = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < count; i++) {
            const types: Array<'watermelon' | 'orange' | 'banana' | 'coconut' | 'bomb'> = [
              'watermelon',
              'orange',
              'banana',
              'coconut',
              'bomb',
            ];
            const randType = Math.random() < 0.18 ? 'bomb' : types[Math.floor(Math.random() * 4)];
            const x = Math.random() * (width - 200) + 100;
            const targetX = width * 0.5 + (Math.random() - 0.5) * 200;

            s.fruits.push({
              id: Math.random(),
              type: randType,
              x,
              y: height + 30,
              vx: (targetX - x) * 0.8,
              vy: -(Math.random() * 250 + 650),
              radius: randType === 'watermelon' ? 32 : 24,
              rotation: 0,
              rotSpeed: (Math.random() - 0.5) * 5,
              sliced: false,
              sliceAngle: 0,
              splitOffset: 0,
            });
          }
        }

        // Update Fruits
        for (let i = s.fruits.length - 1; i >= 0; i--) {
          const f = s.fruits[i];
          f.vy += 850 * dt; // Gravity
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.rotation += f.rotSpeed * dt;

          if (f.sliced) {
            f.splitOffset += 180 * dt;
          }

          // Fruit fell off screen uncut (Lose life if not bomb)
          if (f.y > height + 50 && f.vy > 0) {
            if (!f.sliced && f.type !== 'bomb') {
              s.lives--;
              setLives(s.lives);
              if (soundEnabled) sounds.playFall();
              if (s.lives <= 0) {
                handleGameOver();
                return;
              }
            }
            s.fruits.splice(i, 1);
          }
        }

        // Update Splatters & Particles
        s.splatters.forEach((sp) => (sp.alpha -= dt * 0.15));
        s.splatters = s.splatters.filter((sp) => sp.alpha > 0);

        s.particles.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
        });
        s.particles = s.particles.filter((p) => p.life > 0);
      }

      // --- RENDERING DOJO ---
      // Wood Texture Background
      ctx.fillStyle = '#291708';
      ctx.fillRect(0, 0, width, height);

      // Wood Floor Planks
      ctx.strokeStyle = '#1a0e05';
      ctx.lineWidth = 3;
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Splatters
      s.splatters.forEach((sp) => {
        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Fruits
      s.fruits.forEach((f) => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);

        if (f.type === 'bomb') {
          // Black Bomb with Sparking Fuse
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fill();
          // Skull Cross
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💣', 0, 6);
        } else if (!f.sliced) {
          // Whole Fruit
          if (f.type === 'watermelon') {
            ctx.fillStyle = '#15803d'; // Green rind
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#166534';
            ctx.lineWidth = 3;
            ctx.stroke();
          } else if (f.type === 'orange') {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (f.type === 'banana') {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.ellipse(0, 0, f.radius * 1.3, f.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (f.type === 'coconut') {
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Sliced Halves
          ctx.save();
          ctx.translate(-f.splitOffset, 0);
          ctx.fillStyle = f.type === 'watermelon' ? '#ef4444' : '#f97316';
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, Math.PI * 0.5, Math.PI * 1.5);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.translate(f.splitOffset, 0);
          ctx.fillStyle = f.type === 'watermelon' ? '#ef4444' : '#f97316';
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, -Math.PI * 0.5, Math.PI * 0.5);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      });

      // Draw Blade Slice Neon Trail
      if (s.slicePoints.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(s.slicePoints[0].x, s.slicePoints[0].y);
        for (let i = 1; i < s.slicePoints.length; i++) {
          ctx.lineTo(s.slicePoints[i].x, s.slicePoints[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw Particles
      s.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [handleGameOver, onScoreUpdate, soundEnabled]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none cursor-crosshair">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-mono font-black text-sm">{score}</span>
          </div>
        </div>

        {/* Lives (3 Xs) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
          {[1, 2, 3].map((l) => (
            <span key={l} className={`text-sm ${l <= lives ? 'text-rose-500' : 'text-slate-600'}`}>
              ✖
            </span>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        className="w-full h-full max-w-4xl max-h-[560px] object-contain rounded-2xl shadow-2xl"
      />

      {/* Start / Game Over Modal */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4 animate-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide mb-1">FRUIT BLADE NINJA</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Swipe and slice juicy fruits! Slice combos for bonus points, and avoid slicing dangerous bombs!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm tracking-wider shadow-xl shadow-rose-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY NOW
          </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-2xl font-black text-white mb-1">GAME OVER!</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Final Slices Score: <span className="text-rose-400 font-bold">{score}</span>
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> RETRY
          </button>
        </div>
      )}
    </div>
  );
};
