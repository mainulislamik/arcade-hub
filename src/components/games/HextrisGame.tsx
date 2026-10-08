import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Zap, Flame, Trophy, Volume2, VolumeX, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface HextrisGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

const HEX_COLORS = [
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#10b981', // Green
];

interface FallingBlock {
  lane: number; // 0 to 5
  distance: number; // distance from center
  color: string;
  speed: number;
}

export const HextrisGame: React.FC<HextrisGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcadex_hextris_highscore') || '0', 10);
  });
  const [combo, setCombo] = useState(1);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER' | 'PAUSED'>('IDLE');

  // Game internal state ref to avoid closure issues
  const stateRef = useRef({
    rotation: 0, // In radians
    targetRotation: 0,
    grid: [[], [], [], [], [], []] as string[][], // 6 lanes of stacked colors
    fallingBlocks: [] as FallingBlock[],
    spawnTimer: 0,
    spawnInterval: 90,
    fallSpeed: 2.2,
    score: 0,
    combo: 1,
    comboTimer: 0,
    lastFrameTime: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    shake: 0,
  });

  const rotateHex = useCallback((direction: 'LEFT' | 'RIGHT') => {
    if (gameState !== 'PLAYING') return;
    const step = Math.PI / 3; // 60 degrees
    if (direction === 'LEFT') {
      stateRef.current.targetRotation -= step;
    } else {
      stateRef.current.targetRotation += step;
    }
    if (soundEnabled) sounds.playJump();
  }, [gameState, soundEnabled]);

  const dropFast = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    stateRef.current.fallingBlocks.forEach((b) => {
      b.distance -= 25;
    });
    if (soundEnabled) sounds.playLaser();
  }, [gameState, soundEnabled]);

  const startGame = useCallback(() => {
    stateRef.current = {
      rotation: 0,
      targetRotation: 0,
      grid: [[], [], [], [], [], []],
      fallingBlocks: [],
      spawnTimer: 0,
      spawnInterval: 90,
      fallSpeed: 2.2,
      score: 0,
      combo: 1,
      comboTimer: 0,
      lastFrameTime: performance.now(),
      particles: [],
      shake: 0,
    };
    setScore(0);
    setCombo(1);
    setGameState('PLAYING');
    if (soundEnabled) sounds.playPowerup();
  }, [soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'KeyA', 'KeyD', 'KeyS', ' '].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        rotateHex('LEFT');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        rotateHex('RIGHT');
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        dropFast();
      } else if (e.code === 'Space' && (gameState === 'IDLE' || gameState === 'GAMEOVER')) {
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateHex, dropFast, startGame, gameState]);

  // Canvas Game Loop
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
      const centerX = width / 2;
      const centerY = height / 2;
      const hexRadius = 55;
      const blockSize = 16;
      const maxStack = 8;

      // Smooth rotation lerp
      state.rotation += (state.targetRotation - state.rotation) * 0.25;

      // Screen shake decay
      let offsetX = 0;
      let offsetY = 0;
      if (state.shake > 0) {
        offsetX = (Math.random() - 0.5) * state.shake;
        offsetY = (Math.random() - 0.5) * state.shake;
        state.shake *= 0.88;
        if (state.shake < 0.5) state.shake = 0;
      }

      // Background
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Radial background grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let r = 80; r < Math.max(width, height); r += 45) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + state.rotation;
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 6 Outer Lane Guide Lines
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + state.rotation;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * hexRadius, centerY + Math.sin(angle) * hexRadius);
        ctx.lineTo(centerX + Math.cos(angle) * 450, centerY + Math.sin(angle) * 450);
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
        ctx.stroke();
      }

      if (gameState === 'PLAYING') {
        // Spawn falling blocks
        state.spawnTimer++;
        if (state.spawnTimer >= state.spawnInterval) {
          state.spawnTimer = 0;
          const lane = Math.floor(Math.random() * 6);
          const color = HEX_COLORS[Math.floor(Math.random() * HEX_COLORS.length)];
          state.fallingBlocks.push({
            lane,
            distance: Math.min(width, height) * 0.48,
            color,
            speed: state.fallSpeed,
          });

          // Gradually speed up
          state.fallSpeed = Math.min(6.5, state.fallSpeed + 0.015);
          state.spawnInterval = Math.max(38, state.spawnInterval - 0.25);
        }

        // Update falling blocks
        for (let i = state.fallingBlocks.length - 1; i >= 0; i--) {
          const b = state.fallingBlocks[i];
          b.distance -= b.speed;

          const stackHeight = state.grid[b.lane].length;
          const targetDistance = hexRadius + stackHeight * blockSize + blockSize / 2;

          if (b.distance <= targetDistance) {
            // Land block on lane stack
            state.grid[b.lane].push(b.color);
            state.fallingBlocks.splice(i, 1);
            if (soundEnabled) sounds.playMove();

            // Check gameover condition
            if (state.grid[b.lane].length > maxStack) {
              setGameState('GAMEOVER');
              if (soundEnabled) sounds.playGameOver();
              if (onGameOver) onGameOver(state.score);
              if (state.score > highScore) {
                setHighScore(state.score);
                localStorage.setItem('arcadex_hextris_highscore', state.score.toString());
              }
              break;
            }

            // Check match-3 in adjacent lanes or same lane
            let matchesFound = false;
            const currentLane = b.lane;
            const currentIdx = state.grid[currentLane].length - 1;
            const matchColor = b.color;

            // Check horizontal match (same depth across adjacent lanes)
            const matchedLanes: number[] = [currentLane];
            // Check right adjacent
            for (let step = 1; step < 6; step++) {
              const checkLane = (currentLane + step) % 6;
              if (state.grid[checkLane][currentIdx] === matchColor) {
                matchedLanes.push(checkLane);
              } else {
                break;
              }
            }
            // Check left adjacent
            for (let step = 1; step < 6; step++) {
              const checkLane = (currentLane - step + 6) % 6;
              if (state.grid[checkLane][currentIdx] === matchColor && !matchedLanes.includes(checkLane)) {
                matchedLanes.push(checkLane);
              } else {
                break;
              }
            }

            if (matchedLanes.length >= 3) {
              matchesFound = true;
              matchedLanes.forEach((l) => {
                if (state.grid[l].length > currentIdx) {
                  state.grid[l].splice(currentIdx, 1);
                }
              });

              // Add combo & score
              const points = matchedLanes.length * 30 * state.combo;
              state.score += points;
              state.combo = Math.min(10, state.combo + 1);
              state.comboTimer = 180;
              state.shake = 8;
              setScore(state.score);
              setCombo(state.combo);
              if (onScoreUpdate) onScoreUpdate(state.score);
              if (soundEnabled) sounds.playPowerup();

              // Spawn celebration particles
              for (let p = 0; p < 25; p++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 5;
                state.particles.push({
                  x: centerX,
                  y: centerY,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  color: matchColor,
                  life: 30 + Math.random() * 20,
                });
              }
            }
          }
        }

        // Combo decay timer
        if (state.comboTimer > 0) {
          state.comboTimer--;
          if (state.comboTimer === 0) {
            state.combo = 1;
            setCombo(1);
          }
        }
      }

      // Draw Stacked Blocks on Hexagon Sides
      for (let lane = 0; lane < 6; lane++) {
        const stack = state.grid[lane];
        const angle = (lane * Math.PI) / 3 + state.rotation;
        const nextAngle = ((lane + 1) * Math.PI) / 3 + state.rotation;

        stack.forEach((col, idx) => {
          const innerR = hexRadius + idx * blockSize;
          const outerR = innerR + blockSize - 2;

          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
          ctx.lineTo(centerX + Math.cos(nextAngle) * innerR, centerY + Math.sin(nextAngle) * innerR);
          ctx.lineTo(centerX + Math.cos(nextAngle) * outerR, centerY + Math.sin(nextAngle) * outerR);
          ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
          ctx.closePath();

          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // Draw Falling Blocks
      state.fallingBlocks.forEach((b) => {
        const angle = (b.lane * Math.PI) / 3 + state.rotation;
        const nextAngle = ((b.lane + 1) * Math.PI) / 3 + state.rotation;
        const innerR = b.distance - blockSize / 2;
        const outerR = b.distance + blockSize / 2;

        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(nextAngle) * innerR, centerY + Math.sin(nextAngle) * innerR);
        ctx.lineTo(centerX + Math.cos(nextAngle) * outerR, centerY + Math.sin(nextAngle) * outerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.closePath();

        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Central Hexagon Core
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + state.rotation;
        const px = centerX + Math.cos(angle) * hexRadius;
        const py = centerY + Math.sin(angle) * hexRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Core Symbol
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.combo > 1 ? `${state.combo}x` : 'HEX', centerX, centerY);

      // Draw Particles
      for (let p = state.particles.length - 1; p >= 0; p--) {
        const pt = state.particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) {
          state.particles.splice(p, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / 50);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, soundEnabled, highScore, onGameOver, onScoreUpdate]);

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top HUD Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400 font-black flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span className="text-xl tracking-tight">{score}</span>
          </div>
          {combo > 1 && (
            <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 font-extrabold text-xs flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{combo}X COMBO</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BEST: {highScore}</span>
          </div>
          <button
            onClick={startGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full aspect-square bg-slate-950 border-x border-slate-800 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Start / Game Over Overlay */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-10">
            {gameState === 'GAMEOVER' ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">OUT OF BOUNDS!</h3>
                  <p className="text-slate-400 text-xs mt-1">The hexagon stack reached the outer perimeter.</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 uppercase font-bold">Final Score</div>
                  <div className="text-3xl font-black text-indigo-400 mt-0.5">{score}</div>
                </div>
                <button
                  onClick={startGame}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>PLAY AGAIN</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-sm">
                <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">HEXTRIS CORE</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Rotate the central hexagon to match 3+ blocks of the same color!
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START GAME</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Touch Control Bar for Mobile / Tablet */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-2xl p-3 flex items-center justify-around gap-2 text-white">
        <button
          onClick={() => rotateHex('LEFT')}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ROTATE LEFT (A)</span>
        </button>
        <button
          onClick={dropFast}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          title="Fast Drop (S / Down)"
        >
          <ArrowDown className="w-4 h-4" />
          <span>DROP (S)</span>
        </button>
        <button
          onClick={() => rotateHex('RIGHT')}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <span>ROTATE RIGHT (D)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
