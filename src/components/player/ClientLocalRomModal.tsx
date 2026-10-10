import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Gamepad2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Play, 
  Save, 
  Trash2, 
  X, 
  FileCode2, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { GameItem } from '../../types/game';
import { saveCustomGame, getCustomGames, deleteCustomGame } from '../../utils/customGamesStorage';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface ClientLocalRomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: (game: GameItem) => void;
}

export const ClientLocalRomModal: React.FC<ClientLocalRomModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<string>('jar');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('Java ME Mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localGames, setLocalGames] = useState<GameItem[]>([]);
  const [saveToLibrary, setSaveToLibrary] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh local client games
  const loadLocalGames = async () => {
    try {
      const list = await getCustomGames();
      setLocalGames(list.filter(g => g.isCustomUpload));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLocalGames();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sniff format and platform
  const detectFileType = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fmt = 'jar';
    let plat = 'Java ME (Nokia / SE)';
    let engine = 'j2me_wasm';

    if (ext === 'sis' || ext === 'sisx') {
      fmt = 'sis';
      plat = 'Symbian S60 (Nokia N-Gage)';
      engine = 'symbian_sis';
    } else if (ext === 'gba') {
      fmt = 'gba';
      plat = 'Game Boy Advance (Nintendo)';
      engine = 'emulatorjs';
    } else if (ext === 'gb' || ext === 'gbc') {
      fmt = 'gb';
      plat = 'Game Boy Color (Nintendo)';
      engine = 'emulatorjs';
    } else if (ext === 'nes') {
      fmt = 'nes';
      plat = 'Nintendo NES 8-Bit';
      engine = 'emulatorjs';
    } else if (ext === 'sfc' || ext === 'smc' || ext === 'snes') {
      fmt = 'snes';
      plat = 'Super Nintendo 16-Bit';
      engine = 'emulatorjs';
    } else if (ext === 'md' || ext === 'gen' || ext === 'bin') {
      fmt = 'md';
      plat = 'Sega Genesis / Mega Drive';
      engine = 'emulatorjs';
    } else if (ext === 'swf') {
      fmt = 'swf';
      plat = 'Adobe Flash Interactive';
      engine = 'ruffle_flash';
    } else if (ext === 'zip') {
      fmt = 'zip';
      plat = 'HTML5 / Custom Web ROM';
      engine = 'html5_zip';
    } else {
      fmt = 'jar';
      plat = 'Java ME Midlet (.JAR)';
      engine = 'j2me_wasm';
    }

    setDetectedFormat(fmt);
    setDetectedPlatform(plat);

    // Clean human-friendly name
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const cleanTitle = rawName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    setGameTitle(cleanTitle || 'Custom Retro Game');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      detectFileType(file);
      sounds.playPowerup();
      HapticEngine.selectionClick();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      detectFileType(file);
      sounds.playPowerup();
      HapticEngine.impactSuccess();
    }
  };

  const handleStartGame = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    sounds.playClick();
    HapticEngine.impactSuccess();

    try {
      const gameId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fileBlob = selectedFile;
      const blobUrl = URL.createObjectURL(fileBlob);

      const localGameItem: GameItem = {
        id: gameId,
        slug: gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: gameTitle.trim() || selectedFile.name,
        category: 'retro',
        description: `Client-side standalone emulation of ${selectedFile.name} on ${detectedPlatform}. Executing directly on your local device.`,
        instructions: 'Use Keyboard (Arrow keys, WASD, Enter, Numpad 1-9) or Virtual On-Screen Gamepad to play.',
        aspectRatio: detectedFormat === 'jar' ? '3:4' : detectedFormat === 'gba' ? '3:2' : '4:3',
        controls: {
          keyboard: ['Arrow Keys / WASD: D-Pad', 'Enter / Space: Action / Fire', '1-9, *, #: Keypad Input', 'F1: Save State | F3: Load State'],
          touch: ['Virtual D-Pad', 'Action Buttons (A / B / Fire)', 'Keypad Dial'],
        },
        difficulty: 'Medium',
        rating: 4.95,
        plays: 1,
        tags: ['Local ROM', detectedFormat.toUpperCase(), 'Client Sandbox', 'BYOG'],
        engineType: detectedFormat === 'swf' ? 'ruffle_flash' : (['gba', 'nes', 'snes', 'gb', 'md'].includes(detectedFormat) ? 'emulatorjs' : (detectedFormat === 'sis' ? 'symbian_sis' : 'j2me_wasm')),
        romFormat: detectedFormat as any,
        romFileName: selectedFile.name,
        romUrl: blobUrl,
        isCustomUpload: true,
        fileSizeMb: +(selectedFile.size / (1024 * 1024)).toFixed(2),
        badge: `${detectedFormat.toUpperCase()} Local`,
      };

      if (saveToLibrary) {
        // Save to client's IndexedDB only (never leaves browser)
        await saveCustomGame(localGameItem, fileBlob);
      }

      onClose();
      onPlayGame(localGameItem);
    } catch (err) {
      console.error('Failed to load local ROM:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteLocalGame = async (gameId: string, romKey?: string) => {
    if (!window.confirm('Delete this game from your local browser vault?')) return;
    try {
      await deleteCustomGame(gameId, romKey);
      sounds.playClick();
      HapticEngine.lightTick();
      await loadLocalGames();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Play Any Local Game <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">BYOG Engine</span>
              </h2>
              <p className="text-xs text-slate-400">Run any .JAR, .SIS, .GBA, .NES, .SNES, .MD, or .SWF file on your own PC</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('upload'); }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" /> Drop & Run ROM
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('library'); loadLocalGames(); }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'library'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" /> My Local Vault ({localGames.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {activeTab === 'upload' ? (
            <>
              {/* 100% Client-Side Privacy Guarantee Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    100% Client-Side Sandbox • Zero Server Storage
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Your game file is <strong className="text-white">never uploaded to the server</strong>. It executes purely inside your browser memory using WebAssembly & WebGL. No copyright issues, zero server load.
                  </p>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-700 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-900/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jar,.jad,.sis,.sisx,.gba,.gbc,.gb,.nes,.sfc,.smc,.snes,.md,.gen,.bin,.swf,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                      <FileCode2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 max-w-sm truncate">{selectedFile.name}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold uppercase">
                        {detectedFormat}
                      </span>
                      <span className="text-slate-400">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <span className="text-emerald-400 font-medium">Ready to emulate</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Click or drag another file to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">Drag & Drop Game File Here</h3>
                    <p className="text-xs text-slate-400">or click to browse from your computer / phone</p>
                    
                    {/* Format Pill Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 max-w-md">
                      {['.JAR', '.SIS', '.GBA', '.NES', '.SNES', '.MD', '.SWF', '.ZIP'].map((fmt) => (
                        <span key={fmt} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Configure Game Details */}
              {selectedFile && (
                <div className="space-y-4 animate-fade-in bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Game Display Title</label>
                      <input
                        type="text"
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        placeholder="e.g. Bounce Tales, Pokemon Emerald..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Detected Emulator Core</label>
                      <div className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-cyan-300 font-mono flex items-center justify-between">
                        <span>{detectedPlatform}</span>
                        <span className="text-[10px] text-slate-500 uppercase">WASM Core</span>
                      </div>
                    </div>
                  </div>

                  {/* Save to Local Library Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={saveToLibrary}
                      onChange={(e) => setSaveToLibrary(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Remember this game in my browser library (IndexedDB) for next time</span>
                  </label>

                  {/* Play Button */}
                  <button
                    onClick={handleStartGame}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {isProcessing ? 'Initializing Emulator Sandbox...' : 'Launch in Universal Emulator'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Local Library Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Games saved locally in your browser's IndexedDB. Stored 100% on your device only.
                </p>
                <button
                  onClick={() => { sounds.playClick(); loadLocalGames(); }}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              {localGames.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <HardDrive className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs">No local games saved yet.</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="text-xs text-cyan-400 font-semibold hover:underline"
                  >
                    Drop a .JAR, .SIS or .GBA ROM to start
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {localGames.map((game) => (
                    <div
                      key={game.id}
                      className="p-3 bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 group transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {game.romFormat?.toUpperCase() || 'ROM'} • {game.fileSizeMb || 0} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            sounds.playPowerup();
                            onClose();
                            onPlayGame(game);
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition-colors"
                          title="Play Game"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocalGame(game.id, game.customRomKey)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete from local vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Client-Side WebAssembly Emulator Core
          </span>
          <span>Zero Server Upload • Private Storage</span>
        </div>

      </div>
    </div>
  );
};
