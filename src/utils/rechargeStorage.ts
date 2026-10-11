// Online Recharge & VIP Pass Storage Manager (Direct BDT/MFS & Vouchers - Zero Coin System)

export type VipTier = 'daily_pass' | 'weekly_vip' | 'monthly_vip' | 'lifetime_vip';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'voucher';
export type TransactionStatus = 'completed' | 'pending' | 'rejected';

export interface RechargeTransaction {
  id: string;
  userPhoneOrAccount: string;
  method: PaymentMethod;
  trxId: string;
  amountBDT: number;
  tier: VipTier;
  tierLabel: string;
  status: TransactionStatus;
  timestamp: number;
  note?: string;
}

export interface VipVoucher {
  code: string;
  tier: VipTier;
  durationDays: number;
  isUsed: boolean;
  usedBy?: string;
  createdAt: number;
}

const STORAGE_KEY_TRANSACTIONS = 'arcadex_recharge_transactions';
const STORAGE_KEY_VOUCHERS = 'arcadex_vip_vouchers';
const STORAGE_KEY_VIP_STATE = 'arcadex_player_vip_state';

// Seed Initial Mock Transactions for Realistic Admin Experience
const DEFAULT_TRANSACTIONS: RechargeTransaction[] = [
  {
    id: 'TXN-892101',
    userPhoneOrAccount: '01712984512',
    method: 'bkash',
    trxId: 'BKH98X129Q',
    amountBDT: 200,
    tier: 'monthly_vip',
    tierLabel: 'Monthly VIP Pass (Ad-Free & Unlimited Save Slots)',
    status: 'completed',
    timestamp: Date.now() - 3600000 * 2,
    note: 'Auto-verified via bKash Merchant API'
  },
  {
    id: 'TXN-892102',
    userPhoneOrAccount: '01844912033',
    method: 'nagad',
    trxId: 'NGD55A7881',
    amountBDT: 70,
    tier: 'weekly_vip',
    tierLabel: 'Weekly VIP Pass (7 Days)',
    status: 'completed',
    timestamp: Date.now() - 3600000 * 8,
    note: 'Verified via Nagad Gateway'
  },
  {
    id: 'TXN-892103',
    userPhoneOrAccount: '01611094382',
    method: 'bkash',
    trxId: 'BKH44R9011',
    amountBDT: 500,
    tier: 'lifetime_vip',
    tierLabel: 'Lifetime VIP Founder Pass',
    status: 'completed',
    timestamp: Date.now() - 3600000 * 24,
    note: 'Manual SuperAdmin Approval'
  },
  {
    id: 'TXN-892104',
    userPhoneOrAccount: '01923881029',
    method: 'rocket',
    trxId: 'RCK11M9942',
    amountBDT: 20,
    tier: 'daily_pass',
    tierLabel: '24-Hour Day Pass',
    status: 'pending',
    timestamp: Date.now() - 600000 * 5,
    note: 'Awaiting MFS confirmation'
  }
];

const DEFAULT_VOUCHERS: VipVoucher[] = [
  {
    code: 'VIP-IMON-FOUNDER-2026',
    tier: 'lifetime_vip',
    durationDays: 3650,
    isUsed: false,
    createdAt: Date.now() - 86400000
  },
  {
    code: 'ARCADE-MONTHLY-8831',
    tier: 'monthly_vip',
    durationDays: 30,
    isUsed: false,
    createdAt: Date.now() - 43200000
  },
  {
    code: 'NOKIA-WEEKLY-4491',
    tier: 'weekly_vip',
    durationDays: 7,
    isUsed: false,
    createdAt: Date.now() - 21600000
  }
];

export function getTransactions(): RechargeTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactions(list: RechargeTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
}

export function addTransaction(tx: Omit<RechargeTransaction, 'id' | 'timestamp'>): RechargeTransaction {
  const list = getTransactions();
  const newTx: RechargeTransaction = {
    ...tx,
    id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: Date.now()
  };
  list.unshift(newTx);
  saveTransactions(list);
  return newTx;
}

export function updateTransactionStatus(id: string, status: TransactionStatus): void {
  const list = getTransactions();
  const updated = list.map((item) => item.id === id ? { ...item, status } : item);
  saveTransactions(updated);
}

export function getVouchers(): VipVoucher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOUCHERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(DEFAULT_VOUCHERS));
      return DEFAULT_VOUCHERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_VOUCHERS;
  }
}

export function saveVouchers(list: VipVoucher[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save vouchers', err);
  }
}

export function generateVoucher(tier: VipTier, durationDays: number): VipVoucher {
  const prefix = tier === 'lifetime_vip' ? 'LIFETIME' : tier === 'monthly_vip' ? 'MONTH' : tier === 'weekly_vip' ? 'WEEK' : 'DAY';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `VIP-${prefix}-${rand}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const voucher: VipVoucher = {
    code,
    tier,
    durationDays,
    isUsed: false,
    createdAt: Date.now()
  };

  const list = getVouchers();
  list.unshift(voucher);
  saveVouchers(list);
  return voucher;
}

export function redeemVoucher(code: string, userIdentifier: string): { success: boolean; message: string; tier?: VipTier; days?: number } {
  const cleanCode = code.trim().toUpperCase();
  const list = getVouchers();
  const target = list.find((v) => v.code.toUpperCase() === cleanCode);

  if (!target) {
    return { success: false, message: 'Invalid voucher code.' };
  }

  if (target.isUsed) {
    return { success: false, message: 'This voucher code has already been redeemed.' };
  }

  target.isUsed = true;
  target.usedBy = userIdentifier;
  saveVouchers(list);

  // Activate VIP State for current player
  activatePlayerVip(target.tier, target.durationDays);

  // Record Transaction
  addTransaction({
    userPhoneOrAccount: userIdentifier || 'Redeemed-Voucher',
    method: 'voucher',
    trxId: cleanCode,
    amountBDT: target.tier === 'lifetime_vip' ? 500 : target.tier === 'monthly_vip' ? 200 : target.tier === 'weekly_vip' ? 70 : 20,
    tier: target.tier,
    tierLabel: `Voucher Activation (${target.durationDays} Days)`,
    status: 'completed',
    note: `Redeemed voucher code: ${cleanCode}`
  });

  return { 
    success: true, 
    message: `Voucher successfully redeemed! ${target.durationDays} days of VIP activated.`,
    tier: target.tier,
    days: target.durationDays
  };
}

// Active VIP Player State (Saved locally)
export interface PlayerVipState {
  isActive: boolean;
  tier: VipTier | null;
  expiresAt: number | null;
}

export function getPlayerVipState(): PlayerVipState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIP_STATE);
    if (!raw) return { isActive: false, tier: null, expiresAt: null };
    const parsed: PlayerVipState = JSON.parse(raw);
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      return { isActive: false, tier: null, expiresAt: null };
    }
    return parsed;
  } catch {
    return { isActive: false, tier: null, expiresAt: null };
  }
}

export function activatePlayerVip(tier: VipTier, durationDays: number): void {
  const current = getPlayerVipState();
  let baseTime = Date.now();
  if (current.isActive && current.expiresAt && current.expiresAt > Date.now()) {
    baseTime = current.expiresAt;
  }
  const expiresAt = baseTime + durationDays * 86400000;
  localStorage.setItem(STORAGE_KEY_VIP_STATE, JSON.stringify({
    isActive: true,
    tier,
    expiresAt
  }));
}
