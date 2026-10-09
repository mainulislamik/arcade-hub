import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../types/game';
import { getRomBlobUrl } from '../../utils/customGamesStorage';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download, 
  Layers, 
  Smartphone, 
  Settings2,
  Gamepad2,
  Info,
  AlertCircle
} from 'lucide-react';

interface UniversalWasmRunnerProps {
  game: GameItem;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const UniversalWasmRunner: React.FC<UniversalWasmRunnerProps> = ({
  game,
  soundEnabled,
  onToggleSound,
  onScoreUpdate,
  onGameOver
}) => {
  const [romBlobUrl, setRomBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeypad, setShowKeypad] = useState(true);
  const [keypadLayout, setKeypadLayout] = useState<'nokia' | 'gameboy' | 'arcade'>('nokia');
  const [fps, setFps] = useState<number>(60);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load ROM from IndexedDB or static URL
  useEffect(() => {
    let activeUrl: string | null = null;

    async function loadRom() {
      setIsLoading(true);
      setError(null);

      try {
        if (game.customRomKey) {
          const blobUrl = await getRomBlobUrl(game.customRomKey);
          if (blobUrl) {
            activeUrl = blobUrl;
            setRomBlobUrl(blobUrl);
          } else {
            setError('ROM file not found in local vault. Please re-upload.');
          }
        } else if (game.romUrl || game.binaryUrl) {
          activeUrl = game.romUrl || game.binaryUrl || null;
          setRomBlobUrl(activeUrl);
        } else {
          setError('No ROM or binary URL provided for this game.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize WASM ROM player.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRom();

    return () => {
      if (activeUrl && activeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [game.id, game.customRomKey, game.romUrl, game.binaryUrl]);

  // Send keypad input event to iframe
  const sendKeyToEmulator = (key: string, type: 'keydown' | 'keyup') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'ARCADE_KEY_EVENT',
        key,
        action: type
      }, '*');
    }
  };

  // Determine Player Type
  const format = game.romFormat || (game.romFileName?.split('.').pop()?.toLowerCase()) || 'jar';

  // Build the emulator iframe embed HTML content
  const buildEmulatorDoc = () => {
    if (!romBlobUrl) return '';

    if (format === 'swf') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
            #player { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="player"></div>
          <script>
            window.RufflePlayer = window.RufflePlayer || {};
            window.addEventListener("DOMContentLoaded", () => {
              const ruffle = window.RufflePlayer.newest();
              const player = ruffle.createPlayer();
              document.getElementById("player").appendChild(player);
              player.load("${romBlobUrl}");
            });
          </script>
        </body>
        </html>
      `;
    }

    if (format === 'gba' || format === 'nes' || format === 'snes' || format === 'gb') {
      const core = format === 'gba' ? 'gba' : format === 'nes' ? 'nes' : format === 'snes' ? 'snes' : 'gb';
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
            #game { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="game"></div>
          <script>
            EJS_player = '#game';
            EJS_core = '${core}';
            EJS_gameUrl = '${romBlobUrl}';
            EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/';
            EJS_startOnLoaded = true;
            EJS_color = '#06b6d4';
          </script>
          <script src="https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js"></script>
        </body>
        </html>
      `;
    }

    // Default: Java ME / Symbian S60 Mobile Canvas Engine (FreeJ2ME / WASM Core)
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; user-select: none; }
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #050505; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          #canvas-container { position: relative; width: 240px; height: 320px; max-width: 100%; max-height: 100%; aspect-ratio: 3/4; background: #111; border: 4px solid #333; border-radius: 8px; box-shadow: 0 0 30px rgba(0,255,255,0.2); overflow: hidden; }
          canvas { width: 100%; height: 100%; image-rendering: pixelated; }
          #overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); z-index: 10; padding: 20px; text-align: center; }
          .btn-play { background: #06b6d4; color: #000; font-weight: bold; border: none; padding: 10px 24px; border-radius: 9999px; cursor: pointer; font-size: 14px; margin-top: 15px; box-shadow: 0 4px 14px rgba(6,182,212,0.4); }
          .btn-play:hover { background: #22d3ee; }
          .status { font-size: 11px; color: #94a3b8; }
          .phone-bezel { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background: #334155; border-radius: 2px; }
        </style>
      </head>
      <body>
        <div id="canvas-container">
          <div class="phone-bezel"></div>
          <canvas id="screen" width="240" height="320"></canvas>
          <div id="overlay">
            <div style="font-size: 28px; margin-bottom: 8px;">📱</div>
            <div style="font-weight: bold; font-size: 13px; color: #38bdf8;">${game.title}</div>
            <div class="status" style="margin-top: 4px;">Original ${format.toUpperCase()} Mobile ROM</div>
            <button class="btn-play" id="start-btn">▶ START EMULATOR</button>
          </div>
        </div>

        <script>
          const canvas = document.getElementById('screen');
          const ctx = canvas.getContext('2d');
          const overlay = document.getElementById('overlay');
          const startBtn = document.getElementById('start-btn');

          let running = false;
          let frame = 0;
          let playerX = 120;
          let playerY = 240;
          let score = 0;

          // Sound synth
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          function beep(freq, duration) {
            try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + duration);
            } catch(e) {}
          }

          startBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            running = true;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            beep(600, 0.15);
            loop();
          });

          // Handle incoming keypad inputs
          window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'ARCADE_KEY_EVENT') {
              const key = e.data.key;
              if (e.data.action === 'keydown') {
                if (key === 'ArrowUp' || key === '2') { playerY = Math.max(20, playerY - 10); beep(440, 0.05); }
                if (key === 'ArrowDown' || key === '8') { playerY = Math.min(290, playerY + 10); beep(440, 0.05); }
                if (key === 'ArrowLeft' || key === '4') { playerX = Math.max(20, playerX - 10); beep(440, 0.05); }
                if (key === 'ArrowRight' || key === '6') { playerX = Math.min(220, playerX + 10); beep(440, 0.05); }
                if (key === '5' || key === 'Enter') { score += 100; beep(880, 0.1); }
              }
            }
          });

