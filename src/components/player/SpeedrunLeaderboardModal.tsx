import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Trophy, 
  Zap, 
  Flame, 
  Medal, 
  RotateCcw, 
  X, 
  Sparkles, 
  Download, 
  Play, 
  Check, 
  Crown,
  ChevronRight
} from 'lucide-react';
import { GameItem } from '../../types/game';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface SpeedrunRecord {
  id: string;
  playerName: string;
  gameId: string;
  gameTitle: string;
  timeMs: number;
  formattedTime: string;
  date: string;
  ghostData?: number[];
}

interface SpeedrunLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: GameItem | null;
  onPlayGame?: (gameId: string) => void;
}

const STORAGE_KEY = 'arcadex_speedrun_records';

export const SpeedrunLeaderboardModal: React.FC<SpeedrunLeaderboardModalProps> = ({
  isOpen,
  onClose,
  game,
  onPlayGame
}) => {
  const [records, setRecords] = useState<SpeedrunRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        // Seed initial high scores
        const initial: SpeedrunRecord[] = [
          { id: '1', playerName: 'ShadowRunner', gameId: 'nokiabounc-jdifc8jb', gameTitle: 'Nokia Bounce 2D', timeMs: 42350, formattedTime: '00:42.350', date: '2026-10-09' },
          { id: '2', playerName: 'SpeedyApex', gameId: 'subway3d-run-x912b', gameTitle: 'Subway Surfer 3D', timeMs: 58120, formattedTime: '00:58.120', date: '2026-10-09' },
          { id: '3', playerName: 'CyberRacer', gameId: 'drift3d-neon-9912z', gameTitle: 'Drift 3D Hyper Drive', timeMs: 31400, formattedTime: '00:31.400', date: '2026-10-09' },
          { id: '4', playerName: 'PixelNinja', gameId: 'nokiabounc-jdifc8jb', gameTitle: 'Nokia Bounce 2D', timeMs: 48900, formattedTime: '00:48.900', date: '2026-10-08' },
          { id: '5', playerName: 'VoxelAce', gameId: 'slope3d-neon-k391a', gameTitle: 'Slope 3D Extreme', timeMs: 64200, formattedTime: '01:04.200', date: '2026-10-08' }
        ];
        setRecords(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.warn('Failed to load speedrun records:', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRecords = (activeTab === 'current' && game)
    ? records.filter(r => r.gameId === game.id).sort((a, b) => a.timeMs - b.timeMs)
    : [...records].sort((a, b) => a.timeMs - b.timeMs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden shadow-amber-950/50 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Timer className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                SPEEDRUN HALL OF FAME
                <Crown className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-amber-100 font-medium">Millisecond precision time trials & ghost records</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60">
          {game && (
            <button
              onClick={() => { sounds.playClick(); setActiveTab('current'); }}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'current'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {game.title} Records
            </button>
          )}
          <button
            onClick={() => { sounds.playClick(); setActiveTab('all'); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Global High Scores
          </button>
        </div>

        {/* Leaderboard Table List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-96">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Timer className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-sm font-bold text-slate-400">No speedrun records logged yet!</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to complete this stage and claim the #1 Crown.</p>
            </div>
          ) : (
            filteredRecords.map((rec, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isFirst 
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 shadow-md shadow-amber-950/30'
                      : isSecond
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : isThird
                      ? 'bg-amber-950/20 border-amber-900/40 text-slate-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isFirst 
                        ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/50' 
                        : isSecond 
                        ? 'bg-slate-300 text-slate-900' 
                        : isThird 
                        ? 'bg-amber-700 text-amber-100' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isFirst ? <Crown className="w-4 h-4 fill-current" /> : `#${index + 1}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white truncate">{rec.playerName}</span>
                        {isFirst && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            RECORD
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">{rec.gameTitle} • {rec.date}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-mono font-black text-amber-400 tracking-wider">
                      {rec.formattedTime}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Auto-synced with Speedrun Timer</span>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-900/40 cursor-pointer"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
