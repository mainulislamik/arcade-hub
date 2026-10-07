import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Flag, Bomb, Timer, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface MinesweeperProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

interface Cell {
  r: number;
  c: number;
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborCount: number;
}

const ROWS = 9;
const COLS = 9;
const MINES = 10;

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-cyan-400 font-bold',
  2: 'text-emerald-400 font-bold',
  3: 'text-rose-400 font-bold',
  4: 'text-purple-400 font-bold',
  5: 'text-amber-400 font-bold',
  6: 'text-teal-400 font-bold',
  7: 'text-pink-400 font-bold',
  8: 'text-yellow-400 font-bold',
};

export const MinesweeperGame: React.FC<MinesweeperProps> = ({ onScoreUpdate }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [timer, setTimer] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('minesweeper'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [firstClickDone, setFirstClickDone] = useState(false);

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          mine: false,
          revealed: false,
          flagged: false,
          neighborCount: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setFlagsLeft(MINES);
    setTimer(0);
    setIsGameOver(false);
    setIsVictory(false);
    setFirstClickDone(false);
    setIsPlaying(true);
    sounds.playMove();
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const plantMines = (startR: number, startC: number, board: Cell[][]): Cell[][] => {
    let planted = 0;
    while (planted < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      // Keep start and its neighbors safe on first click
      if (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1) continue;
      if (!board[r][c].mine) {
        board[r][c].mine = true;
        planted++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].mine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
                count++;
              }
            }
          }
          board[r][c].neighborCount = count;
        }
      }
    }
    return board;
  };

  const revealCell = (r: number, c: number, currentGrid: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    const cell = currentGrid[r][c];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    if (cell.neighborCount === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            revealCell(r + dr, c + dc, currentGrid);
          }
        }
      }
    }
  };

  const checkVictory = (currentGrid: Cell[][]) => {
    let unrevealedSafe = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!currentGrid[r][c].mine && !currentGrid[r][c].revealed) {
          unrevealedSafe++;
        }
      }
    }
    return unrevealedSafe === 0;
  };

  const handleClick = (r: number, c: number) => {
    if (!isPlaying || isGameOver || isVictory) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];

    if (cell.revealed) return;

    if (flagMode) {
      // Toggle flag
      if (!cell.flagged && flagsLeft > 0) {
        cell.flagged = true;
        setFlagsLeft(f => f - 1);
        sounds.playClick();
      } else if (cell.flagged) {
        cell.flagged = false;
        setFlagsLeft(f => f + 1);
        sounds.playClick();
      }
      setGrid(newGrid);
      return;
    }

    if (cell.flagged) return;

    // First click guarantee
    if (!firstClickDone) {
      plantMines(r, c, newGrid);
      setFirstClickDone(true);
    }

    if (cell.mine) {
      // Hit mine - Game Over
      sounds.playExplosion();
      // Reveal all mines
      newGrid.forEach(row =>
        row.forEach(cl => {
          if (cl.mine) cl.revealed = true;
        })
      );
      setGrid(newGrid);
      setIsGameOver(true);
      setIsPlaying(false);
      return;
    }

    revealCell(r, c, newGrid);
    sounds.playMove();

    if (checkVictory(newGrid)) {
      setIsVictory(true);
      setIsPlaying(false);
      sounds.playVictory();
      confetti({ particleCount: 110, spread: 80 });

      // Score based on speed
      const scoreGained = Math.max(100, 1000 - timer * 10);
      const { isNewHighScore, stats } = recordGamePlay('minesweeper', scoreGained);
      if (isNewHighScore) setHighScore(stats.highScore);
      if (onScoreUpdate) onScoreUpdate(scoreGained, isNewHighScore);
    }

    setGrid(newGrid);
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (!isPlaying || isGameOver || isVictory) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];
    if (cell.revealed) return;

    if (!cell.flagged && flagsLeft > 0) {
      cell.flagged = true;
      setFlagsLeft(f => f - 1);
      sounds.playClick();
    } else if (cell.flagged) {
      cell.flagged = false;
      setFlagsLeft(f => f + 1);
      sounds.playClick();
    }
    setGrid(newGrid);
  };

  // Timer
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory || !firstClickDone) return;
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isVictory, firstClickDone]);

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-rose-400">
            <Bomb className="w-4 h-4" />
            <span className="text-xl font-bold font-mono">{flagsLeft}</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400">
            <Timer className="w-4 h-4" />
            <span className="text-lg font-bold font-mono">{timer}s</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFlagMode(f => !f)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition ${
              flagMode
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> {flagMode ? 'FLAGGING ON' : 'FLAG MODE'}
          </button>
          <button
            onClick={initGrid}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] p-3 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Game Over / Victory Overlay */}
        {(isGameOver || isVictory) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
            {isVictory ? (
              <>
                <ShieldCheck className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
                <h3 className="text-3xl font-extrabold text-emerald-400 font-display mb-1">FIELD CLEARED!</h3>
                <p className="text-slate-300 text-sm mb-4">Cleared in {timer} seconds!</p>
              </>
            ) : (
              <>
                <Bomb className="w-14 h-14 text-rose-500 mb-2 animate-pulse" />
                <h3 className="text-3xl font-extrabold text-rose-500 font-display mb-2">MINE DETONATED</h3>
                <p className="text-slate-300 text-sm mb-4">Careful next time!</p>
              </>
            )}
            <button
              onClick={initGrid}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* 9x9 Cells */}
        <div className="grid grid-cols-9 gap-1.5 w-full h-full">
          {grid.map(row =>
            row.map(cell => (
              <button
                key={`${cell.r}-${cell.c}`}
                onClick={() => handleClick(cell.r, cell.c)}
                onContextMenu={e => handleRightClick(e, cell.r, cell.c)}
                className={`rounded-lg flex items-center justify-center text-sm font-bold font-mono transition-all duration-75 ${
                  cell.revealed
                    ? cell.mine
                      ? 'bg-rose-600 text-white shadow-inner'
                      : 'bg-slate-900/90 border border-slate-800/80'
                    : 'bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 active:scale-95'
                }`}
              >
                {cell.revealed ? (
                  cell.mine ? (
                    <Bomb className="w-4 h-4 text-white" />
                  ) : cell.neighborCount > 0 ? (
                    <span className={NUMBER_COLORS[cell.neighborCount] || 'text-white'}>
                      {cell.neighborCount}
                    </span>
                  ) : null
                ) : cell.flagged ? (
                  <Flag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-3 text-center">
        Left-click to reveal, Right-click (or toggle Flag Mode) to mark mines.
      </p>
    </div>
  );
};
