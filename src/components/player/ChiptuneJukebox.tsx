import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Music,
  Activity
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface Track {
  id: string;
  title: string;
  style: string;
  bpm: number;
  notes: number[];
}

const TRACKS: Track[] = [
  { id: '1', title: 'Neon Cyberpunk 1984', style: 'Synthwave', bpm: 120, notes: [220, 261.63, 329.63, 392, 440, 523.25] },
  { id: '2', title: '8-Bit Dungeon Crawl', style: 'Chiptune', bpm: 140, notes: [164.81, 196, 220, 246.94, 293.66, 329.63] },
  { id: '3', title: 'Retro Speedway Turbo', style: 'Outrun', bpm: 130, notes: [261.63, 293.66, 329.63, 349.23, 392, 440] },
  { id: '4', title: 'Space Odyssey Alpha', style: 'Ambient', bpm: 110, notes: [196, 246.94, 293.66, 370, 440, 493.88] }
];

export const ChiptuneJukebox: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);
  const stepRef = useRef(0);

  const currentTrack = TRACKS[currentTrackIndex];

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startMusic = () => {
    stopMusic();
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const intervalMs = (60 / currentTrack.bpm / 2) * 1000;
    stepRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (isMuted || !audioCtxRef.current) return;
      try {
        const ctx = audioCtxRef.current;
        const note = currentTrack.notes[stepRef.current % currentTrack.notes.length];
        stepRef.current++;

        // Lead synth
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);

        // Bass Pulse on every 2nd step
        if (stepRef.current % 2 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(note / 2, ctx.currentTime);
          bassGain.gain.setValueAtTime(0.08, ctx.currentTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start();
          bassOsc.stop(ctx.currentTime + 0.25);
        }
      } catch (e) {}
    }, intervalMs);
  };

  useEffect(() => {
    if (isPlaying) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [isPlaying, currentTrackIndex, isMuted]);

  const togglePlay = () => {
    sounds.playClick();
    HapticEngine.lightTick();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    sounds.playClick();
    HapticEngine.lightTick();
    setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={`transition-all duration-300 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
        isExpanded 
          ? 'w-72 bg-slate-950/90 border-cyan-500/40 p-3.5 shadow-cyan-950/50' 
          : 'bg-slate-900/80 border-slate-800 p-2 hover:border-cyan-500/40'
      }`}>
        {/* Compact Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left cursor-pointer group flex-1 min-w-0"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
              isPlaying 
                ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30 group-hover:scale-105' 
                : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
            }`}>
              <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-white truncate group-hover:text-cyan-400 transition-colors">
                  {currentTrack.title}
                </span>
                {isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {currentTrack.style} • {currentTrack.bpm} BPM
              </span>
            </div>
          </button>

          {/* Quick Play & Next */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={togglePlay}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isPlaying 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded Details & Visualizer Bars */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 animate-fade-in">
            {/* Animated Audio Frequency Bars */}
            <div className="flex items-end justify-center gap-1 h-8 px-2 bg-slate-950/60 rounded-xl border border-slate-800/60 py-1">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying 
                      ? 'bg-gradient-to-t from-cyan-500 to-indigo-400' 
                      : 'bg-slate-800 h-1.5'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(4, (h * ((stepRef.current + i) % 5 + 1)) / 5)}px` : '4px'
                  }}
                />
              ))}
            </div>

            {/* Track Selector List */}
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-bold flex items-center justify-between transition-colors ${
                    currentTrackIndex === idx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{t.title}</span>
                  <span className="text-[9px] text-slate-500">{t.style}</span>
                </button>
              ))}
            </div>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-bold">SYNTH RADIO</span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
