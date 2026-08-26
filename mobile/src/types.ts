export type TabCategory =
    | 'fx'
    | 'crypto'
    | 'metals'
    | 'portfolio';

export type Tenor =
    | '1D'
    | '1W'
    | '1M'
    | '3M'
    | '6M'
    | '1Y';

export type DecimalPlaces = 2 | 3 | 4;

export type ThemePreference =
    | 'system'
    | 'light'
    | 'dark';

export type AssetCategory =
    | 'fx'
    | 'crypto'
    | 'metals';

export interface MarketAsset {
    symbol: string;
    name: string;

    /*
     * For crypto this is the CoinGecko ID.
     * For FX/metals it is the normal application symbol.
     */
    id?: string;

    displaySymbol?: string;

    rate: number;

    /*
     * Percentage change for the currently selected tenor.
     */
    changePct: number;

    /*
     * Historical/reference price used to calculate
     * the selected tenor's percentage change.
     */
    referenceRate?: number;

    category: AssetCategory;

    /*
     * Once true, API refreshes never overwrite this rate.
     */
    isCustomEdited?: boolean;
}

export interface FetchedRate {
    rate: number;
    referenceRate: number;
    changePct: number;
}

export type FetchedMap =
    Record<string, FetchedRate>;

export interface CryptoCatalogItem {
    id: string;
    symbol: string;
    name: string;
}

export interface PersistedSettings {
    activeTab: TabCategory;
    tenor: Tenor;
    decimalPlaces: DecimalPlaces;
    theme: ThemePreference;

    watchlistFx: string[];
    watchlistCrypto: string[];
    watchlistMetals: string[];

    editedRates: Record<string, number>;
}