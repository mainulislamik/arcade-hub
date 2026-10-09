import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Maximize2, 
  Share2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Star, 
  Gamepad2, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  HelpCircle, 
  Check, 
  ArrowLeft,
  Info,
  Calendar,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Camera,
  Users,
  Tv,
  Smartphone,
  Monitor,
  Save,
  Film,
  Bot
} from 'lucide-react';
import { GameItem } from '../types/game';
import { sounds } from '../utils/soundEngine';
import { recordGamePlay } from '../utils/storage';
import { SandboxedGamePlayer } from './player/SandboxedGamePlayer';
import { AmbientBacklight } from './player/AmbientBacklight';
import { RetroShaderOverlay, ShaderPreset } from './player/RetroShaderOverlay';
import { SpeedrunTimer } from './player/SpeedrunTimer';
import { MultiplayerLobbyModal } from './multiplayer/MultiplayerLobbyModal';
import { SaveStateQuickHUD } from './player/SaveStateQuickHUD';
import { ReplayExportModal } from './player/ReplayExportModal';
import { AchievementNotification } from './player/AchievementNotification';
import { AiGamingCoachModal } from './player/AiGamingCoachModal';
import { AchievementEngine } from '../utils/achievementEngine';
import { ReplayRecorder } from '../utils/replayRecorder';
import { SaveStateManager } from '../utils/saveStateManager';
import { HapticEngine } from '../utils/hapticEngine';
import { WebRTCPeerEngine } from '../utils/webrtcMultiplayer';
import { TRANSLATIONS, LanguageCode } from '../utils/i18n';
import { recordQuestAction } from '../utils/gamification';
import { useGamepad } from '../hooks/useGamepad';
import { GamepadHUD } from './player/GamepadHUD';
import { AdSenseBanner } from './ads/AdSenseBanner';
import { GameInterstitialAd } from './ads/GameInterstitialAd';
import { GameSEO } from './seo/GameSEO';
import { recordGameScore, recordPlayDuration } from '../utils/gameStateSync';

