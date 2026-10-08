import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { recordGamePlay } from '../../utils/storage';
import { Rocket, Zap, Play, RotateCcw, Shield, Bomb, Crosshair, Sparkles, Volume2, VolumeX, Monitor, Award, ChevronRight, HelpCircle } from 'lucide-react';

interface MechaBlaster2Props {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

// 6 Authentic Story Campaign Missions from Metal Bluster 2
export interface CampaignMission {
  id: number;
  part: string;
  title: string;
  subtitle: string;
  description: string;
  targetKills: number;
  bossName?: string;
  bossType?: 'TURTLE' | 'HIPPO' | 'MANTIS';
  color: string;
  bgTint: string;
}

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 1,
    part: 'PART ONE',
    title: 'ENCOUNTER',
    subtitle: 'Outpost Reconnaissance',
    description: 'Patrol the perimeter zone. Neutralize hostile scout infantry squads and rogue light assault tanks.',
    targetKills: 20,
    color: '#3b82f6',
    bgTint: '#0f172a',
  },
  {
    id: 2,
    part: 'PART TWO',
    title: 'RESCUE',
    subtitle: 'Siege of the Desert Post',
    description: 'Break through fortified defensive lines. Defeat the heavy TURTLE-011 armored fortress tank!',
    targetKills: 30,
    bossName: 'TURTLE-011 FORTRESS TANK',
    bossType: 'TURTLE',
    color: '#10b981',
    bgTint: '#1c1917',
  },
  {
    id: 3,
    part: 'PART THREE',
    title: 'SUDDEN STRIKE',
    subtitle: 'Industrial Infiltration',
    description: 'Night assault on the automated factory. Eliminate bipedal Cricket Mechs and elite Rocket Troopers.',
    targetKills: 35,
    color: '#f59e0b',
    bgTint: '#1e1b4b',
  },
  {
    id: 4,
    part: 'PART FOUR',
    title: 'ASSAULT',
    subtitle: 'Citadel Heavy Siege',
    description: 'Massive armor clash! Confront the colossal HIPPO-023 Heavy Dual-Railgun Behemoth.',
    targetKills: 45,
    bossName: 'HIPPO-023 DUAL BEHEMOTH',
    bossType: 'HIPPO',
    color: '#ef4444',
    bgTint: '#311010',
  },
  {
    id: 5,
    part: 'PART FIVE',
    title: 'SACRIFICE',
    subtitle: 'Core Meltdown Sector',
    description: 'Survive hazardous reactor corridors flooded with relentless swarms of heavy assault mechs.',
    targetKills: 55,
    color: '#8b5cf6',
    bgTint: '#2e1065',
  },
  {
    id: 6,
    part: 'PART SIX',
    title: 'VICTORY',
    subtitle: 'Apex Titan Showdown',
    description: 'The final battle! Annihilate the MANTIS-Omega Orbital Dreadnought to liberate the sector.',
    targetKills: 70,
    bossName: 'MANTIS-OMEGA DREADNOUGHT',
    bossType: 'MANTIS',
    color: '#ec4899',
    bgTint: '#18181b',
  },
];

interface Decal {
  x: number;
  y: number;
  radius: number;
  angle: number;
  type: 'crater' | 'tracks' | 'scorch';
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  spark?: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isEnemy: boolean;
  damage: number;
  type: 'mg' | 'rocket' | 'plasma' | 'laser' | 'enemy_bullet' | 'enemy_shell' | 'enemy_missile';
  targetEnemyId?: number;
  life: number;
  maxLife: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  chassisAngle: number;
  turretAngle: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: 'soldier' | 'rocket_boy' | 'tank' | 'cricket_mech' | 'ostrich_mech' | 'boss_turtle' | 'boss_hippo' | 'boss_mantis';
  speed: number;
  shootCooldown: number;
  maxShootCooldown: number;
  scoreValue: number;
  state: 'patrol' | 'chase' | 'attack' | 'retreat';
  specialCooldown?: number;
  subPhase?: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'repair' | 'shield' | 'missile' | 'weapon_up' | 'emp_nuke';
  radius: number;
  pulse: number;
  duration: number;
}

