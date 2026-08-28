export type AssetCategory = 'fx' | 'crypto' | 'metals' | 'equity';

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

export interface MarketSnapshot {
    rate: number;
    referenceRate: number;
    timestamp: number;
}

export interface MarketState {
    assets: Record<string, MarketAsset>;
    marketRates: Record<string, MarketSnapshot>;
    lastSynced: number;
    isOnline: boolean;
    isLoading: boolean;
}
