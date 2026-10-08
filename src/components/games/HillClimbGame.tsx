import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Fuel, Gauge } from 'lucide-react';

interface HillClimbGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

export const HillClimbGame: React.FC<HillClimbGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [fuel, setFuel] = useState<number>(100);
  const [distance, setDistance] = useState<number>(0);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    coins: 0,
    fuel: 100,
    distance: 0,
    car: {
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      wheelRadius: 18,
      bodyLength: 70,
      bodyHeight: 28,
    },
    gas: false,
    brake: false,
    terrainPoints: [] as Array<{ x: number; y: number }>,
    coinsList: [] as Array<{ x: number; y: number; collected: boolean }>,
    fuelCans: [] as Array<{ x: number; y: number; collected: boolean }>,
    cameraX: 0,
    lastTime: 0,
  });

  // Generate Smooth Procedural Hill Terrain
  const generateTerrain = (startX: number, endX: number) => {
    const points = stateRef.current.terrainPoints;
    let lastX = points.length > 0 ? points[points.length - 1].x : startX;
    let lastY = points.length > 0 ? points[points.length - 1].y : 340;

    for (let x = lastX + 25; x <= endX; x += 25) {
      // Perlin-like layered sine waves for steep hills & valleys
      const h1 = Math.sin(x * 0.003) * 90;
      const h2 = Math.sin(x * 0.008) * 45;
      const h3 = Math.cos(x * 0.015) * 20;
      const y = 350 + h1 + h2 + h3;
      points.push({ x, y });

      // Spawn coins on hills
      if (Math.random() < 0.25) {
        stateRef.current.coinsList.push({ x, y: y - 35, collected: false });
      }

      // Spawn Fuel Canister every 800px
      if (Math.random() < 0.04) {
        stateRef.current.fuelCans.push({ x, y: y - 40, collected: false });
      }
    }
  };

  const getTerrainHeight = (x: number) => {
    const pts = stateRef.current.terrainPoints;
    if (pts.length < 2) return 350;
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i].x && x <= pts[i + 1].x) {
        const t = (x - pts[i].x) / (pts[i + 1].x - pts[i].x);
        return pts[i].y + t * (pts[i + 1].y - pts[i].y);
      }
    }
    return 350;
  };

  const startGame = useCallback(() => {
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.coins = 0;
    stateRef.current.fuel = 100;
    stateRef.current.distance = 0;
    stateRef.current.terrainPoints = [{ x: 0, y: 350 }];
    stateRef.current.coinsList = [];
    stateRef.current.fuelCans = [];
    stateRef.current.car = {
      x: 150,
      y: 280,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      wheelRadius: 18,
      bodyLength: 70,
      bodyHeight: 28,
    };
    stateRef.current.cameraX = 0;
    stateRef.current.lastTime = performance.now();

    generateTerrain(0, 3000);

    setGameState('playing');
    setScore(0);
    setCoins(0);
    setFuel(100);
    setDistance(0);

    if (soundEnabled) sounds.playClick();
  }, [soundEnabled]);

  const handleGameOver = useCallback(() => {
    stateRef.current.gameState = 'gameover';
    setGameState('gameover');
    const finalScore = Math.floor(stateRef.current.score);
    if (soundEnabled) sounds.playGameOver();
    if (onGameOver) onGameOver(finalScore);
  }, [soundEnabled, onGameOver]);

  // Controls: Right arrow / D (Gas), Left arrow / A (Brake)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.gameState !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') startGame();
        return;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.gas = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.brake = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.gas = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.brake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame]);

  // Physics Simulation Loop
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
        const car = s.car;

        // Fuel Consumption
        if (s.gas) {
          s.fuel -= 12 * dt;
        } else {
          s.fuel -= 2 * dt;
        }
        setFuel(Math.max(0, Math.floor(s.fuel)));

        if (s.fuel <= 0) {
          handleGameOver();
          return;
        }

        // Gravity
        car.vy += 980 * dt;

        // Gas / Brake Acceleration & Torque
        if (s.gas) {
          const force = 650;
          car.vx += Math.cos(car.angle) * force * dt;
          car.vy += Math.sin(car.angle) * force * dt;
          car.angularVelocity += 3.5 * dt; // Wheelie torque
        }
        if (s.brake) {
          car.vx *= 0.94;
          car.angularVelocity -= 4.0 * dt;
        }

        // Air Resistance & Angular damping
        car.vx *= 0.99;
        car.angularVelocity *= 0.96;

        // Integrate Position
        car.x += car.vx * dt;
        car.y += car.vy * dt;
        car.angle += car.angularVelocity * dt;

        // Wheels Ground Collision
        const rearWheelX = car.x - Math.cos(car.angle) * (car.bodyLength * 0.4);
        const rearWheelY = car.y - Math.sin(car.angle) * (car.bodyLength * 0.4) + car.wheelRadius;
        const frontWheelX = car.x + Math.cos(car.angle) * (car.bodyLength * 0.4);
        const frontWheelY = car.y + Math.sin(car.angle) * (car.bodyLength * 0.4) + car.wheelRadius;

        const terrainRearY = getTerrainHeight(rearWheelX);
        const terrainFrontY = getTerrainHeight(frontWheelX);

        // Ground Reaction Physics
        let onGround = false;
        if (rearWheelY >= terrainRearY) {
          car.y -= (rearWheelY - terrainRearY);
          car.vy = Math.min(0, car.vy * 0.3);
          car.angularVelocity += (terrainFrontY - terrainRearY) * 0.005;
          onGround = true;
        }
        if (frontWheelY >= terrainFrontY) {
          car.y -= (frontWheelY - terrainFrontY);
          car.vy = Math.min(0, car.vy * 0.3);
          onGround = true;
        }

        // Flip Crash Detection (Driver Head hitting ground)
        const normalizedAngle = Math.abs((car.angle % (Math.PI * 2)));
        if (onGround && (normalizedAngle > Math.PI * 0.55 && normalizedAngle < Math.PI * 1.45)) {
          handleGameOver();
          return;
        }

        // Distance & Score
        s.distance = Math.max(s.distance, Math.floor((car.x - 150) / 10));
        setDistance(s.distance);
        s.score = s.distance + s.coins * 50;
        setScore(s.score);
        if (onScoreUpdate) onScoreUpdate(s.score);

        // Expand Terrain dynamically ahead of car
        if (car.x + 1500 > s.terrainPoints[s.terrainPoints.length - 1].x) {
          generateTerrain(s.terrainPoints[s.terrainPoints.length - 1].x, car.x + 3000);
        }

        // Camera follow car smoothly
        s.cameraX = car.x - width * 0.3;

        // Coin Collection
        s.coinsList.forEach((c) => {
          if (!c.collected && Math.hypot(c.x - car.x, c.y - car.y) < 45) {
            c.collected = true;
            s.coins++;
            setCoins(s.coins);
            if (soundEnabled) sounds.playCoin();
          }
        });

        // Fuel Can Collection
        s.fuelCans.forEach((f) => {
          if (!f.collected && Math.hypot(f.x - car.x, f.y - car.y) < 50) {
            f.collected = true;
            s.fuel = Math.min(100, s.fuel + 40);
            if (soundEnabled) sounds.playPowerup();
          }
        });
      }

      // --- RENDERING ---
      ctx.fillStyle = '#0284c7'; // Sky Blue
      ctx.fillRect(0, 0, width, height);

      // Distant Clouds & Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width * 0.85, 80, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(-s.cameraX, 0);

      // Draw Lush Green Hills (Terrain Polygon)
      ctx.beginPath();
      if (s.terrainPoints.length > 0) {
        ctx.moveTo(s.terrainPoints[0].x, height);
        s.terrainPoints.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(s.terrainPoints[s.terrainPoints.length - 1].x, height);
      }
      ctx.closePath();
      const grassGrad = ctx.createLinearGradient(0, 200, 0, height);
      grassGrad.addColorStop(0, '#22c55e'); // Green grass top
      grassGrad.addColorStop(0.1, '#16a34a');
      grassGrad.addColorStop(0.3, '#78350f'); // Dirt underneath
      grassGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = grassGrad;
      ctx.fill();

      // Top Grass Outline
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw Gold Coins
      s.coinsList.forEach((c) => {
        if (!c.collected && c.x > s.cameraX - 50 && c.x < s.cameraX + width + 50) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw Red Fuel Cans
      s.fuelCans.forEach((f) => {
        if (!f.collected && f.x > s.cameraX - 50 && f.x < s.cameraX + width + 50) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(f.x - 12, f.y - 15, 24, 26);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GAS', f.x, f.y + 3);
        }
      });

      // Draw 4x4 Jeep Car
      const car = s.car;
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Jeep Red Chassis
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-car.bodyLength / 2, -car.bodyHeight, car.bodyLength, car.bodyHeight);

      // Rollcage Bars
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-car.bodyLength * 0.3, -car.bodyHeight);
      ctx.lineTo(-car.bodyLength * 0.1, -car.bodyHeight - 20);
      ctx.lineTo(car.bodyLength * 0.2, -car.bodyHeight - 20);
      ctx.lineTo(car.bodyLength * 0.35, -car.bodyHeight);
      ctx.stroke();

      // Driver Stickman with Helmet
      ctx.fillStyle = '#f59e0b'; // Helmet
      ctx.beginPath();
      ctx.arc(0, -car.bodyHeight - 12, 10, 0, Math.PI * 2);
      ctx.fill();

      // Big Off-Road Wheels
      const drawWheel = (wx: number, wy: number) => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(wx, wy, car.wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Hubcap
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(wx, wy, 6, 0, Math.PI * 2);
        ctx.fill();
      };

      drawWheel(-car.bodyLength * 0.35, car.wheelRadius * 0.3);
      drawWheel(car.bodyLength * 0.35, car.wheelRadius * 0.3);

      ctx.restore();
      ctx.restore();

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
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-black text-sm">{distance}m</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 flex items-center gap-1.5 font-mono font-bold text-sm">
            <span>🪙</span>
            <span>{coins}</span>
          </div>
        </div>

        {/* Fuel Gauge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
          <Fuel className="w-4 h-4 text-red-500" />
          <div className="w-28 h-3.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-100 ${
                fuel > 30 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        className="w-full h-full max-w-4xl max-h-[560px] object-contain rounded-2xl shadow-2xl"
      />

      {/* Touch Pedals for Mobile / Touch Devices */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between pointer-events-auto">
          <button
            onPointerDown={() => (stateRef.current.brake = true)}
            onPointerUp={() => (stateRef.current.brake = false)}
            className="w-24 h-24 rounded-3xl bg-rose-600/80 active:bg-rose-500 backdrop-blur-md flex flex-col items-center justify-center text-white text-xs font-black shadow-xl border-2 border-white/20 active:scale-95 transition-all"
          >
            <Gauge className="w-6 h-6 mb-1" /> BRAKE
          </button>
          <button
            onPointerDown={() => (stateRef.current.gas = true)}
            onPointerUp={() => (stateRef.current.gas = false)}
            className="w-24 h-24 rounded-3xl bg-emerald-600/80 active:bg-emerald-500 backdrop-blur-md flex flex-col items-center justify-center text-white text-xs font-black shadow-xl border-2 border-white/20 active:scale-95 transition-all"
          >
            <Zap className="w-6 h-6 mb-1" /> GAS
          </button>
        </div>
      )}

      {/* Start / Game Over Modal */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 animate-bounce">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide mb-1">HILL RACER 2D PHYSICS</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Conquer steep rugged hills in your 4x4 Jeep! Balance gas and brake, collect coins, and don't run out of fuel!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY NOW
          </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-2xl font-black text-white mb-1">RUN FINISHED!</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Distance: <span className="text-emerald-400 font-bold">{distance}m</span> | Coins: <span className="text-yellow-400 font-bold">{coins}</span>
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> RETRY
          </button>
        </div>
      )}
    </div>
  );
};
