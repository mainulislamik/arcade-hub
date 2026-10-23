import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  ShieldCheck,
  Code2,
  FileCheck,
  CheckCircle2,
  Zap,
  Globe,
  Terminal,
  Smartphone,
  Cpu,
  Users,
  Award,
  HeartHandshake
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
  const [activeTab, setActiveTab] = useState<'upload' | 'guidelines' | 'community'>('upload');
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Arcadex Developer Hub
                <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                  100% Free & Open Web
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Publish your HTML5, J2ME, DOS, or WebAssembly games to millions of players worldwide.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Submit New Game
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            DMCA & Copyright Guidelines
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Community & Open Web Ecosystem
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' && (
            <div>
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Game Submitted Successfully!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Our automated security and open-source verification scanner will review "{gameTitle}". Your game showcase page and developer attribution will be live within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white transition-colors shadow-sm cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Game Title</label>
                      <input
                        type="text"
                        required
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        placeholder="e.g. Cyber Runner 2099"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Developer / Studio Name</label>
                      <input
                        type="text"
                        required
                        value={developerName}
                        onChange={(e) => setDeveloperName(e.target.value)}
                        placeholder="e.g. Pixel Forge Games"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Developer Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@studio.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Game Engine Core</label>
                      <select
                        value={engineType}
                        onChange={(e) => setEngineType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Game Archive (.zip / .jar / index.html)</label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 rounded-2xl p-6 text-center transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">Drag & drop your game package or click to browse</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports HTML5 zip bundles, J2ME .jar files, and DOSBox packages (Max 50MB)</p>
                    </div>
                  </div>

                  {/* DMCA Safe Compliance Check */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="dmca-agree"
                      checked={licenseAgreed}
                      onChange={(e) => setLicenseAgreed(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="dmca-agree" className="text-xs text-slate-700 cursor-pointer">
                      I declare that this game is 100% original, freeware, open-source, or authorized for distribution. It contains zero copyrighted assets or trademarks from 3rd-party corporations.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!licenseAgreed}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      licenseAgreed
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Strict Zero-Infringement Policy
                </h4>
                <p className="text-amber-900 leading-relaxed">
                  To maintain an ethical, legal, and open-web gaming ecosystem, Arcadex strictly prohibits pirated ROMs, commercial game rips, or unauthorized corporate trademarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-emerald-700 mb-2">✅ Allowed Content</h5>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    <li>100% Original HTML5 / Canvas games</li>
                    <li>Homebrew J2ME and retro mobile games</li>
                    <li>Freeware & Public Domain DOS titles</li>
                    <li>MIT / Apache / BSD Licensed projects</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-rose-700 mb-2">❌ Strictly Forbidden</h5>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    <li>Commercial proprietary ROMs</li>
                    <li>Trademarked brand names & logos</li>
                    <li>Unauthorized commercial rips</li>
                    <li>Malicious, tracking, or mining scripts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Community & Open Web Ecosystem</h4>
                  <p className="text-slate-600 mt-0.5">
                    Arcadex is a 100% free, community-powered gaming hub built to celebrate indie game creators, retro preservation, and open-web standards without paywalls or transaction barriers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>100% Free Hosting</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Zero fees, zero hosting costs, and zero bandwidth caps. Games are permanently hosted on fast client-side CDN edge networks.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Instant Web Publishing</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Support for HTML5, Canvas, WebGL, WebAssembly, and retro emulation engines running at 60 FPS in any modern browser.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Users className="w-4 h-4" />
                    <span>Global Player Reach</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Reach millions of players worldwide with zero login barriers, guest mode, instant click-to-play, and full mobile touch support.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Award className="w-4 h-4" />
                    <span>Developer Profile & Attribution</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Prominent creator credit, social links, portfolio showcases, and direct links to your personal developer website or GitHub.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
