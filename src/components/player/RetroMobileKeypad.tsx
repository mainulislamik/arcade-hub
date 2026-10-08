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
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-slate-800 to-slate-950 p-4 rounded-3xl border-4 border-slate-700 shadow-2xl select-none">
      {/* Phone Brand / Earpiece speaker grille */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-1.5 bg-slate-600 rounded-full"></div>
      </div>

      {/* Navigation Cluster: SoftKeys + D-Pad + Call Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3 items-center">
        {/* Left Soft Key (LSK) */}
        <button
          onMouseDown={() => handleButtonDown('LSK')}
          onMouseUp={() => handleButtonUp('LSK')}
          onTouchStart={() => handleButtonDown('LSK')}
          onTouchEnd={() => handleButtonUp('LSK')}
          className="h-10 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:scale-95 text-slate-200 text-xs font-bold rounded-t-xl rounded-bl-xl border-t border-l border-slate-600 shadow flex items-center justify-center transition-all"
        >
          MENU
        </button>

        {/* 5-Way D-Pad Cluster */}
        <div className="relative w-28 h-28 mx-auto bg-slate-900 rounded-full border-2 border-slate-700 p-1 flex items-center justify-center shadow-inner">
          {/* UP */}
          <button
            onMouseDown={() => handleButtonDown('UP')}
            onMouseUp={() => handleButtonUp('UP')}
            onTouchStart={() => handleButtonDown('UP')}
            onTouchEnd={() => handleButtonUp('UP')}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 text-slate-400 hover:text-white active:scale-95 flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          
          {/* DOWN */}
          <button
            onMouseDown={() => handleButtonDown('DOWN')}
            onMouseUp={() => handleButtonUp('DOWN')}
            onTouchStart={() => handleButtonDown('DOWN')}
            onTouchEnd={() => handleButtonUp('DOWN')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 text-slate-400 hover:text-white active:scale-95 flex items-center justify-center"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          {/* LEFT */}
          <button
            onMouseDown={() => handleButtonDown('LEFT')}
            onMouseUp={() => handleButtonUp('LEFT')}
            onTouchStart={() => handleButtonDown('LEFT')}
            onTouchEnd={() => handleButtonUp('LEFT')}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-white active:scale-95 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* RIGHT */}
          <button
            onMouseDown={() => handleButtonDown('RIGHT')}
            onMouseUp={() => handleButtonUp('RIGHT')}
            onTouchStart={() => handleButtonDown('RIGHT')}
            onTouchEnd={() => handleButtonUp('RIGHT')}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-white active:scale-95 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* CENTER SELECT BUTTON */}
          <button
            onMouseDown={() => handleButtonDown('SELECT')}
            onMouseUp={() => handleButtonUp('SELECT')}
            onTouchStart={() => handleButtonDown('SELECT')}
            onTouchEnd={() => handleButtonUp('SELECT')}
            className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-400 active:from-amber-600 active:to-amber-500 rounded-full shadow-lg border border-amber-300 flex items-center justify-center active:scale-90 transition-transform text-slate-950 font-black text-xs"
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
          className="h-10 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:scale-95 text-slate-200 text-xs font-bold rounded-t-xl rounded-br-xl border-t border-r border-slate-600 shadow flex items-center justify-center transition-all"
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
          className="h-8 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow"
        >
          <Phone className="w-3.5 h-3.5" /> START
        </button>
        <button
          onMouseDown={() => handleButtonDown('END')}
          onMouseUp={() => handleButtonUp('END')}
          onTouchStart={() => handleButtonDown('END')}
          onTouchEnd={() => handleButtonUp('END')}
          className="h-8 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow"
        >
          <PhoneOff className="w-3.5 h-3.5" /> EXIT
        </button>
      </div>

      {/* 12-Key Alphanumeric Numpad Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
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
            className="h-12 bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-700 hover:to-slate-800 active:bg-slate-700 active:scale-95 rounded-xl border border-slate-700/80 text-slate-100 flex flex-col items-center justify-center shadow transition-all group"
          >
            <span className="text-base font-bold leading-none group-hover:text-amber-400">{num}</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 leading-none mt-0.5">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
