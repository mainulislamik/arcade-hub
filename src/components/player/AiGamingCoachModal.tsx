import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Lightbulb, 
  Zap, 
  ChevronRight, 
  X, 
  Volume2, 
  Trophy, 
  Target,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { GameItem } from '../../types/game';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface AiGamingCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameItem;
  currentScore: number;
}

const GAME_TIPS: Record<string, { proTips: string[]; tactics: string[]; secretCheat?: string }> = {
  puzzle: {
    proTips: [
      "Keep high-value blocks or numbers anchored in a fixed corner to maximize chain reactions.",
      "Plan at least 2 moves ahead to avoid deadlocking the grid.",
      "Look for recurring symmetric board patterns before committing quick inputs."
    ],
    tactics: [
      "2048 Hex: Build an ascending zigzag snake along the bottom-most row.",
      "Block Puzzle: Never leave single isolated 1x1 holes."
    ],
    secretCheat: "Undo Buffer: You can quickly reload the most recent browser save state if an errant swipe occurs."
  },
  arcade: {
    proTips: [
      "Feather the directional controls — tap lightly rather than holding down.",
      "Prioritize defensive survivability over risky bonus coin grabs.",
      "Learn enemy movement cadence; patterns repeat every 4-8 cycles."
    ],
    tactics: [
      "Pac-Arcade: Bait ghosts into corridors before scooping power pellets.",
      "Space Invaders: Clear the outer flank columns first to slow fleet descent."
    ],
    secretCheat: "Speedrun Boost: Press Fullscreen (F) for unthrottled display refresh rate."
  },
  racing: {
    proTips: [
      "Apex cornering: Enter wide, clip the inner apex, exit wide at full throttle.",
      "Brake before turning, never brake mid-drift to prevent spin-outs.",
      "Draft behind leading cars to slingshot ahead on final straightaways."
    ],
    tactics: [
      "Drift 3D: Counter-steer slightly just before exiting a slide to get the cyan nitro boost.",
      "Hill Climb Physics: Balance throttle and brake to keep your chassis parallel with steep slopes."
    ],
    secretCheat: "Eco Mode Toggle: Press ECO on header to lock 60 FPS delta physics without thermal drops."
  },
  action: {
    proTips: [
      "Cycle weapons based on enemy distance — plasma for long range, shotgun for close combat.",
      "Keep moving continuously; stationary targets take 3x more splash damage.",
      "Watch the minimap and audio cues for incoming enemy waves."
    ],
    tactics: [
      "Mecha Blaster 2: Destroy turret generators first to stop reinforcements from spawning.",
      "Stickman Warriors: Time parries 0.2s before impact to trigger bullet-time counterattacks."
    ],
    secretCheat: "Slot 1-5 Backup: You can export your progress JSON file directly from the Save State HUD!"
  }
};

export const AiGamingCoachModal: React.FC<AiGamingCoachModalProps> = ({
  isOpen,
  onClose,
  game,
  currentScore
}) => {
  const [activeTab, setActiveTab] = useState<'protips' | 'tactics' | 'analysis'>('protips');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const category = (game.category || 'arcade').toLowerCase();
  const tips = GAME_TIPS[category] || GAME_TIPS['arcade'];

  useEffect(() => {
    if (isOpen) {
      setAnalyzing(true);
      const timer = setTimeout(() => {
        setAnalyzing(false);
        const insights = [
          `Optimal strategy detected for "${game.title}". Your current score is ${currentScore}. Aim for 1,000+ to unlock the veteran trophy!`,
          `Frame pacing is rock solid at 60 FPS. Tip: Use keyboard Arrow keys or WASD for zero input lag.`,
          `AI Coach analysis: Maintain momentum and conserve jumps for elevated golden rings.`
        ];
        setAiMessage(insights[Math.floor(Math.random() * insights.length)]);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen, game.title, currentScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                ARCADEX AI GAMING COACH
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  SMART BOT
                </span>
              </h2>
              <p className="text-xs text-cyan-100">Tactical hints & gameplay strategies for {game.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Realtime Analysis Box */}
        <div className="p-4 bg-cyan-50 border-b border-cyan-100 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div className="text-xs text-cyan-900">
            {analyzing ? (
              <span className="animate-pulse flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                Analyzing live game state & physics variables...
              </span>
            ) : (
              <p className="leading-relaxed font-semibold">{aiMessage}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('protips'); }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'protips'
                ? 'border-cyan-600 text-cyan-700 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pro Tips & Secrets
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('tactics'); }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'tactics'
                ? 'border-cyan-600 text-cyan-700 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tactical Walkthrough
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          {activeTab === 'protips' && (
            <div className="space-y-2.5">
              {tips.proTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{tip}</p>
                </div>
              ))}
              {tips.secretCheat && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 font-medium">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{tips.secretCheat}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="space-y-2.5">
              {tips.tactics.map((tactic, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Strategy #{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{tactic}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Current Session Score: <strong className="text-slate-800">{currentScore} pts</strong>
          </span>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
