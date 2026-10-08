import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trophy, CheckCircle2, Eraser, Lightbulb, Sparkles, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';

interface SudokuGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
}

// Sample Sudoku puzzles with pre-filled boards and solutions
const PUZZLES = {
  easy: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  },
  medium: {
    initial: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ]
  }
};

export const SudokuGame: React.FC<SudokuGameProps> = ({ onScoreUpdate, onGameOver }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isNoteMode, setIsNoteMode] = useState<boolean>(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});

  const initGame = useCallback((diff: 'easy' | 'medium' = difficulty) => {
    const puzzle = PUZZLES[diff];
    const initialCopy = puzzle.initial.map(row => [...row]);
    const boardCopy = puzzle.initial.map(row => [...row]);
    setInitialBoard(initialCopy);
    setBoard(boardCopy);
    setSolution(puzzle.solution);
    setSelectedCell(null);
    setMistakes(0);
    setTimerSeconds(0);
    setIsWon(false);
    setNotes({});
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c });
    sounds.click();
  };

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return; // Cannot edit pre-filled clue

    if (num === 0) {
      // Erase
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = 0;
      setBoard(newBoard);
      sounds.pop();
      return;
    }

    if (isNoteMode) {
      const key = `${r}-${c}`;
      const currentNotes = notes[key] || [];
      const updatedNotes = currentNotes.includes(num)
        ? currentNotes.filter(n => n !== num)
        : [...currentNotes, num].sort();
      setNotes({ ...notes, [key]: updatedNotes });
      sounds.pop();
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    if (solution[r][c] !== num) {
      // Wrong number
      sounds.hit();
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        sounds.gameOver();
        if (onGameOver) onGameOver(0);
      }
    } else {
      sounds.coin();
      // Check win condition
      const checkWin = newBoard.every((row, rIdx) => 
        row.every((val, cIdx) => val === solution[rIdx][cIdx])
      );
      if (checkWin) {
        setIsWon(true);
        const finalScore = Math.max(100, 2000 - timerSeconds * 2 - mistakes * 200);
        sounds.victory();
        confetti({ particleCount: 100, spread: 80 });
        if (onScoreUpdate) onScoreUpdate(finalScore);
      }
    }
  }, [board, initialBoard, isNoteMode, isWon, mistakes, notes, onGameOver, onScoreUpdate, selectedCell, solution, timerSeconds]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(0);
      } else if (e.key === 'ArrowUp') {
        setSelectedCell(prev => prev ? { r: Math.max(0, prev.r - 1), c: prev.c } : null);
      } else if (e.key === 'ArrowDown') {
        setSelectedCell(prev => prev ? { r: Math.min(8, prev.r + 1), c: prev.c } : null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedCell(prev => prev ? { r: prev.r, c: Math.max(0, prev.c - 1) } : null);
      } else if (e.key === 'ArrowRight') {
        setSelectedCell(prev => prev ? { r: prev.r, c: Math.min(8, prev.c + 1) } : null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, selectedCell]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold text-cyan-300 text-sm">{formatTime(timerSeconds)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400">Mistakes:</span>
          <span className={`font-mono font-bold text-sm ${mistakes > 1 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
            {mistakes} / 3
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setDifficulty('easy'); initGame('easy'); }}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              difficulty === 'easy' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => { setDifficulty('medium'); initGame('medium'); }}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              difficulty === 'medium' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Medium
          </button>
        </div>
      </div>

      {/* 9x9 Sudoku Board */}
      <div className="p-2 sm:p-3 bg-slate-950 border-2 border-slate-800 rounded-2xl shadow-2xl mb-4">
        <div className="grid grid-cols-9 gap-0.5 bg-slate-800 border-2 border-slate-700 rounded-xl overflow-hidden">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isClue = initialBoard[r][c] !== 0;
              const isError = val !== 0 && !isClue && val !== solution[r][c];
              const isSameRowCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
              const isSameValue = selectedCell && val !== 0 && board[selectedCell.r][selectedCell.c] === val;

              // Grid 3x3 border divisions
              const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-600' : '';
              const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-600' : '';

              let bg = 'bg-slate-900/90 text-white';
              if (isSelected) bg = 'bg-cyan-500/30 text-cyan-200 border-cyan-400';
              else if (isError) bg = 'bg-rose-950/80 text-rose-400 animate-pulse';
              else if (isSameValue) bg = 'bg-cyan-950/60 text-cyan-300';
              else if (isSameRowCol) bg = 'bg-slate-800/40 text-slate-300';

              const cellNotes = notes[`${r}-${c}`] || [];

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center font-mono text-base sm:text-xl font-bold cursor-pointer transition-all duration-150 ${bg} ${borderRight} ${borderBottom} ${
                    isClue ? 'text-cyan-400 font-extrabold' : 'text-slate-100'
                  }`}
                >
                  {val !== 0 ? (
                    val
                  ) : cellNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 text-[8px] sm:text-[9px] text-slate-400 font-sans leading-none">
                      {cellNotes.map(n => <span key={n}>{n}</span>)}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="w-full bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl mb-4 text-center animate-fade-in shadow-xl shadow-emerald-500/10">
          <h3 className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Puzzle Solved Perfectly!
          </h3>
          <p className="text-xs text-slate-300 mt-1">Time: {formatTime(timerSeconds)} • Mistakes: {mistakes}</p>
          <button
            onClick={() => initGame()}
            className="mt-3 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition shadow-lg"
          >
            Play Another Puzzle
          </button>
        </div>
      )}

      {/* Number Pad & Tool buttons */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <div className="grid grid-cols-9 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="h-11 sm:h-12 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-xl font-mono font-bold text-lg transition flex items-center justify-center shadow-md hover:scale-105"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <button
            onClick={() => handleNumberInput(0)}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Eraser className="w-4 h-4 text-rose-400" />
            Erase
          </button>
          <button
            onClick={() => setIsNoteMode(!isNoteMode)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              isNoteMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Notes: {isNoteMode ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => initGame()}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};
