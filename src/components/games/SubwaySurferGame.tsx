import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Heart, Shield, Flame } from 'lucide-react';

interface SubwaySurferGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

export const SubwaySurferGame: React.FC<SubwaySurferGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('arcadex_subway_highscore') || '0', 10);
  });
  const [coins, setCoins] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [hasMagnet, setHasMagnet] = useState<boolean>(false);
  const [hasMultiplier, setHasMultiplier] = useState<boolean>(false);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    coins: 0,
    speed: 6,
    distance: 0,
    playerTrack: 1, // 0 = Left, 1 = Center, 2 = Right
    playerX: 0,
    targetX: 0,
    playerY: 0,
    velocityY: 0,
    isJumping: false,
    isRolling: false,
    rollTimer: 0,
    shieldTimer: 0,
    magnetTimer: 0,
    multiplierTimer: 0,
    obstacles: [] as Array<{
      id: number;
      track: number; // 0, 1, 2
      z: number; // distance from player
      type: 'train' | 'barrier_high' | 'barrier_low' | 'light_pole';
      height: number;
      width: number;
      length: number;
      passed: boolean;
    }>,
    collectibleCoins: [] as Array<{
      id: number;
      track: number;
      z: number;
      yOffset: number;
      collected: boolean;
    }>,
    powerups: [] as Array<{
      id: number;
      track: number;
      z: number;
      type: 'magnet' | 'jetpack' | 'multiplier' | 'shield';
      collected: boolean;
    }>,
    nextSpawnZ: 1000,
    policeDistance: 40,
    policeCatchTimer: 0,
    animationFrameId: 0,
    lastTime: 0,
  });

  const startGame = useCallback(() => {
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.coins = 0;
    stateRef.current.speed = 7;
    stateRef.current.distance = 0;
    stateRef.current.playerTrack = 1;
    stateRef.current.playerX = 0;
    stateRef.current.targetX = 0;
    stateRef.current.playerY = 0;
    stateRef.current.velocityY = 0;
    stateRef.current.isJumping = false;
    stateRef.current.isRolling = false;
    stateRef.current.rollTimer = 0;
    stateRef.current.shieldTimer = 0;
    stateRef.current.magnetTimer = 0;
    stateRef.current.multiplierTimer = 0;
    stateRef.current.obstacles = [];
    stateRef.current.collectibleCoins = [];
    stateRef.current.powerups = [];
    stateRef.current.nextSpawnZ = 400;
    stateRef.current.policeDistance = 40;
    stateRef.current.policeCatchTimer = 0;
    stateRef.current.lastTime = performance.now();

    setGameState('playing');
    setScore(0);
    setCoins(0);
    setHasShield(false);
    setHasMagnet(false);
    setHasMultiplier(false);

    if (soundEnabled) sounds.playClick();
  }, [soundEnabled]);

  const handleGameOver = useCallback(() => {
    stateRef.current.gameState = 'gameover';
    setGameState('gameover');
    const finalScore = Math.floor(stateRef.current.score);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('arcadex_subway_highscore', finalScore.toString());
      if (soundEnabled) sounds.announceHighScore?.();
    }
    if (soundEnabled) sounds.playGameOver();
    if (onGameOver) onGameOver(finalScore);
  }, [highScore, soundEnabled, onGameOver]);

  // Controls: Arrow keys, WASD, Swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.gameState !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
        return;
      }

      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (s.playerTrack > 0) {
          s.playerTrack--;
          if (soundEnabled) sounds.playClick();
        }
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (s.playerTrack < 2) {
          s.playerTrack++;
          if (soundEnabled) sounds.playClick();
        }
      } else if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !s.isJumping) {
        s.isJumping = true;
        s.velocityY = -16;
        s.isRolling = false;
        s.rollTimer = 0;
        if (soundEnabled) sounds.playLaser();
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && !s.isRolling) {
        if (s.isJumping) {
          s.velocityY = 18; // Fast drop down
        } else {
          s.isRolling = true;
          s.rollTimer = 35; // Frames of rolling
          if (soundEnabled) sounds.playHit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, soundEnabled]);

  // Touch Swipe Controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (stateRef.current.gameState !== 'playing') return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      const s = stateRef.current;
      if (Math.max(absDx, absDy) > 25) {
        if (absDx > absDy) {
          // Horizontal Swipe
          if (dx < 0 && s.playerTrack > 0) {
            s.playerTrack--;
            if (soundEnabled) sounds.playClick();
          } else if (dx > 0 && s.playerTrack < 2) {
            s.playerTrack++;
            if (soundEnabled) sounds.playClick();
          }
        } else {
          // Vertical Swipe
          if (dy < 0 && !s.isJumping) {
            s.isJumping = true;
            s.velocityY = -16;
            s.isRolling = false;
            s.rollTimer = 0;
            if (soundEnabled) sounds.playLaser();
          } else if (dy > 0 && !s.isRolling) {
            if (s.isJumping) {
              s.velocityY = 18;
            } else {
              s.isRolling = true;
              s.rollTimer = 35;
              if (soundEnabled) sounds.playHit();
            }
          }
        }
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [soundEnabled]);

  // Main 3D Subway Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const s = stateRef.current;
      const dt = Math.min((time - s.lastTime) / 1000, 0.1);
      s.lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * 0.42;
      const trackXPositions = [-width * 0.26, 0, width * 0.26];

      // Update Game Logic
      if (s.gameState === 'playing') {
        // Distance and Speed ramp
        s.speed = Math.min(22, 7 + s.distance * 0.001);
        const mult = s.multiplierTimer > 0 ? 2 : 1;
        s.distance += s.speed * 60 * dt;
        s.score += s.speed * 1.5 * mult * dt * 10;
        setScore(Math.floor(s.score));
        if (onScoreUpdate) onScoreUpdate(Math.floor(s.score));

        // Powerup Timers
        if (s.shieldTimer > 0) {
          s.shieldTimer -= dt;
          if (s.shieldTimer <= 0) setHasShield(false);
        }
        if (s.magnetTimer > 0) {
          s.magnetTimer -= dt;
          if (s.magnetTimer <= 0) setHasMagnet(false);
        }
        if (s.multiplierTimer > 0) {
          s.multiplierTimer -= dt;
          if (s.multiplierTimer <= 0) setHasMultiplier(false);
        }

        // Smooth track change X position
        s.targetX = trackXPositions[s.playerTrack];
        s.playerX += (s.targetX - s.playerX) * 14 * dt;

        // Jump physics
        if (s.isJumping) {
          s.playerY += s.velocityY;
          s.velocityY += 45 * dt;
          if (s.playerY >= 0) {
            s.playerY = 0;
            s.isJumping = false;
            s.velocityY = 0;
          }
        }

        // Roll timer
        if (s.isRolling) {
          s.rollTimer -= 60 * dt;
          if (s.rollTimer <= 0) {
            s.isRolling = false;
          }
        }

        // Move Obstacles towards player
        const moveDist = s.speed * 60 * dt * 8;
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.z -= moveDist;

          // Collision Check
          if (obs.z <= 40 && obs.z >= -30 && obs.track === s.playerTrack && !obs.passed) {
            let hit = false;
            if (obs.type === 'barrier_high') {
              // Must roll under
              if (!s.isRolling) hit = true;
            } else if (obs.type === 'barrier_low') {
              // Must jump over
              if (s.playerY > -25) hit = true;
            } else if (obs.type === 'train' || obs.type === 'light_pole') {
              // Full block
              hit = true;
            }

            if (hit) {
              if (s.shieldTimer > 0) {
                // Absorb with shield
                s.shieldTimer = 0;
                setHasShield(false);
                obs.passed = true;
                if (soundEnabled) sounds.playExplosion();
              } else {
                handleGameOver();
                return;
              }
            }
          }

          if (obs.z < -100) {
            obs.passed = true;
            s.obstacles.splice(i, 1);
          }
        }

        // Move & Collect Coins
        for (let i = s.collectibleCoins.length - 1; i >= 0; i--) {
          const coin = s.collectibleCoins[i];
          coin.z -= moveDist;

          // Magnet suction
          if (s.magnetTimer > 0 && coin.z > 0 && coin.z < 350) {
            coin.track += (s.playerTrack - coin.track) * 0.15;
          }

          // Collection check
          if (coin.z <= 50 && coin.z >= -20 && Math.abs(coin.track - s.playerTrack) < 0.6 && !coin.collected) {
            const playerHeightOffset = s.playerY;
            if (Math.abs(coin.yOffset - playerHeightOffset) < 50) {
              coin.collected = true;
              s.coins++;
              s.score += 50 * mult;
              setCoins(s.coins);
              if (soundEnabled) sounds.playCoin();
              s.collectibleCoins.splice(i, 1);
              continue;
            }
          }

          if (coin.z < -60) {
            s.collectibleCoins.splice(i, 1);
          }
        }

        // Move & Collect Powerups
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const p = s.powerups[i];
          p.z -= moveDist;

          if (p.z <= 50 && p.z >= -20 && p.track === s.playerTrack && !p.collected) {
            p.collected = true;
            if (p.type === 'shield') {
              s.shieldTimer = 10;
              setHasShield(true);
            } else if (p.type === 'magnet') {
              s.magnetTimer = 12;
              setHasMagnet(true);
            } else if (p.type === 'multiplier') {
              s.multiplierTimer = 15;
              setHasMultiplier(true);
            }
            if (soundEnabled) sounds.playPowerup();
            s.powerups.splice(i, 1);
            continue;
          }

          if (p.z < -60) {
            s.powerups.splice(i, 1);
          }
        }

        // Spawning new obstacles and coins
        if (s.obstacles.length === 0 || s.obstacles[s.obstacles.length - 1].z < 1200) {
          const spawnZ = Math.max(1400, s.nextSpawnZ);
          const track = Math.floor(Math.random() * 3);
          const randType = Math.random();

          if (randType < 0.45) {
            // Train
            s.obstacles.push({
              id: Math.random(),
              track,
              z: spawnZ,
              type: 'train',
              height: 70,
              width: 50,
              length: 120,
              passed: false,
            });
          } else if (randType < 0.75) {
            // High or Low Barrier
            s.obstacles.push({
              id: Math.random(),
              track,
              z: spawnZ,
              type: Math.random() < 0.5 ? 'barrier_high' : 'barrier_low',
              height: 35,
              width: 45,
              length: 20,
              passed: false,
            });
          } else {
            // Light Pole
            s.obstacles.push({
              id: Math.random(),
              track,
              z: spawnZ,
              type: 'light_pole',
              height: 80,
              width: 30,
              length: 15,
              passed: false,
            });
          }

          // Spawn coins along adjacent track
          const coinTrack = (track + 1 + Math.floor(Math.random() * 2)) % 3;
          for (let c = 0; c < 5; c++) {
            s.collectibleCoins.push({
              id: Math.random(),
              track: coinTrack,
              z: spawnZ + c * 45,
              yOffset: 0,
              collected: false,
            });
          }

          // Rare Powerup
          if (Math.random() < 0.25) {
            const pTypes: Array<'shield' | 'magnet' | 'multiplier'> = ['shield', 'magnet', 'multiplier'];
            s.powerups.push({
              id: Math.random(),
              track: (coinTrack + 1) % 3,
              z: spawnZ + 120,
              type: pTypes[Math.floor(Math.random() * pTypes.length)],
              collected: false,
            });
          }

          s.nextSpawnZ = spawnZ + 380;
        }
      }

      // --- RENDERING CANVAS ---
      // Clear Screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Cyber/Sunset Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.5, '#431407');
      skyGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant City Skyline & Sunset Sun
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(width * 0.5, horizonY - 15, 45, 0, Math.PI * 2);
      ctx.fill();

      // Subway Ground Perspective 3D
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGrad.addColorStop(0, '#1e293b');
      groundGrad.addColorStop(1, '#020617');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 3D Subway Tracks (Left, Center, Right)
      const centerX = width * 0.5;
      const getPerspective = (xOffset: number, z: number) => {
        const factor = 280 / (z + 280);
        return {
          x: centerX + xOffset * factor,
          y: horizonY + (height - horizonY) * factor,
          scale: factor,
        };
      };

      // Draw Rails & Ties
      for (let t = -1; t <= 1; t++) {
        const railOffset = t * width * 0.26;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const pFarL = getPerspective(railOffset - 18, 1600);
        const pNearL = getPerspective(railOffset - 18, 0);
        ctx.moveTo(pFarL.x, pFarL.y);
        ctx.lineTo(pNearL.x, pNearL.y);

        const pFarR = getPerspective(railOffset + 18, 1600);
        const pNearR = getPerspective(railOffset + 18, 0);
        ctx.moveTo(pFarR.x, pFarR.y);
        ctx.lineTo(pNearR.x, pNearR.y);
        ctx.stroke();

        // Wooden Sleepers
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        for (let z = (s.distance * 1.5) % 40; z < 1400; z += 35) {
          const tieL = getPerspective(railOffset - 24, z);
          const tieR = getPerspective(railOffset + 24, z);
          ctx.beginPath();
          ctx.moveTo(tieL.x, tieL.y);
          ctx.lineTo(tieR.x, tieR.y);
          ctx.stroke();
        }
      }

      // Draw 3D Entities sorted by Z distance (Far to Near)
      const renderList: Array<{
        type: 'obs' | 'coin' | 'powerup' | 'player';
        z: number;
        data: any;
      }> = [];

      s.obstacles.forEach((o) => renderList.push({ type: 'obs', z: o.z, data: o }));
      s.collectibleCoins.forEach((c) => renderList.push({ type: 'coin', z: c.z, data: c }));
      s.powerups.forEach((p) => renderList.push({ type: 'powerup', z: p.z, data: p }));
      renderList.push({ type: 'player', z: 0, data: null });

      renderList.sort((a, b) => b.z - a.z);

      renderList.forEach((item) => {
        if (item.type === 'obs') {
          const obs = item.data;
          const trackX = trackXPositions[obs.track];
          const p = getPerspective(trackX, obs.z);
          if (p.scale <= 0) return;

          if (obs.type === 'train') {
            // 3D Subway Train Car
            const trainW = 56 * p.scale;
            const trainH = 75 * p.scale;
            ctx.fillStyle = '#dc2626'; // Red Subway Train
            ctx.fillRect(p.x - trainW / 2, p.y - trainH, trainW, trainH);

            // Train Windows & Lights
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(p.x - trainW * 0.35, p.y - trainH * 0.75, trainW * 0.7, trainH * 0.3);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x - trainW * 0.25, p.y - trainH * 0.2, 4 * p.scale, 0, Math.PI * 2);
            ctx.arc(p.x + trainW * 0.25, p.y - trainH * 0.2, 4 * p.scale, 0, Math.PI * 2);
            ctx.fill();
          } else if (obs.type === 'barrier_high') {
            // High Barricade (Yellow/Black stripes) - Roll Under
            const barW = 46 * p.scale;
            const barH = 50 * p.scale;
            ctx.fillStyle = '#eab308';
            ctx.fillRect(p.x - barW / 2, p.y - barH, barW, 14 * p.scale);
            ctx.fillStyle = '#000000';
            ctx.fillRect(p.x - barW * 0.3, p.y - barH, 8 * p.scale, 14 * p.scale);
            ctx.fillRect(p.x + barW * 0.1, p.y - barH, 8 * p.scale, 14 * p.scale);

            // Legs
            ctx.fillStyle = '#64748b';
            ctx.fillRect(p.x - barW / 2, p.y - barH, 4 * p.scale, barH);
            ctx.fillRect(p.x + barW / 2 - 4 * p.scale, p.y - barH, 4 * p.scale, barH);
          } else if (obs.type === 'barrier_low') {
            // Low Barricade - Jump Over
            const barW = 44 * p.scale;
            const barH = 22 * p.scale;
            ctx.fillStyle = '#f97316';
            ctx.fillRect(p.x - barW / 2, p.y - barH, barW, barH);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(p.x - barW / 2, p.y - barH * 0.6, barW, 4 * p.scale);
          } else if (obs.type === 'light_pole') {
            // Street light pole
            const poleH = 90 * p.scale;
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(p.x - 3 * p.scale, p.y - poleH, 6 * p.scale, poleH);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(p.x, p.y - poleH, 8 * p.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (item.type === 'coin') {
          const coin = item.data;
          const trackX = trackXPositions[Math.round(coin.track)];
          const p = getPerspective(trackX, coin.z);
          if (p.scale <= 0) return;

          // Glowing Gold Coin
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(p.x, p.y - 18 * p.scale - coin.yOffset * p.scale, 7 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2 * p.scale;
          ctx.stroke();
        } else if (item.type === 'powerup') {
          const pwr = item.data;
          const trackX = trackXPositions[pwr.track];
          const p = getPerspective(trackX, pwr.z);
          if (p.scale <= 0) return;

          ctx.fillStyle = pwr.type === 'shield' ? '#3b82f6' : pwr.type === 'magnet' ? '#ef4444' : '#10b981';
          ctx.beginPath();
          ctx.arc(p.x, p.y - 24 * p.scale, 11 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.floor(10 * p.scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(pwr.type[0].toUpperCase(), p.x, p.y - 20 * p.scale);
        } else if (item.type === 'player') {
          // --- DRAW PLAYER (Hero Runner) ---
          const p = getPerspective(s.playerX, 0);
          const py = p.y + s.playerY;

          // Shield Aura Glow
          if (s.shieldTimer > 0) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(p.x, py - 35, 38, 0, Math.PI * 2);
            ctx.stroke();
          }

          if (s.isRolling) {
            // Ball roll animation
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(p.x, py - 18, 18, 0, Math.PI * 2);
            ctx.fill();
            // Cap
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(p.x - 14, py - 30, 28, 6);
          } else {
            // Head & Cap
            ctx.fillStyle = '#fed7aa'; // Skin
            ctx.beginPath();
            ctx.arc(p.x, py - 52, 11, 0, Math.PI * 2);
            ctx.fill();

            // Cool Red Cap
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(p.x - 12, py - 63, 24, 8);
            ctx.fillRect(p.x - 14, py - 57, 10, 4); // Visor

            // Torso (Cyan Hoodie)
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(p.x - 10, py - 42, 20, 24);

            // Legs (Denim Jeans)
            const legWalk = Math.sin(time * 0.02) * 8;
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(p.x - 8, py - 18, 6, 18 + (s.isJumping ? -4 : legWalk));
            ctx.fillRect(p.x + 2, py - 18, 6, 18 + (s.isJumping ? -4 : -legWalk));

            // Hoverboard / Sneakers
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(p.x - 12, py + (s.isJumping ? -4 : 0), 24, 5);
          }

          // Inspector / Police chasing closely behind
          const policeY = p.y + 40;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x - 12, policeY - 45, 24, 30);
          ctx.fillStyle = '#3b82f6'; // Police hat
          ctx.fillRect(p.x - 14, policeY - 55, 28, 8);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [handleGameOver, onScoreUpdate, soundEnabled]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-mono font-black text-sm">{score}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-yellow-400 flex items-center gap-1.5 font-mono font-bold text-sm">
            <span>🪙</span>
            <span>{coins}</span>
          </div>
        </div>

        {/* Active Powerup Badges */}
        <div className="flex items-center gap-2">
          {hasShield && (
            <span className="px-2 py-1 rounded-lg bg-blue-500/80 text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
              <Shield className="w-3 h-3" /> SHIELD
            </span>
          )}
          {hasMagnet && (
            <span className="px-2 py-1 rounded-lg bg-red-500/80 text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
              <Zap className="w-3 h-3" /> MAGNET
            </span>
          )}
          {hasMultiplier && (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/80 text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 2X COINS
            </span>
          )}
        </div>
      </div>

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        className="w-full h-full max-w-4xl max-h-[560px] object-contain rounded-2xl shadow-2xl"
      />

      {/* Touch D-Pad / Buttons for Mobile */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between pointer-events-auto md:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (stateRef.current.playerTrack > 0) {
                  stateRef.current.playerTrack--;
                  if (soundEnabled) sounds.playClick();
                }
              }}
              className="w-14 h-14 rounded-2xl bg-white/20 active:bg-white/40 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold shadow-lg"
            >
              ◀
            </button>
            <button
              onClick={() => {
                if (stateRef.current.playerTrack < 2) {
                  stateRef.current.playerTrack++;
                  if (soundEnabled) sounds.playClick();
                }
              }}
              className="w-14 h-14 rounded-2xl bg-white/20 active:bg-white/40 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold shadow-lg"
            >
              ▶
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!stateRef.current.isJumping) {
                  stateRef.current.isJumping = true;
                  stateRef.current.velocityY = -16;
                  if (soundEnabled) sounds.playLaser();
                }
              }}
              className="w-14 h-14 rounded-2xl bg-indigo-600/80 active:bg-indigo-500 backdrop-blur-md flex items-center justify-center text-white text-sm font-black shadow-lg"
            >
              JUMP
            </button>
            <button
              onClick={() => {
                if (!stateRef.current.isRolling) {
                  stateRef.current.isRolling = true;
                  stateRef.current.rollTimer = 35;
                  if (soundEnabled) sounds.playHit();
                }
              }}
              className="w-14 h-14 rounded-2xl bg-amber-600/80 active:bg-amber-500 backdrop-blur-md flex items-center justify-center text-white text-sm font-black shadow-lg"
            >
              ROLL
            </button>
          </div>
        </div>
      )}

      {/* Start / Game Over Modal Overlays */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 animate-bounce">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide mb-1">SUBWAY RUNNER 3D</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Dodge oncoming trains, jump over barriers, roll under signs, and collect gold coins!
          </p>
          <div className="flex gap-4 text-xs text-slate-300 font-mono mb-6 bg-slate-900/60 px-4 py-2 rounded-xl border border-white/10">
            <span>←/→ or A/D: Lane Switch</span>
            <span>↑/W: Jump</span>
            <span>↓/S: Roll</span>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black text-sm tracking-wider shadow-xl shadow-yellow-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY NOW
          </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
            <Flame className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">BUSTED BY INSPECTOR!</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Final Score: <span className="text-white font-bold">{score}</span> | Coins: <span className="text-yellow-400 font-bold">{coins}</span>
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
