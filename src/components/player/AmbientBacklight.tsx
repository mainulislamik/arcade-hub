import React, { useEffect, useRef, useState } from 'react';

interface AmbientBacklightProps {
  enabled: boolean;
  intensity?: 'soft' | 'medium' | 'vibrant';
  children: React.ReactNode;
}

export const AmbientBacklight: React.FC<AmbientBacklightProps> = ({
  enabled,
  intensity = 'medium',
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ambientColors, setAmbientColors] = useState<{
    top: string;
    bottom: string;
    left: string;
    right: string;
  }>({
    top: 'rgba(99, 102, 241, 0.4)',
    bottom: 'rgba(168, 85, 247, 0.4)',
    left: 'rgba(6, 182, 212, 0.4)',
    right: 'rgba(236, 72, 153, 0.4)'
  });

  useEffect(() => {
    if (!enabled) return;

    // Periodically sample colors from canvas inside container
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const canvas = containerRef.current.querySelector('canvas');
      if (!canvas || canvas.width === 0 || canvas.height === 0) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Sample center and edges
        const w = canvas.width;
        const h = canvas.height;

        // Sample pixel at (w/2, 20), (w/2, h-20), (20, h/2), (w-20, h/2)
        const pTop = ctx.getImageData(Math.floor(w / 2), Math.min(20, h - 1), 1, 1).data;
        const pBottom = ctx.getImageData(Math.floor(w / 2), Math.max(0, h - 20), 1, 1).data;
        const pLeft = ctx.getImageData(Math.min(20, w - 1), Math.floor(h / 2), 1, 1).data;
        const pRight = ctx.getImageData(Math.max(0, w - 20), Math.floor(h / 2), 1, 1).data;

        const opacity = intensity === 'soft' ? 0.25 : intensity === 'medium' ? 0.45 : 0.7;

        setAmbientColors({
          top: `rgba(${pTop[0] || 99}, ${pTop[1] || 102}, ${pTop[2] || 241}, ${opacity})`,
          bottom: `rgba(${pBottom[0] || 168}, ${pBottom[1] || 85}, ${pBottom[2] || 247}, ${opacity})`,
          left: `rgba(${pLeft[0] || 6}, ${pLeft[1] || 182}, ${pLeft[2] || 212}, ${opacity})`,
          right: `rgba(${pRight[0] || 236}, ${pRight[1] || 72}, ${pRight[2] || 153}, ${opacity})`
        });
      } catch (e) {
        // Fallback for tainted canvas or security blocks
      }
    }, 400);

    return () => clearInterval(interval);
  }, [enabled, intensity]);

  return (
    <div ref={containerRef} className="relative group/ambient w-full flex flex-col items-center justify-center">
      {/* Dynamic Ambient Glow Backlight Elements */}
      {enabled && (
        <div 
          className="absolute -inset-4 sm:-inset-8 rounded-[36px] blur-2xl sm:blur-3xl opacity-80 pointer-events-none transition-all duration-500 z-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${ambientColors.top} 0%, transparent 65%),
                         radial-gradient(circle at 50% 100%, ${ambientColors.bottom} 0%, transparent 65%),
                         radial-gradient(circle at 0% 50%, ${ambientColors.left} 0%, transparent 65%),
                         radial-gradient(circle at 100% 50%, ${ambientColors.right} 0%, transparent 65%)`
          }}
        />
      )}

      {/* Main Content / Game Player */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
