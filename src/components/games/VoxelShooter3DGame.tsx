import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Flame, Shield, Crosshair } from 'lucide-react';

interface VoxelShooter3DGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const VoxelShooter3DGame: React.FC<VoxelShooter3DGameProps> = ({
  soundEnabled,
  onScoreUpdate,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [ammo, setAmmo] = useState<number>(20);
  const [health, setHealth] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('arcadex_voxel3d_high') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    ammo: 20,
    health: 100,
    wave: 1,
    isReloading: false,
    soundEnabled,
  });

  stateRef.current.soundEnabled = soundEnabled;

  const startGame = useCallback(() => {
    setGameState('playing');
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.ammo = 20;
    stateRef.current.health = 100;
    stateRef.current.wave = 1;
    stateRef.current.isReloading = false;
    setScore(0);
    setAmmo(20);
    setHealth(100);
    setWave(1);
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
    scene.background = new THREE.Color(0x050814);
    scene.fog = new THREE.FogExp2(0x050814, 0.015);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 300);
    camera.position.set(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x112233, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0x00f3ff, 2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3D Arena Ground
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(120, 30, 0x00f3ff, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);

    // Arena Perimeter Columns
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const colGeo = new THREE.BoxGeometry(2, 10, 2);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x002244 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(Math.cos(angle) * 50, 5, Math.sin(angle) * 50);
      scene.add(col);
    }

    // 3D Gun Viewmodel
    const gunGroup = new THREE.Group();
    camera.add(gunGroup);
    scene.add(camera);

    const gunGeo = new THREE.BoxGeometry(0.3, 0.4, 1.2);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.4, -0.35, -0.8);
    gunGroup.add(gun);

    const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0.4, -0.3, -1.4);
    gunGroup.add(barrel);

    // 3D Voxel Drone Targets
    interface VoxelDrone {
      mesh: THREE.Group;
      health: number;
      speed: number;
    }

    const drones: VoxelDrone[] = [];
    const droneGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x990022, roughness: 0.3 });

    function spawnDrone(): VoxelDrone {
      const drone = new THREE.Group();
      const body = new THREE.Mesh(droneGeo, droneMat);
      body.castShadow = true;
      drone.add(body);

      // Eye
      const eyeGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0, 0.6);
      drone.add(eye);

      // Random position outside
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      drone.position.set(Math.cos(angle) * dist, 1.5 + Math.random() * 4, Math.sin(angle) * dist);
      scene.add(drone);

      return { mesh: drone, health: 1, speed: 4 + Math.random() * 3 };
    }

    for (let i = 0; i < 8; i++) {
      drones.push(spawnDrone());
    }

    // Raycaster for shooting
    const raycaster = new THREE.Raycaster();
    const centerPoint = new THREE.Vector2(0, 0);

    // Mouse Look
    let isPointerLocked = false;
    let yaw = 0;
    let pitch = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === container) {
        yaw -= e.movementX * 0.0025;
        pitch -= e.movementY * 0.0025;
        pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch));

        camera.rotation.set(0, 0, 0);
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
      }
    };

    // Shoot Action
    const shoot = () => {
      const state = stateRef.current;
      if (state.gameState !== 'playing' || state.isReloading) return;

      if (state.ammo <= 0) {
        reload();
        return;
      }

      state.ammo -= 1;
      setAmmo(state.ammo);

      // Recoil
      gun.position.z += 0.15;
      setTimeout(() => { gun.position.z = -0.8; }, 60);

      if (state.soundEnabled) sounds.playLaser();

      // Hitscan Raycast
      raycaster.setFromCamera(centerPoint, camera);
      const droneMeshes = drones.map((d) => d.mesh.children[0]);
      const intersects = raycaster.intersectObjects(droneMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const droneIndex = drones.findIndex((d) => d.mesh.children[0] === hitMesh);

        if (droneIndex !== -1) {
          const drone = drones[droneIndex];
          scene.remove(drone.mesh);
          drones.splice(droneIndex, 1);

          state.score += 200;
          setScore(state.score);
          onScoreUpdate?.(state.score);

          if (state.soundEnabled) sounds.playExplosion();

          // Spawn new drone
          setTimeout(() => {
            if (stateRef.current.gameState === 'playing') {
              drones.push(spawnDrone());
            }
          }, 1000);
        }
      }
    };

    const reload = () => {
      const state = stateRef.current;
      if (state.isReloading || state.ammo >= 20) return;

      state.isReloading = true;
      if (state.soundEnabled) sounds.playClick();

      setTimeout(() => {
        state.ammo = 20;
        state.isReloading = false;
        setAmmo(20);
      }, 1000);
    };

    const handleClick = () => {
      if (stateRef.current.gameState === 'menu') {
        container.requestPointerLock?.();
        startGame();
      } else if (document.pointerLockElement !== container) {
        container.requestPointerLock?.();
      } else {
        shoot();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') reload();
      if (e.key === ' ' && stateRef.current.gameState === 'menu') {
        container.requestPointerLock?.();
        startGame();
      }
    };

    container.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;

      if (state.gameState === 'playing') {
        // Move drones toward player
        drones.forEach((drone) => {
          const dx = camera.position.x - drone.mesh.position.x;
          const dz = camera.position.z - drone.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          drone.mesh.lookAt(camera.position);

          if (dist > 2) {
            drone.mesh.position.x += (dx / dist) * drone.speed * delta;
            drone.mesh.position.z += (dz / dist) * drone.speed * delta;
          } else {
            // Attack player
            state.health -= delta * 25;
            setHealth(Math.max(0, Math.floor(state.health)));

            if (state.health <= 0) {
              triggerGameOver();
            }
          }

          // Drone floating hover
          drone.mesh.position.y += Math.sin(time * 0.004 + drone.mesh.position.x) * 0.02;
        });
      } else {
        camera.rotation.y += delta * 0.2;
      }

      renderer.render(scene, camera);
    };

    function triggerGameOver() {
      if (stateRef.current.gameState === 'gameover') return;
      stateRef.current.gameState = 'gameover';
      setGameState('gameover');
      document.exitPointerLock?.();
      if (stateRef.current.soundEnabled) sounds.playGameOver();

      const finalScore = stateRef.current.score;
      onGameOver?.(finalScore);

      const savedHigh = parseInt(localStorage.getItem('arcadex_voxel3d_high') || '0', 10);
      if (finalScore > savedHigh) {
        localStorage.setItem('arcadex_voxel3d_high', finalScore.toString());
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      document.exitPointerLock?.();
      renderer.dispose();
    };
  }, [startGame, onScoreUpdate, onGameOver]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden select-none font-sans">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-crosshair" />

      {/* Center Crosshair */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-6 h-6 border border-cyan-400/80 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
          </div>
        </div>
      )}

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

          <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-red-500/40 rounded-xl flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Health</div>
              <div className="text-sm font-black text-red-400">{health}%</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-slate-900/80 border border-cyan-500/40 rounded-xl flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <div className="text-sm font-black text-cyan-300">{ammo} / 20</div>
            <div className="text-[10px] text-slate-400 font-bold ml-1">(R: RELOAD)</div>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 mb-3 animate-pulse">
            <Crosshair className="w-3.5 h-3.5" /> 3D VOXEL FPS ARENA
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-500 tracking-tight mb-3">
            VOXEL STRIKE 3D
          </h1>
          <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
            Eliminate attacking voxel combat drones in a hardware-accelerated 3D cyber arena with raycast targeting!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> ENTER ARENA
          </button>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-500/20">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">ARENA OVERRUN!</h2>
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-4">Voxel drones depleted your shields</div>

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
            className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-base rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> RE-ENTER ARENA
          </button>
        </div>
      )}
    </div>
  );
};