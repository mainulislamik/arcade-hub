import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { RotateCcw, Play, Trophy, Sparkles, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getGameHighScore, recordGamePlay } from '../../utils/storage';

interface AngryBirdsGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

// -------------------------------------------------------------
// Physics and Game Entities
// -------------------------------------------------------------
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 480;
const GROUND_Y = 420;
const GRAVITY = 0.35;
const SLING_X = 140;
const SLING_Y = 320;
const MAX_PULL = 85;

type BlockType = 'wood' | 'stone' | 'ice' | 'tnt';

interface Block {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  angle: number;
  va: number; // angular velocity
  type: BlockType;
  hp: number;
  maxHp: number;
  exploded?: boolean;
}

interface Pig {
  id: string;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  type: 'normal' | 'helmet' | 'king';
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Bird {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  inAir: boolean;
  boosted: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export const AngryBirdsGame: React.FC<AngryBirdsGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => getGameHighScore('android-angry-birds') || 15000);
  const [birdsLeft, setBirdsLeft] = useState(3);
  const [gameState, setGameState] = useState<'aiming' | 'flying' | 'settling' | 'cleared' | 'failed'>('aiming');
  const [stars, setStars] = useState(0);
  const [isMuted, setIsMuted] = useState(!soundEnabled);

  // Mutable Game Refs
  const isDraggingRef = useRef(false);
  const dragPosRef = useRef({ x: SLING_X, y: SLING_Y });
  const birdRef = useRef<Bird>({
    x: SLING_X,
    y: SLING_Y,
    r: 15,
    vx: 0,
    vy: 0,
    inAir: false,
    boosted: false,
    trail: []
  });

