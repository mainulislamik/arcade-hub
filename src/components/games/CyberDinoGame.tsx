import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Zap, Trophy, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface CyberDinoGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'CACTUS_SMALL' | 'CACTUS_BIG' | 'CACTUS_GROUP' | 'DRONE_LOW' | 'DRONE_HIGH';
}

export const CyberDinoGame: React.FC<CyberDinoGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcadex_dino_highscore') || '0', 10);
  });
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');

  const stateRef = useRef({
    dino: {
      x: 60,
      y: 0,
      vy: 0,
      width: 44,
      height: 52,
      isGrounded: true,
      isDucking: false,
      runFrame: 0,
    },
    groundY: 280,
    speed: 7,
    distance: 0,
    obstacles: [] as Obstacle[],
    spawnTimer: 0,
    score: 0,
    nightCycle: 0, // 0 to 1
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const jump = useCallback(() => {
    const dino = stateRef.current.dino;
    if (dino.isGrounded && gameState === 'PLAYING') {
      dino.vy = -14.5;
      dino.isGrounded = false;
      if (soundEnabled) sounds.playJump();
    }
  }, [gameState, soundEnabled]);

  const setDuck = useCallback((ducking: boolean) => {
    const dino = stateRef.current.dino;
    dino.isDucking = ducking;
    if (ducking && !dino.isGrounded) {
      dino.vy += 6; // Fast fall
    }
  }, []);

  const startGame = useCallback(() => {
    stateRef.current = {
      dino: {
        x: 60,
        y: 280 - 52,
        vy: 0,
        width: 44,
        height: 52,
        isGrounded: true,
        isDucking: false,
        runFrame: 0,
      },
      groundY: 280,
      speed: 7,
      distance: 0,
      obstacles: [],
      spawnTimer: 0,
      score: 0,
      nightCycle: 0,
      particles: [],
    };
    setScore(0);
    setGameState('PLAYING');
    if (soundEnabled) sounds.playPowerup();
  }, [soundEnabled]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        if (gameState === 'PLAYING') jump();
        else startGame();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        if (gameState === 'PLAYING') setDuck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        setDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, setDuck, startGame, gameState]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const state = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const groundY = state.groundY;
      const dino = state.dino;

      // Update Night/Day cycle slowly
      state.nightCycle = (Math.sin(state.distance * 0.0005) + 1) / 2;

      // Background
      const isDark = state.nightCycle > 0.5;
      ctx.fillStyle = isDark ? '#090d16' : '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Cyber Skyline in Background
      ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(51, 65, 85, 0.3)';
      const skylineOffset = (state.distance * 0.2) % 120;
      for (let x = -skylineOffset; x < width + 120; x += 60) {
        const bHeight = 70 + ((x * 13) % 80);
        ctx.fillRect(x, groundY - bHeight, 45, bHeight);
      }

      // Ground Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ground Texture Dots
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      const groundOffset = (state.distance) % 40;
      for (let x = -groundOffset; x < width + 40; x += 30) {
        ctx.fillRect(x, groundY + 8, 12, 2);
        ctx.fillRect(x + 15, groundY + 16, 6, 2);
      }

      if (gameState === 'PLAYING') {
        state.distance += state.speed;
        state.score = Math.floor(state.distance / 10);
        setScore(state.score);
        if (onScoreUpdate) onScoreUpdate(state.score);

        // Speed ramp up
        state.speed = Math.min(14, 7 + state.score * 0.005);

        // Dino Physics
        if (!dino.isGrounded) {
          dino.vy += 0.75; // Gravity
          dino.y += dino.vy;
          const targetY = dino.isDucking ? groundY - 32 : groundY - 52;
          if (dino.y >= targetY) {
            dino.y = targetY;
            dino.vy = 0;
            dino.isGrounded = true;
          }
        } else {
          dino.y = dino.isDucking ? groundY - 32 : groundY - 52;
        }

        dino.runFrame = (dino.runFrame + 0.25) % 4;

        // Obstacle Spawner
        state.spawnTimer++;
        const minSpawn = Math.max(50, 110 - state.speed * 4);
        if (state.spawnTimer >= minSpawn) {
          if (Math.random() < 0.035) {
            state.spawnTimer = 0;
            const r = Math.random();
            let obs: Obstacle;

            if (r < 0.4) {
              obs = { x: width + 20, y: groundY - 45, width: 22, height: 45, type: 'CACTUS_SMALL' };
            } else if (r < 0.7) {
              obs = { x: width + 20, y: groundY - 60, width: 34, height: 60, type: 'CACTUS_BIG' };
            } else if (r < 0.85) {
              obs = { x: width + 20, y: groundY - 45, width: 50, height: 45, type: 'CACTUS_GROUP' };
            } else {
              // Drone / Pterodactyl flying
              const isHigh = Math.random() < 0.5;
              obs = { 
                x: width + 20, 
                y: isHigh ? groundY - 75 : groundY - 38, 
                width: 38, 
                height: 26, 
                type: isHigh ? 'DRONE_HIGH' : 'DRONE_LOW' 
              };
            }
            state.obstacles.push(obs);
          }
        }

        // Update Obstacles & Collision Check
        const dinoHitbox = {
          x: dino.x + 4,
          y: dino.y + 4,
          w: dino.isDucking ? 56 : 36,
          h: dino.isDucking ? 28 : 46,
        };

        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.x -= state.speed;

          // Check AABB collision
          if (
            dinoHitbox.x < obs.x + obs.width &&
            dinoHitbox.x + dinoHitbox.w > obs.x &&
            dinoHitbox.y < obs.y + obs.height &&
            dinoHitbox.y + dinoHitbox.h > obs.y
          ) {
            // Collision! Game Over
            setGameState('GAMEOVER');
            if (soundEnabled) sounds.playGameOver();
            if (onGameOver) onGameOver(state.score);
            if (state.score > highScore) {
              setHighScore(state.score);
              localStorage.setItem('arcadex_dino_highscore', state.score.toString());
            }

            // Explosion particles
            for (let p = 0; p < 20; p++) {
              state.particles.push({
                x: dino.x + 20,
                y: dino.y + 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 35,
                color: '#f43f5e',
              });
            }
            break;
          }

          if (obs.x < -80) {
            state.obstacles.splice(i, 1);
          }
        }
      }

      // Draw Dino (Cyber T-Rex Runner)
      ctx.save();
      ctx.translate(dino.x, dino.y);

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;

      if (dino.isDucking) {
        // Ducking posture (low elongated cyber dino)
        ctx.fillRect(0, 10, 56, 22);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(44, 14, 4, 4); // Eye visor
        ctx.fillStyle = '#38bdf8';
        // Legs
        if (Math.floor(dino.runFrame) % 2 === 0) {
          ctx.fillRect(10, 32, 6, 6);
        } else {
          ctx.fillRect(36, 32, 6, 6);
        }
      } else {
        // Standing / Running posture
        ctx.fillRect(8, 0, 28, 20); // Head
        ctx.fillRect(0, 14, 38, 26); // Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(26, 4, 5, 5); // Visor eye
        ctx.fillStyle = '#38bdf8';
        // Running legs
        if (dino.isGrounded) {
          if (Math.floor(dino.runFrame) % 2 === 0) {
            ctx.fillRect(10, 40, 6, 12);
            ctx.fillRect(26, 40, 6, 6);
          } else {
            ctx.fillRect(10, 40, 6, 6);
            ctx.fillRect(26, 40, 6, 12);
          }
        } else {
          // Jump tuck legs
          ctx.fillRect(12, 40, 6, 8);
          ctx.fillRect(24, 40, 6, 8);
        }
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // Draw Obstacles
      state.obstacles.forEach((obs) => {
        ctx.fillStyle = obs.type.startsWith('DRONE') ? '#ec4899' : '#10b981';
        ctx.shadowColor = obs.type.startsWith('DRONE') ? '#db2777' : '#059669';
        ctx.shadowBlur = 8;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;

        // Drone wing flapper
        if (obs.type.startsWith('DRONE')) {
          ctx.fillStyle = '#ffffff';
          const wingOffset = Math.sin(state.distance * 0.1) * 6;
          ctx.fillRect(obs.x + 8, obs.y - 4 + wingOffset, 20, 3);
        }
      });

      // Draw Particles
      for (let p = state.particles.length - 1; p >= 0; p--) {
        const pt = state.particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / 35);
        ctx.fillRect(pt.x, pt.y, 3, 3);
        ctx.globalAlpha = 1;
        if (pt.life <= 0) state.particles.splice(p, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, soundEnabled, highScore, onGameOver, onScoreUpdate]);

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top HUD */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400 font-black flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span className="text-xl tracking-tight">{score}m</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BEST: {highScore}m</span>
          </div>
          <button
            onClick={startGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div 
        onClick={() => {
          if (gameState === 'PLAYING') jump();
          else startGame();
        }}
        className="relative w-full aspect-[16/9] bg-slate-950 border-x border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-contain"
        />

        {/* Start / Game Over Modal */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-10">
            {gameState === 'GAMEOVER' ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">CRASHED!</h3>
                  <p className="text-slate-400 text-xs mt-1">Obstacle hit while running.</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 uppercase font-bold">Distance Run</div>
                  <div className="text-3xl font-black text-indigo-400 mt-0.5">{score}m</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>RUN AGAIN</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-sm">
                <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">CYBER DINO RUNNER</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Jump over obstacles and duck under flying cyber drones!
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START RUNNING</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Touch Action Controls */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-2xl p-3 flex items-center justify-around gap-3 text-white">
        <button
          onClick={jump}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <ArrowUp className="w-4 h-4" />
          <span>JUMP (SPACE / UP)</span>
        </button>
        <button
          onMouseDown={() => setDuck(true)}
          onMouseUp={() => setDuck(false)}
          onTouchStart={() => setDuck(true)}
          onTouchEnd={() => setDuck(false)}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <ArrowDown className="w-4 h-4" />
          <span>DUCK (DOWN / S)</span>
        </button>
      </div>
    </div>
  );
};
