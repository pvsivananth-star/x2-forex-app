import AsyncStorage from '@react-native-async-storage/async-storage';
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
export type ThemePreference = 'system' | 'light' | 'dark';

export const REFRESH_INTERVAL_SECONDS = 180;

export const G10_CODES = [
  'USD', 'EUR', 'JPY', 'GBP', 'CAD',
  'AUD', 'CHF', 'CNY', 'SEK', 'NOK',
];

export const FX_CATALOG: MarketAsset[] = [
  { symbol: 'USD', name: 'US Dollar', rate: 1, changePct: 0, category: 'fx' },
  { symbol: 'EUR', name: 'Euro', rate: 1.085, changePct: 0, category: 'fx' },
  { symbol: 'JPY', name: 'Japanese Yen', rate: 155.2, changePct: 0, category: 'fx' },
  { symbol: 'GBP', name: 'British Pound', rate: 1.265, changePct: 0, category: 'fx' },
  { symbol: 'CAD', name: 'Canadian Dollar', rate: 1.365, changePct: 0, category: 'fx' },
  { symbol: 'AUD', name: 'Australian Dollar', rate: 0.655, changePct: 0, category: 'fx' },
  { symbol: 'CHF', name: 'Swiss Franc', rate: 0.88, changePct: 0, category: 'fx' },
  { symbol: 'CNY', name: 'Chinese Yuan', rate: 7.18, changePct: 0, category: 'fx' },
  { symbol: 'SEK', name: 'Swedish Krona', rate: 10.1, changePct: 0, category: 'fx' },
  { symbol: 'NOK', name: 'Norwegian Krone', rate: 10.4, changePct: 0, category: 'fx' },
  { symbol: 'NZD', name: 'New Zealand Dollar', rate: 0.61, changePct: 0, category: 'fx' },
  { symbol: 'SGD', name: 'Singapore Dollar', rate: 1.28, changePct: 0, category: 'fx' },
  { symbol: 'HKD', name: 'Hong Kong Dollar', rate: 7.8, changePct: 0, category: 'fx' },
  { symbol: 'INR', name: 'Indian Rupee', rate: 87.1, changePct: 0, category: 'fx' },
  { symbol: 'ZAR', name: 'South African Rand', rate: 18.2, changePct: 0, category: 'fx' },
  { symbol: 'BRL', name: 'Brazilian Real', rate: 5.5, changePct: 0, category: 'fx' },
  { symbol: 'MXN', name: 'Mexican Peso', rate: 19.1, changePct: 0, category: 'fx' },
  { symbol: 'PLN', name: 'Polish Zloty', rate: 3.9, changePct: 0, category: 'fx' },
  { symbol: 'DKK', name: 'Danish Krone', rate: 6.6, changePct: 0, category: 'fx' },
  { symbol: 'THB', name: 'Thai Baht', rate: 32.5, changePct: 0, category: 'fx' },
];

export const CRYPTO_CATALOG: MarketAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', rate: 65000, changePct: 0, category: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', rate: 3500, changePct: 0, category: 'crypto' },
  { symbol: 'USDT', name: 'Tether', rate: 1, changePct: 0, category: 'crypto' },
  { symbol: 'SOL', name: 'Solana', rate: 145.5, changePct: 0, category: 'crypto' },
  { symbol: 'BNB', name: 'Binance Coin', rate: 580, changePct: 0, category: 'crypto' },
  { symbol: 'XRP', name: 'XRP', rate: 0.52, changePct: 0, category: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', rate: 0.4, changePct: 0, category: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', rate: 0.12, changePct: 0, category: 'crypto' },
  { symbol: 'AVAX', name: 'Avalanche', rate: 28, changePct: 0, category: 'crypto' },
  { symbol: 'USDC', name: 'USD Coin', rate: 1, changePct: 0, category: 'crypto' },
];

