import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  Play, 
  Save, 
  RotateCcw, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  Sparkles, 
  Layers, 
  Flag, 
  Check, 
  Plus
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

export interface LevelBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'brick' | 'ground' | 'spike' | 'trampoline' | 'ring' | 'water' | 'checkpoint' | 'portal';
}

interface ArcadexLevelStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomLevel?: (blocks: LevelBlock[]) => void;
}

const TOOL_PALETTE = [
  { id: 'brick', label: 'Brick Platform', color: '#b45309', icon: '🧱' },
  { id: 'ground', label: 'Ground Grass', color: '#15803d', icon: '🌱' },
  { id: 'spike', label: 'Spike Hazard', color: '#dc2626', icon: '🔺' },
  { id: 'trampoline', label: 'Bouncy Pad', color: '#e11d48', icon: '🔴' },
  { id: 'ring', label: 'Golden Ring', color: '#eab308', icon: '🟡' },
  { id: 'water', label: 'Water Zone', color: '#0284c7', icon: '🌊' },
  { id: 'checkpoint', label: 'Checkpoint', color: '#10b981', icon: '🚩' },
  { id: 'portal', label: 'Exit Portal', color: '#8b5cf6', icon: '🌀' }
] as const;

export const ArcadexLevelStudioModal: React.FC<ArcadexLevelStudioModalProps> = ({
  isOpen,
  onClose,
  onPlayCustomLevel
}) => {
  const [selectedTool, setSelectedTool] = useState<LevelBlock['type']>('brick');
  const [blocks, setBlocks] = useState<LevelBlock[]>([
    { x: 0, y: 560, w: 900, h: 80, type: 'ground' },
    { x: 260, y: 440, w: 180, h: 28, type: 'brick' },
    { x: 520, y: 350, w: 200, h: 28, type: 'brick' },
    { x: 700, y: 540, w: 70, h: 20, type: 'trampoline' },
    { x: 350, y: 390, w: 30, h: 30, type: 'ring' },
    { x: 800, y: 260, w: 180, h: 28, type: 'brick' },
    { x: 920, y: 210, w: 40, h: 50, type: 'portal' }
  ]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraX, setCameraX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Render Editor Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -cameraX % gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Blocks
      blocks.forEach((b) => {
        const drawX = b.x - cameraX;
        if (drawX + b.w < 0 || drawX > canvas.width) return;

        if (b.type === 'ground') {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(drawX, b.y, b.w, b.h);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(drawX, b.y, b.w, 8);
        } else if (b.type === 'brick') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(drawX, b.y, b.w, b.h);
          ctx.strokeStyle = '#d97706';
          ctx.strokeRect(drawX, b.y, b.w, b.h);
        } else if (b.type === 'spike') {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(drawX, b.y + b.h);
          ctx.lineTo(drawX + b.w / 2, b.y);
          ctx.lineTo(drawX + b.w, b.y + b.h);
          ctx.fill();
        } else if (b.type === 'trampoline') {
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.ellipse(drawX + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (b.type === 'ring') {
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(drawX + b.w / 2, b.y + b.h / 2, 14, 0, Math.PI * 2);
          ctx.stroke();
        } else if (b.type === 'water') {
          ctx.fillStyle = 'rgba(2, 132, 199, 0.6)';
          ctx.fillRect(drawX, b.y, b.w, b.h);
        } else if (b.type === 'checkpoint') {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(drawX, b.y, 4, b.h);
          ctx.fillStyle = '#34d399';
          ctx.fillRect(drawX + 4, b.y, 16, 12);
        } else if (b.type === 'portal') {
          ctx.fillStyle = '#8b5cf6';
          ctx.beginPath();
          ctx.ellipse(drawX + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    };

    render();
  }, [isOpen, blocks, cameraX]);

  if (!isOpen) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = Math.floor((e.clientX - rect.left + cameraX) / 40) * 40;
    const clickY = Math.floor((e.clientY - rect.top) / 40) * 40;

    // Check if clicked existing block to delete
    const existingIndex = blocks.findIndex(b => clickX >= b.x && clickX < b.x + b.w && clickY >= b.y && clickY < b.y + b.h);
    if (existingIndex !== -1) {
      sounds.playClick();
      HapticEngine.lightTick();
      setBlocks(blocks.filter((_, idx) => idx !== existingIndex));
      return;
    }

    sounds.playPowerup();
    HapticEngine.lightTick();
    const newBlock: LevelBlock = {
      x: clickX,
      y: clickY,
      w: selectedTool === 'ground' ? 160 : selectedTool === 'brick' ? 120 : selectedTool === 'water' ? 160 : 40,
      h: selectedTool === 'ground' ? 80 : selectedTool === 'brick' ? 28 : selectedTool === 'water' ? 80 : 40,
      type: selectedTool
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `arcadex_custom_level_${Date.now()}.json`);
    dlAnchorElem.click();
    sounds.playPowerup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                ARCADEX STUDIO: LEVEL BUILDER
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v3.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">Design custom levels, place hazards, and playtest live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Palette */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {TOOL_PALETTE.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  sounds.playClick();
                  HapticEngine.lightTick();
                  setSelectedTool(tool.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTool === tool.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraX(Math.max(0, cameraX - 120))}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
            >
              ◀ Pan Left
            </button>
            <button
              onClick={() => setCameraX(cameraX + 120)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
            >
              Pan Right ▶
            </button>
            <button
              onClick={() => setBlocks([])}
              className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Editor Canvas */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-950 p-4">
          <canvas
            ref={canvasRef}
            width={880}
            height={480}
            onClick={handleCanvasClick}
            className="rounded-xl border-2 border-slate-700 shadow-2xl cursor-crosshair max-w-full"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-purple-400">{blocks.length}</span> elements placed • Click element to remove
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => {
                sounds.playPowerup();
                HapticEngine.victoryFanfare();
                if (onPlayCustomLevel) {
                  onPlayCustomLevel(blocks);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Playtest Level</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
