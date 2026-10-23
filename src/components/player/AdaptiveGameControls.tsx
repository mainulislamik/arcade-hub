import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Smartphone, 
  Monitor, 
  Sliders, 
  RotateCcw, 
  Check, 
  Volume2, 
  VolumeX,
  Target,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { GameItem } from '../../types/game';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { VirtualGamepad } from './VirtualGamepad';
import { RetroMobileKeypad } from './RetroMobileKeypad';
import { HapticEngine } from '../../utils/hapticEngine';

interface AdaptiveGameControlsProps {
  game: GameItem;
  format: string;
  onSendKey: (key: string, type: 'keydown' | 'keyup') => void;
  onRefocus: () => void;
  onOpenRemapper?: () => void;
  soundEnabled?: boolean;
}

type ControlMode = 'auto' | 'desktop' | 'gamepad' | 'mobile_keypad';

export const AdaptiveGameControls: React.FC<AdaptiveGameControlsProps> = ({
  game,
  format,
  onSendKey,
  onRefocus,
  onOpenRemapper,
  soundEnabled = true
}) => {
  const deviceInfo = useDeviceDetection();
  const [selectedMode, setSelectedMode] = useState<ControlMode>('auto');

  // Determine effective mode based on auto-detection or manual user override
  const isMobileFormat = ['jar', 'sis', 'j2me', 'symbian'].includes(format) || 
                         game.engineType === 'j2me_wasm' || 
                         game.engineType === 'symbian_sis';

  const effectiveMode: 'desktop' | 'gamepad' | 'mobile_keypad' = (() => {
    if (selectedMode !== 'auto') {
      return selectedMode;
    }
    if (deviceInfo.hasGamepad) {
      return 'gamepad';
    }
    if (deviceInfo.isMobile || deviceInfo.isTouch) {
      return isMobileFormat ? 'mobile_keypad' : 'gamepad';
    }
    return isMobileFormat ? 'mobile_keypad' : 'desktop';
  })();

  // Handle virtual gamepad buttons
  const handleVirtualGamepadPress = (button: string) => {
    HapticEngine.selectionClick();
    switch (button) {
      case 'UP': onSendKey('ArrowUp', 'keydown'); break;
      case 'DOWN': onSendKey('ArrowDown', 'keydown'); break;
      case 'LEFT': onSendKey('ArrowLeft', 'keydown'); break;
      case 'RIGHT': onSendKey('ArrowRight', 'keydown'); break;
      case 'A': onSendKey('KeyX', 'keydown'); break;
      case 'B': onSendKey('KeyZ', 'keydown'); break;
      case 'X': onSendKey('KeyS', 'keydown'); break;
      case 'Y': onSendKey('KeyA', 'keydown'); break;
      case 'START': onSendKey('Enter', 'keydown'); break;
      case 'SELECT': onSendKey('KeyV', 'keydown'); break;
      case 'L': onSendKey('KeyQ', 'keydown'); break;
      case 'R': onSendKey('KeyE', 'keydown'); break;
      default: onSendKey(button, 'keydown'); break;
    }
  };

  const handleVirtualGamepadRelease = (button: string) => {
    switch (button) {
      case 'UP': onSendKey('ArrowUp', 'keyup'); break;
      case 'DOWN': onSendKey('ArrowDown', 'keyup'); break;
      case 'LEFT': onSendKey('ArrowLeft', 'keyup'); break;
      case 'RIGHT': onSendKey('ArrowRight', 'keyup'); break;
      case 'A': onSendKey('KeyX', 'keyup'); break;
      case 'B': onSendKey('KeyZ', 'keyup'); break;
      case 'X': onSendKey('KeyS', 'keyup'); break;
      case 'Y': onSendKey('KeyA', 'keyup'); break;
      case 'START': onSendKey('Enter', 'keyup'); break;
      case 'SELECT': onSendKey('KeyV', 'keyup'); break;
      case 'L': onSendKey('KeyQ', 'keyup'); break;
      case 'R': onSendKey('KeyE', 'keyup'); break;
      default: onSendKey(button, 'keyup'); break;
    }
  };

  // Handle Nokia / Retro mobile keypad keys
  const handleMobileKeypadPress = (key: string) => {
    HapticEngine.lightTick();
    switch (key) {
      case 'UP': onSendKey('ArrowUp', 'keydown'); break;
      case 'DOWN': onSendKey('ArrowDown', 'keydown'); break;
      case 'LEFT': onSendKey('ArrowLeft', 'keydown'); break;
      case 'RIGHT': onSendKey('ArrowRight', 'keydown'); break;
      case 'SELECT': onSendKey('Enter', 'keydown'); break;
      case 'LSK': onSendKey('F1', 'keydown'); break;
      case 'RSK': onSendKey('F2', 'keydown'); break;
      default: onSendKey(key, 'keydown'); break;
    }
  };

  const handleMobileKeypadRelease = (key: string) => {
    switch (key) {
      case 'UP': onSendKey('ArrowUp', 'keyup'); break;
      case 'DOWN': onSendKey('ArrowDown', 'keyup'); break;
      case 'LEFT': onSendKey('ArrowLeft', 'keyup'); break;
      case 'RIGHT': onSendKey('ArrowRight', 'keyup'); break;
      case 'SELECT': onSendKey('Enter', 'keyup'); break;
      case 'LSK': onSendKey('F1', 'keyup'); break;
      case 'RSK': onSendKey('F2', 'keyup'); break;
      default: onSendKey(key, 'keyup'); break;
    }
  };

  // Platform-tailored desktop keyboard control instructions
  const renderDesktopInstructions = () => {
    if (['gba', 'snes'].includes(format)) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full max-w-5xl">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direction</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-bold shadow-xs">↑ ↓ ← →</kbd>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">or WASD</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">A (Jump / Confirm)</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-xs font-bold shadow-xs">X</kbd>
              <span className="text-[10px] text-slate-400">or</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">K</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Primary</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">B (Attack / Run)</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-bold shadow-xs">Z</kbd>
              <span className="text-[10px] text-slate-400">or</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">J</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Secondary</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">L / R Triggers</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-bold shadow-xs">A</kbd>
              <span className="text-[10px] text-slate-400">/</span>
              <kbd className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-bold shadow-xs">S</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Shoulders</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Start</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold shadow-xs">Enter</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Pause / Menu</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Select</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs font-bold shadow-xs">V</kbd>
              <span className="text-[10px] text-slate-400">or</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-[10px] font-bold shadow-xs">Shift</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Option</span>
          </div>
        </div>
      );
    }

    if (['nes', 'gb', 'gbc'].includes(format)) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-4xl">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direction</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-bold shadow-xs">↑ ↓ ← →</kbd>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">or WASD</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">A & B Action</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-xs font-bold shadow-xs">X (A)</kbd>
              <kbd className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-bold shadow-xs">Z (B)</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Jump / Fire</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Start</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold shadow-xs">Enter</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Start / Pause</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Select</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs font-bold shadow-xs">V / Shift</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Select Mode</span>
          </div>
        </div>
      );
    }

    if (['sega', 'md'].includes(format)) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-4xl">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direction</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-bold shadow-xs">↑ ↓ ← → / WASD</kbd>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">D-Pad</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Primary A / B / C</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">Z</kbd>
              <kbd className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-xs font-bold shadow-xs">X</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">C</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Genesis Standard</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">6-Button X / Y / Z</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-bold shadow-xs">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-bold shadow-xs">S</kbd>
              <kbd className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-bold shadow-xs">D</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Special Attacks</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Start</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold shadow-xs">Enter</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Start Game</span>
          </div>
        </div>
      );
    }

    if (['psx', 'ps2', 'psp'].includes(format)) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-4xl">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">D-Pad / Analog</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-bold shadow-xs">↑ ↓ ← →</kbd>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Movement</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">✕ (Cross) & ◯ (Circle)</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-xs font-bold shadow-xs">X (✕)</kbd>
              <kbd className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-bold shadow-xs">Z (◯)</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Accept / Back</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">◻ (Square) & △ (Triangle)</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-bold shadow-xs">A (◻)</kbd>
              <kbd className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold shadow-xs">S (△)</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Attack / Special</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Triggers & Start</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-[10px] font-bold shadow-xs">Q/E (L1/R1)</kbd>
              <kbd className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-[10px] font-bold shadow-xs">Enter</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Shoulders & Menu</span>
          </div>
        </div>
      );
    }

    if (format === 'dos') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-4xl">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movement</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-bold shadow-xs">Arrow Keys</kbd>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Move / Steer</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Primary Action</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-bold shadow-xs">Ctrl</kbd>
              <span className="text-[10px] text-slate-400">or</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">Space</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Fire / Shoot</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Secondary Action</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-xs font-bold shadow-xs">Alt</kbd>
              <span className="text-[10px] text-slate-400">or</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">Shift</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Jump / Strafe</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">DOS Interface</span>
            <div className="flex items-center gap-1 my-1">
              <kbd className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold shadow-xs">Enter</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold shadow-xs">Esc</kbd>
            </div>
            <span className="text-[10px] text-slate-400">Menu & Exit</span>
          </div>
        </div>
      );
    }

    // Default universal desktop guide
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-3xl">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movement</span>
          <div className="flex items-center gap-1 my-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-bold shadow-xs">Arrow Keys / WASD</kbd>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Navigate</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Action</span>
          <div className="flex items-center gap-1 my-1">
            <kbd className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-xs font-bold shadow-xs">Space / Z / X</kbd>
          </div>
          <span className="text-[10px] text-slate-400">Interact</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Select & Start</span>
          <div className="flex items-center gap-1 my-1">
            <kbd className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold shadow-xs">Enter / V</kbd>
          </div>
          <span className="text-[10px] text-slate-400">Menu / Pause</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-3 sm:p-4 flex flex-col items-center gap-3 shadow-xs transition-all">
      {/* Dynamic Header & Device Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-5xl text-xs px-1 gap-2">
        {/* Device Detection Status Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] sm:text-xs">
            {deviceInfo.hasGamepad ? (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{deviceInfo.gamepadName.slice(0, 24)} Active</span>
              </span>
            ) : deviceInfo.isMobile || deviceInfo.isTouch ? (
              <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Touch Console Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <Monitor className="w-3.5 h-3.5" />
                <span>PC Keyboard Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Manual Mode Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedMode('auto')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                selectedMode === 'auto'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Automatically match current device"
            >
              Auto
            </button>
            <button
              onClick={() => setSelectedMode('desktop')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                selectedMode === 'desktop'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show physical keyboard layout"
            >
              Keys
            </button>
            <button
              onClick={() => setSelectedMode('gamepad')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                selectedMode === 'gamepad'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show virtual touch gamepad"
            >
              Gamepad
            </button>
            {isMobileFormat && (
              <button
                onClick={() => setSelectedMode('mobile_keypad')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  selectedMode === 'mobile_keypad'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show retro mobile keypad"
              >
                Keypad
              </button>
            )}
          </div>

          {/* Refocus Game Button */}
          <button
            onClick={() => {
              HapticEngine.selectionClick();
              onRefocus();
            }}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-mono text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            title="Focus game canvas for keyboard"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Refocus</span>
          </button>

          {/* Remap Keypad Button */}
          {onOpenRemapper && (
            <button
              onClick={() => {
                HapticEngine.selectionClick();
                onOpenRemapper();
              }}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-mono text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              title="Remap Gamepad & Keyboard Buttons"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Remap</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Active View Based on Effective Mode */}
      {effectiveMode === 'desktop' && (
        <div className="w-full flex justify-center animate-in fade-in duration-200">
          {renderDesktopInstructions()}
        </div>
      )}

      {effectiveMode === 'gamepad' && (
        <div className="w-full max-w-3xl flex justify-center animate-in fade-in zoom-in duration-200">
          <VirtualGamepad
            onButtonPress={handleVirtualGamepadPress}
            onButtonRelease={handleVirtualGamepadRelease}
            soundEnabled={soundEnabled}
          />
        </div>
      )}

      {effectiveMode === 'mobile_keypad' && (
        <div className="w-full max-w-sm flex justify-center animate-in fade-in zoom-in duration-200">
          <RetroMobileKeypad
            onKeyPress={handleMobileKeypadPress}
            onKeyRelease={handleMobileKeypadRelease}
            soundEnabled={soundEnabled}
          />
        </div>
      )}
    </div>
  );
};
