import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Code2, 
  DollarSign, 
  FileCheck, 
  CheckCircle2, 
  Zap,
  Globe,
  Terminal,
  Smartphone,
  Cpu
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface DeveloperPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperPortalModal: React.FC<DeveloperPortalModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'guidelines' | 'revenue'>('upload');
  const [gameTitle, setGameTitle] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [email, setEmail] = useState('');
  const [engineType, setEngineType] = useState('html5');
  const [licenseAgreed, setLicenseAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseAgreed) return;
    sounds.playPowerup();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Arcadex Developer Hub
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                  50% RevShare
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Publish your HTML5, J2ME, DOS, or WebAssembly games to millions of players.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Submit New Game
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            DMCA & Copyright Guidelines
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'revenue'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Revenue & AdSense Model
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' && (
            <div>
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Game Submitted Successfully!</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Our automated security & copyright scanner will review "{gameTitle}". You will receive revenue portal credentials at {email} within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Game Title</label>
                      <input 
                        type="text" 
                        required 
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        placeholder="e.g. Cyber Runner 2099" 
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Developer / Studio Name</label>
                      <input 
                        type="text" 
                        required 
                        value={developerName}
                        onChange={(e) => setDeveloperName(e.target.value)}
                        placeholder="e.g. Pixel Forge Games" 
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Developer Email</label>
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@studio.com" 
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Game Engine Core</label>
                      <select 
                        value={engineType}
                        onChange={(e) => setEngineType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="html5">HTML5 Canvas / WebGL (Instant 60 FPS)</option>
                        <option value="j2me">Java J2ME Mobile (.jar / .jad)</option>
                        <option value="dos">Retro DOS / Windows (.zip / WASM)</option>
                        <option value="wasm">Custom WebAssembly Engine</option>
                      </select>
                    </div>
                  </div>

                  {/* File Upload Simulation Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Game Archive (.zip / .jar / index.html)</label>
                    <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-950/50 rounded-2xl p-6 text-center transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">Drag & drop your game package or click to browse</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports HTML5 zip bundles, J2ME .jar files, and DOSBox packages (Max 50MB)</p>
                    </div>
                  </div>

                  {/* DMCA Safe Compliance Check */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="dmca-agree" 
                      checked={licenseAgreed}
                      onChange={(e) => setLicenseAgreed(e.target.checked)}
                      className="mt-1 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="dmca-agree" className="text-xs text-slate-300">
                      I declare that this game is 100% original, freeware, open-source, or authorized for distribution. It contains zero copyrighted assets or trademarks from 3rd-party corporations.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!licenseAgreed}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      licenseAgreed 
                        ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-lg shadow-indigo-600/30' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Publish Game to Arcadex
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Strict Zero-Infringement Policy
                </h4>
                <p>
                  To protect Google AdSense accounts and developer revenue, Arcadex strictly prohibits pirated ROMs, commercial rips, or unauthorized trademarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <h5 className="font-bold text-emerald-400 mb-2">✅ Allowed Content</h5>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li>100% Original HTML5 / Canvas games</li>
                    <li>Homebrew J2ME and retro mobile games</li>
                    <li>Freeware & Public Domain DOS titles</li>
                    <li>MIT / Apache / BSD Licensed projects</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <h5 className="font-bold text-rose-400 mb-2">❌ Strictly Forbidden</h5>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li>Commercial proprietary ROMs</li>
                    <li>Trademarked brand names & logos</li>
                    <li>Unauthorized commercial rips</li>
                    <li>Malicious or mining scripts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">50/50 Revenue Sharing Model</h4>
                  <p className="text-slate-400 mt-0.5">
                    Developers earn 50% of all gross ad revenue generated from Pre-roll H5 ads, sidebar banners, and leaderboard impressions on their game page.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-base font-black text-emerald-400">$100</div>
                  <div className="text-[10px] text-slate-400 mt-1">Minimum Payout</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-base font-black text-sky-400">Monthly</div>
                  <div className="text-[10px] text-slate-400 mt-1">Direct Wire / PayPal</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-base font-black text-amber-400">Real-time</div>
                  <div className="text-[10px] text-slate-400 mt-1">Live Analytics Radar</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
