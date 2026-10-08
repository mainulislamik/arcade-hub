import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Users, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';

interface ConnectFourProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

type Player = 1 | 2; // 1: Cyan / Red, 2: Yellow / AI
type Cell = 0 | Player;

const ROWS = 6;
const COLS = 7;

export const ConnectFourGame: React.FC<ConnectFourProps> = ({ onScoreUpdate, onGameOver }) => {
  const [board, setBoard] = useState<Cell[][]>(() => 
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [turn, setTurn] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });

  const initGame = useCallback(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setTurn(1);
    setWinner(null);
    setWinningCells([]);
  }, []);

  const checkWinCondition = (currentBoard: Cell[][]): { winner: Player | 'draw' | null; line: [number, number][] } => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r][c + 1] && val === currentBoard[r][c + 2] && val === currentBoard[r][c + 3]) {
          return { winner: val, line: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
      }
    }

    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r + 1][c] && val === currentBoard[r + 2][c] && val === currentBoard[r + 3][c]) {
          return { winner: val, line: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
      }
    }

    // Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r - 1][c + 1] && val === currentBoard[r - 2][c + 2] && val === currentBoard[r - 3][c + 3]) {
          return { winner: val, line: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
        }
      }
    }

    // Diagonal Down-Right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r + 1][c + 1] && val === currentBoard[r + 2][c + 2] && val === currentBoard[r + 3][c + 3]) {
          return { winner: val, line: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
      }
    }

    // Check Draw
    const isFull = currentBoard[0].every(cell => cell !== 0);
    if (isFull) return { winner: 'draw', line: [] };

    return { winner: null, line: [] };
  };

  const dropDisc = useCallback((col: number, player: Player) => {
    if (winner !== null) return false;

    // Find lowest open row in col
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return false; // Column is full

    sounds.pop();
    const newBoard = board.map(row => [...row]);
    newBoard[targetRow][col] = player;
    setBoard(newBoard);

    const result = checkWinCondition(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningCells(result.line);
      if (result.winner === 1) {
        sounds.victory();
        confetti({ particleCount: 80, spread: 70 });
        setScores(s => ({ ...s, p1: s.p1 + 1 }));
        if (onScoreUpdate) onScoreUpdate((scores.p1 + 1) * 300);
      } else if (result.winner === 2) {
        sounds.gameOver();
        setScores(s => ({ ...s, p2: s.p2 + 1 }));
      } else {
        sounds.hit();
      }
    } else {
      setTurn(player === 1 ? 2 : 1);
    }
    return true;
  }, [board, onScoreUpdate, scores.p1, winner]);

  // AI Move calculation
  useEffect(() => {
    if (!isAiMode || turn !== 2 || winner !== null) return;

    const timer = setTimeout(() => {
      // 1. Check if AI can win in one move
      for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 1; r >= 0; r--) {
          if (board[r][c] === 0) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[r][c] = 2;
            if (checkWinCondition(tempBoard).winner === 2) {
              dropDisc(c, 2);
              return;
            }
            break;
          }
        }
      }

      // 2. Check if Player 1 is about to win, block them!
      for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 1; r >= 0; r--) {
          if (board[r][c] === 0) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[r][c] = 1;
            if (checkWinCondition(tempBoard).winner === 1) {
              dropDisc(c, 2);
              return;
            }
            break;
          }
        }
      }

      // 3. Prefer Center columns (3, 2, 4, 1, 5, 0, 6)
      const colOrder = [3, 2, 4, 1, 5, 0, 6];
      for (const c of colOrder) {
        if (board[0][c] === 0) {
          dropDisc(c, 2);
          return;
        }
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [board, dropDisc, isAiMode, turn, winner]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
          <span className="text-xs font-bold text-slate-300">P1: {scores.p1}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setIsAiMode(true); initGame(); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
              isAiMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" /> vs AI
          </button>
          <button
            onClick={() => { setIsAiMode(false); initGame(); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
              !isAiMode ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2P Local
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">{isAiMode ? 'AI' : 'P2'}: {scores.p2}</span>
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
        </div>
      </div>

      {/* Turn Indicator */}
      {winner === null && (
        <div className="mb-2 text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>Turn:</span>
          {turn === 1 ? (
            <span className="text-cyan-400 font-bold">Player 1 (Cyan)</span>
          ) : (
            <span className="text-amber-400 font-bold">{isAiMode ? 'AI Thinking...' : 'Player 2 (Yellow)'}</span>
          )}
        </div>
      )}

      {/* 7x6 Connect 4 Grid */}
      <div className="p-3 sm:p-4 bg-blue-950/70 border-4 border-blue-800/80 rounded-3xl shadow-2xl shadow-blue-950/50 mb-4">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: COLS }).map((_, col) => (
            <div
              key={col}
              onClick={() => dropDisc(col, turn)}
              className="flex flex-col gap-2 sm:gap-3 cursor-pointer group"
            >
              {Array.from({ length: ROWS }).map((_, row) => {
                const cell = board[row][col];
                const isWinningCell = winningCells.some(([wr, wc]) => wr === row && wc === col);

                let discClass = 'bg-slate-950/80 border-slate-800 shadow-inner';
                if (cell === 1) {
                  discClass = 'bg-cyan-400 border-cyan-300 shadow-lg shadow-cyan-500/50';
                } else if (cell === 2) {
                  discClass = 'bg-amber-400 border-amber-300 shadow-lg shadow-amber-500/50';
                }

                if (isWinningCell) {
                  discClass += ' animate-bounce ring-4 ring-white';
                }

                return (
                  <div
                    key={row}
                    className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${discClass} group-hover:brightness-110`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Game Over Banner */}
      {winner !== null && (
        <div className="w-full bg-slate-900/95 border border-slate-800 p-4 rounded-2xl mb-4 text-center animate-fade-in shadow-2xl">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            {winner === 1 ? (
              <span className="text-cyan-400">🎉 Player 1 Wins!</span>
            ) : winner === 2 ? (
              <span className="text-amber-400">{isAiMode ? '🤖 AI Victorious!' : '🎉 Player 2 Wins!'}</span>
            ) : (
              <span className="text-slate-300">It's a Stalemate Draw!</span>
            )}
          </h3>
          <button
            onClick={initGame}
            className="mt-3 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition shadow-lg"
          >
            Play Next Round
          </button>
        </div>
      )}

      {/* Quick Reset */}
      <button
        onClick={initGame}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Clear Board
      </button>
    </div>
  );
};