export const METAL_CATALOG: MarketAsset[] = [
  { symbol: 'XAU_1OZ', name: 'Gold Spot (1oz)', rate: 2350.5, changePct: 0, category: 'metals' },
  { symbol: 'XAG_1OZ', name: 'Silver Spot (1oz)', rate: 28.25, changePct: 0, category: 'metals' },
  { symbol: 'XAU_100G', name: 'Gold Bar (100g)', rate: 7557, changePct: 0, category: 'metals' },
  { symbol: 'XAG_1KG', name: 'Silver Bar (1kg)', rate: 908.4, changePct: 0, category: 'metals' },
  { symbol: 'XPT_1OZ', name: 'Platinum (1oz)', rate: 985, changePct: 0, category: 'metals' },
  { symbol: 'XPD_1OZ', name: 'Palladium (1oz)', rate: 1020, changePct: 0, category: 'metals' },
  { symbol: 'XAU_1KG', name: 'Gold Kilobar (1kg)', rate: 75570, changePct: 0, category: 'metals' },
  { symbol: 'XRH_1OZ', name: 'Rhodium (1oz)', rate: 4500, changePct: 0, category: 'metals' },
  { symbol: 'XAG_100OZ', name: 'Silver Bar (100oz)', rate: 2825, changePct: 0, category: 'metals' },
  { symbol: 'XCU_1LB', name: 'Copper Futures (1lb)', rate: 4.35, changePct: 0, category: 'metals' },
];

const ALL_CATALOG = [...FX_CATALOG, ...CRYPTO_CATALOG, ...METAL_CATALOG];

const DEFAULT_FX = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD', 'CHF', 'INR'];
const DEFAULT_CRYPTO = ['BTC', 'ETH', 'USDT', 'SOL', 'BNB'];
const DEFAULT_METALS = ['XAU_1OZ', 'XAG_1OZ', 'XAU_100G'];

interface PersistedSettings {
  activeTab: TabCategory;
  tenor: Tenor;
  decimalPlaces: DecimalPlaces;
  theme: ThemePreference;
  watchlistFx: string[];
  watchlistCrypto: string[];
  watchlistMetals: string[];
}

export interface MobileServiceState {
  activeTab: TabCategory;
  tenor: Tenor;
  decimalPlaces: DecimalPlaces;
  theme: ThemePreference;

  isOnline: boolean;
  isLoading: boolean;
  lastSynced: number;
  countdown: number;

  editingSymbol: string | null;
  isEditMode: boolean;

  watchlistFx: string[];
  watchlistCrypto: string[];
  watchlistMetals: string[];

  editWatchlistFx: string[];
  editWatchlistCrypto: string[];
  editWatchlistMetals: string[];

  assets: Record<string, MarketAsset>;

  setActiveTab: (tab: TabCategory) => void;
  setTenor: (tenor: Tenor) => void;
  setDecimalPlaces: (dp: DecimalPlaces) => void;
  setTheme: (theme: ThemePreference) => void;

  setEditingSymbol: (symbol: string | null) => void;
  updateAssetRate: (symbol: string, newRate: number) => void;

  startEditing: () => void;
  applyEditing: () => Promise<void>;
  cancelEditing: () => void;

  reorderWatchlist: (category: TabCategory, newOrder: string[]) => void;
  addAssetToWatchlist: (category: TabCategory, symbol: string) => void;
  removeAssetFromWatchlist: (category: TabCategory, symbol: string) => void;

  forceRefresh: () => Promise<void>;
  tickCountdown: () => void;
  initialize: () => Promise<void>;
}

function catalogMap(): Record<string, MarketAsset> {
  return ALL_CATALOG.reduce((acc, asset) => {
    acc[asset.symbol] = { ...asset };
    return acc;
  }, {} as Record<string, MarketAsset>);
}

function getList(state: MobileServiceState, category: TabCategory): string[] {
  if (category === 'fx') return state.isEditMode ? state.editWatchlistFx : state.watchlistFx;
  if (category === 'crypto') return state.isEditMode ? state.editWatchlistCrypto : state.watchlistCrypto;
  if (category === 'metals') return state.isEditMode ? state.editWatchlistMetals : state.watchlistMetals;
  return [];
}

