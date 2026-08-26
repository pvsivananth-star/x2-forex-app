import { create } from 'zustand';
import { fetchFxData, fetchCryptoData, fetchMetalsData } from './ratesApi';

export interface MarketAsset {
  symbol: string;
  name: string;
  rate: number;
  changePct: number;
  category: 'fx' | 'crypto' | 'metals';
  isCustomEdited?: boolean;
}

export type TabCategory = 'fx' | 'crypto' | 'metals' | 'portfolio';
export type Tenor = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
export const TENOR_OPTIONS: Tenor[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];
export type DecimalPlaces = 2 | 3 | 4;

export interface MobileServiceState {
  activeTab: TabCategory;
  tenor: Tenor;
  decimalPlaces: DecimalPlaces;
  isOnline: boolean;
  isLoading: boolean;
  lastSynced: number;
  countdown: number;
  editingSymbol: string | null;
  watchlistFx: string[];
  watchlistCrypto: string[];
  watchlistMetals: string[];
  assets: Record<string, MarketAsset>;

  // Actions
  setActiveTab: (tab: TabCategory) => void;
  setTenor: (tenor: Tenor) => void;
  setDecimalPlaces: (dp: DecimalPlaces) => void;
  setEditingSymbol: (symbol: string | null) => void;
  updateAssetRate: (symbol: string, newRate: number) => void;
  reorderWatchlist: (category: TabCategory, newOrder: string[]) => void;
  addAssetToWatchlist: (category: TabCategory, symbol: string) => void;
  removeAssetFromWatchlist: (category: TabCategory, symbol: string) => void;
  forceRefresh: () => Promise<void>;
  tickCountdown: () => void;
  initialize: () => Promise<void>;
}

const DEFAULT_FX: MarketAsset[] = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', rate: 1.0850, changePct: 0.12, category: 'fx' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', rate: 1.2650, changePct: -0.05, category: 'fx' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', rate: 155.20, changePct: 0.34, category: 'fx' },
  { symbol: 'USDINR', name: 'US Dollar / Indian Rupee', rate: 87.10, changePct: 0.10, category: 'fx' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', rate: 0.6550, changePct: -0.15, category: 'fx' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', rate: 1.3650, changePct: 0.08, category: 'fx' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', rate: 0.8800, changePct: 0.20, category: 'fx' },
];

const DEFAULT_CRYPTO: MarketAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', rate: 65000.00, changePct: 2.45, category: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', rate: 3500.00, changePct: 1.80, category: 'crypto' },
  { symbol: 'USDT', name: 'Tether', rate: 1.00, changePct: 0.01, category: 'crypto' },
  { symbol: 'SOL', name: 'Solana', rate: 145.50, changePct: -1.20, category: 'crypto' },
  { symbol: 'BNB', name: 'Binance Coin', rate: 580.00, changePct: 0.45, category: 'crypto' },
  { symbol: 'XRP', name: 'Ripple', rate: 0.52, changePct: -0.30, category: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', rate: 0.40, changePct: 0.60, category: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', rate: 0.12, changePct: -0.80, category: 'crypto' },
  { symbol: 'AVAX', name: 'Avalanche', rate: 28.00, changePct: 1.10, category: 'crypto' },
  { symbol: 'USDC', name: 'USD Coin', rate: 1.00, changePct: 0.00, category: 'crypto' },
];

const DEFAULT_METALS: MarketAsset[] = [
  { symbol: 'XAU_1OZ', name: 'Gold Spot (1oz)', rate: 2350.50, changePct: 0.65, category: 'metals' },
  { symbol: 'XAG_1OZ', name: 'Silver Spot (1oz)', rate: 28.25, changePct: 1.10, category: 'metals' },
  { symbol: 'XAU_100G', name: 'Gold Bar (100g)', rate: 7557.00, changePct: 0.65, category: 'metals' },
  { symbol: 'XAG_1KG', name: 'Silver Bar (1kg)', rate: 908.40, changePct: 1.10, category: 'metals' },
  { symbol: 'XPT_1OZ', name: 'Platinum (1oz)', rate: 985.00, changePct: -0.40, category: 'metals' },
  { symbol: 'XPD_1OZ', name: 'Palladium (1oz)', rate: 1020.00, changePct: 0.20, category: 'metals' },
  { symbol: 'XAU_1KG', name: 'Gold Kilobar (1kg)', rate: 75570.00, changePct: 0.65, category: 'metals' },
  { symbol: 'XRH_1OZ', name: 'Rhodium (1oz)', rate: 4500.00, changePct: 0.00, category: 'metals' },
  { symbol: 'XAG_100OZ', name: 'Silver Bar (100oz)', rate: 2825.00, changePct: 1.10, category: 'metals' },
  { symbol: 'XCU_1LB', name: 'Copper Futures (1lb)', rate: 4.35, changePct: -0.25, category: 'metals' },
];

