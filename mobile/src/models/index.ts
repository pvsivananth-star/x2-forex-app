export type TabCategory = 'fx' | 'equity' | 'crypto' | 'metals' | 'portfolio';

export type Tenor = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export type DecimalPlaces = 2 | 3 | 4;

export type ThemePreference = 'system' | 'light' | 'dark';

export type AssetCategory = 'fx' | 'equity' | 'crypto' | 'metals';

export interface MarketAsset {
    symbol: string;
    name: string;
    id?: string;
    displaySymbol?: string;
    rate: number;
    changePct: number;
    referenceRate?: number;
    category: AssetCategory;
    isCustomEdited?: boolean;
    country?: string;
}

export interface MarketRate {
    symbol: string;
    name: string;
    displaySymbol?: string;
    value: number;
    category: AssetCategory;
    changePct: number;
    referenceRate?: number;
}

export interface MarketSnapshot {
    rate: number;
    referenceRate: number;
    timestamp?: number;
}

export interface MarketState {
    assets: Record<string, MarketAsset>;
    marketRates: Record<string, MarketSnapshot>;
    lastSynced: number;
    isOnline: boolean;
    isLoading: boolean;
}

export interface FetchedRate {
    rate: number;
    referenceRate: number;
    changePct: number;
}

export type FetchedMap = Record<string, FetchedRate>;

export interface CryptoCatalogItem {
    id: string;
    symbol: string;
    name: string;
}

export interface PersistedSettings {
    activeTab: TabCategory;
    tenorFx: Tenor;
    tenorCrypto: Tenor;
    tenorMetals: Tenor;
    decimalPlaces: DecimalPlaces;
    theme: ThemePreference;
    watchlistFx: string[];
    watchlistCrypto: string[];
    watchlistEquity: string[];
    watchlistMetals: string[];
    editedRates: Record<string, number>;
}

export interface PersistedMarketState {
    fx: {
        symbol: string | null;
        value: number | null;
    };
    crypto: {
        symbol: string | null;
        value: number | null;
    };
    metals: {
        symbol: string | null;
        value: number | null;
    };
}

export type PersistedApplicationState = PersistedSettings & {
    marketState?: PersistedMarketState;
};

export interface MarketResult {
    data: MarketAsset[];
    isOffline: boolean;
    timestamp: number;
}
