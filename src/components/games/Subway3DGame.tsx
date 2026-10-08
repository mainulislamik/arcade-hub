import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Heart, Shield, Flame } from 'lucide-react';

interface Subway3DGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const Subway3DGame: React.FC<Subway3DGameProps> = ({
  soundEnabled,
  onScoreUpdate,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('arcadex_subway3d_high') || '0', 10);
  });
  const [hoverboardActive, setHoverboardActive] = useState<boolean>(false);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    coins: 0,
    speed: 38,
    lane: 0, // -1: Left, 0: Center, 1: Right
    playerX: 0,
    playerY: 0,
    playerZ: 0,
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    hasHoverboard: false,
    hoverboardTimer: 0,
    soundEnabled,
  });

  stateRef.current.soundEnabled = soundEnabled;

  const startGame = useCallback(() => {
    setGameState('playing');
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.coins = 0;
    stateRef.current.speed = 38;
    stateRef.current.lane = 0;
    stateRef.current.playerX = 0;
    stateRef.current.playerY = 0;
    stateRef.current.playerZ = 0;
    stateRef.current.velocityY = 0;
    stateRef.current.isJumping = false;
    stateRef.current.isSliding = false;
    stateRef.current.hasHoverboard = false;
    setScore(0);
    setCoins(0);
    setHoverboardActive(false);
    if (soundEnabled) sounds.playClick();
  }, [soundEnabled]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1726);
    scene.fog = new THREE.FogExp2(0x0e1726, 0.01);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);
    camera.position.set(0, 4.5, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334466, 1.4);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2);
    dirLight.position.set(15, 30, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3D Player Runner Group
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Runner Body
    const bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
    );
    bodyMesh.position.y = 1.1;
    bodyMesh.castShadow = true;
    playerGroup.add(bodyMesh);

    // Runner Head
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 })
    );
    headMesh.position.y = 2.0;
    headMesh.castShadow = true;
    playerGroup.add(headMesh);

    // 3D Hoverboard (when active)
    const hoverboardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, roughness: 0.2 })
    );
    hoverboardMesh.position.y = 0.1;
    hoverboardMesh.visible = false;
    playerGroup.add(hoverboardMesh);

    // 3 Lanes X coordinates
    const laneWidth = 4.2;
    const laneX = [-laneWidth, 0, laneWidth];

    // Subway Tracks & Ground
    const groundGeo = new THREE.PlaneGeometry(30, 800);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 3-Lane Rails
    [-laneWidth, 0, laneWidth].forEach((lx) => {
      const rail1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 800),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
      );
      rail1.position.set(lx - 1.0, 0.1, -200);
      scene.add(rail1);

      const rail2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 800),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
      );
      rail2.position.set(lx + 1.0, 0.1, -200);
      scene.add(rail2);
    });

    // Obstacle & Train Pool
    interface ObstacleItem {
      type: 'train' | 'barrier_high' | 'barrier_low' | 'coin';
      mesh: THREE.Object3D;
      lane: number;
      z: number;
      active: boolean;
    }

    const obstacles: ObstacleItem[] = [];

    // Helper to create 3D Train
    function createTrainMesh(): THREE.Group {
      const train = new THREE.Group();
      const tBody = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 3.5, 18),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.3 })
      );
      tBody.position.y = 1.75;
      tBody.castShadow = true;
      tBody.receiveShadow = true;
      train.add(tBody);

      // Train Front Lights
      const light1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      light1.position.set(-1.0, 2.5, 9.1);
      const light2 = light1.clone();
      light2.position.x = 1.0;
      train.add(light1);
      train.add(light2);

      return train;
    }

    // Helper to create 3D Barrier
    function createBarrierMesh(high: boolean): THREE.Group {
      const bar = new THREE.Group();
      const postMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, high ? 2.8 : 1.2), postMat);
      p1.position.set(-1.4, high ? 1.4 : 0.6, 0);
      const p2 = p1.clone();
      p2.position.x = 1.4;

      const beamMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 0.3), beamMat);
      beam.position.y = high ? 2.5 : 1.0;

      bar.add(p1);
      bar.add(p2);
      bar.add(beam);
      return bar;
    }

    // Helper to create 3D Spinning Coin
    function createCoinMesh(): THREE.Mesh {
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1, emissive: 0xb45309 })
      );
      coin.rotation.z = Math.PI / 2;
      coin.castShadow = true;
      return coin;
    }

    // Spawn Initial Obstacles
    let nextZ = -40;
    for (let i = 0; i < 25; i++) {
      const lane = Math.floor(Math.random() * 3) - 1;
      const typeRand = Math.random();

      if (typeRand < 0.4) {
        // Train
        const train = createTrainMesh();
        train.position.set(laneX[lane + 1], 0, nextZ);
        scene.add(train);
        obstacles.push({ type: 'train', mesh: train, lane, z: nextZ, active: true });
        nextZ -= 35;
      } else if (typeRand < 0.7) {
        // Barrier
        const isHigh = Math.random() > 0.5;
        const bar = createBarrierMesh(isHigh);
        bar.position.set(laneX[lane + 1], 0, nextZ);
        scene.add(bar);
        obstacles.push({
          type: isHigh ? 'barrier_high' : 'barrier_low',
          mesh: bar,
          lane,
          z: nextZ,
          active: true,
        });
        nextZ -= 20;
      } else {
        // Coin Run
        for (let c = 0; c < 4; c++) {
          const coin = createCoinMesh();
          coin.position.set(laneX[lane + 1], 1.2, nextZ - c * 4);
          scene.add(coin);
          obstacles.push({ type: 'coin', mesh: coin, lane, z: nextZ - c * 4, active: true });
        }
        nextZ -= 24;
      }
    }

    // Controls
    const changeLane = (dir: number) => {
      const state = stateRef.current;
      const newLane = Math.max(-1, Math.min(1, state.lane + dir));
      if (newLane !== state.lane) {
        state.lane = newLane;
        if (state.soundEnabled) sounds.playLaser();
      }
    };

    const jump = () => {
      const state = stateRef.current;
      if (!state.isJumping) {
        state.isJumping = true;
        state.velocityY = 18;
        if (state.soundEnabled) sounds.playJump();
      }
    };

    const slide = () => {
      const state = stateRef.current;
      if (state.isJumping) {
        state.velocityY = -25; // Fast slam down
      }
      state.isSliding = true;
      state.slideTimer = 0.8;
      if (state.soundEnabled) sounds.playLaser();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeLane(-1);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeLane(1);
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') jump();
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') slide();
      if (e.key === ' ' && stateRef.current.gameState === 'menu') startGame();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Touch Swipe
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx < -30) changeLane(-1);
          if (dx > 30) changeLane(1);
        } else {
          if (dy < -30) jump();
          if (dy > 30) slide();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    // Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;

      if (state.gameState === 'playing') {
        state.speed += delta * 0.8;
        state.score += Math.floor(state.speed * delta * 2);
        setScore(state.score);
        onScoreUpdate?.(state.score);

        // Smooth Lane Transition
        const targetX = laneX[state.lane + 1];
        state.playerX += (targetX - state.playerX) * 15 * delta;

        // Jump & Slide Physics
        if (state.isJumping) {
          state.playerY += state.velocityY * delta;
          state.velocityY -= 45 * delta;
          if (state.playerY <= 0) {
            state.playerY = 0;
            state.isJumping = false;
            state.velocityY = 0;
          }
        }

        if (state.isSliding) {
          state.slideTimer -= delta;
          bodyMesh.scale.set(1, 0.4, 1.4);
          bodyMesh.position.y = 0.3;
          headMesh.position.y = 0.8;
          if (state.slideTimer <= 0) {
            state.isSliding = false;
            bodyMesh.scale.set(1, 1, 1);
            bodyMesh.position.y = 1.1;
            headMesh.position.y = 2.0;
          }
        }

        state.playerZ -= state.speed * delta;

        // Running Bobbing
        if (!state.isJumping && !state.isSliding) {
          playerGroup.position.y = Math.sin(time * 0.02) * 0.1;
        } else {
          playerGroup.position.y = state.playerY;
        }

        playerGroup.position.x = state.playerX;
        playerGroup.position.z = state.playerZ;

        // Camera Follow
        camera.position.x += (state.playerX * 0.5 - camera.position.x) * 0.1;
        camera.position.y = state.playerY + 4.2;
        camera.position.z = state.playerZ + 7.5;
        camera.lookAt(state.playerX * 0.2, state.playerY + 1.5, state.playerZ - 10);

        // Ground Infinite Track Loop
        ground.position.z = state.playerZ - 100;

        // Obstacle Collisions & Recycling
        for (const obs of obstacles) {
          // Recycle
          if (obs.mesh.position.z > state.playerZ + 15) {
            obs.z = state.playerZ - 180 - Math.random() * 40;
            obs.mesh.position.z = obs.z;
            obs.lane = Math.floor(Math.random() * 3) - 1;
            obs.mesh.position.x = laneX[obs.lane + 1];
            obs.active = true;
            obs.mesh.visible = true;
          }

          if (obs.type === 'coin') {
            obs.mesh.rotation.y += delta * 4;
          }

          // Hit Test
          const dz = obs.mesh.position.z - state.playerZ;
          const isSameLane = Math.abs(obs.mesh.position.x - state.playerX) < 1.6;

          if (isSameLane && obs.active && Math.abs(dz) < 1.8) {
            if (obs.type === 'coin') {
              obs.active = false;
              obs.mesh.visible = false;
              state.coins += 1;
              state.score += 150;
              setCoins(state.coins);
              setScore(state.score);
              if (state.soundEnabled) sounds.playCoin();
            } else if (obs.type === 'train') {
              if (state.playerY < 3.2) {
                triggerGameOver();
              }
            } else if (obs.type === 'barrier_low') {
              if (state.playerY < 1.4) {
                triggerGameOver();
              }
            } else if (obs.type === 'barrier_high') {
              if (!state.isSliding) {
                triggerGameOver();
              }
            }
          }
        }
      } else {
        // Menu animation
        playerGroup.position.set(0, 0, 0);
        camera.position.set(0, 4, 7);
        camera.lookAt(0, 1.2, 0);
      }

      renderer.render(scene, camera);
    };

    function triggerGameOver() {
      if (stateRef.current.gameState === 'gameover') return;
      stateRef.current.gameState = 'gameover';
      setGameState('gameover');
      if (stateRef.current.soundEnabled) sounds.playGameOver();

      const finalScore = stateRef.current.score;
      onGameOver?.(finalScore);

      const savedHigh = parseInt(localStorage.getItem('arcadex_subway3d_high') || '0', 10);
      if (finalScore > savedHigh) {
        localStorage.setItem('arcadex_subway3d_high', finalScore.toString());
        setHighScore(finalScore);
      }
    }

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, [startGame, onScoreUpdate, onGameOver]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden select-none font-sans">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-lg shadow-cyan-500/10 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</div>
              <div className="text-xl font-black text-white">{score.toLocaleString()}</div>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-amber-500/40 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Coins</div>
              <div className="text-sm font-black text-amber-300">{coins}</div>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-blue-950/80 border border-blue-500/30 rounded-lg text-xs font-black text-blue-400 shadow-sm flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>3D RUNNER ENGINE</span>
        </div>
      </div>

      {/* Mobile Touch Controls */}
      {gameState === 'playing' && (
        <div className="md:hidden absolute bottom-6 left-0 right-0 px-6 flex justify-between pointer-events-auto z-10">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const s = stateRef.current;
                s.lane = Math.max(-1, s.lane - 1);
              }}
              className="w-16 h-16 bg-slate-900/80 border border-cyan-500/40 rounded-2xl text-cyan-400 text-xl font-black"
            >
              ◀
            </button>
            <button
              onClick={() => {
                const s = stateRef.current;
                s.lane = Math.min(1, s.lane + 1);
              }}
              className="w-16 h-16 bg-slate-900/80 border border-cyan-500/40 rounded-2xl text-cyan-400 text-xl font-black"
            >
              ▶
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const s = stateRef.current;
                if (!s.isJumping) {
                  s.isJumping = true;
                  s.velocityY = 18;
                  if (s.soundEnabled) sounds.playJump();
                }
              }}
              className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-400 text-sm font-black"
            >
              JUMP
            </button>
            <button
              onClick={() => {
                const s = stateRef.current;
                s.isSliding = true;
                s.slideTimer = 0.8;
                if (s.soundEnabled) sounds.playLaser();
              }}
              className="w-16 h-16 bg-blue-950/80 border border-blue-500/40 rounded-2xl text-blue-400 text-sm font-black"
            >
              SLIDE
            </button>
          </div>
        </div>
      )}

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> 3D PLAY STORE HIT RUNNER
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 tracking-tight mb-3">
            SUBWAY RUNNER 3D
          </h1>
          <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
            Sprint across 3D subway rails, jump over barriers, slide under signs, and dodge oncoming high-speed red trains!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> SPRINT NOW
          </button>
          <div className="mt-6 text-xs text-slate-400 font-medium">
            Controls: <span className="text-cyan-400 font-bold">A/D</span> or <span className="text-cyan-400 font-bold">Left/Right: Lane Switch</span> | <span className="text-emerald-400 font-bold">W/Up/Space: Jump</span> | <span className="text-blue-400 font-bold">S/Down: Slide</span>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-500/20">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">RUN TERMINATED!</h2>
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-4">Caught by the subway security</div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Score</div>
              <div className="text-2xl font-black text-cyan-400">{score.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Coins</div>
              <div className="text-2xl font-black text-amber-400">{coins}</div>
            </div>
          </div>

          <button
            onClick={restartGame}
            className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-base rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};