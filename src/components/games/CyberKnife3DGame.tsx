import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEngine';
import { Play, RotateCcw, Trophy, Zap, Sparkles, Flame, Shield, Target } from 'lucide-react';

interface CyberKnife3DGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export const CyberKnife3DGame: React.FC<CyberKnife3DGameProps> = ({
  soundEnabled,
  onScoreUpdate,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [stage, setStage] = useState<number>(1);
  const [knivesLeft, setKnivesLeft] = useState<number>(7);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('arcadex_knife3d_high') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    score: 0,
    stage: 1,
    knivesLeft: 7,
    targetRotation: 0,
    targetSpeed: 1.8,
    isThrowing: false,
    activeKnifePos: { y: -5, z: 0 },
    soundEnabled,
  });

  stateRef.current.soundEnabled = soundEnabled;

  const startGame = useCallback(() => {
    setGameState('playing');
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.stage = 1;
    stateRef.current.knivesLeft = 7;
    stateRef.current.targetSpeed = 1.8;
    setScore(0);
    setStage(1);
    setKnivesLeft(7);
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
    scene.background = new THREE.Color(0x0a0c16);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222244, 1.2);
    scene.add(hemiLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 3, 20);
    pointLight.position.set(0, 2, 8);
    scene.add(pointLight);

    // 3D Target Wheel Group
    const targetGroup = new THREE.Group();
    targetGroup.position.set(0, 2.5, 0);
    scene.add(targetGroup);

    // Wheel Mesh (Cybernetic Neon Core)
    const wheelGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.8, 32);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
    targetGroup.add(wheelMesh);

    // Wheel Rim
    const rimGeo = new THREE.TorusGeometry(2.45, 0.1, 16, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    targetGroup.add(rimMesh);

    // Embedded Knives on Target
    interface EmbeddedKnife {
      angle: number;
      mesh: THREE.Group;
    }
    const embeddedKnives: EmbeddedKnife[] = [];

    function createKnifeMesh(): THREE.Group {
      const knife = new THREE.Group();

      // Blade
      const bladeGeo = new THREE.ConeGeometry(0.2, 1.6, 4);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1,
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 0.8;
      knife.add(blade);

      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = -0.4;
      knife.add(handle);

      // Guard
      const guardGeo = new THREE.BoxGeometry(0.6, 0.1, 0.2);
      const guardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      const guard = new THREE.Mesh(guardGeo, guardMat);
      knife.add(guard);

      return knife;
    }

    // Ready-to-throw active knife
    const readyKnife = createKnifeMesh();
    readyKnife.position.set(0, -4.5, 0);
    scene.add(readyKnife);

    // Throw Knife Action
    const throwKnife = () => {
      const state = stateRef.current;
      if (state.gameState !== 'playing' || state.isThrowing || state.knivesLeft <= 0) return;

      state.isThrowing = true;
      if (state.soundEnabled) sounds.playLaser();
    };

    const handlePointerDown = () => {
      throwKnife();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (stateRef.current.gameState === 'menu') {
          startGame();
        } else {
          throwKnife();
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    // Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;

      if (state.gameState === 'playing') {
        // Rotate Target Wheel (with dynamic speed variation)
        targetGroup.rotation.z += state.targetSpeed * delta;
        state.targetRotation = targetGroup.rotation.z;

        // Throw Animation
        if (state.isThrowing) {
          readyKnife.position.y += 45 * delta;

          // Check Hit on Target
          if (readyKnife.position.y >= 0.1) {
            // Hit the wheel!
            const hitAngle = (-targetGroup.rotation.z - Math.PI / 2) % (Math.PI * 2);
            const normalizedAngle = (hitAngle + Math.PI * 4) % (Math.PI * 2);

            // Check Collision with existing embedded knives
            let hitExisting = false;
            for (const k of embeddedKnives) {
              const diff = Math.abs(k.angle - normalizedAngle);
              const angleDist = Math.min(diff, Math.PI * 2 - diff);
              if (angleDist < 0.25) {
                hitExisting = true;
                break;
              }
            }

            if (hitExisting) {
              // Deflect Knife & Game Over
              readyKnife.rotation.z += 2;
              readyKnife.position.y -= 5 * delta;
              readyKnife.position.x += 10 * delta;
              triggerGameOver();
            } else {
              // Successful Stick
              const stuckKnife = createKnifeMesh();
              stuckKnife.position.set(
                Math.cos(normalizedAngle) * 2.4,
                Math.sin(normalizedAngle) * 2.4,
                0
              );
              stuckKnife.rotation.z = normalizedAngle - Math.PI / 2;
              targetGroup.add(stuckKnife);
              embeddedKnives.push({ angle: normalizedAngle, mesh: stuckKnife });

              state.score += 100;
              state.knivesLeft -= 1;
              setScore(state.score);
              setKnivesLeft(state.knivesLeft);
              onScoreUpdate?.(state.score);

              if (state.soundEnabled) sounds.playCoin();

              // Reset ready knife
              readyKnife.position.set(0, -4.5, 0);
              state.isThrowing = false;

              // Check Stage Clear
              if (state.knivesLeft <= 0) {
                // Clear Stage!
                state.stage += 1;
                state.knivesLeft = 7 + Math.min(5, state.stage);
                state.targetSpeed = (Math.random() > 0.5 ? 1 : -1) * (1.8 + state.stage * 0.4);
                setStage(state.stage);
                setKnivesLeft(state.knivesLeft);

                // Clear embedded knives from previous stage
                embeddedKnives.forEach((k) => targetGroup.remove(k.mesh));
                embeddedKnives.length = 0;

                if (state.soundEnabled) sounds.playVictory();
              }
            }
          }
        }
      } else {
        targetGroup.rotation.z += 0.8 * delta;
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

      const savedHigh = parseInt(localStorage.getItem('arcadex_knife3d_high') || '0', 10);
      if (finalScore > savedHigh) {
        localStorage.setItem('arcadex_knife3d_high', finalScore.toString());
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
      container.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
    };
  }, [startGame, onScoreUpdate, onGameOver]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden select-none font-sans">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-pointer" />

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
            <div className="text-xs font-bold text-slate-300">STAGE {stage}</div>
          </div>
        </div>

        {/* Remaining Knives Icons */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-6 rounded-full transition-all duration-150 ${
                i < knivesLeft
                  ? 'bg-gradient-to-t from-red-500 to-amber-400 shadow-sm shadow-red-500/50'
                  : 'bg-slate-800/40 opacity-30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Click / Tap Prompt */}
      {gameState === 'playing' && (
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10">
          <div className="inline-block px-4 py-1.5 bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 animate-bounce">
            TAP SCREEN OR SPACE TO THROW
          </div>
        </div>
      )}

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 mb-3 animate-pulse">
            <Target className="w-3.5 h-3.5" /> 3D TARGET HIT SIMULATOR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 tracking-tight mb-3">
            CYBER KNIFE 3D
          </h1>
          <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
            Throw sharp cyber blades into the rotating core. Hit the gaps and never strike an existing blade!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-black text-base rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> START THROWING
          </button>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-500/20">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">BLADE DEFLECTED!</h2>
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-4">You struck another blade</div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Score</div>
              <div className="text-2xl font-black text-cyan-400">{score.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Stage</div>
              <div className="text-2xl font-black text-amber-400">{stage}</div>
            </div>
          </div>

          <button
            onClick={restartGame}
            className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-base rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> RETRY STAGE
          </button>
        </div>
      )}
    </div>
  );
};