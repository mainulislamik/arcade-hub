import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  X, 
  Award, 
  Dices, 
  Gift, 
  Lock, 
  Flame,
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  UserGamificationState, 
  getGamificationState, 
  claimQuestReward, 
  addXpAndCoins, 
  saveGamificationState, 
  AVATARS,
  recordQuestAction
} from '../../utils/gamification';
import { sounds } from '../../utils/soundEngine';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelUpAlert?: (level: number) => void;
}

const WHEEL_PRIZES = [
  { label: '50 Coins', coins: 50, xp: 50, color: '#f59e0b' },
  { label: '100 XP', coins: 20, xp: 100, color: '#6366f1' },
  { label: '200 Coins', coins: 200, xp: 80, color: '#10b981' },
  { label: '500 XP JACKPOT', coins: 150, xp: 500, color: '#ec4899' },
  { label: '75 Coins', coins: 75, xp: 60, color: '#3b82f6' },
  { label: '250 XP', coins: 40, xp: 250, color: '#8b5cf6' },
];

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  onLevelUpAlert
}) => {
  const [state, setState] = useState<UserGamificationState>(() => getGamificationState());
  const [activeTab, setActiveTab] = useState<'quests' | 'wheel' | 'avatars'>('quests');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setState(getGamificationState());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const canSpinToday = state.lastSpinDate !== today;

  const handleClaim = (questId: string) => {
    sounds.playLevelUp();
    const updated = claimQuestReward(questId);
    setState({ ...updated });
  };

  const handleSpinWheel = () => {
    if (isSpinning || !canSpinToday) return;

    sounds.playPowerup();
    setIsSpinning(true);
    setSpinResult(null);

    // Calculate random slice
    const sliceIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const sliceAngle = 360 / WHEEL_PRIZES.length;
    const randomRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const targetAngle = randomRotations * 360 + (360 - sliceIndex * sliceAngle - sliceAngle / 2);

    setWheelRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = WHEEL_PRIZES[sliceIndex];
      sounds.playCoin();
      setSpinResult(prize.label);

      const { state: updatedState, leveledUp } = addXpAndCoins(prize.xp, prize.coins);
      updatedState.lastSpinDate = today;
      saveGamificationState(updatedState);
      setState({ ...updatedState });
      recordQuestAction('spin', 1);

      if (leveledUp && onLevelUpAlert) {
        onLevelUpAlert(updatedState.level);
      }
    }, 3500);
  };

  const handleSelectAvatar = (avatarId: string) => {
    if (state.unlockedAvatars.includes(avatarId)) {
      sounds.playClick();
      const updated = { ...state, selectedAvatar: avatarId };
      saveGamificationState(updated);
      setState(updated);
    }
  };

  const xpProgress = (state.xp % 500) / 500 * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner">
              {AVATARS.find(a => a.id === state.selectedAvatar)?.icon || '👾'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">Level {state.level} Arcade Hero</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {state.coins} Coins
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-0.5">Arcadex Quest & Reward Hub</h2>
              
              {/* Level XP Progress Bar */}
              <div className="mt-2 w-full max-w-sm">
                <div className="flex justify-between text-[11px] font-bold text-indigo-200 mb-1">
                  <span>{state.xp % 500} / 500 XP</span>
                  <span>Next Level: {state.level + 1}</span>
                </div>
                <div className="h-2 w-full bg-indigo-950/60 rounded-full overflow-hidden border border-indigo-400/20">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 border-b border-indigo-700/50 pb-0">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('quests');
              }}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'quests'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Daily Quests
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('wheel');
              }}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'wheel'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              Lucky Wheel {canSpinToday && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('avatars');
              }}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'avatars'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Cyber Avatars
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {/* TAB 1: DAILY QUESTS */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Missions (Resets Midnight)</span>
                <span className="text-xs font-bold text-indigo-600">
                  {state.quests.filter(q => q.claimed).length} of {state.quests.length} Claimed
                </span>
              </div>

              {state.quests.map((quest) => (
                <div 
                  key={quest.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    quest.claimed
                      ? 'bg-slate-100 border-slate-200 opacity-60'
                      : quest.completed
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{quest.title}</h4>
                      {quest.claimed && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{quest.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            quest.completed ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 shrink-0">
                        {quest.progress} / {quest.target}
                      </span>
                    </div>
                  </div>

                  {/* Rewards & Claim Button */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        +{quest.rewardXp} XP
                      </span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        +{quest.rewardCoins}
                      </span>
                    </div>

                    {quest.completed && !quest.claimed ? (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        CLAIM!
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">
                        {quest.claimed ? 'Done' : 'In Progress'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LUCKY SPIN WHEEL */}
          {activeTab === 'wheel' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
                {/* Pointer / Needle */}
                <div className="absolute -top-3 z-30 w-6 h-8 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-600 filter drop-shadow-md" />
                </div>

                {/* Spinning Wheel */}
                <div 
                  className="w-full h-full rounded-full border-4 border-indigo-900 shadow-2xl relative overflow-hidden transition-transform duration-[3500ms] ease-out flex items-center justify-center"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    background: 'conic-gradient(#f59e0b 0% 16.66%, #6366f1 16.66% 33.33%, #10b981 33.33% 50%, #ec4899 50% 66.66%, #3b82f6 66.66% 83.33%, #8b5cf6 83.33% 100%)'
                  }}
                >
                  {/* Wheel Center Button */}
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-indigo-900 flex items-center justify-center font-black text-indigo-950 shadow-inner z-20">
                    <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
                  </div>
                </div>
              </div>

              {spinResult && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-sm font-bold text-emerald-800 animate-bounce">
                  🎉 YOU WON: {spinResult}!
                </div>
              )}

              <button
                disabled={isSpinning || !canSpinToday}
                onClick={handleSpinWheel}
                className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                  isSpinning
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : canSpinToday
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white active:scale-95 shadow-amber-500/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Dices className="w-5 h-5" />
                {isSpinning ? 'SPINNING...' : canSpinToday ? 'SPIN FOR FREE!' : 'SPUN TODAY (RESETS MIDNIGHT)'}
              </button>
            </div>
          )}

          {/* TAB 3: CYBER AVATARS */}
          {activeTab === 'avatars' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {AVATARS.map((av) => {
                const isUnlocked = state.unlockedAvatars.includes(av.id);
                const isSelected = state.selectedAvatar === av.id;

                return (
                  <div
                    key={av.id}
                    onClick={() => isUnlocked && handleSelectAvatar(av.id)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500 shadow-md'
                        : isUnlocked
                        ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                        : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl mb-2 shadow-inner">
                      {av.icon}
                    </div>
                    <div className="text-xs font-bold text-slate-900">{av.name}</div>
                    
                    {isUnlocked ? (
                      <span className={`text-[10px] font-bold mt-1 inline-block ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {isSelected ? '✓ ACTIVE' : 'SELECT'}
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 mt-1">
                        <Lock className="w-3 h-3" />
                        Level {av.levelRequired} Required
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
