import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Key
} from 'lucide-react';
import { 
  getPlayerVipState, 
  activatePlayerVip, 
  addTransaction, 
  redeemVoucher, 
  VipTier, 
  PaymentMethod,
  PlayerVipState
} from '../../utils/rechargeStorage';
import { sounds } from '../../utils/soundEngine';

interface OnlineRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnlineRechargeModal: React.FC<OnlineRechargeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'redeem'>('packages');
  const [vipState, setVipState] = useState<PlayerVipState>(getPlayerVipState());
  const [selectedTier, setSelectedTier] = useState<VipTier>('monthly_vip');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  
  // Checkout Form State
  const [senderAccount, setSenderAccount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVipState(getPlayerVipState());
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTierPrice = (tier: VipTier): number => {
    switch (tier) {
      case 'daily_pass': return 20;
      case 'weekly_vip': return 70;
      case 'monthly_vip': return 200;
      case 'lifetime_vip': return 500;
    }
  };

  const getTierLabel = (tier: VipTier): string => {
    switch (tier) {
      case 'daily_pass': return '24-Hour Pass';
      case 'weekly_vip': return 'Weekly VIP';
      case 'monthly_vip': return 'Monthly VIP';
      case 'lifetime_vip': return 'Lifetime Founder';
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderAccount.trim() || !trxId.trim()) {
      setErrorMessage('Please provide your sender account number and Transaction ID (TrxID).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const amount = getTierPrice(selectedTier);
      const days = selectedTier === 'lifetime_vip' ? 3650 : selectedTier === 'monthly_vip' ? 30 : selectedTier === 'weekly_vip' ? 7 : 1;

      // Create transaction record
      addTransaction({
        userPhoneOrAccount: senderAccount.trim(),
        method: selectedMethod,
        trxId: trxId.trim(),
        amountBDT: amount,
        tier: selectedTier,
        tierLabel: getTierLabel(selectedTier),
        status: 'completed',
        note: `Online direct payment via ${selectedMethod.toUpperCase()}`
      });

      // Activate VIP state
      activatePlayerVip(selectedTier, days);
      setVipState(getPlayerVipState());

      sounds.playPowerup();
      setSuccessMessage(`✓ VIP Pass activated! Welcome to ${getTierLabel(selectedTier)}. Thank you for your support!`);
      setIsSubmitting(false);
      setSenderAccount('');
      setTrxId('');
    }, 600);
  };

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      setErrorMessage('Please enter a valid VIP Voucher PIN.');
      return;
    }

    const res = redeemVoucher(voucherCode.trim(), senderAccount || 'Arcadex-User');
    if (res.success) {
      sounds.playPowerup();
      setVipState(getPlayerVipState());
      setSuccessMessage(res.message);
      setErrorMessage('');
      setVoucherCode('');
    } else {
      sounds.playHit();
      setErrorMessage(res.message);
    }
  };

  const copyBkashNumber = () => {
    navigator.clipboard.writeText('01712345678');
    setCopiedNumber(true);
    sounds.playClick();
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">ARCADEX ONLINE RECHARGE</h3>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-mono font-bold">
                  DIRECT VIP PASS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Unlimited Save States, Instant Rewind & Pro Emulators</p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VIP Status Banner if already VIP */}
        {vipState.isActive && (
          <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>ACTIVE VIP: {vipState.tier?.toUpperCase()}</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              {vipState.expiresAt ? `Expires: ${new Date(vipState.expiresAt).toLocaleDateString()}` : 'Lifetime Access'}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-4">
          <button
            onClick={() => { setActiveTab('packages'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'packages'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>MFS Online Recharge</span>
          </button>

          <button
            onClick={() => { setActiveTab('redeem'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'redeem'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Redeem VIP Voucher PIN</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: ONLINE MFS RECHARGE */}
          {activeTab === 'packages' && (
            <div className="space-y-5">
              {/* 1. Choose VIP Package */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                  1. Select VIP Pass Tier (Direct BDT & Online MFS)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { tier: 'daily_pass', label: '24-Hour Pass', price: '৳20', dur: '1 Day' },
                    { tier: 'weekly_vip', label: 'Weekly VIP', price: '৳70', dur: '7 Days' },
                    { tier: 'monthly_vip', label: 'Monthly VIP', price: '৳200', dur: '30 Days', popular: true },
                    { tier: 'lifetime_vip', label: 'Lifetime Founder', price: '৳500', dur: 'Forever' }
                  ].map((pkg) => (
                    <button
                      key={pkg.tier}
                      type="button"
                      onClick={() => { sounds.playClick(); setSelectedTier(pkg.tier as any); }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                        selectedTier === pkg.tier
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded text-[9px] font-black uppercase tracking-wider">
                          HOT
                        </span>
                      )}
                      <div>
                        <div className="text-[11px] font-bold text-slate-300">{pkg.label}</div>
                        <div className="text-base font-black text-white mt-1">{pkg.price}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">{pkg.dur} Access</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Choose Payment Method */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                  2. Choose Payment Gateway
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'bkash', label: 'bKash' },
                    { id: 'nagad', label: 'Nagad' },
                    { id: 'rocket', label: 'Rocket' },
                    { id: 'card', label: 'Cards' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { sounds.playClick(); setSelectedMethod(m.id as any); }}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedMethod === m.id
                          ? 'bg-slate-800 text-white border-cyan-500 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Instructions Box */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-mono text-slate-400 uppercase text-[11px]">Official Merchant/Send Money:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">01712-345678</span>
                    <button
                      type="button"
                      onClick={copyBkashNumber}
                      className="p-1 hover:text-white text-slate-400 cursor-pointer"
                      title="Copy number"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Send <strong className="text-white">৳{getTierPrice(selectedTier)} BDT</strong> to the number above via {selectedMethod.toUpperCase()}, then enter your number and TrxID below to instantly unlock VIP.
                </p>
              </div>

              {/* Recharge Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Your Sender Account / Number
                    </label>
                    <input
                      type="text"
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. BKT9832KA9"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying Online Transaction...' : `Recharge ৳${getTierPrice(selectedTier)} BDT & Activate VIP`}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REDEEM VOUCHER PIN */}
          {activeTab === 'redeem' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Have a VIP Activation PIN Code?</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter the 16-character secret voucher code provided by the Super Admin to instantly activate your VIP Pass without any payment.
                </p>
              </div>

              <form onSubmit={handleRedeemVoucher} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                    Voucher PIN Code
                  </label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="e.g. VIP-MONTH-XXXX-XXXX"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Redeem & Activate VIP Now</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
