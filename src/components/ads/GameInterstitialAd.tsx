import React, { useState, useEffect } from 'react';
import { X, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { AdSenseBanner } from './AdSenseBanner';

interface GameInterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const GameInterstitialAd: React.FC<GameInterstitialAdProps> = ({
  isOpen,
  onClose,
  title = "Sponsored Break"
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-500/10">
        
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {canSkip ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
              >
                <span>Continue Game</span>
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-mono font-bold text-slate-400 border border-slate-700">
                Reward in {countdown}s
              </span>
            )}
          </div>
        </div>

        {/* Ad Container */}
        <div className="my-4 min-h-[250px] flex items-center justify-center">
          <AdSenseBanner slotId="9876543210" format="rectangle" className="w-full" />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Zero-Tracker Client Sandbox
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Sparkles className="h-3 w-3" /> Arcadex Free Games
          </span>
        </div>

      </div>
    </div>
  );
};
