import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Timer, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay, getGameHighScore } from '../../utils/storage';

interface MemoryFlipGameProps {
  onScoreUpdate?: (score: number, isHigh: boolean) => void;
}

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICONS = ['🚀', '👾', '⚡', '💎', '🔥', '🤖', '🎮', '🌟'];

export const MemoryFlipGame: React.FC<MemoryFlipGameProps> = ({ onScoreUpdate }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getGameHighScore('memory-flip'));
  const [timer, setTimer] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const initGame = useCallback(() => {
    const deck: Card[] = [];
    const pairedIcons = [...ICONS, ...ICONS];
    // Shuffle
    for (let i = pairedIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairedIcons[i], pairedIcons[j]] = [pairedIcons[j], pairedIcons[i]];
    }

    pairedIcons.forEach((icon, idx) => {
      deck.push({
        id: idx,
        icon,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setTimer(60);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPlaying(true);
    sounds.playMove();
  }, []);

  const handleCardClick = (id: number) => {
    if (!isPlaying || isGameOver || flippedCards.length >= 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    sounds.playClick();
    const newFlipped = [...flippedCards, id];
    setCards(prev => prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c)));
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        // Matched
        setTimeout(() => {
          sounds.playCoin();
          setCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );
          setFlippedCards([]);
          setScore(s => s + 150);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  // Check victory
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched) && isPlaying && !isVictory) {
      setIsVictory(true);
      setIsPlaying(false);
      sounds.playVictory();
      confetti({ particleCount: 100, spread: 80 });

      const finalScore = score + timer * 20;
      setScore(finalScore);
      const { isNewHighScore, stats } = recordGamePlay('memory-flip', finalScore);
      if (isNewHighScore) setHighScore(stats.highScore);
      if (onScoreUpdate) onScoreUpdate(finalScore, isNewHighScore);
    }
  }, [cards, isPlaying, isVictory, score, timer, onScoreUpdate]);

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          setIsGameOver(true);
          setIsPlaying(false);
          sounds.playGameOver();
          const { isNewHighScore, stats } = recordGamePlay('memory-flip', score);
          if (isNewHighScore) setHighScore(stats.highScore);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isVictory, score]);

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-lg mx-auto select-none">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-purple-400">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400">
            <Timer className="w-4 h-4" />
            <span className="text-lg font-bold font-mono">{timer}s</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">MOVES</span>
            <span className="text-base font-bold font-mono text-slate-200">{moves}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">BEST</span>
          <span className="text-xl font-bold font-mono text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] p-3 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl flex flex-col justify-center">
        {cards.length === 0 || !isPlaying ? (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
            <h3 className="text-3xl font-extrabold text-purple-400 font-display mb-2">MATRIX MEMORY FLIP</h3>
            <p className="text-slate-300 text-xs mb-6 max-w-xs">Match all 8 pairs of cyber symbols before the countdown timer expires!</p>
            <button
              onClick={initGame}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" /> Start Game
            </button>
          </div>
        ) : null}

        {/* Victory / Game Over Overlay */}
        {(isGameOver || isVictory) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in">
            {isVictory ? (
              <>
                <Sparkles className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
                <h3 className="text-3xl font-extrabold text-yellow-400 font-display mb-1">ALL MATCHED!</h3>
                <p className="text-slate-300 text-sm mb-4">Total Score: <span className="font-mono text-purple-400 font-bold text-lg">{score}</span></p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-extrabold text-rose-500 font-display mb-2">TIME UP!</h3>
                <p className="text-slate-300 text-sm mb-4">Final Score: <span className="font-mono text-purple-400 font-bold text-lg">{score}</span></p>
              </>
            )}
            <button
              onClick={initGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}

        {/* 4x4 Cards Matrix */}
        <div className="grid grid-cols-4 gap-2.5 w-full h-full">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-200 transform active:scale-95 ${
                card.isFlipped || card.isMatched
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/30 rotate-0'
                  : 'bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-transparent'
              }`}
            >
              {(card.isFlipped || card.isMatched) && card.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
