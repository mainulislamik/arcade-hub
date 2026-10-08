import React, { useState } from 'react';
import { GameItem, PlayerProfile } from '../types/game';
import {
  Trophy,
  Flame,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Dice5,
  Star,
  CheckCircle2,
  Clock,
  Swords,
  Layers,
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface BentoGridSectionProps {
  games: GameItem[];
  profile: PlayerProfile;
  onSelectGame: (game: GameItem) => void;
  onOpenAchievements: () => void;
  onOpenStats: () => void;
}

export const BentoGridSection: React.FC<BentoGridSectionProps> = ({
  games,
  profile,
  onSelectGame,
  onOpenAchievements,
  onOpenStats,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<GameItem | null>(null);

  // Daily Deterministic Quest Calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyGameIndex = Math.abs(
    todayStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % (games.length || 1);
  const dailyGame = games[dailyGameIndex] || games[0];

  // Calculate Gamer Level and XP
  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;
  const totalXP = profile.totalGamesPlayed * 50 + unlockedCount * 250;
  const gamerLevel = Math.floor(totalXP / 500) + 1;
  const currentLevelXP = totalXP % 500;
  const levelProgress = Math.min(100, Math.round((currentLevelXP / 500) * 100));

  const handleRandomSpin = () => {
    if (isSpinning || games.length === 0) return;
    setIsSpinning(true);
    setSpinResult(null);
    sounds.playPowerup();

    let count = 0;
    const interval = setInterval(() => {
      const rand = games[Math.floor(Math.random() * games.length)];
      setSpinResult(rand);
      sounds.playClick();
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        sounds.playVictory();
      }
    }, 90);
  };

  const topFavorites = profile.favoriteGames
    .map((id) => games.find((g) => g.id === id))
    .filter((g): g is GameItem => Boolean(g));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Gamer Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Level Up & Daily Quests
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Claim daily bonus rewards, spin for random challenges, and track your arcade status.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button
            onClick={onOpenStats}
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Full Stats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento 1: Daily Quest Card (Col 1-7) */}
        <div className="md:col-span-7 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          {/* Background Decorative Rings */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-purple-500/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>Today's Featured Quest</span>
              </span>
              <span className="text-xs font-mono text-indigo-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Resets in 24h</span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {dailyGame.title} Challenge
            </h3>
            <p className="text-sm text-indigo-100/90 line-clamp-2 max-w-lg mb-4">
              {dailyGame.description} Complete a run today to earn double XP and boost your arcade standing.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-medium backdrop-blur-xs">
                Category: {dailyGame.category.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-medium backdrop-blur-xs">
                Rating: ⭐ {dailyGame.rating}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold">
                +250 Bonus XP
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="text-xs font-semibold text-indigo-100">
                Play now to register on local leaderboard
              </span>
            </div>

            <button
              onClick={() => {
                sounds.playVictory();
                onSelectGame(dailyGame);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-xl shadow-md hover:scale-105 active:scale-100 transition-all cursor-pointer"
            >
              <span>Play Quest Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bento 2: Gamer Level & XP Progress Card (Col 8-12) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black text-base shadow-xs">
                  {gamerLevel}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase font-mono">Current Status</div>
                  <div className="text-base font-black text-slate-900">
                    Arcade Rank Level {gamerLevel}
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenAchievements}
                className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="View All Achievements"
              >
                <Trophy className="w-5 h-5" />
              </button>
            </div>

            {/* XP Bar */}
            <div className="space-y-1.5 my-4">
              <div className="flex justify-between text-xs font-bold text-slate-700 font-mono">
                <span>XP Progress</span>
                <span>
                  {currentLevelXP} / 500 XP ({levelProgress}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Earn 50 XP per game played and 250 XP per unlocked achievement badge.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-[11px] font-medium text-slate-500">Total Played</div>
              <div className="text-lg font-black text-slate-900 font-mono">
                {profile.totalGamesPlayed}
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-[11px] font-medium text-slate-500">Badges Unlocked</div>
              <div className="text-lg font-black text-indigo-600 font-mono">
                {unlockedCount} / {profile.achievements.length}
              </div>
            </div>
          </div>
        </div>

        {/* Bento 3: Spin & Play Game Roulette (Col 1-6) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <Dice5 className="w-3.5 h-3.5 text-amber-600" />
                <span>Indecisive? Spin & Play</span>
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Arcade Surprise Roulette
            </h3>
            <p className="text-xs text-slate-600">
              Can't choose which game to tackle next? Let the procedural randomizer pick one for you.
            </p>
          </div>

          {/* Result Card Box */}
          <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between min-h-[72px]">
            {spinResult ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-indigo-600 font-bold">Selected Game</div>
                  <div className="text-sm font-black text-slate-900">{spinResult.title}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Press 'Spin Roulette' to discover a random game!
              </div>
            )}

            {spinResult && !isSpinning && (
              <button
                onClick={() => {
                  sounds.playVictory();
                  onSelectGame(spinResult);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Play This
              </button>
            )}
          </div>

          <button
            onClick={handleRandomSpin}
            disabled={isSpinning}
            className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Dice5 className={`w-4 h-4 ${isSpinning ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSpinning ? 'Rolling Roulette...' : 'Spin Random Game'}</span>
          </button>
        </div>

        {/* Bento 4: Quick Favorite Launchpad & Retro Highlights (Col 7-12) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-mono font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-pink-600" />
                <span>Your Pinned & Quick Access</span>
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Pinned Quick Launcher
            </h3>
            <p className="text-xs text-slate-600">
              Fast-track your favorite and most played titles with 1-click launch.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 my-4">
            {(topFavorites.length > 0 ? topFavorites.slice(0, 4) : games.slice(0, 4)).map((g) => (
              <button
                key={`bento-fav-${g.id}`}
                onClick={() => {
                  sounds.playLaser();
                  onSelectGame(g);
                }}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 group-hover:text-indigo-600 font-bold">
                    {g.category}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">★ {g.rating}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                  {g.title}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Client Offline Ready</span>
            </span>
            <span className="font-mono text-slate-400">Total Games: {games.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
