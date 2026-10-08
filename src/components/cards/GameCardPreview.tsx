import React, { useEffect, useRef } from 'react';

interface GameCardPreviewProps {
  gameId: string;
  category: string;
}

export const GameCardPreview: React.FC<GameCardPreviewProps> = ({ gameId, category }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Cyber Slope 3D Preview
      if (gameId === 'slope-3d' || gameId.includes('slope')) {
        ctx.fillStyle = '#0a0c16';
        ctx.fillRect(0, 0, width, height);

        // Grid perspective lines
        ctx.strokeStyle = '#00f3ff44';
        ctx.lineWidth = 1.5;
        const horizon = height * 0.35;
        const cx = width / 2;

        for (let i = -6; i <= 6; i++) {
          ctx.beginPath();
          ctx.moveTo(cx, horizon);
          ctx.lineTo(cx + i * (width * 0.2), height);
          ctx.stroke();
        }

        // Horizontal moving lines
        const offset = (frame * 3) % 25;
        for (let y = horizon + offset; y < height; y += 25) {
          const p = (y - horizon) / (height - horizon);
          ctx.strokeStyle = `rgba(0, 243, 255, ${p * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(cx - p * width * 0.8, y);
          ctx.lineTo(cx + p * width * 0.8, y);
          ctx.stroke();
        }

        // Rolling 3D Sphere
        const ballX = cx + Math.sin(frame * 0.08) * (width * 0.25);
        const ballY = height * 0.72;
        const grad = ctx.createRadialGradient(ballX - 4, ballY - 4, 2, ballX, ballY, 16);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#00ffff');
        grad.addColorStop(1, '#005588');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Ball glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 2. Subway Runner 3D Preview
      else if (gameId === 'subway-3d' || gameId === 'subway-surfer') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height * 0.3;

        // 3 Rails
        [-width * 0.28, 0, width * 0.28].forEach((rx) => {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + rx * 2.2, height);
          ctx.stroke();
        });

        // Moving Ties
        const offset = (frame * 4) % 20;
        for (let y = cy + offset; y < height; y += 20) {
          const p = (y - cy) / (height - cy);
          ctx.strokeStyle = `rgba(100, 116, 139, ${p * 0.8})`;
          ctx.lineWidth = 2 * p;
          ctx.beginPath();
          ctx.moveTo(cx - p * width * 0.6, y);
          ctx.lineTo(cx + p * width * 0.6, y);
          ctx.stroke();
        }

        // Moving Oncoming Red Train
        const trainZ = ((frame * 2) % 120) / 120;
        const trainY = cy + trainZ * (height - cy);
        const trainW = 35 * trainZ;
        const trainH = 45 * trainZ;
        if (trainZ > 0.1) {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(cx - trainW / 2, trainY - trainH, trainW, trainH);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx - trainW * 0.3, trainY - trainH * 0.7, trainW * 0.2, trainH * 0.2);
          ctx.fillRect(cx + trainW * 0.1, trainY - trainH * 0.7, trainW * 0.2, trainH * 0.2);
        }

        // Runner Figure
        const runX = cx + (Math.floor(frame / 40) % 3 - 1) * (width * 0.22);
        const runY = height * 0.8;
        const jumpY = Math.abs(Math.sin(frame * 0.15)) * 18;

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(runX - 8, runY - 24 - jumpY, 16, 24);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(runX, runY - 30 - jumpY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Hyper Drift 3D Preview
      else if (gameId === 'drift-3d' || gameId.includes('drift') || gameId.includes('hill')) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Asphalt Track Curve
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 65, 0, Math.PI * 2);
        ctx.stroke();

        // Skid marks
        ctx.strokeStyle = '#00f3ff66';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 68, (frame * 0.05) % (Math.PI * 2), ((frame * 0.05) % (Math.PI * 2)) + 1.2);
        ctx.stroke();

        // Drifting Car
        const angle = frame * 0.05;
        const carX = width * 0.5 + Math.cos(angle) * 65;
        const carY = height * 0.5 + Math.sin(angle) * 65;

        ctx.save();
        ctx.translate(carX, carY);
        ctx.rotate(angle + Math.PI / 2 + 0.4); // Drift slip angle

        // Car Body
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(-8, -16, 16, 32);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -6, 12, 14);

        // Headlight beams
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-6, -16);
        ctx.lineTo(-20, -45);
        ctx.lineTo(20, -45);
        ctx.lineTo(6, -16);
        ctx.fill();

        ctx.restore();
      }

      // 4. Cyber Knife 3D Preview
      else if (gameId === 'knife-3d' || gameId.includes('knife')) {
        ctx.fillStyle = '#0a0c16';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height * 0.4;
        const wheelRadius = 38;

        // Rotating Cyber Core
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.04);

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Embedded Knives
        [0, 1.2, 2.5, 4.0].forEach((a) => {
          ctx.save();
          ctx.rotate(a);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-2, wheelRadius - 2, 4, 20);
          ctx.restore();
        });

        ctx.restore();

        // Flying Knife
        const knifeY = height * 0.85 - ((frame * 6) % (height * 0.45));
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.fillRect(cx - 2, knifeY, 4, 22);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 3, knifeY + 16, 6, 8);
        ctx.shadowBlur = 0;
      }

      // 5. Voxel FPS / Action / Fighter Preview
      else {
        ctx.fillStyle = '#080c18';
        ctx.fillRect(0, 0, width, height);

        // Cyber Grid Floor
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 18) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 18) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Action Particles / Laser Burst
        const t = frame * 0.08;
        const targetX = width * 0.5 + Math.sin(t) * (width * 0.3);
        const targetY = height * 0.45 + Math.cos(t * 1.5) * (height * 0.2);

        // Flying Target Drone
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fillRect(targetX - 12, targetY - 12, 24, 24);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(targetX - 4, targetY - 4, 8, 8);
        ctx.shadowBlur = 0;

        // Laser Beam
        if (frame % 30 < 10) {
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(width * 0.5, height);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Crosshair
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 16, 0, Math.PI * 2);
        ctx.moveTo(targetX - 22, targetY);
        ctx.lineTo(targetX + 22, targetY);
        ctx.moveTo(targetX, targetY - 22);
        ctx.lineTo(targetX, targetY + 22);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameId, category]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={175}
      className="w-full h-full object-cover animate-in fade-in duration-200"
    />
  );
};