  const blocksRef = useRef<Block[]>([]);
  const pigsRef = useRef<Pig[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const settleTimerRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Play synthetic sounds safely
  const playSfx = useCallback((type: 'stretch' | 'launch' | 'wood' | 'pig' | 'tnt' | 'win' | 'lose') => {
    if (isMuted) return;
    try {
      if (type === 'launch' || type === 'stretch') sounds.playJump();
      else if (type === 'pig') sounds.playCoin();
      else if (type === 'wood') sounds.playHit();
      else if (type === 'tnt') sounds.playExplosion();
      else if (type === 'win') sounds.playVictory();
      else if (type === 'lose') sounds.playGameOver();
    } catch {
      // fallback safe
    }
  }, [isMuted]);

  // -------------------------------------------------------------
  // Level Setup
  // -------------------------------------------------------------
  const initLevel = useCallback((lvl: number) => {
    settleTimerRef.current = 0;
    birdRef.current = {
      x: SLING_X,
      y: SLING_Y,
      r: 15,
      vx: 0,
      vy: 0,
      inAir: false,
      boosted: false,
      trail: []
    };
    dragPosRef.current = { x: SLING_X, y: SLING_Y };
    isDraggingRef.current = false;
    particlesRef.current = [];
    floatingTextsRef.current = [];

    const blocks: Block[] = [];
    const pigs: Pig[] = [];

    if (lvl === 1) {
      // Level 1: Outpost with 2 pigs
      setBirdsLeft(3);
      // Tower 1
      blocks.push(
        { id: 'b1', x: 500, y: GROUND_Y - 40, w: 20, h: 80, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 30, maxHp: 30 },
        { id: 'b2', x: 580, y: GROUND_Y - 40, w: 20, h: 80, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 30, maxHp: 30 },
        { id: 'b3', x: 540, y: GROUND_Y - 85, w: 110, h: 14, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 25, maxHp: 25 }
      );
      pigs.push({ id: 'p1', x: 540, y: GROUND_Y - 20, r: 18, vx: 0, vy: 0, hp: 1, maxHp: 1, type: 'normal', alive: true });

      // Tower 2
      blocks.push(
        { id: 'b4', x: 670, y: GROUND_Y - 30, w: 20, h: 60, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 60, maxHp: 60 },
        { id: 'b5', x: 730, y: GROUND_Y - 30, w: 20, h: 60, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 60, maxHp: 60 },
        { id: 'b6', x: 700, y: GROUND_Y - 65, w: 85, h: 14, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 25, maxHp: 25 }
      );
      pigs.push({ id: 'p2', x: 700, y: GROUND_Y - 85, r: 16, vx: 0, vy: 0, hp: 1, maxHp: 1, type: 'helmet', alive: true });

    } else if (lvl === 2) {
      // Level 2: Stone castle with TNT
      setBirdsLeft(3);
      blocks.push(
        // Base Pillars
        { id: 'b1', x: 490, y: GROUND_Y - 50, w: 24, h: 100, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 70, maxHp: 70 },
        { id: 'b2', x: 570, y: GROUND_Y - 50, w: 24, h: 100, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 70, maxHp: 70 },
        { id: 'b3', x: 650, y: GROUND_Y - 50, w: 24, h: 100, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 70, maxHp: 70 },
        // Mid Floor
        { id: 'b4', x: 570, y: GROUND_Y - 108, w: 190, h: 16, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 35, maxHp: 35 },
        // Upper floor with TNT
        { id: 'tnt1', x: 570, y: GROUND_Y - 30, w: 32, h: 32, vx: 0, vy: 0, angle: 0, va: 0, type: 'tnt', hp: 10, maxHp: 10 },
        { id: 'b5', x: 530, y: GROUND_Y - 150, w: 20, h: 70, vx: 0, vy: 0, angle: 0, va: 0, type: 'ice', hp: 20, maxHp: 20 },
        { id: 'b6', x: 610, y: GROUND_Y - 150, w: 20, h: 70, vx: 0, vy: 0, angle: 0, va: 0, type: 'ice', hp: 20, maxHp: 20 },
        { id: 'b7', x: 570, y: GROUND_Y - 190, w: 110, h: 14, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 25, maxHp: 25 }
      );
      pigs.push(
        { id: 'p1', x: 520, y: GROUND_Y - 20, r: 16, vx: 0, vy: 0, hp: 1, maxHp: 1, type: 'normal', alive: true },
        { id: 'p2', x: 620, y: GROUND_Y - 20, r: 16, vx: 0, vy: 0, hp: 1, maxHp: 1, type: 'normal', alive: true },
        { id: 'p3', x: 570, y: GROUND_Y - 130, r: 19, vx: 0, vy: 0, hp: 2, maxHp: 2, type: 'helmet', alive: true }
      );

    } else {
      // Level 3+: The Pig King Citadel
      setBirdsLeft(4);
      blocks.push(
        { id: 'b1', x: 470, y: GROUND_Y - 45, w: 22, h: 90, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 80, maxHp: 80 },
        { id: 'b2', x: 530, y: GROUND_Y - 45, w: 22, h: 90, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 80, maxHp: 80 },
        { id: 'b3', x: 630, y: GROUND_Y - 45, w: 22, h: 90, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 80, maxHp: 80 },
        { id: 'b4', x: 690, y: GROUND_Y - 45, w: 22, h: 90, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 80, maxHp: 80 },
        // Crossbeams
        { id: 'b5', x: 500, y: GROUND_Y - 96, w: 90, h: 16, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 35, maxHp: 35 },
        { id: 'b6', x: 660, y: GROUND_Y - 96, w: 90, h: 16, vx: 0, vy: 0, angle: 0, va: 0, type: 'wood', hp: 35, maxHp: 35 },
        // High bridge
        { id: 'b7', x: 580, y: GROUND_Y - 140, w: 160, h: 16, vx: 0, vy: 0, angle: 0, va: 0, type: 'stone', hp: 60, maxHp: 60 },
        { id: 'tnt1', x: 580, y: GROUND_Y - 165, w: 32, h: 32, vx: 0, vy: 0, angle: 0, va: 0, type: 'tnt', hp: 10, maxHp: 10 },
        // King Pig Tower
        { id: 'b8', x: 580, y: GROUND_Y - 210, w: 20, h: 60, vx: 0, vy: 0, angle: 0, va: 0, type: 'ice', hp: 20, maxHp: 20 }
      );
      pigs.push(
        { id: 'p1', x: 500, y: GROUND_Y - 20, r: 16, vx: 0, vy: 0, hp: 1, maxHp: 1, type: 'normal', alive: true },
        { id: 'p2', x: 660, y: GROUND_Y - 20, r: 16, vx: 0, vy: 0, hp: 1, maxHp: 1, type: 'normal', alive: true },
        { id: 'p3', x: 500, y: GROUND_Y - 118, r: 17, vx: 0, vy: 0, hp: 2, maxHp: 2, type: 'helmet', alive: true },
        { id: 'p4', x: 580, y: GROUND_Y - 250, r: 23, vx: 0, vy: 0, hp: 3, maxHp: 3, type: 'king', alive: true }
      );
    }

    blocksRef.current = blocks;
    pigsRef.current = pigs;
    setGameState('aiming');
  }, []);

  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // -------------------------------------------------------------
  // Explosion & Damage Logic
  // -------------------------------------------------------------
  const triggerTntExplosion = useCallback((x: number, y: number) => {
    playSfx('tnt');
    // Screen shake / huge blast particles
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#f97316', '#ef4444', '#facc15', '#475569'][Math.floor(Math.random() * 4)],
        size: Math.random() * 7 + 3,
        life: 1.0,
        maxLife: 1.0
      });
    }

