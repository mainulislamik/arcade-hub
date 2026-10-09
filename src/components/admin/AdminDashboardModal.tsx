import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../types/game';
import { 
  saveCustomGame, 
  getCustomGames, 
  deleteCustomGame 
} from '../../utils/customGamesStorage';
import { 
  Lock, 
  ShieldCheck, 
  Upload, 
  FileCode, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Plus, 
  HardDrive, 
  Layers, 
  Sparkles, 
  Image as ImageIcon,
  FolderOpen,
  LogOut,
  RefreshCw,
  Search,
  KeyRound,
  Eye,
  Sliders,
  Database
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameAddedOrUpdated: () => void;
  onPlayGame: (game: GameItem) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onGameAddedOrUpdated,
  onPlayGame
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('arcadex_admin_session') === 'active';
  });
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: 'upload' | 'manage' | 'system'
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'system'>('upload');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  
  const [gameTitle, setGameTitle] = useState('');
  const [gameCategory, setGameCategory] = useState<string>('arcade');
  const [gameDeveloper, setGameDeveloper] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameTags, setGameTags] = useState('retro, mobile, original');
  const [gameAspectRatio, setGameAspectRatio] = useState<'4:3' | '16:9' | '3:4' | '1:1'>('4:3');
  const [detectedFormat, setDetectedFormat] = useState<string>('jar');
  const [detectedEngine, setDetectedEngine] = useState<string>('j2me_wasm');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Management State
  const [customGamesList, setCustomGamesList] = useState<GameItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load custom games from IndexedDB
  const refreshGamesList = async () => {
    setIsLoadingGames(true);
    try {
      const list = await getCustomGames();
      setCustomGamesList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingGames(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshGamesList();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // Login Form Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Exact credentials as requested: User ID: IT | Password: imran%$#
    if (userIdInput.trim() === 'IT' && passwordInput.trim() === 'imran%$#') {
      sessionStorage.setItem('arcadex_admin_session', 'active');
      setIsAuthenticated(true);
      sounds.playPowerup();
      refreshGamesList();
    } else {
      sounds.playLaser();
      setAuthError('Invalid User ID or Password. Access Denied.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('arcadex_admin_session');
    setIsAuthenticated(false);
    setUserIdInput('');
    setPasswordInput('');
    sounds.playClick();
  };

  // Handle ROM File Drop / Selection
  const handleRomFileSelect = (file: File) => {
    setSelectedFile(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    setDetectedFormat(ext);

    // Auto-detect engine based on extension
    if (ext === 'jar' || ext === 'jad') {
      setDetectedEngine('j2me_wasm');
      setGameAspectRatio('3:4');
    } else if (ext === 'sis' || ext === 'sisx') {
      setDetectedEngine('symbian_sis');
      setGameAspectRatio('3:4');
    } else if (['gba', 'nes', 'snes', 'gb', 'gbc', 'md'].includes(ext)) {
      setDetectedEngine('emulatorjs');
      setGameAspectRatio('4:3');
    } else if (ext === 'swf') {
      setDetectedEngine('ruffle_flash');
      setGameAspectRatio('4:3');
    } else {
      setDetectedEngine('html5_zip');
      setGameAspectRatio('16:9');
    }

    // Auto-fill title from filename if empty
    if (!gameTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setGameTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // Generate dynamic canvas cover image if user doesn't upload one
  const generateDynamicCover = (title: string, format: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 600; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 400); ctx.stroke();
    }
    for (let y = 0; y < 400; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(600, y); ctx.stroke();
    }

    // Badge
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(40, 40, 110, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`${format.toUpperCase()} ROM`, 55, 61);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;
    ctx.fillText(title.slice(0, 22), 40, 220);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText('Original Authentic Emulator Engine', 40, 260);

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Submit Uploaded Game
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a game ROM file (.jar, .sis, .gba, .swf, .zip)');
      return;
    }
    if (!gameTitle.trim()) {
      alert('Please enter a Game Title');
      return;
    }

    setIsSaving(true);
    setUploadSuccessMessage(null);

    try {
      const slug = gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `game-${Date.now()}`;
      const gameId = `custom_${slug}_${Date.now()}`;
      
      let coverImgUrl = coverPreviewUrl;
      if (!coverImgUrl) {
        coverImgUrl = generateDynamicCover(gameTitle, detectedFormat);
      }

      const newGame: GameItem = {
        id: gameId,
        slug: slug,
        title: gameTitle.trim(),
        category: gameCategory,
        description: gameDescription || `Original ${detectedFormat.toUpperCase()} mobile game running on Arcadex high-speed client-side WASM engine.`,
        longDescription: gameDescription,
        aspectRatio: gameAspectRatio,
        rating: 4.9,
        plays: 1,
        likes: 120,
        featured: true,
        isFeatured: true,
        tags: gameTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        badge: `${detectedFormat.toUpperCase()} ROM`,
        icon: detectedFormat === 'jar' ? '📱' : detectedFormat === 'sis' ? '🕹️' : '🎮',
        cover: coverImgUrl,
        coverImage: coverImgUrl,
        thumbnailUrl: coverImgUrl,
        difficulty: 'Medium',
        developer: gameDeveloper.trim() || 'Original Studio',
        platform: detectedFormat.toUpperCase(),
        engineType: detectedEngine as any,
        romFormat: detectedFormat as any,
        romFileName: selectedFile.name,
        isCustomUpload: true,
        controls: {
          keyboard: ['Arrow Keys', 'Enter / Space', 'Keypad (1-9)'],
          touch: ['On-Screen Mobile Keypad', 'Direct Touch']
        }
      };

      await saveCustomGame(newGame, selectedFile);
      sounds.playPowerup();
      setUploadSuccessMessage(`Game "${newGame.title}" successfully ingested & published!`);
      
      // Reset form
      setSelectedFile(null);
      setCoverFile(null);
      setCoverPreviewUrl(null);
      setGameTitle('');
      setGameDescription('');
      
      await refreshGamesList();
      onGameAddedOrUpdated();
    } catch (err: any) {
      alert('Failed to save game: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Game
  const handleDeleteGame = async (game: GameItem) => {
    if (window.confirm(`Are you sure you want to delete "${game.title}"? This cannot be undone.`)) {
      try {
        await deleteCustomGame(game.id, game.customRomKey);
        sounds.playLaser();
        await refreshGamesList();
        onGameAddedOrUpdated();
      } catch (err: any) {
        alert('Failed to delete game: ' + err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">ARCADEX ADMIN GATEWAY</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">
                  v2.5 Vault
                </span>
              </div>
              <p className="text-xs text-slate-400">Secure Ingestion & Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* LOGIN GATE SCREEN */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Restricted IT Administration</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Enter verified IT Specialist credentials to upload, configure, and manage real game binaries on Arcadex.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              {authError && (
                <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-left text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="e.g. IT"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-left text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-slate-950" />
                Authenticate & Unlock
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/50">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('upload'); }}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'upload'
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload New Game
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('manage'); }}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'manage'
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Game Vault ({customGamesList.length})
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('system'); }}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'system'
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4" />
                Engine Specs
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: UPLOAD GAME */}
              {activeTab === 'upload' && (
                <form onSubmit={handleSaveGame} className="space-y-6 max-w-2xl mx-auto">
                  {uploadSuccessMessage && (
                    <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>{uploadSuccessMessage}</div>
                    </div>
                  )}

                  {/* Drag & Drop File Zone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      1. Select Original Game ROM / Binary File
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        selectedFile
                          ? 'border-cyan-500 bg-cyan-950/30'
                          : 'border-slate-700 bg-slate-950 hover:border-cyan-400/60 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jar,.jad,.sis,.sisx,.gba,.nes,.snes,.gb,.gbc,.swf,.zip,.html"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleRomFileSelect(e.target.files[0]);
                          }
                        }}
                      />

                      {selectedFile ? (
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                            <FileCode className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold text-white">{selectedFile.name}</span>
                          <span className="text-xs text-cyan-400 mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Detected: {detectedFormat.toUpperCase()} ({detectedEngine})
                          </span>
                          <span className="text-[10px] text-slate-400 mt-2">Click to replace file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <Upload className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
                          <span className="text-sm font-bold text-slate-200">
                            Click or Drag & Drop Game File Here
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            Supports .JAR (Java), .SIS / .SISX (Symbian), .GBA, .NES, .SWF (Flash), .ZIP (HTML5)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Game Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        placeholder="e.g. Bounce Tales / Diamond Rush"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={gameCategory}
                        onChange={(e) => setGameCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="arcade">Arcade</option>
                        <option value="action">Action</option>
                        <option value="retro">Retro</option>
                        <option value="puzzle">Puzzle</option>
                        <option value="driving">Driving</option>
                        <option value="shooting">Shooting</option>
                        <option value="strategy">Strategy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Developer / Studio
                      </label>
                      <input
                        type="text"
                        value={gameDeveloper}
                        onChange={(e) => setGameDeveloper(e.target.value)}
                        placeholder="e.g. Nokia / Gameloft / EA"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Screen Aspect Ratio
                      </label>
                      <select
                        value={gameAspectRatio}
                        onChange={(e) => setGameAspectRatio(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="3:4">3:4 (Nokia / Symbian Portrait)</option>
                        <option value="4:3">4:3 (GameBoy / Retro TV)</option>
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="1:1">1:1 (Square)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description & Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Description & Guide
                    </label>
                    <textarea
                      rows={2}
                      value={gameDescription}
                      onChange={(e) => setGameDescription(e.target.value)}
                      placeholder="Brief overview and story of this game..."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Optional Custom Cover Photo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Custom Cover Image (Optional - Auto-generated if left empty)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                        Choose Cover Image
                      </button>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setCoverFile(file);
                            setCoverPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {coverPreviewUrl && (
                        <div className="flex items-center gap-2">
                          <img src={coverPreviewUrl} alt="Cover Preview" className="w-12 h-8 rounded object-cover border border-cyan-500" />
                          <span className="text-xs text-cyan-400 font-semibold">Cover selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Publish Button */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Ingesting & Compiling to Vault...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Save & Ingest Game to Site
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: MANAGE GAMES */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search uploaded games..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Upload Game
                    </button>
                  </div>

                  {/* Games Table */}
                  {isLoadingGames ? (
                    <div className="text-center py-12 text-slate-400 text-xs">Loading games from vault...</div>
                  ) : customGamesList.length === 0 ? (
                    <div className="text-center py-12 border border-slate-800 rounded-2xl bg-slate-950/40 p-6 flex flex-col items-center">
                      <HardDrive className="w-12 h-12 text-slate-600 mb-3" />
                      <h4 className="text-sm font-bold text-slate-300 mb-1">No Custom Games Uploaded Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        Click "Upload New Game" to upload downloaded .JAR, .SIS, .GBA, or .SWF files.
                      </p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-xl"
                      >
                        Upload Your First Game
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Cover</th>
                            <th className="p-3">Title / Info</th>
                            <th className="p-3">Format</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Size</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {customGamesList
                            .filter(g => g.title.toLowerCase().includes(searchFilter.toLowerCase()))
                            .map((game) => (
                              <tr key={game.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-3">
                                  <img
                                    src={game.cover || game.thumbnailUrl}
                                    alt={game.title}
                                    className="w-12 h-8 rounded-lg object-cover border border-slate-700"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-white">{game.title}</div>
                                  <div className="text-[10px] text-slate-400">{game.developer || 'Original'}</div>
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                                    {game.romFormat?.toUpperCase() || 'JAR'}
                                  </span>
                                </td>
                                <td className="p-3 capitalize">{game.category}</td>
                                <td className="p-3 font-mono text-[11px] text-slate-400">
                                  {game.fileSizeMb ? `${game.fileSizeMb} MB` : '1.2 MB'}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      sounds.playClick();
                                      onClose();
                                      onPlayGame(game);
                                    }}
                                    className="p-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black rounded-lg transition-colors"
                                    title="Play / Test Game"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGame(game)}
                                    className="p-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 rounded-lg transition-colors"
                                    title="Delete Game"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ENGINE SPECS */}
              {activeTab === 'system' && (
                <div className="space-y-4 max-w-xl mx-auto text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      Client-Side WASM Emulation Engines
                    </h4>
                    <p className="text-slate-400 leading-relaxed mb-3">
                      Arcadex runs all uploaded original game binaries locally inside the user's browser client using WebAssembly with zero server execution cost:
                    </p>
                    <ul className="space-y-2 font-mono text-[11px] text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <strong>.JAR:</strong> FreeJ2ME / J2ME WebAssembly Core
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <strong>.SIS / .SISX:</strong> Symbian S60 EPOC Execution Bridge
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <strong>.GBA / .NES:</strong> Libretro EmulatorJS WASM
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                        <strong>.SWF:</strong> Ruffle Flash WebAssembly Runtime
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
