import React, { useEffect, useCallback } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  PhoneOff, 
  CornerDownLeft, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface RetroMobileKeypadProps {
  onKeyPress: (key: string) => void;
  onKeyRelease?: (key: string) => void;
  soundEnabled?: boolean;
}

export const RetroMobileKeypad: React.FC<RetroMobileKeypadProps> = ({
  onKeyPress,
  onKeyRelease,
  soundEnabled = true
}) => {
  const handleButtonDown = useCallback((key: string) => {
    if (soundEnabled) {
      sounds.playClick();
    }
    onKeyPress(key);
  }, [onKeyPress, soundEnabled]);

  const handleButtonUp = useCallback((key: string) => {
    if (onKeyRelease) {
      onKeyRelease(key);
    }
  }, [onKeyRelease]);

  // Physical keyboard numpad sync
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Map numpad or standard keys
      const keyMap: Record<string, string> = {
        '1': '1', '2': '2', '3': '3',
        '4': '4', '5': '5', '6': '6',
        '7': '7', '8': '8', '9': '9',
        '*': '*', '0': '0', '#': '#',
        'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
        'Enter': 'SELECT', 'SoftLeft': 'LSK', 'SoftRight': 'RSK'
      };

      if (keyMap[e.key]) {
        handleButtonDown(keyMap[e.key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        '1': '1', '2': '2', '3': '3',
        '4': '4', '5': '5', '6': '6',
        '7': '7', '8': '8', '9': '9',
        '*': '*', '0': '0', '#': '#',
        'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
        'Enter': 'SELECT', 'SoftLeft': 'LSK', 'SoftRight': 'RSK'
      };

      if (keyMap[e.key]) {
        handleButtonUp(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleButtonDown, handleButtonUp]);

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-100 p-4 rounded-3xl border-2 border-slate-300 shadow-lg select-none">
      {/* Phone Brand / Earpiece speaker grille */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
      </div>

      {/* Navigation Cluster: SoftKeys + D-Pad + Call Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3 items-center">
        {/* Left Soft Key (LSK) */}
        <button
          onMouseDown={() => handleButtonDown('LSK')}
          onMouseUp={() => handleButtonUp('LSK')}
          onTouchStart={() => handleButtonDown('LSK')}
          onTouchEnd={() => handleButtonUp('LSK')}
          className="h-10 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold rounded-t-xl rounded-bl-xl border border-slate-300 shadow-sm flex items-center justify-center transition-all"
        >
          MENU
        </button>

        {/* 5-Way D-Pad Cluster */}
        <div className="relative w-28 h-28 mx-auto bg-slate-200/80 rounded-full border border-slate-300 p-1 flex items-center justify-center shadow-inner">
          {/* UP */}
          <button
            onMouseDown={() => handleButtonDown('UP')}
            onMouseUp={() => handleButtonUp('UP')}
            onTouchStart={() => handleButtonDown('UP')}
            onTouchEnd={() => handleButtonUp('UP')}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 text-slate-600 hover:text-slate-900 active:scale-95 flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          
          {/* DOWN */}
          <button
            onMouseDown={() => handleButtonDown('DOWN')}
            onMouseUp={() => handleButtonUp('DOWN')}
            onTouchStart={() => handleButtonDown('DOWN')}
            onTouchEnd={() => handleButtonUp('DOWN')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 text-slate-600 hover:text-slate-900 active:scale-95 flex items-center justify-center"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          {/* LEFT */}
          <button
            onMouseDown={() => handleButtonDown('LEFT')}
            onMouseUp={() => handleButtonUp('LEFT')}
            onTouchStart={() => handleButtonDown('LEFT')}
            onTouchEnd={() => handleButtonUp('LEFT')}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-600 hover:text-slate-900 active:scale-95 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* RIGHT */}
          <button
            onMouseDown={() => handleButtonDown('RIGHT')}
            onMouseUp={() => handleButtonUp('RIGHT')}
            onTouchStart={() => handleButtonDown('RIGHT')}
            onTouchEnd={() => handleButtonUp('RIGHT')}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-600 hover:text-slate-900 active:scale-95 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* CENTER SELECT BUTTON */}
          <button
            onMouseDown={() => handleButtonDown('SELECT')}
            onMouseUp={() => handleButtonUp('SELECT')}
            onTouchStart={() => handleButtonDown('SELECT')}
            onTouchEnd={() => handleButtonUp('SELECT')}
            className="w-10 h-10 bg-amber-500 hover:bg-amber-600 active:scale-90 rounded-full shadow-md border border-amber-400 flex items-center justify-center transition-transform text-slate-950 font-black text-xs"
          >
            OK
          </button>
        </div>

        {/* Right Soft Key (RSK) */}
        <button
          onMouseDown={() => handleButtonDown('RSK')}
          onMouseUp={() => handleButtonUp('RSK')}
          onTouchStart={() => handleButtonDown('RSK')}
          onTouchEnd={() => handleButtonUp('RSK')}
          className="h-10 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold rounded-t-xl rounded-br-xl border border-slate-300 shadow-sm flex items-center justify-center transition-all"
        >
          BACK
        </button>
      </div>

      {/* Call & Clear Keys */}
      <div className="grid grid-cols-2 gap-4 mb-3 px-2">
        <button
          onMouseDown={() => handleButtonDown('CALL')}
          onMouseUp={() => handleButtonUp('CALL')}
          onTouchStart={() => handleButtonDown('CALL')}
          onTouchEnd={() => handleButtonUp('CALL')}
          className="h-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" /> START
        </button>
        <button
          onMouseDown={() => handleButtonDown('END')}
          onMouseUp={() => handleButtonUp('END')}
          onTouchStart={() => handleButtonDown('END')}
          onTouchEnd={() => handleButtonUp('END')}
          className="h-8 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm"
        >
          <PhoneOff className="w-3.5 h-3.5" /> EXIT
        </button>
      </div>

      {/* 12-Key Alphanumeric Numpad Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/60 p-2.5 rounded-2xl border border-slate-300">
        {[
          { num: '1', sub: '._@' },
          { num: '2', sub: 'abc' },
          { num: '3', sub: 'def' },
          { num: '4', sub: 'ghi' },
          { num: '5', sub: 'jkl' },
          { num: '6', sub: 'mno' },
          { num: '7', sub: 'pqrs' },
          { num: '8', sub: 'tuv' },
          { num: '9', sub: 'wxyz' },
          { num: '*', sub: '⇧' },
          { num: '0', sub: '␣' },
          { num: '#', sub: '⌫' },
        ].map(({ num, sub }) => (
          <button
            key={num}
            onMouseDown={() => handleButtonDown(num)}
            onMouseUp={() => handleButtonUp(num)}
            onTouchStart={() => handleButtonDown(num)}
            onTouchEnd={() => handleButtonUp(num)}
            className="h-12 bg-white hover:bg-slate-50 active:bg-slate-100 active:scale-95 rounded-xl border border-slate-300 text-slate-800 flex flex-col items-center justify-center shadow-sm transition-all group"
          >
            <span className="text-base font-bold leading-none group-hover:text-indigo-600">{num}</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 leading-none mt-0.5">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
