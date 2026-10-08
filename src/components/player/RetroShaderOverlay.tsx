import React from 'react';

export type ShaderPreset = 'none' | 'crt' | 'gameboy' | 'cyberpunk' | 'vhs';

interface RetroShaderOverlayProps {
  preset: ShaderPreset;
  children: React.ReactNode;
}

export const RetroShaderOverlay: React.FC<RetroShaderOverlayProps> = ({
  preset,
  children
}) => {
  if (preset === 'none') {
    return <div className="w-full h-full relative">{children}</div>;
  }

  return (
    <div className={`w-full h-full relative overflow-hidden ${getContainerClass(preset)}`}>
      {/* Underlying Game Canvas / Content */}
      <div className={`w-full h-full transition-all duration-200 ${getContentFilterClass(preset)}`}>
        {children}
      </div>

      {/* CRT Scanline & Phosphor Overlay */}
      {preset === 'crt' && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Horizontal Scanlines */}
          <div 
            className="w-full h-full opacity-25"
            style={{
              backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.6) 50%)',
              backgroundSize: '100% 4px'
            }}
          />
          {/* Vignette & Radial Shadow */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.75) 100%)',
              boxShadow: 'inset 0 0 40px rgba(0, 255, 120, 0.15)'
            }}
          />
        </div>
      )}

      {/* Game Boy Dot Matrix Screen Texture */}
      {preset === 'gameboy' && (
        <div className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(#8b956d 1px, transparent 1px)',
              backgroundSize: '3px 3px'
            }}
          />
        </div>
      )}

      {/* Cyberpunk RGB Shift & Scanlines */}
      {preset === 'cyberpunk' && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div 
            className="w-full h-full opacity-15"
            style={{
              backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.2) 50%, rgba(6, 182, 212, 0.2) 50%)',
              backgroundSize: '100% 3px'
            }}
          />
          <div 
            className="absolute inset-0 border-2 border-cyan-500/20 shadow-[inset_0_0_30px_rgba(236,72,153,0.3)]"
          />
        </div>
      )}

      {/* VHS Tape Glitch Line & Noise */}
      {preset === 'vhs' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div 
            className="w-full h-full opacity-20"
            style={{
              backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.3) 50%)',
              backgroundSize: '100% 6px'
            }}
          />
          <div className="absolute top-4 left-4 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded tracking-widest uppercase">
            PLAY ▶ SP 0:00:18
          </div>
        </div>
      )}
    </div>
  );
};

function getContainerClass(preset: ShaderPreset): string {
  switch (preset) {
    case 'crt':
      return 'rounded-2xl border-4 border-slate-900 shadow-2xl';
    case 'gameboy':
      return 'bg-[#9bbc0f] border-4 border-[#8b956d] rounded-xl';
    case 'cyberpunk':
      return 'border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]';
    case 'vhs':
      return 'border border-slate-800';
    default:
      return '';
  }
}

function getContentFilterClass(preset: ShaderPreset): string {
  switch (preset) {
    case 'crt':
      return 'contrast-[1.1] brightness-[1.05] saturate-[1.2]';
    case 'gameboy':
      return 'filter sepia(1) hue-rotate([50deg]) saturate([2.5]) brightness([0.9]) contrast([1.4])';
    case 'cyberpunk':
      return 'contrast-[1.25] saturate-[1.6] hue-rotate-[350deg]';
    case 'vhs':
      return 'contrast-[1.1] brightness-[1.1] saturate-[0.85]';
    default:
      return '';
  }
}
