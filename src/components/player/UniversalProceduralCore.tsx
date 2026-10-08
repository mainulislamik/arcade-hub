import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameItem } from '../../types/game';
import { RotateCcw, Play, Pause, Zap, Trophy, Flame, Shield, Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface UniversalProceduralCoreProps {
  game: GameItem;
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const UniversalProceduralCore: React.FC<UniversalProceduralCoreProps> = ({
  game,
  soundEnabled,
  onScoreUpdate,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(`arcadex_highscore_${game.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOverState, setIsGameOverState] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [health, setHealth] = useState<number>(100);

  // Internal Game Loop State
  const gameStateRef = useRef({
    player: { x: 300, y: 350, vx: 0, vy: 0, size: 24, angle: 0, cooldown: 0 },
    bullets: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    enemies: [] as Array<{ x: number; y: number; vx: number; vy: number; hp: number; maxHp: number; size: number; color: string; type: string }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }>,
    stars: [] as Array<{ x: number; y: number; speed: number; size: number; alpha: number }>,
    floatingTexts: [] as Array<{ x: number; y: number; text: string; color: string; life: number }>,
    gridTiles: [] as Array<{ x: number; y: number; color: string; val: number; matched: boolean }>,
    keys: {} as Record<string, boolean>,
    frame: 0,
    score: 0,
    multiplier: 1,
    health: 100,
    wave: 1
  });

  // Initialize Canvas & Stars Background
  useEffect(() => {
    const state = gameStateRef.current;
    state.stars = [];
    for (let i = 0; i < 80; i++) {
      state.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        speed: 0.5 + Math.random() * 2,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key.toLowerCase() === 'p' && isPlaying) {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Start / Restart Game
  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    state.player = { x: 400, y: 400, vx: 0, vy: 0, size: 24, angle: 0, cooldown: 0 };
    state.bullets = [];
    state.enemies = [];
    state.particles = [];
    state.floatingTexts = [];
    state.frame = 0;
    state.score = 0;
    state.multiplier = 1;
    state.health = 100;
    state.wave = 1;

    // Genre-specific initial seed
    if (game.category === 'puzzle') {
      state.gridTiles = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
          state.gridTiles.push({
            x: 250 + c * 60,
            y: 100 + r * 60,
            color: colors[Math.floor(Math.random() * colors.length)],
            val: Math.floor(Math.random() * 4) + 1,
            matched: false
          });
        }
      }
    }

    setScore(0);
    setMultiplier(1);
    setHealth(100);
    setIsGameOverState(false);
    setIsPaused(false);
    setIsPlaying(true);
    if (soundEnabled) sounds.playPowerup();
  }, [game.category, soundEnabled]);

  // Trigger floating damage/score text
  const addFloatingText = (x: number, y: number, text: string, color: string = '#38bdf8') => {
    gameStateRef.current.floatingTexts.push({ x, y, text, color, life: 30 });
  };

  // Trigger particle explosion
  const triggerExplosion = (x: number, y: number, color: string = '#f59e0b', count: number = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 20,
        maxLife: 40,
        color,
        size: 2 + Math.random() * 3
      });
    }
  };

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear Screen & Draw Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Starfield / Grid background
      ctx.fillStyle = '#1e293b';
      for (const s of state.stars) {
        if (isPlaying && !isPaused) {
          s.y += s.speed;
          if (s.y > height) {
            s.y = 0;
            s.x = Math.random() * width;
          }
        }
        ctx.fillStyle = `rgba(56, 189, 248, ${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      // Draw Retro Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying && !isPaused && !isGameOverState) {
        state.frame++;

        // 2. Physics & Controls Processing
        const k = state.keys;
        const p = state.player;
        const speed = 4.5;

        if (k['ArrowLeft'] || k['a'] || k['A']) p.vx = -speed;
        else if (k['ArrowRight'] || k['d'] || k['D']) p.vx = speed;
        else p.vx *= 0.8;

        if (k['ArrowUp'] || k['w'] || k['W']) p.vy = -speed;
        else if (k['ArrowDown'] || k['s'] || k['S']) p.vy = speed;
        else p.vy *= 0.8;

        p.x = Math.max(p.size, Math.min(width - p.size, p.x + p.vx));
        p.y = Math.max(p.size, Math.min(height - p.size, p.y + p.vy));

        // Weapon Firing (Spacebar or Action)
        if (p.cooldown > 0) p.cooldown--;
        if ((k[' '] || k['Enter']) && p.cooldown === 0) {
          p.cooldown = 12;
          state.bullets.push({
            x: p.x,
            y: p.y - 15,
            vx: 0,
            vy: -10,
            life: 60,
            color: '#38bdf8'
          });
          if (soundEnabled) sounds.playLaser();
        }

        // Enemy Spawner based on Category
        if (state.frame % Math.max(30, 90 - state.wave * 5) === 0) {
          const ex = 40 + Math.random() * (width - 80);
          const enemyTypes = ['scout', 'fighter', 'tanker'];
          const chosenType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
          const hp = chosenType === 'tanker' ? 5 : (chosenType === 'fighter' ? 3 : 1);
          state.enemies.push({
            x: ex,
            y: -30,
            vx: (Math.random() - 0.5) * 2,
            vy: 1.5 + Math.random() * 2 + state.wave * 0.2,
            hp,
            maxHp: hp,
            size: chosenType === 'tanker' ? 28 : (chosenType === 'fighter' ? 20 : 16),
            color: chosenType === 'tanker' ? '#f43f5e' : (chosenType === 'fighter' ? '#f59e0b' : '#10b981'),
            type: chosenType
          });
        }

        // 3. Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          // Bullet Collision with Enemies
          for (let j = state.enemies.length - 1; j >= 0; j--) {
            const e = state.enemies[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            if (dist < e.size + 6) {
              e.hp--;
              b.life = 0;
              triggerExplosion(b.x, b.y, '#38bdf8', 4);

              if (e.hp <= 0) {
                const pts = e.type === 'tanker' ? 300 : (e.type === 'fighter' ? 150 : 80);
                const awarded = pts * state.multiplier;
                state.score += awarded;
                setScore(state.score);
                if (onScoreUpdate) onScoreUpdate(state.score);
                addFloatingText(e.x, e.y, `+${awarded}`, '#10b981');
                triggerExplosion(e.x, e.y, e.color, 18);
                state.enemies.splice(j, 1);
                if (soundEnabled) sounds.playExplosion();

                // Multiplier increase
                if (state.score > state.wave * 2000) {
                  state.wave++;
                  state.multiplier = Math.min(5, state.multiplier + 1);
                  setMultiplier(state.multiplier);
                  addFloatingText(width / 2, height / 2, `WAVE ${state.wave} MULTIPLIER x${state.multiplier}!`, '#f59e0b');
                  if (soundEnabled) sounds.playPowerup();
                }
              }
              break;
            }
          }

          if (b.life <= 0 || b.y < 0) {
            state.bullets.splice(i, 1);
          }
        }

        // 4. Update Enemies
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const e = state.enemies[i];
          e.x += e.vx;
          e.y += e.vy;

          if (e.x < e.size || e.x > width - e.size) e.vx *= -1;

          // Enemy Collision with Player
          const distToPlayer = Math.hypot(e.x - p.x, e.y - p.y);
          if (distToPlayer < e.size + p.size) {
            state.health -= 25;
            setHealth(Math.max(0, state.health));
            triggerExplosion(p.x, p.y, '#ef4444', 20);
            state.enemies.splice(i, 1);
            if (soundEnabled) sounds.playGameOver();

            if (state.health <= 0) {
              setIsGameOverState(true);
              setIsPlaying(false);
              if (state.score > highScore) {
                setHighScore(state.score);
                localStorage.setItem(`arcadex_highscore_${game.id}`, state.score.toString());
              }
              if (onGameOver) onGameOver(state.score);
              break;
            }
          }

          if (e.y > height + 50) {
            state.enemies.splice(i, 1);
          }
        }

        // 5. Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const pt = state.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vx *= 0.96;
          pt.vy *= 0.96;
          pt.life--;
          if (pt.life <= 0) state.particles.splice(i, 1);
        }

        // 6. Update Floating Text
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y -= 1.2;
          ft.life--;
          if (ft.life <= 0) state.floatingTexts.splice(i, 1);
        }
      }

      // DRAWING PASS

      // Draw Bullets
      for (const b of state.bullets) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Enemies
      for (const e of state.enemies) {
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        if (e.type === 'tanker') {
          ctx.rect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
        } else if (e.type === 'fighter') {
          ctx.moveTo(e.x, e.y + e.size);
          ctx.lineTo(e.x - e.size, e.y - e.size);
          ctx.lineTo(e.x + e.size, e.y - e.size);
          ctx.closePath();
        } else {
          ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Enemy Health Bar
        if (e.maxHp > 1) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(e.x - 15, e.y - e.size - 6, 30, 4);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(e.x - 15, e.y - e.size - 6, (e.hp / e.maxHp) * 30, 4);
        }
      }

      // Draw Particles
      for (const pt of state.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Draw Player Ship / Avatar
      const p = state.player;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      // Futuristic Jet / Tank Chassis
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.8, p.size * 0.8);
      ctx.lineTo(0, p.size * 0.4);
      ctx.lineTo(-p.size * 0.8, p.size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Thruster Flame
      if (isPlaying && !isPaused) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.4, p.size * 0.6);
        ctx.lineTo(0, p.size + (Math.sin(state.frame * 0.5) * 8 + 6));
        ctx.lineTo(p.size * 0.4, p.size * 0.6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Draw Floating Texts
      for (const ft of state.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // Draw HUD Overlays (CRT Scanlines for retro)
      if (game.engineType === 'retro_dos' || game.engineType === 'java_j2me') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 2);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, isGameOverState, game.id, game.category, game.engineType, highScore, onGameOver, onScoreUpdate, soundEnabled]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top HUD Bar */}
      <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>SCORE: {score.toLocaleString()}</span>
          </div>
          {multiplier > 1 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold animate-pulse">
              x{multiplier} MULTIPLIER
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  health > 50 ? 'bg-emerald-500' : health > 25 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
          <span className="text-slate-400">BEST: {highScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Game Screen Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[560px] flex items-center justify-center bg-slate-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Start / Game Over Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30 mb-4 animate-bounce">
              <Crosshair className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2">
              {isGameOverState ? 'MISSION FAILED' : game.title}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mb-6">
              {isGameOverState
                ? `Final Score: ${score.toLocaleString()} points. Ready for another run?`
                : game.description}
            </p>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              {isGameOverState ? 'PLAY AGAIN' : 'START GAME'}
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20">
            <h3 className="text-2xl font-black text-white tracking-widest mb-4">GAME PAUSED</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm"
            >
              RESUME
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Controls Footer */}
      <div className="w-full px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-bold text-slate-300">CONTROLS:</span>
          <span>WASD / Arrows to Move</span>
          <span className="text-slate-600">•</span>
          <span>Space to Fire</span>
          <span className="text-slate-600">•</span>
          <span>P to Pause</span>
        </div>

        <button
          onClick={startGame}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESTART
        </button>
      </div>
    </div>
  );
};
