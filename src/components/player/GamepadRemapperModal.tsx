import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Settings, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Volume2, 
  Zap, 
  Activity,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface GamepadRemapperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamepadRemapperModal: React.FC<GamepadRemapperModalProps> = ({
  isOpen,
  onClose
}) => {
  const [gamepadName, setGamepadName] = useState<string>('No Controller Detected');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [axes, setAxes] = useState<number[]>([0, 0, 0, 0]);
  const [buttons, setButtons] = useState<boolean[]>(new Array(16).fill(false));
  const [deadzone, setDeadzone] = useState<number>(0.15);
  const [vibrationTested, setVibrationTested] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let animFrame: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];

      if (gp) {
        setIsConnected(true);
        setGamepadName(gp.id || 'Standard Gamepad (DirectInput/XInput)');
        setAxes([gp.axes[0] || 0, gp.axes[1] || 0, gp.axes[2] || 0, gp.axes[3] || 0]);
        setButtons(gp.buttons.map(b => (typeof b === 'object' ? b.pressed : b === 1.0)));
      } else {
        setIsConnected(false);
        setGamepadName('No Gamepad Detected. Connect USB / Bluetooth Controller or press any button.');
      }

      animFrame = requestAnimationFrame(pollGamepad);
    };

    animFrame = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen]);

  const testVibration = () => {
    sounds.playPowerup();
    HapticEngine.heavyRumble();
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] as any;
    if (gp && gp.vibrationActuator) {
      gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 500,
        weakMagnitude: 0.8,
        strongMagnitude: 1.0
      });
    }
    setVibrationTested(true);
    setTimeout(() => setVibrationTested(false), 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden shadow-indigo-950/50 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Gamepad2 className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">GAMEPAD CALIBRATOR & REMAPPER</h2>
              <p className="text-xs text-indigo-100 font-medium">Xbox, PlayStation, 8BitDo & DirectInput Controller Studio</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controller Status Banner */}
        <div className={`p-4 border-b flex items-center gap-3 ${
          isConnected 
            ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300' 
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className={`w-3 h-3 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <span className="text-xs font-bold truncate">{gamepadName}</span>
        </div>

        {/* Live Visualizer and Stick Testing */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Dual Analog Stick Visualizers */}
          <div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2.5">
              Live Analog Stick Tracking
            </span>
            <div className="grid grid-cols-2 gap-4">
              {/* Left Stick */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 mb-2">Left Analog (LX, LY)</span>
                <div className="w-24 h-24 rounded-full border-2 border-slate-700 bg-slate-900 relative flex items-center justify-center shadow-inner">
                  {/* Center reticle */}
                  <div className="w-1 h-1 bg-slate-600 rounded-full" />
                  {/* Stick indicator */}
                  <div 
                    className="w-6 h-6 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50 absolute transition-transform duration-75"
                    style={{
                      transform: `translate(${axes[0] * 32}px, ${axes[1] * 32}px)`
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-indigo-400 mt-2">
                  X: {axes[0]?.toFixed(2)} | Y: {axes[1]?.toFixed(2)}
                </span>
              </div>

              {/* Right Stick */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 mb-2">Right Analog (RX, RY)</span>
                <div className="w-24 h-24 rounded-full border-2 border-slate-700 bg-slate-900 relative flex items-center justify-center shadow-inner">
                  {/* Center reticle */}
                  <div className="w-1 h-1 bg-slate-600 rounded-full" />
                  {/* Stick indicator */}
                  <div 
                    className="w-6 h-6 rounded-full bg-purple-500 shadow-md shadow-purple-500/50 absolute transition-transform duration-75"
                    style={{
                      transform: `translate(${axes[2] * 32}px, ${axes[3] * 32}px)`
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-purple-400 mt-2">
                  X: {axes[2]?.toFixed(2)} | Y: {axes[3]?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Button Activity Matrix */}
          <div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">
              Buttons Matrix (A, B, X, Y, Triggers)
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {['A / ✕', 'B / ○', 'X / □', 'Y / △', 'LB / L1', 'RB / R1', 'LT / L2', 'RT / R2', 'Select', 'Start', 'L3', 'R3', '▲ Up', '▼ Down', '◄ Left', '► Right'].map((lbl, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    buttons[idx] 
                      ? 'bg-indigo-500 text-white font-black border-indigo-400 shadow-md shadow-indigo-500/40 scale-105' 
                      : 'bg-slate-950/60 text-slate-500 border-slate-800 text-[10px] font-bold'
                  }`}
                >
                  <span className="text-[10px] block leading-tight truncate">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deadzone Slider */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Analog Stick Deadzone Filter
              </span>
              <span className="text-indigo-400 font-mono">{(deadzone * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={deadzone}
              onChange={(e) => setDeadzone(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={testVibration}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              vibrationTested 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Vibration Rumble</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-indigo-900/40 cursor-pointer"
          >
            Save & Calibrate
          </button>
        </div>
      </div>
    </div>
  );
};
