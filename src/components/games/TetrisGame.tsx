import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, ArrowDown, ArrowLeft, ArrowRight, RotateCw, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface TetrisGameProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 22;

const SHAPES = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4' }, // Cyan
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' }, // Yellow
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' }, // Purple
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' }, // Green
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' }, // Red
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' }, // Blue
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' }, // Orange
};

type ShapeKey = keyof typeof SHAPES;

export const TetrisGame: React.FC<TetrisGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => getGameHighScore('tetris'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Board: 20 rows x 10 cols of color strings or null
  const boardRef = useRef<(string | null)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const pieceRef = useRef<{
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const lastDropRef = useRef(0);

  const getRandomPiece = (): { shape: number[][]; color: string; x: number; y: number } => {
    const keys = Object.keys(SHAPES) as ShapeKey[];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const shapeData = SHAPES[key];
    return {
      shape: shapeData.shape,
      color: shapeData.color,
      x: Math.floor((COLS - shapeData.shape[0].length) / 2),
      y: 0,
    };
  };

  const checkCollision = (piece: { shape: number[][]; x: number; y: number }): boolean => {
    const { shape, x, y } = piece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && boardRef.current[newY][newX] !== null) return true;
        }
      }
    }
    return false;
  };

  const rotate = (matrix: number[][]): number[][] => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result[c][rows - 1 - r] = matrix[r][c];
      }
    }
    return result;
  };

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    sounds.playGameOver();

    const { isNewHighScore, stats } = recordGamePlay('tetris', scoreRef.current);
    if (isNewHighScore) {
      setHighScore(stats.highScore);
      confetti({ particleCount: 90, spread: 75 });
    }
    if (onScoreUpdate) onScoreUpdate(scoreRef.current, isNewHighScore);
  }, [onScoreUpdate]);

  const mergePiece = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;

    // Merge into board
    p.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const by = p.y + r;
          const bx = p.x + c;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            boardRef.current[by][bx] = p.color;
          }
        }
      });
    });

    sounds.playHit();

    // Check full lines
    let cleared = 0;
    const newBoard = boardRef.current.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) cleared++;
      return !isFull;
    });

    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(null));
    }
    boardRef.current = newBoard;

    if (cleared > 0) {
      sounds.playCoin();
      const points = [0, 100, 300, 500, 800][cleared] * levelRef.current;
      scoreRef.current += points;
      linesRef.current += cleared;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;

      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);

      if (cleared === 4) {
        sounds.playVictory();
        confetti({ particleCount: 50, spread: 60 });
      }
    }

    // Spawn new piece
    const nextPiece = getRandomPiece();
    if (checkCollision(nextPiece)) {
      handleGameOver();
    } else {
      pieceRef.current = nextPiece;
    }
  }, [handleGameOver]);

  const moveHorizontal = useCallback((dir: number) => {
    const p = pieceRef.current;
    if (!p || isGameOver) return;
    const next = { ...p, x: p.x + dir };
    if (!checkCollision(next)) {
      pieceRef.current = next;
      sounds.playMove();
    }
  }, [isGameOver]);

  const rotatePiece = useCallback(() => {
    const p = pieceRef.current;
    if (!p || isGameOver) return;
    const rotated = rotate(p.shape);
    const next = { ...p, shape: rotated };

    // Simple wall kick
    if (!checkCollision(next)) {
      pieceRef.current = next;
      sounds.playMove();
    } else if (!checkCollision({ ...next, x: p.x - 1 })) {
      pieceRef.current = { ...next, x: p.x - 1 };
      sounds.playMove();
    } else if (!checkCollision({ ...next, x: p.x + 1 })) {
      pieceRef.current = { ...next, x: p.x + 1 };
      sounds.playMove();
    }
  }, [isGameOver]);

  const drop = useCallback(() => {
    const p = pieceRef.current;
    if (!p || isGameOver) return;
    const next = { ...p, y: p.y + 1 };
    if (!checkCollision(next)) {
      pieceRef.current = next;
    } else {
      mergePiece();
    }
  }, [isGameOver, mergePiece]);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    if (!p || isGameOver) return;
    let nextY = p.y;
    while (!checkCollision({ ...p, y: nextY + 1 })) {
      nextY++;
    }
    pieceRef.current = { ...p, y: nextY };
    mergePiece();
  }, [isGameOver, mergePiece]);

  const resetGame = () => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    pieceRef.current = getRandomPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPlaying(true);
    sounds.playPowerUp();
  };

  // Game Loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      const dropSpeed = Math.max(100, 800 - (levelRef.current - 1) * 70);

      if (isPlaying && !isGameOver) {
        if (timestamp - lastDropRef.current > dropSpeed) {
          drop();
          lastDropRef.current = timestamp;
        }
      }

      // Render Board
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060a14';
          ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

          // Grid lines
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 0.5;
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
          }

          // Draw fixed blocks
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const color = boardRef.current[r][c];
              if (color) {
                ctx.fillStyle = color;
                ctx.shadowBlur = 4;
                ctx.shadowColor = color;
                ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
              }
            }
          }

          // Draw Ghost piece
          const p = pieceRef.current;
          if (p) {
            let ghostY = p.y;
            while (!checkCollision({ ...p, y: ghostY + 1 })) {
              ghostY++;
            }

            // Ghost outline
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            p.shape.forEach((row, r) => {
              row.forEach((val, c) => {
                if (val) {
                  ctx.strokeRect((p.x + c) * BLOCK_SIZE + 2, (ghostY + r) * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                }
              });
            });

            // Active falling piece
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            p.shape.forEach((row, r) => {
              row.forEach((val, c) => {
                if (val) {
                  ctx.fillRect((p.x + c) * BLOCK_SIZE + 1, (p.y + r) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
              });
            });
          }

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, drop]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveHorizontal(-1);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveHorizontal(1);
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') rotatePiece();
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') drop();
      if (e.key === ' ' || e.code === 'Space') hardDrop();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, rotatePiece, drop, hardDrop]);

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">LINES</span>
            <span className="text-xl font-bold font-mono text-purple-400">{lines}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">LVL</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{level}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
          <span className="text-xl font-bold font-mono text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-[220px] h-[440px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className="w-full h-full block"
        />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 transition-all">
            {isGameOver ? (
              <>
                <h3 className="text-2xl font-extrabold text-rose-500 mb-2 font-display">GAME OVER</h3>
                <p className="text-slate-300 text-xs mb-4">Score: <span className="font-mono text-cyan-400 font-bold">{score}</span></p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-cyan-400 mb-2 font-display">BLOCK MATRIX</h3>
                <p className="text-slate-400 text-xs mb-5">Classic falling blocks puzzle. Rotate & stack to clear lines.</p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Now
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch Controls */}
      <div className="mt-3 flex flex-col items-center gap-2 sm:hidden">
        <div className="flex gap-2">
          <button onClick={() => moveHorizontal(-1)} className="p-3 bg-slate-800 rounded-lg text-slate-200 active:bg-cyan-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={rotatePiece} className="p-3 bg-slate-800 rounded-lg text-slate-200 active:bg-cyan-600">
            <RotateCw className="w-5 h-5" />
          </button>
          <button onClick={() => moveHorizontal(1)} className="p-3 bg-slate-800 rounded-lg text-slate-200 active:bg-cyan-600">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={drop} className="px-5 py-2 bg-slate-800 rounded-lg text-slate-200 active:bg-cyan-600 flex items-center gap-1 text-xs">
            <ArrowDown className="w-4 h-4" /> Soft Drop
          </button>
          <button onClick={hardDrop} className="px-5 py-2 bg-cyan-600 rounded-lg text-white active:bg-cyan-500 flex items-center gap-1 text-xs font-bold">
            <ChevronDown className="w-4 h-4" /> Hard Drop
          </button>
        </div>
      </div>
    </div>
  );
};
