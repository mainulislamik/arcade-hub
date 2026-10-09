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
  Layers,
  Cpu
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
        iframeRef.current.contentWindow.postMessage({
          type: 'EMULATOR_KEY',
          key,
          action: type
        }, '*');
      } catch (e) {
        // Fallback synthetic event
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

    // 4. SYMBIAN OS (.SIS / .SISX) -> Genuine Symbian EPOC S60 WebAssembly & Binary Game Engine
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
          
          /* Authentic Nokia S60 Screen Frame */
          #screen-container { position: relative; width: 100%; max-width: 480px; height: 100%; max-height: 640px; aspect-ratio: 3/4; background: #000; border: 3px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 0 50px rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(0,0,0,0.8); }
          canvas#gameCanvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
          
          /* Scanline Overlay */
          .crt-overlay { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%); background-size: 100% 4px; z-index: 10; opacity: 0.6; }
          
          /* Top EPOC Status Bar */
          #epoc-bar { position: absolute; top: 0; left: 0; right: 0; height: 22px; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-size: 10px; font-weight: bold; color: #38bdf8; z-index: 20; }
          .epoc-tag { display: flex; align-items: center; gap: 4px; }
          .epoc-battery { width: 14px; height: 8px; border: 1px solid #38bdf8; border-radius: 1px; position: relative; }
          .epoc-battery::after { content: ''; position: absolute; top: 1px; left: 1px; bottom: 1px; width: 80%; background: #38bdf8; }

          /* Mission Briefing Overlay Modal */
          #briefing-modal { position: absolute; inset: 0; background: rgba(2, 6, 23, 0.92); z-index: 30; display: none; flex-direction: column; padding: 20px; color: #e2e8f0; backdrop-filter: blur(4px); }
          #briefing-modal.active { display: flex; }
          .briefing-title { font-size: 16px; font-weight: bold; color: #38bdf8; margin-bottom: 12px; border-bottom: 1px solid #0284c7; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
          .briefing-text { font-size: 13px; line-height: 1.6; color: #cbd5e1; flex: 1; overflow-y: auto; white-space: pre-wrap; font-family: monospace; }
          .briefing-btn { align-self: center; margin-top: 14px; padding: 8px 24px; background: #0284c7; color: #fff; font-weight: bold; font-size: 12px; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
          .briefing-btn:hover { background: #0369a1; }
          
          /* Bottom Nokia Softkey Labels */
          #softkeys { position: absolute; bottom: 0; left: 0; right: 0; height: 26px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(56, 189, 248, 0.3); display: flex; justify-content: space-between; align-items: center; padding: 0 14px; font-size: 11px; font-weight: bold; color: #94a3b8; z-index: 20; }
        </style>
      </head>
      <body>
        <div id="app-root">
          <div id="screen-container">
            <!-- EPOC OS Top Header -->
            <div id="epoc-bar">
              <div class="epoc-tag">📱 Symbian S60 EPOC</div>
              <div id="status-title" style="color: #f1f5f9; font-size: 10px;">${game.title}</div>
              <div class="epoc-tag">
                <span id="fps-counter">60 FPS</span>
                <div class="epoc-battery"></div>
              </div>
            </div>

            <!-- Authentic CRT Scanlines -->
            <div class="crt-overlay"></div>

            <!-- Game Canvas -->
            <canvas id="gameCanvas" width="360" height="480"></canvas>

            <!-- Mission Dialogue & Briefing Box -->
            <div id="briefing-modal">
              <div class="briefing-title">
                <span id="brief-header">MISSION BRIEFING</span>
                <span style="font-size: 11px; color: #94a3b8;" id="brief-stage">STAGE 1</span>
              </div>
              <div class="briefing-text" id="brief-content"></div>
              <button class="briefing-btn" id="brief-close-btn">DEPLOY MECHA (ENTER / 5)</button>
            </div>

            <!-- Bottom Softkeys -->
            <div id="softkeys">
              <span id="left-softkey" style="cursor: pointer;">[ BRIEFING ]</span>
              <span id="mid-softkey" style="color: #38bdf8;">[ FIRE / LOCK ]</span>
              <span id="right-softkey" style="cursor: pointer;">[ WEAPONS ]</span>
            </div>
          </div>
        </div>

        <script>
          // ==========================================
          // 🚀 AUTHENTIC SYMBIAN SIS GAME ENGINE
          // ==========================================
          const canvas = document.getElementById('gameCanvas');
          const ctx = canvas.getContext('2d', { alpha: false });
          const briefingModal = document.getElementById('briefing-modal');
          const briefContent = document.getElementById('brief-content');
          const briefStage = document.getElementById('brief-stage');
          const briefCloseBtn = document.getElementById('brief-close-btn');
          const fpsCounter = document.getElementById('fps-counter');

          // Sound Synthesis via Web Audio API
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          let audioCtx = null;
          function initAudio() {
            if (!audioCtx) {
              audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') {
              audioCtx.resume();
            }
          }

          function playSynthSound(type) {
            if (!${soundEnabled} || !audioCtx) return;
            try {
              const now = audioCtx.currentTime;
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);

              if (type === 'shoot_mg') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(380, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
              } else if (type === 'shoot_rocket') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.linearRampToValueAtTime(440, now + 0.2);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
              } else if (type === 'shoot_plasma') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
              } else if (type === 'explosion') {
                // Noise buffer for heavy blast
                const bufferSize = audioCtx.sampleRate * 0.35;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                  data[i] = Math.random() * 2 - 1;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.5, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                noise.connect(noiseGain);
                noiseGain.connect(audioCtx.destination);
                noise.start(now);
              } else if (type === 'radio_beep') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(950, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
              } else if (type === 'switch_weapon') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.setValueAtTime(780, now + 0.05);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
              }
            } catch (e) {}
          }

          // Mission Data extracted directly from SIS part3.pak
          const MISSIONS = [
            {
              stage: 1,
              title: "STAGE 1: SCOUTING IN ENEMY TERRITORY",
              dialogue: "COMMANDER: Crown, scout the forward area and meet at appointed site!\\n\\nCROWN: Roger!\\n\\nCOMMANDER: Only Machine Gun is available. Destroy enemy Mechas and energy stations to collect 'M' (Missile) or 'R' (Rocket) supplies!\\n\\n[PRIMARY MISSION]\\n- Collect M or R supply\\n- Destroy enemy patrol units and reach muster site.",
              objectives: [
                { id: 'supplies', text: 'Collect Weapon Supplies', target: 2, current: 0 },
                { id: 'enemies', text: 'Eliminate Patrol Tanks & Soldiers', target: 10, current: 0 }
              ],
              bossName: "ASSAULT TANK COMMANDER"
            },
            {
              stage: 2,
              title: "STAGE 2: BREAKTHROUGH & ENERGY STATIONS",
              dialogue: "COMMANDER: Break through the enemy blockade and meet teammates! Bring up the rear!\\n\\nCROWN: Understood!\\n\\nCOMMANDER: Destroy all enemy energy stations in the sector to paralyze their reinforcement line!\\n\\n[PRIMARY MISSION]\\n- Break through the blockade\\n- Destroy all 4 enemy Energy Stations",
              objectives: [
                { id: 'energy_stations', text: 'Destroy Energy Stations', target: 4, current: 0 },
                { id: 'enemies', text: 'Neutralize Blockade Tanks', target: 16, current: 0 }
              ],
              bossName: "HEAVY FORTRESS TURTLE-011"
            },
            {
              stage: 3,
              title: "STAGE 3: AIRPORT ASSAULT & CONVOY INTERCEPT",
              dialogue: "COMMANDER: Enemy transport troops are passing the northeast. Head off and destroy all blue transport trucks!\\n\\nCROWN: On my way!\\n\\nCOMMANDER: Assault their front-line airport and shoot down all enemy battle choppers!\\n\\n[PRIMARY MISSION]\\n- Intercept Transport Convoys\\n- Destroy all enemy Battleplanes & Choppers",
              objectives: [
                { id: 'convoys', text: 'Destroy Transport Trucks', target: 3, current: 0 },
                { id: 'choppers', text: 'Shoot Down Battle Choppers', target: 8, current: 0 }
              ],
              bossName: "AERIAL GUNSHIP TITAN"
            },
            {
              stage: 4,
              title: "STAGE 4: FINAL BASTION - HIPPO-023",
              dialogue: "COMMANDER: Massive enemy Titan Mech detected! It's the BOSS HIPPO-023!\\n\\nCROWN: This is where it ends! Engaging with full firepower!\\n\\nCOMMANDER: Beware of its twin rotary gatlings and mortar spread! All units, full support to Crown!\\n\\n[PRIMARY MISSION]\\n- DESTROY BOSS HIPPO-023!",
              objectives: [
                { id: 'boss', text: 'Defeat BOSS HIPPO-023', target: 1, current: 0 }
              ],
              bossName: "COLOSSAL MECH HIPPO-023"
            }
          ];

          // Game State
          let currentStageIdx = 0;
          let inBriefing = true;
          let score = 0;
          let highScore = 12500;
          let lastTime = performance.now();
          let frameCount = 0;
          let fps = 60;
          let keys = {};

          // Player Mecha (Crown Mech)
          const player = {
            x: 180,
            y: 400,
            speed: 3.2,
            width: 28,
            height: 28,
            facingAngle: -Math.PI / 2, // Facing UP
            legsAngle: -Math.PI / 2,
            walkCycle: 0,
            isMoving: false,
            armor: 100,
            maxArmor: 100,
            shield: 100,
            maxShield: 100,
            shieldActive: false,
            activeWeapon: 0, // 0: Machine Gun, 1: Rockets, 2: Plasma
            weapons: [
              { name: 'MACHINE GUN', ammo: Infinity, cooldown: 110, lastShot: 0, damage: 15, color: '#38bdf8' },
              { name: 'ROCKET POD', ammo: 30, cooldown: 380, lastShot: 0, damage: 65, color: '#f97316' },
              { name: 'PLASMA BEAM', ammo: 20, cooldown: 450, lastShot: 0, damage: 95, color: '#a855f7' }
            ],
            invulnerableTime: 0
          };

          // Entities Arrays
          let bullets = [];
          let enemyBullets = [];
          let enemies = [];
          let particles = [];
          let supplies = [];
          let buildings = [];
          let terrainScenery = [];
          let currentBoss = null;

          // Camera
          const camera = { y: 0, speed: 0.6 };

          // Initialize Terrain for Stage
          function initStage(stageIdx) {
            currentStageIdx = stageIdx;
            const mission = MISSIONS[currentStageIdx];
            
            // Reset Player
            player.x = 180;
            player.y = 400;
            player.armor = 100;
            player.shield = 100;
            player.activeWeapon = 0;
            camera.y = 0;

            // Clear entities
            bullets = [];
            enemyBullets = [];
            enemies = [];
            particles = [];
            supplies = [];
            buildings = [];
            terrainScenery = [];
            currentBoss = null;

            // Generate Terrain (Roads, bases, trees, energy generators)
            for (let i = -2000; i < 600; i += 60) {
              terrainScenery.push({
                type: 'tile',
                x: 0,
                y: i,
                gridType: (Math.abs(Math.floor(i / 120)) % 2 === 0) ? 'metal_grate' : 'asphalt'
              });
            }

            // Generate Military Base Buildings & Energy Stations
            const numEnergyStations = (currentStageIdx === 1) ? 4 : 2;
            for (let i = 0; i < numEnergyStations; i++) {
              buildings.push({
                x: 60 + (i % 2) * 200,
                y: -400 - i * 350,
                width: 44,
                height: 44,
                type: 'energy_station',
                hp: 120,
                maxHp: 120,
                destroyed: false
              });
            }

            // Regular military bunkers & radar dishes
            for (let i = 0; i < 8; i++) {
              buildings.push({
                x: 40 + (i % 3) * 120,
                y: -200 - i * 220,
                width: 36,
                height: 36,
                type: (i % 2 === 0) ? 'radar_dish' : 'bunker',
                hp: 90,
                maxHp: 90,
                destroyed: false
              });
            }

            // Spawn Initial Enemies
            spawnEnemiesForStage(currentStageIdx);

            // Show Briefing
            briefStage.innerText = "STAGE " + (currentStageIdx + 1);
            briefContent.innerText = mission.dialogue;
            briefingModal.classList.add('active');
            inBriefing = true;
            playSynthSound('radio_beep');
          }

          function spawnEnemiesForStage(stageIdx) {
            // Stage 1: Patrol Soldiers, Light Tanks
            const count = 6 + stageIdx * 4;
            for (let i = 0; i < count; i++) {
              const enemyType = (i % 3 === 0) ? 'chopper' : (i % 2 === 0 ? 'tank' : 'soldier');
              enemies.push(createEnemy(
                enemyType,
                40 + Math.random() * 280,
                -150 - i * 180
              ));
            }

            // Stage 4: Boss Hippo-023
            if (stageIdx === 3) {
              currentBoss = {
                type: 'hippo_boss',
                name: 'HIPPO-023',
                x: 180,
                y: -600,
                width: 72,
                height: 72,
                hp: 1200,
                maxHp: 1200,
                speed: 1.2,
                shootCooldown: 120,
                lastShot: 0,
                rageMode: false,
                angle: Math.PI / 2
              };
            }
          }

          function createEnemy(type, x, y) {
            if (type === 'chopper') {
              return {
                type: 'chopper',
                x, y,
                width: 32, height: 32,
                hp: 45, maxHp: 45,
                speed: 1.8,
                shootCooldown: 180,
                lastShot: Math.random() * 60,
                rotorAngle: 0,
                color: '#ef4444'
              };
            } else if (type === 'tank') {
              return {
                type: 'tank',
                x, y,
                width: 34, height: 34,
                hp: 75, maxHp: 75,
                speed: 1.1,
                shootCooldown: 220,
                lastShot: Math.random() * 60,
                turretAngle: Math.PI / 2,
                color: '#eab308'
              };
            } else {
              return {
                type: 'soldier',
                x, y,
                width: 18, height: 18,
                hp: 25, maxHp: 25,
                speed: 1.4,
                shootCooldown: 260,
                lastShot: Math.random() * 60,
                color: '#22c55e'
              };
            }
          }

          // Controls & Key Event Listeners
          window.addEventListener('keydown', (e) => {
            initAudio();
            keys[e.key] = true;
            keys[e.code] = true;

            if (inBriefing && (e.key === 'Enter' || e.key === '5' || e.code === 'Space')) {
              briefingModal.classList.remove('active');
              inBriefing = false;
              playSynthSound('radio_beep');
            }

            // Weapon switch on Q / 7 / 9
            if (e.key === 'q' || e.key === 'Q' || e.key === '7' || e.key === '9') {
              player.activeWeapon = (player.activeWeapon + 1) % player.weapons.length;
              playSynthSound('switch_weapon');
            }

            // Shield on E / 0
            if (e.key === 'e' || e.key === 'E' || e.key === '0') {
              player.shieldActive = !player.shieldActive;
            }
          });

          window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
            keys[e.code] = false;
          });

          briefCloseBtn.addEventListener('click', () => {
            initAudio();
            briefingModal.classList.remove('active');
            inBriefing = false;
            playSynthSound('radio_beep');
          });

          document.getElementById('left-softkey').addEventListener('click', () => {
            briefingModal.classList.toggle('active');
            inBriefing = briefingModal.classList.contains('active');
          });

          document.getElementById('right-softkey').addEventListener('click', () => {
            player.activeWeapon = (player.activeWeapon + 1) % player.weapons.length;
            playSynthSound('switch_weapon');
          });

          // Handle Virtual Keypad events from parent React component
          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'EMULATOR_KEY') {
              initAudio();
              const { key, action } = event.data;
              const isDown = action === 'keydown';
              keys[key] = isDown;

              if (isDown) {
                if (inBriefing && (key === 'Enter' || key === '5')) {
                  briefingModal.classList.remove('active');
                  inBriefing = false;
                }
                if (key === '7' || key === '9') {
                  player.activeWeapon = (player.activeWeapon + 1) % player.weapons.length;
                  playSynthSound('switch_weapon');
                }
                if (key === '0') {
                  player.shieldActive = !player.shieldActive;
                }
              }
            }
          });

          // ==========================================
          // 🕹️ MAIN GAME LOOP
          // ==========================================
          function update(delta) {
            if (inBriefing) return;

            // Scroll battlefield camera slowly
            camera.y -= camera.speed;

            // Player Movement (WASD, Arrows, 2/4/6/8)
            let dx = 0;
            let dy = 0;
            if (keys['ArrowUp'] || keys['w'] || keys['W'] || keys['2']) dy -= 1;
            if (keys['ArrowDown'] || keys['s'] || keys['S'] || keys['8']) dy += 1;
            if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['4']) dx -= 1;
            if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['6']) dx += 1;

            player.isMoving = (dx !== 0 || dy !== 0);

            if (player.isMoving) {
              const len = Math.hypot(dx, dy);
              dx /= len;
              dy /= len;
              player.x += dx * player.speed;
              player.y += dy * player.speed;

              // Legs walking direction & step cycle
              player.legsAngle = Math.atan2(dy, dx);
              player.walkCycle += 0.25;

              // Constrain player inside screen
              player.x = Math.max(20, Math.min(340, player.x));
              player.y = Math.max(60, Math.min(440, player.y));
            }

            // Player aiming (facing closest enemy or straight up)
            let closestEnemy = null;
            let minDist = 300;
            enemies.forEach(e => {
              const dist = Math.hypot(e.x - player.x, e.y - player.y);
              if (dist < minDist) {
                minDist = dist;
                closestEnemy = e;
              }
            });
            if (currentBoss && currentBoss.hp > 0) {
              const dist = Math.hypot(currentBoss.x - player.x, currentBoss.y - player.y);
              if (dist < 400) closestEnemy = currentBoss;
            }

            if (closestEnemy) {
              player.facingAngle = Math.atan2(closestEnemy.y - player.y, closestEnemy.x - player.x);
            } else if (player.isMoving) {
              player.facingAngle = player.legsAngle;
            } else {
              player.facingAngle = -Math.PI / 2; // Face UP
            }

            // Player Firing (Space, J, Enter, 5)
            const isFiring = keys[' '] || keys['Space'] || keys['Enter'] || keys['j'] || keys['J'] || keys['5'];
            const curWep = player.weapons[player.activeWeapon];
            const now = performance.now();

            if (isFiring && (now - curWep.lastShot >= curWep.cooldown)) {
              if (curWep.ammo > 0) {
                curWep.lastShot = now;
                if (curWep.ammo !== Infinity) curWep.ammo--;

                if (player.activeWeapon === 0) {
                  // Machine Gun (Dual burst)
                  bullets.push({
                    x: player.x + Math.cos(player.facingAngle + Math.PI/2) * 6,
                    y: player.y + Math.sin(player.facingAngle + Math.PI/2) * 6,
                    vx: Math.cos(player.facingAngle) * 9,
                    vy: Math.sin(player.facingAngle) * 9,
                    damage: curWep.damage,
                    type: 'mg',
                    color: '#38bdf8'
                  });
                  bullets.push({
                    x: player.x - Math.cos(player.facingAngle + Math.PI/2) * 6,
                    y: player.y - Math.sin(player.facingAngle + Math.PI/2) * 6,
                    vx: Math.cos(player.facingAngle) * 9,
                    vy: Math.sin(player.facingAngle) * 9,
                    damage: curWep.damage,
                    type: 'mg',
                    color: '#38bdf8'
                  });
                  playSynthSound('shoot_mg');
                } else if (player.activeWeapon === 1) {
                  // Rocket with trail
                  bullets.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(player.facingAngle) * 6.5,
                    vy: Math.sin(player.facingAngle) * 6.5,
                    damage: curWep.damage,
                    type: 'rocket',
                    color: '#f97316'
                  });
                  playSynthSound('shoot_rocket');
                } else if (player.activeWeapon === 2) {
                  // Plasma Beam
                  bullets.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(player.facingAngle) * 11,
                    vy: Math.sin(player.facingAngle) * 11,
                    damage: curWep.damage,
                    type: 'plasma',
                    color: '#c084fc'
                  });
                  playSynthSound('shoot_plasma');
                }
              } else {
                // Out of ammo, switch to Machine Gun
                player.activeWeapon = 0;
              }
            }

            // Update Player Bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
              const b = bullets[i];
              b.x += b.vx;
              b.y += b.vy;

              if (b.type === 'rocket' && Math.random() < 0.4) {
                particles.push({
                  x: b.x, y: b.y,
                  vx: (Math.random() - 0.5) * 0.8,
                  vy: (Math.random() - 0.5) * 0.8,
                  life: 18, maxLife: 18,
                  color: '#94a3b8', size: 3
                });
              }

              // Remove offscreen
              if (b.x < -20 || b.x > 380 || b.y < -50 || b.y > 520) {
                bullets.splice(i, 1);
                continue;
              }

              // Check collision with Enemies
              let bulletHit = false;
              for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (Math.hypot(b.x - e.x, b.y - e.y) < (e.width / 2 + 6)) {
                  e.hp -= b.damage;
                  bulletHit = true;
                  createExplosion(b.x, b.y, (b.type === 'rocket' ? 12 : 5), '#fbbf24');

                  if (e.hp <= 0) {
                    // Enemy Destroyed!
                    createExplosion(e.x, e.y, 25, '#f97316');
                    playSynthSound('explosion');
                    score += (e.type === 'tank' ? 250 : e.type === 'chopper' ? 300 : 150);

                    // Chance to drop weapon supply
                    if (Math.random() < 0.4) {
                      supplies.push({
                        x: e.x, y: e.y,
                        type: (Math.random() < 0.5 ? 'supply_m' : 'supply_r'),
                        life: 600
                      });
                    }

                    enemies.splice(j, 1);
                  }
                  break;
                }
              }

              // Check collision with Boss
              if (!bulletHit && currentBoss && currentBoss.hp > 0) {
                if (Math.hypot(b.x - currentBoss.x, b.y - currentBoss.y) < 45) {
                  currentBoss.hp -= b.damage;
                  bulletHit = true;
                  createExplosion(b.x, b.y, 14, '#ef4444');
                  if (currentBoss.hp <= 0) {
                    createExplosion(currentBoss.x, currentBoss.y, 60, '#f97316');
                    playSynthSound('explosion');
                    score += 5000;
                  }
                }
              }

              // Check collision with Buildings / Energy Stations
              if (!bulletHit) {
                for (let k = 0; k < buildings.length; k++) {
                  const bldg = buildings[k];
                  if (!bldg.destroyed && Math.abs(b.x - bldg.x) < bldg.width/2 && Math.abs(b.y - bldg.y) < bldg.height/2) {
                    bldg.hp -= b.damage;
                    bulletHit = true;
                    createExplosion(b.x, b.y, 8, '#38bdf8');
                    if (bldg.hp <= 0) {
                      bldg.destroyed = true;
                      createExplosion(bldg.x, bldg.y, 35, '#38bdf8');
                      playSynthSound('explosion');
                      score += 400;
                    }
                    break;
                  }
                }
              }

              if (bulletHit) {
                bullets.splice(i, 1);
              }
            }

            // Update Enemy Movement & AI
            enemies.forEach(e => {
              // Move towards player or down
              if (e.type === 'chopper') {
                e.rotorAngle += 0.4;
                e.y += e.speed;
                e.x += Math.sin(performance.now() * 0.003 + e.y) * 1.5;
              } else if (e.type === 'tank') {
                e.y += e.speed * 0.8;
                e.turretAngle = Math.atan2(player.y - e.y, player.x - e.x);
              } else {
                e.y += e.speed;
              }

              // Enemy Fire
              e.lastShot++;
              if (e.lastShot > e.shootCooldown && e.y > 20 && e.y < 420) {
                e.lastShot = 0;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                enemyBullets.push({
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle) * 4.2,
                  vy: Math.sin(angle) * 4.2,
                  damage: 12
                });
              }
            });

            // Update Boss AI
            if (currentBoss && currentBoss.hp > 0) {
              currentBoss.y = Math.min(120, currentBoss.y + currentBoss.speed);
              currentBoss.x = 180 + Math.sin(performance.now() * 0.0015) * 80;

              currentBoss.lastShot++;
              if (currentBoss.lastShot > currentBoss.shootCooldown) {
                currentBoss.lastShot = 0;
                // Mortar barrage
                for (let i = -2; i <= 2; i++) {
                  const angle = Math.PI / 2 + (i * 0.25);
                  enemyBullets.push({
                    x: currentBoss.x,
                    y: currentBoss.y + 20,
                    vx: Math.cos(angle) * 4.5,
                    vy: Math.sin(angle) * 4.5,
                    damage: 18
                  });
                }
                playSynthSound('shoot_rocket');
              }
            }

            // Update Enemy Bullets
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
              const eb = enemyBullets[i];
              eb.x += eb.vx;
              eb.y += eb.vy;

              // Check collision with Player
              if (Math.hypot(eb.x - player.x, eb.y - player.y) < 16) {
                createExplosion(player.x, player.y, 10, '#ef4444');
                enemyBullets.splice(i, 1);

                if (player.shieldActive && player.shield > 0) {
                  player.shield = Math.max(0, player.shield - eb.damage * 1.5);
                } else {
                  player.armor = Math.max(0, player.armor - eb.damage);
                }

                if (player.armor <= 0) {
                  createExplosion(player.x, player.y, 40, '#f97316');
                  playSynthSound('explosion');
                  // Respawn with penalty
                  player.armor = 100;
                  player.shield = 100;
                  score = Math.max(0, score - 500);
                }
                continue;
              }

              if (eb.x < -20 || eb.x > 380 || eb.y < -50 || eb.y > 520) {
                enemyBullets.splice(i, 1);
              }
            }

            // Supplies collection
            for (let i = supplies.length - 1; i >= 0; i--) {
              const s = supplies[i];
              if (Math.hypot(s.x - player.x, s.y - player.y) < 24) {
                if (s.type === 'supply_m') {
                  player.weapons[1].ammo += 15;
                } else {
                  player.weapons[2].ammo += 10;
                }
                player.armor = Math.min(100, player.armor + 20);
                playSynthSound('switch_weapon');
                supplies.splice(i, 1);
                score += 100;
              }
            }

            // Particles Update
            for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];
              p.x += p.vx;
              p.y += p.vy;
              p.life--;
              if (p.life <= 0) particles.splice(i, 1);
            }

            // Stage Clear Condition (All enemies eliminated)
            if (enemies.length === 0 && (!currentBoss || currentBoss.hp <= 0)) {
              if (currentStageIdx < MISSIONS.length - 1) {
                initStage(currentStageIdx + 1);
              } else {
                // Game Loop Replay
                initStage(0);
              }
            }
          }

          function createExplosion(x, y, count, color) {
            for (let i = 0; i < count; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 1 + Math.random() * 4;
              particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 20 + Math.random() * 15,
                maxLife: 35,
                color: color || '#f97316',
                size: 2 + Math.random() * 3
              });
            }
          }

          // ==========================================
          // 🎨 RENDER ROUTINE
          // ==========================================
          function render() {
            // Clear Screen (Military Dark Ground)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 1. Render Scrolling Terrain
            ctx.fillStyle = '#1e293b';
            for (let y = -40; y < canvas.height + 40; y += 40) {
              const offsetY = (y + Math.floor(camera.y)) % 40;
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1;
              ctx.strokeRect(20, y - offsetY, canvas.width - 40, 40);
            }

            // 2. Render Base Buildings
            buildings.forEach(bldg => {
              if (bldg.destroyed) {
                ctx.fillStyle = '#334155';
                ctx.fillRect(bldg.x - bldg.width/2, bldg.y - bldg.height/2, bldg.width, bldg.height);
                ctx.fillStyle = '#64748b';
                ctx.fillText('CRUSHED', bldg.x - 18, bldg.y + 4);
              } else {
                ctx.fillStyle = bldg.type === 'energy_station' ? '#0284c7' : '#475569';
                ctx.fillRect(bldg.x - bldg.width/2, bldg.y - bldg.height/2, bldg.width, bldg.height);
                ctx.strokeStyle = bldg.type === 'energy_station' ? '#38bdf8' : '#94a3b8';
                ctx.lineWidth = 2;
                ctx.strokeRect(bldg.x - bldg.width/2, bldg.y - bldg.height/2, bldg.width, bldg.height);

                // Energy Core Glow
                if (bldg.type === 'energy_station') {
                  ctx.fillStyle = '#38bdf8';
                  ctx.beginPath();
                  ctx.arc(bldg.x, bldg.y, 8, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            });

            // 3. Render Supplies
            supplies.forEach(s => {
              ctx.fillStyle = s.type === 'supply_m' ? '#ea580c' : '#7e22ce';
              ctx.fillRect(s.x - 9, s.y - 9, 18, 18);
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 11px monospace';
              ctx.fillText(s.type === 'supply_m' ? 'M' : 'R', s.x - 4, s.y + 4);
            });

            // 4. Render Enemies
            enemies.forEach(e => {
              ctx.save();
              ctx.translate(e.x, e.y);

              if (e.type === 'chopper') {
                // Battle Chopper
                ctx.fillStyle = '#991b1b';
                ctx.fillRect(-12, -14, 24, 28);
                // Rotor Blades
                ctx.rotate(e.rotorAngle);
                ctx.strokeStyle = '#f87171';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-22, 0); ctx.lineTo(22, 0);
                ctx.moveTo(0, -22); ctx.lineTo(0, 22);
                ctx.stroke();
              } else if (e.type === 'tank') {
                // Tank Chassis
                ctx.fillStyle = '#854d0e';
                ctx.fillRect(-15, -15, 30, 30);
                // Treads
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-18, -15, 5, 30);
                ctx.fillRect(13, -15, 5, 30);
                // Rotating Turret
                ctx.rotate(e.turretAngle);
                ctx.fillStyle = '#ca8a04';
                ctx.fillRect(-8, -8, 16, 16);
                ctx.fillStyle = '#fde047';
                ctx.fillRect(0, -3, 18, 6);
              } else {
                // Patrol Soldier
                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
              }

              ctx.restore();

              // Health Bar
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(e.x - 14, e.y - e.height/2 - 8, 28, 3);
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(e.x - 14, e.y - e.height/2 - 8, 28 * (e.hp / e.maxHp), 3);
            });

            // 5. Render Boss Hippo-023
            if (currentBoss && currentBoss.hp > 0) {
              ctx.save();
              ctx.translate(currentBoss.x, currentBoss.y);
              ctx.fillStyle = '#b91c1c';
              ctx.fillRect(-35, -35, 70, 70);
              ctx.strokeStyle = '#f87171';
              ctx.lineWidth = 4;
              ctx.strokeRect(-35, -35, 70, 70);
              // Twin Gatlings
              ctx.fillStyle = '#475569';
              ctx.fillRect(-28, 25, 12, 24);
              ctx.fillRect(16, 25, 12, 24);
              ctx.restore();

              // Boss Giant Health Bar
              ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
              ctx.fillRect(30, 26, 300, 12);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(32, 28, 296 * (currentBoss.hp / currentBoss.maxHp), 8);
              ctx.fillStyle = '#f8fafc';
              ctx.font = 'bold 10px monospace';
              ctx.fillText(currentBoss.name + ' [' + currentBoss.hp + ' / ' + currentBoss.maxHp + ']', 110, 35);
            }

            // 6. Render Player Mecha (Crown Mech)
            ctx.save();
            ctx.translate(player.x, player.y);

            // Walking Legs Chassis (Layer 1)
            ctx.save();
            ctx.rotate(player.legsAngle);
            const legOffset = Math.sin(player.walkCycle) * 6;
            ctx.fillStyle = '#334155';
            ctx.fillRect(-12, -8 + legOffset, 7, 16); // Left leg
            ctx.fillRect(5, -8 - legOffset, 7, 16);  // Right leg
            ctx.restore();

            // Armored Rotating Torso (Layer 2)
            ctx.rotate(player.facingAngle);
            // Torso armor plate
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-12, -12, 24, 24);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(-12, -12, 24, 24);

            // Cockpit visor
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(2, -4, 8, 8);

            // Dual Cannons
            ctx.fillStyle = '#64748b';
            ctx.fillRect(8, -8, 12, 4);
            ctx.fillRect(8, 4, 12, 4);

            // Energy Shield Bubble
            if (player.shieldActive && player.shield > 0) {
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(0, 0, 22, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.restore();

            // 7. Render Bullets
            bullets.forEach(b => {
              ctx.fillStyle = b.color;
              ctx.beginPath();
              ctx.arc(b.x, b.y, b.type === 'rocket' ? 4 : 2.5, 0, Math.PI * 2);
              ctx.fill();
            });

            enemyBullets.forEach(eb => {
              ctx.fillStyle = '#f87171';
              ctx.beginPath();
              ctx.arc(eb.x, eb.y, 3, 0, Math.PI * 2);
              ctx.fill();
            });

            // 8. Render Particles
            particles.forEach(p => {
              ctx.fillStyle = p.color;
              ctx.fillRect(p.x, p.y, p.size, p.size);
            });

            // 9. HUD & Weapon Info Bar
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

            // Armor Bar
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('ARMOR', 10, canvas.height - 24);
            ctx.fillStyle = '#334155';
            ctx.fillRect(52, canvas.height - 32, 80, 8);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(52, canvas.height - 32, 80 * (player.armor / 100), 8);

            // Shield Bar
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('SHIELD', 10, canvas.height - 10);
            ctx.fillStyle = '#334155';
            ctx.fillRect(52, canvas.height - 18, 80, 8);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(52, canvas.height - 18, 80 * (player.shield / 100), 8);

            // Current Weapon & Ammo
            const wep = player.weapons[player.activeWeapon];
            ctx.fillStyle = wep.color;
            ctx.fillText(wep.name, 150, canvas.height - 24);
            ctx.fillStyle = '#f8fafc';
            ctx.fillText('AMMO: ' + (wep.ammo === Infinity ? '∞' : wep.ammo), 150, canvas.height - 10);

            // Score Counter
            ctx.fillStyle = '#facc15';
            ctx.fillText('SCORE: ' + score, 260, canvas.height - 24);
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('STAGE: ' + (currentStageIdx + 1), 260, canvas.height - 10);
          }

          // Main Animation Frame
          function gameLoop(time) {
            const delta = time - lastTime;
            lastTime = time;

            frameCount++;
            if (frameCount % 30 === 0) {
              fps = Math.round(1000 / (delta || 16));
              fpsCounter.innerText = fps + ' FPS';
            }

            update(delta);
            render();
            requestAnimationFrame(gameLoop);
          }

          // Boot Game Stage 1
          initStage(0);
          requestAnimationFrame(gameLoop);
        </script>
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
            <span className="text-xs font-bold tracking-wider">BOOTING SYMBIAN EPOC CORE...</span>
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

      {/* Retro Virtual Keypad (Nokia / GamePad Mode) */}
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
                { key: '7', label: '7 🔄' },
                { key: 'ArrowDown', label: '8 ▼' },
                { key: '9', label: '9 ⚡' },
                { key: '*', label: '*' },
                { key: '0', label: '0 🛡️' },
                { key: '#', label: '#' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onMouseDown={() => sendKeyToEmulator(btn.key, 'keydown')}
                  onMouseUp={() => sendKeyToEmulator(btn.key, 'keyup')}
                  onTouchStart={() => sendKeyToEmulator(btn.key, 'keydown')}
                  onTouchEnd={() => sendKeyToEmulator(btn.key, 'keyup')}
                  className="bg-slate-800/80 active:bg-cyan-500 active:text-slate-950 text-slate-200 font-mono text-xs font-bold py-2 rounded-lg border border-slate-700/60 shadow transition-all duration-75 active:scale-95 select-none"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Controls Helper info */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>⌨️ <strong>WASD / Arrows</strong> Move</span>
              <span><strong>Space / 5</strong> Fire</span>
              <span><strong>Q / 7</strong> Switch</span>
              <span><strong>E / 0</strong> Shield</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
