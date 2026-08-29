import {create} from 'zustand';

import {loadMobileState, saveMobileState} from './services/persistence/mobileStateStorage';
import {
    CRYPTO_DEFAULT_CATALOG,
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    FX_CATALOG,
    METAL_CATALOG,
    REFRESH_INTERVAL_SECONDS,
} from './catalogs';
import {EQUITY_ORDER} from './catalogs/equities';
import {fetchCryptoCatalog} from './services/rates/cryptoCatalogService';
import {
    fetchCryptoForMobileService,
    fetchEquityForMobileService,
    fetchFxForMobileService,
    fetchMetalsForMobileService,
} from './services/rates/mobileServiceAdapters';
import {DecimalPlaces, MarketAsset, PersistedSettings, TabCategory, Tenor, ThemePreference} from './models';

export type {DecimalPlaces, MarketAsset, TabCategory, Tenor, ThemePreference};
export {
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    FX_CATALOG,
    METAL_CATALOG,
    CRYPTO_DEFAULT_CATALOG,
    REFRESH_INTERVAL_SECONDS,
};

export const TENOR_OPTIONS: Tenor[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];

type Category = 'fx' | 'equity' | 'crypto' | 'metals';
type Quote = {rate: number; referenceRate: number; changePct: number};
type CategoryState = {
    assets: Record<string, MarketAsset>;
    marketRates: Record<string, Quote>;
    editedSymbol: string | null;
    editedValue: number | null;
};

interface MobileServiceState {
    activeTab: TabCategory;
    tenorFx: Tenor;
    tenorCrypto: Tenor;
    tenorMetals: Tenor;
    decimalPlaces: DecimalPlaces;
    theme: ThemePreference;
    isOnline: boolean;
    isLoading: boolean;
    lastSynced: number;
    countdown: number;
    isEditMode: boolean;
    watchlistFx: string[];
    watchlistEquity: string[];
    watchlistCrypto: string[];
    watchlistMetals: string[];
    editWatchlistFx: string[];
    editWatchlistEquity: string[];
    editWatchlistCrypto: string[];
    editWatchlistMetals: string[];
    assets: Record<string, MarketAsset>;
    editedRates: Record<string, number>;
    marketRates: Record<string, Quote>;
    cryptoCatalog: MarketAsset[];
    setActiveTab: (tab: TabCategory) => void;
    setTenor: (tenor: Tenor) => void;
    setDecimalPlaces: (value: DecimalPlaces) => void;
    setTheme: (value: ThemePreference) => void;
    updateAssetRate: (symbol: string, rate: number) => void;
    clearEditedRate: (symbol: string) => void;
    startEditing: () => void;
    applyEditing: () => Promise<void>;
    cancelEditing: () => void;
    resetMarketDefaults: () => Promise<void>;
    reorderWatchlist: (category: TabCategory, order: string[]) => void;
    addAssetToWatchlist: (category: TabCategory, symbol: string) => void;
    removeAssetFromWatchlist: (category: TabCategory, symbol: string) => void;
    forceRefresh: () => Promise<void>;
    tickCountdown: () => void;
    initialize: () => Promise<void>;
    loadCryptoCatalog: () => Promise<void>;
}

const equityAssets = (): MarketAsset[] => EQUITY_ORDER.map(item => ({
    symbol: item.symbol,
    name: item.name,
    country: item.country,
    rate: 0,
    referenceRate: 0,
    changePct: 0,
    category: 'equity',
}));

const cryptoAssets = (): MarketAsset[] => [
    {symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'crypto'},
    ...CRYPTO_DEFAULT_CATALOG,
];

const metalAssets = (): MarketAsset[] => [
    {symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'metals'},
    ...METAL_CATALOG,
];

function cloneAssets(list: MarketAsset[]): Record<string, MarketAsset> {
    return Object.fromEntries(list.map(asset => [asset.symbol, {...asset}]));
}

function cloneQuotes(list: MarketAsset[]): Record<string, Quote> {
    return Object.fromEntries(list.map(asset => [asset.symbol, {
        rate: asset.rate,
        referenceRate: asset.referenceRate ?? asset.rate,
        changePct: asset.changePct,
    }]));
}

function percentage(rate: number, reference: number): number {
    if (!Number.isFinite(rate) || !Number.isFinite(reference) || reference === 0) return 0;
    return Number((((rate - reference) / reference) * 100).toFixed(2));
}

