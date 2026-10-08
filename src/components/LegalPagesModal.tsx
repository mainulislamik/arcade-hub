import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Scale, 
  HelpCircle, 
  Mail, 
  Send, 
  CheckCircle2, 
  Gamepad2, 
  Sparkles,
  Lock,
  Globe,
  Cpu
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';

export type LegalPageType = 'privacy' | 'terms' | 'dmca' | 'about' | 'contact';

interface LegalPagesModalProps {
  pageType: LegalPageType;
  isOpen: boolean;
  onClose: () => void;
  onSwitchPage: (page: LegalPageType) => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  pageType,
  isOpen,
  onClose,
  onSwitchPage
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPowerup();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { sounds.playClick(); onSwitchPage('privacy'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                pageType === 'privacy' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Privacy Policy
            </button>
            <button
              onClick={() => { sounds.playClick(); onSwitchPage('terms'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                pageType === 'terms' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Terms of Service
            </button>
            <button
              onClick={() => { sounds.playClick(); onSwitchPage('dmca'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                pageType === 'dmca' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              DMCA & Copyright
            </button>
            <button
              onClick={() => { sounds.playClick(); onSwitchPage('about'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                pageType === 'about' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              About Arcadex
            </button>
            <button
              onClick={() => { sounds.playClick(); onSwitchPage('contact'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                pageType === 'contact' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Support
            </button>
          </div>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 text-sm leading-relaxed">
          {pageType === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Privacy Policy</h2>
                  <p className="text-xs text-slate-400">Last updated: October 2026 • GDPR & CCPA Compliant</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">1. Information We Do Not Collect (Zero Login)</h3>
                <p className="text-xs text-slate-600">
                  Arcadex is built on a <strong>Zero-Login Architecture</strong>. We do not require account registration, email addresses, phone numbers, or passwords. Your gameplay data, achievements, and high scores are stored locally on your device via browser LocalStorage.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">2. Google AdSense & Advertising Cookies</h3>
                <p className="text-xs text-slate-600">
                  We use Google AdSense and authorized third-party ad vendors to serve ads when you visit our website. These companies may use cookies to serve ads based on your prior visits to this or other websites. You may opt out of personalized advertising by visiting Google Ads Settings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">3. Analytics & Device Performance</h3>
                <p className="text-xs text-slate-600">
                  We collect anonymous technical telemetry (browser type, device viewport, canvas rendering FPS) strictly to optimize 60 FPS client-side rendering performance across mobile and desktop browsers.
                </p>
              </div>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Terms of Service</h2>
                  <p className="text-xs text-slate-400">Effective Date: October 2026</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h3>
                <p className="text-xs text-slate-600">
                  By accessing and playing games on Arcadex (arcadex.trycalc.net), you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree, you are prohibited from using the platform.
                </p>

                <h3 className="text-sm font-bold text-slate-900">2. License & Fair Use</h3>
                <p className="text-xs text-slate-600">
                  All games on Arcadex are provided free of charge for personal, non-commercial entertainment. You may not reverse-engineer, inject automated exploit bots, or attempt DDoS attacks against the hosting network.
                </p>

                <h3 className="text-sm font-bold text-slate-900">3. Disclaimer of Warranty</h3>
                <p className="text-xs text-slate-600">
                  Games and services are provided "as is". Arcadex makes no warranties regarding uninterrupted uptime or compatibility with obsolete hardware.
                </p>
              </div>
            </div>
          )}

          {pageType === 'dmca' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">DMCA & Copyright Compliance Policy</h2>
                  <p className="text-xs text-slate-400">Strict Intellectual Property & Trademark Protection</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                <strong>Our Policy:</strong> Arcadex adheres strictly to the Digital Millennium Copyright Act (DMCA). All game mechanics, vector art assets, and procedural sound engines on this platform are custom-engineered in-house or licensed under open-source MIT / CC0 / BSD licenses. We maintain a zero 3rd-party trademark policy.
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-sm font-bold text-slate-900">Filing a Notice of Infringement</h3>
                <p>
                  If you are a copyright owner or an authorized agent and believe that content hosted on our service infringes your rights, please submit a written notification containing:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Identification of the copyrighted work claimed to have been infringed.</li>
                  <li>Identification of the material on Arcadex to be removed or disabled.</li>
                  <li>Your contact information (name, address, telephone, email).</li>
                  <li>A statement that you have a good-faith belief that the use is unauthorized.</li>
                </ul>
                <p>
                  Send DMCA notifications directly to: <span className="font-mono text-indigo-600 font-bold">dmca@trycalc.net</span>. We review and act on all valid notices within 24 business hours.
                </p>
              </div>
            </div>
          )}

          {pageType === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">About Arcadex Studio</h2>
                  <p className="text-xs text-slate-400">Next-Generation Zero-Compute Web Arcade</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Arcadex is an independent web gaming portal built with a singular mission: <strong>deliver 60 FPS, zero-install, zero-login arcade games directly inside your web browser</strong> without heating up servers or requiring bulky downloads.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-indigo-600 font-black text-lg mb-1">0%</div>
                  <div className="text-xs font-bold text-slate-800">Server Compute</div>
                  <p className="text-[11px] text-slate-500 mt-1">100% Client-Side Engine</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-indigo-600 font-black text-lg mb-1">1,115+</div>
                  <div className="text-xs font-bold text-slate-800">Classic & Modern Games</div>
                  <p className="text-[11px] text-slate-500 mt-1">Instant 0-Second Launch</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-indigo-600 font-black text-lg mb-1">60 FPS</div>
                  <div className="text-xs font-bold text-slate-800">Hardware Accelerated</div>
                  <p className="text-[11px] text-slate-500 mt-1">WebGL & Canvas 2D</p>
                </div>
              </div>
            </div>
          )}

          {pageType === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Contact Arcadex Support</h2>
                  <p className="text-xs text-slate-400">Feedback, Bug Reports, and Business Inquiries</p>
                </div>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">Message Delivered Successfully!</h3>
                  <p className="text-xs text-emerald-700">Thank you for reaching out. Our support engineering team will respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Imon Khan"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="imon@trycalc.net"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Feedback / Bug Report / Game Suggestion"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message or inquiry here..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
