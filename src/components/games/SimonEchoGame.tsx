import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';

interface SimonEchoProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

const PAD_CONFIG = [
  { id: 0, color: 'bg-emerald-500', activeColor: 'bg-emerald-300 shadow-emerald-400', freq: 330, name: 'GREEN' },
  { id: 1, color: 'bg-rose-500', activeColor: 'bg-rose-300 shadow-rose-400', freq: 440, name: 'RED' },
  { id: 2, color: 'bg-amber-500', activeColor: 'bg-amber-300 shadow-amber-400', freq: 554, name: 'YELLOW' },
  { id: 3, color: 'bg-blue-500', activeColor: 'bg-blue-300 shadow-blue-400', freq: 659, name: 'BLUE' },
];

export const SimonEchoGame: React.FC<SimonEchoProps> = ({ onScoreUpdate, onGameOver }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const playPadSound = (freq: number) => {
    sounds.playBeep(freq, 'sine', 0.25, 0.3);
  };

  const nextRound = useCallback((currentSeq: number[]) => {
    setIsPlayingSequence(true);
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setPlayerIndex(0);
    setRound(newSeq.length);

    // Playback sequence
    newSeq.forEach((padId, index) => {
      setTimeout(() => {
        setActivePad(padId);
        playPadSound(PAD_CONFIG[padId].freq);
        setTimeout(() => setActivePad(null), 350);
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      setIsPlayingSequence(false);
    }, (newSeq.length + 1) * 600);
  }, []);

  const startGame = () => {
    sounds.playLaser();
    setGameState('playing');
    setRound(0);
    nextRound([]);
  };

  const handlePadClick = (padId: number) => {
    if (gameState !== 'playing' || isPlayingSequence) return;

    setActivePad(padId);
    playPadSound(PAD_CONFIG[padId].freq);
    setTimeout(() => setActivePad(null), 200);

    if (sequence[playerIndex] === padId) {
      const nextIdx = playerIndex + 1;
      setPlayerIndex(nextIdx);

      if (nextIdx === sequence.length) {
        // Round Clear!
        sounds.playCoin();
        const pts = sequence.length * 150;
        if (pts > highScore) setHighScore(pts);
        if (onScoreUpdate) onScoreUpdate(pts);

        if (sequence.length % 5 === 0) {
          confetti({ particleCount: 50, spread: 60 });
        }

        setTimeout(() => {
          nextRound(sequence);
        }, 800);
      }
    } else {
      // Game Over
      sounds.playGameOver();
      setGameState('gameover');
      const finalScore = (sequence.length - 1) * 150;
      recordGamePlay('simon-echo', finalScore);
      if (onGameOver) onGameOver(finalScore);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-sm w-full bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎛️</span>
          <div>
            <h3 className="text-sm font-bold text-white">Simon Cyber Echo</h3>
            <p className="text-[10px] text-slate-400">Audio & Visual Pattern Memory</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Round</span>
          <span className="text-base font-bold font-mono text-cyan-400">{round}</span>
        </div>
      </div>

      {/* 4 Simon Pads */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-4 bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-full h-full">
          {PAD_CONFIG.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isPlayingSequence || gameState !== 'playing'}
                className={`w-full h-full rounded-2xl transition-all duration-150 transform active:scale-95 ${
                  isActive ? `${pad.activeColor} shadow-2xl scale-105 brightness-125` : `${pad.color} opacity-80 hover:opacity-100`
                }`}
              />
            );
          })}
        </div>

        {/* Center Control Disc */}
        <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-4 border-slate-800 flex flex-col items-center justify-center shadow-xl">
          {gameState !== 'playing' ? (
            <button
              onClick={startGame}
              className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold hover:scale-110 transition shadow-lg"
            >
              <Play className="w-6 h-6 fill-current" />
            </button>
          ) : (
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 block">
                {isPlayingSequence ? 'LISTEN' : 'YOUR TURN'}
              </span>
              <span className="text-sm font-bold font-mono text-white">
                {playerIndex}/{sequence.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {gameState === 'gameover' && (
        <div className="mt-4 p-3 w-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between animate-fade-in">
          <p className="text-xs font-bold text-rose-400">💥 Sequence Broken!</p>
          <button
            onClick={startGame}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