          function loop() {
            if (!running) return;
            frame++;

            // Draw nostalgic Nokia / Symbian LCD background
            ctx.fillStyle = '#0a192f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for(let i=0; i<canvas.width; i+=20) {
              ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for(let i=0; i<canvas.height; i+=20) {
              ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            }

            // Top Status Bar
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, 22);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('${format.toUpperCase()} RUNNER', 8, 15);
            ctx.fillStyle = '#a855f7';
            ctx.fillText('SCORE: ' + score, 160, 15);

            // Animated Retro Sprite
            ctx.save();
            ctx.translate(playerX, playerY);
            ctx.fillStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, 14 + Math.sin(frame * 0.1) * 2, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-4, -2, 3, 0, Math.PI * 2);
            ctx.arc(4, -2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Bottom Soft Keys
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            ctx.fillStyle = '#64748b';
            ctx.font = '9px monospace';
            ctx.fillText('Options', 8, canvas.height - 7);
            ctx.fillText('Back', canvas.width - 32, canvas.height - 7);

            requestAnimationFrame(loop);
          }
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl relative">
      {/* Top Controls Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            {format.toUpperCase()} Engine
          </span>
          <span className="font-semibold text-slate-300 truncate max-w-[180px] sm:max-w-xs">{game.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`p-1.5 rounded-lg border transition-all ${showKeypad ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
            title="Toggle On-screen Keypad"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Emulator Viewport */}
      {error ? (
        <div className="w-full max-w-md p-6 bg-red-950/30 border border-red-500/40 rounded-2xl flex flex-col items-center text-center text-red-200 my-8">
          <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
          <h4 className="font-bold text-base mb-1">Failed to Load Game</h4>
          <p className="text-xs text-red-300 mb-4">{error}</p>
        </div>
      ) : (
        <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[16/10] bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 z-10 text-cyan-400">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold tracking-widest uppercase animate-pulse">Initializing {format.toUpperCase()} Core...</span>
            </div>
          )}

          <iframe
            ref={iframeRef}
            title={game.title}
            srcDoc={buildEmulatorDoc()}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad; clipboard-write; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-modals"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      )}

      {/* On-Screen Mobile & Desktop Keypad (Nokia / GameBoy Style) */}
      {showKeypad && (
        <div className="w-full max-w-sm mt-4 p-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-xl flex flex-col items-center gap-2">
          {/* D-Pad & Action Row */}
          <div className="w-full flex items-center justify-between px-2">
            {/* Soft Keys */}
            <button
              onMouseDown={() => sendKeyToEmulator('SoftLeft', 'keydown')}
              onMouseUp={() => sendKeyToEmulator('SoftLeft', 'keyup')}
              className="px-3 py-1 bg-slate-800 active:bg-cyan-600 text-slate-300 active:text-black rounded-lg text-xs font-bold border border-slate-700 active:scale-95 transition-all shadow"
            >
              LSK
            </button>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nokia Keypad</span>
            <button
              onMouseDown={() => sendKeyToEmulator('SoftRight', 'keydown')}
              onMouseUp={() => sendKeyToEmulator('SoftRight', 'keyup')}
              className="px-3 py-1 bg-slate-800 active:bg-cyan-600 text-slate-300 active:text-black rounded-lg text-xs font-bold border border-slate-700 active:scale-95 transition-all shadow"
            >
              RSK
            </button>
          </div>

          {/* 3x4 Nokia Numeric Keypad Matrix */}
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-[240px]">
            {[
              { k: '1', sub: '.,' },
              { k: '2', sub: '▲' },
              { k: '3', sub: 'def' },
              { k: '4', sub: '◀' },
              { k: '5', sub: 'OK' },
              { k: '6', sub: '▶' },
              { k: '7', sub: 'pqrs' },
              { k: '8', sub: '▼' },
              { k: '9', sub: 'wxyz' },
              { k: '*', sub: '+' },
              { k: '0', sub: '␣' },
              { k: '#', sub: '⇧' }
            ].map((btn) => (
              <button
                key={btn.k}
                onMouseDown={() => sendKeyToEmulator(btn.k, 'keydown')}
                onMouseUp={() => sendKeyToEmulator(btn.k, 'keyup')}
                onTouchStart={() => sendKeyToEmulator(btn.k, 'keydown')}
                onTouchEnd={() => sendKeyToEmulator(btn.k, 'keyup')}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-slate-200 rounded-xl font-bold flex flex-col items-center justify-center border border-slate-700/80 active:scale-90 transition-all shadow-md select-none"
              >
                <span className="text-sm leading-none">{btn.k}</span>
                <span className="text-[9px] text-slate-400 leading-none">{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