async function persist(state: MobileServiceState) {
  const data: PersistedSettings = {
    activeTab: state.activeTab,
    tenor: state.tenor,
    decimalPlaces: state.decimalPlaces,
    theme: state.theme,
    watchlistFx: state.watchlistFx,
    watchlistCrypto: state.watchlistCrypto,
    watchlistMetals: state.watchlistMetals,
  };

  await AsyncStorage.setItem('@x2_mobile_settings', JSON.stringify(data));
}

async function fetchAllCategories(tenor: Tenor) {
  const [fx, crypto, metals] = await Promise.all([
    fetchFxData(tenor),
    fetchCryptoData(tenor),
    fetchMetalsData(tenor),
  ]);

  return { fx, crypto, metals };
}

export const useMobileStore = create<MobileServiceState>((set, get) => ({
  activeTab: 'fx',
  tenor: '1D',
  decimalPlaces: 4,
  theme: 'system',

  isOnline: true,
  isLoading: false,
  lastSynced: 0,
  countdown: REFRESH_INTERVAL_SECONDS,

  editingSymbol: null,
  isEditMode: false,

  watchlistFx: DEFAULT_FX,
  watchlistCrypto: DEFAULT_CRYPTO,
  watchlistMetals: DEFAULT_METALS,

  editWatchlistFx: DEFAULT_FX,
  editWatchlistCrypto: DEFAULT_CRYPTO,
  editWatchlistMetals: DEFAULT_METALS,

  assets: catalogMap(),

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    persist(get()).catch(() => undefined);
  },

  setTenor: (tenor) => {
    set({ tenor });
    persist(get()).catch(() => undefined);
    get().forceRefresh();
  },

  setDecimalPlaces: (dp) => {
    set({ decimalPlaces: dp });
    persist(get()).catch(() => undefined);
  },

  setTheme: (theme) => {
    set({ theme });
    persist(get()).catch(() => undefined);
  },

  setEditingSymbol: (symbol) => set({ editingSymbol: symbol }),

  updateAssetRate: (symbol, newRate) => {
    if (!Number.isFinite(newRate) || newRate <= 0) return;

    const state = get();
    const target = state.assets[symbol];
    if (!target) return;

    const assets = {
      ...state.assets,
      [symbol]: {
        ...target,
        rate: newRate,
        isCustomEdited: true,
      },
    };

    set({ assets });
  },

  startEditing: () => {
    const state = get();

    set({
      isEditMode: true,
      editingSymbol: null,
      editWatchlistFx: [...state.watchlistFx],
      editWatchlistCrypto: [...state.watchlistCrypto],
      editWatchlistMetals: [...state.watchlistMetals],
    });
  },

  applyEditing: async () => {
    const state = get();

    let fx = [...state.editWatchlistFx];

    // USD must always remain first.
    fx = ['USD', ...fx.filter((s) => s !== 'USD')];

    const next = {
      watchlistFx: fx,
      watchlistCrypto: [...state.editWatchlistCrypto],
      watchlistMetals: [...state.editWatchlistMetals],
      isEditMode: false,
      editingSymbol: null,
    };

    set(next);
    await persist({ ...get(), ...next });
  },

  cancelEditing: () => {
    set({
      isEditMode: false,
      editingSymbol: null,
      editWatchlistFx: [...get().watchlistFx],
      editWatchlistCrypto: [...get().watchlistCrypto],
      editWatchlistMetals: [...get().watchlistMetals],
    });
  },

  reorderWatchlist: (category, newOrder) => {
    if (category === 'fx') {
      const order = ['USD', ...newOrder.filter((s) => s !== 'USD')];
      set({ editWatchlistFx: order });
    } else if (category === 'crypto') {
      set({ editWatchlistCrypto: newOrder });
    } else if (category === 'metals') {
      set({ editWatchlistMetals: newOrder });
    }
  },

  addAssetToWatchlist: (category, symbol) => {
    const state = get();
    const list = getList(state, category);

    if (list.includes(symbol)) return;

    const next = [...list, symbol];

    if (category === 'fx') set({ editWatchlistFx: next });
    else if (category === 'crypto') set({ editWatchlistCrypto: next });
    else if (category === 'metals') set({ editWatchlistMetals: next });
  },

  removeAssetFromWatchlist: (category, symbol) => {
    if (category === 'fx' && symbol === 'USD') return;

    const state = get();
    const list = getList(state, category);
    const next = list.filter((s) => s !== symbol);

    if (category === 'fx') set({ editWatchlistFx: next });
    else if (category === 'crypto') set({ editWatchlistCrypto: next });
    else if (category === 'metals') set({ editWatchlistMetals: next });
  },

  forceRefresh: async () => {
    if (get().isLoading) return;

    const { tenor } = get();
    set({ isLoading: true });

    try {
      const result = await fetchAllCategories(tenor);
      const state = get();
      const assets = { ...state.assets };

      let gotAny = false;

      const merge = (data: Record<string, { rate: number; changePct: number }>) => {
        Object.entries(data).forEach(([symbol, value]) => {
          const existing = assets[symbol];

          if (!existing) return;

          // Background API updates must never overwrite a value
          // that the user has explicitly edited.
          if (existing.isCustomEdited) return;

          assets[symbol] = {
            ...existing,
            rate: value.rate,
            changePct: value.changePct,
          };

          gotAny = true;
        });
      };

      merge(result.fx);
      merge(result.crypto);
      merge(result.metals);

      set({
        assets,
        lastSynced: Date.now(),
        countdown: REFRESH_INTERVAL_SECONDS,
        isOnline: gotAny,
        isLoading: false,
      });
    } catch {
      set({
        isOnline: false,
        isLoading: false,
        countdown: REFRESH_INTERVAL_SECONDS,
      });
    }
  },

  tickCountdown: () => {
    const state = get();

    if (state.countdown <= 1) {
      set({ countdown: REFRESH_INTERVAL_SECONDS });
      get().forceRefresh();
      return;
    }

    set({ countdown: state.countdown - 1 });
  },

  initialize: async () => {
    try {
      const raw = await AsyncStorage.getItem('@x2_mobile_settings');

      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedSettings>;

        const fx = saved.watchlistFx?.length ? saved.watchlistFx : DEFAULT_FX;
        const crypto = saved.watchlistCrypto?.length ? saved.watchlistCrypto : DEFAULT_CRYPTO;
        const metals = saved.watchlistMetals?.length ? saved.watchlistMetals : DEFAULT_METALS;

        set({
          activeTab: saved.activeTab || 'fx',
          tenor: saved.tenor || '1D',
          decimalPlaces: saved.decimalPlaces || 4,
          theme: saved.theme || 'system',
          watchlistFx: ['USD', ...fx.filter((s) => s !== 'USD')],
          watchlistCrypto: crypto,
          watchlistMetals: metals,
          editWatchlistFx: ['USD', ...fx.filter((s) => s !== 'USD')],
          editWatchlistCrypto: crypto,
          editWatchlistMetals: metals,
        });
      }
    } catch {
      // Defaults remain active.
    }

    set({
      isOnline: true,
      lastSynced: Date.now(),
      countdown: REFRESH_INTERVAL_SECONDS,
    });

    await get().forceRefresh();
  },
}));

export class MobileService {
  private static instance: MobileService;

  public static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }

    return MobileService.instance;
  }

  public getStore() {
    return useMobileStore;
  }

  public async fetchMarketData(): Promise<void> {
    await useMobileStore.getState().forceRefresh();
  }
}

export function getCatalog(category: TabCategory): MarketAsset[] {
  if (category === 'fx') return FX_CATALOG;
  if (category === 'crypto') return CRYPTO_CATALOG;
  if (category === 'metals') return METAL_CATALOG;
  return [];
}