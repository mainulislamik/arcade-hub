import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Crosshair, RotateCcw, Play, Trophy, Sparkles, Shield, AlertTriangle } from 'lucide-react';

interface StickmanSniperGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  isHostage: boolean;
  isLeader: boolean;
  isDead: boolean;
  alerted: boolean;
  color: string;
}

export const StickmanSniperGame: React.FC<StickmanSniperGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [mission, setMission] = useState(1);
  const [bullets, setBullets] = useState(5);
  const [scopePos, setScopePos] = useState({ x: 400, y: 225 });

  const gameState = useRef<{
    targets: Target[];
    bullets: number;
    score: number;
    mission: number;
    mouse: { x: number; y: number };
    muzzleFlash: number;
    floatingTexts: { x: number; y: number; text: string; color: string; life: number }[];
  }>({
    targets: [],
    bullets: 5,
    score: 0,
    mission: 1,
    mouse: { x: 400, y: 225 },
    muzzleFlash: 0,
    floatingTexts: []
  });

  const spawnMission = useCallback((missionNum: number) => {
    const targets: Target[] = [];
    const count = 3 + missionNum;
    
    // 1 VIP / Leader
    targets.push({
      id: 0,
      x: 200 + Math.random() * 400,
      y: 260 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 1.5,
      isHostage: false,
      isLeader: true,
      isDead: false,
      alerted: false,
      color: '#dc2626'
    });

    // 1 Innocent Civilian / Hostage
    if (missionNum >= 2) {
      targets.push({
        id: 1,
        x: 250 + Math.random() * 300,
        y: 260 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.8,
        isHostage: true,
        isLeader: false,
        isDead: false,
        alerted: false,
        color: '#22c55e'
      });
    }

    // Terrorist Henchmen
    for (let i = targets.length; i < count; i++) {
      targets.push({
        id: i,
        x: 100 + Math.random() * 600,
        y: 240 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 2,
        isHostage: false,
        isLeader: false,
        isDead: false,
        alerted: false,
        color: '#f97316'
      });
    }

    gameState.current.targets = targets;
    gameState.current.bullets = Math.max(3, count - 1);
    setBullets(gameState.current.bullets);
    setMission(missionNum);
    sounds.announceVoice(`MISSION ${missionNum}`);
  }, []);

  const startGame = () => {
    gameState.current.score = 0;
    gameState.current.mission = 1;
    gameState.current.floatingTexts = [];
    setScore(0);
    setMission(1);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnMission(1);
    sounds.playVictory();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    gameState.current.mouse = { x, y };
    setScopePos({ x, y });
  };

  const handleMouseDown = () => {
    if (!isPlaying || isGameOver) return;
    const state = gameState.current;
    if (state.bullets <= 0) return;

    state.bullets--;
    state.muzzleFlash = 10;
    setBullets(state.bullets);
    sounds.playLaser();

    // Raycast hit check on scope center
    const hitRadius = 18;
    let hitFound = false;

    for (let target of state.targets) {
      if (target.isDead) continue;

      const headDist = Math.hypot(state.mouse.x - target.x, state.mouse.y - (target.y - 35));
      const bodyDist = Math.hypot(state.mouse.x - target.x, state.mouse.y - (target.y - 15));

      if (headDist < hitRadius || bodyDist < hitRadius) {
        hitFound = true;
        target.isDead = true;

        if (target.isHostage) {
          // Civilian Casualty! Game Over
          state.floatingTexts.push({
            x: target.x,
            y: target.y - 50,
            text: 'CIVILIAN CASUALTY! FAILED',
            color: '#ef4444',
            life: 35
          });
          sounds.playExplosion();
          setIsGameOver(true);
          sounds.playGameOver();
          onGameOver?.(state.score);
          return;
        } else {
          const isHeadshot = headDist < 12;
          const pts = (target.isLeader ? 500 : 200) * (isHeadshot ? 2 : 1);
          state.score += pts;
          setScore(state.score);
          onScoreUpdate?.(state.score);

          if (isHeadshot) {
            sounds.announceVoice('HEADSHOT!');
          }

          state.floatingTexts.push({
            x: target.x,
            y: target.y - 50,
            text: isHeadshot ? `HEADSHOT! +${pts}` : `ELIMINATED +${pts}`,
            color: isHeadshot ? '#fbbf24' : '#38bdf8',
            life: 30
          });
          break;
        }
      }
    }

    // Check remaining enemies
    const remainingEnemies = state.targets.filter(t => !t.isHostage && !t.isDead);
    if (remainingEnemies.length === 0) {
      state.score += 1000;
      setScore(state.score);
      sounds.playVictory();
      setTimeout(() => spawnMission(state.mission + 1), 1000);
    } else if (state.bullets <= 0 && remainingEnemies.length > 0) {
      // Out of Ammo!
      setIsGameOver(true);
      sounds.playGameOver();
      onGameOver?.(state.score);
    }
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

      // Update Targets
      state.targets.forEach(t => {
        if (t.isDead) return;
        t.x += t.vx;
        if (t.x < 100 || t.x > 700) t.vx *= -1;
      });

      // Update Floating texts
      state.floatingTexts = state.floatingTexts.filter(f => {
        f.y -= 1;
        f.life--;
        return f.life > 0;
      });

      if (state.muzzleFlash > 0) state.muzzleFlash--;

      // --- RENDER ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rooftop / City Night Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.7, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant Buildings with Lit Windows
      ctx.fillStyle = '#1e1b4b';
      for (let i = 0; i < 8; i++) {
        const bx = 60 + i * 90;
        ctx.fillRect(bx, 180, 75, 270);
        // Windows
        ctx.fillStyle = '#fef08a';
        for (let wy = 200; wy < 400; wy += 25) {
          if ((i + wy) % 3 === 0) {
            ctx.fillRect(bx + 15, wy, 12, 12);
            ctx.fillRect(bx + 45, wy, 12, 12);
          }
        }
        ctx.fillStyle = '#1e1b4b';
      }

      // Draw Stickmen Targets
      state.targets.forEach(t => {
        if (t.isDead) {
          // Fallen Stickman
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
          ctx.moveTo(t.x - 6, t.y);
          ctx.lineTo(t.x - 25, t.y);
          ctx.stroke();
          return;
        }

        ctx.strokeStyle = t.color;
        ctx.fillStyle = t.color;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(t.x, t.y - 35, 7, 0, Math.PI * 2);
        ctx.fill();

        // Spine
        ctx.beginPath();
        ctx.moveTo(t.x, t.y - 28);
        ctx.lineTo(t.x, t.y - 10);
        ctx.stroke();

        // Arms (holding weapon if enemy)
        ctx.beginPath();
        ctx.moveTo(t.x, t.y - 22);
        ctx.lineTo(t.x + (t.vx > 0 ? 12 : -12), t.y - 18);
        ctx.stroke();

        // Legs (Walking)
        const walkPhase = Math.sin(Date.now() * 0.015) * 8;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y - 10);
        ctx.lineTo(t.x + walkPhase, t.y);
        ctx.moveTo(t.x, t.y - 10);
        ctx.lineTo(t.x - walkPhase, t.y);
        ctx.stroke();

        // Leader Crown / Hostage Hands Up
        if (t.isLeader) {
          ctx.fillStyle = '#eab308';
          ctx.font = 'bold 12px "Inter"';
          ctx.fillText('👑 TARGET', t.x - 26, t.y - 48);
        } else if (t.isHostage) {
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 10px "Inter"';
          ctx.fillText('CIVILIAN', t.x - 20, t.y - 48);
        }
      });

      // Muzzle Flash
      if (state.muzzleFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.muzzleFlash * 0.08})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Sniper Scope Vignette Overlay
      const mx = state.mouse.x;
      const my = state.mouse.y;

      ctx.save();
      // Darkened outer area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.arc(mx, my, 120, 0, Math.PI * 2, true);
      ctx.fill();

      // Scope Crosshair Lines
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Circle Reticle
      ctx.arc(mx, my, 120, 0, Math.PI * 2);
      ctx.stroke();

      // Milliradian crosshairs
      ctx.beginPath();
      ctx.moveTo(mx - 120, my);
      ctx.lineTo(mx + 120, my);
      ctx.moveTo(mx, my - 120);
      ctx.lineTo(mx, my + 120);
      ctx.stroke();

      // Rangefinder ticks
      for (let offset = -80; offset <= 80; offset += 20) {
        if (offset === 0) continue;
        ctx.beginPath();
        ctx.moveTo(mx + offset, my - 5);
        ctx.lineTo(mx + offset, my + 5);
        ctx.moveTo(mx - 5, my + offset);
        ctx.lineTo(mx + 5, my + offset);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Floating Damage Texts
      state.floatingTexts.forEach(f => {
        ctx.fillStyle = f.color;
        ctx.font = 'bold 15px "Inter", sans-serif';
        ctx.fillText(f.text, f.x, f.y);
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, onGameOver, onScoreUpdate, spawnMission]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        {/* Bullet Ammo Counter */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Crosshair className="w-4 h-4 text-rose-400" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-6 rounded-sm border ${
                  idx < bullets 
                    ? 'bg-amber-400 border-amber-500 shadow-sm shadow-amber-400/50' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-white ml-1">{bullets} AMMO</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="px-3 py-1 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs font-mono font-bold">
            MISSION {mission}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Score</div>
            <div className="text-xl font-black text-white font-mono">{score}</div>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        className="w-full h-full max-w-[800px] max-h-[450px] object-contain rounded-xl shadow-2xl cursor-none"
      />

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xl mb-4 animate-bounce">
            <Crosshair className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            {isGameOver ? 'OPERATION COMPROMISED' : 'STICKMAN TACTICAL SNIPER'}
          </h2>

          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            {isGameOver 
              ? `You completed ${mission - 1} missions with a final score of ${score}!`
              : 'Eliminate terrorist targets and VIP leaders. Do NOT shoot the green civilians!'}
          </p>

          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            {isGameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isGameOver ? 'RETRY MISSION' : 'START BRIEFING'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
