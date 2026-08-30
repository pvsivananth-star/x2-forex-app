import {useSyncExternalStore} from 'react';
import {DEFAULT_FX, FX_CATALOG} from '../catalogs/currencies';
import {CRYPTO_DEFAULT_CATALOG, DEFAULT_CRYPTO} from '../catalogs/crypto';
import {DEFAULT_METALS, METAL_CATALOG} from '../catalogs/metals';
import {EQUITY_ORDER} from '../catalogs/equities';
import {calculateFromAnchor, normalizeBaseRates, RateBase} from '../utils/rateEngine';
import {MarketAsset, TabCategory, Tenor} from '../models';
import {fetchFxRates} from '../services/rates/fxService';
import {fetchCryptoRates} from '../services/rates/cryptoService';
import {fetchMetalsRates} from '../services/rates/metalsService';
import {fetchEquityRates} from '../services/rates/equityService';

type RateCategory = 'fx' | 'crypto' | 'metals';
type AssetKey = `${RateCategory}:${string}` | `equity:${string}`;

type State = {
    activeTab: TabCategory;
    assets: Record<string, MarketAsset>;
    baseRates: RateBase;
    categoryBaseRates: Record<RateCategory, RateBase>;
    editedSymbol: string | null;
    editedCategory: RateCategory | null;
    editedAnchorValue: number | null;
    editedValues: Record<string, number>;
    tenorFx: Tenor;
    tenorCrypto: Tenor;
    tenorMetals: Tenor;
    isLoading: boolean;
    isOnline: boolean;
    lastSynced: number;
};

const key = (category: RateCategory | 'equity', symbol: string): AssetKey => `${category}:${symbol}` as AssetKey;
const initialBase: RateBase = normalizeBaseRates(Object.fromEntries(FX_CATALOG.map(asset => [asset.symbol, asset.rate])));
const initialCryptoAssets: MarketAsset[] = [{symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'crypto'}, ...CRYPTO_DEFAULT_CATALOG];
const initialMetalAssets: MarketAsset[] = [{symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'metals'}, ...METAL_CATALOG];

const initialAssets: Record<string, MarketAsset> = Object.fromEntries([
    ...FX_CATALOG.map(asset => [key('fx', asset.symbol), {...asset}] as const),
    ...initialCryptoAssets.map(asset => [key('crypto', asset.symbol), {...asset}] as const),
    ...initialMetalAssets.map(asset => [key('metals', asset.symbol), {...asset}] as const),
    ...EQUITY_ORDER.map(item => [key('equity', item.symbol), {
        symbol: item.symbol, name: item.name, rate: 0, referenceRate: 0, changePct: 0,
        category: 'equity' as const, country: item.country,
    }] as const),
]);

const initialCryptoBase = normalizeBaseRates(Object.fromEntries([['USD', 1], ...CRYPTO_DEFAULT_CATALOG.filter(a => a.rate > 0).map(a => [a.symbol, a.rate])]));
const initialMetalBase = normalizeBaseRates(Object.fromEntries([['USD', 1], ...METAL_CATALOG.filter(a => a.rate > 0).map(a => [a.symbol, a.rate])]));

let state: State = {
    activeTab: 'fx', assets: initialAssets, baseRates: initialBase,
    categoryBaseRates: {fx: initialBase, crypto: initialCryptoBase, metals: initialMetalBase},
    editedSymbol: null, editedCategory: null, editedAnchorValue: null, editedValues: {},
    tenorFx: '1D', tenorCrypto: '1W', tenorMetals: '1M', isLoading: false, isOnline: true, lastSynced: 0,
};

const listeners = new Set<() => void>();
let refreshPromise: Promise<void> | null = null;
function emit() { listeners.forEach(listener => listener()); }
function setState(next: Partial<State>) { state = {...state, ...next}; emit(); }
function activeRateCategory(): RateCategory | null { return state.activeTab === 'fx' || state.activeTab === 'crypto' || state.activeTab === 'metals' ? state.activeTab : null; }
function resolveEditCategory(symbol: string): RateCategory | null {
    if (symbol === 'USD') return activeRateCategory();
    for (const category of ['fx', 'crypto', 'metals'] as RateCategory[]) if (state.assets[key(category, symbol)]) return category;
    return null;
}
function valuesForEdit(category: RateCategory, symbol: string, value: number) {
    return Object.fromEntries(calculateFromAnchor(state.categoryBaseRates[category], symbol, value).map(item => [item.symbol, item.value]));
}
function recalculateEdit(categoryBaseRates: Record<RateCategory, RateBase>) {
    if (!state.editedCategory || !state.editedSymbol || state.editedAnchorValue === null) return {};
    return Object.fromEntries(calculateFromAnchor(categoryBaseRates[state.editedCategory], state.editedSymbol, state.editedAnchorValue).map(item => [item.symbol, item.value]));
}

