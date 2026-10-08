import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Target, RotateCcw, Play, Trophy, Sparkles, Heart, Wind } from 'lucide-react';

interface StickmanArcherGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  stuck: boolean;
  isPlayer: boolean;
}

interface Archer {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isPlayer: boolean;
  angle: number;
  power: number;
  isAiming: boolean;
  shootCooldown: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const StickmanArcherGame: React.FC<StickmanArcherGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [headshots, setHeadshots] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [windSpeed, setWindSpeed] = useState(0);

  const gameState = useRef<{
    player: Archer;
    enemies: Archer[];
    arrows: Arrow[];
    particles: Particle[];
    floatingTexts: { x: number; y: number; text: string; color: string; life: number }[];
    isDragging: boolean;
    dragStart: { x: number; y: number };
    dragCurrent: { x: number; y: number };
    score: number;
    level: number;
    wind: number;
  }>({
    player: {
      x: 120,
      y: 350,
      health: 100,
      maxHealth: 100,
      isPlayer: true,
      angle: 0,
      power: 0,
      isAiming: false,
      shootCooldown: 0,
      color: '#3b82f6'
    },
    enemies: [],
    arrows: [],
    particles: [],
    floatingTexts: [],
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragCurrent: { x: 0, y: 0 },
    score: 0,
    level: 1,
    wind: 0
  });

  const spawnEnemy = useCallback((lvl: number) => {
    const enemyX = 550 + Math.random() * 180;
    const enemyY = 220 + Math.random() * 150;
    const newWind = (Math.random() - 0.5) * (lvl * 0.4);
    
    gameState.current.enemies = [{
      x: enemyX,
      y: enemyY,
      health: 50 + lvl * 15,
      maxHealth: 50 + lvl * 15,
      isPlayer: false,
      angle: Math.PI + 0.3,
      power: 12,
      isAiming: false,
      shootCooldown: 60 + Math.random() * 40,
      color: '#ef4444'
    }];
    gameState.current.wind = newWind;
    setWindSpeed(Math.round(newWind * 10));
    setLevel(lvl);
  }, []);

  const startGame = () => {
    gameState.current.player = {
      x: 120,
      y: 350,
      health: 100,
      maxHealth: 100,
      isPlayer: true,
      angle: 0,
      power: 0,
      isAiming: false,
      shootCooldown: 0,
      color: '#3b82f6'
    };
    gameState.current.arrows = [];
    gameState.current.particles = [];
    gameState.current.floatingTexts = [];
    gameState.current.score = 0;
    gameState.current.level = 1;
    setScore(0);
    setLevel(1);
    setHeadshots(0);
    setPlayerHp(100);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnEnemy(1);
    sounds.playVictory();
  };

  // Mouse & Touch Controls for Bow Aiming
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    gameState.current.isDragging = true;
    gameState.current.dragStart = { x, y };
    gameState.current.dragCurrent = { x, y };
    gameState.current.player.isAiming = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    gameState.current.dragCurrent = { x, y };

