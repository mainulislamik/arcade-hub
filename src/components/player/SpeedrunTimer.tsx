import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  Trophy, 
  Download, 
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface SpeedrunTimerProps {
  gameId: string;
  gameTitle: string;
  isGameActive?: boolean;
}

export const SpeedrunTimer: React.FC<SpeedrunTimerProps> = ({
  gameId,
  gameTitle
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [splits, setSplits] = useState<{ id: number; name: string; timeMs: number }[]>([]);
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    const raw = localStorage.getItem(`arcadex_pb_${gameId}`);
    return raw ? parseInt(raw, 10) : null;
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedMs;
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleToggle = () => {
    sounds.playClick();
    if (!isRunning && elapsedMs === 0) {
      sounds.announceVoice('SPEEDRUN STARTED!');
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sounds.playClick();
    setIsRunning(false);
    setElapsedMs(0);
    setSplits([]);
  };

  const handleSplit = () => {
    if (!isRunning) return;
    sounds.playCoin();
    const newSplit = {
      id: splits.length + 1,
      name: `Split ${splits.length + 1}`,
      timeMs: elapsedMs
    };
    setSplits(prev => [...prev, newSplit]);
  };

  const handleFinishRun = () => {
    if (!isRunning) return;
    setIsRunning(false);

    if (!personalBest || elapsedMs < personalBest) {
      setPersonalBest(elapsedMs);
      localStorage.setItem(`arcadex_pb_${gameId}`, elapsedMs.toString());
      sounds.announceVoice('NEW PERSONAL BEST!');
      sounds.playVictory();
    } else {
      sounds.playVictory();
      sounds.announceVoice('RUN COMPLETE!');
    }
  };

  const handleExportRun = () => {
    sounds.playClick();
    const runData = {
      gameId,
      gameTitle,
      date: new Date().toISOString(),
      finalTimeMs: elapsedMs,
      formattedTime: formatTime(elapsedMs),
      splits: splits.map(s => ({ name: s.name, time: formatTime(s.timeMs) }))
    };

    const blob = new Blob([JSON.stringify(runData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedrun-${gameId}-${Date.now()}.arcadex-run`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Timer className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
              <span>SPEEDRUN TIMER</span>
              {personalBest && (
                <span className="text-amber-400 flex items-center gap-0.5">
                  <Trophy className="w-3 h-3" />
                  PB: {formatTime(personalBest)}
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black tracking-wider text-emerald-400">
              {formatTime(elapsedMs)}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggle}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isRunning 
                ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {isRunning && (
            <button
              onClick={handleSplit}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
              title="Record Split"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleFinishRun}
              className="px-2.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1"
              title="Finish Speedrun"
            >
              <Zap className="w-3.5 h-3.5" />
              FINISH
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Splits & Export Drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Run Splits ({splits.length})</span>
            {splits.length > 0 && (
              <button
                onClick={handleExportRun}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Export .arcadex-run
              </button>
            )}
          </div>

          {splits.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic py-1">No splits recorded yet. Press Flag icon during speedrun.</div>
          ) : (
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {splits.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs font-mono bg-slate-800/60 px-2 py-1 rounded-lg">
                  <span className="text-slate-300">{s.name}</span>
                  <span className="text-emerald-400 font-bold">{formatTime(s.timeMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