async function refreshRates(): Promise<void> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
        setState({isLoading: true});
        try {
            const [fx, crypto, metals, equity] = await Promise.all([
                fetchFxRates(state.tenorFx),
                fetchCryptoRates(state.tenorCrypto, DEFAULT_CRYPTO.filter(symbol => symbol !== 'USD')),
                fetchMetalsRates(state.tenorMetals),
                fetchEquityRates(),
            ]);
            const nextAssets = {...state.assets};
            const apply = (category: RateCategory, data: MarketAsset[]) => data.forEach(asset => {
                nextAssets[key(category, asset.symbol)] = {...nextAssets[key(category, asset.symbol)], ...asset};
            });
            const applyEquity = (data: MarketAsset[]) => data.forEach(asset => {
                nextAssets[key('equity', asset.symbol)] = {...nextAssets[key('equity', asset.symbol)], ...asset};
            });
            apply('fx', fx.data); apply('crypto', crypto.data); apply('metals', metals.data); applyEquity(equity.data);
            const categoryBaseRates = {
                fx: normalizeBaseRates(Object.fromEntries(fx.data.map(a => [a.symbol, a.rate]))),
                crypto: normalizeBaseRates(Object.fromEntries(crypto.data.map(a => [a.symbol, a.rate]))),
                metals: normalizeBaseRates(Object.fromEntries(metals.data.map(a => [a.symbol, a.rate]))),
            };
            setState({assets: nextAssets, baseRates: categoryBaseRates.fx, categoryBaseRates, editedValues: recalculateEdit(categoryBaseRates), isLoading: false,
                isOnline: !fx.isOffline || !crypto.isOffline || !metals.isOffline || !equity.isOffline, lastSynced: Date.now()});
        } catch {
            setState({isLoading: false, isOnline: false});
        }
    })().finally(() => { refreshPromise = null; });
    return refreshPromise;
}

export const marketStore = {
    get: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
    setActiveTab: (activeTab: TabCategory) => setState({activeTab}),
    setTenors: (tenorFx: Tenor, tenorCrypto: Tenor, tenorMetals: Tenor) => { setState({tenorFx, tenorCrypto, tenorMetals}); void refreshRates(); },
    refresh: refreshRates,
    setBaseRates: (rates: RateBase) => {
        const fx = normalizeBaseRates(rates);
        setState({baseRates: fx, categoryBaseRates: {...state.categoryBaseRates, fx}, editedSymbol: null, editedCategory: null, editedAnchorValue: null, editedValues: {}});
    },
    setEditedRate: (symbol: string, value: number) => {
        if (!Number.isFinite(value) || value <= 0) return;
        const category = resolveEditCategory(symbol);
        if (!category || state.categoryBaseRates[category][symbol] === undefined) return;
        setState({editedSymbol: symbol, editedCategory: category, editedAnchorValue: value, editedValues: valuesForEdit(category, symbol, value)});
    },
    clearEdit: () => setState({editedSymbol: null, editedCategory: null, editedAnchorValue: null, editedValues: {}}),
    visibleRates: (category: 'fx' | 'crypto' | 'metals' | 'equity') => {
        const symbols = category === 'fx' ? DEFAULT_FX : category === 'crypto' ? DEFAULT_CRYPTO : category === 'metals' ? ['USD', ...DEFAULT_METALS.filter(s => s !== 'USD')] : EQUITY_ORDER.map(i => i.symbol);
        return symbols.map(symbol => {
            const asset = state.assets[key(category, symbol)];
            if (!asset) return null;
            const value = state.editedCategory === category ? state.editedValues[symbol] ?? asset.rate : asset.rate;
            return {...asset, rate: value, value};
        }).filter(Boolean) as MarketAsset[];
    },
};

export function useMobileStore<T>(selector: (s: State & typeof marketStore) => T): T {
    const snapshot = useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get);
    return selector(Object.assign({}, snapshot, marketStore) as State & typeof marketStore);
}
export function useMarketStore<T>(selector: (s: State) => T): T {
    const snapshot = useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get); return selector(snapshot);
}
export function useStoreSnapshot(): State { return useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get); }
void refreshRates();
