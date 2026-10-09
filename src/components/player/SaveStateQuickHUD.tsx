import React, { useState, useEffect } from 'react';
import { SaveStateManager, SaveStateSlot } from '../../utils/saveStateManager';
import { Save, Download, RotateCcw, Trash2, X, Zap, Clock, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface SaveStateQuickHUDProps {
  gameId: string;
  gameTitle: string;
  currentScore: number;
  currentLevel?: number;
  isOpen: boolean;
  onClose: () => void;
  onRestoreState: (stateData: any) => void;
  onTriggerRewind?: () => void;
}

export const SaveStateQuickHUD: React.FC<SaveStateQuickHUDProps> = ({
  gameId,
  gameTitle,
  currentScore,
  currentLevel = 1,
  isOpen,
  onClose,
  onRestoreState,
  onTriggerRewind
}) => {
  const [slots, setSlots] = useState<(SaveStateSlot | null)[]>([]);

  const refreshSlots = () => {
    setSlots(SaveStateManager.getAllSlotsForGame(gameId));
  };

  useEffect(() => {
    refreshSlots();
    const handleUpdate = () => refreshSlots();
    window.addEventListener('arcadex:save_states_updated', handleUpdate);
    return () => window.removeEventListener('arcadex:save_states_updated', handleUpdate);
  }, [gameId]);

  if (!isOpen) return null;

  const handleSave = async (slotId: number) => {
    sounds.playClick();
    HapticEngine.bounceImpulse();
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    await SaveStateManager.saveSlot(
      slotId,
      gameId,
      gameTitle,
      currentScore,
      currentLevel,
      { score: currentScore, level: currentLevel, date: Date.now() },
      canvas
    );
    refreshSlots();
  };

  const handleLoad = (slot: SaveStateSlot) => {
    sounds.playPowerup();
    HapticEngine.victoryFanfare();
    onRestoreState(slot.stateData);
    onClose();
  };

  const handleDelete = (slotId: number) => {
    sounds.playClick();
    SaveStateManager.deleteSlot(slotId, gameId);
    refreshSlots();
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-white">Save State Vault & Rewind</h3>
              <p className="text-xs text-slate-400">Slots 1–5 • Quick Save (F1) / Quick Load (F3)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10-Second Rewind Banner */}
        {onTriggerRewind && (
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <RotateCcw className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-xs font-black text-purple-300">10-Second Time Rewind</h4>
                <p className="text-[11px] text-slate-400">Undo mistakes or sudden spike traps (Shortcut: \)</p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playPowerup();
                HapticEngine.bounceImpulse();
                onTriggerRewind();
                onClose();
              }}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rewind Now</span>
            </button>
          </div>
        )}

        {/* Save Slots List */}
        <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {[1, 2, 3, 4, 5].map((slotId) => {
            const slot = slots[slotId - 1];
            return (
              <div 
                key={slotId}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail / Slot Icon */}
                  {slot?.thumbnailDataUrl ? (
                    <img 
                      src={slot.thumbnailDataUrl} 
                      alt={`Slot ${slotId}`} 
                      className="w-16 h-12 rounded-lg object-cover border border-slate-600 shadow" 
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-slate-900/90 border border-dashed border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                      Slot {slotId}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-cyan-400">Slot {slotId}</span>
                      {slot ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Score: {slot.score}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Empty</span>
                      )}
                    </div>
                    {slot ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{slot.formattedDate}</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">Ready to save current game state</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(slotId)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1"
                    title="Save to this slot"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>

                  {slot && (
                    <>
                      <button
                        onClick={() => handleLoad(slot)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1"
                        title="Load this state"
                      >
                        <Download className="w-3 h-3" />
                        <span>Load</span>
                      </button>
                      <button
                        onClick={() => handleDelete(slotId)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