function categoryForTab(tab: TabCategory): Category | null {
    if (tab === 'fx') return 'fx';
    if (tab === 'equity') return 'equity';
    if (tab === 'crypto') return 'crypto';
    if (tab === 'metals') return 'metals';
    return null;
}

function initialCategoryState(category: Category): CategoryState {
    const list = category === 'fx' ? FX_CATALOG : category === 'equity' ? equityAssets() : category === 'crypto' ? cryptoAssets() : metalAssets();
    return {assets: cloneAssets(list), marketRates: cloneQuotes(list), editedSymbol: null, editedValue: null};
}

let categoryStates: Record<Category, CategoryState> = {
    fx: initialCategoryState('fx'),
    equity: initialCategoryState('equity'),
    crypto: initialCategoryState('crypto'),
    metals: initialCategoryState('metals'),
};

function activeCategoryState(tab: TabCategory): CategoryState | null {
    const category = categoryForTab(tab);
    return category ? categoryStates[category] : null;
}

function allAssets(): Record<string, MarketAsset> {
    const result: Record<string, MarketAsset> = {};
    (Object.keys(categoryStates) as Category[]).forEach(category => {
        Object.assign(result, categoryStates[category].assets);
    });
    return result;
}

function allQuotesForActive(tab: TabCategory): Record<string, Quote> {
    return activeCategoryState(tab)?.marketRates ?? {};
}

function recompute(category: Category, symbol: string, value: number): CategoryState {
    const current = categoryStates[category];
    const anchor = current.marketRates[symbol];
    if (!anchor || !Number.isFinite(value) || value <= 0 || !Number.isFinite(anchor.rate) || anchor.rate <= 0) return current;

    const assets: Record<string, MarketAsset> = {};

    if (category === 'crypto') {
        if (symbol === 'USD') {
            Object.entries(current.marketRates).forEach(([itemSymbol, quote]) => {
                const original = current.assets[itemSymbol];
                if (!original) return;
                if (itemSymbol === 'USD') {
                    assets[itemSymbol] = {...original, rate: value, referenceRate: value, changePct: 0, isCustomEdited: true};
                } else {
                    const rate = quote.rate > 0 ? value / quote.rate : 0;
                    const referenceRate = quote.referenceRate > 0 ? value / quote.referenceRate : 0;
                    assets[itemSymbol] = {...original, rate, referenceRate, changePct: percentage(rate, referenceRate), isCustomEdited: false};
                }
            });
        } else {
            const usdValue = value * anchor.rate;
            const usdReference = value * anchor.referenceRate;
            Object.entries(current.marketRates).forEach(([itemSymbol, quote]) => {
                const original = current.assets[itemSymbol];
                if (!original) return;
                if (itemSymbol === 'USD') {
                    assets[itemSymbol] = {...original, rate: usdValue, referenceRate: usdReference, changePct: percentage(usdValue, usdReference), isCustomEdited: false};
                } else {
                    const rate = quote.rate > 0 ? usdValue / quote.rate : 0;
                    const referenceRate = quote.referenceRate > 0 ? usdReference / quote.referenceRate : 0;
                    assets[itemSymbol] = {...original, rate, referenceRate, changePct: percentage(rate, referenceRate), isCustomEdited: itemSymbol === symbol};
                }
            });
            if (assets[symbol]) {
                const referenceRate = anchor.rate > 0 ? value * (anchor.referenceRate / anchor.rate) : value;
                assets[symbol] = {...assets[symbol], rate: value, referenceRate, changePct: percentage(value, referenceRate), isCustomEdited: true};
            }
        }
    } else {
        const ratio = value / anchor.rate;
        Object.entries(current.marketRates).forEach(([itemSymbol, quote]) => {
            const original = current.assets[itemSymbol];
            if (!original) return;
            const rate = quote.rate * ratio;
            const referenceRate = quote.referenceRate * ratio;
            assets[itemSymbol] = {...original, rate, referenceRate, changePct: percentage(rate, referenceRate), isCustomEdited: itemSymbol === symbol};
        });
        if (assets[symbol]) assets[symbol] = {...assets[symbol], rate: value, isCustomEdited: true};
    }

    return {...current, assets, editedSymbol: symbol, editedValue: value};
}

function materialize(tab: TabCategory): Partial<MobileServiceState> {
    const category = categoryForTab(tab);
    if (!category) return {assets: allAssets(), editedRates: {}, marketRates: {}};
    const current = categoryStates[category];
    return {
        assets: allAssets(),
        editedRates: current.editedSymbol && current.editedValue !== null ? {[current.editedSymbol]: current.editedValue} : {},
        marketRates: current.marketRates,
    };
}

