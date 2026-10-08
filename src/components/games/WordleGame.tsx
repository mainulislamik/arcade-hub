import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Sparkles, Delete, CornerDownLeft, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';

interface WordleGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

const TARGET_WORDS = [
  'REACT', 'VAPOR', 'PIXEL', 'GAMES', 'TURBO', 'CYBER', 'LASER', 'POWER', 'BLOCK', 'SPACE',
  'QUEST', 'BLAST', 'SHARP', 'FLASH', 'SMART', 'GHOST', 'SONIC', 'NINJA', 'MATCH', 'MAGIC',
  'RADAR', 'CLOUD', 'DRIVE', 'SPEED', 'FORCE', 'LEVEL', 'SCORE', 'SOLAR', 'FLAME', 'VIPER'
];

export const WordleGame: React.FC<WordleGameProps> = ({ onScoreUpdate, onGameOver }) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shakeRow, setShakeRow] = useState(false);
  const [statsRecorded, setStatsRecorded] = useState(false);

  const initGame = useCallback(() => {
    const randomWord = TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setShakeRow(false);
    setStatsRecorded(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleKeyInput = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        sounds.playHit();
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        return;
      }

      sounds.playLaser();
      const nextGuesses = [...guesses, currentGuess];
      setGuesses(nextGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setGameStatus('won');
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        const newStreak = streak + 1;
        setStreak(newStreak);
        const score = 1000 - (nextGuesses.length - 1) * 150 + newStreak * 100;
        if (score > highScore) setHighScore(score);
        if (onScoreUpdate) onScoreUpdate(score);
        if (!statsRecorded) {
          recordGamePlay('word-quest', score);
          setStatsRecorded(true);
        }
      } else if (nextGuesses.length >= 6) {
        setGameStatus('lost');
        sounds.playGameOver();
        setStreak(0);
        if (onGameOver) onGameOver(0);
        if (!statsRecorded) {
          recordGamePlay('word-quest', 0);
          setStatsRecorded(true);
        }
      }
    } else if (key === 'BACKSPACE') {
      sounds.playMove();
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      sounds.playClick();
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameStatus, guesses, targetWord, streak, highScore, onScoreUpdate, onGameOver, statsRecorded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKeyInput(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const getKeyboardKeyStatus = (key: string) => {
    let status = '';
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) return 'correct';
          if (targetWord.includes(key) && status !== 'correct') status = 'present';
          if (!targetWord.includes(key) && !status) status = 'absent';
        }
      }
    }
    return status;
  };

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-md w-full bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔤</span>
          <div>
            <h3 className="text-sm font-bold text-white">Word Quest</h3>
            <p className="text-[10px] text-slate-400">Guess the 5-letter word in 6 tries</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Streak</span>
            <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1 justify-end">
              🔥 {streak}
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              initGame();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="New Word"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Word Grid */}
      <div className="grid grid-rows-6 gap-2 mb-4 w-full max-w-[280px]">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
          const isCurrentRow = rowIndex === guesses.length;
          const isSubmitted = rowIndex < guesses.length;

          return (
            <div
              key={rowIndex}
              className={`grid grid-cols-5 gap-2 ${
                isCurrentRow && shakeRow ? 'animate-shake' : ''
              }`}
            >
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const char = guess[colIndex] || '';
                let statusClass = 'border-slate-800 bg-slate-950/60 text-white';

                if (isSubmitted) {
                  const status = getLetterStatus(char, colIndex, guess);
                  if (status === 'correct') {
                    statusClass = 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30';
                  } else if (status === 'present') {
                    statusClass = 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30';
                  } else {
                    statusClass = 'bg-slate-800/80 border-slate-700 text-slate-400';
                  }
                } else if (char) {
                  statusClass = 'border-cyan-500/60 bg-slate-900 text-cyan-300 scale-105';
                }

                return (
                  <div
                    key={colIndex}
                    className={`h-11 sm:h-12 flex items-center justify-center font-extrabold text-lg sm:text-xl rounded-xl border-2 transition-all duration-200 uppercase ${statusClass}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game Outcome Overlay */}
      {gameStatus !== 'playing' && (
        <div className="w-full mb-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-xs font-bold text-white">
              {gameStatus === 'won' ? '🎉 Word Decoded!' : `❌ Target: ${targetWord}`}
            </p>
            <p className="text-[10px] text-slate-400">
              {gameStatus === 'won' ? `Solved in ${guesses.length} attempts` : 'Better luck next try!'}
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              initGame();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:scale-105 transition"
          >
            Play Next
          </button>
        </div>
      )}

      {/* On-screen Cyber Keyboard */}
      <div className="w-full space-y-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const status = getKeyboardKeyStatus(key);
              let btnClass = 'bg-slate-800 text-slate-200 hover:bg-slate-700';

              if (status === 'correct') btnClass = 'bg-emerald-600 text-white';
              else if (status === 'present') btnClass = 'bg-amber-600 text-white';
              else if (status === 'absent') btnClass = 'bg-slate-950/80 text-slate-600 border border-slate-900';

              const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

              return (
                <button
                  key={key}
                  onClick={() => handleKeyInput(key)}
                  className={`h-10 sm:h-11 rounded-lg font-bold text-xs transition flex items-center justify-center ${btnClass} ${
                    isSpecial ? 'px-2.5 sm:px-3 text-[10px]' : 'w-7 sm:w-9'
                  }`}
                >
                  {key === 'BACKSPACE' ? <Delete className="w-4 h-4" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