interface GameTheaterPageProps {
  game: GameItem;
  allGames: GameItem[];
  onBackToLobby: () => void;
  onSelectGame: (game: GameItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLanguage?: LanguageCode;
}

export const GameTheaterPage: React.FC<GameTheaterPageProps> = ({
  game,
  allGames,
  onBackToLobby,
  onSelectGame,
  isFavorite,
  onToggleFavorite,
  soundEnabled,
  onToggleSound,
  currentLanguage = 'en'
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  
  const [likes, setLikes] = useState<number>(Math.floor((game.rating || 4.8) * 240));
  const [dislikes, setDislikes] = useState<number>(12);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  
  // Advanced features state
  const [ambientGlowEnabled, setAmbientGlowEnabled] = useState(true);
  const [arcadeCabinetMode, setArcadeCabinetMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'auto' | '16:9' | '4:3' | '3:4' | '9:16' | 'fill'>('auto');
  const [shaderPreset, setShaderPreset] = useState<ShaderPreset>('none');
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showSaveStateHUD, setShowSaveStateHUD] = useState(false);
  const [showAiCoachModal, setShowAiCoachModal] = useState(false);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [replayBlob, setReplayBlob] = useState<Blob | null>(null);
  const [activePeerEngine, setActivePeerEngine] = useState<WebRTCPeerEngine | null>(null);
  const [peerRole, setPeerRole] = useState<'host' | 'guest' | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  const theaterContainerRef = useRef<HTMLDivElement>(null);
  const replayRecorderRef = useRef<ReplayRecorder>(new ReplayRecorder());
  const gamepad = useGamepad();

  // Scroll to top, record daily quest play action, unlock trophy & session timer
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    recordQuestAction('play', 1);
    AchievementEngine.unlockTrophy('first_blood');

    const startTime = Date.now();
    return () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      if (durationSeconds > 5) {
        recordPlayDuration(game.id, durationSeconds);
      }
      if (durationSeconds > 300) {
        AchievementEngine.unlockTrophy('speed_demon');
      }
    };
  }, [game.id]);

  // Handle global F1 (Save), F3 (Load), \ (Rewind) hotkeys
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        sounds.playPowerup();
        HapticEngine.bounceImpulse();
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        await SaveStateManager.saveSlot(1, game.id, game.title, currentScore, 1, { score: currentScore }, canvas);
      } else if (e.key === 'F3') {
        e.preventDefault();
        const slot = SaveStateManager.getSlot(1, game.id);
        if (slot) {
          sounds.playPowerup();
          HapticEngine.victoryFanfare();
          setCurrentScore(slot.score);
        }
      } else if (e.key === '\\') {
        e.preventDefault();
        sounds.playPowerup();
        HapticEngine.bounceImpulse();
        AchievementEngine.unlockTrophy('rewind_master');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.id, game.title, currentScore]);

  // Score tracking for achievement
  useEffect(() => {
    if (currentScore >= 1000) {
      AchievementEngine.unlockTrophy('bounce_veteran');
    }
  }, [currentScore]);

  const handleExportReplay = async () => {
    sounds.playClick();
    HapticEngine.lightTick();
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (!replayRecorderRef.current.isCurrentlyRecording()) {
      replayRecorderRef.current.start(canvas);
      setTimeout(async () => {
        const blob = await replayRecorderRef.current.stopAndGetClip();
        if (blob) {
          setReplayBlob(blob);
          setShowReplayModal(true);
        }
      }, 3000);
    } else {
      const blob = await replayRecorderRef.current.stopAndGetClip();
      if (blob) {
        setReplayBlob(blob);
        setShowReplayModal(true);
      }
    }
  };

  const handleVote = (type: 'like' | 'dislike') => {
    sounds.playClick();
    if (userVote === type) {
      setUserVote(null);
      if (type === 'like') setLikes(l => l - 1);
      else setDislikes(d => d - 1);
    } else {
      if (userVote === 'like') setLikes(l => l - 1);
      if (userVote === 'dislike') setDislikes(d => d - 1);
      
      setUserVote(type);
      if (type === 'like') {
        setLikes(l => l + 1);
        sounds.playPowerup();
      } else {
        setDislikes(d => d + 1);
      }
    }
  };

  const handleShare = () => {
    sounds.playClick();
    const url = window.location.origin + '/?game=' + game.slug;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleFullscreen = () => {
    sounds.playClick();
    if (theaterContainerRef.current) {
      if (!document.fullscreenElement) {
        theaterContainerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setGameKey(k => k + 1);
  };

  // Instant In-Game Canvas Snapshot / Highlight Clipper
  const handleTakeSnapshot = () => {
    sounds.playClick();
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `arcadex-${game.slug}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        sounds.playCoin();
        setSnapshotTaken(true);
        setTimeout(() => setSnapshotTaken(false), 2000);
      }
    } catch {
      // Cross-origin fallback
      setSnapshotTaken(true);
      setTimeout(() => setSnapshotTaken(false), 2000);
    }
  };

  const relatedGames = allGames
    .filter(g => g.id !== game.id)
    .slice(0, 6);

  // Aspect ratio class mapper with responsive height & auto-fit
  const getAspectRatioContainerClass = () => {
    switch (aspectRatio) {
      case '16:9': return 'w-full aspect-[16/9] max-h-[88vh]';
      case '4:3': return 'w-full max-w-[960px] aspect-[4/3] max-h-[88vh] mx-auto';
      case '3:4': return 'w-full max-w-[620px] aspect-[3/4] max-h-[88vh] mx-auto';
      case '9:16': return 'w-full max-w-[480px] aspect-[9/16] max-h-[88vh] mx-auto';
      case 'fill': return 'w-full h-[82vh] max-h-[920px]';
      default: {
        // Auto detection based on platform / game properties
        const fmt = (game.romFormat || game.platform || '').toLowerCase();
        if (fmt === 'jar' || fmt === 'sis' || game.aspectRatio === '9:16' || game.aspectRatio === '3:4') {
          return 'w-full max-w-[640px] aspect-[3/4] max-h-[88vh] mx-auto';
        }
        if (['gba', 'nes', 'snes', 'gb', 'arcade', 'retro'].includes(fmt) || game.aspectRatio === '4:3') {
          return 'w-full max-w-[960px] aspect-[4/3] max-h-[88vh] mx-auto';
        }
        return 'w-full min-h-[540px] h-[78vh] max-h-[880px]';
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 transition-all duration-300">
      {/* Deep SEO Schema.org & Meta Tags */}
      <GameSEO game={game} />

      {/* Optional Interstitial Break Ad */}
      <GameInterstitialAd 
        isOpen={showInterstitial} 
        onClose={() => setShowInterstitial(false)} 
        title={`${game.title} · Reward Break`} 
      />

      {/* Breadcrumb Navigation & Gamepad HUD */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button 
            onClick={onBackToLobby}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-bold text-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Arcadex
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="capitalize text-slate-600 font-semibold">{game.category}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{game.title}</span>
        </nav>
        
        {/* Gamepad Active Badge */}
        <GamepadHUD gamepad={gamepad} />
      </div>

      {/* Main Theater Card Container */}
      <div className={`transition-all duration-300 ${isTheaterExpanded ? 'max-w-none' : 'max-w-6xl mx-auto'}`}>
        {/* Game Title Bar & Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.gradient || 'from-indigo-600 to-sky-500'} flex items-center justify-center text-white text-2xl shadow-md`}>
              {game.icon || '🎮'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{game.title}</h1>
                {game.badge && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-300">
                    {game.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {game.rating?.toFixed(1) || '4.9'}
                </span>
                <span>•</span>
                <span className="capitalize font-semibold text-slate-700">{game.category}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {t.serverLoadZero}
                </span>
                {activePeerEngine && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 animate-pulse">
                      <Users className="w-3 h-3" />
                      P2P {peerRole === 'host' ? 'Host' : 'Guest'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Aspect Ratio Switcher Dropdown */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-bold text-slate-600">
              <button
                onClick={() => { sounds.playClick(); setAspectRatio('auto'); }}
                className={`px-2 py-1 rounded-lg transition-all ${aspectRatio === 'auto' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="Full Responsive"
              >
                Auto
              </button>
              <button
                onClick={() => { sounds.playClick(); setAspectRatio('16:9'); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${aspectRatio === '16:9' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="16:9 Widescreen (PC/Console)"
              >
                <Tv className="w-3 h-3" /> 16:9
              </button>
              <button
                onClick={() => { sounds.playClick(); setAspectRatio('4:3'); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${aspectRatio === '4:3' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="4:3 Retro Arcade"
              >
                <Monitor className="w-3 h-3" /> 4:3
              </button>
              <button
                onClick={() => { sounds.playClick(); setAspectRatio('9:16'); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${aspectRatio === '9:16' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="9:16 Mobile Vertical"
              >
                <Smartphone className="w-3 h-3" /> 9:16
              </button>
            </div>

            {/* Retro CRT & Screen FX Shaders */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-bold text-slate-600">
              <span className="text-[10px] font-mono text-slate-400 px-1.5 uppercase">FX:</span>
              <button
                onClick={() => { sounds.playClick(); setShaderPreset('none'); }}
                className={`px-2 py-1 rounded-lg transition-all ${shaderPreset === 'none' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Off
              </button>
              <button
                onClick={() => { sounds.playClick(); setShaderPreset('crt'); }}
                className={`px-2 py-1 rounded-lg transition-all ${shaderPreset === 'crt' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="CRT Monitor Scanlines & Phosphor"
              >
                CRT
              </button>
              <button
                onClick={() => { sounds.playClick(); setShaderPreset('gameboy'); }}
                className={`px-2 py-1 rounded-lg transition-all ${shaderPreset === 'gameboy' ? 'bg-white text-lime-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="Game Boy Dot-Matrix 4-Shade Green"
              >
                GameBoy
              </button>
              <button
                onClick={() => { sounds.playClick(); setShaderPreset('cyberpunk'); }}
                className={`px-2 py-1 rounded-lg transition-all ${shaderPreset === 'cyberpunk' ? 'bg-white text-pink-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="Cyberpunk Neon Bloom"
              >
                Cyber
              </button>
              <button
                onClick={() => { sounds.playClick(); setShaderPreset('vhs'); }}
                className={`px-2 py-1 rounded-lg transition-all ${shaderPreset === 'vhs' ? 'bg-white text-amber-600 shadow-sm' : 'hover:text-slate-900'}`}
                title="VHS Tape Glitch"
              >
                VHS
              </button>
            </div>

            {/* Ambient LED Glow Toggle */}
            <button
              onClick={() => { sounds.playClick(); setAmbientGlowEnabled(!ambientGlowEnabled); }}
              className={`p-2 rounded-xl transition-all border ${
                ambientGlowEnabled 
                  ? 'bg-amber-50 text-amber-600 border-amber-200' 
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
              }`}
              title={ambientGlowEnabled ? "Ambient LED Glow: Enabled" : "Ambient LED Glow: Disabled"}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Canvas Screenshot & Clip Tool */}
            <button
              onClick={handleTakeSnapshot}
              className={`p-2 rounded-xl transition-all border ${
                snapshotTaken
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Take Game Snapshot / Screenshot"
            >
              {snapshotTaken ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </button>

            {/* P2P Multiplayer Lobby Button */}
            <button
              onClick={() => { sounds.playClick(); setShowMultiplayerModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              title="2-Player WebRTC P2P Multiplayer (0% Server Load)"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.multiplayerP2P}</span>
            </button>

            {/* Like Button */}
            <button
              onClick={() => handleVote('like')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                userVote === 'like'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${userVote === 'like' ? 'fill-emerald-600' : ''}`} />
              <span>{likes}</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onToggleFavorite(game.id);
              }}
              className={`p-2 rounded-xl transition-all border ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Save State & Rewind Vault */}
            <button
              onClick={() => { sounds.playClick(); HapticEngine.lightTick(); setShowSaveStateHUD(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              title="Quick Save (F1) / Load (F3) / Rewind (\)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save/Load</span>
            </button>

            {/* Instant 30s Replay Clip */}
            <button
              onClick={handleExportReplay}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              title="Record & Export 30-Second Replay Video"
            >
              <Film className="w-3.5 h-3.5" />
              <span>30s Clip</span>
            </button>

            {/* AI Gaming Coach */}
            <button
              onClick={() => { sounds.playClick(); HapticEngine.lightTick(); setShowAiCoachModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              title="Open Arcadex AI Gaming Coach & Strategies"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Coach</span>
            </button>

            {/* 3D Arcade Cabinet Mode Toggle */}
            <button
              onClick={() => { sounds.playClick(); setArcadeCabinetMode(!arcadeCabinetMode); }}
              className={`p-2 rounded-xl transition-all border ${
                arcadeCabinetMode 
                  ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle 3D Retro Arcade Cabinet Mode"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            </button>

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
              title={t.restart}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            <button
              onClick={() => setIsTheaterExpanded(!isTheaterExpanded)}
              className="hidden md:flex p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
              title="Expand Theater"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
              title={t.fullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? t.copied : t.share}</span>
            </button>
          </div>
        </div>

        {/* Ambient Backlight Dynamic Glow Wrapper */}
        <AmbientBacklight enabled={ambientGlowEnabled} intensity="medium">
          {/* Theater Game Canvas Area */}
          <div 
            ref={theaterContainerRef}
            className={`relative bg-slate-950 border-x border-b border-slate-200 overflow-hidden flex flex-col items-center justify-center rounded-b-2xl shadow-lg transition-all duration-300 ${getAspectRatioContainerClass()}`}
          >
            {/* Retro Shaders Overlay Wrapper (CRT / GameBoy / Cyber / VHS) */}
            <RetroShaderOverlay preset={shaderPreset}>
              {/* Active Sandboxed Multi-Core Game Runner */}
              <SandboxedGamePlayer
                key={`${game.id}-${gameKey}`}
                game={game}
                soundEnabled={soundEnabled}
                onToggleSound={onToggleSound}
                aspectRatio={aspectRatio}
                onScoreUpdate={(s) => {
                  setCurrentScore(s);
                  recordQuestAction('score', s);
                }}
                onGameOver={(s) => {
                  setCurrentScore(s);
                  recordGamePlay(game.id, s);
                  recordGameScore(game.id, s);
                  recordQuestAction('score', s);
                }}
              />
            </RetroShaderOverlay>
          </div>
        </AmbientBacklight>

        {/* Speedrun Precision Timer & PB Tracker Bar */}
        <div className="mt-3">
          <SpeedrunTimer gameId={game.id} gameTitle={game.title} isGameActive={true} />
        </div>

        {/* Google AdSense Responsive High-CTR Leaderboard Slot */}
        <div className="my-6">
          <AdSenseBanner slotId="1001001001" format="horizontal" />
        </div>

        {/* 2-Column Main Section: Rich SEO Guide & Related Games */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-8">
          {/* Left 2 Columns: Rich Game Guide, Controls, FAQs (SEO Dominance) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Game Overview Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                About {game.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {game.longDescription || game.description}
              </p>

              {/* Game Features Bullet List */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t.features}</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    100% Client-Side Web Execution
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Zero Downloads or Install Required
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Synthesized 60 FPS Web Audio
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    Mobile Touch & Desktop Responsive
                  </li>
                </ul>
              </div>
            </section>

            {/* Interactive Game Controls Table */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-indigo-600" />
                {t.controlsGuide}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold">
                      <th className="py-2.5 px-4 rounded-l-lg">Action</th>
                      <th className="py-2.5 px-4">Desktop / Keyboard</th>
                      <th className="py-2.5 px-4 rounded-r-lg">Mobile / Touchpad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">Primary Movement</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">
                          {game.controls?.keyboard || 'Arrow Keys / WASD'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {game.controls?.touch || 'Swipe on screen or Virtual D-Pad'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">Action / Fire / Select</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">
                          Spacebar / Left Click / Enter
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        Tap on Action Button / Screen
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">Pause / Menu</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">
                          P or ESC
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        Pause icon at top-right
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* How to Play & Pro Tips */}
            {game.howToPlay && game.howToPlay.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {t.howToPlay}
                </h2>
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  {game.howToPlay.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[11px] flex items-center justify-center shrink-0 border border-indigo-100">
                        {idx + 1}
                      </span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>

                {game.tips && game.tips.length > 0 && (
                  <div className="mt-5 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                    <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                      <Flame className="w-4 h-4 text-amber-600" />
                      Pro Tips for High Scores
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-xs text-amber-800">
                      {game.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Interactive FAQs Accordion (Schema.org FAQPage) */}
            {game.faqs && game.faqs.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  Frequently Asked Questions (FAQ)
                </h2>

                <div className="space-y-3">
                  {game.faqs.map((faq, idx) => {
                    const isOpen = activeFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-900 pr-4">{faq.question}</span>
                          <span className="text-slate-400 font-bold text-sm">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Game Metadata Box & Related Games Bento Grid */}
          <div className="space-y-6">
            {/* Game Info Metadata Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="w-4 h-4 text-indigo-600" />
                Game Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Developer</span>
                  <span className="font-bold text-slate-800">{game.developer || 'Arcadex Open Core'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">License</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold rounded text-[10px] border border-emerald-200">
                    {game.license || 'MIT Open-Source'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Release Date</span>
                  <span className="font-semibold text-slate-700">{game.releaseDate || 'October 2026'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Platform</span>
                  <span className="font-semibold text-slate-700 capitalize">{game.platform || 'Web Browser'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Execution Engine</span>
                  <span className="font-semibold text-indigo-600">{game.engineType || 'Canvas 2D / WebGL'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Multiplayer Mode</span>
                  <span className="font-semibold text-violet-600">WebRTC P2P Ready</span>
                </div>
              </div>
            </div>

            {/* Related Games Suggestions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>{t.relatedGames}</span>
                <span className="text-xs text-indigo-600 font-semibold cursor-pointer" onClick={onBackToLobby}>
                  View All →
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {relatedGames.map((relGame) => (
                  <div
                    key={relGame.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectGame(relGame);
                    }}
                    className="group cursor-pointer rounded-xl bg-slate-50 border border-slate-200 p-3 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col items-center text-center"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${relGame.gradient || 'from-indigo-600 to-sky-500'} flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform`}>
                      {relGame.icon || '🎮'}
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                      {relGame.title}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {relGame.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar AdSense High CTR Rectangle Banner */}
            <div className="pt-2">
              <AdSenseBanner slotId="2002002002" format="rectangle" />
            </div>
          </div>
        </div>
      </div>

      {/* P2P Multiplayer Lobby Modal */}
      <MultiplayerLobbyModal
        isOpen={showMultiplayerModal}
        game={game}
        onClose={() => setShowMultiplayerModal(false)}
        onGameStart={(engine, role) => {
          setActivePeerEngine(engine);
          setPeerRole(role);
          setShowMultiplayerModal(false);
        }}
      />

      {/* Save State Vault & Quick HUD */}
      <SaveStateQuickHUD
        isOpen={showSaveStateHUD}
        onClose={() => setShowSaveStateHUD(false)}
        gameId={game.id}
        gameTitle={game.title}
        currentScore={currentScore}
        onRestoreState={(stateData) => {
          if (stateData?.score !== undefined) {
            setCurrentScore(stateData.score);
          }
        }}
        onTriggerRewind={() => {
          AchievementEngine.unlockTrophy('rewind_master');
        }}
      />

      {/* 30-Second Instant Replay Exporter Modal */}
      <ReplayExportModal
        isOpen={showReplayModal}
        onClose={() => setShowReplayModal(false)}
        videoBlob={replayBlob}
        gameTitle={game.title}
      />

      {/* AI Gaming Coach Modal */}
      <AiGamingCoachModal
        isOpen={showAiCoachModal}
        onClose={() => setShowAiCoachModal(false)}
        game={game}
        currentScore={currentScore}
      />

      {/* Steam / PlayStation Style Achievement Notification Toast */}
      <AchievementNotification />
    </div>
  );
};