    const dx = gameState.current.dragStart.x - x;
    const dy = gameState.current.dragStart.y - y;
    gameState.current.player.angle = Math.atan2(dy, dx);
    gameState.current.player.power = Math.min(22, Math.hypot(dx, dy) * 0.18);
  };

  const handleMouseUp = () => {
    if (!gameState.current.isDragging) return;
    gameState.current.isDragging = false;
    gameState.current.player.isAiming = false;

    const { player } = gameState.current;
    if (player.power > 3) {
      // Release Arrow
      gameState.current.arrows.push({
        x: player.x + Math.cos(player.angle) * 30,
        y: player.y - 30 + Math.sin(player.angle) * 30,
        vx: Math.cos(player.angle) * player.power,
        vy: Math.sin(player.angle) * player.power,
        angle: player.angle,
        stuck: false,
        isPlayer: true
      });
      sounds.playShoot();
    }
  };

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
      const { player, enemies, arrows, wind } = state;
      const GRAVITY = 0.28;

      // Update Arrows
      state.arrows = arrows.filter(arrow => {
        if (arrow.stuck) return true;

        arrow.vx += wind * 0.01;
        arrow.vy += GRAVITY;
        arrow.x += arrow.vx;
        arrow.y += arrow.vy;
        arrow.angle = Math.atan2(arrow.vy, arrow.vx);

        // Ground Collision
        if (arrow.y >= 380) {
          arrow.stuck = true;
          arrow.y = 380;
          return true;
        }

        // Hit Check for Player Arrow vs Enemies
        if (arrow.isPlayer) {
          for (let enemy of enemies) {
            if (enemy.health <= 0) continue;

            // Head Check
            const headDist = Math.hypot(arrow.x - enemy.x, arrow.y - (enemy.y - 50));
            if (headDist < 16) {
              // Headshot!
              arrow.stuck = true;
              enemy.health -= 120;
              state.score += 300;
              setScore(state.score);
              setHeadshots(h => h + 1);
              onScoreUpdate?.(state.score);
              sounds.playLaser();
              sounds.announceVoice('HEADSHOT!');

              state.floatingTexts.push({
                x: enemy.x,
                y: enemy.y - 65,
                text: 'CRITICAL HEADSHOT! -120',
                color: '#f59e0b',
                life: 30
              });
              break;
            }

            // Body Check
            const bodyDist = Math.hypot(arrow.x - enemy.x, arrow.y - (enemy.y - 25));
            if (bodyDist < 25) {
              arrow.stuck = true;
              enemy.health -= 50;
              state.score += 100;
              setScore(state.score);
              onScoreUpdate?.(state.score);
              sounds.playShoot();

              state.floatingTexts.push({
                x: enemy.x,
                y: enemy.y - 45,
                text: 'BODY HIT -50',
                color: '#38bdf8',
                life: 25
              });
              break;
            }
          }
        }
        // Hit Check for Enemy Arrow vs Player
        else {
          const bodyDist = Math.hypot(arrow.x - player.x, arrow.y - (player.y - 25));
          if (bodyDist < 25) {
            arrow.stuck = true;
            player.health = Math.max(0, player.health - 35);
            setPlayerHp(player.health);
            sounds.playExplosion();

            state.floatingTexts.push({
              x: player.x,
              y: player.y - 45,
              text: '-35',
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

        // Out of bounds
        return arrow.x >= 0 && arrow.x <= canvas.width && arrow.y <= canvas.height;
      });

      // Enemy AI Aiming & Shooting
      enemies.forEach(enemy => {
        if (enemy.health <= 0) return;
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 90 + Math.random() * 60;
          
          // Calculate ballistic angle to hit player
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.hypot(dx, dy);
          const aiAngle = Math.PI - 0.45 - (Math.random() - 0.5) * 0.15;
          const aiPower = Math.min(22, dist * 0.035 + Math.random() * 2);

          arrows.push({
            x: enemy.x - 30,
            y: enemy.y - 30,
            vx: -Math.cos(aiAngle) * aiPower,
            vy: -Math.sin(aiAngle) * aiPower,
            angle: aiAngle,
            stuck: false,
            isPlayer: false
          });
          sounds.playLaser();
        }
      });

      // Clear Dead Enemy & Next Level
      const aliveEnemies = enemies.filter(e => e.health > 0);
      if (aliveEnemies.length === 0 && !isGameOver) {
        state.score += 500;
        setScore(state.score);
        sounds.playVictory();
        spawnEnemy(state.level + 1);
      }

      // Update Floating Texts
      state.floatingTexts = state.floatingTexts.filter(t => {
        t.y -= 1;
        t.life--;
        return t.life > 0;
      });

      // --- RENDER ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.7, '#1e293b');
      skyGrad.addColorStop(1, '#334155');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Castles / Pillars
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(80, 320, 80, 80);
      enemies.forEach(e => {
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(e.x - 30, e.y, 60, canvas.height - e.y);
      });

      // Ground
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 380, canvas.width, canvas.height - 380);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 380, canvas.width, 3);

      // Draw Archer Function
      const drawArcher = (a: Archer) => {
        if (a.health <= 0) return;
        ctx.strokeStyle = a.color;
        ctx.fillStyle = a.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(a.x, a.y - 50, 10, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - 40);
        ctx.lineTo(a.x, a.y - 15);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - 15);
        ctx.lineTo(a.x - 10, a.y);
        ctx.moveTo(a.x, a.y - 15);
        ctx.lineTo(a.x + 10, a.y);
        ctx.stroke();

        // Bow & Arms
        const bowRadius = 25;
        const aimAngle = a.isPlayer ? a.angle : Math.PI - 0.4;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(
          a.x + Math.cos(aimAngle) * 15,
          a.y - 35 + Math.sin(aimAngle) * 15,
          bowRadius,
          aimAngle - Math.PI / 2.5,
          aimAngle + Math.PI / 2.5
        );
        ctx.stroke();

        // Health Bar
        const hpW = 40;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(a.x - hpW / 2, a.y - 70, hpW, 5);
        ctx.fillStyle = a.color;
        ctx.fillRect(a.x - hpW / 2, a.y - 70, hpW * (a.health / a.maxHealth), 5);
      };

      drawArcher(player);
      enemies.forEach(drawArcher);

      // Draw Trajectory Prediction Line for Player
      if (player.isAiming && player.power > 3) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        let simX = player.x;
        let simY = player.y - 35;
        let simVx = Math.cos(player.angle) * player.power;
        let simVy = Math.sin(player.angle) * player.power;

        ctx.moveTo(simX, simY);
        for (let step = 0; step < 20; step++) {
          simVx += wind * 0.01;
          simVy += GRAVITY;
          simX += simVx;
          simY += simVy;
          ctx.lineTo(simX, simY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Arrows
      arrows.forEach(arrow => {
        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.angle);
        ctx.strokeStyle = arrow.isPlayer ? '#38bdf8' : '#f87171';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();

        // Arrow Head
        ctx.fillStyle = arrow.isPlayer ? '#38bdf8' : '#f87171';
        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.lineTo(18, 0);
        ctx.lineTo(10, 4);
        ctx.fill();
        ctx.restore();
      });

      // Draw Floating Damage Texts
      state.floatingTexts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillText(t.text, t.x, t.y);
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, onGameOver, onScoreUpdate, spawnEnemy]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <div className="w-36 bg-slate-900/80 rounded-full h-3.5 p-0.5 border border-slate-700 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-rose-500 to-red-500 h-full rounded-full transition-all"
              style={{ width: `${Math.max(0, playerHp)}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{Math.round(playerHp)}</span>
        </div>

        {/* Wind Speed Indicator */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold text-sky-400">
          <Wind className="w-4 h-4" />
          <span>WIND: {windSpeed > 0 ? `+${windSpeed} >` : `${windSpeed} <`}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="px-3 py-1 bg-blue-950/80 border border-blue-500/50 rounded-xl text-blue-300 text-xs font-mono font-bold">
            STAGE {level}
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full max-w-[800px] max-h-[450px] object-contain rounded-xl shadow-2xl cursor-crosshair"
      />

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-xl mb-4 animate-bounce">
            <Target className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            {isGameOver ? 'ARCHER FALLEN' : 'STICKMAN BOWMASTER PRO'}
          </h2>

          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            {isGameOver 
              ? `You defeated ${level - 1} enemy archers with ${headshots} headshots!`
              : 'Drag back to aim and power up your bow. Account for gravity and dynamic crosswinds!'}
          </p>

          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            {isGameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isGameOver ? 'PLAY AGAIN' : 'START SHOOTING'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
