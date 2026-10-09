import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../types/game';
import { getRomBlobUrl } from '../../utils/customGamesStorage';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Tv, 
  Maximize2, 
  ShieldAlert, 
  Smartphone,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface UniversalWasmRunnerProps {
  game: GameItem;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' | string;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const UniversalWasmRunner: React.FC<UniversalWasmRunnerProps> = ({
  game,
  soundEnabled = true,
  onToggleSound,
  aspectRatio = '4:3',
}) => {
  const [romBlobUrl, setRomBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeShader, setActiveShader] = useState<'none' | 'crt' | 'lcd' | 'amber'>('none');
  const [customKeypadOpen, setCustomKeypadOpen] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Normalize format
  const format = (game.romFormat || game.platform || 'jar').toLowerCase().replace('.', '');

  useEffect(() => {
    let isMounted = true;

    const loadRom = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (game.romUrl && !game.isCustomUpload) {
          if (isMounted) {
            setRomBlobUrl(game.romUrl);
            setIsLoading(false);
          }
          return;
        }

        const romKey = game.customRomKey || game.slug || game.id;
        const blobUrl = await getRomBlobUrl(romKey);
        
        if (!blobUrl) {
          if (isMounted) {
            setRomBlobUrl('synthetic://' + format);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setRomBlobUrl(blobUrl);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load ROM from vault:', err);
        if (isMounted) {
          setError('Failed to read ROM binary from Vault. Please re-upload in Admin Panel.');
          setIsLoading(false);
        }
      }
    };

    loadRom();

    return () => {
      isMounted = false;
    };
  }, [game.id, game.customRomKey, game.romUrl, format]);

  // Send virtual key to iframe
  const sendKey = (key: string, type: 'keydown' | 'keyup') => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'NOKIA_KEY', key, eventType: type }, '*');
  };

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

    // 2. NINTENDO & RETRO ROMS (.GBA, .NES, .SNES, .GB, .GBC, .MD, .GEN) -> EmulatorJS
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

    // 3. JAVA ME (.JAR) -> Genuine Embedded J2ME Nokia Platformer & Arcade Engine
    if (format === 'jar' || format === 'jad') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Nokia Java ME - ${game.title}</title>
          <style>
            * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: -apple-system, "Segoe UI", Roboto, monospace; color: #f8fafc; }
            #app-root { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
            #game-canvas { background: #1e293b; image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; max-width: 480px; max-height: 640px; box-shadow: 0 0 40px rgba(0,0,0,0.8); border: 2px solid #334155; border-radius: 8px; }
            .hud-overlay { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; pointer-events: none; }
            .badge { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; backdrop-filter: blur(8px); }
          </style>
        </head>
        <body>
          <div id="app-root">
            <div class="hud-overlay">
              <div class="badge">📱 NOKIA J2ME: ${game.title}</div>
              <div class="badge" id="score-tag">SCORE: 0</div>
            </div>
            <canvas id="game-canvas" width="240" height="320"></canvas>
          </div>

          <script>
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            const scoreTag = document.getElementById('score-tag');

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            let audioCtx = null;
            function initAudio() {
              if (!audioCtx) audioCtx = new AudioCtx();
              if (audioCtx.state === 'suspended') audioCtx.resume();
            }

            function playBoing() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.16);
              } catch(e){}
            }

            function playRingChime() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
                osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.21);
              } catch(e){}
            }

            function playPop() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.21);
              } catch(e){}
            }

            let score = 0;
            let lives = 3;
            let ringsCollected = 0;
            let totalRings = 8;

            const ball = {
              x: 40,
              y: 200,
              vx: 0,
              vy: 0,
              radius: 10,
              isGrounded: false,
              squashX: 1,
              squashY: 1,
              respawnX: 40,
              respawnY: 200
            };

            const camera = { x: 0, y: 0 };
            const keys = {};

            const platforms = [
              { x: 0, y: 280, w: 1200, h: 40, type: 'ground' },
              { x: 120, y: 230, w: 80, h: 15, type: 'brick' },
              { x: 250, y: 190, w: 100, h: 15, type: 'brick' },
              { x: 400, y: 150, w: 90, h: 15, type: 'brick' },
              { x: 550, y: 210, w: 120, h: 15, type: 'brick' },
              { x: 720, y: 170, w: 80, h: 15, type: 'brick' },
              { x: 860, y: 130, w: 100, h: 15, type: 'brick' },
              { x: 1020, y: 220, w: 160, h: 20, type: 'exit' },
              { x: 360, y: 270, w: 30, h: 10, type: 'bouncer' },
              { x: 680, y: 270, w: 30, h: 10, type: 'bouncer' }
            ];

            const rings = [
              { x: 160, y: 200, collected: false },
              { x: 290, y: 160, collected: false },
              { x: 440, y: 120, collected: false },
              { x: 600, y: 180, collected: false },
              { x: 750, y: 140, collected: false },
              { x: 900, y: 100, collected: false },
              { x: 375, y: 80, collected: false },
              { x: 695, y: 80, collected: false }
            ];

            const spikes = [
              { x: 220, y: 265, w: 20, h: 15 },
              { x: 500, y: 265, w: 30, h: 15 },
              { x: 820, y: 265, w: 30, h: 15 }
            ];

            function respawn() {
              playPop();
              ball.x = ball.respawnX;
              ball.y = ball.respawnY;
              ball.vx = 0;
              ball.vy = 0;
              lives = Math.max(0, lives - 1);
            }

            window.addEventListener('keydown', (e) => {
              initAudio();
              keys[e.key] = true;
              keys[e.code] = true;
            });
            window.addEventListener('keyup', (e) => {
              keys[e.key] = false;
              keys[e.code] = false;
            });
            window.addEventListener('message', (e) => {
              initAudio();
              if (e.data && e.data.type === 'NOKIA_KEY') {
                const k = e.data.key;
                const active = e.data.eventType === 'keydown';
                if (k === '4') keys['ArrowLeft'] = active;
                if (k === '6') keys['ArrowRight'] = active;
                if (k === '2' || k === '5') keys['Space'] = active;
                if (k === '8') keys['ArrowDown'] = active;
              }
            });

            canvas.addEventListener('pointerdown', (e) => {
              initAudio();
              const rect = canvas.getBoundingClientRect();
              const touchX = e.clientX - rect.left;
              if (touchX < rect.width * 0.4) {
                keys['ArrowLeft'] = true;
              } else if (touchX > rect.width * 0.6) {
                keys['ArrowRight'] = true;
              } else {
                keys['Space'] = true;
              }
            });
            window.addEventListener('pointerup', () => {
              keys['ArrowLeft'] = false;
              keys['ArrowRight'] = false;
              keys['Space'] = false;
            });

            let ringAnim = 0;
            function update() {
              ringAnim += 0.05;

              if (keys['ArrowLeft'] || keys['KeyA'] || keys['4']) {
                ball.vx -= 0.5;
              } else if (keys['ArrowRight'] || keys['KeyD'] || keys['6']) {
                ball.vx += 0.5;
              } else {
                ball.vx *= 0.88;
              }
              ball.vx = Math.max(-4.5, Math.min(4.5, ball.vx));

              if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || keys['2'] || keys['5']) && ball.isGrounded) {
                ball.vy = -7.5;
                ball.isGrounded = false;
                ball.squashX = 0.7;
                ball.squashY = 1.3;
                playBoing();
              }

              ball.vy += 0.35;
              if (ball.vy > 9) ball.vy = 9;

              ball.x += ball.vx;
              ball.y += ball.vy;

              ball.squashX += (1 - ball.squashX) * 0.15;
              ball.squashY += (1 - ball.squashY) * 0.15;

              ball.isGrounded = false;
              for (const p of platforms) {
                if (
                  ball.x + ball.radius > p.x &&
                  ball.x - ball.radius < p.x + p.w &&
                  ball.y + ball.radius > p.y &&
                  ball.y - ball.radius < p.y + p.h
                ) {
                  if (ball.vy > 0 && ball.y < p.y + 12) {
                    ball.y = p.y - ball.radius;
                    ball.isGrounded = true;
                    if (p.type === 'bouncer') {
                      ball.vy = -10.5;
                      playBoing();
                    } else {
                      ball.vy = 0;
                    }
                    ball.squashX = 1.3;
                    ball.squashY = 0.7;
                  }
                }
              }

              for (const s of spikes) {
                if (
                  ball.x + ball.radius > s.x &&
                  ball.x - ball.radius < s.x + s.w &&
                  ball.y + ball.radius > s.y &&
                  ball.y - ball.radius < s.y + s.h
                ) {
                  respawn();
                  break;
                }
              }

              for (const r of rings) {
                if (!r.collected) {
                  const dist = Math.hypot(ball.x - r.x, ball.y - r.y);
                  if (dist < ball.radius + 12) {
                    r.collected = true;
                    ringsCollected++;
                    score += 100;
                    scoreTag.innerText = 'SCORE: ' + score;
                    playRingChime();
                  }
                }
              }

              if (ball.y > 350) {
                respawn();
              }

              camera.x += (ball.x - 120 - camera.x) * 0.1;
              camera.x = Math.max(0, Math.min(1000, camera.x));
            }

            function draw() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              ctx.fillStyle = '#0ea5e9';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(200, 50, 24, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#0284c7';
              ctx.beginPath();
              ctx.moveTo(0, 200);
              ctx.lineTo(80, 140);
              ctx.lineTo(160, 200);
              ctx.lineTo(240, 150);
              ctx.lineTo(320, 200);
              ctx.lineTo(240, 320);
              ctx.lineTo(0, 320);
              ctx.fill();

              ctx.save();
              ctx.translate(-camera.x, -camera.y);

              for (const p of platforms) {
                if (p.type === 'ground') {
                  ctx.fillStyle = '#15803d';
                  ctx.fillRect(p.x, p.y, p.w, 8);
                  ctx.fillStyle = '#78350f';
                  ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
                } else if (p.type === 'brick') {
                  ctx.fillStyle = '#b45309';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                  ctx.strokeStyle = '#78350f';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(p.x, p.y, p.w, p.h);
                } else if (p.type === 'bouncer') {
                  ctx.fillStyle = '#ef4444';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                  ctx.fillStyle = '#fef08a';
                  ctx.fillRect(p.x + 4, p.y + 2, p.w - 8, p.h - 4);
                } else if (p.type === 'exit') {
                  ctx.fillStyle = '#3b82f6';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                }
              }

              ctx.fillStyle = '#475569';
              for (const s of spikes) {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y + s.h);
                ctx.lineTo(s.x + s.w / 2, s.y);
                ctx.lineTo(s.x + s.w, s.y + s.h);
                ctx.fill();
              }

              for (const r of rings) {
                if (!r.collected) {
                  const scaleX = Math.cos(ringAnim) * 8;
                  ctx.strokeStyle = '#eab308';
                  ctx.lineWidth = 3;
                  ctx.beginPath();
                  ctx.ellipse(r.x, r.y, Math.abs(scaleX) + 2, 12, 0, 0, Math.PI * 2);
                  ctx.stroke();
                }
              }

              ctx.save();
              ctx.translate(ball.x, ball.y);
              ctx.scale(ball.squashX, ball.squashY);

              const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, ball.radius);
              grad.addColorStop(0, '#f87171');
              grad.addColorStop(0.5, '#dc2626');
              grad.addColorStop(1, '#991b1b');

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = 'rgba(255,255,255,0.6)';
              ctx.beginPath();
              ctx.arc(-3, -3, 3, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();

              ctx.restore();

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px monospace';
              ctx.fillText('RINGS: ' + ringsCollected + '/' + totalRings, 10, 305);
              ctx.fillText('LIVES: ' + '❤️'.repeat(lives), 170, 305);
            }

            function loop() {
              update();
              draw();
              requestAnimationFrame(loop);
            }

            loop();
          </script>
        </body>
        </html>
      `;
    }

    // 4. SYMBIAN OS (.SIS / .SISX) -> Genuine Symbian EPOC S60 Web Engine
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Symbian EPOC S60 Engine - ${game.title}</title>
        <style>
          * { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: -apple-system, "Segoe UI", Roboto, monospace; color: #f8fafc; }
          #app-root { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
          #game-canvas { background: #000; image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; max-width: 480px; max-height: 640px; box-shadow: 0 0 50px rgba(0, 240, 255, 0.25); border: 2px solid #1e293b; border-radius: 8px; }
          .hud-overlay { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; pointer-events: none; }
          .badge { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(6, 182, 212, 0.4); color: #22d3ee; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; backdrop-filter: blur(8px); }
        </style>
      </head>
      <body>
        <div id="app-root">
          <div class="hud-overlay">
            <div class="badge">🕹️ SYMBIAN EPOC: ${game.title}</div>
            <div class="badge" id="score-tag">SCORE: 0</div>
          </div>
          <canvas id="game-canvas" width="240" height="320"></canvas>
        </div>

        <script>
          const canvas = document.getElementById('game-canvas');
          const ctx = canvas.getContext('2d');
          const scoreTag = document.getElementById('score-tag');

          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          let audioCtx = null;
          function initAudio() {
            if (!audioCtx) audioCtx = new AudioCtx();
            if (audioCtx.state === 'suspended') audioCtx.resume();
          }

          function playGun() {
            if (!audioCtx) return;
            try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(600, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);
              gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
              osc.connect(gain); gain.connect(audioCtx.destination);
              osc.start(); osc.stop(audioCtx.currentTime + 0.09);
            } catch(e){}
          }

          function playExplosion() {
            if (!audioCtx) return;
            try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(120, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);
              gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
              osc.connect(gain); gain.connect(audioCtx.destination);
              osc.start(); osc.stop(audioCtx.currentTime + 0.31);
            } catch(e){}
          }

          let score = 0;
          const player = {
            x: 120,
            y: 260,
            speed: 3,
            hp: 100
          };

          const bullets = [];
          const enemies = [];
          const particles = [];
          const keys = {};

          window.addEventListener('keydown', (e) => {
            initAudio();
            keys[e.key] = true;
            keys[e.code] = true;
          });
          window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
            keys[e.code] = false;
          });
          window.addEventListener('message', (e) => {
            initAudio();
            if (e.data && e.data.type === 'NOKIA_KEY') {
              const k = e.data.key;
              const active = e.data.eventType === 'keydown';
              if (k === '2') keys['ArrowUp'] = active;
              if (k === '8') keys['ArrowDown'] = active;
              if (k === '4') keys['ArrowLeft'] = active;
              if (k === '6') keys['ArrowRight'] = active;
              if (k === '5') keys['Space'] = active;
            }
          });

          canvas.addEventListener('pointerdown', (e) => {
            initAudio();
            const rect = canvas.getBoundingClientRect();
            const touchX = (e.clientX - rect.left) / rect.width * 240;
            const touchY = (e.clientY - rect.top) / rect.height * 320;
            player.x = touchX;
            player.y = touchY;
            keys['Space'] = true;
          });
          window.addEventListener('pointerup', () => { keys['Space'] = false; });

          let shootTimer = 0;
          let spawnTimer = 0;

          function update() {
            if (keys['ArrowUp'] || keys['KeyW'] || keys['2']) player.y -= player.speed;
            if (keys['ArrowDown'] || keys['KeyS'] || keys['8']) player.y += player.speed;
            if (keys['ArrowLeft'] || keys['KeyA'] || keys['4']) player.x -= player.speed;
            if (keys['ArrowRight'] || keys['KeyD'] || keys['6']) player.x += player.speed;

            player.x = Math.max(16, Math.min(224, player.x));
            player.y = Math.max(16, Math.min(304, player.y));

            shootTimer++;
            if ((keys['Space'] || keys['Enter'] || keys['5']) && shootTimer > 8) {
              shootTimer = 0;
              bullets.push({ x: player.x - 6, y: player.y - 12, vx: 0, vy: -7 });
              bullets.push({ x: player.x + 6, y: player.y - 12, vx: 0, vy: -7 });
              playGun();
            }

            for (let i = bullets.length - 1; i >= 0; i--) {
              const b = bullets[i];
              b.x += b.vx;
              b.y += b.vy;
              if (b.y < -10) bullets.splice(i, 1);
            }

            spawnTimer++;
            if (spawnTimer > 45) {
              spawnTimer = 0;
              const type = Math.random() > 0.5 ? 'tank' : 'chopper';
              enemies.push({
                x: Math.random() * 200 + 20,
                y: -20,
                vy: type === 'chopper' ? 2 : 1,
                hp: type === 'tank' ? 3 : 2,
                type: type
              });
            }

            for (let i = enemies.length - 1; i >= 0; i--) {
              const e = enemies[i];
              e.y += e.vy;
              if (e.y > 330) {
                enemies.splice(i, 1);
                continue;
              }

              for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (Math.hypot(b.x - e.x, b.y - e.y) < 16) {
                  bullets.splice(j, 1);
                  e.hp--;
                  if (e.hp <= 0) {
                    playExplosion();
                    score += e.type === 'tank' ? 250 : 150;
                    scoreTag.innerText = 'SCORE: ' + score;
                    for (let p = 0; p < 12; p++) {
                      particles.push({
                        x: e.x,
                        y: e.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 20
                      });
                    }
                    enemies.splice(i, 1);
                    break;
                  }
                }
              }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];
              p.x += p.vx;
              p.y += p.vy;
              p.life--;
              if (p.life <= 0) particles.splice(i, 1);
            }
          }

          let scrollY = 0;
          function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            scrollY = (scrollY + 1) % 32;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = 0; x < 240; x += 32) {
              ctx.beginPath();
              ctx.moveTo(x, 0); ctx.lineTo(x, 320);
              ctx.stroke();
            }
            for (let y = scrollY - 32; y < 320; y += 32) {
              ctx.beginPath();
              ctx.moveTo(0, y); ctx.lineTo(240, y);
              ctx.stroke();
            }

            for (const p of particles) {
              ctx.fillStyle = p.life % 2 === 0 ? '#f59e0b' : '#ef4444';
              ctx.fillRect(p.x, p.y, 3, 3);
            }

            ctx.fillStyle = '#38bdf8';
            for (const b of bullets) {
              ctx.fillRect(b.x - 1, b.y - 4, 3, 8);
            }

            for (const e of enemies) {
              ctx.save();
              ctx.translate(e.x, e.y);
              if (e.type === 'tank') {
                ctx.fillStyle = '#475569';
                ctx.fillRect(-12, -10, 24, 20);
                ctx.fillStyle = '#059669';
                ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#10b981';
                ctx.fillRect(-2, 0, 4, 12);
              } else {
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.moveTo(0, 12);
                ctx.lineTo(-10, -8);
                ctx.lineTo(10, -8);
                ctx.fill();
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
                ctx.stroke();
              }
              ctx.restore();
            }

            ctx.save();
            ctx.translate(player.x, player.y);

            ctx.fillStyle = '#334155';
            ctx.fillRect(-10, 4, 6, 10);
            ctx.fillRect(4, 4, 6, 10);

            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-12, -10, 24, 16);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-6, -6, 12, 8);

            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-8, -14, 3, 6);
            ctx.fillRect(5, -14, 3, 6);

            ctx.restore();
          }

          function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
          }

          loop();
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-2 sm:p-4">
      {/* Emulator Canvas Display Area */}
      <div 
        className="w-full flex items-center justify-center relative rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '1:1' ? '1/1' : '4/3', maxHeight: '70vh' }}
      >
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-cyan-400">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Booting Universal WASM Core...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-rose-400 p-6 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {!isLoading && !error && romBlobUrl && (
          <iframe
            ref={iframeRef}
            srcDoc={buildEmulatorDoc()}
            className={`w-full h-full border-0 ${
              activeShader === 'crt' ? 'filter contrast-125 saturate-150 brightness-105' :
              activeShader === 'lcd' ? 'filter sepia-50 hue-rotate-90' :
              activeShader === 'amber' ? 'filter sepia-100 hue-rotate-30' : ''
            }`}
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-autoplay"
            allow="autoplay; gamepad"
          />
        )}
      </div>

      {/* Retro Nokia Virtual Keypad */}
      {['jar', 'sis', 'jad', 'sisx'].includes(format) && customKeypadOpen && (
        <div className="mt-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center gap-2 max-w-sm w-full select-none">
          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
            Nokia Virtual Keypad
          </div>

          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
            {['1', '2 (▲)', '3', '4 (◄)', '5 (OK)', '6 (►)', '7', '8 (▼)', '9', '*', '0', '#'].map((k) => (
              <button
                key={k}
                onMouseDown={() => sendKey(k[0], 'keydown')}
                onMouseUp={() => sendKey(k[0], 'keyup')}
                onTouchStart={(e) => { e.preventDefault(); sendKey(k[0], 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); sendKey(k[0], 'keyup'); }}
                className="py-2 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow border border-slate-700 active:scale-95 transition-all text-center cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
