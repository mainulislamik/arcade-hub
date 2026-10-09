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
  Smartphone, 
  Gamepad2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect exact ROM format
  const format = (game.romFormat || (game.romFileName?.split('.').pop()?.toLowerCase()) || (game.id.split('.').pop()?.toLowerCase()) || 'jar').toLowerCase();

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
            setError('ROM file not found in local vault. Please re-upload via Admin Panel.');
          }
        } else if (game.romUrl || game.binaryUrl) {
          activeUrl = game.romUrl || game.binaryUrl || null;
          setRomBlobUrl(activeUrl);
        } else {
          setError('No ROM binary URL found for this game.');
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

  // Send virtual keypad press event to emulator
  const sendKeyToEmulator = (key: string, type: 'keydown' | 'keyup') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Dispatch synthetic KeyboardEvent directly inside iframe
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        if (iframeDoc) {
          const event = new KeyboardEvent(type, {
            key: key,
            code: key,
            bubbles: true,
            cancelable: true
          });
          iframeDoc.dispatchEvent(event);
        }
      } catch (e) {
        // Fallback postMessage
        iframeRef.current.contentWindow.postMessage({
          type: 'EMULATOR_KEY',
          key,
          action: type
        }, '*');
      }
    }
  };

  // Build the authentic emulator container HTML
  const buildEmulatorDoc = () => {
    if (!romBlobUrl) return '';

    // 1. FLASH GAMES (.SWF) -> Ruffle Rust-WASM Player
    if (format === 'swf') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; display: flex; align-items: center; justify-content: center; }
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
              player.style.width = "100%";
              player.style.height = "100%";
              document.getElementById("player").appendChild(player);
              player.load("${romBlobUrl}");
            });
          </script>
        </body>
        </html>
      `;
    }

    // 2. NINTENDO & RETRO ROMS (.GBA, .NES, .SNES, .GB, .GBC, .MD, .GEN) -> EmulatorJS 100% Real WASM Libretro Core
    if (['gba', 'nes', 'snes', 'gb', 'gbc', 'md', 'gen', 'sega', 'n64'].includes(format)) {
      const coreMap: Record<string, string> = {
        gba: 'gba',
        nes: 'nes',
        snes: 'snes',
        gb: 'gb',
        gbc: 'gb',
        md: 'segaMD',
        gen: 'segaMD',
        sega: 'segaMD',
        n64: 'n64'
      };
      const core = coreMap[format] || 'gba';

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; }
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
            EJS_align = 'center';
            EJS_volume = ${soundEnabled ? 1.0 : 0.0};
          </script>
          <script src="https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js"></script>
        </body>
        </html>
      `;
    }

    // 3. JAVA ME (.JAR) -> Genuine J2ME WebAssembly Bytecode VM
    if (format === 'jar') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            #j2me-container { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
            #j2me-screen { max-width: 100%; max-height: 100%; aspect-ratio: 3/4; border-radius: 8px; box-shadow: 0 0 35px rgba(6, 182, 212, 0.25); background: #000; border: 2px solid #334155; }
            .info-banner { position: absolute; top: 12px; font-size: 11px; color: #38bdf8; background: rgba(15, 23, 42, 0.85); padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.3); }
          </style>
        </head>
        <body>
          <div id="j2me-container">
            <div class="info-banner">☕ Genuine Java ME WASM Runtime</div>
            <iframe 
              id="j2me-frame"
              src="https://pluha.github.io/j2me-js/#${romBlobUrl}" 
              style="width: 100%; height: 100%; border: none;"
              allow="autoplay; gamepad"
            ></iframe>
          </div>
        </body>
        </html>
      `;
    }

    // 4. SYMBIAN (.SIS / .SISX) -> Native ARM Binary Explanation & Direct Java ME / GBA Alternate Guidance
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
          .card { max-width: 460px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .icon { font-size: 40px; margin-bottom: 12px; }
          h2 { font-size: 18px; color: #38bdf8; margin: 0 0 8px 0; }
          p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 16px 0; }
          .tip-box { background: rgba(30, 41, 59, 0.8); border-left: 3px solid #06b6d4; padding: 12px; border-radius: 6px; text-align: left; font-size: 12px; color: #cbd5e1; margin-bottom: 16px; }
          .badge { display: inline-block; background: #0284c7; color: #fff; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-right: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">📱</div>
          <h2>Symbian OS S60 (.SIS) File Detected</h2>
          <p>
            The file <strong>"${game.title}"</strong> is a compiled Symbian OS ARM binary (Nokia S60v2/v3). Web browsers execute <strong>Java ME (.JAR)</strong> and <strong>Nintendo (.GBA / .NES)</strong> ROMs via WebAssembly!
          </p>
          <div class="tip-box">
            <div>💡 <strong>How to play this exact Nokia game 100% authentic:</strong></div>
            <div style="margin-top: 6px;">
              Download the <strong>.JAR</strong> (Java ME) version of <em>${game.title}</em> or any <strong>.GBA</strong> Nintendo ROM from the internet and upload it via the Admin Panel. It will boot directly with full sound and original graphics!
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none bg-slate-950">
      {/* Emulator Active Screen Viewport */}
      <div className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 text-cyan-400">
            <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-xs font-bold tracking-wider">BOOTING GENUINE WASM ENGINE...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 p-6 bg-slate-900/90 border border-rose-500/40 rounded-2xl max-w-md text-center">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <span className="text-sm font-bold text-rose-200">{error}</span>
          </div>
        )}

        {!isLoading && !error && romBlobUrl && (
          <div className="relative w-full h-full max-w-[960px] max-h-[720px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center">
            <iframe
              ref={iframeRef}
              srcDoc={buildEmulatorDoc()}
              title={game.title}
              className="w-full h-full border-none"
              allow="autoplay; fullscreen; gamepad; cross-origin-isolated"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        )}
      </div>

      {/* Retro Virtual Keypad (Nokia / GamePad Mode) for Mobile and Quick Controls */}
      {showKeypad && (format === 'jar' || format === 'sis') && (
        <div className="w-full max-w-sm px-4 pb-4 shrink-0 flex flex-col items-center">
          <div className="bg-slate-900/90 border border-slate-800/90 p-3 rounded-2xl shadow-xl w-full">
            {/* Nokia 3x4 Keypad Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { key: '1', label: '1' },
                { key: 'ArrowUp', label: '2 ▲' },
                { key: '3', label: '3' },
                { key: 'ArrowLeft', label: '4 ◀' },
                { key: 'Enter', label: '5 OK' },
                { key: 'ArrowRight', label: '6 ▶' },
                { key: '7', label: '7' },
                { key: 'ArrowDown', label: '8 ▼' },
                { key: '9', label: '9' },
                { key: '*', label: '*' },
                { key: '0', label: '0' },
                { key: '#', label: '#' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onMouseDown={() => sendKeyToEmulator(btn.key, 'keydown')}
                  onMouseUp={() => sendKeyToEmulator(btn.key, 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); sendKeyToEmulator(btn.key, 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKeyToEmulator(btn.key, 'keyup'); }}
                  className="bg-slate-800/80 hover:bg-cyan-500/20 active:bg-cyan-500 active:text-black border border-slate-700/60 active:border-cyan-400 text-slate-200 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
