import React, { useState } from 'react';
import { Download, Film, X, Check, Share2, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { HapticEngine } from '../../utils/hapticEngine';

interface ReplayExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoBlob: Blob | null;
  gameTitle: string;
}

export const ReplayExportModal: React.FC<ReplayExportModalProps> = ({
  isOpen,
  onClose,
  videoBlob,
  gameTitle
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen || !videoBlob) return null;

  const videoUrl = URL.createObjectURL(videoBlob);

  const handleDownload = () => {
    sounds.playPowerup();
    HapticEngine.victoryFanfare();
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `arcadex-replay-${gameTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-[9995] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Instant 30s Replay Clip</h3>
              <p className="text-xs text-slate-400">60 FPS High-Definition Gameplay Highlight</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            loop 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to share on Telegram / Discord</span>
          </div>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Downloaded!' : 'Download Video Clip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
