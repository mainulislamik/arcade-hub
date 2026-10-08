import React, { useCallback } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  CircleDot
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface VirtualGamepadProps {
  onButtonPress: (button: string) => void;
  onButtonRelease?: (button: string) => void;
  soundEnabled?: boolean;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({
  onButtonPress,
  onButtonRelease,
  soundEnabled = true
}) => {
  const handlePress = useCallback((btn: string) => {
    if (soundEnabled) {
      sounds.playClick();
    }
    onButtonPress(btn);
  }, [onButtonPress, soundEnabled]);

  const handleRelease = useCallback((btn: string) => {
    if (onButtonRelease) {
      onButtonRelease(btn);
    }
  }, [onButtonRelease]);

  return (
    <div className="w-full max-w-2xl mx-auto flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur rounded-3xl border border-slate-700 select-none shadow-2xl">
      {/* Directional Pad */}
      <div className="relative w-36 h-36 bg-slate-950 rounded-full border-2 border-slate-800 p-2 flex items-center justify-center shadow-inner">
        {/* UP */}
        <button
          onMouseDown={() => handlePress('UP')}
          onMouseUp={() => handleRelease('UP')}
          onTouchStart={() => handlePress('UP')}
          onTouchEnd={() => handleRelease('UP')}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-800 active:bg-indigo-600 rounded-t-xl text-slate-300 flex items-center justify-center border-t border-slate-600 shadow active:scale-95 transition-all"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* DOWN */}
        <button
          onMouseDown={() => handlePress('DOWN')}
          onMouseUp={() => handleRelease('DOWN')}
          onTouchStart={() => handlePress('DOWN')}
          onTouchEnd={() => handleRelease('DOWN')}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-800 active:bg-indigo-600 rounded-b-xl text-slate-300 flex items-center justify-center border-b border-slate-600 shadow active:scale-95 transition-all"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        {/* LEFT */}
        <button
          onMouseDown={() => handlePress('LEFT')}
          onMouseUp={() => handleRelease('LEFT')}
          onTouchStart={() => handlePress('LEFT')}
          onTouchEnd={() => handleRelease('LEFT')}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-800 active:bg-indigo-600 rounded-l-xl text-slate-300 flex items-center justify-center border-l border-slate-600 shadow active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* RIGHT */}
        <button
          onMouseDown={() => handlePress('RIGHT')}
          onMouseUp={() => handleRelease('RIGHT')}
          onTouchStart={() => handlePress('RIGHT')}
          onTouchEnd={() => handleRelease('RIGHT')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-800 active:bg-indigo-600 rounded-r-xl text-slate-300 flex items-center justify-center border-r border-slate-600 shadow active:scale-95 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* D-Pad Center Cross */}
        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
          <CircleDot className="w-4 h-4 text-slate-700" />
        </div>
      </div>

      {/* Center Select & Start */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-4">
          <button
            onMouseDown={() => handlePress('SELECT')}
            onMouseUp={() => handleRelease('SELECT')}
            onTouchStart={() => handlePress('SELECT')}
            onTouchEnd={() => handleRelease('SELECT')}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-wider border border-slate-700 shadow"
          >
            SELECT
          </button>
          <button
            onMouseDown={() => handlePress('START')}
            onMouseUp={() => handleRelease('START')}
            onTouchStart={() => handlePress('START')}
            onTouchEnd={() => handleRelease('START')}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-full text-[10px] font-black uppercase text-amber-400 tracking-wider border border-slate-700 shadow"
          >
            START
          </button>
        </div>
        <div className="text-center text-[10px] text-slate-500 font-mono tracking-widest">
          ARCADEX DUAL-CORE
        </div>
      </div>

      {/* Action Buttons (A, B, X, Y) */}
      <div className="relative w-36 h-36 bg-slate-950 rounded-full border-2 border-slate-800 p-2 flex items-center justify-center shadow-inner">
        {/* Y Button (Top) */}
        <button
          onMouseDown={() => handlePress('Y')}
          onMouseUp={() => handleRelease('Y')}
          onTouchStart={() => handlePress('Y')}
          onTouchEnd={() => handleRelease('Y')}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-amber-500 to-amber-600 active:from-amber-700 active:to-amber-800 text-slate-950 font-black rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform text-sm"
        >
          Y
        </button>

        {/* A Button (Right) */}
        <button
          onMouseDown={() => handlePress('A')}
          onMouseUp={() => handleRelease('A')}
          onTouchStart={() => handlePress('A')}
          onTouchEnd={() => handleRelease('A')}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-b from-rose-500 to-rose-600 active:from-rose-700 active:to-rose-800 text-white font-black rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform text-sm"
        >
          A
        </button>

        {/* B Button (Bottom) */}
        <button
          onMouseDown={() => handlePress('B')}
          onMouseUp={() => handleRelease('B')}
          onTouchStart={() => handlePress('B')}
          onTouchEnd={() => handleRelease('B')}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-emerald-500 to-emerald-600 active:from-emerald-700 active:to-emerald-800 text-white font-black rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform text-sm"
        >
          B
        </button>

        {/* X Button (Left) */}
        <button
          onMouseDown={() => handlePress('X')}
          onMouseUp={() => handleRelease('X')}
          onTouchStart={() => handlePress('X')}
          onTouchEnd={() => handleRelease('X')}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-b from-sky-500 to-sky-600 active:from-sky-700 active:to-sky-800 text-white font-black rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform text-sm"
        >
          X
        </button>
      </div>
    </div>
  );
};
