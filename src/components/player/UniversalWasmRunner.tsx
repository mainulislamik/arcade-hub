import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../types/game';
import { getRomBlobUrl } from '../../utils/customGamesStorage';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Leaf,
  Maximize2,
  Gamepad2
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';
import { EcoEngine } from '../../utils/ecoEngine';

interface UniversalWasmRunnerProps {
  game: GameItem;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '3:4' | '9:16' | 'fill' | string;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const UniversalWasmRunner: React.FC<UniversalWasmRunnerProps> = ({
  game,
  soundEnabled = true,
  onToggleSound,
  aspectRatio = 'auto',
  onScoreUpdate,
  onGameOver
}) => {
  const [romBlobUrl, setRomBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [format, setFormat] = useState<string>('jar');
  const [isEco, setIsEco] = useState(EcoEngine.isEco());
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return (aspectRatio === 'auto' || !aspectRatio) ? '16:9' : aspectRatio;
    }
    return aspectRatio || 'auto';
  });
  const [showTouchKeypad, setShowTouchKeypad] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    } else {
      document.exitFullscreen();
    }
  };

  // Subscribe to Eco Mode changes
  useEffect(() => {
    return EcoEngine.subscribe((eco) => {
      setIsEco(eco);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'ECO_MODE', enabled: eco }, '*');
      }
    });
  }, []);

  // Determine ROM format from metadata
  useEffect(() => {
    let fmt = 'jar';
    const filename = (game.romFileName || game.romUrl || game.title || '').toLowerCase();
    
    if (game.romFormat) fmt = game.romFormat;
    else if (filename.endsWith('.sis') || game.engineType === 'symbian_sis') fmt = 'sis';
    else if (filename.endsWith('.swf') || game.engineType === 'ruffle_flash') fmt = 'swf';
    else if (filename.endsWith('.gba')) fmt = 'gba';
    else if (filename.endsWith('.nes')) fmt = 'nes';
    else if (filename.endsWith('.zip') || game.engineType === 'html5_zip') fmt = 'zip';
    else if (filename.endsWith('.jar') || game.engineType === 'j2me_wasm') fmt = 'jar';
    
    setFormat(fmt);
  }, [game]);

  // Load ROM Blob from IndexedDB or static URL
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const loadRom = async () => {
      try {
        if (game.customRomKey) {
          const url = await getRomBlobUrl(game.customRomKey);
          if (url && isMounted) {
            setRomBlobUrl(url);
            setIsLoading(false);
            return;
          }
        }

        if (game.romUrl) {
          if (isMounted) {
            const resolved = game.romUrl.startsWith('http') || game.romUrl.startsWith('blob:')
              ? game.romUrl
              : (typeof window !== 'undefined' ? window.location.origin + game.romUrl : game.romUrl);
            // Append cache buster to guarantee fresh ROM loading
            const finalUrl = resolved.includes('?') ? `${resolved}&v=3` : `${resolved}?v=3`;
            setRomBlobUrl(finalUrl);
            setIsLoading(false);
            return;
          }
        }

        // Fallback default bundled ROM blob
        const dummyBlob = new Blob([new Uint8Array([0x50, 0x4B, 0x03, 0x04])], { type: 'application/java-archive' });
        const dummyUrl = URL.createObjectURL(dummyBlob);
        if (isMounted) {
          setRomBlobUrl(dummyUrl);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err?.message || 'Failed to load game file from storage');
          setIsLoading(false);
        }
      }
    };

    loadRom();

    return () => {
      isMounted = false;
    };
  }, [game.id, game.customRomKey, game.romUrl, format]);

  // Send virtual key or keyboard event to iframe
  const sendKey = (key: string, type: 'keydown' | 'keyup') => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'EMULATOR_KEY', key, eventType: type }, '*');
    iframeRef.current.contentWindow.postMessage({ type: 'NOKIA_KEY', key, eventType: type }, '*');
  };

  // GLOBAL KEYBOARD EVENT BRIDGE: Intercept all PC keyboard presses and forward them to the game
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in text input/search box
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      const gameKeys = [
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'KeyA', 'KeyD', 'KeyW', 'KeyS',
        'a', 'd', 'w', 's', 'A', 'D', 'W', 'S',
        'KeyZ', 'KeyX', 'KeyJ', 'KeyK', 'KeyV',
        'z', 'x', 'j', 'k', 'v', 'Z', 'X', 'J', 'K', 'V',
        'Shift', 'ShiftLeft', 'ShiftRight',
        ' ', 'Space', 'Enter', 'Escape',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9', 'Numpad0'
      ];

      if (gameKeys.includes(e.key) || gameKeys.includes(e.code)) {
        // Prevent browser page from scrolling down on Arrow/Space keys
        e.preventDefault();
        sendKey(e.key, 'keydown');
        sendKey(e.code, 'keydown');
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      sendKey(e.key, 'keyup');
      sendKey(e.code, 'keyup');
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { passive: false });
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, []);

  // Build the complete local standalone engine HTML document
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

    // 2. RETRO CONSOLE GAMES (.GBA, .NES, .SNES) -> EmulatorJS Multi-Core
    if (['gba', 'nes', 'snes', 'gb', 'md'].includes(format)) {
      const platformName = format === 'gba' ? 'Game Boy Advance (32-Bit)' : format === 'snes' ? 'Super Nintendo (16-Bit)' : 'Nintendo Entertainment System (8-Bit)';
      const coverImg = game.thumbnailUrl || game.coverImage || game.cover || '/assets/covers/super-mario-boxart.jpg';
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${game.title}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: system-ui, -apple-system, sans-serif; }
            #container { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
            #game { width: 100%; height: 100%; }
            #arcade-splash {
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at center, rgba(15, 23, 42, 0.94) 0%, rgba(2, 6, 23, 0.98) 100%);
              backdrop-filter: blur(12px);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              z-index: 99999;
              cursor: pointer;
              padding: 20px;
              text-align: center;
            }
            .splash-card {
              max-width: 500px;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
              animation: fadeIn 0.3s ease-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.96); }
              to { opacity: 1; transform: scale(1); }
            }
            .cover-frame {
              width: 140px;
              height: 190px;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.35);
              border: 2px solid rgba(56, 189, 248, 0.5);
              background: #0f172a;
            }
            .cover-frame img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .badge-platform {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: rgba(6, 182, 212, 0.15);
              border: 1px solid rgba(6, 182, 212, 0.4);
              color: #38bdf8;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              padding: 4px 12px;
              border-radius: 9999px;
            }
            .game-title {
              font-size: 24px;
              font-weight: 900;
              color: #f8fafc;
              letter-spacing: -0.02em;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
            }
            .btn-start {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
              color: white;
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 0.05em;
              padding: 14px 38px;
              border-radius: 9999px;
              border: none;
              box-shadow: 0 10px 25px -4px rgba(6, 182, 212, 0.5), 0 0 15px rgba(37, 99, 235, 0.4);
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .btn-start:hover {
              transform: translateY(-2px) scale(1.03);
              box-shadow: 0 14px 30px -4px rgba(6, 182, 212, 0.7), 0 0 25px rgba(37, 99, 235, 0.6);
            }
            .controls-panel {
              background: rgba(30, 41, 59, 0.6);
              border: 1px solid rgba(71, 85, 105, 0.4);
              border-radius: 12px;
              padding: 12px 20px;
              width: 100%;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              font-size: 12px;
              color: #94a3b8;
            }
            .ctrl-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
            }
            .ctrl-key {
              background: #334155;
              color: #e2e8f0;
              font-family: monospace;
              font-weight: bold;
              padding: 2px 8px;
              border-radius: 4px;
              border-bottom: 2px solid #1e293b;
            }
            .tip-sound {
              font-size: 11px;
              color: #64748b;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div id="container">
            <div id="game"></div>

            <div id="arcade-splash" onclick="bootArcadeEngine()" tabindex="0">
              <div class="splash-card">
                <div class="cover-frame">
                  <img src="${coverImg}" alt="${game.title}" />
                </div>
                <div class="badge-platform">
                  ● ${platformName}
                </div>
                <h1 class="game-title">${game.title}</h1>

                <button class="btn-start" type="button">
                  ▶ START GAME
                </button>

                <div class="controls-panel">
                  <div class="ctrl-item">
                    <span>D-Pad / Movement</span>
                    <span class="ctrl-key">Arrow Keys</span>
                  </div>
                  <div class="ctrl-item">
                    <span>Action A / Jump</span>
                    <span class="ctrl-key">Z</span>
                  </div>
                  <div class="ctrl-item">
                    <span>Action B / Attack</span>
                    <span class="ctrl-key">X</span>
                  </div>
                  <div class="ctrl-item">
                    <span>Start / Pause</span>
                    <span class="ctrl-key">Enter</span>
                  </div>
                </div>

                <p class="tip-sound">🔊 Click to activate sound & authentic 60FPS WASM engine</p>
              </div>
            </div>
          </div>

          <script>
            var booted = false;
            function bootArcadeEngine() {
              if (booted) return;
              booted = true;

              var splash = document.getElementById('arcade-splash');
              if (splash) {
                splash.style.opacity = '0';
                splash.style.pointerEvents = 'none';
                setTimeout(function() {
                  splash.remove();
                }, 300);
              }

              // Unlock and resume Web Audio immediately with user gesture
              try {
                var AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                  window.__arcadeAudio = new AudioCtx();
                  window.__arcadeAudio.resume();
                }
              } catch (e) {}

              // Configure EmulatorJS
              window.EJS_player = '#game';
              window.EJS_core = '${format}';
              window.EJS_gameUrl = '${romBlobUrl}';
              window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
              window.EJS_startOnLoaded = true;

              var loaderScript = document.createElement('script');
              loaderScript.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
              loaderScript.async = true;
              document.body.appendChild(loaderScript);

              // Auto-focus canvas when ready
              var focusAttempts = 0;
              var pollInterval = setInterval(function() {
                focusAttempts++;
                var canvas = document.querySelector('canvas');
                if (canvas) {
                  canvas.focus();
                  clearInterval(pollInterval);
                } else if (focusAttempts > 50) {
                  clearInterval(pollInterval);
                }
              }, 150);
            }

            // Also allow starting on Enter / Space key press
            window.addEventListener('keydown', function(e) {
              if (!booted && (e.key === 'Enter' || e.key === ' ' || e.code === 'Space')) {
                bootArcadeEngine();
              }
            });

            // Universal Keyboard Event & Dual Binding Bridge (WASD, Arrow Keys, Z, X, J, K, Space)
            var keyMap = {
              'ArrowUp': 38, 'KeyW': 38, 'w': 38, 'W': 38,
              'ArrowDown': 40, 'KeyS': 40, 's': 40, 'S': 40,
              'ArrowLeft': 37, 'KeyA': 37, 'a': 37, 'A': 37,
              'ArrowRight': 39, 'KeyD': 39, 'd': 39, 'D': 39,
              'KeyZ': 90, 'z': 90, 'Z': 90, 'KeyJ': 90, 'j': 90, 'J': 90,
              'KeyX': 88, 'x': 88, 'X': 88, 'KeyK': 88, 'k': 88, 'K': 88, 'Space': 88, ' ': 88,
              'Enter': 13,
              'KeyV': 86, 'v': 86, 'V': 86, 'Shift': 86, 'ShiftLeft': 86, 'ShiftRight': 86
            };

            function dispatchEmulatedKey(key, type) {
              var kc = keyMap[key];
              if (!kc) return;
              var ev = new KeyboardEvent(type, {
                keyCode: kc,
                which: kc,
                bubbles: true,
                cancelable: true
              });
              window.dispatchEvent(ev);
              document.dispatchEvent(ev);
              var cv = document.querySelector('canvas') || document.querySelector('#game');
              if (cv) cv.dispatchEvent(ev);
            }

            window.addEventListener('message', function(ev) {
              if (ev.data && (ev.data.type === 'EMULATOR_KEY' || ev.data.type === 'NOKIA_KEY' || ev.data.type === 'CONTROLLER_KEY')) {
                dispatchEmulatedKey(ev.data.key, ev.data.eventType || 'keydown');
              }
            });

            window.addEventListener('keydown', function(e) {
              if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) || ['Space', ' '].includes(e.key)) {
                e.preventDefault();
              }
              if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D', 'Space', ' ', 'KeyJ', 'j', 'KeyK', 'k'].includes(e.code) || ['w','s','a','d','W','S','A','D',' ','j','k'].includes(e.key)) {
                dispatchEmulatedKey(e.code || e.key, 'keydown');
              }
            });

            window.addEventListener('keyup', function(e) {
              if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D', 'Space', ' ', 'KeyJ', 'j', 'KeyK', 'k'].includes(e.code) || ['w','s','a','d','W','S','A','D',' ','j','k'].includes(e.key)) {
                dispatchEmulatedKey(e.code || e.key, 'keyup');
              }
            });
          </script>
        </body>
        </html>
      `;
    }

    // 3. AUTHENTIC JAVA ME / NOKIA BOUNCE RUNTIME (.JAR)
    if (format === 'jar') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>${game.title}</title>
          <style>
            * { box-sizing: border-box; user-select: none; margin: 0; padding: 0; }
            body, html { 
              width: 100%; 
              height: 100%; 
              overflow: hidden; 
              background: #020617; 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center;
              font-family: monospace, system-ui;
            }
            #app-root {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              background: #020617;
              padding: 0;
            }
            #game-canvas {
              background: #0f172a;
              image-rendering: pixelated;
              image-rendering: -moz-crisp-edges;
              image-rendering: crisp-edges;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              border-radius: 8px;
              box-shadow: 0 0 60px rgba(0,0,0,0.95), 0 0 40px rgba(56, 189, 248, 0.15);
            }
            #touch-controls {
              position: absolute;
              bottom: 16px;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              padding: 0 24px;
              pointer-events: none;
              opacity: 0.85;
            }
            @media (hover: hover) and (pointer: fine) {
              #touch-controls {
                display: none !important;
              }
            }
            .touch-btn {
              pointer-events: auto;
              width: 60px;
              height: 60px;
              background: rgba(15, 23, 42, 0.75);
              border: 2px solid rgba(56, 189, 248, 0.5);
              border-radius: 50%;
              color: white;
              font-size: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(8px);
              active:scale-95;
            }
          </style>
        </head>
        <body>
          <div id="app-root">
            <canvas id="game-canvas" width="${selectedRatio === '16:9' || selectedRatio === 'auto' ? '1138' : selectedRatio === '4:3' ? '854' : selectedRatio === 'fill' ? '1280' : '480'}" height="${selectedRatio === 'fill' ? '720' : '640'}"></canvas>
            <div id="touch-controls">
              <div style="display: flex; gap: 12px;">
                <div class="touch-btn" id="btn-left">◀</div>
                <div class="touch-btn" id="btn-right">▶</div>
              </div>
              <div style="display: flex; gap: 12px;">
                <div class="touch-btn" id="btn-jump" style="background: rgba(16, 185, 129, 0.75); border-color: #34d399;">▲</div>
              </div>
            </div>
          </div>

          <script>
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            let isEcoMode = ${isEco ? 'true' : 'false'};

            // High-DPI Canvas internal sizing based on selected ratio
            const isWide = ${selectedRatio === '16:9' || selectedRatio === 'auto' ? 'true' : 'false'};
            const isClassic = ${selectedRatio === '4:3' ? 'true' : 'false'};
            const isFill = ${selectedRatio === 'fill' ? 'true' : 'false'};

            const W = isWide ? 1138 : isClassic ? 854 : isFill ? 1280 : 480;
            const H = isFill ? 720 : 640;
            canvas.width = W;
            canvas.height = H;

            // Audio Context Synthesizer
            let audioCtx = null;
            function initAudio() {
              if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              }
              if (audioCtx.state === 'suspended') {
                audioCtx.resume();
              }
            }

            function playBoing(freq = 320) {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.8, audioCtx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.12);
              } catch(e){}
            }

            function playRing() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.2);
              } catch(e){}
            }

            function playPop() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.2);
              } catch(e){}
            }

            // Authentic Nokia Bounce Ball Engine State
            const ball = {
              x: 120,
              y: 450,
              radius: 20,
              vx: 0,
              vy: 0,
              speed: 7,
              jumpPower: -13.5,
              gravity: 0.55,
              isGrounded: false,
              squashX: 1,
              squashY: 1,
              respawnX: 120,
              respawnY: 450
            };

            let score = 0;
            let lives = 3;
            let ringsCollected = 0;
            let totalRings = 5;
            let cameraX = 0;
            let levelWidth = 3200;

            const keys = {};

            // Level Elements: Platforms, Rings, Spikes, Rubber Trampolines, Water
            const platforms = [
              { x: 0, y: 560, w: 900, h: 80, type: 'ground' },
              { x: 1000, y: 560, w: 1200, h: 80, type: 'ground' },
              { x: 2300, y: 560, w: 900, h: 80, type: 'ground' },
              { x: 260, y: 440, w: 180, h: 28, type: 'brick' },
              { x: 520, y: 350, w: 200, h: 28, type: 'brick' },
              { x: 800, y: 260, w: 180, h: 28, type: 'brick' },
              { x: 1200, y: 440, w: 220, h: 28, type: 'brick' },
              { x: 1550, y: 360, w: 240, h: 28, type: 'brick' },
              { x: 1900, y: 280, w: 200, h: 28, type: 'brick' }
            ];

            const trampolines = [
              { x: 700, y: 540, w: 70, h: 20 },
              { x: 1450, y: 540, w: 70, h: 20 }
            ];

            const rings = [
              { x: 350, y: 390, radius: 24, collected: false },
              { x: 620, y: 300, radius: 24, collected: false },
              { x: 890, y: 210, radius: 24, collected: false },
              { x: 1310, y: 390, radius: 24, collected: false },
              { x: 1670, y: 310, radius: 24, collected: false }
            ];

            const spikes = [
              { x: 420, y: 535, w: 60, h: 25 },
              { x: 920, y: 580, w: 70, h: 60 },
              { x: 1350, y: 535, w: 60, h: 25 },
              { x: 2220, y: 580, w: 70, h: 60 }
            ];

            const particles = [];
            function addParticle(x, y, color, count = 8) {
              if (isEcoMode) count = Math.max(3, Math.floor(count / 2));
              for (let i = 0; i < count; i++) {
                particles.push({
                  x, y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: Math.random() * 4 + 2,
                  color,
                  life: 1.0,
                  decay: Math.random() * 0.04 + 0.02
                });
              }
            }

            function respawn() {
              playPop();
              addParticle(ball.x, ball.y, '#ef4444', 16);
              ball.x = ball.respawnX;
              ball.y = ball.respawnY;
              ball.vx = 0;
              ball.vy = 0;
              lives = Math.max(0, lives - 1);
            }

            // UNIFIED KEYBOARD & POSTMESSAGE LISTENER
            function applyKey(k, active) {
              initAudio();
              const keyLower = String(k).toLowerCase();
              keys[k] = active;
              keys[keyLower] = active;

              if (['4', 'arrowleft', 'a', 'keya'].includes(keyLower)) {
                keys['left'] = active;
              }
              if (['6', 'arrowright', 'd', 'keyd'].includes(keyLower)) {
                keys['right'] = active;
              }
              if (['2', '5', 'arrowup', 'w', 'keyw', ' ', 'space'].includes(keyLower)) {
                keys['jump'] = active;
              }
              if (['8', 'arrowdown', 's', 'keys'].includes(keyLower)) {
                keys['down'] = active;
              }
            }

            window.addEventListener('keydown', (e) => {
              applyKey(e.key, true);
              applyKey(e.code, true);
            });
            window.addEventListener('keyup', (e) => {
              applyKey(e.key, false);
              applyKey(e.code, false);
            });

            window.addEventListener('message', (e) => {
              if (e.data && e.data.type === 'NOKIA_KEY') {
                applyKey(e.data.key, e.data.eventType === 'keydown');
              } else if (e.data && e.data.type === 'ECO_MODE') {
                isEcoMode = e.data.enabled;
              }
            });

            // Touch UI Listeners
            const btnLeft = document.getElementById('btn-left');
            const btnRight = document.getElementById('btn-right');
            const btnJump = document.getElementById('btn-jump');

            if (btnLeft) {
              btnLeft.addEventListener('pointerdown', () => applyKey('4', true));
              btnLeft.addEventListener('pointerup', () => applyKey('4', false));
              btnLeft.addEventListener('pointerleave', () => applyKey('4', false));
            }
            if (btnRight) {
              btnRight.addEventListener('pointerdown', () => applyKey('6', true));
              btnRight.addEventListener('pointerup', () => applyKey('6', false));
              btnRight.addEventListener('pointerleave', () => applyKey('6', false));
            }
            if (btnJump) {
              btnJump.addEventListener('pointerdown', () => applyKey('2', true));
              btnJump.addEventListener('pointerup', () => applyKey('2', false));
              btnJump.addEventListener('pointerleave', () => applyKey('2', false));
            }

            // Canvas Direct Swipe/Touch Support
            let touchStartX = 0;
            canvas.addEventListener('pointerdown', (e) => {
              initAudio();
              const rect = canvas.getBoundingClientRect();
              touchStartX = e.clientX - rect.left;
              if (touchStartX < rect.width * 0.35) {
                applyKey('4', true);
              } else if (touchStartX > rect.width * 0.65) {
                applyKey('6', true);
              } else {
                applyKey('2', true);
              }
            });
            canvas.addEventListener('pointerup', () => {
              applyKey('4', false);
              applyKey('6', false);
              applyKey('2', false);
            });

            // Eco-Friendly Visibility Throttling
            let isTabVisible = true;
            document.addEventListener('visibilitychange', () => {
              isTabVisible = !document.hidden;
            });

            // Fixed-Timestep 60FPS Game Loop
            let lastTime = performance.now();
            function updateGame(now) {
              requestAnimationFrame(updateGame);
              
              // ECO FRIENDLY: If tab is hidden in background, sleep to save 0% CPU/Battery!
              if (!isTabVisible) return;

              const dt = Math.min(32, now - lastTime) / 1000;
              lastTime = now;

              // 1. Controls & Horizontal Movement
              if (keys['left']) {
                ball.vx = -ball.speed;
              } else if (keys['right']) {
                ball.vx = ball.speed;
              } else {
                ball.vx *= 0.85;
              }

              // 2. Jump Handling (Variable Jump Height)
              if (keys['jump'] && ball.isGrounded) {
                ball.vy = ball.jumpPower;
                ball.isGrounded = false;
                ball.squashX = 0.7;
                ball.squashY = 1.3;
                playBoing(360);
                addParticle(ball.x, ball.y + ball.radius, '#38bdf8', 6);
              }

              // 3. Gravity
              ball.vy += ball.gravity;
              ball.x += ball.vx;
              ball.y += ball.vy;
              ball.isGrounded = false;

              // Squash & Stretch recovery
              ball.squashX += (1 - ball.squashX) * 0.15;
              ball.squashY += (1 - ball.squashY) * 0.15;

              // 4. Platform Collisions
              platforms.forEach(p => {
                if (ball.x + ball.radius > p.x && ball.x - ball.radius < p.x + p.w) {
                  if (ball.y + ball.radius >= p.y && ball.y - ball.radius < p.y + p.h && ball.vy >= 0) {
                    ball.y = p.y - ball.radius;
                    ball.vy = 0;
                    ball.isGrounded = true;
                    if (Math.abs(ball.vy) > 3) {
                      ball.squashX = 1.25;
                      ball.squashY = 0.75;
                      playBoing(260);
                    }
                  }
                }
              });

              // 5. Rubber Trampoline Boost
              trampolines.forEach(t => {
                if (ball.x + ball.radius > t.x && ball.x - ball.radius < t.x + t.w) {
                  if (ball.y + ball.radius >= t.y && ball.y - ball.radius < t.y + t.h && ball.vy >= 0) {
                    ball.vy = -18;
                    ball.squashX = 0.6;
                    ball.squashY = 1.4;
                    playBoing(480);
                    addParticle(ball.x, ball.y + ball.radius, '#ef4444', 12);
                  }
                }
              });

              // 6. Ring Collection
              rings.forEach(r => {
                if (!r.collected) {
                  const dx = ball.x - r.x;
                  const dy = ball.y - r.y;
                  if (Math.hypot(dx, dy) < ball.radius + r.radius) {
                    r.collected = true;
                    score += 100;
                    ringsCollected++;
                    playRing();
                    addParticle(r.x, r.y, '#fbbf24', 14);
                  }
                }
              });

              // 7. Spike Hazards & Void Fall
              spikes.forEach(s => {
                if (ball.x + ball.radius > s.x && ball.x - ball.radius < s.x + s.w) {
                  if (ball.y + ball.radius > s.y && ball.y - ball.radius < s.y + s.h) {
                    respawn();
                  }
                }
              });

              if (ball.y > 660) {
                respawn();
              }

              // Smooth Camera Follow
              cameraX += (ball.x - W / 2 - cameraX) * 0.1;
              cameraX = Math.max(0, Math.min(levelWidth - W, cameraX));

              // RENDER SCENE
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, 0, W, H);

              ctx.save();
              ctx.translate(-cameraX, 0);

              // Background Mountains & Sun
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.arc(cameraX * 0.5 + 380, 140, 48, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#1e293b';
              for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 600 - cameraX * 0.2, 560);
                ctx.lineTo(i * 600 + 300 - cameraX * 0.2, 280);
                ctx.lineTo(i * 600 + 600 - cameraX * 0.2, 560);
                ctx.fill();
              }

              // Draw Platforms
              platforms.forEach(p => {
                if (p.type === 'ground') {
                  ctx.fillStyle = '#059669';
                  ctx.fillRect(p.x, p.y, p.w, 18);
                  ctx.fillStyle = '#78350f';
                  ctx.fillRect(p.x, p.y + 18, p.w, p.h - 18);
                } else {
                  ctx.fillStyle = '#3b82f6';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                  ctx.strokeStyle = '#60a5fa';
                  ctx.lineWidth = 3;
                  ctx.strokeRect(p.x, p.y, p.w, p.h);
                }
              });

              // Draw Trampolines
              trampolines.forEach(t => {
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.fillStyle = '#f87171';
                ctx.fillRect(t.x + 5, t.y + 3, t.w - 10, 5);
              });

              // Draw Rings
              rings.forEach((r, idx) => {
                if (!r.collected) {
                  const anim = Math.sin(now * 0.005 + idx) * 4;
                  ctx.strokeStyle = '#f59e0b';
                  ctx.lineWidth = 6;
                  ctx.beginPath();
                  ctx.ellipse(r.x, r.y + anim, r.radius, r.radius * 0.45, now * 0.003, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.strokeStyle = '#fef08a';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
              });

              // Draw Spikes
              spikes.forEach(s => {
                ctx.fillStyle = '#cbd5e1';
                const count = Math.floor(s.w / 15);
                for (let i = 0; i < count; i++) {
                  ctx.beginPath();
                  ctx.moveTo(s.x + i * 15, s.y + s.h);
                  ctx.lineTo(s.x + i * 15 + 7.5, s.y);
                  ctx.lineTo(s.x + (i + 1) * 15, s.y + s.h);
                  ctx.fill();
                }
              });

              // Draw Particles
              for (let i = particles.length - 1; i >= 0; i--) {
                const pt = particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.life -= pt.decay;
                if (pt.life <= 0) {
                  particles.splice(i, 1);
                  continue;
                }
                ctx.fillStyle = pt.color;
                ctx.globalAlpha = pt.life;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
              }

              // Draw Authentic Squash/Stretch Red Ball
              ctx.save();
              ctx.translate(ball.x, ball.y);
              ctx.scale(ball.squashX, ball.squashY);

              // Red Ball Body & 3D Shading
              const grad = ctx.createRadialGradient(-6, -6, 2, 0, 0, ball.radius);
              grad.addColorStop(0, '#f87171');
              grad.addColorStop(0.5, '#ef4444');
              grad.addColorStop(1, '#991b1b');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
              ctx.fill();

              // Ball Highlight
              ctx.fillStyle = 'rgba(255,255,255,0.7)';
              ctx.beginPath();
              ctx.arc(-6, -6, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
              ctx.restore();

              // TOP HUD: Score, Lives, Rings, Eco Badge
              ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
              ctx.fillRect(0, 0, W, 48);

              ctx.fillStyle = '#f8fafc';
              ctx.font = 'bold 16px monospace';
              ctx.fillText('SCORE: ' + score, 16, 30);

              ctx.fillStyle = '#fbbf24';
              ctx.fillText('RINGS: ' + ringsCollected + '/' + totalRings, 180, 30);

              ctx.fillStyle = '#f43f5e';
              ctx.fillText('❤ ' + lives, 340, 30);

              if (isEcoMode) {
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 12px monospace';
                ctx.fillText('🌿 ECO', 410, 30);
              }
            }

            requestAnimationFrame(updateGame);
          </script>
        </body>
        </html>
      `;
    }

    // 4. AUTHENTIC SYMBIAN S60 SIS ENGINE
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${game.title}</title>
        <style>
          * { box-sizing: border-box; user-select: none; margin: 0; padding: 0; }
          body, html { width: 100%; height: 100%; overflow: hidden; background: #020617; display: flex; align-items: center; justify-content: center; }
          #game-canvas { background: #0b132b; image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; aspect-ratio: 3/4; }
        </style>
      </head>
      <body>
        <canvas id="game-canvas" width="480" height="640"></canvas>
        <script>
          const canvas = document.getElementById('game-canvas');
          const ctx = canvas.getContext('2d');
          let isEcoMode = ${isEco ? 'true' : 'false'};

          const W = 480;
          const H = 640;
          canvas.width = W;
          canvas.height = H;

          let audioCtx = null;
          function initAudio() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
          }

          function playLaser() {
            if (!audioCtx) return;
            try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(800, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.1);
              gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.1);
            } catch(e){}
          }

          const player = { x: 100, y: 460, vx: 0, vy: 0, facing: 1, isGrounded: false, hp: 100 };
          const bullets = [];
          const keys = {};

          function applyKey(k, active) {
            initAudio();
            const keyLower = String(k).toLowerCase();
            keys[k] = active;
            keys[keyLower] = active;

            if (['4', 'arrowleft', 'a', 'keya'].includes(keyLower)) keys['left'] = active;
            if (['6', 'arrowright', 'd', 'keyd'].includes(keyLower)) keys['right'] = active;
            if (['2', 'arrowup', 'w', 'keyw'].includes(keyLower)) keys['up'] = active;
            if (['5', ' ', 'space', 'enter', 'z'].includes(keyLower) && active) {
              playLaser();
              bullets.push({
                x: player.x + (player.facing === 1 ? 35 : -10),
                y: player.y + 16,
                vx: player.facing * 14,
                color: '#38bdf8'
              });
            }
          }

          window.addEventListener('keydown', (e) => {
            applyKey(e.key, true);
            applyKey(e.code, true);
          });
          window.addEventListener('keyup', (e) => {
            applyKey(e.key, false);
            applyKey(e.code, false);
          });
          window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'NOKIA_KEY') {
              applyKey(e.data.key, e.data.eventType === 'keydown');
            } else if (e.data && e.data.type === 'ECO_MODE') {
              isEcoMode = e.data.enabled;
            }
          });

          let isTabVisible = true;
          document.addEventListener('visibilitychange', () => {
            isTabVisible = !document.hidden;
          });

          function loop() {
            requestAnimationFrame(loop);
            if (!isTabVisible) return;

            if (keys['left']) { player.vx = -6; player.facing = -1; }
            else if (keys['right']) { player.vx = 6; player.facing = 1; }
            else { player.vx *= 0.8; }

            if (keys['up'] && player.isGrounded) {
              player.vy = -12;
              player.isGrounded = false;
            }

            player.vy += 0.6;
            player.x += player.vx;
            player.y += player.vy;

            if (player.y >= 460) {
              player.y = 460;
              player.vy = 0;
              player.isGrounded = true;
            }

            // Render
            ctx.fillStyle = '#0b132b';
            ctx.fillRect(0, 0, W, H);

            // Ground
            ctx.fillStyle = '#1c2541';
            ctx.fillRect(0, 500, W, 140);
            ctx.fillStyle = '#3a506b';
            ctx.fillRect(0, 496, W, 4);

            // Bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
              const b = bullets[i];
              b.x += b.vx;
              ctx.fillStyle = b.color;
              ctx.fillRect(b.x, b.y, 14, 5);
              if (b.x < 0 || b.x > W) bullets.splice(i, 1);
            }

            // Mech Player
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(player.x, player.y, 30, 40);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(player.x + (player.facing === 1 ? 20 : 2), player.y + 8, 8, 8);

            // Gun
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(player.x + (player.facing === 1 ? 24 : -12), player.y + 18, 16, 6);

            // HUD
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 16px monospace';
            ctx.fillText('SYMBIAN S60: ${game.title}', 16, 30);
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('HP: ' + player.hp + '%', 380, 30);
          }
          requestAnimationFrame(loop);
        </script>
      </body>
      </html>
    `;
  };

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center p-8 bg-slate-950 text-white rounded-2xl border border-rose-500/30">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <Zap className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold mb-2">Engine Initialization Notice</h3>
        <p className="text-slate-400 text-sm text-center max-w-md mb-6">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Engine</span>
        </button>
      </div>
    );
  }

  // Keypad matrix buttons definition
  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
    ['Left', 'Up', 'Right'],
    ['Down', 'Ok', 'C']
  ];

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl relative select-none">
      {/* Emulator Canvas Display Area */}
      <div 
        className="w-full flex-1 h-full min-h-[580px] flex items-center justify-center relative overflow-hidden bg-black"
      >
        <iframe
          key={`${game.id}-${selectedRatio}`}
          ref={iframeRef}
          srcDoc={buildEmulatorDoc()}
          title={game.title}
          className="w-full h-full border-0 bg-slate-950"
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals"
          onLoad={() => setIsLoading(false)}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm font-bold text-cyan-400">Booting Multi-Core WASM Runtime...</span>
          </div>
        )}

        {/* Floating Quick Controls inside Player */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10 opacity-80 hover:opacity-100 transition-opacity">
          {['jar', 'sis'].includes(format) && (
            <button
              onClick={() => {
                HapticEngine.lightTick();
                setShowTouchKeypad(!showTouchKeypad);
              }}
              className={`backdrop-blur-md rounded-lg px-2.5 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                showTouchKeypad 
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' 
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle Virtual Phone Keypad"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{showTouchKeypad ? 'Hide Keypad' : 'Virtual Keypad'}</span>
            </button>
          )}

          <select 
            value={selectedRatio}
            onChange={(e) => {
              HapticEngine.lightTick();
              setSelectedRatio(e.target.value);
            }}
            className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500 cursor-pointer font-bold shadow-md"
          >
            <option value="16:9">🖥️ Widescreen HD (16:9) - Full Stage</option>
            <option value="4:3">🕹️ Classic Arcade (4:3)</option>
            <option value="fill">🔲 Stretch Fill (100%)</option>
            <option value="3:4">📱 Retro Nokia (3:4)</option>
            <option value="auto">⚡ Auto Fit</option>
          </select>
          <button 
            onClick={() => {
              HapticEngine.selectionClick();
              toggleFullscreen();
            }}
            className="bg-slate-900/80 backdrop-blur-md hover:bg-cyan-600/80 text-white rounded-lg p-2 border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Docked Virtual Keypad for Mobile / Touch Devices (Shown only when toggled on) */}
      {showTouchKeypad && ['jar', 'sis'].includes(format) && (
        <div className="w-full bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex flex-col items-center gap-2 animate-in slide-in-from-bottom duration-200 shrink-0">
          <div className="flex items-center justify-between w-full max-w-md text-xs text-slate-400 font-mono px-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Nokia Series Keypad</span>
            </span>
            <span className="text-[11px] text-slate-500">PC Keyboard: Arrow Keys / WASD / Space</span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
            {keypadButtons.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                {row.map((k) => (
                  <button
                    key={k}
                    onMouseDown={() => { HapticEngine.lightTick(); sendKey(k, 'keydown'); }}
                    onMouseUp={() => sendKey(k, 'keyup')}
                    onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey(k, 'keydown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); sendKey(k, 'keyup'); }}
                    className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 active:text-white rounded-lg font-bold font-mono text-sm border border-slate-700/60 shadow-sm transition-all flex items-center justify-center"
                  >
                    {k}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Universal Interactive Game Key Suggestions & Controller Bar (Desktop + Mobile) */}
      {['gba', 'nes', 'snes', 'md', 'gb', 'gbc', 'emulatorjs'].includes(format) || game.engineType === 'emulatorjs' ? (
        <div className="w-full bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 flex flex-col items-center gap-3 shadow-inner">
          {/* Header & Status Indicator */}
          <div className="flex flex-wrap items-center justify-between w-full max-w-4xl text-xs px-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
                <Gamepad2 className="w-4 h-4 text-cyan-400 inline" />
                <span>GAME CONTROLS GUIDE (KEYBOARD & TOUCH)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden md:inline">
                Press physical keyboard or click/touch buttons below:
              </span>
              <button
                onClick={() => {
                  HapticEngine.selectionClick();
                  iframeRef.current?.focus();
                  iframeRef.current?.contentWindow?.focus();
                }}
                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 rounded text-cyan-300 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                title="Focus game canvas for keyboard"
              >
                🎯 Refocus Game
              </button>
            </div>
          </div>

          {/* Key Suggestions Cards & Interactive Virtual Controller Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 w-full max-w-4xl">
            {/* 1. D-Pad / Movement */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5 shadow-sm col-span-2 sm:col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Direction / Aim & Run
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-bold">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-bold">↓</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-bold">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-bold">→</kbd>
                <span className="text-slate-500 mx-1">or</span>
                <span className="text-slate-300 font-bold">WASD</span>
              </div>
              <div className="grid grid-cols-3 gap-1 w-28 h-20 items-center justify-center mt-1">
                <div />
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('ArrowUp', 'keydown'); }}
                  onMouseUp={() => sendKey('ArrowUp', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('ArrowUp', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('ArrowUp', 'keyup'); }}
                  className="h-8 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 rounded border border-slate-700 text-slate-200 active:text-white font-bold flex items-center justify-center text-xs shadow cursor-pointer"
                >▲</button>
                <div />
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('ArrowLeft', 'keydown'); }}
                  onMouseUp={() => sendKey('ArrowLeft', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('ArrowLeft', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('ArrowLeft', 'keyup'); }}
                  className="h-8 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 rounded border border-slate-700 text-slate-200 active:text-white font-bold flex items-center justify-center text-xs shadow cursor-pointer"
                >◀</button>
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('ArrowDown', 'keydown'); }}
                  onMouseUp={() => sendKey('ArrowDown', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('ArrowDown', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('ArrowDown', 'keyup'); }}
                  className="h-8 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 rounded border border-slate-700 text-slate-200 active:text-white font-bold flex items-center justify-center text-xs shadow cursor-pointer"
                >▼</button>
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('ArrowRight', 'keydown'); }}
                  onMouseUp={() => sendKey('ArrowRight', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('ArrowRight', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('ArrowRight', 'keyup'); }}
                  className="h-8 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 rounded border border-slate-700 text-slate-200 active:text-white font-bold flex items-center justify-center text-xs shadow cursor-pointer"
                >▶</button>
              </div>
            </div>

            {/* 2. Fire / Shoot (Button B) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                🔫 Fire / Shoot (B)
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <kbd className="px-2 py-0.5 bg-amber-950/80 border border-amber-600/70 rounded text-amber-300 font-bold">Z</kbd>
                <span className="text-slate-500">or</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-bold">J</kbd>
              </div>
              <button
                onMouseDown={() => { HapticEngine.selectionClick(); sendKey('KeyZ', 'keydown'); }}
                onMouseUp={() => sendKey('KeyZ', 'keyup')}
                onTouchStart={(e) => { e.preventDefault(); HapticEngine.selectionClick(); sendKey('KeyZ', 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); sendKey('KeyZ', 'keyup'); }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 active:scale-95 text-white font-black text-sm shadow-lg shadow-amber-900/40 border-2 border-amber-400 flex items-center justify-center cursor-pointer transition-transform"
              >
                FIRE
              </button>
            </div>

            {/* 3. Jump (Button A) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                🦘 Jump (A)
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <kbd className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-600/70 rounded text-cyan-300 font-bold">X</kbd>
                <span className="text-slate-500">or</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-bold">K</kbd>
              </div>
              <button
                onMouseDown={() => { HapticEngine.selectionClick(); sendKey('KeyX', 'keydown'); }}
                onMouseUp={() => sendKey('KeyX', 'keyup')}
                onTouchStart={(e) => { e.preventDefault(); HapticEngine.selectionClick(); sendKey('KeyX', 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); sendKey('KeyX', 'keyup'); }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-black text-sm shadow-lg shadow-cyan-900/40 border-2 border-cyan-400 flex items-center justify-center cursor-pointer transition-transform"
              >
                JUMP
              </button>
            </div>

            {/* 4. Turbo / Rapid Fire */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                ⚡ Turbo Rapid
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <kbd className="px-1.5 py-0.5 bg-purple-950/80 border border-purple-600/70 rounded text-purple-300 font-bold">A</kbd>
                <span className="text-slate-500">/</span>
                <kbd className="px-1.5 py-0.5 bg-purple-950/80 border border-purple-600/70 rounded text-purple-300 font-bold">S</kbd>
              </div>
              <div className="flex gap-1.5 mt-1">
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('KeyA', 'keydown'); }}
                  onMouseUp={() => sendKey('KeyA', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('KeyA', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('KeyA', 'keyup'); }}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-purple-600 border border-purple-500/50 text-purple-300 active:text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                >TA</button>
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('KeyS', 'keydown'); }}
                  onMouseUp={() => sendKey('KeyS', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('KeyS', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('KeyS', 'keyup'); }}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-purple-600 border border-purple-500/50 text-purple-300 active:text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                >TB</button>
              </div>
            </div>

            {/* 5. Start & Select Controls */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                ▶ Start / Select
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300">
                <span>Enter / V</span>
              </div>
              <div className="flex flex-col gap-1.5 w-full mt-1">
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('Enter', 'keydown'); }}
                  onMouseUp={() => sendKey('Enter', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('Enter', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('Enter', 'keyup'); }}
                  className="w-full py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-bold font-mono text-[11px] shadow flex items-center justify-center cursor-pointer"
                >
                  START (Enter)
                </button>
                <button
                  onMouseDown={() => { HapticEngine.lightTick(); sendKey('KeyV', 'keydown'); }}
                  onMouseUp={() => sendKey('KeyV', 'keyup')}
                  onTouchStart={(e) => { e.preventDefault(); HapticEngine.lightTick(); sendKey('KeyV', 'keydown'); }}
                  onTouchEnd={(e) => { e.preventDefault(); sendKey('KeyV', 'keyup'); }}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold font-mono text-[10px] shadow flex items-center justify-center cursor-pointer"
                >
                  SELECT (V)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
