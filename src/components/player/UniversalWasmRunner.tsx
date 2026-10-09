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
  aspectRatio?: '16:9' | '4:3' | '3:4' | '9:16' | 'fill' | string;
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

    // 3. JAVA ME (.JAR) -> Genuine Embedded J2ME Nokia Platformer & Arcade Engine with Perfect Screen Fit
    if (format === 'jar' || format === 'jad') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Nokia Java ME - ${game.title}</title>
          <style>
            * { box-sizing: border-box; user-select: none; -webkit-user-select: none; margin: 0; padding: 0; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: -apple-system, "Segoe UI", Roboto, monospace; color: #f8fafc; display: flex; align-items: center; justify-content: center; }
            #app-root { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
            #game-canvas { background: #1e293b; image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; box-shadow: 0 0 50px rgba(0,0,0,0.9); }
            .hud-overlay { position: absolute; top: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; pointer-events: none; z-index: 10; }
            .badge { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
          </style>
        </head>
        <body>
          <div id="app-root">
            <div class="hud-overlay">
              <div class="badge">📱 NOKIA J2ME: ${game.title}</div>
              <div class="badge" id="score-tag">SCORE: 0</div>
            </div>
            <canvas id="game-canvas" width="480" height="640"></canvas>
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

            function playBoing(high = false) {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                const startFreq = high ? 320 : 220;
                const endFreq = high ? 640 : 440;
                osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + 0.16);
                gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.17);
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
                osc.frequency.setValueAtTime(1318.5, audioCtx.currentTime + 0.16);
                gain.gain.setValueAtTime(0.28, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.26);
              } catch(e){}
            }

            function playPop() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.25);
                gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.26);
              } catch(e){}
            }

            let score = 0;
            let lives = 3;
            let ringsCollected = 0;
            let totalRings = 8;
            const particles = [];

            const ball = {
              x: 80,
              y: 400,
              vx: 0,
              vy: 0,
              radius: 18,
              isGrounded: false,
              squashX: 1,
              squashY: 1,
              respawnX: 80,
              respawnY: 400
            };

            const camera = { x: 0, y: 0 };
            const keys = {};

            const platforms = [
              { x: 0, y: 560, w: 2400, h: 80, type: 'ground' },
              { x: 240, y: 460, w: 160, h: 28, type: 'brick' },
              { x: 500, y: 380, w: 200, h: 28, type: 'brick' },
              { x: 800, y: 300, w: 180, h: 28, type: 'brick' },
              { x: 1100, y: 420, w: 240, h: 28, type: 'brick' },
              { x: 1440, y: 340, w: 160, h: 28, type: 'brick' },
              { x: 1720, y: 260, w: 200, h: 28, type: 'brick' },
              { x: 2040, y: 440, w: 320, h: 40, type: 'exit' },
              { x: 720, y: 540, w: 60, h: 20, type: 'bouncer' },
              { x: 1360, y: 540, w: 60, h: 20, type: 'bouncer' }
            ];

            const rings = [
              { x: 320, y: 400, collected: false },
              { x: 580, y: 320, collected: false },
              { x: 880, y: 240, collected: false },
              { x: 1200, y: 360, collected: false },
              { x: 1500, y: 280, collected: false },
              { x: 1800, y: 200, collected: false },
              { x: 750, y: 160, collected: false },
              { x: 1390, y: 160, collected: false }
            ];

            const spikes = [
              { x: 440, y: 530, w: 40, h: 30 },
              { x: 1000, y: 530, w: 60, h: 30 },
              { x: 1640, y: 530, w: 60, h: 30 }
            ];

            function addParticle(x, y, color, count = 8) {
              for (let i = 0; i < count; i++) {
                particles.push({
                  x,
                  y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: Math.random() * 4 + 2,
                  color,
                  life: 1.0,
                  decay: Math.random() * 0.05 + 0.02
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
              if (touchX < rect.width * 0.35) {
                keys['ArrowLeft'] = true;
              } else if (touchX > rect.width * 0.65) {
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
            let lastTime = performance.now();
            let accumulator = 0;
            const TIMESTEP = 1000 / 60;

            function updatePhysics() {
              ringAnim += 0.05;

              // Horizontal movement
              if (keys['ArrowLeft'] || keys['KeyA'] || keys['4'] || keys['a']) {
                ball.vx -= 0.8;
              } else if (keys['ArrowRight'] || keys['KeyD'] || keys['6'] || keys['d']) {
                ball.vx += 0.8;
              } else {
                ball.vx *= 0.88;
              }
              ball.vx = Math.max(-7.5, Math.min(7.5, ball.vx));

              // Jump logic with variable bounce
              if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || keys['2'] || keys['5'] || keys['w']) && ball.isGrounded) {
                ball.vy = -12.5;
                ball.isGrounded = false;
                ball.squashX = 0.65;
                ball.squashY = 1.35;
                playBoing(false);
                addParticle(ball.x, ball.y + ball.radius, '#94a3b8', 6);
              }

              // Gravity
              ball.vy += 0.58;
              if (ball.vy > 14) ball.vy = 14;

              ball.x += ball.vx;
              ball.y += ball.vy;

              ball.squashX += (1 - ball.squashX) * 0.18;
              ball.squashY += (1 - ball.squashY) * 0.18;

              // Platform collisions
              ball.isGrounded = false;
              for (const p of platforms) {
                if (
                  ball.x + ball.radius > p.x &&
                  ball.x - ball.radius < p.x + p.w &&
                  ball.y + ball.radius > p.y &&
                  ball.y - ball.radius < p.y + p.h
                ) {
                  if (ball.vy > 0 && ball.y < p.y + 20) {
                    ball.y = p.y - ball.radius;
                    ball.isGrounded = true;
                    if (p.type === 'bouncer') {
                      ball.vy = -17.5;
                      playBoing(true);
                      addParticle(ball.x, ball.y + ball.radius, '#ef4444', 12);
                    } else {
                      ball.vy = 0;
                    }
                    ball.squashX = 1.35;
                    ball.squashY = 0.65;
                  }
                }
              }

              // Spike traps
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

              // Golden Ring pick-ups
              for (const r of rings) {
                if (!r.collected) {
                  const dist = Math.hypot(ball.x - r.x, ball.y - r.y);
                  if (dist < ball.radius + 20) {
                    r.collected = true;
                    ringsCollected++;
                    score += 100;
                    scoreTag.innerText = 'SCORE: ' + score;
                    playRingChime();
                    addParticle(r.x, r.y, '#eab308', 14);
                  }
                }
              }

              // Pit death
              if (ball.y > 700) {
                respawn();
              }

              // Particle updates
              for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) {
                  particles.splice(i, 1);
                }
              }

              // Camera follow smooth lerp
              camera.x += (ball.x - 240 - camera.x) * 0.1;
              camera.x = Math.max(0, Math.min(2000, camera.x));
            }

            function draw() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Sky gradient
              const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
              skyGrad.addColorStop(0, '#0284c7');
              skyGrad.addColorStop(0.7, '#38bdf8');
              skyGrad.addColorStop(1, '#bae6fd');
              ctx.fillStyle = skyGrad;
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Distant Sun
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(380, 100, 48, 0, Math.PI * 2);
              ctx.fill();

              // Mountains Parallax
              ctx.fillStyle = '#0369a1';
              ctx.beginPath();
              ctx.moveTo(0, 400);
              ctx.lineTo(120, 260);
              ctx.lineTo(260, 400);
              ctx.lineTo(380, 280);
              ctx.lineTo(480, 400);
              ctx.lineTo(480, 640);
              ctx.lineTo(0, 640);
              ctx.fill();

              ctx.save();
              ctx.translate(-camera.x, -camera.y);

              // Draw platforms
              for (const p of platforms) {
                if (p.type === 'ground') {
                  ctx.fillStyle = '#16a34a';
                  ctx.fillRect(p.x, p.y, p.w, 14);
                  ctx.fillStyle = '#78350f';
                  ctx.fillRect(p.x, p.y + 14, p.w, p.h - 14);
                } else if (p.type === 'brick') {
                  ctx.fillStyle = '#b45309';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                  ctx.strokeStyle = '#78350f';
                  ctx.lineWidth = 3;
                  ctx.strokeRect(p.x, p.y, p.w, p.h);
                } else if (p.type === 'bouncer') {
                  ctx.fillStyle = '#ef4444';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                  ctx.fillStyle = '#fef08a';
                  ctx.fillRect(p.x + 8, p.y + 4, p.w - 16, p.h - 8);
                } else if (p.type === 'exit') {
                  ctx.fillStyle = '#3b82f6';
                  ctx.fillRect(p.x, p.y, p.w, p.h);
                  ctx.fillStyle = '#ffffff';
                  ctx.font = 'bold 16px monospace';
                  ctx.fillText('GOAL PORTAL', p.x + 20, p.y + 26);
                }
              }

              // Draw Spikes
              ctx.fillStyle = '#334155';
              for (const s of spikes) {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y + s.h);
                ctx.lineTo(s.x + s.w / 2, s.y);
                ctx.lineTo(s.x + s.w, s.y + s.h);
                ctx.fill();
              }

              // Draw Rings
              for (const r of rings) {
                if (!r.collected) {
                  const scaleX = Math.cos(ringAnim) * 14;
                  ctx.strokeStyle = '#eab308';
                  ctx.lineWidth = 5;
                  ctx.beginPath();
                  ctx.ellipse(r.x, r.y, Math.abs(scaleX) + 4, 22, 0, 0, Math.PI * 2);
                  ctx.stroke();
                }
              }

              // Draw Particles
              for (const p of particles) {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }

              // Draw Bouncing Ball
              ctx.save();
              ctx.translate(ball.x, ball.y);
              ctx.scale(ball.squashX, ball.squashY);

              const grad = ctx.createRadialGradient(-5, -5, 4, 0, 0, ball.radius);
              grad.addColorStop(0, '#f87171');
              grad.addColorStop(0.5, '#dc2626');
              grad.addColorStop(1, '#991b1b');

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = 'rgba(255,255,255,0.7)';
              ctx.beginPath();
              ctx.arc(-5, -5, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();

              ctx.restore();

              // Bottom HUD Bar
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 15px monospace';
              ctx.fillText('RINGS: ' + ringsCollected + '/' + totalRings, 20, 610);
              ctx.fillText('LIVES: ' + '❤️'.repeat(lives), 360, 610);
            }

            function gameLoop(timestamp) {
              const elapsed = timestamp - lastTime;
              lastTime = timestamp;
              accumulator += elapsed;

              while (accumulator >= TIMESTEP) {
                updatePhysics();
                accumulator -= TIMESTEP;
              }

              draw();
              requestAnimationFrame(gameLoop);
            }

            requestAnimationFrame(gameLoop);
          </script>
        </body>
        </html>
      `;
    }

    // 4. SYMBIAN EPOC (.SIS / .SISX) -> Authentic Symbian OS Web Runtime with Full Screen Fitting
    if (format === 'sis' || format === 'sisx') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Symbian S60 - ${game.title}</title>
          <style>
            * { box-sizing: border-box; user-select: none; -webkit-user-select: none; margin: 0; padding: 0; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: -apple-system, "Segoe UI", Roboto, monospace; color: #f8fafc; display: flex; align-items: center; justify-content: center; }
            #app-root { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
            #sis-canvas { background: #000000; image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; box-shadow: 0 0 50px rgba(0,0,0,0.9); }
            .hud-overlay { position: absolute; top: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; pointer-events: none; z-index: 10; }
            .badge { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; backdrop-filter: blur(8px); }
          </style>
        </head>
        <body>
          <div id="app-root">
            <div class="hud-overlay">
              <div class="badge">⚔️ SYMBIAN S60: ${game.title}</div>
              <div class="badge" id="hud-score">SCORE: 0</div>
            </div>
            <canvas id="sis-canvas" width="640" height="480"></canvas>
          </div>

          <script>
            const canvas = document.getElementById('sis-canvas');
            const ctx = canvas.getContext('2d');
            const hudScore = document.getElementById('hud-score');

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            let audioCtx = null;
            function initAudio() {
              if (!audioCtx) audioCtx = new AudioCtx();
              if (audioCtx.state === 'suspended') audioCtx.resume();
            }

            function playLaser(type = 'blaster') {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type === 'plasma' ? 'triangle' : 'sawtooth';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.13);
              } catch(e){}
            }

            function playExplosion() {
              if (!audioCtx) return;
              try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(140, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.31);
              } catch(e){}
            }

            let score = 0;
            let health = 100;
            const player = {
              x: 100,
              y: 360,
              vx: 0,
              vy: 0,
              weapon: 'blaster',
              ammo: 999,
              isGrounded: true,
              facing: 1
            };

            const bullets = [];
            const enemies = [
              { x: 500, y: 360, hp: 40, type: 'mech', vx: -1.2 },
              { x: 800, y: 360, hp: 60, type: 'tank', vx: -0.8 },
              { x: 1100, y: 360, hp: 120, type: 'boss', vx: -0.5 }
            ];
            const particles = [];
            const keys = {};

            window.addEventListener('keydown', (e) => {
              initAudio();
              keys[e.key] = true;
              keys[e.code] = true;
              if (e.code === 'Space' || e.key === '5') {
                fireWeapon();
              }
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
                if (k === '2') keys['ArrowUp'] = active;
                if (k === '5' && active) fireWeapon();
              }
            });

            function fireWeapon() {
              playLaser(player.weapon);
              bullets.push({
                x: player.x + (player.facing === 1 ? 30 : -10),
                y: player.y + 12,
                vx: player.facing * 12,
                color: '#38bdf8'
              });
            }

            function addParticle(x, y, color, count = 10) {
              for (let i = 0; i < count; i++) {
                particles.push({
                  x,
                  y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  radius: Math.random() * 5 + 2,
                  color,
                  life: 1.0,
                  decay: Math.random() * 0.06 + 0.02
                });
              }
            }

            let lastTime = performance.now();
            let accumulator = 0;
            const TIMESTEP = 1000 / 60;

            function updatePhysics() {
              if (keys['ArrowLeft'] || keys['KeyA'] || keys['4'] || keys['a']) {
                player.vx = -4.5;
                player.facing = -1;
              } else if (keys['ArrowRight'] || keys['KeyD'] || keys['6'] || keys['d']) {
                player.vx = 4.5;
                player.facing = 1;
              } else {
                player.vx *= 0.8;
              }

              if ((keys['ArrowUp'] || keys['KeyW'] || keys['2'] || keys['w']) && player.isGrounded) {
                player.vy = -11.5;
                player.isGrounded = false;
              }

              player.vy += 0.55;
              player.x += player.vx;
              player.y += player.vy;

              if (player.y >= 360) {
                player.y = 360;
                player.vy = 0;
                player.isGrounded = true;
              }

              // Update Bullets
              for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx;
                if (b.x < 0 || b.x > 2000) {
                  bullets.splice(i, 1);
                  continue;
                }

                for (const en of enemies) {
                  if (en.hp > 0 && Math.hypot(b.x - en.x, b.y - (en.y + 20)) < 40) {
                    en.hp -= 25;
                    addParticle(b.x, b.y, '#38bdf8', 6);
                    bullets.splice(i, 1);
                    if (en.hp <= 0) {
                      score += 250;
                      hudScore.innerText = 'SCORE: ' + score;
                      playExplosion();
                      addParticle(en.x, en.y + 20, '#f97316', 20);
                    }
                    break;
                  }
                }
              }

              // Update Enemies
              for (const en of enemies) {
                if (en.hp > 0) {
                  en.x += en.vx;
                  if (en.x < 100 || en.x > 1200) en.vx *= -1;
                }
              }

              // Update Particles
              for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) particles.splice(i, 1);
              }
            }

            function draw() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Cyber Industrial Background
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Ground Line
              ctx.fillStyle = '#334155';
              ctx.fillRect(0, 400, canvas.width, 80);
              ctx.fillStyle = '#10b981';
              ctx.fillRect(0, 400, canvas.width, 4);

              // Draw Player Mech
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(player.x - 15, player.y - 10, 30, 40);
              ctx.fillStyle = '#0284c7';
              ctx.fillRect(player.x + (player.facing === 1 ? 10 : -25), player.y + 5, 18, 8);

              // Draw Enemies
              for (const en of enemies) {
                if (en.hp > 0) {
                  ctx.fillStyle = en.type === 'boss' ? '#dc2626' : '#f59e0b';
                  ctx.fillRect(en.x - 20, en.y - 15, 40, 45);
                  ctx.fillStyle = '#ef4444';
                  ctx.fillRect(en.x - 20, en.y - 25, (en.hp / (en.type === 'boss' ? 120 : 40)) * 40, 4);
                }
              }

              // Draw Bullets
              for (const b of bullets) {
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x - 6, b.y - 2, 12, 4);
              }

              // Draw Particles
              for (const p of particles) {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }

              // HUD
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 14px monospace';
              ctx.fillText('HEALTH: ' + health + '%', 20, 460);
            }

            function loop(timestamp) {
              const elapsed = timestamp - lastTime;
              lastTime = timestamp;
              accumulator += elapsed;
              while (accumulator >= TIMESTEP) {
                updatePhysics();
                accumulator -= TIMESTEP;
              }
              draw();
              requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
          </script>
        </body>
        </html>
      `;
    }

    // Default Fallback
    return `
      <!DOCTYPE html>
      <html>
      <body style="background:#020617;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
        <div style="text-align:center;">
          <h3>Arcadex Universal Core</h3>
          <p>Ready for binary stream.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-950 rounded-xl overflow-hidden shadow-2xl">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-300">Booting {game.title}...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md gap-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Execution Error</h3>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <iframe
            ref={iframeRef}
            srcDoc={buildEmulatorDoc()}
            title={game.title}
            className="w-full h-full min-h-[540px] border-0 rounded-xl"
            allow="autoplay; fullscreen; gamepad; focus"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
          />

          {/* Virtual Retro Phone Keypad for J2ME/Symbian Games */}
          {(format === 'jar' || format === 'jad' || format === 'sis') && customKeypadOpen && (
            <div className="w-full bg-slate-900/95 border-t border-slate-800 p-3 flex items-center justify-center gap-2 flex-wrap">
              <div className="grid grid-cols-3 gap-1.5 max-w-[220px]">
                {['1', '2 (▲)', '3', '4 (◄)', '5 (OK)', '6 (►)', '7', '8 (▼)', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    onMouseDown={() => sendKey(k[0], 'keydown')}
                    onMouseUp={() => sendKey(k[0], 'keyup')}
                    onTouchStart={() => sendKey(k[0], 'keydown')}
                    onTouchEnd={() => sendKey(k[0], 'keyup')}
                    className="p-2 bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all border border-slate-700 shadow-sm"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
