import React from 'react';
import { PlayerProfile } from '../types/game';
import { GAMES_CATALOG } from '../data/games';
import { X, Trophy, Gamepad2, Heart, Trash2, Download, Upload, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onResetProfile?: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({ isOpen, onClose, profile, onResetProfile }) => {
  if (!isOpen) return null;

  const totalPlays = profile.totalGamesPlayed;
  const uniqueGamesPlayed = Object.keys(profile.gameStats).length;

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arcadex_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to reset all local high scores and statistics? This cannot be undone.")) {
      if (onResetProfile) onResetProfile();
      else localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slide-left">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Player Dashboard</h3>
                <p className="text-[11px] text-slate-400">100% Local Device Persistence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Total Plays
              </span>
              <p className="text-2xl font-bold font-mono text-white">{totalPlays}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Favorites
              </span>
              <p className="text-2xl font-bold font-mono text-white">{profile.favoriteGames.length}</p>
            </div>
          </div>

          {/* Game High Scores Leaderboard */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider">
              Local High Scores
            </h4>
            <div className="space-y-2">
              {GAMES_CATALOG.map((game) => {
                const stat = profile.gameStats[game.id];
                const best = stat?.highScore || 0;
                const plays = stat?.plays || 0;

                return (
                  <div
                    key={game.id}
                    className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{game.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Plays: {plays}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {best > 0 ? best.toLocaleString() : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Portability & Storage Controls */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Save Data</span>
            </button>

            <button
              onClick={handleClearData}
              className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/50 text-rose-400 transition"
              title="Reset All High Scores"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center font-mono">
            Zero telemetry. Zero cookies. Privacy by design.
          </p>
        </div>
      </div>
    </div>
  );
};
