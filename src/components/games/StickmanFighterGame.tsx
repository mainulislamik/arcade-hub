import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Swords, Shield, Zap, RotateCcw, Play, Trophy, Sparkles, Heart } from 'lucide-react';

interface StickmanFighterGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

interface Fighter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  isGrounded: boolean;
  state: 'idle' | 'run' | 'jump' | 'punch' | 'kick' | 'slash' | 'hit' | 'block' | 'dead';
  facing: 'left' | 'right';
  animTimer: number;
  comboStep: number;
  isAttacking: boolean;
  attackHitbox: { x: number; y: number; w: number; h: number } | null;
  color: string;
  isPlayer: boolean;
  aiCooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export const StickmanFighterGame: React.FC<StickmanFighterGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [combo, setCombo] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [specialEnergy, setSpecialEnergy] = useState(100);

  const gameState = useRef<{
    player: Fighter;
    enemies: Fighter[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    keys: { [key: string]: boolean };
    score: number;
    wave: number;
    combo: number;
    specialEnergy: number;
    screenShake: number;
  }>({
    player: {
      x: 200,
      y: 350,
      vx: 0,
      vy: 0,
      health: 100,
      maxHealth: 100,
      isGrounded: true,
      state: 'idle',
      facing: 'right',
      animTimer: 0,
      comboStep: 0,
      isAttacking: false,
      attackHitbox: null,
      color: '#6366f1',
      isPlayer: true,
      aiCooldown: 0
    },
    enemies: [],
    particles: [],
    floatingTexts: [],
    keys: {},
    score: 0,
    wave: 1,
    combo: 0,
    specialEnergy: 100,
    screenShake: 0
  });

  const spawnWave = useCallback((waveNum: number) => {
    const enemyCount = Math.min(2 + waveNum, 6);
    const enemies: Fighter[] = [];
    const enemyColors = ['#ef4444', '#f97316', '#eab308', '#a855f7', '#ec4899'];
    
    for (let i = 0; i < enemyCount; i++) {
      const isRight = i % 2 === 0;
      enemies.push({
        x: isRight ? 700 + i * 80 : 100 - i * 80,
        y: 350,
        vx: 0,
        vy: 0,
        health: 40 + waveNum * 15,
        maxHealth: 40 + waveNum * 15,
        isGrounded: true,
        state: 'idle',
        facing: isRight ? 'left' : 'right',
        animTimer: 0,
        comboStep: 0,
        isAttacking: false,
        attackHitbox: null,
        color: enemyColors[i % enemyColors.length],
        isPlayer: false,
        aiCooldown: 30 + Math.random() * 40
      });
    }
    gameState.current.enemies = enemies;
    setWave(waveNum);
    sounds.announceVoice(`WAVE ${waveNum}!`);
  }, []);

  const startGame = () => {
    gameState.current = {
      player: {
        x: 300,
        y: 350,
        vx: 0,
        vy: 0,
        health: 100,
        maxHealth: 100,
        isGrounded: true,
        state: 'idle',
        facing: 'right',
        animTimer: 0,
        comboStep: 0,
        isAttacking: false,
        attackHitbox: null,
        color: '#6366f1',
        isPlayer: true,
        aiCooldown: 0
      },
      enemies: [],
      particles: [],
      floatingTexts: [],
      keys: {},
      score: 0,
      wave: 1,
      combo: 0,
      specialEnergy: 100,
      screenShake: 0
    };
    setScore(0);
    setWave(1);
    setCombo(0);
    setPlayerHp(100);
    setSpecialEnergy(100);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnWave(1);
    sounds.playVictory();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      gameState.current.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      const player = gameState.current.player;
      if (player.state === 'dead' || player.state === 'hit') return;

      // J: Punch / Light Combo
      if (e.key.toLowerCase() === 'j') {
        if (!player.isAttacking) {
          player.isAttacking = true;
          player.state = 'punch';
          player.animTimer = 12;
          player.comboStep = (player.comboStep % 3) + 1;
          player.vx = player.facing === 'right' ? 4 : -4;
          sounds.playShoot();
        }
      }
      // K: Kick / Heavy Slash
      else if (e.key.toLowerCase() === 'k') {
        if (!player.isAttacking) {
          player.isAttacking = true;
          player.state = 'kick';
          player.animTimer = 16;
          player.vx = player.facing === 'right' ? 6 : -6;
          sounds.playLaser();
        }
      }
      // L: Special Dragon Slash (costs 50 Energy)
      else if (e.key.toLowerCase() === 'l' && gameState.current.specialEnergy >= 50) {
        player.isAttacking = true;
        player.state = 'slash';
        player.animTimer = 22;
        gameState.current.specialEnergy = Math.max(0, gameState.current.specialEnergy - 50);
        setSpecialEnergy(gameState.current.specialEnergy);
        gameState.current.screenShake = 15;
        sounds.playExplosion();
        sounds.announceVoice('DRAGON SLASH!');
        
        // Spawn energetic particles
        for (let i = 0; i < 30; i++) {
          gameState.current.particles.push({
            x: player.x + (player.facing === 'right' ? 40 : -40),
            y: player.y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 25,
            maxLife: 25,
            color: '#38bdf8',
            size: 4 + Math.random() * 5
          });
        }
      }
      // Space / W / Up: Jump
      else if ((e.key.toLowerCase() === 'w' || e.key === ' ' || e.key === 'ArrowUp') && player.isGrounded) {
        player.vy = -13;
        player.isGrounded = false;
        player.state = 'jump';
        sounds.playJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameState.current;
      const player = state.player;

      // Screen Shake
      if (state.screenShake > 0) {
        state.screenShake *= 0.85;
        if (state.screenShake < 0.5) state.screenShake = 0;
      }

      // Physics & Player Movement
      const GRAVITY = 0.65;
      const FLOOR_Y = 360;

      // Controls
      if (player.state !== 'dead' && player.state !== 'hit' && !player.isAttacking) {
        if (state.keys['a'] || state.keys['arrowleft']) {
          player.vx = -5;
          player.facing = 'left';
          if (player.isGrounded) player.state = 'run';
        } else if (state.keys['d'] || state.keys['arrowright']) {
          player.vx = 5;
          player.facing = 'right';
          if (player.isGrounded) player.state = 'run';
        } else {
          player.vx *= 0.7;
          if (player.isGrounded) player.state = 'idle';
        }
      }

      // Apply Gravity
      player.vy += GRAVITY;
      player.x += player.vx;
      player.y += player.vy;

      if (player.y >= FLOOR_Y) {
        player.y = FLOOR_Y;
        player.vy = 0;
        player.isGrounded = true;
      }
      player.x = Math.max(50, Math.min(750, player.x));

      // Player Attack Animation & Hitbox
      if (player.isAttacking) {
        player.animTimer--;
        const hitRange = player.state === 'slash' ? 85 : player.state === 'kick' ? 55 : 45;
        player.attackHitbox = {
          x: player.facing === 'right' ? player.x : player.x - hitRange,
          y: player.y - 40,
          w: hitRange,
          h: 50
        };

        // Check Hit on Enemies
        if (player.attackHitbox) {
          state.enemies.forEach((enemy) => {
            if (enemy.health > 0 && enemy.state !== 'dead') {
              const enemyBox = { x: enemy.x - 20, y: enemy.y - 50, w: 40, h: 60 };
              const isColliding =
                player.attackHitbox!.x < enemyBox.x + enemyBox.w &&
                player.attackHitbox!.x + player.attackHitbox!.w > enemyBox.x &&
                player.attackHitbox!.y < enemyBox.y + enemyBox.h &&
                player.attackHitbox!.y + player.attackHitbox!.h > enemyBox.y;

              if (isColliding && enemy.animTimer <= 0) {
                const dmg = player.state === 'slash' ? 60 : player.state === 'kick' ? 30 : 20;
                enemy.health -= dmg;
                enemy.animTimer = 15;
                enemy.state = enemy.health <= 0 ? 'dead' : 'hit';
                enemy.vx = player.facing === 'right' ? 8 : -8;
                enemy.vy = -4;

                state.score += dmg * 2;
                state.combo++;
                state.specialEnergy = Math.min(100, state.specialEnergy + 12);
                state.screenShake = dmg > 30 ? 10 : 4;
                setScore(state.score);
                setCombo(state.combo);
                setSpecialEnergy(state.specialEnergy);
                onScoreUpdate?.(state.score);

                // Blood/Spark Particles
                for (let p = 0; p < 12; p++) {
                  state.particles.push({
                    x: enemy.x,
                    y: enemy.y - 30,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 2,
                    life: 20,
                    maxLife: 20,
                    color: player.state === 'slash' ? '#38bdf8' : '#ef4444',
                    size: 2 + Math.random() * 3
                  });
                }

                state.floatingTexts.push({
                  x: enemy.x,
                  y: enemy.y - 50,
                  text: `-${dmg}`,
                  color: player.state === 'slash' ? '#38bdf8' : '#fbbf24',
                  life: 25
                });

                if (state.combo >= 3) {
                  sounds.announceCombo(state.combo);
                }
              }
            }
          });
        }

        if (player.animTimer <= 0) {
          player.isAttacking = false;
          player.attackHitbox = null;
          player.state = 'idle';
        }
      }

      // Update Enemies AI
      state.enemies.forEach((enemy) => {
        if (enemy.health <= 0) {
          enemy.state = 'dead';
          return;
        }

        enemy.vy += GRAVITY;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.vx *= 0.85;

        if (enemy.y >= FLOOR_Y) {
          enemy.y = FLOOR_Y;
          enemy.vy = 0;
          enemy.isGrounded = true;
        }

        if (enemy.animTimer > 0) {
          enemy.animTimer--;
          return;
        }

        // AI Move towards Player
        const distToPlayer = player.x - enemy.x;
        enemy.facing = distToPlayer > 0 ? 'right' : 'left';

        if (Math.abs(distToPlayer) > 50) {
          enemy.vx = distToPlayer > 0 ? 2.5 : -2.5;
          enemy.state = 'run';
        } else {
          enemy.state = 'idle';
          enemy.aiCooldown--;

          // Enemy Attack
          if (enemy.aiCooldown <= 0 && player.state !== 'dead') {
            enemy.aiCooldown = 45 + Math.random() * 30;
            enemy.state = 'punch';
            enemy.animTimer = 15;

            // Damage Player
            player.health = Math.max(0, player.health - 12);
            setPlayerHp(player.health);
            state.screenShake = 8;
            player.state = player.health <= 0 ? 'dead' : 'hit';
            player.animTimer = 10;
            player.vx = enemy.facing === 'right' ? 6 : -6;
            state.combo = 0;
            setCombo(0);
            sounds.playExplosion();

            state.floatingTexts.push({
              x: player.x,
              y: player.y - 50,
              text: `-12`,
              color: '#ef4444',
              life: 25
            });

            if (player.health <= 0) {
              setIsGameOver(true);
              sounds.playGameOver();
              onGameOver?.(state.score);
            }
          }
        }
      });

      // Filter Dead Enemies and Spawn Next Wave
      const livingEnemies = state.enemies.filter(e => e.health > 0);
      if (livingEnemies.length === 0 && !isGameOver) {
        state.score += 500 * state.wave;
        setScore(state.score);
        spawnWave(state.wave + 1);
      }

      // Particles & Floating Text
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
      });

      state.floatingTexts = state.floatingTexts.filter(t => {
        t.y -= 1.2;
        t.life--;
        return t.life > 0;
      });

      // Passive Energy Regen
      state.specialEnergy = Math.min(100, state.specialEnergy + 0.15);
      setSpecialEnergy(state.specialEnergy);

      // --- RENDER PASS ---
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * state.screenShake,
          (Math.random() - 0.5) * state.screenShake
        );
      }

      // Cyber Dojo Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.7, '#111827');
      bgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant Dojo Silhouette & Neon Moon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(650, 100, 60, 0, Math.PI * 2);
      ctx.fill();

      // Floor Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(0, FLOOR_Y, canvas.width, 3);

      // Draw Stickman Function
      const drawStickman = (f: Fighter) => {
        if (f.state === 'dead') {
          // Fallen Ragdoll
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(f.x, f.y - 10, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(f.x - 10, f.y - 8);
          ctx.lineTo(f.x - 35, f.y - 5);
          ctx.stroke();
          return;
        }

        ctx.strokeStyle = f.color;
        ctx.fillStyle = f.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const headY = f.y - 45;
        const chestY = f.y - 30;
        const hipY = f.y - 15;
        const sign = f.facing === 'right' ? 1 : -1;

        // Head
        ctx.beginPath();
        ctx.arc(f.x, headY, 11, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Eyes for Player
        if (f.isPlayer) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(f.x + sign * 5, headY - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spine
        ctx.beginPath();
        ctx.moveTo(f.x, headY + 11);
        ctx.lineTo(f.x, hipY);
        ctx.stroke();

        // Arms & Weapon Slashing Pose
        ctx.beginPath();
        if (f.state === 'punch') {
          ctx.moveTo(f.x, chestY);
          ctx.lineTo(f.x + sign * 30, chestY - 5);
        } else if (f.state === 'slash') {
          ctx.moveTo(f.x, chestY);
          ctx.lineTo(f.x + sign * 40, chestY - 20);
          // Neon Katana Blade
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 6;
          ctx.moveTo(f.x + sign * 20, chestY - 10);
          ctx.lineTo(f.x + sign * 60, chestY - 35);
        } else {
          ctx.moveTo(f.x, chestY);
          ctx.lineTo(f.x - sign * 12, chestY + 10);
          ctx.moveTo(f.x, chestY);
          ctx.lineTo(f.x + sign * 15, chestY + 12);
        }
        ctx.stroke();

        // Legs (Walking / Kicking)
        ctx.lineWidth = 4;
        ctx.strokeStyle = f.color;
        ctx.beginPath();
        if (f.state === 'kick') {
          ctx.moveTo(f.x, hipY);
          ctx.lineTo(f.x + sign * 35, hipY - 10);
          ctx.moveTo(f.x, hipY);
          ctx.lineTo(f.x - sign * 10, f.y);
        } else if (f.state === 'run') {
          const legPhase = Math.sin(Date.now() * 0.02) * 15;
          ctx.moveTo(f.x, hipY);
          ctx.lineTo(f.x + legPhase, f.y);
          ctx.moveTo(f.x, hipY);
          ctx.lineTo(f.x - legPhase, f.y);
        } else {
          ctx.moveTo(f.x, hipY);
          ctx.lineTo(f.x - 10, f.y);
          ctx.moveTo(f.x, hipY);
          ctx.lineTo(f.x + 10, f.y);
        }
        ctx.stroke();

        // Health Bar above Fighter
        if (!f.isPlayer) {
          const hpW = 35;
          const hpPercent = f.health / f.maxHealth;
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(f.x - hpW / 2, f.y - 65, hpW, 5);
          ctx.fillStyle = f.color;
          ctx.fillRect(f.x - hpW / 2, f.y - 65, hpW * hpPercent, 5);
        }
      };

      // Draw Enemies & Player
      state.enemies.forEach(drawStickman);
      drawStickman(player);

      // Draw Attack Arc Effect
      if (player.isAttacking && player.state === 'slash') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        const sign = player.facing === 'right' ? 1 : -1;
        ctx.arc(player.x + sign * 20, player.y - 30, 45, -0.4, 0.8 * Math.PI, sign < 0);
        ctx.stroke();
      }

      // Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Floating Damage Texts
      state.floatingTexts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillText(t.text, t.x, t.y);
      });

      ctx.restore();
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, onGameOver, onScoreUpdate, spawnWave]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        {/* Player Health & Dragon Energy */}
        <div className="flex flex-col gap-1.5 w-48">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <div className="flex-1 bg-slate-900/80 rounded-full h-3.5 p-0.5 border border-slate-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-500 to-red-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${Math.max(0, playerHp)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-white">{Math.round(playerHp)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
            <div className="flex-1 bg-slate-900/80 rounded-full h-2.5 p-0.5 border border-slate-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-400 to-indigo-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${specialEnergy}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-sky-300">SP [L]</span>
          </div>
        </div>

        {/* Wave & Score & Combo */}
        <div className="flex items-center gap-6">
          {combo > 1 && (
            <div className="text-amber-400 font-black text-lg tracking-wider animate-bounce">
              {combo}x COMBO!
            </div>
          )}
          <div className="px-3 py-1 bg-indigo-950/80 border border-indigo-500/50 rounded-xl text-indigo-300 text-xs font-mono font-bold">
            WAVE {wave}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Score</div>
            <div className="text-xl font-black text-white font-mono">{score}</div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full max-w-[800px] max-h-[450px] object-contain rounded-xl shadow-2xl"
      />

      {/* Start / Game Over Overlay */}
      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4 animate-bounce">
            <Swords className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            {isGameOver ? 'DOJO DEFEAT' : 'STICKMAN SHADOW FIGHTER'}
          </h2>

          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            {isGameOver 
              ? `You survived to Wave ${wave} with a final score of ${score}!`
              : 'Master martial arts combos, dodge enemy swarms, and unleash dragon slashes!'}
          </p>

          <div className="flex items-center gap-3 mb-6 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
            <span>A/D: Move</span> • <span>W/Space: Jump</span> • <span className="text-amber-400 font-bold">J: Punch</span> • <span className="text-amber-400 font-bold">K: Kick</span> • <span className="text-sky-400 font-bold">L: Dragon Slash</span>
          </div>

          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            {isGameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isGameOver ? 'FIGHT AGAIN' : 'START COMBAT'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
