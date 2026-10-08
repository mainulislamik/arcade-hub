import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';
import { Rocket, Zap, Play, RotateCcw } from 'lucide-react';

interface MechaBlaster2Props {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isEnemy: boolean;
  damage: number;
  life: number;
  isMissile?: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: 'drone' | 'spider' | 'tank' | 'boss';
  color: string;
  shootCooldown: number;
  maxShootCooldown: number;
  scoreValue: number;
  angle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'weapon' | 'shield' | 'missile' | 'nuke';
  color: string;
  radius: number;
  duration: number;
}

export const MechaBlaster2Game: React.FC<MechaBlaster2Props> = ({ onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(100);
  const [shield, setShield] = useState(100);
  const [missiles, setMissiles] = useState(5);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [bossHealth, setBossHealth] = useState<number | null>(null);

  // Mutable Game Loop State
  const stateRef = useRef({
    player: {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 4.5,
      radius: 20,
      angle: 0,
      hp: 100,
      maxHp: 100,
      shield: 100,
      maxShield: 100,
      weaponLevel: 1,
      missiles: 5,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
    },
    keys: {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
      shift: false,
    },
    mouse: {
      x: 400,
      y: 300,
      isDown: false,
    },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    powerups: [] as PowerUp[],
    enemyIdCounter: 1,
    lastShootTime: 0,
    shootInterval: 120, // ms
    wave: 1,
    score: 0,
    waveEnemiesLeftToSpawn: 10,
    spawnTimer: 0,
    screenShake: 0,
    canvasWidth: 800,
    canvasHeight: 600,
    isBossSpawned: false,
  });

  const triggerScreenShake = (intensity: number) => {
    stateRef.current.screenShake = Math.max(stateRef.current.screenShake, intensity);
  };

  const createExplosion = (x: number, y: number, color: string, count = 20, speed = 4) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.8 + 0.2) * speed;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * 4 + 1.5,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015,
      });
    }
  };

  // Launch Super Missile
  const fireMissile = () => {
    const s = stateRef.current;
    if (s.player.missiles <= 0) return;
    s.player.missiles -= 1;
    setMissiles(s.player.missiles);
    sounds.playLaser();
    triggerScreenShake(8);

    // Spawn 4 homing rockets
    for (let i = -1.5; i <= 1.5; i += 1) {
      const spreadAngle = s.player.angle + i * 0.35;
      s.bullets.push({
        x: s.player.x,
        y: s.player.y,
        vx: Math.cos(spreadAngle) * 7,
        vy: Math.sin(spreadAngle) * 7,
        radius: 6,
        color: '#f59e0b',
        isEnemy: false,
        damage: 120,
        life: 180,
        isMissile: true,
      });
    }
  };

  // Trigger EMP Tactical Nuke
  const triggerNuke = () => {
    sounds.playExplosion();
    triggerScreenShake(20);
    const s = stateRef.current;

    s.bullets = s.bullets.filter((b) => !b.isEnemy);
    s.enemies.forEach((e) => {
      e.hp -= 250;
      createExplosion(e.x, e.y, '#38bdf8', 25, 6);
    });
  };

  // Start / Restart Game
  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.player = {
      x: s.canvasWidth / 2,
      y: s.canvasHeight / 2,
      vx: 0,
      vy: 0,
      speed: 4.5,
      radius: 20,
      angle: 0,
      hp: 100,
      maxHp: 100,
      shield: 100,
      maxShield: 100,
      weaponLevel: 1,
      missiles: 5,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
    };
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.powerups = [];
    s.wave = 1;
    s.score = 0;
    s.waveEnemiesLeftToSpawn = 8;
    s.spawnTimer = 0;
    s.isBossSpawned = false;

    setScore(0);
    setWave(1);
    setHealth(100);
    setShield(100);
    setMissiles(5);
    setWeaponLevel(1);
    setBossHealth(null);
    setGameState('playing');
    sounds.playPowerup();
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnEnemy = (type: 'drone' | 'spider' | 'tank' | 'boss') => {
      const s = stateRef.current;
      const id = s.enemyIdCounter++;

      let x = 0;
      let y = 0;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * s.canvasWidth; y = -30; }
      else if (edge === 1) { x = s.canvasWidth + 30; y = Math.random() * s.canvasHeight; }
      else if (edge === 2) { x = Math.random() * s.canvasWidth; y = s.canvasHeight + 30; }
      else { x = -30; y = Math.random() * s.canvasHeight; }

      if (type === 'drone') {
        s.enemies.push({
          id, x, y, vx: 0, vy: 0,
          radius: 14, hp: 35 + s.wave * 10, maxHp: 35 + s.wave * 10,
          type: 'drone', color: '#ef4444',
          shootCooldown: 90, maxShootCooldown: 90,
          scoreValue: 100, angle: 0,
        });
      } else if (type === 'spider') {
        s.enemies.push({
          id, x, y, vx: 0, vy: 0,
          radius: 18, hp: 75 + s.wave * 20, maxHp: 75 + s.wave * 20,
          type: 'spider', color: '#f97316',
          shootCooldown: 120, maxShootCooldown: 120,
          scoreValue: 220, angle: 0,
        });
      } else if (type === 'tank') {
        s.enemies.push({
          id, x, y, vx: 0, vy: 0,
          radius: 26, hp: 200 + s.wave * 50, maxHp: 200 + s.wave * 50,
          type: 'tank', color: '#a855f7',
          shootCooldown: 150, maxShootCooldown: 150,
          scoreValue: 500, angle: 0,
        });
      } else if (type === 'boss') {
        s.enemies.push({
          id, x: s.canvasWidth / 2, y: -80, vx: 0, vy: 1,
          radius: 50, hp: 1200 + s.wave * 400, maxHp: 1200 + s.wave * 400,
          type: 'boss', color: '#ec4899',
          shootCooldown: 40, maxShootCooldown: 40,
          scoreValue: 3500, angle: 0,
        });
        s.isBossSpawned = true;
        sounds.playPowerup();
        triggerScreenShake(15);
      }
    };

    const updateAndRender = (now: number) => {
      const s = stateRef.current;

      if (canvas.width !== s.canvasWidth || canvas.height !== s.canvasHeight) {
        canvas.width = s.canvasWidth;
        canvas.height = s.canvasHeight;
      }

      ctx.save();

      // Screen Shake
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
        s.screenShake *= 0.9;
        if (s.screenShake < 0.2) s.screenShake = 0;
      }

      // Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, s.canvasWidth, s.canvasHeight);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < s.canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, s.canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < s.canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s.canvasWidth, y);
        ctx.stroke();
      }

      if (gameState === 'playing') {
        // 1. Update Player
        const p = s.player;
        let moveX = 0;
        let moveY = 0;

        if (s.keys.w) moveY -= 1;
        if (s.keys.s) moveY += 1;
        if (s.keys.a) moveX -= 1;
        if (s.keys.d) moveX += 1;

        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        if (p.dashCooldown > 0) p.dashCooldown--;
        if (s.keys.shift && p.dashCooldown <= 0 && (moveX !== 0 || moveY !== 0)) {
          p.isDashing = true;
          p.dashTimer = 12;
          p.dashCooldown = 60;
          sounds.playLaser();
          createExplosion(p.x, p.y, '#00f0ff', 12, 3);
        }

        let curSpeed = p.speed;
        if (p.isDashing) {
          curSpeed *= 2.8;
          p.dashTimer--;
          if (p.dashTimer <= 0) p.isDashing = false;
        }

        p.x += moveX * curSpeed;
        p.y += moveY * curSpeed;

        p.x = Math.max(p.radius, Math.min(s.canvasWidth - p.radius, p.x));
        p.y = Math.max(p.radius, Math.min(s.canvasHeight - p.radius, p.y));

        const dx = s.mouse.x - p.x;
        const dy = s.mouse.y - p.y;
        p.angle = Math.atan2(dy, dx);

        // Shield Regen
        if (p.shield < p.maxShield) {
          p.shield = Math.min(p.maxShield, p.shield + 0.05);
          setShield(Math.round(p.shield));
        }

        // 2. Firing
        if (s.mouse.isDown && now - s.lastShootTime >= s.shootInterval) {
          s.lastShootTime = now;
          sounds.playLaser();
          triggerScreenShake(2);

          const bulletSpeed = 12;
          if (p.weaponLevel === 1) {
            const perpX = -Math.sin(p.angle) * 8;
            const perpY = Math.cos(p.angle) * 8;
            s.bullets.push(
              { x: p.x + perpX, y: p.y + perpY, vx: Math.cos(p.angle) * bulletSpeed, vy: Math.sin(p.angle) * bulletSpeed, radius: 4, color: '#38bdf8', isEnemy: false, damage: 25, life: 60 },
              { x: p.x - perpX, y: p.y - perpY, vx: Math.cos(p.angle) * bulletSpeed, vy: Math.sin(p.angle) * bulletSpeed, radius: 4, color: '#38bdf8', isEnemy: false, damage: 25, life: 60 }
            );
          } else if (p.weaponLevel === 2) {
            for (let angleOff of [-0.15, 0, 0.15]) {
              const bAngle = p.angle + angleOff;
              s.bullets.push({
                x: p.x, y: p.y,
                vx: Math.cos(bAngle) * bulletSpeed,
                vy: Math.sin(bAngle) * bulletSpeed,
                radius: 5, color: '#00f0ff', isEnemy: false, damage: 32, life: 60,
              });
            }
          } else {
            for (let angleOff of [-0.25, -0.08, 0.08, 0.25]) {
              const bAngle = p.angle + angleOff;
              s.bullets.push({
                x: p.x, y: p.y,
                vx: Math.cos(bAngle) * (bulletSpeed + 2),
                vy: Math.sin(bAngle) * (bulletSpeed + 2),
                radius: 5.5, color: '#a855f7', isEnemy: false, damage: 45, life: 65,
              });
            }
          }
        }

        // 3. Spawning
        s.spawnTimer++;
        if (s.spawnTimer % 90 === 0 && s.waveEnemiesLeftToSpawn > 0) {
          s.waveEnemiesLeftToSpawn--;
          const rand = Math.random();
          if (s.wave >= 2 && rand > 0.75) {
            spawnEnemy('tank');
          } else if (s.wave >= 1 && rand > 0.45) {
            spawnEnemy('spider');
          } else {
            spawnEnemy('drone');
          }
        }

        if (s.waveEnemiesLeftToSpawn === 0 && s.enemies.length === 0 && !s.isBossSpawned && s.wave % 3 === 0) {
          spawnEnemy('boss');
        }

        if (s.waveEnemiesLeftToSpawn === 0 && s.enemies.length === 0) {
          s.wave++;
          s.waveEnemiesLeftToSpawn = 8 + s.wave * 4;
          s.isBossSpawned = false;
          setWave(s.wave);
          sounds.playVictory();
          setBossHealth(null);
        }

        // 4. Enemies
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];
          const edx = p.x - e.x;
          const edy = p.y - e.y;
          const dist = Math.hypot(edx, edy);
          e.angle = Math.atan2(edy, edx);

          let eSpeed = 1.8;
          if (e.type === 'drone') eSpeed = 2.4;
          if (e.type === 'tank') eSpeed = 1.2;
          if (e.type === 'boss') eSpeed = 0.8;

          if (dist > 120 || e.type === 'drone') {
            e.x += (edx / dist) * eSpeed;
            e.y += (edy / dist) * eSpeed;
          }

          e.shootCooldown--;
          if (e.shootCooldown <= 0) {
            e.shootCooldown = e.maxShootCooldown;
            if (e.type === 'drone') {
              s.bullets.push({
                x: e.x, y: e.y,
                vx: (edx / dist) * 5, vy: (edy / dist) * 5,
                radius: 4, color: '#ef4444', isEnemy: true, damage: 15, life: 90,
              });
            } else if (e.type === 'spider') {
              for (let off of [-0.2, 0.2]) {
                const bAngle = e.angle + off;
                s.bullets.push({
                  x: e.x, y: e.y,
                  vx: Math.cos(bAngle) * 5.5, vy: Math.sin(bAngle) * 5.5,
                  radius: 4.5, color: '#f97316', isEnemy: true, damage: 18, life: 90,
                });
              }
            } else if (e.type === 'tank') {
              s.bullets.push({
                x: e.x, y: e.y,
                vx: (edx / dist) * 7, vy: (edy / dist) * 7,
                radius: 7, color: '#dc2626', isEnemy: true, damage: 35, life: 100,
              });
            } else if (e.type === 'boss') {
              for (let bIdx = 0; bIdx < 8; bIdx++) {
                const bAngle = (bIdx / 8) * Math.PI * 2 + now * 0.002;
                s.bullets.push({
                  x: e.x, y: e.y,
                  vx: Math.cos(bAngle) * 4.5, vy: Math.sin(bAngle) * 4.5,
                  radius: 5.5, color: '#ec4899', isEnemy: true, damage: 25, life: 120,
                });
              }
            }
          }

          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(e.angle);

          ctx.fillStyle = e.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;

          if (e.type === 'drone') {
            ctx.beginPath();
            ctx.moveTo(e.radius, 0);
            ctx.lineTo(-e.radius * 0.8, e.radius * 0.8);
            ctx.lineTo(-e.radius * 0.4, 0);
            ctx.lineTo(-e.radius * 0.8, -e.radius * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (e.type === 'spider') {
            ctx.beginPath();
            ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (e.type === 'tank') {
            ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
            ctx.strokeRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
          } else if (e.type === 'boss') {
            ctx.beginPath();
            ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();

          if (e.type === 'boss') {
            setBossHealth(Math.round((e.hp / e.maxHp) * 100));
          }
        }

        // 5. Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];

          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          if (b.life <= 0 || b.x < -20 || b.x > s.canvasWidth + 20 || b.y < -20 || b.y > s.canvasHeight + 20) {
            s.bullets.splice(i, 1);
            continue;
          }

          if (b.isEnemy) {
            const distToPlayer = Math.hypot(b.x - p.x, b.y - p.y);
            if (distToPlayer < b.radius + p.radius) {
              sounds.playHit();
              triggerScreenShake(6);
              createExplosion(b.x, b.y, '#ef4444', 8, 2);

              if (p.shield > 0) {
                p.shield = Math.max(0, p.shield - b.damage);
                setShield(Math.round(p.shield));
              } else {
                p.hp = Math.max(0, p.hp - b.damage);
                setHealth(Math.round(p.hp));
              }

              s.bullets.splice(i, 1);

              if (p.hp <= 0) {
                sounds.playGameOver();
                setGameState('gameover');
                recordGamePlay('mecha-blaster-2', s.score, 60);
                if (onGameOver) onGameOver(s.score);
              }
              continue;
            }
          } else {
            let hitEnemy = false;
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const enemy = s.enemies[j];
              const distToEnemy = Math.hypot(b.x - enemy.x, b.y - enemy.y);
              if (distToEnemy < b.radius + enemy.radius) {
                enemy.hp -= b.damage;
                createExplosion(b.x, b.y, '#38bdf8', 6, 2);
                hitEnemy = true;

                if (enemy.hp <= 0) {
                  sounds.playExplosion();
                  triggerScreenShake(enemy.type === 'boss' ? 18 : 5);
                  createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 50 : 18, 5);

                  s.score += enemy.scoreValue;
                  setScore(s.score);
                  if (onScoreUpdate) onScoreUpdate(s.score);

                  if (Math.random() < 0.28 || enemy.type === 'boss') {
                    const types: ('weapon' | 'shield' | 'missile' | 'nuke')[] = ['weapon', 'shield', 'missile', 'nuke'];
                    const chosenType = types[Math.floor(Math.random() * types.length)];
                    s.powerups.push({
                      x: enemy.x,
                      y: enemy.y,
                      type: chosenType,
                      color: chosenType === 'weapon' ? '#00f0ff' : chosenType === 'shield' ? '#3b82f6' : chosenType === 'missile' ? '#f59e0b' : '#ec4899',
                      radius: 14,
                      duration: 600,
                    });
                  }

                  s.enemies.splice(j, 1);
                }
                break;
              }
            }

            if (hitEnemy) {
              s.bullets.splice(i, 1);
              continue;
            }
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
        }

        // 6. Powerups
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const pw = s.powerups[i];
          pw.duration--;
          if (pw.duration <= 0) {
            s.powerups.splice(i, 1);
            continue;
          }

          const distToPlayer = Math.hypot(pw.x - p.x, pw.y - p.y);
          if (distToPlayer < pw.radius + p.radius) {
            sounds.playPowerup();
            createExplosion(pw.x, pw.y, pw.color, 15, 4);

            if (pw.type === 'weapon') {
              p.weaponLevel = Math.min(3, p.weaponLevel + 1);
              setWeaponLevel(p.weaponLevel);
            } else if (pw.type === 'shield') {
              p.shield = p.maxShield;
              p.hp = Math.min(p.maxHp, p.hp + 30);
              setShield(100);
              setHealth(Math.round(p.hp));
            } else if (pw.type === 'missile') {
              p.missiles = Math.min(15, p.missiles + 4);
              setMissiles(p.missiles);
            } else if (pw.type === 'nuke') {
              triggerNuke();
            }

            s.powerups.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
          ctx.fillStyle = pw.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        // 7. Player Mech
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.shield > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.min(1, p.shield / 100)})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(p.radius, 0);
        ctx.lineTo(p.radius * 0.4, p.radius * 0.9);
        ctx.lineTo(-p.radius * 0.8, p.radius * 0.7);
        ctx.lineTo(-p.radius, 0);
        ctx.lineTo(-p.radius * 0.8, -p.radius * 0.7);
        ctx.lineTo(p.radius * 0.4, -p.radius * 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.fillRect(5, -12, 18, 5);
        ctx.fillRect(5, 7, 18, 5);

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(-2, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 8. Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(updateAndRender);
    };

    animationFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, onGameOver, onScoreUpdate]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') s.keys.w = true;
      if (key === 'a' || key === 'arrowleft') s.keys.a = true;
      if (key === 's' || key === 'arrowdown') s.keys.s = true;
      if (key === 'd' || key === 'arrowright') s.keys.d = true;
      if (key === ' ') {
        e.preventDefault();
        fireMissile();
      }
      if (key === 'shift') s.keys.shift = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') s.keys.w = false;
      if (key === 'a' || key === 'arrowleft') s.keys.a = false;
      if (key === 's' || key === 'arrowdown') s.keys.s = false;
      if (key === 'd' || key === 'arrowright') s.keys.d = false;
      if (key === 'shift') s.keys.shift = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      stateRef.current.mouse.x = (e.clientX - rect.left) * scaleX;
      stateRef.current.mouse.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = () => {
      stateRef.current.mouse.isDown = true;
    };

    const handleMouseUp = () => {
      stateRef.current.mouse.isDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto select-none">
      {/* HUD Header */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur">
        {/* Wave & Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">Sector</div>
              <div className="text-base sm:text-lg font-black font-mono text-white">Wave {wave}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Combat Score</div>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-300">{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Health & Shield */}
        <div className="flex items-center gap-4">
          <div className="w-24 sm:w-32">
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
              <span>HP</span>
              <span className="text-emerald-400">{health}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${health}%` }} />
            </div>
          </div>

          <div className="w-24 sm:w-32">
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
              <span>SHIELD</span>
              <span className="text-cyan-400">{shield}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-150" style={{ width: `${shield}%` }} />
            </div>
          </div>
        </div>

        {/* Arsenal */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-amber-400 font-mono text-xs font-bold">
            <Rocket className="w-3.5 h-3.5" />
            <span>x{missiles}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-purple-400 font-mono text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>LV {weaponLevel}</span>
          </div>
        </div>
      </div>

      {/* Boss Health Bar Overlay */}
      {bossHealth !== null && (
        <div className="w-full bg-pink-950/80 border border-pink-600/60 p-2.5 rounded-2xl mb-3 flex flex-col gap-1 shadow-xl animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono font-extrabold text-pink-300">
            <span>⚠️ MEGA TITAN MECH BOSS</span>
            <span>{bossHealth}%</span>
          </div>
          <div className="w-full h-3 bg-pink-950 rounded-full overflow-hidden border border-pink-700">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-200" style={{ width: `${bossHealth}%` }} />
          </div>
        </div>
      )}

      {/* Main Game Screen Canvas */}
      <div className="relative w-full aspect-[4/3] max-h-[550px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Start / Game Over Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            {gameState === 'idle' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-4 text-3xl shadow-lg">
                  🤖
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mb-2">MECHA BLASTER 2</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                  Top-Down Retro Symbian Mech Combat. Pilot your armored titan, weave through enemy firestorms, upgrade plasma cannons, and destroy mega boss titans!
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6 text-xs text-slate-400 font-mono">
                  <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">Move: WASD / Arrows</span>
                  <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">Aim & Fire: Mouse</span>
                  <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">Missile: Space</span>
                  <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">Dash: Shift</span>
                </div>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  LAUNCH MISSION
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4 text-3xl shadow-lg">
                  💥
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mb-2">MISSION FAILED</h2>
                <p className="text-sm text-slate-400 mb-2">Mech Armor Compromised at Wave {wave}</p>
                <div className="text-3xl font-black text-cyan-400 font-mono mb-6">{score.toLocaleString()} PTS</div>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl active:scale-95 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  RESTART SORTIE
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex sm:hidden items-center justify-between w-full mt-3 gap-2">
        <button
          onClick={fireMissile}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-600 active:bg-amber-500 text-white font-bold text-xs shadow-lg"
        >
          <Rocket className="w-4 h-4" /> MISSILE ({missiles})
        </button>
        <button
          onClick={() => {
            stateRef.current.keys.shift = true;
            setTimeout(() => { stateRef.current.keys.shift = false; }, 200);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-cyan-600 active:bg-cyan-500 text-white font-bold text-xs shadow-lg"
        >
          <Zap className="w-4 h-4" /> DASH BOOST
        </button>
      </div>
    </div>
  );
};
