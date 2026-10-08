import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Flame, Skull, Shield } from 'lucide-react';

interface TempleDashGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

export const TempleDashGame: React.FC<TempleDashGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [gems, setGems] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    gems: 0,
    speed: 7,
    distance: 0,
    playerLane: 0, // -1 (left), 0 (center), 1 (right)
    playerX: 0,
    targetX: 0,
    playerY: 0,
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    demonDistance: 50,
    stumbleCount: 0,
    tiles: [] as Array<{
      id: number;
      z: number;
      obstacleType: 'none' | 'fire_pit' | 'tree_root' | 'saw_blade' | 'broken_bridge';
      obstacleLane: number;
      hasGem: boolean;
      gemLane: number;
    }>,
    nextTileZ: 0,
    lastTime: 0,
  });

  const startGame = useCallback(() => {
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.gems = 0;
    stateRef.current.speed = 8;
    stateRef.current.distance = 0;
    stateRef.current.playerLane = 0;
    stateRef.current.playerX = 0;
    stateRef.current.targetX = 0;
    stateRef.current.playerY = 0;
    stateRef.current.velocityY = 0;
    stateRef.current.isJumping = false;
    stateRef.current.isSliding = false;
    stateRef.current.slideTimer = 0;
    stateRef.current.demonDistance = 45;
    stateRef.current.stumbleCount = 0;
    stateRef.current.tiles = [];
    stateRef.current.nextTileZ = 200;
    stateRef.current.lastTime = performance.now();

    // Pre-populate straight ancient ruin tiles
    for (let z = 200; z < 1600; z += 60) {
      stateRef.current.tiles.push({
        id: Math.random(),
        z,
        obstacleType: 'none',
        obstacleLane: 0,
        hasGem: Math.random() < 0.35,
        gemLane: Math.floor(Math.random() * 3) - 1,
      });
    }

    setGameState('playing');
    setScore(0);
    setGems(0);
    setMultiplier(1);

    if (soundEnabled) sounds.playClick();
  }, [soundEnabled]);

  const handleGameOver = useCallback(() => {
    stateRef.current.gameState = 'gameover';
    setGameState('gameover');
    const finalScore = Math.floor(stateRef.current.score);
    if (soundEnabled) sounds.playGameOver();
    if (onGameOver) onGameOver(finalScore);
  }, [soundEnabled, onGameOver]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.gameState !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') startGame();
        return;
      }

      const s = stateRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (s.playerLane > -1) {
          s.playerLane--;
          if (soundEnabled) sounds.playClick();
        }
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (s.playerLane < 1) {
          s.playerLane++;
          if (soundEnabled) sounds.playClick();
        }
      } else if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !s.isJumping) {
        s.isJumping = true;
        s.velocityY = -16;
        s.isSliding = false;
        s.slideTimer = 0;
        if (soundEnabled) sounds.playLaser();
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && !s.isSliding) {
        if (s.isJumping) {
          s.velocityY = 18;
        } else {
          s.isSliding = true;
          s.slideTimer = 35;
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
      if (Math.max(absDx, absDy) > 20) {
        if (absDx > absDy) {
          if (dx < 0 && s.playerLane > -1) s.playerLane--;
          else if (dx > 0 && s.playerLane < 1) s.playerLane++;
        } else {
          if (dy < 0 && !s.isJumping) {
            s.isJumping = true;
            s.velocityY = -16;
          } else if (dy > 0 && !s.isSliding) {
            s.isSliding = true;
            s.slideTimer = 35;
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
  }, []);

  // Main 3D Temple Loop
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
      const horizonY = height * 0.38;

      if (s.gameState === 'playing') {
        s.speed = Math.min(24, 8 + s.distance * 0.0012);
        s.distance += s.speed * 60 * dt;
        s.score += s.speed * 2 * dt * 10;
        setScore(Math.floor(s.score));
        if (onScoreUpdate) onScoreUpdate(Math.floor(s.score));

        // Target X smoothing
        const laneOffsets = [-width * 0.22, 0, width * 0.22];
        s.targetX = laneOffsets[s.playerLane + 1];
        s.playerX += (s.targetX - s.playerX) * 14 * dt;

        // Jump physics
        if (s.isJumping) {
          s.playerY += s.velocityY;
          s.velocityY += 46 * dt;
          if (s.playerY >= 0) {
            s.playerY = 0;
            s.isJumping = false;
            s.velocityY = 0;
          }
        }

        // Slide timer
        if (s.isSliding) {
          s.slideTimer -= 60 * dt;
          if (s.slideTimer <= 0) s.isSliding = false;
        }

        // Move Tiles towards player
        const moveDist = s.speed * 60 * dt * 7;
        for (let i = s.tiles.length - 1; i >= 0; i--) {
          const tile = s.tiles[i];
          tile.z -= moveDist;

          // Obstacle Collision
          if (tile.z <= 40 && tile.z >= -20 && tile.obstacleType !== 'none') {
            const laneMatch = tile.obstacleLane === s.playerLane || tile.obstacleType === 'fire_pit' || tile.obstacleType === 'broken_bridge';
            if (laneMatch) {
              let hit = false;
              if (tile.obstacleType === 'fire_pit' || tile.obstacleType === 'broken_bridge') {
                if (s.playerY > -28) hit = true; // Must jump
              } else if (tile.obstacleType === 'saw_blade') {
                if (!s.isSliding) hit = true; // Must slide
              } else if (tile.obstacleType === 'tree_root') {
                if (s.playerY > -20) hit = true;
              }

              if (hit) {
                handleGameOver();
                return;
              }
            }
          }

          // Gem Collect
          if (tile.z <= 50 && tile.z >= -20 && tile.hasGem && tile.gemLane === s.playerLane) {
            tile.hasGem = false;
            s.gems++;
            s.score += 75;
            setGems(s.gems);
            if (soundEnabled) sounds.playCoin();
          }

          if (tile.z < -80) {
            s.tiles.splice(i, 1);
          }
        }

        // Spawn new tile chunks
        if (s.tiles.length < 25) {
          const lastZ = s.tiles.length > 0 ? s.tiles[s.tiles.length - 1].z : 300;
          const spawnZ = lastZ + 60;
          const randObs = Math.random();

          let obsType: 'none' | 'fire_pit' | 'tree_root' | 'saw_blade' | 'broken_bridge' = 'none';
          let obsLane = Math.floor(Math.random() * 3) - 1;

          if (randObs < 0.25) obsType = 'fire_pit';
          else if (randObs < 0.45) obsType = 'saw_blade';
          else if (randObs < 0.65) obsType = 'tree_root';
          else if (randObs < 0.78) obsType = 'broken_bridge';

          s.tiles.push({
            id: Math.random(),
            z: spawnZ,
            obstacleType: obsType,
            obstacleLane: obsLane,
            hasGem: Math.random() < 0.4,
            gemLane: Math.floor(Math.random() * 3) - 1,
          });
        }
      }

      // --- RENDER TEMPLE JUNGLE & RUINS ---
      ctx.fillStyle = '#052e16'; // Deep jungle green
      ctx.fillRect(0, 0, width, height);

      // Distant Jungle Misty Hills
      const jungleGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      jungleGrad.addColorStop(0, '#064e3b');
      jungleGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = jungleGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Ancient Stone Wall 3D Projection
      const getPerspective = (xOffset: number, z: number) => {
        const factor = 300 / (z + 300);
        return {
          x: width * 0.5 + xOffset * factor,
          y: horizonY + (height - horizonY) * factor,
          scale: factor,
        };
      };

      // Draw Ancient Pathway Bricks
      for (let i = s.tiles.length - 1; i >= 0; i--) {
        const tile = s.tiles[i];
        const pFar = getPerspective(0, tile.z + 55);
        const pNear = getPerspective(0, tile.z);
        if (pNear.scale <= 0) continue;

        const pathWFar = width * 0.75 * pFar.scale;
        const pathWNear = width * 0.75 * pNear.scale;

        // Path Stone Quad
        ctx.fillStyle = (Math.floor(tile.z / 60) % 2 === 0) ? '#78716c' : '#57534e';
        if (tile.obstacleType === 'fire_pit') {
          ctx.fillStyle = '#ea580c'; // Fiery lava pit
        } else if (tile.obstacleType === 'broken_bridge') {
          ctx.fillStyle = '#0f172a'; // Bottomless abyss
        }

        ctx.beginPath();
        ctx.moveTo(pFar.x - pathWFar / 2, pFar.y);
        ctx.lineTo(pFar.x + pathWFar / 2, pFar.y);
        ctx.lineTo(pNear.x + pathWNear / 2, pNear.y);
        ctx.lineTo(pNear.x - pathWNear / 2, pNear.y);
        ctx.fill();

        // Stone Wall Edges
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 3 * pNear.scale;
        ctx.beginPath();
        ctx.moveTo(pNear.x - pathWNear / 2, pNear.y);
        ctx.lineTo(pFar.x - pathWFar / 2, pFar.y);
        ctx.moveTo(pNear.x + pathWNear / 2, pNear.y);
        ctx.lineTo(pFar.x + pathWFar / 2, pFar.y);
        ctx.stroke();

        // Draw Obstacle
        if (tile.obstacleType === 'saw_blade') {
          const p = getPerspective(0, tile.z);
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(p.x, p.y - 28 * p.scale, 16 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(p.x - pathWNear * 0.45, p.y - 45 * p.scale, pathWNear * 0.9, 8 * p.scale);
        } else if (tile.obstacleType === 'tree_root') {
          const laneX = tile.obstacleLane * width * 0.22;
          const p = getPerspective(laneX, tile.z);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(p.x - 25 * p.scale, p.y - 18 * p.scale, 50 * p.scale, 18 * p.scale);
        }

        // Draw Golden Ancient Relic Gem
        if (tile.hasGem) {
          const gemX = tile.gemLane * width * 0.22;
          const p = getPerspective(gemX, tile.z);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(p.x, p.y - 22 * p.scale, 8 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(p.x, p.y - 22 * p.scale, 4 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Player (Explorer Hero with Fedora Hat)
      const pPlayer = getPerspective(s.playerX, 0);
      const py = pPlayer.y + s.playerY;

      if (s.isSliding) {
        ctx.fillStyle = '#d97706'; // Leather jacket
        ctx.fillRect(pPlayer.x - 18, py - 18, 36, 16);
      } else {
        // Head & Fedora Hat
        ctx.fillStyle = '#78350f'; // Brown Fedora
        ctx.fillRect(pPlayer.x - 16, py - 60, 32, 8);
        ctx.fillRect(pPlayer.x - 12, py - 68, 24, 10);

        // Face
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(pPlayer.x, py - 48, 10, 0, Math.PI * 2);
        ctx.fill();

        // Leather Jacket
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pPlayer.x - 10, py - 38, 20, 22);

        // Legs
        const legWalk = Math.sin(time * 0.02) * 8;
        ctx.fillStyle = '#451a03';
        ctx.fillRect(pPlayer.x - 8, py - 16, 6, 16 + (s.isJumping ? -4 : legWalk));
        ctx.fillRect(pPlayer.x + 2, py - 16, 6, 16 + (s.isJumping ? -4 : -legWalk));
      }

      // Giant Demon Monkey Chasing Closely Behind
      const demonY = pPlayer.y + 35;
      ctx.fillStyle = '#1c1917'; // Shadow Demon
      ctx.beginPath();
      ctx.arc(pPlayer.x, demonY - 45, 24, 0, Math.PI * 2);
      ctx.fill();
      // Glowing Red Demon Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pPlayer.x - 8, demonY - 45, 4, 0, Math.PI * 2);
      ctx.arc(pPlayer.x + 8, demonY - 45, 4, 0, Math.PI * 2);
      ctx.fill();

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
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-black text-sm">{score}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 flex items-center gap-1.5 font-mono font-bold text-sm">
            <span>💎</span>
            <span>{gems}</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        className="w-full h-full max-w-4xl max-h-[560px] object-contain rounded-2xl shadow-2xl"
      />

      {/* Start / Game Over Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 animate-bounce">
            <Skull className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide mb-1">TEMPLE RELIC ESCAPE 3D</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Escape the ancient cursed temple, jump across fire pits, slide under spinning saw blades, and collect gems!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY NOW
          </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
            <Skull className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">CAUGHT BY DEMON MONKEY!</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Final Score: <span className="text-white font-bold">{score}</span> | Gems: <span className="text-emerald-400 font-bold">{gems}</span>
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
