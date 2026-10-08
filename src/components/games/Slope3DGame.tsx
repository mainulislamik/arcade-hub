import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Flame, Shield } from 'lucide-react';

interface Slope3DGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const Slope3DGame: React.FC<Slope3DGameProps> = ({
  soundEnabled,
  onScoreUpdate,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('arcadex_slope3d_high') || '0', 10);
  });
  const [speedLevel, setSpeedLevel] = useState<number>(1);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    speed: 45,
    ballPos: { x: 0, y: 1.2, z: 0 },
    ballVelocityX: 0,
    isGrounded: true,
    keys: { left: false, right: false },
    soundEnabled,
  });

  stateRef.current.soundEnabled = soundEnabled;

  const startGame = useCallback(() => {
    setGameState('playing');
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.speed = 45;
    stateRef.current.ballPos = { x: 0, y: 1.2, z: 0 };
    stateRef.current.ballVelocityX = 0;
    stateRef.current.isGrounded = true;
    setScore(0);
    setSpeedLevel(1);
    if (soundEnabled) sounds.playClick();
  }, [soundEnabled]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Three.js Scene Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);
    scene.fog = new THREE.FogExp2(0x0a0c16, 0.015);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
    camera.position.set(0, 4, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f3ff, 2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff007f, 3, 25);
    scene.add(pointLight);

    // 3D Player Ball (Glowing Cyber Sphere)
    const ballGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0066aa,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;
    scene.add(ball);

    // Ball inner core
    const coreGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    ball.add(core);

    // Road Tile Pool
    interface Tile {
      mesh: THREE.Mesh;
      obstacles: THREE.Mesh[];
      gems: THREE.Mesh[];
      z: number;
      width: number;
    }

    const tiles: Tile[] = [];
    const tileLength = 30;
    const numTiles = 12;
    let nextTileZ = 0;

    const tileGeo = new THREE.BoxGeometry(16, 1, tileLength);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x11162b,
      roughness: 0.4,
      metalness: 0.6,
    });

    const obsGeo = new THREE.BoxGeometry(2, 2, 2);
    const obsMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0x990033,
      roughness: 0.2,
      metalness: 0.7,
    });

    const gemGeo = new THREE.OctahedronGeometry(0.6);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xaa7700,
      roughness: 0.1,
      metalness: 0.9,
    });

    function createTile(z: number): Tile {
      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(0, -0.5, z - tileLength / 2);
      tileMesh.receiveShadow = true;
      scene.add(tileMesh);

      // Add neon edge borders
      const edgeGeo = new THREE.BoxGeometry(0.3, 1.2, tileLength);
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const leftEdge = new THREE.Mesh(edgeGeo, edgeMat);
      leftEdge.position.set(-8, 0.6, 0);
      tileMesh.add(leftEdge);

      const rightEdge = new THREE.Mesh(edgeGeo, edgeMat);
      rightEdge.position.set(8, 0.6, 0);
      tileMesh.add(rightEdge);

      const obstacles: THREE.Mesh[] = [];
      const gems: THREE.Mesh[] = [];

      // Spawn random 3D obstacles
      if (Math.abs(z) > 40) {
        const obsCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < obsCount; i++) {
          const obs = new THREE.Mesh(obsGeo, obsMat);
          const x = (Math.random() - 0.5) * 12;
          const relZ = (Math.random() - 0.5) * (tileLength - 8);
          obs.position.set(x, 1, relZ);
          obs.castShadow = true;
          tileMesh.add(obs);
          obstacles.push(obs);
        }

        // Spawn glowing gems
        if (Math.random() > 0.4) {
          const gem = new THREE.Mesh(gemGeo, gemMat);
          const gx = (Math.random() - 0.5) * 10;
          const gRelZ = (Math.random() - 0.5) * (tileLength - 8);
          gem.position.set(gx, 1.2, gRelZ);
          tileMesh.add(gem);
          gems.push(gem);
        }
      }

      return { mesh: tileMesh, obstacles, gems, z, width: 16 };
    }

    // Initialize initial runway
    for (let i = 0; i < numTiles; i++) {
      tiles.push(createTile(nextTileZ));
      nextTileZ -= tileLength;
    }

    // Particle Stars Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 1000;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 300;
      starPositions[i + 1] = Math.random() * 150 - 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 500;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.8 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = true;
      }
      if (e.key === ' ' && stateRef.current.gameState === 'menu') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Touch Controls
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const dx = e.touches[0].clientX - touchStartX;
        if (dx < -15) {
          stateRef.current.keys.left = true;
          stateRef.current.keys.right = false;
        } else if (dx > 15) {
          stateRef.current.keys.right = true;
          stateRef.current.keys.left = false;
        } else {
          stateRef.current.keys.left = false;
          stateRef.current.keys.right = false;
        }
      }
    };
    const handleTouchEnd = () => {
      stateRef.current.keys.left = false;
      stateRef.current.keys.right = false;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
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
        // Increase speed gradually
        state.speed += delta * 1.5;
        state.score += Math.floor(state.speed * delta * 2);
        setScore(state.score);
        onScoreUpdate?.(state.score);

        const currentLvl = Math.min(5, Math.floor(state.speed / 20));
        setSpeedLevel(currentLvl);

        // Lateral Movement
        const steerSpeed = 22;
        if (state.keys.left) {
          state.ballVelocityX = -steerSpeed;
        } else if (state.keys.right) {
          state.ballVelocityX = steerSpeed;
        } else {
          state.ballVelocityX *= 0.85;
        }

        state.ballPos.x += state.ballVelocityX * delta;
        state.ballPos.z -= state.speed * delta;

        // Ball Rotation
        ball.rotation.x -= state.speed * delta * 1.8;
        ball.rotation.z -= state.ballVelocityX * delta * 0.5;

        // Position Updates
        ball.position.set(state.ballPos.x, state.ballPos.y, state.ballPos.z);
        pointLight.position.set(state.ballPos.x, state.ballPos.y + 2, state.ballPos.z);

        // Smooth Camera Follow
        camera.position.x += (state.ballPos.x * 0.6 - camera.position.x) * 0.1;
        camera.position.y = state.ballPos.y + 3.2;
        camera.position.z = state.ballPos.z + 6.5;
        camera.lookAt(state.ballPos.x * 0.3, state.ballPos.y + 0.5, state.ballPos.z - 12);

        // Fall Off Edge Check
        if (Math.abs(state.ballPos.x) > 8.2) {
          state.ballPos.y -= 30 * delta;
          if (state.ballPos.y < -15) {
            triggerGameOver();
          }
        }

        // Tile Management & Collision Detection
        for (const tile of tiles) {
          // Recycle tiles
          if (tile.mesh.position.z > state.ballPos.z + tileLength + 10) {
            tile.mesh.position.z = nextTileZ - tileLength / 2;
            tile.z = nextTileZ;
            nextTileZ -= tileLength;

            // Reposition obstacles
            for (const obs of tile.obstacles) {
              obs.position.x = (Math.random() - 0.5) * 12;
              obs.position.z = (Math.random() - 0.5) * (tileLength - 8);
              obs.visible = true;
            }
            for (const gem of tile.gems) {
              gem.position.x = (Math.random() - 0.5) * 10;
              gem.position.z = (Math.random() - 0.5) * (tileLength - 8);
              gem.visible = true;
            }
          }

          // Obstacle Hit Test
          const tileWorldZ = tile.mesh.position.z;
          if (Math.abs(tileWorldZ - state.ballPos.z) < tileLength) {
            for (const obs of tile.obstacles) {
              if (!obs.visible) continue;
              const obsWorldX = tile.mesh.position.x + obs.position.x;
              const obsWorldZ = tile.mesh.position.z + obs.position.z;

              const dx = obsWorldX - state.ballPos.x;
              const dz = obsWorldZ - state.ballPos.z;
              const dist = Math.sqrt(dx * dx + dz * dz);

              if (dist < 1.6 && state.ballPos.y < 2) {
                triggerGameOver();
                break;
              }
            }

            // Gem Collection Test
            for (const gem of tile.gems) {
              if (!gem.visible) continue;
              gem.rotation.y += delta * 3;
              const gemWorldX = tile.mesh.position.x + gem.position.x;
              const gemWorldZ = tile.mesh.position.z + gem.position.z;

              const dx = gemWorldX - state.ballPos.x;
              const dz = gemWorldZ - state.ballPos.z;
              const dist = Math.sqrt(dx * dx + dz * dz);

              if (dist < 1.6) {
                gem.visible = false;
                state.score += 250;
                setScore(state.score);
                if (state.soundEnabled) sounds.playCoin();
              }
            }
          }
        }
      } else {
        // Idle animation in menu
        ball.rotation.y += delta * 0.8;
        ball.position.set(0, 1.2, 0);
        camera.position.set(0, 4, 7);
        camera.lookAt(0, 1, 0);
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

      const savedHigh = parseInt(localStorage.getItem('arcadex_slope3d_high') || '0', 10);
      if (finalScore > savedHigh) {
        localStorage.setItem('arcadex_slope3d_high', finalScore.toString());
        setHighScore(finalScore);
      }
    }

    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
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
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, [startGame, onScoreUpdate, onGameOver]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas Container */}
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

          <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-xs font-bold text-slate-300">BEST: {highScore.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-xs font-black text-cyan-400 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D WEBGL</span>
          </div>
          <div className="px-3 py-1.5 bg-pink-950/80 border border-pink-500/30 rounded-lg text-xs font-black text-pink-400 shadow-sm">
            SPEED x{speedLevel}
          </div>
        </div>
      </div>

      {/* Touch On-Screen Controls for Mobile */}
      {gameState === 'playing' && (
        <div className="md:hidden absolute bottom-6 left-0 right-0 px-6 flex justify-between pointer-events-auto z-10">
          <button
            onPointerDown={() => { stateRef.current.keys.left = true; }}
            onPointerUp={() => { stateRef.current.keys.left = false; }}
            onPointerLeave={() => { stateRef.current.keys.left = false; }}
            className="w-20 h-20 bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center text-cyan-400 text-2xl font-black active:scale-95 shadow-xl shadow-cyan-500/20"
          >
            ◀
          </button>
          <button
            onPointerDown={() => { stateRef.current.keys.right = true; }}
            onPointerUp={() => { stateRef.current.keys.right = false; }}
            onPointerLeave={() => { stateRef.current.keys.right = false; }}
            className="w-20 h-20 bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center text-cyan-400 text-2xl font-black active:scale-95 shadow-xl shadow-cyan-500/20"
          >
            ▶
          </button>
        </div>
      )}

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> 3D HARDWARE-ACCELERATED
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-500 tracking-tight mb-3">
            CYBER SLOPE 3D
          </h1>
          <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
            Roll the high-speed cyber ball down endless 3D neon platforms. Dodge red cubes and collect golden gems!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> PLAY NOW
          </button>
          <div className="mt-6 text-xs text-slate-400 font-medium">
            Controls: <span className="text-cyan-400 font-bold">A/D</span> or <span className="text-cyan-400 font-bold">Arrow Keys</span> / Swipe Left & Right
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center justify-center text-pink-400 mb-3 shadow-lg shadow-pink-500/20">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">RUN COMPLETED!</h2>
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-4">You tumbled into the void</div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Score</div>
              <div className="text-2xl font-black text-cyan-400">{score.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Best</div>
              <div className="text-2xl font-black text-amber-400">{highScore.toLocaleString()}</div>
            </div>
          </div>

          <button
            onClick={restartGame}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-base rounded-xl shadow-lg shadow-pink-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};