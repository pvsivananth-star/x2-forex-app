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

type State = {
    activeTab: TabCategory;
    assets: Record<string, MarketAsset>;
    baseRates: RateBase;
    editedSymbol: string | null;
    editedValues: Record<string, number>;
    tenorFx: Tenor;
    tenorCrypto: Tenor;
    tenorMetals: Tenor;
    isLoading: boolean;
    isOnline: boolean;
    lastSynced: number;
};

const initialBase: RateBase = normalizeBaseRates(Object.fromEntries(FX_CATALOG.map(asset => [asset.symbol, asset.rate])));

const initialCryptoAssets: MarketAsset[] = [
    {symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'crypto'},
    ...CRYPTO_DEFAULT_CATALOG,
];

const initialMetalAssets: MarketAsset[] = [
    {symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'metals'},
    ...METAL_CATALOG,
];

const initialAssets: Record<string, MarketAsset> = Object.fromEntries([
    ...FX_CATALOG.map(asset => [asset.symbol, {...asset}] as const),
    ...initialCryptoAssets.map(asset => [asset.symbol, {...asset}] as const),
    ...initialMetalAssets.map(asset => [asset.symbol, {...asset}] as const),
    ...EQUITY_ORDER.map(item => [item.symbol, {
        symbol: item.symbol,
        name: item.name,
        rate: 0,
        referenceRate: 0,
        changePct: 0,
        category: 'equity' as const,
        country: item.country,
    }] as const),
]);

let state: State = {
    activeTab: 'fx',
    assets: initialAssets,
    baseRates: initialBase,
    editedSymbol: null,
    editedValues: {},
    tenorFx: '1D',
    tenorCrypto: '1W',
    tenorMetals: '1M',
    isLoading: false,
    isOnline: true,
    lastSynced: 0,
};

const listeners = new Set<() => void>();
let refreshPromise: Promise<void> | null = null;

function emit() { listeners.forEach(listener => listener()); }
function setState(next: Partial<State>) { state = {...state, ...next}; emit(); }

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
            const nextAssets: Record<string, MarketAsset> = {...state.assets};
            const applyResult = (data: MarketAsset[]) => data.forEach(asset => {
                nextAssets[asset.symbol] = {...nextAssets[asset.symbol], ...asset};
            });
            applyResult(fx.data);
            applyResult(crypto.data);
            applyResult(metals.data);
            applyResult(equity.data);
            const nextBaseRates = normalizeBaseRates(Object.fromEntries(fx.data.map(asset => [asset.symbol, asset.rate])));
            setState({
                assets: nextAssets,
                baseRates: nextBaseRates,
                isLoading: false,
                isOnline: !fx.isOffline || !crypto.isOffline || !metals.isOffline || !equity.isOffline,
                lastSynced: Date.now(),
            });
        } catch {
            setState({isLoading: false, isOnline: false});
        }
    })().finally(() => { refreshPromise = null; });
    return refreshPromise;
}

export const marketStore = {
    get: () => state,
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    setActiveTab: (activeTab: TabCategory) => setState({activeTab}),
    setTenors: (tenorFx: Tenor, tenorCrypto: Tenor, tenorMetals: Tenor) => {
        setState({tenorFx, tenorCrypto, tenorMetals});
        void refreshRates();
    },
    refresh: refreshRates,
    setBaseRates: (rates: RateBase) => setState({baseRates: normalizeBaseRates(rates), editedSymbol: null, editedValues: {}}),
    setEditedRate: (symbol: string, value: number) => {
        if (!Number.isFinite(value) || value <= 0) return;
        const calculated = calculateFromAnchor(state.baseRates, symbol, value);
        setState({editedSymbol: symbol, editedValues: Object.fromEntries(calculated.map(x => [x.symbol, x.value]))});
    },
    clearEdit: () => setState({editedSymbol: null, editedValues: {}}),
    visibleRates: (category: 'fx' | 'crypto' | 'metals' | 'equity') => {
        const symbols = category === 'fx'
            ? DEFAULT_FX
            : category === 'crypto'
                ? ['USD', ...DEFAULT_CRYPTO.filter(symbol => symbol !== 'USD')]
                : category === 'metals'
                    ? ['USD', ...DEFAULT_METALS.filter(symbol => symbol !== 'USD')]
                    : EQUITY_ORDER.map(item => item.symbol);
        return symbols.map(symbol => {
            const asset = state.assets[symbol];
            if (!asset) return null;
            const value = state.editedValues[symbol] ?? asset.rate;
            return {...asset, rate: value, value};
        }).filter(Boolean) as MarketAsset[];
    },
};

export function useMobileStore<T>(selector: (s: State & typeof marketStore) => T): T {
    const snapshot = useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get);
    return selector(Object.assign({}, snapshot, marketStore) as State & typeof marketStore);
}

export function useMarketStore<T>(selector: (s: State) => T): T {
    const snapshot = useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get);
    return selector(snapshot);
}

export function useStoreSnapshot(): State {
    return useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get);
}

void refreshRates();
