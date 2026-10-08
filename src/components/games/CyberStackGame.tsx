import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Zap, Trophy, Sparkles, Flame } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface CyberStackGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Debris {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vy: number;
  rotation: number;
  vRot: number;
}

const COLOR_PALETTE = [
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
];

export const CyberStackGame: React.FC<CyberStackGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcadex_stack_highscore') || '0', 10);
  });
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');

  const stateRef = useRef({
    stack: [] as Block[],
    debris: [] as Debris[],
    currentBlock: {
      x: 0,
      y: 0,
      width: 220,
      height: 24,
      color: COLOR_PALETTE[0],
      direction: 1,
      speed: 3.5,
    },
    cameraY: 0,
    targetCameraY: 0,
    perfectStreak: 0,
    score: 0,
    shake: 0,
    floatingTexts: [] as { x: number; y: number; text: string; color: string; life: number }[],
  });

  const placeBlock = useCallback(() => {
    const state = stateRef.current;
    if (gameState !== 'PLAYING') return;

    const current = state.currentBlock;
    const top = state.stack[state.stack.length - 1];

    const diff = current.x - top.x;
    const tolerance = 4; // Margin for PERFECT hit

    if (Math.abs(diff) <= tolerance) {
      // Perfect placement!
      current.x = top.x;
      state.perfectStreak++;
      setPerfectStreak(state.perfectStreak);
      state.score++;
      setScore(state.score);
      if (onScoreUpdate) onScoreUpdate(state.score);
      if (soundEnabled) sounds.playPowerup();

      // Expand slab slightly if 5 perfects in a row
      if (state.perfectStreak % 5 === 0 && current.width < 260) {
        current.width = Math.min(260, current.width + 15);
      }

      state.floatingTexts.push({
        x: current.x + current.width / 2,
        y: current.y - 15,
        text: `PERFECT! +${state.perfectStreak * 10}`,
        color: '#38bdf8',
        life: 40,
      });
    } else if (Math.abs(diff) >= top.width) {
      // Complete miss! Game Over
      setGameState('GAMEOVER');
      if (soundEnabled) sounds.playGameOver();
      if (onGameOver) onGameOver(state.score);
      if (state.score > highScore) {
        setHighScore(state.score);
        localStorage.setItem('arcadex_stack_highscore', state.score.toString());
      }
      // Add missing block as falling debris
      state.debris.push({
        x: current.x,
        y: current.y,
        width: current.width,
        height: current.height,
        color: current.color,
        vy: 2,
        rotation: 0,
        vRot: diff > 0 ? 0.08 : -0.08,
      });
      return;
    } else {
      // Sliced overhang
      state.perfectStreak = 0;
      setPerfectStreak(0);
      state.score++;
      setScore(state.score);
      if (onScoreUpdate) onScoreUpdate(state.score);
      if (soundEnabled) sounds.playLaser();

      let newWidth = top.width - Math.abs(diff);
      let newX = diff > 0 ? current.x : top.x;

      // Create falling debris
      const debrisWidth = Math.abs(diff);
      const debrisX = diff > 0 ? current.x + newWidth : current.x;
      state.debris.push({
        x: debrisX,
        y: current.y,
        width: debrisWidth,
        height: current.height,
        color: current.color,
        vy: 3,
        rotation: 0,
        vRot: diff > 0 ? 0.06 : -0.06,
      });

      current.x = newX;
      current.width = newWidth;
    }

    // Push landed block to stack
    state.stack.push({
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
      color: current.color,
    });

    // Spawn next block above
    const nextY = current.y - current.height;
    const nextColor = COLOR_PALETTE[state.stack.length % COLOR_PALETTE.length];
    const nextSpeed = Math.min(7.5, 3.5 + state.score * 0.1);

    state.currentBlock = {
      x: -current.width,
      y: nextY,
      width: current.width,
      height: current.height,
      color: nextColor,
      direction: 1,
      speed: nextSpeed,
    };

    // Camera target smooth scroll
    if (state.stack.length > 8) {
      state.targetCameraY = (state.stack.length - 8) * current.height;
    }
  }, [gameState, soundEnabled, highScore, onGameOver, onScoreUpdate]);

  const startGame = useCallback(() => {
    const initialY = 480;
    const initialWidth = 220;
    const initialHeight = 24;

    stateRef.current = {
      stack: [
        {
          x: 190,
          y: initialY,
          width: initialWidth,
          height: initialHeight,
          color: COLOR_PALETTE[0],
        },
      ],
      debris: [],
      currentBlock: {
        x: -initialWidth,
        y: initialY - initialHeight,
        width: initialWidth,
        height: initialHeight,
        color: COLOR_PALETTE[1],
        direction: 1,
        speed: 3.5,
      },
      cameraY: 0,
      targetCameraY: 0,
      perfectStreak: 0,
      score: 0,
      shake: 0,
      floatingTexts: [],
    };
    setScore(0);
    setPerfectStreak(0);
    setGameState('PLAYING');
    if (soundEnabled) sounds.playPowerup();
  }, [soundEnabled]);

  // Keyboard and click handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          placeBlock();
        } else {
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placeBlock, startGame, gameState]);

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

      // Smooth camera interpolation
      state.cameraY += (state.targetCameraY - state.cameraY) * 0.1;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid Lines in background
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridOffset = (state.cameraY * 0.5) % 40;
      for (let y = gridOffset; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(0, state.cameraY);

      // Render Stack Blocks
      state.stack.forEach((b, idx) => {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = idx === state.stack.length - 1 ? 12 : 4;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;

        // Block highlight rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      });

      // Update and Render Moving Block
      if (gameState === 'PLAYING') {
        const cur = state.currentBlock;
        cur.x += cur.speed * cur.direction;
        if (cur.x > width - cur.width || cur.x < 0) {
          cur.direction *= -1;
        }

        ctx.fillStyle = cur.color;
        ctx.shadowColor = cur.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(cur.x, cur.y, cur.width, cur.height);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cur.x, cur.y, cur.width, cur.height);
      }

      // Update & Render Falling Debris
      for (let i = state.debris.length - 1; i >= 0; i--) {
        const d = state.debris[i];
        d.y += d.vy;
        d.vy += 0.35; // Gravity
        d.rotation += d.vRot;

        ctx.save();
        ctx.translate(d.x + d.width / 2, d.y + d.height / 2);
        ctx.rotate(d.rotation);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = Math.max(0, 1 - (d.y - state.cameraY) / height);
        ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);
        ctx.restore();

        if (d.y - state.cameraY > height + 200) {
          state.debris.splice(i, 1);
        }
      }

      // Floating Score Texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= 1.2;
        ft.life--;

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, ft.life / 40);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;

        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* HUD Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400 font-black flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span className="text-xl tracking-tight">{score}</span>
          </div>
          {perfectStreak > 1 && (
            <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 font-extrabold text-xs flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{perfectStreak}X PERFECT</span>
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
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        onClick={() => {
          if (gameState === 'PLAYING') placeBlock();
          else startGame();
        }}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 border-x border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={520}
          className="w-full h-full object-contain"
        />

        {/* Start / Game Over Modal */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-10">
            {gameState === 'GAMEOVER' ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">TOWER TOPPLED!</h3>
                  <p className="text-slate-400 text-xs mt-1">Slab missed the foundation.</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 uppercase font-bold">Floors Reached</div>
                  <div className="text-3xl font-black text-indigo-400 mt-0.5">{score}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>PLAY AGAIN</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-sm">
                <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">CYBER STACK</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Tap to drop moving neon slabs. Align perfectly to build the highest skyscraper!
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
                  <span>START STACKING</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tap Action Helper */}
      <div 
        onClick={() => {
          if (gameState === 'PLAYING') placeBlock();
          else startGame();
        }}
        className="w-full bg-slate-900 hover:bg-indigo-950 border border-slate-800 rounded-b-2xl p-3.5 text-center text-white cursor-pointer transition-colors"
      >
        <div className="text-xs font-bold text-indigo-400 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span>TAP ANYWHERE OR PRESS SPACEBAR TO DROP SLAB</span>
        </div>
      </div>
    </div>
  );
};