    floatingTextsRef.current.push({
      x,
      y: y - 20,
      text: 'BOOM! +10,000',
      color: '#f97316',
      life: 1.0
    });

    setScore(s => {
      const ns = s + 10000;
      onScoreUpdate?.(ns);
      return ns;
    });

    // Knockback nearby blocks and pigs
    const BLAST_RADIUS = 150;
    blocksRef.current.forEach(b => {
      const dx = b.x - x;
      const dy = b.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < BLAST_RADIUS && dist > 1) {
        const force = (1 - dist / BLAST_RADIUS) * 16;
        b.vx += (dx / dist) * force;
        b.vy += (dy / dist) * force - 4;
        b.va += (Math.random() - 0.5) * 0.4;
        b.hp -= 40;
      }
    });

    pigsRef.current.forEach(p => {
      if (!p.alive) return;
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < BLAST_RADIUS) {
        p.alive = false;
        playSfx('pig');
        for (let i = 0; i < 20; i++) {
          particlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#22c55e',
            size: Math.random() * 5 + 3,
            life: 1.0,
            maxLife: 1.0
          });
        }
        floatingTextsRef.current.push({
          x: p.x,
          y: p.y - 15,
          text: '+5,000',
          color: '#22c55e',
          life: 1.0
        });
        setScore(s => {
          const ns = s + 5000;
          onScoreUpdate?.(ns);
          return ns;
        });
      }
    });
  }, [onScoreUpdate, playSfx]);

  // -------------------------------------------------------------
  // Input Handling (Slingshot Drag)
  // -------------------------------------------------------------
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'aiming') {
      // Tap in flight to trigger Red Bird Speed Boost / Squawk!
      if (gameState === 'flying' && !birdRef.current.boosted) {
        birdRef.current.boosted = true;
        birdRef.current.vx *= 1.45;
        birdRef.current.vy *= 0.8;
        playSfx('stretch');
        for (let i = 0; i < 12; i++) {
          particlesRef.current.push({
            x: birdRef.current.x,
            y: birdRef.current.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: '#ef4444',
            size: 4,
            life: 0.8,
            maxLife: 0.8
          });
        }
      }
      return;
    }

    const { x, y } = getCanvasCoords(e);
    const distToSling = Math.hypot(x - SLING_X, y - SLING_Y);
    if (distToSling < 60) {
      isDraggingRef.current = true;
      dragPosRef.current = { x, y };
      playSfx('stretch');
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || gameState !== 'aiming') return;
    const { x, y } = getCanvasCoords(e);
    const dx = x - SLING_X;
    const dy = y - SLING_Y;
    const dist = Math.hypot(dx, dy);

    if (dist > MAX_PULL) {
      const angle = Math.atan2(dy, dx);
      dragPosRef.current = {
        x: SLING_X + Math.cos(angle) * MAX_PULL,
        y: SLING_Y + Math.sin(angle) * MAX_PULL
      };
    } else {
      dragPosRef.current = { x, y };
    }

    birdRef.current.x = dragPosRef.current.x;
    birdRef.current.y = dragPosRef.current.y;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || gameState !== 'aiming') return;
    isDraggingRef.current = false;

    const dx = SLING_X - dragPosRef.current.x;
    const dy = SLING_Y - dragPosRef.current.y;
    const pullDist = Math.hypot(dx, dy);

    if (pullDist > 15) {
      // Fire Bird!
      playSfx('launch');
      const power = 0.22;
      birdRef.current.vx = dx * power;
      birdRef.current.vy = dy * power;
      birdRef.current.inAir = true;
      setGameState('flying');
      setBirdsLeft(b => b - 1);
    } else {
      // Cancel pull
      birdRef.current.x = SLING_X;
      birdRef.current.y = SLING_Y;
    }
  };

  // -------------------------------------------------------------
  // Main Game Loop & Physics
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const updatePhysics = () => {
      // 1. Update Flying Bird
      if (birdRef.current.inAir) {
        const b = birdRef.current;
        b.vy += GRAVITY;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.995;

        // Trail dots
        if (Math.random() < 0.6) {
          b.trail.push({ x: b.x, y: b.y, alpha: 0.8 });
        }

        // Ground bounce
        if (b.y + b.r >= GROUND_Y) {
          b.y = GROUND_Y - b.r;
          b.vy = -b.vy * 0.45;
          b.vx *= 0.7;
          if (Math.abs(b.vx) < 0.5 && Math.abs(b.vy) < 0.5) {
            b.inAir = false;
          }
        }

        // Bird vs Block Collision
        blocksRef.current.forEach(block => {
          if (block.hp <= 0) return;
          // AABB vs Circle
          const cx = Math.max(block.x - block.w / 2, Math.min(b.x, block.x + block.w / 2));
          const cy = Math.max(block.y - block.h / 2, Math.min(b.y, block.y + block.h / 2));
          const dist = Math.hypot(b.x - cx, b.y - cy);

          if (dist < b.r) {
            const impact = Math.hypot(b.vx, b.vy);
            block.hp -= impact * 7;
            block.vx += b.vx * 0.6;
            block.vy += b.vy * 0.6 - 2;
            block.va += (Math.random() - 0.5) * 0.2;

            b.vx *= 0.35;
            b.vy *= 0.35;

            playSfx(block.type === 'tnt' ? 'tnt' : 'wood');

            if (block.type === 'tnt' && !block.exploded) {
              block.exploded = true;
              triggerTntExplosion(block.x, block.y);
            }

            // Splinters
            for (let i = 0; i < 6; i++) {
              particlesRef.current.push({
                x: cx,
                y: cy,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: block.type === 'stone' ? '#94a3b8' : block.type === 'ice' ? '#67e8f9' : '#b45309',
                size: 3,
                life: 0.7,
                maxLife: 0.7
              });
            }
          }
        });

        // Bird vs Pig Direct Hit
        pigsRef.current.forEach(p => {
          if (!p.alive) return;
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < b.r + p.r) {
            p.hp -= 2;
            b.vx *= 0.5;
            b.vy *= 0.5;
            if (p.hp <= 0) {
              p.alive = false;
              playSfx('pig');
              for (let i = 0; i < 18; i++) {
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  color: '#22c55e',
                  size: 4,
                  life: 1.0,
                  maxLife: 1.0
                });
              }
              floatingTextsRef.current.push({
                x: p.x,
                y: p.y - 10,
                text: '+5,000',
                color: '#22c55e',
                life: 1.0
              });
              setScore(s => {
                const ns = s + 5000;
                onScoreUpdate?.(ns);
                return ns;
              });
            }
          }
        });
      }

      // 2. Update Blocks Physics & Toppling
      blocksRef.current.forEach(b => {
        if (b.hp <= 0) return;
        b.vy += GRAVITY * 0.8;
        b.x += b.vx;
        b.y += b.vy;
        b.angle += b.va;
        b.vx *= 0.96;
        b.va *= 0.96;

        // Ground collision
        if (b.y + b.h / 2 >= GROUND_Y) {
          b.y = GROUND_Y - b.h / 2;
          b.vy = 0;
          b.vx *= 0.8;
          b.va *= 0.7;
        }

        // Falling block hits pigs
        pigsRef.current.forEach(p => {
          if (!p.alive) return;
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < p.r + Math.max(b.w, b.h) / 2) {
            const crushForce = Math.hypot(b.vx, b.vy);
            if (crushForce > 1.8) {
              p.hp -= 1;
              if (p.hp <= 0) {
                p.alive = false;
                playSfx('pig');
                floatingTextsRef.current.push({
                  x: p.x,
                  y: p.y - 10,
                  text: 'CRUSHED! +5,000',
                  color: '#22c55e',
                  life: 1.0
                });
                setScore(s => {
                  const ns = s + 5000;
                  onScoreUpdate?.(ns);
                  return ns;
                });
              }
            }
          }
        });
      });

      // 3. Update Pigs (fall if blocks beneath destroyed)
      pigsRef.current.forEach(p => {
        if (!p.alive) return;
        p.vy += GRAVITY * 0.9;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;

        if (p.y + p.r >= GROUND_Y) {
          p.y = GROUND_Y - p.r;
          p.vy = 0;
          p.vx *= 0.8;
        }
      });

      // 4. Update Particles & Floating Text
      particlesRef.current.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.025;
      });
      particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

      floatingTextsRef.current.forEach(ft => {
        ft.y -= 0.8;
        ft.life -= 0.02;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

      // 5. Update Trail
      birdRef.current.trail.forEach(t => {
        t.alpha -= 0.015;
      });
      birdRef.current.trail = birdRef.current.trail.filter(t => t.alpha > 0);

      // 6. Check Round Progression
      if (gameState === 'flying' && !birdRef.current.inAir) {
        settleTimerRef.current++;
        if (settleTimerRef.current > 45) {
          const allPigsDead = pigsRef.current.every(p => !p.alive);
          if (allPigsDead) {
            // Level Win!
            playSfx('win');
            confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
            const remainingBonus = birdsLeft * 10000;
            const finalScore = score + remainingBonus;
            setScore(finalScore);
            onScoreUpdate?.(finalScore);
            if (finalScore > highScore) {
              setHighScore(finalScore);
              recordGamePlay('android-angry-birds', finalScore, 30);
            }
            const starCount = birdsLeft >= 2 ? 3 : birdsLeft === 1 ? 2 : 1;
            setStars(starCount);
            setGameState('cleared');
          } else if (birdsLeft > 0) {
            // Load next bird
            birdRef.current = {
              x: SLING_X,
              y: SLING_Y,
              r: 15,
              vx: 0,
              vy: 0,
              inAir: false,
              boosted: false,
              trail: []
            };
            setGameState('aiming');
            settleTimerRef.current = 0;
          } else {
            // Out of birds
            playSfx('lose');
            onGameOver?.(score);
            setGameState('failed');
          }
        }
      }
    };

    // -------------------------------------------------------------
    // Render Functions
    // -------------------------------------------------------------
    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sky Background with Soft Sun & Clouds
      const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGradient.addColorStop(0, '#38bdf8');
      skyGradient.addColorStop(0.7, '#bae6fd');
      skyGradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Distant Hills
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(200, 480, 240, 0, Math.PI * 2);
      ctx.arc(600, 480, 260, 0, Math.PI * 2);
      ctx.fill();

      // Ground & Grass
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 14);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, GROUND_Y + 14, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y - 14);

      // Grass fringe details
      ctx.fillStyle = '#22c55e';
      for (let x = 0; x < CANVAS_WIDTH; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x + 8, GROUND_Y - 4);
        ctx.lineTo(x + 16, GROUND_Y);
        ctx.fill();
      }

      // Draw Trajectory Prediction Dots when Aiming
      if (isDraggingRef.current && gameState === 'aiming') {
        const dx = SLING_X - dragPosRef.current.x;
        const dy = SLING_Y - dragPosRef.current.y;
        let simX = SLING_X;
        let simY = SLING_Y;
        let simVx = dx * 0.22;
        let simVy = dy * 0.22;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let step = 0; step < 16; step++) {
          simX += simVx;
          simY += simVy;
          simVy += GRAVITY;
          if (simY >= GROUND_Y) break;
          ctx.beginPath();
          ctx.arc(simX, simY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Trail of Flying Bird
      birdRef.current.trail.forEach(t => {
        ctx.fillStyle = `rgba(239, 68, 68, ${t.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Back Slingshot Rubber Band
      const birdPos = isDraggingRef.current
        ? dragPosRef.current
        : { x: birdRef.current.x, y: birdRef.current.y };

      ctx.strokeStyle = '#331800';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(SLING_X - 12, SLING_Y - 30);
      ctx.lineTo(birdPos.x, birdPos.y);
      ctx.stroke();

      // Slingshot Wooden Fork Base
      ctx.fillStyle = '#854d0e';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#451a03';
      // Trunk
      ctx.fillRect(SLING_X - 6, SLING_Y - 10, 12, GROUND_Y - SLING_Y + 10);
      // Prongs
      ctx.beginPath();
      ctx.moveTo(SLING_X - 6, SLING_Y - 10);
      ctx.lineTo(SLING_X - 14, SLING_Y - 32);
      ctx.lineTo(SLING_X - 8, SLING_Y - 34);
      ctx.lineTo(SLING_X, SLING_Y - 14);
      ctx.lineTo(SLING_X + 8, SLING_Y - 34);
      ctx.lineTo(SLING_X + 14, SLING_Y - 32);
      ctx.lineTo(SLING_X + 6, SLING_Y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Destructible Blocks
      blocksRef.current.forEach(block => {
        if (block.hp <= 0) return;
        ctx.save();
        ctx.translate(block.x, block.y);
        ctx.rotate(block.angle);

        if (block.type === 'wood') {
          ctx.fillStyle = '#b45309';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
          // wood grain line
          ctx.strokeStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(-block.w / 2 + 4, 0);
          ctx.lineTo(block.w / 2 - 4, 0);
          ctx.stroke();
        } else if (block.type === 'stone') {
          ctx.fillStyle = '#64748b';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
        } else if (block.type === 'ice') {
          ctx.fillStyle = 'rgba(103, 232, 249, 0.75)';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
        } else if (block.type === 'tnt') {
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2;
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TNT', 0, 0);
        }

        ctx.restore();
      });

      // Draw Green Piggies
      pigsRef.current.forEach(p => {
        if (!p.alive) return;
        ctx.save();
        ctx.translate(p.x, p.y);

        // Body
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(-p.r * 0.7, -p.r * 0.7, p.r * 0.35, 0, Math.PI * 2);
        ctx.arc(p.r * 0.7, -p.r * 0.7, p.r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#86efac';
        ctx.strokeStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(0, 3, p.r * 0.45, p.r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nostrils
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(-p.r * 0.18, 3, 2, 0, Math.PI * 2);
        ctx.arc(p.r * 0.18, 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Googly Eyes (tracking slingshot)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-p.r * 0.35, -p.r * 0.25, 4, 0, Math.PI * 2);
        ctx.arc(p.r * 0.35, -p.r * 0.25, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-p.r * 0.35 - 1, -p.r * 0.25, 2, 0, Math.PI * 2);
        ctx.arc(p.r * 0.35 - 1, -p.r * 0.25, 2, 0, Math.PI * 2);
        ctx.fill();

        // Helmet or Crown
        if (p.type === 'helmet') {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(0, -p.r * 0.4, p.r * 0.9, Math.PI, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'king') {
          ctx.fillStyle = '#eab308';
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-p.r * 0.6, -p.r * 0.8);
          ctx.lineTo(-p.r * 0.3, -p.r * 1.3);
          ctx.lineTo(0, -p.r * 0.85);
          ctx.lineTo(p.r * 0.3, -p.r * 1.3);
          ctx.lineTo(p.r * 0.6, -p.r * 0.8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      // Front Slingshot Rubber Band
      ctx.strokeStyle = '#331800';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(SLING_X + 12, SLING_Y - 30);
      ctx.lineTo(birdPos.x, birdPos.y);
      ctx.stroke();

      // Draw Red Bird (Authentic Angry Birds Character)
      const b = birdRef.current;
      const birdDrawX = isDraggingRef.current ? dragPosRef.current.x : b.x;
      const birdDrawY = isDraggingRef.current ? dragPosRef.current.y : b.y;

      ctx.save();
      ctx.translate(birdDrawX, birdDrawY);
      if (b.inAir) {
        ctx.rotate(Math.atan2(b.vy, b.vx));
      }

      // Red round body
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cream underbelly
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, b.r * 0.25, b.r * 0.65, 0, Math.PI);
      ctx.fill();

      // Fierce Black Eyebrows
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-b.r * 0.6, -b.r * 0.35);
      ctx.lineTo(b.r * 0.6, -b.r * 0.35);
      ctx.lineTo(0, -b.r * 0.1);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-b.r * 0.25, -b.r * 0.15, 3.5, 0, Math.PI * 2);
      ctx.arc(b.r * 0.25, -b.r * 0.15, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-b.r * 0.2, -b.r * 0.15, 1.8, 0, Math.PI * 2);
      ctx.arc(b.r * 0.3, -b.r * 0.15, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Sharp Beak
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-b.r * 0.15, -b.r * 0.05);
      ctx.lineTo(b.r * 0.55, 0);
      ctx.lineTo(-b.r * 0.15, b.r * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Head Crest Feathers
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-b.r * 0.4, -b.r * 0.9, 4, 0, Math.PI * 2);
      ctx.arc(-b.r * 0.1, -b.r * 1.05, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Unused Birds Waiting in Line behind slingshot
      for (let i = 0; i < birdsLeft - (gameState === 'aiming' ? 1 : 0); i++) {
        const waitX = SLING_X - 45 - i * 26;
        const waitY = GROUND_Y - 12;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(waitX, waitY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(waitX + 6, waitY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Particles
      particlesRef.current.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Floating Texts
      floatingTextsRef.current.forEach(ft => {
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      });
    };

    const loop = () => {
      if (!running) return;
      updatePhysics();
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, birdsLeft, score, highScore, onGameOver, onScoreUpdate, playSfx, triggerTntExplosion]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-800 select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-3 text-white">
        <div className="flex items-center gap-3">
          <span className="text-xl">🐦</span>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-wide text-amber-400">
              ANGRY BIRDS CLASSIC (ANDROID)
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400">Level {level} • Pull & Release to Launch</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">{score.toLocaleString()}</span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Best</span>
            <span className="text-base font-black text-amber-400 font-mono">{highScore.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(m => !m)}
              className="p-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => initLevel(level)}
              className="p-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Restart Level"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-slate-700 bg-sky-200 shadow-inner">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Level Cleared Overlay */}
        {gameState === 'cleared' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in zoom-in duration-300">
            <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">LEVEL CLEARED!</h3>
            <p className="text-xs text-slate-300 mb-4">The bad piggies have been defeated!</p>

            {/* Stars */}
            <div className="flex gap-2 text-3xl mb-4">
              {[1, 2, 3].map(i => (
                <span key={i} className={i <= stars ? 'text-amber-400 scale-110 transition-transform' : 'text-slate-600'}>
                  ★
                </span>
              ))}
            </div>

            <p className="text-sm font-bold text-slate-200 mb-6 font-mono">
              Final Score: <span className="text-amber-400">{score.toLocaleString()}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => initLevel(level)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Replay
              </button>
              <button
                onClick={() => {
                  setLevel(l => (l < 3 ? l + 1 : 1));
                  setGameState('aiming');
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                Next Level <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Level Failed Overlay */}
        {gameState === 'failed' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-300">
            <span className="text-5xl mb-2">🐷</span>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">LEVEL FAILED</h3>
            <p className="text-xs text-slate-300 mb-4">Out of birds! The pigs survived this round.</p>
            <p className="text-sm font-bold text-slate-200 mb-6 font-mono">
              Score: <span className="text-amber-400">{score.toLocaleString()}</span>
            </p>
            <button
              onClick={() => initLevel(level)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* Touch & Controls Guide Footer */}
      <div className="w-full mt-3 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
        <span>🎯 <strong>Desktop:</strong> Click and pull back slingshot, release to launch.</span>
        <span>📱 <strong>Mobile:</strong> Touch & drag the bird, tap in flight for speed boost.</span>
      </div>
    </div>
  );
};
