import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Flame, Gauge } from 'lucide-react';

interface Drift3DGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const Drift3DGame: React.FC<Drift3DGameProps> = ({
  soundEnabled,
  onScoreUpdate,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [driftScore, setDriftScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('arcadex_drift3d_high') || '0', 10);
  });
  const [nitro, setNitro] = useState<number>(100);

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    driftScore: 0,
    multiplier: 1,
    nitro: 100,
    carPos: { x: 0, y: 0.4, z: 0 },
    carRotation: 0,
    carSpeed: 0,
    steerAngle: 0,
    isDrifting: false,
    keys: { forward: false, backward: false, left: false, right: false, nitro: false, handbrake: false },
    soundEnabled,
  });

  stateRef.current.soundEnabled = soundEnabled;

  const startGame = useCallback(() => {
    setGameState('playing');
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.driftScore = 0;
    stateRef.current.multiplier = 1;
    stateRef.current.nitro = 100;
    stateRef.current.carPos = { x: 0, y: 0.4, z: 0 };
    stateRef.current.carRotation = 0;
    stateRef.current.carSpeed = 0;
    setScore(0);
    setDriftScore(0);
    setMultiplier(1);
    setNitro(100);
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
    scene.background = new THREE.Color(0x0c0f1d);
    scene.fog = new THREE.FogExp2(0x0c0f1d, 0.012);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 600);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffd700, 2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3D Car Model Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Car Body (Cyber Supercar)
    const bodyGeo = new THREE.BoxGeometry(2, 0.7, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.85,
      roughness: 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.5;
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);

    // Car Roof / Cabin
    const roofGeo = new THREE.BoxGeometry(1.6, 0.5, 2.2);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 0.95, -0.2);
    roofMesh.castShadow = true;
    carGroup.add(roofMesh);

    // Rear Spoiler
    const spoilerWing = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.1, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    spoilerWing.position.set(0, 1.1, 1.8);
    carGroup.add(spoilerWing);

    // Headlights and Taillights
    const headLightGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const leftHead = new THREE.Mesh(headLightGeo, headLightMat);
    leftHead.position.set(-0.7, 0.5, -2.1);
    const rightHead = new THREE.Mesh(headLightGeo, headLightMat);
    rightHead.position.set(0.7, 0.5, -2.1);
    carGroup.add(leftHead);
    carGroup.add(rightHead);

    const tailLightGeo = new THREE.BoxGeometry(0.5, 0.15, 0.1);
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const leftTail = new THREE.Mesh(tailLightGeo, tailLightMat);
    leftTail.position.set(-0.7, 0.6, 2.1);
    const rightTail = new THREE.Mesh(tailLightGeo, tailLightMat);
    rightTail.position.set(0.7, 0.6, 2.1);
    carGroup.add(leftTail);
    carGroup.add(rightTail);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      [-1.05, 0.4, -1.3],
      [1.05, 0.4, -1.3],
      [-1.05, 0.4, 1.3],
      [1.05, 0.4, 1.3],
    ];

    wheelPositions.forEach((pos) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos[0], pos[1], pos[2]);
      w.castShadow = true;
      carGroup.add(w);
      wheels.push(w);
    });

    // 3D Infinite Grid Asphalt Ground
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x101426,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(1000, 100, 0x00f3ff, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Pylons & Neon Arches
    const archGroup = new THREE.Group();
    scene.add(archGroup);

    for (let i = 0; i < 40; i++) {
      const arch = new THREE.Group();
      const pillarGeo = new THREE.BoxGeometry(0.8, 6, 0.8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x004488 });
      const p1 = new THREE.Mesh(pillarGeo, pillarMat);
      p1.position.set(-15, 3, 0);
      const p2 = new THREE.Mesh(pillarGeo, pillarMat);
      p2.position.set(15, 3, 0);

      const topGeo = new THREE.BoxGeometry(31, 0.8, 0.8);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xff007f, emissive: 0x880044 });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(0, 6, 0);

      arch.add(p1);
      arch.add(p2);
      arch.add(top);
      arch.position.set((Math.random() - 0.5) * 300, 0, (Math.random() - 0.5) * 300);
      archGroup.add(arch);
    }

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') k.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') k.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = true;
      if (e.key === 'Shift') k.nitro = true;
      if (e.key === ' ') k.handbrake = true;
      if (e.key === ' ' && stateRef.current.gameState === 'menu') startGame();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') k.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') k.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') k.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') k.right = false;
      if (e.key === 'Shift') k.nitro = false;
      if (e.key === ' ') k.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;

      if (state.gameState === 'playing') {
        const k = state.keys;

        // Acceleration and Braking
        const maxSpeed = k.nitro && state.nitro > 0 ? 90 : 60;
        const accel = 35;
        const drag = 0.96;

        if (k.forward) {
          state.carSpeed += accel * delta;
        } else if (k.backward) {
          state.carSpeed -= accel * 0.6 * delta;
        } else {
          state.carSpeed *= drag;
        }

        // Nitro Drain & Refill
        if (k.nitro && state.nitro > 0 && Math.abs(state.carSpeed) > 10) {
          state.nitro = Math.max(0, state.nitro - delta * 40);
          setNitro(Math.floor(state.nitro));
        } else {
          state.nitro = Math.min(100, state.nitro + delta * 10);
          setNitro(Math.floor(state.nitro));
        }

        state.carSpeed = Math.max(-25, Math.min(maxSpeed, state.carSpeed));

        // Steering & Drift Physics
        const turnSpeed = (k.handbrake ? 2.8 : 1.8) * Math.sign(state.carSpeed || 1);
        if (k.left) {
          state.carRotation += turnSpeed * delta;
        }
        if (k.right) {
          state.carRotation -= turnSpeed * delta;
        }

        // Drifting Calculation
        const isTurning = k.left || k.right;
        const isHighSpeed = Math.abs(state.carSpeed) > 30;
        const isDrift = (isTurning && (isHighSpeed || k.handbrake));

        if (isDrift) {
          state.isDrifting = true;
          state.multiplier = Math.min(10, state.multiplier + delta * 1.5);
          state.driftScore += Math.floor(Math.abs(state.carSpeed) * state.multiplier * delta * 4);
          state.score = state.driftScore;
          setScore(state.score);
          setDriftScore(state.driftScore);
          setMultiplier(parseFloat(state.multiplier.toFixed(1)));
          onScoreUpdate?.(state.score);
        } else {
          state.isDrifting = false;
          state.multiplier = Math.max(1, state.multiplier - delta * 2);
          setMultiplier(parseFloat(state.multiplier.toFixed(1)));
        }

        // Movement Vector
        state.carPos.x += Math.sin(state.carRotation) * state.carSpeed * delta;
        state.carPos.z += Math.cos(state.carRotation) * state.carSpeed * delta;

        // Apply Position & Rotation
        carGroup.position.set(state.carPos.x, state.carPos.y, state.carPos.z);
        carGroup.rotation.y = state.carRotation;

        // Front Wheel Steering Turn Angle
        const steerVisual = k.left ? 0.4 : k.right ? -0.4 : 0;
        wheels[0].rotation.y = steerVisual;
        wheels[1].rotation.y = steerVisual;

        // Wheel Roll
        wheels.forEach((w) => {
          w.rotation.x += state.carSpeed * delta * 2;
        });

        // Smooth 3rd Person Follow Camera
        const camDistance = 12;
        const camHeight = 4.8;
        const targetCamX = state.carPos.x - Math.sin(state.carRotation) * camDistance;
        const targetCamZ = state.carPos.z - Math.cos(state.carRotation) * camDistance;

        camera.position.x += (targetCamX - camera.position.x) * 0.12;
        camera.position.y = state.carPos.y + camHeight;
        camera.position.z += (targetCamZ - camera.position.z) * 0.12;
        camera.lookAt(state.carPos.x, state.carPos.y + 1.2, state.carPos.z);
      } else {
        // Idle camera sweep in menu
        const t = time * 0.001;
        camera.position.x = Math.sin(t * 0.5) * 12;
        camera.position.z = Math.cos(t * 0.5) * 12;
        camera.position.y = 4;
        camera.lookAt(0, 0.5, 0);
      }

      renderer.render(scene, camera);
    };

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
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [startGame, onScoreUpdate]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden select-none font-sans">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-amber-500/40 rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Drift Score</div>
              <div className="text-xl font-black text-white">{score.toLocaleString()}</div>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-xs font-bold text-slate-300">BEST: {highScore.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-red-950/80 border border-red-500/30 rounded-lg text-xs font-black text-red-400 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-4 h-4 text-red-500" />
            <span>COMBO x{multiplier}</span>
          </div>

          {/* Nitro Gauge */}
          <div className="px-3 py-1.5 bg-slate-900/80 border border-cyan-500/40 rounded-xl flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Touch On-Screen Controls for Mobile */}
      {gameState === 'playing' && (
        <div className="md:hidden absolute bottom-6 left-0 right-0 px-6 flex justify-between pointer-events-auto z-10">
          <div className="flex gap-2">
            <button
              onPointerDown={() => { stateRef.current.keys.left = true; }}
              onPointerUp={() => { stateRef.current.keys.left = false; }}
              className="w-16 h-16 bg-slate-900/80 border border-cyan-500/40 rounded-2xl text-cyan-400 text-xl font-black"
            >
              ◀
            </button>
            <button
              onPointerDown={() => { stateRef.current.keys.right = true; }}
              onPointerUp={() => { stateRef.current.keys.right = false; }}
              className="w-16 h-16 bg-slate-900/80 border border-cyan-500/40 rounded-2xl text-cyan-400 text-xl font-black"
            >
              ▶
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onPointerDown={() => { stateRef.current.keys.forward = true; }}
              onPointerUp={() => { stateRef.current.keys.forward = false; }}
              className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-400 text-sm font-black"
            >
              GAS
            </button>
            <button
              onPointerDown={() => { stateRef.current.keys.handbrake = true; }}
              onPointerUp={() => { stateRef.current.keys.handbrake = false; }}
              className="w-16 h-16 bg-red-950/80 border border-red-500/40 rounded-2xl text-red-400 text-xs font-black"
            >
              DRIFT
            </button>
          </div>
        </div>
      )}

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs font-bold text-red-400 mb-3 animate-pulse">
            <Flame className="w-3.5 h-3.5" /> 3D HYPER DRIFT SIMULATOR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 tracking-tight mb-3">
            HYPER DRIFT 3D
          </h1>
          <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
            Burn rubber, pull extreme drift angles, and chain massive combos across high-speed neon cyber raceways!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-black text-base rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> RACE & DRIFT
          </button>
          <div className="mt-6 text-xs text-slate-400 font-medium">
            Controls: <span className="text-red-400 font-bold">W/A/S/D</span> or <span className="text-red-400 font-bold">Arrows</span> | <span className="text-amber-400 font-bold">Space: Handbrake Drift</span> | <span className="text-cyan-400 font-bold">Shift: Nitro</span>
          </div>
        </div>
      )}
    </div>
  );
};