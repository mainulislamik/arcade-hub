import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Shield, Swords, RotateCcw, Play, Trophy, Sparkles, Coins, Zap } from 'lucide-react';

interface StickmanWarriorsGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

type UnitType = 'swordsman' | 'archer' | 'mage' | 'giant';

interface Unit {
  id: number;
  type: UnitType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  range: number;
  attackCooldown: number;
  isPlayer: boolean;
  color: string;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  color: string;
}

export const StickmanWarriorsGame: React.FC<StickmanWarriorsGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [gold, setGold] = useState(100);
  const [playerBaseHp, setPlayerBaseHp] = useState(1000);
  const [enemyBaseHp, setEnemyBaseHp] = useState(1000);
  const [score, setScore] = useState(0);

  const gameState = useRef<{
    playerUnits: Unit[];
    enemyUnits: Unit[];
    projectiles: Projectile[];
    gold: number;
    playerBaseHp: number;
    enemyBaseHp: number;
    score: number;
    enemySpawnTimer: number;
    floatingTexts: { x: number; y: number; text: string; color: string; life: number }[];
  }>({
    playerUnits: [],
    enemyUnits: [],
    projectiles: [],
    gold: 100,
    playerBaseHp: 1000,
    enemyBaseHp: 1000,
    score: 0,
    enemySpawnTimer: 120,
    floatingTexts: []
  });

  const startGame = () => {
    gameState.current = {
      playerUnits: [],
      enemyUnits: [],
      projectiles: [],
      gold: 120,
      playerBaseHp: 1000,
      enemyBaseHp: 1000,
      score: 0,
      enemySpawnTimer: 120,
      floatingTexts: []
    };
    setGold(120);
    setPlayerBaseHp(1000);
    setEnemyBaseHp(1000);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPlaying(true);
    sounds.playVictory();
  };

  const spawnUnit = (type: UnitType) => {
    const costs: { [k in UnitType]: number } = {
      swordsman: 30,
      archer: 50,
      mage: 80,
      giant: 150
    };

    const cost = costs[type];
    if (gameState.current.gold < cost) {
      sounds.playLaser();
      return;
    }

    gameState.current.gold -= cost;
    setGold(gameState.current.gold);
    sounds.playClick();

    const unitProps: { [k in UnitType]: { hp: number; dmg: number; spd: number; rng: number; col: string } } = {
      swordsman: { hp: 120, dmg: 18, spd: 1.8, rng: 30, col: '#3b82f6' },
      archer: { hp: 70, dmg: 14, spd: 1.4, rng: 180, col: '#10b981' },
      mage: { hp: 60, dmg: 35, spd: 1.2, rng: 150, col: '#8b5cf6' },
      giant: { hp: 450, dmg: 40, spd: 0.8, rng: 40, col: '#f59e0b' }
    };

    const p = unitProps[type];
    gameState.current.playerUnits.push({
      id: Math.random(),
      type,
      x: 100,
      y: 360,
      health: p.hp,
      maxHealth: p.hp,
      damage: p.dmg,
      speed: p.spd,
      range: p.rng,
      attackCooldown: 0,
      isPlayer: true,
      color: p.col
    });
  };

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameState.current;

      // Passive Gold Income
      state.gold += 0.12;
      setGold(Math.floor(state.gold));

      // AI Enemy Spawner
      state.enemySpawnTimer--;
      if (state.enemySpawnTimer <= 0) {
        state.enemySpawnTimer = 100 + Math.random() * 80;
        const enemyTypes: UnitType[] = ['swordsman', 'archer', 'mage', 'giant'];
        const rType = enemyTypes[Math.floor(Math.random() * (state.score > 1000 ? 4 : 3))];

        const unitProps: { [k in UnitType]: { hp: number; dmg: number; spd: number; rng: number; col: string } } = {
          swordsman: { hp: 110, dmg: 15, spd: 1.6, rng: 30, col: '#ef4444' },
          archer: { hp: 65, dmg: 12, spd: 1.3, rng: 180, col: '#f97316' },
          mage: { hp: 55, dmg: 30, spd: 1.1, rng: 150, col: '#ec4899' },
          giant: { hp: 400, dmg: 35, spd: 0.7, rng: 40, col: '#dc2626' }
        };

        const ep = unitProps[rType];
        state.enemyUnits.push({
          id: Math.random(),
          type: rType,
          x: 700,
          y: 360,
          health: ep.hp,
          maxHealth: ep.hp,
          damage: ep.dmg,
          speed: ep.spd,
          range: ep.rng,
          attackCooldown: 0,
          isPlayer: false,
          color: ep.col
        });
      }

      // Update Player Units
      state.playerUnits.forEach(u => {
        if (u.attackCooldown > 0) u.attackCooldown--;

        // Check nearest enemy unit or enemy base
        let target: Unit | null = null;
        let minDist = 9999;

        state.enemyUnits.forEach(e => {
          const dist = e.x - u.x;
          if (dist > 0 && dist < minDist) {
            minDist = dist;
            target = e;
          }
        });

        const distToBase = 720 - u.x;

        // Attack enemy unit
        if (target && minDist <= u.range) {
          if (u.attackCooldown <= 0) {
            u.attackCooldown = 40;
            if (u.type === 'archer' || u.type === 'mage') {
              // Shoot Projectile
              state.projectiles.push({
                x: u.x + 10,
                y: u.y - 25,
                vx: 6,
                vy: -0.5,
                damage: u.damage,
                isPlayer: true,
                color: u.color
              });
            } else {
              // Melee Attack
              (target as Unit).health -= u.damage;
              sounds.playShoot();
            }
          }
        }
        // Attack enemy base
        else if (distToBase <= u.range) {
          if (u.attackCooldown <= 0) {
            u.attackCooldown = 45;
            state.enemyBaseHp = Math.max(0, state.enemyBaseHp - u.damage);
            setEnemyBaseHp(state.enemyBaseHp);
            sounds.playExplosion();

            if (state.enemyBaseHp <= 0) {
              setIsGameOver(true);
              setIsVictory(true);
              sounds.playVictory();
              state.score += 2000;
              setScore(state.score);
              onGameOver?.(state.score);
            }
          }
        }
        // Move forward
        else {
          u.x += u.speed;
        }
      });

      // Update Enemy Units
      state.enemyUnits.forEach(eu => {
        if (eu.attackCooldown > 0) eu.attackCooldown--;

        let target: Unit | null = null;
        let minDist = 9999;

        state.playerUnits.forEach(p => {
          const dist = eu.x - p.x;
          if (dist > 0 && dist < minDist) {
            minDist = dist;
            target = p;
          }
        });

        const distToPlayerBase = eu.x - 80;

        if (target && minDist <= eu.range) {
          if (eu.attackCooldown <= 0) {
            eu.attackCooldown = 40;
            if (eu.type === 'archer' || eu.type === 'mage') {
              state.projectiles.push({
                x: eu.x - 10,
                y: eu.y - 25,
                vx: -6,
                vy: -0.5,
                damage: eu.damage,
                isPlayer: false,
                color: eu.color
              });
            } else {
              (target as Unit).health -= eu.damage;
              sounds.playShoot();
            }
          }
        } else if (distToPlayerBase <= eu.range) {
          if (eu.attackCooldown <= 0) {
            eu.attackCooldown = 45;
            state.playerBaseHp = Math.max(0, state.playerBaseHp - eu.damage);
            setPlayerBaseHp(state.playerBaseHp);
            sounds.playExplosion();

            if (state.playerBaseHp <= 0) {
              setIsGameOver(true);
              setIsVictory(false);
              sounds.playGameOver();
              onGameOver?.(state.score);
            }
          }
        } else {
          eu.x -= eu.speed;
        }
      });

      // Update Projectiles
      state.projectiles = state.projectiles.filter(proj => {
        proj.x += proj.vx;
        proj.y += proj.vy;

        if (proj.isPlayer) {
          for (let e of state.enemyUnits) {
            if (Math.hypot(proj.x - e.x, proj.y - (e.y - 25)) < 20) {
              e.health -= proj.damage;
              sounds.playShoot();
              return false;
            }
          }
        } else {
          for (let p of state.playerUnits) {
            if (Math.hypot(proj.x - p.x, proj.y - (p.y - 25)) < 20) {
              p.health -= proj.damage;
              sounds.playShoot();
              return false;
            }
          }
        }

        return proj.x > 0 && proj.x < canvas.width;
      });

      // Clean Dead Units
      state.playerUnits = state.playerUnits.filter(u => u.health > 0);
      state.enemyUnits = state.enemyUnits.filter(eu => {
        if (eu.health <= 0) {
          state.score += 80;
          state.gold += 15;
          setScore(state.score);
          setGold(Math.floor(state.gold));
          onScoreUpdate?.(state.score);
          return false;
        }
        return true;
      });

      // --- RENDER PASS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Battlefield Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0c0a09');
      skyGrad.addColorStop(0.7, '#1c1917');
      skyGrad.addColorStop(1, '#292524');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Castles (Player Left, Enemy Right)
      // Player Fortress
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(20, 240, 70, 130);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(30, 220, 50, 20);

      // Enemy Fortress
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(710, 240, 70, 130);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(720, 220, 50, 20);

      // Ground
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 370, canvas.width, canvas.height - 370);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(0, 370, canvas.width, 3);

      // Draw Stickman Unit
      const renderUnit = (u: Unit) => {
        const isGiant = u.type === 'giant';
        const sizeScale = isGiant ? 1.6 : 1;
        const headY = u.y - 35 * sizeScale;

        ctx.strokeStyle = u.color;
        ctx.fillStyle = u.color;
        ctx.lineWidth = 3.5 * sizeScale;
        ctx.lineCap = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(u.x, headY, 6 * sizeScale, 0, Math.PI * 2);
        ctx.fill();

        // Spine
        ctx.beginPath();
        ctx.moveTo(u.x, headY + 6 * sizeScale);
        ctx.lineTo(u.x, u.y - 12 * sizeScale);
        ctx.stroke();

        // Weapon
        ctx.beginPath();
        const sign = u.isPlayer ? 1 : -1;
        if (u.type === 'swordsman' || u.type === 'giant') {
          ctx.moveTo(u.x, u.y - 20 * sizeScale);
          ctx.lineTo(u.x + sign * 16 * sizeScale, u.y - 28 * sizeScale);
        } else if (u.type === 'archer') {
          ctx.arc(u.x + sign * 8, u.y - 22 * sizeScale, 10, -Math.PI / 3, Math.PI / 3);
        } else if (u.type === 'mage') {
          // Mage glowing staff
          ctx.moveTo(u.x, u.y);
          ctx.lineTo(u.x + sign * 8, u.y - 35 * sizeScale);
        }
        ctx.stroke();

        // Legs
        const legWalk = Math.sin(Date.now() * 0.015 + u.id) * 8;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y - 12 * sizeScale);
        ctx.lineTo(u.x + legWalk, u.y);
        ctx.moveTo(u.x, u.y - 12 * sizeScale);
        ctx.lineTo(u.x - legWalk, u.y);
        ctx.stroke();

        // Health Bar
        const barW = 24 * sizeScale;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(u.x - barW / 2, u.y - 48 * sizeScale, barW, 4);
        ctx.fillStyle = u.color;
        ctx.fillRect(u.x - barW / 2, u.y - 48 * sizeScale, barW * (u.health / u.maxHealth), 4);
      };

      state.playerUnits.forEach(renderUnit);
      state.enemyUnits.forEach(renderUnit);

      // Draw Projectiles
      state.projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, onGameOver, onScoreUpdate]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Top HUD: Castles HP & Gold */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        {/* Player Fortress HP */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <div className="w-32 bg-slate-900/80 rounded-full h-3 p-0.5 border border-blue-600 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${(playerBaseHp / 1000) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-300">{playerBaseHp}</span>
        </div>

        {/* Gold Counter */}
        <div className="flex items-center gap-1.5 bg-amber-950/80 px-4 py-1 rounded-xl border border-amber-500/50 text-amber-300 font-mono font-bold text-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>{gold} GOLD</span>
        </div>

        {/* Enemy Fortress HP */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-red-300">{enemyBaseHp}</span>
          <div className="w-32 bg-slate-900/80 rounded-full h-3 p-0.5 border border-red-600 overflow-hidden">
            <div 
              className="bg-red-500 h-full rounded-full transition-all"
              style={{ width: `${(enemyBaseHp / 1000) * 100}%` }}
            />
          </div>
          <Shield className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full max-w-[800px] max-h-[450px] object-contain rounded-xl shadow-2xl"
      />

      {/* Bottom Army Summoner Bar */}
      {isPlaying && !isGameOver && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm z-10">
          <button
            onClick={() => spawnUnit('swordsman')}
            disabled={gold < 30}
            className={`px-3 py-1.5 rounded-xl flex flex-col items-center transition-all ${
              gold >= 30 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 opacity-50'
            }`}
          >
            <span className="text-xs font-bold">⚔️ Swordsman</span>
            <span className="text-[10px] font-mono text-amber-300">30 Gold</span>
          </button>

          <button
            onClick={() => spawnUnit('archer')}
            disabled={gold < 50}
            className={`px-3 py-1.5 rounded-xl flex flex-col items-center transition-all ${
              gold >= 50 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 opacity-50'
            }`}
          >
            <span className="text-xs font-bold">🏹 Archer</span>
            <span className="text-[10px] font-mono text-amber-300">50 Gold</span>
          </button>

          <button
            onClick={() => spawnUnit('mage')}
            disabled={gold < 80}
            className={`px-3 py-1.5 rounded-xl flex flex-col items-center transition-all ${
              gold >= 80 ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-slate-800 text-slate-500 opacity-50'
            }`}
          >
            <span className="text-xs font-bold">🔮 Mage</span>
            <span className="text-[10px] font-mono text-amber-300">80 Gold</span>
          </button>

          <button
            onClick={() => spawnUnit('giant')}
            disabled={gold < 150}
            className={`px-3 py-1.5 rounded-xl flex flex-col items-center transition-all ${
              gold >= 150 ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 opacity-50'
            }`}
          >
            <span className="text-xs font-bold">🛡️ Giant Golem</span>
            <span className="text-[10px] font-mono text-amber-300">150 Gold</span>
          </button>
        </div>
      )}

      {/* Start / Game Over Overlay */}
      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white shadow-xl mb-4 animate-bounce">
            <Swords className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            {isGameOver 
              ? (isVictory ? 'CASTLE SIEGE VICTORY!' : 'FORTRESS DESTROYED') 
              : 'STICKMAN CASTLE ARMY: EPIC WAR'}
          </h2>

          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            {isGameOver 
              ? (isVictory ? `Splendid triumph! Enemy stronghold conquered with score ${score}!` : 'Your fortress fell under heavy siege!')
              : 'Manage gold economy, recruit swordsmen, archers, battle mages, and colossal giants to destroy the enemy citadel!'}
          </p>

          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            {isGameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isGameOver ? 'FIGHT AGAIN' : 'START CAMPAIGN'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