function watchlistFor(state: MobileServiceState, category: TabCategory): string[] {
    if (category === 'fx') return state.watchlistFx;
    if (category === 'equity') return state.watchlistEquity;
    if (category === 'crypto') return state.watchlistCrypto;
    if (category === 'metals') return state.watchlistMetals;
    return [];
}

async function persist(state: MobileServiceState): Promise<void> {
    const settings: PersistedSettings = {
        activeTab: state.activeTab,
        tenorFx: state.tenorFx,
        tenorCrypto: state.tenorCrypto,
        tenorMetals: state.tenorMetals,
        decimalPlaces: state.decimalPlaces,
        theme: state.theme,
        watchlistFx: ['USD', ...state.watchlistFx.filter(symbol => symbol !== 'USD')],
        watchlistEquity: [...state.watchlistEquity],
        watchlistCrypto: ['USD', ...state.watchlistCrypto.filter(symbol => symbol !== 'USD')],
        watchlistMetals: ['USD', ...state.watchlistMetals.filter(symbol => symbol !== 'USD')],
        editedRates: state.editedRates,
        marketState: {
            fx: {symbol: categoryStates.fx.editedSymbol, value: categoryStates.fx.editedValue},
            crypto: {symbol: categoryStates.crypto.editedSymbol, value: categoryStates.crypto.editedValue},
            metals: {symbol: categoryStates.metals.editedSymbol, value: categoryStates.metals.editedValue},
        },
    };
    await saveMobileState(settings);
}

let refreshPromise: Promise<void> | null = null;

