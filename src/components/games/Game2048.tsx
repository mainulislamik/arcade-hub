import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Undo2, Trophy, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface Game2048Props {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

type Board = number[][];

const TILE_COLORS: Record<number, { bg: string; text: string; shadow?: string }> = {
  2: { bg: 'bg-slate-800 text-slate-100', text: 'text-slate-100' },
  4: { bg: 'bg-slate-700 text-slate-100', text: 'text-slate-100' },
  8: { bg: 'bg-amber-600 text-white', text: 'text-white', shadow: 'shadow-amber-600/30' },
  16: { bg: 'bg-orange-600 text-white', text: 'text-white', shadow: 'shadow-orange-600/40' },
  32: { bg: 'bg-rose-600 text-white', text: 'text-white', shadow: 'shadow-rose-600/40' },
  64: { bg: 'bg-red-600 text-white', text: 'text-white', shadow: 'shadow-red-600/50' },
  128: { bg: 'bg-yellow-500 text-slate-950 font-bold', text: 'text-slate-950', shadow: 'shadow-yellow-500/50' },
  256: { bg: 'bg-amber-400 text-slate-950 font-bold', text: 'text-slate-950', shadow: 'shadow-amber-400/60' },
  512: { bg: 'bg-cyan-400 text-slate-950 font-bold', text: 'text-slate-950', shadow: 'shadow-cyan-400/60' },
  1024: { bg: 'bg-emerald-400 text-slate-950 font-extrabold', text: 'text-slate-950', shadow: 'shadow-emerald-400/70' },
  2048: { bg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white font-black', text: 'text-white', shadow: 'shadow-purple-500/80' },
  4096: { bg: 'bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white font-black', text: 'text-white' },
};

export const Game2048: React.FC<Game2048Props> = ({ onScoreUpdate }) => {
  const [board, setBoard] = useState<Board>(() => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [history, setHistory] = useState<{ board: Board; score: number }[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('game-2048'));
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const getEmptyCells = (grid: Board) => {
    const empty: { r: number; c: number }[] = [];
    grid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val === 0) empty.push({ r, c });
      });
    });
    return empty;
  };

  const addRandomTile = (grid: Board): Board => {
    const empty = getEmptyCells(grid);
    if (empty.length === 0) return grid;
    const randomCell = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = grid.map(row => [...row]);
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const initGame = useCallback(() => {
    let grid: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    grid = addRandomTile(grid);
    grid = addRandomTile(grid);
    setBoard(grid);
    setScore(0);
    setHistory([]);
    setIsGameOver(false);
    setHasWon(false);
    setHasContinued(false);
    sounds.playMove();
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const checkGameOver = (grid: Board): boolean => {
    if (getEmptyCells(grid).length > 0) return false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      }
    }
    return true;
  };

  const slideRow = (row: number[]): { newRow: number[]; addedScore: number } => {
    const filtered = row.filter(val => val !== 0);
    let addedScore = 0;
    const result: number[] = [];

    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        const merged = filtered[i] * 2;
        result.push(merged);
        addedScore += merged;
        i++; // skip next
      } else {
        result.push(filtered[i]);
      }
    }

    while (result.length < 4) {
      result.push(0);
    }

    return { newRow: result, addedScore };
  };

  const move = useCallback(
    (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
      if (isGameOver) return;

      let moved = false;
      let scoreGained = 0;
      let newGrid: Board = board.map(row => [...row]);

      if (direction === 'LEFT') {
        for (let r = 0; r < 4; r++) {
          const { newRow, addedScore } = slideRow(newGrid[r]);
          if (newRow.some((val, idx) => val !== newGrid[r][idx])) moved = true;
          newGrid[r] = newRow;
          scoreGained += addedScore;
        }
      } else if (direction === 'RIGHT') {
        for (let r = 0; r < 4; r++) {
          const reversed = [...newGrid[r]].reverse();
          const { newRow, addedScore } = slideRow(reversed);
          const normal = newRow.reverse();
          if (normal.some((val, idx) => val !== newGrid[r][idx])) moved = true;
          newGrid[r] = normal;
          scoreGained += addedScore;
        }
      } else if (direction === 'UP') {
        for (let c = 0; c < 4; c++) {
          const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const { newRow, addedScore } = slideRow(col);
          if (newRow.some((val, idx) => val !== col[idx])) moved = true;
          for (let r = 0; r < 4; r++) {
            newGrid[r][c] = newRow[r];
          }
          scoreGained += addedScore;
        }
      } else if (direction === 'DOWN') {
        for (let c = 0; c < 4; c++) {
          const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
          const { newRow, addedScore } = slideRow(col);
          const normal = newRow.reverse();
          if (normal.some((val, idx) => val !== [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]][idx])) {
            moved = true;
          }
          for (let r = 0; r < 4; r++) {
            newGrid[r][c] = normal[r];
          }
          scoreGained += addedScore;
        }
      }

      if (moved) {
        setHistory(prev => [{ board: board.map(r => [...r]), score }, ...prev.slice(0, 5)]);

        newGrid = addRandomTile(newGrid);
        const newScore = score + scoreGained;
        setBoard(newGrid);
        setScore(newScore);

        if (scoreGained > 0) {
          sounds.playCoin();
        } else {
          sounds.playMove();
        }

        // Check 2048 victory
        if (!hasWon && !hasContinued && newGrid.some(row => row.some(val => val === 2048))) {
          setHasWon(true);
          sounds.playVictory();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        }

        // Check Game Over
        if (checkGameOver(newGrid)) {
          setIsGameOver(true);
          sounds.playGameOver();
          const { isNewHighScore, stats } = recordGamePlay('game-2048', newScore);
          if (isNewHighScore) {
            setHighScore(stats.highScore);
            confetti({ particleCount: 70, spread: 60 });
          }
          if (onScoreUpdate) onScoreUpdate(newScore, isNewHighScore);
        } else {
          if (newScore > highScore) {
            setHighScore(newScore);
          }
        }
      }
    },
    [board, score, isGameOver, hasWon, hasContinued, highScore, onScoreUpdate]
  );

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[0];
    setBoard(prev.board);
    setScore(prev.score);
    setHistory(history.slice(1));
    setIsGameOver(false);
    sounds.playMove();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move('RIGHT');
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') move('UP');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') move('DOWN');
      if (e.key === 'u' || e.key === 'U') undo();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-amber-400">{score}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{highScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-lg transition"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={initGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2048 Grid Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 shadow-2xl flex flex-col justify-between"
      >
        {board.map((row, r) => (
          <div key={r} className="flex justify-between gap-2.5 h-[22%]">
            {row.map((val, c) => {
              const tile = val > 0 ? TILE_COLORS[val] || { bg: 'bg-purple-700 text-white', text: 'text-white' } : null;
              return (
                <div
                  key={c}
                  className={`flex-1 rounded-xl flex items-center justify-center font-bold font-display transition-all duration-100 ${
                    val === 0 ? 'bg-slate-900/60' : `${tile?.bg} shadow-md ${tile?.shadow || ''} scale-100 animate-in`
                  }`}
                >
                  {val > 0 && (
                    <span className={`text-xl sm:text-2xl ${tile?.text}`}>
                      {val}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Victory Overlay */}
        {hasWon && !hasContinued && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
            <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-3xl font-extrabold text-yellow-400 font-display mb-1">YOU REACHED 2048!</h3>
            <p className="text-slate-300 text-sm mb-6">Incredible puzzle mastery!</p>
            <div className="flex gap-3">
              <button
                onClick={() => setHasContinued(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition"
              >
                Keep Going
              </button>
              <button
                onClick={initGame}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
            <h3 className="text-3xl font-extrabold text-rose-500 font-display mb-2">NO MORE MOVES</h3>
            <p className="text-slate-300 text-sm mb-4">Final Score: <span className="font-mono text-amber-400 font-bold text-lg">{score}</span></p>
            <button
              onClick={initGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-3 text-center">
        Tip: Use <b>Arrow Keys</b> or <b>Swipe</b> on mobile. Press <b>U</b> to Undo.
      </p>
    </div>
  );
};
