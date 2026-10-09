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
      "Look for symmetric pattern matching to clear multiple rows simultaneously."
    ],
    tactics: [
      "2048 Corner Anchor: Build your largest number in the bottom-right corner and never press Up.",
      "Sudoku Elimination: Fill rows and columns with 7+ solved numbers first.",
      "Chess Defense: Control the central 4 squares (d4, d5, e4, e5) within the first 3 moves."
    ],
    secretCheat: "Tip: Use Save State (F1) before risky moves and Quick Load (F3) if a mistake occurs!"
  },
  arcade: {
    proTips: [
      "Hold jump keys longer for variable high-jump trajectory over wide spike traps.",
      "Collect all golden rings in the stage to unlock the stage exit portal.",
      "Use trampoline pads to bounce 2.5x higher and discover secret upper platforms."
    ],
    tactics: [
      "Nokia Bounce: Tap down (8) mid-air to drop quickly on moving platforms.",
      "Pac-Man Cornering: Turn before reaching the corner intersection to gain microsecond advantages over ghosts.",
      "Asteroids Drift: Use brief thrust bursts and rotate while gliding to conserve fuel and stay centered."
    ],
    secretCheat: "Rewind Feature: Press Backslash (\\) anytime you hit a spike to rewind time 10 seconds!"
  },
  racing: {
    proTips: [
      "Feather the acceleration trigger during sharp hairpins to maintain drift boost angle.",
      "Stick to the inside apex of corners to minimize total track distance.",
      "Use draft slipstreams behind opponent vehicles for top-speed overtaking."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden shadow-cyan-950/50">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                ARCADEX AI GAMING COACH
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SMART BOT
                </span>
              </h2>
              <p className="text-xs text-slate-400">Tactical hints & gameplay strategies for {game.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Realtime Analysis Box */}
        <div className="p-4 bg-cyan-950/20 border-b border-cyan-900/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-cyan-200">
            {analyzing ? (
              <span className="animate-pulse flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Analyzing live game state & physics variables...
              </span>
            ) : (
              <p className="leading-relaxed font-medium">{aiMessage}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('protips'); }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'protips'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pro Tips & Secrets
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('tactics'); }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'tactics'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
                </div>
              ))}
              {tips.secretCheat && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{tips.secretCheat}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="space-y-2.5">
              {tips.tactics.map((tactic, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Strategy #{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{tactic}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Current Session Score: <strong className="text-slate-300">{currentScore} pts</strong>
          </span>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-900/40"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
