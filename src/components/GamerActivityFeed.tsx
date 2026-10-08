import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Flame, Sparkles, Award, Zap } from 'lucide-react';

interface FeedItem {
  id: string;
  gamerTag: string;
  avatarBg: string;
  action: string;
  game: string;
  scoreOrBadge: string;
  timeAgo: string;
  type: 'score' | 'achievement' | 'win';
}

const INITIAL_FEED: FeedItem[] = [
  { id: '1', gamerTag: 'ShadowBlade', avatarBg: 'bg-indigo-600', action: 'achieved high score', game: 'Galaxy Defender', scoreOrBadge: '18,450 pts', timeAgo: '2m ago', type: 'score' },
  { id: '2', gamerTag: 'NeonRider_BD', avatarBg: 'bg-emerald-600', action: 'unlocked trophy', game: 'Word Quest', scoreOrBadge: 'Vocabulary Titan 🏆', timeAgo: '5m ago', type: 'achievement' },
  { id: '3', gamerTag: 'CyberPulse', avatarBg: 'bg-amber-600', action: 'reached tile 2048 in', game: '2048 Master', scoreOrBadge: '408 moves', timeAgo: '8m ago', type: 'win' },
  { id: '4', gamerTag: 'PixelQueen', avatarBg: 'bg-rose-600', action: 'destroyed 42 asteroids in', game: 'Asteroid Blaster', scoreOrBadge: 'Wave 14 🚀', timeAgo: '11m ago', type: 'score' },
  { id: '5', gamerTag: 'GhostHunter_99', avatarBg: 'bg-cyan-600', action: 'cleared level without death', game: 'Pac Maze', scoreOrBadge: 'Flawless Run ⭐', timeAgo: '14m ago', type: 'win' },
];

export const GamerActivityFeed: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);

  useEffect(() => {
    const randomGamers = ['Vortex_9', 'AlphaZero', 'ApexLegend', 'SwiftRunner', 'NovaGamer', 'MatrixDrifter'];
    const games = ['Retro Snake', 'Neon Breakout', 'Cyber Minesweeper', 'Connect 4', 'Bubble Shooter'];
    
    const interval = setInterval(() => {
      const randomGamer = randomGamers[Math.floor(Math.random() * randomGamers.length)];
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomScore = Math.floor(Math.random() * 8000) + 1200;
      
      const newItem: FeedItem = {
        id: Date.now().toString(),
        gamerTag: randomGamer,
        avatarBg: ['bg-indigo-600', 'bg-purple-600', 'bg-teal-600', 'bg-blue-600'][Math.floor(Math.random() * 4)],
        action: 'set new record in',
        game: randomGame,
        scoreOrBadge: `${randomScore.toLocaleString()} pts`,
        timeAgo: 'Just now',
        type: 'score'
      };

      setFeed(prev => [newItem, ...prev.slice(0, 5)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>PLAYSTATION NETWORK LIVE PULSE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <p className="text-[11px] text-slate-500">Realtime community triumphs & record breakers</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Live Sync • 0% Server Load
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {feed.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-200"
          >
            <div className={`w-9 h-9 rounded-xl ${item.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-sm flex-shrink-0`}>
              {item.gamerTag.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 truncate">{item.gamerTag}</span>
                <span className="text-[10px] text-slate-400 font-mono">{item.timeAgo}</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                {item.action} <strong className="text-indigo-600">{item.game}</strong>
              </p>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-mono">
                {item.scoreOrBadge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