export const MechaBlaster2Game: React.FC<MechaBlaster2Props> = ({ onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-Level UI States
  const [gameState, setGameState] = useState<'menu' | 'mission_select' | 'playing' | 'mission_cleared' | 'gameover'>('menu');
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('arcadex_mb2_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [kills, setKills] = useState(0);
  const [health, setHealth] = useState(100);
  const [shield, setShield] = useState(100);
  const [missiles, setMissiles] = useState(6);
  const [empBombs, setEmpBombs] = useState(2);
  const [selectedWeapon, setSelectedWeapon] = useState<'mg' | 'rocket' | 'plasma'>('mg');
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [bossHp, setBossHp] = useState<{ current: number; max: number; name: string } | null>(null);
  const [retroCrt, setRetroCrt] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  // Active Mission Info
  const mission = CAMPAIGN_MISSIONS[currentMissionIdx];

  // Game Loop Ref State
  const stateRef = useRef({
    missionIdx: 0,
    running: false,
    score: 0,
    kills: 0,
    player: {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 4.2,
      radius: 22,
      chassisAngle: 0,
      turretAngle: 0,
      hp: 100,
      maxHp: 100,
      shield: 100,
      maxShield: 100,
      missiles: 6,
      empBombs: 2,
      weaponLevel: 1,
      selectedWeapon: 'mg' as 'mg' | 'rocket' | 'plasma',
      shootTimer: 0,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
      invulnTimer: 0,
      recoil: 0,
    },
    keys: {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
      shift: false,
      k: false,
      l: false,
      e: false,
      one: false,
      two: false,
      three: false,
    },
    mouse: {
      x: 400,
      y: 300,
      isDown: false,
      rightDown: false,
    },
    touch: {
      moveActive: false,
      moveOriginX: 0,
      moveOriginY: 0,
      moveCurrX: 0,
      moveCurrY: 0,
      aimActive: false,
      aimOriginX: 0,
      aimOriginY: 0,
      aimCurrX: 0,
      aimCurrY: 0,
    },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    decals: [] as Decal[],
    powerUps: [] as PowerUp[],
    nextEnemyId: 1,
    spawnTimer: 0,
    bossSpawned: false,
    screenShake: 0,
    empFlash: 0,
    radarAngle: 0,
    time: 0,
  });

  // Sound Synth Helpers
  const playSoundEffect = useCallback((type: 'mg' | 'rocket' | 'plasma' | 'emp' | 'exp' | 'hit' | 'pickup' | 'boss_siren' | 'dash') => {
    if (soundMuted) return;
    try {
      if (type === 'mg') sounds.shoot?.();
      else if (type === 'rocket') sounds.laser?.();
      else if (type === 'plasma') sounds.powerup?.();
      else if (type === 'emp') sounds.clear?.();
      else if (type === 'exp') sounds.explosion?.();
      else if (type === 'hit') sounds.hit?.();
      else if (type === 'pickup') sounds.coin?.();
      else if (type === 'dash') sounds.jump?.();
      else if (type === 'boss_siren') sounds.fall?.();
    } catch {
      // Audio fallback silent
    }
  }, [soundMuted]);

  // Start / Init Mission
  const startMission = useCallback((missionIndex: number) => {
    const s = stateRef.current;
    s.missionIdx = missionIndex;
    s.running = true;
    s.score = 0;
    s.kills = 0;
    s.player.x = 400;
    s.player.y = 450;
    s.player.vx = 0;
    s.player.vy = 0;
    s.player.chassisAngle = -Math.PI / 2;
    s.player.turretAngle = -Math.PI / 2;
    s.player.hp = 100;
    s.player.shield = 100;
    s.player.missiles = 6;
    s.player.empBombs = 2;
    s.player.weaponLevel = 1;
    s.player.selectedWeapon = 'mg';
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.decals = [];
    s.powerUps = [];
    s.bossSpawned = false;
    s.screenShake = 0;
    s.empFlash = 0;
    s.spawnTimer = 60;
    s.time = 0;

    setCurrentMissionIdx(missionIndex);
    setScore(0);
    setKills(0);
    setHealth(100);
    setShield(100);
    setMissiles(6);
    setEmpBombs(2);
    setSelectedWeapon('mg');
    setWeaponLevel(1);
    setBossHp(null);
    setGameState('playing');
    playSoundEffect('dash');
  }, [playSoundEffect]);

  // Handle Trigger EMP Bomb
  const triggerEmpBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.player.empBombs <= 0) return;
    s.player.empBombs--;
    setEmpBombs(s.player.empBombs);
    s.empFlash = 1.0;
    s.screenShake = 20;
    playSoundEffect('emp');

    // Vaporize all enemy bullets
    s.bullets = s.bullets.filter(b => !b.isEnemy);

    // Deal heavy EMP damage to all enemies
    s.enemies.forEach(e => {
      e.hp -= 150;
      // Spawn EMP spark particles
      for (let i = 0; i < 12; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        s.particles.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 3,
          color: '#38bdf8',
          alpha: 1,
          decay: 0.04,
          spark: true,
        });
      }
    });
  }, [playSoundEffect]);

  // Main Game Loop Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const spawnEnemy = (missionConfig: CampaignMission) => {
      const s = stateRef.current;
      const id = s.nextEnemyId++;

      // Pick edge position
      const side = Math.floor(Math.random() * 4);
      let ex = 0;
      let ey = 0;
      if (side === 0) { ex = Math.random() * 800; ey = -40; }
      else if (side === 1) { ex = 840; ey = Math.random() * 600; }
      else if (side === 2) { ex = Math.random() * 800; ey = 640; }
      else { ex = -40; ey = Math.random() * 600; }

      // Enemy type based on mission tier
      const rand = Math.random();
      let type: Enemy['type'] = 'soldier';
      let hp = 30;
      let radius = 14;
      let speed = 2.4;
      let scoreVal = 100;
      let shootCd = 90 + Math.random() * 60;

      if (missionConfig.id >= 3 && rand < 0.25) {
        type = 'cricket_mech';
        hp = 120;
        radius = 20;
        speed = 2.0;
        scoreVal = 350;
        shootCd = 60;
      } else if (missionConfig.id >= 4 && rand < 0.45) {
        type = 'ostrich_mech';
        hp = 200;
        radius = 24;
        speed = 1.8;
        scoreVal = 500;
        shootCd = 70;
      } else if (rand < 0.55 && missionConfig.id >= 2) {
        type = 'tank';
        hp = 100;
        radius = 22;
        speed = 1.6;
        scoreVal = 250;
        shootCd = 80;
      } else if (rand < 0.8) {
        type = 'rocket_boy';
        hp = 50;
        radius = 16;
        speed = 2.1;
        scoreVal = 150;
        shootCd = 110;
      }

      s.enemies.push({
        id,
        x: ex,
        y: ey,
        vx: 0,
        vy: 0,
        chassisAngle: 0,
        turretAngle: 0,
        radius,
        hp,
        maxHp: hp,
        type,
        speed,
        shootCooldown: shootCd,
        maxShootCooldown: shootCd,
        scoreValue: scoreVal,
        state: 'chase',
      });
    };

    const spawnBoss = (missionConfig: CampaignMission) => {
      const s = stateRef.current;
      if (!missionConfig.bossType) return;
      s.bossSpawned = true;
      playSoundEffect('boss_siren');
      s.screenShake = 25;

      let type: Enemy['type'] = 'boss_turtle';
      let hp = 1800;
      let radius = 48;
      let name = missionConfig.bossName || 'BOSS TITAN';

      if (missionConfig.bossType === 'HIPPO') {
        type = 'boss_hippo';
        hp = 2800;
        radius = 54;
      } else if (missionConfig.bossType === 'MANTIS') {
        type = 'boss_mantis';
        hp = 4200;
        radius = 60;
      }

      s.enemies.push({
        id: s.nextEnemyId++,
        x: 400,
        y: -100,
        vx: 0,
        vy: 1.5,
        chassisAngle: Math.PI / 2,
        turretAngle: Math.PI / 2,
        radius,
        hp,
        maxHp: hp,
        type,
        speed: 1.2,
        shootCooldown: 40,
        maxShootCooldown: 40,
        scoreValue: 5000,
        state: 'attack',
        subPhase: 1,
        specialCooldown: 120,
      });

      setBossHp({ current: hp, max: hp, name });
    };

    const spawnExplosion = (x: number, y: number, size: 'small' | 'medium' | 'large', color?: string) => {
      const s = stateRef.current;
      const count = size === 'large' ? 35 : size === 'medium' ? 20 : 10;
      const pColor = color || (size === 'large' ? '#f97316' : '#eab308');

      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (Math.random() * (size === 'large' ? 6 : 4)) + 1;
        s.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: Math.random() * (size === 'large' ? 5 : 3) + 1.5,
          color: Math.random() > 0.4 ? pColor : '#ef4444',
          alpha: 1,
          decay: 0.02 + Math.random() * 0.03,
        });
      }

      // Add ground crater decal
      if (size === 'large' || size === 'medium') {
        s.decals.push({
          x,
          y,
          radius: size === 'large' ? 24 : 14,
          angle: Math.random() * Math.PI * 2,
          type: 'crater',
          alpha: 0.8,
        });
        if (s.decals.length > 50) s.decals.shift();
      }
    };

    const gameLoop = () => {
      const s = stateRef.current;
      if (!s.running || gameState !== 'playing') {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      s.time++;
      s.radarAngle = (s.radarAngle + 0.04) % (Math.PI * 2);

      const activeMission = CAMPAIGN_MISSIONS[s.missionIdx];

      // ------------------------------------
      // 1. INPUT HANDLING & PLAYER MOVEMENT
      // ------------------------------------
      let moveX = 0;
      let moveY = 0;

      if (s.keys.w) moveY -= 1;
      if (s.keys.s) moveY += 1;
      if (s.keys.a) moveX -= 1;
      if (s.keys.d) moveX += 1;

      // Virtual Joystick Movement
      if (s.touch.moveActive) {
        const dx = s.touch.moveCurrX - s.touch.moveOriginX;
        const dy = s.touch.moveCurrY - s.touch.moveOriginY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
          moveX = dx / dist;
          moveY = dy / dist;
        }
      }

      // Normalize movement vector
      if (moveX !== 0 || moveY !== 0) {
        const mag = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= mag;
        moveY /= mag;

        // Smooth chassis rotation towards movement direction
        const targetChassisAngle = Math.atan2(moveY, moveX);
        let angleDiff = targetChassisAngle - s.player.chassisAngle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        s.player.chassisAngle += angleDiff * 0.18;

        // Tread mark decals
        if (s.time % 8 === 0) {
          s.decals.push({
            x: s.player.x,
            y: s.player.y,
            radius: 8,
            angle: s.player.chassisAngle,
            type: 'tracks',
            alpha: 0.35,
          });
          if (s.decals.length > 50) s.decals.shift();
        }
      }

      // Thruster Dash
      if (s.player.dashCooldown > 0) s.player.dashCooldown--;
      if (s.player.invulnTimer > 0) s.player.invulnTimer--;

      if ((s.keys.shift || s.keys.e) && s.player.dashCooldown === 0 && (moveX !== 0 || moveY !== 0)) {
        s.player.isDashing = true;
        s.player.dashTimer = 12;
        s.player.dashCooldown = 60;
        s.player.invulnTimer = 14;
        playSoundEffect('dash');
        // Spawn dash thrust particles
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: s.player.x - moveX * 16,
            y: s.player.y - moveY * 16,
            vx: -moveX * 4 + (Math.random() - 0.5) * 2,
            vy: -moveY * 4 + (Math.random() - 0.5) * 2,
            radius: 4,
            color: '#38bdf8',
            alpha: 1,
            decay: 0.08,
          });
        }
      }

      if (s.player.isDashing) {
        s.player.dashTimer--;
        s.player.vx = moveX * s.player.speed * 2.4;
        s.player.vy = moveY * s.player.speed * 2.4;
        if (s.player.dashTimer <= 0) s.player.isDashing = false;
      } else {
        s.player.vx = moveX * s.player.speed;
        s.player.vy = moveY * s.player.speed;
      }

      s.player.x = Math.max(s.player.radius, Math.min(800 - s.player.radius, s.player.x + s.player.vx));
      s.player.y = Math.max(s.player.radius, Math.min(600 - s.player.radius, s.player.y + s.player.vy));

      // Shield Auto-Regeneration
      if (s.player.shield < s.player.maxShield && s.time % 15 === 0) {
        s.player.shield = Math.min(s.player.maxShield, s.player.shield + 1);
        setShield(s.player.shield);
      }

      // Turret Aim Calculation (Mouse or Aim Joystick)
      let targetAimX = s.mouse.x;
      let targetAimY = s.mouse.y;

      if (s.touch.aimActive) {
        const adx = s.touch.aimCurrX - s.touch.aimOriginX;
        const ady = s.touch.aimCurrY - s.touch.aimOriginY;
        if (Math.sqrt(adx * adx + ady * ady) > 10) {
          s.player.turretAngle = Math.atan2(ady, adx);
        }
      } else {
        s.player.turretAngle = Math.atan2(targetAimY - s.player.y, targetAimX - s.player.x);
      }

      // Weapon Select Hotkeys
      if (s.keys.one) { s.player.selectedWeapon = 'mg'; setSelectedWeapon('mg'); }
      if (s.keys.two) { s.player.selectedWeapon = 'rocket'; setSelectedWeapon('rocket'); }
      if (s.keys.three) { s.player.selectedWeapon = 'plasma'; setSelectedWeapon('plasma'); }

      // ------------------------------------
      // 2. PLAYER SHOOTING ARSENAL
      // ------------------------------------
      if (s.player.shootTimer > 0) s.player.shootTimer--;
      if (s.player.recoil > 0) s.player.recoil *= 0.85;

      const isFiring = s.mouse.isDown || s.keys.space || s.keys.k || s.touch.aimActive;

      if (isFiring && s.player.shootTimer === 0) {
        const curWep = s.player.selectedWeapon;
        const aimAngle = s.player.turretAngle;
        const barrelLen = 28;

        if (curWep === 'mg') {
          // Twin MG88 Heavy Machine Gun
          s.player.shootTimer = 6;
          s.player.recoil = 4;
          playSoundEffect('mg');

          const offset = (s.time % 12 === 0 ? 6 : -6);
          const perp = aimAngle + Math.PI / 2;
          const bx = s.player.x + Math.cos(aimAngle) * barrelLen + Math.cos(perp) * offset;
          const by = s.player.y + Math.sin(aimAngle) * barrelLen + Math.sin(perp) * offset;
          const spd = 14;

          s.bullets.push({
            x: bx,
            y: by,
            vx: Math.cos(aimAngle) * spd + (Math.random() - 0.5) * 0.4,
            vy: Math.sin(aimAngle) * spd + (Math.random() - 0.5) * 0.4,
            radius: 3,
            color: '#fbbf24',
            isEnemy: false,
            damage: 22 * s.player.weaponLevel,
            type: 'mg',
            life: 50,
            maxLife: 50,
          });

          // Muzzle Flash Particle
          s.particles.push({
            x: bx,
            y: by,
            vx: Math.cos(aimAngle) * 2,
            vy: Math.sin(aimAngle) * 2,
            radius: 6,
            color: '#fef08a',
            alpha: 1,
            decay: 0.25,
          });
        } else if (curWep === 'rocket') {
          // RK Homing Missile Salvo
          if (s.player.missiles > 0) {
            s.player.missiles--;
            setMissiles(s.player.missiles);
            s.player.shootTimer = 22;
            s.player.recoil = 8;
            playSoundEffect('rocket');

            // Find nearest enemy for lock-on
            let nearestId: number | undefined;
            let minDist = 999999;
            s.enemies.forEach(e => {
              const d = Math.hypot(e.x - s.player.x, e.y - s.player.y);
              if (d < minDist) {
                minDist = d;
                nearestId = e.id;
              }
            });

            const bx = s.player.x + Math.cos(aimAngle) * barrelLen;
            const by = s.player.y + Math.sin(aimAngle) * barrelLen;
            const spd = 8;

            s.bullets.push({
              x: bx,
              y: by,
              vx: Math.cos(aimAngle) * spd,
              vy: Math.sin(aimAngle) * spd,
              radius: 5,
              color: '#f97316',
              isEnemy: false,
              damage: 160 * s.player.weaponLevel,
              type: 'rocket',
              targetEnemyId: nearestId,
              life: 80,
              maxLife: 80,
            });
          } else {
            // Auto fallback to MG
            s.player.selectedWeapon = 'mg';
            setSelectedWeapon('mg');
          }
        } else if (curWep === 'plasma') {
          // Combat Plasma Armor-Piercing Cannon
          s.player.shootTimer = 18;
          s.player.recoil = 10;
          playSoundEffect('plasma');
          s.screenShake = 6;

          const bx = s.player.x + Math.cos(aimAngle) * barrelLen;
          const by = s.player.y + Math.sin(aimAngle) * barrelLen;
          const spd = 16;

          s.bullets.push({
            x: bx,
            y: by,
            vx: Math.cos(aimAngle) * spd,
            vy: Math.sin(aimAngle) * spd,
            radius: 8,
            color: '#38bdf8',
            isEnemy: false,
            damage: 90 * s.player.weaponLevel,
            type: 'plasma',
            life: 60,
            maxLife: 60,
          });
        }
      }

      // ------------------------------------
      // 3. ENEMY SPAWNING & AI SCRIPTING
      // ------------------------------------
      if (!s.bossSpawned) {
        s.spawnTimer--;
        if (s.spawnTimer <= 0) {
          spawnEnemy(activeMission);
          s.spawnTimer = Math.max(30, 90 - s.kills * 2);
        }

        // Spawn Boss when target kills reached
        if (s.kills >= activeMission.targetKills && activeMission.bossType) {
          spawnBoss(activeMission);
        }
      }

      // Update Enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i];
        const dx = s.player.x - e.x;
        const dy = s.player.y - e.y;
        const dist = Math.hypot(dx, dy);

        // Smooth angle to player
        const targetAng = Math.atan2(dy, dx);
        e.turretAngle = targetAng;
        e.chassisAngle = targetAng;

        // Move AI towards player
        if (e.type.startsWith('boss')) {
          // Boss AI Behavior
          if (e.y < 120) {
            e.y += 1.5;
          } else {
            // Strafe horizontally
            e.x += Math.sin(s.time * 0.02) * 2.5;
          }

          e.shootCooldown--;
          if (e.shootCooldown <= 0) {
            e.shootCooldown = e.maxShootCooldown;
            // Boss Bullet Pattern
            if (e.type === 'boss_turtle') {
              // Dual Heavy Shells + Spread
              for (let a = -0.3; a <= 0.3; a += 0.3) {
                const ang = targetAng + a;
                s.bullets.push({
                  x: e.x,
                  y: e.y + 20,
                  vx: Math.cos(ang) * 6,
                  vy: Math.sin(ang) * 6,
                  radius: 6,
                  color: '#ef4444',
                  isEnemy: true,
                  damage: 25,
                  type: 'enemy_shell',
                  life: 100,
                  maxLife: 100,
                });
              }
            } else if (e.type === 'boss_hippo') {
              // 5-way Gatling Barrage
              for (let a = -0.5; a <= 0.5; a += 0.25) {
                const ang = targetAng + a;
                s.bullets.push({
                  x: e.x,
                  y: e.y + 25,
                  vx: Math.cos(ang) * 7.5,
                  vy: Math.sin(ang) * 7.5,
                  radius: 5,
                  color: '#f97316',
                  isEnemy: true,
                  damage: 20,
                  type: 'enemy_bullet',
                  life: 90,
                  maxLife: 90,
                });
              }
            } else if (e.type === 'boss_mantis') {
              // Orbital Spiral Laser Pulse
              for (let k = 0; k < 8; k++) {
                const ang = (s.time * 0.1) + (k * Math.PI / 4);
                s.bullets.push({
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(ang) * 5.5,
                  vy: Math.sin(ang) * 5.5,
                  radius: 5,
                  color: '#ec4899',
                  isEnemy: true,
                  damage: 30,
                  type: 'enemy_missile',
                  life: 110,
                  maxLife: 110,
                });
              }
            }
          }
          setBossHp({ current: Math.max(0, e.hp), max: e.maxHp, name: activeMission.bossName || 'BOSS' });
        } else {
          // Standard Enemies
          if (dist > (e.type === 'rocket_boy' ? 240 : 140)) {
            e.x += (dx / dist) * e.speed;
            e.y += (dy / dist) * e.speed;
          } else if (dist < 80) {
            // Keep distance
            e.x -= (dx / dist) * e.speed;
            e.y -= (dy / dist) * e.speed;
          }

          e.shootCooldown--;
          if (e.shootCooldown <= 0) {
            e.shootCooldown = e.maxShootCooldown + Math.random() * 30;
            const spd = e.type === 'rocket_boy' ? 5 : 7;
            s.bullets.push({
              x: e.x + Math.cos(targetAng) * 16,
              y: e.y + Math.sin(targetAng) * 16,
              vx: Math.cos(targetAng) * spd,
              vy: Math.sin(targetAng) * spd,
              radius: e.type === 'tank' ? 5 : 3.5,
              color: e.type === 'rocket_boy' ? '#f97316' : '#ef4444',
              isEnemy: true,
              damage: e.type === 'tank' ? 18 : e.type === 'rocket_boy' ? 25 : 12,
              type: e.type === 'rocket_boy' ? 'enemy_missile' : 'enemy_bullet',
              life: 80,
              maxLife: 80,
            });
          }
        }

        // Check if enemy died
        if (e.hp <= 0) {
          const wasBoss = e.type.startsWith('boss');
          spawnExplosion(e.x, e.y, wasBoss ? 'large' : 'medium');
          playSoundEffect('exp');
          s.score += e.scoreValue;
          s.kills++;
          setScore(s.score);
          setKills(s.kills);
          if (onScoreUpdate) onScoreUpdate(s.score);

          // Spawn PowerUp chance
          if (Math.random() < 0.35 || wasBoss) {
            const types: PowerUp['type'][] = ['repair', 'shield', 'missile', 'weapon_up', 'emp_nuke'];
            const pType = types[Math.floor(Math.random() * types.length)];
            s.powerUps.push({
              x: e.x,
              y: e.y,
              type: pType,
              radius: 12,
              pulse: 0,
              duration: 600,
            });
          }

          s.enemies.splice(i, 1);

          // Mission Cleared Condition
          if (wasBoss || (s.kills >= activeMission.targetKills && !activeMission.bossType)) {
            s.running = false;
            setGameState('mission_cleared');
            recordGamePlay('mecha-blaster-2', s.score);
            if (s.score > highScore) {
              setHighScore(s.score);
              try { localStorage.setItem('arcadex_mb2_highscore', s.score.toString()); } catch {}
            }
            return;
          }
        }
      }

      // ------------------------------------
      // 4. BULLET TRAJECTORY & COLLISIONS
      // ------------------------------------
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];

        // Homing missile logic
        if (b.type === 'rocket' && b.targetEnemyId) {
          const target = s.enemies.find(e => e.id === b.targetEnemyId);
          if (target) {
            const tdx = target.x - b.x;
            const tdy = target.y - b.y;
            const targetAng = Math.atan2(tdy, tdx);
            const curAng = Math.atan2(b.vy, b.vx);
            let diff = targetAng - curAng;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            const newAng = curAng + diff * 0.12;
            const spd = Math.hypot(b.vx, b.vy);
            b.vx = Math.cos(newAng) * spd;
            b.vy = Math.sin(newAng) * spd;
          }

          // Missile smoke trail particles
          if (s.time % 2 === 0) {
            s.particles.push({
              x: b.x,
              y: b.y,
              vx: -b.vx * 0.2 + (Math.random() - 0.5),
              vy: -b.vy * 0.2 + (Math.random() - 0.5),
              radius: 3,
              color: '#94a3b8',
              alpha: 0.7,
              decay: 0.05,
            });
          }
        }

        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        // Remove out of bounds or expired
        if (b.life <= 0 || b.x < -20 || b.x > 820 || b.y < -20 || b.y > 620) {
          s.bullets.splice(i, 1);
          continue;
        }

        if (b.isEnemy) {
          // Check collision with player
          if (s.player.invulnTimer <= 0) {
            const pdist = Math.hypot(b.x - s.player.x, b.y - s.player.y);
            if (pdist < s.player.radius + b.radius) {
              s.bullets.splice(i, 1);
              s.screenShake = 10;
              playSoundEffect('hit');

              // Apply damage to shield first, then HP
              if (s.player.shield >= b.damage) {
                s.player.shield -= b.damage;
              } else {
                const rem = b.damage - s.player.shield;
                s.player.shield = 0;
                s.player.hp -= rem;
              }

              setHealth(Math.max(0, s.player.hp));
              setShield(Math.max(0, s.player.shield));

              // Check Player Death
              if (s.player.hp <= 0) {
                spawnExplosion(s.player.x, s.player.y, 'large');
                s.running = false;
                setGameState('gameover');
                recordGamePlay('mecha-blaster-2', s.score);
                if (s.score > highScore) {
                  setHighScore(s.score);
                  try { localStorage.setItem('arcadex_mb2_highscore', s.score.toString()); } catch {}
                }
                if (onGameOver) onGameOver(s.score);
                return;
              }
              continue;
            }
          }
        } else {
          // Player bullet hitting enemies
          for (let j = 0; j < s.enemies.length; j++) {
            const e = s.enemies[j];
            const edist = Math.hypot(b.x - e.x, b.y - e.y);
            if (edist < e.radius + b.radius) {
              e.hp -= b.damage;
              spawnExplosion(b.x, b.y, 'small', b.color);
              playSoundEffect('hit');

              // Plasma pierces, MG and rockets vanish on hit
              if (b.type !== 'plasma') {
                s.bullets.splice(i, 1);
              }
              break;
            }
          }
        }
      }

      // ------------------------------------
      // 5. POWER-UPS PICKUP & PARTICLES
      // ------------------------------------
      for (let i = s.powerUps.length - 1; i >= 0; i--) {
        const p = s.powerUps[i];
        p.pulse = (p.pulse + 0.08) % (Math.PI * 2);
        p.duration--;

        const pdist = Math.hypot(p.x - s.player.x, p.y - s.player.y);
        if (pdist < s.player.radius + p.radius) {
          // Picked up!
          playSoundEffect('pickup');
          if (p.type === 'repair') {
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 40);
            setHealth(s.player.hp);
          } else if (p.type === 'shield') {
            s.player.shield = s.player.maxShield;
            setShield(s.player.shield);
          } else if (p.type === 'missile') {
            s.player.missiles += 4;
            setMissiles(s.player.missiles);
          } else if (p.type === 'weapon_up') {
            s.player.weaponLevel = Math.min(3, s.player.weaponLevel + 1);
            setWeaponLevel(s.player.weaponLevel);
          } else if (p.type === 'emp_nuke') {
            s.player.empBombs += 1;
            setEmpBombs(s.player.empBombs);
          }
          s.score += 200;
          setScore(s.score);
          s.powerUps.splice(i, 1);
          continue;
        }

        if (p.duration <= 0) {
          s.powerUps.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Decay screen shake & EMP flash
      if (s.screenShake > 0) s.screenShake *= 0.9;
      if (s.empFlash > 0) s.empFlash *= 0.88;

      // ------------------------------------
      // 6. RENDER PASS (CANVAS 2D 60FPS)
      // ------------------------------------
      ctx.save();

      // Apply screen shake
      if (s.screenShake > 0.5) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Clear & Draw Terrain Grid
      ctx.fillStyle = activeMission.bgTint;
      ctx.fillRect(0, 0, 800, 600);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= 800; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = 0; y <= 600; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Draw Decals (Craters & Treads)
      s.decals.forEach(d => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.globalAlpha = d.alpha;
        if (d.type === 'crater') {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (d.type === 'tracks') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-6, -d.radius, 3, d.radius * 2);
          ctx.fillRect(3, -d.radius, 3, d.radius * 2);
        }
        ctx.restore();
      });

      // Draw PowerUps
      s.powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        const rad = p.radius + Math.sin(p.pulse) * 3;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        if (p.type === 'repair') ctx.fillStyle = '#22c55e';
        else if (p.type === 'shield') ctx.fillStyle = '#38bdf8';
        else if (p.type === 'missile') ctx.fillStyle = '#f97316';
        else if (p.type === 'weapon_up') ctx.fillStyle = '#eab308';
        else ctx.fillStyle = '#a855f7';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let lbl = 'HP';
        if (p.type === 'shield') lbl = 'SHD';
        else if (p.type === 'missile') lbl = 'RCK';
        else if (p.type === 'weapon_up') lbl = 'UP';
        else if (p.type === 'emp_nuke') lbl = 'EMP';
        ctx.fillText(lbl, 0, 0);
        ctx.restore();
      });

      // Draw Enemies
      s.enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.type === 'soldier' || e.type === 'rocket_boy') {
          // Infantry
          ctx.rotate(e.turretAngle);
          ctx.fillStyle = e.type === 'soldier' ? '#ef4444' : '#f97316';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Gun barrel
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, -2, e.radius + 6, 4);
        } else if (e.type === 'tank') {
          // Tank Chassis
          ctx.save();
          ctx.rotate(e.chassisAngle);
          ctx.fillStyle = '#475569';
          ctx.fillRect(-16, -12, 32, 24);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-18, -14, 36, 6);
          ctx.fillRect(-18, 8, 36, 6);
          ctx.restore();

          // Tank Turret
          ctx.rotate(e.turretAngle);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, -3, 20, 6);
        } else if (e.type === 'cricket_mech' || e.type === 'ostrich_mech') {
          // Bipedal Walker
          ctx.rotate(e.chassisAngle);
          ctx.fillStyle = '#64748b';
          // Legs
          ctx.fillRect(-10, -18, 6, 12);
          ctx.fillRect(4, -18, 6, 12);
          ctx.fillRect(-10, 6, 6, 12);
          ctx.fillRect(4, 6, 6, 12);
          // Body
          ctx.fillStyle = e.type === 'cricket_mech' ? '#e11d48' : '#7c3aed';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          // Dual Pods
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, -8, 16, 4);
          ctx.fillRect(0, 4, 16, 4);
        } else if (e.type.startsWith('boss')) {
          // Mega Boss Titan
          ctx.rotate(e.chassisAngle);
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
          // Plating
          ctx.fillStyle = activeMission.color;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius - 8, 0, Math.PI * 2);
          ctx.fill();
          // Massive Dual Cannons
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10, -14, e.radius + 15, 10);
          ctx.fillRect(10, 4, e.radius + 15, 10);
          // Glowing Core
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Health Bar Above Enemy
        ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(e.x - 18, e.y - e.radius - 12, 36, 5);
        ctx.fillStyle = e.type.startsWith('boss') ? '#a855f7' : '#ef4444';
        const hpWidth = Math.max(0, (e.hp / e.maxHp) * 36);
        ctx.fillRect(e.x - 18, e.y - e.radius - 12, hpWidth, 5);
      });

      // Draw Player Tank
      ctx.save();
      ctx.translate(s.player.x, s.player.y);

      // Chassis & Treads
      ctx.save();
      ctx.rotate(s.player.chassisAngle);
      // Treads
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-22, -18, 44, 8);
      ctx.fillRect(-22, 10, 44, 8);
      // Armored Hull Body
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-18, -12, 36, 24);
      // Racing Team Stripes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-16, -4, 32, 8);
      ctx.restore();

      // Independent Rotating Cockpit & Turret
      ctx.rotate(s.player.turretAngle);
      // Recoil kickback on barrel
      const recoilOffset = -s.player.recoil;

      // Heavy Cannons
      ctx.fillStyle = '#0f172a';
      if (s.player.selectedWeapon === 'mg') {
        // Dual MG Barrels
        ctx.fillRect(recoilOffset, -7, 26, 4);
        ctx.fillRect(recoilOffset, 3, 26, 4);
      } else if (s.player.selectedWeapon === 'rocket') {
        // Missile Pods
        ctx.fillStyle = '#f97316';
        ctx.fillRect(recoilOffset, -10, 20, 8);
        ctx.fillRect(recoilOffset, 2, 20, 8);
      } else {
        // Heavy Plasma Cannon
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(recoilOffset, -5, 30, 10);
      }

      // Cockpit Dome
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cockpit Viewport Glass
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(4, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Energy Shield Bubble
      if (s.player.shield > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, s.player.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(s.time * 0.1) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      // Draw Bullets
      s.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      s.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Tactical EMP Screen Flash
      if (s.empFlash > 0.05) {
        ctx.fillStyle = `rgba(56, 189, 248, ${s.empFlash * 0.6})`;
        ctx.fillRect(0, 0, 800, 600);
      }

      // ------------------------------------
      // 7. RETRO SCANLINE & LCD MATRIX FX
      // ------------------------------------
      if (retroCrt) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let y = 0; y < 600; y += 3) {
          ctx.fillRect(0, y, 800, 1.2);
        }
      }

      // ------------------------------------
      // 8. TACTICAL RADAR MINIMAP (BOTTOM RIGHT)
      // ------------------------------------
      const rX = 720;
      const rY = 520;
      const rSize = 65;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(rX, rY, rSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sweep Line
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.beginPath();
      ctx.moveTo(rX, rY);
      ctx.lineTo(rX + Math.cos(s.radarAngle) * rSize, rY + Math.sin(s.radarAngle) * rSize);
      ctx.stroke();

      // Player on Radar
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(rX + ((s.player.x - 400) / 400) * (rSize - 10), rY + ((s.player.y - 300) / 300) * (rSize - 10), 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Enemies on Radar
      s.enemies.forEach(e => {
        ctx.fillStyle = e.type.startsWith('boss') ? '#ec4899' : '#ef4444';
        const rx = rX + ((e.x - 400) / 400) * (rSize - 10);
        const ry = rY + ((e.y - 300) / 300) * (rSize - 10);
        ctx.beginPath();
        ctx.arc(rx, ry, e.type.startsWith('boss') ? 5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, retroCrt, highScore, onGameOver, onScoreUpdate, playSoundEffect]);

  // Key Down / Up Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const k = e.key.toLowerCase();

      if (k === 'w' || k === 'arrowup') s.keys.w = true;
      if (k === 's' || k === 'arrowdown') s.keys.s = true;
      if (k === 'a' || k === 'arrowleft') s.keys.a = true;
      if (k === 'd' || k === 'arrowright') s.keys.d = true;
      if (k === ' ' || k === 'spacebar') { s.keys.space = true; e.preventDefault(); }
      if (k === 'shift') s.keys.shift = true;
      if (k === '1') { s.player.selectedWeapon = 'mg'; setSelectedWeapon('mg'); }
      if (k === '2') { s.player.selectedWeapon = 'rocket'; setSelectedWeapon('rocket'); }
      if (k === '3') { s.player.selectedWeapon = 'plasma'; setSelectedWeapon('plasma'); }
      if (k === 'b' || k === 'e') triggerEmpBomb();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const k = e.key.toLowerCase();

      if (k === 'w' || k === 'arrowup') s.keys.w = false;
      if (k === 's' || k === 'arrowdown') s.keys.s = false;
      if (k === 'a' || k === 'arrowleft') s.keys.a = false;
      if (k === 'd' || k === 'arrowright') s.keys.d = false;
      if (k === ' ' || k === 'spacebar') s.keys.space = false;
      if (k === 'shift') s.keys.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerEmpBomb]);

  // Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    stateRef.current.mouse.x = (e.clientX - rect.left) * scaleX;
    stateRef.current.mouse.y = (e.clientY - rect.top) * scaleY;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      // Right Click -> Missile
      const s = stateRef.current;
      s.player.selectedWeapon = 'rocket';
      setSelectedWeapon('rocket');
      s.mouse.isDown = true;
      e.preventDefault();
    } else {
      stateRef.current.mouse.isDown = true;
    }
  };

  const handleMouseUp = () => {
    stateRef.current.mouse.isDown = false;
    stateRef.current.mouse.rightDown = false;
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none bg-slate-950 rounded-2xl p-2 sm:p-4 shadow-2xl border border-slate-800 text-slate-100 font-sans">
      {/* TOP RETRO HUD BANNER */}
      <div className="w-full max-w-[800px] flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700/60 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black tracking-widest text-emerald-400 text-sm sm:text-base uppercase">
            <Crosshair className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>METAL BLASTER 2</span>
          </div>
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
            {mission.part}: {mission.title}
          </span>
        </div>

        {/* STATS STRIP */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">TOTAL SCORE</span>
            <span className="text-amber-400 font-bold text-sm tracking-wider">{score.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">BEST SCORE</span>
            <span className="text-slate-200 font-bold text-sm tracking-wider">{highScore.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">KILLS</span>
            <span className="text-rose-400 font-bold text-sm">
              {kills} / {mission.targetKills}
            </span>
          </div>
        </div>

        {/* SETTINGS TOGGLES */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRetroCrt(!retroCrt)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              retroCrt ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Nokia LCD Scanlines"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            title="Toggle Audio"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            title="Mission Briefing"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOSS HEALTH GAUGE (WHEN ACTIVE) */}
      {bossHp && gameState === 'playing' && (
        <div className="w-full max-w-[800px] mb-2 px-4 py-2 bg-rose-950/70 border border-rose-600/50 rounded-xl flex flex-col gap-1 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 tracking-wider">
            <span>⚠️ FIGHTING BOSS: {bossHp.name}</span>
            <span>{Math.round((bossHp.current / bossHp.max) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-500/30">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-purple-600 transition-all duration-150"
              style={{ width: `${(bossHp.current / bossHp.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* MAIN GAME CANVAS VIEWPORT */}
      <div className="relative w-full max-w-[800px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-800">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* OVERLAYS: MAIN MENU */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              100% Authentic Symbian S60 Classic
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              METAL BLASTER 2
            </h1>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              Pilot an armored mechanized tank across 6 legendary story campaign missions. Dual twin autocannons, guided rockets, and mega titan bosses.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => startMission(0)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 text-sm sm:text-base active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                START CAMPAIGN
              </button>
              <button
                onClick={() => setGameState('mission_select')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all text-sm active:scale-95"
              >
                SELECT MISSION (1-6)
              </button>
            </div>
          </div>
        )}

        {/* OVERLAYS: MISSION SELECT */}
        {gameState === 'mission_select' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white tracking-wide">CAMPAIGN MISSIONS (PARTS 1-6)</h2>
              <button
                onClick={() => setGameState('menu')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg"
              >
                BACK
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAMPAIGN_MISSIONS.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => startMission(idx)}
                  className="p-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer transition-all flex flex-col justify-between text-left group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold text-emerald-400">{m.part}</span>
                      {m.bossName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded">
                          BOSS
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{m.subtitle}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{m.description}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Target: {m.targetKills} Kills</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      DEPLOY <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OVERLAYS: MISSION CLEARED */}
        {gameState === 'mission_cleared' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-full mb-3 text-emerald-400">
              <Award className="w-10 h-10 animate-bounce" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase mb-1">
              MISSION OBJECTIVE COMPLETE
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
              {mission.part}: {mission.title} CLEARED!
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Total Score: <span className="font-bold text-amber-400">{score.toLocaleString()}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentMissionIdx < CAMPAIGN_MISSIONS.length - 1 ? (
                <button
                  onClick={() => startMission(currentMissionIdx + 1)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  NEXT MISSION <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => startMission(0)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  REPLAY CAMPAIGN
                </button>
              )}
              <button
                onClick={() => setGameState('menu')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}

        {/* OVERLAYS: GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-rose-500 mb-1 tracking-wider">
              TANK DESTROYED
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Your mech was neutralized during {mission.part}: {mission.title}
            </p>
            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 mb-6 text-sm font-mono">
              <span className="text-slate-400">FINAL SCORE: </span>
              <span className="text-amber-400 font-bold">{score.toLocaleString()}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => startMission(currentMissionIdx)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                RETRY MISSION
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM WEAPON SELECTOR & COCKPIT CONTROLS */}
      <div className="w-full max-w-[800px] mt-2 flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
        {/* WEAPON SELECT BUTTONS */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-bold mr-1 hidden sm:inline">WEAPONS:</span>
          <button
            onClick={() => { stateRef.current.player.selectedWeapon = 'mg'; setSelectedWeapon('mg'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              selectedWeapon === 'mg' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. M.GUN 88</span>
          </button>

          <button
            onClick={() => { stateRef.current.player.selectedWeapon = 'rocket'; setSelectedWeapon('rocket'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              selectedWeapon === 'rocket' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>2. ROCKETS ({missiles})</span>
          </button>

          <button
            onClick={() => { stateRef.current.player.selectedWeapon = 'plasma'; setSelectedWeapon('plasma'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              selectedWeapon === 'plasma' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>3. CANNON</span>
          </button>
        </div>

        {/* TACTICAL EMP BOMB BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerEmpBomb}
            disabled={empBombs <= 0}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              empBombs > 0
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Bomb className="w-4 h-4" />
            <span>EMP BOMB ({empBombs})</span>
          </button>
        </div>
      </div>

      {/* HEALTH & SHIELD PROGRESS BARS */}
      <div className="w-full max-w-[800px] mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span>ARMOR INTEGRITY</span>
            <span>{Math.max(0, health)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                health > 50 ? 'bg-emerald-500' : health > 25 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${Math.max(0, health)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-blue-400 font-bold">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> ENERGY SHIELD</span>
            <span>{Math.max(0, shield)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-150"
              style={{ width: `${Math.max(0, shield)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