export const useMobileStore = create<MobileServiceState>((set, get) => ({
    activeTab: 'fx',
    tenorFx: '1D',
    tenorCrypto: '1W',
    tenorMetals: '1M',
    decimalPlaces: 4,
    theme: 'system',
    isOnline: true,
    isLoading: false,
    lastSynced: 0,
    countdown: REFRESH_INTERVAL_SECONDS,
    isEditMode: false,
    watchlistFx: [...DEFAULT_FX],
    watchlistEquity: ['SENSEX', 'NIFTY50', ...EQUITY_ORDER.map(item => item.symbol).filter(symbol => symbol !== 'SENSEX' && symbol !== 'NIFTY50')],
    watchlistCrypto: ['USD', ...DEFAULT_CRYPTO.filter(symbol => symbol !== 'USD')],
    watchlistMetals: ['USD', ...DEFAULT_METALS.filter(symbol => symbol !== 'USD')],
    editWatchlistFx: [...DEFAULT_FX],
    editWatchlistEquity: ['SENSEX', 'NIFTY50', ...EQUITY_ORDER.map(item => item.symbol).filter(symbol => symbol !== 'SENSEX' && symbol !== 'NIFTY50')],
    editWatchlistCrypto: ['USD', ...DEFAULT_CRYPTO.filter(symbol => symbol !== 'USD')],
    editWatchlistMetals: ['USD', ...DEFAULT_METALS.filter(symbol => symbol !== 'USD')],
    assets: allAssets(),
    editedRates: {},
    marketRates: allQuotesForActive('fx'),
    cryptoCatalog: CRYPTO_DEFAULT_CATALOG,

    setActiveTab: tab => set({activeTab: tab, ...materialize(tab)}),

    setTenor: tenor => {
        const tab = get().activeTab;
        if (tab === 'fx') set({tenorFx: tenor});
        else if (tab === 'crypto') set({tenorCrypto: tenor});
        else if (tab === 'metals') set({tenorMetals: tenor});
        void get().forceRefresh();
    },

    setDecimalPlaces: value => set({decimalPlaces: value}),
    setTheme: value => set({theme: value}),

    updateAssetRate: (symbol, rate) => {
        if (!Number.isFinite(rate) || rate <= 0) return;
        const asset = get().assets[symbol];
        if (!asset) return;
        categoryStates[asset.category] = recompute(asset.category, symbol, rate);
        set(materialize(get().activeTab));
        void persist(get());
    },

    clearEditedRate: symbol => {
        const asset = get().assets[symbol];
        if (!asset) return;
        const current = categoryStates[asset.category];
        categoryStates[asset.category] = {...current, editedSymbol: null, editedValue: null, assets: cloneAssets(Object.entries(current.marketRates).map(([s, q]) => ({...(current.assets[s] ?? {symbol: s, name: s, category: asset.category, changePct: 0}), rate: q.rate, referenceRate: q.referenceRate, changePct: q.changePct} as MarketAsset)))};
        set(materialize(get().activeTab));
    },

    startEditing: () => set(state => ({isEditMode: true, editWatchlistFx: [...state.watchlistFx], editWatchlistEquity: [...state.watchlistEquity], editWatchlistCrypto: [...state.watchlistCrypto], editWatchlistMetals: [...state.watchlistMetals]})),

    applyEditing: async () => {
        const state = get();
        set({watchlistFx: ['USD', ...state.editWatchlistFx.filter(s => s !== 'USD')], watchlistEquity: [...state.editWatchlistEquity], watchlistCrypto: ['USD', ...state.editWatchlistCrypto.filter(s => s !== 'USD')], watchlistMetals: ['USD', ...state.editWatchlistMetals.filter(s => s !== 'USD')], isEditMode: false});
        await persist(get());
        await get().forceRefresh();
    },

    cancelEditing: () => set(state => ({isEditMode: false, editWatchlistFx: [...state.watchlistFx], editWatchlistEquity: [...state.watchlistEquity], editWatchlistCrypto: [...state.watchlistCrypto], editWatchlistMetals: [...state.watchlistMetals]})),

    resetMarketDefaults: async () => {
        categoryStates = {fx: initialCategoryState('fx'), equity: initialCategoryState('equity'), crypto: initialCategoryState('crypto'), metals: initialCategoryState('metals')};
        set({activeTab: 'fx', tenorFx: '1D', tenorCrypto: '1W', tenorMetals: '1M', decimalPlaces: 4, theme: 'system', watchlistFx: [...DEFAULT_FX], watchlistEquity: ['SENSEX', 'NIFTY50', ...EQUITY_ORDER.map(item => item.symbol).filter(s => s !== 'SENSEX' && s !== 'NIFTY50')], watchlistCrypto: ['USD', 'bitcoin'], watchlistMetals: ['USD', ...DEFAULT_METALS.filter(s => s !== 'USD')], isEditMode: false, ...materialize('fx')});
        await persist(get());
        await get().forceRefresh();
    },

    reorderWatchlist: (category, order) => {
        if (category === 'fx') set({editWatchlistFx: ['USD', ...order.filter(s => s !== 'USD')]});
        else if (category === 'equity') set({editWatchlistEquity: [...order]});
        else if (category === 'crypto') set({editWatchlistCrypto: ['USD', ...order.filter(s => s !== 'USD')]});
        else if (category === 'metals') set({editWatchlistMetals: ['USD', ...order.filter(s => s !== 'USD')]});
    },

    addAssetToWatchlist: (category, symbol) => {
        if (category === 'portfolio') return;
        const current = watchlistFor(get(), category);
        if (current.includes(symbol)) return;
        const next = [...current, symbol];
        if (category === 'fx') set({editWatchlistFx: ['USD', ...next.filter(s => s !== 'USD')]});
        else if (category === 'equity') set({editWatchlistEquity: next});
        else if (category === 'crypto') set({editWatchlistCrypto: ['USD', ...next.filter(s => s !== 'USD')]});
        else set({editWatchlistMetals: ['USD', ...next.filter(s => s !== 'USD')]});
    },

    removeAssetFromWatchlist: (category, symbol) => {
        if (category === 'portfolio') return;
        if ((category === 'fx' || category === 'crypto' || category === 'metals') && symbol === 'USD') return;
        const next = watchlistFor(get(), category).filter(s => s !== symbol);
        if (category === 'fx') set({editWatchlistFx: ['USD', ...next.filter(s => s !== 'USD')]});
        else if (category === 'equity') set({editWatchlistEquity: next});
        else if (category === 'crypto') set({editWatchlistCrypto: ['USD', ...next.filter(s => s !== 'USD')]});
        else set({editWatchlistMetals: ['USD', ...next.filter(s => s !== 'USD')]});
    },

    forceRefresh: async () => {
        if (refreshPromise || get().isLoading) return refreshPromise ?? Promise.resolve();
        refreshPromise = (async () => {
            set({isLoading: true});
            try {
                const state = get();
                const [fx, crypto, metals, equity] = await Promise.all([
                    fetchFxForMobileService(state.tenorFx),
                    fetchCryptoForMobileService(state.tenorCrypto, state.watchlistCrypto.filter(s => s !== 'USD')),
                    fetchMetalsForMobileService(state.tenorMetals),
                    fetchEquityForMobileService(),
                ]);

                const apply = (category: Category, data: Record<string, Quote>) => {
                    const current = categoryStates[category];
                    const marketRates = {...current.marketRates};
                    const assets = {...current.assets};
                    Object.entries(data).forEach(([symbol, quote]) => {
                        marketRates[symbol] = quote;
                        const original = assets[symbol];
                        if (!original) return;
                        assets[symbol] = {...original, rate: quote.rate, referenceRate: quote.referenceRate, changePct: quote.changePct, isCustomEdited: false};
                    });
                    categoryStates[category] = {...current, marketRates, assets};
                    if (current.editedSymbol && current.editedValue !== null) categoryStates[category] = recompute(category, current.editedSymbol, current.editedValue);
                };

                apply('fx', fx);
                apply('crypto', crypto);
                apply('metals', metals);
                apply('equity', equity);
                const online = Object.keys(fx).length > 0 || Object.keys(crypto).length > 0 || Object.keys(metals).length > 0 || Object.keys(equity).length > 0;
                set({isLoading: false, isOnline: online, lastSynced: Date.now(), countdown: REFRESH_INTERVAL_SECONDS, ...materialize(get().activeTab)});
            } catch {
                set({isLoading: false, isOnline: false});
            }
        })().finally(() => {refreshPromise = null;});
        return refreshPromise;
    },

    tickCountdown: () => {
        const next = Math.max(0, get().countdown - 1);
        set({countdown: next});
        if (next === 0) void get().forceRefresh();
    },

    initialize: async () => {
        try {
            const saved = await loadMobileState();
            if (saved) {
                const watchlistFx = saved.watchlistFx?.length ? ['USD', ...saved.watchlistFx.filter(s => s !== 'USD')] : [...DEFAULT_FX];
                const watchlistCrypto = saved.watchlistCrypto?.length ? ['USD', ...saved.watchlistCrypto.filter(s => s !== 'USD')] : ['USD', 'bitcoin'];
                const watchlistMetals = saved.watchlistMetals?.length ? ['USD', ...saved.watchlistMetals.filter(s => s !== 'USD')] : ['USD', ...DEFAULT_METALS.filter(s => s !== 'USD')];
                const watchlistEquity = saved.watchlistEquity?.length ? ['SENSEX', 'NIFTY50', ...saved.watchlistEquity.filter(s => s !== 'SENSEX' && s !== 'NIFTY50')] : ['SENSEX', 'NIFTY50', ...EQUITY_ORDER.map(item => item.symbol).filter(s => s !== 'SENSEX' && s !== 'NIFTY50')];
                set({activeTab: saved.activeTab ?? 'fx', tenorFx: saved.tenorFx ?? '1D', tenorCrypto: saved.tenorCrypto ?? '1W', tenorMetals: saved.tenorMetals ?? '1M', decimalPlaces: saved.decimalPlaces ?? 4, theme: saved.theme ?? 'system', watchlistFx, watchlistCrypto, watchlistMetals, watchlistEquity, editWatchlistFx: [...watchlistFx], editWatchlistCrypto: [...watchlistCrypto], editWatchlistMetals: [...watchlistMetals], editWatchlistEquity: [...watchlistEquity], ...materialize(saved.activeTab ?? 'fx')});
                const ms = saved.marketState;
                if (ms) {
                    if (ms.fx?.symbol && ms.fx.value) categoryStates.fx = recompute('fx', ms.fx.symbol, ms.fx.value);
                    if (ms.crypto?.symbol && ms.crypto.value) categoryStates.crypto = recompute('crypto', ms.crypto.symbol, ms.crypto.value);
                    if (ms.metals?.symbol && ms.metals.value) categoryStates.metals = recompute('metals', ms.metals.symbol, ms.metals.value);
                    set(materialize(saved.activeTab ?? 'fx'));
                }
            }
            await get().loadCryptoCatalog();
            await get().forceRefresh();
        } catch {
            set({isOnline: false});
        }
    },

    loadCryptoCatalog: async () => {
        const catalog = await fetchCryptoCatalog();
        if (!catalog.length) return;
        const assets: MarketAsset[] = catalog.map(item => ({symbol: item.id, displaySymbol: item.symbol, name: item.name, id: item.id, rate: 0, referenceRate: 0, changePct: 0, category: 'crypto'}));
        const merged = [...CRYPTO_DEFAULT_CATALOG, ...assets.filter(asset => !CRYPTO_DEFAULT_CATALOG.some(existing => existing.symbol === asset.symbol))];
        set({cryptoCatalog: merged});
    },
}));