const ALL_DEFAULTS = [...DEFAULT_FX, ...DEFAULT_CRYPTO, ...DEFAULT_METALS];

async function fetchForCategory(category: TabCategory, tenor: Tenor) {
  if (category === 'fx') return fetchFxData(tenor);
  if (category === 'crypto') return fetchCryptoData(tenor);
  if (category === 'metals') return fetchMetalsData(tenor);
  return {};
}

export const useMobileStore = create<MobileServiceState>((set, get) => ({
  activeTab: 'fx',
  tenor: '1D',
  decimalPlaces: 4,
  isOnline: true,
  isLoading: false,
  lastSynced: Date.now(),
  countdown: 3600,
  editingSymbol: null,
  watchlistFx: DEFAULT_FX.map(a => a.symbol),
  watchlistCrypto: DEFAULT_CRYPTO.map(a => a.symbol),
  watchlistMetals: DEFAULT_METALS.map(a => a.symbol),
  assets: ALL_DEFAULTS.reduce((acc, asset) => {
    acc[asset.symbol] = asset;
    return acc;
  }, {} as Record<string, MarketAsset>),

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    if (tab !== 'portfolio') get().forceRefresh();
  },

  setTenor: (tenor) => {
    set({ tenor });
    get().forceRefresh();
  },

  setDecimalPlaces: (dp) => set({ decimalPlaces: dp }),

  setEditingSymbol: (symbol) => set({ editingSymbol: symbol }),

  updateAssetRate: (symbol, newRate) => {
    const state = get();
    const target = state.assets[symbol];
    if (!target || newRate <= 0) return;

    const ratio = newRate / target.rate;
    const assets = { ...state.assets };
    assets[symbol] = { ...target, rate: newRate, isCustomEdited: true };

    Object.keys(assets).forEach((key) => {
      const asset = assets[key];
      if (asset.category === target.category && key !== symbol && !asset.isCustomEdited) {
        assets[key] = { ...asset, rate: Number((asset.rate * ratio).toFixed(4)) };
      }
    });

    set({ assets });
  },

  reorderWatchlist: (category, newOrder) => {
    if (category === 'fx') set({ watchlistFx: newOrder });
    else if (category === 'crypto') set({ watchlistCrypto: newOrder });
    else if (category === 'metals') set({ watchlistMetals: newOrder });
  },

  addAssetToWatchlist: (category, symbol) => {
    if (category === 'fx' && !get().watchlistFx.includes(symbol)) {
      set({ watchlistFx: [...get().watchlistFx, symbol] });
    } else if (category === 'crypto' && !get().watchlistCrypto.includes(symbol)) {
      set({ watchlistCrypto: [...get().watchlistCrypto, symbol] });
    } else if (category === 'metals' && !get().watchlistMetals.includes(symbol)) {
      set({ watchlistMetals: [...get().watchlistMetals, symbol] });
    }
  },

  removeAssetFromWatchlist: (category, symbol) => {
    if (category === 'fx') {
      set({ watchlistFx: get().watchlistFx.filter(s => s !== symbol) });
    } else if (category === 'crypto') {
      set({ watchlistCrypto: get().watchlistCrypto.filter(s => s !== symbol) });
    } else if (category === 'metals') {
      set({ watchlistMetals: get().watchlistMetals.filter(s => s !== symbol) });
    }
  },

  forceRefresh: async () => {
    const { activeTab, tenor, assets } = get();
    if (activeTab === 'portfolio') {
      set({ lastSynced: Date.now(), countdown: 3600 });
      return;
    }
    set({ isLoading: true });
    try {
      const fetched = await fetchForCategory(activeTab, tenor);
      const updated = { ...assets };
      let gotAny = false;
      Object.entries(fetched).forEach(([symbol, data]) => {
        if (!updated[symbol]) return;
        gotAny = true;
        updated[symbol] = { ...updated[symbol], rate: data.rate, changePct: data.changePct, isCustomEdited: false };
      });
      // clear manual overrides in this tab even if fetch failed, per spec (resync clears overrides)
      Object.keys(updated).forEach((key) => {
        if (updated[key].category === activeTab) updated[key] = { ...updated[key], isCustomEdited: false };
      });
      set({
        assets: updated,
        lastSynced: Date.now(),
        countdown: 3600,
        isOnline: gotAny,
        isLoading: false,
        editingSymbol: null,
      });
    } catch (e) {
      set({ isOnline: false, isLoading: false });
    }
  },

  tickCountdown: () => {
    const c = get().countdown;
    if (c <= 1) {
      get().forceRefresh();
    } else {
      set({ countdown: c - 1 });
    }
  },

  initialize: async () => {
    set({ isOnline: true, lastSynced: Date.now() });
    await get().forceRefresh();
  },
}));

export class MobileService {
  public static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  private static instance: MobileService;

  public getStore() {
    return useMobileStore;
  }

  public async fetchMarketData(): Promise<void> {
    useMobileStore.getState().forceRefresh();
  }
}
