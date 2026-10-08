import React from 'react';
import { PlayerProfile, GameStats } from '../types/game';
import { GAMES_CATALOG } from '../data/games';
import { X, Trophy, Gamepad2, Heart, Trash2, Download, Upload, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { defaultProfile, resetProfile } from '../utils/storage';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onUpdateProfile?: (newProfile: PlayerProfile) => void;
  onResetProfile?: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetProfile,
}) => {
  if (!isOpen) return null;

  // Export profile as JSON
  const handleExportData = () => {
    sounds.playClick();
    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arcadex_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import profile from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && typeof imported === 'object' && imported.gameStats) {
          localStorage.setItem('arcade_hub_player_profile', JSON.stringify(imported));
          if (onUpdateProfile) onUpdateProfile(imported);
          sounds.playPowerup();
          alert('Save data restored successfully!');
        } else {
          alert('Invalid save file format.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Reset data handler
  const handleReset = () => {
    sounds.playClick();
    if (confirm('Are you sure you want to reset all high scores, stats, and achievements? This cannot be undone.')) {
      const empty = resetProfile();
      if (onUpdateProfile) onUpdateProfile(empty);
      if (onResetProfile) onResetProfile();
    }
  };

  const playedGamesCount = Object.keys(profile.gameStats).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => {
          sounds.playClick();
          onClose();
        }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Trophy className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Player Stats & Data</h3>
                <p className="text-xs text-slate-500">Local guest profile statistics</p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Quick summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Games Played
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {profile.totalGamesPlayed}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Unique Games
                </span>
                <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">
                  {playedGamesCount}/{GAMES_CATALOG.length}
                </p>
              </div>
            </div>

            {/* Individual Game Scores */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                <span>Game Highscores</span>
                <span>{playedGamesCount} active</span>
              </h4>

              {playedGamesCount > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(profile.gameStats).map(([gameId, stat]) => {
                    const game = GAMES_CATALOG.find((g) => g.id === gameId);
                    if (!game) return null;

                    return (
                      <div
                        key={gameId}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{game.icon || '🎮'}</span>
                          <div>
                            <p className="font-bold text-slate-900">{game.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {stat.plays} sessions played
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <p className="font-black text-indigo-600 text-sm">
                            {stat.highScore.toLocaleString()}
                          </p>
                          <span className="text-[10px] text-slate-400">Score</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  <Gamepad2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No game records yet. Start playing any game to establish your high scores!
                </div>
              )}
            </div>

            {/* Save & Backup Controls */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Data Management
              </h4>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-indigo-600 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Save Backup (JSON)</span>
                </button>

                <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer shadow-sm">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Restore Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition mt-2"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Clear All Game Records</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero cookies tracking • 100% Client-Side Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
