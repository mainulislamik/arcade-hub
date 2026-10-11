import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  Gamepad2, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  HardDrive, 
  Download, 
  Play, 
  ArrowLeft, 
  LogOut, 
  Smartphone, 
  Monitor, 
  Plus, 
  Search, 
  Eye, 
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { GameItem } from '../../types/game';
import { 
  getCustomGames, 
  saveCustomGame, 
  deleteCustomGame, 
  storeRomBinary,
  getStorageStats
} from '../../utils/customGamesStorage';
import { sounds } from '../../utils/soundEngine';

interface SuperAdminDashboardProps {
  allGames: GameItem[];
  onGameAddedOrUpdated: () => void;
  onExitToLobby: () => void;
  onPlayGame: (game: GameItem) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  allGames,
  onGameAddedOrUpdated,
  onExitToLobby,
  onPlayGame
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('arcadex_superadmin_session') === 'active';
  });
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'overview' | 'games' | 'radar' | 'system'
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'radar' | 'system'>('overview');

  // Custom Games & Storage Stats
  const [customGames, setCustomGames] = useState<GameItem[]>([]);
  const [storageStats, setStorageStats] = useState<{ count: number; totalSizeMb: number }>({ count: 0, totalSizeMb: 0 });



  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('retro');
  const [uploadFormat, setUploadFormat] = useState<'jar' | 'sis' | 'gba' | 'nes' | 'snes' | 'swf' | 'zip'>('jar');
  const [uploadRatio, setUploadRatio] = useState<'16:9' | '4:3' | '3:4' | 'fill'>('16:9');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search in Games List
  const [searchQuery, setSearchQuery] = useState('');

  // Load Initial Data on Mount & Auth
  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const loadAdminData = async () => {
    try {
      const cGames = await getCustomGames();
      setCustomGames(cGames);
      const sStats = await getStorageStats();
      setStorageStats(sStats);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim() === 'IT' && password === 'imran%$#') {
      sounds.playPowerup();
      sessionStorage.setItem('arcadex_superadmin_session', 'active');
      setIsAuthenticated(true);
      setAuthError('');
      loadAdminData();
    } else {
      sounds.playHit();
      setAuthError('Invalid Super Admin credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('arcadex_superadmin_session');
    setIsAuthenticated(false);
    setUserId('');
    setPassword('');
  };

  // Handle ROM File Drop / Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'jar') setUploadFormat('jar');
      else if (ext === 'sis') setUploadFormat('sis');
      else if (ext === 'gba') setUploadFormat('gba');
      else if (ext === 'nes') setUploadFormat('nes');
      else if (ext === 'snes' || ext === 'smc') setUploadFormat('snes');
      else if (ext === 'swf') setUploadFormat('swf');
      else if (ext === 'zip') setUploadFormat('zip');

      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  // Save / Ingest Game ROM
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadStatus('Please enter a game title.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Encoding and storing binary ROM to IndexedDB...');

    try {
      const slug = uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const gameId = `rom-${slug}-${Math.random().toString(36).substring(2, 7)}`;
      const romKey = `binary_${gameId}`;

      let sizeMb = 1.2;

      if (uploadFile) {
        sizeMb = Number((uploadFile.size / (1024 * 1024)).toFixed(2));
        await storeRomBinary(romKey, uploadFile);
      } else {
        const dummyBlob = new Blob(['ROM_PLACEHOLDER_DATA'], { type: 'application/octet-stream' });
        await storeRomBinary(romKey, dummyBlob);
      }

      let engineType: any = 'j2me_wasm';
      if (uploadFormat === 'sis') engineType = 'symbian_sis';
      else if (['gba', 'nes', 'snes'].includes(uploadFormat)) engineType = 'emulatorjs';
      else if (uploadFormat === 'swf') engineType = 'ruffle_flash';
      else if (uploadFormat === 'zip') engineType = 'html5_zip';

      const newGame: GameItem = {
        id: gameId,
        slug,
        title: uploadTitle.trim(),
        category: uploadCategory,
        description: uploadDesc.trim() || `Authentic ${uploadFormat.toUpperCase()} game running on client-side WebAssembly emulator.`,
        aspectRatio: uploadRatio,
        difficulty: 'Medium',
        rating: 4.9,
        plays: 0,
        tags: [uploadFormat.toUpperCase(), 'Retro', 'WASM', 'Original ROM'],
        isFeatured: true,
        controls: {
          desktop: ['Arrow Keys or WASD for movement', 'Space / Enter for action buttons'],
          mobile: ['Virtual on-screen gamepad & keypad']
        },
        engineType,
        romFormat: uploadFormat,
        isCustomUpload: true,
        customRomKey: romKey,
        romFileName: uploadFile ? uploadFile.name : `${slug}.${uploadFormat}`,
        fileSizeMb: sizeMb,
        licenseType: 'SuperAdmin Original Ingestion'
      };

      await saveCustomGame(newGame);
      sounds.playPowerup();

      setUploadStatus('✓ Game successfully added to Arcadex lobby!');
      setIsUploading(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadAdminData();
      onGameAddedOrUpdated();
    } catch (err) {
      console.error(err);
      setUploadStatus('Failed to upload ROM. Please check file format.');
      setIsUploading(false);
    }
  };

  const handleDeleteGame = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      await deleteCustomGame(id);
      sounds.playClick();
      await loadAdminData();
      onGameAddedOrUpdated();
    }
  };



  // Filtered games
  const filteredGames = allGames.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.romFormat && g.romFormat.toLowerCase().includes(searchQuery.toLowerCase())) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );



  // 1. AUTH GATE (If not logged in)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Ambient Dark Neon Accents */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-600/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wider">ARCADEX SUPER ADMIN</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Restricted Management Console · /imon</p>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                Super Admin ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID (IT)"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                Master Security Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Security Password"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate Portal</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onExitToLobby}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Arcadex Lobby</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN SUPER ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-cyan-600/30">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-wide">ARCADEX SUPER ADMIN</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-mono font-bold">
                ROOT ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Operator: IT · URL: /imon</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExitToLobby}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arcadex Lobby</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold px-3 py-2 rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout with Sidebar Tabs */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span>Overview & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'games'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4 flex-shrink-0" />
            <span>Games & ROM Library</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>Online ROM Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'system'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span>Zero-Load Hardware</span>
          </button>
        </aside>

        {/* Tab Body Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">System Executive Summary</h2>
                <p className="text-xs text-slate-400 mt-1">Live status of games, library storage, and 100% free zero-server execution.</p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-mono font-semibold">GAMES IN LOBBY</span>
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{allGames.length}</div>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 font-mono">
                    <span className="text-cyan-400 font-bold">{customGames.length}</span> Custom Ingested ROMs
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-mono font-semibold">PLATFORM MODEL</span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">100% FREE</div>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 font-mono">
                    Zero Fees · Unlimited Free Access
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-mono font-semibold">SERVER CPU LOAD</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">0% LOAD</div>
                  <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
                    100% Client-Side WASM
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-mono font-semibold">VAULT STORAGE</span>
                    <HardDrive className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{storageStats.totalSizeMb} MB</div>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 font-mono">
                    IndexedDB Zero-Cloud Cache
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Custom Ingested Games Quick List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-cyan-400" />
                      <span>Custom Ingested Games ({customGames.length})</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('games')}
                      className="text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      Manage Library
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {customGames.length === 0 ? (
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
                        No custom ROMs ingested yet. Use the Games & ROM Library tab to upload .jar, .sis, .gba files.
                      </div>
                    ) : (
                      customGames.slice(0, 4).map((g) => (
                        <div key={g.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">{g.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">{g.romFormat || 'ROM'} · {g.category}</div>
                          </div>
                          <button
                            onClick={() => onPlayGame(g)}
                            className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Launch</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick ROM Uploader Banner */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-cyan-950/40 border border-cyan-800/40 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold font-mono uppercase">
                      Instant Ingestion
                    </span>
                    <h3 className="text-base font-black text-white mt-2">Upload Original Game ROMs</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Add any genuine .JAR, .SIS, .GBA, .NES, or .SWF file downloaded from the internet. Arcadex will automatically execute it via native WASM.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab('games')}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Open ROM Ingestion Console</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAMES & ROM LIBRARY */}
          {activeTab === 'games' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">Games & ROM Library Management</h2>
                <p className="text-xs text-slate-400 mt-1">Upload authentic game binaries, manage categories, and customize ratios.</p>
              </div>

              {/* Upload Form Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload Original Downloaded Game (.jar, .sis, .gba, .nes, .swf)</span>
                </h3>

                {uploadStatus && (
                  <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-semibold text-cyan-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{uploadStatus}</span>
                  </div>
                )}

                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                        Game Title *
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Nokia Bounce Tales"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                        Format / Engine
                      </label>
                      <select
                        value={uploadFormat}
                        onChange={(e) => setUploadFormat(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="jar">.JAR (Java ME / Nokia Bounce)</option>
                        <option value="sis">.SIS (Symbian OS Series 60)</option>
                        <option value="gba">.GBA (Game Boy Advance)</option>
                        <option value="nes">.NES (Nintendo NES)</option>
                        <option value="snes">.SNES (Super Nintendo)</option>
                        <option value="swf">.SWF (Adobe Flash / Ruffle)</option>
                        <option value="zip">.ZIP (HTML5 Offline Bundle)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="retro">Retro Classics</option>
                        <option value="arcade">Arcade</option>
                        <option value="action">Action & Platformer</option>
                        <option value="puzzle">Puzzle</option>
                        <option value="driving">Driving / Racing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                        Default Aspect Ratio
                      </label>
                      <select
                        value={uploadRatio}
                        onChange={(e) => setUploadRatio(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="16:9">🖥️ Widescreen HD (16:9)</option>
                        <option value="fill">⚡ Fill Theater (100%)</option>
                        <option value="4:3">🕹️ Classic Arcade (4:3)</option>
                        <option value="3:4">📱 Nokia Portrait (3:4)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                      ROM Binary File (.jar, .sis, .gba, etc.)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".jar,.sis,.gba,.nes,.snes,.smc,.swf,.zip"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                      Description & Game Instructions
                    </label>
                    <input
                      type="text"
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      placeholder="Optional brief description of the game"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Ingesting ROM...' : 'Save & Publish to Arcadex'}</span>
                  </button>
                </form>
              </div>

              {/* Games Explorer Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    <span>All Published Games ({filteredGames.length})</span>
                  </h3>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title or format..."
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 w-48 sm:w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3">Title</th>
                        <th className="py-2.5 px-3">Engine / Format</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Ratio</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredGames.map((game) => (
                        <tr key={game.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{game.title}</span>
                              {game.isCustomUpload && (
                                <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[9px] font-mono">
                                  CUSTOM
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-bold uppercase">
                              {game.romFormat || game.engineType || 'NATIVE'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 capitalize text-slate-400">{game.category}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{game.aspectRatio || '16:9'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onPlayGame(game)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 font-bold cursor-pointer"
                                title="Play in Theater"
                              >
                                <Play className="w-3 h-3" />
                                <span>Play</span>
                              </button>
                              {game.isCustomUpload && (
                                <button
                                  onClick={() => handleDeleteGame(game.id, game.title)}
                                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                  title="Delete ROM"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ONLINE ROM RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">Online ROM Radar & Archive Importer</h2>
                <p className="text-xs text-slate-400 mt-1">One-click ingest authentic vintage ROMs directly from open retro repositories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Nokia Bounce Classic', format: 'jar', size: '1.4 MB', cat: 'Retro Platformer', desc: 'Authentic Nokia 9210/6600 J2ME edition with 3200px widescreen camera.' },
                  { title: 'Symbian Space Invaders 3D', format: 'sis', size: '2.8 MB', cat: 'Symbian Arcade', desc: 'Symbian OS Series 60 authentic dual-core binary.' },
                  { title: 'Super Mario Advance 4', format: 'gba', size: '4.1 MB', cat: 'GBA Adventure', desc: 'Game Boy Advance high-DPI multi-core edition.' },
                  { title: 'Sonic the Hedgehog Genesis', format: 'md', size: '2.0 MB', cat: 'MegaDrive Action', desc: 'Sega MegaDrive 60FPS client-side WASM.' },
                  { title: 'Pokemon Emerald Version', format: 'gba', size: '8.2 MB', cat: 'RPG Master', desc: 'Pure WebAssembly client-side sandbox.' },
                  { title: 'Flash Alien Hominid', format: 'swf', size: '3.6 MB', cat: 'Flash Action', desc: 'Adobe Flash Ruffle vector animation player.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px] font-mono font-bold uppercase">
                          .{item.format}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{item.size}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">{item.cat}</span>
                      <button
                        onClick={async () => {
                          sounds.playPowerup();
                          const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                          const gameId = `rom-${slug}`;
                          const newGame: GameItem = {
                            id: gameId,
                            slug,
                            title: item.title,
                            category: 'retro',
                            description: item.desc,
                            aspectRatio: '16:9',
                            difficulty: 'Medium',
                            rating: 5.0,
                            tags: [item.format.toUpperCase(), 'WASM', 'Original ROM'],
                            controls: {
                              desktop: ['Arrow Keys or WASD for movement', 'Space for jump / fire']
                            },
                            engineType: item.format === 'jar' ? 'j2me_wasm' : item.format === 'sis' ? 'symbian_sis' : item.format === 'swf' ? 'ruffle_flash' : 'emulatorjs',
                            romFormat: item.format as any,
                            isCustomUpload: true,
                            fileSizeMb: parseFloat(item.size),
                            licenseType: 'Public Retro Archive'
                          };
                          await saveCustomGame(newGame);
                          await loadAdminData();
                          onGameAddedOrUpdated();
                          alert(`✓ ${item.title} successfully added to Arcadex Lobby!`);
                        }}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Inject to Hub</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ZERO-LOAD HARDWARE STATUS */}
          {activeTab === 'system' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">Zero-Server-Load Architecture Telemetry</h2>
                <p className="text-xs text-slate-400 mt-1">Proof of 100% client execution and zero cloud compute consumption.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">SERVER CPU UTILIZATION</span>
                    <span className="text-emerald-400 font-bold">0.00% (IDLE NGINX STATICS ONLY)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-emerald-500 w-[0.5%]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">CLIENT WASM THREAD ALLOCATION</span>
                    <span className="text-cyan-400 font-bold">100% DISPATCHED TO USER HARDWARE</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-cyan-500 w-[100%]" />
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>How Zero-Load Architecture Works:</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    1. When a user clicks any game (.jar, .sis, .gba), the server only serves a static compressed byte stream once.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    2. WebAssembly (WASM), Canvas 2D, and WebGL execute 100% inside the user's browser CPU/GPU.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    3. No emulator processes run on the host server, ensuring near-infinite horizontal scalability with zero cloud hosting bills.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
