import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  X, 
  QrCode, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Play, 
  ShieldCheck,
  Send,
  Zap,
  Swords
} from 'lucide-react';
import { GameItem } from '../../types/game';
import { WebRTCPeerEngine } from '../../utils/webrtcMultiplayer';
import { sounds } from '../../utils/soundEngine';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  game: GameItem;
  onClose: () => void;
  onGameStart?: (peer: WebRTCPeerEngine, role: 'host' | 'guest') => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  game,
  onClose,
  onGameStart
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [peerEngine, setPeerEngine] = useState<WebRTCPeerEngine | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [offerPayload, setOfferPayload] = useState<string>('');
  const [joinInputPayload, setJoinInputPayload] = useState<string>('');
  const [answerPayload, setAnswerPayload] = useState<string>('');
  const [confirmInputPayload, setConfirmInputPayload] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      peerEngine?.disconnect();
      setPeerEngine(null);
      setConnectionStatus('disconnected');
      return;
    }

    const engine = new WebRTCPeerEngine();
    setPeerEngine(engine);

    engine.onStatus((status) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        sounds.playPowerup();
      }
    });

    engine.onMessage((msg) => {
      if (msg.type === 'chat') {
        setChatMessages((prev) => [...prev, { sender: msg.sender, text: msg.payload }]);
      }
    });

    // Auto-generate offer on create tab
    if (tab === 'create') {
      const code = 'ARC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      setRoomCode(code);
      engine.createRoomOffer().then((offer) => {
        setOfferPayload(offer);
      });
    }

    return () => {
      engine.disconnect();
    };
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/?game=${game.slug}&p2p_offer=${offerPayload}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    sounds.playCoin();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleJoinHost = async () => {
    if (!peerEngine || !joinInputPayload.trim()) return;
    try {
      const ans = await peerEngine.joinRoomWithOffer(joinInputPayload.trim());
      setAnswerPayload(ans);
      sounds.playClick();
    } catch (e) {
      alert('Invalid room invite payload. Please check and try again.');
    }
  };

  const handleHostConfirmAnswer = async () => {
    if (!peerEngine || !confirmInputPayload.trim()) return;
    try {
      await peerEngine.confirmGuestAnswer(confirmInputPayload.trim());
      sounds.playPowerup();
    } catch (e) {
      alert('Failed to connect with guest. Please verify code.');
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !peerEngine) return;
    peerEngine.send({
      type: 'chat',
      sender: tab === 'create' ? 'Host' : 'Guest',
      payload: chatInput.trim(),
      timestamp: Date.now()
    });
    setChatMessages((prev) => [...prev, { sender: 'You', text: chatInput.trim() }]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                2-Player Zero-Server P2P
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  0% Server Lag
                </span>
              </h2>
              <p className="text-xs text-slate-500">Play {game.title} with a friend anywhere</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setTab('create')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'create' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Host a Game (Create Room)
          </button>
          <button
            onClick={() => setTab('join')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'join' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Join a Friend's Room
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-700 text-xs">
          {connectionStatus === 'connected' ? (
            /* Connected State */
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-base font-black text-emerald-900">Connected Directly (WebRTC P2P)!</h3>
              <p className="text-xs text-emerald-700">
                You and your friend are now linked with ultra-low sub-10ms peer latency.
              </p>

              {/* In-Lobby Chat */}
              <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 h-28 overflow-y-auto text-left space-y-1">
                {chatMessages.length === 0 ? (
                  <div className="text-slate-400 italic text-center py-6">Say hi to your opponent!</div>
                ) : (
                  chatMessages.map((m, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-bold text-indigo-600">{m.sender}: </span>
                      <span className="text-slate-800">{m.text}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendChat}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  onGameStart?.(peerEngine!, tab === 'create' ? 'host' : 'guest');
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch 2-Player Match
              </button>
            </div>
          ) : tab === 'create' ? (
            /* Host Flow */
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-indigo-700">Room Code</span>
                  <span className="text-base font-black text-indigo-900 tracking-widest">{roomCode}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Send this 1-click invite link to your opponent. When they open it, their browser directly connects to yours.
                </p>
                <button
                  onClick={handleCopyInvite}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Invite Link Copied!' : 'Copy 1-Click Multiplayer Link'}
                </button>
              </div>

              {/* Manual Answer Step */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800">Step 2: Paste Opponent's Join Token (if connecting manually)</span>
                <textarea
                  rows={2}
                  value={confirmInputPayload}
                  onChange={(e) => setConfirmInputPayload(e.target.value)}
                  placeholder="Paste response token here..."
                  className="w-full p-2 text-[10px] font-mono rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleHostConfirmAnswer}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
                >
                  Confirm & Connect
                </button>
              </div>
            </div>
          ) : (
            /* Guest Join Flow */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800">Step 1: Paste Host Invite Token</span>
                <textarea
                  rows={3}
                  value={joinInputPayload}
                  onChange={(e) => setJoinInputPayload(e.target.value)}
                  placeholder="Paste host token or URL..."
                  className="w-full p-2 text-[10px] font-mono rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleJoinHost}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Generate Answer Token
                </button>
              </div>

              {answerPayload && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <span className="font-bold text-amber-900">Step 2: Send this Answer Token back to Host</span>
                  <div className="p-2 bg-white rounded-lg border border-amber-200 text-[10px] font-mono break-all max-h-20 overflow-y-auto">
                    {answerPayload}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(answerPayload);
                      alert('Answer token copied! Send it back to your host.');
                    }}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    Copy Answer Token
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted WebRTC P2P DataChannels</span>
          </div>
          <span>0% Server Overhead</span>
        </div>
      </div>
    </div>
  );
};
