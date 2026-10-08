import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCw, Palette, Layers, Play, Zap, Shield, Trophy } from 'lucide-react';
import { sounds } from '../utils/soundEngine';

interface Arcade3DHeroProps {
  onExploreGames: () => void;
  onPlayRandom: () => void;
  totalGames: number;
}

export const Arcade3DHero: React.FC<Arcade3DHeroProps> = ({
  onExploreGames,
  onPlayRandom,
  totalGames,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [colorSchemeIndex, setColorSchemeIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeModelType, setActiveModelType] = useState<'cabinet' | 'controller'>('cabinet');

  const colorSchemes = [
    { name: 'Cyber Indigo', primary: 0x6366f1, accent: 0x06b6d4, emissive: 0x4338ca },
    { name: 'Emerald Volt', primary: 0x10b981, accent: 0x3b82f6, emissive: 0x047857 },
    { name: 'Neon Coral', primary: 0xf43f5e, accent: 0xf59e0b, emissive: 0xbe123c },
    { name: 'Royal Purple', primary: 0x8b5cf6, accent: 0xec4899, emissive: 0x6d28d9 },
  ];

  const sceneState = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mainGroup: THREE.Group | null;
    materials: THREE.Material[];
    targetRotation: { x: number; y: number };
    currentRotation: { x: number; y: number };
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mainGroup: null,
    materials: [],
    targetRotation: { x: 0.15, y: -0.3 },
    currentRotation: { x: 0.15, y: -0.3 },
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneState.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9.5);
    sceneState.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    sceneState.current.renderer = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const pointLight = new THREE.PointLight(colorSchemes[colorSchemeIndex].primary, 3, 20);
    pointLight.position.set(-4, -2, 5);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(colorSchemes[colorSchemeIndex].accent, 2.5, 15);
    rimLight.position.set(4, -4, -3);
    scene.add(rimLight);

    // 5. Main 3D Models Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    sceneState.current.mainGroup = mainGroup;

    const materials: THREE.Material[] = [];
    sceneState.current.materials = materials;

    const curColor = colorSchemes[colorSchemeIndex];

    // Build Procedural 3D Arcade Model
    const buildModel = () => {
      // Clear previous children
      while (mainGroup.children.length > 0) {
        const obj = mainGroup.children[0];
        mainGroup.remove(obj);
      }
      materials.length = 0;

      if (activeModelType === 'cabinet') {
        // --- 3D RETRO ARCADE CABINET ---
        // Body Base
        const cabinetGeo = new THREE.BoxGeometry(2.6, 3.8, 2.2);
        const cabinetMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.2,
          metalness: 0.8,
          wireframe,
        });
        materials.push(cabinetMat);
        const cabinetMesh = new THREE.Mesh(cabinetGeo, cabinetMat);
        cabinetMesh.position.y = -0.2;
        mainGroup.add(cabinetMesh);

        // Screen Bezel
        const bezelGeo = new THREE.BoxGeometry(2.1, 1.6, 0.4);
        const bezelMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.1,
          metalness: 0.9,
          wireframe,
        });
        materials.push(bezelMat);
        const bezel = new THREE.Mesh(bezelGeo, bezelMat);
        bezel.position.set(0, 0.5, 1.05);
        bezel.rotation.x = -0.15;
        mainGroup.add(bezel);

        // Glowing Screen
        const screenGeo = new THREE.PlaneGeometry(1.8, 1.3);
        const screenMat = new THREE.MeshStandardMaterial({
          color: curColor.accent,
          emissive: curColor.primary,
          emissiveIntensity: 0.6,
          roughness: 0.1,
          wireframe,
        });
        materials.push(screenMat);
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 0.52, 1.26);
        screen.rotation.x = -0.15;
        mainGroup.add(screen);

        // Marquee Header Box
        const marqueeGeo = new THREE.BoxGeometry(2.4, 0.65, 1.2);
        const marqueeMat = new THREE.MeshStandardMaterial({
          color: curColor.primary,
          emissive: curColor.emissive,
          emissiveIntensity: 0.7,
          roughness: 0.2,
          metalness: 0.5,
          wireframe,
        });
        materials.push(marqueeMat);
        const marquee = new THREE.Mesh(marqueeGeo, marqueeMat);
        marquee.position.set(0, 1.9, 0.5);
        mainGroup.add(marquee);

        // Control Panel Shelf
        const panelGeo = new THREE.BoxGeometry(2.5, 0.35, 1.1);
        const panelMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.3,
          metalness: 0.7,
          wireframe,
        });
        materials.push(panelMat);
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(0, -0.4, 1.3);
        panel.rotation.x = 0.2;
        mainGroup.add(panel);

        // Joystick base & ball
        const stickBaseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.1, 16);
        const stickBaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const stickBase = new THREE.Mesh(stickBaseGeo, stickBaseMat);
        stickBase.position.set(-0.6, -0.22, 1.4);
        stickBase.rotation.x = 0.2;
        mainGroup.add(stickBase);

        const stickRodGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
        const stickRodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
        const stickRod = new THREE.Mesh(stickRodGeo, stickRodMat);
        stickRod.position.set(-0.6, -0.05, 1.4);
        stickRod.rotation.x = 0.2;
        mainGroup.add(stickRod);

        const stickBallGeo = new THREE.SphereGeometry(0.16, 16, 16);
        const stickBallMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          emissiveIntensity: 0.4,
          roughness: 0.2,
          metalness: 0.5,
        });
        const stickBall = new THREE.Mesh(stickBallGeo, stickBallMat);
        stickBall.position.set(-0.6, 0.16, 1.4);
        mainGroup.add(stickBall);

        // Arcade Buttons (6 Buttons)
        const btnColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
        const btnPositions = [
          [0.1, -0.25, 1.35],
          [0.45, -0.25, 1.35],
          [0.8, -0.25, 1.35],
          [0.1, -0.38, 1.48],
          [0.45, -0.38, 1.48],
          [0.8, -0.38, 1.48],
        ];

        btnPositions.forEach((pos, idx) => {
          const btnGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.08, 16);
          const btnMat = new THREE.MeshStandardMaterial({
            color: btnColors[idx % btnColors.length],
            emissive: btnColors[idx % btnColors.length],
            emissiveIntensity: 0.4,
            roughness: 0.3,
          });
          const btnMesh = new THREE.Mesh(btnGeo, btnMat);
          btnMesh.position.set(pos[0], pos[1], pos[2]);
          btnMesh.rotation.x = 0.2;
          mainGroup.add(btnMesh);
        });

      } else {
        // --- 3D FUTURISTIC GAMEPAD ---
        const padBodyGeo = new THREE.BoxGeometry(4.2, 2.2, 0.8);
        const padBodyMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          metalness: 0.7,
          wireframe,
        });
        materials.push(padBodyMat);
        const padBody = new THREE.Mesh(padBodyGeo, padBodyMat);
        mainGroup.add(padBody);

        // Grips
        const gripGeo = new THREE.CylinderGeometry(0.45, 0.55, 2.4, 24);
        const gripMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const leftGrip = new THREE.Mesh(gripGeo, gripMat);
        leftGrip.position.set(-2.1, -0.3, 0);
        leftGrip.rotation.z = -0.3;
        mainGroup.add(leftGrip);

        const rightGrip = new THREE.Mesh(gripGeo, gripMat);
        rightGrip.position.set(2.1, -0.3, 0);
        rightGrip.rotation.z = 0.3;
        mainGroup.add(rightGrip);

        // Center Logo Glowing Orb
        const centerOrbGeo = new THREE.SphereGeometry(0.38, 24, 24);
        const centerOrbMat = new THREE.MeshStandardMaterial({
          color: curColor.primary,
          emissive: curColor.primary,
          emissiveIntensity: 0.8,
          wireframe,
        });
        materials.push(centerOrbMat);
        const centerOrb = new THREE.Mesh(centerOrbGeo, centerOrbMat);
        centerOrb.position.set(0, 0.2, 0.42);
        mainGroup.add(centerOrb);

        // D-Pad Cross
        const dpadMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
        const dpadH = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, 0.2), dpadMat);
        dpadH.position.set(-1.1, -0.1, 0.42);
        mainGroup.add(dpadH);
        const dpadV = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.2), dpadMat);
        dpadV.position.set(-1.1, -0.1, 0.42);
        mainGroup.add(dpadV);

        // Action Buttons ABXY
        const btnColors = [0x10b981, 0xef4444, 0x3b82f6, 0xf59e0b];
        const btnOffsets = [
          [1.1, 0.2, 0.42],  // Top (Y)
          [1.4, -0.1, 0.42], // Right (B)
          [1.1, -0.4, 0.42], // Bottom (A)
          [0.8, -0.1, 0.42], // Left (X)
        ];
        btnOffsets.forEach((pos, idx) => {
          const bGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
          const bMat = new THREE.MeshStandardMaterial({
            color: btnColors[idx],
            emissive: btnColors[idx],
            emissiveIntensity: 0.5,
          });
          const bMesh = new THREE.Mesh(bGeo, bMat);
          bMesh.position.set(pos[0], pos[1], pos[2]);
          bMesh.rotation.x = Math.PI / 2;
          mainGroup.add(bMesh);
        });
      }

      // --- FLOATING RETRO GEOMETRIC OBJECTS (Gems, Rings, Floating Stars) ---
      // 1. Torus Ring 1
      const ring1Geo = new THREE.TorusGeometry(2.4, 0.04, 16, 60);
      const ring1Mat = new THREE.MeshStandardMaterial({
        color: curColor.primary,
        emissive: curColor.primary,
        emissiveIntensity: 0.7,
        wireframe,
      });
      materials.push(ring1Mat);
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.position.set(0, 0, 0);
      ring1.rotation.x = Math.PI / 3;
      mainGroup.add(ring1);

      // 2. Floating Octahedron Gem
      const gemGeo = new THREE.OctahedronGeometry(0.45, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.9,
        wireframe,
      });
      materials.push(gemMat);
      const gem1 = new THREE.Mesh(gemGeo, gemMat);
      gem1.position.set(2.4, 1.8, 0.8);
      mainGroup.add(gem1);

      // 3. Floating Icosahedron
      const icoGeo = new THREE.IcosahedronGeometry(0.4, 0);
      const icoMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        wireframe,
      });
      materials.push(icoMat);
      const ico = new THREE.Mesh(icoGeo, icoMat);
      ico.position.set(-2.3, 1.6, 0.5);
      mainGroup.add(ico);

      // 4. Floating 3D Coin
      const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.1,
      });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(-2.0, -1.8, 0.6);
      coin.rotation.z = Math.PI / 4;
      mainGroup.add(coin);
    };

    buildModel();

    // Floating Ambient Particles in background
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      color: curColor.primary,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction Handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (sceneState.current.isDragging) {
        const deltaX = e.clientX - sceneState.current.previousMousePosition.x;
        const deltaY = e.clientY - sceneState.current.previousMousePosition.y;
        sceneState.current.targetRotation.y += deltaX * 0.01;
        sceneState.current.targetRotation.x += deltaY * 0.01;
        sceneState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        sceneState.current.targetRotation.y = -0.3 + mouseX * 0.6;
        sceneState.current.targetRotation.x = 0.15 - mouseY * 0.4;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      sceneState.current.isDragging = true;
      sceneState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      sceneState.current.isDragging = false;
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerp Rotation
      if (mainGroup) {
        sceneState.current.currentRotation.x += (sceneState.current.targetRotation.x - sceneState.current.currentRotation.x) * 0.08;
        sceneState.current.currentRotation.y += (sceneState.current.targetRotation.y - sceneState.current.currentRotation.y) * 0.08;

        mainGroup.rotation.x = sceneState.current.currentRotation.x;
        mainGroup.rotation.y = sceneState.current.currentRotation.y;

        // Floating Gentle Bobbing
        mainGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

        // Sub-elements animation
        const children = mainGroup.children;
        children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry instanceof THREE.TorusGeometry) {
              child.rotation.z += 0.008;
            } else if (child.geometry instanceof THREE.OctahedronGeometry) {
              child.rotation.x += 0.02;
              child.rotation.y += 0.015;
            } else if (child.geometry instanceof THREE.IcosahedronGeometry) {
              child.rotation.y -= 0.02;
              child.position.y = 1.6 + Math.cos(elapsedTime * 2 + index) * 0.1;
            }
          }
        });
      }

      // Rotate Background Particles
      if (particles) {
        particles.rotation.y = elapsedTime * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeModelType, colorSchemeIndex, wireframe]);

  const handleToggleWireframe = () => {
    sounds.playClick();
    setWireframe((prev) => !prev);
  };

  const handleCycleColor = () => {
    sounds.playPowerup();
    setColorSchemeIndex((prev) => (prev + 1) % colorSchemes.length);
  };

  const handleTurboSpin = () => {
    if (isSpinning) return;
    sounds.playVictory();
    setIsSpinning(true);
    sceneState.current.targetRotation.y += Math.PI * 4;
    setTimeout(() => setIsSpinning(false), 1200);
  };

  const handleToggleModelType = () => {
    sounds.playClick();
    setActiveModelType((prev) => (prev === 'cabinet' ? 'controller' : 'cabinet'));
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Gamer Value Proposition & Quick Actions */}
        <div className="lg:col-span-7 space-y-6 z-10 text-center lg:text-left">
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-700 font-mono tracking-wide">
              {totalGames}+ Web Games • 100% Client-Side Physics • 0 Server Lag
            </span>
          </div>

          {/* Punchy High-Contrast Gamer Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Instant Arcade Gaming.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Zero Download, Zero Login.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Jump directly into curated retro classics, fast-paced space shooters, mind-bending puzzles, and strategic board challenges. Runs 100% locally inside your browser with procedural 3D graphics & audio synthesis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => {
                sounds.playLaser();
                onExploreGames();
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm sm:text-base cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Browse All Games</span>
            </button>

            <button
              onClick={() => {
                sounds.playPowerup();
                onPlayRandom();
              }}
              className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm sm:text-base cursor-pointer group"
            >
              <Zap className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Surprise Me (Spin & Play)</span>
            </button>
          </div>

          {/* Gamer Trust Pillars */}
          <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Load</span>
              </div>
              <p className="text-[11px] text-slate-500">Starts in under 100ms</p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-0.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>No Auth</span>
              </div>
              <p className="text-[11px] text-slate-500">Auto-saves to browser</p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                <span>Leaderboards</span>
              </div>
              <p className="text-[11px] text-slate-500">Unlockable achievements</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Canvas Showcase */}
        <div className="lg:col-span-5 relative flex flex-col items-center">
          {/* Outer Glass Card for 3D Viewport */}
          <div className="relative w-full h-[420px] sm:h-[460px] bg-gradient-to-b from-white/90 to-slate-100/90 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden backdrop-blur-md flex items-center justify-center group">
            {/* Interactive 3D WebGL Canvas */}
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              title="Drag with mouse to rotate in 3D space"
            />

            {/* Top Interactive Mode Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-mono font-medium tracking-wide flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>3D WebGL Live Preview</span>
              </span>
            </div>

            {/* Drag hint overlay */}
            <div className="absolute top-4 right-4 pointer-events-none">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-200">
                Drag to Rotate
              </span>
            </div>

            {/* Bottom 3D Control Action Dock */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 p-1.5 rounded-2xl border border-slate-200/90 shadow-md backdrop-blur-md z-20 max-w-[95%]">
              <button
                onClick={handleToggleModelType}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5"
                title="Switch 3D Model Shape"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{activeModelType === 'cabinet' ? 'Cabinet' : 'Gamepad'}</span>
              </button>

              <button
                onClick={handleCycleColor}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5"
                title="Change Color Theme"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">{colorSchemes[colorSchemeIndex].name}</span>
              </button>

              <button
                onClick={handleToggleWireframe}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  wireframe
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Toggle Wireframe Matrix"
              >
                <span>Hologram</span>
              </button>

              <button
                onClick={handleTurboSpin}
                className="p-1.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="360° Turbo Spin"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
