import React from 'react';
import { PlayerProfile } from '../types/game';
import { GAMES_CATALOG } from '../data/games';
import { X, Trophy, Gamepad2, Heart, Trash2, Download, Upload, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onResetData: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onResetData,
}) => {
  if (!isOpen) return null;

  const totalHighScoresSum = Object.values(profile.gameStats).reduce(
    (acc, cur) => acc + (cur.highScore || 0),
    0
  );

  const exportSaveData = () => {
    sounds.playCoin();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arcadex_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importSaveData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = event => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          localStorage.setItem('arcade_hub_player_profile', JSON.stringify(parsed));
          sounds.playVictory();
          window.location.reload();
        } catch {
          alert('Invalid backup file format.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100 font-display">PLAYER STATS</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>Plays</span>
              </div>
              <span className="text-2xl font-black font-mono text-cyan-400">
                {profile.totalGamesPlayed}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Favorites</span>
              </div>
              <span className="text-2xl font-black font-mono text-rose-400">
                {profile.favoriteGames.length}
              </span>
            </div>
          </div>

          {/* High Scores List */}
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
            Game High Scores
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {GAMES_CATALOG.map(game => {
              const stat = profile.gameStats[game.id];
              const score = stat?.highScore || 0;
              const plays = stat?.timesPlayed || 0;

              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🎮</span>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{game.title}</span>
                      <span className="text-[10px] text-slate-500">{plays} session(s) played</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-amber-400">{score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Backup & Reset Controls */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportSaveData}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-bold rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" /> Backup Data
            </button>
            <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-bold rounded-xl transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Restore
              <input type="file" accept=".json" onChange={importSaveData} className="hidden" />
            </label>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all your local high scores and stats?')) {
                onResetData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-rose-400 hover:bg-rose-500/10 text-xs font-bold rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Local High Scores
          </button>
        </div>
      </div>
    </div>
  );
};
