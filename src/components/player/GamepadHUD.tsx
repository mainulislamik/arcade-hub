import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { GamepadState } from '../../hooks/useGamepad';

interface GamepadHUDProps {
  gamepad: GamepadState;
}

export const GamepadHUD: React.FC<GamepadHUDProps> = ({ gamepad }) => {
  if (!gamepad.connected) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md animate-pulse shadow-lg shadow-emerald-500/10">
      <Gamepad2 className="w-4 h-4 text-emerald-400" />
      <span>Gamepad Ready: {gamepad.id.slice(0, 20)}</span>
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
    </div>
  );
};
