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
  Award
} from 'lucide-react';
import { GameItem } from '../types/game';
import { sounds } from '../utils/soundEngine';
import { recordGamePlay } from '../utils/storage';
import { SandboxedGamePlayer } from './player/SandboxedGamePlayer';

interface GameTheaterPageProps {
  game: GameItem;
  allGames: GameItem[];
  onBackToLobby: () => void;
  onSelectGame: (game: GameItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameTheaterPage: React.FC<GameTheaterPageProps> = ({
  game,
  allGames,
  onBackToLobby,
  onSelectGame,
  isFavorite,
  onToggleFavorite,
  soundEnabled,
  onToggleSound
}) => {
  const [likes, setLikes] = useState<number>(Math.floor((game.rating || 4.8) * 240));
  const [dislikes, setDislikes] = useState<number>(12);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const theaterContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [game.id]);

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

  const relatedGames = allGames
    .filter(g => g.id !== game.id)
    .slice(0, 6);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 transition-all duration-300">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
        <button 
          onClick={onBackToLobby}
          className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Arcadex
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="capitalize text-slate-600 font-semibold">{game.category}</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[200px]">{game.title}</span>
      </nav>

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
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {game.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{((game.plays || 12000) / 1000).toFixed(1)}k Plays</span>
                <span>•</span>
                <span className="capitalize font-medium text-slate-600">{game.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Like Button */}
            <button
              onClick={() => handleVote('like')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                userVote === 'like'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="I like this game"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${userVote === 'like' ? 'fill-emerald-600' : ''}`} />
              <span>{likes}</span>
            </button>

            {/* Dislike Button */}
            <button
              onClick={() => handleVote('dislike')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                userVote === 'dislike'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="I dislike this game"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${userVote === 'dislike' ? 'fill-rose-600' : ''}`} />
              <span>{dislikes}</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => {
                sounds.playPowerup();
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
              title="Restart Game"
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
              title="Fullscreen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Theater Game Canvas Area */}
        <div 
          ref={theaterContainerRef}
          className="relative bg-slate-950 border-x border-b border-slate-200 overflow-hidden flex flex-col items-center justify-center rounded-b-2xl shadow-lg"
        >
          {/* Active Sandboxed Multi-Core Game Runner */}
          <SandboxedGamePlayer
            key={`${game.id}-${gameKey}`}
            game={game}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            onScoreUpdate={(s) => setCurrentScore(s)}
            onGameOver={(s) => {
              setCurrentScore(s);
              recordGamePlay(game.id, s);
            }}
          />
        </div>

        {/* Policy-Safe Leaderboard Ad Placement Placeholder */}
        <div className="my-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[90px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            SPONSORED ADVERTISEMENT
          </span>
          <div className="text-xs text-slate-500 font-medium">
            Google AdSense Responsive Leaderboard (728x90 / 970x250 High CTR Slot)
          </div>
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Features</h3>
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
                Game Controls & Key Bindings
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
                  How to Play & Pro Strategies
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
                          className="w-full text-left p-3.5 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <span className={`text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
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

          {/* Right Column: Game Specs & Related Games Sidebar */}
          <div className="space-y-6">
            {/* Game Specifications Meta Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Game Specifications
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Developer</span>
                  <span className="font-bold text-slate-800">{game.developer || 'Arcadex Studio'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Engine Type</span>
                  <span className="font-bold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {game.engineType || 'Native Canvas 2D'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">License</span>
                  <span className="font-bold text-emerald-600">{game.licenseType || '100% Freeware (DMCA Clean)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Platforms</span>
                  <span className="font-bold text-slate-800">Web Browser, Mobile, PC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Release Date</span>
                  <span className="font-bold text-slate-800">{game.releaseDate || 'October 2026'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Server Load</span>
                  <span className="font-bold text-emerald-600">0% (Client Executed)</span>
                </div>
              </div>
            </div>

            {/* Skyscraper Banner Ad Placement */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                ADVERTISEMENT
              </span>
              <div className="text-xs text-slate-500 font-medium">
                Google AdSense 300x250 Medium Rectangle Slot
              </div>
            </div>

            {/* Related Games List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                More Games You May Like
              </h3>

              <div className="space-y-3">
                {relatedGames.map((relGame) => (
                  <button
                    key={relGame.id}
                    onClick={() => onSelectGame(relGame)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${relGame.gradient || 'from-indigo-600 to-sky-500'} flex items-center justify-center text-xl text-white shadow group-hover:scale-105 transition-transform`}>
                      {relGame.icon || '🕹️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {relGame.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-amber-500 font-bold">★ {relGame.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span className="capitalize text-slate-500">{relGame.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
