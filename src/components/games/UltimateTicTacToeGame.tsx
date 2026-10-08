import React, { useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Users, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';

interface UltimateTicTacToeProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

type Player = 'X' | 'O';
type Board = (Player | null)[];
type MetaBoard = (Player | 'T' | null)[];

export const UltimateTicTacToeGame: React.FC<UltimateTicTacToeProps> = ({ onScoreUpdate, onGameOver }) => {
  const [boards, setBoards] = useState<Board[]>(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [metaBoard, setMetaBoard] = useState<MetaBoard>(Array(9).fill(null));
  const [activeBoard, setActiveBoard] = useState<number | null>(null); // null means any board
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'T' | null>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const checkWinner = (grid: (Player | 'T' | null)[]): Player | 'T' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const [a, b, c] of lines) {
      if (grid[a] && grid[a] !== 'T' && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a] as Player;
      }
    }
    if (grid.every(cell => cell !== null)) return 'T';
    return null;
  };

  const handleCellClick = useCallback((boardIdx: number, cellIdx: number) => {
    if (winner) return;
    if (activeBoard !== null && activeBoard !== boardIdx) return;
    if (metaBoard[boardIdx] !== null) return;
    if (boards[boardIdx][cellIdx] !== null) return;

    sounds.playClick();

    const newBoards = boards.map((b, bI) =>
      bI === boardIdx ? b.map((c, cI) => (cI === cellIdx ? currentPlayer : c)) : [...b]
    );
    setBoards(newBoards);

    // Check if sub-board was won
    const subWinner = checkWinner(newBoards[boardIdx]);
    let newMeta = [...metaBoard];
    if (subWinner && newMeta[boardIdx] === null) {
      newMeta[boardIdx] = subWinner;
      setMetaBoard(newMeta);
      sounds.playVictory();
    }

    // Check ultimate global winner
    const mainWinner = checkWinner(newMeta);
    if (mainWinner) {
      setWinner(mainWinner);
      if (mainWinner === 'X') {
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 80 });
        setScores(s => ({ ...s, p1: s.p1 + 1 }));
        const pts = (scores.p1 + 1) * 500;
        recordGamePlay('ultimate-tictactoe', pts);
        if (onScoreUpdate) onScoreUpdate(pts);
      } else if (mainWinner === 'O') {
        sounds.playGameOver();
        setScores(s => ({ ...s, p2: s.p2 + 1 }));
        if (onGameOver) onGameOver(0);
      }
      return;
    }

    // Set next active board
    const nextBoardActive = newMeta[cellIdx] === null ? cellIdx : null;
    setActiveBoard(nextBoardActive);
    setCurrentPlayer(prev => (prev === 'X' ? 'O' : 'X'));
  }, [activeBoard, boards, currentPlayer, metaBoard, onGameOver, onScoreUpdate, scores.p1, winner]);

  const resetGame = () => {
    setBoards(Array(9).fill(null).map(() => Array(9).fill(null)));
    setMetaBoard(Array(9).fill(null));
    setActiveBoard(null);
    setCurrentPlayer('X');
    setWinner(null);
    sounds.playClick();
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-xl w-full bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <div>
            <h3 className="text-sm font-bold text-white">Ultimate Tic-Tac-Toe</h3>
            <p className="text-[10px] text-slate-400">9-grid nested tactical territory</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-cyan-400 font-bold">X: {scores.p1}</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400 font-bold">O: {scores.p2}</span>
          </div>
          <button onClick={resetGame} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-3 text-xs font-bold text-slate-300 flex items-center gap-2">
        <span>Turn:</span>
        <span className={`px-2 py-0.5 rounded-full font-mono text-xs ${
          currentPlayer === 'X' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}>
          Player {currentPlayer}
        </span>
        {activeBoard !== null && (
          <span className="text-slate-500 text-[11px]">(Target: Grid #{activeBoard + 1})</span>
        )}
      </div>

      {/* 9x9 Meta Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 sm:p-3 rounded-2xl border-2 border-slate-800 shadow-inner">
        {boards.map((subGrid, bIdx) => {
          const isTargeted = activeBoard === null || activeBoard === bIdx;
          const subWon = metaBoard[bIdx];

          return (
            <div
              key={bIdx}
              className={`relative p-1 rounded-xl border-2 grid grid-cols-3 gap-1 transition-all ${
                subWon
                  ? 'bg-slate-900 border-slate-800 opacity-90'
                  : isTargeted
                  ? 'bg-cyan-950/20 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              {subGrid.map((val, cIdx) => (
                <button
                  key={cIdx}
                  onClick={() => handleCellClick(bIdx, cIdx)}
                  disabled={!!subWon || !isTargeted || val !== null || !!winner}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-sm sm:text-base border transition ${
                    val === 'X'
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-700'
                      : val === 'O'
                      ? 'bg-rose-950 text-rose-400 border-rose-700'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}

              {/* Subgrid winner overlay */}
              {subWon && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] rounded-xl flex items-center justify-center font-black text-3xl">
                  {subWon === 'X' ? (
                    <span className="text-cyan-400 animate-scale-up">X</span>
                  ) : subWon === 'O' ? (
                    <span className="text-rose-400 animate-scale-up">O</span>
                  ) : (
                    <span className="text-slate-400">T</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Winner Overlay */}
      {winner && (
        <div className="mt-4 p-3 w-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between animate-fade-in">
          <p className="text-xs font-bold text-white">
            {winner === 'T' ? '🤝 Tactical Tie!' : `🏆 Player ${winner} Dominates the Meta Board!`}
          </p>
          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:scale-105 transition"
          >
            Play Rematch
          </button>
        </div>
      )}
    </div>
  );
};
